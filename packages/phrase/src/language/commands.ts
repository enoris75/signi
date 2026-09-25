import {
  MODIFIER_RELATIONS,
  TEMPORAL_RELATIONS,
  type AbstractionLevel,
  type Aspect,
  type CauseSentiment,
  type CoordConjunction,
  type Definiteness,
  type Degree,
  type ImperativeRegister,
  type ModifierRelation,
  type ObjectPredication,
  type PathSpecifier,
  type TemporalRelation,
  type Tense,
  type UiStringKey,
  type Voice,
} from "@signi/shared";
import type { ImperativePerson, NounGloss, PossessorRole, SlotConfig, SlotKey, SubordinateKind } from "../model/interfaces.ts";
import type { Gender } from "../model/phraseReducers.ts";
import { MODAL_NEGATIVE_FIELDS } from "../model/slots.ts";

/**
 * The console's commands, declared once.
 *
 * Every command is here: its canonical short name (what the console prints), the long aliases
 * completion also matches (`/plural` finds `/pl`), what it does, what its argument is, and the colour
 * its token wears — the colour of the box it fills, so the two views read as one. The names are
 * English for every interface language (decision 3); the descriptions, purposes and topics come from
 * the UI-string catalogue (A21, B41–B47), and so does what a diagnostic says of a command (C21).
 *
 * What a command *does* is its `action`, interpreted by apply.ts; `satellites` and `reducers` say
 * which canvas controls and which phraseReducers it reaches, which is what the coverage test holds
 * the two views to.
 */

/** A token's colour: a box's slot colour, the quiet ink of a setting, or a reference's. */
export type TokenColor = SlotConfig["color"] | "setting" | "ref";

/** A value a setting command sets outright (see apply: settings set, they never toggle). */
export type Setting =
  | { id: "number"; value: "singular" | "plural" }
  | { id: "gender"; value: Gender }
  | { id: "determiner"; value: Definiteness }
  /** A place's, a route's or a direction's relation; `to` is the direction's plain goal (P13). */
  | { id: "specifier"; value: PathSpecifier | "to" }
  | { id: "temporal"; value: TemporalRelation }
  | { id: "sentiment"; value: CauseSentiment }
  | { id: "tense"; value: Tense }
  | { id: "aspect"; value: Aspect }
  | { id: "voice"; value: Voice }
  | { id: "polarity"; value: "positive" | "negative" }
  | { id: "causePolarity"; value: "positive" | "negative" }
  | { id: "degree"; value: Degree }
  | { id: "relation"; value: ModifierRelation }
  /** How a verbless period's subject reads (P13): `plain` is none. */
  | { id: "gloss"; value: NounGloss | "plain" }
  /** What a noun's genitive possessor is to it (P13): its owner, the whole it is part of, its parts. */
  | { id: "possessorRole"; value: PossessorRole | "owner" }
  /** What the object complement says of the object (P13): taken as it, or turned into it. */
  | { id: "predication"; value: ObjectPredication };

export type SettingId = Setting["id"];

export type AppCommand =
  | "save"
  | "load"
  | "define"
  | "export"
  | "import"
  | "lang"
  | "undo"
  | "redo"
  | "words"
  | "help"
  | "edit"
  | "pin"
  | "unpin";

export type Action =
  /** Fill a slot of the period (or of the noun phrase in brackets) — or, with no word, go to it. */
  | { kind: "role"; slot: SlotKey }
  /** The next adjective of the closest noun, or a noun modifier's own. */
  | { kind: "adjective" }
  /** The adverb of the closest verb or modal. */
  | { kind: "adverb" }
  /** The next modal of the closest verb or modal. */
  | { kind: "modal" }
  | { kind: "setting"; setting: Setting }
  /** A setting set to the value its argument names: `/tense past`, `/aspect progressive`. */
  | { kind: "set"; id: "tense" | "aspect" | "voice" | "gloss" }
  | { kind: "possessor" }
  /** What a predicate adjective is compared to: `/than [ dog ]` (P09-E12 D5). */
  | { kind: "standard" }
  | { kind: "conjunct"; conjunction: "and" | "or" }
  | { kind: "relative" }
  /** A demonstrative pointing away from the rest: `/contrast` (P13). */
  | { kind: "contrast" }
  /** A cardinal numeral counting the noun: `/num 24` (P13). */
  | { kind: "numeral" }
  /** The noun's relative clause said alone, its head unspoken: `/headless` (P13). */
  | { kind: "headless" }
  | { kind: "condition" }
  | { kind: "join" }
  /** A subordinate clause (P09-E12 D9): `/clause` its object clause, `/sub` an adverbial one, `/to` its infinitive. */
  | { kind: "subordinate"; link: SubordinateKind }
  | { kind: "instrument" }
  | { kind: "level" }
  /** The instrument denied, or taken back: `/without`, `/posinst` (P09-E2). */
  | { kind: "privative"; negative: boolean }
  /** Whose the infinitive is: the governing clause's object, `/objctl`, or its subject, `/subjctl` (P13). */
  | { kind: "control"; object: boolean }
  | { kind: "mood"; mood: "command" | "infinitive" | "question" | "statement" }
  /** The slot a wh-question asks about, and its who / what: `/wh obj`, `/wh subj who` (P09-E12). */
  | { kind: "question" }
  /** The period made an existential, "there is a cat": `/there` (P09-E12). */
  | { kind: "existential" }
  | { kind: "new" }
  | { kind: "del" }
  | { kind: "app"; app: AppCommand };

/** One value a command takes as its argument: `/join and`, `/command lets`, `/level process`. */
export interface ValueDef {
  name: string;
  aliases?: readonly string[];
  value: string;
  description: string;
  descriptionKey?: UiStringKey;
}

export type ArgSpec =
  | { kind: "none" }
  /** A word of the command's own vocabulary, optional. */
  | { kind: "word" }
  /** A word, a `( … )` phrase, or — for a possessor — a `#reference` to a noun of the period. */
  | { kind: "phrase" }
  /** A `#reference` to a period, or a `( … )` clause made there and then. */
  | { kind: "link" }
  /** Up to `max` of the values: `/level process`, `/command lets instruction`. */
  | { kind: "values"; values: readonly ValueDef[]; max: number }
  | { kind: "text" };

export type CommandGroup = "role" | "noun" | "verb" | "adjective" | "period" | "workspace";

