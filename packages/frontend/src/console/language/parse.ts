import {
  COORD_VALUES,
  PERSON_VALUES,
  REGISTER_VALUES,
  commandNamed,
  valueNamed,
  type CommandDef,
  type TokenColor,
  type ValueDef,
} from "./commands.ts";
import { lex, type Shape, type Token } from "./lex.ts";
import type { Diagnostic, Span } from "./types.ts";

/**
 * The console's parser: a line of tokens into a list of items — a command and its argument, or a
 * `#reference` that moves the context — each with its span.
 *
 *   line      = item …
 *   item      = /command [argument]  ·  #reference
 *   argument  = a word · a value · a #reference · bracket
 *   bracket   = ( [word] line )  ·  [ [word] line ]  ·  { line }
 *
 * A bracket becomes the nested item list of the command that owns it; what it holds is the command's
 * to say, not the shape's. A word command's bracket holds its word and what describes it
 * (`/subj ( cat /pl )`), a possessor's or a conjunct's the phrase, its head word first
 * (`/poss [ child /adj old ]`), a link's a period (`/rel subj { /verb ( love ) }`). The printer writes
 * each in its own shape; any shape reads, so the brackets of a keyboard without the others will do.
 *
 * It stops at the first mistake: what came before it is the line's valid prefix, which still
 * previews, and the mistake is the one diagnostic the console shows. A line may end inside brackets —
 * ↵ closes whatever is still open.
 */

export interface TextArg extends Span {
  text: string;
}

export interface Item extends Span {
  kind: "command" | "goto";
  /** The command as typed, lower-cased (an alias stays an alias; `def` is what it stands for). */
  name: string;
  def?: CommandDef;
  /** The command's own token, or the reference a goto item is. */
  head: Span;
  /** A word, values or free text. For `/rel` it is the gap (`subj` / `obj`), for `/join` the conjunction. */
  word?: TextArg;
  /** A `#reference` argument, or the reference a goto item moves to. */
  ref?: TextArg;
  /** The items of the bracket the command owns, after its word if it opens with one. */
  body?: Item[];
  open?: Span;
  /** The bracket's shape, as written. */
  shape?: Shape;
  /** Absent when the line ended inside the bracket. */
  close?: Span;
  /** The word was written inside the bracket, first — `/subj ( cat …`, `/poss [ child …`. */
  lead?: boolean;
}

export interface ParseResult {
  items: Item[];
  /** The first mistake in the line, if any. Everything in `items` precedes it. */
  diagnostic?: Diagnostic;
}

class ParseError extends Error {
  constructor(readonly diagnostic: Diagnostic) {
    super(diagnostic.message);
  }
}

const fail = (span: Span, message: string): never => {
  throw new ParseError({ from: span.from, to: span.to, message });
};

