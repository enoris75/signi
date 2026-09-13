// Positioning math for satellite reveal controls: each control is pinned to its
// core box's border on the ray toward the satellite it governs, so the control
// migrates around the box to face its node and the connector leaves the box
// cleanly from the control. Shared by the button layer (SatelliteControls) and,
// via the returned map, the connector layer (buildGraph reads it as each link's
// origin), so the geometry lives in exactly one place.

type Pt = { x: number; y: number };
type Size = { w: number; h: number };

// Spacing between adjacent satellite controls fanned along a box edge, in px:
// one control button (20px) plus a hair of breathing room. Exported so a box can
// be sized wide enough to seat the controls that ride its border without overlap.
export const CONTROL_GAP = 22;

// How far outside the box's border a control's center sits, so the control straddles the edge.
const BORDER_PAD = 2;

// The radius the control track rounds each corner with. A control spread around a corner walks
// this arc rather than a square turn, which would fold two neighbours CONTROL_GAP apart along the
// track to ~15px apart on the screen — overlapping buttons. On an arc this wide, CONTROL_GAP of
// track is still a full button's width of chord. It also lands a corner control on the box's own
// rounded corner.
const CORNER_RADIUS = 15;

// A segment of the control track: its length, and the point `t` px along it.
type Segment = { length: number; at: (t: number) => Pt };

// The track controls ride on a box: its border pushed out by BORDER_PAD, corners rounded by
// CORNER_RADIUS. Positions on it are a single arc-length `s`, clockwise from the start of the
// top edge. Laying controls out in that one coordinate keeps every one of them on the border
// however far they are spread — pushed past a corner, a control turns onto the next edge
// instead of drifting off the box or into it.
function controlTrack(center: Pt, size: Size) {
  const hw = size.w / 2 + BORDER_PAD;
  const hh = size.h / 2 + BORDER_PAD;
  const r = Math.min(CORNER_RADIUS, hw, hh);
  // The rectangle of the corner arcs' centres: the track is this rectangle grown by `r`.
  const x0 = center.x - hw + r;
  const x1 = center.x + hw - r;
  const y0 = center.y - hh + r;
  const y1 = center.y + hh - r;
  const arc = (cx: number, cy: number, from: number): Segment => ({
    length: (Math.PI / 2) * r,
    at: (t) => ({ x: cx + r * Math.cos(from + t / r), y: cy + r * Math.sin(from + t / r) }),
  });
  const segments: Segment[] = [
    { length: x1 - x0, at: (t) => ({ x: x0 + t, y: y0 - r }) }, // top
    arc(x1, y0, -Math.PI / 2),
    { length: y1 - y0, at: (t) => ({ x: x1 + r, y: y0 + t }) }, // right
    arc(x1, y1, 0),
    { length: x1 - x0, at: (t) => ({ x: x1 - t, y: y1 + r }) }, // bottom
    arc(x0, y1, Math.PI / 2),
    { length: y1 - y0, at: (t) => ({ x: x0 - r, y: y1 - t }) }, // left
    arc(x0, y0, Math.PI),
  ];
  const starts: number[] = [];
  let length = 0;
  for (const seg of segments) {
    starts.push(length);
    length += seg.length;
  }

  // Where the ray from the box's center toward `target` crosses the track.
  function project(target: Pt): number {
    const dx = target.x - center.x;
    const dy = target.y - center.y;
    // The ray's exit through the padded rectangle, then its nearest point on the rounded track:
    // clamped into the arc-centre rectangle, the offset left over says which edge or corner it is.
    const scale = dx === 0 && dy === 0 ? 0 : 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
    const px = dx === 0 && dy === 0 ? center.x : center.x + dx * scale;
    const py = dx === 0 && dy === 0 ? center.y - hh : center.y + dy * scale;
    const qx = Math.min(Math.max(px, x0), x1);
    const qy = Math.min(Math.max(py, y0), y1);
    const ox = px - qx;
    const oy = py - qy;
    const angle = Math.atan2(oy, ox);
    if (ox === 0) return oy < 0 ? starts[0] + (qx - x0) : starts[4] + (x1 - qx);
    if (oy === 0) return ox > 0 ? starts[2] + (qy - y0) : starts[6] + (y1 - qy);
    if (ox > 0 && oy < 0) return starts[1] + r * (angle + Math.PI / 2);
    if (ox > 0) return starts[3] + r * angle;
    if (oy > 0) return starts[5] + r * (angle - Math.PI / 2);
    return starts[7] + r * (angle + Math.PI);
  }

  function at(s: number): Pt {
    let rest = ((s % length) + length) % length;
    for (const seg of segments) {
      if (rest <= seg.length) return seg.at(rest);
      rest -= seg.length;
    }
    return segments[0].at(0);
  }

  return { length, project, at };
}

