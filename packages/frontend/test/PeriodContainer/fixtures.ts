import { vi } from 'vitest';
import type { Concept } from '@signi/shared';
import {
  COORD_CONJUNCTION_OPTIONS,
  type ConditionalBinding,
  type CoordinativeBinding,
  type SubordinateBinding,
  type InstrumentalBinding,
  type PhraseSelection,
  type WorkspaceBinding,
} from '../../src/components/PhraseBuilder/interfaces.ts';
import type {
  ConditionalControl,
  CoordinativeControl,
  InstrumentalControl,
  MoodControl,
  SubordinateControl,
} from '../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts';
import { SUBORDINATE_OPTIONS } from '../../src/components/PhraseBuilder/interfaces.ts';

// The default MUI palette, as jsdom serializes the computed colours.
export const WARNING = 'rgb(237, 108, 2)';
export const INFO = 'rgb(2, 136, 209)';
export const SECONDARY = 'rgb(156, 39, 176)';
export const SUCCESS = 'rgb(46, 125, 50)';
export const PRIMARY = 'rgb(25, 118, 210)';
export const DIVIDER = 'rgba(0, 0, 0, 0.12)';
export const TEXT_SECONDARY = 'rgba(0, 0, 0, 0.6)';
export const PAPER = 'rgb(255, 255, 255)';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a small feline', label: 'cat' };

export const STATEMENT: PhraseSelection = { subject: CAT };
export const COMMAND: PhraseSelection = { subject: CAT, imperative: true };
export const CITATION: PhraseSelection = { subject: CAT, infinitive: true };

// A period free to start a conditional, in no relation and no pick.
export function conditionalControl(overrides: Partial<ConditionalControl> = {}): ConditionalControl {
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

// A statement free to start a coordination with any of the six conjunctions.
export function coordinativeControl(
  overrides: Partial<CoordinativeControl> = {},
): CoordinativeControl {
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

// A period free to govern any of the three subordinate clauses (P09-E12 D9): the menu's seven rows.
export function subordinateControl(overrides: Partial<SubordinateControl> = {}): SubordinateControl {
  return {
    options: [...SUBORDINATE_OPTIONS],
    isPickTarget: false,
    pickActive: false,
    canStart: true,
    onStart: vi.fn(),
    onClear: vi.fn(),
    onPick: vi.fn(),
    ...overrides,
  };
}

// A period at neither end of an instrumental link.
export function instrumentalControl(
  overrides: Partial<InstrumentalControl> = {},
): InstrumentalControl {
  return {
    isInstrument: false,
    hasInstrument: false,
    level: 'object',
    onLevelChange: vi.fn(),
    negative: false,
    onNegativeChange: vi.fn(),
    isPickTarget: false,
    onPick: vi.fn(),
    ...overrides,
  };
}

// Controls for a period in one relation or mood, for the tables.
export const cond = (overrides: Partial<ConditionalControl>) => ({
  conditional: conditionalControl(overrides),
});
export const coord = (overrides: Partial<CoordinativeControl>) => ({
  coordinative: coordinativeControl(overrides),
});
export const inst = (overrides: Partial<InstrumentalControl>) => ({
  instrumental: instrumentalControl(overrides),
});
export const mood = (active: boolean, disabled = false): MoodControl => ({
  active,
  disabled,
  onToggle: vi.fn(),
});

// A workspace binding with no links and no pick, but for the overrides.
export function binding({
  pickActive = false,
  conditional = {},
  coordinative = {},
  subordinate = {},
  instrumental = {},
}: {
  pickActive?: boolean;
  conditional?: Partial<ConditionalBinding>;
  coordinative?: Partial<CoordinativeBinding>;
  subordinate?: Partial<SubordinateBinding>;
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
      headlessKeys: new Set(),
      onSetHeadless: vi.fn(),
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
    subordinate: {
      canStart: true,
      isPickTarget: false,
      onStart: vi.fn(),
      onClear: vi.fn(),
      onPick: vi.fn(),
      ...subordinate,
    },
    instrumental: {
      hasSource: false,
      hasTarget: false,
      level: 'object',
      onLevelChange: vi.fn(),
      negative: false,
      onNegativeChange: vi.fn(),
      isPickTarget: false,
      onStart: vi.fn(),
      onClear: vi.fn(),
      onPick: vi.fn(),
      ...instrumental,
    },
  };
}