export function parse(text: string): ParseResult {
  const tokens = lex(text);
  const items: Item[] = [];
  let pos = 0;

  // Parse items until a `)` (depth > 0) or the end, appending into `into` as each completes, so the
  // valid prefix survives a mistake further on.
  const parseItems = (into: Item[], depth: number): void => {
    while (pos < tokens.length) {
      const tok = tokens[pos]!;
      if (tok.kind === "close") {
        if (depth > 0) return;
        fail(tok, "There is no bracket open here to close.");
      }
      parseItem(into);
    }
  };

  // Each item joins the line before its argument is read, so a mistake in the argument — deep inside
  // a bracket, say — leaves the item and what it had so far in the valid prefix.
  const parseItem = (into: Item[]): void => {
    const tok = tokens[pos]!;
    if (tok.kind === "ref") {
      pos++;
      into.push({ kind: "goto", name: "#", head: tok, ref: { text: tok.text, from: tok.from, to: tok.to }, from: tok.from, to: tok.to });
      return;
    }
    if (tok.kind === "word")
      fail(tok, "A line is made of commands — start it with one, such as /subj, or / for the list.");
    if (tok.kind === "open")
      fail(tok, "A bracket belongs to the command before it: /subj ( … ), /poss [ … ], /rel subj { … }.");
    if (tok.kind !== "command") fail(tok, "Unexpected text.");
    const command = tok as Extract<Token, { kind: "command" }>;
    pos++;
    if (!command.name) fail(command, "Name a command after the slash — the list shows them all.");
    const def = commandNamed(command.name);
    if (!def) fail(command, `There is no command /${command.name}.`);
    const item: Item = { kind: "command", name: command.name, def, head: command, from: command.from, to: command.to };
    into.push(item);
    parseArgument(item, def!);
  };

  const peek = (): Token | undefined => tokens[pos];

  const takeWord = (item: Item): void => {
    const next = peek();
    if (next?.kind !== "word") return;
    pos++;
    item.word = { text: next.text, from: next.from, to: next.to };
    item.to = next.to;
  };

  /** A bracket and its items; `lead`, when the command's word may open it. */
  const takeBracket = (item: Item, lead = false): void => {
    const open = peek() as Extract<Token, { kind: "open" }>;
    pos++;
    item.open = { from: open.from, to: open.to };
    item.shape = open.shape;
    item.body = [];
    item.to = open.to;
    const first = peek();
    if (lead && first?.kind === "word") {
      pos++;
      item.word = { text: first.text, from: first.from, to: first.to };
      item.lead = true;
      item.to = first.to;
    }
    // The body is attached before it is parsed, so a mistake inside still leaves the bracket, and
    // the items before the mistake, in the valid prefix.
    parseItems(item.body, 1);
    const close = peek();
    if (close?.kind === "close") {
      pos++;
      item.close = close;
      item.to = close.to;
    } else {
      item.to = item.body.at(-1)?.to ?? item.word?.to ?? open.to;
    }
  };

  const parseArgument = (item: Item, def: CommandDef): void => {
    const arg = def.arg;
    const kind = def.action.kind;
    if (arg.kind === "none") {
      const next = peek();
      if (next?.kind === "word") fail(next, `/${def.name} takes no word.`);
      return;
    }
    if (arg.kind === "word") {
      // A word, or a bracket that opens with it: `/subj cat`, `/subj ( cat /pl )`.
      takeWord(item);
      if (peek()?.kind === "open") {
        if (item.word) fail(peek()!, `Put the word inside the bracket: /${def.name} ( ${item.word.text} … ).`);
        takeBracket(item, true);
      }
      return;
    }
    if (arg.kind === "text") {
      takeWord(item);
      return;
    }
    if (arg.kind === "values") {
      takeWord(item);
      if (item.word) {
        const word = item.word;
        const given: ValueDef[] = [];
        // The values before a refused one stay the command's: they are the valid prefix.
        const keepBefore = (from: number) => {
          const text = word.text.slice(0, from - word.from).trimEnd();
          if (text) item.word = { text, from: word.from, to: word.from + text.length };
          else dropWord(item);
          item.to = item.word?.to ?? item.head.to;
        };
        for (const m of word.text.matchAll(/\S+/g)) {
          const from = word.from + m.index!;
          const span = { from, to: from + m[0].length };
          const value = valueNamed(arg.values, m[0]);
          if (!value) {
            keepBefore(from);
            fail(span, `/${def.name} takes ${arg.values.map((v) => v.name).join(", ")} — not “${m[0]}”.`);
          }
          // One value of each kind — an addressee and a register for a command, one level, one language.
          const clash = given.find((g) => sameKind(g, value!));
          if (given.length >= arg.max || clash) {
            keepBefore(from);
            fail(span, `/${def.name} takes ${arg.max === 1 ? "one value" : "one of each"} — “${clash?.name ?? given[0]!.name}” is already given.`);
          }
          given.push(value!);
        }
      }
      return;
    }
    // A phrase or a link: first the word that qualifies it (the gap of a relative clause, the
    // conjunction of a join) or names it (a possessor's or a conjunct's word), then a reference or
    // a bracket.
    takeWord(item);
    if (item.word) checkLinkWord(item, def);
    const next = peek();
    if (next?.kind === "ref") {
      if (kind === "conjunct") fail(next, `/${def.name} coordinates a phrase: a word, or ( … ).`);
      if (item.word && kind !== "join") fail(next, `/${def.name} takes a word or a reference, not both.`);
      pos++;
      item.ref = { text: next.text, from: next.from, to: next.to };
      item.to = next.to;
      return;
    }
    if (next?.kind === "open") {
      const phrase = kind === "possessor" || kind === "conjunct";
      if (item.word && phrase) fail(next, `Put the word inside the bracket: /${def.name} [ ${item.word.text} … ].`);
      // A possessor's or a conjunct's bracket opens with its head word.
      takeBracket(item, phrase);
      return;
    }
    if (item.word && kind === "relative")
      fail(item.word, `Open the new clause: /rel ${item.word.text.toLowerCase()} { … }.`);
  };

  // The word a link command may carry before its target: the gap a relative clause names, the
  // conjunction a join is made with. The clause-level links take none.
  const checkLinkWord = (item: Item, def: CommandDef): void => {
    const word = item.word!;
    const kind = def.action.kind;
    const message =
      kind === "relative" && !/^(subj|obj)$/i.test(word.text)
        ? "/rel takes #n.noun — or subj { … } or obj { … } for a new clause."
        : kind === "condition" || kind === "instrument"
          ? `/${def.name} takes #n for a period, or { … } for a new one.`
          : kind === "join" && !valueNamed(COORD_VALUES, word.text)
            ? "/join takes a conjunction — and, or, but, thatis, therefore, then — then #n or { … }."
            : undefined;
    if (!message) return;
    dropWord(item);
    fail(word, message);
  };

  // A word the command refused is not part of the valid prefix: the command is, without it.
  const dropWord = (item: Item): void => {
    delete item.word;
    item.to = item.head.to;
  };

  try {
    parseItems(items, 0);
    return { items };
  } catch (error) {
    if (error instanceof ParseError) return { items, diagnostic: error.diagnostic };
    throw error;
  }
}

