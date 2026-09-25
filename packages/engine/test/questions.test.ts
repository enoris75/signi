import { describe, expect, test } from 'vitest';
import type { ContentClause, PathSpecifier, PhrasePlan, Specifier, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll, translateAll } from './harness.js';

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
    expect(sayAll(whose(clause(np('CAT'), 'READ', { directObject: np('BOOK', { number: 'plural' }) }), 'directObject'))).toEqual({
      en: 'whose books does the cat read?',
      it: 'di chi legge i libri il gatto?',
      fr: 'de qui est-ce que le chat lit les livres ?',
      de: 'wessen Bücher liest der Kater?',
      es: '¿de quién lee el gato los libros?',
      pt: 'de quem o gato lê os livros?',
      ja: '猫は誰の本を読みますか？',
    });
    // German declines strong after wessen, which declines nothing itself.
    expect(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD', { adjectives: ['GREAT'] }) }), 'directObject'))).toEqual({
      en: 'whose great food does the cat eat?',
      it: 'di chi mangia il grande cibo il gatto?',
      fr: 'de qui est-ce que le chat mange la grande nourriture ?',
      ja: '猫は誰の大きい食べ物を食べますか？',
      pt: 'de quem o gato come a comida grande?',
      de: 'wessen großes Essen frisst der Kater?',
      es: '¿de quién come el gato la comida grande?',
    });
    expect(sayAll(whose(clause(np('DOG', { adjectives: ['GREAT'] }), 'RUN')))).toEqual({
      en: 'whose great dog runs?',
      es: '¿el perro grande de quién corre?',
      ja: '誰の大きい犬が走りますか？',
      pt: 'o cão grande de quem corre?',
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
      .toEqual({
        en: 'whose food did the cat not eat?',
        it: 'di chi non mangiò il cibo il gatto?',
        fr: 'de qui est-ce que le chat ne mangea pas la nourriture ?',
        de: 'wessen Essen fraß der Kater nicht?',
        es: '¿de quién no comió el gato la comida?',
        ja: '猫は誰の食べ物を食べませんでしたか？',
        pt: 'de quem o gato não comeu a comida?',
      });
    expect(sayAll(whose(clause(np('FIRST_PERSON'), 'EAT', { directObject: np('FOOD') }), 'directObject'))).toEqual({
      en: 'whose food do I eat?',
      it: 'di chi mangio il cibo?',
      fr: 'de qui est-ce que je mange la nourriture ?',
      de: 'wessen Essen esse ich?',
      es: '¿de quién como la comida?',
      ja: '私は誰の食べ物を食べますか？',
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

  test('German declines the possessed noun for the case its verb governs, strong after wessen', () => {
    const helps = (directObject: PhrasePlan['directObject']) => whose(clause(np('CAT'), 'HELP_VERB', { directObject }), 'directObject');
    expect(sayAll(helps(np('DOG'))).de).toBe('wessen Hund hilft der Kater?');
    expect(sayAll(helps(np('DOG', { number: 'plural', adjectives: ['GREAT'] }))).de).toBe('wessen großen Hunden hilft der Kater?');
    expect(sayAll(helps(np('WOMAN')))).toMatchObject({
      de: 'wessen Frau hilft der Kater?',
      es: '¿de quién ayuda el gato a la mujer?', // a person asked about keeps the personal a
    });
    expect(sayAll(whose(clause(np('CAT'), 'SEE', { directObject: np('DOG', { adjectives: ['GREAT'] }) }), 'directObject')).de)
      .toBe('wessen großen Hund sieht der Kater?');
  });

  test('a masculine noun under the object\'s preposition contracts with it', () => {
    expect(sayAll(whose(clause(np('CAT'), 'DEPEND', { directObject: np('DOG') }), 'directObject'))).toEqual({
      en: 'whose dog does the cat depend on?',
      it: 'dal cane di chi dipende il gatto?',
      fr: 'du chien de qui est-ce que le chat dépend ?',
      de: 'von wessen Hund hängt der Kater ab?',
      es: '¿del perro de quién depende el gato?',
      ja: '猫は誰の犬に依存していますか？',
      pt: 'do cão de quem o gato depende?',
    });
  });

  test('a modal and the resultative keep the verb group', () => {
    const eats = (verbPhrase: Partial<VerbPhrase>) => clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase });
    expect(sayAll(whose(eats({ modals: ['CAN'] }), 'directObject'))).toEqual({
      en: 'whose food can the cat eat?',
      it: 'di chi può mangiare il cibo il gatto?',
      fr: 'de qui est-ce que le chat peut manger la nourriture ?',
      de: 'wessen Essen kann der Kater fressen?',
      es: '¿de quién puede comer el gato la comida?',
      ja: '猫は誰の食べ物を食べることができますか？',
      pt: 'de quem o gato pode comer a comida?',
    });
    expect(sayAll(whose(eats({ modals: ['CAN'] })))).toEqual({
      en: 'whose cat can eat the food?',
      it: 'il gatto di chi può mangiare il cibo?',
      fr: 'le chat de qui peut manger la nourriture ?',
      de: 'wessen Kater kann das Essen fressen?',
      es: '¿el gato de quién puede comer la comida?',
      ja: '誰の猫が食べ物を食べることができますか？',
      pt: 'o gato de quem pode comer a comida?',
    });
    expect(sayAll(whose(eats({ aspect: 'resultative' }), 'directObject'))).toEqual({
      en: 'whose food has the cat eaten?',
      it: 'di chi ha mangiato il cibo il gatto?',
      fr: 'de qui est-ce que le chat a mangé la nourriture ?',
      de: 'wessen Essen hat der Kater gefressen?',
      es: '¿de quién ha comido el gato la comida?',
      ja: '猫は誰の食べ物を食べましたか？',
      pt: 'de quem o gato comeu a comida?',
    });
  });

  test('a ditransitive: the recipient keeps its place behind the object', () => {
    expect(sayAll(whose(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('WOMAN') } } }), 'directObject'))).toEqual({
      en: 'whose book does the man give to the woman?',
      it: 'di chi dà il libro alla donna l\'uomo?',
      fr: 'de qui est-ce que l\'homme donne le livre à la femme ?',
      de: 'wessen Buch gibt der Mann der Frau?',
      es: '¿de quién da el hombre el libro a la mujer?',
      ja: '男は女に誰の本をあげますか？',
      pt: 'de quem o homem dá o livro à mulher?',
    });
  });

  test('a past negative subject question, and a pronoun subject', () => {
    expect(sayAll(whose(clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { tense: 'past', negative: true } })))).toEqual({
      en: 'whose cat did not eat the food?', // do-support for the not, with no inversion
      it: 'il gatto di chi non mangiò il cibo?',
      fr: 'le chat de qui ne mangea pas la nourriture ?',
      de: 'wessen Kater fraß das Essen nicht?',
      es: '¿el gato de quién no comió la comida?',
      ja: '誰の猫が食べ物を食べませんでしたか？',
      pt: 'o gato de quem não comeu a comida?',
    });
    expect(sayAll(whose(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT', { directObject: np('FOOD') }), 'directObject'))).toEqual({
      en: 'whose food do they eat?',
      it: 'di chi mangiano il cibo?',
      fr: 'de qui est-ce qu\'ils mangent la nourriture ?',
      de: 'wessen Essen essen sie?',
      es: '¿de quién comen la comida?',
      ja: '彼らは誰の食べ物を食べますか？',
      pt: 'de quem comem a comida?',
    });
  });
});

