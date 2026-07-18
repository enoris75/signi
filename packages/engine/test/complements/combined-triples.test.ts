import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from '../harness.js';

// Three complements in one clause. combined.test.ts pins the pairs; this file pins the triples —
// every three-way combination a single verb actually licenses. The layout is still the fixed
// COMPLEMENT_RENDER_ORDER:
//
//     predicative · terminus · instrumental · source · direction · route · locative · cause
//
// ── Which triples exist ──────────────────────────────────────────────────────
// Of the C(8,3) = 56 conceivable triples, only 19 are licensed by some verb (the rest mix
// complement types no single verb takes together — see the pair matrix in combined.test.ts). Of
// those 19:
//
//   • 4 are drawn wholly from the spatial family — {source, direction, route, locative} choose 3 —
//     and are covered by the "all four directionals at once" test in direction.test.ts (GO/COME
//     license all four, so every spatial triple surfaces there). Not repeated here.
//   • 15 remain, every one below, grouped by the verb frame that licenses it: the motion frame
//     (GO), the transitive frame (CUT / BUY / READ), and the copular frame (BE / SEEM).
//
// `cause` renders last of all, so most triples end in it; the render order fixes where the other
// two land ahead of it.

// GO licenses the whole spatial family plus a cause, so a cause rides along after any two
// directionals. (The three purely-spatial GO triples — source·direction·route and friends — live
// in direction.test.ts; the six here are the ones that include the cause.)
describe('three complements: the motion frame (GO)', () => {
  const goWith = (complements: Record<string, unknown>) =>
    sayAll(clause(np('CAT'), 'GO', { complements }));
  const via = (concept: string) => ({ phrase: np(concept), specifiers: [{ kind: 'path' as const, value: 'through' as const }] });

  test('source · direction · cause', () => {
    expect(goWith({
      source: { phrase: np('HOUSE') }, direction: { phrase: np('MARKET') }, cause: { phrase: np('DOG') },
    })).toEqual({
      en: 'the cat goes from the house to the market because of the dog.',
      it: 'il gatto va dalla casa al mercato a causa del cane.',
      fr: 'le chat va de la maison au marché à cause du chien.',
      es: 'el gato va de la casa al mercado a causa del perro.',
      pt: 'o gato vai da casa ao mercado por causa do cão.',
      de: 'der Kater geht aus dem Haus zum Markt wegen dem Hund.',
      ja: '猫は家から市場へ犬のために行きます。',
    });
  });

  test('direction · locative · cause', () => {
    expect(goWith({
      direction: { phrase: np('MARKET') }, locative: { phrase: np('HOUSE') }, cause: { phrase: np('DOG') },
    })).toEqual({
      en: 'the cat goes to the market in the house because of the dog.',
      it: 'il gatto va al mercato nella casa a causa del cane.',
      fr: 'le chat va au marché dans la maison à cause du chien.',
      es: 'el gato va al mercado en la casa a causa del perro.',
      pt: 'o gato vai ao mercado na casa por causa do cão.',
      de: 'der Kater geht zum Markt im Haus wegen dem Hund.',
      ja: '猫は市場へ家で犬のために行きます。',
    });
  });

  test('direction · route · cause', () => {
    expect(goWith({
      direction: { phrase: np('MARKET') }, route: via('HOUSE'), cause: { phrase: np('DOG') },
    })).toEqual({
      en: 'the cat goes to the market through the house because of the dog.',
      it: 'il gatto va al mercato attraverso la casa a causa del cane.',
      fr: 'le chat va au marché à travers la maison à cause du chien.',
      es: 'el gato va al mercado por la casa a causa del perro.',
      pt: 'o gato vai ao mercado pela casa por causa do cão.',
      de: 'der Kater geht zum Markt durch das Haus wegen dem Hund.',
      ja: '猫は市場へ家を犬のために行きます。',
    });
  });

  test('source · route · cause', () => {
    expect(goWith({
      source: { phrase: np('HOUSE') }, route: via('MARKET'), cause: { phrase: np('DOG') },
    })).toEqual({
      en: 'the cat goes from the house through the market because of the dog.',
      it: 'il gatto va dalla casa attraverso il mercato a causa del cane.',
      fr: 'le chat va de la maison à travers le marché à cause du chien.',
      es: 'el gato va de la casa por el mercado a causa del perro.',
      pt: 'o gato vai da casa pelo mercado por causa do cão.',
      de: 'der Kater geht aus dem Haus durch den Markt wegen dem Hund.',
      ja: '猫は家から市場を犬のために行きます。',
    });
  });

  test('source · locative · cause', () => {
    expect(goWith({
      source: { phrase: np('HOUSE') }, locative: { phrase: np('MARKET') }, cause: { phrase: np('DOG') },
    })).toEqual({
      en: 'the cat goes from the house in the market because of the dog.',
      it: 'il gatto va dalla casa nel mercato a causa del cane.',
      fr: 'le chat va de la maison dans le marché à cause du chien.',
      es: 'el gato va de la casa en el mercado a causa del perro.',
      pt: 'o gato vai da casa no mercado por causa do cão.',
      de: 'der Kater geht aus dem Haus im Markt wegen dem Hund.',
      ja: '猫は家から市場で犬のために行きます。',
    });
  });

  test('route · locative · cause', () => {
    expect(goWith({
      route: via('MARKET'), locative: { phrase: np('HOUSE') }, cause: { phrase: np('DOG') },
    })).toEqual({
      en: 'the cat goes through the market in the house because of the dog.',
      it: 'il gatto va attraverso il mercato nella casa a causa del cane.',
      fr: 'le chat va à travers le marché dans la maison à cause du chien.',
      es: 'el gato va por el mercado en la casa a causa del perro.',
      pt: 'o gato vai pelo mercado na casa por causa do cão.',
      de: 'der Kater geht durch den Markt im Haus wegen dem Hund.',
      ja: '猫は市場を家で犬のために行きます。',
    });
  });
});

