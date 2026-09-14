import { describe, expect, test } from 'vitest';
import { verbFinalCluster } from './verbFinalCluster.js';

describe('verbFinalCluster', () => {
  test('the finite verb follows the non-finite tail', () => {
    expect(verbFinalCluster({ v2: 'wird', mid: '', tail: 'essen', zuInfinitive: '' })).toEqual(['essen', 'wird']);
    expect(verbFinalCluster({ v2: 'muss', mid: '', tail: 'gegessen haben', zuInfinitive: '' })).toEqual(['gegessen haben', 'muss']);
  });

  test('over a double infinitive the finite werden / würde leads the cluster', () => {
    expect(verbFinalCluster({ v2: 'würde', mid: '', tail: 'essen müssen', zuInfinitive: '', finiteLeadsTail: true })).toEqual(['würde', 'essen müssen']);
  });

  // A138: a separable verb's particle rejoins its finite verb at the end of a subordinate clause.
  test('a separable verb closes on its particle and finite verb, written as one word', () => {
    expect(verbFinalCluster({ v2: 'fügt', mid: '', tail: '', zuInfinitive: '', particle: 'hinzu' })).toEqual(['', 'hinzufügt']);
  });
});
