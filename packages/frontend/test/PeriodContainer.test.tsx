import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import {
  PeriodContainer,
  periodControls,
  type ConditionalControl,
  type CoordinativeControl,
  type InstrumentalControl,
  type PeriodContainerProps,
} from '../src/components/PhraseBuilder/PeriodContainer.tsx';
import {
  COORD_CONJUNCTION_OPTIONS,
  coordConjunctionOptions,
  type ConditionalBinding,
  type CoordinativeBinding,
  type InstrumentalBinding,
  type PhraseSelection,
  type WorkspaceBinding,
} from '../src/components/PhraseBuilder/interfaces.ts';
import { renderWithProviders, type Seed } from './render.tsx';
import { place } from './hooks/dom.ts';

// The default MUI palette, as jsdom serializes the computed colours.
const WARNING = 'rgb(237, 108, 2)';
const INFO = 'rgb(2, 136, 209)';
const SECONDARY = 'rgb(156, 39, 176)';
const SUCCESS = 'rgb(46, 125, 50)';
const PRIMARY = 'rgb(25, 118, 210)';
const DIVIDER = 'rgba(0, 0, 0, 0.12)';
const TEXT_SECONDARY = 'rgba(0, 0, 0, 0.6)';
const PAPER = 'rgb(255, 255, 255)';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a small feline', label: 'cat' };

function conditionalControl(overrides: Partial<ConditionalControl> = {}): ConditionalControl {
  return {
    hasCondition: false,
    isIfClause: false,
    isPickTarget: false,
    pickActive: false,
    canStart: true,
    onStart: vi.fn(),
    onClear: vi.fn(),
    onPick: vi.fn(),
    registerBorderAnchor: vi.fn(),
    ...overrides,
  };
}

function coordinativeControl(overrides: Partial<CoordinativeControl> = {}): CoordinativeControl {
  return {
    hasCoordination: false,
    isCoordinated: false,
    conjunctions: COORD_CONJUNCTION_OPTIONS,
    isPickTarget: false,
    pickActive: false,
    canStart: true,
    onStart: vi.fn(),
    onClear: vi.fn(),
    onPick: vi.fn(),
    ...overrides,
  };
}

function instrumentalControl(overrides: Partial<InstrumentalControl> = {}): InstrumentalControl {
  return {
    isInstrument: false,
    hasInstrument: false,
    level: 'object',
    onLevelChange: vi.fn(),
    isPickTarget: false,
    onPick: vi.fn(),
    ...overrides,
  };
}

// Props for a period in one relation or mood, for the tables below.
const cond = (overrides: Partial<ConditionalControl>) => ({
  conditional: conditionalControl(overrides),
});
const coord = (overrides: Partial<CoordinativeControl>) => ({
  coordinative: coordinativeControl(overrides),
});
const inst = (overrides: Partial<InstrumentalControl>) => ({
  instrumental: instrumentalControl(overrides),
});
const mood = (active: boolean, disabled = false) => ({ active, disabled, onToggle: vi.fn() });

// A sole, empty, standalone period with its canvas drawn and nothing on the border.
function renderPeriod(overrides: Partial<PeriodContainerProps> = {}, seed?: Seed) {
  const props: PeriodContainerProps = {
    paperPad: 2,
    compact: false,
    showCanvas: true,
    hasGroups: false,
    hasContent: false,
    soleContainer: true,
    floatable: false,
    position: null,
    onPositionChange: vi.fn(),
    onToggleCompact: vi.fn(),
    onTidy: vi.fn(),
    children: <div data-testid="canvas" />,
    ...overrides,
  };
  const view = renderWithProviders(<PeriodContainer {...props} />, seed);
  return { ...view, props };
}

// The card is the Paper the period's content sits in.
function card() {
  return screen.getByTestId('canvas').parentElement!;
}

// The header caption reads "<label>· <hint>"; the label is what precedes the hint.
function captionLabel() {
  const hint = screen.getByText(/^·/);
  return hint.parentElement!.textContent!.slice(0, -hint.textContent!.length);
}

