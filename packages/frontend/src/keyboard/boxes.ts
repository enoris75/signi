/**
 * The word boxes of the whole page, and how the cursor walks them.
 *
 * One list, in document order, so ⇥ carries on from the last box of a period into the first of the
 * next — and so the word picker, which is inside a box, can move on to the one after it without
 * knowing anything about periods.
 */

/** Every box on the page, in document order — the cursor moves over these and nothing else. */
export function boxElements(): HTMLElement[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>("[data-kb-box]"));
}

/** The box `el` sits in — itself, or the box its open picker belongs to. */
export function boxOf(el: Element | null | undefined): HTMLElement | null {
  return el?.closest?.("[data-kb-box]") ?? null;
}

/** The next or previous box in reading order, or undefined at either end of the document. */
export function stepBox(from: HTMLElement, delta: 1 | -1): HTMLElement | undefined {
  const all = boxElements();
  return all[all.indexOf(from) + delta];
}
