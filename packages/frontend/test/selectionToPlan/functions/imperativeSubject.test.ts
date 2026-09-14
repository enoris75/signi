import { describe, expect, it } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { imperativeSubject } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/imperativeSubject.ts';
import type { ImperativePerson } from '../../../src/components/PhraseBuilder/interfaces.ts';

describe('imperativeSubject', () => {
  it.each<[ImperativePerson | undefined, NounPhrase]>([
    ['2sg', { concept: 'SECOND_PERSON', number: 'singular' }],
    ['1pl', { concept: 'FIRST_PERSON', number: 'plural' }],
    ['2pl', { concept: 'SECOND_PERSON', number: 'plural' }],
    [undefined, { concept: 'SECOND_PERSON', number: 'singular' }],
  ])('addresses %s as %j', (person, subject) => {
    expect(imperativeSubject(person)).toEqual(subject);
  });
});
