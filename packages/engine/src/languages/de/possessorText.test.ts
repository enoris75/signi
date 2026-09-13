import { describe, expect, test } from 'vitest';
import { adj, BOOT, BUCH, ESSEN, HAUS, JUNGE, KATER, KATZE, KLEIN, MANN, np, nounModifier, SEGEL, vp } from './de.fixtures.js';
import { possessorText } from './possessorText.js';

describe('possessorText', () => {
  test('is empty with no possessor or a pronominal one', () => {
    expect(possessorText(np(BUCH))).toBe('');
    expect(possessorText(np(BUCH, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }))).toBe('');
  });

  test('von + dem fuses to vom; the feminine and plural stay von der / von den', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER) }))).toBe(' vom Kater');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE) }))).toBe(' von der Katze');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE, { number: 'plural' }) }))).toBe(' von den Katzen');
  });

  test('the possessor keeps its own determiner, declined for the dative; only the definite fuses', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, { definiteness: 'indefinite' }) }))).toBe(' von einem Kater');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE, { definiteness: 'this' }) }))).toBe(' von dieser Katze');
    expect(possessorText(np(BUCH, {}, { possessor: np(MANN, { definiteness: 'some', number: 'plural' }) }))).toBe(' von einigen Männern');
    // With no article the adjective carries the dative itself.
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, { definiteness: 'bare', number: 'plural' }, { adjectives: [adj(KLEIN)] }) })))
      .toBe(' von kleinen Katern');
  });

  test('the possessor noun takes the dative plural -n, or the weak -n', () => {
    expect(possessorText(np(HAUS, {}, { possessor: np(MANN, { number: 'plural' }) }))).toBe(' von den Männern');
    expect(possessorText(np(BUCH, {}, { possessor: np(JUNGE) }))).toBe(' vom Jungen');
  });

  test('declines the possessor’s adjectives dative and keeps its compound', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, {}, { adjectives: [adj(KLEIN)] }) }))).toBe(' vom kleinen Kater');
    expect(possessorText(np(HAUS, {}, { possessor: np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] }) }))).toBe(' vom Segelboot');
  });

  test('recurses into a nested possessor and a relative clause', () => {
    expect(possessorText(np(HAUS, {}, { possessor: np(KATZE, {}, { possessor: np(MANN) }) }))).toBe(' von der Katze vom Mann');
    const relative = { headRole: 'subject' as const, verbPhrase: vp(ESSEN) };
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, {}, { relative }) }))).toBe(' vom Kater, der isst,');
  });
});
