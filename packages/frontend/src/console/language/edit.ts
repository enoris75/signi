import { applyScript, type Frame } from "./apply.ts";
import { commandNamed, type CommandDef } from "./commands.ts";
import { commandFits, complete, previewIds, type CompleteOptions } from "./complete.ts";
import { CLOSER, isClose, isOpen, lex, type Shape, type Token } from "./lex.ts";
import type { WorkspaceState } from "./types.ts";

/**
 * The prompt's structure editing: what the console does to a line as it is typed, so that brackets
 * are never typed by hand, nor needed from a key a keyboard puts behind AltGr (P02 phase 6).
 *
 * - A word of the period opens its bracket as its command is finished: `/subj ` → `/subj ( | )`.
 *   A clause that can only be new opens its braces: `/rel subj ` → `/rel subj { | }`.
 * - Any opening bracket typed opens the pair its command takes: `/poss (` → `/poss [ | ]`.
 * - A closer typed steps over the closer already there, whatever its shape.
 * - ⌫ on a bracket with nothing in it takes its closer too.
 * - A bracket typed in one already open and empty, or a space between spaces, adds nothing.
 * - A command finished inside a bracket it does not belong in moves out of it, to the level it does:
 *   `/subj ( cat /verb ` → `/subj ( cat ) /verb ( | )`.
 *
 * Every function is pure: the text and caret before, the text and caret after.
 */

export interface Edit {
  text: string;
  caret: number;
}

export interface EditContext {
  state: WorkspaceState;
  opts: CompleteOptions;
}

/** The bracket a command's argument opens: a word's `( )`, a phrase's `[ ]`, a period's `{ }`. */
export function shapeFor(def: CommandDef | undefined): Shape | undefined {
  switch (def?.arg.kind) {
    case "word":
      return "(";
    case "phrase":
      return "[";
    case "link":
      return "{";
    default:
      return undefined;
  }
}

/**
 * The line after one keystroke, restructured — or undefined when the keystroke stands as typed. Only
 * a single character typed or deleted is looked at: a paste, a cut, an input method's composition are
 * the user's own.
 */
export function structure(before: string, after: string, caret: number, ctx: EditContext): Edit | undefined {
  if (after.length === before.length + 1 && after.slice(0, caret - 1) + after.slice(caret) === before) {
    const ch = after[caret - 1]!;
    // A bracket already open and empty, or a space between spaces: the keystroke adds nothing.
    if (isOpen(ch) && isOpen(before.slice(0, caret - 1).trimEnd().at(-1)) && isClose(before.slice(caret - 1).trimStart()[0]))
      return { text: before, caret: caret - 1 };
    if (ch === " " && /\s/.test(before[caret - 2] ?? "") && /\s/.test(before[caret - 1] ?? "")) return { text: before, caret: caret - 1 };
    if (isOpen(ch)) return openPair(after, caret);
    if (isClose(ch)) return stepOver(after, caret);
    if (ch === " ") return finished(after, caret, ctx);
    return undefined;
  }
  if (after.length === before.length - 1 && before.slice(0, caret) + before.slice(caret + 1) === after) {
    return deletePair(before, after, caret);
  }
  return undefined;
}

// ── Brackets typed ───────────────────────────────────────────────────────────

/** The command a bracket at `index` would belong to: the command before it, past a gap or conjunction word. */
function ownerAt(tokens: Token[], index: number): CommandDef | undefined {
  const prev = tokens[index - 1];
  if (prev?.kind === "command") return commandNamed(prev.name);
  const owner = tokens[index - 2];
  if (prev?.kind === "word" && owner?.kind === "command") {
    const def = commandNamed(owner.name);
    return def?.arg.kind === "link" ? def : undefined;
  }
  return undefined;
}

