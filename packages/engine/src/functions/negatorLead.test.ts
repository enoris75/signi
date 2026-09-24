import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { negatorLead } from './negatorLead.js';

describe('negatorLead', () => {
  test('a negative adverb that is its negator with a word in front names that word', () => {
    expect(negatorLead(concept({ base: 'ya no', polarity: 'negative', negator_lead: 'ya' }))).toBe('ya');
    expect(negatorLead(concept({ base: 'já não', polarity: 'negative', negator_lead: 'já' }))).toBe('já');
  });

  test('a negative adverb of its own word has none (NEVER trails the verb: "no correr nunca")', () => {
    expect(negatorLead(concept({ base: 'nunca', polarity: 'negative' }))).toBe('');
  });

  test('the column means nothing on an adverb that does not negate, and no adverb has none', () => {
    expect(negatorLead(concept({ base: 'ya', negator_lead: 'ya' }))).toBe('');
    expect(negatorLead(undefined)).toBe('');
  });
});
