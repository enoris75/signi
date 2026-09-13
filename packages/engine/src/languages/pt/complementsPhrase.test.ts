import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, ComplementType, PathSpecifier, Specifier } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { complementsPhrase } from './complementsPhrase.js';
import {
  adj, AFRICA, AGUA, ALTO, ANTARTIDA, BOM, CANSADO, CAO, CASA, complement, complements, concept, CRIANCA, CUIDADO, el,
  ELA, ELE, ELES, ESCOLHER, EU, EUROPA, FELIZ, type Forms, GATA, GATO, GRANDE, group, LAR, LENDA, LIVRO, LUZ, MANEIRA,
  MENINO, NOS, nounModifier, np, PALAVRA, PAU, RAPIDAMENTE, RAPOSA, TEMPO, VELHO, VELOCIDADE, VOCE, vp,
} from './pt.fixtures.js';

const MERCADO: Forms = { base: 'mercado', plural: 'mercados', gender: 'masc', count: 'singular' };
const ARDER: Forms = { base: 'arder', '3sg_present': 'arde' };

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

/** Render a complements map for a masculine singular subject and a verb with no source adverb. */
const render = (map: Partial<Record<ComplementType, ResolvedComplement>>, subject: Forms = GATO, verb = 'GO') =>
  complementsPhrase(complements(map), subject, verb);
/** An adjective (or other concept-id-keyed) head: the suppletives key off the concept id. */
const headed = (forms: Forms, conceptId: string) => ({ ...np(forms), head: concept(forms, conceptId) });

