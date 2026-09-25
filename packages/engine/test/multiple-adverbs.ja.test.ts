import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, furigana, np, sayAll } from './harness.js';

// P15: a verb takes several adverbs. Japanese says them all before the predicate, each in its class's
// place: frequency first, then place (with the complements' で), direction, and manner nearest the verb.
const ja = (plan: PhrasePlan): string => sayAll(plan).ja;
const run = (verbPhrase: Partial<VerbPhrase>, extra: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}) =>
  ja(clause(np('CAT'), 'RUN', { verbPhrase, ...extra }));
const move = (verbPhrase: Partial<VerbPhrase>) => ja(clause(np('CAT'), 'MOVE', { verbPhrase, directObject: np('BOOK') }));

describe('several adverbs (ja)', () => {
  test('frequency, place and manner: 猫はよくここで速く走ります', () => {
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] })).toBe('猫はよくここで速く走ります。');
    expect(move({ modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] })).toBe('猫は本をよくここで速く移動します。');
  });

  test('frequency + manner, across negation, past, a modal and the passive', () => {
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'] })).toBe('猫はよく速く走ります。');
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'], negative: true })).toBe('猫はよく速く走りません。');
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' })).toBe('猫はよく速く走っていました。');
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'], modals: ['MUST'] })).toBe('猫はよく速く走る必要があります。');
    expect(ja(clause(np('CAT'), 'MOVE', { verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST'], voice: 'passive' }, directObject: np('BOOK') })))
      .toBe('本は猫によく速く移動されます。');
  });

  test('manner + place: the place ahead of the manner, whichever came first', () => {
    expect(run({ modifier: 'FAST', modifiers: ['HERE'] })).toBe('猫はここで速く走ります。');
    expect(run({ modifier: 'FAST', modifiers: ['HERE'], tense: 'past' })).toBe('猫はここで速く走りました。');
    expect(run({ modifier: 'FAST', modifiers: ['HERE'], negative: true })).toBe('猫はここで速く走りません。');
  });

  test('frequency + place, and a place said with に where the verb wants it', () => {
    expect(run({ modifier: 'OFTEN', modifiers: ['HERE'] })).toBe('猫はよくここで走ります。');
    expect(run({ modifier: 'ALWAYS', modifiers: ['HERE'], aspect: 'progressive' })).toBe('猫はいつもここで走っています。');
    expect(ja(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'OFTEN', modifiers: ['HERE'] } }))).toBe('猫はよくここにいます。');
  });

  test('direction + place, and direction + manner', () => {
    expect(run({ modifier: 'UP', modifiers: ['HERE'] })).toBe('猫はここで上に走ります。');
    expect(move({ modifier: 'UP', modifiers: ['HERE'] })).toBe('猫は本をここで上に移動します。');
    expect(move({ modifier: 'UP', modifiers: ['FAST'] })).toBe('猫は本を上に速く移動します。');
  });

  test('frequency + frequency stand side by side', () => {
    expect(run({ modifier: 'ALREADY', modifiers: ['OFTEN'] })).toBe('猫はもうよく走ります。');
    expect(run({ modifier: 'ALREADY', modifiers: ['OFTEN'], negative: true })).toBe('猫はまだよく走っていません。');
  });

  test('a negative primary leads, the manner adverb after it', () => {
    expect(run({ modifier: 'NEVER', modifiers: ['FAST'] })).toBe('猫は決して速く走りません。');
    expect(run({ modifier: 'NEVER', modifiers: ['FAST'], tense: 'past' })).toBe('猫は決して速く走りませんでした。');
    expect(run({ modifier: 'NEVER', modifiers: ['AGAIN'] })).toBe('猫は決してもう一度走りません。');
  });

  test('a sentence adverb heads the clause, the frequency one stays by the verb', () => {
    expect(run({ modifier: 'MAYBE', modifiers: ['OFTEN'] })).toBe('猫はもしかするとよく走ります。');
    expect(move({ modifier: 'MAYBE', modifiers: ['OFTEN'] })).toBe('猫はもしかすると本をよく移動します。');
  });

  test('two manner adverbs stand side by side', () => {
    expect(run({ modifier: 'SLOWLY', modifiers: ['WELL'] })).toBe('猫はゆっくりよく走ります。');
  });

  test('a question, a command, a citation and an if clause', () => {
    const V = { modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] };
    expect(run(V, { interrogative: true })).toBe('猫はよくここで速く走りますか？');
    expect(run(V, { imperative: true })).toBe('よくここで速く走ってください。');
    expect(run(V, { infinitive: true })).toBe('よくここで速く走る。');
    expect(run({}, { condition: clause(np('DOG'), 'RUN', { verbPhrase: V }) })).toBe('もし犬がよくここで速く走ったら、猫は走ります。');
  });

  test('a relative clause, and its gap word behind the frequency adverb', () => {
    expect(ja(clause(np('DOG'), 'SEE', {
      directObject: np('CAT', { relative: { verbPhrase: { verb: 'RUN', modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] } } }),
    }))).toBe('犬はよくここで速く走る猫を見ます。');
    const comitative = (modifiers: string[]) => ja(clause(
      np('DOG', { relative: { headRole: 'comitative', subject: np('CAT'), verbPhrase: { verb: 'RUN', modifier: 'OFTEN', modifiers } } }),
      'EAT',
    ));
    expect(comitative(['FAST'])).toBe('猫がよく一緒に速く走る犬は食べます。');
    // TOGETHER as a further adverb already says the relation, so the gap word is not said twice.
    expect(comitative(['TOGETHER'])).toBe('猫がよく一緒に走る犬は食べます。');
  });

  test('a copula predicate takes them ahead of it', () => {
    expect(ja(clause(np('CAT'), 'BE', {
      verbPhrase: { modifier: 'OFTEN', modifiers: ['HERE'] },
      complements: { predicative: { phrase: np('HAPPY') } },
    }))).toBe('猫はよくここで幸せです。');
  });

  test('each adverb carries its own reading', () => {
    expect(furigana(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NEVER', modifiers: ['FAST'] } })))
      .toEqual(['ねこ', 'けっして', 'はやく', 'はしりません']);
  });
});
