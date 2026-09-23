import { describe, expect, test } from 'vitest';
import type { NounElement, PronominalPossessor } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// P11-E3: talking *to* family. Two halves: a casual kin term used as a **name** ("Mom runs"), which
// is a lexeme column and C38's personal-name path, and the **vocative** ("Mom, run!"), a slot of the
// clause's own that no other slot renders like.

const runs = (subject: NounElement) => sayAll(clause(subject, 'RUN'));
const of = (person: '1' | '2' | '3'): PronominalPossessor => ({ kind: 'pronominal', person, number: 'singular' });

describe('a kin term used as a name', () => {
  test('Mom runs: no article, capitalized — and Italian keeps its article', () => {
    expect(runs(np('MOM'))).toEqual({
      en: 'Mom runs.', it: 'la mamma corre.', fr: 'Maman court.', de: 'Mama läuft.',
      es: 'Mamá corre.', ja: 'お母さんは走ります。', pt: 'Mamãe corre.',
    });
    expect(runs(np('DAD'))).toEqual({
      en: 'Dad runs.', it: 'il papà corre.', fr: 'Papa court.', de: 'Papa läuft.',
      es: 'Papá corre.', ja: 'お父さんは走ります。', pt: 'Papai corre.',
    });
  });

  test('a name in every slot a name fills', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('MOM') }))).toEqual({
      en: 'the cat sees Mom.', it: 'il gatto vede la mamma.', fr: 'le chat voit Maman.',
      de: 'der Kater sieht Mama.', es: 'el gato ve a Mamá.', ja: '猫はお母さんを見ます。', pt: 'o gato vê Mamãe.',
    });
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('DAD') } },
    }))).toEqual({
      en: 'the cat gives the book to Dad.', it: 'il gatto dà il libro al papà.',
      fr: 'le chat donne le livre à Papa.', de: 'der Kater gibt Papa das Buch.',
      es: 'el gato da el libro a Papá.', ja: '猫はお父さんに本をあげます。', pt: 'o gato dá o livro a Papai.',
    });
    expect(sayAll({ subject: np('BOOK', { possessor: np('MOM') }) })).toEqual({
      en: "Mom's book.", it: 'il libro della mamma.', fr: 'le livre de Maman.', de: 'das Buch Mamas.',
      es: 'el libro de Mamá.', ja: 'お母さんの本。', pt: 'o livro de Mamãe.',
    });
    expect(runs({ conjuncts: [np('MOM'), np('DAD')], conjunction: 'and' })).toEqual({
      en: 'Mom and Dad run.', it: 'la mamma e il papà corrono.', fr: 'Maman et Papa courent.',
      de: 'Mama und Papa laufen.', es: 'Mamá y Papá corren.', ja: 'お母さんとお父さんは走ります。',
      pt: 'Mamãe e Papai correm.',
    });
  });

  test('an indefinite, plural, possessed or modified one is the common noun', () => {
    expect(runs(np('MOM', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'a mom runs.', fr: 'une maman court.', de: 'eine Mama läuft.', es: 'una mamá corre.', pt: 'uma mamãe corre.',
    });
    expect(runs(np('MOM', { number: 'plural' }))).toMatchObject({
      en: 'the moms run.', fr: 'les mamans courent.', es: 'las mamás corren.',
    });
    expect(runs(np('MOM', { possessor: of('1') }))).toEqual({
      en: 'my mom runs.', it: 'la mia mamma corre.', fr: 'ma maman court.', de: 'meine Mama läuft.',
      es: 'mi mamá corre.', ja: 'お母さんは走ります。', pt: 'a minha mamãe corre.',
    });
    expect(runs(np('MOM', { adjectives: ['OLD'] }))).toMatchObject({
      en: 'the old mom runs.', fr: 'la vieille maman court.', de: 'die alte Mama läuft.',
    });
  });

  test('a possessor question asks whose mom, the common noun', () => {
    expect(sayAll({ ...clause(np('MOM'), 'RUN'), questionRole: 'possessor', questionPossessed: 'subject' })).toEqual({
      en: 'whose mom runs?', it: 'la mamma di chi corre?', fr: 'la maman de qui court\u00a0?',
      de: 'wessen Mama läuft?', es: '¿la mamá de quién corre?', ja: '誰のお母さんが走りますか？',
      pt: 'a mamãe de quem corre?',
    });
  });
});
