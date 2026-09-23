import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan, SubordinatingConjunction } from '@signi/shared';
import { SUBORDINATING_CONJUNCTIONS } from '@signi/shared';
import { np, say, sayAll } from './harness.js';

// P09-E4: an adverbial clause — a finite clause a subordinating conjunction attaches to another as an
// adjunct. Nothing governs it, so the conjunction alone decides its mood; it follows the main clause in
// the six European languages (German behind a comma, verb-final) and precedes the predicate in
// Japanese, closed by a postposed conjunction on the plain form.

const runs = (conjunction: SubordinatingConjunction, extra: Partial<PhrasePlan> = {}, clause?: PhrasePlan['contentSubject']): PhrasePlan => ({
  subject: np('MAN'),
  verbPhrase: { verb: 'RUN' },
  adverbialClause: { conjunction, clause: clause ?? { subject: np('CAT'), verbPhrase: { verb: 'EAT' } } },
  ...extra,
});

describe('the five conjunctions in the seven languages', () => {
  test.each<[SubordinatingConjunction, Record<LanguageCode, string>]>([
    ['when', {
      en: 'the man runs when the cat eats.', it: "l'uomo corre quando il gatto mangia.",
      fr: "l'homme court quand le chat mange.", de: 'der Mann läuft, wenn der Kater frisst.',
      es: 'el hombre corre cuando el gato come.', ja: '男は猫が食べる時に走ります。', pt: 'o homem corre quando o gato come.',
    }],
    ['while', {
      en: 'the man runs while the cat eats.', it: "l'uomo corre mentre il gatto mangia.",
      fr: "l'homme court pendant que le chat mange.", de: 'der Mann läuft, während der Kater frisst.',
      es: 'el hombre corre mientras el gato come.', ja: '男は猫が食べている間に走ります。', pt: 'o homem corre enquanto o gato come.',
    }],
    ['because', {
      en: 'the man runs because the cat eats.', it: "l'uomo corre perché il gatto mangia.",
      fr: "l'homme court parce que le chat mange.", de: 'der Mann läuft, weil der Kater frisst.',
      es: 'el hombre corre porque el gato come.', ja: '男は猫が食べるので走ります。', pt: 'o homem corre porque o gato come.',
    }],
    ['after', {
      en: 'the man runs after the cat eats.', it: "l'uomo corre dopo che il gatto mangia.",
      fr: "l'homme court après que le chat mange.", de: 'der Mann läuft, nachdem der Kater frisst.',
      es: 'el hombre corre después de que el gato come.', ja: '男は猫が食べた後で走ります。', pt: 'o homem corre depois que o gato come.',
    }],
    ['before', {
      en: 'the man runs before the cat eats.', it: "l'uomo corre prima che il gatto mangi.",
      fr: "l'homme court avant que le chat mange.", de: 'der Mann läuft, bevor der Kater frisst.',
      es: 'el hombre corre antes de que el gato coma.', ja: '男は猫が食べる前に走ります。', pt: 'o homem corre antes que o gato coma.',
    }],
  ])('%s', (conjunction, rendered) => {
    expect(sayAll(runs(conjunction))).toEqual(rendered);
  });

  // D5: "during" introduces a noun phrase, not a clause, so it is not a conjunction here.
  test('there is no "during"', () => {
    expect(SUBORDINATING_CONJUNCTIONS).toEqual(['when', 'while', 'because', 'after', 'before']);
  });
});

describe('German', () => {
  // Every subordinate clause closes on its finite verb, behind whatever the clause holds; the main
  // clause ahead of it keeps its V2 order.
  test.each<[SubordinatingConjunction, string]>([
    ['when', 'der Mann läuft, wenn der Kater das Essen nicht frisst.'],
    ['while', 'der Mann läuft, während der Kater das Essen nicht frisst.'],
    ['because', 'der Mann läuft, weil der Kater das Essen nicht frisst.'],
    ['after', 'der Mann läuft, nachdem der Kater das Essen nicht frisst.'],
    ['before', 'der Mann läuft, bevor der Kater das Essen nicht frisst.'],
  ])('%s is verb-final', (conjunction, rendered) => {
    expect(say(runs(conjunction, {}, {
      subject: np('CAT'), verbPhrase: { verb: 'EAT', negative: true }, directObject: np('FOOD', { definiteness: 'definite' }),
    }), 'de')).toBe(rendered);
  });

  test('a modal closes the clause behind the infinitive', () => {
    expect(say(runs('because', {}, { subject: np('CAT'), verbPhrase: { verb: 'EAT', modals: ['MUST'] } }), 'de'))
      .toBe('der Mann läuft, weil der Kater fressen muss.');
  });

  // "wenn" in the past reads "whenever"; a single narrated event is "als".
  test('a past "when" is "als"', () => {
    expect(say(runs('when', { verbPhrase: { verb: 'RUN', tense: 'past' } }, {
      subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past' },
    }), 'de')).toBe('der Mann lief, als der Kater fraß.');
  });
});

