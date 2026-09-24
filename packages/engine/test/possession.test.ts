import { describe, expect, test } from 'vitest';
import type { NounPhrase, VerbPhrase } from '@signi/shared';
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
// Fixed: the builders decline a possessed phrase as `no` (`possessedDeclension`), whose endings are
// the possessive's.
describe('known bugs: German adjective after a plural possessive', () => {
  const my = { kind: 'pronominal', person: '1', number: 'singular', gender: 'masc' } as const;
  const her = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } as const;
  const bigMine = (concept: string, extra: Partial<NounPhrase> = {}) =>
    np(concept, { number: 'plural', adjectives: ['BIG'], possessor: my, ...extra });

  test('the plural nominative and accusative take the weak -en', () => {
    expect(sayAll(clause(bigMine('CAT'), 'RUN')).de).toBe('meine großen Kater laufen.'); // now: "meine große Kater"
    expect(sayAll(clause(bigMine('CAT', { possessor: { ...my, number: 'plural' } }), 'RUN')).de).toBe('unsere großen Kater laufen.');
    expect(sayAll(clause(bigMine('CAT', { adjectives: ['BIG', 'BROWN'], possessor: her }), 'RUN')).de).toBe('ihre großen braunen Kater laufen.');
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: bigMine('CAT') })).de).toBe('der Hund sieht meine großen Kater.');
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { route: { phrase: bigMine('HOUSE') } } })).de)
      .toBe('der Hund läuft durch meine großen Häuser.');
    // The random phrase that found it (seed 942887). Its opening was asserted alone while A175 changed
    // its end; with both fixed, the whole sentence is right.
    const phrase = sayAll({
      subject: np('FEELING', { number: 'plural', adjectives: ['DOMESTIC', 'BAD'], adjectiveDegrees: ['positive', 'least'], possessor: her }),
      verbPhrase: { verb: 'USE', aspect: 'resultative', negative: true },
      directObject: np('PERSON', {
        definiteness: 'that', adjectives: ['HUNGRY', 'LAZY'],
        relative: { verbPhrase: { verb: 'START' }, headRole: 'directObject', subject: np('ANIMAL', { definiteness: 'indefinite', adjectives: ['SMALL'], adjectiveDegrees: ['equally'] }) },
      }),
      complements: { manner: { phrase: np('PHRASE', { definiteness: 'bare', adjectives: ['HUNGRY'], adjectiveDegrees: ['least'] }) } },
    }).de;
    expect(phrase).toMatch(/^ihre zahmen am wenigsten schlechten Gefühle haben /); // now: "ihre zahme am wenigsten schlechte"
    expect(phrase).toBe('ihre zahmen am wenigsten schlechten Gefühle haben jene hungrige faule Person, die ein gleich kleines Tier beginnt, nicht wie die am wenigsten hungrige Phrase verwendet.');
  });

  test('the plural genitive takes the weak -en', () => {
    expect(sayAll(clause(np('BOOK', { possessor: bigMine('DOG') }), 'BURN')).de).toBe('das Buch meiner großen Hunde brennt.'); // now: "großer"
    expect(sayAll(clause(np('DOG'), 'CRY', { complements: { cause: { phrase: bigMine('CAT') } } })).de)
      .toBe('der Hund weint wegen meiner großen Kater.');
  });

  // The plural in every gender, after every possessive, under every degree, and in the predicate
  // and the manner complement's nominative.
  test('the plural takes the weak -en in every gender, person, degree and nominative position', () => {
    const de = (subject: NounPhrase) => sayAll(clause(subject, 'RUN')).de;
    expect(de(bigMine('CAT', { gender: 'fem' }))).toBe('meine großen Katzen laufen.');
    expect(sayAll(clause(bigMine('HOUSE'), 'BURN')).de).toBe('meine großen Häuser brennen.');
    expect(sayAll(clause(bigMine('HOUSE', { possessor: { ...my, person: '2', number: 'plural' } }), 'BURN')).de)
      .toBe('eure großen Häuser brennen.');
    expect(de(bigMine('DOG', { possessor: { ...my, person: '3' } }))).toBe('seine großen Hunde laufen.');
    expect(de(bigMine('DOG', { possessor: { ...my, person: '3', number: 'plural' } }))).toBe('ihre großen Hunde laufen.');
    expect(de(bigMine('CAT', { adjectiveDegrees: ['more'] }))).toBe('meine größeren Kater laufen.');
    expect(de(bigMine('CAT', { adjectiveDegrees: ['most'] }))).toBe('meine größten Kater laufen.');
    expect(de(bigMine('CAT', { adjectiveDegrees: ['least'] }))).toBe('meine am wenigsten großen Kater laufen.');
    // A predicative's unchosen determiner is the indefinite, which keeps its slot beside the
    // possessive since A277 ("große Hunde von mir"), so the possessive's own declension is asked for
    // with the definite.
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'BE', { complements: { predicative: { phrase: bigMine('DOG', { definiteness: 'definite' }) } } })).de)
      .toBe('die Kater sind meine großen Hunde.');
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'BE', { complements: { predicative: { phrase: bigMine('DOG') } } })).de)
      .toBe('die Kater sind große Hunde von mir.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase: bigMine('DOG') } } })).de)
      .toBe('der Kater läuft wie meine großen Hunde.');
  });

  test('the plural genitive takes the weak -en in every gender and after two adjectives', () => {
    expect(sayAll(clause(np('BOOK', { possessor: bigMine('CAT', { gender: 'fem' }) }), 'BURN')).de)
      .toBe('das Buch meiner großen Katzen brennt.');
    expect(sayAll(clause(np('BOOK', { possessor: bigMine('DOG', { adjectives: ['BIG', 'BROWN'] }) }), 'BURN')).de)
      .toBe('das Buch meiner großen braunen Hunde brennt.');
    expect(sayAll(clause(np('DOG'), 'CRY', { complements: { cause: { phrase: bigMine('HOUSE') } } })).de)
      .toBe('der Hund weint wegen meiner großen Häuser.');
  });

  // Regression: the singular in the dative, the genitive and a complement's accusative, the dative
  // plural of a place, and the article-less indefinite plural, which keeps the strong endings.
  test('the singular in every case, a dative plural place and the indefinite plural are unchanged', () => {
    const my1 = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { adjectives: ['BIG'], possessor: my, ...extra });
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { comitative: { phrase: my1('CAT') } } })).de)
      .toBe('der Hund läuft mit meinem großen Kater.');
    expect(sayAll(clause(np('DOG'), 'CRY', { complements: { cause: { phrase: my1('CAT') } } })).de)
      .toBe('der Hund weint wegen meines großen Katers.');
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { locative: { phrase: my1('HOUSE') } } })).de)
      .toBe('der Hund läuft in meinem großen Haus.');
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { route: { phrase: my1('CAT', { gender: 'fem' }) } } })).de)
      .toBe('der Hund läuft durch meine große Katze.');
    expect(sayAll(clause(my1('CAT'), 'SEE', { directObject: np('BOOK'), verbPhrase: { voice: 'passive' } })).de)
      .toBe('das Buch wird von meinem großen Kater gesehen.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: np('WATER', { adjectives: ['COLD'], possessor: my }) } } })).de)
      .toBe('der Kater läuft mit meinem kalten Wasser.');
    expect(sayAll(clause(np('DOG'), 'RUN', { complements: { locative: { phrase: bigMine('HOUSE') } } })).de)
      .toBe('der Hund läuft in meinen großen Häusern.');
    expect(sayAll(clause(np('CAT', { number: 'plural', adjectives: ['BIG'], definiteness: 'indefinite' }), 'RUN')).de)
      .toBe('große Kater laufen.');
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

// A184. The Saxon genitive fills the determiner slot of the possessed head ("the cat's book"), so
// English drops whatever determiner the head carried: `this`, `some`, `many`, `few`, `all` and
// even `no` all read "the cat's book(s)". The clause loses its negation ("no book of the cat burns"
// → "the cat's book burns"). Every other language keeps the head's determiner, because its genitive
// follows the head ("nessun libro del gatto", "kein Buch des Katers"). English keeps it too once A21
// has moved a heavy possessor to the of-genitive ("this book of the cat that eats the mouse").
// Found by the random phrase "many happy adult tears' fires will want to have divided …" (seed
// 530537), where the head's `some` is gone.
describe('known bugs: English drops the possessed head\'s determiner', () => {
  const bookOf = (definiteness: NounPhrase['definiteness'], extra: Partial<NounPhrase> = {}) =>
    say(clause(np('BOOK', { definiteness, possessor: np('CAT'), ...extra }), 'BURN'), 'en');

  test('English keeps a demonstrative, a quantifier or `no` on the possessed head', () => {
    expect(bookOf('this')).toBe('this book of the cat burns.'); // now: "the cat's book burns."
    expect(bookOf('that')).toBe('that book of the cat burns.');
    expect(bookOf('some')).toBe('some books of the cat burn.'); // now: "the cat's books burn."
    expect(bookOf('many')).toBe('many books of the cat burn.');
    expect(bookOf('few')).toBe('few books of the cat burn.');
    expect(bookOf('no')).toBe('no book of the cat burns.'); // now: "the cat's book burns."
    expect(bookOf('all')).toBe("all the cat's books burn.");
    expect(bookOf('this', { adjectives: ['OLD'] })).toBe('this old book of the cat burns.');
    expect(say(clause(np('DOG'), 'SEE', { directObject: np('BOOK', { definiteness: 'no', possessor: np('CAT') }) }), 'en'))
      .toBe('the dog sees no book of the cat.');
    expect(say(clause(np('DOG'), 'SEE', { directObject: np('BOOK', { definiteness: 'many', possessor: np('CAT', { number: 'plural' }) }) }), 'en'))
      .toBe('the dog sees many books of the cats.');
    expect(say(clause(np('DOG'), 'RUN', {
      complements: { locative: { phrase: np('HOUSE', { definiteness: 'this', possessor: np('CAT') }) } },
    }), 'en')).toBe('the dog runs in this house of the cat.');
    // A possessor that itself goes to the of-genitive can no longer take "'s" (A21's constraint).
    expect(say(clause(np('BOOK', { possessor: np('FATHER', { definiteness: 'this', possessor: np('CAT') }) }), 'BURN'), 'en'))
      .toBe('the book of this father of the cat burns.'); // now: "the cat's father's book burns."
    // The random phrase's subject.
    expect(say(clause(np('FIRE', {
      definiteness: 'some', possessor: np('TEAR', { definiteness: 'many', adjectives: ['HAPPY', 'ADULT'] }),
    }), 'BURN'), 'en')).toBe('some fires of many happy adult tears burn.');
  });

  // Regression: the definite head keeps the Saxon genitive, the possessor keeps its own determiner,
  // a pronominal possessor and a post-modified one are unchanged, and the other languages already
  // keep the head's determiner.
  test('the definite head, the possessor\'s own determiner and the other languages are right', () => {
    expect(bookOf('definite')).toBe("the cat's book burns.");
    expect(say(clause(np('BOOK', { possessor: np('CAT', { definiteness: 'this' }) }), 'BURN'), 'en')).toBe("this cat's book burns.");
    expect(say(clause(np('BOOK', { possessor: np('FATHER', { possessor: np('CAT') }) }), 'BURN'), 'en')).toBe("the cat's father's book burns.");
    expect(say(clause(np('BOOK', {
      definiteness: 'this', possessor: np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') } }),
    }), 'BURN'), 'en')).toBe('this book of the cat that eats the mouse burns.');
    expect(sayAll(clause(np('BOOK', { definiteness: 'no', possessor: np('CAT') }), 'BURN'))).toMatchObject({
      it: 'nessun libro del gatto brucia.', de: 'kein Buch des Katers brennt.',
    });
  });

  // The fix generalises: the NPI `any` a negated clause switches a `no` object to, the mass
  // quantifiers, a plural head's demonstrative, and `all` stacking over a whole possessor chain.
  test('the NPI, the mass quantifiers, a plural head and `all` over a chain', () => {
    expect(say(clause(np('DOG', { definiteness: 'no' }), 'SEE', { directObject: np('BOOK', { definiteness: 'no', possessor: np('CAT') }) }), 'en'))
      .toBe('no dog sees any book of the cat.');
    expect(say(clause(np('WATER', { definiteness: 'many', possessor: np('CAT') }), 'BURN'), 'en')).toBe('much water of the cat burns.');
    expect(say(clause(np('WATER', { definiteness: 'few', possessor: np('CAT') }), 'BURN'), 'en')).toBe('little water of the cat burns.');
    expect(bookOf('this', { number: 'plural' })).toBe('these books of the cat burn.');
    expect(bookOf('all', { adjectives: ['OLD'] })).toBe("all the cat's old books burn.");
    expect(say(clause(np('BOOK', { definiteness: 'all', possessor: np('FATHER', { possessor: np('CAT') }) }), 'BURN'), 'en'))
      .toBe("all the cat's father's books burn.");
    // `all` still goes to the of-genitive when the possessor cannot take the clitic at all.
    expect(say(clause(np('BOOK', {
      definiteness: 'all', possessor: np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') } }),
    }), 'BURN'), 'en')).toBe('all books of the cat that eats the mouse burn.');
    // A possessor that kept its own determiner now ends in an of-phrase, so it loses the clitic too.
    expect(say(clause(np('BOOK', { possessor: np('FATHER', { definiteness: 'some', possessor: np('CAT') }) }), 'BURN'), 'en'))
      .toBe('the book of some fathers of the cat burns.');
  });

  // The heads the Saxon genitive keeps: `indefinite` and `bare`, a decision taken with
  // `en/nounPhrase.test.ts`'s "her big book", and a proper name, which has no article to lose.
  test('an indefinite, bare or proper head stays on the Saxon genitive', () => {
    expect(bookOf('indefinite')).toBe("the cat's book burns.");
    expect(bookOf('bare')).toBe("the cat's book burns.");
    expect(say(clause(np('EUROPE', { definiteness: 'this', possessor: np('CAT') }), 'BURN'), 'en')).toBe("the cat's Europe burns.");
  });
});

// A185. Japanese puts the possessed head's determiner in front of its possessor: "この猫の本" for
// "this book of the cat". A prenominal determiner modifies the nearest noun, so that reads "this
// cat's book", and a quantifier reads as the possessor's ("多くの猫の本", "many cats' books"). When the
// possessor has a determiner of its own, the two stack: "いくつかの多くの…涙の火". The head's determiner
// belongs after the possessor's の ("猫のこの本", "猫の多くの本", "猫のどの本も"). Found by the random
// phrase "many happy adult tears' fires will want to have divided …" (seed 530537): Japanese
// "いくつかの多くの幸せな大人の涙の火".
describe('known bugs: Japanese puts the head\'s determiner before its possessor', () => {
  const bookOf = (definiteness: NounPhrase['definiteness'], possessor: NounPhrase['possessor'] = np('CAT')) =>
    say(clause(np('BOOK', { definiteness, possessor }), 'BURN'), 'ja');
  const hers = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } as const;

  test('Japanese puts the head\'s determiner after the possessor', () => {
    expect(bookOf('this')).toBe('猫のこの本は燃えます。'); // now: この猫の本は燃えます。
    expect(bookOf('that')).toBe('猫のその本は燃えます。');
    expect(bookOf('some')).toBe('猫のいくつかの本は燃えます。');
    expect(bookOf('many')).toBe('猫の多くの本は燃えます。');
    expect(bookOf('all')).toBe('猫のすべての本は燃えます。');
    expect(bookOf('no')).toBe('猫のどの本も燃えません。'); // now: どの猫の本も燃えません。
    expect(bookOf('this', hers)).toBe('彼女のこの本は燃えます。'); // now: この彼女の本は燃えます。
    expect(say(clause(np('DOG'), 'SEE', { directObject: np('BOOK', { definiteness: 'no', possessor: np('CAT') }) }), 'ja'))
      .toBe('犬は猫のどの本も見ません。');
    expect(say(clause(np('DOG'), 'RUN', {
      complements: { locative: { phrase: np('HOUSE', { definiteness: 'this', possessor: np('CAT') }) } },
    }), 'ja')).toBe('犬は猫のこの家で走ります。');
    // The random phrase's subject.
    expect(say(clause(np('FIRE', {
      definiteness: 'some', possessor: np('TEAR', { definiteness: 'many', adjectives: ['HAPPY', 'ADULT'] }),
    }), 'BURN'), 'ja')).toBe('多くの幸せな大人の涙のいくつかの火は燃えます。'); // now: いくつかの多くの…
  });

  // Regression: the possessor's own determiner leads it, and a head with no possessor keeps its
  // determiner in front.
  test('the possessor\'s own determiner and a head without a possessor are right', () => {
    expect(bookOf('definite')).toBe('猫の本は燃えます。');
    expect(say(clause(np('BOOK', { possessor: np('CAT', { definiteness: 'this' }) }), 'BURN'), 'ja')).toBe('この猫の本は燃えます。');
    expect(say(clause(np('BOOK', { definiteness: 'this' }), 'BURN'), 'ja')).toBe('この本は燃えます。');
    expect(say(clause(np('BOOK', { definiteness: 'no' }), 'BURN'), 'ja')).toBe('どの本も燃えません。');
  });

  // The fix generalises: every determiner lands behind the possessor's の, in front of the
  // adjectives, at every depth of a possessor chain and in the object position too. `few` keeps its
  // 少しの — the quantifier-and-counter choice is a separate matter, not this defect.
  test('the determiner sits between the possessor and the adjectives, at every depth', () => {
    expect(bookOf('few')).toBe('猫の少しの本は燃えます。');
    expect(bookOf('indefinite')).toBe('猫の本は燃えます。'); // no prenominal word to place
    expect(say(clause(np('BOOK', { definiteness: 'this', possessor: np('CAT'), adjectives: ['OLD', 'BIG'] }), 'BURN'), 'ja'))
      .toBe('猫のこの古い大きい本は燃えます。');
    // A possessor with a determiner of its own keeps it in front of *its* head, not of the phrase.
    expect(say(clause(np('BOOK', { definiteness: 'this', possessor: np('FATHER', { definiteness: 'many', possessor: np('CAT') }) }), 'BURN'), 'ja'))
      .toBe('猫の多くの父のこの本は燃えます。');
    expect(bookOf('no', hers)).toBe('彼女のどの本も燃えません。');
    expect(say(clause(np('DOG'), 'SEE', { directObject: np('BOOK', { definiteness: 'all', possessor: np('CAT') }) }), 'ja'))
      .toBe('犬は猫のすべての本を見ます。');
  });
});

