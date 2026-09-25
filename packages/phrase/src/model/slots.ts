import {
  ADJUNCT_COMPLEMENT_TYPES,
  COMPLEMENT_TYPES,
  COMPLEMENT_LABELS,
  DETERMINER_COMPLEMENT_TYPES,
  type ComplementType,
  type Concept,
  type ObjectPredication,
  type GrammaticalRole,
  type Transitivity,
  type UiStringKey,
} from "@signi/shared";
import { BoxComplementType, NounKey, SlotConfig, SlotKey } from "./interfaces.ts";

/**
 * The complements realized as a cross-container link rather than a box on this canvas — their
 * noun phrase lives in a period container of its own (see BoxComplementType). The instrumental
 * is the only one today.
 */
export const LINKED_COMPLEMENT_TYPES: ComplementType[] = ["instrumental"];

/** The complements that do get a canvas box — everything else the builder offers. */
export const BOX_COMPLEMENT_TYPES: BoxComplementType[] = COMPLEMENT_TYPES.filter(
  (type) => !LINKED_COMPLEMENT_TYPES.includes(type),
) as BoxComplementType[];

/**
 * Whether a complement is one the canvas draws a box for. Narrows away the linked instrumental
 * and the plan-only complements, which have no selection fields (see BoxComplementType), so a
 * caller walking the engine's `COMPLEMENT_RENDER_ORDER` can skip the ones the builder has no slot
 * for and keep that order for the rest.
 */
export const isBoxComplement = (type: ComplementType): type is BoxComplementType =>
  (BOX_COMPLEMENT_TYPES as ComplementType[]).includes(type);

/**
 * The complements a period offers for its verb: the ones the verb licenses, plus the adjuncts any
 * act can take (a time, a beneficiary, a companion — ADJUNCT_COMPLEMENT_TYPES, P09-E12 D2), and —
 * on a verb with an object — what that object is taken as, "uses the period **as a condition**"
 * (the essive object complement, P13). No verb, none.
 */
export const offeredComplements = (verb: Concept | undefined): ComplementType[] =>
  verb
    ? [
      ...(verb.complements ?? []),
      ...ADJUNCT_COMPLEMENT_TYPES.filter((type) => !verb.complements?.includes(type)),
      ...(takesObject(verb) && !verb.complements?.includes("objectPredicative") ? ["objectPredicative" as const] : []),
    ]
    : [];

const takesObject = (verb: Concept) => verb.transitivity === "transitive" || verb.transitivity === "ditransitive";

/**
 * What an object complement says of the object when the period does not say (P13): the factitive —
 * it becomes the complement — where the verb licenses the complement (TRANSFORM, "into a command"),
 * and the essive — it is taken as the complement — where the complement is the object's adjunct.
 */
export const defaultPredication = (verb: Concept | undefined): ObjectPredication =>
  verb?.complements?.includes("objectPredicative") ? "factitive" : "essive";

/**
 * Whether a block's conjuncts are nouns only, as its head is: the role's (P09-E44 D3). A pronoun in
 * a role group is no capacity, and the translator drops the whole group ("the man acts."), so neither
 * the console nor the canvas offers one. Every other block's conjunct may be a pronoun ("you and I",
 * "against the dog and him"); a predicate's takes what the predicate takes (see conjunctSpec).
 */
export const nounOnlyConjunct = (which: NounKey | undefined): boolean => which === "role";

// Every noun block on the canvas: the core roles plus each boxed complement. These are the
// blocks that carry adjectives, number/gender, a determiner, a possessor, a relative clause.
// Last, the period's vocative (P11-E8): a noun block before the clause, no complement of its verb —
// no determiner (the engine says it bare), no question, no existential, never a relative clause's gap.
export const NOUN_KEYS: NounKey[] = [
  "subject",
  "directObject",
  ...BOX_COMPLEMENT_TYPES,
  "vocative",
];

