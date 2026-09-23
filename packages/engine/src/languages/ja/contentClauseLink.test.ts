import { describe, expect, test } from 'vitest';
import { clause, np, vp, HITO, NEKO } from './ja.fixtures.js';
import { contentClauseLink } from './contentClauseLink.js';

describe('contentClauseLink', () => {
  test('a verb of saying quotes with its own と (猫が走ると言います)', () => {
    expect(contentClauseLink(clause(np(HITO), vp({ base: '言う', content_clause_link: 'と' })))).toBe('と');
  });

  test('any other verb nominalizes with ことを (猫が走ることを知っています)', () => {
    expect(contentClauseLink(clause(np(HITO), vp({ base: '知る' })))).toBe('ことを');
    expect(contentClauseLink(clause(np(HITO)))).toBe('ことを');
  });

  // An indirect question replaces the link with the question particle (P09-E17): the verb's own と is
  // not read, since a question is not a quotation.
  test('an indirect question closes on かどうか, or on か over a wh-gap', () => {
    const said = vp({ base: '言う', content_clause_link: 'と' });
    const runs = clause(np(NEKO), vp({ base: '走る' }), { embedded: true });
    expect(contentClauseLink(clause(np(HITO), said, { contentObject: runs }))).toBe('かどうか');
    expect(contentClauseLink(clause(np(HITO), vp({ base: '尋ねる' }), {
      contentObject: { ...runs, question: { role: 'directObject', animate: false } },
    }))).toBe('か');
  });

  test('a statement keeps the verb\'s link', () => {
    expect(contentClauseLink(clause(np(HITO), vp({ base: '言う', content_clause_link: 'と' }), {
      contentObject: clause(np(NEKO), vp({ base: '走る' })),
    }))).toBe('と');
  });
});
