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

// Which addressee an imperative command targets. The subject is dropped from the surface, but
// the person/number still selects the imperative form (tu vs "let's" vs plural). Default 2sg.
export type ImperativePerson = "2sg" | "1pl" | "2pl";

export interface PhraseSelection {
    subject?: Concept;
    // When set, this period is an imperative (command). The subject box becomes the addressee
    // selector (see `imperativePerson`) and the subject is dropped by the engines; tense/aspect
    // are forced present/neutral and modals cleared (an imperative is a mood, mutually exclusive
    // with those and with a conditional / coordination — the UI enforces this).
    imperative?: boolean;
    // The addressee of an imperative command (default 2sg). Only meaningful when `imperative`.
    imperativePerson?: ImperativePerson;
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

// ── Word-category switch ─────────────────────────────────────────────────────
// Some slots accept a word from one of two lexical classes: the subject (and the causal
// complement) take a noun or a pronoun; the subject complement and every adjective slot
// take a noun or an adjective. The chosen class is shown in two synced places — a toggle
// *on the empty box*, and the category selector *inside the open word picker*. It only
// chooses which vocabulary is searched; the picked concept's own `role` is what downstream
// code reads. A single-vocabulary slot (verb, direct object, adverb, …) returns null.
export interface SlotCategory {
  value: string;
  label: string;
}

export function slotCategories(
  slotKey: SlotKey,
  // In noun-phrase (possessor) mode the `subject` slot is a plain noun head — no pronoun.
  nounSubject = false,
): { options: SlotCategory[]; fallback: string } | null {
  if (slotKey === "subject")
    return nounSubject
      ? null
      : {
          options: [
            { value: "noun", label: "Noun" },
            { value: "pronoun", label: "Pron" },
          ],
          fallback: "noun",
        };
  if (slotKey === "cause")
    return {
      options: [
        { value: "noun", label: "Noun" },
        { value: "pronoun", label: "Pron" },
      ],
      fallback: "noun",
    };
  if (slotKey === "predicative")
    return {
      options: [
        { value: "noun", label: "Noun" },
        { value: "adjective", label: "Adj" },
      ],
      fallback: "noun",
    };
  if (/Adjective\d?$/.test(slotKey))
    return {
      options: [
        { value: "adjective", label: "Adj" },
        { value: "noun", label: "Noun" },
      ],
      fallback: "adjective",
    };
  return null;
}

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
//
// The surface is wide, so it's split into four compartments: `geometry` (wiring DOM
// elements into the workspace's measurement registry — mirrors what useConnectors returns),
// `relative` (noun-level relative-clause links), and the two clause-level relations
// `conditional` and `coordinative`. `containerId` and `pickActive` are shared by all.

// How the workspace observes a container's geometry. Each register fn wires (or, with a null
// element, unregisters) a DOM node into the workspace's measurement registry; onGeometryChange
// asks the workspace to re-measure when internal state it can't see — an in-canvas drag — moves
// things. Mirrors the ref maps useConnectors hands back.
export interface WorkspaceGeometry {
  // A noun box, for cross-container measuring & greying.
  registerBox: (nounKey: NounAddress, el: HTMLElement | null) => void;
  // The little anchor dots a relative link line runs between: the relative-clause control on
  // the source noun's dotted box (line start) and the receiving dot on the target noun's
  // dotted box (line end). The workspace measures between these when present, else the boxes.
  registerSourceAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  registerTargetAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  // The border-control cluster: the endpoint the conditional/coordinative connector lines run
  // between (one anchor shared by both clause-level relations).
  registerBorderAnchor: (el: HTMLElement | null) => void;
  // Signal that this container's canvas geometry changed (a box was dragged, the canvas
  // resized, a group collapsed) so the workspace re-measures its link lines.
  onGeometryChange: () => void;
}

// Noun-level relative-clause linking for one container.
export interface RelativeBinding {
  // Nouns of this container that are a link source / a link target.
  sourceKeys: Set<NounAddress>;
  targetKeys: Set<NounAddress>;
  // Pick-mode: is this noun a legal link target right now? (drives highlight + click)
  isPickTarget: (nounKey: NounAddress) => boolean;
  onPick: (nounKey: NounAddress) => void;
  // Start / remove a relative-clause link sourced from this noun.
  onStartLink: (nounKey: NounAddress) => void;
  onRemoveLink: (nounKey: NounAddress) => void;
}

// Clause-level conditional (IF / MAIN) linking for one container.
export interface ConditionalBinding {
  // This container sources a conditional link (it is a main clause with an "if" clause).
  hasSource: boolean;
  // This container is the target of a conditional link (it is an "if" clause of some main clause).
  hasTarget: boolean;
  // During another container's conditional pick, is this container a legal "if" clause target?
  isPickTarget: boolean;
  // Start a conditional from this container (it becomes the main clause and awaits an "if"
  // pick); clear the one already sourced here; choose this container as a pending pick's "if".
  onStart: () => void;
  onClear: () => void;
  onPick: () => void;
}

// Clause-level coordinative (AND / OR / BUT / …) linking for one container. Mirrors
// ConditionalBinding, but a coordination carries the conjunction and onStart takes it.
export interface CoordinativeBinding {
  // This container sources a coordinative link (it is the first clause of a coordination).
  hasSource: boolean;
  // This container is the target of a coordinative link (it is the second clause).
  hasTarget: boolean;
  // The conjunction of the coordination this container takes part in, if any (for labelling).
  conjunction?: CoordConjunction;
  // During another container's coordinative pick, is this container a legal second-clause target?
  isPickTarget: boolean;
  // Start a coordination from this container with the chosen conjunction (it becomes the first
  // clause and awaits a second-clause pick); clear the one already sourced here; choose this
  // container as a pending pick's second clause.
  onStart: (conjunction: CoordConjunction) => void;
  onClear: () => void;
  onPick: () => void;
}

export interface WorkspaceBinding {
  containerId: string;
  // Any cross-container pick (relative / conditional / coordinative) is currently in progress.
  pickActive: boolean;
  geometry: WorkspaceGeometry;
  relative: RelativeBinding;
  conditional: ConditionalBinding;
  coordinative: CoordinativeBinding;
}

// Wrap a container's `binding` for an embedded possessor sub-builder whose head is
// addressed `headPath`. The sub-builder speaks in its own internal noun keys (its head is
// `"subject"`); this maps that head onto `headPath` before forwarding to the container, so
// the possessor head registers/links under its workspace address. A possessor head is only
// ever a link *source* (relativising it), never a target, so target/dimming is suppressed,
// and it is never a clause endpoint, so both clause compartments are inert.
export function adaptPossessorBinding(
  root: WorkspaceBinding,
  headPath: NounAddress,
): WorkspaceBinding {
  const map = (nounKey: NounAddress): NounAddress =>
    nounKey === "subject" ? headPath : nounKey;
  return {
    containerId: root.containerId,
    pickActive: root.pickActive,
    geometry: {
      registerBox: (nounKey, el) => root.geometry.registerBox(map(nounKey), el),
      registerSourceAnchor: (nounKey, el) =>
        root.geometry.registerSourceAnchor(map(nounKey), el),
      registerTargetAnchor: (nounKey, el) =>
        root.geometry.registerTargetAnchor(map(nounKey), el),
      // A possessor sub-builder is never a clause endpoint, so it anchors no clause connector.
      registerBorderAnchor: () => {},
      onGeometryChange: root.geometry.onGeometryChange,
    },
    relative: {
      sourceKeys: new Set(
        root.relative.sourceKeys.has(headPath) ? ["subject"] : [],
      ),
      targetKeys: new Set(),
      isPickTarget: () => false,
      onPick: (nounKey) => root.relative.onPick(map(nounKey)),
      onStartLink: (nounKey) => root.relative.onStartLink(map(nounKey)),
      onRemoveLink: (nounKey) => root.relative.onRemoveLink(map(nounKey)),
    },
    // Inert: a possessor sub-builder is never a conditional/coordinative endpoint.
    conditional: {
      hasSource: false,
      hasTarget: false,
      isPickTarget: false,
      onStart: () => {},
      onClear: () => {},
      onPick: () => {},
    },
    coordinative: {
      hasSource: false,
      hasTarget: false,
      conjunction: undefined,
      isPickTarget: false,
      onStart: () => {},
      onClear: () => {},
      onPick: () => {},
    },
  };
}