/** An opening bracket was typed at `caret - 1`: open the pair its command takes, the caret inside. */
function openPair(text: string, caret: number): Edit | undefined {
  const rest = text.slice(caret);
  // In front of a word the bracket is the user's to close.
  if (rest && !/^\s/.test(rest) && !isClose(rest[0])) return undefined;
  const tokens = lex(text);
  const index = tokens.findIndex((t) => t.kind === "open" && t.from === caret - 1);
  const shape = shapeFor(ownerAt(tokens, index)) ?? (tokens[index] as Extract<Token, { kind: "open" }> | undefined)?.shape ?? "(";
  const head = text.slice(0, caret - 1);
  const spaced = head && !/\s$/.test(head) ? `${head} ` : head;
  return open(spaced + rest, spaced.length, shape);
}

/** Put a bracket pair at `at`, the caret inside it. */
function open(text: string, at: number, shape: Shape): Edit {
  const head = text.slice(0, at);
  const rest = text.slice(at).replace(/^ /, "");
  const tail = rest && !/^\s/.test(rest) ? ` ${rest}` : rest;
  return { text: `${head}${shape}  ${CLOSER[shape]}${tail}`, caret: head.length + 2 };
}

/** A closer was typed at `caret - 1`: step over the closer already there, or close in the right shape. */
function stepOver(text: string, caret: number): Edit | undefined {
  const head = text.slice(0, caret - 1);
  const rest = text.slice(caret);
  const ahead = /^\s*/.exec(rest)![0].length;
  if (isClose(rest[ahead])) {
    const trimmed = head.replace(/\s+$/, "");
    const next = `${trimmed} ${rest.slice(ahead)}`;
    return { text: next, caret: trimmed.length + 2 };
  }
  // Nothing to step over: the closer closes the innermost bracket, in its shape.
  const shape = innermost(lex(head));
  if (!shape || CLOSER[shape] === text[caret - 1]) return undefined;
  return { text: `${head}${CLOSER[shape]}${rest}`, caret };
}

/** ⌫ took an opening bracket whose bracket holds nothing: its closer goes with it. */
function deletePair(before: string, after: string, caret: number): Edit | undefined {
  if (!isOpen(before[caret])) return undefined;
  const m = /^\s*(\S)/.exec(after.slice(caret));
  if (!m || !isClose(m[1])) return undefined;
  const head = after.slice(0, caret).replace(/\s+$/, "");
  const rest = after.slice(caret + m[0].length).replace(/^\s+/, "");
  return { text: rest ? `${head} ${rest}` : `${head} `, caret: head.length + 1 };
}

function innermost(tokens: Token[]): Shape | undefined {
  const stack: Shape[] = [];
  for (const t of tokens) {
    if (t.kind === "open") stack.push(t.shape);
    else if (t.kind === "close") stack.pop();
  }
  return stack.at(-1);
}

// ── A command finished ───────────────────────────────────────────────────────

/**
 * A space was typed at `caret - 1`: if it finishes a command, move the command to where it belongs
 * and open its bracket when it must have one. Also what choosing a command from the list does.
 */
export function finished(text: string, caret: number, ctx: EditContext): Edit | undefined {
  const tokens = lex(text);
  const token = tokens.find((t) => t.to === caret - 1);
  if (!token) return undefined;
  if (token.kind === "command") {
    const def = commandNamed(token.name);
    if (!def) return undefined;
    const moved = stepOut(text, caret, token, def, ctx);
    const at = moved ?? { text, caret };
    return opened(at.text, at.caret, def, ctx) ?? moved;
  }
  // The gap of a new clause, the conjunction of a join: what follows may have to be a new period.
  if (token.kind === "word" && tokens[tokens.indexOf(token) - 1]?.kind === "command") return newPeriod(text, caret, ctx);
  return undefined;
}

/**
 * The frames open where `text` ends, and the workspace as the line leaves it there — what a command
 * written next is checked against (an object wants the verb the line has just given). None when the
 * line does not read.
 */
function framesAt(text: string, ctx: EditContext): { frames: Frame[]; state: WorkspaceState } | undefined {
  const applied = applyScript(ctx.state, text, { context: ctx.opts.context, vocab: ctx.opts.vocab, newId: previewIds() });
  return applied.diagnostic ? undefined : { frames: applied.frames, state: applied.state };
}

