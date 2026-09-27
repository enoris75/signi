import { describe, expect, test } from 'vitest';
import { AFRICA, AIGUA, CASA, EUROPA, GAT, HISTORIA, HOME, LLIBRE } from './ca.fixtures.js';
import { caSurface } from './caSurface.js';
import { nounPhrase } from './nounPhrase.js';

const say = (...args: Parameters<typeof nounPhrase>) => caSurface(nounPhrase(...args));

describe('nounPhrase', () => {
  test('the determiner, then the noun', () => {
    expect(say(GAT)).toBe('el gat');
    expect(say({ ...CASA, number: 'plural' })).toBe('les cases');
    expect(say({ ...GAT, definiteness: 'indefinite' })).toBe('un gat');
    expect(say({ ...GAT, definiteness: 'bare', number: 'plural' })).toBe('gats');
  });

  test('the article elides before a vowel, but not before a no_elision noun', () => {
    expect(say(HOME)).toBe("l'home");
    expect(say(AIGUA)).toBe("l'aigua");
    expect(say(HISTORIA)).toBe('la història');
    expect(say({ ...HOME, number: 'plural' })).toBe('els homes');
  });

  test('a cardinal between the determiner and the noun, agreeing at one and two', () => {
    expect(say({ ...CASA, number: 'plural', numeral: '2', definiteness: 'bare' })).toBe('dues cases');
    expect(say({ ...GAT, number: 'plural', numeral: '3', definiteness: 'definite' })).toBe('els tres gats');
  });

  test('a pronominal possessive rides on the definite article', () => {
    expect(say(GAT, undefined, 'meu')).toBe('el meu gat');
    expect(say(CASA, undefined, 'meva')).toBe('la meva casa');
    expect(say({ ...GAT, number: 'plural', definiteness: 'all' }, undefined, 'meus')).toBe('tots els meus gats');
    expect(say({ ...GAT, number: 'plural', definiteness: 'most' }, undefined, 'meus')).toBe('la majoria dels meus gats');
  });

  test('beside a determiner of the head\'s own, the possessive follows the noun', () => {
    expect(say({ ...LLIBRE, definiteness: 'this' }, undefined, 'meu')).toBe('aquest llibre meu');
    expect(say({ ...LLIBRE, definiteness: 'indefinite' }, undefined, 'meu')).toBe('un llibre meu');
  });

  test('place names go bare unless articled', () => {
    expect(say(EUROPA)).toBe('Europa');
    expect(say(AFRICA)).toBe("l'Àfrica");
    expect(say(EUROPA, { pre: '', post: 'antiga' })).toBe("l'Europa antiga");
  });
});
