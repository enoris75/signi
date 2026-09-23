import { describe, expect, test } from 'vitest';
import type { LanguageCode, LexicalEntry, NounElement, PhrasePlan } from '@signi/shared';
import { translate } from '../../src/index.js';
import { clause, np, say, sayAll } from '../harness.js';

// The harness has seeded the in-memory lexicon by now, so its lookup is the one the app ships.
const { lookupLexicalEntry } = await import('../../../backend/src/lexicon.js');

const playsAgainst = (phrase: NounElement, subject = np('CAT')) =>
  sayAll(clause(subject, 'PLAY_GAME', { complements: { opponent: { phrase } } }));

// A test-only verb whose Japanese lexeme names its own opponent marker, as FIGHT's 戦う will once it
// is seeded (P09-E22 D3): 犬と戦います, never the generic 犬を相手に. The other six keep PLAY_GAME's
// lexeme, which names none, so they show the generic word is untouched by the override.
const FIGHT_JA: Record<string, string> = {
  base: '戦う', reading: 'たたかう', masu_present: '戦います', masu_present_reading: 'たたかいます',
  te: '戦って', te_reading: 'たたかって', nai: '戦わない', nai_reading: 'たたかわない',
  role: 'verb', opponent_prep: 'と',
};
const lookupWithFight = (id: string, language: string): LexicalEntry | undefined => {
  if (id !== 'TEST_FIGHT') return lookupLexicalEntry(id, language);
  if (language === 'ja') return { conceptId: id, language: 'ja', forms: FIGHT_JA };
  const play = lookupLexicalEntry('PLAY_GAME', language);
  return play && { ...play, conceptId: id };
};
const sayAllWithFight = (plan: PhrasePlan): Record<LanguageCode, string> =>
  Object.fromEntries(translate(plan, lookupWithFight).map((t) => [t.language, t.text])) as Record<LanguageCode, string>;

