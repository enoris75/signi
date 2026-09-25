import { describe, expect, test } from 'vitest';
import type { Definiteness, NounElement, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// The subject slot, and everything that can be piled into it. RUN is intransitive, so nothing
// but the subject is in play.
const subject = (element: NounElement) => sayAll(clause(element, 'RUN'));
const cat = (extra: Partial<NounPhrase> = {}) => np('CAT', extra);

// ── coordination ──────────────────────────────────────────────────────────────
// The conjunction belongs to the GROUP, not to each junction: three conjuncts are "the cat, the
// dog and the mouse", not "the cat and the dog and the mouse". Where the comma falls and whether
// the word repeats is a fact about each language, so the engines do the joining.
describe('subject: coordination', () => {
  const and = (...ids: string[]): NounElement =>
    ({ conjuncts: ids.map((id) => np(id)), conjunction: 'and' });
  const or = (...ids: string[]): NounElement =>
    ({ conjuncts: ids.map((id) => np(id)), conjunction: 'or' });

  test('AND — two conjuncts, and the verb goes plural', () => {
    expect(subject(and('CAT', 'DOG'))).toEqual({
      en: 'the cat and the dog run.',
      it: 'il gatto e il cane corrono.', // Romance repeats the article
      fr: 'le chat et le chien courent.',
      es: 'el gato y el perro corren.',
      pt: 'o gato e o cão correm.',
      de: 'der Kater und der Hund laufen.',
      ja: '猫と犬は走ります。', // と
    });
  });

  test('OR — two conjuncts, and the verb stays singular', () => {
    // A disjunction picks out one of them, so it does not pluralise the verb.
    expect(subject(or('CAT', 'DOG'))).toEqual({
      en: 'the cat or the dog runs.',
      it: 'il gatto o il cane corre.',
      fr: 'le chat ou le chien court.',
      es: 'el gato o el perro corre.',
      pt: 'o gato ou o cão corre.',
      de: 'der Kater oder der Hund läuft.',
      ja: '猫か犬は走ります。', // か, not と
    });
  });

  test('three conjuncts take a comma; the conjunction does not repeat', () => {
    expect(subject(and('CAT', 'DOG', 'MOUSE'))).toMatchObject({
      en: 'the cat, the dog and the mouse run.',
      it: 'il gatto, il cane e il topo corrono.',
      fr: 'le chat, le chien et la souris courent.',
      de: 'der Kater, der Hund und die Maus laufen.',
      // Japanese is the exception: it repeats と between every conjunct.
      ja: '猫と犬とネズミは走ります。',
    });

    expect(subject(or('CAT', 'DOG', 'MOUSE'))).toMatchObject({
      en: 'the cat, the dog or the mouse runs.',
      it: 'il gatto, il cane o il topo corre.',
      de: 'der Kater, der Hund oder die Maus läuft.',
      ja: '猫か犬かネズミは走ります。', // か likewise repeats
    });
  });

  test('four conjuncts — the comma rule holds past three', () => {
    expect(subject(and('CAT', 'DOG', 'MOUSE', 'FOX'))).toMatchObject({
      en: 'the cat, the dog, the mouse and the fox run.',
      it: 'il gatto, il cane, il topo e la volpe corrono.',
      fr: 'le chat, le chien, la souris et le renard courent.',
      de: 'der Kater, der Hund, die Maus und der Fuchs laufen.',
    });

    expect(subject(or('CAT', 'DOG', 'MOUSE', 'FOX'))).toMatchObject({
      en: 'the cat, the dog, the mouse or the fox runs.',
      es: 'el gato, el perro, el ratón o el zorro corre.',
      ja: '猫か犬かネズミかキツネは走ります。',
    });
  });

  test('a disjunction agrees with the NEAREST conjunct, not with the group', () => {
    // Proximity agreement: "the cat or the dogs RUN" (plural, from "dogs"), where the same
    // conjuncts under AND would pluralise anyway. The contrast only shows on OR.
    expect(subject(or('CAT', 'DOG'))).toMatchObject({ en: 'the cat or the dog runs.' });

    const mixed: NounElement = {
      conjuncts: [cat(), np('DOG', { number: 'plural' })],
      conjunction: 'or',
    };
    expect(subject(mixed)).toMatchObject({
      en: 'the cat or the dogs run.', // plural, agreeing with "dogs"
      it: 'il gatto o i cani corrono.',
      es: 'el gato o los perros corren.',
    });
  });

  test('each conjunct keeps its own determiner, number and adjectives', () => {
    expect(subject({
      conjuncts: [
        np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'] }),
        np('DOG', { number: 'plural', adjectives: ['OLD'] }),
      ],
      conjunction: 'and',
    })).toMatchObject({
      en: 'a big cat and the old dogs run.',
      it: 'un grande gatto e i vecchi cani corrono.',
      es: 'un gato grande y los perros viejos corren.',
      // German declines each adjective for ITS OWN determiner: mixed after "ein" (großer),
      // weak after "die" (alten).
      de: 'ein großer Kater und die alten Hunde laufen.',
    });
  });
});

// ── determiner × adjective ────────────────────────────────────────────────────
// German is the reason this matters: its adjective ending depends on the determiner in front of
// it (strong with none, mixed after ein-/kein-, weak after the definite article and alle/dies-).
describe('subject: determiners with an adjective', () => {
  const withDet = (definiteness: Definiteness) =>
    subject(cat({ definiteness, adjectives: ['BIG'] }));

  test('definite — German takes the weak ending', () => {
    expect(withDet('definite')).toMatchObject({
      en: 'the big cat runs.',
      it: 'il grande gatto corre.',
      es: 'el gato grande corre.', // Iberian Romance postposes the adjective
      de: 'der große Kater läuft.', // weak: -e
    });
  });

  test('indefinite — German takes the mixed ending', () => {
    expect(withDet('indefinite')).toMatchObject({
      en: 'a big cat runs.',
      it: 'un grande gatto corre.',
      fr: 'un grand chat court.',
      de: 'ein großer Kater läuft.', // mixed: -er, because "ein" is uninflected here
    });
  });

  test('bare — German takes the strong ending', () => {
    expect(withDet('bare')).toMatchObject({
      en: 'big cat runs.',
      it: 'grande gatto corre.',
      de: 'großer Kater läuft.', // strong: the adjective carries the case itself
    });
  });

  test('the quantifiers force the plural, and the verb follows', () => {
    expect(withDet('some')).toMatchObject({
      en: 'some big cats run.',
      it: 'alcuni grandi gatti corrono.',
      fr: 'quelques grands chats courent.',
      de: 'einige große Kater laufen.',
    });

    expect(withDet('many')).toMatchObject({
      en: 'many big cats run.',
      it: 'molti grandi gatti corrono.',
      fr: 'beaucoup de grands chats courent.', // "beaucoup DE", not "beaucoup les"
      de: 'viele große Kater laufen.',
    });

    expect(withDet('few')).toMatchObject({
      en: 'few big cats run.',
      it: 'pochi grandi gatti corrono.',
      fr: 'peu de grands chats courent.',
    });

    expect(withDet('all')).toMatchObject({
      en: 'all big cats run.',
      it: 'tutti i grandi gatti corrono.', // "tutti I" — all takes the article in Romance
      fr: 'tous les grands chats courent.',
      de: 'alle großen Kater laufen.', // weak after "alle"
    });
  });

  test('the negative determiner stays singular, and French adds its "ne"', () => {
    expect(withDet('no')).toMatchObject({
      en: 'no big cat runs.',
      it: 'nessun grande gatto corre.', // nessuno → nessun
      fr: 'aucun grand chat ne court.', // the negative determiner needs the preverbal "ne"
      es: 'ningún gato grande corre.',
      de: 'kein großer Kater läuft.', // mixed, like ein-
    });
  });

  test('the demonstratives', () => {
    expect(withDet('this')).toMatchObject({
      en: 'this big cat runs.',
      it: 'questo grande gatto corre.',
      de: 'dieser große Kater läuft.', // weak after dies-
      es: 'este gato grande corre.',
    });

    expect(withDet('that')).toMatchObject({
      en: 'that big cat runs.',
      it: 'quel grande gatto corre.', // quello → quel before a consonant
      es: 'ese gato grande corre.',
      de: 'jener große Kater läuft.',
    });
  });
});

// ── adjective × plural ────────────────────────────────────────────────────────
describe('subject: adjectives in the plural', () => {
  test('one adjective', () => {
    expect(subject(cat({ number: 'plural', adjectives: ['BIG'] }))).toEqual({
      en: 'the big cats run.',
      it: 'i grandi gatti corrono.',
      fr: 'les grands chats courent.',
      es: 'los gatos grandes corren.',
      pt: 'os gatos grandes correm.',
      de: 'die großen Kater laufen.',
      ja: '大きい猫は走ります。', // no number marking
    });
  });

  test('two adjectives — Iberian Romance coordinates them', () => {
    expect(subject(cat({ number: 'plural', adjectives: ['BIG', 'OLD'] }))).toMatchObject({
      en: 'the big old cats run.',
      it: 'i grandi gatti vecchi corrono.', // one qualifying adjective in front (A145)
      fr: 'les grands vieux chats courent.',
      es: 'los gatos grandes y viejos corren.', // "y" between postnominal adjectives
      pt: 'os gatos grandes e velhos correm.',
      de: 'die großen alten Kater laufen.',
    });
  });

  test('plural AND feminine — everything agrees at once', () => {
    expect(subject(cat({ number: 'plural', gender: 'fem', adjectives: ['BIG', 'OLD'] })))
      .toMatchObject({
        it: 'le grandi gatte vecchie corrono.', // article, both adjectives, and the noun
        fr: 'les grandes vieilles chattes courent.',
        es: 'las gatas grandes y viejas corren.',
        de: 'die großen alten Katzen laufen.',
      });
  });

  test('plural with a determiner and an adjective', () => {
    expect(subject(cat({ number: 'plural', definiteness: 'indefinite', adjectives: ['BIG'] })))
      .toMatchObject({
        en: 'big cats run.', // English drops the article for an indefinite plural
        it: 'dei grandi gatti corrono.', // a preverbal subject takes the partitive (A378)
        es: 'unos gatos grandes corren.',
        de: 'große Kater laufen.', // strong ending, there being no determiner
      });

    expect(subject(cat({ number: 'plural', definiteness: 'many', adjectives: ['BIG'] })))
      .toMatchObject({
        en: 'many big cats run.',
        it: 'molti grandi gatti corrono.',
        de: 'viele große Kater laufen.',
      });
  });
});

// ── possessor × relative clause ───────────────────────────────────────────────
// Both hang off the same head, and they are independent: the possessor is a noun phrase in the
// genitive, the relative clause is a predicate. A head may carry either, or both.
describe('subject: a possessor and a relative clause together', () => {
  const book = (extra: Partial<NounPhrase>) => subject(np('BOOK', extra));

  test('the head has a possessor and a relative clause of its own', () => {
    expect(book({
      possessor: np('CAT'),
      relative: { verbPhrase: { verb: 'BURN' } },
    })).toMatchObject({
      en: "the cat's book that burns runs.",
      it: 'il libro del gatto che brucia corre.',
      fr: 'le livre du chat qui brûle court.',
      es: 'el libro del gato que arde corre.',
    });
  });

  test('the relative clause may take the head as its object', () => {
    expect(book({
      possessor: np('CAT'),
      relative: { headRole: 'directObject', subject: np('DOG'), verbPhrase: { verb: 'READ' } },
    })).toMatchObject({
      en: "the cat's book that the dog reads runs.",
      it: 'il libro del gatto che il cane legge corre.',
      fr: 'le livre du chat que le chien lit court.', // que — the object relativiser
      pt: 'o livro do gato que o cão lê corre.',
    });
  });

  test('the possessor may carry a clause of its own, giving two', () => {
    // "the book of [the cat that eats the mouse] that [the dog reads]" — two clauses, two heads.
    expect(book({
      possessor: np('CAT', {
        relative: { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') },
      }),
      relative: { headRole: 'directObject', subject: np('DOG'), verbPhrase: { verb: 'READ' } },
    })).toMatchObject({
      it: 'il libro del gatto che mangia il topo che il cane legge corre.',
      fr: 'le livre du chat qui mange la souris que le chien lit court.',
      es: 'el libro del gato que come el ratón que el perro lee corre.',
      // English is left out: its Saxon genitive breaks on a clause-bearing possessor — see the
      // group-genitive bug in possession.test.ts.
    });
  });

  test('all of it at once — determiner, adjectives, plural, possessor, relative', () => {
    expect(book({
      number: 'plural',
      adjectives: ['BIG'],
      possessor: np('CAT', { number: 'plural' }),
      relative: { verbPhrase: { verb: 'BURN' } },
    })).toMatchObject({
      // The plural genitive is apostrophe-only, and it lands correctly here because the possessor
      // carries no clause of its own.
      en: "the cats' big books that burn run.",
      it: 'i grandi libri dei gatti che bruciano corrono.', // di + i = dei
      fr: 'les grands livres des chats qui brûlent courent.',
      es: 'los libros grandes de los gatos que arden corren.',
    });
  });
});

// Three genders, each with an indefinite article and two adjectives. German is the reason this is
// interesting: it has three genders (der/die/das) AND its INDEFINITE ("mixed") declension puts
// the gender ending on the adjective — -er / -e / -es — because "ein" itself is uninflected in the
// nominative and so carries no gender of its own. Both adjectives take the ending.
describe('subject: three genders, indefinite + two adjectives', () => {
  const twoAdj = (extra: Partial<NounPhrase>): NounPhrase =>
    ({ concept: 'CAT', definiteness: 'indefinite', adjectives: ['BIG', 'OLD'], ...extra });

  test('masculine', () => {
    // CAT defaults to its masculine lexeme (der Kater / il gatto).
    expect(subject(twoAdj({}))).toMatchObject({
      en: 'a big old cat runs.',
      it: 'un grande gatto vecchio corre.',
      fr: 'un grand vieux chat court.',
      es: 'un gato grande y viejo corre.',
      de: 'ein großer alter Kater läuft.', // mixed masc: -er on both adjectives
    });
  });

  test('feminine', () => {
    // gender:'fem' selects the feminine lexeme, and article, both adjectives and noun all agree.
    expect(subject(twoAdj({ gender: 'fem' }))).toMatchObject({
      it: 'una grande gatta vecchia corre.', // una … gatta … vecchia
      fr: 'une grande vieille chatte court.',
      es: 'una gata grande y vieja corre.',
      pt: 'uma gata grande e velha corre.',
      de: 'eine große alte Katze läuft.', // mixed fem: -e
    });
  });

  test('neuter', () => {
    // Only German has a third gender; BOOK is das Buch there, but masculine (il libro) in Romance,
    // which has no neuter — so Romance shows its masculine, German its neuter.
    expect(subject({
      concept: 'BOOK', definiteness: 'indefinite', adjectives: ['BIG', 'OLD'],
    })).toMatchObject({
      en: 'a big old book runs.',
      it: 'un grande libro vecchio corre.', // masc in Italian
      de: 'ein großes altes Buch läuft.', // mixed neut: -es
    });
  });

  test('the ending follows the noun\'s gender, not the noun itself', () => {
    const de = (concept: string, gender?: 'fem') =>
      subject({ concept, definiteness: 'indefinite', adjectives: ['BIG', 'OLD'], ...(gender ? { gender } : {}) }).de;
    // A different neuter noun takes -es too; a feminine one takes -e — so it is the gender doing
    // the work, not the lexeme.
    expect(de('HOUSE')).toBe('ein großes altes Haus läuft.'); // das Haus → -es
    expect(de('MOUSE')).toBe('eine große alte Maus läuft.'); // die Maus → -e
    expect(de('CAT')).toBe('ein großer alter Kater läuft.'); // der Kater → -er
  });

  test('German grammatical gender is language-specific: HOUSE is neuter there, feminine in Romance', () => {
    expect(subject({
      concept: 'HOUSE', definiteness: 'indefinite', adjectives: ['BIG', 'OLD'],
    })).toMatchObject({
      de: 'ein großes altes Haus läuft.', // neuter
      it: 'una grande casa vecchia corre.', // feminine (la casa)
      fr: 'une grande vieille maison court.',
      es: 'una casa grande y vieja corre.',
    });
  });
});

// The kinship and cattle nouns seeded for B02 (MAN/FATHER/OX localization): WOMAN (inherently
// feminine), PARENT (a genus with a feminine counterpart), BOVINE (a genus, German neuter Rind).
describe('subject: B02 kin and cattle nouns', () => {
  test('WOMAN is inherently feminine, and pluralises', () => {
    expect(subject(np('WOMAN'))).toEqual({
      en: 'the woman runs.',
      it: 'la donna corre.',
      fr: 'la femme court.',
      de: 'die Frau läuft.',
      es: 'la mujer corre.',
      ja: '女は走ります。',
      pt: 'a mulher corre.',
    });
    expect(subject(np('WOMAN', { number: 'plural' }))).toMatchObject({
      en: 'the women run.', // irregular English plural
      it: 'le donne corrono.',
      de: 'die Frauen laufen.',
      es: 'las mujeres corren.',
      pt: 'as mulheres correm.',
    });
  });

  test('PARENT is a masculine genus with a feminine counterpart', () => {
    expect(subject(np('PARENT'))).toEqual({
      en: 'the parent runs.',
      it: 'il genitore corre.',
      fr: 'le parent court.',
      de: 'das Elternteil läuft.', // neuter
      es: 'el progenitor corre.',
      ja: '親は走ります。',
      pt: 'o progenitor corre.',
    });
    // gender:'fem' selects the feminine lexeme where the language has one (genitrice / progenitora);
    // French and German, which do not, keep the base form — and German's plural is another word
    // altogether, "die Eltern", where *Elternteile* is what nobody says (P11 D7, localization B68).
    expect(subject(np('PARENT', { gender: 'fem', number: 'plural' }))).toMatchObject({
      it: 'le genitrici corrono.',
      es: 'las progenitoras corren.',
      pt: 'as progenitoras correm.',
      fr: 'les parents courent.',
      de: 'die Eltern laufen.',
    });
    // The masculine plural is the word for two parents in Spanish and Portuguese: padres, pais.
    expect(subject(np('PARENT', { number: 'plural' }))).toMatchObject({
      de: 'die Eltern laufen.',
      es: 'los padres corren.',
      pt: 'os pais correm.',
      ja: '両親は走ります。',
    });
  });

  test('BOVINE is a genus — masculine in Romance, neuter (Rind) in German', () => {
    expect(subject(np('BOVINE'))).toEqual({
      en: 'the bovine runs.',
      it: 'il bovino corre.',
      fr: 'le bovin court.',
      de: 'das Rind läuft.', // neuter
      es: 'el bovino corre.',
      ja: '牛は走ります。',
      pt: 'o bovino corre.',
    });
    expect(subject(np('BOVINE', { number: 'plural' }))).toMatchObject({
      it: 'i bovini corrono.',
      de: 'die Rinder laufen.', // Rind → Rinder
      es: 'los bovinos corren.',
    });
  });
});

// ACTION, seeded for B06 (the VERB definition — "a word that expresses actions"). Feminine in
// every gendered language (azione / action / Handlung / acción / ação), and vowel-initial in
// Italian and French so the definite article elides (l'azione / l'action).
describe('subject: the B06 abstract noun ACTION', () => {
  test('ACTION is feminine, elides the article in it/fr, and pluralises', () => {
    expect(subject(np('ACTION'))).toEqual({
      en: 'the action runs.',
      it: "l'azione corre.",
      fr: "l'action court.",
      de: 'die Handlung läuft.',
      es: 'la acción corre.',
      ja: '動作は走ります。',
      pt: 'a ação corre.',
    });
    expect(subject(np('ACTION', { number: 'plural' }))).toMatchObject({
      en: 'the actions run.',
      it: 'le azioni corrono.',
      fr: 'les actions courent.',
      de: 'die Handlungen laufen.',
      es: 'las acciones corren.',
      pt: 'as ações correm.',
    });
  });
});

// BUILDING, the genus seeded for B29 over HOUSE and PRISON. Worth its own case rather than a
// DIFFERENTIA_NOUNS row for two paradigms the table's shape would not reach: German "Gebäude" is
// one of the neuter nouns whose plural is identical to its singular, so only the article moves;
// and Italian "edificio" is vowel-initial, which makes its masculine plural article alternate —
// "gli edifici" bare, but "i grandi edifici" once a consonant-initial adjective comes between.
describe('subject: the B29 genus BUILDING', () => {
  test('BUILDING elides in it/fr and keeps an identical German plural', () => {
    expect(subject(np('BUILDING'))).toEqual({
      en: 'the building runs.',
      it: "l'edificio corre.",
      fr: 'le bâtiment court.',
      de: 'das Gebäude läuft.',
      es: 'el edificio corre.',
      ja: '建物は走ります。',
      pt: 'o edifício corre.',
    });
    expect(subject(np('BUILDING', { number: 'plural' }))).toEqual({
      en: 'the buildings run.',
      it: 'gli edifici corrono.', // vowel-initial masculine plural takes gli, not i
      fr: 'les bâtiments courent.',
      de: 'die Gebäude laufen.', // Gebäude → Gebäude; only the article pluralises
      es: 'los edificios corren.',
      ja: '建物は走ります。',
      pt: 'os edifícios correm.',
    });
    expect(subject(np('BUILDING', { definiteness: 'indefinite' }))).toEqual({
      en: 'a building runs.',
      it: 'un edificio corre.', // masculine un does not apostrophise (cf. un'opzione)
      fr: 'un bâtiment court.',
      de: 'ein Gebäude läuft.',
      es: 'un edificio corre.',
      ja: '建物は走ります。',
      pt: 'um edifício corre.',
    });
  });

  test('an adjective agrees, and moves the Italian article back to i', () => {
    expect(subject(np('BUILDING', { number: 'plural', adjectives: ['BIG'] }))).toMatchObject({
      en: 'the big buildings run.',
      it: 'i grandi edifici corrono.', // grandi is consonant-initial, so gli → i
      fr: 'les grands bâtiments courent.',
      de: 'die großen Gebäude laufen.',
      es: 'los edificios grandes corren.', // Romance postnominal, unlike it/fr
      pt: 'os edifícios grandes correm.',
    });
    expect(subject(np('BUILDING', { definiteness: 'indefinite', adjectives: ['BIG'] }))).toMatchObject({
      de: 'ein großes Gebäude läuft.', // neuter strong -es after ein
      it: 'un grande edificio corre.',
      ja: '大きい建物は走ります。',
    });
  });
});

// The countable differentia nouns seeded for the verb definitions (a blade, a tooth, a place, a tear,
// a sound, an option, a button, a keyboard). Each row pins the definite singular, the definite
// plural and the indefinite singular in every language — so the article's gender (and its elision
// in it/fr), the plural (irregular "teeth" / "Zähne", French "lieux", Portuguese "botões") and the
// Japanese surface are all watched. The mass nouns PROPERTY and AFFECTION are in nounPhrase.test.ts.
type Said = Record<'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'pt', string>;
const DIFFERENTIA_NOUNS: [id: string, the: Said, thePlural: Said, a: Said][] = [
  ['BLADE',
    { en: 'the blade runs.', it: 'la lama corre.', fr: 'la lame court.', de: 'die Klinge läuft.', es: 'la cuchilla corre.', ja: '刃は走ります。', pt: 'a lâmina corre.' },
    { en: 'the blades run.', it: 'le lame corrono.', fr: 'les lames courent.', de: 'die Klingen laufen.', es: 'las cuchillas corren.', ja: '刃は走ります。', pt: 'as lâminas correm.' },
    { en: 'a blade runs.', it: 'una lama corre.', fr: 'une lame court.', de: 'eine Klinge läuft.', es: 'una cuchilla corre.', ja: '刃は走ります。', pt: 'uma lâmina corre.' }],
  ['TOOTH',
    { en: 'the tooth runs.', it: 'il dente corre.', fr: 'la dent court.', de: 'der Zahn läuft.', es: 'el diente corre.', ja: '歯は走ります。', pt: 'o dente corre.' },
    { en: 'the teeth run.', it: 'i denti corrono.', fr: 'les dents courent.', de: 'die Zähne laufen.', es: 'los dientes corren.', ja: '歯は走ります。', pt: 'os dentes correm.' },
    { en: 'a tooth runs.', it: 'un dente corre.', fr: 'une dent court.', de: 'ein Zahn läuft.', es: 'un diente corre.', ja: '歯は走ります。', pt: 'um dente corre.' }],
  ['PLACE',
    { en: 'the place runs.', it: 'il luogo corre.', fr: 'le lieu court.', de: 'der Ort läuft.', es: 'el lugar corre.', ja: '場所は走ります。', pt: 'o lugar corre.' },
    { en: 'the places run.', it: 'i luoghi corrono.', fr: 'les lieux courent.', de: 'die Orte laufen.', es: 'los lugares corren.', ja: '場所は走ります。', pt: 'os lugares correm.' },
    { en: 'a place runs.', it: 'un luogo corre.', fr: 'un lieu court.', de: 'ein Ort läuft.', es: 'un lugar corre.', ja: '場所は走ります。', pt: 'um lugar corre.' }],
  ['TEAR',
    { en: 'the tear runs.', it: 'la lacrima corre.', fr: 'la larme court.', de: 'die Träne läuft.', es: 'la lágrima corre.', ja: '涙は走ります。', pt: 'a lágrima corre.' },
    { en: 'the tears run.', it: 'le lacrime corrono.', fr: 'les larmes courent.', de: 'die Tränen laufen.', es: 'las lágrimas corren.', ja: '涙は走ります。', pt: 'as lágrimas correm.' },
    { en: 'a tear runs.', it: 'una lacrima corre.', fr: 'une larme court.', de: 'eine Träne läuft.', es: 'una lágrima corre.', ja: '涙は走ります。', pt: 'uma lágrima corre.' }],
  ['SOUND',
    { en: 'the sound runs.', it: 'il suono corre.', fr: 'le son court.', de: 'das Geräusch läuft.', es: 'el sonido corre.', ja: '音は走ります。', pt: 'o som corre.' },
    { en: 'the sounds run.', it: 'i suoni corrono.', fr: 'les sons courent.', de: 'die Geräusche laufen.', es: 'los sonidos corren.', ja: '音は走ります。', pt: 'os sons correm.' },
    { en: 'a sound runs.', it: 'un suono corre.', fr: 'un son court.', de: 'ein Geräusch läuft.', es: 'un sonido corre.', ja: '音は走ります。', pt: 'um som corre.' }],
  ['OPTION',
    { en: 'the option runs.', it: "l'opzione corre.", fr: "l'option court.", de: 'die Option läuft.', es: 'la opción corre.', ja: '選択肢は走ります。', pt: 'a opção corre.' },
    { en: 'the options run.', it: 'le opzioni corrono.', fr: 'les options courent.', de: 'die Optionen laufen.', es: 'las opciones corren.', ja: '選択肢は走ります。', pt: 'as opções correm.' },
    { en: 'an option runs.', it: "un'opzione corre.", fr: 'une option court.', de: 'eine Option läuft.', es: 'una opción corre.', ja: '選択肢は走ります。', pt: 'uma opção corre.' }],
  ['BUTTON',
    { en: 'the button runs.', it: 'il pulsante corre.', fr: 'le bouton court.', de: 'die Taste läuft.', es: 'el botón corre.', ja: 'ボタンは走ります。', pt: 'o botão corre.' },
    { en: 'the buttons run.', it: 'i pulsanti corrono.', fr: 'les boutons courent.', de: 'die Tasten laufen.', es: 'los botones corren.', ja: 'ボタンは走ります。', pt: 'os botões correm.' },
    { en: 'a button runs.', it: 'un pulsante corre.', fr: 'un bouton court.', de: 'eine Taste läuft.', es: 'un botón corre.', ja: 'ボタンは走ります。', pt: 'um botão corre.' }],
  ['KEYBOARD',
    { en: 'the keyboard runs.', it: 'la tastiera corre.', fr: 'le clavier court.', de: 'die Tastatur läuft.', es: 'el teclado corre.', ja: 'キーボードは走ります。', pt: 'o teclado corre.' },
    { en: 'the keyboards run.', it: 'le tastiere corrono.', fr: 'les claviers courent.', de: 'die Tastaturen laufen.', es: 'los teclados corren.', ja: 'キーボードは走ります。', pt: 'os teclados correm.' },
    { en: 'a keyboard runs.', it: 'una tastiera corre.', fr: 'un clavier court.', de: 'eine Tastatur läuft.', es: 'un teclado corre.', ja: 'キーボードは走ります。', pt: 'um teclado corre.' }],
  // BUILDING's differentia (C05): German umlauts its plural, Spanish and Portuguese are feminine.
  ['WALL',
    { en: 'the wall runs.', it: 'il muro corre.', fr: 'le mur court.', de: 'die Wand läuft.', es: 'la pared corre.', ja: '壁は走ります。', pt: 'a parede corre.' },
    { en: 'the walls run.', it: 'i muri corrono.', fr: 'les murs courent.', de: 'die Wände laufen.', es: 'las paredes corren.', ja: '壁は走ります。', pt: 'as paredes correm.' },
    { en: 'a wall runs.', it: 'un muro corre.', fr: 'un mur court.', de: 'eine Wand läuft.', es: 'una pared corre.', ja: '壁は走ります。', pt: 'uma parede corre.' }],
];

describe('subject: the differentia nouns', () => {
  test.each(DIFFERENTIA_NOUNS)('%s takes its gendered article and pluralises', (id, the, thePlural, a) => {
    expect(subject(np(id))).toEqual(the);
    expect(subject(np(id, { number: 'plural' }))).toEqual(thePlural);
    expect(subject(np(id, { definiteness: 'indefinite' }))).toEqual(a);
  });
});

// `gender` carries three values, but 'neut' is meaningful only for a pronoun head ("it"). On a
// noun it is a no-op: the head keeps its own (default/masculine) lexeme and gender.
describe('subject: the neuter gender value on a noun head', () => {
  test("gender:'neut' on a noun is ignored — identical to the default", () => {
    const base: NounPhrase = {
      concept: 'CAT', definiteness: 'indefinite', adjectives: ['BIG', 'OLD'],
    };
    const neuter = subject({ ...base, gender: 'neut' });
    expect(neuter).toEqual(subject({ ...base, gender: 'masc' }));
    expect(neuter).toMatchObject({ de: 'ein großer alter Kater läuft.', it: 'un grande gatto vecchio corre.' });
  });
});

// FEELING, the genus seeded for B30 over AFFECTION. The pair is worth pinning together because the
// two nouns take opposite countability: FEELING is a count noun with a plural in every language,
// while AFFECTION is a mass noun with none — and the mass one is what makes the Romance partitive
// and the bare German show up.
describe('subject: the B30 genus FEELING and its child AFFECTION', () => {
  test('FEELING pluralises, and German Gefühl is neuter', () => {
    expect(subject(np('FEELING'))).toEqual({
      en: 'the feeling runs.',
      it: 'il sentimento corre.',
      fr: 'le sentiment court.',
      de: 'das Gefühl läuft.', // neuter
      es: 'el sentimiento corre.',
      ja: '感情は走ります。',
      pt: 'o sentimento corre.',
    });
    expect(subject(np('FEELING', { number: 'plural' }))).toEqual({
      en: 'the feelings run.',
      it: 'i sentimenti corrono.',
      fr: 'les sentiments courent.',
      de: 'die Gefühle laufen.',
      es: 'los sentimientos corren.',
      ja: '感情は走ります。',
      pt: 'os sentimentos correm.',
    });
    // The bare plural FEEL's gloss renders ("to have feelings") as an object, bare; as a subject it is
    // the generic, which the Romance four say with the definite article (A376).
    expect(subject(np('FEELING', { definiteness: 'bare', number: 'plural' }))).toMatchObject({
      en: 'feelings run.',
      it: 'i sentimenti corrono.',
      fr: 'les sentiments courent.',
      de: 'Gefühle laufen.',
      pt: 'os sentimentos correm.',
    });
  });

  test('AFFECTION stays a mass noun under its new parent, and elides in it/fr', () => {
    expect(subject(np('AFFECTION'))).toEqual({
      en: 'the affection runs.',
      it: "l'affetto corre.", // vowel-initial: the definite article elides
      fr: "l'affection court.",
      de: 'die Zuneigung läuft.',
      es: 'el afecto corre.',
      ja: '愛情は走ります。',
      pt: 'o afeto corre.',
    });
    // AFFECTION's own gloss, "a warm feeling", is composed on FEELING — but the word itself is
    // uncountable, so an indefinite AFFECTION takes no article at all (French a partitive).
    expect(subject(np('AFFECTION', { definiteness: 'indefinite', adjectives: ['WARM'] }))).toEqual({
      en: 'warm affection runs.',
      it: 'affetto caloroso corre.',
      fr: "de l'affection chaleureuse court.",
      de: 'warme Zuneigung läuft.',
      es: 'afecto cálido corre.',
      ja: '温かい愛情は走ります。',
      pt: 'afeto caloroso corre.',
    });
  });
});

// A376. A bare plural subject keeps no article in Italian, French, Spanish and Portuguese, where a
// preverbal subject cannot go bare: English "cats run" is generic, and the Romance generic is the
// definite article. The console line `/subj ( fly /adj ( time ) /pl /zero ) /verb ( like ) …` gave
// "a mosche a tempo piace una freccia." Found 2026-09-25; B76 reading 5 and P09-E24 had reported it.
describe('known bugs: a bare plural subject loses its article in it / fr / es / pt (A376)', () => {
  const bare = { definiteness: 'bare', number: 'plural' } as const;
  const likes = (subj: NounPhrase, obj: NounPhrase) => sayAll(clause(subj, 'LIKE', { directObject: obj }));

  test('the generic subject takes the definite article', () => {
    expect(subject(cat(bare))).toMatchObject({
      it: 'i gatti corrono.', // now: "gatti corrono."
      fr: 'les chats courent.', // now: "chats courent."
      es: 'los gatos corren.', // now: "gatos corren."
      pt: 'os gatos correm.', // now: "gatos correm."
    });
    expect(likes(cat(bare), np('MOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'ai gatti piace un topo.', // now: "a gatti piace un topo."
      fr: 'les chats aiment une souris.', // now: "chats aiment une souris."
      es: 'a los gatos les gusta un ratón.', // now: "a gatos les gusta un ratón."
      pt: 'os gatos gostam de um rato.', // now: "gatos gostam de um rato."
    });
    const timeFlies = np('FLY_INSECT', { ...bare, nounModifiers: [{ concept: 'TIME', relation: 'domain' }] });
    expect(likes(timeFlies, np('ARROW_PROJECTILE', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'alle mosche del tempo piace una freccia.', // now: "a mosche del tempo piace una freccia."
    });
  });

  test('English, German and Japanese keep it bare, and a bare plural object stays bare', () => {
    expect(subject(cat(bare))).toMatchObject({ en: 'cats run.', de: 'Kater laufen.', ja: '猫は走ります。' });
    expect(sayAll(clause(cat(), 'SEE', { directObject: np('MOUSE', bare) }))).toMatchObject({
      it: 'il gatto vede topi.',
      fr: 'le chat voit des souris.',
      es: 'el gato ve ratones.',
      pt: 'o gato vê ratos.',
    });
  });

  test('a bare mass subject takes it too, and a bare mass object keeps its own', () => {
    expect(sayAll(clause(np('WATER', { definiteness: 'bare' }), 'FLOW'))).toMatchObject({
      en: 'water flows.', it: "l'acqua scorre.", fr: "l'eau coule.", de: 'Wasser fließt.', es: 'el agua fluye.', pt: 'a água flui.',
    });
    expect(sayAll(clause(cat(), 'SEE', { directObject: np('WATER', { definiteness: 'bare' }) }))).toMatchObject({
      it: 'il gatto vede acqua.', fr: "le chat voit de l'eau.", es: 'el gato ve agua.', pt: 'o gato vê água.',
    });
  });

  test('the grammatical subject takes it whichever slot of the plan it came from; a passive agent does not', () => {
    const mice = np('MOUSE', bare);
    expect(sayAll(clause(cat(), 'EAT', { directObject: mice, verbPhrase: { voice: 'passive' } }))).toMatchObject({
      it: 'i topi sono mangiati dal gatto.', fr: 'les souris sont mangées par le chat.',
      es: 'los ratones son comidos por el gato.', pt: 'os ratos são comidos pelo gato.',
    });
    // piacere / gustar make the thing liked the subject; French *aimer* keeps it the object.
    expect(likes(cat(), mice)).toMatchObject({
      it: 'al gatto piacciono i topi.', fr: 'le chat aime des souris.', es: 'al gato le gustan los ratones.', pt: 'o gato gosta de ratos.',
    });
    expect(sayAll(clause(np('MOUSE'), 'EAT', { directObject: cat(), verbPhrase: { voice: 'passive' } }))).toMatchObject({
      it: 'il gatto è mangiato dal topo.',
    });
    expect(sayAll(clause(cat(bare), 'EAT', { directObject: np('MOUSE'), verbPhrase: { voice: 'passive' } }))).toMatchObject({
      it: 'il topo è mangiato da gatti.', es: 'el ratón es comido por gatos.', pt: 'o rato é comido por gatos.',
    });
  });

  test("a relative clause's own subject, a coordination, a question and the past take it too", () => {
    const seenBy = np('MOUSE', { relative: { headRole: 'directObject', subject: cat(bare), verbPhrase: { verb: 'SEE' } } });
    expect(subject(seenBy)).toMatchObject({
      en: 'the mouse that cats see runs.', it: 'il topo che i gatti vedono corre.', fr: 'la souris que les chats voient court.',
      de: 'die Maus, die Kater sehen, läuft.', es: 'el ratón que los gatos ven corre.', pt: 'o rato que os gatos veem corre.',
    });
    expect(subject({ conjuncts: [cat(bare), np('DOG', bare)], conjunction: 'and' })).toMatchObject({
      it: 'i gatti e i cani corrono.', fr: 'les chats et les chiens courent.', es: 'los gatos y los perros corren.', pt: 'os gatos e os cães correm.',
    });
    expect(sayAll(clause(cat(bare), 'RUN', { interrogative: true }))).toMatchObject({
      en: 'do cats run?', it: 'i gatti corrono?', de: 'laufen Kater?', es: '¿los gatos corren?', pt: 'os gatos correm?',
    });
    expect(sayAll(clause(cat(bare), 'RUN', { verbPhrase: { tense: 'past' } }))).toMatchObject({
      it: 'i gatti corsero.', es: 'los gatos corrieron.',
    });
  });

  test('a bare the plan did not pick keeps it: a numeral, a name, otro; and a verbless period is a label', () => {
    expect(subject(cat({ numeral: 2, definiteness: 'indefinite' }))).toMatchObject({
      it: 'due gatti corrono.', fr: 'deux chats courent.', es: 'dos gatos corren.', pt: 'dois gatos correm.',
    });
    expect(subject(np('PETER'))).toMatchObject({ it: 'Pietro corre.', fr: 'Pierre court.', es: 'Pedro corre.' });
    expect(subject(cat({ definiteness: 'indefinite', number: 'plural', adjectives: ['OTHER'] }))).toMatchObject({
      es: 'otros gatos corren.', pt: 'outros gatos correm.',
    });
    expect(sayAll({ subject: cat(bare) })).toMatchObject({ it: 'gatti.', fr: 'chats.', es: 'gatos.', pt: 'gatos.' });
  });
});

// A378. Italian writes an indefinite plural subject bare: "gatti corrono", "donne corrono". Like the
// bare plural of A376, a preverbal subject cannot go bare in Italian; the indefinite plural takes the
// partitive article, "dei gatti", "delle donne", as French takes des and Spanish / Portuguese unos /
// uns. An object may stay bare ("il gatto vede topi"). Found by the A376 lane, 2026-09-25.
describe('known bugs: Italian writes an indefinite plural subject bare (A378)', () => {
  const some = { definiteness: 'indefinite', number: 'plural' } as const;

  test('the indefinite plural subject takes dei / delle', () => {
    expect(subject(cat(some)).it).toBe('dei gatti corrono.'); // now: "gatti corrono."
    expect(subject(np('WOMAN', some)).it).toBe('delle donne corrono.'); // now: "donne corrono."
    expect(sayAll(clause(cat(some), 'RUN', { verbPhrase: { tense: 'past' } })).it).toBe('dei gatti corsero.'); // now: "gatti corsero."
  });

  test('degli before a vowel, each conjunct of a group, and the subject a passive or piacere makes', () => {
    expect(subject(np('FRIEND', some)).it).toBe('degli amici corrono.');
    expect(sayAll(clause({ conjuncts: [cat(some), np('WOMAN', some)], conjunction: 'and' }, 'RUN')).it).toBe('dei gatti e delle donne corrono.');
    expect(sayAll(clause(cat(), 'SEE', { directObject: np('MOUSE', some), verbPhrase: { voice: 'passive' } })).it).toBe('dei topi sono visti dal gatto.');
    expect(sayAll(clause(cat(), 'LIKE', { directObject: np('MOUSE', some) })).it).toBe('al gatto piacciono dei topi.');
  });

  test('regression: the experiencer’s dative stays bare, and a numeral keeps its own', () => {
    expect(sayAll(clause(cat(some), 'LIKE', { directObject: np('MOUSE') })).it).toBe('a gatti piace il topo.');
    expect(subject(cat({ ...some, numeral: 2 })).it).toBe('due gatti corrono.');
  });

  test('regression: the other Romance three, and an indefinite plural object', () => {
    expect(subject(cat(some))).toMatchObject({ fr: 'des chats courent.', es: 'unos gatos corren.', pt: 'uns gatos correm.' });
    expect(sayAll(clause(cat(), 'SEE', { directObject: np('MOUSE', some) })).it).toBe('il gatto vede topi.');
  });
});
