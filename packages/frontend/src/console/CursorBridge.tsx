import { useEffect } from "react";
import { useCursorContext } from "../keyboard/KeyboardProvider.tsx";
import type { PhraseConsoleModel } from "./usePhraseConsole.ts";

/**
 * The canvas cursor and the console's context are one value (P02 §4.4): a box taken on the canvas —
 * clicked, or reached by the keys — is where the console's next command attaches. The cursor lives in
 * the keyboard provider, below the page that owns the console, so this reports it from in there.
 */
export function CursorBridge({ follow }: { follow: PhraseConsoleModel["followCursor"] }) {
  const cursor = useCursorContext();
  const element = cursor?.cursor.element;
  const slot = cursor?.box?.slot;
  const path = cursor?.box?.path;
  useEffect(() => {
    if (element) follow(element, slot, path);
    // `follow` is rebuilt every render; the cursor is what moves.
  }, [element, slot, path]);
  return null;
}
