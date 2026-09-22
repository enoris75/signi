import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// P09's core adjectives and its adverbs of place and focus (docs/localization/done/B66, B67): the two
// LASTs, NEXT_COMING, SAME, AMERICAN and the two RIGHTs; HERE, THERE, JUST, ALSO, ONLY and REALLY;
// the nouns ERROR and REALITY their glosses stand on; and STILL, seeded with the shared words
// (core-vocabulary-shared.test.ts), whose scope over a negation is pinned here. Also the engine
// changes the seed needed: SAME and LAST_FINAL before the noun in it/fr/es/pt, a predicate SAME's
// article, and the copula and particle an adverb of place takes with BE and LIVE.

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
const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const is = (subject: NounPhrase, adjective: string, extra: Parameters<typeof clause>[2] = {}): PhrasePlan =>
  clause(subject, 'BE', { ...extra, complements: { predicative: { phrase: np(adjective) } } });
const eats = (modifier: string, verbPhrase: Partial<VerbPhrase> = {}, subject = the('CAT')): PhrasePlan =>
  clause(subject, 'EAT', { directObject: the('FOOD'), verbPhrase: { modifier, ...verbPhrase } });

describe('the glosses, in every language', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // FIRST read the other way: FIRST is what all other objects follow, this what follows them all.
    // FOLLOW's object is German auf, Spanish a and Japanese に, as in SECOND.
    ['LAST_FINAL', {
      en: 'that follows all other objects.', it: 'che segue tutti gli altri oggetti.', fr: 'qui suit tous les autres objets.',
      de: 'der auf alle anderen Gegenstände folgt.', es: 'que sigue a todos los otros objetos.', ja: 'すべての別の物体に続く。',
      pt: 'que segue todos os outros objetos.',
    }],
    // The period the present one follows, and the one that follows it: "this" is NOW's deixis.
    ['LAST_PREVIOUS', {
      en: 'that this period follows.', it: 'che questo periodo segue.', fr: 'que cette période suit.', de: 'auf den dieser Zeitraum folgt.',
      es: 'que este período sigue.', ja: 'この期間が続く。', pt: 'que este período segue.',
    }],
    ['NEXT_COMING', {
      en: 'that follows this period.', it: 'che segue questo periodo.', fr: 'qui suit cette période.', de: 'der auf diesen Zeitraum folgt.',
      es: 'que sigue a este período.', ja: 'この期間に続く。', pt: 'que segue este período.',
    }],
    // OTHER negated; German negates the predicate noun with kein.
    ['SAME', {
      en: 'that is not another object.', it: 'che non è un altro oggetto.', fr: "qui n'est pas un autre objet.",
      de: 'der kein anderer Gegenstand ist.', es: 'que no es otro objeto.', ja: '別の物体ではない。', pt: 'que não é outro objeto.',
    }],
    // UNTITLED's and EMPTY's shape: HAVE negated, a bare plural object.
    ['RIGHT_CORRECT', {
      en: 'that does not have errors.', it: 'che non ha errori.', fr: "qui n'a pas d'erreurs.", de: 'der keine Fehler hat.',
      es: 'que no tiene errores.', ja: '誤りがない。', pt: 'que não tem erros.',
    }],
    // EVERYWHERE's locative with NOW's deixis; German an, as Ort takes (A218).
    ['HERE', {
      en: 'in this place.', it: 'in questo luogo.', fr: 'dans ce lieu.', de: 'an diesem Ort.', es: 'en este lugar.', ja: 'この場所で。',
      pt: 'neste lugar.',
    }],
    // WELL's `mode` gloss on SAME, which stands before the noun in the Romance languages.
    ['ALSO', {
      en: 'in the same way.', it: 'nello stesso modo.', fr: 'de la même manière.', de: 'auf die gleiche Weise.', es: 'de la misma manera.',
      ja: '同じ方法で。', pt: 'da mesma maneira.',
    }],
    // A countable bare singular after French dans is en (A219).
    ['REALLY', {
      en: 'in reality.', it: 'in realtà.', fr: 'en réalité.', de: 'in Wirklichkeit.', es: 'en realidad.', ja: '現実で。', pt: 'em realidade.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // AMERICAN and RIGHT_SIDE are literal by design (every gloss says the word again, or is true of
  // Canada, or of both sides); THERE waits on C40, JUST and STILL on C29, ONLY on C32. ERROR and
  // REALITY are root nouns.
  test('the words that stay on the literal', () => {
    for (const id of ['AMERICAN', 'RIGHT_SIDE', 'THERE', 'JUST', 'STILL', 'ONLY', 'ERROR', 'REALITY']) {
      expect(seed(id)?.definition, id).toBeUndefined();
    }
  });

  test('the two LASTs, the two RIGHTs and NEXT_COMING share an English word, so the picker says which', () => {
    expect(['LAST_FINAL', 'LAST_PREVIOUS', 'NEXT_COMING', 'RIGHT_CORRECT', 'RIGHT_SIDE'].map((id) => seed(id)?.synonym))
      .toEqual(['final', 'most recent', 'coming', 'correct', 'right-hand']);
  });
});

describe('the nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // German Fehler is the same in the plural; French erreur is feminine.
    ['ERROR',
      { en: 'the error.', it: "l'errore.", fr: "l'erreur.", de: 'der Fehler.', es: 'el error.', ja: '誤り。', pt: 'o erro.' },
      { en: 'the errors.', it: 'gli errori.', fr: 'les erreurs.', de: 'die Fehler.', es: 'los errores.', ja: '誤り。', pt: 'os erros.' }],
    // Italian realtà does not change in the plural.
    ['REALITY',
      { en: 'the reality.', it: 'la realtà.', fr: 'la réalité.', de: 'die Wirklichkeit.', es: 'la realidad.', ja: '現実。', pt: 'a realidade.' },
      { en: 'the realities.', it: 'le realtà.', fr: 'les réalités.', de: 'die Wirklichkeiten.', es: 'las realidades.', ja: '現実。', pt: 'as realidades.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('the gender agrees', () => {
    expect(said('ERROR', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big error.', it: 'un grande errore.', fr: 'une grande erreur.', de: 'ein großer Fehler.', es: 'un error grande.',
      ja: '大きい誤り。', pt: 'um erro grande.',
    });
    expect(said('REALITY', { definiteness: 'indefinite', adjectives: ['OTHER'] })).toEqual({
      en: 'another reality.', it: "un'altra realtà.", fr: 'une autre réalité.', de: 'eine andere Wirklichkeit.', es: 'otra realidad.',
      ja: '別の現実。', pt: 'outra realidade.',
    });
  });

  test('REALITY is countable: a bare one after a preposition is the French en, not dans de la', () => {
    expect(sayAll(clause(the('MAN'), 'EAT', { complements: { locative: { phrase: np('REALITY', { definiteness: 'bare' }) } } }))).toEqual({
      en: 'the man eats in reality.', it: "l'uomo mangia in realtà.", fr: "l'homme mange en réalité.", de: 'der Mann isst in Wirklichkeit.',
      es: 'el hombre come en realidad.', ja: '男は現実で食べます。', pt: 'o homem come em realidade.',
    });
  });
});

