import type { PhrasePlan, RelativeClause } from '@signi/shared';
import { glossClause, type GlossParts } from './verbs/gloss.js';

// The headless relative-clause gloss (localization C23): an adjective defined by the clause it is —
// SAVED is "that one has saved", WILD "that lives in nature", DIRECT "that a verb governs". A
// noun-phrase gloss ("an object that one has saved") defines a *saved thing*, which is the wrong
// category for an adjective's tooltip; this says the relative alone. See NounPhrase.relativeGloss.
//
// **The antecedent** is every helper's first argument: the class of thing the adjective is said of.
// It is never spoken, but the clause agrees with it exactly as it agrees with the head of a headed
// relative: German's relative pronoun takes its gender (OBJECT_THING → *Gegenstand* → "den man
// gespeichert hat"; BEING → *Wesen* → "das man sehen kann"; OPTION → *Option* → "die …"), English
// says "who" for a person and "that" otherwise, and the Romance participles and predicate adjectives
// agree with it (fr "qu'on a enregistrée", it "che non è solida" of a feminine one). So pick the
// noun the adjective would modify — OBJECT_THING for a property of things, BEING or ANIMAL for one of
// creatures, PERSON for one of people — and read the German.

/**
 * The parts of a headless relative's clause: those of any gloss clause (see `GlossParts`) that a
 * relative clause has room for — an object with its determiner, number and adjectives; complements;
 * a predicate adjective and its degree; an adverb; negation; tense, aspect, voice and modals — but no
 * governed infinitive and no clause of purpose. `antecedent` keeps its `GlossParts` meaning, the noun
 * a *pronoun object* stands for; the relative's own antecedent is the helper's first argument.
 */
export type RelativeParts = Omit<GlossParts, 'infinitive' | 'purpose'> & {
  /**
   * The antecedent in the plural, for an adjective said of several at once. The clause agrees with
   * it where a headed relative's does: de "die man gespeichert hat", es "que se han guardado", fr
   * "qu'on a enregistrés", en "who live …". Singular by default.
   */
  antecedentNumber?: 'plural';
};

/**
 * The parts of an object-gap clause: the antecedent **is** its object, so it takes none of its own —
 * no `object`, nor that object's number, adjectives, determiner or antecedent. Its complements (a
 * recipient, an instrument, a place) are its own.
 */
export type ObjectGapParts = Omit<RelativeParts, 'object' | 'number' | 'adjectives' | 'definiteness' | 'antecedent'>;

/**
 * The named agent of an object-gap clause (see `namedAgentGloss`): a concept id, indefinite, or the
 * concept with a determiner, number or adjectives of its own.
 */
export type RelativeAgent = string | (Pick<GlossParts, 'definiteness' | 'number' | 'adjectives'> & { concept: string });

/** The subject an unnamed agent takes: the generic "one", which Italian, Spanish and Portuguese say
 * as the impersonal si/se and Japanese drops (see its seed). */
const GENERIC_AGENT = 'GENERIC_PERSON';

// The verb, object and complements a relative clause takes, built by the clause builder every gloss
// shares, so an object, a predicate adjective or a modal reads here exactly as it does in a verb's
// gloss.
function relativeClauseOf(verb: string, parts: RelativeParts): Pick<RelativeClause, 'verbPhrase' | 'directObject' | 'complements'> {
  const { antecedentNumber: _number, ...clause } = parts;
  const { verbPhrase, directObject, complements } = glossClause(verb, clause);
  return { verbPhrase, ...(directObject ? { directObject } : {}), ...(complements ? { complements } : {}) };
}

/**
 * The base headless relative gloss: `relative` on an unspoken `antecedent`, said alone. Every helper
 * below builds on it; reach for it directly for a gap they do not cover (a place, a recipient, a
 * possessor). The antecedent is indefinite, as a headed gloss's genus is, and singular unless
 * `number` says otherwise; neither is spoken.
 *
 *   relativeGloss('OBJECT_THING', { headRole: 'directObject', subject: { concept: 'GENERIC_PERSON' },
 *                                   verbPhrase: { verb: 'SAVE', aspect: 'resultative' } })
 *     → en "that one has saved", it "che si è salvato", fr "qu'on a enregistré", de "den man
 *       gespeichert hat", es "que se ha guardado", ja 保存した, pt "que se salvou"
 */
export function relativeGloss(antecedent: string, relative: RelativeClause, number?: 'plural'): PhrasePlan {
  return {
    subject: { concept: antecedent, definiteness: 'indefinite', ...(number ? { number } : {}), relative, relativeGloss: true },
  };
}

