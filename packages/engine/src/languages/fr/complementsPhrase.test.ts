import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, PathSpecifier, Specifier } from '@signi/shared';
import { complementsPhrase } from './complementsPhrase.js';
import {
  AFRIQUE, ANGE, ANTARCTIQUE, ASIE, BATON, BON, CHAT, CHIEN, CHOISIR, complement, complements, concept, el, ENFANT, EUROPE,
  FATIGUE, FEMME, type Forms, FOYER, GRAND, group, HEUREUX, HOMME, IL, INTERESSANT, JE, LEGENDE, LENTEMENT, LUMIERE, MAISON,
  MANGER, MANIERE, MARCHE, MOT, NOURRITURE, np, PETIT, PHRASE, PRISON, RENARD, SAVOIR, SOIN, SOURIS, TRISTE, TU, VITESSE, vp,
} from './fr.fixtures.js';

const BRULER: Forms = { base: 'brûler', '3sg_present': 'brûle' };

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

// The translator threads the gendered/plural tonic form onto `disjunctive`.
const ELLE: Forms = { ...IL, gender: 'fem', base: 'elle', disjunctive: 'elle' };
const EUX: Forms = { ...IL, number: 'plural', base: 'ils', disjunctive: 'eux' };

describe('complementsPhrase', () => {
  test('renders nothing without complements', () => {
    expect(complementsPhrase()).toBe('');
    expect(complementsPhrase({})).toBe('');
  });

  describe('predicative', () => {
    const predicate = (phrase: Parameters<typeof complement>[0], subject: Forms = CHAT) =>
      complementsPhrase(complements({ predicative: complement(phrase) }), subject);

    test('a predicate adjective agrees with the subject', () => {
      expect(complementsPhrase(complements({ predicative: complement(np(FATIGUE)) }))).toBe('fatigué');
      expect(predicate(np(FATIGUE), FEMME)).toBe('fatiguée');
      expect(predicate(np(HEUREUX), { ...CHAT, number: 'plural' })).toBe('heureux');
      expect(predicate(np(HEUREUX), { ...FEMME, number: 'plural' })).toBe('heureuses');
    });

    test('a compared predicate adjective carries its degree', () => {
      expect(predicate(np(HEUREUX, { degree: 'more' }), FEMME)).toBe('plus heureuse');
      expect(predicate(np(HEUREUX, { degree: 'less' }), FEMME)).toBe('moins heureuse');
      expect(predicate(np(HEUREUX, { degree: 'equally' }), FEMME)).toBe('aussi heureuse');
      expect(predicate({ ...np(BON), head: concept({ ...BON, degree: 'more' }, 'GOOD') }, FEMME)).toBe('meilleure');
    });

    // "semble le plus heureux" — without it the superlative would read as the comparative.
    test('a predicative superlative supplies its own article, agreeing with the subject', () => {
      expect(predicate(np(HEUREUX, { degree: 'most' }))).toBe('le plus heureux');
      expect(predicate(np(HEUREUX, { degree: 'most' }), FEMME)).toBe('la plus heureuse');
      expect(predicate(np(HEUREUX, { degree: 'least' }), { ...FEMME, number: 'plural' })).toBe('les moins heureuses');
    });

    test('a predicate noun keeps its own determiner and no preposition', () => {
      expect(predicate(np(LEGENDE, { definiteness: 'indefinite' }))).toBe('une légende');
      expect(predicate(np(ANGE, { definiteness: 'indefinite' }))).toBe('un ange');
    });

    test('coordinated predicate adjectives each agree with the subject', () => {
      expect(predicate(el(np(HEUREUX), np(FATIGUE)), { ...FEMME, number: 'plural' })).toBe('heureuses et fatiguées');
      expect(predicate(group('or', np(TRISTE), np(FATIGUE)), FEMME)).toBe('triste ou fatiguée');
    });
  });

  describe('terminus', () => {
    test('is à, fused with a definite article', () => {
      expect(complementsPhrase(complements({ terminus: complement(np(CHIEN)) }))).toBe('au chien');
      expect(complementsPhrase(complements({ terminus: complement(np(SOURIS)) }))).toBe('à la souris');
      expect(complementsPhrase(complements({ terminus: complement(np(HOMME)) }))).toBe("à l'homme");
      expect(complementsPhrase(complements({ terminus: complement(np(CHAT, { number: 'plural' })) }))).toBe('aux chats');
    });

    // A71: a possessive replaces the article, so the preposition stands alone before it.
    test('a possessive follows the bare preposition', () => {
      expect(complementsPhrase(complements({ terminus: complement(np(CHIEN, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })) }))).toBe('à mon chien');
      expect(complementsPhrase(complements({ locative: complement(np(MAISON, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })) }))).toBe('dans ma maison');
    });

    test('any other determiner follows a plain à', () => {
      expect(complementsPhrase(complements({ terminus: complement(np(CHIEN, { definiteness: 'indefinite' })) }))).toBe('à un chien');
      expect(complementsPhrase(complements({ terminus: complement(np(CHAT, { definiteness: 'some', number: 'plural' })) }))).toBe('à quelques chats');
    });
  });

  describe('instrumental', () => {
    const aWord = np(MOT, { definiteness: 'indefinite' });

    test('an object instrument is avec + its determiner', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(BATON)) }))).toBe('avec le bâton');
      expect(complementsPhrase(complements({ instrumental: complement(np(BATON, { definiteness: 'indefinite' })) }))).toBe('avec un bâton');
      expect(complementsPhrase(complements({ instrumental: complement(np(MOT, { definiteness: 'indefinite', number: 'plural' })) })))
        .toBe('avec des mots');
    });

    test('a bare instrument takes the indefinite or partitive article (A149)', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(MOT, { definiteness: 'bare', number: 'plural' })) })))
        .toBe('avec des mots');
      expect(complementsPhrase(complements({ instrumental: complement(np(NOURRITURE, { definiteness: 'bare' })) })))
        .toBe('avec de la nourriture');
      expect(complementsPhrase(complements({
        instrumental: complement(np(BATON, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })),
      }))).toBe('avec mon bâton');
    });

    test('while a bare manner of means keeps avec alone', () => {
      expect(complementsPhrase(complements({ manner: complement(np(SOIN, { definiteness: 'bare' })) }))).toBe('avec soin');
    });

    test('a process instrument is the gérondif, built on the nous stem, before its object', () => {
      expect(complementsPhrase(complements({ instrumental: complement(aWord, [abstraction('process')], vp(CHOISIR)) })))
        .toBe('en choisissant un mot');
      expect(complementsPhrase(complements({ instrumental: complement(np(NOURRITURE), [abstraction('process')], vp(MANGER)) })))
        .toBe('en mangeant la nourriture');
      expect(complementsPhrase(complements({
        instrumental: complement(el(aWord, np(PHRASE, { definiteness: 'indefinite' })), [abstraction('process')], vp(CHOISIR)),
      }))).toBe('en choisissant un mot et une phrase');
    });

    test('the action’s adverb closes the gérondif phrase', () => {
      expect(complementsPhrase(complements({
        instrumental: complement(aWord, [abstraction('process')], vp(CHOISIR, { modifier: concept(LENTEMENT) })),
      }))).toBe('en choisissant un mot lentement');
    });

    test('être, avoir and savoir take an irregular participle stem', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(MOT), [abstraction('process')], vp(SAVOIR, {}, 'KNOW')) })))
        .toBe('en sachant le mot');
    });

    // French has no productive substantivized infinitive to reify the act with.
    test('a concept instrument is avec le fait de + the infinitive', () => {
      expect(complementsPhrase(complements({ instrumental: complement(aWord, [abstraction('concept')], vp(CHOISIR)) })))
        .toBe('avec le fait de choisir un mot');
    });

    test('falls back to the plain object at the object level or without an action', () => {
      expect(complementsPhrase(complements({ instrumental: complement(np(BATON), [abstraction('object')], vp(CHOISIR)) }))).toBe('avec le bâton');
      expect(complementsPhrase(complements({ instrumental: complement(aWord, [abstraction('process')]) }))).toBe('avec un mot');
    });
  });

  describe('manner', () => {
    test('a noun with no manner relation is similative comme', () => {
      expect(complementsPhrase(complements({ manner: complement(np(RENARD)) }))).toBe('comme le renard');
      expect(complementsPhrase(complements({ manner: complement(np(RENARD, { definiteness: 'indefinite' })) }))).toBe('comme un renard');
    });

    test('means is avec', () => {
      expect(complementsPhrase(complements({ manner: complement(np(SOIN, { definiteness: 'bare' })) }))).toBe('avec soin');
      expect(complementsPhrase(complements({ manner: complement(np(SOIN, { definiteness: 'bare' }, { adjectives: [concept(GRAND, 'BIG')] })) })))
        .toBe('avec grand soin');
    });

    test('measure is à, fused with a definite article', () => {
      expect(complementsPhrase(complements({ manner: complement(np(VITESSE, {}, { possessor: np(LUMIERE) })) })))
        .toBe('à la vitesse de la lumière');
      expect(complementsPhrase(complements({ manner: complement(np(VITESSE, { definiteness: 'bare' }, { adjectives: [concept(GRAND, 'BIG')] })) })))
        .toBe('à grande vitesse');
    });

    test('mode is de, fused with a definite article or elided', () => {
      expect(complementsPhrase(complements({
        manner: complement(np(MANIERE, { definiteness: 'indefinite' }, { adjectives: [concept(BON, 'GOOD')] })),
      }))).toBe("d'une bonne manière");
      expect(complementsPhrase(complements({ manner: complement(np(MANIERE, { definiteness: 'this' })) }))).toBe('de cette manière');
    });
  });

  describe('source', () => {
    test('is de, fused with a definite article', () => {
      expect(complementsPhrase(complements({ source: complement(np(MAISON)) }))).toBe('de la maison');
      expect(complementsPhrase(complements({ source: complement(np(MARCHE)) }))).toBe('du marché');
      expect(complementsPhrase(complements({ source: complement(np(HOMME)) }))).toBe("de l'homme");
      expect(complementsPhrase(complements({ source: complement(np(MAISON, { number: 'plural' })) }))).toBe('des maisons');
    });

    test('before an indefinite de elides, and the plural des drops', () => {
      expect(complementsPhrase(complements({ source: complement(np(MAISON, { definiteness: 'indefinite' })) }))).toBe("d'une maison");
      expect(complementsPhrase(complements({ source: complement(np(MAISON, { definiteness: 'indefinite', number: 'plural' })) })))
        .toBe('de maisons');
    });

    // Bare "de" after a self-propelled motion verb would read as a goal or a partitive.
    test('only a self-propelled motion verb prefixes loin', () => {
      expect(complementsPhrase(complements({ source: complement(np(ENFANT)) }), {}, 'RUN')).toBe("loin de l'enfant");
      expect(complementsPhrase(complements({ source: complement(np(MAISON)) }), {}, 'JUMP')).toBe('loin de la maison');
      expect(complementsPhrase(complements({ source: complement(np(MAISON)) }), {}, 'COME')).toBe('de la maison');
    });

    // A89: a feminine continent of origin drops its article; Antarctique and "loin de" keep it.
    test('a feminine continent takes a bare de, eliding before its vowel', () => {
      expect(complementsPhrase(complements({ source: complement(np(EUROPE)) }), {}, 'COME')).toBe("d'Europe");
      expect(complementsPhrase(complements({ source: complement(el(np(AFRIQUE), np(ASIE))) }), {}, 'COME')).toBe("d'Afrique et d'Asie");
      expect(complementsPhrase(complements({ source: complement(np(ANTARCTIQUE)) }), {}, 'COME')).toBe("de l'Antarctique");
      expect(complementsPhrase(complements({ source: complement(np(EUROPE)) }), {}, 'RUN')).toBe("loin de l'Europe");
    });

    // Every seeded continent opens on a vowel; a hand-built one checks the unelided form.
    test('a feminine continent opening on a consonant keeps de whole', () => {
      const LAURASIE: Forms = { base: 'Laurasie', gender: 'fem', count: 'singular', proper: '1', uncountable: '1', isA: 'CONTINENT' };
      expect(complementsPhrase(complements({ source: complement(np(LAURASIE)) }), {}, 'COME')).toBe('de Laurasie');
    });
  });

  describe('direction', () => {
    test('a place goal is à, fused with a definite article', () => {
      expect(complementsPhrase(complements({ direction: complement(np(MARCHE)) }))).toBe('au marché');
      expect(complementsPhrase(complements({ direction: complement(np(MAISON)) }))).toBe('à la maison');
      expect(complementsPhrase(complements({ direction: complement(np(MAISON, { definiteness: 'indefinite' })) }))).toBe('à une maison');
    });

    test('an animate goal takes vers, which fuses with nothing', () => {
      expect(complementsPhrase(complements({ direction: complement(np(CHIEN)) }))).toBe('vers le chien');
      expect(complementsPhrase(complements({ direction: complement(np(ENFANT)) }))).toBe("vers l'enfant");
      expect(complementsPhrase(complements({ direction: complement(np(CHAT, { number: 'plural' })) }))).toBe('vers les chats');
    });

    test('a continent goal takes a bare en', () => {
      expect(complementsPhrase(complements({ direction: complement(np(EUROPE)) }))).toBe('en Europe');
      expect(complementsPhrase(complements({ direction: complement(np(ANTARCTIQUE)) }))).toBe('en Antarctique');
    });

    // A165: a possessive leading the continent takes the article-bearing "dans" in both the goal and
    // the place, and the plain "de" of its source; the name's article gives way to it.
    test('a possessed continent takes dans, and the possessive\'s de', () => {
      const yours = { possessor: { kind: 'pronominal', person: '2', number: 'singular' } } as const;
      expect(complementsPhrase(complements({ direction: complement(np(ASIE, {}, yours)) }))).toBe('dans ton Asie');
      expect(complementsPhrase(complements({ locative: complement(np(EUROPE, {}, yours)) }))).toBe('dans ton Europe');
      expect(complementsPhrase(complements({ source: complement(np(ANTARCTIQUE, {}, yours)) }), {}, 'COME')).toBe('de ton Antarctique');
      expect(complementsPhrase(complements({ terminus: complement(np(ASIE, {}, yours)) }))).toBe('à ton Asie');
    });
  });

  describe('route', () => {
    test('defaults to à travers', () => {
      expect(complementsPhrase(complements({ route: complement(np(MARCHE)) }))).toBe('à travers le marché');
      expect(complementsPhrase(complements({ route: complement(np(MAISON, { definiteness: 'indefinite' })) }))).toBe('à travers une maison');
    });

    test('a path specifier picks the preposition', () => {
      expect(complementsPhrase(complements({ route: complement(np(MARCHE), [path('under')]) }))).toBe('sous le marché');
      expect(complementsPhrase(complements({ route: complement(np(MARCHE), [path('over')]) }))).toBe('par-dessus le marché');
      expect(complementsPhrase(complements({ route: complement(np(MAISON), [path('around')]) }))).toBe('autour de la maison');
      expect(complementsPhrase(complements({ route: complement(np(MAISON), [path('in')]) }))).toBe('dans la maison');
    });
  });

  describe('locative', () => {
    test('defaults to dans', () => {
      expect(complementsPhrase(complements({ locative: complement(np(MAISON)) }))).toBe('dans la maison');
      expect(complementsPhrase(complements({ locative: complement(np(MAISON, { definiteness: 'indefinite' })) }))).toBe('dans une maison');
      expect(complementsPhrase(complements({ locative: complement(np(MAISON, { number: 'plural' })) }))).toBe('dans les maisons');
    });

    // A352: a personal pronoun is "en lui"; an indefinite or thing pronoun goes "dans" like a noun.
    test('a personal pronoun takes en, an indefinite or thing pronoun dans', () => {
      const QUELQUE_CHOSE: Forms = { base: 'quelque chose', person: '3', number: 'singular', thing: '1', indefinite: '1', disjunctive: 'quelque chose' };
      expect(complementsPhrase(complements({ locative: complement(np(IL)) }))).toBe('en lui');
      expect(complementsPhrase(complements({ locative: complement(np(QUELQUE_CHOSE)) }))).toBe('dans quelque chose');
    });

    test('a continent in plain containment is a bare en', () => {
      expect(complementsPhrase(complements({ locative: complement(np(EUROPE)) }))).toBe('en Europe');
      expect(complementsPhrase(complements({ locative: complement(np(AFRIQUE), [path('in')]) }))).toBe('en Afrique');
    });

    // A169: "en" fits the bare name alone; a prenominal adjective brings back the article and "dans".
    test('a continent behind a prenominal adjective takes dans and its article', () => {
      const bigEurope = np(EUROPE, {}, { adjectives: [concept(GRAND, 'BIG')] });
      expect(complementsPhrase(complements({ locative: complement(bigEurope) }))).toBe('dans la grande Europe');
      expect(complementsPhrase(complements({ direction: complement(bigEurope) }))).toBe('dans la grande Europe');
      expect(complementsPhrase(complements({ source: complement(bigEurope) }), {}, 'COME')).toBe('de la grande Europe');
    });

    // A188: the superlative repeats the article after the noun ("l'Europe la plus grande"), which is
    // only possible after a first article — so it brings one back, as a prenominal adjective does.
    // The comparative keeps A169's bare "en".
    test('a continent carrying a superlative takes dans and its article; the comparative stays bare', () => {
      const degree = (d: string) => np(EUROPE, {}, { adjectives: [concept({ ...GRAND, degree: d }, 'BIG')] });
      expect(complementsPhrase(complements({ locative: complement(degree('most')) }))).toBe("dans l'Europe la plus grande");
      expect(complementsPhrase(complements({ direction: complement(degree('most')) }))).toBe("dans l'Europe la plus grande");
      expect(complementsPhrase(complements({ source: complement(degree('most')) }), {}, 'COME')).toBe("de l'Europe la plus grande");
      expect(complementsPhrase(complements({ locative: complement(degree('least')) }))).toBe("dans l'Europe la moins grande");
      expect(complementsPhrase(complements({ locative: complement(degree('more')) }))).toBe('en Europe plus grande');
    });

    test('a spatial relation picks its preposition, keeping a continent’s article', () => {
      expect(complementsPhrase(complements({ locative: complement(np(MAISON), [path('behind')]) }))).toBe('derrière la maison');
      expect(complementsPhrase(complements({ locative: complement(np(MAISON), [path('in_front_of')]) }))).toBe('devant la maison');
      expect(complementsPhrase(complements({ locative: complement(np(MAISON), [path('over')]) }))).toBe('au-dessus de la maison');
      expect(complementsPhrase(complements({ locative: complement(np(EUROPE), [path('under')]) }))).toBe("sous l'Europe");
    });

    test('a negative determiner stays on the noun', () => {
      expect(complementsPhrase(complements({ locative: complement(np(MAISON, { definiteness: 'no' })) }))).toBe('dans aucune maison');
    });

    // A219: "dans" needs a determiner, so a bare singular count noun takes "en" ("en prison") and a
    // bare mass noun "dans" + its partitive ("dans de la nourriture"). The bare plural keeps A196's
    // "des".
    test('a bare singular takes en, a bare mass noun dans + its partitive', () => {
      const bare = { definiteness: 'bare' };
      expect(complementsPhrase(complements({ locative: complement(np(PRISON, bare)) }))).toBe('en prison');
      expect(complementsPhrase(complements({ locative: complement(np(PRISON, bare), [path('in')]) }))).toBe('en prison');
      expect(complementsPhrase(complements({ locative: complement(np(NOURRITURE, bare)) }))).toBe('dans de la nourriture');
      expect(complementsPhrase(complements({ locative: complement(np(PRISON, { ...bare, number: 'plural' })) }))).toBe('dans des prisons');
    });

    // Fixed A41: HOME in plain containment is the fixed "à la maison" — the hearth-word "foyer" gives
    // way to "maison" — and any other determiner, a plural or a relation keeps "foyer" as a place.
    test('HOME takes the "à la maison" idiom; a marked determiner, plural or relation keeps the place', () => {
      const home = (extra: Forms = {}) => ({ ...np(FOYER, extra), head: concept({ ...FOYER, ...extra }, 'HOME') });
      const at = (c: Parameters<typeof complement>[0], specifiers: Specifier[] = []) =>
        complementsPhrase(complements({ locative: complement(c, specifiers) }));
      expect(at(home())).toBe('à la maison');
      expect(at(home({ definiteness: 'bare' }))).toBe('à la maison');
      expect(at(el(home(), np(MARCHE)))).toBe('à la maison et dans le marché');
      expect(at(home({ definiteness: 'indefinite' }))).toBe('dans un foyer');
      expect(at(home({ number: 'plural' }))).toBe('dans les foyers');
      expect(at(home(), [path('under')])).toBe('sous le foyer');
    });
  });

  describe('cause', () => {
    test('neutral is à cause de, positive grâce à, negative par la faute de, each fused with the article', () => {
      expect(complementsPhrase(complements({ cause: complement(np(CHIEN)) }))).toBe('à cause du chien');
      expect(complementsPhrase(complements({ cause: complement(np(HOMME)) }))).toBe("à cause de l'homme");
      expect(complementsPhrase(complements({ cause: complement(np(CHIEN), [sentiment('positive')]) }))).toBe('grâce au chien');
      expect(complementsPhrase(complements({ cause: complement(np(SOURIS), [sentiment('positive')]) }))).toBe('grâce à la souris');
      expect(complementsPhrase(complements({ cause: complement(np(CHIEN), [sentiment('negative')]) }))).toBe('par la faute du chien');
      expect(complementsPhrase(complements({ cause: complement(np(CHIEN, { number: 'plural' }), [sentiment('negative')]) })))
        .toBe('par la faute des chiens');
    });

    test('any other determiner follows the plain de / à', () => {
      expect(complementsPhrase(complements({ cause: complement(np(CHIEN, { definiteness: 'indefinite' })) }))).toBe("à cause d'un chien");
      expect(complementsPhrase(complements({ cause: complement(np(CHIEN, { definiteness: 'no' }), [sentiment('negative')]) }))).toBe("par la faute d'aucun chien");
      expect(complementsPhrase(complements({ cause: complement(np(SOURIS, { definiteness: 'this' }), [sentiment('positive')]) }))).toBe('grâce à cette souris');
    });

    test('a pronoun cause takes the tonic form, de eliding before a vowel', () => {
      expect(complementsPhrase(complements({ cause: complement(np(JE)) }))).toBe('à cause de moi');
      expect(complementsPhrase(complements({ cause: complement(np(IL)) }))).toBe('à cause de lui');
      expect(complementsPhrase(complements({ cause: complement(np(ELLE)) }))).toBe("à cause d'elle");
      expect(complementsPhrase(complements({ cause: complement(np(EUX)) }))).toBe("à cause d'eux");
      expect(complementsPhrase(complements({ cause: complement(np(TU), [sentiment('positive')]) }))).toBe('grâce à toi');
      expect(complementsPhrase(complements({ cause: complement(np(EUX), [sentiment('positive')]) }))).toBe('grâce à eux');
    });

    test('a pronoun with no tonic form falls back to its base form, then to nothing', () => {
      expect(complementsPhrase(complements({ cause: complement(np({ base: 'ça', person: '3' })) }))).toBe('à cause de ça');
      expect(complementsPhrase(complements({ cause: complement(np({ person: '3' })) }))).toBe('à cause de ');
    });

    test('a negative pronoun cause is par + the possessive + faute', () => {
      const blame = (forms: Forms, extra: Forms = {}) =>
        complementsPhrase(complements({ cause: complement(np(forms, extra), [sentiment('negative')]) }));
      expect(blame(JE)).toBe('par ma faute');
      expect(blame(TU)).toBe('par ta faute');
      expect(blame(IL)).toBe('par sa faute');
      expect(blame(ELLE)).toBe('par sa faute');
      expect(blame(JE, { number: 'plural' })).toBe('par notre faute');
      expect(blame(TU, { number: 'plural' })).toBe('par votre faute');
      expect(blame(EUX)).toBe('par leur faute');
    });

    // The neutral and positive connector is said once, each conjunct bringing its own "de" / "à";
    // the negative one holds a possessive, so every conjunct repeats it.
    test('a group holding a pronoun renders each conjunct in its own form, never the first one\'s', () => {
      expect(complementsPhrase(complements({ cause: complement(el(np(CHIEN), np(TU))) }))).toBe('à cause du chien et de toi');
      expect(complementsPhrase(complements({ cause: complement(el(np(ELLE), np(HOMME)), [sentiment('positive')]) }))).toBe("grâce à elle et à l'homme");
      expect(complementsPhrase(complements({ cause: complement(el(np(JE), np(CHIEN)), [sentiment('negative')]) }))).toBe('par ma faute et par la faute du chien');
    });
  });

  describe('the complement noun phrase', () => {
    test('its adjectives agree and take their place around the noun', () => {
      expect(complementsPhrase(complements({
        locative: complement(np(MAISON, { definiteness: 'indefinite' }, { adjectives: [concept(GRAND, 'BIG')] })),
      }))).toBe('dans une grande maison');
      expect(complementsPhrase(complements({ source: complement(np(MAISON, {}, { adjectives: [concept(INTERESSANT)] })) })))
        .toBe('de la maison intéressante');
    });

    test('the fused article is chosen on a prenominal adjective', () => {
      expect(complementsPhrase(complements({ terminus: complement(np(ANGE)) }))).toBe("à l'ange");
      expect(complementsPhrase(complements({ terminus: complement(np(ANGE, {}, { adjectives: [concept(PETIT, 'SMALL')] })) })))
        .toBe('au petit ange');
    });

    test('a relative clause trails the noun', () => {
      const burning = np(MAISON, {}, { relative: { headRole: 'subject', verbPhrase: vp(BRULER) } });
      expect(complementsPhrase(complements({ locative: complement(burning) }))).toBe('dans la maison qui brûle');
    });
  });

  describe('order and coordination', () => {
    test('several complements render in the fixed order, whatever the map order', () => {
      expect(complementsPhrase(complements({
        cause: complement(np(CHIEN)),
        direction: complement(np(MARCHE)),
        source: complement(np(MAISON)),
      }))).toBe('de la maison au marché à cause du chien');
      expect(complementsPhrase(complements({
        locative: complement(np(MAISON)),
        manner: complement(np(SOIN, { definiteness: 'bare' })),
        terminus: complement(np(CHIEN)),
      }))).toBe('au chien avec soin dans la maison');
    });

    test('each conjunct repeats its own fused or chosen preposition', () => {
      expect(complementsPhrase(complements({ terminus: complement(el(np(CHAT), np(CHIEN))) }))).toBe('au chat et au chien');
      expect(complementsPhrase(complements({ locative: complement(group('or', np(MAISON), np(MARCHE))) }))).toBe('dans la maison ou dans le marché');
      expect(complementsPhrase(complements({ direction: complement(el(np(MARCHE), np(CHIEN))) }))).toBe('au marché et vers le chien');
    });
  });
});
