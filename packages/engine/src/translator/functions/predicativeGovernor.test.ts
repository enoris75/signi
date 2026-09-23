import { describe, expect, test } from 'vitest';
import type { LexicalEntry, PhrasePlan } from '@signi/shared';
import { predicativeGovernor } from './predicativeGovernor.js';

const lookup = (conceptId: string, language: string): LexicalEntry | undefined =>
  conceptId === 'RIGHT_CORRECT' ? { conceptId, language: language as 'it', forms: { base: 'giusto', content_clause_mood: 'subjunctive' } }
    : conceptId === 'GOOD' ? { conceptId, language: language as 'it', forms: { base: 'buono' } }
    : undefined;

const be = (predicative?: PhrasePlan['complements']): PhrasePlan => ({
  subject: { concept: 'THING' }, verbPhrase: { verb: 'BE' }, complements: predicative,
});

describe('predicativeGovernor', () => {
  test("is the predicate adjective's lexeme", () => {
    expect(predicativeGovernor(be({ predicative: { phrase: { concept: 'RIGHT_CORRECT' } } }), 'it', lookup))
      .toEqual({ base: 'giusto', content_clause_mood: 'subjunctive' });
  });

  test('a coordinated predicate is governed by its first conjunct', () => {
    const plan = be({ predicative: { phrase: { conjuncts: [{ concept: 'GOOD' }, { concept: 'RIGHT_CORRECT' }], conjunction: 'and' } } });
    expect(predicativeGovernor(plan, 'it', lookup)).toEqual({ base: 'buono' });
  });

  test('is undefined without a predicative complement', () => {
    expect(predicativeGovernor(be(), 'it', lookup)).toBeUndefined();
  });
});
