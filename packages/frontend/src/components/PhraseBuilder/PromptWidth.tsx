import { Box } from "@mui/material";
import type { ReactNode } from "react";

// The font every picker's field is painted in. The sizer below has to match it exactly, so the
// field and the fields that measure it read it from here.
export const PICKER_FONT = { fontFamily: '"Inter", sans-serif', fontSize: "0.8rem" } as const;

/**
 * A picker's field, as wide as the prompt it holds. A word picker sits inside a solid ring drawn
 * round what it measures, so the field can neither take the browser's default width (~20ch, which
 * swells the ring round a prompt far shorter) nor a width of its own (which cuts a longer
 * language's prompt off mid-word — "digita un sostant"). So the prompt paints itself invisibly
 * under the field, in the same cell of a one-cell grid: the cell is as wide as that text, and the
 * field fills it. The `size` attribute can't do this — it counts average characters, and so
 * overshoots a proportional font by about a third.
 */
export function PromptWidth({ prompt, children }: { prompt: string; children: ReactNode }) {
  return (
    <Box sx={{ display: "inline-grid", width: "100%", "& > *": { gridArea: "1 / 1" } }}>
      <Box
        aria-hidden
        // Out of the flow's height as well as out of sight: the field is what gives the cell its
        // height, as it does without a sizer.
        sx={{ ...PICKER_FONT, visibility: "hidden", whiteSpace: "pre", height: 0 }}
      >
        {prompt}
      </Box>
      {children}
    </Box>
  );
}
