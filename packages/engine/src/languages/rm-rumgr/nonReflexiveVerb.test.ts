import { describe, expect, test } from 'vitest';
import { concept, MANGIAR, SA_AVRIR, SA_TSCHENTAR } from './rumgr.fixtures.js';
import { isReflexive, nonReflexiveVerb } from './nonReflexiveVerb.js';

describe('isReflexive', () => {
  test('the lexeme stores the clitic on the base', () => {
    expect(isReflexive(SA_TSCHENTAR)).toBe(true);
    expect(isReflexive(MANGIAR)).toBe(false);
    expect(isReflexive({})).toBe(false);
  });
});

describe('nonReflexiveVerb', () => {
  test('takes sa off the base and the clitic off every finite cell', () => {
    const { forms } = nonReflexiveVerb(concept(SA_TSCHENTAR, 'SIT_DOWN'));
    expect(forms['base']).toBe('tschentar');
    expect(forms['1sg_present']).toBe('tschent');
    expect(forms['1pl_present']).toBe('tschentain');
    expect(forms['2pl_present']).toBe('tschentais');
    expect(forms['3sg_conditional']).toBe('tschentass');
    expect(forms['participle']).toBe('tschentà');
  });

  test('takes the hyphenated enclitic off the imperatives', () => {
    const { forms } = nonReflexiveVerb(concept(SA_TSCHENTAR));
    expect(forms['2sg_imperative']).toBe('tschenta');
    expect(forms['1pl_imperative']).toBe('tschentain');
    expect(forms['2pl_imperative']).toBe('tschentai');
  });

  test('selects esser, even where the lexeme forgot to say so', () => {
    const { aux: _aux, ...noAux } = SA_TSCHENTAR;
    expect(nonReflexiveVerb(concept(noAux)).forms['aux']).toBe('be');
  });

  test('keeps the concept id', () => {
    expect(nonReflexiveVerb(concept(SA_AVRIR, 'OPEN_ONESELF')).conceptId).toBe('OPEN_ONESELF');
    expect(nonReflexiveVerb(concept(SA_AVRIR)).forms['3sg_present']).toBe('avra');
  });

  test('returns any other verb as it is', () => {
    const eat = concept(MANGIAR, 'EAT');
    expect(nonReflexiveVerb(eat)).toBe(eat);
  });
});
