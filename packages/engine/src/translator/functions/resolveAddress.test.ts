import { describe, expect, test } from 'vitest';
import { CANE, GATTO, lexicon } from '../translator.fixtures.js';
import { resolveAddress } from './resolveAddress.js';

// A name the language articles as a subject (pt "o Pedro"), and a kin term that is a name.
const PEDRO = { base: 'Pedro', gender: 'masc', proper: '1', human: '1' };
const MAMMA = { base: 'mamma', plural: 'mamme', gender: 'fem', as_name: '1' };
const LOOKUP = lexicon({ CAT: GATTO, DOG: CANE, PETER: PEDRO, MOM: MAMMA });

const heads = (address: Parameters<typeof resolveAddress>[0]) =>
  resolveAddress(address, 'it', LOOKUP).subject.conjuncts.map((np) => np.head.forms);

describe('resolveAddress', () => {
  test('is a verbless period whose one phrase is determiner-less, whatever the plan picked', () => {
    const phrase = resolveAddress({ concept: 'CAT', definiteness: 'indefinite' }, 'it', LOOKUP);
    expect(phrase.verbPhrase).toBeUndefined();
    expect(phrase.subject.conjuncts[0].head.forms).toMatchObject({ base: 'gatto', definiteness: 'bare' });
  });

  test('a name is bare too, where the language would article it', () => {
    expect(heads({ concept: 'PETER' })[0]).toMatchObject({ definiteness: 'bare', takes_article: '0' });
  });

  test('a kin term with `as_name` resolves as the name it is', () => {
    expect(heads({ concept: 'MOM' })[0]).toMatchObject({ base: 'Mamma', proper: '1' });
  });

  test('a coordination keeps its conjunction and agrees as a group', () => {
    const phrase = resolveAddress({ conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' }, 'it', LOOKUP);
    expect(phrase.subject.conjunction).toBe('and');
    expect(phrase.subject.conjuncts.map((np) => np.head.forms['definiteness'])).toEqual(['bare', 'bare']);
    expect(phrase.subject.agreement['number']).toBe('plural');
  });
});
