import { describe, expect, test } from 'vitest';
import { AILE, ANGE, ANTARCTIQUE, ARGENT, concept, EAU, EUROPE, HOMME, MAISON, MOT, np, NOURRITURE, PETIT, SOIN } from './fr.fixtures.js';
import { npText } from './npText.js';

describe('npText', () => {
  test('defaults to the definite article, eliding before a vowel sound', () => {
    expect(npText(np(MOT))).toBe('le mot');
    expect(npText(np(MAISON))).toBe('la maison');
    expect(npText(np(AILE))).toBe("l'aile");
    expect(npText(np(HOMME))).toBe("l'homme");
    expect(npText(np(MOT, { number: 'plural' }))).toBe('les mots');
  });

  test('the indefinite keeps a plural des', () => {
    expect(npText(np(MOT, { definiteness: 'indefinite' }))).toBe('un mot');
    expect(npText(np(AILE, { definiteness: 'indefinite' }))).toBe('une aile');
    expect(npText(np(MOT, { definiteness: 'indefinite', number: 'plural' }))).toBe('des mots');
  });

  test('this and that share one demonstrative, cet before a vowel sound', () => {
    expect(npText(np(MOT, { definiteness: 'this' }))).toBe('ce mot');
    expect(npText(np(MOT, { definiteness: 'that' }))).toBe('ce mot');
    expect(npText(np(ANGE, { definiteness: 'this' }))).toBe('cet ange');
    expect(npText(np(HOMME, { definiteness: 'that' }))).toBe('cet homme');
    expect(npText(np(MAISON, { definiteness: 'this' }))).toBe('cette maison');
    expect(npText(np(MOT, { definiteness: 'this', number: 'plural' }))).toBe('ces mots');
  });

  test('the determiner is chosen on the word that follows it', () => {
    expect(npText(np(ANGE, { definiteness: 'this' }, { adjectives: [concept(PETIT, 'SMALL')] }))).toBe('ce petit ange');
    expect(npText(np(ANGE, {}, { adjectives: [concept(PETIT, 'SMALL')] }))).toBe('le petit ange');
  });

  test('quantifiers', () => {
    expect(npText(np(MOT, { definiteness: 'some', number: 'plural' }))).toBe('quelques mots');
    expect(npText(np(MOT, { definiteness: 'many', number: 'plural' }))).toBe('beaucoup de mots');
    expect(npText(np(ANGE, { definiteness: 'few', number: 'plural' }))).toBe("peu d'anges");
    expect(npText(np(MOT, { definiteness: 'all', number: 'plural' }))).toBe('tous les mots');
    expect(npText(np(MAISON, { definiteness: 'all', number: 'plural' }))).toBe('toutes les maisons');
    expect(npText(np(MOT, { definiteness: 'no' }))).toBe('aucun mot');
    expect(npText(np(MAISON, { definiteness: 'no' }))).toBe('aucune maison');
  });

  test('bare takes no determiner', () => {
    expect(npText(np(MOT, { definiteness: 'bare', number: 'plural' }))).toBe('mots');
  });

  test('a mass noun takes the partitive and singular quantifiers', () => {
    expect(npText(np(EAU, { definiteness: 'indefinite' }))).toBe("de l'eau");
    expect(npText(np(NOURRITURE, { definiteness: 'some' }))).toBe('de la nourriture');
    expect(npText(np(SOIN, { definiteness: 'some' }))).toBe('du soin');
    expect(npText(np(EAU, { definiteness: 'many' }))).toBe("beaucoup d'eau");
    expect(npText(np(NOURRITURE, { definiteness: 'few' }))).toBe('peu de nourriture');
    expect(npText(np(EAU, { definiteness: 'all' }))).toBe("toute l'eau");
    expect(npText(np(ARGENT, { definiteness: 'all' }))).toBe("tout l'argent");
    expect(npText(np(ARGENT, { definiteness: 'this' }))).toBe('cet argent');
    expect(npText(np(EAU, { definiteness: 'no' }))).toBe('aucune eau');
    expect(npText(np(NOURRITURE, { definiteness: 'bare' }))).toBe('nourriture');
  });

  test('a proper noun takes the definite article whatever was chosen', () => {
    expect(npText(np(EUROPE, { definiteness: 'indefinite' }))).toBe("l'Europe");
    expect(npText(np(ANTARCTIQUE, { definiteness: 'this' }))).toBe("l'Antarctique");
  });
});
