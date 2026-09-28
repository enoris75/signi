import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import { adverbClass, moreAdverbText } from '../../functions/adverbClass.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import { negatorLead } from '../../functions/negatorLead.js';
import { AGENT, BUTI } from './lt.consts.js';
import { aspectForm } from './aspectForm.js';
import { clauseNegation } from './clauseNegation.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { finiteVerb } from './finiteVerb.js';
import { imperativeLt } from './imperativeLt.js';
import { isSuffixReflexive } from './isSuffixReflexive.js';
import { objectText } from './objectText.js';
import { participleLt } from './participleLt.js';
import { perfectiveFor } from './perfectiveFor.js';
import { pnOf } from './pnOf.js';
import { verbChain } from './verbChain.js';
import { verbWord } from './verbWord.js';
import { withPreposition } from './withPreposition.js';
import type { VerbAgr } from './lt.types.js';

/** One clause's predicate, as `renderClause` and a relative clause hand it over. */
export interface PredicateInput {
  /** The subject's agreement forms: *savo*, a predicate adjective's agreement. */
  subject: Record<string, string>;
  /** What the verb group agrees with (`verbAgr`). */
  agr: VerbAgr;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
  /** A passive's demoted agent, in the bare genitive: *katės*. */
  agent?: ResolvedNounElement;
  /** Whether the subject is itself negative (*niekas, jokia katė*), which puts *ne-* on the verb too. */
  subjectNegative?: boolean;
}

/**
 * The predicate half of a clause (P18-E9): the verb group (`verbChain`), the direct object in the case
 * its verb governs — the genitive under any *ne-* (`objectGovernment`) — the passive's agent in the
 * bare genitive after the participle (*buvo suvalgyta katės*), and the complements.
 *
 * Adverbs: a frequency or manner adverb stands before the verb (*katė visada valgo*, *katė greitai
 * bėga*), a negative one before the verb it concords with (*katė niekada nevalgo*); a manner adverb of
 * a negated verb follows it (*katė nebėga greitai*); a direction or place adverb stands among the
 * complements. A negated adverb says its negative word where it has one, and one whose word is its
 * own negation says the part before it (*jau nevalgo*).
 *
 * The imperative and the citation infinitive are subjectless: the imperative stored for the person
 * (*suvalgyk*; negated the imperfective *nevalgyk*, P18 §0.3), an instruction the infinitive
 * (*išsaugoti*, the register Lithuanian software writes, P18 §3). The existential is *yra* + the pivot
 * in the nominative, negated *nėra / nebuvo / nebus* + the genitive (*nėra katės*), a place leading
 * (*namuose yra katė*) (verify).
 */
export function predicateText(input: PredicateInput): string {
  const { subject, agr, verbPhrase: vp, directObject, complements, agent } = input;
  const { verb, modifier, mood, modals } = vp;
  const negation = clauseNegation({ verbPhrase: vp, subjectNegative: input.subjectNegative, directObject, complements });
  const negated = negation.finite || negation.inner;
  const passive = vp.voice === 'passive';

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

  const object = directObject && !passive && !vp.existential ? objectText(directObject, verb.forms, negated, subject) : '';
  const agentText = passive && agent ? withPreposition(AGENT, elementText(agent, AGENT.case)) : '';
  const rest = complementsAroundAdverb(modifier, primary, complements,
    (cs) => complementsPhrase(cs, { subject, verb: verb.forms, object: directObject?.agreement }),
    { direction: moreAdverbText(vp, 'direction'), place: moreAdverbText(vp, 'place') });

  if (mood === 'imperative') {
    const pf = perfectiveFor(vp, 'finite', negation.finite);
    const infinitive = verbWord(aspectForm(verb.forms, pf, 'base') ?? '', negation.finite, isSuffixReflexive(verb.forms, pf));
    const form = vp.register === 'instruction' ? infinitive : (imperativeLt(verb.forms, pf, pnOf(agr), negation.finite) ?? infinitive);
    return [preAdverb, form, postAdverb, object, rest].filter(Boolean).join(' ');
  }
  if (mood === 'infinitive') {
    const pf = perfectiveFor(vp, 'finite', negation.finite);
    const words = modals.length > 0
      ? [...modals.map((m) => m.verb.forms['base'] ?? ''), aspectForm(verb.forms, perfectiveFor(vp, 'governed', negated), 'base') ?? '']
      : passive ? ['būti', participleLt(verb.forms, 'passive', false, agr)] : [aspectForm(verb.forms, pf, 'base') ?? ''];
    const reflexive = modals.length === 0 && !passive && isSuffixReflexive(verb.forms, pf);
    const [first, ...others] = words;
    const last = others.length > 0 ? others.length - 1 : -1;
    const spoken = [
      verbWord(first ?? '', negated, others.length === 0 && reflexive),
      ...others.map((w, i) => (i === last && modals.length > 0 ? verbWord(w, false, isSuffixReflexive(verb.forms, perfectiveFor(vp, 'governed', negated))) : w)),
    ];
    return [preAdverb, ...spoken, postAdverb, object, agentText, rest].filter(Boolean).join(' ');
  }
  if (vp.existential && modals.length === 0 && directObject) {
    const tense = vp.tense ?? 'present';
    const be = verbWord(finiteVerb(BUTI, { person: '3', plural: false, gender: 'masc' }, tense, mood, false), negation.finite);
    const pivot = elementText(directObject, negation.finite ? 'gen' : 'nom', { subject });
    return [preAdverb, rest, be, postAdverb, pivot].filter(Boolean).join(' ');
  }
  const chain = verbChain(vp, agr, { negation, adverb: preAdverb, modalAdverb: adverbWord });
  return [...chain, postAdverb, agentText, object, rest].filter(Boolean).join(' ');
}
