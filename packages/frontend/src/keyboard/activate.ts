import type { KeyboardEvent } from "react";
import type { SystemStyleObject, Theme } from "@mui/system";
import type { SlotConfig } from "../components/PhraseBuilder/interfaces.ts";
import { focusRing } from "./focusRing.ts";

/**
 * What makes a canvas box that is not a word — the tense, aspect and determiner toggles — answer
 * to the keyboard: it becomes a button, ↵ and Space run it, and it wears the cursor's ring.
 *
 * These are not part of the walk the arrows and ⇥ move over: that walk is between *words* (the
 * plan's §2). Each of them is reached by its letter from the box it belongs to (<kbd>T</kbd>,
 * <kbd>A</kbd>, <kbd>D</kbd>), and by the browser's own focus order for anyone navigating that way.
 *
 * It takes the box's drag props rather than standing beside them, because both carry an `sx`: the
 * drag's places the box on the canvas, and spreading one over the other would drop that.
 */
export function activatable<P extends { sx: SystemStyleObject<Theme> }>(
  drag: P,
  {
    onActivate,
    label,
    color = "secondary",
  }: { onActivate: () => void; label: string; color?: SlotConfig["color"] },
): P {
  return {
    ...drag,
    sx: { ...drag.sx, ...focusRing(color) },
    tabIndex: 0,
    role: "button",
    "aria-label": label,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      // Only the box itself; a key pressed on something inside it belongs to that.
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      onActivate();
    },
  };
}
