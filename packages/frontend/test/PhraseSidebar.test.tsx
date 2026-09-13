import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { PhraseSidebar } from '../src/components/PhraseBuilder/PhraseSidebar.tsx';
import ConceptPalette from '../src/components/ConceptPalette.tsx';
import { WordMap } from '../src/components/WordMap/WordMap.tsx';
import type { SlotConfig } from '../src/components/PhraseBuilder/interfaces.ts';
import { renderWithProviders, type Seed } from './render.tsx';
import { FakeResizeObserver, place } from './hooks/dom.ts';

// Each palette lists a role's concepts from the backend; the stub names its role and selection.
vi.mock('../src/components/ConceptPalette.tsx', () => ({
  default: vi.fn((p: { role: string; selectedId?: string }) => (
    <div data-testid="palette" data-role={p.role} data-selected={p.selectedId ?? ''} />
  )),
}));
// The word map lays out the whole concept graph in a dialog of its own.
vi.mock('../src/components/WordMap/WordMap.tsx', () => ({
  WordMap: vi.fn(() => null),
}));

const SUBJECT: SlotConfig = {
  key: 'subject',
  label: 'Subject',
  labelKey: 'slot.subject',
  required: true,
  roles: ['pronoun', 'noun'],
  color: 'primary',
};
const VERB: SlotConfig = {
  key: 'verb',
  label: 'Verb',
  required: true,
  roles: ['verb'],
  color: 'secondary',
};
const DIRECT_OBJECT: SlotConfig = {
  key: 'directObject',
  label: 'Direct object',
  required: false,
  roles: ['noun'],
  color: 'success',
};

const concept = (id: string, role: Concept['role']): Concept => ({
  id,
  role,
  description: id,
  label: id,
});
const CAT = concept('CAT', 'noun');
const SEE = concept('SEE', 'verb');

const WIDTH_KEY = 'signi:phraseBuilderSidebarWidth';

function renderSidebar(
  overrides: Partial<ComponentProps<typeof PhraseSidebar>> = {},
  seed: Seed = {},
) {
  const handlers = {
    onClose: vi.fn(),
    onWidthChange: vi.fn(),
    onSlotClick: vi.fn(),
    onConceptSelect: vi.fn(),
  };
  const view = renderWithProviders(
    <PhraseSidebar
      open
      width={250}
      selection={{ subject: CAT, verb: SEE }}
      activeSlot={null}
      activeSlotConfig={null}
      visibleSlots={[SUBJECT, VERB, DIRECT_OBJECT]}
      {...handlers}
      {...overrides}
    />,
    seed,
  );
  const panel = view.container.firstElementChild as HTMLElement;
  return { ...view, ...handlers, panel };
}

const palettes = () =>
  screen.queryAllByTestId('palette').map((p) => `${p.dataset['role']}:${p.dataset['selected']}`);

// The props the palette for `role` (the n-th such palette) was handed on the latest render.
function paletteProps(role: string, nth = 0) {
  const latest = vi.mocked(ConceptPalette).mock.calls.slice(-palettes().length);
  return latest.filter(([p]) => p.role === role)[nth]![0];
}

const wordMapProps = () => vi.mocked(WordMap).mock.lastCall![0];

