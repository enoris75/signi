import { describe, expect, test } from 'vitest';
import { clause, np, say, sayAll } from './harness.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C38: personal names, and the title that stands with one. The corpus's proper nouns
// were all places; a title has nothing to precede without a person's name, so the names come first.
// Title and name are one noun phrase, and the engines are given it as one word — which is what puts
// the title in every slot a name can fill.

const seed = (id: string) => concepts.find((c) => c.id === id);

describe('a personal name', () => {
  test('the languages that article a place name leave a person\'s bare', () => {
    expect(sayAll(clause(np('PETER'), 'RUN'))).toEqual({
      en: 'Peter runs.', it: 'Pietro corre.', fr: 'Pierre court.', de: 'Peter läuft.',
      es: 'Pedro corre.', ja: 'ピーターは走ります。', pt: 'o Pedro corre.',
    });
    // A place keeps its article, which is what the flag on the name is telling apart.
    expect(sayAll(clause(np('EUROPE'), 'RUN'))).toMatchObject({
      it: "l'Europa corre.", fr: "l'Europe court.", pt: 'a Europa corre.',
    });
  });

  test('bare in every slot, not only as a subject', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('PETER') } },
    }))).toMatchObject({
      it: 'il gatto dà il libro a Pietro.', fr: 'le chat donne le livre à Pierre.',
      en: 'the cat gives the book to Peter.',
    });
    expect(sayAll({ subject: np('BOOK', { possessor: np('PETER') }) })).toMatchObject({
      it: 'il libro di Pietro.', fr: 'le livre de Pierre.', en: "Peter's book.", de: 'das Buch Peters.',
    });
  });

  test('the feminine name agrees where the language genders a name', () => {
    expect(sayAll(clause(np('MARY'), 'RUN'))).toMatchObject({
      en: 'Mary runs.', it: 'Maria corre.', fr: 'Marie court.', es: 'María corre.',
      pt: 'a Maria corre.', ja: 'メアリーは走ります。',
    });
  });
});

describe('a title before the name', () => {
  test('the seven renderings, and the three that write an article', () => {
    expect(sayAll(clause(np('PETER', { title: 'MR' }), 'RUN'))).toEqual({
      en: 'Mr Peter runs.', it: 'il signor Pietro corre.', fr: 'monsieur Pierre court.',
      de: 'Herr Peter läuft.', es: 'el señor Pedro corre.', ja: 'ピーターさんは走ります。',
      pt: 'o senhor Pedro corre.',
    });
  });

  // Italian drops the title's final -e before a name: "il signor Pietro", where the word alone is
  // "il signore".
  test('Italian writes the short form before a name', () => {
    expect(say(clause(np('PETER', { title: 'MR' }), 'RUN'), 'it')).toBe('il signor Pietro corre.');
    expect(say({ subject: np('MR') }, 'it')).toBe('il signore.');
  });

  // The article agrees with the title, not with the name, and fuses with a preposition against it.
  test('the article is the title\'s, in every slot', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('PETER', { title: 'MR' }) } },
    }))).toMatchObject({
      it: 'il gatto dà il libro al signor Pietro.', fr: 'le chat donne le livre à monsieur Pierre.',
      es: 'el gato da el libro al señor Pedro.', pt: 'o gato dá o livro ao senhor Pedro.',
    });
    expect(sayAll({ subject: np('BOOK', { possessor: np('PETER', { title: 'MR' }) }) })).toMatchObject({
      it: 'il libro del signor Pietro.', fr: 'le livre de monsieur Pierre.',
      es: 'el libro del señor Pedro.', ja: 'ピーターさんの本。',
    });
  });

  test('Japanese writes it after the name, and for anyone', () => {
    expect(say(clause(np('PETER', { title: 'MR' }), 'RUN'), 'ja')).toBe('ピーターさんは走ります。');
    expect(say(clause(np('MARY', { title: 'MR' }), 'RUN'), 'ja')).toBe('メアリーさんは走ります。');
  });

  test('a title with no name to precede is ignored', () => {
    expect(sayAll(clause(np('CAT', { title: 'MR' }), 'RUN'))).toEqual(sayAll(clause(np('CAT'), 'RUN')));
    // …and a place is a name, but not a person's.
    expect(sayAll(clause(np('EUROPE', { title: 'MR' }), 'RUN'))).toEqual(sayAll(clause(np('EUROPE'), 'RUN')));
  });

  // MR is a noun concept, so it rides the `role=noun` fetch; the flag is what keeps it out of the
  // noun pickers, as `modal` keeps a modal out of the main-verb one.
  test('MR names the slot it fills, and the names are people', () => {
    expect(seed('MR')?.slot).toBe('title');
    expect(seed('PETER')?.human).toBe(true);
    expect(seed('PETER')?.proper).toBe(true);
    expect(seed('CAT')?.slot).toBeUndefined();
  });
});
