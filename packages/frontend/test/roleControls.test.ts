import { describe, expect, it } from 'vitest';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';
import { quickControlsOf, roleControlsOf } from '../src/components/PhraseBuilder/roleControls.ts';

const icon = (key: string) => ({ key, label: key, icon: null, active: false, onToggle: () => {} }) as unknown as SatelliteIcon;
const keys = (icons: SatelliteIcon[]) => icons.map((i) => i.key);

describe('quickControlsOf', () => {
  it('offers a noun its number, adjective and determiner, whatever order its ring draws them in', () => {
    const ring = ['subjectGender', 'subjectDefiniteness', 'subjectRelative', 'subjectAdjective', 'subjectNumber'].map(icon);
    expect(keys(quickControlsOf(ring))).toEqual(['subjectNumber', 'subjectAdjective', 'subjectDefiniteness']);
  });

  it('offers a verb its tense, polarity and adverb', () => {
    const ring = ['verbNegative', 'verbTense', 'verbAspect', 'verbModal', 'modifier', 'directObject'].map(icon);
    expect(keys(quickControlsOf(ring))).toEqual(['verbTense', 'verbNegative', 'modifier']);
  });

  it('fills up from the ring\'s own order when a role has fewer of the usual ones', () => {
    const ring = ['interjectionA', 'interjectionB', 'subjectNumber', 'interjectionC'].map(icon);
    expect(keys(quickControlsOf(ring))).toEqual(['subjectNumber', 'interjectionA', 'interjectionB']);
    expect(keys(quickControlsOf(ring.slice(0, 1)))).toEqual(['interjectionA']);
  });
});

describe('roleControlsOf', () => {
  it('gathers the word\'s satellites, then the noun\'s perimeter, then — for the verb — its complements', () => {
    const byParent = { subject: [icon('subjectNumber')], verb: [icon('verbTense')] };
    const perimeter = { subject: { possessor: icon('subjectPossessor') } };
    const complements = [icon('locative')];
    expect(keys(roleControlsOf('subject', byParent, perimeter as never, complements))).toEqual(['subjectNumber', 'subjectPossessor']);
    expect(keys(roleControlsOf('verb', byParent, perimeter as never, complements))).toEqual(['verbTense', 'locative']);
  });
});
