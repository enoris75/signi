import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  COMPLEMENT_TYPES,
  type ComplementType,
  type Concept,
  type LanguageCode,
  type UiStringKey,
} from '@signi/shared';
import {
  buildSatelliteIcons,
  buildSatellites,
  type Satellite,
} from '../src/components/PhraseBuilder/satellites.tsx';
import type {
  GenderSlot,
  NounKey,
  NumberSlot,
  PhraseSelection,
  WorkspaceBinding,
} from '../src/components/PhraseBuilder/interfaces.ts';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';

const concept = (id: string, role: Concept['role'], extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: `the ${id.toLowerCase()}`,
  label: id.toLowerCase(),
  ...extra,
});

const CAT = concept('CAT', 'noun');
const FRIEND = concept('FRIEND', 'noun', { gendered: true });
const HOUSE = concept('HOUSE', 'noun', { labels: { en: 'house', it: 'casa' } });
const SPEED = concept('SPEED', 'noun', { mannerRelation: 'measure' });
const CARE = concept('CARE', 'noun', { mannerRelation: 'means' });
const BIG = concept('BIG', 'adjective', { labels: { en: 'big', it: 'grande' } });
const RED = concept('RED', 'adjective');
const HAPPY = concept('HAPPY', 'adjective');
const I = concept('I', 'pronoun', { person: '1' });
const SHE = concept('SHE', 'pronoun', { person: '3' });
const SEE = concept('SEE', 'verb', { transitivity: 'transitive' });
const DO = concept('DO', 'verb');
const SLEEP = concept('SLEEP', 'verb', { transitivity: 'intransitive' });
// Licenses every complement, so each one's controls can be exercised.
const GO = concept('GO', 'verb', { transitivity: 'intransitive', complements: COMPLEMENT_TYPES });
const WANT = concept('WANT', 'verb', { modal: true });
const CAN = concept('CAN', 'verb', { modal: true });
const OFTEN = concept('OFTEN', 'adverb', { labels: { en: 'often', it: 'spesso' } });

// Every UI string reads as its own key, so a test sees which string a satellite asked for.
const t = (key: UiStringKey) => `t(${key})`;

function build(
  selection: PhraseSelection,
  revealed: Record<string, boolean> = {},
  language: LanguageCode = 'en',
) {
  return buildSatellites(selection, revealed, language, t);
}

function satellite(
  selection: PhraseSelection,
  key: string,
  revealed: Record<string, boolean> = {},
): Satellite {
  const found = build(selection, revealed).satellites.find((s) => s.key === key);
  if (!found) throw new Error(`no satellite ${key}`);
  return found;
}

// The keys of the satellites offered, optionally only those of one family (by key prefix).
function offered(
  selection: PhraseSelection,
  family = '',
  revealed: Record<string, boolean> = {},
): string[] {
  return build(selection, revealed)
    .satellites.filter((s) => s.available && s.key.startsWith(family))
    .map((s) => s.key);
}

function glyph(icon: ReactNode): string | null {
  const { container } = render(<>{icon}</>);
  return container.querySelector('svg')!.getAttribute('data-testid');
}

