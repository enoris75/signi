import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type {
  PhraseContainer,
  PhraseLink,
} from "../components/PhraseBuilder/interfaces.ts";

/**
 * Undo and redo for the workspace.
 *
 * What is undone is the *phrase* — the words, the grammar on them, and the links between periods —
 * and not the canvas layout. Where a box has been dragged to, whether a period is compact, how
 * tall its canvas is: those are how the phrase is being looked at, not what it says, and each
 * period owns them. Undoing them would mean lifting that state up through the height-rebase and
 * overlap-resolution effects that write back into it, which is a change of its own (the plan's
 * open question 2).
 *
 * History is recorded by *watching* the state rather than by wrapping each setter: React may run a
 * state updater twice, and a side effect inside one would record twice with it. An effect after
 * the commit sees each change exactly once.
 */

export interface Workspace {
  containers: PhraseContainer[];
  links: PhraseLink[];
}

export interface WorkspaceHistory {
  containers: PhraseContainer[];
  links: PhraseLink[];
  /** Both keep the setter signature they replace, so nothing downstream knows about history. */
  setContainers: Dispatch<SetStateAction<PhraseContainer[]>>;
  setLinks: Dispatch<SetStateAction<PhraseLink[]>>;
  /** Replace the whole workspace at once — loading or importing one. */
  replace: (workspace: Workspace) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Changes closer together than this are one step back.
 *
 * Cycling a tense with <kbd>T</kbd><kbd>T</kbd><kbd>T</kbd> is one thought, not three, and so is a
 * removal that drops a period and the links that touched it in the same breath. Long enough to
 * gather a burst of keystrokes, short enough that two deliberate edits stay two.
 */
const COALESCE_MS = 400;

/** How far back it is worth being able to go. Beyond this the oldest step is forgotten. */
const DEPTH = 50;

export function useWorkspaceHistory(initial: Workspace): WorkspaceHistory {
  const [present, setPresent] = useState<Workspace>(initial);
  const past = useRef<Workspace[]>([]);
  const future = useRef<Workspace[]>([]);
  // The state the last recorded step ended at, and when it was recorded.
  const seen = useRef<Workspace>(initial);
  const at = useRef(0);
  // Set while undo or redo is writing, so the step they restore is not recorded as a new one.
  const restoring = useRef(false);
  // Only to re-render when undo or redo becomes possible; the stacks themselves are refs, since
  // nothing renders from their contents.
  const [depth, setDepth] = useState({ past: 0, future: 0 });

  useEffect(() => {
    if (present === seen.current) return;
    const previous = seen.current;
    seen.current = present;
    if (restoring.current) {
      restoring.current = false;
      setDepth({ past: past.current.length, future: future.current.length });
      return;
    }
    const now = Date.now();
    // A burst is one step: the entry already on the stack is the state before the burst began,
    // so adding another would make the user press undo once per keystroke.
    if (now - at.current > COALESCE_MS || past.current.length === 0) {
      past.current.push(previous);
      if (past.current.length > DEPTH) past.current.shift();
    }
    at.current = now;
    // Anything done after an undo is a new branch, and the redos it grew from are gone.
    future.current = [];
    setDepth({ past: past.current.length, future: 0 });
  }, [present]);

  const step = (from: Workspace[], to: Workspace[]) => {
    const next = from.pop();
    if (!next) return;
    to.push(present);
    restoring.current = true;
    // The next edit starts a step of its own, however soon it comes.
    at.current = 0;
    setPresent(next);
  };

  return {
    containers: present.containers,
    links: present.links,
    setContainers: (update) =>
      setPresent((prev) => {
        const containers = typeof update === "function" ? update(prev.containers) : update;
        return containers === prev.containers ? prev : { ...prev, containers };
      }),
    setLinks: (update) =>
      setPresent((prev) => {
        const links = typeof update === "function" ? update(prev.links) : update;
        return links === prev.links ? prev : { ...prev, links };
      }),
    replace: (workspace) => setPresent(workspace),
    undo: () => step(past.current, future.current),
    redo: () => step(future.current, past.current),
    canUndo: depth.past > 0,
    canRedo: depth.future > 0,
  };
}
