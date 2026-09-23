import { describe, expect, test } from 'vitest';
import { questionNoun } from './questionNoun.js';

const head = (el: ReturnType<typeof questionNoun>) => el?.conjuncts[0].head.forms;

describe('questionNoun', () => {
  test('誰 for a person and 何 for a thing, with their readings', () => {
    expect(head(questionNoun({ role: 'subject', animate: true }))).toMatchObject({ base: '誰', reading: 'だれ', animate: '1' });
    expect(head(questionNoun({ role: 'directObject', animate: false }))).toMatchObject({ base: '何', reading: 'なに' });
    expect(head(questionNoun({ role: 'directObject', animate: false }))?.['animate']).toBeUndefined();
  });

  test('どこ for the locative', () => {
    expect(head(questionNoun({ role: 'locative', animate: false }))?.['base']).toBe('どこ');
  });

  test('the adverbial gaps are no noun, except the copula\'s manner', () => {
    expect(questionNoun({ role: 'manner', animate: false })).toBeUndefined();
    expect(questionNoun({ role: 'cause', animate: false }, true)).toBeUndefined();
    expect(head(questionNoun({ role: 'manner', animate: false }, true))?.['base']).toBe('どう');
  });
});
