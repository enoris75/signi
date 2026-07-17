import { ReactNode } from "react";
import BrushIcon from "@mui/icons-material/Brush";
import NumbersIcon from "@mui/icons-material/Numbers";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import GavelIcon from "@mui/icons-material/Gavel";
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
import BuildIcon from "@mui/icons-material/Build";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import AdjustIcon from "@mui/icons-material/Adjust";
import {
  ASPECT_LABELS,
  COMPLEMENT_LABELS,
  DETERMINER_COMPLEMENT_TYPES,
  TENSE_LABELS,
  defaultDefiniteness,
  type Concept,
  type ComplementType,
  type Definiteness,
  type LanguageCode,
} from "@signi/shared";
import { conceptWord, type UiStringLookup } from "../../i18n/conceptWord.ts";
import {
  GenderSlot,
  NounKey,
  NumberSlot,
  PhraseSelection,
  SlotKey,
  CONJUNCTS_KEY,
  WorkspaceBinding,
} from "./interfaces.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import {
  BOX_COMPLEMENT_TYPES,
  COMPLEMENT_KEY_SET,
  COMPLEMENT_LABEL_KEYS,
  COORDINABLE_NOUN_KEYS,
  REVEALABLE_SLOT_KEYS,
} from "./slots.ts";

// Satellite elements (gender / number / polarity / adjective / adverb) are hidden
// by default and revealed via the small icons on each main box border.
export type Satellite = {
  key: string;
  // The box whose border carries this satellite's control. Usually a core word box,
  // but a chained satellite rides another satellite's box (Adjective 2 on Adjective 1).
  parent: SlotKey;
  label: string;
  icon: ReactNode;
  available: boolean;
  // hasValue = carries a *non-default* value (plural / fem / negative / a chosen word).
  hasValue: boolean;
  // alwaysSet = number / gender / polarity — these always hold a value (even the
  // default), so their icon reads as "valued" and the tooltip shows the current one.
  alwaysSet?: boolean;
  // Whether the satellite's box is on the canvas before anyone touches its control.
  // Defaults to `hasValue` — an empty satellite stays folded away until revealed. The
  // direct object overrides it: it is a core role, offered open the moment a transitive
  // verb licenses it, and its control is there to *hide* it.
  defaultShown?: boolean;
  // directToggle = the border icon *is* the control: clicking it flips the value
  // (singular ⇄ plural, positive ⇄ negative) in place, with no expandable canvas box.
  // Such satellites never `shown` (there is nothing to reveal); the icon's
  // solid/outlined state indicates the current value and its tooltip spells it out.
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

const complementIcons: Record<ComplementType, ReactNode> = {
  predicative: <LinkIcon sx={iconSx} />,
  locative: <PlaceIcon sx={iconSx} />,
  direction: <ArrowForwardIcon sx={iconSx} />,
  source: <ArrowBackIcon sx={iconSx} />,
  route: <RouteIcon sx={iconSx} />,
  cause: <HelpOutlineIcon sx={iconSx} />,
  instrumental: <BuildIcon sx={iconSx} />,
  terminus: <CallReceivedIcon sx={iconSx} />,
};

// Derive every satellite for the current selection, resolving each one's `shown`
// state (an explicit reveal toggle wins; otherwise a set satellite auto-expands).
export function buildSatellites(
  selection: PhraseSelection,
  revealed: Record<string, boolean>,
  // The UI language: a satellite that carries a word (an adjective, a modal, a complement)
  // shows it as the picker offered it, not in English.
  language: LanguageCode,
  // The UI-string lookup, for the one label the lexicon cannot give on its own: a pronoun,
  // which shows the person it stands for rather than a word.
  t: UiStringLookup,
): { satellites: Satellite[]; shownMap: Record<string, boolean> } {
  const label = (c?: Concept) => conceptWord(c, language, t);
  const subjectRole = selection.subject?.role;
  // How many phrases are coordinated with a noun block's own head ("Peter *and Paul*").
  const conjunctCount = (which: NounKey): number =>
    ((selection[CONJUNCTS_KEY(which)] as PhraseSelection[] | undefined) ?? []).length;
  const supportedComplements = selection.verb?.complements ?? [];

  const showSubjectNumber = Boolean(selection.subject);
  const showSubjectGender =
    selection.subject?.role === "pronoun" ||
    (selection.subject?.role === "noun" &&
      Boolean(selection.subject?.gendered));
  const showDirectObjNumber = Boolean(selection.directObject);
  const showDirectObjGender = Boolean(selection.directObject?.gendered);

  const rawSatellites: Omit<Satellite, "shown">[] = [
    {
      key: "subjectAdjective",
      parent: "subject",
      label: "Adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun",
      hasValue: Boolean(selection.subjectAdjective),
      valueLabel: label(selection.subjectAdjective),
    },
    {
      // Adjectives chain: each one's control rides the *previous* adjective's box, not the
      // noun's, and only appears once that previous adjective holds a word. The chain
      // stops at three.
      key: "subjectAdjective2",
      parent: "subjectAdjective",
      label: "Adjective 2",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun" && Boolean(selection.subjectAdjective),
      hasValue: Boolean(selection.subjectAdjective2),
      valueLabel: label(selection.subjectAdjective2),
    },
    {
      key: "subjectAdjective3",
      parent: "subjectAdjective2",
      label: "Adjective 3",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun" && Boolean(selection.subjectAdjective2),
      hasValue: Boolean(selection.subjectAdjective3),
      valueLabel: label(selection.subjectAdjective3),
    },
    {
      key: "subjectNumber",
      parent: "subject",
      label: t("satellite.number"),
      icon: <NumbersIcon sx={iconSx} />,
      available: showSubjectNumber,
      hasValue: selection.subjectNumber === "plural",
      alwaysSet: true,
      directToggle: true,
      valueLabel: t(`number.value.${selection.subjectNumber ?? "singular"}`),
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
      label: t("satellite.determiner"),
      icon: <ArticleOutlinedIcon sx={iconSx} />,
      // Only a noun head takes an article; pronoun subjects render without one.
      available: subjectRole === "noun",
      hasValue: Boolean(
        selection.subjectDefiniteness &&
          selection.subjectDefiniteness !== "definite",
      ),
      alwaysSet: true,
      valueLabel: t(`determiner.name.${selection.subjectDefiniteness ?? "definite"}`),
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
      // Set by either a genitive possessor phrase or a pronominal reference to another noun.
      hasValue: Boolean(selection.subjectPossessor?.subject) || Boolean(selection.subjectPossessorRef),
    },
    {
      key: "subjectConjunct",
      parent: "subject",
      label: "Coordination",
      icon: <CallSplitIcon sx={iconSx} />,
      // Anything that can head a subject can be coordinated with another — nouns ("the cat and
      // the dog") and pronouns alike ("you and I"). Clicking adds a conjunct rather than
      // revealing a box, so this control is a direct action, not a reveal (see buildSatelliteIcons).
      available: Boolean(selection.subject),
      hasValue: conjunctCount("subject") > 0,
    },
    {
      key: "verbNegative",
      parent: "verb",
      label: "Polarity",
      icon: <RemoveCircleOutlineIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.verbNegative),
      alwaysSet: true,
      directToggle: true,
      valueLabel: selection.verbNegative ? "Negative" : "Positive",
    },
    {
      key: "verbTense",
      parent: "verb",
      label: "Tense",
      icon: <AccessTimeIcon sx={iconSx} />,
      // An imperative is tenseless (present command), so the control is withdrawn under it.
      available: !selection.imperative,
      // Non-default (solid) once the tense is anything but the implicit present.
      hasValue: Boolean(selection.verbTense) && selection.verbTense !== "present",
      alwaysSet: true,
      valueLabel: TENSE_LABELS[selection.verbTense ?? "present"],
    },
    {
      key: "verbAspect",
      parent: "verb",
      label: "Aspect",
      icon: <TimelapseIcon sx={iconSx} />,
      // An imperative forces neutral aspect, so the control is withdrawn under it.
      available: !selection.imperative,
      // Non-default (solid) once the aspect is anything but the implicit neutral.
      hasValue: Boolean(selection.verbAspect) && selection.verbAspect !== "neutral",
      alwaysSet: true,
      valueLabel: ASPECT_LABELS[selection.verbAspect ?? "neutral"],
    },
    {
      // Modals chain like the adjectives: the verb box carries the control for the
      // outermost modal, and that modal's box carries the control for the one it governs
      // ("voglio" opens the control that reveals "poter", which governs "andare").
      key: "verbModal",
      parent: "verb",
      label: "Modal",
      icon: <GavelIcon sx={iconSx} />,
      // A modal fills the same finite/mood slot as the command, so it's withdrawn under it.
      available: !selection.imperative,
      hasValue: Boolean(selection.verbModal),
      valueLabel: label(selection.verbModal),
    },
    {
      key: "verbModal2",
      parent: "verbModal",
      label: "Modal 2",
      icon: <GavelIcon sx={iconSx} />,
      available: !selection.imperative && Boolean(selection.verbModal),
      hasValue: Boolean(selection.verbModal2),
      valueLabel: label(selection.verbModal2),
    },
    // Each modal's own adverb, revealed from its modal's box once it holds a word — the same
    // Adverb control the main verb carries, scoped to that modal ("never wanted to always go").
    {
      key: "verbModalAdverb",
      parent: "verbModal",
      label: "Modal Adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: !selection.imperative && Boolean(selection.verbModal),
      hasValue: Boolean(selection.verbModalAdverb),
      valueLabel: label(selection.verbModalAdverb),
    },
    {
      key: "verbModal2Adverb",
      parent: "verbModal2",
      label: "Modal 2 Adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: !selection.imperative && Boolean(selection.verbModal2),
      hasValue: Boolean(selection.verbModal2Adverb),
      valueLabel: label(selection.verbModal2Adverb),
    },
    {
      key: "modifier",
      parent: "verb",
      label: "Adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.modifier),
      valueLabel: label(selection.modifier),
    },
    // The direct object's own control. It rides the verb-phrase dotted box, like the complement
    // toggles, and anchors the connector that runs from there to the object's dotted box — which
    // otherwise starts nowhere. Unlike a complement it is shown by default: a transitive verb
    // wants its object, so the box is offered open and this control folds it away.
    {
      key: "directObject",
      parent: "verb",
      label: "Direct Object",
      icon: <AdjustIcon sx={iconSx} />,
      available:
        Boolean(selection.verb) &&
        selection.verb?.transitivity !== "intransitive",
      hasValue: Boolean(selection.directObject),
      valueLabel: label(selection.directObject),
      defaultShown: true,
    },
    {
      key: "directObjectAdjective",
      parent: "directObject",
      label: "Adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: Boolean(selection.directObjectAdjective),
      valueLabel: label(selection.directObjectAdjective),
    },
    {
      key: "directObjectAdjective2",
      parent: "directObjectAdjective",
      label: "Adjective 2",
      icon: <BrushIcon sx={iconSx} />,
      available:
        Boolean(selection.directObject) &&
        Boolean(selection.directObjectAdjective),
      hasValue: Boolean(selection.directObjectAdjective2),
      valueLabel: label(selection.directObjectAdjective2),
    },
    {
      key: "directObjectAdjective3",
      parent: "directObjectAdjective2",
      label: "Adjective 3",
      icon: <BrushIcon sx={iconSx} />,
      available:
        Boolean(selection.directObject) &&
        Boolean(selection.directObjectAdjective2),
      hasValue: Boolean(selection.directObjectAdjective3),
      valueLabel: label(selection.directObjectAdjective3),
    },
    {
      key: "directObjectNumber",
      parent: "directObject",
      label: t("satellite.number"),
      icon: <NumbersIcon sx={iconSx} />,
      available: showDirectObjNumber,
      hasValue: selection.directObjectNumber === "plural",
      alwaysSet: true,
      directToggle: true,
      valueLabel: t(`number.value.${selection.directObjectNumber ?? "singular"}`),
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
      label: t("satellite.determiner"),
      icon: <ArticleOutlinedIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: Boolean(
        selection.directObjectDefiniteness &&
          selection.directObjectDefiniteness !== "definite",
      ),
      alwaysSet: true,
      valueLabel: t(`determiner.name.${selection.directObjectDefiniteness ?? "definite"}`),
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
      hasValue: Boolean(selection.directObjectPossessor?.subject) || Boolean(selection.directObjectPossessorRef),
    },
    {
      key: "directObjectConjunct",
      parent: "directObject",
      label: "Coordination",
      icon: <CallSplitIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: conjunctCount("directObject") > 0,
    },
    // The instrumental has no box on this canvas: its noun phrase lives in a period container
    // of its own, and this control on the verb-phrase dotted box is the link to it (started,
    // and later cleared, in buildSatelliteIcons off the workspace binding — like the
    // relative-clause control, `hasValue` is a fact about the links, not the selection).
    {
      key: "instrumental",
      parent: "verb",
      label: t("slot.instrumental"),
      icon: complementIcons.instrumental,
      available: supportedComplements.includes("instrumental"),
      hasValue: false,
    },
    // Complement toggles live on the VERB box; number/gender hang off each complement.
    ...BOX_COMPLEMENT_TYPES.flatMap((type): Omit<Satellite, "shown">[] => {
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
      const adj3 = selection[`${type}Adjective3` as keyof PhraseSelection] as
        | Concept
        | undefined;
      const labelKey = COMPLEMENT_LABEL_KEYS[type];
      return [
        {
          key: type,
          parent: "verb",
          // A complement whose name is seeded shows it in the UI language ("complemento di
          // mezzo"); the rest still read their static English label.
          label: labelKey ? t(labelKey) : COMPLEMENT_LABELS[type],
          icon: complementIcons[type],
          available: supportedComplements.includes(type),
          hasValue: Boolean(concept),
          valueLabel: label(concept),
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
          valueLabel: label(adj),
        },
        {
          key: `${type}Adjective2`,
          parent: `${type}Adjective`,
          label: "Adjective 2",
          icon: <BrushIcon sx={iconSx} />,
          available: concept?.role === "noun" && Boolean(adj),
          hasValue: Boolean(adj2),
          valueLabel: label(adj2),
        },
        {
          key: `${type}Adjective3`,
          parent: `${type}Adjective2`,
          label: "Adjective 3",
          icon: <BrushIcon sx={iconSx} />,
          available: concept?.role === "noun" && Boolean(adj2),
          hasValue: Boolean(adj3),
          valueLabel: label(adj3),
        },
        {
          key: `${type}Number`,
          parent: type,
          label: t("satellite.number"),
          icon: <NumbersIcon sx={iconSx} />,
          // A predicate adjective has no number of its own — it agrees with the subject.
          available: Boolean(concept) && concept?.role !== "adjective",
          hasValue: num === "plural",
          alwaysSet: true,
          directToggle: true,
          valueLabel: t(`number.value.${num ?? "singular"}`),
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
          label: t("satellite.determiner"),
          icon: <ArticleOutlinedIcon sx={iconSx} />,
          // The predicative plus the adposition-bearing spatial/dative complements carry a
          // determiner, and only for a noun head (a pronoun cause takes none). Cause is not
          // in the set — it folds the quantifier into its connector.
          available:
            DETERMINER_COMPLEMENT_TYPES.includes(type) && concept?.role === "noun",
          hasValue: Boolean(
            def && def !== defaultDefiniteness(type),
          ),
          alwaysSet: true,
          valueLabel: t(`determiner.name.${def ?? defaultDefiniteness(type)}`),
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
          hasValue:
            Boolean(
              (
                selection[`${type}Possessor` as keyof PhraseSelection] as
                  | PhraseSelection
                  | undefined
              )?.subject,
            ) || Boolean(selection[`${type}PossessorRef` as keyof PhraseSelection]),
        },
        {
          key: `${type}Conjunct`,
          parent: type,
          label: "Coordination",
          icon: <CallSplitIcon sx={iconSx} />,
          // Only the adposition-free complement coordinates today — the predicative subject
          // complement ("seems happy or tired", "becomes a legend and an icon"). See
          // COORDINABLE_NOUN_KEYS for why the prepositional ones are held back.
          available: COORDINABLE_NOUN_KEYS.includes(type) && Boolean(concept),
          hasValue: conjunctCount(type) > 0,
        },
      ];
    }),
  ];

  // A command drops its subject: the subject box is replaced by the command box (PhraseCanvas),
  // so the whole subject family — its adjectives, number/gender, determiner, relative clause and
  // possessor — has no head to hang off and is withdrawn. Every one of those satellites is keyed
  // off the subject, and dropping them here is what keeps their controls, their boxes and their
  // connectors from floating over the box that took its place.
  const subjectDropped = (key: string) =>
    Boolean(selection.imperative) && key.startsWith("subject");

  // Folding the direct object's box away takes its whole family with it — its adjectives,
  // number/gender, determiner, relative clause, possessor and conjuncts all hang off a head
  // that is no longer on the canvas. Same move as `subjectDropped` above, and what keeps
  // their controls and connectors from floating over the space the box used to hold.
  const directObject = rawSatellites.find((s) => s.key === "directObject")!;
  const directObjectShown =
    directObject.available && (revealed.directObject ?? true);
  const directObjectDropped = (key: string) =>
    !directObjectShown && key.startsWith("directObject") && key !== "directObject";

  const satellites: Satellite[] = rawSatellites.map((s) => {
    const available =
      s.available && !subjectDropped(s.key) && !directObjectDropped(s.key);
    return {
      ...s,
      available,
      // A direct-toggle satellite (number) has no box to reveal — its border icon
      // carries the value. Otherwise an explicit toggle wins; else a set one auto-expands.
      shown:
        available &&
        !s.directToggle &&
        (revealed[s.key] ?? s.defaultShown ?? s.hasValue),
    };
  });
  const shownMap: Record<string, boolean> = Object.fromEntries(
    satellites.map((s) => [s.key, s.shown]),
  );

  return { satellites, shownMap };
}