// A216. A `no` possessor is a negative word like any other: "la casa di nessun uomo" after the verb
// obliges the Romance preverbal negator, as "nessuna casa" does ("il gatto non vede la casa di nessun
// uomo"). Every negation check read a noun phrase's own determiner and never its possessor's, so the
// clause stayed positive; and Japanese closed the どの…も circumfix on the possessor itself, before its
// の, over a positive verb (猫はどの男もの家を見ます — the unhandled case npSegs named). The checks now
// walk the possessor chain too (`possessorIsNegative`). Found by the
// random phrase "does the hidden hot cow confine little big money through the fault of all no
// water's parents repeatedly?" (seed 942836): "rinchiude … per colpa di tutti i genitori di
// nessun'acqua?".
describe('known bugs: a `no` possessor does not negate its clause', () => {
  const noMansHouse = np('HOUSE', { possessor: np('MAN', { definiteness: 'no' }) });
  const sees = (object: NounPhrase, extra: Parameters<typeof clause>[2] = {}) => sayAll(clause(np('CAT'), 'SEE', { directObject: object, ...extra }));

  test('the Romance negator and the Japanese circumfix take in a `no` possessor', () => {
    expect(sees(noMansHouse)).toMatchObject({
      it: 'il gatto non vede la casa di nessun uomo.', fr: "le chat ne voit la maison d'aucun homme.",
      es: 'el gato no ve la casa de ningún hombre.', pt: 'o gato não vê a casa de nenhum homem.', ja: '猫はどの男の家も見ません。',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: noMansHouse } } }))).toMatchObject({
      it: 'il gatto non corre nella casa di nessun uomo.', fr: "le chat ne court dans la maison d'aucun homme.",
      es: 'el gato no corre en la casa de ningún hombre.', pt: 'o gato não corre na casa de nenhum homem.', ja: '猫はどの男の家でも走りません。',
    });
    // A possessor's possessor, a command and a relative clause.
    expect(sees(np('BOOK', { possessor: np('HOUSE', { possessor: np('MAN', { definiteness: 'no' }) }) }))).toMatchObject({
      it: 'il gatto non vede il libro della casa di nessun uomo.', es: 'el gato no ve el libro de la casa de ningún hombre.', ja: '猫はどの男の家の本も見ません。',
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: noMansHouse }), imperative: true })).toMatchObject({
      it: 'non vedere la casa di nessun uomo.', fr: "ne vois la maison d'aucun homme.",
      es: 'no veas la casa de ningún hombre.', pt: 'não veja a casa de nenhum homem.', ja: 'どの男の家も見るな。',
    });
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: noMansHouse } }), 'RUN'))).toMatchObject({
      it: 'il cane che non vede la casa di nessun uomo corre.', fr: "le chien qui ne voit la maison d'aucun homme court.",
      es: 'el perro que no ve la casa de ningún hombre corre.', pt: 'o cão que não vê a casa de nenhum homem corre.', ja: 'どの男の家も見ない犬は走ります。',
    });
    // Japanese on the subject, and French beside a negated verb, which "aucun" leaves without "pas".
    expect(say(clause(noMansHouse, 'BURN'), 'ja')).toBe('どの男の家も燃えません。');
    expect(sees(noMansHouse, { verbPhrase: { verb: 'SEE', negative: true } })).toMatchObject({
      fr: "le chat ne voit la maison d'aucun homme.", ja: '猫はどの男の家も見ません。',
    });
    // The random phrase that found it.
    expect(sayAll({
      subject: np('COW', { adjectives: ['HIDDEN', 'HOT'] }),
      verbPhrase: { verb: 'CONFINE', modifier: 'REPEATEDLY' },
      directObject: np('MONEY', { definiteness: 'few', adjectives: ['BIG'] }),
      complements: {
        cause: { phrase: np('PARENT', { definiteness: 'all', possessor: np('WATER', { definiteness: 'no' }) }), specifiers: [{ kind: 'sentiment', value: 'negative' }] },
      },
      interrogative: true,
    })).toMatchObject({
      it: "la mucca nascosta e calda non rinchiude ripetutamente poco grande denaro per colpa di tutti i genitori di nessun'acqua?",
      es: '¿la vaca oculta y caliente no encierra repetidamente poco dinero grande por culpa de todos los padres de ninguna agua?',
      pt: 'a vaca oculta e quente não encarcera repetidamente pouco dinheiro grande por culpa de todos os pais de nenhuma água?',
    });
  });

  test('regression: English and German need no concord, a comparison stays positive, and a `no` head already negates', () => {
    expect(sees(noMansHouse)).toMatchObject({ en: "the cat sees no man's house.", de: 'der Kater sieht das Haus keines Mannes.' });
    // A comparison licenses its own negative word (A181).
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase: noMansHouse } } }))).toMatchObject({
      it: 'il gatto corre come la casa di nessun uomo.', es: 'el gato corre como la casa de ningún hombre.',
    });
    expect(sees(np('HOUSE', { definiteness: 'no' }))).toMatchObject({
      it: 'il gatto non vede nessuna casa.', es: 'el gato no ve ninguna casa.', ja: '猫はどの家も見ません。',
    });
    // The possessor preverbal, in the subject, needs no negator (A58's own row).
    expect(say(clause(noMansHouse, 'BURN'), 'it')).toBe('la casa di nessun uomo brucia.');
  });

  test('the other tenses, moods and complements, and a clause already negated, take one negator', () => {
    expect(sees(noMansHouse, { verbPhrase: { verb: 'SEE', tense: 'past' } })).toMatchObject({
      it: 'il gatto non vide la casa di nessun uomo.', fr: "le chat ne vit la maison d'aucun homme.",
      es: 'el gato no vio la casa de ningún hombre.', pt: 'o gato não viu a casa de nenhum homem.', ja: '猫はどの男の家も見ませんでした。',
    });
    // A negated verb or NEVER already negates the clause: one negator, and Spanish and Portuguese keep
    // the preverbal "nunca" alone.
    expect(sees(noMansHouse, { verbPhrase: { verb: 'SEE', negative: true } })).toMatchObject({
      it: 'il gatto non vede la casa di nessun uomo.', es: 'el gato no ve la casa de ningún hombre.', pt: 'o gato não vê a casa de nenhum homem.',
    });
    expect(sees(noMansHouse, { verbPhrase: { verb: 'SEE', modifier: 'NEVER' } })).toMatchObject({
      it: 'il gatto non vede mai la casa di nessun uomo.', fr: "le chat ne voit jamais la maison d'aucun homme.",
      es: 'el gato nunca ve la casa de ningún hombre.', pt: 'o gato nunca vê a casa de nenhum homem.', ja: '猫はどの男の家も決して見ません。',
    });
    // Another complement: the も follows the particle in Japanese (どの男の市場へも).
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: np('MARKET', { possessor: np('MAN', { definiteness: 'no' }) }) } } }))).toMatchObject({
      it: 'il gatto non va al mercato di nessun uomo.', fr: "le chat ne va au marché d'aucun homme.",
      es: 'el gato no va al mercado de ningún hombre.', pt: 'o gato não vai ao mercado de nenhum homem.', ja: '猫はどの男の市場へも行きません。',
    });
    // The plural command, the instruction and the infinitive read the same gates (A208).
    expect(sayAll(clause(np('SECOND_PERSON', { number: 'plural' }), 'SEE', { directObject: noMansHouse, imperative: true }))).toMatchObject({
      it: 'non vedete la casa di nessun uomo.', fr: "ne voyez la maison d'aucun homme.",
      es: 'no veáis la casa de ningún hombre.', pt: 'não vejam a casa de nenhum homem.',
    });
    expect(sayAll(clause(np('SECOND_PERSON'), 'SEE', { directObject: noMansHouse, imperative: true, imperativeRegister: 'instruction' }))).toMatchObject({
      es: 'no ver la casa de ningún hombre.', pt: 'não ver a casa de nenhum homem.',
    });
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: noMansHouse, infinitive: true }))).toMatchObject({
      it: 'non vedere la casa di nessun uomo.', fr: "ne voir la maison d'aucun homme.",
      es: 'no ver la casa de ningún hombre.', pt: 'não ver a casa de nenhum homem.', ja: 'どの男の家も見ない。',
    });
    // A `no` head and a `no` possessor together: one circumfix each opens, one closes.
    expect(sees(np('HOUSE', { definiteness: 'no', possessor: np('MAN', { definiteness: 'no' }) }))).toMatchObject({
      it: 'il gatto non vede nessuna casa di nessun uomo.', es: 'el gato no ve ninguna casa de ningún hombre.', ja: '猫はどの男のどの家も見ません。',
    });
    // Japanese keeps counting a comparison, as it does for a `no` head (A181).
    expect(say(clause(np('CAT'), 'RUN', { complements: { manner: { phrase: noMansHouse } } }), 'ja')).toBe('猫はどの男の家のようにも走りません。');
  });
});

