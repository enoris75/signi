import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

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
      // command at all. Both are deliberate — see it/predicateText.ts and ja/jaImperativeSegs.ts.
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
  // pas). The Japanese engine documents a register gap for the 2nd person's negative, not this.
  //
  // The target below (～のはやめましょう, "let's stop/refrain from") is one of several possible
  // renderings — 食べないでおきましょう would do as well — so treat the surface as a design call.
  // What is not in doubt is that it must not be the affirmative.
  test('Japanese should not render "let\'s not eat" as the affirmative 食べましょう', () => {
    expect(sayAll(command({}, np('FIRST_PERSON', { number: 'plural' }), { negative: true })).ja)
      .not.toBe('食べましょう。');
  });

  // The concrete form: the negative hortative rides やめる ("stop") — 〜のはやめましょう ("let's
  // refrain from …") — so ～ましょう carries the hortative and the negation survives. It builds on
  // the dictionary form, so it generalises to any verb and keeps the object before it.
  const usNot = (verb: string, directObject?: NounPhrase): PhrasePlan => ({
    ...clause(np('FIRST_PERSON', { number: 'plural' }), verb, {
      verbPhrase: { negative: true },
      ...(directObject ? { directObject } : {}),
    }),
    imperative: true,
  });
  test('Japanese renders the negative hortative as 〜のはやめましょう', () => {
    expect(sayAll(usNot('EAT')).ja).toBe('食べるのはやめましょう。');
    expect(sayAll(usNot('RUN')).ja).toBe('走るのはやめましょう。');
    expect(sayAll(usNot('EAT', np('MOUSE'))).ja).toBe('ネズミを食べるのはやめましょう。');
    // Regression: the affirmative hortative is unchanged.
    expect(sayAll(command({}, np('FIRST_PERSON', { number: 'plural' }), {})).ja).toBe('食べましょう。');
  });
});

