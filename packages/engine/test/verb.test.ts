import { describe, expect, test } from 'vitest';
import type { Complement, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

/** "the cat eats", with the verb phrase varied. */
const catEats = (verbPhrase: Partial<VerbPhrase>) =>
  sayAll(clause(np('CAT'), 'EAT', { verbPhrase }));

// Tense, aspect and negation — everything the verb phrase carries.
describe('tense', () => {
  test('present', () => {
    expect(catEats({})).toMatchObject({ en: 'the cat eats.', de: 'der Kater frisst.' });
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
      de: 'der Kater fraß.',
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
      de: 'der Kater wird fressen.',
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
      de: 'der Kater frisst nicht.', // German puts it after the verb
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
      de: 'der Kater frisst gerade.', // German has no progressive; it uses an adverb
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
      de: 'der Kater fraß gerade.',
      ja: '猫は食べていました。',
    });
  });

  test('resultative', () => {
    expect(catEats({ aspect: 'resultative' })).toMatchObject({
      en: 'the cat has eaten.',
      it: 'il gatto ha mangiato.',
      fr: 'le chat a mangé.',
      es: 'el gato ha comido.',
      de: 'der Kater hat gefressen.',
    });
  });

  test('resultative in the past is a pluperfect', () => {
    expect(catEats({ aspect: 'resultative', tense: 'past' })).toMatchObject({
      en: 'the cat had eaten.',
      it: 'il gatto aveva mangiato.',
      fr: 'le chat avait mangé.',
      es: 'el gato había comido.',
      pt: 'o gato tinha comido.',
      de: 'der Kater hatte gefressen.',
    });
  });

  test('prospective', () => {
    expect(catEats({ aspect: 'prospective' })).toEqual({
      en: 'the cat is about to eat.',
      it: 'il gatto sta per mangiare.',
      fr: 'le chat est sur le point de manger.',
      es: 'el gato está a punto de comer.',
      pt: 'o gato está prestes a comer.',
      de: 'der Kater ist im Begriff zu fressen.',
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
      de: 'der Kater wird gerade fressen.',
    });
  });

  test('prospective', () => {
    expect(catEats({ aspect: 'prospective', tense: 'past' })).toMatchObject({
      en: 'the cat was about to eat.',
      it: 'il gatto stava per mangiare.',
      fr: 'le chat était sur le point de manger.',
      de: 'der Kater war im Begriff zu fressen.',
      ja: '猫は食べるところでした。',
    });

    expect(catEats({ aspect: 'prospective', tense: 'future' })).toMatchObject({
      en: 'the cat will be about to eat.',
      it: 'il gatto starà per mangiare.',
      de: 'der Kater wird im Begriff sein zu fressen.',
    });
  });

  test('resultative in the future is a future perfect', () => {
    expect(catEats({ aspect: 'resultative', tense: 'future' })).toMatchObject({
      en: 'the cat will have eaten.',
      it: 'il gatto avrà mangiato.',
      fr: 'le chat aura mangé.',
      es: 'el gato habrá comido.',
      pt: 'o gato terá comido.',
      de: 'der Kater wird gefressen haben.',
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
      de: 'der Kater frisst gerade nicht.',
      ja: '猫は食べていません。',
    });
  });

  test('resultative', () => {
    expect(catEats({ aspect: 'resultative', negative: true })).toMatchObject({
      en: 'the cat has not eaten.',
      it: 'il gatto non ha mangiato.',
      fr: "le chat n'a pas mangé.", // pas sits between auxiliary and participle
      es: 'el gato no ha comido.',
      de: 'der Kater hat nicht gefressen.',
      ja: '猫は食べてしまいません。',
    });
  });

  test('all three at once — aspect, tense and negation', () => {
    expect(catEats({ aspect: 'resultative', tense: 'past', negative: true })).toMatchObject({
      en: 'the cat had not eaten.',
      it: 'il gatto non aveva mangiato.',
      fr: "le chat n'avait pas mangé.",
      de: 'der Kater hatte nicht gefressen.',
      ja: '猫は食べてしまいませんでした。',
    });

    expect(catEats({ aspect: 'progressive', tense: 'future', negative: true })).toMatchObject({
      en: 'the cat will not be eating.',
      it: 'il gatto non starà mangiando.',
      fr: 'le chat ne sera pas en train de manger.',
      de: 'der Kater wird gerade nicht fressen.',
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
      de: 'der Kater fraß nicht.',
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
      de: 'der Kater wird nicht fressen.',
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
      de: 'der Kater frisst nicht immer.',
    });

    expect(catEats({ modifier: 'ALWAYS', negative: true, tense: 'past' })).toMatchObject({
      en: 'the cat did not always eat.',
      it: 'il gatto non mangiò sempre.',
      de: 'der Kater fraß nicht immer.',
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
      de: 'der Kater frisst nie.',
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
      de: 'der Kater frisst nie.',
    });
  });
});

describe('known bugs: aspect', () => {
  // Portuguese "tem comido" is ITERATIVE ("has been eating, repeatedly"), not resultative. The
  // perfect of a bounded event is the pretérito perfeito: "o gato comeu". the Portuguese engine documents its
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
  //     got   "der Kater ist im Begriff NICHT zu fressen."   = is about to NOT eat
  //     want  "der Kater ist NICHT im Begriff zu fressen."   = is NOT about to eat
  //
  // The negation belongs on the finite "ist", as it does for the other aspects ("hat nicht
  // gegessen", "isst gerade nicht"). It now precedes the "im Begriff" predicate as a whole.
  test('German negates the prospective auxiliary, not the governed infinitive', () => {
    expect(catEats({ aspect: 'prospective', negative: true }))
      .toMatchObject({ de: 'der Kater ist nicht im Begriff zu fressen.' });
  });

  // The same placement holds across tenses: the negation sits on the finite auxiliary (present
  // "ist", past "war", future "wird") in front of "im Begriff", never inside the periphrasis.
  test('German negates the prospective on the finite auxiliary in every tense', () => {
    expect(catEats({ aspect: 'prospective', tense: 'past', negative: true }).de)
      .toBe('der Kater war nicht im Begriff zu fressen.');
    expect(catEats({ aspect: 'prospective', tense: 'future', negative: true }).de)
      .toBe('der Kater wird nicht im Begriff sein zu fressen.');
  });

  // Regression guard: the OTHER aspects negate exactly where they did — the resultative's "nicht"
  // before the participle, the progressive's after its adverb "gerade" — and the affirmative
  // prospective is unchanged.
  test('German leaves the other aspects\' negation placement untouched', () => {
    expect(catEats({ aspect: 'resultative', negative: true }).de).toBe('der Kater hat nicht gefressen.');
    expect(catEats({ aspect: 'progressive', negative: true }).de).toBe('der Kater frisst gerade nicht.');
    expect(catEats({ aspect: 'prospective' }).de).toBe('der Kater ist im Begriff zu fressen.');
  });
});

describe('known bugs: adverb placement', () => {
  // Italian puts a FREQUENCY adverb between the auxiliary and the past participle, never after
  // it: "ha SEMPRE mangiato", "non ha MAI mangiato". The engine used to append it to the whole
  // group; it now slots it inside the compound perfect.
  //
  //     was   "il gatto ha mangiato sempre."       now  "il gatto ha sempre mangiato."
  //     was   "il gatto non ha mangiato mai."      now  "il gatto non ha mai mangiato."
  //
  // A MANNER adverb genuinely does follow the participle in Italian ("ha mangiato bene"), and the
  // engine gets that right — so the two classes are told apart, exactly as they are in English
  // (see the frequency-adverb bug in modals.test.ts). French and German both place them properly
  // ("a toujours mangé", "hat immer gegessen").
  test('Italian puts a frequency adverb between auxiliary and participle', () => {
    expect(catEats({ modifier: 'ALWAYS', aspect: 'resultative' }))
      .toMatchObject({ it: 'il gatto ha sempre mangiato.' });
  });

  test('…and likewise the negative concord adverb "mai"', () => {
    expect(catEats({ modifier: 'NEVER', aspect: 'resultative' }))
      .toMatchObject({ it: 'il gatto non ha mai mangiato.' });
  });

  test('a manner adverb DOES follow the participle — which is why the above is a bug', () => {
    expect(catEats({ modifier: 'WELL', aspect: 'resultative' }))
      .toMatchObject({ it: 'il gatto ha mangiato bene.' });
  });

  // The adverb stays between auxiliary and participle when the clause carries a direct object —
  // the object follows the whole verb group ("ha sempre mangiato il topo").
  test('Italian keeps the frequency adverb inside the perfect with a direct object', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modifier: 'ALWAYS', aspect: 'resultative' }, directObject: np('MOUSE'),
    })).it).toBe('il gatto ha sempre mangiato il topo.');
  });

  // …and across the compound tenses: the pluperfect ("aveva sempre mangiato") and future perfect
  // ("avrà sempre mangiato") split the auxiliary and participle the same way.
  test('Italian slots the adverb inside the pluperfect and future perfect too', () => {
    expect(catEats({ modifier: 'ALWAYS', aspect: 'resultative', tense: 'past' }).it)
      .toBe('il gatto aveva sempre mangiato.');
    expect(catEats({ modifier: 'ALWAYS', aspect: 'resultative', tense: 'future' }).it)
      .toBe('il gatto avrà sempre mangiato.');
  });

  // An essere-selecting verb agrees its participle with the subject AND takes the adverb inside:
  // "la gatta è sempre andata" (feminine "andata", "sempre" between "è" and it).
  test('Italian places the adverb inside an essere perfect, participle still agreeing', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'GO', {
      verbPhrase: { modifier: 'ALWAYS', aspect: 'resultative' },
    })).it).toBe('la gatta è sempre andata.');
  });

  // Regression: a MANNER adverb with an object still trails the participle ("ha mangiato bene il
  // topo"), and the frequency adverb keeps its OTHER positions — after the finite verb in a simple
  // tense ("mangia sempre"), after the infinitive in a modal chain ("deve mangiare sempre").
  test('Italian leaves the other adverb positions untouched', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { modifier: 'WELL', aspect: 'resultative' }, directObject: np('MOUSE'),
    })).it).toBe('il gatto ha mangiato bene il topo.');
    expect(catEats({ modifier: 'ALWAYS' }).it).toBe('il gatto mangia sempre.');
    expect(catEats({ modifier: 'ALWAYS', modals: ['MUST'] }).it).toBe('il gatto deve mangiare sempre.');
  });
});

// Deliberate: the Japanese engine maps resultative onto ～てしまう, the completive aspect. It is a defensible
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
    ['ACQUIRE', 'la gatta ha acquisito.'], ['ACT', 'la gatta ha agito.'],
    ['ADD', 'la gatta ha aggiunto.'], ['APPEAR', 'la gatta è apparsa.'],
    ['BE', 'la gatta è stata.'], ['BEAT', 'la gatta ha battuto.'],
    ['BECOME', 'la gatta è diventata.'],
    // The inchoative BEGIN selects essere and agrees; the causative START keeps avere.
    ['BEGIN', 'la gatta è iniziata.'], ['BITE', 'la gatta ha morso.'],
    ['BURN', 'la gatta ha bruciato.'], ['BUY', 'la gatta ha comprato.'],
    ['CANCEL', 'la gatta ha annullato.'],
    // The causative CAUSE_VERB: indurre contracts to the participle indotto, under avere.
    ['CAUSE_VERB', 'la gatta ha indotto.'], ['CHANGE', 'la gatta ha cambiato.'],
    // The inchoative CHANGE_ONESELF selects essere, as BEGIN does.
    ['CHANGE_ONESELF', 'la gatta è cambiata.'],
    ['CHOOSE', 'la gatta ha scelto.'], ['CLEAR', 'la gatta ha cancellato.'],
    ['CLICK', 'la gatta ha cliccato.'], ['CLOSE', 'la gatta ha chiuso.'],
    ['COLLAPSE', 'la gatta è crollata.'],
    ['COME', 'la gatta è venuta.'], ['COMPACT', 'la gatta ha compattato.'],
    ['CONFINE', 'la gatta ha rinchiuso.'],
    ['COORDINATE', 'la gatta ha coordinato.'], ['COPY', 'la gatta ha copiato.'],
    ['CREATE', 'la gatta ha creato.'],
    ['CRY', 'la gatta ha pianto.'],
    ['CRY_OUT', 'la gatta ha gridato.'], ['CUT', 'la gatta ha tagliato.'],
    ['DELETE', 'la gatta ha eliminato.'], ['DESIRE', 'la gatta ha desiderato.'],
    ['DESCRIBE', 'la gatta ha descritto.'], ['DESTROY', 'la gatta ha distrutto.'],
    ['DIVIDE', 'la gatta ha diviso.'], ['DRAG', 'la gatta ha trascinato.'],
    ['DRINK', 'la gatta ha bevuto.'], ['EAT', 'la gatta ha mangiato.'],
    ['EXPAND', 'la gatta ha espanso.'], ['EXPORT', 'la gatta ha esportato.'],
    ['EXPRESS', 'la gatta ha espresso.'],
    ['EXTINGUISH', 'la gatta ha spento.'], ['FEEL', 'la gatta ha provato.'],
    ['FILTER', 'la gatta ha filtrato.'],
    ['GIVE', 'la gatta ha dato.'],
    ['GO', 'la gatta è andata.'], ['HAVE', 'la gatta ha avuto.'],
    ['HIDE', 'la gatta ha nascosto.'], ['HOLD', 'la gatta ha contenuto.'],
    ['IMPORT', 'la gatta ha importato.'], ['INDICATE', 'la gatta ha indicato.'],
    ['JUMP', 'la gatta ha saltato.'],
    ['KILL', 'la gatta ha ucciso.'], ['KNOW', 'la gatta ha saputo.'],
    ['LIVE', 'la gatta ha abitato.'],
    ['LOAD', 'la gatta ha caricato.'], ['LOVE', 'la gatta ha amato.'],
    ['MAKE', 'la gatta ha fatto.'], ['MODIFY', 'la gatta ha modificato.'],
    ['MOVE', 'la gatta ha spostato.'],
    // A pronominal verb takes essere, its clitic ahead of it (C17).
    ['MOVE_ONESELF', 'la gatta si è mossa.'],
    ['NAME', 'la gatta ha nominato.'], ['OWN', 'la gatta ha posseduto.'],
    ['PERCEIVE', 'la gatta ha percepito.'], ['PRESS', 'la gatta ha premuto.'],
    ['PRODUCE', 'la gatta ha prodotto.'],
    ['READ', 'la gatta ha letto.'], ['REMOVE', 'la gatta ha rimosso.'],
    ['REPLACE', 'la gatta ha sostituito.'], ['RESIZE', 'la gatta ha ridimensionato.'],
    ['RETRY', 'la gatta ha riprovato.'],
    ['RUN', 'la gatta ha corso.'], ['SAVE', 'la gatta ha salvato.'],
    ['SEE', 'la gatta ha visto.'], ['SEEM', 'la gatta è sembrata.'],
    ['SELECT', 'la gatta ha selezionato.'], ['SEND', 'la gatta ha mandato.'],
    ['SET_ON_FIRE', 'la gatta ha bruciato.'], ['SHED', 'la gatta ha versato.'],
    ['SHOW', 'la gatta ha mostrato.'], ['START', 'la gatta ha iniziato.'],
    ['STRIKE', 'la gatta ha colpito.'], ['TIDY_UP', 'la gatta ha riordinato.'],
    ['TRADE', 'la gatta ha commerciato.'],
    ['TRANSFER', 'la gatta ha trasferito.'], ['TRANSFORM', 'la gatta ha trasformato.'],
    // -durre keeps its Latin stem in the participle: tradotto, not *tradutto.
    ['TRANSLATE', 'la gatta ha tradotto.'],
    ['TURN_OFF', 'la gatta ha disattivato.'],
    ['TYPE', 'la gatta ha digitato.'],
    ['UNDERSTAND', 'la gatta ha compreso.'], ['USE', 'la gatta ha usato.'],
    ['WRITE', 'la gatta ha scritto.'],
  ];

  test.each(IT)('%s → %s', (id, expected) => {
    expect(femResult(id).it).toBe(expected);
  });
});

