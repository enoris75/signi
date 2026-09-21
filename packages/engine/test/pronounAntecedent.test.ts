import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, furigana, np, sayAll } from './harness.js';

// C20. A PRONOUN THAT NAMES ITS ANTECEDENT: `{ concept: 'THIRD_PERSON', antecedent: 'CONTENT' }`.
// A gender on the pronoun cannot be right in all seven languages, because they want two different
// genders of the thing it stands for: de, it, fr, es, pt the antecedent's GRAMMATICAL gender, a fact
// of each lexicon (de *Inhalt* is masculine, so "ihn"); en, ja its NATURAL gender (a thing is "it",
// それ). So the pronoun names the noun, and each language reads its own word for it.
//
// The gender is settled when the pronoun resolves, before its surface is picked, so every slot a
// pronoun fills agrees alike: subject, object, the Romance clitic (and its climbing), the Portuguese
// enclitic, the French participle, German word order in a subordinate clause.
const it = (antecedent: string, extra: Partial<NounPhrase> = {}): NounPhrase =>
  np('THIRD_PERSON', { antecedent, ...extra });
const catSees = (object: NounPhrase, verbPhrase: Partial<VerbPhrase> = {}) =>
  sayAll(clause(np('CAT'), 'SEE', { directObject: object, verbPhrase }));

// "to indicate X to see it": the shape SELECT's gloss takes, on any antecedent.
const indicateToSee = (antecedent: string, pronoun: Partial<NounPhrase> = {}): PhrasePlan => ({
  subject: np('GENERIC_PERSON'),
  verbPhrase: { verb: 'INDICATE' },
  directObject: np(antecedent, { definiteness: 'indefinite' }),
  purpose: { verbPhrase: { verb: 'SEE' }, directObject: it(antecedent, pronoun) },
  infinitive: true,
});

describe('a pronoun takes its gender from its antecedent', () => {
  test('masculine: CONTENT is Inhalt, contenuto, contenu, contenido, conteúdo', () => {
    expect(catSees(it('CONTENT'))).toEqual({
      en: 'the cat sees it.',
      it: 'il gatto lo vede.',
      fr: 'le chat le voit.',
      de: 'der Kater sieht ihn.',
      es: 'el gato lo ve.',
      ja: '猫はそれを見ます。',
      pt: 'o gato o vê.',
    });
  });

  // FLAME is feminine in all five gendered lexicons. A neuter pronoun falls back to the masculine
  // clitic in Romance, so only a feminine antecedent shows the gender is read from the lexicon.
  test('feminine: FLAME is fiamma, flamme, Flamme, llama, chama', () => {
    expect(catSees(it('FLAME'))).toEqual({
      en: 'the cat sees it.',
      it: 'il gatto la vede.',
      fr: 'le chat la voit.',
      de: 'der Kater sieht sie.',
      es: 'el gato la ve.',
      ja: '猫はそれを見ます。',
      pt: 'o gato a vê.',
    });
  });

  test('neuter: ANIMAL is das Tier, and masculine in the Romance languages', () => {
    expect(catSees(it('ANIMAL'))).toEqual({
      en: 'the cat sees it.',
      it: 'il gatto lo vede.',
      fr: 'le chat le voit.',
      de: 'der Kater sieht es.',
      es: 'el gato lo ve.',
      ja: '猫はそれを見ます。',
      pt: 'o gato o vê.',
    });
  });

  test('German takes all three from its own lexicon, and the others their own', () => {
    const de = (antecedent: string) => catSees(it(antecedent)).de;
    expect([de('CONTENT'), de('FLAME'), de('ANIMAL')]).toEqual([
      'der Kater sieht ihn.', 'der Kater sieht sie.', 'der Kater sieht es.',
    ]);
    // An animal of unknown sex is neuter where only nature genders the pronoun, and masculine where
    // the word is: der Kater, il gatto.
    expect(sayAll(clause(np('DOG'), 'SEE', { directObject: it('CAT') }))).toMatchObject({
      en: 'the dog sees it.', de: 'der Hund sieht ihn.', it: 'il cane lo vede.', ja: '犬はそれを見ます。',
    });
  });

  test('as the subject', () => {
    expect(sayAll(clause(it('FLAME'), 'RUN'))).toEqual({
      en: 'it runs.',
      it: 'corre.',
      fr: 'elle court.',
      de: 'sie läuft.',
      es: 'corre.',
      ja: 'それは走ります。',
      pt: 'corre.',
    });
    expect(sayAll(clause(it('ANIMAL'), 'RUN'))).toMatchObject({ fr: 'il court.', de: 'es läuft.', en: 'it runs.' });
  });

  test('its number is its own: a plural pronoun is the plural of the antecedent’s gender', () => {
    expect(catSees(it('FLAME', { number: 'plural' }))).toMatchObject({
      en: 'the cat sees them.',
      it: 'il gatto le vede.',
      fr: 'le chat les voit.',
      de: 'der Kater sieht sie.',
      es: 'el gato las ve.',
      pt: 'o gato as vê.',
    });
  });
});

