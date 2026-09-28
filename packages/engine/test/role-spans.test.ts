import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan, Translation } from '@signi/shared';
import { translate } from '../src/index.js';
import { clause, np, translateAll } from './harness.js';

process.env['SIGNI_DB_PATH'] = ':memory:';
const { lookupLexicalEntry } = await import('../../backend/src/lexicon.js');

// P17-E2: each role's word as the sentence says it, for the Phrase view's rows ("cats", not "cat ·
// plural"). A span is only ever read back through `text`, so each test states the surface a slot
// comes out as.

const spanned = (plan: PhrasePlan, withSpans: boolean | LanguageCode[] = true) => translate(plan, lookupLexicalEntry, { withSpans });
const one = (plan: PhrasePlan, language: LanguageCode): Translation => spanned(plan, [language]).find((t) => t.language === language)!;

/** Each slot's words, a split one joined by " … " as the row shows it. */
function words(t: Translation): Record<string, string> {
  const out: Record<string, string[]> = {};
  for (const s of t.spans ?? []) (out[s.slot] ??= []).push(t.text.slice(s.start, s.end));
  return Object.fromEntries(Object.entries(out).map(([slot, ws]) => [slot, ws.join(' … ')]));
}

describe('role spans', () => {
  test('a plural noun is its plural, a past verb its past', () => {
    const cats = clause(np('CAT', { number: 'plural' }), 'EAT', { verbPhrase: { tense: 'past' }, directObject: np('FOOD') });
    expect(one(cats, 'en').text).toBe('the cats ate the food.');
    expect(words(one(cats, 'en'))).toEqual({ subject: 'cats', verb: 'ate', directObject: 'food' });
    expect(words(one(cats, 'it'))).toEqual({ subject: 'gatti', verb: 'mangiarono', directObject: 'cibo' });
  });

  test('a French negation leaves the verb its own word, ne … pas around it', () => {
    const t = one(clause(np('CAT'), 'EAT', { verbPhrase: { negative: true }, directObject: np('FOOD') }), 'fr');
    expect(t.text).toBe('le chat ne mange pas la nourriture.');
    expect(words(t)).toEqual({ subject: 'chat', verb: 'mange', directObject: 'nourriture' });
  });

  test('a German separable verb is two spans of one slot, in reading order', () => {
    const t = one(clause(np('CAT'), 'ADD', { directObject: np('FOOD') }), 'de');
    expect(t.text).toBe('der Kater fügt das Essen hinzu.');
    expect(words(t)).toEqual({ subject: 'Kater', verb: 'fügt … hinzu', directObject: 'Essen' });
    expect(t.spans?.filter((s) => s.slot === 'verb')).toHaveLength(2);
  });

  test('German EAT said by its animal sense is still the verb', () => {
    expect(words(one(clause(np('CAT'), 'EAT', { directObject: np('FOOD') }), 'de')).verb).toBe('frisst');
  });

  test('a word whose first letter the sentence rewrites is still found: a capital, an elision', () => {
    const t = one({ ...clause(np('CAT'), 'RUN'), interjection: 'HEY', address: np('MOTHER') }, 'en');
    expect(t.text).toBe('Hey, mother, the cat runs.');
    expect(words(t)).toEqual({ interjection: 'Hey', address: 'mother', subject: 'cat', verb: 'runs' });
    expect(words(one({ ...clause(np('CAT'), 'RUN'), address: np('MOTHER') }, 'en')).address).toBe('Mother');
    const elided = one(clause(np('CAT'), 'SEE', { directObject: np('BIRD') }), 'fr');
    expect(elided.text).toBe("le chat voit l'oiseau.");
    expect(words(elided).directObject).toBe('oiseau');
  });

  test('a role the sentence does not say has no span: a dropped subject pronoun', () => {
    const t = one(clause(np('FIRST_PERSON'), 'RUN'), 'it');
    expect(t.text).toBe('corro.');
    expect(words(t)).toEqual({ verb: 'corro' });
  });

  test('a Japanese verb whose ending the tense rewrites falls back; the nouns keep theirs', () => {
    const present = one(clause(np('CAT'), 'EAT', { directObject: np('FOOD') }), 'ja');
    expect(words(present)).toEqual({ subject: '猫', directObject: '食べ物', verb: '食べます' });
    const past = one(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'past' }, directObject: np('FOOD') }), 'ja');
    expect(words(past)).toEqual({ subject: '猫', directObject: '食べ物' });
  });

  test('only on request, only for the languages asked, and the text never changes', () => {
    const plan = clause(np('CAT', { number: 'plural' }), 'SEE', { verbPhrase: { tense: 'past', negative: true }, directObject: np('DOG') });
    const plain = translateAll(plan);
    expect(plain.some((t) => 'spans' in t)).toBe(false);
    expect(spanned(plan).map(({ spans: _, ...t }) => t)).toEqual(plain);
    expect(spanned(plan, ['fr']).filter((t) => t.spans).map((t) => t.language)).toEqual(['fr']);
  });
});
