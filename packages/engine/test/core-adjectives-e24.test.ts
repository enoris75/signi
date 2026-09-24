import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// P09-E24's core adjectives (docs/localization/done/B87): DIFFERENT, SURE, the two REALs, IMPORTANT,
// LONG, BLACK and WHITE, and the differentia LENGTH that LONG's gloss stands on. Also the engine work
// the seed needed: French longue / blanche / publique, the genuine REAL before the noun in the
// Romance languages, and a Japanese adjective whose word is a godan or a する verb (違う, 実在する).

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const seed = (id: string) => concepts.find((c) => c.id === id);
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const is = (subject: NounPhrase, adjective: string, verbPhrase: PhrasePlan['verbPhrase'] | object = {}): PhrasePlan =>
  clause(subject, 'BE', { verbPhrase, complements: { predicative: { phrase: np(adjective) } } });
const houses = (adjective: string) =>
  sayAll(clause(np('HOUSE', { number: 'plural', definiteness: 'indefinite', adjectives: [adjective] }), 'COLLAPSE'));

describe('the glosses, in every language', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // SAME's gloss inverted: SAME says OTHER, not this word, so the pair is not a circle. German
    // gleich is SAME's lexeme; the predicate SAME keeps its article in five languages.
    ['DIFFERENT', {
      en: 'that is not the same.', it: 'che non è lo stesso.', fr: "qui n'est pas le même.", de: 'der nicht gleich ist.',
      es: 'que no es el mismo.', ja: '同じではない。', pt: 'que não é o mesmo.',
    }],
    // Said of a person, so English says "who" and German agrees with Person.
    ['SURE', {
      en: 'who knows well.', it: 'che sa bene.', fr: 'qui sait bien.', de: 'die gut weiß.', es: 'que sabe bien.', ja: 'よく知る。',
      pt: 'que sabe bem.',
    }],
    // REALLY's "in reality" as a locative of BE; es/pt locate with estar.
    ['REAL_EXISTING', {
      en: 'that is in reality.', it: 'che è in realtà.', fr: 'qui est en réalité.', de: 'der in Wirklichkeit ist.',
      es: 'que está en realidad.', ja: '現実にある。', pt: 'que está em realidade.',
    }],
    // INTERESTING's shape on VALUE.
    ['IMPORTANT', {
      en: 'of high value.', it: 'di valore alto.', fr: 'de valeur haute.', de: 'von hohem Wert.', es: 'de valor alto.', ja: '値が高い。',
      pt: 'de valor alto.',
    }],
    // BIG's "of great size" on the new LENGTH.
    ['LONG', {
      en: 'of great length.', it: 'di grande lunghezza.', fr: 'de grande longueur.', de: 'von großer Länge.', es: 'de longitud grande.',
      ja: '長さが大きい。', pt: 'de comprimento grande.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // REAL_GENUINE: "that seems real" says REAL_EXISTING's word in six languages, and "that is known" is
  // not what it means. BLACK and WHITE are roots, as BROWN is. LENGTH is a dimension root, as SIZE is.
  test('the words that stay on the literal', () => {
    for (const id of ['REAL_GENUINE', 'BLACK', 'WHITE', 'LENGTH']) expect(seed(id)?.definition, id).toBeUndefined();
  });

  test('the two REALs share an English word, so the picker says which', () => {
    expect(['REAL_EXISTING', 'REAL_GENUINE'].map((id) => seed(id)?.synonym)).toEqual(['existing', 'genuine']);
  });

  test('LENGTH is an extent dimension, as SIZE is', () => {
    expect(seed('LENGTH')?.dimensionRelation).toBe('extent');
  });
});

describe('LENGTH: a singular, a plural and its gender', () => {
  test('the paradigm', () => {
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: np('LENGTH', { definiteness: 'indefinite' }) }))).toEqual({
      en: 'the cat sees a length.', it: 'il gatto vede una lunghezza.', fr: 'le chat voit une longueur.', de: 'der Kater sieht eine Länge.',
      es: 'el gato ve una longitud.', ja: '猫は長さを見ます。', pt: 'o gato vê um comprimento.',
    });
    expect(sayAll({ subject: np('LENGTH', { definiteness: 'definite', number: 'plural' }) })).toEqual({
      en: 'the lengths.', it: 'le lunghezze.', fr: 'les longueurs.', de: 'die Längen.', es: 'las longitudes.', ja: '長さ。',
      pt: 'os comprimentos.',
    });
    expect(sayAll({ subject: np('LENGTH', { definiteness: 'indefinite', adjectives: ['BIG'] }) })).toEqual({
      en: 'a big length.', it: 'una grande lunghezza.', fr: 'une grande longueur.', de: 'eine große Länge.', es: 'una longitud grande.',
      ja: '大きい長さ。', pt: 'um comprimento grande.',
    });
  });
});

