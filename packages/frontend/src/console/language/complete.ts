import {
  canCoordinateImperative,
  type Concept,
  type UiStringKey,
} from "@signi/shared";
import { isInstrumentalLink, type NounKey, type SlotKey } from "../../components/PhraseBuilder/interfaces.ts";
import {
  canBeCondition,
  canBeCoordinate,
  canBeSubordinate,
  canBeInstrument,
  canBeRelativeTarget,
  canStartCondition,
  canStartCoordination,
  canStartSubordinate,
} from "../../components/PhraseBuilder/linkRules.ts";
import { BOX_COMPLEMENT_TYPES } from "../../components/PhraseBuilder/slots.ts";
import { applyScript, roleRefusal, type Frame, type NounFrameKind } from "./apply.ts";
import {
  COMMANDS,
  COORD_VALUES,
  SUB_VALUES,
  commandNamed,
  shortcutOf,
  topicOf,
  topicRank,
  valueNamed,
  type CommandDef,
  type SettingId,
  type TokenColor,
  type ValueDef,
} from "./commands.ts";
import { sameKind, takesConjunction } from "./parse.ts";
import { CLOSER, lex, type Shape, type Token } from "./lex.ts";
import {
  NOUN_NAMES,
  PRONOUN_NAMES,
  printRef,
  printWord,
  wordSpecFor,
  wordsFor,
  type WordSpec,
} from "./resolve.ts";
import type { ConsoleContext, Vocabulary, WorkspaceState } from "./types.ts";
import {
  adjectiveTarget,
  attachesToWord,
  currentSetting,
  takes,
  wordInfo,
  type WordInfo,
} from "./words.ts";

/**
 * Completion at the caret: every candidate for the token being typed, best first, and the ghost —
 * the single best completion, drawn faintly after the caret.
 *
 * It reads the same tokens the parser does, and applies the line up to the token to know where the
 * command would attach, so what it offers is exactly what the line would accept there: the commands
 * the closest word can take, the words of the role being filled, the values a command allows, the
 * periods and nouns the link rules let a link reach. It is pure and synchronous over the vocabulary
 * the pickers already hold, so it runs on every keystroke.
 */

export type CandidateKind = "command" | "word" | "value" | "ref" | "phrase" | "history";

export interface Candidate {
  kind: CandidateKind;
  /** What replaces the completed range. */
  insert: string;
  /** A bracket's close, set after the caret when the candidate opens one: `subj {` then `}`. */
  close?: string;
  /** The row's main text. */
  label: string;
  /** What it means, in English (the fallback for `detailKey`). */
  detail?: string;
  /** Or, for a detail made of two names, one key each, shown in order: "new clause · Subject". */
  detailKey?: UiStringKey | readonly UiStringKey[];
  /**
   * What follows the rendered `detailKey`, outside the phrase (the C14 rule): the period a reference
   * reaches, numbering the name as the console's header does ("Period 2"), or the word the row is
   * about, cited after the role it takes in it ("Subject: cat").
   */
  detailValue?: { period: number } | { word: string };
  /** A line from history that was pinned. */
  pinned?: boolean;
  /** For a setting: the value the word holds now, which the row shows as "now …". */
  current?: { value: string; key?: UiStringKey };
  /** The alias the query matched, when it was not the name, which the row shows as "alias /plural". */
  alias?: string;
  /** For a command: what it is about, which heads it in the list — `tense`. */
  topic?: string;
  topicKey?: UiStringKey;
  /** The long form a shortcut stands for: `/past` is `/tense past`. */
  shortcut?: string;
  concept?: Concept;
  /** 1–9 on a numbered reference, which a digit picks. */
  number?: number;
  color?: TokenColor;
}

export interface Completion {
  /** The range the chosen candidate replaces. */
  from: number;
  to: number;
  candidates: Candidate[];
  /** The rest of the best candidate, drawn after the caret; ⇥ or → takes it. */
  ghost?: string;
  /** The list's heading: what it holds, in English, the fallback for `titleKey`. */
  title: string;
  /** Or, for a list holding two kinds of rows, one title per kind, shown in order: "pinned lines · recent lines". */
  titleKey?: UiStringKey | readonly UiStringKey[];
  /** The word the list is about, which the heading shows after it: "commands · *cat*", "values · /tense". */
  about?: string;
  /** Whether the list opens by itself here, rather than on ⇥. */
  auto: boolean;
  /** Commands listed topic by topic, each topic headed — the whole list, before anything is typed. */
  topics?: boolean;
}

export interface CompleteOptions {
  context: ConsoleContext;
  vocab: Vocabulary;
  /** Command names used recently this session, most recent first — they rank higher. */
  recent?: readonly string[];
  /** Lines run earlier, newest first — the ghost falls back on them. */
  history?: readonly string[];
  /** Lines pinned, first offered on an empty prompt and first in the ghost. */
  pinned?: readonly string[];
  /**
   * More names for a command, in the interface language (its description there: `plurale`,
   * `soggetto`). They find the command; choosing it writes its English name, so a line reads the
   * same in every interface language.
   */
  aliases?: ReadonlyMap<string, readonly string[]>;
  /** The names of the saved phrases, for `/load`. */
  saved?: readonly string[];
}

/** The list renders at most this many rows. */
const MAX_ROWS = 50;

// ── Ranking ──────────────────────────────────────────────────────────────────