// A217. HAVE with an inanimate owner is the existential (A150): 家は壁があります, the thing possessed
// marked が. The existential verb follows what exists, which under HAVE is the thing possessed:
// ある for a thing, いる for a person or an animal (家には猫がいます). The engine kept ある whatever the
// possessed noun was, because the choice read the subject's animacy, and a possessive existential's
// owner is inanimate by definition; it now reads the object's. Found by the random phrase "the hot
// phrase has the cats again." (seed 942845): 熱いフレーズは猫がもう一度あります。
describe('known bugs: Japanese HAVE says an animate possession with ある', () => {
  const houseHas = (object: NounPhrase, verbPhrase: Partial<VerbPhrase> = {}) =>
    say(clause(np('HOUSE'), 'HAVE', { directObject: object, verbPhrase }), 'ja');

  test('a person or an animal is had with いる', () => {
    expect(houseHas(np('CAT'))).toBe('家は猫がいます。');
    expect(houseHas(np('CAT', { number: 'plural', definiteness: 'bare' }), { tense: 'past', negative: true })).toBe('家は猫がいませんでした。');
    expect(houseHas(np('PERSON', { definiteness: 'indefinite' }), { modals: ['MUST'] })).toBe('家は人がいる必要があります。');
    expect(say(clause(np('DOG'), 'RUN', { condition: clause(np('HOUSE'), 'HAVE', { directObject: np('CAT') }) }), 'ja'))
      .toBe('もし家に猫がいたら、犬は走ります。');
    expect(say(clause(np('CAT', { relative: { headRole: 'directObject', subject: np('HOUSE'), verbPhrase: { verb: 'HAVE' } } }), 'RUN'), 'ja'))
      .toBe('家にいる猫は走ります。');
    // The random phrase that found it.
    expect(say(clause(np('PHRASE', { adjectives: ['HOT'], adjectiveDegrees: ['positive'] }), 'HAVE', {
      directObject: np('CAT', { number: 'plural', definiteness: 'definite' }), verbPhrase: { modifier: 'AGAIN' },
    }), 'ja')).toBe('熱いフレーズは猫がもう一度います。');
  });

  test('regression: a thing is had with ある, an animate owner keeps 持つ, and BE already chooses', () => {
    expect(houseHas(np('WALL'))).toBe('家は壁があります。');
    expect(say(clause(np('CAT'), 'HAVE', { directObject: np('BOOK') }), 'ja')).toBe('猫は本を持っています。');
    expect(say(clause(np('CAT'), 'BE', { complements: { locative: { phrase: np('HOUSE') } } }), 'ja')).toBe('猫は家にいます。');
    expect(say(clause(np('HOUSE'), 'HAVE', { directObject: np('CAT') }), 'en')).toBe('the house has the cat.');
  });

  test('the thing possessed picks the verb wherever it stands, and BE still reads its subject', () => {
    // A pronoun, a quantified plural, a `no` object, a question and the resultative.
    expect(houseHas(np('FIRST_PERSON'))).toBe('家は私がいます。');
    expect(houseHas(np('PERSON', { number: 'plural', definiteness: 'many' }))).toBe('家は多くの人がいます。');
    expect(houseHas(np('CAT', { definiteness: 'no' }))).toBe('家はどの猫もいません。');
    expect(say({ ...clause(np('HOUSE'), 'HAVE', { directObject: np('DOG') }), interrogative: true }, 'ja')).toBe('家は犬がいますか？');
    expect(houseHas(np('CAT'), { aspect: 'resultative' })).toBe('家は猫がいました。');
    // A relative clause on the owner keeps its object in the clause; one on the thing possessed reads
    // the head, animate or not.
    expect(say(clause(np('HOUSE', { relative: { verbPhrase: { verb: 'HAVE' }, directObject: np('CAT') } }), 'BURN'), 'ja')).toBe('猫がいる家は燃えます。');
    expect(say(clause(np('HOUSE', { relative: { verbPhrase: { verb: 'HAVE' }, directObject: np('WALL') } }), 'BURN'), 'ja')).toBe('壁がある家は燃えます。');
    expect(say(clause(np('WALL', { relative: { headRole: 'directObject', subject: np('HOUSE'), verbPhrase: { verb: 'HAVE' } } }), 'BURN'), 'ja')).toBe('家にある壁は燃えます。');
    expect(say(clause(np('PERSON', { relative: { headRole: 'directObject', subject: np('HOUSE'), verbPhrase: { verb: 'HAVE', negative: true } } }), 'RUN'), 'ja'))
      .toBe('家にいない人は走ります。');
    // BE: an inanimate subject keeps ある.
    expect(say(clause(np('BOOK'), 'BE', { complements: { locative: { phrase: np('HOUSE') } } }), 'ja')).toBe('本は家にあります。');
  });
});

