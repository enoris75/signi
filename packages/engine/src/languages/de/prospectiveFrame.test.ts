import { describe, expect, test } from 'vitest';
import type { VerbComplex } from './de.types.js';
import { prospectiveFrame } from './prospectiveFrame.js';

const present: VerbComplex = { v2: 'ist', mid: 'im Begriff', tail: '', zuInfinitive: 'zu essen' };
const future: VerbComplex = { v2: 'wird', mid: 'im Begriff', tail: 'sein', zuInfinitive: 'zu essen' };
const mustFuture: VerbComplex = { v2: 'wird', mid: 'im Begriff', tail: 'sein müssen', zuInfinitive: 'zu essen' };
const bare = { nicht: '', modalAdverbs: '', adverb: '', dative: '', directObject: '', complements: '' };
const theMouse = { ...bare, directObject: 'die Maus' };

/** The parts joined as a clause builder joins them (the leading comma is tidied later, by `punctuate`). */
const frame = (complex: VerbComplex, parts: typeof bare, verbFinal: boolean) =>
  prospectiveFrame(complex, parts, verbFinal).filter(Boolean).join(' ');

describe('prospectiveFrame', () => {
  describe('V2 order', () => {
    test('a bare zu-infinitive follows the verb cluster, with no comma', () => {
      expect(frame(present, bare, false)).toBe('im Begriff zu essen');
      expect(frame(future, bare, false)).toBe('im Begriff sein zu essen');
      expect(frame(mustFuture, bare, false)).toBe('im Begriff sein müssen zu essen');
    });

    test('a longer group follows it too, led by a comma', () => {
      expect(frame(present, theMouse, false)).toBe('im Begriff , die Maus zu essen');
      expect(frame(future, theMouse, false)).toBe('im Begriff sein , die Maus zu essen');
      expect(frame(mustFuture, { ...bare, adverb: 'schnell' }, false)).toBe('im Begriff sein müssen , schnell zu essen');
    });

    test('the finite verb is left to the caller, which has already placed it', () => {
      expect(prospectiveFrame(present, theMouse, false)).not.toContain('ist');
    });
  });

  describe('verb-final order', () => {
    test('a bare zu-infinitive stays inside the bracket, ahead of sein and the finite verb', () => {
      expect(frame(present, bare, true)).toBe('im Begriff zu essen ist');
      expect(frame(future, bare, true)).toBe('im Begriff zu essen sein wird');
    });

    test('a longer group is extraposed after the finite verb', () => {
      expect(frame(present, theMouse, true)).toBe('im Begriff ist , die Maus zu essen');
      expect(frame(future, { ...bare, adverb: 'schnell' }, true)).toBe('im Begriff sein wird , schnell zu essen');
    });
  });

  test('the group gathers the adverb, the dative, the object and the complements, in that order', () => {
    const giving = { ...present, zuInfinitive: 'zu geben' };
    const parts = { ...bare, adverb: 'schnell', dative: 'dem Jungen', directObject: 'das Buch', complements: 'im Haus' };
    expect(frame(giving, parts, false)).toBe('im Begriff , schnell dem Jungen das Buch im Haus zu geben');
    expect(frame(giving, parts, true)).toBe('im Begriff ist , schnell dem Jungen das Buch im Haus zu geben');
  });

  test('"nicht" and the modals\' adverbs lead "im Begriff", outside the group', () => {
    const must: VerbComplex = { v2: 'muss', mid: 'im Begriff', tail: 'sein', zuInfinitive: 'zu essen' };
    expect(frame(must, { ...theMouse, nicht: 'nicht', modalAdverbs: 'immer' }, false)).toBe('nicht immer im Begriff sein , die Maus zu essen');
    expect(frame(must, { ...bare, nicht: 'nicht', modalAdverbs: 'immer' }, true)).toBe('nicht immer im Begriff zu essen sein muss');
  });
});