export interface CommandDef {
  name: string;
  aliases: readonly string[];
  group: CommandGroup;
  /** What the completion list says beside the name. English, the fallback for `descriptionKey`. */
  description: string;
  descriptionKey?: UiStringKey;
  /**
   * What it is for, from the catalogue: an infinitive citation, "to set a verb's tense" (B47), which its
   * help page and its misuse diagnostic say after its name ("/past — to set a verb's tense", C21).
   * Commands that do the same thing share one key.
   */
  purposeKey?: UiStringKey;
  color: TokenColor;
  arg: ArgSpec;
  action: Action;
  /** The canvas satellites this command reaches, matched by satellite key (see the coverage test). */
  satellites?: RegExp;
  /** The phraseReducers it calls. */
  reducers?: readonly string[];
}

// ── The catalogue ────────────────────────────────────────────────────────────

const role = (
  name: string,
  aliases: string[],
  slot: SlotKey,
  description: string,
  descriptionKey: UiStringKey,
  color: TokenColor,
  satellites?: RegExp,
): CommandDef => ({
  name,
  aliases,
  group: "role",
  description,
  descriptionKey,
  color,
  arg: { kind: "word" },
  action: { kind: "role", slot },
  satellites,
  reducers: ["applyConceptSelect", "applyClear"],
});

const setting = (
  name: string,
  aliases: string[],
  group: CommandGroup,
  s: Setting,
  description: string,
  descriptionKey: UiStringKey | undefined,
  satellites: RegExp,
  reducers: string[],
): CommandDef => ({
  name,
  aliases,
  group,
  description,
  descriptionKey,
  purposeKey: settingPurpose(s),
  color: "setting",
  arg: { kind: "none" },
  action: { kind: "setting", setting: s },
  satellites,
  reducers,
});

// The polarity controls a `/not` or `/pos` may land on: the verb's own and each modal's.
const POLARITY_SATELLITES = new RegExp(`^(verbNegative|${MODAL_NEGATIVE_FIELDS.join("|")})$`);

// A setting command's purpose in the catalogue: its setting's, except where the command does
// something narrower — /neut sets a pronoun's gender, and /not negates the verb rather than naming a
// polarity (B47).
function settingPurpose(s: Setting): UiStringKey {
  if (s.id === "gender" && s.value === "neut") return "purpose.pronounGender";
  if (s.id === "polarity" && s.value === "negative") return "purpose.negate";
  // The cause's polarity denies the reason rather than the clause, but what it does is still
  // negate, and its affirmative is still a polarity — so it borrows the verb's two purposes
  // rather than asking the catalogue for a pair that would say the same words.
  if (s.id === "causePolarity") return s.value === "negative" ? "purpose.negate" : "purpose.polarity";
  return `purpose.${s.id}`;
}

export const COORD_VALUES: readonly ValueDef[] = [
  { name: "and", value: "and", description: "copulative", descriptionKey: "conjunction.kind.and" },
  { name: "or", value: "or", description: "disjunctive", descriptionKey: "conjunction.kind.or" },
  { name: "but", value: "but", description: "adversative", descriptionKey: "conjunction.kind.but" },
  {
    name: "thatis",
    aliases: ["that_is"],
    value: "that_is",
    description: "explicative",
    descriptionKey: "conjunction.kind.that_is",
  },
  {
    name: "therefore",
    value: "therefore",
    description: "conclusive",
    descriptionKey: "conjunction.kind.therefore",
  },
  { name: "then", value: "then", description: "temporal", descriptionKey: "conjunction.kind.then" },
  { name: "however", value: "however", description: "adversative", descriptionKey: "conjunction.kind.however" },
];

/** The conjunctions `/sub` opens an adverbial clause with (P09-E12 D9), each by the word it spells. */
export const SUB_VALUES: readonly ValueDef[] = (["when", "while", "because", "after", "before", "until", "since", "though", "as"] as const).map(
  (value) => ({ name: value, value, description: value, descriptionKey: `subordinator.value.${value}` as const }),
);

/**
 * The temporal relations whose console command is not the relation's own name, because another
 * command already has it (a command has one name, `BY_NAME`): `/between` is the place's relation, so
 * the time's is `/span` (P09-E20); `/for` is the purpose, so the duration is `/lasting` (P09-E35).
 */
const TEMPORAL_COMMAND_NAME: Partial<Record<TemporalRelation, string>> = { between: "span", for: "lasting" };

/** The name `/del` takes a subordinate link back by, and the command that prints it: one per kind. */
export const SUBORDINATE_NAMES: Record<SubordinateKind, string> = { content: "clause", adverbial: "sub", infinitive: "to", purpose: "so" };

// The readings `/gloss` sets, each named by what the subject reads as (P13).
export const GLOSS_VALUES: readonly ValueDef[] = [
  { name: "plain", value: "plain", description: "a noun phrase", descriptionKey: "category.noun" },
  { name: "dimension", value: "dimension", description: "an adjective's dimension", descriptionKey: "category.adjective" },
  { name: "manner", value: "manner", description: "a manner adverbial", descriptionKey: "slot.manner" },
  { name: "place", aliases: ["locative"], value: "locative", description: "a place adverbial", descriptionKey: "slot.locative" },
  { name: "direction", value: "direction", description: "a direction adverbial", descriptionKey: "slot.direction" },
  { name: "time", aliases: ["temporal"], value: "temporal", description: "a time adverbial", descriptionKey: "slot.temporal" },
];

export const TENSE_VALUES: readonly ValueDef[] = (["past", "present", "future"] as const).map((value) => ({
  name: value,
  value,
  description: value,
  descriptionKey: `tense.value.${value}` as UiStringKey,
}));

export const ASPECT_VALUES: readonly ValueDef[] = (
  [
    ["neutral", ["simple"]],
    ["progressive", ["prog"]],
    ["prospective", ["prosp"]],
    ["resultative", ["result"]],
  ] as const
).map(([value, aliases]) => ({
  name: value,
  aliases,
  value,
  description: value,
  descriptionKey: `aspect.value.${value}` as UiStringKey,
}));

export const VOICE_VALUES: readonly ValueDef[] = [
  { name: "active", value: "active", description: "active", descriptionKey: "voice.value.active" },
  { name: "passive", value: "passive", description: "passive", descriptionKey: "voice.value.passive" },
];

export const PERSON_VALUES: readonly ValueDef[] = [
  { name: "you", value: "2sg", description: "you", descriptionKey: "imperative.person.2sg" },
  { name: "lets", aliases: ["let's"], value: "1pl", description: "let’s", descriptionKey: "imperative.person.1pl" },
  { name: "youall", aliases: ["y'all"], value: "2pl", description: "you all", descriptionKey: "imperative.person.2pl" },
];

export const REGISTER_VALUES: readonly ValueDef[] = [
  { name: "order", aliases: ["request"], value: "request", description: "order", descriptionKey: "imperative.register.request" },
  {
    name: "instruction",
    value: "instruction",
    description: "instruction",
    descriptionKey: "imperative.register.instruction",
  },
];

