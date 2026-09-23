import { describe, expect, test } from 'vitest';
import type { ResolvedVerbPhrase } from '../../types.js';
import { clause, concept, np, vp } from '../../languages/resolved.fixtures.js';
import { asImperfect, imperfectivePast } from './imperfectivePast.js';

const eats = (extra: Partial<Omit<ResolvedVerbPhrase, 'verb'>>) => clause(np({ base: 'gatto' }), vp({ base: 'mangiare' }, extra));

describe('imperfectivePast', () => {
  test('a past while clause is read as a state, so its past is the imperfect', () => {
    for (const language of ['it', 'fr', 'es', 'pt']) {
      expect(imperfectivePast(eats({ tense: 'past' }), 'while', language).verbPhrase?.verb.forms['stative']).toBe('1');
    }
  });

  test('so is the passive auxiliary that takes over the finite slot', () => {
    const passive = eats({ tense: 'past', voice: 'passive', passiveAux: concept({ base: 'essere' }, 'BE') });
    expect(imperfectivePast(passive, 'while', 'it').verbPhrase?.passiveAux?.forms['stative']).toBe('1');
  });

  test('when, a present, a subjunctive and the languages with one simple past are unchanged', () => {
    const past = eats({ tense: 'past' });
    expect(imperfectivePast(past, 'when', 'it')).toBe(past);
    for (const language of ['en', 'de', 'ja']) expect(imperfectivePast(past, 'while', language)).toBe(past);
    const present = eats({ tense: 'present' });
    expect(imperfectivePast(present, 'while', 'it')).toBe(present);
    const subjunctive = eats({ tense: 'past', mood: 'subjunctive' });
    expect(imperfectivePast(subjunctive, 'while', 'es')).toBe(subjunctive);
  });
});

describe('asImperfect', () => {
  test('reads the verb and the passive auxiliary as a state, whatever the clause', () => {
    const passive = eats({ tense: 'present', voice: 'passive', passiveAux: concept({ base: 'essere' }, 'BE') });
    const imperfect = asImperfect(passive);
    expect(imperfect.verbPhrase?.verb.forms['stative']).toBe('1');
    expect(imperfect.verbPhrase?.passiveAux?.forms['stative']).toBe('1');
  });
});
