import { describe, expect, it } from 'vitest';
import { buildSatellites } from '../../../src/components/PhraseBuilder/satellites/functions/buildSatellites.ts';
import { rawSatellites } from '../../../src/components/PhraseBuilder/satellites/functions/rawSatellites.tsx';
import { resolveSatellites } from '../../../src/components/PhraseBuilder/satellites/functions/resolveSatellites.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BIG, CAN, CAT, FRIEND, GO, I, RED, SEE, SLEEP, WANT, build, satellite, t } from '../fixtures.tsx';

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

// The list comes from rawSatellites and is settled by resolveSatellites, each tested on its own;
// these cover what only the two together decide.
describe('buildSatellites', () => {
  it.each<[string, PhraseSelection, Record<string, boolean>, boolean]>([
    ['a plain selection', { subject: FRIEND, subjectAdjective: BIG, verb: SEE }, { subjectAdjective: false }, false],
    ['a command', { imperative: true, subject: CAT, verb: SEE }, {}, true],
    ['an infinitive citation', { infinitive: true, subject: CAT, verb: SEE }, {}, true],
  ])('resolves the listed satellites for %s', (_, selection, revealed, subjectDropped) => {
    expect(buildSatellites(selection, revealed, 'en', t)).toEqual(
      resolveSatellites(rawSatellites(selection, 'en', t), { revealed, subjectDropped }),
    );
  });

  it('gives every satellite a distinct key, each listed in the shown map', () => {
    const { satellites, shownMap } = build({ verb: GO, subject: CAT, directObject: CAT });

    expect(new Set(satellites.map((s) => s.key)).size).toBe(satellites.length);
    expect(shownMap).toEqual(Object.fromEntries(satellites.map((s) => [s.key, s.shown])));
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

    // The voice is not in the finite slot: only a command forces the active, so an infinitive over a
    // patient still offers the control (A179).
    it('withdraws tense, aspect and every modal', () => {
      expect(offered(selection, 'verb')).toEqual(
        mood === 'infinitive' ? ['verbNegative', 'verbVoice'] : ['verbNegative'],
      );
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

  describe('the direct object', () => {
    it('is on the canvas before a word is chosen, and folds away when its control says so', () => {
      expect(satellite({ verb: SEE }, 'directObject')).toMatchObject({
        hasValue: false,
        shown: true,
      });
      expect(satellite({ verb: SEE }, 'directObject', { directObject: false }).shown).toBe(false);
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

  it('never offers a satellite whose parent satellite is withdrawn by a dropped subject', () => {
    const { satellites } = build({
      imperative: true,
      subject: CAT,
      subjectAdjective: BIG,
      subjectAdjective2: RED,
      verb: SEE,
      verbModal: WANT,
    });
    const byKey = new Map(satellites.map((s) => [s.key, s]));

    for (const s of satellites) {
      const parent = byKey.get(s.parent);
      if (s.available && parent) expect(parent.available).toBe(true);
    }
  });
});
