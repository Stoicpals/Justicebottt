import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

dotenv.config();

const app = express();

// =============================
// Middleware
// =============================
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://127.0.0.1:5000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// =============================
// Path Setup
// =============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================
// 🔥 IMPORTANT FIX (MOVE THIS UP)
// =============================
app.use(express.static(__dirname));
app.get("/", (req, res) => { res.sendFile(path.join(_dirnmae,"chat.html"));
});

// =============================
// MongoDB Connection
// =============================
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// =============================
// Schemas
// =============================
const chatSchema = new mongoose.Schema({
  userMessage: String,
  botReply: String,
  timestamp: { type: Date, default: Date.now },
});

const legalSchema = new mongoose.Schema({
  description: String,
  offense: String,
  punishment: String,
  section: String,
});

// =============================
// Models
// =============================
const Chat = mongoose.model("Chat", chatSchema);
const Legal = mongoose.model("Legal", legalSchema);

// =============================
// OpenAI Setup
// =============================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =============================
// Normalize Query
// =============================
function normalizeQuery(text) {
  const map = {
    theft: ["steal", "stole", "stolen", "rob", "robbery", "snatch", "purse", "wallet"],
    fraud: ["scam", "cheat", "cheating", "fraudulent"],
    harassment: ["threat", "blackmail", "intimidate", "abuse"],
    cybercrime: ["hack", "hacked", "phishing", "otp", "online fraud"]
  };

  let normalized = text.toLowerCase();

  for (const key in map) {
    map[key].forEach(word => {
      if (normalized.includes(word)) {
        normalized += " " + key;
      }
    });
  }

  return normalized;
}

// =============================
// Intent Detection
// =============================
function detectBadIntent(text) {
  const badPatterns = [
    "how to steal",
    "how to hack",
    "how to kidnap",
    "how to scam",
    "how to cheat",
    "avoid police",
    "illegal way"
  ];

  return badPatterns.some(pattern => text.includes(pattern));
}

// =============================
// Keyword Extraction
// =============================
function extractKeywords(text) {
  const stopWords = [
    "i","me","my","the","is","what","can","you","tell","about",
    "in","a","an","of","to","for","and","on","under","section"
  ];

  const words = text.match(/\b[a-z0-9]{2,}\b/g) || [];

  return words.filter((word) => !stopWords.includes(word));
}

// =============================
// Chat Route
// =============================
app.post("/api/chat", async (req, res) => {
  try {

    let userMessage = req.body.message.toLowerCase();
    userMessage = normalizeQuery(userMessage);

    if (detectBadIntent(userMessage)) {

      const warning = `
⚠️ This platform is designed for legal awareness and prevention.
We do not support illegal activities.
      `.trim();

      await new Chat({ userMessage, botReply: warning }).save();

      return res.json({ reply: warning });
    }

    const keywords = extractKeywords(userMessage);
    const regex = new RegExp(keywords.join("|"), "i");

    const result = await Legal.findOne({
      $or: [
        { section: regex },
        { offense: regex },
        { description: regex }
      ]
    });

    if (result) {

      const botReply = `
📘 Relevant Law Found
──────────────────────────────
⚖️ Section: ${result.section || "N/A"}
📜 Offense: ${result.offense || "Not available"}
🧾 Description: ${result.description || "No description"}
⚖️ Punishment: ${result.punishment || "Not specified"}
──────────────────────────────
💡 Source: Indian Penal Code
      `.trim();

      await new Chat({ userMessage, botReply }).save();

      return res.json({ reply: botReply });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Explain laws simply." },
        { role: "user", content: userMessage }
      ],
    });

    const botReply = response.choices[0].message.content;

    await new Chat({ userMessage, botReply }).save();

    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ Chat Error:", error);
    res.status(500).json({ reply: "Server error" });
  }
});

// =============================
// =============================
app.post("/api/analyze", async (req, res) => {
  try {

    let text = (req.body.message || "").toLowerCase();
    text = normalizeQuery(text);

    const keywords = extractKeywords(text);
    const regex = new RegExp(keywords.join("|"), "i");

    // =============================
    // 1. TRY DATABASE FIRST
    // =============================
    const result = await Legal.findOne({
      $or: [
        { section: regex },
        { offense: regex },
        { description: regex }
      ]
    });

    if (result) {
      return res.json({
        sections: result.section || "Not defined",
        offense: result.offense || "",
        severity: "Moderate",
        consequences: result.punishment || "Depends on case",
        steps: [
          "File a police complaint",
          "Collect evidence",
          "Consult a lawyer"
        ]
      });
    }

    // =============================
    // 2. AI FALLBACK (STRUCTURED)
    // =============================
    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a legal assistant.

Given a situation, respond STRICTLY in this format:

Section: <IPC Section if possible>
Severity: <Low/Moderate/High>
Explanation: <short explanation>
Steps:
- step1
- step2
- step3
`
        },
        { role: "user", content: text }
      ],
    });

    const reply = ai.choices[0].message.content;

    // =============================
    // 3. PARSE AI RESPONSE
    // =============================
    const sectionMatch = reply.match(/Section:\s*(.*)/i);
    const severityMatch = reply.match(/Severity:\s*(.*)/i);
    const explanationMatch = reply.match(/Explanation:\s*([\s\S]*?)Steps:/i);
    const stepsMatch = reply.match(/Steps:\s*([\s\S]*)/i);

    const steps = stepsMatch
      ? stepsMatch[1].split("\n").filter(s => s.trim())
      : [];

    return res.json({
      sections: sectionMatch ? sectionMatch[1] : "Not specified",
      severity: severityMatch ? severityMatch[1] : "Unknown",
      consequences: explanationMatch ? explanationMatch[1].trim() : reply,
      steps: steps.length ? steps : ["Consult authorities"]
    });

  } catch (error) {
    console.error("Analyzer Error:", error);
    res.json({
      sections: "Error",
      severity: "Unknown",
      consequences: "Something went wrong",
      steps: []
    });
  }
});

// =============================
// Explorer
// =============================
app.get("/api/explorer", async (req, res) => {
  try {

    const query = req.query.q || "";

    const laws = await Legal.find({
      $or: [
        { section: new RegExp(query, "i") },
        { offense: new RegExp(query, "i") }
      ]
    });

    res.json(laws);

  } catch {
    res.json([]);
  }
});

// =============================
// Dashboard
// =============================
app.get("/api/stats", async (req, res) => {
  try {

    const totalQueries = await Chat.countDocuments();

    const latestChats = await Chat.find()
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      totalQueries,
      latestChats
    });

  } catch {
    res.json({});
  }
});

// =============================
// 🔥 FIXED ROOT ROUTE
// =============================
app.get("/", (req, res) => {
  res.redirect("/chat.html");
});

// =============================
// Server Start
// =============================
const PORT = 5000;

app.listen(PORT, () =>
  console.log(`🚀 JusticeBot running at http://127.0.0.1:${PORT}`)
);
