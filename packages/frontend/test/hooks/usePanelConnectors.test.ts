import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePanelConnectors } from '../../src/components/PhraseBuilder/hooks/usePanelConnectors.ts';
import type { NounKey } from '../../src/components/PhraseBuilder/interfaces.ts';
import { COLLAPSIBLE_GROUPS, MUI_COLOR_HEX } from '../../src/components/PhraseBuilder/slots.ts';
import { attach, place, placed } from './dom.ts';

interface Args {
  openPossessors: NounKey[];
  openConjuncts: NounKey[];
  collapsedGroups: Record<string, boolean>;
}

const NONE_OPEN: Args = { openPossessors: [], openConjuncts: [], collapsedGroups: {} };

function renderConnectors(args: Partial<Args> = {}) {
  const hook = renderHook((props: Args) => usePanelConnectors(props), {
    initialProps: { ...NONE_OPEN, ...args },
  });
  // The builder's root Box sits at (100, 50); every line is measured relative to it.
  attach(hook.result.current.rootRef, placed(100, 50, 800, 600));
  return hook;
}

describe('usePanelConnectors', () => {
  it('draws nothing before the root has mounted', () => {
    const { result, rerender } = renderHook((props: Args) => usePanelConnectors(props), {
      initialProps: { ...NONE_OPEN, openPossessors: ['subject'] },
    });
    result.current.possessorControlEls.current.set('subject', placed(200, 150, 20, 20));
    result.current.possessorDotEls.current.set('subject', placed(300, 400, 10, 10));

    rerender({ ...NONE_OPEN, openPossessors: ['subject'] });

    expect(result.current.relConnectors).toEqual([]);
  });

  it('runs an open possessor’s line from its control’s centre to its panel dot’s centre', () => {
    const { result, rerender } = renderConnectors({ openPossessors: ['subject'] });
    result.current.possessorControlEls.current.set('subject', placed(200, 150, 20, 20));
    result.current.possessorDotEls.current.set('subject', placed(300, 400, 10, 10));

    rerender({ ...NONE_OPEN, openPossessors: ['subject'] });

    expect(result.current.relConnectors).toEqual([
      { which: 'poss:subject', x1: 110, y1: 110, x2: 205, y2: 355, color: MUI_COLOR_HEX.primary },
    ]);
  });

  it('draws a conjunct line alongside a possessor line on the same noun, under its own id', () => {
    const open: Args = { ...NONE_OPEN, openPossessors: ['subject'], openConjuncts: ['subject'] };
    const { result, rerender } = renderConnectors(open);
    const els = result.current;
    els.possessorControlEls.current.set('subject', placed(200, 150, 20, 20));
    els.possessorDotEls.current.set('subject', placed(300, 400, 10, 10));
    els.conjunctControlEls.current.set('subject', placed(240, 150, 20, 20));
    els.conjunctDotEls.current.set('subject', placed(500, 400, 10, 10));

    rerender(open);

    expect(result.current.relConnectors.map((c) => c.which)).toEqual([
      'poss:subject',
      'conj:subject',
    ]);
  });

  it('colours each line by its noun', () => {
    const open: Args = { ...NONE_OPEN, openConjuncts: ['directObject'] };
    const { result, rerender } = renderConnectors(open);
    result.current.conjunctControlEls.current.set('directObject', placed(0, 0, 10, 10));
    result.current.conjunctDotEls.current.set('directObject', placed(0, 100, 10, 10));

    rerender(open);

    expect(result.current.relConnectors[0].color).toBe(MUI_COLOR_HEX.success);
  });

  it('skips a noun whose panel is not open, or whose two ends have not both mounted', () => {
    const { result, rerender } = renderConnectors();
    const els = result.current;
    els.possessorControlEls.current.set('subject', placed(200, 150, 20, 20));
    els.possessorDotEls.current.set('subject', placed(300, 400, 10, 10));
    els.conjunctControlEls.current.set('directObject', placed(200, 150, 20, 20));

    rerender({ ...NONE_OPEN, openConjuncts: ['directObject'] });

    expect(result.current.relConnectors).toEqual([]);
  });

  it('hides the line while the noun’s dotted box is collapsed', () => {
    const subjectGroup = COLLAPSIBLE_GROUPS.find((g) => g.mainKey === 'subject')!.label;
    const { result, rerender } = renderConnectors({ openPossessors: ['subject'] });
    result.current.possessorControlEls.current.set('subject', placed(200, 150, 20, 20));
    result.current.possessorDotEls.current.set('subject', placed(300, 400, 10, 10));

    rerender({ ...NONE_OPEN, openPossessors: ['subject'], collapsedGroups: { [subjectGroup]: true } });

    expect(result.current.relConnectors).toEqual([]);
  });

  it('follows a control dragged across the canvas, but settles through sub-pixel jitter', () => {
    const open: Args = { ...NONE_OPEN, openPossessors: ['subject'] };
    const { result, rerender } = renderConnectors(open);
    const control = placed(200, 150, 20, 20);
    result.current.possessorControlEls.current.set('subject', control);
    result.current.possessorDotEls.current.set('subject', placed(300, 400, 10, 10));
    rerender(open);
    const settled = result.current.relConnectors;

    place(control, 200.3, 149.8, 20, 20);
    rerender(open);
    expect(result.current.relConnectors).toBe(settled);

    place(control, 260, 150, 20, 20);
    rerender(open);
    expect(result.current.relConnectors[0]).toMatchObject({ x1: 170, y1: 110 });
  });
});
