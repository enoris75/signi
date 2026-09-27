import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { adverbClass, moreAdverbText } from '../../functions/adverbClass.js';
import { alarmCry } from '../../functions/alarmCry.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import type { InvertedSubject } from '../../functions/experiencerInverts.js';
import { isNegativeAdverb } from '../../functions/isNegativeAdverb.js';
import { lemmaTail } from '../../functions/lemmaTail.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';
import { splitLemmaTail } from '../../functions/splitLemmaTail.js';
import { moodPN } from '../../mood.js';
import { FOCUS_WORDS, NEGATOR } from './sursilv.consts.js';
import { agentPhrase } from './agentPhrase.js';
import { agreeParticiple } from './agreeParticiple.js';
import { alarmCryText } from './alarmCryText.js';
import { complementsPhrase } from './complementsPhrase.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { coordinate } from './coordinate.js';
import { imperativeText } from './imperativeText.js';
import { negated } from './negated.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';
import { withRelative } from './withRelative.js';
import { infinitiveGroup, verbGroup, type VerbGroup } from './verbGroup.js';

/**
 * The predicate half of a clause — everything after the subject. Shared by the top-level sentence
 * and by relative clauses, which pass the head noun's forms as `subjectForms` so the verb agrees with
 * the head.
 *
 * Sursilvan is not pro-drop (P04-E10): the subject is the caller's to speak, always, and this builds
 * the verb group after it — tense and aspect from `verbGroup` (P04-E12 … E14), the negation *buca*
 * after the finite word (`negated`, P04-E11), then the adverbs, the object and the complements. A
 * verb with the fused *se-* (*sefermar*) is a plain verb here: its every cell carries it. An object
 * pronoun is its stressed form after the verb, "jeu vesel el" — Sursilvan has no clitic objects (the
 * style sheet).
 */
