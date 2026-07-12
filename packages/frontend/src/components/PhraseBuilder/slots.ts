import {
  COMPLEMENT_TYPES,
  COMPLEMENT_LABELS,
  DETERMINER_COMPLEMENT_TYPES,
  type ComplementType,
  type GrammaticalRole,
  type Transitivity,
} from "@signi/shared";
import { NounKey, NumberSlot, SlotConfig, SlotKey } from "./interfaces.ts";

// Every noun block on the canvas: the core roles plus each complement. These are the
// blocks that carry adjectives, number/gender, a determiner, a possessor, a relative clause.
export const NOUN_KEYS: NounKey[] = [
  "subject",
  "directObject",
  "indirectObject",
  ...COMPLEMENT_TYPES,
];

// Every noun block chains up to three adjectives. They are revealed one at a time —
// the noun box carries the control for the first, and each adjective box carries the
// control for the next — so slot `n` only exists once slot `n-1` holds a word. Ordered
// head-first: `adjectiveSlots("subject")[0]` is the first adjective.
export const ADJECTIVE_SUFFIXES = ["Adjective", "Adjective2", "Adjective3"] as const;

/** The adjective slot keys of one noun block, in chain order. */
export const adjectiveSlots = (which: NounKey): SlotKey[] =>
  ADJECTIVE_SUFFIXES.map((suffix) => `${which}${suffix}` as SlotKey);

/**
 * The slot an adjective's reveal control rides: the previous link in its chain. The first
 * adjective hangs off its noun, so it isn't chained and this returns undefined for it (and
 * for any non-adjective key).
 */
export const adjectiveChainParent = (key: string): SlotKey | undefined => {
  if (key.endsWith("Adjective3")) return key.replace(/3$/, "2") as SlotKey;
  if (key.endsWith("Adjective2")) return key.replace(/2$/, "") as SlotKey;
  return undefined;
};

// The verb phrase chains up to two modal verbs, outermost first: in "voglio poter andare"
// MODAL_SLOTS[0] holds WILL, which governs MODAL_SLOTS[1] = CAN, which governs the verb.
// They reveal one at a time like the adjectives — the verb box carries the control for the
// first modal, and the first modal's box carries the control for the second.
export const MODAL_SLOTS: SlotKey[] = ["verbModal", "verbModal2"];

const MODAL_SLOT_SET = new Set<SlotKey>(MODAL_SLOTS);

export const isModalSlot = (key: string): boolean => MODAL_SLOT_SET.has(key as SlotKey);

/** The box a modal's reveal control rides: the previous link in its chain, else the verb. */
export const modalChainParent = (key: string): SlotKey | undefined => {
  const idx = MODAL_SLOTS.indexOf(key as SlotKey);
  if (idx === -1) return undefined;
  return idx === 0 ? "verb" : MODAL_SLOTS[idx - 1];
};

export const ALL_SLOTS: SlotConfig[] = [
  {
    key: "subjectAdjective",
    label: "Adjective",
    required: false,
    roles: ["adjective"],
    color: "error",
  },
  {
    key: "subjectAdjective2",
    label: "Adjective 2",
    required: false,
    roles: ["adjective"],
    color: "error",
  },
  {
    key: "subjectAdjective3",
    label: "Adjective 3",
    required: false,
    roles: ["adjective"],
    color: "error",
  },
  {
    key: "subject",
    label: "Subject",
    labelKey: "slot.subject",
    required: true,
    roles: ["pronoun", "noun"],
    color: "primary",
  },
  {
    key: "verb",
    label: "Verb",
    required: true,
    roles: ["verb"],
    color: "secondary",
  },
  // Modal verbs governing the verb. Both hold verb concepts, but only the modal ones —
  // the picker filters on `Concept.modal`, which also keeps them out of the verb slot.
  {
    key: "verbModal",
    label: "Modal",
    required: false,
    roles: ["verb"],
    color: "secondary",
  },
  {
    key: "verbModal2",
    label: "Modal 2",
    required: false,
    roles: ["verb"],
    color: "secondary",
  },
  {
    key: "directObject",
    label: "Direct Object",
    required: false,
    roles: ["noun"],
    color: "success",
  },
  {
    key: "directObjectAdjective",
    label: "Adjective",
    required: false,
    roles: ["adjective"],
    color: "success",
  },
  {
    key: "directObjectAdjective2",
    label: "Adjective 2",
    required: false,
    roles: ["adjective"],
    color: "success",
  },
  {
    key: "directObjectAdjective3",
    label: "Adjective 3",
    required: false,
    roles: ["adjective"],
    color: "success",
  },
  {
    key: "indirectObject",
    label: "Indirect Object",
    required: false,
    roles: ["noun"],
    color: "warning",
  },
  {
    key: "indirectObjectAdjective",
    label: "Adjective",
    required: false,
    roles: ["adjective"],
    color: "warning",
  },
  {
    key: "indirectObjectAdjective2",
    label: "Adjective 2",
    required: false,
    roles: ["adjective"],
    color: "warning",
  },
  {
    key: "indirectObjectAdjective3",
    label: "Adjective 3",
    required: false,
    roles: ["adjective"],
    color: "warning",
  },
  {
    key: "modifier",
    label: "Adverb",
    required: false,
    roles: ["adverb"],
    color: "info",
  },
  // Motion/locative complements — noun slots gated by the verb's `complements`,
  // each with its own pair of chained adjective slots.
  ...COMPLEMENT_TYPES.flatMap(
    (type): SlotConfig[] => [
      {
        key: type,
        label: COMPLEMENT_LABELS[type],
        required: false,
        // The subject complement (predicative) can be a predicate noun ("becomes a
        // legend") OR a predicate adjective ("seems happy"); every other complement is a
        // noun head with optional adjective modifiers.
        roles: type === "predicative" ? ["noun", "adjective"] : ["noun"],
        color: "warning",
      },
      {
        key: `${type}Adjective`,
        label: "Adjective",
        required: false,
        roles: ["adjective"],
        color: "warning",
      },
      {
        key: `${type}Adjective2`,
        label: "Adjective 2",
        required: false,
        roles: ["adjective"],
        color: "warning",
      },
      {
        key: `${type}Adjective3`,
        label: "Adjective 3",
        required: false,
        roles: ["adjective"],
        color: "warning",
      },
    ],
  ),
];

