import { describe, expect, test } from 'vitest';
import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import {
  ALWAYS, BE, BECOME, BOOK, CAN, CAT, complement, complements, concept, DOG, EAT, el, FAST, type Forms, GIVE, GO, HE, HOUSE, I,
  LEGEND, modal, MOUSE, MUST, NEVER, np, SEE, SEEM, SHE, SLOWLY, THEY, TIRED, vp, WE, WILL, YOU,
} from './en.fixtures.js';
import { predicateParts } from './predicateParts.js';

/** The predicate as it reads in the sentence: the non-empty parts, space-joined. */
const said = (
  subject: Forms,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  comps?: Partial<Record<ComplementType, ResolvedComplement>>,
) => predicateParts(subject, verbPhrase, directObject, comps).filter(Boolean).join(' ');

const PLURAL_CATS: Forms = { ...CAT, number: 'plural' };
const mouse = el(np(MOUSE));
const noMouse = el(np(MOUSE, { definiteness: 'no' }));
const tired = complements({ predicative: complement(np(TIRED)) });
const always = concept(ALWAYS);
const never = concept(NEVER);
const fast = concept(FAST);

describe('predicateParts', () => {
  test('returns the slots in order: pre-verb adverb, verb, object, complements, trailing adverb', () => {
    expect(predicateParts(CAT, vp(EAT, { modifier: fast }), mouse)).toEqual(['', 'eats', 'the mouse', '', 'fast']);
    expect(predicateParts(CAT, vp(GIVE, { modifier: always }), el(np(BOOK)), complements({ terminus: complement(np(DOG)) })))
      .toEqual(['always', 'gives', 'the book', 'to the dog', '']);
  });

  describe('simple tenses', () => {
    test('the present agrees with the subject', () => {
      expect(said(CAT, vp(EAT), mouse)).toBe('eats the mouse');
      expect(said(I, vp(EAT))).toBe('eat');
      expect(said(YOU, vp(EAT))).toBe('eat');
      expect(said(PLURAL_CATS, vp(EAT))).toBe('eat');
    });

    test('the past is one form for every person', () => {
      expect(said(CAT, vp(EAT, { tense: 'past' }), mouse)).toBe('ate the mouse');
      expect(said(I, vp(EAT, { tense: 'past' }))).toBe('ate');
    });

    test('the future is will + the base', () => {
      expect(said(CAT, vp(EAT, { tense: 'future' }), mouse)).toBe('will eat the mouse');
      expect(said(CAT, vp(BE, { tense: 'future' }), undefined, tired)).toBe('will be tired');
    });

    test('the copula conjugates per person in the present and past', () => {
      expect(said(I, vp(BE), undefined, tired)).toBe('am tired');
      expect(said(CAT, vp(BE), undefined, tired)).toBe('is tired');
      expect(said(I, vp(BE, { tense: 'past' }), undefined, tired)).toBe('was tired');
      expect(said(YOU, vp(BE, { tense: 'past' }), undefined, tired)).toBe('were tired');
    });

    test('complements follow the object', () => {
      expect(said(CAT, vp(GIVE), el(np(BOOK)), complements({ terminus: complement(np(DOG)) }))).toBe('gives the book to the dog');
    });

    // A46: the governing verb reaches the predicative, so SEEM repairs a predicate noun where BECOME does not.
    test('a predicate noun under the seeming verb takes "to be" in every verb group', () => {
      const legend = complements({ predicative: complement(np(LEGEND, { definiteness: 'indefinite' })) });
      expect(said(CAT, vp(SEEM), undefined, legend)).toBe('seems to be a legend');
      expect(said(CAT, vp(SEEM, { tense: 'past', negative: true }), undefined, legend)).toBe('did not seem to be a legend');
      expect(said(CAT, vp(SEEM, { modals: [modal(CAN)] }), undefined, legend)).toBe('can seem to be a legend');
      expect(said(CAT, vp(BECOME), undefined, legend)).toBe('becomes a legend');
      expect(said(CAT, vp(SEEM), undefined, tired)).toBe('seems tired');
    });
  });

  describe('adverbs', () => {
    test('a frequency adverb precedes a verb with no auxiliary', () => {
      expect(said(CAT, vp(EAT, { modifier: always }), mouse)).toBe('always eats the mouse');
      expect(said(CAT, vp(EAT, { tense: 'past', modifier: never }))).toBe('never ate');
    });

    test('a frequency adverb follows the future auxiliary', () => {
      expect(said(CAT, vp(EAT, { tense: 'future', modifier: always }))).toBe('will always eat');
      expect(said(CAT, vp(EAT, { tense: 'future', modifier: never }))).toBe('will never eat');
    });

    test('a manner adverb trails the object', () => {
      expect(said(CAT, vp(EAT, { modifier: fast }), mouse)).toBe('eats the mouse fast');
      expect(said(CAT, vp(EAT, { tense: 'future', modifier: fast }))).toBe('will eat fast');
    });
  });

  describe('objects', () => {
    test('a single pronoun object takes its object form with no article', () => {
      expect(said(CAT, vp(SEE), el(np(HE)))).toBe('sees him');
      expect(said(CAT, vp(SEE), el(np(SHE)))).toBe('sees her');
      expect(said(CAT, vp(SEE), el(np(THEY)))).toBe('sees them');
      expect(said(CAT, vp(SEE), el(np(I)))).toBe('sees me');
      expect(said(CAT, vp(SEE), el(np(WE)))).toBe('sees us');
    });

    test('a coordinated noun object renders as a group', () => {
      expect(said(CAT, vp(SEE), el(np(MOUSE), np(DOG)))).toBe('sees the mouse and the dog');
    });

    test('a coordinated object picks the object pronoun or the noun phrase per conjunct', () => {
      expect(said(CAT, vp(SEE), el(np(HE), np(I)))).toBe('sees him and me');
      expect(said(CAT, vp(SEE), el(np(DOG), np(SHE)))).toBe('sees the dog and her');
      expect(said(CAT, vp(SEE, { negative: true }), el(np(MOUSE, { definiteness: 'no' }), np(THEY)))).toBe('does not see any mouse and them');
    });

    test('a lone no object keeps no', () => {
      expect(said(CAT, vp(EAT), noMouse)).toBe('eats no mouse');
    });

    // English has no negative concord: under another negator the object takes the "any" series.
    test('a no object becomes any under a negated verb or a negative adverb', () => {
      expect(said(CAT, vp(EAT, { negative: true }), noMouse)).toBe('does not eat any mouse');
      expect(said(CAT, vp(EAT, { modifier: never }), noMouse)).toBe('never eats any mouse');
      expect(said(CAT, vp(EAT, { modals: [modal(MUST, NEVER)] }), noMouse)).toBe('must never eat any mouse');
      expect(said(CAT, vp(EAT, { negative: true }), el(np(MOUSE, { number: 'plural', definiteness: 'no' })))).toBe('does not eat any mice');
    });

    test('in a group only the `no` conjunct becomes any', () => {
      expect(said(CAT, vp(EAT, { negative: true }), el(np(DOG), np(MOUSE, { definiteness: 'no' })))).toBe('does not eat the dog and any mouse');
    });
  });

  describe('negation', () => {
    test('do-support agrees with the subject and carries the tense', () => {
      expect(said(CAT, vp(EAT, { negative: true }), mouse)).toBe('does not eat the mouse');
      expect(said(I, vp(EAT, { negative: true }))).toBe('do not eat');
      expect(said(PLURAL_CATS, vp(EAT, { negative: true }))).toBe('do not eat');
      expect(said(CAT, vp(EAT, { tense: 'past', negative: true }))).toBe('did not eat');
      expect(said(CAT, vp(EAT, { tense: 'future', negative: true }))).toBe('will not eat');
    });

    test('a frequency adverb sits between the auxiliary and the base; a manner adverb trails', () => {
      expect(said(CAT, vp(EAT, { negative: true, modifier: always }))).toBe('does not always eat');
      expect(said(CAT, vp(EAT, { tense: 'past', negative: true, modifier: always }))).toBe('did not always eat');
      expect(said(CAT, vp(EAT, { negative: true, modifier: fast }), mouse)).toBe('does not eat the mouse fast');
    });

    // A76: the copula is an auxiliary for adverb placement.
    test('a frequency adverb follows the copula and its not', () => {
      expect(said(CAT, vp(BE, { modifier: always }), undefined, tired)).toBe('is always tired');
      expect(said(CAT, vp(BE, { tense: 'past', modifier: never }), undefined, tired)).toBe('was never tired');
      expect(said(CAT, vp(BE, { negative: true, modifier: always }), undefined, tired)).toBe('is not always tired');
      expect(said(CAT, vp(BE, { negative: true, tense: 'future', modifier: always }), undefined, tired)).toBe('will not always be tired');
    });

    test('the copula negates on itself, never with do-support', () => {
      expect(said(CAT, vp(BE, { negative: true }), undefined, tired)).toBe('is not tired');
      expect(said(YOU, vp(BE, { tense: 'past', negative: true }), undefined, tired)).toBe('were not tired');
      expect(said(CAT, vp(BE, { tense: 'future', negative: true }), undefined, tired)).toBe('will not be tired');
    });

    test('a negative adverb is itself the negator, with no not', () => {
      expect(said(CAT, vp(EAT, { negative: true, modifier: never }))).toBe('never eats');
    });
  });

  describe('aspect', () => {
    test('the progressive is be + gerund, be agreeing and carrying the tense', () => {
      expect(said(CAT, vp(EAT, { aspect: 'progressive' }), mouse)).toBe('is eating the mouse');
      expect(said(I, vp(EAT, { aspect: 'progressive' }))).toBe('am eating');
      expect(said(PLURAL_CATS, vp(EAT, { aspect: 'progressive' }))).toBe('are eating');
      expect(said(YOU, vp(EAT, { tense: 'past', aspect: 'progressive' }))).toBe('were eating');
      expect(said(CAT, vp(EAT, { tense: 'future', aspect: 'progressive' }))).toBe('will be eating');
    });

    test('the prospective is be about to + base', () => {
      expect(said(CAT, vp(EAT, { aspect: 'prospective' }))).toBe('is about to eat');
      expect(said(I, vp(EAT, { tense: 'past', aspect: 'prospective' }))).toBe('was about to eat');
    });

    test('the resultative is have + participle, or be for a verb marked aux be', () => {
      expect(said(CAT, vp(EAT, { aspect: 'resultative' }), mouse)).toBe('has eaten the mouse');
      expect(said(I, vp(EAT, { aspect: 'resultative' }))).toBe('have eaten');
      expect(said(CAT, vp(EAT, { tense: 'past', aspect: 'resultative' }))).toBe('had eaten');
      expect(said(CAT, vp(EAT, { tense: 'future', aspect: 'resultative' }))).toBe('will have eaten');
      expect(said(CAT, vp(GO, { aspect: 'resultative' }))).toBe('is gone');
      expect(said(CAT, vp(BE, { aspect: 'resultative' }), undefined, tired)).toBe('has been tired');
    });

    test('not follows the first auxiliary', () => {
      expect(said(CAT, vp(EAT, { negative: true, aspect: 'progressive' }))).toBe('is not eating');
      expect(said(CAT, vp(EAT, { negative: true, aspect: 'resultative' }))).toBe('has not eaten');
      expect(said(CAT, vp(EAT, { tense: 'future', negative: true, aspect: 'progressive' }))).toBe('will not be eating');
    });

    test('a frequency adverb follows the first auxiliary; a manner adverb trails', () => {
      expect(said(CAT, vp(EAT, { aspect: 'resultative', modifier: always }))).toBe('has always eaten');
      expect(said(CAT, vp(EAT, { tense: 'future', aspect: 'progressive', modifier: always }))).toBe('will always be eating');
      expect(said(CAT, vp(EAT, { negative: true, aspect: 'resultative', modifier: never }))).toBe('has never eaten');
      expect(said(CAT, vp(EAT, { aspect: 'progressive', modifier: fast }), mouse)).toBe('is eating the mouse fast');
    });
  });

  describe('modals', () => {
    test('the outermost modal is finite and the main verb bare', () => {
      expect(said(CAT, vp(EAT, { modals: [modal(MUST)] }), mouse)).toBe('must eat the mouse');
      expect(said(CAT, vp(EAT, { modals: [modal(CAN)] }))).toBe('can eat');
      expect(said(CAT, vp(EAT, { modals: [modal(WILL)] }))).toBe('wants to eat');
      expect(said(I, vp(EAT, { modals: [modal(WILL)] }))).toBe('want to eat');
    });

    test('the lexicon suppletes the tenses a modal lacks', () => {
      expect(said(CAT, vp(EAT, { tense: 'past', modals: [modal(MUST)] }))).toBe('had to eat');
      expect(said(CAT, vp(EAT, { tense: 'future', modals: [modal(MUST)] }))).toBe('will have to eat');
      expect(said(CAT, vp(EAT, { tense: 'past', modals: [modal(CAN)] }))).toBe('could eat');
      expect(said(CAT, vp(EAT, { tense: 'future', modals: [modal(CAN)] }))).toBe('will be able to eat');
    });

    test('inner modals take their nonfinite form and link', () => {
      expect(said(CAT, vp(EAT, { modals: [modal(WILL), modal(CAN)] }))).toBe('wants to be able to eat');
      expect(said(CAT, vp(EAT, { modals: [modal(MUST), modal(CAN)] }))).toBe('must be able to eat');
      expect(said(CAT, vp(EAT, { modals: [modal(CAN), modal(WILL)] }))).toBe('can want to eat');
    });

    test('the main verb keeps its aspect in the infinitive', () => {
      expect(said(CAT, vp(EAT, { aspect: 'resultative', modals: [modal(MUST)] }))).toBe('must have eaten');
      expect(said(CAT, vp(EAT, { aspect: 'progressive', modals: [modal(MUST)] }))).toBe('must be eating');
      expect(said(CAT, vp(EAT, { aspect: 'prospective', modals: [modal(MUST)] }))).toBe('must be about to eat');
      expect(said(CAT, vp(GO, { aspect: 'resultative', modals: [modal(MUST)] }))).toBe('must be gone');
    });

    test('a true modal auxiliary takes not straight after it', () => {
      expect(said(CAT, vp(EAT, { negative: true, modals: [modal(CAN)] }))).toBe('cannot eat');
      expect(said(CAT, vp(EAT, { tense: 'past', negative: true, modals: [modal(CAN)] }))).toBe('could not eat');
      expect(said(CAT, vp(EAT, { tense: 'future', negative: true, modals: [modal(CAN)] }))).toBe('will not be able to eat');
      expect(said(CAT, vp(EAT, { negative: true, modals: [modal(CAN), modal(MUST)] }))).toBe('cannot have to eat');
    });

    // A negated MUST is scoped as ¬obligation in every tense (A23, fixed).
    test('MUST and the lexical want negate with do-support', () => {
      expect(said(CAT, vp(EAT, { negative: true, modals: [modal(MUST)] }))).toBe('does not have to eat');
      expect(said(PLURAL_CATS, vp(EAT, { negative: true, modals: [modal(MUST)] }))).toBe('do not have to eat');
      expect(said(CAT, vp(EAT, { tense: 'past', negative: true, modals: [modal(MUST)] }))).toBe('did not have to eat');
      expect(said(CAT, vp(EAT, { tense: 'future', negative: true, modals: [modal(MUST)] }))).toBe('will not have to eat');
      expect(said(CAT, vp(EAT, { negative: true, modals: [modal(WILL), modal(CAN)] }))).toBe('does not want to be able to eat');
    });

    test('a modal’s frequency adverb follows a modal auxiliary but precedes a lexical modal', () => {
      expect(said(CAT, vp(EAT, { modals: [modal(MUST, ALWAYS)] }))).toBe('must always eat');
      expect(said(CAT, vp(EAT, { modals: [modal(MUST, NEVER)] }))).toBe('must never eat');
      expect(said(CAT, vp(EAT, { modals: [modal(WILL, NEVER)] }))).toBe('never wants to eat');
      expect(said(CAT, vp(EAT, { modals: [modal(MUST), modal(CAN, ALWAYS)] }))).toBe('must always be able to eat');
    });

    test('the main verb’s frequency adverb sits right before its group, its manner adverb at the end', () => {
      expect(said(CAT, vp(EAT, { modals: [modal(MUST), modal(CAN)], modifier: always }))).toBe('must be able to always eat');
      expect(said(CAT, vp(EAT, { tense: 'past', modals: [modal(WILL, NEVER)], modifier: always }))).toBe('never wanted to always eat');
      expect(said(CAT, vp(EAT, { modals: [modal(CAN)], modifier: fast }), mouse)).toBe('can eat the mouse fast');
    });
  });

  describe('imperative', () => {
    const command = (extra: Parameters<typeof vp>[1] = {}) => vp(EAT, { mood: 'imperative', ...extra });

    test('a second-person command is the bare base, singular or plural', () => {
      expect(said(YOU, command(), mouse)).toBe('eat the mouse');
      expect(said({ ...YOU, number: 'plural' }, command())).toBe('eat');
      expect(said({}, command())).toBe('eat');
    });

    test('a first-person plural is the let’s cohortative', () => {
      expect(said(WE, command(), mouse)).toBe("let's eat the mouse");
      expect(said(WE, command({ negative: true }))).toBe("let's not eat");
    });

    test('a negated command takes do not, unless a negative adverb negates', () => {
      expect(said(YOU, command({ negative: true }), mouse)).toBe('do not eat the mouse');
      expect(said(YOU, command({ negative: true, modifier: never }))).toBe('never eat');
    });

    test('a frequency adverb leads and a manner adverb trails', () => {
      expect(said(YOU, command({ modifier: always }))).toBe('always eat');
      expect(said(YOU, command({ modifier: concept(SLOWLY) }), mouse)).toBe('eat the mouse slowly');
    });

    test('the instruction register is the bare base, whoever the plan addresses', () => {
      expect(said(WE, command({ register: 'instruction' }), mouse)).toBe('eat the mouse');
      expect(said(WE, command({ register: 'instruction', negative: true }))).toBe('do not eat');
    });

    test('complements follow the object', () => {
      expect(said(YOU, vp(GIVE, { mood: 'imperative' }), el(np(BOOK)), complements({ terminus: complement(np(DOG)) })))
        .toBe('give the book to the dog');
    });
  });

  describe('infinitive', () => {
    const citation = (extra: Parameters<typeof vp>[1] = {}) => vp(EAT, { mood: 'infinitive', ...extra });

    test('is to + the base, with its object and complements', () => {
      expect(said(CAT, citation(), mouse)).toBe('to eat the mouse');
      expect(said(CAT, citation(), undefined, complements({ locative: complement(np(HOUSE)) }))).toBe('to eat in the house');
      expect(said(CAT, citation({ modifier: fast }))).toBe('to eat fast');
    });

    test('a negated infinitive is not to, or never to under a negative adverb', () => {
      expect(said(CAT, citation({ negative: true }))).toBe('not to eat');
      expect(said(CAT, citation({ negative: true, modifier: never }))).toBe('never to eat');
    });

    test('a marked aspect puts its auxiliary in the infinitive', () => {
      expect(said(CAT, citation({ aspect: 'progressive' }))).toBe('to be eating');
      expect(said(CAT, citation({ aspect: 'resultative' }))).toBe('to have eaten');
    });
  });

  describe('conditional', () => {
    const apodosis = (extra: Parameters<typeof vp>[1] = {}) => vp(EAT, { mood: 'conditional', ...extra });

    test('is would + the verb group in the infinitive', () => {
      expect(said(CAT, apodosis(), mouse)).toBe('would eat the mouse');
      expect(said(CAT, apodosis({ aspect: 'progressive' }))).toBe('would be eating');
      expect(said(CAT, apodosis({ aspect: 'resultative' }))).toBe('would have eaten');
      expect(said(CAT, apodosis({ modifier: fast }))).toBe('would eat fast');
    });

    test('would takes not directly', () => {
      expect(said(CAT, apodosis({ negative: true }))).toBe('would not eat');
    });

    test('a modal chain goes non-finite under would', () => {
      expect(said(CAT, apodosis({ modals: [modal(WILL)] }))).toBe('would want to eat');
      expect(said(CAT, apodosis({ modals: [modal(MUST)] }))).toBe('would have to eat');
      expect(said(CAT, apodosis({ negative: true, modals: [modal(CAN)] }))).toBe('would not be able to eat');
    });

    test('a modal’s own frequency adverb precedes its nonfinite form', () => {
      expect(said(CAT, apodosis({ modals: [modal(WILL, ALWAYS)] }))).toBe('would always want to eat');
      expect(said(CAT, apodosis({ modals: [modal(WILL, NEVER)] }))).toBe('would never want to eat');
    });
  });

  describe('subjunctive', () => {
    test('the if-clause verb is the past, whatever tense the phrase carries', () => {
      expect(said(CAT, vp(EAT, { mood: 'subjunctive' }), mouse)).toBe('ate the mouse');
      expect(said(CAT, vp(EAT, { mood: 'subjunctive', tense: 'future' }))).toBe('ate');
      expect(said(CAT, vp(EAT, { mood: 'subjunctive', aspect: 'progressive' }))).toBe('was eating');
      expect(said(CAT, vp(EAT, { mood: 'subjunctive', negative: true }))).toBe('did not eat');
    });
  });
});
