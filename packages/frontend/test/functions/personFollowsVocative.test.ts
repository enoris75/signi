import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import { personFollowsVocative, vocativeIsPlural } from '../../src/components/PhraseBuilder/functions/personFollowsVocative.ts';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';

const MOM: Concept = { id: 'MOM', role: 'noun', description: 'mom' };
const DAD: Concept = { id: 'DAD', role: 'noun', description: 'dad' };

// P11-E8 D4: a command said to "Mom and Dad" is said in the 2nd plural (*Mamma e papà, correte*) — a
// default the canvas applies to what its own action just did, never the reducers.
describe('personFollowsVocative', () => {
  const command: PhraseSelection = { imperative: true, imperativePerson: '2sg', vocative: MOM };
  const group: PhraseSelection = { ...command, vocativeConjuncts: [{ subject: DAD }] };

  it('reads a plural or a group of two as plural, and an empty conjunct as nothing yet', () => {
    expect(vocativeIsPlural(command)).toBe(false);
    expect(vocativeIsPlural({ ...command, vocativeNumber: 'plural' })).toBe(true);
    expect(vocativeIsPlural(group)).toBe(true);
    expect(vocativeIsPlural({ ...command, vocativeConjuncts: [{}] })).toBe(false);
  });

  it('turns the 2nd singular plural when the vocative turns plural, and back', () => {
    expect(personFollowsVocative(command, group).imperativePerson).toBe('2pl');
    const plural = { ...group, imperativePerson: '2pl' as const };
    expect(personFollowsVocative(plural, { ...plural, vocativeConjuncts: [] }).imperativePerson).toBeUndefined();
    // Taking the vocative away is its turning singular too.
    expect(personFollowsVocative(plural, { imperative: true, imperativePerson: '2pl' }).imperativePerson).toBeUndefined();
  });

  it('turns a new command plural when its vocative already is', () => {
    const statement: PhraseSelection = { vocative: MOM, vocativeConjuncts: [{ subject: DAD }] };
    expect(personFollowsVocative(statement, { ...statement, imperative: true, imperativePerson: '2sg' }).imperativePerson).toBe('2pl');
  });

  it('leaves “let’s”, a statement, and a person the vocative’s number did not just change under', () => {
    const lets = { ...command, imperativePerson: '1pl' as const };
    expect(personFollowsVocative(lets, { ...lets, vocativeConjuncts: [{ subject: DAD }] }).imperativePerson).toBe('1pl');
    const statement: PhraseSelection = { vocative: MOM };
    expect(personFollowsVocative(statement, { ...statement, vocativeNumber: 'plural' })).toEqual({ ...statement, vocativeNumber: 'plural' });
    // A deliberate 2nd plural beside a singular vocative stays.
    const deliberate = { ...command, imperativePerson: '2pl' as const };
    expect(personFollowsVocative(deliberate, { ...deliberate, verbNegative: true }).imperativePerson).toBe('2pl');
  });
});
