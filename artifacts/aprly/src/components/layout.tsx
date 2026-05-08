import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { Mic, Loader2, Square } from "lucide-react";
import {
  useAudioPlayback,
  useVoiceRecorder,
} from "@workspace/integrations-openai-ai-react/audio";
import { Button } from "@/components/ui/button";
import { brandContent, footerContent, navContent } from "@/content/landing";

export const VoiceStore = {
  listeners: new Set<(data: { totalDebt?: number; interestRate?: number }) => void>(),
  subscribe(listener: (data: { totalDebt?: number; interestRate?: number }) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  emit(data: { totalDebt?: number; interestRate?: number }) {
    this.listeners.forEach((l) => l(data));
  },
};

type ChatTurn = { role: "user" | "assistant"; content: string };

const WORKLET_PATH = `${import.meta.env.BASE_URL}audio-playback-worklet.js`;
const VOICE_ENDPOINT = "/api/voice/chat";
const SSE_DELIMITER = /\r\n\r\n|\n\n|\r\r/g;

function tryPrefillCalculator(text: string) {
  const numbers = text.match(/\d+(?:\.\d+)?/g);
  if (!numbers?.length) return;
  const nums = numbers.map((n) => parseFloat(n));
  let totalDebt: number | undefined;
  let interestRate: number | undefined;
  for (const n of nums) {
    if (n > 100 && totalDebt === undefined) totalDebt = n;
    else if (n <= 100 && interestRate === undefined) interestRate = n;
  }
  if (totalDebt !== undefined || interestRate !== undefined) {
    VoiceStore.emit({ totalDebt, interestRate });
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      if (comma === -1) reject(new Error("Bad data URL"));
      else resolve(result.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

export function VoiceAssistant() {
  const recorder = useVoiceRecorder();
  const playback = useAudioPlayback(WORKLET_PATH);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const turnsRef = useRef<ChatTurn[]>([]);
  turnsRef.current = turns;
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const sendAudio = useCallback(
    async (blob: Blob) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setPending(true);
      try {
        await playback.init();
        playback.clear();
        const base64 = await blobToBase64(blob);
        const res = await fetch(VOICE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ audio: base64, history: turnsRef.current }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          throw new Error(`Voice request failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";
        let assistantStarted = false;

        const handleEvent = (raw: string) => {
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            return;
          }
          const ev = parsed as Record<string, unknown>;
          if (ev.done === true) {
            playback.signalComplete();
            return;
          }
          if (ev.type === "user_transcript" && typeof ev.data === "string") {
            const text = ev.data;
            setTurns((prev) => [...prev, { role: "user", content: text }]);
            tryPrefillCalculator(text);
            return;
          }
          if (ev.type === "transcript" && typeof ev.data === "string") {
            assistantText += ev.data;
            if (!assistantStarted) {
              assistantStarted = true;
              setTurns((prev) => [...prev, { role: "assistant", content: assistantText }]);
            } else {
              setTurns((prev) => {
                const next = prev.slice(0, -1);
                next.push({ role: "assistant", content: assistantText });
                return next;
              });
            }
            return;
          }
          if (ev.type === "audio" && typeof ev.data === "string") {
            playback.pushAudio(ev.data);
            return;
          }
          if (ev.type === "error" && typeof ev.error === "string") {
            throw new Error(ev.error);
          }
        };

        const drain = () => {
          SSE_DELIMITER.lastIndex = 0;
          let last = 0;
          let m: RegExpExecArray | null;
          const events: string[] = [];
          while ((m = SSE_DELIMITER.exec(buffer)) !== null) {
            events.push(buffer.slice(last, m.index));
            last = m.index + m[0].length;
          }
          buffer = buffer.slice(last);
          for (const block of events) {
            const dataLines = block
              .replace(/\r\n/g, "\n")
              .split("\n")
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).replace(/^ /, ""));
            if (dataLines.length) handleEvent(dataLines.join("\n"));
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          drain();
        }
        buffer += decoder.decode();
        drain();
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Voice failed");
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setPending(false);
      }
    },
    [playback],
  );

  const handleClick = useCallback(async () => {
    setError(null);
    if (recorder.state === "recording") {
      try {
        const blob = await recorder.stopRecording();
        if (!blob.size) return;
        await sendAudio(blob);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Voice failed");
      }
      return;
    }
    try {
      await recorder.startRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone unavailable");
    }
  }, [recorder, sendAudio]);

  const isRecording = recorder.state === "recording";
  const lastAssistant = [...turns].reverse().find((t) => t.role === "assistant");

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={pending && !isRecording}
        className={`relative font-medium ${
          isRecording
            ? "text-rose-300"
            : pending
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
        }`}
        aria-pressed={isRecording}
        aria-label={isRecording ? "Stop recording" : "Talk to APRly"}
      >
        {isRecording ? (
          <Square className="h-4 w-4 mr-2 fill-current" />
        ) : pending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Mic className="h-4 w-4 mr-2" />
        )}
        {isRecording ? "Stop" : pending ? "Thinking" : "Talk to APRly"}
        {isRecording && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-400 animate-ping" />
        )}
      </Button>
      {error ? (
        <span className="hidden lg:inline text-xs text-rose-300/80 max-w-[16rem] truncate">
          {error}
        </span>
      ) : lastAssistant && !isRecording ? (
        <span className="hidden lg:inline text-xs text-muted-foreground/80 max-w-[20rem] truncate">
          {lastAssistant.content}
        </span>
      ) : null}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const goToAnchor = (href: string) => {
    if (!href.startsWith("#")) {
      setLocation(href);
      return;
    }
    const id = href.slice(1);
    if (location !== "/") {
      setLocation(`/${href}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyright = footerContent.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={brandContent.name}
          >
            <span className="text-2xl font-black tracking-tight text-foreground">
              {brandContent.name}
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-7 text-sm font-semibold text-primary"
            aria-label="Primary"
          >
            {navContent.links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => goToAnchor(link.href)}
                className="hover:opacity-80 transition-opacity"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden" aria-hidden="true">
              <VoiceAssistant />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled
              aria-disabled="true"
              title={navContent.logIn.note}
              className="hidden sm:inline-flex font-semibold"
            >
              {navContent.logIn.label}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => goToAnchor(navContent.getStarted.target)}
              className="font-semibold"
            >
              {navContent.getStarted.label}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-card text-card-foreground py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
            <nav
              className="flex items-center gap-6 text-primary font-semibold"
              aria-label="Footer"
            >
              {footerContent.links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="hover:opacity-80 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="text-center md:text-right">{copyright}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
