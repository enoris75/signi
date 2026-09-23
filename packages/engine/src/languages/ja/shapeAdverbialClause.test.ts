import { describe, expect, test } from 'vitest';
import { clause, modal, np, vp, HITSUYOU_GA_ARU, KOTO_GA_DEKIRU, NEKO } from './ja.fixtures.js';
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

  test('after and before clear a resultative aspect, and keep a progressive one (A264)', () => {
    for (const conjunction of ['after', 'before'] as const) {
      const { clause: shaped } = shapeAdverbialClause({ conjunction, clause: eats({ aspect: 'resultative' }) });
      expect(shaped.verbPhrase?.aspect).toBe('neutral');
    }
    const { clause: progressive } = shapeAdverbialClause({ conjunction: 'after', clause: eats({ aspect: 'progressive' }) });
    expect(progressive.verbPhrase?.aspect).toBe('progressive');
    const { clause: when } = shapeAdverbialClause({ conjunction: 'when', clause: eats({ aspect: 'resultative' }) });
    expect(when.verbPhrase?.aspect).toBe('resultative');
  });

  test('while measures a stretch of time with the non-past 〜ている', () => {
    const { clause: shaped, word } = shapeAdverbialClause({ conjunction: 'while', clause: eats({ tense: 'past' }) });
    expect([shaped.verbPhrase?.aspect, shaped.verbPhrase?.tense, word]).toEqual(['progressive', 'present', '間に']);
  });

  test('a clause with an aspect of its own keeps it under while', () => {
    const { clause: shaped } = shapeAdverbialClause({ conjunction: 'while', clause: eats({ aspect: 'resultative' }) });
    expect(shaped.verbPhrase?.aspect).toBe('resultative');
  });

  // A259: a modal is a state already, which 間に measures as it is.
  test('a clause under a modal takes no progressive under while, and keeps an aspect of its own', () => {
    for (const m of [HITSUYOU_GA_ARU, KOTO_GA_DEKIRU]) {
      const { clause: shaped, word } = shapeAdverbialClause({ conjunction: 'while', clause: eats({ tense: 'past', modals: [modal(m)] }) });
      expect([shaped.verbPhrase?.aspect, shaped.verbPhrase?.tense, word]).toEqual([undefined, 'present', '間に']);
    }
    const { clause: own } = shapeAdverbialClause({
      conjunction: 'while', clause: eats({ aspect: 'resultative', modals: [modal(HITSUYOU_GA_ARU)] }),
    });
    expect(own.verbPhrase?.aspect).toBe('resultative');
  });
});