// A complement question keeps its relation (P09-E15): `questionSpecifiers` is the relation, and
// `questionAnimate` the answer's *who* against *what* — which, over a direction or a source, also
// chooses between the adverb (*where from*) and the complement path (*who … from*).
const about = (plan: PhrasePlan, questionRole: PhrasePlan['questionRole'], questionSpecifiers?: Specifier[], questionAnimate?: boolean): PhrasePlan =>
  ({ ...ask(plan, questionRole, questionAnimate), ...(questionSpecifiers ? { questionSpecifiers } : {}) });
const path = (value: PathSpecifier): Specifier[] => [{ kind: 'path', value }];
const sentiment = (value: 'positive' | 'negative'): Specifier[] => [{ kind: 'sentiment', value }];

describe('the question over a complement', () => {
  test('under what does the cat eat?', () => {
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('under')))).toEqual({
      en: 'what does the cat eat under?', // English strands the preposition in its slot
      it: 'sotto che cosa mangia il gatto?',
      fr: 'sous quoi est-ce que le chat mange ?',
      de: 'worunter frisst der Kater?', // the wo(r)- compound for a thing
      es: '¿debajo de qué come el gato?',
      ja: '猫は何の下で食べますか？',
      pt: 'debaixo de que o gato come?',
    });
  });

  test('thanks to whom does the cat run?', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'cause', sentiment('positive'), true))).toEqual({
      en: 'who does the cat run thanks to?',
      it: 'grazie a chi corre il gatto?',
      fr: 'grâce à qui est-ce que le chat court ?',
      de: 'dank wem läuft der Kater?', // dank has no compound, and takes the dative
      es: '¿gracias a quién corre el gato?',
      ja: '猫は誰のおかげで走りますか？',
      pt: 'graças a quem o gato corre?',
    });
  });

  test('with what does the man cut the book?', () => {
    expect(sayAll(about(clause(np('MAN'), 'CUT', { directObject: np('BOOK') }), 'instrumental'))).toEqual({
      en: 'what does the man cut the book with?',
      it: 'con che cosa taglia il libro l\'uomo?',
      fr: 'avec quoi est-ce que l\'homme coupe le livre ?', // no article on the question word
      de: 'womit schneidet der Mann das Buch?',
      es: '¿con qué corta el hombre el libro?',
      ja: '男は何で本を切りますか？',
      pt: 'com que o homem corta o livro?',
    });
  });

  test('to whom does the man give the book?', () => {
    expect(sayAll(about(clause(np('MAN'), 'GIVE', { directObject: np('BOOK') }), 'terminus', undefined, true))).toEqual({
      en: 'who does the man give the book to?',
      it: 'a chi dà il libro l\'uomo?',
      fr: 'à qui est-ce que l\'homme donne le livre ?',
      de: 'wem gibt der Mann das Buch?', // the bare dative
      es: '¿a quién da el hombre el libro?',
      ja: '男は誰に本をあげますか？',
      pt: 'a quem o homem dá o livro?',
    });
  });

  test('where does the cat come from?', () => {
    expect(sayAll(about(clause(np('CAT'), 'COME'), 'source'))).toEqual({
      en: 'where does the cat come from?', // where, and the source's from strands
      it: 'da dove viene il gatto?',
      fr: 'd\'où est-ce que le chat vient ?',
      de: 'woher kommt der Kater?',
      es: '¿de dónde viene el gato?',
      ja: '猫はどこから来ますか？',
      pt: 'de onde o gato vem?',
    });
  });

  test('when does the cat eat?', () => {
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'temporal'))).toEqual({
      en: 'when does the cat eat?',
      it: 'quando mangia il gatto?',
      fr: 'quand est-ce que le chat mange ?',
      de: 'wann frisst der Kater?',
      es: '¿cuándo come el gato?',
      ja: '猫はいつ食べますか？', // no particle
      pt: 'quando o gato come?',
    });
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'temporal', [{ kind: 'temporal', value: 'until' }]))).toEqual({
      en: 'until when does the cat eat?',
      it: 'fino a quando mangia il gatto?',
      fr: 'jusqu\'à quand est-ce que le chat mange ?',
      de: 'bis wann frisst der Kater?',
      es: '¿hasta cuándo come el gato?',
      ja: '猫はいつまで食べますか？',
      pt: 'até quando o gato come?',
    });
  });

  test('through whose fault does the cat run? (the negative cause asks whose)', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'cause', sentiment('negative')))).toEqual({
      en: 'through whose fault does the cat run?', // the one English fronts whole
      it: 'per colpa di chi corre il gatto?',
      fr: 'par la faute de qui est-ce que le chat court ?',
      de: 'durch wessen Schuld läuft der Kater?',
      es: '¿por culpa de quién corre el gato?',
      ja: '猫は誰のせいで走りますか？',
      pt: 'por culpa de quem o gato corre?',
    });
  });

  test('around, behind and on: the other marked places', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'locative', path('around')))).toEqual({
      en: 'what does the cat run around?',
      it: 'intorno a che cosa corre il gatto?',
      fr: 'autour de quoi est-ce que le chat court ?',
      de: 'worum läuft der Kater?',
      es: '¿alrededor de qué corre el gato?',
      ja: '猫は何の周りで走りますか？',
      pt: 'ao redor de que o gato corre?',
    });
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('behind')))).toEqual({
      en: 'what does the cat eat behind?',
      it: 'dietro che cosa mangia il gatto?',
      fr: 'derrière quoi est-ce que le chat mange ?',
      de: 'wohinter frisst der Kater?',
      es: '¿detrás de qué come el gato?',
      ja: '猫は何の後ろで食べますか？',
      pt: 'atrás de que o gato come?',
    });
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('on')))).toEqual({
      en: 'what does the cat eat on?',
      it: 'su che cosa mangia il gatto?',
      fr: 'sur quoi est-ce que le chat mange ?',
      de: 'worauf frisst der Kater?',
      es: '¿sobre qué come el gato?',
      ja: '猫は何の上で食べますか？',
      pt: 'sobre que o gato come?',
    });
  });

  test('the comitative, the topic and the route', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'comitative', undefined, true))).toEqual({
      en: 'who does the cat run with?',
      it: 'con chi corre il gatto?',
      fr: 'avec qui est-ce que le chat court ?',
      de: 'mit wem läuft der Kater?',
      es: '¿con quién corre el gato?',
      ja: '猫は誰と走りますか？',
      pt: 'com quem o gato corre?',
    });
    expect(sayAll(about(clause(np('MAN'), 'SPEAK'), 'topic'))).toEqual({
      en: 'what does the man speak about?',
      it: 'di che cosa parla l\'uomo?',
      fr: 'de quoi est-ce que l\'homme parle ?',
      de: 'worüber spricht der Mann?',
      es: '¿sobre qué habla el hombre?',
      ja: '男は何について話しますか？',
      pt: 'sobre que o homem fala?',
    });
    expect(sayAll(about(clause(np('MAN'), 'SPEAK'), 'topic', undefined, true))).toEqual({
      en: 'who does the man speak about?',
      it: 'di chi parla l\'uomo?',
      fr: 'de qui est-ce que l\'homme parle ?',
      de: 'über wen spricht der Mann?',
      es: '¿sobre quién habla el hombre?',
      ja: '男は誰について話しますか？',
      pt: 'sobre quem o homem fala?',
    });
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'route'))).toEqual({
      en: 'what does the cat run through?',
      it: 'attraverso che cosa corre il gatto?',
      fr: 'à travers quoi est-ce que le chat court ?',
      de: 'wodurch läuft der Kater?',
      es: '¿por dónde corre el gato?', // "por qué" would be why
      ja: '猫はどこを走りますか？', // 何を would read as the object's question
      pt: 'por onde o gato corre?',
    });
  });

  test('a bare English addressee strands nothing: who does the man ask?', () => {
    expect(sayAll(about(clause(np('MAN'), 'ASK'), 'terminus', undefined, true))).toEqual({
      en: 'who does the man ask?',
      it: 'a chi chiede l\'uomo?',
      fr: 'à qui est-ce que l\'homme demande ?',
      de: 'wen fragt der Mann?', // fragen's addressee is the accusative
      es: '¿a quién pregunta el hombre?',
      ja: '男は誰に尋ねますか？',
      pt: 'a quem o homem pergunta?',
    });
  });

  test('a direction or source asked of a place is an adverb, of a person the complement path', () => {
    expect(sayAll(about(clause(np('CAT'), 'GO'), 'direction'))).toEqual({
      en: 'where does the cat go?',
      it: 'dove va il gatto?',
      fr: 'où est-ce que le chat va ?',
      de: 'wohin geht der Kater?',
      es: '¿adónde va el gato?',
      ja: '猫はどこへ行きますか？',
      pt: 'aonde o gato vai?',
    });
    expect(sayAll(about(clause(np('CAT'), 'GO'), 'direction', undefined, true))).toEqual({
      en: 'who does the cat go to?',
      it: 'da chi va il gatto?',
      fr: 'vers qui est-ce que le chat va ?',
      de: 'zu wem geht der Kater?',
      es: '¿hacia quién va el gato?',
      ja: '猫は誰へ行きますか？',
      pt: 'para quem o gato vai?',
    });
    expect(sayAll(about(clause(np('CAT'), 'COME'), 'source', undefined, true))).toEqual({
      en: 'who does the cat come from?',
      it: 'da chi viene via il gatto?', // A276
      de: 'von wem kommt der Kater?',
      es: '¿de quién viene el gato?',
      pt: 'de quem o gato vem?',
      fr: 'de qui est-ce que le chat vient ?',
      ja: '猫は誰から来ますか？',
    });
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'source', undefined, true))).toEqual({
      en: 'who does the cat run from?',
      it: 'da chi corre via il gatto?',
      fr: 'loin de qui est-ce que le chat court ?', // running away from is loin de, as the statement's
      de: 'von wem läuft der Kater?',
      es: '¿lejos de quién corre el gato?',
      ja: '猫は誰から走りますか？',
      pt: 'longe de quem o gato corre?',
    });
  });

  test('the stranded preposition stays in its own slot, ahead of the complements after it', () => {
    const plan = about(clause(np('MAN'), 'CUT', { directObject: np('BOOK'), complements: { locative: { phrase: np('HOUSE') } } }), 'instrumental');
    expect(sayAll(plan)).toEqual({
      en: 'what does the man cut the book with in the house?',
      it: 'con che cosa taglia il libro nella casa l\'uomo?',
      fr: 'avec quoi est-ce que l\'homme coupe le livre dans la maison ?',
      de: 'womit schneidet der Mann das Buch im Haus?',
      es: '¿con qué corta el hombre el libro en la casa?',
      ja: '男は何で家で本を切りますか？',
      pt: 'com que o homem corta o livro na casa?',
    });
  });

  test('the tenses and the copula keep E6\'s orders', () => {
    expect(sayAll(about(clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { tense: 'past' } }), 'locative', path('under'))))
      .toEqual({
        en: 'what did the cat eat the food under?',
        it: 'sotto che cosa mangiò il cibo il gatto?',
        fr: 'sous quoi est-ce que le chat mangea la nourriture ?',
        de: 'worunter fraß der Kater das Essen?',
        es: '¿debajo de qué comió el gato la comida?',
        ja: '猫は何の下で食べ物を食べましたか？',
        pt: 'debaixo de que o gato comeu a comida?',
      });
    expect(sayAll(about(clause(np('CAT'), 'BE'), 'locative', path('under')))).toEqual({
      en: 'what is the cat under?',
      it: 'sotto che cosa è il gatto?',
      fr: 'sous quoi est-ce que le chat est ?',
      de: 'worunter ist der Kater?',
      es: '¿debajo de qué está el gato?', // the place asked about still selects estar
      ja: '猫は何の下にいますか？',
      pt: 'debaixo de que o gato está?',
    });
  });

  test('negation, over a place and over the negative cause', () => {
    expect(sayAll(about(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true } }), 'locative', path('under')))).toEqual({
      en: 'what does the cat not eat under?',
      it: 'sotto che cosa non mangia il gatto?',
      fr: 'sous quoi est-ce que le chat ne mange pas ?',
      de: 'worunter frisst der Kater nicht?',
      es: '¿debajo de qué no come el gato?',
      ja: '猫は何の下で食べませんか？',
      pt: 'debaixo de que o gato não come?',
    });
    expect(sayAll(about(clause(np('CAT'), 'RUN', { verbPhrase: { tense: 'past', negative: true } }), 'cause', sentiment('negative')))).toEqual({
      en: 'through whose fault did the cat not run?',
      it: 'per colpa di chi non corse il gatto?',
      fr: 'par la faute de qui est-ce que le chat ne courut pas ?',
      de: 'durch wessen Schuld lief der Kater nicht?',
      es: '¿por culpa de quién no corrió el gato?',
      ja: '猫は誰のせいで走りませんでしたか？',
      pt: 'por culpa de quem o gato não correu?',
    });
  });

  test('through, between and against', () => {
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('through')))).toEqual({
      en: 'what does the cat eat through?',
      it: 'attraverso che cosa mangia il gatto?',
      fr: 'à travers quoi est-ce que le chat mange ?',
      de: 'wodurch frisst der Kater?',
      es: '¿por dónde come el gato?', // "por qué" would be why, as on the route
      ja: '猫は何を通って食べますか？',
      pt: 'por onde o gato come?',
    });
    // zwischen has no wo- compound
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('between'))).de).toBe('zwischen was frisst der Kater?');
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('against'))).de).toBe('woran frisst der Kater?');
  });

  test('a route with a path of its own', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'route', path('under')))).toEqual({
      en: 'what does the cat run under?',
      it: 'sotto che cosa corre il gatto?',
      fr: 'sous quoi est-ce que le chat court ?',
      de: 'worunter läuft der Kater?',
      es: '¿debajo de qué corre el gato?',
      ja: '猫は何の下を走りますか？', // the route's を on the place noun, not どこを
      pt: 'debaixo de que o gato corre?',
    });
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'route', path('over')))).toEqual({
      en: 'what does the cat run over?',
      it: 'sopra che cosa corre il gatto?',
      fr: 'par-dessus quoi est-ce que le chat court ?',
      de: 'worüber läuft der Kater?',
      es: '¿por encima de qué corre el gato?',
      ja: '猫は何の上を走りますか？',
      pt: 'por cima de que o gato corre?',
    });
  });

  test('a thing where the pinned rows ask a person, and back', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'comitative'))).toEqual({
      en: 'what does the cat run with?',
      it: 'con che cosa corre il gatto?',
      fr: 'avec quoi est-ce que le chat court ?',
      de: 'womit läuft der Kater?',
      es: '¿con qué corre el gato?',
      ja: '猫は何と走りますか？',
      pt: 'com que o gato corre?',
    });
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'cause', sentiment('positive')))).toEqual({
      en: 'what does the cat run thanks to?',
      it: 'grazie a che cosa corre il gatto?',
      fr: 'grâce à quoi est-ce que le chat court ?',
      de: 'dank was läuft der Kater?', // dank has no compound (P09-E15)
      es: '¿gracias a qué corre el gato?',
      ja: '猫は何のおかげで走りますか？',
      pt: 'graças a que o gato corre?',
    });
  });

  test('the resultative, a modal and a dropped pronoun subject keep E6\'s orders', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN', { verbPhrase: { aspect: 'resultative' } }), 'comitative', undefined, true))).toEqual({
      en: 'who has the cat run with?',
      it: 'con chi ha corso il gatto?',
      fr: 'avec qui est-ce que le chat a couru ?',
      de: 'mit wem ist der Kater gelaufen?',
      es: '¿con quién ha corrido el gato?',
      ja: '猫は誰と走りましたか？',
      pt: 'com quem o gato correu?',
    });
    expect(sayAll(about(clause(np('CAT'), 'RUN', { verbPhrase: { modals: ['CAN'] } }), 'comitative', undefined, true))).toEqual({
      en: 'who can the cat run with?',
      it: 'con chi può correre il gatto?',
      fr: 'avec qui est-ce que le chat peut courir ?',
      de: 'mit wem kann der Kater laufen?',
      es: '¿con quién puede correr el gato?',
      ja: '猫は誰と走ることができますか？',
      pt: 'com quem o gato pode correr?',
    });
    expect(sayAll(about(clause(np('FIRST_PERSON'), 'EAT'), 'locative', path('under')))).toEqual({
      en: 'what do I eat under?',
      it: 'sotto che cosa mangio?',
      fr: 'sous quoi est-ce que je mange ?',
      de: 'worunter esse ich?',
      es: '¿debajo de qué como?',
      ja: '私は何の下で食べますか？',
      pt: 'debaixo de que como?',
    });
  });
});

