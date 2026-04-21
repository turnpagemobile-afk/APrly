import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// A simple store for the voice assistant to communicate with the calculator
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

export function VoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
          console.log("Heard:", transcript);

          // Very simple parsing for demo
          const numbers = transcript.match(/\d+(\.\d+)?/g);
          if (numbers && numbers.length > 0) {
            const val1 = parseFloat(numbers[0]);
            const val2 = numbers[1] ? parseFloat(numbers[1]) : undefined;
            
            // Heuristic: if value > 100, probably debt, else rate
            let totalDebt, interestRate;
            if (val1 > 100) {
              totalDebt = val1;
              interestRate = val2;
            } else {
              interestRate = val1;
              totalDebt = val2;
            }
            VoiceStore.emit({ totalDebt, interestRate });
          }
        };
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoice = () => {
    if (isActive) {
      setIsActive(false);
      setIsListening(false);
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setIsActive(true);
      const msg = new SpeechSynthesisUtterance(
        "Welcome to APRly. Tell me your total debt, then your interest rate."
      );
      msg.onend = () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error(e);
          }
        }
      };
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative ${isActive ? "text-primary" : "text-muted-foreground"}`}
      onClick={toggleVoice}
    >
      {isActive ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
      Voice Assistant
      {isListening && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
      )}
    </Button>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">APRly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Optimizer
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/dashboard" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/paywall"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/paywall" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Plan
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <VoiceAssistant />
            </div>
            <Link href="/paywall">
              <Button size="sm" className="font-semibold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-card py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
            <div>&copy; {new Date().getFullYear()} APRly. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
