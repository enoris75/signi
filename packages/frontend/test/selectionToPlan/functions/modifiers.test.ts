import { describe, expect, it } from 'vitest';
import { modifiers } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/modifiers.ts';
import { BIG, CAT, OLD, PHRASE, RED, SAIL, SEMANTIC } from '../fixtures.ts';

describe('modifiers', () => {
  it('is empty for a block with no adjectives', () => {
    expect(modifiers({ subject: CAT }, 'subject')).toEqual({
      adjectives: [],
      adjectiveDegrees: [],
      nounModifiers: [],
    });
  });

  it('lists real adjectives in chain order, each with its degree or the positive', () => {
    const sel = {
      subject: CAT,
      subjectAdjective: BIG,
      subjectAdjective2: RED,
      subjectAdjective3: OLD,
      adjectiveDegrees: { subjectAdjective2: 'more' as const },
    };

    expect(modifiers(sel, 'subject')).toEqual({
      adjectives: ['BIG', 'RED', 'OLD'],
      adjectiveDegrees: ['positive', 'more', 'positive'],
      nounModifiers: [],
    });
  });

  it('keeps the adjectives past a hole in the chain', () => {
    expect(modifiers({ subject: CAT, subjectAdjective3: RED }, 'subject').adjectives).toEqual(['RED']);
  });

  it('reads only the adjectives of the block it is asked for', () => {
    const sel = { subject: CAT, subjectAdjective: BIG, directObjectAdjective: RED, locativeAdjective: OLD };

    expect(modifiers(sel, 'directObject').adjectives).toEqual(['RED']);
    expect(modifiers(sel, 'locative').adjectives).toEqual(['OLD']);
  });

  it('turns a noun in an adjective slot into a modifier with the default feature relation', () => {
    expect(modifiers({ subject: CAT, subjectAdjective: SAIL }, 'subject')).toEqual({
      adjectives: [],
      adjectiveDegrees: [],
      nounModifiers: [{ concept: 'SAIL', relation: 'feature' }],
    });
  });

  it('gives a noun modifier its chosen relation, a plural number and its own adjective', () => {
    const sel = {
      subject: CAT,
      subjectAdjective: PHRASE,
      modifierRelations: { subjectAdjective: 'purpose' as const },
      modifierNumbers: { subjectAdjective: 'plural' as const },
      modifierAdjectives: { subjectAdjective: SEMANTIC },
    };

    expect(modifiers(sel, 'subject').nounModifiers).toEqual([
      { concept: 'PHRASE', relation: 'purpose', number: 'plural', adjectives: ['SEMANTIC'] },
    ]);
  });

  it('leaves out a singular modifier number, the default', () => {
    const sel = { subject: CAT, subjectAdjective: SAIL, modifierNumbers: { subjectAdjective: 'singular' as const } };

    expect(modifiers(sel, 'subject').nounModifiers[0]).not.toHaveProperty('number');
  });

  it('ignores the modifier settings of a slot that holds a real adjective', () => {
    const sel = {
      subject: CAT,
      subjectAdjective: BIG,
      modifierRelations: { subjectAdjective: 'material' as const },
      modifierAdjectives: { subjectAdjective: SEMANTIC },
    };

    expect(modifiers(sel, 'subject')).toEqual({
      adjectives: ['BIG'],
      adjectiveDegrees: ['positive'],
      nounModifiers: [],
    });
  });

  it('keeps the degrees aligned with the adjectives when nouns sit between them', () => {
    const sel = {
      subject: CAT,
      subjectAdjective: BIG,
      subjectAdjective2: SAIL,
      subjectAdjective3: RED,
      adjectiveDegrees: { subjectAdjective: 'most' as const, subjectAdjective3: 'less' as const },
    };

    expect(modifiers(sel, 'subject')).toEqual({
      adjectives: ['BIG', 'RED'],
      adjectiveDegrees: ['most', 'less'],
      nounModifiers: [{ concept: 'SAIL', relation: 'feature' }],
    });
  });
});
