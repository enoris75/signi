import type {
  CauseSentiment,
  Concept,
  Definiteness,
  ImperativeRegister,
  PathSpecifier,
  TemporalRelation,
  ObjectPredication,
} from "@signi/shared";
import type {
  GenderSlot,
  ImperativePerson,
  NounKey,
  NumberSlot,
  PhraseSelection,
  QuestionRole,
  SlotKey,
} from "../interfaces.ts";
import {
  addConjunct,
  applyClear,
  cycleAspect,
  cycleVoice,
  cycleDegree,
  cycleModifierNumber,
  cycleModifierRelation,
  cycleNounConjunction,
  cycleTense,
  removeStandard,
  removeExamples,
  toggleExampleRelation,
  setDefiniteness,
  setImperativePerson,
  setImperativeRegister,
  setModifierAdjective,
  setSentiment,
  setSpecifier,
  setTemporalRelation,
  setPredication,
  setNumeral,
  setContrastive,
  setApproximated,
  toggleGender,
  toggleCauseNegative,
  toggleNegative,
  toggleNumber,
  toggleExistential,
  cycleGlossRelation,
  cycleSubjectGloss,
  cyclePossessorRole,
  toggleQuestionAnimate,
  toggleQuestionRole,
  type CycleStep,
  type NegativeField,
} from "../phraseReducers.ts";

type PhraseUpdate = (updater: (prev: PhraseSelection) => PhraseSelection) => void;

/**
 * Each grammatical control on the canvas is a pure selection transform (phraseReducers); these bind
 * them to one builder's slice, handing each edit up through `onPhraseUpdate`.
 */
