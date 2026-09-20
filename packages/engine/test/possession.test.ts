import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// A possessor is a full noun phrase in the genitive, and recursive. It is the one noun slot that
// is NOT a `NounElement`: it stays a plain `NounPhrase`, because "Peter and Paul's book" cannot
// say whether they own it jointly or one apiece — so there is nothing for the user to mean.
const bookOf = (possessor: NounPhrase) => sayAll(clause(np('BOOK', { possessor }), 'BURN'));

describe('possessor', () => {
  test('the genitive', () => {
    expect(bookOf(np('CAT'))).toMatchObject({
      en: "the cat's book burns.", // English inflects; Romance uses a preposition
      it: 'il libro del gatto brucia.',
      fr: 'le livre du chat brûle.',
      es: 'el libro del gato arde.',
      pt: 'o livro do gato arde.',
      ja: '猫の本は燃えます。',
    });
  });

  test('possessors nest', () => {
    expect(bookOf(np('FATHER', { possessor: np('CAT') }))).toMatchObject({
      en: "the cat's father's book burns.",
      it: 'il libro del padre del gatto brucia.',
      fr: 'le livre du père du chat brûle.',
      ja: '猫の父の本は燃えます。',
    });
  });
});

// A possessor is a noun phrase, and a noun phrase may carry a relative clause — so a possessor
// can be a whole subject-verb-object clause: "the book of the cat THAT EATS THE MOUSE".
//
// Romance is asserted throughout and English mostly is not: its Saxon genitive breaks outright
// on these (see the bugs at the foot of the file). German and Japanese are left out of most of
// them too, since their own relative-clause defects — the missing closing comma, the polite ます
// — would be baked in here; both are pinned in relative.test.ts instead.
describe('possessor as a full SVO phrase', () => {
  const eatsTheMouse = { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') } as const;

  test('the possessor carries a subject-gap relative clause', () => {
    expect(bookOf(np('CAT', { relative: eatsTheMouse }))).toMatchObject({
      it: 'il libro del gatto che mangia il topo brucia.',
      fr: 'le livre du chat qui mange la souris brûle.',
      es: 'el libro del gato que come el ratón arde.',
      pt: 'o livro do gato que come o rato arde.',
    });
  });

  test('the possessor carries an object-gap relative clause', () => {
    // "the book of the mouse THAT THE CAT EATS" — the possessor is the clause's object.
    expect(bookOf(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    }))).toMatchObject({
      it: 'il libro del topo che il gatto mangia brucia.',
      fr: 'le livre de la souris que le chat mange brûle.', // que, not qui — the object relativiser
      es: 'el libro del ratón que el gato come arde.',
    });
  });

  test('the possessor\'s clause carries its own tense', () => {
    expect(bookOf(np('CAT', {
      relative: { verbPhrase: { verb: 'EAT', tense: 'past' }, directObject: np('MOUSE') },
    }))).toMatchObject({
      it: 'il libro del gatto che mangiò il topo brucia.',
      fr: 'le livre du chat qui mangea la souris brûle.',
      es: 'el libro del gato que comió el ratón arde.',
    });
  });

  test('the possessor keeps its own number and adjectives, and its clause agrees with them', () => {
    // The possessor is plural, so the genitive article AND the clause's verb both follow it.
    expect(bookOf(np('CAT', {
      number: 'plural', adjectives: ['BIG'], relative: eatsTheMouse,
    }))).toMatchObject({
      it: 'il libro dei grandi gatti che mangiano il topo brucia.', // dei, mangiano
      fr: 'le livre des grands chats qui mangent la souris brûle.',
      es: 'el libro de los gatos grandes que comen el ratón arde.',
    });
  });

  test('the possessor\'s clause carries its own complements', () => {
    expect(bookOf(np('CAT', {
      relative: {
        verbPhrase: { verb: 'GIVE' },
        directObject: np('COIN'),
        complements: { terminus: { phrase: np('DOG') } },
      },
    }))).toMatchObject({
      it: 'il libro del gatto che dà la moneta al cane brucia.',
      fr: 'le livre du chat qui donne la pièce au chien brûle.',
      // German, whose relative clause is verb-final, orders dative before accusative inside it,
      // and brackets the whole clause in commas.
      de: 'das Buch vom Kater, der dem Hund die Münze gibt, brennt.',
    });
  });

  test('the head may have a relative clause of its own alongside the possessor', () => {
    // "the cat's book THAT THE DOG READS" — two clauses, two different heads.
    expect(bookOf(np('CAT'))).toMatchObject({ en: "the cat's book burns." });

    expect(sayAll(clause(np('BOOK', {
      possessor: np('CAT'),
      relative: { headRole: 'directObject', subject: np('DOG'), verbPhrase: { verb: 'READ' } },
    }), 'BURN'))).toMatchObject({
      // English is fine here — the possessor itself has no clause, so the genitive still works.
      en: "the cat's book that the dog reads burns.",
      it: 'il libro del gatto che il cane legge brucia.',
      es: 'el libro del gato que el perro lee arde.',
    });
  });

  test('an SVO possessor of an SVO possessor', () => {
    expect(bookOf(np('FATHER', {
      relative: { verbPhrase: { verb: 'READ' }, directObject: np('COIN') },
      possessor: np('CAT', { relative: eatsTheMouse }),
    }))).toMatchObject({
      it: 'il libro del padre del gatto che mangia il topo che legge la moneta brucia.',
      fr: 'le livre du père du chat qui mange la souris qui lit la pièce brûle.',
    });
  });

  test('an SVO possessor works in an object slot too', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('BOOK', { possessor: np('CAT', { relative: eatsTheMouse }) }),
    }))).toMatchObject({
      it: 'il cane vede il libro del gatto che mangia il topo.',
      fr: 'le chien voit le livre du chat qui mange la souris.',
      de: 'der Hund sieht das Buch vom Kater, der die Maus frisst.',
    });
  });
});

