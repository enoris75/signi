import type {
  CauseSentiment,
  Concept,
  Definiteness,
  ImperativeRegister,
  PathSpecifier,
  TemporalRelation,
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
  cycleAspect,
  cycleVoice,
  cycleDegree,
  cycleModifierNumber,
  cycleModifierRelation,
  cycleNounConjunction,
  cycleTense,
  removeStandard,
  setDefiniteness,
  setImperativePerson,
  setImperativeRegister,
  setModifierAdjective,
  setSentiment,
  setSpecifier,
  setTemporalRelation,
  toggleGender,
  toggleCauseNegative,
  toggleNegative,
  toggleNumber,
  toggleExistential,
  cycleGlossRelation,
  cycleSubjectGloss,
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
    // Take the predicate adjective's standard of comparison off, word and all (P09-E12 D5).
    handleRemoveStandard: () => onPhraseUpdate((prev) => removeStandard(prev, "predicative")),
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
    handleSelectSpecifier: (spec: PathSpecifier) => onPhraseUpdate((prev) => setSpecifier(prev, spec, "route")),
    handleSelectLocativeSpecifier: (spec: PathSpecifier) =>
      onPhraseUpdate((prev) => setSpecifier(prev, spec, "locative")),
    handleSelectTemporalRelation: (relation: TemporalRelation) =>
      onPhraseUpdate((prev) => setTemporalRelation(prev, relation)),
    handleSelectSentiment: (sentiment: CauseSentiment) => onPhraseUpdate((prev) => setSentiment(prev, sentiment)),
  };
}
