// Shorthands for the console's language tests: an empty workspace, deterministic ids, and running a
// line or a script where the context is.
import { applyScript, type ApplyResult } from '../../src/console/language/apply.ts';
import { printPeriod, printWorkspace } from '../../src/console/language/print.ts';
import type { ConsoleContext, Vocabulary, WordRef, WorkspaceState } from '../../src/console/language/types.ts';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import { EN } from './vocab.ts';

/** A workspace of one empty period, `p1` — what the app starts with. */
export const empty = (): WorkspaceState => ({ containers: [{ id: 'p1', selection: {} }], links: [] });

/** A workspace of the given periods, `p1`, `p2`, … */
export const periods = (...selections: PhraseSelection[]): WorkspaceState => ({
  containers: selections.map((selection, i) => ({ id: `p${i + 1}`, selection })),
  links: [],
});

/** Fresh ids for what a line makes: `n1`, `n2`, … */
export function ids(): () => string {
  let n = 0;
  return () => `n${++n}`;
}

export function run(
  text: string,
  {
    state = empty(),
    context = { containerId: state.containers[0]!.id },
    vocab = EN,
    word,
  }: { state?: WorkspaceState; context?: ConsoleContext; vocab?: Vocabulary; word?: WordRef } = {},
): ApplyResult {
  const ctx = word ? { containerId: word.containerId, word } : context;
  return applyScript(state, text, { context: ctx, vocab, newId: ids() });
}

/** Run a line that must apply cleanly, and hand back the workspace it made. */
export function ok(text: string, opts: Parameters<typeof run>[1] = {}): WorkspaceState {
  const result = run(text, opts);
  if (result.diagnostic) throw new Error(`“${text}”: ${result.diagnostic.message}`);
  return result.state;
}

export const sel = (state: WorkspaceState, i = 0): PhraseSelection => state.containers[i]!.selection;

export const print = (state: WorkspaceState, i = 0, vocab: Vocabulary = EN) =>
  printPeriod(state, state.containers[i]!.id, vocab).text;

export const script = (state: WorkspaceState, vocab: Vocabulary = EN) => printWorkspace(state, vocab);

/** The ids of a selection's concepts, and its other values as they are — for compact assertions. */
export function ids_(s: PhraseSelection): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(s).map(([k, v]) => [
      k,
      v && typeof v === 'object' && 'id' in v ? (v as { id: string }).id : v,
    ]),
  );
}
