import { describe, expect, it } from 'vitest';
import {
  relationButtonState,
  type RelationAction,
  type RelationFace,
  type RelationStanding,
} from '../../../src/components/PhraseBuilder/PeriodContainer/functions/relationButtonState.ts';

// A period at neither end of the relation, free to start it, with no pick pending.
const standing = (overrides: Partial<RelationStanding> = {}): RelationStanding => ({
  source: false,
  target: false,
  isPickTarget: false,
  pickActive: false,
  canStart: true,
  ...overrides,
});

describe('relationButtonState', () => {
  it.each<[string, Partial<RelationStanding>, RelationFace, RelationAction]>([
    ['a period free to start the relation', {}, 'free', 'start'],
    ['a period that may not start it', { canStart: false }, 'free', null],
    ['its source', { source: true, canStart: false }, 'source', 'clear'],
    ['its source, even where it could start another', { source: true }, 'source', 'clear'],
    ['its target', { target: true, canStart: false }, 'target', null],
    [
      'a legal target during a pick',
      { pickActive: true, isPickTarget: true, canStart: false },
      'droppable',
      'pick',
    ],
    ['a period free to start it, during a pick', { pickActive: true }, 'free', null],
    ['its source during a pick', { pickActive: true, source: true }, 'source', null],
    ['its target during a pick', { pickActive: true, target: true }, 'target', null],
  ])('on %s', (_, overrides, face, action) => {
    expect(relationButtonState(standing(overrides))).toMatchObject({ face, action });
  });

  it.each<[string, Partial<RelationStanding>, boolean]>([
    ['a period outside the relation', {}, false],
    ['its source', { source: true }, true],
    ['its target', { target: true }, true],
  ])('counts %s as taking part: %s', (_, overrides, active) => {
    expect(relationButtonState(standing(overrides)).active).toBe(active);
  });

  it('marks exactly a pick target droppable', () => {
    expect(relationButtonState(standing({ pickActive: true })).droppable).toBe(false);
    expect(
      relationButtonState(standing({ pickActive: true, isPickTarget: true })).droppable,
    ).toBe(true);
  });
});