/**
 * How well a name matches what was typed: exact, a prefix, the start of one of its words, or its
 * letters in order. Lower is better; undefined is no match.
 */
function matchClass(query: string, name: string): number | undefined {
  const q = fold(query);
  const n = fold(name);
  if (!q) return 1;
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(/[\s_-]+/).some((part) => part.startsWith(q))) return 3;
  let i = 0;
  for (const ch of n) if (ch === q[i]) i++;
  return i === q.length ? 4 : undefined;
}

/** Lower case, accents off: what two spellings of one word have in common. */
export const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

// ── Where the caret is ───────────────────────────────────────────────────────

interface Site {
  /** The token the caret is in or just after, when it is in or after one. */
  token?: Token;
  /** The command token owning the argument at the caret, if the caret is in an argument position. */
  owner?: { token: Extract<Token, { kind: "command" }>; def?: CommandDef };
  /** Tokens between the owner and the caret (a gap word, a conjunction). */
  between: Token[];
}

export function complete(
  text: string,
  caret: number,
  state: WorkspaceState,
  opts: CompleteOptions,
): Completion | undefined {
  // An empty prompt offers lines, not commands: the pinned ones, then the recent.
  if (!text.trim()) {
    const lines = lineCompletion(text, opts);
    if (lines) return lines;
  }
  const c = completeAt(text, caret, state, opts);
  // Where nothing in the language continues what was typed, a pinned line or an earlier one may.
  if (c && !c.ghost && caret === text.length && text.trim())
    c.ghost = historyGhost(text, [...(opts.pinned ?? []), ...(opts.history ?? [])]);
  return c;
}

/** The lines a user may want again: every pinned line, then the recent ones not pinned. */
function lineCompletion(text: string, opts: CompleteOptions): Completion | undefined {
  const pinned = opts.pinned ?? [];
  const recent = (opts.history ?? []).filter((l) => !pinned.includes(l)).slice(0, 10);
  if (pinned.length + recent.length === 0) return undefined;
  const row = (line: string, isPinned: boolean): Candidate => ({
    kind: "history",
    insert: line,
    label: line,
    detail: isPinned ? "pinned" : "recent",
    detailKey: isPinned ? "console.line.pinned" : "console.line.recent",
    pinned: isPinned,
  });
  // Headed by what it holds: the pinned lines, the recent ones, or both, each title for its own rows.
  const kinds = [
    ...(pinned.length ? [{ title: "pinned lines", key: "console.list.pinned" as const }] : []),
    ...(recent.length ? [{ title: "recent lines", key: "console.list.recent" as const }] : []),
  ];
  return {
    from: 0,
    to: text.length,
    candidates: [...pinned.map((l) => row(l, true)), ...recent.map((l) => row(l, false))].slice(0, MAX_ROWS),
    title: kinds.map((k) => k.title).join(" · "),
    titleKey: kinds.length === 1 ? kinds[0]!.key : kinds.map((k) => k.key),
    auto: false,
  };
}

function completeAt(
  text: string,
  caret: number,
  state: WorkspaceState,
  opts: CompleteOptions,
): Completion | undefined {
  const tokens = lex(text);
  // The token the caret touches — in it, or at its end — is the one being completed.
  const at = tokens.find((t) => caret > t.from && caret <= t.to);
  const before = tokens.filter((t) => t.to <= (at ? at.from : caret));
  const prefixEnd = at ? at.from : caret;

  // Apply everything before the token, to know where it attaches.
  const applied = applyScript(state, text.slice(0, prefixEnd), {
    context: opts.context,
    vocab: opts.vocab,
    newId: previewIds(),
  });
  const frame = applied.frames.at(-1)!;
  const now = applied.state;

  // The word that opens a word's bracket, or a phrase's: `/subj ( ca`, `/poss [ `.
  const leadOpen =
    at?.kind === "word" ? tokens[tokens.indexOf(at) - 1] : at?.kind === "open" && caret === at.to ? at : !at ? before.at(-1) : undefined;
  const lead = leadOpen?.kind === "open" ? leadOwner(tokens, tokens.indexOf(leadOpen)) : undefined;
  if (lead) {
    const parent = applied.frames.at(-2) ?? frame;
    const spec = leadSpec(lead, parent, now);
    if (spec) {
      const from = at?.kind === "word" ? at.from : caret;
      const to = at?.kind === "word" ? at.to : caret;
      const query = at?.kind === "word" ? text.slice(at.from, caret) : "";
      return wordCompletion(from, to, query, spec, opts, titleForSpec(spec, lead), lead.color);
    }
  }

  // A command being typed: `/`, `/pa`.
  if (at?.kind === "command") {
    return commandCompletion(at.from, at.to, text.slice(at.from + 1, caret), frame, now, opts);
  }
  // A reference being typed: `#`, `#2.`.
  if (at?.kind === "ref") {
    const owner = ownerOf(before);
    return refCompletion(at.from, at.to, text.slice(at.from + 1, caret), owner?.def, frame, now, opts);
  }
  // An argument, or a word with no command before it. A caret on a bracket is between items.
  const owner = at?.kind === "open" || at?.kind === "close" ? undefined : ownerOf(before);
  const wordFrom = at?.kind === "word" ? at.from : caret;
  const wordTo = at?.kind === "word" ? at.to : caret;
  const query = at?.kind === "word" ? text.slice(at.from, caret) : "";
  const betweenWords = owner ? before.filter((t) => t.from > owner.token.from) : [];

  if (owner?.def) {
    const def = owner.def;
    const arg = def.arg.kind;
    // After an argument already given — the caret past it and a space — what follows is a new
    // command: a word's, a possessor's or a conjunct's word, or as many values as the command takes.
    const given = betweenWords.flatMap((t) => (t.kind === "word" ? t.text.split(/\s+/) : []));
    const phraseWord = def.action.kind === "possessor" || def.action.kind === "standard" || def.action.kind === "conjunct";
    const argumentDone =
      !at &&
      (arg === "none" ||
        ((arg === "word" || arg === "text" || (arg === "phrase" && phraseWord)) && betweenWords.length > 0) ||
        (def.arg.kind === "values" && given.length >= def.arg.max));
    if (!argumentDone && arg !== "none")
      return argumentCompletion(def, wordFrom, wordTo, query, betweenWords, frame, now, opts, text, caret);
  }
  if (at?.kind === "word") return didYouMean(at.from, at.to, query, frame, now, opts);
  // Between items: ⇥ offers the commands, and — inside an open bracket — the bracket's close.
  const c = commandCompletion(caret, caret, "", frame, now, opts, true);
  const open = innermostOpen(tokens.filter((t) => t.to <= caret));
  if (open && caret === text.length) c.ghost = `${text.endsWith(" ") ? "" : " "}${CLOSER[open]}`;
  return c;
}

