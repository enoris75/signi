import { useEffect } from "react";
import { matchesKeySpec } from "./matchKey.ts";
import { useKeyPlatform } from "./KeyboardProvider.tsx";

/**
 * An accelerator per row, so a choice is one keystroke after the key that opened the menu (the
 * plan's §3.7).
 *
 * The rows keep the <kbd>↑</kbd><kbd>↓</kbd><kbd>↵</kbd><kbd>esc</kbd> that MUI's own menu gives
 * them; this only adds the letter or digit each row answers to. It listens while the menu is open
 * and nowhere else, in the capture phase — a MUI menu moves focus onto a row, and a row is a
 * button, which would otherwise take a bare letter as a type-ahead of its own.
 */
export function useMenuKeys({
  open,
  keys,
  onPick,
  onDismiss,
}: {
  open: boolean;
  /** The key each row answers to, by row value, in menu order. */
  keys: Readonly<Record<string, string>>;
  onPick: (value: string) => void;
  /**
   * Any other key, for a listener that is not a menu. A real menu keeps the keystroke (MUI traps
   * focus inside it), but an *armed* control is only waiting for its one key: anything else means
   * the user has moved on, and it stops waiting rather than lying in wait.
   */
  onDismiss?: () => void;
}): void {
  const platform = useKeyPlatform();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const hit = Object.entries(keys).find(([, spec]) =>
        matchesKeySpec(spec, event, platform),
      );
      if (!hit) {
        onDismiss?.();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onPick(hit[0]);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
    // Deliberately every render: the effect closes over `keys` and the callbacks, and a menu is
    // open for a keystroke or two — re-subscribing costs nothing and keeps them current.
  });
}

/**
 * The digits a menu's rows answer to, in the order they are shown: 1–9 then 0, which is the order
 * they sit on the keyboard and so the order a user counts down the rows in.
 */
export function digitKeys(values: readonly string[]): Record<string, string> {
  return Object.fromEntries(
    values.slice(0, 10).map((value, i) => [value, String((i + 1) % 10)]),
  );
}
