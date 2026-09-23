import { describe, expect, it } from 'vitest';
import { serializeWorkspace } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/serializeWorkspace.ts';
import type { PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { CAT, DOG, RICH, RICH_SAVED } from '../fixtures.ts';

describe('serializeWorkspace', () => {
  it('saves each period’s selection under its id, in order', () => {
    expect(
      serializeWorkspace(
        [
          { id: 'b', selection: RICH },
          { id: 'a', selection: { subject: CAT } },
        ],
        [],
      ),
    ).toEqual({
      containers: [
        { id: 'b', selection: RICH_SAVED },
        { id: 'a', selection: { subject: 'CAT' } },
      ],
      links: [],
    });
  });

  it('saves a relative link with its noun addresses and no kind', () => {
    const link: PhraseLink = {
      id: 'r',
      source: { containerId: 'a', nounKey: 'directObject/possessor' },
      target: { containerId: 'b', nounKey: 'subject' },
    };

    const [saved] = serializeWorkspace([], [link]).links;

    expect(saved).toEqual(link);
    expect(saved.kind).toBeUndefined();
    expect(saved).not.toHaveProperty('conjunction');
    expect(saved).not.toHaveProperty('level');
  });

  it('saves a condition with its kind alone', () => {
    const link: PhraseLink = { id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } };

    expect(serializeWorkspace([], [link]).links).toStrictEqual([
      { id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } },
    ]);
  });

  it('saves a coordination with its conjunction', () => {
    const link: PhraseLink = {
      id: 'k',
      kind: 'coordinative',
      conjunction: 'therefore',
      source: { containerId: 'a' },
      target: { containerId: 'b' },
    };

    expect(serializeWorkspace([], [link]).links).toStrictEqual([link]);
  });

  it('saves an instrument with its level, even an unset one', () => {
    const links: PhraseLink[] = [
      { id: 'i', kind: 'instrumental', level: 'process', source: { containerId: 'a' }, target: { containerId: 'b' } },
      { id: 'j', kind: 'instrumental', source: { containerId: 'a' }, target: { containerId: 'c' } },
    ];

    const saved = serializeWorkspace([], links).links;

    expect(saved[0].level).toBe('process');
    expect(saved[1]).toHaveProperty('level', undefined);
  });

  it('saves a denied instrument as such, and a plain one with no flag at all (P09-E2)', () => {
    const links: PhraseLink[] = [
      { id: 'i', kind: 'instrumental', level: 'object', negative: true, source: { containerId: 'a' }, target: { containerId: 'b' } },
      { id: 'j', kind: 'instrumental', level: 'object', source: { containerId: 'a' }, target: { containerId: 'c' } },
    ];

    const saved = serializeWorkspace([], links).links;

    expect(saved[0]).toHaveProperty('negative', true);
    expect(saved[1]).not.toHaveProperty('negative');
  });

  it('copies each link’s endpoints rather than sharing them', () => {
    const link: PhraseLink = { id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } };

    const [saved] = serializeWorkspace([{ id: 'a', selection: { subject: DOG } }], [link]).links;

    expect(saved.source).not.toBe(link.source);
    expect(saved.target).not.toBe(link.target);
  });
});