// A48. The German du-imperative was the bare infinitive stem ("lauf", "geh"), with a concept-keyed
// override table patching some of the verbs that need more. Nine seeded verbs fell through:
//
//     was   schneid / töt / enthalt / verdicht / werd / ordn / erweiter / vermittel / geb
//     now   schneide / töte / enthalte / verdichte / werde / ordne / erweitere / vermittle / gib
//
// The regular cases are now a rule: a stem in -d/-t or in a consonant + m/n keeps the -e, and
// -ern/-eln keep or shift it. The strong e→i/ie verbs (iss, lies, sieh, gib) and the suppletive
// sei/seien/wisse are stored on the lexeme as `2sg_imperative` / `1pl_imperative`.
describe('known bugs: German du-imperative forms', () => {
  const du = (verb: string) => sayAll({ ...clause(np('SECOND_PERSON'), verb), imperative: true }).de;

  test('German builds the du-imperative of every seeded verb correctly', () => {
    expect(du('CUT')).toBe('schneide.');
    expect(du('KILL')).toBe('töte.');
    expect(du('HOLD')).toBe('enthalte.');
    expect(du('COMPACT')).toBe('verdichte.');
    expect(du('BECOME')).toBe('werde.');
    expect(du('TIDY_UP')).toBe('ordne.');
    expect(du('EXPAND')).toBe('erweitere.');
    expect(du('EXPRESS')).toBe('vermittle.');
    expect(du('GIVE')).toBe('gib.');
  });

  // Every seeded verb, so a new verb whose du form the rule gets wrong shows up here. The bare stems
  // (lauf, konsumier, lösch) are optional-e forms and correct; SELECT/ADD/EXPORT/IMPORT/CLEAR/
  // COORDINATE store the -e form on the lexeme.
  test.each([
    ['ADD', 'addiere'], ['APPEAR', 'erschein'], ['BE', 'sei'], ['BEAT', 'schlag'], ['BECOME', 'werde'],
    ['BITE', 'beiß'], ['BURN', 'brenn'], ['BUY', 'kauf'], ['CHOOSE', 'wähl'], ['CLEAR', 'lösche'],
    ['CLICK', 'klick'], ['COLLAPSE', 'kollabier'], ['COME', 'komm'], ['COMPACT', 'verdichte'],
    ['CONSUME', 'konsumier'], ['COORDINATE', 'koordiniere'], ['CREATE', 'erschaff'], ['CRY', 'wein'],
    ['CRY_OUT', 'ruf'], ['CUT', 'schneide'], ['DESCRIBE', 'beschreib'], ['DRINK', 'trink'], ['EAT', 'iss'],
    ['EXPAND', 'erweitere'], ['EXPORT', 'exportiere'], ['EXPRESS', 'vermittle'], ['EXTINGUISH', 'lösch'],
    ['GIVE', 'gib'], ['GO', 'geh'], ['HIDE', 'versteck'], ['HOLD', 'enthalte'], ['IMPORT', 'importiere'],
    ['JUMP', 'spring'], ['KILL', 'töte'], ['KNOW', 'wisse'], ['LOAD', 'lade'], ['LOVE', 'lieb'],
    ['MAKE', 'mach'], ['MODIFY', 'modifizier'], ['NAME', 'benenn'], ['OWN', 'besitz'], ['READ', 'lies'],
    ['REPLACE', 'ersetz'], ['RUN', 'lauf'], ['SAVE', 'speichere'], ['SEE', 'sieh'], ['SEEM', 'schein'],
    ['SELECT', 'selektiere'], ['SEND', 'schick'], ['SET_ON_FIRE', 'verbrenn'], ['SHOW', 'zeig'],
    ['START', 'beginn'], ['TIDY_UP', 'ordne'], ['TYPE', 'tipp'],
  ])('%s → "%s."', (verb, want) => {
    expect(du(verb)).toBe(`${want}.`);
  });

  test('the du form carries the rest of the command', () => {
    const de = (verb: string, extra: Parameters<typeof clause>[2]) =>
      sayAll({ ...clause(np('SECOND_PERSON'), verb, extra), imperative: true }).de;
    expect(de('CUT', { verbPhrase: { negative: true }, directObject: np('FOOD') })).toBe('schneide das Essen nicht.');
    expect(de('GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('BOY') } } })).toBe('gib dem Jungen das Buch.');
    expect(de('BECOME', { complements: { predicative: { phrase: np('TIRED') } } })).toBe('werde müde.');
    expect(de('EXPAND', { verbPhrase: { modifier: 'FAST' } })).toBe('erweitere schnell.');
  });

  test('ihr, the wir cohortative and the instruction register are unchanged', () => {
    const de = (verb: string, subject: NounPhrase, plan: Partial<PhrasePlan> = {}) =>
      sayAll({ ...clause(subject, verb), imperative: true, ...plan }).de;
    const ihr = np('SECOND_PERSON', { number: 'plural' });
    const wir = np('FIRST_PERSON', { number: 'plural' });
    expect(de('GIVE', ihr)).toBe('gebt.');
    expect(de('CUT', ihr)).toBe('schneidet.');
    expect(de('GIVE', wir)).toBe('geben wir.');
    expect(de('BE', wir)).toBe('seien wir.');
    expect(de('BE', ihr)).toBe('seid.');
    expect(de('GIVE', np('SECOND_PERSON'), { imperativeRegister: 'instruction' })).toBe('geben.');
    expect(de('CUT', np('SECOND_PERSON'), { imperativeRegister: 'instruction' })).toBe('schneiden.');
  });
});

// A49. The imperative (and its instruction register) places "nicht" after every other word of the
// clause, with no counterpart of the declarative "nicht immer" / "nicht müde" rules: "nicht" belongs
// before a Mittelfeld adverb and before a predicate complement.
describe('known bugs: German "nicht" in commands and instructions', () => {
  const eatNot = (modifier: string, plan: Partial<PhrasePlan> = {}) =>
    sayAll(command(plan, np('SECOND_PERSON'), { negative: true, modifier })).de;

  test('German puts "nicht" before the adverb and the predicate complement', () => {
    expect(eatNot('FAST')).toBe('iss nicht schnell.');
    expect(eatNot('ALWAYS')).toBe('iss nicht immer.');
    expect(eatNot('ALWAYS', { imperativeRegister: 'instruction' })).toBe('nicht immer essen.');
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'BE', { verbPhrase: { negative: true }, complements: { predicative: { phrase: np('TIRED') } } }),
      imperative: true,
      imperativeRegister: 'instruction',
    }).de).toBe('nicht müde sein.');
  });

  const beNot = (addressee: NounPhrase, modifier?: string, plan: Partial<PhrasePlan> = {}) =>
    sayAll({
      ...clause(addressee, 'BE', { verbPhrase: { negative: true, modifier }, complements: { predicative: { phrase: np('TIRED') } } }),
      imperative: true,
      ...plan,
    }).de;
  const ihr = np('SECOND_PERSON', { number: 'plural' });
  const wir = np('FIRST_PERSON', { number: 'plural' });

  // The same slots in every person: the ihr command and the wir cohortative.
  test('German puts "nicht" before the adverb in the ihr and wir forms too', () => {
    expect(sayAll(command({}, ihr, { negative: true, modifier: 'FAST' })).de).toBe('esst nicht schnell.');
    expect(sayAll(command({}, wir, { negative: true, modifier: 'ALWAYS' })).de).toBe('essen wir nicht immer.');
    expect(beNot(ihr)).toBe('seid nicht müde.');
    expect(beNot(wir)).toBe('seien wir nicht müde.');
  });

  // An adverb and a predicate complement together: "nicht" leads the adverb, as in "ist nicht immer müde".
  test('German puts "nicht" before an adverb that precedes the object or the predicate complement', () => {
    expect(eatNot('ALWAYS', { directObject: np('MOUSE') })).toBe('iss nicht immer die Maus.');
    expect(beNot(np('SECOND_PERSON'), 'ALWAYS')).toBe('sei nicht immer müde.');
    expect(beNot(np('SECOND_PERSON'), 'ALWAYS', { imperativeRegister: 'instruction' })).toBe('nicht immer müde sein.');
    expect(eatNot('FAST', { imperativeRegister: 'instruction' })).toBe('nicht schnell essen.');
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'BECOME', { verbPhrase: { negative: true }, complements: { predicative: { phrase: np('TIRED') } } }),
      imperative: true,
    }).de).toBe('werde nicht müde.');
  });

  // Regression guards: with no adverb or predicate complement "nicht" still trails the objects, a
  // negative adverb still replaces it, and an affirmative command is untouched.
  test('German keeps "nicht" after the objects, and "nie" in its place', () => {
    const eat = (plan: Partial<PhrasePlan>, verbPhrase: Partial<VerbPhrase>) => sayAll(command(plan, np('SECOND_PERSON'), verbPhrase)).de;
    expect(eat({ directObject: np('MOUSE') }, { negative: true })).toBe('iss die Maus nicht.');
    expect(eat({ directObject: np('MOUSE'), imperativeRegister: 'instruction' }, { negative: true })).toBe('die Maus nicht essen.');
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('BOY') } }, verbPhrase: { negative: true } }),
      imperative: true,
    }).de).toBe('gib dem Jungen das Buch nicht.');
    expect(eat({ complements: { locative: { phrase: np('MARKET') } } }, { negative: true })).toBe('iss im Markt nicht.');
    expect(eat({}, { negative: true, modifier: 'NEVER' })).toBe('iss nie.');
    expect(eat({ imperativeRegister: 'instruction' }, { negative: true, modifier: 'NEVER' })).toBe('nie essen.');
    expect(eat({ directObject: np('MOUSE') }, { modifier: 'FAST' })).toBe('iss schnell die Maus.');
  });
});