// A passive question names the plan's **active** slots, as a relative's head does (P09-E16): the
// object gap is the patient, which the passive makes the subject, and the subject gap the agent,
// which it makes the by-phrase.
const passive = { voice: 'passive' } as const;

describe('the passive question', () => {
  test('the patient: what is eaten by the cat?', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: passive }), 'directObject'))).toEqual({
      en: 'what is eaten by the cat?', // a subject question now: no inversion
      it: 'che cosa è mangiato dal gatto?',
      fr: "qu'est-ce qui est mangé par le chat ?",
      de: 'was wird vom Kater gefressen?', // the sense is still the (animal) agent's
      es: '¿qué es comido por el gato?',
      ja: '何が猫に食べられますか？', // が, as E6's subject gap
      pt: 'o que é comido pelo gato?',
    });
  });

  test('the agent: who is the food eaten by?', () => {
    expect(sayAll(ask(clause(someone, 'EAT', { verbPhrase: passive, directObject: np('FOOD') }), 'subject', true))).toEqual({
      en: 'who is the food eaten by?', // English strands its by
      it: 'da chi è mangiato il cibo?',
      fr: 'par qui est-ce que la nourriture est mangée ?',
      de: 'von wem wird das Essen gegessen?', // a person asked about: gegessen, not gefressen
      es: '¿por quién es comida la comida?',
      ja: '食べ物は誰に食べられますか？', // the question keeps the passive, as the relative does not
      pt: 'por quem a comida é comida?',
    });
  });

  test('another gap: where is the food eaten by the cat?', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: passive, directObject: np('FOOD') }), 'locative'))).toEqual({
      en: 'where is the food eaten by the cat?',
      it: "dov'è mangiato dal gatto il cibo?", // E6's subject-last order, and its elision
      fr: 'où est-ce que la nourriture est mangée par le chat ?',
      de: 'wo wird das Essen vom Kater gefressen?',
      es: '¿dónde es comida la comida por el gato?',
      ja: '食べ物は猫にどこで食べられますか？',
      pt: 'onde a comida é comida pelo gato?',
    });
  });

  test('a plural patient asked about stays singular, and a person asked about is who', () => {
    expect(sayAll(ask(clause(np('CAT', { number: 'plural' }), 'EAT', { verbPhrase: passive }), 'directObject'))).toEqual({
      en: 'what is eaten by the cats?',
      it: 'che cosa è mangiato dai gatti?',
      fr: "qu'est-ce qui est mangé par les chats ?",
      de: 'was wird von den Katern gefressen?',
      es: '¿qué es comido por los gatos?',
      ja: '何が猫に食べられますか？',
      pt: 'o que é comido pelos gatos?',
    });
    expect(sayAll(ask(clause(np('CAT'), 'SEE', { verbPhrase: passive }), 'directObject', true))).toEqual({
      en: 'who is seen by the cat?',
      it: 'chi è visto dal gatto?',
      fr: 'qui est vu par le chat ?',
      de: 'wer wird vom Kater gesehen?',
      es: '¿quién es visto por el gato?',
      ja: '誰が猫に見られますか？',
      pt: 'quem é visto pelo gato?',
    });
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { ...passive, tense: 'past' } }), 'directObject'))).toEqual({
      en: 'what was eaten by the cat?',
      it: 'che cosa fu mangiato dal gatto?',
      fr: "qu'est-ce qui fut mangé par le chat ?",
      de: 'was wurde vom Kater gefressen?',
      es: '¿qué fue comido por el gato?',
      ja: '何が猫に食べられましたか？',
      pt: 'o que foi comido pelo gato?',
    });
  });

  test('an inanimate agent: wovon, and por qué cosa where por qué is why', () => {
    expect(sayAll(ask(clause(someone, 'DESTROY', { verbPhrase: passive, directObject: np('HOUSE') }), 'subject'))).toEqual({
      en: 'what is the house destroyed by?',
      it: 'da che cosa è distrutta la casa?',
      fr: 'par quoi est-ce que la maison est détruite ?',
      de: 'wovon wird das Haus zerstört?',
      es: '¿por qué cosa es destruida la casa?',
      ja: '家は何に破壊されますか？',
      pt: 'por que coisa a casa é destruída?',
    });
  });

  test('the stranded by keeps the by-phrase\'s slot', () => {
    const plan = ask(clause(someone, 'EAT', { verbPhrase: passive, directObject: np('FOOD'), complements: { locative: { phrase: np('HOUSE') } } }), 'subject', true);
    expect(sayAll(plan)).toEqual({
      en: 'who is the food eaten by in the house?', // ahead of an adjunct (D2); after an argument is A282
      it: 'da chi è mangiato nella casa il cibo?',
      fr: 'par qui est-ce que la nourriture est mangée dans la maison ?',
      de: 'von wem wird das Essen im Haus gegessen?',
      es: '¿por quién es comida la comida en la casa?',
      ja: '食べ物は誰に家で食べられますか？',
      pt: 'por quem a comida é comida na casa?',
    });
  });

  test('a generic agent drops under a complement gap: where is the food eaten?', () => {
    expect(sayAll(ask(clause(someone, 'EAT', { verbPhrase: passive, directObject: np('FOOD') }), 'locative'))).toEqual({
      en: 'where is the food eaten?',
      it: "dov'è mangiato il cibo?",
      fr: 'où est-ce que la nourriture est mangée ?',
      de: 'wo wird das Essen gegessen?',
      es: '¿dónde es comida la comida?',
      pt: 'onde a comida é comida?',
      ja: '食べ物はどこで食べられますか？',
    });
  });

  test('P09-E15\'s gaps fall out under the passive: a complement gap is unchanged by the remap', () => {
    expect(sayAll(about(clause(np('CAT'), 'EAT', { verbPhrase: passive, directObject: np('FOOD') }), 'locative', path('under')))).toEqual({
      en: 'what is the food eaten by the cat under?',
      it: 'sotto che cosa è mangiato dal gatto il cibo?',
      fr: 'sous quoi est-ce que la nourriture est mangée par le chat ?',
      de: 'worunter wird das Essen vom Kater gefressen?',
      es: '¿debajo de qué es comida la comida por el gato?',
      ja: '食べ物は猫に何の下で食べられますか？',
      pt: 'debaixo de que a comida é comida pelo gato?',
    });
  });

  test('P09-E14\'s possessor inside the patient is a subject possessor question; inside the agent it is refused', () => {
    const food = clause(np('CAT'), 'EAT', { verbPhrase: passive, directObject: np('FOOD') });
    expect(sayAll(whose(food, 'directObject'))).toEqual({
      en: 'whose food is eaten by the cat?',
      it: 'il cibo di chi è mangiato dal gatto?',
      fr: 'la nourriture de qui est mangée par le chat ?',
      de: 'wessen Essen wird vom Kater gefressen?',
      es: '¿la comida de quién es comida por el gato?',
      ja: '誰の食べ物が猫に食べられますか？',
      pt: 'a comida de quem é comida pelo gato?',
    });
    expect(() => translateAll(whose(food, 'subject'))).toThrow(/agent.*P09-E16/);
  });

  test('the agent in the past, and over a plural patient', () => {
    expect(sayAll(ask(clause(someone, 'EAT', { verbPhrase: { ...passive, tense: 'past' }, directObject: np('FOOD') }), 'subject', true))).toEqual({
      en: 'who was the food eaten by?',
      it: 'da chi fu mangiato il cibo?',
      fr: 'par qui est-ce que la nourriture fut mangée ?',
      de: 'von wem wurde das Essen gegessen?',
      es: '¿por quién fue comida la comida?',
      ja: '食べ物は誰に食べられましたか？',
      pt: 'por quem a comida foi comida?',
    });
    // The patient is a real subject here, so the auxiliary and the participle agree with it.
    expect(sayAll(ask(clause(someone, 'WRITE', { verbPhrase: passive, directObject: np('BOOK', { number: 'plural' }) }), 'subject', true))).toEqual({
      en: 'who are the books written by?',
      it: 'da chi sono scritti i libri?',
      fr: 'par qui est-ce que les livres sont écrits ?',
      de: 'von wem werden die Bücher geschrieben?',
      es: '¿por quién son escritos los libros?',
      ja: '本は誰に書かれますか？',
      pt: 'por quem os livros são escritos?',
    });
    expect(sayAll(ask(clause(someone, 'SEE', { verbPhrase: passive, directObject: np('WOMAN', { number: 'plural' }) }), 'subject', true))).toEqual({
      en: 'who are the women seen by?',
      it: 'da chi sono viste le donne?',
      fr: 'par qui est-ce que les femmes sont vues ?',
      de: 'von wem werden die Frauen gesehen?',
      es: '¿por quién son vistas las mujeres?',
      ja: '女は誰に見られますか？',
      pt: 'por quem as mulheres são vistas?',
    });
  });

  test('negation, over either gap', () => {
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { ...passive, negative: true } }), 'directObject'))).toEqual({
      en: 'what is not eaten by the cat?',
      it: 'che cosa non è mangiato dal gatto?',
      fr: "qu'est-ce qui n'est pas mangé par le chat ?",
      de: 'was wird vom Kater nicht gefressen?',
      es: '¿qué no es comido por el gato?',
      ja: '何が猫に食べられませんか？',
      pt: 'o que não é comido pelo gato?',
    });
    expect(sayAll(ask(clause(someone, 'EAT', { verbPhrase: { ...passive, negative: true }, directObject: np('FOOD') }), 'subject', true))).toEqual({
      en: 'who is the food not eaten by?',
      it: 'da chi non è mangiato il cibo?',
      fr: 'par qui est-ce que la nourriture n\'est pas mangée ?',
      de: 'von wem wird das Essen nicht gegessen?',
      es: '¿por quién no es comida la comida?',
      ja: '食べ物は誰に食べられませんか？',
      pt: 'por quem a comida não é comida?',
    });
  });

  test('the agent under the resultative and a modal', () => {
    const eaten = (verbPhrase: Partial<VerbPhrase>) =>
      ask(clause(someone, 'EAT', { verbPhrase: { ...passive, ...verbPhrase }, directObject: np('FOOD') }), 'subject', true);
    expect(sayAll(eaten({ aspect: 'resultative' }))).toEqual({
      en: 'who has the food been eaten by?',
      it: 'da chi è stato mangiato il cibo?',
      fr: 'par qui est-ce que la nourriture a été mangée ?',
      de: 'von wem ist das Essen gegessen worden?',
      es: '¿por quién ha sido comida la comida?',
      ja: '食べ物は誰に食べられましたか？',
      pt: 'por quem a comida foi comida?',
    });
    expect(sayAll(eaten({ modals: ['MUST'] }))).toEqual({
      en: 'who must the food be eaten by?',
      it: 'da chi deve essere mangiato il cibo?',
      fr: 'par qui est-ce que la nourriture doit être mangée ?',
      de: 'von wem muss das Essen gegessen werden?',
      es: '¿por quién debe ser comida la comida?',
      ja: '食べ物は誰に食べられる必要がありますか？',
      pt: 'por quem a comida deve ser comida?',
    });
  });

  test('a pronoun patient: who am I seen by?', () => {
    expect(sayAll(ask(clause(someone, 'SEE', { verbPhrase: passive, directObject: np('FIRST_PERSON') }), 'subject', true))).toEqual({
      en: 'who am I seen by?',
      it: 'da chi sono visto?',
      fr: 'par qui est-ce que je suis vu ?',
      de: 'von wem werde ich gesehen?',
      es: '¿por quién soy visto?',
      ja: '私は誰に見られますか？',
      pt: 'por quem sou visto?',
    });
  });

  test('refused: a passive over an object the language takes with a preposition', () => {
    // fragen takes its question with nach, so German has no passive to ask it through.
    expect(() => translateAll(ask(clause(np('MAN'), 'ASK', { verbPhrase: passive }), 'directObject'))).toThrow(/passive in de.*P09-E16/);
  });
});

