import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, PathSpecifier, Specifier } from '@signi/shared';
import { complementsPhrase } from './complementsPhrase.js';
import {
  adj, AGUA, ALTO, ANTARTIDA, ARDER, BUENO, CANSADO, CASA, complement, complements, concept, CUIDADO, EL, el, ELEGIR,
  ELLA, ELLOS, EUROPA, FELIZ, type Forms, FUERTE, GATO, GRANDE, group, INTERESANTE, LEYENDA, LIBRO, LUZ, MANERA,
  MERCADO, MUJER, NINO, NOSOTROS, nounModifier, np, PALABRA, PALO, PEQUENO, PERRO, PRIMERO, RAPIDO_ADV, TU, VELOCIDAD,
  VIEJO, VOSOTROS, vp, YO,
} from './es.fixtures.js';

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

// Most complements ignore the subject and the verb; these are the ones they default to.
const render = (map: Parameters<typeof complements>[0], subject: Forms = GATO, verb = 'TEST') =>
  complementsPhrase(complements(map), subject, verb);

describe('complementsPhrase', () => {
  test('renders nothing without complements', () => {
    expect(complementsPhrase(undefined, GATO, 'RUN')).toBe('');
    expect(complementsPhrase({}, GATO, 'RUN')).toBe('');
  });

  describe('predicative', () => {
    test('a predicate adjective agrees with the subject', () => {
      expect(render({ predicative: complement(np(CANSADO)) })).toBe('cansado');
      expect(render({ predicative: complement(np(CANSADO)) }, MUJER)).toBe('cansada');
      expect(render({ predicative: complement(np(CANSADO)) }, { ...GATO, number: 'plural' })).toBe('cansados');
      expect(render({ predicative: complement(np(VIEJO)) }, { ...MUJER, number: 'plural' })).toBe('viejas');
      expect(render({ predicative: complement(np(FELIZ)) }, NOSOTROS)).toBe('felices');
    });

    test('a predicate adjective carries its own degree', () => {
      expect(render({ predicative: complement(np(CANSADO, { degree: 'more' })) }, MUJER)).toBe('más cansada');
      expect(render({ predicative: complement(np(CANSADO, { degree: 'less' })) })).toBe('menos cansado');
      expect(render({ predicative: complement(np(GRANDE, { degree: 'equally' })) })).toBe('igual de grande');
    });

    // With no noun to lend its article, the superlative supplies one, agreeing with the subject.
    test('a predicate superlative adds its own definite article', () => {
      expect(render({ predicative: complement(np(FELIZ, { degree: 'most' })) })).toBe('el más feliz');
      expect(render({ predicative: complement(np(FELIZ, { degree: 'most' })) }, MUJER)).toBe('la más feliz');
      expect(render({ predicative: complement(np(GRANDE, { degree: 'least' })) }, { ...CASA, number: 'plural' })).toBe('las menos grandes');
    });

    test('a predicate noun keeps its own article and gender, with no preposition', () => {
      expect(render({ predicative: complement(np(LEYENDA, { definiteness: 'indefinite' })) })).toBe('una leyenda');
      expect(render({ predicative: complement(np(LEYENDA)) })).toBe('la leyenda');
      expect(render({ predicative: complement(np(LEYENDA, { definiteness: 'indefinite' }, { adjectives: [adj(VIEJO)] })) })).toBe('una leyenda vieja');
    });

    test('an indefinite plural predicate noun goes bare', () => {
      expect(render({ predicative: complement(np(LEYENDA, { definiteness: 'indefinite', number: 'plural' })) }, { ...GATO, number: 'plural' }))
        .toBe('leyendas');
    });

    test('coordinated predicates each agree with the subject', () => {
      expect(render({ predicative: complement(el(np(CANSADO), np(FELIZ))) }, MUJER)).toBe('cansada y feliz');
      expect(render({ predicative: complement(el(np(FUERTE), np(INTERESANTE))) })).toBe('fuerte e interesante');
      expect(render({ predicative: complement(group('or', np(VIEJO), np(PEQUENO))) }, MUJER)).toBe('vieja o pequeña');
    });
  });

  describe('terminus', () => {
    test('is a, fused to al before a masculine singular definite', () => {
      expect(render({ terminus: complement(np(NINO)) })).toBe('al niño');
      expect(render({ terminus: complement(np(MUJER)) })).toBe('a la mujer');
      expect(render({ terminus: complement(np(NINO, { number: 'plural' })) })).toBe('a los niños');
      expect(render({ terminus: complement(np(NINO, { definiteness: 'indefinite' })) })).toBe('a un niño');
    });

    // A71: a possessive replaces the article, so the preposition stands alone before it.
    test('a possessive follows the bare preposition', () => {
      expect(render({ terminus: complement(np(NINO, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })) })).toBe('a mi niño');
      expect(render({ locative: complement(np(CASA, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })) })).toBe('en mi casa');
    });
  });

  describe('instrumental', () => {
    test('an object instrument is con + its determiner', () => {
      expect(render({ instrumental: complement(np(PALO)) })).toBe('con el palo');
      expect(render({ instrumental: complement(np(PALABRA, { definiteness: 'indefinite' })) })).toBe('con una palabra');
      expect(render({ instrumental: complement(np(PALO, { number: 'plural' })) })).toBe('con los palos');
    });

    test('a process instrument is the gerundio with its object and adverb', () => {
      const word = np(PALABRA, { definiteness: 'indefinite' });
      expect(render({ instrumental: complement(word, [abstraction('process')], vp(ELEGIR)) })).toBe('eligiendo una palabra');
      expect(render({ instrumental: complement(word, [abstraction('process')], vp(ELEGIR, { modifier: concept(RAPIDO_ADV) })) }))
        .toBe('eligiendo una palabra rápido');
      expect(render({
        instrumental: complement(el(word, np(LIBRO, { definiteness: 'indefinite' })), [abstraction('process')], vp(ELEGIR)),
      })).toBe('eligiendo una palabra y un libro');
    });

    // The substantivized infinitive is a masculine singular noun: always "el".
    test('a concept instrument is con el + the infinitive', () => {
      expect(render({ instrumental: complement(np(PALABRA, { definiteness: 'indefinite' }), [abstraction('concept')], vp(ELEGIR)) }))
        .toBe('con el elegir una palabra');
    });

    test('falls back to the plain object at the object level or without an action', () => {
      expect(render({ instrumental: complement(np(PALO), [abstraction('object')], vp(ELEGIR)) })).toBe('con el palo');
      expect(render({ instrumental: complement(np(PALABRA, { definiteness: 'indefinite' }), [abstraction('process')]) })).toBe('con una palabra');
    });
  });

  describe('manner', () => {
    test('a noun with no manner relation is similative como', () => {
      expect(render({ manner: complement(np(GATO, { definiteness: 'indefinite' })) })).toBe('como un gato');
      expect(render({ manner: complement(np(AGUA)) })).toBe('como el agua');
    });

    test('means takes con', () => {
      expect(render({ manner: complement(np(CUIDADO, { definiteness: 'bare' })) })).toBe('con cuidado');
      expect(render({ manner: complement(np(CUIDADO, { definiteness: 'many' })) })).toBe('con mucho cuidado');
    });

    test('measure takes a, fused with the definite article', () => {
      expect(render({ manner: complement(np(VELOCIDAD, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] })) })).toBe('a velocidad alta');
      expect(render({ manner: complement(np(VELOCIDAD, {}, { possessor: np(LUZ) })) })).toBe('a la velocidad de la luz');
    });

    test('mode takes de', () => {
      expect(render({ manner: complement(np(MANERA, { definiteness: 'indefinite' }, { adjectives: [adj(BUENO)] })) })).toBe('de una manera buena');
      expect(render({ manner: complement(np(MANERA, { definiteness: 'this' })) })).toBe('de esta manera');
    });
  });

  describe('source', () => {
    test('is de, fused to del before a masculine singular definite', () => {
      expect(render({ source: complement(np(CASA)) }, GATO, 'COME')).toBe('de la casa');
      expect(render({ source: complement(np(MERCADO)) }, GATO, 'COME')).toBe('del mercado');
      expect(render({ source: complement(np(CASA, { number: 'plural' })) }, GATO, 'LOAD')).toBe('de las casas');
      expect(render({ source: complement(np(CASA, { definiteness: 'indefinite' })) }, GATO, 'COME')).toBe('de una casa');
    });

    test('a proper source is bare unless inherently articled', () => {
      expect(render({ source: complement(np(EUROPA)) }, GATO, 'COME')).toBe('de Europa');
      expect(render({ source: complement(np(ANTARTIDA)) }, GATO, 'COME')).toBe('de la Antártida');
    });

    // Bare "de" after a self-propelled motion verb would read as an origin, not a departure.
    test('run and jump lead with the ablative adverb lejos', () => {
      expect(render({ source: complement(np(NINO)) }, GATO, 'RUN')).toBe('lejos del niño');
      expect(render({ source: complement(np(CASA)) }, GATO, 'JUMP')).toBe('lejos de la casa');
    });
  });

  describe('direction', () => {
    test('a place is a, fused to al', () => {
      expect(render({ direction: complement(np(CASA)) })).toBe('a la casa');
      expect(render({ direction: complement(np(MERCADO)) })).toBe('al mercado');
      expect(render({ direction: complement(np(MERCADO, { definiteness: 'indefinite' })) })).toBe('a un mercado');
      expect(render({ direction: complement(np(EUROPA)) })).toBe('a Europa');
      expect(render({ direction: complement(np(ANTARTIDA)) })).toBe('a la Antártida');
    });

    test('an animate goal takes hacia, which fuses with nothing', () => {
      expect(render({ direction: complement(np(NINO)) })).toBe('hacia el niño');
      expect(render({ direction: complement(np(MUJER, { definiteness: 'indefinite' })) })).toBe('hacia una mujer');
      expect(render({ direction: complement(np(PERRO, { number: 'plural' })) })).toBe('hacia los perros');
    });
  });

  describe('route', () => {
    test('defaults to por', () => {
      expect(render({ route: complement(np(CASA)) })).toBe('por la casa');
      expect(render({ route: complement(np(MERCADO)) })).toBe('por el mercado');
    });

    test('a path specifier picks the locution', () => {
      expect(render({ route: complement(np(MERCADO), [path('under')]) })).toBe('debajo del mercado');
      expect(render({ route: complement(np(CASA), [path('over')]) })).toBe('por encima de la casa');
      expect(render({ route: complement(np(CASA), [path('around')]) })).toBe('alrededor de la casa');
      expect(render({ route: complement(np(CASA), [path('in')]) })).toBe('en la casa');
    });
  });

  describe('locative', () => {
    test('defaults to en', () => {
      expect(render({ locative: complement(np(CASA)) })).toBe('en la casa');
      expect(render({ locative: complement(np(CASA, { definiteness: 'indefinite' })) })).toBe('en una casa');
      expect(render({ locative: complement(np(MERCADO, { number: 'plural' })) })).toBe('en los mercados');
      expect(render({ locative: complement(np(EUROPA)) })).toBe('en Europa');
      expect(render({ locative: complement(np(ANTARTIDA)) })).toBe('en la Antártida');
    });

    test('a path specifier picks the locution', () => {
      expect(render({ locative: complement(np(CASA), [path('behind')]) })).toBe('detrás de la casa');
      expect(render({ locative: complement(np(MERCADO), [path('in_front_of')]) })).toBe('delante del mercado');
      expect(render({ locative: complement(np(LIBRO), [path('under')]) })).toBe('debajo del libro');
      expect(render({ locative: complement(np(CASA), [path('through')]) })).toBe('por la casa');
    });

    // Fixed A41: HOME in plain containment is a bare "en casa" — the hearth-word "hogar" gives way to
    // "casa" — and any other determiner, a plural or a relation keeps "hogar" as a place.
    test('HOME takes the "en casa" idiom; a marked determiner, plural or relation keeps the place', () => {
      const HOGAR: Forms = { base: 'hogar', plural: 'hogares', gender: 'masc', count: 'singular' };
      const home = (extra: Forms = {}) => ({ ...np(HOGAR, extra), head: concept({ ...HOGAR, ...extra }, 'HOME') });
      expect(render({ locative: complement(home()) })).toBe('en casa');
      expect(render({ locative: complement(home({ definiteness: 'bare' })) })).toBe('en casa');
      expect(render({ locative: complement(el(home(), np(MERCADO))) })).toBe('en casa y en el mercado');
      expect(render({ locative: complement(home({ definiteness: 'indefinite' })) })).toBe('en un hogar');
      expect(render({ locative: complement(home({ number: 'plural' })) })).toBe('en los hogares');
      expect(render({ locative: complement(home(), [path('under')]) })).toBe('debajo del hogar');
    });
  });

  describe('cause', () => {
    test('neutral is a causa de, fused to del', () => {
      expect(render({ cause: complement(np(PERRO)) })).toBe('a causa del perro');
      expect(render({ cause: complement(np(MUJER)) })).toBe('a causa de la mujer');
      expect(render({ cause: complement(np(PERRO, { number: 'plural' })) })).toBe('a causa de los perros');
    });

    test('positive is gracias a and negative por culpa de', () => {
      expect(render({ cause: complement(np(PERRO), [sentiment('positive')]) })).toBe('gracias al perro');
      expect(render({ cause: complement(np(MUJER), [sentiment('positive')]) })).toBe('gracias a la mujer');
      expect(render({ cause: complement(np(PERRO), [sentiment('negative')]) })).toBe('por culpa del perro');
      expect(render({ cause: complement(np(MUJER), [sentiment('negative')]) })).toBe('por culpa de la mujer');
    });

    test('any other determiner follows the plain de / a', () => {
      expect(render({ cause: complement(np(PERRO, { definiteness: 'indefinite' })) })).toBe('a causa de un perro');
      expect(render({ cause: complement(np(PERRO, { definiteness: 'no' }), [sentiment('negative')]) })).toBe('por culpa de ningún perro');
      expect(render({ cause: complement(np(MUJER, { definiteness: 'this' }), [sentiment('positive')]) })).toBe('gracias a esta mujer');
    });

    test('a neutral or positive pronoun cause takes its tonic form', () => {
      expect(render({ cause: complement(np(YO)) })).toBe('a causa de mí');
      expect(render({ cause: complement(np(ELLA)) })).toBe('a causa de ella');
      expect(render({ cause: complement(np(TU), [sentiment('positive')]) })).toBe('gracias a ti');
      expect(render({ cause: complement(np(NOSOTROS), [sentiment('positive')]) })).toBe('gracias a nosotros');
    });

    // The possessive agrees with feminine "culpa" and picks its stem by the pronoun's person/number.
    test('a negative pronoun cause is por + possessive + culpa', () => {
      const blame = (forms: Forms) => render({ cause: complement(np(forms), [sentiment('negative')]) });
      expect(blame(YO)).toBe('por mi culpa');
      expect(blame(TU)).toBe('por tu culpa');
      expect(blame(EL)).toBe('por su culpa');
      expect(blame(ELLA)).toBe('por su culpa');
      expect(blame(NOSOTROS)).toBe('por nuestra culpa');
      expect(blame(VOSOTROS)).toBe('por vuestra culpa');
      expect(blame(ELLOS)).toBe('por su culpa');
    });

    // The neutral and positive connector is said once, each conjunct bringing its own "de" / "a";
    // the negative one holds a possessive, so every conjunct repeats it.
    test('a group holding a pronoun renders each conjunct in its own form, never the first one\'s', () => {
      expect(render({ cause: complement(el(np(YO), np(PERRO))) })).toBe('a causa de mí y del perro');
      expect(render({ cause: complement(el(np(MUJER), np(TU)), [sentiment('positive')]) })).toBe('gracias a la mujer y a ti');
      expect(render({ cause: complement(el(np(PERRO), np(YO)), [sentiment('negative')]) })).toBe('por culpa del perro y por mi culpa');
    });
  });

  describe('the complement noun phrase', () => {
    test('its adjectives agree with the complement noun', () => {
      expect(render({ locative: complement(np(CASA, { definiteness: 'indefinite' }, { adjectives: [adj(PEQUENO)] })) })).toBe('en una casa pequeña');
      expect(render({ direction: complement(np(MERCADO, { number: 'plural' }, { adjectives: [adj(GRANDE)] })) })).toBe('a los mercados grandes');
    });

    test('a stressed-a noun takes el, until a prenominal adjective intervenes', () => {
      expect(render({ locative: complement(np(AGUA)) })).toBe('en el agua');
      expect(render({ direction: complement(np(AGUA)) })).toBe('al agua');
      expect(render({ locative: complement(np(AGUA, {}, { adjectives: [concept(PRIMERO, 'FIRST')] })) })).toBe('en la primera agua');
      expect(render({ direction: complement(np(AGUA, {}, { adjectives: [concept(PRIMERO, 'FIRST')] })) })).toBe('a la primera agua');
    });

    test('attributive nouns, the possessor and a relative clause trail the noun', () => {
      expect(render({ direction: complement(np(MERCADO, {}, { nounModifiers: [nounModifier({ ...LIBRO, number: 'plural' })] })) })).toBe('al mercado de libros');
      expect(render({ locative: complement(np(CASA, {}, { possessor: np(NINO) })) })).toBe('en la casa del niño');
      expect(render({ locative: complement(np(CASA, {}, { relative: { headRole: 'subject', verbPhrase: vp(ARDER) } })) })).toBe('en la casa que arde');
    });
  });

  describe('order and coordination', () => {
    test('several complements render in the fixed order, whatever the map order', () => {
      expect(render({
        cause: complement(np(PERRO)),
        direction: complement(np(MERCADO)),
        source: complement(np(CASA)),
        manner: complement(np(VELOCIDAD, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] })),
      }, GATO, 'RUN')).toBe('a velocidad alta lejos de la casa al mercado a causa del perro');
      expect(render({
        locative: complement(np(CASA)),
        instrumental: complement(np(PALO)),
        terminus: complement(np(NINO)),
      })).toBe('al niño con el palo en la casa');
    });

    test('each conjunct repeats its preposition, fused with its own article', () => {
      expect(render({ direction: complement(el(np(MERCADO), np(CASA))) })).toBe('al mercado y a la casa');
      expect(render({ locative: complement(group('or', np(CASA), np(MERCADO, { definiteness: 'indefinite' }))) })).toBe('en la casa o en un mercado');
      expect(render({ instrumental: complement(el(np(PALO), np(PALABRA), np(LIBRO))) })).toBe('con el palo, con la palabra y con el libro');
    });

    test('each direction conjunct picks its own preposition', () => {
      expect(render({ direction: complement(el(np(CASA), np(NINO))) })).toBe('a la casa y hacia el niño');
    });
  });
});
