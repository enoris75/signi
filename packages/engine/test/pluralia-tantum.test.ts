import { describe, expect, test } from 'vitest';
import type { Definiteness } from '@signi/shared';
import { clause, np, sayAll, wordAll } from './harness.js';
import { concepts } from '../../backend/src/concepts/index.js';

// P09-E41. A plurale tantum is a noun plural in every use in one language and singular (or mass) in
// another. NEWS is the one seeded: mass and singular in English (*the news seems good*) and Japanese,
// plural-only in the five others (*le notizie, les nouvelles, die Nachrichten, las noticias, as
// notícias*), each of which carries `count: 'plural'` on its lexeme. The phrase resolves plural from
// the lexeme, so the article, the adjective, the possessive and the verb all agree plural (D1); the
// lexeme wins over the plan's `number` (D2); the gender stays the lexeme's own (D3).

const good = { complements: { predicative: { phrase: np('GOOD') } } };

describe('pluralia tantum: NEWS', () => {
  test('as subject, definite: the article, the predicate adjective and the verb agree plural', () => {
    expect(sayAll(clause(np('NEWS'), 'SEEM', good))).toEqual({
      en: 'the news seems good.',
      it: 'le notizie sembrano buone.',
      fr: 'les nouvelles semblent bonnes.',
      de: 'die Nachrichten scheinen gut.',
      es: 'las noticias parecen buenas.',
      pt: 'as notícias parecem boas.',
      ja: 'ニュースは良く思えます。',
    });
  });

  test('as subject of an intransitive verb', () => {
    expect(sayAll(clause(np('NEWS'), 'RUN'))).toEqual({
      en: 'the news runs.',
      it: 'le notizie corrono.',
      fr: 'les nouvelles courent.',
      de: 'die Nachrichten laufen.',
      es: 'las noticias corren.',
      pt: 'as notícias correm.',
      ja: 'ニュースは走ります。',
    });
  });

  test('as subject with an attributive adjective', () => {
    expect(sayAll(clause(np('NEWS', { adjectives: ['BIG'] }), 'SEEM', good))).toEqual({
      en: 'the big news seems good.',
      it: 'le grandi notizie sembrano buone.',
      fr: 'les grandes nouvelles semblent bonnes.',
      de: 'die großen Nachrichten scheinen gut.',
      es: 'las noticias grandes parecen buenas.',
      pt: 'as notícias grandes parecem boas.',
      ja: '大きいニュースは良く思えます。',
    });
  });

  test('as object, definite', () => {
    expect(sayAll(clause(np('CAT'), 'READ', { directObject: np('NEWS') }))).toEqual({
      en: 'the cat reads the news.',
      it: 'il gatto legge le notizie.',
      fr: 'le chat lit les nouvelles.',
      de: 'der Kater liest die Nachrichten.',
      es: 'el gato lee las noticias.',
      pt: 'o gato lê as notícias.',
      ja: '猫はニュースを読みます。',
    });
  });

  test('as object with an attributive adjective', () => {
    expect(sayAll(clause(np('CAT'), 'READ', { directObject: np('NEWS', { adjectives: ['BIG'] }) }))).toEqual({
      en: 'the cat reads the big news.',
      it: 'il gatto legge le grandi notizie.',
      fr: 'le chat lit les grandes nouvelles.',
      de: 'der Kater liest die großen Nachrichten.',
      es: 'el gato lee las noticias grandes.',
      pt: 'o gato lê as notícias grandes.',
      ja: '猫は大きいニュースを読みます。',
    });
  });

  // "A news" does not exist in any of the seven. The indefinite becomes each language's
  // indefinite of a plural or a mass noun: English drops the article (mass), Italian and German
  // go bare, French takes *des*, Spanish and Portuguese *unas / umas*.
  test('indefinite, as subject: "a news" is the indefinite plural (or English mass bare)', () => {
    expect(sayAll(clause(np('NEWS', { definiteness: 'indefinite' }), 'SEEM', good))).toEqual({
      en: 'news seems good.',
      it: 'notizie sembrano buone.',
      fr: 'des nouvelles semblent bonnes.',
      de: 'Nachrichten scheinen gut.',
      es: 'unas noticias parecen buenas.',
      pt: 'umas notícias parecem boas.',
      ja: 'ニュースは良く思えます。',
    });
  });

  test('indefinite, as object with an adjective: French *de* before a prenominal adjective', () => {
    expect(sayAll(clause(np('CAT'), 'READ', {
      directObject: np('NEWS', { adjectives: ['BIG'], definiteness: 'indefinite' }),
    }))).toEqual({
      en: 'the cat reads big news.',
      it: 'il gatto legge grandi notizie.',
      fr: 'le chat lit de grandes nouvelles.',
      de: 'der Kater liest große Nachrichten.',
      es: 'el gato lee unas noticias grandes.',
      pt: 'o gato lê umas notícias grandes.',
      ja: '猫は大きいニュースを読みます。',
    });
  });

  test('a demonstrative agrees plural', () => {
    expect(sayAll(clause(np('NEWS', { definiteness: 'this' }), 'SEEM', good))).toEqual({
      en: 'this news seems good.',
      it: 'queste notizie sembrano buone.',
      fr: 'ces nouvelles semblent bonnes.',
      de: 'diese Nachrichten scheinen gut.',
      es: 'estas noticias parecen buenas.',
      pt: 'estas notícias parecem boas.',
      ja: 'このニュースは良く思えます。',
    });
  });

  // The concept is mass for English (*much news*, never *many news*); a plural-only lexeme sheds
  // that and takes the count plural's quantifier (*molte notizie*, *viele Nachrichten*).
  test.each<[Definiteness, Record<string, string>]>([
    ['some', {
      en: 'some news seems good.',
      it: 'alcune notizie sembrano buone.',
      fr: 'quelques nouvelles semblent bonnes.',
      de: 'einige Nachrichten scheinen gut.',
      es: 'algunas noticias parecen buenas.',
      pt: 'algumas notícias parecem boas.',
      ja: 'いくつかのニュースは良く思えます。',
    }],
    ['many', {
      en: 'much news seems good.',
      it: 'molte notizie sembrano buone.',
      fr: 'beaucoup de nouvelles semblent bonnes.',
      de: 'viele Nachrichten scheinen gut.',
      es: 'muchas noticias parecen buenas.',
      pt: 'muitas notícias parecem boas.',
      ja: '多くのニュースは良く思えます。',
    }],
    ['all', {
      en: 'all news seems good.',
      it: 'tutte le notizie sembrano buone.',
      fr: 'toutes les nouvelles semblent bonnes.',
      de: 'alle Nachrichten scheinen gut.',
      es: 'todas las noticias parecen buenas.',
      pt: 'todas as notícias parecem boas.',
      ja: 'すべてのニュースは良く思えます。',
    }],
  ])('the quantifier "%s" takes the count plural where the lexeme is plural-only', (definiteness, want) => {
    expect(sayAll(clause(np('NEWS', { definiteness }), 'SEEM', good))).toEqual(want);
  });

  test('a possessive agrees plural', () => {
    expect(sayAll(clause(np('NEWS', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }), 'SEEM', good))).toEqual({
      en: 'my news seems good.',
      it: 'le mie notizie sembrano buone.',
      fr: 'mes nouvelles semblent bonnes.',
      de: 'meine Nachrichten scheinen gut.',
      es: 'mis noticias parecen buenas.',
      pt: 'as minhas notícias parecem boas.',
      ja: '私のニュースは良く思えます。',
    });
  });

  test('D2: the lexeme wins over the plan — a plural NEWS is the same phrase as a singular one', () => {
    const singular = sayAll(clause(np('NEWS'), 'SEEM', good));
    expect(sayAll(clause(np('NEWS', { number: 'plural' }), 'SEEM', good))).toEqual(singular);
    expect(sayAll(clause(np('NEWS', { number: 'singular' }), 'SEEM', good))).toEqual(singular);
  });

  test('a plural-only noun modifier is plural too, and its adjective agrees', () => {
    expect(sayAll(clause(np('BOOK', { nounModifiers: [{ concept: 'NEWS', relation: 'feature', adjectives: ['BIG'] }] }), 'SEEM', good))).toMatchObject({
      it: 'il libro a notizie grandi sembra buono.',
      es: 'el libro de noticias grandes parece bueno.',
      pt: 'o livro a notícias grandes parece bom.',
    });
  });

  test('the word alone is the plural surface where the lexeme is plural-only', () => {
    expect(wordAll('NEWS')).toEqual({
      en: 'news',
      it: 'notizie',
      fr: 'nouvelles',
      de: 'Nachrichten',
      es: 'noticias',
      pt: 'notícias',
      ja: 'ニュース',
    });
  });

  test('a mass noun still ignores a plural (WATER is untouched)', () => {
    expect(sayAll(clause(np('WATER', { number: 'plural' }), 'SEEM', good))).toMatchObject({
      it: "l'acqua sembra buona.",
      de: 'das Wasser scheint gut.',
    });
  });
});

// Localization A32: NEWS's tooltip, the report and its recency on a bare plural head (FACT), which
// matches the plural-only lexeme in five languages and never says the word back.
describe("NEWS's definition", () => {
  test('facts that one has told recently, in all seven', () => {
    const news = concepts.find((c) => c.id === 'NEWS');
    expect(sayAll(news!.definition!)).toEqual({
      en: 'facts that one has told recently.',
      it: 'fatti che si sono raccontati di recente.',
      fr: "faits qu'on a racontés récemment.",
      de: 'Tatsachen, die man kürzlich erzählt hat.',
      es: 'hechos que se han contado recientemente.',
      ja: '最近伝えた事実。',
      pt: 'fatos que se contaram recentemente.',
    });
  });
});
