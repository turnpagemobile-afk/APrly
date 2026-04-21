import { Router, type IRouter, type Request, type Response } from "express";
import { Buffer } from "node:buffer";
import {
  ensureCompatibleFormat,
  speechToText,
  voiceChatStream,
} from "@workspace/integrations-openai-ai-server/audio";
import { logger } from "../lib/logger";

const router: IRouter = Router();

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

    logger.info(
      {
        ms: Date.now() - t0,
        priorMessages: priorMessages.length,
        wavBytes: compatibleBuffer.length,
      },
      "voice: calling gpt-audio (helper)",
    );

    const stream = await voiceChatStream(compatibleBuffer, "alloy", format);

    let firstChunkLogged = false;
    let audioChunks = 0;
    let textChunks = 0;
    for await (const evt of stream) {
      if (aborted) break;
      if (!firstChunkLogged) {
        firstChunkLogged = true;
        logger.info(
          { ms: Date.now() - t0, type: evt.type, sample: evt.data.slice(0, 80) },
          "voice: first chunk",
        );
      }
      if (evt.type === "transcript") {
        textChunks += 1;
        send({ type: "transcript", data: evt.data });
      } else if (evt.type === "audio") {
        audioChunks += 1;
        send({ type: "audio", data: evt.data });
      }
    }

    logger.info(
      { ms: Date.now() - t0, audioChunks, textChunks, aborted },
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
