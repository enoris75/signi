import { describe, expect, test } from 'vitest';
import type { NounPhrase, PathSpecifier } from '@signi/shared';
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
// for "in", the accusative for "durch", the nominative after "wie". French and Italian were left
// out of the two pins below: whether a place is "dans lui" or "en lui", and which Italian
// prepositions insert "di" ("sotto di lui"), were questions of usage the file recorded rather than
// answered. The fix ruled both, and the third test pins the rulings.
describe('known bugs: a pronoun in the other adposition-bearing complements', () => {
  const HIM = np('THIRD_PERSON');
  const pl = np('THIRD_PERSON', { number: 'plural', gender: 'fem' });
  const around = (type: 'locative' | 'source' | 'route' | 'manner' | 'direction', verb: string, phrase = HIM) =>
    sayAll(clause(np('CAT'), verb, { complements: { [type]: { phrase } } }));
  const place = (value: PathSpecifier, phrase = HIM) =>
    sayAll(clause(np('CAT'), 'BE', { complements: { locative: { phrase, specifiers: [{ kind: 'path', value }] } } }));

  test('English, Spanish and Portuguese take the tonic form after the plain adposition', () => {
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
        // A recipient pronoun is the Spanish dative clitic, not the tonic after "a" (A351).
        en: 'the man gives the book to him.', es: 'el hombre le da el libro.', pt: 'o homem dá o livro a ele.',
      });
  });

  test('…and German, where each preposition governs its own case', () => {
    expect(around('locative', 'BE').de).toBe('der Kater ist in ihm.');       // now: "im er"; in + dative
    expect(around('route', 'RUN').de).toBe('der Kater läuft durch ihn.');    // now: "durch den er"; durch + accusative
    expect(around('manner', 'RUN').de).toBe('der Kater läuft wie er.');      // now: "wie der er"; wie + nominative
  });

  // The two the pins above leave to this one, because each turned on a point of usage rather than on
  // the missing branch. FRENCH does not say "dans lui" of a person: plain containment is "en lui",
  // the bare preposition a bare continent takes ("en Europe") and for the same reason. Every other
  // French relation keeps its own adposition, which is idiomatic before a pronoun as it stands.
  // ITALIAN reaches a pronoun through "di" after a class of prepositions and not after the rest —
  // "sotto di lui" but "in lui" — which is the list `prepObjectText` already consults for a verb's
  // prepositional object ("clicca su di lui", A139), read off the last word of the head so the
  // locutions governing their own "a" stay out of it ("intorno a lui", "davanti a lui").
  test('French puts a place in "en", and Italian reaches the pronoun through "di"', () => {
    expect(around('locative', 'BE')).toMatchObject({ fr: 'le chat est en lui.', it: 'il gatto è in lui.' });
    expect(around('route', 'RUN')).toMatchObject({
      fr: 'le chat court à travers lui.', it: 'il gatto corre attraverso di lui.',
    });
    expect(around('manner', 'RUN')).toMatchObject({ fr: 'le chat court comme lui.', it: 'il gatto corre come lui.' });
    expect(around('source', 'COME')).toMatchObject({ fr: 'le chat vient de lui.', it: 'il gatto viene via da lui.' });
    expect(place('under')).toMatchObject({ fr: 'le chat est sous lui.', it: 'il gatto è sotto di lui.' });
    expect(place('around')).toMatchObject({ fr: 'le chat est autour de lui.', it: 'il gatto è intorno a lui.' });
    expect(place('in_front_of')).toMatchObject({ fr: 'le chat est devant lui.', it: 'il gatto è davanti a lui.' });
    // The elided "de" carries its apostrophe rather than a space, as the causal adjunct's does.
    expect(place('around', pl).fr).toBe("le chat est autour d'elles.");
  });

  // Each relation keeps the adposition the slot already chose for a noun; only the determiner it
  // fused in is gone. The "de"-locutions the Iberian languages build them from take the pronoun as
  // they take a noun — Portuguese fusing its "de" with the 3rd person, as "em" fuses in the plain
  // locative ("nele") — and German's case falls out of the preposition, the dative for the static
  // two-way relations and the accusative for "um".
  test('every spatial relation keeps its own adposition', () => {
    expect(place('under')).toMatchObject({
      en: 'the cat is under him.', de: 'der Kater ist unter ihm.',
      es: 'el gato está debajo de él.', pt: 'o gato está debaixo dele.',
    });
    expect(place('over')).toMatchObject({
      en: 'the cat is over him.', de: 'der Kater ist über ihm.',
      es: 'el gato está por encima de él.', pt: 'o gato está por cima dele.',
    });
    expect(place('behind')).toMatchObject({
      en: 'the cat is behind him.', de: 'der Kater ist hinter ihm.',
      es: 'el gato está detrás de él.', pt: 'o gato está atrás dele.',
    });
    // "um" governs the accusative, where the static relations above take the dative.
    expect(place('around')).toMatchObject({
      en: 'the cat is around him.', de: 'der Kater ist um ihn.',
      es: 'el gato está alrededor de él.', pt: 'o gato está ao redor dele.',
    });
  });

  // A pronoun standing for a person IS a person, so it takes the branch an animate noun takes:
  // Spanish "hacia" and Portuguese "para" for a goal, Italian's andare-da, German's "von" for a
  // living source and its bare dative for a recipient. The NEUTER pronoun stands for a thing and
  // keeps the inanimate branch — the plain goal "a", German's "aus" and its accusative "in".
  test('a personal pronoun takes the animate branch, and a neuter one does not', () => {
    expect(around('direction', 'GO')).toMatchObject({
      en: 'the cat goes to him.', de: 'der Kater geht zu ihm.', it: 'il gatto va da lui.',
      es: 'el gato va hacia él.', pt: 'o gato vai para ele.', fr: 'le chat va vers lui.',
    });
    expect(around('source', 'COME').de).toBe('der Kater kommt von ihm.');
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: HIM } } })).de)
      .toBe('der Mann gibt ihm das Buch.');
    const IT_ = np('THIRD_PERSON', { gender: 'neut' });
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: IT_ } } }))).toMatchObject({
      es: 'el gato va a ello.', pt: 'o gato vai a isso.', it: 'il gatto va a esso.',
    });
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: IT_ } } })).de).toBe('der Kater kommt aus ihm.');
    expect(sayAll(clause(np('MAN'), 'SAVE', { directObject: np('BOOK'), complements: { terminus: { phrase: IT_ } } })).de)
      .toBe('der Mann speichert das Buch in es.');
  });

  // The similative is a shortened comparison — "corre como yo" stands for "como yo corro" — so the
  // Iberian languages put the SUBJECT pronoun there, as German's "wie" already does. Only the 1st
  // and 2nd singular spell the two apart; every other person and language is unaffected, and the
  // tonic form stays where a true preposition governs it ("por mí", "debaixo de ti").
  test('the similative takes the nominative in Spanish, Portuguese and German', () => {
    const like = (concept: string) => sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase: np(concept) } } }));
    expect(like('FIRST_PERSON')).toMatchObject({
      es: 'el gato corre como yo.', pt: 'o gato corre como eu.', de: 'der Kater läuft wie ich.',
      fr: 'le chat court comme moi.', it: 'il gatto corre come me.', en: 'the cat runs like me.',
    });
    expect(like('SECOND_PERSON')).toMatchObject({
      es: 'el gato corre como tú.', pt: 'o gato corre como você.', de: 'der Kater läuft wie du.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { route: { phrase: np('FIRST_PERSON') } } }))).toMatchObject({
      es: 'el gato corre por mí.', pt: 'o gato corre por mim.', de: 'der Kater läuft durch mich.',
    });
  });

  // The choice is per conjunct, as it is in the comitative: a group mixes a noun and a pronoun under
  // the one relation, each conjunct bringing the head English says once in front of the whole group
  // and the others repeat. A feminine plural takes the feminine tonic form here too (A205).
  test('a group mixes a noun and a pronoun, and the feminine plural carries', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: { locative: { phrase: { conjuncts: [np('HOUSE'), HIM], conjunction: 'and' } } },
    }))).toMatchObject({
      en: 'the cat is in the house and him.', de: 'der Kater ist im Haus und in ihm.',
      es: 'el gato está en la casa y en él.', pt: 'o gato está na casa e nele.',
      fr: 'le chat est dans la maison et en lui.', it: 'il gatto è nella casa e in lui.',
    });
    expect(around('locative', 'BE', pl)).toMatchObject({
      es: 'el gato está en ellas.', pt: 'o gato está nelas.', fr: 'le chat est en elles.',
      de: 'der Kater ist in ihnen.', it: 'il gatto è in loro.',
    });
    expect(around('route', 'RUN', pl)).toMatchObject({
      es: 'el gato corre por ellas.', pt: 'o gato corre por elas.', de: 'der Kater läuft durch sie.',
    });
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
