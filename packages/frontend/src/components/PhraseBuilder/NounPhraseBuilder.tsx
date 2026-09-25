import { useLayoutEffect, useRef, useState } from "react";
import { Box, ListSubheader, Menu, MenuItem, TextField } from "@mui/material";
import {
  DETERMINER_CATEGORIES,
  DETERMINER_CATEGORY_VALUES,
  defaultDefiniteness,
  type Definiteness,
} from "@signi/shared";
import { DeterminerToggleBox, VoiceToggleBox } from "./Boxes.tsx";
import { NounKey, NumberSlot, PhraseSelection } from "./interfaces.ts";
import { nodeElRef, PhraseRenderContext, SlotNode } from "./phraseRender.tsx";
import { GroupBox } from "./GroupBox.tsx";
import { adjectiveSlots } from "./slots.ts";
import { useUiString } from "../../i18n/useUiString.ts";
import { activatable } from "../../keyboard/activate.ts";
import { Keycap } from "../../keyboard/Keycap.tsx";
import { digitKeys, useMenuKeys } from "../../keyboard/useMenuKeys.ts";

// The determiner values in menu order, the first ten answering to the digit they are counted by:
// 1–9 then 0, the order they sit on the keyboard. P09-E25's seven quantifiers come after them and
// have no digit (there are none left); they are picked by pointer or arrow key.
const DETERMINER_DIGITS = digitKeys(
  DETERMINER_CATEGORIES.flatMap((category) => DETERMINER_CATEGORY_VALUES[category]),
);

