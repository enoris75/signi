import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { NounKey, PhraseSelection } from '../src/components/PhraseBuilder/interfaces.ts';
import {
  applyClear,
  applyConceptSelect,
  nounSliceAt,
  removePossessor,
  updateNounAt,
} from '../src/components/PhraseBuilder/phraseReducers.ts';
import * as R from '../src/components/PhraseBuilder/phraseReducers.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const BOOK = noun('BOOK');
const CAT = noun('CAT');
const DOG = noun('DOG');
const BOY = noun('BOY');
const HOUSE = noun('HOUSE');
const WOOD = noun('WOOD');
const BIG: Concept = { id: 'BIG', role: 'adjective', description: 'BIG', label: 'big' };
const RED: Concept = { id: 'RED', role: 'adjective', description: 'RED', label: 'red' };
const HAPPY: Concept = { id: 'HAPPY', role: 'adjective', description: 'HAPPY', label: 'happy' };
const SHE: Concept = { id: 'SHE', role: 'pronoun', description: 'SHE', label: 'she', person: '3' };
const SEE: Concept = { id: 'SEE', role: 'verb', description: 'SEE', label: 'see', transitivity: 'transitive' };
const SLEEP: Concept = { id: 'SLEEP', role: 'verb', description: 'SLEEP', label: 'sleep', transitivity: 'intransitive' };
const GO: Concept = { id: 'GO', role: 'verb', description: 'GO', label: 'go', complements: ['locative', 'cause'] };
const CRY: Concept = { id: 'CRY', role: 'verb', description: 'CRY', label: 'cry', complements: ['cause'] };
const WANT: Concept = { id: 'WANT', role: 'verb', description: 'WANT', label: 'want', modal: true };
const NEVER: Concept = { id: 'NEVER', role: 'adverb', description: 'NEVER', label: 'never' };

const SETTING_MAPS = ['adjectiveDegrees', 'modifierRelations', 'modifierNumbers', 'modifierAdjectives'] as const;

// A noun block holding everything it can: number, gender, determiner, an adjective with a degree and
// a noun-modifier with its relation, number and own adjective, both kinds of possessor (the UI keeps
// them exclusive; the reducers owe it to neither), and a conjunct joined by "or".
function fullNoun(which: NounKey): PhraseSelection {
  return {
    [which]: CAT,
    [`${which}Number`]: 'plural',
    [`${which}Gender`]: 'fem',
    [`${which}Definiteness`]: 'indefinite',
    [`${which}Adjective`]: BIG,
    [`${which}Adjective2`]: WOOD,
    [`${which}Possessor`]: { subject: DOG },
    [`${which}PossessorRef`]: 'subject',
    [`${which}Conjuncts`]: [{ subject: BOY }],
    [`${which}Conjunction`]: 'or',
    // Only the predicate adjective carries a degree under its head's own key.
    adjectiveDegrees: { [`${which}Adjective`]: 'most', ...(which === 'predicative' && { predicative: 'more' }) },
    modifierRelations: { [`${which}Adjective2`]: 'material' },
    modifierNumbers: { [`${which}Adjective2`]: 'plural' },
    modifierAdjectives: { [`${which}Adjective2`]: RED },
  } as PhraseSelection;
}

// Several parts of one period, their keyed setting maps merged rather than overwritten.
function merge(...parts: PhraseSelection[]): PhraseSelection {
  const merged: PhraseSelection = Object.assign({}, ...parts);
  for (const name of SETTING_MAPS) {
    const map = Object.assign({}, ...parts.map((part) => part[name] ?? {}));
    if (Object.keys(map).length) Object.assign(merged, { [name]: map });
  }
  return merged;
}

// "the book of the cat of the dog, and the boy's …": an owner's owner, and a conjunct's owner.
const PERIOD: PhraseSelection = {
  subject: BOOK,
  subjectPossessor: { subject: CAT, subjectPossessor: { subject: DOG } },
  subjectConjuncts: [{ subject: BOY, subjectPossessorRef: 'subject' }],
};

