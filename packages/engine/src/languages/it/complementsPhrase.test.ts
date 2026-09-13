import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, ComplementType, PathSpecifier, Specifier } from '@signi/shared';
import { complementsPhrase } from './complementsPhrase.js';
import {
  adj, AFFAMATO, ALA, ALTO, AMERICA_DEL_NORD, ANGELO, BASTONE, BENE, BUONO, CANE, CASA, CIBO, complement, complements, concept, CURA, el,
  EUROPA, FELICE, type Forms, GATTA, GATTO, GRANDE, group, IO, LEI, LORO, LUCE, LUI, LUPO, MANGIARE, MERCATO, MODO, NOI, np,
  PAROLA, PICCOLO, RAGAZZO, SCEGLIERE, STANCO, TU, UOMO, VECCHIO, VELOCITA, VOLPE, vp,
} from './it.fixtures.js';
import type { ResolvedComplement } from '../../types.js';

const LEGGENDA: Forms = { base: 'leggenda', plural: 'leggende', gender: 'fem', count: 'singular' };
const AMARE: Forms = { base: 'amare', gerund: 'amando', participle: 'amato', '3sg_present': 'ama' };
const BRUCIARE: Forms = { base: 'bruciare', gerund: 'bruciando', participle: 'bruciato', '3sg_present': 'brucia' };

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

/** One complement of `type`, rendered for a masculine singular subject and a neutral verb. */
const one = (type: ComplementType, c: ResolvedComplement, subject: Forms = GATTO, verb = 'TEST') =>
  complementsPhrase(complements({ [type]: c }), subject, verb);

