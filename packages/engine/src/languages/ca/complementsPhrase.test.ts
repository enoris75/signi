import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, CauseSentiment, PathSpecifier, Specifier, TemporalRelation } from '@signi/shared';
import { complementsPhrase } from './complementsPhrase.js';
import {
  AFRICA, AIGUA, AMIC, ARBRE, BO, CANSAT, CASA, complement, complements, CURA, DIA, DONA, el, ELL, EUROPA, FELIC, type Forms,
  GAT, GOS, GRAN, HISTORIA, HOME, JO, LLEGENDA, MANERA, MENJAR, MERCAT, NEN, NOSALTRES, np, PAL, PARAULA, TU, VELOCITAT, VENT, vp,
} from './ca.fixtures.js';

const path = (value: PathSpecifier): Specifier => ({ kind: 'path', value });
const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });
const time = (value: TemporalRelation): Specifier => ({ kind: 'temporal', value } as Specifier);
const MY = { kind: 'pronominal', person: '1', number: 'singular' } as const;

const render = (map: Parameters<typeof complements>[0], subject: Forms = GAT, verb = 'TEST') =>
  complementsPhrase(complements(map), subject, verb);

describe('complementsPhrase', () => {
  test('renders nothing without complements', () => {
    expect(complementsPhrase(undefined, GAT, 'RUN')).toBe('');
  });

  describe('predicative', () => {
    test('a predicate adjective agrees with the subject and carries its degree', () => {
      expect(render({ predicative: complement(np(CANSAT)) }, DONA)).toBe('cansada');
      expect(render({ predicative: complement(np(CANSAT)) }, { ...GAT, number: 'plural' })).toBe('cansats');
      expect(render({ predicative: complement(np(FELIC)) }, NOSALTRES)).toBe('feliços');
      expect(render({ predicative: complement(np(CANSAT, { degree: 'more' })) }, DONA)).toBe('més cansada');
    });

    test('a predicate superlative adds its own article, agreeing with the subject', () => {
      expect(render({ predicative: complement(np(FELIC, { degree: 'most' })) })).toBe('el més feliç');
      expect(render({ predicative: complement(np(GRAN, { degree: 'least' })) }, { ...CASA, number: 'plural' })).toBe('les menys grans');
      expect(render({ predicative: complement(np(BO, { degree: 'most' })) })).toBe('el millor');
    });

    test('a predicate noun keeps its own article, with no preposition', () => {
      expect(render({ predicative: complement(np(LLEGENDA, { definiteness: 'indefinite' })) })).toBe('una llegenda');
      expect(render({ predicative: complement(np(GAT, { number: 'plural', definiteness: 'indefinite' })) })).toBe('gats');
    });
  });

  describe('place and motion', () => {
    test('the locative: a before the definite article, en before any other determiner', () => {
      expect(render({ locative: complement(np(CASA)) })).toBe('a la casa');
      expect(render({ locative: complement(np(ARBRE)) })).toBe("a l'arbre");
      expect(render({ locative: complement(np(MERCAT)) })).toBe('al mercat');
      expect(render({ locative: complement(np(CASA, { definiteness: 'indefinite' })) })).toBe('en una casa');
      expect(render({ locative: complement(np(CASA, { definiteness: 'this' })) })).toBe('en aquesta casa');
      expect(render({ locative: complement(np(EUROPA)) })).toBe('a Europa');
    });

    test('a counted phrase keeps its numeral', () => {
      expect(render({ locative: complement(np(CASA, { number: 'plural', numeral: '3' })) })).toBe('a les tres cases');
    });

    test('a possessive rides on the article; a determiner of the head\'s own detaches it', () => {
      expect(render({ locative: complement(np(CASA, {}, { possessor: MY })) })).toBe('a la meva casa');
      expect(render({ locative: complement(np(CASA, { number: 'plural', definiteness: 'all' }, { possessor: MY })) })).toBe('en totes les meves cases');
      expect(render({ locative: complement(np(CASA, { definiteness: 'this' }, { possessor: MY })) })).toBe('en aquesta casa meva');
    });

    test('the spatial relations', () => {
      expect(render({ locative: complement(np(CASA), [path('under')]) })).toBe('sota la casa');
      expect(render({ locative: complement(np(GOS), [path('behind')]) })).toBe('darrere del gos');
      expect(render({ locative: complement(np(CASA), [path('in_front_of')]) })).toBe('davant de la casa');
      expect(render({ locative: complement(np(ARBRE), [path('around')]) })).toBe("al voltant de l'arbre");
      expect(render({ locative: complement(np(CASA), [path('on')]) })).toBe('sobre la casa');
      expect(render({ locative: complement(el(np(CASA), np(ARBRE)), [path('between')]) })).toBe("entre la casa i l'arbre");
    });

    test('the direction: a to a place, cap a to someone', () => {
      expect(render({ direction: complement(np(MERCAT)) })).toBe('al mercat');
      expect(render({ direction: complement(np(NEN)) })).toBe('cap al nen');
      expect(render({ direction: complement(np(ELL)) })).toBe('cap a ell');
      expect(render({ direction: complement(np(AFRICA)) })).toBe("a l'Àfrica");
    });

    test('the source: lluny de after a self-propelled motion verb, de otherwise', () => {
      expect(render({ source: complement(np(CASA)) }, GAT, 'RUN')).toBe('lluny de la casa');
      expect(render({ source: complement(np(CASA)) }, GAT, 'COME')).toBe('de la casa');
      expect(render({ source: complement(np(HOME)) }, GAT, 'RUN')).toBe("lluny de l'home");
    });

    test('the route: per, contracting; a través de through a person', () => {
      expect(render({ route: complement(np(MERCAT), [path('through')]) })).toBe('pel mercat');
      expect(render({ route: complement(np(HOME), [path('through')]) })).toBe("a través de l'home");
    });
  });

  describe('the others', () => {
    test('the terminus is a, contracting', () => {
      expect(render({ terminus: complement(np(GOS)) })).toBe('al gos');
      expect(render({ terminus: complement(np(GOS, { number: 'plural' })) })).toBe('als gossos');
      expect(render({ terminus: complement(np(HOME)) })).toBe("a l'home");
    });

    test('instrumental and comitative amb, the privative sense; a pronoun takes its tonic form', () => {
      expect(render({ instrumental: complement(np(PAL)) })).toBe('amb el pal');
      expect(render({ comitative: complement(np(GOS)) })).toBe('amb el gos');
      expect(render({ comitative: complement(np(JO)) })).toBe('amb mi');
      expect(render({ comitative: complement(np(TU)) })).toBe('amb tu');
    });

    test('an instrument presented as an action', () => {
      const word = np(PARAULA, { definiteness: 'indefinite' });
      expect(render({ instrumental: complement(word, [abstraction('process')], vp(MENJAR)) })).toBe('menjant una paraula');
    });

    test('the manner: com, amb, a, de', () => {
      expect(render({ manner: complement(np(VENT)) })).toBe('com el vent');
      expect(render({ manner: complement(np(AIGUA)) })).toBe("com l'aigua");
      expect(render({ manner: complement(np(CURA, { definiteness: 'bare' })) })).toBe('amb cura');
      expect(render({ manner: complement(np(VELOCITAT, { definiteness: 'bare' }, { adjectives: [] })) })).toBe('a velocitat');
      expect(render({ manner: complement(np(MANERA, { definiteness: 'indefinite' })) })).toBe("d'una manera");
      expect(render({ manner: complement(np(JO)) })).toBe('com jo');
    });

    test('the cause and its sentiments', () => {
      expect(render({ cause: complement(np(GOS)) })).toBe('a causa del gos');
      expect(render({ cause: complement(np(GOS), [sentiment('positive')]) })).toBe('gràcies al gos');
      expect(render({ cause: complement(np(DONA), [sentiment('negative')]) })).toBe('per culpa de la dona');
      expect(render({ cause: complement(np(HOME), [sentiment('negative')]) })).toBe("per culpa de l'home");
    });

    test('a pronoun cause: the possessive for the 1st and 2nd persons, de + tonic for the 3rd', () => {
      expect(render({ cause: complement(np(JO), [sentiment('negative')]) })).toBe('per culpa meva');
      expect(render({ cause: complement(np(TU)) })).toBe('a causa teva');
      expect(render({ cause: complement(np(ELL), [sentiment('negative')]) })).toBe("per culpa d'ell");
      expect(render({ cause: complement(np(JO), [sentiment('positive')]) })).toBe('gràcies a mi');
      expect(render({ cause: complement(el(np(DONA), np(TU)), [sentiment('positive')]) })).toBe('gràcies a la dona i a tu');
    });

    test('the purpose per a, the topic sobre', () => {
      expect(render({ purpose: complement(np(HOME)) })).toBe("per a l'home");
      expect(render({ purpose: complement(np(GAT)) })).toBe('per al gat');
      expect(render({ topic: complement(np(GAT)) })).toBe('sobre el gat');
    });

    test('the role is com a, without an article', () => {
      expect(render({ role: complement(np(AMIC, { definiteness: 'indefinite' })) })).toBe('com a amic');
    });

    test('a time', () => {
      expect(render({ temporal: complement(np(DIA), [time('after')]) })).toBe('després del dia');
      expect(render({ temporal: complement(np(DIA), [time('before')]) })).toBe('abans del dia');
      expect(render({ temporal: complement(np(DIA), [time('until')]) })).toBe('fins al dia');
      expect(render({ temporal: complement(np(DIA), [time('since')]) })).toBe('des del dia');
      expect(render({ temporal: complement(np(DIA), [time('during')]) })).toBe('durant el dia');
      expect(render({ temporal: complement(np(DIA, { definiteness: 'indefinite' }), [time('ago')]) })).toBe('fa un dia');
    });

    test('a no_elision noun keeps its la after a preposition', () => {
      expect(render({ topic: complement(np(HISTORIA)) })).toBe('sobre la història');
    });
  });
});
