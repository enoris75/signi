import { describe, expect, test } from 'vitest';
import { pluralize } from './pluralize.js';

describe('pluralize', () => {
  test('adds -s to a vowel-final word', () => {
    expect(pluralize('gato')).toBe('gatos');
    expect(pluralize('grande')).toBe('grandes');
    expect(pluralize('pau')).toBe('paus');
  });

  test('turns a final -m into -ns', () => {
    expect(pluralize('homem')).toBe('homens');
    expect(pluralize('jovem')).toBe('jovens');
  });

  test('adds -es after -r and -z', () => {
    expect(pluralize('mulher')).toBe('mulheres');
    expect(pluralize('maior')).toBe('maiores');
    expect(pluralize('luz')).toBe('luzes');
    expect(pluralize('feliz')).toBe('felizes');
  });

  test('turns a final -al into -ais', () => {
    expect(pluralize('animal')).toBe('animais');
    expect(pluralize('universal')).toBe('universais');
  });
});
