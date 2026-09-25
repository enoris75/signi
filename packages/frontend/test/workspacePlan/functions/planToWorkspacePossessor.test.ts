// P11-E9 D8: a possessive pronoun in a plan comes back to the canvas as an owner ring whose head is the
// pronoun of its person, and goes out again as the same plan.
import { describe, expect, it } from 'vitest';
import type { Concept, PhrasePlan, PronominalPossessor } from '@signi/shared';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
import { workspaceToPlans } from '@signi/phrase/model/workspacePlan/functions/workspaceToPlans.ts';
import { concept } from '../../selectionToPlan/fixtures.ts';

const MOTHER = concept('MOTHER', 'noun');
const FATHER = concept('FATHER', 'noun');
const SON = concept('SON', 'noun');
const DAUGHTER = concept('DAUGHTER', 'noun');
const BOOK = concept('BOOK', 'noun');
const RUN = concept('RUN', 'verb', { transitivity: 'intransitive' });
const MARRY = concept('MARRY', 'verb', { transitivity: 'transitive' });
const SEE = concept('SEE', 'verb', { transitivity: 'transitive' });
const FIRST = concept('FIRST_PERSON', 'pronoun', { person: '1' });
const SECOND = concept('SECOND_PERSON', 'pronoun', { person: '2' });
const THIRD = concept('THIRD_PERSON', 'pronoun', { person: '3' });
const BY_ID = new Map<string, Concept>(
  [MOTHER, FATHER, SON, DAUGHTER, BOOK, RUN, MARRY, SEE, FIRST, SECOND, THIRD].map((c) => [c.id, c]),
);
const conceptOf = (id: string) => BY_ID.get(id);

const load = (plan: PhrasePlan) => {
  const { containers, links, unsupported } = planToWorkspace(plan, conceptOf);
  return { containers, unsupported, back: workspaceToPlans(containers, links)[0]!.plan };
};

const owned = (head: string, possessor: PronominalPossessor, verb = 'RUN'): PhrasePlan =>
  ({ subject: { concept: head, possessor }, verbPhrase: { verb } }) as PhrasePlan;

// P11-E7 D6: the link to the subject is a pointer at `subject` on the canvas, at any depth.
describe('planToWorkspace: the link to the subject (P11-E7)', () => {
  const LINK = { kind: 'coreferent', slot: 'subject' } as const;

  it('loads a link on the object as a pointer at the subject, and re-plans to itself', () => {
    const plan = { subject: { concept: 'MOTHER' }, verbPhrase: { verb: 'SEE' }, directObject: { concept: 'BOOK', possessor: LINK } } as PhrasePlan;
    const { containers, unsupported, back } = load(plan);
    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection.directObjectPossessorRef).toBe('subject');
    expect((back.directObject as { possessor?: unknown }).possessor).toEqual(LINK);
  });

  it('loads a link at depth, an owner’s owner, with the period’s address', () => {
    const plan = {
      subject: { concept: 'MOTHER' },
      verbPhrase: { verb: 'SEE' },
      directObject: { concept: 'BOOK', possessor: { concept: 'FATHER', possessor: LINK } },
    } as PhrasePlan;
    const { containers, unsupported, back } = load(plan);
    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection.directObjectPossessor).toMatchObject({ subjectPossessorRef: 'subject' });
    expect(back.directObject).toMatchObject({ possessor: { concept: 'FATHER', possessor: LINK } });
  });

  it('loads a command’s link, which binds to the addressee', () => {
    const plan = {
      subject: { concept: 'SECOND_PERSON', number: 'singular' },
      verbPhrase: { verb: 'SEE' },
      directObject: { concept: 'BOOK', possessor: LINK },
      imperative: true,
    } as PhrasePlan;
    const { unsupported, back } = load(plan);
    expect(unsupported).toEqual([]);
    expect((back.directObject as { possessor?: unknown }).possessor).toEqual(LINK);
  });

  it('names a link the builder would write back as a copy: under the passive', () => {
    const plan = {
      subject: { concept: 'MOTHER' },
      verbPhrase: { verb: 'SEE', voice: 'passive' },
      directObject: { concept: 'BOOK', possessor: LINK },
    } as PhrasePlan;
    expect(load(plan).unsupported).toEqual(['Possessor.coreferent where the builder copies']);
  });
});

describe('planToWorkspace: a possessive pronoun (P11-E9)', () => {
  it.each<[string, PhrasePlan]>([
    ['my mother runs', owned('MOTHER', { kind: 'pronominal', person: '1', number: 'singular' })],
    ['your mother runs', owned('MOTHER', { kind: 'pronominal', person: '2', number: 'singular' })],
    ['our father runs', owned('FATHER', { kind: 'pronominal', person: '1', number: 'plural' })],
    ['your (plural) mother runs', owned('MOTHER', { kind: 'pronominal', person: '2', number: 'plural' })],
    ['her mother runs', owned('MOTHER', { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' })],
    ['its mother runs', owned('MOTHER', { kind: 'pronominal', person: '3', number: 'singular', gender: 'neut' })],
    ['his mother runs (no gender)', owned('MOTHER', { kind: 'pronominal', person: '3', number: 'singular' })],
    ['my son marries your daughter', {
      subject: { concept: 'SON', possessor: { kind: 'pronominal', person: '1', number: 'singular' } },
      verbPhrase: { verb: 'MARRY' },
      directObject: { concept: 'DAUGHTER', possessor: { kind: 'pronominal', person: '2', number: 'singular' } },
    } as PhrasePlan],
  ])('%s: loads as a pronoun owner with nothing unsaid, and re-plans to itself', (_, plan) => {
    const { containers, unsupported, back } = load(plan);
    expect(unsupported).toEqual([]);
    expect(containers[0]!.selection.subjectPossessor?.subject?.role).toBe('pronoun');
    expect((back.subject as { possessor?: unknown }).possessor).toEqual((plan.subject as { possessor?: unknown }).possessor);
    if (plan.directObject)
      expect((back.directObject as { possessor?: unknown }).possessor).toEqual((plan.directObject as { possessor?: unknown }).possessor);
    // And once more, from what it gave back.
    expect(load(back as PhrasePlan).back).toEqual(back);
  });

  it('holds the person, the number, and the gender of the 3rd person alone', () => {
    const { containers } = load(owned('BOOK', { kind: 'pronominal', person: '3', number: 'plural', gender: 'fem' }, 'SEE'));
    expect(containers[0]!.selection.subjectPossessor).toEqual({ subject: THIRD, subjectNumber: 'plural', subjectGender: 'fem' });
    const first = load(owned('BOOK', { kind: 'pronominal', person: '1', number: 'singular', gender: 'fem' }, 'SEE'));
    expect(first.containers[0]!.selection.subjectPossessor).toEqual({ subject: FIRST, subjectNumber: 'singular' });
  });

  it('names a role on a possessive pronoun unsaid: the engine reads none there', () => {
    const plan = { ...owned('BOOK', { kind: 'pronominal', person: '1', number: 'singular' }, 'SEE') } as PhrasePlan;
    (plan.subject as { possessorRole?: string }).possessorRole = 'whole';
    expect(load(plan).unsupported).toEqual(['NounPhrase.possessorRole on a pronoun']);
  });
});