/**
 * The pronouns the vocative takes (P11-E8): the hearer's own, "You, run.", *Toi, cours.* An address
 * calls the hearer, so the engine refuses the 1st and 3rd persons and the generic one (A338); the
 * canvas's pronoun chooser greys them in the box, and the console knows no other word there.
 */
export const VOCATIVE_PRONOUNS: readonly string[] = ["SECOND_PERSON"];

/**
 * The noun blocks that can be *coordinated* ("Peter and Paul could speak aramaic or latin") —
 * every noun block on the canvas.
 *
 * The prepositional complements were held back at first, not for lack of a data model — `NounGroup`
 * sits in every noun slot — but because coordinating one raises a question the adposition-free
 * slots never do: does the preposition repeat across the conjuncts? Each language answers
 * differently, and the engines answer it *per conjunct*, which is what made opening these up a UI
 * change alone. Italian repeats its fused article where English drops the preposition ("nella casa
 * e nel mercato" / "in the house and the market"); a `direction` group takes two different
 * prepositions at once when its goals differ in animacy ("corre dal bambino e alla casa"); and an
 * English locative idiom survives on the one conjunct that licenses it ("at home and in the
 * market").
 *
 * The instrumental is absent because it is not a box on this canvas (see LINKED_COMPLEMENT_TYPES),
 * not because it cannot coordinate.
 */
export const COORDINABLE_NOUN_KEYS: NounKey[] = [...NOUN_KEYS];

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

// The main verb chains up to three adverbs (P15), revealed one at a time like the adjectives: the
// verb box carries the control for the first, and each adverb's box the control for the next, so
// `modifier2` only exists once `modifier` holds a word. The engine places each by its class.
export const ADVERB_SLOTS: SlotKey[] = ["modifier", "modifier2", "modifier3"];

const ADVERB_SLOT_SET = new Set<SlotKey>(ADVERB_SLOTS);

/** Whether `key` is one of the main verb's adverb slots (not a modal's). */
export const isVerbAdverbSlot = (key: string): boolean => ADVERB_SLOT_SET.has(key as SlotKey);

/** The box an adverb's reveal control rides: the previous adverb, or undefined for the first. */
export const adverbChainParent = (key: string): SlotKey | undefined => {
  const idx = ADVERB_SLOTS.indexOf(key as SlotKey);
  return idx > 0 ? ADVERB_SLOTS[idx - 1] : undefined;
};

// Each modal may carry its own adverb — the adverb slot paired to MODAL_SLOTS by index, so
// `verbModalAdverb` scopes `verbModal` and `verbModal2Adverb` scopes `verbModal2`. They mirror the
// main verb's `modifier`, and each is revealed from a control on its modal's box once it holds a word.
export const MODAL_ADVERB_SLOTS: SlotKey[] = ["verbModalAdverb", "verbModal2Adverb"];

const MODAL_ADVERB_SLOT_SET = new Set<SlotKey>(MODAL_ADVERB_SLOTS);

export const isModalAdverbSlot = (key: string): boolean =>
  MODAL_ADVERB_SLOT_SET.has(key as SlotKey);

// Each modal may carry its own negation — the selection field paired to MODAL_SLOTS by index, so
// `verbModalNegative` denies `verbModal` and `verbModal2Negative` denies `verbModal2`. They mirror
// the main verb's `verbNegative`, and each is revealed from a control on its modal's box. Unlike
// the adverbs these hold a boolean, not a word, so they are selection fields and not slots.
export const MODAL_NEGATIVE_FIELDS = ["verbModalNegative", "verbModal2Negative"] as const;

export type ModalNegativeField = (typeof MODAL_NEGATIVE_FIELDS)[number];

const MODAL_NEGATIVE_FIELD_SET: Set<string> = new Set(MODAL_NEGATIVE_FIELDS);

export const isModalNegativeField = (key: string): boolean => MODAL_NEGATIVE_FIELD_SET.has(key);

/** The negation field of a modal slot — `verbModal` → `verbModalNegative`. */
export function modalNegativeFor(key: string): ModalNegativeField | undefined {
  const idx = MODAL_SLOTS.indexOf(key as SlotKey);
  return idx === -1 ? undefined : MODAL_NEGATIVE_FIELDS[idx];
}