describe('wh-questions: not built yet', () => {
  test('the gaps with no question, each refused by name, and the passive', () => {
    const eats = clause(np('CAT'), 'EAT');
    for (const value of ['ago', 'after', 'before', 'during', 'between'] as const) {
      expect(() => translateAll(about(eats, 'temporal', [{ kind: 'temporal', value }]))).toThrow(new RegExp(`temporal.*${value}`));
    }
    expect(() => translateAll(ask(eats, 'purpose'))).toThrow(/purpose/);
    expect(() => translateAll(ask(clause(np('CAT'), 'BECOME'), 'predicative'))).toThrow(/predicative/);
    expect(() => translateAll(ask(eats, 'objectPredicative'))).toThrow(/objectPredicative/);
    expect(() => translateAll(about(eats, 'instrumental', [{ kind: 'abstraction', value: 'process' }]))).toThrow(/process.*how/);
  });

  test('the passive the plan asks of a verb that has none', () => {
    expect(() => translateAll(ask(clause(np('CAT'), 'RUN', { verbPhrase: { voice: 'passive' } }), 'locative'))).toThrow(/passive.*P09-E16/);
  });
});

// A276. The Italian ablative particle "via" belongs to the verb ("il gatto viene via dalla donna"),
// but an animate source question fronts the whole complement, the particle with it. It should stay
// behind the verb, as a phrasal verb's particle does.
describe('known bugs: an Italian animate source question fronts the ablative via (A276)', () => {
  test.each([
    ['COME', 'da chi viene via il gatto?'],
    ['RUN', 'da chi corre via il gatto?'],
    ['GO', 'da chi va via il gatto?'],
  ])('%s', (verb, want) => {
    expect(sayAll(about(clause(np('CAT'), verb), 'source', undefined, true)).it).toBe(want);
  });

  test('the embedded question (P09-E17) leaves it behind the verb too', () => {
    const from = (verb: string) =>
      ({ subject: np('CAT'), verbPhrase: { verb }, questionRole: 'source', questionAnimate: true }) as const;
    const comes = from('COME');
    const runs = from('RUN');
    expect(say(clause(np('MAN'), 'ASK', { contentObject: comes }), 'it')).toBe("l'uomo chiede da chi viene via il gatto.");
    expect(say(clause(np('MAN'), 'KNOW', { contentObject: runs }), 'it')).toBe("l'uomo sa da chi corre via il gatto.");
  });

  test('regression: the inanimate source is the adverb da dove, with no particle, and the statement keeps its via', () => {
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'source')).it).toBe('da dove corre il gatto?');
    expect(sayAll(about(clause(np('CAT'), 'COME'), 'source')).it).toBe('da dove viene il gatto?');
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('WOMAN') } } })).it).toBe('il gatto viene via dalla donna.');
  });
});

