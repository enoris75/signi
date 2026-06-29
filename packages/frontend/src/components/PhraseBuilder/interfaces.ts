import type { Concept, GrammaticalRole } from "@signi/shared";


export interface SlotConfig {
    key: "subject" |
    "verb" |
    "directObject" |
    "indirectObject" |
    "modifier" |
    "subjectAdjective";
    label: string;
    required: boolean;
    roles: GrammaticalRole[];
    color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
}

export interface PhraseSelection {
    subject?: Concept;
    verb?: Concept;
    directObject?: Concept;
    indirectObject?: Concept;
    modifier?: Concept;
    subjectAdjective?: Concept;
    subjectNumber?: "singular" | "plural";
    subjectGender?: "masc" | "fem";
    directObjectNumber?: "singular" | "plural";
    directObjectGender?: "masc" | "fem";
    indirectObjectNumber?: "singular" | "plural";
    indirectObjectGender?: "masc" | "fem";
}

export type NumberSlot = "subject" | "directObject" | "indirectObject";

export type GenderSlot = "subject" | "directObject" | "indirectObject";

export type SlotKey = SlotConfig["key"];
