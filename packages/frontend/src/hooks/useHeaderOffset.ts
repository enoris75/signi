import { useEffect, useState } from "react";

/**
 * The height of the page's sticky header, which is painted above the fixed panels: the words panel
 * starts below it, and so does the phone's console tab (P17), or their own title rows (and the
 * controls in them) would be covered by the header and unclickable. Measured rather than assumed — the header's height depends on the font the UI
 * language renders its tagline in. Falls back to 0 if the header isn't there.
 */
export function useHeaderOffset(enabled = true): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const header = document.querySelector("[data-signi-header]");
    if (!header) return;
    setOffset(header.getBoundingClientRect().height);
    if (typeof ResizeObserver === "undefined") return;
    // The border box, not the entry's contentRect: the header's padding and bottom border are
    // part of what covers the panel.
    const observer = new ResizeObserver(() => {
      setOffset(header.getBoundingClientRect().height);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, [enabled]);

  return offset;
}
