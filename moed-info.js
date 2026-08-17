let cachedKnowledge = null;
let cachedAt = 0;

const CACHE_TIME_MS = 2 * 60 * 1000;

async function loadKnowledgeBase() {
  const now = Date.now();

  if (cachedKnowledge && now - cachedAt < CACHE_TIME_MS) {
    return cachedKnowledge;
  }

  const url =
    process.env.MOED_KB_URL ||
    "https://cloud.vento.build/networks/mamarcosane/moed-kb.json";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`No pude leer la base de MOED: ${response.status}`);
  }

  cachedKnowledge = await response.json();
  cachedAt = now;

  return cachedKnowledge;
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function getRoleContent(kb, mode) {
  const role = kb.roles?.[mode] || kb.roles?.visitante || {};
  const content = Array.isArray(role.content) ? role.content : [];

  return [
    role.description || "",
    ...content,
    ...(Array.isArray(kb.rules) ? kb.rules : [])
  ]
    .filter(Boolean)
    .join("\n");
}

function findRelevantText(text, question) {
  const words = normalizeText(question)
    .split(/\s+/)
    .filter((word) => word.length > 3);

  const parts = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const matches = parts
    .map((part) => {
      const lower = normalizeText(part);
      const score = words.filter((word) => lower.includes(word)).length;
      return { part, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.part);

  if (matches.length === 0) {
    return parts.slice(0, 6).join("\n");
  }

  return matches.join("\n");
}

export async function buildMoedReply(text, mode) {
  const kb = await loadKnowledgeBase();
  const safeMode = kb.roles?.[mode] ? mode : "visitante";
  const roleText = getRoleContent(kb, safeMode);
  const relevant = findRelevantText(roleText, text);

  if (!text || !text.trim()) {
    return `Modo ${safeMode}. Dime que necesitas sobre MOED y te ayudo.`;
  }

  return `Modo ${safeMode}. Respuesta de atencion al cliente MOED:\n\n${relevant}\n\nSi quieres, mandame mas detalles del problema y te digo el siguiente paso.`;
}
