import { describe, expect, test } from 'vitest';
import type { FocusParticle } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// Localization C39: a focus particle on a noun phrase — what the phrase is singled out against.
// It is a value, not a concept: no language offers one word a picker could hold, and Japanese
// offers none at all, writing a particle on the phrase that replaces its case particle.

describe('the focus particle on a subject', () => {
  test.each<[FocusParticle, Record<string, string>]>([
    ['only', {
      en: 'only the cat eats.', it: 'solo il gatto mangia.', fr: 'seulement le chat mange.',
      de: 'nur der Kater frisst.', es: 'solo el gato come.', ja: '猫だけ食べます。', pt: 'só o gato come.',
    }],
    ['even', {
      en: 'even the cat eats.', it: 'perfino il gatto mangia.', fr: 'même le chat mange.',
      de: 'sogar der Kater frisst.', es: 'incluso el gato come.', ja: '猫さえ食べます。', pt: 'até o gato come.',
    }],
    // English and French put this one after the phrase.
    ['also', {
      en: 'the cat too eats.', it: 'anche il gatto mangia.', fr: 'le chat aussi mange.',
      de: 'auch der Kater frisst.', es: 'también el gato come.', ja: '猫も食べます。', pt: 'também o gato come.',
    }],
  ])('%s', (focus, rendered) => {
    expect(sayAll(clause(np('CAT', { focus }), 'EAT'))).toEqual(rendered);
  });
});

describe('the focus particle on a direct object', () => {
  test.each<[FocusParticle, Record<string, string>]>([
    ['only', {
      en: 'the cat eats only the food.', it: 'il gatto mangia solo il cibo.',
      fr: 'le chat mange seulement la nourriture.', de: 'der Kater frisst nur das Essen.',
      es: 'el gato come solo la comida.', ja: '猫は食べ物だけ食べます。', pt: 'o gato come só a comida.',
    }],
    ['even', {
      en: 'the cat eats even the food.', it: 'il gatto mangia perfino il cibo.',
      fr: 'le chat mange même la nourriture.', de: 'der Kater frisst sogar das Essen.',
      es: 'el gato come incluso la comida.', ja: '猫は食べ物さえ食べます。', pt: 'o gato come até a comida.',
    }],
    ['also', {
      en: 'the cat eats the food too.', it: 'il gatto mangia anche il cibo.',
      fr: 'le chat mange la nourriture aussi.', de: 'der Kater frisst auch das Essen.',
      es: 'el gato come también la comida.', ja: '猫は食べ物も食べます。', pt: 'o gato come também a comida.',
    }],
  ])('%s', (focus, rendered) => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('FOOD', { focus }) }))).toEqual(rendered);
  });
});

describe('what the particle replaces, and what it follows', () => {
  // The whole of the construct in Japanese: も / さえ / だけ stand where the case particle stands,
  // taking its place after が / を / は and following に / で. The six European languages write a
  // word beside the phrase instead, so they have to know which slot it is.
  test('Japanese writes it wherever a case particle is written, complements included', () => {
    expect(say(clause(np('CAT'), 'LIVE', {
      complements: { locative: { phrase: np('HOUSE', { focus: 'also' }) } },
    }), 'ja')).toBe('猫は家にも住みます。');
    // The six spell a complement's focus nowhere yet — the word belongs in front of the adposition
    // ("nur im Haus"), which the complement renderers build together with the phrase (C39).
    expect(say(clause(np('CAT'), 'LIVE', {
      complements: { locative: { phrase: np('HOUSE', { focus: 'also' }) } },
    }), 'de')).toBe('der Kater wohnt im Haus.');
  });

  test('a coordination takes none: the focus is of the slot, not of one conjunct', () => {
    const group = { conjuncts: [np('CAT', { focus: 'only' as const }), np('DOG')], conjunction: 'and' as const };
    expect(sayAll(clause(group, 'EAT'))).toEqual(
      sayAll(clause({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' }, 'EAT')),
    );
  });

  test('the negative determiner keeps its own circumfix', () => {
    expect(say(clause(np('CAT', { definiteness: 'no' }), 'EAT'), 'ja')).toBe('どの猫も食べません。');
  });
});
