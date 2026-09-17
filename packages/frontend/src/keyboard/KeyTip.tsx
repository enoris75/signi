import { Box } from "@mui/material";
import { BADGE_OVERHANG, BADGE_SIZE } from "../components/PhraseBuilder/ringLayout.ts";
import { keycapLabels } from "./matchKey.ts";
import { useInputModality, useKeyPlatform } from "./KeyboardProvider.tsx";

/**
 * The letter a control answers to, worn on its corner while the cursor is on the box that control
 * belongs to. An ink badge rather than a paper cap: a cap would read as one more button on a ring
 * that is already a row of them, while the badge reads as a label *of* the button under it.
 *
 * Shown only in keyboard modality, so a mouse user's canvas is the one they have always seen; the
 * same key is in that control's tooltip either way, which is how the mouse teaches the keyboard.
 */
export function KeyTip({ spec, show = true }: { spec: string | undefined; show?: boolean }) {
  const modality = useInputModality();
  const platform = useKeyPlatform();
  if (!spec || !show || modality !== "keyboard") return null;
  return (
    <Box
      component="span"
      aria-hidden
      data-kb-tip={spec}
      sx={{
        position: "absolute",
        // Off the control's bottom-right corner, by the overhang the ring layout leaves room for:
        // the ring seats its controls far enough apart that the badge lands on nothing (see
        // CONTROL_GAP), so the two numbers are declared there and read here.
        left: "100%",
        top: "100%",
        transform: `translate(${-(1 - BADGE_OVERHANG) * 100}%, ${-(1 - BADGE_OVERHANG) * 100}%)`,
        display: "grid",
        placeItems: "center",
        minWidth: BADGE_SIZE,
        height: BADGE_SIZE,
        px: 0.25,
        borderRadius: 0.5,
        bgcolor: "primary.dark",
        color: "common.white",
        fontFamily: '"Inter", sans-serif',
        fontSize: "0.55rem",
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 0,
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      {keycapLabels(spec, platform).join("")}
    </Box>
  );
}
