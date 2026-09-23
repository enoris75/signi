import { describe, expect, test } from 'vitest';
import { clause, np, vp, NEKO } from './ja.fixtures.js';
import { shapeAdverbialClause } from './shapeAdverbialClause.js';

const TABERU = { base: '食べる', reading: 'たべる' };
const eats = (extra = {}) => clause(np(NEKO), vp(TABERU, extra));

describe('shapeAdverbialClause', () => {
  test('when and because keep the clause as it is', () => {
    expect(shapeAdverbialClause({ conjunction: 'when', clause: eats({ tense: 'past' }) })).toEqual({
      clause: eats({ tense: 'past', aspect: undefined }), word: '時に',
    });
    expect(shapeAdverbialClause({ conjunction: 'because', clause: eats() }).word).toBe('ので');
  });

  test('after puts the verb in the past and before in the non-past, whatever the clause says', () => {
    const after = shapeAdverbialClause({ conjunction: 'after', clause: eats({ tense: 'present' }) });
    expect([after.clause.verbPhrase?.tense, after.word]).toEqual(['past', '後で']);
    const before = shapeAdverbialClause({ conjunction: 'before', clause: eats({ tense: 'past' }) });
    expect([before.clause.verbPhrase?.tense, before.word]).toEqual(['present', '前に']);
  });

  test('while measures a stretch of time with the non-past 〜ている', () => {
    const { clause: shaped, word } = shapeAdverbialClause({ conjunction: 'while', clause: eats({ tense: 'past' }) });
    expect([shaped.verbPhrase?.aspect, shaped.verbPhrase?.tense, word]).toEqual(['progressive', 'present', '間に']);
  });

  test('a clause with an aspect of its own keeps it under while', () => {
    const { clause: shaped } = shapeAdverbialClause({ conjunction: 'while', clause: eats({ aspect: 'resultative' }) });
    expect(shaped.verbPhrase?.aspect).toBe('resultative');
  });
});
