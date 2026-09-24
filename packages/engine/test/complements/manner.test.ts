import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The adverbial of manner (complemento di modo) — how an action is carried out. Its preposition
// is not chosen by the speaker: it follows the head noun's semantic manner relation, seeded on
// the concept. SPEED is a *measure* ("at the speed"), CARE a *means* ("with care"), WAY a *mode*
// ("in a … way"). It is a full noun phrase, so it takes a possessor and adjectives through the
// shared NP path.

const runManner = (phrase: ReturnType<typeof np>) =>
  sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase } } }));

describe('manner adverbial (complemento di modo)', () => {
  // similative → "like": the default an unmarked noun (WATER declares no relation) falls back to.
  test('similative — an unmarked noun takes "like" (the default)', () => {
    expect(runManner(np('WATER'))).toEqual({
      en: 'the cat runs like the water.',
      it: "il gatto corre come l'acqua.",
      fr: "le chat court comme l'eau.",
      es: 'el gato corre como el agua.',
      pt: 'o gato corre como a água.',
      de: 'der Kater läuft wie das Wasser.', // "wie" + nominative
      ja: '猫は水のように走ります。',
    });
  });

  // measure → "at": the flagship, with a genitive possessor ("at the speed of the light").
  test('measure — SPEED takes "at", with a possessor', () => {
    expect(runManner(np('SPEED', { possessor: np('LIGHT') }))).toEqual({
      en: "the cat runs at the light's speed.", // possessor renders as a Saxon genitive
      it: 'il gatto corre alla velocità della luce.',
      fr: 'le chat court à la vitesse de la lumière.',
      es: 'el gato corre a la velocidad de la luz.',
      pt: 'o gato corre à velocidade da luz.',
      de: 'der Kater läuft mit der Geschwindigkeit des Lichtes.', // the genitive possessor (B09)
      ja: '猫は光の速さで走ります。',
    });
  });

  // measure → "at", with an adjective ("at high speed"). Bare determiner, so no article.
  test('measure — SPEED with an adjective ("at high speed")', () => {
    expect(runManner(np('SPEED', { adjectives: ['HIGH'], definiteness: 'bare' }))).toEqual({
      en: 'the cat runs at high speed.',
      it: 'il gatto corre a velocità alta.',
      fr: 'le chat court à vitesse haute.',
      es: 'el gato corre a velocidad alta.',
      pt: 'o gato corre a velocidade alta.',
      de: 'der Kater läuft mit hoher Geschwindigkeit.', // "hoch" declines from its attributive stem "hoh-"
      ja: '猫は高い速さで走ります。',
    });
  });

  // A measure names a rate, not an identifiable thing, so a *definite* article reads oddly
  // ("at the high speed"). The translator forces a possessor-less measure adverbial bare, so
  // the definite determiner renders identically to the bare one above — never "at the …".
  test('measure — a definite determiner with no possessor is forced bare', () => {
    expect(runManner(np('SPEED', { adjectives: ['HIGH'], definiteness: 'definite' }))).toEqual({
      en: 'the cat runs at high speed.',
      it: 'il gatto corre a velocità alta.',
      fr: 'le chat court à vitesse haute.',
      es: 'el gato corre a velocidad alta.',
      pt: 'o gato corre a velocidade alta.',
      de: 'der Kater läuft mit hoher Geschwindigkeit.',
      ja: '猫は高い速さで走ります。',
    });
  });

  // The bare-forcing is gated on an adjective: a *plain* measure noun is anaphoric ("at the
  // speed" — a known speed), and a bare measure noun alone is non-idiomatic in Romance
  // ("a velocità"), so the definite article is kept.
  test('measure — a plain measure noun (no adjective) keeps its article', () => {
    expect(runManner(np('SPEED', { definiteness: 'definite' }))).toEqual({
      en: 'the cat runs at the speed.',
      it: 'il gatto corre alla velocità.',
      fr: 'le chat court à la vitesse.',
      es: 'el gato corre a la velocidad.',
      pt: 'o gato corre à velocidade.',
      de: 'der Kater läuft mit der Geschwindigkeit.',
      ja: '猫は速さで走ります。',
    });
  });

  // A possessor makes the measure specific, so the definite article is correct and kept —
  // the bare-forcing rule is gated on there being no possessor.
  test('measure — a possessor keeps the definite article', () => {
    expect(runManner(np('SPEED', { possessor: np('LIGHT'), definiteness: 'definite' }))).toEqual({
      en: "the cat runs at the light's speed.",
      it: 'il gatto corre alla velocità della luce.',
      fr: 'le chat court à la vitesse de la lumière.',
      es: 'el gato corre a la velocidad de la luz.',
      pt: 'o gato corre à velocidade da luz.',
      de: 'der Kater läuft mit der Geschwindigkeit des Lichtes.',
      ja: '猫は光の速さで走ります。',
    });
  });

  // measure — TIME, the temporal head of the frequency adverbials ALWAYS / NEVER (C03). A measure
  // like SPEED, so it takes "at"; here in the definite singular ("at the time"), pinning its gender
  // and the Romance article contractions (al / au / ao).
  test('measure — TIME takes "at" (definite singular)', () => {
    expect(runManner(np('TIME', { definiteness: 'definite' }))).toEqual({
      en: 'the cat runs at the time.',
      it: 'il gatto corre al tempo.',
      fr: 'le chat court au temps.',
      es: 'el gato corre al tiempo.',
      pt: 'o gato corre ao tempo.',
      de: 'der Kater läuft zur Zeit.', // a point in time takes "zu" (A60), fused with the definite article
      ja: '猫は時間で走ります。',
    });
  });

  // measure — TIME in the plural ("at the times"), pinning the plural forms and their plural
  // article contractions (ai / aux / a los / aos). German Zeit → Zeiten; Japanese is invariant.
  test('measure — TIME in the plural ("at the times")', () => {
    expect(runManner(np('TIME', { number: 'plural', definiteness: 'definite' }))).toEqual({
      en: 'the cat runs at the times.',
      it: 'il gatto corre ai tempi.',
      fr: 'le chat court aux temps.',
      es: 'el gato corre a los tiempos.',
      pt: 'o gato corre aos tempos.',
      de: 'der Kater läuft zu den Zeiten.',
      ja: '猫は時間で走ります。',
    });
  });

  // means → "with": the unmarked relation (CARE declares none explicitly → default means).
  test('means — CARE takes "with"', () => {
    expect(runManner(np('CARE', { definiteness: 'bare' }))).toEqual({
      en: 'the cat runs with care.',
      it: 'il gatto corre con cura.',
      fr: 'le chat court avec soin.',
      es: 'el gato corre con cuidado.',
      pt: 'o gato corre com cuidado.',
      de: 'der Kater läuft mit Sorgfalt.',
      ja: '猫は注意で走ります。',
    });
  });

  // mode → "in": WAY, with an adjective ("in a good way"). Indefinite, so the article stays.
  test('mode — WAY takes "in", with an adjective ("in a good way")', () => {
    expect(runManner(np('WAY', { adjectives: ['GOOD'], definiteness: 'indefinite' }))).toEqual({
      en: 'the cat runs in a good way.',
      it: 'il gatto corre in un buon modo.', // GOOD is prenominal in Italian (buono → buon)
      fr: "le chat court d'une bonne manière.",
      es: 'el gato corre de una manera buena.',
      pt: 'o gato corre de uma maneira boa.',
      de: 'der Kater läuft auf eine gute Weise.',
      ja: '猫は良い方法で走ります。',
    });
  });

  // The manner adverbial is licensed on every dynamic verb class, not just the intransitive RUN.
  // It sits with the other complements in the shared render order, so these fix its placement
  // alongside a direct object, a motion path, a dative, and a modal chain.
  describe('across verb classes', () => {
    // Transitive: after the direct object ("eats the food with care").
    test('transitive verb (EAT) — after the direct object', () => {
      expect(
        sayAll(clause(np('CAT'), 'EAT', {
          directObject: np('FOOD'),
          complements: { manner: { phrase: np('CARE', { definiteness: 'bare' }) } },
        })),
      ).toEqual({
        en: 'the cat eats the food with care.',
        it: 'il gatto mangia il cibo con cura.',
        fr: 'le chat mange la nourriture avec soin.',
        es: 'el gato come la comida con cuidado.',
        pt: 'o gato come a comida com cuidado.',
        de: 'der Kater frisst das Essen mit Sorgfalt.',
        ja: '猫は注意で食べ物を食べます。', // SOV: the manner complement precedes the direct object
      });
    });

    // Motion: manner precedes the path complement (COMPLEMENT_RENDER_ORDER: manner before direction).
    test('motion verb (GO) — manner before the direction', () => {
      expect(
        sayAll(clause(np('CAT'), 'GO', {
          complements: {
            manner: { phrase: np('FOX') },
            direction: { phrase: np('HOUSE') },
          },
        })),
      ).toEqual({
        en: 'the cat goes like the fox to the house.',
        it: 'il gatto va come la volpe alla casa.',
        fr: 'le chat va comme le renard à la maison.',
        es: 'el gato va como el zorro a la casa.',
        pt: 'o gato vai como a raposa à casa.',
        de: 'der Kater geht wie der Fuchs zum Haus.', // zu + dem → zum
        ja: '猫はキツネのように家へ行きます。',
      });
    });

    // Ditransitive: the dative terminus precedes the manner (terminus before manner in the order).
    test('ditransitive verb (GIVE) — after the object and dative', () => {
      expect(
        sayAll(clause(np('CAT'), 'GIVE', {
          directObject: np('BOOK'),
          complements: {
            terminus: { phrase: np('DOG') },
            manner: { phrase: np('CARE', { definiteness: 'bare' }) },
          },
        })),
      ).toEqual({
        en: 'the cat gives the book to the dog with care.',
        it: 'il gatto dà il libro al cane con cura.',
        fr: 'le chat donne le livre au chien avec soin.',
        es: 'el gato da el libro al perro con cuidado.',
        pt: 'o gato dá o livro ao cão com cuidado.',
        de: 'der Kater gibt dem Hund das Buch mit Sorgfalt.', // dative precedes accusative
        ja: '猫は犬に注意で本をあげます。',
      });
    });

    // Modal: the manner belongs to the clause, so it renders under a modal chain too ("must run …").
    test('modal chain (MUST + RUN) — manner still renders', () => {
      expect(
        sayAll(clause(np('CAT'), 'RUN', {
          verbPhrase: { modals: ['MUST'] },
          complements: { manner: { phrase: np('SPEED', { definiteness: 'bare' }) } },
        })),
      ).toEqual({
        en: 'the cat must run at speed.',
        it: 'il gatto deve correre a velocità.',
        fr: 'le chat doit courir à vitesse.',
        es: 'el gato debe correr a velocidad.',
        pt: 'o gato deve correr a velocidade.',
        de: 'der Kater muss mit Geschwindigkeit laufen.',
        ja: '猫は速さで走る必要があります。',
      });
    });
  });
});

