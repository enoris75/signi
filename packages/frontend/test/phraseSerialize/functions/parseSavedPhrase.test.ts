import { describe, expect, it } from 'vitest';
import { SAVED_PHRASE_VERSION } from '@signi/shared';
import { parseSavedPhrase } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/parseSavedPhrase.ts';
import { doc } from '../fixtures.ts';

describe('parseSavedPhrase', () => {
  it('accepts a current phrase document as it is', () => {
    const phrase = doc();

    expect(parseSavedPhrase(phrase)).toEqual(phrase);
  });

  it('accepts a document from an older version', () => {
    expect(parseSavedPhrase(doc({ version: 1 })).version).toBe(1);
  });

  it.each([
    ['a period', 'period', 'period'],
    ['a phrase', 'phrase', 'phrase'],
    ['no kind, from before kinds', undefined, 'phrase'],
    ['an unknown kind', 'sentence', 'phrase'],
  ])('reads %s as a %s', (_, kind, parsed) => {
    expect(parseSavedPhrase(doc({ kind })).kind).toBe(parsed);
  });

  it.each([
    ['nothing', null, 'Not a valid phrase file.'],
    ['a string', 'signi.phrase', 'Not a valid phrase file.'],
    ['a number', 6, 'Not a valid phrase file.'],
    ['an empty object', {}, 'This file is not a Signi phrase file.'],
    ['another format', doc({ format: 'other.phrase' }), 'This file is not a Signi phrase file.'],
    ['no version', doc({ version: undefined }), 'Phrase file is missing a version.'],
    ['a version that is not a number', doc({ version: '6' }), 'Phrase file is missing a version.'],
    ['no workspace', doc({ workspace: undefined }), 'Phrase file has no workspace data.'],
    ['a workspace with no periods', doc({ workspace: { links: [] } }), 'Phrase file has no workspace data.'],
    ['a workspace whose periods are no list', doc({ workspace: { containers: {}, links: [] } }), 'Phrase file has no workspace data.'],
  ])('rejects %s', (_, raw, message) => {
    expect(() => parseSavedPhrase(raw)).toThrow(new Error(message));
  });

  it('rejects a document from a newer version, naming it', () => {
    const version = SAVED_PHRASE_VERSION + 1;

    expect(() => parseSavedPhrase(doc({ version }))).toThrow(
      new Error(`This phrase was saved by a newer version of Signi (v${version}); please update.`),
    );
  });
});
