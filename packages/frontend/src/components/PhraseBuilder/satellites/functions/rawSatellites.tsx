import BrushIcon from "@mui/icons-material/Brush";
import NumbersIcon from "@mui/icons-material/Numbers";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import GavelIcon from "@mui/icons-material/Gavel";
import TuneIcon from "@mui/icons-material/Tune";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import KeyIcon from "@mui/icons-material/Key";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import AdjustIcon from "@mui/icons-material/Adjust";
import {
  DETERMINER_COMPLEMENT_TYPES,
  defaultDefiniteness,
  type Concept,
  type Definiteness,
  type LanguageCode,
} from "@signi/shared";
import { conceptWord, type UiStringLookup } from "../../../../i18n/conceptWord.ts";
import { NounKey, PhraseSelection, CONJUNCTS_KEY } from "../../interfaces.ts";
import {
  BOX_COMPLEMENT_TYPES,
  COMPLEMENT_LABEL_KEYS,
  COORDINABLE_NOUN_KEYS,
} from "../../slots.ts";
import {
  complementIcons,
  iconSx,
  type Gender,
  type RawSatellite,
} from "../satellites.types.tsx";
import { genderIcon } from "./genderIcon.tsx";
import { genderLabel } from "./genderLabel.ts";

// Every satellite the selection could carry, each saying whether its own head licenses it and
// whether it holds a value. Rules that reach across satellites — a dropped subject, a folded
// object — and whether each box is shown are left to resolveSatellites.
export function rawSatellites(
  selection: PhraseSelection,
  // The UI language: a satellite that carries a word (an adjective, a modal, a complement)
  // shows it as the picker offered it, not in English.
  language: LanguageCode,
  // The UI-string lookup, for the one label the lexicon cannot give on its own: a pronoun,
  // which shows the person it stands for rather than a word.
  t: UiStringLookup,
): RawSatellite[] {
  const label = (c?: Concept) => conceptWord(c, language, t);
  const subjectRole = selection.subject?.role;
  // A command and an infinitive citation are both moods occupying the finite slot: each forces
  // present tense / neutral aspect / no modals and drops the subject, so the tense, aspect and
  // modal controls are withdrawn under either (the subject family is dropped in resolveSatellites).
  const finiteSlotTaken = Boolean(selection.imperative || selection.infinitive);
  // How many phrases are coordinated with a noun block's own head ("Peter *and Paul*").
  const conjunctCount = (which: NounKey): number =>
    ((selection[CONJUNCTS_KEY(which)] as PhraseSelection[] | undefined) ?? []).length;
  const supportedComplements = selection.verb?.complements ?? [];
  // Whether the verb has a patient at all. Only a transitive or ditransitive one does, and only
  // those can be put in the passive (see `VerbPhrase.voice`).
  const passivizable =
    selection.verb?.transitivity === "transitive" || selection.verb?.transitivity === "ditransitive";

  const showSubjectNumber = Boolean(selection.subject);
  const showSubjectGender =
    selection.subject?.role === "pronoun" ||
    (selection.subject?.role === "noun" &&
      Boolean(selection.subject?.gendered));
  const directObjectRole = selection.directObject?.role;
  const showDirectObjNumber = Boolean(selection.directObject);
  // Gendered nouns, plus a 3rd-person pronoun object — the one person whose object form is
  // gendered ("lo" / "la", "him" / "her"). First and second person spell one form either way.
  const showDirectObjGender =
    Boolean(selection.directObject?.gendered) ||
    (directObjectRole === "pronoun" && selection.directObject?.person === "3");

  return [
    {
      key: "subjectAdjective",
      parent: "subject",
      label: t("category.adjective"),
      labelKey: "category.adjective",
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
      label: t("category.adjective"),
      labelKey: "category.adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun" && Boolean(selection.subjectAdjective),
      hasValue: Boolean(selection.subjectAdjective2),
      valueLabel: label(selection.subjectAdjective2),
    },
    {
      key: "subjectAdjective3",
      parent: "subjectAdjective2",
      label: t("category.adjective"),
      labelKey: "category.adjective",
      icon: <BrushIcon sx={iconSx} />,
      available: subjectRole === "noun" && Boolean(selection.subjectAdjective2),
      hasValue: Boolean(selection.subjectAdjective3),
      valueLabel: label(selection.subjectAdjective3),
    },
    {
      key: "subjectNumber",
      parent: "subject",
      label: t("satellite.number"),
      labelKey: "satellite.number",
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
      label: t("satellite.gender"),
      labelKey: "satellite.gender",
      icon: genderIcon(selection.subjectGender),
      available: showSubjectGender,
      hasValue: Boolean(selection.subjectGender) && selection.subjectGender !== "masc",
      alwaysSet: true,
      directToggle: true,
      valueLabel: genderLabel(t, selection.subjectGender),
    },
    {
      key: "subjectDefiniteness",
      parent: "subject",
      label: t("satellite.determiner"),
      labelKey: "satellite.determiner",
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
      label: t("satellite.relative"),
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
      label: t("slot.possessor"),
      labelKey: "slot.possessor",
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
      label: t("satellite.coordination"),
      icon: <CallSplitIcon sx={iconSx} />,
      // Anything that can head a subject can be coordinated with another — nouns ("the cat and
      // the dog") and pronouns alike ("you and I"). Clicking adds a conjunct rather than
      // revealing a box, so this control is a direct action, not a reveal (see buildSatelliteIcons).
      available: Boolean(selection.subject),
      hasValue: conjunctCount("subject") > 0,
      valueLabel: t(conjunctCount("subject") > 0 ? "action.addAnotherConjunct" : "action.addConjunct"),
    },
    {
      key: "verbNegative",
      parent: "verb",
      label: t("satellite.polarity"),
      icon: <RemoveCircleOutlineIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.verbNegative),
      alwaysSet: true,
      directToggle: true,
      valueLabel: t(`polarity.value.${selection.verbNegative ? "negative" : "positive"}`),
    },
    {
      key: "verbTense",
      parent: "verb",
      label: t("satellite.tense"),
      labelKey: "satellite.tense",
      icon: <AccessTimeIcon sx={iconSx} />,
      // An imperative is tenseless (present command), so the control is withdrawn under it.
      available: !finiteSlotTaken,
      // Non-default (solid) once the tense is anything but the implicit present.
      hasValue: Boolean(selection.verbTense) && selection.verbTense !== "present",
      alwaysSet: true,
      valueLabel: t(`tense.value.${selection.verbTense ?? "present"}`),
    },
    {
      key: "verbAspect",
      parent: "verb",
      label: t("satellite.aspect"),
      labelKey: "satellite.aspect",
      icon: <TimelapseIcon sx={iconSx} />,
      // An imperative forces neutral aspect, so the control is withdrawn under it.
      available: !finiteSlotTaken,
      // Non-default (solid) once the aspect is anything but the implicit neutral.
      hasValue: Boolean(selection.verbAspect) && selection.verbAspect !== "neutral",
      alwaysSet: true,
      valueLabel: t(`aspect.value.${selection.verbAspect ?? "neutral"}`),
    },
    {
      key: "verbVoice",
      parent: "directObject",
      label: t("satellite.voice"),
      labelKey: "satellite.voice",
      icon: <SwapHorizIcon sx={iconSx} />,
      // Only a transitive verb with a direct object has a patient to promote into the subject
      // slot, so the control is there only when there is a passive to be had — the same condition
      // the translator checks before it re-maps anything (see `resolveVoice`). A command is always
      // active, so the finite slot being taken withdraws it as it does the tense and the aspect.
      available: !finiteSlotTaken && passivizable && Boolean(selection.directObject),
      // Non-default (solid) once the voice is anything but the implicit active.
      hasValue: selection.verbVoice === "passive",
      alwaysSet: true,
      valueLabel: t(`voice.value.${selection.verbVoice ?? "active"}`),
    },
    {
      // Modals chain like the adjectives: the verb box carries the control for the
      // outermost modal, and that modal's box carries the control for the one it governs
      // ("voglio" opens the control that reveals "poter", which governs "andare").
      key: "verbModal",
      parent: "verb",
      label: t("slot.modal"),
      labelKey: "slot.modal",
      icon: <GavelIcon sx={iconSx} />,
      // A modal fills the same finite/mood slot as the command, so it's withdrawn under it.
      available: !finiteSlotTaken,
      hasValue: Boolean(selection.verbModal),
      valueLabel: label(selection.verbModal),
    },
    {
      key: "verbModal2",
      parent: "verbModal",
      label: t("slot.modal"),
      labelKey: "slot.modal",
      icon: <GavelIcon sx={iconSx} />,
      available: !finiteSlotTaken && Boolean(selection.verbModal),
      hasValue: Boolean(selection.verbModal2),
      valueLabel: label(selection.verbModal2),
    },
    // Each modal's own adverb, revealed from its modal's box once it holds a word — the same
    // Adverb control the main verb carries, scoped to that modal ("never wanted to always go").
    {
      key: "verbModalAdverb",
      parent: "verbModal",
      label: t("slot.adverb"),
      labelKey: "slot.adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: !finiteSlotTaken && Boolean(selection.verbModal),
      hasValue: Boolean(selection.verbModalAdverb),
      valueLabel: label(selection.verbModalAdverb),
    },
    {
      key: "verbModal2Adverb",
      parent: "verbModal2",
      label: t("slot.adverb"),
      labelKey: "slot.adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: !finiteSlotTaken && Boolean(selection.verbModal2),
      hasValue: Boolean(selection.verbModal2Adverb),
      valueLabel: label(selection.verbModal2Adverb),
    },
    {
      key: "modifier",
      parent: "verb",
      label: t("slot.adverb"),
      labelKey: "slot.adverb",
      icon: <TuneIcon sx={iconSx} />,
      available: true,
      hasValue: Boolean(selection.modifier),
      valueLabel: label(selection.modifier),
    },
    // The direct object's own control. It rides the verb-phrase dotted ring, like the complement
    // toggles, and anchors the connector that runs from there to the object's dotted ring — which
    // otherwise starts nowhere. Unlike a complement it is shown by default: a transitive verb
    // wants its object, so the box is offered open and this control folds it away.
    {
      key: "directObject",
      parent: "verb",
      label: t("slot.directObject"),
      labelKey: "slot.directObject",
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
      label: t("category.adjective"),
      labelKey: "category.adjective",
      icon: <BrushIcon sx={iconSx} />,
      // Adjectives, a determiner, a relative clause and a possessor all attach to a noun
      // head; a pronoun object takes none of them, exactly as a pronoun subject takes none.
      available: directObjectRole === "noun",
      hasValue: Boolean(selection.directObjectAdjective),
      valueLabel: label(selection.directObjectAdjective),
    },
    {
      key: "directObjectAdjective2",
      parent: "directObjectAdjective",
      label: t("category.adjective"),
      labelKey: "category.adjective",
      icon: <BrushIcon sx={iconSx} />,
      available:
        directObjectRole === "noun" &&
        Boolean(selection.directObjectAdjective),
      hasValue: Boolean(selection.directObjectAdjective2),
      valueLabel: label(selection.directObjectAdjective2),
    },
    {
      key: "directObjectAdjective3",
      parent: "directObjectAdjective2",
      label: t("category.adjective"),
      labelKey: "category.adjective",
      icon: <BrushIcon sx={iconSx} />,
      available:
        directObjectRole === "noun" &&
        Boolean(selection.directObjectAdjective2),
      hasValue: Boolean(selection.directObjectAdjective3),
      valueLabel: label(selection.directObjectAdjective3),
    },
    {
      key: "directObjectNumber",
      parent: "directObject",
      label: t("satellite.number"),
      labelKey: "satellite.number",
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
      label: t("satellite.gender"),
      labelKey: "satellite.gender",
      icon: genderIcon(selection.directObjectGender),
      available: showDirectObjGender,
      hasValue:
        Boolean(selection.directObjectGender) &&
        selection.directObjectGender !== "masc",
      alwaysSet: true,
      directToggle: true,
      valueLabel: genderLabel(t, selection.directObjectGender),
    },
    {
      key: "directObjectDefiniteness",
      parent: "directObject",
      label: t("satellite.determiner"),
      labelKey: "satellite.determiner",
      icon: <ArticleOutlinedIcon sx={iconSx} />,
      // The alarm a cry raises (CRY_OUT + WOLF) is the shout itself, "Wolf!", with no determiner in any
      // language, so the engine drops the one the plan carries (see the translator's withAlarmCry) — it
      // is not user-changeable there, so it is withdrawn. It takes both words: a wolf seen, or a word
      // cried, takes its determiner as usual.
      available:
        directObjectRole === "noun" &&
        !(selection.verb?.alarmCry && selection.directObject?.alarm),
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
      label: t("satellite.relative"),
      icon: <AccountTreeIcon sx={iconSx} />,
      available: directObjectRole === "noun",
      hasValue: false,
    },
    {
      key: "directObjectPossessor",
      parent: "directObject",
      label: t("slot.possessor"),
      labelKey: "slot.possessor",
      icon: <KeyIcon sx={iconSx} />,
      available: directObjectRole === "noun",
      hasValue: Boolean(selection.directObjectPossessor?.subject) || Boolean(selection.directObjectPossessorRef),
    },
    {
      key: "directObjectConjunct",
      parent: "directObject",
      label: t("satellite.coordination"),
      icon: <CallSplitIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: conjunctCount("directObject") > 0,
      valueLabel: t(conjunctCount("directObject") > 0 ? "action.addAnotherConjunct" : "action.addConjunct"),
    },
    // The instrumental has no box on this canvas: its noun phrase lives in a period container
    // of its own, and this control on the verb-phrase dotted ring is the link to it (started,
    // and later cleared, in buildSatelliteIcons off the workspace binding — like the
    // relative-clause control, `hasValue` is a fact about the links, not the selection).
    {
      key: "instrumental",
      parent: "verb",
      label: t("slot.instrumental"),
      labelKey: "slot.instrumental",
      icon: complementIcons.instrumental,
      available: supportedComplements.includes("instrumental"),
      hasValue: false,
    },
    // Complement toggles live on the VERB box; number/gender hang off each complement.
    ...BOX_COMPLEMENT_TYPES.flatMap((type): RawSatellite[] => {
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
          // The complement's name in the UI language ("complemento di termine").
          label: t(labelKey),
          labelKey,
          icon: complementIcons[type],
          available: supportedComplements.includes(type),
          hasValue: Boolean(concept),
          valueLabel: label(concept),
        },
        {
          key: `${type}Adjective`,
          parent: type,
          label: t("category.adjective"),
          labelKey: "category.adjective",
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
          label: t("category.adjective"),
          labelKey: "category.adjective",
          icon: <BrushIcon sx={iconSx} />,
          available: concept?.role === "noun" && Boolean(adj),
          hasValue: Boolean(adj2),
          valueLabel: label(adj2),
        },
        {
          key: `${type}Adjective3`,
          parent: `${type}Adjective2`,
          label: t("category.adjective"),
          labelKey: "category.adjective",
          icon: <BrushIcon sx={iconSx} />,
          available: concept?.role === "noun" && Boolean(adj2),
          hasValue: Boolean(adj3),
          valueLabel: label(adj3),
        },
        {
          key: `${type}Number`,
          parent: type,
          label: t("satellite.number"),
          labelKey: "satellite.number",
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
          label: t("satellite.gender"),
          labelKey: "satellite.gender",
          icon: genderIcon(gen),
          // Gendered nouns, plus a 3rd-person pronoun (he/she) so a pronoun cause can
          // render feminine ("a causa di lei", "because of her").
          available:
            Boolean(concept?.gendered) ||
            (concept?.role === "pronoun" && concept?.person === "3"),
          hasValue: Boolean(gen) && gen !== "masc",
          alwaysSet: true,
          directToggle: true,
          valueLabel: genderLabel(t, gen),
        },
        {
          key: `${type}Definiteness`,
          parent: type,
          label: t("satellite.determiner"),
          labelKey: "satellite.determiner",
          icon: <ArticleOutlinedIcon sx={iconSx} />,
          // The predicative plus the adposition-bearing spatial/dative complements carry a
          // determiner, and only for a noun head (a pronoun cause takes none). Cause is not
          // in the set — it folds the quantifier into its connector. A *measure* manner adverbial
          // names a rate, not an identifiable thing, so the engine fixes it bare (see the
          // translator) — the determiner is not user-changeable there, so it is withdrawn.
          available:
            DETERMINER_COMPLEMENT_TYPES.includes(type) &&
            concept?.role === "noun" &&
            !(type === "manner" && concept?.mannerRelation === "measure"),
          hasValue: Boolean(
            def && def !== defaultDefiniteness(type),
          ),
          alwaysSet: true,
          valueLabel: t(`determiner.name.${def ?? defaultDefiniteness(type)}`),
        },
        {
          key: `${type}Relative`,
          parent: type,
          label: t("satellite.relative"),
          icon: <AccountTreeIcon sx={iconSx} />,
          available: concept?.role === "noun",
          hasValue: false,
        },
        {
          key: `${type}Possessor`,
          parent: type,
          label: t("slot.possessor"),
          labelKey: "slot.possessor",
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
          label: t("satellite.coordination"),
          icon: <CallSplitIcon sx={iconSx} />,
          // Only the adposition-free complement coordinates today — the predicative subject
          // complement ("seems happy or tired", "becomes a legend and an icon"). See
          // COORDINABLE_NOUN_KEYS for why the prepositional ones are held back.
          available: COORDINABLE_NOUN_KEYS.includes(type) && Boolean(concept),
          hasValue: conjunctCount(type) > 0,
          valueLabel: t(conjunctCount(type) > 0 ? "action.addAnotherConjunct" : "action.addConjunct"),
        },
      ];
    }),
  ];
}
