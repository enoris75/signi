import { Box, ButtonBase, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { SlotConfig } from "./interfaces.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import { MUI_COLOR_HEX } from "./slots.ts";
import { QUICK_BAR_HEIGHT } from "./quickBar.tsx";
import { useUiString } from "../../i18n/useUiString.ts";

/**
 * A tapped canvas box's bar on a phone (P17): its three most-used controls as 44 px pills, named —
 * what a finger can't find among the 20 px icons round its ring — and every other one behind ⋯
 * ("All options"), the role's own sheet. Each pill runs the handler its ring icon runs.
 */
export function BoxQuickBar({
  slot,
  label,
  controls,
  onPress,
  onAll,
  onClose,
}: {
  slot: SlotConfig;
  label: string;
  controls: SatelliteIcon[];
  onPress: (icon: SatelliteIcon) => void;
  onAll: () => void;
  onClose: () => void;
}) {
  const t = useUiString();
  const color = MUI_COLOR_HEX[slot.color];
  const pill = {
    minHeight: 44,
    px: 1,
    gap: 0.5,
    flexShrink: 0,
    borderRadius: 22,
    border: "1px solid",
    fontFamily: '"Inter", sans-serif',
    fontSize: "0.78rem",
    whiteSpace: "nowrap" as const,
    "& svg": { fontSize: 18 },
  };
  return (
    <Box
      data-testid="quick-bar"
      data-slot={slot.key}
      role="toolbar"
      aria-label={label}
      sx={{
        minHeight: QUICK_BAR_HEIGHT,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        bgcolor: "background.paper",
        borderTop: "3px solid",
        borderColor: color,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* The pills scroll sideways rather than wrap, should a language's names run long. */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", gap: 0.5, overflowX: "auto", py: 0.5 }}>
        {controls.map((icon) => (
          <ButtonBase
            key={icon.key}
            data-testid={`quick-${icon.key}`}
            aria-label={icon.valueLabel ? `${icon.label}: ${icon.valueLabel}` : icon.label}
            aria-pressed={icon.directToggle ? icon.isSet : undefined}
            onClick={() => onPress(icon)}
            sx={{
              ...pill,
              borderColor: icon.isSet ? color : "divider",
              bgcolor: icon.isSet ? `${color}14` : "background.paper",
            }}
          >
            <Box component="span" sx={{ display: "grid", placeItems: "center", color }}>
              {icon.icon}
            </Box>
            {icon.valueLabel ?? icon.label}
          </ButtonBase>
        ))}
      </Box>
      {/* Beside the pills rather than among them, so a long name never scrolls it out of sight. */}
      <IconButton
        data-testid="quick-all"
        aria-label={t("action.allOptions")}
        onClick={onAll}
        sx={{ width: 44, height: 44, flexShrink: 0, border: "1px solid", borderColor: color, color }}
      >
        <MoreHorizIcon />
      </IconButton>
      <IconButton aria-label={t("action.close")} onClick={onClose} sx={{ width: 44, height: 44, flexShrink: 0 }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
