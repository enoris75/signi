import { describe, expect, test } from 'vitest';
import { caEnclitic } from './caEnclitic.js';

describe('caEnclitic', () => {
  test('the full form after a consonant or a -u diphthong', () => {
    expect(caEnclitic('menjar', 'el')).toBe('menjar-lo');
    expect(caEnclitic('mengem', 'el')).toBe('mengem-lo');
    expect(caEnclitic('mengeu', 'el')).toBe('mengeu-lo');
    expect(caEnclitic('tornar', 'es')).toBe('tornar-se');
    expect(caEnclitic('tornant', 'es')).toBe('tornant-se');
    expect(caEnclitic('torneu', 'us')).toBe('torneu-vos');
    expect(caEnclitic('tornem', 'ens')).toBe('tornem-nos');
  });

  test('the reduced form after any other vowel', () => {
    expect(caEnclitic('menja', 'el')).toBe("menja'l");
    expect(caEnclitic('torna', 'et')).toBe("torna't");
    expect(caEnclitic('moure', 'es')).toBe("moure's");
    expect(caEnclitic('menja', 'la')).toBe('menja-la');
    expect(caEnclitic('menja', 'els')).toBe("menja'ls");
  });

  test('a cluster attaches whole', () => {
    expect(caEnclitic('donar', "me'l")).toBe("donar-me'l");
    expect(caEnclitic('dona', "l'hi")).toBe("dona-l'hi");
  });

  test('a no-op with no clitic', () => {
    expect(caEnclitic('menjar', '')).toBe('menjar');
  });
});
