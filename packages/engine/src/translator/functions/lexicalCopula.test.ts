import { describe, expect, test } from 'vitest';
import type { LexicalEntry } from '@signi/shared';
import { clause, complement, complements, np, vp } from '../../languages/resolved.fixtures.js';
import type { LexiconLookup } from '../translator.types.js';
import { lexicalCopula } from './lexicalCopula.js';

const LEXICON: Record<string, Record<string, string>> = {
  BE_FARING: { base: 'gehen' },
  THIRD_PERSON: { base: 'es', person: '3', number: 'singular', gender: 'neut' },
};
const lookup: LexiconLookup = (id, language) =>
  LEXICON[id] ? ({ conceptId: id, language, forms: LEXICON[id]! } as LexicalEntry) : undefined;

const CAT = np({ base: 'Kater', animate: '1' });
const be = (adjective: Record<string, string>, extra = {}) =>
  clause(CAT, vp({ base: 'sein', copula: '1' }, extra), { complements: complements({ predicative: complement(np(adjective)) }) });

describe('lexicalCopula', () => {
  test('a predicate naming a copula replaces BE, keeping the clause\'s tense and negation', () => {
    const swapped = lexicalCopula(be({ base: 'bene', copula: 'BE_FARING' }, { tense: 'past', negative: true }), 'it', lookup);
    expect(swapped.verbPhrase?.verb).toEqual({ conceptId: 'BE_FARING', forms: { base: 'gehen' } });
    expect(swapped.verbPhrase).toMatchObject({ tense: 'past', negative: true });
    expect(swapped.dativeFront).toBeUndefined();
  });

  test('the experiencer frame puts the subject in the dative, fronted, with es as the subject', () => {
    const swapped = lexicalCopula(be({ base: 'gut', copula: 'BE_FARING', experiencer: '1' }), 'de', lookup);
    expect(swapped.subject.conjuncts[0]!.head.forms['base']).toBe('es');
    expect(swapped.complements?.['terminus']?.phrase.conjuncts[0]!.head.forms['base']).toBe('Kater');
    expect(swapped.verbPhrase?.verb.forms['terminus_dative']).toBe('1');
    expect(swapped.dativeFront).toBe(true);
  });

  test('an infinitive has no subject to put in the dative', () => {
    const cited = lexicalCopula(be({ base: 'gut', copula: 'BE_FARING', experiencer: '1' }, { mood: 'infinitive' }), 'de', lookup);
    expect(cited.dativeFront).toBeUndefined();
    expect(cited.verbPhrase?.verb.conceptId).toBe('BE_FARING');
  });

  test('BE stays for a predicate naming none, an unseeded verb, or a verb that is not the copula', () => {
    const happy = be({ base: 'felice' });
    expect(lexicalCopula(happy, 'it', lookup)).toBe(happy);
    const unseeded = be({ base: 'bene', copula: 'NOWHERE' });
    expect(lexicalCopula(unseeded, 'it', lookup)).toBe(unseeded);
    const seems = clause(CAT, vp({ base: 'sembrare' }), { complements: complements({ predicative: complement(np({ base: 'bene', copula: 'BE_FARING' })) }) });
    expect(lexicalCopula(seems, 'it', lookup)).toBe(seems);
  });
});
