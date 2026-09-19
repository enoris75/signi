// The prompt's structure editing (P02 phase 6): brackets opened, stepped over and taken away as the
// line is typed, and a command moved out of a bracket it does not belong in.
import { describe, expect, it } from 'vitest';
import { nextStop, structure, type EditContext } from '../../src/console/language/edit.ts';
import type { WorkspaceState } from '../../src/console/language/types.ts';
import { empty, ok } from './helpers.ts';
import { EN } from './vocab.ts';

const ctx = (state: WorkspaceState = empty(), word?: EditContext['opts']['context']['word']): EditContext => ({
  state,
  opts: { context: { containerId: state.containers[0]!.id, word }, vocab: EN },
});

/** Type one character at the caret (`|` in `line`), and show where the line and caret end up. */
function typeAt(line: string, ch: string, c: EditContext = ctx()): string {
  const caret = line.indexOf('|');
  const before = line.replace('|', '');
  const after = before.slice(0, caret) + ch + before.slice(caret);
  const edit = structure(before, after, caret + 1, c);
  const text = edit?.text ?? after;
  const at = edit?.caret ?? caret + 1;
  return `${text.slice(0, at)}|${text.slice(at)}`;
}

/** ⌫ at the caret. */
function backspaceAt(line: string): string {
  const caret = line.indexOf('|');
  const before = line.replace('|', '');
  const after = before.slice(0, caret - 1) + before.slice(caret);
  const edit = structure(before, after, caret - 1, ctx());
  const text = edit?.text ?? after;
  const at = edit?.caret ?? caret - 1;
  return `${text.slice(0, at)}|${text.slice(at)}`;
}

describe('opening brackets', () => {
  it('opens a period word’s bracket as its command is finished', () => {
    expect(typeAt('/subj|', ' ')).toBe('/subj ( | )');
    expect(typeAt('/subj ( cat ) /verb|', ' ')).toBe('/subj ( cat ) /verb ( | )');
  });

  it('leaves a word inside a bracket to be written bare', () => {
    expect(typeAt('/subj ( cat /adj| )', ' ')).toBe('/subj ( cat /adj | )');
  });

  it('opens a new clause’s braces where nothing else may follow', () => {
    const state = ok('/subj child /verb read');
    const onChild = ctx(state, { containerId: 'p1', slot: 'subject' });
    expect(typeAt('/rel subj|', ' ', onChild)).toBe('/rel subj { | }');
    // An if-condition with no other period to take: a new one.
    expect(typeAt('/if|', ' ', ctx(state))).toBe('/if { | }');
    // With one to take, the list offers both.
    const two = ok('/subj child /verb read\n/subj dog /verb run');
    expect(typeAt('/if|', ' ', ctx(two))).toBe('/if |');
  });

  it('turns any bracket typed into the pair its command takes', () => {
    expect(typeAt('/subj ( cat /poss |', '(')).toBe('/subj ( cat /poss [ | ]');
    expect(typeAt('/subj ( cat /poss|', '(')).toBe('/subj ( cat /poss [ | ]');
    expect(typeAt('/subj ( dog ) /verb ( run ) /if |', '[')).toBe('/subj ( dog ) /verb ( run ) /if { | }');
    expect(typeAt('/subj |', '{')).toBe('/subj ( | )');
  });

  it('adds nothing for a bracket typed in one already open and empty, nor for a space between spaces', () => {
    expect(typeAt('/subj ( | )', '(')).toBe('/subj ( | )');
    expect(typeAt('/rel subj { | }', '(')).toBe('/rel subj { | }');
    expect(typeAt('/subj ( | )', ' ')).toBe('/subj ( | )');
    expect(typeAt('/subj ( cat | )', ' ')).toBe('/subj ( cat | )');
  });

  it('leaves a bracket typed in front of a word to be closed by hand', () => {
    expect(typeAt('/subj |cat', '(')).toBe('/subj (|cat');
  });
});

describe('closing brackets', () => {
  it('steps over the closer already there, whatever was typed', () => {
    expect(typeAt('/subj ( cat | )', ')')).toBe('/subj ( cat )|');
    expect(typeAt('/subj ( cat /poss [ man| ] )', ')')).toBe('/subj ( cat /poss [ man ]| )');
  });

  it('closes in the innermost bracket’s shape when there is nothing to step over', () => {
    expect(typeAt('/rel subj { /verb love |', ')')).toBe('/rel subj { /verb love }|');
  });

  it('takes an empty bracket’s closer away with it', () => {
    expect(backspaceAt('/subj (| )')).toBe('/subj |');
    // Not a bracket with something in it.
    expect(backspaceAt('/subj (| cat )')).toBe('/subj | cat )');
  });
});

describe('moving a command to where it belongs', () => {
  it('moves a command of the period out of a word’s bracket, and opens its own', () => {
    expect(typeAt('/subj ( cat /pl /verb| )', ' ')).toBe('/subj ( cat /pl ) /verb ( | )');
  });

  it('checks where it belongs against what the line has written so far', () => {
    // The object wants a verb — the one this very line gives.
    expect(typeAt('/verb ( eat /obj| )', ' ')).toBe('/verb ( eat ) /obj ( | )');
  });

  it('moves it past as many brackets as it leaves', () => {
    expect(typeAt('/subj ( cat /poss [ man /obj| ] )', ' ', ctx(ok('/verb eat')))).toBe('/subj ( cat /poss [ man ] ) /obj ( | )');
  });

  it('closes brackets the line has left open on the way out', () => {
    expect(typeAt('/subj ( cat /verb|', ' ')).toBe('/subj ( cat ) /verb ( | )');
  });

  it('leaves a command that belongs where it is', () => {
    expect(typeAt('/subj ( cat /pl| )', ' ')).toBe('/subj ( cat /pl | )');
  });
});

describe('moving word to word', () => {
  const line = '/subj ( cat /pl ) /verb ( eat )';

  it('goes to the next command or word, selecting it, and past each closer', () => {
    const at = (from: number, to = from) => nextStop(line, from, to, 1);
    expect(at(0)).toEqual({ from: 0, to: 5 });
    expect(at(0, 5)).toEqual({ from: 8, to: 11 }); // cat
    expect(at(8, 11)).toEqual({ from: 12, to: 15 }); // /pl
    expect(at(12, 15)).toEqual({ from: 17, to: 17 }); // past )
    expect(at(17)).toEqual({ from: 18, to: 23 }); // /verb
    expect(at(line.length)).toBeUndefined();
  });

  it('goes back to the one before', () => {
    expect(nextStop(line, 18, 23, -1)).toEqual({ from: 17, to: 17 });
    expect(nextStop(line, 11, 11, -1)).toEqual({ from: 8, to: 11 });
    expect(nextStop(line, 0, 5, -1)).toBeUndefined();
  });
});