describe('buildSatellites', () => {
  it('offers only the verb’s own controls while nothing is chosen', () => {
    expect(offered({})).toEqual([
      'verbNegative',
      'verbTense',
      'verbAspect',
      'verbModal',
      'modifier',
    ]);
  });

  it('gives every satellite a distinct key, each listed in the shown map', () => {
    const { satellites, shownMap } = build({ verb: GO, subject: CAT, directObject: CAT });

    expect(new Set(satellites.map((s) => s.key)).size).toBe(satellites.length);
    expect(shownMap).toEqual(Object.fromEntries(satellites.map((s) => [s.key, s.shown])));
  });

  describe('the subject', () => {
    it('offers an ungendered noun every noun-phrase control but gender', () => {
      expect(offered({ subject: CAT }, 'subject')).toEqual([
        'subjectAdjective',
        'subjectNumber',
        'subjectDefiniteness',
        'subjectRelative',
        'subjectPossessor',
        'subjectConjunct',
      ]);
    });

    it('offers a pronoun only number, gender and coordination', () => {
      expect(offered({ subject: I }, 'subject')).toEqual([
        'subjectNumber',
        'subjectGender',
        'subjectConjunct',
      ]);
    });

    it.each<[string, Concept, boolean]>([
      ['a gendered noun', FRIEND, true],
      ['an ungendered noun', CAT, false],
      ['a pronoun', I, true],
    ])('offers gender to %s: %s', (_, subject, available) => {
      expect(satellite({ subject }, 'subjectGender').available).toBe(available);
    });

    it('chains adjectives, each riding the previous one’s box once that one holds a word', () => {
      expect(offered({ subject: CAT }, 'subjectAdjective')).toEqual(['subjectAdjective']);
      expect(offered({ subject: CAT, subjectAdjective: BIG }, 'subjectAdjective')).toEqual([
        'subjectAdjective',
        'subjectAdjective2',
      ]);
      const twoChosen = { subject: CAT, subjectAdjective: BIG, subjectAdjective2: RED };
      expect(offered(twoChosen, 'subjectAdjective')).toEqual([
        'subjectAdjective',
        'subjectAdjective2',
        'subjectAdjective3',
      ]);

      const { satellites } = build({ subject: CAT });
      const parentOf = (key: string) => satellites.find((s) => s.key === key)!.parent;
      expect(parentOf('subjectAdjective')).toBe('subject');
      expect(parentOf('subjectAdjective2')).toBe('subjectAdjective');
      expect(parentOf('subjectAdjective3')).toBe('subjectAdjective2');
    });

    it('offers no further adjective to a pronoun, even one left over from a noun', () => {
      expect(
        offered({ subject: I, subjectAdjective: BIG, subjectAdjective2: RED }, 'subjectAdjective'),
      ).toEqual([]);
    });
  });

  describe('the verb', () => {
    it('chains modals: the second modal and the first’s adverb ride the first modal’s box', () => {
      expect(offered({ verb: GO }, 'verbModal')).toEqual(['verbModal']);
      expect(offered({ verb: GO, verbModal: WANT }, 'verbModal')).toEqual([
        'verbModal',
        'verbModal2',
        'verbModalAdverb',
      ]);
      expect(offered({ verb: GO, verbModal: WANT, verbModal2: CAN }, 'verbModal')).toEqual([
        'verbModal',
        'verbModal2',
        'verbModalAdverb',
        'verbModal2Adverb',
      ]);

      const { satellites } = build({ verb: GO, verbModal: WANT, verbModal2: CAN });
      const parentOf = (key: string) => satellites.find((s) => s.key === key)!.parent;
      expect(parentOf('verbModal2')).toBe('verbModal');
      expect(parentOf('verbModalAdverb')).toBe('verbModal');
      expect(parentOf('verbModal2Adverb')).toBe('verbModal2');
    });

    describe.each(['imperative', 'infinitive'] as const)('in the %s mood', (mood) => {
      const selection: PhraseSelection = {
        [mood]: true,
        subject: FRIEND,
        subjectAdjective: BIG,
        subjectPossessor: { subject: CAT },
        verb: SEE,
        verbModal: WANT,
        verbModal2: CAN,
        verbTense: 'past',
        directObject: CAT,
      };

      it('withdraws tense, aspect and every modal', () => {
        expect(offered(selection, 'verb')).toEqual(['verbNegative']);
        expect(satellite(selection, 'verbTense').shown).toBe(false);
      });

      it('drops the whole subject family, set or not', () => {
        expect(offered(selection, 'subject')).toEqual([]);
        expect(satellite(selection, 'subjectAdjective').shown).toBe(false);
      });

      it('keeps polarity, the adverb and the direct object', () => {
        const kept = ['verbNegative', 'modifier', 'directObject', 'directObjectAdjective'];
        expect(offered(selection)).toEqual(expect.arrayContaining(kept));
      });
    });
  });

  describe('the direct object', () => {
    it.each<[string, Concept | undefined, boolean]>([
      ['a transitive verb', SEE, true],
      ['a verb of unstated transitivity', DO, true],
      ['an intransitive verb', SLEEP, false],
      ['no verb at all', undefined, false],
    ])('is licensed by %s: %s', (_, verb, available) => {
      expect(satellite({ verb }, 'directObject').available).toBe(available);
    });

    it('is on the canvas before a word is chosen, and folds away when its control says so', () => {
      expect(satellite({ verb: SEE }, 'directObject')).toMatchObject({
        hasValue: false,
        shown: true,
      });
      expect(satellite({ verb: SEE }, 'directObject', { directObject: false }).shown).toBe(false);
    });

    it('carries the same noun family as the subject', () => {
      expect(offered({ verb: SEE, directObject: FRIEND }, 'directObject')).toEqual([
        'directObject',
        'directObjectAdjective',
        'directObjectNumber',
        'directObjectGender',
        'directObjectDefiniteness',
        'directObjectRelative',
        'directObjectPossessor',
        'directObjectConjunct',
      ]);
      const ungendered = satellite({ verb: SEE, directObject: CAT }, 'directObjectGender');
      expect(ungendered.available).toBe(false);
    });

    it('chains its adjectives like the subject’s', () => {
      const selection = { verb: SEE, directObject: CAT, directObjectAdjective: BIG };
      expect(offered(selection, 'directObjectAdjective')).toEqual([
        'directObjectAdjective',
        'directObjectAdjective2',
      ]);
      expect(
        offered({ ...selection, directObjectAdjective2: RED }, 'directObjectAdjective'),
      ).toEqual(['directObjectAdjective', 'directObjectAdjective2', 'directObjectAdjective3']);
    });

    it('takes its whole family along when folded away', () => {
      const selection: PhraseSelection = {
        verb: SEE,
        directObject: FRIEND,
        directObjectAdjective: BIG,
        directObjectNumber: 'plural',
      };
      const { satellites } = build(selection, { directObject: false });

      expect(offered(selection, 'directObject', { directObject: false })).toEqual(['directObject']);
      expect(satellites.filter((s) => s.shown).map((s) => s.key)).not.toContain(
        'directObjectAdjective',
      );
    });

    it('withdraws a lingering object and its family once the verb is intransitive', () => {
      const selection = { verb: SLEEP, directObject: CAT, directObjectAdjective: BIG };

      expect(offered(selection, 'directObject')).toEqual([]);
    });
  });

  describe('complements', () => {
    it('offers a toggle only for the complements the verb licenses', () => {
      const verb = concept('PUT', 'verb', { complements: ['cause', 'locative'] });
      const toggles = offered({ verb }).filter((key) =>
        (COMPLEMENT_TYPES as string[]).includes(key),
      );

      expect(toggles).toEqual(['locative', 'cause']);
    });

    it.each<[ComplementType, string]>([
      ['predicative', 't(slot.predicative)'],
      ['manner', 't(slot.manner)'],
      ['instrumental', 't(slot.instrumental)'],
      ['locative', 'Locative'],
      ['terminus', 'Terminus'],
    ])('names the %s toggle %s', (type, label) => {
      expect(satellite({ verb: GO }, type).label).toBe(label);
    });

    it('treats the instrumental as a link that holds no value and carries no controls', () => {
      const { satellites } = build({ verb: GO });

      expect(satellites.find((s) => s.key === 'instrumental')).toMatchObject({
        available: true,
        hasValue: false,
        shown: false,
      });
      const keys = satellites.map((s) => s.key);
      expect(keys.filter((key) => key.startsWith('instrumental'))).toEqual(['instrumental']);
    });

    it('gives a noun head its adjective, number, determiner, relative clause and possessor', () => {
      expect(offered({ verb: GO, locative: HOUSE }, 'locative')).toEqual([
        'locative',
        'locativeAdjective',
        'locativeNumber',
        'locativeDefiniteness',
        'locativeRelative',
        'locativePossessor',
      ]);
    });

    it('chains a complement’s adjectives off its own boxes', () => {
      const selection = { verb: GO, route: HOUSE, routeAdjective: BIG, routeAdjective2: RED };

      expect(offered(selection, 'routeAdjective')).toEqual([
        'routeAdjective',
        'routeAdjective2',
        'routeAdjective3',
      ]);
      expect(satellite(selection, 'routeAdjective').parent).toBe('route');
      expect(satellite(selection, 'routeAdjective2').parent).toBe('routeAdjective');
      expect(satellite(selection, 'routeAdjective3').parent).toBe('routeAdjective2');
      expect(offered({ verb: GO, route: HOUSE }, 'routeAdjective')).toEqual(['routeAdjective']);
    });

    it('gives a predicate adjective only coordination — it agrees with the subject', () => {
      expect(offered({ verb: GO, predicative: HAPPY }, 'predicative')).toEqual([
        'predicative',
        'predicativeConjunct',
      ]);
    });

    it.each<[string, Concept, string[]]>([
      // "a causa di lei": a 3rd-person pronoun cause can render feminine.
      ['a third-person pronoun its number and gender', SHE, ['causeNumber', 'causeGender']],
      ['a first-person pronoun only its number', I, ['causeNumber']],
      [
        'a gendered noun its gender beside the rest of its family',
        FRIEND,
        ['causeAdjective', 'causeNumber', 'causeGender', 'causeRelative', 'causePossessor'],
      ],
    ])('gives a cause that is %s', (_, cause, controls) => {
      expect(offered({ verb: GO, cause }, 'cause')).toEqual(['cause', ...controls]);
    });

    it.each<[ComplementType, boolean]>([
      ['predicative', true],
      ['terminus', true],
      ['manner', true],
      ['locative', true],
      ['direction', true],
      ['source', true],
      ['route', true],
      // The cause folds its quantifier into the connector instead.
      ['cause', false],
    ])('offers a determiner to a %s noun: %s', (type, available) => {
      const determiner = satellite({ verb: GO, [type]: CARE }, `${type}Definiteness`);
      expect(determiner.available).toBe(available);
    });

    it('withdraws the determiner from a manner adverbial that names a measure', () => {
      expect(satellite({ verb: GO, manner: SPEED }, 'mannerDefiniteness').available).toBe(false);
      expect(satellite({ verb: GO, manner: CARE }, 'mannerDefiniteness').available).toBe(true);
    });

    it('coordinates only the predicative among the complements, once it has a head', () => {
      expect(satellite({ verb: GO, predicative: CAT }, 'predicativeConjunct').available).toBe(true);
      expect(satellite({ verb: GO }, 'predicativeConjunct').available).toBe(false);
      expect(satellite({ verb: GO, locative: CAT }, 'locativeConjunct').available).toBe(false);
    });
  });

  describe('values', () => {
    it.each<[string, PhraseSelection, string, Partial<Satellite>]>([
      [
        'an unmarked subject number is singular',
        { subject: CAT },
        'subjectNumber',
        { hasValue: false, valueLabel: 't(number.value.singular)' },
      ],
      [
        'a plural subject is set',
        { subject: CAT, subjectNumber: 'plural' },
        'subjectNumber',
        { hasValue: true, valueLabel: 't(number.value.plural)' },
      ],
      [
        'a plural object is set',
        { verb: SEE, directObject: CAT, directObjectNumber: 'plural' },
        'directObjectNumber',
        { hasValue: true, valueLabel: 't(number.value.plural)' },
      ],
      [
        'a plural complement is set',
        { verb: GO, source: HOUSE, sourceNumber: 'plural' },
        'sourceNumber',
        { hasValue: true, valueLabel: 't(number.value.plural)' },
      ],
      [
        'an unmarked complement number is singular',
        { verb: GO, source: HOUSE },
        'sourceNumber',
        { hasValue: false, valueLabel: 't(number.value.singular)' },
      ],
      [
        'an unmarked gender is masculine',
        { subject: FRIEND },
        'subjectGender',
        { hasValue: false, valueLabel: 'Masculine' },
      ],
      [
        'a masculine subject is at the default',
        { subject: FRIEND, subjectGender: 'masc' },
        'subjectGender',
        { hasValue: false, valueLabel: 'Masculine' },
      ],
      [
        'a feminine subject is set',
        { subject: FRIEND, subjectGender: 'fem' },
        'subjectGender',
        { hasValue: true, valueLabel: 'Feminine' },
      ],
      [
        'a neuter object is set',
        { verb: SEE, directObject: FRIEND, directObjectGender: 'neut' },
        'directObjectGender',
        { hasValue: true, valueLabel: 'Neuter' },
      ],
      [
        'a masculine object is at the default',
        { verb: SEE, directObject: FRIEND, directObjectGender: 'masc' },
        'directObjectGender',
        { hasValue: false, valueLabel: 'Masculine' },
      ],
      [
        'a feminine complement is set',
        { verb: GO, terminus: FRIEND, terminusGender: 'fem' },
        'terminusGender',
        { hasValue: true, valueLabel: 'Feminine' },
      ],
      [
        'a masculine complement is at the default',
        { verb: GO, terminus: FRIEND, terminusGender: 'masc' },
        'terminusGender',
        { hasValue: false, valueLabel: 'Masculine' },
      ],
      [
        'an unmarked subject determiner is definite',
        { subject: CAT },
        'subjectDefiniteness',
        { hasValue: false, valueLabel: 't(determiner.name.definite)' },
      ],
      [
        'a definite subject is at the default',
        { subject: CAT, subjectDefiniteness: 'definite' },
        'subjectDefiniteness',
        { hasValue: false, valueLabel: 't(determiner.name.definite)' },
      ],
      [
        'an indefinite subject is set',
        { subject: CAT, subjectDefiniteness: 'indefinite' },
        'subjectDefiniteness',
        { hasValue: true, valueLabel: 't(determiner.name.indefinite)' },
      ],
      [
        'an unmarked object determiner is definite',
        { verb: SEE, directObject: CAT },
        'directObjectDefiniteness',
        { hasValue: false, valueLabel: 't(determiner.name.definite)' },
      ],
      [
        'a bare object is set',
        { verb: SEE, directObject: CAT, directObjectDefiniteness: 'bare' },
        'directObjectDefiniteness',
        { hasValue: true, valueLabel: 't(determiner.name.bare)' },
      ],
      [
        // A predicate noun ascribes class membership ("becomes a legend").
        'an unmarked predicate noun is indefinite',
        { verb: GO, predicative: CAT },
        'predicativeDefiniteness',
        { hasValue: false, valueLabel: 't(determiner.name.indefinite)' },
      ],
      [
        'a definite predicate noun is set',
        { verb: GO, predicative: CAT, predicativeDefiniteness: 'definite' },
        'predicativeDefiniteness',
        { hasValue: true, valueLabel: 't(determiner.name.definite)' },
      ],
      [
        'an indefinite locative is set',
        // The complement determiners are written by key, outside PhraseSelection's declared fields.
        { verb: GO, locative: CAT, locativeDefiniteness: 'indefinite' } as PhraseSelection,
        'locativeDefiniteness',
        { hasValue: true, valueLabel: 't(determiner.name.indefinite)' },
      ],
      [
        'an unmarked locative determiner is definite',
        { verb: GO, locative: CAT },
        'locativeDefiniteness',
        { hasValue: false, valueLabel: 't(determiner.name.definite)' },
      ],
      [
        'an unmarked verb is positive',
        {},
        'verbNegative',
        { hasValue: false, valueLabel: 'Positive' },
      ],
      [
        'a negated verb is set',
        { verbNegative: true },
        'verbNegative',
        { hasValue: true, valueLabel: 'Negative' },
      ],
      [
        'an unmarked tense is present',
        {},
        'verbTense',
        { hasValue: false, valueLabel: 'Present' },
      ],
      [
        'the present tense is at the default',
        { verbTense: 'present' },
        'verbTense',
        { hasValue: false, valueLabel: 'Present' },
      ],
      [
        'the past tense is set',
        { verbTense: 'past' },
        'verbTense',
        { hasValue: true, valueLabel: 'Past' },
      ],
      [
        'an unmarked aspect is neutral',
        {},
        'verbAspect',
        { hasValue: false, valueLabel: 'Neutral' },
      ],
      [
        'the neutral aspect is at the default',
        { verbAspect: 'neutral' },
        'verbAspect',
        { hasValue: false, valueLabel: 'Neutral' },
      ],
      [
        'the progressive aspect is set',
        { verbAspect: 'progressive' },
        'verbAspect',
        { hasValue: true, valueLabel: 'Progressive' },
      ],
    ])('%s', (_, selection, key, expected) => {
      expect(satellite(selection, key)).toMatchObject(expected);
    });

    it.each<[string, string, boolean, PhraseSelection]>([
      [
        'a possessor phrase with a head',
        'subjectPossessor',
        true,
        { subject: CAT, subjectPossessor: { subject: HOUSE } },
      ],
      [
        'a possessor phrase still without a head',
        'subjectPossessor',
        false,
        { subject: CAT, subjectPossessor: {} },
      ],
      [
        'a pronominal possessor',
        'subjectPossessor',
        true,
        { subject: CAT, subjectPossessorRef: 'directObject' },
      ],
      [
        'an object’s possessor phrase',
        'directObjectPossessor',
        true,
        { verb: SEE, directObject: CAT, directObjectPossessor: { subject: HOUSE } },
      ],
      [
        'an object’s pronominal possessor',
        'directObjectPossessor',
        true,
        { verb: SEE, directObject: CAT, directObjectPossessorRef: 'subject' },
      ],
      [
        'an object’s headless possessor phrase',
        'directObjectPossessor',
        false,
        { verb: SEE, directObject: CAT, directObjectPossessor: {} },
      ],
      [
        'a complement’s possessor phrase',
        'routePossessor',
        true,
        { verb: GO, route: CAT, routePossessor: { subject: HOUSE } },
      ],
      [
        'a complement’s pronominal possessor',
        'routePossessor',
        true,
        { verb: GO, route: CAT, routePossessorRef: 'subject' },
      ],
      [
        'a complement’s headless possessor phrase',
        'routePossessor',
        false,
        { verb: GO, route: CAT, routePossessor: {} },
      ],
      [
        'a subject with a conjunct',
        'subjectConjunct',
        true,
        { subject: CAT, subjectConjuncts: [{ subject: HOUSE }] },
      ],
      [
        'a subject whose conjunct list is empty',
        'subjectConjunct',
        false,
        { subject: CAT, subjectConjuncts: [] },
      ],
      [
        'an object with a conjunct',
        'directObjectConjunct',
        true,
        { verb: SEE, directObject: CAT, directObjectConjuncts: [{}] },
      ],
      [
        'a predicative with a conjunct',
        'predicativeConjunct',
        true,
        { verb: GO, predicative: CAT, predicativeConjuncts: [{}] },
      ],
      ['a chosen adjective', 'subjectAdjective', true, { subject: CAT, subjectAdjective: BIG }],
      ['a chosen complement word', 'direction', true, { verb: GO, direction: HOUSE }],
      [
        'a chosen complement adjective',
        'directionAdjective',
        true,
        { verb: GO, direction: HOUSE, directionAdjective: BIG },
      ],
      ['a chosen modal', 'verbModal', true, { verbModal: WANT }],
      ['a chosen adverb', 'modifier', true, { modifier: OFTEN }],
      // Being a link source is a fact about the workspace, supplied by buildSatelliteIcons.
      ['a relative clause', 'subjectRelative', false, { subject: CAT }],
    ])('counts %s as set (%s: %s)', (_, key, hasValue, selection) => {
      expect(satellite(selection, key).hasValue).toBe(hasValue);
    });

    it('shows a chosen word as the picker offered it, in the UI language', () => {
      const selection = {
        subject: CAT,
        subjectAdjective: BIG,
        verb: GO,
        modifier: OFTEN,
        locative: HOUSE,
      };
      const { satellites } = build(selection, {}, 'it');
      const valueOf = (key: string) => satellites.find((s) => s.key === key)!.valueLabel;

      expect(valueOf('subjectAdjective')).toBe('grande');
      expect(valueOf('modifier')).toBe('spesso');
      expect(valueOf('locative')).toBe('casa');
    });

    it('names a pronoun by the person it stands for', () => {
      expect(satellite({ verb: GO, cause: I }, 'cause').valueLabel).toBe('t(pronoun.person.1)');
    });

    it('leaves an empty word satellite without a value to show', () => {
      expect(satellite({ subject: CAT }, 'subjectAdjective').valueLabel).toBeUndefined();
    });

    const FLIP = 'always valued, flips in place';
    const VALUED_BOX = 'always valued, reveals a box';
    const WORD_BOX = 'valued once chosen, reveals a box';
    const kindOf = (s: Satellite) =>
      `${s.alwaysSet ? 'always valued' : 'valued once chosen'}, ` +
      `${s.directToggle ? 'flips in place' : 'reveals a box'}`;

    it.each<[string, PhraseSelection, string]>([
      ['subjectNumber', { subject: CAT }, FLIP],
      ['subjectGender', { subject: FRIEND }, FLIP],
      ['directObjectNumber', { verb: SEE, directObject: CAT }, FLIP],
      ['directObjectGender', { verb: SEE, directObject: FRIEND }, FLIP],
      ['causeNumber', { verb: GO, cause: CAT }, FLIP],
      ['causeGender', { verb: GO, cause: FRIEND }, FLIP],
      ['verbNegative', {}, FLIP],
      ['subjectDefiniteness', { subject: CAT }, VALUED_BOX],
      ['directObjectDefiniteness', { verb: SEE, directObject: CAT }, VALUED_BOX],
      ['locativeDefiniteness', { verb: GO, locative: CAT }, VALUED_BOX],
      ['verbTense', {}, VALUED_BOX],
      ['verbAspect', {}, VALUED_BOX],
      ['subjectAdjective', { subject: CAT }, WORD_BOX],
      ['locative', { verb: GO }, WORD_BOX],
      ['verbModal', {}, WORD_BOX],
    ])('makes %s a control that is %s', (key, selection, kind) => {
      expect(kindOf(satellite(selection, key))).toBe(kind);
    });
  });

  describe('whether a satellite’s box is shown', () => {
    it.each<[string, PhraseSelection, Record<string, boolean>, boolean]>([
      ['an empty adjective stays folded away', { subject: CAT }, {}, false],
      ['a chosen adjective opens by itself', { subject: CAT, subjectAdjective: BIG }, {}, true],
      ['revealing an empty adjective opens it', { subject: CAT }, { subjectAdjective: true }, true],
      [
        'hiding a chosen adjective folds it away',
        { subject: CAT, subjectAdjective: BIG },
        { subjectAdjective: false },
        false,
      ],
    ])('%s', (_, selection, revealed, shown) => {
      expect(satellite(selection, 'subjectAdjective', revealed).shown).toBe(shown);
      expect(build(selection, revealed).shownMap['subjectAdjective']).toBe(shown);
    });

    it('opens a marked tense or determiner by itself, but not an unmarked one', () => {
      expect(satellite({ verbTense: 'future' }, 'verbTense').shown).toBe(true);
      expect(satellite({ verbTense: 'present' }, 'verbTense').shown).toBe(false);
      const bare = satellite({ subject: CAT, subjectDefiniteness: 'bare' }, 'subjectDefiniteness');
      expect(bare.shown).toBe(true);
    });

    it.each<[string, PhraseSelection]>([
      ['subjectNumber', { subject: CAT, subjectNumber: 'plural' }],
      ['subjectGender', { subject: FRIEND, subjectGender: 'fem' }],
      ['verbNegative', { verbNegative: true }],
    ])('never shows %s, which flips in place and has no box', (key, selection) => {
      expect(satellite(selection, key, { [key]: true }).shown).toBe(false);
    });

    it('never shows a satellite that is not offered, whatever its reveal state', () => {
      const revealed = { subjectAdjective: true };
      expect(satellite({ subject: I }, 'subjectAdjective', revealed).shown).toBe(false);
    });
  });

  describe('icons', () => {
    it.each<[string, string, PhraseSelection, string]>([
      ['an unmarked subject', 'subjectGender', { subject: FRIEND }, 'MaleIcon'],
      [
        'a masculine subject',
        'subjectGender',
        { subject: FRIEND, subjectGender: 'masc' },
        'MaleIcon',
      ],
      [
        'a feminine subject',
        'subjectGender',
        { subject: FRIEND, subjectGender: 'fem' },
        'FemaleIcon',
      ],
      [
        'a neuter subject',
        'subjectGender',
        { subject: FRIEND, subjectGender: 'neut' },
        'TransgenderIcon',
      ],
      [
        'a feminine object',
        'directObjectGender',
        { verb: SEE, directObject: FRIEND, directObjectGender: 'fem' },
        'FemaleIcon',
      ],
      [
        'a neuter cause',
        'causeGender',
        { verb: GO, cause: SHE, causeGender: 'neut' },
        'TransgenderIcon',
      ],
    ])('draws the gender of %s (%s) as its value’s glyph', (_, key, selection, icon) => {
      expect(glyph(satellite(selection, key).icon)).toBe(icon);
    });

    it.each<[ComplementType, string]>([
      ['predicative', 'LinkIcon'],
      ['terminus', 'CallReceivedIcon'],
      ['instrumental', 'BuildIcon'],
      ['manner', 'SpeedIcon'],
      ['locative', 'PlaceIcon'],
      ['direction', 'ArrowForwardIcon'],
      ['source', 'ArrowBackIcon'],
      ['route', 'RouteIcon'],
      ['cause', 'HelpOutlineIcon'],
    ])('marks the %s toggle with its own glyph', (type, icon) => {
      expect(glyph(satellite({ verb: GO }, type).icon)).toBe(icon);
    });
  });
});

