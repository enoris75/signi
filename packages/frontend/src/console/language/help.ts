import { applyScript } from "./apply.ts";
import { COMMANDS, commandNamed, type CommandDef } from "./commands.ts";
import { printWords } from "./print.ts";
import type { Vocabulary } from "./types.ts";

/**
 * The console's help pages (`/help rel`): for every command, how it is written, and an example that
 * builds something from an empty period — which the page renders as a sentence, so a user sees the
 * command at work in the interface language. The examples are run by the tests against the words of
 * the vocabulary, so none can go stale.
 */

/**
 * The words a usage line puts where an argument goes — `/subj ( word … )`, `/save name`,
 * `/help [command]` — which the help page takes from the catalogue in the interface language
 * (`console.usage.*`). English by default.
 */
export interface UsageWords {
  word: string;
  name: string;
  command: string;
}

export const USAGE_WORDS: UsageWords = { word: "word", name: "name", command: "command" };

/**
 * How a command is written: its argument, spelled out, in the brackets it takes. Only the placeholders
 * are words; the brackets, `#n.noun` and the values stay as the console reads them.
 */
export function usageOf(def: CommandDef, words: UsageWords = USAGE_WORDS): string {
  const name = `/${def.name}`;
  const action = def.action;
  const { word } = words;
  switch (def.arg.kind) {
    case "none":
      return name;
    case "word":
      // A word of the period always in its bracket; a word inside one bare, or bracketed with what describes it.
      return action.kind === "role" ? `${name} ( ${word} … )` : `${name} ${word} · ${name} ( ${word} … )`;
    case "values":
      return `${name} ${def.arg.values.map((v) => v.name).join("|")}`;
    case "text":
      if (action.kind === "del") return `${name} [subj|obj|adj n|adv|modal n|poss|than|outof|eg|and n|wh|there|humble|rel|headless|num|contrast|approx|if|join|clause|sub|to|so|inst|period]`;
      if (action.kind === "app" && action.app === "help") return `${name} [${words.command}]`;
      return `${name} ${words.name}`;
    case "phrase":
      return action.kind === "possessor"
        ? `${name} ${word} · ${name} [ ${word} … ] · ${name} #n.noun`
        : `${name} ${word} · ${name} [ ${word} … ]`;
    case "link":
      if (action.kind === "relative") return `${name} #n.noun · ${name} subj { … } · ${name} obj { … }`;
      if (action.kind === "join") return `${name} and|or|but|thatis|therefore|then|however #n · { … }`;
      if (action.kind === "subordinate" && action.link === "adverbial")
        return `${name} when|while|because|after|before #n · { … }`;
      return `${name} #n · ${name} { … }`;
  }
}

/**
 * An example for every command, each starting from an empty period, written as the console prints.
 *
 * Every word here must name **one** concept of its slot's roles, or the example cannot be applied and
 * the page falls back to this English line (see `exampleIn`). That rules out a word two concepts
 * share: *child* was one until P11 seeded CHILD_OFFSPRING beside CHILD (en *child*, de *Kind*, fr
 * *enfant*, ja 子供), so the human examples say *man* and the gender ones a *cat*, which has a
 * feminine in every language that marks one.
 */
