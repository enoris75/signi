import { describe, expect, it } from 'vitest';
import { COMPLEMENT_TYPES } from '@signi/shared';
import { buildComplements } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/buildComplements.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BED, BIG, BOY, CAT, DOG, EAT, HOUSE } from '../fixtures.ts';

describe('buildComplements', () => {
  it('is undefined when the period fills no complement', () => {
    expect(buildComplements({ subject: CAT, verb: EAT, directObject: DOG })).toBeUndefined();
  });

  it('builds every boxed complement from its own slot', () => {
    const boxed = COMPLEMENT_TYPES.filter((type) => type !== 'instrumental');
    const sel = Object.fromEntries(boxed.map((type) => [type, HOUSE])) as PhraseSelection;

    const complements = buildComplements(sel)!;

    expect(Object.keys(complements).sort()).toEqual([...boxed].sort());
    for (const type of boxed) expect(complements[type]?.phrase).toMatchObject({ concept: 'HOUSE' });
  });

  it('never builds the instrumental, which comes from a linked period', () => {
    expect(buildComplements({ instrumental: CAT } as PhraseSelection)).toBeUndefined();
  });

  it('builds a complement’s whole noun phrase', () => {
    const sel: PhraseSelection = { terminus: BOY, terminusNumber: 'plural', terminusAdjective: BIG };

    expect(buildComplements(sel)?.terminus).toEqual({
      phrase: expect.objectContaining({ concept: 'BOY', number: 'plural', adjectives: ['BIG'] }),
      specifiers: undefined,
    });
  });

  it('builds a coordinated subject complement as a group', () => {
    const sel: PhraseSelection = { predicative: CAT, predicativeConjuncts: [{ subject: DOG }] };

    expect(buildComplements(sel)?.predicative?.phrase).toMatchObject({
      conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }],
    });
  });

  it('gives the route and the locative each their own path specifier', () => {
    const sel: PhraseSelection = { route: HOUSE, routeSpecifier: 'over', locative: BED, locativeSpecifier: 'under' };

    const complements = buildComplements(sel);

    expect(complements?.route?.specifiers).toEqual([{ kind: 'path', value: 'over' }]);
    expect(complements?.locative?.specifiers).toEqual([{ kind: 'path', value: 'under' }]);
  });

  it('leaves a path specifier off a complement whose own is unset', () => {
    const sel: PhraseSelection = { route: HOUSE, locative: BED, locativeSpecifier: 'under' };

    expect(buildComplements(sel)?.route?.specifiers).toBeUndefined();
  });

  it.each([['negative'], ['positive']] as const)('gives the cause a %s sentiment', (sentiment) => {
    expect(buildComplements({ cause: DOG, causeSentiment: sentiment })?.cause?.specifiers).toEqual([
      { kind: 'sentiment', value: sentiment },
    ]);
  });

  it('leaves the neutral sentiment, the default, off the cause', () => {
    expect(buildComplements({ cause: DOG, causeSentiment: 'neutral' })?.cause?.specifiers).toBeUndefined();
  });

  it('ignores a specifier whose complement is empty', () => {
    expect(buildComplements({ routeSpecifier: 'over', causeSentiment: 'negative' })).toBeUndefined();
  });

  it('denies the cause when its polarity is negative', () => {
    expect(buildComplements({ cause: DOG, causeNegative: true })?.cause?.negative).toBe(true);
  });

  it('leaves the cause plain when it is not denied, and never marks another complement', () => {
    expect(buildComplements({ cause: DOG })?.cause).not.toHaveProperty('negative');
    expect(buildComplements({ cause: DOG, causeNegative: false })?.cause).not.toHaveProperty('negative');
    expect(buildComplements({ cause: DOG, locative: HOUSE, causeNegative: true })?.locative)
      .not.toHaveProperty('negative');
  });

  it('carries the stance and the denial together — a credit can be denied', () => {
    expect(buildComplements({ cause: DOG, causeSentiment: 'positive', causeNegative: true })?.cause)
      .toMatchObject({ negative: true, specifiers: [{ kind: 'sentiment', value: 'positive' }] });
  });
});
