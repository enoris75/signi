import { describe, expect, test } from 'vitest';
import type { Complement, NounElement, NounPhrase, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

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
    ['ACQUIRE', 'la gatta ha acquisito.'],
    ['ADD', 'la gatta ha aggiunto.'], ['APPEAR', 'la gatta è apparsa.'],
    ['BE', 'la gatta è stata.'], ['BEAT', 'la gatta ha battuto.'],
    ['BECOME', 'la gatta è diventata.'], ['BITE', 'la gatta ha morso.'],
    ['BURN', 'la gatta ha bruciato.'], ['BUY', 'la gatta ha comprato.'],
    ['CHANGE', 'la gatta ha cambiato.'],
    ['CHOOSE', 'la gatta ha scelto.'], ['CLEAR', 'la gatta ha cancellato.'],
    ['CLICK', 'la gatta ha cliccato.'], ['COLLAPSE', 'la gatta è crollata.'],
    ['COME', 'la gatta è venuta.'], ['COMPACT', 'la gatta ha compattato.'],
    ['COORDINATE', 'la gatta ha coordinato.'], ['CREATE', 'la gatta ha creato.'],
    ['CRY', 'la gatta ha pianto.'],
    ['CRY_OUT', 'la gatta ha gridato.'], ['CUT', 'la gatta ha tagliato.'],
    ['DESCRIBE', 'la gatta ha descritto.'], ['DESTROY', 'la gatta ha distrutto.'],
    ['DIVIDE', 'la gatta ha diviso.'],
    ['DRINK', 'la gatta ha bevuto.'], ['EAT', 'la gatta ha mangiato.'],
    ['EXPAND', 'la gatta ha espanso.'], ['EXPORT', 'la gatta ha esportato.'],
    ['EXPRESS', 'la gatta ha espresso.'],
    ['EXTINGUISH', 'la gatta ha spento.'], ['FEEL', 'la gatta ha provato.'],
    ['GIVE', 'la gatta ha dato.'],
    ['GO', 'la gatta è andata.'], ['HAVE', 'la gatta ha avuto.'],
    ['HIDE', 'la gatta ha nascosto.'], ['HOLD', 'la gatta ha contenuto.'],
    ['IMPORT', 'la gatta ha importato.'], ['INDICATE', 'la gatta ha indicato.'],
    ['JUMP', 'la gatta ha saltato.'],
    ['KILL', 'la gatta ha ucciso.'], ['KNOW', 'la gatta ha saputo.'],
    ['LOAD', 'la gatta ha caricato.'], ['LOVE', 'la gatta ha amato.'],
    ['MAKE', 'la gatta ha fatto.'], ['MODIFY', 'la gatta ha modificato.'],
    ['NAME', 'la gatta ha nominato.'], ['OWN', 'la gatta ha posseduto.'],
    ['PERCEIVE', 'la gatta ha percepito.'], ['PRESS', 'la gatta ha premuto.'],
    ['PRODUCE', 'la gatta ha prodotto.'],
    ['READ', 'la gatta ha letto.'], ['REPLACE', 'la gatta ha sostituito.'],
    ['RUN', 'la gatta ha corso.'], ['SAVE', 'la gatta ha salvato.'],
    ['SEE', 'la gatta ha visto.'], ['SEEM', 'la gatta è sembrata.'],
    ['SELECT', 'la gatta ha selezionato.'], ['SEND', 'la gatta ha mandato.'],
    ['SET_ON_FIRE', 'la gatta ha bruciato.'], ['SHED', 'la gatta ha versato.'],
    ['SHOW', 'la gatta ha mostrato.'], ['START', 'la gatta ha iniziato.'],
    ['STRIKE', 'la gatta ha colpito.'], ['TIDY_UP', 'la gatta ha riordinato.'],
    ['TRANSFER', 'la gatta ha trasferito.'], ['TYPE', 'la gatta ha digitato.'],
    ['UNDERSTAND', 'la gatta ha compreso.'], ['WRITE', 'la gatta ha scritto.'],
  ];

  test.each(IT)('%s → %s', (id, expected) => {
    expect(femResult(id).it).toBe(expected);
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
      ja: '猫はネズミを所有します。',
    });
  });

  test('OWN in the past', () => {
    expect(owns({ tense: 'past' })).toEqual({
      en: 'the cat owned the mouse.',
      it: 'il gatto possedé il topo.',
      fr: 'le chat posséda la souris.',
      es: 'el gato poseyó el ratón.',
      pt: 'o gato possuiu o rato.',
      de: 'der Kater besaß die Maus.',
      ja: '猫はネズミを所有しました。',
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
      ja: '猫はネズミを保持します。',
    });
  });

  test('HOLD in the past', () => {
    expect(holds({ tense: 'past' })).toEqual({
      en: 'the cat held the mouse.',
      it: 'il gatto contenne il topo.',
      fr: 'le chat contint la souris.',
      es: 'el gato contuvo el ratón.',
      pt: 'o gato conteve o rato.',
      de: 'der Kater enthielt die Maus.',
      ja: '猫はネズミを保持しました。',
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
    expect(femResult('EAT').de).toBe('die Katze hat gegessen.'); // haben
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

// A52. The prospective's "im Begriff … zu" frame is assembled as fixed pieces around the objects, so
// the zu-infinitive group is split. Once a direct object, the future, a modal or a verb-final
// clause is involved, the object or the finite verb lands inside the frame. The zu-infinitive group
// ("die Maus zu essen") belongs together, extraposed after a comma because it depends on the noun
// "Begriff". A verb-final clause puts the finite verb after the whole group.
describe('known bugs: German prospective word order', () => {
  const catEatsMouse = (verbPhrase: Partial<VerbPhrase>) =>
    sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', ...verbPhrase }, directObject: np('MOUSE') })).de;

  test('German keeps the zu-infinitive group together, after "im Begriff sein"', () => {
    expect(catEatsMouse({})).toBe('der Kater ist im Begriff, die Maus zu essen.');
    expect(catEatsMouse({ tense: 'future' })).toBe('der Kater wird im Begriff sein, die Maus zu essen.');
    expect(catEatsMouse({ modals: [{ verb: 'MUST' }] })).toBe('der Kater muss im Begriff sein, die Maus zu essen.');
  });

  test('German closes a verb-final prospective on the finite verb', () => {
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective', tense: 'future' } },
    }), 'RUN')).de).toBe('der Hund, der im Begriff zu essen sein wird, läuft.');
    expect(sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' } }),
    }).de).toBe('wenn der Kater im Begriff zu essen sein würde, würde der Hund laufen.');
  });

  test('German gathers the adverb, the recipient and the complements into the group', () => {
    expect(catEatsMouse({ tense: 'past' })).toBe('der Kater war im Begriff, die Maus zu essen.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modifier: 'FAST' } })).de)
      .toBe('der Kater ist im Begriff, schnell zu essen.');
    expect(sayAll(clause(np('MAN'), 'GIVE', {
      verbPhrase: { aspect: 'prospective' }, directObject: np('BOOK'), complements: { terminus: { phrase: np('BOY') } },
    })).de).toBe('der Mann ist im Begriff, dem Jungen das Buch zu geben.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, complements: { locative: { phrase: np('MARKET') } } })).de)
      .toBe('der Kater ist im Begriff, im Markt zu essen.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE', { relative: { verbPhrase: { verb: 'RUN' } } }) })).de)
      .toBe('der Kater ist im Begriff, die Maus, die läuft, zu essen.');
  });

  test('German keeps "nicht" and a modal\'s adverb ahead of "im Begriff", outside the group', () => {
    expect(catEatsMouse({ negative: true })).toBe('der Kater ist nicht im Begriff, die Maus zu essen.');
    expect(catEatsMouse({ modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] })).toBe('der Kater muss immer im Begriff sein, die Maus zu essen.');
    expect(catEatsMouse({ tense: 'future', modals: [{ verb: 'MUST' }] })).toBe('der Kater wird im Begriff sein müssen, die Maus zu essen.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', negative: true, modals: [{ verb: 'MUST', modifier: 'ALWAYS' }] } })).de)
      .toBe('der Kater muss nicht immer im Begriff sein zu essen.');
  });

  test('German extraposes a longer group after a verb-final clause\'s finite verb', () => {
    const dogWho = (verbPhrase: Partial<VerbPhrase>, extra: object = {}) =>
      sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective', ...verbPhrase }, ...extra } }), 'RUN')).de;
    expect(dogWho({}, { directObject: np('MOUSE') })).toBe('der Hund, der im Begriff ist, die Maus zu essen, läuft.');
    expect(dogWho({ tense: 'future' }, { directObject: np('MOUSE') })).toBe('der Hund, der im Begriff sein wird, die Maus zu essen, läuft.');
    expect(dogWho({ modifier: 'FAST' })).toBe('der Hund, der im Begriff ist, schnell zu essen, läuft.');
    expect(sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE') }),
    }).de).toBe('wenn der Kater im Begriff sein würde, die Maus zu essen, würde der Hund laufen.');
    // A bare zu-infinitive under a modal stays inside the bracket.
    expect(dogWho({ modals: [{ verb: 'MUST' }] })).toBe('der Hund, der im Begriff zu essen sein muss, läuft.');
  });

  test('German puts a bare zu-infinitive after "sein" in a V2 clause, with no comma', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective', modals: [{ verb: 'MUST' }] } })).de)
      .toBe('der Kater muss im Begriff sein zu essen.');
    expect(sayAll({
      ...clause(np('DOG'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE') }),
      condition: clause(np('CAT'), 'RUN'),
    }).de).toBe('wenn der Kater laufen würde, würde der Hund im Begriff sein, die Maus zu essen.');
  });

  test('German follows the group with an "indem" clause or a coordinated clause', () => {
    const instrumental: Complement = {
      phrase: np('WORD', { definiteness: 'indefinite' }), specifiers: [{ kind: 'abstraction', value: 'process' }], action: { verb: 'CHOOSE' },
    };
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, complements: { instrumental } })).de)
      .toBe('der Kater ist im Begriff zu essen, indem man ein Wort wählt.');
    expect(sayAll(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', aspect: 'prospective' }, directObject: np('MOUSE'), complements: { instrumental } },
    }), 'RUN')).de).toBe('der Hund, der im Begriff ist, die Maus zu essen, indem man ein Wort wählt, läuft.');
    expect(sayAll({
      ...clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'prospective' }, directObject: np('MOUSE') }),
      coordination: { conjunction: 'and', clause: clause(np('DOG'), 'RUN') },
    }).de).toBe('der Kater ist im Begriff, die Maus zu essen, und der Hund läuft.');
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

  test.fails('the modals, HAVE, OWN and BE take the imperfect in the past', () => {
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

  test.fails('a noun object takes conoscere / connaître / conocer / conhecer / kennen', () => {
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

  test.fails('HAVE, OWN, LOVE and HOLD take 〜ている, and KNOW negates as 知りません', () => {
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
