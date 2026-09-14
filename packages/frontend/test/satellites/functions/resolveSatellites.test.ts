import { describe, expect, it } from 'vitest';
import { resolveSatellites } from '../../../src/components/PhraseBuilder/satellites/functions/resolveSatellites.ts';
import type {
  RawSatellite,
  ResolveSatellitesOptions,
} from '../../../src/components/PhraseBuilder/satellites/satellites.types.tsx';

// A satellite written by hand: licensed, empty, a reveal (not a direct toggle), with no default.
const sat = (key: string, extra: Partial<RawSatellite> = {}): RawSatellite => ({
  key,
  parent: 'verb',
  label: key,
  icon: null,
  available: true,
  hasValue: false,
  ...extra,
});

// The direct object as the list offers it: open by default.
const object = (extra: Partial<RawSatellite> = {}) => sat('directObject', { defaultShown: true, ...extra });

function resolve(raw: RawSatellite[], options: Partial<ResolveSatellitesOptions> = {}) {
  return resolveSatellites(raw, { revealed: {}, subjectDropped: false, ...options });
}

function one(s: RawSatellite, options: Partial<ResolveSatellitesOptions> = {}) {
  return resolve([s], options).satellites[0];
}

describe('resolveSatellites', () => {
  describe('whether a box is shown', () => {
    it.each<[string, Partial<RawSatellite>, Record<string, boolean>, boolean]>([
      ['an empty satellite stays folded', {}, {}, false],
      ['a satellite holding a value opens by itself', { hasValue: true }, {}, true],
      ['a satellite offered open opens while empty', { defaultShown: true }, {}, true],
      ['an explicit reveal opens an empty satellite', {}, { modifier: true }, true],
      ['an explicit hide folds a satellite holding a value', { hasValue: true }, { modifier: false }, false],
      ['an explicit hide folds one offered open', { defaultShown: true }, { modifier: false }, false],
      ['its default outranks its value', { defaultShown: false, hasValue: true }, {}, false],
    ])('%s', (_, extra, revealed, shown) => {
      expect(one(sat('modifier', extra), { revealed }).shown).toBe(shown);
    });

    it('never shows a direct toggle, which has no box, however it is revealed', () => {
      const toggle = sat('verbNegative', { directToggle: true, hasValue: true, defaultShown: true });

      expect(one(toggle, { revealed: { verbNegative: true } }).shown).toBe(false);
    });

    it('never shows a satellite that is not licensed, however it is revealed', () => {
      const unlicensed = sat('modifier', { available: false, hasValue: true });

      expect(one(unlicensed, { revealed: { modifier: true } })).toMatchObject({
        available: false,
        shown: false,
      });
    });

    it('reads the reveal state by the satellite’s own key', () => {
      expect(one(sat('modifier'), { revealed: { verbModal: true } }).shown).toBe(false);
    });
  });

  describe('a dropped subject', () => {
    const family = [sat('subjectAdjective', { hasValue: true }), sat('subjectNumber'), sat('subjectConjunct')];

    it('withdraws every satellite keyed off the subject, and folds its boxes', () => {
      const { satellites } = resolve([...family, sat('modifier', { hasValue: true })], {
        subjectDropped: true,
      });

      expect(satellites.filter((s) => s.available).map((s) => s.key)).toEqual(['modifier']);
      expect(satellites.filter((s) => s.shown).map((s) => s.key)).toEqual(['modifier']);
    });

    it('leaves the subject family alone while the subject is on the canvas', () => {
      const { satellites } = resolve(family);

      expect(satellites.every((s) => s.available)).toBe(true);
      expect(satellites[0].shown).toBe(true);
    });
  });

  describe('a folded direct object', () => {
    const family = [sat('directObjectAdjective', { hasValue: true }), sat('directObjectPossessor')];

    it('keeps the object’s family while its box is open', () => {
      const { satellites } = resolve([object(), ...family]);

      expect(satellites.map((s) => s.available)).toEqual([true, true, true]);
    });

    it('withdraws the family, but not the object’s own control, once the box is folded away', () => {
      const { satellites } = resolve([object(), ...family], { revealed: { directObject: false } });

      expect(satellites.map((s) => [s.key, s.available])).toEqual([
        ['directObject', true],
        ['directObjectAdjective', false],
        ['directObjectPossessor', false],
      ]);
      expect(satellites.some((s) => s.shown)).toBe(false);
    });

    it('withdraws the family when the object itself is not licensed', () => {
      const { satellites } = resolve([object({ available: false }), ...family]);

      expect(satellites.some((s) => s.available)).toBe(false);
    });

    it('withdraws the family when there is no object satellite to hang it off', () => {
      expect(resolve(family).satellites.some((s) => s.available)).toBe(false);
    });

    it('folds the object by the same rule as any box, so an object not offered open stays folded while empty', () => {
      const { satellites } = resolve([object({ defaultShown: undefined }), ...family]);

      expect(satellites.map((s) => s.available)).toEqual([true, false, false]);
    });

    it('leaves satellites outside the object’s family alone', () => {
      const { satellites } = resolve([object(), sat('modifier')], { revealed: { directObject: false } });

      expect(satellites[1].available).toBe(true);
    });
  });

  it('keeps the list’s order and every field it was given', () => {
    const raw = [
      sat('verbTense', { alwaysSet: true, valueLabel: 'Past', hasValue: true, labelKey: 'slot.adverb' }),
      sat('subjectAdjective', { parent: 'subject' }),
    ];

    expect(resolve(raw).satellites).toEqual([
      { ...raw[0], shown: true },
      { ...raw[1], shown: false },
    ]);
  });

  it('maps every key to whether its box is shown', () => {
    const { shownMap } = resolve([sat('modifier', { hasValue: true }), sat('verbModal')]);

    expect(shownMap).toEqual({ modifier: true, verbModal: false });
  });

  it('leaves the list it was handed untouched', () => {
    const raw = [object(), sat('directObjectAdjective', { hasValue: true })];
    const before = structuredClone(raw);

    resolve(raw, { revealed: { directObject: false }, subjectDropped: true });

    expect(raw).toEqual(before);
  });
});
