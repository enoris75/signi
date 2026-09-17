import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import type { Concept, GrammaticalRole } from '@signi/shared';
import type {
  PhraseSelection,
  WorkspaceBinding,
} from '../src/components/PhraseBuilder/interfaces.ts';
import {
  PhraseBuilder,
  type PhraseBuilderProps,
} from '../src/components/PhraseBuilder/PhraseBuilder.tsx';
import type { PhraseSidebar } from '../src/components/PhraseBuilder/PhraseSidebar.tsx';
import { renderWithProviders } from './render.tsx';

// jsdom has no ResizeObserver: the canvas reads as a fixed 600 px wide.
vi.mock('../src/components/PhraseBuilder/hooks/useElementSize.ts', () => ({
  useElementSize: (_ref: unknown, initial: { w: number; h: number }) => initial,
}));
// Nor any layout: the period's compact controls reach nowhere into the canvas.
vi.mock('../src/components/PhraseBuilder/hooks/useCornerOverlap.ts', () => ({
  useCornerOverlap: () => ({ w: 0, h: 0 }),
}));
// Every box measures 0×0 in jsdom, so the resolver would shove boxes about on no real footprint.
vi.mock('../src/components/PhraseBuilder/hooks/useOverlapResolution.ts', () => ({
  useOverlapResolution: () => {},
}));
// The words panel lists whole vocabularies and its word map loads the entire lexicon. The stub
// records what the period hands it, keyed by the element it renders.
const wordsPanels = vi.hoisted(() => new Map<Element, unknown>());
vi.mock('../src/components/PhraseBuilder/PhraseSidebar.tsx', () => ({
  PhraseSidebar: (props: unknown) => (
    <div
      data-testid="words-panel"
      ref={(el) => {
        if (el) wordsPanels.set(el, props);
      }}
    />
  ),
}));

// jsdom implements no pointer capture, which the canvas drag takes on every press.
Element.prototype.setPointerCapture = () => {};

type Updater = (prev: PhraseSelection) => PhraseSelection;
type WordsPanelProps = ComponentProps<typeof PhraseSidebar>;

const concept = (id: string, role: GrammaticalRole, extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: id,
  label: id.toLowerCase(),
  ...extra,
});

const BOY = concept('BOY', 'noun');
const CAT = concept('CAT', 'noun');
const DOG = concept('DOG', 'noun');
const HORSE = concept('HORSE', 'noun');
const HOUSE = concept('HOUSE', 'noun');
const PARK = concept('PARK', 'noun');
const SAIL = concept('SAIL', 'noun');
const GIRL = concept('GIRL', 'noun', { gendered: true });
const THIRD = concept('THIRD_PERSON', 'pronoun', { person: '3' });
const EAT = concept('EAT', 'verb', { transitivity: 'transitive' });
const SLEEP = concept('SLEEP', 'verb', { transitivity: 'intransitive' });
const WALK = concept('WALK', 'verb', {
  transitivity: 'intransitive',
  complements: ['route', 'locative', 'cause'],
});
const BIG = concept('BIG', 'adjective');

const CONCEPTS = {
  noun: [BOY, CAT, DOG, HORSE, HOUSE, PARK, SAIL, GIRL],
  pronoun: [THIRD],
  verb: [EAT, SLEEP, WALK],
  adjective: [BIG],
  adverb: [],
};

type Compartments = Omit<WorkspaceBinding, 'containerId' | 'pickActive'>;
type BindingOverrides = { [K in keyof Compartments]?: Partial<Compartments[K]> };

// A workspace binding with nothing linked and every hook a spy.
function makeBinding(overrides: BindingOverrides = {}): WorkspaceBinding {
  const base: WorkspaceBinding = {
    containerId: 'c1',
    pickActive: false,
    geometry: {
      registerBox: vi.fn(),
      registerSourceAnchor: vi.fn(),
      registerTargetAnchor: vi.fn(),
      registerBorderAnchor: vi.fn(),
      registerVerbAnchor: vi.fn(),
      onGeometryChange: vi.fn(),
    },
    relative: {
      sourceKeys: new Set(),
      targetKeys: new Set(),
      isPickTarget: () => false,
      onPick: vi.fn(),
      onStartLink: vi.fn(),
      onRemoveLink: vi.fn(),
    },
    conditional: {
      hasSource: false,
      hasTarget: false,
      isPickTarget: false,
      onStart: vi.fn(),
      onClear: vi.fn(),
      onPick: vi.fn(),
    },
    coordinative: {
      hasSource: false,
      hasTarget: false,
      isPickTarget: false,
      onStart: vi.fn(),
      onClear: vi.fn(),
      onPick: vi.fn(),
    },
    instrumental: {
      hasSource: false,
      hasTarget: false,
      level: 'object',
      onLevelChange: vi.fn(),
      isPickTarget: false,
      onStart: vi.fn(),
      onClear: vi.fn(),
      onPick: vi.fn(),
    },
  };
  return {
    ...base,
    geometry: { ...base.geometry, ...overrides.geometry },
    relative: { ...base.relative, ...overrides.relative },
    conditional: { ...base.conditional, ...overrides.conditional },
    coordinative: { ...base.coordinative, ...overrides.coordinative },
    instrumental: { ...base.instrumental, ...overrides.instrumental },
  };
}

type PeriodProps = Omit<PhraseBuilderProps, 'selection' | 'onPhraseUpdate'>;

// The period as its owner holds it: every updater the builder hands up is recorded, then
// applied, so the canvas re-renders on the selection it produced.
function renderPeriod(initial: PhraseSelection = {}, props: PeriodProps = {}) {
  const onPhraseUpdate = vi.fn<(updater: Updater) => void>();
  const state = { selection: initial };
  function Period() {
    const [selection, setSelection] = useState(initial);
    state.selection = selection;
    return (
      <PhraseBuilder
        {...props}
        selection={selection}
        onPhraseUpdate={(updater) => {
          onPhraseUpdate(updater);
          setSelection(updater);
        }}
      />
    );
  }
  const view = renderWithProviders(<Period />, { concepts: CONCEPTS });
  // The updater of the latest edit, applied to `prev`.
  const lastEdit = (prev: PhraseSelection) => onPhraseUpdate.mock.calls.at(-1)![0](prev);
  return { ...view, onPhraseUpdate, lastEdit, selection: () => state.selection };
}

// A press that never travelled: what the canvas drag machinery reads as a click on a box.
function press(el: HTMLElement) {
  fireEvent.pointerDown(el);
  fireEvent.pointerUp(el);
}

