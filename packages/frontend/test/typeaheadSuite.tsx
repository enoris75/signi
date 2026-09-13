import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import type { Concept, GrammaticalRole } from '@signi/shared';
import { renderWithProviders, type Seed } from './render.tsx';

// The word pickers are one component written out per vocabulary, so they share one suite: every
// picker must list, filter, navigate and commit the same way. Where a picker still departs from
// the rest, its spec says so. A picker's own extras (the subject's pronoun chooser) are tested
// beside it.

export interface TypeaheadSpec {
  name: string;
  role: GrammaticalRole;
  placeholder: string;
  render: (onSelect: (concept: Concept) => void) => ReactElement;
  // Set on every fixture word, for a picker that lists only some words of its role.
  traits?: Partial<Concept>;
  // The other vocabularies the picker reads, seeded so that no request goes out.
  otherConcepts?: Seed['concepts'];
  // For a picker that pins a `header` (the category switch) above its rows.
  renderWithHeader?: (header: ReactNode) => ReactElement;
  // The verb and modal pickers ignore every key while closed, so ArrowDown cannot reopen them.
  reopensOnArrowDown?: boolean;
  // The subject picker's dropdown also holds its tabs, so it stays open when nothing matches.
  staysOpenWhenNothingMatches?: boolean;
}

// A picker reads a word's labels, never its meaning, so the same three words serve every
// vocabulary; they read most naturally as adjectives or adverbs. "h" matches the first and last;
// "LAT" only the middle one.
const word = (
  id: string,
  en: string,
  it: string,
  role: GrammaticalRole,
  traits: Partial<Concept>,
): Concept => ({
  id,
  role,
  description: `${en}, as a word`,
  label: en,
  labels: { en, it },
  ...traits,
});

export function typeaheadWords(role: GrammaticalRole, traits: Partial<Concept> = {}) {
  return {
    HARD: word('HARD', 'hard', 'duro', role, traits),
    LATE: word('LATE', 'late', 'tardi', role, traits),
    HIGH: word('HIGH', 'high', 'alto', role, traits),
  };
}

export function renderTypeahead(spec: TypeaheadSpec, ui?: ReactElement) {
  const onSelect = vi.fn();
  const { HARD, LATE, HIGH } = typeaheadWords(spec.role, spec.traits);
  const view = renderWithProviders(ui ?? spec.render(onSelect), {
    concepts: { ...spec.otherConcepts, [spec.role]: [HARD, LATE, HIGH] },
  });
  return { ...view, onSelect, input: screen.getByPlaceholderText(spec.placeholder) };
}

export const typeInto = (input: HTMLElement, value: string) =>
  fireEvent.change(input, { target: { value } });

export const press = (input: HTMLElement, key: string) => fireEvent.keyDown(input, { key });

// The ids of the rows the dropdown lists, in order; empty when it is closed.
export const listed = () =>
  screen.queryAllByTestId('typeahead-option').map((row) => row.dataset['concept']);

export const row = (id: string) =>
  screen.getAllByTestId('typeahead-option').find((r) => r.dataset['concept'] === id)!;

