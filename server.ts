import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  function extractJSON(text: string) {
    try {
      return JSON.parse(text);
    } catch (e) {
      const startObj = text.indexOf('{');
      const startArr = text.indexOf('[');
      let startIdx = -1;
      let endChar = '';

      if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
        startIdx = startObj;
        endChar = '}';
      } else if (startArr !== -1) {
        startIdx = startArr;
        endChar = ']';
      }

      if (startIdx !== -1) {
        let searchIdx = text.lastIndexOf(endChar);
        while (searchIdx > startIdx) {
          const candidate = text.substring(startIdx, searchIdx + 1);
          try {
            return JSON.parse(candidate);
          } catch (innerError) {
            searchIdx = text.lastIndexOf(endChar, searchIdx - 1);
          }
        }
      }
      throw new Error("Could not find or parse valid JSON in model response");
    }
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/simulate", async (req, res) => {
    try {
      const { prompt, context, systemInstruction, model: requestedModel } = req.body;
      const modelToUse = requestedModel || "gemini-2.0-flash";
      const userKey = req.headers['x-gemini-key'] as string;
      
      let apiKey = userKey?.trim();
      if (!apiKey || apiKey === "null" || apiKey === "undefined") {
        apiKey = process.env.GEMINI_API_KEY?.trim();
      }

      if (!apiKey) {
        return res.status(401).json({ 
          error: "INVALID_API_KEY",
          message: "Gemini API key is not provided or configured." 
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const result = await ai.models.generateContent({
        model: modelToUse,
        contents: `Digital Twin Context: ${JSON.stringify(context)}\n\nAction/Trigger: ${prompt}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      const text = result.text;
      
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      res.json(extractJSON(text));
    } catch (error: any) {
      console.error("[Server Error]", error);
      const isApiKeyError = error.message?.includes('API key not valid') || error.status === 403;
      res.status(isApiKeyError ? 401 : 500).json({ 
        error: isApiKeyError ? "INVALID_API_KEY" : "SERVER_ERROR",
        message: error.message || "Internal Server Error"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