describe('known bugs: possessor', () => {
  const eatsTheMouse = { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') } as const;

  // English cannot form a Saxon genitive on a possessor that carries a relative clause. The 's is
  // a CLITIC: it attaches to the end of the whole possessor phrase, not to its head — so with a
  // clause in the way it lands on the last word of the clause:
  //
  //   plan:  book of [the cat that eats the mouse]
  //   got:   "the cat that eats THE MOUSE'S book"    ← the mouse now owns the book
  //   want:  "the book of the cat that eats the mouse"
  //
  // English resolves this by abandoning the Saxon genitive for the of-genitive whenever the
  // possessor is post-modified (the "group genitive" constraint). The engine now switches, so an
  // SVO possessor reads "the book OF the cat that eats the mouse" instead of a misattached clitic.
  test('English uses the of-genitive when the possessor carries a clause', () => {
    expect(bookOf(np('CAT', { relative: eatsTheMouse })))
      .toMatchObject({ en: 'the book of the cat that eats the mouse burns.' });
  });

  // The same plan with a clause that ends in a VERB rather than a noun: the of-genitive keeps the
  // clitic off the verb entirely (the old bug produced "the cat EATS'S book").
  test('English must never attach the genitive clitic to a verb ("eats\'s")', () => {
    expect(bookOf(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    })).en).not.toContain("eats's");
  });

  // And a PLURAL possessor: the plural apostrophe is no longer written onto whatever word ends the
  // clause (the old bug gave "the mouse' book", an apostrophe on a singular noun).
  test('English must not put the plural genitive apostrophe on the clause\'s last word', () => {
    expect(bookOf(np('CAT', { number: 'plural', adjectives: ['BIG'], relative: eatsTheMouse })).en)
      .not.toContain("mouse'");
  });

  // The positive forms the three guards above imply — an object-gap clause, and a plural possessor
  // with its own adjective — both come out as clean of-genitives.
  test('English of-genitive: an object-gap clause and a plural possessor', () => {
    expect(bookOf(np('MOUSE', {
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    })).en).toBe('the book of the mouse that the cat eats burns.');
    expect(bookOf(np('CAT', { number: 'plural', adjectives: ['BIG'], relative: eatsTheMouse })).en)
      .toBe('the book of the big cats that eat the mouse burns.');
  });

  // The of-genitive works wherever the possessed head sits, including a direct object.
  test('English of-genitive works in an object slot', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('BOOK', { possessor: np('CAT', { relative: eatsTheMouse }) }),
    })).en).toBe('the dog sees the book of the cat that eats the mouse.');
  });

  // The constraint propagates up a possessor chain: a possessor with no clause of its own but
  // whose OWN possessor carries one is still post-modified, so the whole chain uses "of".
  test('English of-genitive propagates up a nested possessor chain', () => {
    expect(sayAll(clause(np('BOOK', {
      possessor: np('FATHER', { possessor: np('CAT', { relative: eatsTheMouse }) }),
    }), 'BURN')).en).toBe('the book of the father of the cat that eats the mouse burns.');
  });

  // Regression: a plain nested possessor with no relative clause anywhere keeps the Saxon genitive.
  test('English keeps the Saxon genitive when no possessor is post-modified', () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('FATHER', { possessor: np('CAT') }) }), 'BURN')).en)
      .toBe("the cat's father's book burns.");
  });
});

