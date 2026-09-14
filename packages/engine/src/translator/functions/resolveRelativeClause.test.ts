import { describe, expect, test } from 'vitest';
import { lexicon, LOOKUP } from '../translator.fixtures.js';
import { resolveRelativeClause } from './resolveRelativeClause.js';

describe('resolveRelativeClause', () => {
  test('the head fills the subject slot unless the clause names another', () => {
    expect(resolveRelativeClause({ verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP).headRole).toBe('subject');
    expect(resolveRelativeClause({ headRole: 'locative', verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP).headRole).toBe('locative');
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
    const withUnder = resolveRelativeClause({ headRole: 'locative', headSpecifiers: [{ kind: 'path', value: 'under' }], verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP);
    expect(withUnder.headSpecifiers).toEqual([{ kind: 'path', value: 'under' }]);
    expect(resolveRelativeClause({ headRole: 'locative', headSpecifiers: [], verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP)).not.toHaveProperty('headSpecifiers');
    expect(resolveRelativeClause({ headRole: 'locative', verbPhrase: { verb: 'RUN' } }, 'it', LOOKUP)).not.toHaveProperty('headSpecifiers');
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
});
