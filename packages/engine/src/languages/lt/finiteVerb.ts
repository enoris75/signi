import type { Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { aspectForm } from './aspectForm.js';
import { pnOf } from './pnOf.js';
import type { VerbAgr } from './lt.types.js';

/**
 * The bare finite cell for a tense and mood in the aspect the clause picked (P18 §0.3, §2.4), every one
 * stored (D4) — no *l*-participle, no gender, the 3rd person one form for both numbers: the present,
 * the past, the **frequentative past** (`frequentative`: *valgydavo*), the synthetic future (*valgys,
 * suvalgys*) and the conditional (*suvalgytų*). The Romance moods the translator sets — a *jei*
 * protasis (`subjunctive`) and a content clause after a verb of wanting (`presentSubjunctive`, P18
 * §2.4) — are the conditional too (*jei šuo bėgtų*, *nori, kad valgytų*). Negation and the reflexive
 * *-si* are `verbWord`'s. A cell the lexeme lacks falls back on the past for the frequentative, then on
 * the infinitive.
 */
export function finiteVerb(
  forms: Record<string, string>, agr: VerbAgr, tense: Tense, mood: Mood | undefined, perfective: boolean, frequentative = false,
): string {
  const pn = pnOf(agr);
  const cell = (key: string) => aspectForm(forms, perfective, `${pn}_${key}`);
  const form = mood === 'conditional' || mood === 'subjunctive' || mood === 'presentSubjunctive' ? cell('conditional')
    : tense === 'past' ? (frequentative ? cell('frequentative') ?? cell('past') : cell('past'))
    : tense === 'future' ? cell('future')
    : cell('present');
  return form ?? forms['base'] ?? '';
}
