import { describe, expect, test } from 'vitest';
import { translateApproximator } from '../src/index.js';
import { clause, np, sayAll } from './harness.js';
import { isPreviewLanguage } from '@signi/shared';

// P09-E38: NounPhrase.approximator — `about` on a numeral, `almost` on the quantity determiners
// all / no / many. Anywhere else it is ignored. Spanish "unos / unas" is the article and agrees (D2).

describe('P09-E38: about on a numeral', () => {
  test('about five cats run — the approximated numeral drops the default definite article', () => {
    expect(sayAll(clause(np('CAT', { numeral: 5, approximator: 'about' }), 'RUN'))).toEqual({
      en: 'about five cats run.',
      it: 'circa cinque gatti corrono.',
      fr: 'environ cinq chats courent.',
      de: 'etwa fünf Kater laufen.',
      es: 'unos cinco gatos corren.',
      ja: '約五匹の猫は走ります。',
      pt: 'cerca de cinco gatos correm.',
    });
  });

  test('about twelve houses burn — Spanish "unas" agrees with a feminine noun', () => {
    expect(sayAll(clause(np('HOUSE', { numeral: 12, approximator: 'about' }), 'BURN'))).toEqual({
      en: 'about twelve houses burn.',
      it: 'circa dodici case bruciano.',
      fr: 'environ douze maisons brûlent.',
      de: 'etwa zwölf Häuser brennen.',
      es: 'unas doce casas arden.',
      ja: '約十二軒の家は燃えます。',
      pt: 'cerca de doze casas ardem.',
    });
  });

  test('on an object, before the adjectives', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { numeral: 5, approximator: 'about', adjectives: ['BIG'] }),
    }))).toEqual({
      en: 'the dog sees about five big cats.',
      it: 'il cane vede circa cinque grandi gatti.',
      fr: 'le chien voit environ cinq grands chats.',
      de: 'der Hund sieht etwa fünf große Kater.',
      es: 'el perro ve unos cinco gatos grandes.',
      ja: '犬は約五匹の大きい猫を見ます。',
      pt: 'o cão vê cerca de cinco gatos grandes.',
    });
  });

  test('the indefinite reads the same; a demonstrative keeps its place', () => {
    expect(sayAll(clause(np('CAT', { numeral: 5, approximator: 'about', definiteness: 'indefinite' }), 'RUN')))
      .toMatchObject({ en: 'about five cats run.', es: 'unos cinco gatos corren.' });
    expect(sayAll(clause(np('CAT', { numeral: 5, approximator: 'about', definiteness: 'this' }), 'RUN')))
      .toMatchObject({ en: 'these about five cats run.', it: 'questi circa cinque gatti corrono.', de: 'diese etwa fünf Kater laufen.' });
  });

  test('without a numeral it is ignored', () => {
    expect(sayAll(clause(np('CAT', { approximator: 'about' }), 'RUN'))).toMatchObject({ en: 'the cat runs.', es: 'el gato corre.' });
  });
});

describe('P09-E38: almost on a quantity determiner', () => {
  test('almost all cats run', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'all', approximator: 'almost' }), 'RUN'))).toEqual({
      en: 'almost all cats run.',
      it: 'quasi tutti i gatti corrono.',
      fr: 'presque tous les chats courent.',
      de: 'fast alle Kater laufen.',
      es: 'casi todos los gatos corren.',
      ja: 'ほとんどすべての猫は走ります。',
      pt: 'quase todos os gatos correm.',
    });
  });

  test('almost all houses burn — the quantifier still agrees', () => {
    expect(sayAll(clause(np('HOUSE', { definiteness: 'all', approximator: 'almost' }), 'BURN'))).toMatchObject({
      it: 'quasi tutte le case bruciano.', fr: 'presque toutes les maisons brûlent.', es: 'casi todas las casas arden.', pt: 'quase todas as casas ardem.',
    });
  });

  test('almost no cat runs — the negative concord is untouched; Japanese keeps its circumfix', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'no', approximator: 'almost' }), 'RUN'))).toEqual({
      en: 'almost no cat runs.',
      it: 'quasi nessun gatto corre.',
      fr: 'presque aucun chat ne court.',
      de: 'fast kein Kater läuft.',
      es: 'casi ningún gato corre.',
      ja: 'ほとんどどの猫も走りません。',
      pt: 'quase nenhum gato corre.',
    });
  });

  test('almost no cat as the object', () => {
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: np('CAT', { definiteness: 'no', approximator: 'almost' }) }))).toEqual({
      en: 'the dog sees almost no cat.',
      it: 'il cane non vede quasi nessun gatto.',
      fr: 'le chien ne voit presque aucun chat.',
      de: 'der Hund sieht fast keinen Kater.',
      es: 'el perro no ve casi ningún gato.',
      ja: '犬はほとんどどの猫も見ません。',
      pt: 'o cão não vê quase nenhum gato.',
    });
  });

  test('almost many cats run (D1 admits many)', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'many', approximator: 'almost' }), 'RUN'))).toEqual({
      en: 'almost many cats run.',
      it: 'quasi molti gatti corrono.',
      fr: 'presque beaucoup de chats courent.',
      de: 'fast viele Kater laufen.',
      es: 'casi muchos gatos corren.',
      ja: 'ほとんど多くの猫は走ります。',
      pt: 'quase muitos gatos correm.',
    });
  });

  test('on a mass noun and inside a complement', () => {
    expect(sayAll(clause(np('DOG'), 'EAT', { directObject: np('FOOD', { definiteness: 'all', approximator: 'almost' }) }))).toMatchObject({
      en: 'the dog eats almost all food.', it: 'il cane mangia quasi tutto il cibo.', fr: 'le chien mange presque toute la nourriture.',
      es: 'el perro come casi toda la comida.', pt: 'o cão come quase toda a comida.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('HOUSE', { definiteness: 'all', approximator: 'almost' }) } } }))).toEqual({
      en: 'the cat runs in almost all houses.',
      it: 'il gatto corre in quasi tutte le case.',
      fr: 'le chat court dans presque toutes les maisons.',
      de: 'der Kater läuft in fast allen Häusern.',
      es: 'el gato corre en casi todas las casas.',
      ja: '猫はほとんどすべての家で走ります。',
      pt: 'o gato corre em quase todas as casas.',
    });
  });

  test('anywhere else it is ignored: on the definite, and on a numeral (D1)', () => {
    expect(sayAll(clause(np('CAT', { approximator: 'almost' }), 'RUN'))).toMatchObject({ en: 'the cat runs.', it: 'il gatto corre.' });
    expect(sayAll(clause(np('CAT', { numeral: 5, approximator: 'almost' }), 'RUN'))).toMatchObject({ en: 'the five cats run.', it: 'i cinque gatti corrono.' });
  });
});

// P09-E49: the determiner menu's approximator row is labelled with the word it adds — the one the
// sentence writes, Spanish's agreeing *about* cited in the masculine.
describe('P09-E49: the approximator row’s label', () => {
  const label = (a: 'about' | 'almost') => Object.fromEntries(translateApproximator(a).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]));

  test('about', () => {
    expect(label('about')).toEqual({ en: 'about', it: 'circa', fr: 'environ', de: 'etwa', es: 'unos', pt: 'cerca de', ja: '約' });
  });

  test('almost', () => {
    expect(label('almost')).toEqual({ en: 'almost', it: 'quasi', fr: 'presque', de: 'fast', es: 'casi', pt: 'quase', ja: 'ほとんど' });
  });
});
