import { describe, expect, it } from 'vitest';
import { UI_STRINGS, type UiStringKey } from '@signi/shared';
import {
  periodAccent,
  periodLabel,
  pickTarget,
} from '../../../src/components/PhraseBuilder/PeriodContainer/functions/periodAppearance.ts';
import type { ClauseControls } from '../../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts';
import {
  cond,
  conditionalControl,
  coord,
  coordinativeControl,
  inst,
  instrumentalControl,
  mood,
} from '../fixtures.ts';

// The UI strings as the app renders them before the bundle loads: in English.
const t = (key: UiStringKey) => UI_STRINGS[key].fallback;

describe('pickTarget', () => {
  it.each<[string, ClauseControls, string | undefined]>([
    ['a period given no relations', {}, undefined],
    [
      'a period that is no target of the pick pending',
      {
        conditional: conditionalControl({ pickActive: true }),
        coordinative: coordinativeControl({ pickActive: true }),
        instrumental: instrumentalControl(),
      },
      undefined,
    ],
    ['a legal IF clause', cond({ pickActive: true, isPickTarget: true }), 'conditional'],
    ['a legal coordinated clause', coord({ pickActive: true, isPickTarget: true }), 'coordinative'],
    ['a legal instrument', inst({ isPickTarget: true }), 'instrumental'],
  ])('finds the relation %s is a target of', (_, controls, relation) => {
    expect(pickTarget(controls)).toBe(relation);
  });
});

describe('periodAccent', () => {
  it('draws a free statement plain', () => {
    expect(periodAccent({})).toEqual({
      borderColor: 'divider',
      borderLeftColor: 'text.secondary',
      boxShadow: undefined,
      gutter: false,
    });
  });

  it.each<[string, ClauseControls, string]>([
    ['an IF condition', cond({ pickActive: true, isPickTarget: true }), 'warning.main'],
    ['a coordinated clause', coord({ pickActive: true, isPickTarget: true }), 'info.main'],
    ['an instrument', inst({ isPickTarget: true }), 'secondary.main'],
  ])('lights a droppable %s all round in its relation’s colour, with a glow', (_, controls, colour) => {
    const accent = periodAccent(controls);

    expect(accent.borderColor).toBe(colour);
    expect(accent.borderLeftColor).toBe(colour);
    expect(accent.boxShadow).toMatch(/^0 0 0 2px rgba\(/);
  });

  it.each<[string, ClauseControls, string]>([
    ['a main clause', cond({ hasCondition: true }), 'warning.main'],
    ['an IF clause', cond({ isIfClause: true }), 'warning.main'],
    ['a first clause', coord({ hasCoordination: true }), 'info.main'],
    ['a coordinated clause', coord({ isCoordinated: true }), 'info.main'],
    ['an instrument phrase', inst({ isInstrument: true }), 'secondary.main'],
    ['a clause acting with an instrument', inst({ hasInstrument: true }), 'text.secondary'],
    ['a command', { imperative: mood(true) }, 'success.main'],
    ['an infinitive', { infinitive: mood(true) }, 'primary.main'],
    ['a period whose moods are off', { imperative: mood(false), infinitive: mood(false) }, 'text.secondary'],
  ])('rules the left edge of %s in its colour', (_, controls, colour) => {
    const accent = periodAccent(controls);

    expect(accent.borderLeftColor).toBe(colour);
    expect(accent.borderColor).toBe('divider');
    expect(accent.boxShadow).toBeUndefined();
  });

  it.each<[string, ClauseControls, string]>([
    [
      'a pick target over the relation it already takes part in',
      { ...cond({ hasCondition: true }), ...coord({ pickActive: true, isPickTarget: true }) },
      'info.main',
    ],
    [
      'a relation over the mood',
      { imperative: mood(true, true), ...coord({ hasCoordination: true }) },
      'info.main',
    ],
    [
      'the instrument phrase over the mood',
      { imperative: mood(true), ...inst({ isInstrument: true }) },
      'secondary.main',
    ],
    [
      'the command over the infinitive',
      { imperative: mood(true), infinitive: mood(true) },
      'success.main',
    ],
  ])('ranks %s', (_, controls, colour) => {
    expect(periodAccent(controls).borderLeftColor).toBe(colour);
  });

  it.each<[string, ClauseControls, boolean]>([
    ['a main clause', cond({ hasCondition: true }), true],
    ['an IF clause', cond({ isIfClause: true }), true],
    ['a first clause', coord({ hasCoordination: true }), true],
    ['a coordinated clause', coord({ isCoordinated: true }), true],
    ['a clause acting with an instrument', inst({ hasInstrument: true }), true],
    ['an instrument phrase', inst({ isInstrument: true }), true],
    [
      'a period outside any relation',
      {
        conditional: conditionalControl(),
        coordinative: coordinativeControl(),
        instrumental: instrumentalControl(),
      },
      false,
    ],
    ['a command', { imperative: mood(true) }, false],
    ['a pick target not yet linked', cond({ pickActive: true, isPickTarget: true }), false],
  ])('frees a right gutter for the connector of %s: %s', (_, controls, gutter) => {
    expect(periodAccent(controls).gutter).toBe(gutter);
  });
});

describe('periodLabel', () => {
  it.each<[string, ClauseControls, string]>([
    ['a free statement', {}, ''],
    ['an instrument phrase', inst({ isInstrument: true }), 'Instrumental'],
    ['a command', { imperative: mood(true) }, 'Command'],
    ['an infinitive', { infinitive: mood(true) }, 'Infinitive phrase'],
    ['a main clause', cond({ hasCondition: true }), 'Main clause'],
    ['an IF clause', cond({ isIfClause: true }), 'Conditional clause'],
    ['a first clause', coord({ hasCoordination: true, conjunction: 'and' }), 'First clause'],
    [
      'a coordinated clause, by its conjunction',
      coord({ isCoordinated: true, conjunction: 'but' }),
      'Coordinated clause (But)',
    ],
    [
      'a command that coordinates another, by its mood',
      { imperative: mood(true, true), ...coord({ hasCoordination: true, conjunction: 'then' }) },
      'Command',
    ],
    [
      'an instrument phrase in the imperative, by its link',
      { imperative: mood(true), ...inst({ isInstrument: true }) },
      'Instrumental',
    ],
  ])('names %s', (_, controls, label) => {
    expect(periodLabel(controls, t)).toBe(label);
  });

  it('reads its catalog entries through the translation it is given', () => {
    const translated = (key: UiStringKey) => `<${key}>`;

    expect(periodLabel(inst({ isInstrument: true }), translated)).toBe('<slot.instrumental>');
    expect(periodLabel({ imperative: mood(true) }, translated)).toBe('<imperative.command>');
    expect(periodLabel({ infinitive: mood(true) }, translated)).toBe('<infinitive.phrase>');
    expect(periodLabel(cond({ hasCondition: true }), translated)).toBe('<clause.main>');
    expect(periodLabel(cond({ isIfClause: true }), translated)).toBe('<clause.conditional>');
    expect(periodLabel(coord({ hasCoordination: true }), translated)).toBe('<clause.first>');
    expect(periodLabel(coord({ isCoordinated: true }), translated)).toBe('<clause.coordinated>');
  });
});
