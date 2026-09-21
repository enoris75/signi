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
      de: 'das Buch des Katers, der dem Hund die Münze gibt, brennt.',
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
      de: 'der Hund sieht das Buch des Katers, der die Maus frisst.',
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

// A58. The German possessor always took the definite article (`defArticle`), whatever determiner
// the possessor carried. So an indefinite or quantified possessor turned definite, and a proper name
// got an article it never takes. Since B09 the possessor is a genitive, so these now pin the
// possessor's own determiner in the genitive, where they once pinned it after "von" + the dative.
describe('known bugs: German possessor determiner', () => {
  test('German keeps the possessor\'s own determiner', () => {
    expect(bookOf(np('CAT', { definiteness: 'indefinite' })).de).toBe('das Buch eines Katers brennt.');
    expect(bookOf(np('CAT', { definiteness: 'some', number: 'plural' })).de).toBe('das Buch einiger Kater brennt.');
    expect(bookOf(np('EUROPE')).de).toBe('das Buch Europas brennt.');
  });

  test('German declines the possessor\'s determiner and adjectives for the genitive', () => {
    expect(bookOf(np('CAT', { definiteness: 'no' })).de).toBe('das Buch keines Katers brennt.');
    expect(bookOf(np('CAT', { definiteness: 'that' })).de).toBe('das Buch jenes Katers brennt.');
    expect(bookOf(np('WOMAN', { definiteness: 'this' })).de).toBe('das Buch dieser Frau brennt.');
    expect(bookOf(np('CAT', { definiteness: 'all', number: 'plural' })).de).toBe('das Buch aller Kater brennt.');
    expect(bookOf(np('CAT', { definiteness: 'indefinite', adjectives: ['SMALL'] })).de).toBe('das Buch eines kleinen Katers brennt.');
    expect(bookOf(np('CAT', { definiteness: 'bare', number: 'plural', adjectives: ['SMALL'] })).de).toBe('das Buch kleiner Kater brennt.');
    expect(bookOf(np('BOY', { definiteness: 'indefinite' })).de).toBe('das Buch eines Jungen brennt.');
    expect(bookOf(np('CAT', { definiteness: 'indefinite', possessor: np('MAN', { definiteness: 'this' }) })).de)
      .toBe('das Buch eines Katers dieses Mannes brennt.');
  });

  test('regression: the definite article declines, and an articled name keeps its article', () => {
    expect(bookOf(np('CAT')).de).toBe('das Buch des Katers brennt.');
    expect(bookOf(np('ANTARCTICA')).de).toBe('das Buch der Antarktis brennt.');
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

// A165. A pronominal possessive fills the determiner slot, so it displaces a common noun's article
// ("ta maison", "en mi casa") — and a proper place name's too: the article a name takes as a name is
// only its default determiner. The proper-noun branches run before the possessive is consulted, so
// the two stack (French "la ton Asie", Spanish "la mi Antártida", German "in der meiner Antarktis"),
// and Italian/French keep a bare continent's article-less "in" / "en" in front of it ("in tua Asia").
// Fixed: `possessedHeadForms` drops `proper` from a possessed head, and the bare continent
// prepositions fire only for a name that is still `proper`.
describe('known bugs: a possessive on a place name', () => {
  const your = { kind: 'pronominal', person: '2', number: 'singular', gender: 'masc' } as const;
  const my = { kind: 'pronominal', person: '1', number: 'singular', gender: 'masc' } as const;
  const our = { kind: 'pronominal', person: '1', number: 'plural', gender: 'masc' } as const;
  const yourAsia = np('ASIA', { possessor: your });
  const myAntarctica = np('ANTARCTICA', { possessor: my });
  const runsIn = (place: NounPhrase) => sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: place } } }));
  const goesTo = (place: NounPhrase) => sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: place } } }));
  const comesFrom = (place: NounPhrase) => sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: place } } }));

  test('French drops the name\'s article for the possessive, in every position', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: yourAsia })).fr).toBe('le chat voit ton Asie.'); // now: "la ton Asie"
    expect(sayAll(clause(np('EUROPE', { possessor: our }), 'BURN')).fr).toBe('notre Europe brûle.');
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: yourAsia } },
    })).fr).toBe('le chat donne le livre à ton Asie.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: yourAsia } } })).fr)
      .toBe('le chat court à cause de ton Asie.');
    expect(bookOf(yourAsia).fr).toBe('le livre de ton Asie brûle.');
    expect(comesFrom(myAntarctica).fr).toBe('le chat vient de mon Antarctique.'); // now: "du mon"
  });

  // The goal keeps the continent's own "in" / "en", with the article the possessive now needs. The
  // common-place goal ("alla tua Asia", "à ton Asie") is the alternative — a decision for the fixer.
  test('Italian and French take the article-bearing "in" once a possessive leads a continent', () => {
    expect(runsIn(yourAsia)).toMatchObject({
      it: 'il gatto corre nella tua Asia.', // now: "in tua Asia"
      fr: 'le chat court dans ton Asie.', // now: "en ton Asie"
    });
    expect(goesTo(yourAsia)).toMatchObject({
      it: 'il gatto va nella tua Asia.',
      fr: 'le chat va dans ton Asie.',
    });
  });

  test('Spanish and German drop an articled name\'s article for the possessive', () => {
    expect(runsIn(myAntarctica)).toMatchObject({
      es: 'el gato corre en mi Antártida.', // now: "en la mi Antártida"
      de: 'der Kater läuft in meiner Antarktis.', // now: "in der meiner Antarktis"
    });
    expect(comesFrom(myAntarctica)).toMatchObject({
      es: 'el gato viene de mi Antártida.',
      de: 'der Kater kommt aus meiner Antarktis.',
    });
  });

  // The articled name in the positions around the pinned ones, a masculine continent's goal and
  // source, a plural possessor, and a possessed name as a possessor itself.
  test('the possessive displaces the name\'s article in the subject, object, goal and possessor', () => {
    expect(sayAll(clause(np('ANTARCTICA', { possessor: my }), 'BURN'))).toMatchObject({
      fr: 'mon Antarctique brûle.', es: 'mi Antártida arde.', de: 'meine Antarktis brennt.',
      it: 'la mia Antartide brucia.', pt: 'a minha Antártida arde.',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: myAntarctica }))).toMatchObject({
      fr: 'le chat voit mon Antarctique.', es: 'el gato ve mi Antártida.',
    });
    expect(goesTo(myAntarctica)).toMatchObject({
      it: 'il gatto va nella mia Antartide.', fr: 'le chat va dans mon Antarctique.',
      es: 'el gato va a mi Antártida.', pt: 'o gato vai à minha Antártida.', de: 'der Kater geht zu meiner Antarktis.',
    });
    expect(comesFrom(np('EUROPE', { possessor: your }))).toMatchObject({
      it: 'il gatto viene dalla tua Europa.', fr: 'le chat vient de ton Europe.', es: 'el gato viene de tu Europa.',
    });
    expect(runsIn(np('ASIA', { possessor: { kind: 'pronominal', person: '3', number: 'plural', gender: 'masc' } }))).toMatchObject({
      it: 'il gatto corre nella loro Asia.', fr: 'le chat court dans leur Asie.', es: 'el gato corre en su Asia.',
    });
    expect(bookOf(myAntarctica)).toMatchObject({
      it: 'il libro della mia Antartide brucia.', fr: 'le livre de mon Antarctique brûle.',
      es: 'el libro de mi Antártida arde.', pt: 'o livro da minha Antártida arde.',
    });
  });

  // Regression: the languages and positions that already let the possessive have the slot, a name
  // without a possessive, and a common noun with one.
  test('the positions already right, a bare name, and a possessed common noun are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: yourAsia }))).toMatchObject({
      en: 'the cat sees your Asia.', it: 'il gatto vede la tua Asia.', es: 'el gato ve tu Asia.',
      pt: 'o gato vê a sua Ásia.', de: 'der Kater sieht dein Asien.', ja: '猫はあなたのアジアを見ます。',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: myAntarctica })).de).toBe('der Kater sieht meine Antarktis.');
    expect(runsIn(yourAsia)).toMatchObject({
      es: 'el gato corre en tu Asia.', pt: 'o gato corre na sua Ásia.', de: 'der Kater läuft in deinem Asien.',
    });
    expect(comesFrom(yourAsia)).toMatchObject({ it: 'il gatto viene dalla tua Asia.', fr: 'le chat vient de ton Asie.' });
    expect(runsIn(np('ASIA'))).toMatchObject({ it: 'il gatto corre in Asia.', fr: 'le chat court en Asie.' });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('ASIA') })).fr).toBe("le chat voit l'Asie.");
    expect(sayAll(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('HOUSE', { possessor: your }) } } })))
      .toMatchObject({ it: 'il gatto mangia nella tua casa.', fr: 'le chat mange dans ta maison.' });
  });
});

