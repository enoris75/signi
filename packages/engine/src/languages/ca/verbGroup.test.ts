import { describe, expect, test } from 'vitest';
import { MENJAR, SER } from './ca.fixtures.js';
import { infinitiveGroup, verbGroup } from './verbGroup.js';

const group = (...args: Parameters<typeof verbGroup>) => verbGroup(...args).text;

describe('verbGroup', () => {
  test('the neutral tenses: stored present and future, periphrastic past', () => {
    expect(group(MENJAR, '3sg', 'present', 'neutral', undefined)).toBe('menja');
    expect(group(MENJAR, '3sg', 'past', 'neutral', undefined)).toBe('va menjar');
    expect(group(MENJAR, '1pl', 'past', 'neutral', undefined)).toBe('vam menjar');
    expect(group(MENJAR, '3pl', 'future', 'neutral', undefined)).toBe('menjaran');
    expect(group(SER, '3sg', 'past', 'neutral', undefined)).toBe('era');
  });

  test('the marked aspects, their past the auxiliary\'s imperfect', () => {
    expect(group(MENJAR, '3sg', 'present', 'progressive', undefined)).toBe('està menjant');
    expect(group(MENJAR, '3pl', 'past', 'progressive', undefined)).toBe('estaven menjant');
    expect(group(MENJAR, '3sg', 'present', 'prospective', undefined)).toBe('està a punt de menjar');
    expect(group(MENJAR, '1sg', 'present', 'resultative', undefined)).toBe('he menjat');
    expect(group(MENJAR, '3sg', 'past', 'resultative', undefined)).toBe('havia menjat');
    expect(group(MENJAR, '3sg', 'future', 'resultative', undefined)).toBe('haurà menjat');
  });

  test('a mood reads its cell of the finite word and keeps the rest', () => {
    expect(group(MENJAR, '3sg', 'present', 'neutral', 'conditional')).toBe('menjaria');
    expect(group(MENJAR, '3sg', 'past', 'resultative', 'conditional')).toBe('hauria menjat');
    expect(group(MENJAR, '3sg', 'present', 'progressive', 'subjunctive')).toBe('estigués menjant');
  });

  test('a pronominal verb\'s clitic rides on the gerund or infinitive, or leads the finite word', () => {
    expect(group(MENJAR, '3sg', 'present', 'progressive', undefined, 'es')).toBe('està menjant-se');
    expect(verbGroup(MENJAR, '3sg', 'present', 'resultative', undefined, 'es').leads).toBe(true);
    expect(verbGroup(MENJAR, '3sg', 'past', 'neutral', undefined, 'es').leads).toBe(true);
  });
});

describe('infinitiveGroup', () => {
  test('the group as an infinitive', () => {
    expect(infinitiveGroup(MENJAR, 'neutral')).toBe('menjar');
    expect(infinitiveGroup(MENJAR, 'progressive')).toBe('estar menjant');
    expect(infinitiveGroup(MENJAR, 'prospective')).toBe('estar a punt de menjar');
    expect(infinitiveGroup(MENJAR, 'resultative')).toBe('haver menjat');
  });

  test('a clitic attaches to the word it belongs to', () => {
    expect(infinitiveGroup(MENJAR, 'neutral', 'es')).toBe('menjar-se');
    expect(infinitiveGroup(MENJAR, 'resultative', 'em')).toBe('haver-me menjat');
  });
});
