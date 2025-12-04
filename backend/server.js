
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { ChromaClient } from "chromadb";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const chroma = new ChromaClient();
const collection = await chroma.getOrCreateCollection({ name: "chamokdata" });

function detectLanguage(text) {
  const bangla = /[\u0980-\u09FF]/;
  return bangla.test(text) ? "bangla" : "english";
}

app.post("/chat", async (req, res) => {
  const question = req.body.question || "";
  const lang = detectLanguage(question);

  const embed = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  const results = await collection.query({
    queryEmbeddings: embed.data[0].embedding,
    nResults: 5,
  });

  const context = results.documents.join("\n");

  const systemPrompt = lang === "bangla"
    ? "Respond in Bangla language. Use ONLY the provided context."
    : "Respond in English. Use ONLY the provided context.";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Question: ${question}\n\nContext:\n${context}` }
    ]
  });

  res.json({ answer: completion.choices[0].message.content });
});

app.listen(3000, () => console.log("AI Chatbot running on port 3000"));
