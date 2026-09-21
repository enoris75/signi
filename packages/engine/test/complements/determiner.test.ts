import { describe, expect, test } from 'vitest';
import type { Definiteness } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The determiner on a COMPLEMENT's noun phrase. The adposition-bearing complements (locative /
// direction / terminus / …) fuse their preposition with a *definite* article ("nella casa", "al
// mercato") but render every other determiner uncontracted ("in una casa", "in nessuna casa", "in
// molte case"). Until now only `definite` / `indefinite` were exercised on these; this file sweeps
// the quantifiers and demonstratives, which the model allows on all of them.
const inHouse = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'RUN', {
    complements: { locative: { phrase: np('HOUSE', { definiteness }) } },
  }));
const toMarket = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'GO', {
    complements: { direction: { phrase: np('MARKET', { definiteness }) } },
  }));
const toDog = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'GIVE', {
    directObject: np('BOOK'),
    complements: { terminus: { phrase: np('DOG', { definiteness }) } },
  }));

// The locative "in" contracts with nothing but the definite article, so it is the clean axis to
// read the whole determiner set against.
describe('complement determiner: the full set on a locative', () => {
  test('definite — the preposition fuses with the article', () => {
    expect(inHouse('definite')).toMatchObject({
      en: 'the cat runs in the house.',
      it: 'il gatto corre nella casa.', // in + la = nella
      fr: 'le chat court dans la maison.',
      de: 'der Kater läuft im Haus.', // in + dem = im
      es: 'el gato corre en la casa.',
      pt: 'o gato corre na casa.', // em + a = na
    });
  });

  test('indefinite — uncontracted', () => {
    expect(inHouse('indefinite')).toMatchObject({
      en: 'the cat runs in a house.',
      it: 'il gatto corre in una casa.', // bare "in", no fusion
      fr: 'le chat court dans une maison.',
      de: 'der Kater läuft in einem Haus.',
      pt: 'o gato corre em uma casa.', // uncontracted, not "numa"
    });
  });

  test('the demonstratives', () => {
    expect(inHouse('this')).toMatchObject({
      en: 'the cat runs in this house.',
      it: 'il gatto corre in questa casa.',
      fr: 'le chat court dans cette maison.',
      de: 'der Kater läuft in diesem Haus.',
      es: 'el gato corre en esta casa.',
      pt: 'o gato corre nesta casa.', // em + esta = nesta
    });
    expect(inHouse('that')).toMatchObject({
      en: 'the cat runs in that house.',
      it: 'il gatto corre in quella casa.',
      fr: 'le chat court dans cette maison.', // French has no proximal/distal split
      de: 'der Kater läuft in jenem Haus.',
      es: 'el gato corre en esa casa.',
      pt: 'o gato corre nessa casa.', // em + essa = nessa
    });
  });

  test('the quantifiers force the plural, and each language keeps its own quantifier word', () => {
    expect(inHouse('some')).toMatchObject({
      en: 'the cat runs in some houses.',
      it: 'il gatto corre in alcune case.',
      fr: 'le chat court dans quelques maisons.',
      de: 'der Kater läuft in einigen Häusern.',
      es: 'el gato corre en algunas casas.',
      pt: 'o gato corre em algumas casas.',
    });
    expect(inHouse('many')).toMatchObject({
      en: 'the cat runs in many houses.',
      it: 'il gatto corre in molte case.',
      fr: 'le chat court dans beaucoup de maisons.', // "beaucoup DE", not "beaucoup les"
      de: 'der Kater läuft in vielen Häusern.',
      es: 'el gato corre en muchas casas.',
    });
    expect(inHouse('few')).toMatchObject({
      en: 'the cat runs in few houses.',
      it: 'il gatto corre in poche case.',
      fr: 'le chat court dans peu de maisons.',
      pt: 'o gato corre em poucas casas.',
    });
  });

  test('"all" takes the article in Romance, and the plural agrees', () => {
    expect(inHouse('all')).toMatchObject({
      en: 'the cat runs in all houses.',
      it: 'il gatto corre in tutte le case.', // tutte LE — all takes the article
      fr: 'le chat court dans toutes les maisons.',
      de: 'der Kater läuft in allen Häusern.',
      es: 'el gato corre en todas las casas.',
      pt: 'o gato corre em todas as casas.',
    });
  });
});

