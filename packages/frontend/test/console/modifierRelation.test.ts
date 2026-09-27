import { describe, expect, it } from 'vitest';
import { sameWorkspace } from '../../src/console/language/normalize.ts';
import { ok, print, sel } from './helpers.ts';

// The console's relation for a noun modifier (P14-E3, P16-E3): unset is the pair's own — the relation
// the word takes under this head, else its own, else `feature` — and it is what the printer leaves out.
describe('a noun modifier’s relation in the console', () => {
  it('reads a bare modifier as the word’s own relation, and prints it bare', () => {
    const s = ok('/subj ( book /adj ( time ) )');
    expect(sel(s).modifierRelations).toBeUndefined();
    expect(print(s)).toBe('/subj ( book /adj time )');
  });

  it('keeps an explicit feature on a word whose own relation is another', () => {
    const s = ok('/subj ( book /adj ( time /feature ) )');
    expect(sel(s).modifierRelations).toEqual({ subjectAdjective: 'feature' });
    expect(print(s)).toBe('/subj ( book /adj ( time /feature ) )');
  });

  it('prints the word’s own relation as unset, so it applies back to the same thing', () => {
    const s = ok('/subj ( book /adj ( time /domain ) )');
    expect(print(s)).toBe('/subj ( book /adj time )');
    expect(sameWorkspace(s, ok('/subj ( book /adj ( time ) )'))).toBe(true);
  });

  it('reads it against the head: under a bomb time is the feature, which prints as unset', () => {
    expect(print(ok('/subj ( bomb /adj ( time /feature ) )'))).toBe('/subj ( bomb /adj time )');
    expect(print(ok('/subj ( bomb /adj ( time /domain ) )'))).toBe('/subj ( bomb /adj ( time /domain ) )');
  });

  it('leaves a word with no relation of its own at feature', () => {
    expect(print(ok('/subj ( book /adj ( sail /feature ) )'))).toBe('/subj ( book /adj sail )');
  });
});