// A181. A similative manner phrase ("like the dog") is a comparison: "like no dog" says the act is
// done as no dog does it, and the clause itself stays positive. English and German say so ("the cat
// runs like no dog", "der Kater läuft wie kein Hund"). The negative word is licensed inside the
// comparison, as in "canta come nessuno", "chante comme personne", "canta como nadie", "canta como
// ninguém". The four Romance engines used to count the `no` as a postverbal negative word of the
// clause (A33) and add its negator, so "il gatto non corre come nessun cane" read "does not run like
// any dog". `hasNegativeComplement` now leaves a similative comparison out. The measure, means and
// mode relations are not comparisons, and their `no` does negate ("non corre a nessuna velocità").
// Found by the random phrase "I have destroyed many young men who the near man deletes down down like
// no tooth" (seed 857733), rendered "non ho distrutto …" in Italian.
describe('known bugs: a `no` in a similative manner phrase', () => {
  const likeNo = (concept: string) => ({ manner: { phrase: np(concept, { definiteness: 'no' }) } });

  test('Romance keeps the clause positive under "like no …"', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: likeNo('DOG') }))).toMatchObject({
      it: 'il gatto corre come nessun cane.', // was: "il gatto non corre come nessun cane."
      fr: 'le chat court comme aucun chien.', // was: "le chat ne court comme aucun chien."
      es: 'el gato corre como ningún perro.',
      pt: 'o gato corre como nenhum cão.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { tense: 'past' }, complements: likeNo('DOG') }))).toMatchObject({
      it: 'il gatto corse come nessun cane.', fr: 'le chat courut comme aucun chien.',
      es: 'el gato corrió como ningún perro.', pt: 'o gato correu como nenhum cão.',
    });
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE'), complements: likeNo('DOG') }))).toMatchObject({
      it: 'il gatto mangia il topo come nessun cane.', fr: 'le chat mange la souris comme aucun chien.',
      es: 'el gato come el ratón como ningún perro.', pt: 'o gato come o rato como nenhum cão.',
    });
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'RUN' }, complements: likeNo('CAT') } }), 'EAT'))).toMatchObject({
      it: 'il cane che corre come nessun gatto mangia.', fr: 'le chien qui court comme aucun chat mange.',
      es: 'el perro que corre como ningún gato come.', pt: 'o cão que corre como nenhum gato come.',
    });
    // The random phrase.
    expect(sayAll({
      subject: np('FIRST_PERSON', { number: 'singular' }),
      verbPhrase: { verb: 'DESTROY', aspect: 'resultative', modifier: 'DOWN' },
      directObject: np('YOUNG_MAN', {
        definiteness: 'many',
        relative: { verbPhrase: { verb: 'DELETE', modifier: 'DOWN' }, headRole: 'directObject', subject: np('MAN', { gender: 'fem', adjectives: ['NEAR'] }) },
      }),
      complements: likeNo('TOOTH'),
    })).toMatchObject({
      it: "ho distrutto molti giovani che l'uomo vicino elimina giù giù come nessun dente.",
      fr: "j'ai détruit beaucoup de jeunes hommes que l'homme proche supprime vers le bas vers le bas comme aucune dent.",
      es: 'he destruido a muchos jóvenes que el hombre cercano elimina abajo abajo como ningún diente.',
      pt: 'destruí muitos jovens que o homem próximo exclui para baixo para baixo como nenhum dente.',
    });
  });

  // Regression: English and German already keep the clause positive, and a `no` under the other
  // three relations, which are not comparisons, still negates the clause in every concord language.
  test('English and German are right, and a measure, means or mode `no` still negates', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: likeNo('DOG') }))).toMatchObject({
      en: 'the cat runs like no dog.', de: 'der Kater läuft wie kein Hund.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: likeNo('SPEED') }))).toMatchObject({
      it: 'il gatto non corre a nessuna velocità.', fr: 'le chat ne court à aucune vitesse.',
      es: 'el gato no corre a ninguna velocidad.', pt: 'o gato não corre a nenhuma velocidade.',
      ja: '猫はどの速さでも走りません。',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: likeNo('CARE') }))).toMatchObject({
      it: 'il gatto non corre con nessuna cura.', fr: 'le chat ne court avec aucun soin.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: likeNo('WAY') }))).toMatchObject({
      it: 'il gatto non corre in nessun modo.', es: 'el gato no corre de ninguna manera.',
    });
  });

  // A comparison's `no` is no longer one of the clause's negations, so it no longer takes part in
  // A158's collapse either: a clause that negates for its own reasons — the verb's "not", a NEVER,
  // a `no` object — keeps that negation *and* keeps the comparison's `no`, in English and German as
  // in Romance. Ruled on 2026-09-21: "does not run like no dog" is the reading the plan asks for,
  // not "like any dog". French gains its "pas" back, which the stray complement negator had eaten.
  test('a clause that negates for its own reasons keeps both negations', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { negative: true }, complements: likeNo('DOG') }))).toMatchObject({
      en: 'the cat does not run like no dog.', // was: "like any dog"
      de: 'der Kater läuft nicht wie kein Hund.', // was: "läuft wie kein Hund", the "nicht" dropped
      it: 'il gatto non corre come nessun cane.',
      fr: 'le chat ne court pas comme aucun chien.', // was: "ne court comme aucun chien", a bare "ne"
      es: 'el gato no corre como ningún perro.',
      pt: 'o gato não corre como nenhum cão.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER' }, complements: likeNo('DOG') }))).toMatchObject({
      en: 'the cat never runs like no dog.', // was: "never runs like any dog"
      de: 'der Kater läuft nie wie kein Hund.', // was: "läuft nie wie ein Hund"
      it: 'il gatto non corre mai come nessun cane.',
      fr: 'le chat ne court jamais comme aucun chien.',
    });
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE', { definiteness: 'no' }), complements: likeNo('DOG'),
    }))).toMatchObject({
      en: 'the cat eats no mouse like no dog.', // was: "eats no mouse like any dog"
      de: 'der Kater frisst keine Maus wie kein Hund.', // was: "frisst keine Maus wie ein Hund"
      it: 'il gatto non mangia nessun topo come nessun cane.',
      es: 'el gato no come ningún ratón como ningún perro.',
    });
  });

  // Japanese is left exactly as it was: it writes every `no` argument with the どの…も circumfix, and
  // that も needs the clause-final ない to close, so its predicate still counts a similative `no`
  // (`countComparisons`). 猫はどの犬のようにも走りません。 reads "does not run like any dog", the same
  // misreading Romance had, and Japanese has no circumfix for "like no X" — the phrasing is still open.
  test('Japanese keeps its どの…も circumfix and its negated predicate', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: likeNo('DOG') })).ja).toBe('猫はどの犬のようにも走りません。');
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { tense: 'past' }, complements: likeNo('DOG') })).ja)
      .toBe('猫はどの犬のようにも走りませんでした。');
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE'), complements: likeNo('DOG') })).ja)
      .toBe('猫はどの犬のようにもネズミを食べません。');
  });
});

