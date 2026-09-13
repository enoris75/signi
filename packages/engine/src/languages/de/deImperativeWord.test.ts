import { describe, expect, test } from 'vitest';
import { ESSEN, type Forms, GEHEN, WAEHLEN } from './de.fixtures.js';
import { deImperativeWord } from './deImperativeWord.js';

const LAUFEN: Forms = { base: 'laufen', '2pl_present': 'lauft' };

describe('deImperativeWord', () => {
  test('du is the bare infinitive stem', () => {
    expect(deImperativeWord(GEHEN, 'GO', '2sg')).toBe('geh');
    expect(deImperativeWord(LAUFEN, 'RUN', '2sg')).toBe('lauf');
  });

  test('ihr is the stored 2pl present, else the stem + -t', () => {
    expect(deImperativeWord(GEHEN, 'GO', '2pl')).toBe('geht');
    expect(deImperativeWord(WAEHLEN, 'CHOOSE', '2pl')).toBe('wählt');
  });

  test('the wir cohortative is the infinitive with an inverted wir', () => {
    expect(deImperativeWord(GEHEN, 'GO', '1pl')).toBe('gehen wir');
  });

  test('an irregular du form is looked up by concept id; ihr and wir stay regular', () => {
    expect(deImperativeWord(ESSEN, 'EAT', '2sg')).toBe('iss');
    expect(deImperativeWord(ESSEN, 'EAT', '2pl')).toBe('esst');
    expect(deImperativeWord(ESSEN, 'EAT', '1pl')).toBe('essen wir');
  });

  test('sein is suppletive in every person', () => {
    const sein = { base: 'sein' };
    expect(deImperativeWord(sein, 'BE', '2sg')).toBe('sei');
    expect(deImperativeWord(sein, 'BE', '2pl')).toBe('seid');
    expect(deImperativeWord(sein, 'BE', '1pl')).toBe('seien wir');
  });

  test('stems in -er, -d and -sch keep the du -e through the override', () => {
    expect(deImperativeWord({ base: 'speichern' }, 'SAVE', '2sg')).toBe('speichere');
    expect(deImperativeWord({ base: 'laden' }, 'LOAD', '2sg')).toBe('lade');
    expect(deImperativeWord({ base: 'löschen' }, 'CLEAR', '2sg')).toBe('lösche');
  });
});