describe('applyConceptSelect', () => {
  const HE: Concept = { id: 'HE', role: 'pronoun', description: 'HE', label: 'he', person: '3' };

  it.each<NounKey>(['subject', 'directObject'])(
    'seeds a pronoun %s’s number and gender when the picker decided neither',
    (which) => {
      expect(applyConceptSelect({ [`${which}Gender`]: 'fem' }, which, HE)).toMatchObject({
        [which]: HE,
        [`${which}Number`]: 'singular',
        [`${which}Gender`]: 'fem',
      });
    },
  );

  it('takes the number and gender the picker decided alongside the word over the defaults', () => {
    expect(applyConceptSelect({}, 'subject', HE, { number: 'plural', gender: 'neut' })).toMatchObject({
      subject: HE,
      subjectNumber: 'plural',
      subjectGender: 'neut',
    });
  });

  it('sets them on the slot picked into', () => {
    const next = applyConceptSelect({ subject: CAT }, 'directObject', DOG, { number: 'plural' });

    expect(next).toMatchObject({ subject: CAT, directObject: DOG, directObjectNumber: 'plural' });
    expect(next).not.toHaveProperty('subjectNumber');
  });

  describe('a new verb', () => {
    it('drops the object, with everything it held, when the verb takes none', () => {
      expect(applyConceptSelect(merge({ verb: SEE }, fullNoun('directObject')), 'verb', SLEEP)).toEqual({
        verb: SLEEP,
      });
    });

    it('drops a complement it no longer licenses, with everything it held, and keeps the one it does', () => {
      const prev = merge(
        { verb: GO, subject: CAT },
        fullNoun('locative'),
        { locativeSpecifier: 'under' },
        fullNoun('cause'),
        { causeSentiment: 'negative' },
      );

      expect(applyConceptSelect(prev, 'verb', CRY)).toEqual(
        merge({ verb: CRY, subject: CAT }, fullNoun('cause'), { causeSentiment: 'negative' }),
      );
    });
  });

  describe('a head that is no noun', () => {
    it.each<[string, NounKey, Concept]>([
      ['a pronoun subject', 'subject', SHE],
      ['a pronoun object', 'directObject', SHE],
      ['a pronoun cause', 'cause', SHE],
      ['a predicate adjective', 'predicative', HAPPY],
    ])('takes %s without a determiner or a possessor of either kind', (_, which, head) => {
      const next = applyConceptSelect(fullNoun(which), which, head);

      expect(next).not.toHaveProperty(`${which}Definiteness`);
      expect(next).not.toHaveProperty(`${which}Possessor`);
      expect(next).not.toHaveProperty(`${which}PossessorRef`);
      // Pronouns and predicate adjectives coordinate ("you and I", "happy or tired").
      expect(next).toHaveProperty(`${which}Conjuncts`);
    });
  });

  it('keeps a noun’s determiner, possessor and conjuncts when only its word is replaced, but not its adjectives', () => {
    const next = applyConceptSelect(merge({ verb: SEE }, fullNoun('directObject')), 'directObject', HOUSE);

    expect(next).toMatchObject({
      directObject: HOUSE,
      directObjectDefiniteness: 'indefinite',
      directObjectPossessor: { subject: DOG },
      directObjectConjuncts: [{ subject: BOY }],
    });
    expect(next).not.toHaveProperty('directObjectAdjective');
    for (const name of SETTING_MAPS) expect(next).not.toHaveProperty(name);
  });
});

