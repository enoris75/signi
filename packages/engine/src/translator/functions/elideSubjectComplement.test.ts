import { describe, expect, test } from 'vitest';
import { clause, complement, complements, el, np, vp } from '../../languages/resolved.fixtures.js';
import { elideSubjectComplement } from './elideSubjectComplement.js';

const ESSERE = { base: 'essere', copula: '1' };
const MANGIARE = { base: 'mangiare' };
const CAT = np({ base: 'gatto' });
const DOG = np({ base: 'cane' });
const HAPPY = complement(np({ base: 'felice', role: 'adjective' }));

/** "the cat is happy" */
const ANTECEDENT = clause(CAT, vp(ESSERE), { complements: complements({ predicative: HAPPY }) });

describe('elideSubjectComplement', () => {
  // A121: "the cat is happy, but the dog is not".
  test('a bare copula after a clause with a complement elides it, leaving the clause it was given untouched', () => {
    const dogIsNot = clause(DOG, vp(ESSERE, { negative: true }));
    const elided = elideSubjectComplement(dogIsNot, ANTECEDENT);
    expect(elided.verbPhrase).toEqual({ ...dogIsNot.verbPhrase, elided: { type: 'predicative', complement: HAPPY } });
    expect(elided.subject).toBe(dogIsNot.subject);
    expect(dogIsNot.verbPhrase).not.toHaveProperty('elided');
  });

  test('an empty complements map is still bare', () => {
    expect(elideSubjectComplement(clause(DOG, vp(ESSERE), { complements: {} }), ANTECEDENT).verbPhrase?.elided).toBeDefined();
  });

  test('a copula with a complement or an object of its own elides nothing', () => {
    const dogIsHappy = clause(DOG, vp(ESSERE), { complements: complements({ predicative: HAPPY }) });
    expect(elideSubjectComplement(dogIsHappy, ANTECEDENT)).toBe(dogIsHappy);
    const withObject = clause(DOG, vp(ESSERE), { directObject: el(CAT) });
    expect(elideSubjectComplement(withObject, ANTECEDENT)).toBe(withObject);
  });

  test('any other verb, or no verb, elides nothing', () => {
    const dogEats = clause(DOG, vp(MANGIARE));
    expect(elideSubjectComplement(dogEats, ANTECEDENT)).toBe(dogEats);
    const verbless = clause(DOG);
    expect(elideSubjectComplement(verbless, ANTECEDENT)).toBe(verbless);
  });

  test('a bare copula with nothing to take from the clause before stays as it is: "the dog is"', () => {
    const dogIs = clause(DOG, vp(ESSERE));
    expect(elideSubjectComplement(dogIs, clause(CAT, vp(MANGIARE)))).toBe(dogIs);
  });
});
