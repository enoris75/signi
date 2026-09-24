import { describe, expect, test } from 'vitest';
import { questionPossessor } from '../../functions/questionPossessor.js';
import type { PronominalPossessor } from '@signi/shared';
import { artFor } from './artFor.js';
import {
  adj, ALA, AZIONE, BARCA, BELLO, CANE, CASA, concept, DONNA, el, FELICE, type Forms, FORTE, FREDDO, GATTA, GATTO, GRANDE, LIBRO,
  MANGIARE, nounModifier, np, PADRE, RAGAZZO, SLOT, TOPO, UOMO, VECCHIO, VELA, vp,
} from './it.fixtures.js';
import { renderNP } from './renderNP.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import type { ResolvedNounPhrase } from '../../types.js';

const BIG = concept(GRANDE, 'BIG');
const OLD = concept(VECCHIO, 'OLD');
const BEAUTIFUL = concept(BELLO, 'BEAUTIFUL');
const ELEGANTE: Forms = { role: 'adjective', base: 'elegante' };

/** The phrase under the determiner its own forms carry, read as every caller reads them (`itPossessedHeadForms`). */
const withDeterminer = (phrase: ResolvedNounPhrase) => renderNP(phrase, (plural, lead) => artFor(itPossessedHeadForms(phrase), plural, lead));
const pronominal = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number });