/** The command whose word may open the bracket at `index`: a word command's, a possessor's, a conjunct's. */
function leadOwner(tokens: Token[], index: number): CommandDef | undefined {
  const owner = tokens[index - 1];
  if (tokens[index]?.kind !== "open" || owner?.kind !== "command") return undefined;
  const def = commandNamed(owner.name);
  return def && (def.arg.kind === "word" || def.arg.kind === "phrase") ? def : undefined;
}

/** The words that may open a bracket: the role's, the adjective's, the possessor's… */
function leadSpec(def: CommandDef, parent: Frame, state: WorkspaceState): WordSpec | undefined {
  const action = def.action;
  if (action.kind === "possessor") return wordSpecFor("subject", "possessor");
  if (action.kind === "standard") return wordSpecFor("subject", "standard");
  if (action.kind === "conjunct") return wordSpecFor("subject", "conjunct");
  return wordSpecForCommand(def, parent, frameWords(parent, state));
}

/** The noun phrase a frame is part of, for the words a role takes there: a word's bracket is its phrase's. */
const nounFrame = (frame: Frame): NounFrameKind => (frame.kind === "element" ? "period" : frame.kind);

/** Deterministic ids for a line's preview — the same keystroke always makes the same periods. */
export function previewIds(): () => string {
  let n = 0;
  return () => `preview-${++n}`;
}

/** The command whose argument the caret is in: the last command token, if nothing but its argument follows it. */
function ownerOf(before: Token[]): Site["owner"] {
  for (let i = before.length - 1; i >= 0; i--) {
    const t = before[i]!;
    if (t.kind === "command") return { token: t, def: commandNamed(t.name) };
    if (t.kind !== "word") return undefined;
  }
  return undefined;
}

/** The shape of the innermost bracket still open after `tokens`, if any. */
function innermostOpen(tokens: Token[]): Shape | undefined {
  const open: Shape[] = [];
  for (const t of tokens) {
    if (t.kind === "open") open.push(t.shape);
    else if (t.kind === "close") open.pop();
  }
  return open.at(-1);
}

function historyGhost(text: string, history: readonly string[] | undefined): string | undefined {
  const line = history?.find((h) => h.startsWith(text) && h.length > text.length);
  return line?.slice(text.length);
}

/** The ghost for a range: the rest of the best candidate, when it continues what was typed. */
function ghostFor(typed: string, best: Candidate | undefined): string | undefined {
  if (!best || !typed) return undefined;
  if (!best.insert.toLowerCase().startsWith(typed.toLowerCase())) return undefined;
  const rest = best.insert.slice(typed.length);
  return rest || undefined;
}

// ── Commands ─────────────────────────────────────────────────────────────────

/** The words written in a frame, newest first — what an attaching command would look through. */
function frameWords(frame: Frame, state: WorkspaceState): WordInfo[] {
  return [...frame.words]
    .reverse()
    .map((ref) => wordInfo(state.containers, ref))
    .filter((w): w is WordInfo => Boolean(w));
}

/**
 * Whether a command may be written where `frame` is open — what the list offers there. A word's
 * bracket takes what describes its words, a period what belongs to a period.
 */
export function commandFits(def: CommandDef, frame: Frame, state: WorkspaceState, opts: CompleteOptions): boolean {
  return commandGroup(def, frame, state, frameWords(frame, state), opts) !== undefined;
}

