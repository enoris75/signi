import { describe, expect, test } from 'vitest';
import type { Definiteness, LanguageCode, PronominalPossessor, ReadyLanguageCode } from '@signi/shared';
import { DETERMINER_CATEGORY_VALUES } from '@signi/shared';
import { clause, determinerAll, np, sayAll, wordAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// P09-E25: seven more quantity determiners — each, every, both, most, several, enough, such. Each
// row is one value in all seven languages. every merges with each in it/fr/de/es/pt (ogni, chaque,
// jeder, cada) and with all in Japanese (すべての); several merges with some in Japanese (いくつかの).

type Row = [Definiteness, Record<ReadyLanguageCode, string>];

const catRuns = (definiteness: Definiteness) => sayAll(clause(np('CAT', { definiteness }), 'RUN'));
const houseBurns = (definiteness: Definiteness) => sayAll(clause(np('HOUSE', { definiteness }), 'BURN'));
const seesBigCat = (definiteness: Definiteness) =>
  sayAll(clause(np('DOG'), 'SEE', { directObject: np('CAT', { definiteness, adjectives: ['BIG'] }) }));
const eatsFood = (definiteness: Definiteness) =>
  sayAll(clause(np('DOG'), 'EAT', { directObject: np('FOOD', { definiteness }) }));
const inHouse = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { definiteness }) } } }));
const toDog = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'GIVE', {
    directObject: np('BOOK'),
    complements: { terminus: { phrase: np('DOG', { definiteness }) } },
  }));
const bookOf = (definiteness: Definiteness) =>
  sayAll(clause(np('BOOK', { possessor: np('CAT', { definiteness }) }), 'BURN'));

const SUBJECT_MASC: Row[] = [
  ['each', { en: 'each cat runs.', it: 'ogni gatto corre.', fr: 'chaque chat court.', de: 'jeder Kater läuft.', es: 'cada gato corre.', ja: 'それぞれの猫は走ります。', pt: 'cada gato corre.' }],
  ['every', { en: 'every cat runs.', it: 'ogni gatto corre.', fr: 'chaque chat court.', de: 'jeder Kater läuft.', es: 'cada gato corre.', ja: 'すべての猫は走ります。', pt: 'cada gato corre.' }],
  ['both', { en: 'both cats run.', it: 'entrambi i gatti corrono.', fr: 'les deux chats courent.', de: 'beide Kater laufen.', es: 'ambos gatos corren.', ja: '両方の猫は走ります。', pt: 'ambos os gatos correm.' }],
  // D4: the partitive's verb is singular in it/es/pt, plural in fr.
  ['most', { en: 'most cats run.', it: 'la maggior parte dei gatti corre.', fr: 'la plupart des chats courent.', de: 'die meisten Kater laufen.', es: 'la mayoría de los gatos corre.', ja: 'ほとんどの猫は走ります。', pt: 'a maioria dos gatos corre.' }],
  ['several', { en: 'several cats run.', it: 'parecchi gatti corrono.', fr: 'plusieurs chats courent.', de: 'mehrere Kater laufen.', es: 'varios gatos corren.', ja: 'いくつかの猫は走ります。', pt: 'vários gatos correm.' }],
  // Portuguese puts "suficiente" after the noun; Japanese counts a count noun (十分な数の).
  ['enough', { en: 'enough cats run.', it: 'abbastanza gatti corrono.', fr: 'assez de chats courent.', de: 'genug Kater laufen.', es: 'suficientes gatos corren.', ja: '十分な数の猫は走ります。', pt: 'gatos suficientes correm.' }],
  ['such', { en: 'such a cat runs.', it: 'un tale gatto corre.', fr: 'un tel chat court.', de: 'so ein Kater läuft.', es: 'tal gato corre.', ja: 'そんな猫は走ります。', pt: 'tal gato corre.' }],
];

const SUBJECT_FEM: Row[] = [
  ['each', { en: 'each house burns.', it: 'ogni casa brucia.', fr: 'chaque maison brûle.', de: 'jedes Haus brennt.', es: 'cada casa arde.', ja: 'それぞれの家は燃えます。', pt: 'cada casa arde.' }],
  ['every', { en: 'every house burns.', it: 'ogni casa brucia.', fr: 'chaque maison brûle.', de: 'jedes Haus brennt.', es: 'cada casa arde.', ja: 'すべての家は燃えます。', pt: 'cada casa arde.' }],
  ['both', { en: 'both houses burn.', it: 'entrambe le case bruciano.', fr: 'les deux maisons brûlent.', de: 'beide Häuser brennen.', es: 'ambas casas arden.', ja: '両方の家は燃えます。', pt: 'ambas as casas ardem.' }],
  ['most', { en: 'most houses burn.', it: 'la maggior parte delle case brucia.', fr: 'la plupart des maisons brûlent.', de: 'die meisten Häuser brennen.', es: 'la mayoría de las casas arde.', ja: 'ほとんどの家は燃えます。', pt: 'a maioria das casas arde.' }],
  ['several', { en: 'several houses burn.', it: 'parecchie case bruciano.', fr: 'plusieurs maisons brûlent.', de: 'mehrere Häuser brennen.', es: 'varias casas arden.', ja: 'いくつかの家は燃えます。', pt: 'várias casas ardem.' }],
  ['enough', { en: 'enough houses burn.', it: 'abbastanza case bruciano.', fr: 'assez de maisons brûlent.', de: 'genug Häuser brennen.', es: 'suficientes casas arden.', ja: '十分な数の家は燃えます。', pt: 'casas suficientes ardem.' }],
  ['such', { en: 'such a house burns.', it: 'una tale casa brucia.', fr: 'une telle maison brûle.', de: 'so ein Haus brennt.', es: 'tal casa arde.', ja: 'そんな家は燃えます。', pt: 'tal casa arde.' }],
];

