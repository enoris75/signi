import type { AbstractionLevel } from "@signi/shared";
import type { SubordinatingConjunction } from "@signi/shared";
import type {
  COORD_CONJUNCTION_OPTIONS,
  CoordConjunction,
  SubordinateKind,
  SubordinateOption,
  SubordinateStanding,
} from "../interfaces.ts";

// The container-to-container conditional control state, threaded from the workspace binding.
// Undefined for a standalone (non-workspace) period, which can't take part in conditionals.
export interface ConditionalControl {
  // This period is a main clause — it already has an attached IF condition.
  hasCondition: boolean;
  // This period is itself the IF clause of some other (main) period.
  isIfClause: boolean;
  // A conditional pick is in progress and this period is a legal IF-clause target.
  isPickTarget: boolean;
  // Any pick (relative or conditional) is currently in progress.
  pickActive: boolean;
  // May this period start a conditional (false for an IF clause — conditionals don't chain).
  canStart: boolean;
  onStart: () => void;
  onClear: () => void;
  onPick: () => void;
  registerBorderAnchor: (el: HTMLElement | null) => void;
}

// The container-to-container coordinative control state, threaded from the workspace binding.
// Mirrors ConditionalControl, but starting a coordination first picks a conjunction (AND / OR /
// BUT / THAT IS / THEREFORE / THEN) from a menu, then a second-clause target. Undefined for a
// standalone (non-workspace) period, which can't take part in coordinations.
export interface CoordinativeControl {
  // This period is the first clause — it already coordinates a second clause.
  hasCoordination: boolean;
  // This period is itself the coordinated (second) clause of some other period.
  isCoordinated: boolean;
  // The conjunction of the coordination this period takes part in, if any (for labelling).
  conjunction?: CoordConjunction;
  // The conjunctions the menu offers here — the full six, or the four that can join two
  // commands when this period is one (see coordConjunctionOptions).
  conjunctions: typeof COORD_CONJUNCTION_OPTIONS;
  // A coordinative pick is in progress and this period is a legal second-clause target.
  isPickTarget: boolean;
  // Any pick (relative / conditional / coordinative) is currently in progress.
  pickActive: boolean;
  // May this period start a coordination (false for a period already tied into another relation).
  canStart: boolean;
  onStart: (conjunction: CoordConjunction) => void;
  onClear: () => void;
  onPick: () => void;
}

// The subordinate-clause control state (P09-E12 D9), threaded from the workspace binding. Mirrors
// CoordinativeControl: starting one first picks what kind of clause from a menu (*that*, *to*, or a
// subordinating conjunction), then the period that is to be it. Undefined for a standalone period.
export interface SubordinateControl {
  // The subordinate clause this period governs, if any: its kind, and an adverbial one's conjunction.
  asSource?: SubordinateStanding;
  // The one this period is, if any.
  asTarget?: SubordinateStanding;
  // What the menu offers here, by the verb (see subordinateOptions). Empty without a verb.
  options: SubordinateOption[];
  // A subordinate pick is in progress and this period is a legal target.
  isPickTarget: boolean;
  // Any pick is currently in progress.
  pickActive: boolean;
  // May this period govern a subordinate clause (see canStartSubordinate).
  canStart: boolean;
  onStart: (kind: SubordinateKind, conjunction?: SubordinatingConjunction, question?: boolean) => void;
  onClear: () => void;
  onPick: () => void;
  // Whose this infinitive period is, where it can be the governing clause's object's (P13).
  objectControl?: { object: boolean; onChange: (object: boolean) => void };
}

// The instrumental control state, threaded from the workspace binding. Unlike the two clause-level
// relations this period has no *border* control for it: the link is started from the verb-phrase
// dotted ring of the clause that acts (inside the canvas), so all a period needs here is the target
// side — light up as droppable during a pick, take the click, and caption itself once linked.
export interface InstrumentalControl {
  // This period *is* the instrument phrase of some other period.
  isInstrument: boolean;
  // This period's clause acts with an instrument (it sources the link) — for the border gutter.
  hasInstrument: boolean;
  // How far the instrument is reified (process / concept / object) and its setter. Shown as a
  // three-way switch on the instrument period's header: it decides both what that period holds
  // (a noun, or a verb and its object) and how the engines render it.
  level: AbstractionLevel;
  onLevelChange: (level: AbstractionLevel) => void;
  // Whether the instrument is denied — the privative, "without the knife" (P09-E2) — and its
  // setter. Shown as a polarity toggle beside the level switch, as the cause's sits beside its stance.
  negative: boolean;
  onNegativeChange: (negative: boolean) => void;
  // An instrumental pick is in progress and this period is a legal instrument target.
  isPickTarget: boolean;
  onPick: () => void;
}

// A mood toggle on the card border: the imperative (command), the infinitive (citation) or the
// question. Every period, standalone or not, can take any. The three are mutually exclusive —
// toggling one clears the others (the question because the engine drops it under either). Both are disabled while the period takes
// part in a conditional (a mood incompatible with one) or in a coordination, whose two clauses
// share one mood: flipping it on one clause alone would break the pair, so the relation has to be
// cleared first.
export interface MoodControl {
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export type Mood = "imperative" | "infinitive" | "question";

// The cross-container relations a period card can light up for as a pick target.
export type Relation = "conditional" | "coordinative" | "subordinate" | "instrumental";

// Every clause-level control a period card can carry.
export interface ClauseControls {
  // Conditional (IF/MAIN) connector control on the card border. Absent for a standalone period.
  conditional?: ConditionalControl;
  // Coordinative (AND/OR/BUT/…) connector control on the card border. Absent for a standalone period.
  coordinative?: CoordinativeControl;
  // Subordinate-clause (that / to / when / …) connector control on the card border. Absent for a
  // standalone period.
  subordinate?: SubordinateControl;
  // Instrumental link state — target side only (the control that starts it lives on the verb
  // phrase's dotted ring). Absent for a standalone period.
  instrumental?: InstrumentalControl;
  // Imperative (command) toggle on the card border. Present for every period.
  imperative?: MoodControl;
  // Infinitive (citation) toggle on the card border, a sibling of the imperative one. Present for
  // every period.
  infinitive?: MoodControl;
  // Question toggle on the card border, the third mood (P09-E12 M5). Present for every period.
  question?: MoodControl;
}

// The palette colour each relation and mood marks the card and its border control with. The six
// semantic colours are all taken — the subordinate clause has the last of them, error.main, which its
// connector is drawn in — so the question wears the ink, text.primary: no hue of its own, and none
// the others could be mistaken for (P09-E12).
export const ACCENT: Record<Relation | Mood, string> = {
  conditional: "warning.main",
  coordinative: "info.main",
  subordinate: "error.main",
  instrumental: "secondary.main",
  imperative: "success.main",
  infinitive: "primary.main",
  question: "text.primary",
};