/** Where a command stands in the list before any is typed: the closest word's first, then the rest. */
function commandGroup(def: CommandDef, frame: Frame, state: WorkspaceState, words: WordInfo[], opts: CompleteOptions): number | undefined {
  const action = def.action;
  const top = frame.words.length === 0 || frame.kind === "period";
  if (attachesToWord(action)) {
    const i = words.findIndex((w) => takes(action, w));
    if (i === -1) return undefined;
    return i === 0 ? 0 : 1;
  }
  // A word's bracket holds what describes the word: nothing of the period's.
  if (frame.kind === "element") return undefined;
  switch (action.kind) {
    case "role":
      // A phrase names its head once, and only that: its bracket's first word, or /subj.
      if (frame.kind !== "period") return action.slot === "subject" && frame.words.length === 0 ? 2 : undefined;
      return roleRefusal(state, frame.containerId, action.slot, def, opts.vocab) ? undefined : 2;
    case "condition": {
      const c = state.containers.find((x) => x.id === frame.containerId);
      return frame.kind === "period" && c && canStartCondition(state.links, c) ? 3 : undefined;
    }
    case "join": {
      const c = state.containers.find((x) => x.id === frame.containerId);
      return frame.kind === "period" && c && canStartCoordination(state.links, c) ? 3 : undefined;
    }
    case "subordinate": {
      const c = state.containers.find((x) => x.id === frame.containerId);
      return frame.kind === "period" && c && canStartSubordinate(state.links, c, action.link) ? 3 : undefined;
    }
    case "instrument": {
      const c = state.containers.find((x) => x.id === frame.containerId);
      return frame.kind === "period" && c?.selection.verb?.complements?.includes("instrumental") ? 2 : undefined;
    }
    case "level":
    case "privative":
      return state.links.some(
        (l) => isInstrumentalLink(l) && (l.source.containerId === frame.containerId || l.target.containerId === frame.containerId),
      )
        ? 3
        : undefined;
    case "mood":
      return frame.kind === "period" ? 3 : undefined;
    case "new":
      return top ? 3 : undefined;
    case "del":
      return 3;
    case "app":
      return 4;
    default:
      return undefined;
  }
}

function commandCompletion(
  from: number,
  to: number,
  query: string,
  frame: Frame,
  state: WorkspaceState,
  opts: CompleteOptions,
  between = false,
): Completion {
  const words = frameWords(frame, state);
  const recent = opts.recent ?? [];
  const ranked: { c: Candidate; rank: number[] }[] = [];
  COMMANDS.forEach((def, order) => {
    const group = commandGroup(def, frame, state, words, opts);
    if (group === undefined) return;
    // Ranked by the best of its name and its aliases: exact, a prefix of the name, a prefix of an
    // alias, the start of a word, the letters in order. Choosing an alias inserts the name.
    const nameClass = matchClass(query, def.name);
    let cls = nameClass;
    let alias: string | undefined;
    for (const a of def.aliases) {
      const ac = matchClass(query, a);
      if (ac === undefined) continue;
      const aliasClass = ac === 0 ? 0.5 : ac === 1 ? 2 : ac;
      if (cls === undefined || aliasClass < cls) {
        cls = aliasClass;
        alias = a;
      }
    }
    // The interface language's names: found by their start, as a whole.
    for (const a of opts.aliases?.get(def.name) ?? []) {
      const q = fold(query);
      if (!q || !fold(a).startsWith(q)) continue;
      const aliasClass = fold(a) === q ? 0.5 : 2.5;
      if (cls === undefined || aliasClass < cls) {
        cls = aliasClass;
        alias = a;
      }
    }
    if (cls === undefined) return;
    const target = attachesToWord(def.action) ? words.find((w) => takes(def.action, w)) : undefined;
    const settingId = def.action.kind === "setting" ? def.action.setting.id : def.action.kind === "set" ? def.action.id : undefined;
    const r = recent.indexOf(def.name);
    const topic = topicOf(def);
    const family = topicRank(def);
    // Of a setting's family, the value that would change something leads — `/pl` on a singular noun.
    const lead =
      def.action.kind !== "setting" || !target
        ? 0
        : leadOf(def.action.setting.id, target) === def.name
          ? 0
          : 1;
    ranked.push({
      c: {
        kind: "command",
        insert: `/${def.name}`,
        label: `/${def.name}`,
        detail: def.description,
        detailKey: def.descriptionKey,
        current: target && settingId ? currentValue(settingId, target) : undefined,
        alias: alias ? (def.aliases.includes(alias) ? `/${alias}` : alias) : undefined,
        topic: topic.label,
        topicKey: topic.labelKey,
        shortcut: shortcutOf(def),
        color: def.color,
      },
      // Typed, the best match first; untyped, topic by topic — the command that names a setting
      // before its shortcuts, then the catalogue's order.
      rank: query
        ? [cls, r === -1 ? 99 : r, group, family, lead, order]
        : [group, family, def.action.kind === "set" ? 0 : 1, order],
    });
  });
  ranked.sort((a, b) => compareRanks(a.rank, b.rank));
  const candidates = ranked.slice(0, MAX_ROWS).map((r) => r.c);
  const about = words[0]?.concept ? opts.vocab.label(words[0].concept) : undefined;
  return {
    from,
    to,
    candidates,
    ghost: between ? undefined : ghostFor(`/${query}`, candidates[0]),
    title: "commands",
    titleKey: "console.list.commands",
    about,
    auto: !between,
    topics: !query,
  };
}

/** The command of a setting's family that leads the list for a word: the first that would change it. */
function leadOf(id: string, w: WordInfo): string | undefined {
  const current = currentSetting(id as never, w);
  return COMMANDS.find(
    (c) =>
      c.action.kind === "setting" &&
      c.action.setting.id === id &&
      c.action.setting.value !== current &&
      takes(c.action, w),
  )?.name;
}