// A280. A Japanese passive whose recipient is already に makes its agent によって (本は女によって男に
// あげられます). The terminus asked about is 誰に / 何に in that same clause, but the agent's particle is
// chosen before the asked slot joins the complements, so the clause says に twice.
describe('known bugs: a Japanese passive terminus question doubles に (A280)', () => {
  const given = (questionAnimate?: boolean) =>
    ask(clause(np('WOMAN'), 'GIVE', { verbPhrase: passive, directObject: np('BOOK') }), 'terminus', questionAnimate);

  test('who is the book given to by the woman: 女によって誰に', () => {
    expect(sayAll(given(true)).ja).toBe('本は女によって誰にあげられますか？');
  });

  test('what is the book given to by the woman: 女によって何に', () => {
    expect(sayAll(given()).ja).toBe('本は女によって何にあげられますか？');
  });

  test('regression: the other six, the statement\'s によって and the agentless question', () => {
    expect(sayAll(given(true))).toMatchObject({
      en: 'who is the book given by the woman to?',
      it: 'a chi è dato dalla donna il libro?',
      fr: 'à qui est-ce que le livre est donné par la femme ?',
      de: 'wem wird das Buch von der Frau gegeben?',
      es: '¿a quién es dado el libro por la mujer?',
      pt: 'a quem o livro é dado pela mulher?',
    });
    expect(say(clause(np('WOMAN'), 'GIVE', { verbPhrase: passive, directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } } }), 'ja'))
      .toBe('本は女によって男にあげられます。');
    expect(say(ask(clause(someone, 'GIVE', { verbPhrase: passive, directObject: np('BOOK') }), 'terminus', true), 'ja')).toBe('本は誰にあげられますか？');
  });

  test('the past keeps によって, and an asked agent beside a stated recipient takes it too', () => {
    expect(say(ask(clause(np('WOMAN'), 'GIVE', { verbPhrase: { ...passive, tense: 'past' }, directObject: np('BOOK') }), 'terminus', true), 'ja'))
      .toBe('本は女によって誰にあげられましたか？');
    expect(say(ask(clause(someone, 'GIVE', { verbPhrase: passive, directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } } }), 'subject', true), 'ja'))
      .toBe('本は誰によって男にあげられますか？');
  });
});

