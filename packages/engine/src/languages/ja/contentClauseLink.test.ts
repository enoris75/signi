import { describe, expect, test } from 'vitest';
import { clause, np, vp, HITO } from './ja.fixtures.js';
import { contentClauseLink } from './contentClauseLink.js';

describe('contentClauseLink', () => {
  test('a verb of saying quotes with its own と (猫が走ると言います)', () => {
    expect(contentClauseLink(clause(np(HITO), vp({ base: '言う', content_clause_link: 'と' })))).toBe('と');
  });

  test('any other verb nominalizes with ことを (猫が走ることを知っています)', () => {
    expect(contentClauseLink(clause(np(HITO), vp({ base: '知る' })))).toBe('ことを');
    expect(contentClauseLink(clause(np(HITO)))).toBe('ことを');
  });
});