describe('the Romance subjunctive after "before"', () => {
  // D4: prima che / avant que / antes de que / antes que govern the subjunctive, a fact about the
  // conjunction; when / after / because take the indicative.
  test('before takes the present subjunctive, the other four the indicative', () => {
    expect(sayAll(runs('before'))).toMatchObject({
      it: "l'uomo corre prima che il gatto mangi.", fr: "l'homme court avant que le chat mange.",
      es: 'el hombre corre antes de que el gato coma.', pt: 'o homem corre antes que o gato coma.',
    });
    expect(say(runs('before', {}, { subject: np('CAT'), verbPhrase: { verb: 'RUN' } }), 'fr')).toBe("l'homme court avant que le chat coure.");
    for (const conjunction of ['when', 'while', 'because', 'after'] as const) {
      expect(say(runs(conjunction), 'es')).toMatch(/el gato come\.$/);
      expect(say(runs(conjunction), 'it')).toMatch(/il gatto mangia\.$/);
    }
  });

  // A past event under it takes the imperfect subjunctive where the language speaks one; French keeps
  // the present, its imperfect subjunctive being literary.
  test('a past clause under before is in the imperfect subjunctive, except in French', () => {
    const past = runs('before', { verbPhrase: { verb: 'RUN', tense: 'past' } }, {
      subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past' }, directObject: np('FOOD'),
    });
    expect(sayAll(past)).toMatchObject({
      it: "l'uomo corse prima che il gatto mangiasse il cibo.",
      fr: "l'homme courut avant que le chat mange la nourriture.",
      es: 'el hombre corrió antes de que el gato comiera la comida.',
      pt: 'o homem correu antes que o gato comesse a comida.',
    });
  });

  test('"que" elides before a vowel', () => {
    expect(say(runs('because', {}, { subject: np('THIRD_PERSON', { gender: 'masc' }), verbPhrase: { verb: 'EAT' } }), 'fr'))
      .toBe("l'homme court parce qu'il mange.");
  });
});