// A234. A pronominal possessive takes the article's place, and Spanish and Portuguese keep a head's
// own determiner beside it by moving the possessive behind the noun in its stressed form: "este libro
// mío", "ningún libro suyo" (A187). A possessor does not. `possessorText` forces its determiner bare
// before writing the prenominal possessive, so "of this book of mine" is "de mi libro", "of some
// books of mine" "de mis libros", and "of no book of his" "de su libro" — which, since A216, also
// negates the clause around it. Found fixing A216.
describe('known bugs: a Spanish or Portuguese possessor drops its own determiner beside a possessive (A234)', () => {
  const my = { kind: 'pronominal', person: '1', number: 'singular', gender: 'masc' } as const;
  const his = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } as const;
  const our = { kind: 'pronominal', person: '1', number: 'plural', gender: 'masc' } as const;
  const housesOf = (possessor: NounPhrase) => sayAll(clause(np('CAT'), 'SEE', { directObject: np('HOUSE', { possessor }) }));
  const esPt = (said: Record<string, string>) => ({ es: said['es'], pt: said['pt'] });

  test('the possessor keeps its determiner, and the possessive follows the noun', () => {
    expect(esPt(housesOf(np('BOOK', { definiteness: 'this', possessor: my })))).toEqual({
      es: 'el gato ve la casa de este libro mío.', pt: 'o gato vê a casa deste livro meu.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'some', number: 'plural', possessor: my })))).toEqual({
      es: 'el gato ve la casa de algunos libros míos.', pt: 'o gato vê a casa de alguns livros meus.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'no', possessor: his })))).toEqual({
      es: 'el gato no ve la casa de ningún libro suyo.', pt: 'o gato não vê a casa de nenhum livro seu.',
    });
    expect(esPt(sayAll(clause(np('CAT'), 'RUN', {
      complements: { locative: { phrase: np('HOUSE', { possessor: np('MAN', { definiteness: 'no', possessor: his }) }) } },
    })))).toEqual({
      es: 'el gato no corre en la casa de ningún hombre suyo.', pt: 'o gato não corre na casa de nenhum homem seu.',
    });
  });

  test('regression: the object (A187), a definite possessor, and the other five', () => {
    expect(esPt(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOOK', { definiteness: 'this', possessor: my }) })))).toEqual({
      es: 'el gato ve este libro mío.', pt: 'o gato vê este livro meu.',
    });
    expect(esPt(housesOf(np('BOOK', { possessor: my })))).toEqual({
      es: 'el gato ve la casa de mi libro.', pt: 'o gato vê a casa do meu livro.',
    });
    expect(housesOf(np('BOOK', { definiteness: 'this', possessor: my }))).toMatchObject({
      en: 'the cat sees the house of this book of mine.',
      it: 'il gatto vede la casa di questo mio libro.',
      fr: 'le chat voit la maison de ce livre à moi.',
      de: 'der Kater sieht das Haus dieses Buches von mir.',
      ja: '猫は私のこの本の家を見ます。',
    });
  });

  test('every kept determiner, either gender, and what the possessor carries after the noun', () => {
    expect(esPt(housesOf(np('BOOK', { definiteness: 'that', possessor: my })))).toEqual({
      es: 'el gato ve la casa de ese libro mío.', pt: 'o gato vê a casa desse livro meu.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'many', number: 'plural', possessor: our })))).toEqual({
      es: 'el gato ve la casa de muchos libros nuestros.', pt: 'o gato vê a casa de muitos livros nossos.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'few', number: 'plural', possessor: his })))).toEqual({
      es: 'el gato ve la casa de pocos libros suyos.', pt: 'o gato vê a casa de poucos livros seus.',
    });
    expect(esPt(housesOf(np('WOMAN', { definiteness: 'this', possessor: my })))).toEqual({
      es: 'el gato ve la casa de esta mujer mía.', pt: 'o gato vê a casa desta mulher minha.',
    });
    expect(esPt(housesOf(np('WOMAN', { definiteness: 'some', number: 'plural', possessor: our })))).toEqual({
      es: 'el gato ve la casa de algunas mujeres nuestras.', pt: 'o gato vê a casa de algumas mulheres nossas.',
    });
    // An adjective stands between the noun and the possessive, a relative clause after both, as in the
    // object; a possessor's possessor, a direction complement and the subject build it the same way.
    expect(esPt(housesOf(np('BOOK', { definiteness: 'this', possessor: my, adjectives: ['BIG'] })))).toEqual({
      es: 'el gato ve la casa de este libro grande mío.', pt: 'o gato vê a casa deste livro grande meu.',
    });
    expect(esPt(housesOf(np('MAN', { definiteness: 'this', possessor: my, relative: { headRole: 'subject', verbPhrase: { verb: 'RUN' } } })))).toEqual({
      es: 'el gato ve la casa de este hombre mío que corre.', pt: 'o gato vê a casa deste homem meu que corre.',
    });
    expect(esPt(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('HOUSE', { possessor: np('BOOK', { possessor: np('MAN', { definiteness: 'this', possessor: my }) }) }),
    })))).toEqual({
      es: 'el gato ve la casa del libro de este hombre mío.', pt: 'o gato vê a casa do livro deste homem meu.',
    });
    expect(esPt(sayAll(clause(np('CAT'), 'GO', {
      complements: { direction: { phrase: np('MARKET', { possessor: np('MAN', { definiteness: 'that', possessor: his }) }) } },
    })))).toEqual({
      es: 'el gato va al mercado de ese hombre suyo.', pt: 'o gato vai ao mercado desse homem seu.',
    });
    expect(esPt(sayAll(clause(np('HOUSE', { possessor: np('BOOK', { definiteness: 'this', possessor: my }) }), 'BURN')))).toEqual({
      es: 'la casa de este libro mío arde.', pt: 'a casa deste livro meu arde.',
    });
  });

  // A216: the `no` possessor negates the clause it stands in once, whatever else negates it, and not
  // at all where it is preverbal.
  test('a `no` possessor with a possessive negates its clause once', () => {
    const noBookOfHis = np('BOOK', { definiteness: 'no', possessor: his });
    expect(esPt(housesOf(np('WOMAN', { definiteness: 'no', possessor: our })))).toEqual({
      es: 'el gato no ve la casa de ninguna mujer nuestra.', pt: 'o gato não vê a casa de nenhuma mulher nossa.',
    });
    expect(esPt(sayAll(clause(np('CAT'), 'SEE', { directObject: np('HOUSE', { possessor: noBookOfHis }), verbPhrase: { negative: true } })))).toEqual({
      es: 'el gato no ve la casa de ningún libro suyo.', pt: 'o gato não vê a casa de nenhum livro seu.',
    });
    expect(esPt(sayAll(clause(np('CAT'), 'SEE', { directObject: np('HOUSE', { possessor: noBookOfHis }), verbPhrase: { modifier: 'NEVER' } })))).toEqual({
      es: 'el gato nunca ve la casa de ningún libro suyo.', pt: 'o gato nunca vê a casa de nenhum livro seu.',
    });
    expect(esPt(sayAll(clause(np('SECOND_PERSON'), 'SEE', { directObject: np('HOUSE', { possessor: noBookOfHis }), imperative: true })))).toEqual({
      es: 'no veas la casa de ningún libro suyo.', pt: 'não veja a casa de nenhum livro seu.',
    });
    expect(esPt(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('HOUSE', { possessor: noBookOfHis }), infinitive: true })))).toEqual({
      es: 'no ver la casa de ningún libro suyo.', pt: 'não ver a casa de nenhum livro seu.',
    });
    expect(esPt(sayAll(clause(np('HOUSE', { possessor: noBookOfHis }), 'BURN')))).toEqual({
      es: 'la casa de ningún libro suyo arde.', pt: 'a casa de nenhum livro seu arde.',
    });
  });

  // The indefinite keeps its article and takes the stressed possessive since A277, as the kept
  // determiners above do.
  test('regression: a possessive still replaces a bare possessor\'s determiner, and the other five say "no book of his"', () => {
    expect(esPt(housesOf(np('BOOK', { definiteness: 'indefinite', possessor: my })))).toEqual({
      es: 'el gato ve la casa de un libro mío.', pt: 'o gato vê a casa de um livro meu.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'bare', number: 'plural', possessor: my })))).toEqual({
      es: 'el gato ve la casa de mis libros.', pt: 'o gato vê a casa dos meus livros.',
    });
    expect(housesOf(np('BOOK', { definiteness: 'no', possessor: his }))).toMatchObject({
      en: 'the cat sees the house of no book of his.',
      it: 'il gatto non vede la casa di nessun suo libro.',
      fr: "le chat ne voit la maison d'aucun livre à lui.",
      de: 'der Kater sieht das Haus keines Buches von ihm.',
      ja: '猫は彼のどの本の家も見ません。',
    });
  });
});

