import { describe, expect, test } from 'vitest';
import { questionGapComplement, questionStandIn } from './questionGapComplement.js';

describe('questionStandIn', () => {
  test('the engine\'s word, bare, third singular, marked as the question, with the answer\'s animacy', () => {
    const who = questionStandIn({ role: 'comitative', animate: true }, { base: 'chi' });
    expect(who.conjuncts[0].head).toEqual({
      conceptId: '',
      forms: { base: 'chi', definiteness: 'bare', gender: 'masc', number: 'singular', question: '1', animate: '1', human: '1' },
    });
    expect(who.agreement).toBe(who.conjuncts[0].head.forms);
    expect(questionStandIn({ role: 'locative', animate: false }, { base: 'che cosa' }).conjuncts[0].head.forms['animate']).toBeUndefined();
  });

  test('the engine may override the definiteness', () => {
    expect(questionStandIn({ role: 'comitative', animate: true }, { definiteness: 'question' }).conjuncts[0].head.forms['definiteness'])
      .toBe('question');
  });
});

describe('questionGapComplement', () => {
  test('a one-complement map in the gapped relation, its specifiers kept', () => {
    const under = [{ kind: 'path', value: 'under' }] as const;
    const map = questionGapComplement({ role: 'locative', animate: false, specifiers: [...under] }, { base: 'quoi' });
    expect(Object.keys(map ?? {})).toEqual(['locative']);
    expect(map?.locative?.specifiers).toEqual(under);
    expect(map?.locative?.phrase.conjuncts[0].head.forms['base']).toBe('quoi');
    expect(questionGapComplement({ role: 'terminus', animate: true }, { base: 'qui' })?.terminus?.specifiers).toBeUndefined();
  });

  test('undefined for a gap that is no complement', () => {
    expect(questionGapComplement({ role: 'subject', animate: true }, {})).toBeUndefined();
    expect(questionGapComplement({ role: 'directObject', animate: false }, {})).toBeUndefined();
    expect(questionGapComplement({ role: 'possessor', possessed: 'subject', animate: true }, {})).toBeUndefined();
    expect(questionGapComplement(undefined, {})).toBeUndefined();
  });
});
