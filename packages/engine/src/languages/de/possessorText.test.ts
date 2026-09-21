import { describe, expect, test } from 'vitest';
import { adj, BESTIMMUNG_RICHTUNG, BOOT, BUCH, ESSEN, EUROPA, type Forms, GROSS, HAUS, JUNGE, KATER, KATZE, KLEIN, MANN, np, nounModifier, SCHWEIZ, SEGEL, vp, WASSER } from './de.fixtures.js';
import { possessorText } from './possessorText.js';

const KALT: Forms = { role: 'adjective', base: 'kalt' };

// B09: standard German postposes a noun possessor in the genitive, and takes "von" + the dative only
// where the genitive would not show.
describe('possessorText', () => {
  test('is empty with no possessor or a pronominal one', () => {
    expect(possessorText(np(BUCH))).toBe('');
    expect(possessorText(np(BUCH, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }))).toBe('');
  });

  test('a possessor\'s own possessive takes the article\'s place, in the genitive', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) }))).toBe(' meines Katers');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE, {}, { possessor: { kind: 'pronominal', person: '2', number: 'plural' } }) }))).toBe(' eurer Katze');
  });

  test('the definite article declines for the genitive, and the noun takes its -(e)s', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER) }))).toBe(' des Katers');
    expect(possessorText(np(BUCH, {}, { possessor: np(HAUS) }))).toBe(' des Hauses');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE) }))).toBe(' der Katze');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE, { number: 'plural' }) }))).toBe(' der Katzen');
  });

  test('the possessor keeps its own determiner, declined for the genitive', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, { definiteness: 'indefinite' }) }))).toBe(' eines Katers');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE, { definiteness: 'this' }) }))).toBe(' dieser Katze');
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, { definiteness: 'no' }) }))).toBe(' keines Katers');
    expect(possessorText(np(BUCH, {}, { possessor: np(MANN, { definiteness: 'some', number: 'plural' }) }))).toBe(' einiger Männer');
    // With no article the adjective carries the genitive itself, strong.
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, { definiteness: 'bare', number: 'plural' }, { adjectives: [adj(KLEIN)] }) })))
      .toBe(' kleiner Kater');
  });

  test('the plural takes no ending, and a weak masculine its -(e)n', () => {
    expect(possessorText(np(HAUS, {}, { possessor: np(MANN, { number: 'plural' }) }))).toBe(' der Männer');
    expect(possessorText(np(BUCH, {}, { possessor: np(JUNGE) }))).toBe(' des Jungen');
    expect(possessorText(np(BUCH, {}, { possessor: np(JUNGE, { definiteness: 'indefinite' }) }))).toBe(' eines Jungen');
  });

  test('declines the possessor’s adjectives genitive and keeps its compound', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, {}, { adjectives: [adj(KLEIN)] }) }))).toBe(' des kleinen Katers');
    expect(possessorText(np(HAUS, {}, { possessor: np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] }) }))).toBe(' des Segelboots');
  });

  // A bare name shows its genitive on its own -s; an articled one, or one an adjective articles (A169),
  // on the article.
  test('a proper name takes its -s, or the article it has', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(EUROPA) }))).toBe(' Europas');
    expect(possessorText(np(BUCH, {}, { possessor: np(EUROPA, {}, { adjectives: [adj(GROSS)] }) }))).toBe(' des großen Europas');
    expect(possessorText(np(BUCH, {}, { possessor: np(SCHWEIZ) }))).toBe(' der Schweiz');
  });

  // Where nothing would show the genitive, German takes "von" + the dative.
  test('a determinerless plural or mass noun, or a name ending in a sibilant, takes von + the dative', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(KATZE, { definiteness: 'bare', number: 'plural' }) }))).toBe(' von Katzen');
    expect(possessorText(np(BUCH, {}, { possessor: np(MANN, { definiteness: 'indefinite', number: 'plural' }) }))).toBe(' von Männern');
    expect(possessorText(np(BUCH, {}, { possessor: np(WASSER, { definiteness: 'bare' }) }))).toBe(' von Wasser');
    expect(possessorText(np(BUCH, {}, { possessor: np(WASSER, { definiteness: 'some' }, { adjectives: [adj(KALT)] }) }))).toBe(' von etwas kaltem Wasser');
    expect(possessorText(np(BUCH, {}, { possessor: np({ base: 'Paris', gender: 'neut', count: 'singular', proper: '1' }) }))).toBe(' von Paris');
    // An adjective shows it, strong: the genitive again.
    expect(possessorText(np(BUCH, {}, { possessor: np(WASSER, { definiteness: 'bare' }, { adjectives: [adj(KALT)] }) }))).toBe(' kalten Wassers');
  });

  test('a multiword possessor declines its adjective, the words after its head fixed (A140)', () => {
    expect(possessorText(np(BUCH, {}, { possessor: np(BESTIMMUNG_RICHTUNG, { number: 'plural' }) }))).toBe(' der adverbialen Bestimmungen der Richtung');
  });

  test('recurses into a nested possessor and a relative clause', () => {
    expect(possessorText(np(HAUS, {}, { possessor: np(KATZE, {}, { possessor: np(MANN) }) }))).toBe(' der Katze des Mannes');
    const relative = { headRole: 'subject' as const, verbPhrase: vp(ESSEN) };
    expect(possessorText(np(BUCH, {}, { possessor: np(KATER, {}, { relative }) }))).toBe(' des Katers, der isst,');
  });
});