// A237. A234 gave a Spanish or Portuguese possessor its own determiner back beside a possessive, for
// the determiners A187 keeps. `all` is not one of them — the object writes it ahead of the possessive,
// "todos mis libros", "todos os meus livros" — and the possessor still forces it away before writing
// the prenominal possessive: "of all my books" is "de mis libros", "dos meus livros". Found fixing A234.
describe('known bugs: a Spanish or Portuguese possessor drops "all" beside a possessive (A237)', () => {
  const my = { kind: 'pronominal', person: '1', number: 'singular', gender: 'masc' } as const;
  const his = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } as const;
  const housesOf = (possessor: NounPhrase) => sayAll(clause(np('CAT'), 'SEE', { directObject: np('HOUSE', { possessor }) }));
  const esPt = (said: Record<string, string>) => ({ es: said['es'], pt: said['pt'] });

  // Fixed: "all" joins the determiners the possessor hands to `npText`, the object's own builder,
  // which already writes "todos mis libros" / "todos os meus livros".
  test('the possessor keeps "all" ahead of the possessive, as the object does', () => {
    expect(esPt(housesOf(np('BOOK', { definiteness: 'all', number: 'plural', possessor: my })))).toEqual({
      es: 'el gato ve la casa de todos mis libros.', pt: 'o gato vê a casa de todos os meus livros.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'all', number: 'plural', possessor: his })))).toEqual({
      es: 'el gato ve la casa de todos sus libros.', pt: 'o gato vê a casa de todos os seus livros.',
    });
    expect(esPt(sayAll(clause(np('HOUSE', { possessor: np('BOOK', { definiteness: 'all', number: 'plural', possessor: my }) }), 'BURN')))).toEqual({
      es: 'la casa de todos mis libros arde.', pt: 'a casa de todos os meus livros arde.',
    });
  });

  test('the feminine, the 1st plural, and a possessor carrying its own adjective or relative', () => {
    expect(esPt(housesOf(np('HOUSE', { definiteness: 'all', number: 'plural', possessor: my })))).toEqual({
      es: 'el gato ve la casa de todas mis casas.', pt: 'o gato vê a casa de todas as minhas casas.',
    });
    const our = { kind: 'pronominal', person: '1', number: 'plural', gender: 'masc' } as const;
    expect(esPt(housesOf(np('BOOK', { definiteness: 'all', number: 'plural', possessor: our })))).toEqual({
      es: 'el gato ve la casa de todos nuestros libros.', pt: 'o gato vê a casa de todos os nossos livros.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'all', number: 'plural', possessor: my, adjectives: ['BIG'] })))).toEqual({
      es: 'el gato ve la casa de todos mis libros grandes.', pt: 'o gato vê a casa de todos os meus livros grandes.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'all', number: 'plural', possessor: my, relative: { verbPhrase: { verb: 'BURN' } } })))).toEqual({
      es: 'el gato ve la casa de todos mis libros que arden.', pt: 'o gato vê a casa de todos os meus livros que ardem.',
    });
  });

  test('regression: a plain possessive still fuses, and a detaching determiner still detaches', () => {
    expect(esPt(housesOf(np('BOOK', { number: 'plural', possessor: my })))).toEqual({
      es: 'el gato ve la casa de mis libros.', pt: 'o gato vê a casa dos meus livros.',
    });
    expect(esPt(housesOf(np('BOOK', { definiteness: 'this', number: 'plural', possessor: my })))).toEqual({
      es: 'el gato ve la casa de estos libros míos.', pt: 'o gato vê a casa destes livros meus.',
    });
  });

  test('regression: the object, a possessor without a possessive, and the other five', () => {
    expect(esPt(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOOK', { definiteness: 'all', number: 'plural', possessor: my }) })))).toEqual({
      es: 'el gato ve todos mis libros.', pt: 'o gato vê todos os meus livros.',
    });
    expect(esPt(bookOf(np('CAT', { definiteness: 'all', number: 'plural' })))).toEqual({
      es: 'el libro de todos los gatos arde.', pt: 'o livro de todos os gatos arde.',
    });
    expect(housesOf(np('BOOK', { definiteness: 'all', number: 'plural', possessor: my }))).toMatchObject({
      it: 'il gatto vede la casa di tutti i miei libri.',
      fr: 'le chat voit la maison de tous mes livres.',
      de: 'der Kater sieht das Haus aller meiner Bücher.',
      ja: '猫は私のすべての本の家を見ます。',
    });
  });
});

// A271. Italian writes a possessor after the noun and its adjectives, so behind a compared adjective
// it lands exactly where the standard goes — and Italian's standard is *di*: "un gatto più piccolo
// della donna" says *a cat smaller than the woman*, not *the woman's smaller cat*. The possessor
// ahead of the compared adjective takes the standard's slot away ("un gatto della donna più
// piccolo"), and the adjective's agreement ties it to its noun. Spanish, French and Portuguese mark
// the standard with *que* / *que* / *(do) que*, so their "de la mujer" is read as the possessor.
describe('known bugs: an Italian possessor behind a compared adjective reads as its standard (A271)', () => {
  const sees = (degree: 'more' | 'less' | 'equally', extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('MAN'), 'SEE', {
      directObject: np('CAT', { definiteness: 'indefinite', adjectives: ['SMALL'], adjectiveDegrees: [degree], possessor: np('WOMAN'), ...extra }),
    }));

  test('the possessor goes ahead of a compared adjective', () => {
    expect(sees('more').it).toBe("l'uomo vede un gatto della donna più piccolo.");
    expect(sees('less').it).toBe("l'uomo vede un gatto della donna meno piccolo.");
    expect(sees('more', { number: 'plural' }).it).toBe("l'uomo vede gatti della donna più piccoli.");
  });

  test('the equative, the definite article and a standard of its own follow the possessor too', () => {
    expect(sees('equally').it).toBe("l'uomo vede un gatto della donna ugualmente piccolo.");
    expect(sees('more', { definiteness: 'definite' }).it).toBe("l'uomo vede il gatto della donna più piccolo.");
    expect(sees('more', { adjectiveStandards: [np('DOG')] }).it).toBe("l'uomo vede un gatto della donna più piccolo del cane.");
    expect(sees('equally', { adjectiveStandards: [np('DOG')] }).it)
      .toBe("l'uomo vede un gatto della donna tanto piccolo quanto il cane.");
    expect(sees('more', { adjectives: ['SMALL', 'HAPPY'], adjectiveDegrees: ['more', 'positive'] }).it)
      .toBe("l'uomo vede un gatto della donna più piccolo e felice.");
  });

  test('regression: a superlative keeps the possessor behind it, and a pronominal one stays prenominal', () => {
    expect(sees('more', { adjectiveDegrees: ['most'], definiteness: 'definite' }).it).toBe("l'uomo vede il gatto più piccolo della donna.");
    expect(sees('more', { adjectiveDegrees: ['least'], definiteness: 'definite' }).it).toBe("l'uomo vede il gatto meno piccolo della donna.");
    // The indefinite keeps its article beside the possessive (A277).
    expect(sees('more', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } }).it)
      .toBe("l'uomo vede un suo gatto più piccolo.");
    expect(sees('more', { definiteness: 'definite', possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } }).it)
      .toBe("l'uomo vede il suo gatto più piccolo.");
  });

  test('regression: a positive adjective keeps its place, and the other Romance languages theirs', () => {
    expect(sees('more', { adjectiveDegrees: ['positive'] }).it).toBe("l'uomo vede un piccolo gatto della donna.");
    expect(sees('more')).toMatchObject({
      es: 'el hombre ve un gato más pequeño de la mujer.', pt: 'o homem vê um gato menor da mulher.',
      fr: "l'homme voit un chat plus petit de la femme.",
    });
  });
});

