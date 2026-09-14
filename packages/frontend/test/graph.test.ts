import { describe, expect, it } from 'vitest';
import { linkEdge } from '../src/components/PhraseBuilder/graph.ts';

describe('linkEdge', () => {
  it('draws a straight line between a link’s ends', () => {
    expect(linkEdge({ from: { x: 1, y: 2 }, to: { x: 3, y: 4 } }, 'blue', false)).toEqual({
      x1: 1,
      y1: 2,
      x2: 3,
      y2: 4,
      color: 'blue',
      dashed: false,
    });
  });

  it('bows a line through its link’s bend', () => {
    expect(linkEdge({ from: { x: 1, y: 2 }, to: { x: 3, y: 4 }, via: { x: 5, y: 6 } }, 'green', true)).toEqual({
      x1: 1,
      y1: 2,
      x2: 3,
      y2: 4,
      via: { x: 5, y: 6 },
      color: 'green',
      dashed: true,
    });
  });
});