// A70. In an affirmative French command the object pronoun follows the verb, hyphenated, with
// me/te as moi/toi: "vois-moi", "effondre-toi". The imperative branch of `predicateText` uses the
// proclitic `frCliticize` for both polarities, and a reflexive verb's imperative is its present
// form with the reflexive clitic still in front ("t'effondre").
describe('known bugs: French affirmative imperative enclisis', () => {
  test.fails('French puts the clitic after an affirmative imperative', () => {
    const cmd = (verb: string, subject: string, extra: Parameters<typeof clause>[2] = {}, number?: 'plural') =>
      sayAll({ ...clause(np(subject, number ? { number } : {}), verb, extra), imperative: true }).fr;
    expect(cmd('SEE', 'SECOND_PERSON', { directObject: np('FIRST_PERSON') })).toBe('vois-moi.');
    expect(cmd('SEE', 'SECOND_PERSON', { directObject: np('THIRD_PERSON') })).toBe('vois-le.');
    expect(cmd('SEE', 'SECOND_PERSON', { directObject: np('FIRST_PERSON') }, 'plural')).toBe('voyez-moi.');
    expect(cmd('ADD', 'SECOND_PERSON', { directObject: np('THIRD_PERSON') })).toBe('ajoute-le.');
    expect(cmd('COLLAPSE', 'SECOND_PERSON')).toBe('effondre-toi.');
    expect(cmd('COLLAPSE', 'SECOND_PERSON', {}, 'plural')).toBe('effondrez-vous.');
    expect(cmd('COLLAPSE', 'FIRST_PERSON', {}, 'plural')).toBe('effondrons-nous.');
  });
});

