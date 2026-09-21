import {
  type AbstractionLevel,
  type Aspect,
  type CauseSentiment,
  type CoordConjunction,
  type Definiteness,
  type Degree,
  type ImperativeRegister,
  type ModifierRelation,
  type PathSpecifier,
  type Tense,
  type UiStringKey,
  type Voice,
} from "@signi/shared";
import type { ImperativePerson, SlotConfig, SlotKey } from "../../components/PhraseBuilder/interfaces.ts";
import type { Gender } from "../../components/PhraseBuilder/phraseReducers.ts";

/**
 * The console's commands, declared once.
 *
 * Every command is here: its canonical short name (what the console prints), the long aliases
 * completion also matches (`/plural` finds `/pl`), what it does, what its argument is, and the colour
 * its token wears — the colour of the box it fills, so the two views read as one. The names are
 * English for every interface language (decision 3); the descriptions, purposes and topics come from
 * the UI-string catalogue (A21, B41–B47), and `purpose` stays English only for C21's diagnostics.
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
  | { id: "specifier"; value: PathSpecifier }
  | { id: "sentiment"; value: CauseSentiment }
  | { id: "tense"; value: Tense }
  | { id: "aspect"; value: Aspect }
  | { id: "voice"; value: Voice }
  | { id: "polarity"; value: "positive" | "negative" }
  | { id: "degree"; value: Degree }
  | { id: "relation"; value: ModifierRelation };

export type SettingId = Setting["id"];

export type AppCommand =
  | "save"
  | "load"
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
  | { kind: "set"; id: "tense" | "aspect" | "voice" }
  | { kind: "possessor" }
  | { kind: "conjunct"; conjunction: "and" | "or" }
  | { kind: "relative" }
  | { kind: "condition" }
  | { kind: "join" }
  | { kind: "instrument" }
  | { kind: "level" }
  | { kind: "mood"; mood: "command" | "infinitive" | "statement" }
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
  /** What it sets, for a diagnostic: "/past sets a verb's tense". English, for /localize (C21). */
  purpose?: string;
  /**
   * The same purpose as its help page says it, from the catalogue: an infinitive citation, "to set a
   * verb's tense" (B47). Commands that share a `purpose` share its key.
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
  purpose: string,
  satellites: RegExp,
  reducers: string[],
): CommandDef => ({
  name,
  aliases,
  group,
  description,
  descriptionKey,
  purpose,
  purposeKey: settingPurpose(s),
  color: "setting",
  arg: { kind: "none" },
  action: { kind: "setting", setting: s },
  satellites,
  reducers,
});

// A setting command's purpose in the catalogue: its setting's, except where the command does
// something narrower — /neut sets a pronoun's gender, and /not negates the verb rather than naming a
// polarity (B47).
function settingPurpose(s: Setting): UiStringKey {
  if (s.id === "gender" && s.value === "neut") return "purpose.pronounGender";
  if (s.id === "polarity" && s.value === "negative") return "purpose.negate";
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
  role("cause", [], "cause", "cause", "slot.cause", "warning", /^cause$/),
  {
    name: "inst",
    aliases: ["instrument", "instrumental"],
    group: "role",
    description: "instrumental",
    descriptionKey: "slot.instrumental",
    purpose: "gives the verb an instrument",
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
    purpose: "describes a noun",
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
    purpose: "qualifies a verb or a modal",
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
    purpose: "governs a verb",
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
    purpose: "gives a noun its possessor",
    purposeKey: "purpose.possessor",
    color: "primary",
    arg: { kind: "phrase" },
    action: { kind: "possessor" },
    satellites: /Possessor$/,
    reducers: ["updatePossessor", "setPossessorRef"],
  },
  {
    name: "and",
    aliases: [],
    group: "role",
    description: "coordinate",
    descriptionKey: "satellite.coordination",
    purpose: "coordinates another phrase with a noun",
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
    purpose: "coordinates another phrase with a noun",
    purposeKey: "purpose.conjunct",
    color: "primary",
    arg: { kind: "phrase" },
    action: { kind: "conjunct", conjunction: "or" },
    satellites: /Conjunct$/,
    reducers: ["addConjunct", "updateConjunct", "setNounConjunction"],
  },

  // ── Noun ──────────────────────────────────────────────────────────────────
  setting("sg", ["singular"], "noun", { id: "number", value: "singular" }, "singular", "number.value.singular", "sets a noun’s number", /Number$/, ["setNumber", "setModifierNumber"]),
  setting("pl", ["plural"], "noun", { id: "number", value: "plural" }, "plural", "number.value.plural", "sets a noun’s number", /Number$/, ["setNumber", "setModifierNumber"]),
  setting("masc", ["masculine", "male"], "noun", { id: "gender", value: "masc" }, "masculine", "gender.value.masc", "sets a noun’s gender", /Gender$/, ["setGender"]),
  setting("fem", ["feminine", "female"], "noun", { id: "gender", value: "fem" }, "feminine", "gender.value.fem", "sets a noun’s gender", /Gender$/, ["setGender"]),
  setting("neut", ["neuter"], "noun", { id: "gender", value: "neut" }, "neuter", "gender.value.neut", "sets a pronoun’s gender", /Gender$/, ["setGender"]),
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
    ] as const
  ).map(([name, aliases, value]) =>
    setting(
      name,
      [...aliases],
      "noun",
      { id: "determiner", value },
      value,
      `determiner.name.${value}` as UiStringKey,
      "sets a noun’s determiner",
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
    purpose: "gives a noun a relative clause",
    purposeKey: "purpose.relative",
    color: "primary",
    arg: { kind: "link" },
    action: { kind: "relative" },
    satellites: /Relative$/,
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
      "sets the relation of a place or a route",
      /^(locative|route)$/,
      ["setSpecifier"],
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
      "sets how a cause is felt",
      /^cause$/,
      ["setSentiment"],
    ),
  ),

  // ── Verb ──────────────────────────────────────────────────────────────────
  // A setting named, its value the argument: the family whole in one command, for whoever thinks
  // "the tense" before "the past".
  {
    name: "tense",
    aliases: [],
    group: "verb",
    description: "tense",
    descriptionKey: "satellite.tense",
    purpose: "sets a verb’s tense",
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
    purpose: "sets a verb’s aspect",
    purposeKey: "purpose.aspect",
    color: "setting",
    arg: { kind: "values", values: ASPECT_VALUES, max: 1 },
    action: { kind: "set", id: "aspect" },
    satellites: /^verbAspect$/,
    reducers: ["setAspect"],
  },
  ...(["past", "present", "future"] as const).map((value) =>
    setting(value, [], "verb", { id: "tense", value }, value, `tense.value.${value}` as UiStringKey, "sets a verb’s tense", /^verbTense$/, ["setTense"]),
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
      "sets a verb’s aspect",
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
    purpose: "sets a verb’s voice",
    purposeKey: "purpose.voice",
    color: "setting",
    arg: { kind: "values", values: VOICE_VALUES, max: 1 },
    action: { kind: "set", id: "voice" },
    satellites: /^verbVoice$/,
    reducers: ["setVoice"],
  },
  ...(["active", "passive"] as const).map((value) =>
    setting(value, [], "verb", { id: "voice", value }, value, `voice.value.${value}` as UiStringKey, "sets a verb’s voice", /^verbVoice$/, ["setVoice"]),
  ),
  setting("not", ["negative"], "verb", { id: "polarity", value: "negative" }, "negative", "polarity.value.negative", "negates a verb", /^verbNegative$/, ["setNegative"]),
  setting("pos", ["positive", "affirmative"], "verb", { id: "polarity", value: "positive" }, "positive", "polarity.value.positive", "sets a verb’s polarity", /^verbNegative$/, ["setNegative"]),

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
      "sets an adjective’s degree",
      /Adjective\d?$|^predicative$/,
      ["setDegree"],
    ),
  ),
  ...(["feature", "purpose", "material"] as const).map((value) =>
    setting(
      value,
      [],
      "adjective",
      { id: "relation", value },
      value,
      `modifier.relation.${value}` as UiStringKey,
      "sets how a noun modifier relates to its noun",
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
    reducers: ["setImperative", "setInfinitive"],
  },
  {
    name: "if",
    aliases: ["condition"],
    group: "period",
    description: "if-condition",
    descriptionKey: "clause.conditional",
    purpose: "gives a period its if-condition",
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
    purpose: "coordinates two periods",
    purposeKey: "purpose.join",
    color: "info",
    arg: { kind: "link" },
    action: { kind: "join" },
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
    reducers: ["applyClear", "removePossessor", "clearPossessorRef", "removeConjunct"],
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
  sentiment: "cause",
  tense: "tense",
  aspect: "aspect",
  voice: "voice",
  polarity: "polarity",
  degree: "degree",
  relation: "relation",
};

/** The topic a command is listed under. */
export function topicOf(def: CommandDef): Topic {
  const a = def.action;
  const id: TopicId =
    a.kind === "role"
      ? "words"
      : a.kind === "adjective" || a.kind === "adverb" || a.kind === "modal" || a.kind === "possessor" || a.kind === "relative"
        ? a.kind
        : a.kind === "conjunct"
          ? "coordination"
          : a.kind === "setting"
            ? SETTING_TOPICS[a.setting.id]
            : a.kind === "set"
              ? a.id
              : a.kind === "mood"
                ? "mood"
                : a.kind === "condition" || a.kind === "join" || a.kind === "instrument" || a.kind === "level"
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
