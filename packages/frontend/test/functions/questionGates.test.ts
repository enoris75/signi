import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import { selectionToPlan } from '../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import type { PhraseSelection, QuestionRole } from '../../src/components/PhraseBuilder/interfaces.ts';
import {
  askedRole,
  asksQuestion,
  canAsk,
  canBeExistential,
  canBeHumble,
  hasPatient,
  hasQuestionAnimacy,
  questionAnimateOf,
} from '../../src/components/PhraseBuilder/functions/questionGates.ts';

const c = (id: string, role: Concept['role'], extra: Partial<Concept> = {}): Concept => ({ id, role, description: id, ...extra });
const CAT = c('CAT', 'noun');
const MAN = c('MAN', 'noun', { human: true });
const ME = c('FIRST_PERSON', 'pronoun', { person: '1' });
const SOMETHING = c('SOMETHING', 'pronoun', { person: '3', slot: 'indefinite' });
const EAT = c('EAT', 'verb', { transitivity: 'transitive', complements: ['locative', 'manner', 'cause'] });
const RUN = c('RUN', 'verb', { transitivity: 'intransitive', complements: ['locative'] });
const BE = c('BE', 'verb', { transitivity: 'intransitive', complements: ['predicative', 'locative', 'cause'] });

const ROLES: QuestionRole[] = ['subject', 'directObject', 'locative', 'manner', 'cause'];
// P09-E53's seven, the complements that keep their relation.
const EXTRA: QuestionRole[] = ['terminus', 'comitative', 'topic', 'direction', 'source', 'route', 'temporal'];
const askable = (sel: PhraseSelection) => ROLES.filter((r) => canAsk(sel, r));

