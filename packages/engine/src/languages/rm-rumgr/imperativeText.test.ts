import { describe, expect, test } from 'vitest';
import { concept, ESSER, MANGIAR, NUS, SA_TSCHENTAR, TI, VUS } from './rumgr.fixtures.js';
import { imperativeText } from './imperativeText.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';

const eat = concept(MANGIAR);
const sitDown = nonReflexiveVerb(concept(SA_TSCHENTAR));

describe('imperativeText', () => {
  test('the stored imperative of the addressee: mangia, mangiain, mangiai', () => {
    expect(imperativeText(eat, TI, undefined, false, '', [])).toBe('mangia');
    expect(imperativeText(eat, NUS, undefined, false, '', [])).toBe('mangiain');
    expect(imperativeText(eat, VUS, undefined, false, '', [])).toBe('mangiai');
  });

  test('esser: sajas', () => {
    expect(imperativeText(concept(ESSER), TI, undefined, false, '', ['attent'])).toBe('sajas attent');
  });

  test('the negation around it: na mangia betg', () => {
    expect(imperativeText(eat, TI, undefined, true, '', ['la mieur'])).toBe('na mangia betg la mieur');
    expect(imperativeText(eat, NUS, undefined, true, '', [])).toBe('na mangiain betg');
  });

  test('a reflexive command: the clitic hyphenated after, before the negative', () => {
    expect(imperativeText(sitDown, TI, undefined, false, 'ta', [])).toBe('tschenta-ta');
    expect(imperativeText(sitDown, NUS, undefined, false, 'ans', [])).toBe('tschentain-ans');
    expect(imperativeText(sitDown, VUS, undefined, false, 'as', [])).toBe('tschentai-as');
    expect(imperativeText(sitDown, TI, undefined, true, 'ta', [])).toBe('na ta tschenta betg');
  });

  test('falls back on the present, then the base', () => {
    expect(imperativeText(concept({ base: 'dar', '2sg_present': 'das' }), TI, undefined, false, '', [])).toBe('das');
    expect(imperativeText(concept({ base: 'dar' }), VUS, undefined, false, '', [])).toBe('dar');
  });

  test('a UI instruction is the infinitive, negated with betg', () => {
    expect(imperativeText(concept({ base: 'memorisar' }), TI, 'instruction', false, '', [])).toBe('memorisar');
    expect(imperativeText(concept({ base: 'memorisar' }), TI, 'instruction', true, '', ['la glista'])).toBe('betg memorisar la glista');
    expect(imperativeText(sitDown, TI, 'instruction', false, 'ta', [])).toBe('sa tschentar');
  });

  test('the tail follows, empty parts dropped', () => {
    expect(imperativeText(eat, TI, undefined, false, '', ['', 'la mieur', ''])).toBe('mangia la mieur');
  });
});
