import { useRef, useState } from "react";
import { Box, ListSubheader, Menu, MenuItem } from "@mui/material";
import {
  DEFINITENESS_LABELS,
  DETERMINER_CATEGORIES,
  DETERMINER_CATEGORY_VALUES,
  defaultDefiniteness,
  type Definiteness,
} from "@signi/shared";
import { DeterminerToggleBox } from "./Boxes.tsx";
import { NounKey, NumberSlot, PhraseSelection } from "./interfaces.ts";
import { nodeElRef, PhraseRenderContext, SlotNode } from "./phraseRender.tsx";
import { GroupBox } from "./GroupBox.tsx";
import { adjectiveSlots } from "./slots.ts";
import { useUiString } from "../../i18n/useUiString.ts";

// The determiner picker: the ten values are too many to cycle blindly, so the box opens a
// menu grouped by the dimension each value belongs to — article / demonstrative / quantifier,
// section headings the engine renders in the current UI language like any other UI string.
function DeterminerMenu({
  anchorEl,
  value,
  onPick,
  onClose,
}: {
  anchorEl: HTMLElement | null;
  value: Definiteness;
  onPick: (value: Definiteness) => void;
  onClose: () => void;
}) {
  const t = useUiString();
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      MenuListProps={{ dense: true }}
    >
      {DETERMINER_CATEGORIES.flatMap((category) => [
        <ListSubheader
          key={category}
          sx={{
            lineHeight: 1.8,
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {t(`determiner.category.${category}`)}
        </ListSubheader>,
        ...DETERMINER_CATEGORY_VALUES[category].map((v) => (
          <MenuItem
            key={v}
            selected={v === value}
            onClick={() => {
              onPick(v);
              onClose();
            }}
            sx={{ fontSize: "0.78rem", minHeight: 28, py: 0.25, pl: 2.5 }}
          >
            {DEFINITENESS_LABELS[v]}
          </MenuItem>
        )),
      ])}
    </Menu>
  );
}

// Renders one noun constituent — its noun box, chained adjective boxes, and the
// number/gender toggle boxes — all onto the shared canvas. `which` picks the
// constituent: a core role (subject / direct object) or one of
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
  // to three adjectives; unrevealed/unlicensed keys simply aren't in renderedSlots.
  const slotKeys: string[] = [...adjectiveSlots(which), which];
  const mySlots = renderedSlots.filter((s) => slotKeys.includes(s.key));

  // The dashed box for this constituent — its main word key is one of its nodes.
  // Absent (e.g. an unrevealed complement) means there's nothing to draw.
  const myRect = groupRects.find((g) => g.nodeKeys.includes(which));

  const definiteness =
    (selection[`${which}Definiteness` as keyof PhraseSelection] as
      | Definiteness
      | undefined) ?? defaultDefiniteness(which);

  // The determiner box doubles as the menu's anchor, so its node ref feeds both the canvas
  // (which measures every box to place the connectors) and the popup.
  const determinerBox = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const setNodeEl = nodeElRef(ctx, `${which}Definiteness`);

  return (
    <>
      {myRect && <GroupBox rect={myRect} ctx={ctx} />}
      {mySlots.map((slot) => (
        <SlotNode key={slot.key} slot={slot} ctx={ctx} />
      ))}
      {shownMap[`${which}Definiteness`] && (
        <>
          <Box
            {...makeDragProps(`${which}Definiteness`, () => setMenuOpen(true))}
            ref={(el: HTMLElement | null) => {
              determinerBox.current = el;
              setNodeEl(el);
            }}
          >
            <DeterminerToggleBox value={definiteness} />
          </Box>
          {/* A sibling of the drag box, never a child: MUI portals the menu into the body,
              but React still propagates its events along the React tree, so nesting it would
              hand every menu-item pointerdown to the box's drag handler — which captures the
              pointer and swallows the pointerup the click needs. */}
          <DeterminerMenu
            anchorEl={menuOpen ? determinerBox.current : null}
            value={definiteness}
            onPick={(value) =>
              ctx.handleSetDefiniteness(which as NounKey, value)
            }
            onClose={() => setMenuOpen(false)}
          />
        </>
      )}
    </>
  );
}
