// Shared fixtures for the satellite tests: hand-built concepts, a UI-string lookup that echoes its
// key, and shorthands over buildSatellites.
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { COMPLEMENT_TYPES, type Concept, type LanguageCode, type UiStringKey } from '@signi/shared';
import { buildSatellites } from '../../src/components/PhraseBuilder/satellites/functions/buildSatellites.ts';
import type { Satellite } from '../../src/components/PhraseBuilder/satellites/satellites.types.tsx';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';

export const concept = (id: string, role: Concept['role'], extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: `the ${id.toLowerCase()}`,
  label: id.toLowerCase(),
  ...extra,
});

export const CAT = concept('CAT', 'noun');
export const FRIEND = concept('FRIEND', 'noun', { gendered: true });
export const HOUSE = concept('HOUSE', 'noun', { labels: { en: 'house', it: 'casa' } });
export const SPEED = concept('SPEED', 'noun', { mannerRelation: 'measure' });
export const CARE = concept('CARE', 'noun', { mannerRelation: 'means' });
export const BIG = concept('BIG', 'adjective', { labels: { en: 'big', it: 'grande' } });
export const RED = concept('RED', 'adjective');
export const HAPPY = concept('HAPPY', 'adjective');
export const I = concept('I', 'pronoun', { person: '1' });
export const SHE = concept('SHE', 'pronoun', { person: '3' });
export const SEE = concept('SEE', 'verb', { transitivity: 'transitive' });
export const DO = concept('DO', 'verb');
export const SLEEP = concept('SLEEP', 'verb', { transitivity: 'intransitive' });
// Licenses every complement, so each one's controls can be exercised.
export const GO = concept('GO', 'verb', { transitivity: 'intransitive', complements: COMPLEMENT_TYPES });
export const WANT = concept('WANT', 'verb', { modal: true });
export const CAN = concept('CAN', 'verb', { modal: true });
export const OFTEN = concept('OFTEN', 'adverb', { labels: { en: 'often', it: 'spesso' } });

// Every UI string reads as its own key, so a test sees which string a satellite asked for.
export const t = (key: UiStringKey) => `t(${key})`;

export function build(
  selection: PhraseSelection,
  revealed: Record<string, boolean> = {},
  language: LanguageCode = 'en',
) {
  return buildSatellites(selection, revealed, language, t);
}

export function satellite(
  selection: PhraseSelection,
  key: string,
  revealed: Record<string, boolean> = {},
): Satellite {
  const found = build(selection, revealed).satellites.find((s) => s.key === key);
  if (!found) throw new Error(`no satellite ${key}`);
  return found;
}

// The MUI glyph an icon draws, by its test id ("MaleIcon", "BrushIcon", …).
export function glyph(icon: ReactNode): string | null {
  const { container } = render(<>{icon}</>);
  return container.querySelector('svg')!.getAttribute('data-testid');
}
