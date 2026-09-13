import { describe, expect, test } from 'vitest';
import { ptEnclitic } from './ptEnclitic.js';

describe('ptEnclitic', () => {
  test('after -r the clitic is lo and a final a / e / o is accented', () => {
    expect(ptEnclitic('comer', 'os')).toBe('comê-los');
    expect(ptEnclitic('ver', 'o')).toBe('vê-lo');
    expect(ptEnclitic('carregar', 'a')).toBe('carregá-la');
    expect(ptEnclitic('partir', 'o')).toBe('parti-lo');
  });

  test('after -s the consonant drops with no accent', () => {
    expect(ptEnclitic('comamos', 'o')).toBe('comamo-lo');
  });

  test('after a nasal the clitic is no', () => {
    expect(ptEnclitic('comem', 'o')).toBe('comem-no');
    expect(ptEnclitic('dão', 'as')).toBe('dão-nas');
  });

  test('elsewhere the clitic keeps its shape', () => {
    expect(ptEnclitic('veja', 'o')).toBe('veja-o');
    expect(ptEnclitic('vejo', 'a')).toBe('vejo-a');
  });
});
