import { describe, expect, it } from 'vitest';
import { readSavedPhraseFile } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/readSavedPhraseFile.ts';
import { doc } from '../fixtures.ts';

const file = (text: string) => new File([text], 'phrase.signi.json', { type: 'application/json' });

describe('readSavedPhraseFile', () => {
  it('reads a saved phrase file', async () => {
    const phrase = doc({ kind: 'period' });

    await expect(readSavedPhraseFile(file(JSON.stringify(phrase)))).resolves.toEqual(phrase);
  });

  it('rejects a file that is not JSON', async () => {
    await expect(readSavedPhraseFile(file('{ not json'))).rejects.toThrow(new Error("That file isn't valid JSON."));
  });

  it('rejects JSON that is not a saved phrase', async () => {
    await expect(readSavedPhraseFile(file('{"format":"other"}'))).rejects.toThrow(
      new Error('This file is not a Signi phrase file.'),
    );
  });
});
