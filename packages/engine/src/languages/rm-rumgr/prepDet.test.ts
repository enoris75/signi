import { describe, expect, test } from 'vitest';
import { CHASA, CHAUN, EUROPA, PEDER, UM } from './rumgr.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('the definite article contracts with a and da only', () => {
    expect(prepDet('a', CHAUN, false, 'chaun')).toBe('al');
    expect(prepDet('da', CHAUN, true, 'chauns')).toBe('dals');
    expect(prepDet('a', CHASA, false, 'chasa')).toBe('a la');
    expect(prepDet('cun', CHAUN, false, 'chaun')).toBe('cun il');
    expect(prepDet('a', UM, false, 'um')).toBe("a l'");
  });

  test('any other determiner stands after the plain preposition', () => {
    expect(prepDet('da', { ...CHAUN, definiteness: 'indefinite' }, false, 'chaun')).toBe('da in');
    expect(prepDet('da', { ...CHASA, definiteness: 'no' }, false, 'chasa')).toBe('da nagina');
    expect(prepDet('a', { ...CHAUN, definiteness: 'many' }, true, 'chauns')).toBe('a blers');
    expect(prepDet('cun', { ...CHASA, definiteness: 'this' }, false, 'chasa')).toBe('cun questa');
  });

  test('a is ad before a vowel-initial determiner or bare word', () => {
    expect(prepDet('a', { ...UM, definiteness: 'indefinite' }, false, 'um')).toBe('ad in');
    expect(prepDet('a', { ...CHAUN, definiteness: 'indefinite' }, false, 'chaun')).toBe('ad in');
    expect(prepDet('a', { ...CHAUN, definiteness: 'some' }, true, 'chauns')).toBe('ad insaquants');
    expect(prepDet('a', { ...UM, definiteness: 'bare' }, true, 'umens')).toBe('ad');
  });

  test('a bare noun leaves the preposition alone', () => {
    expect(prepDet('a', { ...CHASA, definiteness: 'bare' }, false, 'chasa')).toBe('a');
    expect(prepDet('senza', { ...CHAUN, definiteness: 'bare' }, false, 'chaun')).toBe('senza');
  });

  test('a proper name takes its article and contracts like one, or none where its lexeme says so', () => {
    expect(prepDet('da', EUROPA, false, 'Europa')).toBe("da l'");
    expect(prepDet('da', { ...EUROPA, definiteness: 'bare' }, false, 'Europa')).toBe("da l'");
    expect(prepDet('da', PEDER, false, 'Peder')).toBe('da');
    expect(prepDet('a', { ...PEDER, base: 'Anna' }, false, 'Anna')).toBe('ad');
  });

  test('the partitive most opens with its own article', () => {
    expect(prepDet('a', { ...CHAUN, definiteness: 'most' }, true, 'chauns')).toBe('a la gronda part dals');
  });
});