// The drag handle on the panel's left edge has no role or label: it is the ew-resize strip.
const resizeHandle = (panel: HTMLElement) =>
  [...panel.children].find((el) => getComputedStyle(el).cursor === 'ew-resize')!;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PhraseSidebar', () => {
  describe('with no slot active', () => {
    it('is titled after the words it lists', () => {
      renderSidebar();

      expect(screen.getByText('Words')).toBeInTheDocument();
    });

    it('lists every visible slot’s vocabularies, each with that slot’s word selected', () => {
      renderSidebar();

      expect(screen.getByText('Click a slot to filter.')).toBeInTheDocument();
      expect(palettes()).toEqual(['pronoun:CAT', 'noun:CAT', 'verb:SEE', 'noun:']);
    });

    it('fills a slot from its own palette, activating the slot first', () => {
      const { onSlotClick, onConceptSelect } = renderSidebar();

      paletteProps('noun', 1).onSelect(CAT);

      expect(onSlotClick).toHaveBeenCalledExactlyOnceWith('directObject');
      expect(onConceptSelect).toHaveBeenCalledExactlyOnceWith(CAT, 'directObject');
      expect(onSlotClick.mock.invocationCallOrder[0]).toBeLessThan(
        onConceptSelect.mock.invocationCallOrder[0]!,
      );
    });
  });

  describe('with a slot active', () => {
    it('is titled after the slot, in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderSidebar(
        { activeSlot: 'subject', activeSlotConfig: SUBJECT },
        { strings: { 'slot.subject': { it: 'Soggetto' } } },
      );

      expect(screen.getByText('Soggetto')).toBeInTheDocument();
      expect(screen.queryByText('Words')).not.toBeInTheDocument();
    });

    it('falls back to the slot’s static label when it has no catalog key', () => {
      renderSidebar({ activeSlot: 'directObject', activeSlotConfig: DIRECT_OBJECT });

      expect(screen.getByText('Direct object')).toBeInTheDocument();
    });

    it('lists only the active slot’s vocabularies, with its word selected', () => {
      renderSidebar({ activeSlot: 'verb', activeSlotConfig: VERB });

      expect(palettes()).toEqual(['verb:SEE']);
      expect(screen.queryByText('Click a slot to filter.')).not.toBeInTheDocument();
    });

    it('fills the active slot from its palette', () => {
      const { onSlotClick, onConceptSelect } = renderSidebar({
        activeSlot: 'subject',
        activeSlotConfig: SUBJECT,
      });

      paletteProps('noun').onSelect(CAT);

      expect(onConceptSelect).toHaveBeenCalledExactlyOnceWith(CAT, 'subject');
      expect(onSlotClick).not.toHaveBeenCalled();
    });
  });

  describe('its controls', () => {
    it('asks to close from its close button', () => {
      const { onClose } = renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: 'Hide the words' }));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('opens the word map over the page, until the map closes', () => {
      renderSidebar();
      expect(wordMapProps().open).toBe(false);

      fireEvent.click(screen.getByRole('button', { name: 'Show the word map' }));
      expect(wordMapProps().open).toBe(true);

      act(() => wordMapProps().onClose());
      expect(wordMapProps().open).toBe(false);
    });
  });

  describe('its placement', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      FakeResizeObserver.instances = [];
      document.querySelector('[data-signi-header]')?.remove();
    });

    it('is on screen at its width while open', () => {
      const { panel } = renderSidebar({ open: true, width: 260 });

      expect(panel).toHaveStyle({ width: '260px', transform: 'translateX(0)' });
      expect(getComputedStyle(panel).pointerEvents).toBe('auto');
    });

    it('slides off screen, out of the pointer’s way, while closed', () => {
      const { panel } = renderSidebar({ open: false });

      expect(panel).toHaveStyle({ transform: 'translateX(100%)' });
      expect(getComputedStyle(panel).pointerEvents).toBe('none');
    });

    it('starts below the page header, following its height', () => {
      vi.stubGlobal('ResizeObserver', FakeResizeObserver);
      const header = place(document.createElement('header'), 0, 0, 1024, 72);
      header.setAttribute('data-signi-header', '');
      document.body.append(header);

      const { panel, unmount } = renderSidebar();
      const [observer] = FakeResizeObserver.instances;
      expect(observer!.observed).toEqual([header]);

      act(() => observer!.fire(1024, 64));
      // The border box, not the observed content box.
      expect(panel).toHaveStyle({ top: '72px' });

      place(header, 0, 0, 1024, 96);
      act(() => observer!.fire(1024, 88));
      expect(panel).toHaveStyle({ top: '96px' });

      unmount();
      expect(observer!.disconnected).toBe(true);
    });

    it('starts at the top of the page when there is no header', () => {
      vi.stubGlobal('ResizeObserver', FakeResizeObserver);

      const { panel } = renderSidebar();

      expect(FakeResizeObserver.instances).toEqual([]);
      expect(panel).toHaveStyle({ top: '0px' });
    });
  });

  describe('resizing', () => {
    // A drag listens on the window, which outlives the test: release any drag left in flight
    // so it can't answer the next test's pointer events, and forget the width it stored.
    afterEach(() => {
      fireEvent.pointerUp(window);
      localStorage.removeItem(WIDTH_KEY);
    });

    it('widens as its left edge is dragged left, and narrows dragged right', () => {
      const { panel, onWidthChange } = renderSidebar({ width: 300 });

      fireEvent.pointerDown(resizeHandle(panel), { clientX: 600 });
      fireEvent.pointerMove(window, { clientX: 560 });
      expect(onWidthChange).toHaveBeenLastCalledWith(340);

      fireEvent.pointerMove(window, { clientX: 700 });
      expect(onWidthChange).toHaveBeenLastCalledWith(200);
    });

    it('keeps the drag from selecting text or reaching the canvas', () => {
      const { panel } = renderSidebar();

      expect(fireEvent.pointerDown(resizeHandle(panel), { clientX: 600 })).toBe(false);
    });

    it('stays between 80 and 400 pixels wide', () => {
      const { panel, onWidthChange } = renderSidebar({ width: 250 });

      fireEvent.pointerDown(resizeHandle(panel), { clientX: 600 });
      fireEvent.pointerMove(window, { clientX: 0 });
      expect(onWidthChange).toHaveBeenLastCalledWith(400);

      fireEvent.pointerMove(window, { clientX: 2000 });
      expect(onWidthChange).toHaveBeenLastCalledWith(80);
    });

    it('remembers the width it was released at, in whole pixels', () => {
      const { panel, onWidthChange } = renderSidebar({ width: 250 });

      fireEvent.pointerDown(resizeHandle(panel), { clientX: 600 });
      fireEvent.pointerMove(window, { clientX: 559.6 });
      expect(localStorage.getItem(WIDTH_KEY)).toBeNull();
      fireEvent.pointerUp(window);

      expect(onWidthChange).toHaveBeenLastCalledWith(expect.closeTo(290.4));
      expect(localStorage.getItem(WIDTH_KEY)).toBe('290');
    });

    it('stops following the pointer once released', () => {
      const { panel, onWidthChange } = renderSidebar({ width: 320 });

      fireEvent.pointerDown(resizeHandle(panel), { clientX: 600 });
      fireEvent.pointerUp(window);
      fireEvent.pointerMove(window, { clientX: 500 });

      expect(onWidthChange).not.toHaveBeenCalled();
      // Released without moving: the width it started at.
      expect(localStorage.getItem(WIDTH_KEY)).toBe('320');
    });

    it('lets go of the pointer when the panel goes away mid-drag', () => {
      const { panel, onWidthChange, unmount } = renderSidebar({ width: 250 });
      fireEvent.pointerDown(resizeHandle(panel), { clientX: 600 });

      unmount();
      fireEvent.pointerMove(window, { clientX: 500 });
      fireEvent.pointerUp(window);

      expect(onWidthChange).not.toHaveBeenCalled();
      expect(localStorage.getItem(WIDTH_KEY)).toBeNull();
    });

    it('ends the drag when the pointer is cancelled too', () => {
      const { panel, onWidthChange } = renderSidebar({ width: 250 });

      fireEvent.pointerDown(resizeHandle(panel), { clientX: 600 });
      fireEvent.pointerMove(window, { clientX: 580 });
      fireEvent.pointerCancel(window);
      fireEvent.pointerMove(window, { clientX: 500 });

      expect(onWidthChange).toHaveBeenCalledOnce();
      expect(localStorage.getItem(WIDTH_KEY)).toBe('270');
    });

    it('follows no pointer until the edge is pressed', () => {
      const { onWidthChange } = renderSidebar();

      fireEvent.pointerMove(window, { clientX: 500 });

      expect(onWidthChange).not.toHaveBeenCalled();
    });
  });
});