/** Whether two values say the same kind of thing — two addressees, two registers, two levels. */
export function sameKind(a: ValueDef, b: ValueDef): boolean {
  const kind = (v: ValueDef) => (PERSON_VALUES.includes(v) ? "person" : REGISTER_VALUES.includes(v) ? "register" : "value");
  return kind(a) === kind(b);
}

// ── Colours ──────────────────────────────────────────────────────────────────

/** How a token is drawn: a box's colour, a setting's or a reference's ink, or — an unknown command — plain. */
export type TokenStyle = TokenColor | "unknown" | "plain";

export interface StyledToken extends Span {
  kind: Token["kind"];
  style: TokenStyle;
  /** A word argument is drawn in italic, like the word in its box. */
  italic?: boolean;
}

/**
 * The colour of the bracket a command opens: a word's bracket wears the word's colour, a link's the
 * colour of the connector it makes.
 */
export function bracketColor(def: CommandDef | undefined): TokenColor {
  if (def?.arg.kind === "word") return def.color;
  switch (def?.action.kind) {
    case "condition":
      return "warning";
    case "instrument":
      return "secondary";
    case "join":
      return "info";
    default:
      return "primary";
  }
}

/**
 * Every token of a line with the colour it is drawn in: a command in its box's colour, its word in
 * the same, a reference in the reference ink, a bracket in its link's. It reads the tokens alone, so a
 * line keeps its colours past a mistake.
 */
export function styleTokens(text: string): StyledToken[] {
  const tokens = lex(text);
  const styled: StyledToken[] = [];
  let last: CommandDef | undefined;
  const brackets: TokenColor[] = [];
  tokens.forEach((tok, i) => {
    if (tok.kind === "command") {
      last = commandNamed(tok.name);
      styled.push({ kind: tok.kind, from: tok.from, to: tok.to, style: last ? last.color : tok.name ? "unknown" : "plain" });
    } else if (tok.kind === "word") {
      // The word that opens a bracket is its command's: `/subj ( cat`.
      const prev = tokens[i - 1];
      const owner = tokens[i - 2];
      if (prev?.kind === "open" && owner?.kind === "command") {
        const def = commandNamed(owner.name);
        if (def && (def.arg.kind === "word" || def.arg.kind === "phrase")) last = def;
      }
      const takesWord =
        last && (last.arg.kind === "word" || last.arg.kind === "phrase");
      styled.push({
        kind: tok.kind,
        from: tok.from,
        to: tok.to,
        style: takesWord ? last!.color : last ? "setting" : "plain",
        italic: Boolean(takesWord),
      });
    } else if (tok.kind === "ref") {
      styled.push({ kind: tok.kind, from: tok.from, to: tok.to, style: "ref" });
    } else if (tok.kind === "open") {
      const color = bracketColor(last);
      brackets.push(color);
      styled.push({ kind: tok.kind, from: tok.from, to: tok.to, style: color });
      last = undefined;
    } else {
      styled.push({ kind: tok.kind, from: tok.from, to: tok.to, style: brackets.pop() ?? "plain" });
      last = undefined;
    }
  });
  return styled;
}
