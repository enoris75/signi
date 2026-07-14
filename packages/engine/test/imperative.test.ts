import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// An imperative is a MOOD, not a tense: the verb takes the command form and the subject is
// dropped, but `subject` still carries the addressee, which is what picks the person and number
// of that form. Being a mood it occupies the finite slot, so it is mutually exclusive with a
// condition and it forces present / neutral / modal-free — see `normalise` in translator.ts.
const command = (
  plan: Partial<PhrasePlan> = {},
  addressee: NounPhrase = np('SECOND_PERSON'),
  verbPhrase: Partial<VerbPhrase> = {},
): PhrasePlan => ({
  ...clause(addressee, 'EAT', { verbPhrase }),
  imperative: true,
  ...plan,
});

describe('imperative', () => {
  test('drops the subject and renders the command form', () => {
    expect(sayAll(command())).toEqual({
      en: 'eat.',
      it: 'mangia.',
      fr: 'mange.',
      es: 'come.',
      pt: 'coma.', // Portuguese commands with the subjunctive
      de: 'iss.',
      ja: '食べてください。', // the polite request ～てください
    });
  });

  test('the rest of the clause still renders', () => {
    expect(sayAll(command({ directObject: np('FOOD') }))).toMatchObject({
      en: 'eat the food.',
      it: 'mangia il cibo.',
      de: 'iss das Essen.',
      ja: '食べ物を食べてください。',
    });

    expect(sayAll(command({}, np('SECOND_PERSON'), { modifier: 'FAST' }))).toMatchObject({
      en: 'eat fast.',
      de: 'iss schnell.',
      ja: '速く食べてください。',
    });

    expect(sayAll(command({ complements: { locative: { phrase: np('HOUSE') } } })))
      .toMatchObject({
        en: 'eat in the house.',
        it: 'mangia nella casa.',
        ja: '家で食べてください。',
      });
  });
});

describe('imperative addressee', () => {
  test('2nd plural', () => {
    expect(sayAll(command({}, np('SECOND_PERSON', { number: 'plural' })))).toMatchObject({
      it: 'mangiate.',
      fr: 'mangez.',
      es: 'comed.', // vosotros
      pt: 'comam.',
      de: 'esst.',
    });
  });

  test('1st plural is the hortative — "let\'s eat"', () => {
    expect(sayAll(command({}, np('FIRST_PERSON', { number: 'plural' })))).toMatchObject({
      en: "let's eat.",
      it: 'mangiamo.',
      fr: 'mangeons.',
      es: 'comamos.',
      de: 'essen wir.',
      ja: '食べましょう。', // the cohortative ～ましょう
    });
  });
});

describe('imperative negation', () => {
  test('2nd singular', () => {
    expect(sayAll(command({}, np('SECOND_PERSON'), { negative: true }))).toMatchObject({
      en: 'do not eat.',
      it: 'non mangiare.', // Italian negates the 2sg imperative with the INFINITIVE
      fr: 'ne mange pas.',
      es: 'no comas.', // Spanish switches to the subjunctive
      de: 'iss nicht.',
      ja: '食べるな。', // the plain prohibitive ～な — see the register note below
    });
  });

  test('2nd plural — Italian stops using the infinitive here', () => {
    expect(sayAll(command({}, np('SECOND_PERSON', { number: 'plural' }), { negative: true })))
      .toMatchObject({
        it: 'non mangiate.', // "non" + the affirmative form, unlike the 2sg
        fr: 'ne mangez pas.',
        es: 'no comáis.',
        de: 'esst nicht.',
      });
  });

  test('1st plural', () => {
    expect(sayAll(command({}, np('FIRST_PERSON', { number: 'plural' }), { negative: true })))
      .toMatchObject({
        en: "let's not eat.",
        it: 'non mangiamo.',
        fr: 'ne mangeons pas.',
        es: 'no comamos.',
        de: 'essen wir nicht.',
      });
  });
});

