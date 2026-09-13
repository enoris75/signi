import { describe, expect, test } from 'vitest';
import { AFRICA, concept, el, GATTO, GRANDE, IO, LEI, LORO, MANGIARE, np, TOPO, UOMO, vp } from './it.fixtures.js';
import { subjectPhrase } from './subjectPhrase.js';

const BIG = concept(GRANDE, 'BIG');

describe('subjectPhrase', () => {
  test('a noun takes the determiner its forms carry', () => {
    expect(subjectPhrase(np(GATTO))).toBe('il gatto');
    expect(subjectPhrase(np(GATTO, { definiteness: 'indefinite' }))).toBe('un gatto');
    expect(subjectPhrase(np(UOMO))).toBe("l'uomo");
    expect(subjectPhrase(np(GATTO, { definiteness: 'all', number: 'plural' }))).toBe('tutti i gatti');
  });

  test('the determiner agrees with the sound of a prenominal adjective', () => {
    expect(subjectPhrase(np(UOMO, {}, { adjectives: [BIG] }))).toBe('il grande uomo');
    expect(subjectPhrase(np(UOMO, { definiteness: 'indefinite' }, { adjectives: [BIG] }))).toBe('un grande uomo');
  });

  test('a proper noun keeps its definite article whatever was chosen', () => {
    expect(subjectPhrase(np(AFRICA, { definiteness: 'indefinite' }))).toBe("l'Africa");
  });

  test('a pronoun is its bare citation form, plural when plural', () => {
    expect(subjectPhrase(np(IO))).toBe('io');
    expect(subjectPhrase(np(IO, { number: 'plural' }))).toBe('noi');
    expect(subjectPhrase(np(LEI))).toBe('lei');
    expect(subjectPhrase(np(LORO))).toBe('loro');
  });

  test('a noun keeps its relative clause', () => {
    const relative = { headRole: 'subject' as const, verbPhrase: vp(MANGIARE), directObject: el(np(TOPO)) };
    expect(subjectPhrase(np(GATTO, {}, { relative }))).toBe('il gatto che mangia il topo');
  });
});
