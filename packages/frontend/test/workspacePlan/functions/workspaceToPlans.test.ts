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
  NEED,
  period,
  relative,
  SAY,
  SEE,
  SLEEP,
  START,
  subordinate,
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

  // P09-E12 D9: one plan field per link kind, the fields the engine's clause tests pin.
  it('folds a that-clause into the object slot, where it takes the object’s place', () => {
    const periods = [
      period('main', { subject: BOY, verb: SAY, directObject: DOG }),
      period('that', { subject: CAT, verb: EAT }),
    ];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'content', 'main', 'that')]);

    expect(plan.contentObject).toMatchObject({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT' } });
    expect(plan.directObject).toBeUndefined();
  });

  it('folds an adverbial clause in with its conjunction', () => {
    const periods = [period('main', { subject: BOY, verb: SLEEP }), period('when', { subject: CAT, verb: EAT })];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'adverbial', 'main', 'when', 'because')]);

    expect(plan.adverbialClause).toMatchObject({ conjunction: 'because', clause: { subject: { concept: 'CAT' } } });
  });

  it('folds an infinitive complement in without its subject, read in the infinitive whatever it holds', () => {
    const periods = [period('main', { subject: CAT, verb: NEED }), period('to', { subject: DOG, verb: SLEEP })];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'infinitive', 'main', 'to')]);

    expect(plan.infinitiveComplement).toEqual({ verbPhrase: selectionToPlan({ verb: SLEEP, infinitive: true }).verbPhrase });
  });

  it('folds in no subordinate clause until its period has a verb', () => {
    const periods = [period('main', { subject: BOY, verb: SLEEP }), period('when', { subject: CAT })];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'adverbial', 'main', 'when')]);

    expect(plan.adverbialClause).toBeUndefined();
  });

  it('translates nothing when every period is some link’s target', () => {
    const periods = [period('a', { subject: CAT, verb: EAT }), period('b', { subject: DOG, verb: SLEEP })];
    const links = [conditional('x', 'a', 'b'), conditional('y', 'b', 'a')];

    expect(workspaceToPlans(periods, links)).toEqual([]);
  });
});
