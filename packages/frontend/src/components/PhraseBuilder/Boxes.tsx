import {
  Box,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import LoopIcon from "@mui/icons-material/Loop";
import FlipToBackIcon from "@mui/icons-material/FlipToBack";
import FlipToFrontIcon from "@mui/icons-material/FlipToFront";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import {
  ASPECT_LABELS,
  CAUSE_SENTIMENTS,
  CAUSE_SENTIMENT_LABELS,
  Concept,
  DEFINITENESS_LABELS,
  PATH_SPECIFIERS,
  PATH_SPECIFIER_LABELS,
  TENSE_LABELS,
  type Aspect,
  type CauseSentiment,
  type Definiteness,
  type PathSpecifier,
  type Tense,
} from "@signi/shared";
import { ReactNode } from "react";
import { useUiString } from "../../i18n/useUiString.ts";
import { SlotCategory, SlotConfig } from "./interfaces";

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
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export interface SatelliteIcon {
  key: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  isSet: boolean;
  // valued = always carries a value (number / gender / polarity); its icon reads
  // as colored even at the default, and its tooltip always shows the current value.
  valued: boolean;
  valueLabel?: string;
  // directToggle = clicking flips a value in place rather than revealing a box.
  // Squared off so shape alone separates the two kinds of control.
  directToggle?: boolean;
  onToggle: () => void;
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
  minWidth = 80,
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
  // Minimum box width in px. Widened above the 80px default for boxes that host many
  // satellite controls on their border (e.g. a short verb like "become"), so the controls
  // have room to fan out along the edge instead of piling up over each other.
  minWidth?: number;
}) {
  const t = useUiString();
  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Paper
        variant="outlined"
        sx={{
          px: 1.5,
          py: 0.75,
          minWidth,
          cursor: "inherit",
          borderRadius: 2,
          borderWidth: 2,
          borderColor: highlight
            ? `${slot.color}.main`
            : isActive
              ? `${slot.color}.main`
              : "divider",
          borderStyle: highlight ? "dashed" : "solid",
          boxShadow: highlight ? (t) => `0 0 0 3px ${t.palette[slot.color].main}33` : "none",
          bgcolor: isActive
            ? `${slot.color}.50`
            : concept
              ? `${slot.color}.50`
              : "background.paper",
          opacity: dimmed ? 0.45 : 1,
          filter: dimmed ? "grayscale(1)" : "none",
          transition: "border-color 0.15s, background-color 0.15s, box-shadow 0.15s",
          "&:hover": { borderColor: `${slot.color}.main` },
          userSelect: "none",
        }}
      >
        {slot.key !== "verb" && (
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
            {slot.labelKey ? t(slot.labelKey) : slot.label}
            {slot.required ? " *" : ""}
          </Typography>
        )}
        {concept && !editing ? (
          <Typography
            sx={{
              fontFamily: '"Lora", Georgia, serif',
              fontSize: "0.9rem",
              fontWeight: 600,
              fontStyle: "italic",
              color: `${slot.color}.dark`,
              lineHeight: 1.3,
            }}
          >
            {concept.role === "pronoun"
              ? concept.description
              : (concept.label ?? concept.description)}
          </Typography>
        ) : (
          <>
            {/* Only a genuinely-empty box wears the on-box category switch; a filled box
                being re-picked (editing) keeps its word's class. */}
            {!concept && categoryToggle}
            {emptyContent ?? (
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "0.8rem",
                  color: "text.disabled",
                  fontStyle: "italic",
                }}
              >
                {isActive ? "choose…" : "empty"}
              </Typography>
            )}
          </>
        )}
        {concept && !editing && footer}
      </Paper>
      {concept && !dimmed && !editing && (
        <Tooltip title={`Clear ${slot.label}`}>
          <IconButton
            size="small"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClear}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 18,
              height: 18,
              p: 0,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              opacity: 0.7,
              "&:hover": { opacity: 1, bgcolor: "background.paper" },
            }}
          >
            <ClearIcon sx={{ fontSize: 11 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

// A horizontal row of satellite toggle icons. Rendered on the border of a slot
// box (via SlotBox) or overlaid on a dotted role-group box (complement toggles).
export function SatelliteRow({
  satellites,
  color,
}: {
  satellites: SatelliteIcon[];
  color: SlotConfig["color"];
}) {
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {satellites.map((sat) => (
        <SatelliteButton key={sat.key} sat={sat} color={color} />
      ))}
    </Box>
  );
}

// One satellite reveal/toggle button. Rendered inline in a SatelliteRow (the
// complement toggles) or, on the phrase canvas, positioned individually on its
// core box's border pointing toward the satellite it governs.
export function SatelliteButton({
  sat,
  color,
}: {
  sat: SatelliteIcon;
  color: SlotConfig["color"];
}) {
  // Color tiers:
  //  • solid  → carries a non-default value (plural / fem / negative / a chosen word)
  //  • outlined → expanded, or an always-valued satellite at its default (number/gender/polarity)
  //  • neutral → a collapsed, genuinely-empty satellite (adjective / adverb)
  const solid = sat.isSet;
  const outlined = !solid && (sat.active || sat.valued);
  // Always-valued (and set) satellites show their current value; empties prompt Show/Hide.
  const tooltip =
    !sat.active && (sat.valued || sat.isSet) && sat.valueLabel
      ? `${sat.label}: ${sat.valueLabel}`
      : `${sat.active ? "Hide" : "Show"} ${sat.label}`;
  return (
    <Tooltip title={tooltip}>
      <IconButton
        size="small"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={sat.onToggle}
        sx={{
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
      </IconButton>
    </Tooltip>
  );
}

export function ToggleBox({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 0.75,
        minWidth: 80,
        cursor: "inherit",
        borderRadius: 2,
        borderWidth: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "border-color 0.15s",
        userSelect: "none",
        "&:hover": { borderColor: "text.secondary" },
      }}
    >
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
      <Typography
        sx={{
          fontFamily: '"Lora", Georgia, serif',
          fontSize: "0.9rem",
          fontWeight: 600,
          fontStyle: "italic",
          color: "text.primary",
          lineHeight: 1.3,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export function DeterminerToggleBox({ value }: { value: Definiteness }) {
  // Short surface for the toggle box: "the" / "a" / "—" / the quantifier word.
  const label =
    value === "definite"
      ? "The"
      : value === "indefinite"
        ? "A / An"
        : value === "bare"
          ? "—"
          : DEFINITENESS_LABELS[value];
  return <ToggleBox label="Determiner" value={label} />;
}

const SPECIFIER_ICONS: Record<PathSpecifier, ReactNode> = {
  through: <DoubleArrowIcon sx={{ fontSize: 15 }} />,
  under: <VerticalAlignBottomIcon sx={{ fontSize: 15 }} />,
  over: <VerticalAlignTopIcon sx={{ fontSize: 15 }} />,
  around: <LoopIcon sx={{ fontSize: 15 }} />,
  behind: <FlipToBackIcon sx={{ fontSize: 15 }} />,
  in_front_of: <FlipToFrontIcon sx={{ fontSize: 15 }} />,
};

// A toolbar of path relations for the route complement — one selectable icon per
// specifier, the active one highlighted. Rendered on top of the route dotted box.
export function SpecifierSelector({
  value,
  onSelect,
}: {
  value: PathSpecifier;
  onSelect: (s: PathSpecifier) => void;
}) {
  return (
    <Box
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
      {PATH_SPECIFIERS.map((s) => {
        const selected = s === value;
        return (
          <Tooltip key={s} title={PATH_SPECIFIER_LABELS[s]}>
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onSelect(s)}
              sx={{
                width: 22,
                height: 22,
                p: 0,
                borderRadius: 1,
                bgcolor: selected ? "warning.main" : "transparent",
                color: selected ? "common.white" : "text.secondary",
                transition: "background-color 0.15s, color 0.15s",
                "&:hover": {
                  bgcolor: selected ? "warning.dark" : "action.hover",
                  color: selected ? "common.white" : "warning.main",
                },
              }}
            >
              {SPECIFIER_ICONS[s]}
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
}

const SENTIMENT_ICONS: Record<CauseSentiment, ReactNode> = {
  neutral: <SentimentNeutralIcon sx={{ fontSize: 15 }} />,
  negative: <SentimentVeryDissatisfiedIcon sx={{ fontSize: 15 }} />,
  positive: <SentimentSatisfiedAltIcon sx={{ fontSize: 15 }} />,
};

// A toolbar of affective stances for the cause complement — neutral (because of),
// negative (fault of), positive (thanks to), the active one highlighted. Rendered on
// top of the cause dotted box, mirroring the route's SpecifierSelector.
export function SentimentSelector({
  value,
  onSelect,
}: {
  value: CauseSentiment;
  onSelect: (s: CauseSentiment) => void;
}) {
  return (
    <Box
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
      {CAUSE_SENTIMENTS.map((s) => {
        const selected = s === value;
        return (
          <Tooltip key={s} title={CAUSE_SENTIMENT_LABELS[s]}>
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onSelect(s)}
              sx={{
                width: 22,
                height: 22,
                p: 0,
                borderRadius: 1,
                bgcolor: selected ? "warning.main" : "transparent",
                color: selected ? "common.white" : "text.secondary",
                transition: "background-color 0.15s, color 0.15s",
                "&:hover": {
                  bgcolor: selected ? "warning.dark" : "action.hover",
                  color: selected ? "common.white" : "warning.main",
                },
              }}
            >
              {SENTIMENT_ICONS[s]}
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
}

export function TenseToggleBox({ value }: { value: Tense }) {
  // Present is the implicit default → styled neutral; past/future read as "set".
  const active = value !== "present";
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 0.75,
        minWidth: 80,
        cursor: "inherit",
        borderRadius: 2,
        borderWidth: 2,
        borderColor: active ? "secondary.main" : "divider",
        bgcolor: active ? "secondary.50" : "background.paper",
        transition: "border-color 0.15s, background-color 0.15s",
        userSelect: "none",
        "&:hover": { borderColor: active ? "secondary.dark" : "text.secondary" },
      }}
    >
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
        Tense
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Lora", Georgia, serif',
          fontSize: "0.9rem",
          fontWeight: 600,
          fontStyle: "italic",
          color: active ? "secondary.dark" : "text.primary",
          lineHeight: 1.3,
        }}
      >
        {TENSE_LABELS[value]}
      </Typography>
    </Paper>
  );
}

export function AspectToggleBox({ value }: { value: Aspect }) {
  // Neutral is the implicit default → styled neutral; the marked aspects read as "set".
  const active = value !== "neutral";
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 0.75,
        minWidth: 80,
        cursor: "inherit",
        borderRadius: 2,
        borderWidth: 2,
        borderColor: active ? "secondary.main" : "divider",
        bgcolor: active ? "secondary.50" : "background.paper",
        transition: "border-color 0.15s, background-color 0.15s",
        userSelect: "none",
        "&:hover": { borderColor: active ? "secondary.dark" : "text.secondary" },
      }}
    >
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
        Aspect
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Lora", Georgia, serif',
          fontSize: "0.9rem",
          fontWeight: 600,
          fontStyle: "italic",
          color: active ? "secondary.dark" : "text.primary",
          lineHeight: 1.3,
        }}
      >
        {ASPECT_LABELS[value]}
      </Typography>
    </Paper>
  );
}

