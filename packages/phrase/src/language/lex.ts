/**
 * The console's lexer: a line cut into commands, references, brackets and words, each with the span
 * it covers. It knows nothing of what a command means — the parser and the completer read the same
 * tokens, so the two can never disagree about where one token ends and the next begins.
 *
 *   /adj brown   → command "adj", word "brown"
 *   #2.obj       → reference "2.obj"
 *   ( … ) [ … ] { … }  → open, close — each with its shape
 *
 * A word runs to the next command, reference or bracket, so a label of several words ("ice cream")
 * needs no quotes. A Japanese input method turns "/" into "・" or "／", so both open a command too —
 * but only where a command could start (at the beginning, or after a space or a bracket), since "・"
 * also sits inside Japanese words. Its full-width brackets are brackets too.
 */

/**
 * What a bracket holds, by its shape: `( … )` a word and what describes it, `[ … ]` a noun phrase
 * hanging off a noun, `{ … }` a period of its own. The parser reads any shape after any command — the
 * command says what the bracket holds — and the printer writes each in its own.
 */
export type Shape = "(" | "[" | "{";

export type Token =
  | { kind: "command"; name: string; from: number; to: number }
  | { kind: "ref"; text: string; from: number; to: number }
  | { kind: "open"; shape: Shape; from: number; to: number }
  | { kind: "close"; shape: Shape; from: number; to: number }
  | { kind: "word"; text: string; from: number; to: number };

const SLASHES = new Set(["/", "・", "／"]);

/** Every bracket character, and the shape it opens or closes. */
const OPENS: Record<string, Shape> = { "(": "(", "[": "[", "{": "{", "（": "(", "［": "[", "｛": "{" };
const CLOSES: Record<string, Shape> = { ")": "(", "]": "[", "}": "{", "）": "(", "］": "[", "｝": "{" };

/** The character that closes a shape. */
export const CLOSER: Record<Shape, string> = { "(": ")", "[": "]", "{": "}" };

export const isOpen = (ch: string | undefined): boolean => ch !== undefined && ch in OPENS;
export const isClose = (ch: string | undefined): boolean => ch !== undefined && ch in CLOSES;
const isBracket = (ch: string) => isOpen(ch) || isClose(ch);
const isSpecial = (ch: string) => ch === "#" || isBracket(ch);

const isSpace = (ch: string) => /\s/.test(ch);

/** Whether a command may start at `i`: the ASCII slash anywhere, its IME twins only at a boundary. */
function commandStartsAt(text: string, i: number): boolean {
  const ch = text[i]!;
  if (ch === "/") return true;
  if (!SLASHES.has(ch)) return false;
  const before = text[i - 1];
  return before === undefined || isSpace(before) || isBracket(before);
}

export function lex(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    if (isSpace(ch)) {
      i++;
      continue;
    }
    if (commandStartsAt(text, i)) {
      let j = i + 1;
      while (j < text.length && !isSpace(text[j]!) && !isSpecial(text[j]!) && !SLASHES.has(text[j]!))
        j++;
      tokens.push({ kind: "command", name: text.slice(i + 1, j).toLowerCase(), from: i, to: j });
      i = j;
      continue;
    }
    if (ch === "#") {
      let j = i + 1;
      while (j < text.length && !isSpace(text[j]!) && !isSpecial(text[j]!) && text[j] !== "/") j++;
      tokens.push({ kind: "ref", text: text.slice(i + 1, j).toLowerCase(), from: i, to: j });
      i = j;
      continue;
    }
    if (isOpen(ch)) {
      tokens.push({ kind: "open", shape: OPENS[ch]!, from: i, to: i + 1 });
      i++;
      continue;
    }
    if (isClose(ch)) {
      tokens.push({ kind: "close", shape: CLOSES[ch]!, from: i, to: i + 1 });
      i++;
      continue;
    }
    // A word: everything up to the next command, reference or bracket, trimmed of the spaces on its
    // right (the ones on its left were skipped above).
    let j = i;
    // A line break outside every bracket ends a period, so a word stops at one too.
    while (j < text.length && !isSpecial(text[j]!) && !commandStartsAt(text, j) && text[j] !== "\n") j++;
    let end = j;
    while (end > i && isSpace(text[end - 1]!)) end--;
    tokens.push({ kind: "word", text: text.slice(i, end), from: i, to: end });
    i = j;
  }
  return tokens;
}

/**
 * A script cut into its periods: at each line break outside every bracket. A break inside a bracket
 * is only a space, so a long period may be laid out over several lines. Each piece keeps its offset in
 * the script, for diagnostics.
 */
export function splitPeriods(text: string): { text: string; offset: number }[] {
  const out: { text: string; offset: number }[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (isOpen(ch)) depth++;
    else if (isClose(ch)) depth = Math.max(0, depth - 1);
    else if (ch === "\n" && depth === 0) {
      out.push({ text: text.slice(start, i), offset: start });
      start = i + 1;
    }
  }
  out.push({ text: text.slice(start), offset: start });
  return out;
}
