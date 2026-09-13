import { describe, expect, test } from 'vitest';
import { AFRICA, CAT, CHILD, MAN, np, PROCESS } from './en.fixtures.js';
import { genitiveMarker } from './genitiveMarker.js';

describe('genitiveMarker', () => {
  test('a singular possessor takes ’s', () => {
    expect(genitiveMarker(np(CAT))).toBe("'s");
    expect(genitiveMarker(np(AFRICA))).toBe("'s");
  });

  test('a singular already ending in -s still takes ’s', () => {
    expect(genitiveMarker(np(PROCESS))).toBe("'s");
  });

  test('a plural in -s takes a bare apostrophe', () => {
    expect(genitiveMarker(np(CAT, { number: 'plural' }))).toBe("'");
  });

  test('an irregular plural not in -s takes ’s', () => {
    expect(genitiveMarker(np(CHILD, { number: 'plural' }))).toBe("'s");
    expect(genitiveMarker(np(MAN, { number: 'plural' }))).toBe("'s");
  });
});
