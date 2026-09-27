import type { CaAdjectives } from './ca.types.js';

/**
 * The forms an article is chosen from, once the noun's adjectives are known: a place name that goes
 * bare on its own ("Europa") takes the definite article once an adjective modifies it — "l'Europa
 * antiga", "a l'Europa antiga" (A172). The forms then mark the name inherently articled
 * (`takes_article`), so `artFor`, `aDet`, `deDet` and `prepDet` give it the article.
 */
export function artForms(forms: Record<string, string>, adj?: CaAdjectives): Record<string, string> {
  const bareName = forms['proper'] === '1' && forms['takes_article'] !== '1';
  const articled = bareName && !!(adj?.pre || adj?.post || adj?.trail);
  if (!articled) return forms;
  return { ...forms, takes_article: '1' };
}