describe('complementsPhrase', () => {
  test('renders nothing without complements', () => {
    expect(complementsPhrase(undefined, GATTO, 'EAT')).toBe('');
    expect(complementsPhrase({}, GATTO, 'EAT')).toBe('');
  });

  describe('predicative', () => {
    test('a predicate adjective agrees with the subject', () => {
      expect(one('predicative', complement(np(STANCO)), GATTO)).toBe('stanco');
      expect(one('predicative', complement(np(STANCO)), GATTA)).toBe('stanca');
      expect(one('predicative', complement(np(STANCO)), { ...GATTO, number: 'plural' })).toBe('stanchi');
      expect(one('predicative', complement(np(STANCO)), { ...GATTA, number: 'plural' })).toBe('stanche');
      expect(one('predicative', complement(np(FELICE)), { ...GATTA, number: 'plural' })).toBe('felici');
    });

    test('a compared predicate adjective carries its degree adverb', () => {
      expect(one('predicative', complement(np(STANCO, { degree: 'more' })), GATTA)).toBe('più stanca');
      expect(one('predicative', complement(np(FELICE, { degree: 'equally' })), GATTO)).toBe('ugualmente felice');
    });

    // With no noun article to borrow, the relative superlative supplies its own (fixed A26).
    test('a predicate superlative takes a definite article agreeing with the subject', () => {
      expect(one('predicative', complement(np(FELICE, { degree: 'most' })), GATTO)).toBe('il più felice');
      expect(one('predicative', complement(np(STANCO, { degree: 'most' })), GATTA)).toBe('la più stanca');
      expect(one('predicative', complement(np(FELICE, { degree: 'most' })), { ...GATTO, number: 'plural' })).toBe('i più felici');
      expect(one('predicative', complement(np(STANCO, { degree: 'least' })), { ...GATTA, number: 'plural' })).toBe('le meno stanche');
    });

    test('a predicate noun keeps its own determiner and no preposition', () => {
      expect(one('predicative', complement(np(LEGGENDA, { definiteness: 'indefinite' })), GATTO)).toBe('una leggenda');
      expect(one('predicative', complement(np(ANGELO, { definiteness: 'indefinite' })), GATTA)).toBe('un angelo');
    });

    test('each coordinated predicate agrees with the subject on its own', () => {
      expect(one('predicative', complement(el(np(STANCO), np(FELICE))), GATTA)).toBe('stanca e felice');
      expect(one('predicative', complement(group('or', np(STANCO), np(AFFAMATO))), { gender: 'masc', number: 'plural' }))
        .toBe('stanchi o affamati');
    });
  });

  describe('terminus', () => {
    test('is a fused with the definite article', () => {
      expect(one('terminus', complement(np(CANE)))).toBe('al cane');
      expect(one('terminus', complement(np(VOLPE)))).toBe('alla volpe');
      expect(one('terminus', complement(np(UOMO)))).toBe("all'uomo");
      expect(one('terminus', complement(np(RAGAZZO, { number: 'plural' })))).toBe('ai ragazzi');
      expect(one('terminus', complement(np(UOMO, { number: 'plural' })))).toBe('agli uomini');
    });

    test('any other determiner stays apart from a', () => {
      expect(one('terminus', complement(np(CANE, { definiteness: 'indefinite' })))).toBe('a un cane');
      expect(one('terminus', complement(np(CANE, { definiteness: 'no' })))).toBe('a nessun cane');
      expect(one('terminus', complement(np(CANE, { definiteness: 'all', number: 'plural' })))).toBe('a tutti i cani');
    });
  });

  describe('instrumental', () => {
    test('an object instrument is con, which fuses with no article', () => {
      expect(one('instrumental', complement(np(BASTONE)))).toBe('con il bastone');
      expect(one('instrumental', complement(np(BASTONE, { definiteness: 'indefinite' })))).toBe('con un bastone');
      expect(one('instrumental', complement(np(BASTONE, { number: 'plural' })))).toBe('con i bastoni');
      expect(one('instrumental', complement(np(ALA)))).toBe("con l'ala");
    });

    test('a process instrument is the bare gerundio before its object', () => {
      const process = [abstraction('process')];
      expect(one('instrumental', complement(np(BASTONE), process, vp(SCEGLIERE)))).toBe('scegliendo il bastone');
      expect(one('instrumental', complement(np(BASTONE), process, vp(SCEGLIERE, { modifier: concept(BENE) }))))
        .toBe('scegliendo il bastone bene');
      expect(one('instrumental', complement(el(np(BASTONE), np(PAROLA, { definiteness: 'indefinite' })), process, vp(SCEGLIERE))))
        .toBe('scegliendo il bastone e una parola');
    });

    test('a concept instrument is con + the infinitive under the article its own sound selects', () => {
      const conceptLevel = [abstraction('concept')];
      expect(one('instrumental', complement(np(BASTONE), conceptLevel, vp(SCEGLIERE)))).toBe('con lo scegliere il bastone');
      expect(one('instrumental', complement(np(CIBO), conceptLevel, vp(MANGIARE)))).toBe('con il mangiare il cibo');
      expect(one('instrumental', complement(np(VOLPE), conceptLevel, vp(AMARE)))).toBe("con l'amare la volpe");
    });

    test('falls back to the plain object at the object level or without an action', () => {
      expect(one('instrumental', complement(np(BASTONE), [abstraction('object')], vp(SCEGLIERE)))).toBe('con il bastone');
      expect(one('instrumental', complement(np(BASTONE), [abstraction('process')]))).toBe('con il bastone');
    });
  });

  describe('manner', () => {
    test('a noun with no manner relation is similative come, unfused', () => {
      expect(one('manner', complement(np(VOLPE)))).toBe('come la volpe');
      expect(one('manner', complement(np(LUPO, { definiteness: 'indefinite' })))).toBe('come un lupo');
    });

    test('means is con', () => {
      expect(one('manner', complement(np(CURA, { definiteness: 'bare' })))).toBe('con cura');
      expect(one('manner', complement(np(CURA, { definiteness: 'bare' }, { adjectives: [concept(GRANDE, 'BIG')] })))).toBe('con grande cura');
    });

    test('measure is a, fused with a definite article', () => {
      expect(one('manner', complement(np(VELOCITA, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] })))).toBe('a velocità alta');
      expect(one('manner', complement(np(VELOCITA, {}, { possessor: np(LUCE) })))).toBe('alla velocità della luce');
    });

    test('mode is in, fused only with a definite article', () => {
      expect(one('manner', complement(np(MODO, { definiteness: 'indefinite' }, { adjectives: [concept(BUONO, 'GOOD')] })))).toBe('in un buon modo');
      expect(one('manner', complement(np(MODO, { definiteness: 'this' })))).toBe('in questo modo');
      expect(one('manner', complement(np(MODO, { definiteness: 'no' })))).toBe('in nessun modo');
      expect(one('manner', complement(np(MODO, { definiteness: 'all', number: 'plural' })))).toBe('in tutti i modi');
    });
  });

  describe('source', () => {
    test('is da fused with the article', () => {
      expect(one('source', complement(np(CASA)))).toBe('dalla casa');
      expect(one('source', complement(np(MERCATO)))).toBe('dal mercato');
      expect(one('source', complement(np(CASA, { definiteness: 'indefinite' })))).toBe('da una casa');
    });

    // B01: "corro dal bambino" is motion towards the child, so a self-propelled motion verb needs "via".
    test('only a self-propelled motion verb adds the ablative via', () => {
      expect(one('source', complement(np(CASA)), GATTO, 'RUN')).toBe('via dalla casa');
      expect(one('source', complement(np(CASA)), GATTO, 'JUMP')).toBe('via dalla casa');
      expect(one('source', complement(np(CASA)), GATTO, 'COME')).toBe('dalla casa');
    });
  });

  describe('direction', () => {
    test('a place goal is a', () => {
      expect(one('direction', complement(np(MERCATO)))).toBe('al mercato');
      expect(one('direction', complement(np(MERCATO, { number: 'plural' })))).toBe('ai mercati');
      expect(one('direction', complement(np(MERCATO, { definiteness: 'indefinite' })))).toBe('a un mercato');
      expect(one('direction', complement(np(MERCATO, { definiteness: 'bare', number: 'plural' })))).toBe('a mercati');
    });

    test('an animate goal is da', () => {
      expect(one('direction', complement(np(RAGAZZO)))).toBe('dal ragazzo');
      expect(one('direction', complement(np(RAGAZZO, { number: 'plural' })))).toBe('dai ragazzi');
      expect(one('direction', complement(np(RAGAZZO, { definiteness: 'bare', number: 'plural' })))).toBe('da ragazzi');
    });

    test('a continent goal is a bare in', () => {
      expect(one('direction', complement(np(EUROPA)))).toBe('in Europa');
      expect(one('direction', complement(np(AMERICA_DEL_NORD)))).toBe('in America del Nord');
    });
  });

  describe('route', () => {
    test('defaults to attraverso', () => {
      expect(one('route', complement(np(MERCATO)))).toBe('attraverso il mercato');
      expect(one('route', complement(np(CASA, { definiteness: 'indefinite' })))).toBe('attraverso una casa');
    });

    test('a path specifier picks the relation', () => {
      expect(one('route', complement(np(MERCATO), [path('under')]))).toBe('sotto il mercato');
      expect(one('route', complement(np(MERCATO), [path('over')]))).toBe('sopra il mercato');
      expect(one('route', complement(np(MERCATO), [path('around')]))).toBe('intorno al mercato');
      expect(one('route', complement(np(MERCATO), [path('behind')]))).toBe('dietro il mercato');
      expect(one('route', complement(np(MERCATO), [path('in_front_of')]))).toBe('davanti al mercato');
      expect(one('route', complement(np(MERCATO), [path('in')]))).toBe('nel mercato');
    });
  });

  describe('locative', () => {
    test('defaults to in, fused only with a definite article', () => {
      expect(one('locative', complement(np(CASA)))).toBe('nella casa');
      expect(one('locative', complement(np(CASA, { number: 'plural' })))).toBe('nelle case');
      expect(one('locative', complement(np(CASA, { definiteness: 'indefinite' })))).toBe('in una casa');
      expect(one('locative', complement(np(CASA, { definiteness: 'this' })))).toBe('in questa casa');
    });

    test('a path specifier picks the relation', () => {
      expect(one('locative', complement(np(CASA), [path('under')]))).toBe('sotto la casa');
      expect(one('locative', complement(np(CASA), [path('behind')]))).toBe('dietro la casa');
      expect(one('locative', complement(np(CASA), [path('in_front_of')]))).toBe('davanti alla casa');
    });

    // Fixed A29: containment in a continent drops the article; a relation keeps it.
    test('a proper noun takes a bare in, but keeps its article under a relation', () => {
      expect(one('locative', complement(np(EUROPA)))).toBe('in Europa');
      expect(one('locative', complement(np(EUROPA), [path('under')]))).toBe("sotto l'Europa");
    });

    // Fixed A41: HOME in plain containment is the fixed idiom "a casa", with no article to fuse.
    // HOUSE shares the word "casa" but not the idiom — the override keys off the concept.
    test('HOME takes the "a casa" idiom; a marked determiner, plural or relation keeps the place', () => {
      const home = (extra: Forms = {}) => ({ ...np(CASA, extra), head: concept({ ...CASA, ...extra }, 'HOME') });
      expect(one('locative', complement(home()))).toBe('a casa');
      expect(one('locative', complement(home({ definiteness: 'bare' })))).toBe('a casa');
      expect(one('locative', complement(el(home(), np(MERCATO))))).toBe('a casa e nel mercato');
      expect(one('locative', complement(home({ definiteness: 'indefinite' })))).toBe('in una casa');
      expect(one('locative', complement(home({ number: 'plural' })))).toBe('nelle case');
      expect(one('locative', complement(home(), [path('under')]))).toBe('sotto la casa');
      expect(one('locative', complement(np(CASA)))).toBe('nella casa');
    });
  });

  describe('cause', () => {
    test('the sentiment picks the connector, each fused with the definite article', () => {
      expect(one('cause', complement(np(CANE)))).toBe('a causa del cane');
      expect(one('cause', complement(np(CANE), [sentiment('positive')]))).toBe('grazie al cane');
      expect(one('cause', complement(np(CANE), [sentiment('negative')]))).toBe('per colpa del cane');
      expect(one('cause', complement(np(VOLPE)))).toBe('a causa della volpe');
      expect(one('cause', complement(np(UOMO), [sentiment('positive')]))).toBe("grazie all'uomo");
      expect(one('cause', complement(np(CANE, { number: 'plural' }), [sentiment('negative')]))).toBe('per colpa dei cani');
    });

    test('a positive pronoun cause is grazie a + the tonic pronoun', () => {
      const positive = [sentiment('positive')];
      expect(one('cause', complement(np(IO), positive))).toBe('grazie a me');
      expect(one('cause', complement(np(LEI), positive))).toBe('grazie a lei');
      expect(one('cause', complement(np(NOI), positive))).toBe('grazie a noi');
    });

    // The possessive agrees with feminine "causa"/"colpa"; "loro" is invariable.
    test('a neutral or negative pronoun cause takes the possessive after the noun', () => {
      expect(one('cause', complement(np(IO)))).toBe('a causa mia');
      expect(one('cause', complement(np(TU)))).toBe('a causa tua');
      expect(one('cause', complement(np(LUI)))).toBe('a causa sua');
      expect(one('cause', complement(np(NOI)))).toBe('a causa nostra');
      expect(one('cause', complement(np(TU, { number: 'plural' })))).toBe('a causa vostra');
      expect(one('cause', complement(np(LORO)))).toBe('a causa loro');
      expect(one('cause', complement(np(IO), [sentiment('negative')]))).toBe('per colpa mia');
      expect(one('cause', complement(np(LEI), [sentiment('negative')]))).toBe('per colpa sua');
    });
  });

  describe('the complement noun phrase', () => {
    test('a prenominal adjective leads, so the article agrees with it', () => {
      expect(one('locative', complement(np(CASA, { definiteness: 'indefinite' }, { adjectives: [concept(PICCOLO, 'SMALL')] }))))
        .toBe('in una piccola casa');
      expect(one('terminus', complement(np(UOMO, {}, { adjectives: [concept(VECCHIO, 'OLD')] })))).toBe('al vecchio uomo');
      expect(one('direction', complement(np(RAGAZZO, { number: 'plural' }, { adjectives: [concept(GRANDE, 'BIG')] }))))
        .toBe('dai grandi ragazzi');
    });

    test('a relative clause trails the noun', () => {
      const burning = np(CASA, {}, { relative: { headRole: 'subject', verbPhrase: vp(BRUCIARE) } });
      expect(one('locative', complement(burning))).toBe('nella casa che brucia');
    });
  });

  describe('order and coordination', () => {
    test('several complements render in the fixed order, whatever the map order', () => {
      expect(complementsPhrase(complements({
        cause: complement(np(CANE)),
        direction: complement(np(MERCATO)),
        source: complement(np(CASA)),
      }), GATTO, 'GO')).toBe('dalla casa al mercato a causa del cane');
      expect(complementsPhrase(complements({
        locative: complement(np(CASA)),
        instrumental: complement(np(BASTONE)),
        terminus: complement(np(CANE)),
      }), GATTO, 'READ')).toBe('al cane con il bastone nella casa');
    });

    test('each conjunct carries its own fused preposition', () => {
      expect(one('locative', complement(group('or', np(CASA), np(MERCATO))))).toBe('nella casa o nel mercato');
      expect(one('direction', complement(el(np(RAGAZZO), np(CASA))))).toBe('dal ragazzo e alla casa');
    });
  });
});
