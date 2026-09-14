import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { AbstractionLevel, WorkspaceBinding } from '../../src/components/PhraseBuilder/interfaces.ts';
import { resolveBuilderMode } from '../../src/components/PhraseBuilder/functions/resolveBuilderMode.ts';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'CAT', label: 'cat' };
const EAT: Concept = { id: 'EAT', role: 'verb', description: 'EAT', label: 'eat', transitivity: 'transitive' };

// A binding whose period is (or isn't) another clause's instrument, at the given level.
const instrument = (hasTarget: boolean, level: AbstractionLevel = 'object') =>
  ({ instrumental: { hasTarget, level } }) as WorkspaceBinding;

const mode = (over: Partial<Parameters<typeof resolveBuilderMode>[0]> = {}) =>
  resolveBuilderMode({
    selection: {},
    binding: undefined,
    possessorPath: undefined,
    nounPhraseOnly: false,
    hosted: false,
    ...over,
  });

describe('resolveBuilderMode', () => {
  it('draws no canvas for an untouched period, which offers its opening word picker', () => {
    expect(mode()).toEqual({
      nested: false,
      nounPhraseMode: false,
      actionMode: false,
      showCanvas: false,
      hasContent: false,
    });
  });

  it.each([
    ['a subject', { subject: CAT }],
    ['a verb', { verb: EAT }],
    ['a command', { imperative: true }],
    ['an infinitive', { infinitive: true }],
  ])('draws the canvas once the period holds %s', (_what, selection) => {
    expect(mode({ selection })).toMatchObject({ showCanvas: true, hasContent: true });
  });

  it('draws a hosted ring’s canvas from the start: an empty ring is its word picker', () => {
    expect(mode({ hosted: true }).showCanvas).toBe(true);
  });

  it('holds a bare noun phrase for an object-level instrument, and an act for a higher one', () => {
    expect(mode({ binding: instrument(true, 'object') })).toMatchObject({ nounPhraseMode: true, actionMode: false });
    expect(mode({ binding: instrument(true, 'process') })).toMatchObject({
      nounPhraseMode: false,
      actionMode: true,
      // Its first box is the verb, so the subject-picking empty state is skipped.
      showCanvas: true,
    });
    expect(mode({ binding: instrument(false, 'process') })).toMatchObject({ nounPhraseMode: false, actionMode: false });
  });

  it('keeps a nested builder out of its container’s instrument', () => {
    expect(mode({ binding: instrument(true, 'process'), possessorPath: 'subject/possessor' })).toMatchObject({
      nested: true,
      actionMode: false,
      nounPhraseMode: false,
    });
    expect(mode({ possessorPath: 'subject/conjunct/0', nounPhraseOnly: true }).nounPhraseMode).toBe(true);
  });

  it('counts only what the user put in as content', () => {
    expect(mode({ selection: { subjectPossessor: {}, subjectConjuncts: [], subject: undefined } }).hasContent).toBe(false);
    expect(mode({ selection: { verbNegative: true } }).hasContent).toBe(true);
    expect(mode({ selection: { subjectPossessor: { subject: CAT } } }).hasContent).toBe(true);
  });
});
