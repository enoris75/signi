import { describe, expect, it } from 'vitest';
import { serializePeriod } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/serializePeriod.ts';
import { RICH, RICH_SAVED } from '../fixtures.ts';

describe('serializePeriod', () => {
  it('saves one period as a workspace of its own, with no links', () => {
    expect(serializePeriod({ id: 'p1', selection: RICH })).toEqual({
      containers: [{ id: 'p1', selection: RICH_SAVED }],
      links: [],
    });
  });
});
