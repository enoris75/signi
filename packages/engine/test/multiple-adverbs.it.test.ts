import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// P15. A verb takes several adverbs, and Italian places each by its class: a further frequency
// adverb beside the frequency primary, wherever that goes (after the finite verb of a periphrasis,
// after the group otherwise); a further manner adverb beside a manner primary, or else in the manner
// slot right after the whole verb group, ahead of the object; a further place or direction adverb
// among the complements, as a lone one stands.
const italian = (plan: PhrasePlan): string => sayAll(plan).it;

const cat = (verb: string, verbPhrase: Partial<VerbPhrase>, extra: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}) =>
  italian(clause(np('CAT'), verb, { verbPhrase, ...extra }));
const mouse = { directObject: np('MOUSE') };
const relative = (verbPhrase: NonNullable<NounPhrase['relative']>['verbPhrase']) =>
  italian(clause(np('CAT', { relative: { verbPhrase, directObject: np('MOUSE') } }), 'RUN'));

describe('several adverbs on an Italian verb', () => {
  test('frequency + manner', () => {
    expect(cat('RUN', { modifier: 'OFTEN', modifiers: ['FAST'] })).toBe('il gatto corre spesso velocemente.');
    expect(cat('RUN', { modifier: 'OFTEN', modifiers: ['FAST'], negative: true })).toBe('il gatto non corre spesso velocemente.');
    // The frequency adverb splits the compound tense; the manner one follows the participle.
    expect(cat('RUN', { modifier: 'OFTEN', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' }))
      .toBe('il gatto aveva spesso corso velocemente.');
    expect(cat('EAT', { modifier: 'OFTEN', modifiers: ['FAST'], aspect: 'progressive' }, mouse))
      .toBe('il gatto sta spesso mangiando velocemente il topo.');
    expect(cat('RUN', { modifier: 'OFTEN', modifiers: ['FAST'], modals: ['MUST'] })).toBe('il gatto deve correre spesso velocemente.');
    expect(cat('EAT', { modifier: 'OFTEN', modifiers: ['FAST'] }, mouse)).toBe('il gatto mangia spesso velocemente il topo.');
    expect(relative({ verb: 'EAT', modifier: 'OFTEN', modifiers: ['FAST'] })).toBe('il gatto che mangia spesso velocemente il topo corre.');
  });

  test('manner + place', () => {
    expect(cat('RUN', { modifier: 'FAST', modifiers: ['HERE'] })).toBe('il gatto corre velocemente qui.');
    expect(cat('RUN', { modifier: 'FAST', modifiers: ['HERE'], negative: true })).toBe('il gatto non corre velocemente qui.');
    expect(cat('RUN', { modifier: 'FAST', modifiers: ['HERE'], modals: ['MUST'] })).toBe('il gatto deve correre velocemente qui.');
    expect(cat('EAT', { modifier: 'FAST', modifiers: ['HERE'], tense: 'past', aspect: 'resultative' }, mouse))
      .toBe('il gatto aveva mangiato velocemente il topo qui.');
    expect(relative({ verb: 'EAT', modifier: 'FAST', modifiers: ['HERE'] })).toBe('il gatto che mangia velocemente il topo qui corre.');
  });

  test('frequency + place, and all three', () => {
    expect(cat('RUN', { modifier: 'OFTEN', modifiers: ['HERE'] })).toBe('il gatto corre spesso qui.');
    expect(cat('RUN', { modifier: 'OFTEN', modifiers: ['HERE'], tense: 'past', aspect: 'resultative' })).toBe('il gatto aveva spesso corso qui.');
    // The place adverb stands where a locative does, ahead of it.
    expect(cat('EAT', { modifier: 'OFTEN', modifiers: ['HERE'] }, { ...mouse, complements: { locative: { phrase: np('HOUSE') } } }))
      .toBe('il gatto mangia spesso il topo qui nella casa.');
    expect(cat('RUN', { modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] })).toBe('il gatto corre spesso velocemente qui.');
    expect(cat('MOVE', { modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] }, { directObject: np('BOOK') }))
      .toBe('il gatto sposta spesso velocemente il libro qui.');
    expect(relative({ verb: 'EAT', modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] }))
      .toBe('il gatto che mangia spesso velocemente il topo qui corre.');
  });

  test('direction + place, and direction + manner', () => {
    expect(cat('RUN', { modifier: 'UP', modifiers: ['HERE'] })).toBe('il gatto corre su qui.');
    expect(cat('MOVE', { modifier: 'DOWN', modifiers: ['THERE'], tense: 'past', aspect: 'resultative' }, { directObject: np('BOOK') }))
      .toBe('il gatto aveva spostato il libro giù lì.');
    // The manner adverb keeps its slot before the object; the direction one follows the object.
    expect(cat('MOVE', { modifier: 'UP', modifiers: ['FAST'] }, { directObject: np('BOOK') })).toBe('il gatto sposta velocemente il libro su.');
  });

  test('frequency + frequency', () => {
    expect(cat('RUN', { modifier: 'ALREADY', modifiers: ['OFTEN'] })).toBe('il gatto corre già spesso.');
    expect(cat('RUN', { modifier: 'ALREADY', modifiers: ['OFTEN'], tense: 'past', aspect: 'resultative' })).toBe('il gatto aveva già spesso corso.');
    expect(cat('RUN', { modifier: 'ALREADY', modifiers: ['OFTEN'], modals: ['MUST'] })).toBe('il gatto deve correre già spesso.');
  });

  test('manner + manner', () => {
    expect(cat('RUN', { modifier: 'SLOWLY', modifiers: ['WELL'] })).toBe('il gatto corre lentamente bene.');
    expect(cat('MOVE', { modifier: 'WELL', modifiers: ['SLOWLY'], aspect: 'resultative' }, { directObject: np('BOOK') }))
      .toBe('il gatto ha spostato bene lentamente il libro.');
  });

  test('negative + manner', () => {
    expect(cat('RUN', { modifier: 'NEVER', modifiers: ['FAST'] })).toBe('il gatto non corre mai velocemente.');
    expect(cat('RUN', { modifier: 'NEVER', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' })).toBe('il gatto non aveva mai corso velocemente.');
    expect(cat('EAT', { modifier: 'NEVER', modifiers: ['FAST', 'HERE'] }, mouse)).toBe('il gatto non mangia mai velocemente il topo qui.');
    expect(relative({ verb: 'EAT', modifier: 'NEVER', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' }))
      .toBe('il gatto che non aveva mai mangiato velocemente il topo corre.');
  });

  test('sentence + frequency', () => {
    expect(cat('RUN', { modifier: 'MAYBE', modifiers: ['OFTEN'] })).toBe('forse il gatto corre spesso.');
    expect(cat('EAT', { modifier: 'MAYBE', modifiers: ['OFTEN'], negative: true }, mouse)).toBe('forse il gatto non mangia spesso il topo.');
    const says = (verbPhrase: Partial<VerbPhrase>) =>
      italian(clause(np('DOG'), 'SAY', { contentObject: clause(np('CAT'), 'EAT', { ...mouse, verbPhrase }) as PhrasePlan['contentObject'] }));
    expect(says({ modifier: 'MAYBE', modifiers: ['OFTEN'] })).toBe('il cane dice che il gatto mangia forse spesso il topo.');
    // Leading its negator, the sentence adverb leaves the rest inside the negation, after the verb.
    expect(says({ modifier: 'MAYBE', modifiers: ['OFTEN', 'FAST'], negative: true }))
      .toBe('il cane dice che il gatto forse non mangia spesso velocemente il topo.');
  });

  test('the passive, a question, a command and the infinitive', () => {
    const eaten = (verbPhrase: Partial<VerbPhrase>) =>
      italian(clause(np('DOG'), 'EAT', { ...mouse, verbPhrase: { voice: 'passive', ...verbPhrase } }));
    expect(eaten({ modifier: 'OFTEN', modifiers: ['WELL'] })).toBe('il topo è spesso mangiato bene dal cane.');
    expect(eaten({ modifier: 'OFTEN', modifiers: ['WELL', 'HERE'], tense: 'past', aspect: 'resultative' }))
      .toBe('il topo era spesso stato mangiato bene dal cane qui.');
    expect(italian({ ...clause(np('CAT'), 'EAT', { ...mouse, verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST'] } }), interrogative: true }))
      .toBe('il gatto mangia spesso velocemente il topo?');
    const you = (verbPhrase: Partial<VerbPhrase>, extra: Partial<PhrasePlan>) =>
      italian({ ...clause(np('SECOND_PERSON'), 'EAT', { verbPhrase }), ...extra });
    expect(you({ modifier: 'NEVER', modifiers: ['FAST'] }, { imperative: true })).toBe('non mangiare mai velocemente.');
    expect(you({ modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] }, { imperative: true, ...mouse })).toBe('mangia spesso velocemente il topo qui.');
    expect(you({ modifier: 'OFTEN', modifiers: ['FAST'] }, { infinitive: true, ...mouse })).toBe('mangiare spesso velocemente il topo.');
  });
});
