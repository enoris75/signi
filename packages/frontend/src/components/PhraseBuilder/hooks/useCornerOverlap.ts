import { useLayoutEffect, useState, type RefObject } from "react";

type Size = { w: number; h: number };
const NONE: Size = { w: 0, h: 0 };

// How far an element floated over the canvas's top-right corner — the period's own controls, in
// compact view — reaches into the canvas: `w` in from the canvas's right edge to the element's
// left, `h` down from the canvas's top to the element's bottom. Zero on both when it doesn't
// reach in. Measured while `active`, and again whenever either element resizes (`remountKey`
// tracks the canvas element being swapped). Neither element's place depends on what the canvas
// lays out beneath the overlay, so the packing that reads this can't feed back into it.
export function useCornerOverlap(
  overlayRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLElement | null>,
  active: boolean,
  remountKey: unknown,
): Size {
  const [overlap, setOverlap] = useState<Size>(NONE);
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!active || !overlay || !canvas) return;
    const measure = () => {
      const o = overlay.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      const w = Math.max(0, c.right - o.left);
      const h = Math.max(0, o.bottom - c.top);
      const next = w > 0 && h > 0 ? { w, h } : NONE;
      setOverlap((prev) => (prev.w === next.w && prev.h === next.h ? prev : next));
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(overlay);
    obs.observe(canvas);
    return () => obs.disconnect();
    // The refs are stable objects; only the elements behind them change, which `remountKey` tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, remountKey]);
  return overlap;
}
