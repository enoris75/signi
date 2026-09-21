import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// The infinitive is a MOOD occupying the finite slot, exactly as the imperative is: the verb
// takes its dictionary citation form and the subject is dropped. Unlike the imperative it is not
// a speech act — no one is addressed — so it carries no register and the subject's person is
// irrelevant. A plan supplies a throwaway GENERIC_PERSON subject purely to satisfy resolution;
// it is never rendered. Being a mood it forces present / neutral / modal-free (see the
// normalisation note below). This is what a verb's dictionary definition is phrased as.
const infinitive = (
  plan: Partial<PhrasePlan> = {},
  verbPhrase: Partial<VerbPhrase> = {},
): PhrasePlan => ({
  ...clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase }),
  infinitive: true,
  ...plan,
});

describe('infinitive', () => {
  test('drops the subject and renders the citation form', () => {
    expect(sayAll(infinitive())).toEqual({
      en: 'to eat.',
      it: 'mangiare.',
      fr: 'manger.',
      es: 'comer.',
      pt: 'comer.',
      de: 'essen.',
      ja: '食べる。', // the plain dictionary form
    });
  });

  test('the object and complements still render', () => {
    expect(sayAll(infinitive({ directObject: np('FOOD') }))).toMatchObject({
      en: 'to eat the food.',
      it: 'mangiare il cibo.',
      de: 'das Essen essen.', // object-first, infinitive clause-final
      ja: '食べ物を食べる。',
    });

    expect(sayAll(infinitive({}, { modifier: 'FAST' }))).toMatchObject({
      en: 'to eat fast.',
      de: 'schnell essen.',
      ja: '速く食べる。',
    });

    expect(sayAll(infinitive({ complements: { locative: { phrase: np('HOUSE') } } })))
      .toMatchObject({
        en: 'to eat in the house.',
        it: 'mangiare nella casa.',
        ja: '家で食べる。',
      });
  });

  // The whole point of a dedicated mode: the citation form is NOT the imperative `instruction`
  // register. English prefixes "to" (the instruction's bare "eat"); Italian uses the true
  // infinitive "mangiare" (its instruction/imperative "mangia"); Japanese the dictionary form
  // 食べる (its instruction verbal noun 食べ). Only fr/es/pt/de coincide — expected, since those
  // languages already label controls with the infinitive.
  test('is a citation, distinct from the imperative instruction register', () => {
    const inf = sayAll(infinitive());
    expect(inf).toMatchObject({ en: 'to eat.', it: 'mangiare.', ja: '食べる。' });

    const instruction = sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT'),
      imperative: true,
      imperativeRegister: 'instruction',
    });
    expect(instruction).toMatchObject({ en: 'eat.', it: 'mangia.', ja: '食べ。' });
    // …but the four label-with-the-infinitive languages agree with the citation.
    expect(inf).toMatchObject({ fr: 'manger.', es: 'comer.', pt: 'comer.', de: 'essen.' });
  });

  test('the throwaway subject never surfaces — any subject renders the same', () => {
    expect(sayAll(infinitive({ subject: np('SECOND_PERSON') })))
      .toEqual(sayAll(infinitive()));
    expect(sayAll(infinitive({ subject: np('DOG') })))
      .toEqual(sayAll(infinitive()));
  });
});

// REPEATEDLY, seeded as a verb-definition differentia ("to strike repeatedly"). It carries no
// `frequency` subtype, so it takes the manner position FAST does — after the verb in English and
// Romance, before the clause-final infinitive in German, before the verb in Japanese — and not the
// pre-verbal slot of the frequency adverb ALWAYS ("always eats"). French renders it as the fixed
// phrase "à plusieurs reprises".
describe('infinitive: the manner adverb REPEATEDLY', () => {
  test('follows the verb, with or without an object', () => {
    expect(sayAll(infinitive({}, { modifier: 'REPEATEDLY' }))).toEqual({
      en: 'to eat repeatedly.',
      it: 'mangiare ripetutamente.',
      fr: 'manger à plusieurs reprises.',
      es: 'comer repetidamente.',
      pt: 'comer repetidamente.',
      de: 'wiederholt essen.',
      ja: '繰り返し食べる。',
    });
    expect(sayAll(infinitive({ directObject: np('MOUSE') }, { modifier: 'REPEATEDLY' }))).toEqual({
      en: 'to eat the mouse repeatedly.', // English puts the object first
      it: 'mangiare ripetutamente il topo.',
      fr: 'manger à plusieurs reprises la souris.',
      es: 'comer repetidamente el ratón.',
      pt: 'comer repetidamente o rato.',
      de: 'wiederholt die Maus essen.',
      ja: 'ネズミを繰り返し食べる。',
    });
  });

  test('takes the manner slot in a finite clause too, not the frequency one', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'REPEATEDLY', tense: 'past' } }))).toEqual({
      en: 'the cat ate repeatedly.',
      it: 'il gatto mangiò ripetutamente.',
      fr: 'le chat mangea à plusieurs reprises.',
      es: 'el gato comió repetidamente.',
      pt: 'o gato comeu repetidamente.',
      de: 'der Kater fraß wiederholt.',
      ja: '猫は繰り返し食べました。',
    });
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'REPEATEDLY' } })).en).toBe('the cat eats repeatedly.');
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'ALWAYS' } })).en).toBe('the cat always eats.');
  });
});

