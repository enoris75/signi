import type { PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { describe, expect, it } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { planToWorkspace } from '@signi/phrase/model/workspacePlan/functions/planToWorkspace.ts';
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

  // P09-E55: the that-clause of a verb that reports a question carries its own, gap and all — the
  // plans content-clause.test.ts pins in the engine.
  describe('the indirect question', () => {
    const ASK = { ...SAY, id: 'ASK', clauseForce: 'interrogative' as const };
    const KNOW = { ...SAY, id: 'KNOW', clauseForce: 'either' as const };
    const TELL = { ...SAY, id: 'TELL', clauseForce: 'either' as const };
    const contentOf = (main: object, clause: object) =>
      workspaceToPlans([period('main', main), period('that', clause)], [subordinate('s', 'content', 'main', 'that')])[0]!.plan;

    it('the man asks whether the cat runs', () => {
      expect(contentOf({ subject: BOY, verb: ASK }, { subject: CAT, verb: SLEEP, interrogative: true }).contentObject).toMatchObject({
        interrogative: true,
        subject: { concept: 'CAT' },
      });
    });
    it('the man asks what the cat eats', () => {
      const clause = contentOf({ subject: BOY, verb: ASK }, { subject: CAT, verb: EAT, directObject: DOG, interrogative: true, questionRole: 'directObject' }).contentObject;
      expect(clause).toMatchObject({ interrogative: true, questionRole: 'directObject' });
      expect(clause).not.toHaveProperty('directObject');
    });
    it('the man knows where the cat eats', () => {
      expect(
        contentOf({ subject: BOY, verb: KNOW }, { subject: CAT, verb: { ...EAT, complements: ['locative'] }, interrogative: true, questionRole: 'locative' }).contentObject,
      ).toMatchObject({ questionRole: 'locative' });
    });
    it('the man tells the dog who eats', () => {
      expect(
        contentOf({ subject: BOY, verb: TELL }, { subject: DOG, verb: EAT, interrogative: true, questionRole: 'subject', questionAnimate: true }).contentObject,
      ).toMatchObject({ subject: { concept: 'GENERIC_PERSON' }, questionRole: 'subject', questionAnimate: true });
    });
    it('who asks what the cat eats? — a gap on both periods', () => {
      const plan = contentOf(
        { subject: BOY, verb: ASK, interrogative: true, questionRole: 'subject', questionAnimate: true },
        { subject: CAT, verb: EAT, interrogative: true, questionRole: 'directObject' },
      );
      expect(plan).toMatchObject({ questionRole: 'subject', subject: { concept: 'GENERIC_PERSON' }, contentObject: { questionRole: 'directObject' } });
    });
    it('withholds a statement under ASK, and states a question under a verb that reports none', () => {
      expect(contentOf({ subject: BOY, verb: ASK }, { subject: CAT, verb: EAT })).not.toHaveProperty('contentObject');
      const said = contentOf({ subject: BOY, verb: SAY }, { subject: CAT, verb: EAT, interrogative: true, questionRole: 'subject' }).contentObject;
      expect(said).not.toHaveProperty('interrogative');
      expect(said).not.toHaveProperty('questionRole');
    });
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

  // P09-E47: the interjection is the root period's, and not a citation's.
  describe('the interjection', () => {
    const HEY = { id: 'HEY', role: 'interjection' as const, description: 'hey', label: 'hey' };

    it('is written on the root period', () => {
      const [{ plan }] = workspaceToPlans([period('p', { interjection: HEY, subject: CAT, verb: EAT })], []);
      expect(plan.interjection).toBe('HEY');
    });

    it('is not taken along by a that-clause, whose plan is its target period’s whole', () => {
      const periods = [period('main', { subject: DOG, verb: SAY }), period('that', { interjection: HEY, subject: CAT, verb: EAT })];
      const [{ plan }] = workspaceToPlans(periods, [subordinate('s', 'content', 'main', 'that')]);
      expect(plan.interjection).toBeUndefined();
      expect(plan.contentObject).toBeDefined();
      expect(plan.contentObject).not.toHaveProperty('interjection');
    });

    it('is not written under the infinitive: a citation calls no one', () => {
      const [{ plan }] = workspaceToPlans([period('p', { interjection: HEY, verb: EAT, infinitive: true })], []);
      expect(plan.interjection).toBeUndefined();
    });

    it('comes back from its plan whole', () => {
      const plan = { interjection: 'HEY', subject: { concept: 'CAT' }, verbPhrase: { verb: 'EAT' } } as PhrasePlan;
      const byId = new Map([HEY, CAT, EAT].map((c) => [c.id, c]));
      const back = planToWorkspace(plan, (id) => byId.get(id));
      expect(back.unsupported).toEqual([]);
      expect(back.containers[0]!.selection.interjection?.id).toBe('HEY');
      // A linked clause's is one the engine never speaks, so it is said to be left out.
      const linked = planToWorkspace({ ...plan, interjection: undefined, coordination: { conjunction: 'and', clause: plan } } as PhrasePlan, (id) => byId.get(id));
      expect(linked.unsupported).toEqual(['PhrasePlan.interjection of a linked clause or a citation']);
    });
  });
});

// P11-E8: the vocative is the root period's, and not a linked clause's, a citation's or an
// instruction's; the engine says it bare, and calls the hearer alone.
describe('the vocative', () => {
  const MOM = { id: 'MOM', role: 'noun' as const, description: 'mom', label: 'mom' };
  const DAD = { id: 'DAD', role: 'noun' as const, description: 'dad', label: 'dad' };
  const YOU = { id: 'SECOND_PERSON', role: 'pronoun' as const, description: 'you', label: 'you', person: '2' as const };
  const ME = { id: 'FIRST_PERSON', role: 'pronoun' as const, description: 'I', label: 'I', person: '1' as const };
  const RUN = { id: 'RUN', role: 'verb' as const, description: 'run', label: 'run', transitivity: 'intransitive' as const };

  it('is written on the root period, as its address', () => {
    const [{ plan }] = workspaceToPlans([period('p', { vocative: MOM, subject: CAT, verb: RUN })], []);
    expect(plan.address).toEqual(expect.objectContaining({ concept: 'MOM' }));
    // Not the subject, not even a command's (P11-E3 D4).
    expect(plan.subject).toEqual(expect.objectContaining({ concept: 'CAT' }));
    const [{ plan: command }] = workspaceToPlans([period('p', { vocative: MOM, verb: RUN, imperative: true })], []);
    expect(command.address).toEqual(expect.objectContaining({ concept: 'MOM' }));
    expect(command.subject).toEqual(expect.objectContaining({ concept: 'SECOND_PERSON' }));
  });

  it('is a group, "Mom and Dad"', () => {
    const [{ plan }] = workspaceToPlans(
      [period('p', { vocative: MOM, vocativeConjuncts: [{ subject: DAD }], verb: RUN, imperative: true, imperativePerson: '2pl' })],
      [],
    );
    expect(plan.address).toEqual({ conjunction: 'and', conjuncts: [expect.objectContaining({ concept: 'MOM' }), expect.objectContaining({ concept: 'DAD' })] });
  });

  // P11-E9 × E8: "my wife, run" — the address's owner is a pronoun, written as one, and a pointer
  // from it at the subject stays a copy: the address is outside every clause (P11-E7's gate).
  it('takes a pronoun owner, "my wife, run", and keeps a pointer at the subject a copy', () => {
    const WIFE = { id: 'WIFE', role: 'noun' as const, description: 'wife', label: 'wife', animate: true, human: true };
    const [{ plan }] = workspaceToPlans([period('p', { vocative: WIFE, vocativePossessor: { subject: ME }, verb: RUN, imperative: true })], []);
    expect(plan.address).toEqual(expect.objectContaining({ concept: 'WIFE', possessor: expect.objectContaining({ kind: 'pronominal', person: '1', number: 'singular' }) }));
    const [{ plan: pointed }] = workspaceToPlans([period('p', { vocative: WIFE, vocativePossessorRef: 'subject', subject: CAT, verb: RUN })], []);
    expect(JSON.stringify(pointed.address)).not.toContain('coreferent');
  });

  it.each<[string, PhraseLink]>([
    ['a coordination’s second clause', coordinative('l', 'main', 'voc')],
    ['a condition', conditional('l', 'main', 'voc')],
  ])('is left out of %s', (_, link) => {
    const [{ plan }] = workspaceToPlans(
      [period('main', { subject: DOG, verb: SLEEP }), period('voc', { vocative: MOM, subject: CAT, verb: RUN })],
      [link],
    );
    expect(plan.address).toBeUndefined();
    expect(JSON.stringify(plan)).not.toContain('"MOM"');
  });

  it('is left out of a relative clause’s period', () => {
    const [{ plan }] = workspaceToPlans(
      [period('main', { subject: DOG, verb: SLEEP }), period('rel', { vocative: MOM, subject: DOG, verb: EAT })],
      [relative('r', ['main', 'subject'], ['rel', 'subject'])],
    );
    expect(plan.address).toBeUndefined();
    expect(JSON.stringify(plan)).not.toContain('"MOM"');
  });

  it.each<[string, Record<string, unknown>]>([
    ['the infinitive: a citation calls no one', { infinitive: true }],
    ['an instruction, which addresses nobody (A338)', { imperative: true, imperativeRegister: 'instruction' }],
  ])('is left out under %s', (_, mood) => {
    const [{ plan }] = workspaceToPlans([period('p', { vocative: MOM, verb: RUN, ...mood })], []);
    expect(plan.address).toBeUndefined();
  });

  it('takes the 2nd person, and never lets another person reach the plan', () => {
    const [{ plan: you }] = workspaceToPlans([period('p', { vocative: YOU, vocativeNumber: 'plural', verb: RUN, imperative: true })], []);
    expect(you.address).toEqual(expect.objectContaining({ concept: 'SECOND_PERSON', number: 'plural' }));
    const [{ plan: me }] = workspaceToPlans([period('p', { vocative: ME, verb: RUN, imperative: true })], []);
    expect(me.address).toBeUndefined();
    const [{ plan: group }] = workspaceToPlans([period('p', { vocative: MOM, vocativeConjuncts: [{ subject: ME }], verb: RUN, imperative: true })], []);
    expect(group.address).toBeUndefined();
  });

  it('heads a relative clause, "Cat that runs, eat."', () => {
    const [{ plan }] = workspaceToPlans(
      [period('main', { vocative: CAT, verb: EAT, imperative: true }), period('rel', { subject: CAT, verb: RUN })],
      [relative('r', ['main', 'vocative'], ['rel', 'subject'])],
    );
    expect((plan.address as NounPhrase).relative).toEqual(expect.objectContaining({ headRole: 'subject' }));
  });

  it('comes back from its plan whole: the four columns of the ticket', () => {
    const byId = new Map([MOM, DAD, CAT, RUN, YOU].map((c) => [c.id, c]));
    const subject = { concept: 'SECOND_PERSON', number: 'singular' };
    const plans = [
      { imperative: true, subject, verbPhrase: { verb: 'RUN' }, address: { concept: 'MOM' } },
      { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' }, address: { concept: 'MOM' } },
      { interrogative: true, subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' }, address: { concept: 'MOM' } },
      { imperative: true, subject: { ...subject, number: 'plural' }, verbPhrase: { verb: 'RUN' }, address: { conjunction: 'and', conjuncts: [{ concept: 'MOM' }, { concept: 'DAD' }] } },
    ] as PhrasePlan[];
    for (const plan of plans) {
      const back = planToWorkspace(plan, (id) => byId.get(id));
      expect(back.unsupported).toEqual([]);
      expect(back.containers[0]!.selection.vocative?.id).toBe('MOM');
      const [{ plan: again }] = workspaceToPlans(back.containers, back.links);
      expect(again.address).toMatchObject(plan.address!);
    }
  });

  it('is said to be left out where the canvas would not say it', () => {
    const byId = new Map([MOM, CAT, RUN].map((c) => [c.id, c]));
    const base = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' } };
    // A coreferent possessor inside it (P11-E2), which the engine refuses there.
    const coref = planToWorkspace({ ...base, address: { concept: 'MOM', possessor: { kind: 'coreferent', slot: 'subject' } } } as PhrasePlan, (id) => byId.get(id));
    expect(coref.unsupported).toEqual(['Possessor.coreferent where the builder copies']);
    // A linked clause's, and a determiner the engine never says.
    const linked = planToWorkspace({ ...base, coordination: { conjunction: 'and', clause: { ...base, address: { concept: 'MOM' } } } } as PhrasePlan, (id) => byId.get(id));
    expect(linked.unsupported).toEqual(['PhrasePlan.address of a linked clause, a citation or an instruction']);
    const determiner = planToWorkspace({ ...base, address: { concept: 'MOM', definiteness: 'indefinite' } } as PhrasePlan, (id) => byId.get(id));
    expect(determiner.unsupported).toEqual(['PhrasePlan.address.definiteness']);
  });
});