// The slots a wh-question can ask about, by the role commands' own names, and what it asks for there
// (P09-E12 M6). A value may reuse a command's name: `/wh subj` names the slot, not the command.
export const QUESTION_SLOT_VALUES: readonly ValueDef[] = [
  { name: "subj", aliases: ["subject"], value: "subject", description: "subject", descriptionKey: "slot.subject" },
  { name: "obj", aliases: ["object"], value: "directObject", description: "direct object", descriptionKey: "slot.directObject" },
  { name: "loc", aliases: ["locative", "place"], value: "locative", description: "place", descriptionKey: "slot.locative" },
  { name: "manner", value: "manner", description: "manner", descriptionKey: "slot.manner" },
  { name: "cause", value: "cause", description: "cause", descriptionKey: "slot.cause" },
];

export const QUESTION_ANIMACY_VALUES: readonly ValueDef[] = [
  { name: "who", value: "who", description: "who", descriptionKey: "question.who" },
  { name: "what", value: "what", description: "what", descriptionKey: "question.what" },
];

export const LEVEL_VALUES: readonly ValueDef[] = [
  { name: "process", value: "process", description: "an act in flow", descriptionKey: "instrumental.level.process" },
  { name: "concept", value: "concept", description: "the act named", descriptionKey: "instrumental.level.concept" },
  { name: "object", value: "object", description: "the thing", descriptionKey: "instrumental.level.object" },
];

export const LANGUAGE_VALUES: readonly ValueDef[] = (
  ["en", "it", "fr", "de", "es", "ja", "pt"] as const
).map((code) => ({
  name: code,
  value: code,
  description: code,
  descriptionKey: `language.${code}` as UiStringKey,
}));

