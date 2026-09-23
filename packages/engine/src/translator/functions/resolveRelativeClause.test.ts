import { describe, expect, test } from 'vitest';
import { CANE, CASA, ESSERE, GATTO, lexicon, LOOKUP } from '../translator.fixtures.js';
import { resolveRelativeClause } from './resolveRelativeClause.js';

describe('resolveRelativeClause', () => {
  test('the head fills the subject slot unless the clause names another', () => {
    expect(resolveRelativeClause({ verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP).headRole).toBe('subject');
    expect(resolveRelativeClause({ headRole: 'locative', subject: { concept: 'DOG' }, verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP).headRole).toBe('locative');
  });

  // A273
  test('refuses a clause with no verb phrase by name', () => {
    const verbless = { headRole: 'directObject', subject: { concept: 'DOG' } } as unknown as Parameters<typeof resolveRelativeClause>[0];
    expect(() => resolveRelativeClause(verbless, 'it', LOOKUP)).toThrow(/relative\.verbPhrase\.verb is required/);
  });

  // A275
  test('refuses a non-subject gap with no subject of its own by name, and needs none for a subject gap', () => {
    for (const headRole of ['directObject', 'locative', 'possessor'] as const) {
      expect(() => resolveRelativeClause({ headRole, verbPhrase: { verb: 'EAT' } }, 'it', LOOKUP))
        .toThrow(new RegExp(`head is its ${headRole} .*relative\\.subject\\.concept is required`));
    }
    expect(resolveRelativeClause({ headRole: 'subject', verbPhrase: { verb: 'EAT' } }, 'it', LOOKUP).subject).toBeUndefined();
  });

  test('resolves its own subject, its verb phrase in no mood, and its complements', () => {
    const clause = resolveRelativeClause({
      headRole: 'directObject',
      subject: { concept: 'DOG' },
      verbPhrase: { verb: 'EAT', tense: 'past' },
      complements: { locative: { phrase: { concept: 'HOUSE' } } },
    }, 'it', LOOKUP);
    expect(clause.subject?.conjuncts[0].head.forms['base']).toBe('cane');
    expect(clause.verbPhrase).toMatchObject({ verb: { conceptId: 'EAT' }, tense: 'past', mood: undefined });
    expect(clause.directObject).toBeUndefined();
    expect(clause.complements?.locative?.phrase.conjuncts[0].head.forms['definiteness']).toBe('definite');
  });

  test('resolves a direct object, leaving an absent subject and complements undefined', () => {
    const clause = resolveRelativeClause({ verbPhrase: { verb: 'EAT' }, directObject: { concept: 'CAT' } }, 'it', LOOKUP);
    expect(clause.directObject?.conjuncts[0].head.forms['base']).toBe('gatto');
    expect(clause.subject).toBeUndefined();
    expect(clause.complements).toBeUndefined();
  });

  test("carries the gap's specifiers only when there are some", () => {
    const withUnder = resolveRelativeClause({ headRole: 'locative', subject: { concept: 'DOG' }, headSpecifiers: [{ kind: 'path', value: 'under' }], verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP);
    expect(withUnder.headSpecifiers).toEqual([{ kind: 'path', value: 'under' }]);
    expect(resolveRelativeClause({ headRole: 'locative', subject: { concept: 'DOG' }, headSpecifiers: [], verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP)).not.toHaveProperty('headSpecifiers');
    expect(resolveRelativeClause({ headRole: 'locative', subject: { concept: 'DOG' }, verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP)).not.toHaveProperty('headSpecifiers');
  });

  // A131: the head gapped as the object is an object too, so KNOW takes its object sense for it.
  test("takes the verb's object sense for its own object or for a head gapped as the object, and not otherwise", () => {
    const KNOWING = lexicon({ KNOW: { base: 'sapere', object_sense: 'KNOW_ACQUAINTED' }, KNOW_ACQUAINTED: { base: 'conoscere' }, CAT: { base: 'gatto' } });
    const verbOf = (clause: Parameters<typeof resolveRelativeClause>[0]) => resolveRelativeClause(clause, 'it', KNOWING).verbPhrase.verb.conceptId;
    expect(verbOf({ verbPhrase: { verb: 'KNOW' }, directObject: { concept: 'CAT' } })).toBe('KNOW_ACQUAINTED');
    expect(verbOf({ headRole: 'directObject', subject: { concept: 'CAT' }, verbPhrase: { verb: 'KNOW' } })).toBe('KNOW_ACQUAINTED');
    expect(verbOf({ verbPhrase: { verb: 'KNOW' } })).toBe('KNOW');
    expect(verbOf({ headRole: 'cause', subject: { concept: 'CAT' }, verbPhrase: { verb: 'KNOW' } })).toBe('KNOW');
  });

  // A163: "the boy who cried wolf" — the alarm in a relative clause has no determiner slot either.
  test('drops the determiner of the alarm its verb cries, and of no other object', () => {
    const CRYING = lexicon({ CRY_OUT: { base: 'gridare', alarm_cry: '1' }, WOLF: { base: 'lupo', alarm: '1' }, WORD: { base: 'parola' } });
    const objectOf = (concept: string) => resolveRelativeClause(
      { verbPhrase: { verb: 'CRY_OUT', tense: 'past' }, directObject: { concept, definiteness: 'indefinite' } }, 'it', CRYING,
    ).directObject?.conjuncts[0].head.forms['definiteness'];
    expect(objectOf('WOLF')).toBe('definite');
    expect(objectOf('WORD')).toBe('indefinite');
  });

  // A01: a passive relative is re-mapped as a passive main clause is, and the gap moves with the head.
  describe('in the passive', () => {
    const PASSIVE = lexicon({
      CAT: GATTO, DOG: CANE, HOUSE: CASA, BE: ESSERE, GENERIC_PERSON: { base: 'si', generic: '1' },
      EAT: { base: 'mangiare', transitivity: 'transitive' }, RUN: { base: 'correre', transitivity: 'intransitive' },
    });
    const eaten = { verb: 'EAT', voice: 'passive' } as const;
    const base = (el?: { conjuncts: { head: { forms: Record<string, string> } }[] }) => el?.conjuncts[0]?.head.forms['base'];

    test('a head gapped as the object is the patient, so it is the subject, and the agent the by-phrase', () => {
      const clause = resolveRelativeClause({ headRole: 'directObject', subject: { concept: 'CAT' }, verbPhrase: eaten }, 'it', PASSIVE);
      expect(clause).toMatchObject({ headRole: 'subject', verbPhrase: { voice: 'passive' } });
      expect([clause.subject, clause.directObject]).toEqual([undefined, undefined]);
      expect(base(clause.agent)).toBe('gatto');
    });

    test('a head gapped as the subject is the agent, and the object is promoted to the clause’s subject', () => {
      const clause = resolveRelativeClause({ verbPhrase: eaten, directObject: { concept: 'DOG' } }, 'it', PASSIVE);
      expect(clause.headRole).toBe('agent');
      expect([clause.directObject, clause.agent]).toEqual([undefined, undefined]);
      expect(base(clause.subject)).toBe('cane');
    });

    test('a head filling a complement stays there while the patient and the agent swap around it', () => {
      const clause = resolveRelativeClause({ headRole: 'locative', subject: { concept: 'CAT' }, verbPhrase: eaten, directObject: { concept: 'DOG' } }, 'it', PASSIVE);
      expect(clause.headRole).toBe('locative');
      expect(clause.directObject).toBeUndefined();
      expect(base(clause.subject)).toBe('cane');
      expect(base(clause.agent)).toBe('gatto');
    });

    test('a generic agent is demoted to nothing', () => {
      const clause = resolveRelativeClause({ headRole: 'directObject', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: eaten }, 'it', PASSIVE);
      expect(clause.headRole).toBe('subject');
      expect(clause).not.toHaveProperty('agent');
    });

    test('a genitive relative stays active, since its head owns the agent', () => {
      const clause = resolveRelativeClause({ headRole: 'possessor', subject: { concept: 'CAT' }, verbPhrase: eaten, directObject: { concept: 'DOG' } }, 'it', PASSIVE);
      expect(clause.verbPhrase.voice).toBeUndefined();
      expect(clause.headRole).toBe('possessor');
      expect(base(clause.subject)).toBe('gatto');
      expect(base(clause.directObject)).toBe('cane');
    });

    test('a language that relativises no agent keeps a subject gap active, and still passivizes an object gap', () => {
      const agentGap = resolveRelativeClause({ verbPhrase: eaten, directObject: { concept: 'DOG' } }, 'ja', PASSIVE);
      expect(agentGap.headRole).toBe('subject');
      expect(agentGap.verbPhrase.voice).toBeUndefined();
      expect(base(agentGap.directObject)).toBe('cane');
      const objectGap = resolveRelativeClause({ headRole: 'directObject', subject: { concept: 'CAT' }, verbPhrase: eaten }, 'ja', PASSIVE);
      expect(objectGap).toMatchObject({ headRole: 'subject', verbPhrase: { voice: 'passive' } });
    });

    test('a passive that cannot be one leaves every slot where the plan put it', () => {
      const clause = resolveRelativeClause({ headRole: 'locative', subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN', voice: 'passive' } }, 'it', PASSIVE);
      expect(clause.headRole).toBe('locative');
      expect(clause.verbPhrase.voice).toBeUndefined();
      expect(base(clause.subject)).toBe('gatto');
      expect(clause).not.toHaveProperty('agent');
    });
  });
});