// Only the parts of the workspace binding the satellite controls reach for.
function workspace({ relativeSources = [] as string[], instrumentalLinked = false } = {}) {
  return {
    relative: {
      sourceKeys: new Set(relativeSources),
      onStartLink: vi.fn(),
      onRemoveLink: vi.fn(),
    },
    instrumental: { hasSource: instrumentalLinked, onStart: vi.fn(), onClear: vi.fn() },
  };
}

function icons(
  selection: PhraseSelection,
  {
    revealed = {},
    collapsed = [],
    binding,
  }: {
    revealed?: Record<string, boolean>;
    collapsed?: string[];
    binding?: ReturnType<typeof workspace>;
  } = {},
) {
  const { satellites, shownMap } = build(selection, revealed);
  const callbacks = {
    onToggleNumber: vi.fn<(which: NumberSlot) => void>(),
    onToggleGender: vi.fn<(which: GenderSlot) => void>(),
    onToggleNegative: vi.fn<() => void>(),
    onToggleReveal: vi.fn<(sat: Satellite) => void>(),
    onAddConjunct: vi.fn<(which: NounKey) => void>(),
  };
  const result = buildSatelliteIcons({
    satellites,
    shownMap,
    collapsedMainKeys: new Set(collapsed),
    linkBinding: binding as unknown as WorkspaceBinding | undefined,
    ...callbacks,
  });
  const find = (key: string) => satellites.find((s) => s.key === key);
  return { ...result, ...callbacks, satellite: find };
}

