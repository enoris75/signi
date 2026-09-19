import { describe, expect, test } from 'vitest';
import { invertSubject } from './invertSubject.js';

describe('invertSubject', () => {
  test('moves the first word of the verb group before the subject', () => {
    expect(invertSubject('the cat', ['', 'is running', 'the food', '', ''])).toEqual(['is', 'the cat', 'running', 'the food', '', '']);
    expect(invertSubject('the cat', ['does eat', 'the food'])).toEqual(['does', 'the cat', 'eat', 'the food']);
  });

  test('a lone auxiliary leaves an empty rest', () => {
    expect(invertSubject('the cat', ['', 'is', '', 'careful', ''])).toEqual(['is', 'the cat', '', '', 'careful', '']);
  });

  test('keeps what follows the auxiliary in its part, "not" and adverbs included', () => {
    expect(invertSubject('the cat', ['does not always eat'])).toEqual(['does', 'the cat', 'not always eat']);
  });

  test('splits "cannot" and moves only the "can"', () => {
    expect(invertSubject('the cat', ['', 'cannot run'])).toEqual(['can', 'the cat', 'not run']);
  });

  test('leaves the order alone with no subject or no verb group', () => {
    expect(invertSubject('', ['eat'])).toEqual(['', 'eat']);
    expect(invertSubject('the cat', ['', ''])).toEqual(['the cat', '', '']);
  });
});
