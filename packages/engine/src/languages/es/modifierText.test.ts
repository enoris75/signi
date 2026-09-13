import { describe, expect, test } from 'vitest';
import { adj, CASA, CREADOR, FRASE, INTERESANTE, nounModifier, np, NUEVO, PALABRA, PALO, SEMANTICO } from './es.fixtures.js';
import { modifierText } from './modifierText.js';

describe('modifierText', () => {
  test('is empty without attributive nouns', () => {
    expect(modifierText(np(CREADOR))).toBe('');
  });

  test('each attributive noun trails as a bare de + noun, with a leading space', () => {
    expect(modifierText(np(CREADOR, {}, { nounModifiers: [nounModifier(FRASE)] }))).toBe(' de frase');
    expect(modifierText(np(CREADOR, {}, { nounModifiers: [nounModifier({ ...FRASE, number: 'plural' })] }))).toBe(' de frases');
    expect(modifierText(np(CREADOR, {}, { nounModifiers: [nounModifier({ ...PALABRA, count: 'plural' })] }))).toBe(' de palabras');
  });

  test('every relation takes de', () => {
    expect(modifierText(np(CASA, {}, { nounModifiers: [nounModifier({ ...PALO, number: 'plural' }, [], 'material')] }))).toBe(' de palos');
    expect(modifierText(np(CASA, {}, { nounModifiers: [nounModifier(PALABRA, [], 'purpose')] }))).toBe(' de palabra');
  });

  test('its adjectives agree with the attributive noun, not the head', () => {
    expect(modifierText(np(CREADOR, {}, { nounModifiers: [nounModifier({ ...FRASE, number: 'plural' }, [adj(SEMANTICO)])] })))
      .toBe(' de frases semánticas');
    expect(modifierText(np(CREADOR, {}, { nounModifiers: [nounModifier(FRASE, [adj(NUEVO), adj(INTERESANTE)])] })))
      .toBe(' de frase nueva e interesante');
  });

  test('an attributive noun with no surface contributes nothing', () => {
    expect(modifierText(np(CREADOR, {}, { nounModifiers: [nounModifier({ gender: 'fem' })] }))).toBe('');
  });
});
