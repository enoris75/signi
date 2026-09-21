import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The COMITATIVE (localization C12) — the companion an act is carried out *together with*, as
// against the `instrumental` means it is carried out *by*. English spells both "with" and so do
// the Romance languages ("con" / "avec" / "com") and German ("mit"); Japanese is the one engine
// here that keeps them apart, marking the companion と and the means で.
const coordinates = (phrase: NounPhrase) =>
  sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase } } }));

describe('comitative', () => {
  test('the companion of the act', () => {
    expect(coordinates(np('DOG'))).toEqual({
      en: 'the cat coordinates with the dog.',
      it: 'il gatto coordina con il cane.',
      fr: 'le chat coordonne avec le chien.',
      de: 'der Kater koordiniert mit dem Hund.',
      es: 'el gato coordina con el perro.',
      ja: '猫は犬と調整します。',
      pt: 'o gato coordena com o cão.',
    });
  });

  test('it carries its own determiner, as the other adposition-bearing complements do', () => {
    expect(coordinates(np('DOG', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat coordinates with a dog.',
      it: 'il gatto coordina con un cane.',
      de: 'der Kater koordiniert mit einem Hund.', // dative after "mit"
      pt: 'o gato coordena com um cão.',
    });
  });

  test('it stands beside an instrument without collapsing into it', () => {
    expect(sayAll(clause(np('CAT'), 'COORDINATE', {
      complements: {
        comitative: { phrase: np('DOG') },
        instrumental: { phrase: np('WORD', { definiteness: 'indefinite' }) },
      },
    }))).toMatchObject({
      // Six of the seven say "with" twice; only Japanese tells the two apart, と for the
      // companion and で for the means.
      en: 'the cat coordinates with the dog with a word.',
      it: 'il gatto coordina con il cane con una parola.',
      de: 'der Kater koordiniert mit dem Hund mit einem Wort.',
      ja: '猫は犬と単語で調整します。',
    });
  });

  test('COORDINATE licenses it — the verb whose whole meaning is doing a thing alongside', () => {
    expect(coordinates(np('DOG')).en).toContain('with the dog');
  });
});

// A197. A pronoun after an adposition takes its tonic (disjunctive) form and no article: "with
// him", "con lui", "avec lui", "mit ihm", "con él", "com ele". Six of the seven engines run a
// comitative pronoun through the ordinary noun-phrase renderer instead, which hands it a determiner
// and the citation form ("with the he", "con il lui", "avec l'il", "mit dem er") — and in the plural
// declines it as a noun ("mit den sien", "con i loro"). Only the causal adjunct has a pronoun path;
// the passive by-phrase (`agentPhrase`) and a verb's prepositional object (`prepObjectText`, A139)
// already do it right. Japanese, which marks the companion と and needs no article, is right.
// The comitative is plan-only (localization C12), so nothing shipped shows it.
describe('known bugs: a pronoun in the comitative renders as a noun', () => {
  const withPronoun = (concept: string, extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: np(concept, extra) } } }));

  test('the third person, in all six languages, by gender and number', () => {
    expect(withPronoun('THIRD_PERSON')).toEqual({
      en: 'the cat coordinates with him.',      // now: "with the he"
      it: 'il gatto coordina con lui.',         // now: "con il lui"
      fr: 'le chat coordonne avec lui.',        // now: "avec l'il"
      de: 'der Kater koordiniert mit ihm.',     // now: "mit dem er"; mit governs the dative
      es: 'el gato coordina con él.',           // now: "con el él"
      ja: '猫は彼と調整します。',                  // already right
      pt: 'o gato coordena com ele.',           // now: "com o ele"
    });
    expect(withPronoun('THIRD_PERSON', { gender: 'fem' })).toEqual({
      en: 'the cat coordinates with her.',
      it: 'il gatto coordina con lei.',
      fr: 'le chat coordonne avec elle.',
      de: 'der Kater koordiniert mit ihr.',
      es: 'el gato coordina con ella.',
      ja: '猫は彼女と調整します。',
      pt: 'o gato coordena com ela.',
    });
    expect(withPronoun('THIRD_PERSON', { gender: 'neut' })).toMatchObject({
      en: 'the cat coordinates with it.',
      it: 'il gatto coordina con esso.',
      fr: 'le chat coordonne avec cela.',
      de: 'der Kater koordiniert mit ihm.',
    });
    // The plural is the worst of it: German declines the pronoun with the dative-plural -n.
    expect(withPronoun('THIRD_PERSON', { number: 'plural' })).toEqual({
      en: 'the cat coordinates with them.',
      it: 'il gatto coordina con loro.',
      fr: 'le chat coordonne avec eux.',
      de: 'der Kater koordiniert mit ihnen.',   // now: "mit den sien"
      es: 'el gato coordina con ellos.',
      ja: '猫は彼らと調整します。',
      pt: 'o gato coordena com eles.',
    });
    // Per conjunct, so a group mixes a noun and a pronoun under the one preposition.
    expect(sayAll(clause(np('CAT'), 'COORDINATE', {
      complements: { comitative: { phrase: { conjuncts: [np('DOG'), np('THIRD_PERSON')], conjunction: 'and' } } },
    }))).toMatchObject({
      en: 'the cat coordinates with the dog and him.',
      fr: 'le chat coordonne avec le chien et avec lui.',
      de: 'der Kater koordiniert mit dem Hund und mit ihm.',
    });
  });

  test('the first and second persons, where Spanish and Portuguese fuse the preposition', () => {
    expect(withPronoun('FIRST_PERSON')).toEqual({
      en: 'the cat coordinates with me.',
      it: 'il gatto coordina con me.',
      fr: 'le chat coordonne avec moi.',
      de: 'der Kater koordiniert mit mir.',
      es: 'el gato coordina conmigo.',          // con + mí fuses
      ja: '猫は私と調整します。',
      pt: 'o gato coordena comigo.',            // com + mim fuses
    });
    expect(withPronoun('SECOND_PERSON')).toEqual({
      en: 'the cat coordinates with you.',
      it: 'il gatto coordina con te.',
      fr: 'le chat coordonne avec toi.',
      de: 'der Kater koordiniert mit dir.',
      es: 'el gato coordina contigo.',          // con + ti fuses
      ja: '猫はあなたと調整します。',
      pt: 'o gato coordena com você.',          // "você" is already the tonic form
    });
    expect(withPronoun('FIRST_PERSON', { number: 'plural' })).toMatchObject({
      en: 'the cat coordinates with us.',
      it: 'il gatto coordina con noi.',
      fr: 'le chat coordonne avec nous.',
      de: 'der Kater koordiniert mit uns.',     // now: "mit den wirn"
      es: 'el gato coordina con nosotros.',
    });
    expect(withPronoun('SECOND_PERSON', { number: 'plural' })).toMatchObject({
      it: 'il gatto coordina con voi.',
      fr: 'le chat coordonne avec vous.',
      de: 'der Kater koordiniert mit euch.',    // now: "mit den ihrn"
      pt: 'o gato coordena com vocês.',
    });
  });

  // The same branch is missing from every other adposition-bearing complement — instrumental,
  // locative, terminus, direction, source, route and manner all render "the he" / "nel lui" /
  // "mit dem er". The instrumental stands here as the reminder that they are one defect and should
  // be fixed together: it takes the very same adposition as the comitative in all six, so its want
  // is the comitative's. The others are not pinned, because each needs its own adposition and, in
  // German, its own case — "durch" takes the accusative ("durch ihn"), not the dative the
  // `disjunctive` form already is. See the bug file.
  test('…and the instrumental, which shares the adposition, does the same', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('DOG'), complements: { instrumental: { phrase: np('THIRD_PERSON') } },
    }))).toEqual({
      en: 'the cat sees the dog with him.',     // now: "with the he"
      it: 'il gatto vede il cane con lui.',     // now: "con il lui"
      fr: 'le chat voit le chien avec lui.',    // now: "avec l'il"
      de: 'der Kater sieht den Hund mit ihm.',  // now: "mit dem er"
      es: 'el gato ve el perro con él.',        // now: "con el él"
      ja: '猫は彼で犬を見ます。',                  // already right: the means takes で
      pt: 'o gato vê o cão com ele.',           // now: "com o ele"
    });
  });

  // The two slots are one branch, so a clause holding both spells both, and the Portuguese 1pl
  // fuses like the 1sg ("com nós" is not Portuguese). Japanese keeps its own particles throughout.
  test('both slots in one clause, and the rest of the persons', () => {
    expect(sayAll(clause(np('CAT'), 'COORDINATE', {
      complements: { comitative: { phrase: np('THIRD_PERSON') }, instrumental: { phrase: np('FIRST_PERSON') } },
    }))).toEqual({
      en: 'the cat coordinates with him with me.',
      it: 'il gatto coordina con lui con me.',
      fr: 'le chat coordonne avec lui avec moi.',
      de: 'der Kater koordiniert mit ihm mit mir.',
      es: 'el gato coordina con él conmigo.',
      ja: '猫は彼と私で調整します。',                // と for the companion, で for the means
      pt: 'o gato coordena com ele comigo.',
    });
    expect(withPronoun('FIRST_PERSON', { number: 'plural' }).pt).toBe('o gato coordena conosco.');
    expect(withPronoun('SECOND_PERSON', { number: 'plural' }).es).toBe('el gato coordina con vosotros.');
    expect(withPronoun('THIRD_PERSON', { gender: 'neut' }).pt).toBe('o gato coordena com isso.');
    expect(withPronoun('SECOND_PERSON').ja).toBe('猫はあなたと調整します。');
  });

  // Regression: Japanese is right, a noun companion is right, and every other place a pronoun
  // stands behind an adposition already takes the tonic form.
  test('regression: Japanese, a noun companion, the cause, the agent and the prepositional object', () => {
    expect(coordinates(np('DOG'))).toMatchObject({
      en: 'the cat coordinates with the dog.',
      it: 'il gatto coordina con il cane.',
      fr: 'le chat coordonne avec le chien.',
      de: 'der Kater koordiniert mit dem Hund.',
      ja: '猫は犬と調整します。',
    });
    expect(withPronoun('THIRD_PERSON').ja).toBe('猫は彼と調整します。');
    expect(withPronoun('THIRD_PERSON', { gender: 'fem' }).ja).toBe('猫は彼女と調整します。');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: np('THIRD_PERSON') } } })))
      .toMatchObject({
        en: 'the cat runs because of him.',
        it: 'il gatto corre a causa sua.',
        fr: 'le chat court à cause de lui.',
        de: 'der Kater läuft seinetwegen.',
        es: 'el gato corre a causa de él.',
        pt: 'o gato corre por causa dele.',
      });
    expect(sayAll(clause(np('THIRD_PERSON'), 'SEE', { directObject: np('DOG'), verbPhrase: { voice: 'passive' } })))
      .toMatchObject({
        en: 'the dog is seen by him.',
        it: 'il cane è visto da lui.',
        fr: 'le chien est vu par lui.',
        de: 'der Hund wird von ihm gesehen.',
      });
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('THIRD_PERSON') }))).toMatchObject({
      it: 'il gatto clicca su di lui.',
      fr: 'le chat clique sur lui.',
      pt: 'o gato clica nele.',
    });
  });
});