describe('renderNP', () => {
  test('hands the head builder the plurality and the word that follows it', () => {
    const calls: Array<[boolean, string]> = [];
    const spy = (text: string) => (plural: boolean, lead: string) => { calls.push([plural, lead]); return text; };
    expect(renderNP(np(GATTO, { number: 'plural' }), spy('i'))).toBe('i gatti');
    expect(renderNP(np(UOMO, {}, { adjectives: [BIG] }), spy('il'))).toBe('il grande uomo');
    expect(calls).toEqual([[true, 'gatti'], [false, 'grande']]);
  });

  test('the article elides onto the noun with no space', () => {
    expect(withDeterminer(np(UOMO))).toBe("l'uomo");
    expect(withDeterminer(np(SLOT))).toBe('lo slot');
    expect(withDeterminer(np(UOMO, { number: 'plural' }))).toBe('gli uomini');
  });

  test('an empty head leaves the bare noun', () => {
    expect(renderNP(np(GATTO, { number: 'plural' }), () => '')).toBe('gatti');
  });

  test('a no-determined phrase stays singular even when a plural was asked for', () => {
    expect(withDeterminer(np(TOPO, { definiteness: 'no', number: 'plural' }))).toBe('nessun topo');
  });

  describe('adjectives', () => {
    // One qualifying adjective takes the prenominal slot; the rest follow the noun (A145).
    test('the first prenominal adjective precedes the noun and agrees with it', () => {
      expect(withDeterminer(np(GATTO, {}, { adjectives: [BIG] }))).toBe('il grande gatto');
      expect(withDeterminer(np(GATTA, { number: 'plural' }, { adjectives: [BIG, OLD] }))).toBe('le grandi gatte vecchie');
    });

    test('bello inflects for the word after it, and the article for bello', () => {
      expect(withDeterminer(np(GATTO, {}, { adjectives: [BEAUTIFUL] }))).toBe('il bel gatto');
      expect(withDeterminer(np(UOMO, {}, { adjectives: [BEAUTIFUL] }))).toBe("il bell'uomo");
      expect(withDeterminer(np(UOMO, { number: 'plural' }, { adjectives: [BEAUTIFUL] }))).toBe('i begli uomini');
      // Demoted behind the noun, "bello" is the plain postnominal form and joins A27's list.
      expect(withDeterminer(np(GATTO, {}, { adjectives: [BIG, OLD, BEAUTIFUL] }))).toBe('il grande gatto vecchio e bello');
      expect(withDeterminer(np(GATTO, {}, { adjectives: [BEAUTIFUL, BIG] }))).toBe('il bel gatto grande');
    });

    test('other adjectives follow the noun, listed with a single conjunction', () => {
      expect(withDeterminer(np(GATTO, {}, { adjectives: [adj(FORTE)] }))).toBe('il gatto forte');
      expect(withDeterminer(np(GATTO, {}, { adjectives: [adj(FORTE), adj(FELICE), adj(FREDDO)] }))).toBe('il gatto forte, felice e freddo');
      expect(withDeterminer(np(GATTA, { number: 'plural' }, { adjectives: [adj(FORTE), adj(FELICE)] }))).toBe('le gatte forti e felici');
      expect(withDeterminer(np(GATTO, {}, { adjectives: [BIG, adj(FELICE)] }))).toBe('il grande gatto felice');
    });

    test('the conjunction becomes ed before an e-', () => {
      expect(withDeterminer(np(DONNA, {}, { adjectives: [adj(FORTE), adj(ELEGANTE)] }))).toBe('la donna forte ed elegante');
    });

    // The comparative and relative superlative share "più"; the article tells them apart (C01).
    test('a compared adjective follows the noun behind its degree adverb, even a prenominal one', () => {
      expect(withDeterminer(np(GATTO, {}, { adjectives: [concept({ ...GRANDE, degree: 'more' }, 'BIG')] }))).toBe('il gatto più grande');
      expect(withDeterminer(np(UOMO, {}, { adjectives: [concept({ ...GRANDE, degree: 'equally' }, 'BIG')] }))).toBe("l'uomo ugualmente grande");
      expect(withDeterminer(np(GATTO, {}, { adjectives: [adj(FELICE, { degree: 'less' })] }))).toBe('il gatto meno felice');
      expect(withDeterminer(np(GATTO, {}, { adjectives: [OLD, concept({ ...GRANDE, degree: 'most' }, 'BIG')] }))).toBe('il vecchio gatto più grande');
    });
  });

  test('attributive nouns trail the adjectives', () => {
    expect(withDeterminer(np(BARCA, {}, { adjectives: [BIG], nounModifiers: [nounModifier(VELA)] }))).toBe('la grande barca a vela');
  });

  describe('possessors', () => {
    test('a pronominal possessor is a prenominal possessive carried by the definite article', () => {
      expect(withDeterminer(np(CANE, {}, { possessor: pronominal('3') }))).toBe('il suo cane');
      expect(withDeterminer(np(CASA, {}, { possessor: pronominal('1', 'plural') }))).toBe('la nostra casa');
      expect(withDeterminer(np(LIBRO, { number: 'plural' }, { possessor: pronominal('3') }))).toBe('i suoi libri');
      expect(withDeterminer(np(CASA, { number: 'plural' }, { possessor: pronominal('3', 'plural') }))).toBe('le loro case');
    });

    test('the possessive leads the prenominal adjectives and forces the definite article', () => {
      expect(withDeterminer(np(CANE, {}, { adjectives: [BIG], possessor: pronominal('1') }))).toBe('il mio grande cane');
      expect(withDeterminer(np(UOMO, { definiteness: 'bare' }, { possessor: pronominal('2') }))).toBe('il tuo uomo');
      // The singular indefinite keeps its article, and the possessive stacks after it (A277).
      expect(withDeterminer(np(UOMO, { definiteness: 'indefinite' }, { possessor: pronominal('2') }))).toBe('un tuo uomo');
    });

    test('a noun possessor trails as di fused with its own article', () => {
      expect(withDeterminer(np(LIBRO, {}, { possessor: np(GATTO) }))).toBe('il libro del gatto');
      expect(withDeterminer(np(LIBRO, {}, { possessor: np(UOMO) }))).toBe("il libro dell'uomo");
      expect(withDeterminer(np(CASA, {}, { possessor: np(RAGAZZO, { number: 'plural' }, { adjectives: [BIG] }) }))).toBe('la casa dei grandi ragazzi');
    });

    test('a noun possessor keeps its own determiner, fusing di only with the definite article', () => {
      expect(withDeterminer(np(LIBRO, {}, { possessor: np(UOMO, { definiteness: 'indefinite' }) }))).toBe('il libro di un uomo');
      expect(withDeterminer(np(LIBRO, {}, { possessor: np(UOMO, { definiteness: 'this' }) }))).toBe("il libro di quest'uomo");
      expect(withDeterminer(np(LIBRO, {}, { possessor: np(RAGAZZO, { definiteness: 'some', number: 'plural' }) }))).toBe('il libro di alcuni ragazzi');
    });

    // A271: behind a compared adjective, its "di" would read as the standard.
    test('a noun possessor goes ahead of a compared adjective, not a superlative', () => {
      const more = adj(GRANDE, { degree: 'more' });
      expect(withDeterminer(np(GATTO, { definiteness: 'indefinite' }, { adjectives: [more], possessor: np(DONNA) })))
        .toBe('un gatto della donna più grande');
      expect(withDeterminer(np(GATTO, {}, { adjectives: [adj(FELICE, { degree: 'less' })], possessor: np(DONNA) })))
        .toBe('il gatto della donna meno felice');
      expect(withDeterminer(np(GATTO, {}, { adjectives: [more], possessor: questionPossessor() }))).toBe('il gatto di chi più grande');
      expect(withDeterminer(np(GATTO, {}, { adjectives: [adj(GRANDE, { degree: 'most' })], possessor: np(DONNA) })))
        .toBe('il gatto più grande della donna');
    });

    test('a noun possessor can carry its own possessor', () => {
      expect(withDeterminer(np(LIBRO, {}, { possessor: np(PADRE, {}, { possessor: np(GATTO) }) }))).toBe('il libro del padre del gatto');
    });

    test('a possessive before a singular, unmodified kinship noun takes no article, even inside a noun possessor', () => {
      expect(withDeterminer(np(PADRE, {}, { possessor: pronominal('1') }))).toBe('mio padre');
      expect(withDeterminer(np(LIBRO, {}, { possessor: np(PADRE, {}, { possessor: pronominal('2') }) }))).toBe('il libro di tuo padre');
      expect(withDeterminer(np(PADRE, {}, { possessor: pronominal('3', 'plural') }))).toBe('il loro padre');
    });
  });

  test('a relative clause closes the phrase', () => {
    const relative = { headRole: 'subject' as const, verbPhrase: vp(MANGIARE), directObject: el(np(TOPO)) };
    expect(withDeterminer(np(GATTO, {}, { adjectives: [adj(FELICE)], relative }))).toBe('il gatto felice che mangia il topo');
    expect(withDeterminer(np(GATTO, { number: 'plural' }, { relative }))).toBe('i gatti che mangiano il topo');
  });
});

