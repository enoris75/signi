import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { clause, np, sayAll, translateAll } from './harness.js';

// A wh-question is a clause with a gap (PhrasePlan.questionRole, P09-E6): the slot it asks about is
// left out of the plan, as a relative clause leaves its head's slot out, and the question word stands
// for it. It is the yes/no question's force (it implies `interrogative`), so the question mark, the ¿
// and the か are C10's; what each language adds is where the word goes — en fronts and inverts with
// do-support (not over the subject), de fronts into V2, it / es put the subject behind the verb, pt
// fronts and keeps the statement's order, fr fronts before "est-ce que" (not over the subject), and
// ja moves nothing: the word sits in its slot with the slot's own particle.
const ask = (plan: PhrasePlan, questionRole: PhrasePlan['questionRole'], questionAnimate?: boolean): PhrasePlan =>
  ({ ...plan, questionRole, ...(questionAnimate ? { questionAnimate } : {}) });
// A subject gap still carries a subject, because a plan must; it is a throwaway, never rendered.
const someone = np('GENERIC_PERSON');

describe('wh-questions: the five gaps', () => {
  test('the subject: who eats the food?', () => {
    expect(sayAll(ask(clause(someone, 'EAT', { directObject: np('FOOD') }), 'subject', true))).toEqual({
      en: 'who eats the food?',
      it: 'chi mangia il cibo?',
      fr: 'qui mange la nourriture ?',
      de: 'wer isst das Essen?',
      es: '¿quién come la comida?',
      ja: '誰が食べ物を食べますか？',
      pt: 'quem come a comida?',
    });
  });

  test('the direct object: what does the cat eat?', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT'), 'directObject'))).toEqual({
      en: 'what does the cat eat?',
      it: 'che cosa mangia il gatto?',
      fr: "qu'est-ce que le chat mange ?",
      de: 'was frisst der Kater?',
      es: '¿qué come el gato?',
      ja: '猫は何を食べますか？',
      pt: 'o que o gato come?',
    });
  });

  test('the locative: where does the cat eat?', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT'), 'locative'))).toEqual({
      en: 'where does the cat eat?',
      it: 'dove mangia il gatto?',
      fr: 'où est-ce que le chat mange ?',
      de: 'wo frisst der Kater?',
      es: '¿dónde come el gato?',
      ja: '猫はどこで食べますか？',
      pt: 'onde o gato come?',
    });
  });

  test('the manner: how does the cat eat?', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT'), 'manner'))).toEqual({
      en: 'how does the cat eat?',
      it: 'come mangia il gatto?',
      fr: 'comment est-ce que le chat mange ?',
      de: 'wie frisst der Kater?',
      es: '¿cómo come el gato?',
      ja: '猫はどうやって食べますか？',
      pt: 'como o gato come?',
    });
  });

  test('the cause: why does the cat eat the food?', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { directObject: np('FOOD') }), 'cause'))).toEqual({
      en: 'why does the cat eat the food?',
      it: 'perché mangia il cibo il gatto?', // the subject the question is not about closes the clause
      fr: 'pourquoi est-ce que le chat mange la nourriture ?',
      de: 'warum frisst der Kater das Essen?',
      es: '¿por qué come el gato la comida?', // VSO: the subject right behind the verb
      ja: '猫はなぜ食べ物を食べますか？',
      pt: 'por que o gato come a comida?',
    });
  });

  test('a locative or cause gap in its plain relation says so explicitly too', () => {
    const where = { ...ask(clause(np('CAT'), 'EAT'), 'locative'), questionSpecifiers: [{ kind: 'path', value: 'in' }] } as PhrasePlan;
    expect(sayAll(where).en).toBe('where does the cat eat?');
    const why = { ...ask(clause(np('CAT'), 'EAT'), 'cause'), questionSpecifiers: [{ kind: 'sentiment', value: 'neutral' }] } as PhrasePlan;
    expect(sayAll(why).de).toBe('warum frisst der Kater?');
  });
});

