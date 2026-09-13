import { describe, expect, test } from 'vitest';
import { ESSEN, GEHEN, KOENNEN, modal, MUESSEN, WOLLEN } from './de.fixtures.js';
import { modalVerbGroup } from './modalVerbGroup.js';

describe('modalVerbGroup', () => {
  test('neutral: the finite modal in V2, the main verb infinitive at the end', () => {
    expect(modalVerbGroup([modal(MUESSEN)], GEHEN, '3sg', 'present', 'neutral')).toEqual({ v2: 'muss', mid: '', tail: 'gehen' });
    expect(modalVerbGroup([modal(MUESSEN)], GEHEN, '3pl', 'present', 'neutral')).toEqual({ v2: 'müssen', mid: '', tail: 'gehen' });
    expect(modalVerbGroup([modal(MUESSEN)], GEHEN, '3sg', 'past', 'neutral')).toEqual({ v2: 'musste', mid: '', tail: 'gehen' });
  });

  test('a chain: only the outermost modal is finite, the rest stack after the verb', () => {
    expect(modalVerbGroup([modal(WOLLEN), modal(KOENNEN)], GEHEN, '3sg', 'present', 'neutral'))
      .toEqual({ v2: 'will', mid: '', tail: 'gehen können' });
  });

  test('future and conditional: werden/würde in V2, every modal stacks', () => {
    expect(modalVerbGroup([modal(MUESSEN)], GEHEN, '3sg', 'future', 'neutral')).toEqual({ v2: 'wird', mid: '', tail: 'gehen müssen' });
    expect(modalVerbGroup([modal(WOLLEN), modal(KOENNEN)], GEHEN, '3sg', 'future', 'neutral'))
      .toEqual({ v2: 'wird', mid: '', tail: 'gehen können wollen' });
    expect(modalVerbGroup([modal(KOENNEN)], ESSEN, '1sg', 'present', 'neutral', 'conditional'))
      .toEqual({ v2: 'würde', mid: '', tail: 'essen können' });
  });

  test('progressive: "gerade" in the Mittelfeld', () => {
    expect(modalVerbGroup([modal(MUESSEN)], ESSEN, '3sg', 'present', 'progressive')).toEqual({ v2: 'muss', mid: 'gerade', tail: 'essen' });
    expect(modalVerbGroup([modal(MUESSEN)], ESSEN, '3sg', 'future', 'progressive')).toEqual({ v2: 'wird', mid: 'gerade', tail: 'essen müssen' });
  });

  test('prospective: "im Begriff zu …" with the copula as an infinitive', () => {
    // "er muss im Begriff zu gehen sein"
    expect(modalVerbGroup([modal(MUESSEN)], GEHEN, '3sg', 'present', 'prospective'))
      .toEqual({ v2: 'muss', mid: 'im Begriff', tail: 'zu gehen sein' });
  });

  test('resultative: Partizip II + the verb’s own auxiliary infinitive', () => {
    expect(modalVerbGroup([modal(MUESSEN)], ESSEN, '3sg', 'present', 'resultative')).toEqual({ v2: 'muss', mid: '', tail: 'gegessen haben' });
    expect(modalVerbGroup([modal(MUESSEN)], GEHEN, '3sg', 'present', 'resultative')).toEqual({ v2: 'muss', mid: '', tail: 'gegangen sein' });
    expect(modalVerbGroup([modal(MUESSEN)], GEHEN, '3sg', 'future', 'resultative')).toEqual({ v2: 'wird', mid: '', tail: 'gegangen sein müssen' });
  });
});