function binding({
  pickActive = false,
  conditional = {},
  coordinative = {},
  instrumental = {},
}: {
  pickActive?: boolean;
  conditional?: Partial<ConditionalBinding>;
  coordinative?: Partial<CoordinativeBinding>;
  instrumental?: Partial<InstrumentalBinding>;
} = {}): WorkspaceBinding {
  return {
    containerId: 'c1',
    pickActive,
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
      ...conditional,
    },
    coordinative: {
      hasSource: false,
      hasTarget: false,
      isPickTarget: false,
      onStart: vi.fn(),
      onClear: vi.fn(),
      onPick: vi.fn(),
      ...coordinative,
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
      ...instrumental,
    },
  };
}

const STATEMENT: PhraseSelection = { subject: CAT };
const COMMAND: PhraseSelection = { subject: CAT, imperative: true };
const CITATION: PhraseSelection = { subject: CAT, infinitive: true };

describe('periodControls', () => {
  it('gives a standalone period no clause-level relations', () => {
    expect(periodControls(undefined, STATEMENT)).toEqual({});
  });

  it('reads the conditional state and actions off the workspace binding', () => {
    const b = binding({ pickActive: true, conditional: { hasSource: true, isPickTarget: true } });

    expect(periodControls(b, STATEMENT).conditional).toEqual({
      hasCondition: true,
      isIfClause: false,
      isPickTarget: true,
      pickActive: true,
      canStart: true,
      onStart: b.conditional.onStart,
      onClear: b.conditional.onClear,
      onPick: b.conditional.onPick,
      registerBorderAnchor: b.geometry.registerBorderAnchor,
    });
    expect(periodControls(binding({ conditional: { hasTarget: true } }), STATEMENT).conditional)
      .toMatchObject({ hasCondition: false, isIfClause: true, pickActive: false });
  });

  it('reads the coordinative state and actions off the workspace binding', () => {
    const b = binding({
      pickActive: true,
      coordinative: { hasTarget: true, conjunction: 'but', isPickTarget: true },
    });

    expect(periodControls(b, STATEMENT).coordinative).toEqual({
      hasCoordination: false,
      isCoordinated: true,
      conjunction: 'but',
      conjunctions: COORD_CONJUNCTION_OPTIONS,
      isPickTarget: true,
      pickActive: true,
      canStart: false,
      onStart: b.coordinative.onStart,
      onClear: b.coordinative.onClear,
      onPick: b.coordinative.onPick,
    });
    expect(
      periodControls(binding({ coordinative: { hasSource: true } }), STATEMENT).coordinative,
    ).toMatchObject({ hasCoordination: true, isCoordinated: false });
  });

  it('reads the instrumental target side off the workspace binding', () => {
    const b = binding({
      instrumental: { hasSource: true, hasTarget: false, level: 'process', isPickTarget: true },
    });

    expect(periodControls(b, STATEMENT).instrumental).toEqual({
      isInstrument: false,
      hasInstrument: true,
      level: 'process',
      onLevelChange: b.instrumental.onLevelChange,
      isPickTarget: true,
      onPick: b.instrumental.onPick,
    });
    expect(
      periodControls(binding({ instrumental: { hasTarget: true } }), STATEMENT).instrumental,
    ).toMatchObject({ isInstrument: true, hasInstrument: false });
  });

  it('lets a free statement start either relation', () => {
    const controls = periodControls(binding(), STATEMENT);

    expect(controls.conditional?.canStart).toBe(true);
    expect(controls.coordinative?.canStart).toBe(true);
  });

  it.each([
    ['a command', COMMAND, binding()],
    ['an infinitive citation', CITATION, binding()],
    ['an IF clause', STATEMENT, binding({ conditional: { hasTarget: true } })],
    ['a first clause', STATEMENT, binding({ coordinative: { hasSource: true } })],
    ['a coordinated clause', STATEMENT, binding({ coordinative: { hasTarget: true } })],
  ])('keeps %s from starting a conditional', (_, selection, b) => {
    expect(periodControls(b, selection).conditional?.canStart).toBe(false);
  });

  it.each([
    ['an infinitive citation', CITATION, binding()],
    ['a coordinated clause', STATEMENT, binding({ coordinative: { hasTarget: true } })],
    ['a main clause', STATEMENT, binding({ conditional: { hasSource: true } })],
    ['an IF clause', STATEMENT, binding({ conditional: { hasTarget: true } })],
  ])('keeps %s from starting a coordination', (_, selection, b) => {
    expect(periodControls(b, selection).coordinative?.canStart).toBe(false);
  });

  it('lets a command coordinate, with only the conjunctions that join two commands', () => {
    const coordinative = periodControls(binding(), COMMAND).coordinative!;

    expect(coordinative.canStart).toBe(true);
    expect(coordinative.conjunctions).toEqual(coordConjunctionOptions(true));
    expect(coordinative.conjunctions.map((o) => o.value)).toEqual(['and', 'or', 'but', 'then']);
  });
});

