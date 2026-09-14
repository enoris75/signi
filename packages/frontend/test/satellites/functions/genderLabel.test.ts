import { describe, expect, it, vi } from 'vitest';
import type { UiStringKey } from '@signi/shared';
import { genderLabel } from '../../../src/components/PhraseBuilder/satellites/functions/genderLabel.ts';
import type { Gender } from '../../../src/components/PhraseBuilder/satellites/satellites.types.tsx';

describe('genderLabel', () => {
  it.each<[Gender | undefined, UiStringKey]>([
    ['masc', 'gender.value.masc'],
    ['fem', 'gender.value.fem'],
    ['neut', 'gender.value.neut'],
    [undefined, 'gender.value.masc'],
  ])('names %s by the %s string', (gen, key) => {
    const t = vi.fn((k: UiStringKey) => `t(${k})`);

    expect(genderLabel(t, gen)).toBe(`t(${key})`);
    expect(t).toHaveBeenCalledExactlyOnceWith(key);
  });
});
