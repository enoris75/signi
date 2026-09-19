import { printPeriod, type Statement } from "./print.ts";
import type { Vocabulary, WordRef, WorkspaceState } from "./types.ts";
import { wordInfo } from "./words.ts";

/**
 * The echo: what a change made on the canvas says in the console's own language.
 *
 * It needs nothing from the canvas's handlers — it works from the state alone. Each period is printed
 * before and after, and the statements whose text changed are written out as the command that sets
 * them now (`/past · eat`); a statement that went is written as what undoes it (`/sg · cat`,
 * `/del adj · cat`). A period that appeared is `/new`, one that went `/del period`.
 */

export interface EchoPart {
  /** The command, as the console would have typed it. */
  text: string;
  /** The word it is about, in the interface language — written after a dot. */
  owner?: string;
  /** The box it acted on, where the console's context follows it. */
  word?: WordRef;
}

export interface Echo {
  /** The period it happened in, and that period's number now (or then, for a removed one). */
  containerId: string;
  period: number;
  parts: EchoPart[];
}

/** How many changes one echo line lists before it trails off. */
export const ECHO_PARTS = 4;

const label = (state: WorkspaceState, ref: WordRef | undefined, vocab: Vocabulary): string | undefined => {
  if (!ref) return undefined;
  const concept = wordInfo(state.containers, ref)?.concept;
  return concept ? vocab.label(concept) : undefined;
};

/** The slice a statement's key belongs to — the nested phrase it is written in, or "" for the period. */
const sliceOfKey = (key: string) => key.slice(0, key.indexOf("|"));

export function diffWorkspaces(before: WorkspaceState, after: WorkspaceState, vocab: Vocabulary): Echo[] {
  const echoes: Echo[] = [];
  after.containers.forEach((c, i) => {
    const was = before.containers.some((b) => b.id === c.id);
    const now = printPeriod(after, c.id, vocab).statements;
    if (!was) {
      echoes.push({ containerId: c.id, period: i + 1, parts: [{ text: "/new" }, ...now.filter((s) => !s.anchor && !inScope(s, now)).map((s) => ({ text: s.full ?? s.text }))] });
      return;
    }
    const then = printPeriod(before, c.id, vocab).statements;
    const parts = diffStatements(then, now, before, after, vocab);
    if (parts.length) echoes.push({ containerId: c.id, period: i + 1, parts });
  });
  before.containers.forEach((c, i) => {
    if (!after.containers.some((a) => a.id === c.id))
      echoes.push({ containerId: c.id, period: i + 1, parts: [{ text: "/del period" }] });
  });
  return echoes;
}

/** Whether a statement sits inside a bracket that is itself among `all` — written by its phrase. */
function inScope(s: Statement, all: Statement[]): boolean {
  const slice = sliceOfKey(s.key);
  return Boolean(slice) && all.some((p) => p.scope && (slice === p.scope || slice.startsWith(`${p.scope}/`)));
}

function diffStatements(
  then: Statement[],
  now: Statement[],
  before: WorkspaceState,
  after: WorkspaceState,
  vocab: Vocabulary,
): EchoPart[] {
  const byKey = (list: Statement[]) => new Map(list.filter((s) => !s.anchor).map((s) => [s.key, s]));
  const a = byKey(then);
  const b = byKey(now);
  const added = [...b.values()].filter((s) => {
    const old = a.get(s.key);
    return !old || old.text !== s.text || old.full !== s.full;
  });
  const removed = [...a.values()].filter((s) => !b.has(s.key));
  // A phrase that came or went in brackets is written whole; what is inside it goes with it.
  const addedScopes = added.filter((s) => s.scope && !a.has(s.key)).map((s) => s.scope!);
  const removedScopes = removed.filter((s) => s.scope).map((s) => s.scope!);
  const under = (s: Statement, scopes: string[]) => {
    const slice = sliceOfKey(s.key);
    return Boolean(slice) && scopes.some((p) => slice === p || slice.startsWith(`${p}/`));
  };
  // A word that changed brings its defaults with it; they are not changes of their own.
  const rewritten = new Set(
    [...added, ...removed].filter((s) => s.key.endsWith(":word")).map((s) => s.key.replace(/:word$/, "")),
  );
  const ownedByRewritten = (s: Statement) =>
    !s.key.endsWith(":word") && rewritten.has(s.key.slice(0, s.key.lastIndexOf(":")));
  const parts: EchoPart[] = [];
  for (const s of added) {
    if (under(s, addedScopes)) continue;
    // A phrase whose inside changed says what changed inside it, not the whole phrase again.
    if (s.scope && a.has(s.key)) continue;
    if (!s.key.endsWith(":word") && ownedByRewritten(s) && isDefaultish(s)) continue;
    parts.push({ text: s.scope && !a.has(s.key) ? s.full ?? s.text : s.text, owner: label(after, s.owner, vocab), word: s.about });
  }
  for (const s of removed) {
    if (under(s, removedScopes)) continue;
    if (ownedByRewritten(s)) continue;
    parts.push({ text: s.removal, owner: label(before, s.owner, vocab) ?? label(after, s.owner, vocab), word: s.owner });
  }
  return parts;
}

/** Settings a fresh word is given by default, which its pick brings along rather than chooses. */
function isDefaultish(s: Statement): boolean {
  return /:(number|gender)$/.test(s.key);
}