const keysOf = (list: SatelliteIcon[] | undefined) => list?.map((icon) => icon.key);

// Every control, wherever it rides.
function allControls(result: ReturnType<typeof icons>): string[] {
  return [
    ...Object.values(result.satelliteIconsByParent).flat(),
    ...result.complementToggleIcons,
    ...Object.values(result.perimeterByNoun).flatMap((entry) => Object.values(entry!)),
    ...(result.directObjectToggle ? [result.directObjectToggle] : []),
  ].map((icon) => icon.key);
}

describe('buildSatelliteIcons', () => {
  describe('on a word box’s border', () => {
    it('seats a noun’s adjective, number, gender and determiner controls on its box', () => {
      const { satelliteIconsByParent } = icons({ subject: FRIEND });

      expect(keysOf(satelliteIconsByParent['subject'])).toEqual([
        'subjectAdjective',
        'subjectNumber',
        'subjectGender',
        'subjectDefiniteness',
      ]);
    });

    it('seats polarity, tense, aspect, the modal and the adverb on the verb box', () => {
      const { satelliteIconsByParent } = icons({ verb: GO });

      expect(keysOf(satelliteIconsByParent['verb'])).toEqual([
        'verbNegative',
        'verbTense',
        'verbAspect',
        'verbModal',
        'modifier',
      ]);
    });

    it('makes no control for a satellite that is not offered', () => {
      const result = icons({ subject: I });

      expect(keysOf(result.satelliteIconsByParent['subject'])).toEqual([
        'subjectNumber',
        'subjectGender',
      ]);
      expect(allControls(result)).not.toContain('subjectAdjective');
      expect(allControls(result)).not.toContain('subjectPossessor');
    });

    it('seats a chained control on the previous box only while that box is shown', () => {
      const selection = { subject: CAT, subjectAdjective: BIG };

      expect(keysOf(icons(selection).satelliteIconsByParent['subjectAdjective'])).toEqual([
        'subjectAdjective2',
      ]);
      const folded = icons(selection, { revealed: { subjectAdjective: false } });
      expect(folded.satelliteIconsByParent['subjectAdjective']).toBeUndefined();
    });

    it('seats the second modal and the first modal’s adverb on the first modal’s box', () => {
      const selection = { verb: GO, verbModal: WANT };

      expect(keysOf(icons(selection).satelliteIconsByParent['verbModal'])).toEqual([
        'verbModal2',
        'verbModalAdverb',
      ]);
      const folded = icons(selection, { revealed: { verbModal: false } });
      expect(folded.satelliteIconsByParent['verbModal']).toBeUndefined();
    });

    it('seats a complement’s own controls on the complement box while it is shown', () => {
      const selection = { verb: GO, locative: HOUSE };

      expect(keysOf(icons(selection).satelliteIconsByParent['locative'])).toEqual([
        'locativeAdjective',
        'locativeNumber',
        'locativeDefiniteness',
      ]);
      const folded = icons(selection, { revealed: { locative: false } });
      expect(folded.satelliteIconsByParent['locative']).toBeUndefined();
    });

    it('seats the object’s controls on the object box', () => {
      const { satelliteIconsByParent } = icons({ verb: SEE, directObject: CAT });

      expect(keysOf(satelliteIconsByParent['directObject'])).toEqual([
        'directObjectAdjective',
        'directObjectNumber',
        'directObjectDefiniteness',
      ]);
    });

    it('hides the border controls of a collapsed group, leaving the other groups’', () => {
      const { satelliteIconsByParent } = icons(
        { subject: CAT, verb: GO },
        { collapsed: ['subject'] },
      );

      expect(satelliteIconsByParent['subject']).toBeUndefined();
      expect(satelliteIconsByParent['verb']).toBeDefined();
    });
  });

  describe('a border control', () => {
    it('mirrors a reveal satellite: its box shown reads active, its word reads set', () => {
      const { satelliteIconsByParent } = icons({ subject: CAT, subjectAdjective: BIG });
      const adjective = satelliteIconsByParent['subject']![0];

      expect(adjective).toMatchObject({
        key: 'subjectAdjective',
        label: 'Adjective',
        active: true,
        isSet: true,
        valued: false,
        valueLabel: 'big',
        directToggle: undefined,
      });
      expect(glyph(adjective.icon)).toBe('BrushIcon');
    });

    it('reads an empty, folded satellite as neither active nor set', () => {
      const { satelliteIconsByParent } = icons({ subject: CAT });

      expect(satelliteIconsByParent['subject']![0]).toMatchObject({ active: false, isSet: false });
    });

    it('marks an always-set satellite as valued, with its current value', () => {
      const { satelliteIconsByParent } = icons({ subject: CAT, subjectNumber: 'plural' });
      const byKey = Object.fromEntries(satelliteIconsByParent['subject']!.map((i) => [i.key, i]));

      expect(byKey['subjectNumber']).toMatchObject({
        valued: true,
        isSet: true,
        directToggle: true,
        valueLabel: 't(number.value.plural)',
      });
      expect(byKey['subjectDefiniteness']).toMatchObject({ valued: true, isSet: false });
    });

    type Flip = 'onToggleNumber' | 'onToggleGender';

    it.each<[string, PhraseSelection, string, string, Flip, string]>([
      [
        'the subject’s number',
        { subject: CAT },
        'subject',
        'subjectNumber',
        'onToggleNumber',
        'subject',
      ],
      [
        'the object’s number',
        { verb: SEE, directObject: CAT },
        'directObject',
        'directObjectNumber',
        'onToggleNumber',
        'directObject',
      ],
      [
        'a complement’s number',
        { verb: GO, locative: HOUSE },
        'locative',
        'locativeNumber',
        'onToggleNumber',
        'locative',
      ],
      [
        'the subject’s gender',
        { subject: FRIEND },
        'subject',
        'subjectGender',
        'onToggleGender',
        'subject',
      ],
      [
        'the object’s gender',
        { verb: SEE, directObject: FRIEND },
        'directObject',
        'directObjectGender',
        'onToggleGender',
        'directObject',
      ],
      [
        'a complement’s gender',
        { verb: GO, cause: SHE },
        'cause',
        'causeGender',
        'onToggleGender',
        'cause',
      ],
    ])('flips %s in place', (_, selection, parent, key, callback, slot) => {
      const result = icons(selection);
      const control = result.satelliteIconsByParent[parent]!.find((i) => i.key === key)!;

      control.onToggle();

      expect(result[callback]).toHaveBeenCalledExactlyOnceWith(slot);
      expect(result.onToggleReveal).not.toHaveBeenCalled();
    });

    it('flips polarity in place', () => {
      const result = icons({ verb: GO });
      const polarity = result.satelliteIconsByParent['verb']!.find(
        (i) => i.key === 'verbNegative',
      )!;

      polarity.onToggle();

      expect(result.onToggleNegative).toHaveBeenCalledOnce();
      expect(result.onToggleReveal).not.toHaveBeenCalled();
      expect(polarity.directToggle).toBe(true);
    });

    it.each<[string, PhraseSelection, string, string]>([
      ['an adjective', { subject: CAT }, 'subject', 'subjectAdjective'],
      ['a determiner', { subject: CAT }, 'subject', 'subjectDefiniteness'],
      ['a tense', { verb: GO }, 'verb', 'verbTense'],
      ['a modal', { verb: GO }, 'verb', 'verbModal'],
    ])('reveals or hides the box of %s, handing over its satellite', (_, sel, parent, key) => {
      const result = icons(sel);

      result.satelliteIconsByParent[parent]!.find((i) => i.key === key)!.onToggle();

      expect(result.onToggleReveal).toHaveBeenCalledExactlyOnceWith(result.satellite(key));
      expect(result.onToggleNumber).not.toHaveBeenCalled();
      expect(result.onToggleGender).not.toHaveBeenCalled();
      expect(result.onToggleNegative).not.toHaveBeenCalled();
    });
  });

  describe('the verb-phrase dotted box', () => {
    const PUT = concept('PUT', 'verb', { complements: ['cause', 'locative', 'predicative'] });

    it('carries a toggle per licensed complement, in canonical order, off the verb border', () => {
      const { complementToggleIcons, satelliteIconsByParent } = icons({ verb: PUT });

      expect(keysOf(complementToggleIcons)).toEqual(['predicative', 'locative', 'cause']);
      expect(keysOf(satelliteIconsByParent['verb'])).not.toContain('locative');
    });

    it('reads a chosen complement as set and shown, and toggles its box', () => {
      const result = icons({ verb: PUT, locative: HOUSE });
      const locative = result.complementToggleIcons.find((i) => i.key === 'locative')!;

      expect(locative).toMatchObject({ active: true, isSet: true, valueLabel: 'house' });
      locative.onToggle();
      expect(result.onToggleReveal).toHaveBeenCalledExactlyOnceWith(result.satellite('locative'));
    });

    it('keeps the complement toggles and the object control with the verb phrase collapsed', () => {
      const { complementToggleIcons, satelliteIconsByParent, directObjectToggle } = icons(
        { verb: concept('GIVE', 'verb', { complements: ['terminus'] }) },
        { collapsed: ['verb'] },
      );

      expect(satelliteIconsByParent['verb']).toBeUndefined();
      expect(keysOf(complementToggleIcons)).toEqual(['terminus']);
      expect(directObjectToggle?.key).toBe('directObject');
    });

    it('pins the object’s fold-away control apart from the toggle row and the verb box', () => {
      const result = icons({ verb: SEE });

      expect(result.directObjectToggle).toMatchObject({
        key: 'directObject',
        active: true,
        isSet: false,
      });
      expect(keysOf(result.complementToggleIcons)).not.toContain('directObject');
      expect(keysOf(result.satelliteIconsByParent['verb'])).not.toContain('directObject');

      result.directObjectToggle!.onToggle();
      expect(result.onToggleReveal).toHaveBeenCalledExactlyOnceWith(
        result.satellite('directObject'),
      );
    });

    it('reads a folded object as inactive', () => {
      const { directObjectToggle } = icons(
        { verb: SEE, directObject: CAT },
        { revealed: { directObject: false } },
      );

      expect(directObjectToggle).toMatchObject({ active: false, isSet: true });
    });

    it('offers no object control to an intransitive verb', () => {
      expect(icons({ verb: SLEEP }).directObjectToggle).toBeUndefined();
    });
  });

  describe('the instrumental link', () => {
    const CUT = concept('CUT', 'verb', { complements: ['instrumental'] });

    it('offers no control outside a workspace, where there is nothing to link to', () => {
      expect(allControls(icons({ verb: CUT }))).not.toContain('instrumental');
    });

    it('offers no control when the verb does not license it', () => {
      expect(allControls(icons({ verb: SEE }, { binding: workspace() }))).not.toContain(
        'instrumental',
      );
    });

    it('starts a link while there is none', () => {
      const binding = workspace();
      const { complementToggleIcons } = icons({ verb: CUT }, { binding });
      const control = complementToggleIcons.find((i) => i.key === 'instrumental')!;

      expect(control).toMatchObject({
        label: 't(slot.instrumental)',
        active: false,
        isSet: false,
        valued: false,
        valueLabel: undefined,
      });
      control.onToggle();
      expect(binding.instrumental.onStart).toHaveBeenCalledOnce();
      expect(binding.instrumental.onClear).not.toHaveBeenCalled();
    });

    it('removes the link once made', () => {
      const binding = workspace({ instrumentalLinked: true });
      const { complementToggleIcons } = icons({ verb: CUT }, { binding });
      const control = complementToggleIcons.find((i) => i.key === 'instrumental')!;

      expect(control).toMatchObject({
        active: false,
        isSet: true,
        valueLabel: 'Linked — click to remove',
      });
      control.onToggle();
      expect(binding.instrumental.onClear).toHaveBeenCalledOnce();
      expect(binding.instrumental.onStart).not.toHaveBeenCalled();
    });
  });

  describe('a noun’s dotted-box perimeter', () => {
    it('keeps the relative clause, possessor and coordination controls off the word box', () => {
      const result = icons({ subject: CAT }, { binding: workspace() });

      expect(result.perimeterByNoun['subject']).toMatchObject({
        relative: { key: 'subjectRelative' },
        possessor: { key: 'subjectPossessor' },
        conjunct: { key: 'subjectConjunct' },
      });
      expect(keysOf(result.satelliteIconsByParent['subject'])).toEqual([
        'subjectAdjective',
        'subjectNumber',
        'subjectDefiniteness',
      ]);
    });

    describe('the relative clause', () => {
      it('is left out outside a workspace', () => {
        const { perimeterByNoun } = icons({ subject: CAT });

        expect(perimeterByNoun['subject']?.relative).toBeUndefined();
        expect(perimeterByNoun['subject']?.possessor).toBeDefined();
      });

      it('starts a link from a noun that is not yet a source', () => {
        const binding = workspace();
        const relative = icons({ subject: CAT }, { binding }).perimeterByNoun['subject']!.relative!;

        expect(relative).toMatchObject({
          label: 'Relative clause',
          active: false,
          isSet: false,
          valued: false,
          valueLabel: undefined,
        });
        relative.onToggle();
        expect(binding.relative.onStartLink).toHaveBeenCalledExactlyOnceWith('subject');
        expect(binding.relative.onRemoveLink).not.toHaveBeenCalled();
      });

      it('removes the link from a noun that already sources one', () => {
        const binding = workspace({ relativeSources: ['directObject'] });
        const { perimeterByNoun } = icons({ verb: SEE, directObject: CAT }, { binding });
        const relative = perimeterByNoun['directObject']!.relative!;

        expect(relative).toMatchObject({
          active: true,
          isSet: true,
          valueLabel: 'Linked — click to remove',
        });
        relative.onToggle();
        expect(binding.relative.onRemoveLink).toHaveBeenCalledExactlyOnceWith('directObject');
        expect(binding.relative.onStartLink).not.toHaveBeenCalled();
      });

      it('addresses a complement noun by its own key', () => {
        const binding = workspace({ relativeSources: ['subject'] });
        const { perimeterByNoun } = icons({ verb: GO, subject: CAT, locative: HOUSE }, { binding });

        expect(perimeterByNoun['locative']!.relative!.isSet).toBe(false);
        perimeterByNoun['locative']!.relative!.onToggle();
        expect(binding.relative.onStartLink).toHaveBeenCalledExactlyOnceWith('locative');
      });
    });

    describe('the possessor', () => {
      it('reveals the possessor panel, with or without a workspace', () => {
        const result = icons({ subject: CAT });
        const possessor = result.perimeterByNoun['subject']!.possessor!;

        expect(possessor).toMatchObject({ label: 'Possessor', active: false, isSet: false });
        possessor.onToggle();
        expect(result.onToggleReveal).toHaveBeenCalledExactlyOnceWith(
          result.satellite('subjectPossessor'),
        );
      });

      it('reads as set and open once a possessor is chosen', () => {
        const { perimeterByNoun } = icons({
          verb: GO,
          route: CAT,
          routePossessor: { subject: HOUSE },
        });

        expect(perimeterByNoun['route']!.possessor).toMatchObject({ active: true, isSet: true });
      });

      it('stays on the perimeter while the noun’s group is collapsed', () => {
        const { perimeterByNoun } = icons({ subject: CAT }, { collapsed: ['subject'] });

        expect(perimeterByNoun['subject']!.possessor).toBeDefined();
      });
    });

    describe('coordination', () => {
      it('adds a conjunct rather than revealing a box', () => {
        const result = icons({ subject: CAT });
        const conjunct = result.perimeterByNoun['subject']!.conjunct!;

        expect(conjunct).toMatchObject({
          label: 'Coordination',
          active: false,
          isSet: false,
          valued: true,
          valueLabel: 'Add a conjunct',
        });
        conjunct.onToggle();
        expect(result.onAddConjunct).toHaveBeenCalledExactlyOnceWith('subject');
        expect(result.onToggleReveal).not.toHaveBeenCalled();
      });

      it('offers another conjunct once the noun is coordinated', () => {
        const result = icons({ verb: GO, predicative: CAT, predicativeConjuncts: [{}] });
        const conjunct = result.perimeterByNoun['predicative']!.conjunct!;

        expect(conjunct).toMatchObject({ isSet: true, valueLabel: 'Add another conjunct' });
        conjunct.onToggle();
        expect(result.onAddConjunct).toHaveBeenCalledExactlyOnceWith('predicative');
      });

      it('never reads as active, even when its key was revealed', () => {
        const { perimeterByNoun } = icons(
          { subject: CAT, subjectConjuncts: [{}] },
          { revealed: { subjectConjunct: true } },
        );

        expect(perimeterByNoun['subject']!.conjunct!.active).toBe(false);
      });
    });
  });
});