describe('applyClear', () => {
  // A modal's polarity control rides the modal's box, so it cannot outlive the word it denied.
  it('takes a modal’s own adverb and polarity with the modal', () => {
    const prev: PhraseSelection = {
      verb: SEE,
      verbModal: WANT,
      verbModalAdverb: NEVER,
      verbModalNegative: true,
    };
    expect(applyClear(prev, 'verbModal')).toEqual({ verb: SEE });
  });

  it.each<NounKey>(['subject', 'directObject', 'predicative', 'locative', 'cause'])(
    'leaves nothing of the %s’s block behind, and every other block’s settings in place',
    (which) => {
      const other = which === 'subject' ? 'directObjectAdjective' : 'subjectAdjective';
      const prev = merge({ verb: SEE }, fullNoun(which), { adjectiveDegrees: { [other]: 'less' } });

      expect(applyClear(prev, which)).toEqual({ verb: SEE, adjectiveDegrees: { [other]: 'less' } });
    },
  );

  it.each<[NounKey, PhraseSelection]>([
    ['route', { routeSpecifier: 'under' }],
    ['locative', { locativeSpecifier: 'behind' }],
    ['cause', { causeSentiment: 'negative' }],
    ['cause', { causeNegative: true }],
  ])('drops the %s’s relation along with it', (which, relation) => {
    expect(applyClear(merge({ verb: GO }, fullNoun(which), relation), which)).toEqual({ verb: GO });
  });

  it('lets the next noun placed in a cleared block start from the defaults', () => {
    const cleared = applyClear(merge({ verb: SEE }, fullNoun('directObject')), 'directObject');

    expect(applyConceptSelect(cleared, 'directObject', HOUSE)).toEqual({ verb: SEE, directObject: HOUSE });
  });

  it('drops the object and every complement with the verb, keeping the subject’s head and settings', () => {
    const subject: PhraseSelection = { subject: CAT, subjectNumber: 'plural', subjectDefiniteness: 'bare' };
    const prev = merge(
      { verb: GO },
      subject,
      fullNoun('directObject'),
      fullNoun('locative'),
      { locativeSpecifier: 'under' },
      fullNoun('cause'),
    );

    expect(applyClear(prev, 'verb')).toEqual(subject);
  });

  it('drops a cleared adjective’s settings and those of the adjectives chained after it', () => {
    const prev: PhraseSelection = {
      subject: CAT,
      subjectAdjective: BIG,
      subjectAdjective2: WOOD,
      subjectAdjective3: RED,
      adjectiveDegrees: { subjectAdjective: 'more', subjectAdjective3: 'most' },
      modifierRelations: { subjectAdjective2: 'material' },
    };

    expect(applyClear(prev, 'subjectAdjective2')).toEqual({
      subject: CAT,
      subjectAdjective: BIG,
      adjectiveDegrees: { subjectAdjective: 'more' },
    });
  });

  it('leaves the selection it was handed untouched', () => {
    const prev = merge({ verb: SEE }, fullNoun('directObject'));
    const before = structuredClone(prev);

    applyClear(prev, 'directObject');
    applyClear(prev, 'verb');
    applyConceptSelect(prev, 'verb', SLEEP);

    expect(prev).toEqual(before);
  });
});

describe('nounSliceAt', () => {
  it('finds the slice holding a noun at any depth, and its key there', () => {
    expect(nounSliceAt(PERIOD, 'subject')).toEqual({ slice: PERIOD, which: 'subject' });
    expect(nounSliceAt(PERIOD, 'subject/possessor/possessor')).toEqual({
      slice: { subject: DOG },
      which: 'subject',
    });
    expect(nounSliceAt(PERIOD, 'subject/conjunct/0')?.slice.subject).toBe(BOY);
  });

  it('finds nothing where a step is missing', () => {
    expect(nounSliceAt(PERIOD, 'directObject/possessor')).toBeUndefined();
    expect(nounSliceAt(PERIOD, 'subject/conjunct/3')).toBeUndefined();
    expect(nounSliceAt(PERIOD, 'subject/relative')).toBeUndefined();
  });
});

// A noun's examples (P09-E48): a nested phrase at `…/examples`, and its relation.
describe('the examples', () => {
  const NAMED: PhraseSelection = { subject: HOUSE, subjectExamples: { subject: DOG } };

  it('are a slice of their own at their address, seeded the first time they are written', () => {
    expect(nounSliceAt(NAMED, 'subject/examples')).toEqual({ slice: { subject: DOG }, which: 'subject' });
    expect(updateNounAt({ subject: HOUSE }, 'subject/examples', (slice) => ({ ...slice, subject: CAT }))).toEqual({
      subject: HOUSE,
      subjectExamples: { subject: CAT },
    });
    expect(R.updateExamples({ subject: HOUSE }, 'subject', (p) => p)).toEqual({ subject: HOUSE, subjectExamples: {} });
  });

  it('flip between such as and including, the default left unstored', () => {
    const inclusion = R.toggleExampleRelation(NAMED, 'subject');
    expect(inclusion.exampleRelations).toEqual({ subject: 'inclusion' });
    expect(R.toggleExampleRelation(inclusion, 'subject')).not.toHaveProperty('exampleRelations');
    expect(R.setExampleRelation(NAMED, 'subject', 'inclusion').exampleRelations).toEqual({ subject: 'inclusion' });
  });

  it('go with removeExamples, with their noun, and when a pronoun takes its place', () => {
    const inclusion = R.setExampleRelation(NAMED, 'subject', 'inclusion');
    expect(R.removeExamples(inclusion, 'subject')).toEqual({ subject: HOUSE });
    expect(applyClear(inclusion, 'subject')).not.toHaveProperty('subjectExamples');
    expect(applyConceptSelect(inclusion, 'subject', SHE)).not.toHaveProperty('subjectExamples');
    expect(applyConceptSelect(inclusion, 'subject', SHE)).not.toHaveProperty('exampleRelations');
    // Another noun keeps them.
    expect(applyConceptSelect(inclusion, 'subject', DOG).subjectExamples).toEqual({ subject: DOG });
  });
});

