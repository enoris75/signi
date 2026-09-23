import { describe, expect, it } from 'vitest';
import type { Concept, PhrasePlan } from '@signi/shared';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { askQuestion } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/askQuestion.ts';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/selectionToPlan.ts';
import { workspaceToPlans } from '../../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';
import { concept, CAT, DOG, HOUSE } from '../fixtures.ts';

const MAN = concept('MAN', 'noun', { human: true });
const EAT: Concept = concept('EAT', 'verb', { transitivity: 'transitive', complements: ['locative', 'manner', 'cause'] });
const BE: Concept = concept('BE', 'verb', { transitivity: 'intransitive', complements: ['predicative', 'locative'] });
const SOMETHING = concept('SOMETHING', 'pronoun', { person: '3', slot: 'indefinite' });
const ME = concept('FIRST_PERSON', 'pronoun', { person: '1' });

// The root period's plan, as the panel translates it.
const planOf = (selection: PhraseSelection): Partial<PhrasePlan> =>
  workspaceToPlans([{ id: 'p', selection }], [])[0]!.plan;

// One plan per member, asserting the field the engine pins (P09-E12 §Tests).
describe('the question and the existential in the plan', () => {
  it('asks a yes/no question (M5): "does the cat eat?"', () => {
    expect(planOf({ subject: CAT, verb: EAT, interrogative: true })).toMatchObject({
      subject: { concept: 'CAT' },
      verbPhrase: { verb: 'EAT' },
      interrogative: true,
    });
    // A question needs a verb to ask with, and a command has its own force.
    expect(planOf({ subject: CAT, interrogative: true })).not.toHaveProperty('interrogative');
    expect(planOf({ subject: CAT, verb: EAT, interrogative: true, imperative: true })).not.toHaveProperty('interrogative');
  });

  it('asks about the object and leaves its word out (M6): "what does the cat eat?"', () => {
    const plan = planOf({ subject: CAT, verb: EAT, directObject: DOG, interrogative: true, questionRole: 'directObject' });
    expect(plan).toMatchObject({ questionRole: 'directObject', interrogative: true });
    expect(plan).not.toHaveProperty('directObject');
    expect(plan).not.toHaveProperty('questionAnimate');
  });

  it('asks about the subject over a throwaway subject, who of a person', () => {
    const plan = planOf({ subject: MAN, verb: EAT, interrogative: true, questionRole: 'subject' });
    expect(plan).toMatchObject({ subject: { concept: 'GENERIC_PERSON' }, questionRole: 'subject', questionAnimate: true });
    // An empty subject box is a subject gap too: "who eats?" is a sentence.
    expect(planOf({ verb: EAT, interrogative: true, questionRole: 'subject', questionAnimate: true }).subject).toEqual({
      concept: 'GENERIC_PERSON',
    });
  });

  it('asks about a complement and keeps its relation', () => {
    const plan = planOf({ subject: CAT, verb: EAT, locative: HOUSE, locativeSpecifier: 'in', interrogative: true, questionRole: 'locative' });
    expect(plan).toMatchObject({ questionRole: 'locative', questionSpecifiers: [{ kind: 'path', value: 'in' }] });
    expect(plan).not.toHaveProperty('complements');
  });

  it('leaves out a mark the engine would refuse, and keeps the word', () => {
    const passive = planOf({ subject: CAT, verb: EAT, directObject: DOG, verbVoice: 'passive', interrogative: true, questionRole: 'directObject' });
    expect(passive).not.toHaveProperty('questionRole');
    expect(passive.directObject).toMatchObject({ concept: 'DOG' });
    const under = planOf({ subject: CAT, verb: EAT, locative: HOUSE, locativeSpecifier: 'under', interrogative: true, questionRole: 'locative' });
    expect(under).not.toHaveProperty('questionRole');
    expect(under.complements?.locative).toBeDefined();
  });

  it('asks only the root period: a clause under a condition keeps its words', () => {
    const plan = selectionToPlan({ subject: CAT, verb: EAT, directObject: DOG, interrogative: true, questionRole: 'directObject' });
    askQuestion(plan, { subject: CAT, verb: EAT, interrogative: true, questionRole: 'directObject' });
    expect(plan.questionRole).toBe('directObject');
    const conditioned = { ...selectionToPlan({ subject: CAT, verb: EAT, directObject: DOG }), condition: {} as PhrasePlan };
    askQuestion(conditioned, { subject: CAT, verb: EAT, interrogative: true, questionRole: 'directObject' });
    expect(conditioned).not.toHaveProperty('questionRole');
    expect(conditioned.directObject).toBeDefined();
  });

  it('says an existential of BE (M7): "there is a cat in the house"', () => {
    expect(planOf({ subject: CAT, verb: BE, locative: HOUSE, existential: true })).toMatchObject({
      subject: { concept: 'CAT' },
      verbPhrase: { verb: 'BE' },
      existential: true,
    });
    expect(planOf({ subject: SOMETHING, verb: BE, existential: true }).existential).toBe(true);
    // Refused by the engine, so left out: another verb, a personal-pronoun pivot.
    expect(planOf({ subject: CAT, verb: EAT, existential: true })).not.toHaveProperty('existential');
    expect(planOf({ subject: ME, verb: BE, existential: true })).not.toHaveProperty('existential');
  });

  // P09-E12 D9: a that-clause is its verb's object, so the object is no gap beside it.
  it('asks no object of a period whose object is a that-clause', () => {
    const SAY = concept('SAY', 'verb', { transitivity: 'transitive', clauseObject: 'content' });
    const RUN = concept('RUN', 'verb', { transitivity: 'intransitive' });
    const [{ plan }] = workspaceToPlans(
      [
        { id: 'p', selection: { subject: MAN, verb: SAY, interrogative: true, questionRole: 'directObject' } },
        { id: 'q', selection: { subject: CAT, verb: RUN } },
      ],
      [{ id: 'l', kind: 'content', source: { containerId: 'p' }, target: { containerId: 'q' } }],
    );
    expect(plan).not.toHaveProperty('questionRole');
    expect(plan).toMatchObject({ interrogative: true, contentObject: { verbPhrase: { verb: 'RUN' } } });
    // Its subject still is one: "who says that the cat runs?"
    const [{ plan: who }] = workspaceToPlans(
      [
        { id: 'p', selection: { subject: MAN, verb: SAY, interrogative: true, questionRole: 'subject' } },
        { id: 'q', selection: { subject: CAT, verb: RUN } },
      ],
      [{ id: 'l', kind: 'content', source: { containerId: 'p' }, target: { containerId: 'q' } }],
    );
    expect(who).toMatchObject({ questionRole: 'subject', contentObject: { verbPhrase: { verb: 'RUN' } } });
  });
});
