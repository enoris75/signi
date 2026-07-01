import type { Concept, ComplementType, GrammaticalRole, PathSpecifier } from "@signi/shared";


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
    ComplementType;
    label: string;
    required: boolean;
    roles: GrammaticalRole[];
    color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
}

export interface PhraseSelection {
    subject?: Concept;
    verb?: Concept;
    verbNegative?: boolean;
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
    // Motion/locative complements — each an independent noun phrase.
    locative?: Concept;
    locativeNumber?: "singular" | "plural";
    locativeGender?: "masc" | "fem";
    direction?: Concept;
    directionNumber?: "singular" | "plural";
    directionGender?: "masc" | "fem";
    source?: Concept;
    sourceNumber?: "singular" | "plural";
    sourceGender?: "masc" | "fem";
    route?: Concept;
    routeNumber?: "singular" | "plural";
    routeGender?: "masc" | "fem";
    // The path relation (through / under / over / …) for the route complement.
    routeSpecifier?: PathSpecifier;
}

export type NumberSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

export type GenderSlot = "subject" | "directObject" | "indirectObject" | ComplementType;

export type SlotKey = SlotConfig["key"];
