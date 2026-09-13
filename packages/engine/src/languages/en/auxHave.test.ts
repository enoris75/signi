import { describe, expect, test } from 'vitest';
import { CAT, HE, I, THEY, YOU } from './en.fixtures.js';
import { auxHave } from './auxHave.js';

describe('auxHave', () => {
  test('present: has for the third singular, have elsewhere', () => {
    expect(auxHave(HE, 'present')).toEqual(['has']);
    expect(auxHave(CAT, 'present')).toEqual(['has']);
    expect(auxHave(I, 'present')).toEqual(['have']);
    expect(auxHave(YOU, 'present')).toEqual(['have']);
    expect(auxHave({ ...CAT, number: 'plural' }, 'present')).toEqual(['have']);
  });

  test('past: had, for every subject', () => {
    expect(auxHave(HE, 'past')).toEqual(['had']);
    expect(auxHave(THEY, 'past')).toEqual(['had']);
  });

  test('future: will have, for every subject', () => {
    expect(auxHave(I, 'future')).toEqual(['will', 'have']);
    expect(auxHave(HE, 'future')).toEqual(['will', 'have']);
  });
});
