// The round-trip invariant (P02 §3, "Canonical printing"): for every reachable state,
//
//     apply(empty, parse(print(state))) ≡ state
//
// States are reached the way a user reaches them — by a random walk of the canvas's own reducers and
// link rules from an empty workspace — so the generator can only make what the canvas can make.
import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import {
  CAUSE_SENTIMENTS,
  COORD_CONJUNCTIONS,
  SUBORDINATING_CONJUNCTIONS,
  DEFINITENESS,
  DEGREES,
  MODIFIER_RELATIONS,
  PATH_SPECIFIERS,
  TEMPORAL_RELATIONS,
  canCoordinateImperative,
} from '@signi/shared';
import {
  QUESTION_ROLES,
  builderNounAddress,
  inVocativeGroup,
  conjunctAddress,
  isRelativeLink,
  possessorAddress,
  standardAddress,
  subordinateReading,
  type NounAddress,
  type NounKey,
  type RelativeGap,
  type PhraseSelection,
  type SlotKey,
} from '../../src/components/PhraseBuilder/interfaces.ts';
import * as R from '../../src/components/PhraseBuilder/phraseReducers.ts';
import { approximatorFor } from '../../src/components/PhraseBuilder/functions/approximatorFor.ts';
import * as L from '../../src/components/PhraseBuilder/linkRules.ts';
import { canAsk, canBeExistential, hasQuestionAnimacy } from '../../src/components/PhraseBuilder/functions/questionGates.ts';
import { workspaceToPlans } from '../../src/components/PhraseBuilder/workspacePlan/index.ts';
import { adjectiveSlots, BOX_COMPLEMENT_TYPES, COORDINABLE_NOUN_KEYS, MODAL_SLOTS, modalAdverbFor, offeredComplements } from '../../src/components/PhraseBuilder/slots.ts';
import { applyScript } from '../../src/console/language/apply.ts';
import { normalizeWorkspace } from '../../src/console/language/normalize.ts';
import { printWorkspace } from '../../src/console/language/print.ts';
import type { Vocabulary, WorkspaceState } from '../../src/console/language/types.ts';
import { ADJECTIVES, ADVERBS, EN, INTERJECTIONS, IT, KIN, NOUNS, PRONOUNS, VERBS, byId } from './vocab.ts';
import { vocativeOffered } from '@signi/phrase/model/functions/vocativeOffered.ts';
import { empty, ids } from './helpers.ts';

// ── A seeded random walk ─────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const pick = <T,>(rng: Rng, xs: readonly T[]): T | undefined => (xs.length ? xs[Math.floor(rng() * xs.length)] : undefined);

const PLAIN_VERBS = VERBS.filter((v) => !v.modal);
const MODALS = VERBS.filter((v) => v.modal);

/** A pronoun as the chooser would pick it: its person, and a number and gender for it. */
function pronounPick(rng: Rng): { concept: Concept; opts?: R_Opts } {
  const concept = pick(rng, PRONOUNS)!;
  if (concept.id === 'GENERIC_PERSON') return { concept };
  const genders = concept.person === '3' ? (['masc', 'fem', 'neut'] as const) : (['masc', 'fem'] as const);
  return {
    concept,
    opts: { number: pick(rng, ['singular', 'plural'] as const)!, gender: pick(rng, genders)! },
  };
}
type R_Opts = { number?: 'singular' | 'plural'; gender?: 'masc' | 'fem' | 'neut' };

/** A word for a slot, from the categories its picker offers. */
type Frame = 'period' | 'possessor' | 'standard' | 'examples' | 'conjunct';

/** A word for the vocative or one of its conjuncts (P11-E8): a noun, or the hearer's own pronoun. */
function vocativeWord(rng: Rng): { concept: Concept; opts?: R_Opts } {
  if (rng() >= 0.25) return { concept: pick(rng, [...NOUNS, ...KIN])! };
  return { concept: byId('SECOND_PERSON'), opts: { number: pick(rng, ['singular', 'plural'] as const)!, gender: pick(rng, ['masc', 'fem'] as const)! } };
}

// The nouns of a period's own: the clause's, and its vocative (P11-E8).
const PERIOD_NOUNS: NounKey[] = ['subject', 'directObject', ...BOX_COMPLEMENT_TYPES, 'vocative'];

function wordFor(rng: Rng, slot: SlotKey, frame: Frame): { concept: Concept; opts?: R_Opts } {
  if (slot === 'vocative') return vocativeWord(rng);
  const nounOrPronoun = () => (rng() < 0.25 ? pronounPick(rng) : { concept: pick(rng, NOUNS)! });
  if (slot === 'subject') return frame === 'possessor' ? { concept: pick(rng, NOUNS)! } : nounOrPronoun();
  // The purpose, the topic and the opponent take a pronoun behind their adposition as the cause does
  // ("for her", "against him").
  if (slot === 'directObject' || slot === 'cause' || slot === 'purpose' || slot === 'topic' || slot === 'opponent') return nounOrPronoun();
  if (slot === 'predicative') return { concept: rng() < 0.5 ? pick(rng, ADJECTIVES)! : pick(rng, NOUNS)! };
  return { concept: pick(rng, NOUNS)! };
}

// The noun heads of a period, however deep — period nouns, possessor heads, conjunct heads, and the
// heads of the period nouns' standards of comparison.
function nounHeads(root: PhraseSelection): { address: NounAddress; frame: Frame }[] {
  const out: { address: NounAddress; frame: Frame }[] = [];
  const walk = (sel: PhraseSelection, slice: NounAddress | undefined, frame: Frame, keys: NounKey[]) => {
    for (const which of keys) {
      if (!sel[which]) continue;
      const address = builderNounAddress(slice, which);
      out.push({ address, frame });
      const poss = sel[`${which}Possessor` as keyof PhraseSelection] as PhraseSelection | undefined;
      if (poss) walk(poss, possessorAddress(address), 'possessor', ['subject']);
      const standard = sel[`${which}Standard` as keyof PhraseSelection] as PhraseSelection | undefined;
      if (standard && frame === 'period') walk(standard, standardAddress(address), 'standard', ['subject']);
      const examples = sel[`${which}Examples` as keyof PhraseSelection] as PhraseSelection | undefined;
      if (examples && frame === 'period') walk(examples, `${address}/examples`, 'examples', ['subject']);
      R.conjunctsOf(sel, which).forEach((c, i) => walk(c, conjunctAddress(address, i), 'conjunct', ['subject']));
    }
  };
  walk(root, undefined, 'period', PERIOD_NOUNS);
  return out;
}

