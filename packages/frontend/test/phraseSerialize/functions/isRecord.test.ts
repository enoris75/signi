import { describe, expect, it } from 'vitest';
import { isRecord } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/isRecord.ts';

describe('isRecord', () => {
  it.each([[{}], [{ subject: 'CAT' }]])('takes %j for an object', (value) => {
    expect(isRecord(value)).toBe(true);
  });

  it.each([[null], [undefined], [[]], [[{ subject: 'CAT' }]], ['CAT'], [42], [true]])('takes %j for none', (value) => {
    expect(isRecord(value)).toBe(false);
  });
});