/** The negation field a verb-family box toggles: the verb's own, or that modal's. */
export function negativeFieldOf(key: string): "verbNegative" | ModalNegativeField | undefined {
  return key === "verb" ? "verbNegative" : modalNegativeFor(key);
}

/** The adverb slot for a modal slot (by index), or undefined for a non-modal key. */
export const modalAdverbFor = (key: string): SlotKey | undefined => {
  const idx = MODAL_SLOTS.indexOf(key as SlotKey);
  return idx === -1 ? undefined : MODAL_ADVERB_SLOTS[idx];
};

/** The modal slot an adverb slot hangs off (its box carries the adverb's reveal control). */
export const modalAdverbParent = (key: string): SlotKey | undefined => {
  const idx = MODAL_ADVERB_SLOTS.indexOf(key as SlotKey);
  return idx === -1 ? undefined : MODAL_SLOTS[idx];
};

/** The box a modal's reveal control rides: the previous link in its chain, else the verb. */
export const modalChainParent = (key: string): SlotKey | undefined => {
  const idx = MODAL_SLOTS.indexOf(key as SlotKey);
  if (idx === -1) return undefined;
  return idx === 0 ? "verb" : MODAL_SLOTS[idx - 1];
};

/**
 * The engine-rendered name of each complement. The box titles itself with this in the current UI
 * language, and the satellite icon's tooltip and the word map read it. The static English
 * `COMPLEMENT_LABELS` is only the ring's stable key (see COLLAPSIBLE_GROUPS).
 */
export const COMPLEMENT_LABEL_KEYS: Record<ComplementType, UiStringKey> = {
  predicative: "slot.predicative",
  objectPredicative: "slot.objectPredicative",
  comitative: "slot.comitative",
  terminus: "slot.terminus",
  instrumental: "slot.instrumental",
  manner: "slot.manner",
  locative: "slot.locative",
  direction: "slot.direction",
  source: "slot.source",
  route: "slot.route",
  cause: "slot.cause",
  temporal: "slot.temporal",
  purpose: "slot.purpose",
  topic: "slot.topic",
  role: "slot.role",
  opponent: "slot.opponent",
};

/**
 * The letter each complement answers to in the *Add a complement* menu (the plan's §3.7): the
 * initial of its English name, and no two collide.
 */
export const COMPLEMENT_KEYS: Record<ComplementType, string> = {
  predicative: "P",
  // The object complement cannot take O, which folds the object away in the same menu (P13): it answers
  // to E, the essive it is on most verbs; the comitative cannot take C (the cause has it) so it answers
  // to W, the "with" every language but Japanese spells it as.
  objectPredicative: "E",
  comitative: "W",
  terminus: "T",
  instrumental: "I",
  manner: "M",
  locative: "L",
  direction: "D",
  source: "S",
  route: "R",
  cause: "C",
  // The temporal answers to A, from the "at" it takes by default: its own initial is the
  // terminus's, and the "when" that would name it is the comitative's W.
  temporal: "A",
  // P09-E2's two: the purpose takes F, from the "for" it is (its P is the subject complement's), and
  // the topic B, from "about" (its A is the temporal's).
  purpose: "F",
  topic: "B",
  // P09-E13's role takes Q, from *qua*, "in the capacity of" (P09-E44): the E of the essive whose "as"
  // it is went to the object complement, its R is the route's, and the A of "as" the temporal's.
  role: "Q",
  // P09-E22's opponent takes V, from "versus" (its O is the object complement's, and the A of
  // "against" the temporal's); a box since P09-E45.
  opponent: "V",
};

/**
 * Every adjective slot names itself with the same word — the grammar noun "adjective", which is
 * what `category.adjective` already renders. The chain position ("Adjective 2") was never part of
 * the name: it disambiguated three identical English labels, and the boxes are told apart by where
 * they sit and the word they hold. The static `label` keeps the numeral as the pre-bundle fallback.
 */
