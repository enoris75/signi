import { describe, expect, test } from 'vitest';
import { possessiveTable } from './possessiveTable.js';

describe('possessiveTable', () => {
  test('mój: j before a vowel, none before i', () => {
    const t = possessiveTable('mój');
    expect(t.nom).toEqual(['mój', 'moja', 'moje', 'moi', 'moje']);
    expect(t.gen).toEqual(['mojego', 'mojej', 'mojego', 'moich', 'moich']);
    expect(t.ins).toEqual(['moim', 'moją', 'moim', 'moimi', 'moimi']);
  });

  test('swój and czyj follow it', () => {
    expect(possessiveTable('swój').acc).toEqual(['swój', 'swoją', 'swoje', 'swoich', 'swoje']);
    expect(possessiveTable('czyj').nom).toEqual(['czyj', 'czyja', 'czyje', 'czyi', 'czyje']);
  });

  test('nasz is a hard adjective with the virile nasi', () => {
    const t = possessiveTable('nasz');
    expect(t.nom).toEqual(['nasz', 'nasza', 'nasze', 'nasi', 'nasze']);
    expect(t.loc).toEqual(['naszym', 'naszej', 'naszym', 'naszych', 'naszych']);
    expect(possessiveTable('wasz').nom[3]).toBe('wasi');
  });
});
