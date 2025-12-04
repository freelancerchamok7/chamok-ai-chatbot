
import axios from "axios";
import cheerio from "cheerio";
import OpenAI from "openai";
import { ChromaClient } from "chromadb";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const chroma = new ChromaClient();
const collection = await chroma.getOrCreateCollection({ name: "chamokdata" });

const urls = [
  "https://freelancerchamok.online/",
  "https://freelancerchamok.online/about-me/",
  "https://freelancerchamok.online/contact-me/",
  "https://freelancerchamok.online/analytics-tracking/",
  "https://freelancerchamok.online/google-ads-services/"
];

async function scrape(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return $("body").text().replace(/\s+/g, " ").trim();
}

async function train() {
  let docs = [];

  for (let url of urls) {
    let content = await scrape(url);
    docs.push(content);
  }

  if (fs.existsSync("./data/custom-data.txt")) {
    docs.push(fs.readFileSync("./data/custom-data.txt", "utf8"));
  }

  let embeddings = [];
  let ids = [];

  for (let i = 0; i < docs.length; i++) {
    let embed = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: docs[i],
    });

    embeddings.push(embed.data[0].embedding);
    ids.push("doc-" + i);
  }

  await collection.add({
    ids,
    embeddings,
    documents: docs
  });

  console.log("Training complete!");
}

train();