const ADJECTIVE_LABEL_KEY: UiStringKey = "category.adjective";

export const ALL_SLOTS: SlotConfig[] = [
  // The period's interjection (P09-E47): first in reading order, as it is spoken first. It is on the
  // canvas only while the card's border toggle shows it (see getActiveSlots), in the word map's colour
  // for its role.
  {
    key: "interjection",
    label: "Interjection",
    labelKey: "slot.interjection",
    required: false,
    roles: ["interjection"],
    color: "info",
  },
  // The period's vocative (P11-E8), "**Mom**, run": the hearer, named after the interjection and before
  // the subject, as it is spoken. Like the interjection it is on the canvas only while the card's border
  // toggle shows it (see getActiveSlots), in the same colour, since both stand outside the clause. A noun,
  // or a 2nd-person pronoun ("You, run."): the engine refuses any other person (A338).
  {
    key: "vocative",
    label: "Vocative",
    labelKey: "slot.vocative",
    required: false,
    roles: ["noun", "pronoun"],
    color: "info",
  },
  ...adjectiveSlots("vocative").map(
    (key, i): SlotConfig => ({
      key: key as SlotConfig["key"],
      label: i === 0 ? "Adjective" : `Adjective ${i + 1}`,
      labelKey: ADJECTIVE_LABEL_KEY,
      required: false,
      roles: ["adjective"],
      color: "info",
    }),
  ),
  {
    key: "subjectAdjective",
    label: "Adjective",
    labelKey: ADJECTIVE_LABEL_KEY,
    required: false,
    roles: ["adjective"],
    color: "error",
  },
  {
    key: "subjectAdjective2",
    label: "Adjective 2",
    labelKey: ADJECTIVE_LABEL_KEY,
    required: false,
    roles: ["adjective"],
    color: "error",
  },
  {
    key: "subjectAdjective3",
    label: "Adjective 3",
    labelKey: ADJECTIVE_LABEL_KEY,
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
    labelKey: "slot.verb",
    required: true,
    roles: ["verb"],
    color: "secondary",
  },
  // Modal verbs governing the verb. Both hold verb concepts, but only the modal ones —
  // the picker filters on `Concept.modal`, which also keeps them out of the verb slot.
  {
    key: "verbModal",
    label: "Modal",
    labelKey: "slot.modal",
    required: false,
    roles: ["verb"],
    color: "secondary",
  },
  {
    key: "verbModal2",
    label: "Modal 2",
    labelKey: "slot.modal",
    required: false,
    roles: ["verb"],
    color: "secondary",
  },
  // Each modal's own adverb (like the main verb's Adverb slot), revealed from its modal's box.
  {
    key: "verbModalAdverb",
    label: "Modal Adverb",
    labelKey: "slot.adverb",
    required: false,
    roles: ["adverb"],
    color: "info",
  },
  {
    key: "verbModal2Adverb",
    label: "Modal 2 Adverb",
    labelKey: "slot.adverb",
    required: false,
    roles: ["adverb"],
    color: "info",
  },
  {
    key: "directObject",
    label: "Direct Object",
    labelKey: "slot.directObject",
    required: false,
    // A pronoun objects as readily as it subjects ("I see you"): it takes the language's
    // oblique form, and in Romance cliticises before the verb ("ti vedo").
    roles: ["pronoun", "noun"],
    color: "success",
  },
  {
    key: "directObjectAdjective",
    label: "Adjective",
    labelKey: ADJECTIVE_LABEL_KEY,
    required: false,
    roles: ["adjective"],
    color: "success",
  },
  {
    key: "directObjectAdjective2",
    label: "Adjective 2",
    labelKey: ADJECTIVE_LABEL_KEY,
    required: false,
    roles: ["adjective"],
    color: "success",
  },
  {
    key: "directObjectAdjective3",
    label: "Adjective 3",
    labelKey: ADJECTIVE_LABEL_KEY,
    required: false,
    roles: ["adjective"],
    color: "success",
  },
  ...ADVERB_SLOTS.map(
    (key, i): SlotConfig => ({
      key,
      label: i === 0 ? "Adverb" : `Adverb ${i + 1}`,
      labelKey: "slot.adverb",
      required: false,
      roles: ["adverb"],
      color: "info",
    }),
  ),
  // Motion/locative complements — noun slots gated by the verb's `complements`,
  // each with its own pair of chained adjective slots.
  ...BOX_COMPLEMENT_TYPES.flatMap(
    (type): SlotConfig[] => [
      {
        key: type,
        label: COMPLEMENT_LABELS[type],
        labelKey: COMPLEMENT_LABEL_KEYS[type],
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
        labelKey: ADJECTIVE_LABEL_KEY,
        required: false,
        roles: ["adjective"],
        color: "warning",
      },
      {
        key: `${type}Adjective2`,
        label: "Adjective 2",
        labelKey: ADJECTIVE_LABEL_KEY,
        required: false,
        roles: ["adjective"],
        color: "warning",
      },
      {
        key: `${type}Adjective3`,
        label: "Adjective 3",
        labelKey: ADJECTIVE_LABEL_KEY,
        required: false,
        roles: ["adjective"],
        color: "warning",
      },
    ],
  ),
];