describe('infinitive negation', () => {
  test('brackets the citation, not a finite verb', () => {
    expect(sayAll(infinitive({}, { negative: true }))).toMatchObject({
      en: 'not to eat.',
      it: 'non mangiare.',
      fr: 'ne pas manger.',
      es: 'no comer.',
      pt: 'não comer.',
      de: 'nicht essen.',
    });
  });

  // A citation is plain, so its negative is the plain nai-form, as a relative clause's is (B13). It
  // used to fall back to the polite 食べません, the wrong register for a citation.
  test('Japanese cites the plain negative', () => {
    expect(sayAll(infinitive({}, { negative: true })).ja).toBe('食べない。');
    expect(sayAll(infinitive({}, { verb: 'COME', negative: true })).ja).toBe('来ない。');
    expect(sayAll(infinitive({ directObject: np('MOUSE') }, { modifier: 'NEVER' })).ja).toBe('ネズミを決して食べない。');
  });
});

// A mood occupying the finite slot: a tensed / aspectual / modal infinitive is not meaningful.
// The UI forbids it; the translator normalises it anyway, so a stale or hand-built plan cannot
// feed one to the engines.
describe('infinitive normalisation', () => {
  test('tense, aspect and modals are all discarded', () => {
    const plain = sayAll(infinitive());
    expect(sayAll(infinitive({}, { tense: 'past' }))).toEqual(plain);
    expect(sayAll(infinitive({}, { aspect: 'progressive' }))).toEqual(plain);
    expect(sayAll(infinitive({}, { modals: ['MUST'] }))).toEqual(plain);
  });
});

// A49, the infinitive half. The citation phrase shares the instruction register's word order, and
// its "nicht" placement with it: after the adverb and after the predicate complement.
describe('known bugs: German "nicht" in the infinitive', () => {
  test('German puts "nicht" before the adverb and the predicate complement', () => {
    expect(sayAll(infinitive({}, { negative: true, modifier: 'ALWAYS' })).de).toBe('nicht immer essen.');
    expect(sayAll({
      ...clause(np('GENERIC_PERSON'), 'BE', { verbPhrase: { negative: true }, complements: { predicative: { phrase: np('TIRED') } } }),
      infinitive: true,
    }).de).toBe('nicht müde sein.');
  });

  const predicate = (verb: string, phrase: NounPhrase, verbPhrase: Partial<VerbPhrase>) =>
    sayAll({ ...clause(np('GENERIC_PERSON'), verb, { verbPhrase, complements: { predicative: { phrase } } }), infinitive: true }).de;

  // A manner adverb takes the same slot as a frequency one; an adverb leads a predicate complement
  // too ("nicht immer müde sein"); BECOME and SEEM's predicate take the "nicht" of BE's.
  test('German puts "nicht" before every adverb and every predicate complement', () => {
    expect(sayAll(infinitive({}, { negative: true, modifier: 'FAST' })).de).toBe('nicht schnell essen.');
    expect(sayAll(infinitive({ directObject: np('FOOD') }, { negative: true, modifier: 'ALWAYS' })).de).toBe('nicht immer das Essen essen.');
    expect(predicate('BE', np('TIRED'), { negative: true, modifier: 'ALWAYS' })).toBe('nicht immer müde sein.');
    expect(predicate('BECOME', np('TIRED'), { negative: true })).toBe('nicht müde werden.');
    expect(predicate('SEEM', np('LEGEND', { definiteness: 'indefinite' }), { negative: true })).toBe('nicht eine Legende zu sein scheinen.');
  });

  // Regression guards: "nicht" still trails the objects with no adverb or predicate, and "nie" still
  // stands in for it.
  test('German keeps "nicht" after the objects, and "nie" in its place', () => {
    expect(sayAll(infinitive({ directObject: np('FOOD') }, { negative: true })).de).toBe('das Essen nicht essen.');
    expect(sayAll(infinitive({}, { negative: true })).de).toBe('nicht essen.');
    expect(sayAll(infinitive({}, { negative: true, modifier: 'NEVER' })).de).toBe('nie essen.');
    expect(predicate('BE', np('TIRED'), {})).toBe('müde sein.');
  });
});