// The object, with an adjective: German declines it weak after jed-/beide/die meisten, strong after
// mehrere/genug, mixed after "so ein".
const OBJECT: Row[] = [
  ['each', { en: 'the dog sees each big cat.', it: 'il cane vede ogni grande gatto.', fr: 'le chien voit chaque grand chat.', de: 'der Hund sieht jeden großen Kater.', es: 'el perro ve cada gato grande.', ja: '犬はそれぞれの大きい猫を見ます。', pt: 'o cão vê cada gato grande.' }],
  ['every', { en: 'the dog sees every big cat.', it: 'il cane vede ogni grande gatto.', fr: 'le chien voit chaque grand chat.', de: 'der Hund sieht jeden großen Kater.', es: 'el perro ve cada gato grande.', ja: '犬はすべての大きい猫を見ます。', pt: 'o cão vê cada gato grande.' }],
  ['both', { en: 'the dog sees both big cats.', it: 'il cane vede entrambi i grandi gatti.', fr: 'le chien voit les deux grands chats.', de: 'der Hund sieht beide großen Kater.', es: 'el perro ve ambos gatos grandes.', ja: '犬は両方の大きい猫を見ます。', pt: 'o cão vê ambos os gatos grandes.' }],
  ['most', { en: 'the dog sees most big cats.', it: 'il cane vede la maggior parte dei grandi gatti.', fr: 'le chien voit la plupart des grands chats.', de: 'der Hund sieht die meisten großen Kater.', es: 'el perro ve la mayoría de los gatos grandes.', ja: '犬はほとんどの大きい猫を見ます。', pt: 'o cão vê a maioria dos gatos grandes.' }],
  ['several', { en: 'the dog sees several big cats.', it: 'il cane vede parecchi grandi gatti.', fr: 'le chien voit plusieurs grands chats.', de: 'der Hund sieht mehrere große Kater.', es: 'el perro ve varios gatos grandes.', ja: '犬はいくつかの大きい猫を見ます。', pt: 'o cão vê vários gatos grandes.' }],
  ['enough', { en: 'the dog sees enough big cats.', it: 'il cane vede abbastanza grandi gatti.', fr: 'le chien voit assez de grands chats.', de: 'der Hund sieht genug große Kater.', es: 'el perro ve suficientes gatos grandes.', ja: '犬は十分な数の大きい猫を見ます。', pt: 'o cão vê gatos grandes suficientes.' }],
  ['such', { en: 'the dog sees such a big cat.', it: 'il cane vede un tale grande gatto.', fr: 'le chien voit un tel grand chat.', de: 'der Hund sieht so einen großen Kater.', es: 'el perro ve tal gato grande.', ja: '犬はそんな大きい猫を見ます。', pt: 'o cão vê tal gato grande.' }],
];

// A mass noun: the Romance "most" is the "larger part" (la maggior parte del, la plus grande partie
// de la, la mayor parte de la, a maior parte da); de "das meiste". several and both cannot count
// it: several falls back to `some`, both to the definite.
const MASS: Row[] = [
  ['each', { en: 'the dog eats each food.', it: 'il cane mangia ogni cibo.', fr: 'le chien mange chaque nourriture.', de: 'der Hund frisst jedes Essen.', es: 'el perro come cada comida.', ja: '犬はそれぞれの食べ物を食べます。', pt: 'o cão come cada comida.' }],
  ['both', { en: 'the dog eats the food.', it: 'il cane mangia il cibo.', fr: 'le chien mange la nourriture.', de: 'der Hund frisst das Essen.', es: 'el perro come la comida.', ja: '犬は食べ物を食べます。', pt: 'o cão come a comida.' }],
  ['most', { en: 'the dog eats most food.', it: 'il cane mangia la maggior parte del cibo.', fr: 'le chien mange la plus grande partie de la nourriture.', de: 'der Hund frisst das meiste Essen.', es: 'el perro come la mayor parte de la comida.', ja: '犬はほとんどの食べ物を食べます。', pt: 'o cão come a maior parte da comida.' }],
  ['several', { en: 'the dog eats some food.', it: 'il cane mangia del cibo.', fr: 'le chien mange de la nourriture.', de: 'der Hund frisst etwas Essen.', es: 'el perro come algo de comida.', ja: '犬はいくつかの食べ物を食べます。', pt: 'o cão come um pouco de comida.' }],
  ['enough', { en: 'the dog eats enough food.', it: 'il cane mangia abbastanza cibo.', fr: 'le chien mange assez de nourriture.', de: 'der Hund frisst genug Essen.', es: 'el perro come suficiente comida.', ja: '犬は十分な食べ物を食べます。', pt: 'o cão come comida suficiente.' }],
  ['such', { en: 'the dog eats such food.', it: 'il cane mangia un tale cibo.', fr: 'le chien mange une telle nourriture.', de: 'der Hund frisst solches Essen.', es: 'el perro come tal comida.', ja: '犬はそんな食べ物を食べます。', pt: 'o cão come tal comida.' }],
];