describe('the adjectives: where they stand, how they agree, and as a predicate', () => {
  // The engine change: SAME and LAST_FINAL join the ordinals and OTHER before the noun in it/fr/es/pt.
  // After it, "il giorno stesso" / "le jour même" is the day itself, and "le jour dernier" the
  // previous day.
  test('SAME and LAST_FINAL precede the noun in the Romance languages', () => {
    expect(said('DAY', { definiteness: 'definite', adjectives: ['SAME'] })).toEqual({
      en: 'the same day.', it: 'lo stesso giorno.', fr: 'le même jour.', de: 'der gleiche Tag.', es: 'el mismo día.', ja: '同じ日。',
      pt: 'o mesmo dia.',
    });
    expect(said('DAY', { definiteness: 'definite', adjectives: ['LAST_FINAL'] })).toEqual({
      en: 'the last day.', it: "l'ultimo giorno.", fr: 'le dernier jour.', de: 'der letzte Tag.', es: 'el último día.', ja: '最後の日。',
      pt: 'o último dia.',
    });
    // Feminine and plural, and a qualifying adjective beside them: a determiner-like prenominal does
    // not take Italian's one qualifying slot (A145). Spanish último does not apocopate.
    expect(said('WEEK', { definiteness: 'definite', number: 'plural', adjectives: ['SAME'] })).toEqual({
      en: 'the same weeks.', it: 'le stesse settimane.', fr: 'les mêmes semaines.', de: 'die gleichen Wochen.', es: 'las mismas semanas.',
      ja: '同じ週。', pt: 'as mesmas semanas.',
    });
    expect(said('CAT', { definiteness: 'definite', gender: 'fem', number: 'plural', adjectives: ['LAST_FINAL'] })).toEqual({
      en: 'the last cats.', it: 'le ultime gatte.', fr: 'les dernières chattes.', de: 'die letzten Katzen.', es: 'las últimas gatas.',
      ja: '最後の猫。', pt: 'as últimas gatas.',
    });
    expect(said('CAT', { definiteness: 'definite', adjectives: ['SAME', 'BIG'] })).toEqual({
      en: 'the same big cat.', it: 'lo stesso grande gatto.', fr: 'le même grand chat.', de: 'der gleiche große Kater.',
      es: 'el mismo gato grande.', ja: '同じ大きい猫。', pt: 'o mesmo gato grande.',
    });
    expect(said('MAN', { definiteness: 'definite', adjectives: ['LAST_FINAL', 'BIG'] })).toEqual({
      en: 'the last big man.', it: "l'ultimo grande uomo.", fr: 'le dernier grand homme.', de: 'der letzte große Mann.',
      es: 'el último hombre grande.', ja: '最後の大きい男。', pt: 'o último homem grande.',
    });
  });

  // French tells its two derniers apart by position alone.
  test('LAST_PREVIOUS and NEXT_COMING follow it', () => {
    expect(said('WEEK', { definiteness: 'definite', adjectives: ['LAST_PREVIOUS'] })).toEqual({
      en: 'the last week.', it: 'la settimana scorsa.', fr: 'la semaine dernière.', de: 'die letzte Woche.', es: 'la semana pasada.',
      ja: 'この前の週。', pt: 'a semana passada.',
    });
    expect(said('WEEK', { definiteness: 'definite', adjectives: ['NEXT_COMING'] })).toEqual({
      en: 'the next week.', it: 'la settimana prossima.', fr: 'la semaine prochaine.', de: 'die nächste Woche.', es: 'la semana próxima.',
      ja: '今度の週。', pt: 'a semana próxima.',
    });
    // The deictic "last week" takes no article in English and German.
    expect(said('WEEK', { definiteness: 'bare', adjectives: ['LAST_PREVIOUS'] })).toMatchObject({ en: 'last week.', de: 'letzte Woche.' });
    expect(said('DAY', { definiteness: 'definite', number: 'plural', adjectives: ['NEXT_COMING'] })).toEqual({
      en: 'the next days.', it: 'i giorni prossimi.', fr: 'les jours prochains.', de: 'die nächsten Tage.', es: 'los días próximos.',
      ja: '今度の日。', pt: 'os dias próximos.',
    });
  });

  test('AMERICAN and the two RIGHTs follow it, and agree', () => {
    expect(said('WOMAN', { definiteness: 'definite', number: 'plural', adjectives: ['AMERICAN'] })).toEqual({
      en: 'the American women.', it: 'le donne americane.', fr: 'les femmes américaines.', de: 'die amerikanischen Frauen.',
      es: 'las mujeres estadounidenses.', ja: 'アメリカの女。', pt: 'as mulheres americanas.',
    });
    expect(said('CAT', { definiteness: 'indefinite', adjectives: ['AMERICAN'] })).toEqual({
      en: 'an American cat.', it: 'un gatto americano.', fr: 'un chat américain.', de: 'ein amerikanischer Kater.', es: 'un gato estadounidense.',
      ja: 'アメリカの猫。', pt: 'um gato americano.',
    });
    expect(said('WORD', { definiteness: 'definite', adjectives: ['RIGHT_CORRECT'] })).toEqual({
      en: 'the right word.', it: 'la parola giusta.', fr: 'le mot juste.', de: 'das richtige Wort.', es: 'la palabra correcta.',
      ja: '正しい単語。', pt: 'a palavra certa.',
    });
    expect(said('HAND', { definiteness: 'definite', adjectives: ['RIGHT_SIDE'] })).toEqual({
      en: 'the right hand.', it: 'la mano destra.', fr: 'la main droite.', de: 'die rechte Hand.', es: 'la mano derecha.', ja: '右の手。',
      pt: 'a mão direita.',
    });
    expect(said('EYE', { definiteness: 'definite', number: 'plural', adjectives: ['RIGHT_SIDE'] })).toEqual({
      en: 'the right eyes.', it: 'gli occhi destri.', fr: 'les yeux droits.', de: 'die rechten Augen.', es: 'los ojos derechos.', ja: '右の目。',
      pt: 'os olhos direitos.',
    });
  });

  // The engine change: a predicate SAME keeps its article in five languages ("*the cat is same").
  // German gleich and Japanese 同じです are predicates as they stand.
  test('a predicate SAME keeps its article, agreeing with its subject', () => {
    expect(sayAll(is(the('CAT'), 'SAME'))).toEqual({
      en: 'the cat is the same.', it: 'il gatto è lo stesso.', fr: 'le chat est le même.', de: 'der Kater ist gleich.',
      es: 'el gato es el mismo.', ja: '猫は同じです。', pt: 'o gato é o mesmo.',
    });
    expect(sayAll(is(the('CAT', { gender: 'fem' }), 'SAME'))).toEqual({
      en: 'the cat is the same.', it: 'la gatta è la stessa.', fr: 'la chatte est la même.', de: 'die Katze ist gleich.',
      es: 'la gata es la misma.', ja: '猫は同じです。', pt: 'a gata é a mesma.',
    });
    expect(sayAll(is(the('WOMAN', { number: 'plural' }), 'SAME'))).toEqual({
      en: 'the women are the same.', it: 'le donne sono le stesse.', fr: 'les femmes sont les mêmes.', de: 'die Frauen sind gleich.',
      es: 'las mujeres son las mismas.', ja: '女は同じです。', pt: 'as mulheres são as mesmas.',
    });
    expect(sayAll(is(the('CAT'), 'SAME', { verbPhrase: { negative: true } }))).toEqual({
      en: 'the cat is not the same.', it: 'il gatto non è lo stesso.', fr: "le chat n'est pas le même.", de: 'der Kater ist nicht gleich.',
      es: 'el gato no es el mismo.', ja: '猫は同じではありません。', pt: 'o gato não é o mesmo.',
    });
    // Under another copula, and in a relative clause.
    expect(sayAll(clause(the('CAT'), 'SEEM', { complements: { predicative: { phrase: np('SAME') } } }))).toMatchObject({
      en: 'the cat seems the same.', it: 'il gatto sembra lo stesso.', fr: 'le chat semble le même.', es: 'el gato parece el mismo.',
      pt: 'o gato parece o mesmo.',
    });
    expect(sayAll(clause(the('CAT', { relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('SAME') } } } }), 'EAT'))).toEqual({
      en: 'the cat that is the same eats.', it: 'il gatto che è lo stesso mangia.', fr: 'le chat qui est le même mange.',
      de: 'der Kater, der gleich ist, frisst.', es: 'el gato que es el mismo come.', ja: '同じである猫は食べます。',
      pt: 'o gato que é o mesmo come.',
    });
  });

  // German letzte and nächste are -e citations with no undeclined predicate form: a predicate one is
  // nominalised with the article, as an ordinal is (A225).
  test('the other predicates', () => {
    expect(sayAll(is(the('CAT'), 'LAST_FINAL'))).toEqual({
      en: 'the cat is last.', it: 'il gatto è ultimo.', fr: 'le chat est dernier.', de: 'der Kater ist der Letzte.', es: 'el gato es último.',
      ja: '猫は最後です。', pt: 'o gato é último.',
    });
    expect(sayAll(is(the('CAT', { gender: 'fem' }), 'LAST_FINAL'))).toMatchObject({ it: 'la gatta è ultima.', fr: 'la chatte est dernière.', de: 'die Katze ist die Letzte.' });
    expect(sayAll(is(the('CAT', { number: 'plural' }), 'LAST_FINAL'))).toMatchObject({ de: 'die Kater sind die Letzten.' });
    expect(sayAll(is(the('CAT'), 'NEXT_COMING'))).toMatchObject({ de: 'der Kater ist der Nächste.' });
    expect(sayAll(is(the('CAT', { gender: 'fem' }), 'RIGHT_CORRECT'))).toEqual({
      en: 'the cat is right.', it: 'la gatta è giusta.', fr: 'la chatte est juste.', de: 'die Katze ist richtig.', es: 'la gata es correcta.',
      ja: '猫は正しいです。', pt: 'a gata é certa.',
    });
    expect(sayAll(is(the('CAT', { gender: 'fem' }), 'AMERICAN'))).toMatchObject({
      en: 'the cat is American.', it: 'la gatta è americana.', fr: 'la chatte est américaine.', de: 'die Katze ist amerikanisch.',
      es: 'la gata es estadounidense.', pt: 'a gata é americana.',
    });
  });
});