/** Open the bracket a command just finished must have, or the one it has nothing but. */
function opened(text: string, caret: number, def: CommandDef, ctx: EditContext): Edit | undefined {
  const rest = text.slice(caret);
  if (isOpen(rest.trimStart()[0])) return undefined;
  if (def.action.kind === "role") {
    // A word of the period, not the head a phrase names with /subj.
    const frame = framesAt(text.slice(0, caret), ctx)?.frames.at(-1);
    return frame?.kind === "period" ? open(text, caret, "(") : undefined;
  }
  if (def.arg.kind === "link") return newPeriod(text, caret, ctx);
  return undefined;
}

/** Where the only thing that may follow is a new period's braces, open them. */
function newPeriod(text: string, caret: number, ctx: EditContext): Edit | undefined {
  const c = complete(text, caret, ctx.state, ctx.opts);
  const only = c?.candidates.length === 1 ? c.candidates[0] : undefined;
  if (only?.kind !== "phrase" || !only.close) return undefined;
  return open(text, caret, only.insert.at(-1) as Shape);
}

/**
 * A command finished in a bracket it does not belong in, but one it is inside of takes it: move it
 * out past the closers between — `/subj ( cat /verb ` → `/subj ( cat ) /verb `.
 */
function stepOut(text: string, caret: number, token: Token, def: CommandDef, ctx: EditContext): Edit | undefined {
  const at0 = framesAt(text.slice(0, token.from), ctx);
  if (!at0 || at0.frames.length < 2) return undefined;
  const { frames, state } = at0;
  const fits = (f: Frame) => commandFits(def, f, state, ctx.opts);
  if (fits(frames.at(-1)!)) return undefined;
  let level = frames.length - 2;
  while (level >= 0 && !fits(frames[level]!)) level--;
  if (level < 0) return undefined;
  const exits = frames.length - 1 - level;

  // Take the command out, and close up where it was.
  const command = text.slice(token.from, token.to);
  const head = text.slice(0, token.from).replace(/\s+$/, "");
  const after = text.slice(caret).replace(/^\s+/, "");
  const rest = after ? `${head} ${after}` : head;
  const from = after ? head.length + 1 : head.length;

  // Past as many closers as brackets it leaves; any not written yet are written now.
  let at = -1;
  let need = exits;
  let depth = 0;
  for (const t of lex(rest)) {
    if (t.from < from) continue;
    if (t.kind === "open") depth++;
    else if (t.kind === "close") {
      if (depth > 0) depth--;
      else if (--need === 0) {
        at = t.to;
        break;
      }
    }
  }
  let base = rest;
  if (at < 0) {
    const open: Shape[] = [];
    for (const t of lex(rest)) {
      if (t.kind === "open") open.push(t.shape);
      else if (t.kind === "close") open.pop();
    }
    const closers = open.slice(open.length - need).reverse().map((s) => CLOSER[s]);
    base = `${rest.replace(/\s+$/, "")} ${closers.join(" ")}`;
    at = base.length;
  }
  const tail = base.slice(at).replace(/^\s+/, "");
  const next = `${base.slice(0, at)} ${command} ${tail}`;
  return { text: next, caret: at + command.length + 2 };
}

// ── Moving word to word ──────────────────────────────────────────────────────

export interface Stop {
  from: number;
  to: number;
}

/**
 * Where ⇥ and ⇧⇥ go: each command, word and reference, selected whole so typing replaces it; and the
 * place just past each closing bracket, so ⇥ at the end of a bracket steps out of it.
 */
export function stops(text: string): Stop[] {
  return lex(text).flatMap((t): Stop[] =>
    t.kind === "open" ? [] : t.kind === "close" ? [{ from: t.to, to: t.to }] : [{ from: t.from, to: t.to }],
  );
}

/** The stop after the selection (`dir` 1) or before it (-1), if there is one. */
export function nextStop(text: string, start: number, end: number, dir: 1 | -1): Stop | undefined {
  const all = stops(text);
  const same = (s: Stop) => s.from === start && s.to === end;
  if (dir === 1) return all.find((s) => s.from >= end && !same(s));
  return all.filter((s) => s.from < start && !same(s)).at(-1);
}
