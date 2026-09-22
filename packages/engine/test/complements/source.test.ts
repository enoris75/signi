import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// Where a motion started — the ablative. Seven verbs license it: the four motion verbs; LOAD and
// IMPORT, which are Signi's own vocabulary ("load the phrase FROM the container"); and BUY, whose
// source is where the thing was bought ("buys the book FROM the house").
const SOURCE_VERBS = ['RUN', 'JUMP', 'COME', 'GO', 'LOAD', 'IMPORT', 'BUY'];
const TRANSITIVE = new Set(['LOAD', 'IMPORT', 'BUY']);

const from = (verb: string, place: NounPhrase = np('HOUSE')) =>
  sayAll(clause(np('CAT'), verb, {
    ...(TRANSITIVE.has(verb) ? { directObject: np('BOOK') } : {}),
    complements: { source: { phrase: place } },
  }));

describe('source', () => {
  test('English, German and Japanese take a dedicated ablative adposition', () => {
    expect(from('COME')).toMatchObject({
      en: 'the cat comes from the house.',
      de: 'der Kater kommt aus dem Haus.', // aus, not von
      ja: '猫は家から来ます。', // から
    });
  });

  // The marking belongs to the complement, not the verb: every licensing verb marks its origin
  // the same way, and only the verb changes.
  test.each(SOURCE_VERBS)('%s marks its origin the same way', (verb) => {
    const said = from(verb);

    expect(said.en).toMatch(/ from the house\.$/);
    expect(said.de).toMatch(/ aus dem Haus\.$/);
    expect(said.ja).toMatch(/^猫は家から/);
    // Romance keeps the fused preposition at the end, behind its ablative adverb (see below).
    expect(said.it).toMatch(/ dalla casa\.$/);
    expect(said.fr).toMatch(/ de la maison\.$/);
    expect(said.es).toMatch(/ de la casa\.$/);
    expect(said.pt).toMatch(/ da casa\.$/);
  });

  test('the four motion verbs', () => {
    expect(from('RUN')).toMatchObject({
      en: 'the cat runs from the house.',
      de: 'der Kater läuft aus dem Haus.',
      ja: '猫は家から走ります。',
    });
    expect(from('JUMP')).toMatchObject({
      en: 'the cat jumps from the house.',
      de: 'der Kater springt aus dem Haus.',
    });
    expect(from('GO')).toMatchObject({
      en: 'the cat goes from the house.',
      de: 'der Kater geht aus dem Haus.',
    });
  });

  test('LOAD and IMPORT — the transitive pair, so the object renders too', () => {
    expect(from('LOAD')).toMatchObject({
      en: 'the cat loads the book from the house.',
      de: 'der Kater lädt das Buch aus dem Haus.',
      ja: '猫は家から本を読み込みます。',
    });

    expect(from('IMPORT')).toMatchObject({
      en: 'the cat imports the book from the house.',
      de: 'der Kater importiert das Buch aus dem Haus.',
      ja: '猫は家から本を取り込みます。',
    });

    // The app's real sentence: loading something out of a container.
    expect(from('LOAD', np('CONTAINER'))).toMatchObject({
      en: 'the cat loads the book from the container.',
      de: 'der Kater lädt das Buch aus dem Behälter.',
      ja: '猫は容器から本を読み込みます。',
    });
  });

  test('BUY — the source is where the thing was bought', () => {
    expect(from('BUY')).toMatchObject({
      en: 'the cat buys the book from the house.',
      it: 'il gatto compra il libro dalla casa.',
      fr: 'le chat achète le livre de la maison.',
      de: 'der Kater kauft das Buch aus dem Haus.',
      ja: '猫は家から本を買います。',
    });
  });
});

