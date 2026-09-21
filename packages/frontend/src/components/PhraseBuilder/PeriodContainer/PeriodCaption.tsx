import { Box, Typography } from "@mui/material";
import { useUiString } from "../../../i18n/useUiString.ts";
import { useInputModality } from "../../../keyboard/KeyboardProvider.tsx";
import { periodLabel } from "./functions/periodAppearance.ts";
import type { ClauseControls } from "./PeriodContainer.types.ts";

export interface PeriodCaptionProps {
  controls: ClauseControls;
  // Whether the canvas is drawn yet — the hint tells the user what to do next.
  showCanvas: boolean;
}

// The header caption: "<the part this period plays> · <what to do next>". What to do next on the
// canvas depends on what is driving: a click on a slot, or the arrows and then typing (P01 §3.1).
export function PeriodCaption({ controls, showCanvas }: PeriodCaptionProps) {
  const t = useUiString();
  const modality = useInputModality();
  const onCanvas = modality === "keyboard" ? t("hint.chooseWordKeyboard") : t("hint.chooseWord");
  return (
    <Typography
      sx={{
        fontFamily: '"Inter", sans-serif',
        fontSize: "0.62rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      {periodLabel(controls, t)}
      <Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
        · {showCanvas ? onCanvas : t("hint.chooseSubject")}
      </Box>
    </Typography>
  );
}
