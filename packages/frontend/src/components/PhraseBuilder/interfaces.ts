import type { Concept, ComplementType, Definiteness, GrammaticalRole, ModifierRelation, PathSpecifier, Tense } from "@signi/shared";


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
    subjectGender?: "masc" | "fem";
    // Determiner (the / a / bare) for the subject and direct-object noun phrases.
    subjectDefiniteness?: Definiteness;
    directObjectDefiniteness?: Definiteness;
    directObjectNumber?: "singular" | "plural";
    directObjectGender?: "masc" | "fem";
    directObjectAdjective?: Concept;
    directObjectAdjective2?: Concept;
    indirectObjectNumber?: "singular" | "plural";
    indirectObjectGender?: "masc" | "fem";
    indirectObjectAdjective?: Concept;
    indirectObjectAdjective2?: Concept;
    // Motion/locative complements — each an independent noun phrase, with its
    // own chained adjectives (up to two, matching subjects/objects).
    locative?: Concept;
    locativeNumber?: "singular" | "plural";
    locativeGender?: "masc" | "fem";
    locativeAdjective?: Concept;
    locativeAdjective2?: Concept;
    direction?: Concept;
    directionNumber?: "singular" | "plural";
    directionGender?: "masc" | "fem";
    directionAdjective?: Concept;
    directionAdjective2?: Concept;
    source?: Concept;
    sourceNumber?: "singular" | "plural";
    sourceGender?: "masc" | "fem";
    sourceAdjective?: Concept;
    sourceAdjective2?: Concept;
    route?: Concept;
    routeNumber?: "singular" | "plural";
    routeGender?: "masc" | "fem";
    routeAdjective?: Concept;
    routeAdjective2?: Concept;
    // The path relation (through / under / over / …) for the route complement.
    routeSpecifier?: PathSpecifier;
    // Semantic relation for any adjective slot whose picked concept is a *noun* used
    // attributively ("sail boat"). Keyed by the adjective slot key (e.g. "subjectAdjective").
    // Only consulted when that slot holds a noun; adjective concepts ignore it. Defaults
    // to 'feature'. See NounModifier / ModifierRelation in @signi/shared.
    modifierRelations?: Partial<Record<string, ModifierRelation>>;
    // Relative clauses are no longer stored inside a selection: a noun's relative clause
    // is a *separate* phrase container linked to it (see PhraseLink / PhraseWorkspace).
    // Optional possessor per noun block ("the *cat's* book"). Each is a PhraseSelection
    // whose `subject` slot holds the possessing noun (so its number/gender/adjectives and
    // its own nested possessor all reuse the `subject*` fields); built via buildNounPhrase.
    subjectPossessor?: PhraseSelection;
    directObjectPossessor?: PhraseSelection;
    indirectObjectPossessor?: PhraseSelection;
    locativePossessor?: PhraseSelection;
    directionPossessor?: PhraseSelection;
    sourcePossessor?: PhraseSelection;
    routePossessor?: PhraseSelection;
}

export type NumberSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

export type GenderSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

// The noun blocks that can carry a relative clause / possessor (same set as NumberSlot).
export type NounKey = "subject" | "directObject" | "indirectObject" | ComplementType;

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
export interface PhraseLink {
  id: string;
  source: { containerId: string; nounKey: NounKey };
  target: { containerId: string; nounKey: NounKey };
}

// Pick-mode: a source noun's relative satellite was clicked and is awaiting a target click.
export type PickMode =
  | { active: false }
  | { active: true; source: { containerId: string; nounKey: NounKey } };

// The workspace-provided hooks a PhraseBuilder needs to take part in cross-container
// linking. Undefined for embedded (possessor) sub-builders, which never link.
export interface WorkspaceBinding {
  containerId: string;
  // Register/unregister a noun box's DOM element for cross-container measuring & greying.
  registerBox: (nounKey: NounKey, el: HTMLElement | null) => void;
  // Pick-mode: is this noun a legal link target right now? (drives highlight + click)
  isPickTarget: (nounKey: NounKey) => boolean;
  onNounPick: (nounKey: NounKey) => void;
  // Start / remove a relative-clause link sourced from this noun.
  onStartRelativeLink: (nounKey: NounKey) => void;
  onRemoveLink: (nounKey: NounKey) => void;
  // Nouns of this container that are a link source / a link target.
  linkSourceKeys: Set<NounKey>;
  linkTargetKeys: Set<NounKey>;
  pickActive: boolean;
}
