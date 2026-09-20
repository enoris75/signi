import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import type { Concept } from '@signi/shared';
import { PhraseWorkspace } from '../src/components/PhraseBuilder/PhraseWorkspace.tsx';
import { PhraseBuilder } from '../src/components/PhraseBuilder/PhraseBuilder.tsx';
import { PeriodSaveLoad } from '../src/components/PhraseBuilder/PeriodSaveLoad.tsx';
import {
  useConnectors,
  type Connector,
} from '../src/components/PhraseBuilder/hooks/useConnectors.ts';
import type {
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
} from '../src/components/PhraseBuilder/interfaces.ts';
import { MUI_COLOR_HEX } from '../src/components/PhraseBuilder/slots.ts';
import { renderWithProviders, type SeededStrings } from './render.tsx';

// A period is a whole builder canvas, measured and dragged; the stub names its container.
vi.mock('../src/components/PhraseBuilder/PhraseBuilder.tsx', () => ({
  PhraseBuilder: vi.fn((p: { containerId: string }) => (
    <div data-testid="period" data-id={p.containerId} />
  )),
}));
// The save/load dialogs query and mutate the saved-phrase store on the backend.
vi.mock('../src/components/PhraseBuilder/PeriodSaveLoad.tsx', () => ({
  PeriodSaveLoad: vi.fn(() => null),
}));
// The connector hook measures the stack's layout, which jsdom does not have (see
// test/hooks/useConnectors.test.ts); the fake hands out its registries and the connectors to draw.
const geometry = vi.hoisted(() => ({
  connectors: [] as unknown[],
  maps: {} as Record<string, { current: Map<string, HTMLElement> }>,
  bumpGeom: () => {},
}));
vi.mock('../src/components/PhraseBuilder/hooks/useConnectors.ts', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useConnectors: vi.fn(() => ({
    workspaceRef: { current: null },
    boxEls: geometry.maps['boxEls'],
    sourceAnchorEls: geometry.maps['sourceAnchorEls'],
    targetAnchorEls: geometry.maps['targetAnchorEls'],
    borderAnchorEls: geometry.maps['borderAnchorEls'],
    verbAnchorEls: geometry.maps['verbAnchorEls'],
    bumpGeom: geometry.bumpGeom,
    connectors: geometry.connectors,
  })),
}));

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const CAT = noun('CAT');
const DOG = noun('DOG');
const FOX = noun('FOX');

const period = (id: string, selection: PhraseSelection = {}): PhraseContainer => ({
  id,
  selection,
});

// The page owns the stack and its links (they are persisted with the workspace), so the
// harness keeps both in state and exposes the latest of each.
function renderWorkspace({
  containers = [period('A', { subject: CAT }), period('B', { subject: DOG })],
  links = [] as PhraseLink[],
  wordsPanelOpen = false,
  onWordsPanelClose = () => {},
  strings = {} as SeededStrings,
} = {}) {
  const state = { containers, links };
  function Page() {
    const [cs, setContainers] = useState(containers);
    const [ls, setLinks] = useState(links);
    state.containers = cs;
    state.links = ls;
    return (
      <PhraseWorkspace
        containers={cs}
        links={ls}
        setContainers={setContainers}
        setLinks={setLinks}
        wordsPanelOpen={wordsPanelOpen}
        onWordsPanelClose={onWordsPanelClose}
      />
    );
  }
  const view = renderWithProviders(<Page />, { strings });
  return { ...view, state };
}

// The props the period of container `id` was handed on its latest render.
function periodProps(id: string) {
  const calls = vi.mocked(PhraseBuilder).mock.calls.filter(([p]) => p.containerId === id);
  return calls[calls.length - 1]![0];
}

const periodIds = () => screen.queryAllByTestId('period').map((p) => p.dataset['id']);
const saveLoadProps = () => vi.mocked(PeriodSaveLoad).mock.lastCall![0];
const banner = () => screen.queryByRole('button', { name: 'Cancel' })?.parentElement ?? null;

