import { createContext, useContext, type ReactNode } from "react";
import type { NounAddress, SlotKey } from "../components/PhraseBuilder/interfaces.ts";
import type { WordRef } from "./language/types.ts";

/**
 * What the console shows on the canvas, and what the canvas tells it back — the two views of one
 * phrase kept in step (P02 §4).
 *
 *  - `preview`: the boxes the line being typed would change, drawn dashed until ↵.
 *  - `lit`: the box whose token the pointer is over in the console, lit like a hovered box.
 *  - `cursor`: the box the console's context is on — the ring a role command moves without taking
 *    focus from the prompt.
 *  - `onHover`: a box under the pointer, which lights its tokens in the console.
 *  - `typing`: the prompt has the keyboard. A picker that opens on the canvas meanwhile (the preview
 *    of a new period mounts one) must not take it.
 *
 * Boxes are named by their period and a key of their own (see `markKey`): the slot, and the nested
 * phrase it sits in for a possessor's or a conjunct's.
 */
export interface ConsoleMarks {
  preview: ReadonlySet<string>;
  lit: ReadonlySet<string>;
  cursor?: string;
  /** Periods the preview makes, drawn as dashed cards until ↵. */
  previewPeriods: ReadonlySet<string>;
  /** Links the preview makes, drawn dashed until ↵. */
  previewLinks: ReadonlySet<string>;
  /**
   * The numbers a link command's list gives its targets, worn on the canvas too — so the digit that
   * picks a row names the box or the period it stands for. Keyed by a box's mark, or by
   * `periodMark` for a period.
   */
  numbers: ReadonlyMap<string, number>;
  onHover: (word: WordRef | null) => void;
  typing: boolean;
}

/** A box's name in the marks: its period, the phrase it is in, and its slot. */
export const markKey = (containerId: string, slice: NounAddress | undefined, slot: SlotKey | string): string =>
  `${containerId}|${slice ?? ""}|${slot}`;

export const wordMark = (w: WordRef): string => markKey(w.containerId, w.slice, w.slot);

/** A period's name in the marks, for what is marked on its card. */
export const periodMark = (containerId: string): string => `period|${containerId}`;

const ConsoleMarksContext = createContext<ConsoleMarks | null>(null);

export function ConsoleMarksProvider({ marks, children }: { marks: ConsoleMarks | null; children: ReactNode }) {
  return <ConsoleMarksContext.Provider value={marks}>{children}</ConsoleMarksContext.Provider>;
}

/** The console's marks, if a console is on the page. */
export function useConsoleMarks(): ConsoleMarks | null {
  return useContext(ConsoleMarksContext);
}

/**
 * Whether a picker opening now may take the keyboard. Not while the console's prompt has it: a
 * preview can mount a picker on the canvas at every keystroke, and each would pull the caret out of
 * the line being typed.
 */
export function useMayTakeFocus(): boolean {
  return !useContext(ConsoleMarksContext)?.typing;
}
