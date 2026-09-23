import { describe, expect, test } from 'vitest';
import type { NounElement, PhrasePlan, PronominalPossessor } from '@signi/shared';
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

// The vocative is a slot of the top clause, rendered before it with the language's separator.
const command = (address: NounElement, subject: NounElement = np('SECOND_PERSON')): PhrasePlan =>
  ({ ...clause(subject, 'RUN'), imperative: true, address });

describe('the vocative', () => {
  test('Mom, run: set off by a comma, or 、 with no particle, and determiner-less in all seven', () => {
    expect(sayAll(command(np('MOM')))).toEqual({
      en: 'Mom, run.', it: 'Mamma, corri.', fr: 'Maman, cours.', de: 'Mama, lauf.',
      es: 'Mamá, corre.', ja: 'お母さん、走ってください。', pt: 'Mamãe, corra.',
    });
  });

  test('determiner-less whatever the plan picked, and capitalized as the first word', () => {
    expect(sayAll(command(np('CAT', { definiteness: 'indefinite' })))).toEqual({
      en: 'Cat, run.', it: 'Gatto, corri.', fr: 'Chat, cours.', de: 'Kater, lauf.',
      es: 'Gato, corre.', ja: '猫、走ってください。', pt: 'Gato, corra.',
    });
    // A name the language articles as a subject (pt "o Pedro corre") is bare in address.
    expect(sayAll(command(np('PETER')))).toMatchObject({ pt: 'Pedro, corra.', it: 'Pietro, corri.', ja: 'ピーター、走ってください。' });
    expect(sayAll(command(np('PETER', { title: 'MR' })))).toMatchObject({
      it: 'Signor Pietro, corri.', es: 'Señor Pedro, corre.', pt: 'Senhor Pedro, corra.', ja: 'ピーターさん、走ってください。',
    });
    expect(sayAll(command({ conjuncts: [np('MOM'), np('DAD')], conjunction: 'and' }, np('SECOND_PERSON', { number: 'plural' })))).toEqual({
      en: 'Mom and Dad, run.', it: 'Mamma e papà, correte.', fr: 'Maman et Papa, courez.', de: 'Mama und Papa, lauft.',
      es: 'Mamá y Papá, corred.', ja: 'お母さんとお父さん、走ってください。', pt: 'Mamãe e Papai, corram.',
    });
  });

  // D3: one calls one's own mother お母さん, where P11's rule gives 母 for her in the third person.
  test("Japanese: address takes the honorific, even for one's own mother", () => {
    expect(sayAll(command(np('MOTHER', { possessor: of('1') })))).toMatchObject({
      ja: 'お母さん、走ってください。', en: 'My mother, run.', fr: 'Ma mère, cours.', de: 'Meine Mutter, lauf.',
    });
    expect(sayAll(command(np('MOTHER')))).toMatchObject({ ja: 'お母さん、走ってください。', en: 'Mother, run.' });
    expect(sayAll(command(np('PARENT', { number: 'plural', possessor: of('1') }), np('SECOND_PERSON', { number: 'plural' }))))
      .toMatchObject({ ja: 'ご両親、走ってください。' });
  });

  test("…and P11's own / other's / nobody's rows are unchanged outside it", () => {
    expect(runs(np('MOTHER', { possessor: of('1') }))).toMatchObject({ ja: '母は走ります。' });
    expect(runs(np('MOTHER', { possessor: of('2') }))).toMatchObject({ ja: 'あなたのお母さんは走ります。' });
    expect(runs(np('MOTHER'))).toMatchObject({ ja: '母親は走ります。' });
    // The subject of an addressed clause is not the address: 母 in the clause, お母さん before it.
    expect(sayAll({ ...clause(np('MOTHER', { possessor: of('1') }), 'RUN'), address: np('MOM') }))
      .toMatchObject({ ja: 'お母さん、母は走ります。' });
  });

  test('a head with no honorific keeps the word it takes as a possessed noun', () => {
    expect(sayAll(command(np('WIFE', { possessor: of('1') })))).toMatchObject({ fr: 'Ma femme, cours.', de: 'Meine Frau, lauf.' });
  });

  test('an address on a statement: Mom, the cat runs', () => {
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), address: np('MOM') })).toEqual({
      en: 'Mom, the cat runs.', it: 'Mamma, il gatto corre.', fr: 'Maman, le chat court.', de: 'Mama, der Kater läuft.',
      es: 'Mamá, el gato corre.', ja: 'お母さん、猫は走ります。', pt: 'Mamãe, o gato corre.',
    });
  });

  test('an address on a question opens behind the Spanish ¿', () => {
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), address: np('MOM'), interrogative: true })).toEqual({
      en: 'Mom, does the cat run?', it: 'Mamma, il gatto corre?', fr: 'Maman, est-ce que le chat court ?',
      de: 'Mama, läuft der Kater?', es: '¿Mamá, el gato corre?', ja: 'お母さん、猫は走りますか？', pt: 'Mamãe, o gato corre?',
    });
  });

  // D4: the address is not the command's subject. The same address takes a 1st-plural command.
  test("Mom, let's run: the address does not pick the command's person", () => {
    expect(sayAll(command(np('MOM'), np('FIRST_PERSON', { number: 'plural' })))).toEqual({
      en: "Mom, let's run.", it: 'Mamma, corriamo.', fr: 'Maman, courons.', de: 'Mama, laufen wir.',
      es: 'Mamá, corramos.', ja: 'お母さん、走りましょう。', pt: 'Mamãe, corramos.',
    });
    expect(sayAll(command(np('MOM'), np('SECOND_PERSON', { number: 'plural' })))).toMatchObject({
      it: 'Mamma, correte.', fr: 'Maman, courez.', de: 'Mama, lauft.', es: 'Mamá, corred.',
    });
  });

  test("the address belongs to the top clause: a linked clause's is not read", () => {
    const coordinated: PhrasePlan = {
      ...clause(np('CAT'), 'RUN'),
      coordination: { conjunction: 'and', clause: { ...clause(np('DOG'), 'EAT'), address: np('MOM') } },
    };
    expect(sayAll(coordinated)).toMatchObject({ en: 'the cat runs, and the dog eats.' });
  });
});
