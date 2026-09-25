import { UI_STRINGS, canCoordinateImperative, type CoordConjunction, type LanguageCode, type UiStringKey } from "@signi/shared";
import { COORD_VALUES, LEVEL_VALUES, SUB_VALUES, commandNamed } from "./commands.ts";
import type { Span } from "./types.ts";

/**
 * What the console can say is wrong with a line, each by a code and the values it names.
 *
 * A diagnostic is data — `{ code: 'takesNoWord', args: { command: 'pl' } }` — and only becomes text
 * where it is drawn, so the words it is said in follow the interface language while the tests, the
 * transcript and the prompt hold on to the code (localization C21).
 *
 * **How a code is said.** Each code is one or two *segments*: an entry of the UI-string catalogue
 * (`diagnostic.*`), and the value it names after a colon, outside the phrase — the C14 rule. A value
 * is a command's name, a period's number, a reference, a word as the pickers show it, or a line of
 * the console's syntax, none of which a language changes (P02's decision 3): "Unknown command:
 * /frob", it "Comando sconosciuto: /frob", ja 「不明な命令: /frob」. Two segments are two sentences,
 * joined by the language's full stop: "Unknown value: “soon”. Choose a value: past, present, future".
 * A command's purpose is the one segment that leads with its value, as its help page does: "/more —
 * to set an adjective's degree".
 *
 * **Its English** is the same segments said with each entry's fallback, which is what the prompt
 * shows until the catalogue arrives and what a test reads when it wants the words.
 *
 * The args are what the line named — never English prose — so the text can be put together in any
 * language.
 */

/** The bracket a diagnostic points out: the kind of frame it is, and the command that opened it. */
export interface Nest {
  kind: "period" | "possessor" | "standard" | "examples" | "conjunct" | "element";
  via?: string;
}

/** A word's kind, as a diagnostic names it: "This word is a noun: food". */
export type WordKindName = "noun" | "pronoun" | "adjective" | "nounModifier" | "verb" | "modal" | "adverb";

/** The link a clause refusal is about: a period cannot be *its if-condition* itself. */
export type ClauseRole = "condition" | "coordinate" | "subordinate" | "instrument";

/** The complements a verb licenses, each a box a role command names. */
export type ComplementSlot =
  | "predicative"
  | "terminus"
  | "manner"
  | "locative"
  | "direction"
  | "source"
  | "route"
  // The temporal and the purpose are offered on every verb (ADJUNCT_COMPLEMENT_TYPES), so no verb
  // refuses them; the topic is licensed.
  | "topic"
  | "cause"
  // A verb with no object has nothing to take as something (P13); the comitative goes with any verb.
  | "objectPredicative";

/** A word a command could not reach, and the word of the period that could take it. */
export interface NoTargetArgs {
  command: string;
  /** The closest word before the command, as the pickers show it, and its kind. */
  last?: { word: string; kind: WordKindName };
  /** A word of the period that can take the command, and the role command that names its box. */
  fit?: { word: string; role?: string };
  /** The command was written inside a word's bracket. */
  inElement: boolean;
}

/** One sentence of a diagnostic: a catalogue entry, and the value after its colon — or, `lead`, before a dash. */
export interface Segment {
  key: UiStringKey;
  value?: string;
  lead?: string;
}

const say = (key: UiStringKey, value?: string): Segment => (value === undefined ? { key } : { key, value });
const quote = (text: string) => `“${text}”`;
const names = (values: readonly { name: string }[]) => values.map((v) => v.name).join(", ");

const LEVELS = names(LEVEL_VALUES);
const CONJUNCTIONS = names(COORD_VALUES);
const SUBORDINATORS = names(SUB_VALUES);
// The conjunctions two commands can be joined with (see IMPERATIVE_COORD_CONJUNCTIONS).
const COMMAND_CONJUNCTIONS = names(COORD_VALUES.filter((v) => canCoordinateImperative(v.value as CoordConjunction)));
const VERB_LINE = "/verb ( … )";

/** The bracket a frame is, as the console writes it: `/subj ( … )`, `/poss [ … ]`, `/rel { … }`. */
function bracketOf(nest: Nest): string | undefined {
  if (!nest.via) return undefined;
  const [open, close] = nest.kind === "element" ? ["(", ")"] : nest.kind === "period" ? ["{", "}"] : ["[", "]"];
  return `/${nest.via} ${open} … ${close}`;
}

