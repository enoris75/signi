import { describe, expect, test } from 'vitest';
import { clause, el, np, vp } from '../../languages/resolved.fixtures.js';
import { fuseGovernedVerb } from './fuseGovernedVerb.js';

const CAT = np({ base: 'Kater' });
const governing = (forms: Record<string, string>, governed = vp({ base: 'laufen', '3sg_present': 'läuft', participle: 'gelaufen', aux: 'be' }), rest = {}) =>
  clause(CAT, vp(forms, { tense: 'past', negative: true }, 'GOVERNOR'), { infinitiveComplement: clause(CAT, governed), ...rest });

describe('fuseGovernedVerb', () => {
  test('German complement_particle puts the particle on the governed verb (läuft weiter)', () => {
    const fused = fuseGovernedVerb(governing({ base: 'weitermachen', complement_particle: 'weiter' }), 'de');
    expect(fused.infinitiveComplement).toBeUndefined();
    expect(fused.verbPhrase?.verb.forms).toMatchObject({
      base: 'weiterlaufen', particle: 'weiter', '3sg_present': 'läuft', participle: 'weitergelaufen', aux: 'be',
    });
    // The governing clause keeps its own tense and negation.
    expect(fused.verbPhrase).toMatchObject({ tense: 'past', negative: true });
  });

  test('the governed clause brings its object, and a verb with a particle of its own keeps it after (kehrt weiter zurück)', () => {
    const food = el(np({ base: 'Essen' }));
    const fused = fuseGovernedVerb(governing({ base: 'weitermachen', complement_particle: 'weiter' },
      vp({ base: 'zurückkehren', particle: 'zurück' })), 'de');
    expect(fused.verbPhrase?.verb.forms['particle']).toBe('weiter zurück');
    const eating = clause(CAT, vp({ base: 'weitermachen', complement_particle: 'weiter' }), {
      infinitiveComplement: clause(CAT, vp({ base: 'fressen' }), { directObject: food }),
    });
    expect(fuseGovernedVerb(eating, 'de').directObject).toBe(food);
  });

  test('a German copula keeps its verb and takes the particle as an adverb (ist weiter glücklich)', () => {
    const fused = fuseGovernedVerb(governing({ base: 'weitermachen', complement_particle: 'weiter' }, vp({ base: 'sein', copula: '1' })), 'de');
    expect(fused.verbPhrase?.verb.forms['base']).toBe('sein');
    expect(fused.verbPhrase?.modifier?.forms['base']).toBe('weiter');
  });

  test('Japanese ja_complement stem compounds the governor onto the governed stem (走り続けます)', () => {
    const tsuzukeru = { base: '続ける', reading: 'つづける', masu_present: '続けます', masu_present_reading: 'つづけます', te: '続けて', te_reading: 'つづけて', ja_complement: 'stem' };
    const hashiru = vp({ base: '走る', reading: 'はしる', masu_present: '走ります', masu_present_reading: 'はしります' });
    const fused = fuseGovernedVerb(governing(tsuzukeru, hashiru), 'ja');
    expect(fused.verbPhrase?.verb.forms).toMatchObject({
      base: '走り続ける', reading: 'はしりつづける', masu_present: '走り続けます', masu_present_reading: 'はしりつづけます', te: '走り続けて', te_reading: 'はしりつづけて',
    });
  });

  test('a German negated complement takes the lexeme\'s adverb over the negated verb (läuft weiterhin nicht, A315)', () => {
    const weiter = { base: 'weitermachen', complement_particle: 'weiter', negative_complement_adverb: 'weiterhin' };
    const phrase = clause(CAT, vp(weiter, { tense: 'past' }), { infinitiveComplement: clause(CAT, vp({ base: 'laufen' }, { negative: true })) });
    const fused = fuseGovernedVerb(phrase, 'de');
    expect(fused.infinitiveComplement).toBeUndefined();
    expect(fused.verbPhrase).toMatchObject({ tense: 'past', negative: true });
    expect(fused.verbPhrase?.verb.forms['base']).toBe('laufen');
    expect(fused.verbPhrase?.modifier?.forms).toEqual({ base: 'weiterhin', negative_slot: 'pre-negator' });
    // A negated governor has a negation of its own to keep apart: the linked infinitive stays.
    const both = clause(CAT, vp(weiter, { negative: true }), { infinitiveComplement: clause(CAT, vp({ base: 'laufen' }, { negative: true })) });
    expect(fuseGovernedVerb(both, 'de')).toBe(both);
  });

  test('a Japanese copular complement marks the governor for the engine\'s であり続ける (A315)', () => {
    const tsuzukeru = { base: '続ける', masu_present: '続けます', ja_complement: 'stem' };
    const happy = { predicative: { phrase: el(np({ base: '幸せな', role: 'adjective' })) } };
    const phrase = clause(CAT, vp(tsuzukeru), { infinitiveComplement: clause(CAT, vp({ base: 'である', copula: '1' }), { complements: happy }) });
    const fused = fuseGovernedVerb(phrase, 'ja');
    expect(fused.verbPhrase?.verb.forms).toMatchObject({ base: '続ける', copular_compound: '1' });
    expect(fused.complements?.['predicative']).toBe(happy.predicative);
  });

  test('an object-controlled or self-negated infinitive, another language or governor, is unchanged', () => {
    const plain = governing({ base: 'weitermachen', complement_particle: 'weiter' });
    expect(fuseGovernedVerb(plain, 'it')).toBe(plain);
    const tried = governing({ base: 'versuchen' });
    expect(fuseGovernedVerb(tried, 'de')).toBe(tried);
    const negated = governing({ base: 'weitermachen', complement_particle: 'weiter' }, vp({ base: 'laufen' }, { negative: true }));
    expect(fuseGovernedVerb(negated, 'de')).toBe(negated);
    const controlled = clause(CAT, vp({ base: 'weitermachen', complement_particle: 'weiter' }), {
      infinitiveComplement: { ...clause(CAT, vp({ base: 'laufen' })), control: 'object' },
    });
    expect(fuseGovernedVerb(controlled, 'de')).toBe(controlled);
  });
});