const CONDITIONAL: PhraseLink = {
  id: 'if',
  kind: 'conditional',
  source: { containerId: 'A' },
  target: { containerId: 'B' },
};
const RELATIVE: PhraseLink = {
  id: 'rel',
  source: { containerId: 'B', nounKey: 'subject' },
  target: { containerId: 'C', nounKey: 'subject' },
};
const COORDINATIVE: PhraseLink = {
  id: 'and',
  kind: 'coordinative',
  conjunction: 'and',
  source: { containerId: 'A' },
  target: { containerId: 'C' },
};

const connector = (overrides: Partial<Connector>): Connector => ({
  id: 'x',
  kind: 'relative',
  x1: 100,
  y1: 50,
  x2: 80,
  y2: 300,
  color: '#123456',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  geometry.connectors = [];
  for (const name of [
    'boxEls',
    'sourceAnchorEls',
    'targetAnchorEls',
    'borderAnchorEls',
    'verbAnchorEls',
  ]) {
    geometry.maps[name] = { current: new Map() };
  }
  geometry.bumpGeom = vi.fn();
});

describe('PhraseWorkspace', () => {
  describe('the period stack', () => {
    it('draws one period per container, in order, each on its own container', () => {
      const containers = [period('A', { subject: CAT }), period('B'), period('C')];
      renderWorkspace({ containers });

      expect(periodIds()).toEqual(['A', 'B', 'C']);
      for (const c of containers) {
        expect(periodProps(c.id).selection).toBe(c.selection);
        expect(periodProps(c.id).binding!.containerId).toBe(c.id);
      }
    });

    it('rides the word palette on the first period only', () => {
      const onWordsPanelClose = vi.fn();
      renderWorkspace({
        containers: [period('A'), period('B'), period('C')],
        wordsPanelOpen: true,
        onWordsPanelClose,
      });

      expect(['A', 'B', 'C'].map((id) => periodProps(id).wordsPanelOpen)).toEqual([
        true,
        false,
        false,
      ]);
      expect(periodProps('A').onWordsPanelClose).toBe(onWordsPanelClose);
    });

    it('keeps the palette closed when the page has it closed', () => {
      renderWorkspace({ wordsPanelOpen: false });

      expect(periodProps('A').wordsPanelOpen).toBe(false);
    });

    it('marks a lone period as the sole container', () => {
      renderWorkspace({ containers: [period('A')] });
      expect(periodProps('A').soleContainer).toBe(true);
    });

    it('marks no period sole while there are several', () => {
      renderWorkspace();
      expect(periodProps('A').soleContainer).toBe(false);
      expect(periodProps('B').soleContainer).toBe(false);
    });

    it('offers no move up on the first period and no move down on the last', () => {
      renderWorkspace({ containers: [period('A'), period('B'), period('C')] });

      expect(periodProps('A').onMoveUp).toBeUndefined();
      expect(periodProps('A').onMoveDown).toBeTypeOf('function');
      expect(periodProps('B').onMoveUp).toBeTypeOf('function');
      expect(periodProps('B').onMoveDown).toBeTypeOf('function');
      expect(periodProps('C').onMoveUp).toBeTypeOf('function');
      expect(periodProps('C').onMoveDown).toBeUndefined();
    });

    it('moves a period up and down by swapping it with its neighbour', () => {
      renderWorkspace({ containers: [period('A'), period('B'), period('C')] });

      act(() => periodProps('C').onMoveUp!());
      expect(periodIds()).toEqual(['A', 'C', 'B']);

      act(() => periodProps('A').onMoveDown!());
      expect(periodIds()).toEqual(['C', 'A', 'B']);
    });

    it('stops a period at either end of the stack however often it is moved', () => {
      renderWorkspace({ containers: [period('A'), period('B'), period('C')] });

      // Two moves dispatched before the stack re-renders: the second finds it already at the end.
      act(() => {
        const { onMoveDown } = periodProps('B');
        onMoveDown!();
        onMoveDown!();
      });
      expect(periodIds()).toEqual(['A', 'C', 'B']);

      act(() => {
        const { onMoveUp } = periodProps('C');
        onMoveUp!();
        onMoveUp!();
      });
      expect(periodIds()).toEqual(['C', 'A', 'B']);
    });

    it('routes a period’s edit into its own container only', () => {
      const { state } = renderWorkspace();
      const updater = vi.fn((prev: PhraseSelection) => ({ ...prev, directObject: FOX }));

      act(() => periodProps('B').onPhraseUpdate(updater));

      expect(updater).toHaveBeenCalledWith({ subject: DOG });
      expect(state.containers).toEqual([
        period('A', { subject: CAT }),
        period('B', { subject: DOG, directObject: FOX }),
      ]);
    });

    it('removes a period together with every link touching it', () => {
      const { state } = renderWorkspace({
        containers: [period('A'), period('B'), period('C')],
        links: [CONDITIONAL, RELATIVE, COORDINATIVE],
      });

      act(() => periodProps('B').onRemove!());

      expect(periodIds()).toEqual(['A', 'C']);
      expect(state.links).toEqual([COORDINATIVE]);
    });

    it('clears the last remaining period in place rather than removing it', () => {
      const { state } = renderWorkspace({ containers: [period('A', { subject: CAT })] });

      act(() => periodProps('A').onRemove!());

      expect(state.containers).toEqual([period('A', {})]);
    });

    it('abandons a pick started from the period that is removed', () => {
      renderWorkspace({ containers: [period('A', { subject: CAT })] });
      act(() => periodProps('A').binding!.relative.onStartLink('subject'));
      expect(banner()).not.toBeNull();

      act(() => periodProps('A').onRemove!());

      expect(banner()).toBeNull();
    });

    it('adds an empty period at the end of the stack', () => {
      const { state } = renderWorkspace();

      fireEvent.click(screen.getByTestId('add-period-container'));

      expect(state.containers).toHaveLength(3);
      const added = state.containers[2]!;
      expect(added.selection).toEqual({});
      expect(added.id).not.toMatch(/^[AB]$/);
      expect(periodIds()).toEqual(['A', 'B', added.id]);
    });

    it('gives every added period an id of its own', () => {
      const { state } = renderWorkspace();

      fireEvent.click(screen.getByTestId('add-period-container'));
      fireEvent.click(screen.getByTestId('add-period-container'));

      expect(new Set(state.containers.map((c) => c.id)).size).toBe(4);
    });

    it('labels the add button in the UI language', () => {
      renderWorkspace();

      expect(screen.getByTestId('add-period-container')).toHaveTextContent(
        'Add period container',
      );
    });
  });

  describe('saving and loading a period', () => {
    it('opens the saved-period picker from its button until the picker closes', () => {
      renderWorkspace();
      expect(saveLoadProps().loadOpen).toBe(false);

      fireEvent.click(screen.getByRole('button', { name: 'Load period' }));
      expect(saveLoadProps().loadOpen).toBe(true);

      act(() => saveLoadProps().onCloseLoad());
      expect(saveLoadProps().loadOpen).toBe(false);
    });

    it('appends a loaded period as a new container at the end', () => {
      const { state } = renderWorkspace();

      act(() => saveLoadProps().onAppendPeriod({ subject: FOX }));

      expect(state.containers).toHaveLength(3);
      expect(state.containers[2]!.selection).toEqual({ subject: FOX });
      expect(state.containers[2]!.id).not.toMatch(/^[AB]$/);
    });

    it('saves the period whose save control was clicked, until the dialog closes', () => {
      const { state } = renderWorkspace();
      expect(saveLoadProps().saveTarget).toBeNull();

      act(() => periodProps('B').onSave!());
      expect(saveLoadProps().saveTarget).toBe(state.containers[1]);

      act(() => saveLoadProps().onCloseSave());
      expect(saveLoadProps().saveTarget).toBeNull();
    });

    it('drops the save target when its period is removed', () => {
      renderWorkspace();
      act(() => periodProps('B').onSave!());

      act(() => periodProps('B').onRemove!());

      expect(saveLoadProps().saveTarget).toBeNull();
    });
  });

  describe('linking periods', () => {
    it('binds each period to its part of the link graph', () => {
      renderWorkspace({ links: [CONDITIONAL] });

      expect(periodProps('A').binding!.conditional).toMatchObject({
        hasSource: true,
        hasTarget: false,
      });
      expect(periodProps('B').binding!.conditional).toMatchObject({
        hasSource: false,
        hasTarget: true,
      });
    });

    it('marks every period while a pick is in flight, until the banner cancels it', () => {
      renderWorkspace();
      expect(periodProps('A').binding!.pickActive).toBe(false);
      expect(banner()).toBeNull();

      act(() => periodProps('A').binding!.relative.onStartLink('subject'));
      expect(periodProps('A').binding!.pickActive).toBe(true);
      expect(periodProps('B').binding!.pickActive).toBe(true);
      expect(banner()).toHaveTextContent(
        'Click the noun that this clause describes in another period container.',
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(banner()).toBeNull();
      expect(periodProps('B').binding!.pickActive).toBe(false);
    });

    it('prompts for the “if” clause of a conditional', () => {
      renderWorkspace();

      act(() => periodProps('A').binding!.conditional.onStart());

      expect(banner()).toHaveTextContent(
        'Click the period that is the condition in another period container.',
      );
    });

    it('prompts for the condition in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'ja');
      renderWorkspace({ strings: { 'pick.condition': { ja: '文の別の容器で条件である文をクリック。' } } });

      act(() => periodProps('A').binding!.conditional.onStart());

      expect(banner()).toHaveTextContent('文の別の容器で条件である文をクリック。');
    });

    it('prompts for the second clause of a coordination, naming its conjunction', () => {
      renderWorkspace();

      act(() => periodProps('A').binding!.coordinative.onStart('but'));

      expect(banner()).toHaveTextContent(
        'Click the period in another period container to coordinate with this clause. (But)',
      );
    });

    it('prompts for the instrument period in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderWorkspace({
        strings: {
          'pick.instrumental': {
            it: 'Clicca sul periodo il cui sostantivo è il complemento di mezzo in un altro contenitore di periodo.',
          },
        },
      });

      act(() => periodProps('A').binding!.instrumental.onStart());

      expect(banner()).toHaveTextContent(
        'Clicca sul periodo il cui sostantivo è il complemento di mezzo in un altro contenitore di periodo.',
      );
    });

    it('measures the connectors of the workspace’s links, naming the instrumental', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderWorkspace({
        links: [CONDITIONAL],
        strings: { 'slot.instrumental': { it: 'Strumento' } },
      });

      expect(vi.mocked(useConnectors)).toHaveBeenLastCalledWith([CONDITIONAL], 'strumento');
    });

    it('registers each period’s noun boxes and link anchors under its own container', () => {
      renderWorkspace();
      const box = document.createElement('div');
      const source = document.createElement('span');
      const target = document.createElement('span');
      const { geometry: a } = periodProps('A').binding!;
      const { geometry: b } = periodProps('B').binding!;

      a.registerBox('directObject', box);
      b.registerSourceAnchor('subject', source);
      a.registerTargetAnchor('directObject/possessor', target);

      expect([...geometry.maps['boxEls']!.current]).toEqual([['A:directObject', box]]);
      expect([...geometry.maps['sourceAnchorEls']!.current]).toEqual([['B:subject', source]]);
      expect([...geometry.maps['targetAnchorEls']!.current]).toEqual([
        ['A:directObject/possessor', target],
      ]);

      a.registerBox('directObject', null);
      b.registerSourceAnchor('subject', null);
      a.registerTargetAnchor('directObject/possessor', null);

      expect(geometry.maps['boxEls']!.current.size).toBe(0);
      expect(geometry.maps['sourceAnchorEls']!.current.size).toBe(0);
      expect(geometry.maps['targetAnchorEls']!.current.size).toBe(0);
    });

    it('registers each period’s clause and verb anchors by container', () => {
      renderWorkspace();
      const border = document.createElement('div');
      const verb = document.createElement('div');

      periodProps('B').binding!.geometry.registerBorderAnchor(border);
      periodProps('A').binding!.geometry.registerVerbAnchor(verb);

      expect([...geometry.maps['borderAnchorEls']!.current]).toEqual([['B', border]]);
      expect([...geometry.maps['verbAnchorEls']!.current]).toEqual([['A', verb]]);

      periodProps('B').binding!.geometry.registerBorderAnchor(null);
      periodProps('A').binding!.geometry.registerVerbAnchor(null);

      expect(geometry.maps['borderAnchorEls']!.current.size).toBe(0);
      expect(geometry.maps['verbAnchorEls']!.current.size).toBe(0);
    });

    it('asks the workspace to re-measure when a period’s geometry changes', () => {
      renderWorkspace();

      expect(periodProps('A').binding!.geometry.onGeometryChange).toBe(geometry.bumpGeom);
    });
  });

  describe('the link overlay', () => {
    const overlay = (container: HTMLElement) => container.querySelector('defs')?.parentElement;

    it('is not drawn while no link has been measured', () => {
      const { container } = renderWorkspace();

      expect(overlay(container)).toBeUndefined();
    });

    it('routes a conditional through the right-hand gutter to an arrowhead, labelled', () => {
      geometry.connectors = [
        connector({ id: 'if', kind: 'conditional', color: '#aa7700', label: 'if' }),
      ];
      const { container } = renderWorkspace();

      const svg = overlay(container)!;
      expect(getComputedStyle(svg).pointerEvents).toBe('none');
      const path = svg.querySelector('path:not(marker path)')!;
      // Out to 24px right of the rightmost end, down the gutter, back in.
      expect(path).toHaveAttribute('d', 'M 100 50 V 50 H 124 V 300 H 80');
      expect(path).toHaveAttribute('stroke', '#aa7700');
      expect(path).toHaveAttribute('marker-end', 'url(#conditional-arrow)');
      const label = svg.querySelector('text')!;
      expect(label).toHaveTextContent('if');
      expect(label).toHaveAttribute('x', '129');
      expect(label).toHaveAttribute('y', '175');
      expect(label).toHaveAttribute('fill', '#aa7700');
    });

    it('routes the gutter past whichever end lies further right', () => {
      geometry.connectors = [connector({ kind: 'coordinative', x1: 60, x2: 200, label: 'and' })];
      const { container } = renderWorkspace();

      const path = overlay(container)!.querySelector('path:not(marker path)')!;
      expect(path).toHaveAttribute('d', 'M 60 50 V 50 H 224 V 300 H 200');
      expect(path).toHaveAttribute('marker-end', 'url(#coordinative-arrow)');
    });

    it('drops an instrumental clear of the verb box before it turns', () => {
      geometry.connectors = [connector({ kind: 'instrumental', label: 'instrumental' })];
      const { container } = renderWorkspace();

      const path = overlay(container)!.querySelector('path:not(marker path)')!;
      expect(path).toHaveAttribute('d', 'M 100 50 V 74 H 124 V 300 H 80');
      expect(path).toHaveAttribute('marker-end', 'url(#instrumental-arrow)');
    });

    it('draws a relative clause as a straight dashed line between its nouns', () => {
      geometry.connectors = [connector({ kind: 'relative', color: '#335577' })];
      const { container } = renderWorkspace();

      const svg = overlay(container)!;
      expect(svg.querySelector('path:not(marker path)')).toBeNull();
      expect(svg.querySelector('text')).toBeNull();
      const line = svg.querySelector('line')!;
      expect(line).toHaveAttribute('x1', '100');
      expect(line).toHaveAttribute('y1', '50');
      expect(line).toHaveAttribute('x2', '80');
      expect(line).toHaveAttribute('y2', '300');
      expect(line).toHaveAttribute('stroke', '#335577');
      expect(line).toHaveAttribute('stroke-dasharray', '5 3');
    });

    it('colours each arrowhead after its relation', () => {
      geometry.connectors = [connector({ kind: 'conditional' })];
      const { container } = renderWorkspace();

      const fill = (id: string) =>
        container.querySelector(`marker#${id} path`)!.getAttribute('fill');
      expect(fill('conditional-arrow')).toBe(MUI_COLOR_HEX.warning);
      expect(fill('coordinative-arrow')).toBe(MUI_COLOR_HEX.info);
      expect(fill('instrumental-arrow')).toBe(MUI_COLOR_HEX.secondary);
    });

    it('draws every measured link', () => {
      geometry.connectors = [
        connector({ id: 'a', kind: 'relative' }),
        connector({ id: 'b', kind: 'conditional' }),
        connector({ id: 'c', kind: 'relative' }),
      ];
      const { container } = renderWorkspace();

      const svg = overlay(container)!;
      expect(svg.querySelectorAll('line')).toHaveLength(2);
      expect(svg.querySelectorAll('path:not(marker path)')).toHaveLength(1);
    });
  });
});
