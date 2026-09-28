import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import { adverbClass, moreAdverbText } from '../../functions/adverbClass.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import { negatorLead } from '../../functions/negatorLead.js';
import { AGENT, NIE, NIE_MA } from './pl.consts.js';
import { aspectForm } from './aspectForm.js';
import { clauseNegation } from './clauseNegation.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { finiteVerb } from './finiteVerb.js';
import { imperativePl } from './imperativePl.js';
import { objectText } from './objectText.js';
import { pronounForm } from './pronounForm.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { passiveParticiplePl } from './passiveParticiplePl.js';
import { perfectiveFor } from './perfectiveFor.js';
import { pnOf } from './pnOf.js';
import { verbAgr } from './verbAgr.js';
import { verbChain } from './verbChain.js';
import { withPreposition } from './withPreposition.js';
import type { Case, VerbAgr } from './pl.types.js';

/** One clause's predicate, as `renderClause` and a relative clause hand it over. */
export interface PredicateInput {
  /** The subject's agreement forms: *swój*, the generic *się*, a predicate adjective's agreement. */
  subject: Record<string, string>;
  /** What the finite verb agrees with (`verbAgr`). */
  agr: VerbAgr;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
  /** A passive's demoted agent: *przez kota*. */
  agent?: ResolvedNounElement;
  /** Whether the subject is itself negative (*nikt, żaden kot*), which puts *nie* on the verb too. */
  subjectNegative?: boolean;
}

/**
 * The predicate half of a clause (P05-E8): the verb group (`verbChain`), the direct object in the
 * case its verb governs — the genitive under any *nie* (`objectGovernment`) — and the complements.
 *
 * Adverbs: a frequency or manner adverb stands before the verb (*kot zawsze je*, *kot szybko biegnie*),
 * a negative one before the *nie* it concords with (*kot nigdy nie je*); a manner adverb of a negated
 * verb follows it (*kot nie biegnie szybko*); a direction or place adverb stands among the
 * complements. A negated adverb says its negative word where it has one (*jeszcze nie zjadł*), and one
 * whose word is its own *nie* says the part before it (*już nie je*).
 *
 * The imperative and the citation infinitive are subjectless: the imperative stored for the person
 * (*zjedz, zjedzmy*; negated the imperfective *nie jedz*, P05 D6), an instruction the infinitive (*nie
 * palić*, the register of Polish signs) (verify: buttons use the imperative). The existential is *jest
 * / są* + the pivot in the nominative, negated *nie ma / nie było* + the genitive (*nie ma kota*).
 */
export function predicateText(input: PredicateInput): string {
  const { subject, agr, verbPhrase: vp, directObject, complements, agent } = input;
  const { verb, modifier, mood, modals } = vp;
  const negation = clauseNegation({ verbPhrase: vp, subjectNegative: input.subjectNegative, directObject, complements });
  const negated = negation.finite || negation.inner;
  const generic = subject['generic'] === '1';
  const passive = vp.voice === 'passive';
  const reflexive = verb.forms['reflexive'] === '1';

  const adverbWord = (a: ConceptForms | undefined, negatedHere: boolean): string => {
    if (!a) return '';
    const lead = negatedHere ? negatorLead(a) : '';
    if (lead) return lead;
    return negativeAdverb(a, negatedHere)?.text ?? a.forms['base'] ?? '';
  };
  const mainNegated = modals.length > 0 ? negation.inner : negation.finite;
  const cls = modifier ? adverbClass(modifier) : undefined;
  const primary = adverbWord(modifier, mainNegated);
  const locative = cls === 'direction' || cls === 'place';
  const trailing = cls === 'manner' && mainNegated;
  const preAdverb = locative || trailing ? '' : [primary, moreAdverbText(vp, 'frequency')].filter(Boolean).join(' ');
  const postAdverb = [trailing ? primary : '', moreAdverbText(vp, 'manner')].filter(Boolean).join(' ');

  // A pronoun recipient is the dative clitic right behind the verb, ahead of the object: *daje mu
  // książkę*, *daje jej książkę* (a noun one follows it: *daje książkę dziecku*).
  const terminus = complements?.terminus;
  const recipient = terminus && !verb.forms['terminus_prep'] && isPronounElement(terminus.phrase) && terminus.phrase.agreement['generic'] !== '1'
    ? pronounForm(terminus.phrase.conjuncts[0]!.head.forms, (verb.forms['terminus_case'] as Case | undefined) ?? 'dat', { short: true })
    : '';
  const { terminus: _t, ...others } = complements ?? {};
  const said = recipient ? others : complements;
  const objectWord = directObject && !passive && !vp.existential ? objectText(directObject, verb.forms, negated, subject) : '';
  const object = [recipient, objectWord].filter(Boolean).join(' ');
  const agentText = passive && agent ? withPreposition(AGENT.prep, elementText(agent, AGENT.case, { afterPrep: true })) : '';
  // The generic subject said as a word (*człowiek*, below) predicates as any subject: nominative.
  const predicateSubject = generic && (reflexive || passive) ? { ...subject, generic: '' } : subject;
  const rest = complementsAroundAdverb(modifier, primary, said,
    (cs) => complementsPhrase(cs, { subject: predicateSubject, verb: verb.forms, object: directObject?.agreement }),
    { direction: moreAdverbText(vp, 'direction'), place: moreAdverbText(vp, 'place') });

  if (mood === 'imperative') {
    const pf = perfectiveFor(vp, 'finite', negation.finite);
    const infinitive = aspectForm(verb.forms, pf, 'base') ?? '';
    const form = vp.register === 'instruction' ? infinitive : (imperativePl(verb.forms, pf, pnOf(agr)) ?? infinitive);
    const sie = reflexive && form !== infinitive ? 'się' : '';
    return [preAdverb, negation.finite ? NIE : '', form, sie, postAdverb, object, rest].filter(Boolean).join(' ');
  }
  if (mood === 'infinitive') {
    const pf = perfectiveFor(vp, 'finite', negation.finite);
    const words = modals.length > 0
      ? [...modals.map((m) => m.verb.forms['base'] ?? ''), aspectForm(verb.forms, perfectiveFor(vp, 'governed', negated), 'base') ?? '']
      : passive ? ['być', passiveParticiplePl(verb.forms, false, agr)] : [aspectForm(verb.forms, pf, 'base') ?? ''];
    return [preAdverb, negation.finite || negation.inner ? NIE : '', ...words, postAdverb, object, agentText, rest].filter(Boolean).join(' ');
  }
  if (vp.existential && modals.length === 0 && directObject) {
    const tense = vp.tense ?? 'present';
    if (negation.finite) {
      return [preAdverb, NIE_MA[tense], elementText(directObject, 'gen', { subject }), postAdverb, rest].filter(Boolean).join(' ');
    }
    const pivotAgr = verbAgr(directObject.agreement, directObject.conjuncts);
    const finite = finiteVerb(verb.forms, pivotAgr, tense, mood, false);
    return [preAdverb, finite, postAdverb, elementText(directObject, 'nom', { subject }), rest].filter(Boolean).join(' ');
  }
  // A reflexive verb cannot take the impersonal *się* beside its own: the generic subject is said as a
  // word instead, *człowiek staje się legendą* (the column's `generic_reflexive`, verify).
  const genericWord = generic && (reflexive || passive) ? (subject['generic_reflexive'] ?? '') : '';
  const chain = verbChain(vp, agr, {
    negation, generic: generic && !genericWord, adverb: preAdverb, modalAdverb: adverbWord,
  });
  return [genericWord, ...chain, postAdverb, object, agentText, rest].filter(Boolean).join(' ');
}