// Italian, French, Spanish and Portuguese in full. Each fuses its ablative preposition (da / de)
// with the article, and that machinery — the part these cases exist to test — is CORRECT.
//
// These use COME, a verb whose `source` is an origin, not a departure, so it renders bare "da"/"de"
// with NO ablative adverb (see the per-verb condition below, formerly a documented simplification).
// The contraction is the invariant under test: da+la→dalla, de+le→du, da+l'→dall', across gender,
// number, elision and the indefinite. The adverb belongs only to RUN/JUMP (asserted below).
describe('source: Romance', () => {
  test('the preposition fuses with a feminine singular article', () => {
    expect(from('COME')).toMatchObject({
      it: 'il gatto viene dalla casa.', // da + la = dalla
      fr: 'le chat vient de la maison.', // de la — no fusion in the feminine
      es: 'el gato viene de la casa.',
      pt: 'o gato vem da casa.', // de + a = da
    });
  });

  test('…with a masculine singular article', () => {
    expect(from('COME', np('MARKET'))).toMatchObject({
      it: 'il gatto viene dal mercato.', // da + il = dal
      fr: 'le chat vient du marché.', // de + le = du
      es: 'el gato viene del mercado.', // de + el = del
      pt: 'o gato vem do mercado.', // de + o = do
    });
  });

  test('…with a plural article, of each gender', () => {
    expect(from('COME', np('HOUSE', { number: 'plural' }))).toMatchObject({
      it: 'il gatto viene dalle case.', // da + le = dalle
      fr: 'le chat vient des maisons.', // de + les = des
      es: 'el gato viene de las casas.',
      pt: 'o gato vem das casas.', // de + as = das
    });

    expect(from('COME', np('MARKET', { number: 'plural' }))).toMatchObject({
      it: 'il gatto viene dai mercati.', // da + i = dai
      fr: 'le chat vient des marchés.',
      es: 'el gato viene de los mercados.',
      pt: 'o gato vem dos mercados.', // de + os = dos
    });
  });

  test('…and elides before a vowel', () => {
    // The angel is animate, so Italian adds the ablative "via" that keeps a source apart from the
    // andare-da goal (A153); the fusion behind it is what this pins.
    expect(from('COME', np('ANGEL'))).toMatchObject({
      it: "il gatto viene via dall'angelo.", // da + l' = dall'
      fr: "le chat vient de l'ange.",
      es: 'el gato viene del ángel.',
      pt: 'o gato vem do anjo.',
    });
    expect(from('COME', np('BUILDING'))).toMatchObject({
      it: "il gatto viene dall'edificio.", // a place, so no "via"
    });
  });

  test('an indefinite origin — nothing to fuse with', () => {
    expect(from('COME', np('HOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'il gatto viene da una casa.', // bare "da"
      fr: "le chat vient d'une maison.", // de + une → d'une
      es: 'el gato viene de una casa.',
      pt: 'o gato vem de uma casa.',
    });
  });
});

// Romance gates the ablative adverb ("via da", "loin de", "lejos de", "longe de") on the verb.
// It exists to keep source and direction apart on the shared preposition: "corro dal bambino" is
// motion TO the boy, so "corro via dal bambino" is what forces the AWAY reading. But only the
// self-propelled motion verbs (RUN/JUMP) need that disambiguation. On the other four it inverts
// the meaning, so they render bare "da"/"de":
//
//   COME    "il gatto viene dalla casa."            = comes from the house (not "AWAY from")
//   LOAD    "il gatto carica il libro dal contenitore." = loads the book from the container
//   IMPORT  "le chat importe le livre de la maison." = imports the book from the house
//
// LOAD and IMPORT are not motion-away verbs at all — their source is an origin, not a departure —
// and COME/GO read "da"/"de" as an origin unambiguously. See SOURCE_ABLATIVE_ADVERB_VERBS in
// types.ts and the per-verb `sourceAdverb` in the it / fr / es / pt engines. Was B01 / B01b.
describe('source: the ablative adverb is gated on the verb', () => {
  test('a non-departure verb (COME) renders bare "da"/"de", no adverb', () => {
    expect(from('COME')).toMatchObject({
      it: 'il gatto viene dalla casa.',
      fr: 'le chat vient de la maison.',
      es: 'el gato viene de la casa.',
      pt: 'o gato vem da casa.',
    });
  });

  test('GO likewise takes no ablative adverb', () => {
    expect(from('GO')).toMatchObject({
      it: 'il gatto va dalla casa.',
      fr: 'le chat va de la maison.',
      es: 'el gato va de la casa.',
      pt: 'o gato vai da casa.',
    });
  });

  test('the transitive LOAD is an origin, not a departure — no adverb', () => {
    expect(from('LOAD', np('CONTAINER'))).toMatchObject({
      it: 'il gatto carica il libro dal contenitore.',
      fr: 'le chat charge le livre du récipient.',
      es: 'el gato carga el libro del recipiente.',
      pt: 'o gato carrega o livro do recipiente.',
    });
  });

  test('IMPORT, the other transitive source verb, also drops the adverb', () => {
    expect(from('IMPORT', np('HOUSE'))).toMatchObject({
      it: 'il gatto importa il libro dalla casa.',
      fr: 'le chat importe le livre de la maison.',
      es: 'el gato importa el libro de la casa.',
      pt: 'o gato importa o livro da casa.',
    });
  });

  test('BUY is an origin, not a departure — bare "da"/"de", no adverb', () => {
    expect(from('BUY')).toMatchObject({
      it: 'il gatto compra il libro dalla casa.',
      fr: 'le chat achète le livre de la maison.',
      es: 'el gato compra el libro de la casa.',
      pt: 'o gato compra o livro da casa.',
    });
  });

  // The disambiguation that motivates the adverb in the first place: it MUST survive on the
  // self-propelled motion verbs, whose "da"/"de" would otherwise be read as a direction-toward goal.
  test('RUN keeps the adverb — the reading the whole mechanism exists to protect', () => {
    expect(from('RUN')).toMatchObject({
      it: 'il gatto corre via dalla casa.',
      fr: 'le chat court loin de la maison.',
      es: 'el gato corre lejos de la casa.',
      pt: 'o gato corre longe da casa.',
    });
  });

  test('JUMP keeps it too, and the article still fuses behind it', () => {
    expect(from('JUMP', np('MARKET'))).toMatchObject({
      it: 'il gatto salta via dal mercato.', // adverb + da + il = via dal
      fr: 'le chat saute loin du marché.', // loin + de + le = loin du
      es: 'el gato salta lejos del mercado.',
      pt: 'o gato pula longe do mercado.',
    });
  });
});

describe('known bugs: source', () => {
  // The same weak-masculine (n-declension) miss pinned in direction.test.ts and locative.test.ts:
  // it is a property of the NOUN, so every complement that puts "Junge" in an oblique case hits
  // it. The boy is a person, so his source preposition is "von" → "vom" (A154); the -n is what
  // this pins.
  test('German should decline the weak masculine: "vom Jungen"', () => {
    expect(from('COME', np('BOY'))).toMatchObject({ de: 'der Kater kommt vom Jungen.' });
  });
});

// A153. Italian marks an animate goal with "da" (the andare-da construction: "va dal ragazzo", pinned
// in direction.test.ts) and every source with "da" too. The ablative "via" that tells them apart is
// kept for RUN and JUMP only, so GO and COME say "to" where they mean "from": "va dal bambino" is
// both. A place is not affected ("va dalla casa" can only be an origin).
describe('known bugs: Italian animate source reads as a goal', () => {
  const fromChild = (verb: string) =>
    sayAll(clause(np('DOG'), verb, { complements: { source: { phrase: np('CHILD') } } })).it;

  test('GO and COME take "via da" from a person or an animal', () => {
    expect(fromChild('GO')).toBe('il cane va via dal bambino.');
    expect(fromChild('COME')).toBe('il cane viene via dal bambino.');
    expect(sayAll(clause(np('OX', { number: 'plural', definiteness: 'few', adjectives: ['GOOD'] }), 'GO', {
      verbPhrase: { modals: ['CAN'], negative: true },
      complements: { source: { phrase: np('ANGEL', { definiteness: 'that', adjectives: ['WHOLE', 'COLD'], adjectiveDegrees: ['less', 'positive'] }) } },
    })).it).toBe("pochi buoni buoi non possono andare via da quell'angelo meno intero e freddo.");
  });

  // The generalisation: the choice is per conjunct on the head's animacy, so it holds for an animal,
  // a plural and any determiner — and it reaches the relativizer, which is the one place the file
  // left undecided (an idiomatic Italian would say "da cui il cane va via"; unambiguous beats
  // idiomatic here, and nothing pinned it either way).
  test('…for an animal, a plural and an indefinite, and through the relativizer', () => {
    expect(fromChild('GO')).toBe('il cane va via dal bambino.');
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('DOG', { number: 'plural' }) } } })).it)
      .toBe('il gatto viene via dai cani.');
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { source: { phrase: np('CHILD', { definiteness: 'indefinite' }) } } })).it)
      .toBe('il gatto va via da un bambino.');
    expect(sayAll(clause(np('MAN', { relative: { headRole: 'source', subject: np('DOG'), verbPhrase: { verb: 'GO' } } }), 'RUN')).it)
      .toBe("l'uomo via dal quale il cane va corre.");
  });

  test('regression: RUN already takes "via", a place stays bare, and the goal keeps "da"', () => {
    expect(fromChild('RUN')).toBe('il cane corre via dal bambino.');
    expect(from('GO').it).toBe('il gatto va dalla casa.');
    expect(sayAll(clause(np('DOG'), 'GO', { complements: { direction: { phrase: np('CHILD') } } })).it)
      .toBe('il cane va dal bambino.');
  });
});