// A58. The German von-possessor always takes the definite article (`defArticle`), whatever
// determiner the possessor carries. So an indefinite or quantified possessor turns definite, and a
// proper name gets an article it never takes. (The von + dative itself is the B09 simplification.)
describe('known bugs: German possessor determiner', () => {
  test('German keeps the possessor\'s own determiner after "von"', () => {
    expect(bookOf(np('CAT', { definiteness: 'indefinite' })).de).toBe('das Buch von einem Kater brennt.');
    expect(bookOf(np('CAT', { definiteness: 'some', number: 'plural' })).de).toBe('das Buch von einigen Katern brennt.');
    expect(bookOf(np('EUROPE')).de).toBe('das Buch von Europa brennt.');
  });

  test('German declines the possessor\'s determiner and adjectives for the dative after "von"', () => {
    expect(bookOf(np('CAT', { definiteness: 'no' })).de).toBe('das Buch von keinem Kater brennt.');
    expect(bookOf(np('CAT', { definiteness: 'that' })).de).toBe('das Buch von jenem Kater brennt.');
    expect(bookOf(np('WOMAN', { definiteness: 'this' })).de).toBe('das Buch von dieser Frau brennt.');
    expect(bookOf(np('CAT', { definiteness: 'all', number: 'plural' })).de).toBe('das Buch von allen Katern brennt.');
    expect(bookOf(np('CAT', { definiteness: 'indefinite', adjectives: ['SMALL'] })).de).toBe('das Buch von einem kleinen Kater brennt.');
    expect(bookOf(np('CAT', { definiteness: 'bare', number: 'plural', adjectives: ['SMALL'] })).de).toBe('das Buch von kleinen Katern brennt.');
    expect(bookOf(np('BOY', { definiteness: 'indefinite' })).de).toBe('das Buch von einem Jungen brennt.');
    expect(bookOf(np('CAT', { definiteness: 'indefinite', possessor: np('MAN', { definiteness: 'this' }) })).de)
      .toBe('das Buch von einem Kater von diesem Mann brennt.');
  });

  test('regression: only the definite article fuses to "vom", and an articled name keeps its article', () => {
    expect(bookOf(np('CAT')).de).toBe('das Buch vom Kater brennt.');
    expect(bookOf(np('ANTARCTICA')).de).toBe('das Buch von der Antarktis brennt.');
  });
});