// The same determiner set on the "a"-marked complements. The point of interest is the fusion:
// only the definite article contracts (a + il = al), everything else stays uncontracted.
describe('complement determiner: fusion is definite-only on direction and terminus', () => {
  test('direction — definite fuses, indefinite does not', () => {
    expect(toMarket('definite')).toMatchObject({
      it: 'il gatto va al mercato.', // a + il = al
      fr: 'le chat va au marché.',
      de: 'der Kater geht zum Markt.', // zu + dem = zum
      pt: 'o gato vai ao mercado.', // a + o = ao
    });
    expect(toMarket('indefinite')).toMatchObject({
      it: 'il gatto va a un mercato.', // bare "a", no fusion
      fr: 'le chat va à un marché.',
      de: 'der Kater geht zu einem Markt.',
      pt: 'o gato vai a um mercado.',
    });
  });

  test('direction — "all" fuses with the plural article in Romance', () => {
    expect(toMarket('all')).toMatchObject({
      it: 'il gatto va a tutti i mercati.', // a + tutti i
      fr: 'le chat va à tous les marchés.',
      de: 'der Kater geht zu allen Märkten.',
      es: 'el gato va a todos los mercados.',
      pt: 'o gato vai a todos os mercados.',
    });
  });

  // German is the interesting one on the terminus: the recipient is a bare DATIVE, so the
  // determiner declines for case (dem / einem / keinem / einigen / vielen / allen) and a plural
  // takes its dative -n ("Hunden") — with no preposition to fuse.
  test('terminus — German declines the determiner for the dative', () => {
    expect(toDog('definite').de).toBe('der Kater gibt dem Hund das Buch.');
    expect(toDog('indefinite').de).toBe('der Kater gibt einem Hund das Buch.');
    expect(toDog('some').de).toBe('der Kater gibt einigen Hunden das Buch.');
    expect(toDog('many').de).toBe('der Kater gibt vielen Hunden das Buch.');
    expect(toDog('all').de).toBe('der Kater gibt allen Hunden das Buch.');
  });
});

// Japanese spells no article, so the two article values render the locative bare (家で); the
// demonstratives and quantifiers are real prenominal words that now DO surface (この家で,
// すべての家で …). The `no` quantifier is the circumfix — its も follows the locative で and its
// negation weaves into the verb (どの家でも走りません), the complement-path concord that Romance also
// requires below.
describe('complement determiner: Japanese renders the demonstratives and quantifiers', () => {
  test('the article values render the locative bare — 家で', () => {
    for (const d of ['definite', 'indefinite'] as const) {
      expect(inHouse(d).ja).toBe('猫は家で走ります。');
    }
  });

  test('a demonstrative/quantifier leads the phrase; the locative で is kept', () => {
    expect(inHouse('this').ja).toBe('猫はこの家で走ります。');
    expect(inHouse('some').ja).toBe('猫はいくつかの家で走ります。');
    expect(inHouse('many').ja).toBe('猫は多くの家で走ります。');
    expect(inHouse('all').ja).toBe('猫はすべての家で走ります。');
  });

  test('the `no` circumfix follows で with も and negates the verb — どの家でも走りません', () => {
    expect(inHouse('no').ja).toBe('猫はどの家でも走りません。');
  });
});

// The negative determiner. English and German negate the phrase once and are done ("in no house",
// "in keinem Haus"); the four Romance languages require NEGATIVE CONCORD — a postverbal negative
// word obliges the preverbal negator (non / ne / no / não). The engine already does this for a
// direct object (below), but does NOT reach it from a complement, so a `no`-determined complement
// drops the negator and comes out ungrammatical.
describe('complement determiner: the negative, and negative concord', () => {
  test('English and German need no concord — a single negation suffices', () => {
    expect(inHouse('no')).toMatchObject({
      en: 'the cat runs in no house.',
      de: 'der Kater läuft in keinem Haus.',
    });
    expect(toMarket('no')).toMatchObject({
      en: 'the cat goes to no market.',
      de: 'der Kater geht zu keinem Markt.',
    });
  });

  // The witness that the machinery exists: a `no`-determined DIRECT OBJECT gets the concord
  // negator in all four Romance languages. This is exactly what the complement path fails to do.
  test('a negative direct object DOES get the concord negator', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE', { definiteness: 'no' }) })))
      .toMatchObject({
        it: 'il gatto non mangia nessun topo.',
        fr: 'le chat ne mange aucune souris.',
        es: 'el gato no come ningún ratón.',
        pt: 'o gato não come nenhum rato.',
      });
  });
});

