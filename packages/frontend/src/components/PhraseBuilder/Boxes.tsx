import {
  alpha,
  Box,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  type SxProps,
  type Theme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignCenterIcon from "@mui/icons-material/VerticalAlignCenter";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import LoopIcon from "@mui/icons-material/Loop";
import FlipToBackIcon from "@mui/icons-material/FlipToBack";
import FlipToFrontIcon from "@mui/icons-material/FlipToFront";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import {
  CAUSE_SENTIMENTS,
  Concept,
  PATH_SPECIFIERS,
  type Aspect,
  type CauseSentiment,
  type Definiteness,
  type PathSpecifier,
  type Tense,
  type UiStringKey,
  type Voice,
} from "@signi/shared";
import { ReactNode } from "react";
import { useUiString } from "../../i18n/useUiString.ts";
import { useConceptLabel } from "../../i18n/useConceptLabel.ts";
import { SlotCategory, SlotConfig } from "./interfaces";
import { clearTitle, revealTitle } from "./canvasCommands.ts";
import { KeyTip } from "../../keyboard/KeyTip.tsx";
import { digitKeys, useMenuKeys } from "../../keyboard/useMenuKeys.ts";
import { keycapText } from "../../keyboard/matchKey.ts";
import { useKeyPlatform } from "../../keyboard/KeyboardProvider.tsx";

// The light wash a set or active box wears in its colour. The theme defines only each colour's
// main/light/dark (no 50…900 scale), so the wash is `main` at MUI's selected opacity.
const wash = (color: SlotConfig["color"]) => (theme: Theme) =>
  alpha(theme.palette[color].main, theme.palette.action.selectedOpacity);

// The deeper wash of the box *in hand* — the one the letters command, and the one a further click
// opens for re-picking. A filled box already wears `wash` for its word and, inside a ring, its
// colour on the border too, so holding the cursor needs a shade of its own or a click on a word
// would land with nothing to show for it.
const held = (color: SlotConfig["color"]) => (theme: Theme) =>
  alpha(theme.palette[color].main, theme.palette.action.selectedOpacity * 2.5);

// The word-category switch (Noun | Pronoun, or Noun | Adj) shown both on an empty box and
// inside the open word picker. Purely a vocabulary chooser — the two places share one
// `value`/`onChange` so they stay in lock-step. `stopPropagation` on pointer-down keeps a
// click from starting a box drag (on the canvas) or blurring the picker input (in a popper).
export function CategoryToggle({
  options,
  value,
  onChange,
}: {
  options: SlotCategory[];
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useUiString();
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, v) => v && onChange(v)}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      sx={{
        mb: 0.5,
        "& .MuiToggleButton-root": {
          px: 0.75,
          py: 0.1,
          fontFamily: '"Inter", sans-serif',
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          lineHeight: 1.4,
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {options.map((o) => (
        <ToggleButton key={o.value} value={o.value}>
          {t(o.labelKey)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export interface SatelliteIcon {
  key: string;
  icon: ReactNode;
  label: string;
  // The catalog key `label` is rendered from, when it has one — which also tells the reveal control
  // which part it shows and hides (see canvasCommands).
  labelKey?: UiStringKey;
  active: boolean;
  isSet: boolean;
  // valued = always carries a value (number / gender / polarity); its icon reads
  // as colored even at the default, and its tooltip always shows the current value.
  valued: boolean;
  valueLabel?: string;
  // directToggle = clicking flips a value in place rather than revealing a box.
  // Squared off so shape alone separates the two kinds of control.
  directToggle?: boolean;
  // link = clicking starts a link to a period in another container, or removes it (the relative
  // clause, the instrumental). It reveals no box, so its tooltip never offers to show or hide one.
  link?: boolean;
  onToggle: () => void;
}

// A word slot's shape on the canvas. A constituent's word sits inside its solid `ring`; a satellite
// is a smaller `disc` on its constituent's orbit. Either is drawn behind the content at radius `r`,
// which the ring layout derives from the content's own size — so the content is what gets measured
// and the circle never feeds back into it. Undefined draws the plain box the empty opening picker
// uses, which has no constituent round it.
export type SlotShape = { r: number; kind: "ring" | "disc" };

// The least width a word picker takes inside a ring or a disc; a longer prompt widens it.
const PICKER_WIDTH = 100;

// The width a circle's title wraps at — the same width the picker takes in there, so a title and
// a prompt fill the circle alike. A circle is sized from its content's diagonal, so a long slot
// name laid on one line ("complemento di stato in luogo", "adverbiale Bestimmung des Ortes")
// swells the ring to twice the width of the word it names; wrapping trades a line of height for
// much less width, and the diagonal — so the circle — shrinks with it. Wider wraps less but
// buys nothing: the diagonal grows back sideways as fast as the extra line saves in height.
const LABEL_WIDTH = PICKER_WIDTH;

// The small round clear button: on a solid ring it is one of the ring's controls, placed by the
// ring layout; on a disc it sits on the disc's rim at half past one.
export function ClearButton({
  label,
  labelKey,
  onClear,
  sx,
}: {
  label: string;
  // The key the word's box is titled from, naming the part the button clears ("clear the adjective").
  labelKey?: UiStringKey;
  onClear: () => void;
  sx?: SxProps<Theme>;
}) {
  const t = useUiString();
  return (
    <Tooltip title={clearTitle(t, label, labelKey)}>
      <IconButton
        size="small"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClear}
        sx={[
          {
            width: 18,
            height: 18,
            p: 0,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            opacity: 0.7,
            "&:hover": { opacity: 1, bgcolor: "background.paper" },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <ClearIcon sx={{ fontSize: 11 }} />
      </IconButton>
    </Tooltip>
  );
}

export function SlotBox({
  slot,
  concept,
  isActive,
  onClear,
  emptyContent,
  categoryToggle,
  footer,
  dimmed = false,
  highlight = false,
  editing = false,
  shape,
  rim,
  preview = false,
  lit = false,
  consoleCursor = false,
}: {
  slot: SlotConfig;
  concept?: Concept;
  isActive: boolean;
  onClear: () => void;
  emptyContent?: ReactNode;
  // The word-category switch (Noun | Pronoun / Noun | Adj) for a switchable slot, shown at
  // the top of the box only while it is empty (no word chosen). Undefined for a
  // single-vocabulary slot or a filled box.
  categoryToggle?: ReactNode;
  // Extra content rendered below a filled slot's word (e.g. the noun-modifier relation chip).
  footer?: ReactNode;
  // dimmed = this noun is a relative-clause link target: greyed out, the mere endpoint of
  // the connector (no clear button). highlight = an eligible pick target in link mode.
  dimmed?: boolean;
  highlight?: boolean;
  // The user clicked this filled box to change its word: show `emptyContent` (the picker)
  // over the current word instead of the word itself.
  editing?: boolean;
  shape?: SlotShape;
  // A small control a filled disc wears on its rim at half past seven (the degree chip), rather
  // than in a footer that would swell the disc.
  rim?: ReactNode;
  // The phrase console's marks (P02 §4): `preview` = the line being typed would change this box —
  // dashed, with a ↵ tag, until it is committed; `lit` = its token is under the pointer in the
  // console; `consoleCursor` = the console's context rests here, the ring a role command moves
  // without taking the keyboard from the prompt.
  preview?: boolean;
  lit?: boolean;
  consoleCursor?: boolean;
}) {
  const t = useUiString();
  const word = useConceptLabel();
  const filled = Boolean(concept) && !editing;
  // A filled disc says only its word: the control that revealed it already says what it is, and
  // the slot name would swell the disc to twice the word's size.
  const showLabel = slot.key !== "verb" && !(shape?.kind === "disc" && filled);
  const outline = {
    borderWidth: shape?.kind === "disc" ? 1.5 : 2,
    borderColor:
      highlight || isActive || preview || lit
        ? `${slot.color}.main`
        : filled && shape
          ? `${slot.color}.main`
          : "divider",
    borderStyle: highlight || preview ? "dashed" : "solid",
    boxShadow:
      highlight || lit ? (theme: Theme) => `0 0 0 3px ${theme.palette[slot.color].main}33` : "none",
    bgcolor: isActive ? held(slot.color) : concept ? wash(slot.color) : "background.paper",
    // The console's ring is the keyboard's own focus ring, drawn where the console's context is.
    ...(consoleCursor && {
      outline: "2px solid",
      outlineColor: (theme: Theme) => theme.palette[slot.color].main,
      outlineOffset: "3px",
    }),
    transition: "border-color 0.15s, background-color 0.15s, box-shadow 0.15s",
  };
  // A preview's tag: what ↵ would do to this box.
  const previewTag = preview && (
    <Box
      aria-hidden
      data-testid="preview-tag"
      sx={{
        position: "absolute",
        top: -9,
        right: -9,
        zIndex: 2,
        display: "grid",
        placeItems: "center",
        width: 16,
        height: 16,
        borderRadius: 0.5,
        border: "1px solid",
        borderColor: `${slot.color}.main`,
        bgcolor: "background.paper",
        color: `${slot.color}.main`,
        fontFamily: '"Inter", sans-serif',
        fontSize: "0.6rem",
        lineHeight: 1,
      }}
    >
      ↵
    </Box>
  );
  const faded = { opacity: dimmed ? 0.45 : 1, filter: dimmed ? "grayscale(1)" : "none" };

  const content = (
    <>
      {showLabel && (
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "text.secondary",
            display: "block",
            mb: 0.25,
            // Only inside a circle: the plain box grows sideways at no cost, so it keeps
            // its title on one line. `max-content` is what keeps the wrap out of the
            // measuring loop — the title breaks at its own width capped by LABEL_WIDTH,
            // never at the width the layout happens to be offering it this commit, which
            // would feed the ring's size back into the ring's size. `balance` splits a
            // wrapped title evenly rather than leaving one word alone on the last line.
            ...(shape
              ? {
                  whiteSpace: "normal",
                  width: "max-content",
                  maxWidth: LABEL_WIDTH,
                  mx: "auto",
                  textWrap: "balance",
                }
              : null),
          }}
        >
          {slot.labelKey ? t(slot.labelKey) : slot.label}
          {slot.required ? " *" : ""}
        </Typography>
      )}
      {filled ? (
        <Typography
          sx={{
            fontFamily: '"Lora", Georgia, serif',
            fontSize: shape?.kind === "disc" ? "0.8rem" : "0.9rem",
            fontWeight: 600,
            fontStyle: "italic",
            color: `${slot.color}.dark`,
            lineHeight: 1.3,
          }}
        >
          {word(concept!)}
        </Typography>
      ) : (
        <>
          {/* Only a genuinely-empty box wears the on-box category switch; a filled box
              being re-picked (editing) keeps its word's class. */}
          {!concept && categoryToggle}
          {emptyContent && shape ? (
            // A picker's input would otherwise take the browser's default width, and the ring
            // round it would swell to twice the size of the word it is choosing. The field sizes
            // itself to its prompt (see PickerList), so this only holds it to a floor: pinning it
            // to one width would cut a longer prompt off ("digita un sostantivo…").
            <Box sx={{ minWidth: PICKER_WIDTH, width: "fit-content", mx: "auto" }}>
              {emptyContent}
            </Box>
          ) : emptyContent ?? (
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.8rem",
                color: "text.disabled",
                fontStyle: "italic",
              }}
            >
              {isActive ? `${t("slot.choose")}…` : t("slot.empty")}
            </Typography>
          )}
        </>
      )}
      {filled && footer}
    </>
  );

  if (!shape) {
    return (
      <Box
        data-testid={`box-${slot.key}`}
        data-preview={preview ? "" : undefined}
        sx={{ position: "relative", display: "inline-block" }}
      >
        <Paper
          variant="outlined"
          sx={{
            px: 1.5,
            py: 0.75,
            minWidth: 80,
            cursor: "inherit",
            borderRadius: 2,
            ...outline,
            ...faded,
            "&:hover": { borderColor: `${slot.color}.main` },
            userSelect: "none",
          }}
        >
          {content}
        </Paper>
        {concept && !dimmed && !editing && !preview && (
          <ClearButton label={slot.label} labelKey={slot.labelKey} onClear={onClear} sx={{ position: "absolute", top: -8, right: -8 }} />
        )}
        {previewTag}
      </Box>
    );
  }

  const { r, kind } = shape;
  // How far across and up a disc's rim is at half past one (its clear button) and half past seven
  // (its rim control).
  const diagonal = r * Math.SQRT1_2;
  return (
    <Box
      data-testid={`box-${slot.key}`}
      data-shape={kind}
      data-preview={preview ? "" : undefined}
      sx={{
        position: "relative",
        display: "inline-block",
        "&:hover > .slot-circle": { borderColor: `${slot.color}.main` },
      }}
    >
      <Paper
        className="slot-circle"
        variant="outlined"
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 2 * r,
          height: 2 * r,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          ...outline,
          ...faded,
        }}
      />
      <Box sx={{ position: "relative", textAlign: "center", userSelect: "none", whiteSpace: "nowrap", ...faded }}>
        {content}
      </Box>
      {preview && (
        <Box
          sx={{
            position: "absolute",
            left: `calc(50% + ${diagonal}px)`,
            top: `calc(50% - ${diagonal}px)`,
            transform: "translate(-50%, -50%)",
            "& > *": { position: "static" },
          }}
        >
          {previewTag}
        </Box>
      )}
      {kind === "disc" && concept && !dimmed && !editing && !preview && (
        <ClearButton
          label={slot.label}
          labelKey={slot.labelKey}
          onClear={onClear}
          sx={{
            position: "absolute",
            left: `calc(50% + ${diagonal}px)`,
            top: `calc(50% - ${diagonal}px)`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      {kind === "disc" && filled && rim && (
        <Box
          sx={{
            position: "absolute",
            left: `calc(50% - ${diagonal}px)`,
            top: `calc(50% + ${diagonal}px)`,
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        >
          {rim}
        </Box>
      )}
    </Box>
  );
}

// One satellite reveal/toggle button, seated on one of its constituent's rings by the ring layout:
// facing the satellite it governs, or the constituent it shows.
export function SatelliteButton({
  sat,
  color,
  keySpec,
  tip = false,
}: {
  sat: SatelliteIcon;
  color: SlotConfig["color"];
  // The key this control answers to, read off the keymap by the builder. Named in the tooltip
  // whoever is driving — that is how the mouse teaches the keyboard — and worn as a badge on the
  // control's corner only while the cursor is on the box it belongs to.
  keySpec?: string;
  tip?: boolean;
}) {
  const t = useUiString();
  const platform = useKeyPlatform();
  // Color tiers:
  //  • solid  → carries a non-default value (plural / fem / negative / a chosen word)
  //  • outlined → expanded, or an always-valued satellite at its default (number/gender/polarity)
  //  • neutral → a collapsed, genuinely-empty satellite (adjective / adverb)
  const solid = sat.isSet;
  const outlined = !solid && (sat.active || sat.valued);
  // Always-valued (and set) satellites show their current value; a link control not yet linked is
  // named by what it links (A141); empties prompt Show/Hide.
  const tooltip =
    !sat.active && (sat.valued || sat.isSet) && sat.valueLabel
      ? `${sat.label}: ${sat.valueLabel}`
      : sat.link
        ? sat.label
        : revealTitle(t, sat.active, sat.label, sat.labelKey);
  return (
    // The tooltip shows the key; the accessible name does not. A screen reader announcing
    // "Number: Singular N" would read the cap as part of the control's name, so the key is
    // carried by `aria-keyshortcuts`, which is what assistive tech reads shortcuts from.
    <Tooltip title={keySpec ? `${tooltip}  ${keycapText(keySpec, platform)}` : tooltip}>
      <IconButton
        size="small"
        data-testid={`satellite-${sat.key}`}
        aria-label={tooltip}
        aria-keyshortcuts={keySpec ? keycapText(keySpec, platform) : undefined}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={sat.onToggle}
        sx={{
          // Block-level, so the box that positions a control hugs it. Left inline, the button
          // sits in a 28px line box and lands 2px below the point it was placed at — off the
          // border it rides and off the start of its connector.
          display: "flex",
          width: 20,
          height: 20,
          p: 0,
          borderRadius: sat.directToggle ? 0.5 : "50%",
          bgcolor: solid ? `${color}.main` : "background.paper",
          color: solid
            ? "common.white"
            : outlined
              ? `${color}.main`
              : "text.secondary",
          border: "1px solid",
          borderColor: solid || outlined ? `${color}.main` : "divider",
          transition: "background-color 0.15s, border-color 0.15s, color 0.15s",
          "&:hover": {
            bgcolor: solid ? `${color}.dark` : "action.hover",
            borderColor: `${color}.main`,
            color: solid ? "common.white" : `${color}.main`,
          },
        }}
      >
        {sat.icon}
        <KeyTip spec={keySpec} show={tip} />
      </IconButton>
    </Tooltip>
  );
}

// A value-cycling satellite (tense, aspect, determiner): its name over its current value. Drawn as
// a disc of radius `disc` on its constituent's orbit, or as a plain box without one. `active` marks
// a value away from the unmarked default in the constituent's colour.
export function ToggleBox({
  label,
  value,
  active = false,
  color = "secondary",
  disc,
}: {
  label: string;
  value: string;
  active?: boolean;
  color?: SlotConfig["color"];
  disc?: number;
}) {
  const outline = {
    borderWidth: disc === undefined ? 2 : 1.5,
    borderColor: active ? `${color}.main` : "divider",
    bgcolor: active ? wash(color) : "background.paper",
    transition: "border-color 0.15s, background-color 0.15s",
  };
  const content = (
    <>
      {/* A disc says only its value — "Past", "Progressive", "Definite" name themselves, and the
          control that revealed the disc says what it is — so its name moves to a tooltip. */}
      {disc === undefined && (
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "text.secondary",
            display: "block",
            mb: 0.25,
          }}
        >
          {label}
        </Typography>
      )}
      <Typography
        sx={{
          fontFamily: '"Lora", Georgia, serif',
          fontSize: disc === undefined ? "0.9rem" : "0.75rem",
          fontWeight: 600,
          fontStyle: "italic",
          color: active ? `${color}.dark` : "text.primary",
          lineHeight: 1.3,
        }}
      >
        {value}
      </Typography>
    </>
  );
  if (disc === undefined) {
    return (
      <Paper
        variant="outlined"
        sx={{
          px: 1.5,
          py: 0.75,
          minWidth: 80,
          cursor: "inherit",
          borderRadius: 2,
          userSelect: "none",
          ...outline,
          "&:hover": { borderColor: active ? `${color}.dark` : "text.secondary" },
        }}
      >
        {content}
      </Paper>
    );
  }
  return (
    <Box
      data-shape="disc"
      title={`${label}: ${value}`}
      sx={{
        position: "relative",
        display: "inline-block",
        "&:hover > .slot-circle": { borderColor: active ? `${color}.dark` : "text.secondary" },
      }}
    >
      <Paper
        className="slot-circle"
        variant="outlined"
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 2 * disc,
          height: 2 * disc,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          ...outline,
        }}
      />
      <Box sx={{ position: "relative", textAlign: "center", userSelect: "none", whiteSpace: "nowrap" }}>
        {content}
      </Box>
    </Box>
  );
}

export function DeterminerToggleBox({
  value,
  color,
  disc,
}: {
  value: Definiteness;
  color?: SlotConfig["color"];
  disc?: number;
}) {
  const t = useUiString();
  // The box names the value the way the menu row that set it did — "Definite", "Multal" — not the
  // word it spells. The surface word is already in the rendered phrase; repeating it here would
  // say nothing the sentence doesn't, and would leave `bare` with an em-dash for a value.
  return (
    <ToggleBox
      label={t("satellite.determiner")}
      value={t(`determiner.name.${value}`)}
      color={color}
      disc={disc}
    />
  );
}

/**
 * The letter each spatial relation answers to while its toolbar is armed: the initial of the
 * English preposition, with "in front of" going by its F — I is plain "in".
 */
const SPECIFIER_KEYS: Record<PathSpecifier, string> = {
  in: "I",
  through: "T",
  under: "U",
  over: "O",
  around: "A",
  behind: "B",
  in_front_of: "F",
};

const SPECIFIER_ICONS: Record<PathSpecifier, ReactNode> = {
  // Containment — the locative's default relation, and the one the route never falls back on.
  in: <VerticalAlignCenterIcon sx={{ fontSize: 15 }} />,
  through: <DoubleArrowIcon sx={{ fontSize: 15 }} />,
  under: <VerticalAlignBottomIcon sx={{ fontSize: 15 }} />,
  over: <VerticalAlignTopIcon sx={{ fontSize: 15 }} />,
  around: <LoopIcon sx={{ fontSize: 15 }} />,
  behind: <FlipToBackIcon sx={{ fontSize: 15 }} />,
  in_front_of: <FlipToFrontIcon sx={{ fontSize: 15 }} />,
};

// A toolbar of selectable values for a complement's relation — one icon per value, the active one
// highlighted. As a plain row, or — given `placeAt` — each button seated on the canvas where the
// ring layout puts it on the complement's dotted ring.
function RelationToolbar<V extends string>({
  testId,
  values,
  value,
  labels,
  icons,
  keys,
  armed = false,
  onDisarm,
  onSelect,
  placeAt,
}: {
  testId: string;
  values: readonly V[];
  value: V;
  labels: Record<V, string>;
  icons: Record<V, ReactNode>;
  // The key each relation answers to while the toolbar is armed (see useMenuKeys).
  keys: Record<V, string>;
  // The complement's S has just been pressed, so the next key is a relation. The toolbar is not a
  // menu — it is always on the ring — so it says which keys it is listening for only while it is.
  armed?: boolean;
  onDisarm?: () => void;
  onSelect: (v: V) => void;
  placeAt?: (v: V) => { x: number; y: number } | undefined;
}) {
  useMenuKeys({
    open: armed,
    keys,
    onPick: (v) => {
      onSelect(v as V);
      onDisarm?.();
    },
    onDismiss: onDisarm,
  });
  const button = (v: V) => {
    const selected = v === value;
    return (
      // The tooltip shows the key; the accessible name does not — a screen reader would read the
      // cap as part of the control's name (see SatelliteButton, for the same reason).
      <Tooltip key={v} title={`${labels[v]}  ${keys[v]}`}>
        <IconButton
          size="small"
          aria-label={labels[v]}
          aria-keyshortcuts={keys[v]}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onSelect(v)}
          sx={{
            width: placeAt ? 20 : 22,
            height: placeAt ? 20 : 22,
            p: 0,
            borderRadius: 1,
            bgcolor: selected ? "warning.main" : placeAt ? "background.paper" : "transparent",
            border: placeAt ? "1px solid" : "none",
            borderColor: selected ? "warning.main" : "divider",
            color: selected ? "common.white" : "text.secondary",
            transition: "background-color 0.15s, color 0.15s",
            "&:hover": {
              bgcolor: selected ? "warning.dark" : "action.hover",
              color: selected ? "common.white" : "warning.main",
            },
          }}
        >
          {icons[v]}
          <KeyTip spec={keys[v]} show={armed} />
        </IconButton>
      </Tooltip>
    );
  };

  if (placeAt) {
    return (
      // No box of its own: each button is positioned against the canvas, where its ring seats it.
      <Box data-testid={testId} sx={{ display: "contents" }}>
        {values.map((v) => {
          const p = placeAt(v);
          if (!p) return null;
          return (
            <Box
              key={v}
              sx={{
                position: "absolute",
                left: p.x,
                top: p.y,
                transform: "translate(-50%, -50%)",
                display: "flex",
                zIndex: 3,
              }}
            >
              {button(v)}
            </Box>
          );
        })}
      </Box>
    );
  }
  return (
    <Box
      data-testid={testId}
      sx={{
        display: "flex",
        gap: 0.25,
        p: 0.25,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        boxShadow: 1,
      }}
    >
      {values.map(button)}
    </Box>
  );
}

// Spatial relations, shared by the route and locative complements, which draw on the same
// relations; the caller passes the value (and so the default) its own complement carries.
export function SpecifierSelector({
  value,
  armed,
  onDisarm,
  onSelect,
  placeAt,
}: {
  value: PathSpecifier;
  armed?: boolean;
  onDisarm?: () => void;
  onSelect: (s: PathSpecifier) => void;
  placeAt?: (s: PathSpecifier) => { x: number; y: number } | undefined;
}) {
  const t = useUiString();
  // Each relation is named by the adposition its language spells it with — "under" / "sotto" /
  // "unter" / 〜の下で (C13). The catalog cites them on a bare noun, so what comes back is the
  // preposition alone, which is what the icon's tooltip wants.
  const labels = Object.fromEntries(
    PATH_SPECIFIERS.map((s) => [s, t(`specifier.value.${s}`)]),
  ) as Record<PathSpecifier, string>;
  return (
    <RelationToolbar
      testId="specifier-toolbar"
      values={PATH_SPECIFIERS}
      value={value}
      labels={labels}
      icons={SPECIFIER_ICONS}
      keys={SPECIFIER_KEYS}
      armed={armed}
      onDisarm={onDisarm}
      onSelect={onSelect}
      placeAt={placeAt}
    />
  );
}

const SENTIMENT_ICONS: Record<CauseSentiment, ReactNode> = {
  neutral: <SentimentNeutralIcon sx={{ fontSize: 15 }} />,
  negative: <SentimentVeryDissatisfiedIcon sx={{ fontSize: 15 }} />,
  positive: <SentimentSatisfiedAltIcon sx={{ fontSize: 15 }} />,
};

// Affective stances for the cause complement — neutral (because of), negative (fault of),
// positive (thanks to) — mirroring the route's SpecifierSelector.
export function SentimentSelector({
  value,
  armed,
  onDisarm,
  onSelect,
  placeAt,
}: {
  value: CauseSentiment;
  armed?: boolean;
  onDisarm?: () => void;
  onSelect: (s: CauseSentiment) => void;
  placeAt?: (s: CauseSentiment) => { x: number; y: number } | undefined;
}) {
  const t = useUiString();
  // The stance, then the connector it picks — "Neutral — because of", de "Neutral — wegen". Two
  // catalog entries of different kinds (an adjective and a specifier), joined here with the same
  // dash the other two-part tooltips use.
  const labels = Object.fromEntries(
    CAUSE_SENTIMENTS.map((v) => [v, `${t(`sentiment.value.${v}`)} — ${t(`sentiment.connector.${v}`)}`]),
  ) as Record<CauseSentiment, string>;
  return (
    <RelationToolbar
      testId="sentiment-toolbar"
      values={CAUSE_SENTIMENTS}
      value={value}
      labels={labels}
      icons={SENTIMENT_ICONS}
      // Three stances with no shared initial worth the guess ("negative"/"neutral" collide), so
      // they are counted rather than lettered.
      keys={digitKeys(CAUSE_SENTIMENTS) as Record<CauseSentiment, string>}
      armed={armed}
      onDisarm={onDisarm}
      onSelect={onSelect}
      placeAt={placeAt}
    />
  );
}

export function TenseToggleBox({ value, disc }: { value: Tense; disc?: number }) {
  const t = useUiString();
  // Present is the implicit default → styled neutral; past/future read as "set".
  return (
    <ToggleBox label={t("satellite.tense")} value={t(`tense.value.${value}`)} active={value !== "present"} disc={disc} />
  );
}

export function AspectToggleBox({ value, disc }: { value: Aspect; disc?: number }) {
  const t = useUiString();
  // Neutral is the implicit default → styled neutral; the marked aspects read as "set".
  return (
    <ToggleBox label={t("satellite.aspect")} value={t(`aspect.value.${value}`)} active={value !== "neutral"} disc={disc} />
  );
}

export function VoiceToggleBox({ value, disc }: { value: Voice; disc?: number }) {
  const t = useUiString();
  // Active is the implicit default → styled neutral; the passive reads as "set".
  return (
    <ToggleBox label={t("satellite.voice")} value={t(`voice.value.${value}`)} active={value !== "active"} disc={disc} />
  );
}
