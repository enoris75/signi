import { describe, expect, test } from 'vitest';
import { adj, ALT, BOOT, GROSS, np, nounModifier, SEGEL, WORT } from './de.fixtures.js';
import { modifierGenitives } from './modifierGenitives.js';

const SCHOEPFER = { base: 'Schöpfer', plural: 'Schöpfer', gender: 'masc', count: 'singular' };
const PHRASE = { base: 'Phrase', plural: 'Phrasen', gender: 'fem', count: 'singular' };
const SEMANTISCH = { role: 'adjective', base: 'semantisch' };

describe('modifierGenitives', () => {
  test('is empty when no modifier carries an adjective', () => {
    expect(modifierGenitives(np(BOOT))).toBe('');
    expect(modifierGenitives(np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] }))).toBe('');
  });

  test('a plural modifier takes the strong genitive -er and no noun ending', () => {
    const phrase = np(SCHOEPFER, {}, { nounModifiers: [nounModifier({ ...PHRASE, number: 'plural' }, [adj(SEMANTISCH)])] });
    expect(modifierGenitives(phrase)).toBe(' semantischer Phrasen');
  });

  test('a masculine/neuter singular pairs -en on the adjective with -(e)s on the noun', () => {
    const phrase = np(SEGEL, {}, { nounModifiers: [nounModifier(BOOT, [adj(GROSS), adj(ALT)])] });
    expect(modifierGenitives(phrase)).toBe(' großen alten Bootes');
  });

  test('renders one space-led phrase per adjective-bearing modifier, in order', () => {
    const phrase = np(SCHOEPFER, {}, {
      nounModifiers: [
        nounModifier({ ...WORT, number: 'plural' }, [adj(ALT)]),
        nounModifier(SEGEL),
        nounModifier({ ...PHRASE, number: 'plural' }, [adj(SEMANTISCH)]),
      ],
    });
    expect(modifierGenitives(phrase)).toBe(' alter Wörter semantischer Phrasen');
  });
});
