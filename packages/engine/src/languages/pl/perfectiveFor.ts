import type { ResolvedVerbPhrase } from '../../types.js';
import { ITERATIVE_ADVERBS } from './pl.consts.js';

/**
 * Whether the lexical verb takes its perfective, by the aspect-selection table (P05 §0.3):
 *
 * - progressive, or with an adverb of frequency or duration (*zawsze, nigdy*): imperfective;
 * - under a modal (`governed`): the perfective infinitive, imperfective when negated (*musi zjeść /
 *   nie musi jeść*);
 * - the imperative: perfective, imperfective when negated (*zjedz / nie jedz*);
 * - the conditional: perfective (*zjadłby*);
 * - a *gdyby* clause: imperfective, as the opening table writes it (*gdyby pies biegł*) (verify: §0.3
 *   says "both clauses" perfective, which reads *gdyby pies pobiegł*);
 * - the infinitive (a citation, a definition): imperfective, the dictionary's form;
 * - prospective and resultative: perfective (*zaraz zje*, *zjadł*);
 * - a stative verb (*wiedzieć, mieć* are unpaired anyway): imperfective;
 * - otherwise the present is imperfective, the neutral past and future perfective (*zjadł, zje*).
 *
 * `negated` is whether a *nie* stands before the verb this decides, which only the modal and the
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
  if (mood === 'subjunctive' || mood === 'infinitive') return false;
  if (aspect === 'prospective' || aspect === 'resultative') return true;
  if (vp.verb.forms['stative'] === '1') return false;
  return tense !== 'present';
}
