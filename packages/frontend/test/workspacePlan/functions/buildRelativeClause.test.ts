import { describe, expect, it } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { buildRelativeClause } from '../../../src/components/PhraseBuilder/workspacePlan/functions/buildRelativeClause.ts';
import type { NounKey, PhraseContainer, PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BOY, byId, CAT, DOG, EAT, HOUSE, KNIFE, period, relative, SLEEP } from '../fixtures.ts';

const clause = (target: PhraseContainer, gap: NounKey, links: PhraseLink[] = [], periods = [target]) =>
  buildRelativeClause(target, gap, links, byId(...periods), new Set(['main']));

describe('buildRelativeClause', () => {
  const EATS = period('eats', { subject: BOY, verb: EAT, verbTense: 'past', directObject: DOG });

  it('leaves out a subject gap, which the head fills, and keeps the object', () => {
    expect(clause(EATS, 'subject')).toEqual({
      headRole: 'subject',
      subject: undefined,
      verbPhrase: expect.objectContaining({ verb: 'EAT', tense: 'past' }),
      directObject: expect.objectContaining({ concept: 'DOG' }),
      complements: undefined,
    });
  });

  it('leaves out an object gap and keeps the clause’s own subject', () => {
    expect(clause(EATS, 'directObject')).toMatchObject({
      headRole: 'directObject',
      subject: { concept: 'BOY' },
      directObject: undefined,
    });
  });

  it('leaves out a complement gap, keeping its specifiers for the relativizer', () => {
    const sleeps = period('sleeps', { subject: CAT, verb: SLEEP, locative: HOUSE, locativeSpecifier: 'under' });

    const relativeClause = clause(sleeps, 'locative');

    expect(relativeClause).toMatchObject({
      headRole: 'locative',
      headSpecifiers: [{ kind: 'path', value: 'under' }],
      subject: { concept: 'CAT' },
    });
    expect(relativeClause?.complements).toBeUndefined();
  });

  it('keeps the complements other than the gap', () => {
    const sleeps = period('sleeps', { subject: CAT, verb: SLEEP, locative: HOUSE, manner: KNIFE });

    expect(Object.keys(clause(sleeps, 'locative')?.complements ?? {})).toEqual(['manner']);
  });

  it('carries no head specifiers for a gap without any', () => {
    const sleeps = period('sleeps', { subject: CAT, verb: SLEEP, terminus: DOG });

    expect(clause(sleeps, 'terminus')).not.toHaveProperty('headSpecifiers');
  });

  it('carries no head specifiers for a core gap, whatever complement specifiers the clause has', () => {
    const sleeps = period('sleeps', { verb: SLEEP, locative: HOUSE, locativeSpecifier: 'under' });

    const relativeClause = clause(sleeps, 'subject');

    expect(relativeClause).not.toHaveProperty('headSpecifiers');
    expect(relativeClause?.complements?.locative?.specifiers).toEqual([{ kind: 'path', value: 'under' }]);
  });

  it('is nothing yet for a period with no verb, rather than a clause without its predicate', () => {
    const noVerb = period('boy', { subject: BOY, directObject: DOG });

    expect(clause(noVerb, 'subject')).toBeUndefined();
    expect(clause(noVerb, 'directObject')).toBeUndefined();
  });

  it('folds in the clause’s own relative clauses', () => {
    const sleeps = period('sleeps', { subject: CAT, verb: SLEEP });

    const relativeClause = clause(EATS, 'subject', [relative('l', ['eats', 'directObject'], ['sleeps', 'subject'])], [EATS, sleeps]);

    expect((relativeClause?.directObject as NounPhrase).relative?.verbPhrase.verb).toBe('SLEEP');
  });

  it('does not follow a link back into the period that holds the head', () => {
    const main = period('main', { subject: CAT, verb: SLEEP });

    const relativeClause = clause(EATS, 'subject', [relative('back', ['eats', 'directObject'], ['main', 'subject'])], [EATS, main]);

    expect((relativeClause?.directObject as NounPhrase).relative).toBeUndefined();
  });
});
