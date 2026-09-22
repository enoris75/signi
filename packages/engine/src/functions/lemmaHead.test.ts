import { describe, expect, test } from 'vitest';
import { lemmaHead } from './lemmaHead.js';

describe('lemmaHead', () => {
  test('takes the tail off every stored form of a multiword lemma, and leaves the others', () => {
    expect(lemmaHead({
      conceptId: 'NEED',
      forms: { base: 'avere bisogno', '1pl_present': 'abbiamo bisogno', '1sg_future': 'avrò bisogno', object_prep: 'di', stative: '1' },
    })).toEqual({
      conceptId: 'NEED',
      forms: { base: 'avere', '1pl_present': 'abbiamo', '1sg_future': 'avrò', object_prep: 'di', stative: '1' },
    });
  });

  test('returns a one-word or pronominal lemma as it is', () => {
    const eat = { conceptId: 'EAT', forms: { base: 'manger', '3sg_present': 'mange' } };
    expect(lemmaHead(eat)).toBe(eat);
    const move = { conceptId: 'MOVE_ONESELF', forms: { base: 'se déplacer', '1pl_present': 'nous déplaçons' } };
    expect(lemmaHead(move)).toBe(move);
  });
});