export function predicateText(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  // The demoted agent of a passive clause, rendered as the "da" phrase (see ResolvedPhrase.agent).
  agent?: ResolvedNounElement,
  // Whether the clause's own subject is a `no` phrase ("negin gat"): it denies the clause alone, with
  // no *buca* (P04-E11 D3). The caller's, as a subject relative is handed its head's forms (A167).
  subjectIsNegative = subjectForms['definiteness'] === 'no',
  // The subject an experiencer clause says after the verb, where an object would stand: "al gat
  // plai **il tgaun**" (A369, see `experiencerInverts`).
  invertedSubject?: InvertedSubject,
): string {
  const { verb, negative: verbNegative, governedNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  const objectPrep = objectPreposition(verb);
  const pn = moodPN(subjectForms);
  const existential = verbPhrase.existential === true;
  // The passive conjugates *vegnir* where the active conjugates the lexical verb (PASSIVE_AUXILIARY),
  // and agrees the lexical verb's participle with the promoted patient, this clause's subject: "la
  // miur vegn magliada", "ei vegnida magliada", "sto vegnir magliada".
  const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
  const plain = passive ? verbPhrase.passiveAux! : verb;
  const passiveParticipleText = passive
    ? agreeParticiple(verb.forms, subjectForms['gender'] ?? 'masc', (subjectForms['number'] ?? 'singular') === 'plural')
    : '';

  // ── Negation (P04-E11) ──
  // A negative word elsewhere in the clause — a `no` object, complement or possessor, a negative
  // subject — denies the clause alone: Sursilvan's *buca* does not concord with it ("jeu vesel negin
  // tgaun", "negin sa", P04-E11 D3, verify). A negation inside a modal's governed group is that
  // group's own.
  const objectIsNegative = (directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false)
    || invertedSubject?.negative === true;
  const governedNegator = (governedNegative === true || governedHasNegativeAdverb(verbPhrase)) && modals.length > 0;
  const concordedInside = governedNegator || modals.some((m) => m.negative);
  const negativeWord = subjectIsNegative
    || ((objectIsNegative || hasNegativeComplement(complements) || hasNegativePossessorComplement(complements)) && !concordedInside);
  const finiteAdverbNegative = finiteHasNegativeAdverb(verbPhrase);
  const clauseNegative = verbNegative === true || finiteAdverbNegative || negativeWord;
  // A focus or aspect adverb under the negation takes its negative word where Sursilvan has one: *gia*
  // is *aunc* ("el ha aunc buca magliau", not yet), *era* is *gnanc* (not either).
  const negAdverb = negativeAdverb(modifier, verbNegative === true || (governedNegative === true && modals.length > 0));

  // ── Adverbs ──
  const adverbText = negAdverb?.text ?? (modifier ? (modifier.forms['base'] ?? '') : '');
  const isDirection = isDirectionAdverb(modifier);
  const primaryText = isDirection || isPlaceAdverb(modifier) ? '' : adverbText;
  const moreFrequency = moreAdverbText(verbPhrase, 'frequency');
  const moreManner = moreAdverbText(verbPhrase, 'manner');
  const primaryIsManner = !!modifier && adverbClass(modifier) === 'manner';
  const trailingManner = primaryIsManner ? '' : moreManner;
  const modifierText = [primaryText, moreFrequency, primaryIsManner ? moreManner : ''].filter(Boolean).join(' ');
  // A frequency adverb (and a negative one) stands right after the finite verb and its *buca*, in a
  // simple tense and a periphrasis alike: "el maglia adina", "el ha adina magliau", "el ha mai
  // magliau" (verify). A sentence adverb scopes over the negation (P09-E39) and stands before its
  // *buca*: "el cuora forsa buca" (verify).
  const sentenceLeads = negAdverb?.slot === 'pre-negator' && clauseNegative && !!primaryText;
  const frequencySlot = !sentenceLeads && !!modifier && (modifier.forms['subtype'] === 'frequency' || isNegativeAdverb(modifier)) && modals.length === 0;

  const complementsText = complementsAroundAdverb(modifier, adverbText, complements,
    (c) => complementsPhrase(c, subjectForms, verb.conceptId, directObject?.agreement, verb.forms),
    { direction: moreAdverbText(verbPhrase, 'direction'), place: moreAdverbText(verbPhrase, 'place') });

  // ── The object ──
  // A pronoun object is its tonic form after the verb, bare or under the verb's preposition (P04-E7
  // D3): "jeu ves el", "el clicca sin mai". A coordination the same: "el vesa il tgaun e mai".
  const objectText = (np: ResolvedNounPhrase): string => {
    if (objectPrep) return prepObjectText(np, objectPrep);
    if (np.head.forms['person']) return withRelative(np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '', np);
    const cry = alarmCry(verb, np);
    return cry ? alarmCryText(cry) : npText(np);
  };
  // A passive has no object left — the patient is its subject — so the slot carries the by-phrase.
  const directObjectText = passive ? agentPhrase(agent)
    : directObject ? withFocus(coordinate(directObject, objectText), slotFocus(directObject), FOCUS_WORDS)
    : invertedSubject?.text ?? '';

  // ── Commands (P04-E16 D2) ──
  if (mood === 'imperative') {
    return imperativeText(plain, subjectForms, register, clauseNegative,
      [modifierText, trailingManner, directObjectText, complementsText]);
  }

  // ── The infinitive, a citation or a governed clause: "magliar la miur", "buca magliar". ──
  if (mood === 'infinitive') {
    return [clauseNegative ? NEGATOR : '', ...infinitiveGroup(plain.forms, subjectForms, aspect), passiveParticipleText, modifierText, trailingManner, directObjectText, complementsText]
      .filter(Boolean).join(' ');
  }

  // ── The finite group ──
  let group: VerbGroup;
  if (modals.length > 0) {
    // The outermost modal is the finite verb and carries tense, mood and the clause's negation; each
    // inner modal is its infinitive (`nonfinite`) — "el vul saver ir" — led by its own *buca*, and the
    // meins verb's group closes the chain as an infinitive.
    const [outer, ...inner] = modals;
    const head = verbGroup(outer!.verb.forms, subjectForms, pn, tense, 'neutral', mood);
    const innerWords = inner.flatMap((m) => [
      m.negative ? NEGATOR : '', m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? '', m.modifier?.forms['base'] ?? '',
    ]);
    const main = infinitiveGroup(plain.forms, subjectForms, aspect);
    group = {
      finite: head.finite,
      rest: [...head.rest, ...innerWords, governedNegator ? NEGATOR : '', ...main].filter(Boolean),
    };
  } else {
    group = verbGroup(plain.forms, subjectForms, pn, tense, aspect, mood);
  }
  // A multiword lemma's tail — the noun of *haver basegn* (NEED), the particle of *ir ora* — is split
  // from its verb by the negation and a frequency adverb as a participle is: "el ha adina basegn", "el
  // va buca ora" (A242).
  const lemmaNoun = group.rest.length === 0 ? lemmaTail(plain) : '';
  const [finiteHead, lemmaEnd] = lemmaNoun ? splitLemmaTail(group.finite, lemmaNoun) : [group.finite, ''];
  // The adverb in the slot after the finite verb: the meins verb's frequency adverb, or under a modal
  // chain the finite modal's own ("el vul mai ir").
  const outerAdverb = modals[0]?.modifier;
  const slotAdverb = modals.length > 0 ? outerAdverb : frequencySlot ? modifier : undefined;
  const slotText = modals.length > 0
    ? (outerAdverb ? negativeAdverb(outerAdverb, verbNegative === true)?.text ?? outerAdverb.forms['base'] ?? '' : '')
    : frequencySlot ? modifierText : '';
  const negWords = negated(finiteHead, {
    // *buca* is the plain negation's; a negative word elsewhere denies the clause without it, and
    // *mai* takes its place (`negated`).
    buca: verbNegative === true && !negativeWord,
    adverb: slotAdverb,
    adverbText: slotText,
    lead: sentenceLeads ? primaryText : '',
  });
  const trailing = frequencySlot || sentenceLeads ? (sentenceLeads ? moreFrequency : '') : modifierText;
  return [negWords, lemmaEnd, ...group.rest, passiveParticipleText, trailing, trailingManner, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}

export type { ConceptForms };