// A277. A possessive and an indefinite article compete for the determiner slot, and the possessive
// always won: `KEPT_BESIDE_POSSESSIVE` held the demonstratives and the quantifiers but not
// `indefinite`, so a plan that asked for "a friend of mine" rendered "my friend" — a definite phrase,
// the indefiniteness silently dropped in six languages. Each has a way to keep both, and the detached
// branch A187 built already writes it: "a friend of mine", "un ami à moi", "ein Freund von mir", "un
// amigo mío", "um amigo meu", and Italian stacks the possessive after the article, "un mio amico".
// Japanese has no article to lose. Found by P11 (P11-E4).
describe('known bugs: an indefinite possessed head reads as a definite one (A277)', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
  const friendRuns = (extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('FRIEND', { definiteness: 'indefinite', possessor: mine, ...extra }), 'RUN'));

  test('an indefinite keeps its article beside the possessive', () => {
    expect(friendRuns()).toEqual({
      en: 'a friend of mine runs.', // now: "my friend runs."
      it: 'un mio amico corre.', // now: "il mio amico corre."
      fr: 'un ami à moi court.', // now: "mon ami court."
      de: 'ein Freund von mir läuft.', // now: "mein Freund läuft."
      es: 'un amigo mío corre.', // now: "mi amigo corre."
      pt: 'um amigo meu corre.', // now: "o meu amigo corre."
      ja: '私の友達は走ります。',
    });
  });

  // The plural indefinite has no article in four of them, so the possessive detaches with nothing in
  // front: "friends of mine", "Freunde von mir". Italian cannot write a possessive with nothing before
  // it ("*miei amici corrono"), so an article-less indefinite keeps the definite article there, as
  // before. "some" is the set's older member and is unchanged.
  test('the plural, and "some" beside it', () => {
    expect(friendRuns({ number: 'plural' })).toEqual({
      en: 'friends of mine run.', it: 'i miei amici corrono.', fr: 'des amis à moi courent.',
      de: 'Freunde von mir laufen.', es: 'unos amigos míos corren.', pt: 'uns amigos meus correm.',
      ja: '私の友達は走ります。',
    });
    expect(friendRuns({ definiteness: 'some', number: 'plural' })).toEqual({
      en: 'some friends of mine run.', it: 'alcuni miei amici corrono.', fr: 'quelques amis à moi courent.',
      de: 'einige Freunde von mir laufen.', es: 'algunos amigos míos corren.', pt: 'alguns amigos meus correm.',
      ja: '私のいくつかの友達は走ります。',
    });
  });

  test('the other persons and genders, and an adjective', () => {
    const her = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } as const;
    expect(friendRuns({ gender: 'fem', possessor: her })).toMatchObject({
      en: 'a friend of hers runs.', it: 'una sua amica corre.', fr: 'une amie à elle court.',
      de: 'eine Freundin von ihr läuft.', es: 'una amiga suya corre.', pt: 'uma amiga sua corre.',
    });
    expect(sayAll(clause(np('HOUSE', { definiteness: 'indefinite', possessor: { kind: 'pronominal', person: '1', number: 'plural' } }), 'BURN'))).toMatchObject({
      en: 'a house of ours burns.', it: 'una nostra casa brucia.', fr: 'une maison à nous brûle.',
      de: 'ein Haus von uns brennt.', es: 'una casa nuestra arde.', pt: 'uma casa nossa arde.',
    });
    expect(friendRuns({ adjectives: ['OLD'] })).toMatchObject({
      en: 'an old friend of mine runs.', it: 'un mio vecchio amico corre.', fr: 'un vieil ami à moi court.',
      de: 'ein alter Freund von mir läuft.', es: 'un amigo viejo mío corre.', pt: 'um amigo velho meu corre.',
    });
  });

  // The object, the complements (German's own builder among them: A202's path), the dative, a
  // genitive possessor and an explicit predicate nominal.
  test('every slot keeps the indefinite', () => {
    const aFriend = np('FRIEND', { definiteness: 'indefinite', possessor: mine });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: aFriend }))).toMatchObject({
      en: 'the cat sees a friend of mine.', it: 'il gatto vede un mio amico.', fr: 'le chat voit un ami à moi.',
      de: 'der Kater sieht einen Freund von mir.', pt: 'o gato vê um amigo meu.', ja: '猫は私の友達を見ます。',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: aFriend } } }))).toMatchObject({
      en: 'the cat runs with a friend of mine.', it: 'il gatto corre con un mio amico.', fr: 'le chat court avec un ami à moi.',
      de: 'der Kater läuft mit einem Freund von mir.', es: 'el gato corre con un amigo mío.', pt: 'o gato corre com um amigo meu.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { definiteness: 'indefinite', possessor: mine }) } } }))).toMatchObject({
      it: 'il gatto corre in una mia casa.', fr: 'le chat court dans une maison à moi.',
      de: 'der Kater läuft in einem Haus von mir.', es: 'el gato corre en una casa mía.', pt: 'o gato corre em uma casa minha.',
    });
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: aFriend } } }))).toMatchObject({
      en: 'the cat gives the book to a friend of mine.', it: 'il gatto dà il libro a un mio amico.',
      fr: 'le chat donne le livre à un ami à moi.', de: 'der Kater gibt einem Freund von mir das Buch.',
      es: 'el gato da el libro a un amigo mío.', pt: 'o gato dá o livro a um amigo meu.',
    });
    expect(sayAll(clause(np('HOUSE', { possessor: aFriend }), 'BURN'))).toMatchObject({
      en: 'the house of a friend of mine burns.', it: 'la casa di un mio amico brucia.', fr: "la maison d'un ami à moi brûle.",
      de: 'das Haus eines Freundes von mir brennt.', es: 'la casa de un amigo mío arde.', pt: 'a casa de um amigo meu arde.',
    });
    expect(sayAll(clause(np('DOG'), 'BE', { complements: { predicative: { phrase: aFriend } } }))).toMatchObject({
      en: 'the dog is a friend of mine.', it: 'il cane è un mio amico.', fr: 'le chien est un ami à moi.',
      de: 'der Hund ist ein Freund von mir.', es: 'el perro es un amigo mío.', pt: 'o cão é um amigo meu.',
    });
    // German negates an indefinite with "kein", which keeps the detached possessive.
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: aFriend, verbPhrase: { verb: 'SEE', negative: true } })).de)
      .toBe('der Kater sieht keinen Freund von mir.');
  });

  // A mass indefinite writes a partitive in French, which elides into its noun, and no article in
  // Italian, which keeps the definite as the plural does.
  test('a mass noun', () => {
    expect(sayAll(clause(np('CAT'), 'DRINK', { directObject: np('WATER', { definiteness: 'indefinite', possessor: mine }) }))).toMatchObject({
      en: 'the cat drinks water of mine.', it: 'il gatto beve la mia acqua.', fr: "le chat boit de l'eau à moi.",
      de: 'der Kater trinkt Wasser von mir.',
    });
  });

  test('regression: the definite, the bare head and the kept determiners are unchanged', () => {
    const plain = {
      en: 'my friend runs.', it: 'il mio amico corre.', fr: 'mon ami court.', de: 'mein Freund läuft.',
      es: 'mi amigo corre.', pt: 'o meu amigo corre.', ja: '私の友達は走ります。',
    };
    expect(friendRuns({ definiteness: 'definite' })).toEqual(plain);
    expect(friendRuns({ definiteness: 'bare' })).toEqual(plain);
    expect(friendRuns({ definiteness: 'this' })).toMatchObject({
      en: 'this friend of mine runs.', it: 'questo mio amico corre.', fr: 'cet ami à moi court.',
      de: 'dieser Freund von mir läuft.', es: 'este amigo mío corre.', pt: 'este amigo meu corre.',
    });
    // A genitive possessor under an indefinite stays on the English clitic (A184's decision; the
    // double genitive "a friend of the cat's" is out of scope).
    expect(sayAll(clause(np('FRIEND', { definiteness: 'indefinite', possessor: np('CAT') }), 'RUN'))).toMatchObject({
      en: "the cat's friend runs.", de: 'ein Freund des Katers läuft.',
    });
  });
});

