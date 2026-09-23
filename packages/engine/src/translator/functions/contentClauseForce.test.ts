import { describe, expect, test } from 'vitest';
import type { ContentClause } from '@signi/shared';
import { contentClauseForce, declarativeClause } from './contentClauseForce.js';

const governor = (force?: string) => ({ conceptId: 'V', forms: { base: 'v', ...(force ? { content_clause_force: force } : {}) } });
const statement: ContentClause = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' } };
const yesNo: ContentClause = { ...statement, interrogative: true };
const wh: ContentClause = { ...statement, questionRole: 'locative' };

describe('contentClauseForce', () => {
  test('a statement under a verb that names no force, or either', () => {
    expect(contentClauseForce(statement, governor())).toBe(false);
    expect(contentClauseForce(statement, governor('either'))).toBe(false);
  });

  test('a question, yes/no or wh, under a verb that takes one', () => {
    expect(contentClauseForce(yesNo, governor('interrogative'))).toBe(true);
    expect(contentClauseForce(wh, governor('either'))).toBe(true);
  });

  test('a question under a verb that names no force is refused', () => {
    expect(() => contentClauseForce(yesNo, governor())).toThrow(/V does not take an indirect question/);
    expect(() => contentClauseForce(wh, governor())).toThrow(/V does not take an indirect question/);
  });

  test('a statement under a verb that takes only a question is refused', () => {
    expect(() => contentClauseForce(statement, governor('interrogative'))).toThrow(/V takes an indirect question, not a statement/);
  });
});

describe('declarativeClause', () => {
  test('drops the five question fields and keeps the rest', () => {
    const asked: ContentClause = {
      ...statement, directObject: { concept: 'FOOD' }, questionRole: 'locative', interrogative: true,
      questionSpecifiers: [{ kind: 'path', value: 'in' }], questionAnimate: true, questionPossessed: 'directObject',
    };
    expect(declarativeClause(asked)).toEqual({ ...statement, directObject: { concept: 'FOOD' } });
  });
});
