import { describe, expect, test } from 'vitest';
import { CHASA, CHAUN, DI, DUNNA, EL, EUROPA, GIAT, STANCHEL, UM, complement, complements, np } from './rumgr.fixtures.js';
import { complementsPhrase } from './complementsPhrase.js';

const say = (map: Parameters<typeof complements>[0], subject: Record<string, string> = GIAT, verb = 'RUN') => complementsPhrase(complements(map), subject, verb);
const ANIMATE_DUNNA = { ...DUNNA, animate: '1' };

describe('complementsPhrase', () => {
  test('the locative en and the spatial relations, none contracting', () => {
    expect(say({ locative: complement(np(CHASA)) })).toBe('en la chasa');
    expect(say({ locative: complement(np(CHASA), [{ kind: 'path', value: 'under' }]) })).toBe('sut la chasa');
  });

  test('a and da contract with the masculine article only', () => {
    expect(say({ terminus: complement(np(CHAUN)) })).toBe('al chaun');
    expect(say({ terminus: complement(np(UM)) })).toBe("a l'um");
    expect(say({ source: complement(np(CHASA)) }, GIAT, 'COME')).toBe('da la chasa');
  });

  test('direction: a for a place, tar for a person, en for a land', () => {
    expect(say({ direction: complement(np(CHASA)) }, GIAT, 'GO')).toBe('a la chasa');
    expect(say({ direction: complement(np(ANIMATE_DUNNA)) }, GIAT, 'GO')).toBe('tar la dunna');
    expect(say({ direction: complement(np(EUROPA, { isA: 'CONTINENT' })) }, GIAT, 'GO')).toBe('en Europa');
  });

  test('a running verb says its source with davent', () => {
    expect(say({ source: complement(np(CHASA)) })).toBe('davent da la chasa');
  });

  test('the cause by its sentiment', () => {
    expect(say({ cause: complement(np(CHAUN)) })).toBe('pervia dal chaun');
    expect(say({ cause: complement(np(CHAUN), [{ kind: 'sentiment', value: 'positive' }]) })).toBe('grazia al chaun');
    expect(say({ cause: complement(np(CHAUN), [{ kind: 'sentiment', value: 'negative' }]) })).toBe('per cuolpa dal chaun');
  });

  test('companion and instrument cun; a pronoun is tonic', () => {
    expect(say({ comitative: complement(np(CHAUN)) })).toBe('cun il chaun');
    expect(say({ comitative: complement(np(EL)) })).toBe('cun el');
    expect(say({ terminus: complement(np(EL)) })).toBe('ad el');
  });

  test('a temporal relation', () => {
    expect(say({ temporal: complement(np(DI), [{ kind: 'temporal', value: 'before' }]) })).toBe('avant il di');
  });

  test('the predicative agrees with the subject', () => {
    const SHE = { person: '3', number: 'singular', gender: 'fem' };
    expect(complementsPhrase(complements({ predicative: complement(np(STANCHEL, { role: 'adjective' })) }), SHE, 'BE')).toBe('stancla');
  });
});
