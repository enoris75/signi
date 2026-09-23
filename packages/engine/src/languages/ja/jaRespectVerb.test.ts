import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { jaRespectVerb } from './jaRespectVerb.js';

const EAT: ConceptForms = {
  conceptId: 'EAT',
  forms: {
    base: '食べる', reading: 'たべる', masu_present: '食べます', masu_present_reading: 'たべます',
    te: '食べて', te_reading: 'たべて', nai: '食べない', nai_reading: 'たべない', object_particle: 'を',
    honorific: '召し上がる', honorific_reading: 'めしあがる', honorific_masu_present: '召し上がります',
    honorific_masu_present_reading: 'めしあがります', honorific_te: '召し上がって', honorific_te_reading: 'めしあがって',
    honorific_nai: '召し上がらない', honorific_nai_reading: 'めしあがらない',
    humble: 'いただく', humble_masu_present: 'いただきます', humble_te: 'いただいて', humble_nai: 'いただかない',
  },
};

describe('jaRespectVerb', () => {
  test('the register column becomes the paradigm, readings and all', () => {
    const { forms } = jaRespectVerb(EAT, 'honorific');
    expect(forms).toMatchObject({
      base: '召し上がる', reading: 'めしあがる', masu_present: '召し上がります', masu_present_reading: 'めしあがります',
      te: '召し上がって', te_reading: 'めしあがって', nai: '召し上がらない', nai_reading: 'めしあがらない',
    });
    // The rest of the lexeme is the same verb's.
    expect(forms['object_particle']).toBe('を');
  });

  test('a kana word leaves no reading behind: いただく must not be read たべる', () => {
    const { forms } = jaRespectVerb(EAT, 'humble');
    expect(forms).toMatchObject({ base: 'いただく', masu_present: 'いただきます', te: 'いただいて', nai: 'いただかない' });
    for (const key of ['reading', 'masu_present_reading', 'te_reading', 'nai_reading']) expect(forms[key]).toBeUndefined();
  });

  test('no register, or a verb with no word for it, is the verb unchanged', () => {
    expect(jaRespectVerb(EAT, undefined)).toBe(EAT);
    const run: ConceptForms = { conceptId: 'RUN', forms: { base: '走る', masu_present: '走ります' } };
    expect(jaRespectVerb(run, 'honorific')).toBe(run);
  });
});
