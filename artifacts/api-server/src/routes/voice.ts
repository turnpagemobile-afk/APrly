import { Router, type IRouter, type Request, type Response } from "express";
import { Buffer } from "node:buffer";
import {
  openai,
  ensureCompatibleFormat,
  speechToText,
} from "@workspace/integrations-openai-ai-server/audio";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are APRly's voice assistant — a calm, friendly money coach helping users lower the interest they pay on credit cards and loans.

About APRly:
- APRly analyzes credit card and loan balances and shows the daily interest "waste" being paid.
- The Debt Interest Optimizer takes balance, APR, and minimum payment, then returns a payoff plan, total interest saved, and rate-reduction recommendations.
- The Bank Handshake hardship portal contacts lenders to negotiate lower APRs based on hardship eligibility.
- Plaid Link lets users securely connect their bank in sandbox mode.
- APRly Pro is $39/month and unlocks unlimited rate negotiation, automated handshake submissions, and the credit score gauge.
- The dashboard shows credit score, monthly waste, and recommended rate reductions.

Voice rules:
- Keep replies short (1-3 sentences). This is a phone-call vibe.
- If the user gives numbers (balance, APR, minimum payment), confirm them clearly and tell them you've put them into the calculator.
- Never invent fees, guarantees, or specific lender names. If unsure, say so.
- Never mention you are an AI model or refer to OpenAI. You are "APRly".
- No emojis, no markdown, just spoken English.`;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

router.post("/voice/chat", async (req: Request, res: Response) => {
  const { audio, history } = req.body as {
    audio?: string;
    history?: IncomingMessage[];
  };

  if (!audio || typeof audio !== "string") {
    res.status(400).json({ error: "audio (base64) is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (payload: unknown) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // SSE comment line keeps proxies (and the browser EventSource layer) from
  // closing the connection while we wait for the first model chunk.
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping ${Date.now()}\n\n`);
    } catch {
      // socket already closed
    }
  }, 1000);

  let aborted = false;
  req.on("close", () => {
    aborted = true;
    clearInterval(heartbeat);
  });

  const t0 = Date.now();
  try {
    const inputBuffer = Buffer.from(audio, "base64");
    logger.info({ bytes: inputBuffer.length }, "voice: received audio");

    const { buffer: compatibleBuffer, format } =
      await ensureCompatibleFormat(inputBuffer);
    logger.info(
      { ms: Date.now() - t0, format, bytes: compatibleBuffer.length },
      "voice: converted",
    );

    const userTranscript = await speechToText(compatibleBuffer, format).catch(
      (e: unknown) => {
        logger.error(
          { err: e instanceof Error ? e.message : String(e) },
          "voice: stt failed",
        );
        return "";
      },
    );
    logger.info(
      { ms: Date.now() - t0, transcript: userTranscript },
      "voice: transcribed",
    );
    if (userTranscript) {
      send({ type: "user_transcript", data: userTranscript });
    }

    const priorMessages = (Array.isArray(history) ? history : [])
      .filter(
        (m): m is IncomingMessage =>
          !!m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0,
      )
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

    const audioBase64 = compatibleBuffer.toString("base64");

    logger.info({ ms: Date.now() - t0 }, "voice: calling gpt-audio");
    const stream = await openai.chat.completions.create({
      model: "gpt-audio",
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "pcm16" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...priorMessages,
        {
          role: "user",
          content: [
            {
              type: "input_audio",
              input_audio: { data: audioBase64, format },
            },
          ],
        } as never,
      ],
      stream: true,
    });

    let firstChunkLogged = false;
    let audioChunks = 0;
    let textChunks = 0;
    let lastFinish: string | null = null;
    let firstChunkSample: unknown = null;
    for await (const chunk of stream) {
      if (aborted) break;
      if (!firstChunkLogged) {
        firstChunkLogged = true;
        firstChunkSample = chunk;
        logger.info(
          { ms: Date.now() - t0, sample: JSON.stringify(chunk).slice(0, 800) },
          "voice: first chunk",
        );
      }
      const choice = chunk.choices?.[0] as
        | { delta?: { audio?: { transcript?: string; data?: string }; content?: string }; finish_reason?: string }
        | undefined;
      if (choice?.finish_reason) lastFinish = choice.finish_reason;
      const delta = choice?.delta;
      if (!delta) continue;
      if (delta.audio?.transcript) {
        textChunks += 1;
        send({ type: "transcript", data: delta.audio.transcript });
      }
      if (delta.audio?.data) {
        audioChunks += 1;
        send({ type: "audio", data: delta.audio.data });
      }
    }
    void firstChunkSample;

    logger.info(
      { ms: Date.now() - t0, audioChunks, textChunks, lastFinish, aborted },
      "voice: stream done",
    );

    clearInterval(heartbeat);
    if (!aborted) {
      send({ done: true });
    }
  } catch (err) {
    clearInterval(heartbeat);
    const message = err instanceof Error ? err.message : "Voice request failed";
    logger.error({ err: message, ms: Date.now() - t0 }, "voice: failed");
    try {
      send({ type: "error", error: message });
    } catch {
      // already closed
    }
  } finally {
    res.end();
  }
});

export default router;