describe('known bugs: complement negative concord', () => {
  // A postverbal negative word obliges the preverbal negator, and a complement is postverbal — so
  // "il gatto corre in nessuna casa" was ungrammatical; it must be "il gatto NON corre in nessuna
  // casa". The concord now reaches the complement path (as it always did the direct object), in all
  // four Romance languages, on every adposition-bearing complement.
  test('Italian needs "non" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ it: 'il gatto non corre in nessuna casa.' });
  });

  test('French needs "ne" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ fr: 'le chat ne court dans aucune maison.' });
  });

  test('Spanish needs "no" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ es: 'el gato no corre en ninguna casa.' });
  });

  test('Portuguese needs "não" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ pt: 'o gato não corre em nenhuma casa.' });
  });

  // And it is not specific to the locative — the same concord on a `direction` goal.
  test('the concord fires on a negative direction goal too', () => {
    expect(toMarket('no')).toMatchObject({
      it: 'il gatto non va a nessun mercato.',
      fr: 'le chat ne va à aucun marché.',
      es: 'el gato no va a ningún mercado.',
      pt: 'o gato não vai a nenhum mercado.',
    });
  });

  // …and on a `terminus`, even alongside a (positive) direct object — the negative complement alone
  // obliges the negator ("non dà il libro a nessun cane").
  test('the concord fires on a negative terminus with a direct object present', () => {
    expect(toDog('no')).toMatchObject({
      it: 'il gatto non dà il libro a nessun cane.',
      fr: 'le chat ne donne le livre à aucun chien.',
      es: 'el gato no da el libro a ningún perro.',
      pt: 'o gato não dá o livro a nenhum cão.',
    });
  });

  // A negative verb AND a negative complement together take a SINGLE negator, not two.
  test('a negative verb and a negative complement do not double the negator', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      verbPhrase: { negative: true },
      complements: { locative: { phrase: np('HOUSE', { definiteness: 'no' }) } },
    }))).toMatchObject({
      it: 'il gatto non corre in nessuna casa.',
      fr: 'le chat ne court dans aucune maison.',
    });
  });

  // Regression: a positive (definite) complement adds no negator.
  test('a positive complement takes no concord negator', () => {
    expect(inHouse('definite')).toMatchObject({
      it: 'il gatto corre nella casa.',
      es: 'el gato corre en la casa.',
    });
  });
});

// A114. `npSegs` puts the どの…も circumfix's も right after the head noun, and every caller then
// drops its particle, as if も replaced any particle. It replaces only が/を/は; with で, に, から, へ
// and のために Japanese keeps the particle and adds も (どの家でも, どの犬にも). A relational noun lands
// after the も (どの家もの下), and the BE predicate noun reads どの伝説もではありません.
describe('known bugs: Japanese どの…も on a complement', () => {
  test('Japanese keeps the complement particle before も', () => {
    const no = (concept: string) => np(concept, { definiteness: 'no' });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: no('HOUSE') } } })).ja)
      .toBe('猫はどの家でも走りません。');
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { locative: { phrase: no('HOUSE'), specifiers: [{ kind: 'path', value: 'under' }] } },
    })).ja).toBe('猫はどの家の下でも走りません。');
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: no('DOG') } } })).ja)
      .toBe('男はどの犬にも本をあげません。');
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { source: { phrase: no('MARKET') } } })).ja)
      .toBe('猫はどの市場からも行きません。');
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: no('DOG') } } })).ja)
      .toBe('猫はどの犬のためにも泣きません。');
    expect(sayAll(clause(np('CAT'), 'BECOME', { complements: { predicative: { phrase: no('LEGEND') } } })).ja)
      .toBe('猫はどの伝説にもなりません。');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: no('LEGEND') } } })).ja)
      .toBe('猫はどの伝説でもありません。');
  });

  test('Japanese closes the circumfix after every other particle, the existential に and the relative clause', () => {
    const no = (concept: string) => np(concept, { definiteness: 'no' });
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: no('MARKET') } } })).ja).toBe('猫はどの市場へも行きません。');
    expect(sayAll(clause(np('CAT'), 'EAT', { complements: { instrumental: { phrase: no('WORD') } } })).ja).toBe('猫はどの単語でも食べません。');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase: no('SPEED') } } })).ja).toBe('猫はどの速さでも走りません。');
    expect(sayAll(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: no('LEGEND') } } })).ja).toBe('猫はどの伝説にも思えません。');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { locative: { phrase: no('HOUSE') } } })).ja).toBe('猫はどの家にもいません。');
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: no('LEGEND') } } } }), 'RUN')).ja)
      .toBe('どの伝説でもない猫は走ります。');
  });

  test('regression: も still replaces が, を and the route\'s を', () => {
    const no = (concept: string) => np(concept, { definiteness: 'no' });
    expect(sayAll(clause(no('CAT'), 'EAT', { directObject: np('MOUSE') })).ja).toBe('どの猫もネズミを食べません。');
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: no('MOUSE') })).ja).toBe('猫はどのネズミも食べません。');
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { route: { phrase: no('MARKET') } } })).ja).toBe('猫はどの市場も行きません。');
  });
});

