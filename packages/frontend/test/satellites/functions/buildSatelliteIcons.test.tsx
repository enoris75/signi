import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { buildSatelliteIcons } from '../../../src/components/PhraseBuilder/satellites/functions/buildSatelliteIcons.ts';
import type { Satellite } from '../../../src/components/PhraseBuilder/satellites/satellites.types.tsx';
import type {
  GenderSlot,
  NounKey,
  NumberSlot,
  PhraseSelection,
  WorkspaceBinding,
} from '../../../src/components/PhraseBuilder/interfaces.ts';
import { SatelliteButton, type SatelliteIcon } from '../../../src/components/PhraseBuilder/Boxes.tsx';
import { renderWithProviders } from '../../render.tsx';
import {
  BIG,
  CAT,
  FRIEND,
  GO,
  HOUSE,
  I,
  SEE,
  SHE,
  SLEEP,
  WANT,
  build,
  concept,
  glyph,
  t,
} from '../fixtures.tsx';

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
    t,
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
        // The voice rides the object's ring, not the verb's: the object is what a passive
        // promotes, and the verb's ring is full (A01).
        'verbVoice',
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
        label: 't(category.adjective)',
        labelKey: 'category.adjective',
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
        valueLabel: 't(status.linked) — t(hint.clickToRemove)',
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
          label: 't(satellite.relative)',
          active: false,
          isSet: false,
          valued: false,
          valueLabel: undefined,
          link: true,
        });
        relative.onToggle();
        expect(binding.relative.onStartLink).toHaveBeenCalledExactlyOnceWith('subject');
        expect(binding.relative.onRemoveLink).not.toHaveBeenCalled();
      });

      it('removes the link from a noun that already sources one', () => {
        const binding = workspace({ relativeSources: ['directObject'] });
        const { perimeterByNoun } = icons({ verb: SEE, directObject: CAT }, { binding });
        const relative = perimeterByNoun['directObject']!.relative!;

        // Set, but never active: a link reveals no box (A141).
        expect(relative).toMatchObject({
          active: false,
          isSet: true,
          valueLabel: 't(status.linked) — t(hint.clickToRemove)',
          link: true,
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

        expect(possessor).toMatchObject({
          label: 't(slot.possessor)',
          labelKey: 'slot.possessor',
          active: false,
          isSet: false,
        });
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
          label: 't(satellite.coordination)',
          active: false,
          isSet: false,
          valued: true,
          valueLabel: 't(action.addConjunct)',
        });
        conjunct.onToggle();
        expect(result.onAddConjunct).toHaveBeenCalledExactlyOnceWith('subject');
        expect(result.onToggleReveal).not.toHaveBeenCalled();
      });

      it('offers another conjunct once the noun is coordinated', () => {
        const result = icons({ verb: GO, predicative: CAT, predicativeConjuncts: [{}] });
        const conjunct = result.perimeterByNoun['predicative']!.conjunct!;

        expect(conjunct).toMatchObject({ isSet: true, valueLabel: 't(action.addAnotherConjunct)' });
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

// The same sorting, fed satellites written by hand rather than derived from a selection — so each
// rule is exercised on its own, whatever buildSatellites happens to offer.
describe('buildSatelliteIcons, on hand-built satellites', () => {
  const sat = (key: string, parent: string, extra: Partial<Satellite> = {}): Satellite => ({
    key,
    parent: parent as Satellite['parent'],
    label: key,
    icon: null,
    available: true,
    hasValue: false,
    shown: false,
    ...extra,
  });

  function sort(
    satellites: Satellite[],
    { shownMap = {}, collapsed = [] }: { shownMap?: Record<string, boolean>; collapsed?: string[] } = {},
  ) {
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
      linkBinding: undefined,
      t,
      ...callbacks,
    });
    return { ...result, ...callbacks };
  }

  it('sorts nothing into empty places', () => {
    expect(sort([])).toMatchObject({
      satelliteIconsByParent: {},
      complementToggleIcons: [],
      perimeterByNoun: {},
      directObjectToggle: undefined,
    });
  });

  it('keeps the satellites’ order within a parent', () => {
    const { satelliteIconsByParent } = sort([
      sat('subjectDefiniteness', 'subject'),
      sat('subjectAdjective', 'subject'),
    ]);

    expect(keysOf(satelliteIconsByParent['subject'])).toEqual([
      'subjectDefiniteness',
      'subjectAdjective',
    ]);
  });

  it('seats a control on a word regardless of the shown map, which only gates satellite boxes', () => {
    expect(sort([sat('subjectAdjective', 'subject')]).satelliteIconsByParent['subject']).toHaveLength(1);
  });

  it('seats a control on a satellite’s box only while the shown map says that box is open', () => {
    const chained = [sat('subjectAdjective2', 'subjectAdjective')];

    expect(sort(chained).satelliteIconsByParent['subjectAdjective']).toBeUndefined();
    expect(
      sort(chained, { shownMap: { subjectAdjective: true } }).satelliteIconsByParent['subjectAdjective'],
    ).toHaveLength(1);
  });

  it('flips a number or gender in place only when the satellite is a direct toggle', () => {
    const flipping = sort([sat('subjectNumber', 'subject', { directToggle: true })]);
    flipping.satelliteIconsByParent['subject']![0].onToggle();
    expect(flipping.onToggleNumber).toHaveBeenCalledExactlyOnceWith('subject');

    const revealing = sort([sat('subjectNumber', 'subject')]);
    revealing.satelliteIconsByParent['subject']![0].onToggle();
    expect(revealing.onToggleNumber).not.toHaveBeenCalled();
    expect(revealing.onToggleReveal).toHaveBeenCalledOnce();
  });

  it('carries a satellite’s own fields over to its control', () => {
    const { satelliteIconsByParent } = sort([
      sat('verbTense', 'verb', {
        label: 'Tense',
        labelKey: 'slot.adverb',
        shown: true,
        hasValue: true,
        alwaysSet: true,
        valueLabel: 'Past',
      }),
    ]);

    expect(satelliteIconsByParent['verb']![0]).toMatchObject({
      key: 'verbTense',
      label: 'Tense',
      labelKey: 'slot.adverb',
      active: true,
      isSet: true,
      valued: true,
      valueLabel: 'Past',
      directToggle: undefined,
    });
  });

  it('reads a possessor’s noun off its key, collapsed or not', () => {
    const { perimeterByNoun } = sort([sat('mannerPossessor', 'manner')], { collapsed: ['manner'] });

    expect(perimeterByNoun['manner']?.possessor?.key).toBe('mannerPossessor');
  });

  it('drops a relative-clause control without a workspace, but keeps coordination', () => {
    const { perimeterByNoun } = sort([
      sat('subjectRelative', 'subject'),
      sat('subjectConjunct', 'subject', { hasValue: true }),
    ]);

    expect(perimeterByNoun['subject']).toEqual({
      conjunct: expect.objectContaining({ key: 'subjectConjunct', isSet: true }),
    });
  });
});