export const COMPLEMENT_KEY_SET = new Set<SlotKey>(COMPLEMENT_TYPES);

// Complement adjective slot keys, mapped back to the complement they modify.
export const COMPLEMENT_ADJECTIVE_TYPE: Partial<Record<SlotKey, ComplementType>> =
  Object.fromEntries(
    COMPLEMENT_TYPES.flatMap((type) =>
      adjectiveSlots(type).map((key) => [key, type]),
    ),
  );

export const SATELLITE_SLOT_KEYS = new Set<SlotKey>([
  ...adjectiveSlots("subject"),
  "modifier",
  ...MODAL_SLOTS,
  ...adjectiveSlots("directObject"),
  ...adjectiveSlots("indirectObject"),
  ...COMPLEMENT_TYPES,
  ...COMPLEMENT_TYPES.flatMap((type) => adjectiveSlots(type)),
]);

// Collapsible role groups: each dashed box can be collapsed to show only its main
// word (the verb, the subject noun, …). `childKeys` are the satellite nodes hidden
// while collapsed; keyed by the group's `label` (matches GroupRect.label). Direct
// toggles (number / gender / polarity) have no node, so they never appear here.
export const COLLAPSIBLE_GROUPS: {
  label: string;
  mainKey: string;
  childKeys: string[];
}[] = [
  {
    label: "Subject",
    mainKey: "subject",
    childKeys: [...adjectiveSlots("subject"), "subjectDefiniteness"],
  },
  {
    label: "Verb Phrase",
    mainKey: "verb",
    childKeys: ["modifier", ...MODAL_SLOTS, "verbTense", "verbAspect"],
  },
  {
    label: "Direct Object",
    mainKey: "directObject",
    childKeys: [...adjectiveSlots("directObject"), "directObjectDefiniteness"],
  },
  {
    label: "Indirect Object",
    mainKey: "indirectObject",
    childKeys: [...adjectiveSlots("indirectObject")],
  },
  ...COMPLEMENT_TYPES.map((type) => ({
    label: COMPLEMENT_LABELS[type],
    mainKey: type as string,
    childKeys: [
      ...adjectiveSlots(type),
      // The predicative plus the adposition-bearing spatial/dative complements carry a
      // determiner (cause is excluded — it weaves the quantifier into its connector).
      ...(DETERMINER_COMPLEMENT_TYPES.includes(type) ? [`${type}Definiteness`] : []),
    ],
  })),
];

const SUBJECT_ADJECTIVES = new Set<SlotKey>(adjectiveSlots("subject"));
const DIRECT_OBJECT_ADJECTIVES = new Set<SlotKey>(adjectiveSlots("directObject"));
const INDIRECT_OBJECT_ADJECTIVES = new Set<SlotKey>(adjectiveSlots("indirectObject"));

