import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement } from '../../types.js';
import { genericSubject } from './genericSubject.js';

const el = (forms: Record<string, string>, adjectives: string[] = []): ResolvedNounElement => ({
  conjuncts: [{
    head: { conceptId: 'CAT', forms },
    adjectives: adjectives.map((conceptId) => ({ conceptId, forms: {} })),
    nounModifiers: [],
  }],
  agreement: forms,
});
const det = (e: ResolvedNounElement | undefined) => e!.conjuncts[0].head.forms['definiteness'];

describe('genericSubject (A376)', () => {
  test('a bare plural or mass subject takes the definite in the Romance four', () => {
    for (const language of ['it', 'fr', 'es', 'pt']) {
      const plural = genericSubject(el({ definiteness: 'bare', number: 'plural' }), language);
      expect(det(plural)).toBe('definite');
      expect(plural.agreement['definiteness']).toBe('definite');
      expect(det(genericSubject(el({ definiteness: 'bare', number: 'singular', uncountable: '1' }), language))).toBe('definite');
    }
  });

  test('English, German, Swiss German and Japanese leave it bare', () => {
    for (const language of ['en', 'de', 'gsw', 'ja']) {
      const bare = el({ definiteness: 'bare', number: 'plural' });
      expect(genericSubject(bare, language)).toBe(bare);
    }
  });

  test('a bare the plan did not pick stays bare: numeral, name, pronoun, otro, a bare count singular', () => {
    const untouched = [
      el({ definiteness: 'bare', number: 'plural', numeral: '2' }),
      el({ definiteness: 'bare', number: 'singular', proper: '1', takes_article: '0' }),
      el({ definiteness: 'bare', number: 'plural', person: '3' }),
      el({ definiteness: 'bare', number: 'singular' }),
    ];
    for (const e of untouched) expect(genericSubject(e, 'it')).toBe(e);
    const otros = el({ definiteness: 'bare', number: 'plural' }, ['OTHER']);
    expect(genericSubject(otros, 'es')).toBe(otros);
    expect(det(genericSubject(otros, 'it'))).toBe('definite');
  });

  test('another determiner, and no subject at all, are untouched', () => {
    const indefinite = el({ definiteness: 'indefinite', number: 'plural' });
    expect(genericSubject(indefinite, 'fr')).toBe(indefinite);
    expect(genericSubject(undefined, 'fr')).toBeUndefined();
  });
});
