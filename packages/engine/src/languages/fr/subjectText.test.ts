import { describe, expect, test } from 'vitest';
import { CHAT, CHIEN, concept, el, GRAND, group, IL, JE, np, SOURIS, TU } from './fr.fixtures.js';
import { subjectText } from './subjectText.js';

describe('subjectText', () => {
  test('a single subject renders on its own', () => {
    expect(subjectText(el(np(CHAT, { definiteness: 'indefinite' }, { adjectives: [concept(GRAND, 'BIG')] })))).toBe('un grand chat');
    expect(subjectText(el(np(JE)))).toBe('je');
    expect(subjectText(el(np(TU, { number: 'plural' })))).toBe('vous');
  });

  test('coordinated nouns each keep their own article', () => {
    expect(subjectText(el(np(CHAT), np(CHIEN), np(SOURIS)))).toBe('le chat, le chien et la souris');
    expect(subjectText(group('or', np(CHAT), np(CHIEN)))).toBe('le chat ou le chien');
  });

  // "*je et le chat mangeons" is not French: the tonic form, resumed by the subject clitic.
  test('a coordinated pronoun takes its tonic form, and a 1st or 2nd person group is resumed', () => {
    expect(subjectText(el(np(JE), np(CHAT)))).toBe('moi et le chat, nous');
    expect(subjectText(el(np(CHAT), np(JE)))).toBe('le chat et moi, nous');
    expect(subjectText(el(np(TU), np(CHAT)))).toBe('toi et le chat, vous');
    expect(subjectText(el(np(JE), np(TU)))).toBe('moi et toi, nous');
  });

  // A349: the resumption is the clause's; a verbless period (the vocative) writes the group alone.
  test('without resume, a 1st or 2nd person group is not resumed', () => {
    expect(subjectText(el(np(TU), np(CHAT)), false)).toBe('toi et le chat');
    expect(subjectText(group('or', np(CHAT), np(JE)), false)).toBe('le chat ou moi');
    expect(subjectText(el(np(TU)), false)).toBe('tu');
  });

  test('a 3rd person group takes the tonic form without resumption', () => {
    expect(subjectText(el(np(IL), np(CHAT)))).toBe('lui et le chat');
    expect(subjectText(el(np(IL, { gender: 'fem', base: 'elle', disjunctive: 'elle' }), np(CHIEN)))).toBe('elle et le chien');
    expect(subjectText(el(np(IL, { number: 'plural', base: 'ils', disjunctive: 'eux' }), np(CHAT)))).toBe('eux et le chat');
  });
});
