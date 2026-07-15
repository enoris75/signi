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