// A281. German `was` has no dative. A thing asked about in a dative slot — a recipient, the object of
// helfen — is asked with `wem`, as the person is; the engine writes the nominative/accusative `was`.
describe('known bugs: a German inanimate dative question asks with was (A281)', () => {
  test('the recipient: wem gibt der Mann das Buch?', () => {
    expect(sayAll(about(clause(np('MAN'), 'GIVE', { directObject: np('BOOK') }), 'terminus')).de).toBe('wem gibt der Mann das Buch?');
  });

  test('the recipient of a passive: wem wird das Buch von der Frau gegeben?', () => {
    expect(sayAll(ask(clause(np('WOMAN'), 'GIVE', { verbPhrase: passive, directObject: np('BOOK') }), 'terminus')).de)
      .toBe('wem wird das Buch von der Frau gegeben?');
  });

  test('the dative object of helfen: wem hilft der Kater?', () => {
    expect(sayAll(ask(clause(np('CAT'), 'HELP_VERB'), 'directObject')).de).toBe('wem hilft der Kater?');
  });

  test('wem in the past and over a plural subject', () => {
    expect(say(ask(clause(np('MAN'), 'GIVE', { verbPhrase: { tense: 'past' }, directObject: np('BOOK') }), 'terminus'), 'de'))
      .toBe('wem gab der Mann das Buch?');
    expect(say(ask(clause(np('CAT'), 'HELP_VERB', { verbPhrase: { tense: 'past' } }), 'directObject'), 'de')).toBe('wem half der Kater?');
    expect(say(ask(clause(np('CAT', { number: 'plural' }), 'HELP_VERB'), 'directObject'), 'de')).toBe('wem helfen die Kater?');
    // the person was already wem; the other six are unchanged
    expect(say(ask(clause(np('CAT'), 'HELP_VERB'), 'directObject', true), 'de')).toBe('wem hilft der Kater?');
    expect(sayAll(ask(clause(np('CAT'), 'HELP_VERB'), 'directObject'))).toMatchObject({
      en: 'what does the cat help?', it: 'che cosa aiuta il gatto?', fr: 'qu\'est-ce que le chat aide ?',
      es: '¿a qué ayuda el gato?', ja: '猫は何を手伝いますか？', pt: 'o que o gato ajuda?',
    });
  });

  test('regression: the other six, the statement\'s dative, and was where the slot is nominative or accusative', () => {
    expect(sayAll(about(clause(np('MAN'), 'GIVE', { directObject: np('BOOK') }), 'terminus'))).toMatchObject({
      en: 'what does the man give the book to?',
      it: 'a che cosa dà il libro l\'uomo?',
      fr: 'à quoi est-ce que l\'homme donne le livre ?',
      es: '¿a qué da el hombre el libro?',
      ja: '男は何に本をあげますか？',
      pt: 'a que o homem dá o livro?',
    });
    expect(say(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('HOUSE') } } }), 'de'))
      .toBe('der Mann gibt dem Haus das Buch.');
    expect(say(ask(clause(someone, 'HELP_VERB', { directObject: np('CAT') }), 'subject'), 'de')).toBe('was hilft dem Kater?');
    expect(say(about(clause(np('MAN'), 'ASK'), 'terminus'), 'de')).toBe('was fragt der Mann?'); // fragen's addressee is accusative
  });
});