export const COMMANDS: readonly CommandDef[] = [
  // ── Roles: take a word; alone they only move the context ──────────────────
  role("subj", ["subject"], "subject", "subject", "slot.subject", "primary"),
  role("verb", [], "verb", "verb", "slot.verb", "secondary"),
  role("obj", ["object"], "directObject", "direct object", "slot.directObject", "success", /^directObject$/),
  role("pred", ["predicative", "complement"], "predicative", "subject complement", "slot.predicative", "warning", /^predicative$/),
  role("term", ["terminus"], "terminus", "terminus", "slot.terminus", "warning", /^terminus$/),
  role("manner", [], "manner", "manner", "slot.manner", "warning", /^manner$/),
  role("loc", ["locative", "place"], "locative", "place", "slot.locative", "warning", /^locative$/),
  role("dir", ["direction"], "direction", "direction", "slot.direction", "warning", /^direction$/),
  role("src", ["source"], "source", "source", "slot.source", "warning", /^source$/),
  role("route", [], "route", "route", "slot.route", "warning", /^route$/),
  // P09-E12b's three boxes. The temporal and the purpose go with any verb; the topic only with the
  // verbs of saying and thinking that license it. `/purpose` is the noun modifier's relation and
  // `/topic` would read as the help's topics, so the purpose is `/for` (alias `benefit`) and the
  // topic `/about`.
  role("time", ["temporal"], "temporal", "time", "slot.temporal", "warning", /^temporal$/),
  role("for", ["benefit"], "purpose", "purpose", "slot.purpose", "warning", /^purpose$/),
  role("about", ["topic"], "topic", "topic", "slot.topic", "warning", /^topic$/),
  role("cause", [], "cause", "cause", "slot.cause", "warning", /^cause$/),
  // P13's two: what the object is taken as or turned into, and the companion — `/objpred` and `/with`.
  role("objpred", ["objectcomplement"], "objectPredicative", "object complement", "slot.objectPredicative", "warning", /^objectPredicative$/),
  role("with", ["comitative"], "comitative", "companion", "slot.comitative", "warning", /^comitative$/),
  {
    name: "inst",
    aliases: ["instrument", "instrumental"],
    group: "role",
    description: "instrumental",
    descriptionKey: "slot.instrumental",
    purposeKey: "purpose.instrument",
    color: "secondary",
    arg: { kind: "link" },
    action: { kind: "instrument" },
    satellites: /^instrumental$/,
  },
  {
    name: "adj",
    aliases: ["adjective"],
    group: "role",
    description: "add an adjective",
    descriptionKey: "category.adjective",
    purposeKey: "purpose.adjective",
    color: "error",
    arg: { kind: "word" },
    action: { kind: "adjective" },
    satellites: /Adjective\d?$/,
    reducers: ["applyConceptSelect", "setModifierAdjective"],
  },
  {
    name: "adv",
    aliases: ["adverb"],
    group: "role",
    description: "adverb",
    descriptionKey: "slot.adverb",
    purposeKey: "purpose.adverb",
    color: "info",
    arg: { kind: "word" },
    action: { kind: "adverb" },
    satellites: /^(modifier|verbModal2?Adverb)$/,
    reducers: ["applyConceptSelect"],
  },
  {
    name: "modal",
    aliases: [],
    group: "role",
    description: "modal",
    descriptionKey: "slot.modal",
    purposeKey: "purpose.modal",
    color: "secondary",
    arg: { kind: "word" },
    action: { kind: "modal" },
    satellites: /^verbModal2?$/,
    reducers: ["applyConceptSelect"],
  },
  {
    name: "poss",
    aliases: ["possessor", "of"],
    group: "role",
    description: "possessor",
    descriptionKey: "slot.possessor",
    purposeKey: "purpose.possessor",
    color: "primary",
    arg: { kind: "phrase" },
    action: { kind: "possessor" },
    satellites: /Possessor$/,
    reducers: ["updatePossessor", "setPossessorRef"],
  },
  {
    // The standard of comparison (P09-E12 D5): a noun phrase in square brackets, like a possessor's,
    // written in the predicate adjective's own bracket after its degree — `/pred ( big /more /than [
    // dog ] )` — or in a noun's, for its compared adjective: `/obj ( cat /adj ( big /more ) /than [ dog
    // ] )` (P09-E50 D5). It is kept, and printed, under any degree; the translator drops it off the ones that
    // take none, as the canvas dims its ring.
    name: "than",
    aliases: ["standard"],
    group: "role",
    description: "standard of comparison",
    descriptionKey: "slot.standard",
    purposeKey: "purpose.standard",
    color: "primary",
    arg: { kind: "phrase" },
    action: { kind: "standard" },
    satellites: /Standard$/,
    reducers: ["updateStandard"],
  },
  {
    // The same field read as a superlative's set (P09-E51 D3): "the biggest *out of the dogs*" — `/pred
    // ( big /most /outof [ dog /pl ] )`. `/of` is the possessor's and `/among` / `/in` are places, so it
    // is named for the English that fits a superlative. Apply reads either name under any degree; the
    // printer writes this one on `most` / `least` and `/than` on the rest.
    name: "outof",
    aliases: ["out_of", "set"],
    group: "role",
    description: "comparison set",
    descriptionKey: "slot.comparisonSet",
    purposeKey: "purpose.comparisonSet",
    color: "primary",
    arg: { kind: "phrase" },
    action: { kind: "standard" },
    satellites: /^predicativeStandard$/,
    reducers: ["updateStandard"],
  },
  {
    name: "and",
    aliases: [],
    group: "role",
    description: "coordinate",
    descriptionKey: "satellite.coordination",
    purposeKey: "purpose.conjunct",
    color: "primary",
    arg: { kind: "phrase" },
    action: { kind: "conjunct", conjunction: "and" },
    satellites: /Conjunct$/,
    reducers: ["addConjunct", "updateConjunct", "setNounConjunction"],
  },
  {
    name: "or",
    aliases: [],
    group: "role",
    description: "coordinate, disjunctive",
    descriptionKey: "conjunction.kind.or",
    purposeKey: "purpose.conjunct",
    color: "primary",
    arg: { kind: "phrase" },
    action: { kind: "conjunct", conjunction: "or" },
    satellites: /Conjunct$/,
    reducers: ["addConjunct", "updateConjunct", "setNounConjunction"],
  },

  // ── Noun ──────────────────────────────────────────────────────────────────
  setting("sg", ["singular"], "noun", { id: "number", value: "singular" }, "singular", "number.value.singular", /Number$/, ["setNumber", "setModifierNumber"]),
  setting("pl", ["plural"], "noun", { id: "number", value: "plural" }, "plural", "number.value.plural", /Number$/, ["setNumber", "setModifierNumber"]),
  setting("masc", ["masculine", "male"], "noun", { id: "gender", value: "masc" }, "masculine", "gender.value.masc", /Gender$/, ["setGender"]),
  setting("fem", ["feminine", "female"], "noun", { id: "gender", value: "fem" }, "feminine", "gender.value.fem", /Gender$/, ["setGender"]),
  setting("neut", ["neuter"], "noun", { id: "gender", value: "neut" }, "neuter", "gender.value.neut", /Gender$/, ["setGender"]),
  ...(
    [
      ["the", ["definite"], "definite"],
      ["a", ["an", "indefinite"], "indefinite"],
      ["zero", ["bare", "none"], "bare"],
      ["this", [], "this"],
      ["that", [], "that"],
      ["some", [], "some"],
      ["no", [], "no"],
      ["many", [], "many"],
      ["few", [], "few"],
      ["all", [], "all"],
      // P09-E25. `/most` is the adjective's superlative degree, so the determiner is `/mostof`.
      ["each", [], "each"],
      ["every", [], "every"],
      ["both", [], "both"],
      ["mostof", ["most_of"], "most"],
      ["several", [], "several"],
      ["enough", [], "enough"],
      ["such", [], "such"],
    ] as const
  ).map(([name, aliases, value]) =>
    setting(
      name,
      [...aliases],
      "noun",
      { id: "determiner", value },
      value,
      `determiner.name.${value}` as UiStringKey,
      /Definiteness$/,
      ["setDefiniteness"],
    ),
  ),
  {
    name: "rel",
    aliases: ["relative", "who", "which"],
    group: "noun",
    description: "relative clause",
    descriptionKey: "satellite.relative",
    purposeKey: "purpose.relative",
    color: "primary",
    arg: { kind: "link" },
    action: { kind: "relative" },
    satellites: /Relative$/,
  },
  // A *this* / *that* pointing at one of a set, away from the rest (P13): THERE is "/subj ( place /that
  // /contrast /gloss place )", "in that place", French "dans ce lieu-là". `/del contrast` takes it back.
  {
    name: "contrast",
    aliases: ["contrastive"],
    group: "noun",
    description: "pointing away from the rest",
    descriptionKey: "determiner.contrast",
    purposeKey: "purpose.contrast",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "contrast" },
    satellites: /Definiteness$/,
    reducers: ["setContrastive"],
  },
  // A cardinal numeral counting the noun (P13): DAY is "/subj ( period /a /poss [ hour /a /num 24 ] /parts )",
  // "a period of 24 hours". `/del num` takes it back.
  {
    name: "num",
    aliases: ["numeral", "count"],
    group: "noun",
    description: "a numeral",
    descriptionKey: "determiner.numeral",
    purposeKey: "purpose.numeral",
    color: "setting",
    arg: { kind: "word" },
    action: { kind: "numeral" },
    satellites: /Definiteness$/,
    reducers: ["setNumeral"],
  },
  // The relative clause said alone, its head unspoken (P13): an adjective's definition is its relative
  // clause, OKAY "that has no problems". The head still picks "who" or "that" and the agreement, so it
  // stays in its box. Written after `/rel` in the head's bracket; `/del headless` says the head again.
  {
    name: "headless",
    aliases: ["alone"],
    group: "noun",
    description: "only the relative clause",
    descriptionKey: "relative.headless",
    purposeKey: "purpose.headless",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "headless" },
    satellites: /Headless$/,
  },
  ...(
    [
      ["in", ["inside"], "in"],
      ["through", [], "through"],
      ["under", [], "under"],
      ["over", ["above"], "over"],
      ["around", [], "around"],
      ["behind", [], "behind"],
      ["front", ["infront", "in_front_of"], "in_front_of"],
      ["on", [], "on"],
      ["between", [], "between"],
      ["against", [], "against"],
      // P09-E32, on a plural or a group: "/loc ( house /pl /among )".
      ["among", [], "among"],
    ] as const
  ).map(([name, aliases, value]) =>
    setting(
      name,
      [...aliases],
      "noun",
      { id: "specifier", value },
      value.replace(/_/g, " "),
      // The adposition the relation is spoken with, as the canvas's toolbar names it (C13).
      `specifier.value.${value}`,
      /^(locative|route|direction)$/,
      ["setSpecifier"],
    ),
  ),
  // The direction's plain goal, "to the house", which its relations (/in "into", /on "onto") leave
  // (P13). `/to` is the infinitive's, so it is `/goal`.
  setting("goal", [], "noun", { id: "specifier", value: "to" }, "to", "slot.direction", /^direction$/, ["setSpecifier"]),
  // What the object is taken as (the essive) or turned into (the factitive), on the object complement
  // (P13): "/verb ( have ) /objpred ( part /zero /essive )" is INCLUDE's "to have as a part". The
  // verb's own is the default: the factitive where it licenses the complement, the essive elsewhere.
  // Named by their grammar: /as is the equative's already (/equally).
  setting("essive", ["takenas"], "noun", { id: "predication", value: "essive" }, "taken as", "predication.value.essive", /^objectPredicative$/, ["setPredication"]),
  setting("factitive", ["into"], "noun", { id: "predication", value: "factitive" }, "turned into", "predication.value.factitive", /^objectPredicative$/, ["setPredication"]),
  // What a noun's genitive possessor is to it (P13), said after the possessor's bracket: "/subj ( part /a
  // /poss [ place /a ] /whole )" is AREA, "a part of a place"; "/parts" FAMILY's "a group of relatives".
  // "/owner" is the default, possession.
  setting("owner", [], "noun", { id: "possessorRole", value: "owner" }, "the possessor owns it", "slot.possessor", /PossessorRole$/, ["setPossessorRole"]),
  setting("whole", [], "noun", { id: "possessorRole", value: "whole" }, "the possessor is the whole it is part of", "possessorRole.value.whole", /PossessorRole$/, ["setPossessorRole"]),
  setting("parts", [], "noun", { id: "possessorRole", value: "parts" }, "the possessor is what it is made of", "possessorRole.value.parts", /PossessorRole$/, ["setPossessorRole"]),
  // The temporal's relation (P09-E12b), as the spatial ones set the place's: "/time ( day /ago )".
  // `/at` is not the determiner `/a`, and none of the six is taken by another command. `between`
  // (P09-E20) is: `/between` sets the place's relation, and a command has one name, so the time's
  // is `/span` — "/time ( day /and night /span )". `/since` (P09-E27) and `/within` (P09-E34) are free;
  // `/for` is the purpose's, so the duration (P09-E35) is `/lasting` — "/time ( hour /lasting )".
  ...TEMPORAL_RELATIONS.map((value) =>
    setting(
      TEMPORAL_COMMAND_NAME[value] ?? value,
      [],
      "noun",
      { id: "temporal", value },
      value,
      // The word the relation is spoken with, as the temporal's toolbar names it.
      `temporal.value.${value}`,
      // …and a time reading's (P13): "/subj ( TIME /this /gloss time /until )".
      /^(temporal|subjectGlossRelation)$/,
      ["setTemporalRelation", "setGlossRelation"],
    ),
  ),
  ...(
    [
      ["because", [], "neutral", "because of"],
      ["fault", ["blame"], "negative", "the fault of"],
      ["thanks", ["thanksto"], "positive", "thanks to"],
    ] as const
  ).map(([name, aliases, value, description]) =>
    setting(
      name,
      [...aliases],
      "noun",
      { id: "sentiment", value },
      description,
      // The connector the stance picks, as the cause's toolbar shows it (C13): "thanks to", "per colpa di".
      `sentiment.connector.${value}`,
      /^cause$/,
      ["setSentiment"],
    ),
  ),

  // The cause's own polarity, a second axis beside the stance: "/notcause" denies the reason
  // ("not because of the dog", "non a causa del cane") without negating the clause, which is
  // what "/not" on the verb does. Either stance can be denied — "not thanks to the dog".
  setting("notcause", ["notbecause", "deny"], "noun", { id: "causePolarity", value: "negative" },
    "not because of", "polarity.value.negative", /^causeNegative$/, ["setCauseNegative"]),
  setting("poscause", ["posbecause"], "noun", { id: "causePolarity", value: "positive" },
    "because of, not denied", "polarity.value.positive", /^causeNegative$/, ["setCauseNegative"]),

  // ── Verb ──────────────────────────────────────────────────────────────────
  // A setting named, its value the argument: the family whole in one command, for whoever thinks
  // "the tense" before "the past".
  // How a verbless period's subject reads when it defines an adjective or an adverb (P13): BIG is
  // "/subj ( SIZE /zero /adj GREAT /gloss dimension )", "of great size". A setting with no command per
  // value — /manner is the manner complement's — so it is written as /gloss and its value.
  {
    name: "gloss",
    aliases: ["reading", "meaning"],
    group: "noun",
    description: "how the subject reads",
    descriptionKey: "gloss.name",
    purposeKey: "purpose.gloss",
    color: "setting",
    arg: { kind: "values", values: GLOSS_VALUES, max: 1 },
    action: { kind: "set", id: "gloss" },
    satellites: /^subjectGloss$/,
    reducers: ["setSubjectGloss"],
  },
  {
    name: "tense",
    aliases: [],
    group: "verb",
    description: "tense",
    descriptionKey: "satellite.tense",
    purposeKey: "purpose.tense",
    color: "setting",
    arg: { kind: "values", values: TENSE_VALUES, max: 1 },
    action: { kind: "set", id: "tense" },
    satellites: /^verbTense$/,
    reducers: ["setTense"],
  },
  {
    name: "aspect",
    aliases: [],
    group: "verb",
    description: "aspect",
    descriptionKey: "satellite.aspect",
    purposeKey: "purpose.aspect",
    color: "setting",
    arg: { kind: "values", values: ASPECT_VALUES, max: 1 },
    action: { kind: "set", id: "aspect" },
    satellites: /^verbAspect$/,
    reducers: ["setAspect"],
  },
  ...(["past", "present", "future"] as const).map((value) =>
    setting(value, [], "verb", { id: "tense", value }, value, `tense.value.${value}` as UiStringKey, /^verbTense$/, ["setTense"]),
  ),
  ...(
    [
      ["neutral", ["simple"], "neutral"],
      ["prog", ["progressive"], "progressive"],
      ["prosp", ["prospective"], "prospective"],
      ["result", ["resultative"], "resultative"],
    ] as const
  ).map(([name, aliases, value]) =>
    setting(
      name,
      [...aliases],
      "verb",
      { id: "aspect", value },
      value,
      `aspect.value.${value}` as UiStringKey,
      /^verbAspect$/,
      ["setAspect"],
    ),
  ),
  {
    name: "voice",
    aliases: [],
    group: "verb",
    description: "voice",
    descriptionKey: "satellite.voice",
    purposeKey: "purpose.voice",
    color: "setting",
    arg: { kind: "values", values: VOICE_VALUES, max: 1 },
    action: { kind: "set", id: "voice" },
    satellites: /^verbVoice$/,
    reducers: ["setVoice"],
  },
  ...(["active", "passive"] as const).map((value) =>
    setting(value, [], "verb", { id: "voice", value }, value, `voice.value.${value}` as UiStringKey, /^verbVoice$/, ["setVoice"]),
  ),
  // Polarity is per word of the verb group, so these reach the verb's own control and each modal's
  // ("/verb ( go /not /modal ( want /not ) )"), exactly as /adv reaches the verb's adverb or a modal's.
  setting("not", ["negative"], "verb", { id: "polarity", value: "negative" }, "negative", "polarity.value.negative", POLARITY_SATELLITES, ["setNegative"]),
  setting("pos", ["positive", "affirmative"], "verb", { id: "polarity", value: "positive" }, "positive", "polarity.value.positive", POLARITY_SATELLITES, ["setNegative"]),

  // ── Adjective ─────────────────────────────────────────────────────────────
  ...(
    [
      ["more", [], "more"],
      ["most", [], "most"],
      ["less", [], "less"],
      ["least", [], "least"],
      ["equally", ["as"], "equally"],
      ["plain", ["base"], "positive"],
    ] as const
  ).map(([name, aliases, value]) =>
    setting(
      name,
      [...aliases],
      "adjective",
      { id: "degree", value },
      value === "positive" ? "positive degree" : `${value} (degree)`,
      // What the degree does to an adjective, as the degree chip says it (C13): cited on BIG, so en
      // "bigger", de "größer". The plain degree adds nothing to say, so it is named instead (B46):
      // "Positive degree", de "Positiv", ja 原級.
      value === "positive" ? "degree.name.positive" : `degree.value.${value}`,
      /Adjective\d?$|^predicative$/,
      ["setDegree"],
    ),
  ),
  ...MODIFIER_RELATIONS.map((value) =>
    setting(
      value,
      [],
      "adjective",
      { id: "relation", value },
      value,
      `modifier.relation.${value}` as UiStringKey,
      /Adjective\d?$/,
      ["setModifierRelation"],
    ),
  ),

  // ── Period ────────────────────────────────────────────────────────────────
  {
    name: "new",
    aliases: ["period"],
    group: "period",
    description: "new period",
    descriptionKey: "action.addPeriodContainer",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "new" },
  },
  {
    name: "command",
    aliases: ["imperative"],
    group: "period",
    description: "command",
    descriptionKey: "imperative.command",
    color: "setting",
    // An addressee and a register: at most one of each.
    arg: { kind: "values", values: [...PERSON_VALUES, ...REGISTER_VALUES], max: 2 },
    action: { kind: "mood", mood: "command" },
    reducers: ["setImperative", "setImperativePerson", "setImperativeRegister"],
  },
  {
    name: "inf",
    aliases: ["infinitive"],
    group: "period",
    description: "infinitive",
    descriptionKey: "infinitive.phrase",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "mood", mood: "infinitive" },
    reducers: ["setInfinitive"],
  },
  // The third mood, the question (P09-E12 M5): "does the cat eat?". Printed under the same `:mood`
  // statement and taken back by /statement, as /command and /inf are.
  {
    name: "ask",
    aliases: ["question", "q"],
    group: "period",
    description: "question",
    descriptionKey: "mood.question",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "mood", mood: "question" },
    reducers: ["setInterrogative"],
  },
  // The slot the question asks about, and whether it asks who or what (P09-E12 M6): `/wh obj`,
  // `/wh subj who`. Said of the period, not inside the slot's bracket — the gap usually holds no word,
  // and the printer writes a noun only when it holds one. Taken back by `/del wh`.
  {
    name: "wh",
    aliases: [],
    group: "period",
    description: "what the question asks about",
    descriptionKey: "mood.question",
    color: "setting",
    arg: { kind: "values", values: [...QUESTION_SLOT_VALUES, ...QUESTION_ANIMACY_VALUES], max: 2 },
    action: { kind: "question" },
    satellites: /Question(Animate)?$/,
    reducers: ["setQuestionRole", "setQuestionAnimate"],
  },
  // The existential, "there is a cat" (P09-E12 M7): a fact of the clause, said of the period after its
  // mood, as /without is though its control sits elsewhere. Taken back by `/del there`.
  {
    name: "there",
    aliases: ["existential"],
    group: "period",
    description: "there is …",
    descriptionKey: "existential.toggle",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "existential" },
    satellites: /^subjectExistential$/,
    reducers: ["setExistential"],
  },
  {
    name: "statement",
    aliases: ["indicative"],
    group: "period",
    description: "statement",
    // The mood it sets, as /command and /inf name theirs (B46): it "Proposizione enunciativa", ja 平叙文.
    descriptionKey: "mood.statement",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "mood", mood: "statement" },
    reducers: ["setImperative", "setInfinitive", "setInterrogative"],
  },
  {
    name: "if",
    aliases: ["condition"],
    group: "period",
    description: "if-condition",
    descriptionKey: "clause.conditional",
    purposeKey: "purpose.condition",
    color: "warning",
    arg: { kind: "link" },
    action: { kind: "condition" },
  },
  {
    name: "join",
    aliases: ["coordinate"],
    group: "period",
    description: "coordination",
    descriptionKey: "action.coordinatePeriod",
    purposeKey: "purpose.join",
    color: "info",
    arg: { kind: "link" },
    action: { kind: "join" },
  },
  // The subordinate clauses (P09-E12 D9). `/that`, `/because` and `/after` are taken or ambiguous, so
  // the object clause is `/clause`, the adverbial one `/sub` with its conjunction (`/sub when #2`, in
  // `/join and #2`'s shape), and the infinitive complement `/to`.
  {
    name: "clause",
    aliases: ["content"],
    group: "period",
    description: "that-clause",
    descriptionKey: "subordinator.value.that",
    purposeKey: "purpose.join",
    color: "error",
    arg: { kind: "link" },
    action: { kind: "subordinate", link: "content" },
  },
  {
    name: "sub",
    aliases: ["adverbial"],
    group: "period",
    description: "adverbial clause",
    descriptionKey: "clause.subordinate",
    purposeKey: "purpose.join",
    color: "error",
    arg: { kind: "link" },
    action: { kind: "subordinate", link: "adverbial" },
  },
  {
    name: "to",
    aliases: ["infcomp"],
    group: "period",
    description: "infinitive complement",
    descriptionKey: "infinitive.phrase",
    purposeKey: "purpose.join",
    color: "error",
    arg: { kind: "link" },
    action: { kind: "subordinate", link: "infinitive" },
  },
  // What the act is for (P13): "/inf /verb ( write ) /obj ( content ) /so { /verb ( load ) /obj ( 3rd ) }"
  // is SAVE's "to write content to load it". Any verb has one; its period is drawn in the infinitive.
  // `/purpose` is the noun modifier's relation, so it is `/so`, as in "so as to".
  {
    name: "so",
    aliases: ["inorder", "soasto"],
    group: "period",
    description: "clause of purpose",
    descriptionKey: "clause.purpose",
    purposeKey: "purpose.join",
    color: "error",
    arg: { kind: "link" },
    action: { kind: "subordinate", link: "purpose" },
  },
  {
    name: "level",
    aliases: ["reification"],
    group: "period",
    description: "instrument level",
    // What its R key on the period is called too.
    descriptionKey: "instrumental.level",
    color: "setting",
    arg: { kind: "values", values: LEVEL_VALUES, max: 1 },
    action: { kind: "level" },
  },
  // The instrument's own polarity, as "/notcause" is the cause's: "/without" denies it — the
  // privative, "cuts without the knife" (P09-E2) — and "/posinst" takes that back. It rides the
  // link, as the level does, so it is said on either period of the pair. The clause stays positive.
  {
    name: "without",
    aliases: ["notinst", "privative"],
    group: "period",
    description: "without the instrument",
    descriptionKey: "polarity.value.negative",
    purposeKey: "purpose.negate",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "privative", negative: true },
  },
  {
    name: "posinst",
    aliases: ["withinst"],
    group: "period",
    description: "with the instrument, not denied",
    descriptionKey: "polarity.value.positive",
    purposeKey: "purpose.polarity",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "privative", negative: false },
  },
  // Whose the infinitive is (P13): the governing clause's object — the causee of a causative, DO "to
  // cause an action to happen" — or, as by default, its subject. On the link, as /without is, so it is
  // said on either period of the pair.
  {
    name: "objctl",
    aliases: ["objectcontrol", "causee"],
    group: "period",
    description: "the object does the infinitive",
    descriptionKey: "slot.directObject",
    purposeKey: "purpose.objectControl",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "control", object: true },
  },
  {
    name: "subjctl",
    aliases: ["subjectcontrol"],
    group: "period",
    description: "the subject does the infinitive",
    descriptionKey: "slot.subject",
    purposeKey: "purpose.objectControl",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "control", object: false },
  },
  {
    name: "del",
    aliases: ["delete", "remove"],
    group: "period",
    description: "remove what the context names",
    // REMOVE, as the canvas's remove controls say it: /del takes a word, a link or the period away,
    // where CLEAR only empties a box. What it removes is its usage line's to say.
    descriptionKey: "action.remove",
    color: "setting",
    arg: { kind: "text" },
    action: { kind: "del" },
    reducers: ["applyClear", "removePossessor", "removeStandard", "clearPossessorRef", "removeConjunct"],
  },
  {
    name: "edit",
    aliases: [],
    group: "period",
    description: "load this period’s source into the prompt",
    // EDIT on the period the cursor is on; the help page says how its source reaches the prompt.
    descriptionKey: "action.editPeriod",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "edit" },
  },

  // ── Workspace ─────────────────────────────────────────────────────────────
  {
    name: "save",
    aliases: [],
    group: "workspace",
    description: "save the workspace",
    descriptionKey: "action.save.tooltip",
    color: "setting",
    arg: { kind: "text" },
    action: { kind: "app", app: "save" },
  },
  {
    name: "load",
    aliases: ["open"],
    group: "workspace",
    description: "load a saved phrase",
    descriptionKey: "action.load.tooltip",
    color: "setting",
    arg: { kind: "text" },
    action: { kind: "app", app: "load" },
  },
  // P13: a concept's definition, opened on the canvas in place of the workspace, as `/load` opens a
  // saved phrase. The definition is a line of this language, so what opens is what the seed says.
  {
    name: "define",
    aliases: ["definition"],
    group: "workspace",
    description: "open a word's definition",
    descriptionKey: "action.define",
    color: "setting",
    arg: { kind: "text" },
    action: { kind: "app", app: "define" },
  },
  {
    name: "export",
    aliases: [],
    group: "workspace",
    description: "export as JSON",
    descriptionKey: "action.export.tooltip",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "export" },
  },
  {
    name: "import",
    aliases: [],
    group: "workspace",
    description: "import JSON",
    descriptionKey: "action.import.tooltip",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "import" },
  },
  {
    name: "lang",
    aliases: ["language"],
    group: "workspace",
    description: "interface language",
    descriptionKey: "language.selector",
    color: "setting",
    arg: { kind: "values", values: LANGUAGE_VALUES, max: 1 },
    action: { kind: "app", app: "lang" },
  },
  {
    name: "undo",
    aliases: [],
    group: "workspace",
    description: "undo",
    descriptionKey: "action.undo",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "undo" },
  },
  {
    name: "redo",
    aliases: [],
    group: "workspace",
    description: "redo",
    descriptionKey: "action.redo",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "redo" },
  },
  {
    name: "words",
    aliases: [],
    group: "workspace",
    description: "words panel",
    descriptionKey: "words.heading",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "words" },
  },
  {
    name: "help",
    aliases: ["?"],
    group: "workspace",
    description: "help",
    descriptionKey: "help.heading",
    color: "setting",
    arg: { kind: "text" },
    action: { kind: "app", app: "help" },
  },
  {
    // A line worth keeping: pinned lines come first when the prompt is empty, and in the ghost.
    name: "pin",
    aliases: [],
    group: "workspace",
    // What the transcript's pin says (B45). Alone it pins the line run before, as its example shows.
    description: "pin this line",
    descriptionKey: "action.pinLine",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "pin" },
  },
  {
    name: "unpin",
    aliases: [],
    group: "workspace",
    description: "unpin this line",
    descriptionKey: "action.unpinLine",
    color: "setting",
    arg: { kind: "none" },
    action: { kind: "app", app: "unpin" },
  },
];