// A `request` is addressed to someone (the default). An `instruction` — a button, a menu entry,
// a recipe step — is addressed to nobody, so most languages do NOT use the imperative for it.
describe('imperative register', () => {
  const instruction = (verb = 'EAT', plan: Partial<PhrasePlan> = {}) =>
    sayAll({
      ...clause(np('SECOND_PERSON'), verb),
      imperative: true,
      imperativeRegister: 'instruction',
      ...plan,
    });

  test('request is the default', () => {
    expect(sayAll(command({ imperativeRegister: 'request' })))
      .toEqual(sayAll(command()));
  });

  test('an instruction labels rather than commands', () => {
    expect(instruction()).toMatchObject({
      // Romance and German label with the infinitive, as a manual does…
      fr: 'manger.',
      es: 'comer.',
      pt: 'comer.',
      de: 'essen.',
      en: 'eat.', // English labels with the plain imperative
      // …but Italian labels with the imperative ("Salva", "Carica"), so an instruction only
      // pins the person to tu; and Japanese labels with the VERBAL NOUN (保存, 読み込み), not a
      // command at all. Both are deliberate — see it.ts and jaImperativeSegs in ja.ts.
      it: 'mangia.',
      ja: '食べ。',
    });
  });

  test('an instruction has no addressee, so a plural one changes nothing', () => {
    expect(sayAll({
      ...clause(np('SECOND_PERSON', { number: 'plural' }), 'EAT'),
      imperative: true,
      imperativeRegister: 'instruction',
    })).toEqual(instruction());
  });

  test('a negative instruction is a negated infinitive', () => {
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT'),
      imperative: true,
      imperativeRegister: 'instruction',
      verbPhrase: { verb: 'EAT', negative: true },
    })).toMatchObject({
      fr: 'ne pas manger.', // the negation brackets the infinitive, not the finite verb
      es: 'no comer.',
      de: 'nicht essen.',
      it: 'non mangiare.',
    });
  });

  test('Japanese prefers a seeded label form where the lexeme has one', () => {
    // SAVE carries a `label` form on its ja lexeme (保存), which is what the UI's button says.
    expect(instruction('SAVE', { directObject: np('BOOK') })).toMatchObject({
      ja: '本を保存。',
      de: 'das Buch speichern.',
      en: 'save the book.',
    });
  });
});

// An imperative is a mood occupying the finite slot, so a tensed / aspectual / modal imperative
// is not meaningful. The UI forbids it; the translator normalises it anyway, so that a stale or
// hand-built plan cannot feed one to the engines.
describe('imperative normalisation', () => {
  test('tense, aspect and modals are all discarded', () => {
    const plain = sayAll(command());

    expect(sayAll(command({}, np('SECOND_PERSON'), { tense: 'past' }))).toEqual(plain);
    expect(sayAll(command({}, np('SECOND_PERSON'), { aspect: 'progressive' }))).toEqual(plain);
    expect(sayAll(command({}, np('SECOND_PERSON'), { modals: ['MUST'] }))).toEqual(plain);
  });
});

// Two commands coordinate ("eat the bread, then run!"), but a statement and a command do not —
// so the mood belongs to the pair, and an imperative hands its mood and addressee down to the
// clause it coordinates with. Only `and`, `then`, `but` and `or` may join two commands.
describe('imperative coordination', () => {
  const andThen = (conjunction: 'and' | 'then' | 'but' | 'or' | 'therefore' | 'that_is') =>
    sayAll(command({
      coordination: {
        conjunction,
        clause: { ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true },
      },
    }));

  test('the coordinated clause is a command too', () => {
    expect(sayAll(command({
      directObject: np('FOOD'),
      coordination: {
        conjunction: 'then',
        clause: { ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true },
      },
    }))).toMatchObject({
      en: 'eat the food, and then run.',
      it: 'mangia il cibo, e poi corri.',
      de: 'iss das Essen, und dann lauf.',
    });
  });

  test('the conjunctions a command may take', () => {
    expect(andThen('but')).toMatchObject({ en: 'eat, but run.', de: 'iss, aber lauf.' });
    expect(andThen('or')).toMatchObject({ en: 'eat, or run.', de: 'iss, oder lauf.' });
  });

  test('a conjunction a command may NOT take falls back to "and"', () => {
    // "therefore" and "that is" are explicative/conclusive — they relate propositions, and a
    // command asserts nothing to relate. The translator rewrites them rather than emitting them.
    expect(andThen('therefore')).toEqual(andThen('and'));
    expect(andThen('that_is')).toEqual(andThen('and'));
    expect(andThen('therefore')).toMatchObject({ en: 'eat, and run.' });
  });
});

describe('known bugs: imperative', () => {
  // Japanese negates the 2nd-person command (食べるな) but silently DROPS the negation on the
  // 1st-plural hortative: "let's not eat" comes out as 食べましょう — which is "let's eat", the
  // exact opposite. Every other language negates it (let's not eat / non mangiamo / ne mangeons
  // pas). ja.ts documents a register gap for the 2nd person's negative, not this.
  //
  // The target below (～のはやめましょう, "let's stop/refrain from") is one of several possible
  // renderings — 食べないでおきましょう would do as well — so treat the surface as a design call.
  // What is not in doubt is that it must not be the affirmative.
  test.fails('Japanese should not render "let\'s not eat" as the affirmative 食べましょう', () => {
    expect(sayAll(command({}, np('FIRST_PERSON', { number: 'plural' }), { negative: true })).ja)
      .not.toBe('食べましょう。');
  });
});
