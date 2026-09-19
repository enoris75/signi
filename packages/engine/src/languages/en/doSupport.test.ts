import { describe, expect, test } from 'vitest';
import { doSupport } from './doSupport.js';

describe('doSupport', () => {
  test('"does" for a third-person singular subject in the present', () => {
    expect(doSupport({ person: '3', number: 'singular' }, 'present')).toBe('does');
  });

  test('"do" for every other person and number in the present', () => {
    expect(doSupport({ person: '1', number: 'singular' }, 'present')).toBe('do');
    expect(doSupport({ person: '2', number: 'singular' }, 'present')).toBe('do');
    expect(doSupport({ person: '3', number: 'plural' }, 'present')).toBe('do');
  });

  test('"did" for every subject in the past', () => {
    expect(doSupport({ person: '3', number: 'singular' }, 'past')).toBe('did');
    expect(doSupport({ person: '1', number: 'plural' }, 'past')).toBe('did');
  });

  test('a noun subject with no person or number reads as third singular', () => {
    expect(doSupport({}, 'present')).toBe('does');
  });
});
