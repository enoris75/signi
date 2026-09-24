import type { PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { describe, expect, it } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { workspaceToPlans } from '../../../src/components/PhraseBuilder/workspacePlan/functions/workspaceToPlans.ts';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import {
  BOY,
  CAT,
  conditional,
  coordinative,
  DOG,
  EAT,
  instrumental,
  KNIFE,
  NEED,
  period,
  relative,
  SAY,
  SEE,
  SLEEP,
  START,
  subordinate,
} from '../fixtures.ts';

describe('workspaceToPlans', () => {
  it('is empty for an empty workspace', () => {
    expect(workspaceToPlans([], [])).toEqual([]);
  });

  it('translates each unlinked period as a sentence of its own, in workspace order', () => {
    const periods = [period('b', { subject: DOG, verb: SLEEP }), period('a', { subject: CAT, verb: EAT })];

    expect(workspaceToPlans(periods, [])).toEqual([
      { containerId: 'b', plan: selectionToPlan(periods[0].selection) },
      { containerId: 'a', plan: selectionToPlan(periods[1].selection) },
    ]);
  });

  it('folds every kind of linked period into its root, which alone becomes a sentence', () => {
    const periods = [
      period('main', { subject: BOY, verb: START }),
      period('rel', { verb: SEE, directObject: CAT }),
      period('tool', { subject: KNIFE }),
      period('if', { subject: DOG, verb: SLEEP }),
      period('and', { subject: CAT, verb: EAT }),
      period('other', { subject: DOG, verb: EAT }),
    ];
    const links = [
      relative('r', ['main', 'subject'], ['rel', 'subject']),
      instrumental('i', 'main', 'tool'),
      conditional('c', 'main', 'if'),
      coordinative('k', 'main', 'and', 'then'),
    ];

    const sentences = workspaceToPlans(periods, links);

    expect(sentences.map((s) => s.containerId)).toEqual(['main', 'other']);
    const { plan } = sentences[0];
    expect((plan.subject as NounPhrase).relative?.verbPhrase.verb).toBe('SEE');
    expect(plan.complements?.instrumental?.phrase).toMatchObject({ concept: 'KNIFE' });
    expect(plan.condition?.subject).toMatchObject({ concept: 'DOG' });
    expect(plan.coordination).toMatchObject({ conjunction: 'then', clause: { subject: { concept: 'CAT' } } });
  });

  // P09-E12 D9: one plan field per link kind, the fields the engine's clause tests pin.
  it('folds a that-clause into the object slot, where it takes the object’s place', () => {
    const periods = [
      period('main', { subject: BOY, verb: SAY, directObject: DOG }),
      period('that', { subject: CAT, verb: EAT }),
    ];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'content', 'main', 'that')]);

    expect(plan.contentObject).toMatchObject({ subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT' } });
    expect(plan.directObject).toBeUndefined();
  });

  it('folds an adverbial clause in with its conjunction', () => {
    const periods = [period('main', { subject: BOY, verb: SLEEP }), period('when', { subject: CAT, verb: EAT })];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'adverbial', 'main', 'when', 'because')]);

    expect(plan.adverbialClause).toMatchObject({ conjunction: 'because', clause: { subject: { concept: 'CAT' } } });
  });

  it('folds an infinitive complement in without its subject, read in the infinitive whatever it holds', () => {
    const periods = [period('main', { subject: CAT, verb: NEED }), period('to', { subject: DOG, verb: SLEEP })];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'infinitive', 'main', 'to')]);

    expect(plan.infinitiveComplement).toEqual({ verbPhrase: selectionToPlan({ verb: SLEEP, infinitive: true }).verbPhrase });
  });

  // P13: a causative's infinitive is its object's, "to cause a person to see objects".
  it('hands the infinitive to the governing clause’s object when its link says so', () => {
    const periods = [period('main', { subject: CAT, verb: NEED, directObject: DOG }), period('to', { verb: SLEEP })];
    const link = { ...subordinate('s', 'infinitive', 'main', 'to'), control: 'object' } as PhraseLink;
    const [{ plan }] = workspaceToPlans(periods, [link]);

    expect(plan.infinitiveComplement).toMatchObject({ verbPhrase: { verb: 'SLEEP' }, control: 'object' });
  });

  // P13: SAVE is "to write content to load it" — the clause of purpose, whose "it" is the content.
  it('folds a clause of purpose in, its third-person object standing for the governing clause’s', () => {
    const IT = { id: 'THIRD_PERSON', role: 'pronoun' as const, description: 'it', person: '3' as const };
    const periods = [period('main', { subject: CAT, verb: EAT, directObject: DOG }), period('so', { verb: SEE, directObject: IT, directObjectGender: 'masc' })];
    const link = { id: 'p', kind: 'purpose', source: { containerId: 'main' }, target: { containerId: 'so' } } as PhraseLink;
    const [{ plan }] = workspaceToPlans(periods, [link]);

    expect(plan.purpose).toMatchObject({ verbPhrase: { verb: 'SEE' }, directObject: { concept: 'THIRD_PERSON', antecedent: 'DOG' } });
    // The antecedent gives the pronoun its gender in each language, so the chip's is not said.
    expect(plan.purpose?.directObject).not.toHaveProperty('gender');
    expect(plan).not.toHaveProperty('infinitiveComplement');
  });

  it('folds in no subordinate clause until its period has a verb', () => {
    const periods = [period('main', { subject: BOY, verb: SLEEP }), period('when', { subject: CAT })];
    const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'adverbial', 'main', 'when')]);

    expect(plan.adverbialClause).toBeUndefined();
  });

  // The engine renders no finite clause without its subject (it throws), so an empty subject box
  // folds in nothing either; an infinitive's subject goes unsaid, so it folds in all the same.
  it('folds in no that-clause or adverbial clause until its period has a subject', () => {
    const periods = [
      period('main', { subject: BOY, verb: SAY }),
      period('that', { verb: SLEEP }),
      period('need', { subject: CAT, verb: NEED }),
    ];
    const [{ plan: says }] = workspaceToPlans(periods, [subordinate('s', 'content', 'main', 'that')]);
    expect(says).not.toHaveProperty('contentObject');
    const [{ plan: runs }] = workspaceToPlans(periods, [subordinate('s', 'adverbial', 'main', 'that', 'when')]);
    expect(runs).not.toHaveProperty('adverbialClause');
    const needs = workspaceToPlans(periods, [subordinate('s', 'infinitive', 'need', 'that')]).find((p) => p.containerId === 'need')!;
    expect(needs.plan.infinitiveComplement).toBeDefined();
  });

  it('translates nothing when every period is some link’s target', () => {
    const periods = [period('a', { subject: CAT, verb: EAT }), period('b', { subject: DOG, verb: SLEEP })];
    const links = [conditional('x', 'a', 'b'), conditional('y', 'b', 'a')];

    expect(workspaceToPlans(periods, links)).toEqual([]);
  });
});