// The transitive frames stack an instrument / recipient / place / cause around a direct object.
// CUT and READ take a terminus + instrumental; BUY is the one verb with both an instrument and a
// source. Each carries its direct object, which keeps its slot ahead of the complements.
describe('three complements: the transitive frame', () => {
  const instr = (concept: string) => ({
    phrase: np(concept), specifiers: [{ kind: 'abstraction' as const, value: 'object' as const }],
  });

  test('instrumental · locative · cause (CUT)', () => {
    expect(sayAll(clause(np('CAT'), 'CUT', {
      complements: { instrumental: instr('STICK'), locative: { phrase: np('HOUSE') }, cause: { phrase: np('DOG') } },
    }))).toEqual({
      en: 'the cat cuts with the stick in the house because of the dog.',
      it: 'il gatto taglia con il bastone nella casa a causa del cane.',
      fr: 'le chat coupe avec le bâton dans la maison à cause du chien.',
      es: 'el gato corta con el palo en la casa a causa del perro.',
      pt: 'o gato corta com o pau na casa por causa do cão.',
      de: 'der Kater schneidet mit dem Stock im Haus wegen dem Hund.',
      ja: '猫は棒で家で犬のために切ります。',
    });
  });

  test('instrumental · source · cause (BUY)', () => {
    expect(sayAll(clause(np('CAT'), 'BUY', {
      directObject: np('BOOK'),
      complements: { instrumental: instr('STICK'), source: { phrase: np('HOUSE') }, cause: { phrase: np('DOG') } },
    }))).toEqual({
      en: 'the cat buys the book with the stick from the house because of the dog.',
      it: 'il gatto compra il libro con il bastone dalla casa a causa del cane.',
      fr: 'le chat achète le livre avec le bâton de la maison à cause du chien.',
      es: 'el gato compra el libro con el palo de la casa a causa del perro.',
      pt: 'o gato compra o livro com o pau da casa por causa do cão.',
      de: 'der Kater kauft das Buch mit dem Stock aus dem Haus wegen dem Hund.',
      ja: '猫は棒で家から犬のために本を買います。',
    });
  });

  test('instrumental · source · locative (BUY)', () => {
    expect(sayAll(clause(np('CAT'), 'BUY', {
      directObject: np('BOOK'),
      complements: { instrumental: instr('STICK'), source: { phrase: np('HOUSE') }, locative: { phrase: np('MARKET') } },
    }))).toEqual({
      en: 'the cat buys the book with the stick from the house in the market.',
      it: 'il gatto compra il libro con il bastone dalla casa nel mercato.',
      fr: 'le chat achète le livre avec le bâton de la maison dans le marché.',
      es: 'el gato compra el libro con el palo de la casa en el mercado.',
      pt: 'o gato compra o livro com o pau da casa no mercado.',
      de: 'der Kater kauft das Buch mit dem Stock aus dem Haus im Markt.',
      ja: '猫は棒で家から市場で本を買います。',
    });
  });

  test('terminus · instrumental · cause (READ)', () => {
    expect(sayAll(clause(np('CAT'), 'READ', {
      directObject: np('BOOK'),
      complements: { terminus: { phrase: np('DOG') }, instrumental: instr('STICK'), cause: { phrase: np('MOUSE') } },
    }))).toEqual({
      en: 'the cat reads the book to the dog with the stick because of the mouse.',
      it: 'il gatto legge il libro al cane con il bastone a causa del topo.',
      fr: 'le chat lit le livre au chien avec le bâton à cause de la souris.',
      es: 'el gato lee el libro al perro con el palo a causa del ratón.',
      pt: 'o gato lê o livro ao cão com o pau por causa do rato.',
      de: 'der Kater liest dem Hund das Buch mit dem Stock wegen der Maus.',
      ja: '猫は犬に棒でネズミのために本を読みます。',
    });
  });

  test('terminus · instrumental · locative (READ)', () => {
    expect(sayAll(clause(np('CAT'), 'READ', {
      directObject: np('BOOK'),
      complements: { terminus: { phrase: np('DOG') }, instrumental: instr('STICK'), locative: { phrase: np('HOUSE') } },
    }))).toEqual({
      en: 'the cat reads the book to the dog with the stick in the house.',
      it: 'il gatto legge il libro al cane con il bastone nella casa.',
      fr: 'le chat lit le livre au chien avec le bâton dans la maison.',
      es: 'el gato lee el libro al perro con el palo en la casa.',
      pt: 'o gato lê o livro ao cão com o pau na casa.',
      de: 'der Kater liest dem Hund das Buch mit dem Stock im Haus.',
      ja: '猫は犬に棒で家で本を読みます。',
    });
  });

  test('terminus · locative · cause (READ)', () => {
    expect(sayAll(clause(np('CAT'), 'READ', {
      directObject: np('BOOK'),
      complements: { terminus: { phrase: np('DOG') }, locative: { phrase: np('HOUSE') }, cause: { phrase: np('MOUSE') } },
    }))).toEqual({
      en: 'the cat reads the book to the dog in the house because of the mouse.',
      it: 'il gatto legge il libro al cane nella casa a causa del topo.',
      fr: 'le chat lit le livre au chien dans la maison à cause de la souris.',
      es: 'el gato lee el libro al perro en la casa a causa del ratón.',
      pt: 'o gato lê o livro ao cão na casa por causa do rato.',
      de: 'der Kater liest dem Hund das Buch im Haus wegen der Maus.',
      ja: '猫は犬に家でネズミのために本を読みます。',
    });
  });
});