// B09. Standard written German postposes a noun possessor in the genitive: its own determiner and
// adjectives declined for the genitive, a strong masculine/neuter noun with -(e)s, a weak one with
// -(e)n, a feminine or a plural with no ending. It falls back on "von" + the dative only where the
// genitive would not show: a determinerless plural or mass noun, or a name whose genitive is unmarked.
// The engine used to write the colloquial "von" + dative everywhere ("das Buch vom Kater").
describe('documented simplifications fixed: German genitive', () => {
  const de = (possessor: NounPhrase) => bookOf(possessor).de;

  test('a noun possessor is a postnominal genitive, in every gender and number', () => {
    expect(de(np('CAT'))).toBe('das Buch des Katers brennt.');
    expect(de(np('CAT', { gender: 'fem' }))).toBe('das Buch der Katze brennt.');
    expect(de(np('BOY'))).toBe('das Buch des Jungen brennt.'); // a weak noun: -n, not -s
    expect(de(np('DOG', { definiteness: 'indefinite' }))).toBe('das Buch eines Hundes brennt.');
    expect(de(np('CAT', { definiteness: 'no' }))).toBe('das Buch keines Katers brennt.');
    expect(de(np('DOG', { adjectives: ['BIG'] }))).toBe('das Buch des großen Hundes brennt.');
    expect(say(clause(np('BOOK', { number: 'plural', possessor: np('CAT', { gender: 'fem', number: 'plural' }) }), 'BURN'), 'de'))
      .toBe('die Bücher der Katzen brennen.');
  });

  test('the noun takes -es after a sibilant and on a monosyllable, -s on a longer word, or a recorded form', () => {
    expect(de(np('HOUSE'))).toBe('das Buch des Hauses brennt.');
    expect(de(np('SOUND'))).toBe('das Buch des Geräusches brennt.');
    expect(de(np('RESULT'))).toBe('das Buch des Ergebnisses brennt.'); // -nis doubles its s
    expect(de(np('ANGEL'))).toBe('das Buch des Engels brennt.');
    expect(de(np('FIRE'))).toBe('das Buch des Feuers brennt.');
    expect(de(np('NAME_NOUN'))).toBe('das Buch des Namens brennt.'); // weak, but -ns: seeded
    expect(de(np('SLOT_MACHINE'))).toBe('das Buch des Spielautomaten brennt.'); // weak: seeded
  });

  test('a name takes its -s bare, or the article it has; a nested possessor and a clause follow it', () => {
    expect(de(np('ASIA'))).toBe('das Buch Asiens brennt.');
    expect(de(np('ASIA', { adjectives: ['BIG'] }))).toBe('das Buch des großen Asiens brennt.');
    expect(de(np('ANTARCTICA'))).toBe('das Buch der Antarktis brennt.');
    expect(de(np('FATHER', { possessor: np('CAT') }))).toBe('das Buch des Vaters des Katers brennt.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOOK', { possessor: np('BOY', { adjectives: ['SMALL'] }) }) })).de)
      .toBe('der Kater sieht das Buch des kleinen Jungen.');
  });

  test('"von" + the dative where the genitive would not show', () => {
    expect(de(np('CAT', { gender: 'fem', definiteness: 'bare', number: 'plural' }))).toBe('das Buch von Katzen brennt.');
    expect(de(np('MAN', { definiteness: 'bare', number: 'plural' }))).toBe('das Buch von Männern brennt.');
    expect(de(np('WATER', { definiteness: 'some' }))).toBe('das Buch von etwas Wasser brennt.');
    expect(de(np('ENGLISH'))).toBe('das Buch von Englisch brennt.'); // a language's genitive is unmarked
    // An adjective shows it again, strong.
    expect(de(np('CAT', { gender: 'fem', definiteness: 'bare', number: 'plural', adjectives: ['SMALL'] })))
      .toBe('das Buch kleiner Katzen brennt.');
  });

  // Regression: the German dative "von" that is no possessor, and the other languages, are unchanged.
  test('the passive agent and a living source keep "von" + the dative', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { voice: 'passive' } })).de)
      .toBe('das Essen wird vom Kater gefressen.');
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('BOY') } } })).de)
      .toBe('der Kater kommt vom Jungen.');
    expect(bookOf(np('CAT'))).toMatchObject({ it: 'il libro del gatto brucia.', fr: 'le livre du chat brûle.' });
  });
});