describe('the adjectives on a feminine noun, attributive plural and predicate', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // After the noun in Romance: before it, diverse / diferentes is "various". Japanese 違う is a verb.
    ['DIFFERENT',
      { en: 'different houses collapse.', it: 'case diverse crollano.', fr: 'des maisons différentes s\'effondrent.',
        de: 'verschiedene Häuser kollabieren.', es: 'unas casas diferentes colapsan.', ja: '違う家は崩れます。', pt: 'umas casas diferentes desabam.' },
      { en: 'the house is different.', it: 'la casa è diversa.', fr: 'la maison est différente.', de: 'das Haus ist verschieden.',
        es: 'la casa es diferente.', ja: '家は違います。', pt: 'a casa é diferente.' }],
    // A state: es/pt estar, and Japanese 確信している as TIRED's 疲れている.
    ['SURE',
      { en: 'sure houses collapse.', it: 'case sicure crollano.', fr: 'des maisons sûres s\'effondrent.', de: 'sichere Häuser kollabieren.',
        es: 'unas casas seguras colapsan.', ja: '確信した家は崩れます。', pt: 'umas casas certas desabam.' },
      { en: 'the house is sure.', it: 'la casa è sicura.', fr: 'la maison est sûre.', de: 'das Haus ist sicher.', es: 'la casa está segura.',
        ja: '家は確信しています。', pt: 'a casa está certa.' }],
    // French réel → réelle by the -el rule; Portuguese real → reais. Japanese 実在する is a する verb.
    ['REAL_EXISTING',
      { en: 'real houses collapse.', it: 'case reali crollano.', fr: 'des maisons réelles s\'effondrent.', de: 'wirkliche Häuser kollabieren.',
        es: 'unas casas reales colapsan.', ja: '実在する家は崩れます。', pt: 'umas casas reais desabam.' },
      { en: 'the house is real.', it: 'la casa è reale.', fr: 'la maison est réelle.', de: 'das Haus ist wirklich.', es: 'la casa es real.',
        ja: '家は実在します。', pt: 'a casa é real.' }],
    // Before the noun in the four Romance languages; French writes de before a prenominal plural.
    ['REAL_GENUINE',
      { en: 'real houses collapse.', it: 'vere case crollano.', fr: 'de vraies maisons s\'effondrent.', de: 'echte Häuser kollabieren.',
        es: 'unas verdaderas casas colapsan.', ja: '本物の家は崩れます。', pt: 'umas verdadeiras casas desabam.' },
      { en: 'the house is real.', it: 'la casa è vera.', fr: 'la maison est vraie.', de: 'das Haus ist echt.', es: 'la casa es verdadera.',
        ja: '家は本物です。', pt: 'a casa é verdadeira.' }],
    ['IMPORTANT',
      { en: 'important houses collapse.', it: 'case importanti crollano.', fr: 'des maisons importantes s\'effondrent.',
        de: 'wichtige Häuser kollabieren.', es: 'unas casas importantes colapsan.', ja: '重要な家は崩れます。', pt: 'umas casas importantes desabam.' },
      { en: 'the house is important.', it: 'la casa è importante.', fr: 'la maison est importante.', de: 'das Haus ist wichtig.',
        es: 'la casa es importante.', ja: '家は重要です。', pt: 'a casa é importante.' }],
    // French longue (FR_ADJ_IRREGULAR), Italian lunghe with its h.
    ['LONG',
      { en: 'long houses collapse.', it: 'case lunghe crollano.', fr: 'des maisons longues s\'effondrent.', de: 'lange Häuser kollabieren.',
        es: 'unas casas largas colapsan.', ja: '長い家は崩れます。', pt: 'umas casas longas desabam.' },
      { en: 'the house is long.', it: 'la casa è lunga.', fr: 'la maison est longue.', de: 'das Haus ist lang.', es: 'la casa es larga.',
        ja: '家は長いです。', pt: 'a casa é longa.' }],
    ['BLACK',
      { en: 'black houses collapse.', it: 'case nere crollano.', fr: 'des maisons noires s\'effondrent.', de: 'schwarze Häuser kollabieren.',
        es: 'unas casas negras colapsan.', ja: '黒い家は崩れます。', pt: 'umas casas pretas desabam.' },
      { en: 'the house is black.', it: 'la casa è nera.', fr: 'la maison est noire.', de: 'das Haus ist schwarz.', es: 'la casa es negra.',
        ja: '家は黒いです。', pt: 'a casa é preta.' }],
    // French blanche (FR_ADJ_IRREGULAR), Italian bianche with its h.
    ['WHITE',
      { en: 'white houses collapse.', it: 'case bianche crollano.', fr: 'des maisons blanches s\'effondrent.', de: 'weiße Häuser kollabieren.',
        es: 'unas casas blancas colapsan.', ja: '白い家は崩れます。', pt: 'umas casas brancas desabam.' },
      { en: 'the house is white.', it: 'la casa è bianca.', fr: 'la maison est blanche.', de: 'das Haus ist weiß.', es: 'la casa es blanca.',
        ja: '家は白いです。', pt: 'a casa é branca.' }],
  ])('%s', (id, attributive, predicate) => {
    expect(houses(id)).toEqual(attributive);
    expect(sayAll(is(the('HOUSE'), id))).toEqual(predicate);
  });

  test('the masculine singular, and the French masculine plural', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'indefinite', adjectives: ['LONG'] }), 'EAT'))).toMatchObject({
      it: 'un gatto lungo mangia.', fr: 'un chat long mange.', de: 'ein langer Kater frisst.', es: 'un gato largo come.', pt: 'um gato longo come.',
    });
    expect(sayAll(clause(np('CAT', { definiteness: 'definite', number: 'plural', adjectives: ['WHITE'] }), 'EAT'))).toMatchObject({
      it: 'i gatti bianchi mangiano.', fr: 'les chats blancs mangent.', de: 'die weißen Kater fressen.',
    });
    expect(sayAll(clause(np('CAT', { definiteness: 'definite', number: 'plural', adjectives: ['LONG'] }), 'EAT'))).toMatchObject({
      it: 'i gatti lunghi mangiano.', fr: 'les chats longs mangent.',
    });
  });

  test('the comparative: German lang and schwarz umlaut, weiß does not', () => {
    const more = (id: string) => sayAll(clause(np('CAT', { definiteness: 'definite', adjectives: [id], adjectiveDegrees: ['more'] }), 'EAT'));
    const most = (id: string) => sayAll(clause(np('CAT', { definiteness: 'definite', adjectives: [id], adjectiveDegrees: ['most'] }), 'EAT'));
    expect(more('LONG')).toMatchObject({ en: 'the longer cat eats.', de: 'der längere Kater frisst.', fr: 'le chat plus long mange.' });
    expect(most('LONG')).toMatchObject({ en: 'the longest cat eats.', de: 'der längste Kater frisst.' });
    expect(more('BLACK')).toMatchObject({ de: 'der schwärzere Kater frisst.' });
    expect(most('BLACK')).toMatchObject({ de: 'der schwärzeste Kater frisst.' });
    expect(more('WHITE')).toMatchObject({ de: 'der weißere Kater frisst.' });
    expect(most('WHITE')).toMatchObject({ de: 'der weißeste Kater frisst.' });
    expect(more('IMPORTANT')).toMatchObject({ en: 'the more important cat eats.', de: 'der wichtigere Kater frisst.', ja: 'もっと重要な猫は食べます。' });
  });

  test('the genuine REAL leaves Italian its one qualifying slot', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'indefinite', adjectives: ['REAL_GENUINE', 'BIG'] }), 'EAT'))).toMatchObject({
      it: 'un vero grande gatto mangia.', fr: 'un vrai grand chat mange.',
    });
  });

  test('SURE and the negated past: es/pt keep estar', () => {
    expect(sayAll(is(the('HOUSE'), 'SURE', { negative: true, tense: 'past' }))).toMatchObject({
      es: 'la casa no estaba segura.', pt: 'a casa não estava certa.', ja: '家は確信していませんでした。',
    });
  });
});

