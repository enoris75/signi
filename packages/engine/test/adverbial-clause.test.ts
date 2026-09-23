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