function compareRanks(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i]! - b[i]!;
  return 0;
}

/** A setting's current value on its word, for the row's "now …". */
export function currentValue(id: SettingId, w: WordInfo): Candidate["current"] {
  const value = currentSetting(id, w);
  if (value === undefined) return undefined;
  const keys: Partial<Record<typeof id, string>> = {
    number: `number.value.${value}`,
    gender: `gender.value.${value}`,
    determiner: `determiner.name.${value}`,
    tense: `tense.value.${value}`,
    aspect: `aspect.value.${value}`,
    voice: `voice.value.${value}`,
    polarity: `polarity.value.${value}`,
    relation: `modifier.relation.${value}`,
    // The spatial relation is named by the adposition it spells, which the catalog now cites (C13):
    // "under" / "sotto" / 〜の下で, in place of the English label this row used to print.
    specifier: `specifier.value.${value}`,
    temporal: `temporal.value.${value}`,
  };
  return { value, key: keys[id] as UiStringKey | undefined };
}

// ── Arguments ────────────────────────────────────────────────────────────────

function argumentCompletion(
  def: CommandDef,
  from: number,
  to: number,
  query: string,
  between: Token[],
  frame: Frame,
  state: WorkspaceState,
  opts: CompleteOptions,
  text: string,
  caret: number,
): Completion | undefined {
  const action = def.action;
  const words = frameWords(frame, state);
  const arg = def.arg;
  // The words argument of a role, an adjective, an adverb, a modal.
  if (arg.kind === "word") {
    const spec = wordSpecForCommand(def, frame, words);
    if (!spec) return undefined;
    return wordCompletion(from, to, query, spec, opts, titleForSpec(spec, def), def.color);
  }
  if (arg.kind === "values") {
    // `/command lets instruction`: complete the value at the caret, among those not given yet.
    const typedBefore = between.filter((t) => t.kind === "word").map((t) => (t as { text: string }).text.split(/\s+/)).flat();
    const lastSpace = text.lastIndexOf(" ", caret - 1);
    const partFrom = Math.max(from, lastSpace + 1);
    const part = text.slice(partFrom, caret);
    const given = typedBefore.filter((w) => w !== part).map((w) => valueNamed(arg.values, w)).filter((v): v is ValueDef => Boolean(v));
    const c = valueCompletion(partFrom, to, part, arg.values.filter((v) => !given.some((g) => sameKind(g, v))), def);
    // A second value is offered on ⇥, not pressed on whoever runs the line with ↵.
    if (given.length > 0) c.auto = false;
    return c;
  }
  if (arg.kind === "text") {
    if (action.kind === "del") return valueCompletion(from, to, query, DEL_VALUES, def);
    if (action.kind === "app" && action.app === "help")
      return valueCompletion(from, to, query, COMMANDS.map((c) => ({ name: c.name, value: c.name, description: c.description, descriptionKey: c.descriptionKey })), def);
    if (action.kind === "app" && action.app === "load")
      return valueCompletion(from, to, query, (opts.saved ?? []).map((name) => ({ name, value: name, description: "" })), def, true);
    return undefined;
  }
  if (arg.kind === "phrase" || arg.kind === "link") {
    return linkCompletion(def, from, to, query, between, frame, state, opts, words);
  }
  return undefined;
}

/** The words a command's argument names, given where it would land. */
function wordSpecForCommand(def: CommandDef, frame: Frame, words: WordInfo[]): WordSpec | undefined {
  const action = def.action;
  switch (action.kind) {
    case "role":
      return wordSpecFor(action.slot, nounFrame(frame));
    case "adjective": {
      const w = words.find((x) => takes(action, x));
      const t = w && adjectiveTarget(w);
      if (!t) return wordSpecFor("subjectAdjective");
      return t.modifierAdjective ? { roles: ["adjective"] } : wordSpecFor(t.slot);
    }
    case "adverb":
      return { roles: ["adverb"] };
    case "modal":
      return { roles: ["verb"], modal: true };
    default:
      return undefined;
  }
}

/** A list's heading: its English, and the catalogue's key for it where there is one. */
type Title = Pick<Completion, "title" | "titleKey">;

/**
 * What a list of words is headed: a role's words by the role, as its box is titled; the modals by
 * their own name; any other words by their category, as the words panel heads its sections.
 */
function titleForSpec(spec: WordSpec, def: CommandDef): Title {
  if (spec.modal) return { title: "modals", titleKey: "console.list.modals" };
  if (def.action.kind === "role") return { title: def.description, titleKey: def.descriptionKey };
  const role = spec.roles[0]!;
  return { title: `${role}s`, titleKey: `palette.${role}` };
}