describe('wh-questions: who against what', () => {
  test('over the subject', () => {
    expect(sayAll(ask(clause(someone, 'EAT', { directObject: np('FOOD') }), 'subject'))).toEqual({
      en: 'what eats the food?',
      it: 'che cosa mangia il cibo?',
      fr: "qu'est-ce qui mange la nourriture ?", // a bare "que" cannot be a subject
      de: 'was isst das Essen?',
      es: '¿qué come la comida?',
      ja: '何が食べ物を食べますか？',
      pt: 'o que come a comida?',
    });
  });

  test('over the object', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT'), 'directObject', true))).toEqual({
      en: 'who does the cat eat?',
      it: 'chi mangia il gatto?',
      fr: 'qui est-ce que le chat mange ?',
      de: 'wen frisst der Kater?', // wer declines: the accusative
      es: '¿a quién come el gato?', // a person asked as the object takes the personal a
      ja: '猫は誰を食べますか？',
      pt: 'quem o gato come?',
    });
  });

  test('German declines who for the case its verb governs', () => {
    expect(sayAll(ask(clause(np('CAT'), 'HELP_VERB'), 'directObject', true)).de).toBe('wem hilft der Kater?');
  });

  test('a verb that takes its object with a preposition asks with it', () => {
    expect(sayAll(ask(clause(np('CAT'), 'DEPEND'), 'directObject'))).toEqual({
      en: 'what does the cat depend on?', // English strands it
      it: 'da che cosa dipende il gatto?',
      fr: 'de quoi est-ce que le chat dépend ?', // que is quoi after a preposition
      de: 'wovon hängt der Kater ab?', // the wo(r)- compound for a thing
      es: '¿de qué depende el gato?',
      ja: '猫は何に依存していますか？', // the verb's own object particle
      pt: 'de que o gato depende?',
    });
    expect(sayAll(ask(clause(np('DOG'), 'FOLLOW'), 'directObject', true))).toMatchObject({
      de: 'auf wen folgt der Hund?',
      es: '¿a quién sigue el perro?',
      ja: '犬は誰に続きますか？',
    });
  });
});

describe('wh-questions: English inversion', () => {
  test('a subject gap does not invert and takes no do-support', () => {
    expect(sayAll(ask(clause(someone, 'EAT', { directObject: np('FOOD') }), 'subject', true)).en).toBe('who eats the food?');
    expect(sayAll(ask(clause(someone, 'RUN', { verbPhrase: { tense: 'past' } }), 'subject', true)).en).toBe('who ran?');
    // Negation needs its do, but it stays behind the subject word.
    expect(sayAll(ask(clause(someone, 'EAT', { verbPhrase: { negative: true } }), 'subject', true)).en).toBe('who does not eat?');
    expect(sayAll(ask(clause(someone, 'RUN', { verbPhrase: { modals: ['CAN'] } }), 'subject', true)).en).toBe('who can run?');
  });

  test('every other gap inverts, with do-support where the group has no auxiliary', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'past' } }), 'directObject')).en).toBe('what did the cat eat?');
    expect(sayAll(ask(clause(np('CAT', { number: 'plural' }), 'EAT'), 'directObject')).en).toBe('what do the cats eat?');
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'progressive' } }), 'directObject')).en).toBe('what is the cat eating?');
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'resultative' } }), 'locative')).en).toBe('where has the cat eaten?');
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { modals: ['CAN'] } }), 'directObject')).en).toBe('what can the cat eat?');
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true } }), 'directObject')).en).toBe('what does the cat not eat?');
    expect(sayAll(ask(clause(np('THIRD_PERSON', { gender: 'fem' }), 'EAT'), 'cause')).en).toBe('why does she eat?');
  });

  test('the copula is its own auxiliary', () => {
    expect(sayAll(ask(clause(np('CAT'), 'BE'), 'locative'))).toEqual({
      en: 'where is the cat?',
      it: "dov'è il gatto?",
      fr: 'où est-ce que le chat est ?',
      de: 'wo ist der Kater?',
      es: '¿dónde está el gato?', // the place asked about still selects estar
      ja: '猫はどこにいますか？', // and the existential's に
      pt: 'onde o gato está?',
    });
    expect(sayAll(ask(clause(np('CAT'), 'BE'), 'manner'))).toMatchObject({
      en: 'how is the cat?',
      it: "com'è il gatto?",
      de: 'wie ist der Kater?',
      ja: '猫はどうですか？', // the copula's manner is the predicate's どう
    });
  });
});