describe('the adverbs: where they stand', () => {
  // Adverbs of place stand after the object, where a locative complement stands (A189).
  test.each<[string, Record<LanguageCode, string>]>([
    ['HERE', {
      en: 'the cat eats the food here.', it: 'il gatto mangia il cibo qui.', fr: 'le chat mange la nourriture ici.',
      de: 'der Kater frisst das Essen hier.', es: 'el gato come la comida aquí.', ja: '猫は食べ物をここで食べます。', pt: 'o gato come a comida aqui.',
    }],
    ['THERE', {
      en: 'the cat eats the food there.', it: 'il gatto mangia il cibo lì.', fr: 'le chat mange la nourriture là.',
      de: 'der Kater frisst das Essen dort.', es: 'el gato come la comida allí.', ja: '猫は食べ物をそこで食べます。', pt: 'o gato come a comida ali.',
    }],
  ])('%s after the object', (adverb, rendered) => {
    expect(sayAll(eats(adverb))).toEqual(rendered);
  });

  // The focus adverbs take ALREADY's `frequency` position: before the verb in English, after it in
  // the others, and between the auxiliary and the participle in a compound tense.
  test.each<[string, Record<LanguageCode, string>, Partial<Record<LanguageCode, string>>]>([
    ['ALSO',
      { en: 'the cat also eats the food.', it: 'il gatto mangia anche il cibo.', fr: 'le chat mange aussi la nourriture.',
        de: 'der Kater frisst auch das Essen.', es: 'el gato come también la comida.', ja: '猫は食べ物を同じく食べます。',
        pt: 'o gato come também a comida.' },
      { en: 'the cat has also eaten the food.', it: 'la gatta ha anche mangiato il cibo.', fr: 'la chatte a aussi mangé la nourriture.',
        de: 'die Katze hat auch das Essen gefressen.' }],
    ['ONLY',
      { en: 'the cat only eats the food.', it: 'il gatto mangia solo il cibo.', fr: 'le chat mange seulement la nourriture.',
        de: 'der Kater frisst nur das Essen.', es: 'el gato come solo la comida.', ja: '猫は食べ物をただ食べます。', pt: 'o gato come só a comida.' },
      { en: 'the cat has only eaten the food.', it: 'la gatta ha solo mangiato il cibo.', fr: 'la chatte a seulement mangé la nourriture.',
        de: 'die Katze hat nur das Essen gefressen.' }],
    ['REALLY',
      { en: 'the cat really eats the food.', it: 'il gatto mangia davvero il cibo.', fr: 'le chat mange vraiment la nourriture.',
        de: 'der Kater frisst wirklich das Essen.', es: 'el gato come realmente la comida.', ja: '猫は食べ物を本当に食べます。',
        pt: 'o gato come realmente a comida.' },
      { en: 'the cat has really eaten the food.', it: 'la gatta ha davvero mangiato il cibo.', fr: 'la chatte a vraiment mangé la nourriture.',
        de: 'die Katze hat wirklich das Essen gefressen.' }],
  ])('%s', (adverb, present, resultative) => {
    expect(sayAll(eats(adverb))).toEqual(present);
    expect(sayAll(eats(adverb, { aspect: 'resultative' }, the('CAT', { gender: 'fem' })))).toMatchObject(resultative);
  });

  // JUST says "a moment ago" only with a past or compound verb ("just eats" is "merely eats"). The
  // French, Spanish and Portuguese words are "ago" phrases with no subtype, so they keep a manner
  // adverb's place after the verb.
  test('JUST', () => {
    expect(sayAll(eats('JUST', { aspect: 'resultative' }, the('CAT', { gender: 'fem' })))).toEqual({
      en: 'the cat has just eaten the food.', it: 'la gatta ha appena mangiato il cibo.', fr: "la chatte a mangé à l'instant la nourriture.",
      de: 'die Katze hat soeben das Essen gefressen.', es: 'la gata ha comido hace un momento la comida.', ja: '猫は食べ物をたった今食べました。',
      pt: 'a gata comeu há pouco a comida.',
    });
    expect(sayAll(eats('JUST', { tense: 'past' }))).toEqual({
      en: 'the cat just ate the food.', it: 'il gatto mangiò appena il cibo.', fr: "le chat mangea à l'instant la nourriture.",
      de: 'der Kater fraß soeben das Essen.', es: 'el gato comió hace un momento la comida.', ja: '猫は食べ物をたった今食べました。',
      pt: 'o gato comeu há pouco a comida.',
    });
  });

  test('REALLY under a negation is "not really"', () => {
    expect(sayAll(eats('REALLY', { negative: true }))).toEqual({
      en: 'the cat does not really eat the food.', it: 'il gatto non mangia davvero il cibo.', fr: 'le chat ne mange pas vraiment la nourriture.',
      de: 'der Kater frisst das Essen nicht wirklich.', es: 'el gato no come realmente la comida.', ja: '猫は食べ物を本当に食べません。',
      pt: 'o gato não come realmente a comida.',
    });
  });
});

