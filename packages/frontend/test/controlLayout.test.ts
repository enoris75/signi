import { describe, expect, it } from 'vitest';
import { CONTROL_GAP, computeControlPositions } from '../src/components/PhraseBuilder/controlLayout.ts';
import { DEFAULT_POSITIONS } from '../src/components/PhraseBuilder/slots.ts';

type Pt = { x: number; y: number };

const SVG = { w: 900, h: 340 };
const BUTTON = 20;

// How far a control's center sits inside the box: negative when it is outside.
function depthInside(p: Pt, center: Pt, size: { w: number; h: number }) {
  return Math.min(
    p.x - (center.x - size.w / 2),
    center.x + size.w / 2 - p.x,
    p.y - (center.y - size.h / 2),
    center.y + size.h / 2 - p.y,
  );
}

function layout(parent: string, keys: string[], size: { w: number; h: number }, pos = (k: string) => DEFAULT_POSITIONS[k]) {
  const controls = computeControlPositions({
    satelliteIconsByParent: { [parent]: keys.map((key) => ({ key })) },
    boxSizes: { [parent]: size },
    pos,
    svgSize: SVG,
  });
  const center = { x: (pos(parent).x / 100) * SVG.w, y: (pos(parent).y / 100) * SVG.h };
  return { controls, center };
}

function expectOnBorderAndApart(controls: Record<string, Pt>, center: Pt, size: { w: number; h: number }) {
  const points = Object.values(controls);
  for (const p of points) {
    // Straddling the border: never sunk into the box over its word, never floating off it.
    expect(depthInside(p, center, size)).toBeLessThanOrEqual(3);
    expect(depthInside(p, center, size)).toBeGreaterThanOrEqual(-3);
  }
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      expect(d).toBeGreaterThanOrEqual(BUTTON);
    }
  }
}

describe('computeControlPositions', () => {
  // The verb box with a short word ("be") carries five controls on a box barely taller than its
  // word. Tense and the modal aim up-left in much the same direction, so they crowd each other.
  const VERB = { w: 107, h: 33 };
  const VERB_CONTROLS = ['verbTense', 'verbAspect', 'verbModal', 'verbNegative', 'modifier'];

  it('keeps crowding controls on the border, clear of the word, instead of fanning one into the box', () => {
    const { controls, center } = layout('verb', VERB_CONTROLS, VERB);
    expect(Object.keys(controls).sort()).toEqual([...VERB_CONTROLS].sort());
    expectOnBorderAndApart(controls, center, VERB);
  });

  it('spreads crowding controls along the edge in the order they aim', () => {
    const { controls } = layout('verb', VERB_CONTROLS, VERB);
    // Tense aims more sideways than the modal (which sits almost straight above), so its ray
    // leaves the top edge further left and it takes the left-hand seat; both stay on that edge.
    expect(controls.verbTense.x).toBeLessThan(controls.verbModal.x);
    expect(controls.verbModal.y).toBeCloseTo(controls.verbTense.y);
    expect(controls.verbModal.x - controls.verbTense.x).toBeCloseTo(CONTROL_GAP);
  });

  it('leaves a lone control on the ray toward its target', () => {
    const { controls, center } = layout('verb', ['verbNegative'], VERB);
    // Straight below the verb: centered on the bottom edge, just outside it.
    expect(controls.verbNegative.x).toBeCloseTo(center.x);
    expect(controls.verbNegative.y).toBeCloseTo(center.y + VERB.h / 2 + 2);
  });

  it('turns controls round a corner rather than off the end of an edge', () => {
    // Six controls all aiming at the same point past the top-left corner.
    const keys = ['a', 'b', 'c', 'd', 'e', 'f'];
    const pos = (k: string) => (k === 'box' ? { x: 50, y: 50 } : { x: 0, y: 0 });
    const size = { w: 80, h: 34 };
    const { controls, center } = layout('box', keys, size, pos);
    expectOnBorderAndApart(controls, center, size);
  });

  it('shares the border out evenly when there are more controls than room', () => {
    const keys = Array.from({ length: 12 }, (_, i) => `k${i}`);
    const pos = (k: string) => (k === 'box' ? { x: 50, y: 50 } : { x: 50, y: 0 });
    const size = { w: 40, h: 30 };
    const { controls, center } = layout('box', keys, size, pos);
    expect(Object.keys(controls)).toHaveLength(12);
    for (const p of Object.values(controls)) {
      expect(Math.abs(depthInside(p, center, size))).toBeLessThanOrEqual(3);
    }
  });
});
