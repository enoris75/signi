import { describe, expect, it } from 'vitest';
import { computeCompactLayout, packPeriod } from '../src/components/PhraseBuilder/layout.ts';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import { CONJUNCT_GAP } from '../src/components/PhraseBuilder/conjunctChain.ts';

// Compact packs each word into a 132 px cell, 16 px apart, rows 60 px tall, 4 px in from the
// canvas's edges. The helpers read the packed cells back in canvas px.
const CELL = 132;

function cells(keys: string[], svgW: number, corner?: { w: number; h: number }) {
  const { positions, height } = computeCompactLayout(keys, svgW, corner);
  const at = (k: string) => ({
    left: (positions[k].x / 100) * svgW - CELL / 2,
    right: (positions[k].x / 100) * svgW + CELL / 2,
    center: (positions[k].y / 100) * height,
  });
  return { at, height, rows: [...new Set(keys.map((k) => Math.round(at(k).center)))].length };
}

const WORDS = ['subject', 'verb', 'directObject', 'locative'];

describe('computeCompactLayout', () => {
  it('centres a row of words that fits the canvas, and hugs it in height', () => {
    const { at, height, rows } = cells(WORDS, 1000);

    expect(rows).toBe(1);
    expect(height).toBe(68);
    // Four cells and three gaps are 576 px, centred: 212 px either side.
    expect(at('subject').left).toBeCloseTo(212);
    expect(at('locative').right).toBeCloseTo(788);
  });

  it('shifts the first row left, just clear of the controls in the corner', () => {
    // The controls reach 250 px in: the row stops a gap short, at 1000 - 250 - 16 = 734.
    const { at, height, rows } = cells(WORDS, 1000, { w: 250, h: 17 });

    expect(rows).toBe(1);
    expect(height).toBe(68);
    expect(at('locative').right).toBeCloseTo(734);
    expect(at('subject').left).toBeCloseTo(158);
  });

  it('leaves the row centred when the controls are nowhere near it', () => {
    expect(cells(WORDS, 1000, { w: 150, h: 17 }).at('subject').left).toBeCloseTo(212);
  });

  it('moves the words that do not fit beside the controls down a row', () => {
    // 700 px holds four cells to a row, but only three beside controls reaching 120 px in.
    const { at, rows } = cells(WORDS, 700, { w: 120, h: 17 });

    expect(rows).toBe(2);
    expect(at('directObject').right).toBeCloseTo(700 - 120 - 16);
    expect(at('locative').center).toBeGreaterThan(at('subject').center);
    // The rows below the first span the whole canvas again: the lone word is centred on it.
    expect((at('locative').left + at('locative').right) / 2).toBeCloseTo(350);
  });

  it('starts the whole grid below the controls when not one word fits beside them', () => {
    const open = cells(['subject', 'verb'], 300);
    const { at, height } = cells(['subject', 'verb'], 300, { w: 200, h: 17 });

    // Clear of the controls' 17 px, and half a gap more.
    expect(at('subject').center - open.at('subject').center).toBeCloseTo(17 + 8);
    expect(height).toBe(open.height + 17 + 8);
  });
});

describe('packPeriod', () => {
  const rect = (
    label: string,
    width: number,
    conjunct?: GroupRect['conjunct'],
    owner?: GroupRect['owner'],
    standard?: GroupRect['standard'],
  ): GroupRect => ({
    label,
    color: '',
    mainKey: label,
    nodeKeys: [label],
    conjunct,
    owner,
    standard,
    x: 0,
    y: 0,
    width,
    height: 100,
    center: { x: 0, y: 0 },
    rIn: 0,
    orbit: 0,
    rOut: 0,
  });

  it("packs a coordinated noun's conjuncts straight after it, a chip's gap apart", () => {
    const { positions } = packPeriod(
      [
        rect('Verb Phrase', 100),
        rect('subject+2', 100, { head: 'Subject', index: 1 }),
        rect('Subject', 100),
        rect('subject+1', 100, { head: 'Subject', index: 0 }),
      ],
      { w: 2000, h: 400 },
    );

    const order = Object.entries(positions)
      .sort(([, a], [, b]) => a.x - b.x)
      .map(([key]) => key);
    expect(order).toEqual(['Subject', 'subject+1', 'subject+2', 'Verb Phrase']);
    const px = (key: string) => (positions[key]!.x / 100) * 2000;
    expect(px('subject+1') - px('Subject')).toBeCloseTo(100 + CONJUNCT_GAP);
    expect(px('Verb Phrase') - px('subject+2')).toBeCloseTo(100 + 20);
  });

  // P09-E12 D5: "bigger and older than the dog" — the standard after the predicative's conjuncts.
  it('packs a standard of comparison after the predicate adjective and its conjuncts, its owner after it', () => {
    const { positions } = packPeriod(
      [
        rect('predicative/standard/possessor', 100, undefined, { head: 'Subject Complement', index: 1 }),
        rect('predicative/standard', 100, undefined, undefined, { head: 'Subject Complement', index: 0.5 }),
        rect('Subject Complement', 100),
        rect('predicative+1', 100, { head: 'Subject Complement', index: 0 }),
        rect('Subject', 100),
      ],
      { w: 2000, h: 400 },
    );

    const order = Object.entries(positions)
      .sort(([, a], [, b]) => a.x - b.x)
      .map(([key]) => key);
    expect(order).toEqual(['Subject', 'Subject Complement', 'predicative+1', 'predicative/standard', 'predicative/standard/possessor']);
    const px = (key: string) => (positions[key]!.x / 100) * 2000;
    expect(px('predicative/standard') - px('predicative+1')).toBeCloseTo(100 + CONJUNCT_GAP);
  });

  // P09-E50: each period noun's standard packs after its own noun.
  it('packs two standards, each after its own noun', () => {
    const { positions } = packPeriod(
      [
        rect('directObject/standard', 100, undefined, undefined, { head: 'Direct Object', index: -0.5 }),
        rect('subject/standard', 100, undefined, undefined, { head: 'Subject', index: -0.5 }),
        rect('Direct Object', 100),
        rect('Verb Phrase', 100),
        rect('Subject', 100),
      ],
      { w: 2000, h: 400 },
    );

    const order = Object.entries(positions)
      .sort(([, a], [, b]) => a.x - b.x)
      .map(([key]) => key);
    expect(order.indexOf('subject/standard')).toBe(order.indexOf('Subject') + 1);
    expect(order.indexOf('directObject/standard')).toBe(order.indexOf('Direct Object') + 1);
  });

  it('packs each owner straight after the ring it owns, and an owner’s owner after that', () => {
    const { positions } = packPeriod(
      [
        rect('Verb Phrase', 100),
        rect('subject+1', 100, { head: 'Subject', index: 0 }),
        rect('subject/possessor/possessor', 100, undefined, { head: 'Subject', index: -0.25 }),
        rect('subject+1/possessor', 100, undefined, { head: 'Subject', index: 0.5 }),
        rect('Subject', 100),
        rect('subject/possessor', 100, undefined, { head: 'Subject', index: -0.5 }),
      ],
      { w: 2000, h: 400 },
    );

    const order = Object.entries(positions)
      .sort(([, a], [, b]) => a.x - b.x)
      .map(([key]) => key);
    expect(order).toEqual([
      'Subject',
      'subject/possessor',
      'subject/possessor/possessor',
      'subject+1',
      'subject+1/possessor',
      'Verb Phrase',
    ]);
  });
});