// START and BEGIN, the causative/inchoative pair. Six of the seven languages say both halves with
// one labile verb, so the surfaces coincide everywhere except Japanese, which lexicalises them:
// 始める for the causative, 始まる for the inchoative. That is the whole reason BEGIN is a separate
// concept — building "the action starts" on START rendered その動作は始めます, which says the action
// causes something else to begin.
describe('causative / inchoative: START and BEGIN', () => {
  const begins = (extra: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('ACTION'), 'BEGIN', { verbPhrase: extra }));

  test('the inchoative takes 始まる, not 始める', () => {
    expect(begins()).toEqual({
      en: 'the action begins.',
      it: "l'azione inizia.",
      fr: "l'action commence.",
      es: 'la acción empieza.',
      pt: 'a ação começa.',
      de: 'die Handlung beginnt.',
      ja: '動作は始まります。',
    });
  });

  test('the causative keeps 始める', () => {
    expect(sayAll(clause(np('MAN'), 'START', { directObject: np('ACTION') }))).toEqual({
      en: 'the man starts the action.',
      it: "l'uomo inizia l'azione.",
      fr: "l'homme commence l'action.",
      es: 'el hombre empieza la acción.',
      pt: 'o homem começa a ação.',
      de: 'der Mann beginnt die Handlung.',
      ja: '男は動作を始めます。',
    });
  });

  // 始まる is godan where 始める is ichidan, so every derived form differs: masu 始まります,
  // past 始まりました, negative 始まりません, te-form 始まって under the aspects.
  test('past, future and negative', () => {
    expect(begins({ tense: 'past' })).toEqual({
      en: 'the action began.',
      it: "l'azione iniziò.",
      fr: "l'action commença.",
      es: 'la acción empezó.',
      pt: 'a ação começou.',
      de: 'die Handlung begann.',
      ja: '動作は始まりました。',
    });
    // Japanese has no future: the non-past covers it (C04).
    expect(begins({ tense: 'future' })).toMatchObject({
      en: 'the action will begin.',
      it: "l'azione inizierà.",
      de: 'die Handlung wird beginnen.',
      ja: '動作は始まります。',
    });
    expect(begins({ negative: true })).toMatchObject({
      en: 'the action does not begin.',
      fr: "l'action ne commence pas.",
      de: 'die Handlung beginnt nicht.',
      ja: '動作は始まりません。',
    });
  });

  test('the aspects read the te-form 始まって', () => {
    expect(begins({ aspect: 'progressive' })).toMatchObject({
      en: 'the action is beginning.',
      it: "l'azione sta iniziando.",
      ja: '動作は始まっています。',
    });
    // ja maps resultative onto the completive 〜てしまう (B05), so it reads non-past here.
    expect(begins({ aspect: 'resultative' })).toMatchObject({
      en: 'the action has begun.',
      it: "l'azione è iniziata.", // essere + agreement, where START takes avere
      fr: "l'action a commencé.",
      de: 'die Handlung hat begonnen.',
      ja: '動作は始まってしまいます。',
    });
  });

  test('the persons the languages inflect', () => {
    expect(sayAll(clause(np('FIRST_PERSON', { number: 'plural' }), 'BEGIN'))).toEqual({
      en: 'we begin.',
      it: 'iniziamo.', // pro-drop
      fr: 'nous commençons.', // -cer takes the cedilla before o
      es: 'empezamos.',
      pt: 'começamos.',
      de: 'wir beginnen.',
      ja: '私たちは始まります。',
    });
    expect(sayAll(clause(np('SECOND_PERSON'), 'BEGIN'))).toMatchObject({
      en: 'you begin.',
      it: 'inizi.',
      fr: 'tu commences.',
      es: 'empiezas.',
      de: 'du beginnst.',
    });
  });

  // The complement START was seeded to license, read inchoatively.
  test('licenses the instrumental', () => {
    const plan = clause(np('ACTION'), 'BEGIN', {
      complements: { instrumental: { phrase: np('WORD', { definiteness: 'indefinite' }) } },
    });
    expect(sayAll(plan)).toMatchObject({
      en: 'the action begins with a word.',
      it: "l'azione inizia con una parola.",
      de: 'die Handlung beginnt mit einem Wort.',
      ja: '動作は単語で始まります。',
    });
  });
});

// REMOVE and DELETE, the two verbs the canvas and the saved-item lists name their controls with (B20).
// Pinned across the persons, tenses, aspects and commands their languages inflect: Italian rimuovere
// has the irregular rimosse / rimosso, German entfernen takes no ge- (hat entfernt) where löschen does
// (hat gelöscht), and Portuguese excluir keeps its accent (excluímos, excluído → excluiu).
describe('workspace verbs: REMOVE and DELETE', () => {
  const YOU = np('SECOND_PERSON');
  const WE = np('FIRST_PERSON', { number: 'plural' });
  const YOU_ALL = np('SECOND_PERSON', { number: 'plural' });
  const removes = (subject: NounElement, extra: Partial<VerbPhrase> = {}) =>
    sayAll(clause(subject, 'REMOVE', { directObject: np('STICK'), verbPhrase: extra }));
  const deletes = (subject: NounElement, extra: Partial<VerbPhrase> = {}) =>
    sayAll(clause(subject, 'DELETE', { directObject: np('PHRASE'), verbPhrase: extra }));
  const command = (verb: string, object: string, addressee: NounElement, negative = false) =>
    sayAll({ ...clause(addressee, verb, { directObject: np(object), verbPhrase: { negative } }), imperative: true });

  test('REMOVE: present, plural and past', () => {
    expect(removes(np('DOG'))).toEqual({
      en: 'the dog removes the stick.',
      it: 'il cane rimuove il bastone.',
      fr: 'le chien retire le bâton.',
      de: 'der Hund entfernt den Stock.',
      es: 'el perro quita el palo.',
      ja: '犬は棒を取り除きます。',
      pt: 'o cão remove o pau.',
    });
    expect(removes(np('DOG', { number: 'plural' }))).toMatchObject({
      it: 'i cani rimuovono il bastone.',
      fr: 'les chiens retirent le bâton.',
      de: 'die Hunde entfernen den Stock.',
      es: 'los perros quitan el palo.',
      pt: 'os cães removem o pau.',
    });
    expect(removes(np('DOG'), { tense: 'past' })).toEqual({
      en: 'the dog removed the stick.',
      it: 'il cane rimosse il bastone.',
      fr: 'le chien retira le bâton.',
      de: 'der Hund entfernte den Stock.',
      es: 'el perro quitó el palo.',
      ja: '犬は棒を取り除きました。',
      pt: 'o cão removeu o pau.',
    });
  });

  test('REMOVE: future, resultative and progressive', () => {
    expect(removes(np('DOG'), { tense: 'future' })).toMatchObject({
      it: 'il cane rimuoverà il bastone.',
      fr: 'le chien retirera le bâton.',
      de: 'der Hund wird den Stock entfernen.',
      es: 'el perro quitará el palo.',
      pt: 'o cão removerá o pau.',
    });
    expect(removes(np('CAT'), { aspect: 'resultative' })).toEqual({
      en: 'the cat has removed the stick.',
      it: 'il gatto ha rimosso il bastone.',
      fr: 'le chat a retiré le bâton.',
      de: 'der Kater hat den Stock entfernt.',
      es: 'el gato ha quitado el palo.',
      ja: '猫は棒を取り除いてしまいます。',
      pt: 'o gato removeu o pau.', // pt present resultative is the pretérito (documented)
    });
    expect(removes(np('CAT'), { aspect: 'progressive' })).toEqual({
      en: 'the cat is removing the stick.',
      it: 'il gatto sta rimuovendo il bastone.',
      fr: 'le chat est en train de retirer le bâton.',
      de: 'der Kater entfernt gerade den Stock.',
      es: 'el gato está quitando el palo.',
      ja: '猫は棒を取り除いています。',
      pt: 'o gato está removendo o pau.',
    });
  });

  test('REMOVE: commands, and the place it takes a thing from', () => {
    expect(command('REMOVE', 'STICK', YOU)).toEqual({
      en: 'remove the stick.',
      it: 'rimuovi il bastone.',
      fr: 'retire le bâton.',
      de: 'entferne den Stock.',
      es: 'quita el palo.',
      ja: '棒を取り除いてください。',
      pt: 'remova o pau.',
    });
    expect(command('REMOVE', 'STICK', WE)).toMatchObject({
      it: 'rimuoviamo il bastone.',
      de: 'entfernen wir den Stock.',
      es: 'quitemos el palo.',
      pt: 'removamos o pau.',
    });
    expect(sayAll(clause(np('DOG'), 'REMOVE', { directObject: np('STICK'), complements: { source: { phrase: np('HOUSE') } } })))
      .toEqual({
        en: 'the dog removes the stick from the house.',
        it: 'il cane rimuove il bastone dalla casa.',
        fr: 'le chien retire le bâton de la maison.',
        de: 'der Hund entfernt den Stock aus dem Haus.',
        es: 'el perro quita el palo de la casa.',
        ja: '犬は家から棒を取り除きます。',
        pt: 'o cão remove o pau da casa.',
      });
  });

  test('DELETE: present, plural and past', () => {
    expect(deletes(np('DOG'))).toEqual({
      en: 'the dog deletes the phrase.',
      it: 'il cane elimina la frase.',
      fr: 'le chien supprime la phrase.',
      de: 'der Hund löscht die Phrase.',
      es: 'el perro elimina la frase.',
      ja: '犬はフレーズを削除します。',
      pt: 'o cão exclui a frase.',
    });
    expect(deletes(np('DOG', { number: 'plural' }))).toMatchObject({
      it: 'i cani eliminano la frase.',
      fr: 'les chiens suppriment la phrase.',
      de: 'die Hunde löschen die Phrase.',
      es: 'los perros eliminan la frase.',
      pt: 'os cães excluem a frase.',
    });
    expect(deletes(np('DOG'), { tense: 'past' })).toEqual({
      en: 'the dog deleted the phrase.',
      it: 'il cane eliminò la frase.',
      fr: 'le chien supprima la phrase.',
      de: 'der Hund löschte die Phrase.',
      es: 'el perro eliminó la frase.',
      ja: '犬はフレーズを削除しました。',
      pt: 'o cão excluiu a frase.',
    });
  });

  test('DELETE: future, resultative and progressive', () => {
    expect(deletes(np('DOG'), { tense: 'future' })).toMatchObject({
      it: 'il cane eliminerà la frase.',
      fr: 'le chien supprimera la phrase.',
      de: 'der Hund wird die Phrase löschen.',
      es: 'el perro eliminará la frase.',
      pt: 'o cão excluirá a frase.',
    });
    expect(deletes(np('CAT'), { aspect: 'resultative' })).toEqual({
      en: 'the cat has deleted the phrase.',
      it: 'il gatto ha eliminato la frase.',
      fr: 'le chat a supprimé la phrase.',
      de: 'der Kater hat die Phrase gelöscht.',
      es: 'el gato ha eliminado la frase.',
      ja: '猫はフレーズを削除してしまいます。',
      pt: 'o gato excluiu a frase.', // pt present resultative is the pretérito (documented)
    });
    expect(deletes(np('CAT'), { aspect: 'progressive' })).toEqual({
      en: 'the cat is deleting the phrase.',
      it: 'il gatto sta eliminando la frase.',
      fr: 'le chat est en train de supprimer la phrase.',
      de: 'der Kater löscht gerade die Phrase.',
      es: 'el gato está eliminando la frase.',
      ja: '猫はフレーズを削除しています。',
      pt: 'o gato está excluindo a frase.',
    });
  });

  test('DELETE: commands', () => {
    expect(command('DELETE', 'PHRASE', YOU)).toEqual({
      en: 'delete the phrase.',
      it: 'elimina la frase.',
      fr: 'supprime la phrase.',
      de: 'lösche die Phrase.',
      es: 'elimina la frase.',
      ja: 'フレーズを削除してください。',
      pt: 'exclua a frase.',
    });
    expect(command('DELETE', 'PHRASE', YOU_ALL, true)).toEqual({
      en: 'do not delete the phrase.',
      it: 'non eliminate la frase.',
      fr: 'ne supprimez pas la phrase.',
      de: 'löscht die Phrase nicht.',
      es: 'no eliminéis la frase.',
      ja: 'フレーズを削除するな。',
      pt: 'não excluam a frase.',
    });
  });
});