describe('renderNP: the attributive standard (P09-E18)', () => {
  test('follows its adjective, ahead of a genitive possessor', () => {
    const compared = adj(GRANDE, { degree: 'more', standard: '1' });
    const phrase = np(GATTO, { definiteness: 'indefinite' }, {
      adjectives: [compared, adj(VECCHIO)],
      adjectiveStandard: { index: 0, standard: el(np(CANE, { definiteness: 'definite' })) },
    });
    expect(renderNP(phrase, (plural, lead) => artFor(itPossessedHeadForms(phrase), plural, lead))).toBe('un gatto vecchio e più grande del cane');
  });
});

describe('renderNP: the possessor question (P09-E14)', () => {
  test('the stand-in is di chi after the noun, which keeps its article', () => {
    expect(withDeterminer(np(GATTO, {}, { possessor: questionPossessor() }))).toBe('il gatto di chi');
    expect(withDeterminer(np(CASA, {}, { possessor: questionPossessor() }))).toBe('la casa di chi');
  });

  // The cardinal one is the indefinite article's own word, so it takes that article's form (A320).
  test('the cardinal one elides as the indefinite article does', () => {
    const one = (forms: Forms) => withDeterminer(np(forms, { definiteness: 'bare', numeral: '1' }));
    expect(one(ALA)).toBe("un'ala");
    expect(one(AZIONE)).toBe("un'azione");
    expect(one(CASA)).toBe('una casa');
    expect(one(CANE)).toBe('un cane');
    expect(one({ ...CANE, base: 'studente' })).toBe('uno studente');
  });
});

