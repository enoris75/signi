import type { ConceptForms, ResolvedVerbPhrase } from '../../types.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { BYC, MIEC, NIE, PROSPECTIVE, ZOSTAC } from './pl.consts.js';
import { aspectForm } from './aspectForm.js';
import { finiteVerb } from './finiteVerb.js';
import { futureFinite } from './futureFinite.js';
import { passiveParticiplePl } from './passiveParticiplePl.js';
import { pastFinite } from './pastFinite.js';
import { perfectiveFor } from './perfectiveFor.js';
import type { VerbAgr } from './pl.types.js';

/** What `verbChain` places besides the verbs. */
export interface ChainOptions {
  /** Whether a *nie* stands before the finite verb, and before a governed group (`clauseNegation`). */
  negation: { finite: boolean; inner: boolean };
  /** The impersonal *się* after the finite verb (D5: *je się*). */
  generic: boolean;
  /** The verb's own preverbal adverb, before the finite verb or, under a modal, before the infinitive. */
  adverb: string;
  /** How a modal's own adverb is spelled. */
  modalAdverb: (m: ConceptForms | undefined, negated: boolean) => string;
}

/**
 * The verb group of an indicative, conditional or *gdyby* clause (P05-E8): *nie* before the finite
 * verb, the finite verb in the aspect the table picks (`perfectiveFor`), and *się* after it for a
 * reflexive verb (*staje się*) or the impersonal (*je się*) — once, never twice.
 *
 * - A modal chain (*musi zjeść*, *chce móc iść*, *nie musi jeść*): the outermost modal is finite, the
 *   inner ones infinitives, the lexical verb the infinitive of its aspect, a governed *nie* before it.
 *   A resultative puts the modal in the past (*musiał zjeść*, "must have eaten") (verify).
 * - The prospective: *zaraz* + the perfective future (*zaraz zje*), in the past *miał zaraz zjeść*.
 * - The resultative: the perfective past (*zjadł*), in the future the perfective future.
 * - The passive (A01): *być* + the imperfective participle where the perfective is not picked (*jest
 *   jedzona*), *zostać* + the perfective one where it is (*została zjedzona*, *zostanie zjedzona*) —
 *   the auxiliary conjugates as any verb and the participle agrees with the patient.
 */
export function verbChain(vp: ResolvedVerbPhrase, agr: VerbAgr, opts: ChainOptions): string[] {
  const { verb, tense = 'present', aspect = 'neutral', mood, modals } = vp;
  const { negation } = opts;
  const passive = vp.voice === 'passive';
  const reflexive = verb.forms['reflexive'] === '1';
  const sie = (opts.generic || reflexive) && !passive ? 'się' : '';
  const auxOf = (pf: boolean): Record<string, string> => (pf && verb.forms['pf_passive'] !== undefined ? ZOSTAC : BYC) as Record<string, string>;
  if (modals.length > 0) {
    const [outer, ...inner] = modals;
    const pf = perfectiveFor(vp, 'governed', negation.finite || negation.inner);
    const modalTense = aspect === 'resultative' && tense === 'present' ? 'past' : tense;
    const governedNo = vp.governedNegative === true || governedHasNegativeAdverb(vp);
    const main = passive
      ? [aspectForm(auxOf(pf), pf, 'base') ?? 'być', passiveParticiplePl(verb.forms, pf && auxOf(pf) === ZOSTAC, agr)]
      : [aspectForm(verb.forms, pf, 'base') ?? ''];
    return [
      opts.modalAdverb(outer!.modifier, negation.finite),
      negation.finite ? NIE : '',
      finiteVerb(outer!.verb.forms, agr, modalTense, mood, false),
      opts.generic ? 'się' : '',
      ...inner.flatMap((m) => [m.negative ? NIE : '', opts.modalAdverb(m.modifier, !!m.negative), m.verb.forms['base'] ?? '']),
      opts.adverb,
      governedNo ? NIE : '',
      ...main,
    ].filter(Boolean);
  }
  const pf = perfectiveFor(vp, 'finite', negation.finite);
  const lexical = passive ? auxOf(pf) : verb.forms;
  const pfLexical = passive ? lexical === ZOSTAC : pf;
  const participle = passive ? passiveParticiplePl(verb.forms, pfLexical, agr) : '';
  const nie = negation.finite ? NIE : '';
  const plainMood = mood === undefined || mood === 'indicative';
  if (aspect === 'prospective' && plainMood) {
    if (tense === 'past') {
      return [opts.adverb, nie, pastFinite(MIEC as Record<string, string>, false, agr), opts.generic ? 'się' : '', PROSPECTIVE,
        passive ? 'zostać' : (aspectForm(lexical, true, 'base') ?? ''), participle].filter(Boolean);
    }
    return [opts.adverb, PROSPECTIVE, nie, futureFinite(lexical, pfLexical, agr), sie, participle].filter(Boolean);
  }
  const finite = aspect === 'resultative' && plainMood
    ? (tense === 'future' ? futureFinite(lexical, pfLexical, agr) : pastFinite(lexical, pfLexical, agr))
    : finiteVerb(lexical, agr, tense, mood, pfLexical);
  return [opts.adverb, nie, finite, sie, participle].filter(Boolean);
}
