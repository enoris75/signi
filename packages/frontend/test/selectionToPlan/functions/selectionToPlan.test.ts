import { describe, expect, it } from 'vitest';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/selectionToPlan.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BOY, CAT, EAT, GO, HOUSE } from '../fixtures.ts';

const FULL: PhraseSelection = {
  subject: BOY,
  verb: EAT,
  verbTense: 'future',
  directObject: CAT,
  directObjectNumber: 'plural',
  locative: HOUSE,
};

describe('selectionToPlan', () => {
  it('is an empty plan for an empty period', () => {
    expect(selectionToPlan({})).toEqual({});
  });

  it('builds a declarative clause from its slots', () => {
    expect(selectionToPlan(FULL)).toEqual({
      subject: expect.objectContaining({ concept: 'BOY' }),
      verbPhrase: expect.objectContaining({ verb: 'EAT', tense: 'future' }),
      directObject: expect.objectContaining({ concept: 'CAT', number: 'plural' }),
      complements: { locative: { phrase: expect.objectContaining({ concept: 'HOUSE' }), specifiers: undefined } },
    });
  });

  it('carries no mood of its own for a declarative clause', () => {
    const plan = selectionToPlan(FULL);

    expect(plan).not.toHaveProperty('imperative');
    expect(plan).not.toHaveProperty('infinitive');
  });

  it('gives a command its addressee as subject, over the one picked', () => {
    const plan = selectionToPlan({ ...FULL, imperative: true, imperativePerson: '1pl' });

    expect(plan.subject).toEqual({ concept: 'FIRST_PERSON', number: 'plural' });
    expect(plan.imperative).toBe(true);
    expect(plan.directObject).toMatchObject({ concept: 'CAT' });
  });

  it('carries a command’s register only when one is set', () => {
    expect(selectionToPlan({ verb: GO, imperative: true })).not.toHaveProperty('imperativeRegister');
    expect(
      selectionToPlan({ verb: GO, imperative: true, imperativeRegister: 'instruction' }).imperativeRegister,
    ).toBe('instruction');
  });

  it('cites an infinitive behind the impersonal placeholder subject', () => {
    const plan = selectionToPlan({ ...FULL, infinitive: true });

    expect(plan.subject).toEqual({ concept: 'GENERIC_PERSON' });
    expect(plan.infinitive).toBe(true);
    expect(plan).not.toHaveProperty('imperative');
  });

  it.each<[string, PhraseSelection]>([
    ['a command', { subject: BOY, imperative: true, imperativePerson: '2pl', imperativeRegister: 'request' }],
    ['an infinitive', { subject: BOY, infinitive: true }],
  ])('keeps %s with no verb yet a plain period', (_, sel) => {
    const plan = selectionToPlan(sel);

    expect(plan.subject).toMatchObject({ concept: 'BOY' });
    expect(plan).not.toHaveProperty('imperative');
    expect(plan).not.toHaveProperty('imperativeRegister');
    expect(plan).not.toHaveProperty('infinitive');
  });
});