// A150. Japanese says possession by a thing with the existential ある, the possession marked が: a
// place has walls by their being there (壁がある場所), where a person or an animal holds what it has
// (本を持っている). HAVE used to render 持つ for every owner, so "the house has walls" read 家は壁を
// 持っています, "the house is holding walls". The owner keeps the topic は, and takes に where it would
// take が: in an "if" clause and in a relative clause on the thing possessed.
describe('A150: Japanese possession by an inanimate owner is the existential ある', () => {
  const walls = np('WALL', { definiteness: 'bare', number: 'plural' });
  const has = (owner: NounPhrase, extra: Partial<VerbPhrase> = {}) =>
    sayAll(clause(owner, 'HAVE', { directObject: walls, verbPhrase: extra }));

  test('in every tense and polarity, and under a modal', () => {
    expect(has(np('HOUSE'))).toEqual({
      en: 'the house has walls.',
      it: 'la casa ha muri.',
      fr: 'la maison a des murs.',
      de: 'das Haus hat Wände.',
      es: 'la casa tiene paredes.',
      ja: '家は壁があります。',
      pt: 'a casa tem paredes.',
    });
    expect(has(np('HOUSE'), { negative: true, tense: 'past' }).ja).toBe('家は壁がありませんでした。');
    expect(has(np('HOUSE'), { modals: ['MUST'] }).ja).toBe('家は壁がある必要があります。');
    expect(has(np('HOUSE', { definiteness: 'no' })).ja).toBe('どの家も壁がありません。');
  });

  test('the owner takes に in an if clause and in a relative on the thing possessed', () => {
    expect(say({ ...clause(np('CAT'), 'RUN'), condition: clause(np('HOUSE'), 'HAVE', { directObject: walls }) }, 'ja'))
      .toBe('もし家に壁があったら、猫は走ります。');
    expect(say(clause(np('WALL', { number: 'plural', relative: { headRole: 'directObject', subject: np('HOUSE'), verbPhrase: { verb: 'HAVE' } } }), 'COLLAPSE'), 'ja'))
      .toBe('家にある壁は崩れます。');
  });

  test('regression: a person or an animal holds what it has', () => {
    expect(say(clause(np('CAT'), 'HAVE', { directObject: np('BOOK') }), 'ja')).toBe('猫は本を持っています。');
    expect(say(clause(np('FIRST_PERSON'), 'HAVE', { directObject: walls }), 'ja')).toBe('私は壁を持っています。');
  });
});

// The two stative possession verbs (OWN, HOLD): pin their transitive paradigm — present and the
// simple past — across every language, so a refactor can't silently break their conjugation.
describe('possession verbs: OWN and HOLD', () => {
  const owns = (extra: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('CAT'), 'OWN', { directObject: np('MOUSE'), verbPhrase: extra }));
  const holds = (extra: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('CAT'), 'HOLD', { directObject: np('MOUSE'), verbPhrase: extra }));

  test('OWN in the present', () => {
    expect(owns()).toEqual({
      en: 'the cat owns the mouse.',
      it: 'il gatto possiede il topo.',
      fr: 'le chat possède la souris.',
      es: 'el gato posee el ratón.',
      pt: 'o gato possui o rato.',
      de: 'der Kater besitzt die Maus.',
      ja: '猫はネズミを所有しています。',
    });
  });

  test('OWN in the past', () => {
    expect(owns({ tense: 'past' })).toEqual({
      en: 'the cat owned the mouse.',
      it: 'il gatto possedeva il topo.',
      fr: 'le chat possédait la souris.',
      es: 'el gato poseía el ratón.',
      pt: 'o gato possuía o rato.',
      de: 'der Kater besaß die Maus.',
      ja: '猫はネズミを所有していました。',
    });
  });

  test('HOLD in the present', () => {
    expect(holds()).toEqual({
      en: 'the cat holds the mouse.',
      it: 'il gatto contiene il topo.',
      fr: 'le chat contient la souris.',
      es: 'el gato contiene el ratón.',
      pt: 'o gato contém o rato.',
      de: 'der Kater enthält die Maus.',
      ja: '猫はネズミを保持しています。',
    });
  });

  test('HOLD in the past', () => {
    expect(holds({ tense: 'past' })).toEqual({
      en: 'the cat held the mouse.',
      it: 'il gatto conteneva il topo.',
      fr: 'le chat contenait la souris.',
      es: 'el gato contenía el ratón.',
      pt: 'o gato continha o rato.',
      de: 'der Kater enthielt die Maus.',
      ja: '猫はネズミを保持していました。',
    });
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
    expect(femResult('EAT').de).toBe('die Katze hat gefressen.'); // haben
    expect(femResult('SEEM').de).toBe('die Katze hat geschienen.');
  });
});

describe('known bugs: reflexive verbs in the compound tense', () => {
  // A pronominal verb keeps its clitic in the simple present and now also in the compound past,
  // where it used to LOSE it:
  //
  //   COLLAPSE fr   present "la chatte s'effondre"   resultative "la chatte s'est effondrée"
  //   BECOME   es   present "la gata se vuelve"       resultative "la gata se ha vuelto"
  //
  // The clitic moves to before the auxiliary, agreeing with the subject, rather than vanishing.
  // The Spanish case even changes the meaning — "ha vuelto" without the reflexive is "has
  // RETURNED" (volver), not "has become" (volverse). The auxiliary and the agreement were already
  // right; only the reflexive pronoun was dropped.
  test('French pronominal verb keeps its clitic: "s\'est effondrée"', () => {
    expect(femResult('COLLAPSE').fr).toBe("la chatte s'est effondrée.");
  });

  test('Spanish pronominal verb keeps its clitic: "se ha vuelto", not "ha vuelto"', () => {
    expect(femResult('BECOME').es).toBe('la gata se ha vuelto.');
  });

  const result = (subject: NounPhrase, verb: string, extra: Partial<VerbPhrase> = {}) =>
    sayAll(clause(subject, verb, { verbPhrase: { aspect: 'resultative', ...extra } }));

  // A masculine subject drops the French participle -e but keeps the clitic; Spanish never agrees.
  test('the clitic survives with a masculine subject', () => {
    expect(result(np('CAT'), 'COLLAPSE').fr).toBe("le chat s'est effondré.");
    expect(result(np('CAT'), 'BECOME').es).toBe('el gato se ha vuelto.');
  });

  // Plural subjects: the clitic is "se"/"se" (3pl), the auxiliary agrees, and the French participle
  // takes -s / -es for gender.
  test('the clitic survives with plural subjects, participle agreeing in French', () => {
    expect(result(np('CAT', { number: 'plural' }), 'COLLAPSE').fr).toBe('les chats se sont effondrés.');
    expect(result(np('CAT', { gender: 'fem', number: 'plural' }), 'COLLAPSE').fr)
      .toBe('les chattes se sont effondrées.');
    expect(result(np('CAT', { number: 'plural' }), 'BECOME').es).toBe('los gatos se han vuelto.');
  });

  // French negation brackets the clitic + auxiliary: "ne s'est pas effondrée".
  test('French negation wraps the reflexive auxiliary correctly', () => {
    expect(result(np('CAT', { gender: 'fem' }), 'COLLAPSE', { negative: true }).fr)
      .toBe("la chatte ne s'est pas effondrée.");
  });

  // Regression: the simple present already carried the clitic (it rides inside the finite form) and
  // is unchanged; a NON-reflexive verb's compound is untouched ("est allée", "ha ido").
  test('the present is unchanged and a non-reflexive compound is untouched', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'COLLAPSE')).fr).toBe("la chatte s'effondre.");
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'BECOME')).es).toBe('la gata se vuelve.');
    expect(femResult('GO').fr).toBe('la chatte est allée.');
    expect(femResult('GO').es).toBe('la gata ha ido.');
  });
});

// A137. A hypothetical derives its conditional from the stored 1sg future and its imperfect (fr) or
// imperfect subjunctive (pt) from a stored present or past form. A pronominal verb carries its clitic
// inside those forms, so the clitic of that person comes along for every subject: fr "nous effondrons"
// → "le chat nous effondrait", "m'effondrerai" → "le chat m'effondrerait"; pt "me tornarei" → "o gato
// me tornaria", "se tornaram" → "(eu) se tornasse". Spanish strips and re-adds its clitic, and is right.
describe('known bugs: pronominal verb in a hypothetical', () => {
  const hypothetical = (main: PhrasePlan, condition: PhrasePlan) => sayAll({ ...main, condition });
  const HAPPY = { complements: { predicative: { phrase: np('HAPPY') } } };

  test('French: the clitic agrees with the subject in the imparfait and the conditionnel', () => {
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('CAT'), 'COLLAPSE')).fr)
      .toBe("si le chat s'effondrait, le chien courrait.");
    expect(hypothetical(clause(np('CAT'), 'COLLAPSE'), clause(np('DOG'), 'RUN')).fr)
      .toBe("si le chien courait, le chat s'effondrerait.");
  });

  test('Portuguese: the clitic agrees with the subject in both clauses', () => {
    expect(hypothetical(clause(np('CAT'), 'BECOME', HAPPY), clause(np('DOG'), 'RUN')).pt)
      .toBe('se o cão corresse, o gato se tornaria feliz.');
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('FIRST_PERSON'), 'BECOME', HAPPY)).pt)
      .toBe('se me tornasse feliz, o cão correria.');
  });

  test('French: every person takes its own clitic, inside the negation', () => {
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('FIRST_PERSON'), 'COLLAPSE')).fr)
      .toBe("si je m'effondrais, le chien courrait.");
    expect(hypothetical(clause(np('FIRST_PERSON', { number: 'plural' }), 'COLLAPSE'), clause(np('DOG'), 'RUN')).fr)
      .toBe('si le chien courait, nous nous effondrerions.');
    expect(hypothetical(clause(np('SECOND_PERSON', { number: 'plural' }), 'COLLAPSE'), clause(np('SECOND_PERSON'), 'COLLAPSE')).fr)
      .toBe("si tu t'effondrais, vous vous effondreriez.");
    expect(hypothetical(clause(np('CAT', { number: 'plural' }), 'COLLAPSE', { verbPhrase: { negative: true } }), clause(np('DOG'), 'RUN')).fr)
      .toBe("si le chien courait, les chats ne s'effondreraient pas.");
  });

  test('Portuguese: every person takes its own clitic, after the negation', () => {
    expect(hypothetical(clause(np('FIRST_PERSON', { number: 'plural' }), 'BECOME', HAPPY), clause(np('CAT', { number: 'plural' }), 'BECOME', HAPPY)).pt)
      .toBe('se os gatos se tornassem felizes, nos tornaríamos felizes.');
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('CAT'), 'BECOME', { ...HAPPY, verbPhrase: { negative: true } })).pt)
      .toBe('se o gato não se tornasse feliz, o cão correria.');
  });

  // Regression guard: the compound past and a modal already placed their own clitic, and the indicative
  // tenses keep the stored forms.
  test('the compound past, a modal and the indicative are unchanged', () => {
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('CAT', { gender: 'fem' }), 'COLLAPSE', { verbPhrase: { aspect: 'resultative' } })).fr)
      .toBe("si la chatte s'était effondrée, le chien courrait.");
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('CAT'), 'COLLAPSE', { verbPhrase: { modals: [{ verb: 'MUST' }] } })).fr)
      .toBe("si le chat devait s'effondrer, le chien courrait.");
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('CAT'), 'BECOME', { ...HAPPY, verbPhrase: { modals: [{ verb: 'MUST' }] } })).pt)
      .toBe('se o gato devesse tornar-se feliz, o cão correria.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'COLLAPSE', { verbPhrase: { tense: 'future' } })).fr).toBe("je m'effondrerai.");
    expect(sayAll(clause(np('CAT'), 'BECOME', { ...HAPPY, verbPhrase: { tense: 'past' } })).pt).toBe('o gato se tornou feliz.');
  });

  // Regression guard: Spanish already re-adds the agreeing clitic.
  test('Spanish is already right', () => {
    expect(hypothetical(clause(np('CAT'), 'BECOME', HAPPY), clause(np('DOG'), 'RUN')).es)
      .toBe('si el perro corriera, el gato se volvería feliz.');
    expect(hypothetical(clause(np('DOG'), 'RUN'), clause(np('FIRST_PERSON'), 'BECOME', HAPPY)).es)
      .toBe('si me volviera feliz, el perro correría.');
  });
});

