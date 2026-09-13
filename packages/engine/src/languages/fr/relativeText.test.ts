import { describe, expect, test } from 'vitest';
import { ALLER, ANGE, CHAT, CHIEN, el, FEMME, GARCON, IL, LIVRE, MAISON, MANGER, np, ON, SOURIS, vp } from './fr.fixtures.js';
import { relativeText } from './relativeText.js';

describe('relativeText', () => {
  test('renders nothing without a relative clause', () => {
    expect(relativeText(np(CHAT))).toBe('');
  });

  test('a subject relative is qui + a predicate agreeing with the head', () => {
    expect(relativeText(np(CHAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(MANGER), directObject: el(np(SOURIS)) } })))
      .toBe('qui mange la souris');
    expect(relativeText(np(CHAT, { number: 'plural' }, { relative: { headRole: 'subject', verbPhrase: vp(MANGER) } }))).toBe('qui mangent');
    expect(relativeText(np(FEMME, {}, { relative: { headRole: 'subject', verbPhrase: vp(ALLER, { aspect: 'resultative' }) } })))
      .toBe('qui est allée');
  });

  test('a relative with no clause subject of its own falls back to qui', () => {
    expect(relativeText(np(CHAT, {}, { relative: { headRole: 'directObject', verbPhrase: vp(MANGER) } }))).toBe('qui mange');
  });

  test('a direct-object relative is que + the clause’s own subject, which the verb agrees with', () => {
    expect(relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject: el(np(CHAT)), verbPhrase: vp(MANGER) } })))
      .toBe('que le chat mange');
    expect(relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject: el(np(CHAT), np(CHIEN)), verbPhrase: vp(MANGER) } })))
      .toBe('que le chat et le chien mangent');
  });

  test('que elides before a vowel-initial subject', () => {
    const eatenBy = (subject: ReturnType<typeof el>) =>
      relativeText(np(SOURIS, {}, { relative: { headRole: 'directObject', subject, verbPhrase: vp(MANGER) } }));
    expect(eatenBy(el(np(ON)))).toBe("qu'on mange");
    expect(eatenBy(el(np(IL)))).toBe("qu'il mange");
    expect(eatenBy(el(np(ANGE, { definiteness: 'indefinite' })))).toBe("qu'un ange mange");
  });

  // The accord du COD antéposé: the head is the preceding direct object.
  test('an avoir participle agrees with the direct-object head', () => {
    const eaten = (head: ReturnType<typeof np>) =>
      relativeText({ ...head, relative: { headRole: 'directObject', subject: el(np(CHAT)), verbPhrase: vp(MANGER, { aspect: 'resultative' }) } });
    expect(eaten(np(SOURIS))).toBe('que le chat a mangée');
    expect(eaten(np(SOURIS, { number: 'plural' }))).toBe('que le chat a mangées');
    expect(eaten(np(LIVRE, { number: 'plural' }))).toBe('que le chat a mangés');
    expect(eaten(np(LIVRE))).toBe('que le chat a mangé');
  });

  // "lequel" is written as one word with its article, contracted or not.
  test('a head filling a complement takes its preposition with an agreeing lequel', () => {
    expect(relativeText(np(MAISON, {}, { relative: { headRole: 'locative', subject: el(np(CHAT)), verbPhrase: vp(MANGER) } }))).toBe('dans laquelle le chat mange');
    expect(relativeText(np(GARCON, { number: 'plural' }, { relative: { headRole: 'direction', subject: el(np(CHAT)), verbPhrase: vp(ALLER, {}, 'GO') } })))
      .toBe('vers lesquels le chat va');
    expect(relativeText(np(CHIEN, {}, {
      relative: { headRole: 'cause', subject: el(np(CHAT)), verbPhrase: vp(MANGER), headSpecifiers: [{ kind: 'sentiment', value: 'negative' }] },
    }))).toBe('par la faute duquel le chat mange');
  });
});