// A226. `resolveComplements` forces an adjective-modified measure adverbial bare, because a rate is
// not an identifiable thing and "at the high speed" reads oddly — the tests above pin that for the
// definite. The rule did not look at which determiner it overrode, so it took every one: the
// indefinite ("at other time", "zu anderer Zeit"), a quantifier ("at other times" for "at all other
// times") and "no", whose negation goes with it ("runs at other time" for "runs at no other time").
// AGAIN's verbless gloss on the same noun keeps its article ("at another time"), which is what
// isolates the defect to the clause. Found authoring the C23-C28 sweep.
describe('known bugs: a measure manner adverbial loses the determiner it was given (A226)', () => {
  const OTHER_TIME = (extra: Partial<NounPhrase>) => np('TIME', { adjectives: ['OTHER'], ...extra });
  const four = (said: Record<string, string>) => ({ en: said['en'], it: said['it'], fr: said['fr'], de: said['de'] });

  test('only the definite gives way to bare; every other determiner stays', () => {
    expect(four(runManner(OTHER_TIME({ definiteness: 'indefinite' })))).toEqual({
      en: 'the cat runs at another time.', it: 'il gatto corre a un altro tempo.',
      fr: 'le chat court à un autre temps.', de: 'der Kater läuft zu einer anderen Zeit.',
    });
    expect(four(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { tense: 'past' }, complements: { manner: { phrase: OTHER_TIME({ definiteness: 'indefinite' }) } } })))).toEqual({
      en: 'the cat ran at another time.', it: 'il gatto corse a un altro tempo.',
      fr: 'le chat courut à un autre temps.', de: 'der Kater lief zu einer anderen Zeit.',
    });
    expect(four(runManner(np('SPEED', { adjectives: ['HIGH'], definiteness: 'indefinite' })))).toEqual({
      en: 'the cat runs at a high speed.', it: 'il gatto corre a una velocità alta.',
      fr: 'le chat court à une vitesse haute.', de: 'der Kater läuft mit einer hohen Geschwindigkeit.',
    });
    expect(runManner(OTHER_TIME({ definiteness: 'all', number: 'plural' }))).toMatchObject({
      en: 'the cat runs at all other times.', de: 'der Kater läuft zu allen anderen Zeiten.', es: 'el gato corre a todos los otros tiempos.',
    });
    expect(runManner(OTHER_TIME({ definiteness: 'this' }))).toMatchObject({
      en: 'the cat runs at this other time.', de: 'der Kater läuft zu dieser anderen Zeit.', es: 'el gato corre a este otro tiempo.',
    });
    expect(runManner(OTHER_TIME({ definiteness: 'no' }))).toEqual({
      en: 'the cat runs at no other time.', it: 'il gatto non corre a nessun altro tempo.',
      fr: 'le chat ne court à aucun autre temps.', de: 'der Kater läuft zu keiner anderen Zeit.',
      es: 'el gato no corre a ningún otro tiempo.', ja: '猫はどの別の時間でも走りません。', pt: 'o gato não corre a nenhum outro tempo.',
    });
  });

  test('the other demonstrative and quantifiers stay, "no" negates in the past, and each conjunct decides for itself', () => {
    expect(four(runManner(OTHER_TIME({ definiteness: 'that' })))).toEqual({
      en: 'the cat runs at that other time.', it: "il gatto corre a quell'altro tempo.",
      fr: 'le chat court à cet autre temps.', de: 'der Kater läuft zu jener anderen Zeit.',
    });
    expect(four(runManner(OTHER_TIME({ definiteness: 'some', number: 'plural' })))).toEqual({
      en: 'the cat runs at some other times.', it: 'il gatto corre ad alcuni altri tempi.',
      fr: 'le chat court à quelques autres temps.', de: 'der Kater läuft zu einigen anderen Zeiten.',
    });
    expect(runManner(np('SPEED', { adjectives: ['HIGH'], definiteness: 'many', number: 'plural' })))
      .toMatchObject({ en: 'the cat runs at many high speeds.', de: 'der Kater läuft mit vielen hohen Geschwindigkeiten.' });
    expect(sayAll(clause(np('CAT'), 'RUN', {
      verbPhrase: { tense: 'past' }, complements: { manner: { phrase: np('SPEED', { adjectives: ['HIGH'], definiteness: 'no' }) } },
    }))).toEqual({
      en: 'the cat ran at no high speed.', it: 'il gatto non corse a nessuna velocità alta.',
      fr: 'le chat ne courut à aucune vitesse haute.', de: 'der Kater lief mit keiner hohen Geschwindigkeit.',
      es: 'el gato no corrió a ninguna velocidad alta.', ja: '猫はどの高い速さでも走りませんでした。', pt: 'o gato não correu a nenhuma velocidade alta.',
    });
    // A group: the definite conjunct goes bare, the indefinite one keeps its article.
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase: {
      conjuncts: [np('SPEED', { adjectives: ['HIGH'] }), np('SPEED', { adjectives: ['LOW'], definiteness: 'indefinite' })], conjunction: 'or',
    } } } }))).toMatchObject({
      en: 'the cat runs at high speed or a low speed.',
      de: 'der Kater läuft mit hoher Geschwindigkeit oder mit einer niedrigen Geschwindigkeit.',
      it: 'il gatto corre a velocità alta o a una velocità bassa.',
    });
  });

  test('regression: the definite and the bare, a plain measure noun, the gloss, and Spanish, Portuguese and Japanese', () => {
    expect(runManner(np('SPEED', { adjectives: ['HIGH'] })).en).toBe('the cat runs at high speed.');
    expect(runManner(np('SPEED', { adjectives: ['HIGH'], definiteness: 'bare' })).en).toBe('the cat runs at high speed.');
    expect(runManner(np('TIME', { definiteness: 'indefinite' })).en).toBe('the cat runs at a time.');
    expect(sayAll({ subject: OTHER_TIME({ definiteness: 'indefinite', mannerGloss: true }) })).toMatchObject({
      en: 'at another time.', it: 'a un altro tempo.', fr: 'à un autre temps.', de: 'zu einer anderen Zeit.',
    });
    expect(runManner(OTHER_TIME({ definiteness: 'indefinite' }))).toMatchObject({
      es: 'el gato corre a otro tiempo.', ja: '猫は別の時間で走ります。', pt: 'o gato corre a outro tempo.',
    });
  });
});