// A preposition that fuses with the definite article takes the article inside "most": it "nella /
// alla maggior parte", pt "na / à maioria"; fr "aux deux".
const LOCATIVE: Row[] = [
  ['each', { en: 'the cat runs in each house.', it: 'il gatto corre in ogni casa.', fr: 'le chat court dans chaque maison.', de: 'der Kater läuft in jedem Haus.', es: 'el gato corre en cada casa.', ja: '猫はそれぞれの家で走ります。', pt: 'o gato corre em cada casa.' }],
  ['both', { en: 'the cat runs in both houses.', it: 'il gatto corre in entrambe le case.', fr: 'le chat court dans les deux maisons.', de: 'der Kater läuft in beiden Häusern.', es: 'el gato corre en ambas casas.', ja: '猫は両方の家で走ります。', pt: 'o gato corre em ambas as casas.' }],
  ['most', { en: 'the cat runs in most houses.', it: 'il gatto corre nella maggior parte delle case.', fr: 'le chat court dans la plupart des maisons.', de: 'der Kater läuft in den meisten Häusern.', es: 'el gato corre en la mayoría de las casas.', ja: '猫はほとんどの家で走ります。', pt: 'o gato corre na maioria das casas.' }],
  ['several', { en: 'the cat runs in several houses.', it: 'il gatto corre in parecchie case.', fr: 'le chat court dans plusieurs maisons.', de: 'der Kater läuft in mehreren Häusern.', es: 'el gato corre en varias casas.', ja: '猫はいくつかの家で走ります。', pt: 'o gato corre em várias casas.' }],
  ['enough', { en: 'the cat runs in enough houses.', it: 'il gatto corre in abbastanza case.', fr: 'le chat court dans assez de maisons.', de: 'der Kater läuft in genug Häusern.', es: 'el gato corre en suficientes casas.', ja: '猫は十分な数の家で走ります。', pt: 'o gato corre em casas suficientes.' }],
  ['such', { en: 'the cat runs in such a house.', it: 'il gatto corre in una tale casa.', fr: 'le chat court dans une telle maison.', de: 'der Kater läuft in so einem Haus.', es: 'el gato corre en tal casa.', ja: '猫はそんな家で走ります。', pt: 'o gato corre em tal casa.' }],
];

const TERMINUS: Row[] = [
  ['every', { en: 'the cat gives the book to every dog.', it: 'il gatto dà il libro a ogni cane.', fr: 'le chat donne le livre à chaque chien.', de: 'der Kater gibt jedem Hund das Buch.', es: 'el gato da el libro a cada perro.', ja: '猫はすべての犬に本をあげます。', pt: 'o gato dá o livro a cada cão.' }],
  ['both', { en: 'the cat gives the book to both dogs.', it: 'il gatto dà il libro a entrambi i cani.', fr: 'le chat donne le livre aux deux chiens.', de: 'der Kater gibt beiden Hunden das Buch.', es: 'el gato da el libro a ambos perros.', ja: '猫は両方の犬に本をあげます。', pt: 'o gato dá o livro a ambos os cães.' }],
  ['most', { en: 'the cat gives the book to most dogs.', it: 'il gatto dà il libro alla maggior parte dei cani.', fr: 'le chat donne le livre à la plupart des chiens.', de: 'der Kater gibt den meisten Hunden das Buch.', es: 'el gato da el libro a la mayoría de los perros.', ja: '猫はほとんどの犬に本をあげます。', pt: 'o gato dá o livro à maioria dos cães.' }],
  ['such', { en: 'the cat gives the book to such a dog.', it: 'il gatto dà il libro a un tale cane.', fr: 'le chat donne le livre à un tel chien.', de: 'der Kater gibt so einem Hund das Buch.', es: 'el gato da el libro a tal perro.', ja: '猫はそんな犬に本をあげます。', pt: 'o gato dá o livro a tal cão.' }],
];

// The genitive possessor: fr "des deux", it "della maggior parte"; German shows the genitive where
// a declined word carries it ("beider Kater", "so eines Katers") and falls back to "von" after the
// invariant "genug".
const POSSESSOR: Row[] = [
  ['both', { en: "both cats' book burns.", it: 'il libro di entrambi i gatti brucia.', fr: 'le livre des deux chats brûle.', de: 'das Buch beider Kater brennt.', es: 'el libro de ambos gatos arde.', ja: '両方の猫の本は燃えます。', pt: 'o livro de ambos os gatos arde.' }],
  ['most', { en: "most cats' book burns.", it: 'il libro della maggior parte dei gatti brucia.', fr: 'le livre de la plupart des chats brûle.', de: 'das Buch der meisten Kater brennt.', es: 'el libro de la mayoría de los gatos arde.', ja: 'ほとんどの猫の本は燃えます。', pt: 'o livro da maioria dos gatos arde.' }],
  ['enough', { en: "enough cats' book burns.", it: 'il libro di abbastanza gatti brucia.', fr: "le livre d'assez de chats brûle.", de: 'das Buch von genug Katern brennt.', es: 'el libro de suficientes gatos arde.', ja: '十分な数の猫の本は燃えます。', pt: 'o livro de gatos suficientes arde.' }],
  ['such', { en: "such a cat's book burns.", it: 'il libro di un tale gatto brucia.', fr: "le livre d'un tel chat brûle.", de: 'das Buch so eines Katers brennt.', es: 'el libro de tal gato arde.', ja: 'そんな猫の本は燃えます。', pt: 'o livro de tal gato arde.' }],
];