// A119, the infinitive half. The citation phrase shares the command's negation gate: "nicht" stays
// beside a "kein" object, and "kein" stays under "nie".
describe('known bugs: German "kein" object in the infinitive', () => {
  const noMouse = np('MOUSE', { definiteness: 'no' });

  test('German drops "nicht" beside a "kein" object, and "kein" under "nie"', () => {
    expect(sayAll(infinitive({ directObject: noMouse }, { negative: true })).de).toBe('keine Maus essen.');
    expect(sayAll(infinitive({ directObject: noMouse }, { negative: true, modifier: 'FAST' })).de).toBe('schnell keine Maus essen.');
    expect(sayAll(infinitive({ directObject: noMouse }, { modifier: 'NEVER' })).de).toBe('nie eine Maus essen.');
  });

  test('regression: a definite object keeps "nicht", and "nie" alone negates', () => {
    expect(sayAll(infinitive({ directObject: np('MOUSE') }, { negative: true })).de).toBe('die Maus nicht essen.');
    expect(sayAll(infinitive({}, { modifier: 'NEVER' })).de).toBe('nie essen.');
  });
});

// A91. A negated French infinitive puts both negators before it and the clitic after them: "ne pas
// le voir", "ne jamais manger", "ne manger aucune souris". The infinitive and instruction branches
// of `predicateText` prefix a fixed "ne pas" only when `negative` is set, ignore jamais/aucun, and
// let `frCliticize` slip the clitic in after "ne ".
describe('known bugs: French negative infinitive', () => {
  const inf = (verb: string, extra: Parameters<typeof clause>[2] = {}) =>
    sayAll({ ...clause(np('GENERIC_PERSON'), verb, extra), infinitive: true }).fr;
  const instruction = (verb: string, extra: Parameters<typeof clause>[2] = {}) =>
    sayAll({ ...clause(np('SECOND_PERSON'), verb, extra), imperative: true, imperativeRegister: 'instruction' }).fr;

  test('French builds "ne pas / ne jamais / ne … aucun" around the infinitive', () => {
    expect(instruction('SEE', { directObject: np('THIRD_PERSON'), verbPhrase: { negative: true } })).toBe('ne pas le voir.');
    expect(inf('ADD', { directObject: np('THIRD_PERSON'), verbPhrase: { negative: true } })).toBe("ne pas l'ajouter.");
    expect(inf('EAT', { verbPhrase: { modifier: 'NEVER' } })).toBe('ne jamais manger.');
    expect(inf('EAT', { verbPhrase: { modifier: 'NEVER', negative: true } })).toBe('ne jamais manger.');
    expect(inf('EAT', { directObject: np('MOUSE', { definiteness: 'no' }) })).toBe('ne manger aucune souris.');
    expect(instruction('EAT', { directObject: np('MOUSE', { definiteness: 'no' }) })).toBe('ne manger aucune souris.');
    expect(inf('RUN', { complements: { locative: { phrase: np('HOUSE', { definiteness: 'no' }) } } }))
      .toBe('ne courir dans aucune maison.');
  });

  test('French keeps the negation in front with a vowel-initial verb, a feminine clitic and a dislocated group', () => {
    expect(inf('LOVE', { directObject: np('CAT', { definiteness: 'no' }) })).toBe("n'aimer aucun chat.");
    expect(inf('LOVE', { verbPhrase: { negative: true } })).toBe('ne pas aimer.');
    expect(inf('SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { modifier: 'NEVER' } })).toBe('ne jamais la voir.');
    expect(inf('EAT', { directObject: np('MOUSE', { definiteness: 'no' }), verbPhrase: { negative: true } })).toBe('ne manger aucune souris.');
    expect(instruction('RUN', { verbPhrase: { modifier: 'NEVER' } })).toBe('ne jamais courir.');
    expect(instruction('LOVE', { directObject: np('FIRST_PERSON'), verbPhrase: { negative: true } })).toBe("ne pas m'aimer.");
    expect(instruction('SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' }, verbPhrase: { negative: true } }))
      .toBe('ne pas nous voir, lui et moi.');
  });

  test('regression: an affirmative infinitive is unchanged', () => {
    expect(inf('EAT')).toBe('manger.');
    expect(inf('EAT', { directObject: np('THIRD_PERSON') })).toBe('le manger.');
  });
});