export const EXAMPLES: Record<string, string> = {
  // Roles
  subj: "/subj ( cat )",
  verb: "/subj ( cat ) /verb ( eat )",
  obj: "/subj ( cat ) /verb ( eat ) /obj ( food )",
  pred: "/subj ( cat ) /verb ( seem ) /pred ( happy )",
  term: "/subj ( man ) /verb ( read ) /obj ( book ) /term ( dog )",
  manner: "/subj ( dog ) /verb ( run ) /manner ( speed )",
  loc: "/subj ( cat ) /verb ( eat ) /loc ( house )",
  dir: "/subj ( dog ) /verb ( run ) /dir ( house )",
  src: "/subj ( dog ) /verb ( run ) /src ( house )",
  route: "/subj ( dog ) /verb ( run ) /route ( house )",
  time: "/subj ( man ) /verb ( run ) /time ( day /this )",
  for: "/subj ( woman ) /verb ( read ) /for ( man )",
  about: "/subj ( woman ) /verb ( think ) /about ( cat )",
  cause: "/subj ( dog ) /verb ( run ) /cause ( cat )",
  inst: "/subj ( man ) /verb ( eat ) /obj ( food ) /inst { /subj ( stick ) }",
  adj: "/subj ( cat /adj brown )",
  adv: "/subj ( dog ) /verb ( run /adv fast )",
  modal: "/subj ( cat ) /verb ( eat /modal can )",
  poss: "/subj ( book /poss [ man /adj old ] )",
  than: "/subj ( cat ) /verb ( seem ) /pred ( big /more /than [ dog ] )",
  outof: "/subj ( cat ) /verb ( seem ) /pred ( big /most /outof [ dog /pl ] )",
  suchas: "/subj ( animal /pl /zero /suchas [ cat ] ) /verb ( run )",
  including: "/subj ( animal /pl /including [ cat ] ) /verb ( run )",
  and: "/subj ( cat /and dog ) /verb ( run )",
  or: "/subj ( cat /or dog ) /verb ( run )",
  bothand: "/subj ( cat /bothand dog ) /verb ( run )",
  // Noun
  sg: "/subj ( cat /sg )",
  pl: "/subj ( cat /pl )",
  masc: "/subj ( cat /masc )",
  fem: "/subj ( cat /fem )",
  neut: "/subj ( 3rd /neut ) /verb ( run )",
  the: "/subj ( cat /the )",
  a: "/subj ( cat /a )",
  zero: "/subj ( cat /pl /zero ) /verb ( run )",
  this: "/subj ( cat /this )",
  that: "/subj ( cat /that )",
  some: "/subj ( cat /pl /some ) /verb ( run )",
  no: "/subj ( dog /no ) /verb ( run )",
  many: "/subj ( cat /pl /many )",
  few: "/subj ( cat /pl /few )",
  all: "/subj ( cat /pl /all ) /verb ( run )",
  each: "/subj ( cat /each ) /verb ( run )",
  every: "/subj ( cat /every ) /verb ( run )",
  both: "/subj ( cat /both ) /verb ( run )",
  mostof: "/subj ( cat /mostof ) /verb ( run )",
  several: "/subj ( cat /several ) /verb ( run )",
  enough: "/subj ( cat ) /verb ( eat ) /obj ( food /enough )",
  such: "/subj ( cat /such ) /verb ( run )",
  rel: "/subj ( man /rel subj { /verb ( love ) /obj ( cat ) } ) /verb ( run )",
  headless: "/subj ( man /rel subj { /verb ( love ) /obj ( cat ) } /headless )",
  gloss: "/subj ( speed /adj big /gloss manner )",
  whole: "/subj ( house /poss [ cat ] /whole )",
  parts: "/subj ( house /poss [ cat /pl ] /parts )",
  owner: "/subj ( house /poss [ cat ] /owner )",
  in: "/subj ( cat ) /verb ( eat ) /loc ( house /in )",
  through: "/subj ( dog ) /verb ( run ) /route ( house /through )",
  under: "/subj ( cat ) /verb ( eat ) /loc ( house /under )",
  over: "/subj ( cat ) /verb ( eat ) /loc ( house /over )",
  around: "/subj ( dog ) /verb ( run ) /route ( house /around )",
  behind: "/subj ( cat ) /verb ( eat ) /loc ( house /behind )",
  front: "/subj ( cat ) /verb ( eat ) /loc ( house /front )",
  on: "/subj ( cat ) /verb ( eat ) /loc ( house /on )",
  between: "/subj ( cat ) /verb ( run ) /loc ( house /between /and dog )",
  against: "/subj ( dog ) /verb ( run ) /loc ( house /against )",
  among: "/subj ( cat ) /verb ( run ) /loc ( house /pl /among )",
  at: "/subj ( man ) /verb ( run ) /time ( day /this /at )",
  ago: "/subj ( man ) /verb ( run ) /time ( moment /a /ago )",
  until: "/subj ( man ) /verb ( run ) /time ( night /until )",
  after: "/subj ( man ) /verb ( run ) /time ( night /after )",
  before: "/subj ( man ) /verb ( run ) /time ( night /before )",
  during: "/subj ( man ) /verb ( run ) /time ( day /during )",
  span: "/subj ( man ) /verb ( run ) /time ( day /span /and night )",
  since: "/subj ( man ) /verb ( run ) /time ( day /this /since )",
  within: "/subj ( man ) /verb ( run ) /time ( day /a /within )",
  lasting: "/subj ( man ) /verb ( run ) /time ( day /a /lasting )",
  because: "/subj ( dog ) /verb ( run ) /cause ( cat /because )",
  fault: "/subj ( dog ) /verb ( run ) /cause ( cat /fault )",
  thanks: "/subj ( dog ) /verb ( run ) /cause ( cat /thanks )",
  notcause: "/subj ( dog ) /verb ( run ) /cause ( cat /notcause )",
  poscause: "/subj ( dog ) /verb ( run ) /cause ( cat /poscause )",
  // Verb
  tense: "/subj ( cat ) /verb ( eat /tense past )",
  aspect: "/subj ( cat ) /verb ( eat /aspect progressive )",
  present: "/subj ( cat ) /verb ( eat /present )",
  past: "/subj ( cat ) /verb ( eat /past )",
  future: "/subj ( cat ) /verb ( eat /future )",
  neutral: "/subj ( cat ) /verb ( eat /neutral )",
  prog: "/subj ( cat ) /verb ( eat /prog )",
  prosp: "/subj ( cat ) /verb ( eat /prosp )",
  result: "/subj ( cat ) /verb ( eat /result )",
  // The voice needs a patient to promote, so its examples give the verb an object.
  voice: "/subj ( cat ) /verb ( eat /voice passive ) /obj ( food )",
  active: "/subj ( cat ) /verb ( eat /active ) /obj ( food )",
  passive: "/subj ( cat ) /verb ( eat /passive ) /obj ( food )",
  not: "/subj ( cat ) /verb ( eat /not )",
  pos: "/subj ( cat ) /verb ( eat /pos )",
  // The humble register (P11-E6), on a subject it lowers: 私はいただきます.
  humble: "/subj ( 1st ) /verb ( eat /humble )",
  // Adjective
  more: "/subj ( cat /adj ( big /more ) ) /verb ( run )",
  most: "/subj ( cat /adj ( big /most ) ) /verb ( run )",
  less: "/subj ( cat /adj ( big /less ) ) /verb ( run )",
  least: "/subj ( cat /adj ( big /least ) ) /verb ( run )",
  equally: "/subj ( cat ) /verb ( seem ) /pred ( happy /equally )",
  plain: "/subj ( cat /adj ( big /plain ) )",
  feature: "/subj ( creator /adj ( phrase /feature ) )",
  purpose: "/subj ( creator /adj ( phrase /purpose ) )",
  material: "/subj ( creator /adj ( phrase /material ) )",
  domain: "/subj ( cat /adj ( house /domain ) )",
  // Period
  new: "/subj ( cat ) /new /subj ( dog )",
  command: "/command lets /verb ( run )",
  inf: "/inf /verb ( eat ) /obj ( food )",
  ask: "/ask /subj ( cat ) /verb ( eat )",
  wh: "/wh loc under /subj ( cat ) /verb ( eat )",
  there: "/there /subj ( cat ) /verb ( be ) /loc ( house )",
  statement: "/command /verb ( eat ) /statement",
  if: "/subj ( dog ) /verb ( run ) /if { /subj ( cat ) /verb ( eat ) }",
  join: "/subj ( dog ) /verb ( run ) /join but { /subj ( cat ) /verb ( eat ) }",
  // P09-E55: the clause of ASK is a question, its gap its own.
  clause: "/subj ( man ) /verb ( ask ) /clause { /wh obj /subj ( cat ) /verb ( eat ) }",
  sub: "/subj ( man ) /verb ( run ) /sub when { /subj ( cat ) /verb ( eat ) }",
  to: "/subj ( cat ) /verb ( need ) /to { /verb ( run ) }",
  level: "/subj ( man ) /verb ( start ) /inst { /verb ( choose ) /obj ( word ) } /level process",
  without: "/subj ( man ) /verb ( start ) /inst { /subj ( word ) } /without",
  posinst: "/subj ( man ) /verb ( start ) /inst { /subj ( word ) } /without /posinst",
  objctl: "/subj ( cat ) /verb ( need ) /obj ( dog ) /to { /verb ( run ) } /objctl",
  objpred: "/subj ( cat ) /verb ( eat ) /obj ( food ) /objpred ( dog )",
  so: "/subj ( cat ) /verb ( eat ) /obj ( food ) /so { /verb ( run ) }",
  goal: "/subj ( cat ) /verb ( run ) /dir ( house /in /goal )",
  num: "/subj ( cat /pl /num 12 ) /verb ( run )",
  contrast: "/subj ( house /that /contrast ) /verb ( run )",
  approx: "/subj ( cat /num 5 /approx ) /verb ( run )",
  with: "/subj ( cat ) /verb ( eat ) /with ( dog )",
  role: "/subj ( man ) /verb ( act ) /role ( friend )",
  vs: "/subj ( cat ) /verb ( play ) /vs ( dog )",
  interj: "/interj ( hey ) /subj ( cat ) /verb ( run )",
  essive: "/verb ( eat ) /obj ( food ) /objpred ( dog /factitive /essive )",
  factitive: "/verb ( eat ) /obj ( food ) /objpred ( dog /factitive )",
  subjctl: "/subj ( cat ) /verb ( need ) /obj ( dog ) /to { /verb ( run ) } /objctl /subjctl",
  del: "/subj ( cat /adj brown ) /del adj",
  edit: "/edit",
  // Workspace
  save: "/save my cats",
  define: "/define CAT",
  load: "/load my cats",
  export: "/export",
  import: "/import",
  lang: "/lang it",
  undo: "/undo",
  redo: "/redo",
  words: "/words",
  help: "/help rel",
  pin: "/subj ( cat ) /verb ( eat ) /pin",
  unpin: "/unpin",
};

