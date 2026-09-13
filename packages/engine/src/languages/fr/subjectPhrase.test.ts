import { describe, expect, test } from 'vitest';
import { CHAT, concept, EUROPE, GRAND, HOMME, IL, JE, MANGER, np, ON, SOURIS, TU, vp } from './fr.fixtures.js';
import { subjectPhrase } from './subjectPhrase.js';

describe('subjectPhrase', () => {
  test('a pronoun takes its subject form, the plural one when plural', () => {
    expect(subjectPhrase(np(JE))).toBe('je');
    expect(subjectPhrase(np(JE, { number: 'plural' }))).toBe('nous');
    expect(subjectPhrase(np(TU, { number: 'plural' }))).toBe('vous');
    expect(subjectPhrase(np(IL, { number: 'plural' }))).toBe('ils');
    expect(subjectPhrase(np(ON))).toBe('on');
  });

  // The translator selects the gendered surface onto base/plural before the engine sees it.
  test('a pronoun reads the surface the translator selected', () => {
    expect(subjectPhrase(np(IL, { gender: 'fem', base: 'elle' }))).toBe('elle');
    expect(subjectPhrase(np(IL, { gender: 'fem', number: 'plural', base: 'elles', plural: 'elles' }))).toBe('elles');
  });

  test('a noun takes the determiner its forms carry', () => {
    expect(subjectPhrase(np(CHAT))).toBe('le chat');
    expect(subjectPhrase(np(CHAT, { definiteness: 'indefinite' }))).toBe('un chat');
    expect(subjectPhrase(np(HOMME, { definiteness: 'this' }))).toBe('cet homme');
    expect(subjectPhrase(np(SOURIS, { definiteness: 'no' }))).toBe('aucune souris');
    expect(subjectPhrase(np(CHAT, { definiteness: 'many', number: 'plural' }))).toBe('beaucoup de chats');
    expect(subjectPhrase(np(EUROPE))).toBe("l'Europe");
  });

  test('a noun keeps its adjectives and relative clause', () => {
    expect(subjectPhrase(np(CHAT, { definiteness: 'indefinite' }, { adjectives: [concept(GRAND, 'BIG')] }))).toBe('un grand chat');
    expect(subjectPhrase(np(CHAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(MANGER) } }))).toBe('le chat qui mange');
  });
});