// A141. The link controls start a link to a period in another container, or remove it, but their
// tooltip is worked out as a reveal's: it offers to "Show" what they link and, once linked, to "Hide" it.
// The verb is the catalog's reveal fallback in English, so a non-English UI reads it half in English
// ("Show Proposizione relativa"). The relative clause's linked face should read like the instrumental's.
describe('known bugs: the link controls’ tooltips', () => {
  const tooltip = (icon: SatelliteIcon) => {
    const { unmount } = renderWithProviders(<SatelliteButton sat={icon} color="primary" />);
    const label = screen.getByRole('button').getAttribute('aria-label');
    unmount();
    return label;
  };

  it('the relative clause control names the link, not a reveal', () => {
    const unlinked = icons({ subject: CAT }, { binding: workspace() }).perimeterByNoun['subject']!.relative!;
    const linked = icons({ subject: CAT }, { binding: workspace({ relativeSources: ['subject'] }) })
      .perimeterByNoun['subject']!.relative!;

    expect(tooltip(unlinked)).toBe('t(satellite.relative)');
    expect(tooltip(linked)).toBe('t(satellite.relative): t(status.linked) — t(hint.clickToRemove)');
  });

  it('the instrumental control names the link before one is made', () => {
    const unlinked = icons({ verb: GO }, { binding: workspace() }).complementToggleIcons.find(
      (icon) => icon.key === 'instrumental',
    )!;

    expect(tooltip(unlinked)).toBe('t(slot.instrumental)');
  });

  it('a linked relative clause still removes the link, and the linked face follows each noun', () => {
    const binding = workspace({ relativeSources: ['directObject'] });
    const { perimeterByNoun } = icons({ verb: SEE, subject: CAT, directObject: FRIEND }, { binding });

    expect(tooltip(perimeterByNoun['directObject']!.relative!)).toBe('t(satellite.relative): t(status.linked) — t(hint.clickToRemove)');
    expect(tooltip(perimeterByNoun['subject']!.relative!)).toBe('t(satellite.relative)');
    perimeterByNoun['directObject']!.relative!.onToggle();
    expect(binding.relative.onRemoveLink).toHaveBeenCalledExactlyOnceWith('directObject');
  });

  it('regression: a reveal control still offers to show and hide its box', () => {
    const shut = icons({ subject: CAT }).perimeterByNoun['subject']!.possessor!;
    const open = icons({ verb: GO, route: CAT, routePossessor: { subject: HOUSE } }).perimeterByNoun['route']!.possessor!;

    expect(shut.link).toBeUndefined();
    expect(tooltip(shut)).toBe('Show the possessor');
    expect(tooltip(open)).toBe('Hide the possessor');
  });

  it('regression: the instrumental’s linked face already names the link', () => {
    const linked = icons({ verb: GO }, { binding: workspace({ instrumentalLinked: true }) }).complementToggleIcons.find(
      (icon) => icon.key === 'instrumental',
    )!;

    expect(tooltip(linked)).toBe('t(slot.instrumental): t(status.linked) — t(hint.clickToRemove)');
  });
});
