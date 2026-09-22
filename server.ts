import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Multi-turn Gemini Chat with specific roles and model tiers
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, role = "study_mentor", speedMode = "general" } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Please provide messages array." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured in Settings > Secrets.",
      });
    }

    // Role system instructions
    const roleInstructions: Record<string, string> = {
      study_mentor: "You are a warm, articulate, and patient personal study mentor for Sayani. Break down complex topics simply, suggest memory retention techniques, provide encouraging feedback, and help organize her study goals. Keep explanations clear, gentle, and structured.",
      wellness_companion: "You are a supportive, calm, and soothing personal companion for Sayani. Offer gentle validation, mindful breathing reminders, positive daily affirmations, and peaceful reflections. Never provide medical or clinical advice.",
      writing_coach: "You are a thoughtful writing and essay coach for Sayani. Help with thesis outlines, phrasing improvements, tone polish, and clarity checks, preserving her personal voice.",
      exam_prep: "You are an active-recall study coach for Sayani. Systematically test her knowledge, provide quick concept flash-questions, pinpoint weak spots gently, and celebrate her progress.",
    };

    const systemInstruction = roleInstructions[role] || roleInstructions.study_mentor;

    // Model selection based on speed and complexity requirements
    let modelName = "gemini-3.5-flash"; // General default
    if (speedMode === "fast") {
      modelName = "gemini-3.1-flash-lite"; // Fast tasks
    } else if (speedMode === "complex") {
      modelName = "gemini-3.1-pro-preview"; // Deep complex reasoning
    }

    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });
    } catch (modelErr: any) {
      // If gemini-3.1-pro-preview encounters key/quota restrictions, fallback gracefully to gemini-3.5-flash
      if (modelName === "gemini-3.1-pro-preview") {
        console.warn("Pro model fallback to gemini-3.5-flash:", modelErr?.message);
        modelName = "gemini-3.5-flash";
        response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });
      } else {
        throw modelErr;
      }
    }

    res.json({
      text: response.text || "",
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error?.message || "Failed to generate chat response." });
  }
});

// Google Search Grounding with gemini-3.5-flash
app.post("/api/search-grounding", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Please provide a search query." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a real-time research assistant for Sayani. Use Google Search to fetch accurate, up-to-date academic resources, news, exam syllabus information, or latest references. Format your answer with clean headers and bullet points.",
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Array<{ title: string; url: string }> = [];
    for (const chunk of chunks) {
      if ((chunk as any).web?.uri) {
        sources.push({
          title: (chunk as any).web.title || (chunk as any).web.uri,
          url: (chunk as any).web.uri,
        });
      }
    }

    res.json({
      text: response.text || "",
      sources,
    });
  } catch (error: any) {
    console.error("Error in /api/search-grounding:", error);
    res.status(500).json({ error: error?.message || "Search grounding failed." });
  }
});

// Google Maps Grounding with gemini-3.5-flash
app.post("/api/maps-grounding", async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Please provide a query for maps." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }

    const config: any = {
      tools: [{ googleMaps: {} }],
      systemInstruction: "You are HerSpace's location guide for Sayani. Find peaceful study spots, cozy quiet cafes with Wi-Fi, public libraries, tranquil parks, or safe nearby places based on her query. Provide concise highlights and peaceful vibes.",
    };

    if (
      latitude !== undefined &&
      longitude !== undefined &&
      !isNaN(Number(latitude)) &&
      !isNaN(Number(longitude))
    ) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(latitude),
            longitude: Number(longitude),
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config,
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places: Array<{ title: string; uri: string; snippet?: string }> = [];

    for (const chunk of chunks) {
      const mapItem = (chunk as any).maps;
      if (mapItem) {
        const title = mapItem.title || "Location";
        const uri = mapItem.uri || "";
        const snippet = mapItem.placeAnswerSources?.reviewSnippets?.[0] || "";
        if (uri || title) {
          places.push({ title, uri, snippet });
        }
      }
    }

    res.json({
      text: response.text || "",
      places,
    });
  } catch (error: any) {
    console.error("Error in /api/maps-grounding:", error);
    res.status(500).json({ error: error?.message || "Maps grounding failed." });
  }
});

// AI Study Assistant: Explain concept
app.post("/api/study-assistant/explain", async (req, res) => {
  try {
    const { concept, context, level = "simple" } = req.body;
    if (!concept || typeof concept !== "string") {
      return res.status(400).json({ error: "Please provide a concept to explain." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please ensure GEMINI_API_KEY is set in Settings > Secrets.",
      });
    }

    const prompt = `You are a warm, supportive, and clear private study tutor for a university/college student.
Explain the following concept in ${level === "simple" ? "crystal-clear, friendly, simple terms with a vivid real-life analogy" : "detailed, clear academic terms"}.

Concept: "${concept.trim()}"
${context ? `Additional Context/Subject: "${context.trim()}"` : ""}

Guidelines:
- Keep the tone encouraging, calm, and approachable.
- Start with a 1-2 sentence intuitive summary ("In simple words...").
- Give a relatable, memorable analogy.
- Break down key points into 3-4 bullet points.
- Include a quick "Why it matters" or "Memory hook".
- Highlight that this is an AI-generated learning aid to support their own notes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Error in /api/study-assistant/explain:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate explanation. Please try again.",
    });
  }
});

// AI Study Assistant: Practice Questions & MCQs
app.post("/api/study-assistant/practice-questions", async (req, res) => {
  try {
    const { subject, topic, type = "mcq", count = 3 } = req.body;
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ error: "Please provide a topic." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
      });
    }

    const prompt = `Generate ${count} high-quality ${type === "mcq" ? "Multiple Choice Questions (MCQs)" : "Open-ended Practice Questions"} for the topic: "${topic.trim()}" (Subject: "${subject || "General"}").

Return STRICTLY valid JSON with no markdown backticks, conforming to:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A) ...",
      "explanation": "Friendly explanation of why this answer is correct."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch {
      res.json({ raw: response.text });
    }
  } catch (error: any) {
    console.error("Error in /api/study-assistant/practice-questions:", error);
    res.status(500).json({ error: error?.message || "Failed to generate questions." });
  }
});

