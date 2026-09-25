import { describe, expect, test } from 'vitest';
import { complement, complements, concept, np } from '../languages/resolved.fixtures.js';
import { complementsAroundAdverb } from './complementsAroundAdverb.js';

// A stand-in for a language's `complementsPhrase`: it names the complements it was handed, in the
// order it was handed them, so the tests read the split rather than any one language's prepositions.
const render = (c?: Parameters<typeof complementsAroundAdverb>[2]) =>
  Object.keys(c ?? {}).map((type) => `<${type}>`).join(' ');

const all = complements({
  predicative: complement(np({ base: 'tired' })),
  terminus: complement(np({ base: 'dog' })),
  locative: complement(np({ base: 'house' })),
  cause: complement(np({ base: 'rain' })),
});

const up = concept({ base: 'up', subtype: 'direction' });
const everywhere = concept({ base: 'everywhere', subtype: 'place' });
const fast = concept({ base: 'fast', subtype: 'manner' });

describe('complementsAroundAdverb', () => {
  test('a direction adverb leads the whole slot (A156)', () => {
    expect(complementsAroundAdverb(up, 'up', all, render)).toBe('up <predicative> <terminus> <locative> <cause>');
    expect(complementsAroundAdverb(up, 'up', undefined, render)).toBe('up');
  });

  test('a place adverb stands where the locative stands (A189)', () => {
    expect(complementsAroundAdverb(everywhere, 'everywhere', all, render))
      .toBe('<predicative> <terminus> everywhere <locative> <cause>');
  });

  test('a place adverb with nothing after it, and with nothing before it', () => {
    const before = complements({ predicative: complement(np({ base: 'tired' })) });
    expect(complementsAroundAdverb(everywhere, 'everywhere', before, render)).toBe('<predicative> everywhere');
    const after = complements({ cause: complement(np({ base: 'rain' })) });
    expect(complementsAroundAdverb(everywhere, 'everywhere', after, render)).toBe('everywhere <cause>');
    expect(complementsAroundAdverb(everywhere, 'everywhere', undefined, render)).toBe('everywhere');
  });

  test('any other adverb, or one already spelled elsewhere, leaves the complements alone', () => {
    expect(complementsAroundAdverb(fast, 'fast', all, render)).toBe('<predicative> <terminus> <locative> <cause>');
    expect(complementsAroundAdverb(undefined, '', all, render)).toBe('<predicative> <terminus> <locative> <cause>');
    // An empty text is how English says the particle has moved in front of the object (A193).
    expect(complementsAroundAdverb(up, '', all, render)).toBe('<predicative> <terminus> <locative> <cause>');
  });

  test('more direction and place adverbs join the primary\'s seat, whatever the primary is (P15)', () => {
    expect(complementsAroundAdverb(up, 'up', all, render, { place: 'here' }))
      .toBe('up <predicative> <terminus> here <locative> <cause>');
    expect(complementsAroundAdverb(everywhere, 'everywhere', all, render, { place: 'here', direction: 'down' }))
      .toBe('down <predicative> <terminus> everywhere here <locative> <cause>');
    expect(complementsAroundAdverb(fast, 'fast', all, render, { direction: 'up' }))
      .toBe('up <predicative> <terminus> <locative> <cause>');
    expect(complementsAroundAdverb(undefined, '', undefined, render, { place: 'here' })).toBe('here');
  });
});
