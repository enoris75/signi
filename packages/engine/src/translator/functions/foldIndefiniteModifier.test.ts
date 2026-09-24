import { describe, expect, test } from 'vitest';
import { adj, concept } from '../../languages/resolved.fixtures.js';
import { foldIndefiniteModifier } from './foldIndefiniteModifier.js';

const QUALCOSA = { base: 'qualcosa', object: 'qualcosa', disjunctive: 'qualcosa', person: '3', indefinite: '1', negative: 'niente', with_other: "qualcos'altro", negative_with_other: "nient'altro" };
const SOMEONE = { base: 'someone', object: 'someone', disjunctive: 'someone', person: '3', indefinite: '1', negative: 'anyone', negative_subject: 'nobody' };

describe('foldIndefiniteModifier', () => {
  test('writes the adjective into every surface, positive and negative', () => {
    const head = concept(SOMEONE);
    expect(foldIndefiniteModifier(head, [adj({ base: 'new' })], 'en')).toBe(true);
    expect(head.forms).toMatchObject({
      base: 'someone new', object: 'someone new', disjunctive: 'someone new',
      negative: 'anyone new', negative_subject: 'nobody new', negative_object: 'anyone new', negative_disjunctive: 'anyone new',
    });
  });

  test('a fused OTHER replaces the pronoun', () => {
    const head = concept(QUALCOSA);
    foldIndefiniteModifier(head, [adj({ base: 'altro', after_pronoun: 'altro' })], 'it');
    expect(head.forms).toMatchObject({ base: "qualcos'altro", object: "qualcos'altro", negative: "nient'altro", negative_object: "nient'altro" });
    // Any other adjective does not.
    const big = concept(QUALCOSA);
    foldIndefiniteModifier(big, [adj({ base: 'grande' })], 'it');
    expect(big.forms).toMatchObject({ base: 'qualcosa di grande', negative: 'niente di grande' });
  });

  // Localization B90: German EVERYTHING declines, so its fused OTHER names the dative of its own.
  test('a fused OTHER may name its form per slot', () => {
    const head = concept({ base: 'alles', object: 'alles', disjunctive: 'allem', person: '3', indefinite: '1', with_other: 'alles andere', with_other_disjunctive: 'allem anderen' });
    foldIndefiniteModifier(head, [adj({ base: 'ander', after_pronoun: 'anderes' })], 'de');
    expect(head.forms).toMatchObject({ base: 'alles andere', object: 'alles andere', disjunctive: 'allem anderen' });
  });

  test('Japanese keeps its adjectives, and nothing to fold is no fold', () => {
    expect(foldIndefiniteModifier(concept(SOMEONE), [adj({ base: '大きい' })], 'ja')).toBe(false);
    expect(foldIndefiniteModifier(concept(SOMEONE), [], 'en')).toBe(false);
  });

  test('refuses what it cannot say rather than drop it', () => {
    expect(() => foldIndefiniteModifier(concept(SOMEONE), [adj({ base: 'new' }), adj({ base: 'big' })], 'en')).toThrow(/one adjective/);
    expect(() => foldIndefiniteModifier(concept(SOMEONE), [adj({ base: 'big' }, { degree: 'more' })], 'en')).toThrow(/degree/);
    expect(() => foldIndefiniteModifier(concept(SOMEONE), [adj({ base: 'big' }, { intensifier: 'very' })], 'en')).toThrow(/intensifier/);
  });
});