describe('wh-questions: the other languages', () => {
  test('the tenses and aspects keep their groups, the subject behind them in it / es', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'resultative' } }), 'locative'))).toMatchObject({
      it: 'dove ha mangiato il gatto?',
      de: 'wo hat der Kater gefressen?',
      es: '¿dónde ha comido el gato?',
      fr: 'où est-ce que le chat a mangé ?',
      ja: '猫はどこで食べましたか？',
    });
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'progressive' } }), 'directObject'))).toMatchObject({
      it: 'che cosa sta mangiando il gatto?',
      es: '¿qué está comiendo el gato?',
      pt: 'o que o gato está comendo?',
      ja: '猫は何を食べていますか？',
    });
  });

  test('Spanish puts the subject behind the verb, or behind the clitic group', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { directObject: np('FOOD') }), 'locative')).es).toBe('¿dónde come el gato la comida?');
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { directObject: np('THIRD_PERSON') }), 'locative'))).toMatchObject({
      es: '¿dónde lo come el gato?',
      it: 'dove lo mangia il gatto?',
      pt: 'onde o gato o come?',
    });
  });

  test('a dropped pronoun subject leaves the word and the verb', () => {
    expect(sayAll(ask(clause(np('FIRST_PERSON'), 'EAT'), 'cause'))).toEqual({
      en: 'why do I eat?',
      it: 'perché mangio?',
      fr: 'pourquoi est-ce que je mange ?',
      de: 'warum esse ich?',
      es: '¿por qué como?',
      ja: '私はなぜ食べますか？',
      pt: 'por que como?',
    });
  });

  test('Japanese: a person who is somewhere is いる', () => {
    expect(sayAll(ask(clause(someone, 'BE', { complements: { locative: { phrase: np('HOUSE') } } }), 'subject', true))).toMatchObject({
      en: 'who is in the house?',
      es: '¿quién está en la casa?',
      ja: '誰が家にいますか？',
    });
  });

  test('the Japanese ruby reads 何 and 誰, and closes on か', () => {
    const ruby = (plan: PhrasePlan) => translateAll(plan).find((t) => t.language === 'ja')?.ruby;
    expect(ruby(ask(clause(np('CAT'), 'EAT'), 'directObject'))).toContainEqual({ t: '何', r: 'なに' });
    const who = ruby(ask(clause(someone, 'RUN'), 'subject', true));
    expect(who?.[0]).toEqual({ t: '誰', r: 'だれ' });
    expect(who?.slice(-2)).toEqual([{ t: 'か' }, { t: '？' }]);
  });
});

