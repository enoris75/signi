import type { Aspect, CauseSentiment, Concept, ComplementType, CoordConjunction, Definiteness, Degree, GrammaticalRole, ModifierRelation, PathSpecifier, Tense } from "@signi/shared";

export type { CoordConjunction };

// UI metadata for the coordinating conjunctions offered on the coordinative control: the
// short menu label and the traditional grammatical name of each relation.
export const COORD_CONJUNCTION_OPTIONS: {
  value: CoordConjunction;
  label: string;
  hint: string;
}[] = [
  { value: "and", label: "And", hint: "copulative" },
  { value: "or", label: "Or", hint: "disjunctive" },
  { value: "but", label: "But", hint: "adversative" },
  { value: "that_is", label: "That is", hint: "explicative" },
  { value: "then", label: "Then", hint: "conclusive" },
];

export const COORD_CONJUNCTION_LABEL: Record<CoordConjunction, string> =
  Object.fromEntries(
    COORD_CONJUNCTION_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<CoordConjunction, string>;


export interface SlotConfig {
    key: "subject" |
    "verb" |
    "verbModal" |
    "verbModal2" |
    "directObject" |
    "indirectObject" |
    "modifier" |
    "subjectAdjective" |
    "subjectAdjective2" |
    "subjectAdjective3" |
    "directObjectAdjective" |
    "directObjectAdjective2" |
    "directObjectAdjective3" |
    "indirectObjectAdjective" |
    "indirectObjectAdjective2" |
    "indirectObjectAdjective3" |
    ComplementType |
    `${ComplementType}Adjective` |
    `${ComplementType}Adjective2` |
    `${ComplementType}Adjective3`;
    label: string;
    required: boolean;
    roles: GrammaticalRole[];
    color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
}

export interface PhraseSelection {
    subject?: Concept;
    verb?: Concept;
    verbNegative?: boolean;
    verbTense?: Tense;
    // Grammatical aspect (neutral / progressive / prospective / resultative), orthogonal to
    // tense. Defaults to 'neutral' when absent.
    verbAspect?: Aspect;
    // Modal verbs governing the predicate, outermost first: `verbModal` governs `verbModal2`,
    // which governs the verb — "voglio poter andare". Like the adjectives they chain, each
    // revealed from a control on the previous one's box, so `verbModal2` only exists once
    // `verbModal` holds a word. Both hold modal verb concepts (`Concept.modal`).
    verbModal?: Concept;
    verbModal2?: Concept;
    directObject?: Concept;
    indirectObject?: Concept;
    modifier?: Concept;
    // Each noun block chains up to three adjectives; each one is revealed from a control
    // on the previous adjective's box, so `Adjective2` only exists once `Adjective` is set.
    subjectAdjective?: Concept;
    subjectAdjective2?: Concept;
    subjectAdjective3?: Concept;
    subjectNumber?: "singular" | "plural";
    subjectGender?: "masc" | "fem" | "neut";
    // Determiner (the / a / bare) for the subject and direct-object noun phrases.
    subjectDefiniteness?: Definiteness;
    directObjectDefiniteness?: Definiteness;
    directObjectNumber?: "singular" | "plural";
    directObjectGender?: "masc" | "fem" | "neut";
    directObjectAdjective?: Concept;
    directObjectAdjective2?: Concept;
    directObjectAdjective3?: Concept;
    indirectObjectNumber?: "singular" | "plural";
    indirectObjectGender?: "masc" | "fem" | "neut";
    indirectObjectAdjective?: Concept;
    indirectObjectAdjective2?: Concept;
    indirectObjectAdjective3?: Concept;
    // Subject complement (predicative) of a copular verb (become/seem/appear). Its head
    // may be a predicate noun ("becomes a legend") or a predicate adjective ("seems
    // happy"); number/gender apply only to a noun head (an adjective head agrees with the
    // subject in the engine).
    predicative?: Concept;
    predicativeNumber?: "singular" | "plural";
    predicativeGender?: "masc" | "fem" | "neut";
    // Determiner for a predicate-noun subject complement ("becomes a legend"). The
    // predicative is the one complement that takes no adposition, so — like subject and
    // direct object — it can honor the determiner; the adposition-bearing complements
    // stay definite. Only meaningful for a noun head (an adjective head takes none).
    predicativeDefiniteness?: Definiteness;
    predicativeAdjective?: Concept;
    predicativeAdjective2?: Concept;
    predicativeAdjective3?: Concept;
    // Motion/locative complements — each an independent noun phrase, with its
    // own chained adjectives (up to three, matching subjects/objects).
    locative?: Concept;
    locativeNumber?: "singular" | "plural";
    locativeGender?: "masc" | "fem" | "neut";
    locativeAdjective?: Concept;
    locativeAdjective2?: Concept;
    locativeAdjective3?: Concept;
    direction?: Concept;
    directionNumber?: "singular" | "plural";
    directionGender?: "masc" | "fem" | "neut";
    directionAdjective?: Concept;
    directionAdjective2?: Concept;
    directionAdjective3?: Concept;
    source?: Concept;
    sourceNumber?: "singular" | "plural";
    sourceGender?: "masc" | "fem" | "neut";
    sourceAdjective?: Concept;
    sourceAdjective2?: Concept;
    sourceAdjective3?: Concept;
    route?: Concept;
    routeNumber?: "singular" | "plural";
    routeGender?: "masc" | "fem" | "neut";
    routeAdjective?: Concept;
    routeAdjective2?: Concept;
    routeAdjective3?: Concept;
    // The path relation (through / under / over / …) for the route complement.
    routeSpecifier?: PathSpecifier;
    // Cause / reason adjunct ("cried because of the dog"). Its one specifier is the
    // affective sentiment — neutral (because of) / negative (fault of) / positive (thanks to),
    // selected on the cause dotted box. Defaults to 'neutral' when absent.
    cause?: Concept;
    causeNumber?: "singular" | "plural";
    causeGender?: "masc" | "fem" | "neut";
    causeAdjective?: Concept;
    causeAdjective2?: Concept;
    causeAdjective3?: Concept;
    causeSentiment?: CauseSentiment;
    // Terminus / dative adjunct ("cut the hair *to the cat*") — the recipient or goal, "to
    // whom / to what". Renders with each language's indirect-object dative; carries no
    // specifier.
    terminus?: Concept;
    terminusNumber?: "singular" | "plural";
    terminusGender?: "masc" | "fem" | "neut";
    terminusAdjective?: Concept;
    terminusAdjective2?: Concept;
    terminusAdjective3?: Concept;
    // Semantic relation for any adjective slot whose picked concept is a *noun* used
    // attributively ("sail boat"). Keyed by the adjective slot key (e.g. "subjectAdjective").
    // Only consulted when that slot holds a noun; adjective concepts ignore it. Defaults
    // to 'feature'. See NounModifier / ModifierRelation in @signi/shared.
    modifierRelations?: Partial<Record<string, ModifierRelation>>;
    // Comparative degree for any adjective slot whose picked concept is a real *adjective*
    // ("more beautiful"). Keyed by the adjective slot key, mirroring `modifierRelations`
    // (the two are mutually exclusive — a slot holds either an adjective or a noun-modifier).
    // Only consulted when that slot holds an adjective; defaults to 'positive'. See Degree.
    adjectiveDegrees?: Partial<Record<string, Degree>>;
    // Relative clauses are no longer stored inside a selection: a noun's relative clause
    // is a *separate* phrase container linked to it (see PhraseLink / PhraseWorkspace).
    // Optional possessor per noun block ("the *cat's* book"). Each is a PhraseSelection
    // whose `subject` slot holds the possessing noun (so its number/gender/adjectives and
    // its own nested possessor all reuse the `subject*` fields); built via buildNounPhrase.
    subjectPossessor?: PhraseSelection;
    directObjectPossessor?: PhraseSelection;
    indirectObjectPossessor?: PhraseSelection;
    predicativePossessor?: PhraseSelection;
    locativePossessor?: PhraseSelection;
    directionPossessor?: PhraseSelection;
    sourcePossessor?: PhraseSelection;
    routePossessor?: PhraseSelection;
    causePossessor?: PhraseSelection;
    terminusPossessor?: PhraseSelection;
}

// Extra grammatical settings a picker can commit alongside a concept. The pronoun
// chooser uses this to place its number/gender decision in one shot (a plain noun
// pick omits it and lets applyConceptSelect seed the defaults).
export interface ConceptSelectOpts {
  number?: "singular" | "plural";
  gender?: "masc" | "fem" | "neut";
}

export type NumberSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

export type GenderSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

// The noun blocks that can carry a relative clause / possessor (same set as NumberSlot).
export type NounKey = "subject" | "directObject" | "indirectObject" | ComplementType;

// The address of a noun anywhere in a container's phrase tree, used as a cross-container
// link endpoint. A top-level noun is just its `NounKey`; a possessor head is that address
// followed by a `/possessor` step (e.g. `directObject/possessor`, or, for a
// possessor-of-a-possessor, `directObject/possessor/possessor`). Only *sources* use the
// suffix today (relativising a possessor head); targets are always plain `NounKey`.
export type NounAddress = string;

// Append a `/possessor` step to a noun address — the address of that noun's possessor head.
export const possessorAddress = (base: NounAddress): NounAddress => `${base}/possessor`;

export const POSSESSOR_KEY = (which: NounKey) =>
  `${which}Possessor` as keyof PhraseSelection;

export type SlotKey = SlotConfig["key"];

// ── Multi-container workspace ────────────────────────────────────────────────
// The builder now edits a *stack* of independent phrase containers. A relative clause
// is expressed as a cross-container link: a noun in one container (the source/head) is
// linked to a noun in another container (the target/relativized "gap"), which is greyed
// out and consumed as that head's relative clause when the sentence is serialized.

// One phrase container: a stable id plus a full clause selection.
export interface PhraseContainer {
  id: string;
  selection: PhraseSelection;
}

// A cross-container link between two containers. Two kinds share one array (so they share the
// forest/cycle machinery and both mark their target container non-root):
//  - `relative` (default): a source noun (the head) → target noun (the gap) — a relative clause.
//    The source may be a possessor head (a `/possessor` address); the target is a plain noun.
//  - `conditional`: a container → container hypothetical link. The *source* is the main clause
//    (its border control was clicked), the *target* is the "if" clause. No noun endpoints.
export type PhraseLink =
  | {
      id: string;
      kind?: 'relative';
      source: { containerId: string; nounKey: NounAddress };
      target: { containerId: string; nounKey: NounKey };
    }
  | {
      id: string;
      kind: 'conditional';
      source: { containerId: string };
      target: { containerId: string };
    }
  | {
      id: string;
      kind: 'coordinative';
      // The coordinating conjunction joining the two clauses (source = first, target = second).
      conjunction: CoordConjunction;
      source: { containerId: string };
      target: { containerId: string };
    };

/** Narrow a link to the relative kind (the default). */
export const isRelativeLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind?: 'relative' }> =>
  l.kind !== 'conditional' && l.kind !== 'coordinative';

