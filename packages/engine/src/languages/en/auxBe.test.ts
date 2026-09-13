import { describe, expect, test } from 'vitest';
import { CAT, HE, I, THEY, WE, YOU } from './en.fixtures.js';
import { auxBe } from './auxBe.js';

describe('auxBe', () => {
  test('present: am, is, are', () => {
    expect(auxBe(I, 'present')).toEqual(['am']);
    expect(auxBe(YOU, 'present')).toEqual(['are']);
    expect(auxBe(HE, 'present')).toEqual(['is']);
    expect(auxBe(WE, 'present')).toEqual(['are']);
    expect(auxBe(THEY, 'present')).toEqual(['are']);
  });

  test('past: was for the first and third singular, were elsewhere', () => {
    expect(auxBe(I, 'past')).toEqual(['was']);
    expect(auxBe(HE, 'past')).toEqual(['was']);
    expect(auxBe(YOU, 'past')).toEqual(['were']);
    expect(auxBe(WE, 'past')).toEqual(['were']);
  });

  test('future: will be, for every subject', () => {
    expect(auxBe(I, 'future')).toEqual(['will', 'be']);
    expect(auxBe(THEY, 'future')).toEqual(['will', 'be']);
  });

  test('a noun subject, or none, agrees as the third person', () => {
    expect(auxBe(CAT, 'present')).toEqual(['is']);
    expect(auxBe({ ...CAT, number: 'plural' }, 'past')).toEqual(['were']);
    expect(auxBe({}, 'present')).toEqual(['is']);
  });
});