type Op = (s: WorkspaceState, rng: Rng, id: () => string) => WorkspaceState | undefined;

const onPeriod =
  (fn: (sel: PhraseSelection, rng: Rng, s: WorkspaceState, cid: string) => PhraseSelection | undefined): Op =>
  (s, rng) => {
    const c = pick(rng, s.containers)!;
    const next = fn(c.selection, rng, s, c.id);
    if (!next) return undefined;
    return { ...s, containers: s.containers.map((x) => (x.id === c.id ? { ...x, selection: next } : x)) };
  };

// A container that a link points into, whose nouns must stay where the link found them.
const isLinked = (s: WorkspaceState, cid: string) =>
  s.links.some((l) => l.source.containerId === cid || l.target.containerId === cid);

// An instrument held as a thing is a noun phrase: its period shows no verb box to fill.
const isObjectInstrument = (s: WorkspaceState, cid: string) =>
  s.links.some((l) => l.kind === 'instrumental' && l.target.containerId === cid && (l.level ?? 'object') === 'object');

// A period whose clause is read off its empty slots (P13, subordinateReading): its that-clause is its
// subject while it has no subject word, its adverbial clause an adverb's gloss while it has no verb
// either. Those slots and its mood are what the link stands on, like the words below.
const readsClause = (s: WorkspaceState, cid: string) => {
  const c = s.containers.find((x) => x.id === cid)!;
  const reading = subordinateReading(c.selection);
  return s.links.some(
    (l) => l.source.containerId === cid && ((l.kind === 'content' && reading === 'subject') || (l.kind === 'adverbial' && reading === 'adverb')),
  );
};

