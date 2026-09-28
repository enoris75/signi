import { describe, expect, test } from 'vitest';
import type { NounElement, PathSpecifier } from '@signi/shared';
import { clause, np, say, sayAll, specifierAll } from '../harness.js';

// A02: `near` and `far`, the distance axis beside the configurations the other relations name. Both
// are locative-only on the toolbar; the engines still render a hand-built route or goal.
const at = (value: PathSpecifier, place: NounElement, verb = 'BE') =>
  clause(np('CAT'), verb, { complements: { locative: { phrase: place, specifiers: [{ kind: 'path', value }] } } });
const toward = (value: PathSpecifier, goal: NounElement) =>
  clause(np('CAT'), 'GO', { complements: { direction: { phrase: goal, specifiers: [{ kind: 'path', value }] } } });
const via = (value: PathSpecifier, path: NounElement) =>
  clause(np('CAT'), 'GO', { complements: { route: { phrase: path, specifiers: [{ kind: 'path', value }] } } });

describe('near', () => {
  test('a place, in every language', () => {
    expect(sayAll(at('near', np('HOUSE')))).toEqual({
      en: 'the cat is near the house.',
      it: 'il gatto è vicino alla casa.',
      fr: 'le chat est près de la maison.',
      de: 'der Kater ist in der Nähe des Hauses.',
      es: 'el gato está cerca de la casa.',
      pt: 'o gato está perto da casa.',
      ja: '猫は家の近くにいます。',
    });
  });

  test('an action verb: Japanese で, German the genitive -es of a masculine', () => {
    expect(sayAll(at('near', np('MARKET'), 'RUN'))).toEqual({
      en: 'the cat runs near the market.',
      it: 'il gatto corre vicino al mercato.',
      fr: 'le chat court près du marché.',
      de: 'der Kater läuft in der Nähe des Marktes.',
      es: 'el gato corre cerca del mercado.',
      pt: 'o gato corre perto do mercado.',
      ja: '猫は市場の近くで走ります。',
    });
  });

  test('the determiner fuses only with the definite', () => {
    expect(sayAll(at('near', np('HOUSE', { definiteness: 'indefinite' })))).toMatchObject({
      it: 'il gatto è vicino a una casa.',
      fr: "le chat est près d'une maison.",
      de: 'der Kater ist in der Nähe eines Hauses.',
      es: 'el gato está cerca de una casa.',
      pt: 'o gato está perto de uma casa.',
    });
    expect(sayAll(at('near', np('HOUSE', { number: 'plural' }))).de).toBe('der Kater ist in der Nähe der Häuser.');
  });

  // The genitive is carried by the determiner or an adjective; where neither shows it, German says
  // "von" + dative instead — and says it of a name without an article too, rather than "Afrikas".
  test('German falls back on von + dative where the genitive would not show', () => {
    expect(sayAll(at('near', np('HOUSE', { number: 'plural', definiteness: 'bare' }))).de).toBe('der Kater ist in der Nähe von Häusern.');
    expect(sayAll(at('near', np('AFRICA')))).toMatchObject({
      en: 'the cat is near Africa.',
      it: "il gatto è vicino all'Africa.",
      fr: "le chat est près de l'Afrique.",
      de: 'der Kater ist in der Nähe von Afrika.',
      es: 'el gato está cerca de África.',
    });
    expect(sayAll(at('near', np('THIRD_PERSON'))).de).toBe('der Kater ist in der Nähe von ihm.');
  });

  test('German declines an adjective and a possessive in the genitive', () => {
    expect(sayAll(at('near', np('HOUSE', { adjectives: ['SMALL'] }))).de).toBe('der Kater ist in der Nähe des kleinen Hauses.');
    expect(sayAll(at('near', np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).de)
      .toBe('der Kater ist in der Nähe meines Hauses.');
  });

  test('a pronoun takes its tonic form', () => {
    expect(sayAll(at('near', np('THIRD_PERSON')))).toMatchObject({
      en: 'the cat is near him.',
      it: 'il gatto è vicino a lui.',
      fr: 'le chat est près de lui.',
      es: 'el gato está cerca de él.',
      pt: 'o gato está perto dele.',
      ja: '猫は彼の近くにいます。',
    });
  });

  // Not offered on the direction, but a hand-built goal renders: German goes "in die Nähe".
  test('a goal', () => {
    expect(sayAll(toward('near', np('HOUSE')))).toMatchObject({
      en: 'the cat goes near the house.',
      de: 'der Kater geht in die Nähe des Hauses.',
      ja: '猫は家の近くへ行きます。',
    });
  });
});

describe('far', () => {
  test('a place, in every language', () => {
    expect(sayAll(at('far', np('HOUSE')))).toEqual({
      en: 'the cat is far from the house.',
      it: 'il gatto è lontano dalla casa.',
      fr: 'le chat est loin de la maison.',
      de: 'der Kater ist weit weg vom Haus.',
      es: 'el gato está lejos de la casa.',
      pt: 'o gato está longe da casa.',
      ja: '猫は家から遠くにいます。',
    });
  });

  test('an action verb', () => {
    expect(sayAll(at('far', np('MARKET'), 'RUN'))).toEqual({
      en: 'the cat runs far from the market.',
      it: 'il gatto corre lontano dal mercato.',
      fr: 'le chat court loin du marché.',
      de: 'der Kater läuft weit weg vom Markt.',
      es: 'el gato corre lejos del mercado.',
      pt: 'o gato corre longe do mercado.',
      ja: '猫は市場から遠くで走ります。',
    });
  });

  test('the determiner, and German the dative of "von"', () => {
    expect(sayAll(at('far', np('HOUSE', { definiteness: 'indefinite' })))).toMatchObject({
      it: 'il gatto è lontano da una casa.',
      fr: "le chat est loin d'une maison.",
      de: 'der Kater ist weit weg von einem Haus.',
      pt: 'o gato está longe de uma casa.',
    });
    expect(sayAll(at('far', np('HOUSE', { number: 'plural' }))).de).toBe('der Kater ist weit weg von den Häusern.');
    expect(sayAll(at('far', np('AFRICA'))).de).toBe('der Kater ist weit weg von Afrika.');
  });

  // Not offered on the route, but a hand-built one renders, and Japanese keeps the route's を.
  test('a route', () => {
    expect(sayAll(via('far', np('HOUSE')))).toMatchObject({
      en: 'the cat goes far from the house.',
      de: 'der Kater geht weit weg vom Haus.',
      ja: '猫は家から遠くを行きます。',
    });
  });
});

describe('the preview languages', () => {
  test.each([
    ['gsw', 'de Chater isch nöch bim Huus.', 'de Chater isch wiit wäg vom Huus.'],
    ['rm-rumgr', 'il giat è datiers da la chasa.', 'il giat è lunsch da la chasa.'],
    ['rm-sursilv', 'il gat ei datier da la casa.', 'il gat ei lunsch da la casa.'],
    ['rm-vallader', 'il giat es dastrusch da la chasa.', 'il giat es dalöntsch da la chasa.'],
    ['ca', 'el gat és a prop de la casa.', 'el gat és lluny de la casa.'],
    ['pl', 'kot jest blisko domu.', 'kot jest daleko od domu.'],
    ['lt', 'katė yra netoli namo.', 'katė yra toli nuo namo.'],
  ] as const)('%s', (language, near, far) => {
    expect(say(at('near', np('HOUSE')), language)).toBe(near);
    expect(say(at('far', np('HOUSE')), language)).toBe(far);
  });
});

describe('the toolbar names each by its adposition', () => {
  test.each([
    ['near', { en: 'near', it: 'vicino a', fr: 'près de', de: 'in der Nähe', es: 'cerca de', pt: 'perto de', ja: '〜の近くで' }],
    ['far', { en: 'far from', it: 'lontano da', fr: 'loin de', de: 'weit weg von', es: 'lejos de', pt: 'longe de', ja: '〜から遠くで' }],
  ] as const)('%s', (value, labels) => {
    expect(specifierAll({ kind: 'path', value })).toEqual(labels);
  });
});
