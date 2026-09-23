import { describe, expect, test } from 'vitest';
import { clause, el, group, np, vp } from '../../languages/resolved.fixtures.js';
import { withExistential } from './withExistential.js';

const expletive = np({ base: 'lui', person: '3', number: 'singular', gender: 'masc' });
const cats = np({ base: 'gatti', number: 'plural', gender: 'masc', definiteness: 'no' });
const cat = np({ base: 'gatto', number: 'singular', gender: 'masc' });
const fox = np({ base: 'volpe', number: 'singular', gender: 'fem' });
const existential = (pivot: ReturnType<typeof el>) => clause(expletive, vp({ base: 'essere' }), { directObject: pivot });

describe('withExistential', () => {
  test('marks the verb phrase for the engines', () => {
    expect(withExistential(existential(el(cat)), 'fr').verbPhrase?.existential).toBe(true);
  });

  test('en and it agree with the pivot, without its determiner', () => {
    expect(withExistential(existential(el(cats)), 'it').subject.agreement).toEqual({ person: '3', number: 'plural', gender: 'masc' });
    expect(withExistential(existential(el(cat, fox)), 'en').subject.agreement).toEqual({ person: '3', number: 'plural', gender: 'masc' });
  });

  test('an "or" pivot agrees with its first conjunct, which stands nearest the verb', () => {
    const or = { ...group('or', cat, cats), invertedAgreement: { person: '3', number: 'singular', gender: 'masc' } };
    expect(withExistential(existential(or), 'en').subject.agreement['number']).toBe('singular');
  });

  test('the impersonal languages keep the third singular', () => {
    for (const language of ['fr', 'de', 'es', 'pt', 'ja']) {
      expect(withExistential(existential(el(cats)), language).subject.agreement).toEqual(expletive.head.forms);
    }
  });

  test('a personal-pronoun pivot is refused', () => {
    expect(() => withExistential(existential(el(np({ base: 'io', person: '1' }))), 'it')).toThrow(/pronoun/);
    expect(withExistential(existential(el(np({ base: 'qualcosa', person: '3', thing: '1' }))), 'it').verbPhrase?.existential).toBe(true);
  });
});