// Each gate is one of the engine's refusals (resolveQuestion, existentialPlan, withExistential).
describe('the wh-question gate', () => {
  it('offers every slot the verb has, and none without a verb', () => {
    expect(askable({ subject: CAT, verb: EAT })).toEqual(ROLES);
    expect(askable({ subject: CAT, verb: RUN })).toEqual(['subject', 'locative']);
    expect(askable({ subject: CAT })).toEqual([]);
  });

  it.each<[string, PhraseSelection]>([
    ['an existential', { existential: true }],
    ['a command', { imperative: true }],
    ['a citation', { infinitive: true }],
  ])('withdraws every slot under %s', (_, extra) => {
    expect(askable({ subject: CAT, verb: EAT, ...extra })).toEqual([]);
  });

  // P09-E53 D2: the gate mirrors P09-E15's refusals, and the licence is what the verb is offered.
  it('asks a place in any relation, a cause in any stance but not denied', () => {
    expect(canAsk({ verb: EAT, locativeSpecifier: 'in' }, 'locative')).toBe(true);
    expect(canAsk({ verb: EAT, locativeSpecifier: 'under' }, 'locative')).toBe(true);
    expect(canAsk({ verb: EAT, causeSentiment: 'positive' }, 'cause')).toBe(true);
    expect(canAsk({ verb: EAT, causeSentiment: 'negative' }, 'cause')).toBe(true);
    expect(canAsk({ verb: EAT, causeNegative: true }, 'cause')).toBe(false);
  });

  it('asks the complements that keep their relation, where the verb is offered them', () => {
    const GIVE = c('GIVE', 'verb', { transitivity: 'ditransitive', complements: ['terminus'] });
    const GO = c('GO', 'verb', { transitivity: 'intransitive', complements: ['direction', 'source', 'route'] });
    const SPEAK = c('SPEAK', 'verb', { transitivity: 'intransitive', complements: ['topic'] });
    const ALL = [...ROLES, ...EXTRA];
    const askableOf = (sel: PhraseSelection) => ALL.filter((r) => canAsk(sel, r));
    // The time and the companion are adjuncts, offered on every verb: RUN licenses neither.
    expect(askableOf({ verb: RUN })).toEqual(['subject', 'locative', 'comitative', 'temporal']);
    expect(askableOf({ verb: GIVE })).toEqual(['subject', 'directObject', 'terminus', 'comitative', 'temporal']);
    expect(askableOf({ verb: GO, directionSpecifier: 'under', routeSpecifier: 'over' })).toEqual([
      'subject', 'comitative', 'direction', 'source', 'route', 'temporal',
    ]);
    expect(askableOf({ verb: SPEAK })).toEqual(['subject', 'comitative', 'topic', 'temporal']);
  });

  // P09-E54 D1, D3: the passive asks every slot, the agent's included, unless the verb's object takes
  // a preposition in some language — there the engine refuses the passive question.
  it('asks every slot in the passive, but none over a prepositional object', () => {
    expect(askable({ subject: CAT, verb: EAT, directObject: MAN, verbVoice: 'passive' })).toEqual(ROLES);
    const CLICK = c('CLICK', 'verb', { transitivity: 'transitive', complements: ['locative'], prepositionalObject: true });
    const DEPEND = c('DEPEND', 'verb', { transitivity: 'transitive', prepositionalObject: true });
    expect(askable({ subject: CAT, verb: CLICK, verbVoice: 'passive' })).toEqual([]);
    expect(askable({ subject: CAT, verb: DEPEND, verbVoice: 'passive' })).toEqual([]);
    // The active asks them as ever.
    expect(askable({ subject: CAT, verb: CLICK })).toEqual(['subject', 'directObject', 'locative']);
    // The existential still refuses the passive, for its own reason.
    expect(canBeExistential({ subject: CAT, verb: BE, verbVoice: 'passive' })).toBe(false);
  });

  // P09-E52 D2: the owner inside the subject or the object, as the engine's possessorQuestion takes it.
  it('asks the owner of a single noun subject or object', () => {
    const FOOD = c('FOOD', 'noun');
    const base: PhraseSelection = { subject: CAT, verb: EAT, directObject: FOOD };
    expect(canAsk(base, 'possessor', 'subject')).toBe(true);
    expect(canAsk(base, 'possessor', 'directObject')).toBe(true);
    // The possessed noun defaults to the subject.
    expect(canAsk({ ...base, questionPossessed: 'directObject' }, 'possessor')).toBe(true);
    expect(askedRole({ ...base, interrogative: true, questionRole: 'possessor', questionPossessed: 'directObject' })).toBe('possessor');
  });

  it.each<[string, PhraseSelection, 'subject' | 'directObject']>([
    ['a pronoun', { subject: ME, verb: EAT }, 'subject'],
    ['an empty slot', { verb: EAT }, 'directObject'],
    ['a coordination', { subject: CAT, verb: EAT, subjectConjuncts: [{ subject: MAN }] }, 'subject'],
    ['a pointed-to owner', { subject: CAT, verb: EAT, directObject: MAN, directObjectPossessorRef: 'subject' }, 'directObject'],
    ['a whole', { subject: CAT, verb: EAT, possessorRoles: { subject: 'whole' } }, 'subject'],
    ['parts', { subject: CAT, verb: EAT, possessorRoles: { subject: 'parts' } }, 'subject'],
    ['the agent’s owner', { subject: CAT, verb: EAT, directObject: MAN, verbVoice: 'passive' }, 'subject'],
    ['an intransitive verb’s object', { subject: CAT, verb: RUN, directObject: MAN }, 'directObject'],
  ])('refuses the owner of %s', (_, sel, possessed) => {
    expect(canAsk(sel, 'possessor', possessed)).toBe(false);
  });

  it('asks the patient’s owner in the passive', () => {
    expect(canAsk({ subject: CAT, verb: EAT, directObject: MAN, verbVoice: 'passive' }, 'possessor', 'directObject')).toBe(true);
  });

  // A passive with nothing to promote (a stale voice, its object gone) asks nothing but the object:
  // the engine refuses "a passive wh-question needs a verb that takes the passive".
  it('refuses a passive question with no patient', () => {
    const stale: PhraseSelection = { subject: CAT, verb: EAT, verbVoice: 'passive' };
    expect(canAsk(stale, 'subject')).toBe(false);
    expect(canAsk(stale, 'locative')).toBe(false);
    expect(askedRole({ ...stale, interrogative: true, questionRole: 'subject', questionAnimate: true })).toBeUndefined();
    // The object's own gap is the patient.
    expect(canAsk(stale, 'directObject')).toBe(true);
    expect(canAsk({ ...stale, directObject: MAN }, 'subject')).toBe(true);
  });

  it('counts an asked object as the patient', () => {
    expect(hasPatient({ directObject: CAT })).toBe(true);
    expect(hasPatient({ questionRole: 'directObject' })).toBe(true);
    expect(hasPatient({ questionRole: 'subject' })).toBe(false);
  });

  it('asks a time only at or until: the other relations are refused by the engine', () => {
    expect(canAsk({ verb: RUN }, 'temporal')).toBe(true);
    expect(canAsk({ verb: RUN, temporalRelation: 'at' }, 'temporal')).toBe(true);
    expect(canAsk({ verb: RUN, temporalRelation: 'until' }, 'temporal')).toBe(true);
    for (const relation of ['ago', 'after', 'before', 'during', 'between', 'for'] as const)
      expect(canAsk({ verb: RUN, temporalRelation: relation }, 'temporal')).toBe(false);
  });

  it('asks no purpose, predicative or object predicative', () => {
    // Not question roles at all: the type leaves them out, and the gate has no case for them.
    expect((['purpose', 'predicative', 'objectPredicative'] as string[]).filter((r) => [...ROLES, ...EXTRA].includes(r as QuestionRole))).toEqual([]);
  });

  it('carries the mark into the plan only where the question is asked', () => {
    expect(askedRole({ verb: EAT, interrogative: true, questionRole: 'directObject' })).toBe('directObject');
    expect(askedRole({ verb: EAT, interrogative: true, questionRole: 'directObject', verbVoice: 'passive' })).toBe('directObject');
    expect(askedRole({ verb: EAT, interrogative: true, questionRole: 'directObject', existential: true })).toBeUndefined();
    expect(asksQuestion({ interrogative: true })).toBe(false);
    expect(asksQuestion({ verb: EAT, interrogative: true, imperative: true })).toBe(false);
  });

  it('asks who of a person and what of a thing, unless the chip says otherwise', () => {
    expect(questionAnimateOf({ subject: MAN, questionRole: 'subject' })).toBe(true);
    expect(questionAnimateOf({ subject: CAT, questionRole: 'subject' })).toBe(false);
    expect(questionAnimateOf({ subject: MAN, questionRole: 'subject', questionAnimate: false })).toBe(false);
    expect(questionAnimateOf({ questionRole: 'directObject', questionAnimate: true })).toBe(true);
    expect(questionAnimateOf({ questionRole: 'locative', questionAnimate: true })).toBe(false);
  });

  // P09-E53 D4: the chip only where the answer's animacy changes the question word.
  it('has who and what only where the question word changes with them', () => {
    const has = (role: QuestionRole, extra: PhraseSelection = {}) => hasQuestionAnimacy({ questionRole: role, ...extra }, role);
    for (const role of ['subject', 'directObject', 'terminus', 'comitative', 'topic', 'direction', 'source'] as const)
      expect(has(role)).toBe(true);
    expect(has('locative', { locativeSpecifier: 'under' })).toBe(true);
    expect(has('cause', { causeSentiment: 'positive' })).toBe(true);
    for (const role of ['manner', 'temporal', 'route', 'locative', 'cause'] as const) expect(has(role)).toBe(false);
    expect(has('cause', { causeSentiment: 'negative' })).toBe(false);
    // The held word answers until the chip is flipped.
    expect(questionAnimateOf({ comitative: MAN, questionRole: 'comitative' })).toBe(true);
    expect(questionAnimateOf({ comitative: MAN, questionRole: 'comitative', questionAnimate: false })).toBe(false);
    expect(questionAnimateOf({ route: MAN, questionRole: 'route', questionAnimate: true })).toBe(false);
  });
});