// A52. The prospective's "im Begriff … zu" frame is assembled as fixed pieces around the objects, so
// the zu-infinitive group is split. Once a direct object, the future, a modal or a verb-final
// clause is involved, the object or the finite verb lands inside the frame. The zu-infinitive group
// ("die Maus zu essen") belongs together, extraposed after a comma because it depends on the noun
// "Begriff". A verb-final clause puts the finite verb after the whole group.
describe('known bugs: German prospective word order', () => {
  const catEatsMouse = (verbPhrase: Partial<VerbPhrase>) =>
    sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', ...verbPhrase }, directObject: np('MOUSE') })).de;

  test('German keeps the zu-infinitive group together, after "im Begriff sein"', () => {
    expect(catEatsMouse({})).toBe('der Kater ist im Begriff, die Maus zu fressen.');
    expect(catEatsMouse({ tense: 'future' })).toBe('der Kater wird im Begriff sein, die Maus zu fressen.');
    expect(catEatsMouse({ modals: [{ verb: 'MUST' }] })).toBe('der Kater muss im Begriff sein, die Maus zu fressen.');
  });

  test('German closes a verb-final prospective on the finite verb', () => {
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective', tense: 'future' } },
    }), 'RUN')).de).toBe('der Hund, der im Begriff zu fressen sein wird, läuft.');
    expect(sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' } }),
    }).de).toBe('wenn der Kater im Begriff zu fressen sein würde, würde der Hund laufen.');
  });

  test('German gathers the adverb, the recipient and the complements into the group', () => {
    expect(catEatsMouse({ tense: 'past' })).toBe('der Kater war im Begriff, die Maus zu fressen.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modifier: 'FAST' } })).de)
      .toBe('der Kater ist im Begriff, schnell zu fressen.');
    expect(sayAll(clause(np('MAN'), 'GIVE', {
      verbPhrase: { aspect: 'prospective' }, directObject: np('BOOK'), complements: { terminus: { phrase: np('BOY') } },
    })).de).toBe('der Mann ist im Begriff, dem Jungen das Buch zu geben.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, complements: { locative: { phrase: np('MARKET') } } })).de)
      .toBe('der Kater ist im Begriff, im Markt zu fressen.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE', { relative: { verbPhrase: { verb: 'RUN' } } }) })).de)
      .toBe('der Kater ist im Begriff, die Maus, die läuft, zu fressen.');
  });

  test('German keeps "nicht" and a modal\'s adverb ahead of "im Begriff", outside the group', () => {
    expect(catEatsMouse({ negative: true })).toBe('der Kater ist nicht im Begriff, die Maus zu fressen.');
    expect(catEatsMouse({ modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] })).toBe('der Kater muss immer im Begriff sein, die Maus zu fressen.');
    expect(catEatsMouse({ tense: 'future', modals: [{ verb: 'MUST' }] })).toBe('der Kater wird im Begriff sein müssen, die Maus zu fressen.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', negative: true, modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] } })).de)
      .toBe('der Kater muss nicht immer im Begriff sein zu fressen.');
  });

  test('German extraposes a longer group after a verb-final clause\'s finite verb', () => {
    const dogWho = (verbPhrase: Partial<VerbPhrase>, extra: object = {}) =>
      sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective', ...verbPhrase }, ...extra } }), 'RUN')).de;
    expect(dogWho({}, { directObject: np('MOUSE') })).toBe('der Hund, der im Begriff ist, die Maus zu fressen, läuft.');
    expect(dogWho({ tense: 'future' }, { directObject: np('MOUSE') })).toBe('der Hund, der im Begriff sein wird, die Maus zu fressen, läuft.');
    expect(dogWho({ modifier: 'FAST' })).toBe('der Hund, der im Begriff ist, schnell zu fressen, läuft.');
    expect(sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE') }),
    }).de).toBe('wenn der Kater im Begriff sein würde, die Maus zu fressen, würde der Hund laufen.');
    // A bare zu-infinitive under a modal stays inside the bracket.
    expect(dogWho({ modals: [{ verb: 'MUST' }] })).toBe('der Hund, der im Begriff zu fressen sein muss, läuft.');
  });

  test('German puts a bare zu-infinitive after "sein" in a V2 clause, with no comma', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modals: [{ verb: 'MUST' }] } })).de)
      .toBe('der Kater muss im Begriff sein zu fressen.');
    expect(sayAll({
      ...clause(np('DOG'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE') }),
      condition: clause(np('CAT'), 'RUN'),
    }).de).toBe('wenn der Kater laufen würde, würde der Hund im Begriff sein, die Maus zu fressen.');
  });

  test('German follows the group with an "indem" clause or a coordinated clause', () => {
    const instrumental: Complement = {
      phrase: np('WORD', { definiteness: 'indefinite' }), specifiers: [{ kind: 'abstraction', value: 'process' }], action: { verb: 'CHOOSE' },
    };
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, complements: { instrumental } })).de)
      .toBe('der Kater ist im Begriff zu fressen, indem man ein Wort wählt.');
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective' }, directObject: np('MOUSE'), complements: { instrumental } },
    }), 'RUN')).de).toBe('der Hund, der im Begriff ist, die Maus zu fressen, indem man ein Wort wählt, läuft.');
    expect(sayAll({
      ...clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE') }),
      coordination: { conjunction: 'and', clause: clause(np('DOG'), 'RUN') },
    }).de).toBe('der Kater ist im Begriff, die Maus zu fressen, und der Hund läuft.');
  });
});

// A146. The main verb's adverb joins the prospective's zu-infinitive group, which is right for a
// manner adverb ("im Begriff, schnell zu essen") but scopes a frequency adverb under "im Begriff".
// With "nie" that inverts the meaning the way "nicht" did before A19: "war im Begriff, nie diesen
// Engel zu lieben" is "was about to never love". The other six give it the whole prospective.
describe('known bugs: German frequency adverb in the prospective', () => {
  const manLovesAngel = (verbPhrase: Partial<VerbPhrase>) => say(clause(np('MAN', { definiteness: 'that' }), 'LOVE', {
    verbPhrase: { aspect: 'prospective', tense: 'past', ...verbPhrase }, directObject: np('ANGEL', { definiteness: 'this' }),
  }), 'de');

  test('German puts "nie" and "immer" ahead of "im Begriff"', () => {
    expect(manLovesAngel({ modifier: 'NEVER' })).toBe('jener Mann war nie im Begriff, diesen Engel zu lieben.');
    expect(manLovesAngel({ modifier: 'ALWAYS' })).toBe('jener Mann war immer im Begriff, diesen Engel zu lieben.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modifier: 'ALWAYS' } }), 'de'))
      .toBe('der Kater ist immer im Begriff zu fressen.');
  });

  test('…and in a verb-final relative clause', () => {
    expect(say(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective', modifier: 'NEVER' }, directObject: np('MOUSE') },
    }), 'RUN'), 'de')).toBe('der Hund, der nie im Begriff ist, die Maus zu fressen, läuft.');
  });

  // The generalisation: the slot ahead of "im Begriff" is the one "nicht" already used, so the two
  // stack in that order; a manner adverb keeps its place inside the group, which is where a
  // frequency adverb under a modal stays too (out of scope, see the bug file).
  test('"nicht" leads a positive frequency adverb, and a manner adverb stays in the group', () => {
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modifier: 'ALWAYS', negative: true } }), 'de'))
      .toBe('der Kater ist nicht immer im Begriff zu fressen.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modifier: 'FAST' } }), 'de'))
      .toBe('der Kater ist im Begriff, schnell zu fressen.');
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modifier: 'ALWAYS', modals: ['MUST'] } }), 'de'))
      .toBe('der Kater muss im Begriff sein, immer zu fressen.');
  });

  test('regression: the other six give the frequency adverb the whole prospective', () => {
    expect(sayAll(clause(np('MAN', { definiteness: 'that' }), 'LOVE', {
      verbPhrase: { aspect: 'prospective', tense: 'past', modifier: 'NEVER' }, directObject: np('ANGEL', { definiteness: 'this' }),
    }))).toMatchObject({
      en: 'that man was never about to love this angel.',
      fr: "cet homme n'était jamais sur le point d'aimer cet ange.",
      ja: 'その男はこの天使を決して愛するところではありませんでした。',
    });
  });
});

// A147. Italian, Spanish and Portuguese append a frequency adverb after the whole periphrasis
// ("stava per amare mai", "está a punto de comer siempre"), where it scopes over the infinitive.
// French slots it right after the finite verb ("était toujours sur le point de", "n'est jamais en
// train de"), as Italian already does for the compound perfect (A28).
describe('known bugs: Romance frequency adverb after the prospective infinitive', () => {
  const catEatsMouse = (verbPhrase: Partial<VerbPhrase>) =>
    sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', ...verbPhrase }, directObject: np('MOUSE') }));

  test('Italian puts "mai" and "sempre" right after "stare"', () => {
    expect(say(clause(np('MAN', { definiteness: 'that' }), 'LOVE', {
      verbPhrase: { aspect: 'prospective', tense: 'past', modifier: 'NEVER' }, directObject: np('ANGEL', { definiteness: 'this' }),
    }), 'it')).toBe("quell'uomo non stava mai per amare quest'angelo.");
    expect(catEatsMouse({ modifier: 'ALWAYS' }).it).toBe('il gatto sta sempre per mangiare il topo.');
  });

  test('…and in the progressive', () => {
    expect(catEats({ aspect: 'progressive', modifier: 'ALWAYS' }).it).toBe('il gatto sta sempre mangiando.');
    expect(catEats({ aspect: 'progressive', modifier: 'NEVER' }).it).toBe('il gatto non sta mai mangiando.');
  });

  test('Spanish and Portuguese put "siempre" / "sempre" right after "estar"', () => {
    expect(catEatsMouse({ modifier: 'ALWAYS' })).toMatchObject({
      es: 'el gato está siempre a punto de comer el ratón.',
      pt: 'o gato está sempre prestes a comer o rato.',
    });
  });

  // The generalisation: the slot is behind the finite verb of the periphrasis, so it follows the
  // tense and the negation, and it reaches a relative clause through the same `predicateText`.
  test('…in every tense, under a negation, and in a relative clause', () => {
    expect(catEatsMouse({ modifier: 'ALWAYS', tense: 'past' })).toMatchObject({
      it: 'il gatto stava sempre per mangiare il topo.',
      es: 'el gato estaba siempre a punto de comer el ratón.',
      pt: 'o gato estava sempre prestes a comer o rato.',
    });
    expect(catEatsMouse({ modifier: 'ALWAYS', tense: 'future' })).toMatchObject({
      it: 'il gatto starà sempre per mangiare il topo.',
      es: 'el gato estará siempre a punto de comer el ratón.',
    });
    expect(catEatsMouse({ modifier: 'ALWAYS', negative: true })).toMatchObject({
      it: 'il gatto non sta sempre per mangiare il topo.',
      es: 'el gato no está siempre a punto de comer el ratón.',
      pt: 'o gato não está sempre prestes a comer o rato.',
    });
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective', modifier: 'ALWAYS' }, directObject: np('MOUSE') },
    }), 'RUN'))).toMatchObject({
      it: 'il cane che sta sempre per mangiare il topo corre.',
      es: 'el perro que está siempre a punto de comer el ratón corre.',
      pt: 'o cão que está sempre prestes a comer o rato corre.',
    });
  });

  test('regression: the modal chain, the compound perfect and the Iberian progressive are unchanged', () => {
    // A28's guard: under a modal the adverb still trails the group.
    expect(catEatsMouse({ modifier: 'ALWAYS', modals: ['MUST'] })).toMatchObject({
      it: 'il gatto deve stare per mangiare sempre il topo.',
      es: 'el gato debe estar a punto de comer siempre el ratón.',
      pt: 'o gato deve estar prestes a comer sempre o rato.',
    });
    expect(catEats({ aspect: 'resultative', modifier: 'ALWAYS' })).toMatchObject({
      it: 'il gatto ha sempre mangiato.',
    });
    // Spanish and Portuguese leave their progressive alone: both orders are idiomatic there.
    expect(sayAll(clause(np('CAT'), 'EAT', {
      verbPhrase: { aspect: 'progressive', modifier: 'ALWAYS' }, directObject: np('MOUSE'),
    }))).toMatchObject({
      es: 'el gato está comiendo siempre el ratón.',
      pt: 'o gato está comendo sempre o rato.',
    });
  });

  test('regression: French, a fronted "nunca" and a manner adverb are already right', () => {
    expect(catEatsMouse({ modifier: 'ALWAYS' }).fr).toBe('le chat est toujours sur le point de manger la souris.');
    expect(catEatsMouse({ modifier: 'NEVER' })).toMatchObject({
      es: 'el gato nunca está a punto de comer el ratón.',
      pt: 'o gato nunca está prestes a comer o rato.',
    });
    expect(catEatsMouse({ modifier: 'WELL' }).it).toBe('il gatto sta per mangiare bene il topo.');
  });
});

// A73. With a plural noun object, Italian "si" is the passive si and the verb agrees with the
// object ("si mangiano i topi"); the singular is colloquial. `predicateText` and `relativeText`
// conjugate against GENERIC_PERSON (3sg), so the verb never agrees with its plural patient.
describe('known bugs: Italian impersonal si with a plural object', () => {
  test('Italian agrees the verb with the plural object of the impersonal si', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('MOUSE', { number: 'plural' }) }), 'it')).toBe('si mangiano i topi.');
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('MOUSE', { number: 'plural' }), verbPhrase: { tense: 'past' } }), 'it')).toBe('si mangiarono i topi.');
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('MOUSE', { number: 'plural' }), verbPhrase: { modals: [{ verb: 'MUST' }] } }), 'it')).toBe('si devono mangiare i topi.');
    expect(say(clause(np('MOUSE', {
      number: 'plural',
      relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT' } },
    }), 'RUN'), 'it')).toBe('i topi che si mangiano corrono.');
  });
});

// A73 (Spanish). With a plural noun object the impersonal "se" is the passive "se", and the verb
// agrees with the object ("se comen los ratones"). The engine conjugates against GENERIC_PERSON
// (3sg), so the verb stays singular.
describe('known bugs: Spanish impersonal se with a plural object', () => {
  test('Spanish agrees the verb with the plural object of the impersonal se', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('MOUSE', { number: 'plural' }) }), 'es')).toBe('se comen los ratones.');
  });
});