const closeBracket = (nest: Nest): Segment => say("diagnostic.closeBracket", bracketOf(nest));

// Each code's segments. The parameter is the code's args: a code without one takes none.
const SEGMENTS = {
  // ── Reading the line (parse.ts) ──
  // A closer with nothing open. The console could drop it instead (see the C21 file).
  strayCloser: () => [say("diagnostic.unexpectedBracket")],
  lineStartsWithWord: () => [say("diagnostic.unexpectedWord"), say("diagnostic.typeCommand", "/subj ( … )")],
  strayBracket: () => [say("diagnostic.openBracketWithCommand", "/subj ( … ), /poss [ … ], /rel subj { … }")],
  // Defensive: every token the lexer makes is met before this.
  unexpectedText: () => [say("diagnostic.unexpectedText")],
  commandNameMissing: () => [say("diagnostic.chooseCommand")],
  unknownCommand: (a: { command: string }) => [say("diagnostic.unknownCommand", `/${a.command}`)],
  takesNoWord: (a: { command: string }) => [say("diagnostic.commandAcceptsNoWord", `/${a.command}`)],
  valueNotTaken: (a: { command: string; values: string[]; given: string }) => [
    say("diagnostic.unknownValue", quote(a.given)),
    say("diagnostic.chooseValue", a.values.join(", ")),
  ],
  valueAlreadyGiven: (a: { command: string; max: number; given: string }) => [say("diagnostic.commandHasValue", a.given)],
  conjunctTakesNoReference: (_: { command: string }) => [say("diagnostic.unexpectedReference")],
  wordOrReference: (_: { command: string }) => [say("diagnostic.unexpectedReference")],
  wordInsideBracket: (a: { command: string; word: string; shape: "(" | "[" }) => [
    say("diagnostic.moveWord", `/${a.command} ${a.shape} ${a.word} … ${a.shape === "(" ? ")" : "]"}`),
  ],
  openNewClause: (a: { gap: string }) => [say("diagnostic.openClause", `/rel ${a.gap} { … }`)],
  relativeTakes: () => [say("diagnostic.chooseRelativeClause", "/rel #2.subj, /rel subj { … }, /rel obj { … }")],
  clauseLinkTakes: (a: { command: string }) => [say("diagnostic.choosePeriod", `/${a.command} #2, /${a.command} { … }`)],
  joinTakes: () => [say("diagnostic.chooseConjunction", CONJUNCTIONS)],
  subTakes: () => [say("diagnostic.chooseConjunction", SUBORDINATORS)],

  // ── References (resolve.ts) ──
  referenceStartsWithNumber: () => [say("diagnostic.choosePeriod", "#2, #2.obj")],
  periodsFromOne: () => [say("diagnostic.missingPeriod", "#0")],
  notANoun: (a: { step: string }) => [
    say("diagnostic.unknownNoun", quote(a.step)),
    say("diagnostic.chooseNoun", "subj, obj, pred, loc, …"),
  ],
  // A step past the noun names a noun too — its possessor, or one of its conjuncts.
  notAStep: (a: { step: string }) => [say("diagnostic.unknownNoun", quote(a.step)), say("diagnostic.chooseNoun", "poss, and2, …")],

  // ── Applying it (apply.ts) ──
  periodCommandInBracket: (a: { command: string; via: string }) => [say("diagnostic.closeBracket", `/${a.via} ( … )`)],
  gotoInsideBracket: (a: Nest) => [closeBracket(a)],
  noSuchPeriod: (a: { period: number }) => [say("diagnostic.missingPeriod", `#${a.period}`)],
  noNounThere: (a: { period: number; ref: string }) => [say("diagnostic.missingNoun", a.ref)],
  referenceIncomplete: () => [say("diagnostic.choosePeriod", "#2, #2.obj")],
  nestedRoleNotSubj: (a: Nest) => [closeBracket(a)],
  instrumentAsThing: () => [say("diagnostic.changeLevel", "/level process")],
  objectNeedsVerb: () => [say("diagnostic.chooseVerb", VERB_LINE)],
  takesNoObject: (a: { verb: string }) => [say("diagnostic.verbAcceptsNo.directObject", a.verb)],
  complementNeedsVerb: (_: { command: string }) => [say("diagnostic.chooseVerb", VERB_LINE)],
  takesNoComplement: (a: { verb: string; command: string; slot: ComplementSlot }) => [
    say(`diagnostic.verbAcceptsNo.${a.slot}`, a.verb),
  ],
  ambiguousWord: (a: { text: string; candidates: string[] }) => [say("diagnostic.chooseWord", a.candidates.join(", "))],
  unknownWord: (a: { command: string; text: string }) => [say("diagnostic.unknownWord", quote(a.text))],
  setNeedsValue: (a: { command: string; values: string[] }) => [say("diagnostic.chooseValue", a.values.join(", "))],
  describesAWord: (a: { command: string; role: string; word: string }) => [
    say("diagnostic.moveCommand", `/${a.role} ( ${a.word} … /${a.command} )`),
  ],
  // What the command is for (its help page's purpose), what the closest word is, and where it would go.
  noTarget: (a: NoTargetArgs) => {
    const purposeKey = commandNamed(a.command)?.purposeKey;
    const segments: Segment[] = purposeKey ? [{ key: purposeKey, lead: `/${a.command}` }] : [];
    segments.push(a.last ? say(`diagnostic.wordIs.${a.last.kind}`, a.last.word) : say("diagnostic.missingWord"));
    if (a.fit?.role) segments.push(say("diagnostic.moveCommand", `/${a.fit.role} ( ${a.fit.word} … /${a.command} )`));
    return segments;
  },
  possessorOwnPeriod: (a: { period: number }) => [say("diagnostic.chooseNounInPeriod", `#${a.period}.subj`)],
  possessorNeedsNoun: (a: { period: number }) => [say("diagnostic.chooseNounInPeriod", `#${a.period}.subj`)],
  ownPossessor: () => [say("diagnostic.chooseOtherNoun")],
  relativeNeedsNoun: (a: { period: number }) => [say("diagnostic.chooseNoun", `#${a.period}.subj, #${a.period}.obj`)],
  relativeNounOfPeriod: (a: { period: number }) => [say("diagnostic.chooseNoun", `#${a.period}.subj, #${a.period}.obj`)],
  relativeNeedsClause: () => [say("diagnostic.chooseRelativeClause", "/rel #2.subj, /rel subj { … }")],
  linkInsideNounPhrase: (a: { command: string } & Nest) => [closeBracket(a)],
  imperativeJoin: () => [say("diagnostic.periodIsCommand"), say("diagnostic.chooseConjunction", COMMAND_CONJUNCTIONS)],
  instrumentNeedsVerb: () => [say("diagnostic.chooseVerb", VERB_LINE)],
  takesNoInstrument: (a: { verb: string }) => [say("diagnostic.verbAcceptsNo.instrumental", a.verb)],
  linksWholePeriods: (a: { command: string; period: number }) => [say("diagnostic.choosePeriod", `#${a.period}`)],
  clauseLinkNeedsTarget: (a: { command: string; conjunction?: string }) => {
    const head = `/${a.command}${a.conjunction ? ` ${a.conjunction}` : ""}`;
    return [say("diagnostic.choosePeriod", `${head} #2, ${head} { … }`)];
  },
  levelNeedsValue: () => [say("diagnostic.chooseValue", LEVELS)],
  levelNotTaken: (a: { text: string }) => [say("diagnostic.unknownValue", quote(a.text)), say("diagnostic.chooseValue", LEVELS)],
  moodInNounPhrase: (a: Nest) => [closeBracket(a)],
  moodLocked: () => [say("diagnostic.removeConditionOrCoordination", "/del if, /del join, /del clause, /del sub, /del to")],
  newPeriodInBracket: (a: Nest) => [closeBracket(a)],
  nothingToRemove: () => [say("diagnostic.removeWordOrPeriod", "/del obj, /del adj, /del period")],
  nestedRemovesOnlySubj: (a: Nest) => [closeBracket(a)],
  noAdjectiveToRemove: () => [say("diagnostic.noNounHasAdjective")],
  noSuchAdjective: (a: { index: number }) => [say("diagnostic.missingAdjective", String(a.index))],
  noAdverbToRemove: () => [say("diagnostic.noVerbHasAdverb")],
  noModalToRemove: (a: { index?: number }) =>
    a.index === undefined ? [say("diagnostic.verbHasNoModal")] : [say("diagnostic.missingModal", String(a.index))],
  noPossessorToRemove: () => [say("diagnostic.noNounHasPossessor")],
  noStandardToRemove: () => [say("diagnostic.noAdjectiveHasStandard")],
  noExamplesToRemove: () => [say("diagnostic.noNounHasExamples")],
  noConjunctToRemove: () => [say("diagnostic.noNounIsCoordinated")],
  noSuchConjunct: (a: { index: number }) => [say("diagnostic.missingConjunct", String(a.index))],
  noRelativeToRemove: () => [say("diagnostic.noNounHasRelative")],
  unknownRemoval: (a: { what: string }) => [
    say("diagnostic.unknownValue", quote(a.what)),
    say("diagnostic.chooseValue", "subj, verb, obj, adj, adv, modal, poss, than, and, …, wh, there, rel, if, join, clause, sub, to, inst, period"),
  ],
  removePeriodInBracket: (a: Nest) => [closeBracket(a)],
  linkTargetRemoved: () => [say("diagnostic.missingPeriod")],
  linkSourceRemoved: () => [say("diagnostic.missingPeriod")],
  cantTakeCondition: () => [say("diagnostic.periodAcceptsNoCondition")],
  cantStartCoordination: () => [say("diagnostic.periodAcceptsNoCoordination")],
  // The subordinate clauses (P09-E12 D9): a period folded into another governs none; a clause needs a
  // verb to govern or modify; *that* and *to* need a verb that takes them, and *that* one with no object.
  cantTakeSubordinate: () => [say("diagnostic.periodAcceptsNoSubordinate")],
  subordinateNeedsVerb: () => [say("diagnostic.chooseVerb", VERB_LINE)],
  takesNoContentClause: (a: { verb: string }) => [say("diagnostic.verbAcceptsNo.contentClause", a.verb)],
  takesNoInfinitive: (a: { verb: string }) => [say("diagnostic.verbAcceptsNo.infinitive", a.verb)],
  contentClauseHasObject: () => [say("diagnostic.periodHasObject", "/del obj")],
  joinMoodMismatch: (a: { imperative: boolean }) => [
    say(a.imperative ? "diagnostic.periodIsCommand" : "diagnostic.periodIsStatement"),
    say("diagnostic.chooseOtherPeriod"),
  ],
  instrumentThingHasVerb: () => [say("diagnostic.thatPeriodHasVerb"), say("diagnostic.chooseLevel", "/level process, /level concept")],
  noNounAt: (a: { ref: string }) => [say("diagnostic.missingNoun", a.ref)],
  noInstrumentLink: () => [say("diagnostic.periodHasNo.instrument")],
  noRelativeLink: () => [say("diagnostic.nounHasNo.relative")],
  noInfinitiveLink: () => [say("diagnostic.periodHasNo.subordinate")],
  numeralNotANumber: () => [say("diagnostic.chooseValue", "1, 2, 3 … 24 …")],
  noLinkToRemove: (a: { link: "condition" | "join" | "subordinate" | "instrument" }) => [say(`diagnostic.periodHasNo.${a.link}`)],
  relativeSamePeriod: () => [say("diagnostic.chooseOtherPeriod")],
  relativeGapEmpty: (a: { ref: string }) => [say("diagnostic.missingWord", a.ref)],
  relativeGapTaken: (a: { ref: string }) => [say("diagnostic.nounAlreadyTaken", a.ref)],
  linkCircle: (_: { period: number }) => [say("diagnostic.chooseOtherPeriod")],
  clauseSelf: (_: { role: ClauseRole }) => [say("diagnostic.chooseOtherPeriod")],
  clauseInOtherLink: (a: { period: number }) => [say("diagnostic.periodAlreadyLinked", `#${a.period}`)],
  clauseQuestion: (_: { period: number; role: ClauseRole }) => [
    say("diagnostic.periodIsQuestion"),
    say("diagnostic.chooseOtherPeriod"),
  ],
  clauseCannot: (_: { period: number; role: ClauseRole }) => [say("diagnostic.chooseOtherPeriod")],

  // ── The console's own (usePhraseConsole.ts) ──
  lineNotRead: () => [say("failure.lineNotRead")],
  phraseNotSaved: () => [say("failure.phraseNotSaved")],
  phraseNotLoaded: () => [say("failure.phraseNotLoaded")],
  noSavedPhrase: (a: { name: string }) => [say("diagnostic.unknownPhrase", quote(a.name))],
  noDefinition: (a: { word: string }) => [say("diagnostic.unknownMeaning", quote(a.word))],
};

