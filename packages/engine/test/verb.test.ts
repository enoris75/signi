import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

/** "the cat eats", with the verb phrase varied. */
const catEats = (verbPhrase: Partial<VerbPhrase>) =>
  sayAll(clause(np('CAT'), 'EAT', { verbPhrase }));

// Tense, aspect and negation — everything the verb phrase carries.
describe('tense', () => {
  test('present', () => {
    expect(catEats({})).toMatchObject({ en: 'the cat eats.', de: 'der Kater isst.' });
  });

  test('past', () => {
    expect(catEats({ tense: 'past' })).toEqual({
      en: 'the cat ate.',
      // Romance maps the simple past onto the perfective (passato remoto / passé simple /
      // pretérito), not the periphrastic perfect — that is `resultative`.
      it: 'il gatto mangiò.',
      fr: 'le chat mangea.',
      es: 'el gato comió.',
      pt: 'o gato comeu.',
      de: 'der Kater aß.',
      ja: '猫は食べました。',
    });
  });

  test('future', () => {
    expect(catEats({ tense: 'future' })).toEqual({
      en: 'the cat will eat.',
      it: 'il gatto mangerà.',
      fr: 'le chat mangera.',
      es: 'el gato comerá.',
      pt: 'o gato comerá.',
      de: 'der Kater wird essen.',
      // Japanese has no future tense: the non-past form covers it, so this is the present.
      ja: '猫は食べます。',
    });
  });
});

describe('negation', () => {
  test('present', () => {
    expect(catEats({ negative: true })).toEqual({
      en: 'the cat does not eat.', // English needs do-support
      it: 'il gatto non mangia.',
      fr: 'le chat ne mange pas.', // French brackets the verb
      es: 'el gato no come.',
      pt: 'o gato não come.',
      de: 'der Kater isst nicht.', // German puts it after the verb
      ja: '猫は食べません。', // Japanese inflects the verb itself
    });
  });
});

describe('aspect', () => {
  test('progressive', () => {
    expect(catEats({ aspect: 'progressive' })).toEqual({
      en: 'the cat is eating.',
      it: 'il gatto sta mangiando.',
      fr: 'le chat est en train de manger.',
      es: 'el gato está comiendo.',
      pt: 'o gato está comendo.',
      de: 'der Kater isst gerade.', // German has no progressive; it uses an adverb
      ja: '猫は食べています。',
    });
  });

  test('progressive in the past', () => {
    expect(catEats({ aspect: 'progressive', tense: 'past' })).toEqual({
      en: 'the cat was eating.',
      it: 'il gatto stava mangiando.',
      fr: 'le chat était en train de manger.',
      es: 'el gato estaba comiendo.',
      pt: 'o gato estava comendo.',
      de: 'der Kater aß gerade.',
      ja: '猫は食べていました。',
    });
  });

  test('resultative', () => {
    expect(catEats({ aspect: 'resultative' })).toMatchObject({
      en: 'the cat has eaten.',
      it: 'il gatto ha mangiato.',
      fr: 'le chat a mangé.',
      es: 'el gato ha comido.',
      de: 'der Kater hat gegessen.',
    });
  });

  test('resultative in the past is a pluperfect', () => {
    expect(catEats({ aspect: 'resultative', tense: 'past' })).toMatchObject({
      en: 'the cat had eaten.',
      it: 'il gatto aveva mangiato.',
      fr: 'le chat avait mangé.',
      es: 'el gato había comido.',
      pt: 'o gato tinha comido.',
      de: 'der Kater hatte gegessen.',
    });
  });

  test('prospective', () => {
    expect(catEats({ aspect: 'prospective' })).toEqual({
      en: 'the cat is about to eat.',
      it: 'il gatto sta per mangiare.',
      fr: 'le chat est sur le point de manger.',
      es: 'el gato está a punto de comer.',
      pt: 'o gato está prestes a comer.',
      de: 'der Kater ist im Begriff zu essen.',
      ja: '猫は食べるところです。',
    });
  });
});

// Aspect and tense are orthogonal: the aspect picks the construction, the tense conjugates the
// auxiliary that construction introduces.
describe('aspect × tense', () => {
  test('progressive', () => {
    expect(catEats({ aspect: 'progressive', tense: 'future' })).toMatchObject({
      en: 'the cat will be eating.',
      it: 'il gatto starà mangiando.', // stare goes to the future, the gerund stays put
      fr: 'le chat sera en train de manger.',
      es: 'el gato estará comiendo.',
      de: 'der Kater wird gerade essen.',
    });
  });

  test('prospective', () => {
    expect(catEats({ aspect: 'prospective', tense: 'past' })).toMatchObject({
      en: 'the cat was about to eat.',
      it: 'il gatto stava per mangiare.',
      fr: 'le chat était sur le point de manger.',
      de: 'der Kater war im Begriff zu essen.',
      ja: '猫は食べるところでした。',
    });

    expect(catEats({ aspect: 'prospective', tense: 'future' })).toMatchObject({
      en: 'the cat will be about to eat.',
      it: 'il gatto starà per mangiare.',
      de: 'der Kater wird im Begriff sein zu essen.',
    });
  });

  test('resultative in the future is a future perfect', () => {
    expect(catEats({ aspect: 'resultative', tense: 'future' })).toMatchObject({
      en: 'the cat will have eaten.',
      it: 'il gatto avrà mangiato.',
      fr: 'le chat aura mangé.',
      es: 'el gato habrá comido.',
      pt: 'o gato terá comido.',
      de: 'der Kater wird gegessen haben.',
    });
  });
});

