/**
 * Which box an arrow key moves the cursor to.
 *
 * The boxes are freely placed on the canvas — a user drags them wherever the phrase reads best —
 * so DOM order says nothing about what is "to the left". The search is geometric: from the
 * cursor's centre, keep the candidates whose centre lies inside a 90° cone in the direction
 * pressed, and take the nearest, counting sideways drift double so a box straight ahead beats a
 * nearer one off to the side.
 *
 * Pure, and measured in whatever coordinates the caller hands it (the app passes viewport rects,
 * so ↑/↓ cross from one period into the next without the search knowing periods exist).
 */

export type Direction = "left" | "up" | "right" | "down";

export interface BoxRect {
  key: string;
  /** Viewport (or any single shared) coordinates; only the centre is read. */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Centre {
  key: string;
  cx: number;
  cy: number;
}

const centre = (r: BoxRect): Centre => ({
  key: r.key,
  cx: r.x + r.width / 2,
  cy: r.y + r.height / 2,
});

/** How far sideways drift counts against a candidate, relative to distance along the direction. */
const PERPENDICULAR_WEIGHT = 2;

/**
 * The box `dir` moves to from `from`, or undefined at the edge (nothing lies that way).
 * `candidates` may include `from` itself; it is never its own answer.
 */
export function nearestInDirection(
  from: BoxRect,
  candidates: readonly BoxRect[],
  dir: Direction,
): string | undefined {
  const origin = centre(from);
  let best: { key: string; score: number } | undefined;

  for (const candidate of candidates) {
    if (candidate.key === from.key) continue;
    const { key, cx, cy } = centre(candidate);
    const dx = cx - origin.cx;
    const dy = cy - origin.cy;
    // How far the candidate lies along the direction pressed, and how far it drifts across it.
    const along = dir === "left" ? -dx : dir === "right" ? dx : dir === "up" ? -dy : dy;
    const across = Math.abs(dir === "left" || dir === "right" ? dy : dx);
    // The 90° cone: the candidate must be genuinely that way, not merely on that side. Boxes whose
    // centres coincide (a satellite seated exactly on its word) are not in any direction at all.
    if (along <= 0 || across > along) continue;
    const score = Math.hypot(dx, dy) + PERPENDICULAR_WEIGHT * across;
    if (!best || score < best.score) best = { key, score };
  }

  return best?.key;
}
