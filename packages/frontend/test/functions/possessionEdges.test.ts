import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import {
  ownerLink,
  ownerPortKey,
  pointerLink,
  type OwnerSpot,
  type PointerSpot,
  type RingAt,
} from '../../src/components/PhraseBuilder/ownerChain.ts';
import { perimeterControlKey } from '../../src/components/PhraseBuilder/ringSpecs.ts';
import type { Pt } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { possessionEdges } from '../../src/components/PhraseBuilder/functions/possessionEdges.ts';

const BOY: Concept = { id: 'BOY', role: 'noun', description: 'BOY', label: 'boy' };

const RINGS: Record<string, RingAt> = {
  subject: { center: { x: 100, y: 100 }, rIn: 30, rOut: 60 },
  directObject: { center: { x: 400, y: 100 }, rIn: 30, rOut: 60 },
  'subject/possessor': { center: { x: 150, y: 300 }, rIn: 25, rOut: 50 },
};
const ringOf = (key: string) => RINGS[key];
const colorOf = (role: string) => (role === 'subject' ? 'blue' : 'green');

const OWNER: OwnerSpot = {
  address: 'subject/possessor',
  possessed: 'subject',
  possessedKey: 'subject',
  role: 'subject',
  order: -0.5,
  named: true,
};
const POINTER: PointerSpot = {
  possessed: 'directObject',
  possessedKey: 'directObject',
  role: 'directObject',
  antecedent: 'subject',
  antecedentKey: 'subject',
};

const edges = (over: Partial<Parameters<typeof possessionEdges>[0]> = {}) =>
  possessionEdges({
    owners: [],
    pointers: [],
    ringOf,
    controlOn: () => undefined,
    colorOf,
    resolve: () => undefined,
    compact: false,
    ...over,
  });

describe('possessionEdges', () => {
  it('draws a solid line from a noun’s possessor control to its owner’s port', () => {
    const controls: Record<string, Pt> = {
      [perimeterControlKey('possessor', 'subject')]: { x: 110, y: 160 },
      [ownerPortKey(OWNER)]: { x: 140, y: 250 },
    };
    const result = edges({ owners: [OWNER], controlOn: (_key, control) => controls[control] });

    const link = ownerLink({
      owned: RINGS.subject,
      owner: RINGS['subject/possessor'],
      control: { x: 110, y: 160 },
      port: { x: 140, y: 250 },
      compact: false,
    })!;
    expect(result.edges).toEqual([
      { x1: link.from.x, y1: link.from.y, x2: link.to.x, y2: link.to.y, color: 'blue', dashed: false },
    ]);
    expect(result.pointerLines).toEqual([]);
  });

  it('finds a hosted ring’s possessor control under the key its own builder uses', () => {
    const seen: [string, string, string | undefined][] = [];
    edges({
      owners: [{ ...OWNER, possessedKey: 'subject+1' }],
      ringOf: (key) => RINGS[key === 'subject+1' ? 'subject' : key],
      controlOn: (key, control, hosted) => {
        seen.push([key, control, hosted]);
        return undefined;
      },
    });

    expect(seen).toContainEqual(['subject+1', 'possessor:subject+1', 'possessor:subject']);
  });

  it('draws a dashed, bowed line to the noun pointed to, carrying the pronoun it renders', () => {
    const result = edges({
      pointers: [POINTER],
      resolve: () => ({ concept: BOY, features: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }),
    });

    const link = pointerLink({ owned: RINGS.directObject, antecedent: RINGS.subject, control: undefined, compact: false })!;
    expect(result.pointerLines).toEqual([{ spot: POINTER, link, pronoun: 'his', color: 'green' }]);
    expect(result.edges).toEqual([
      { x1: link.from.x, y1: link.from.y, x2: link.to.x, y2: link.to.y, via: link.via, color: 'green', dashed: true },
    ]);
  });

  it('draws no line until both its rings are on the canvas', () => {
    const result = edges({
      owners: [{ ...OWNER, address: 'directObject/possessor', possessedKey: 'directObject' }],
      pointers: [{ ...POINTER, antecedentKey: undefined }],
    });

    expect(result).toEqual({ edges: [], pointerLines: [] });
  });
});
