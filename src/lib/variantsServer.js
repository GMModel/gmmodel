import { translateText } from "@/lib/translate";
import { sanitizeVariants } from "@/lib/variants";

// Cleans the admin's variant list and fills in English/Spanish labels automatically.
// Translations already stored for the same Vietnamese text are reused, so saving again is fast.
export async function buildVariantsForSave(input, existing) {
  const items = sanitizeVariants(input);
  if (items.length === 0) return null;

  const cache = new Map();
  for (const v of Array.isArray(existing) ? existing : []) {
    if (v?.label) cache.set(v.label, { en: v.labelEn, es: v.labelEs });
  }

  const todo = items.map((v) => v.label).filter((label) => !(cache.get(label)?.en && cache.get(label)?.es));
  // Translate in small parallel batches (falls back to the original text if the service is unavailable).
  for (let i = 0; i < todo.length; i += 6) {
    await Promise.all(
      todo.slice(i, i + 6).map(async (label) => {
        const [en, es] = await Promise.all([translateText(label, "en"), translateText(label, "es")]);
        cache.set(label, { en, es });
      }),
    );
  }

  for (const v of items) {
    const t = cache.get(v.label);
    v.labelEn = t?.en || v.label;
    v.labelEs = t?.es || v.labelEn;
  }
  return items;
}
