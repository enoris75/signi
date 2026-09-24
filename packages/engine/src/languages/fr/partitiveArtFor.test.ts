import { describe, expect, test } from 'vitest';
import { AFRIQUE, ANGE, ARGENT, EAU, HOMME, MOT, NOURRITURE, PHRASE, SOURIS } from './fr.fixtures.js';
import { partitiveArtFor } from './partitiveArtFor.js';

describe('partitiveArtFor', () => {
  test('a bare plural takes the indefinite des', () => {
    expect(partitiveArtFor({ ...SOURIS, definiteness: 'bare' }, true, 'souris')).toBe('des');
    expect(partitiveArtFor({ ...ANGE, definiteness: 'bare' }, true, 'anges')).toBe('des');
  });

  test('which is de before a prenominal adjective, as the indefinite is', () => {
    expect(partitiveArtFor({ ...SOURIS, definiteness: 'bare' }, true, 'grandes')).toBe('de');
    expect(partitiveArtFor({ ...MOT, definiteness: 'bare' }, true, 'autres')).toBe("d'");
  });

  test('a bare singular mass noun takes the partitive, eliding before a vowel sound', () => {
    expect(partitiveArtFor({ ...EAU, definiteness: 'bare' }, false, 'eau')).toBe("de l'");
    expect(partitiveArtFor({ ...NOURRITURE, definiteness: 'bare' }, false, 'nourriture')).toBe('de la');
    expect(partitiveArtFor({ ...ARGENT, definiteness: 'bare' }, false, 'argent')).toBe("de l'");
  });

  // A207: a count noun has no partitive reading; its bare singular is the generic definite.
  test('a bare singular count noun takes the definite, eliding as it does', () => {
    expect(partitiveArtFor({ ...MOT, definiteness: 'bare' }, false, 'mot')).toBe('le');
    expect(partitiveArtFor({ ...PHRASE, definiteness: 'bare' }, false, 'phrase')).toBe('la');
    expect(partitiveArtFor({ ...HOMME, definiteness: 'bare' }, false, 'homme')).toBe("l'");
    expect(partitiveArtFor({ ...ANGE, definiteness: 'bare' }, false, 'ange')).toBe("l'");
  });

  // A292: the numeral is the article of a counted argument, plural or singular.
  test('a counted bare phrase takes none', () => {
    expect(partitiveArtFor({ ...MOT, definiteness: 'bare', numeral: '2' }, true, 'deux')).toBe('');
    expect(partitiveArtFor({ ...MOT, definiteness: 'bare', numeral: '1' }, false, 'un')).toBe('');
    expect(partitiveArtFor({ ...MOT, numeral: '2' }, true, 'deux')).toBe('les');
  });

  test('any other determiner is the article artFor gives', () => {
    expect(partitiveArtFor(MOT, false, 'mot')).toBe('le');
    expect(partitiveArtFor({ ...MOT, definiteness: 'indefinite' }, false, 'mot')).toBe('un');
    expect(partitiveArtFor({ ...EAU, definiteness: 'indefinite' }, false, 'eau')).toBe("de l'");
    expect(partitiveArtFor({ ...MOT, definiteness: 'some' }, true, 'mots')).toBe('quelques');
    expect(partitiveArtFor({ ...MOT, definiteness: 'this' }, false, 'mot')).toBe('ce');
  });

  test('a proper noun keeps the article it always takes', () => {
    expect(partitiveArtFor({ ...AFRIQUE, definiteness: 'bare' }, false, 'Afrique')).toBe("l'");
  });
});