export const COMPLEMENT_KEY_SET = new Set<SlotKey>(BOX_COMPLEMENT_TYPES);

// Complement adjective slot keys, mapped back to the complement they modify.
export const COMPLEMENT_ADJECTIVE_TYPE: Partial<Record<SlotKey, ComplementType>> =
  Object.fromEntries(
    BOX_COMPLEMENT_TYPES.flatMap((type) =>
      adjectiveSlots(type).map((key) => [key, type]),
    ),
  );

export const SATELLITE_SLOT_KEYS = new Set<SlotKey>([
  ...adjectiveSlots("subject"),
  ...ADVERB_SLOTS,
  ...MODAL_SLOTS,
  ...MODAL_ADVERB_SLOTS,
  ...adjectiveSlots("directObject"),
  ...BOX_COMPLEMENT_TYPES,
  ...BOX_COMPLEMENT_TYPES.flatMap((type) => adjectiveSlots(type)),
  ...adjectiveSlots("vocative"),
]);

/**
 * Every slot whose box is on the canvas only while its control says so — the satellites above
 * plus the direct object, which carries a control of its own on the verb-phrase dotted ring.
 *
 * The object is deliberately *not* a satellite: it is a core role, so it is offered open by
 * default and stays in the keyboard auto-advance after the verb (both of which key off
 * SATELLITE_SLOT_KEYS). It only shares the satellites' "can be folded away" nature — which is
 * all this set means.
 */
export const REVEALABLE_SLOT_KEYS = new Set<SlotKey>([
  ...SATELLITE_SLOT_KEYS,
  "directObject",
]);

// Collapsible role groups: each dotted ring can be collapsed to show only its main
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
    childKeys: [...ADVERB_SLOTS, ...MODAL_SLOTS, ...MODAL_ADVERB_SLOTS, "verbTense", "verbAspect"],
  },
  {
    label: "Direct Object",
    mainKey: "directObject",
    childKeys: [...adjectiveSlots("directObject"), "directObjectDefiniteness", "verbVoice"],
  },
  ...BOX_COMPLEMENT_TYPES.map((type) => ({
    label: COMPLEMENT_LABELS[type],
    mainKey: type as string,
    childKeys: [
      ...adjectiveSlots(type),
      // The predicative plus the adposition-bearing complements, the cause among them, carry a
      // determiner.
      ...(DETERMINER_COMPLEMENT_TYPES.includes(type) ? [`${type}Definiteness`] : []),
    ],
  })),
  // P11-E8's vocative: its adjectives, and no determiner (the engine says the address bare).
  {
    label: "Vocative",
    mainKey: "vocative",
    childKeys: adjectiveSlots("vocative"),
  },
];

