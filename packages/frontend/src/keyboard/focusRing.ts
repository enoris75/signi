import type { SystemStyleObject, Theme } from "@mui/system";
import type { SlotConfig } from "../components/PhraseBuilder/interfaces.ts";

/**
 * The ring the box under the cursor wears: 2px in the constituent's own colour, 3px outside the
 * box. An outline rather than a border, so it never shifts the layout the ring geometry is
 * measured from, and offset so it stays clear of the dashed *pick target* and *preview* styles a
 * box wears in the same place.
 *
 * `:focus-visible` rather than `:focus`, so clicking a box to select it does not leave a ring
 * behind — a mouse user's canvas is the one they have always seen.
 */
export function focusRing(color: SlotConfig["color"] = "primary"): SystemStyleObject<Theme> {
  return {
    "&:focus": { outline: "none" },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: (theme: Theme) => theme.palette[color].main,
      outlineOffset: "3px",
      borderRadius: 1,
    },
  };
}