export function describeTypeahead(spec: TypeaheadSpec) {
  const { HARD, LATE, HIGH } = typeaheadWords(spec.role, spec.traits);
  const setup = () => renderTypeahead(spec);

  describe(`${spec.name} (shared typeahead behaviour)`, () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('takes focus and lists every word straight away', () => {
      const { input } = setup();

      expect(input).toHaveFocus();
      expect(listed()).toEqual(['HARD', 'LATE', 'HIGH']);
    });

    it('narrows the list to the words matching the query, ignoring case', () => {
      const { input } = setup();

      typeInto(input, 'h');
      expect(listed()).toEqual(['HARD', 'HIGH']);

      typeInto(input, 'LAT');
      expect(listed()).toEqual(['LATE']);
    });

    it('lists words in the UI language and still finds them by their English form', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      const { input } = setup();

      expect(row('HARD')).toHaveTextContent('duro');

      typeInto(input, 'dur');
      expect(listed()).toEqual(['HARD']);

      typeInto(input, 'late');
      expect(listed()).toEqual(['LATE']);
    });

    if (!spec.staysOpenWhenNothingMatches) {
      it('closes the dropdown when nothing matches', () => {
        const { input } = setup();

        typeInto(input, 'zzz');

        expect(listed()).toEqual([]);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    }

    it('commits the first match on Enter, then clears and closes', () => {
      const { input, onSelect } = setup();

      typeInto(input, 'h');
      press(input, 'Enter');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(HARD);
      expect(input).toHaveValue('');
      expect(listed()).toEqual([]);
    });

    it('does nothing on Enter when nothing matches', () => {
      const { input, onSelect } = setup();

      typeInto(input, 'zzz');
      press(input, 'Enter');

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('moves the highlight down with ArrowDown, stopping at the last row', () => {
      const { input, onSelect } = setup();

      for (let i = 0; i < 5; i++) press(input, 'ArrowDown');
      press(input, 'Enter');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(HIGH);
    });

    it('moves the highlight up with ArrowUp, stopping at the first row', () => {
      const { input, onSelect } = setup();

      press(input, 'ArrowDown');
      for (let i = 0; i < 3; i++) press(input, 'ArrowUp');
      press(input, 'Enter');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(HARD);
    });

    it('scrolls the newly highlighted row into view', () => {
      const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
      const { input } = setup();

      press(input, 'ArrowDown');

      expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest' });
      expect(scrollIntoView.mock.contexts[0]).toBe(row('LATE'));
    });

    it('restarts the highlight at the top when the query changes', () => {
      const { input, onSelect } = setup();

      press(input, 'ArrowDown');
      press(input, 'ArrowDown');
      typeInto(input, 'h');
      press(input, 'Enter');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(HARD);
    });

    it('commits the row clicked', () => {
      const { onSelect } = setup();

      fireEvent.click(row('LATE'));

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(LATE);
      expect(listed()).toEqual([]);
    });

    it('moves the highlight to the row under the mouse', () => {
      const { input, onSelect } = setup();

      fireEvent.mouseEnter(row('HIGH'));
      press(input, 'Enter');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(HIGH);
    });

    if (spec.reopensOnArrowDown ?? true) {
      it('closes on Escape and reopens on ArrowDown without moving the highlight', () => {
        const { input, onSelect } = setup();

        press(input, 'ArrowDown');
        press(input, 'Escape');
        expect(listed()).toEqual([]);

        press(input, 'Enter');
        expect(onSelect).not.toHaveBeenCalled();

        // While closed, ArrowUp leaves the highlight alone too.
        press(input, 'ArrowUp');
        press(input, 'ArrowDown');
        expect(listed()).toEqual(['HARD', 'LATE', 'HIGH']);
        press(input, 'Enter');
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(LATE);
      });
    } else {
      it('closes on Escape and stays closed on ArrowDown until the query changes', () => {
        const { input, onSelect } = setup();

        press(input, 'Escape');
        press(input, 'ArrowDown');
        expect(listed()).toEqual([]);

        press(input, 'Enter');
        expect(onSelect).not.toHaveBeenCalled();

        typeInto(input, 'h');
        expect(listed()).toEqual(['HARD', 'HIGH']);
      });
    }

    it('stays open briefly after losing focus, so a click on a row still lands', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const { input } = setup();

      fireEvent.blur(input);
      act(() => vi.advanceTimersByTime(149));
      expect(listed()).toEqual(['HARD', 'LATE', 'HIGH']);

      act(() => vi.advanceTimersByTime(1));
      expect(listed()).toEqual([]);
    });

    it('keeps presses inside it, the portalled dropdown included, from starting a box drag', () => {
      const onCanvasPointerDown = vi.fn();
      renderTypeahead(
        spec,
        <div onPointerDown={onCanvasPointerDown}>{spec.render(() => {})}</div>,
      );

      fireEvent.pointerDown(screen.getByPlaceholderText(spec.placeholder));
      fireEvent.pointerDown(row('LATE'));

      expect(onCanvasPointerDown).not.toHaveBeenCalled();
    });

    if (spec.renderWithHeader) {
      const withHeader = spec.renderWithHeader(<span>category switch</span>);

      it('pins the header above the rows', () => {
        renderTypeahead(spec, withHeader);

        const header = screen.getByText('category switch');
        const firstRow = screen.getAllByTestId('typeahead-option')[0]!;
        expect(header.compareDocumentPosition(firstRow)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      });

      it('keeps the dropdown open for the header when nothing matches', () => {
        const { input } = renderTypeahead(spec, withHeader);

        typeInto(input, 'zzz');

        expect(listed()).toEqual([]);
        expect(screen.getByText('category switch')).toBeInTheDocument();
      });

      it('closes the header along with the rows', () => {
        const { input } = renderTypeahead(spec, withHeader);

        press(input, 'Escape');

        expect(screen.queryByText('category switch')).not.toBeInTheDocument();
      });
    }
  });
}