const SUBJECT_ADJECTIVES = new Set<SlotKey>(adjectiveSlots("subject"));
const DIRECT_OBJECT_ADJECTIVES = new Set<SlotKey>(adjectiveSlots("directObject"));
const VOCATIVE_ADJECTIVES = new Set<SlotKey>(adjectiveSlots("vocative"));

export function getActiveSlots(
  transitivity?: Transitivity,
  subjectRole?: GrammaticalRole,
  hasSubjectAdjective?: boolean,
  verbComplements?: ComplementType[],
): SlotConfig[] {
  return ALL_SLOTS.filter((slot) => {
    // The interjection is the period's, not the verb's or the subject's: its box is shown from the
    // card's border toggle, which the canvas asks (see visibleSlotsFor), never by what the clause holds.
    if (slot.key === "interjection") return false;
    // So is the vocative (P11-E8), with its adjectives: the border toggle shows the box.
    if (slot.key === "vocative" || VOCATIVE_ADJECTIVES.has(slot.key)) return false;
    if (slot.key === "directObject") return transitivity !== "intransitive";
    if (DIRECT_OBJECT_ADJECTIVES.has(slot.key))
      return transitivity !== "intransitive";
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

// Where each constituent's word starts on the canvas, in % of the canvas box. Only the words have
// positions of their own: a satellite is always seated on its constituent's orbit (see ringLayout),
// so it goes wherever its word goes. Constituents that start out overlapping are pushed apart by
// the overlap resolver, which grows the canvas when it has to.
export const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  // P09-E47's interjection, before the subject on its row, as it is spoken ("hey, the cat runs"): far
  // enough in that its ring starts inside the canvas's left wall, where the overlap resolver holds it
  // and shoves the subject's ring right to clear it.
  interjection: { x: 9, y: 42 },
  // P11-E8's vocative, spoken after the interjection and before the subject — but outside the clause,
  // so it takes the seat below the subject rather than one on the clause's row: the row keeps its
  // subject, verb and object, the ring yields to them (see useOverlapResolution's `yielding`), and the
  // canvas grows under it. Tidy puts it back in reading order. Measured on *Mom, cat eats mouse*: a seat
  // above the subject (x 10, y 18) ends here too, after pushing through the subject's ring.
  vocative: { x: 10, y: 88 },
  subject: { x: 22, y: 42 },
  verb: { x: 52, y: 42 },
  directObject: { x: 82, y: 42 },
  // Subject complement (predicative) — copular verbs (become/seem/appear) are intransitive, so it
  // reuses the otherwise-empty direct-object region after the verb.
  predicative: { x: 82, y: 42 },
  // Terminus ("to the cat") and the adverbial of manner — parked right of the verb, in the open
  // region an intransitive verb leaves where a direct object would sit.
  terminus: { x: 88, y: 70 },
  manner: { x: 72, y: 70 },
  // The motion complements and the cause — a row below the verb.
  source: { x: 16, y: 80 },
  direction: { x: 34, y: 84 },
  cause: { x: 52, y: 84 },
  route: { x: 66, y: 84 },
  locative: { x: 84, y: 80 },
  // P09-E12b's three: the topic beside the manner it reads next to ("speaks about the cat like the
  // wind"), and the two adjuncts a row further down — the time under the place it follows, the
  // purpose under the cause it follows.
  topic: { x: 58, y: 66 },
  temporal: { x: 76, y: 94 },
  purpose: { x: 40, y: 94 },
  // P13's two: what the object is taken as, beside the object it describes; the companion beside the
  // subject it goes with.
  objectPredicative: { x: 86, y: 36 },
  comitative: { x: 22, y: 66 },
  // P09-E44's role, above the subject it is said of ("the man acts as a friend"), in the row the
  // companion below the subject leaves empty.
  role: { x: 22, y: 18 },
  // P09-E45's opponent, between the companion and the topic: the two co-participants side by side, in
  // the order they read ("plays with the cat against the dog").
  opponent: { x: 40, y: 66 },
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
