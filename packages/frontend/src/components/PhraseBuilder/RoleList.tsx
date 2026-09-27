import { useEffect, useRef, useState, type ReactNode } from "react";
import { Box, Button, ButtonBase, Drawer, IconButton, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { NounKey, PhraseSelection, SlotConfig, SlotKey } from "./interfaces.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import type { PerimeterEntry } from "./satellites/satellites.types.tsx";
import { MUI_COLOR_HEX } from "./slots.ts";
import { ConceptWord } from "../../i18n/ConceptWord.tsx";
import { useUiString } from "../../i18n/useUiString.ts";

/**
 * The Phrase view (P17 phase 2): a period as a list of its roles in reading order, for a phone. A row
 * is a word and what is set on it; a tap opens that role's sheet, which holds the role's ring
 * controls — the very icons the canvas draws round it, each running the handler its click runs — so
 * nothing here is phone-only grammar. The canvas stays mounted behind it (stowed), and a control
 * whose work is drawn on the canvas — a link to another period, a ring of its own — hands over to it.
 */

/** An adjective box rides its noun's row as a chip rather than taking a row of its own. */
const isAdjectiveSlot = (key: SlotKey) => /Adjective\d?$/.test(key);
/** The noun an adjective box belongs to: `subjectAdjective2` → `subject`. */
const adjectiveHead = (key: SlotKey) => key.replace(/Adjective\d?$/, "");
/** Controls that open a ring of their own, drawn on the canvas: owner, conjunct, standard, examples. */
const RING_CONTROL = /(Possessor|Conjunct|Standard|ComparisonSet|Examples)$/;

export interface RoleListProps {
  selection: PhraseSelection;
  /** The boxes the canvas draws, in reading order. */
  slots: SlotConfig[];
  activeSlot: SlotKey | null;
  /** Each box's ring controls, keyed by the box that carries them (the canvas's own). */
  controlsByParent: Record<string, SatelliteIcon[]>;
  /**
   * A noun's own perimeter controls — possessor, relative clause, coordination, its comparison
   * standard and its examples — which the canvas seats on the noun's dotted ring rather than the
   * word's own, so they come from their own bucket (`perimeterByNoun`).
   */
  perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>>;
  /** The verb phrase's complement toggles, and the object's. */
  verbControls: SatelliteIcon[];
  onSelectSlot: (slot: SlotKey) => void;
  onClear: (slot: SlotKey) => void;
  /**
   * A satellite's own value-cycling command (tense, aspect, voice, degree, a modifier's relation, a
   * possessor's role, a conjunction) — the same one its canvas key runs. `true` if one ran; `false`
   * leaves the tap to the satellite's own reveal or direct toggle instead.
   */
  runCommand: (slot: SlotKey, satelliteKey: string) => boolean;
  /** The canvas's own word picker for a box, open for a re-pick when `editing`. */
  picker: (slot: SlotKey, editing: boolean) => ReactNode;
  /** Show the canvas: a control's work is drawn there. */
  onShowCanvas?: () => void;
}

export function RoleList({
  selection,
  slots,
  activeSlot,
  controlsByParent,
  perimeterByNoun,
  verbControls,
  onSelectSlot,
  onClear,
  runCommand,
  picker,
  onShowCanvas,
}: RoleListProps) {
  const t = useUiString();
  const [sheetFor, setSheetFor] = useState<SlotKey | null>(null);
  const [pickerFor, setPickerFor] = useState<{ slot: SlotKey; editing: boolean } | null>(null);
  // The word the picker's box held when it opened: once that changes, the pick is made.
  const pickedFrom = useRef<unknown>(undefined);
  function openPicker(slot: SlotKey, editing: boolean) {
    pickedFrom.current = selection[slot];
    setPickerFor({ slot, editing });
  }
  useEffect(() => {
    if (pickerFor && selection[pickerFor.slot] !== pickedFrom.current) setPickerFor(null);
  }, [pickerFor, selection]);
  // Set by an act in this list; the box it lands the cursor on next, if that box is empty, opens its
  // picker by itself — what a pick's auto-advance does on the canvas, and a revealed box asks for.
  const advancing = useRef(false);

  const label = (slot: SlotConfig) => (slot.labelKey ? t(slot.labelKey) : slot.label);
  const byKey = new Map(slots.map((s) => [s.key, s]));
  const rows = slots.filter((s) => !isAdjectiveSlot(s.key));
  const adjectivesOf = (key: SlotKey) =>
    slots.filter((s) => isAdjectiveSlot(s.key) && adjectiveHead(s.key) === key);

  useEffect(() => {
    if (!advancing.current || !activeSlot) return;
    advancing.current = false;
    if (byKey.has(activeSlot) && !selection[activeSlot]) {
      setSheetFor(null);
      openPicker(activeSlot, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot, slots]);

  function openRow(slot: SlotKey) {
    onSelectSlot(slot);
    if (selection[slot]) setSheetFor(slot);
    else openPicker(slot, false);
  }

  function press(icon: SatelliteIcon) {
    advancing.current = true;
    // A possessor, a conjunct, a standard and examples each open a ring the canvas draws (P13's
    // togglePossessor, addConjunct, …) — the very keymap command its canvas key runs, when the
    // selection currently offers one, else the satellite's own plain reveal.
    const opensRing = RING_CONTROL.test(icon.key) && !icon.isSet;
    const ran = sheetFor ? runCommand(sheetFor, icon.key) : false;
    if (!ran) icon.onToggle();
    // Either way, a ring is drawn on the canvas, never in this sheet, so that is where it opens.
    if (opensRing) {
      setSheetFor(null);
      onShowCanvas?.();
    }
  }

  const sheetSlot = sheetFor ? byKey.get(sheetFor) : undefined;
  const sheetControls = sheetFor
    ? [
        ...(controlsByParent[sheetFor] ?? []),
        ...Object.values(perimeterByNoun[sheetFor as NounKey] ?? {}).filter(
          (icon): icon is SatelliteIcon => Boolean(icon),
        ),
        ...(sheetFor === "verb" ? verbControls : []),
      ]
    : [];

  return (
    <Box data-testid="role-list" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {rows.map((slot) => {
        const concept = selection[slot.key];
        const color = MUI_COLOR_HEX[slot.color];
        // The adjective satellites (whose control opens their own box) carry the current word as
        // their own valueLabel too — already shown as its own chip, so it is left out here.
        const values = (controlsByParent[slot.key] ?? []).filter(
          (i) => i.isSet && i.valueLabel && !isAdjectiveSlot(i.key as SlotKey),
        );
        return (
          <ButtonBase
            key={slot.key}
            data-testid={`role-${slot.key}`}
            onClick={() => openRow(slot.key)}
            sx={{
              minHeight: 60,
              px: 1.5,
              py: 1,
              gap: 1.5,
              justifyContent: "flex-start",
              textAlign: "left",
              borderRadius: 2,
              bgcolor: concept ? "background.paper" : "transparent",
              border: concept ? "1px solid transparent" : "1.5px dashed",
              borderColor: concept ? "transparent" : "divider",
              boxShadow: activeSlot === slot.key && concept ? `inset 0 0 0 2px ${color}` : undefined,
            }}
          >
            <Box
              component="span"
              sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", border: `2.5px solid ${color}`, bgcolor: concept ? `${color}22` : "transparent" }}
            />
            <Box component="span" sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.25 }}>
              <Box component="span" sx={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color }}>
                {label(slot)}
              </Box>
              <Box component="span" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75 }}>
                {adjectivesOf(slot.key).map((adj) => (
                  <Chip key={adj.key} testId={`role-chip-${adj.key}`} color={MUI_COLOR_HEX[adj.color]} italic>
                    {selection[adj.key] ? <ConceptWord concept={selection[adj.key]!} /> : `${label(adj)}…`}
                  </Chip>
                ))}
                <Box component="span" sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", fontSize: "1.15rem", color: concept ? "text.primary" : "text.secondary" }}>
                  {concept ? <ConceptWord concept={concept} /> : t("slot.choose")}
                </Box>
                {values.map((v) => (
                  <Chip key={v.key} color={color}>{v.valueLabel}</Chip>
                ))}
              </Box>
            </Box>
            <ChevronRightIcon sx={{ color: "text.secondary", flexShrink: 0 }} />
          </ButtonBase>
        );
      })}

      {/* A role's sheet: its word, and every control its ring carries, named. */}
      <Drawer
        anchor="bottom"
        open={Boolean(sheetSlot)}
        onClose={() => setSheetFor(null)}
        // Over the tab bar, which rides above the page's drawers.
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
        PaperProps={{ sx: { borderRadius: "16px 16px 0 0", maxHeight: "85vh", borderTop: "3px solid", borderColor: sheetSlot ? MUI_COLOR_HEX[sheetSlot.color] : "divider" } }}
      >
        {sheetSlot && (
          <Box data-testid="role-sheet" sx={{ p: 2, pb: "calc(16px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, bgcolor: "divider", mt: -0.5 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: MUI_COLOR_HEX[sheetSlot.color] }}>
                  {label(sheetSlot)}
                </Typography>
                <Typography sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", fontSize: "1.6rem", lineHeight: 1.2 }}>
                  {selection[sheetSlot.key] && <ConceptWord concept={selection[sheetSlot.key]!} />}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                data-testid="role-sheet-change"
                onClick={() => {
                  setSheetFor(null);
                  openPicker(sheetSlot.key, true);
                }}
                sx={{ minHeight: 44, textTransform: "none" }}
              >
                {t("action.replaceWord")}
              </Button>
              <IconButton
                data-testid="role-sheet-remove"
                aria-label={t("action.clearWord")}
                onClick={() => {
                  setSheetFor(null);
                  onClear(sheetSlot.key);
                }}
                sx={{ width: 44, height: 44, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
            {/* A noun's adjectives, each a box of its own with a sheet of its own. */}
            {adjectivesOf(sheetSlot.key).length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {adjectivesOf(sheetSlot.key).map((adj) => (
                  <ButtonBase
                    key={adj.key}
                    data-testid={`role-adjective-${adj.key}`}
                    onClick={() => {
                      setSheetFor(null);
                      openRow(adj.key);
                    }}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      borderRadius: 22,
                      border: `1.5px ${selection[adj.key] ? "solid" : "dashed"}`,
                      borderColor: MUI_COLOR_HEX[adj.color],
                      color: MUI_COLOR_HEX[adj.color],
                      fontFamily: '"Lora", Georgia, serif',
                      fontStyle: "italic",
                      fontSize: "1rem",
                    }}
                  >
                    {selection[adj.key] ? <ConceptWord concept={selection[adj.key]!} /> : `${label(adj)}…`}
                  </ButtonBase>
                ))}
              </Box>
            )}
            {sheetControls.length > 0 && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
                {sheetControls.map((icon) => (
                  <ButtonBase
                    key={icon.key}
                    data-testid={`role-control-${icon.key}`}
                    aria-pressed={icon.directToggle ? icon.isSet : undefined}
                    onClick={() => press(icon)}
                    sx={{
                      minHeight: 48,
                      px: 1.25,
                      gap: 1,
                      justifyContent: "flex-start",
                      textAlign: "left",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: icon.isSet ? MUI_COLOR_HEX[sheetSlot.color] : "divider",
                      bgcolor: icon.isSet ? `${MUI_COLOR_HEX[sheetSlot.color]}14` : "background.paper",
                      fontFamily: '"Inter", sans-serif',
                      fontSize: "0.85rem",
                      "& svg": { fontSize: 18 },
                    }}
                  >
                    <Box component="span" sx={{ display: "grid", placeItems: "center", color: MUI_COLOR_HEX[sheetSlot.color], flexShrink: 0 }}>
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

      {/* A role's word, chosen with the canvas's own picker for that box. */}
      <Drawer
        anchor="bottom"
        open={Boolean(pickerFor)}
        onClose={() => setPickerFor(null)}
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
        // The picker takes the cursor as it opens, as it does on the canvas, and its list is a popper
        // outside the sheet: neither may the sheet's focus trap take back.
        ModalProps={{ disableAutoFocus: true, disableEnforceFocus: true }}
        // …and should the row that opened it keep the focus, the field takes it once the sheet is in.
        SlideProps={{
          onEntered: (node) => {
            const field = (node as HTMLElement).querySelector<HTMLInputElement>("input");
            if (field && document.activeElement !== field) field.focus();
          },
        }}
        PaperProps={{ sx: { borderRadius: "16px 16px 0 0", height: "85vh" } }}
      >
        {pickerFor && (
          <Box data-testid="word-sheet" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ flex: 1, fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: byKey.get(pickerFor.slot) ? MUI_COLOR_HEX[byKey.get(pickerFor.slot)!.color] : "text.secondary" }}>
                {byKey.get(pickerFor.slot) ? label(byKey.get(pickerFor.slot)!) : pickerFor.slot}
              </Typography>
              <IconButton aria-label={t("action.close")} onClick={() => setPickerFor(null)} sx={{ width: 44, height: 44 }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box
              sx={{ "& .MuiInputBase-root, & input": { fontSize: "16px" }, "& > *": { width: "100% !important", maxWidth: "none !important" } }}
              onClickCapture={() => {
                advancing.current = true;
              }}
              onKeyDownCapture={(e) => {
                if (e.key === "Enter") advancing.current = true;
              }}
            >
              {picker(pickerFor.slot, pickerFor.editing)}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

function Chip({
  children,
  color,
  italic = false,
  testId,
}: {
  children: ReactNode;
  color: string;
  italic?: boolean;
  testId?: string;
}) {
  return (
    <Box
      component="span"
      data-testid={testId}
      sx={{
        px: 1,
        py: 0.1,
        borderRadius: 10,
        fontSize: italic ? "0.9rem" : "0.7rem",
        fontWeight: italic ? 400 : 600,
        fontFamily: italic ? '"Lora", Georgia, serif' : '"Inter", sans-serif',
        fontStyle: italic ? "italic" : "normal",
        border: italic ? `1.5px solid ${color}` : "none",
        bgcolor: `${color}1c`,
        color,
      }}
    >
      {children}
    </Box>
  );
}
