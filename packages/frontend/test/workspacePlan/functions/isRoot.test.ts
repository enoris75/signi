import { describe, expect, it } from 'vitest';
import { isRoot } from '../../../src/components/PhraseBuilder/workspacePlan/functions/isRoot.ts';
import { conditional, coordinative, instrumental, period, relative } from '../fixtures.ts';

describe('isRoot', () => {
  const main = period('main', {});

  it('is a root with no links at all', () => {
    expect(isRoot(main, [])).toBe(true);
  });

  it('stays a root when it is only a link’s source', () => {
    expect(isRoot(main, [relative('r', ['main', 'subject'], ['other', 'subject']), conditional('c', 'main', 'if')])).toBe(true);
  });

  it.each([
    ['a relative clause', relative('l', ['other', 'subject'], ['main', 'directObject'])],
    ['a condition', conditional('l', 'other', 'main')],
    ['a coordinated clause', coordinative('l', 'other', 'main')],
    ['an instrument', instrumental('l', 'other', 'main')],
  ])('is no root when it is %s', (_, link) => {
    expect(isRoot(main, [link])).toBe(false);
  });
});
