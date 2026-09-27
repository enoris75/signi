import { describe, expect, test } from 'vitest';
import { el, GAT, GOS, group, NEN, np } from './ca.fixtures.js';
import { coordinateElement } from './coordinateElement.js';
import { npText } from './npText.js';

describe('coordinateElement', () => {
  test('i and o, which never change form', () => {
    expect(coordinateElement(el(np(GAT), np(GOS)), npText)).toBe('el gat i el gos');
    expect(coordinateElement(group('or', np(GAT), np(GOS)), npText)).toBe('el gat o el gos');
  });

  test('after the verb a last cap conjunct is linked with ni', () => {
    const none = group('and', np(NEN, { definiteness: 'no' }), np(NEN, { definiteness: 'no', gender: 'fem', base: 'nena' }));
    expect(coordinateElement(none, npText, true)).toBe('cap nen ni cap nena');
  });

  test('the correlative pair', () => {
    expect(coordinateElement({ ...el(np(GAT), np(GOS)), correlative: true } as never, npText)).toBe('tant el gat com el gos');
  });
});