// The engine change: being somewhere is a locative, whether a complement or an adverb of place says
// where. Spanish and Portuguese BE is estar with one as with the other, and Japanese says the place
// with the に its verb gives a place — the existential いる / ある and 住む — where an act takes で.
describe('an adverb of place with BE and LIVE', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    ['HERE',
      { en: 'the cat is here.', it: 'il gatto è qui.', fr: 'le chat est ici.', de: 'der Kater ist hier.', es: 'el gato está aquí.',
        ja: '猫はここにいます。', pt: 'o gato está aqui.' },
      { en: 'the cat lives here.', it: 'il gatto abita qui.', fr: 'le chat habite ici.', de: 'der Kater wohnt hier.', es: 'el gato vive aquí.',
        ja: '猫はここに住みます。', pt: 'o gato mora aqui.' }],
    ['THERE',
      { en: 'the cat is there.', it: 'il gatto è lì.', fr: 'le chat est là.', de: 'der Kater ist dort.', es: 'el gato está allí.',
        ja: '猫はそこにいます。', pt: 'o gato está ali.' },
      { en: 'the cat lives there.', it: 'il gatto abita lì.', fr: 'le chat habite là.', de: 'der Kater wohnt dort.', es: 'el gato vive allí.',
        ja: '猫はそこに住みます。', pt: 'o gato mora ali.' }],
    ['EVERYWHERE',
      { en: 'the cat is everywhere.', it: 'il gatto è ovunque.', fr: 'le chat est partout.', de: 'der Kater ist überall.',
        es: 'el gato está en todas partes.', ja: '猫はどこにでもいます。', pt: 'o gato está em toda parte.' },
      { en: 'the cat lives everywhere.', it: 'il gatto abita ovunque.', fr: 'le chat habite partout.', de: 'der Kater wohnt überall.',
        es: 'el gato vive en todas partes.', ja: '猫はどこにでも住みます。', pt: 'o gato mora em toda parte.' }],
  ])('%s', (adverb, be, live) => {
    expect(sayAll(clause(the('CAT'), 'BE', { verbPhrase: { modifier: adverb } }))).toEqual(be);
    expect(sayAll(clause(the('CAT'), 'LIVE', { verbPhrase: { modifier: adverb } }))).toEqual(live);
  });

  test('in every tense, under a modal, in a relative clause, and of a thing', () => {
    expect(sayAll(clause(the('CAT'), 'BE', { verbPhrase: { modifier: 'HERE', tense: 'past', negative: true } }))).toMatchObject({
      es: 'el gato no estaba aquí.', ja: '猫はここにいませんでした。', pt: 'o gato não estava aqui.',
    });
    expect(sayAll(clause(the('CAT'), 'BE', { verbPhrase: { modifier: 'HERE', modals: [{ verb: 'MUST' }] } }))).toMatchObject({
      es: 'el gato debe estar aquí.', ja: '猫はここにいる必要があります。', pt: 'o gato deve estar aqui.',
    });
    expect(sayAll(clause(the('CAT', { relative: { verbPhrase: { verb: 'BE', modifier: 'HERE' } } }), 'EAT'))).toMatchObject({
      es: 'el gato que está aquí come.', ja: 'ここにいる猫は食べます。', pt: 'o gato que está aqui come.',
    });
    expect(sayAll(clause(the('BOOK'), 'BE', { verbPhrase: { modifier: 'EVERYWHERE' } }))).toMatchObject({
      es: 'el libro está en todas partes.', ja: '本はどこにでもあります。', pt: 'o livro está em toda parte.',
    });
  });

  test('beside a predicate the adverb is an adjunct: the predicate picks the copula, and Japanese keeps で', () => {
    expect(sayAll(clause(the('CAT'), 'BE', { verbPhrase: { modifier: 'HERE' }, complements: { predicative: { phrase: np('BIG') } } }))).toMatchObject({
      es: 'el gato es grande aquí.', ja: '猫はここで大きいです。', pt: 'o gato é grande aqui.',
    });
    expect(sayAll(clause(the('CAT'), 'BE', { verbPhrase: { modifier: 'HERE' }, complements: { predicative: { phrase: np('TIRED') } } }))).toMatchObject({
      es: 'el gato está cansado aquí.', ja: '猫はここで疲れています。', pt: 'o gato está cansado aqui.',
    });
  });
});