// A58 (Italian). `renderNP` heads a genitive possessor with `prepArt('di', …)`, di + the definite
// article, and never reads the possessor's own determiner, so "un uomo" / "alcuni uomini" / "nessun
// uomo" all become "dell'uomo" / "degli uomini".
describe('known bugs: Italian possessor determiner', () => {
  test('Italian keeps the possessor\'s own determiner', () => {
    expect(say(clause(np('BOOK', { possessor: np('MAN', { definiteness: 'indefinite' }) }), 'BURN'), 'it')).toBe('il libro di un uomo brucia.');
    expect(say(clause(np('BOOK', { possessor: np('MAN', { definiteness: 'this' }) }), 'BURN'), 'it')).toBe("il libro di quest'uomo brucia.");
    expect(say(clause(np('BOOK', { possessor: np('MAN', { definiteness: 'some', number: 'plural' }) }), 'BURN'), 'it')).toBe('il libro di alcuni uomini brucia.');
    expect(say(clause(np('BOOK', { possessor: np('MAN', { definiteness: 'no' }) }), 'BURN'), 'it')).toBe('il libro di nessun uomo brucia.');
  });

  test('Italian keeps every other determiner, and the possessor\'s adjectives, after "di"', () => {
    const bookOfIt = (possessor: NounPhrase) => say(clause(np('BOOK', { possessor }), 'BURN'), 'it');
    expect(bookOfIt(np('CAT', { definiteness: 'that' }))).toBe('il libro di quel gatto brucia.');
    expect(bookOfIt(np('CAT', { definiteness: 'all', number: 'plural' }))).toBe('il libro di tutti i gatti brucia.');
    expect(bookOfIt(np('CAT', { definiteness: 'many', number: 'plural' }))).toBe('il libro di molti gatti brucia.');
    expect(bookOfIt(np('CAT', { definiteness: 'bare', number: 'plural', adjectives: ['SMALL'] }))).toBe('il libro di piccoli gatti brucia.');
    expect(bookOfIt(np('CAT', { definiteness: 'indefinite', possessor: np('MAN', { definiteness: 'this' }) }))).toBe("il libro di un gatto di quest'uomo brucia.");
  });

  test('regression: a definite possessor and a continent still fuse "di" with the article', () => {
    expect(say(clause(np('BOOK', { possessor: np('CAT') }), 'BURN'), 'it')).toBe('il libro del gatto brucia.');
    expect(say(clause(np('BOOK', { possessor: np('EUROPE') }), 'BURN'), 'it')).toBe("il libro dell'Europa brucia.");
  });
});

// A58 (French). `renderNP` heads a genitive possessor with `dePrep`, the definite "de" + article
// contraction, instead of `deDet`, so the possessor's own determiner is ignored and every
// possessor comes out definite ("du chat", "des chats").
describe('known bugs: French possessor determiner', () => {
  test('French keeps the possessor\'s own determiner', () => {
    const bookOf = (extra: Parameters<typeof np>[1]) =>
      sayAll(clause(np('BOOK', { possessor: np('CAT', extra) }), 'BURN')).fr;
    expect(bookOf({ definiteness: 'indefinite' })).toBe("le livre d'un chat brûle.");
    expect(bookOf({ definiteness: 'some', number: 'plural' })).toBe('le livre de quelques chats brûle.');
    expect(bookOf({ definiteness: 'this' })).toBe('le livre de ce chat brûle.');
    expect(bookOf({ definiteness: 'all', number: 'plural' })).toBe('le livre de tous les chats brûle.');
  });

  test('French keeps every other determiner after "de", dropping only the indefinite plural', () => {
    const bookOfFr = (concept: string, extra: Parameters<typeof np>[1]) =>
      sayAll(clause(np('BOOK', { possessor: np(concept, extra) }), 'BURN')).fr;
    expect(bookOfFr('MAN', { definiteness: 'no' })).toBe("le livre d'aucun homme brûle.");
    expect(bookOfFr('WOMAN', { definiteness: 'this' })).toBe('le livre de cette femme brûle.');
    expect(bookOfFr('CAT', { definiteness: 'many', number: 'plural' })).toBe('le livre de beaucoup de chats brûle.');
    expect(bookOfFr('CAT', { definiteness: 'bare', number: 'plural', adjectives: ['SMALL'] })).toBe('le livre de petits chats brûle.');
    expect(bookOfFr('CAT', { definiteness: 'indefinite', adjectives: ['SMALL'] })).toBe("le livre d'un petit chat brûle.");
  });

  test('regression: a definite possessor and a continent keep "du" / "de l\'"', () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('CAT') }), 'BURN')).fr).toBe('le livre du chat brûle.');
    expect(sayAll(clause(np('BOOK', { possessor: np('EUROPE') }), 'BURN')).fr).toBe("le livre de l'Europe brûle.");
  });
});