describe('P09-E25: the seven new quantity determiners', () => {
  test('are listed under quantity, after all', () => {
    expect(DETERMINER_CATEGORY_VALUES.quantity).toEqual(
      ['some', 'no', 'many', 'few', 'all', 'each', 'every', 'both', 'most', 'several', 'enough', 'such'],
    );
  });

  test.each(SUBJECT_MASC)('%s — a masculine subject', (d, want) => expect(catRuns(d)).toEqual(want));
  test.each(SUBJECT_FEM)('%s — a feminine subject', (d, want) => expect(houseBurns(d)).toEqual(want));
  test.each(OBJECT)('%s — an object with an adjective', (d, want) => expect(seesBigCat(d)).toEqual(want));
  test.each(MASS)('%s — a mass object', (d, want) => expect(eatsFood(d)).toEqual(want));
  test.each(LOCATIVE)('%s — a locative', (d, want) => expect(inHouse(d)).toEqual(want));
  test.each(TERMINUS)('%s — a terminus', (d, want) => expect(toDog(d)).toEqual(want));
  test.each(POSSESSOR)('%s — a genitive possessor', (d, want) => expect(bookOf(d)).toEqual(want));
});

describe('P09-E25: agreement and polarity', () => {
  test('each and every keep the noun singular whatever number was picked', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'each', number: 'plural' }), 'RUN'))).toMatchObject({
      en: 'each cat runs.', it: 'ogni gatto corre.', de: 'jeder Kater läuft.', pt: 'cada gato corre.',
    });
  });

  test('D4: the partitive most agrees singular in it/es/pt, with a predicate adjective too', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'most' }), 'BE', {
      complements: { predicative: { phrase: { concept: 'BIG' } } },
    }))).toEqual({
      en: 'most cats are big.',
      it: 'la maggior parte dei gatti è grande.',
      fr: 'la plupart des chats sont grands.',
      de: 'die meisten Kater sind groß.',
      es: 'la mayoría de los gatos es grande.',
      ja: 'ほとんどの猫は大きいです。',
      pt: 'a maioria dos gatos é grande.',
    });
  });

  test('D4: a coordinated most resolves plural like any "and" group', () => {
    expect(sayAll(clause({ conjunction: 'and', conjuncts: [np('CAT', { definiteness: 'most' }), np('DOG')] }, 'RUN')))
      .toMatchObject({ it: 'la maggior parte dei gatti e il cane corrono.', es: 'la mayoría de los gatos y el perro corren.' });
  });

  test('none of them swaps under negation (only `no` does)', () => {
    const neg = (definiteness: Definiteness) =>
      sayAll(clause(np('DOG'), 'SEE', { directObject: np('CAT', { definiteness }), verbPhrase: { negative: true } }));
    expect(neg('each')).toMatchObject({ en: 'the dog does not see each cat.', fr: 'le chien ne voit pas chaque chat.' });
    expect(neg('several')).toMatchObject({ en: 'the dog does not see several cats.', fr: 'le chien ne voit pas plusieurs chats.' });
    expect(neg('enough')).toMatchObject({ en: 'the dog does not see enough cats.', fr: 'le chien ne voit pas assez de chats.', es: 'el perro no ve suficientes gatos.' });
    expect(neg('such')).toMatchObject({ en: 'the dog does not see such a cat.', fr: 'le chien ne voit pas un tel chat.' });
    expect(sayAll(clause(np('CAT', { definiteness: 'most' }), 'RUN', { verbPhrase: { negative: true } }))).toMatchObject({
      en: 'most cats do not run.', it: 'la maggior parte dei gatti non corre.', fr: 'la plupart des chats ne courent pas.',
    });
  });

  test('a pronominal possessor stands beside them, as beside the older quantifiers (A187)', () => {
    const her: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' };
    expect(sayAll(clause(np('CAT', { definiteness: 'each', possessor: her }), 'RUN'))).toEqual({
      en: 'each cat of hers runs.', it: 'ogni suo gatto corre.', fr: 'chaque chat à elle court.', de: 'jeder Kater von ihr läuft.',
      es: 'cada gato suyo corre.', ja: '彼女のそれぞれの猫は走ります。', pt: 'cada gato seu corre.',
    });
    expect(sayAll(clause(np('CAT', { definiteness: 'both', possessor: her }), 'RUN'))).toMatchObject({
      en: 'both cats of hers run.', it: 'entrambi i suoi gatti corrono.', es: 'ambos gatos suyos corren.',
    });
  });
});

describe('P09-E25 D3: another', () => {
  // `indefinite` + OTHER already spells it, so no value was added.
  test('renders from indefinite + OTHER', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'indefinite', adjectives: ['OTHER'] }), 'RUN'))).toEqual({
      en: 'another cat runs.', it: 'un altro gatto corre.', fr: 'un autre chat court.', de: 'ein anderer Kater läuft.',
      es: 'otro gato corre.', ja: '別の猫は走ります。', pt: 'outro gato corre.',
    });
  });
});

