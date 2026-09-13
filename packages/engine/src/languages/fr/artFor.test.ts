import { describe, expect, test } from 'vitest';
import { AFRIQUE, ANGE, ANTARCTIQUE, ARGENT, CHAT, EAU, HOMME, MAISON, NOURRITURE } from './fr.fixtures.js';
import { artFor } from './artFor.js';

describe('artFor', () => {
  test('defaults to the definite article', () => {
    expect(artFor(CHAT, false, 'chat')).toBe('le');
    expect(artFor(MAISON, true, 'maisons')).toBe('les');
    expect(artFor(ANGE, false, 'ange')).toBe("l'");
  });

  test('indefinite, bare and demonstrative', () => {
    expect(artFor({ ...MAISON, definiteness: 'indefinite' }, false, 'maison')).toBe('une');
    expect(artFor({ ...CHAT, definiteness: 'indefinite' }, true, 'chats')).toBe('des');
    expect(artFor({ ...CHAT, definiteness: 'bare' }, false, 'chat')).toBe('');
    expect(artFor({ ...HOMME, definiteness: 'this' }, false, 'homme')).toBe('cet');
    expect(artFor({ ...MAISON, definiteness: 'that' }, false, 'maison')).toBe('cette');
  });

  test('the countable quantifiers', () => {
    expect(artFor({ ...CHAT, definiteness: 'some' }, true, 'chats')).toBe('quelques');
    expect(artFor({ ...CHAT, definiteness: 'many' }, true, 'chats')).toBe('beaucoup de');
    expect(artFor({ ...CHAT, definiteness: 'few' }, true, 'chats')).toBe('peu de');
    expect(artFor({ ...CHAT, definiteness: 'no' }, false, 'chat')).toBe('aucun');
    expect(artFor({ ...MAISON, definiteness: 'no' }, false, 'maison')).toBe('aucune');
  });

  test("beaucoup/peu de elide to d' before a vowel sound", () => {
    expect(artFor({ ...ANGE, definiteness: 'many' }, true, 'anges')).toBe("beaucoup d'");
    expect(artFor({ ...HOMME, definiteness: 'few' }, true, 'hommes')).toBe("peu d'");
  });

  test('all carries the plural definite article, agreed in gender', () => {
    expect(artFor({ ...CHAT, definiteness: 'all' }, true, 'chats')).toBe('tous les');
    expect(artFor({ ...MAISON, definiteness: 'all' }, true, 'maisons')).toBe('toutes les');
    expect(artFor({ ...ANGE, definiteness: 'all' }, true, 'anges')).toBe('tous les');
  });

  test('a mass noun takes the partitive for indefinite and some', () => {
    expect(artFor({ ...EAU, definiteness: 'indefinite' }, false, 'eau')).toBe("de l'");
    expect(artFor({ ...NOURRITURE, definiteness: 'some' }, false, 'nourriture')).toBe('de la');
    expect(artFor({ ...EAU, definiteness: 'some' }, false, 'eau')).toBe("de l'");
  });

  test('a mass noun keeps the singular for the definite, demonstrative and all', () => {
    expect(artFor(NOURRITURE, false, 'nourriture')).toBe('la');
    expect(artFor({ ...ARGENT, definiteness: 'this' }, false, 'argent')).toBe('cet');
    expect(artFor({ ...EAU, definiteness: 'all' }, false, 'eau')).toBe("toute l'");
    expect(artFor({ ...ARGENT, definiteness: 'all' }, false, 'argent')).toBe("tout l'");
    expect(artFor({ ...NOURRITURE, definiteness: 'all' }, false, 'nourriture')).toBe('toute la');
  });

  test('a mass noun with the other quantifiers', () => {
    expect(artFor({ ...EAU, definiteness: 'bare' }, false, 'eau')).toBe('');
    expect(artFor({ ...EAU, definiteness: 'many' }, false, 'eau')).toBe("beaucoup d'");
    expect(artFor({ ...NOURRITURE, definiteness: 'few' }, false, 'nourriture')).toBe('peu de');
    expect(artFor({ ...EAU, definiteness: 'no' }, false, 'eau')).toBe('aucune');
    expect(artFor({ ...ARGENT, definiteness: 'no' }, false, 'argent')).toBe('aucun');
  });

  test('a proper noun takes the definite article whatever was chosen', () => {
    expect(artFor(AFRIQUE, false, 'Afrique')).toBe("l'");
    expect(artFor({ ...AFRIQUE, definiteness: 'indefinite' }, false, 'Afrique')).toBe("l'");
    expect(artFor({ ...ANTARCTIQUE, definiteness: 'this' }, false, 'Antarctique')).toBe("l'");
  });
});
