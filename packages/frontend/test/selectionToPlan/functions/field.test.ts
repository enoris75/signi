import { describe, expect, it } from 'vitest';
import { field } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/field.ts';
import type { NounKey } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { CAT } from '../fixtures.ts';

describe('field', () => {
  it('reads a field by a key built at runtime', () => {
    const which: NounKey = 'directObject';

    expect(field<string>({ directObjectNumber: 'plural' }, `${which}Number`)).toBe('plural');
    expect(field({ subject: CAT }, 'subject')).toBe(CAT);
  });

  it('reads an unset or unknown key as undefined', () => {
    expect(field({ subject: CAT }, 'verb')).toBeUndefined();
    expect(field({ subject: CAT }, 'noSuchField')).toBeUndefined();
  });
});