describe('every slot a pronoun fills agrees alike', () => {
  test('the clitic climbs to a modal, or stays on the infinitive in French', () => {
    expect(catSees(it('FLAME'), { modals: ['MUST'] })).toEqual({
      en: 'the cat must see it.',
      it: 'il gatto la deve vedere.',
      fr: 'le chat doit la voir.',
      de: 'der Kater muss sie sehen.',
      es: 'el gato la debe ver.',
      ja: '猫はそれを見る必要があります。',
      pt: 'o gato a deve ver.',
    });
  });

  test('the Romance participle agrees with a feminine clitic', () => {
    expect(catSees(it('FLAME'), { aspect: 'resultative' })).toMatchObject({
      it: 'il gatto la ha vista.', // A67: the pin accepts the unelided "la ha"
      fr: "le chat l'a vue.",
      de: 'der Kater hat sie gesehen.',
    });
    expect(catSees(it('FLAME'), { modals: ['MUST'], aspect: 'resultative' }).fr).toBe("le chat doit l'avoir vue.");
    expect(catSees(it('ANIMAL'), { aspect: 'resultative' })).toMatchObject({ fr: "le chat l'a vu.", de: 'der Kater hat es gesehen.' });
  });

  test('negated, and in a command, where Romance attaches it after the verb', () => {
    expect(catSees(it('FLAME'), { negative: true })).toMatchObject({
      it: 'il gatto non la vede.', fr: 'le chat ne la voit pas.', de: 'der Kater sieht sie nicht.', pt: 'o gato não a vê.',
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: it('FLAME') }), imperative: true })).toEqual({
      en: 'see it.',
      it: 'vedila.',
      fr: 'vois-la.',
      de: 'sieh sie.',
      es: 'vela.',
      ja: 'それを見てください。',
      pt: 'veja-a.',
    });
  });

  test('in a relative clause, where German puts it before the final verb', () => {
    const dogThatSees = (antecedent: string) =>
      sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: it(antecedent) } }), 'RUN'));
    expect(dogThatSees('FLAME')).toEqual({
      en: 'the dog that sees it runs.',
      it: 'il cane che la vede corre.',
      fr: 'le chien qui la voit court.',
      de: 'der Hund, der sie sieht, läuft.',
      es: 'el perro que la ve corre.',
      ja: 'それを見る犬は走ります。',
      pt: 'o cão que a vê corre.',
    });
    expect(dogThatSees('CONTENT').de).toBe('der Hund, der ihn sieht, läuft.');
    expect(dogThatSees('ANIMAL').de).toBe('der Hund, der es sieht, läuft.');
  });

  test('in a purpose clause: the infinitive’s enclitic, and German’s um … zu', () => {
    expect(sayAll(indicateToSee('FLAME'))).toEqual({
      en: 'to indicate a flame to see it.',
      it: 'indicare una fiamma per vederla.',
      fr: 'indiquer une flamme pour la voir.',
      de: 'eine Flamme bezeichnen, um sie zu sehen.',
      es: 'indicar una llama para verla.',
      ja: 'それを見るために炎を示す。',
      pt: 'indicar uma chama para vê-la.',
    });
    expect(sayAll(indicateToSee('ANIMAL'))).toMatchObject({
      de: 'ein Tier bezeichnen, um es zu sehen.', pt: 'indicar um animal para vê-lo.', en: 'to indicate an animal to see it.',
    });
  });

  test('after a preposition, in its disjunctive form', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: it('FLAME') } } }))).toMatchObject({
      en: 'the cat runs because of it.',
      fr: "le chat court à cause d'elle.",
      es: 'el gato corre a causa de ella.',
      de: 'der Kater läuft ihretwegen.',
      pt: 'o gato corre por causa dela.',
    });
  });

  test('a 1st- or 2nd-person pronoun has no antecedent to agree with', () => {
    expect(catSees(np('FIRST_PERSON', { antecedent: 'FLAME' }))).toMatchObject({ en: 'the cat sees me.', it: 'il gatto mi vede.' });
  });
});

