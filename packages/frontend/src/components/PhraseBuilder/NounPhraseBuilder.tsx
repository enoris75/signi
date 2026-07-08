import { Box } from "@mui/material";
import type { Definiteness } from "@signi/shared";
import { DeterminerToggleBox } from "./Boxes.tsx";
import { NumberSlot, PhraseSelection } from "./interfaces.ts";
import { PhraseRenderContext, SlotNode } from "./phraseRender.tsx";
import { GroupBox } from "./GroupBox.tsx";

// Renders one noun constituent — its noun box, chained adjective boxes, and the
// number/gender toggle boxes — all onto the shared canvas. `which` picks the
// constituent: a core role (subject / direct-object / indirect-object) or one of
// the motion complements. Slots/toggles that aren't currently active render as
// nothing, so the parent can mount one per possible noun unconditionally.
export function NounPhraseBuilder({
  which,
  ctx,
}: {
  which: NumberSlot;
  ctx: PhraseRenderContext;
}) {
  const { renderedSlots, shownMap, makeDragProps, selection, groupRects } = ctx;

  // Every noun constituent — core roles and motion complements alike — chains up
  // to two adjectives; unrevealed/unlicensed keys simply aren't in renderedSlots.
  const slotKeys = [`${which}Adjective`, `${which}Adjective2`, which];
  const mySlots = renderedSlots.filter((s) => slotKeys.includes(s.key));

  // The dashed box for this constituent — its main word key is one of its nodes.
  // Absent (e.g. an unrevealed complement) means there's nothing to draw.
  const myRect = groupRects.find((g) => g.nodeKeys.includes(which));

  const definiteness = selection[
    `${which}Definiteness` as keyof PhraseSelection
  ] as Definiteness | undefined;

  return (
    <>
      {myRect && <GroupBox rect={myRect} ctx={ctx} />}
      {mySlots.map((slot) => (
        <SlotNode key={slot.key} slot={slot} ctx={ctx} />
      ))}
      {shownMap[`${which}Definiteness`] && (
        <Box
          {...makeDragProps(`${which}Definiteness`, () =>
            ctx.handleCycleDefiniteness(which),
          )}
        >
          <DeterminerToggleBox value={definiteness ?? "definite"} />
        </Box>
      )}
    </>
  );
}
