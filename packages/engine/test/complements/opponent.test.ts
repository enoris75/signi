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

// A test-only verb that is PLAY_GAME in every language, but whose lexeme names its own opponent's
// word in the languages given: the `opponent_prep` FIGHT_JA carries, outside Japanese.
const sayAllWithPrep = (plan: PhrasePlan, preps: Partial<Record<LanguageCode, string>>): Record<LanguageCode, string> => {
  const lookup = (id: string, language: string): LexicalEntry | undefined => {
    if (id !== 'TEST_PLAY') return lookupLexicalEntry(id, language);
    const play = lookupLexicalEntry('PLAY_GAME', language);
    const prep = preps[language as LanguageCode];
    return play && { ...play, conceptId: id, forms: { ...play.forms, ...(prep ? { opponent_prep: prep } : {}) } };
  };
  return Object.fromEntries(translate(plan, lookup).map((t) => [t.language, t.text])) as Record<LanguageCode, string>;
};

// A wh-question on the opponent slot, as questions.test.ts builds one.
const ask = (plan: PhrasePlan, questionAnimate?: boolean): PhrasePlan =>
  ({ ...plan, questionRole: 'opponent', ...(questionAnimate ? { questionAnimate } : {}) });

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
    expect(playsAgainst({ conjuncts: [np('DOG'), np('MAN')], conjunction: 'and' })).toEqual({
      en: 'the cat plays against the dog and the man.',
      it: "il gatto gioca contro il cane e contro l'uomo.",
      fr: "le chat joue contre le chien et contre l'homme.",
      de: 'der Kater spielt gegen den Hund und gegen den Mann.',
      es: 'el gato juega contra el perro y contra el hombre.',
      pt: 'o gato joga contra o cão e contra o homem.',
      ja: '猫は犬と男を相手に遊びます。',
    });
    // A pronoun beside a noun keeps its own tonic link: Italian's "di" goes with the pronoun only.
    expect(playsAgainst({ conjuncts: [np('THIRD_PERSON'), np('DOG')], conjunction: 'and' })).toEqual({
      en: 'the cat plays against him and the dog.',
      it: 'il gatto gioca contro di lui e contro il cane.',
      fr: 'le chat joue contre lui et contre le chien.',
      de: 'der Kater spielt gegen ihn und gegen den Hund.',
      es: 'el gato juega contra él y contra el perro.',
      pt: 'o gato joga contra ele e contra o cão.',
      ja: '猫は彼と犬を相手に遊びます。',
    });
  });

  // The rest of the paradigm. Spanish takes the plain tonic "ti" after "contra": "contigo" is
  // "con"'s alone. Italian keeps "di" before every one.
  test('the pronoun paradigm', () => {
    expect(playsAgainst(np('SECOND_PERSON'))).toEqual({
      en: 'the cat plays against you.',
      it: 'il gatto gioca contro di te.',
      fr: 'le chat joue contre toi.',
      de: 'der Kater spielt gegen dich.',
      es: 'el gato juega contra ti.',
      pt: 'o gato joga contra você.',
      ja: '猫はあなたを相手に遊びます。',
    });
    expect(playsAgainst(np('THIRD_PERSON', { gender: 'fem' }))).toEqual({
      en: 'the cat plays against her.',
      it: 'il gatto gioca contro di lei.',
      fr: 'le chat joue contre elle.',
      de: 'der Kater spielt gegen sie.',
      es: 'el gato juega contra ella.',
      pt: 'o gato joga contra ela.',
      ja: '猫は彼女を相手に遊びます。',
    });
    expect(playsAgainst(np('THIRD_PERSON', { number: 'plural' }))).toEqual({
      en: 'the cat plays against them.',
      it: 'il gatto gioca contro di loro.',
      fr: 'le chat joue contre eux.',
      de: 'der Kater spielt gegen sie.',
      es: 'el gato juega contra ellos.',
      pt: 'o gato joga contra eles.',
      ja: '猫は彼らを相手に遊びます。',
    });
    expect(playsAgainst(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }))).toEqual({
      en: 'the cat plays against them.',
      it: 'il gatto gioca contro di loro.',
      fr: 'le chat joue contre elles.',
      de: 'der Kater spielt gegen sie.',
      es: 'el gato juega contra ellas.',
      pt: 'o gato joga contra elas.',
      ja: '猫は彼女らを相手に遊びます。',
    });
  });

  // "gegen" governs the accusative through the whole phrase: the weak adjective after the definite,
  // the strong one after "einen", and every determiner in its accusative.
  test('German declines the whole phrase in the accusative', () => {
    const de = (phrase: NounElement) => playsAgainst(phrase).de;
    expect(de(np('DOG', { adjectives: ['BIG'] }))).toBe('der Kater spielt gegen den großen Hund.');
    expect(de(np('DOG', { adjectives: ['BIG'], definiteness: 'indefinite' }))).toBe('der Kater spielt gegen einen großen Hund.');
    expect(de(np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBe('der Kater spielt gegen meinen Hund.');
    expect(de(np('DOG', { definiteness: 'this' }))).toBe('der Kater spielt gegen diesen Hund.');
    expect(de(np('DOG', { definiteness: 'no' }))).toBe('der Kater spielt gegen keinen Hund.');
    expect(de(np('WOMAN'))).toBe('der Kater spielt gegen die Frau.');
  });

  // A negative opponent brings negative concord where the language has it: Italian, Spanish and
  // Portuguese add "non / no / não", French "ne" without "pas", Japanese どの…も with a negative verb.
  test('a negative opponent brings negative concord', () => {
    expect(playsAgainst(np('DOG', { definiteness: 'no' }))).toEqual({
      en: 'the cat plays against no dog.',
      it: 'il gatto non gioca contro nessun cane.',
      fr: 'le chat ne joue contre aucun chien.',
      de: 'der Kater spielt gegen keinen Hund.',
      es: 'el gato no juega contra ningún perro.',
      pt: 'o gato não joga contra nenhum cão.',
      ja: '猫はどの犬を相手にも遊びません。',
    });
  });

  // The question fronts the preposition with the wh-word ("contro chi", "gegen wen"); English
  // strands it, and German asks an inanimate one with the wo- compound, "wogegen".
  test('asked about, it keeps its preposition', () => {
    expect(sayAll(ask(clause(np('CAT'), 'PLAY_GAME'), true))).toEqual({
      en: 'who does the cat play against?',
      it: 'contro chi gioca il gatto?',
      fr: 'contre qui est-ce que le chat joue ?',
      de: 'gegen wen spielt der Kater?',
      es: '¿contra quién juega el gato?',
      pt: 'contra quem o gato joga?',
      ja: '猫は誰を相手に遊びますか？',
    });
    expect(sayAll(ask(clause(np('CAT'), 'PLAY_GAME')))).toEqual({
      en: 'what does the cat play against?',
      it: 'contro che cosa gioca il gatto?',
      fr: 'contre quoi est-ce que le chat joue ?',
      de: 'wogegen spielt der Kater?',
      es: '¿contra qué juega el gato?',
      pt: 'contra que o gato joga?',
      ja: '猫は何を相手に遊びますか？',
    });
  });

  // Inside a subject-gap relative the opponent stays in the clause: German's verb goes last after
  // it, and Japanese keeps を相手に inside the prenominal clause.
  test('inside a relative clause', () => {
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'PLAY_GAME' }, complements: { opponent: { phrase: np('DOG') } } },
    }), 'RUN'))).toEqual({
      en: 'the cat that plays against the dog runs.',
      it: 'il gatto che gioca contro il cane corre.',
      fr: 'le chat qui joue contre le chien court.',
      de: 'der Kater, der gegen den Hund spielt, läuft.',
      es: 'el gato que juega contra el perro corre.',
      pt: 'o gato que joga contra o cão corre.',
      ja: '犬を相手に遊ぶ猫は走ります。',
    });
  });

  test('under a modal, and in the past', () => {
    expect(sayAll(clause(np('CAT'), 'PLAY_GAME', {
      verbPhrase: { modals: ['CAN'] }, complements: { opponent: { phrase: np('DOG') } },
    }))).toEqual({
      en: 'the cat can play against the dog.',
      it: 'il gatto può giocare contro il cane.',
      fr: 'le chat peut jouer contre le chien.',
      de: 'der Kater kann gegen den Hund spielen.', // the infinitive closes the clause
      es: 'el gato puede jugar contra el perro.',
      pt: 'o gato pode jogar contra o cão.',
      ja: '猫は犬を相手に遊ぶことができます。',
    });
    expect(sayAll(clause(np('CAT'), 'PLAY_GAME', {
      verbPhrase: { tense: 'past' }, complements: { opponent: { phrase: np('DOG') } },
    }))).toEqual({
      en: 'the cat played against the dog.',
      it: 'il gatto giocò contro il cane.',
      fr: 'le chat joua contre le chien.',
      de: 'der Kater spielte gegen den Hund.',
      es: 'el gato jugó contra el perro.',
      pt: 'o gato jogou contra o cão.',
      ja: '猫は犬を相手に遊びました。',
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
    }))).toEqual({
      en: 'the cat does not play against the dog.',
      it: 'il gatto non gioca contro il cane.',
      fr: 'le chat ne joue pas contre le chien.',
      de: 'der Kater spielt nicht gegen den Hund.',
      es: 'el gato no juega contra el perro.',
      pt: 'o gato não joga contra o cão.',
      ja: '猫は犬を相手に遊びません。',
    });
  });

  // The override outside Japanese. English takes the word as it is; Italian reaches it through
  // prepDet, so a word that fuses with the article fuses ("al cane", "ai cani") and one that does
  // not stays apart ("con il cane"). No seeded verb names one yet. German is left out: it keeps
  // gegen's accusative whatever word the verb names ("mit den Hund" for "mit dem Hund").
  test('a verb naming its own word outside Japanese', () => {
    const plays = (phrase: NounElement) => clause(np('CAT'), 'TEST_PLAY', { complements: { opponent: { phrase } } });
    expect(sayAllWithPrep(plays(np('DOG')), { en: 'with', it: 'con' })).toMatchObject({
      en: 'the cat plays with the dog.',
      it: 'il gatto gioca con il cane.',
      fr: 'le chat joue contre le chien.', // it names none in French: the generic stands
    });
    expect(sayAllWithPrep(plays(np('DOG')), { it: 'a' }).it).toBe('il gatto gioca al cane.');
    expect(sayAllWithPrep(plays(np('DOG', { number: 'plural' })), { it: 'a' }).it).toBe('il gatto gioca ai cani.');
  });
});

