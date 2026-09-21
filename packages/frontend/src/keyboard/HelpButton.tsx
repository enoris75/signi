import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useUiString } from "../i18n/useUiString.ts";
import { useKeyPlatform } from "./KeyboardProvider.tsx";
import { keycapText } from "./matchKey.ts";

/**
 * The help icon, in the corner of the window: the way in to the help overlay for whoever is not
 * going to guess that <kbd>?</kbd> opens it.
 *
 * It is one surface with two ways in rather than two surfaces — the icon opens exactly what the
 * key opens, so nothing can be in one and not the other. It rides above the page rather than in
 * the header, since help is wanted from wherever the work is, and it steps up over the console
 * while that is docked at the foot.
 */

export function HelpButton({
  onClick,
  bottom = 16,
}: {
  onClick: () => void;
  /** How far up the page it sits, when something is docked at the foot: the console, when shown. */
  bottom?: number;
}) {
  const platform = useKeyPlatform();
  const t = useUiString();
  const key = keycapText("?", platform);
  // The overlay's own title, so the button and what it opens are called the same.
  const label = t("help.heading");

  return (
    // The tooltip shows the key; the accessible name does not — a screen reader announcing
    // "Help ?" would read the cap as part of the name, and a shortcut belongs in
    // `aria-keyshortcuts`, which is where assistive tech looks for one.
    <Tooltip title={`${label}  ${key}`} placement="left">
      <IconButton
        data-testid="help-button"
        aria-label={label}
        aria-keyshortcuts={key}
        onClick={onClick}
        sx={{
          position: "fixed",
          right: 16,
          bottom,
          zIndex: (theme) => theme.zIndex.drawer + 3,
          width: 36,
          height: 36,
          bgcolor: "background.paper",
          color: "text.secondary",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 2,
          transition: "bottom 0.15s, color 0.15s, border-color 0.15s",
          "&:hover": {
            bgcolor: "background.paper",
            color: "primary.main",
            borderColor: "primary.main",
          },
        }}
      >
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
