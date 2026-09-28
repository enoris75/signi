import { TEGUL } from './lt.consts.js';
import { aspectForm } from './aspectForm.js';
import { isSuffixReflexive } from './isSuffixReflexive.js';
import { verbWord } from './verbWord.js';

/**
 * The imperative (P18 §2.4): the stored 2sg / 1pl / 2pl of the aspect the clause picked (*suvalgyk,
 * suvalgykime, suvalgykite*; negated, the imperfective *nevalgyk*), with *ne-* and the reflexive *-si*
 * as `verbWord` writes them (*prauskis*, *nesiprausk*). A 1st singular asks for the 2nd. A 3rd person
 * is *tegul* + the present (*tegul suvalgo*, *tegul nevalgo*) (verify). `undefined` where the verb has no
 * imperative at all (a modal), which the caller says as the infinitive.
 */
export function imperativeLt(forms: Record<string, string>, perfective: boolean, pn: string, negated: boolean): string | undefined {
  const reflexive = isSuffixReflexive(forms, perfective);
  if (pn.startsWith('3')) {
    const present = aspectForm(forms, perfective, `${pn}_present`);
    return present ? `${TEGUL} ${verbWord(present, negated, reflexive)}` : undefined;
  }
  const key = pn === '1sg' ? '2sg' : pn;
  const form = aspectForm(forms, perfective, `${key}_imperative`);
  return form ? verbWord(form, negated, reflexive) : undefined;
}