// The predicate adjective's standard of comparison (P09-E12 D5): a nested phrase at `…/standard`.
describe('the standard of comparison', () => {
  const COMPARED: PhraseSelection = { verb: GO, predicative: BIG, adjectiveDegrees: { predicative: 'more' }, predicativeStandard: { subject: DOG } };

  it('is a slice of its own at its address, seeded the first time it is written', () => {
    expect(nounSliceAt(COMPARED, 'predicative/standard')).toEqual({ slice: { subject: DOG }, which: 'subject' });
    expect(updateNounAt({ predicative: BIG }, 'predicative/standard', (slice) => ({ ...slice, subject: CAT }))).toEqual({
      predicative: BIG,
      predicativeStandard: { subject: CAT },
    });
    expect(R.removeStandard(COMPARED, 'predicative')).not.toHaveProperty('predicativeStandard');
  });

  // P09-E50 D3: a noun takes one too, through its compared adjective, so the head swap keeps it
  // ("bigger than the dog" → "a bigger house than the dog"); a pronoun takes none.
  it('passes to another adjective and to a noun, and goes with a pronoun or with the predicative itself', () => {
    expect(applyConceptSelect(COMPARED, 'predicative', RED).predicativeStandard).toEqual({ subject: DOG });
    expect(applyConceptSelect(COMPARED, 'predicative', HOUSE).predicativeStandard).toEqual({ subject: DOG });
    expect(applyConceptSelect(applyConceptSelect(COMPARED, 'predicative', HOUSE), 'predicative', RED).predicativeStandard).toEqual({ subject: DOG });
    expect(applyConceptSelect(COMPARED, 'predicative', SHE)).not.toHaveProperty('predicativeStandard');
    expect(applyClear(COMPARED, 'predicative')).not.toHaveProperty('predicativeStandard');
  });

  it('is kept on a period noun until its noun goes or a pronoun takes its place', () => {
    const OBJ: PhraseSelection = { directObject: HOUSE, directObjectAdjective: RED, directObjectStandard: { subject: DOG } };
    expect(applyConceptSelect(OBJ, 'directObject', DOG).directObjectStandard).toEqual({ subject: DOG });
    expect(applyClear(OBJ, 'directObjectAdjective').directObjectStandard).toEqual({ subject: DOG });
    expect(applyConceptSelect(OBJ, 'directObject', SHE)).not.toHaveProperty('directObjectStandard');
    expect(applyClear(OBJ, 'directObject')).not.toHaveProperty('directObjectStandard');
    expect(applyConceptSelect({ subject: HOUSE, subjectStandard: { subject: DOG } }, 'subject', SHE)).not.toHaveProperty('subjectStandard');
  });

  it('outlives a degree that takes none', () => {
    expect(R.setDegree(COMPARED, 'predicative', 'positive').predicativeStandard).toEqual({ subject: DOG });
  });
});