describe('PeriodContainer', () => {
  describe('header caption', () => {
    it.each<[string, Partial<PeriodContainerProps>, string]>([
      ['a free statement', {}, ''],
      ['an instrument phrase', inst({ isInstrument: true }), 'Instrumental'],
      ['a command', { imperative: mood(true) }, 'Command'],
      ['an infinitive', { infinitive: mood(true) }, 'Infinitive phrase'],
      ['a main clause', cond({ hasCondition: true }), 'Main clause'],
      ['an IF clause', cond({ isIfClause: true }), 'If clause'],
      ['a first clause', coord({ hasCoordination: true, conjunction: 'and' }), 'First clause'],
      [
        'a coordinated clause, by its conjunction',
        coord({ isCoordinated: true, conjunction: 'but' }),
        'But clause',
      ],
      [
        'a command that coordinates another, by its mood',
        { imperative: mood(true, true), ...coord({ hasCoordination: true, conjunction: 'then' }) },
        'Command',
      ],
    ])('names %s', (_, props, label) => {
      renderPeriod(props);

      expect(captionLabel()).toBe(label);
    });

    it('tells the user to choose a word once the canvas is drawn, else a subject', () => {
      const { rerender, props } = renderPeriod({ showCanvas: false });
      expect(screen.getByText('· start by choosing a subject')).toBeInTheDocument();

      rerender(<PeriodContainer {...props} showCanvas />);
      expect(screen.getByText('· click a slot and then choose a word')).toBeInTheDocument();
    });

    it('is left out of the compact view', () => {
      renderPeriod({ compact: true, hasGroups: true, imperative: mood(true) });

      expect(screen.queryByText('Command', { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByText(/choose/)).not.toBeInTheDocument();
    });

    it('names an instrument phrase in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderPeriod(inst({ isInstrument: true }), {
        strings: { 'slot.instrumental': { it: 'Strumentale' } },
      });

      expect(captionLabel()).toBe('Strumentale');
    });
  });

  describe('instrument reification switch', () => {
    it('offers the three levels on an instrument phrase, each explained by an example', () => {
      renderPeriod(inst({ isInstrument: true }));

      expect(screen.getByLabelText('Start by choosing a word')).toHaveTextContent('Process');
      expect(screen.getByLabelText('Start with the choosing of a word')).toHaveTextContent(
        'Concept',
      );
      expect(screen.getByLabelText('Start with a word')).toHaveTextContent('Object');
    });

    it('reports the level clicked', () => {
      const instrumental = instrumentalControl({ isInstrument: true, level: 'object' });
      renderPeriod({ instrumental });

      fireEvent.click(screen.getByText('Concept'));

      expect(instrumental.onLevelChange).toHaveBeenCalledExactlyOnceWith('concept');
    });

    it('highlights the current level', () => {
      renderPeriod(inst({ isInstrument: true, level: 'process' }));

      expect(getComputedStyle(screen.getByText('Process')).backgroundColor).toBe(SECONDARY);
      expect(getComputedStyle(screen.getByText('Concept')).backgroundColor).toBe(PAPER);
      expect(getComputedStyle(screen.getByText('Object')).backgroundColor).toBe(PAPER);
    });

    it.each<[string, Partial<PeriodContainerProps>]>([
      ['a clause that acts with an instrument', inst({ hasInstrument: true })],
      ['a compact instrument phrase', { compact: true, ...inst({ isInstrument: true }) }],
    ])('is not offered on %s', (_, props) => {
      renderPeriod(props);

      expect(screen.queryByText('Process')).not.toBeInTheDocument();
      expect(screen.queryByText('Object')).not.toBeInTheDocument();
    });
  });

  describe('reorder controls', () => {
    it('are left out for the only period in the workspace', () => {
      renderPeriod({ soleContainer: true, onMoveUp: vi.fn(), onMoveDown: vi.fn() });

      expect(screen.queryByRole('button', { name: 'Move this period up' })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Move this period down' }),
      ).not.toBeInTheDocument();
    });

    it('move a period in the middle of the stack either way', () => {
      const onMoveUp = vi.fn();
      const onMoveDown = vi.fn();
      renderPeriod({ soleContainer: false, onMoveUp, onMoveDown });

      fireEvent.click(screen.getByRole('button', { name: 'Move this period up' }));
      expect(onMoveUp).toHaveBeenCalledOnce();
      expect(onMoveDown).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Move this period down' }));
      expect(onMoveDown).toHaveBeenCalledOnce();
    });

    it('stay mounted but disabled at the ends of the stack', () => {
      const { rerender, props } = renderPeriod({ soleContainer: false, onMoveDown: vi.fn() });
      expect(screen.getByRole('button', { name: 'Move this period up' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Move this period down' })).toBeEnabled();

      rerender(<PeriodContainer {...props} onMoveUp={vi.fn()} onMoveDown={undefined} />);
      expect(screen.getByRole('button', { name: 'Move this period up' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Move this period down' })).toBeDisabled();
    });
  });

  describe('compact and tidy controls', () => {
    it('are left out until the canvas holds a role box', () => {
      renderPeriod({ hasGroups: false });

      expect(screen.queryByTestId('period-compact-toggle')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-tidy')).not.toBeInTheDocument();
    });

    it('offer to compact a full period, and tidy it', () => {
      const { props } = renderPeriod({ hasGroups: true, compact: false });

      const toggle = screen.getByRole('button', { name: 'Compact this period' });
      expect(toggle).toHaveAttribute('data-compact', 'false');
      fireEvent.click(toggle);
      expect(props.onToggleCompact).toHaveBeenCalledOnce();

      fireEvent.click(screen.getByRole('button', { name: 'Tidy up this period' }));
      expect(props.onTidy).toHaveBeenCalledOnce();
      expect(props.onToggleCompact).toHaveBeenCalledOnce();
    });

    it('offer to expand a compact period', () => {
      const { props } = renderPeriod({ hasGroups: true, compact: true });

      const toggle = screen.getByRole('button', { name: 'Expand this period' });
      expect(toggle).toHaveAttribute('data-compact', 'true');
      fireEvent.click(toggle);
      expect(props.onToggleCompact).toHaveBeenCalledOnce();
    });

    it('are named in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderPeriod(
        { hasGroups: true },
        {
          strings: {
            'action.compactPeriod': { it: 'Compatta questo periodo' },
            'action.tidyPeriod': { it: 'Riordina questo periodo' },
          },
        },
      );

      expect(screen.getByTestId('period-compact-toggle')).toHaveAccessibleName(
        'Compatta questo periodo',
      );
      expect(screen.getByTestId('period-tidy')).toHaveAccessibleName('Riordina questo periodo');
    });
  });

  describe('save control', () => {
    it('is left out when the period cannot be saved', () => {
      renderPeriod({ hasContent: true });

      expect(screen.queryByRole('button', { name: 'Save period' })).not.toBeInTheDocument();
    });

    it('stays disabled until the clause has content', () => {
      renderPeriod({ onSave: vi.fn(), hasContent: false });

      expect(screen.getByRole('button', { name: 'Save period' })).toBeDisabled();
    });

    it('saves a period with content', () => {
      const onSave = vi.fn();
      renderPeriod({ onSave, hasContent: true });

      fireEvent.click(screen.getByRole('button', { name: 'Save period' }));

      expect(onSave).toHaveBeenCalledOnce();
    });
  });

  describe('remove control', () => {
    it('is left out when there is no way to remove the period', () => {
      renderPeriod({ soleContainer: false, hasContent: true });

      expect(screen.queryByRole('button', { name: 'Remove main clause' })).not.toBeInTheDocument();
    });

    it('has nothing to clear on the only period while it is empty', () => {
      renderPeriod({ soleContainer: true, hasContent: false, onRemove: vi.fn() });

      expect(screen.queryByRole('button', { name: 'Clear this period' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove main clause' })).not.toBeInTheDocument();
    });

    it('clears the only period in place once the user confirms', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onRemove = vi.fn();
      renderPeriod({ soleContainer: true, hasContent: true, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Clear this period' }));

      expect(confirm).toHaveBeenCalledExactlyOnceWith(
        'Clear this main clause and everything in it?',
      );
      expect(onRemove).toHaveBeenCalledOnce();
    });

    it('removes a period with content once the user confirms', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onRemove = vi.fn();
      renderPeriod({ soleContainer: false, hasContent: true, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Remove main clause' }));

      expect(confirm).toHaveBeenCalledExactlyOnceWith(
        'Remove this main clause and everything in it?',
      );
      expect(onRemove).toHaveBeenCalledOnce();
    });

    it('removes a nested phrase as a phrase, with no reordering offered', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onRemove = vi.fn();
      renderPeriod({
        nested: true,
        soleContainer: false,
        hasContent: true,
        onMoveUp: vi.fn(),
        onMoveDown: vi.fn(),
        onRemove,
      });

      expect(screen.queryByRole('button', { name: 'Move this period up' })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Move this period down' }),
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Remove phrase' }));

      expect(confirm).toHaveBeenCalledExactlyOnceWith('Remove this phrase and everything in it?');
      expect(onRemove).toHaveBeenCalledOnce();
    });

    it('keeps the period when the user declines', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const onRemove = vi.fn();
      renderPeriod({ soleContainer: false, hasContent: true, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Remove main clause' }));

      expect(onRemove).not.toHaveBeenCalled();
    });

    it('removes an empty period without asking', () => {
      const confirm = vi.spyOn(window, 'confirm');
      const onRemove = vi.fn();
      renderPeriod({ soleContainer: false, hasContent: false, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Remove main clause' }));

      expect(confirm).not.toHaveBeenCalled();
      expect(onRemove).toHaveBeenCalledOnce();
    });
  });

  describe('mood toggles', () => {
    it('are left off a period given none', () => {
      renderPeriod();

      expect(screen.queryByRole('button', { name: /^Toggle/ })).not.toBeInTheDocument();
    });

    it.each([
      ['imperative', 'Toggle imperative (command)'],
      ['infinitive', 'Toggle infinitive phrase (citation)'],
    ] as const)('flip the %s mood', (mood, name) => {
      const onToggle = vi.fn();
      renderPeriod({ [mood]: { active: false, disabled: false, onToggle } });

      fireEvent.click(screen.getByRole('button', { name }));

      expect(onToggle).toHaveBeenCalledOnce();
    });

    it.each<[string, boolean, boolean, string]>([
      ['off', false, false, 'Make this period a command (imperative)'],
      ['on', true, false, 'This period is a command — turn it off'],
      [
        'locked by a relation',
        false,
        true,
        'Remove the IF / coordination link to make this a command',
      ],
    ])('explain the command toggle while it is %s', (_, active, disabled, tooltip) => {
      renderPeriod({ imperative: mood(active, disabled) });

      const button = screen.getByRole('button', { name: 'Toggle imperative (command)' });
      expect(screen.getByLabelText(tooltip)).toContainElement(button);
      if (disabled) expect(button).toBeDisabled();
      else expect(button).toBeEnabled();
    });

    it.each<[string, boolean, boolean, string]>([
      [
        'off',
        false,
        false,
        'Make this period an infinitive phrase (a citation, e.g. “to consume food”)',
      ],
      ['on', true, false, 'This period is an infinitive phrase — turn it off'],
      [
        'locked by a relation',
        false,
        true,
        'Remove the IF / coordination link to make this an infinitive phrase',
      ],
    ])('explain the infinitive toggle while it is %s', (_, active, disabled, tooltip) => {
      renderPeriod({ infinitive: mood(active, disabled) });

      const button = screen.getByRole('button', { name: 'Toggle infinitive phrase (citation)' });
      expect(screen.getByLabelText(tooltip)).toContainElement(button);
      if (disabled) expect(button).toBeDisabled();
      else expect(button).toBeEnabled();
    });
  });

  describe('conditional control', () => {
    const START = 'Add an IF condition (this becomes the main clause)';
    const REMOVE = 'Remove the IF condition';

    it.each<[string, Partial<ConditionalControl>, string, boolean]>([
      ['a period free to start one', {}, START, true],
      ['a period that may not start one', { canStart: false }, START, false],
      ['a main clause', { hasCondition: true, canStart: false }, REMOVE, true],
      ['an IF clause', { isIfClause: true, canStart: false }, 'This period is an IF clause', false],
      [
        'a legal IF target during a pick',
        { pickActive: true, isPickTarget: true, canStart: false },
        'Use this period as the IF condition',
        true,
      ],
      ['a non-target during a pick', { pickActive: true }, START, false],
      ['a main clause during a pick', { pickActive: true, hasCondition: true }, REMOVE, false],
    ])('on %s', (_, overrides, name, enabled) => {
      renderPeriod({ conditional: conditionalControl(overrides) });

      const button = screen.getByRole('button', { name });
      if (enabled) expect(button).toBeEnabled();
      else expect(button).toBeDisabled();
    });

    it('starts a conditional with this period as the main clause', () => {
      const conditional = conditionalControl();
      renderPeriod({ conditional });

      fireEvent.click(screen.getByRole('button', { name: START }));

      expect(conditional.onStart).toHaveBeenCalledOnce();
      expect(conditional.onClear).not.toHaveBeenCalled();
      expect(conditional.onPick).not.toHaveBeenCalled();
    });

    it('removes the IF condition of a main clause', () => {
      const conditional = conditionalControl({ hasCondition: true, canStart: true });
      renderPeriod({ conditional });

      fireEvent.click(screen.getByRole('button', { name: REMOVE }));

      expect(conditional.onClear).toHaveBeenCalledOnce();
      expect(conditional.onStart).not.toHaveBeenCalled();
    });

    it('picks this period as the pending IF condition', () => {
      const conditional = conditionalControl({ pickActive: true, isPickTarget: true });
      renderPeriod({ conditional });

      fireEvent.click(screen.getByRole('button', { name: 'Use this period as the IF condition' }));

      expect(conditional.onPick).toHaveBeenCalled();
      expect(conditional.onStart).not.toHaveBeenCalled();
      expect(conditional.onClear).not.toHaveBeenCalled();
    });

    it('registers the border cluster as the connector anchor, and releases it', () => {
      const conditional = conditionalControl();
      const { unmount } = renderPeriod({
        conditional,
        imperative: mood(false),
      });

      const anchor = vi.mocked(conditional.registerBorderAnchor).mock.calls[0][0]!;
      expect(anchor).toContainElement(screen.getByRole('button', { name: START }));
      expect(anchor).toContainElement(
        screen.getByRole('button', { name: 'Toggle imperative (command)' }),
      );

      unmount();
      expect(conditional.registerBorderAnchor).toHaveBeenLastCalledWith(null);
    });
  });

  describe('coordinative control', () => {
    const START = 'Coordinate this period';

    it.each<[string, Partial<CoordinativeControl>, string, boolean]>([
      ['a period free to start one', {}, START, true],
      ['a period that may not start one', { canStart: false }, START, false],
      [
        'a first clause',
        { hasCoordination: true, conjunction: 'and', canStart: false },
        'Remove the coordination (And)',
        true,
      ],
      [
        'a coordinated clause',
        { isCoordinated: true, conjunction: 'or', canStart: false },
        'This period is a coordinated clause (Or)',
        false,
      ],
      [
        'a legal second-clause target during a pick',
        { pickActive: true, isPickTarget: true, canStart: false },
        'Use this period as the coordinated clause',
        true,
      ],
      ['a non-target during a pick', { pickActive: true }, START, false],
      [
        'a first clause during a pick',
        { pickActive: true, hasCoordination: true, conjunction: 'but' },
        'Remove the coordination (But)',
        false,
      ],
    ])('on %s', (_, overrides, name, enabled) => {
      renderPeriod({ coordinative: coordinativeControl(overrides) });

      const button = screen.getByRole('button', { name });
      if (enabled) expect(button).toBeEnabled();
      else expect(button).toBeDisabled();
    });

    it('offers the conjunctions this period may start with, each with its relation', () => {
      const conjunctions = coordConjunctionOptions(true);
      renderPeriod(coord({ conjunctions }));

      fireEvent.click(screen.getByRole('button', { name: START }));

      const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
      expect(items.map((item) => item.textContent)).toEqual([
        'Andcopulative',
        'Ordisjunctive',
        'Butadversative',
        'Thentemporal',
      ]);
    });

    it('starts a coordination with the conjunction chosen', () => {
      const coordinative = coordinativeControl();
      renderPeriod({ coordinative });

      fireEvent.click(screen.getByRole('button', { name: START }));
      expect(coordinative.onStart).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('menuitem', { name: /^Therefore/ }));

      expect(coordinative.onStart).toHaveBeenCalledExactlyOnceWith('therefore');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('starts nothing when the conjunction menu is dismissed', () => {
      const coordinative = coordinativeControl();
      renderPeriod({ coordinative });

      fireEvent.click(screen.getByRole('button', { name: START }));
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(coordinative.onStart).not.toHaveBeenCalled();
    });

    it('removes the coordination of a first clause, without asking for a conjunction', () => {
      const coordinative = coordinativeControl({
        hasCoordination: true,
        conjunction: 'and',
        canStart: true,
      });
      renderPeriod({ coordinative });

      fireEvent.click(screen.getByRole('button', { name: 'Remove the coordination (And)' }));

      expect(coordinative.onClear).toHaveBeenCalledOnce();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('picks this period as the pending coordinated clause', () => {
      const coordinative = coordinativeControl({ pickActive: true, isPickTarget: true });
      renderPeriod({ coordinative });

      fireEvent.click(
        screen.getByRole('button', { name: 'Use this period as the coordinated clause' }),
      );

      expect(coordinative.onPick).toHaveBeenCalled();
      expect(coordinative.onClear).not.toHaveBeenCalled();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('pick target', () => {
    it.each<[string, Partial<PeriodContainerProps>, string]>([
      ['IF condition', cond({ pickActive: true, isPickTarget: true }), WARNING],
      ['coordinated clause', coord({ pickActive: true, isPickTarget: true }), INFO],
      ['instrument', inst({ isPickTarget: true }), SECONDARY],
    ])('lights the card as a droppable %s and takes a click anywhere on it', (_, props, colour) => {
      renderPeriod(props);
      const style = getComputedStyle(card());

      expect(style.borderTopColor).toBe(colour);
      expect(style.borderLeftColor).toBe(colour);
      expect(style.boxShadow).not.toBe('none');
      expect(style.cursor).toBe('pointer');

      fireEvent.click(screen.getByTestId('canvas'));
      const [control] = Object.values(props) as { onPick: () => void }[];
      expect(control.onPick).toHaveBeenCalledOnce();
    });

    it('leaves the card inert while this period is not a target', () => {
      const conditional = conditionalControl({ pickActive: true });
      const coordinative = coordinativeControl({ pickActive: true });
      const instrumental = instrumentalControl();
      renderPeriod({ conditional, coordinative, instrumental });
      const style = getComputedStyle(card());

      fireEvent.click(screen.getByTestId('canvas'));

      expect(conditional.onPick).not.toHaveBeenCalled();
      expect(coordinative.onPick).not.toHaveBeenCalled();
      expect(instrumental.onPick).not.toHaveBeenCalled();
      expect(style.borderTopColor).toBe(DIVIDER);
      expect(style.boxShadow).toBe('none');
      expect(style.cursor).not.toBe('pointer');
    });
  });

  describe('card accent', () => {
    it.each<[string, Partial<PeriodContainerProps>, string]>([
      ['a free statement', {}, TEXT_SECONDARY],
      ['a main clause', cond({ hasCondition: true }), WARNING],
      ['an IF clause', cond({ isIfClause: true }), WARNING],
      ['a first clause', coord({ hasCoordination: true }), INFO],
      ['a coordinated clause', coord({ isCoordinated: true }), INFO],
      ['an instrument phrase', inst({ isInstrument: true }), SECONDARY],
      ['a command', { imperative: mood(true) }, SUCCESS],
      ['an infinitive', { infinitive: mood(true) }, PRIMARY],
    ])('rules the left edge of %s in its colour', (_, props, colour) => {
      renderPeriod(props);

      expect(getComputedStyle(card()).borderLeftColor).toBe(colour);
    });

    it.each<[string, Partial<PeriodContainerProps>]>([
      ['a main clause', cond({ hasCondition: true })],
      ['an IF clause', cond({ isIfClause: true })],
      ['a first clause', coord({ hasCoordination: true })],
      ['a coordinated clause', coord({ isCoordinated: true })],
      ['a clause acting with an instrument', inst({ hasInstrument: true })],
      ['an instrument phrase', inst({ isInstrument: true })],
    ])('frees a right gutter for the connector of %s', (_, props) => {
      renderPeriod(props);

      expect(getComputedStyle(card()).marginRight).toBe('64px');
    });

    it('keeps no gutter on a period outside any relation', () => {
      renderPeriod({
        conditional: conditionalControl(),
        coordinative: coordinativeControl(),
        instrumental: instrumentalControl(),
      });

      expect(getComputedStyle(card()).marginRight).toBe('0px');
    });
  });

  describe('border drag', () => {
    // A 400×300 card at (100, 100). jsdom has no pointer capture, so the card gets a stub.
    function renderFloating(overrides: Partial<PeriodContainerProps> = {}) {
      const view = renderPeriod({ floatable: true, position: { x: 40, y: 60 }, ...overrides });
      const paper = place(card(), 100, 100, 400, 300);
      paper.setPointerCapture = vi.fn();
      return { ...view, paper };
    }

    it.each([
      ['left', 103, 250],
      ['right', 497, 250],
      ['top', 300, 103],
      ['bottom', 300, 397],
    ])('floats the card by its %s border', (_, x, y) => {
      const { paper, props } = renderFloating();

      fireEvent.pointerDown(paper, { clientX: x, clientY: y, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: x + 30, clientY: y - 20 });

      expect(paper.setPointerCapture).toHaveBeenCalledExactlyOnceWith(3);
      expect(props.onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 70, y: 40 });
    });

    it.each([
      ['the middle', 300, 250],
      ['8px inside the left border', 108, 250],
      ['8px inside the right border', 492, 250],
      ['8px inside the top border', 300, 108],
      ['8px inside the bottom border', 300, 392],
    ])('does not drag from %s of the card', (_, x, y) => {
      const { paper, props } = renderFloating();

      fireEvent.pointerDown(paper, { clientX: x, clientY: y, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: x + 30, clientY: y - 20 });

      expect(props.onPositionChange).not.toHaveBeenCalled();
    });

    it('does not drag a card that sits in the workspace stack', () => {
      const { paper, props } = renderFloating({ floatable: false });

      fireEvent.pointerDown(paper, { clientX: 103, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: 133, clientY: 250 });

      expect(props.onPositionChange).not.toHaveBeenCalled();
    });

    it('starts a card still in the page flow from the origin', () => {
      const { paper, props } = renderFloating({ position: null });

      fireEvent.pointerDown(paper, { clientX: 103, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: 113, clientY: 245 });

      expect(props.onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 10, y: -5 });
    });

    it('does not start from a press on the border controls', () => {
      const { props } = renderFloating({
        imperative: mood(false),
      });
      const control = screen.getByRole('button', { name: 'Toggle imperative (command)' });

      fireEvent.pointerDown(control, { clientX: 497, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(card(), { clientX: 527, clientY: 250 });

      expect(props.onPositionChange).not.toHaveBeenCalled();
    });

    it.each(['pointerUp', 'pointerCancel'] as const)('ends on %s', (end) => {
      const { paper, props } = renderFloating();

      fireEvent.pointerDown(paper, { clientX: 103, clientY: 250, pointerId: 3 });
      fireEvent[end](paper, { clientX: 113, clientY: 250 });
      fireEvent.pointerMove(paper, { clientX: 123, clientY: 250 });

      expect(props.onPositionChange).not.toHaveBeenCalled();
    });

    it('measures every move from where the drag began, and grabs while it lasts', () => {
      // The owner holds the position, so the card re-renders at each reported move.
      const moves: { x: number; y: number }[] = [];
      function Floating() {
        const [position, setPosition] = useState<{ x: number; y: number } | null>({ x: 40, y: 60 });
        return (
          <PeriodContainer
            paperPad={2}
            compact={false}
            showCanvas
            hasGroups={false}
            hasContent={false}
            soleContainer
            floatable
            position={position}
            onPositionChange={(p) => {
              moves.push(p);
              setPosition(p);
            }}
            onToggleCompact={() => {}}
            onTidy={() => {}}
          >
            <div data-testid="canvas" />
          </PeriodContainer>
        );
      }
      renderWithProviders(<Floating />);
      const paper = place(card(), 100, 100, 400, 300);
      paper.setPointerCapture = vi.fn();
      expect(getComputedStyle(paper).cursor).toBe('default');

      fireEvent.pointerDown(paper, { clientX: 103, clientY: 250, pointerId: 3 });
      fireEvent.pointerMove(paper, { clientX: 133, clientY: 270 });
      fireEvent.pointerMove(paper, { clientX: 153, clientY: 260 });

      expect(moves).toEqual([
        { x: 70, y: 80 },
        { x: 90, y: 70 },
      ]);
      expect(getComputedStyle(paper).cursor).toBe('grabbing');
    });

    it('leaves the cursor alone on a card in the page flow', () => {
      renderPeriod({ floatable: true, position: null });

      expect(getComputedStyle(card()).cursor).toBe('auto');
    });
  });
});