// A282. English strands the by of a passive agent question (P09-E16 D2), but writes it where the
// by-phrase stands in the statement, ahead of the recipient: the preposition ends up between the
// participle and an argument of the verb. It belongs after the verb's arguments.
describe('known bugs: an English passive agent question strands by ahead of the recipient (A282)', () => {
  const givenToTheChild = (questionAnimate?: boolean) =>
    ask(clause(someone, 'GIVE', { verbPhrase: passive, directObject: np('BOOK'), complements: { terminus: { phrase: np('CHILD') } } }), 'subject', questionAnimate);

  test('who is the book given to the child by?', () => {
    expect(sayAll(givenToTheChild(true)).en).toBe('who is the book given to the child by?');
  });

  test('what is the book given to the child by?', () => {
    expect(sayAll(givenToTheChild()).en).toBe('what is the book given to the child by?');
  });

  test('the recipient moves ahead of by in the past, the negative, a plural patient and a pronoun', () => {
    const given = (verbPhrase: Partial<VerbPhrase>, book = np('BOOK'), recipient = np('CHILD')) =>
      say(ask(clause(someone, 'GIVE', { verbPhrase: { ...passive, ...verbPhrase }, directObject: book, complements: { terminus: { phrase: recipient } } }), 'subject', true), 'en');
    expect(given({ tense: 'past' })).toBe('who was the book given to the child by?');
    expect(given({ negative: true })).toBe('who is the book not given to the child by?');
    expect(given({}, np('BOOK', { number: 'plural' }))).toBe('who are the books given to the child by?');
    expect(given({}, np('BOOK'), np('THIRD_PERSON'))).toBe('who is the book given to him by?');
  });

  test('rule 1: an adjunct stays after the stranded by, as D2 has it', () => {
    const complements = { terminus: { phrase: np('CHILD') }, locative: { phrase: np('HOUSE') } };
    expect(say(ask(clause(someone, 'GIVE', { verbPhrase: passive, directObject: np('BOOK'), complements }), 'subject', true), 'en'))
      .toBe('who is the book given to the child by in the house?');
    expect(say(clause(np('MAN'), 'GIVE', { verbPhrase: passive, directObject: np('BOOK'), complements }), 'en'))
      .toBe('the book is given by the man to the child in the house.');
  });

  test('regression: the other six front the agent, and the statement keeps by-phrase then recipient', () => {
    expect(sayAll(givenToTheChild(true))).toMatchObject({
      it: 'da chi è dato al bambino il libro?',
      fr: 'par qui est-ce que le livre est donné à l\'enfant ?',
      de: 'von wem wird das Buch dem Kind gegeben?',
      es: '¿por quién es dado el libro al niño?',
      ja: '本は誰によって子供にあげられますか？',
      pt: 'por quem o livro é dado à criança?',
    });
    expect(say(clause(np('MAN'), 'GIVE', { verbPhrase: passive, directObject: np('BOOK'), complements: { terminus: { phrase: np('CHILD') } } }), 'en'))
      .toBe('the book is given by the man to the child.');
  });
});