export function phraseCommands(onPhraseUpdate: PhraseUpdate) {
  return {
    // Coordinate one more phrase with a noun block's head ("Peter *and Paul*"). Unlike the
    // possessor, this is not a reveal but an append: each click adds one more ring to the group.
    handleAddConjunct: (which: NounKey) => onPhraseUpdate((prev) => addConjunct(prev, which)),
    handleCycleConjunction: (which: NounKey) => onPhraseUpdate((prev) => cycleNounConjunction(prev, which)),
    handleToggleNumber: (which: NumberSlot) => onPhraseUpdate((prev) => toggleNumber(prev, which)),
    // The cycling controls take a direction: +1 for a click, −1 for the keyboard's ⇧ (see keymap).
    handleToggleGender: (which: GenderSlot, step: CycleStep = 1) =>
      onPhraseUpdate((prev) => toggleGender(prev, which, step)),
    handleToggleNegative: (field: NegativeField = "verbNegative") =>
      onPhraseUpdate((sel) => toggleNegative(sel, field)),
    handleToggleCauseNegative: () => onPhraseUpdate(toggleCauseNegative),
    handleSetDefiniteness: (which: NounKey, value: Definiteness) =>
      onPhraseUpdate((prev) => setDefiniteness(prev, which, value)),
    handleCycleModifierRelation: (slotKey: SlotKey, step: CycleStep = 1) =>
      onPhraseUpdate((prev) => cycleModifierRelation(prev, slotKey, step)),
    handleCycleModifierNumber: (slotKey: SlotKey) => onPhraseUpdate((prev) => cycleModifierNumber(prev, slotKey)),
    handleSetModifierAdjective: (slotKey: SlotKey, concept: Concept | undefined) =>
      onPhraseUpdate((prev) => setModifierAdjective(prev, slotKey, concept)),
    handleCycleDegree: (slotKey: SlotKey, step: CycleStep = 1) =>
      onPhraseUpdate((prev) => cycleDegree(prev, slotKey, step)),
    // Take a noun's standard of comparison off, word and all: the predicate adjective's (P09-E12 D5)
    // or a period noun's (P09-E50).
    handleRemoveStandard: (which: NounKey) => onPhraseUpdate((prev) => removeStandard(prev, which)),
    // Take a noun's examples off, and flip their relation such as ⇄ including (P09-E48).
    handleRemoveExamples: (which: NounKey) => onPhraseUpdate((prev) => removeExamples(prev, which)),
    handleToggleExampleRelation: (which: NounKey) => onPhraseUpdate((prev) => toggleExampleRelation(prev, which)),
    handleCycleTense: (step: CycleStep = 1) => onPhraseUpdate((prev) => cycleTense(prev, step)),
    handleCycleAspect: (step: CycleStep = 1) => onPhraseUpdate((prev) => cycleAspect(prev, step)),
    handleCycleVoice: (step: CycleStep = 1) => onPhraseUpdate((prev) => cycleVoice(prev, step)),
    handleSetImperativePerson: (person: ImperativePerson) =>
      onPhraseUpdate((prev) => setImperativePerson(prev, person)),
    handleSetImperativeRegister: (register: ImperativeRegister) =>
      onPhraseUpdate((prev) => setImperativeRegister(prev, register)),
    // The question's mark on a slot's ring, its who / what chip, and the subject's existential
    // (P09-E12 M6, M7).
    handleToggleQuestion: (which: QuestionRole) => onPhraseUpdate((prev) => toggleQuestionRole(prev, which)),
    handleToggleQuestionAnimate: () => onPhraseUpdate(toggleQuestionAnimate),
    handleToggleExistential: () => onPhraseUpdate(toggleExistential),
    // How a verbless period's subject reads, and a time reading's relation (P13).
    handleCycleGloss: (step: CycleStep = 1) => onPhraseUpdate((prev) => cycleSubjectGloss(prev, step)),
    handleCycleGlossRelation: (step: CycleStep = 1) => onPhraseUpdate((prev) => cycleGlossRelation(prev, step)),
    // What a noun's genitive possessor is to it: owner → whole → parts (P13).
    handleCyclePossessorRole: (which: NounKey, step: CycleStep = 1) =>
      onPhraseUpdate((prev) => cyclePossessorRole(prev, which, step)),
    handleSelectSpecifier: (spec: PathSpecifier) => onPhraseUpdate((prev) => setSpecifier(prev, spec, "route")),
    handleSelectLocativeSpecifier: (spec: PathSpecifier) =>
      onPhraseUpdate((prev) => setSpecifier(prev, spec, "locative")),
    handleSelectTemporalRelation: (relation: TemporalRelation) =>
      onPhraseUpdate((prev) => setTemporalRelation(prev, relation)),
    // A demonstrative pointing away from the rest (P13).
    handleSetContrastive: (which: NounKey, contrastive: boolean) =>
      onPhraseUpdate((prev) => setContrastive(prev, which, contrastive)),
    // A cardinal numeral counting a noun (P13), or none.
    handleSetNumeral: (which: NounKey, numeral: number | undefined) =>
      onPhraseUpdate((prev) => setNumeral(prev, which, numeral)),
    handleSetApproximated: (which: NounKey, on: boolean) =>
      onPhraseUpdate((prev) => setApproximated(prev, which, on)),
    // The direction's relation (P13): its plain goal, or a path.
    handleSelectDirectionSpecifier: (spec: PathSpecifier | "to") =>
      onPhraseUpdate((prev) => setSpecifier(prev, spec === "to" ? undefined : spec, "direction")),
    // What the object complement says of the object (P13).
    handleSelectPredication: (predication: ObjectPredication) =>
      onPhraseUpdate((prev) => setPredication(prev, predication)),
    handleSelectSentiment: (sentiment: CauseSentiment) => onPhraseUpdate((prev) => setSentiment(prev, sentiment)),
    // The interjection's border toggle, taking its box away (P09-E47): the word goes with it.
    handleRemoveInterjection: () => onPhraseUpdate((prev) => applyClear(prev, "interjection")),
    // The vocative's border toggle, taking its box away (P11-E8): its words go with it.
    handleRemoveVocative: () => onPhraseUpdate((prev) => applyClear(prev, "vocative")),
  };
}
