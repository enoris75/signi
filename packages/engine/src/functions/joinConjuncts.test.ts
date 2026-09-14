import { describe, expect, test } from 'vitest';
import { joinConjuncts } from './joinConjuncts.js';

const and = () => ' and ';

describe('joinConjuncts', () => {
  test('no conjuncts join to nothing, and one stands alone', () => {
    expect(joinConjuncts([], ', ', and)).toBe('');
    expect(joinConjuncts(['cat'], ', ', and)).toBe('cat');
  });

  test('empty renders are dropped before joining', () => {
    expect(joinConjuncts(['', 'cat', ''], ', ', and)).toBe('cat');
    expect(joinConjuncts(['cat', '', 'dog'], ', ', and)).toBe('cat and dog');
  });

  test('every junction but the last takes the separator', () => {
    expect(joinConjuncts(['cat', 'dog', 'fox'], ', ', and)).toBe('cat, dog and fox');
    expect(joinConjuncts(['猫', '犬', '狐'], 'と', () => 'と')).toBe('猫と犬と狐');
  });

  test('the last link is chosen by the conjunct that follows it', () => {
    const y = (next: string) => (/^h?i/.test(next) ? ' e ' : ' y ');
    expect(joinConjuncts(['padre', 'hijo'], ', ', y)).toBe('padre e hijo');
    expect(joinConjuncts(['hijo', 'padre'], ', ', y)).toBe('hijo y padre');
  });
});
