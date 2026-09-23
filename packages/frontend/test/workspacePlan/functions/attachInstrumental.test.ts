import { describe, expect, it } from 'vitest';
import type { AbstractionLevel, NounPhrase, PhrasePlan } from '@signi/shared';
import { attachInstrumental } from '../../../src/components/PhraseBuilder/workspacePlan/functions/attachInstrumental.ts';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import type { PhraseContainer, PhraseLink, PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BOY, byId, CHOOSE, conditional, HOUSE, instrumental, KNIFE, period, relative, SEE, START, WORD } from '../fixtures.ts';

const MAIN = period('main', { subject: BOY, verb: START, locative: HOUSE });

const attach = (links: PhraseLink[], instrument: PhraseSelection, seen = new Set(['main'])) => {
  const periods: PhraseContainer[] = [MAIN, period('tool', instrument), period('sees', { verb: SEE })];
  const plan = selectionToPlan(MAIN.selection);
  attachInstrumental(plan, MAIN, links, byId(...periods), seen);
  return plan;
};

const noInstrument = (plan: Partial<PhrasePlan>) => expect(plan).toEqual(selectionToPlan(MAIN.selection));

describe('attachInstrumental', () => {
  it('takes a bare noun period’s subject as the instrument, by default', () => {
    const plan = attach([instrumental('i', 'main', 'tool')], { subject: KNIFE });

    expect(plan.complements?.instrumental).toEqual({ phrase: expect.objectContaining({ concept: 'KNIFE' }) });
  });

  // The privative (P09-E2): a denied instrument is the "without", at any level.
  it('denies the instrument when its link is negative, and only then', () => {
    const denied: PhraseLink = { ...instrumental('i', 'main', 'tool'), negative: true } as PhraseLink;
    expect(attach([denied], { subject: KNIFE }).complements?.instrumental).toEqual({
      phrase: expect.objectContaining({ concept: 'KNIFE' }),
      negative: true,
    });
    const act: PhraseLink = { ...instrumental('i', 'main', 'tool', 'process'), negative: true } as PhraseLink;
    expect(attach([act], { verb: CHOOSE, directObject: WORD }).complements?.instrumental).toMatchObject({ negative: true });
    expect(attach([instrumental('i', 'main', 'tool')], { subject: KNIFE }).complements?.instrumental).not.toHaveProperty('negative');
  });

  it('keeps the clause’s other complements', () => {
    const plan = attach([instrumental('i', 'main', 'tool', 'object')], { subject: KNIFE });

    expect(Object.keys(plan.complements!).sort()).toEqual(['instrumental', 'locative']);
  });

  it('attaches nothing at the object level when the period has no subject yet', () => {
    noInstrument(attach([instrumental('i', 'main', 'tool', 'object')], { verb: CHOOSE, directObject: WORD }));
  });

  it.each<AbstractionLevel>(['process', 'concept'])('at the %s level, turns the period’s act into the instrument', (level) => {
    const plan = attach([instrumental('i', 'main', 'tool', level)], { verb: CHOOSE, directObject: WORD });

    expect(plan.complements?.instrumental).toEqual({
      phrase: expect.objectContaining({ concept: 'WORD' }),
      action: expect.objectContaining({ verb: 'CHOOSE' }),
      specifiers: [{ kind: 'abstraction', value: level }],
    });
  });

  it.each<[string, PhraseSelection]>([
    ['no verb', { directObject: WORD }],
    ['no object', { verb: CHOOSE }],
    ['only a subject', { subject: KNIFE }],
  ])('attaches nothing at an action level when the period has %s', (_, instrument) => {
    noInstrument(attach([instrumental('i', 'main', 'tool', 'process')], instrument));
  });

  it.each<[string, PhraseLink[]]>([
    ['no link at all', []],
    ['only an instrument of another period', [instrumental('i', 'sees', 'tool')]],
    ['only a condition', [conditional('c', 'main', 'tool')]],
    ['an instrument in a period that is gone', [instrumental('i', 'main', 'gone')]],
  ])('attaches nothing with %s', (_, links) => {
    noInstrument(attach(links, { subject: KNIFE }));
  });

  it('attaches nothing when the instrument period is already on the path', () => {
    noInstrument(attach([instrumental('i', 'main', 'tool')], { subject: KNIFE }, new Set(['main', 'tool'])));
  });

  it('keeps the instrument’s own relative clauses', () => {
    const plan = attach(
      [instrumental('i', 'main', 'tool'), relative('r', ['tool', 'subject'], ['sees', 'directObject'])],
      { subject: WORD },
    );

    expect((plan.complements?.instrumental?.phrase as NounPhrase).relative?.verbPhrase.verb).toBe('SEE');
  });
});
