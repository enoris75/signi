import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, ReadyLanguageCode } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { concepts } from '../../backend/src/concepts/index.js';

// The six P09 core-vocabulary words (docs/localization B59–B67) that one ticket seeds and another
// ticket's gloss stands on: B61's TAKE (B65's HAND is glossed on it), B65's HAND and POINT_NOUN (B61's
// TAKE and TURN), B67's STILL (B61's KEEP), and B59's DAY and WEEK (B66's LAST_PREVIOUS is said of
// them). They were seeded first, together, so each ticket could author its glosses on the others'.
// Their own glosses, where they have one, are pinned by the ticket that owns the word.

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });

describe('the nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    // Italian and Spanish mano are feminine despite the -o; Italian's plural is mani, German's Hände.
    ['HAND',
      { en: 'the hand.', it: 'la mano.', fr: 'la main.', de: 'die Hand.', es: 'la mano.', ja: '手。', pt: 'a mão.' },
      { en: 'the hands.', it: 'le mani.', fr: 'les mains.', de: 'die Hände.', es: 'las manos.', ja: '手。', pt: 'as mãos.' }],
    ['POINT_NOUN',
      { en: 'the point.', it: 'il punto.', fr: 'le point.', de: 'der Punkt.', es: 'el punto.', ja: '点。', pt: 'o ponto.' },
      { en: 'the points.', it: 'i punti.', fr: 'les points.', de: 'die Punkte.', es: 'los puntos.', ja: '点。', pt: 'os pontos.' }],
    ['DAY',
      { en: 'the day.', it: 'il giorno.', fr: 'le jour.', de: 'der Tag.', es: 'el día.', ja: '日。', pt: 'o dia.' },
      { en: 'the days.', it: 'i giorni.', fr: 'les jours.', de: 'die Tage.', es: 'los días.', ja: '日。', pt: 'os dias.' }],
    ['WEEK',
      { en: 'the week.', it: 'la settimana.', fr: 'la semaine.', de: 'die Woche.', es: 'la semana.', ja: '週。', pt: 'a semana.' },
      { en: 'the weeks.', it: 'le settimane.', fr: 'les semaines.', de: 'die Wochen.', es: 'las semanas.', ja: '週。', pt: 'as semanas.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('the gender agrees: a feminine hand, this week, the part of a day', () => {
    expect(said('HAND', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big hand.', it: 'una grande mano.', fr: 'une grande main.', de: 'eine große Hand.', es: 'una mano grande.',
      ja: '大きい手。', pt: 'uma mão grande.',
    });
    // Japanese says 今週 with a fused word the engine cannot compose; この週 is what it can.
    expect(said('WEEK', { definiteness: 'this' })).toEqual({
      en: 'this week.', it: 'questa settimana.', fr: 'cette semaine.', de: 'diese Woche.', es: 'esta semana.', ja: 'この週。',
      pt: 'esta semana.',
    });
    // German Tag takes the long genitive: eines Tages.
    expect(sayAll({ subject: { concept: 'PART', definiteness: 'definite', possessor: np('DAY', { definiteness: 'indefinite' }), possessorRole: 'whole' } })).toEqual({
      en: 'the part of a day.', it: 'la parte di un giorno.', fr: "la partie d'un jour.", de: 'der Teil eines Tages.',
      es: 'la parte de un día.', ja: '日の部分。', pt: 'a parte de um dia.',
    });
  });

  test('German Punkt takes "an", as Ort does', () => {
    expect(sayAll(clause(the('CAT'), 'EAT', { complements: { locative: { phrase: np('POINT_NOUN', { definiteness: 'this' }) } } })))
      .toMatchObject({ de: 'der Kater frisst an diesem Punkt.', it: 'il gatto mangia in questo punto.', ja: '猫はこの点で食べます。' });
  });

  test('HAND is an organ, POINT_NOUN a place, DAY and WEEK periods, TAKE an acquiring', () => {
    const isA = (id: string) => concepts.find((c) => c.id === id)?.isA;
    expect(['HAND', 'POINT_NOUN', 'DAY', 'WEEK', 'TAKE'].map(isA)).toEqual(['ORGAN', 'PLACE', 'PERIOD_TIME', 'PERIOD_TIME', 'ACQUIRE']);
  });
});