describe('Japanese', () => {
  // The clause stands ahead of the predicate, behind the topic, plain and with its subject が.
  test('the clause precedes the predicate', () => {
    expect(say(runs('because'), 'ja')).toBe('男は猫が食べるので走ります。');
  });

  // 後で and 前に say the order of the events themselves, so they fix the tense whatever the clause's own.
  test('after takes the plain past and before the plain non-past, whatever the tense', () => {
    const past = { verbPhrase: { verb: 'RUN', tense: 'past' as const } };
    const ate = { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past' as const } };
    expect(say(runs('after', past, ate), 'ja')).toBe('男は猫が食べた後で走りました。');
    expect(say(runs('after'), 'ja')).toBe('男は猫が食べた後で走ります。');
    expect(say(runs('before', past, ate), 'ja')).toBe('男は猫が食べる前に走りました。');
    expect(say(runs('when', past, ate), 'ja')).toBe('男は猫が食べた時に走りました。');
    expect(say(runs('while', past, ate), 'ja')).toBe('男は猫が食べている間に走りました。');
  });
});

describe('with the other clause-level fields', () => {
  // The subordinate clause never inverts: a question asks about the main clause.
  test('a question inverts the main clause only', () => {
    expect(say(runs('because', { interrogative: true }), 'en')).toBe('does the man run because the cat eats?');
    expect(say(runs('because', { interrogative: true }), 'de')).toBe('läuft der Mann, weil der Kater frisst?');
    expect(say(runs('because', { interrogative: true }), 'ja')).toBe('男は猫が食べるので走りますか？');
  });

  test('a command keeps its adjunct', () => {
    expect(sayAll(runs('before', { subject: np('SECOND_PERSON'), imperative: true }))).toMatchObject({
      en: 'run before the cat eats.', it: 'corri prima che il gatto mangi.', de: 'lauf, bevor der Kater frisst.',
      ja: '猫が食べる前に走ってください。',
    });
  });

  // A condition leads the main clause, the adverbial clause trails it; neither changes the other's mood.
  test('a conditional main clause takes one too', () => {
    const plan = runs('when', {
      subject: np('DOG'), condition: { subject: np('CAT'), verbPhrase: { verb: 'EAT' } },
    }, { subject: np('MAN'), verbPhrase: { verb: 'EAT' } });
    expect(say(plan, 'en')).toBe('if the cat ate, the dog would run when the man eats.');
    expect(say(plan, 'it')).toBe("se il gatto mangiasse, il cane correrebbe quando l'uomo mangia.");
  });

  // It hangs off the predicate, as a purpose does, so a verbless period drops it.
  test('a verbless period drops it', () => {
    const { verbPhrase: _, ...verbless } = runs('when');
    expect(say(verbless as PhrasePlan, 'en')).toBe('the man.');
  });

  // An object clause and an adverbial one together: the object first, the adjunct last.
  test('beside an object clause', () => {
    const plan: PhrasePlan = {
      subject: np('MAN'), verbPhrase: { verb: 'SAY' },
      contentObject: { subject: np('CAT'), verbPhrase: { verb: 'RUN' } },
      adverbialClause: { conjunction: 'because', clause: { subject: np('DOG'), verbPhrase: { verb: 'EAT' } } },
    };
    expect(sayAll(plan)).toMatchObject({
      en: 'the man says that the cat runs because the dog eats.',
      de: 'der Mann sagt, dass der Kater läuft, weil der Hund frisst.',
      ja: '男は犬が食べるので猫が走ると言います。',
    });
  });
});

const whileEats = (tense: 'past' | 'present' | 'future', conjunction: SubordinatingConjunction = 'while', negative = false): PhrasePlan =>
  runs(conjunction, { verbPhrase: { verb: 'RUN', tense } }, { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense, ...(negative ? { negative } : {}) } });

// A250. A past "while" clause takes the Romance perfective past, as every past clause does: "mentre il
// gatto mangiò", "pendant que le chat mangea", "mientras el gato comió", "enquanto o gato comeu".
// "While" frames the main event inside one in progress, and the event in progress is the imperfect:
// "mangiava", "mangeait", "comía", "comia". The main clause keeps its perfective (C06), and "when",
// which can name a completed event, is right as it is.
describe('known bugs: a past while clause takes the perfective (A250)', () => {
  test('the four Romance languages take the imperfect', () => {
    expect(sayAll(whileEats('past'))).toMatchObject({
      it: "l'uomo corse mentre il gatto mangiava.", fr: "l'homme courut pendant que le chat mangeait.",
      es: 'el hombre corrió mientras el gato comía.', pt: 'o homem correu enquanto o gato comia.',
    });
  });

  test('and so does a negated one', () => {
    expect(sayAll(whileEats('past', 'while', true))).toMatchObject({
      it: "l'uomo corse mentre il gatto non mangiava.", fr: "l'homme courut pendant que le chat ne mangeait pas.",
      es: 'el hombre corrió mientras el gato no comía.', pt: 'o homem correu enquanto o gato não comia.',
    });
  });

  test('regression: the three without the distinction, and a past "when", are right', () => {
    expect(sayAll(whileEats('past'))).toMatchObject({
      en: 'the man ran while the cat ate.', de: 'der Mann lief, während der Kater fraß.',
      ja: '男は猫が食べている間に走りました。',
    });
    expect(sayAll(whileEats('past', 'when'))).toMatchObject({
      it: "l'uomo corse quando il gatto mangiò.", es: 'el hombre corrió cuando el gato comió.',
    });
  });

  test('a past "when" keeps the perfective in all four, and the main clause keeps its own', () => {
    expect(sayAll(whileEats('past', 'when'))).toMatchObject({
      it: "l'uomo corse quando il gatto mangiò.", fr: "l'homme courut quand le chat mangea.",
      es: 'el hombre corrió cuando el gato comió.', pt: 'o homem correu quando o gato comeu.',
    });
  });

  test('the imperfect agrees with a plural subject and takes an irregular stem', () => {
    const past = { verbPhrase: { verb: 'RUN', tense: 'past' as const } };
    expect(sayAll(runs('while', past, { subject: np('CAT', { number: 'plural' }), verbPhrase: { verb: 'EAT', tense: 'past' } }))).toMatchObject({
      it: "l'uomo corse mentre i gatti mangiavano.", fr: "l'homme courut pendant que les chats mangeaient.",
      es: 'el hombre corrió mientras los gatos comían.', pt: 'o homem correu enquanto os gatos comiam.',
    });
    expect(sayAll(runs('while', past, { subject: np('DOG'), verbPhrase: { verb: 'GO', tense: 'past' } }))).toMatchObject({
      it: "l'uomo corse mentre il cane andava.", fr: "l'homme courut pendant que le chien allait.",
      es: 'el hombre corrió mientras el perro iba.', pt: 'o homem correu enquanto o cão ia.',
    });
  });

  // The passive auxiliary takes over the finite slot, so it is the one in the imperfect.
  test('a passive past while clause puts its auxiliary in the imperfect', () => {
    expect(sayAll(runs('while', { verbPhrase: { verb: 'RUN', tense: 'past' } }, {
      subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past', voice: 'passive' }, directObject: np('FOOD', { definiteness: 'definite' }),
    }))).toMatchObject({
      it: "l'uomo corse mentre il cibo era mangiato dal gatto.",
      fr: "l'homme courut pendant que la nourriture était mangée par le chat.",
      pt: 'o homem correu enquanto a comida era comida pelo gato.',
    });
  });
});

