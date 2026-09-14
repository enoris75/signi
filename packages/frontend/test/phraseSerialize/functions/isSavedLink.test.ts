import { describe, expect, it } from 'vitest';
import { isSavedLink } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/isSavedLink.ts';

const LINK = { id: 'l', source: { containerId: 'a' }, target: { containerId: 'b' } };

describe('isSavedLink', () => {
  it('takes a link with an id and two endpoints for one, of any kind', () => {
    expect(isSavedLink(LINK)).toBe(true);
    expect(isSavedLink({ ...LINK, kind: 'coordinative', conjunction: 'or' })).toBe(true);
    expect(isSavedLink({ ...LINK, source: { containerId: 'a', nounKey: 'subject' } })).toBe(true);
  });

  it.each<[string, unknown]>([
    ['nothing', null],
    ['a list', [LINK]],
    ['a link with no id', { ...LINK, id: undefined }],
    ['a link whose id is no string', { ...LINK, id: 1 }],
    ['a link with no source', { ...LINK, source: undefined }],
    ['a link whose source names no period', { ...LINK, source: {} }],
    ['a link whose target is no endpoint', { ...LINK, target: 'b' }],
    ['a link whose target names a period by number', { ...LINK, target: { containerId: 2 } }],
  ])('takes %s for none', (_, link) => {
    expect(isSavedLink(link)).toBe(false);
  });
});
