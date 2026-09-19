/**
 * The console's lexer: a line cut into commands, references, brackets and words, each with the span
 * it covers. It knows nothing of what a command means — the parser and the completer read the same
 * tokens, so the two can never disagree about where one token ends and the next begins.
 *
 *   /adj brown   → command "adj", word "brown"
 *   #2.obj       → reference "2.obj"
 *   ( … )        → open, close
 *
 * A word runs to the next command, reference or bracket, so a label of several words ("ice cream")
 * needs no quotes. A Japanese input method turns "/" into "・" or "／", so both open a command too —
 * but only where a command could start (at the beginning, or after a space or a bracket), since "・"
 * also sits inside Japanese words.
 */

export type Token =
  | { kind: "command"; name: string; from: number; to: number }
  | { kind: "ref"; text: string; from: number; to: number }
  | { kind: "open"; from: number; to: number }
  | { kind: "close"; from: number; to: number }
  | { kind: "word"; text: string; from: number; to: number };

const SLASHES = new Set(["/", "・", "／"]);
const SPECIAL = new Set(["#", "(", ")"]);

const isSpace = (ch: string) => /\s/.test(ch);

/** Whether a command may start at `i`: the ASCII slash anywhere, its IME twins only at a boundary. */
function commandStartsAt(text: string, i: number): boolean {
  const ch = text[i]!;
  if (ch === "/") return true;
  if (!SLASHES.has(ch)) return false;
  const before = text[i - 1];
  return before === undefined || isSpace(before) || before === "(" || before === ")";
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
      while (j < text.length && !isSpace(text[j]!) && !SPECIAL.has(text[j]!) && !SLASHES.has(text[j]!))
        j++;
      tokens.push({ kind: "command", name: text.slice(i + 1, j).toLowerCase(), from: i, to: j });
      i = j;
      continue;
    }
    if (ch === "#") {
      let j = i + 1;
      while (j < text.length && !isSpace(text[j]!) && !SPECIAL.has(text[j]!) && text[j] !== "/") j++;
      tokens.push({ kind: "ref", text: text.slice(i + 1, j).toLowerCase(), from: i, to: j });
      i = j;
      continue;
    }
    if (ch === "(") {
      tokens.push({ kind: "open", from: i, to: i + 1 });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "close", from: i, to: i + 1 });
      i++;
      continue;
    }
    // A word: everything up to the next command, reference or bracket, trimmed of the spaces on its
    // right (the ones on its left were skipped above).
    let j = i;
    while (j < text.length && !SPECIAL.has(text[j]!) && !commandStartsAt(text, j)) j++;
    let end = j;
    while (end > i && isSpace(text[end - 1]!)) end--;
    tokens.push({ kind: "word", text: text.slice(i, end), from: i, to: end });
    i = j;
  }
  return tokens;
}
