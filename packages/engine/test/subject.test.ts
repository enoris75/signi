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
      it: 'i grandi vecchi gatti corrono.',
      fr: 'les grands vieux chats courent.',
      es: 'los gatos grandes y viejos corren.', // "y" between postnominal adjectives
      pt: 'os gatos grandes e velhos correm.',
      de: 'die großen alten Kater laufen.',
    });
  });

  test('plural AND feminine — everything agrees at once', () => {
    expect(subject(cat({ number: 'plural', gender: 'fem', adjectives: ['BIG', 'OLD'] })))
      .toMatchObject({
        it: 'le grandi vecchie gatte corrono.', // article, both adjectives, and the noun
        fr: 'les grandes vieilles chattes courent.',
        es: 'las gatas grandes y viejas corren.',
        de: 'die großen alten Katzen laufen.',
      });
  });

  test('plural with a determiner and an adjective', () => {
    expect(subject(cat({ number: 'plural', definiteness: 'indefinite', adjectives: ['BIG'] })))
      .toMatchObject({
        en: 'big cats run.', // English drops the article for an indefinite plural
        it: 'grandi gatti corrono.',
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
      it: 'un grande vecchio gatto corre.',
      fr: 'un grand vieux chat court.',
      es: 'un gato grande y viejo corre.',
      de: 'ein großer alter Kater läuft.', // mixed masc: -er on both adjectives
    });
  });

  test('feminine', () => {
    // gender:'fem' selects the feminine lexeme, and article, both adjectives and noun all agree.
    expect(subject(twoAdj({ gender: 'fem' }))).toMatchObject({
      it: 'una grande vecchia gatta corre.', // una … vecchia … gatta
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
      it: 'un grande vecchio libro corre.', // masc in Italian
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
      it: 'una grande vecchia casa corre.', // feminine (la casa)
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
    // French and German, which do not, keep the base form.
    expect(subject(np('PARENT', { gender: 'fem', number: 'plural' }))).toMatchObject({
      it: 'le genitrici corrono.',
      es: 'las progenitoras corren.',
      pt: 'as progenitoras correm.',
      fr: 'les parents courent.',
      de: 'die Elternteile laufen.',
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
    expect(neuter).toMatchObject({ de: 'ein großer alter Kater läuft.', it: 'un grande vecchio gatto corre.' });
  });
});