// A58 (Spanish). `possessorText` always builds "de" + the definite article (`dePrep`) and never
// reads the possessor's `definiteness`. An indefinite, quantified or demonstrative possessor comes
// out definite ("del hombre"). A bare proper name is already right ("de Europa").
describe('known bugs: Spanish possessor determiner', () => {
  test("Spanish keeps the possessor's own determiner", () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('MAN', { definiteness: 'indefinite' }) }), 'BURN')).es)
      .toBe('el libro de un hombre arde.');
    expect(sayAll(clause(np('BOOK', { possessor: np('MAN', { definiteness: 'some' }) }), 'BURN')).es)
      .toBe('el libro de algunos hombres arde.');
    expect(sayAll(clause(np('BOOK', { possessor: np('MAN', { definiteness: 'this' }) }), 'BURN')).es)
      .toBe('el libro de este hombre arde.');
  });

  test('Spanish keeps every other determiner, and the possessor\'s adjectives, after "de"', () => {
    const bookOfEs = (possessor: NounPhrase) => sayAll(clause(np('BOOK', { possessor }), 'BURN')).es;
    expect(bookOfEs(np('MAN', { definiteness: 'no' }))).toBe('el libro de ningún hombre arde.');
    expect(bookOfEs(np('CAT', { definiteness: 'that' }))).toBe('el libro de ese gato arde.');
    expect(bookOfEs(np('CAT', { definiteness: 'all', number: 'plural' }))).toBe('el libro de todos los gatos arde.');
    expect(bookOfEs(np('CAT', { definiteness: 'indefinite', adjectives: ['SMALL'] }))).toBe('el libro de un gato pequeño arde.');
    expect(bookOfEs(np('CAT', { definiteness: 'indefinite', possessor: np('MAN', { definiteness: 'this' }) }))).toBe('el libro de un gato de este hombre arde.');
  });

  test('regression: a definite possessor keeps "del", and a proper name stays bare', () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('CAT') }), 'BURN')).es).toBe('el libro del gato arde.');
    expect(sayAll(clause(np('BOOK', { possessor: np('EUROPE') }), 'BURN')).es).toBe('el libro de Europa arde.');
  });
});

// A58 (Portuguese). `possessorText` fuses "de" with the definite article (`dePrep`) whatever
// determiner the possessor carries, so an indefinite, demonstrative or quantified possessor turns
// definite.
describe('known bugs: Portuguese possessor determiner', () => {
  const bookOf = (possessor: ReturnType<typeof np>) => sayAll(clause(np('BOOK', { possessor }), 'BURN')).pt;

  test('Portuguese keeps the possessor\'s own determiner', () => {
    expect(bookOf(np('CAT', { definiteness: 'indefinite' }))).toBe('o livro de um gato arde.');
    expect(bookOf(np('CAT', { definiteness: 'this' }))).toBe('o livro deste gato arde.');
    expect(bookOf(np('CAT', { definiteness: 'some' }))).toBe('o livro de alguns gatos arde.');
  });

  test('Portuguese keeps every other determiner, fusing "de" with a demonstrative', () => {
    expect(bookOf(np('CAT', { definiteness: 'that' }))).toBe('o livro desse gato arde.');
    expect(bookOf(np('WOMAN', { definiteness: 'this' }))).toBe('o livro desta mulher arde.');
    expect(bookOf(np('MAN', { definiteness: 'no' }))).toBe('o livro de nenhum homem arde.');
    expect(bookOf(np('CAT', { definiteness: 'all', number: 'plural' }))).toBe('o livro de todos os gatos arde.');
    expect(bookOf(np('CAT', { definiteness: 'indefinite', adjectives: ['SMALL'] }))).toBe('o livro de um gato pequeno arde.');
    expect(bookOf(np('CAT', { definiteness: 'indefinite', possessor: np('MAN', { definiteness: 'this' }) }))).toBe('o livro de um gato deste homem arde.');
  });

  test('regression: a definite possessor and a continent keep "do" / "da"', () => {
    expect(bookOf(np('CAT'))).toBe('o livro do gato arde.');
    expect(bookOf(np('EUROPE'))).toBe('o livro da Europa arde.');
  });
});
