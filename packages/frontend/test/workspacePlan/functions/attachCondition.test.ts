import { describe, expect, it } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { attachCondition } from '../../../src/components/PhraseBuilder/workspacePlan/functions/attachCondition.ts';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import type { PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { byId, CAT, conditional, DOG, EAT, period, relative, SEE, SLEEP } from '../fixtures.ts';

const MAIN = period('main', { subject: CAT, verb: SLEEP });
const IF = period('if', { subject: DOG, verb: EAT, directObject: CAT });
const SEES = period('sees', { verb: SEE });

const attach = (links: PhraseLink[], seen = new Set(['main'])) => {
  const plan = selectionToPlan(MAIN.selection);
  attachCondition(plan, MAIN, links, byId(MAIN, IF, SEES), seen);
  return plan;
};

describe('attachCondition', () => {
  it('hangs the IF period’s plan on the main clause', () => {
    expect(attach([conditional('c', 'main', 'if')]).condition).toEqual(selectionToPlan(IF.selection));
  });

  it.each<[string, PhraseLink[]]>([
    ['no link at all', []],
    ['only a condition of another period', [conditional('c', 'sees', 'if')]],
    ['only a relative clause', [relative('r', ['main', 'subject'], ['if', 'subject'])]],
    ['a condition on a period that is gone', [conditional('c', 'main', 'gone')]],
  ])('attaches nothing with %s', (_, links) => {
    expect(attach(links)).not.toHaveProperty('condition');
  });

  it('attaches nothing when the IF period is already on the path', () => {
    expect(attach([conditional('c', 'main', 'if')], new Set(['main', 'if']))).not.toHaveProperty('condition');
  });

  it('folds the IF clause’s own relative clauses in', () => {
    const plan = attach([conditional('c', 'main', 'if'), relative('r', ['if', 'directObject'], ['sees', 'subject'])]);

    expect(((plan.condition as PhrasePlan).directObject as NounPhrase).relative?.verbPhrase.verb).toBe('SEE');
  });

  it('gives the IF clause no condition of its own', () => {
    const plan = attach([conditional('c', 'main', 'if'), conditional('d', 'if', 'sees')]);

    expect(plan.condition).not.toHaveProperty('condition');
  });
});
