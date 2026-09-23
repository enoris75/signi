import {
  coordConjunctionOptions,
  type PhraseSelection,
  type WorkspaceBinding,
} from "../../interfaces.ts";
import type { ClauseControls } from "../PeriodContainer.types.ts";

// Derive the conditional/coordinative/instrumental control bags from a workspace binding, keeping
// PeriodContainer ignorant of WorkspaceBinding itself. A standalone period has no binding and
// can't take part in a clause-level relation, so all come back undefined. `selection` is read
// for the mood rules below: a command can't also be a conditional's main clause, and the
// coordination it *can* start offers only the conjunctions that join two commands.
export function periodControls(
  binding: WorkspaceBinding | undefined,
  selection: PhraseSelection,
): Pick<ClauseControls, "conditional" | "coordinative" | "instrumental"> {
  if (!binding) return {};
  const { conditional, coordinative, instrumental } = binding;
  return {
    instrumental: {
      isInstrument: instrumental.hasTarget,
      hasInstrument: instrumental.hasSource,
      level: instrumental.level,
      onLevelChange: instrumental.onLevelChange,
      negative: instrumental.negative,
      onNegativeChange: instrumental.onNegativeChange,
      isPickTarget: instrumental.isPickTarget,
      onPick: instrumental.onPick,
    },
    conditional: {
      hasCondition: conditional.hasSource,
      isIfClause: conditional.hasTarget,
      isPickTarget: conditional.isPickTarget,
      pickActive: binding.pickActive,
      // An IF clause can't also be a main clause (conditionals don't chain), and a period already
      // in a coordination — or acting as a command or an infinitive citation — can't also start a
      // conditional (a citation is a leaf; a command is a mood incompatible with a conditional).
      canStart:
        !selection.imperative &&
        !selection.infinitive &&
        !conditional.hasTarget &&
        !coordinative.hasSource &&
        !coordinative.hasTarget,
      onStart: conditional.onStart,
      onClear: conditional.onClear,
      onPick: conditional.onPick,
      registerBorderAnchor: binding.geometry.registerBorderAnchor,
    },
    coordinative: {
      hasCoordination: coordinative.hasSource,
      isCoordinated: coordinative.hasTarget,
      conjunction: coordinative.conjunction,
      conjunctions: coordConjunctionOptions(Boolean(selection.imperative)),
      isPickTarget: coordinative.isPickTarget,
      pickActive: binding.pickActive,
      // A period can take part in only one clause-level relation at a time: not a second clause
      // already, and not tied into a conditional. A command may coordinate — with a second
      // command, which the workspace enforces when it picks the target. An infinitive citation is
      // a leaf and does not coordinate.
      canStart:
        !selection.infinitive &&
        !coordinative.hasTarget &&
        !conditional.hasSource &&
        !conditional.hasTarget,
      onStart: coordinative.onStart,
      onClear: coordinative.onClear,
      onPick: coordinative.onPick,
    },
  };
}
