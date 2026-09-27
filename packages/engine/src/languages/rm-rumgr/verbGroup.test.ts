import { describe, expect, test } from 'vitest';
import { AVAIR, ELLA, ESSER, GIAT, GIATTA, IR, JAU, MANGIAR } from './rumgr.fixtures.js';
import { infinitiveGroup, verbGroup } from './verbGroup.js';

const text = (g: { finite: string; rest: string[] }) => [g.finite, ...g.rest].join(' ');
const GIATTAS = { ...GIATTA, number: 'plural' };

describe('verbGroup', () => {
  describe('neutral aspect', () => {
    test('the present is the cell alone', () => {
      expect(verbGroup(MANGIAR, GIAT, '3sg', 'present', 'neutral', undefined)).toEqual({ finite: 'mangia', rest: [] });
      expect(verbGroup(MANGIAR, JAU, '1sg', 'present', 'neutral', undefined)).toEqual({ finite: 'mangel', rest: [] });
    });

    test('the past is avair + participle, never agreeing', () => {
      expect(verbGroup(MANGIAR, ELLA, '3sg', 'past', 'neutral', undefined)).toEqual({ finite: 'ha', rest: ['mangià'] });
    });

    test('an esser verb agrees its participle with the subject', () => {
      expect(text(verbGroup(IR, GIAT, '3sg', 'past', 'neutral', undefined))).toBe('è ì');
      expect(text(verbGroup(IR, GIATTA, '3sg', 'past', 'neutral', undefined))).toBe('è ida');
      expect(text(verbGroup(IR, GIATTAS, '3pl', 'past', 'neutral', undefined))).toBe('èn idas');
    });

    test('a state verb\'s past is its imperfect', () => {
      expect(verbGroup(AVAIR, GIAT, '3sg', 'past', 'neutral', undefined)).toEqual({ finite: 'aveva', rest: [] });
    });

    test('the future is vegnir a + infinitive, ad before a vowel', () => {
      expect(verbGroup(MANGIAR, GIAT, '3sg', 'future', 'neutral', undefined)).toEqual({ finite: 'vegn', rest: ['a', 'mangiar'] });
      expect(text(verbGroup(IR, JAU, '1sg', 'future', 'neutral', undefined))).toBe('vegn ad ir');
      expect(text(verbGroup(ESSER, GIAT, '3pl', 'future', 'neutral', undefined))).toBe('vegnan ad esser');
    });

    test('a hypothetical mood reads its own cell whatever the tense', () => {
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'present', 'neutral', 'conditional'))).toBe('mangiass');
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'past', 'neutral', 'subjunctive'))).toBe('mangiass');
      expect(text(verbGroup(ESSER, GIAT, '3sg', 'present', 'neutral', 'presentSubjunctive'))).toBe('saja');
    });
  });

  describe('resultative', () => {
    test('present and past: ha / aveva + participle', () => {
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'present', 'resultative', undefined))).toBe('ha mangià');
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'past', 'resultative', undefined))).toBe('aveva mangià');
      expect(text(verbGroup(IR, ELLA, '3sg', 'past', 'resultative', undefined))).toBe('era ida');
    });

    test('the future: vegn ad avair / esser + participle', () => {
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'future', 'resultative', undefined))).toBe('vegn ad avair mangià');
      expect(text(verbGroup(IR, ELLA, '3sg', 'future', 'resultative', undefined))).toBe('vegn ad esser ida');
    });

    test('a hypothetical: avess / fiss + participle', () => {
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'past', 'resultative', 'conditional'))).toBe('avess mangià');
      expect(text(verbGroup(IR, GIATTA, '3sg', 'future', 'resultative', 'subjunctive'))).toBe('fiss ida');
      expect(text(verbGroup(MANGIAR, JAU, '1sg', 'present', 'resultative', 'presentSubjunctive'))).toBe('haja mangià');
    });
  });

  describe('progressive and prospective', () => {
    test('esser vidlonder da / sin il punct da + infinitive', () => {
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'present', 'progressive', undefined))).toBe('è vidlonder da mangiar');
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'past', 'progressive', undefined))).toBe('era vidlonder da mangiar');
      expect(text(verbGroup(MANGIAR, JAU, '1sg', 'present', 'prospective', undefined))).toBe('sun sin il punct da mangiar');
    });

    test('the future and a hypothetical', () => {
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'future', 'progressive', undefined))).toBe('vegn ad esser vidlonder da mangiar');
      expect(text(verbGroup(MANGIAR, GIAT, '3sg', 'present', 'progressive', 'conditional'))).toBe('fiss vidlonder da mangiar');
    });
  });
});

describe('infinitiveGroup', () => {
  test('the bare infinitive', () => {
    expect(infinitiveGroup(MANGIAR, GIAT, 'neutral')).toEqual(['mangiar']);
  });

  test('the aspect frames after esser', () => {
    expect(infinitiveGroup(MANGIAR, GIAT, 'progressive')).toEqual(['esser', 'vidlonder da', 'mangiar']);
    expect(infinitiveGroup(MANGIAR, GIAT, 'prospective')).toEqual(['esser', 'sin il punct da', 'mangiar']);
  });

  test('the resultative: avair + participle, or esser + the agreeing participle', () => {
    expect(infinitiveGroup(MANGIAR, GIATTA, 'resultative')).toEqual(['avair', 'mangià']);
    expect(infinitiveGroup(IR, GIATTA, 'resultative')).toEqual(['esser', 'ida']);
    expect(infinitiveGroup(IR, GIATTAS, 'resultative')).toEqual(['esser', 'idas']);
  });
});