// The engine change: a Japanese adjective whose word is a verb (`ja_verbal`) inflects on its own row
// of kana. The ichidan 起こり得る wrote nothing after its stem, which said 違ます for the godan 違う.
describe('a Japanese verb-adjective: the godan 違う and the する verb 実在する', () => {
  const ja = (plan: PhrasePlan) => sayAll(plan).ja;
  const cat = the('CAT');
  const relative = (adjective: string, verbPhrase: object = {}) =>
    clause(the('CAT', { relative: { verbPhrase: { verb: 'BE', ...verbPhrase }, complements: { predicative: { phrase: np(adjective) } } } }), 'EAT');
  const pair = (adjective: string, conjunction: 'and' | 'or', verbPhrase: object = {}): PhrasePlan =>
    clause(cat, 'BE', { verbPhrase, complements: { predicative: { phrase: { conjuncts: [np(adjective), np('BIG')], conjunction } as never } } });

  test.each<[string, string[]]>([
    ['DIFFERENT', ['猫は違います。', '猫は違いました。', '猫は違いません。', '猫は違いませんでした。']],
    ['REAL_EXISTING', ['猫は実在します。', '猫は実在しました。', '猫は実在しません。', '猫は実在しませんでした。']],
  ])('%s: the polite predicate in its four cells', (adjective, cells) => {
    expect([
      ja(is(cat, adjective)), ja(is(cat, adjective, { tense: 'past' })),
      ja(is(cat, adjective, { negative: true })), ja(is(cat, adjective, { negative: true, tense: 'past' })),
    ]).toEqual(cells);
  });

  test('before a noun, under a modal, and as a compound', () => {
    expect(ja(relative('DIFFERENT'))).toBe('違う猫は食べます。');
    expect(ja(relative('DIFFERENT', { negative: true, tense: 'past' }))).toBe('違わなかった猫は食べます。');
    expect(ja(relative('REAL_EXISTING', { negative: true, tense: 'past' }))).toBe('実在しなかった猫は食べます。');
    expect(ja(is(cat, 'DIFFERENT', { modals: ['MUST'] }))).toBe('猫は違う必要があります。');
    expect(ja(is(cat, 'DIFFERENT', { modals: ['WILL'] }))).toBe('猫は違いたいです。');
    expect(ja(is(cat, 'REAL_EXISTING', { modals: ['WILL'] }))).toBe('猫は実在したいです。');
    expect(ja(clause(np('CAT'), 'CONTINUE_DOING', {
      infinitiveComplement: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('DIFFERENT') } } },
    }))).toBe('猫は違い続けます。');
  });

  test('coordinated, lowered, intensified, and after SEEM and BECOME', () => {
    expect(ja(pair('DIFFERENT', 'and'))).toBe('猫は違って大きいです。');
    expect(ja(pair('DIFFERENT', 'and', { negative: true }))).toBe('猫は違っても大きくもありません。');
    expect(ja(pair('DIFFERENT', 'or', { tense: 'past' }))).toBe('猫は違ったか大きかったです。');
    expect(ja(pair('REAL_EXISTING', 'and'))).toBe('猫は実在して大きいです。');
    expect(ja(clause(np('CAT', { definiteness: 'definite', adjectives: ['DIFFERENT'], adjectiveDegrees: ['less'] }), 'EAT')))
      .toBe('それほど違わない猫は食べます。');
    expect(ja(clause(np('CAT', { definiteness: 'definite', adjectives: ['DIFFERENT'], adjectiveIntensifiers: ['TOO'] }), 'EAT')))
      .toBe('違いすぎる猫は食べます。');
    expect(ja(clause(cat, 'SEEM', { complements: { predicative: { phrase: np('DIFFERENT') } } }))).toBe('猫は違うように思えます。');
    expect(ja(clause(cat, 'BECOME', { complements: { predicative: { phrase: np('REAL_EXISTING') } } }))).toBe('猫は実在するようになります。');
  });

  test('regression: the ichidan 〜すぎる an intensifier builds is unmoved', () => {
    expect(ja(clause(np('CAT', { definiteness: 'definite', adjectives: ['BIG'], adjectiveIntensifiers: ['TOO'] }), 'EAT'))).toBe('大きすぎる猫は食べます。');
    expect(ja(clause(cat, 'BE', { complements: { predicative: { phrase: np('BIG', { headIntensifier: 'TOO' } as never) } } })))
      .toBe('猫は大きすぎます。');
  });
});