// The determiner picker: the seventeen values are too many to cycle blindly, so the box opens a
// menu grouped by the dimension each value belongs to — article / demonstrative / quantifier,
// section headings the engine renders in the current UI language like any other UI string.
//
// Each row says the value twice over: what it means, as its grammar tradition names it
// ("Multal", "Determinativo", 近称), and beside it, dimmed, the word that will actually appear
// in the phrase ("many", "il", "この"). The name alone would leave a user who has not met
// "paucal" guessing; the word alone — which is all the menu used to show — teaches nothing
// about what the slot is for. Both are UI strings, so both are read in the language being
// written rather than in English.
function DeterminerMenu({
  open,
  getAnchor,
  value,
  onPick,
  onClose,
  numeral,
  onNumeral,
  contrastive = false,
  onContrastive,
}: {
  open: boolean;
  // The anchor as a thunk, not an element: the determiner box may only have appeared in the very
  // commit that opened the menu (the D key reveals it first), and a ref is not attached yet while
  // that render is in flight. It is read in a layout effect, by which time it is, and the menu
  // opens on it before the paint.
  getAnchor: () => HTMLElement | null;
  value: Definiteness;
  onPick: (value: Definiteness) => void;
  onClose: () => void;
  // A cardinal numeral counting the noun (P13), beside the determiner as the engine has it, and its setter.
  numeral?: number;
  onNumeral: (numeral: number | undefined) => void;
  // Whether the demonstrative points away from the rest (P13), and its setter.
  contrastive?: boolean;
  onContrastive: (contrastive: boolean) => void;
}) {
  const t = useUiString();
  // A digit per row, counted down the menu as it is shown: the values are too many to cycle,
  // and too many to arrow through, but each is one keystroke after the D that opened them.
  useMenuKeys({ open, keys: DETERMINER_DIGITS, onPick: (v) => { onPick(v as Definiteness); onClose(); } });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => setAnchor(open ? getAnchor() : null), [open, getAnchor]);
  return (
    <Menu
      anchorEl={anchor}
      open={open && anchor !== null}
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
            aria-keyshortcuts={DETERMINER_DIGITS[v]}
            onClick={() => {
              onPick(v);
              onClose();
            }}
            sx={{
              fontSize: "0.78rem",
              minHeight: 28,
              py: 0.25,
              pl: 1.25,
              gap: 1.5,
              justifyContent: "space-between",
            }}
          >
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {DETERMINER_DIGITS[v] ? (
                <Keycap spec={DETERMINER_DIGITS[v]} />
              ) : (
                // A hidden cap holds the column, so the digitless rows' names line up with the rest.
                <Box component="span" aria-hidden sx={{ visibility: "hidden" }}><Keycap spec="0" /></Box>
              )}
              {t(`determiner.name.${v}`)}
            </Box>
            <Box component="span" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
              {t(`determiner.value.${v}`)}
            </Box>
          </MenuItem>
        )),
        // The distance a demonstrative points at (P13): *that* one, not this — French's "ce lieu-là".
        ...(category === "deixis"
          ? [
              <MenuItem
                key="contrast"
                role="menuitemcheckbox"
                aria-checked={contrastive}
                data-testid="determiner-contrast"
                disabled={value !== "this" && value !== "that"}
                onClick={() => onContrastive(!contrastive)}
                sx={{ fontSize: "0.78rem", minHeight: 28, py: 0.25, pl: 1.25, gap: 1 }}
              >
                <Box component="span" sx={{ width: 14, textAlign: "center" }}>{contrastive ? "✓" : ""}</Box>
                {t("determiner.contrast")}
              </MenuItem>,
            ]
          : []),
        // The quantity a numeral says (P13), "24 hours": a whole number rather than a value to pick.
        ...(category === "quantity"
          ? [
              <Box
                key="numeral"
                sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.5, fontSize: "0.78rem" }}
              >
                {t("determiner.numeral")}
                <TextField
                  size="small"
                  type="number"
                  defaultValue={numeral ?? ""}
                  inputProps={{ min: 1, max: 9999, "data-testid": "determiner-numeral", "aria-label": t("determiner.numeral") }}
                  // The menu reads a typed letter as a jump to its row; the field keeps its keys.
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key !== "Enter") return;
                    const n = Number((e.target as HTMLInputElement).value);
                    onNumeral(Number.isInteger(n) && n >= 1 ? n : undefined);
                    onClose();
                  }}
                  sx={{ width: 72, "& input": { py: 0.25, fontSize: "0.78rem" } }}
                />
              </Box>,
            ]
          : []),
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
  const t = useUiString();

  // Every noun constituent — core roles and motion complements alike — chains up
  // to three adjectives; unrevealed/unlicensed keys simply aren't in renderedSlots.
  // The head comes first, then its adjectives in chain order: that is the order the phrase reads
  // in, and the boxes are painted out of flow, so their DOM order is only the order ⇥ walks them.
  const slotKeys: string[] = [which, ...adjectiveSlots(which)];
  const mySlots = renderedSlots
    .filter((s) => slotKeys.includes(s.key))
    .sort((a, b) => slotKeys.indexOf(a.key) - slotKeys.indexOf(b.key));

  // The dotted ring for this constituent — its main word key is one of its nodes.
  // Absent (e.g. an unrevealed complement) means there's nothing to draw.
  const myRect = groupRects.find((g) => g.nodeKeys.includes(which));

  const definiteness =
    (selection[`${which}Definiteness` as keyof PhraseSelection] as
      | Definiteness
      | undefined) ?? defaultDefiniteness(which);

  // The determiner box doubles as the menu's anchor, so its node ref feeds both the canvas
  // (which measures every box to place the connectors) and the popup. Whether the menu is open is
  // the builder's, not this component's: the noun's D key opens it from wherever the cursor is.
  const determinerBox = useRef<HTMLElement | null>(null);
  const menuOpen = ctx.determinerMenuFor === which;
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
            data-testid={`box-${which}Definiteness`}
            {...activatable(
              makeDragProps(`${which}Definiteness`, () => ctx.onDeterminerMenu(which as NounKey)),
              {
                onActivate: () => ctx.onDeterminerMenu(which as NounKey),
                label: t("satellite.determiner"),
              },
            )}
            ref={(el: HTMLElement | null) => {
              determinerBox.current = el;
              setNodeEl(el);
            }}
          >
            <DeterminerToggleBox value={definiteness} disc={ctx.discs[`${which}Definiteness`]?.r} />
          </Box>
          {/* A sibling of the drag box, never a child: MUI portals the menu into the body,
              but React still propagates its events along the React tree, so nesting it would
              hand every menu-item pointerdown to the box's drag handler — which captures the
              pointer and swallows the pointerup the click needs. */}
          <DeterminerMenu
            open={menuOpen}
            getAnchor={() => determinerBox.current}
            value={definiteness}
            onPick={(value) =>
              ctx.handleSetDefiniteness(which as NounKey, value)
            }
            onClose={() => ctx.onDeterminerMenu(null)}
            numeral={selection.numerals?.[which]}
            onNumeral={(n) => ctx.handleSetNumeral(which as NounKey, n)}
            contrastive={Boolean(selection.contrastives?.[which])}
            onContrastive={(on) => ctx.handleSetContrastive(which as NounKey, on)}
          />
        </>
      )}
      {/* The voice toggle rides the direct object's ring, not the verb's (A01): it is the object
          this promotes to subject, and the verb's own ring is full enough that one more control
          there pushes this very box off its row. `shownMap` is what gates it — the satellite is
          only offered where the passive can be had (see `rawSatellites`). */}
      {which === "directObject" && shownMap.verbVoice && (
        <Box
          data-testid="box-verbVoice"
          {...activatable(makeDragProps("verbVoice", ctx.handleCycleVoice), {
            onActivate: ctx.handleCycleVoice,
            label: t("satellite.voice"),
          })}
          ref={nodeElRef(ctx, "verbVoice")}
        >
          <VoiceToggleBox value={selection.verbVoice ?? "active"} disc={ctx.discs.verbVoice?.r} />
        </Box>
      )}
    </>
  );
}
