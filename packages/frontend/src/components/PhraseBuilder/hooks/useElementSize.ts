import React, { useLayoutEffect, useState } from "react";

type Size = { w: number; h: number };

// The element's rendered size, tracked by a ResizeObserver. Measured once before paint on
// attach, then on every resize. The observer binds to whatever node `ref` holds when the
// effect runs, so pass a `remountKey` that changes whenever that element mounts or unmounts
// (a conditionally rendered canvas, say), or it keeps watching the detached node.
export function useElementSize(
  ref: React.RefObject<HTMLElement | null>,
  initial: Size,
  remountKey: unknown,
): Size {
  const [size, setSize] = useState<Size>(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setSize({ w: width, h: height });
    const obs = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      setSize({ w, h });
    });
    obs.observe(el);
    return () => obs.disconnect();
    // `ref` is a stable object; only the element behind it changes, which `remountKey` tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remountKey]);
  return size;
}
