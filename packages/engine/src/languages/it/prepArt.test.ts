import { describe, expect, test } from 'vitest';
import { ALA, CASA, GATTO, LUCE, SLOT, UOMO } from './it.fixtures.js';
import { prepArt } from './prepArt.js';

describe('prepArt', () => {
  test('a fuses with every article form', () => {
    expect(prepArt('a', GATTO)).toBe('al');
    expect(prepArt('a', SLOT)).toBe('allo');
    expect(prepArt('a', CASA)).toBe('alla');
    expect(prepArt('a', UOMO)).toBe("all'");
    expect(prepArt('a', GATTO, true)).toBe('ai');
    expect(prepArt('a', UOMO, true)).toBe('agli');
    expect(prepArt('a', CASA, true)).toBe('alle');
  });

  test('da, di and in fuse the same way (di → de-, in → ne-)', () => {
    expect(prepArt('da', GATTO)).toBe('dal');
    expect(prepArt('da', ALA)).toBe("dall'");
    expect(prepArt('di', LUCE)).toBe('della');
    expect(prepArt('di', SLOT, true)).toBe('degli');
    expect(prepArt('di', GATTO, true)).toBe('dei');
    expect(prepArt('in', CASA)).toBe('nella');
    expect(prepArt('in', SLOT)).toBe('nello');
    expect(prepArt('in', CASA, true)).toBe('nelle');
  });

  test('the article is chosen against the word that follows', () => {
    // "al grande uomo", not "all'grande uomo"
    expect(prepArt('a', UOMO, false, 'grande')).toBe('al');
    expect(prepArt('di', UOMO, true, 'grandi')).toBe('dei');
  });
});
