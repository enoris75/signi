import { describe, expect, test } from 'vitest';
import { group, np } from '../languages/resolved.fixtures.js';
import { groupObjectClitic } from './groupObjectClitic.js';

const MOI = { person: '1', number: 'singular', base: 'moi', object: 'me', object_plural: 'nous' };
const TOI = { person: '2', number: 'singular', base: 'toi', object: 'te', object_plural: 'vous' };
const LUI = { person: '3', number: 'singular', gender: 'masc', base: 'lui', object: 'le', object_plural: 'les' };
const EL = { person: '3', number: 'singular', gender: 'masc', base: 'él', object: 'lo', object_plural: 'los', object_plural_fem: 'las' };
const ELLA = { person: '3', number: 'singular', gender: 'fem', base: 'ella', object_fem: 'la', object_plural: 'los', object_plural_fem: 'las' };
const CHAT = { base: 'chat', gender: 'masc' };
const CHIEN = { base: 'chien', gender: 'masc' };

describe('groupObjectClitic', () => {
  // A53: French resumes a coordinated pronoun object with the plural clitic of the group's person.
  test('the plural clitic of the group person, read off a pronoun conjunct of that person', () => {
    expect(groupObjectClitic(group('and', np(LUI), np(MOI)))).toBe('nous');
    expect(groupObjectClitic(group('and', np(CHAT), np(TOI)))).toBe('vous');
  });

  test('the group gender picks the clitic, not the conjunct gender', () => {
    expect(groupObjectClitic(group('and', np(ELLA), np(ELLA)))).toBe('las');
    expect(groupObjectClitic(group('and', np(ELLA), np(EL)))).toBe('los');
  });

  test('an agreement with no person or gender reads as the 3rd masculine', () => {
    expect(groupObjectClitic({ conjuncts: [np(CHAT), np(ELLA)], conjunction: 'and', agreement: { number: 'plural' } })).toBe('los');
  });

  test('empty when no conjunct carries the group person', () => {
    expect(groupObjectClitic(group('and', np(CHAT), np(CHIEN)))).toBe('');
  });
});
