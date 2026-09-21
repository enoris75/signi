import { Menu, MenuItem, Typography } from "@mui/material";
import { useUiString } from "../../../i18n/useUiString.ts";
import { Keycap } from "../../../keyboard/Keycap.tsx";
import { useMenuKeys } from "../../../keyboard/useMenuKeys.ts";
import { COORD_CONJUNCTION_KEYS } from "../interfaces.ts";
import type {
  COORD_CONJUNCTION_OPTIONS,
  CoordConjunction,
} from "../interfaces.ts";

export interface ConjunctionMenuProps {
  // The control the menu opens beside; null while it is closed.
  anchorEl: HTMLElement | null;
  options: typeof COORD_CONJUNCTION_OPTIONS;
  onSelect: (conjunction: CoordConjunction) => void;
  onClose: () => void;
}

// The conjunction picker for a new coordination (AND / OR / BUT / THAT IS / THEREFORE / THEN — a
// command offers only the four that can join two commands), each shown with the relation it
// expresses.
export function ConjunctionMenu({
  anchorEl,
  options,
  onSelect,
  onClose,
}: ConjunctionMenuProps) {
  const t = useUiString();
  // One letter per conjunction, so the join is one keystroke after the J that opened the menu.
  // Only the conjunctions on offer are bound: a command coordinates with four of the six.
  useMenuKeys({
    open: Boolean(anchorEl),
    keys: Object.fromEntries(options.map((o) => [o.value, COORD_CONJUNCTION_KEYS[o.value]])),
    onPick: (value) => onSelect(value as CoordConjunction),
  });
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "center", horizontal: "right" }}
      transformOrigin={{ vertical: "center", horizontal: "left" }}
    >
      {options.map((o) => (
        <MenuItem
          key={o.value}
          dense
          aria-keyshortcuts={COORD_CONJUNCTION_KEYS[o.value]}
          onClick={() => onSelect(o.value)}
          sx={{ gap: 1.5, justifyContent: "space-between" }}
        >
          <Typography component="span" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
            {t(o.labelKey)}
            <Typography
              component="span"
              sx={{ ml: 1, color: "text.disabled", fontSize: "0.72rem" }}
            >
              {t(o.hintKey)}
            </Typography>
          </Typography>
          <Keycap spec={COORD_CONJUNCTION_KEYS[o.value]} />
        </MenuItem>
      ))}
    </Menu>
  );
}
