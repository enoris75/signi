import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { applyKinName } from './applyKinName.js';

const MOM = { base: 'mom', plural: 'moms', as_name: '1' };

describe('applyKinName', () => {
  test('a definite kin term with nothing on it is a name: proper, capitalized, the word kept', () => {
    const forms = { ...MOM };
    applyKinName({ concept: 'MOM' }, forms);
    expect(forms).toEqual({ ...MOM, base: 'Mom', proper: '1', name_of: 'mom' });
  });

  test('capitalizes a cased word and leaves an uncased script alone', () => {
    const es = { base: 'mamá', as_name: '1' };
    applyKinName({ concept: 'MOM' }, es);
    expect(es['base']).toBe('Mamá');
    const ja = { base: 'お母さん', as_name: '1' };
    applyKinName({ concept: 'MOM' }, ja);
    expect(ja['base']).toBe('お母さん');
  });

  test('only a lexeme that says so', () => {
    const forms = { base: 'mamma' };
    applyKinName({ concept: 'MOM' }, forms);
    expect(forms).toEqual({ base: 'mamma' });
  });

  test.each<[string, Partial<NounPhrase>]>([
    ['indefinite', { definiteness: 'indefinite' }],
    ['plural', { number: 'plural' }],
    ['possessed', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }],
    ['modified', { adjectives: ['OLD'] }],
    ['noun-modified', { nounModifiers: [{ concept: 'HOUSE', relation: 'feature' }] }],
    ['counted', { numeral: 1 }],
    ['titled', { title: 'MR' }],
  ])('a %s one stays the common noun', (_, extra) => {
    const forms = { ...MOM };
    applyKinName({ concept: 'MOM', ...extra }, forms);
    expect(forms).toEqual(MOM);
  });
});