describe('passive si / se: the verb agrees with a plural patient', () => {
  const oneEats = (directObject: NounElement, verbPhrase: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('GENERIC_PERSON'), 'EAT', { directObject, verbPhrase }));
  const mice = np('MOUSE', { number: 'plural' });

  test('in every simple tense, the progressive and prospective, negated and in a condition', () => {
    expect(oneEats(mice, { aspect: 'progressive' })).toMatchObject({ it: 'si stanno mangiando i topi.', es: 'se están comiendo los ratones.' });
    expect(oneEats(mice, { aspect: 'prospective' })).toMatchObject({ it: 'si stanno per mangiare i topi.', es: 'se están a punto de comer los ratones.' });
    expect(oneEats(mice, { tense: 'future' })).toMatchObject({ it: 'si mangeranno i topi.', es: 'se comerán los ratones.' });
    expect(oneEats(mice, { negative: true })).toMatchObject({ it: 'non si mangiano i topi.', es: 'no se comen los ratones.' });
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('GENERIC_PERSON'), 'EAT', { directObject: mice }) })).toMatchObject({
      it: 'se si mangiassero i topi, il cane correrebbe.',
      es: 'si se comieran los ratones, el perro correría.',
    });
  });

  test('Spanish agrees the compound tense too, and a quantified or coordinated patient counts as plural', () => {
    expect(oneEats(mice, { aspect: 'resultative' }).es).toBe('se han comido los ratones.');
    expect(oneEats(np('MOUSE', { definiteness: 'some' }))).toMatchObject({ it: 'si mangiano alcuni topi.', es: 'se comen algunos ratones.' });
    expect(oneEats({ conjuncts: [np('MOUSE'), np('FOOD')], conjunction: 'and' })).toMatchObject({
      it: 'si mangiano il topo e il cibo.',
      es: 'se comen el ratón y la comida.',
    });
  });

  test('a plural head gapped as the object agrees the relative\'s verb', () => {
    expect(sayAll(clause(np('MOUSE', { number: 'plural', relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT' } } }), 'RUN')).es)
      .toBe('los ratones que se comen corren.');
    expect(sayAll(clause(np('MOUSE', { number: 'plural', relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT', modals: [{ verb: 'MUST' }] } } }), 'RUN')).it)
      .toBe('i topi che si devono mangiare corrono.');
  });

  test('regression: a singular or clitic object and no object keep the singular', () => {
    expect(oneEats(np('MOUSE'))).toMatchObject({ it: 'si mangia il topo.', es: 'se come el ratón.' });
    expect(oneEats(np('THIRD_PERSON', { number: 'plural' })).es).toBe('se los come.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'EAT'))).toMatchObject({ it: 'si mangia.', es: 'se come.' });
    expect(sayAll(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT' } } }), 'RUN')).it)
      .toBe('il topo che si mangia corre.');
  });

  // A83 gave si its essere, so the passive si's compound tense agrees the auxiliary and the participle.
  test('Italian agrees the passive si\'s compound tense with its patient', () => {
    expect(oneEats(mice, { aspect: 'resultative' }).it).toBe('si sono mangiati i topi.');
    expect(oneEats(np('HOUSE', { number: 'plural' }), { aspect: 'resultative', tense: 'past' }).it).toBe('si erano mangiate le case.');
  });
});

// A77. The imperative, conditional and infinitive branches of English `predicateParts` put a
// frequency adverb in front of the whole verb text, auxiliary and negator included: "always do not
// eat", "always let's eat", "always would run", "always not to eat". The adverb belongs after
// "do not" / "let's (not)" / "would (not)" and after "not", as "does not always eat" already does.
describe('known bugs: English frequency adverb before a mood auxiliary', () => {
  test('English puts ALWAYS/NEVER after "do not", "let\'s", "would" and "not"', () => {
    expect(say({ ...clause(np('SECOND_PERSON'), 'EAT', { verbPhrase: { modifier: 'ALWAYS', negative: true } }), imperative: true }, 'en')).toBe('do not always eat.');
    expect(say({ ...clause(np('FIRST_PERSON', { number: 'plural' }), 'EAT', { verbPhrase: { modifier: 'ALWAYS' } }), imperative: true }, 'en')).toBe("let's always eat.");
    expect(say({ ...clause(np('FIRST_PERSON', { number: 'plural' }), 'EAT', { verbPhrase: { modifier: 'ALWAYS', negative: true } }), imperative: true }, 'en')).toBe("let's not always eat.");
    expect(say({ ...clause(np('DOG'), 'RUN', { verbPhrase: { modifier: 'ALWAYS' } }), condition: clause(np('CAT'), 'EAT') }, 'en')).toBe('if the cat ate, the dog would always run.');
    expect(say({ ...clause(np('DOG'), 'RUN', { verbPhrase: { modifier: 'NEVER' } }), condition: clause(np('CAT'), 'EAT') }, 'en')).toBe('if the cat ate, the dog would never run.');
    expect(say({ ...clause(np('DOG'), 'RUN', { verbPhrase: { modifier: 'ALWAYS', negative: true } }), condition: clause(np('CAT'), 'EAT') }, 'en')).toBe('if the cat ate, the dog would not always run.');
    expect(say({ ...clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { modifier: 'ALWAYS', negative: true } }), infinitive: true }, 'en')).toBe('not always to eat.');
  });

  test('English keeps the adverb after the auxiliary in the instruction, the progressive conditional and under a modal', () => {
    expect(say({ ...clause(np('SECOND_PERSON'), 'EAT', { verbPhrase: { modifier: 'ALWAYS', negative: true } }), imperative: true, imperativeRegister: 'instruction' }, 'en')).toBe('do not always eat.');
    expect(say({ ...clause(np('FIRST_PERSON', { number: 'plural' }), 'EAT', { verbPhrase: { modifier: 'NEVER' } }), imperative: true }, 'en')).toBe("let's never eat.");
    expect(say({ ...clause(np('DOG'), 'RUN', { verbPhrase: { modifier: 'ALWAYS', aspect: 'progressive' } }), condition: clause(np('CAT'), 'EAT') }, 'en')).toBe('if the cat ate, the dog would always be running.');
    expect(say({ ...clause(np('DOG'), 'RUN', { verbPhrase: { negative: true, modals: [{ verb: 'CAN', modifier: 'ALWAYS' }] } }), condition: clause(np('CAT'), 'EAT') }, 'en'))
      .toBe('if the cat ate, the dog would not always be able to run.');
  });

  test('regression: a bare command and the affirmative infinitive keep the adverb first, a manner adverb trails', () => {
    expect(say({ ...clause(np('SECOND_PERSON'), 'EAT', { verbPhrase: { modifier: 'ALWAYS' } }), imperative: true }, 'en')).toBe('always eat.');
    expect(say({ ...clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { modifier: 'ALWAYS' } }), infinitive: true }, 'en')).toBe('always to eat.');
    expect(say({ ...clause(np('SECOND_PERSON'), 'EAT', { verbPhrase: { modifier: 'FAST', negative: true } }), imperative: true }, 'en')).toBe('do not eat fast.');
  });
});

// A83. The Italian impersonal "si" takes "essere" in the compound tenses whatever the verb's own
// auxiliary ("si è mangiato", "si è corso"). `aspectVerb` picks the auxiliary from the verb's
// lexical `aux` alone, so an "avere" verb renders "si ha mangiato".
describe('known bugs: Italian impersonal si in the compound tense', () => {
  test('Italian takes essere with the impersonal si', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('si è mangiato.');
    expect(say(clause(np('GENERIC_PERSON'), 'RUN', { verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('si è corso.');
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { aspect: 'resultative' }, directObject: np('MOUSE') }), 'it')).toBe('si è mangiato il topo.');
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { aspect: 'resultative', tense: 'past' } }), 'it')).toBe('si era mangiato.');
  });

  test('Italian keeps essere under si when negated, with a clitic, an adverb and in a condition', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { aspect: 'resultative', negative: true } }), 'it')).toBe('non si è mangiato.');
    // An avere participle agrees with a preceding clitic, not with si.
    expect(say(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('THIRD_PERSON', { number: 'plural' }), verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('li si è mangiati.');
    expect(say(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('THIRD_PERSON'), verbPhrase: { aspect: 'resultative', modifier: 'ALWAYS' } }), 'it')).toBe('lo si è sempre visto.');
    expect(say({ ...clause(np('DOG'), 'RUN'), condition: clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase: { aspect: 'resultative' } }) }, 'it'))
      .toBe('se si fosse mangiato, il cane correrebbe.');
  });

  test('regression: a noun subject keeps its lexical auxiliary', () => {
    expect(say(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('il gatto ha mangiato.');
    expect(say(clause(np('WOMAN'), 'GO', { verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('la donna è andata.');
  });
});

// A96. A reflexive infinitive agrees its clitic with the subject ("je dois m'effondrer") and
// keeps it in the infinitive perfect ("doit s'être effondré"). `aspectVerbFr` and
// `verbGroupInfinitiveFr` use the citation "s'effondrer" for every person, and the modal
// resultative "être + participle" never restores the clitic.
describe('known bugs: French reflexive infinitive', () => {
  test('French agrees the reflexive clitic on the infinitive and keeps it in the perfect', () => {
    const collapse = (subject: string, verbPhrase: NonNullable<Parameters<typeof clause>[2]>['verbPhrase'], number?: 'plural') =>
      sayAll(clause(np(subject, number ? { number } : {}), 'COLLAPSE', { verbPhrase })).fr;
    expect(collapse('FIRST_PERSON', { modals: ['MUST'] })).toBe("je dois m'effondrer.");
    expect(collapse('SECOND_PERSON', { modals: ['MUST'] })).toBe("tu dois t'effondrer.");
    expect(collapse('FIRST_PERSON', { aspect: 'progressive' })).toBe("je suis en train de m'effondrer.");
    expect(collapse('FIRST_PERSON', { aspect: 'prospective' }, 'plural')).toBe('nous sommes sur le point de nous effondrer.');
    expect(collapse('CAT', { modals: ['MUST'], aspect: 'resultative' })).toBe("le chat doit s'être effondré.");
  });

  test('French agrees the clitic in every person of the modal perfect, a stacked modal, a negation and a modal progressive', () => {
    const collapse = (subject: string, verbPhrase: NonNullable<Parameters<typeof clause>[2]>['verbPhrase'], extra: NonNullable<Parameters<typeof np>[1]> = {}) =>
      sayAll(clause(np(subject, extra), 'COLLAPSE', { verbPhrase })).fr;
    expect(collapse('SECOND_PERSON', { modals: ['MUST'] }, { number: 'plural' })).toBe('vous devez vous effondrer.');
    expect(collapse('FIRST_PERSON', { modals: ['MUST'], aspect: 'resultative' })).toBe("je dois m'être effondré.");
    expect(collapse('FIRST_PERSON', { modals: ['MUST'], aspect: 'resultative' }, { number: 'plural' })).toBe('nous devons nous être effondrés.');
    expect(collapse('CAT', { modals: ['MUST'], aspect: 'resultative' }, { gender: 'fem' })).toBe("la chatte doit s'être effondrée.");
    expect(collapse('FIRST_PERSON', { modals: ['WILL', 'CAN'] })).toBe("je veux pouvoir m'effondrer.");
    expect(collapse('FIRST_PERSON', { modals: ['MUST'], negative: true })).toBe("je ne dois pas m'effondrer.");
    expect(collapse('FIRST_PERSON', { modals: ['MUST'], aspect: 'progressive' })).toBe("je dois être en train de m'effondrer.");
  });

  test('regression: the third person, the finite forms, the citation infinitive and a plain verb are unchanged', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'COLLAPSE', { verbPhrase: { modals: ['MUST'] } })).fr).toBe("on doit s'effondrer.");
    expect(sayAll(clause(np('FIRST_PERSON'), 'COLLAPSE')).fr).toBe("je m'effondre.");
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'COLLAPSE', { verbPhrase: { aspect: 'resultative' } })).fr).toBe("la chatte s'est effondrée.");
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'COLLAPSE'), infinitive: true }).fr).toBe("s'effondrer.");
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT', { verbPhrase: { modals: ['MUST'], aspect: 'resultative' } })).fr).toBe('je dois avoir mangé.');
  });
});

// A102. A reflexive verb's non-finite forms come straight from the lexicon: `volverse`, `volviéndose`,
// `vuelto`. `verbGroupInfinitive` (under a modal) and `aspectVerb` (progressive / prospective)
// never add a clitic that agrees with the subject. So the 3rd-person "se" is stuck on every
// person, and under a modal the resultative loses it altogether ("haber vuelto" = "have returned").
describe('known bugs: Spanish reflexive verb in a non-finite verb group', () => {
  test('Spanish keeps the reflexive clitic, agreeing, on "haber", the infinitive and the gerund', () => {
    const legend = { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } };
    expect(sayAll(clause(np('CAT'), 'BECOME', { verbPhrase: { modals: [{ verb: 'MUST' }], aspect: 'resultative' }, complements: legend })).es)
      .toBe('el gato debe haberse vuelto una leyenda.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'BECOME', { verbPhrase: { modals: [{ verb: 'MUST' }] }, complements: legend })).es)
      .toBe('debo volverme una leyenda.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'BECOME', { verbPhrase: { aspect: 'prospective' }, complements: legend })).es)
      .toBe('estoy a punto de volverme una leyenda.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'BECOME', { verbPhrase: { aspect: 'progressive' }, complements: legend })).es)
      .toBe('estoy volviéndome una leyenda.');
  });

  test('Spanish agrees the clitic under stacked modals, a negation, a modal progressive, a relative and a condition', () => {
    const legend = { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } };
    const become = (subject: ReturnType<typeof np>, verbPhrase: NonNullable<Parameters<typeof clause>[2]>['verbPhrase']) =>
      sayAll(clause(subject, 'BECOME', { verbPhrase, complements: legend })).es;
    expect(become(np('FIRST_PERSON'), { modals: ['WILL', 'CAN'] })).toBe('quiero poder volverme una leyenda.');
    expect(become(np('SECOND_PERSON', { number: 'plural' }), { modals: ['MUST'] })).toBe('debéis volveros una leyenda.');
    expect(become(np('FIRST_PERSON', { number: 'plural' }), { modals: ['MUST'], aspect: 'resultative' })).toBe('debemos habernos vuelto una leyenda.');
    expect(become(np('FIRST_PERSON'), { modals: ['MUST'], aspect: 'progressive' })).toBe('debo estar volviéndome una leyenda.');
    expect(become(np('FIRST_PERSON'), { modals: ['MUST'], negative: true })).toBe('no debo volverme una leyenda.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'BECOME', modals: ['MUST'], aspect: 'resultative' }, complements: legend } }), 'RUN')).es)
      .toBe('el perro que debe haberse vuelto una leyenda corre.');
    expect(sayAll({ ...clause(np('FIRST_PERSON'), 'BECOME', { verbPhrase: { modals: ['MUST'] }, complements: legend }), condition: clause(np('DOG'), 'EAT') }).es)
      .toBe('si el perro comiera, debería volverme una leyenda.');
  });

  test('regression: the 3rd person, the finite perfect, the citation infinitive and a plain verb are unchanged', () => {
    const legend = { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } };
    expect(sayAll(clause(np('CAT'), 'BECOME', { verbPhrase: { modals: ['MUST'] }, complements: legend })).es).toBe('el gato debe volverse una leyenda.');
    expect(sayAll(clause(np('CAT'), 'BECOME', { verbPhrase: { aspect: 'progressive' }, complements: legend })).es).toBe('el gato está volviéndose una leyenda.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'BECOME', { verbPhrase: { aspect: 'resultative' }, complements: legend })).es).toBe('me he vuelto una leyenda.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'BECOME', { complements: legend }), infinitive: true }).es).toBe('volverse una leyenda.');
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT', { verbPhrase: { modals: ['MUST'], aspect: 'resultative' } })).es).toBe('debo haber comido.');
  });
});