describe('TAKE: the persons, the tenses and the aspects its languages inflect', () => {
  test('present, simple past, resultative, future and negation', () => {
    expect(sayAll(clause(the('WOMAN'), 'TAKE', { directObject: the('BOOK') }))).toEqual({
      en: 'the woman takes the book.', it: 'la donna prende il libro.', fr: 'la femme prend le livre.', de: 'die Frau nimmt das Buch.',
      es: 'la mujer toma el libro.', ja: '女は本を取ります。', pt: 'a mulher pega o livro.',
    });
    // The strong pasts: prese, prit, nahm.
    expect(sayAll(clause(the('WOMAN'), 'TAKE', { directObject: the('BOOK'), verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman took the book.', it: 'la donna prese il libro.', fr: 'la femme prit le livre.', de: 'die Frau nahm das Buch.',
      es: 'la mujer tomó el libro.', ja: '女は本を取りました。', pt: 'a mulher pegou o livro.',
    });
    // The irregular participles: taken, preso, pris, genommen.
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), 'TAKE', { directObject: the('BOOK'), verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'the cat has taken the book.', it: 'la gatta ha preso il libro.', fr: 'la chatte a pris le livre.',
      de: 'die Katze hat das Buch genommen.', es: 'la gata ha tomado el libro.', ja: '猫は本を取りました。', pt: 'a gata pegou o livro.',
    });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'TAKE', { directObject: the('BOOK'), verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will take the book.', it: 'gli uomini prenderanno il libro.', fr: 'les hommes prendront le livre.',
      de: 'die Männer werden das Buch nehmen.', es: 'los hombres tomarán el libro.', ja: '男は本を取ります。', pt: 'os homens pegarão o livro.',
    });
    expect(sayAll(clause(the('MAN'), 'TAKE', { directObject: the('BOOK'), verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not take the book.', it: "l'uomo non prende il libro.", fr: "l'homme ne prend pas le livre.",
      de: 'der Mann nimmt das Buch nicht.', es: 'el hombre no toma el libro.', ja: '男は本を取りません。', pt: 'o homem não pega o livro.',
    });
  });

  test('with the hand as its instrument', () => {
    expect(sayAll(clause(the('MAN'), 'TAKE', { directObject: the('BOOK'), complements: { instrumental: { phrase: the('HAND') } } }))).toEqual({
      en: 'the man takes the book with the hand.', it: "l'uomo prende il libro con la mano.", fr: "l'homme prend le livre avec la main.",
      de: 'der Mann nimmt das Buch mit der Hand.', es: 'el hombre toma el libro con la mano.', ja: '男は手で本を取ります。',
      pt: 'o homem pega o livro com a mão.',
    });
  });
});

// STILL takes ALREADY's `frequency` position: before the verb in English, between the auxiliary and
// the participle in a compound tense. Its scope over a negation ("still does not") is B67's to pin.
describe('STILL', () => {
  test('before the verb, and inside a compound tense', () => {
    expect(sayAll(clause(the('CAT'), 'EAT', { directObject: the('FOOD'), verbPhrase: { modifier: 'STILL' } }))).toEqual({
      en: 'the cat still eats the food.', it: 'il gatto mangia ancora il cibo.', fr: 'le chat mange encore la nourriture.',
      de: 'der Kater frisst noch das Essen.', es: 'el gato come todavía la comida.', ja: '猫は食べ物をまだ食べます。',
      pt: 'o gato come ainda a comida.',
    });
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), 'EAT', { directObject: the('FOOD'), verbPhrase: { modifier: 'STILL', aspect: 'resultative' } })))
      .toMatchObject({ en: 'the cat has still eaten the food.', it: 'la gatta ha ancora mangiato il cibo.', fr: 'la chatte a encore mangé la nourriture.' });
  });
});