// The words a link stands on are left as the link found them. Changing them afterwards is something
// the canvas allows — re-picking a clause's head as a pronoun, lowering an instrument that has a
// verb back to a thing — but it leaves a link no pick could make, which the console, holding to
// the pick's rules, rightly refuses to rebuild (see the plan's notes on phase 1).
const OPS: Op[] = [
  onPeriod((sel, rng, s, cid) => {
    if ((isLinked(s, cid) && sel.subject) || readsClause(s, cid)) return undefined;
    const w = wordFor(rng, 'subject', 'period');
    return R.applyConceptSelect(sel, 'subject', w.concept, w.opts);
  }),
  onPeriod((sel, rng, s, cid) =>
    (isLinked(s, cid) && sel.verb) || isObjectInstrument(s, cid) || readsClause(s, cid) ? undefined : R.applyConceptSelect(sel, 'verb', pick(rng, PLAIN_VERBS)!),
  ),
  onPeriod((sel, rng, s, cid) => {
    if (!sel.verb || sel.verb.transitivity === 'intransitive') return undefined;
    if (isLinked(s, cid) && sel.directObject) return undefined;
    // A that-clause is its verb's object, and the canvas withdraws the object box for it (P09-E12 D9).
    if (s.links.some((l) => l.kind === 'content' && l.source.containerId === cid)) return undefined;
    const w = wordFor(rng, 'directObject', 'period');
    return R.applyConceptSelect(sel, 'directObject', w.concept, w.opts);
  }),
  onPeriod((sel, rng, s, cid) => {
    // What the verb licenses, and the temporal and the purpose every verb offers (P09-E12 D2).
    const type = pick(rng, offeredComplements(sel.verb).filter((t) => t !== 'instrumental'));
    if (!type || (isLinked(s, cid) && sel[type as SlotKey])) return undefined;
    const w = wordFor(rng, type as SlotKey, 'period');
    return R.applyConceptSelect(sel, type as SlotKey, w.concept, w.opts);
  }),
  // The capacity the subject acts in (P09-E44), where the verb offers it: a noun head only, and its
  // gender and number the user's own — nothing infers them from the subject.
  onPeriod((sel, rng, s, cid) => {
    if (!offeredComplements(sel.verb).includes('role') || (isLinked(s, cid) && sel.role)) return undefined;
    let next = R.applyConceptSelect(sel, 'role', pick(rng, NOUNS)!);
    if (next.role?.gendered && rng() < 0.5) next = R.toggleGender(next, 'role');
    if (rng() < 0.5) next = R.toggleNumber(next, 'role');
    return next;
  }),
  // The party the act is directed against (P09-E45), where the verb offers it: a noun or a pronoun.
  onPeriod((sel, rng, s, cid) => {
    if (!offeredComplements(sel.verb).includes('opponent') || (isLinked(s, cid) && sel.opponent)) return undefined;
    const w = rng() < 0.4 ? pronounPick(rng) : { concept: pick(rng, NOUNS)! };
    return R.applyConceptSelect(sel, 'opponent', w.concept, w.opts);
  }),
  // Adjectives and noun modifiers, on any noun head.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel));
    if (!head) return undefined;
    return R.updateNounAt(sel, head.address, (slice, which) => {
      if (slice[which]?.role !== 'noun') return slice;
      const slot = adjectiveSlots(which).find((k) => !slice[k]);
      if (!slot) return slice;
      return R.applyConceptSelect(slice, slot, rng() < 0.7 ? pick(rng, ADJECTIVES)! : pick(rng, NOUNS)!);
    });
  }),
  // The settings of an adjective slot: a degree, or a modifier's number, relation and own adjective.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel));
    if (!head) return undefined;
    return R.updateNounAt(sel, head.address, (slice, which) => {
      const slot = pick(rng, adjectiveSlots(which).filter((k) => slice[k]));
      if (!slot) return slice;
      const a = slice[slot]!;
      if (a.role === 'adjective') return R.setDegree(slice, slot, pick(rng, DEGREES)!);
      const r = rng();
      if (r < 0.33) return R.setModifierNumber(slice, slot, pick(rng, ['singular', 'plural'] as const)!);
      if (r < 0.66) return R.setModifierRelation(slice, slot, pick(rng, MODIFIER_RELATIONS)!);
      return R.setModifierAdjective(slice, slot, pick(rng, ADJECTIVES)!);
    });
  }),
  // Number, gender, determiner, specifier, sentiment, cause polarity, predicate degree on a noun head.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel));
    if (!head) return undefined;
    return R.updateNounAt(sel, head.address, (slice, which) => {
      const c = slice[which]!;
      const r = rng();
      if (r < 0.25 && c.role !== 'adjective') return R.toggleNumber(slice, which);
      if (r < 0.45 && (c.role === 'pronoun' || c.gendered)) return R.toggleGender(slice, which);
      if (r < 0.65 && c.role === 'noun' && !inVocativeGroup(head.address) && (which === 'subject' || which === 'directObject' || ['predicative', 'terminus', 'locative', 'direction', 'source', 'route', 'temporal', 'purpose', 'topic', 'opponent'].includes(which) || (which === 'manner' && c.mannerRelation !== 'measure')))
        return R.setDefiniteness(slice, which, pick(rng, DEFINITENESS)!);
      if (r < 0.75 && (which === 'route' || which === 'locative') && head.frame === 'period')
        return R.setSpecifier(slice, pick(rng, PATH_SPECIFIERS)!, which);
      // The temporal's relation (P09-E12b), in the same band: no noun is both.
      if (r < 0.75 && which === 'temporal' && head.frame === 'period')
        return R.setTemporalRelation(slice, pick(rng, TEMPORAL_RELATIONS)!);
      if (r < 0.80 && which === 'cause' && head.frame === 'period') return R.setSentiment(slice, pick(rng, CAUSE_SENTIMENTS)!);
      // The cause's own polarity, a second axis beside its stance ("not thanks to the dog").
      if (r < 0.85 && which === 'cause' && head.frame === 'period') return R.toggleCauseNegative(slice);
      if (which === 'predicative' && c.role === 'adjective') return R.setDegree(slice, 'predicative', pick(rng, DEGREES)!);
      return slice;
    });
  }),
  // The verb's own settings.
  onPeriod((sel, rng) => {
    const r = rng();
    const finite = !(sel.imperative || sel.infinitive);
    if (r < 0.3 && finite) return R.cycleTense(sel);
    if (r < 0.5 && finite) return R.cycleAspect(sel);
    // The voice, which only a verb with a patient has (the satellite is gated on it too). It does
    // not sit in the finite slot — an infinitive keeps its passive — so only a command rules it out.
    if (
      r < 0.6 &&
      !sel.imperative &&
      (sel.verb?.transitivity === 'transitive' || sel.verb?.transitivity === 'ditransitive')
    ) {
      return R.cycleVoice(sel);
    }
    if (r < 0.75) return R.toggleNegative(sel);
    return R.applyConceptSelect(sel, 'modifier', pick(rng, ADVERBS)!);
  }),
  // Modals and their adverbs.
  onPeriod((sel, rng) => {
    if (!sel.verb || sel.imperative || sel.infinitive) return undefined;
    const free = MODAL_SLOTS.find((k) => !sel[k]);
    if (free && rng() < 0.6) return R.applyConceptSelect(sel, free, pick(rng, MODALS)!);
    const modal = pick(rng, MODAL_SLOTS.filter((k) => sel[k]));
    return modal ? R.applyConceptSelect(sel, modalAdverbFor(modal)!, pick(rng, ADVERBS)!) : undefined;
  }),
  // A possessor, named or pointed to.
  onPeriod((sel, rng) => {
    const heads = nounHeads(sel).filter((h) => R.nounSliceAt(sel, h.address) && (() => {
      const at = R.nounSliceAt(sel, h.address)!;
      return at.slice[at.which]?.role === 'noun';
    })());
    const head = pick(rng, heads);
    if (!head) return undefined;
    if (rng() < 0.7) return R.updateNounAt(sel, head.address, (s, which) => R.updatePossessor(s, which, (p) => R.applyConceptSelect(p, 'subject', pick(rng, NOUNS)!)));
    const antecedent = pick(rng, nounHeads(sel).filter((h) => h.address !== head.address && !h.address.startsWith(`${head.address}/`)));
    return antecedent ? R.updateNounAt(sel, head.address, (s, which) => R.setPossessorRef(s, which, antecedent.address)) : undefined;
  }),
  // The predicate adjective's standard of comparison (P09-E12 D5), named or taken off. It is kept under
  // any degree, so a degree the walk sets afterwards leaves it muted but printed.
  onPeriod((sel, rng) => {
    if (sel.predicative?.role !== 'adjective') return undefined;
    if (sel.predicativeStandard && rng() < 0.25) return R.removeStandard(sel, 'predicative');
    const w = wordFor(rng, 'subject', 'standard');
    const next = R.updateStandard(sel, 'predicative', (s) => R.applyConceptSelect(s, 'subject', w.concept, w.opts));
    // A standard is given for a degree that compares, and outlives a degree that does not.
    return rng() < 0.6 ? R.setDegree(next, 'predicative', pick(rng, DEGREES)!) : next;
  }),
  // A period noun's standard, for its compared adjective (P09-E50): named or taken off, its adjective's
  // degree cycled, or the adjective itself removed — the standard outlives both, muted but printed.
  onPeriod((sel, rng, s, cid) => {
    const which = pick(rng, PERIOD_NOUNS.filter((k) => (sel[k] as Concept | undefined)?.role === 'noun'));
    if (!which) return undefined;
    const r = rng();
    if (sel[`${which}Standard` as keyof PhraseSelection] && r < 0.2) return R.removeStandard(sel, which);
    const adjective = adjectiveSlots(which).find((k) => (sel[k] as Concept | undefined)?.role === 'adjective');
    if (adjective && r < 0.4) return R.setDegree(sel, adjective, pick(rng, DEGREES)!);
    if (adjective && r < 0.5) return R.applyClear(sel, adjective);
    if (s.links.some((l) => isRelativeLink(l) && l.source.containerId === cid && l.source.nounKey === `${which}/standard`)) return undefined;
    const w = wordFor(rng, 'subject', 'standard');
    return R.updateStandard(sel, which, (s) => R.applyConceptSelect(s, 'subject', w.concept, w.opts));
  }),
  // A period noun's examples (P09-E48): named, flipped between such as and including, or taken off.
  // A head a relative clause hangs off keeps its word, as a linked box does.
  onPeriod((sel, rng, s, cid) => {
    const which = pick(rng, PERIOD_NOUNS.filter((k) => (sel[k] as Concept | undefined)?.role === 'noun'));
    if (!which) return undefined;
    const r = rng();
    if (sel[`${which}Examples` as keyof PhraseSelection] && r < 0.25) return R.removeExamples(sel, which);
    if (sel[`${which}Examples` as keyof PhraseSelection] && r < 0.5) return R.toggleExampleRelation(sel, which);
    if (s.links.some((l) => isRelativeLink(l) && l.source.containerId === cid && l.source.nounKey === `${which}/examples`)) return undefined;
    const w = wordFor(rng, 'subject', 'examples');
    return R.updateExamples(sel, which, (s) => R.applyConceptSelect(s, 'subject', w.concept, w.opts));
  }),
  // A conjunct, and a word and settings for it.
  onPeriod((sel, rng) => {
    const which = pick(rng, COORDINABLE_NOUN_KEYS.filter((k) => sel[k]));
    if (!which) return undefined;
    let next = R.addConjunct(sel, which);
    const i = R.conjunctsOf(next, which).length - 1;
    if (rng() < 0.9) {
      // A predicate's conjunct takes what the predicate takes (conjunctSpec, P13), not a pronoun; nor does a
      // role's, whose conjuncts are nouns as its head is (P09-E44).
      const w =
        which === 'predicative' ? wordFor(rng, 'predicative', 'conjunct')
        : which === 'role' ? { concept: pick(rng, NOUNS)! }
        // A vocative's takes what the vocative takes: a noun, or the 2nd person (P11-E8).
        : which === 'vocative' ? vocativeWord(rng)
        : wordFor(rng, 'subject', 'conjunct');
      next = R.updateConjunct(next, which, i, (c) => R.applyConceptSelect(c, 'subject', w.concept, w.opts));
    }
    if (rng() < 0.3) next = R.cycleNounConjunction(next, which);
    return next;
  }),
  // A group's chip clicked once or more (P09-E46): on a pair, and → both … and → or → and.
  onPeriod((sel, rng) => {
    const which = pick(rng, COORDINABLE_NOUN_KEYS.filter((k) => R.conjunctsOf(sel, k).length));
    if (!which) return undefined;
    let next = R.cycleNounConjunction(sel, which);
    while (rng() < 0.4) next = R.cycleNounConjunction(next, which);
    return next;
  }),
  // A mood, unless a clause-level link fixes it.
  (s, rng) => {
    const c = pick(rng, s.containers)!;
    const locked = s.links.some(
      (l) =>
        ((l.kind === 'conditional' || l.kind === 'coordinative') && (l.source.containerId === c.id || l.target.containerId === c.id)) ||
        // A subordinate clause has no mood of its own (P09-E12 D9).
        ((l.kind === 'content' || l.kind === 'adverbial' || l.kind === 'infinitive' || l.kind === 'purpose') && l.target.containerId === c.id),
    );
    if (locked || readsClause(s, c.id)) return undefined;
    const r = rng();
    let sel = c.selection;
    if (r < 0.4) {
      sel = R.toggleImperative(sel);
      if (sel.imperative) {
        sel = R.setImperativePerson(sel, pick(rng, ['2sg', '1pl', '2pl'] as const)!);
        if (rng() < 0.4) sel = R.setImperativeRegister(sel, 'instruction');
      }
    } else if (r < 0.7) sel = R.toggleInfinitive(sel);
    else return undefined;
    return { ...s, containers: s.containers.map((x) => (x.id === c.id ? { ...x, selection: sel } : x)) };
  },
  // The question, the third mood (P09-E12 M5); the slot it asks about and its who / what, where the
  // slot's ring offers the mark (M6); the existential, where the subject's ring offers it (M7). The
  // border's toggle and a mark that would make the period a question respect the mood's lock.
  (s, rng) => {
    const c = pick(rng, s.containers)!;
    const locked = s.links.some(
      (l) =>
        ((l.kind === 'conditional' || l.kind === 'coordinative') && (l.source.containerId === c.id || l.target.containerId === c.id)) ||
        // A subordinate clause has no mood of its own (P09-E12 D9), the question's included.
        ((l.kind === 'content' || l.kind === 'adverbial' || l.kind === 'infinitive' || l.kind === 'purpose') && l.target.containerId === c.id),
    );
    if (readsClause(s, c.id)) return undefined;
    let sel = c.selection;
    const r = rng();
    if (r < 0.3) {
      if (locked) return undefined;
      sel = R.toggleInterrogative(sel);
    } else if (r < 0.75) {
      const role = pick(rng, QUESTION_ROLES.filter((q) => canAsk(sel, q)));
      if (!role || (locked && !sel.interrogative)) return undefined;
      sel = R.toggleQuestionRole(sel, role);
      // P09-E53: the asked box's relation, from its toolbar — any of them, the refused ones too (the
      // plan builder gates those) — and the who / what chip where the question word has the two.
      if (sel.questionRole === role && rng() < 0.6) {
        if (role === 'locative' || role === 'route') sel = R.setSpecifier(sel, pick(rng, PATH_SPECIFIERS)!, role);
        else if (role === 'direction') sel = R.setSpecifier(sel, pick(rng, [undefined, ...PATH_SPECIFIERS]), role);
        else if (role === 'temporal') sel = R.setTemporalRelation(sel, pick(rng, TEMPORAL_RELATIONS)!);
        else if (role === 'cause') sel = R.setSentiment(sel, pick(rng, CAUSE_SENTIMENTS)!);
      }
      if (sel.questionRole === role && hasQuestionAnimacy(sel, role) && rng() < 0.5) sel = R.toggleQuestionAnimate(sel);
    } else if (r < 0.85) {
      // P09-E52: whose, on the subject's or the object's owner where its ring offers the mark.
      const possessed = pick(rng, (['subject', 'directObject'] as const).filter((p) => canAsk(sel, 'possessor', p)));
      if (!possessed || (locked && !sel.interrogative)) return undefined;
      sel = R.toggleQuestionRole(sel, 'possessor', possessed);
    } else {
      if (!canBeExistential(sel)) return undefined;
      sel = R.toggleExistential(sel);
    }
    return { ...s, containers: s.containers.map((x) => (x.id === c.id ? { ...x, selection: sel } : x)) };
  },
  // Another period.
  (s, _rng, id) => ({ ...s, containers: [...s.containers, { id: id(), selection: {} }] }),
  // Links between periods, made only where a pick could make them.
  (s, rng, id) => {
    const source = pick(rng, s.containers)!;
    const target = pick(rng, s.containers)!;
    const r = rng();
    if (r < 0.4) {
      const from = pick(rng, nounHeads(source.selection).filter((h) => {
        const at = R.nounSliceAt(source.selection, h.address)!;
        return at.slice[at.which]?.role === 'noun';
      }));
      // A noun of the period — or, now and then, the gaps no box holds (P13): its instrument, its
      // subject's possessor. canBeRelativeTarget says whether the period has them.
      const nounKey: RelativeGap | undefined = rng() < 0.15
        ? pick(rng, ['instrumental', 'subject/possessor'] as const)
        : pick(rng, (['subject', 'directObject', ...BOX_COMPLEMENT_TYPES] as RelativeGap[]).filter((k) => target.selection[k as NounKey]));
      if (!from || !nounKey) return undefined;
      const t = { containerId: target.id, nounKey };
      if (!L.canBeRelativeTarget(s.containers, s.links, source.id, t)) return undefined;
      return { ...s, links: L.addRelativeLink(s.links, { containerId: source.id, nounKey: from.address }, t, id()) };
    }
    if (r < 0.6) {
      if (!L.canStartCondition(s.links, source) || !L.canBeCondition(s.containers, s.links, source.id, target.id)) return undefined;
      return { ...s, links: L.addConditional(s.links, source.id, target.id, id()) };
    }
    if (r < 0.8) {
      const conj = pick(rng, COORD_CONJUNCTIONS.filter((c) => !source.selection.imperative || canCoordinateImperative(c)))!;
      if (!L.canStartCoordination(s.links, source) || !L.canBeCoordinate(s.containers, s.links, source.id, target.id)) return undefined;
      return { ...s, links: L.addCoordinative(s.links, source.id, target.id, conj, id()) };
    }
    if (!source.selection.verb?.complements?.includes('instrumental')) return undefined;
    if (!L.canBeInstrument(s.containers, s.links, source.id, target.id)) return undefined;
    return { ...s, links: L.addInstrumental(s.links, source.id, target.id, id()) };
  },
  // A subordinate clause (P09-E12 D9), made only where the border control's menu and pick could make
  // it: a that-clause and an infinitive where the verb takes one, an adverbial clause on any verb.
  // Linking an infinitive draws its clause in the infinitive mood, as the pick does.
  (s, rng, id) => {
    const source = pick(rng, s.containers)!;
    const target = pick(rng, s.containers)!;
    const kind = pick(rng, ['content', 'adverbial', 'infinitive', 'purpose'] as const)!;
    if (!L.canStartSubordinate(s.links, source, kind)) return undefined;
    if (!L.canBeSubordinate(s.containers, s.links, source.id, target.id, kind)) return undefined;
    const links = L.addSubordinate(s.links, source.id, target.id, kind, id(), pick(rng, SUBORDINATING_CONJUNCTIONS)!);
    // P09-E55: a question target where the verb reports one — the pick's *Whether*, or any clause of
    // ASK, is made a question.
    const asked = kind === 'content' && (L.governedForce(source) === 'interrogative' || (L.governedForce(source) && rng() < 0.3));
    const containers =
      kind === 'infinitive' || kind === 'purpose'
        ? s.containers.map((c) => (c.id === target.id ? { ...c, selection: R.setInfinitive(c.selection, true) } : c))
        : asked
          ? s.containers.map((c) => (c.id === target.id ? { ...c, selection: R.setInterrogative(c.selection, true) } : c))
          : s.containers;
    return { ...s, containers, links };
  },
  // An instrument's level, and — raised to an act — a verb for it.
  (s, rng) => {
    const link = pick(rng, s.links.filter((l) => l.kind === 'instrumental'));
    if (!link) return undefined;
    const level = pick(rng, ['process', 'concept', 'object'] as const)!;
    const target = s.containers.find((c) => c.id === link.target.containerId)!;
    if (level === 'object' && target.selection.verb) return undefined;
    let next = { ...s, links: L.setInstrumentalLevel(s.links, link.source.containerId, level) };
    if (level !== 'object' && rng() < 0.5) {
      next = {
        ...next,
        containers: next.containers.map((c) =>
          c.id === link.target.containerId ? { ...c, selection: R.applyConceptSelect(c.selection, 'verb', pick(rng, PLAIN_VERBS.filter((v) => v.transitivity !== 'intransitive'))!) } : c,
        ),
      };
    }
    return next;
  },
  // An instrument denied, or taken back — the privative, "without the stick" (P09-E2).
  (s, rng) => {
    const link = pick(rng, s.links.filter((l) => l.kind === 'instrumental'));
    if (!link || link.kind !== 'instrumental') return undefined;
    return { ...s, links: L.setInstrumentalNegative(s.links, link.target.containerId, !link.negative) };
  },
  // A demonstrative pointing away from the rest, or not (P13) — only a *this* / *that* takes it.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel).filter((h) => {
      const at = R.nounSliceAt(sel, h.address);
      const d = at?.slice[`${at.which}Definiteness` as keyof PhraseSelection];
      return d === 'this' || d === 'that';
    }));
    return head ? R.updateNounAt(sel, head.address, (s, which) => R.setContrastive(s, which, rng() < 0.7)) : undefined;
  }),
  // A cardinal numeral counting a noun, or none (P13).
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel).filter((h) => R.nounSliceAt(sel, h.address)?.slice[R.nounSliceAt(sel, h.address)!.which]?.role === 'noun'));
    if (!head) return undefined;
    const n = rng() < 0.3 ? undefined : pick(rng, [1, 2, 3, 7, 12, 24, 100])!;
    return R.updateNounAt(sel, head.address, (s, which) => R.setNumeral(s, which, n));
  }),
  // An approximator on a quantity that takes one (P09-E49), then the numeral and the determiner under
  // it changed — which keeps it on a quantity that still takes one and drops it on one that does not.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel).filter((h) => {
      const at = R.nounSliceAt(sel, h.address);
      return at && approximatorFor(at.slice, at.which) !== undefined;
    }));
    if (!head) return undefined;
    return R.updateNounAt(sel, head.address, (s, which) => {
      let next = R.setApproximated(s, which, rng() < 0.8);
      if (rng() < 0.4) next = R.setNumeral(next, which, rng() < 0.5 ? undefined : pick(rng, [2, 5, 12])!);
      // Only where a determiner is already held: not every block takes one.
      if (s[`${which}Definiteness` as keyof PhraseSelection] && rng() < 0.4)
        next = R.setDefiniteness(next, which, pick(rng, ['all', 'no', 'many', 'some', 'definite'] as const)!);
      return next;
    });
  }),
  // What a noun's genitive possessor is to it (P13).
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel).filter((h) => {
      const at = R.nounSliceAt(sel, h.address);
      return at && (at.slice[`${at.which}Possessor` as keyof PhraseSelection] as PhraseSelection | undefined)?.subject;
    }));
    return head ? R.updateNounAt(sel, head.address, (s, which) => R.cyclePossessorRole(s, which)) : undefined;
  }),
  // The reading of a verbless period's subject, and a time reading's relation (P13).
  onPeriod((sel, rng) => {
    if (sel.verb || sel.subject?.role !== 'noun') return undefined;
    return rng() < 0.7 ? R.cycleSubjectGloss(sel) : sel.subjectGloss === 'temporal' ? R.cycleGlossRelation(sel) : undefined;
  }),
  // An infinitive handed to the governing clause's object, or back (P13).
  (s, rng) => {
    const link = pick(rng, s.links.filter((l) => l.kind === 'infinitive'));
    if (!link || link.kind !== 'infinitive') return undefined;
    return { ...s, links: L.setInfinitiveControl(s.links, link.source.containerId, link.control !== 'object') };
  },
  // A relative clause said alone, or headed again (P13).
  (s, rng) => {
    const link = pick(rng, s.links.filter((l) => !l.kind));
    if (!link || link.kind || !('nounKey' in link.source)) return undefined;
    return { ...s, links: L.setRelativeHeadless(s.links, link.source.containerId, link.source.nounKey, !link.headless) };
  },
  // The period's interjection (P09-E47), set where the card's border offers it — a period no link
  // targets, outside the infinitive — and cleared anywhere, as its box's clear button does. The links
  // the walk makes afterwards leave a word on a linked clause or a citation, which prints and comes back.
  onPeriod((sel, rng, s, cid) => {
    if (sel.interjection && rng() < 0.3) return R.applyClear(sel, 'interjection');
    if (sel.infinitive || s.links.some((l) => l.target.containerId === cid)) return undefined;
    return R.applyConceptSelect(sel, 'interjection', pick(rng, INTERJECTIONS)!);
  }),
  // The period's vocative (P11-E8), set where the card's border offers it — a root period that says one
  // (vocativeOffered) — and cleared anywhere, as the border toggle takes it away. The ops above
  // pluralize it, coordinate it, give it an owner and adjectives, and link a relative clause from it;
  // the links the walk makes afterwards, and a later mood, leave it held where no plan says it.
  onPeriod((sel, rng, s, cid) => {
    if (sel.vocative && rng() < 0.3) {
      if (s.links.some((l) => l.source.containerId === cid && 'nounKey' in l.source && l.source.nounKey.startsWith('vocative'))) return undefined;
      return R.applyClear(sel, 'vocative');
    }
    if (sel.vocative && isLinked(s, cid)) return undefined;
    if (!vocativeOffered(sel, !s.links.some((l) => l.target.containerId === cid))) return undefined;
    const w = vocativeWord(rng);
    return R.applyConceptSelect(sel, 'vocative', w.concept, w.opts);
  }),
  // Clearing: an adjective, a modal, a possessor, a conjunct — never a word a link stands on.
  onPeriod((sel, rng, s, cid) => {
    if (isLinked(s, cid)) return undefined;
    const r = rng();
    const head = pick(rng, nounHeads(sel));
    if (r < 0.3 && head)
      return R.updateNounAt(sel, head.address, (slice, which) => {
        const slot = pick(rng, adjectiveSlots(which).filter((k) => slice[k]));
        return slot ? R.applyClear(slice, slot) : slice;
      });
    if (r < 0.5) {
      const modal = pick(rng, MODAL_SLOTS.filter((k) => sel[k]));
      return modal ? R.applyClear(sel, modal) : undefined;
    }
    if (r < 0.7 && head) return R.updateNounAt(sel, head.address, (slice, which) => R.clearPossessorRef(R.removePossessor(slice, which), which));
    const which = pick(rng, COORDINABLE_NOUN_KEYS.filter((k) => R.conjunctsOf(sel, k).length));
    return which ? R.removeConjunct(sel, which, Math.floor(rng() * R.conjunctsOf(sel, which).length)) : undefined;
  }),
];

