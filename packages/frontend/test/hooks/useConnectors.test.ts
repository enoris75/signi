import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { boxKey, useConnectors } from '../../src/components/PhraseBuilder/hooks/useConnectors.ts';
import type { PhraseLink } from '../../src/components/PhraseBuilder/interfaces.ts';
import { MUI_COLOR_HEX } from '../../src/components/PhraseBuilder/slots.ts';
import { attach, place, placed } from './dom.ts';

const INSTRUMENT_LABEL = 'with';

// Containers register their boxes and anchors into the maps from ref callbacks; the workspace
// root sits at (100, 50), and every connector is measured relative to it.
function renderWorkspace(links: PhraseLink[]) {
  const hook = renderHook((ls: PhraseLink[]) => useConnectors(ls, INSTRUMENT_LABEL), {
    initialProps: links,
  });
  attach(hook.result.current.workspaceRef, placed(100, 50, 1000, 1000));
  return hook;
}

const relative = (id = 'rel'): PhraseLink => ({
  id,
  source: { containerId: 'A', nounKey: 'subject' },
  target: { containerId: 'B', nounKey: 'directObject' },
});

describe('useConnectors', () => {
  it('draws nothing before the workspace has mounted', () => {
    const { result, rerender } = renderHook((ls: PhraseLink[]) => useConnectors(ls, INSTRUMENT_LABEL), {
      initialProps: [relative()],
    });
    result.current.sourceAnchorEls.current.set(boxKey('A', 'subject'), placed(200, 100, 20, 20));
    result.current.targetAnchorEls.current.set(boxKey('B', 'directObject'), placed(200, 400, 20, 20));

    rerender([relative()]);

    expect(result.current.connectors).toEqual([]);
  });

  describe('a relative clause', () => {
    it('runs between the source noun’s control and the target noun’s receiving dot', () => {
      const { result, rerender } = renderWorkspace([relative()]);
      result.current.sourceAnchorEls.current.set(boxKey('A', 'subject'), placed(200, 100, 20, 20));
      result.current.targetAnchorEls.current.set(boxKey('B', 'directObject'), placed(400, 500, 10, 10));

      rerender([relative()]);

      expect(result.current.connectors).toEqual([
        { id: 'rel', kind: 'relative', x1: 110, y1: 60, x2: 305, y2: 455, color: MUI_COLOR_HEX.primary },
      ]);
    });

    it('falls back to the noun boxes until the anchors mount: bottom-centre to top-centre', () => {
      const { result, rerender } = renderWorkspace([relative()]);
      result.current.boxEls.current.set(boxKey('A', 'subject'), placed(200, 100, 120, 40));
      result.current.boxEls.current.set(boxKey('B', 'directObject'), placed(400, 500, 120, 40));

      rerender([relative()]);

      expect(result.current.connectors[0]).toMatchObject({ x1: 160, y1: 90, x2: 360, y2: 450 });
    });

    it('is left out while either end has neither an anchor nor a box', () => {
      const { result, rerender } = renderWorkspace([relative()]);
      result.current.sourceAnchorEls.current.set(boxKey('A', 'subject'), placed(200, 100, 20, 20));

      rerender([relative()]);

      expect(result.current.connectors).toEqual([]);
    });

    it('keeps a possessor-sourced line in the colour of the noun that owns the possessor', () => {
      const link: PhraseLink = {
        id: 'rel',
        source: { containerId: 'A', nounKey: 'directObject/possessor' },
        target: { containerId: 'B', nounKey: 'subject' },
      };
      const { result, rerender } = renderWorkspace([link]);
      result.current.sourceAnchorEls.current.set(boxKey('A', 'directObject/possessor'), placed(0, 0, 10, 10));
      result.current.targetAnchorEls.current.set(boxKey('B', 'subject'), placed(0, 100, 10, 10));

      rerender([link]);

      expect(result.current.connectors[0].color).toBe(MUI_COLOR_HEX.success);
    });
  });

  describe('clause-level links', () => {
    it('runs a conditional between the two cards’ border controls, labelled “if”', () => {
      const link: PhraseLink = { id: 'if', kind: 'conditional', source: { containerId: 'A' }, target: { containerId: 'B' } };
      const { result, rerender } = renderWorkspace([link]);
      result.current.borderAnchorEls.current.set('A', placed(100, 200, 20, 20));
      result.current.borderAnchorEls.current.set('B', placed(100, 600, 20, 20));

      rerender([link]);

      expect(result.current.connectors).toEqual([
        { id: 'if', kind: 'conditional', x1: 10, y1: 160, x2: 10, y2: 560, color: MUI_COLOR_HEX.warning, label: 'if' },
      ]);
    });

    it('labels a coordination with its conjunction', () => {
      const link: PhraseLink = {
        id: 'co',
        kind: 'coordinative',
        conjunction: 'that_is',
        source: { containerId: 'A' },
        target: { containerId: 'B' },
      };
      const { result, rerender } = renderWorkspace([link]);
      result.current.borderAnchorEls.current.set('A', placed(100, 200, 20, 20));
      result.current.borderAnchorEls.current.set('B', placed(100, 600, 20, 20));

      rerender([link]);

      expect(result.current.connectors[0]).toMatchObject({
        kind: 'coordinative',
        label: 'that is',
        color: MUI_COLOR_HEX.info,
      });
    });

    it('falls back to each card’s subject box before its border control mounts', () => {
      const link: PhraseLink = { id: 'if', kind: 'conditional', source: { containerId: 'A' }, target: { containerId: 'B' } };
      const { result, rerender } = renderWorkspace([link]);
      result.current.boxEls.current.set(boxKey('A', 'subject'), placed(300, 200, 100, 40));
      result.current.borderAnchorEls.current.set('B', placed(100, 600, 20, 20));

      rerender([link]);

      expect(result.current.connectors[0]).toMatchObject({ x1: 250, y1: 170 });
    });

    it('runs an instrumental from the verb phrase to the instrument card, with the given label', () => {
      const link: PhraseLink = { id: 'inst', kind: 'instrumental', source: { containerId: 'A' }, target: { containerId: 'B' } };
      const { result, rerender } = renderWorkspace([link]);
      result.current.verbAnchorEls.current.set('A', placed(500, 200, 40, 20));
      result.current.boxEls.current.set(boxKey('A', 'subject'), placed(300, 200, 100, 40));
      result.current.borderAnchorEls.current.set('B', placed(100, 600, 20, 20));

      rerender([link]);

      expect(result.current.connectors).toEqual([
        { id: 'inst', kind: 'instrumental', x1: 420, y1: 160, x2: 10, y2: 560, color: MUI_COLOR_HEX.secondary, label: INSTRUMENT_LABEL },
      ]);
    });
  });

  describe('re-measuring', () => {
    it('follows an anchor moved inside a container when that container bumps the geometry', () => {
      const { result } = renderWorkspace([relative()]);
      const source = placed(200, 100, 20, 20);
      result.current.sourceAnchorEls.current.set(boxKey('A', 'subject'), source);
      result.current.targetAnchorEls.current.set(boxKey('B', 'directObject'), placed(400, 500, 10, 10));
      act(() => result.current.bumpGeom());

      place(source, 600, 100, 20, 20);
      act(() => result.current.bumpGeom());

      expect(result.current.connectors[0]).toMatchObject({ x1: 510, y1: 60 });
    });

    it('hands out the same bumpGeom on every render, so a container’s effect doesn’t refire', () => {
      const { result, rerender } = renderWorkspace([]);
      const bump = result.current.bumpGeom;

      rerender([relative()]);

      expect(result.current.bumpGeom).toBe(bump);
    });

    it('keeps the same connectors array through sub-pixel jitter, so the effect settles', () => {
      const { result } = renderWorkspace([relative()]);
      const source = placed(200, 100, 20, 20);
      result.current.sourceAnchorEls.current.set(boxKey('A', 'subject'), source);
      result.current.targetAnchorEls.current.set(boxKey('B', 'directObject'), placed(400, 500, 10, 10));
      act(() => result.current.bumpGeom());
      const settled = result.current.connectors;

      place(source, 200.4, 99.7, 20, 20);
      act(() => result.current.bumpGeom());

      expect(result.current.connectors).toBe(settled);
    });
  });
});
