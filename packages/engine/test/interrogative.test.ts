import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { clause, np, sayAll, translateAll } from './harness.js';

// A yes/no question is a statement's clause with another force (PhrasePlan.interrogative): the verb
// keeps its indicative forms, tense, aspect and modals, and its subject. Each language changes only the
// order and the marks around it — en subject–auxiliary inversion with do-support, de verb-first, fr
// "est-ce que", it / pt the statement's order, es "¿…?", ja か — and the question mark replaces the stop.
const ask = (plan: PhrasePlan): PhrasePlan => ({ ...plan, interrogative: true });
const careful = { predicative: { phrase: np('CAREFUL') } };

describe('interrogative', () => {
  test('asks a plain clause in every language', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { directObject: np('FOOD') })))).toEqual({
      en: 'does the cat eat the food?',
      it: 'il gatto mangia il cibo?',
      fr: 'est-ce que le chat mange la nourriture ?', // French sets "?" off with a no-break space
      de: 'frisst der Kater das Essen?', // V1: the finite verb leads
      es: '¿el gato come la comida?',
      ja: '猫は食べ物を食べますか？',
      pt: 'o gato come a comida?',
    });
  });

  test('keeps the tense and the aspect, inverting whichever auxiliary is finite', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'past' } })))).toMatchObject({
      en: 'did the cat eat?',
      de: 'fraß der Kater?',
      ja: '猫は食べましたか？',
    });
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'future' } })))).toMatchObject({
      en: 'will the cat eat?',
      de: 'wird der Kater fressen?',
      it: 'il gatto mangerà?',
    });
    expect(sayAll(ask(clause(np('CAT'), 'RUN', { verbPhrase: { aspect: 'progressive' } })))).toMatchObject({
      en: 'is the cat running?',
      es: '¿el gato está corriendo?',
      ja: '猫は走っていますか？',
    });
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'resultative' } })))).toMatchObject({
      en: 'has the cat eaten?',
      de: 'hat der Kater gefressen?',
      fr: 'est-ce que le chat a mangé ?',
    });
  });

  test('the copula is its own auxiliary', () => {
    expect(sayAll(ask(clause(np('CAT'), 'BE', { complements: careful })))).toEqual({
      en: 'is the cat careful?',
      it: 'il gatto è attento?',
      fr: 'est-ce que le chat est prudent ?',
      de: 'ist der Kater vorsichtig?',
      es: '¿el gato es cuidadoso?',
      ja: '猫は慎重ですか？',
      pt: 'o gato é cuidadoso?',
    });
  });

  test('a negative question keeps its negation after the inverted auxiliary', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true } })))).toEqual({
      en: 'does the cat not eat?',
      it: 'il gatto non mangia?',
      fr: 'est-ce que le chat ne mange pas ?',
      de: 'frisst der Kater nicht?',
      es: '¿el gato no come?',
      ja: '猫は食べませんか？',
      pt: 'o gato não come?',
    });
    expect(sayAll(ask(clause(np('CAT'), 'BE', { verbPhrase: { negative: true }, complements: careful }))))
      .toMatchObject({ en: 'is the cat not careful?', ja: '猫は慎重ではありませんか？' });
  });

  test('a frequency adverb follows the do-support; a manner adverb trails', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'ALWAYS' } })))).toMatchObject({
      en: 'does the cat always eat?',
      de: 'frisst der Kater immer?',
    });
    // NEVER negates the clause itself, so it takes do-support rather than a "not".
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'NEVER' } })))).toMatchObject({
      en: 'does the cat never eat?',
      fr: 'est-ce que le chat ne mange jamais ?',
      ja: '猫は決して食べませんか？',
    });
    expect(sayAll(ask(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'FAST' } }))).en)
      .toBe('does the cat run fast?');
  });

  test('a modal auxiliary inverts, a lexical modal takes do-support', () => {
    expect(sayAll(ask(clause(np('CAT'), 'RUN', { verbPhrase: { modals: ['CAN'] } })))).toMatchObject({
      en: 'can the cat run?',
      de: 'kann der Kater laufen?',
      ja: '猫は走ることができますか？',
    });
    // "cannot" is one word for two, and only the "can" moves.
    expect(sayAll(ask(clause(np('CAT'), 'RUN', { verbPhrase: { modals: ['CAN'], negative: true } }))).en)
      .toBe('can the cat not run?');
    expect(sayAll(ask(clause(np('CAT'), 'RUN', { verbPhrase: { modals: ['WILL'] } })))).toMatchObject({
      en: 'does the cat want to run?',
      de: 'will der Kater laufen?',
    });
    expect(sayAll(ask(clause(np('CAT'), 'RUN', { verbPhrase: { modals: ['MUST'], tense: 'past' } }))).en)
      .toBe('did the cat have to run?');
  });

  test('pronoun subjects: do-support agrees, "que" elides, pro-drop languages drop them', () => {
    expect(sayAll(ask(clause(np('FIRST_PERSON'), 'EAT')))).toEqual({
      en: 'do I eat?',
      it: 'mangio?',
      fr: 'est-ce que je mange ?', // the first singular does not invert; "est-ce que" asks it anyway
      de: 'esse ich?',
      es: '¿como?',
      ja: '私は食べますか？',
      pt: 'como?',
    });
    expect(sayAll(ask(clause(np('THIRD_PERSON', { gender: 'fem' }), 'EAT')))).toMatchObject({
      en: 'does she eat?',
      fr: "est-ce qu'elle mange ?",
      de: 'isst sie?',
    });
    // An English phrasal verb still moves its particle past a pronoun object.
    expect(sayAll(ask(clause(np('SECOND_PERSON'), 'TURN_OFF', { directObject: np('THIRD_PERSON') })))).toMatchObject({
      en: 'do you turn him off?',
      de: 'deaktivierst du ihn?',
      it: 'lo disattivi?',
    });
  });

  test('a clause coordinated with a question is a question too', () => {
    const pair = ask({
      ...clause(np('CAT'), 'EAT'),
      coordination: { conjunction: 'and', clause: clause(np('DOG'), 'RUN') },
    });
    expect(sayAll(pair)).toMatchObject({
      en: 'does the cat eat, and does the dog run?',
      de: 'frisst der Kater, und läuft der Hund?',
      fr: 'est-ce que le chat mange, et le chien court ?', // one "est-ce que" asks the whole
      es: '¿el gato come, y el perro corre?',
      ja: '猫は食べますか。そして、犬は走りますか？',
    });
  });

  test('a relative clause inside a question stays a statement', () => {
    const cat = np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') } });
    expect(sayAll(ask(clause(cat, 'RUN')))).toMatchObject({
      en: 'does the cat that eats the food run?',
      de: 'läuft der Kater, der das Essen frisst?',
      ja: '食べ物を食べる猫は走りますか？',
    });
  });

  test('a command, a condition, a citation and a verbless period ignore the flag', () => {
    expect(sayAll({ ...ask(clause(np('SECOND_PERSON'), 'EAT')), imperative: true })).toMatchObject({
      en: 'eat.',
      de: 'iss.',
      ja: '食べてください。',
    });
    expect(sayAll({ ...ask(clause(np('DOG'), 'RUN')), condition: clause(np('CAT'), 'EAT') })).toMatchObject({
      en: 'if the cat ate, the dog would run.',
      es: 'si el gato comiera, el perro correría.',
    });
    expect(sayAll({ ...ask(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('FOOD') })), infinitive: true }))
      .toMatchObject({ en: 'to eat the food.', ja: '食べ物を食べる。' });
    expect(sayAll(ask({ subject: np('SERVER') }))).toMatchObject({ en: 'the server.', es: 'el servidor.' });
  });

  test('the ruby segments carry the question mark after か', () => {
    const ja = translateAll(ask(clause(np('CAT'), 'EAT'))).find((t) => t.language === 'ja');
    expect(ja?.ruby?.slice(-2)).toEqual([{ t: 'か' }, { t: '？' }]);
  });
});

