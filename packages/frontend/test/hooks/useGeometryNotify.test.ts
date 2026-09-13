import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGeometryNotify } from '../../src/components/PhraseBuilder/hooks/useGeometryNotify.ts';

type Geometry = Parameters<typeof useGeometryNotify>[1];

// A fresh object graph on every call — what a re-render hands the hook even when nothing moved.
const geometry = (): Geometry => ({
  positions: { subject: { x: 30, y: 40 }, verb: { x: 60, y: 40 } },
  boxSizes: { subject: { w: 120, h: 48 } },
  svgSize: { w: 800, h: 340 },
  graphHeight: 340,
  collapsedGroups: { Subject: false },
  compact: false,
});

function renderNotify(notify: (() => void) | undefined) {
  return renderHook((g: Geometry) => useGeometryNotify(notify, g), {
    initialProps: geometry(),
  });
}

describe('useGeometryNotify', () => {
  it('is inert outside a workspace, with nobody to notify', () => {
    const { rerender } = renderNotify(undefined);

    expect(() => rerender({ ...geometry(), graphHeight: 500 })).not.toThrow();
  });

  it('reports the geometry once on mount', () => {
    const notify = vi.fn();

    renderNotify(notify);

    expect(notify).toHaveBeenCalledOnce();
  });

  it('stays quiet when a re-render brings the same geometry in new objects', () => {
    // Reporting here would re-render the workspace, which re-renders this container, which
    // reports again — the bump loop of e2e/manner-possessor-crash.spec.ts.
    const notify = vi.fn();
    const { rerender } = renderNotify(notify);

    rerender(geometry());
    rerender(geometry());

    expect(notify).toHaveBeenCalledOnce();
  });

  it.each<[string, Partial<Geometry>]>([
    ['a box is dragged', { positions: { subject: { x: 35, y: 40 }, verb: { x: 60, y: 40 } } }],
    ['a word box changes size', { boxSizes: { subject: { w: 180, h: 48 } } }],
    ['the canvas is resized', { svgSize: { w: 640, h: 340 } }],
    ['the canvas height changes', { graphHeight: 420 }],
    ['a group is collapsed', { collapsedGroups: { Subject: true } }],
    ['compact view is toggled', { compact: true }],
  ])('reports again when %s', (_, change) => {
    const notify = vi.fn();
    const { rerender } = renderNotify(notify);

    rerender({ ...geometry(), ...change });

    expect(notify).toHaveBeenCalledTimes(2);
  });
});
