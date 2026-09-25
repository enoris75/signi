// P09-E50: a plan's attributive standard (NounPhrase.adjectiveStandards) comes back to the canvas as
// its noun's `${which}Standard`, and goes out again as the same plan.
import { describe, expect, it } from 'vitest';
import type { Concept, PhrasePlan } from '@signi/shared';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
import { workspaceToPlans } from '@signi/phrase/model/workspacePlan/functions/workspaceToPlans.ts';
import { BIG, CAT, DOG, EAT, SAIL, concept } from '../../selectionToPlan/fixtures.ts';

const SEE = concept('SEE', 'verb', { transitivity: 'transitive' });
const BE = concept('BE', 'verb', { transitivity: 'intransitive', complements: ['predicative'] } as Partial<Concept>);
const MAN = concept('MAN', 'noun');
const ANIMAL = concept('ANIMAL', 'noun');
const WOMAN = concept('WOMAN', 'noun');
const BY_ID = new Map([BIG, CAT, DOG, EAT, SAIL, SEE, BE, MAN, ANIMAL, WOMAN].map((c) => [c.id, c]));
const conceptOf = (id: string) => BY_ID.get(id);

const roundTrip = (plan: PhrasePlan) => {
  const { containers, links, unsupported } = planToWorkspace(plan, conceptOf);
  return { containers, unsupported, back: workspaceToPlans(containers, links)[0]!.plan };
};

describe('planToWorkspace: the attributive standard', () => {
  it.each<[string, PhrasePlan, string]>([
    ['the man sees a bigger cat than the dog', {
      subject: { concept: 'MAN' },
      verbPhrase: { verb: 'SEE' },
      directObject: { concept: 'CAT', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [{ concept: 'DOG' }] },
    } as PhrasePlan, 'directObjectStandard'],
    ['the cat is a bigger animal than the dog', {
      subject: { concept: 'CAT' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'ANIMAL', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [{ concept: 'DOG' }] } } },
    } as PhrasePlan, 'predicativeStandard'],
    ['a cat as big as the dog eats', {
      subject: { concept: 'CAT', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['equally'], adjectiveStandards: [{ concept: 'DOG' }] },
      verbPhrase: { verb: 'EAT' },
    } as PhrasePlan, 'subjectStandard'],
  ])('holds "%s" as its noun’s standard, and gives it back', (_, plan, key) => {
    const { containers, unsupported, back } = roundTrip(plan);
    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection[key as 'subjectStandard']).toMatchObject({ subject: { id: 'DOG' } });
    const np = (p: Partial<PhrasePlan>) =>
      (key === 'subjectStandard' ? p.subject : key === 'directObjectStandard' ? p.directObject : p.complements?.predicative?.phrase) as {
        adjectiveStandards?: unknown;
      };
    expect(np(back).adjectiveStandards).toMatchObject([{ concept: 'DOG' }]);
  });

  it('reports a standard off the compared adjective, and one on a noun head', () => {
    const off = {
      subject: { concept: 'CAT', adjectives: ['BIG'], adjectiveDegrees: ['positive'], adjectiveStandards: [{ concept: 'DOG' }] },
      verbPhrase: { verb: 'EAT' },
    } as PhrasePlan;
    expect(planToWorkspace(off, conceptOf).unsupported).toEqual(['NounPhrase.adjectiveStandards off the compared adjective']);
    const head = { subject: { concept: 'CAT', headStandard: { concept: 'DOG' } }, verbPhrase: { verb: 'EAT' } } as PhrasePlan;
    expect(planToWorkspace(head, conceptOf).unsupported).toEqual(['NounPhrase.headStandard on a noun head']);
  });

  it('reports one on a hosted noun', () => {
    const owned = {
      subject: { concept: 'CAT', possessor: { concept: 'WOMAN', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [{ concept: 'DOG' }] } },
      verbPhrase: { verb: 'EAT' },
    } as PhrasePlan;
    expect(planToWorkspace(owned, conceptOf).unsupported).toEqual(['NounPhrase.adjectiveStandards off the compared adjective']);
  });
});