describe('P09-E25: the determiner menu', () => {
  test.each<Row>([
    ['each', { en: 'each', it: 'ogni', fr: 'chaque', de: 'jedes', es: 'cada', ja: 'それぞれの', pt: 'cada' }],
    ['every', { en: 'every', it: 'ogni', fr: 'chaque', de: 'jedes', es: 'cada', ja: 'すべての', pt: 'cada' }],
    ['both', { en: 'both', it: 'entrambi i', fr: 'les deux', de: 'beide', es: 'ambos', ja: '両方の', pt: 'ambos os' }],
    ['most', { en: 'most', it: 'la maggior parte dei', fr: 'la plupart des', de: 'die meisten', es: 'la mayoría de los', ja: 'ほとんどの', pt: 'a maioria dos' }],
    ['several', { en: 'several', it: 'parecchi', fr: 'plusieurs', de: 'mehrere', es: 'varios', ja: 'いくつかの', pt: 'vários' }],
    ['enough', { en: 'enough', it: 'abbastanza', fr: 'assez de', de: 'genug', es: 'suficientes', ja: '十分な', pt: 'suficientes' }],
    ['such', { en: 'such a', it: 'un tale', fr: 'un tel', de: 'so ein', es: 'tal', ja: 'そんな', pt: 'tal' }],
  ])('%s — the word it spells', (d, want) => expect(determinerAll(d)).toEqual(want));

  test.each<[string, Record<ReadyLanguageCode, string>]>([
    ['DISTRIBUTIVE', { en: 'distributive', it: 'distributivo', fr: 'distributif', de: 'distributiv', es: 'distributivo', ja: '配分', pt: 'distributivo' }],
    ['EXHAUSTIVE', { en: 'exhaustive', it: 'esaustivo', fr: 'exhaustif', de: 'exhaustiv', es: 'exhaustivo', ja: '網羅的', pt: 'exaustivo' }],
    ['DUAL', { en: 'dual', it: 'duale', fr: 'duel', de: 'dual', es: 'dual', ja: '双数', pt: 'dual' }],
    ['PROPORTIONAL', { en: 'proportional', it: 'proporzionale', fr: 'proportionnel', de: 'proportional', es: 'proporcional', ja: '比率', pt: 'proporcional' }],
    ['MULTIPLE', { en: 'multiple', it: 'multiplo', fr: 'multiple', de: 'mehrfach', es: 'múltiple', ja: '複数', pt: 'múltiplo' }],
    ['SUFFICIENT', { en: 'sufficient', it: 'sufficiente', fr: 'suffisant', de: 'ausreichend', es: 'suficiente', ja: '十分', pt: 'suficiente' }],
    ['SIMILATIVE', { en: 'similative', it: 'similativo', fr: 'similatif', de: 'similativ', es: 'similativo', ja: '類似', pt: 'similativo' }],
  ])('%s — the name it is listed by', (id, want) => expect(wordAll(id, 'QUANTIFIER')).toEqual(want));

  const definitionAll = (id: string) => Object.fromEntries(
    translate(concepts.find((c) => c.id === id)!.definition!, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  );
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    ['DISTRIBUTIVE', { en: 'that indicates each object.', it: 'che indica ogni oggetto.', fr: 'qui indique chaque objet.', de: 'das jeden Gegenstand bezeichnet.', es: 'que indica cada objeto.', ja: 'それぞれの物体を示す。', pt: 'que indica cada objeto.' }],
    ['EXHAUSTIVE', { en: 'that indicates all objects.', it: 'che indica tutti gli oggetti.', fr: 'qui indique tous les objets.', de: 'das alle Gegenstände bezeichnet.', es: 'que indica todos los objetos.', ja: 'すべての物体を示す。', pt: 'que indica todos os objetos.' }],
    ['DUAL', { en: 'that indicates both objects.', it: 'che indica entrambi gli oggetti.', fr: 'qui indique les deux objets.', de: 'das beide Gegenstände bezeichnet.', es: 'que indica ambos objetos.', ja: '両方の物体を示す。', pt: 'que indica ambos os objetos.' }],
    ['PROPORTIONAL', { en: 'that indicates most objects.', it: 'che indica la maggior parte degli oggetti.', fr: 'qui indique la plupart des objets.', de: 'das die meisten Gegenstände bezeichnet.', es: 'que indica la mayoría de los objetos.', ja: 'ほとんどの物体を示す。', pt: 'que indica a maioria dos objetos.' }],
    ['MULTIPLE', { en: 'that indicates several objects.', it: 'che indica parecchi oggetti.', fr: 'qui indique plusieurs objets.', de: 'das mehrere Gegenstände bezeichnet.', es: 'que indica varios objetos.', ja: 'いくつかの物体を示す。', pt: 'que indica vários objetos.' }],
    ['SUFFICIENT', { en: 'that indicates enough objects.', it: 'che indica abbastanza oggetti.', fr: "qui indique assez d'objets.", de: 'das genug Gegenstände bezeichnet.', es: 'que indica suficientes objetos.', ja: '十分な数の物体を示す。', pt: 'que indica objetos suficientes.' }],
    ['SIMILATIVE', { en: 'that indicates such an object.', it: 'che indica un tale oggetto.', fr: 'qui indique un tel objet.', de: 'das so einen Gegenstand bezeichnet.', es: 'que indica tal objeto.', ja: 'そんな物体を示す。', pt: 'que indica tal objeto.' }],
  ])('%s — its gloss', (id, want) => expect(definitionAll(id)).toEqual(want));
});