// The relative-clause, possessor and coordination controls a noun carries on its *dotted-box*
// perimeter, rather than on its word box border.
export type PerimeterEntry = {
  relative?: SatelliteIcon;
  possessor?: SatelliteIcon;
  conjunct?: SatelliteIcon;
};

// Sort every available satellite into the three places its control can render: on its
// parent word box's border, on the verb-phrase dotted box (the complement toggles), or
// on a noun's dotted-box perimeter (the relative-clause + possessor controls, which also
// anchor their connector lines). Pure derivation from the satellites and the current
// collapse / link state; the three `on*` callbacks are what each icon does when clicked.
export function buildSatelliteIcons({
  satellites,
  shownMap,
  collapsedMainKeys,
  linkBinding,
  onToggleNumber,
  onToggleGender,
  onToggleNegative,
  onToggleReveal,
  onAddConjunct,
}: {
  satellites: Satellite[];
  shownMap: Record<string, boolean>;
  // Main-word keys of the currently collapsed groups — a collapsed group hides its
  // own reveal icons.
  collapsedMainKeys: Set<string>;
  linkBinding: WorkspaceBinding | undefined;
  onToggleNumber: (which: NumberSlot) => void;
  onToggleGender: (which: GenderSlot) => void;
  onToggleNegative: () => void;
  onToggleReveal: (sat: Satellite) => void;
  // Append a conjunct to a noun block. Unlike the reveals, this control *adds* — a block can
  // coordinate any number of phrases, so each click opens one more panel.
  onAddConjunct: (which: NounKey) => void;
}): {
  satelliteIconsByParent: Record<string, SatelliteIcon[]>;
  complementToggleIcons: SatelliteIcon[];
  perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>>;
  directObjectToggle?: SatelliteIcon;
} {
  const satelliteIconsByParent: Record<string, SatelliteIcon[]> = {};
  const complementToggleIcons: SatelliteIcon[] = [];
  const perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>> = {};
  // Sits apart from the complement-toggle row: it is pinned to the point where the object's
  // connector leaves the verb-phrase dotted box, so it reads as that line's start (VerbPhraseBuilder).
  let directObjectToggle: SatelliteIcon | undefined;

  for (const sat of satellites) {
    if (!sat.available) continue;
    // The instrumental control is a cross-container link, not a reveal: it rides the verb-phrase
    // dotted box (with the other complement toggles) and points at the period holding the
    // instrument. Clicking it starts a pick, or removes the link once one is made. It exists
    // only in a workspace container — a standalone period has nowhere to link to.
    if (sat.key === "instrumental") {
      if (!linkBinding) continue;
      const linked = linkBinding.instrumental.hasSource;
      complementToggleIcons.push({
        key: sat.key,
        icon: sat.icon,
        // Never "active": there is no box to reveal, so the icon reads as *set* (a link exists)
        // or not, and its tooltip says what clicking will do.
        active: false,
        label: sat.label,
        isSet: linked,
        valued: false,
        valueLabel: linked ? "Linked — click to remove" : undefined,
        onToggle: () =>
          linked
            ? linkBinding.instrumental.onClear()
            : linkBinding.instrumental.onStart(),
      });
      continue;
    }
    // The "Relative clause" satellite is a cross-container link control, not a reveal.
    // It only exists in a workspace container (needs the binding); clicking it starts a
    // link (pick a noun in another container) or, when already a source, removes it.
    const relativeNoun: NounKey | null = sat.key.endsWith("Relative")
      ? (sat.key.slice(0, -"Relative".length) as NounKey)
      : null;
    if (relativeNoun) {
      if (!linkBinding) continue;
      const isSource = linkBinding.relative.sourceKeys.has(relativeNoun);
      (perimeterByNoun[relativeNoun] ??= {}).relative = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        active: isSource,
        isSet: isSource,
        valued: false,
        valueLabel: isSource ? "Linked — click to remove" : undefined,
        onToggle: () =>
          isSource
            ? linkBinding.relative.onRemoveLink(relativeNoun)
            : linkBinding.relative.onStartLink(relativeNoun),
      };
      continue;
    }
    // The "Coordinate" satellite rides the perimeter beside the possessor control and, like it,
    // anchors a connector down into the panels below. Clicking it appends one more conjunct.
    const conjunctNoun: NounKey | null = sat.key.endsWith("Conjunct")
      ? (sat.key.slice(0, -"Conjunct".length) as NounKey)
      : null;
    if (conjunctNoun) {
      (perimeterByNoun[conjunctNoun] ??= {}).conjunct = {
        key: sat.key,
        icon: sat.icon,
        label: sat.label,
        // Never `active`: this control does not reveal a box that a second click would hide —
        // it *appends* a phrase, and clicking it again appends another. Saying so keeps the
        // button's tooltip on its value ("Add a conjunct") instead of offering to "Hide" it.
        active: false,
        isSet: sat.hasValue,
        valued: true,
        valueLabel: sat.hasValue ? "Add another conjunct" : "Add a conjunct",
        onToggle: () => onAddConjunct(conjunctNoun),
      };
      continue;
    }
    // A direct-toggle satellite (number / gender / polarity) has no reveal box — its
    // border icon flips the value in place (singular ⇄ plural, positive ⇄ negative, or
    // cycling masc → fem → …). `which` is the slot key minus the "Number" / "Gender" suffix.
    const numberSlot: NumberSlot | null =
      sat.directToggle && sat.key.endsWith("Number")
        ? (sat.key.slice(0, -"Number".length) as NumberSlot)
        : null;
    const genderSlot: GenderSlot | null =
      sat.directToggle && sat.key.endsWith("Gender")
        ? (sat.key.slice(0, -"Gender".length) as GenderSlot)
        : null;
    const iconEntry: SatelliteIcon = {
      key: sat.key,
      icon: sat.icon,
      label: sat.label,
      active: sat.shown,
      isSet: sat.hasValue,
      valued: Boolean(sat.alwaysSet),
      valueLabel: sat.valueLabel,
      directToggle: sat.directToggle,
      onToggle: numberSlot
        ? () => onToggleNumber(numberSlot)
        : genderSlot
          ? () => onToggleGender(genderSlot)
          : sat.key === "verbNegative"
            ? onToggleNegative
            : () => onToggleReveal(sat),
    };
    if (sat.key === "directObject") {
      directObjectToggle = iconEntry;
      continue;
    }
    // The possessor reveal toggle likewise rides the dotted-box perimeter and anchors
    // its own connector down to the possessor panel.
    const possessorNoun: NounKey | null = sat.key.endsWith("Possessor")
      ? (sat.key.slice(0, -"Possessor".length) as NounKey)
      : null;
    if (possessorNoun) {
      (perimeterByNoun[possessorNoun] ??= {}).possessor = iconEntry;
      continue;
    }
    if (COMPLEMENT_KEY_SET.has(sat.key as SlotKey)) {
      complementToggleIcons.push(iconEntry);
    } else {
      // A collapsed group hides its own reveal icons; complement toggles ride
      // the verb box but belong to sibling groups, so they stay above.
      if (collapsedMainKeys.has(sat.parent)) continue;
      // A control riding another satellite's box (Adjective 2 on Adjective 1) can only
      // appear while that box is itself on the canvas.
      if (REVEALABLE_SLOT_KEYS.has(sat.parent) && !shownMap[sat.parent]) continue;
      (satelliteIconsByParent[sat.parent] ??= []).push(iconEntry);
    }
  }

  return {
    satelliteIconsByParent,
    complementToggleIcons,
    perimeterByNoun,
    directObjectToggle,
  };
}
