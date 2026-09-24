import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from './types.js';
import {
  dativePronounDe, disjunctiveFr, KEPT_BESIDE_POSSESSIVE, keptBesidePossessive, possessiveDe, possessiveEn, possessiveEnIndependent,
  possessiveEs, possessiveEsStressed, possessiveFr, possessiveIt, possessiveJa, possessivePt, pronounPossessor,
} from './possessive.js';

const possessor = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular', gender?: 'masc' | 'fem' | 'neut'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number, ...(gender ? { gender } : {}) });
const MASC_SG = { gender: 'masc', number: 'singular' } as const;
const FEM_SG = { gender: 'fem', number: 'singular' } as const;
const MASC_PL = { gender: 'masc', number: 'plural' } as const;
const FEM_PL = { gender: 'fem', number: 'plural' } as const;
const NEUT_SG = { gender: 'neut', number: 'singular' } as const;

describe('pronounPossessor', () => {
  test('carries the pronoun\'s person, number and gender', () => {
    expect(pronounPossessor({ base: 'je', person: '1', number: 'singular' })).toEqual({ kind: 'pronominal', person: '1', number: 'singular' });
    expect(pronounPossessor({ base: 'vous', person: '2', number: 'plural' })).toEqual({ kind: 'pronominal', person: '2', number: 'plural' });
    expect(pronounPossessor({ base: 'sie', person: '3', number: 'singular', gender: 'fem' }))
      .toEqual({ kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' });
  });

  test('reads any other person as the 3rd, a missing number as singular, and drops an unknown gender', () => {
    expect(pronounPossessor({ base: 'x', person: '4', gender: 'common' })).toEqual({ kind: 'pronominal', person: '3', number: 'singular' });
    expect(pronounPossessor({})).toEqual({ kind: 'pronominal', person: '3', number: 'singular' });
  });
});

describe('possessiveEn', () => {
  test('splits only the 3rd singular, on the antecedent\'s gender', () => {
    expect(possessiveEn(possessor('3', 'singular', 'masc'))).toBe('his');
    expect(possessiveEn(possessor('3', 'singular', 'fem'))).toBe('her');
    expect(possessiveEn(possessor('3', 'singular', 'neut'))).toBe('its');
    expect(possessiveEn(possessor('3'))).toBe('his');
  });

  test('every other person has one form', () => {
    expect(possessiveEn(possessor('1'))).toBe('my');
    expect(possessiveEn(possessor('2', 'singular', 'fem'))).toBe('your');
    expect(possessiveEn(possessor('1', 'plural'))).toBe('our');
    expect(possessiveEn(possessor('2', 'plural'))).toBe('your');
    expect(possessiveEn(possessor('3', 'plural', 'fem'))).toBe('their');
  });
});

// A187: the forms each language needs once the head keeps a determiner of its own.
describe('the determiners a possessive stands beside', () => {
  // A277 moved `indefinite` across: "a friend of mine", not "my friend".
  test('are the demonstratives, the quantifiers and the indefinite, but not all/definite/bare', () => {
    for (const d of ['this', 'that', 'some', 'many', 'few', 'no', 'indefinite']) expect(KEPT_BESIDE_POSSESSIVE.has(d)).toBe(true);
    for (const d of ['definite', 'bare', 'all']) expect(KEPT_BESIDE_POSSESSIVE.has(d)).toBe(false);
    // A314: `most` is a partitive whose article the possessive fills.
    expect(KEPT_BESIDE_POSSESSIVE.has('most')).toBe(false);
  });

  // A329: a head left bare by a dropped indefinite keeps its (empty) slot; a bare head the plan
  // asked for gives it to the possessive.
  test('keptBesidePossessive also takes a bare head whose indefinite gave way', () => {
    expect(keptBesidePossessive({ definiteness: 'this' })).toBe(true);
    expect(keptBesidePossessive({ definiteness: 'bare', indefinite_dropped: '1', numeral: '2' })).toBe(true);
    expect(keptBesidePossessive({ definiteness: 'bare' })).toBe(false);
    expect(keptBesidePossessive({ definiteness: 'definite', indefinite_dropped: '1' })).toBe(false);
    expect(keptBesidePossessive({})).toBe(false);
  });
});

describe('possessiveEnIndependent', () => {
  test('is the standalone form, the 3rd singular splitting on the antecedent\'s gender', () => {
    expect(possessiveEnIndependent(possessor('3', 'singular', 'fem'))).toBe('hers');
    expect(possessiveEnIndependent(possessor('3', 'singular', 'masc'))).toBe('his');
    expect(possessiveEnIndependent(possessor('3', 'singular', 'neut'))).toBe('its');
    expect(possessiveEnIndependent(possessor('1'))).toBe('mine');
    expect(possessiveEnIndependent(possessor('2'))).toBe('yours');
    expect(possessiveEnIndependent(possessor('1', 'plural'))).toBe('ours');
    expect(possessiveEnIndependent(possessor('2', 'plural'))).toBe('yours');
    expect(possessiveEnIndependent(possessor('3', 'plural'))).toBe('theirs');
  });
});

describe('disjunctiveFr', () => {
  test('carries the antecedent\'s features, the 3rd person gendering in both numbers', () => {
    expect(disjunctiveFr(possessor('1'))).toBe('moi');
    expect(disjunctiveFr(possessor('2'))).toBe('toi');
    expect(disjunctiveFr(possessor('3', 'singular', 'fem'))).toBe('elle');
    expect(disjunctiveFr(possessor('3', 'singular', 'masc'))).toBe('lui');
    expect(disjunctiveFr(possessor('3'))).toBe('lui');
    expect(disjunctiveFr(possessor('1', 'plural'))).toBe('nous');
    expect(disjunctiveFr(possessor('2', 'plural'))).toBe('vous');
    expect(disjunctiveFr(possessor('3', 'plural', 'fem'))).toBe('elles');
    expect(disjunctiveFr(possessor('3', 'plural'))).toBe('eux');
  });
});

describe('dativePronounDe', () => {
  test('is the dative personal pronoun, the 3rd singular splitting on gender', () => {
    expect(dativePronounDe(possessor('1'))).toBe('mir');
    expect(dativePronounDe(possessor('2'))).toBe('dir');
    expect(dativePronounDe(possessor('3', 'singular', 'fem'))).toBe('ihr');
    expect(dativePronounDe(possessor('3', 'singular', 'masc'))).toBe('ihm');
    expect(dativePronounDe(possessor('3', 'singular', 'neut'))).toBe('ihm');
    expect(dativePronounDe(possessor('1', 'plural'))).toBe('uns');
    expect(dativePronounDe(possessor('2', 'plural'))).toBe('euch');
    expect(dativePronounDe(possessor('3', 'plural'))).toBe('ihnen');
  });
});

describe('possessiveEsStressed', () => {
  test('maps a prenominal possessive to its stressed paradigm, agreeing in gender and number', () => {
    expect([MASC_SG, FEM_SG, MASC_PL, FEM_PL].map((a) => possessiveEsStressed('mi', a))).toEqual(['mío', 'mía', 'míos', 'mías']);
    expect(possessiveEsStressed('mis', FEM_SG)).toBe('mía'); // the plural prenominal, the same paradigm
    expect(possessiveEsStressed('tu', MASC_PL)).toBe('tuyos');
    expect(possessiveEsStressed('sus', FEM_SG)).toBe('suya');
  });

  test('nuestro and vuestro are already stressed, and agree as they did', () => {
    expect(possessiveEsStressed('nuestra', MASC_PL)).toBe('nuestros');
    expect(possessiveEsStressed('vuestros', FEM_SG)).toBe('vuestra');
  });
});

describe('possessiveIt', () => {
  test('agrees with the possessed in gender and number', () => {
    expect([MASC_SG, FEM_SG, MASC_PL, FEM_PL].map((a) => possessiveIt(possessor('1'), a))).toEqual(['mio', 'mia', 'miei', 'mie']);
    expect(possessiveIt(possessor('3', 'singular', 'fem'), MASC_PL)).toBe('suoi');
    expect(possessiveIt(possessor('2', 'plural'), FEM_SG)).toBe('vostra');
  });

  test('loro is invariable', () => {
    expect(possessiveIt(possessor('3', 'plural'), MASC_SG)).toBe('loro');
    expect(possessiveIt(possessor('3', 'plural'), FEM_PL)).toBe('loro');
  });
});

describe('possessiveFr', () => {
  test('splits masculine and feminine in the singular, not in the plural', () => {
    expect(possessiveFr(possessor('3'), MASC_SG, false)).toBe('son');
    expect(possessiveFr(possessor('3'), FEM_SG, false)).toBe('sa');
    expect(possessiveFr(possessor('3'), FEM_PL, false)).toBe('ses');
    expect(possessiveFr(possessor('1', 'plural'), FEM_SG, false)).toBe('notre');
    expect(possessiveFr(possessor('3', 'plural'), MASC_PL, false)).toBe('leurs');
  });

  test('a vowel-initial feminine takes the masculine form', () => {
    expect(possessiveFr(possessor('1'), FEM_SG, true)).toBe('mon');
    expect(possessiveFr(possessor('2'), FEM_PL, true)).toBe('tes');
  });
});

describe('possessiveEs', () => {
  test('mi / tu / su agree in number only', () => {
    expect(possessiveEs(possessor('1'), FEM_SG)).toBe('mi');
    expect(possessiveEs(possessor('2'), MASC_PL)).toBe('tus');
    expect(possessiveEs(possessor('3', 'plural'), FEM_PL)).toBe('sus');
  });

  test('nuestro / vuestro agree in gender and number', () => {
    expect([MASC_SG, FEM_SG, MASC_PL, FEM_PL].map((a) => possessiveEs(possessor('1', 'plural'), a)))
      .toEqual(['nuestro', 'nuestra', 'nuestros', 'nuestras']);
    expect(possessiveEs(possessor('2', 'plural'), FEM_SG)).toBe('vuestra');
  });
});

describe('possessivePt', () => {
  test('agrees with the possessed, the 2nd and 3rd persons alike taking seu', () => {
    expect([MASC_SG, FEM_SG, MASC_PL, FEM_PL].map((a) => possessivePt(possessor('1'), a))).toEqual(['meu', 'minha', 'meus', 'minhas']);
    expect(possessivePt(possessor('2'), FEM_SG)).toBe('sua');
    expect(possessivePt(possessor('3', 'singular', 'fem'), MASC_PL)).toBe('seus');
    expect(possessivePt(possessor('1', 'plural'), FEM_PL)).toBe('nossas');
  });
});

describe('possessiveDe', () => {
  test('declines the stem like ein for the possessed head\'s case, gender and number', () => {
    expect(possessiveDe(possessor('1'), 'nom', MASC_SG)).toBe('mein');
    expect(possessiveDe(possessor('1'), 'acc', MASC_SG)).toBe('meinen');
    expect(possessiveDe(possessor('2'), 'dat', NEUT_SG)).toBe('deinem');
    expect(possessiveDe(possessor('1', 'plural'), 'acc', FEM_PL)).toBe('unsere');
    expect(possessiveDe(possessor('3', 'plural'), 'gen', MASC_SG)).toBe('ihres');
  });

  test('the 3rd singular is sein, or ihr for a feminine antecedent', () => {
    expect(possessiveDe(possessor('3', 'singular', 'neut'), 'nom', FEM_SG)).toBe('seine');
    expect(possessiveDe(possessor('3', 'singular', 'fem'), 'dat', FEM_SG)).toBe('ihrer');
  });

  test('euer drops its -e- before an ending', () => {
    expect(possessiveDe(possessor('2', 'plural'), 'nom', MASC_SG)).toBe('euer');
    expect(possessiveDe(possessor('2', 'plural'), 'nom', FEM_SG)).toBe('eure');
  });
});

describe('possessiveJa', () => {
  test('is the antecedent pronoun + の, its 3rd person split on gender', () => {
    expect(possessiveJa(possessor('1'))).toEqual([{ t: '私', r: 'わたし' }, { t: 'の' }]);
    expect(possessiveJa(possessor('3', 'singular', 'masc'))).toEqual([{ t: '彼', r: 'かれ' }, { t: 'の' }]);
    expect(possessiveJa(possessor('3', 'singular', 'fem'))).toEqual([{ t: '彼女', r: 'かのじょ' }, { t: 'の' }]);
    expect(possessiveJa(possessor('3', 'plural'))).toEqual([{ t: '彼ら', r: 'かれら' }, { t: 'の' }]);
    // A161. The feminine plural has its own surface and reading, like the feminine singular; the
    // masculine and mixed plural keep 彼ら.
    expect(possessiveJa(possessor('3', 'plural', 'fem'))).toEqual([{ t: '彼女ら', r: 'かのじょら' }, { t: 'の' }]);
    expect(possessiveJa(possessor('3', 'plural', 'masc'))).toEqual([{ t: '彼ら', r: 'かれら' }, { t: 'の' }]);
  });

  // A201. それ is the one pronoun of the ten whose adnominal is suppletive: この / その / あの is the
  // whole of that series, and それの is not the possessive determiner. The plural それら is regular
  // again, so it takes the shared の. Both are kana and carry no reading.
  test('the neuter singular is the suppletive その, and the neuter plural それらの', () => {
    expect(possessiveJa(possessor('3', 'singular', 'neut'))).toEqual([{ t: 'その' }]);
    expect(possessiveJa(possessor('3', 'plural', 'neut'))).toEqual([{ t: 'それら' }, { t: 'の' }]);
  });
});