// P09-E41's plurale tantum (NEWS: it "notizie", fr "nouvelles", de "Nachrichten", es "noticias", pt
// "notícias"; en and ja are singular mass nouns). Its negative quantifier takes the plural the other
// nouns never do, and the distributives, which want a singular it does not have, take it whole.
describe('P09-E25 on a plurale tantum', () => {
  const newsBurns = (definiteness: Definiteness) => sayAll(clause(np('NEWS', { definiteness }), 'BURN'));

  test('`no` takes the plural quantifier where the lexeme has no singular', () => {
    expect(newsBurns('no')).toEqual({
      en: 'no news burns.', it: 'nessune notizie bruciano.', fr: 'aucunes nouvelles ne brûlent.', de: 'keine Nachrichten brennen.',
      es: 'ningunas noticias arden.', ja: 'どのニュースも燃えません。', pt: 'nenhumas notícias ardem.',
    });
    expect(sayAll(clause(np('DOG'), 'READ', { directObject: np('NEWS', { definiteness: 'no' }) }))).toMatchObject({
      it: 'il cane non legge nessune notizie.', fr: 'le chien ne lit aucunes nouvelles.', es: 'el perro no lee ningunas noticias.', pt: 'o cão não lê nenhumas notícias.',
    });
  });

  test('an ordinary noun keeps the singular `no` whatever number was picked', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'no', number: 'plural' }), 'RUN'))).toMatchObject({
      it: 'nessun gatto corre.', fr: 'aucun chat ne court.', es: 'ningún gato corre.', pt: 'nenhum gato corre.',
    });
  });

  test('each and every take a plurale tantum whole, as all', () => {
    expect(newsBurns('each')).toMatchObject({
      it: 'tutte le notizie bruciano.', fr: 'toutes les nouvelles brûlent.', de: 'alle Nachrichten brennen.', es: 'todas las noticias arden.', pt: 'todas as notícias ardem.',
    });
  });

  test('the plural values take it as they take any plural', () => {
    expect(newsBurns('most')).toMatchObject({ it: 'la maggior parte delle notizie brucia.', fr: 'la plupart des nouvelles brûlent.', de: 'die meisten Nachrichten brennen.' });
    expect(newsBurns('several')).toMatchObject({ it: 'parecchie notizie bruciano.', fr: 'plusieurs nouvelles brûlent.', pt: 'várias notícias ardem.' });
    expect(newsBurns('such')).toMatchObject({ it: 'tali notizie bruciano.', fr: 'de telles nouvelles brûlent.', de: 'solche Nachrichten brennen.', es: 'tales noticias arden.', pt: 'tais notícias ardem.' });
  });
});

// A311. A mass noun is never pluralised (resolveNounPhrase: "a mass noun is never counted"), but its
// numeral is still printed, so the count lands on a singular: "the three food burns", "il tre cibo",
// "la trois nourriture", "das drei Essen". English NEWS is mass where the five plurale-tantum
// languages count it, so English alone says "the three news runs", and the distributives, which the
// five take whole as `all`, give "each news" / "every news". The Wants below are the recommended
// ruling (see the bug file's Decisions): English counts news by the piece, and a numeral on a noun that
// is mass in every language is refused by name.
describe('known bugs: a mass noun is counted as if it were a count noun (A311)', () => {
  test('English NEWS with a numeral, as the subject', () => {
    expect(sayAll(clause(np('NEWS', { numeral: 3 }), 'RUN')).en).toBe('the three pieces of news run.');
  });

  test('English NEWS with a numeral, as the object', () => {
    expect(sayAll(clause(np('CAT'), 'READ', { directObject: np('NEWS', { numeral: 3 }) })).en).toBe('the cat reads the three pieces of news.');
  });

  test('English NEWS with each', () => {
    expect(sayAll(clause(np('NEWS', { definiteness: 'each' }), 'BURN')).en).toBe('each piece of news burns.');
  });

  test('English NEWS with every', () => {
    expect(sayAll(clause(np('NEWS', { definiteness: 'every' }), 'BURN')).en).toBe('every piece of news burns.');
  });

  test('a numeral on a noun that is mass in every language is refused by name', () => {
    expect(() => sayAll(clause(np('FOOD', { numeral: 3 }), 'BURN'))).toThrow(/numeral/);
  });

  // The unit is the English lexeme's (`unit`, `unit_plural`); only a numeral or a distributive reads it.
  test('the unit takes an adjective, an approximator and the object slot, and the plain mass noun stays', () => {
    expect(sayAll(clause(np('NEWS', { numeral: 3, adjectives: ['NEW'] }), 'RUN')).en).toBe('the three new pieces of news run.');
    expect(sayAll(clause(np('NEWS', { numeral: 3, approximator: 'about' }), 'RUN')).en).toBe('about three pieces of news run.');
    expect(sayAll(clause(np('NEWS', { numeral: 1 }), 'RUN')).en).toBe('the one piece of news runs.');
    expect(sayAll(clause(np('CAT'), 'READ', { directObject: np('NEWS', { definiteness: 'each' }) })).en).toBe('the cat reads each piece of news.');
    expect(sayAll(clause(np('NEWS'), 'RUN')).en).toBe('the news runs.');
    expect(sayAll(clause(np('NEWS', { definiteness: 'some' }), 'RUN')).en).toBe('some news runs.');
    expect(sayAll(clause(np('NEWS', { numeral: 3 }), 'RUN')).ja).toBe('三つのニュースは走ります。');
  });

  test('the refusal covers any numeral, any slot and WATER, but not a distributive', () => {
    expect(() => sayAll(clause(np('WATER', { numeral: 3 }), 'BURN'))).toThrow(/numeral/);
    expect(() => sayAll(clause(np('FOOD', { numeral: 1 }), 'BURN'))).toThrow(/numeral/);
    expect(() => sayAll(clause(np('CAT'), 'EAT', { directObject: np('FOOD', { numeral: 2 }) }))).toThrow(/numeral/);
    expect(sayAll(clause(np('FOOD', { definiteness: 'every' }), 'BURN'))).toMatchObject({ en: 'every food burns.', it: 'ogni cibo brucia.' });
  });

  test('regression: the five plurale-tantum languages count NEWS, and FOOD keeps its kind-reading each', () => {
    expect(sayAll(clause(np('NEWS', { numeral: 3 }), 'RUN'))).toMatchObject({
      it: 'le tre notizie corrono.', fr: 'les trois nouvelles courent.', de: 'die drei Nachrichten laufen.',
      es: 'las tres noticias corren.', pt: 'as três notícias correm.',
    });
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('FOOD', { definiteness: 'each' }) }))).toMatchObject({
      it: 'il gatto mangia ogni cibo.', fr: 'le chat mange chaque nourriture.', de: 'der Kater frisst jedes Essen.', pt: 'o gato come cada comida.',
    });
    expect(sayAll(clause(np('NEWS', { definiteness: 'all' }), 'BURN')).en).toBe('all news burns.');
  });
});

