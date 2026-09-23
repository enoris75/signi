// Resolving a word by its aliases (P09-E23): the last rule of resolveWord, after the gloss — an exact
// alias in the interface language or in English. The printer still writes the label.
import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import { printWord, resolveWord, wordSpecFor } from '../../src/console/language/resolve.ts';
import type { Vocabulary } from '../../src/console/language/types.ts';
import { print, ok, sel } from './helpers.ts';
import { EN, IT, VERBS, vocabFor } from './vocab.ts';

const VERB = wordSpecFor('verb');

const id = (text: string, vocab: Vocabulary = EN) => {
  const r = resolveWord(text, VERB, vocab);
  return r.ok ? r.concept.id : r.reason;
};

/** The fixture vocabulary with extra verbs beside its own. */
function withVerbs(language: 'en' | 'it', ...extra: Concept[]): Vocabulary {
  const base = vocabFor(language);
  return { ...base, concepts: { ...base.concepts, verb: [...VERBS, ...extra] } };
}

const verb = (id: string, en: string, it: string, extra: Partial<Concept> = {}): Concept => ({
  id, role: 'verb', description: en, label: en, labels: { en, it }, transitivity: 'transitive', ...extra,
});

describe('a word found by an alias', () => {
  it('names the concept by its alias in the interface language', () => {
    expect(id('pick')).toBe('CHOOSE');
    expect(id('selezionare', IT)).toBe('CHOOSE');
  });

  it('names it by its English alias in another interface language too, as the pickers match', () => {
    expect(id('pick', IT)).toBe('CHOOSE');
  });

  it('does not reach across to a third language’s alias', () => {
    expect(id('selezionare')).toBe('unknown');
  });

  it('matches the alias whole, in any case and spacing, never a prefix', () => {
    expect(id('  PICK ')).toBe('CHOOSE');
    expect(id('pic')).toBe('unknown');
  });

  it('never outranks a concept whose label is the word', () => {
    const vocab = withVerbs('en', verb('PICK', 'pick', 'cogliere'));
    expect(id('pick', vocab)).toBe('PICK');
  });

  it('is ambiguous when two concepts share the alias, as two labels are', () => {
    const vocab = withVerbs('en', verb('SELECT', 'select', 'selezionare', { aliases: { en: ['pick'] } }));
    const r = resolveWord('pick', VERB, vocab);
    expect(r).toMatchObject({ ok: false, reason: 'ambiguous' });
    expect(r.ok ? [] : r.candidates.map((c) => c.id)).toEqual(['CHOOSE', 'SELECT']);
  });

  it('is printed by its label, not the alias it was found by', () => {
    const choose = VERBS.find((c) => c.id === 'CHOOSE')!;
    expect(printWord(choose, VERB, EN)).toBe('choose');
    expect(printWord(choose, VERB, IT)).toBe('scegliere');
    const state = ok('/subj cat /verb pick');
    expect((sel(state).verb as Concept | undefined)?.id).toBe('CHOOSE');
    expect(print(state)).toBe('/subj ( cat ) /verb ( choose )');
  });
});
