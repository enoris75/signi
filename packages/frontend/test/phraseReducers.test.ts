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

describe('the set-value reducers', () => {
  it('set a value outright, whatever was there', () => {
    const s: PhraseSelection = { subject: CAT, verb: SEE };
    expect(R.setNumber(R.setNumber(s, 'subject', 'plural'), 'subject', 'plural').subjectNumber).toBe('plural');
    expect(R.setTense(s, 'future').verbTense).toBe('future');
    expect(R.setAspect(s, 'resultative').verbAspect).toBe('resultative');
    expect(R.setNegative(R.setNegative(s, true), true).verbNegative).toBe(true);
    expect(R.setDegree(s, 'subjectAdjective', 'most').adjectiveDegrees).toEqual({ subjectAdjective: 'most' });
    expect(R.setModifierRelation(s, 'subjectAdjective', 'material').modifierRelations).toEqual({ subjectAdjective: 'material' });
    expect(R.setModifierNumber(s, 'subjectAdjective', 'plural').modifierNumbers).toEqual({ subjectAdjective: 'plural' });
    expect(R.setNounConjunction(s, 'subject', 'or').subjectConjunction).toBe('or');
  });

  it('change nothing when the mood asked for is the mood there is', () => {
    const command = R.setImperative({ verb: SEE, verbTense: 'past' }, true);
    expect(command).toMatchObject({ imperative: true, verbTense: 'present' });
    expect(R.setImperative(command, true)).toBe(command);
    expect(R.setInfinitive(command, true)).toMatchObject({ infinitive: true, imperative: false });
    expect(R.setInfinitive({}, false)).toEqual({});
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