/** Narrow a link to the conditional kind. */
export const isConditionalLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'conditional' }> => l.kind === 'conditional';

/** Narrow a link to the coordinative kind. */
export const isCoordinativeLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'coordinative' }> => l.kind === 'coordinative';

// Pick-mode: awaiting a target click. A `relative` pick started from a source noun's satellite
// and lands on a target noun; a `conditional` pick started from a container's border control
// and lands on another container (which becomes the "if" clause).
export type PickMode =
  | { active: false }
  | { active: true; kind: 'relative'; source: { containerId: string; nounKey: NounAddress } }
  | { active: true; kind: 'conditional'; source: { containerId: string } }
  | { active: true; kind: 'coordinative'; conjunction: CoordConjunction; source: { containerId: string } };

// The workspace-provided hooks a PhraseBuilder needs to take part in cross-container
// linking. Undefined for embedded (possessor) sub-builders, which never link.
export interface WorkspaceBinding {
  containerId: string;
  // Register/unregister a noun box's DOM element for cross-container measuring & greying.
  registerBox: (nounKey: NounAddress, el: HTMLElement | null) => void;
  // Register the little anchor dots the cross-container link line runs between: the
  // relative-clause control on the source noun's dotted box (line start) and the
  // receiving dot on the target noun's dotted box (line end). The workspace measures
  // the connector between these when present, falling back to the noun boxes.
  registerLinkSourceAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  registerLinkTargetAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  // Signal that this container's canvas geometry changed (a box was dragged, the
  // canvas resized, a group collapsed) so the workspace re-measures its link lines —
  // the workspace can't otherwise observe a child's internal drag state.
  onGeometryChange: () => void;
  // Pick-mode: is this noun a legal link target right now? (drives highlight + click)
  isPickTarget: (nounKey: NounAddress) => boolean;
  onNounPick: (nounKey: NounAddress) => void;
  // Start / remove a relative-clause link sourced from this noun.
  onStartRelativeLink: (nounKey: NounAddress) => void;
  onRemoveLink: (nounKey: NounAddress) => void;
  // Nouns of this container that are a link source / a link target.
  linkSourceKeys: Set<NounAddress>;
  linkTargetKeys: Set<NounAddress>;
  pickActive: boolean;

