import { describe, expect, test } from 'vitest';
import { agreeAdjFr } from './agreeAdjFr.js';

describe('agreeAdjFr', () => {
  test('the default adds -e for the feminine and -s for the plural', () => {
    expect(agreeAdjFr('grand', 'masc', false)).toBe('grand');
    expect(agreeAdjFr('grand', 'fem', false)).toBe('grande');
    expect(agreeAdjFr('grand', 'masc', true)).toBe('grands');
    expect(agreeAdjFr('grand', 'fem', true)).toBe('grandes');
    expect(agreeAdjFr('fatigué', 'fem', true)).toBe('fatiguées');
  });

  test('an adjective already ending in -e is invariable in gender', () => {
    expect(agreeAdjFr('triste', 'fem', false)).toBe('triste');
    expect(agreeAdjFr('rapide', 'fem', true)).toBe('rapides');
    expect(agreeAdjFr('jeune', 'masc', true)).toBe('jeunes');
  });

  test('-eux → -euse, and the masculine plural is invariable', () => {
    expect(agreeAdjFr('heureux', 'fem', false)).toBe('heureuse');
    expect(agreeAdjFr('paresseux', 'fem', true)).toBe('paresseuses');
    expect(agreeAdjFr('heureux', 'masc', true)).toBe('heureux');
  });

  test('another -x → -se', () => {
    expect(agreeAdjFr('jaloux', 'fem', false)).toBe('jalouse');
    expect(agreeAdjFr('jaloux', 'masc', true)).toBe('jaloux');
  });

  test('-f → -ve', () => {
    expect(agreeAdjFr('négatif', 'fem', false)).toBe('négative');
    expect(agreeAdjFr('négatif', 'masc', true)).toBe('négatifs');
  });

  test('-er → -ère', () => {
    expect(agreeAdjFr('premier', 'fem', false)).toBe('première');
    expect(agreeAdjFr('entier', 'fem', true)).toBe('entières');
    expect(agreeAdjFr('premier', 'masc', true)).toBe('premiers');
  });

  test('-on and -el double the consonant in the feminine', () => {
    expect(agreeAdjFr('bon', 'fem', false)).toBe('bonne');
    expect(agreeAdjFr('bon', 'fem', true)).toBe('bonnes');
    expect(agreeAdjFr('universel', 'fem', false)).toBe('universelle');
    expect(agreeAdjFr('universel', 'masc', true)).toBe('universels');
  });

  test('a masculine in -s is invariable in the plural', () => {
    expect(agreeAdjFr('mauvais', 'masc', true)).toBe('mauvais');
    expect(agreeAdjFr('mauvais', 'fem', true)).toBe('mauvaises');
  });

  test('-al → -aux in the masculine plural only', () => {
    expect(agreeAdjFr('proximal', 'masc', true)).toBe('proximaux');
    expect(agreeAdjFr('proximal', 'fem', true)).toBe('proximales');
  });

  test('the irregulars are seeded whole', () => {
    expect(agreeAdjFr('beau', 'fem', false)).toBe('belle');
    expect(agreeAdjFr('beau', 'masc', true)).toBe('beaux');
    expect(agreeAdjFr('nouveau', 'fem', true)).toBe('nouvelles');
    expect(agreeAdjFr('vieux', 'fem', false)).toBe('vieille');
    expect(agreeAdjFr('vieux', 'masc', true)).toBe('vieux');
    expect(agreeAdjFr('bas', 'fem', false)).toBe('basse');
    expect(agreeAdjFr('bas', 'masc', true)).toBe('bas');
    // YOUNGER (P11): the rule's default would give "cadete" / "cadetes".
    expect(agreeAdjFr('cadet', 'fem', false)).toBe('cadette');
    expect(agreeAdjFr('cadet', 'fem', true)).toBe('cadettes');
    expect(agreeAdjFr('cadet', 'masc', true)).toBe('cadets');
  });

  // PUBLIC (localization B88): the rule's default would give "publice" / "publices".
  test('public takes -que in the feminine', () => {
    expect(agreeAdjFr('public', 'masc', false)).toBe('public');
    expect(agreeAdjFr('public', 'fem', false)).toBe('publique');
    expect(agreeAdjFr('public', 'masc', true)).toBe('publics');
    expect(agreeAdjFr('public', 'fem', true)).toBe('publiques');
  });

  // ELDER (P11) needs no entry: -é takes the regular +e / +s, "mon frère aîné", "mes sœurs aînées".
  test('an -é adjective agrees by the default rule', () => {
    expect(agreeAdjFr('aîné', 'masc', false)).toBe('aîné');
    expect(agreeAdjFr('aîné', 'fem', false)).toBe('aînée');
    expect(agreeAdjFr('aîné', 'masc', true)).toBe('aînés');
    expect(agreeAdjFr('aîné', 'fem', true)).toBe('aînées');
  });

  test('an empty base stays empty', () => {
    expect(agreeAdjFr('', 'fem', true)).toBe('');
  });

  test('an invariable adjective keeps its base in every gender and number', () => {
    expect(agreeAdjFr('zéro', 'fem', false)).toBe('zéro');
    expect(agreeAdjFr('zéro', 'masc', true)).toBe('zéro');
    expect(agreeAdjFr('zéro', 'fem', true)).toBe('zéro');
    // A prepositional phrase standing for an adjective does not agree either.
    expect(agreeAdjFr('sans titre', 'fem', false)).toBe('sans titre');
    expect(agreeAdjFr('sans titre', 'fem', true)).toBe('sans titre');
  });
});