function reach(seed: number, steps: number): WorkspaceState {
  const rng = mulberry32(seed);
  const id = (() => {
    let n = 0;
    return () => `g${seed}-${++n}`;
  })();
  let state = empty();
  for (let i = 0; i < steps; i++) {
    const op = pick(rng, OPS)!;
    state = op(state, rng, id) ?? state;
  }
  return state;
}

function roundTrip(state: WorkspaceState, vocab: Vocabulary) {
  const text = printWorkspace(state, vocab);
  const back = applyScript(empty(), text, { context: { containerId: 'p1' }, vocab, newId: ids() });
  return { text, back };
}

describe('the round trip', () => {
  const SEEDS = Number(process.env.SEEDS ?? 400);

  it.each([
    ['English', EN],
    ['Italian', IT],
  ])('gives back every state a random walk of the canvas reaches (%s words)', (_name, vocab) => {
    const failures: string[] = [];
    for (let seed = 1; seed <= SEEDS; seed++) {
      const state = reach(seed, 10 + (seed % 30));
      const { text, back } = roundTrip(state, vocab);
      if (back.diagnostic) {
        failures.push(`seed ${seed}: ${back.diagnostic.message}\n${text}`);
        continue;
      }
      const want = JSON.stringify(normalizeWorkspace(state));
      const got = JSON.stringify(normalizeWorkspace(back.state));
      if (want !== got) failures.push(`seed ${seed}:\n${text}\nwant ${want}\n got ${got}`);
    }
    expect(failures.slice(0, 3)).toEqual([]);
  });

  // The walk's subordinate-clause op is what exercises `/clause`, `/sub` and `/to` (P09-E12 D9). A
  // that-clause needs SAY with no object and an infinitive NEED, so the two are rarer than the others.
  it('reaches each of the subordinate clauses, the clause of purpose and the two readings (P13) among them', () => {
    const kinds = new Set<string>();
    // Twice the seeds the walk once needed: every op P13 adds makes each of these rarer.
    for (let seed = 1; seed <= 8000; seed++) {
      const state = reach(seed, 10 + (seed % 30));
      for (const l of state.links) kinds.add(l.kind ?? 'relative');
      // The readings a period with empty slots gives its clause (P13): the subject clause, the adverb.
      for (const { plan } of workspaceToPlans(state.containers, state.links)) {
        if (plan.contentSubject) kinds.add('contentSubject');
        if (plan.adverbialGloss) kinds.add('adverbialGloss');
      }
    }
    expect([...kinds]).toEqual(
      expect.arrayContaining(['content', 'adverbial', 'infinitive', 'purpose', 'contentSubject', 'adverbialGloss']),
    );
  });

  // P11-E8: the walk reaches the vocative in the shapes its ring makes — pluralized, coordinated, owned,
  // the 2nd person — so each prints and comes back. (It heads a relative clause too, but too rarely to
  // count on in a few thousand walks: golden.test.ts's /voc entry holds that one.)
  it('reaches the vocative pluralized, coordinated, owned and as the 2nd person', () => {
    const texts = Array.from({ length: Math.max(SEEDS, 2000) }, (_, i) => printWorkspace(reach(i + 1, 10 + ((i + 1) % 30)), EN));
    const vocatives = texts.flatMap((t) => t.match(/\/voc \( .*?(?= \/(subj|verb|obj) \(|$)/gm) ?? []);
    for (const shape of [/\/pl\b/, /\/(and|or|bothand) /, /\/poss /, /\/voc \( 2nd/]) {
      expect(vocatives.some((v) => shape.test(v)), String(shape)).toBe(true);
    }
  });

  it('prints a reached state the same way twice', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const state = reach(seed, 25);
      const { text, back } = roundTrip(state, EN);
      expect(printWorkspace(back.state, EN)).toBe(text);
    }
  });

  // P09-E12 D5: the walk reaches the standard of comparison, so the printer's `/than` is exercised —
  // under a degree that takes one, and muted under one that does not — and its `/outof`, the same
  // field read as a superlative's set (P09-E51 D3). A predicate adjective is a rare state (a copular
  // verb, then an adjective in its box), and rarer still once E12b and P11-E8 added their ops, so this
  // looks much further than the default 400 (40,000 seeds since P11-E8's vocative op).
  it('reaches the standard of comparison, a superlative’s set, and a muted one', () => {
    const seeds = Math.max(SEEDS, 40000);
    const texts = Array.from({ length: seeds }, (_, i) => printWorkspace(reach(i + 1, 10 + ((i + 1) % 30)), EN));
    const standards = texts.flatMap((t) => t.match(/\/pred \( \S+( \/\w+)* \/(than|outof) \[/g) ?? []);
    expect(standards.some((p) => /\/(more|less|equally) \/than/.test(p))).toBe(true);
    expect(standards.some((p) => /\/(most|least) \/outof/.test(p))).toBe(true);
    expect(standards.some((p) => !/\/(more|less|equally|most|least) \/(than|outof)/.test(p))).toBe(true);
    // The name follows the degree: never `/than` on a superlative, never `/outof` off one.
    expect(standards.some((p) => /\/(most|least) \/than/.test(p) || (/\/outof/.test(p) && !/\/(most|least) \/outof/.test(p)))).toBe(false);
  }, 30_000);

  // P09-E48: the walk reaches a noun's examples, under both relations.
  it('reaches the examples, such as and including', () => {
    const texts = Array.from({ length: Math.max(SEEDS, 2000) }, (_, i) => printWorkspace(reach(i + 1, 10 + ((i + 1) % 30)), EN));
    expect(texts.some((t) => t.includes('/suchas ['))).toBe(true);
    expect(texts.some((t) => t.includes('/including ['))).toBe(true);
  }, 30_000);

  // P09-E50: the walk reaches a period noun's standard, printed in its bracket, with and without an
  // adjective that compares.
  it('reaches an attributive standard, compared and muted', () => {
    const texts = Array.from({ length: Math.max(SEEDS, 4000) }, (_, i) => printWorkspace(reach(i + 1, 10 + ((i + 1) % 30)), EN));
    const standards = texts.flatMap((t) => t.match(/\/(subj|obj) \( [^()]*?(\/adj \( \S+ \/(more|less|equally) \) )?[^()]*?\/than \[/g) ?? []);
    expect(standards.some((p) => /\/(more|less|equally) \)/.test(p))).toBe(true);
    expect(standards.some((p) => !/\/(more|less|equally) \)/.test(p))).toBe(true);
  }, 30_000);
});

// No control reaches a plan the engine refuses (P09-E12 §Tests, "Gating"): every state the walk above
// reaches — the question, its gap and the existential among its steps — translates in all seven
// languages. The walk's words are the console vocabulary's, and all but two of them are real concepts
// of the corpus; a plan naming one of those two has no lexeme to render and is left out.
const throws = (fn: () => unknown): boolean => {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
};
// A plan with its question and its existential taken out, on every clause it holds.
function unasked(plan: object): object {
  const {
    interrogative: _i, questionRole: _r, questionSpecifiers: _s, questionAnimate: _a, existential: _e,
    ...rest
  } = plan as Record<string, unknown>;
  const clause = (c: unknown) => (c && typeof c === 'object' ? unasked(c) : c);
  const coordination = rest['coordination'] as { clause?: object } | undefined;
  const adverbial = rest['adverbialClause'] as { clause?: object } | undefined;
  return {
    ...rest,
    ...(rest['condition'] ? { condition: clause(rest['condition']) } : {}),
    ...(coordination ? { coordination: { ...coordination, clause: clause(coordination.clause) } } : {}),
    ...(rest['contentObject'] ? { contentObject: clause(rest['contentObject']) } : {}),
    ...(adverbial ? { adverbialClause: { ...adverbial, clause: clause(adverbial.clause) } } : {}),
  };
}

describe('the question and the existential are gated as the engine is', () => {
  it('translates every state the walk reaches without a refusal', async () => {
    process.env['SIGNI_DB_PATH'] = ':memory:';
    const { lookupLexicalEntry } = await import('../../../backend/src/lexicon.ts');
    await import('../../../backend/src/seed.ts');
    const { translate } = await import('@signi/engine');
    const unseeded = /\b(SAIL|LIGHT_WEIGHT)\b/;
    const SEEDS = Number(process.env.SEEDS ?? 400);
    const refusals: string[] = [];
    const headless: string[] = [];
    let asked = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const state = reach(seed, 10 + (seed % 30));
      for (const { plan } of workspaceToPlans(state.containers, state.links)) {
        const json = JSON.stringify(plan);
        // The panel translates a period once its subject has a head (see useTranslation).
        const subject = plan.subject as { concept?: string; conjuncts?: { concept?: string }[] } | undefined;
        if (!(subject?.conjuncts?.[0]?.concept ?? subject?.concept) || unseeded.test(json)) continue;
        if (plan.interrogative || plan.questionRole || plan.existential) asked++;
        const finite = [plan.contentObject, plan.adverbialClause?.clause, plan.condition, plan.coordination?.clause].filter(Boolean) as { subject?: { concept?: string; conjuncts?: { concept?: string }[] } }[];
        if (finite.some((c) => !(c.subject?.conjuncts?.[0]?.concept ?? c.subject?.concept))) headless.push(`seed ${seed}: ${json}`);
        try {
          translate(plan as never, lookupLexicalEntry);
        } catch (e) {
          // Only a throw these constructs cause counts: the same plan without them must render. (An
          // empty linked clause throws on its own, with or without them — not this test's business.)
          if (!throws(() => translate(unasked(plan) as never, lookupLexicalEntry)))
            refusals.push(`seed ${seed}: ${(e as Error).message}\n${json}`);
        }
      }
    }
    expect(refusals.slice(0, 3)).toEqual([]);
    // No linked clause is folded in without a subject: a finite subordinate clause, an if-clause and a
    // coordinate wait for one (see attachSubordinate, attachCondition, attachCoordination; A267), and
    // a command's coordinate is given the addressee.
    expect(headless.slice(0, 3)).toEqual([]);
    // The walk does reach the constructs it is here to check. A count, not a share: each op the walk
    // gains (P13 adds one per construct) makes every other one rarer, so a share would keep falling.
    expect(asked).toBeGreaterThan(10);
  }, 120_000);
});

// A179. A passive set on a finite period stays when the period is made an infinitive, and the
// translation says it ("to be loved"). But the printer gates the voice as it gates the tense and the
// aspect, on the finite slot being free, so the line it writes has no `/passive` and applies back to
// an active. The random walk reaches this only past 400 seeds (764, 1659 and 2022 of 5,000).
describe('known bugs: A179 a passive infinitive', () => {
  // The canvas's own reducers, in the order a user takes them: a transitive verb and its object, the
  // passive, then the infinitive.
  const passiveInfinitive = (): WorkspaceState => {
    let sel: PhraseSelection = {};
    sel = R.applyConceptSelect(sel, 'verb', byId('LOVE'));
    sel = R.applyConceptSelect(sel, 'directObject', byId('DOG'));
    sel = R.setVoice(sel, 'passive');
    sel = R.setInfinitive(sel, true);
    return { containers: [{ id: 'p1', selection: sel }], links: [] };
  };

  it.each([
    ['English', EN],
    ['Italian', IT],
  ])('gives the passive back (%s words)', (_name, vocab) => {
    const state = passiveInfinitive();
    const { back } = roundTrip(state, vocab);
    expect(back.diagnostic).toBeUndefined();
    expect(normalizeWorkspace(back.state)).toEqual(normalizeWorkspace(state));
  });

  it.each([
    ['English', EN, '/inf /verb ( love /passive ) /obj ( dog )'],
    ['Italian', IT, '/inf /verb ( amare /passive ) /obj ( cane )'],
  ])('writes the passive next to the infinitive (%s words)', (_name, vocab, line) => {
    expect(printWorkspace(passiveInfinitive(), vocab)).toBe(line);
  });

  // The other direction, without the printer: a hand-written `/passive` under `/inf` is accepted.
  it('takes a passive written under the infinitive', () => {
    const back = applyScript(empty(), '/inf /verb ( love /passive ) /obj ( dog )', {
      context: { containerId: 'p1' },
      vocab: EN,
      newId: ids(),
    });
    expect(back.diagnostic).toBeUndefined();
    const sel = back.state.containers[0]!.selection;
    expect(sel.infinitive).toBe(true);
    expect(sel.verbVoice).toBe('passive');
  });

  // Regression: a command is always active, so nothing writes or takes a `/passive` for it.
  it('writes no passive for a command', () => {
    let sel: PhraseSelection = {};
    sel = R.applyConceptSelect(sel, 'verb', byId('LOVE'));
    sel = R.applyConceptSelect(sel, 'directObject', byId('DOG'));
    sel = R.setVoice(sel, 'passive');
    sel = R.setImperative(sel, true);
    const state: WorkspaceState = { containers: [{ id: 'p1', selection: sel }], links: [] };
    const { text, back } = roundTrip(state, EN);
    expect(text).toBe('/command /verb ( love ) /obj ( dog )');
    expect(normalizeWorkspace(back.state)).toEqual(normalizeWorkspace(state));
  });

  // Regression: the same period without the infinitive prints its passive and comes back whole.
  it('gives back the finite passive', () => {
    const state = passiveInfinitive();
    state.containers[0]!.selection = R.setInfinitive(state.containers[0]!.selection, false);
    const { text, back } = roundTrip(state, EN);
    expect(text).toContain('/passive');
    expect(normalizeWorkspace(back.state)).toEqual(normalizeWorkspace(state));
  });
});