// A86. The Italian negative tu command is "non" + infinitive, and `predicateText` appends the object
// clitic to the whole infinitive: "non mangiarelo". The infinitive drops its -e before an enclitic
// ("non mangiarlo"), as the infinitive mood already does. "non lo mangiare" is equally standard.
describe('known bugs: Italian negative tu command with an object pronoun', () => {
  test.fails('Italian drops the infinitive\'s -e before the clitic (non mangiarlo)', () => {
    expect(say({ ...clause(np('SECOND_PERSON'), 'EAT', { verbPhrase: { negative: true }, directObject: np('THIRD_PERSON') }), imperative: true }, 'it'))
      .toMatch(/^non (?:mangiarlo|lo mangiare)\.$/);
    expect(say({ ...clause(np('SECOND_PERSON'), 'SEE', { verbPhrase: { negative: true }, directObject: np('FIRST_PERSON') }), imperative: true }, 'it'))
      .toMatch(/^non (?:vedermi|mi vedere)\.$/);
    expect(say({ ...clause(np('SECOND_PERSON'), 'GIVE', { verbPhrase: { negative: true }, directObject: np('THIRD_PERSON'), complements: { terminus: { phrase: np('DOG') } } }), imperative: true }, 'it'))
      .toMatch(/^non (?:darlo|lo dare) al cane\.$/);
    expect(say({ ...clause(np('SECOND_PERSON'), 'EAT', { verbPhrase: { negative: true }, directObject: np('THIRD_PERSON') }), imperative: true, imperativeRegister: 'instruction' }, 'it'))
      .toMatch(/^non (?:mangiarlo|lo mangiare)\.$/);
  });
});

