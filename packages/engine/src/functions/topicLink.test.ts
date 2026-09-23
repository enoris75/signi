import { describe, expect, test } from 'vitest';
import { topicLink } from './topicLink.js';

describe('topicLink', () => {
  test('reads the preposition the verb governs its topic with', () => {
    expect(topicLink({ base: 'pensare', topic_prep: 'a' })).toBe('a');
    expect(topicLink({ base: 'denken', topic_prep: 'an' })).toBe('an');
  });

  test('a verb naming none leaves the language its own', () => {
    expect(topicLink({ base: 'parlare' })).toBe('');
    expect(topicLink()).toBe('');
  });
});