// en and ja gender a pronoun by nature, which no noun lexeme records. A thing is neuter; a person's
// sex is the plan's to state, on the pronoun, as it is on any pronoun. Grammatical gender is no
// guide to it: PERSON is feminine in all five gendered lexicons, exactly as WOMAN is.
describe('a person antecedent', () => {
  test('whose sex the plan states: en and ja say it, the others keep the word’s gender', () => {
    expect(sayAll(indicateToSee('BOY', { gender: 'masc' }))).toEqual({
      en: 'to indicate a boy to see him.',
      it: 'indicare un ragazzo per vederlo.',
      fr: 'indiquer un garçon pour le voir.',
      de: 'einen Jungen bezeichnen, um ihn zu sehen.',
      es: 'indicar a un niño para verlo.',
      ja: '彼を見るために男の子を示す。',
      pt: 'indicar um menino para vê-lo.',
    });
    expect(sayAll(indicateToSee('WOMAN', { gender: 'fem' }))).toEqual({
      en: 'to indicate a woman to see her.',
      it: 'indicare una donna per vederla.',
      fr: 'indiquer une femme pour la voir.',
      de: 'eine Frau bezeichnen, um sie zu sehen.',
      es: 'indicar a una mujer para verla.',
      ja: '彼女を見るために女を示す。',
      pt: 'indicar uma mulher para vê-la.',
    });
    // "la persona" is feminine whoever it names; "him" is the man's own.
    expect(catSees(it('PERSON', { gender: 'masc' }))).toEqual({
      en: 'the cat sees him.',
      it: 'il gatto la vede.',
      fr: 'le chat la voit.',
      de: 'der Kater sieht sie.',
      es: 'el gato la ve.',
      ja: '猫は彼を見ます。',
      pt: 'o gato a vê.',
    });
  });

  test('a noun with a feminine counterpart takes it for a female referent, as a noun phrase does', () => {
    expect(catSees(it('SPEAKER', { gender: 'fem' }))).toEqual({
      en: 'the cat sees her.',
      it: 'il gatto la vede.',
      fr: 'le chat la voit.',
      de: 'der Kater sieht sie.',
      es: 'el gato la ve.',
      ja: '猫は彼女を見ます。',
      pt: 'o gato a vê.',
    });
    expect(catSees(it('SPEAKER'))).toMatchObject({ it: 'il gatto lo vede.', de: 'der Kater sieht ihn.' });
  });

  // Never "him", 彼: the singular is not pronominalised, and the antecedent stands in under the
  // anaphoric demonstrative. The five gendered languages have the word's gender, so they keep the
  // pronoun. The plural pronoun is neutral already.
  test('whose sex nobody states is never guessed at', () => {
    expect(sayAll(indicateToSee('PERSON'))).toEqual({
      en: 'to indicate a person to see that person.',
      it: 'indicare una persona per vederla.',
      fr: 'indiquer une personne pour la voir.',
      de: 'eine Person bezeichnen, um sie zu sehen.',
      es: 'indicar a una persona para verla.',
      ja: 'その人を見るために人を示す。',
      pt: 'indicar uma pessoa para vê-la.',
    });
    expect(sayAll(clause(it('PERSON'), 'RUN'))).toMatchObject({ en: 'that person runs.', ja: 'その人は走ります。', fr: 'elle court.' });
    expect(furigana(clause(it('PERSON'), 'RUN'))).toContain('ひと');
    expect(catSees(it('PERSON', { number: 'plural' }))).toMatchObject({
      en: 'the cat sees them.', ja: '猫は彼らを見ます。', it: 'il gatto le vede.', de: 'der Kater sieht sie.',
    });
    expect(sayAll(indicateToSee('BOY')).en).toBe('to indicate a boy to see that boy.');
  });
});
