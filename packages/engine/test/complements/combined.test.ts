import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from '../harness.js';

// A clause may license more than one complement at once — the same verb can say *what it acted
// with* and *where it acted*, together. The per-complement suites each pin one marking in
// isolation; this file pins what happens when two share a sentence, across every pair a single
// verb actually licenses.
//
// The engine lays them out in a fixed linear order — `COMPLEMENT_RENDER_ORDER` in @signi/shared —
// not the order the plan's keys happen to be written in:
//
//     predicative · terminus · instrumental · source · direction · route · locative · cause
//
// Each complement keeps exactly the marking its own suite pins; they simply abut.
//
// ── The pair matrix ──────────────────────────────────────────────────────────
// Eight complement types give C(8,2) = 28 pairs. They fall into three groups:
//
//   • 9 pairs no single verb licenses, so they cannot occur — no verb takes a predicative
//     alongside instrumental/direction/source/route, a terminus alongside direction/source/route,
//     or an instrumental alongside direction/route. (predicative is copular; the directionals and
//     the instrument/recipient belong to disjoint verb classes.)
//   • 6 pairs drawn wholly from the spatial family — direction × source × route × locative — are
//     covered exhaustively in direction.test.ts (GO/COME license all four at once), so they are
//     not repeated here.
//   • 13 pairs remain, every one of them below. `cause` pairs with all seven other types (nearly
//     every verb licenses it); the rest are what the transitive, copular and motion frames allow.

// A predicate complement ("is / becomes / seems X") pairs with a recipient, a place, or a cause.
describe('complement pairs: predicative + …', () => {
  test('predicative + terminus — "seems happy to the dog"', () => {
    // SEEM's terminus is an experiencer (the one it seems that way *to*); the predicate adjective
    // agrees with the subject, the experiencer takes the dative.
    expect(sayAll(clause(np('CAT'), 'SEEM', {
      complements: { predicative: { phrase: np('HAPPY') }, terminus: { phrase: np('DOG') } },
    }))).toEqual({
      en: 'the cat seems happy to the dog.',
      it: 'il gatto sembra felice al cane.',
      fr: 'le chat semble heureux au chien.',
      es: 'el gato parece feliz al perro.',
      pt: 'o gato parece feliz ao cão.',
      de: 'der Kater scheint dem Hund glücklich.', // dative experiencer leads, predicate adj trails
      ja: '猫は幸せに犬に思えます。',
    });
  });

  test('predicative + locative — "is a legend in the house"', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: {
        predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) },
        locative: { phrase: np('HOUSE') },
      },
    }))).toEqual({
      en: 'the cat is a legend in the house.',
      it: 'il gatto è una leggenda nella casa.',
      fr: 'le chat est une légende dans la maison.',
      es: 'el gato es una leyenda en la casa.',
      pt: 'o gato é uma lenda na casa.',
      de: 'der Kater ist eine Legende im Haus.',
      // KNOWN LIMITATION: Japanese drops the locative under a predicate-nominal copula — the
      // です construction leaves no slot for it, so only "猫は伝説です。" survives. Pinned as the
      // current behaviour; the intended output is asserted (failing) in the known-bugs block below.
      ja: '猫は伝説です。',
    });
  });

  test('predicative + cause — "becomes a legend because of the dog"', () => {
    expect(sayAll(clause(np('CAT'), 'BECOME', {
      complements: {
        predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) },
        cause: { phrase: np('DOG') },
      },
    }))).toEqual({
      en: 'the cat becomes a legend because of the dog.',
      it: 'il gatto diventa una leggenda a causa del cane.',
      fr: 'le chat devient une légende à cause du chien.',
      es: 'el gato se vuelve una leyenda a causa del perro.',
      pt: 'o gato se torna uma lenda por causa do cão.',
      de: 'der Kater wird eine Legende wegen dem Hund.',
      ja: '猫は伝説に犬のためになります。',
    });
  });
});