// A158. A `no` complement already negates the clause. With a SECOND negation source — a `negative`
// verb or a NEVER adverb — English and German double the negative, because A35's collapse reads the
// direct object only and never asks `hasNegativeComplement` (the predicate A33 added, which is why
// the four Romance engines and Japanese are right here). The chosen surfaces are A35's, applied to
// the complement: English switches to the "any"-series NPI, German keeps "kein" and drops the
// redundant "nicht", and falls to a plain indefinite under "nie" (kein = nicht + ein).
describe('known bugs: a negative complement is not collapsed', () => {
  const noHouse = { locative: { phrase: np('HOUSE', { definiteness: 'no' as const }) } };

  test('English switches a negative complement to the "any" NPI', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { negative: true }, complements: noHouse })).en)
      .toBe('the cat does not run in any house.'); // now: "in no house"
    expect(sayAll(clause(np('CAT'), 'GO', {
      verbPhrase: { negative: true },
      complements: { direction: { phrase: np('MARKET', { definiteness: 'no' }) } },
    })).en).toBe('the cat does not go to any market.'); // now: "to no market"
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER' }, complements: noHouse })).en)
      .toBe('the cat never runs in any house.'); // now: "in no house"
    // The random phrase that found it (seed 484002).
    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural', gender: 'fem' }), 'BITE', {
      verbPhrase: { tense: 'past', aspect: 'progressive', negative: true },
      directObject: np('HOUSE', { definiteness: 'that', adjectives: ['SHARP'] }),
      complements: { locative: { phrase: np('ICE_CREAM', { definiteness: 'no', adjectives: ['ADULT'] }) } },
    })).en).toBe('they were not biting that sharp house in any adult ice cream.');
  });

  test('German drops the "nicht" a negative complement makes redundant', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { negative: true }, complements: noHouse })).de)
      .toBe('der Kater läuft in keinem Haus.'); // now: "… in keinem Haus nicht."
    expect(sayAll(clause(np('CAT'), 'GO', {
      verbPhrase: { negative: true },
      complements: { direction: { phrase: np('MARKET', { definiteness: 'no' }) } },
    })).de).toBe('der Kater geht zu keinem Markt.'); // now: "… zu keinem Markt nicht."
    // Under a negative adverb it is "kein" that goes, as the object does ("isst nie eine Maus").
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER' }, complements: noHouse })).de)
      .toBe('der Kater läuft nie in einem Haus.'); // now: "nie in keinem Haus"
    // The random phrase that found it (seed 484002).
    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural', gender: 'fem' }), 'BITE', {
      verbPhrase: { tense: 'past', aspect: 'progressive', negative: true },
      directObject: np('HOUSE', { definiteness: 'that', adjectives: ['SHARP'] }),
      complements: { locative: { phrase: np('ICE_CREAM', { definiteness: 'no', adjectives: ['ADULT'] }) } },
    })).de).toBe('sie bissen gerade jenes scharfe Haus in keinem erwachsenen Eis.');
  });

  // Regression: what must NOT change when the collapse reaches the complement path. A LONE `no`
  // complement keeps English's "no" and German's bare "kein" (no second source to collapse against),
  // and the five languages that already compose a negated verb with a negative complement correctly
  // still take exactly one negator.
  test('a lone `no` complement, and the five languages already right, are unchanged', () => {
    expect(inHouse('no')).toMatchObject({
      en: 'the cat runs in no house.',
      de: 'der Kater läuft in keinem Haus.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { negative: true }, complements: noHouse })))
      .toMatchObject({
        it: 'il gatto non corre in nessuna casa.',
        fr: 'le chat ne court dans aucune maison.',
        es: 'el gato no corre en ninguna casa.',
        pt: 'o gato não corre em nenhuma casa.',
        ja: '猫はどの家でも走りません。',
      });
    // A negated verb with a POSITIVE complement keeps its "nicht" — leading the prepositional
    // complement, which is A159's rule (it superseded A49's "after the complements").
    expect(sayAll(clause(np('CAT'), 'RUN', {
      verbPhrase: { negative: true },
      complements: { locative: { phrase: np('HOUSE', { definiteness: 'definite' }) } },
    }))).toMatchObject({
      en: 'the cat does not run in the house.',
      de: 'der Kater läuft nicht im Haus.',
    });
  });

  // The collapse is the complement's, not the locative's: every complement type reaches it, since
  // they all go through the same `hasNegativeComplement` / `withComplementDefiniteness` pair.
  test('every complement type collapses the same way', () => {
    const notWith = (verb: string, complements: Record<string, unknown>) =>
      sayAll(clause(np('CAT'), verb, { verbPhrase: { negative: true }, complements }));
    const no = (concept: string) => ({ phrase: np(concept, { definiteness: 'no' as const }) });
    expect(notWith('COME', { source: no('HOUSE') })).toMatchObject({
      en: 'the cat does not come from any house.', de: 'der Kater kommt aus keinem Haus.',
    });
    expect(notWith('EAT', { instrumental: no('WORD') })).toMatchObject({
      en: 'the cat does not eat with any word.', de: 'der Kater frisst mit keinem Wort.',
    });
    expect(notWith('CRY', { cause: no('DOG') })).toMatchObject({
      en: 'the cat does not cry because of any dog.', de: 'der Kater weint wegen keines Hundes.',
    });
  });

  // The switch is PER CONJUNCT and per complement, as the object's already was: a group mixing
  // determiners keeps the ones that are not negative, and a positive complement beside a negative
  // one is left alone.
  test('only the negative conjunct, and only the negative complement, gives way', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      verbPhrase: { negative: true },
      complements: { locative: { phrase: {
        conjuncts: [np('HOUSE', { definiteness: 'definite' }), np('MARKET', { definiteness: 'no' })],
        conjunction: 'or',
      } } },
    }))).toMatchObject({
      en: 'the cat does not run in the house or any market.',
      de: 'der Kater läuft im Haus oder in keinem Markt.',
    });
    expect(sayAll(clause(np('CAT'), 'GO', {
      verbPhrase: { negative: true },
      complements: {
        source: { phrase: np('HOUSE', { definiteness: 'definite' }) },
        direction: { phrase: np('MARKET', { definiteness: 'no' }) },
      },
    }))).toMatchObject({
      en: 'the cat does not go from the house to any market.',
      de: 'der Kater geht aus dem Haus zu keinem Markt.',
    });
  });

  // A `no` object and a `no` complement are both postverbal, so neither is "ahead" of the other on
  // the clause's own terms — the object is simply leftmost, keeps its negative, and the complement
  // gives way. One negator, not two, and not a downgrade of both.
  test('a negative object beside a negative complement: the object keeps it', () => {
    const noNP = (concept: string) => np(concept, { definiteness: 'no' as const });
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: noNP('MOUSE'), complements: { locative: { phrase: noNP('HOUSE') } },
    }))).toMatchObject({
      en: 'the cat eats no mouse in any house.',
      de: 'der Kater frisst keine Maus in einem Haus.',
      it: 'il gatto non mangia nessun topo in nessuna casa.',
      ja: '猫はどの家でもどのネズミも食べません。',
    });
    // Under "nie"/"never" the adverb is ahead of both, so both give way.
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modifier: 'NEVER' },
      directObject: noNP('MOUSE'), complements: { locative: { phrase: noNP('HOUSE') } },
    }))).toMatchObject({
      en: 'the cat never eats any mouse in any house.',
      de: 'der Kater frisst nie eine Maus in einem Haus.',
    });
  });
});
