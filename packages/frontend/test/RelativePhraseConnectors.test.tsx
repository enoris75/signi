import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { RelConnector } from '../src/components/PhraseBuilder/measure.ts';
import {
  RelativePhraseConnectors,
} from '../src/components/PhraseBuilder/RelativePhraseConnectors.tsx';

const connector = (which: string, x1: number, y1: number, x2: number, y2: number, color: string) =>
  ({ which, x1, y1, x2, y2, color }) satisfies RelConnector;

const SUBJECT = connector('subject', 120, 80, 60, 410, '#2c4a6e');
const DIRECT_OBJECT = connector('directObject', 480, 95, 520, 560, '#3a6e3a');

function renderConnectors(connectors: RelConnector[]) {
  const { container } = render(<RelativePhraseConnectors connectors={connectors} />);
  return container;
}

const coords = (el: Element) =>
  ['x1', 'y1', 'x2', 'y2', 'stroke'].map((name) => el.getAttribute(name));

describe('RelativePhraseConnectors', () => {
  it('renders nothing when no noun has a relative clause', () => {
    expect(renderConnectors([])).toBeEmptyDOMElement();
  });

  it('draws one faint dashed line from each noun to its clause panel', () => {
    const svg = renderConnectors([SUBJECT, DIRECT_OBJECT]).querySelector('svg')!;

    const lines = [...svg.children];
    expect(lines.map((l) => l.tagName)).toEqual(['line', 'line']);
    expect(lines.map(coords)).toEqual([
      ['120', '80', '60', '410', '#2c4a6e'],
      ['480', '95', '520', '560', '#3a6e3a'],
    ]);
    lines.forEach((l) => {
      expect(l).toHaveAttribute('stroke-dasharray');
      expect(l).toHaveAttribute('stroke-opacity', '0.4');
    });
  });

  it('spans the whole builder, bleeding past it, without catching pointer events', () => {
    const svg = renderConnectors([SUBJECT]).querySelector('svg')!;
    const style = getComputedStyle(svg);

    expect(style.position).toBe('absolute');
    expect(style.width).toBe('100%');
    expect(style.height).toBe('100%');
    // The line bridges the gap to the docked panels, outside the root box.
    expect(style.overflow).toBe('visible');
    expect(style.pointerEvents).toBe('none');
  });
});
