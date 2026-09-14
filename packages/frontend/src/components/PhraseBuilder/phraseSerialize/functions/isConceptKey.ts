import { CONCEPT_BASE_KEYS } from "../phraseSerialize.consts.ts";

// A slot that holds a single Concept (encoded to its id). Covers the base slots plus
// every chained adjective slot (`subjectAdjective`, `routeAdjective2`, …).
export const isConceptKey = (k: string): boolean =>
  CONCEPT_BASE_KEYS.has(k) || /Adjective\d?$/.test(k);
