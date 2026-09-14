import { COMPLEMENT_TYPES } from "@signi/shared";
import { MODAL_ADVERB_SLOTS, MODAL_SLOTS } from "../slots.ts";

// A PhraseSelection embeds whole Concept objects (DB-derived) and nests further
// selections under its `*Possessor` slots. To persist it we replace every Concept
// with its `id` and keep scalars (number/gender/tense/definiteness/…) verbatim, so a
// save is a compact reference tree that survives lexicon edits. Both directions share
// the same key predicates (functions/is*Key.ts), which guarantees a lossless round-trip.

// Concept-valued slots whose exact key isn't suffix-derived. Every complement head is one,
// so they come off COMPLEMENT_TYPES rather than a hand-kept list that drifts as new
// complements land.
export const CONCEPT_BASE_KEYS = new Set<string>([
  "subject",
  "verb",
  "directObject",
  "modifier",
  ...MODAL_SLOTS,
  ...MODAL_ADVERB_SLOTS,
  ...COMPLEMENT_TYPES,
]);

// Phrases saved before the recipient became the `terminus` complement carry `indirectObject`
// keys (`indirectObjectAdjective2`, `indirectObjectPossessor`, the noun address of a relative
// link, …). They mean exactly what the `terminus` ones mean now, so a load renames them and
// nothing downstream ever sees the old name.
export const LEGACY_INDIRECT = "indirectObject";

// Selection fields that are maps *keyed by slot key* — their keys need the legacy rename too.
export const SLOT_KEYED_MAPS = new Set<string>([
  "modifierRelations",
  "modifierNumbers",
  "adjectiveDegrees",
]);