export function getActiveSlots(
  transitivity?: Transitivity,
  subjectRole?: GrammaticalRole,
  hasSubjectAdjective?: boolean,
  verbComplements?: ComplementType[],
): SlotConfig[] {
  return ALL_SLOTS.filter((slot) => {
    if (slot.key === "directObject") return transitivity !== "intransitive";
    if (DIRECT_OBJECT_ADJECTIVES.has(slot.key))
      return transitivity !== "intransitive";
    if (slot.key === "indirectObject") return transitivity === "ditransitive";
    if (INDIRECT_OBJECT_ADJECTIVES.has(slot.key))
      return transitivity === "ditransitive";
    if (slot.key === "subjectAdjective") return subjectRole === "noun";
    // The chained subject adjectives ride along once the first one exists; which of them
    // is actually revealed is governed by the satellite chain, not by this list.
    if (SUBJECT_ADJECTIVES.has(slot.key))
      return subjectRole === "noun" && Boolean(hasSubjectAdjective);
    if (COMPLEMENT_KEY_SET.has(slot.key))
      return verbComplements?.includes(slot.key as ComplementType) ?? false;
    // Complement adjectives ride along whenever their complement is licensed;
    // actual visibility is governed by the satellite reveal state.
    const adjType = COMPLEMENT_ADJECTIVE_TYPE[slot.key];
    if (adjType) return verbComplements?.includes(adjType) ?? false;
    return true;
  });
}

export const NODE_POS: Record<SlotKey, { x: number; y: number }> = {
  // Subject complement (predicative) — copular verbs (become/seem/appear) are
  // intransitive, so it reuses the otherwise-empty direct-object region after the verb.
  predicative: { x: 80, y: 42 },
  predicativeAdjective: { x: 68, y: 16 },
  predicativeAdjective2: { x: 84, y: 14 },
  predicativeAdjective3: { x: 76, y: 26 },
  subjectAdjective: { x: 12, y: 14 },
  subjectAdjective2: { x: 12, y: 26 },
  subjectAdjective3: { x: 24, y: 20 },
  subject: { x: 26, y: 42 },
  verb: { x: 52, y: 42 },
  // Modal chain — its own row above the verb's tense/aspect toggles, reading
  // outermost-first left to right ("voglio" then "poter", governing "andare" below).
  verbModal: { x: 42, y: 10 },
  verbModal2: { x: 62, y: 10 },
  directObject: { x: 80, y: 42 },
  directObjectAdjective: { x: 68, y: 16 },
  directObjectAdjective2: { x: 84, y: 14 },
  directObjectAdjective3: { x: 76, y: 26 },
  indirectObject: { x: 76, y: 74 },
  indirectObjectAdjective: { x: 58, y: 86 },
  indirectObjectAdjective2: { x: 62, y: 96 },
  indirectObjectAdjective3: { x: 54, y: 78 },
  modifier: { x: 52, y: 74 },
  // Motion complements — arranged below the verb, each its own little cluster,
  // with its adjectives stacked just above the complement noun.
  source: { x: 20, y: 88 },
  sourceAdjective: { x: 24, y: 78 },
  sourceAdjective2: { x: 28, y: 70 },
  sourceAdjective3: { x: 32, y: 62 },
  direction: { x: 40, y: 92 },
  directionAdjective: { x: 44, y: 82 },
  directionAdjective2: { x: 48, y: 74 },
  directionAdjective3: { x: 52, y: 66 },
  route: { x: 62, y: 92 },
  routeAdjective: { x: 58, y: 82 },
  routeAdjective2: { x: 54, y: 74 },
  routeAdjective3: { x: 50, y: 66 },
  locative: { x: 84, y: 88 },
  locativeAdjective: { x: 80, y: 78 },
  locativeAdjective2: { x: 76, y: 70 },
  locativeAdjective3: { x: 72, y: 62 },
  // Cause ("because of …") — a non-motion adjunct; parked center-bottom under the verb.
  cause: { x: 52, y: 90 },
  causeAdjective: { x: 50, y: 80 },
  causeAdjective2: { x: 54, y: 72 },
  causeAdjective3: { x: 58, y: 64 },
  // Terminus ("to the cat") — the dative recipient; parked right-of-verb near the object row.
  terminus: { x: 90, y: 60 },
  terminusAdjective: { x: 88, y: 50 },
  terminusAdjective2: { x: 94, y: 46 },
  terminusAdjective3: { x: 90, y: 38 },
};

// Number is a direct-toggle satellite — the "#" border icon flips singular ⇄ plural
// in place, with no canvas box. These points are only the icon's aim target: the icon
// migrates around its noun box onto the ray toward this spot (see controlLayout).
const NUMBER_TOGGLE_DEFAULTS: Record<NumberSlot, { x: number; y: number }> = {
  predicative: { x: 80, y: 62 },
  subject: { x: 12, y: 72 },
  directObject: { x: 80, y: 62 },
  indirectObject: { x: 90, y: 88 },
  source: { x: 12, y: 96 },
  direction: { x: 32, y: 99 },
  route: { x: 70, y: 99 },
  locative: { x: 94, y: 96 },
  cause: { x: 46, y: 96 },
  terminus: { x: 96, y: 70 },
};