describe('complementsPhrase', () => {
  test('renders nothing without complements', () => {
    expect(complementsPhrase(undefined, GATO, 'GO')).toBe('');
    expect(render({})).toBe('');
  });

  describe('predicative', () => {
    test('a predicate adjective agrees with the subject', () => {
      expect(render({ predicative: complement(np(CANSADO)) })).toBe('cansado');
      expect(render({ predicative: complement(np(CANSADO)) }, GATA)).toBe('cansada');
      expect(render({ predicative: complement(np(CANSADO)) }, { ...GATA, number: 'plural' })).toBe('cansadas');
      expect(render({ predicative: complement(np(FELIZ)) }, { ...GATO, number: 'plural' })).toBe('felizes');
      expect(render({ predicative: complement(np(BOM)) }, GATA)).toBe('boa');
    });

    test('a predicate adjective carries its own degree', () => {
      expect(render({ predicative: complement(np(FELIZ, { degree: 'more' })) })).toBe('mais feliz');
      expect(render({ predicative: complement(np(CANSADO, { degree: 'less' })) }, GATA)).toBe('menos cansada');
      expect(render({ predicative: complement(np(FELIZ, { degree: 'equally' })) })).toBe('igualmente feliz');
    });

    test('a raised degree of grande / bom is suppletive, and agrees in number', () => {
      expect(render({ predicative: complement(headed({ ...GRANDE, degree: 'more' }, 'BIG')) })).toBe('maior');
      expect(render({ predicative: complement(headed({ ...GRANDE, degree: 'more' }, 'BIG')) }, { ...GATO, number: 'plural' })).toBe('maiores');
      expect(render({ predicative: complement(headed({ ...BOM, degree: 'more' }, 'GOOD')) }, GATA)).toBe('melhor');
      // Only the raised degrees suppletise.
      expect(render({ predicative: complement(headed({ ...GRANDE, degree: 'less' }, 'BIG')) })).toBe('menos grande');
    });

    test('a superlative adds its own article, agreeing with the subject', () => {
      expect(render({ predicative: complement(np(FELIZ, { degree: 'most' })) }, GATA)).toBe('a mais feliz');
      expect(render({ predicative: complement(np(FELIZ, { degree: 'least' })) })).toBe('o menos feliz');
      expect(render({ predicative: complement(headed({ ...GRANDE, degree: 'most' }, 'BIG')) }, { ...GATO, number: 'plural' })).toBe('os maiores');
    });

    test('a predicate noun keeps its own determiner and takes no preposition', () => {
      expect(render({ predicative: complement(np(LENDA, { definiteness: 'indefinite' })) })).toBe('uma lenda');
      expect(render({ predicative: complement(np(GATO)) }, GATA)).toBe('o gato');
    });

    test('an indefinite plural predicate noun goes bare', () => {
      expect(render({ predicative: complement(np(LENDA, { definiteness: 'indefinite', number: 'plural' })) })).toBe('lendas');
    });

    test('a predicate noun agrees its own adjectives and carries its relative clause', () => {
      const legend = np(LENDA, { definiteness: 'indefinite' }, { adjectives: [adj(VELHO)], relative: { headRole: 'subject', verbPhrase: vp(ARDER) } });
      expect(render({ predicative: complement(legend) })).toBe('uma lenda velha que arde');
    });

    test('coordinated predicate adjectives each agree with the subject', () => {
      expect(render({ predicative: complement(el(np(CANSADO), np(FELIZ))) }, GATA)).toBe('cansada e feliz');
      expect(render({ predicative: complement(group('or', np(CANSADO), np(VELHO))) }, { ...GATA, number: 'plural' })).toBe('cansadas ou velhas');
    });
  });

  describe('terminus', () => {
    test('is "a" fused with the definite article', () => {
      expect(render({ terminus: complement(np(CAO)) })).toBe('ao cão');
      expect(render({ terminus: complement(np(CRIANCA)) })).toBe('à criança');
      expect(render({ terminus: complement(np(CAO, { number: 'plural' })) })).toBe('aos cães');
      expect(render({ terminus: complement(np(CRIANCA, { number: 'plural' })) })).toBe('às crianças');
    });

    // A71: a possessive rides on the definite article, which the preposition fuses with.
    test('a possessive follows the fused preposition and article', () => {
      expect(render({ terminus: complement(np(CAO, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })) })).toBe('ao meu cão');
      expect(render({ locative: complement(np(CASA, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })) })).toBe('na minha casa');
    });

    test('stays uncontracted before any other determiner', () => {
      expect(render({ terminus: complement(np(CAO, { definiteness: 'indefinite' })) })).toBe('a um cão');
      expect(render({ terminus: complement(np(CAO, { definiteness: 'this' })) })).toBe('a este cão');
      expect(render({ terminus: complement(np(CAO, { definiteness: 'no' })) })).toBe('a nenhum cão');
    });
  });

  describe('instrumental', () => {
    test('an object instrument is "com", which never fuses with the article', () => {
      expect(render({ instrumental: complement(np(PAU)) })).toBe('com o pau');
      expect(render({ instrumental: complement(np(PALAVRA, { definiteness: 'indefinite' })) })).toBe('com uma palavra');
      expect(render({ instrumental: complement(np(PAU, { number: 'plural' })) })).toBe('com os paus');
      expect(render({ instrumental: complement(np(AGUA, { definiteness: 'bare' })) })).toBe('com água');
    });

    test('a process instrument is the bare gerúndio + its object, then its adverb', () => {
      const word = np(PALAVRA, { definiteness: 'indefinite' });
      expect(render({ instrumental: complement(word, [abstraction('process')], vp(ESCOLHER)) })).toBe('escolhendo uma palavra');
      expect(render({ instrumental: complement(word, [abstraction('process')], vp(ESCOLHER, { modifier: concept(RAPIDAMENTE) })) }))
        .toBe('escolhendo uma palavra rapidamente');
      expect(render({ instrumental: complement(el(np(PAU), word), [abstraction('process')], vp(ESCOLHER)) }))
        .toBe('escolhendo o pau e uma palavra');
    });

    // The substantivized infinitive is a masculine noun, so its article is "o" whatever the object.
    test('a concept instrument is "com o" + the substantivized infinitive', () => {
      expect(render({ instrumental: complement(np(PALAVRA), [abstraction('concept')], vp(ESCOLHER)) })).toBe('com o escolher a palavra');
    });

    test('falls back to the plain object at the object level or without an action', () => {
      expect(render({ instrumental: complement(np(PAU), [abstraction('object')], vp(ESCOLHER)) })).toBe('com o pau');
      expect(render({ instrumental: complement(np(PALAVRA, { definiteness: 'indefinite' }), [abstraction('process')]) })).toBe('com uma palavra');
    });
  });

  describe('manner', () => {
    test('a noun with no manner relation is similative "como"', () => {
      expect(render({ manner: complement(np(RAPOSA)) })).toBe('como a raposa');
      expect(render({ manner: complement(np(AGUA)) })).toBe('como a água');
    });

    test('means is "com"', () => {
      expect(render({ manner: complement(np(CUIDADO, { definiteness: 'bare' })) })).toBe('com cuidado');
    });

    test('measure is "a", fused with a definite article', () => {
      expect(render({ manner: complement(np(VELOCIDADE, {}, { possessor: np(LUZ) })) })).toBe('à velocidade da luz');
      expect(render({ manner: complement(np(VELOCIDADE, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] })) })).toBe('a velocidade alta');
      expect(render({ manner: complement(np(TEMPO)) })).toBe('ao tempo');
    });

    test('mode is "de", fused with a definite article or a demonstrative', () => {
      expect(render({ manner: complement(np(MANEIRA, { definiteness: 'indefinite' }, { adjectives: [concept(BOM, 'GOOD')] })) }))
        .toBe('de uma maneira boa');
      expect(render({ manner: complement(np(MANEIRA, { definiteness: 'this' })) })).toBe('desta maneira');
    });
  });

  describe('source', () => {
    test('is "de" fused with the definite article or a demonstrative', () => {
      expect(render({ source: complement(np(CASA)) })).toBe('da casa');
      expect(render({ source: complement(np(MERCADO, { number: 'plural' })) })).toBe('dos mercados');
      expect(render({ source: complement(np(CASA, { definiteness: 'this' })) })).toBe('desta casa');
      expect(render({ source: complement(np(CASA, { definiteness: 'indefinite' })) })).toBe('de uma casa');
      expect(render({ source: complement(np(AFRICA)) })).toBe('da África');
    });

    test('a self-propelled motion verb reads it as motion away, with "longe"', () => {
      expect(render({ source: complement(np(CASA)) }, GATO, 'RUN')).toBe('longe da casa');
      expect(render({ source: complement(np(MERCADO)) }, GATO, 'JUMP')).toBe('longe do mercado');
      expect(render({ source: complement(np(CASA)) }, GATO, 'COME')).toBe('da casa');
    });
  });

  describe('direction', () => {
    test('a place is "a" fused with the definite article', () => {
      expect(render({ direction: complement(np(MERCADO)) })).toBe('ao mercado');
      expect(render({ direction: complement(np(CASA)) })).toBe('à casa');
      expect(render({ direction: complement(np(MERCADO, { number: 'plural' })) })).toBe('aos mercados');
      expect(render({ direction: complement(np(ANTARTIDA)) })).toBe('à Antártida');
    });

    test('a place with any other determiner keeps "a" uncontracted', () => {
      expect(render({ direction: complement(np(MERCADO, { definiteness: 'indefinite' })) })).toBe('a um mercado');
      expect(render({ direction: complement(np(MERCADO, { definiteness: 'all', number: 'plural' })) })).toBe('a todos os mercados');
    });

    test('an animate goal takes "para", which never contracts', () => {
      expect(render({ direction: complement(np(MENINO)) })).toBe('para o menino');
      expect(render({ direction: complement(np(MENINO, { number: 'plural' })) })).toBe('para os meninos');
      expect(render({ direction: complement(np(CRIANCA, { definiteness: 'indefinite' })) })).toBe('para uma criança');
    });
  });

  describe('route', () => {
    test('defaults to "por", fused to pelo / pela', () => {
      expect(render({ route: complement(np(MERCADO)) })).toBe('pelo mercado');
      expect(render({ route: complement(np(CASA)) })).toBe('pela casa');
      expect(render({ route: complement(np(CASA, { definiteness: 'indefinite' })) })).toBe('por uma casa');
    });

    test('a path specifier picks the locution', () => {
      expect(render({ route: complement(np(MERCADO), [path('over')]) })).toBe('por cima do mercado');
      expect(render({ route: complement(np(MERCADO), [path('under')]) })).toBe('debaixo do mercado');
      expect(render({ route: complement(np(MERCADO), [path('around')]) })).toBe('ao redor do mercado');
      expect(render({ route: complement(np(CASA), [path('behind')]) })).toBe('atrás da casa');
    });
  });

  describe('locative', () => {
    test('defaults to "em", fused with the definite article or a demonstrative', () => {
      expect(render({ locative: complement(np(CASA)) })).toBe('na casa');
      expect(render({ locative: complement(np(MERCADO)) })).toBe('no mercado');
      expect(render({ locative: complement(np(CASA, { number: 'plural' })) })).toBe('nas casas');
      expect(render({ locative: complement(np(CASA, { definiteness: 'this' })) })).toBe('nesta casa');
      expect(render({ locative: complement(np(CASA, { definiteness: 'that' })) })).toBe('nessa casa');
      expect(render({ locative: complement(np(EUROPA)) })).toBe('na Europa');
    });

    test('stays uncontracted before any other determiner', () => {
      expect(render({ locative: complement(np(CASA, { definiteness: 'indefinite' })) })).toBe('em uma casa');
      expect(render({ locative: complement(np(CASA, { definiteness: 'no' })) })).toBe('em nenhuma casa');
      expect(render({ locative: complement(np(CASA, { definiteness: 'all', number: 'plural' })) })).toBe('em todas as casas');
    });

    test('a path specifier picks the locution', () => {
      expect(render({ locative: complement(np(CASA), [path('under')]) })).toBe('debaixo da casa');
      expect(render({ locative: complement(np(CASA, { number: 'plural' }), [path('behind')]) })).toBe('atrás das casas');
      expect(render({ locative: complement(np(CASA), [path('around')]) })).toBe('ao redor da casa');
      expect(render({ locative: complement(np(MERCADO), [path('in_front_of')]) })).toBe('em frente do mercado');
    });

    // Fixed A41: HOME in plain containment is a bare "em casa" — the hearth-word "lar" gives way to
    // "casa", uncontracted — and any other determiner, a plural or a relation keeps "lar" as a place.
    test('HOME takes the "em casa" idiom; a marked determiner, plural or relation keeps the place', () => {
      const home = (extra: Forms = {}) => ({ ...np(LAR, extra), head: concept({ ...LAR, ...extra }, 'HOME') });
      expect(render({ locative: complement(home()) })).toBe('em casa');
      expect(render({ locative: complement(home({ definiteness: 'bare' })) })).toBe('em casa');
      expect(render({ locative: complement(el(home(), np(MERCADO))) })).toBe('em casa e no mercado');
      expect(render({ locative: complement(home({ definiteness: 'indefinite' })) })).toBe('em um lar');
      expect(render({ locative: complement(home({ number: 'plural' })) })).toBe('nos lares');
      expect(render({ locative: complement(home(), [path('under')]) })).toBe('debaixo do lar');
    });
  });

  describe('cause', () => {
    test('neutral is "por causa de", positive "graças a", negative "por culpa de", each fused', () => {
      expect(render({ cause: complement(np(CAO)) })).toBe('por causa do cão');
      expect(render({ cause: complement(np(RAPOSA), [sentiment('positive')]) })).toBe('graças à raposa');
      expect(render({ cause: complement(np(CAO, { number: 'plural' }), [sentiment('negative')]) })).toBe('por culpa dos cães');
    });

    test('any other determiner follows the plain de / a, de fusing with a demonstrative', () => {
      expect(render({ cause: complement(np(CAO, { definiteness: 'indefinite' })) })).toBe('por causa de um cão');
      expect(render({ cause: complement(np(CAO, { definiteness: 'this' })) })).toBe('por causa deste cão');
      expect(render({ cause: complement(np(RAPOSA, { definiteness: 'no' }), [sentiment('positive')]) })).toBe('graças a nenhuma raposa');
    });

    test('a pronoun cause takes its tonic form, "de" fusing with ele / ela', () => {
      expect(render({ cause: complement(np(EU)) })).toBe('por causa de mim');
      expect(render({ cause: complement(np(VOCE)) })).toBe('por causa de você');
      expect(render({ cause: complement(np(ELE)) })).toBe('por causa dele');
      expect(render({ cause: complement(np(ELA)) })).toBe('por causa dela');
      expect(render({ cause: complement(np(ELES)) })).toBe('por causa deles');
    });

    // A105: "de" fuses with the neuter demonstrative too.
    test('"de" fuses with the neuter isso and the demonstratives', () => {
      expect(render({ cause: complement(np(ELE, { gender: 'neut', disjunctive: 'isso' })) })).toBe('por causa disso');
      expect(render({ cause: complement(np(ELE, { gender: 'neut', disjunctive: 'aquilo' })) })).toBe('por causa daquilo');
      expect(render({ cause: complement(np(ELE, { gender: 'neut', disjunctive: 'isso' }), [sentiment('positive')]) })).toBe('graças a isso');
    });

    test('a positive pronoun cause is "graças a" + the tonic form', () => {
      expect(render({ cause: complement(np(EU), [sentiment('positive')]) })).toBe('graças a mim');
      expect(render({ cause: complement(np(ELA), [sentiment('positive')]) })).toBe('graças a ela');
    });

    test('a negative pronoun cause is "por <possessive> culpa"', () => {
      expect(render({ cause: complement(np(EU), [sentiment('negative')]) })).toBe('por minha culpa');
      expect(render({ cause: complement(np(NOS), [sentiment('negative')]) })).toBe('por nossa culpa');
      expect(render({ cause: complement(np(ELA), [sentiment('negative')]) })).toBe('por sua culpa');
      expect(render({ cause: complement(np(ELES), [sentiment('negative')]) })).toBe('por sua culpa');
    });

    // The neutral and positive connector is said once, each conjunct bringing its own "de" / "a";
    // the negative one holds a possessive, so every conjunct repeats it.
    test('a group holding a pronoun renders each conjunct in its own form, never the first one\'s', () => {
      expect(render({ cause: complement(el(np(CAO), np(ELE))) })).toBe('por causa do cão e dele');
      expect(render({ cause: complement(el(np(EU), np(RAPOSA)), [sentiment('positive')]) })).toBe('graças a mim e à raposa');
      expect(render({ cause: complement(el(np(EU), np(VOCE)), [sentiment('negative')]) })).toBe('por minha culpa e por sua culpa');
    });
  });

  describe('the complement noun phrase', () => {
    test('its adjectives agree with its own head', () => {
      expect(render({ locative: complement(np(CASA, { definiteness: 'indefinite' }, { adjectives: [adj(VELHO)] })) })).toBe('em uma casa velha');
      expect(render({ direction: complement(np(MERCADO, { number: 'plural' }, { adjectives: [adj(GRANDE)] })) })).toBe('aos mercados grandes');
    });

    test('its attributive nouns, possessor and relative clause trail it', () => {
      const wordBook = np(LIVRO, {}, { nounModifiers: [nounModifier({ ...PALAVRA, number: 'plural' }, [], 'purpose')] });
      expect(render({ source: complement(wordBook) })).toBe('do livro de palavras');
      expect(render({ locative: complement(np(CASA, {}, { possessor: np(MENINO) })) })).toBe('na casa do menino');
      expect(render({ locative: complement(np(CASA, {}, { relative: { headRole: 'subject', verbPhrase: vp(ARDER) } })) })).toBe('na casa que arde');
    });
  });

  describe('order and coordination', () => {
    test('several complements render in the fixed order, whatever the map order', () => {
      expect(render({
        cause: complement(np(CAO)),
        direction: complement(np(MERCADO)),
        source: complement(np(CASA)),
      })).toBe('da casa ao mercado por causa do cão');
      expect(render({
        locative: complement(np(CASA)),
        instrumental: complement(np(PAU)),
        terminus: complement(np(CAO)),
        predicative: complement(np(FELIZ)),
      })).toBe('feliz ao cão com o pau na casa');
    });

    test('each conjunct repeats its own fused head', () => {
      expect(render({ locative: complement(el(np(CASA), np(MERCADO))) })).toBe('na casa e no mercado');
      expect(render({ instrumental: complement(el(np(PAU), np(PALAVRA), np(AGUA))) })).toBe('com o pau, com a palavra e com a água');
      expect(render({ cause: complement(group('or', np(CAO), np(RAPOSA)), [sentiment('positive')]) })).toBe('graças ao cão ou graças à raposa');
    });

    test('each direction conjunct picks its own preposition by animacy', () => {
      expect(render({ direction: complement(group('or', np(MERCADO), np(MENINO))) })).toBe('ao mercado ou para o menino');
    });
  });
});
