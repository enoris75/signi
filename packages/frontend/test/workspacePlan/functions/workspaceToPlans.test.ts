import { describe, expect, it } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { workspaceToPlans } from '../../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import {
  BOY,
  CAT,
  conditional,
  coordinative,
  DOG,
  EAT,
  instrumental,
  KNIFE,
  period,
  relative,
  SEE,
  SLEEP,
  START,
} from '../fixtures.ts';

describe('workspaceToPlans', () => {
  it('is empty for an empty workspace', () => {
    expect(workspaceToPlans([], [])).toEqual([]);
  });

  it('translates each unlinked period as a sentence of its own, in workspace order', () => {
    const periods = [period('b', { subject: DOG, verb: SLEEP }), period('a', { subject: CAT, verb: EAT })];

    expect(workspaceToPlans(periods, [])).toEqual([
      { containerId: 'b', plan: selectionToPlan(periods[0].selection) },
      { containerId: 'a', plan: selectionToPlan(periods[1].selection) },
    ]);
  });

  it('folds every kind of linked period into its root, which alone becomes a sentence', () => {
    const periods = [
      period('main', { subject: BOY, verb: START }),
      period('rel', { verb: SEE, directObject: CAT }),
      period('tool', { subject: KNIFE }),
      period('if', { subject: DOG, verb: SLEEP }),
      period('and', { subject: CAT, verb: EAT }),
      period('other', { subject: DOG, verb: EAT }),
    ];
    const links = [
      relative('r', ['main', 'subject'], ['rel', 'subject']),
      instrumental('i', 'main', 'tool'),
      conditional('c', 'main', 'if'),
      coordinative('k', 'main', 'and', 'then'),
    ];

    const sentences = workspaceToPlans(periods, links);

    expect(sentences.map((s) => s.containerId)).toEqual(['main', 'other']);
    const { plan } = sentences[0];
    expect((plan.subject as NounPhrase).relative?.verbPhrase.verb).toBe('SEE');
    expect(plan.complements?.instrumental?.phrase).toMatchObject({ concept: 'KNIFE' });
    expect(plan.condition?.subject).toMatchObject({ concept: 'DOG' });
    expect(plan.coordination).toMatchObject({ conjunction: 'then', clause: { subject: { concept: 'CAT' } } });
  });

  it('translates nothing when every period is some link’s target', () => {
    const periods = [period('a', { subject: CAT, verb: EAT }), period('b', { subject: DOG, verb: SLEEP })];
    const links = [conditional('x', 'a', 'b'), conditional('y', 'b', 'a')];

    expect(workspaceToPlans(periods, links)).toEqual([]);
  });
});
