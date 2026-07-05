import type { Concept, ComplementType, GrammaticalRole, PathSpecifier, Tense } from "@signi/shared";


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
    // Optional relative clause per noun block ("the boy *who cried*"). Each is itself
    // a PhraseSelection minus its subject (the head noun is the clause's subject), so
    // clauses nest recursively. Edited by a nested clause-mode PhraseBuilder instance.
    subjectRelative?: PhraseSelection;
    directObjectRelative?: PhraseSelection;
    indirectObjectRelative?: PhraseSelection;
    locativeRelative?: PhraseSelection;
    directionRelative?: PhraseSelection;
    sourceRelative?: PhraseSelection;
    routeRelative?: PhraseSelection;
}

export type NumberSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

export type GenderSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

// The noun blocks that can carry a relative clause (same set as NumberSlot).
export type NounKey = "subject" | "directObject" | "indirectObject" | ComplementType;

export const RELATIVE_KEY = (which: NounKey) =>
  `${which}Relative` as keyof PhraseSelection;

export type SlotKey = SlotConfig["key"];