// A154. German marks every source with "aus", which is "out of" an enclosure: right for a house or a
// continent, wrong for a person or an animal ("geht aus dem Engel" is "goes out of the angel"). A
// living source takes "von", fused to "vom" before "dem".
describe('known bugs: German animate source takes "aus"', () => {
  test('German takes "von" from a person or an animal', () => {
    expect(from('COME', np('CHILD')).de).toBe('der Kater kommt vom Kind.');
    expect(from('COME', np('WOMAN')).de).toBe('der Kater kommt von der Frau.');
    expect(from('RUN', np('DOG', { number: 'plural' })).de).toBe('der Kater läuft von den Hunden.');
    expect(sayAll(clause(np('OX', { number: 'plural', definiteness: 'few', adjectives: ['GOOD'] }), 'GO', {
      verbPhrase: { modals: ['CAN'], negative: true },
      complements: { source: { phrase: np('ANGEL', { definiteness: 'that', adjectives: ['WHOLE', 'COLD'], adjectiveDegrees: ['less', 'positive'] }) } },
    })).de).toBe('wenige gute Ochsen können nicht von jenem weniger ganzen kalten Engel gehen.');
  });

  test('…and in a relative clause on the source', () => {
    expect(sayAll(clause(np('MAN', { relative: { headRole: 'source', subject: np('DOG'), verbPhrase: { verb: 'GO' } } }), 'RUN')).de)
      .toBe('der Mann, von dem der Hund geht, läuft.');
  });

  // The generalisation: "von" is chosen per conjunct on the head's animacy, and `prepDet` fuses it
  // only with the definite "dem" — every other determiner rides after the plain preposition.
  test('von fuses to vom only before "dem", and declines like any dative', () => {
    expect(from('COME', np('CHILD', { definiteness: 'indefinite' })).de).toBe('der Kater kommt von einem Kind.');
    expect(from('COME', np('CHILD', { definiteness: 'no' })).de).toBe('der Kater kommt von keinem Kind.');
    expect(from('COME', np('CHILD', { number: 'plural' })).de).toBe('der Kater kommt von den Kindern.');
    expect(from('COME', np('CHILD', { adjectives: ['SMALL'] })).de).toBe('der Kater kommt vom kleinen Kind.');
  });

  test('…and it holds for a transitive verb that licenses a source', () => {
    expect(sayAll(clause(np('CAT'), 'LOAD', {
      directObject: np('BOOK'), complements: { source: { phrase: np('CHILD') } },
    })).de).toBe('der Kater lädt das Buch vom Kind.');
  });

  test('regression: a place keeps "aus"', () => {
    expect(from('COME').de).toBe('der Kater kommt aus dem Haus.');
    expect(from('COME', np('AFRICA')).de).toBe('der Kater kommt aus Afrika.');
  });
});

