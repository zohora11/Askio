import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize GoogleGenAI client
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      aiClient = new GoogleGenAI({
        apiKey: apiKey || "",
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // --- API ROUTES FIRST ---
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      model: "gemini-3.1-flash-lite",
      apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // BDApps API Proxy to bypass any browser CORS or networking issues
  app.post("/api/bdapps/proxy", async (req, res) => {
    try {
      const { action, payload } = req.body;
      const validActions = ["check_subscription", "send_otp", "verify_otp", "unsubscribe"];
      if (!action || !validActions.includes(action)) {
        return res.status(400).json({ error: "Invalid action specified." });
      }

      const targetUrl = `https://bdappsdigitalapps.com/NADB26131_FinalProject/${action}.php`;
      const formParams = new URLSearchParams();

      if (payload && typeof payload === "object") {
        for (const [key, value] of Object.entries(payload)) {
          if (value !== undefined && value !== null) {
            formParams.append(key, String(value));
          }
        }
      }

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Askio-Health-Frontend/1.0",
        },
        body: formParams.toString(),
      });

      const rawText = await response.text();
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        parsedJson = { raw: rawText };
      }

      return res.status(response.status).json(parsedJson);
    } catch (err: any) {
      console.error("BDApps proxy error:", err?.message || err);
      return res.status(502).json({
        error: "Failed to connect to BDApps gateway. Please check your connection and retry.",
      });
    }
  });

  // AI Assistant Chat Handler
  const handleChat = async (req: express.Request, res: express.Response) => {
    try {
      const { message, history, contextResource } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please ensure the API key is set in Settings > Secrets.",
        });
      }

      const ai = getAiClient();

      // High-efficiency, optimized system instruction to ensure direct answers without filler
      let systemInstruction = `You are Askio AI, the high-efficiency, expert guidance engine for the Askio platform.
Your goal is to provide concise, direct, and optimized answers to whatever question the user asks.

CRITICAL INSTRUCTIONS FOR OPTIMIZED RESPONSES:
1. Direct Answer First: Immediately answer the specific question asked in the very first sentence. Never use introductory filler, greetings, pleasantries, or preamble (do NOT say "Hello! I am Askio AI", "Certainly!", "Great question", or "Sure, here is...").
2. Optimized & High Signal:
   - Deliver clear, high-density explanations directly targeting the user's question.
   - Format with clean, scannable Markdown: bold lead-in keywords, bullet points, and numbered steps.
   - For factual or technical questions, provide the exact answer or solution first, followed by practical steps or code examples.
   - For vision wellness or eye care questions (e.g., 20-20-20 rule, screen fatigue, eye exercises, dry eyes, lighting), give the exact ergonomic protocol, duration, and actionable remedy immediately.
   - For study, productivity, or career inquiries, provide structured, step-by-step methodologies.
3. Eliminate Fluff: Do not append unsolicited meta-commentary, repeated summaries, or generic sign-offs. Focus 100% on answering the user's specific inquiry thoroughly and efficiently.`;

      if (contextResource && typeof contextResource === "object") {
        systemInstruction += `\n\nContext Resource Inquiry:
- Title: ${contextResource.title || "N/A"}
- Category: ${contextResource.category || "N/A"}
- Format: ${contextResource.format || "Resource"}
- Author: ${contextResource.author?.name || "Expert"} (${contextResource.author?.role || ""})
- Overview: ${contextResource.description || "N/A"}
Directly integrate relevant insights from this resource to answer the user's inquiry.`;
      }

      // Build conversation contents with alternating role guarantees
      const rawTurns: Array<{ role: "user" | "model"; text: string }> = [];

      if (Array.isArray(history)) {
        for (const msg of history.slice(-8)) {
          const msgText = typeof msg?.text === "string" 
            ? msg.text 
            : (msg?.parts?.[0]?.text || msg?.content || "");
          if (msgText && typeof msgText === "string" && msgText.trim()) {
            const role = (msg.role === "user" || msg.sender === "user") ? "user" : "model";
            rawTurns.push({ role, text: msgText.trim() });
          }
        }
      }

      // Append current user message
      rawTurns.push({
        role: "user",
        text: message.trim(),
      });

      // Normalize into valid alternating Gemini contents starting with 'user'
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
      for (const turn of rawTurns) {
        if (contents.length === 0) {
          if (turn.role === "user") {
            contents.push({ role: "user", parts: [{ text: turn.text }] });
          }
        } else {
          const lastTurn = contents[contents.length - 1];
          if (lastTurn.role === turn.role) {
            lastTurn.parts[0].text += `\n\n${turn.text}`;
          } else {
            contents.push({ role: turn.role, parts: [{ text: turn.text }] });
          }
        }
      }

      if (contents.length === 0) {
        contents.push({ role: "user", parts: [{ text: message.trim() }] });
      }

      // Use gemini-3.1-flash-lite as primary for rapid, reliable responses without 503 high-demand spikes
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
      let replyText = "";
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          const generatePromise = ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.4,
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 10000)
          );

          const response = await Promise.race([generatePromise, timeoutPromise]);

          if (response && response.text) {
            replyText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Silently fail over to the next candidate model
        }
      }

      if (!replyText) {
        if (lastError) {
          console.warn("AI generation fallback triggered:", lastError?.message || "Service unavailable");
        }
        replyText = "I apologize, but the AI guidance engine is currently experiencing unusually high demand. Please try sending your question again in a few moments.";
      }

      return res.json({ reply: replyText });
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to generate AI response";
      return res.status(200).json({
        reply: "I am having difficulty connecting right now. Please check your network and try again."
      });
    }
  };

  // Support both /api/chat and /api/ai/chat endpoints
  app.post("/api/chat", handleChat);
  app.post("/api/ai/chat", handleChat);

  // --- VITE MIDDLEWARE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Askio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