describe('the existential gate', () => {
  it('takes BE with a noun or an indefinite pronoun, active and asserted', () => {
    expect(canBeExistential({ subject: CAT, verb: BE })).toBe(true);
    expect(canBeExistential({ subject: SOMETHING, verb: BE })).toBe(true);
    expect(canBeExistential({ subject: CAT, verb: BE, interrogative: true })).toBe(true);
  });

  it.each<[string, PhraseSelection]>([
    ['another verb', { subject: CAT, verb: EAT }],
    ['no subject', { verb: BE }],
    ['a personal pronoun', { subject: ME, verb: BE }],
    ['a personal pronoun beside an empty conjunct', { subject: ME, verb: BE, subjectConjuncts: [{}] }],
    ['a wh-question', { subject: CAT, verb: BE, interrogative: true, questionRole: 'locative' }],
    ['a command', { subject: CAT, verb: BE, imperative: true }],
    ['a citation', { subject: CAT, verb: BE, infinitive: true }],
  ])('refuses %s', (_, sel) => {
    expect(canBeExistential(sel)).toBe(false);
  });

  it('takes a coordinated pivot, which is a group and not a pronoun', () => {
    expect(canBeExistential({ subject: ME, verb: BE, subjectConjuncts: [{ subject: CAT }] })).toBe(true);
  });

  // The generic person has no object form (A354), so a pivot holding it anywhere is refused: the
  // round trip's gating walk reached "there is a legend, a night and one" (seed 1177, P09-E44–E55).
  it('refuses a pivot that holds the generic person, head or conjunct', () => {
    const ONE = c('GENERIC_PERSON', 'pronoun', { person: '3' });
    expect(canBeExistential({ subject: CAT, verb: BE, subjectConjuncts: [{ subject: CAT }, { subject: ONE }] })).toBe(false);
    expect(canBeExistential({ subject: ONE, verb: BE, subjectConjuncts: [{ subject: CAT }] })).toBe(false);
  });
});

