import {
  COMPLEMENT_TYPES,
  COMPLEMENT_LABELS,
  type ComplementType,
  type GrammaticalRole,
  type Transitivity,
} from "@signi/shared";
import {
  GenderSlot,
  NumberSlot,
  SlotConfig,
  SlotKey,
} from "./interfaces.ts";

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
    key: "subject",
    label: "Subject",
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
        roles: ["noun"],
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
    ],
  ),
];

export const COMPLEMENT_KEY_SET = new Set<SlotKey>(COMPLEMENT_TYPES);

// Complement adjective slot keys, mapped back to the complement they modify.
export const COMPLEMENT_ADJECTIVE_TYPE: Partial<Record<SlotKey, ComplementType>> =
  Object.fromEntries(
    COMPLEMENT_TYPES.flatMap((type) => [
      [`${type}Adjective`, type],
      [`${type}Adjective2`, type],
    ]),
  );

export const SATELLITE_SLOT_KEYS = new Set<SlotKey>([
  "subjectAdjective",
  "subjectAdjective2",
  "modifier",
  "directObjectAdjective",
  "directObjectAdjective2",
  "indirectObjectAdjective",
  "indirectObjectAdjective2",
  ...COMPLEMENT_TYPES,
  ...COMPLEMENT_TYPES.flatMap(
    (type): SlotKey[] => [`${type}Adjective`, `${type}Adjective2`],
  ),
]);

// Collapsible role groups: each dashed box can be collapsed to show only its main
// word (the verb, the subject noun, …). `childKeys` are the satellite/toggle nodes
// hidden while collapsed; keyed by the group's `label` (matches GroupRect.label).
export const COLLAPSIBLE_GROUPS: {
  label: string;
  mainKey: string;
  childKeys: string[];
}[] = [
  {
    label: "Subject",
    mainKey: "subject",
    childKeys: [
      "subjectAdjective",
      "subjectAdjective2",
      "subjectNumber",
      "subjectGender",
    ],
  },
  {
    label: "Verb Phrase",
    mainKey: "verb",
    childKeys: ["modifier", "verbNegative", "verbTense"],
  },
  {
    label: "Direct Object",
    mainKey: "directObject",
    childKeys: [
      "directObjectAdjective",
      "directObjectAdjective2",
      "directObjectNumber",
      "directObjectGender",
    ],
  },
  {
    label: "Indirect Object",
    mainKey: "indirectObject",
    childKeys: [
      "indirectObjectAdjective",
      "indirectObjectAdjective2",
      "indirectObjectNumber",
      "indirectObjectGender",
    ],
  },
  ...COMPLEMENT_TYPES.map((type) => ({
    label: COMPLEMENT_LABELS[type],
    mainKey: type as string,
    childKeys: [
      `${type}Adjective`,
      `${type}Adjective2`,
      `${type}Number`,
      `${type}Gender`,
    ],
  })),
];

export function getActiveSlots(
  transitivity?: Transitivity,
  subjectRole?: GrammaticalRole,
  hasSubjectAdjective?: boolean,
  verbComplements?: ComplementType[],
): SlotConfig[] {
  return ALL_SLOTS.filter((slot) => {
    if (slot.key === "directObject") return transitivity !== "intransitive";
    if (
      slot.key === "directObjectAdjective" ||
      slot.key === "directObjectAdjective2"
    )
      return transitivity !== "intransitive";
    if (slot.key === "indirectObject") return transitivity === "ditransitive";
    if (
      slot.key === "indirectObjectAdjective" ||
      slot.key === "indirectObjectAdjective2"
    )
      return transitivity === "ditransitive";
    if (slot.key === "subjectAdjective") return subjectRole === "noun";
    if (slot.key === "subjectAdjective2")
      return subjectRole === "noun" && hasSubjectAdjective;
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
  subjectAdjective: { x: 12, y: 14 },
  subjectAdjective2: { x: 12, y: 26 },
  subject: { x: 26, y: 42 },
  verb: { x: 52, y: 42 },
  directObject: { x: 80, y: 42 },
  directObjectAdjective: { x: 68, y: 16 },
  directObjectAdjective2: { x: 84, y: 14 },
  indirectObject: { x: 76, y: 74 },
  indirectObjectAdjective: { x: 58, y: 86 },
  indirectObjectAdjective2: { x: 62, y: 96 },
  modifier: { x: 52, y: 74 },
  // Motion complements — arranged below the verb, each its own little cluster,
  // with its adjectives stacked just above the complement noun.
  source: { x: 20, y: 88 },
  sourceAdjective: { x: 24, y: 78 },
  sourceAdjective2: { x: 28, y: 70 },
  direction: { x: 40, y: 92 },
  directionAdjective: { x: 44, y: 82 },
  directionAdjective2: { x: 48, y: 74 },
  route: { x: 62, y: 92 },
  routeAdjective: { x: 58, y: 82 },
  routeAdjective2: { x: 54, y: 74 },
  locative: { x: 84, y: 88 },
  locativeAdjective: { x: 80, y: 78 },
  locativeAdjective2: { x: 76, y: 70 },
};

const NUMBER_TOGGLE_DEFAULTS: Record<NumberSlot, { x: number; y: number }> = {
  subject: { x: 12, y: 72 },
  directObject: { x: 80, y: 62 },
  indirectObject: { x: 90, y: 88 },
  source: { x: 12, y: 96 },
  direction: { x: 32, y: 99 },
  route: { x: 70, y: 99 },
  locative: { x: 94, y: 96 },
};

export const NUMBER_TOGGLE_KEY = (which: NumberSlot) => `${which}Number`;

export const GENDER_TOGGLE_KEY = (which: GenderSlot) => `${which}Gender`;

export const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  ...NODE_POS,
  subjectNumber: NUMBER_TOGGLE_DEFAULTS.subject,
  subjectGender: { x: 12, y: 57 },
  subjectAdjective2Gender: { x: 20, y: 26 },
  verbNegative: { x: 52, y: 62 },
  verbTense: { x: 40, y: 22 },
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