// The copular frame: a predicate complement plus two of {terminus (experiencer), locative, cause}.
// SEEM licenses all three around a predicate; BE licenses predicative + locative + cause.
describe('three complements: the copular frame (SEEM / BE)', () => {
  test('predicative · terminus · cause (SEEM)', () => {
    expect(sayAll(clause(np('CAT'), 'SEEM', {
      complements: { predicative: { phrase: np('HAPPY') }, terminus: { phrase: np('DOG') }, cause: { phrase: np('MOUSE') } },
    }))).toEqual({
      en: 'the cat seems happy to the dog because of the mouse.',
      it: 'il gatto sembra felice al cane a causa del topo.',
      fr: 'le chat semble heureux au chien à cause de la souris.',
      es: 'el gato parece feliz al perro a causa del ratón.',
      pt: 'o gato parece feliz ao cão por causa do rato.',
      de: 'der Kater scheint dem Hund glücklich wegen der Maus.',
      ja: '猫は幸せに犬にネズミのために思えます。',
    });
  });

  test('predicative · terminus · locative (SEEM)', () => {
    expect(sayAll(clause(np('CAT'), 'SEEM', {
      complements: { predicative: { phrase: np('HAPPY') }, terminus: { phrase: np('DOG') }, locative: { phrase: np('HOUSE') } },
    }))).toEqual({
      en: 'the cat seems happy to the dog in the house.',
      it: 'il gatto sembra felice al cane nella casa.',
      fr: 'le chat semble heureux au chien dans la maison.',
      es: 'el gato parece feliz al perro en la casa.',
      pt: 'o gato parece feliz ao cão na casa.',
      de: 'der Kater scheint dem Hund glücklich im Haus.',
      ja: '猫は幸せに犬に家で思えます。', // SEEM (思えます) is verb-like, so the adjuncts survive — unlike BE below
    });
  });

  test('predicative · locative · cause (BE)', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: {
        predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) },
        locative: { phrase: np('HOUSE') },
        cause: { phrase: np('DOG') },
      },
    }))).toEqual({
      en: 'the cat is a legend in the house because of the dog.',
      it: 'il gatto è una leggenda nella casa a causa del cane.',
      fr: 'le chat est une légende dans la maison à cause du chien.',
      es: 'el gato es una leyenda en la casa a causa del perro.',
      pt: 'o gato é uma lenda na casa por causa do cão.',
      de: 'der Kater ist eine Legende im Haus wegen dem Hund.',
      // A42. The です predicate-nominal frame swallows BOTH trailing adjuncts in Japanese — the
      // place AND the cause — leaving only "猫は伝説です。". The other six keep both. The intended
      // output is asserted (failing) in the known-bugs block below.
      ja: '猫は伝説です。',
    });
  });
});

describe('known bugs: three complements', () => {
  // A42 (extended). Under the Japanese predicate-nominal copula です, every trailing adjunct is
  // dropped: "is a legend in the house because of the dog" loses both the locative and the cause,
  // rendering "猫は伝説です。". The fix preposes the adjuncts ahead of the predicate noun so both
  // survive: 猫は家で犬のために伝説です。
  test.fails('Japanese should keep the locative AND the cause under a predicate nominal', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: {
        predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) },
        locative: { phrase: np('HOUSE') },
        cause: { phrase: np('DOG') },
      },
    }))).toMatchObject({ ja: '猫は家で犬のために伝説です。' });
  });
});
