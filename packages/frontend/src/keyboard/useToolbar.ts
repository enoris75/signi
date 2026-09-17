import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * A row of controls that is *one* stop in the page's tab order, walked with <kbd>←</kbd>
 * <kbd>→</kbd> (the plan's §4.6).
 *
 * The header holds seven controls. Left as seven tab stops they sit between a keyboard user and
 * the canvas, which is where the work is; as one stop, <kbd>⇥</kbd> passes the header in a single
 * press and the arrows walk it when that is what was wanted. This is the roving-tabindex pattern
 * ARIA gives `role="toolbar"`, which is what the row is.
 */
export function useToolbar() {
  const ref = useRef<HTMLDivElement | null>(null);
  // Which control the one tab stop is on. It follows the arrows and whatever is clicked.
  const [at, setAt] = useState(0);

  const controls = (): HTMLElement[] =>
    Array.from(
      ref.current?.querySelectorAll<HTMLElement>('button, [href], [role="combobox"]') ?? [],
    ).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
    );

  // Exactly one control is reachable by ⇥; the rest are reached from it with the arrows. Each is
  // marked, so what the row manages is visible on the page rather than inferred from a selector.
  useEffect(() => {
    const all = controls();
    all.forEach((el, i) => {
      el.setAttribute("tabindex", i === at ? "0" : "-1");
      el.setAttribute("data-kb-toolbar", "");
    });
  });

  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    const all = controls();
    if (all.length === 0) return;
    event.preventDefault();
    const from = all.findIndex((el) => el === document.activeElement);
    const next = (from + delta + all.length) % all.length;
    setAt(next);
    all[next]?.focus();
  }

  // A click moves the tab stop with it, so ⇥ comes back to where the row was last used.
  function onFocus(event: { target: EventTarget }) {
    const i = controls().findIndex((el) => el === event.target);
    if (i !== -1) setAt(i);
  }

  return { ref, role: "toolbar" as const, onKeyDown, onFocus };
}
