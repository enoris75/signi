import type { CauseSentiment, Concept, ComplementType, Definiteness, Degree, GrammaticalRole, ModifierRelation, PathSpecifier, Tense } from "@signi/shared";


export interface SlotConfig {
    key: "subject" |
    "verb" |
    "directObject" |
    "indirectObject" |
    "modifier" |
    "subjectAdjective" |
    "subjectAdjective2" |
    "directObjectAdjective" |
    "directObjectAdjective2" |
    "indirectObjectAdjective" |
    "indirectObjectAdjective2" |
    ComplementType |
    `${ComplementType}Adjective` |
    `${ComplementType}Adjective2`;
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
    directObject?: Concept;
    indirectObject?: Concept;
    modifier?: Concept;
    subjectAdjective?: Concept;
    subjectAdjective2?: Concept;
    subjectNumber?: "singular" | "plural";
    subjectGender?: "masc" | "fem" | "neut";
    // Determiner (the / a / bare) for the subject and direct-object noun phrases.
    subjectDefiniteness?: Definiteness;
    directObjectDefiniteness?: Definiteness;
    directObjectNumber?: "singular" | "plural";
    directObjectGender?: "masc" | "fem" | "neut";
    directObjectAdjective?: Concept;
    directObjectAdjective2?: Concept;
    indirectObjectNumber?: "singular" | "plural";
    indirectObjectGender?: "masc" | "fem" | "neut";
    indirectObjectAdjective?: Concept;
    indirectObjectAdjective2?: Concept;
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
    // Motion/locative complements — each an independent noun phrase, with its
    // own chained adjectives (up to two, matching subjects/objects).
    locative?: Concept;
    locativeNumber?: "singular" | "plural";
    locativeGender?: "masc" | "fem" | "neut";
    locativeAdjective?: Concept;
    locativeAdjective2?: Concept;
    direction?: Concept;
    directionNumber?: "singular" | "plural";
    directionGender?: "masc" | "fem" | "neut";
    directionAdjective?: Concept;
    directionAdjective2?: Concept;
    source?: Concept;
    sourceNumber?: "singular" | "plural";
    sourceGender?: "masc" | "fem" | "neut";
    sourceAdjective?: Concept;
    sourceAdjective2?: Concept;
    route?: Concept;
    routeNumber?: "singular" | "plural";
    routeGender?: "masc" | "fem" | "neut";
    routeAdjective?: Concept;
    routeAdjective2?: Concept;
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
    causeSentiment?: CauseSentiment;
    // Terminus / dative adjunct ("cut the hair *to the cat*") — the recipient or goal, "to
    // whom / to what". Renders with each language's indirect-object dative; carries no
    // specifier.
    terminus?: Concept;
    terminusNumber?: "singular" | "plural";
    terminusGender?: "masc" | "fem" | "neut";
    terminusAdjective?: Concept;
    terminusAdjective2?: Concept;
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

// A cross-container relative-clause link: source noun (the head) → target noun (the gap).
// The source may be a possessor head (a `/possessor` address); the target is a plain noun.
export interface PhraseLink {
  id: string;
  source: { containerId: string; nounKey: NounAddress };
  target: { containerId: string; nounKey: NounKey };
}

// Pick-mode: a source noun's relative satellite was clicked and is awaiting a target click.
export type PickMode =
  | { active: false }
  | { active: true; source: { containerId: string; nounKey: NounAddress } };

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
}
