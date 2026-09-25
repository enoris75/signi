import BrushIcon from "@mui/icons-material/Brush";
import NumbersIcon from "@mui/icons-material/Numbers";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import GavelIcon from "@mui/icons-material/Gavel";
import TuneIcon from "@mui/icons-material/Tune";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import TranslateIcon from "@mui/icons-material/Translate";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import KeyIcon from "@mui/icons-material/Key";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import AdjustIcon from "@mui/icons-material/Adjust";
import BalanceIcon from "@mui/icons-material/Balance";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import {
  DEFAULT_TEMPORAL_RELATION,
  DETERMINER_COMPLEMENT_TYPES,
  defaultDefiniteness,
  type Concept,
  type Definiteness,
  type LanguageCode,
} from "@signi/shared";
import { conceptWord, type UiStringLookup } from "../../../../i18n/conceptWord.ts";
import { NounKey, PhraseSelection, CONJUNCTS_KEY, QUESTION_ROLES, type QuestionRole, type SlotQuestionRole } from "../../interfaces.ts";
import { canAsk, canBeExistential, hasPatient, hasQuestionAnimacy, questionAnimateOf } from "../../functions/questionGates.ts";
import { standardIsSet, takesStandard } from "../../standardRing.ts";
import { takesExamples } from "../../examplesRing.ts";
import {
  BOX_COMPLEMENT_TYPES,
  COMPLEMENT_LABEL_KEYS,
  COORDINABLE_NOUN_KEYS,
  offeredComplements,
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
/** The catalogue's name for what a subject reads as (P13): the word class or the complement it becomes. */
const GLOSS_LABEL_KEY = {
  plain: "category.noun",
  dimension: "category.adjective",
  manner: "slot.manner",
  locative: "slot.locative",
  direction: "slot.direction",
  temporal: "slot.temporal",
} as const;

export function rawSatellites(
  selection: PhraseSelection,
  // The UI language: a satellite that carries a word (an adjective, a modal, a complement)
  // shows it as the picker offered it, not in English.
  language: LanguageCode,
  // The UI-string lookup, for the one label the lexicon cannot give on its own: a pronoun,
  // which shows the person it stands for rather than a word.
  t: UiStringLookup,
  // What the selection alone cannot tell. Whether the period's mood is locked by a conditional, a
  // coordination or a subordinate link it takes part in (see moodLocked), which a question mark that
  // would make it a question has to respect as the border's toggle does. And whether the period
  // governs a that-clause (P09-E12 D9), which is its verb's object: the object box is then
  // withdrawn, as the clause and a direct object exclude each other.
  // And, on an owner's hosted ring, whether the period that hosts it may ask *whose* there and does
  // (P09-E52, RingHost.question). And whether this is a hosted ring's builder (an owner, a conjunct, a
  // standard, examples), whose noun takes no standard and no examples of its own (P09-E50 D4, P09-E48 D2).
  {
    moodLocked = false,
    clauseObject = false,
    ownerQuestion,
    hosted = false,
    ownerHead = false,
  }: {
    moodLocked?: boolean;
    clauseObject?: boolean;
    ownerQuestion?: { available: boolean; asked: boolean };
    hosted?: boolean;
    // Whether this is an owner's ring (P11-E9): a pronoun there is a possessive, and of its persons
    // only the 3rd spells a gender (his / her / its), so the gender control is offered on it alone.
    ownerHead?: boolean;
  } = {},
): RawSatellite[] {
  const label = (c?: Concept) => conceptWord(c, language, t);
  // The wh-question's mark, on the dotted ring of each slot it can ask about (P09-E12 M6). It is
  // offered where the engine asks that gap (see canAsk), and — since marking a slot makes the period
  // a question — not where the mood is locked, unless the period is a question already.
  // A that-clause the period governs is its verb's object, so the object is no gap to ask about.
  const askable = (role: SlotQuestionRole) =>
    canAsk(selection, role) &&
    (!moodLocked || Boolean(selection.interrogative)) &&
    !(clauseObject && role === "directObject");
  const question = (role: SlotQuestionRole): RawSatellite => ({
    key: `${role}Question`,
    parent: role,
    label: t("mood.question"),
    labelKey: "mood.question",
    icon: <QuestionMarkIcon sx={iconSx} />,
    available: askable(role),
    hasValue: selection.questionRole === role,
    directToggle: true,
  });
  // Its who / what chip, on a marked subject or object, and on a marked complement whose question
  // word changes with the answer's animacy (P09-E53 D4, see hasQuestionAnimacy): what the question
  // asks for, a person or a thing, defaulting to the held word's (see questionAnimateOf). The chip
  // names the question it makes ("Who acts?"), so its label is its value.
  const questionAnimacy = (role: SlotQuestionRole): RawSatellite => {
    const who = questionAnimateOf(selection, role);
    return {
      key: `${role}QuestionAnimate`,
      parent: role,
      label: t(who ? "question.who" : "question.what"),
      labelKey: who ? "question.who" : "question.what",
      icon: who ? <PersonIcon sx={iconSx} /> : <CategoryIcon sx={iconSx} />,
      available: askable(role) && selection.questionRole === role && hasQuestionAnimacy(selection, role),
      hasValue: who,
      directToggle: true,
    };
  };
  // What a compared adjective is measured against — "bigger *than the dog*" (P09-E12 D5), and
  // off a noun's attributive adjective "a bigger cat *than the dog*" (P09-E50). A noun phrase of
  // its own, drawn as a hosted ring beside its noun's, whose line leaves from this control on the
  // noun's dotted ring. Offered where a degree takes it: the predicate adjective's on every degree
  // but the positive, a noun's while one of its adjectives compares. One held with nothing to
  // compare stays, its ring dimmed, and is reached from the ring. On a superlative predicate
  // adjective it is the set it picks from — "the biggest *of the dogs*" — and is named and drawn
  // so, a podium for the scales (P09-E51 D2).
  const standard = (type: NounKey): RawSatellite => ({
    key: `${type}Standard`,
    parent: type,
    ...(standardIsSet(selection, type)
      ? { label: t("slot.comparisonSet"), labelKey: "slot.comparisonSet" as const, icon: <LeaderboardIcon sx={iconSx} /> }
      : { label: t("slot.standard"), labelKey: "slot.standard" as const, icon: <BalanceIcon sx={iconSx} /> }),
    available: !hosted && takesStandard(selection, type),
    hasValue: Boolean((selection[`${type}Standard` as keyof PhraseSelection] as PhraseSelection | undefined)?.subject),
  });
  // The members of the set a noun names — "animals *such as the cat*" (P09-E48). A noun phrase of its
  // own, drawn as a hosted ring beside its noun's, whose line leaves from this control on the noun's
  // dotted ring and carries the relation's chip. Offered on a period noun with a noun head (D2).
  const examples = (type: NounKey): RawSatellite => ({
    key: `${type}Examples`,
    parent: type,
    label: t("slot.examples"),
    labelKey: "slot.examples",
    icon: <FormatListBulletedIcon sx={iconSx} />,
    available: !hosted && takesExamples(selection, type),
    hasValue: Boolean((selection[`${type}Examples` as keyof PhraseSelection] as PhraseSelection | undefined)?.subject),
  });
  // What a noun's genitive possessor is to it (P13): its owner, the whole it is part of, or the parts it
  // is made of. Each click moves it on; it rides beside the possessor control while there is one to
  // describe — a pronominal possessor ("its part") has no role, whether pointed to or named in the
  // owner's ring (P11-E9 D5): a role set earlier stays and comes back with a noun owner.
  const possessorRole = (which: NounKey): RawSatellite => {
    const owner = selection[`${which}Possessor` as keyof PhraseSelection] as PhraseSelection | undefined;
    const role = selection.possessorRoles?.[which];
    return {
      key: `${which}PossessorRole`,
      parent: which,
      label: t("modifier.relation"),
      labelKey: "modifier.relation",
      icon: <PieChartOutlineIcon sx={iconSx} />,
      available: owner?.subject?.role === "noun" && !selection[`${which}PossessorRef` as keyof PhraseSelection],
      hasValue: Boolean(role),
      valueLabel: t(role ? `possessorRole.value.${role}` : "slot.possessor"),
      directToggle: true,
    };
  };
  const subjectRole = selection.subject?.role;
  // A command and an infinitive citation are both moods occupying the finite slot: each forces
  // present tense / neutral aspect / no modals and drops the subject, so the tense, aspect and
  // modal controls are withdrawn under either (the subject family is dropped in resolveSatellites).
  const finiteSlotTaken = Boolean(selection.imperative || selection.infinitive);
  // How many phrases are coordinated with a noun block's own head ("Peter *and Paul*").
  const conjunctCount = (which: NounKey): number =>
    ((selection[CONJUNCTS_KEY(which)] as PhraseSelection[] | undefined) ?? []).length;
  // What the verb licenses, plus the adjuncts every verb offers (the temporal and the purpose).
  const supportedComplements = offeredComplements(selection.verb);
  // Whether the verb has a patient at all. Only a transitive or ditransitive one does, and only
  // those can be put in the passive (see `VerbPhrase.voice`).
  const passivizable =
    selection.verb?.transitivity === "transitive" || selection.verb?.transitivity === "ditransitive";

  const showSubjectNumber = Boolean(selection.subject);
  // A pronoun subject keeps it for every person, since a participle agrees with it ("tu sei stata");
  // an owner's pronoun is a possessive, which no language genders outside the 3rd person (P11-E9 D3).
  const showSubjectGender =
    (selection.subject?.role === "pronoun" && (!ownerHead || selection.subject.person === "3")) ||
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
    // Beside it, the chip that says the clause alone, its head unspoken (P13): shown only while the
    // noun heads a clause, and set from the binding, as the relative control is.
    {
      key: "subjectHeadless",
      parent: "subject",
      label: t("relative.headless"),
      labelKey: "relative.headless",
      icon: <VisibilityOffIcon sx={iconSx} />,
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
      // An owner asked about (P09-E52 D2) is a gap, and what it would own goes with it: none is offered.
      available: subjectRole === "noun" && !ownerQuestion?.asked,
      // Set by either a genitive possessor phrase or a pronominal reference to another noun.
      hasValue: Boolean(selection.subjectPossessor?.subject) || Boolean(selection.subjectPossessorRef),
    },
    possessorRole("subject"),
    standard("subject"),
    examples("subject"),
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
    question("subject"),
    questionAnimacy("subject"),
    // An owner's ring asks *whose* (P09-E52 D1): the mark on the owner's dotted ring, gated by the
    // period that hosts it, since this phrase has no verb to ask with. No who / what: *whose* is
    // always a person (D4).
    ...(ownerQuestion
      ? [{
        key: "possessorQuestion",
        parent: "subject" as const,
        label: t("mood.question"),
        labelKey: "mood.question" as const,
        icon: <QuestionMarkIcon sx={iconSx} />,
        available: ownerQuestion.available,
        hasValue: ownerQuestion.asked,
        directToggle: true,
      }]
      : []),
    // How the subject of a verbless period reads when it defines an adjective or an adverb (P13): each
    // click moves it on — a noun phrase, an adjective's dimension, a manner, a place, a direction, a
    // time. A period with a verb has no reading: its subject is the one who acts.
    {
      key: "subjectGloss",
      parent: "subject",
      label: t("gloss.name"),
      labelKey: "gloss.name",
      icon: <TranslateIcon sx={iconSx} />,
      available: subjectRole === "noun" && !selection.verb,
      hasValue: Boolean(selection.subjectGloss),
      valueLabel: t(GLOSS_LABEL_KEY[selection.subjectGloss ?? "plain"]),
      directToggle: true,
    },
    // The relation a time reading says it with, "until this time" (P13).
    {
      key: "subjectGlossRelation",
      parent: "subject",
      label: t("slot.temporal"),
      labelKey: "slot.temporal",
      icon: <EventRepeatIcon sx={iconSx} />,
      available: subjectRole === "noun" && !selection.verb && selection.subjectGloss === "temporal",
      hasValue: Boolean(selection.subjectGlossRelation),
      valueLabel: t(`temporal.value.${selection.subjectGlossRelation ?? DEFAULT_TEMPORAL_RELATION}` as const),
      directToggle: true,
    },
    {
      // The existential, "there is a cat" (P09-E12 M7): a fact about the subject, which it makes the
      // pivot, so it rides the subject's ring rather than the verb's full one. Offered where the engine
      // builds one (see canBeExistential); exclusive with the question mark, which shares its hour.
      key: "subjectExistential",
      parent: "subject",
      label: t("existential.toggle"),
      labelKey: "existential.toggle",
      icon: <ViewInArIcon sx={iconSx} />,
      available: canBeExistential(selection),
      hasValue: Boolean(selection.existential),
      directToggle: true,
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
      // the translator checks before it re-maps anything (see `resolveVoice`). Unlike the tense and
      // the aspect, the voice does not sit in the finite slot: an infinitive citation keeps it, and
      // the engine says the passive one ("to be loved"). Only a command forces the active, so only
      // the command withdraws the control (`setImperative` resets the voice to match).
      // An asked object is the patient too, although it is usually empty (P09-E54 D2, hasPatient).
      available: !selection.imperative && passivizable && hasPatient(selection),
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
    // Each modal's own polarity, on its own box — the same control the verb carries, denying the
    // word it is drawn on: "I do not want to not go" is this control on WILL and the verb's own on
    // GO. Revealed once its modal holds a word, and withdrawn with the modals under a command.
    {
      key: "verbModalNegative",
      parent: "verbModal",
      label: t("satellite.polarity"),
      icon: <RemoveCircleOutlineIcon sx={iconSx} />,
      available: !finiteSlotTaken && Boolean(selection.verbModal),
      hasValue: Boolean(selection.verbModalNegative),
      alwaysSet: true,
      directToggle: true,
      valueLabel: t(`polarity.value.${selection.verbModalNegative ? "negative" : "positive"}`),
    },
    {
      key: "verbModal2Negative",
      parent: "verbModal2",
      label: t("satellite.polarity"),
      icon: <RemoveCircleOutlineIcon sx={iconSx} />,
      available: !finiteSlotTaken && Boolean(selection.verbModal2),
      hasValue: Boolean(selection.verbModal2Negative),
      alwaysSet: true,
      directToggle: true,
      valueLabel: t(`polarity.value.${selection.verbModal2Negative ? "negative" : "positive"}`),
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
        selection.verb?.transitivity !== "intransitive" &&
        !clauseObject,
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
      key: "directObjectHeadless",
      parent: "directObject",
      label: t("relative.headless"),
      labelKey: "relative.headless",
      icon: <VisibilityOffIcon sx={iconSx} />,
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
    possessorRole("directObject"),
    standard("directObject"),
    examples("directObject"),
    {
      key: "directObjectConjunct",
      parent: "directObject",
      label: t("satellite.coordination"),
      icon: <CallSplitIcon sx={iconSx} />,
      available: Boolean(selection.directObject),
      hasValue: conjunctCount("directObject") > 0,
      valueLabel: t(conjunctCount("directObject") > 0 ? "action.addAnotherConjunct" : "action.addConjunct"),
    },
    question("directObject"),
    questionAnimacy("directObject"),
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
          // A complement asked about is shown although the gap holds no word: its ring carries the mark.
          ...(selection.questionRole === type && { defaultShown: true }),
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
          // The predicative plus the adposition-bearing complements, the cause among them, carry a
          // determiner, and only for a noun head (a pronoun cause takes none). A *measure* manner adverbial
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
          key: `${type}Headless`,
          parent: type,
          label: t("relative.headless"),
          labelKey: "relative.headless",
          icon: <VisibilityOffIcon sx={iconSx} />,
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
        possessorRole(type),
        {
          key: `${type}Conjunct`,
          parent: type,
          label: t("satellite.coordination"),
          icon: <CallSplitIcon sx={iconSx} />,
          // Every complement with a box coordinates — the adposition-free predicative ("becomes a
          // legend and an icon") and the prepositional ones alike ("in the house and the market").
          // The engines repeat each language's adposition per conjunct; see COORDINABLE_NOUN_KEYS.
          available: COORDINABLE_NOUN_KEYS.includes(type) && Boolean(concept),
          hasValue: conjunctCount(type) > 0,
          valueLabel: t(conjunctCount(type) > 0 ? "action.addAnotherConjunct" : "action.addConjunct"),
        },
        standard(type),
        examples(type),
        // The cause alone can be denied rather than named — "not because of the dog", the act
        // happened and this was not the reason. A toggle, like the verb's own polarity, and
        // independent of the sentiment beside it: a credit can be denied too.
        ...(type === "cause"
          ? [{
            key: "causeNegative" as const,
            parent: "cause" as const,
            label: t("satellite.polarity"),
            labelKey: "satellite.polarity" as const,
            icon: <RemoveCircleOutlineIcon sx={iconSx} />,
            available: Boolean(concept),
            hasValue: Boolean(selection.causeNegative),
            alwaysSet: true,
            directToggle: true,
            valueLabel: t(`polarity.value.${selection.causeNegative ? "negative" : "positive"}`),
          }]
          : []),
        // The wh-question's mark on every complement a question can ask about (P09-E12 M6, P09-E53),
        // and its who / what chip where the question word has the two.
        ...((QUESTION_ROLES as readonly string[]).includes(type)
          ? [question(type as SlotQuestionRole), questionAnimacy(type as SlotQuestionRole)]
          : []),
      ];
    }),
  ];
}