// P11-E6: the humble register mirrors the engine's gate — `buildClauseSegments` (no command, citation
// or passive) and `jaRespectRegister` (every subject conjunct the speaker's own side) — and a verb with
// a humble word (`Concept.humble`), or BE without a predicative, whose いる / おる is the engine's own.
describe('the humble gate', () => {
  const RELATIVE = { relative: true, human: true } as const;
  const FATHER = c('FATHER', 'noun', RELATIVE);
  const MOTHER = c('MOTHER', 'noun', RELATIVE);
  const BROTHER = c('BROTHER', 'noun', RELATIVE);
  const WIFE = c('WIFE', 'noun', RELATIVE);
  const YOU = c('SECOND_PERSON', 'pronoun', { person: '2' });
  const HUMBLE_EAT = c('EAT', 'verb', { transitivity: 'transitive', humble: true });
  const GO = c('GO', 'verb', { transitivity: 'intransitive', humble: true });
  const HOUSE = c('HOUSE', 'noun');
  const BIG = c('BIG', 'adjective');
  // "my X": an owner that points at the *I* holding the subject — the one shape the builder has for it.
  const mine = (word: Concept): PhraseSelection => ({ subject: word, subjectPossessorRef: 'subject' });

  it.each<[string, PhraseSelection]>([
    ['I', { subject: ME, verb: HUMBLE_EAT }],
    ['we', { subject: ME, subjectNumber: 'plural', verb: HUMBLE_EAT }],
    ['I and my father', { subject: ME, verb: GO, subjectConjuncts: [mine(FATHER)] }],
    ['my father, the owner a pronoun (P11-E9)', { subject: FATHER, subjectPossessor: { subject: ME }, verb: GO }],
    ['our mother', { subject: MOTHER, subjectPossessor: { subject: ME, subjectNumber: 'plural' }, verb: HUMBLE_EAT }],
    ['I and my brother’s wife (a chain)', { subject: ME, verb: GO, subjectConjuncts: [{ subject: WIFE, subjectPossessor: mine(BROTHER) }] }],
    ['I, at home (BE with a place)', { subject: ME, verb: BE, locative: HOUSE }],
    ['I, asked a yes/no question', { subject: ME, verb: HUMBLE_EAT, interrogative: true }],
    ['I, with an empty conjunct', { subject: ME, verb: HUMBLE_EAT, subjectConjuncts: [{}] }],
  ])('is offered for %s', (_, sel) => {
    expect(canBeHumble(sel)).toBe(true);
  });

  it.each<[string, PhraseSelection]>([
    ['the cat', { subject: CAT, verb: HUMBLE_EAT }],
    ['a relative nobody owns', { subject: FATHER, verb: HUMBLE_EAT }],
    ['my cat (not a relative)', { subject: ME, verb: HUMBLE_EAT, subjectConjuncts: [mine(CAT)] }],
    ['your mother', { subject: YOU, verb: HUMBLE_EAT, subjectConjuncts: [{ subject: MOTHER, subjectPossessorRef: 'subject' }] }],
    ['the cat’s mother', { subject: MOTHER, subjectPossessor: { subject: CAT }, verb: HUMBLE_EAT }],
    ['your mother, the owner a pronoun (P11-E9)', { subject: MOTHER, subjectPossessor: { subject: YOU }, verb: HUMBLE_EAT }],
    ['a brother’s wife (a kind of person)', { subject: ME, verb: GO, subjectConjuncts: [{ subject: WIFE, subjectPossessor: { ...mine(BROTHER), subjectDefiniteness: 'indefinite' } }] }],
    ['my father and the cat', { subject: ME, verb: GO, subjectConjuncts: [mine(FATHER), { subject: CAT }] }],
    ['no subject', { verb: HUMBLE_EAT }],
    ['a command', { subject: ME, verb: HUMBLE_EAT, imperative: true }],
    ['an infinitive', { subject: ME, verb: HUMBLE_EAT, infinitive: true }],
    ['the passive', { subject: ME, verb: HUMBLE_EAT, directObject: CAT, verbVoice: 'passive' }],
    ['a wh-asked subject', { subject: ME, verb: HUMBLE_EAT, interrogative: true, questionRole: 'subject' }],
    ['RUN, which has no humble word', { subject: ME, verb: RUN }],
    ['copular BE', { subject: ME, verb: BE, predicative: BIG }],
    ['no verb', { subject: ME }],
  ])('is refused for %s', (_, sel) => {
    expect(canBeHumble(sel)).toBe(false);
  });

  // P11-E6 D5: the flag reaches the plan only under the gate, and a selection that stops licensing it
  // keeps it — the plan leaves it out, and it comes back when the subject does.
  it('writes the flag under the gate, and keeps it in the selection outside it', () => {
    const humbleI: PhraseSelection = { subject: ME, verb: HUMBLE_EAT, verbHumble: true };
    expect(selectionToPlan(humbleI).verbPhrase?.humble).toBe(true);
    const cat: PhraseSelection = { ...humbleI, subject: CAT };
    expect(cat.verbHumble).toBe(true);
    expect(selectionToPlan(cat).verbPhrase).not.toHaveProperty('humble');
    expect(selectionToPlan({ ...cat, subject: ME }).verbPhrase?.humble).toBe(true);
    // Unset, it is never written, even where the gate holds.
    expect(selectionToPlan({ subject: ME, verb: HUMBLE_EAT }).verbPhrase).not.toHaveProperty('humble');
  });
});
