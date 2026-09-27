import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from './harness.js';

// P15: several adverbs on one verb, where a defect is the same in several languages.

// A384. AGAIN is a manner adverb, so NEVER + AGAIN is said word for word ("non corre mai di nuovo",
// "ne court jamais de nouveau", "läuft nie erneut"), where each language has its "never again".
describe('known bugs: NEVER + AGAIN is said word for word (A384)', () => {
  const said = sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER', modifiers: ['AGAIN'] } }));

  test('each language says its "never again"', () => {
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

  test('the pair keeps NEVER\'s slot in a compound tense, whichever adverb the plan names first', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'AGAIN', modifiers: ['NEVER'] } }))).toEqual(said);
    const had = sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER', modifiers: ['AGAIN'], tense: 'past', aspect: 'resultative' } }));
    expect(had).toEqual({
      en: 'the cat had never run again.',
      it: 'il gatto non aveva mai più corso.',
      fr: "le chat n'avait plus jamais couru.",
      de: 'der Kater war nie wieder gelaufen.',
      es: 'el gato nunca más había corrido.',
      pt: 'o gato nunca mais tinha corrido.',
      ja: '猫は二度と走っていませんでした。',
    });
  });

  test('a further adverb stays beside the pair', () => {
    const fast = sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER', modifiers: ['AGAIN', 'FAST'] } }));
    expect(fast.it).toBe('il gatto non corre mai più velocemente.');
    expect(fast.de).toBe('der Kater läuft nie wieder schnell.');
    expect(fast.ja).toBe('猫は二度と速く走りません。');
  });

  test('regression: a question asks "ever … again", word for word', () => {
    const asked = sayAll({ ...clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER', modifiers: ['AGAIN'] } }), interrogative: true });
    expect(asked.en).toBe('does the cat ever run again?');
    expect(asked.it).toBe('il gatto corre mai di nuovo?');
    expect(asked.de).toBe('läuft der Kater je erneut?');
    expect(asked.ja).toBe('猫はいつかもう一度走りますか？');
  });
});

// A387. An instrument's act ("by choosing a word slowly") resolves all its adverbs, but every engine
// reads only `action.modifier`, the primary, so a second adverb is dropped without a word.
describe('known bugs: an instrument\'s act says one adverb of several (A387)', () => {
  const speak = (action: Record<string, unknown>) => sayAll(clause(np('CAT'), 'SPEAK', {
    complements: { instrumental: { phrase: np('WORD', { definiteness: 'indefinite' }), specifiers: [{ kind: 'abstraction', value: 'process' }], action: { verb: 'CHOOSE', ...action } } },
  }));
  const both = { en: ['often', 'slowly'], it: ['spesso', 'lentamente'], fr: ['souvent', 'lentement'], de: ['oft', 'langsam'], es: ['a menudo', 'lentamente'], pt: ['frequentemente', 'devagar'], ja: ['よく', 'ゆっくり'] } as const;

  test('the act says both adverbs', () => {
    const said = speak({ modifier: 'SLOWLY', modifiers: ['OFTEN'] });
    for (const [lang, words] of Object.entries(both)) for (const w of words) expect(said[lang as keyof typeof both], lang).toContain(w);
  });

  test('each language says them where it says the primary; English puts a frequency one before its gerund', () => {
    expect(speak({ modifier: 'SLOWLY', modifiers: ['OFTEN'] })).toEqual({
      en: 'the cat speaks by often choosing a word slowly.',
      it: 'il gatto parla scegliendo una parola spesso lentamente.',
      fr: 'le chat parle en choisissant un mot souvent lentement.',
      de: 'der Kater spricht, indem er ein Wort oft langsam wählt.',
      es: 'el gato habla eligiendo una palabra a menudo lentamente.',
      pt: 'o gato fala escolhendo uma palavra frequentemente devagar.',
      ja: '猫は単語をよくゆっくり選んで話します。',
    });
    expect(speak({ modifier: 'OFTEN' }).en).toBe('the cat speaks by often choosing a word.');
    // A385's rule reaches the act too: WELL beside OFTEN is 上手に.
    expect(speak({ modifier: 'OFTEN', modifiers: ['WELL'] }).ja).toBe('猫は単語をよく上手に選んで話します。');
  });

  test('the concept level says them all after the act', () => {
    const concept = sayAll(clause(np('CAT'), 'SPEAK', {
      complements: { instrumental: { phrase: np('WORD', { definiteness: 'indefinite' }), specifiers: [{ kind: 'abstraction', value: 'concept' }], action: { verb: 'CHOOSE', modifier: 'SLOWLY', modifiers: ['OFTEN'] } } },
    }));
    expect(concept.en).toBe('the cat speaks with the choosing of a word often slowly.');
    expect(concept.it).toBe('il gatto parla con lo scegliere una parola spesso lentamente.');
    expect(concept.ja).toBe('猫は単語をよくゆっくり選ぶことで話します。');
  });

  test('regression: one adverb on the act', () => {
    expect(speak({ modifier: 'SLOWLY' }).en).toBe('the cat speaks by choosing a word slowly.');
    expect(speak({ modifier: 'SLOWLY' }).de).toBe('der Kater spricht, indem er ein Wort langsam wählt.');
  });
});