// A313. Portuguese puts "suficiente" after the noun ("gatos suficientes"), and A187 puts a possessive
// beside a kept determiner after the noun too ("cada gato seu"). With both, the engine stacks them
// in that order and the possessive trails the quantifier: "gatos suficientes seus". The Want is the
// recommended ruling (Decisions in the bug file): the quantifier goes in front, as Spanish has it.
describe('known bugs: Portuguese enough with a possessive trails the possessive after suficientes (A313)', () => {
  const her: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' };
  const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };

  test('as the subject', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural', definiteness: 'enough', possessor: her }), 'RUN')).pt).toBe('suficientes gatos seus correm.');
  });

  test('as the object', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('BOOK', { number: 'plural', definiteness: 'enough', possessor: my }) })).pt)
      .toBe('o cão vê suficientes livros meus.');
  });

  test('regression: without a possessive suficientes stays after the noun, and the other six', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'enough' }), 'RUN')).pt).toBe('gatos suficientes correm.');
    expect(sayAll(clause(np('CAT', { number: 'plural', definiteness: 'enough', possessor: her }), 'RUN'))).toMatchObject({
      en: 'enough cats of hers run.', it: 'abbastanza suoi gatti corrono.', fr: 'assez de chats à elle courent.',
      de: 'genug Kater von ihr laufen.', es: 'suficientes gatos suyos corren.', ja: '彼女の十分な数の猫は走ります。',
    });
  });

  // `ptAdj` puts suficiente(s) first among the prenominal words whenever a pronominal possessive
  // follows the noun, so the mass noun, an adjective, a complement and a genitive possessor go the
  // same way. A noun possessor is no possessive after the noun, and keeps "gatos suficientes".
  test('the mass noun, an adjective, a complement and a genitive possessor', () => {
    const pt = (plan: Parameters<typeof sayAll>[0]) => sayAll(plan).pt;
    expect(pt(clause(np('WATER', { definiteness: 'enough', possessor: her }), 'BURN'))).toBe('suficiente água sua arde.');
    expect(pt(clause(np('CAT', { number: 'plural', definiteness: 'enough', possessor: her, adjectives: ['OLD'] }), 'RUN')))
      .toBe('suficientes gatos velhos seus correm.');
    expect(pt(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { number: 'plural', definiteness: 'enough', possessor: her }) } } })))
      .toBe('o gato corre em suficientes casas suas.');
    expect(pt(clause(np('BOOK', { possessor: np('CAT', { number: 'plural', definiteness: 'enough', possessor: her }) }), 'BURN')))
      .toBe('o livro de suficientes gatos seus arde.');
    expect(pt(clause(np('CAT', { number: 'plural', definiteness: 'enough', adjectives: ['OLD'] }), 'RUN'))).toBe('gatos velhos suficientes correm.');
    expect(pt(clause(np('CAT', { number: 'plural', definiteness: 'enough', possessor: np('WOMAN') }), 'RUN'))).toBe('gatos suficientes da mulher correm.');
  });
});

