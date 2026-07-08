import { ReactNode } from "react";
import BrushIcon from "@mui/icons-material/Brush";
import NumbersIcon from "@mui/icons-material/Numbers";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TuneIcon from "@mui/icons-material/Tune";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RouteIcon from "@mui/icons-material/Route";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import KeyIcon from "@mui/icons-material/Key";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import LinkIcon from "@mui/icons-material/Link";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import {
  COMPLEMENT_TYPES,
  COMPLEMENT_LABELS,
  DEFINITENESS_LABELS,
  DETERMINER_COMPLEMENT_TYPES,
  TENSE_LABELS,
  type Concept,
  type ComplementType,
  type Definiteness,
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
  // directToggle = the border icon *is* the control: clicking it flips the value
  // (singular ⇄ plural) in place, with no expandable canvas box. Such satellites
  // never `shown` (there is nothing to reveal); the icon's solid/outlined state
  // indicates the current value and its tooltip spells it out.
  directToggle?: boolean;
  // Human-readable current term, shown in the icon tooltip.
  valueLabel?: string;
  shown: boolean;
};

const iconSx = { fontSize: 13 };

type Gender = "masc" | "fem" | "neut";

// Gender is a direct-toggle satellite: its border icon *is* the glyph for the current
// value (♂ / ♀ / ⚧), so cycling it swaps the icon rather than revealing a box.
const genderIcon = (gen?: Gender): ReactNode =>
  gen === "fem" ? (
    <FemaleIcon sx={iconSx} />
  ) : gen === "neut" ? (
    <TransgenderIcon sx={iconSx} />
  ) : (
    <MaleIcon sx={iconSx} />
  );

const genderLabel = (gen?: Gender): string =>
  gen === "fem" ? "Feminine" : gen === "neut" ? "Neuter" : "Masculine";

export const conceptLabel = (c?: Concept) =>
  c
    ? c.role === "pronoun"
      ? c.description
      : (c.label ?? c.description)
    : undefined;

