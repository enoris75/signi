import { describe, expect, test } from 'vitest';
import { adj, ALT, BESTIMMUNG_RICHTUNG, BOOT, GROSS, JUNGE, np, nounModifier, SEGEL, WORT } from './de.fixtures.js';
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

  test('a weak noun takes its genitive -(e)n in place of the -(e)s', () => {
    expect(modifierGenitives(np(SCHOEPFER, {}, { nounModifiers: [nounModifier(JUNGE, [adj(ALT)])] }))).toBe(' alten Jungen');
    expect(modifierGenitives(np(SCHOEPFER, {}, { nounModifiers: [nounModifier({ ...JUNGE, number: 'plural' }, [adj(ALT)])] }))).toBe(' alter Jungen');
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

  // A295: a name's inherent adjective and fixed genitive take the modifier into the genitive.
  test('a name\'s inherent adjective declines after the own ones, its postnominal follows the noun', () => {
    const FRAU = { base: 'Frau', plural: 'Frauen', gender: 'fem', count: 'singular', adjective: 'jung' };
    expect(modifierGenitives(np(BOOT, {}, { nounModifiers: [nounModifier({ ...FRAU, number: 'plural' })] }))).toBe(' junger Frauen');
    expect(modifierGenitives(np(BOOT, {}, { nounModifiers: [nounModifier({ ...FRAU, number: 'plural' }, [adj(GROSS)])] }))).toBe(' großer junger Frauen');
    expect(modifierGenitives(np(BOOT, {}, { nounModifiers: [nounModifier({ ...BESTIMMUNG_RICHTUNG, number: 'plural' })] })))
      .toBe(' adverbialer Bestimmungen der Richtung');
  });
});