const box = (key: string) => screen.getByTestId(`box-${key}`);
const boxes = () => screen.queryAllByTestId(/^box-/).map((b) => b.dataset['testid']!.slice(4));
const groups = () => screen.queryAllByTestId('group-box').map((g) => g.dataset['group']);
const satellite = (key: string) => screen.getByTestId(`satellite-${key}`);

// The words panel of the outermost period (a nested builder's panel renders before it).
const wordsPanel = () =>
  wordsPanels.get(screen.getAllByTestId('words-panel').at(-1)!) as WordsPanelProps;

// Pick a word from an open picker's list.
const pickOption = (id: string) =>
  fireEvent.click(
    screen.getAllByTestId('typeahead-option').find((o) => o.dataset['concept'] === id)!,
  );

describe('PhraseBuilder', () => {
  describe('an empty period', () => {
    it('offers the opening subject picker instead of a canvas', () => {
      renderPeriod();

      expect(screen.getByTestId('typeahead-subject')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Noun' })).toHaveAttribute('aria-pressed', 'true');
      expect(boxes()).toEqual(['subject']);
      expect(groups()).toEqual([]);
    });

    it('picks the subject into its slot and moves on to the verb', () => {
      const { lastEdit } = renderPeriod();

      pickOption('CAT');

      expect(lastEdit({})).toEqual({ subject: CAT });
      expect(within(box('verb')).getByTestId('typeahead-verb')).toBeInTheDocument();
    });

    it('commits the pronoun chooser’s number and gender with the pronoun', () => {
      const { lastEdit } = renderPeriod();
      fireEvent.click(screen.getByTestId('pronoun-tab'));
      fireEvent.click(screen.getByRole('button', { name: 'third' }));
      fireEvent.click(screen.getByRole('button', { name: 'plural' }));
      fireEvent.click(screen.getByRole('button', { name: 'female' }));

      fireEvent.click(screen.getByTestId('pronoun-commit'));

      expect(lastEdit({ subjectGender: 'masc' })).toEqual({
        subject: THIRD,
        subjectNumber: 'plural',
        subjectGender: 'fem',
      });
    });

    it('shares the word class between the box’s switch and the picker’s tabs', () => {
      renderPeriod();

      fireEvent.click(screen.getByRole('button', { name: 'Pronoun' }));

      expect(screen.getByTestId('pronoun-tab')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('button', { name: 'Pronoun' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  describe('the canvas', () => {
    it('opens on the subject and verb once a subject is chosen', () => {
      renderPeriod({ subject: CAT });

      expect(boxes()).toEqual(['subject', 'verb']);
      expect(groups()).toEqual(['Subject', 'Verb Phrase']);
      expect(screen.queryByTestId('typeahead-subject')).not.toBeInTheDocument();
    });

    it('opens for a verb alone', () => {
      renderPeriod({ verb: SLEEP });

      expect(boxes()).toEqual(['subject', 'verb']);
    });

    it('offers the direct object once a transitive verb is chosen', () => {
      renderPeriod({ subject: CAT, verb: EAT });

      expect(boxes()).toEqual(['subject', 'verb', 'directObject']);
      expect(groups()).toEqual(['Subject', 'Verb Phrase', 'Direct Object']);
    });

    it('offers no direct object to an intransitive verb', () => {
      renderPeriod({ subject: CAT, verb: SLEEP });

      expect(boxes()).toEqual(['subject', 'verb']);
    });

    it('draws only the subject box for a bare noun phrase', () => {
      renderPeriod({ subject: CAT }, { nounPhraseOnly: true });

      expect(boxes()).toEqual(['subject']);
      expect(groups()).toEqual(['Subject']);
      expect(screen.queryByTestId('satellite-verbNegative')).not.toBeInTheDocument();
    });

    it('draws an object-level instrument as a bare noun phrase', () => {
      const binding = makeBinding({ instrumental: { hasTarget: true, level: 'object' } });
      renderPeriod({ subject: CAT }, { binding });

      expect(boxes()).toEqual(['subject']);
    });

    it('draws an instrument act as its verb phrase from the start, with no subject', () => {
      const binding = makeBinding({ instrumental: { hasTarget: true, level: 'process' } });
      renderPeriod({}, { binding });

      expect(boxes()).toEqual(['verb']);
      expect(groups()).toEqual(['Verb Phrase']);
    });
  });

  describe('a command or an infinitive', () => {
    it('replaces the subject with the command box and opens the canvas at once', () => {
      renderPeriod({ imperative: true });

      expect(boxes()).toEqual(['verb']);
      expect(screen.getByRole('button', { name: 'Order' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByTestId('satellite-subjectNumber')).not.toBeInTheDocument();
    });

    it('replaces the subject with the infinitive box', () => {
      renderPeriod({ infinitive: true, subject: CAT });

      expect(boxes()).toEqual(['verb']);
      expect(within(screen.getByTestId('infinitive-box')).getByText('Infinitive phrase')).toBeInTheDocument();
    });

    it('turns a command on and moves the focus to the verb to command', () => {
      const { lastEdit } = renderPeriod();

      fireEvent.click(screen.getByRole('button', { name: 'Command' }));

      expect(lastEdit({ verbModal: EAT })).toMatchObject({
        imperative: true,
        imperativePerson: '2sg',
        verbModal: undefined,
      });
      expect(within(box('verb')).getByTestId('typeahead-verb')).toBeInTheDocument();
    });

    it('turns an infinitive on and moves the focus to the verb to cite', () => {
      const { lastEdit } = renderPeriod({ subject: CAT });

      fireEvent.click(screen.getByRole('button', { name: 'Infinitive phrase' }));

      expect(lastEdit({ imperative: true })).toMatchObject({ infinitive: true, imperative: false });
      expect(within(box('verb')).getByTestId('typeahead-verb')).toBeInTheDocument();
    });

    it('leaves the focus where it was when the verb is already chosen', () => {
      renderPeriod({ subject: CAT, verb: EAT });

      fireEvent.click(screen.getByRole('button', { name: 'Command' }));
      expect(wordsPanel().activeSlot).toBe('subject');

      fireEvent.click(screen.getByRole('button', { name: 'Infinitive phrase' }));
      expect(wordsPanel().activeSlot).toBe('subject');
    });

    it('leaves the focus where it was when turning a command off', () => {
      renderPeriod({ imperative: true });
      act(() => wordsPanel().onSlotClick('modifier'));

      fireEvent.click(screen.getByRole('button', { name: 'Command' }));

      expect(wordsPanel().activeSlot).toBe('modifier');
    });

    it('sets whom the command addresses and the register it is spoken in', () => {
      const { lastEdit } = renderPeriod({ imperative: true });

      fireEvent.click(screen.getByRole('button', { name: 'first plural' }));
      expect(lastEdit({ imperative: true })).toEqual({ imperative: true, imperativePerson: '1pl' });

      fireEvent.click(screen.getByRole('button', { name: 'Instruction' }));
      expect(lastEdit({ imperative: true })).toEqual({
        imperative: true,
        imperativeRegister: 'instruction',
      });
    });

    it.each([
      ['conditional', 'hasSource'],
      ['conditional', 'hasTarget'],
      ['coordinative', 'hasSource'],
      ['coordinative', 'hasTarget'],
    ] as const)('locks the mood while the period is in a %s (%s)', (relation, end) => {
      renderPeriod({ subject: CAT }, { binding: makeBinding({ [relation]: { [end]: true } }) });

      expect(screen.getByRole('button', { name: 'Command' })).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Infinitive phrase' }),
      ).toBeDisabled();
    });

    it('leaves the mood free in a workspace period with no clause relation', () => {
      renderPeriod({ subject: CAT }, { binding: makeBinding() });

      expect(screen.getByRole('button', { name: 'Command' })).toBeEnabled();
      expect(
        screen.getByRole('button', { name: 'Infinitive phrase' }),
      ).toBeEnabled();
    });
  });

  describe('picking a word', () => {
    it('sends the focus back to an empty subject after the verb', () => {
      const { lastEdit } = renderPeriod();

      act(() => wordsPanel().onConceptSelect(EAT, 'verb'));

      expect(lastEdit({})).toEqual({ verb: EAT });
      expect(within(box('subject')).getByTestId('typeahead-subject')).toBeInTheDocument();
    });

    it('moves on from the verb to the first word it still wants', () => {
      renderPeriod({ subject: CAT });

      act(() => wordsPanel().onConceptSelect(EAT, 'verb'));

      expect(within(box('directObject')).getByTestId('typeahead-noun')).toBeInTheDocument();
    });

    it('moves a command on from the verb to its object, past the dropped subject', () => {
      renderPeriod({ imperative: true });

      act(() => wordsPanel().onConceptSelect(EAT, 'verb'));

      expect(within(box('directObject')).getByTestId('typeahead-noun')).toBeInTheDocument();
    });

    // The cursor is `activeSlot`, so it is never nowhere: with nothing left to fill the picker
    // closes and the cursor stays on the word just chosen (P01 §1).
    it('closes the picker after a verb that wants nothing more, leaving the cursor on it', () => {
      renderPeriod({ subject: CAT });

      act(() => wordsPanel().onConceptSelect(SLEEP, 'verb'));

      expect(within(box('verb')).queryByTestId('typeahead-verb')).not.toBeInTheDocument();
      expect(wordsPanel().activeSlot).toBe('verb');
    });

    it('re-picks a filled word in place without moving the focus on', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: EAT });

      act(() => wordsPanel().onConceptSelect(DOG, 'subject'));

      expect(lastEdit({ subject: CAT, verb: EAT })).toEqual({ subject: DOG, verb: EAT });
      expect(wordsPanel().activeSlot).toBe('subject');
    });

    it('fills the active slot when the words panel names none', () => {
      const { lastEdit } = renderPeriod({ subject: CAT });
      act(() => wordsPanel().onSlotClick('verb'));

      act(() => wordsPanel().onConceptSelect(SLEEP));

      expect(lastEdit({ subject: CAT })).toEqual({ subject: CAT, verb: SLEEP });
    });

    it('changes the word under the cursor when the words panel names no slot', () => {
      const { lastEdit } = renderPeriod({ subject: CAT });
      act(() => wordsPanel().onConceptSelect(SLEEP, 'verb'));

      act(() => wordsPanel().onConceptSelect(EAT));

      expect(lastEdit({ subject: CAT, verb: SLEEP })).toEqual({ subject: CAT, verb: EAT });
    });

    it('opens a filled word’s picker over it, and restores the word when focus leaves', () => {
      renderPeriod({ subject: CAT, verb: EAT });

      press(box('verb'));
      expect(within(box('verb')).getByTestId('typeahead-verb')).toBeInTheDocument();
      expect(wordsPanel().activeSlot).toBe('verb');

      fireEvent.focusOut(screen.getByTestId('typeahead-verb'), { relatedTarget: document.body });
      expect(screen.queryByTestId('typeahead-verb')).not.toBeInTheDocument();
      expect(box('verb')).toHaveTextContent('eat');
    });

    it('closes a word’s picker once the new word is chosen', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: EAT, directObject: HORSE });
      press(box('directObject'));

      pickOption('HOUSE');

      expect(lastEdit({ directObject: HORSE })).toEqual({ directObject: HOUSE });
      expect(screen.queryByTestId('typeahead-noun')).not.toBeInTheDocument();
      expect(box('directObject')).toHaveTextContent('house');
    });

    it('opens a re-picked word on its own word class', () => {
      renderPeriod({ subject: THIRD, verb: SLEEP });

      press(box('subject'));

      expect(screen.getByTestId('pronoun-tab')).toHaveAttribute('aria-selected', 'true');

      fireEvent.click(screen.getByTestId('pronoun-tab-noun'));

      expect(screen.getByTestId('pronoun-tab-noun')).toHaveAttribute('aria-selected', 'true');
    });

    it('closes the picker once an adjective is chosen', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: SLEEP });
      fireEvent.click(satellite('subjectAdjective'));
      expect(screen.getByPlaceholderText('type an adjective…')).toBeInTheDocument();

      pickOption('BIG');

      expect(lastEdit({ subject: CAT })).toEqual({ subject: CAT, subjectAdjective: BIG });
      // The next link in the chain is opened from this very box, so the cursor stays on it.
      expect(wordsPanel().activeSlot).toBe('subjectAdjective');
    });
  });

  describe('clearing', () => {
    it('clears a word with everything that hung off it', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, subjectAdjective: BIG, verb: SLEEP });

      fireEvent.click(screen.getByRole('button', { name: 'Clear the subject' }));

      expect(lastEdit({ subject: CAT, subjectAdjective: BIG, verb: SLEEP })).toEqual({
        verb: SLEEP,
      });
    });

    it('returns the focus to the verb box when the verb is cleared', () => {
      renderPeriod({ subject: CAT, verb: EAT });

      fireEvent.click(screen.getByRole('button', { name: 'Clear the verb' }));

      expect(within(box('verb')).getByTestId('typeahead-verb')).toBeInTheDocument();
    });

    it('leaves the focus alone when any other word is cleared', () => {
      renderPeriod({ subject: CAT, verb: EAT, directObject: HORSE });

      fireEvent.click(screen.getByRole('button', { name: 'Clear the object' }));

      expect(wordsPanel().activeSlot).toBe('subject');
    });

    it('removes a complement, folds its box away and hands the focus back to the verb', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: WALK });
      fireEvent.click(satellite('locative'));
      expect(wordsPanel().activeSlot).toBe('locative');
      pickOption('HOUSE');

      fireEvent.click(screen.getByRole('button', { name: 'Remove the locative' }));

      expect(lastEdit({ verb: WALK, locative: HOUSE, locativeSpecifier: 'under' })).toEqual({
        verb: WALK,
      });
      expect(boxes()).not.toContain('locative');
      expect(wordsPanel().activeSlot).toBe('verb');
    });

    it('keeps the focus when the complement removed was not the one in hand', () => {
      renderPeriod({ subject: CAT, verb: WALK, locative: HOUSE });

      fireEvent.click(screen.getByRole('button', { name: 'Remove the locative' }));

      expect(boxes()).not.toContain('locative');
      expect(wordsPanel().activeSlot).toBe('subject');
    });
  });

  describe('the grammatical controls', () => {
    it('reveals an empty satellite with its picker in hand, and folds it away again', () => {
      renderPeriod({ subject: CAT, verb: SLEEP });

      fireEvent.click(satellite('modifier'));
      expect(within(box('modifier')).getByPlaceholderText('type an adverb…')).toBeInTheDocument();
      expect(wordsPanel().activeSlot).toBe('modifier');

      fireEvent.click(satellite('modifier'));
      expect(boxes()).not.toContain('modifier');
    });

    it('folds the direct object away from its control', () => {
      renderPeriod({ subject: CAT, verb: EAT, directObject: HORSE });

      fireEvent.click(satellite('directObject'));

      expect(boxes()).toEqual(['subject', 'verb']);
    });

    it('flips the subject’s number and the verb’s polarity in place', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: SLEEP });

      fireEvent.click(satellite('subjectNumber'));
      expect(lastEdit({ subjectNumber: 'singular' })).toEqual({ subjectNumber: 'plural' });

      fireEvent.click(satellite('verbNegative'));
      expect(lastEdit({})).toEqual({ verbNegative: true });
    });

    it('cycles the gender of the noun whose control is pressed', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: EAT, directObject: GIRL });

      fireEvent.click(satellite('directObjectGender'));

      expect(lastEdit({ directObject: GIRL })).toEqual({
        directObject: GIRL,
        directObjectGender: 'fem',
      });
    });

    it('cycles the tense and the aspect from their boxes, which open without the focus', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: SLEEP });
      fireEvent.click(satellite('verbTense'));
      fireEvent.click(satellite('verbAspect'));
      expect(wordsPanel().activeSlot).toBe('subject');

      press(box('verbTense'));
      expect(lastEdit({ verbTense: 'past' })).toEqual({ verbTense: 'future' });

      press(box('verbAspect'));
      expect(lastEdit({})).toEqual({ verbAspect: 'progressive' });
    });

    it('sets a noun’s determiner from its menu', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, verb: EAT, directObject: HORSE });
      fireEvent.click(satellite('directObjectDefiniteness'));

      press(box('directObjectDefiniteness'));
      fireEvent.click(screen.getByRole('menuitem', { name: /Paucal/ }));

      expect(lastEdit({ subjectDefiniteness: 'this' })).toEqual({
        subjectDefiniteness: 'this',
        directObjectDefiniteness: 'few',
      });
    });

    it('sets the route’s and the locative’s relations and the cause’s stance', () => {
      const { lastEdit } = renderPeriod({
        subject: CAT,
        verb: WALK,
        route: PARK,
        locative: HOUSE,
        cause: DOG,
      });
      const [routeUnder, locativeUnder] = screen.getAllByRole('button', { name: 'under' });

      fireEvent.click(routeUnder!);
      expect(lastEdit({})).toEqual({ routeSpecifier: 'under' });

      fireEvent.click(locativeUnder!);
      expect(lastEdit({})).toEqual({ locativeSpecifier: 'under' });

      fireEvent.click(screen.getByRole('button', { name: 'Positive — thanks to' }));
      expect(lastEdit({})).toEqual({ causeSentiment: 'positive' });
    });

    it('cycles a noun modifier’s relation and number, and sets the adjective describing it', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, subjectAdjective: SAIL, verb: SLEEP });

      fireEvent.click(screen.getByLabelText(/^Relationship:/));
      expect(lastEdit({})).toEqual({ modifierRelations: { subjectAdjective: 'purpose' } });

      fireEvent.click(screen.getByLabelText(/^Number: .* — click to change$/));
      expect(lastEdit({})).toEqual({ modifierNumbers: { subjectAdjective: 'plural' } });

      fireEvent.click(screen.getByLabelText('Add an adjective that describes this modifier'));
      pickOption('BIG');
      expect(lastEdit({})).toEqual({ modifierAdjectives: { subjectAdjective: BIG } });
    });

    it('cycles a real adjective’s degree', () => {
      const { lastEdit } = renderPeriod({ subject: CAT, subjectAdjective: BIG, verb: SLEEP });

      fireEvent.click(screen.getByLabelText(/^Degree:/));

      expect(lastEdit({})).toEqual({ adjectiveDegrees: { subjectAdjective: 'more' } });
    });
  });

  // A noun's owner is filled from its possessor control, one of two ways: named, in a ring of its own
  // on the period's canvas, or pointed to — a dashed line to another noun's ring.
  describe('a possessor', () => {
    const possessorControls = () => screen.getAllByTestId(/^satellite-\w+Possessor$/);
    const clearPossessor = () => screen.queryAllByRole('button', { name: 'Clear the possessor' });

    it('names the owner in a ring on the period’s canvas, its word landing in the possessor slice', () => {
      const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });

      fireEvent.click(satellite('subjectPossessor'));
      pickOption('BOY');

      expect(selection()).toEqual({
        subject: CAT,
        verb: SLEEP,
        subjectPossessor: { subject: BOY },
      });
      expect(screen.getAllByTestId('phrase-canvas')).toHaveLength(1);
      expect(screen.getAllByTestId('period-container')).toHaveLength(1);
      expect(groups()).toEqual(['Subject', 'Verb Phrase', 'Subject']);
      expect(clearPossessor()).toHaveLength(1);
    });

    it('draws the owner as a bare noun phrase, with no verb of its own', () => {
      renderPeriod(
        { subject: CAT, verb: EAT, subjectPossessor: { subject: BOY } },
        { binding: makeBinding() },
      );

      // The period's verb alone: the plan reads only a possessor's head, so its verb would be lost.
      expect(screen.getAllByTestId('box-subject')).toHaveLength(2);
      expect(screen.getAllByTestId('box-verb')).toHaveLength(1);
      // Its head still sources a relative clause, which is how a clause reaches a possessor.
      expect(screen.getAllByTestId('satellite-subjectRelative')).toHaveLength(2);
    });

    it('offers nouns alone for the owner’s head', () => {
      renderPeriod({ subject: CAT, verb: SLEEP });

      fireEvent.click(satellite('subjectPossessor'));

      // A pronoun owner is a pointed-to one: the empty ring's picker has no pronoun tab.
      expect(screen.getByTestId('typeahead-noun')).toBeInTheDocument();
      expect(screen.queryByTestId('pronoun-tab')).not.toBeInTheDocument();
    });

    it('gives the owner’s head no coordination: the plan reads an owner as one noun phrase', () => {
      renderPeriod({ subject: CAT, verb: SLEEP, subjectPossessor: { subject: BOY } });

      expect(screen.getAllByTestId('satellite-subjectConjunct')).toHaveLength(1);
    });

    it('lights up the nouns an opened owner could point to instead, and points to the one clicked', () => {
      const { lastEdit } = renderPeriod({ subject: BOY, verb: EAT, directObject: HORSE });

      fireEvent.click(satellite('directObjectPossessor'));
      // The empty owner's ring is its picker; the boy is lit, never the horse or the empty owner.
      expect(clearPossessor()).toHaveLength(0);
      expect(screen.getAllByTestId('box-subject')).toHaveLength(2);
      expect(pickable()).toEqual(['subject']);

      press(screen.getAllByTestId('box-subject')[0]!);

      expect(lastEdit({ directObject: HORSE })).toEqual({
        directObject: HORSE,
        directObjectPossessorRef: 'subject',
      });
      expect(pickable()).toEqual([]);
      // The empty ring goes; a dashed line to the boy carries the pronoun it renders.
      expect(screen.getAllByTestId('box-subject')).toHaveLength(1);
      expect(screen.getByTestId('pronoun-chip')).toHaveTextContent('his');
      expect(satellite('directObjectPossessor')).toHaveAccessibleName(
        'Possessor: points to boy (“his”) — click to remove',
      );
    });

    it('stops lighting up nouns once the owner is named', () => {
      renderPeriod({ subject: BOY, verb: EAT, directObject: HORSE });
      fireEvent.click(satellite('directObjectPossessor'));

      pickOption('DOG');

      expect(pickable()).toEqual([]);
      expect(screen.queryByTestId('pronoun-chip')).not.toBeInTheDocument();
    });

    it('closes an empty owner from its control, ending the pick', () => {
      renderPeriod({ subject: BOY, verb: EAT, directObject: HORSE });
      fireEvent.click(satellite('directObjectPossessor'));

      fireEvent.click(satellite('directObjectPossessor'));

      expect(screen.getAllByTestId('box-subject')).toHaveLength(1);
      expect(pickable()).toEqual([]);
    });

    it('folds a named owner’s ring away and back, keeping the owner', () => {
      const { onPhraseUpdate } = renderPeriod({
        subject: CAT,
        verb: SLEEP,
        subjectPossessor: { subject: BOY },
      });

      fireEvent.click(possessorControls()[0]!);
      expect(clearPossessor()).toHaveLength(0);

      fireEvent.click(possessorControls()[0]!);
      expect(clearPossessor()).toHaveLength(1);
      expect(onPhraseUpdate).not.toHaveBeenCalled();
    });

    it('takes a pointed-to owner away from its control', () => {
      const { lastEdit } = renderPeriod({
        subject: BOY,
        verb: EAT,
        directObject: HORSE,
        directObjectPossessorRef: 'subject',
      });
      expect(screen.getByTestId('pronoun-chip')).toBeInTheDocument();

      fireEvent.click(satellite('directObjectPossessor'));

      expect(lastEdit({ directObject: HORSE, directObjectPossessorRef: 'subject' })).toEqual({
        directObject: HORSE,
      });
      expect(screen.queryByTestId('pronoun-chip')).not.toBeInTheDocument();
    });

    it('removes a named owner from its ring, with the owners it holds and their relative clauses', () => {
      const binding = makeBinding();
      const period: PhraseSelection = {
        subject: CAT,
        verb: SLEEP,
        subjectPossessor: { subject: BOY, subjectPossessor: { subject: DOG } },
      };
      const { lastEdit } = renderPeriod(period, { binding });

      // The boy's ring comes first: owners are drawn parents first.
      fireEvent.click(screen.getAllByRole('button', { name: 'Remove this possessor' })[0]!);

      expect(lastEdit(period)).toEqual({ subject: CAT, verb: SLEEP });
      expect(vi.mocked(binding.relative.onRemoveLink).mock.calls).toEqual([
        ['subject/possessor'],
        ['subject/possessor/possessor'],
      ]);
      expect(clearPossessor()).toHaveLength(0);
    });

    it('draws an owner’s owner and a conjunct’s owner on the one canvas, editing each at its address', () => {
      const { selection } = renderPeriod({
        subject: CAT,
        verb: SLEEP,
        subjectConjuncts: [{ subject: DOG, subjectPossessor: { subject: HORSE } }],
        subjectPossessor: { subject: BOY },
      });
      expect(screen.getAllByTestId('phrase-canvas')).toHaveLength(1);
      expect(clearPossessor()).toHaveLength(2);

      // The boy's own control, on his ring: the period's subject's, the dog's (a conjunct's ring is
      // drawn before the owners'), the boy's, the horse's.
      fireEvent.click(possessorControls()[2]!);
      pickOption('PARK');

      expect(selection().subjectPossessor).toEqual({ subject: BOY, subjectPossessor: { subject: PARK } });
      expect(selection().subjectConjuncts).toEqual([{ subject: DOG, subjectPossessor: { subject: HORSE } }]);
      expect(clearPossessor()).toHaveLength(3);
    });

    it('unlinks a conjunct’s owner by its full address', () => {
      const binding = makeBinding();
      renderPeriod(
        { subject: CAT, verb: SLEEP, subjectConjuncts: [{ subject: DOG, subjectPossessor: { subject: BOY } }] },
        { binding },
      );

      fireEvent.click(screen.getByRole('button', { name: 'Remove this possessor' }));

      expect(binding.relative.onRemoveLink).toHaveBeenCalledExactlyOnceWith('subject/conjunct/0/possessor');
    });

    it('can point at the head of another noun’s owner, by its address', () => {
      const { lastEdit } = renderPeriod({
        subject: BOY,
        verb: EAT,
        directObject: HORSE,
        directObjectPossessor: { subject: DOG },
      });
      fireEvent.click(possessorControls()[0]!);

      // The boy, the subject's empty owner, then the dog's ring.
      press(screen.getAllByTestId('box-subject').at(-1)!);

      expect(lastEdit({})).toEqual({ subjectPossessorRef: 'directObject/possessor' });
    });
  });

  describe('coordination', () => {
    it('appends a conjunct, edited as a bare noun phrase', () => {
      const { selection } = renderPeriod({ subject: CAT, verb: EAT });

      fireEvent.click(satellite('subjectConjunct'));
      expect(selection().subjectConjuncts).toEqual([{}]);

      pickOption('DOG');
      expect(selection().subjectConjuncts).toEqual([{ subject: DOG }]);
      expect(screen.getAllByTestId('box-verb')).toHaveLength(1);
    });

    it('draws each conjunct as a ring on its head’s canvas, joined to it by the conjunction', () => {
      renderPeriod({ subject: CAT, subjectConjuncts: [{ subject: DOG }, { subject: HORSE }], verb: SLEEP });

      expect(screen.getAllByTestId('phrase-canvas')).toHaveLength(1);
      expect(screen.getAllByTestId('period-container')).toHaveLength(1);
      expect(groups()).toEqual(['Subject', 'Verb Phrase', 'Subject', 'Subject']);
      expect(screen.getAllByRole('button', { name: 'And' })).toHaveLength(2);
    });

    it('lets a conjunct’s head be a pronoun', () => {
      const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
      fireEvent.click(satellite('subjectConjunct'));

      fireEvent.click(screen.getByTestId('pronoun-tab'));
      fireEvent.click(screen.getByRole('button', { name: 'third' }));
      fireEvent.click(screen.getByTestId('pronoun-commit'));

      expect(selection().subjectConjuncts).toEqual([
        expect.objectContaining({ subject: THIRD }),
      ]);
    });

    it('names a conjunct’s ring after the role it shares with its head', () => {
      renderPeriod({
        subject: BOY,
        verb: EAT,
        directObject: HORSE,
        directObjectConjuncts: [{ subject: DOG }],
      });

      expect(screen.getAllByRole('button', { name: 'Clear the object' })).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: 'Clear the subject' })).toHaveLength(1);
    });

    it('extends the group from its last ring only, adding to the head’s group', () => {
      const { selection } = renderPeriod({
        subject: CAT,
        subjectConjuncts: [{ subject: DOG }, { subject: HORSE }],
        verb: SLEEP,
      });

      // Neither the head nor the first conjunct carries the control; the last conjunct does.
      expect(screen.getAllByTestId('satellite-subjectConjunct')).toHaveLength(1);
      fireEvent.click(satellite('subjectConjunct'));

      expect(selection().subjectConjuncts).toEqual([{ subject: DOG }, { subject: HORSE }, {}]);
      // The new, still empty conjunct is last now, and has nothing to extend the group from.
      expect(screen.queryAllByTestId('satellite-subjectConjunct')).toHaveLength(0);
    });

    it('drops a conjunct and unlinks every relative clause from it onwards', () => {
      const binding = makeBinding();
      const group: PhraseSelection = {
        subject: CAT,
        subjectConjuncts: [{ subject: DOG }, { subject: HORSE }, { subject: BOY }],
        verb: SLEEP,
      };
      const { lastEdit } = renderPeriod(group, { binding });

      fireEvent.click(screen.getAllByRole('button', { name: 'Remove this conjunct' })[1]!);

      expect(lastEdit(group)).toEqual({
        ...group,
        subjectConjuncts: [{ subject: DOG }, { subject: BOY }],
      });
      expect(vi.mocked(binding.relative.onRemoveLink).mock.calls).toEqual([
        ['subject/conjunct/1'],
        ['subject/conjunct/2'],
      ]);
    });

    it('unlinks a nested builder’s conjuncts by their full address', () => {
      const binding = makeBinding();
      renderPeriod(
        { subject: DOG, subjectConjuncts: [{ subject: CAT }] },
        { binding, possessorPath: 'directObject/possessor' },
      );

      fireEvent.click(screen.getByRole('button', { name: 'Remove this conjunct' }));

      expect(binding.relative.onRemoveLink).toHaveBeenCalledExactlyOnceWith(
        'directObject/possessor/conjunct/0',
      );
    });

    it('unlinks the conjuncts of a nested builder’s object by that object’s address', () => {
      const binding = makeBinding();
      renderPeriod(
        { subject: DOG, verb: EAT, directObject: HORSE, directObjectConjuncts: [{ subject: CAT }] },
        { binding, possessorPath: 'subject/possessor' },
      );

      fireEvent.click(screen.getByRole('button', { name: 'Remove this conjunct' }));

      expect(binding.relative.onRemoveLink).toHaveBeenCalledExactlyOnceWith(
        'subject/possessor/directObject/conjunct/0',
      );
    });

    it('registers a conjunct’s head with the workspace under its address', () => {
      const binding = makeBinding();
      renderPeriod({ subject: CAT, subjectConjuncts: [{ subject: DOG }], verb: SLEEP }, { binding });

      const registered = vi
        .mocked(binding.geometry.registerBox)
        .mock.calls.filter(([, el]) => el)
        .map(([key]) => key);
      expect(new Set(registered)).toEqual(new Set(['subject', 'subject/conjunct/0']));
    });

    it('cycles the conjunction joining the group', () => {
      const { lastEdit } = renderPeriod({
        subject: CAT,
        subjectConjuncts: [{ subject: DOG }],
        verb: SLEEP,
      });

      fireEvent.click(screen.getByRole('button', { name: 'And' }));

      expect(lastEdit({ subjectConjunction: 'and' })).toEqual({ subjectConjunction: 'or' });
    });
  });

  describe('cross-container links', () => {
    it('registers its noun boxes, and a possessor’s head under its address', () => {
      const binding = makeBinding();
      renderPeriod(
        { subject: BOY, verb: EAT, directObject: HORSE, subjectPossessor: { subject: DOG } },
        { binding },
      );

      const registered = vi
        .mocked(binding.geometry.registerBox)
        .mock.calls.filter(([, el]) => el)
        .map(([key]) => key);
      expect(new Set(registered)).toEqual(
        new Set(['subject', 'directObject', 'subject/possessor']),
      );
    });

    it('draws nothing of a verb a saved possessor still holds, and registers only its head', () => {
      // A possessor saved before it lost its verb box: its verb and object stay in the slice,
      // but the plan never read them, so the canvas neither draws nor links them.
      const binding = makeBinding();
      renderPeriod(
        {
          subject: BOY,
          verb: SLEEP,
          subjectPossessor: { subject: DOG, verb: WALK, locative: HOUSE },
        },
        { binding },
      );

      const registered = vi
        .mocked(binding.geometry.registerBox)
        .mock.calls.filter(([, el]) => el)
        .map(([key]) => key);
      expect(new Set(registered)).toEqual(new Set(['subject', 'subject/possessor']));
      // The period's subject and verb phrase, and the possessor's head: no ring left empty.
      expect(groups()).toEqual(['Subject', 'Verb Phrase', 'Subject']);
    });

    it('greys out a noun another clause relativises, leaving nothing to clear', () => {
      const binding = makeBinding({ relative: { targetKeys: new Set(['directObject']) } });
      renderPeriod({ subject: BOY, verb: EAT, directObject: HORSE }, { binding });

      expect(getComputedStyle(box('directObject').firstElementChild!).opacity).toBe('0.45');
      expect(getComputedStyle(box('subject').firstElementChild!).opacity).toBe('1');
      expect(screen.queryByRole('button', { name: 'Clear the object' })).not.toBeInTheDocument();
    });

    it('lights up the nouns a pending link may land on, and lands it on a press', () => {
      const binding = makeBinding({ relative: { isPickTarget: () => true } });
      renderPeriod({ subject: BOY, verb: EAT, directObject: HORSE }, { binding });

      expect(pickable()).toEqual(['subject', 'directObject']);

      press(box('directObject'));

      expect(binding.relative.onPick).toHaveBeenCalledExactlyOnceWith('directObject');
    });
  });

  describe('the period card', () => {
    it('carries its workspace container id', () => {
      renderPeriod({}, { binding: makeBinding() });

      expect(screen.getByTestId('period-container')).toHaveAttribute('data-container-id', 'c1');
    });

    it('tells the user what to do next', () => {
      const { unmount } = renderPeriod();
      expect(screen.getByText(/start by choosing a subject/)).toBeInTheDocument();
      unmount();

      renderPeriod({ subject: CAT });
      expect(screen.getByText(/click a slot and then choose a word/)).toBeInTheDocument();
    });

    it('floats a standalone card dragged by its border', () => {
      renderPeriod({ subject: CAT });
      const card = screen.getByTestId('period-container');

      fireEvent.pointerDown(card.firstElementChild!, { clientX: 2, clientY: 2 });
      fireEvent.pointerMove(card.firstElementChild!, { clientX: 42, clientY: 32 });

      expect(card).toHaveStyle({ position: 'fixed', left: '40px', top: '30px' });
    });

    it('keeps a workspace card in the stack', () => {
      renderPeriod({ subject: CAT }, { binding: makeBinding() });
      const card = screen.getByTestId('period-container');

      fireEvent.pointerDown(card.firstElementChild!, { clientX: 2, clientY: 2 });
      fireEvent.pointerMove(card.firstElementChild!, { clientX: 42, clientY: 32 });

      expect(card).toHaveStyle({ position: 'relative' });
    });

    it.each<[string, boolean, PhraseSelection]>([
      ['an untouched period', false, {}],
      ['an empty possessor', false, { subjectPossessor: {} }],
      ['an empty conjunct list', false, { subjectConjuncts: [] }],
      ['a picked word', true, { subject: CAT }],
      ['a toggle', true, { verbNegative: true }],
    ])('counts %s as something to save: %s', (_what, enabled, selection) => {
      renderPeriod(selection, { onSave: () => {} });

      expect(screen.getByRole('button', { name: 'Save period' })).toHaveProperty(
        'disabled',
        !enabled,
      );
    });

    it('forwards the reorder, save and remove controls', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const handlers = {
        onMoveUp: vi.fn(),
        onMoveDown: vi.fn(),
        onSave: vi.fn(),
        onRemove: vi.fn(),
      };
      renderPeriod({ subject: CAT }, handlers);

      fireEvent.click(screen.getByRole('button', { name: 'Move up' }));
      fireEvent.click(screen.getByRole('button', { name: 'Move down' }));
      fireEvent.click(screen.getByRole('button', { name: 'Save period' }));
      fireEvent.click(screen.getByRole('button', { name: 'Remove this period' }));

      Object.values(handlers).forEach((handler) => expect(handler).toHaveBeenCalledOnce());
    });

    it('gives an owner no card of its own, nor any of a period’s controls', () => {
      renderPeriod(
        { subject: CAT, verb: SLEEP, subjectPossessor: { subject: BOY } },
        { binding: makeBinding(), onMoveUp: vi.fn(), onRemove: vi.fn() },
      );

      expect(screen.getAllByTestId('period-container')).toHaveLength(1);
      for (const name of ['Command', 'Infinitive phrase', 'Move up']) {
        expect(screen.getAllByRole('button', { name })).toHaveLength(1);
      }
      // Only the outermost period has a words panel.
      expect(screen.getAllByTestId('words-panel')).toHaveLength(1);
    });

    it('does not turn an owner in an instrument period into an instrument too', () => {
      const binding = makeBinding({ instrumental: { hasTarget: true, level: 'process' } });
      renderPeriod({ verb: EAT, directObject: HORSE, directObjectPossessor: { subject: BOY } }, { binding });

      // An instrument act drops its subject; the owner's head is its whole phrase and stays.
      expect(boxes()).toEqual(['verb', 'directObject', 'subject']);
    });

    it('clears the sole period in place rather than removing it', () => {
      renderPeriod({ subject: CAT }, { onRemove: () => {}, soleContainer: true });

      expect(screen.getByRole('button', { name: 'Clear this period' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Move up' })).not.toBeInTheDocument();
    });
  });

  describe('the canvas view', () => {
    it('collapses a dotted box down to its main word, and expands it again', () => {
      renderPeriod({ subject: CAT, subjectAdjective: BIG, verb: SLEEP });

      fireEvent.click(screen.getByRole('button', { name: 'Compact the subject' }));
      expect(boxes()).toEqual(['subject', 'verb']);
      expect(screen.queryByTestId('satellite-subjectNumber')).not.toBeInTheDocument();
      expect(satellite('verbTense')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Expand the subject' }));
      expect(boxes()).toEqual(['subject', 'subjectAdjective', 'verb']);
    });

    it('compacts every box at once, keeping the boxes collapsed by hand', () => {
      renderPeriod({
        subject: CAT,
        subjectAdjective: BIG,
        verb: EAT,
        directObject: HORSE,
        directObjectAdjective: BIG,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Compact the subject' }));

      fireEvent.click(screen.getByTestId('period-compact-toggle'));
      expect(boxes()).toEqual(['subject', 'verb', 'directObject']);
      expect(groups()).toEqual([]);
      expect(screen.queryByTestId('satellite-directObjectNumber')).not.toBeInTheDocument();
      expect(screen.queryByTestId('possessor-ctl-subject')).not.toBeInTheDocument();
      expect(screen.queryByRole('separator')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('period-compact-toggle'));
      expect(boxes()).toEqual(['subject', 'verb', 'directObject', 'directObjectAdjective']);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('paints the compacted words where it packs them, and drags none of them', () => {
      renderPeriod({ subject: CAT, verb: EAT, directObject: HORSE });
      const keys = ['subject', 'verb', 'directObject'];
      // The positioned node a word box is dragged by.
      const node = (key: string) => {
        let el: HTMLElement | null = box(key);
        while (el && getComputedStyle(el).position !== 'absolute') el = el.parentElement;
        return el!;
      };
      const lefts = () => keys.map((k) => parseFloat(getComputedStyle(node(k)).left));
      const expanded = lefts();

      fireEvent.click(screen.getByTestId('period-compact-toggle'));
      // Three 132 px cells 16 px apart, centred on the 600 px canvas: 152, 300 and 448 px.
      const packed = lefts();
      [152, 300, 448].forEach((px, i) => expect(packed[i]).toBeCloseTo((px / 600) * 100));

      fireEvent.pointerDown(node('verb'), { clientX: 0, clientY: 0 });
      fireEvent.pointerMove(node('verb'), { clientX: 120, clientY: 40 });
      fireEvent.pointerUp(node('verb'));
      expect(lefts()).toEqual(packed);

      fireEvent.click(screen.getByTestId('period-compact-toggle'));
      expect(lefts()).toEqual(expanded);
    });

    it('asks the workspace to re-measure when a box collapses or the period compacts', () => {
      const binding = makeBinding();
      renderPeriod({ subject: CAT }, { binding });
      const onGeometryChange = vi.mocked(binding.geometry.onGeometryChange);

      onGeometryChange.mockClear();
      fireEvent.click(screen.getByRole('button', { name: 'Compact the subject' }));
      expect(onGeometryChange).toHaveBeenCalled();

      onGeometryChange.mockClear();
      fireEvent.click(screen.getByTestId('period-compact-toggle'));
      expect(onGeometryChange).toHaveBeenCalled();
    });

    it('resizes the canvas from its bottom edge, and remembers the height', () => {
      renderPeriod({ subject: CAT });
      expect(canvasHeight()).toBe(340);

      fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowDown' });

      expect(canvasHeight()).toBe(356);
      expect(localStorage.getItem('signi:graphHeight')).toBe('356');
    });

    it('opens on the remembered height, but never below the minimum', () => {
      localStorage.setItem('signi:graphHeight', '100');
      renderPeriod({ subject: CAT });

      expect(canvasHeight()).toBe(160);
    });
  });

  describe('the words panel', () => {
    it('is closed unless the page opens it, and asks the page to close it', () => {
      const { unmount } = renderPeriod();
      expect(wordsPanel().open).toBe(false);
      expect(() => wordsPanel().onClose()).not.toThrow();
      unmount();

      const onWordsPanelClose = vi.fn();
      renderPeriod({}, { wordsPanelOpen: true, onWordsPanelClose });
      expect(wordsPanel().open).toBe(true);
      wordsPanel().onClose();
      expect(onWordsPanelClose).toHaveBeenCalledOnce();
    });

    it('opens at its remembered width, and follows a resize', () => {
      const { unmount } = renderPeriod();
      expect(wordsPanel().width).toBe(160);
      unmount();

      localStorage.setItem('signi:phraseBuilderSidebarWidth', '240');
      renderPeriod();
      expect(wordsPanel().width).toBe(240);

      act(() => wordsPanel().onWidthChange(300));
      expect(wordsPanel().width).toBe(300);
    });

    it('offers no object slots before a verb, and names the slot in hand', () => {
      // Objects hang off the verb, so a verbless period lists none, whatever could follow.
      renderPeriod({ subject: CAT });
      expect(wordsPanel().activeSlotConfig?.key).toBe('subject');
      expect(wordsPanel().visibleSlots.map((s) => s.key)).toEqual(
        expect.not.arrayContaining(['directObject', 'directObjectAdjective']),
      );

      act(() => wordsPanel().onSlotClick('directObject'));
      expect(wordsPanel().activeSlot).toBe('directObject');
      expect(wordsPanel().activeSlotConfig).toBeNull();
    });

    it('lists a transitive verb’s object among the slots', () => {
      renderPeriod({ subject: CAT, verb: EAT });

      expect(wordsPanel().visibleSlots.map((s) => s.key)).toEqual(
        expect.arrayContaining(['directObject', 'directObjectAdjective']),
      );
    });
  });
});

// The noun boxes lit up as targets of a pending pick (their frame turns dashed).
const pickable = () =>
  screen
    .queryAllByTestId(/^box-/)
    .filter((b) => getComputedStyle(b.firstElementChild!).borderStyle === 'dashed')
    .map((b) => b.dataset['testid']!.slice(4));

// The canvas's drawn height, read off its connectors layer.
function canvasHeight() {
  const layer = document.querySelector('svg[viewBox^="0 0 600 "]')!;
  return parseFloat(getComputedStyle(layer.parentElement!).height);
}