const BY_NAME = new Map<string, CommandDef>(COMMANDS.map((c) => [c.name, c]));
const BY_ALIAS = new Map<string, CommandDef>(
  COMMANDS.flatMap((c) => c.aliases.map((a) => [a, c] as const)),
);

/** The command a name or an alias stands for. */
export function commandNamed(name: string): CommandDef | undefined {
  const key = name.toLowerCase();
  return BY_NAME.get(key) ?? BY_ALIAS.get(key);
}

/** The value of a values argument a word names, by name or alias. */
export function valueNamed(values: readonly ValueDef[], word: string): ValueDef | undefined {
  const key = word.toLowerCase();
  return values.find((v) => v.name === key || v.aliases?.includes(key));
}

// ── Topics ───────────────────────────────────────────────────────────────────

/**
 * What a command is about — its tense, a noun's number, the links between periods — which is how the
 * list and the reference order and head the commands. A setting's shortcuts sit with the command that
 * names the setting: `/past` under *tense*, after `/tense`.
 */
export type TopicId =
  | "words"
  | "adjective"
  | "number"
  | "gender"
  | "determiner"
  | "place"
  | "time"
  | "predication"
  | "cause"
  | "possessor"
  | "relative"
  | "coordination"
  | "modal"
  | "adverb"
  | "tense"
  | "aspect"
  | "voice"
  | "polarity"
  | "degree"
  | "relation"
  | "gloss"
  | "mood"
  | "links"
  | "period"
  | "workspace";