/**
 * **The state a verb leaves** (C23's participial adjectives): an object-gap clause whose agent is the
 * generic "one", in the resultative unless `aspect` says otherwise — SAVED is what saving leaves.
 *
 *   stateGloss('OBJECT_THING', 'SAVE')
 *     → en "that one has saved", it "che si è salvato", fr "qu'on a enregistré", de "den man
 *       gespeichert hat", es "que se ha guardado", ja 保存した, pt "que se salvou"
 *   stateGloss('OBJECT_THING', 'SAVE', { negative: true })
 *     → en "that one has not saved", de "den man nicht gespeichert hat", ja 保存していない
 *
 * A standing property rather than a result takes `aspect: 'neutral'`, and so does a modal one, which
 * the resultative would put in the past ("that one can have seen"):
 *
 *   stateGloss('OBJECT_THING', 'KNOW', { aspect: 'neutral', negative: true })
 *     → en "that one does not know", fr "qu'on ne connaît pas", de "den man nicht kennt", ja 知らない
 *   stateGloss('OBJECT_THING', 'SEE', { aspect: 'neutral', modals: ['CAN'] })
 *     → en "that one can see", it "che si può vedere", de "den man sehen kann", ja 見ることができる
 *
 * The passive says the same state of the thing itself, the antecedent promoted to the clause's
 * subject and the generic agent unsaid — so every Romance participle agrees with it:
 *
 *   stateGloss('OBJECT_THING', 'SAVE', { voice: 'passive' })
 *     → en "that has been saved", it "che è stato salvato", fr "qui a été enregistré", de "der
 *       gespeichert worden ist", es "que ha sido guardado", ja 保存された, pt "que foi salvo"
 *
 * The clause's complements are its own (a recipient, an instrument, a place); its object is the
 * antecedent, so it takes none (see `ObjectGapParts`).
 */
export function stateGloss(antecedent: string, verb: string, parts: ObjectGapParts = {}): PhrasePlan {
  return relativeGloss(antecedent, {
    headRole: 'directObject',
    subject: { concept: GENERIC_AGENT },
    ...relativeClauseOf(verb, { ...parts, aspect: parts.aspect ?? 'resultative' }),
  }, parts.antecedentNumber);
}

/**
 * **What the antecedent does, or is** (C24's relational adjectives): a subject-gap clause, the
 * antecedent its subject — the headless `whoGloss`. The clause takes every part a gloss clause takes:
 * an object under its determiner and number, complements, a predicate adjective and its degree,
 * negation, an adverb, tense, aspect and modals.
 *
 *   subjectGapGloss('ANIMAL', 'LIVE', { complements: { locative: { phrase: { concept: 'HOUSE', definiteness: 'definite' } } } })
 *     → en "that lives in the house", it "che abita nella casa", de "das im Haus wohnt", ja 家に住む
 *   subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'NAME_NOUN', number: 'plural', negative: true })
 *     → en "that does not have names", fr "qui n'a pas de noms", de "der keine Namen hat", ja 名前がない
 *   subjectGapGloss('SUBSTANCE', 'BE', { predicate: 'SOLID', negative: true })
 *     → en "that is not solid", it "che non è solida", de "der nicht fest ist", ja 固体ではない
 *   subjectGapGloss('WORD', 'INDICATE', { object: 'SPEAKER', definiteness: 'definite' })
 *     → en "that indicates the speaker", de "das den Sprecher bezeichnet", ja 話し手を示す
 *
 * A person antecedent is "who" in English: subjectGapGloss('PERSON', 'LIVE', …) → "who lives in the
 * house", de "die im Haus wohnt" (*Person* is feminine).
 */
export function subjectGapGloss(antecedent: string, verb: string, parts: RelativeParts = {}): PhrasePlan {
  return relativeGloss(antecedent, relativeClauseOf(verb, parts), parts.antecedentNumber);
}

/**
 * **What a named agent does to the antecedent**: an object-gap clause like `stateGloss`'s, with a
 * noun where the generic "one" would stand, and no aspect of its own unless `parts` gives one — the
 * headless `patientOfGloss`. The agent is indefinite unless it says otherwise.
 *
 *   namedAgentGloss('OBJECT_THING', 'GOVERN', 'VERB')
 *     → en "that a verb governs", it "che un verbo regge", fr "qu'un verbe régit", de "den ein Verb
 *       regiert", es "que un verbo rige", ja 動詞が支配する, pt "que um verbo rege"
 *   namedAgentGloss('WORD', 'INDICATE', { concept: 'SPEAKER', definiteness: 'definite' })
 *     → en "that the speaker indicates", de "das der Sprecher bezeichnet"
 */
export function namedAgentGloss(antecedent: string, verb: string, agent: RelativeAgent, parts: ObjectGapParts = {}): PhrasePlan {
  const { concept, definiteness = 'indefinite', number, adjectives } = typeof agent === 'string' ? { concept: agent } : agent;
  return relativeGloss(antecedent, {
    headRole: 'directObject',
    subject: { concept, definiteness, ...(number ? { number } : {}), ...(adjectives?.length ? { adjectives } : {}) },
    ...relativeClauseOf(verb, parts),
  }, parts.antecedentNumber);
}