export type DiagnosticCode = keyof typeof SEGMENTS;

type ArgList<C extends DiagnosticCode> = Parameters<(typeof SEGMENTS)[C]>;

/** What a code names: its args, or nothing for a code that names nothing. */
export type DiagnosticArgs<C extends DiagnosticCode> = ArgList<C> extends [infer A] ? A : Record<string, never>;

/** A diagnostic's identity: its code, and the values it names. */
export type Coded = { [C in DiagnosticCode]: { code: C; args: DiagnosticArgs<C> } }[DiagnosticCode];

/** Something wrong with a line: what it is, and where. `message` is its English, for logs and tests. */
export type Diagnostic = Span & Coded & { message: string };

/** A code with its args. */
export const coded = <C extends DiagnosticCode>(code: C, ...args: ArgList<C>): Coded =>
  ({ code, args: args[0] ?? {} }) as Coded;

/** A code and its args at a span. */
export const diagnosticAt = (span: Span, d: Coded): Diagnostic =>
  ({ from: span.from, to: span.to, code: d.code, args: d.args, message: english(d) }) as Diagnostic;

/** Just the code and the args of a diagnostic, without its span. */
export const codeOf = (d: Coded): Coded => ({ code: d.code, args: d.args }) as Coded;

/** The sentences a diagnostic is said in. */
export function segmentsOf(d: Coded): Segment[] {
  return (SEGMENTS[d.code] as (args: unknown) => Segment[])(d.args);
}

