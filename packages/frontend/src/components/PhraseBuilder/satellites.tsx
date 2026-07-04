import { ReactNode } from "react";
import BrushIcon from "@mui/icons-material/Brush";
import NumbersIcon from "@mui/icons-material/Numbers";
import WcIcon from "@mui/icons-material/Wc";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TuneIcon from "@mui/icons-material/Tune";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RouteIcon from "@mui/icons-material/Route";
import {
  COMPLEMENT_TYPES,
  COMPLEMENT_LABELS,
  type Concept,
  type ComplementType,
} from "@signi/shared";
import { PhraseSelection, SlotKey } from "./interfaces.ts";

// Satellite elements (gender / number / polarity / adjective / adverb) are hidden
// by default and revealed via the small icons on each main box border.
export type Satellite = {
  key: string;
  parent: SlotKey;
  label: string;
  icon: ReactNode;
  available: boolean;
  // hasValue = carries a *non-default* value (plural / fem / negative / a chosen word).
  hasValue: boolean;
  // alwaysSet = number / gender / polarity — these always hold a value (even the
  // default), so their icon reads as "valued" and the tooltip shows the current one.
  alwaysSet?: boolean;
  // Human-readable current term, shown in the icon tooltip.
  valueLabel?: string;
  shown: boolean;
};

const iconSx = { fontSize: 13 };

export const conceptLabel = (c?: Concept) =>
  c
    ? c.role === "pronoun"
      ? c.description
      : (c.label ?? c.description)
    : undefined;

const complementIcons: Record<ComplementType, ReactNode> = {
  locative: <PlaceIcon sx={iconSx} />,
  direction: <ArrowForwardIcon sx={iconSx} />,
  source: <ArrowBackIcon sx={iconSx} />,
  route: <RouteIcon sx={iconSx} />,
};

