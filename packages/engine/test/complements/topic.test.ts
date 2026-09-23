import { describe, expect, test } from 'vitest';
import type { NounElement } from '@signi/shared';
import { clause, np, say, sayAll } from '../harness.js';

const speaksAbout = (phrase: NounElement, subject = np('WOMAN')) =>
  sayAll(clause(subject, 'SPEAK', { complements: { topic: { phrase } } }));
const thinksAbout = (phrase: NounElement) =>
  sayAll(clause(np('WOMAN'), 'THINK', { complements: { topic: { phrase } } }));

// The nominal *about* (P09-E2): what is spoken or thought of. Each language has a word of its own
// for it — *about / di / de / über / sobre / について* — and a verb may govern another in its lexeme
// (`topic_prep`, see `topicLink`): *think* does in five of the seven. Plan-only: no box yet.
describe('topic', () => {
  test('a definite topic', () => {
    expect(speaksAbout(np('CAT'))).toEqual({
      en: 'the woman speaks about the cat.',
      it: 'la donna parla del gatto.', // "di" fuses with the article, as any simple preposition does
      fr: 'la femme parle du chat.',
      de: 'die Frau spricht über den Kater.', // über governs the accusative in this sense
      es: 'la mujer habla sobre el gato.',
      pt: 'a mulher fala sobre o gato.',
      ja: '女は猫について話します。',
    });
  });

  test('an indefinite one', () => {
    expect(speaksAbout(np('CAT', { definiteness: 'indefinite' }))).toEqual({
      en: 'the woman speaks about a cat.',
      it: 'la donna parla di un gatto.',
      fr: "la femme parle d'un chat.",
      de: 'die Frau spricht über einen Kater.',
      es: 'la mujer habla sobre un gato.',
      pt: 'a mulher fala sobre um gato.',
      ja: '女は猫について話します。',
    });
  });

  test('a plural one', () => {
    expect(speaksAbout(np('CAT', { number: 'plural' }))).toEqual({
      en: 'the woman speaks about the cats.',
      it: 'la donna parla dei gatti.',
      fr: 'la femme parle des chats.',
      de: 'die Frau spricht über die Kater.',
      es: 'la mujer habla sobre los gatos.',
      pt: 'a mulher fala sobre os gatos.',
      ja: '女は猫について話します。',
    });
  });

  test('a pronoun, in its tonic form', () => {
    expect(speaksAbout(np('THIRD_PERSON', { number: 'plural' }))).toEqual({
      en: 'the woman speaks about them.',
      it: 'la donna parla di loro.',
      fr: "la femme parle d'eux.", // "de" elides before the tonic form
      de: 'die Frau spricht über sie.',
      es: 'la mujer habla sobre ellos.',
      pt: 'a mulher fala sobre eles.',
      ja: '女は彼らについて話します。',
    });
    expect(speaksAbout(np('FIRST_PERSON'))).toMatchObject({
      en: 'the woman speaks about me.', it: 'la donna parla di me.', fr: 'la femme parle de moi.',
      de: 'die Frau spricht über mich.', es: 'la mujer habla sobre mí.', pt: 'a mulher fala sobre mim.',
    });
  });

  // THINK's lexeme names its own: it "pensare a", fr "penser à", de "denken an", es "pensar en", pt
  // "pensar em" — each fusing as its preposition does anywhere else. English and Japanese keep theirs.
  test('a verb that governs its own preposition takes it', () => {
    expect(thinksAbout(np('CAT'))).toEqual({
      en: 'the woman thinks about the cat.',
      it: 'la donna pensa al gatto.',
      fr: 'la femme pense au chat.',
      de: 'die Frau denkt an den Kater.',
      es: 'la mujer piensa en el gato.',
      pt: 'a mulher pensa no gato.',
      ja: '女は猫について考えます。',
    });
    expect(thinksAbout(np('CAT', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'la donna pensa a un gatto.', fr: 'la femme pense à un chat.', de: 'die Frau denkt an einen Kater.',
      pt: 'a mulher pensa em um gato.',
    });
    expect(thinksAbout(np('HOUSE'))).toMatchObject({ de: 'die Frau denkt ans Haus.', pt: 'a mulher pensa na casa.' });
    expect(thinksAbout(np('THIRD_PERSON'))).toEqual({
      en: 'the woman thinks about him.',
      it: 'la donna pensa a lui.',
      fr: 'la femme pense à lui.',
      de: 'die Frau denkt an ihn.',
      es: 'la mujer piensa en él.',
      pt: 'a mulher pensa nele.',
      ja: '女は彼について考えます。',
    });
  });

  test('a coordinated topic repeats the fused preposition', () => {
    expect(thinksAbout({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' })).toMatchObject({
      en: 'the woman thinks about the cat and the dog.',
      it: 'la donna pensa al gatto e al cane.',
      de: 'die Frau denkt an den Kater und an den Hund.',
      ja: '女は猫と犬について考えます。',
    });
  });

  // D4. The topic particle は is not the topic complement: 猫は話します is "the cat speaks". Every
  // subject already takes は, and the complement takes について beside it, never a second は.
  test('Japanese: について beside a は subject, never a second は', () => {
    const ja = speaksAbout(np('DOG'), np('CAT')).ja;
    expect(ja).toBe('猫は犬について話します。');
    expect(ja).not.toContain('犬は');
  });

  // D4. German "über" is two prepositions: the topic takes the accusative, the spatial relation of a
  // place the dative — and the second is unchanged by the first.
  test('German: the topic "über" is accusative, the spatial one stays dative', () => {
    expect(say(clause(np('CAT'), 'SPEAK', { complements: { topic: { phrase: np('DOG') } } }), 'de'))
      .toBe('der Kater spricht über den Hund.');
    expect(say(clause(np('CAT'), 'RUN', {
      complements: { locative: { phrase: np('DOG'), specifiers: [{ kind: 'path', value: 'over' }] } },
    }), 'de')).toBe('der Kater läuft über dem Hund.');
  });

  test('beside the verb, ahead of the place', () => {
    expect(sayAll(clause(np('WOMAN'), 'SPEAK', {
      complements: { topic: { phrase: np('CAT') }, locative: { phrase: np('HOUSE') } },
    }))).toMatchObject({
      en: 'the woman speaks about the cat in the house.',
      it: 'la donna parla del gatto nella casa.',
      de: 'die Frau spricht über den Kater im Haus.',
      ja: '女は猫について家で話します。',
    });
  });

  // A prepositional complement, so German's "nicht" leads it (A159).
  test('under a negated clause', () => {
    expect(sayAll(clause(np('WOMAN'), 'SPEAK', {
      verbPhrase: { negative: true }, complements: { topic: { phrase: np('CAT') } },
    }))).toMatchObject({
      en: 'the woman does not speak about the cat.',
      fr: 'la femme ne parle pas du chat.',
      de: 'die Frau spricht nicht über den Kater.',
      ja: '女は猫について話しません。',
    });
  });
});