describe('wh-questions: C10 holds', () => {
  test('questionRole implies interrogative, and says the same with it', () => {
    const plan = ask(clause(np('CAT'), 'EAT'), 'directObject');
    expect(sayAll({ ...plan, interrogative: true })).toEqual(sayAll(plan));
  });

  test('the gap is the first clause\'s alone: a coordinated clause is a yes/no question', () => {
    const pair = ask({ ...clause(np('CAT'), 'EAT'), coordination: { conjunction: 'and', clause: clause(np('DOG'), 'RUN') } }, 'directObject');
    expect(sayAll(pair)).toMatchObject({
      en: 'what does the cat eat, and does the dog run?',
      de: 'was frisst der Kater, und läuft der Hund?',
      ja: '猫は何を食べますか。そして、犬は走りますか？',
    });
  });

  test('a command and a condition ignore the question, as they ignore the yes/no one', () => {
    expect(sayAll(ask({ ...clause(np('SECOND_PERSON'), 'EAT'), imperative: true }, 'directObject'))).toMatchObject({ en: 'eat.', de: 'iss.' });
    expect(sayAll(ask({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT') }, 'manner')))
      .toMatchObject({ en: 'if the cat ate, the dog would run.' });
  });
});

// A possessor question asks inside a noun phrase the plan keeps (P09-E14): `questionPossessed` names
// the slot, the subject by default, and *whose* stands where its genitive would.
const whose = (plan: PhrasePlan, questionPossessed?: 'subject' | 'directObject'): PhrasePlan =>
  ({ ...plan, questionRole: 'possessor', ...(questionPossessed ? { questionPossessed } : {}) });

describe('the possessor question', () => {
  test('inside the object: whose food does the cat eat?', () => {
    expect(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD') }), 'directObject'))).toEqual({
      en: 'whose food does the cat eat?',
      it: 'di chi mangia il cibo il gatto?', // the de-phrase fronts alone, the object stays, definite
      fr: 'de qui est-ce que le chat mange la nourriture ?',
      de: 'wessen Essen frisst der Kater?', // the whole phrase fronts, wessen in the article's place
      es: '¿de quién come el gato la comida?', // E6's VSO behind the fronted phrase
      ja: '猫は誰の食べ物を食べますか？',
      pt: 'de quem o gato come a comida?',
    });
  });

  test('inside the subject: whose cat eats the food?', () => {
    expect(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD') })))).toEqual({
      en: 'whose cat eats the food?', // a subject question: no inversion
      it: 'il gatto di chi mangia il cibo?', // Romance pied-pipes the whole subject
      fr: 'le chat de qui mange la nourriture ?', // and asks with no est-ce que
      de: 'wessen Kater frisst das Essen?',
      es: '¿el gato de quién come la comida?',
      ja: '誰の猫が食べ物を食べますか？', // が, not は
      pt: 'o gato de quem come a comida?',
    });
  });

  test('the subject is the default slot, and questionAnimate is not read', () => {
    const plan = clause(np('CAT'), 'EAT', { directObject: np('FOOD') });
    expect(sayAll(whose(plan, 'subject'))).toEqual(sayAll(whose(plan)));
    expect(sayAll({ ...whose(plan), questionAnimate: false }).it).toBe('il gatto di chi mangia il cibo?');
  });

  test('a plural possessed noun, and an adjective on it', () => {
    expect(sayAll(whose(clause(np('CAT'), 'READ', { directObject: np('BOOK', { number: 'plural' }) }), 'directObject'))).toMatchObject({
      en: 'whose books does the cat read?',
      it: 'di chi legge i libri il gatto?',
      de: 'wessen Bücher liest der Kater?',
      ja: '猫は誰の本を読みますか？',
    });
    // German declines strong after wessen, which declines nothing itself.
    expect(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD', { adjectives: ['GREAT'] }) }), 'directObject'))).toMatchObject({
      en: 'whose great food does the cat eat?',
      de: 'wessen großes Essen frisst der Kater?',
      es: '¿de quién come el gato la comida grande?',
    });
    expect(sayAll(whose(clause(np('DOG', { adjectives: ['GREAT'] }), 'RUN')))).toMatchObject({
      de: 'wessen großer Hund läuft?',
      it: 'il grande cane di chi corre?',
      fr: 'le grand chien de qui court ?',
    });
  });

  test('the possessed noun is definite, whatever determiner the plan gave it', () => {
    expect(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD', { definiteness: 'indefinite' }) }), 'directObject')))
      .toEqual(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD') }), 'directObject')));
  });

  test('the tenses, negation and a dropped pronoun subject keep the order', () => {
    expect(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { tense: 'past', negative: true } }), 'directObject')))
      .toMatchObject({
        en: 'whose food did the cat not eat?',
        de: 'wessen Essen fraß der Kater nicht?',
        it: 'di chi non mangiò il cibo il gatto?',
      });
    expect(sayAll(whose(clause(np('FIRST_PERSON'), 'EAT', { directObject: np('FOOD') }), 'directObject'))).toMatchObject({
      en: 'whose food do I eat?',
      it: 'di chi mangio il cibo?',
      es: '¿de quién como la comida?',
      pt: 'de quem como a comida?',
    });
  });

  test('a verb that takes its object with a preposition fronts it whole in Romance and German', () => {
    expect(sayAll(whose(clause(np('CAT'), 'DEPEND', { directObject: np('HOUSE') }), 'directObject'))).toEqual({
      en: 'whose house does the cat depend on?', // English strands it
      it: 'dalla casa di chi dipende il gatto?',
      fr: 'de la maison de qui est-ce que le chat dépend ?',
      de: 'von wessen Haus hängt der Kater ab?',
      es: '¿de la casa de quién depende el gato?',
      ja: '猫は誰の家に依存していますか？',
      pt: 'da casa de quem o gato depende?',
    });
  });

  test('refused: a noun with a possessor of its own, a pronoun, a coordination, a part-whole relation, a complement', () => {
    const eats = (directObject: PhrasePlan['directObject']) => whose(clause(np('CAT'), 'EAT', { directObject }), 'directObject');
    expect(() => translateAll(eats(np('FOOD', { possessor: np('MAN') })))).toThrow(/already has a possessor.*P09-E14/);
    expect(() => translateAll(eats(np('THIRD_PERSON')))).toThrow(/pronoun.*P09-E14/);
    expect(() => translateAll(eats({ conjuncts: [np('FOOD'), np('BOOK')], conjunction: 'and' }))).toThrow(/coordination.*P09-E14/);
    expect(() => translateAll(eats(np('FOOD', { possessorRole: 'whole' })))).toThrow(/owner.*P09-E14/);
    expect(() => translateAll({ ...whose(clause(np('CAT'), 'EAT')), questionPossessed: 'locative' as never })).toThrow(/P09-E14/);
  });
});

describe('wh-questions: not built yet', () => {
  test('a marked relation, another complement gap, and the passive are refused', () => {
    const under = { ...ask(clause(np('CAT'), 'EAT'), 'locative'), questionSpecifiers: [{ kind: 'path', value: 'under' }] } as PhrasePlan;
    expect(() => translateAll(under)).toThrow(/locative/);
    expect(() => translateAll(ask(clause(np('CAT'), 'EAT'), 'instrumental'))).toThrow(/instrumental/);
    expect(() => translateAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { voice: 'passive' } }), 'directObject'))).toThrow(/passive/);
  });
});
