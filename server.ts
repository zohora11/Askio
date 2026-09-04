import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global CORS and Header configuration to ensure smooth mobile and proxy communication
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Lazy initialize GoogleGenAI client
  function getAiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // --- API ROUTES FIRST ---
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      model: "gemini-3.8-flash",
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

      // Fluent, appropriate, concise, and natural answer directives
      let systemInstruction = `You are Askio AI, the universal search engine, discovery platform, and knowledge assistant. Askio empowers users to search for ANYTHING — Books, PDFs, Video Tutorials, Articles, Research Papers, Web Links, Code, and Tools — and ask AI for instant answers, summaries, learning roadmaps, analysis, and problem solving.

CRITICAL INSTRUCTIONS FOR FLUENT AND CONCISE RESPONSES:
1. Natural & Fluent Tone (সাবলীল ও প্রাসঙ্গিক ভাষা):
   - Always respond in the exact language the user uses. If the user writes in Bengali (বাংলা), answer in clean, natural, modern Bengali. If the user writes in English, reply in natural, fluent English.
2. Appropriate & Concise Length (উপযুক্ত ও সংক্ষিপ্ত উত্তর - খুব বড় নয়):
   - Never output unnecessary walls of text, multi-page essays, or unsolicited long lists.
   - Tailor the depth strictly to the question asked:
     * Simple question or greeting: Respond in 1 to 3 clear, warm, and natural sentences.
     * Specific search or inquiry: Provide direct answers, recommendations, book/PDF/video links or summaries in 2 to 4 sentences or a compact list.
     * Complex or how-to query: Provide structured, concise steps without repetitive fluff or filler.
3. Universal Search & Assistance:
   - Help users find books, PDFs, videos, links, articles, learning resources, and solve problems on any topic (technology, science, education, business, literature, history, math, etc.).`;

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

      // Prioritize modern, valid Gemini models as per @google/genai SDK guidelines
      const candidateModels = [
        "gemini-3.6-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
        "gemini-flash-latest",
      ];
      let replyText = "";
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          const generatePromise = ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 20000)
          );

          const response = await Promise.race([generatePromise, timeoutPromise]);

          if (response && response.text) {
            replyText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.error(`Gemini API error on model ${model}:`, err?.message || err);
          // Fallback to next model in candidateModels
        }
      }

      if (!replyText) {
        console.error("All Gemini API models failed. Last error details:", lastError?.message || lastError);
        let errorMsg = lastError?.message || "All Gemini API models failed to generate a response.";
        if (typeof errorMsg === "string" && (errorMsg.includes("429") || errorMsg.includes("Quota exceeded") || errorMsg.includes("RESOURCE_EXHAUSTED"))) {
          errorMsg = "এআই রেট লিমিট পৌঁছানো হয়েছে (Quota Exceeded)। অনুগ্রহ করে ৩০ সেকেন্ড পর আবার চেষ্টা করুন। / Rate limit reached, please retry in 30 seconds.";
        }
        return res.status(502).json({
          error: errorMsg
        });
      }

      return res.json({ reply: replyText });
    } catch (err: any) {
      console.error("AI chat handler error:", err);
      return res.status(500).json({
        error: err?.message || "Unable to connect to the AI engine. Please check your server setup."
      });
    }
  };

  // Support both /api/chat and /api/ai/chat endpoints
  app.post("/api/chat", handleChat);
  app.post("/api/ai/chat", handleChat);

  // Ensure any unmatched /api route returns JSON, never the HTML SPA fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found` });
  });

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