// P09-E28 D3: NEVER in a question that is not denied is *ever* — its `interrogative` form, a positive
// word in NEVER's own slot. Japanese has no adverb for it (〜たことがある is deferred) and asks with
// いつか "at some time" meanwhile (D4). A negated question keeps *never*.
describe('P09-E28: ever — NEVER in a question', () => {
  const the = (concept: string) => np(concept, { definiteness: 'definite' });
  const eats = (verbPhrase: Partial<VerbPhrase>, object = false): PhrasePlan =>
    clause(the('CAT'), 'EAT', { ...(object ? { directObject: the('FOOD') } : {}), verbPhrase: { modifier: 'NEVER', ...verbPhrase } });
  const yesNo = (plan: PhrasePlan): PhrasePlan => ({ ...plan, interrogative: true });

  test('the perfect: has the cat ever eaten?', () => {
    expect(sayAll(yesNo(eats({ aspect: 'resultative' })))).toEqual({
      en: 'has the cat ever eaten?', it: 'il gatto ha mai mangiato?', fr: 'est-ce que le chat a déjà mangé ?',
      de: 'hat der Kater je gefressen?', es: '¿el gato ha comido alguna vez?', ja: '猫はいつか食べましたか？',
      pt: 'o gato comeu alguma vez?',
    });
  });

  test('the present and the past', () => {
    expect(sayAll(yesNo(eats({}, true)))).toEqual({
      en: 'does the cat ever eat the food?', it: 'il gatto mangia mai il cibo?', fr: 'est-ce que le chat mange déjà la nourriture ?',
      de: 'frisst der Kater je das Essen?', es: '¿el gato come alguna vez la comida?', ja: '猫は食べ物をいつか食べますか？',
      pt: 'o gato come alguma vez a comida?',
    });
    expect(sayAll(yesNo(eats({ tense: 'past' })))).toMatchObject({
      en: 'did the cat ever eat?', de: 'fraß der Kater je?', es: '¿el gato comió alguna vez?', ja: '猫はいつか食べましたか？',
    });
  });

  test('a wh-question and an indirect question ask with it too', () => {
    expect(sayAll(ask(eats({ aspect: 'resultative' }), 'directObject'))).toMatchObject({
      en: 'what has the cat ever eaten?', it: 'che cosa ha mai mangiato il gatto?', de: 'was hat der Kater je gefressen?',
    });
    expect(sayAll(clause(the('DOG'), 'ASK', { contentObject: yesNo(eats({ aspect: 'resultative' })) as ContentClause }))).toMatchObject({
      en: 'the dog asks whether the cat has ever eaten.', de: 'der Hund fragt, ob der Kater je gefressen hat.',
      es: 'el perro pregunta si el gato ha comido alguna vez.',
    });
  });

  test('a negated question and a statement keep never', () => {
    expect(sayAll(yesNo(eats({ negative: true })))).toMatchObject({
      en: 'does the cat never eat?', it: 'il gatto non mangia mai?', de: 'frisst der Kater nie?', ja: '猫は決して食べませんか？',
    });
    expect(sayAll(eats({}))).toEqual({
      en: 'the cat never eats.', it: 'il gatto non mangia mai.', fr: 'le chat ne mange jamais.', de: 'der Kater frisst nie.',
      es: 'el gato nunca come.', ja: '猫は決して食べません。', pt: 'o gato nunca come.',
    });
  });
});

// A374. The route asked about a person (E15, `questionAnimate`) reads as another relation in three
// languages: es "¿por quién corre el gato?" and pt "por quem o gato corre?" are *for whom*, and ja
// 猫は誰を走りますか runs a person as a path. The canvas withholds the who chip on the route (P09-E53 D3),
// so only a plan reaches it. Decision for the fixer: the path words pinned here, or refuse the plan.
describe('known bugs: an animate route question reads as another relation (A374)', () => {
  const through = () => sayAll(about(clause(np('CAT'), 'RUN'), 'route', undefined, true));

  test.fails('es, pt and ja ask through whom', () => {
    expect(through()).toMatchObject({
      es: '¿a través de quién corre el gato?', // now: "¿por quién corre el gato?"
      pt: 'através de quem o gato corre?', // now: "por quem o gato corre?"
      ja: '猫は誰の中を通って走りますか？', // now: "猫は誰を走りますか？"
    });
  });

  test('the other four, and the inanimate route', () => {
    expect(through()).toMatchObject({
      en: 'who does the cat run through?', it: 'attraverso chi corre il gatto?',
      fr: 'à travers qui est-ce que le chat court ?', de: 'durch wen läuft der Kater?',
    });
    expect(sayAll(about(clause(np('CAT'), 'RUN'), 'route'))).toMatchObject({ es: '¿por dónde corre el gato?', ja: '猫はどこを走りますか？' });
  });
});
