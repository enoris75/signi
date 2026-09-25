import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, ReadyLanguageCode } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// Localization B59, P09's time words: NIGHT, YEAR and TODAY (DAY and WEEK came with the shared seed,
// see core-vocabulary-shared.test.ts), and DARK, the differentia NIGHT's gloss is built on. Their
// paradigms are pinned here rather than in the shared exhaustive tables, so the P09 lanes that seeded
// words the same day do not edit the same rows.
//
// DARK is the corpus's first German adjective in unstressed -el, which syncopates before an ending
// (der dunkle Teil, eine dunkle Nacht, dunkler) and keeps its e in the superlative (am dunkelsten)
// and in the undeclined predicate (ist dunkel) — see `deSyncopate`, whose unit test carries the rule.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });

describe('the glosses B59 ships', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    // FLAME's part-whole shape ("the visible part of a fire"), with DAY as the whole: the adjective
    // sits between the whole and the head in Japanese (日の暗い部分), where a relative clause would
    // put itself on the day (光がない日の部分). German pins the -el declension: dunkle, not dunkele.
    ['NIGHT', {
      en: 'the dark part of a day.', it: 'la parte scura di un giorno.', fr: "la partie sombre d'un jour.",
      de: 'der dunkle Teil eines Tages.', es: 'la parte oscura de un día.', ja: '日の暗い部分。', pt: 'a parte escura de um dia.',
    }],
    // UNTITLED's and EMPTY's shape: HAVE negated over a bare object.
    ['DARK', {
      en: 'that does not have light.', it: 'che non ha luce.', fr: "qui n'a pas de lumière.",
      de: 'der kein Licht hat.', es: 'que no tiene luz.', ja: '光がない。', pt: 'que não tem luz.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });
});

describe('the nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    ['NIGHT',
      { en: 'the night.', it: 'la notte.', fr: 'la nuit.', de: 'die Nacht.', es: 'la noche.', ja: '夜。', pt: 'a noite.' },
      { en: 'the nights.', it: 'le notti.', fr: 'les nuits.', de: 'die Nächte.', es: 'las noches.', ja: '夜。', pt: 'as noites.' }],
    ['YEAR',
      { en: 'the year.', it: "l'anno.", fr: "l'année.", de: 'das Jahr.', es: 'el año.', ja: '年。', pt: 'o ano.' },
      { en: 'the years.', it: 'gli anni.', fr: 'les années.', de: 'die Jahre.', es: 'los años.', ja: '年。', pt: 'os anos.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('French YEAR is année, not an: "beaucoup d\'années", "cette année"', () => {
    expect(said('YEAR', { definiteness: 'many', number: 'plural' })).toEqual({
      en: 'many years.', it: 'molti anni.', fr: "beaucoup d'années.", de: 'viele Jahre.', es: 'muchos años.',
      ja: '多くの年。', pt: 'muitos anos.',
    });
    // Japanese says 今年 with a fused deictic word the engine cannot compose; この年 is what it can.
    expect(said('YEAR', { definiteness: 'this' })).toEqual({
      en: 'this year.', it: "quest'anno.", fr: 'cette année.', de: 'dieses Jahr.', es: 'este año.', ja: 'この年。',
      pt: 'este ano.',
    });
  });

  test('NIGHT and YEAR are periods of time', () => {
    const isA = (id: string) => concepts.find((c) => c.id === id)?.isA;
    expect(['NIGHT', 'YEAR'].map(isA)).toEqual(['PERIOD_TIME', 'PERIOD_TIME']);
  });
});

describe('DARK: the attributive agreement, the predicate and the degrees', () => {
  test('attributive, singular and plural — German syncopates its -el', () => {
    expect(said('NIGHT', { definiteness: 'indefinite', adjectives: ['DARK'] })).toEqual({
      en: 'a dark night.', it: 'una notte scura.', fr: 'une nuit sombre.', de: 'eine dunkle Nacht.',
      es: 'una noche oscura.', ja: '暗い夜。', pt: 'uma noite escura.',
    });
    expect(said('NIGHT', { definiteness: 'definite', number: 'plural', adjectives: ['DARK'] })).toEqual({
      en: 'the dark nights.', it: 'le notti scure.', fr: 'les nuits sombres.', de: 'die dunklen Nächte.',
      es: 'las noches oscuras.', ja: '暗い夜。', pt: 'as noites escuras.',
    });
  });

  test('the predicate keeps the e, and the comparative drops it', () => {
    expect(sayAll(clause(the('NIGHT'), 'BE', { complements: { predicative: { phrase: { concept: 'DARK' } } } }))).toEqual({
      en: 'the night is dark.', it: 'la notte è scura.', fr: 'la nuit est sombre.', de: 'die Nacht ist dunkel.',
      es: 'la noche es oscura.', ja: '夜は暗いです。', pt: 'a noite é escura.',
    });
    expect(sayAll(clause(the('NIGHT'), 'BECOME', { complements: { predicative: { phrase: { concept: 'DARK', headDegree: 'more' } } } }))).toEqual({
      en: 'the night becomes darker.', it: 'la notte diventa più scura.', fr: 'la nuit devient plus sombre.',
      de: 'die Nacht wird dunkler.', es: 'la noche se vuelve más oscura.', ja: '夜はもっと暗くなります。',
      pt: 'a noite se torna mais escura.',
    });
  });

  test('the superlative keeps it, before the -st and in the "am …sten" frame', () => {
    expect(sayAll(clause(the('NIGHT'), 'BE', { complements: { predicative: { phrase: { concept: 'DARK', headDegree: 'most' } } } })))
      .toMatchObject({ en: 'the night is darkest.', de: 'die Nacht ist am dunkelsten.', it: 'la notte è la più scura.' });
    expect(said('NIGHT', { definiteness: 'definite', adjectives: ['DARK'], adjectiveDegrees: ['most'] }))
      .toMatchObject({ en: 'the darkest night.', de: 'die dunkelste Nacht.', fr: 'la nuit la plus sombre.' });
  });
});

describe('TODAY: a time adverb, where NOW stands', () => {
  test('after the verb in English, before the object in Romance and German, before the verb in Japanese', () => {
    expect(sayAll(clause(the('CAT'), 'EAT', { verbPhrase: { modifier: 'TODAY' } }))).toEqual({
      en: 'the cat eats today.', it: 'il gatto mangia oggi.', fr: "le chat mange aujourd'hui.",
      de: 'der Kater frisst heute.', es: 'el gato come hoy.', ja: '猫は今日食べます。', pt: 'o gato come hoje.',
    });
    expect(sayAll(clause(the('CAT'), 'EAT', { directObject: the('FOOD'), verbPhrase: { modifier: 'TODAY' } }))).toMatchObject({
      en: 'the cat eats the food today.', it: 'il gatto mangia oggi il cibo.', de: 'der Kater frisst heute das Essen.',
      ja: '猫は食べ物を今日食べます。',
    });
    expect(sayAll(clause(the('CAT'), 'EAT', { verbPhrase: { modifier: 'TODAY', aspect: 'resultative' } }))).toMatchObject({
      en: 'the cat has eaten today.', fr: "le chat a mangé aujourd'hui.", de: 'der Kater hat heute gefressen.',
      ja: '猫は今日食べました。',
    });
  });
});
