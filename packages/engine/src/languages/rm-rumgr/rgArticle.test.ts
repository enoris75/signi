import { describe, expect, test } from 'vitest';
import { AUA, CHASA, CHAUN, EUROPA, GIAT, NOVITADS, PAUN, PEDER, UM } from './rumgr.fixtures.js';
import { rgArticle } from './rgArticle.js';

describe('rgArticle', () => {
  test('defaults to the definite article, eliding on the lead', () => {
    expect(rgArticle(GIAT, false, 'giat')).toBe('il');
    expect(rgArticle(UM, false, 'um')).toBe("l'");
    expect(rgArticle(UM, true, 'umens')).toBe('ils');
  });

  test('indefinite: in / ina in the singular, bare in the plural', () => {
    expect(rgArticle({ ...GIAT, definiteness: 'indefinite' }, false, 'giat')).toBe('in');
    expect(rgArticle({ ...CHASA, definiteness: 'indefinite' }, false, 'chasa')).toBe('ina');
    expect(rgArticle({ ...GIAT, definiteness: 'indefinite' }, true, 'giats')).toBe('');
  });

  test('bare takes no determiner', () => {
    expect(rgArticle({ ...CHASA, definiteness: 'bare' }, false, 'chasa')).toBe('');
  });

  test('demonstratives agree', () => {
    expect(rgArticle({ ...CHAUN, definiteness: 'this' }, false, 'chaun')).toBe('quest');
    expect(rgArticle({ ...CHASA, definiteness: 'that' }, true, 'chasas')).toBe('quellas');
  });

  test('the plural quantifiers agree in gender', () => {
    expect(rgArticle({ ...CHAUN, definiteness: 'some' }, true, 'chauns')).toBe('insaquants');
    expect(rgArticle({ ...CHASA, definiteness: 'some' }, true, 'chasas')).toBe('insaquantas');
    expect(rgArticle({ ...CHAUN, definiteness: 'many' }, true, 'chauns')).toBe('blers');
    expect(rgArticle({ ...CHASA, definiteness: 'many' }, true, 'chasas')).toBe('bleras');
    expect(rgArticle({ ...CHAUN, definiteness: 'few' }, true, 'chauns')).toBe('paucs');
    expect(rgArticle({ ...CHASA, definiteness: 'few' }, true, 'chasas')).toBe('paucas');
    expect(rgArticle({ ...CHAUN, definiteness: 'several' }, true, 'chauns')).toBe('plirs');
    expect(rgArticle({ ...CHASA, definiteness: 'several' }, true, 'chasas')).toBe('pliras');
  });

  test('all and both carry the plural definite article', () => {
    expect(rgArticle({ ...CHAUN, definiteness: 'all' }, true, 'chauns')).toBe('tuts ils');
    expect(rgArticle({ ...CHASA, definiteness: 'all' }, true, 'chasas')).toBe('tuttas las');
    expect(rgArticle({ ...UM, definiteness: 'all' }, true, 'umens')).toBe('tuts ils');
    expect(rgArticle({ ...CHAUN, definiteness: 'both' }, true, 'chauns')).toBe('omadus ils');
    expect(rgArticle({ ...CHASA, definiteness: 'both' }, true, 'chasas')).toBe('omaduas las');
  });

  test('no: nagin / nagina, singular; a plurale tantum takes naginas', () => {
    expect(rgArticle({ ...CHAUN, definiteness: 'no' }, false, 'chaun')).toBe('nagin');
    expect(rgArticle({ ...CHASA, definiteness: 'no' }, false, 'chasa')).toBe('nagina');
    expect(rgArticle({ ...NOVITADS, definiteness: 'no' }, true, 'novitads')).toBe('naginas');
  });

  test('each and every share the invariant mintga', () => {
    expect(rgArticle({ ...CHAUN, definiteness: 'each' }, false, 'chaun')).toBe('mintga');
    expect(rgArticle({ ...CHASA, definiteness: 'every' }, false, 'chasa')).toBe('mintga');
  });

  test('most, enough and such', () => {
    expect(rgArticle({ ...GIAT, definiteness: 'most' }, true, 'giats')).toBe('la gronda part dals');
    expect(rgArticle({ ...CHASA, definiteness: 'most' }, true, 'chasas')).toBe('la gronda part da las');
    expect(rgArticle({ ...GIAT, definiteness: 'enough' }, true, 'giats')).toBe('avunda');
    expect(rgArticle({ ...GIAT, definiteness: 'such' }, false, 'giat')).toBe('in tal');
    expect(rgArticle({ ...CHASA, definiteness: 'such' }, false, 'chasa')).toBe('ina tala');
    expect(rgArticle({ ...GIAT, definiteness: 'such' }, true, 'giats')).toBe('tals');
    expect(rgArticle({ ...CHASA, definiteness: 'such' }, true, 'chasas')).toBe('talas');
  });

  test('a proper name takes the definite article unless its lexeme says not', () => {
    expect(rgArticle(EUROPA, false, 'Europa')).toBe("l'");
    expect(rgArticle({ ...EUROPA, definiteness: 'indefinite' }, false, 'Europa')).toBe("l'");
    expect(rgArticle(PEDER, false, 'Peder')).toBe('');
  });

  test('the approximator stands before the determiner it approximates, and only one', () => {
    expect(rgArticle({ ...CHAUN, definiteness: 'all', approximator_det: 'bunamain ' }, true, 'chauns')).toBe('bunamain tuts ils');
    expect(rgArticle({ ...CHAUN, definiteness: 'bare', approximator_det: 'bunamain ' }, true, 'chauns')).toBe('');
  });

  describe('mass nouns', () => {
    test("stay singular: bler, pauc, tut il, tutta l'", () => {
      expect(rgArticle({ ...PAUN, definiteness: 'many' }, false, 'paun')).toBe('bler');
      expect(rgArticle({ ...AUA, definiteness: 'many' }, false, 'aua')).toBe('blera');
      expect(rgArticle({ ...PAUN, definiteness: 'few' }, false, 'paun')).toBe('pauc');
      expect(rgArticle({ ...AUA, definiteness: 'few' }, false, 'aua')).toBe('pauca');
      expect(rgArticle({ ...PAUN, definiteness: 'all' }, false, 'paun')).toBe('tut il');
      expect(rgArticle({ ...AUA, definiteness: 'all' }, false, 'aua')).toBe("tutta l'");
    });

    test('no partitive article: some is in pau, the indefinite bare', () => {
      expect(rgArticle({ ...AUA, definiteness: 'some' }, false, 'aua')).toBe('in pau');
      expect(rgArticle({ ...AUA, definiteness: 'indefinite' }, false, 'aua')).toBe('');
      expect(rgArticle({ ...AUA, definiteness: 'bare' }, false, 'aua')).toBe('');
    });

    test('the rest: demonstratives, nagin, mintga, la gronda part, avunda, tal', () => {
      expect(rgArticle({ ...AUA, definiteness: 'this' }, false, 'aua')).toBe('questa');
      expect(rgArticle({ ...PAUN, definiteness: 'that' }, false, 'paun')).toBe('quel');
      expect(rgArticle({ ...AUA, definiteness: 'no' }, false, 'aua')).toBe('nagina');
      expect(rgArticle({ ...PAUN, definiteness: 'each' }, false, 'paun')).toBe('mintga');
      expect(rgArticle({ ...PAUN, definiteness: 'most' }, false, 'paun')).toBe('la gronda part dal');
      expect(rgArticle({ ...AUA, definiteness: 'most' }, false, 'aua')).toBe("la gronda part da l'");
      expect(rgArticle({ ...AUA, definiteness: 'enough' }, false, 'aua')).toBe('avunda');
      expect(rgArticle({ ...AUA, definiteness: 'such' }, false, 'aua')).toBe('ina tala');
      expect(rgArticle(AUA, false, 'aua')).toBe("l'");
    });
  });
});