// The negation lands on the finite element — which, under an aspect, is the auxiliary the aspect
// introduced, not the main verb.
describe('aspect × negation', () => {
  test('progressive', () => {
    expect(catEats({ aspect: 'progressive', negative: true })).toMatchObject({
      en: 'the cat is not eating.',
      it: 'il gatto non sta mangiando.', // non negates STARE, the finite auxiliary
      fr: "le chat n'est pas en train de manger.", // ne elides before the vowel
      es: 'el gato no está comiendo.',
      de: 'der Kater isst gerade nicht.',
      ja: '猫は食べていません。',
    });
  });

  test('resultative', () => {
    expect(catEats({ aspect: 'resultative', negative: true })).toMatchObject({
      en: 'the cat has not eaten.',
      it: 'il gatto non ha mangiato.',
      fr: "le chat n'a pas mangé.", // pas sits between auxiliary and participle
      es: 'el gato no ha comido.',
      de: 'der Kater hat nicht gegessen.',
      ja: '猫は食べてしまいません。',
    });
  });

  test('all three at once — aspect, tense and negation', () => {
    expect(catEats({ aspect: 'resultative', tense: 'past', negative: true })).toMatchObject({
      en: 'the cat had not eaten.',
      it: 'il gatto non aveva mangiato.',
      fr: "le chat n'avait pas mangé.",
      de: 'der Kater hatte nicht gegessen.',
      ja: '猫は食べてしまいませんでした。',
    });

    expect(catEats({ aspect: 'progressive', tense: 'future', negative: true })).toMatchObject({
      en: 'the cat will not be eating.',
      it: 'il gatto non starà mangiando.',
      fr: 'le chat ne sera pas en train de manger.',
      de: 'der Kater wird gerade nicht essen.',
    });
  });
});

describe('tense × negation', () => {
  test('past', () => {
    expect(catEats({ tense: 'past', negative: true })).toEqual({
      en: 'the cat did not eat.', // do-support, and the tense moves onto DO
      it: 'il gatto non mangiò.',
      fr: 'le chat ne mangea pas.',
      es: 'el gato no comió.',
      pt: 'o gato não comeu.',
      de: 'der Kater aß nicht.',
      ja: '猫は食べませんでした。',
    });
  });

  test('future', () => {
    expect(catEats({ tense: 'future', negative: true })).toEqual({
      en: 'the cat will not eat.', // no do-support: WILL is already an auxiliary
      it: 'il gatto non mangerà.',
      fr: 'le chat ne mangera pas.',
      es: 'el gato no comerá.',
      pt: 'o gato não comerá.',
      de: 'der Kater wird nicht essen.',
      ja: '猫は食べません。', // the non-past covers the future
    });
  });
});

// An adverb can carry polarity of its own. NEVER is inherently negative: it induces the negative
// morphology WITHOUT `negative` being set — Romance negative concord (non … mai), and a negated
// verb in Japanese. ALWAYS is not, so it composes with `negative` in the ordinary way.
describe('adverb polarity', () => {
  test('ALWAYS with negation — the negation scopes over the adverb', () => {
    // "does not always eat" (¬always), not "always does not eat" (always ¬).
    expect(catEats({ modifier: 'ALWAYS', negative: true })).toMatchObject({
      en: 'the cat does not always eat.',
      it: 'il gatto non mangia sempre.',
      fr: 'le chat ne mange pas toujours.',
      es: 'el gato no come siempre.',
      de: 'der Kater isst nicht immer.',
    });

    expect(catEats({ modifier: 'ALWAYS', negative: true, tense: 'past' })).toMatchObject({
      en: 'the cat did not always eat.',
      it: 'il gatto non mangiò sempre.',
      de: 'der Kater aß nicht immer.',
    });
  });

  test('NEVER at POSITIVE polarity still negates the verb', () => {
    // `negative` is false here. NEVER carries the negation itself, and each language marks it
    // the way it marks any negation — Romance concord, a negated Japanese verb.
    expect(catEats({ modifier: 'NEVER' })).toEqual({
      en: 'the cat never eats.',
      it: 'il gatto non mangia mai.', // non … mai — the concord pair
      fr: 'le chat ne mange jamais.', // ne … jamais, with jamais replacing pas
      es: 'el gato nunca come.',
      pt: 'o gato nunca come.',
      de: 'der Kater isst nie.',
      ja: '猫は決して食べません。', // 決して + a negated verb
    });
  });

  test('NEVER at positive polarity, in the past', () => {
    expect(catEats({ modifier: 'NEVER', tense: 'past' })).toMatchObject({
      en: 'the cat never ate.',
      it: 'il gatto non mangiò mai.',
      fr: 'le chat ne mangea jamais.',
      es: 'el gato nunca comió.',
      ja: '猫は決して食べませんでした。',
    });
  });

  test('NEVER with `negative` set does not double-negate', () => {
    // The adverb's negation is absorbed rather than compounded: still "never eats", not
    // "does not never eat".
    expect(catEats({ modifier: 'NEVER', negative: true })).toMatchObject({
      en: 'the cat never eats.',
      it: 'il gatto non mangia mai.',
      fr: 'le chat ne mange jamais.',
      de: 'der Kater isst nie.',
    });
  });
});

