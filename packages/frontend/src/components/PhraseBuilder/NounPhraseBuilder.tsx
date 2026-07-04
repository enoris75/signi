import { Box } from "@mui/material";
import { NumberToggleBox, GenderToggleBox } from "./Boxes.tsx";
import { NumberSlot, PhraseSelection } from "./interfaces.ts";
import { NUMBER_TOGGLE_KEY, GENDER_TOGGLE_KEY } from "./slots.ts";
import { PhraseRenderContext, SlotNode } from "./phraseRender.tsx";

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
  const { renderedSlots, shownMap, makeDragProps, selection } = ctx;

  // Every noun constituent — core roles and motion complements alike — chains up
  // to two adjectives; unrevealed/unlicensed keys simply aren't in renderedSlots.
  const slotKeys = [`${which}Adjective`, `${which}Adjective2`, which];
  const mySlots = renderedSlots.filter((s) => slotKeys.includes(s.key));

  const number = selection[`${which}Number` as keyof PhraseSelection] as
    | "singular"
    | "plural"
    | undefined;
  const gender = selection[`${which}Gender` as keyof PhraseSelection] as
    | "masc"
    | "fem"
    | undefined;

  return (
    <>
      {mySlots.map((slot) => (
        <SlotNode key={slot.key} slot={slot} ctx={ctx} />
      ))}
      {shownMap[`${which}Number`] && (
        <Box
          {...makeDragProps(NUMBER_TOGGLE_KEY(which), () =>
            ctx.handleToggleNumber(which),
          )}
        >
          <NumberToggleBox value={number ?? "singular"} />
        </Box>
      )}
      {shownMap[`${which}Gender`] && (
        <Box
          {...makeDragProps(GENDER_TOGGLE_KEY(which), () =>
            ctx.handleToggleGender(which),
          )}
        >
          <GenderToggleBox value={gender ?? "masc"} />
        </Box>
      )}
    </>
  );
}
