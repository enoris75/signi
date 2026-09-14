import { describe, expect, it } from 'vitest';
import { periodControls } from '../../../src/components/PhraseBuilder/PeriodContainer/functions/periodControls.ts';
import {
  COORD_CONJUNCTION_OPTIONS,
  coordConjunctionOptions,
} from '../../../src/components/PhraseBuilder/interfaces.ts';
import { binding, CITATION, COMMAND, STATEMENT } from '../fixtures.ts';

describe('periodControls', () => {
  it('gives a standalone period no clause-level relations', () => {
    expect(periodControls(undefined, STATEMENT)).toEqual({});
  });

  it('reads the conditional state and actions off the workspace binding', () => {
    const b = binding({ pickActive: true, conditional: { hasSource: true, isPickTarget: true } });

    expect(periodControls(b, STATEMENT).conditional).toEqual({
      hasCondition: true,
      isIfClause: false,
      isPickTarget: true,
      pickActive: true,
      canStart: true,
      onStart: b.conditional.onStart,
      onClear: b.conditional.onClear,
      onPick: b.conditional.onPick,
      registerBorderAnchor: b.geometry.registerBorderAnchor,
    });
    expect(periodControls(binding({ conditional: { hasTarget: true } }), STATEMENT).conditional)
      .toMatchObject({ hasCondition: false, isIfClause: true, pickActive: false });
  });

  it('reads the coordinative state and actions off the workspace binding', () => {
    const b = binding({
      pickActive: true,
      coordinative: { hasTarget: true, conjunction: 'but', isPickTarget: true },
    });

    expect(periodControls(b, STATEMENT).coordinative).toEqual({
      hasCoordination: false,
      isCoordinated: true,
      conjunction: 'but',
      conjunctions: COORD_CONJUNCTION_OPTIONS,
      isPickTarget: true,
      pickActive: true,
      canStart: false,
      onStart: b.coordinative.onStart,
      onClear: b.coordinative.onClear,
      onPick: b.coordinative.onPick,
    });
    expect(
      periodControls(binding({ coordinative: { hasSource: true } }), STATEMENT).coordinative,
    ).toMatchObject({ hasCoordination: true, isCoordinated: false });
  });

  it('reads the instrumental target side off the workspace binding', () => {
    const b = binding({
      instrumental: { hasSource: true, hasTarget: false, level: 'process', isPickTarget: true },
    });

    expect(periodControls(b, STATEMENT).instrumental).toEqual({
      isInstrument: false,
      hasInstrument: true,
      level: 'process',
      onLevelChange: b.instrumental.onLevelChange,
      isPickTarget: true,
      onPick: b.instrumental.onPick,
    });
    expect(
      periodControls(binding({ instrumental: { hasTarget: true } }), STATEMENT).instrumental,
    ).toMatchObject({ isInstrument: true, hasInstrument: false });
  });

  it('lets a free statement start either relation', () => {
    const controls = periodControls(binding(), STATEMENT);

    expect(controls.conditional?.canStart).toBe(true);
    expect(controls.coordinative?.canStart).toBe(true);
  });

  it.each([
    ['a command', COMMAND, binding()],
    ['an infinitive citation', CITATION, binding()],
    ['an IF clause', STATEMENT, binding({ conditional: { hasTarget: true } })],
    ['a first clause', STATEMENT, binding({ coordinative: { hasSource: true } })],
    ['a coordinated clause', STATEMENT, binding({ coordinative: { hasTarget: true } })],
  ])('keeps %s from starting a conditional', (_, selection, b) => {
    expect(periodControls(b, selection).conditional?.canStart).toBe(false);
  });

  it.each([
    ['an infinitive citation', CITATION, binding()],
    ['a coordinated clause', STATEMENT, binding({ coordinative: { hasTarget: true } })],
    ['a main clause', STATEMENT, binding({ conditional: { hasSource: true } })],
    ['an IF clause', STATEMENT, binding({ conditional: { hasTarget: true } })],
  ])('keeps %s from starting a coordination', (_, selection, b) => {
    expect(periodControls(b, selection).coordinative?.canStart).toBe(false);
  });

  it('lets a command coordinate, with only the conjunctions that join two commands', () => {
    const coordinative = periodControls(binding(), COMMAND).coordinative!;

    expect(coordinative.canStart).toBe(true);
    expect(coordinative.conjunctions).toEqual(coordConjunctionOptions(true));
    expect(coordinative.conjunctions.map((o) => o.value)).toEqual(['and', 'or', 'but', 'then']);
  });
});
