// Positioning math for satellite reveal controls: each control is pinned to its
// core box's border on the ray toward the satellite it governs, so the control
// migrates around the box to face its node and the connector leaves the box
// cleanly from the control. Shared by the button layer (SatelliteControls) and,
// via the returned map, the connector layer (buildGraph reads it as each link's
// origin), so the geometry lives in exactly one place.

type Pt = { x: number; y: number };
type Size = { w: number; h: number };

// Where the ray from a box's center toward a target crosses the box border,
// padded outward a touch so a control placed there straddles the edge. Both
// points and the returned point are in canvas pixels.
function borderPoint(center: Pt, size: Size, target: Pt, pad: number): Pt {
  const hw = size.w / 2 + pad;
  const hh = size.h / 2 + pad;
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (dx === 0 && dy === 0) return { x: center.x, y: center.y - hh };
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

// Place a box's satellite controls on its border, each on the ray toward its
// target node. Controls that land on the same spot (targets collinear with the
// box center) are fanned out along that border edge so they don't overlap.
function layoutControls(
  center: Pt,
  size: Size,
  targets: { key: string; target: Pt }[],
): Record<string, Pt> {
  const GAP = 22; // control button + a hair of breathing room, in px
  const raw = targets.map((t) => ({
    key: t.key,
    p: borderPoint(center, size, t.target, 2),
    dx: t.target.x - center.x,
    dy: t.target.y - center.y,
  }));
  // Cluster near-coincident border points.
  const clusters: (typeof raw)[] = [];
  for (const it of raw) {
    const cl = clusters.find(
      (c) => Math.hypot(c[0].p.x - it.p.x, c[0].p.y - it.p.y) < GAP,
    );
    if (cl) cl.push(it);
    else clusters.push([it]);
  }
  const out: Record<string, Pt> = {};
  for (const items of clusters) {
    if (items.length === 1) {
      out[items[0].key] = items[0].p;
      continue;
    }
    // Spread the cluster along the tangent of its shared outward direction —
    // which, on a box edge, runs along that edge.
    const bx = items.reduce((s, i) => s + i.p.x, 0) / items.length;
    const by = items.reduce((s, i) => s + i.p.y, 0) / items.length;
    const adx = items.reduce((s, i) => s + i.dx, 0) / items.length;
    const ady = items.reduce((s, i) => s + i.dy, 0) / items.length;
    const len = Math.hypot(adx, ady) || 1;
    const tx = -ady / len;
    const ty = adx / len;
    const sorted = [...items].sort((a, b) => (a.key < b.key ? -1 : 1));
    sorted.forEach((it, i) => {
      const off = (i - (sorted.length - 1) / 2) * GAP;
      out[it.key] = { x: bx + tx * off, y: by + ty * off };
    });
  }
  return out;
}

// Compute the canvas-pixel position of every satellite reveal control, keyed by
// satellite key. Controls sharing a core box are laid out together so colliding
// ones fan out along the border edge. Skips boxes not yet measured.
export function computeControlPositions({
  satelliteIconsByParent,
  boxSizes,
  pos,
  svgSize,
}: {
  // Satellite reveal icons grouped by the core box (slot key) they ride.
  satelliteIconsByParent: Record<string, readonly { key: string }[]>;
  // Measured pixel size of each core box, keyed by slot key.
  boxSizes: Record<string, Size>;
  // A node's canvas position in percent (0–100).
  pos: (key: string) => Pt;
  svgSize: Size;
}): Record<string, Pt> {
  const pxPt = (key: string) => ({
    x: (pos(key).x / 100) * svgSize.w,
    y: (pos(key).y / 100) * svgSize.h,
  });
  const controlPos: Record<string, Pt> = {};
  for (const [parentKey, icons] of Object.entries(satelliteIconsByParent)) {
    const size = boxSizes[parentKey];
    if (!size) continue;
    Object.assign(
      controlPos,
      layoutControls(
        pxPt(parentKey),
        size,
        icons.map((icon) => ({ key: icon.key, target: pxPt(icon.key) })),
      ),
    );
  }
  return controlPos;
}