// A277's coverage, filled in: the persons and genders it did not reach, the clause shapes an
// indefinite possessed head can stand in, Italian kin nouns, the slots it left out, the coreferent
// possessor (P11-E2) and a demonstrative with a cardinal. All seven were right when this landed.
describe('an indefinite possessed head across persons, clauses and slots (A277)', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
  const ind = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'indefinite', ...extra });
  const runs = (subject: NounPhrase) => sayAll(clause(subject, 'RUN'));

  test('the other persons', () => {
    expect(runs(ind('FRIEND', { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }))).toEqual({
      en: 'a friend of yours runs.', it: 'un tuo amico corre.', fr: 'un ami à toi court.', de: 'ein Freund von dir läuft.',
      es: 'un amigo tuyo corre.', pt: 'um amigo seu corre.', ja: 'あなたの友達は走ります。',
    });
    expect(runs(ind('FRIEND', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }))).toEqual({
      en: 'a friend of his runs.', it: 'un suo amico corre.', fr: 'un ami à lui court.', de: 'ein Freund von ihm läuft.',
      es: 'un amigo suyo corre.', pt: 'um amigo seu corre.', ja: '彼の友達は走ります。',
    });
    expect(runs(ind('FRIEND', { possessor: { kind: 'pronominal', person: '2', number: 'plural' } }))).toEqual({
      en: 'a friend of yours runs.', it: 'un vostro amico corre.', fr: 'un ami à vous court.', de: 'ein Freund von euch läuft.',
      es: 'un amigo vuestro corre.', pt: 'um amigo seu corre.', ja: 'あなたたちの友達は走ります。',
    });
    expect(runs(ind('FRIEND', { possessor: { kind: 'pronominal', person: '3', number: 'plural' } }))).toEqual({
      en: 'a friend of theirs runs.', it: 'un loro amico corre.', fr: 'un ami à eux court.', de: 'ein Freund von ihnen läuft.',
      es: 'un amigo suyo corre.', pt: 'um amigo seu corre.', ja: '彼らの友達は走ります。',
    });
  });

  // The possessed head's gender and number agree on the article and the stressed possessive alike;
  // Italian's article-less plural keeps the definite (A277's design).
  test('a feminine plural head', () => {
    expect(runs(ind('FRIEND', { number: 'plural', gender: 'fem', possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } }))).toEqual({
      en: 'friends of hers run.', it: 'le sue amiche corrono.', fr: 'des amies à elle courent.', de: 'Freundinnen von ihr laufen.',
      es: 'unas amigas suyas corren.', pt: 'umas amigas suas correm.', ja: '彼女の友達は走ります。',
    });
  });

  test('the clause around it: negation, "no", a question, the past', () => {
    expect(sayAll(clause(ind('FRIEND', { possessor: mine }), 'RUN', { verbPhrase: { negative: true } }))).toEqual({
      en: 'a friend of mine does not run.', it: 'un mio amico non corre.', fr: 'un ami à moi ne court pas.',
      de: 'ein Freund von mir läuft nicht.', es: 'un amigo mío no corre.', pt: 'um amigo meu não corre.', ja: '私の友達は走りません。',
    });
    expect(runs(np('FRIEND', { definiteness: 'no', possessor: mine }))).toEqual({
      en: 'no friend of mine runs.', it: 'nessun mio amico corre.', fr: 'aucun ami à moi ne court.',
      de: 'kein Freund von mir läuft.', es: 'ningún amigo mío corre.', pt: 'nenhum amigo meu corre.', ja: '私のどの友達も走りません。',
    });
    expect(sayAll({ ...clause(ind('FRIEND', { possessor: mine }), 'RUN'), interrogative: true })).toEqual({
      en: 'does a friend of mine run?', it: 'un mio amico corre?', fr: "est-ce qu'un ami à moi court ?",
      de: 'läuft ein Freund von mir?', es: '¿un amigo mío corre?', pt: 'um amigo meu corre?', ja: '私の友達は走りますか？',
    });
    expect(sayAll(clause(ind('FRIEND', { possessor: mine }), 'RUN', { verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'a friend of mine ran.', it: 'un mio amico corse.', fr: 'un ami à moi courut.',
      de: 'ein Freund von mir lief.', es: 'un amigo mío corrió.', pt: 'um amigo meu correu.', ja: '私の友達は走りました。',
    });
  });

  // German closes the relative behind the detached "von mir", not between it and the noun.
  test('a relative on the head, the head inside a relative, and a content clause', () => {
    expect(runs(ind('FRIEND', { possessor: mine, relative: { verbPhrase: { verb: 'EAT' } } }))).toEqual({
      en: 'a friend of mine who eats runs.', it: 'un mio amico che mangia corre.', fr: 'un ami à moi qui mange court.',
      de: 'ein Freund von mir, der isst, läuft.', es: 'un amigo mío que come corre.', pt: 'um amigo meu que come corre.',
      ja: '食べる私の友達は走ります。',
    });
    expect(runs(np('CAT', { relative: { headRole: 'directObject', subject: ind('FRIEND', { possessor: mine }), verbPhrase: { verb: 'SEE' } } }))).toEqual({
      en: 'the cat that a friend of mine sees runs.', it: 'il gatto che un mio amico vede corre.',
      fr: "le chat qu'un ami à moi voit court.", de: 'der Kater, den ein Freund von mir sieht, läuft.',
      es: 'el gato que un amigo mío ve corre.', pt: 'o gato que um amigo meu vê corre.', ja: '私の友達が見る猫は走ります。',
    });
    expect(sayAll(clause(np('MAN'), 'SAY', { contentObject: { subject: ind('FRIEND', { possessor: mine }), verbPhrase: { verb: 'RUN' } } }))).toEqual({
      en: 'the man says that a friend of mine runs.', it: "l'uomo dice che un mio amico corre.",
      fr: "l'homme dit qu'un ami à moi court.", de: 'der Mann sagt, dass ein Freund von mir läuft.',
      es: 'el hombre dice que un amigo mío corre.', pt: 'o homem diz que um amigo meu corre.', ja: '男は私の友達が走ると言います。',
    });
  });

  // An Italian singular kin noun drops the article beside a possessive ("mio fratello"), but the
  // indefinite keeps it: "un mio fratello" is *a* brother of mine. Japanese leaves a first-person kin
  // possessor unsaid (P11-E1).
  test('Italian kin nouns keep the indefinite article', () => {
    expect(runs(ind('BROTHER', { possessor: mine }))).toEqual({
      en: 'a brother of mine runs.', it: 'un mio fratello corre.', fr: 'un frère à moi court.', de: 'ein Bruder von mir läuft.',
      es: 'un hermano mío corre.', pt: 'um irmão meu corre.', ja: '兄弟は走ります。',
    });
    expect(runs(np('BROTHER', { possessor: mine }))).toEqual({
      en: 'my brother runs.', it: 'mio fratello corre.', fr: 'mon frère court.', de: 'mein Bruder läuft.',
      es: 'mi hermano corre.', pt: 'o meu irmão corre.', ja: '兄弟は走ります。',
    });
    expect(runs(ind('SISTER', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } }))).toEqual({
      en: 'a sister of hers runs.', it: 'una sua sorella corre.', fr: 'une sœur à elle court.', de: 'eine Schwester von ihr läuft.',
      es: 'una hermana suya corre.', pt: 'uma irmã sua corre.', ja: '彼女の姉妹は走ります。',
    });
    expect(runs(ind('BROTHER', { possessor: mine, adjectives: ['OLD'] }))).toEqual({
      en: 'an old brother of mine runs.', it: 'un mio vecchio fratello corre.', fr: 'un vieux frère à moi court.',
      de: 'ein alter Bruder von mir läuft.', es: 'un hermano viejo mío corre.', pt: 'um irmão velho meu corre.', ja: '古い兄弟は走ります。',
    });
  });

  test('the slots A277 left out: a plural dative, the source, a Spanish mass object, a negated predicate', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: ind('FRIEND', { number: 'plural', possessor: mine }) } } }))).toEqual({
      en: 'the cat runs with friends of mine.', it: 'il gatto corre con i miei amici.', fr: 'le chat court avec des amis à moi.',
      de: 'der Kater läuft mit Freunden von mir.', es: 'el gato corre con unos amigos míos.', pt: 'o gato corre com uns amigos meus.',
      ja: '猫は私の友達と走ります。',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { source: { phrase: ind('HOUSE', { possessor: mine }) } } }))).toEqual({
      en: 'the cat runs from a house of mine.', it: 'il gatto corre via da una mia casa.', fr: "le chat court loin d'une maison à moi.",
      de: 'der Kater läuft aus einem Haus von mir.', es: 'el gato corre lejos de una casa mía.', pt: 'o gato corre longe de uma casa minha.',
      ja: '猫は私の家から走ります。',
    });
    expect(sayAll(clause(np('CAT'), 'DRINK', { directObject: ind('WATER', { possessor: mine }) }))).toEqual({
      en: 'the cat drinks water of mine.', it: 'il gatto beve la mia acqua.', fr: "le chat boit de l'eau à moi.",
      de: 'der Kater trinkt Wasser von mir.', es: 'el gato bebe agua mía.', pt: 'o gato bebe água minha.', ja: '猫は私の水を飲みます。',
    });
    expect(sayAll(clause(np('DOG'), 'BE', { verbPhrase: { negative: true }, complements: { predicative: { phrase: ind('FRIEND', { possessor: mine }) } } }))).toEqual({
      en: 'the dog is not a friend of mine.', it: 'il cane non è un mio amico.', fr: "le chien n'est pas un ami à moi.",
      de: 'der Hund ist kein Freund von mir.', es: 'el perro no es un amigo mío.', pt: 'o cão não é um amigo meu.',
      ja: '犬は私の友達ではありません。',
    });
  });

  // P11-E2's coreferent link detaches like a pronominal possessor, taking the subject's features.
  // Spanish is A325 (the personal "a"); English under a female subject is A293.
  test('a possessor linked to the subject', () => {
    const own = { kind: 'coreferent', slot: 'subject' } as const;
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: ind('FRIEND', { possessor: own }) }))).toMatchObject({
      en: 'the man sees a friend of his.', it: "l'uomo vede un suo amico.", fr: "l'homme voit un ami à lui.",
      de: 'der Mann sieht einen Freund von ihm.', pt: 'o homem vê um amigo seu.', ja: '男は自分の友達を見ます。',
    });
    expect(sayAll(clause(np('WOMAN'), 'SEE', { directObject: ind('FRIEND', { possessor: own }) }))).toMatchObject({
      it: 'la donna vede un suo amico.', fr: 'la femme voit un ami à elle.', de: 'die Frau sieht einen Freund von ihr.',
      pt: 'a mulher vê um amigo seu.', ja: '女は自分の友達を見ます。',
    });
  });

  // Italian puts the cardinal after the possessive, "questi miei due amici".
  test('a demonstrative with a cardinal', () => {
    expect(runs(np('FRIEND', { definiteness: 'this', numeral: 2, number: 'plural', possessor: mine }))).toEqual({
      en: 'these two friends of mine run.', it: 'questi miei due amici corrono.', fr: 'ces deux amis à moi courent.',
      de: 'diese zwei Freunde von mir laufen.', es: 'estos dos amigos míos corren.', pt: 'estes dois amigos meus correm.',
      ja: '私のこの二人の友達は走ります。',
    });
  });
});

// A325. The Spanish personal "a" builds a human object through `prepObjectText`, which puts the
// prenominal possessive in the determiner's place without asking whether the head keeps a
// determiner of its own. So every determiner a possessive detaches beside (A187, A277) is lost on a
// human object, and "todos" (A237) too: "ve a mi amigo" for a, this, some, no. A thing, which takes
// no "a", is right ("ve una casa mía"), and so is every complement, which has its own builder.
// A277's slot test left Spanish out of its object row, which is how this was missed.
describe('known bugs: the Spanish personal a drops the determiner beside a possessive (A325)', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
  const seesFriend = (extra: Partial<NounPhrase>, negative = false) => sayAll(clause(np('CAT'), 'SEE', {
    directObject: np('FRIEND', { possessor: mine, ...extra }), ...(negative ? { verbPhrase: { negative: true } } : {}),
  }));

  test.fails('the indefinite', () => {
    expect(seesFriend({ definiteness: 'indefinite' })).toEqual({
      en: 'the cat sees a friend of mine.', it: 'il gatto vede un mio amico.', fr: 'le chat voit un ami à moi.',
      de: 'der Kater sieht einen Freund von mir.',
      es: 'el gato ve a un amigo mío.', // now: "el gato ve a mi amigo."
      pt: 'o gato vê um amigo meu.', ja: '猫は私の友達を見ます。',
    });
  });

  test.fails('the plural indefinite', () => {
    expect(seesFriend({ definiteness: 'indefinite', number: 'plural' }).es).toBe('el gato ve a unos amigos míos.'); // now: "ve a mis amigos"
  });

  test.fails('"this"', () => {
    expect(seesFriend({ definiteness: 'this' }).es).toBe('el gato ve a este amigo mío.'); // now: "ve a mi amigo"
  });

  test.fails('"some"', () => {
    expect(seesFriend({ definiteness: 'some', number: 'plural' }).es).toBe('el gato ve a algunos amigos míos.'); // now: "ve a mis amigos"
  });

  test.fails('"no"', () => {
    expect(seesFriend({ definiteness: 'no' }).es).toBe('el gato no ve a ningún amigo mío.'); // now: "no ve a mi amigo"
  });

  test.fails('"all"', () => {
    expect(seesFriend({ definiteness: 'all', number: 'plural' }).es).toBe('el gato ve a todos mis amigos.'); // now: "ve a mis amigos"
  });

  test.fails('under a negation', () => {
    expect(seesFriend({ definiteness: 'indefinite' }, true).es).toBe('el gato no ve a un amigo mío.'); // now: "no ve a mi amigo"
  });

  test.fails('a possessor linked to the subject (P11-E2)', () => {
    expect(say(clause(np('MAN'), 'SEE', { directObject: np('FRIEND', { definiteness: 'indefinite', possessor: { kind: 'coreferent', slot: 'subject' } }) }), 'es'))
      .toBe('el hombre ve a un amigo suyo.'); // now: "el hombre ve a su amigo."
  });

  test('regression: a thing, the definite, the plain indefinite and the complements', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('HOUSE', { definiteness: 'indefinite', possessor: mine }) }), 'es'))
      .toBe('el gato ve una casa mía.');
    expect(seesFriend({}).es).toBe('el gato ve a mi amigo.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('FRIEND', { definiteness: 'indefinite' }) }), 'es')).toBe('el gato ve a un amigo.');
    const aFriend = np('FRIEND', { definiteness: 'indefinite', possessor: mine });
    expect(say(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: aFriend } } }), 'es')).toBe('el gato corre con un amigo mío.');
    expect(say(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('FRIEND', { definiteness: 'this', possessor: mine }) } } }), 'es'))
      .toBe('el gato da el libro a este amigo mío.');
  });
});

