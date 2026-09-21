import { describe, expect, it } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { attachLinks } from '../../../src/components/PhraseBuilder/workspacePlan/functions/attachLinks.ts';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import { BOY, byId, CAT, conditional, DOG, EAT, HOUSE, period, relative, SEE, SLEEP } from '../fixtures.ts';

const MAIN = period('main', { subject: CAT, verb: SEE, directObject: DOG, directObjectPossessor: { subject: BOY } });
const SLEEPS = period('sleeps', { verb: SLEEP });
const EATS = period('eats', { subject: BOY, verb: EAT });
const NO_VERB = period('noVerb', { subject: BOY });

const attach = (links: Parameters<typeof attachLinks>[2], seen = new Set(['main'])) => {
  const plan = selectionToPlan(MAIN.selection);
  attachLinks(plan, MAIN, links, byId(MAIN, SLEEPS, EATS, NO_VERB), seen);
  return plan;
};

const noun = (plan: Partial<PhrasePlan>, key: 'subject' | 'directObject') => plan[key] as NounPhrase;

describe('attachLinks', () => {
  it('hangs a linked period on its source noun as a relative clause', () => {
    const plan = attach([relative('l', ['main', 'subject'], ['sleeps', 'subject'])]);

    expect(noun(plan, 'subject').relative).toMatchObject({ headRole: 'subject', verbPhrase: { verb: 'SLEEP' } });
    expect(noun(plan, 'directObject').relative).toBeUndefined();
  });

  it('hangs each link on its own noun', () => {
    const plan = attach([
      relative('a', ['main', 'subject'], ['sleeps', 'subject']),
      relative('b', ['main', 'directObject'], ['eats', 'directObject']),
    ]);

    expect(noun(plan, 'subject').relative?.verbPhrase.verb).toBe('SLEEP');
    expect(noun(plan, 'directObject').relative).toMatchObject({ headRole: 'directObject', verbPhrase: { verb: 'EAT' } });
  });

  it('hangs a relative clause on a possessor', () => {
    const plan = attach([relative('l', ['main', 'directObject/possessor'], ['sleeps', 'subject'])]);

    expect((noun(plan, 'directObject').possessor as NounPhrase).relative?.verbPhrase.verb).toBe('SLEEP');
    expect(noun(plan, 'directObject').relative).toBeUndefined();
  });

  it.each([
    ['sourced from another period', relative('l', ['eats', 'subject'], ['sleeps', 'subject'])],
    ['that is not a relative clause', conditional('l', 'main', 'sleeps')],
    ['to a period that is gone', relative('l', ['main', 'subject'], ['gone', 'subject'])],
    ['from a noun the plan does not hold', relative('l', ['main', 'locative'], ['sleeps', 'subject'])],
    ['to a period with no verb yet', relative('l', ['main', 'subject'], ['noVerb', 'directObject'])],
  ])('ignores a link %s', (_, link) => {
    expect(attach([link])).toEqual(selectionToPlan(MAIN.selection));
  });

  it('stops at a period already on the path, so a cycle ends', () => {
    const plan = attach([relative('l', ['main', 'subject'], ['sleeps', 'subject'])], new Set(['main', 'sleeps']));

    expect(noun(plan, 'subject').relative).toBeUndefined();
  });

  it('folds the linked period’s own relative clauses in', () => {
    // The cat that the boy who sees the house eats.
    const seesHouse = period('house', { verb: SEE, directObject: HOUSE });
    const plan = selectionToPlan(MAIN.selection);
    attachLinks(
      plan,
      MAIN,
      [
        relative('a', ['main', 'subject'], ['eats', 'directObject']),
        relative('b', ['eats', 'subject'], ['house', 'subject']),
      ],
      byId(MAIN, EATS, seesHouse),
      new Set(['main']),
    );

    const clause = noun(plan, 'subject').relative;
    expect(clause).toMatchObject({ headRole: 'directObject', verbPhrase: { verb: 'EAT' }, subject: { concept: 'BOY' } });
    expect((clause?.subject as NounPhrase).relative).toMatchObject({ headRole: 'subject', verbPhrase: { verb: 'SEE' } });
  });
});
