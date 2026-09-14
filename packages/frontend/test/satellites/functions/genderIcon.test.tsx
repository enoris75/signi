import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { genderIcon } from '../../../src/components/PhraseBuilder/satellites/functions/genderIcon.tsx';
import type { Gender } from '../../../src/components/PhraseBuilder/satellites/satellites.types.tsx';
import { glyph } from '../fixtures.tsx';

describe('genderIcon', () => {
  it.each<[Gender | undefined, string]>([
    ['masc', 'MaleIcon'],
    ['fem', 'FemaleIcon'],
    ['neut', 'TransgenderIcon'],
    // An unmarked gender reads masculine, like its label.
    [undefined, 'MaleIcon'],
  ])('draws %s as %s', (gen, icon) => {
    expect(glyph(genderIcon(gen))).toBe(icon);
  });

  it('draws a fresh glyph each time, so each control owns its own element', () => {
    expect(genderIcon('fem')).not.toBe(genderIcon('fem'));
  });

  it('sizes the glyph like every other satellite icon', () => {
    const { container } = render(<>{genderIcon('neut')}</>);

    expect(getComputedStyle(container.querySelector('svg')!).fontSize).toBe('13px');
  });
});