// Derive every satellite for the current selection, resolving each one's `shown`
// state (an explicit reveal toggle wins; otherwise a set satellite auto-expands).
export function buildSatellites(
  selection: PhraseSelection,
  revealed: Record<string, boolean>,
): { satellites: Satellite[]; shownMap: Record<string, boolean> } {
  const subjectRole = selection.subject?.role;
  const supportedComplements = selection.verb?.complements ?? [];

  const showSubjectNumber = Boolean(selection.subject);
  const showSubjectGender =
    (selection.subject?.role === "pronoun" &&
      selection.subject?.person === "3") ||
    (selection.subject?.role === "noun" &&
      Boolean(selection.subject?.gendered));
  const showDirectObjNumber = Boolean(selection.directObject);
  const showDirectObjGender = Boolean(selection.directObject?.gendered);
  const showIndirectObjNumber = Boolean(selection.indirectObject);
  const showIndirectObjGender = Boolean(selection.indirectObject?.gendered);

  const rawSatellites: Omit<Satellite, "shown">[] = [
    {
      key: "subjectAdjective",
      parent: "subject",
      label: "Adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun",
      hasValue: Boolean(selection.subjectAdjective),
      valueLabel: conceptLabel(selection.subjectAdjective),
    },
    {
      key: "subjectAdjective2",
      parent: "subject",
      label: "Adjective 2",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun" && Boolean(selection.subjectAdjective),
      hasValue: Boolean(selection.subjectAdjective2),
      valueLabel: conceptLabel(selection.subjectAdjective2),
    },
    {
      key: "subjectNumber",
      parent: "subject",
      label: "Number",
      icon: <NumbersIcon sx={iconSx} />,
      available: showSubjectNumber,
      hasValue: selection.subjectNumber === "plural",
      alwaysSet: true,
      valueLabel: selection.subjectNumber === "plural" ? "Plural" : "Singular",
    },
    {
      key: "subjectGender",
      parent: "subject",
      label: "Gender",
      icon: <WcIcon sx={iconSx} />,
      available: showSubjectGender,
      hasValue: selection.subjectGender === "fem",
      alwaysSet: true,
      valueLabel: selection.subjectGender === "fem" ? "Feminine" : "Masculine",
    },
    {
      key: "verbNegative",
      parent: "verb",
      label: "Polarity",
      icon: <RemoveCircleOutlineIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.verbNegative),
      alwaysSet: true,
      valueLabel: selection.verbNegative ? "Negative" : "Positive",
    },
    {
      key: "modifier",
      parent: "verb",
      label: "Adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.modifier),
      valueLabel: conceptLabel(selection.modifier),
    },
    {
      key: "directObjectAdjective",
      parent: "directObject",
      label: "Adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: Boolean(selection.directObjectAdjective),
      valueLabel: conceptLabel(selection.directObjectAdjective),
    },
    {
      key: "directObjectAdjective2",
      parent: "directObject",
      label: "Adjective 2",
      icon: <BrushIcon sx={iconSx} />,
      available:
        Boolean(selection.directObject) &&
        Boolean(selection.directObjectAdjective),
      hasValue: Boolean(selection.directObjectAdjective2),
      valueLabel: conceptLabel(selection.directObjectAdjective2),
    },
    {
      key: "directObjectNumber",
      parent: "directObject",
      label: "Number",
      icon: <NumbersIcon sx={iconSx} />,
      available: showDirectObjNumber,
      hasValue: selection.directObjectNumber === "plural",
      alwaysSet: true,
      valueLabel:
        selection.directObjectNumber === "plural" ? "Plural" : "Singular",
    },
    {
      key: "directObjectGender",
      parent: "directObject",
      label: "Gender",
      icon: <WcIcon sx={iconSx} />,
      available: showDirectObjGender,
      hasValue: selection.directObjectGender === "fem",
      alwaysSet: true,
      valueLabel:
        selection.directObjectGender === "fem" ? "Feminine" : "Masculine",
    },
    {
      key: "indirectObjectAdjective",
      parent: "indirectObject",
      label: "Adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: Boolean(selection.indirectObject),
      hasValue: Boolean(selection.indirectObjectAdjective),
      valueLabel: conceptLabel(selection.indirectObjectAdjective),
    },
    {
      key: "indirectObjectAdjective2",
      parent: "indirectObject",
      label: "Adjective 2",
      icon: <BrushIcon sx={iconSx} />,
      available:
        Boolean(selection.indirectObject) &&
        Boolean(selection.indirectObjectAdjective),
      hasValue: Boolean(selection.indirectObjectAdjective2),
      valueLabel: conceptLabel(selection.indirectObjectAdjective2),
    },
    {
      key: "indirectObjectNumber",
      parent: "indirectObject",
      label: "Number",
      icon: <NumbersIcon sx={iconSx} />,
      available: showIndirectObjNumber,
      hasValue: selection.indirectObjectNumber === "plural",
      alwaysSet: true,
      valueLabel:
        selection.indirectObjectNumber === "plural" ? "Plural" : "Singular",
    },
    {
      key: "indirectObjectGender",
      parent: "indirectObject",
      label: "Gender",
      icon: <WcIcon sx={iconSx} />,
      available: showIndirectObjGender,
      hasValue: selection.indirectObjectGender === "fem",
      alwaysSet: true,
      valueLabel:
        selection.indirectObjectGender === "fem" ? "Feminine" : "Masculine",
    },
    // Complement toggles live on the VERB box; number/gender hang off each complement.
    ...COMPLEMENT_TYPES.flatMap((type): Omit<Satellite, "shown">[] => {
      const concept = selection[type];
      const num = selection[`${type}Number` as keyof PhraseSelection] as
        | "singular"
        | "plural"
        | undefined;
      const gen = selection[`${type}Gender` as keyof PhraseSelection] as
        | "masc"
        | "fem"
        | undefined;
      const adj = selection[`${type}Adjective` as keyof PhraseSelection] as
        | Concept
        | undefined;
      const adj2 = selection[`${type}Adjective2` as keyof PhraseSelection] as
        | Concept
        | undefined;
      return [
        {
          key: type,
          parent: "verb",
          label: COMPLEMENT_LABELS[type],
          icon: complementIcons[type],
          available: supportedComplements.includes(type),
          hasValue: Boolean(concept),
          valueLabel: conceptLabel(concept),
        },
        {
          key: `${type}Adjective`,
          parent: type,
          label: "Adjective",
          icon: <BrushIcon sx={iconSx} />,
          available: Boolean(concept),
          hasValue: Boolean(adj),
          valueLabel: conceptLabel(adj),
        },
        {
          key: `${type}Adjective2`,
          parent: type,
          label: "Adjective 2",
          icon: <BrushIcon sx={iconSx} />,
          available: Boolean(concept) && Boolean(adj),
          hasValue: Boolean(adj2),
          valueLabel: conceptLabel(adj2),
        },
        {
          key: `${type}Number`,
          parent: type,
          label: "Number",
          icon: <NumbersIcon sx={iconSx} />,
          available: Boolean(concept),
          hasValue: num === "plural",
          alwaysSet: true,
          valueLabel: num === "plural" ? "Plural" : "Singular",
        },
        {
          key: `${type}Gender`,
          parent: type,
          label: "Gender",
          icon: <WcIcon sx={iconSx} />,
          available: Boolean(concept?.gendered),
          hasValue: gen === "fem",
          alwaysSet: true,
          valueLabel: gen === "fem" ? "Feminine" : "Masculine",
        },
      ];
    }),
  ];

  const satellites: Satellite[] = rawSatellites.map((s) => ({
    ...s,
    // An explicit toggle wins; otherwise a set satellite auto-expands.
    shown: s.available && (revealed[s.key] ?? s.hasValue),
  }));
  const shownMap: Record<string, boolean> = Object.fromEntries(
    satellites.map((s) => [s.key, s.shown]),
  );

  return { satellites, shownMap };
}