/** Whether a command's example builds a phrase (and so renders a sentence), or acts on the app. */
export const buildsPhrase = (def: CommandDef): boolean => def.action.kind !== "app";

export interface HelpPage {
  def: CommandDef;
  usage: string;
  example: string;
}

/** The page for a command named by its name or an alias, with or without the slash. */
export function helpPage(name: string, words: UsageWords = USAGE_WORDS): HelpPage | undefined {
  const def = commandNamed(name.trim().replace(/^[/・／]/, ""));
  if (!def) return undefined;
  return { def, usage: usageOf(def, words), example: EXAMPLES[def.name] ?? `/${def.name}` };
}

/**
 * A command's example as the page shows it: in the words of the interface language, as the source
 * strip and every other printed line write them, so `/subj ( gatto )` sits beside *il gatto*. The
 * examples are written once, in English, which every interface language also reads (see
 * `resolveWord`). Applied from an empty period, they say which concept each word names, and
 * `printWords` writes those words again in `vocab`'s language, keeping the example's own commands
 * and brackets. Applied again, the printed line builds the same phrase; the tests hold every example
 * to that. Where the line does not read — the words have not loaded — the English stands; it is drawn
 * during render, where a throw would take the page down, so it stands then too.
 */
export function exampleIn(example: string, vocab: Vocabulary): string {
  let n = 0;
  try {
    const applied = applyScript({ containers: [{ id: "help", selection: {} }], links: [] }, example, {
      context: { containerId: "help" },
      vocab,
      newId: () => `help-${++n}`,
    });
    return applied.diagnostic ? example : printWords(example, applied.resolved, vocab);
  } catch {
    return example;
  }
}

/** Every command, for the tests that hold each to a page. */
export const HELP_COMMANDS = COMMANDS.map((c) => c.name);
