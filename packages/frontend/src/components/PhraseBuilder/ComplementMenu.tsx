import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { useRef } from "react";
import type { ComplementType } from "@signi/shared";
import { useUiString } from "../../i18n/useUiString.ts";
import { Keycap } from "../../keyboard/Keycap.tsx";
import { useMenuKeys } from "../../keyboard/useMenuKeys.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import { COMPLEMENT_KEYS } from "./slots.ts";

/**
 * The verb's complements, as a menu.
 *
 * The complement toggles ride the verb phrase's dotted ring, where each is a small icon a mouse
 * finds by hovering. A keyboard has no hovering, and nine icons is too many letters to hang off one
 * box, so <kbd>+</kbd> gathers exactly the complements *this* verb licenses into one list, each one
 * keystroke away — and puts the object's fold-away at the foot of it, the one other thing the
 * ring's controls offer (the plan's §3.7).
 */
export function ComplementMenu({
  open,
  getAnchor,
  icons,
  directObject,
  onClose,
}: {
  open: boolean;
  // A thunk, not an element: the menu hangs off the verb box, which the canvas positions (see
  // NounPhraseBuilder's DeterminerMenu for the same reason).
  getAnchor: () => HTMLElement | null;
  /** The complement toggles the verb phrase's ring is showing, in ring order. */
  icons: SatelliteIcon[];
  /** The object's fold-away control, when the verb takes an object at all. */
  directObject?: SatelliteIcon;
  onClose: () => void;
}) {
  const t = useUiString();
  const rows = [...icons, ...(directObject ? [directObject] : [])];
  const keyOf = (key: string) =>
    key === "directObject" ? "O" : COMPLEMENT_KEYS[key as ComplementType];

  // The row last picked, so the cursor can be placed once the menu is out of the way.
  const picked = useRef<string | null>(null);

  function pick(key: string) {
    picked.current = key;
    rows.find((icon) => icon.key === key)?.onToggle();
    onClose();
  }

  /**
   * Where the cursor goes once the menu has gone, and not a moment before.
   *
   * Adding a complement puts a new box on the canvas and that box's picker opens — which is the
   * whole point of picking from here. But the menu is a modal: while it is closing it still traps
   * focus, so a picker that opens underneath is pulled straight back out of it. Placing the cursor
   * on the way *out* (`onExited`) is what lets it stay where it was put.
   */
  function settle() {
    const key = picked.current;
    picked.current = null;
    const box =
      key && key !== "directObject"
        ? document.querySelector<HTMLElement>(`[data-kb-box="${key}"]`)
        : null;
    // The new complement's picker, else the box itself, else the verb box the menu hung off —
    // which is where a menu closed without a pick leaves it.
    (box?.querySelector("input") ?? box ?? getAnchor())?.focus();
  }

  useMenuKeys({
    open,
    keys: Object.fromEntries(rows.map((icon) => [icon.key, keyOf(icon.key)])),
    onPick: pick,
  });

  return (
    // No heading: the artwork's "ADD A COMPLEMENT" would be a new catalogue string, and every
    // string here is rendered by the engine from a seeded period. The rows name themselves, and
    // the menu hangs off the verb box it was opened from.
    <Menu
      anchorEl={() => getAnchor()!}
      open={open}
      onClose={onClose}
      disableRestoreFocus
      TransitionProps={{ onExited: settle }}
      MenuListProps={{ dense: true }}
    >
      {rows.map((icon) => (
        <MenuItem
          key={icon.key}
          data-testid={`complement-row-${icon.key}`}
          selected={icon.isSet || icon.active}
          aria-keyshortcuts={keyOf(icon.key)}
          onClick={() => pick(icon.key)}
          sx={{ fontSize: "0.78rem", minHeight: 28, py: 0.25, gap: 1.5, justifyContent: "space-between" }}
        >
          <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="span" sx={{ display: "flex", color: "text.secondary" }}>
              {icon.icon}
            </Box>
            {icon.label}
          </Box>
          <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* A complement already on the canvas says so, since picking it again takes it away. */}
            {(icon.isSet || icon.active) && (
              <Typography component="span" sx={{ color: "text.disabled", fontSize: "0.72rem" }}>
                {icon.valueLabel ?? t("action.turnOff")}
              </Typography>
            )}
            <Keycap spec={keyOf(icon.key)} />
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );
}