  // ── Conditional (container-to-container) connector ───────────────────────────
  // Start a conditional link from this container (it becomes the main clause and awaits an
  // "if" clause pick); clear the one already sourced here.
  onStartConditional: () => void;
  onClearConditional: () => void;
  // During another container's conditional pick, is this container a legal "if" clause target?
  isConditionalPickTarget: boolean;
  // Choose this container as the pending pick's "if" clause (valid only when isConditionalPickTarget).
  onConditionalPick: () => void;
  // This container already sources a conditional link (it is a main clause with an "if" clause).
  hasConditionalSource: boolean;
  // This container is the target of a conditional link (it is an "if" clause of some main clause).
  hasConditionalTarget: boolean;
  // Register this container's border-control element, the endpoint the conditional/coordinative
  // connector line runs between.
  registerBorderAnchor: (el: HTMLElement | null) => void;

  // ── Coordinative (container-to-container) connector ──────────────────────────
  // Start a coordination from this container with the chosen conjunction (it becomes the first
  // clause and awaits a second-clause pick); clear the one already sourced here.
  onStartCoordinative: (conjunction: CoordConjunction) => void;
  onClearCoordinative: () => void;
  // During another container's coordinative pick, is this container a legal second-clause target?
  isCoordinativePickTarget: boolean;
  // Choose this container as the pending pick's second clause (valid only when isCoordinativePickTarget).
  onCoordinativePick: () => void;
  // This container already sources a coordinative link (it is the first clause of a coordination).
  hasCoordinativeSource: boolean;
  // This container is the target of a coordinative link (it is the second clause).
  hasCoordinativeTarget: boolean;
  // The conjunction of the coordination this container takes part in, if any (for labelling).
  coordinativeConjunction?: CoordConjunction;
}