// A326. A plural or mass indefinite has no article after "de" in French ("la maison d'amis") and
// no genitive to show in German ("das Haus von Freunden"). Once A277 detached the possessive beside
// that indefinite, both lost it: French writes "de" in front of the kept "des" / "de l'" (the
// possessor, the source, the cause), and German, whose `genitiveShows` answers yes for any
// pronominal possessor, writes the genitive nothing marks ("das Haus Freunde von mir", "wegen
// Freunde von mir"). Without the possessive both are right, and so is a singular or "some".
describe('known bugs: a French or German plural indefinite possessor detaches into a broken phrase (A326)', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
  const friends = np('FRIEND', { definiteness: 'indefinite', number: 'plural', possessor: mine });
  const houseOf = (possessor: NounPhrase) => sayAll(clause(np('HOUSE', { possessor }), 'BURN'));

  test.fails('the possessor', () => {
    expect(houseOf(friends)).toEqual({
      en: 'the house of friends of mine burns.', it: 'la casa dei miei amici brucia.',
      fr: "la maison d'amis à moi brûle.", // now: "la maison de des amis à moi brûle."
      de: 'das Haus von Freunden von mir brennt.', // now: "das Haus Freunde von mir brennt."
      es: 'la casa de unos amigos míos arde.', pt: 'a casa de uns amigos meus arde.', ja: '私の友達の家は燃えます。',
    });
  });

  test.fails('a mass possessor', () => {
    expect(houseOf(np('WATER', { definiteness: 'indefinite', possessor: mine }))).toMatchObject({
      fr: "la maison d'eau à moi brûle.", // now: "la maison de de l'eau à moi brûle."
      de: 'das Haus von Wasser von mir brennt.', // now: "das Haus Wassers von mir brennt."
    });
  });

  test.fails('the French source', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { source: { phrase: np('HOUSE', { definiteness: 'indefinite', number: 'plural', possessor: mine }) } } }))).toEqual({
      en: 'the cat runs from houses of mine.', it: 'il gatto corre via dalle mie case.',
      fr: 'le chat court loin de maisons à moi.', // now: "loin de des maisons à moi"
      de: 'der Kater läuft aus Häusern von mir.', es: 'el gato corre lejos de unas casas mías.',
      pt: 'o gato corre longe de umas casas minhas.', ja: '猫は私の家から走ります。',
    });
  });

  test.fails('the cause', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: friends } } }))).toMatchObject({
      fr: "le chat court à cause d'amis à moi.", // now: "à cause de des amis à moi"
      de: 'der Kater läuft wegen Freunden von mir.', // now: "wegen Freunde von mir"
    });
  });

  test('regression: without the possessive, the singular and "some"', () => {
    expect(houseOf(np('FRIEND', { definiteness: 'indefinite', number: 'plural' }))).toMatchObject({
      fr: "la maison d'amis brûle.", de: 'das Haus von Freunden brennt.',
    });
    expect(houseOf(np('FRIEND', { definiteness: 'indefinite', possessor: mine }))).toMatchObject({
      fr: "la maison d'un ami à moi brûle.", de: 'das Haus eines Freundes von mir brennt.',
    });
    expect(houseOf(np('FRIEND', { definiteness: 'some', number: 'plural', possessor: mine }))).toMatchObject({
      fr: 'la maison de quelques amis à moi brûle.', de: 'das Haus einiger Freunde von mir brennt.',
    });
    expect(say(clause(np('CAT'), 'RUN', { complements: { source: { phrase: np('HOUSE', { definiteness: 'indefinite', number: 'plural' }) } } }), 'fr'))
      .toBe('le chat court loin de maisons.');
  });
});

// A327. A French negated direct object turns its indefinite or partitive article into "de" (`objectArtFor`:
// "ne voit pas d'ami"). A possessed object bypasses it (`objectNpText` sends it to `npText`), which was
// harmless while the possessive replaced the article; now that A277 keeps the indefinite beside it,
// the kept article escapes the negative "de": "ne voit pas un ami à moi". Italian "non vede un mio
// amico" is right, and so is every determiner that is not the indefinite.
describe('known bugs: a French negated object keeps un beside a detached possessive (A327)', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
  const notSee = (object: NounPhrase, verb = 'SEE') => sayAll(clause(np('CAT'), verb, { directObject: object, verbPhrase: { negative: true } }));

  // Spanish is left out: its "no ve a mi amigo" is A325's, and would tie the two fixes together.
  test.fails('the indefinite', () => {
    expect(notSee(np('FRIEND', { definiteness: 'indefinite', possessor: mine }))).toMatchObject({
      en: 'the cat does not see a friend of mine.', it: 'il gatto non vede un mio amico.',
      fr: "le chat ne voit pas d'ami à moi.", // now: "le chat ne voit pas un ami à moi."
      de: 'der Kater sieht keinen Freund von mir.', pt: 'o gato não vê um amigo meu.', ja: '猫は私の友達を見ません。',
    });
  });

  test.fails('a thing, the plural and a mass noun', () => {
    expect(notSee(np('HOUSE', { definiteness: 'indefinite', possessor: mine })).fr).toBe('le chat ne voit pas de maison à moi.'); // now: "pas une maison"
    expect(notSee(np('FRIEND', { definiteness: 'indefinite', number: 'plural', possessor: mine })).fr).toBe("le chat ne voit pas d'amis à moi."); // now: "pas des amis"
    expect(notSee(np('WATER', { definiteness: 'indefinite', possessor: mine }), 'DRINK').fr).toBe("le chat ne boit pas d'eau à moi."); // now: "pas de l'eau"
  });

  test('regression: without the possessive, the other determiners, the positive, and Italian', () => {
    expect(notSee(np('FRIEND', { definiteness: 'indefinite' })).fr).toBe("le chat ne voit pas d'ami.");
    expect(notSee(np('FRIEND', { possessor: mine })).fr).toBe('le chat ne voit pas mon ami.');
    expect(notSee(np('FRIEND', { definiteness: 'this', possessor: mine })).fr).toBe('le chat ne voit pas cet ami à moi.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('FRIEND', { definiteness: 'indefinite', possessor: mine }) }), 'fr'))
      .toBe('le chat voit un ami à moi.');
    expect(notSee(np('FRIEND', { definiteness: 'indefinite', possessor: mine })).it).toBe('il gatto non vede un mio amico.');
  });
});

// A328. OWN (`possessorOwn`, C37) is bound to the possessor, and English writes it after the possessive
// ("my own friend"). When the head keeps a determiner and the possessor detaches (A187, A277), OWN
// stays among the head's adjectives and lands behind the article: "an own friend of mine", "this own
// friend of mine" — the "an own cat" C37 set out to avoid. English says "a friend of my own". French
// "un propre ami à moi" and Spanish "un propio amigo mío" have the same shape; their targets are the
// fixer's decision (see the bug file), so only English is pinned.
describe('known bugs: OWN beside a kept determiner stays on the head (A328)', () => {
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
  const ownFriendRuns = (extra: Partial<NounPhrase>) =>
    say(clause(np('FRIEND', { possessor: mine, possessorOwn: true, ...extra }), 'RUN'), 'en');

  test.fails('the indefinite', () => {
    expect(ownFriendRuns({ definiteness: 'indefinite' })).toBe('a friend of my own runs.'); // now: "an own friend of mine runs."
  });

  test.fails('"this"', () => {
    expect(ownFriendRuns({ definiteness: 'this' })).toBe('this friend of my own runs.'); // now: "this own friend of mine runs."
  });

  test.fails('"no"', () => {
    expect(ownFriendRuns({ definiteness: 'no' })).toBe('no friend of my own runs.'); // now: "no own friend of mine runs."
  });

  test.fails('an adjective beside it', () => {
    expect(ownFriendRuns({ definiteness: 'indefinite', adjectives: ['OLD'] })).toBe('an old friend of my own runs.'); // now: "an own old friend of mine runs."
  });

  test.fails('the plural', () => {
    expect(say(clause(np('FRIEND', {
      definiteness: 'indefinite', number: 'plural', possessorOwn: true,
      possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' },
    }), 'RUN'), 'en')).toBe('friends of her own run.'); // now: "own friends of hers run."
  });

  test('regression: the definite, and Italian, which stacks OWN after the possessive', () => {
    expect(sayAll(clause(np('FRIEND', { possessor: mine, possessorOwn: true }), 'RUN'))).toEqual({
      en: 'my own friend runs.', it: 'il mio proprio amico corre.', fr: 'mon propre ami court.', de: 'mein eigener Freund läuft.',
      es: 'mi propio amigo corre.', pt: 'o meu próprio amigo corre.', ja: '自分の友達は走ります。',
    });
    expect(say(clause(np('FRIEND', { definiteness: 'indefinite', possessor: mine, possessorOwn: true }), 'RUN'), 'it')).toBe('un mio proprio amico corre.');
    expect(say(clause(np('FRIEND', { definiteness: 'this', possessor: mine, possessorOwn: true }), 'RUN'), 'it')).toBe('questo mio proprio amico corre.');
  });
});