// A251. English and German write a future temporal clause with the future auxiliary: "when the cat
// will eat", "wenn der Kater fressen wird". Both say a future event under a temporal conjunction in
// the present — "when the cat eats", "wenn der Kater frisst" — and keep the future for the main clause.
// "Because" is not temporal and keeps its future in both ("because the cat will eat"). German
// "nachdem" wants the perfect ("nachdem der Kater gefressen hat") and is left out of the pin.
describe('known bugs: an English or German future temporal clause keeps "will" (A251)', () => {
  test('English: when, while, before and after take the present', () => {
    expect(say(whileEats('future', 'when'), 'en')).toBe('the man will run when the cat eats.');
    expect(say(whileEats('future', 'while'), 'en')).toBe('the man will run while the cat eats.');
    expect(say(whileEats('future', 'before'), 'en')).toBe('the man will run before the cat eats.');
    expect(say(whileEats('future', 'after'), 'en')).toBe('the man will run after the cat eats.');
  });

  test('German: wenn, während and bevor take the present', () => {
    expect(say(whileEats('future', 'when'), 'de')).toBe('der Mann wird laufen, wenn der Kater frisst.');
    expect(say(whileEats('future', 'while'), 'de')).toBe('der Mann wird laufen, während der Kater frisst.');
    expect(say(whileEats('future', 'before'), 'de')).toBe('der Mann wird laufen, bevor der Kater frisst.');
  });

  test('regression: "because" keeps its future', () => {
    expect(say(whileEats('future', 'because'), 'en')).toBe('the man will run because the cat will eat.');
    expect(say(whileEats('future', 'because'), 'de')).toBe('der Mann wird laufen, weil der Kater fressen wird.');
  });

  // The same rule one tense back: the clause's event is over before the main one begins.
  test('German "nachdem" takes the perfect, with the auxiliary its verb selects', () => {
    expect(say(whileEats('future', 'after'), 'de')).toBe('der Mann wird laufen, nachdem der Kater gefressen hat.');
    expect(say(runs('after', { verbPhrase: { verb: 'RUN', tense: 'future' } }, {
      subject: np('CAT'), verbPhrase: { verb: 'RUN', tense: 'future' },
    }), 'de')).toBe('der Mann wird laufen, nachdem der Kater gelaufen ist.');
    expect(say(runs('after', { verbPhrase: { verb: 'RUN', tense: 'future' } }, {
      subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'future', negative: true }, directObject: np('FOOD', { definiteness: 'definite' }),
    }), 'de')).toBe('der Mann wird laufen, nachdem der Kater das Essen nicht gefressen hat.');
  });

  test('the present agrees, negates and keeps a modal', () => {
    const future = { verbPhrase: { verb: 'RUN', tense: 'future' as const } };
    expect(say(whileEats('future', 'when', true), 'en')).toBe('the man will run when the cat does not eat.');
    expect(say(whileEats('future', 'when', true), 'de')).toBe('der Mann wird laufen, wenn der Kater nicht frisst.');
    const cats = { subject: np('CAT', { number: 'plural' }), verbPhrase: { verb: 'EAT', tense: 'future' as const } };
    expect(say(runs('while', future, cats), 'en')).toBe('the man will run while the cats eat.');
    expect(say(runs('while', future, cats), 'de')).toBe('der Mann wird laufen, während die Kater fressen.');
    const canEat = { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'future' as const, modals: ['CAN'] } };
    expect(say(runs('when', future, canEat), 'en')).toBe('the man will run when the cat can eat.');
    expect(say(runs('when', future, canEat), 'de')).toBe('der Mann wird laufen, wenn der Kater fressen kann.');
  });

  test('regression: Italian and French keep the future, "après que" too', () => {
    expect(sayAll(whileEats('future', 'when'))).toMatchObject({
      it: "l'uomo correrà quando il gatto mangerà.", fr: "l'homme courra quand le chat mangera.",
    });
    expect(say(whileEats('future', 'after'), 'fr')).toBe("l'homme courra après que le chat mangera.");
    expect(say(whileEats('future', 'after'), 'it')).toBe("l'uomo correrà dopo che il gatto mangerà.");
  });
});

