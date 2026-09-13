import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, PathSpecifier, Specifier } from '@signi/shared';
import { complementsPhrase } from './complementsPhrase.js';
import {
  adj, BEHAELTER, BOOT, BUCH, complement, complements, concept, DU, el, ER, EUROPA, type Forms, GESCHWINDIGKEIT, GROSS, group,
  GUT, HAUS, HOCH, ICH, JUNGE, KATER, KATZE, KLEIN, MANN, MESSER, MUEDE, nounModifier, np, SCHEINEN, SCHNELL, SEGEL, SORGFALT, vp, WAEHLEN,
  WASSER, WEISE, WIND, WORT,
} from './de.fixtures.js';

const LEGENDE: Forms = { base: 'Legende', plural: 'Legenden', gender: 'fem', count: 'singular' };
const MARKT: Forms = { base: 'Markt', plural: 'Märkte', gender: 'masc', count: 'singular' };
const BRENNEN: Forms = { base: 'brennen', '3sg_present': 'brennt' };

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

describe('complementsPhrase', () => {
  test('renders nothing without complements', () => {
    expect(complementsPhrase()).toBe('');
    expect(complementsPhrase({})).toBe('');
  });

  describe('predicative', () => {
    test('a predicate adjective is undeclined but still compared', () => {
      expect(complementsPhrase(complements({ predicative: complement(np(MUEDE)) }))).toBe('müde');
      expect(complementsPhrase(complements({ predicative: complement(np(MUEDE, { degree: 'more' })) }))).toBe('müder');
      expect(complementsPhrase(complements({ predicative: complement(np(GROSS, { degree: 'most' })) }))).toBe('am größten');
    });

    test('a predicate noun takes the nominative', () => {
      expect(complementsPhrase(complements({ predicative: complement(np(LEGENDE, { definiteness: 'indefinite' })) }))).toBe('eine Legende');
      expect(complementsPhrase(complements({ predicative: complement(np(KATER)) }))).toBe('der Kater');
    });

    test('coordinated predicates render conjunct by conjunct', () => {
      expect(complementsPhrase(complements({ predicative: complement(group('or', np(MUEDE), np(GROSS))) }))).toBe('müde oder groß');
    });

    // A46: "scheinen" takes no predicate nominative, only "zu sein", which carries a mixed group.
    test('under a seeming verb a predicate noun takes the infinitival copula', () => {
      const under = (phrase: Parameters<typeof complement>[0], verb: Forms) =>
        complementsPhrase(complements({ predicative: complement(phrase) }), verb);
      expect(under(np(LEGENDE, { definiteness: 'indefinite' }), SCHEINEN)).toBe('eine Legende zu sein');
      expect(under(el(np(MUEDE), np(LEGENDE, { definiteness: 'indefinite' })), SCHEINEN)).toBe('müde und eine Legende zu sein');
      expect(under(np(MUEDE), SCHEINEN)).toBe('müde');
      expect(under(np(LEGENDE, { definiteness: 'indefinite' }), BRENNEN)).toBe('eine Legende');
    });

    test('the infinitival copula closes the complements, against the verb cluster', () => {
      expect(complementsPhrase(complements({
        predicative: complement(np(LEGENDE, { definiteness: 'indefinite' })), locative: complement(np(MARKT)),
      }), SCHEINEN)).toBe('eine Legende im Markt zu sein');
    });
  });

  describe('terminus', () => {
    test('an animate recipient is a bare dative', () => {
      expect(complementsPhrase(complements({ terminus: complement(np(KATZE)) }))).toBe('der Katze');
      expect(complementsPhrase(complements({ terminus: complement(np(MANN, { definiteness: 'indefinite' })) }))).toBe('einem Mann');
      expect(complementsPhrase(complements({ terminus: complement(np(KATZE, { number: 'plural' })) }))).toBe('den Katzen');
      expect(complementsPhrase(complements({ terminus: complement(np(JUNGE)) }))).toBe('dem Jungen');
    });

    test('an inanimate goal takes "in" + the accusative', () => {
      expect(complementsPhrase(complements({ terminus: complement(np(BEHAELTER)) }))).toBe('in den Behälter');
      expect(complementsPhrase(complements({ terminus: complement(np(BEHAELTER, { definiteness: 'indefinite' })) }))).toBe('in einen Behälter');
    });
  });

  describe('instrumental', () => {
    test('an object instrument is "mit" + dative', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(MESSER)) }))).toBe('mit dem Messer');
      expect(complementsPhrase(complements({ instrumental: complement(np(MESSER, { definiteness: 'indefinite' })) }))).toBe('mit einem Messer');
      expect(complementsPhrase(complements({ instrumental: complement(np(MESSER, { number: 'plural' })) }))).toBe('mit den Messern');
    });

    // The impersonal "man" is a documented simplification (B06). The leading comma is pulled back
    // onto the previous word when the sentence is joined.
    test('a process instrument is a comma-led "indem man" clause with an accusative object', () => {
      const word = np(WORT, { definiteness: 'indefinite' });
      expect(complementsPhrase(complements({ instrumental: complement(word, [abstraction('process')], vp(WAEHLEN)) })))
        .toBe(', indem man ein Wort wählt');
      expect(complementsPhrase(complements({
        instrumental: complement(word, [abstraction('process')], vp(WAEHLEN, { modifier: concept(SCHNELL) })),
      }))).toBe(', indem man ein Wort schnell wählt');
      expect(complementsPhrase(complements({
        instrumental: complement(el(word, np(BUCH, { definiteness: 'indefinite' })), [abstraction('process')], vp(WAEHLEN)),
      }))).toBe(', indem man ein Wort und ein Buch wählt');
    });

    // German nominalises the infinitive ("das Wählen"); its object becomes a genitive and its
    // adverb an attributive adjective.
    test('a concept instrument nominalises the infinitive with a genitive object', () => {
      const word = np(WORT, { definiteness: 'indefinite' });
      expect(complementsPhrase(complements({ instrumental: complement(word, [abstraction('concept')], vp(WAEHLEN)) })))
        .toBe('mit dem Wählen eines Wortes');
      expect(complementsPhrase(complements({
        instrumental: complement(np(WORT), [abstraction('concept')], vp(WAEHLEN, { modifier: concept(SCHNELL) })),
      }))).toBe('mit dem schnellen Wählen des Wortes');
    });

    test('falls back to the plain object at the object level or without an action', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(MESSER), [abstraction('object')], vp(WAEHLEN)) })))
        .toBe('mit dem Messer');
      expect(complementsPhrase(complements({ instrumental: complement(np(WORT, { definiteness: 'indefinite' }), [abstraction('process')]) })))
        .toBe('mit einem Wort');
    });
  });

  describe('manner', () => {
    test('a noun with no manner relation is similative "wie" + nominative', () => {
      expect(complementsPhrase(complements({ manner: complement(np(WIND)) }))).toBe('wie der Wind');
      expect(complementsPhrase(complements({ manner: complement(np(WASSER)) }))).toBe('wie das Wasser');
    });

    test('means and measure take "mit" + dative', () => {
      expect(complementsPhrase(complements({ manner: complement(np(SORGFALT, { definiteness: 'bare' })) }))).toBe('mit Sorgfalt');
      expect(complementsPhrase(complements({
        manner: complement(np(GESCHWINDIGKEIT, { definiteness: 'bare' }, { adjectives: [adj(HOCH)] })),
      }))).toBe('mit hoher Geschwindigkeit');
    });

    test('mode takes "auf" + accusative', () => {
      expect(complementsPhrase(complements({
        manner: complement(np(WEISE, { definiteness: 'indefinite' }, { adjectives: [adj(GUT)] })),
      }))).toBe('auf eine gute Weise');
      expect(complementsPhrase(complements({ manner: complement(np(WEISE, { definiteness: 'this' })) }))).toBe('auf diese Weise');
    });
  });

  describe('source', () => {
    test('is "aus" + dative', () => {
      expect(complementsPhrase(complements({ source: complement(np(HAUS)) }))).toBe('aus dem Haus');
      expect(complementsPhrase(complements({ source: complement(np(HAUS, { number: 'plural' })) }))).toBe('aus den Häusern');
      expect(complementsPhrase(complements({ source: complement(np(EUROPA)) }))).toBe('aus Europa');
    });
  });

  describe('direction', () => {
    test('is "zu" + dative, fused with a definite article', () => {
      expect(complementsPhrase(complements({ direction: complement(np(HAUS)) }))).toBe('zum Haus');
      expect(complementsPhrase(complements({ direction: complement(np(KATZE)) }))).toBe('zur Katze');
      expect(complementsPhrase(complements({ direction: complement(np(JUNGE)) }))).toBe('zum Jungen');
    });

    test('does not fuse with any other determiner or the plural article', () => {
      expect(complementsPhrase(complements({ direction: complement(np(HAUS, { definiteness: 'indefinite' })) }))).toBe('zu einem Haus');
      expect(complementsPhrase(complements({ direction: complement(np(HAUS, { number: 'plural' })) }))).toBe('zu den Häusern');
    });
  });

  describe('route', () => {
    test('defaults to "durch" + accusative', () => {
      expect(complementsPhrase(complements({ route: complement(np(MARKT)) }))).toBe('durch den Markt');
      expect(complementsPhrase(complements({ route: complement(np(HAUS)) }))).toBe('durch das Haus');
    });

    test('a path specifier picks the preposition and its case', () => {
      expect(complementsPhrase(complements({ route: complement(np(MARKT), [path('around')]) }))).toBe('um den Markt');
      expect(complementsPhrase(complements({ route: complement(np(MARKT), [path('under')]) }))).toBe('unter dem Markt');
      expect(complementsPhrase(complements({ route: complement(np(MARKT), [path('over')]) }))).toBe('über dem Markt');
      expect(complementsPhrase(complements({ route: complement(np(MARKT), [path('in')]) }))).toBe('im Markt');
    });
  });

  describe('locative', () => {
    test('defaults to "in" + dative, fused to "im"', () => {
      expect(complementsPhrase(complements({ locative: complement(np(HAUS)) }))).toBe('im Haus');
      expect(complementsPhrase(complements({ locative: complement(np(HAUS, { definiteness: 'indefinite' })) }))).toBe('in einem Haus');
      expect(complementsPhrase(complements({ locative: complement(np(HAUS, { number: 'plural' })) }))).toBe('in den Häusern');
      expect(complementsPhrase(complements({ locative: complement(np(EUROPA)) }))).toBe('in Europa');
    });

    test('a path specifier picks the preposition and its case', () => {
      expect(complementsPhrase(complements({ locative: complement(np(HAUS), [path('behind')]) }))).toBe('hinter dem Haus');
      expect(complementsPhrase(complements({ locative: complement(np(HAUS), [path('in_front_of')]) }))).toBe('vor dem Haus');
      expect(complementsPhrase(complements({ locative: complement(np(HAUS), [path('around')]) }))).toBe('um das Haus');
      expect(complementsPhrase(complements({ locative: complement(np(KATZE), [path('behind')]) }))).toBe('hinter der Katze');
    });

    // Fixed A41: HOME in plain containment is the fixed "zu Hause" — no "im", no dative on the
    // hearth-word "Zuhause" — and any other determiner, an adjective or a relation keeps the place.
    test('HOME takes the "zu Hause" idiom; a marked determiner, adjective or relation keeps the place', () => {
      const ZUHAUSE: Forms = { base: 'Zuhause', plural: 'Zuhause', gender: 'neut', count: 'singular' };
      const home = (extra: Forms = {}, rest: Parameters<typeof np>[2] = {}) =>
        ({ ...np(ZUHAUSE, extra, rest), head: concept({ ...ZUHAUSE, ...extra }, 'HOME') });
      const at = (c: Parameters<typeof complement>[0], specifiers: Specifier[] = []) =>
        complementsPhrase(complements({ locative: complement(c, specifiers) }));
      expect(at(home())).toBe('zu Hause');
      expect(at(home({ definiteness: 'bare' }))).toBe('zu Hause');
      expect(at(el(home(), np(MARKT)))).toBe('zu Hause und im Markt');
      expect(at(home({ definiteness: 'indefinite' }))).toBe('in einem Zuhause');
      expect(at(home({}, { adjectives: [adj(GROSS)] }))).toBe('im großen Zuhause');
      expect(at(home(), [path('behind')])).toBe('hinter dem Zuhause');
    });
  });

  describe('cause', () => {
    // "wegen" formally governs the genitive; the colloquial dative is a documented simplification (B09).
    test('neutral is "wegen" and positive "dank", both with the dative', () => {
      expect(complementsPhrase(complements({ cause: complement(np(MANN)) }))).toBe('wegen dem Mann');
      expect(complementsPhrase(complements({ cause: complement(np(MANN), [sentiment('positive')]) }))).toBe('dank dem Mann');
    });

    test('a negative noun cause hangs a genitive off "durch die Schuld"', () => {
      const negative = [sentiment('negative')];
      expect(complementsPhrase(complements({ cause: complement(np(MANN), negative) }))).toBe('durch die Schuld des Mannes');
      expect(complementsPhrase(complements({ cause: complement(np(KATZE), negative) }))).toBe('durch die Schuld der Katze');
      expect(complementsPhrase(complements({ cause: complement(np(MANN, { number: 'plural' }), negative) }))).toBe('durch die Schuld der Männer');
    });

    test('a pronoun cause takes its dative form with no article', () => {
      expect(complementsPhrase(complements({ cause: complement(np(ER)) }))).toBe('wegen ihm');
      expect(complementsPhrase(complements({ cause: complement(np(DU), [sentiment('positive')]) }))).toBe('dank dir');
      expect(complementsPhrase(complements({ cause: complement(np(ICH, { number: 'plural', disjunctive: 'uns' }), [sentiment('positive')]) })))
        .toBe('dank uns');
    });

    // The possessive agrees with feminine "Schuld", and picks its stem by the pronoun's person/number/gender.
    test('a negative pronoun cause is "durch <possessive> Schuld"', () => {
      const blame = (forms: Forms, extra: Forms = {}) =>
        complementsPhrase(complements({ cause: complement(np(forms, extra), [sentiment('negative')]) }));
      expect(blame(ICH)).toBe('durch meine Schuld');
      expect(blame(DU)).toBe('durch deine Schuld');
      expect(blame(ER)).toBe('durch seine Schuld');
      expect(blame(ER, { gender: 'neut' })).toBe('durch seine Schuld');
      expect(blame(ER, { gender: 'fem' })).toBe('durch ihre Schuld');
      expect(blame(ICH, { number: 'plural' })).toBe('durch unsere Schuld');
      expect(blame(DU, { number: 'plural' })).toBe('durch eure Schuld');
      expect(blame(ER, { number: 'plural' })).toBe('durch ihre Schuld');
    });
  });

  describe('the complement noun phrase', () => {
    test('its adjectives decline for the case the preposition governs', () => {
      expect(complementsPhrase(complements({
        locative: complement(np(HAUS, { definiteness: 'indefinite' }, { adjectives: [adj(KLEIN)] })),
      }))).toBe('in einem kleinen Haus');
      expect(complementsPhrase(complements({
        direction: complement(np(HAUS, { number: 'plural' }, { adjectives: [adj(GROSS)] })),
      }))).toBe('zu den großen Häusern');
      expect(complementsPhrase(complements({ route: complement(np(MARKT, {}, { adjectives: [adj(GROSS)] })) }))).toBe('durch den großen Markt');
      expect(complementsPhrase(complements({
        instrumental: complement(np(WASSER, { definiteness: 'bare' }, { adjectives: [adj(GUT)] })),
      }))).toBe('mit gutem Wasser');
    });

    test('an attributive noun closes into a compound', () => {
      expect(complementsPhrase(complements({ direction: complement(np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] })) })))
        .toBe('zum Segelboot');
    });

    test('a relative clause trails the noun', () => {
      const burning = np(HAUS, {}, { relative: { headRole: 'subject', verbPhrase: vp(BRENNEN) } });
      expect(complementsPhrase(complements({ locative: complement(burning) }))).toBe('im Haus, das brennt,');
    });
  });

  describe('order and coordination', () => {
    test('several complements render in the fixed order, whatever the map order', () => {
      expect(complementsPhrase(complements({
        cause: complement(np(WIND)),
        direction: complement(np(MARKT)),
        source: complement(np(HAUS)),
        manner: complement(np(GESCHWINDIGKEIT, { definiteness: 'bare' }, { adjectives: [adj(HOCH)] })),
      }))).toBe('mit hoher Geschwindigkeit aus dem Haus zum Markt wegen dem Wind');
      expect(complementsPhrase(complements({
        locative: complement(np(HAUS)),
        instrumental: complement(np(MESSER)),
        terminus: complement(np(KATZE)),
      }))).toBe('der Katze mit dem Messer im Haus');
    });

    test('each conjunct repeats the preposition and declines on its own article', () => {
      expect(complementsPhrase(complements({ direction: complement(el(np(MARKT), np(KATZE))) }))).toBe('zum Markt und zur Katze');
      expect(complementsPhrase(complements({
        locative: complement(group('or', np(HAUS), np(MARKT, { definiteness: 'indefinite' }))),
      }))).toBe('im Haus oder in einem Markt');
      expect(complementsPhrase(complements({ instrumental: complement(el(np(MESSER), np(WORT), np(WASSER))) })))
        .toBe('mit dem Messer, mit dem Wort und mit dem Wasser');
    });

    test('a negative or pronoun cause puts its connector once before the group', () => {
      expect(complementsPhrase(complements({ cause: complement(el(np(MANN), np(KATZE)), [sentiment('negative')]) })))
        .toBe('durch die Schuld des Mannes und der Katze');
      expect(complementsPhrase(complements({ cause: complement(el(np(ICH), np(DU)), [sentiment('positive')]) }))).toBe('dank mir und dir');
    });
  });
});
