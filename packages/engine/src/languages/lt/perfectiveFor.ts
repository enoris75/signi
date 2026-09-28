import type { ResolvedVerbPhrase } from '../../types.js';
import { ITERATIVE_ADVERBS } from './lt.consts.js';

/**
 * Whether the lexical verb takes its perfective, by the aspect-selection table (P18 §0.3):
 *
 * - progressive, or with an adverb of frequency or duration (*visada, niekada, dažnai*): imperfective
 *   (the past then the frequentative, `isFrequentative`);
 * - under a modal (`governed`): the perfective infinitive, imperfective when negated (*turi suvalgyti /
 *   neturi valgyti*);
 * - the imperative: perfective, imperfective when negated (*suvalgyk / nevalgyk*);
 * - the conditional: perfective (*suvalgytų*);
 * - a *jei* protasis (`subjunctive`) and a content clause in the conditional (`presentSubjunctive`):
 *   imperfective, as the opening table writes it (*jei šuo bėgtų*) (verify: §0.3 says "conditional:
 *   perfective", which would read *jei šuo nubėgtų*);
 * - the infinitive (a citation, a definition): imperfective, the dictionary's form;
 * - prospective and resultative: perfective (*tuoj suvalgys*, *yra suvalgiusi*);
 * - a stative verb (*mylėti, turėti* are unpaired anyway): imperfective;
 * - otherwise the present is imperfective, the neutral past and future perfective (*suvalgė, suvalgys*).
 *
 * `negated` is whether a *ne-* stands on the verb this decides, which only the modal and the
 * imperative rows read. A verb with no `pf_` keys ignores the answer (`aspectForm`).
 */
export function perfectiveFor(vp: ResolvedVerbPhrase, slot: 'finite' | 'governed', negated: boolean): boolean {
  const { tense = 'present', aspect = 'neutral', mood } = vp;
  if (aspect === 'progressive') return false;
  const adverbs = [vp.modifier, ...(vp.moreAdverbs ?? []), ...vp.modals.map((m) => m.modifier)];
  if (adverbs.some((a) => a && ITERATIVE_ADVERBS.has(a.conceptId))) return false;
  if (slot === 'governed') return !negated;
  if (mood === 'imperative') return !negated;
  if (mood === 'conditional') return true;
  if (mood === 'subjunctive' || mood === 'presentSubjunctive' || mood === 'infinitive') return false;
  if (aspect === 'prospective' || aspect === 'resultative') return true;
  if (vp.verb.forms['stative'] === '1') return false;
  return tense !== 'present';
}
