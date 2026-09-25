import { useEffect, useState } from "react";
import { matchesKeySpec } from "./matchKey.ts";
import { useKeyPlatform } from "./KeyboardProvider.tsx";

/**
 * Picking a link target by number (the plan's §3.6).
 *
 * Five gestures in the app are the same three beats — start a pick somewhere, choose among the
 * places it could land, commit — and a mouse chooses by pointing. A keyboard needs the choices
 * named, so while a pick is in flight every eligible target is numbered where it sits, and its
 * digit takes it. <kbd>⇥</kbd> walks them for a list too long to count, <kbd>↵</kbd> takes the one
 * walked to, and <kbd>esc</kbd> abandons the pick.
 *
 * The targets are found in the page rather than passed in: each pick kind already marks its own
 * (a noun box, a period card), and marking is all they have in common — so one hook serves the
 * relative clause, the if-condition, the join, the instrument and the possessor reference alike.
 */

/** The attribute an eligible target wears. Its value is what the pick commits when taken. */
export const PICK_TARGET = "data-kb-pick-target";
/** Written onto each target while a pick runs: the number its badge shows and its digit. */
export const PICK_INDEX = "data-kb-pick-index";

/** As many as can be named by a single digit; beyond that, ⇥ and ↵ still reach them. */
const MAX_DIGITS = 9;

/**
 * Is the key's target a field being typed in — a word picker's input? Its ↵ and ⇥ are its own:
 * ↵ chooses the highlighted word and ⇥ chooses it and moves on (usePickerKeys). A pick can be in
 * flight while one has the cursor — opening a noun's owner starts the pointing gesture *and* draws
 * the owner ring's picker, focused — and taking ↵ for the walk there made typing "dog" + ↵ point
 * at the subject instead of choosing the dog (A375). The digits and esc stay the pick's.
 */
function inTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true;
  return target instanceof HTMLInputElement && !["button", "checkbox", "radio"].includes(target.type);
}

function targets(): HTMLElement[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>(`[${PICK_TARGET}]`));
}

/**
 * Number the eligible targets and bind the keys that take them, while `active`.
 *
 * Returns which target the walk is on, so the banner can say so. The numbering is written to the
 * DOM rather than handed to each target as a prop: the targets are scattered across every period
 * on the page, and their order is the order they are *in* the page.
 */
export function usePickKeys({
  active,
  onPick,
  onCancel,
}: {
  active: boolean;
  /** Take the target — its `data-kb-pick-target` value names it to the pick that started. */
  onPick: (target: HTMLElement) => void;
  onCancel: () => void;
}): { count: number; walked: number } {
  const platform = useKeyPlatform();
  const [walked, setWalked] = useState(0);
  const [count, setCount] = useState(0);

  // Number them after every render, since revealing a box or filling a word changes the set.
  useEffect(() => {
    const found = targets();
    found.forEach((el, i) => el.setAttribute(PICK_INDEX, String(i + 1)));
    setCount(found.length);
    if (!active) setWalked(0);
    return () => found.forEach((el) => el.removeAttribute(PICK_INDEX));
  });

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const found = targets();
      if (found.length === 0) return;
      const take = (el: HTMLElement | undefined) => {
        if (!el) return;
        event.preventDefault();
        event.stopPropagation();
        onPick(el);
      };
      // A digit names a target wherever the cursor is: the numbers are on the page, so there is
      // nothing to walk to first.
      const digit = Number(event.key);
      if (digit >= 1 && digit <= Math.min(MAX_DIGITS, found.length)) {
        take(found[digit - 1]);
        return;
      }
      const fieldKeys = inTextField(event.target);
      if (!fieldKeys && (matchesKeySpec("Tab", event, platform) || matchesKeySpec("Shift+Tab", event, platform))) {
        event.preventDefault();
        event.stopPropagation();
        setWalked((at) => (at + (event.shiftKey ? -1 : 1) + found.length) % found.length);
        return;
      }
      if (!fieldKeys && matchesKeySpec("Enter", event, platform)) {
        take(found[walked]);
        return;
      }
      if (matchesKeySpec("Escape", event, platform)) {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }
    };
    // Capture, ahead of the cursor's own listener: while a pick runs these keys are the pick's.
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  });

  return { count, walked };
}

/**
 * The badge an eligible target wears, drawn from the number written onto it. CSS rather than an
 * element, so a target needs to know nothing about the pick beyond being one — and so the number
 * can be assigned in page order, which no single component can see.
 */
export const pickBadgeSx = {
  [`&[${PICK_INDEX}]::before`]: {
    content: `attr(${PICK_INDEX})`,
    position: "absolute",
    top: -10,
    left: -10,
    zIndex: 6,
    display: "grid",
    placeItems: "center",
    minWidth: 18,
    height: 18,
    px: 0.5,
    borderRadius: 0.75,
    bgcolor: "primary.dark",
    color: "common.white",
    fontFamily: '"Inter", sans-serif',
    fontSize: "0.65rem",
    fontWeight: 700,
    lineHeight: 1,
    pointerEvents: "none",
  },
} as const;