// A89. A continent of origin takes bare "de" / "d'" in French ("vient d'Europe"), the source
// counterpart of the goal's bare "en" (A31). The `source` head in `complementsPhrase` sends the
// proper noun through `deDet` → `dePrep`, which keeps its fixed article ("de l'Europe").
describe('known bugs: French continent source', () => {
  test('French drops the article on a continent source', () => {
    const comeFrom = (source: string) =>
      sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np(source) } } })).fr;
    expect(comeFrom('EUROPE')).toBe("le chat vient d'Europe.");
    expect(comeFrom('AFRICA')).toBe("le chat vient d'Afrique.");
    expect(comeFrom('NORTH_AMERICA')).toBe("le chat vient d'Amérique du Nord.");
    expect(sayAll(clause(np('CAT'), 'COME', {
      complements: { source: { phrase: np('AFRICA') }, direction: { phrase: np('EUROPE') } },
    })).fr).toBe("le chat vient d'Afrique en Europe.");
  });

  test('French drops it on every feminine continent, in a group and after a transitive verb', () => {
    const comeFrom = (source: NonNullable<Parameters<typeof clause>[2]>['complements']) => sayAll(clause(np('CAT'), 'COME', { complements: source })).fr;
    expect(comeFrom({ source: { phrase: np('ASIA') } })).toBe("le chat vient d'Asie.");
    expect(comeFrom({ source: { phrase: { conjuncts: [np('EUROPE'), np('AFRICA')], conjunction: 'and' } } })).toBe("le chat vient d'Europe et d'Afrique.");
    expect(sayAll(clause(np('CAT'), 'IMPORT', { directObject: np('BOOK'), complements: { source: { phrase: np('EUROPE') } } })).fr)
      .toBe("le chat importe le livre d'Europe.");
  });

  test('French keeps the article on Antarctique, after loin and on any other noun', () => {
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('ANTARCTICA') } } })).fr).toBe("le chat vient de l'Antarctique.");
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { source: { phrase: np('EUROPE') } } })).fr).toBe("le chat court loin de l'Europe.");
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('HOUSE') } } })).fr).toBe('le chat vient de la maison.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: np('EUROPE') } } })).fr).toBe("le chat court à cause de l'Europe.");
  });
});

