import { describe, expect, test } from 'vitest';
import { adj, np } from '../resolved.fixtures.js';
import { jaModifiedNegative } from './jaModifiedNegative.js';

const NANI = { base: '何', reading: 'なに', person: '3', negative_modified: 'もの', definiteness: 'no' };
const OOKII = adj({ base: '大きい', reading: 'おおきい' });
const BETSU = adj({ base: '別の', reading: 'べつの', before_negative_pronoun: 'ほかに' });

describe('jaModifiedNegative', () => {
  test('an adjective goes on the plain noun', () => {
    expect(jaModifiedNegative(np(NANI, {}, { adjectives: [OOKII] }))).toBe('modified');
  });

  test('OTHER is the adverb ほかに', () => {
    expect(jaModifiedNegative(np(NANI, {}, { adjectives: [BETSU] }))).toBe('else');
    expect(jaModifiedNegative(np(NANI, {}, { adjectives: [BETSU, OOKII] }))).toBe('modified');
  });

  test('nothing to do without an adjective, outside the negative, or on a noun', () => {
    expect(jaModifiedNegative(np(NANI))).toBeUndefined();
    expect(jaModifiedNegative(np(NANI, { definiteness: 'indefinite' }, { adjectives: [OOKII] }))).toBeUndefined();
    expect(jaModifiedNegative(np({ base: '猫', definiteness: 'no' }, {}, { adjectives: [OOKII] }))).toBeUndefined();
  });
});
