let cachedInfo = "";
let cachedAt = 0;

const CACHE_TIME_MS = 10 * 60 * 1000;

function cleanHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadMoedInfo() {
  const now = Date.now();

  if (cachedInfo && now - cachedAt < CACHE_TIME_MS) {
    return cachedInfo;
  }

  const url = process.env.MOED_URL || "https://moedweb.netlify.app";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`No pude leer la web de MOED: ${response.status}`);
  }

  const html = await response.text();
  cachedInfo = cleanHtml(html);
  cachedAt = now;

  return cachedInfo;
}

function findRelevantText(info, question) {
  const words = question
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);

  const sentences = info.split(/(?<=[.!?])\s+|(?=#)|(?=###)/);

  const matches = sentences
    .map((sentence) => {
      const lower = sentence.toLowerCase();
      const score = words.filter((word) => lower.includes(word)).length;
      return { sentence, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.sentence.trim());

  if (matches.length === 0) {
    return info.slice(0, 1200);
  }

  return matches.join("\n");
}

export async function buildMoedReply(text, mode) {
  const info = await loadMoedInfo();
  const relevant = findRelevantText(info, text);

  if (mode === "moderador") {
    return `Modo moderador. He buscado dentro de la web de MOED y esto es lo mas relacionado:\n\n${relevant}`;
  }

  if (mode === "trabajador") {
    return `Modo trabajador. He buscado dentro de la web de MOED y esto es lo mas relacionado:\n\n${relevant}`;
  }

  return `Modo visitante. He buscado dentro de la web publica de MOED y esto es lo mas relacionado:\n\n${relevant}`;
}