// A130. Romance renders every simple past as the perfective (C06), a state verb too: "the cat
// wanted to eat" is "il gatto volle mangiare", "le chat voulut manger", "el gato quiso comer". The
// perfective of a state is an event: volle / quiso read "insisted on", non volle "refused", poté
// "managed to", ebbe / tuvo "got", fu nella casa is ill-formed. A state in the past is imperfective:
// voleva, poteva, doveva, aveva, possedeva, era — as the progressive's own stava / estaba already are.
describe('known bugs: Romance past of a state verb', () => {
  const romance = (plan: Parameters<typeof sayAll>[0]) => {
    const { it, fr, es, pt } = sayAll(plan);
    return { it, fr, es, pt };
  };
  const catModalPast = (modal: string, extra: Partial<VerbPhrase> = {}, subject = np('CAT')) =>
    romance(clause(subject, 'EAT', { verbPhrase: { tense: 'past', modals: [modal], ...extra } }));
  const catWasPast = (complements: Parameters<typeof clause>[2]) =>
    romance(clause(np('CAT'), 'BE', { verbPhrase: { tense: 'past' }, ...complements }));

  test('the modals, HAVE, OWN and BE take the imperfect in the past', () => {
    expect(romance(clause(np('FOX', { possessor: np('BOY') }), 'JUMP', {
      verbPhrase: { tense: 'past', modals: ['WILL'] },
      complements: { route: { phrase: np('DOG'), specifiers: [{ kind: 'path', value: 'over' }] } },
    }))).toEqual({
      it: 'la volpe del ragazzo voleva saltare sopra il cane.',
      fr: 'le renard du garçon voulait sauter par-dessus le chien.',
      es: 'el zorro del niño quería saltar por encima del perro.',
      pt: 'a raposa do menino queria pular por cima do cão.',
    });
    expect(catModalPast('WILL')).toEqual({
      it: 'il gatto voleva mangiare.', fr: 'le chat voulait manger.', es: 'el gato quería comer.', pt: 'o gato queria comer.',
    });
    expect(catModalPast('WILL', { negative: true })).toEqual({
      it: 'il gatto non voleva mangiare.', fr: 'le chat ne voulait pas manger.', es: 'el gato no quería comer.', pt: 'o gato não queria comer.',
    });
    expect(catModalPast('WILL', {}, np('CAT', { number: 'plural' }))).toEqual({
      it: 'i gatti volevano mangiare.', fr: 'les chats voulaient manger.', es: 'los gatos querían comer.', pt: 'os gatos queriam comer.',
    });
    expect(catModalPast('CAN')).toEqual({
      it: 'il gatto poteva mangiare.', fr: 'le chat pouvait manger.', es: 'el gato podía comer.', pt: 'o gato podia comer.',
    });
    expect(catModalPast('MUST')).toEqual({
      it: 'il gatto doveva mangiare.', fr: 'le chat devait manger.', es: 'el gato debía comer.', pt: 'o gato devia comer.',
    });
    expect(romance(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'past', modals: ['WILL'] } } }), 'RUN'))).toEqual({
      it: 'il gatto che voleva mangiare corre.', fr: 'le chat qui voulait manger court.', es: 'el gato que quería comer corre.', pt: 'o gato que queria comer corre.',
    });
    expect(romance(clause(np('CAT'), 'HAVE', { verbPhrase: { tense: 'past' }, directObject: np('BOOK') }))).toEqual({
      it: 'il gatto aveva il libro.', fr: 'le chat avait le livre.', es: 'el gato tenía el libro.', pt: 'o gato tinha o livro.',
    });
    expect(romance(clause(np('CAT'), 'OWN', { verbPhrase: { tense: 'past' }, directObject: np('MOUSE') }))).toEqual({
      it: 'il gatto possedeva il topo.', fr: 'le chat possédait la souris.', es: 'el gato poseía el ratón.', pt: 'o gato possuía o rato.',
    });
    expect(catWasPast({ complements: { predicative: { phrase: np('HAPPY') } } })).toEqual({
      it: 'il gatto era felice.', fr: 'le chat était heureux.', es: 'el gato estaba feliz.', pt: 'o gato estava feliz.',
    });
    expect(catWasPast({ complements: { locative: { phrase: np('HOUSE') } } })).toEqual({
      it: 'il gatto era nella casa.', fr: 'le chat était dans la maison.', es: 'el gato estaba en la casa.', pt: 'o gato estava na casa.',
    });
  });

  // LOVE, SEEM and KNOW without an object are states too; every person takes the imperfect, and so does
  // the relative's finite verb. A plural predicate noun and the negation ride along.
  test('the other states, every person, the relative and a negated copula take the imperfect too', () => {
    expect(romance(clause(np('CAT'), 'LOVE', { verbPhrase: { tense: 'past' }, directObject: np('DOG') }))).toEqual({
      it: 'il gatto amava il cane.', fr: 'le chat aimait le chien.', es: 'el gato amaba el perro.', pt: 'o gato amava o cão.',
    });
    expect(romance(clause(np('CAT'), 'SEEM', { verbPhrase: { tense: 'past' }, complements: { predicative: { phrase: np('TIRED') } } }))).toEqual({
      it: 'il gatto sembrava stanco.', fr: 'le chat semblait fatigué.', es: 'el gato parecía cansado.', pt: 'o gato parecia cansado.',
    });
    expect(romance(clause(np('CAT'), 'KNOW', { verbPhrase: { tense: 'past' } }))).toEqual({
      it: 'il gatto sapeva.', fr: 'le chat savait.', es: 'el gato sabía.', pt: 'o gato sabia.',
    });
    const hadTheBook = (subject: NounPhrase) => romance(clause(subject, 'HAVE', { verbPhrase: { tense: 'past' }, directObject: np('BOOK') }));
    expect(hadTheBook(np('FIRST_PERSON'))).toEqual({ it: 'avevo il libro.', fr: "j'avais le livre.", es: 'tenía el libro.', pt: 'tinha o livro.' });
    expect(hadTheBook(np('FIRST_PERSON', { number: 'plural' }))).toEqual({
      it: 'avevamo il libro.', fr: 'nous avions le livre.', es: 'teníamos el libro.', pt: 'tínhamos o livro.',
    });
    expect(romance(clause(np('FIRST_PERSON', { number: 'plural' }), 'OWN', { verbPhrase: { tense: 'past' }, directObject: np('BOOK') }))).toEqual({
      it: 'possedevamo il libro.', fr: 'nous possédions le livre.', es: 'poseíamos el libro.', pt: 'possuíamos o livro.',
    });
    expect(catModalPast('CAN', {}, np('SECOND_PERSON', { number: 'plural' }))).toEqual({
      it: 'potevate mangiare.', fr: 'vous pouviez manger.', es: 'podíais comer.', pt: 'podiam comer.',
    });
    expect(romance(clause(np('CAT', { relative: { verbPhrase: { verb: 'HAVE', tense: 'past' }, directObject: np('BOOK') } }), 'RUN'))).toEqual({
      it: 'il gatto che aveva il libro corre.', fr: 'le chat qui avait le livre court.', es: 'el gato que tenía el libro corre.', pt: 'o gato que tinha o livro corre.',
    });
    expect(romance(clause(np('CAT', { number: 'plural' }), 'BE', {
      verbPhrase: { tense: 'past', negative: true },
      complements: { predicative: { phrase: np('LEGEND', { number: 'plural', definiteness: 'indefinite' }) } },
    }))).toEqual({
      it: 'i gatti non erano leggende.', fr: "les chats n'étaient pas des légendes.", es: 'los gatos no eran leyendas.', pt: 'os gatos não eram lendas.',
    });
  });

  // The imperfect is the finite verb's alone: the resultative keeps its auxiliary, a hypothetical its mood,
  // and the aspect a modal governs its own group.
  test('regression: the resultative, the hypothetical moods and the aspect under a modal keep their forms', () => {
    expect(romance(clause(np('CAT'), 'HAVE', { verbPhrase: { aspect: 'resultative' }, directObject: np('BOOK') }))).toEqual({
      it: 'il gatto ha avuto il libro.', fr: 'le chat a eu le livre.', es: 'el gato ha tenido el libro.', pt: 'o gato teve o livro.',
    });
    expect(romance(clause(np('CAT'), 'HAVE', { verbPhrase: { tense: 'past', aspect: 'resultative' }, directObject: np('BOOK') }))).toEqual({
      it: 'il gatto aveva avuto il libro.', fr: 'le chat avait eu le livre.', es: 'el gato había tenido el libro.', pt: 'o gato tinha tido o livro.',
    });
    expect(romance({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'HAVE', { verbPhrase: { tense: 'past' }, directObject: np('BOOK') }) })).toEqual({
      it: 'se il gatto avesse il libro, il cane correrebbe.',
      fr: 'si le chat avait le livre, le chien courrait.',
      es: 'si el gato tuviera el libro, el perro correría.',
      pt: 'se o gato tivesse o livro, o cão correria.',
    });
    expect(catModalPast('MUST', { aspect: 'progressive' })).toEqual({
      it: 'il gatto doveva stare mangiando.', fr: 'le chat devait être en train de manger.', es: 'el gato debía estar comiendo.', pt: 'o gato devia estar comendo.',
    });
  });

  test('regression: an event verb keeps the perfective, and the progressive keeps its imperfect', () => {
    expect(romance(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'past' } }))).toEqual({
      it: 'il gatto mangiò.', fr: 'le chat mangea.', es: 'el gato comió.', pt: 'o gato comeu.',
    });
    // UNDERSTAND is an achievement, not a state: "capì / comprese" is the event of grasping it.
    expect(romance(clause(np('CAT'), 'UNDERSTAND', { verbPhrase: { tense: 'past' }, directObject: np('BOOK') }))).toEqual({
      it: 'il gatto comprese il libro.', fr: 'le chat comprit le livre.', es: 'el gato comprendió el libro.', pt: 'o gato compreendeu o livro.',
    });
    expect(catEats({ tense: 'past', aspect: 'progressive' })).toMatchObject({
      it: 'il gatto stava mangiando.', es: 'el gato estaba comiendo.', pt: 'o gato estava comendo.',
    });
  });
});

