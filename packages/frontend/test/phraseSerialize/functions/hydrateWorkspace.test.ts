import { describe, expect, it } from 'vitest';
import type { SerializedLink, SerializedWorkspace } from '@signi/shared';
import { hydrateWorkspace } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/hydrateWorkspace.ts';
import { serializeWorkspace } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/serializeWorkspace.ts';
import type { PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { workspaceToPlans } from '../../../src/components/PhraseBuilder/workspacePlan/index.ts';
import { BOY, CAT, CATALOG, RICH, RICH_SAVED } from '../fixtures.ts';

const linksOf = (...links: SerializedLink[]) => hydrateWorkspace({ containers: [], links }, CATALOG).links;

// A saved workspace as a damaged file may hold it, past what the types promise.
const damaged = (workspace: Record<string, unknown>) => workspace as unknown as SerializedWorkspace;

describe('hydrateWorkspace', () => {
  it('restores each period’s selection under its id, in order', () => {
    expect(
      hydrateWorkspace(
        {
          containers: [
            { id: 'b', selection: RICH_SAVED },
            { id: 'a', selection: { subject: 'CAT' } },
          ],
          links: [],
        },
        CATALOG,
      ),
    ).toEqual({
      containers: [
        { id: 'b', selection: RICH },
        { id: 'a', selection: { subject: CAT } },
      ],
      links: [],
      missing: [],
    });
  });

  it('reports each concept missing from the catalog once, across every period', () => {
    const { missing } = hydrateWorkspace(
      {
        containers: [
          { id: 'a', selection: { subject: 'GHOST', verb: 'HAUNT' } },
          { id: 'b', selection: { subject: 'BOY', directObject: 'GHOST' } },
        ],
        links: [],
      },
      [BOY],
    );

    expect(missing).toEqual(['GHOST', 'HAUNT']);
  });

  it('restores a relative link with its noun addresses', () => {
    expect(
      linksOf({ id: 'r', source: { containerId: 'a', nounKey: 'subject/conjunct/0' }, target: { containerId: 'b', nounKey: 'locative' } }),
    ).toStrictEqual([
      { id: 'r', source: { containerId: 'a', nounKey: 'subject/conjunct/0' }, target: { containerId: 'b', nounKey: 'locative' } },
    ]);
  });

  it('reads a link saved as explicitly relative like one saved with no kind', () => {
    expect(
      linksOf({ id: 'r', kind: 'relative', source: { containerId: 'a', nounKey: 'subject' }, target: { containerId: 'b', nounKey: 'subject' } }),
    ).toStrictEqual([{ id: 'r', source: { containerId: 'a', nounKey: 'subject' }, target: { containerId: 'b', nounKey: 'subject' } }]);
  });

  it('renames a legacy indirect-object endpoint', () => {
    expect(
      linksOf({ id: 'r', source: { containerId: 'a', nounKey: 'indirectObject/possessor' }, target: { containerId: 'b', nounKey: 'indirectObject' } }),
    ).toStrictEqual([
      { id: 'r', source: { containerId: 'a', nounKey: 'terminus/possessor' }, target: { containerId: 'b', nounKey: 'terminus' } },
    ]);
  });

  it('points a relative endpoint saved with no address at the subject', () => {
    expect(linksOf({ id: 'r', source: { containerId: 'a' }, target: { containerId: 'b' } })).toStrictEqual([
      { id: 'r', source: { containerId: 'a', nounKey: 'subject' }, target: { containerId: 'b', nounKey: 'subject' } },
    ]);
  });

  it('restores a condition without any noun address saved on it', () => {
    expect(
      linksOf({ id: 'c', kind: 'conditional', source: { containerId: 'a', nounKey: 'subject' }, target: { containerId: 'b' } }),
    ).toStrictEqual([{ id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } }]);
  });

  it('restores a coordination with its conjunction, "and" when none was saved', () => {
    expect(
      linksOf(
        { id: 'k', kind: 'coordinative', conjunction: 'but', source: { containerId: 'a' }, target: { containerId: 'b' } },
        { id: 'l', kind: 'coordinative', source: { containerId: 'b' }, target: { containerId: 'c' } },
      ).map((l) => l.kind === 'coordinative' && l.conjunction),
    ).toEqual(['but', 'and']);
  });

  it('restores an instrument with its level, the object when none was saved', () => {
    expect(
      linksOf(
        { id: 'i', kind: 'instrumental', level: 'concept', source: { containerId: 'a', nounKey: 'subject' }, target: { containerId: 'b' } },
        { id: 'j', kind: 'instrumental', source: { containerId: 'a' }, target: { containerId: 'c' } },
      ),
    ).toStrictEqual([
      { id: 'i', kind: 'instrumental', level: 'concept', source: { containerId: 'a' }, target: { containerId: 'b' } },
      { id: 'j', kind: 'instrumental', level: 'object', source: { containerId: 'a' }, target: { containerId: 'c' } },
    ]);
  });

  it('loads a period saved with no selection as an empty one', () => {
    expect(
      hydrateWorkspace(damaged({ containers: [{ id: 'a' }, { id: 'b', selection: 'CAT' }], links: [] }), CATALOG).containers,
    ).toEqual([
      { id: 'a', selection: {} },
      { id: 'b', selection: {} },
    ]);
  });

  it('drops a period that is no object or has no id', () => {
    const containers = [null, 'a', { selection: { subject: 'CAT' } }, { id: 3, selection: {} }, { id: 'b', selection: { subject: 'CAT' } }];

    expect(hydrateWorkspace(damaged({ containers, links: [] }), CATALOG).containers).toEqual([
      { id: 'b', selection: { subject: CAT } },
    ]);
  });

  it('loads a workspace whose periods or links are no list as having none', () => {
    expect(hydrateWorkspace(damaged({ containers: {}, links: 'r' }), CATALOG)).toEqual({ containers: [], links: [], missing: [] });
    expect(hydrateWorkspace(damaged({ containers: [] }), CATALOG).links).toEqual([]);
  });

  it('drops a link without an id and both endpoints, keeping the rest', () => {
    const links = [
      null,
      { id: 'x', kind: 'conditional', source: { containerId: 'a' } },
      { id: 'y', source: 'a', target: { containerId: 'b' } },
      { id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } },
    ];

    expect(hydrateWorkspace(damaged({ containers: [], links }), CATALOG).links).toStrictEqual([
      { id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } },
    ]);
  });

  it('points a relative endpoint whose address is no string at the subject', () => {
    const link = { id: 'r', source: { containerId: 'a', nounKey: 7 }, target: { containerId: 'b', nounKey: ['subject'] } };

    expect(hydrateWorkspace(damaged({ containers: [], links: [link] }), CATALOG).links).toStrictEqual([
      { id: 'r', source: { containerId: 'a', nounKey: 'subject' }, target: { containerId: 'b', nounKey: 'subject' } },
    ]);
  });

  it('falls back on "and" and the object for a conjunction or level it does not know', () => {
    const links = [
      { id: 'k', kind: 'coordinative', conjunction: 'nor', source: { containerId: 'a' }, target: { containerId: 'b' } },
      { id: 'i', kind: 'instrumental', level: 42, source: { containerId: 'a' }, target: { containerId: 'c' } },
    ];

    expect(hydrateWorkspace(damaged({ containers: [], links }), CATALOG).links).toMatchObject([
      { kind: 'coordinative', conjunction: 'and' },
      { kind: 'instrumental', level: 'object' },
    ]);
  });

  it('loads a damaged workspace into one the builder can plan', () => {
    const { containers, links } = hydrateWorkspace(
      damaged({
        containers: [
          { id: 'a', selection: { subject: 'CAT', subjectConjuncts: 'DOG', directObjectPossessor: 'BOY', modifierAdjectives: ['BIG'] } },
          { id: 'b' },
        ],
        links: [{ id: 'r', source: { containerId: 'a', nounKey: 1 }, target: { containerId: 'b', nounKey: null } }, { id: 'x' }],
      }),
      CATALOG,
    );

    expect(workspaceToPlans(containers, links)).toEqual([
      { containerId: 'a', plan: expect.objectContaining({ subject: expect.objectContaining({ concept: 'CAT' }) }) },
    ]);
  });

  it('round-trips a saved workspace', () => {
    const containers = [
      { id: 'a', selection: RICH },
      { id: 'b', selection: { subject: CAT } },
    ];
    const links: PhraseLink[] = [
      { id: 'r', source: { containerId: 'a', nounKey: 'directObject' }, target: { containerId: 'b', nounKey: 'subject' } },
      { id: 'c', kind: 'conditional', source: { containerId: 'a' }, target: { containerId: 'b' } },
      { id: 'k', kind: 'coordinative', conjunction: 'or', source: { containerId: 'a' }, target: { containerId: 'b' } },
      { id: 'i', kind: 'instrumental', level: 'process', source: { containerId: 'a' }, target: { containerId: 'b' } },
    ];

    expect(hydrateWorkspace(serializeWorkspace(containers, links), CATALOG)).toEqual({ containers, links, missing: [] });
  });
});