// The adversarial *against* (P09-E22): the party an act is directed against. Its own word in each
// language — *against / contro / contre / gegen / contra* / を相手に — and not E1's spatial `against`,
// which is contact. A verb may govern another in its lexeme (`opponent_prep`, see `opponentLink`).
// Plan-only: no box yet.
describe('opponent', () => {
  test('a definite opponent', () => {
    expect(playsAgainst(np('DOG'))).toEqual({
      en: 'the cat plays against the dog.',
      it: 'il gatto gioca contro il cane.', // "contro" fuses with no article
      fr: 'le chat joue contre le chien.',
      de: 'der Kater spielt gegen den Hund.', // gegen governs the accusative
      es: 'el gato juega contra el perro.',
      pt: 'o gato joga contra o cão.',
      ja: '猫は犬を相手に遊びます。',
    });
  });

  test('an indefinite one', () => {
    expect(playsAgainst(np('DOG', { definiteness: 'indefinite' }))).toEqual({
      en: 'the cat plays against a dog.',
      it: 'il gatto gioca contro un cane.',
      fr: 'le chat joue contre un chien.',
      de: 'der Kater spielt gegen einen Hund.',
      es: 'el gato juega contra un perro.',
      pt: 'o gato joga contra um cão.',
      ja: '猫は犬を相手に遊びます。',
    });
  });

  test('a plural one', () => {
    expect(playsAgainst(np('DOG', { number: 'plural' }))).toEqual({
      en: 'the cat plays against the dogs.',
      it: 'il gatto gioca contro i cani.',
      fr: 'le chat joue contre les chiens.',
      de: 'der Kater spielt gegen die Hunde.',
      es: 'el gato juega contra los perros.',
      pt: 'o gato joga contra os cães.',
      ja: '猫は犬を相手に遊びます。',
    });
  });

  // Italian reaches the pronoun through "di" (`IT_DI_BEFORE_PRONOUN`), German declines it in the
  // accusative, and Spanish and Portuguese take the oblique tonic — "contra mí", not the nominative
  // "entre" takes.
  test('a pronoun, in its tonic form', () => {
    expect(playsAgainst(np('THIRD_PERSON'))).toEqual({
      en: 'the cat plays against him.',
      it: 'il gatto gioca contro di lui.',
      fr: 'le chat joue contre lui.',
      de: 'der Kater spielt gegen ihn.',
      es: 'el gato juega contra él.',
      pt: 'o gato joga contra ele.',
      ja: '猫は彼を相手に遊びます。',
    });
    expect(playsAgainst(np('FIRST_PERSON'))).toMatchObject({
      en: 'the cat plays against me.', it: 'il gatto gioca contro di me.', fr: 'le chat joue contre moi.',
      de: 'der Kater spielt gegen mich.', es: 'el gato juega contra mí.', pt: 'o gato joga contra mim.',
    });
  });

  test('a coordinated opponent repeats its preposition where a noun does', () => {
    expect(playsAgainst({ conjuncts: [np('DOG'), np('MAN')], conjunction: 'and' })).toMatchObject({
      en: 'the cat plays against the dog and the man.',
      it: "il gatto gioca contro il cane e contro l'uomo.",
      de: 'der Kater spielt gegen den Hund und gegen den Mann.',
      ja: '猫は犬と男を相手に遊びます。',
    });
  });

  // D1. The two co-participants together, the companion first: "plays with the cat against the dog".
  test('after the comitative, ahead of the place', () => {
    expect(sayAll(clause(np('MAN'), 'PLAY_GAME', {
      complements: {
        locative: { phrase: np('HOUSE') },
        opponent: { phrase: np('DOG') },
        comitative: { phrase: np('CAT') },
      },
    }))).toEqual({
      en: 'the man plays with the cat against the dog in the house.',
      it: "l'uomo gioca con il gatto contro il cane nella casa.",
      fr: "l'homme joue avec le chat contre le chien dans la maison.",
      de: 'der Mann spielt mit dem Kater gegen den Hund im Haus.',
      es: 'el hombre juega con el gato contra el perro en la casa.',
      pt: 'o homem joga com o gato contra o cão na casa.',
      ja: '男は猫と犬を相手に家で遊びます。',
    });
  });

  // D1. German "gegen" + accusative is the opponent; the spatial `against` stays the contact "an" +
  // dative, and the one does not change the other.
  test('German: the opponent "gegen" is accusative, the spatial against stays "an" + dative', () => {
    expect(say(clause(np('CAT'), 'PLAY_GAME', { complements: { opponent: { phrase: np('DOG') } } }), 'de'))
      .toBe('der Kater spielt gegen den Hund.');
    expect(say(clause(np('CAT'), 'PLAY_GAME', {
      complements: { locative: { phrase: np('DOG'), specifiers: [{ kind: 'path', value: 'against' }] } },
    }), 'de')).toBe('der Kater spielt am Hund.');
  });

  // D3. Japanese has no neutral adposition: を相手に is the generic, and a verb whose case frame marks
  // its opponent names its own. Pinned on a test-only verb until FIGHT is seeded.
  test('Japanese: a verb naming its own marker overrides を相手に', () => {
    const plan = clause(np('MAN'), 'TEST_FIGHT', { complements: { opponent: { phrase: np('DOG') } } });
    const out = sayAllWithFight(plan);
    expect(out.ja).toBe('男は犬と戦います。');
    expect(out.ja).not.toContain('相手');
    // The other six read PLAY_GAME's lexeme, which names none: the generic word stands.
    expect(out).toMatchObject({
      en: 'the man plays against the dog.', it: "l'uomo gioca contro il cane.", de: 'der Mann spielt gegen den Hund.',
    });
  });

  // A prepositional complement, so German's "nicht" leads it (A159).
  test('under a negated clause', () => {
    expect(sayAll(clause(np('CAT'), 'PLAY_GAME', {
      verbPhrase: { negative: true }, complements: { opponent: { phrase: np('DOG') } },
    }))).toMatchObject({
      en: 'the cat does not play against the dog.',
      fr: 'le chat ne joue pas contre le chien.',
      de: 'der Kater spielt nicht gegen den Hund.',
      ja: '猫は犬を相手に遊びません。',
    });
  });
});
