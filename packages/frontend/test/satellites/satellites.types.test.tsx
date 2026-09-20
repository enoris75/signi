import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { COMPLEMENT_RENDER_ORDER, COMPLEMENT_TYPES } from '@signi/shared';
import {
  complementIcons,
  iconSx,
} from '../../src/components/PhraseBuilder/satellites/satellites.types.tsx';
import { glyph } from './fixtures.tsx';

describe('complementIcons', () => {
  // Every complement type, not only the ones the builder offers a box for: the map is keyed by
  // ComplementType, and COMPLEMENT_RENDER_ORDER is the list that holds all of them (the plan-only
  // objectPredicative and comitative are not in COMPLEMENT_TYPES — see BoxComplementType).
  it('has an icon for every complement type, and nothing else', () => {
    expect(Object.keys(complementIcons).sort()).toEqual([...COMPLEMENT_RENDER_ORDER].sort());
  });

  it('marks each complement with a glyph of its own', () => {
    const glyphs = COMPLEMENT_RENDER_ORDER.map((type) => glyph(complementIcons[type]));

    expect(new Set(glyphs).size).toBe(COMPLEMENT_RENDER_ORDER.length);
  });

  it('sizes every glyph by the shared satellite icon style', () => {
    for (const type of COMPLEMENT_TYPES) {
      const { container, unmount } = render(<>{complementIcons[type]}</>);
      expect(getComputedStyle(container.querySelector('svg')!).fontSize).toBe(`${iconSx.fontSize}px`);
      unmount();
    }
  });
});
