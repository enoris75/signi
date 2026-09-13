import type { Case } from './de.types.js';
import { determiner } from './determiner.js';

/**
 * A complement's preposition + case-declined determiner, honoring `definiteness`. Only a
 * *definite* article triggers the German preposition-article fusions (in+dem=im, in+das=ins,
 * zu+dem=zum, zu+der=zur); any other determiner (einem, keiner, vielen, bare) rides after the plain
 * preposition. An empty `prep` is the bare-dative terminus — the determiner alone.
 */
export function prepDet(prep: string, forms: Record<string, string>, _case: Case, plural: boolean): string {
  const det = determiner(forms, _case, plural);
  // An inherently articled name ("die Antarktis") surfaces the definite article whatever was
  // picked (see `determiner`), so it fuses like one: "zur Antarktis".
  const articled = forms['proper'] === '1' && forms['takes_article'] === '1';
  if ((forms['definiteness'] ?? 'definite') === 'definite' || articled) {
    if (prep === 'in' && det === 'dem') return 'im';
    // The accusative of motion into a neuter ("speichert das Buch ins Haus"); "in das" reads as
    // the emphatic "into *that* house".
    if (prep === 'in' && det === 'das') return 'ins';
    if (prep === 'zu' && det === 'dem') return 'zum';
    if (prep === 'zu' && det === 'der') return 'zur';
  }
  if (!prep) return det;
  return det ? `${prep} ${det}` : prep;
}