// A recipient ("… to the dog") pairs with an instrument, a place, or a cause. READ and GIVE both
// take a direct object, so all three carry one — the object keeps its slot ahead of the complements.
describe('complement pairs: terminus + …', () => {
  test('terminus + instrumental — "reads the book to the dog with the stick"', () => {
    expect(sayAll(clause(np('CAT'), 'READ', {
      directObject: np('BOOK'),
      complements: {
        terminus: { phrase: np('DOG') },
        instrumental: { phrase: np('STICK'), specifiers: [{ kind: 'abstraction', value: 'object' }] },
      },
    }))).toEqual({
      en: 'the cat reads the book to the dog with the stick.',
      it: 'il gatto legge il libro al cane con il bastone.',
      fr: 'le chat lit le livre au chien avec le bâton.',
      es: 'el gato lee el libro al perro con el palo.',
      pt: 'o gato lê o livro ao cão com o pau.',
      de: 'der Kater liest dem Hund das Buch mit dem Stock.', // dative recipient before accusative object
      ja: '猫は犬に棒で本を読みます。',
    });
  });

  test('terminus + locative — "reads the book to the dog in the house"', () => {
    expect(sayAll(clause(np('CAT'), 'READ', {
      directObject: np('BOOK'),
      complements: { terminus: { phrase: np('DOG') }, locative: { phrase: np('HOUSE') } },
    }))).toEqual({
      en: 'the cat reads the book to the dog in the house.',
      it: 'il gatto legge il libro al cane nella casa.',
      fr: 'le chat lit le livre au chien dans la maison.',
      es: 'el gato lee el libro al perro en la casa.',
      pt: 'o gato lê o livro ao cão na casa.',
      de: 'der Kater liest dem Hund das Buch im Haus.',
      ja: '猫は犬に家で本を読みます。',
    });
  });

  test('terminus + cause — "gives the book to the dog because of the mouse"', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'),
      complements: { terminus: { phrase: np('DOG') }, cause: { phrase: np('MOUSE') } },
    }))).toEqual({
      en: 'the cat gives the book to the dog because of the mouse.',
      it: 'il gatto dà il libro al cane a causa del topo.',
      fr: 'le chat donne le livre au chien à cause de la souris.',
      es: 'el gato da el libro al perro a causa del ratón.',
      pt: 'o gato dá o livro ao cão por causa do rato.',
      de: 'der Kater gibt dem Hund das Buch wegen der Maus.',
      ja: '猫は犬にネズミのために本をあげます。',
    });
  });
});

// An instrument ("… with the stick") pairs with a place, an origin, or a cause.
describe('complement pairs: instrumental + …', () => {
  const instr = (concept: string) => ({
    phrase: np(concept),
    specifiers: [{ kind: 'abstraction' as const, value: 'object' as const }],
  });

  test('instrumental + locative — "cuts with the stick in the house"', () => {
    expect(sayAll(clause(np('CAT'), 'CUT', {
      complements: { instrumental: instr('STICK'), locative: { phrase: np('HOUSE') } },
    }))).toEqual({
      en: 'the cat cuts with the stick in the house.',
      it: 'il gatto taglia con il bastone nella casa.',
      fr: 'le chat coupe avec le bâton dans la maison.',
      es: 'el gato corta con el palo en la casa.',
      pt: 'o gato corta com o pau na casa.',
      de: 'der Kater schneidet mit dem Stock im Haus.',
      ja: '猫は棒で家で切ります。', // both instrument and place take で, and both precede the verb
    });
  });

  test('instrumental + source — "buys the book with the stick from the house"', () => {
    // BUY is the one verb that licenses both an instrument (the means of buying) and a source
    // (where it was bought). Instrumental precedes source in render order.
    expect(sayAll(clause(np('CAT'), 'BUY', {
      directObject: np('BOOK'),
      complements: { instrumental: instr('STICK'), source: { phrase: np('HOUSE') } },
    }))).toEqual({
      en: 'the cat buys the book with the stick from the house.',
      it: 'il gatto compra il libro con il bastone dalla casa.',
      fr: 'le chat achète le livre avec le bâton de la maison.',
      es: 'el gato compra el libro con el palo de la casa.',
      pt: 'o gato compra o livro com o pau da casa.',
      de: 'der Kater kauft das Buch mit dem Stock aus dem Haus.',
      ja: '猫は棒で家から本を買います。',
    });
  });

  test('instrumental + cause — "cuts with the stick because of the dog"', () => {
    expect(sayAll(clause(np('CAT'), 'CUT', {
      complements: { instrumental: instr('STICK'), cause: { phrase: np('DOG') } },
    }))).toEqual({
      en: 'the cat cuts with the stick because of the dog.',
      it: 'il gatto taglia con il bastone a causa del cane.',
      fr: 'le chat coupe avec le bâton à cause du chien.',
      es: 'el gato corta con el palo a causa del perro.',
      pt: 'o gato corta com o pau por causa do cão.',
      de: 'der Kater schneidet mit dem Stock wegen dem Hund.',
      ja: '猫は棒で犬のために切ります。',
    });
  });
});