// A131. KNOW has one verb per language, the knowing-a-fact one: sapere / savoir / saber / wissen. A
// noun object wants the knowing-by-acquaintance verb — conoscere / connaître / conocer / conhecer /
// kennen — so "the cat knows the boy" is "il gatto sa il ragazzo", "der Kater weiß den Jungen" and
// "the cat knows me" is "il gatto mi sa". English "know" and Japanese 知る cover both.
describe('known bugs: KNOW with a noun object', () => {
  const knows = (object: NounPhrase, verbPhrase: Partial<VerbPhrase> = {}, subject = np('CAT')) => {
    const { it, fr, es, pt, de } = sayAll(clause(subject, 'KNOW', { verbPhrase, directObject: object }));
    return { it, fr, es, pt, de };
  };

  test('a noun object takes conoscere / connaître / conocer / conhecer / kennen', () => {
    expect(knows(np('BOY'))).toEqual({
      it: 'il gatto conosce il ragazzo.', fr: 'le chat connaît le garçon.', es: 'el gato conoce al niño.', pt: 'o gato conhece o menino.', de: 'der Kater kennt den Jungen.',
    });
    expect(knows(np('HOUSE'))).toEqual({
      it: 'il gatto conosce la casa.', fr: 'le chat connaît la maison.', es: 'el gato conoce la casa.', pt: 'o gato conhece a casa.', de: 'der Kater kennt das Haus.',
    });
    expect(knows(np('CONCEPT'))).toEqual({
      it: 'il gatto conosce il concetto.', fr: 'le chat connaît le concept.', es: 'el gato conoce el concepto.', pt: 'o gato conhece o conceito.', de: 'der Kater kennt den Begriff.',
    });
    expect(knows(np('FIRST_PERSON'))).toEqual({
      it: 'il gatto mi conosce.', fr: 'le chat me connaît.', es: 'el gato me conoce.', pt: 'o gato me conhece.', de: 'der Kater kennt mich.',
    });
    expect(knows(np('HOUSE'), {}, np('CAT', { number: 'plural' }))).toEqual({
      it: 'i gatti conoscono la casa.', fr: 'les chats connaissent la maison.', es: 'los gatos conocen la casa.', pt: 'os gatos conhecem a casa.', de: 'die Kater kennen das Haus.',
    });
    expect(knows(np('BOY'), { negative: true })).toEqual({
      it: 'il gatto non conosce il ragazzo.', fr: 'le chat ne connaît pas le garçon.', es: 'el gato no conoce al niño.', pt: 'o gato não conhece o menino.', de: 'der Kater kennt den Jungen nicht.',
    });
    expect(knows(np('HOUSE'), { tense: 'future' })).toEqual({
      it: 'il gatto conoscerà la casa.', fr: 'le chat connaîtra la maison.', es: 'el gato conocerá la casa.', pt: 'o gato conhecerá a casa.', de: 'der Kater wird das Haus kennen.',
    });
    expect(knows(np('HOUSE'), { modals: ['MUST'] })).toEqual({
      it: 'il gatto deve conoscere la casa.', fr: 'le chat doit connaître la maison.', es: 'el gato debe conocer la casa.', pt: 'o gato deve conhecer a casa.', de: 'der Kater muss das Haus kennen.',
    });
    const { it, fr, es, pt, de } = sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'KNOW' }, directObject: np('BOY') } }), 'RUN'));
    expect({ it, fr, es, pt, de }).toEqual({
      it: 'il gatto che conosce il ragazzo corre.', fr: 'le chat qui connaît le garçon court.', es: 'el gato que conoce al niño corre.', pt: 'o gato que conhece o menino corre.', de: 'der Kater, der den Jungen kennt, läuft.',
    });
  });

  // The acquaintance verb is a verb like any other: its past is a state's imperfect (A130) and its resultative
  // "met", it commands and cites, and it takes a head gapped as its object, a coordinated object and the protasis.
  test('the acquaintance verb in the past, the resultative, a command, the citation, a relative on its object and the protasis', () => {
    expect(knows(np('HOUSE'), { tense: 'past' })).toEqual({
      it: 'il gatto conosceva la casa.', fr: 'le chat connaissait la maison.', es: 'el gato conocía la casa.', pt: 'o gato conhecia a casa.', de: 'der Kater kannte das Haus.',
    });
    expect(knows(np('HOUSE'), { aspect: 'resultative' })).toEqual({
      it: 'il gatto ha conosciuto la casa.', fr: 'le chat a connu la maison.', es: 'el gato ha conocido la casa.', pt: 'o gato conheceu a casa.', de: 'der Kater hat das Haus gekannt.',
    });
    const command = (verbPhrase: Partial<VerbPhrase> = {}) => {
      const { it, fr, es, pt, de } = sayAll({ ...clause(np('SECOND_PERSON'), 'KNOW', { verbPhrase, directObject: np('HOUSE') }), imperative: true });
      return { it, fr, es, pt, de };
    };
    expect(command()).toEqual({ it: 'conosci la casa.', fr: 'connais la maison.', es: 'conoce la casa.', pt: 'conheça a casa.', de: 'kenn das Haus.' });
    expect(command({ negative: true })).toEqual({
      it: 'non conoscere la casa.', fr: 'ne connais pas la maison.', es: 'no conozcas la casa.', pt: 'não conheça a casa.', de: 'kenn das Haus nicht.',
    });
    const { it, fr, es, pt, de } = sayAll({ ...clause(np('CAT'), 'KNOW', { directObject: np('HOUSE') }), infinitive: true });
    expect({ it, fr, es, pt, de }).toEqual({ it: 'conoscere la casa.', fr: 'connaître la maison.', es: 'conocer la casa.', pt: 'conhecer a casa.', de: 'das Haus kennen.' });
    const theBoyTheCatKnows = sayAll(clause(np('BOY', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'KNOW' } } }), 'RUN'));
    expect(theBoyTheCatKnows).toMatchObject({
      it: 'il ragazzo che il gatto conosce corre.', fr: 'le garçon que le chat connaît court.', es: 'el niño que el gato conoce corre.',
      pt: 'o menino que o gato conhece corre.', de: 'der Junge, den der Kater kennt, läuft.',
    });
    expect(sayAll(clause(np('CAT'), 'KNOW', { directObject: { conjuncts: [np('HOUSE'), np('BOOK')], conjunction: 'and' } }))).toMatchObject({
      it: 'il gatto conosce la casa e il libro.', de: 'der Kater kennt das Haus und das Buch.',
    });
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'KNOW', { directObject: np('HOUSE') }) })).toMatchObject({
      it: 'se il gatto conoscesse la casa, il cane correrebbe.',
      fr: 'si le chat connaissait la maison, le chien courrait.',
      es: 'si el gato conociera la casa, el perro correría.',
      pt: 'se o gato conhecesse a casa, o cão correria.',
      de: 'wenn der Kater das Haus kennen würde, würde der Hund laufen.',
    });
  });

  test('regression: KNOW with no object keeps sapere / savoir / saber / wissen, and English and Japanese are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'KNOW'))).toMatchObject({
      it: 'il gatto sa.', fr: 'le chat sait.', es: 'el gato sabe.', pt: 'o gato sabe.', de: 'der Kater weiß.',
    });
    expect(sayAll(clause(np('CAT'), 'KNOW', { verbPhrase: { negative: true } }))).toMatchObject({
      it: 'il gatto non sa.', fr: 'le chat ne sait pas.', de: 'der Kater weiß nicht.',
    });
    expect(sayAll(clause(np('CAT'), 'KNOW', { directObject: np('BOY') }))).toMatchObject({
      en: 'the cat knows the boy.', ja: '猫は男の子を知っています。',
    });
    // A complement is no object: KNOW with only a cause keeps the fact verb.
    expect(sayAll(clause(np('CAT'), 'KNOW', { complements: { cause: { phrase: np('DOG') } } }))).toMatchObject({
      it: 'il gatto sa a causa del cane.', fr: 'le chat sait à cause du chien.', de: 'der Kater weiß wegen dem Hund.',
    });
  });
});

// A132. A Japanese state verb renders as an event. 持つ, 所有する, 愛する and 保持する take the plain
// 〜ます / 〜ました, which read as the change: 猫は本を持ちます "the cat will pick up the book",
// 持ちました "picked it up". A state is the resultant 〜ている: 持っています, 持っていました,
// 持っていませんでした. KNOW gets 知っています only because its `masu_present` stores it, and then
// its negative follows that form (知っていません) where 知る's negative is the plain 知りません.
describe('known bugs: Japanese state verb in the main clause', () => {
  const ja = (verb: string, verbPhrase: Partial<VerbPhrase> = {}, object = 'BOOK') =>
    say(clause(np('CAT'), verb, { verbPhrase, directObject: np(object) }), 'ja');

  test('HAVE, OWN, LOVE and HOLD take 〜ている, and KNOW negates as 知りません', () => {
    expect(ja('HAVE')).toBe('猫は本を持っています。');
    expect(ja('HAVE', { tense: 'past' })).toBe('猫は本を持っていました。');
    expect(ja('HAVE', { negative: true })).toBe('猫は本を持っていません。');
    expect(ja('HAVE', { tense: 'past', negative: true })).toBe('猫は本を持っていませんでした。');
    expect(ja('OWN')).toBe('猫は本を所有しています。');
    expect(ja('OWN', { tense: 'past' })).toBe('猫は本を所有していました。');
    expect(ja('LOVE', {}, 'DOG')).toBe('猫は犬を愛しています。');
    expect(ja('LOVE', { tense: 'past' }, 'DOG')).toBe('猫は犬を愛していました。');
    expect(ja('HOLD')).toBe('猫は本を保持しています。');
    expect(ja('HOLD', { tense: 'past' })).toBe('猫は本を保持していました。');
    expect(ja('KNOW', { negative: true })).toBe('猫は本を知りません。');
    expect(ja('KNOW', { tense: 'past', negative: true })).toBe('猫は本を知りませんでした。');
    // The たら protasis: 持ったら is "if the cat picked up the book".
    const ifTheCat = (verb: string) => say({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), verb, { directObject: np('BOOK') }) }, 'ja');
    expect(ifTheCat('HAVE')).toMatch(/^もし猫が本を持っていたら、/);
    expect(ifTheCat('KNOW')).toMatch(/^もし猫が本を知っていたら、/);
  });

  // Every tense and polarity of the other states, the conditional apodosis, the negative protasis, and KNOW
  // with no object.
  test('the states take 〜ている in every tense, polarity and clause the main clause path renders', () => {
    expect(ja('LOVE', { tense: 'past', negative: true }, 'DOG')).toBe('猫は犬を愛していませんでした。');
    expect(ja('HOLD', { tense: 'future' })).toBe('猫は本を保持しています。');
    expect(ja('OWN', { negative: true })).toBe('猫は本を所有していません。');
    expect(say({ ...clause(np('CAT'), 'HAVE', { directObject: np('BOOK') }), condition: clause(np('DOG'), 'RUN') }, 'ja'))
      .toBe('もし犬が走ったら、猫は本を持っています。');
    const ifTheCatDoesNot = (verb: string) =>
      say({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), verb, { verbPhrase: { negative: true }, directObject: np('BOOK') }) }, 'ja');
    expect(ifTheCatDoesNot('OWN')).toBe('もし猫が本を所有していなかったら、犬は走ります。');
    expect(ifTheCatDoesNot('KNOW')).toBe('もし猫が本を知らなかったら、犬は走ります。');
    expect(say(clause(np('CAT'), 'KNOW', { verbPhrase: { tense: 'past', negative: true } }), 'ja')).toBe('猫は知りませんでした。');
  });

  // A relative clause and a command keep the plain form, the resultative stays B05's 〜てしまう, 思える is a
  // Japanese state verb that needs no 〜ている, and KNOW's instruction label is its stem.
  test('regression: the relative, the command, the resultative, SEEM and the instruction label keep their forms', () => {
    const relative = (tense: 'present' | 'past') =>
      say(clause(np('CAT', { relative: { verbPhrase: { verb: 'HAVE', tense }, directObject: np('BOOK') } }), 'RUN'), 'ja');
    expect(relative('present')).toBe('本を持つ猫は走ります。');
    expect(relative('past')).toBe('本を持った猫は走ります。');
    expect(say({ ...clause(np('SECOND_PERSON'), 'HAVE', { directObject: np('BOOK') }), imperative: true }, 'ja')).toBe('本を持ってください。');
    expect(ja('HAVE', { aspect: 'resultative' })).toBe('猫は本を持ってしまいます。');
    expect(say(clause(np('CAT'), 'SEEM', { verbPhrase: { tense: 'past', negative: true }, complements: { predicative: { phrase: np('HAPPY') } } }), 'ja'))
      .toBe('猫は幸せに思えませんでした。');
    expect(say({ ...clause(np('SECOND_PERSON'), 'KNOW', { directObject: np('BOOK') }), imperative: true, imperativeRegister: 'instruction' }, 'ja'))
      .toBe('本を知り。');
  });

  test('regression: an event verb, KNOW, the progressive and a modal keep their forms', () => {
    expect(ja('EAT', { tense: 'past' }, 'FOOD')).toBe('猫は食べ物を食べました。');
    expect(ja('SEE')).toBe('猫は本を見ます。');
    expect(ja('KNOW')).toBe('猫は本を知っています。');
    expect(ja('KNOW', { tense: 'past' })).toBe('猫は本を知っていました。');
    expect(ja('HAVE', { aspect: 'progressive' })).toBe('猫は本を持っています。');
    expect(ja('HAVE', { modals: ['MUST'] })).toBe('猫は本を持つ必要があります。');
    expect(ja('HAVE', { modals: ['WILL'] })).toBe('猫は本を持ちたいです。');
    expect(say({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT', { directObject: np('FOOD') }) }, 'ja')).toMatch(/^もし猫が食べ物を食べたら、/);
  });
});

// A138. German ADD is "addieren", which adds numbers up ("zwei Zahlen addieren"). Putting a thing with
// others is "hinzufügen", a separable verb: the particle goes to the end of a main clause ("fügt … hinzu")
// and stays on the verb in the infinitive the instruction register cites ("eine Bedingung hinzufügen").
// The engine has no separable verbs yet, so this is a corpus change and an engine one. The German
// imperative row for ADD in imperative.test.ts ("addiere") moves with it.
describe('known bugs: German ADD is the arithmetic verb', () => {
  test('German adds a thing with hinzufügen, its particle at the end of the clause', () => {
    expect(say(clause(np('CAT'), 'ADD', { directObject: np('MOUSE', { definiteness: 'indefinite' }) }), 'de'))
      .toBe('der Kater fügt eine Maus hinzu.');
    expect(say(clause(np('CAT'), 'ADD', {
      directObject: np('MOUSE', { definiteness: 'indefinite' }),
      verbPhrase: { tense: 'past' },
    }), 'de')).toBe('der Kater fügte eine Maus hinzu.');
  });

  test('a German instruction cites hinzufügen whole', () => {
    expect(say({
      subject: { concept: 'SECOND_PERSON', definiteness: 'bare' },
      verbPhrase: { verb: 'ADD' },
      imperative: true,
      imperativeRegister: 'instruction',
      directObject: np('CONDITION', { definiteness: 'indefinite' }),
    }, 'de')).toBe('eine Bedingung hinzufügen.');
  });

  const de = (plan: PhrasePlan) => say(plan, 'de');
  const aMouse = np('MOUSE', { definiteness: 'indefinite' });

  test('the particle closes the clause after nicht, a pronoun and the progressive gerade', () => {
    expect(de(clause(np('CAT'), 'ADD', { directObject: np('MOUSE'), verbPhrase: { negative: true } }))).toBe('der Kater fügt die Maus nicht hinzu.');
    expect(de(clause(np('CAT'), 'ADD', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { modifier: 'FAST' } }))).toBe('der Kater fügt sie schnell hinzu.');
    expect(de(clause(np('CAT'), 'ADD', { directObject: aMouse, verbPhrase: { aspect: 'progressive' } }))).toBe('der Kater fügt gerade eine Maus hinzu.');
    expect(de(clause(np('CAT'), 'ADD', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG') } } }))).toBe('der Kater fügt dem Hund das Buch hinzu.');
    expect(de({ ...clause(np('DOG'), 'RUN'), coordination: { conjunction: 'then', clause: clause(np('CAT'), 'ADD', { directObject: aMouse }) } }))
      .toBe('der Hund läuft, und dann fügt der Kater eine Maus hinzu.');
  });

  test('the infinitive and the participle keep the particle, and the zu-infinitive takes zu inside it', () => {
    expect(de(clause(np('CAT'), 'ADD', { directObject: aMouse, verbPhrase: { tense: 'future' } }))).toBe('der Kater wird eine Maus hinzufügen.');
    expect(de(clause(np('CAT'), 'ADD', { directObject: aMouse, verbPhrase: { aspect: 'resultative' } }))).toBe('der Kater hat eine Maus hinzugefügt.');
    expect(de(clause(np('CAT'), 'ADD', { directObject: aMouse, verbPhrase: { modals: [{ verb: 'MUST' }] } }))).toBe('der Kater muss eine Maus hinzufügen.');
    expect(de(clause(np('CAT'), 'ADD', { directObject: aMouse, verbPhrase: { aspect: 'prospective' } }))).toBe('der Kater ist im Begriff, eine Maus hinzuzufügen.');
  });

  test('a verb-final clause joins the particle back onto the finite verb', () => {
    expect(de(clause(np('CAT', { relative: { verbPhrase: { verb: 'ADD' }, directObject: aMouse } }), 'RUN'))).toBe('der Kater, der eine Maus hinzufügt, läuft.');
    expect(de(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'ADD', negative: true } } }), 'RUN')))
      .toBe('die Maus, die der Kater nicht hinzufügt, läuft.');
    expect(de({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'ADD', { directObject: aMouse }) }))
      .toBe('wenn der Kater eine Maus hinzufügen würde, würde der Hund laufen.');
    expect(de(clause(np('CAT'), 'START', { complements: { instrumental: { phrase: aMouse, specifiers: [{ kind: 'abstraction', value: 'process' }], action: { verb: 'ADD' } } } })))
      .toBe('der Kater beginnt, indem man eine Maus hinzufügt.');
  });

  test('every command puts the particle last', () => {
    const command = (subject: NounPhrase, negative = false) => de({ subject, verbPhrase: { verb: 'ADD', negative }, imperative: true, directObject: aMouse });
    expect(command(np('SECOND_PERSON'))).toBe('füge eine Maus hinzu.');
    expect(command(np('SECOND_PERSON', { number: 'plural' }))).toBe('fügt eine Maus hinzu.');
    expect(command(np('FIRST_PERSON', { number: 'plural' }))).toBe('fügen wir eine Maus hinzu.');
  });

  // Regression guard: ADD's other six languages keep their verb.
  test('regression: the other languages are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'ADD', { directObject: aMouse }))).toMatchObject({
      en: 'the cat adds a mouse.',
      it: 'il gatto aggiunge un topo.',
      fr: 'le chat ajoute une souris.',
      es: 'el gato añade un ratón.',
      pt: 'o gato adiciona um rato.',
    });
  });
});