function wordCompletion(
  from: number,
  to: number,
  query: string,
  spec: WordSpec,
  opts: CompleteOptions,
  title: Title,
  color: TokenColor,
  prefix = "",
): Completion {
  const vocab = opts.vocab;
  const q = query.trim().toLowerCase();
  const ranked: { c: Candidate; rank: number[] }[] = [];
  wordsFor(spec, vocab).forEach((concept, order) => {
    const insert = printWord(concept, spec, vocab);
    const shown = concept.role === "pronoun" ? PRONOUN_NAMES[concept.id] ?? insert : vocab.label(concept);
    // Matched as the pickers match: the word as shown, its English word, its reading, its gloss.
    const hay = [
      shown,
      concept.role === "pronoun" ? vocab.label(concept) : "",
      concept.label ?? "",
      concept.readings?.[vocab.language] ?? "",
      concept.synonym ?? "",
      concept.id,
    ].filter(Boolean);
    let cls: number | undefined;
    for (const h of hay) {
      const c = matchClass(q, h);
      if (c !== undefined && c < 4 && (cls === undefined || c < cls)) cls = c;
      if (cls === undefined && h.toLowerCase().includes(q)) cls = 3.5;
    }
    if (cls === undefined) return;
    ranked.push({
      c: {
        kind: "word",
        insert: `${prefix}${insert}`,
        label: shown,
        detail: concept.role === "pronoun" ? vocab.label(concept) : vocab.gloss?.(concept),
        concept,
        color,
      },
      // Among words that match alike, the shorter is the closer to what was typed: `ca` is cat
      // before it is care.
      rank: [cls, spec.roles.indexOf(concept.role), cls <= 1 ? shown.length : 0, order],
    });
  });
  ranked.sort((a, b) => compareRanks(a.rank, b.rank));
  const candidates = ranked.slice(0, MAX_ROWS).map((r) => r.c);
  return {
    from,
    to,
    candidates,
    ghost: ghostFor(`${prefix}${query}`, candidates[0]),
    ...title,
    auto: true,
  };
}

function valueCompletion(
  from: number,
  to: number,
  query: string,
  values: readonly ValueDef[],
  def: CommandDef,
  free = false,
): Completion {
  const ranked = values
    .map((v, order) => {
      let cls = matchClass(query, v.name);
      for (const a of v.aliases ?? []) {
        const ac = matchClass(query, a);
        if (ac !== undefined && (cls === undefined || ac < cls)) cls = ac + 1;
      }
      return cls === undefined ? undefined : { v, rank: [cls, order] };
    })
    .filter((x): x is { v: ValueDef; rank: number[] } => Boolean(x))
    .sort((a, b) => compareRanks(a.rank, b.rank));
  const candidates: Candidate[] = ranked.slice(0, MAX_ROWS).map(({ v }) => ({
    kind: "value",
    insert: v.name,
    label: v.name,
    detail: v.description,
    detailKey: v.descriptionKey,
  }));
  return {
    from,
    to,
    candidates,
    ghost: ghostFor(query, candidates[0]),
    // A command's values are headed by the command after the title, outside the phrase: "values · /tense".
    ...(free
      ? { title: "saved phrases", titleKey: "console.list.savedPhrases" as const }
      : def.action.kind === "join" || def.action.kind === "subordinate"
        ? { title: "conjunctions", titleKey: "console.list.conjunctions" as const }
        : { title: "values", titleKey: "console.list.values" as const, about: `/${def.name}` }),
    auto: true,
  };
}

/**
 * What `/del` removes, each argument named by the part of the canvas it is — the same name the box,
 * the satellite or the list's title gives it, capitalized as the other values lists are ("Object",
 * it "Complemento oggetto"). The English articles the literals carried ("an adjective", "the
 * adverb") said which arguments take a number; the usage line spells that out.
 */
const DEL_VALUES: readonly ValueDef[] = [
  { name: "adj", value: "adj", description: "an adjective", descriptionKey: "category.adjective" },
  { name: "obj", value: "obj", description: "the direct object", descriptionKey: "slot.directObject" },
  { name: "adv", value: "adv", description: "the adverb", descriptionKey: "slot.adverb" },
  { name: "modal", value: "modal", description: "a modal", descriptionKey: "slot.modal" },
  { name: "poss", value: "poss", description: "the possessor", descriptionKey: "slot.possessor" },
  { name: "than", value: "than", description: "the standard of comparison", descriptionKey: "slot.standard" },
  { name: "and", value: "and", description: "a coordinated phrase", descriptionKey: "slot.conjunct" },
  { name: "rel", value: "rel", description: "the relative clause", descriptionKey: "satellite.relative" },
  { name: "if", value: "if", description: "the if-condition", descriptionKey: "clause.conditional" },
  { name: "join", value: "join", description: "the coordination", descriptionKey: "clause.coordinated" },
  { name: "clause", value: "clause", description: "the that-clause", descriptionKey: "subordinator.value.that" },
  { name: "sub", value: "sub", description: "the adverbial clause", descriptionKey: "clause.subordinate" },
  { name: "to", value: "to", description: "the infinitive complement", descriptionKey: "infinitive.phrase" },
  { name: "inst", value: "inst", description: "the instrument", descriptionKey: "slot.instrumental" },
  { name: "period", value: "period", description: "the whole period", descriptionKey: "period.name" },
  { name: "subj", value: "subj", description: "the subject", descriptionKey: "slot.subject" },
  { name: "verb", value: "verb", description: "the verb", descriptionKey: "slot.verb" },
  // The boxed complements, each by its own box's title rather than by the internal type name the
  // literal showed ("terminus", "route"), which is not even the English UI's word for them.
  ...BOX_COMPLEMENT_TYPES.map((t) => ({
    name: NOUN_NAMES[t],
    value: NOUN_NAMES[t],
    description: t,
    descriptionKey: `slot.${t}` as UiStringKey,
  })),
];

// ── Links, phrases and references ────────────────────────────────────────────