// A318. German writes the opponent in gegen's accusative whatever word the verb names, so a verb
// whose lexeme names a dative preposition (`opponent_prep: 'mit'`) gets "mit den Hund". No seeded
// verb names one yet. The Want is what the comitative writes for the same phrase.
describe('known bugs: German keeps gegen\'s accusative under a verb-named opponent word (A318)', () => {
  const plays = (phrase: NounElement) => clause(np('CAT'), 'TEST_PLAY', { complements: { opponent: { phrase } } });

  test.fails('mit takes the dative, a noun', () => {
    expect(sayAllWithPrep(plays(np('DOG')), { de: 'mit' }).de).toBe('der Kater spielt mit dem Hund.');
  });

  test.fails('mit takes the dative, the feminine, the plural, the indefinite and a pronoun', () => {
    expect([np('WOMAN'), np('DOG', { number: 'plural' }), np('DOG', { definiteness: 'indefinite' }), np('THIRD_PERSON', { gender: 'masc' })]
      .map((p) => sayAllWithPrep(plays(p), { de: 'mit' }).de)).toEqual([
      'der Kater spielt mit der Frau.',
      'der Kater spielt mit den Hunden.',
      'der Kater spielt mit einem Hund.',
      'der Kater spielt mit ihm.',
    ]);
  });

  test('regression: the generic gegen keeps the accusative, and the comitative writes the dative', () => {
    expect(sayAllWithPrep(plays(np('DOG')), {}).de).toBe('der Kater spielt gegen den Hund.');
    expect(say(clause(np('CAT'), 'PLAY_GAME', { complements: { comitative: { phrase: np('DOG') } } }), 'de'))
      .toBe('der Kater spielt mit dem Hund.');
  });
});
