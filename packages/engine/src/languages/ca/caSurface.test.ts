import { describe, expect, test } from 'vitest';
import { caSurface, NO_ELISION } from './caSurface.js';

describe('caSurface', () => {
  test('el and la elide before a vowel or h + vowel', () => {
    expect(caSurface('el home')).toBe("l'home");
    expect(caSurface('la aigua')).toBe("l'aigua");
    expect(caSurface('la hora')).toBe("l'hora");
    expect(caSurface('el altre gat')).toBe("l'altre gat");
  });

  test('la stays whole before an unstressed i-, u-, hi-, hu-, and elides before a stressed one', () => {
    expect(caSurface('la universitat')).toBe('la universitat');
    expect(caSurface('la història')).toBe('la història');
    expect(caSurface('la idea')).toBe('la idea');
    expect(caSurface('la illa')).toBe("l'illa");
    expect(caSurface('la única')).toBe("l'única");
    expect(caSurface('la Índia')).toBe("l'Índia");
  });

  test('a no_elision join is never elided, and comes out as a space', () => {
    expect(caSurface(`la${NO_ELISION}illa`)).toBe('la illa');
  });

  test('nothing elides before a semivowel', () => {
    expect(caSurface('el iogurt')).toBe('el iogurt');
    expect(caSurface('de iogurt')).toBe('de iogurt');
  });

  test('de elides before a vowel, including before an infinitive and a tonic pronoun', () => {
    expect(caSurface('un got de aigua')).toBe("un got d'aigua");
    expect(caSurface('de un gat')).toBe("d'un gat");
    expect(caSurface('ha de anar')).toBe("ha d'anar");
    expect(caSurface('a causa de ell')).toBe("a causa d'ell");
    expect(caSurface('de Europa')).toBe("d'Europa");
  });

  test('a, de and per contract with el and els, never with l\', la or les', () => {
    expect(caSurface('a el gat')).toBe('al gat');
    expect(caSurface('a els gats')).toBe('als gats');
    expect(caSurface('de el gat')).toBe('del gat');
    expect(caSurface('de els gats')).toBe('dels gats');
    expect(caSurface('per el parc')).toBe('pel parc');
    expect(caSurface('per els parcs')).toBe('pels parcs');
    expect(caSurface('per a el gat')).toBe('per al gat');
    expect(caSurface('cap a el nen')).toBe('cap al nen');
    expect(caSurface('a el home')).toBe("a l'home");
    expect(caSurface('de el home')).toBe("de l'home");
    expect(caSurface('a la casa')).toBe('a la casa');
    expect(caSurface('de les cases')).toBe('de les cases');
  });

  test('the weak pronouns em, et, es, el, la elide before a vowel', () => {
    expect(caSurface('em estimo')).toBe("m'estimo");
    expect(caSurface('et estimes')).toBe("t'estimes");
    expect(caSurface('es ha tornat')).toBe("s'ha tornat");
    expect(caSurface('el estima')).toBe("l'estima");
    expect(caSurface('no la ha vist')).toBe("no l'ha vist");
    expect(caSurface('ens estimem')).toBe('ens estimem');
  });

  test('a cluster\'s reduced pronoun elides before a vowel instead', () => {
    expect(caSurface("se'l estima")).toBe("se l'estima");
    expect(caSurface("me'l ha donat")).toBe("me l'ha donat");
    expect(caSurface("se'ls estima")).toBe("se'ls estima");
    expect(caSurface("se'l menja")).toBe("se'l menja");
  });

  test('the reflexive es is se before an s-', () => {
    expect(caSurface('es sent')).toBe('se sent');
  });

  test('keeps a capital and the punctuation around a word', () => {
    expect(caSurface('De Europa')).toBe("D'Europa");
    expect(caSurface('el gat, el home.')).toBe("el gat, l'home.");
  });

  test('is idempotent', () => {
    const once = caSurface('a el home de el gat');
    expect(caSurface(once)).toBe(once);
  });
});
