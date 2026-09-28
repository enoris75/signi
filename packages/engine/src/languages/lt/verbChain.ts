import type { ConceptForms, ResolvedVerbPhrase } from '../../types.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { BUTI, PROSPECTIVE, RUOSTIS_PAST } from './lt.consts.js';
import { aspectForm } from './aspectForm.js';
import { finiteVerb } from './finiteVerb.js';
import { isFrequentative } from './isFrequentative.js';
import { isSuffixReflexive } from './isSuffixReflexive.js';
import { participleLt } from './participleLt.js';
import { perfectiveFor } from './perfectiveFor.js';
import { pnOf } from './pnOf.js';
import { verbWord } from './verbWord.js';
import type { VerbAgr } from './lt.types.js';

/** What `verbChain` places besides the verbs. */
export interface ChainOptions {
  /** Whether a *ne-* stands on the finite verb, and on a governed group (`clauseNegation`). */
  negation: { finite: boolean; inner: boolean };
  /** The verb's own preverbal adverb, before the finite verb or, under a modal, before the infinitive. */
  adverb: string;
  /** How a modal's own adverb is spelled. */
  modalAdverb: (m: ConceptForms | undefined, negated: boolean) => string;
}

/**
 * The verb group of an indicative, conditional or *jei* clause (P18-E9, §2.2): the finite verb in the
 * aspect the table picks (`perfectiveFor`), read off its stored cell (`finiteVerb`), with *ne-* and a
 * suffix reflexive's *-si* written onto it (`verbWord`: *nevalgo*, *prausiasi*, *nesiprausia*, *nėra*).
 *
 * - The frequentative past with an adverb of habit (*visada valgydavo*, `isFrequentative`).
 * - A modal chain (*turi suvalgyti*, *nori galėti eiti*, *neturi valgyti*): the outermost modal is
 *   finite, the inner ones infinitives, the lexical verb the infinitive of its aspect, a governed *ne-*
 *   written onto it (*turi nevalgyti*). A resultative puts the modal in the past (*turėjo suvalgyti*,
 *   "must have eaten") (verify).
 * - The prospective: *tuoj* + the perfective future (*tuoj suvalgys*), in the past *ruošėsi* + the
 *   perfective infinitive (verify).
 * - The resultative: *būti* in the tense (and mood) + the perfective active past participle agreeing
 *   with the subject (*yra suvalgiusi*, *buvo suvalgęs*, *būtų suvalgiusi*) (P18 §0.3).
 * - The passive (A01): *būti* + the passive past participle of the aspect the table picks, agreeing
 *   with the promoted patient (*pelė buvo suvalgyta*; the present *yra valgyta*, verify: the present
 *   passive participle *valgoma* is not stored).
 */
export function verbChain(vp: ResolvedVerbPhrase, agr: VerbAgr, opts: ChainOptions): string[] {
  const { verb, tense = 'present', aspect = 'neutral', mood, modals } = vp;
  const { negation } = opts;
  const passive = vp.voice === 'passive';
  if (modals.length > 0) {
    const [outer, ...inner] = modals;
    const pf = perfectiveFor(vp, 'governed', negation.finite || negation.inner);
    const modalTense = aspect === 'resultative' && tense === 'present' ? 'past' : tense;
    const governedNo = vp.governedNegative === true || governedHasNegativeAdverb(vp);
    const main = passive
      ? [verbWord('būti', governedNo), participleLt(verb.forms, 'passive', pf, agr)]
      : [verbWord(aspectForm(verb.forms, pf, 'base') ?? '', governedNo, isSuffixReflexive(verb.forms, pf))];
    return [
      opts.modalAdverb(outer!.modifier, negation.finite),
      verbWord(finiteVerb(outer!.verb.forms, agr, modalTense, mood, false), negation.finite),
      ...inner.flatMap((m) => [opts.modalAdverb(m.modifier, !!m.negative), verbWord(m.verb.forms['base'] ?? '', !!m.negative)]),
      opts.adverb,
      ...main,
    ].filter(Boolean);
  }
  const pf = perfectiveFor(vp, 'finite', negation.finite);
  const plainMood = mood === undefined || mood === 'indicative';
  const neg = negation.finite;
  if (aspect === 'prospective' && plainMood && !passive) {
    if (tense === 'past') {
      return [opts.adverb, verbWord(RUOSTIS_PAST[pnOf(agr)] ?? '', neg, true), aspectForm(verb.forms, true, 'base') ?? ''].filter(Boolean);
    }
    return [opts.adverb, PROSPECTIVE, verbWord(finiteVerb(verb.forms, agr, 'future', mood, true), neg, isSuffixReflexive(verb.forms, true))].filter(Boolean);
  }
  const finiteMood = mood !== 'imperative' && mood !== 'infinitive';
  if ((aspect === 'resultative' && finiteMood) || passive) {
    const kind = passive ? 'passive' : 'past_active';
    const participle = verbWord(participleLt(verb.forms, kind, pf, agr), false, !passive && isSuffixReflexive(verb.forms, pf));
    return [opts.adverb, verbWord(finiteVerb(BUTI, agr, tense, mood, false), neg), participle].filter(Boolean);
  }
  const finite = finiteVerb(verb.forms, agr, tense, mood, pf, !pf && isFrequentative(vp));
  return [opts.adverb, verbWord(finite, neg, isSuffixReflexive(verb.forms, pf))].filter(Boolean);
}
