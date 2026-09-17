import { useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { flushSync } from "react-dom";
import type { Concept } from "@signi/shared";
import { useConceptSearch } from "../../../i18n/useConceptLabel.ts";
import { boxOf, stepBox } from "../../../keyboard/boxes.ts";

/**
 * One word picker's keys, shared by every picker there is.
 *
 * Each vocabulary has a component of its own — the words differ, the list does not — and each had
 * grown its own copy of the same handler, which is why two of them could not reopen a closed list
 * with ↓ while the others could. The list's keys live here now, so a picker cannot diverge without
 * every picker diverging.
 *
 * What a picker answers to (the plan's §4.5):
 *
 *  - type to filter, <kbd>↑</kbd><kbd>↓</kbd> to move, <kbd>↵</kbd> to choose;
 *  - <kbd>⇥</kbd> chooses and moves on to the next box, and with nothing typed just moves on;
 *  - <kbd>esc</kbd> closes the list, and a second <kbd>esc</kbd> steps out onto the box — which,
 *    while a word is being replaced, is what restores it;
 *  - <kbd>↑</kbd> from the first row moves up into the category tabs, where <kbd>←</kbd>
 *    <kbd>→</kbd> switch vocabulary and <kbd>↓</kbd> (or typing) comes back down.
 */

/** The category switch a two-vocabulary picker wears (Noun | Pronoun, Adj | Noun). */
export interface PickerTabs {
  values: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export interface PickerKeys<T> {
  query: string;
  /** The words the query leaves, in corpus order. */
  filtered: T[];
  open: boolean;
  setOpen: (open: boolean) => void;
  highlightedIdx: number;
  setHighlightedIdx: (index: number) => void;
  /** The cursor is up in the tabs rather than in the list; ← → switch vocabulary there. */
  inTabs: boolean;
  setInTabs: (inTabs: boolean) => void;
  /** The scrolling list, so the newly highlighted row can be brought into view. */
  listRef: RefObject<HTMLDivElement | null>;
  /** Everything the input needs: its value and every key it answers to. */
  onChange: (event: { target: { value: string } }) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  /** Take a word by index — what a click on a row does. */
  commit: (index: number) => void;
}

export function usePickerKeys<T extends Concept>({
  items,
  onSelect,
  tabs,
}: {
  items: readonly T[];
  onSelect: (concept: T) => void;
  tabs?: PickerTabs;
}): PickerKeys<T> {
  const matches = useConceptSearch();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [inTabs, setInTabs] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered = items.filter((item) => matches(item, query));

  function reset() {
    setOpen(false);
    setQuery("");
    setHighlightedIdx(0);
    setInTabs(false);
  }

  function commit(index: number) {
    const chosen = filtered[index];
    if (!chosen) return;
    onSelect(chosen);
    reset();
  }

  function moveHighlight(index: number) {
    setHighlightedIdx(index);
    listRef.current?.children[index]?.scrollIntoView({ block: "nearest" });
  }

  /** Switch vocabulary while the cursor is up in the tabs. */
  function stepTab(delta: 1 | -1) {
    if (!tabs) return;
    const at = tabs.values.indexOf(tabs.value);
    const next = tabs.values[Math.min(Math.max(at + delta, 0), tabs.values.length - 1)];
    if (next && next !== tabs.value) tabs.onChange(next);
  }

  /**
   * ⇥: take the highlighted word and move on to the next box.
   *
   * The next box is found *before* the word is taken, and the word is taken synchronously, so the
   * cursor lands where ⇥ pointed rather than where choosing a word would otherwise carry it — a
   * fresh pick auto-advances to the next empty box, which is not always the next one along.
   */
  function commitAndAdvance(event: KeyboardEvent) {
    const box = boxOf(event.currentTarget as Element);
    const next = box ? stepBox(box, 1) : undefined;
    if (query.trim() && filtered.length > 0) {
      event.preventDefault();
      flushSync(() => commit(highlightedIdx));
    } else if (next) {
      // Nothing typed: ⇥ is only a move, and the browser's own tab order would leave the canvas.
      event.preventDefault();
      reset();
    } else {
      return;
    }
    if (next?.isConnected) next.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        // Down out of the tabs is back into the list; down from a closed list reopens it, which
        // is how a picker closed by esc is brought back without retyping.
        if (inTabs) setInTabs(false);
        else if (!open) setOpen(true);
        else if (filtered.length > 0)
          moveHighlight(Math.min(highlightedIdx + 1, filtered.length - 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!open || inTabs) return;
        // Up from the first row leaves the list for the tabs, where ← → switch vocabulary.
        if (highlightedIdx === 0 && tabs) setInTabs(true);
        else moveHighlight(Math.max(highlightedIdx - 1, 0));
        return;
      case "ArrowLeft":
      case "ArrowRight":
        if (!inTabs) return;
        event.preventDefault();
        stepTab(event.key === "ArrowRight" ? 1 : -1);
        return;
      case "Enter":
        event.preventDefault();
        // ↵ in the tabs is the switch itself: the vocabulary is already chosen, so it only comes
        // back down to the rows it now lists.
        if (inTabs) setInTabs(false);
        else if (open && filtered.length > 0) commit(highlightedIdx);
        return;
      case "Tab":
        if (event.shiftKey) return;
        commitAndAdvance(event);
        return;
      case "Escape":
        // The first esc closes the list; the second steps out onto the box, where the canvas keys
        // apply again — and, while a word is being replaced, that is what restores it (SlotNode).
        if (!open) return;
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        setInTabs(false);
        return;
      default:
        // Typing is always about the list, so it comes back down from the tabs.
        if (inTabs && event.key.length === 1) setInTabs(false);
    }
  }

  return {
    query,
    filtered,
    open,
    setOpen,
    highlightedIdx,
    setHighlightedIdx,
    inTabs,
    setInTabs,
    listRef,
    commit,
    onKeyDown,
    onChange: (event) => {
      setQuery(event.target.value);
      setOpen(true);
      setHighlightedIdx(0);
      setInTabs(false);
    },
    onFocus: () => setOpen(true),
    // Long enough for a click on a row to land before the list it is in goes away.
    onBlur: () => {
      setTimeout(() => setOpen(false), 150);
    },
  };
}
