import { COLLAPSIBLE_GROUPS } from "../slots.ts";

/**
 * Fold the collapsed dotted rings into the shown map. Compact view collapses every group at once;
 * otherwise just the individually collapsed ones — `collapsedGroups` is left as it is, so manual
 * collapses come back when compact turns off.
 *
 * A collapsed group's child nodes are forced hidden. Group rects, rendered slots and edges all
 * derive from the shown map, so that shrinks each collapsed ring down to just its main word.
 */
export function applyCollapse({
  rawShownMap,
  collapsedGroups,
  compact,
}: {
  // Which satellites are shown before any collapse (see buildSatellites).
  rawShownMap: Record<string, boolean>;
  // The groups the user collapsed one by one, keyed by group label.
  collapsedGroups: Record<string, boolean>;
  compact: boolean;
}): {
  // What everything downstream reads — the collapse icon, the drag guard — rather than
  // `collapsedGroups`.
  effectiveCollapsed: Record<string, boolean>;
  // The main words of the collapsed groups, which hide their own reveal icons.
  collapsedMainKeys: Set<string>;
  shownMap: Record<string, boolean>;
} {
  const effectiveCollapsed: Record<string, boolean> = compact
    ? Object.fromEntries(COLLAPSIBLE_GROUPS.map((g) => [g.label, true]))
    : collapsedGroups;
  const collapsedHiddenKeys = new Set<string>();
  const collapsedMainKeys = new Set<string>();
  for (const g of COLLAPSIBLE_GROUPS) {
    if (!effectiveCollapsed[g.label]) continue;
    collapsedMainKeys.add(g.mainKey);
    for (const k of g.childKeys) collapsedHiddenKeys.add(k);
  }
  const shownMap = collapsedHiddenKeys.size
    ? {
        ...rawShownMap,
        ...Object.fromEntries([...collapsedHiddenKeys].map((k) => [k, false])),
      }
    : rawShownMap;
  return { effectiveCollapsed, collapsedMainKeys, shownMap };
}
