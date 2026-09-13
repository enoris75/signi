import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOverlapResolution } from '../../src/components/PhraseBuilder/hooks/useOverlapResolution.ts';
import type { DragState, Positions } from '../../src/components/PhraseBuilder/hooks/useDrag.ts';
import type { GroupRect } from '../../src/components/PhraseBuilder/graph.ts';
import { BOTTOM_MARGIN } from '../../src/components/PhraseBuilder/overlap.ts';
import { ringFootprint } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { MIN_GRAPH_HEIGHT } from '../../src/components/PhraseBuilder/slots.ts';

// Two one-word constituents. A dotted ring of radius 69 takes up a 160 px square with the controls
// straddling it, so on an 800 px canvas words 80 px apart overlap by 90.
const RADIUS = 69;
const LABELS: Record<string, string> = { subject: 'Subject', verb: 'Verb Phrase' };

interface Scene {
  positions: Positions;
  // Each constituent's dotted-ring radius, by its word; RADIUS unless given.
  radii?: Record<string, number>;
  words?: string[];
  graphSize?: { w: number; h: number };
  compact?: boolean;
}

// The rings the ring layout would lay out for a scene: each centred on its word.
function rings(scene: Scene, positions = scene.positions): GroupRect[] {
  const size = scene.graphSize ?? { w: 800, h: 300 };
  return (scene.words ?? ['subject', 'verb']).map((word) => {
    const center = {
      x: (positions[word].x / 100) * size.w,
      y: (positions[word].y / 100) * size.h,
    };
    const rOut = scene.radii?.[word] ?? RADIUS;
    return {
      label: LABELS[word],
      color: '',
      mainKey: word,
      nodeKeys: [word],
      center,
      rIn: 34,
      orbit: 34,
      rOut,
      ...ringFootprint(center, rOut),
    };
  });
}

// Renders the hook over a fixed scene. The setters are spies, not state: nothing it writes
// feeds back in, so each test sees exactly what one commit asks for.
function renderResolver(initial: Scene) {
  const setPositions = vi.fn();
  const setGraphHeight = vi.fn();
  const dragRef: { current: DragState | null } = { current: null };
  const positionsStaleRef = { current: false };
  const hook = renderHook(
    (scene: Scene) => {
      const graphSize = scene.graphSize ?? { w: 800, h: 300 };
      return useOverlapResolution({
        compact: scene.compact ?? false,
        groupRects: rings(scene),
        pos: (k) => scene.positions[k],
        graphSize,
        graphHeight: graphSize.h,
        setPositions,
        setGraphHeight,
        dragRef,
        positionsStaleRef,
      });
    },
    { initialProps: initial },
  );
  // The patch a setPositions call merges in.
  const patch = (call = 0): Positions => setPositions.mock.calls[call][0]({});
  return { ...hook, setPositions, setGraphHeight, dragRef, positionsStaleRef, patch };
}

const overlapping = (): Scene => ({
  positions: { subject: { x: 25, y: 50 }, verb: { x: 35, y: 50 } },
});

const clear = (h = 300): Scene => ({
  positions: { subject: { x: 25, y: 50 }, verb: { x: 75, y: 50 } },
  graphSize: { w: 800, h },
});

const footprints = (positions: Positions, scene: Scene) => rings(scene, positions);

const intersects = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

