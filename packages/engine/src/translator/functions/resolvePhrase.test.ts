import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { lexicon, LOOKUP } from '../translator.fixtures.js';
import { resolvePhrase } from './resolvePhrase.js';

const CAT_RUNS: PhrasePlan = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' } };
const DOG_EATS: PhrasePlan = { subject: { concept: 'DOG' }, verbPhrase: { verb: 'EAT' } };
const CAT_IS_HAPPY: PhrasePlan = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: { concept: 'HAPPY' } } } };
const DOG_IS_NOT: PhrasePlan = { subject: { concept: 'DOG' }, verbPhrase: { verb: 'BE', negative: true } };

describe('resolvePhrase', () => {
  test('resolves the subject, verb phrase, object and complements, in the mood it is given', () => {
    const resolved = resolvePhrase({ ...CAT_RUNS, directObject: { concept: 'DOG' }, complements: { locative: { phrase: { concept: 'HOUSE' } } } }, 'it', LOOKUP, 'conditional');
    expect(resolved.subject.conjuncts[0].head.forms['base']).toBe('gatto');
    expect(resolved.verbPhrase).toMatchObject({ verb: { conceptId: 'RUN' }, mood: 'conditional' });
    expect(resolved.directObject?.conjuncts[0].head.forms['base']).toBe('cane');
    expect(resolved.complements?.locative?.phrase.conjuncts[0].head.forms['base']).toBe('casa');
    expect(resolved.condition).toBeUndefined();
    expect(resolved.coordination).toBeUndefined();
  });

  // P09-E17: an object clause that asks is marked `embedded`, keeps its gap, and is not flagged
  // interrogative, so no engine inverts it; the matrix clause is a statement still.
  test('resolves an indirect question as embedded, with its gap and no interrogative flag', () => {
    const ASKING = lexicon({ ASK: { base: 'chiedere', content_clause_force: 'interrogative' }, CAT: { base: 'gatto' }, DOG: { base: 'cane' }, EAT: { base: 'mangiare' } });
    const resolved = resolvePhrase({ ...DOG_EATS, verbPhrase: { verb: 'ASK' }, contentObject: { ...CAT_RUNS, verbPhrase: { verb: 'EAT' }, questionRole: 'directObject' } }, 'it', ASKING);
    expect(resolved.contentObject).toMatchObject({ embedded: true, question: { role: 'directObject', animate: false } });
    expect(resolved.contentObject?.verbPhrase?.interrogative).toBeUndefined();
    expect(resolved.verbPhrase?.interrogative).toBeUndefined();
    expect(() => resolvePhrase({ ...DOG_EATS, verbPhrase: { verb: 'ASK' }, contentObject: { ...CAT_RUNS, verbPhrase: { verb: 'EAT' } } }, 'it', ASKING))
      .toThrow(/ASK takes an indirect question/);
  });

  // A267: a clause with no subject is refused by name, wherever it is linked.
  test('refuses a clause with no subject, top or linked, with a named error', () => {
    const cries = { verbPhrase: { verb: 'RUN' } } as unknown as PhrasePlan;
    expect(() => resolvePhrase(cries, 'it', LOOKUP)).toThrow(/plan\.subject\.concept is required/);
    expect(() => resolvePhrase({ ...CAT_RUNS, condition: cries }, 'it', LOOKUP)).toThrow(/subject/);
    expect(() => resolvePhrase({ ...CAT_RUNS, coordination: { conjunction: 'and', clause: cries } }, 'it', LOOKUP)).toThrow(/subject/);
    expect(resolvePhrase({ ...CAT_RUNS, coordination: { conjunction: 'and', clause: cries } }, 'it', LOOKUP, 'imperative')
      .coordination?.clause.subject.conjuncts[0].head.forms['base']).toBe('gatto');
  });

  // A131: KNOW is "sapere" with no object and "conoscere" with one.
  test("takes the verb's object sense only when the plan has a direct object", () => {
    const KNOWING = lexicon({ KNOW: { base: 'sapere', object_sense: 'KNOW_ACQUAINTED' }, KNOW_ACQUAINTED: { base: 'conoscere' }, CAT: { base: 'gatto' }, DOG: { base: 'cane' } });
    const knows: PhrasePlan = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'KNOW' } };
    expect(resolvePhrase({ ...knows, directObject: { concept: 'DOG' } }, 'it', KNOWING).verbPhrase?.verb.conceptId).toBe('KNOW_ACQUAINTED');
    expect(resolvePhrase(knows, 'it', KNOWING).verbPhrase?.verb.conceptId).toBe('KNOW');
  });

  // A163: the alarm a cry raises has no determiner slot, so the plan's is dropped for the definite.
  test("drops the determiner of the alarm the verb cries, and of no other object", () => {
    const CRYING = lexicon({ CRY_OUT: { base: 'gridare', alarm_cry: '1' }, SEE: { base: 'vedere' }, BOY: { base: 'ragazzo' }, WOLF: { base: 'lupo', alarm: '1' }, WORD: { base: 'parola' } });
    const objectOf = (verb: string, concept: string) => resolvePhrase(
      { subject: { concept: 'BOY' }, verbPhrase: { verb }, directObject: { concept, definiteness: 'indefinite' } }, 'it', CRYING,
    ).directObject?.conjuncts[0].head.forms['definiteness'];
    expect(objectOf('CRY_OUT', 'WOLF')).toBe('definite');
    expect(objectOf('CRY_OUT', 'WORD')).toBe('indefinite');
    expect(objectOf('SEE', 'WOLF')).toBe('indefinite');
  });

  test('a verbless period resolves just its subject', () => {
    const resolved = resolvePhrase({ subject: { concept: 'CAT' } }, 'it', LOOKUP);
    expect(resolved).toMatchObject({ verbPhrase: undefined, directObject: undefined, complements: undefined });
  });

  describe('a command', () => {
    test("takes the plan's register, unless it is handed one", () => {
      const plan: PhrasePlan = { ...CAT_RUNS, imperativeRegister: 'instruction' };
      expect(resolvePhrase(plan, 'it', LOOKUP, 'imperative').verbPhrase?.register).toBe('instruction');
      expect(resolvePhrase(plan, 'it', LOOKUP, 'imperative', 'request').verbPhrase?.register).toBe('request');
      expect(resolvePhrase(CAT_RUNS, 'it', LOOKUP, 'imperative').verbPhrase?.register).toBe('request');
    });

    test('a clause that is no command takes no register', () => {
      expect(resolvePhrase({ ...CAT_RUNS, imperativeRegister: 'instruction' }, 'it', LOOKUP).verbPhrase?.register).toBeUndefined();
    });

    test('a coordinated command goes to the same addressee in the same register, joined by a conjunction two commands allow', () => {
      const plan: PhrasePlan = {
        subject: { concept: 'YOU' }, verbPhrase: { verb: 'EAT' }, imperativeRegister: 'instruction',
        coordination: { conjunction: 'therefore', clause: { subject: { concept: 'I' }, verbPhrase: { verb: 'RUN' } } },
      };
      const { coordination } = resolvePhrase(plan, 'it', LOOKUP, 'imperative');
      expect(coordination?.conjunction).toBe('and');
      expect(coordination?.clause.verbPhrase).toMatchObject({ verb: { conceptId: 'RUN' }, mood: 'imperative', register: 'instruction' });
      expect(coordination?.clause.subject.conjuncts[0].head.conceptId).toBe('YOU');
    });
  });

  test('a condition resolves as the subjunctive protasis of the main clause', () => {
    const resolved = resolvePhrase({ ...CAT_RUNS, condition: DOG_EATS }, 'it', LOOKUP, 'conditional');
    expect(resolved.verbPhrase?.mood).toBe('conditional');
    expect(resolved.condition?.verbPhrase).toMatchObject({ verb: { conceptId: 'EAT' }, mood: 'subjunctive' });
  });

  describe('a question', () => {
    test('marks the verb phrase of an indicative clause, and only that', () => {
      expect(resolvePhrase({ ...CAT_RUNS, interrogative: true }, 'it', LOOKUP).verbPhrase?.interrogative).toBe(true);
      expect(resolvePhrase(CAT_RUNS, 'it', LOOKUP).verbPhrase).not.toHaveProperty('interrogative');
    });

    test('a condition, a command or a citation keeps its own mood and drops the flag', () => {
      const plan: PhrasePlan = { ...CAT_RUNS, interrogative: true, condition: DOG_EATS };
      const resolved = resolvePhrase(plan, 'it', LOOKUP, 'conditional');
      expect(resolved.verbPhrase).not.toHaveProperty('interrogative');
      expect(resolved.condition?.verbPhrase).not.toHaveProperty('interrogative');
      expect(resolvePhrase({ ...CAT_RUNS, interrogative: true }, 'it', LOOKUP, 'imperative').verbPhrase).not.toHaveProperty('interrogative');
      expect(resolvePhrase({ ...CAT_RUNS, interrogative: true }, 'it', LOOKUP, 'infinitive').verbPhrase).not.toHaveProperty('interrogative');
    });

    test('a coordinated clause shares the force of the first, whatever its own plan says', () => {
      const asked = resolvePhrase({ ...CAT_RUNS, interrogative: true, coordination: { conjunction: 'and', clause: DOG_EATS } }, 'it', LOOKUP);
      expect(asked.coordination?.clause.verbPhrase?.interrogative).toBe(true);
      const stated = resolvePhrase({ ...CAT_RUNS, coordination: { conjunction: 'and', clause: { ...DOG_EATS, interrogative: true } } }, 'it', LOOKUP);
      expect(stated.coordination?.clause.verbPhrase).not.toHaveProperty('interrogative');
    });
  });

  test('a coordinated statement is a plain clause with its own subject and conjunction', () => {
    const { coordination } = resolvePhrase({ ...CAT_RUNS, coordination: { conjunction: 'therefore', clause: DOG_EATS } }, 'it', LOOKUP, 'conditional');
    expect(coordination?.conjunction).toBe('therefore');
    expect(coordination?.clause.verbPhrase?.mood).toBeUndefined();
    expect(coordination?.clause.subject.conjuncts[0].head.conceptId).toBe('DOG');
  });

  describe('an infinitive complement', () => {
    const wants = (control?: 'object'): PhrasePlan => ({
      ...CAT_RUNS,
      directObject: { concept: 'DOG' },
      infinitiveComplement: { verbPhrase: { verb: 'EAT' }, ...(control ? { control } : {}) },
    });

    test('is a clause of its own in the infinitive mood, subject-controlled by default', () => {
      const { infinitiveComplement } = resolvePhrase(wants(), 'it', LOOKUP);
      expect(infinitiveComplement?.verbPhrase).toMatchObject({ verb: { conceptId: 'EAT' }, mood: 'infinitive' });
      expect(infinitiveComplement?.subject.conjuncts[0].head.conceptId).toBe('CAT');
      expect(infinitiveComplement).not.toHaveProperty('control');
    });

    test('object control resolves the direct object as its subject, and says so', () => {
      const { infinitiveComplement } = resolvePhrase(wants('object'), 'it', LOOKUP);
      expect(infinitiveComplement?.subject.conjuncts[0].head.conceptId).toBe('DOG');
      expect(infinitiveComplement?.control).toBe('object');
    });

    test('object control with no object falls back to the subject and is no longer object-controlled', () => {
      const { infinitiveComplement } = resolvePhrase(
        { ...CAT_RUNS, infinitiveComplement: { verbPhrase: { verb: 'EAT' }, control: 'object' } }, 'it', LOOKUP,
      );
      expect(infinitiveComplement?.subject.conjuncts[0].head.conceptId).toBe('CAT');
      expect(infinitiveComplement).not.toHaveProperty('control');
    });

    // A171: a `no` controller negates this clause, so the infinitive's subject is handed over definite.
    test('a `no` controller leaves its `no` with the governing clause, under either control', () => {
      const noWants = (control?: 'object'): PhrasePlan => ({
        ...wants(control),
        subject: { concept: 'CAT', definiteness: 'no' },
        directObject: { concept: 'DOG', definiteness: 'no' },
      });
      for (const control of [undefined, 'object'] as const) {
        const resolved = resolvePhrase(noWants(control), 'it', LOOKUP);
        expect(resolved.subject.agreement['definiteness']).toBe('no');
        expect(resolved.directObject?.agreement['definiteness']).toBe('no');
        expect(resolved.infinitiveComplement?.subject.agreement['definiteness']).toBe('definite');
      }
    });
  });

  // A clause of purpose takes this clause's subject, and a `no` on it stays here too (A171).
  test('a clause of purpose takes the subject, with its `no` left to this clause', () => {
    const { subject, purpose } = resolvePhrase(
      { ...CAT_RUNS, subject: { concept: 'CAT', definiteness: 'no' }, purpose: { verbPhrase: { verb: 'EAT' } } }, 'it', LOOKUP,
    );
    expect(subject.agreement['definiteness']).toBe('no');
    expect(purpose?.verbPhrase?.mood).toBe('infinitive');
    expect(purpose?.subject.conjuncts[0].head.conceptId).toBe('CAT');
    expect(purpose?.subject.agreement['definiteness']).toBe('definite');
  });

  describe('a bare copula (A121)', () => {
    test('in the main clause elides the complement of its condition', () => {
      const resolved = resolvePhrase({ ...DOG_IS_NOT, condition: CAT_IS_HAPPY }, 'it', LOOKUP, 'conditional');
      expect(resolved.verbPhrase?.elided).toEqual({ type: 'predicative', complement: resolved.condition?.complements?.predicative });
    });

    test("in a coordinated clause elides the first clause's complement", () => {
      const resolved = resolvePhrase({ ...CAT_IS_HAPPY, coordination: { conjunction: 'but', clause: DOG_IS_NOT } }, 'it', LOOKUP);
      expect(resolved.coordination?.clause.verbPhrase?.elided).toEqual({ type: 'predicative', complement: resolved.complements?.predicative });
    });

    test('elides through a main clause that elides one itself', () => {
      const plan: PhrasePlan = { ...DOG_IS_NOT, condition: CAT_IS_HAPPY, coordination: { conjunction: 'but', clause: { ...DOG_IS_NOT, subject: { concept: 'HE' } } } };
      const resolved = resolvePhrase(plan, 'it', LOOKUP, 'conditional');
      expect(resolved.coordination?.clause.verbPhrase?.elided?.complement).toBe(resolved.condition?.complements?.predicative);
    });

    test('with nothing before it is left alone', () => {
      expect(resolvePhrase(DOG_IS_NOT, 'it', LOOKUP).verbPhrase).not.toHaveProperty('elided');
    });
  });

  describe('a passive wh-question (P09-E16)', () => {
    const PASSIVE = lexicon({
      CAT: { base: 'gatto', gender: 'masc', animal: '1' }, FOOD: { base: 'cibo', gender: 'masc' },
      EAT: { base: 'mangiare', transitivity: 'transitive' }, RUN: { base: 'correre', transitivity: 'intransitive' },
      BE: { base: 'essere', copula: '1' }, GENERIC_PERSON: { base: 'si', person: '3', generic: '1' },
    });
    const eaten = (extra: Partial<PhrasePlan>): PhrasePlan =>
      ({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT', voice: 'passive' }, ...extra });

    test('the patient gapped as the object is the subject stand-in, third singular, and the agent stays', () => {
      const resolved = resolvePhrase(eaten({ questionRole: 'directObject' }), 'it', PASSIVE);
      expect(resolved.verbPhrase?.voice).toBe('passive');
      expect(resolved.question?.role).toBe('subject');
      expect(resolved.subject.agreement).toEqual({ person: '3', number: 'singular', gender: 'masc' });
      expect(resolved.agent?.conjuncts[0].head.forms['base']).toBe('gatto');
      expect(resolved.directObject).toBeUndefined();
    });

    test('the agent gapped as the subject is the by-phrase\'s gap, and the object is promoted', () => {
      const resolved = resolvePhrase(eaten({ directObject: { concept: 'FOOD' }, questionRole: 'subject', questionAnimate: true }), 'it', PASSIVE);
      expect(resolved.question?.role).toBe('agent');
      expect(resolved.subject.conjuncts[0].head.forms['base']).toBe('cibo');
      expect(resolved.agent).toBeUndefined();
    });

    test('a complement gap stays, and a generic agent still drops', () => {
      const resolved = resolvePhrase(eaten({ subject: { concept: 'GENERIC_PERSON' }, directObject: { concept: 'FOOD' }, questionRole: 'locative' }), 'it', PASSIVE);
      expect(resolved.question?.role).toBe('locative');
      expect(resolved.agent).toBeUndefined();
    });

    test('a passive the verb cannot take is refused, not asked in the active', () => {
      expect(() => resolvePhrase({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN', voice: 'passive' }, questionRole: 'locative' }, 'it', PASSIVE))
        .toThrow(/passive.*P09-E16/);
    });
  });
});