describe('known bugs: aspect', () => {
  // Portuguese "tem comido" is ITERATIVE ("has been eating, repeatedly"), not resultative. The
  // perfect of a bounded event is the pretérito perfeito: "o gato comeu". pt.ts documents its
  // choice of `ter` as the auxiliary but not this consequence, so it reads as an oversight.
  test.fails('resultative Portuguese should use the pretérito, not ter + particípio', () => {
    expect(catEats({ aspect: 'resultative' })).toMatchObject({ pt: 'o gato comeu.' });
  });

  // Japanese DROPS the negation on the prospective: 食べるところです comes out for both polarities,
  // so "the cat is NOT about to eat" renders as "the cat IS about to eat" — the meaning inverts.
  // The other two aspects negate correctly (食べていません, 食べてしまいません), which is what makes
  // this an oversight rather than a gap in the suffix inventory.
  test.fails('Japanese must not drop the negation on the prospective aspect', () => {
    expect(catEats({ aspect: 'prospective', negative: true }).ja)
      .not.toBe(catEats({ aspect: 'prospective' }).ja);
  });

  // German negates INSIDE the prospective periphrasis rather than outside it:
  //
  //     got   "der Kater ist im Begriff NICHT zu essen."   = is about to NOT eat
  //     want  "der Kater ist NICHT im Begriff zu essen."   = is NOT about to eat
  //
  // The negation belongs on the finite "ist", as it does for the other aspects ("hat nicht
  // gegessen", "isst gerade nicht"). Another meaning-inverting placement.
  test.fails('German should negate the prospective auxiliary, not the governed infinitive', () => {
    expect(catEats({ aspect: 'prospective', negative: true }))
      .toMatchObject({ de: 'der Kater ist nicht im Begriff zu essen.' });
  });
});

describe('known bugs: adverb placement', () => {
  // Italian puts a FREQUENCY adverb between the auxiliary and the past participle, never after
  // it: "ha SEMPRE mangiato", "non ha MAI mangiato". The engine appends it to the whole group.
  //
  //     got   "il gatto ha mangiato sempre."       want  "il gatto ha sempre mangiato."
  //     got   "il gatto non ha mangiato mai."      want  "il gatto non ha mai mangiato."
  //
  // A MANNER adverb genuinely does follow the participle in Italian ("ha mangiato bene"), and the
  // engine gets that right — so the two classes need telling apart, exactly as they do in English
  // (see the frequency-adverb bug in modals.test.ts). French and German both place them properly
  // ("a toujours mangé", "hat immer gegessen").
  test.fails('Italian should put a frequency adverb between auxiliary and participle', () => {
    expect(catEats({ modifier: 'ALWAYS', aspect: 'resultative' }))
      .toMatchObject({ it: 'il gatto ha sempre mangiato.' });
  });

  test.fails('…and likewise the negative concord adverb "mai"', () => {
    expect(catEats({ modifier: 'NEVER', aspect: 'resultative' }))
      .toMatchObject({ it: 'il gatto non ha mai mangiato.' });
  });

  test('a manner adverb DOES follow the participle — which is why the above is a bug', () => {
    expect(catEats({ modifier: 'WELL', aspect: 'resultative' }))
      .toMatchObject({ it: 'il gatto ha mangiato bene.' });
  });
});

// Deliberate: ja.ts maps resultative onto ～てしまう, the completive aspect. It is a defensible
// reading of "resultative", but note it renders NON-PAST ("will end up eating") where the other
// six render a present perfect ("has eaten") — so the same plan means different things.
describe('documented simplifications: aspect', () => {
  test.fails('Japanese resultative renders non-past 〜てしまいます, not a perfect', () => {
    expect(catEats({ aspect: 'resultative' })).toMatchObject({ ja: '猫は食べました。' });
  });
});