// A87. The Italian tu command of an -are verb is built from its 3sg present, which for dare/fare/
// andare is the indicative "dà/fa/va", not the command "da'/fa'/va'" (or "dai/fai/vai"). After those
// short forms an enclitic doubles its consonant ("dallo", "fallo"), but the clitic is just appended.
describe('known bugs: Italian tu command of dare, fare and andare', () => {
  test.fails('Italian uses da\'/fa\'/va\' and doubles the clitic after them', () => {
    expect(say({ ...clause(np('SECOND_PERSON'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG') } } }), imperative: true }, 'it'))
      .toMatch(/^(?:da'|dai) il libro al cane\.$/);
    expect(say({ ...clause(np('SECOND_PERSON'), 'GIVE', { directObject: np('THIRD_PERSON'), complements: { terminus: { phrase: np('DOG') } } }), imperative: true }, 'it'))
      .toBe('dallo al cane.');
    expect(say({ ...clause(np('SECOND_PERSON'), 'MAKE', { directObject: np('THIRD_PERSON') }), imperative: true }, 'it')).toBe('fallo.');
    expect(say({ ...clause(np('SECOND_PERSON'), 'MAKE', { directObject: np('BOOK') }), imperative: true }, 'it')).toMatch(/^(?:fa'|fai) il libro\.$/);
    expect(say({ ...clause(np('SECOND_PERSON'), 'GO'), imperative: true }, 'it')).toMatch(/^(?:va'|vai)\.$/);
  });
});

// A100. `imperativeForm` builds the Spanish command from stored forms that already carry a reflexive
// clitic. The tú form is `3sg_present` ("se vuelve"), the subjunctive stem is `1sg_present` minus -o
// ("me vuelv-"), and vosotros is the infinitive minus -r plus -d, which does nothing to "volverse".
// The clitic comes out in the wrong person, and in front of an affirmative command instead of
// attached after it.
describe('known bugs: Spanish reflexive imperative', () => {
  const legend = { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } };

  test.fails("Spanish puts the addressee's clitic before a negative command", () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BECOME', { verbPhrase: { negative: true }, complements: legend }), imperative: true }).es)
      .toBe('no te vuelvas una leyenda.');
  });

  test.fails("Spanish attaches the addressee's clitic to an affirmative command", () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BECOME', { complements: legend }), imperative: true }).es)
      .toBe('vuélvete una leyenda.');
    expect(sayAll({ ...clause(np('SECOND_PERSON', { number: 'plural' }), 'BECOME', { complements: legend }), imperative: true }).es)
      .toBe('volveos una leyenda.');
  });
});

// A103. `subjPresent` (mood.ts) builds every present-subjunctive person on `1sg_present` minus -o.
// A stem-changing verb then keeps its stressed stem in the 1st and 2nd plural ("muerdamos", want
// "mordamos"), as does a stem with a written í ("envíemos"). A 1sg present not in -o gives
// nonsense ("voy" → "voyas", "doy" → "doyes").
describe('known bugs: Spanish present-subjunctive stem in commands', () => {
  const command = (verb: string, addressee: 'tú' | 'nosotros' | 'vosotros', negative = false) => sayAll({
    ...clause(
      addressee === 'nosotros' ? np('FIRST_PERSON', { number: 'plural' })
        : addressee === 'tú' ? np('SECOND_PERSON') : np('SECOND_PERSON', { number: 'plural' }),
      verb,
      { verbPhrase: { negative } },
    ),
    imperative: true,
  }).es;

  test.fails('Spanish builds the 1st- and 2nd-plural command on the unstressed stem', () => {
    expect(command('BITE', 'nosotros')).toBe('mordamos.');
    expect(command('BITE', 'vosotros', true)).toBe('no mordáis.');
    expect(command('SHOW', 'nosotros')).toBe('mostremos.');
    expect(command('START', 'nosotros')).toBe('empecemos.');
    expect(command('SEND', 'nosotros')).toBe('enviemos.');
    expect(command('SEND', 'vosotros', true)).toBe('no enviéis.');
  });

  test.fails('Spanish GO and GIVE take their irregular subjunctive in commands', () => {
    expect(command('GO', 'tú', true)).toBe('no vayas.');
    expect(command('GO', 'nosotros')).toBe('vamos.');
    expect(command('GIVE', 'tú', true)).toBe('no des.');
    expect(command('GIVE', 'nosotros')).toBe('demos.');
  });
});

// A107. `imperativeForm` (mood.ts) builds every Portuguese command as the present subjunctive:
// the stored 1sg present minus -o, plus -e / -a. That misses dar and ir (1sg "dou" / "vou" have no
// -o), the ç → c spelling before -e (começar), the unstressed 1pl of -ear verbs (nomear), and a
// pronominal verb, whose stored 1sg carries "me" and whose base ends in -ar-se, not -ar.
describe('known bugs: Portuguese imperative stems', () => {
  const command = (verb: string, subject = np('SECOND_PERSON'), extra: Parameters<typeof clause>[2] = {}) =>
    sayAll({ ...clause(subject, verb, extra), imperative: true }).pt;
  const we = np('FIRST_PERSON', { number: 'plural' });
  const youAll = np('SECOND_PERSON', { number: 'plural' });
  const strong = { predicative: { phrase: np('STRONG') } };

  test.fails('Portuguese builds the present-subjunctive command of every seeded verb correctly', () => {
    expect(command('GIVE')).toBe('dê.');
    expect(command('GIVE', we)).toBe('demos.');
    expect(command('GIVE', youAll)).toBe('deem.');
    expect(command('GO')).toBe('vá.');
    expect(command('GO', we)).toBe('vamos.');
    expect(command('GO', youAll)).toBe('vão.');
    expect(command('START')).toBe('comece.');
    expect(command('NAME', we)).toBe('nomeemos.');
    expect(command('BECOME', np('SECOND_PERSON'), { complements: strong })).toBe('torne-se forte.');
    expect(command('BECOME', np('SECOND_PERSON'), { complements: strong, verbPhrase: { negative: true } })).toBe('não se torne forte.');
  });
});

// A110. `predicateSegs` builds a BE command as the になる-style predicative + してください. With する
// that is causative: 大きくしてください is "make it big", 幸せにしてください "make [me] happy". It also
// ignores the addressee, so "let's be big" is a request. Want なる: 大きくなってください, 1pl
// 大きくなりましょう. A noun or na-adjective may take でいてください instead, and both are accepted.
describe('known bugs: Japanese copula command', () => {
  test.fails('Japanese builds a copula command on なる (or いる), not on する', () => {
    const be = (predicate: string, subject = np('SECOND_PERSON'), negative = false) => sayAll({
      ...clause(subject, 'BE', { verbPhrase: { negative }, complements: { predicative: { phrase: np(predicate) } } }),
      imperative: true,
    }).ja;
    expect(be('LEGEND')).toMatch(/^伝説(になって|でいて)ください。$/);
    expect(be('HAPPY')).toMatch(/^幸せ(になって|でいて)ください。$/);
    expect(be('BIG')).toBe('大きくなってください。');
    expect(be('LEGEND', np('SECOND_PERSON'), true)).toMatch(/^伝説(にならないで|でいないで)ください。$/);
    expect(be('BIG', np('FIRST_PERSON', { number: 'plural' }))).toBe('大きくなりましょう。');
  });
});
