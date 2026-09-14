import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadSavedPhrase } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/downloadSavedPhrase.ts';
import { doc } from '../fixtures.ts';

// jsdom has no object URLs and downloads nothing: the test stands in for both, and records what
// the link held at the moment it was clicked.
describe('downloadSavedPhrase', () => {
  let blobs: Blob[];
  let clicks: { href: string; download: string; attached: boolean }[];

  beforeEach(() => {
    blobs = [];
    clicks = [];
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return 'blob:phrase';
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push({ href: this.href, download: this.download, attached: document.body.contains(this) });
    });
  });

  afterEach(() => {
    delete (URL as { createObjectURL?: unknown }).createObjectURL;
    delete (URL as { revokeObjectURL?: unknown }).revokeObjectURL;
  });

  it('downloads the document as pretty-printed JSON', async () => {
    const phrase = doc();

    downloadSavedPhrase(phrase);

    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe('application/json');
    expect(await blobs[0].text()).toBe(JSON.stringify(phrase, null, 2));
  });

  it('clicks a link to the file, named after the phrase, from inside the page', () => {
    downloadSavedPhrase(doc({ name: 'The Cat Sleeps' }));

    expect(clicks).toEqual([{ href: 'blob:phrase', download: 'the-cat-sleeps.signi.json', attached: true }]);
  });

  it('names a file with no phrase name after the phrase', () => {
    downloadSavedPhrase(doc({ name: undefined }));

    expect(clicks[0].download).toBe('phrase.signi.json');
  });

  it('leaves no link behind and releases the file', () => {
    downloadSavedPhrase(doc());

    expect(document.querySelector('a')).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:phrase');
  });
});