// A139. One clicks ON a thing in five of the languages: it "cliccare su", fr "cliquer sur", de "klicken
// auf" + accusative, es "clicar en", pt "clicar em". CLICK renders its object bare, as English and
// Japanese (を) take it. The UI's own hints say it too: "clicca uno slot", "cliquer la période".
describe('known bugs: CLICK takes its object with a preposition', () => {
  test('clicking on a thing', () => {
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('BUTTON') }))).toEqual({
      en: 'the cat clicks the button.',
      it: 'il gatto clicca sul pulsante.',
      fr: 'le chat clique sur le bouton.',
      de: 'der Kater klickt auf die Taste.',
      es: 'el gato clica en el botón.',
      ja: '猫はボタンをクリックします。',
      pt: 'o gato clica no botão.',
    });
  });

  test('an instruction to click on a thing', () => {
    expect(sayAll({
      subject: { concept: 'SECOND_PERSON', definiteness: 'bare' },
      verbPhrase: { verb: 'CLICK' },
      imperative: true,
      imperativeRegister: 'instruction',
      directObject: np('BUTTON'),
    })).toEqual({
      en: 'click the button.',
      it: 'clicca sul pulsante.',
      fr: 'cliquer sur le bouton.',
      de: 'auf die Taste klicken.',
      es: 'clicar en el botón.',
      ja: 'ボタンをクリック。',
      pt: 'clicar no botão.',
    });
  });

  test('a pronoun object takes its tonic form after the preposition, never a clitic', () => {
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('FIRST_PERSON') }))).toMatchObject({
      it: 'il gatto clicca su di me.',
      fr: 'le chat clique sur moi.',
      de: 'der Kater klickt auf mich.',
      es: 'el gato clica en mí.',
      pt: 'o gato clica em mim.',
    });
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('THIRD_PERSON', { gender: 'fem' }) }))).toMatchObject({
      it: 'il gatto clicca su di lei.',
      fr: 'le chat clique sur elle.',
      de: 'der Kater klickt auf sie.',
      es: 'el gato clica en ella.',
      pt: 'o gato clica nela.',
    });
    expect(sayAll({ subject: { concept: 'SECOND_PERSON', definiteness: 'bare' }, verbPhrase: { verb: 'CLICK' }, imperative: true, directObject: np('FIRST_PERSON') }))
      .toMatchObject({ it: 'clicca su di me.', fr: 'clique sur moi.', de: 'klick auf mich.', es: 'clica en mí.', pt: 'clique em mim.' });
  });

  test('the negation, a no-object and a coordinated object', () => {
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('BUTTON'), verbPhrase: { negative: true } }))).toMatchObject({
      it: 'il gatto non clicca sul pulsante.',
      fr: 'le chat ne clique pas sur le bouton.',
      de: 'der Kater klickt nicht auf die Taste.',
      es: 'el gato no clica en el botón.',
      pt: 'o gato não clica no botão.',
    });
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('BUTTON', { definiteness: 'no' }) }))).toMatchObject({
      it: 'il gatto non clicca su nessun pulsante.',
      fr: 'le chat ne clique sur aucun bouton.',
      de: 'der Kater klickt auf keine Taste.',
      es: 'el gato no clica en ningún botón.',
      pt: 'o gato não clica em nenhum botão.',
    });
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: { conjuncts: [np('BUTTON'), np('HOUSE')], conjunction: 'and' } }))).toMatchObject({
      it: 'il gatto clicca sul pulsante e sulla casa.',
      fr: 'le chat clique sur le bouton et sur la maison.',
      de: 'der Kater klickt auf die Taste und das Haus.',
      es: 'el gato clica en el botón y en la casa.',
      pt: 'o gato clica no botão e na casa.',
    });
  });

  test('the resultative, a modal, the impersonal subject and the protasis', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'CLICK', { directObject: np('HOUSE'), verbPhrase: { aspect: 'resultative' } }))).toMatchObject({
      it: 'la gatta ha cliccato sulla casa.',
      fr: 'la chatte a cliqué sur la maison.',
      de: 'die Katze hat auf das Haus geklickt.',
      es: 'la gata ha clicado en la casa.',
      pt: 'a gata clicou na casa.',
    });
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('BUTTON'), verbPhrase: { modals: [{ verb: 'MUST' }] } }))).toMatchObject({
      it: 'il gatto deve cliccare sul pulsante.',
      fr: 'le chat doit cliquer sur le bouton.',
      de: 'der Kater muss auf die Taste klicken.',
      es: 'el gato debe clicar en el botón.',
      pt: 'o gato deve clicar no botão.',
    });
    // No passive agreement with a prepositional object: "si clicca", never "si cliccano i pulsanti".
    expect(sayAll(clause(np('GENERIC_PERSON'), 'CLICK', { directObject: np('BUTTON', { number: 'plural' }) }))).toMatchObject({
      it: 'si clicca sui pulsanti.',
      fr: 'on clique sur les boutons.',
      de: 'man klickt auf die Tasten.',
      es: 'se clica en los botones.',
      pt: 'se clica nos botões.',
    });
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'CLICK', { directObject: np('BUTTON') }) })).toMatchObject({
      it: 'se il gatto cliccasse sul pulsante, il cane correrebbe.',
      fr: 'si le chat cliquait sur le bouton, le chien courrait.',
      de: 'wenn der Kater auf die Taste klicken würde, würde der Hund laufen.',
      es: 'si el gato clicara en el botón, el perro correría.',
      pt: 'se o gato clicasse no botão, o cão correria.',
    });
  });

  test('a relative on the object keeps the preposition', () => {
    const clicked = (extra: Partial<NounPhrase>, aspect?: 'resultative') => np('BUTTON', {
      ...extra,
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'CLICK', ...(aspect ? { aspect } : {}) } },
    });
    expect(sayAll(clause(clicked({}), 'RUN'))).toMatchObject({
      it: 'il pulsante sul quale il gatto clicca corre.',
      fr: 'le bouton sur lequel le chat clique court.',
      es: 'el botón en el que el gato clica corre.',
      pt: 'o botão no qual o gato clica corre.',
    });
    expect(say(clause(clicked({}), 'RUN'), 'de')).toMatch(/^die Taste, auf die der Kater klickt, /);
    // No French participle agreement: the head is no preceding direct object.
    expect(sayAll(clause(clicked({ number: 'plural' }, 'resultative'), 'RUN'))).toMatchObject({
      it: 'i pulsanti sui quali il gatto ha cliccato corrono.',
      fr: 'les boutons sur lesquels le chat a cliqué courent.',
      es: 'los botones en los que el gato ha clicado corren.',
      pt: 'os botões nos quais o gato clicou correm.',
    });
  });

  // Regression guard: English and Japanese keep the bare object, and a plain transitive verb its clitic.
  test('regression: English, Japanese and a plain direct object are unchanged', () => {
    expect(sayAll(clause(np('CAT'), 'CLICK', { directObject: np('FIRST_PERSON') }))).toMatchObject({
      en: 'the cat clicks me.',
      ja: '猫は私をクリックします。',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('FIRST_PERSON') }))).toMatchObject({
      it: 'il gatto mi vede.',
      fr: 'le chat me voit.',
      de: 'der Kater sieht mich.',
      es: 'el gato me ve.',
      pt: 'o gato me vê.',
    });
    expect(say(clause(np('CAT'), 'CLICK', { complements: { locative: { phrase: np('HOUSE') } } }), 'de')).toBe('der Kater klickt im Haus.');
  });
});

// The three verbs B32's place glosses are built from. Each was seeded for one gloss, but a verb
// carries its whole paradigm, so what the gloss never renders is pinned here: the persons and
// tenses each language inflects, and the stem alternations that are easy to get wrong.
describe('B32 verbs: LIVE, TRADE and CONFINE', () => {
  const says = (verb: string, subject: NounElement, extra: Partial<VerbPhrase> = {}, object?: string) =>
    sayAll(clause(subject, verb, { ...(object ? { directObject: np(object) } : {}), verbPhrase: extra }));

  test('LIVE: the dwelling verb, not the be-alive one', () => {
    // it abitare, fr habiter, de wohnen and pt morar are the dwelling senses; es vivir and ja 住む
    // carry both. The whole point of seeding this sense is that it is NOT vivere/vivre/leben/viver.
    expect(says('LIVE', np('CAT'))).toEqual({
      en: 'the cat lives.',
      it: 'il gatto abita.',
      fr: 'le chat habite.',
      de: 'der Kater wohnt.',
      es: 'el gato vive.',
      ja: '猫は住みます。',
      pt: 'o gato mora.',
    });
    expect(says('LIVE', np('CAT', { number: 'plural' }))).toMatchObject({
      en: 'the cats live.',
      it: 'i gatti abitano.',
      fr: 'les chats habitent.',
      de: 'die Kater wohnen.',
      es: 'los gatos viven.',
      pt: 'os gatos moram.',
    });
    expect(says('LIVE', np('CAT'), { tense: 'past' })).toMatchObject({
      en: 'the cat lived.',
      it: 'il gatto abitò.',
      fr: 'le chat habita.',
      de: 'der Kater wohnte.',
      es: 'el gato vivió.',
      pt: 'o gato morou.',
    });
    expect(says('LIVE', np('CAT'), { tense: 'future' })).toMatchObject({
      it: 'il gatto abiterà.',
      fr: 'le chat habitera.',
      de: 'der Kater wird wohnen.',
      es: 'el gato vivirá.',
      pt: 'o gato morará.',
    });
    // It licenses a locative — the complement whereGloss's relative clause gaps on.
    expect(says('LIVE', np('CAT'), { }, undefined)).toBeTruthy();
    expect(say(clause(np('CAT'), 'LIVE', { complements: { locative: { phrase: np('HOUSE') } } }), 'de'))
      .toBe('der Kater wohnt im Haus.');
  });

  test('TRADE: the -eln and -cer stem alternations', () => {
    // German -eln drops the stem -e- in the 1sg (ich handle, not handele); French -cer takes a
    // cedilla before o (nous commerçons). Both are first-person forms no gloss ever renders.
    expect(says('TRADE', np('FIRST_PERSON'))).toMatchObject({
      en: 'I trade.',
      it: 'commercio.',
      fr: 'je commerce.',
      de: 'ich handle.',
      es: 'comercio.',
      pt: 'comercio.',
    });
    expect(says('TRADE', np('FIRST_PERSON', { number: 'plural' }))).toMatchObject({
      it: 'commerciamo.',
      fr: 'nous commerçons.',
      de: 'wir handeln.',
      es: 'comerciamos.',
      pt: 'comerciamos.',
    });
    expect(says('TRADE', np('CAT'))).toMatchObject({
      en: 'the cat trades.',
      de: 'der Kater handelt.',
      ja: '猫は売買します。',
    });
  });

  test('CONFINE: the Spanish personal a and the German -ieren participle', () => {
    // PERSON is `human`, so Spanish takes the personal a (A98) — "encierra a la persona". German
    // inhaftieren is an -ieren verb, so its participle has no ge-, and Italian rinchiudere has the
    // irregular rinchiuso.
    expect(says('CONFINE', np('CAT'), {}, 'PERSON')).toEqual({
      en: 'the cat confines the person.',
      it: 'il gatto rinchiude la persona.',
      fr: 'le chat enferme la personne.',
      de: 'der Kater inhaftiert die Person.',
      es: 'el gato encierra a la persona.',
      ja: '猫は人を閉じ込めます。',
      pt: 'o gato encarcera a pessoa.',
    });
    expect(says('CONFINE', np('FIRST_PERSON', { number: 'plural' }), {}, 'PERSON')).toMatchObject({
      it: 'rinchiudiamo la persona.',
      fr: 'nous enfermons la personne.',
      de: 'wir inhaftieren die Person.',
      es: 'encerramos a la persona.', // unstressed stem: encerr-, not encierr-
      pt: 'encarceramos a pessoa.',
    });
    expect(says('CONFINE', np('CAT'), { aspect: 'resultative' }, 'PERSON')).toMatchObject({
      en: 'the cat has confined the person.',
      it: 'il gatto ha rinchiuso la persona.', // irregular participle, avere auxiliary
      fr: 'le chat a enfermé la personne.',
      de: 'der Kater hat die Person inhaftiert.', // -ieren takes no ge-
      es: 'el gato ha encerrado a la persona.',
    });
  });
});
