import { QUELLO_FOR_ARTICLE } from './it.consts.js';
import { defArticle } from './defArticle.js';

/**
 * The distal demonstrative "quello", which inflects exactly like the definite article —
 * quel/quello/quell' · quei/quegli · quella/quell' · quelle — so it is built by mapping the
 * article `defArticle` picks for the same gender/number/`lead` onto its quel- counterpart.
 */
export function quelloForm(forms: Record<string, string>, plural: boolean, lead: string): string {
  const art = defArticle(forms, plural, lead);
  // The feminine singular "l'" maps to "quell'" like the masculine, which the table already
  // gives; every article the function can return is covered, so the fallback never fires.
  return QUELLO_FOR_ARTICLE[art] ?? 'quel';
}