// A228. A153 gave an Italian animate source "via" on every verb, because an animate GOAL takes "da"
// too (the andare-da construction) and "va dal bambino" reads "goes to the boy". A verb that takes no
// goal has nothing for "da" to collide with. REMOVE licenses a source and no direction, so "via" only
// doubles "rimuovere" ("rimuove il libro via dal cane"), and in a relative on the source it lands in
// front of the relative pronoun, where Italian cannot have it: "un animale via dal quale si sono
// rimossi testicoli". Found authoring C24's relational adjectives.
describe('known bugs: an Italian animate source takes "via" under a verb with no goal (A228)', () => {
  const G = np('GENERIC_PERSON');
  const TESTICLES = np('TESTICLE', { definiteness: 'bare', number: 'plural' });
  const removedFrom = (head: NounPhrase, subject: NounPhrase, object: NounPhrase, aspect?: 'resultative') =>
    sayAll({ subject: { ...head, relative: { headRole: 'source', subject, verbPhrase: { verb: 'REMOVE', ...(aspect ? { aspect } : {}) }, directObject: object } } });

  test.fails('REMOVE takes its animate source with a bare "da"', () => {
    expect(removedFrom(np('ANIMAL', { definiteness: 'indefinite' }), G, TESTICLES, 'resultative').it)
      .toBe('un animale dal quale si sono rimossi testicoli.');
    expect(removedFrom(np('ANIMAL', { definiteness: 'indefinite' }), G, TESTICLES).it).toBe('un animale dal quale si rimuovono testicoli.');
    expect(removedFrom(np('DOG'), np('MAN'), np('BOOK')).it).toBe("il cane dal quale l'uomo rimuove il libro.");
    expect(sayAll(clause(np('MAN'), 'REMOVE', { directObject: np('BOOK'), complements: { source: { phrase: np('DOG') } } })).it)
      .toBe("l'uomo rimuove il libro dal cane.");
  });

  test('regression: a verb with a goal keeps "via", a place stays bare, and the other six', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { source: { phrase: np('DOG') } } })).it).toBe('il gatto corre via dal cane.');
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { source: { phrase: np('DOG') } } })).it).toBe('il gatto va via dal cane.');
    expect(removedFrom(np('HOUSE'), np('MAN'), np('BOOK')).it).toBe("la casa dalla quale l'uomo rimuove il libro.");
    expect(removedFrom(np('ANIMAL', { definiteness: 'indefinite' }), G, TESTICLES, 'resultative')).toMatchObject({
      en: 'an animal from which one has removed testicles.',
      de: 'ein Tier, von dem man Hoden entfernt hat.',
      es: 'un animal del que se han quitado testículos.',
      ja: '精巣を取り除いた動物。',
      pt: 'um animal do qual se removeram testículos.',
    });
  });
});