// A252. Spanish and Portuguese write a future temporal clause in the future indicative: "cuando el
// gato comerá", "quando o gato comerá". Both put a future event under a temporal conjunction in the
// subjunctive — Spanish the present subjunctive ("cuando el gato coma"), Portuguese its future
// subjunctive ("quando o gato comer"), which the engine has no paradigm for yet. "Before" already
// governs the subjunctive and is right; Italian and French keep the future and are right too.
describe('known bugs: an Iberian future temporal clause takes the future indicative (A252)', () => {
  test('Spanish: cuando, mientras and después de que take the present subjunctive', () => {
    expect(say(whileEats('future', 'when'), 'es')).toBe('el hombre correrá cuando el gato coma.');
    expect(say(whileEats('future', 'while'), 'es')).toBe('el hombre correrá mientras el gato coma.');
    expect(say(whileEats('future', 'after'), 'es')).toBe('el hombre correrá después de que el gato coma.');
  });

  test('Portuguese: quando, enquanto and depois que take the future subjunctive', () => {
    expect(say(whileEats('future', 'when'), 'pt')).toBe('o homem correrá quando o gato comer.');
    expect(say(whileEats('future', 'while'), 'pt')).toBe('o homem correrá enquanto o gato comer.');
    expect(say(whileEats('future', 'after'), 'pt')).toBe('o homem correrá depois que o gato comer.');
  });

  test('regression: "before", Italian, French and "because" are right', () => {
    expect(say(whileEats('future', 'before'), 'es')).toBe('el hombre correrá antes de que el gato coma.');
    expect(say(whileEats('future', 'before'), 'pt')).toBe('o homem correrá antes que o gato coma.');
    expect(sayAll(whileEats('future', 'when'))).toMatchObject({
      it: "l'uomo correrà quando il gatto mangerà.", fr: "l'homme courra quand le chat mangera.",
    });
    expect(say(whileEats('future', 'because'), 'es')).toBe('el hombre correrá porque el gato comerá.');
  });

  test('regression: Portuguese "because" keeps the future', () => {
    expect(say(whileEats('future', 'because'), 'pt')).toBe('o homem correrá porque o gato comerá.');
  });

  // Built on the 3rd-plural preterite stem, so the irregular preterites carry through.
  test.each<[string, string, string]>([
    ['BE', 'for', 'forem'], ['GO', 'for', 'forem'], ['DO', 'fizer', 'fizerem'], ['HAVE', 'tiver', 'tiverem'],
    ['SAY', 'disser', 'disserem'], ['SEE', 'vir', 'virem'], ['COME', 'vier', 'vierem'], ['GIVE', 'der', 'derem'],
    ['PUT', 'puser', 'puserem'], ['BRING', 'trouxer', 'trouxerem'], ['KNOW', 'souber', 'souberem'],
    ['LEAVE', 'sair', 'saírem'], ['DESTROY', 'destruir', 'destruírem'], ['READ', 'ler', 'lerem'],
  ])('the Portuguese future subjunctive of %s is "%s" / "%s"', (verb, singular, plural) => {
    const future = { verbPhrase: { verb: 'RUN', tense: 'future' as const } };
    expect(say(runs('when', future, { subject: np('CAT'), verbPhrase: { verb, tense: 'future' } }), 'pt'))
      .toBe(`o homem correrá quando o gato ${singular}.`);
    expect(say(runs('when', future, { subject: np('CAT', { number: 'plural' }), verbPhrase: { verb, tense: 'future' } }), 'pt'))
      .toBe(`o homem correrá quando os gatos ${plural}.`);
  });

  test('the Spanish present subjunctive takes its irregular stems', () => {
    const future = { verbPhrase: { verb: 'RUN', tense: 'future' as const } };
    const when = (verb: string) => say(runs('when', future, { subject: np('CAT'), verbPhrase: { verb, tense: 'future' } }), 'es');
    expect(when('DO')).toBe('el hombre correrá cuando el gato haga.');
    expect(when('HAVE')).toBe('el hombre correrá cuando el gato tenga.');
    expect(when('GO')).toBe('el hombre correrá cuando el gato vaya.');
    expect(when('BE')).toBe('el hombre correrá cuando el gato sea.');
  });

  test('a 1st plural, a negation, a clitic, a modal, a reflexive and a passive', () => {
    const future = { verbPhrase: { verb: 'RUN', tense: 'future' as const } };
    const clause = (extra: Partial<NonNullable<PhrasePlan['contentSubject']>>, verbPhrase: PhrasePlan['verbPhrase']) =>
      runs('when', future, { subject: np('CAT'), verbPhrase: { ...verbPhrase!, tense: 'future' }, ...extra });
    expect(say(clause({ subject: np('FIRST_PERSON', { number: 'plural' }) }, { verb: 'LEAVE' }), 'pt')).toBe('o homem correrá quando sairmos.');
    expect(say(clause({ subject: np('FIRST_PERSON', { number: 'plural' }) }, { verb: 'EAT' }), 'pt')).toBe('o homem correrá quando comermos.');
    const negated = clause({ directObject: np('FOOD', { definiteness: 'definite' }) }, { verb: 'EAT', negative: true });
    expect(say(negated, 'pt')).toBe('o homem correrá quando o gato não comer a comida.');
    expect(say(negated, 'es')).toBe('el hombre correrá cuando el gato no coma la comida.');
    const sees = clause({ directObject: np('THIRD_PERSON', { gender: 'masc' }) }, { verb: 'SEE' });
    expect(say(sees, 'pt')).toBe('o homem correrá quando o gato o vir.');
    expect(say(sees, 'es')).toBe('el hombre correrá cuando el gato lo vea.');
    expect(say(clause({}, { verb: 'EAT', modals: ['CAN'] }), 'pt')).toBe('o homem correrá quando o gato puder comer.');
    expect(say(clause({}, { verb: 'EAT', modals: ['MUST'] }), 'es')).toBe('el hombre correrá cuando el gato deba comer.');
    expect(say(clause({}, { verb: 'BECOME' }), 'pt')).toBe('o homem correrá quando o gato se tornar.');
    const passive = clause({ directObject: np('FOOD', { definiteness: 'definite' }) }, { verb: 'EAT', voice: 'passive' });
    expect(say(passive, 'pt')).toBe('o homem correrá quando a comida for comida pelo gato.');
    expect(say(passive, 'es')).toBe('el hombre correrá cuando la comida sea comida por el gato.');
  });

  // The aspect auxiliaries take the mood: estiver / esté, tiver / haya.
  test('a marked aspect puts its auxiliary in the subjunctive', () => {
    const future = { verbPhrase: { verb: 'RUN', tense: 'future' as const } };
    const eating = { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'future' as const, aspect: 'progressive' as const } };
    expect(say(runs('while', future, eating), 'pt')).toBe('o homem correrá enquanto o gato estiver comendo.');
    expect(say(runs('while', future, eating), 'es')).toBe('el hombre correrá mientras el gato esté comiendo.');
    const eaten = { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'future' as const, aspect: 'resultative' as const } };
    expect(say(runs('after', future, eaten), 'pt')).toBe('o homem correrá depois que o gato tiver comido.');
    expect(say(runs('after', future, eaten), 'es')).toBe('el hombre correrá después de que el gato haya comido.');
  });
});