// Spread positions on a closed track of `length` so neighbours sit at least `gap` apart, moving
// each as little as it can: a run of controls crowding one spot is centred on where its controls
// aimed, and the controls keep the order they aimed in. `items` must be sorted by `s`.
function spreadOnLoop<T extends { s: number }>(items: T[], length: number, gap: number) {
  const n = items.length;
  if (n * gap >= length) {
    // More controls than the track has room for: share it out evenly.
    return items.map((it, i) => ({ item: it, s: items[0].s + (i * length) / n }));
  }
  // Cut the loop open at its widest empty stretch, so the runs that need spreading are all
  // contiguous in the unrolled order.
  let cut = 0;
  let widest = -1;
  for (let i = 0; i < n; i++) {
    const next = i + 1 < n ? items[i + 1].s : items[0].s + length;
    if (next - items[i].s > widest) {
      widest = next - items[i].s;
      cut = (i + 1) % n;
    }
  }
  let order = [...items.slice(cut), ...items.slice(0, cut)].map((item, i) => ({
    item,
    s: i < n - cut ? item.s : item.s + length,
  }));

  type Group = { members: typeof order; start: number };
  const end = (g: Group) => g.start + (g.members.length - 1) * gap;
  const mean = (members: typeof order) => members.reduce((sum, m) => sum + m.s, 0) / members.length;
  for (;;) {
    // Merge each group that crowds the one before it, re-centring the merged run on the mean of
    // where its members aimed.
    const groups: Group[] = [];
    for (const m of order) {
      let group: Group = { members: [m], start: m.s };
      while (groups.length > 0 && group.start < end(groups[groups.length - 1]) + gap) {
        const members = [...groups.pop()!.members, ...group.members];
        group = { members, start: mean(members) - ((members.length - 1) * gap) / 2 };
      }
      groups.push(group);
    }
    const first = groups[0];
    const last = groups[groups.length - 1];
    if (groups.length > 1 && end(last) + gap > first.start + length) {
      // The last run grew round the loop into the first: roll it to the front and merge again.
      order = [
        ...last.members.map((m) => ({ ...m, s: m.s - length })),
        ...groups.slice(0, -1).flatMap((g) => g.members),
      ];
      continue;
    }
    return groups.flatMap((g) => g.members.map((m, i) => ({ item: m.item, s: g.start + i * gap })));
  }
}

// Place a box's satellite controls on its border, each on the ray toward its
// target node. Controls that crowd one another (targets in much the same direction
// from the box center) are spread apart along the border, turning corners if they must.
function layoutControls(
  center: Pt,
  size: Size,
  targets: { key: string; target: Pt }[],
): Record<string, Pt> {
  const track = controlTrack(center, size);
  const aimed = targets
    .map((t) => ({ key: t.key, s: track.project(t.target) }))
    .sort((a, b) => a.s - b.s || (a.key < b.key ? -1 : 1));
  const out: Record<string, Pt> = {};
  if (aimed.length === 0) return out;
  for (const { item, s } of spreadOnLoop(aimed, track.length, CONTROL_GAP)) {
    out[item.key] = track.at(s);
  }
  return out;
}

// Compute the canvas-pixel position of every satellite reveal control, keyed by
// satellite key. Controls sharing a core box are laid out together so crowding
// ones spread out along the border. Skips boxes not yet measured.
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