// A267. The builder hangs a linked period on its main clause as an if-clause or a coordinate whether
// or not its subject box holds a word, so a period with only a verb reaches the engine as a clause
// with no subject, and `/api/translate` answers 500. A subordinate clause already folds in nothing
// until its subject has a head (above); the if-clause and the coordinate should wait the same way.
describe('known bugs: a linked clause with no subject crashes the engine (A267)', () => {
  const periods = [period('main', { subject: BOY, verb: SLEEP }), period('linked', { verb: EAT })];

  it('folds in no if-clause or coordinate until its period has a subject', () => {
    const [{ plan: iffed }] = workspaceToPlans(periods, [conditional('c', 'main', 'linked')]);
    expect(iffed).not.toHaveProperty('condition');
    const [{ plan: joined }] = workspaceToPlans(periods, [coordinative('k', 'main', 'linked')]);
    expect(joined).not.toHaveProperty('coordination');
  });

  it('folds them in once the subject box holds a word, and the if-clause keeps the main clause as its own sentence meanwhile', () => {
    const filled = [periods[0]!, period('linked', { subject: CAT, verb: EAT })];
    expect(workspaceToPlans(filled, [conditional('c', 'main', 'linked')])[0]!.plan.condition).toMatchObject({ subject: { concept: CAT.id } });
    expect(workspaceToPlans(filled, [coordinative('k', 'main', 'linked')])[0]!.plan.coordination?.clause).toMatchObject({ subject: { concept: CAT.id } });
    expect(workspaceToPlans(periods, [conditional('c', 'main', 'linked')])).toHaveLength(1);
  });

  it('regression: a command’s coordinate needs no subject box, as it takes the addressee', () => {
    const commands = [period('main', { verb: SLEEP, imperative: true }), period('linked', { verb: EAT, imperative: true })];
    const [{ plan }] = workspaceToPlans(commands, [coordinative('k', 'main', 'linked')]);
    expect(plan.coordination?.clause.subject).toEqual(plan.subject);
  });
});

// A275. A relative link may land on a period's object while its subject box is still empty, and
// `buildRelativeClause` then hangs an object relative with no subject on the head, which the engine
// renders as a subject relative ("the cat that eats", meaning flipped). A subordinate clause already
// folds in nothing until its subject has a head; an object, complement or possessor relative should
// wait the same way. A subject relative needs none, since the head is its subject.
describe('known bugs: an object relative with no subject reads as a subject relative (A275)', () => {
  it('folds in no object relative until its period has a subject', () => {
    const periods = [period('main', { subject: CAT, verb: SLEEP }), period('rel', { verb: EAT, directObject: DOG })];
    const [{ plan }] = workspaceToPlans(periods, [relative('r', ['main', 'subject'], ['rel', 'directObject'])]);
    expect(plan.subject).not.toHaveProperty('relative');
  });

  it('regression: a subject relative needs no subject of its own', () => {
    const periods = [period('main', { subject: CAT, verb: SLEEP }), period('rel', { subject: DOG, verb: EAT })];
    const [{ plan }] = workspaceToPlans(periods, [relative('r', ['main', 'subject'], ['rel', 'subject'])]);
    expect(plan.subject).toHaveProperty('relative');
  });
});