// A203. The comitative and the instrumental now spell a pronoun as a pronoun (A197), and the other
// five adposition-bearing complements still do not: a locative, terminus, direction, source, route
// or manner pronoun goes through the ordinary noun-phrase renderer, which hands it a determiner and
// the citation form ("in the he", "nel lui", "im er"). It is the same missing branch, but each slot
// needs its own adposition and, in German, its own case — the dative the `disjunctive` already is
// for "in", the accusative for "durch", the nominative after "wie". French and Italian are left out
// of the pins: whether a place is "dans lui" or "en lui", and which Italian prepositions insert
// "di" ("sotto di lui"), are questions of usage this file records rather than answers.
describe('known bugs: a pronoun in the other adposition-bearing complements', () => {
  const HIM = np('THIRD_PERSON');
  const around = (type: 'locative' | 'source' | 'route' | 'manner', verb: string) =>
    sayAll(clause(np('CAT'), verb, { complements: { [type]: { phrase: HIM } } }));

  test.fails('English, Spanish and Portuguese take the tonic form after the plain adposition', () => {
    expect(around('locative', 'BE')).toMatchObject({
      en: 'the cat is in him.',       // now: "in the he"
      es: 'el gato está en él.',      // now: "en el él"
      pt: 'o gato está nele.',        // now: "no ele"; em + ele contracts
    });
    expect(around('source', 'COME')).toMatchObject({
      en: 'the cat comes from him.', es: 'el gato viene de él.', pt: 'o gato vem dele.',
    });
    expect(around('route', 'RUN')).toMatchObject({
      en: 'the cat runs through him.', es: 'el gato corre por él.', pt: 'o gato corre por ele.',
    });
    expect(around('manner', 'RUN')).toMatchObject({
      en: 'the cat runs like him.', es: 'el gato corre como él.', pt: 'o gato corre como ele.',
    });
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: HIM } } })))
      .toMatchObject({
        en: 'the man gives the book to him.', es: 'el hombre da el libro a él.', pt: 'o homem dá o livro a ele.',
      });
  });

  test.fails('…and German, where each preposition governs its own case', () => {
    expect(around('locative', 'BE').de).toBe('der Kater ist in ihm.');       // now: "im er"; in + dative
    expect(around('route', 'RUN').de).toBe('der Kater läuft durch ihn.');    // now: "durch den er"; durch + accusative
    expect(around('manner', 'RUN').de).toBe('der Kater läuft wie er.');      // now: "wie der er"; wie + nominative
  });

  // Regression: the two slots A197 did fix, and Japanese, which marks every one of these with a
  // particle and needs no article in any of them.
  test('the comitative, the instrumental and Japanese are right', () => {
    expect(sayAll(clause(np('CAT'), 'COORDINATE', { complements: { comitative: { phrase: HIM } } }))).toMatchObject({
      en: 'the cat coordinates with him.', de: 'der Kater koordiniert mit ihm.', es: 'el gato coordina con él.',
    });
    expect(around('locative', 'BE').ja).toBe('猫は彼にいます。');
    expect(around('source', 'COME').ja).toBe('猫は彼から来ます。');
    expect(around('manner', 'RUN').ja).toBe('猫は彼のように走ります。');
  });
});
