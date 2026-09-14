import { describe, expect, it } from 'vitest';
import * as phraseSerialize from '../../src/components/PhraseBuilder/phraseSerialize/index.ts';
import { downloadSavedPhrase } from '../../src/components/PhraseBuilder/phraseSerialize/functions/downloadSavedPhrase.ts';
import { hydrateWorkspace } from '../../src/components/PhraseBuilder/phraseSerialize/functions/hydrateWorkspace.ts';
import { readSavedPhraseFile } from '../../src/components/PhraseBuilder/phraseSerialize/functions/readSavedPhraseFile.ts';
import { serializePeriod } from '../../src/components/PhraseBuilder/phraseSerialize/functions/serializePeriod.ts';
import { serializeWorkspace } from '../../src/components/PhraseBuilder/phraseSerialize/functions/serializeWorkspace.ts';
import { toSavedPhrase } from '../../src/components/PhraseBuilder/phraseSerialize/functions/toSavedPhrase.ts';

describe('the phraseSerialize module', () => {
  it('exposes saving, loading and the file round trip, and nothing of its internals', () => {
    expect(Object.keys(phraseSerialize).sort()).toEqual([
      'downloadSavedPhrase',
      'hydrateWorkspace',
      'readSavedPhraseFile',
      'serializePeriod',
      'serializeWorkspace',
      'toSavedPhrase',
    ]);
    expect(phraseSerialize.downloadSavedPhrase).toBe(downloadSavedPhrase);
    expect(phraseSerialize.hydrateWorkspace).toBe(hydrateWorkspace);
    expect(phraseSerialize.readSavedPhraseFile).toBe(readSavedPhraseFile);
    expect(phraseSerialize.serializePeriod).toBe(serializePeriod);
    expect(phraseSerialize.serializeWorkspace).toBe(serializeWorkspace);
    expect(phraseSerialize.toSavedPhrase).toBe(toSavedPhrase);
  });
});
