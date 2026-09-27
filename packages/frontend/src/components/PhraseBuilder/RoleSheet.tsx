import { Box, Button, ButtonBase, Drawer, IconButton, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Concept } from "@signi/shared";
import type { SlotConfig } from "./interfaces.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import { MUI_COLOR_HEX } from "./slots.ts";
import { RING_CONTROL } from "./roleControls.ts";
import { ConceptWord } from "../../i18n/ConceptWord.tsx";
import { useUiString } from "../../i18n/useUiString.ts";

export interface RoleSheetProps {
  /** The role whose sheet is open; none closes it. */
  slot: SlotConfig | undefined;
  /** The word the role holds. */
  word: Concept | undefined;
  /** The role's adjectives, each a box of its own with a sheet of its own. */
  adjectives: { slot: SlotConfig; word: Concept | undefined }[];
  /** Every control the role's ring carries (see roleControlsOf). */
  controls: SatelliteIcon[];
  label: (slot: SlotConfig) => string;
  onPress: (icon: SatelliteIcon) => void;
  onReplace: () => void;
  onRemove: () => void;
  onOpenAdjective: (slot: SlotConfig) => void;
  onClose: () => void;
}

/**
 * A role's sheet on a phone (P17): its word (replace, remove), its adjectives, and a grid of every
 * control its ring carries, named. Opened from a row of the Phrase view, or from the bar a tapped
 * canvas box raises.
 */
export function RoleSheet({
  slot,
  word,
  adjectives,
  controls,
  label,
  onPress,
  onReplace,
  onRemove,
  onOpenAdjective,
  onClose,
}: RoleSheetProps) {
  const t = useUiString();
  return (
    <Drawer
      anchor="bottom"
      open={Boolean(slot)}
      onClose={onClose}
      // Over the tab bar, which rides above the page's drawers.
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
      PaperProps={{ sx: { borderRadius: "16px 16px 0 0", maxHeight: "85vh", borderTop: "3px solid", borderColor: slot ? MUI_COLOR_HEX[slot.color] : "divider" } }}
    >
      {slot && (
        <Box data-testid="role-sheet" sx={{ p: 2, pb: "calc(16px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, bgcolor: "divider", mt: -0.5 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: MUI_COLOR_HEX[slot.color] }}>
                {label(slot)}
              </Typography>
              <Typography sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", fontSize: "1.6rem", lineHeight: 1.2 }}>
                {word && <ConceptWord concept={word} />}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              data-testid="role-sheet-change"
              onClick={onReplace}
              sx={{ minHeight: 44, textTransform: "none" }}
            >
              {t("action.replaceWord")}
            </Button>
            <IconButton
              data-testid="role-sheet-remove"
              aria-label={t("action.clearWord")}
              onClick={onRemove}
              sx={{ width: 44, height: 44, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
          {adjectives.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {adjectives.map((adj) => (
                <ButtonBase
                  key={adj.slot.key}
                  data-testid={`role-adjective-${adj.slot.key}`}
                  onClick={() => onOpenAdjective(adj.slot)}
                  sx={{
                    minHeight: 44,
                    px: 1.75,
                    borderRadius: 22,
                    border: `1.5px ${adj.word ? "solid" : "dashed"}`,
                    borderColor: MUI_COLOR_HEX[adj.slot.color],
                    color: MUI_COLOR_HEX[adj.slot.color],
                    fontFamily: '"Lora", Georgia, serif',
                    fontStyle: "italic",
                    fontSize: "1rem",
                  }}
                >
                  {adj.word ? <ConceptWord concept={adj.word} /> : `${label(adj.slot)}…`}
                </ButtonBase>
              ))}
            </Box>
          )}
          {controls.length > 0 && (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
              {controls.map((icon) => (
                <ButtonBase
                  key={icon.key}
                  data-testid={`role-control-${icon.key}`}
                  aria-pressed={icon.directToggle ? icon.isSet : undefined}
                  onClick={() => onPress(icon)}
                  sx={{
                    minHeight: 48,
                    px: 1.25,
                    gap: 1,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: icon.isSet ? MUI_COLOR_HEX[slot.color] : "divider",
                    bgcolor: icon.isSet ? `${MUI_COLOR_HEX[slot.color]}14` : "background.paper",
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "0.85rem",
                    "& svg": { fontSize: 18 },
                  }}
                >
                  <Box component="span" sx={{ display: "grid", placeItems: "center", color: MUI_COLOR_HEX[slot.color], flexShrink: 0 }}>
                    {icon.icon}
                  </Box>
                  <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                    {icon.label}
                    {icon.valueLabel && (
                      <Box component="span" sx={{ display: "block", fontSize: "0.75rem", color: "text.secondary" }}>
                        {icon.valueLabel}
                      </Box>
                    )}
                  </Box>
                  {(icon.link || (RING_CONTROL.test(icon.key) && !icon.isSet)) && (
                    <OpenInNewIcon sx={{ color: "text.secondary", fontSize: "14px !important" }} />
                  )}
                </ButtonBase>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
}