// Wrap a container's `binding` for an embedded possessor sub-builder whose head is
// addressed `headPath`. The sub-builder speaks in its own internal noun keys (its head is
// `"subject"`); this maps that head onto `headPath` before forwarding to the container, so
// the possessor head registers/links under its workspace address. A possessor head is only
// ever a link *source* (relativising it), never a target, so target/dimming is suppressed.
export function adaptPossessorBinding(
  root: WorkspaceBinding,
  headPath: NounAddress,
): WorkspaceBinding {
  const map = (nounKey: NounAddress): NounAddress =>
    nounKey === "subject" ? headPath : nounKey;
  return {
    containerId: root.containerId,
    registerBox: (nounKey, el) => root.registerBox(map(nounKey), el),
    registerLinkSourceAnchor: (nounKey, el) =>
      root.registerLinkSourceAnchor(map(nounKey), el),
    registerLinkTargetAnchor: (nounKey, el) =>
      root.registerLinkTargetAnchor(map(nounKey), el),
    onGeometryChange: root.onGeometryChange,
    isPickTarget: () => false,
    onNounPick: (nounKey) => root.onNounPick(map(nounKey)),
    onStartRelativeLink: (nounKey) => root.onStartRelativeLink(map(nounKey)),
    onRemoveLink: (nounKey) => root.onRemoveLink(map(nounKey)),
    linkSourceKeys: new Set(root.linkSourceKeys.has(headPath) ? ["subject"] : []),
    linkTargetKeys: new Set(),
    pickActive: root.pickActive,
    // A possessor sub-builder is never a conditional/coordinative endpoint — inert pass-through.
    onStartConditional: () => {},
    onClearConditional: () => {},
    isConditionalPickTarget: false,
    onConditionalPick: () => {},
    hasConditionalSource: false,
    hasConditionalTarget: false,
    registerBorderAnchor: () => {},
    onStartCoordinative: () => {},
    onClearCoordinative: () => {},
    isCoordinativePickTarget: false,
    onCoordinativePick: () => {},
    hasCoordinativeSource: false,
    hasCoordinativeTarget: false,
    coordinativeConjunction: undefined,
  };
}
