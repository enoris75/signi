import { Menu, MenuItem, Typography } from "@mui/material";
import { useUiString } from "../../../i18n/useUiString.ts";
import { Keycap } from "../../../keyboard/Keycap.tsx";
import { useMenuKeys } from "../../../keyboard/useMenuKeys.ts";
import type { SubordinateOption } from "../interfaces.ts";

export interface SubordinateMenuProps {
  // The control the menu opens beside; null while it is closed.
  anchorEl: HTMLElement | null;
  options: readonly SubordinateOption[];
  onSelect: (option: SubordinateOption) => void;
  onClose: () => void;
}

// A row's value: its conjunction for an adverbial clause, else the link kind it starts.
const valueOf = (o: SubordinateOption): string => o.conjunction ?? o.link;

// The subordinate-clause picker (P09-E12 D9), the coordination's ConjunctionMenu for a clause the
// period governs: *that* (its object clause) where the verb takes one and has no object, *to* (its
// infinitive complement) where the verb takes one, and the five subordinating conjunctions whenever
// there is a verb. Each row answers to one letter, so the link is one keystroke after the U that
// opened it.
export function SubordinateMenu({ anchorEl, options, onSelect, onClose }: SubordinateMenuProps) {
  const t = useUiString();
  useMenuKeys({
    open: Boolean(anchorEl),
    keys: Object.fromEntries(options.map((o) => [valueOf(o), o.key])),
    onPick: (value) => {
      const option = options.find((o) => valueOf(o) === value);
      if (option) onSelect(option);
    },
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
          key={valueOf(o)}
          dense
          data-subordinate={valueOf(o)}
          aria-keyshortcuts={o.key}
          onClick={() => onSelect(o)}
          sx={{ gap: 1.5, justifyContent: "space-between" }}
        >
          <Typography component="span" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
            {t(o.labelKey)}
          </Typography>
          <Keycap spec={o.key} />
        </MenuItem>
      ))}
    </Menu>
  );
}
