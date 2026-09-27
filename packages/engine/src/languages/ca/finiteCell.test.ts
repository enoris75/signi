import { describe, expect, test } from 'vitest';
import { ESTAR, HAVER } from './ca.consts.js';
import { MENJAR, SER } from './ca.fixtures.js';
import { auxCell, finiteCell, hasOwnCell } from './finiteCell.js';

describe('finiteCell', () => {
  test('the present and the future are stored', () => {
    expect(finiteCell(MENJAR, '3sg', 'present', undefined)).toBe('menja');
    expect(finiteCell(MENJAR, '1pl', 'future', undefined)).toBe('menjarem');
  });

  test('the past of an event is periphrastic, so there is no cell for it', () => {
    expect(finiteCell(MENJAR, '3sg', 'past', undefined)).toBeUndefined();
  });

  test('the past of a state is the imperfect (A130)', () => {
    expect(finiteCell(SER, '1pl', 'past', undefined)).toBe('érem');
  });

  test('a lexeme that stores a past of its own reads it', () => {
    expect(finiteCell({ ...MENJAR, '3sg_past': 'hauria menjat' }, '3sg', 'past', undefined)).toBe('hauria menjat');
  });

  test('each mood reads its own cell, whatever the tense', () => {
    expect(finiteCell(MENJAR, '3sg', 'past', 'conditional')).toBe('menjaria');
    expect(finiteCell(MENJAR, '3sg', 'present', 'subjunctive')).toBe('mengés');
    expect(finiteCell(MENJAR, '2sg', 'present', 'presentSubjunctive')).toBe('mengis');
  });
});

describe('auxCell', () => {
  test('the past of an auxiliary is its imperfect', () => {
    expect(auxCell(ESTAR, '3sg', 'past', undefined)).toBe('estava');
    expect(auxCell(HAVER, '3pl', 'past', undefined)).toBe('havien');
    expect(auxCell(HAVER, '1sg', 'future', undefined)).toBe('hauré');
  });

  test('a mood reads its own cell', () => {
    expect(auxCell(HAVER, '3sg', 'present', 'conditional')).toBe('hauria');
    expect(auxCell(ESTAR, '3sg', 'present', 'subjunctive')).toBe('estigués');
    expect(auxCell(HAVER, '1pl', 'present', 'presentSubjunctive')).toBe('hàgim');
  });
});

describe('hasOwnCell', () => {
  test('the three hypothetical moods', () => {
    expect(hasOwnCell('conditional')).toBe(true);
    expect(hasOwnCell('indicative')).toBe(false);
    expect(hasOwnCell(undefined)).toBe(false);
  });
});