describe('updateNounAt', () => {
  it('edits the slice holding a deep noun, leaving the rest of the period as it was', () => {
    const next = updateNounAt(PERIOD, 'subject/possessor/possessor', (slice, which) =>
      removePossessor({ ...slice, [`${which}Number`]: 'plural' }, which),
    );

    expect(next).toEqual({
      ...PERIOD,
      subjectPossessor: { subject: CAT, subjectPossessor: { subject: DOG, subjectNumber: 'plural' } },
    });
    expect(next.subjectConjuncts).toBe(PERIOD.subjectConjuncts);
  });

  it('edits a conjunct’s slice, and seeds an owner’s the first time it is written', () => {
    const next = updateNounAt(PERIOD, 'subject/conjunct/0/possessor', (slice) => ({ ...slice, subject: DOG }));

    expect(next.subjectConjuncts).toEqual([
      { subject: BOY, subjectPossessor: { subject: DOG } },
    ]);
  });

  it('edits the period itself for a period noun', () => {
    expect(updateNounAt(PERIOD, 'subject', (slice, which) => removePossessor(slice, which))).toEqual({
      subject: BOOK,
      subjectConjuncts: PERIOD.subjectConjuncts,
    });
  });
});

// The cause's own polarity: it denies the reason, not the clause, so the verb is untouched.
describe('toggleCauseNegative', () => {
  it('denies the cause and takes it back, leaving the clause positive', () => {
    const s: PhraseSelection = { subject: CAT, verb: CRY, cause: DOG };
    const denied = R.toggleCauseNegative(s);
    expect(denied).toMatchObject({ causeNegative: true });
    expect(denied.verbNegative).toBeUndefined();
    expect(R.toggleCauseNegative(denied).causeNegative).toBe(false);
  });

  it('is independent of the stance beside it', () => {
    const credited = R.setSentiment({ verb: CRY, cause: DOG }, 'positive');
    expect(R.toggleCauseNegative(credited)).toMatchObject({ causeSentiment: 'positive', causeNegative: true });
  });
});

