import { afterEach, describe, expect, it, vi } from 'vitest';
import { SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION } from '@signi/shared';
import { toSavedPhrase } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/toSavedPhrase.ts';
import { serializeWorkspace } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/serializeWorkspace.ts';
import type { PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { RICH } from '../fixtures.ts';

afterEach(() => {
  vi.useRealTimers();
});

describe('toSavedPhrase', () => {
  it('wraps the whole workspace as a current phrase document, stamped now', () => {
    vi.useFakeTimers({ now: new Date('2026-09-14T10:30:00Z') });
    const containers = [{ id: 'a', selection: RICH }, { id: 'b', selection: {} }];
    const links: PhraseLink[] = [{ id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } }];

    expect(toSavedPhrase('Cats', containers, links)).toEqual({
      format: SAVED_PHRASE_FORMAT,
      version: SAVED_PHRASE_VERSION,
      kind: 'phrase',
      savedAt: '2026-09-14T10:30:00.000Z',
      name: 'Cats',
      workspace: serializeWorkspace(containers, links),
    });
  });
});
