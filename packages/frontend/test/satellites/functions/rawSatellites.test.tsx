import { describe, expect, it, vi } from 'vitest';
import {
  COMPLEMENT_TYPES,
  type ComplementType,
  type Concept,
  type LanguageCode,
  type UiStringKey,
} from '@signi/shared';
import { rawSatellites } from '../../../src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx';
import { setImperative, setInfinitive, setVoice } from '../../../src/components/PhraseBuilder/phraseReducers.ts';
import type { RawSatellite } from '../../../src/components/PhraseBuilder/satellites/satellites.types.tsx';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import {
  BIG,
  CAN,
  CARE,
  CAT,
  DO,
  FRIEND,
  GO,
  HAPPY,
  HOUSE,
  I,
  OFTEN,
  RED,
  SEE,
  SHE,
  SLEEP,
  SPEED,
  WANT,
  concept,
  glyph,
  t,
} from '../fixtures.tsx';

// The satellites as the selection alone describes them.
function list(selection: PhraseSelection, language: LanguageCode = 'en'): RawSatellite[] {
  return rawSatellites(selection, language, t);
}

function satellite(selection: PhraseSelection, key: string): RawSatellite {
  const found = list(selection).find((s) => s.key === key);
  if (!found) throw new Error(`no satellite ${key}`);
  return found;
}

// The keys of the satellites the selection licenses, optionally only those of one family (by key prefix).
function offered(selection: PhraseSelection, family = ''): string[] {
  return list(selection)
    .filter((s) => s.available && s.key.startsWith(family))
    .map((s) => s.key);
}

