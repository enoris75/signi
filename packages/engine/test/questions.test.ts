import { describe, expect, test } from 'vitest';
import type { PhrasePlan, Specifier } from '@signi/shared';
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

// A complement question keeps its relation (P09-E15): `questionSpecifiers` is the relation, and
// `questionAnimate` the answer's *who* against *what* — which, over a direction or a source, also
// chooses between the adverb (*where from*) and the complement path (*who … from*).
const about = (plan: PhrasePlan, questionRole: PhrasePlan['questionRole'], questionSpecifiers?: Specifier[], questionAnimate?: boolean): PhrasePlan =>
  ({ ...ask(plan, questionRole, questionAnimate), ...(questionSpecifiers ? { questionSpecifiers } : {}) });
const path = (value: 'under' | 'around' | 'behind' | 'on'): Specifier[] => [{ kind: 'path', value }];
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
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('behind')))).toMatchObject({ de: 'wohinter frisst der Kater?', ja: '猫は何の後ろで食べますか？' });
    expect(sayAll(about(clause(np('CAT'), 'EAT'), 'locative', path('on')))).toMatchObject({ de: 'worauf frisst der Kater?', it: 'su che cosa mangia il gatto?' });
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
    expect(sayAll(about(clause(np('MAN'), 'SPEAK'), 'topic', undefined, true))).toMatchObject({ de: 'über wen spricht der Mann?', it: 'di chi parla l\'uomo?' });
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
    expect(sayAll(about(clause(np('CAT'), 'COME'), 'source', undefined, true))).toMatchObject({
      en: 'who does the cat come from?',
      de: 'von wem kommt der Kater?',
      fr: 'de qui est-ce que le chat vient ?',
      ja: '猫は誰から来ますか？',
    });
  });

  test('the stranded preposition stays in its own slot, ahead of the complements after it', () => {
    const plan = about(clause(np('MAN'), 'CUT', { directObject: np('BOOK'), complements: { locative: { phrase: np('HOUSE') } } }), 'instrumental');
    expect(sayAll(plan)).toMatchObject({
      en: 'what does the man cut the book with in the house?',
      de: 'womit schneidet der Mann das Buch im Haus?',
      ja: '男は何で家で本を切りますか？',
    });
  });

  test('the tenses and the copula keep E6\'s orders', () => {
    expect(sayAll(about(clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { tense: 'past' } }), 'locative', path('under'))))
      .toMatchObject({
        en: 'what did the cat eat the food under?',
        it: 'sotto che cosa mangiò il cibo il gatto?',
        de: 'worunter fraß der Kater das Essen?',
        es: '¿debajo de qué comió el gato la comida?',
      });
    expect(sayAll(about(clause(np('CAT'), 'BE'), 'locative', path('under')))).toMatchObject({
      en: 'what is the cat under?',
      es: '¿debajo de qué está el gato?', // the place asked about still selects estar
      ja: '猫は何の下にいますか？',
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
    expect(sayAll(ask(clause(np('CAT', { number: 'plural' }), 'EAT', { verbPhrase: passive }), 'directObject'))).toMatchObject({
      en: 'what is eaten by the cats?',
      it: 'che cosa è mangiato dai gatti?',
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
    expect(sayAll(ask(clause(np('CAT'), 'EAT', { verbPhrase: { ...passive, tense: 'past' } }), 'directObject'))).toMatchObject({
      en: 'what was eaten by the cat?',
      de: 'was wurde vom Kater gefressen?',
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
    expect(sayAll(plan)).toMatchObject({ en: 'who is the food eaten by in the house?', de: 'von wem wird das Essen im Haus gegessen?' });
  });

  test('a generic agent drops under a complement gap: where is the food eaten?', () => {
    expect(sayAll(ask(clause(someone, 'EAT', { verbPhrase: passive, directObject: np('FOOD') }), 'locative'))).toMatchObject({
      en: 'where is the food eaten?',
      de: 'wo wird das Essen gegessen?',
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
    expect(sayAll(whose(food, 'directObject'))).toMatchObject({
      en: 'whose food is eaten by the cat?',
      de: 'wessen Essen wird vom Kater gefressen?',
      it: 'il cibo di chi è mangiato dal gatto?',
      ja: '誰の食べ物が猫に食べられますか？',
    });
    expect(() => translateAll(whose(food, 'subject'))).toThrow(/agent.*P09-E16/);
  });
});

describe('wh-questions: not built yet', () => {
  test('the gaps with no question, each refused by name, and the passive', () => {
    const eats = clause(np('CAT'), 'EAT');
    for (const value of ['ago', 'after', 'before', 'during'] as const) {
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
