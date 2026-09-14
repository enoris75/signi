import { describe, expect, it } from 'vitest';
import { serializeSelection } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/serializeSelection.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { CAT, EAT, RICH, RICH_SAVED } from '../fixtures.ts';

describe('serializeSelection', () => {
  it('saves an empty selection as an empty record', () => {
    expect(serializeSelection({})).toEqual({});
  });

  it('replaces every concept with its id, however deep, and keeps everything else', () => {
    expect(serializeSelection(RICH)).toEqual(RICH_SAVED);
  });

  it('leaves out unset fields', () => {
    const saved = serializeSelection({ subject: CAT, verb: undefined, directObjectPossessor: undefined, verbTense: null } as unknown as PhraseSelection);

    expect(Object.keys(saved)).toEqual(['subject']);
  });

  it('keeps false and zero-like scalars', () => {
    expect(serializeSelection({ verb: EAT, verbNegative: false })).toEqual({ verb: 'EAT', verbNegative: false });
  });
});
