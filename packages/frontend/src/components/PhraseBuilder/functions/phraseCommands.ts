import type {
  CauseSentiment,
  Concept,
  Definiteness,
  ImperativeRegister,
  PathSpecifier,
} from "@signi/shared";
import type {
  GenderSlot,
  ImperativePerson,
  NounKey,
  NumberSlot,
  PhraseSelection,
  SlotKey,
} from "../interfaces.ts";
import {
  addConjunct,
  cycleAspect,
  cycleDegree,
  cycleModifierNumber,
  cycleModifierRelation,
  cycleNounConjunction,
  cycleTense,
  setDefiniteness,
  setImperativePerson,
  setImperativeRegister,
  setModifierAdjective,
  setSentiment,
  setSpecifier,
  toggleGender,
  toggleNegative,
  toggleNumber,
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
    handleToggleGender: (which: GenderSlot) => onPhraseUpdate((prev) => toggleGender(prev, which)),
    handleToggleNegative: () => onPhraseUpdate(toggleNegative),
    handleSetDefiniteness: (which: NounKey, value: Definiteness) =>
      onPhraseUpdate((prev) => setDefiniteness(prev, which, value)),
    handleCycleModifierRelation: (slotKey: SlotKey) => onPhraseUpdate((prev) => cycleModifierRelation(prev, slotKey)),
    handleCycleModifierNumber: (slotKey: SlotKey) => onPhraseUpdate((prev) => cycleModifierNumber(prev, slotKey)),
    handleSetModifierAdjective: (slotKey: SlotKey, concept: Concept | undefined) =>
      onPhraseUpdate((prev) => setModifierAdjective(prev, slotKey, concept)),
    handleCycleDegree: (slotKey: SlotKey) => onPhraseUpdate((prev) => cycleDegree(prev, slotKey)),
    handleCycleTense: () => onPhraseUpdate(cycleTense),
    handleCycleAspect: () => onPhraseUpdate(cycleAspect),
    handleSetImperativePerson: (person: ImperativePerson) =>
      onPhraseUpdate((prev) => setImperativePerson(prev, person)),
    handleSetImperativeRegister: (register: ImperativeRegister) =>
      onPhraseUpdate((prev) => setImperativeRegister(prev, register)),
    handleSelectSpecifier: (spec: PathSpecifier) => onPhraseUpdate((prev) => setSpecifier(prev, spec, "route")),
    handleSelectLocativeSpecifier: (spec: PathSpecifier) =>
      onPhraseUpdate((prev) => setSpecifier(prev, spec, "locative")),
    handleSelectSentiment: (sentiment: CauseSentiment) => onPhraseUpdate((prev) => setSentiment(prev, sentiment)),
  };
}