// A314. The partitive "most" already holds a definite article ("la plupart des chats", "la mayoría de
// los gatos"), and a possessive takes that article's place, as Italian does ("la maggior parte dei
// suoi gatti"). The other five use A187's one-shape possessor for a kept determiner instead, which
// suits "each" and "some" but not a partitive: "la plupart des chats à elle", "most cats of hers",
// "die meisten Kater von ihr", "la mayoría de los gatos suyos", "a maioria dos gatos seus".
describe('known bugs: most with a possessive keeps the possessive out of the partitive (A314)', () => {
  const her: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' };
  const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };

  test('as the subject', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural', definiteness: 'most', possessor: her }), 'RUN'))).toEqual({
      en: 'most of her cats run.', it: 'la maggior parte dei suoi gatti corre.', fr: 'la plupart de ses chats courent.',
      de: 'die meisten ihrer Kater laufen.', es: 'la mayoría de sus gatos corre.', ja: '彼女のほとんどの猫は走ります。', pt: 'a maioria dos seus gatos corre.',
    });
  });

  test('as the object', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('BOOK', { number: 'plural', definiteness: 'most', possessor: my }) }))).toEqual({
      en: 'the dog sees most of my books.', it: 'il cane vede la maggior parte dei miei libri.', fr: 'le chien voit la plupart de mes livres.',
      de: 'der Hund sieht die meisten meiner Bücher.', es: 'el perro ve la mayoría de mis libros.', ja: '犬は私のほとんどの本を見ます。', pt: 'o cão vê a maioria dos meus livros.',
    });
  });

  test('regression: A187\'s one shape stays for each, and all keeps the possessive in its place', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'each', possessor: her }), 'RUN'))).toMatchObject({
      en: 'each cat of hers runs.', fr: 'chaque chat à elle court.', de: 'jeder Kater von ihr läuft.', es: 'cada gato suyo corre.', pt: 'cada gato seu corre.',
    });
    expect(sayAll(clause(np('CAT', { number: 'plural', definiteness: 'all', possessor: her }), 'RUN'))).toMatchObject({
      en: 'all her cats run.', fr: 'tous ses chats courent.', de: 'alle ihre Kater laufen.', es: 'todos sus gatos corren.', pt: 'todos os seus gatos correm.',
    });
  });

  // `most` left `KEPT_BESIDE_POSSESSIVE`, and each noun phrase writes its partitive in front of the
  // possessive as it writes `all`: so a complement, a genitive possessor, a Spanish human object, an
  // adjective, a mass noun and OWN go the same way. German's partitive head is genitive in any case.
  test('a complement, a genitive possessor, a human object, an adjective, a mass noun and OWN', () => {
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { comitative: { phrase: np('CAT', { number: 'plural', definiteness: 'most', possessor: her }) } } })))
      .toEqual({
        en: 'the dog runs with most of her cats.', it: 'il cane corre con la maggior parte dei suoi gatti.', fr: 'le chien court avec la plupart de ses chats.',
        de: 'der Hund läuft mit den meisten ihrer Kater.', es: 'el perro corre con la mayoría de sus gatos.', ja: '犬は彼女のほとんどの猫と走ります。',
        pt: 'o cão corre com a maioria dos seus gatos.',
      });
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { number: 'plural', definiteness: 'most', possessor: my }) } } })))
      .toMatchObject({
        de: 'der Hund läuft in den meisten meiner Häuser.', es: 'el perro corre en la mayoría de mis casas.',
        fr: 'le chien court dans la plupart de mes maisons.', pt: 'o cão corre na maioria das minhas casas.',
      });
    expect(sayAll(clause(np('BOOK', { possessor: np('CAT', { number: 'plural', definiteness: 'most', possessor: her }) }), 'BURN')))
      .toMatchObject({
        en: 'the book of most of her cats burns.', fr: 'le livre de la plupart de ses chats brûle.', de: 'das Buch der meisten ihrer Kater brennt.',
        es: 'el libro de la mayoría de sus gatos arde.', pt: 'o livro da maioria dos seus gatos arde.',
      });
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('FRIEND', { number: 'plural', definiteness: 'most', possessor: my }) })).es)
      .toBe('el perro ve a la mayoría de mis amigos.');
    expect(sayAll(clause(np('CAT', { number: 'plural', definiteness: 'most', possessor: her, adjectives: ['OLD'] }), 'RUN')))
      .toMatchObject({
        en: 'most of her old cats run.', fr: 'la plupart de ses vieux chats courent.', de: 'die meisten ihrer alten Kater laufen.',
        es: 'la mayoría de sus gatos viejos corre.', pt: 'a maioria dos seus gatos velhos corre.',
      });
    expect(sayAll(clause(np('WATER', { definiteness: 'most', possessor: my }), 'BURN')))
      .toMatchObject({
        en: 'most of my water burns.', fr: 'la plus grande partie de mon eau brûle.', de: 'das meiste meines Wassers brennt.',
        es: 'la mayor parte de mi agua arde.', pt: 'a maior parte da minha água arde.',
      });
    expect(sayAll(clause(np('FRIEND', { number: 'plural', definiteness: 'most', possessor: my, possessorOwn: true }), 'RUN')))
      .toMatchObject({
        en: 'most of my own friends run.', fr: 'la plupart de mes propres amis courent.', de: 'die meisten meiner eigenen Freunde laufen.',
        es: 'la mayoría de mis propios amigos corre.', pt: 'a maioria dos meus próprios amigos corre.',
      });
  });
});