// Every satellite needs an entry, including the direct toggles (number / gender /
// polarity) that never render a canvas node: computeControlPositions reads each
// satellite's position to aim its icon around the parent box's perimeter.
export const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  ...NODE_POS,
  predicativeNumber: NUMBER_TOGGLE_DEFAULTS.predicative,
  predicativeGender: { x: 93, y: 30 },
  // Determiner reveal icon for the predicate-noun subject complement (reuses the DO region).
  predicativeDefiniteness: { x: 66, y: 26 },
  predicativeRelative: { x: 80, y: 64 },
  predicativePossessor: { x: 74, y: 64 },
  subjectNumber: NUMBER_TOGGLE_DEFAULTS.subject,
  subjectGender: { x: 12, y: 57 },
  // Determiner (the / a / bare) reveal icons — icon-only (cycle on click), no canvas
  // node; these just aim the icon at the noun box edge.
  subjectDefiniteness: { x: 34, y: 30 },
  directObjectDefiniteness: { x: 66, y: 30 },
  subjectAdjective2Gender: { x: 20, y: 26 },
  verbNegative: { x: 52, y: 62 },
  verbTense: { x: 40, y: 22 },
  verbAspect: { x: 64, y: 22 },
  directObjectNumber: NUMBER_TOGGLE_DEFAULTS.directObject,
  directObjectGender: { x: 93, y: 30 },
  indirectObjectNumber: NUMBER_TOGGLE_DEFAULTS.indirectObject,
  indirectObjectGender: { x: 88, y: 62 },
  sourceNumber: NUMBER_TOGGLE_DEFAULTS.source,
  sourceGender: { x: 8, y: 80 },
  directionNumber: NUMBER_TOGGLE_DEFAULTS.direction,
  directionGender: { x: 28, y: 84 },
  routeNumber: NUMBER_TOGGLE_DEFAULTS.route,
  routeGender: { x: 74, y: 84 },
  locativeNumber: NUMBER_TOGGLE_DEFAULTS.locative,
  locativeGender: { x: 96, y: 80 },
  causeNumber: NUMBER_TOGGLE_DEFAULTS.cause,
  causeGender: { x: 58, y: 96 },
  terminusNumber: NUMBER_TOGGLE_DEFAULTS.terminus,
  terminusGender: { x: 82, y: 60 },
  // Determiner (the / a / bare / quantifier) reveal icons for the adposition-bearing
  // complements — icon-only (cycle on click), aimed just outboard of each noun box.
  sourceDefiniteness: { x: 12, y: 78 },
  directionDefiniteness: { x: 32, y: 82 },
  routeDefiniteness: { x: 68, y: 82 },
  locativeDefiniteness: { x: 92, y: 78 },
  terminusDefiniteness: { x: 84, y: 50 },
  // Relative-clause reveal icons — no canvas node of their own; these only aim each
  // icon at the bottom edge of its noun box (clauses expand into panels below).
  subjectRelative: { x: 26, y: 64 },
  directObjectRelative: { x: 80, y: 64 },
  indirectObjectRelative: { x: 76, y: 92 },
  sourceRelative: { x: 20, y: 99 },
  directionRelative: { x: 40, y: 99 },
  routeRelative: { x: 62, y: 99 },
  locativeRelative: { x: 84, y: 99 },
  causeRelative: { x: 52, y: 99 },
  terminusRelative: { x: 92, y: 70 },
  // Possessor reveal icons — same role as the relative ones (aim the icon at the noun
  // box edge; the possessor editor docks in a panel below). Offset left of the relative
  // anchor so both icons ride the box without overlapping.
  subjectPossessor: { x: 20, y: 64 },
  directObjectPossessor: { x: 74, y: 64 },
  indirectObjectPossessor: { x: 70, y: 92 },
  sourcePossessor: { x: 14, y: 99 },
  directionPossessor: { x: 34, y: 99 },
  routePossessor: { x: 56, y: 99 },
  locativePossessor: { x: 78, y: 99 },
  causePossessor: { x: 48, y: 99 },
  terminusPossessor: { x: 86, y: 70 },
};

export const MUI_COLOR_HEX: Record<SlotConfig["color"], string> = {
  primary: "#2c4a6e",
  secondary: "#8b3e2a",
  success: "#3a6e3a",
  warning: "#8b6914",
  info: "#2a6e7c",
  error: "#8b1a1a",
};

export const GRAPH_HEIGHT = 340;
export const MIN_GRAPH_HEIGHT = 160;