// The question the word map asks after a failed load (`status.isServerActive`), on the words seeded for
// it: SERVER, and ACTIVE in its machine sense — a transient state, so es/pt predicate it with estar.
describe('is the server active?', () => {
  const active = { predicative: { phrase: np('ACTIVE') } };

  test('asks after the server in every language', () => {
    expect(sayAll(ask(clause(np('SERVER'), 'BE', { complements: active })))).toEqual({
      en: 'is the server active?',
      it: 'il server è attivo?',
      fr: 'est-ce que le serveur est actif ?',
      de: 'ist der Server aktiv?',
      es: '¿el servidor está activo?',
      ja: 'サーバーは稼働中ですか？',
      pt: 'o servidor está ativo?',
    });
  });

  test('SERVER in the plural and ACTIVE agreeing with it, attributive and predicate', () => {
    expect(sayAll(clause(np('SERVER', { number: 'plural' }), 'BE', { complements: active }))).toEqual({
      en: 'the servers are active.',
      it: 'i server sono attivi.', // Italian "server" is invariable
      fr: 'les serveurs sont actifs.',
      de: 'die Server sind aktiv.',
      es: 'los servidores están activos.',
      ja: 'サーバーは稼働中です。',
      pt: 'os servidores estão ativos.',
    });
    expect(sayAll(clause(np('HOUSE', { adjectives: ['ACTIVE'] }), 'BURN'))).toMatchObject({
      it: 'la casa attiva brucia.',
      fr: 'la maison active brûle.',
      de: 'das aktive Haus brennt.',
      es: 'la casa activa arde.',
      ja: '稼働中の家は燃えます。',
    });
  });
});