const complementIcons: Record<ComplementType, ReactNode> = {
  predicative: <LinkIcon sx={iconSx} />,
  locative: <PlaceIcon sx={iconSx} />,
  direction: <ArrowForwardIcon sx={iconSx} />,
  source: <ArrowBackIcon sx={iconSx} />,
  route: <RouteIcon sx={iconSx} />,
  cause: <HelpOutlineIcon sx={iconSx} />,
  terminus: <CallReceivedIcon sx={iconSx} />,
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
    selection.subject?.role === "pronoun" ||
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
      directToggle: true,
      valueLabel: selection.subjectNumber === "plural" ? "Plural" : "Singular",
    },
    {
      key: "subjectGender",
      parent: "subject",
      label: "Gender",
      icon: genderIcon(selection.subjectGender),
      available: showSubjectGender,
      hasValue: Boolean(selection.subjectGender) && selection.subjectGender !== "masc",
      alwaysSet: true,
      directToggle: true,
      valueLabel: genderLabel(selection.subjectGender),
    },
    {
      key: "subjectDefiniteness",
      parent: "subject",
      label: "Determiner",
      icon: <ArticleOutlinedIcon sx={iconSx} />,
      // Only a noun head takes an article; pronoun subjects render without one.
      available: subjectRole === "noun",
      hasValue: Boolean(
        selection.subjectDefiniteness &&
          selection.subjectDefiniteness !== "definite",
      ),
      alwaysSet: true,
      valueLabel: DEFINITENESS_LABELS[selection.subjectDefiniteness ?? "definite"],
    },
    {
      key: "subjectRelative",
      parent: "subject",
      label: "Relative clause",
      icon: <AccountTreeIcon sx={iconSx} />,
      // A relative clause attaches only to a noun head (pronoun subjects render without
      // one). It is now a cross-container link; `hasValue` (is-a-link-source) is supplied
      // by PhraseBuilder from the workspace binding.
      available: subjectRole === "noun",
      hasValue: false,
    },
    {
      key: "subjectPossessor",
      parent: "subject",
      label: "Possessor",
      icon: <KeyIcon sx={iconSx} />,
      // A possessor (Saxon genitive) attaches only to a noun head; its own head noun
      // lives in the nested selection's `subject` slot.
      available: subjectRole === "noun",
      hasValue: Boolean(selection.subjectPossessor?.subject),
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
      key: "verbTense",
      parent: "verb",
      label: "Tense",
      icon: <AccessTimeIcon sx={iconSx} />,
      available: true,
      // Non-default (solid) once the tense is anything but the implicit present.
      hasValue: Boolean(selection.verbTense) && selection.verbTense !== "present",
      alwaysSet: true,
      valueLabel: TENSE_LABELS[selection.verbTense ?? "present"],
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
      directToggle: true,
      valueLabel:
        selection.directObjectNumber === "plural" ? "Plural" : "Singular",
    },
    {
      key: "directObjectGender",
      parent: "directObject",
      label: "Gender",
      icon: genderIcon(selection.directObjectGender),
      available: showDirectObjGender,
      hasValue:
        Boolean(selection.directObjectGender) &&
        selection.directObjectGender !== "masc",
      alwaysSet: true,
      directToggle: true,
      valueLabel: genderLabel(selection.directObjectGender),
    },
    {
      key: "directObjectDefiniteness",
      parent: "directObject",
      label: "Determiner",
      icon: <ArticleOutlinedIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: Boolean(
        selection.directObjectDefiniteness &&
          selection.directObjectDefiniteness !== "definite",
      ),
      alwaysSet: true,
      valueLabel:
        DEFINITENESS_LABELS[selection.directObjectDefiniteness ?? "definite"],
    },
    {
      key: "directObjectRelative",
      parent: "directObject",
      label: "Relative clause",
      icon: <AccountTreeIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: false,
    },
    {
      key: "directObjectPossessor",
      parent: "directObject",
      label: "Possessor",
      icon: <KeyIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: Boolean(selection.directObjectPossessor?.subject),
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
      directToggle: true,
      valueLabel:
        selection.indirectObjectNumber === "plural" ? "Plural" : "Singular",
    },
    {
      key: "indirectObjectGender",
      parent: "indirectObject",
      label: "Gender",
      icon: genderIcon(selection.indirectObjectGender),
      available: showIndirectObjGender,
      hasValue:
        Boolean(selection.indirectObjectGender) &&
        selection.indirectObjectGender !== "masc",
      alwaysSet: true,
      directToggle: true,
      valueLabel: genderLabel(selection.indirectObjectGender),
    },
    {
      key: "indirectObjectRelative",
      parent: "indirectObject",
      label: "Relative clause",
      icon: <AccountTreeIcon sx={iconSx} />,
      available: Boolean(selection.indirectObject),
      hasValue: false,
    },
    {
      key: "indirectObjectPossessor",
      parent: "indirectObject",
      label: "Possessor",
      icon: <KeyIcon sx={iconSx} />,
      available: Boolean(selection.indirectObject),
      hasValue: Boolean(selection.indirectObjectPossessor?.subject),
    },
    // Complement toggles live on the VERB box; number/gender hang off each complement.
    ...COMPLEMENT_TYPES.flatMap((type): Omit<Satellite, "shown">[] => {
      const concept = selection[type];
      const num = selection[`${type}Number` as keyof PhraseSelection] as
        | "singular"
        | "plural"
        | undefined;
      const gen = selection[`${type}Gender` as keyof PhraseSelection] as
        | Gender
        | undefined;
      const def = selection[`${type}Definiteness` as keyof PhraseSelection] as
        | Definiteness
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
          // Adjectives/possessor/relative attach to a noun head; a pronoun complement
          // (only `cause` allows one) takes none of them.
          available: concept?.role === "noun",
          hasValue: Boolean(adj),
          valueLabel: conceptLabel(adj),
        },
        {
          key: `${type}Adjective2`,
          parent: type,
          label: "Adjective 2",
          icon: <BrushIcon sx={iconSx} />,
          available: concept?.role === "noun" && Boolean(adj),
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
          directToggle: true,
          valueLabel: num === "plural" ? "Plural" : "Singular",
        },
        {
          key: `${type}Gender`,
          parent: type,
          label: "Gender",
          icon: genderIcon(gen),
          // Gendered nouns, plus a 3rd-person pronoun (he/she) so a pronoun cause can
          // render feminine ("a causa di lei", "because of her").
          available:
            Boolean(concept?.gendered) ||
            (concept?.role === "pronoun" && concept?.person === "3"),
          hasValue: Boolean(gen) && gen !== "masc",
          alwaysSet: true,
          directToggle: true,
          valueLabel: genderLabel(gen),
        },
        {
          key: `${type}Definiteness`,
          parent: type,
          label: "Determiner",
          icon: <ArticleOutlinedIcon sx={iconSx} />,
          // The predicative plus the adposition-bearing spatial/dative complements carry a
          // determiner, and only for a noun head (a pronoun cause takes none). Cause is not
          // in the set — it folds the quantifier into its connector.
          available:
            DETERMINER_COMPLEMENT_TYPES.includes(type) && concept?.role === "noun",
          hasValue: Boolean(
            def && def !== "definite",
          ),
          alwaysSet: true,
          valueLabel: DEFINITENESS_LABELS[def ?? "definite"],
        },
        {
          key: `${type}Relative`,
          parent: type,
          label: "Relative clause",
          icon: <AccountTreeIcon sx={iconSx} />,
          available: concept?.role === "noun",
          hasValue: false,
        },
        {
          key: `${type}Possessor`,
          parent: type,
          label: "Possessor",
          icon: <KeyIcon sx={iconSx} />,
          available: concept?.role === "noun",
          hasValue: Boolean(
            (
              selection[`${type}Possessor` as keyof PhraseSelection] as
                | PhraseSelection
                | undefined
            )?.subject,
          ),
        },
      ];
    }),
  ];

  const satellites: Satellite[] = rawSatellites.map((s) => ({
    ...s,
    // A direct-toggle satellite (number) has no box to reveal — its border icon
    // carries the value. Otherwise an explicit toggle wins; else a set one auto-expands.
    shown: s.available && !s.directToggle && (revealed[s.key] ?? s.hasValue),
  }));
  const shownMap: Record<string, boolean> = Object.fromEntries(
    satellites.map((s) => [s.key, s.shown]),
  );

  return { satellites, shownMap };
}
