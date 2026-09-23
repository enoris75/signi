import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseSelection, QuestionRole } from '../../src/components/PhraseBuilder/interfaces.ts';
import {
  askedRole,
  asksQuestion,
  canAsk,
  canBeExistential,
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
const askable = (sel: PhraseSelection) => ROLES.filter((r) => canAsk(sel, r));

// Each gate is one of the engine's refusals (resolveQuestion, existentialPlan, withExistential).
describe('the wh-question gate', () => {
  it('offers every slot the verb has, and none without a verb', () => {
    expect(askable({ subject: CAT, verb: EAT })).toEqual(ROLES);
    expect(askable({ subject: CAT, verb: RUN })).toEqual(['subject', 'locative']);
    expect(askable({ subject: CAT })).toEqual([]);
  });

  it.each<[string, PhraseSelection]>([
    ['the passive', { verbVoice: 'passive' }],
    ['an existential', { existential: true }],
    ['a command', { imperative: true }],
    ['a citation', { infinitive: true }],
  ])('withdraws every slot under %s', (_, extra) => {
    expect(askable({ subject: CAT, verb: EAT, ...extra })).toEqual([]);
  });

  it('asks a locative only in its plain relation, a cause only neutral and not denied', () => {
    expect(canAsk({ verb: EAT, locativeSpecifier: 'in' }, 'locative')).toBe(true);
    expect(canAsk({ verb: EAT, locativeSpecifier: 'under' }, 'locative')).toBe(false);
    expect(canAsk({ verb: EAT, causeSentiment: 'positive' }, 'cause')).toBe(false);
    expect(canAsk({ verb: EAT, causeNegative: true }, 'cause')).toBe(false);
  });

  it('carries the mark into the plan only where the question is asked', () => {
    expect(askedRole({ verb: EAT, interrogative: true, questionRole: 'directObject' })).toBe('directObject');
    expect(askedRole({ verb: EAT, interrogative: true, questionRole: 'directObject', verbVoice: 'passive' })).toBeUndefined();
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
});