// A cause ("… because of the dog") pairs with each directional too — it renders last of all, after
// the place/goal/origin/path. (cause + predicative / terminus / instrumental are above; the four
// here complete cause's row of the matrix.)
describe('complement pairs: cause + a directional', () => {
  const goWith = (complements: Record<string, unknown>) =>
    sayAll(clause(np('CAT'), 'GO', { complements }));

  test('locative + cause — "cries in the house because of the dog"', () => {
    expect(sayAll(clause(np('CAT'), 'CRY', {
      complements: { locative: { phrase: np('HOUSE') }, cause: { phrase: np('DOG') } },
    }))).toEqual({
      en: 'the cat cries in the house because of the dog.',
      it: 'il gatto piange nella casa a causa del cane.',
      fr: 'le chat pleure dans la maison à cause du chien.',
      es: 'el gato llora en la casa a causa del perro.',
      pt: 'o gato chora na casa por causa do cão.',
      de: 'der Kater weint im Haus wegen dem Hund.',
      ja: '猫は家で犬のために泣きます。',
    });
  });

  test('direction + cause — "goes to the market because of the dog"', () => {
    expect(goWith({ direction: { phrase: np('MARKET') }, cause: { phrase: np('DOG') } })).toEqual({
      en: 'the cat goes to the market because of the dog.',
      it: 'il gatto va al mercato a causa del cane.',
      fr: 'le chat va au marché à cause du chien.',
      es: 'el gato va al mercado a causa del perro.',
      pt: 'o gato vai ao mercado por causa do cão.',
      de: 'der Kater geht zum Markt wegen dem Hund.',
      ja: '猫は市場へ犬のために行きます。',
    });
  });

  test('source + cause — "goes from the house because of the dog"', () => {
    expect(goWith({ source: { phrase: np('HOUSE') }, cause: { phrase: np('DOG') } })).toEqual({
      en: 'the cat goes from the house because of the dog.',
      it: 'il gatto va dalla casa a causa del cane.',
      fr: 'le chat va de la maison à cause du chien.',
      es: 'el gato va de la casa a causa del perro.',
      pt: 'o gato vai da casa por causa do cão.',
      de: 'der Kater geht aus dem Haus wegen dem Hund.',
      ja: '猫は家から犬のために行きます。',
    });
  });

  test('route + cause — "goes through the market because of the dog"', () => {
    expect(goWith({
      route: { phrase: np('MARKET'), specifiers: [{ kind: 'path', value: 'through' }] },
      cause: { phrase: np('DOG') },
    })).toEqual({
      en: 'the cat goes through the market because of the dog.',
      it: 'il gatto va attraverso il mercato a causa del cane.',
      fr: 'le chat va à travers le marché à cause du chien.',
      es: 'el gato va por el mercado a causa del perro.',
      pt: 'o gato vai pelo mercado por causa do cão.',
      de: 'der Kater geht durch den Markt wegen dem Hund.',
      ja: '猫は市場を犬のために行きます。',
    });
  });
});

// The order the sentence comes out in is the engine's, not the caller's: the render order and the
// direct-object slot are fixed, no matter how the plan is written.
describe('render order & object placement', () => {
  test('the direct object keeps its slot, ahead of both complements', () => {
    // Object, then instrument, then place — the object sits where the transitive verb puts it, and
    // the two complements follow in render order. Japanese alone re-sorts it: the で-marked
    // adjuncts lead, and the を-marked object drops in right before the verb.
    expect(sayAll(clause(np('CAT'), 'CUT', {
      directObject: np('BOOK'),
      complements: {
        instrumental: { phrase: np('STICK'), specifiers: [{ kind: 'abstraction', value: 'object' }] },
        locative: { phrase: np('HOUSE') },
      },
    }))).toEqual({
      en: 'the cat cuts the book with the stick in the house.',
      it: 'il gatto taglia il libro con il bastone nella casa.',
      fr: 'le chat coupe le livre avec le bâton dans la maison.',
      es: 'el gato corta el libro con el palo en la casa.',
      pt: 'o gato corta o livro com o pau na casa.',
      de: 'der Kater schneidet das Buch mit dem Stock im Haus.',
      ja: '猫は棒で家で本を切ります。',
    });
  });

  test('render order is fixed by the engine, not by the order the keys are written', () => {
    // Two plans that disagree only on key order produce the identical sentence, because the engine
    // walks COMPLEMENT_RENDER_ORDER, not object insertion order.
    const causeFirst = sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('DOG') }, locative: { phrase: np('HOUSE') } },
    }));
    const locativeFirst = sayAll(clause(np('CAT'), 'CRY', {
      complements: { locative: { phrase: np('HOUSE') }, cause: { phrase: np('DOG') } },
    }));
    expect(causeFirst).toEqual(locativeFirst);
    expect(causeFirst.en).toBe('the cat cries in the house because of the dog.');
  });
});

describe('known bugs: combined complements', () => {
  // A42. The predicate-nominal copula swallows the locative in Japanese: "is a legend in the house"
  // renders "猫は伝説です。", losing the place the other six languages keep. です closes the clause
  // with no room for the 家で adjunct; the fix preposes it — 猫は家で伝説です — so the place survives
  // ahead of the predicate noun.
  test.fails('Japanese should keep the locative under a predicate nominal', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: {
        predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) },
        locative: { phrase: np('HOUSE') },
      },
    }))).toMatchObject({ ja: '猫は家で伝説です。' });
  });
});