// Known bugs: a focus adverb under a negation. STILL and ALSO take the frequency position inside the
// negation, where each language's scope puts them outside it or swaps the word: "still does not",
// "noch nicht", "ne … toujours pas"; "does not … either", "auch nicht", "neanche", "ne … pas non
// plus", "tampoco", "também não". The engine has no adverb scope to say it with (P09 D4).
describe('known bugs: STILL under a negation (A243)', () => {
  // Now: en "the cat does not still eat the food.", fr "le chat ne mange pas encore la nourriture."
  // ("not yet"), de "der Kater frisst das Essen nicht noch."
  // Want: en "the cat still does not eat the food.", fr "le chat ne mange toujours pas la nourriture.",
  // de "der Kater frisst das Essen noch nicht." (it "non mangia ancora", es "no come todavía", pt "não
  // come ainda" and ja まだ食べません read right.)
  test.fails('STILL outscopes the negation', () => {
    expect(sayAll(eats('STILL', { negative: true }))).toMatchObject({
      en: 'the cat still does not eat the food.', fr: 'le chat ne mange toujours pas la nourriture.', de: 'der Kater frisst das Essen noch nicht.',
    });
  });

  test('what it renders now', () => {
    expect(sayAll(eats('STILL', { negative: true }))).toMatchObject({
      en: 'the cat does not still eat the food.', fr: 'le chat ne mange pas encore la nourriture.', de: 'der Kater frisst das Essen nicht noch.',
    });
  });
});

