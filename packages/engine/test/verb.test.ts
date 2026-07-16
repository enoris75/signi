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
  test('resultative Portuguese should use the pretérito, not ter + particípio', () => {
    expect(catEats({ aspect: 'resultative' })).toMatchObject({ pt: 'o gato comeu.' });
  });

  // The pretérito mapping generalises across person/number, verb and polarity — the present
  // resultative is the simple past everywhere it surfaces.
  test('the Portuguese present resultative is the pretérito for every subject and verb', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'EAT', { verbPhrase: { aspect: 'resultative' } })).pt)
      .toBe('os gatos comeram.');
    expect(sayAll(clause(np('CAT'), 'SEE', { verbPhrase: { aspect: 'resultative' }, directObject: np('MOUSE') })).pt)
      .toBe('o gato viu o rato.');
    expect(catEats({ aspect: 'resultative', negative: true }).pt).toBe('o gato não comeu.');
  });

  // The bug's "careful": ONLY the present is remapped. The past resultative stays the pluperfect
  // ("tinha comido") and the future resultative the future perfect ("terá comido") — both are
  // genuine Portuguese perfects and must not collapse into a simple tense.
  test('the Portuguese past and future resultatives keep ter + particípio', () => {
    expect(catEats({ aspect: 'resultative', tense: 'past' }).pt).toBe('o gato tinha comido.');
    expect(catEats({ aspect: 'resultative', tense: 'future' }).pt).toBe('o gato terá comido.');
  });

  // Japanese DROPS the negation on the prospective: 食べるところです comes out for both polarities,
  // so "the cat is NOT about to eat" renders as "the cat IS about to eat" — the meaning inverts.
  // The other two aspects negate correctly (食べていません, 食べてしまいません), which is what makes
  // this an oversight rather than a gap in the suffix inventory.
  test('Japanese must not drop the negation on the prospective aspect', () => {
    expect(catEats({ aspect: 'prospective', negative: true }).ja)
      .not.toBe(catEats({ aspect: 'prospective' }).ja);
  });

  // The concrete forms: the negation lands on the copula (です → ではありません), present and past,
  // and the affirmative is left exactly as it was.
  test('Japanese prospective negates on the copula in both tenses', () => {
    expect(catEats({ aspect: 'prospective', negative: true }).ja).toBe('猫は食べるところではありません。');
    expect(catEats({ aspect: 'prospective', tense: 'past', negative: true }).ja)
      .toBe('猫は食べるところではありませんでした。');
    // Regression: the affirmative prospective is unchanged.
    expect(catEats({ aspect: 'prospective' }).ja).toBe('猫は食べるところです。');
    expect(catEats({ aspect: 'prospective', tense: 'past' }).ja).toBe('猫は食べるところでした。');
    // Regression: the neighbouring aspects, which already negated correctly, are unchanged.
    expect(catEats({ aspect: 'progressive', negative: true }).ja).toBe('猫は食べていません。');
    expect(catEats({ aspect: 'resultative', negative: true }).ja).toBe('猫は食べてしまいません。');
  });

  // German used to negate INSIDE the prospective periphrasis rather than outside it:
  //
  //     got   "der Kater ist im Begriff NICHT zu essen."   = is about to NOT eat
  //     want  "der Kater ist NICHT im Begriff zu essen."   = is NOT about to eat
  //
  // The negation belongs on the finite "ist", as it does for the other aspects ("hat nicht
  // gegessen", "isst gerade nicht"). It now precedes the "im Begriff" predicate as a whole.
  test('German negates the prospective auxiliary, not the governed infinitive', () => {
    expect(catEats({ aspect: 'prospective', negative: true }))
      .toMatchObject({ de: 'der Kater ist nicht im Begriff zu essen.' });
  });

  // The same placement holds across tenses: the negation sits on the finite auxiliary (present
  // "ist", past "war", future "wird") in front of "im Begriff", never inside the periphrasis.
  test('German negates the prospective on the finite auxiliary in every tense', () => {
    expect(catEats({ aspect: 'prospective', tense: 'past', negative: true }).de)
      .toBe('der Kater war nicht im Begriff zu essen.');
    expect(catEats({ aspect: 'prospective', tense: 'future', negative: true }).de)
      .toBe('der Kater wird nicht im Begriff sein zu essen.');
  });

  // Regression guard: the OTHER aspects negate exactly where they did — the resultative's "nicht"
  // before the participle, the progressive's after its adverb "gerade" — and the affirmative
  // prospective is unchanged.
  test('German leaves the other aspects\' negation placement untouched', () => {
    expect(catEats({ aspect: 'resultative', negative: true }).de).toBe('der Kater hat nicht gegessen.');
    expect(catEats({ aspect: 'progressive', negative: true }).de).toBe('der Kater isst gerade nicht.');
    expect(catEats({ aspect: 'prospective' }).de).toBe('der Kater ist im Begriff zu essen.');
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

// A feminine subject in the resultative present, across EVERY verb. This is the case that
// exercises the compound past: Romance selects the perfect auxiliary per verb (essere/avere,
// être/avoir), and with the "be" auxiliary the participle AGREES with the subject — so a
// feminine subject is what makes that agreement visible.
//
// Italian is swept in full because it has both halves: the essere/avere split AND participle
// agreement. Every one of these is correct.
const femResult = (verb: string) =>
  sayAll(clause(np('CAT', { gender: 'fem' }), verb, { verbPhrase: { aspect: 'resultative' } }));

describe('feminine subject, resultative present: Italian, every verb', () => {
  const IT: [id: string, it: string][] = [
    ['ADD', 'la gatta ha aggiunto.'], ['APPEAR', 'la gatta è apparsa.'],
    ['BE', 'la gatta è stata.'], ['BEAT', 'la gatta ha battuto.'],
    ['BECOME', 'la gatta è diventata.'], ['BITE', 'la gatta ha morso.'],
    ['BURN', 'la gatta ha bruciato.'], ['BUY', 'la gatta ha comprato.'],
    ['CHOOSE', 'la gatta ha scelto.'], ['CLEAR', 'la gatta ha cancellato.'],
    ['CLICK', 'la gatta ha cliccato.'], ['COLLAPSE', 'la gatta è crollata.'],
    ['COME', 'la gatta è venuta.'], ['COMPACT', 'la gatta ha compattato.'],
    ['COORDINATE', 'la gatta ha coordinato.'], ['CRY', 'la gatta ha pianto.'],
    ['CRY_OUT', 'la gatta ha gridato.'], ['CUT', 'la gatta ha tagliato.'],
    ['DRINK', 'la gatta ha bevuto.'], ['EAT', 'la gatta ha mangiato.'],
    ['EXPAND', 'la gatta ha espanso.'], ['EXPORT', 'la gatta ha esportato.'],
    ['EXTINGUISH', 'la gatta ha spento.'], ['GIVE', 'la gatta ha dato.'],
    ['GO', 'la gatta è andata.'], ['HIDE', 'la gatta ha nascosto.'],
    ['IMPORT', 'la gatta ha importato.'], ['JUMP', 'la gatta ha saltato.'],
    ['KILL', 'la gatta ha ucciso.'], ['KNOW', 'la gatta ha saputo.'],
    ['LOAD', 'la gatta ha caricato.'], ['LOVE', 'la gatta ha amato.'],
    ['MAKE', 'la gatta ha fatto.'], ['READ', 'la gatta ha letto.'],
    ['RUN', 'la gatta ha corso.'], ['SAVE', 'la gatta ha salvato.'],
    ['SEE', 'la gatta ha visto.'], ['SEEM', 'la gatta è sembrata.'],
    ['SELECT', 'la gatta ha selezionato.'], ['SEND', 'la gatta ha mandato.'],
    ['SET_ON_FIRE', 'la gatta ha bruciato.'], ['SHOW', 'la gatta ha mostrato.'],
    ['START', 'la gatta ha iniziato.'], ['TIDY_UP', 'la gatta ha riordinato.'],
    ['TYPE', 'la gatta ha digitato.'],
  ];

  test.each(IT)('%s → %s', (id, expected) => {
    expect(femResult(id).it).toBe(expected);
  });
});

describe('participle agreement: Italian (essere vs avere)', () => {
  test('an essere verb agrees its participle with the feminine subject (-a)', () => {
    // è …a — the participle inflects for the subject's gender.
    expect(femResult('GO').it).toBe('la gatta è andata.'); // andato → andata
    expect(femResult('COME').it).toBe('la gatta è venuta.');
    expect(femResult('BECOME').it).toBe('la gatta è diventata.');
    expect(femResult('APPEAR').it).toBe('la gatta è apparsa.');
  });

  test('an avere verb leaves the participle invariable — a masculine subject is identical', () => {
    const masc = (verb: string) =>
      sayAll(clause(np('CAT'), verb, { verbPhrase: { aspect: 'resultative' } })).it;
    // ha mangiato, not "ha mangiata": avere does not agree with the subject.
    expect(femResult('EAT').it).toBe('la gatta ha mangiato.');
    expect(femResult('EAT').it.replace('la gatta', 'il gatto')).toBe(masc('EAT'));
    expect(femResult('SEE').it).toBe('la gatta ha visto.');
    expect(femResult('SEE').it.replace('la gatta', 'il gatto')).toBe(masc('SEE'));
  });
});

describe('participle agreement: French (être vs avoir)', () => {
  test('an être verb agrees its participle with the feminine subject (-e)', () => {
    expect(femResult('GO').fr).toBe('la chatte est allée.'); // allé → allée
    expect(femResult('COME').fr).toBe('la chatte est venue.');
    expect(femResult('BECOME').fr).toBe('la chatte est devenue.');
    expect(femResult('APPEAR').fr).toBe('la chatte est apparue.');
  });

  test('an avoir verb does not agree with the subject', () => {
    expect(femResult('EAT').fr).toBe('la chatte a mangé.'); // mangé, not mangée
    expect(femResult('SEE').fr).toBe('la chatte a vu.');
  });

  test('the auxiliary is language-specific: BE and SEEM take essere in it but avoir in fr', () => {
    // Italian essere → agreement; French avoir → none. Same verb, opposite auxiliary.
    expect(femResult('BE')).toMatchObject({
      it: 'la gatta è stata.', // essere: agrees
      fr: 'la chatte a été.', // avoir: "être" is conjugated with avoir, no agreement
    });
    expect(femResult('SEEM')).toMatchObject({
      it: 'la gatta è sembrata.',
      fr: 'la chatte a semblé.',
    });
  });
});

describe('the perfect auxiliary: Spanish and German', () => {
  test('Spanish uses haber for every verb, and it never agrees', () => {
    // No ser/estar perfect, no participle agreement — "ha …ido/ado" throughout, motion or not.
    expect(femResult('GO').es).toBe('la gata ha ido.');
    expect(femResult('COME').es).toBe('la gata ha venido.');
    expect(femResult('EAT').es).toBe('la gata ha comido.');
    expect(femResult('APPEAR').es).toBe('la gata ha aparecido.');
  });

  test('German selects sein for motion/change and haben otherwise (no agreement)', () => {
    expect(femResult('GO').de).toBe('die Katze ist gegangen.'); // sein
    expect(femResult('COME').de).toBe('die Katze ist gekommen.');
    expect(femResult('JUMP').de).toBe('die Katze ist gesprungen.'); // motion → sein
    expect(femResult('RUN').de).toBe('die Katze ist gelaufen.');
    expect(femResult('EAT').de).toBe('die Katze hat gegessen.'); // haben
    expect(femResult('SEEM').de).toBe('die Katze hat geschienen.');
  });
});

describe('known bugs: reflexive verbs in the compound tense', () => {
  // A pronominal verb keeps its clitic in the simple present but LOSES it in the compound past:
  //
  //   COLLAPSE fr   present "la chatte s'effondre"   resultative "la chatte est effondrée"
  //   BECOME   es   present "la gata se vuelve"       resultative "la gata ha vuelto"
  //
  // The clitic has to move to before the auxiliary, not vanish: "s'est effondrée", "se ha vuelto".
  // The Spanish case even changes the meaning — "ha vuelto" without the reflexive is "has
  // RETURNED" (volver), not "has become" (volverse). The auxiliary and the agreement are right;
  // only the reflexive pronoun is dropped.
  test.fails('French pronominal verb keeps its clitic: "s\'est effondrée"', () => {
    expect(femResult('COLLAPSE').fr).toBe("la chatte s'est effondrée.");
  });

  test.fails('Spanish pronominal verb keeps its clitic: "se ha vuelto", not "ha vuelto"', () => {
    expect(femResult('BECOME').es).toBe('la gata se ha vuelto.');
  });
});
