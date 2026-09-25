import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, ReadyLanguageCode } from '@signi/shared';
import { isPreviewLanguage } from '@signi/shared';
import { np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// BEGIN's tooltip was its English description in every language (localization C28 had left it on
// the literal), and in five of them the picker listed it beside START under the same word. It now
// stands on BEGINNING — "to have a beginning", the dictionaries' "avere inizio" — and carries a
// gloss in each of those five languages.

const said = (subject: NounPhrase): Record<ReadyLanguageCode, string> => sayAll({ subject } as PhrasePlan);

function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

describe('BEGINNING', () => {
  // Masculine in every language that has gender; German umlauts its plural (Anfänge).
  test('a singular and a plural in every language', () => {
    expect(said(np('BEGINNING'))).toEqual({
      en: 'the beginning.', it: "l'inizio.", fr: 'le début.', de: 'der Anfang.', es: 'el comienzo.', ja: '始まり。', pt: 'o início.',
    });
    expect(said(np('BEGINNING', { number: 'plural' }))).toEqual({
      en: 'the beginnings.', it: 'gli inizi.', fr: 'les débuts.', de: 'die Anfänge.', es: 'los comienzos.', ja: '始まり。', pt: 'os inícios.',
    });
  });

  test('agrees with an adjective', () => {
    expect(said(np('BEGINNING', { definiteness: 'indefinite', adjectives: ['NEW'] }))).toEqual({
      en: 'a new beginning.', it: 'un nuovo inizio.', fr: 'un nouveau début.', de: 'ein neuer Anfang.', es: 'un nuevo comienzo.', ja: '新しい始まり。', pt: 'um novo início.',
    });
  });
});

describe("BEGIN's gloss", () => {
  test('is "to have a beginning" in every language', () => {
    expect(definitionAll('BEGIN')).toEqual({
      en: 'to have a beginning.', it: 'avere un inizio.', fr: 'avoir un début.', de: 'einen Anfang haben.', es: 'tener un comienzo.', ja: '始まりを持つ。', pt: 'ter um início.',
    });
  });

  // The picker's disambiguator, wherever BEGIN's word is START's too; never the word itself.
  test('glosses BEGIN in every language where START is the same word', () => {
    const begin = concepts.find((c) => c.id === 'BEGIN')!;
    const start = concepts.find((c) => c.id === 'START')!;
    const shared = (['it', 'fr', 'de', 'es', 'ja', 'pt'] as const).filter((l) => begin.forms[l]?.['base'] === start.forms[l]?.['base']);
    expect(shared).toEqual(['it', 'fr', 'de', 'es', 'pt']);
    for (const l of shared) {
      expect(begin.glosses?.[l]).toBeTruthy();
      expect(begin.glosses?.[l]).not.toBe(begin.forms[l]?.['base']);
    }
  });
});
