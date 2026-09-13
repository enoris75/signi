import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, PathSpecifier, Specifier } from '@signi/shared';
import { complementsPhrase } from './complementsPhrase.js';
import {
  adj, AFRICA, BEAUTIFUL, BIG, BOY, CARE, CAT, CHILD, CHOOSE, complement, complements, concept, CRY, DOG, el, EUROPE, FAST, type Forms,
  FOX, GOOD, group, HAPPY, HE, HIGH, HOUSE, I, LEGEND, np, OBJECT, SEEM, SHE, SPEED, STICK, TIRED, vp, WAY, WE, WORD,
} from './en.fixtures.js';

const MARKET: Forms = { base: 'market', plural: 'markets', count: 'singular' };
const BURN: Forms = { base: 'burn', '3sg_present': 'burns', '3pl_present': 'burn', past: 'burned' };

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

describe('complementsPhrase', () => {
  test('renders nothing without complements', () => {
    expect(complementsPhrase()).toBe('');
    expect(complementsPhrase({})).toBe('');
  });

  describe('predicative', () => {
    test('a predicate adjective takes no article but keeps its degree', () => {
      const predicate = (forms: Forms, degree?: string) =>
        complementsPhrase(complements({ predicative: complement(np(forms, degree ? { degree } : {})) }));
      expect(predicate(TIRED)).toBe('tired');
      expect(predicate(HAPPY, 'more')).toBe('happier');
      expect(predicate(BEAUTIFUL, 'more')).toBe('more beautiful');
      expect(predicate(HAPPY, 'less')).toBe('less happy');
      expect(predicate(HAPPY, 'equally')).toBe('equally happy');
    });

    test('a predicate noun keeps its own article, with no preposition', () => {
      expect(complementsPhrase(complements({ predicative: complement(np(LEGEND, { definiteness: 'indefinite' })) }))).toBe('a legend');
      expect(complementsPhrase(complements({ predicative: complement(np(CAT)) }))).toBe('the cat');
    });

    test('coordinated predicates render conjunct by conjunct', () => {
      expect(complementsPhrase(complements({ predicative: complement(group('or', np(HAPPY), np(TIRED))) }))).toBe('happy or tired');
      expect(complementsPhrase(complements({
        predicative: complement(el(np(LEGEND, { definiteness: 'indefinite' }), np(OBJECT, { definiteness: 'indefinite' }))),
      }))).toBe('a legend and an object');
    });

    test('a predicate noun may carry a relative clause', () => {
      const legend = np(LEGEND, { definiteness: 'indefinite' }, { relative: { headRole: 'subject', verbPhrase: vp(BURN) } });
      expect(complementsPhrase(complements({ predicative: complement(legend) }))).toBe('a legend that burns');
    });

    // A46: a seeming verb takes a predicate noun only through "to be", which carries a mixed group.
    test('under a seeming verb a predicate noun takes the infinitival copula', () => {
      const under = (phrase: Parameters<typeof complement>[0], verb: Forms) =>
        complementsPhrase(complements({ predicative: complement(phrase) }), verb);
      expect(under(np(LEGEND, { definiteness: 'indefinite' }), SEEM)).toBe('to be a legend');
      expect(under(el(np(TIRED), np(LEGEND, { definiteness: 'indefinite' })), SEEM)).toBe('to be tired and a legend');
      expect(under(np(TIRED), SEEM)).toBe('tired');
      expect(under(np(LEGEND, { definiteness: 'indefinite' }), BURN)).toBe('a legend');
    });

    test('the copula stays with the predicate, ahead of the other complements', () => {
      expect(complementsPhrase(complements({
        predicative: complement(np(LEGEND, { definiteness: 'indefinite' })), locative: complement(np(MARKET)),
      }), SEEM)).toBe('to be a legend in the market');
    });
  });

  describe('terminus', () => {
    test('is "to" + the recipient', () => {
      expect(complementsPhrase(complements({ terminus: complement(np(DOG)) }))).toBe('to the dog');
      expect(complementsPhrase(complements({ terminus: complement(np(BOY, { definiteness: 'indefinite' })) }))).toBe('to a boy');
      expect(complementsPhrase(complements({ terminus: complement(np(CHILD, { number: 'plural' })) }))).toBe('to the children');
    });
  });

  describe('instrumental', () => {
    test('an object instrument is "with" + the noun phrase', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(STICK)) }))).toBe('with the stick');
      expect(complementsPhrase(complements({ instrumental: complement(np(STICK, { definiteness: 'indefinite' })) }))).toBe('with a stick');
    });

    test('a process instrument is "by" + the gerund, keeping the verb’s object and adverb', () => {
      const byChoosing = (phrase: Parameters<typeof complement>[0], action = vp(CHOOSE)) =>
        complementsPhrase(complements({ instrumental: complement(phrase, [abstraction('process')], action) }));
      expect(byChoosing(np(STICK))).toBe('by choosing the stick');
      expect(byChoosing(np(STICK), vp(CHOOSE, { modifier: concept(FAST) }))).toBe('by choosing the stick fast');
      expect(byChoosing(el(np(STICK), np(WORD, { definiteness: 'indefinite' })))).toBe('by choosing the stick and a word');
    });

    // The concept level makes the gerund a noun: it takes "the" and reaches its object through "of".
    test('a concept instrument nominalises the gerund with an of-object', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(STICK), [abstraction('concept')], vp(CHOOSE)) })))
        .toBe('with the choosing of the stick');
      expect(complementsPhrase(complements({
        instrumental: complement(np(WORD, { definiteness: 'indefinite' }), [abstraction('concept')], vp(CHOOSE)),
      }))).toBe('with the choosing of a word');
    });

    test('falls back to the plain object at the object level or without an action', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(STICK), [abstraction('object')], vp(CHOOSE)) })))
        .toBe('with the stick');
      expect(complementsPhrase(complements({ instrumental: complement(np(STICK), [abstraction('process')]) }))).toBe('with the stick');
    });
  });

  describe('manner', () => {
    test('a noun with no manner relation is similative "like"', () => {
      expect(complementsPhrase(complements({ manner: complement(np(FOX)) }))).toBe('like the fox');
    });

    test('means takes "with", measure "at", mode "in"', () => {
      expect(complementsPhrase(complements({ manner: complement(np(CARE, { definiteness: 'bare' })) }))).toBe('with care');
      expect(complementsPhrase(complements({ manner: complement(np(SPEED, { definiteness: 'bare' }, { adjectives: [adj(HIGH)] })) })))
        .toBe('at high speed');
      expect(complementsPhrase(complements({ manner: complement(np(SPEED)) }))).toBe('at the speed');
      expect(complementsPhrase(complements({ manner: complement(np(WAY, { definiteness: 'indefinite' }, { adjectives: [adj(GOOD)] })) })))
        .toBe('in a good way');
    });
  });

  describe('source and direction', () => {
    test('source is "from"', () => {
      expect(complementsPhrase(complements({ source: complement(np(HOUSE)) }))).toBe('from the house');
      expect(complementsPhrase(complements({ source: complement(np(AFRICA)) }))).toBe('from Africa');
    });

    test('direction is "to"', () => {
      expect(complementsPhrase(complements({ direction: complement(np(MARKET)) }))).toBe('to the market');
      expect(complementsPhrase(complements({ direction: complement(np(MARKET, { number: 'plural', definiteness: 'indefinite' })) })))
        .toBe('to markets');
      expect(complementsPhrase(complements({ direction: complement(np(MARKET, { definiteness: 'no' })) }))).toBe('to no market');
    });
  });

  describe('route', () => {
    test('defaults to "through"', () => {
      expect(complementsPhrase(complements({ route: complement(np(MARKET)) }))).toBe('through the market');
    });

    test('a path specifier picks the preposition', () => {
      const route = (value: PathSpecifier) => complementsPhrase(complements({ route: complement(np(MARKET), [path(value)]) }));
      expect(route('under')).toBe('under the market');
      expect(route('over')).toBe('over the market');
      expect(route('around')).toBe('around the market');
      expect(route('behind')).toBe('behind the market');
      expect(route('in_front_of')).toBe('in front of the market');
      expect(route('in')).toBe('in the market');
    });
  });

  describe('locative', () => {
    test('defaults to "in"', () => {
      expect(complementsPhrase(complements({ locative: complement(np(HOUSE)) }))).toBe('in the house');
      expect(complementsPhrase(complements({ locative: complement(np(HOUSE, { definiteness: 'indefinite' })) }))).toBe('in a house');
      expect(complementsPhrase(complements({ locative: complement(np(EUROPE)) }))).toBe('in Europe');
    });

    test('a path specifier picks the preposition', () => {
      expect(complementsPhrase(complements({ locative: complement(np(HOUSE), [path('under')]) }))).toBe('under the house');
      expect(complementsPhrase(complements({ locative: complement(np(HOUSE, { number: 'plural' }), [path('behind')]) }))).toBe('behind the houses');
      expect(complementsPhrase(complements({ locative: complement(np(HOUSE), [path('in_front_of')]) }))).toBe('in front of the house');
    });

    // Fixed A41: HOME in plain containment is the fixed idiom "at home"; any determiner other than
    // the definite/bare one, a plural, a modifier or a relation makes it an ordinary place again.
    describe('HOME takes the "at home" idiom', () => {
      const HOME_FORMS: Forms = { base: 'home', plural: 'homes', count: 'singular' };
      const home = (extra: Forms = {}, rest: Parameters<typeof np>[2] = {}) =>
        ({ ...np(HOME_FORMS, extra, rest), head: concept({ ...HOME_FORMS, ...extra }, 'HOME') });
      const at = (c: Parameters<typeof complement>[0], specifiers: Specifier[] = []) =>
        complementsPhrase(complements({ locative: complement(c, specifiers) }));

      test('in plain containment, under the definite or bare determiner', () => {
        expect(at(home())).toBe('at home');
        expect(at(home({ definiteness: 'bare' }))).toBe('at home');
        expect(at(home(), [path('in')])).toBe('at home');
      });

      test('a marked determiner, a plural, an adjective or a relation keeps the ordinary place', () => {
        expect(at(home({ definiteness: 'indefinite' }))).toBe('in a home');
        expect(at(home({ number: 'plural' }))).toBe('in the homes');
        expect(at(home({}, { adjectives: [adj(BIG)] }))).toBe('in the big home');
        expect(at(home(), [path('under')])).toBe('under the home');
      });

      test('a group holding the idiom gives every conjunct its own preposition', () => {
        expect(at(el(home(), np(MARKET)))).toBe('at home and in the market');
        expect(at(group('or', np(MARKET), home()))).toBe('in the market or at home');
        // …while a group without it still shares one preposition.
        expect(at(el(np(HOUSE), np(MARKET)))).toBe('in the house and the market');
      });

      test('only the concept HOME — the same word under another concept is an ordinary place', () => {
        expect(at(np(HOME_FORMS))).toBe('in the home');
      });
    });
  });

  describe('cause', () => {
    test('the sentiment picks the connector', () => {
      expect(complementsPhrase(complements({ cause: complement(np(DOG)) }))).toBe('because of the dog');
      expect(complementsPhrase(complements({ cause: complement(np(DOG), [sentiment('neutral')]) }))).toBe('because of the dog');
      expect(complementsPhrase(complements({ cause: complement(np(DOG), [sentiment('positive')]) }))).toBe('thanks to the dog');
      expect(complementsPhrase(complements({ cause: complement(np(DOG, { number: 'plural' }), [sentiment('negative')]) })))
        .toBe('through the fault of the dogs');
    });

    test('a pronoun cause takes its oblique form with no article', () => {
      expect(complementsPhrase(complements({ cause: complement(np(HE)) }))).toBe('because of him');
      expect(complementsPhrase(complements({ cause: complement(np(SHE), [sentiment('positive')]) }))).toBe('thanks to her');
      expect(complementsPhrase(complements({ cause: complement(np(WE), [sentiment('positive')]) }))).toBe('thanks to us');
      // The chosen negative surface (B02, fixed) keeps the one "<connector> <oblique>" shape.
      expect(complementsPhrase(complements({ cause: complement(np(HE), [sentiment('negative')]) }))).toBe('through the fault of him');
    });

    test('coordinated pronouns share one connector', () => {
      expect(complementsPhrase(complements({ cause: complement(el(np(HE), np(I))) }))).toBe('because of him and me');
    });

    test('a group mixing nouns and pronouns renders each conjunct in its own form under the one connector', () => {
      expect(complementsPhrase(complements({ cause: complement(el(np(DOG), np(HE))) }))).toBe('because of the dog and him');
      expect(complementsPhrase(complements({ cause: complement(el(np(SHE), np(DOG)), [sentiment('negative')]) }))).toBe('through the fault of her and the dog');
    });
  });

  describe('the complement noun phrase', () => {
    test('keeps its adjectives, possessor and relative clause', () => {
      expect(complementsPhrase(complements({ locative: complement(np(HOUSE, { definiteness: 'indefinite' }, { adjectives: [adj(BIG)] })) })))
        .toBe('in a big house');
      expect(complementsPhrase(complements({ direction: complement(np(HOUSE, {}, { possessor: np(CAT) })) }))).toBe("to the cat's house");
      expect(complementsPhrase(complements({ terminus: complement(np(BOY, {}, { relative: { headRole: 'subject', verbPhrase: vp(CRY) } })) })))
        .toBe('to the boy who cries');
    });
  });

  describe('order and coordination', () => {
    test('several complements render in the fixed order, whatever the map order', () => {
      expect(complementsPhrase(complements({
        cause: complement(np(DOG)),
        direction: complement(np(MARKET)),
        source: complement(np(HOUSE)),
      }))).toBe('from the house to the market because of the dog');
      expect(complementsPhrase(complements({
        locative: complement(np(HOUSE)),
        instrumental: complement(np(STICK)),
        terminus: complement(np(DOG)),
      }))).toBe('to the dog with the stick in the house');
    });

    test('the preposition is emitted once, before the whole group', () => {
      expect(complementsPhrase(complements({ direction: complement(el(np(MARKET), np(HOUSE))) }))).toBe('to the market and the house');
      expect(complementsPhrase(complements({ instrumental: complement(group('or', np(STICK), np(WORD, { definiteness: 'indefinite' }))) })))
        .toBe('with the stick or a word');
    });
  });
});