/** Put a diagnostic's sentences together in a language, each entry said by `t`. */
export function sayDiagnostic(d: Coded, t: (key: UiStringKey) => string, language: LanguageCode): string {
  return joinSegments(segmentsOf(d), t, language);
}

/** Segments as text: each entry, its value after a colon (or its lead before a dash), joined by the full stop. */
export function joinSegments(segments: Segment[], t: (key: UiStringKey) => string, language: LanguageCode): string {
  return segments
    .map((s) => (s.lead ? `${s.lead} — ${t(s.key)}` : s.value === undefined ? t(s.key) : `${t(s.key)}: ${s.value}`))
    .join(language === "ja" ? "。" : ". ");
}

/** An entry's English: its fallback. */
export const fallbackOf = (key: UiStringKey): string => UI_STRINGS[key].fallback;

/** A diagnostic's English. */
export function english(d: Coded): string {
  return sayDiagnostic(d, fallbackOf, "en");
}

/** Every code, for the test that holds each one's words. */
export const DIAGNOSTIC_CODES = Object.keys(SEGMENTS) as DiagnosticCode[];

// ── A command's help page: what it would act on at the cursor ────────────────

/**
 * What a command's help page says it would act on where the page was asked from: no word under the
 * cursor, a word it does not act on, or the word it would act on and the value that word holds now.
 * The word is as the pickers show it; the value is its catalogue entry, where there is one.
 */
export type Here =
  | { kind: "nothing" }
  | { kind: "refused"; word: string }
  | { kind: "on"; word: string; now?: { value: string; key?: UiStringKey } };

/**
 * The help page's line for it: "No word is under the cursor", "This word does not accept the command:
 * cat", "Cursor: cat · now singular".
 */
export function sayHere(here: Here, t: (key: UiStringKey) => string): string {
  if (here.kind === "nothing") return t("diagnostic.noWordUnderCursor");
  if (here.kind === "refused") return `${t("diagnostic.wordRefusesCommand")}: ${here.word}`;
  const now = here.now ? ` · ${t("console.now")} ${here.now.key ? t(here.now.key) : here.now.value}` : "";
  return `${t("console.help.cursor")}: ${here.word}${now}`;
}
