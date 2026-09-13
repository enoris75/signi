import { describe, expect, it } from 'vitest';
import { computeCompactLayout } from '../src/components/PhraseBuilder/layout.ts';

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
