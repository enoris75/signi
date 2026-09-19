// The echo (P02 §4.3): a change made on the canvas, written back as the command it equals.
import { describe, expect, it } from 'vitest';
import { diffWorkspaces } from '../../src/console/language/diff.ts';
import * as R from '../../src/components/PhraseBuilder/phraseReducers.ts';
import type { WorkspaceState } from '../../src/console/language/types.ts';
import { ok } from './helpers.ts';
import { EN } from './vocab.ts';

const edit = (state: WorkspaceState, fn: (s: WorkspaceState['containers'][number]['selection']) => WorkspaceState['containers'][number]['selection'], i = 0): WorkspaceState => ({
  ...state,
  containers: state.containers.map((c, j) => (j === i ? { ...c, selection: fn(c.selection) } : c)),
});

const echo = (before: WorkspaceState, after: WorkspaceState) =>
  diffWorkspaces(before, after, EN).map((e) => e.parts.map((p) => (p.owner ? `${p.text} · ${p.owner}` : p.text)).join('  '));

describe('the echo of a canvas action', () => {
  const base = ok('/subj cat /adj brown /pl /verb eat /obj food');

  it('writes a setting as the command that sets it, and the word it is on', () => {
    expect(echo(base, edit(base, R.toggleNegative))).toEqual(['/not · eat']);
    expect(echo(base, edit(base, (s) => R.cycleTense(s)))).toEqual(['/past · eat']);
  });

  it('writes a setting going back to its default as the default', () => {
    const past = edit(base, (s) => R.cycleTense(s));
    const present = edit(past, (s) => R.cycleTense(R.cycleTense(s)));
    expect(echo(past, present)).toEqual(['/present · eat']);
    expect(echo(base, edit(base, (s) => R.toggleNumber(s, 'subject')))).toEqual(['/sg · cat']);
  });

  it('writes a new word as its role command, and a cleared one as /del', () => {
    expect(echo(base, edit(base, (s) => R.applyConceptSelect(s, 'modifier', EN.concepts.adverb![0]!)))).toEqual(['/adv fast · eat']);
    expect(echo(base, edit(base, (s) => R.applyClear(s, 'subjectAdjective')))).toEqual(['/del adj · cat']);
    expect(echo(base, edit(base, (s) => R.applyConceptSelect(s, 'directObject', EN.concepts.noun![1]!)))).toEqual(['/obj dog']);
  });

  it('writes a possessor phrase whole, and its inside changing as the change', () => {
    const owned = edit(base, (s) => R.updatePossessor(s, 'subject', (p) => R.applyConceptSelect(p, 'subject', EN.concepts.noun![3]!)));
    expect(echo(base, owned)).toEqual(['/poss ( /subj man ) · cat']);
    const plural = edit(owned, (s) => R.updatePossessor(s, 'subject', (p) => R.toggleNumber(p, 'subject')));
    expect(echo(owned, plural)).toEqual(['/pl · man']);
  });

  it('writes a new period as /new, and a removed one as /del period', () => {
    const two: WorkspaceState = { ...base, containers: [...base.containers, { id: 'x', selection: {} }] };
    expect(echo(base, two)).toEqual(['/new']);
    expect(echo(two, base)).toEqual(['/del period']);
  });

  it('writes a link between periods', () => {
    const two = ok('/subj dog /verb run\n/subj cat /verb eat');
    const linked: WorkspaceState = { ...two, links: [{ id: 'l', kind: 'conditional', source: { containerId: 'p1' }, target: { containerId: two.containers[1]!.id } }] };
    expect(echo(two, linked)).toEqual(['/if #2']);
    expect(echo(linked, two)).toEqual(['/del if']);
  });

  it('says nothing when nothing the phrase says changed', () => {
    expect(echo(base, { ...base })).toEqual([]);
  });
});
