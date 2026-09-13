import { describe, expect, test } from 'vitest';
import { BUCH, EUROPA, KATER, KATZE, SCHWEIZ, WASSER } from './de.fixtures.js';
import { determiner } from './determiner.js';

describe('determiner', () => {
  test('defaults to the definite article, declined for case', () => {
    expect(determiner(KATER, 'nom', false)).toBe('der');
    expect(determiner(KATER, 'acc', false)).toBe('den');
    expect(determiner(KATER, 'dat', false)).toBe('dem');
    expect(determiner(KATER, 'gen', false)).toBe('des');
    expect(determiner(KATZE, 'gen', false)).toBe('der');
  });

  test('indefinite: ein- in the singular, nothing in the plural', () => {
    expect(determiner({ ...KATER, definiteness: 'indefinite' }, 'acc', false)).toBe('einen');
    expect(determiner({ ...KATZE, definiteness: 'indefinite' }, 'dat', false)).toBe('einer');
    expect(determiner({ ...BUCH, definiteness: 'indefinite' }, 'nom', true)).toBe('');
  });

  test('bare takes no determiner', () => {
    expect(determiner({ ...BUCH, definiteness: 'bare' }, 'nom', false)).toBe('');
  });

  test('demonstratives and kein-', () => {
    expect(determiner({ ...KATER, definiteness: 'this' }, 'nom', false)).toBe('dieser');
    expect(determiner({ ...BUCH, definiteness: 'that' }, 'dat', true)).toBe('jenen');
    expect(determiner({ ...KATZE, definiteness: 'no' }, 'acc', false)).toBe('keine');
    expect(determiner({ ...BUCH, definiteness: 'no' }, 'gen', true)).toBe('keiner');
  });

  test('plural quantifiers add -n in the dative and -r in the genitive', () => {
    const cases = [
      ['some', 'einige', 'einigen', 'einiger'],
      ['many', 'viele', 'vielen', 'vieler'],
      ['few', 'wenige', 'wenigen', 'weniger'],
      ['all', 'alle', 'allen', 'aller'],
    ] as const;
    for (const [definiteness, nom, dat, gen] of cases) {
      const forms = { ...BUCH, definiteness };
      expect(determiner(forms, 'nom', true)).toBe(nom);
      expect(determiner(forms, 'dat', true)).toBe(dat);
      expect(determiner(forms, 'gen', true)).toBe(gen);
    }
  });

  test('a mass noun takes the invariant mass quantifiers and no indefinite article', () => {
    expect(determiner({ ...WASSER, definiteness: 'indefinite' }, 'acc', false)).toBe('');
    expect(determiner({ ...WASSER, definiteness: 'some' }, 'acc', false)).toBe('etwas');
    expect(determiner({ ...WASSER, definiteness: 'many' }, 'dat', false)).toBe('viel');
    expect(determiner({ ...WASSER, definiteness: 'few' }, 'nom', false)).toBe('wenig');
    expect(determiner({ ...WASSER, definiteness: 'all' }, 'dat', false)).toBe('all dem');
    expect(determiner({ ...WASSER, definiteness: 'this' }, 'nom', false)).toBe('dieses');
    expect(determiner({ ...WASSER, definiteness: 'no' }, 'acc', false)).toBe('kein');
  });

  test('a proper name goes bare whatever was chosen, unless it is inherently articled', () => {
    expect(determiner({ ...EUROPA, definiteness: 'definite' }, 'nom', false)).toBe('');
    expect(determiner({ ...EUROPA, definiteness: 'this' }, 'nom', false)).toBe('');
    expect(determiner(SCHWEIZ, 'nom', false)).toBe('die');
    expect(determiner({ ...SCHWEIZ, definiteness: 'indefinite' }, 'dat', false)).toBe('der');
  });
});