// A235. `resolveComplements` forces an adjective-modified, definite measure adverbial bare, because a
// measure there names a rate ("at high speed", A226). Two nouns are measures, SPEED and TIME, and only
// SPEED names a rate. TIME is a count noun and an occasion, so the rule strips the article English
// needs: "the cat runs at other time". Found fixing A226.
describe('known bugs: TIME under an adjective goes bare as if it named a rate (A235)', () => {
  const runsAt = (phrase: NounPhrase, tense?: 'past') =>
    sayAll(clause(np('CAT'), 'RUN', { verbPhrase: tense ? { tense } : {}, complements: { manner: { phrase } } }));

  test('TIME keeps the definite article a count noun needs', () => {
    expect(runsAt(np('TIME', { adjectives: ['OTHER'] })).en).toBe('the cat runs at the other time.');
    expect(runsAt(np('TIME', { adjectives: ['OTHER'] }), 'past').en).toBe('the cat ran at the other time.');
  });

  test('the plural keeps it too, and German fuses it into "zu" as for a plain TIME', () => {
    expect(runsAt(np('TIME', { adjectives: ['OTHER'], number: 'plural' }))).toMatchObject({
      en: 'the cat runs at the other times.', de: 'der Kater läuft zu den anderen Zeiten.',
    });
    expect(runsAt(np('TIME', { adjectives: ['OTHER'] })).de).toBe('der Kater läuft zur anderen Zeit.');
    expect(runsAt(np('TIME', { adjectives: ['OTHER'] }), 'past').de).toBe('der Kater lief zur anderen Zeit.');
    expect(runsAt(np('TIME')).de).toBe('der Kater läuft zur Zeit.');
  });

  test('regression: SPEED goes bare, a plain TIME and an indefinite one keep their article', () => {
    expect(runsAt(np('SPEED', { adjectives: ['HIGH'] })).en).toBe('the cat runs at high speed.');
    expect(runsAt(np('TIME')).en).toBe('the cat runs at the time.');
    expect(runsAt(np('TIME', { adjectives: ['OTHER'], definiteness: 'indefinite' })).en).toBe('the cat runs at another time.');
  });

  test('regression: SPEED under an adjective is still a rate, bare in the past and in German too', () => {
    expect(runsAt(np('SPEED', { adjectives: ['HIGH'] }), 'past')).toMatchObject({
      en: 'the cat ran at high speed.', de: 'der Kater lief mit hoher Geschwindigkeit.', it: 'il gatto corse a velocità alta.',
    });
    expect(runsAt(np('SPEED', { adjectives: ['HIGH'] })).de).toBe('der Kater läuft mit hoher Geschwindigkeit.');
  });
});
