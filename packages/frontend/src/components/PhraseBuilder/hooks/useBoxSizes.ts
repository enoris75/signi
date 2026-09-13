import { useLayoutEffect, useRef, useState } from "react";
import { DEFAULT_NODE_SIZE } from "../graph.ts";
import { sameBoxSizes, type BoxSizeMap } from "../measure.ts";

// Measured pixel sizes of each node's content, keyed by node key. Each word's solid ring and
// each satellite's disc is sized from it, and so everything seated round them on the canvas.
//
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
  // A node's content as of the last paint. Everything that reasons about a node's size —
  // the ring or disc round it, the ring layout seated about them — reads it through here, so
  // they agree on how big a node is. A node not yet measured reads as a labelled one-word
  // box.
  const sizeOf = (key: string) => boxSizes[key] ?? DEFAULT_NODE_SIZE;
  return { slotEls, boxSizes, sizeOf };
}