/** The periods and nouns a link command may reach from here, numbered in reading order. */
function linkTargets(def: CommandDef, frame: Frame, state: WorkspaceState, words: WordInfo[]): Candidate[] {
  const action = def.action;
  const out: Candidate[] = [];
  state.containers.forEach((c, i) => {
    const n = i + 1;
    switch (action.kind) {
      case "relative": {
        const source = words.find((w) => takes(action, w));
        if (!source) return;
        for (const key of ["subject", "directObject", ...BOX_COMPLEMENT_TYPES] as NounKey[]) {
          const concept = c.selection[key as SlotKey];
          if (!concept) continue;
          if (!canBeRelativeTarget(state.containers, state.links, source.ref.containerId, { containerId: c.id, nounKey: key })) continue;
          out.push(refCandidate(printRef(n, key), concept, inPeriod(n)));
        }
        return;
      }
      case "condition":
        if (canBeCondition(state.links, frame.containerId, c.id)) out.push(periodCandidate(n, c.selection));
        return;
      case "join":
        if (canBeCoordinate(state.containers, state.links, frame.containerId, c.id)) out.push(periodCandidate(n, c.selection));
        return;
      case "subordinate":
        if (canBeSubordinate(state.containers, state.links, frame.containerId, c.id, action.link))
          out.push(periodCandidate(n, c.selection));
        return;
      case "instrument":
        if (canBeInstrument(state.containers, state.links, frame.containerId, c.id)) out.push(periodCandidate(n, c.selection));
        return;
      case "possessor": {
        // A possessor that refers to another noun of its own period.
        if (c.id !== frame.containerId) return;
        const possessed = words.find((w) => takes(action, w));
        if (!possessed) return;
        for (const key of ["subject", "directObject", ...BOX_COMPLEMENT_TYPES] as NounKey[]) {
          const concept = c.selection[key as SlotKey];
          if (!concept || key === possessed.address || key.startsWith(`${possessed.address}/`)) continue;
          out.push(refCandidate(printRef(n, key), concept, inPeriod(n)));
        }
        return;
      }
    }
  });
  return out.map((c, i) => (i < 9 ? { ...c, number: i + 1 } : c));
}

function refCandidate(ref: string, concept: Concept | undefined, detail: Partial<Candidate>): Candidate {
  return { kind: "ref", insert: ref, label: ref, concept, color: "ref", ...detail };
}

/**
 * What a noun's reference row says after it: which period the noun is in, the period by its name and
 * the number outside the phrase, as the console's header writes it (the C14 rule) — "Period 2",
 * de "Satzgefüge 2".
 */
function inPeriod(n: number): Partial<Candidate> {
  return { detail: `Period ${n}`, detailKey: "period.name", detailValue: { period: n } };
}

/** A reference row to a period, which it sums up in a few words: its subject and verb, or that it is empty. */
function periodCandidate(n: number, sel: WorkspaceState["containers"][number]["selection"]): Candidate {
  const summary = [sel.subject?.label, sel.verb?.label].filter(Boolean).join(" ");
  return summary
    ? refCandidate(printRef(n), undefined, { detail: summary })
    : refCandidate(printRef(n), undefined, { detail: "empty", detailKey: "slot.empty" });
}

function linkCompletion(
  def: CommandDef,
  from: number,
  to: number,
  query: string,
  between: Token[],
  frame: Frame,
  state: WorkspaceState,
  opts: CompleteOptions,
  words: WordInfo[],
): Completion {
  const action = def.action;
  const q = query.trim().toLowerCase();
  const head = words.find((w) => takes(action, w));
  const headName = head?.concept ? opts.vocab.label(head.concept) : undefined;
  // `/join` first takes its conjunction; with one given, the target follows. So does `/sub`.
  if (action.kind === "join" && between.length === 0) {
    const root = state.containers.find((c) => c.id === frame.containerId)?.selection;
    const values = COORD_VALUES.filter((v) => !root?.imperative || canCoordinateImperative(v.value as never));
    return valueCompletion(from, to, query, values, def);
  }
  if (takesConjunction(def) && action.kind === "subordinate" && between.length === 0)
    return valueCompletion(from, to, query, SUB_VALUES, def);
  const rows: Candidate[] = [];
  // Where the target goes: straight after the command, or after the word it takes first — the
  // conjunction of a join, the gap of a relative clause.
  const targetHere = between.length === (takesConjunction(def) ? 1 : 0);
  // New phrases first: `subj {` and `obj {` for a relative clause, `{` for a period of the others'
  // own, `[` for a possessor's or a conjunct's phrase.
  if (action.kind === "relative" && between.length === 0) {
    // Which role the noun takes in the clause is said by the role's name after the clause's, and the
    // word after that, outside the phrase (the C14 rule): "new clause · Subject: cat". A sentence
    // about the word ("cat is its subject") would need a period built on it, and an "its" agreeing
    // with CLAUSE. With no word yet, the role alone.
    const clause = (key: "slot.subject" | "slot.directObject", english: string): Partial<Candidate> => ({
      detail: `new clause · ${english}${headName ? `: ${headName}` : ""}`,
      detailKey: ["console.new.clause", key],
      ...(headName ? { detailValue: { word: headName } } : {}),
    });
    rows.push(
      { kind: "phrase", insert: "subj {", close: "}", label: "subj { … }", ...clause("slot.subject", "Subject") },
      { kind: "phrase", insert: "obj {", close: "}", label: "obj { … }", ...clause("slot.directObject", "Object") },
    );
  } else if (action.kind === "possessor" || action.kind === "standard" || action.kind === "conjunct") {
    rows.push({ kind: "phrase", insert: "[", close: "]", label: "[ … ]", detail: "new phrase", detailKey: "console.new.phrase" });
  } else {
    rows.push({ kind: "phrase", insert: "{", close: "}", label: "{ … }", detail: "new period", detailKey: "console.new.period" });
  }
  // Then what exists already: the periods and nouns the rules let it reach.
  if (action.kind !== "conjunct" && action.kind !== "standard" && targetHere) rows.push(...linkTargets(def, frame, state, words));
  // A possessor, a standard or a conjunct may also be named by its word.
  if ((action.kind === "possessor" || action.kind === "standard" || action.kind === "conjunct") && q) {
    const spec = wordSpecFor("subject", action.kind);
    rows.push(...wordCompletion(from, to, query, spec, opts, { title: "" }, "primary").candidates);
  }
  const candidates = rows.filter((r) => !q || r.kind === "word" || r.insert.toLowerCase().startsWith(q) || r.label.toLowerCase().includes(q));
  return {
    from,
    to,
    candidates: candidates.slice(0, MAX_ROWS),
    ghost: ghostFor(query, candidates[0]),
    ...linkTitle(def),
    about: headName,
    auto: true,
  };
}