describe('known bugs: ALSO under a negation (A244)', () => {
  // Now: en "the cat does not also eat the food.", it "il gatto non mangia anche il cibo.", fr "le
  // chat ne mange pas aussi la nourriture.", de "der Kater frisst das Essen nicht auch.", es "el gato
  // no come también la comida.", pt "o gato não come também a comida."
  // Want: the negative forms below (ja 同じく食べません reads right).
  test.fails('ALSO takes its negative form', () => {
    expect(sayAll(eats('ALSO', { negative: true }))).toMatchObject({
      en: 'the cat does not eat the food either.', it: 'il gatto non mangia neanche il cibo.', fr: 'le chat ne mange pas non plus la nourriture.',
      de: 'der Kater frisst das Essen auch nicht.', es: 'el gato tampoco come la comida.', pt: 'o gato também não come a comida.',
    });
  });

  test('what it renders now', () => {
    expect(sayAll(eats('ALSO', { negative: true }))).toMatchObject({
      en: 'the cat does not also eat the food.', it: 'il gatto non mangia anche il cibo.', fr: 'le chat ne mange pas aussi la nourriture.',
      de: 'der Kater frisst das Essen nicht auch.', es: 'el gato no come también la comida.', pt: 'o gato não come também a comida.',
    });
  });
});

// Known bug: a Japanese predicate の-adjective drops its の and takes the copula (jaAdjClass), which is
// right for 茶色の (猫は茶色です) and wrong for one relating the subject to a proper noun: 猫はアメリカ
// です reads "the cat is America". Attributively it is right (アメリカの猫).
describe('known bugs: AMERICAN as a Japanese predicate (A245)', () => {
  // Now: 猫はアメリカです。 Want: 猫はアメリカのです。
  test.fails('keeps its の', () => {
    expect(sayAll(is(the('CAT'), 'AMERICAN')).ja).toBe('猫はアメリカのです。');
  });

  test('what it renders now', () => {
    expect(sayAll(is(the('CAT'), 'AMERICAN')).ja).toBe('猫はアメリカです。');
  });
});