// AI Study Assistant: Summarize Notes
app.post("/api/study-assistant/summarize", async (req, res) => {
  try {
    const { notes, focus } = req.body;
    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return res.status(400).json({ error: "Please provide notes to summarize." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
      });
    }

    const prompt = `Summarize the following student notes cleanly and systematically.
${focus ? `Special Focus: "${focus}"` : ""}

Notes to summarize:
"""
${notes.slice(0, 10000)}
"""

Please provide:
1. Quick Snapshot (2-3 sentences)
2. Core Takeaways (bulleted with bold keywords)
3. Essential Definitions / Formulas / Key Terms (if any)
4. Active Recall Questions (2 quick questions to test retention)
Maintain a calm, clear, well-formatted layout.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Error in /api/study-assistant/summarize:", error);
    res.status(500).json({ error: error?.message || "Failed to summarize notes." });
  }
});

// AI Study Assistant: Flashcards Generation
app.post("/api/study-assistant/flashcards", async (req, res) => {
  try {
    const { topic, notes, count = 5 } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }

    const prompt = `Generate ${count} memorable study flashcards for topic: "${topic || "General"}".
${notes ? `Based on these notes: "${notes.slice(0, 5000)}"` : ""}

Return STRICTLY valid JSON with no markdown wrapping:
{
  "flashcards": [
    {
      "front": "Question or Key Term",
      "back": "Clear, concise answer or definition",
      "hint": "Optional short memory cue"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/study-assistant/flashcards:", error);
    res.status(500).json({ error: error?.message || "Failed to generate flashcards." });
  }
});

// AI Study Assistant: Revision Plan
app.post("/api/study-assistant/revision-plan", async (req, res) => {
  try {
    const { subject, examDate, topics, dailyAvailableHours } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }

    const prompt = `Create a realistic, peaceful, non-overwhelming revision schedule.
Subject: ${subject}
Exam Date: ${examDate || "Soon"}
Topics to cover: ${topics || "General syllabus"}
Daily study target hours: ${dailyAvailableHours || "2 hours"}

Return an encouraging revision breakdown with day-by-day or phased topics, recommended Pomodoro cycles, built-in rest breaks, and a final review buffer before the exam. Keep it kind and manageable.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ plan: response.text });
  } catch (error: any) {
    console.error("Error in /api/study-assistant/revision-plan:", error);
    res.status(500).json({ error: error?.message || "Failed to generate revision plan." });
  }
});

// AI Study Assistant: Active Recall QA
app.post("/api/study-assistant/ask", async (req, res) => {
  try {
    const { question, userQuery, history = [] } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }

    const prompt = `You are HerSpace's Smart Study Assistant. Be warm, supportive, and concise.
Student asks: "${userQuery || question}"

Answer clearly and encourage her. Remember never to provide medical or clinical advice; if anything personal or overwhelming is mentioned, respond with gentle validation and encourage reaching out to a loved one or taking a peaceful break.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Error in /api/study-assistant/ask:", error);
    res.status(500).json({ error: error?.message || "Failed to answer question." });
  }
});

// Vite middleware for dev / static for prod
async function start() {
  const distPath = path.join(process.cwd(), "dist");
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (process.env.NODE_ENV !== "development" && fs.existsSync(path.join(distPath, "index.html")));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const pathname = request.url
      ? new URL(request.url, `http://${request.headers.host}`).pathname
      : "";
    if (pathname === "/api/live-audio") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("Client connected to Gemini Live voice channel");
    const ai = getGenAI();
    if (!ai) {
      clientWs.send(JSON.stringify({ error: "Gemini API key is not configured in Settings > Secrets." }));
      clientWs.close();
      return;
    }

    let session: any = null;
    try {
      session = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction:
            "You are HerSpace Voice Companion, a warm, soothing, empathetic real-time voice companion for Sayani. Speak in gentle, natural, encouraging spoken English with short, friendly responses. Help her study concepts, reflect on her day, organize her thoughts, or guide her through mindful pauses.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ closed: true }));
            }
          },
          onerror: (err) => {
            console.error("Gemini Live session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: String(err) }));
            }
          },
        },
      });

      clientWs.send(JSON.stringify({ ready: true }));

      clientWs.on("message", (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && session) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (parsed.text && session) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (err) {
          console.error("Error routing input to Gemini Live session:", err);
        }
      });

      clientWs.on("close", () => {
        if (session) {
          try {
            session.close();
          } catch {}
        }
      });
    } catch (liveInitErr: any) {
      console.error("Failed to connect to Gemini Live:", liveInitErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: liveInitErr?.message || "Failed to initialize Live API session.",
          })
        );
        clientWs.close();
      }
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`HerSpace backend server running on http://0.0.0.0:${PORT}`);
  });
}

start();