/**
 * What a link's list is headed: the part the target will play, named as the canvas's control for that
 * link names it — the noun's relative clause, the period's if-condition, the coordinated clause, the
 * instrument, the noun's possessor, a coordination. The noun it hangs off follows as `about`.
 */
function linkTitle(def: CommandDef): Title {
  switch (def.action.kind) {
    case "relative":
      return { title: "relative clause", titleKey: "satellite.relative" };
    case "condition":
      return { title: "if-condition", titleKey: "clause.conditional" };
    case "join":
      return { title: "coordinated clause", titleKey: "clause.coordinated" };
    case "subordinate":
      return { title: "subordinate clause", titleKey: "clause.subordinate" };
    case "instrument":
      return { title: "instrument", titleKey: "slot.instrumental" };
    case "possessor":
      return { title: "possessor", titleKey: "slot.possessor" };
    case "standard":
      return { title: "standard of comparison", titleKey: "slot.standard" };
    default:
      return { title: "coordination", titleKey: "satellite.coordination" };
  }
}

function refCompletion(
  from: number,
  to: number,
  query: string,
  owner: CommandDef | undefined,
  frame: Frame,
  state: WorkspaceState,
  opts: CompleteOptions,
): Completion {
  const words = frameWords(frame, state);
  let rows: Candidate[];
  if (owner && (owner.arg.kind === "link" || owner.arg.kind === "phrase")) {
    rows = linkTargets(owner, frame, state, words);
  } else {
    // Going to a period, or to a noun of one: every period, then its nouns.
    rows = state.containers.flatMap((c, i) => {
      const n = i + 1;
      return [
        periodCandidate(n, c.selection),
        ...(["subject", "directObject", ...BOX_COMPLEMENT_TYPES] as NounKey[])
          .filter((key) => c.selection[key as SlotKey])
          .map((key) => refCandidate(printRef(n, key), c.selection[key as SlotKey], inPeriod(n))),
      ];
    });
    rows = rows.map((c, i) => (i < 9 ? { ...c, number: i + 1 } : c));
  }
  const typed = `#${query}`;
  const candidates = rows.filter((r) => r.insert.startsWith(typed));
  return {
    from,
    to,
    candidates: candidates.slice(0, MAX_ROWS),
    ghost: ghostFor(typed, candidates[0]),
    ...(owner ? linkTitle(owner) : { title: "periods", titleKey: "console.list.periods" as const }),
    about: (() => {
      const concept = owner ? words.find((w) => takes(owner.action, w))?.concept : undefined;
      return concept ? opts.vocab.label(concept) : undefined;
    })(),
    auto: true,
  };
}

// ── A word with no command ───────────────────────────────────────────────────

/**
 * A word typed without a command is not part of the language, and is met by completion instead: the
 * role command for the box under the cursor, with the word — `ca` → `/subj ( cat )`. The rows are all
 * that one role's, so the list is headed by the role, as the role's own word list is.
 */
function didYouMean(
  from: number,
  to: number,
  query: string,
  frame: Frame,
  state: WorkspaceState,
  opts: CompleteOptions,
): Completion {
  const word = frame.words.at(-1) ?? opts.context.word;
  const slot = word && !word.slice && !word.modifierAdjective ? word.slot : "subject";
  const role = COMMANDS.find((c) => c.action.kind === "role" && c.action.slot === slot);
  const def = role ?? COMMANDS.find((c) => c.name === "subj")!;
  const spec = wordSpecFor(def.action.kind === "role" ? def.action.slot : "subject", nounFrame(frame));
  const c = wordCompletion(from, to, query, spec, opts, titleForSpec(spec, def), def.color, `/${def.name} ( `);
  // A bare word never stays: the list says what it would become — the word in its role's bracket.
  c.candidates = c.candidates.map((x) => ({ ...x, close: ")", label: `${x.insert} )` }));
  c.ghost = undefined;
  void state;
  return c;
}
