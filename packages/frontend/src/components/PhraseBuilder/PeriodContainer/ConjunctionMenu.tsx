import { Menu, MenuItem, Typography } from "@mui/material";
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
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "center", horizontal: "right" }}
      transformOrigin={{ vertical: "center", horizontal: "left" }}
    >
      {options.map((o) => (
        <MenuItem key={o.value} dense onClick={() => onSelect(o.value)}>
          <Typography component="span" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
            {o.label}
          </Typography>
          <Typography
            component="span"
            sx={{ ml: 1, color: "text.disabled", fontSize: "0.72rem" }}
          >
            {o.hint}
          </Typography>
        </MenuItem>
      ))}
    </Menu>
  );
}
