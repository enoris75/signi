import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from './harness.js';

// P15: several adverbs on one verb, where a defect is the same in several languages.

// A384. AGAIN is a manner adverb, so NEVER + AGAIN is said word for word ("non corre mai di nuovo",
// "ne court jamais de nouveau", "läuft nie erneut"), where each language has its "never again".
describe('known bugs: NEVER + AGAIN is said word for word (A384)', () => {
  const said = sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER', modifiers: ['AGAIN'] } }));

  test.fails('each language says its "never again"', () => {
    expect(said.it).toBe('il gatto non corre mai più.');
    expect(said.fr).toBe('le chat ne court plus jamais.');
    expect(said.de).toBe('der Kater läuft nie wieder.');
    expect(said.es).toBe('el gato nunca más corre.');
    expect(said.pt).toBe('o gato nunca mais corre.');
    expect(said.ja).toBe('猫は二度と走りません。');
  });

  test('regression: English, and AGAIN and NEVER alone', () => {
    expect(said.en).toBe('the cat never runs again.');
    const again = sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'AGAIN' } }));
    expect(again.it).toBe('il gatto corre di nuovo.');
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER' } })).it).toBe('il gatto non corre mai.');
  });
});

// A387. An instrument's act ("by choosing a word slowly") resolves all its adverbs, but every engine
// reads only `action.modifier`, the primary, so a second adverb is dropped without a word.
describe('known bugs: an instrument\'s act says one adverb of several (A387)', () => {
  const speak = (action: Record<string, unknown>) => sayAll(clause(np('CAT'), 'SPEAK', {
    complements: { instrumental: { phrase: np('WORD', { definiteness: 'indefinite' }), specifiers: [{ kind: 'abstraction', value: 'process' }], action: { verb: 'CHOOSE', ...action } } },
  }));
  const both = { en: ['often', 'slowly'], it: ['spesso', 'lentamente'], fr: ['souvent', 'lentement'], de: ['oft', 'langsam'], es: ['a menudo', 'lentamente'], pt: ['frequentemente', 'devagar'], ja: ['よく', 'ゆっくり'] } as const;

  test.fails('the act says both adverbs', () => {
    const said = speak({ modifier: 'SLOWLY', modifiers: ['OFTEN'] });
    for (const [lang, words] of Object.entries(both)) for (const w of words) expect(said[lang as keyof typeof both], lang).toContain(w);
  });

  test('regression: one adverb on the act', () => {
    expect(speak({ modifier: 'SLOWLY' }).en).toBe('the cat speaks by choosing a word slowly.');
    expect(speak({ modifier: 'SLOWLY' }).de).toBe('der Kater spricht, indem er ein Wort langsam wählt.');
  });
});
