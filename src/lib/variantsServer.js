import { translateText } from "@/lib/translate";
import { sanitizeVariants } from "@/lib/variants";

// Cleans the admin's variants and fills in English/Spanish names automatically.
// Translations already stored for the same Vietnamese text are reused, so saving again is fast.
export async function buildVariantsForSave(input, existing) {
  const groups = sanitizeVariants(input);
  if (groups.length === 0) return null;

  const cache = new Map();
  for (const g of Array.isArray(existing) ? existing : []) {
    if (g?.name) cache.set(g.name, { en: g.nameEn, es: g.nameEs });
    for (const v of g?.values ?? []) if (v?.label) cache.set(v.label, { en: v.labelEn, es: v.labelEs });
  }

  const texts = new Set();
  for (const g of groups) {
    texts.add(g.name);
    for (const v of g.values) texts.add(v.label);
  }
  const todo = [...texts].filter((t) => !(cache.get(t)?.en && cache.get(t)?.es));
  // Translate in small parallel batches (falls back to the original text if the service is unavailable).
  for (let i = 0; i < todo.length; i += 6) {
    await Promise.all(
      todo.slice(i, i + 6).map(async (text) => {
        const [en, es] = await Promise.all([translateText(text, "en"), translateText(text, "es")]);
        cache.set(text, { en, es });
      }),
    );
  }

  for (const g of groups) {
    const gt = cache.get(g.name);
    g.nameEn = gt?.en || g.name;
    g.nameEs = gt?.es || g.nameEn;
    for (const v of g.values) {
      const vt = cache.get(v.label);
      v.labelEn = vt?.en || v.label;
      v.labelEs = vt?.es || v.labelEn;
    }
  }
  return groups;
}
