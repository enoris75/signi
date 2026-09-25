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
    // A time the engine asks only at or until (P09-E53 D2).
    const ago = planOf({ subject: CAT, verb: EAT, temporal: HOUSE, temporalRelation: 'ago', interrogative: true, questionRole: 'temporal' });
    expect(ago).not.toHaveProperty('questionRole');
    expect(ago.complements?.temporal).toBeDefined();
  });

  // P09-E53 D3: one plan per column of the task's table, each from an EMPTY asked box with its
  // relation — the plans questions.test.ts pins in the engine.
  describe('asks a complement that keeps its relation, from an empty box', () => {
    const RUN = concept('RUN', 'verb', { transitivity: 'intransitive', complements: ['locative', 'cause'] });
    const COME = concept('COME', 'verb', { transitivity: 'intransitive', complements: ['source'] });
    const GIVE = concept('GIVE', 'verb', { transitivity: 'ditransitive', complements: ['terminus'] });
    const BOOK = concept('BOOK', 'noun');
    const ask = (sel: PhraseSelection) => {
      const plan = planOf({ interrogative: true, ...sel });
      delete plan.interrogative;
      return plan;
    };
    it.each<[string, PhraseSelection, Partial<PhrasePlan>]>([
      [
        'under what does the cat eat?',
        { subject: CAT, verb: EAT, locativeSpecifier: 'under', questionRole: 'locative' },
        { questionRole: 'locative', questionSpecifiers: [{ kind: 'path', value: 'under' }] },
      ],
      [
        'thanks to whom does the cat run?',
        { subject: CAT, verb: RUN, causeSentiment: 'positive', questionRole: 'cause', questionAnimate: true },
        { questionRole: 'cause', questionSpecifiers: [{ kind: 'sentiment', value: 'positive' }], questionAnimate: true },
      ],
      ['where does the cat come from?', { subject: CAT, verb: COME, questionRole: 'source' }, { questionRole: 'source' }],
      ['when does the cat eat?', { subject: CAT, verb: EAT, questionRole: 'temporal' }, { questionRole: 'temporal' }],
      [
        'with whom does the cat run?',
        { subject: CAT, verb: RUN, questionRole: 'comitative', questionAnimate: true },
        { questionRole: 'comitative', questionAnimate: true },
      ],
      [
        'to whom does the man give the book?',
        { subject: MAN, verb: GIVE, directObject: BOOK, questionRole: 'terminus', questionAnimate: true },
        { questionRole: 'terminus', questionAnimate: true, directObject: { concept: 'BOOK' } },
      ],
    ])('%s', (_, sel, want) => {
      const plan = ask(sel);
      expect(plan).toMatchObject(want);
      expect(plan).not.toHaveProperty('complements');
      if (!want.questionSpecifiers) expect(plan).not.toHaveProperty('questionSpecifiers');
      if (!want.questionAnimate) expect(plan).not.toHaveProperty('questionAnimate');
    });

    it('asks until when, and who a companion is by the held word', () => {
      expect(ask({ subject: CAT, verb: EAT, temporalRelation: 'until', questionRole: 'temporal' })).toMatchObject({
        questionRole: 'temporal',
        questionSpecifiers: [{ kind: 'temporal', value: 'until' }],
      });
      const held = ask({ subject: CAT, verb: RUN, comitative: MAN, questionRole: 'comitative' });
      expect(held).toMatchObject({ questionRole: 'comitative', questionAnimate: true });
      expect(held).not.toHaveProperty('complements');
    });
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
