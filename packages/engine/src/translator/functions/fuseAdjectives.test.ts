import { describe, expect, test } from 'vitest';
import { fuseAdjectives } from './fuseAdjectives.js';

// The Japanese BROTHER: one word for a brother of unstated age, and a word of its own for each age,
// each with its own honorific. The other six languages seed none of these columns.
const KYOUDAI = {
  base: '兄弟', reading: 'きょうだい', kin: '1',
  honorific: 'ご兄弟', honorific_reading: 'ごきょうだい',
  with_ELDER: '兄', with_ELDER_reading: 'あに',
  with_ELDER_honorific: 'お兄さん', with_ELDER_honorific_reading: 'おにいさん', with_ELDER_address_honorific: '1',
  with_YOUNGER: '弟', with_YOUNGER_reading: 'おとうと',
  with_YOUNGER_honorific: '弟さん', with_YOUNGER_honorific_reading: 'おとうとさん',
};

describe('fuseAdjectives', () => {
  test('an adjective the head has a word for becomes that word, and is spent', () => {
    const forms = { ...KYOUDAI };
    expect(fuseAdjectives(forms, ['ELDER'])).toEqual(new Set([0]));
    expect(forms).toMatchObject({ base: '兄', reading: 'あに', honorific: 'お兄さん', honorific_reading: 'おにいさん' });
  });

  // P11-E3: address calls an elder brother お兄さん, a younger one by name.
  test('the fused word says whether address takes its honorific', () => {
    const elder: Record<string, string> = { ...KYOUDAI };
    fuseAdjectives(elder, ['ELDER']);
    expect(elder['address_honorific']).toBe('1');
    const younger: Record<string, string> = { ...KYOUDAI, address_honorific: '1' };
    fuseAdjectives(younger, ['YOUNGER']);
    expect(younger['address_honorific']).toBeUndefined();
  });

  test('each age word is the head\'s own, not a prefix of the unfused one', () => {
    const forms = { ...KYOUDAI };
    fuseAdjectives(forms, ['YOUNGER']);
    expect(forms).toMatchObject({ base: '弟', reading: 'おとうと', honorific: '弟さん' });
  });

  test('a head with no column for the adjective keeps its word, and spends nothing', () => {
    // SON fuses nothing: Japanese says 上の息子, the older son, with the adjective as itself.
    const forms = { base: '息子', reading: 'むすこ', kin: '1', honorific: '息子さん' };
    expect(fuseAdjectives(forms, ['ELDER'])).toEqual(new Set());
    expect(forms).toEqual({ base: '息子', reading: 'むすこ', kin: '1', honorific: '息子さん' });
  });

  test('only the adjective named is spent, and the rest keep their index', () => {
    const forms = { ...KYOUDAI };
    expect(fuseAdjectives(forms, ['BIG', 'ELDER', 'TIRED'])).toEqual(new Set([1]));
  });

  test('the six languages that seed no column are untouched', () => {
    const seeded: Record<string, string>[] = [
      { base: 'fratello', plural: 'fratelli', gender: 'masc', kinship: '1' },
      { base: 'Bruder', plural: 'Brüder', gender: 'masc' },
    ];
    for (const forms of seeded) {
      const before = { ...forms };
      expect(fuseAdjectives(forms, ['ELDER', 'YOUNGER'])).toEqual(new Set());
      expect(forms).toEqual(before);
    }
  });

  test('a fused word with no reading of its own leaves none behind', () => {
    const forms = { base: '兄弟', reading: 'きょうだい', with_ELDER: 'あに' };
    fuseAdjectives(forms, ['ELDER']);
    expect(forms['reading']).toBeUndefined();
  });

  test('a fused word with no honorific drops the unfused word\'s', () => {
    const forms = { base: '兄弟', honorific: 'ご兄弟', honorific_reading: 'ごきょうだい', with_ELDER: '兄' };
    fuseAdjectives(forms, ['ELDER']);
    expect(forms['honorific']).toBeUndefined();
    expect(forms['honorific_reading']).toBeUndefined();
  });

  // The `possessed` column names the unfused lexeme's own-relative form, so the fused word — which is
  // a different word — must not inherit it.
  test('the unfused word\'s possessed form goes with it', () => {
    const forms = { base: '兄弟', possessed: '兄弟', possessed_reading: 'きょうだい', with_ELDER: '兄' };
    fuseAdjectives(forms, ['ELDER']);
    expect(forms['possessed']).toBeUndefined();
    expect(forms['possessed_reading']).toBeUndefined();
  });
});
