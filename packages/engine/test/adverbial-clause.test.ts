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

  // D5: "during" introduces a noun phrase, not a clause, so it is not a conjunction here. P09-E27
  // added until, since and though, and localization C41 the similative as (similative-clause.test.ts).
  test('there is no "during"', () => {
    expect(SUBORDINATING_CONJUNCTIONS).toEqual(['when', 'while', 'because', 'after', 'before', 'until', 'since', 'though', 'as']);
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

// A259. Japanese *while* puts its clause in 〜ている (`JA_SUBORDINATORS`, `shapeAdverbialClause`), the
// stretch of time 間に measures, by setting the clause's aspect to progressive. Under a modal that
// aspect landed on the governed verb, so the clause said "while the cat needs to be eating"
// (食べている必要がある間) where the plan said "while the cat had to eat". 必要がある and ことができる are
// states already, a stretch 間に can measure: 食べる必要がある間に, 食べることができる間に.
describe('known bugs: a Japanese while clause puts a modal\'s verb in the progressive (A259)', () => {
  const whileModal = (tense: 'past' | 'present', modal: string) =>
    say(runs('while', { verbPhrase: { verb: 'RUN', tense } }, { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense, modals: [modal] } }), 'ja');

  test('MUST: 猫が食べる必要がある間に', () => {
    expect(whileModal('past', 'MUST')).toBe('男は猫が食べる必要がある間に走りました。');
    expect(whileModal('present', 'MUST')).toBe('男は猫が食べる必要がある間に走ります。');
  });

  test('CAN: 猫が食べることができる間に', () => {
    expect(whileModal('past', 'CAN')).toBe('男は猫が食べることができる間に走りました。');
  });

  test('the other modals, a chain of two, and either negation take no 〜ている either', () => {
    expect(whileModal('present', 'CAN')).toBe('男は猫が食べることができる間に走ります。');
    expect(whileModal('past', 'SHOULD')).toBe('男は猫が食べるべきである間に走りました。');
    expect(whileModal('past', 'MAY')).toBe('男は猫が食べることが許される間に走りました。');
    const cat = (verbPhrase: NonNullable<PhrasePlan['verbPhrase']>) =>
      say(runs('while', { verbPhrase: { verb: 'RUN', tense: 'past' } }, { subject: np('CAT'), verbPhrase }), 'ja');
    expect(cat({ verb: 'EAT', tense: 'past', modals: ['MUST', 'CAN'] })).toBe('男は猫が食べることができる必要がある間に走りました。');
    expect(cat({ verb: 'EAT', tense: 'past', modals: [{ verb: 'MUST', negative: true }] })).toBe('男は猫が食べる必要がない間に走りました。');
    expect(cat({ verb: 'EAT', tense: 'past', modals: ['MUST'], negative: true })).toBe('男は猫が食べない必要がある間に走りました。');
  });

  test('a future while clause under a modal, and a plain present or future one, which keeps 〜ている', () => {
    const w = (tense: 'present' | 'future', modals?: string[]) =>
      say(runs('while', { verbPhrase: { verb: 'RUN', tense } }, { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense, modals } }), 'ja');
    expect(w('future', ['MUST'])).toBe('男は猫が食べる必要がある間に走ります。');
    expect(w('present')).toBe('男は猫が食べている間に走ります。');
    expect(w('future')).toBe('男は猫が食べている間に走ります。');
  });

  // The fix withholds only the progressive while adds; a clause's own aspect still lands on the
  // governed verb, as B07 has it everywhere else.
  test('a modal clause keeps an aspect of its own', () => {
    const own = (aspect: 'progressive' | 'resultative') =>
      say(runs('while', { verbPhrase: { verb: 'RUN', tense: 'past' } }, { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past', aspect, modals: ['MUST'] } }), 'ja');
    expect(own('progressive')).toBe('男は猫が食べている必要がある間に走りました。');
    expect(own('resultative')).toBe('男は猫が食べている必要がある間に走りました。');
  });

  test('regression: a plain while clause, a modal under when, and the European languages', () => {
    expect(say(runs('while', { verbPhrase: { verb: 'RUN', tense: 'past' } }, { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past' } }), 'ja'))
      .toBe('男は猫が食べている間に走りました。');
    expect(say(runs('when', { verbPhrase: { verb: 'RUN', tense: 'past' } }, { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past', modals: ['MUST'] } }), 'ja'))
      .toBe('男は猫が食べる必要があった時に走りました。');
    expect(sayAll(runs('while', { verbPhrase: { verb: 'RUN', tense: 'past' } }, { subject: np('CAT'), verbPhrase: { verb: 'EAT', tense: 'past', modals: ['MUST'] } })))
      .toMatchObject({
        en: 'the man ran while the cat had to eat.', it: "l'uomo corse mentre il gatto doveva mangiare.",
        de: 'der Mann lief, während der Kater fressen musste.', es: 'el hombre corrió mientras el gato debía comer.',
      });
  });
});

// 後で and 前に fix their clause's tense (後で the plain past, 前に the non-past) but not its aspect, so a
// resultative clause renders its own た / 〜ていた form beside the one the conjunction asks for:
// 走った前に, which 前に never takes, and 走っていた後で, a progressive the plan does not have.
describe('known bugs: a Japanese resultative under 前に or 後で keeps its own form (A264)', () => {
  const resultative = { subject: np('CAT'), verbPhrase: { verb: 'RUN', aspect: 'resultative' as const } };

  test('前に takes the non-past: 猫が走る前に', () => {
    expect(say(runs('before', {}, resultative), 'ja')).toBe('男は猫が走る前に走ります。');
    expect(say(runs('before', { verbPhrase: { verb: 'RUN', tense: 'past' } }, {
      ...resultative, verbPhrase: { ...resultative.verbPhrase, tense: 'past' },
    }), 'ja')).toBe('男は猫が走る前に走りました。');
  });

  test('後で takes the plain past: 猫が走った後で', () => {
    expect(say(runs('after', {}, resultative), 'ja')).toBe('男は猫が走った後で走ります。');
  });

  test('under a past main clause, and with an object: 猫が食べ物を食べた後で走りました', () => {
    expect(say(runs('after', { verbPhrase: { verb: 'RUN', tense: 'past' } }, resultative), 'ja')).toBe('男は猫が走った後で走りました。');
    const eaten = { subject: np('CAT'), verbPhrase: { verb: 'EAT', aspect: 'resultative' as const }, directObject: np('FOOD') };
    expect(say(runs('before', {}, eaten), 'ja')).toBe('男は猫が食べ物を食べる前に走ります。');
    expect(say(runs('after', {}, eaten), 'ja')).toBe('男は猫が食べ物を食べた後で走ります。');
  });

  test('regression: the resultative under when, and the European languages, keep it', () => {
    expect(say(runs('when', {}, resultative), 'ja')).toBe('男は猫が走った時に走ります。');
    expect(sayAll(runs('before', {}, resultative))).toMatchObject({
      en: 'the man runs before the cat has run.', it: "l'uomo corre prima che il gatto abbia corso.",
    });
  });
});

// P09-E27: until, since and though — the same mechanism as E4's five, each with a wrinkle of its own.
// Until: French, Spanish and Portuguese govern the subjunctive, and Italian "finché" an expletive
// "non" that negates nothing (D1). Since: temporal only, its main clause's tense the plan's (D2), and
// Japanese on the て-form (〜てから). Though: the subjunctive in Italian, French and Portuguese, the
// indicative in Spanish "aunque", German "obwohl" and Japanese のに (D4).
describe('until, since, though (P09-E27)', () => {
  const catRuns = (
    conjunction: SubordinatingConjunction,
    sub: Partial<PhrasePlan['verbPhrase']> = {},
    main: Partial<PhrasePlan['verbPhrase']> = {},
    extra: Record<string, unknown> = {},
  ): PhrasePlan => ({
    subject: np('CAT'),
    verbPhrase: { verb: 'RUN', ...main },
    adverbialClause: { conjunction, clause: { subject: np('DOG'), verbPhrase: { verb: 'EAT', ...sub }, ...extra } },
  });

  test.each<[string, PhrasePlan, Record<LanguageCode, string>]>([
    ['until (present)', catRuns('until'), {
      en: 'the cat runs until the dog eats.', it: 'il gatto corre finché il cane non mangia.',
      fr: "le chat court jusqu'à ce que le chien mange.", de: 'der Kater läuft, bis der Hund frisst.',
      es: 'el gato corre hasta que el perro coma.', pt: 'o gato corre até que o cão coma.', ja: '猫は犬が食べるまで走ります。',
    }],
    ['until (past)', catRuns('until', { tense: 'past' }, { tense: 'past' }), {
      en: 'the cat ran until the dog ate.', it: 'il gatto corse finché il cane non mangiò.',
      fr: "le chat courut jusqu'à ce que le chien mange.", de: 'der Kater lief, bis der Hund fraß.',
      es: 'el gato corrió hasta que el perro comiera.', pt: 'o gato correu até que o cão comesse.', ja: '猫は犬が食べるまで走りました。',
    }],
    ['since (present)', catRuns('since'), {
      en: 'the cat runs since the dog eats.', it: 'il gatto corre da quando il cane mangia.',
      fr: 'le chat court depuis que le chien mange.', de: 'der Kater läuft, seit der Hund frisst.',
      es: 'el gato corre desde que el perro come.', pt: 'o gato corre desde que o cão come.', ja: '猫は犬が食べてから走ります。',
    }],
    ['since (past)', catRuns('since', { tense: 'past' }), {
      en: 'the cat runs since the dog ate.', it: 'il gatto corre da quando il cane mangiò.',
      fr: 'le chat court depuis que le chien mangea.', de: 'der Kater läuft, seit der Hund fraß.',
      es: 'el gato corre desde que el perro comió.', pt: 'o gato corre desde que o cão comeu.', ja: '猫は犬が食べてから走ります。',
    }],
    // D2: the English "has run since" is the plan the builder makes, a resultative main clause; the
    // others say the same aspect as their own perfect.
    ['since (resultative)', catRuns('since', { aspect: 'resultative' }, { aspect: 'resultative' }), {
      en: 'the cat has run since the dog has eaten.', it: 'il gatto ha corso da quando il cane ha mangiato.',
      fr: 'le chat a couru depuis que le chien a mangé.', de: 'der Kater ist gelaufen, seit der Hund gefressen hat.',
      es: 'el gato ha corrido desde que el perro ha comido.', pt: 'o gato correu desde que o cão comeu.', ja: '猫は犬が食べてから走りました。',
    }],
    ['though (present)', catRuns('though'), {
      en: 'the cat runs though the dog eats.', it: 'il gatto corre sebbene il cane mangi.',
      fr: 'le chat court bien que le chien mange.', de: 'der Kater läuft, obwohl der Hund frisst.',
      es: 'el gato corre aunque el perro come.', pt: 'o gato corre embora o cão coma.', ja: '猫は犬が食べるのに走ります。',
    }],
    ['though (past)', catRuns('though', { tense: 'past' }, { tense: 'past' }), {
      en: 'the cat ran though the dog ate.', it: 'il gatto corse sebbene il cane mangiasse.',
      fr: 'le chat courut bien que le chien mange.', de: 'der Kater lief, obwohl der Hund fraß.',
      es: 'el gato corrió aunque el perro comió.', pt: 'o gato correu embora o cão comesse.', ja: '猫は犬が食べたのに走りました。',
    }],
    ['though (resultative)', catRuns('though', { aspect: 'resultative' }), {
      en: 'the cat runs though the dog has eaten.', it: 'il gatto corre sebbene il cane abbia mangiato.',
      fr: 'le chat court bien que le chien ait mangé.', de: 'der Kater läuft, obwohl der Hund gefressen hat.',
      es: 'el gato corre aunque el perro ha comido.', pt: 'o gato corre embora o cão tenha comido.', ja: '猫は犬が食べたのに走ります。',
    }],
  ])('%s', (_name, plan, rendered) => {
    expect(sayAll(plan)).toEqual(rendered);
  });

  // D1: the Italian "non" is finché's, not the clause's: the other six stay affirmative, and a
  // clause that is negative already keeps its one "non" (Italian cannot tell the two apart).
  test('the Italian expletive non negates nothing in the other languages', () => {
    expect(sayAll(catRuns('until', {}, {}, { directObject: np('FOOD') }))).toMatchObject({
      it: 'il gatto corre finché il cane non mangia il cibo.',
      en: 'the cat runs until the dog eats the food.',
      fr: "le chat court jusqu'à ce que le chien mange la nourriture.",
    });
    expect(say(catRuns('until', { negative: true }), 'it')).toBe('il gatto corre finché il cane non mangia.');
    expect(say(catRuns('until', { negative: true }), 'fr')).toBe("le chat court jusqu'à ce que le chien ne mange pas.");
    // No other conjunction takes it.
    expect(say(catRuns('when'), 'it')).toBe('il gatto corre quando il cane mangia.');
  });

  // Until is temporal: a future under it is the present in English and German (A251), and the
  // subjunctive it governs anyway in Spanish and Portuguese. Since and though keep a future.
  test('a future under until is deferred, under since and though it is kept', () => {
    expect(sayAll(catRuns('until', { tense: 'future' }, { tense: 'future' }))).toMatchObject({
      en: 'the cat will run until the dog eats.', de: 'der Kater wird laufen, bis der Hund frisst.',
      it: 'il gatto correrà finché il cane non mangerà.', es: 'el gato correrá hasta que el perro coma.',
      pt: 'o gato correrá até que o cão coma.',
    });
    expect(sayAll(catRuns('though', { tense: 'future' }, { tense: 'future' }))).toMatchObject({
      en: 'the cat will run though the dog will eat.', de: 'der Kater wird laufen, obwohl der Hund fressen wird.',
      es: 'el gato correrá aunque el perro comerá.', it: 'il gatto correrà sebbene il cane mangi.',
    });
  });

  // German closes each on the finite verb, behind the object and "nicht", as E4's five.
  test('German is verb-final under all three', () => {
    for (const [conjunction, word] of [['until', 'bis'], ['since', 'seit'], ['though', 'obwohl']] as const) {
      expect(say(catRuns(conjunction, { negative: true }, {}, { directObject: np('FOOD', { definiteness: 'definite' }) }), 'de'))
        .toBe(`der Kater läuft, ${word} der Hund das Essen nicht frisst.`);
    }
  });

  // Japanese: まで on the non-past whatever the tense, のに on the plain form of its own, and から on the
  // て-form, a godan verb's included (走って).
  test('Japanese closes on まで, のに and 〜てから', () => {
    expect(say(catRuns('until', { tense: 'past' }), 'ja')).toBe('猫は犬が食べるまで走ります。');
    expect(say(catRuns('though', { negative: true }), 'ja')).toBe('猫は犬が食べないのに走ります。');
    expect(say(catRuns('since', { verb: 'RUN' }), 'ja')).toBe('猫は犬が走ってから走ります。');
    expect(say(catRuns('since', {}, {}, { directObject: np('FOOD') }), 'ja')).toBe('猫は犬が食べ物を食べてから走ります。');
  });

  test('"que" elides before a vowel in the two French locutions', () => {
    const he = { subject: np('THIRD_PERSON', { gender: 'masc' }) };
    expect(say(catRuns('until', {}, {}, he), 'fr')).toBe("le chat court jusqu'à ce qu'il mange.");
    expect(say(catRuns('though', {}, {}, he), 'fr')).toBe("le chat court bien qu'il mange.");
  });
});

// A323. Japanese まで and 前に follow a clause's predicate in its plain form (食べるまで, 食べる前に).
// A な-adjective predicate takes the attributive な instead, which belongs before a noun: 誰かが大丈夫な
// まで, 犬が幸せなまで, 犬が幸せな前に. The Want is the recommended ruling in the bug file: the limit an
// until-clause names is a state reached, so the predicate is 〜になる (大丈夫になるまで, 幸せになる前に);
// 〜であるまで is the literal alternative.
describe('known bugs: a Japanese な-adjective predicate takes な before まで and 前に (A323)', () => {
  const runsUntil = (
    subject: string, adjective: string, conjunction: SubordinatingConjunction = 'until', tense?: 'past',
  ): PhrasePlan => ({
    subject: np('CAT'),
    verbPhrase: { verb: 'RUN', ...(tense ? { tense } : {}) },
    adverbialClause: {
      conjunction,
      clause: { subject: np(subject), verbPhrase: { verb: 'BE', ...(tense ? { tense } : {}) }, complements: { predicative: { phrase: np(adjective) } } },
    },
  });

  test('until someone is okay', () => {
    expect(say(runsUntil('SOMEONE', 'OKAY'), 'ja')).toBe('猫は誰かが大丈夫になるまで走ります。');
  });

  test('until the dog is happy', () => {
    expect(say(runsUntil('DOG', 'HAPPY'), 'ja')).toBe('猫は犬が幸せになるまで走ります。');
  });

  test('until, in the past', () => {
    expect(say(runsUntil('DOG', 'HAPPY', 'until', 'past'), 'ja')).toBe('猫は犬が幸せになるまで走りました。');
  });

  test('before the dog is happy', () => {
    expect(say(runsUntil('DOG', 'HAPPY', 'before'), 'ja')).toBe('猫は犬が幸せになる前に走ります。');
  });

  test('an い-adjective and a noun reach their state with 〜になる too', () => {
    expect(say(runsUntil('DOG', 'BIG'), 'ja')).toBe('猫は犬が大きくなるまで走ります。');
    expect(say(runsUntil('DOG', 'BIG', 'before'), 'ja')).toBe('猫は犬が大きくなる前に走ります。');
    const friend: PhrasePlan = {
      subject: np('CAT'), verbPhrase: { verb: 'RUN' },
      adverbialClause: { conjunction: 'until', clause: {
        subject: np('DOG'), verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('FRIEND', { definiteness: 'indefinite' }) } },
      } },
    };
    expect(say(friend, 'ja')).toBe('猫は犬が友達になるまで走ります。');
  });

  test('regression: the other conjunctions keep the prenominal な and the past', () => {
    expect(say(runsUntil('DOG', 'HAPPY', 'when'), 'ja')).toBe('猫は犬が幸せな時に走ります。');
    expect(say(runsUntil('DOG', 'HAPPY', 'because'), 'ja')).toBe('猫は犬が幸せなので走ります。');
    expect(say(runsUntil('DOG', 'HAPPY', 'after'), 'ja')).toBe('猫は犬が幸せだった後で走ります。');
  });

  test('regression: a verb before まで, and the other six', () => {
    expect(say({
      subject: np('CAT'), verbPhrase: { verb: 'RUN' },
      adverbialClause: { conjunction: 'until', clause: { subject: np('DOG'), verbPhrase: { verb: 'EAT' } } },
    }, 'ja')).toBe('猫は犬が食べるまで走ります。');
    expect(sayAll(runsUntil('DOG', 'HAPPY'))).toMatchObject({
      en: 'the cat runs until the dog is happy.', it: 'il gatto corre finché il cane non è felice.',
      fr: 'le chat court jusqu\'à ce que le chien soit heureux.', de: 'der Kater läuft, bis der Hund glücklich ist.',
      es: 'el gato corre hasta que el perro esté feliz.', pt: 'o gato corre até que o cão esteja feliz.',
    });
  });
});

// A345. A323 made a predicate before まで / 前に the change of state 〜になる (幸せになるまで), and left the
// negative in its prenominal form: 犬が幸せではないまで, 大きくないまで, 友達ではないまで. まで and 前に
// want an event there too; a negated state reached is 〜でなくなる / 〜くなくなる, "until it stops
// being happy". 時に and ので keep the plain negative (幸せではない時に), which is right.
describe('known bugs: a Japanese negated predicate before まで and 前に is not a change of state (A345)', () => {
  const runs = (conjunction: SubordinatingConjunction, adjective: string, negative = true): PhrasePlan => ({
    subject: np('CAT'),
    verbPhrase: { verb: 'RUN' },
    adverbialClause: {
      conjunction,
      clause: { subject: np('DOG'), verbPhrase: { verb: 'BE', negative }, complements: { predicative: { phrase: np(adjective) } } },
    },
  });

  test('a な-adjective until, and before', () => {
    expect(say(runs('until', 'HAPPY'), 'ja')).toBe('猫は犬が幸せでなくなるまで走ります。');
    expect(say(runs('before', 'HAPPY'), 'ja')).toBe('猫は犬が幸せでなくなる前に走ります。');
  });

  test('an い-adjective and a noun', () => {
    expect(say(runs('until', 'BIG'), 'ja')).toBe('猫は犬が大きくなくなるまで走ります。');
    expect(say(runs('until', 'FRIEND'), 'ja')).toBe('猫は犬が友達でなくなるまで走ります。');
  });

  // Ruled: the negated ている state goes the literal way, the state stopping.
  test('a negated ている state: 疲れなくなるまで', () => {
    expect(say(runs('until', 'TIRED'), 'ja')).toBe('猫は犬が疲れなくなるまで走ります。');
    expect(say(runs('before', 'TIRED'), 'ja')).toBe('猫は犬が疲れなくなる前に走ります。');
  });

  test('the い-adjective and the noun before 前に', () => {
    expect(say(runs('before', 'BIG'), 'ja')).toBe('猫は犬が大きくなくなる前に走ります。');
    expect(say(runs('before', 'FRIEND'), 'ja')).toBe('猫は犬が友達でなくなる前に走ります。');
  });

  test('regression: the affirmative, the other conjunctions, and the other six', () => {
    expect(say(runs('until', 'HAPPY', false), 'ja')).toBe('猫は犬が幸せになるまで走ります。');
    expect(say(runs('when', 'HAPPY'), 'ja')).toBe('猫は犬が幸せではない時に走ります。');
    expect(sayAll(runs('until', 'HAPPY'))).toMatchObject({
      en: 'the cat runs until the dog is not happy.', de: 'der Kater läuft, bis der Hund nicht glücklich ist.',
    });
  });
});

// A361. A345 made a negated predicate before まで / 前に the change of state 〜なくなる, and left a
// "neither … nor" in its prenominal form: 犬が大きくも幸せでもないまで, a state holding where まで and 前に
// want one reached. The negated coordination reached is 〜も〜もなくなる, "until the dog is neither big
// nor happy any more". 時に keeps the plain negative. A negated lowered degree or superlative
// (〜わけではないまで) keeps its prenominal わけではない, by ruling.
describe('known bugs: a Japanese "neither … nor" before まで and 前に is not a change of state (A361)', () => {
  const both = (...conjuncts: string[]) => ({ phrase: { conjuncts: conjuncts.map((c) => np(c)), conjunction: 'and' } });
  const runs = (conjunction: SubordinatingConjunction, predicative: ReturnType<typeof both>, negative = true): PhrasePlan => ({
    subject: np('CAT'),
    verbPhrase: { verb: 'RUN' },
    adverbialClause: {
      conjunction,
      clause: { subject: np('DOG'), verbPhrase: { verb: 'BE', negative }, complements: { predicative } } as never,
    },
  });

  test('an い- and a な-adjective, until and before', () => {
    expect(say(runs('until', both('BIG', 'HAPPY')), 'ja')).toBe('猫は犬が大きくも幸せでもなくなるまで走ります。');
    expect(say(runs('before', both('BIG', 'HAPPY')), 'ja')).toBe('猫は犬が大きくも幸せでもなくなる前に走ります。');
  });

  test('two nouns', () => {
    expect(say(runs('until', both('FRIEND', 'LEGEND')), 'ja')).toBe('猫は犬が友達でも伝説でもなくなるまで走ります。');
  });

  test('the nouns before, and a ている state last keeps the mechanical いなくなる', () => {
    expect(say(runs('before', both('FRIEND', 'LEGEND')), 'ja')).toBe('猫は犬が友達でも伝説でもなくなる前に走ります。');
    expect(say(runs('until', both('BIG', 'TIRED')), 'ja')).toBe('猫は犬が大きくも疲れてもいなくなるまで走ります。');
    expect(say(runs('when', both('FRIEND', 'LEGEND')), 'ja')).toBe('猫は犬が友達でも伝説でもない時に走ります。');
  });

  test('regression: the affirmative, the other conjunctions, and the other six', () => {
    expect(say(runs('until', both('BIG', 'HAPPY'), false), 'ja')).toBe('猫は犬が大きくて幸せになるまで走ります。');
    expect(say(runs('when', both('BIG', 'HAPPY')), 'ja')).toBe('猫は犬が大きくも幸せでもない時に走ります。');
    expect(sayAll(runs('until', both('BIG', 'HAPPY')))).toMatchObject({
      en: 'the cat runs until the dog is not big and happy.', de: 'der Kater läuft, bis der Hund nicht groß und glücklich ist.',
      fr: "le chat court jusqu'à ce que le chien ne soit pas grand et heureux.",
    });
  });
});

// A346. The same A323 left a 〜ている state before まで / 前に: TIRED (a た-adjective, 疲れている) gives
// 犬が疲れているまで, 犬が疲れている前に. A323's file named it (疲れるまで is natural) and its ruling, the
// state reached, covers it: the bare verb 疲れる, "until the dog gets tired". 時に keeps the state.
describe('known bugs: a Japanese ている state before まで and 前に keeps its ている (A346)', () => {
  const runs = (conjunction: SubordinatingConjunction): PhrasePlan => ({
    subject: np('CAT'),
    verbPhrase: { verb: 'RUN' },
    adverbialClause: {
      conjunction,
      clause: { subject: np('DOG'), verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('TIRED') } } },
    },
  });

  test('until the dog is tired', () => {
    expect(say(runs('until'), 'ja')).toBe('猫は犬が疲れるまで走ります。');
  });

  test('before the dog is tired', () => {
    expect(say(runs('before'), 'ja')).toBe('猫は犬が疲れる前に走ります。');
  });

  test('other た-adjectives: an ichidan, a する and a godan verb', () => {
    const until = (adjective: string): PhrasePlan => ({
      subject: np('CAT'), verbPhrase: { verb: 'RUN' },
      adverbialClause: { conjunction: 'until', clause: { subject: np('DOG'), verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np(adjective) } } } },
    });
    expect(['CLOSED', 'UNCONNECTED', 'OPEN_ADJECTIVE'].map((a) => say(until(a), 'ja'))).toEqual([
      '猫は犬が閉じるまで走ります。', '猫は犬が孤立するまで走ります。', '猫は犬が開くまで走ります。',
    ]);
  });

  test('regression: when keeps the state, and the other six', () => {
    expect(say(runs('when'), 'ja')).toBe('猫は犬が疲れている時に走ります。');
    expect(sayAll(runs('until'))).toMatchObject({
      en: 'the cat runs until the dog is tired.', de: 'der Kater läuft, bis der Hund müde ist.',
      fr: "le chat court jusqu'à ce que le chien soit fatigué.",
    });
  });
});

// A347. A279 gave a Japanese state verb its 〜ている in a content clause and left the adverbial clause
// as it was: 犬が本を持つので, 持つ時に, 持つのに, which report an event (the dog takes hold of the
// book). A132 gives the main clause 持っています. The state wants 〜ている under ので, 時に and のに;
// 前に and まで keep the dictionary form (the event), and 間に already has the state.
describe('known bugs: a Japanese state verb in an adverbial clause takes the dictionary form (A347)', () => {
  const runs = (conjunction: SubordinatingConjunction, verbPhrase: Record<string, unknown> = {}, verb = 'HAVE', object = 'BOOK'): PhrasePlan => ({
    subject: np('CAT'),
    verbPhrase: { verb: 'RUN' },
    adverbialClause: { conjunction, clause: { subject: np('DOG'), verbPhrase: { verb, ...verbPhrase }, directObject: np(object) } },
  });

  test('because, when and though', () => {
    expect([runs('because'), runs('when'), runs('though')].map((p) => say(p, 'ja'))).toEqual([
      '猫は犬が本を持っているので走ります。',
      '猫は犬が本を持っている時に走ります。',
      '猫は犬が本を持っているのに走ります。',
    ]);
  });

  test('the past and the negative', () => {
    expect(say(runs('because', { tense: 'past' }), 'ja')).toBe('猫は犬が本を持っていたので走ります。');
    expect(say(runs('because', { negative: true }), 'ja')).toBe('猫は犬が本を持っていないので走ります。');
  });

  test('KNOW', () => {
    expect(say(runs('because', {}, 'KNOW', 'MAN'), 'ja')).toBe('猫は犬が男を知っているので走ります。');
  });

  test('KNOW\'s negative stays 知らない, when and though in the past, and から untouched', () => {
    expect([
      say(runs('because', { negative: true }, 'KNOW', 'MAN'), 'ja'),
      say(runs('when', { tense: 'past' }), 'ja'),
      say(runs('though', { tense: 'past', negative: true }), 'ja'),
      say(runs('since'), 'ja'),
    ]).toEqual([
      '猫は犬が男を知らないので走ります。',
      '猫は犬が本を持っていた時に走ります。',
      '猫は犬が本を持っていなかったのに走ります。',
      '猫は犬が本を持ってから走ります。',
    ]);
  });

  test('regression: while, before, after and until', () => {
    expect([runs('while'), runs('before'), runs('after'), runs('until')].map((p) => say(p, 'ja'))).toEqual([
      '猫は犬が本を持っている間に走ります。',
      '猫は犬が本を持つ前に走ります。',
      '猫は犬が本を持った後で走ります。',
      '猫は犬が本を持つまで走ります。',
    ]);
  });
});