describe('the set-value reducers', () => {
  it('set a value outright, whatever was there', () => {
    const s: PhraseSelection = { subject: CAT, verb: SEE };
    expect(R.setNumber(R.setNumber(s, 'subject', 'plural'), 'subject', 'plural').subjectNumber).toBe('plural');
    expect(R.setTense(s, 'future').verbTense).toBe('future');
    expect(R.setAspect(s, 'resultative').verbAspect).toBe('resultative');
    expect(R.setNegative(R.setNegative(s, true), true).verbNegative).toBe(true);
    expect(R.setCauseNegative(R.setCauseNegative(s, true), true).causeNegative).toBe(true);
    expect(R.setDegree(s, 'subjectAdjective', 'most').adjectiveDegrees).toEqual({ subjectAdjective: 'most' });
    expect(R.setModifierRelation(s, 'subjectAdjective', 'material').modifierRelations).toEqual({ subjectAdjective: 'material' });
    expect(R.setModifierNumber(s, 'subjectAdjective', 'plural').modifierNumbers).toEqual({ subjectAdjective: 'plural' });
    expect(R.setNounConjunction(s, 'subject', 'or').subjectConjunction).toBe('or');
  });

  // Polarity is per word of the verb group (A03): the field names which word is denied, and the
  // verb's own is the default the canvas and the console both leave unwritten.
  it('deny one word of the verb group each, by field', () => {
    const s: PhraseSelection = { verb: SEE, verbModal: WANT };
    expect(R.setNegative(s, true)).toMatchObject({ verbNegative: true });
    expect(R.setNegative(s, true, 'verbModalNegative')).toMatchObject({ verbModalNegative: true });
    expect(R.setNegative(s, true, 'verbModalNegative').verbNegative).toBeUndefined();
    expect(R.toggleNegative(R.setNegative(s, true, 'verbModalNegative'), 'verbModalNegative').verbModalNegative).toBe(false);
    // Both at once is an ordinary phrase: "I do not want to not see".
    expect(R.setNegative(R.setNegative(s, true), true, 'verbModalNegative')).toMatchObject({
      verbNegative: true,
      verbModalNegative: true,
    });
  });

  it('change nothing when the mood asked for is the mood there is', () => {
    const command = R.setImperative({ verb: SEE, verbTense: 'past' }, true);
    expect(command).toMatchObject({ imperative: true, verbTense: 'present' });
    expect(R.setImperative(command, true)).toBe(command);
    expect(R.setInfinitive(command, true)).toMatchObject({ infinitive: true, imperative: false });
    expect(R.setInfinitive({}, false)).toEqual({});
  });

  // The question, the third mood (P09-E12 M5): exclusive with the other two, forcing nothing else.
  it('make a period a question, and a command or a citation stops being one', () => {
    const past: PhraseSelection = { subject: CAT, verb: SEE, verbTense: 'past', verbModal: WANT };
    const question = R.setInterrogative(past, true);
    expect(question).toMatchObject({ interrogative: true, verbTense: 'past', verbModal: WANT });
    expect(R.setInterrogative(question, true)).toBe(question);
    expect(R.setInterrogative(R.setImperative(past, true), true)).toMatchObject({ interrogative: true, imperative: false });
    expect(R.setInterrogative(R.setInfinitive(past, true), true)).toMatchObject({ interrogative: true, infinitive: false });
    expect(R.setImperative(question, true)).toMatchObject({ imperative: true, interrogative: false });
    expect(R.setInfinitive(question, true)).toMatchObject({ infinitive: true, interrogative: false });
    // A statement's mood change leaves no question fields behind.
    expect(R.setImperative(past, true)).not.toHaveProperty('interrogative');
    expect(R.toggleInterrogative(R.toggleInterrogative(past)).interrogative).toBe(false);
  });

  // The slot a wh-question asks about (P09-E12 M6): one per period, making it a question.
  it('mark one slot a question asks about, and turning the question off clears it', () => {
    const s: PhraseSelection = { subject: CAT, verb: SEE, directObject: BOY };
    const what = R.setQuestionRole(s, 'directObject');
    expect(what).toMatchObject({ interrogative: true, questionRole: 'directObject' });
    const who = R.setQuestionAnimate(what, true);
    // Moving the mark takes the who / what chosen for the old slot with it.
    expect(R.setQuestionRole(who, 'subject')).toMatchObject({ questionRole: 'subject', questionAnimate: undefined });
    // Unmarking takes the question with it: no yes/no is left behind.
    expect(R.toggleQuestionRole(who, 'directObject')).toMatchObject({ interrogative: false, questionRole: undefined, questionAnimate: undefined });
    expect(R.setInterrogative(who, false)).toMatchObject({ interrogative: false, questionRole: undefined, questionAnimate: undefined });
    expect(R.setImperative(who, true)).toMatchObject({ questionRole: undefined });
    // Marking a slot ends an existential; an existential unmarks the slot.
    expect(R.setQuestionRole({ ...s, existential: true }, 'subject').existential).toBe(false);
    expect(R.setExistential(who, true)).toMatchObject({ existential: true, interrogative: true, questionRole: undefined });
  });

  it('flip a subject or object question between who and what, from the held word’s default', () => {
    const MAN: Concept = { ...noun('MAN'), human: true };
    const asked = R.setQuestionRole({ subject: MAN, verb: SEE }, 'subject');
    expect(R.toggleQuestionAnimate(asked).questionAnimate).toBe(false);
    expect(R.toggleQuestionAnimate(R.setQuestionRole({ subject: CAT, verb: SEE }, 'subject')).questionAnimate).toBe(true);
    expect(R.toggleExistential(R.toggleExistential({ subject: CAT })).existential).toBe(false);
  });

  it('are what the toggles and cycles feed the next value', () => {
    const s: PhraseSelection = { subject: SHE };
    expect(R.toggleGender(R.toggleGender(s, 'subject'), 'subject').subjectGender).toBe('neut');
    expect(R.gendersOf(s, 'subject')).toEqual(['masc', 'fem', 'neut']);
    expect(R.gendersOf({ subject: CAT }, 'subject')).toEqual(['masc', 'fem']);
  });
});

describe('a noun replacing a pronoun', () => {
  it('leaves the neuter a 3rd-person pronoun had, since no noun control offers it', () => {
    const it_: Concept = { ...SHE, id: 'IT' };
    const withIt = applyConceptSelect({ subjectGender: 'neut' }, 'subject', it_);
    const gendered: Concept = { ...CAT, gendered: true };
    expect(applyConceptSelect(withIt, 'subject', gendered).subjectGender).toBe('masc');
    expect(applyConceptSelect({ directObjectGender: 'neut' }, 'directObject', gendered).directObjectGender).toBe('masc');
    expect(applyConceptSelect({ locativeGender: 'neut' }, 'locative', gendered).locativeGender).toBe('masc');
    expect(applyConceptSelect({ subjectGender: 'fem' }, 'subject', gendered).subjectGender).toBe('fem');
  });
});