// A174. A German possessive is an ein-word and declines like "kein": mixed endings in the singular,
// weak -en in the plural ("meine großen Kater", "meiner großen Hunde"). The builders decline a
// possessed phrase as `indefinite`, and an indefinite plural has no article, so the plural
// nominative, accusative and genitive come out strong ("meine große Kater").
describe('known bugs: German adjective after a plural possessive', () => {
  const my = { kind: 'pronominal', person: '1', number: 'singular', gender: 'masc' } as const;
  const her = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } as const;
  const bigMine = (concept: string, extra: Partial<NounPhrase> = {}) =>
    np(concept, { number: 'plural', adjectives: ['BIG'], possessor: my, ...extra });

  test.fails('the plural nominative and accusative take the weak -en', () => {
    expect(sayAll(clause(bigMine('CAT'), 'RUN')).de).toBe('meine großen Kater laufen.'); // now: "meine große Kater"
    expect(sayAll(clause(bigMine('CAT', { possessor: { ...my, number: 'plural' } }), 'RUN')).de).toBe('unsere großen Kater laufen.');
    expect(sayAll(clause(bigMine('CAT', { adjectives: ['BIG', 'BROWN'], possessor: her }), 'RUN')).de).toBe('ihre großen braunen Kater laufen.');
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: bigMine('CAT') })).de).toBe('der Hund sieht meine großen Kater.');
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { route: { phrase: bigMine('HOUSE') } } })).de)
      .toBe('der Hund läuft durch meine großen Häuser.');
    // The random phrase that found it (seed 942887). Only its opening is asserted: A175 changes its end.
    expect(sayAll({
      subject: np('FEELING', { number: 'plural', adjectives: ['DOMESTIC', 'BAD'], adjectiveDegrees: ['positive', 'least'], possessor: her }),
      verbPhrase: { verb: 'USE', aspect: 'resultative', negative: true },
      directObject: np('PERSON', {
        definiteness: 'that', adjectives: ['HUNGRY', 'LAZY'],
        relative: { verbPhrase: { verb: 'START' }, headRole: 'directObject', subject: np('ANIMAL', { definiteness: 'indefinite', adjectives: ['SMALL'], adjectiveDegrees: ['equally'] }) },
      }),
      complements: { manner: { phrase: np('PHRASE', { definiteness: 'bare', adjectives: ['HUNGRY'], adjectiveDegrees: ['least'] }) } },
    }).de).toMatch(/^ihre zahmen am wenigsten schlechten Gefühle haben /); // now: "ihre zahme am wenigsten schlechte"
  });

  test.fails('the plural genitive takes the weak -en', () => {
    expect(sayAll(clause(np('BOOK', { possessor: bigMine('DOG') }), 'BURN')).de).toBe('das Buch meiner großen Hunde brennt.'); // now: "großer"
    expect(sayAll(clause(np('DOG'), 'CRY', { complements: { cause: { phrase: bigMine('CAT') } } })).de)
      .toBe('der Hund weint wegen meiner großen Kater.');
  });

  // Regression: the singular, the dative plural, a mass noun and "kein" already decline right.
  test('the singular, the dative plural, a mass noun and "kein" are unchanged', () => {
    expect(sayAll(clause(np('CAT', { adjectives: ['BIG'], possessor: my }), 'RUN')).de).toBe('mein großer Kater läuft.');
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('CAT', { adjectives: ['BIG'], possessor: my }) })).de)
      .toBe('der Hund sieht meinen großen Kater.');
    expect(sayAll(clause(np('BOOK', { adjectives: ['BIG'], possessor: my }), 'BURN')).de).toBe('mein großes Buch brennt.');
    expect(sayAll(clause(np('BOOK', { possessor: np('CAT', { adjectives: ['BIG'], possessor: my }) }), 'BURN')).de)
      .toBe('das Buch meines großen Katers brennt.');
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { comitative: { phrase: bigMine('CAT') } } })).de)
      .toBe('der Hund läuft mit meinen großen Katern.');
    expect(sayAll(clause(np('DOG'), 'GO', { complements: { direction: { phrase: bigMine('HOUSE') } } })).de)
      .toBe('der Hund geht zu meinen großen Häusern.');
    expect(sayAll(clause(bigMine('CAT'), 'SEE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive' } })).de)
      .toBe('das Buch wird von meinen großen Katern gesehen.');
    expect(sayAll(clause(np('CAT'), 'DRINK', { directObject: np('WATER', { adjectives: ['COLD'], possessor: my }) })).de)
      .toBe('der Kater trinkt mein kaltes Wasser.');
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['BIG'], definiteness: 'no' }), 'RUN')).de).toBe('keine großen Kater laufen.');
  });
});