export interface Topic {
  id: TopicId;
  /** English, the fallback for `labelKey`. */
  label: string;
  labelKey?: UiStringKey;
  /** The part of the reference it is listed in. */
  part: CommandGroup;
}

/** Every topic, in the order the list and the reference give them. */
export const TOPICS: readonly Topic[] = [
  { id: "words", label: "the period's words", labelKey: "console.topic.words", part: "role" },
  { id: "adjective", label: "adjective", labelKey: "category.adjective", part: "noun" },
  { id: "number", label: "number", labelKey: "satellite.number", part: "noun" },
  { id: "gender", label: "gender", labelKey: "satellite.gender", part: "noun" },
  { id: "determiner", label: "determiner", labelKey: "satellite.determiner", part: "noun" },
  { id: "place", label: "spatial relationship", labelKey: "console.topic.place", part: "noun" },
  // The temporal's relation, headed by the box it sets, as the cause's stance is by the cause.
  { id: "time", label: "temporal", labelKey: "slot.temporal", part: "noun" },
  { id: "predication", label: "object complement", labelKey: "slot.objectPredicative", part: "noun" },
  { id: "cause", label: "cause", labelKey: "slot.cause", part: "noun" },
  { id: "possessor", label: "possessor", labelKey: "slot.possessor", part: "noun" },
  { id: "relative", label: "relative clause", labelKey: "satellite.relative", part: "noun" },
  { id: "coordination", label: "coordination", labelKey: "satellite.coordination", part: "noun" },
  { id: "modal", label: "modal", labelKey: "slot.modal", part: "verb" },
  { id: "adverb", label: "adverb", labelKey: "slot.adverb", part: "verb" },
  { id: "tense", label: "tense", labelKey: "satellite.tense", part: "verb" },
  { id: "aspect", label: "aspect", labelKey: "satellite.aspect", part: "verb" },
  { id: "voice", label: "voice", labelKey: "satellite.voice", part: "verb" },
  { id: "polarity", label: "polarity", labelKey: "satellite.polarity", part: "verb" },
  { id: "degree", label: "degree", labelKey: "modifier.degree", part: "adjective" },
  { id: "relation", label: "relation", labelKey: "modifier.relation", part: "adjective" },
  { id: "gloss", label: "meaning", labelKey: "gloss.name", part: "noun" },
  { id: "mood", label: "mood", labelKey: "console.topic.mood", part: "period" },
  { id: "links", label: "linked periods", labelKey: "console.topic.links", part: "period" },
  { id: "period", label: "the period", labelKey: "console.topic.period", part: "period" },
  { id: "workspace", label: "workspace", labelKey: "console.topic.workspace", part: "workspace" },
];