describe('useOverlapResolution', () => {
  describe('separating boxes', () => {
    it('slides overlapping boxes apart until they are clear', () => {
      const scene = overlapping();
      const { setPositions, patch } = renderResolver(scene);

      expect(setPositions).toHaveBeenCalledOnce();
      const [subject, verb] = footprints({ ...scene.positions, ...patch() }, scene);
      expect(intersects(subject, verb)).toBe(false);
    });

    it('writes nothing while the boxes are already clear', () => {
      const { setPositions, setGraphHeight } = renderResolver(clear());

      expect(setPositions).not.toHaveBeenCalled();
      expect(setGraphHeight).not.toHaveBeenCalled();
    });

    it('has nothing to do in compact view, which packs its own rows', () => {
      const { setPositions } = renderResolver({ ...overlapping(), compact: true });

      expect(setPositions).not.toHaveBeenCalled();
    });

    it('has nothing to do with a single box', () => {
      const { setPositions } = renderResolver({ ...overlapping(), words: ['subject'] });

      expect(setPositions).not.toHaveBeenCalled();
    });
  });

  describe('who yields', () => {
    it('shares the shove between two boxes on the first pass', () => {
      const { patch } = renderResolver(overlapping());

      expect(Object.keys(patch()).sort()).toEqual(['subject', 'verb']);
    });

    it('never moves the box under the pointer', () => {
      const scene = overlapping();
      const { rerender, setPositions, dragRef, patch } = renderResolver(clear());
      dragRef.current = {
        keys: ['subject'],
        startX: 0,
        startY: 0,
        origPositions: {},
        moved: false,
      };

      rerender(scene);

      expect(setPositions).toHaveBeenCalledOnce();
      expect(patch()).not.toHaveProperty('subject');
      expect(patch().verb.x).toBeGreaterThan(scene.positions.verb.x);
    });

    it('lets a box that just grew hold its ground, pushing its neighbour away', () => {
      // The verb's ring sits clear of the subject's, then a satellite widens it and it reaches over.
      const before: Scene = { positions: { subject: { x: 25, y: 50 }, verb: { x: 55, y: 50 } } };
      const grown: Scene = { ...before, radii: { verb: 150 } };
      const { rerender, setPositions, patch } = renderResolver(before);
      expect(setPositions).not.toHaveBeenCalled();

      rerender(grown);

      expect(setPositions).toHaveBeenCalledOnce();
      expect(patch()).not.toHaveProperty('verb');
      expect(patch().subject.x).toBeLessThan(25);
      const [subject, verb] = footprints({ ...grown.positions, ...patch() }, grown);
      expect(intersects(subject, verb)).toBe(false);
    });
  });

  describe('re-running', () => {
    it('does not re-resolve a re-render that brings unchanged geometry', () => {
      // A redundant pass reads the "just grew" pulse as already spent and resolves the same
      // overlap differently — the bump loop of e2e/manner-possessor-crash.spec.ts.
      const { rerender, setPositions } = renderResolver(overlapping());

      rerender(overlapping());
      rerender(overlapping());

      expect(setPositions).toHaveBeenCalledOnce();
    });

    it('re-resolves on every commit of a drag, even with unchanged geometry', () => {
      const { rerender, setPositions, dragRef } = renderResolver(overlapping());
      dragRef.current = { keys: ['verb'], startX: 0, startY: 0, origPositions: {}, moved: false };

      rerender(overlapping());
      rerender(overlapping());

      expect(setPositions).toHaveBeenCalledTimes(3);
    });

    it('sits out the commit whose positions predate a height change, and clears the flag', () => {
      const { rerender, setPositions, positionsStaleRef } = renderResolver(clear());
      positionsStaleRef.current = true;

      rerender(overlapping());
      expect(setPositions).not.toHaveBeenCalled();
      expect(positionsStaleRef.current).toBe(false);

      rerender(overlapping());
      expect(setPositions).toHaveBeenCalledOnce();
    });
  });

  describe('canvas height', () => {
    it('grows the canvas to hold a box shoved down past the bottom edge', () => {
      // Too narrow to set two boxes side by side: they must stack, and one goes below 200 px.
      const scene: Scene = {
        positions: { subject: { x: 50, y: 50 }, verb: { x: 50, y: 50 } },
        graphSize: { w: 240, h: 200 },
      };
      const { setGraphHeight, patch } = renderResolver(scene);

      const bottom = Math.max(
        ...footprints({ ...scene.positions, ...patch() }, scene).map((r) => r.y + r.height),
      );
      expect(bottom).toBeGreaterThan(200);
      expect(setGraphHeight).toHaveBeenCalledExactlyOnceWith(Math.ceil(bottom + BOTTOM_MARGIN));
    });

    it('never shrinks the canvas outside a drag, so the resize grip’s height holds', () => {
      const { setGraphHeight } = renderResolver(clear(600));

      expect(setGraphHeight).not.toHaveBeenCalled();
    });

    it('fits the canvas to the boxes while a drag is under way', () => {
      // Both footprints end 80 px below their words at 300 px.
      const { rerender, setGraphHeight, dragRef } = renderResolver(clear(600));
      dragRef.current = { keys: ['verb'], startX: 0, startY: 0, origPositions: {}, moved: true };

      rerender(clear(600));

      expect(setGraphHeight).toHaveBeenCalledExactlyOnceWith(Math.ceil(380 + BOTTOM_MARGIN));
    });

    it('fits no smaller than the minimum canvas height', () => {
      const scene: Scene = {
        positions: { subject: { x: 25, y: 10 }, verb: { x: 75, y: 10 } },
        graphSize: { w: 800, h: 600 },
      };
      const { rerender, setGraphHeight, dragRef } = renderResolver(clear(600));
      dragRef.current = { keys: ['verb'], startX: 0, startY: 0, origPositions: {}, moved: true };

      rerender(scene);

      expect(setGraphHeight).toHaveBeenCalledExactlyOnceWith(MIN_GRAPH_HEIGHT);
    });

    it('does not resize under a press that has not travelled yet', () => {
      const { rerender, setGraphHeight, dragRef } = renderResolver(clear(600));
      dragRef.current = { keys: ['verb'], startX: 0, startY: 0, origPositions: {}, moved: false };

      rerender(clear(600));

      expect(setGraphHeight).not.toHaveBeenCalled();
    });
  });
});
