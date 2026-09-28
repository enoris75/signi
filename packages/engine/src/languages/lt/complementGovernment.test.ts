import { describe, expect, test } from 'vitest';
import type { ResolvedComplement } from '../../types.js';
import { complementGovernment } from './complementGovernment.js';
import { DUOTI, DZIAUGSMAS, NAMAS, VAIKAS } from './lt.fixtures.js';

const c = (specifiers: ResolvedComplement['specifiers'] = []): ResolvedComplement => ({ phrase: { conjuncts: [], agreement: {} }, specifiers });

describe('complementGovernment (P18 §2.3)', () => {
  test('locative: the bare locative; ant + gen, po + ins, aplink + acc', () => {
    expect(complementGovernment('locative', c(), NAMAS)).toEqual({ prep: '', case: 'loc' });
    expect(complementGovernment('locative', c([{ kind: 'path', value: 'on' }]), NAMAS)).toEqual({ prep: 'ant', case: 'gen' });
    expect(complementGovernment('locative', c([{ kind: 'path', value: 'under' }]), NAMAS)).toEqual({ prep: 'po', case: 'ins' });
    expect(complementGovernment('locative', c([{ kind: 'path', value: 'around' }]), NAMAS)).toEqual({ prep: 'aplink', case: 'acc' });
  });

  test('direction: į + acc, pas + acc to a person', () => {
    expect(complementGovernment('direction', c(), NAMAS)).toEqual({ prep: 'į', case: 'acc' });
    expect(complementGovernment('direction', c(), VAIKAS)).toEqual({ prep: 'pas', case: 'acc' });
    expect(complementGovernment('direction', c([{ kind: 'path', value: 'behind' }]), NAMAS)).toEqual({ prep: 'už', case: 'gen' });
  });

  test('source nuo / iš + gen, route per + acc', () => {
    expect(complementGovernment('source', c(), NAMAS)).toEqual({ prep: 'nuo', case: 'gen' });
    expect(complementGovernment('source', c([{ kind: 'path', value: 'in' }]), NAMAS)).toEqual({ prep: 'iš', case: 'gen' });
    expect(complementGovernment('source', c([{ kind: 'path', value: 'under' }]), NAMAS)).toEqual({ prep: 'iš po', case: 'gen' });
    expect(complementGovernment('route', c(), NAMAS)).toEqual({ prep: 'per', case: 'acc' });
  });

  test('cause: dėl + gen; the postposition dėka', () => {
    expect(complementGovernment('cause', c(), NAMAS)).toEqual({ prep: 'dėl', case: 'gen' });
    expect(complementGovernment('cause', c([{ kind: 'sentiment', value: 'positive' }]), NAMAS)).toEqual({ prep: 'dėka', case: 'gen', post: true });
  });

  test('manner by relation', () => {
    expect(complementGovernment('manner', c(), NAMAS)).toEqual({ prep: 'kaip', case: 'nom' });
    expect(complementGovernment('manner', c(), DZIAUGSMAS)).toEqual({ prep: 'su', case: 'ins' });
  });

  test('instrumental bare, terminus the verb\'s case', () => {
    expect(complementGovernment('instrumental', c(), NAMAS)).toEqual({ prep: '', case: 'ins' });
    expect(complementGovernment('instrumental', { ...c(), negative: true }, NAMAS)).toEqual({ prep: 'be', case: 'gen' });
    expect(complementGovernment('terminus', c(), NAMAS, DUOTI)).toEqual({ prep: '', case: 'dat' });
    expect(complementGovernment('terminus', c(), NAMAS, { terminus_prep: 'su', terminus_prep_case: 'ins' })).toEqual({ prep: 'su', case: 'ins' });
  });

  test('topic, comitative, purpose, temporal', () => {
    expect(complementGovernment('topic', c(), NAMAS)).toEqual({ prep: 'apie', case: 'acc' });
    expect(complementGovernment('comitative', c(), NAMAS)).toEqual({ prep: 'su', case: 'ins' });
    expect(complementGovernment('purpose', c(), NAMAS)).toEqual({ prep: '', case: 'dat' });
    expect(complementGovernment('temporal', c([{ kind: 'temporal', value: 'after' }]), NAMAS)).toEqual({ prep: 'po', case: 'gen' });
    expect(complementGovernment('temporal', c([{ kind: 'temporal', value: 'ago' }]), NAMAS)).toEqual({ prep: 'prieš', case: 'acc' });
  });
});