const SETTING_TOPICS: Record<SettingId, TopicId> = {
  number: "number",
  gender: "gender",
  determiner: "determiner",
  specifier: "place",
  temporal: "time",
  sentiment: "cause",
  tense: "tense",
  aspect: "aspect",
  voice: "voice",
  polarity: "polarity",
  causePolarity: "cause",
  degree: "degree",
  relation: "relation",
  gloss: "gloss",
  possessorRole: "possessor",
  predication: "predication",
};

/** The topic a command is listed under. */
export function topicOf(def: CommandDef): Topic {
  const a = def.action;
  // The standard sits with the degree it depends on: no degree that compares, no standard.
  if (a.kind === "standard") return TOPICS.find((t) => t.id === "degree")!;
  const id: TopicId =
    a.kind === "role"
      ? "words"
      : a.kind === "adjective" || a.kind === "adverb" || a.kind === "modal" || a.kind === "possessor" || a.kind === "relative"
        ? a.kind
        : a.kind === "headless"
          ? "relative"
          : a.kind === "numeral" || a.kind === "contrast"
            ? "determiner"
        : a.kind === "conjunct"
          ? "coordination"
          : a.kind === "setting"
            ? SETTING_TOPICS[a.setting.id]
            : a.kind === "set"
              ? a.id
              : a.kind === "mood" || a.kind === "question" || a.kind === "existential"
                ? "mood"
                : a.kind === "condition" || a.kind === "join" || a.kind === "subordinate" || a.kind === "instrument" || a.kind === "level" || a.kind === "privative" || a.kind === "control"
                  ? "links"
                  : a.kind === "new" || a.kind === "del" || (a.kind === "app" && a.app === "edit")
                    ? "period"
                    : "workspace";
  return TOPICS.find((t) => t.id === id)!;
}

