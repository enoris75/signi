import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { Edge } from '../src/components/PhraseBuilder/graph.ts';
import { ConnectorsLayer } from '../src/components/PhraseBuilder/ConnectorsLayer.tsx';

const edge = (x1: number, y1: number, x2: number, y2: number, color: string): Edge => ({
  x1,
  y1,
  x2,
  y2,
  color,
  dashed: false,
});

function renderLayer({ groupEdges = [] as Edge[], edges = [] as Edge[] } = {}) {
  const { container } = render(
    <ConnectorsLayer svgSize={{ w: 800, h: 340 }} groupEdges={groupEdges} edges={edges} />,
  );
  return container.querySelector('svg')!;
}

const coords = (el: Element, ...names: string[]) => names.map((n) => el.getAttribute(n));

describe('ConnectorsLayer', () => {
  it('spans the measured canvas', () => {
    const svg = renderLayer();

    expect(svg).toHaveAttribute('viewBox', '0 0 800 340');
    expect(svg).toBeEmptyDOMElement();
  });

  it('never intercepts pointer events meant for the boxes above it', () => {
    const svg = renderLayer();

    expect(getComputedStyle(svg).pointerEvents).toBe('none');
  });

  it('draws each group link as a solid line between the ports on the two dotted rings', () => {
    const svg = renderLayer({
      groupEdges: [edge(10, 20, 110, 30, '#2c4a6e'), edge(120, 40, 150, 90, '#8b3e2a')],
    });

    const links = [...svg.querySelectorAll(':scope > g[data-link="group"]')];
    const lines = links.map((g) => g.querySelector('line')!);
    expect(lines.map((l) => coords(l, 'x1', 'y1', 'x2', 'y2', 'stroke'))).toEqual([
      ['10', '20', '110', '30', '#2c4a6e'],
      ['120', '40', '150', '90', '#8b3e2a'],
    ]);
    lines.forEach((l) => expect(l).not.toHaveAttribute('stroke-dasharray'));
    expect([...links[0].querySelectorAll('circle')].map((c) => coords(c, 'cx', 'cy', 'fill'))).toEqual([
      ['10', '20', '#2c4a6e'],
      ['110', '30', '#2c4a6e'],
    ]);
  });

  it('draws each satellite link as a dashed line with a dot on the satellite end', () => {
    const svg = renderLayer({ edges: [edge(50, 60, 90, 120, '#3a6e3a')] });

    const link = svg.querySelector(':scope > g[data-link="satellite"]')!;
    const line = link.querySelector('line')!;
    const dot = link.querySelector('circle')!;
    expect(coords(line, 'x1', 'y1', 'x2', 'y2', 'stroke')).toEqual(
      ['50', '60', '90', '120', '#3a6e3a'],
    );
    expect(line).toHaveAttribute('stroke-dasharray');
    expect(coords(dot, 'cx', 'cy', 'fill')).toEqual(['90', '120', '#3a6e3a']);
  });

  it('paints group links beneath satellite links', () => {
    const svg = renderLayer({
      groupEdges: [edge(0, 0, 1, 1, '#000')],
      edges: [edge(0, 0, 1, 1, '#000'), edge(1, 1, 2, 2, '#000')],
    });

    expect([...svg.children].map((c) => c.getAttribute('data-link'))).toEqual([
      'group',
      'satellite',
      'satellite',
    ]);
  });
});
