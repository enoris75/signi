import { useLayoutEffect, useRef, useState } from "react";
import { DEFAULT_NODE_SIZE } from "../graph.ts";
import { sameBoxSizes, type BoxSizeMap } from "../measure.ts";

// Measured pixel sizes of each core word box, keyed by slot key. Needed to place each
// satellite reveal control on the box border facing its satellite (and to start that
// satellite's connector from there).
//
// Word boxes register themselves in `slotEls`; after every render each is measured. Runs on
// every commit; settles because it only sets state on an actual size change.
export function useBoxSizes() {
  const slotEls = useRef<Map<string, HTMLElement>>(new Map());
  const [boxSizes, setBoxSizes] = useState<BoxSizeMap>({});
  useLayoutEffect(() => {
    const next: BoxSizeMap = {};
    for (const [key, el] of slotEls.current) {
      const r = el.getBoundingClientRect();
      next[key] = { w: r.width, h: r.height };
    }
    setBoxSizes((prev) => (sameBoxSizes(prev, next) ? prev : next));
  });
  // A node's box as of the last paint. Everything that reasons about a node's footprint —
  // the dotted box that wraps it, the overlap resolver, the tidy layout — reads it through
  // here, so the three agree on where a box's edges are. A node not yet measured reads as
  // the nominal box the paddings already leave room for.
  const sizeOf = (key: string) => boxSizes[key] ?? DEFAULT_NODE_SIZE;
  return { slotEls, boxSizes, sizeOf };
}
