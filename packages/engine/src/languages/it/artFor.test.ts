import { describe, expect, test } from 'vitest';
import { ACQUA, AFRICA, ALA, CASA, CIBO, GATTO, SLOT, SPAGNOLO, UOMO } from './it.fixtures.js';
import { artFor } from './artFor.js';

describe('artFor', () => {
  test('defaults to the definite article', () => {
    expect(artFor(GATTO, false, 'gatto')).toBe('il');
    expect(artFor({ ...UOMO, definiteness: 'definite' }, true, 'uomini')).toBe('gli');
  });

  test("indefinite: un / uno / una / un' in the singular, bare in the plural", () => {
    expect(artFor({ ...SLOT, definiteness: 'indefinite' }, false, 'slot')).toBe('uno');
    expect(artFor({ ...ALA, definiteness: 'indefinite' }, false, 'ala')).toBe("un'");
    expect(artFor({ ...GATTO, definiteness: 'indefinite' }, true, 'gatti')).toBe('');
  });

  test('bare takes no determiner', () => {
    expect(artFor({ ...CASA, definiteness: 'bare' }, false, 'casa')).toBe('');
  });

  test('demonstratives agree and elide', () => {
    expect(artFor({ ...UOMO, definiteness: 'this' }, false, 'uomo')).toBe("quest'");
    expect(artFor({ ...CASA, definiteness: 'this' }, true, 'case')).toBe('queste');
    expect(artFor({ ...UOMO, definiteness: 'that' }, true, 'uomini')).toBe('quegli');
    expect(artFor({ ...GATTO, definiteness: 'that' }, false, 'gatto')).toBe('quel');
  });

  test('plural quantifiers agree in gender', () => {
    expect(artFor({ ...GATTO, definiteness: 'some' }, true, 'gatti')).toBe('alcuni');
    expect(artFor({ ...CASA, definiteness: 'some' }, true, 'case')).toBe('alcune');
    expect(artFor({ ...GATTO, definiteness: 'many' }, true, 'gatti')).toBe('molti');
    expect(artFor({ ...CASA, definiteness: 'many' }, true, 'case')).toBe('molte');
    expect(artFor({ ...GATTO, definiteness: 'few' }, true, 'gatti')).toBe('pochi');
    expect(artFor({ ...CASA, definiteness: 'few' }, true, 'case')).toBe('poche');
  });

  test('all carries the plural definite article: tutti i / tutti gli / tutte le', () => {
    expect(artFor({ ...GATTO, definiteness: 'all' }, true, 'gatti')).toBe('tutti i');
    expect(artFor({ ...UOMO, definiteness: 'all' }, true, 'uomini')).toBe('tutti gli');
    expect(artFor({ ...CASA, definiteness: 'all' }, true, 'case')).toBe('tutte le');
  });

  test('no takes nessun-, whatever the number', () => {
    expect(artFor({ ...GATTO, definiteness: 'no' }, false, 'gatto')).toBe('nessun');
    expect(artFor({ ...SLOT, definiteness: 'no' }, false, 'slot')).toBe('nessuno');
    expect(artFor({ ...ALA, definiteness: 'no' }, false, 'ala')).toBe("nessun'");
  });

  test('a proper name always takes the definite article, whatever was picked', () => {
    expect(artFor(AFRICA, false, 'Africa')).toBe("l'");
    expect(artFor({ ...AFRICA, definiteness: 'indefinite' }, false, 'Africa')).toBe("l'");
    expect(artFor({ ...AFRICA, definiteness: 'bare' }, false, 'Africa')).toBe("l'");
  });

  describe('mass nouns', () => {
    test('stay singular under the definite article', () => {
      expect(artFor(ACQUA, true, 'acqua')).toBe("l'");
      expect(artFor(CIBO, false, 'cibo')).toBe('il');
    });

    test('indefinite and bare both go bare: bevo acqua', () => {
      expect(artFor({ ...ACQUA, definiteness: 'indefinite' }, false, 'acqua')).toBe('');
      expect(artFor({ ...ACQUA, definiteness: 'bare' }, false, 'acqua')).toBe('');
    });

    test("some is the partitive di + article: dell'acqua, del cibo, dello spagnolo", () => {
      expect(artFor({ ...ACQUA, definiteness: 'some' }, false, 'acqua')).toBe("dell'");
      expect(artFor({ ...CIBO, definiteness: 'some' }, false, 'cibo')).toBe('del');
      expect(artFor({ ...SPAGNOLO, definiteness: 'some' }, false, 'spagnolo')).toBe('dello');
    });

    test('many / few / all take the singular quantifiers', () => {
      expect(artFor({ ...ACQUA, definiteness: 'many' }, false, 'acqua')).toBe('molta');
      expect(artFor({ ...CIBO, definiteness: 'many' }, false, 'cibo')).toBe('molto');
      expect(artFor({ ...ACQUA, definiteness: 'few' }, false, 'acqua')).toBe('poca');
      expect(artFor({ ...CIBO, definiteness: 'few' }, false, 'cibo')).toBe('poco');
      expect(artFor({ ...ACQUA, definiteness: 'all' }, false, 'acqua')).toBe("tutta l'");
      expect(artFor({ ...CIBO, definiteness: 'all' }, false, 'cibo')).toBe('tutto il');
    });

    test('demonstratives and no stay singular', () => {
      expect(artFor({ ...ACQUA, definiteness: 'this' }, false, 'acqua')).toBe("quest'");
      expect(artFor({ ...CIBO, definiteness: 'that' }, false, 'cibo')).toBe('quel');
      expect(artFor({ ...SPAGNOLO, definiteness: 'no' }, false, 'spagnolo')).toBe('nessuno');
    });
  });
});
