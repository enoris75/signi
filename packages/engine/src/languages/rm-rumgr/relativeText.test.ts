import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import { CHASA, CHAUN, CUDESCH, CURRER, GIAT, JAU, LIEU, MANGIAR, MIEUR, complement, complements, el, np, vp } from './rumgr.fixtures.js';
import { relativeText } from './relativeText.js';

const LEGER = { base: 'leger', '1sg_present': 'legel', '3sg_present': 'legia' };

describe('relativeText', () => {
  test('nothing without a relative clause', () => {
    expect(relativeText(np(GIAT))).toBe('');
  });

  test('a subject relative: che + the predicate, agreeing with the head', () => {
    const rel: ResolvedRelativeClause = { headRole: 'subject', verbPhrase: vp(MANGIAR), directObject: el(np(MIEUR)) };
    expect(relativeText(np(GIAT, {}, { relative: rel }))).toBe('che mangia la mieur');
    expect(relativeText(np(GIAT, { number: 'plural' }, { relative: rel }))).toBe('che mangian la mieur');
  });

  test("an object relative: ch' before a vowel, the subject always spoken", () => {
    expect(relativeText(np(MIEUR, {}, { relative: { headRole: 'directObject', subject: el(np(GIAT)), verbPhrase: vp(MANGIAR) } }))).toBe("ch'il giat mangia");
    expect(relativeText(np(CUDESCH, {}, { relative: { headRole: 'directObject', subject: el(np(JAU)), verbPhrase: vp(LEGER) } }))).toBe('che jau legel');
  });

  test('after a preposition: il qual agreeing with the head', () => {
    const under = { headRole: 'locative' as const, subject: el(np(GIAT)), verbPhrase: vp(MANGIAR), headSpecifiers: [{ kind: 'path' as const, value: 'under' as const }] };
    expect(relativeText(np(CHASA, {}, { relative: under }))).toBe('sut la quala il giat mangia');
    const withIt = { headRole: 'comitative' as const, subject: el(np(GIAT)), verbPhrase: vp(CURRER) };
    expect(relativeText(np(CHAUN, {}, { relative: withIt }))).toBe('cun il qual il giat curra');
  });

  test('a plain place is nua', () => {
    expect(relativeText(np(LIEU, {}, { relative: { headRole: 'locative', subject: el(np(GIAT)), verbPhrase: vp(MANGIAR) } }))).toBe('nua il giat mangia');
  });

  test('the possessor: the possessed with its article, then dal qual', () => {
    const whose = { headRole: 'possessor' as const, subject: el(np(GIAT)), verbPhrase: vp(MANGIAR), complements: complements({}) };
    expect(relativeText(np(CHAUN, {}, { relative: whose }))).toBe('il giat dal qual mangia');
    void complement;
  });
});