// A possessor that points at a conjunct names it by position; when a conjunct goes, the ones after it
// move up, so a reference to it or past it would name another noun — its own, even ("the house and
// its food" turned "the food's food"). It is dropped, as the relative links sourced there are.
describe('removeConjunct', () => {
  const group: PhraseSelection = {
    subject: HOUSE,
    subjectConjuncts: [{ subject: BOOK }, { subject: DOG, subjectPossessorRef: 'subject/conjunct/0' }],
    directObject: CAT,
    directObjectPossessorRef: 'subject/conjunct/1',
  };

  it('drops the possessors that pointed at the conjunct removed or at one after it', () => {
    const next = R.removeConjunct(group, 'subject', 0);
    expect(next.subjectConjuncts).toEqual([{ subject: DOG }]);
    expect(next).not.toHaveProperty('directObjectPossessorRef');
  });

  it('keeps a possessor that points before the conjunct removed', () => {
    const next = R.removeConjunct(group, 'subject', 1);
    expect(next.subjectConjuncts).toEqual([{ subject: BOOK }]);
    expect(R.removeConjunct({ ...group, directObjectPossessorRef: 'subject' }, 'subject', 0).directObjectPossessorRef).toBe('subject');
  });
});

// P13: a verbless period's subject reads as an adjective's or an adverb's definition.
describe('the subject’s reading', () => {
  it('cycles none → dimension → manner → place → direction → time → none', () => {
    const seen: (string | undefined)[] = [];
    let sel: PhraseSelection = { subject: CAT };
    for (let i = 0; i < 6; i++) {
      sel = R.cycleSubjectGloss(sel);
      seen.push(sel.subjectGloss);
    }
    expect(seen).toEqual(['dimension', 'manner', 'locative', 'direction', 'temporal', undefined]);
    expect(sel).not.toHaveProperty('subjectGloss');
  });

  it('keeps a relation for the time reading alone, and drops the default', () => {
    const until = R.setGlossRelation({ subject: CAT, subjectGloss: 'temporal' }, 'until');
    expect(until.subjectGlossRelation).toBe('until');
    expect(R.setGlossRelation(until, 'at')).not.toHaveProperty('subjectGlossRelation');
    expect(R.setSubjectGloss(until, 'manner')).not.toHaveProperty('subjectGlossRelation');
  });
});

describe('a subject that is no noun any more', () => {
  it('drops its reading, which only a noun phrase has (P13)', () => {
    const me: Concept = { id: 'FIRST_PERSON', role: 'pronoun', description: 'I', person: '1' };
    const next = applyConceptSelect({ subject: CAT, subjectGloss: 'temporal', subjectGlossRelation: 'until' }, 'subject', me);
    expect(next).not.toHaveProperty('subjectGloss');
    expect(next).not.toHaveProperty('subjectGlossRelation');
  });
});

// P13: what a genitive possessor is to its noun — its owner, the whole the noun is a part of, its parts.
describe('the possessor’s role', () => {
  const withOwner: PhraseSelection = { subject: HOUSE, subjectPossessor: { subject: CAT } };

  it('cycles owner → whole → parts → owner, leaving no key at the owner', () => {
    const whole = R.cyclePossessorRole(withOwner, 'subject');
    expect(whole.possessorRoles).toEqual({ subject: 'whole' });
    expect(R.cyclePossessorRole(whole, 'subject').possessorRoles).toEqual({ subject: 'parts' });
    expect(R.cyclePossessorRole(R.cyclePossessorRole(whole, 'subject'), 'subject')).not.toHaveProperty('possessorRoles');
  });

  it('goes with the genitive possessor it describes', () => {
    const whole = R.setPossessorRole(withOwner, 'subject', 'whole');
    expect(R.removePossessor(whole, 'subject')).not.toHaveProperty('possessorRoles');
    expect(R.setPossessorRef(whole, 'subject', 'directObject')).not.toHaveProperty('possessorRoles');
    expect(R.applyClear({ ...whole, directObject: CAT }, 'subject')).not.toHaveProperty('possessorRoles');
  });
});