/** Where a command stands in its topic's order: the list's and the reference's. */
export const topicRank = (def: CommandDef): number => TOPICS.indexOf(topicOf(def));

/**
 * The long form a command is a shortcut for, where its setting has a command of its own:
 * `/past` → `/tense past`, `/prog` → `/aspect progressive`.
 */
export function shortcutOf(def: CommandDef): string | undefined {
  const a = def.action;
  if (a.kind !== "setting") return undefined;
  const named = COMMANDS.find((c) => c.action.kind === "set" && c.action.id === a.setting.id);
  if (named?.arg.kind !== "values") return undefined;
  const value = named.arg.values.find((v) => v.value === a.setting.value);
  return value ? `/${named.name} ${value.name}` : undefined;
}

/**
 * How the printer writes a setting: its own command (`/past`), or — for a setting whose values have
 * none, `/gloss` — its `set` command and the value's name (`/gloss dimension`).
 */
export function settingWords(s: Setting): { command: string; value?: string } {
  const own = COMMANDS.find(
    (c) => c.action.kind === "setting" && c.action.setting.id === s.id && c.action.setting.value === s.value,
  );
  if (own) return { command: `/${own.name}` };
  const named = COMMANDS.find((c) => c.action.kind === "set" && c.action.id === s.id);
  const value = named?.arg.kind === "values" ? named.arg.values.find((v) => v.value === s.value) : undefined;
  if (!named || !value) throw new Error(`no command sets ${s.id} to ${String(s.value)}`);
  return { command: `/${named.name}`, value: value.name };
}

/** The command that sets a setting to a value — what the printer writes for it. */
export function settingCommand(s: Setting): CommandDef {
  const hit = COMMANDS.find(
    (c) => c.action.kind === "setting" && c.action.setting.id === s.id && c.action.setting.value === s.value,
  );
  if (!hit) throw new Error(`no command sets ${s.id} to ${String(s.value)}`);
  return hit;
}

/** The role command that fills a slot of the period. */
export function roleCommand(slot: SlotKey): CommandDef | undefined {
  return COMMANDS.find((c) => c.action.kind === "role" && c.action.slot === slot);
}

export function commandByAction(kind: Action["kind"]): CommandDef {
  const hit = COMMANDS.find((c) => c.action.kind === kind);
  if (!hit) throw new Error(`no command for ${kind}`);
  return hit;
}

export type { AbstractionLevel, CoordConjunction, ImperativePerson, ImperativeRegister };