describe('rawSatellites', () => {
  it('offers only the verb’s own controls while nothing is chosen', () => {
    expect(offered({})).toEqual([
      'verbNegative',
      'verbTense',
      'verbAspect',
      'verbModal',
      'modifier',
    ]);
  });

  it('gives every satellite a distinct key', () => {
    const satellites = list({ verb: GO, subject: CAT, directObject: CAT });

    expect(new Set(satellites.map((s) => s.key)).size).toBe(satellites.length);
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

      const satellites = list({ subject: CAT });
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
        'verbModalNegative',
      ]);
      expect(offered({ verb: GO, verbModal: WANT, verbModal2: CAN }, 'verbModal')).toEqual([
        'verbModal',
        'verbModal2',
        'verbModalAdverb',
        'verbModal2Adverb',
        'verbModalNegative',
        'verbModal2Negative',
      ]);

      const satellites = list({ verb: GO, verbModal: WANT, verbModal2: CAN });
      const parentOf = (key: string) => satellites.find((s) => s.key === key)!.parent;
      expect(parentOf('verbModal2')).toBe('verbModal');
      expect(parentOf('verbModalAdverb')).toBe('verbModal');
      expect(parentOf('verbModal2Adverb')).toBe('verbModal2');
      // Each modal's polarity rides its own modal's box, as its adverb does.
      expect(parentOf('verbModalNegative')).toBe('verbModal');
      expect(parentOf('verbModal2Negative')).toBe('verbModal2');
    });

    it('names the verb’s controls by the catalog keys their tooltips and titles read', () => {
      const selection = { verb: GO, verbModal: WANT, verbModal2: CAN };
      const named = (key: string) => {
        const { label, labelKey } = satellite(selection, key);
        return { label, labelKey };
      };

      expect(named('verbNegative')).toEqual({ label: 't(satellite.polarity)', labelKey: undefined });
      expect(named('verbTense')).toEqual({ label: 't(satellite.tense)', labelKey: 'satellite.tense' });
      expect(named('verbAspect')).toEqual({ label: 't(satellite.aspect)', labelKey: 'satellite.aspect' });
      // Both modals, and both modals' adverbs, share one name: the numeral only told English labels apart.
      for (const key of ['verbModal', 'verbModal2']) {
        expect(named(key)).toEqual({ label: 't(slot.modal)', labelKey: 'slot.modal' });
      }
      for (const key of ['verbModalAdverb', 'verbModal2Adverb']) {
        expect(named(key)).toEqual({ label: 't(slot.adverb)', labelKey: 'slot.adverb' });
      }
    });

    it.each(['imperative', 'infinitive'] as const)('withdraws tense, aspect and every modal in the %s mood', (mood) => {
      expect(offered({ [mood]: true, verb: SEE, verbModal: WANT, verbModal2: CAN }, 'verb')).toEqual([
        'verbNegative',
      ]);
    });

    it('leaves the subject family to its own head, even in a mood that drops the subject', () => {
      // resolveSatellites withdraws it; the list only knows the subject is a noun.
      expect(offered({ imperative: true, subject: CAT }, 'subject')).toContain('subjectAdjective');
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
        // The wh-question's mark (P09-E12 M6): SEE takes an object to ask about.
        'directObjectQuestion',
      ]);
      const ungendered = satellite({ verb: SEE, directObject: CAT }, 'directObjectGender');
      expect(ungendered.available).toBe(false);
    });

    it.each<[string, Concept, string[]]>([
      // "il gatto la vede": only the 3rd person spells a gendered object form.
      ['a third-person pronoun its number and gender', SHE, ['directObjectNumber', 'directObjectGender']],
      ['a first-person pronoun only its number', I, ['directObjectNumber']],
    ])('gives an object that is %s, and coordination', (_, directObject, controls) => {
      expect(offered({ verb: SEE, directObject }, 'directObject')).toEqual([
        'directObject',
        ...controls,
        'directObjectConjunct',
        'directObjectQuestion',
      ]);
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

    it('withdraws the object itself once the verb is intransitive, leaving its family to resolveSatellites', () => {
      const selection = { verb: SLEEP, directObject: CAT, directObjectAdjective: BIG };

      expect(satellite(selection, 'directObject').available).toBe(false);
      expect(satellite(selection, 'directObjectAdjective').available).toBe(true);
    });

    it('is the one satellite offered open before it holds a value', () => {
      const openByDefault = list({ verb: SEE, subject: CAT, locative: HOUSE }).filter((s) => s.defaultShown);

      expect(openByDefault.map((s) => s.key)).toEqual(['directObject']);
    });
  });

  describe('complements', () => {
    it('offers a toggle only for the complements the verb licenses, and the adjuncts every verb takes', () => {
      const verb = concept('PUT', 'verb', { complements: ['cause', 'locative'] });
      const toggles = offered({ verb }).filter((key) =>
        (COMPLEMENT_TYPES as string[]).includes(key),
      );

      // The temporal and the purpose are offered on every verb (P09-E12 D2); the topic is not.
      expect(toggles).toEqual(['locative', 'temporal', 'cause', 'purpose']);
    });

    it('offers the topic only where the verb licenses it, and no complement without a verb', () => {
      const think = concept('THINK', 'verb', { complements: ['topic'] });

      expect(offered({ verb: think })).toContain('topic');
      expect(offered({ verb: concept('RUN', 'verb') })).not.toContain('topic');
      expect(offered({}).filter((key) => (COMPLEMENT_TYPES as string[]).includes(key))).toEqual([]);
    });

    it.each<[ComplementType, string]>([
      ['predicative', 't(slot.predicative)'],
      ['manner', 't(slot.manner)'],
      ['instrumental', 't(slot.instrumental)'],
      ['locative', 't(slot.locative)'],
      ['terminus', 't(slot.terminus)'],
      ['cause', 't(slot.cause)'],
    ])('names the %s toggle %s', (type, label) => {
      expect(satellite({ verb: GO }, type).label).toBe(label);
    });

    it('treats the instrumental as a link that holds no value and carries no controls', () => {
      const satellites = list({ verb: GO });

      expect(satellites.find((s) => s.key === 'instrumental')).toMatchObject({
        available: true,
        hasValue: false,
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
        'locativeConjunct',
        // GO licenses the locative, and *where* asks it in its plain relation (P09-E12 M6).
        'locativeQuestion',
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

    // P09-E12 D5: the standard of comparison, offered by the degrees that take one.
    it.each([
      ['more', true],
      ['less', true],
      ['equally', true],
      ['positive', false],
      ['most', false],
      ['least', false],
    ] as const)('offers a predicate adjective a standard of comparison under %s: %s', (degree, available) => {
      const selection: PhraseSelection = { verb: GO, predicative: HAPPY, adjectiveDegrees: { predicative: degree } };
      expect(satellite(selection, 'predicativeStandard')).toMatchObject({ parent: 'predicative', labelKey: 'slot.standard', available });
      expect(satellite({ ...selection, predicativeStandard: { subject: CAT } }, 'predicativeStandard').hasValue).toBe(true);
      expect(satellite({ verb: GO, predicative: CAT, adjectiveDegrees: { predicative: degree } }, 'predicativeStandard').available).toBe(false);
    });

    // Every cause also coordinates, and carries its own polarity — the one complement that can be
    // denied rather than named ("not because of the dog"), whatever kind of word heads it.
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
      expect(offered({ verb: GO, cause }, 'cause')).toEqual([
        'cause',
        ...controls,
        'causeConjunct',
        'causeNegative',
        'causeQuestion',
      ]);
    });

    it('offers the polarity only on the cause, and only once it holds a word', () => {
      expect(offered({ verb: GO }, 'cause')).not.toContain('causeNegative');
      expect(offered({ verb: GO, locative: HOUSE }, 'locative')).not.toContain('locativeNegative');
      const sat = satellite({ verb: GO, cause: FRIEND }, 'causeNegative');
      expect(sat.parent).toBe('cause');
      expect(sat.hasValue).toBe(false);
      expect(satellite({ verb: GO, cause: FRIEND, causeNegative: true }, 'causeNegative').hasValue).toBe(true);
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

    // The prepositional complements coordinate too: each engine decides per conjunct whether its
    // adposition repeats ("in the house and the market", "nella casa e nel mercato").
    it('coordinates every complement, once it has a head', () => {
      expect(satellite({ verb: GO, predicative: CAT }, 'predicativeConjunct').available).toBe(true);
      expect(satellite({ verb: GO, locative: CAT }, 'locativeConjunct').available).toBe(true);
      expect(satellite({ verb: GO, cause: CAT }, 'causeConjunct').available).toBe(true);
      expect(satellite({ verb: GO }, 'predicativeConjunct').available).toBe(false);
      expect(satellite({ verb: GO }, 'locativeConjunct').available).toBe(false);
    });
  });

  describe('values', () => {
    it.each<[string, PhraseSelection, string, Partial<RawSatellite>]>([
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
        { hasValue: false, valueLabel: 't(gender.value.masc)' },
      ],
      [
        'a masculine subject is at the default',
        { subject: FRIEND, subjectGender: 'masc' },
        'subjectGender',
        { hasValue: false, valueLabel: 't(gender.value.masc)' },
      ],
      [
        'a feminine subject is set',
        { subject: FRIEND, subjectGender: 'fem' },
        'subjectGender',
        { hasValue: true, valueLabel: 't(gender.value.fem)' },
      ],
      [
        'a neuter object is set',
        { verb: SEE, directObject: FRIEND, directObjectGender: 'neut' },
        'directObjectGender',
        { hasValue: true, valueLabel: 't(gender.value.neut)' },
      ],
      [
        'a masculine object is at the default',
        { verb: SEE, directObject: FRIEND, directObjectGender: 'masc' },
        'directObjectGender',
        { hasValue: false, valueLabel: 't(gender.value.masc)' },
      ],
      [
        'a feminine complement is set',
        { verb: GO, terminus: FRIEND, terminusGender: 'fem' },
        'terminusGender',
        { hasValue: true, valueLabel: 't(gender.value.fem)' },
      ],
      [
        'a masculine complement is at the default',
        { verb: GO, terminus: FRIEND, terminusGender: 'masc' },
        'terminusGender',
        { hasValue: false, valueLabel: 't(gender.value.masc)' },
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
        { hasValue: false, valueLabel: 't(polarity.value.positive)' },
      ],
      [
        'a negated verb is set',
        { verbNegative: true },
        'verbNegative',
        { hasValue: true, valueLabel: 't(polarity.value.negative)' },
      ],
      [
        'an unmarked tense is present',
        {},
        'verbTense',
        { hasValue: false, valueLabel: 't(tense.value.present)' },
      ],
      [
        'the present tense is at the default',
        { verbTense: 'present' },
        'verbTense',
        { hasValue: false, valueLabel: 't(tense.value.present)' },
      ],
      [
        'the past tense is set',
        { verbTense: 'past' },
        'verbTense',
        { hasValue: true, valueLabel: 't(tense.value.past)' },
      ],
      [
        'an unmarked aspect is neutral',
        {},
        'verbAspect',
        { hasValue: false, valueLabel: 't(aspect.value.neutral)' },
      ],
      [
        'the neutral aspect is at the default',
        { verbAspect: 'neutral' },
        'verbAspect',
        { hasValue: false, valueLabel: 't(aspect.value.neutral)' },
      ],
      [
        'the progressive aspect is set',
        { verbAspect: 'progressive' },
        'verbAspect',
        { hasValue: true, valueLabel: 't(aspect.value.progressive)' },
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
      const satellites = list(selection, 'it');
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
    const kindOf = (s: RawSatellite) =>
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

  describe('labels', () => {
    const everything: PhraseSelection = {
      subject: FRIEND,
      subjectAdjective: BIG,
      verb: GO,
      verbModal: WANT,
      verbModal2: CAN,
      directObject: FRIEND,
      directObjectAdjective: RED,
      locative: HOUSE,
      cause: SHE,
    };

    it('renders every catalogued label from its own key', () => {
      const catalogued = list(everything).filter((s) => s.labelKey);

      expect(catalogued.length).toBeGreaterThan(0);
      for (const s of catalogued) expect(s.label).toBe(t(s.labelKey!));
    });

    it('reads its UI strings through the lookup it is handed', () => {
      const lookup = vi.fn((key: UiStringKey) => `«${key}»`);
      const satellites = rawSatellites({ subject: FRIEND, subjectGender: 'fem' }, 'en', lookup);

      expect(lookup).toHaveBeenCalledWith('gender.value.fem');
      expect(satellites.find((s) => s.key === 'subjectGender')!.valueLabel).toBe('«gender.value.fem»');
    });
  });

  describe('the control tree', () => {
    it('hangs every satellite off a word or off another satellite in the list', () => {
      const satellites = list({ verb: GO, subject: CAT, directObject: CAT });
      const satelliteKeys = new Set(satellites.map((s) => s.key));
      const words = ['subject', 'verb', 'directObject'];

      for (const s of satellites) {
        expect(words.includes(s.parent) || satelliteKeys.has(s.parent)).toBe(true);
        expect(s.parent).not.toBe(s.key);
      }
    });
  });
});

// A164. An alarm cry — CRY_OUT with a danger for its object — is the shout itself, the word "Wolf!",
// and spells no determiner in any language (A163). The canvas offers one anyway: the direct object's
// determiner is gated on its head alone (`directObjectRole === 'noun'`), so the control sits on the
// ring claiming a slot the grammar does not license, exactly as a measure manner adverbial's did
// before it was withdrawn. Both flags are on `Concept`, which the fixtures are typed against.
const CRY_OUT: Concept = { ...concept('CRY_OUT', 'verb', { transitivity: 'transitive' }), alarmCry: true };
const WOLF: Concept = { ...concept('WOLF', 'noun'), alarm: true };
const WORD = concept('WORD', 'noun');

describe('known bugs: the determiner an alarm cry cannot take', () => {
  it('withdraws the determiner from the alarm a cry raises', () => {
    expect(satellite({ verb: CRY_OUT, directObject: WOLF }, 'directObjectDefiniteness').available).toBe(false);
  });

  // It reads the flags, not the ids: any danger cried is an alarm. And the determiner is all that goes —
  // the alarm still takes a number ("cried wolves"), an adjective and a possessor, which the engine spells.
  it('withdraws it from every alarm, and withdraws nothing else from the object', () => {
    const FIRE: Concept = { ...concept('FIRE', 'noun'), alarm: true };
    expect(satellite({ verb: CRY_OUT, directObject: FIRE }, 'directObjectDefiniteness').available).toBe(false);
    for (const key of ['directObjectNumber', 'directObjectAdjective', 'directObjectPossessor']) {
      expect(satellite({ verb: CRY_OUT, directObject: WOLF }, key).available).toBe(true);
    }
  });

  // Regression: it is the pairing that licenses nothing, not either word on its own. The same danger
  // under another verb, and an ordinary cry under the same verb, both still take a determiner.
  it('leaves every other cry, and every other object, alone', () => {
    expect(satellite({ verb: SEE, directObject: WOLF }, 'directObjectDefiniteness').available).toBe(true);
    expect(satellite({ verb: CRY_OUT, directObject: WORD }, 'directObjectDefiniteness').available).toBe(true);
    // A danger with no verb yet is no cry: the determiner is there until CRY_OUT is picked.
    expect(satellite({ directObject: WOLF }, 'directObjectDefiniteness').available).toBe(true);
  });
});

// A179. Making a period an infinitive keeps a passive it already had (`setInfinitive` resets the tense,
// the aspect and the modals, not the voice), and the translation says it: "to be seen". But the voice
// control is withdrawn whenever the finite slot is taken, for the infinitive as for the command, so
// nothing on the canvas shows the passive or takes it back. Either fix passes: the control stays for
// the infinitive, or the infinitive takes the voice back to active, as the command does.
describe('known bugs: A179 a passive infinitive', () => {
  it('leaves a way to take back the passive the translation still says', () => {
    const sel = setInfinitive(setVoice({ verb: SEE, directObject: CAT }, 'passive'), true);
    expect(sel.verbVoice !== 'passive' || satellite(sel, 'verbVoice').available).toBe(true);
  });

  it('shows the infinitive’s passive as a set value, and takes it back to active', () => {
    const sel = setInfinitive(setVoice({ verb: SEE, directObject: CAT }, 'passive'), true);
    expect(satellite(sel, 'verbVoice')).toMatchObject({
      available: true,
      hasValue: true,
      valueLabel: 't(voice.value.passive)',
    });
    const active = setVoice(sel, 'active');
    expect(active.infinitive).toBe(true);
    expect(active.verbVoice).toBe('active');
    expect(satellite(active, 'verbVoice')).toMatchObject({ available: true, hasValue: false });
  });

  // Only the voice left the finite slot: the infinitive still withdraws the tense, the aspect and
  // the modals, and the voice still waits for a patient to promote.
  it('leaves the rest of the finite slot withdrawn under the infinitive', () => {
    expect(offered({ infinitive: true, verb: SEE, directObject: CAT, verbModal: WANT, verbModal2: CAN }, 'verb')).toEqual([
      'verbNegative',
      'verbVoice',
    ]);
    expect(satellite({ infinitive: true, verb: SEE }, 'verbVoice').available).toBe(false);
    expect(satellite({ infinitive: true, verb: SLEEP, directObject: CAT }, 'verbVoice').available).toBe(false);
  });

  // Regression: a command is always active, so its voice control stays withdrawn.
  it('withdraws the voice from a command', () => {
    const sel = setImperative(setVoice({ verb: SEE, directObject: CAT }, 'passive'), true);
    expect(sel.verbVoice).toBe('active');
    expect(satellite(sel, 'verbVoice').available).toBe(false);
  });
});
