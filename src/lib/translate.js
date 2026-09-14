// Free machine translation via MyMemory (no API key required).
// Used to auto-translate product name/description from Vietnamese
// (the only language admins type) into English and Spanish.

const ENDPOINT = "https://api.mymemory.translated.net/get";
const MAX_CHUNK_LEN = 450; // MyMemory's anonymous tier caps request length.

function splitIntoChunks(text, maxLen = MAX_CHUNK_LEN) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

async function translateChunk(text, targetLang) {
  if (!text) return "";
  try {
    const params = new URLSearchParams({ q: text, langpair: `vi|${targetLang}` });
    const res = await fetch(`${ENDPOINT}?${params.toString()}`);
    if (!res.ok) return text;
    const data = await res.json();
    return data?.responseData?.translatedText || text;
  } catch {
    // Translation service unavailable — fall back to the original text
    // rather than blocking product save.
    return text;
  }
}

export async function translateText(text, targetLang) {
  if (!text || !text.trim()) return "";
  const chunks = splitIntoChunks(text.trim());
  const translated = [];
  for (const chunk of chunks) {
    translated.push(await translateChunk(chunk, targetLang));
  }
  return translated.join(" ");
}

// Auto-translates whichever Vietnamese fields are provided.
// Pass undefined for a field to skip translating it.
export async function translateProductFields({ nameVi, descriptionVi }) {
  const result = {};
  if (nameVi !== undefined) {
    result.nameEn = await translateText(nameVi, "en");
  }
  if (descriptionVi !== undefined) {
    const [en, es] = await Promise.all([
      translateText(descriptionVi || "", "en"),
      translateText(descriptionVi || "", "es"),
    ]);
    result.descriptionEn = en;
    result.descriptionEs = es;
  }
  return result;
}
