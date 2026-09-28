import { describe, expect, test } from 'vitest';
import type { ResolvedComplement } from '../../types.js';
import { complementGovernment } from './complementGovernment.js';
import { DAWAC, DOM, RADOSC } from './pl.fixtures.js';

const c = (specifiers: ResolvedComplement['specifiers'] = []): ResolvedComplement => ({ phrase: { conjuncts: [], agreement: {} }, specifiers });

describe('complementGovernment (P05 §2.3)', () => {
  test('locative: w + loc; pod + ins; wokół + gen', () => {
    expect(complementGovernment('locative', c(), DOM)).toEqual({ prep: 'w', case: 'loc' });
    expect(complementGovernment('locative', c([{ kind: 'path', value: 'under' }]), DOM)).toEqual({ prep: 'pod', case: 'ins' });
    expect(complementGovernment('locative', c([{ kind: 'path', value: 'around' }]), DOM)).toEqual({ prep: 'wokół', case: 'gen' });
  });

  test('direction: do + gen; a relation takes the accusative of motion', () => {
    expect(complementGovernment('direction', c(), DOM)).toEqual({ prep: 'do', case: 'gen' });
    expect(complementGovernment('direction', c([{ kind: 'path', value: 'under' }]), DOM)).toEqual({ prep: 'pod', case: 'acc' });
  });

  test('source od + gen, route przez + acc', () => {
    expect(complementGovernment('source', c(), DOM)).toEqual({ prep: 'od', case: 'gen' });
    expect(complementGovernment('route', c(), DOM)).toEqual({ prep: 'przez', case: 'acc' });
  });

  test('cause by sentiment', () => {
    expect(complementGovernment('cause', c(), DOM)).toEqual({ prep: 'z powodu', case: 'gen' });
    expect(complementGovernment('cause', c([{ kind: 'sentiment', value: 'positive' }]), DOM)).toEqual({ prep: 'dzięki', case: 'dat' });
    expect(complementGovernment('cause', c([{ kind: 'sentiment', value: 'negative' }]), DOM)).toEqual({ prep: 'przez', case: 'acc' });
  });

  test('manner by relation', () => {
    expect(complementGovernment('manner', c(), DOM)).toEqual({ prep: 'jak', case: 'nom' });
    expect(complementGovernment('manner', c(), RADOSC)).toEqual({ prep: 'z', case: 'ins' });
  });

  test('instrumental bare, terminus the verb\'s case', () => {
    expect(complementGovernment('instrumental', c(), DOM)).toEqual({ prep: '', case: 'ins' });
    expect(complementGovernment('instrumental', { ...c(), negative: true }, DOM)).toEqual({ prep: 'bez', case: 'gen' });
    expect(complementGovernment('terminus', c(), DOM, DAWAC)).toEqual({ prep: '', case: 'dat' });
    expect(complementGovernment('terminus', c(), DOM, { terminus_prep: 'do', terminus_prep_case: 'gen' })).toEqual({ prep: 'do', case: 'gen' });
  });

  test('topic, comitative, purpose, temporal', () => {
    expect(complementGovernment('topic', c(), DOM)).toEqual({ prep: 'o', case: 'loc' });
    expect(complementGovernment('comitative', c(), DOM)).toEqual({ prep: 'z', case: 'ins' });
    expect(complementGovernment('purpose', c(), DOM)).toEqual({ prep: 'dla', case: 'gen' });
    expect(complementGovernment('temporal', c([{ kind: 'temporal', value: 'after' }]), DOM)).toEqual({ prep: 'po', case: 'loc' });
  });
});
