import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { AdjectiveTypeahead } from '../src/components/PhraseBuilder/AdjectiveTypeahead.tsx';
import { renderWithProviders } from './render.tsx';

const adjective = (id: string, en: string, it: string): Concept => ({
  id,
  role: 'adjective',
  description: `${en}, as an adjective`,
  label: en,
  labels: { en, it },
});

const BIG = adjective('BIG', 'big', 'grande');
const SMALL = adjective('SMALL', 'small', 'piccolo');
const BLUE = adjective('BLUE', 'blue', 'blu');

function renderTypeahead(props: Partial<ComponentProps<typeof AdjectiveTypeahead>> = {}) {
  const onSelect = vi.fn();
  const view = renderWithProviders(<AdjectiveTypeahead onSelect={onSelect} {...props} />, {
    concepts: { adjective: [BIG, SMALL, BLUE] },
  });
  return { ...view, onSelect, input: screen.getByPlaceholderText('type an adjective…') };
}

const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });
const press = (input: HTMLElement, key: string) => fireEvent.keyDown(input, { key });

// The ids of the rows the dropdown lists, in order; empty when it is closed.
const listed = () =>
  screen.queryAllByTestId('typeahead-option').map((row) => row.dataset['concept']);

const row = (id: string) =>
  screen.getAllByTestId('typeahead-option').find((r) => r.dataset['concept'] === id)!;

afterEach(() => {
  vi.useRealTimers();
});

describe('AdjectiveTypeahead', () => {
  it('takes focus and lists every adjective straight away', () => {
    const { input } = renderTypeahead();

    expect(input).toHaveFocus();
    expect(listed()).toEqual(['BIG', 'SMALL', 'BLUE']);
  });

  it('narrows the list to the words matching the query, ignoring case', () => {
    const { input } = renderTypeahead();

    type(input, 'b');
    expect(listed()).toEqual(['BIG', 'BLUE']);

    type(input, 'SMA');
    expect(listed()).toEqual(['SMALL']);
  });

  it('lists words in the UI language and still finds them by their English form', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    const { input } = renderTypeahead();

    expect(row('BIG')).toHaveTextContent('grande');

    type(input, 'gran');
    expect(listed()).toEqual(['BIG']);

    type(input, 'small');
    expect(listed()).toEqual(['SMALL']);
  });

  it('closes the dropdown when nothing matches', () => {
    const { input } = renderTypeahead();

    type(input, 'zzz');

    expect(listed()).toEqual([]);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps the dropdown open for its header when nothing matches', () => {
    const { input } = renderTypeahead({ header: <span>category switch</span> });

    type(input, 'zzz');

    expect(listed()).toEqual([]);
    expect(screen.getByText('category switch')).toBeInTheDocument();
  });

  it('commits the first match on Enter, then clears and closes', () => {
    const { input, onSelect } = renderTypeahead();

    type(input, 'b');
    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(BIG);
    expect(input).toHaveValue('');
    expect(listed()).toEqual([]);
  });

  it('does nothing on Enter when nothing matches', () => {
    const { input, onSelect } = renderTypeahead();

    type(input, 'zzz');
    press(input, 'Enter');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('moves the highlight down with ArrowDown, stopping at the last row', () => {
    const { input, onSelect } = renderTypeahead();

    for (let i = 0; i < 5; i++) press(input, 'ArrowDown');
    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(BLUE);
  });

  it('moves the highlight up with ArrowUp, stopping at the first row', () => {
    const { input, onSelect } = renderTypeahead();

    press(input, 'ArrowDown');
    for (let i = 0; i < 3; i++) press(input, 'ArrowUp');
    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(BIG);
  });

  it('scrolls the newly highlighted row into view', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const { input } = renderTypeahead();

    press(input, 'ArrowDown');

    expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest' });
    expect(scrollIntoView.mock.contexts[0]).toBe(row('SMALL'));
  });

  it('restarts the highlight at the top when the query changes', () => {
    const { input, onSelect } = renderTypeahead();

    press(input, 'ArrowDown');
    press(input, 'ArrowDown');
    type(input, 'b');
    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(BIG);
  });

  it('commits the row clicked', () => {
    const { onSelect } = renderTypeahead();

    fireEvent.click(row('SMALL'));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(SMALL);
    expect(listed()).toEqual([]);
  });

  it('moves the highlight to the row under the mouse', () => {
    const { input, onSelect } = renderTypeahead();

    fireEvent.mouseEnter(row('BLUE'));
    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(BLUE);
  });

  it('closes on Escape and reopens on ArrowDown without moving the highlight', () => {
    const { input, onSelect } = renderTypeahead();

    press(input, 'Escape');
    expect(listed()).toEqual([]);

    press(input, 'Enter');
    expect(onSelect).not.toHaveBeenCalled();

    press(input, 'ArrowDown');
    expect(listed()).toEqual(['BIG', 'SMALL', 'BLUE']);
    press(input, 'Enter');
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(BIG);
  });

  it('stays open briefly after losing focus, so a click on a row still lands', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { input } = renderTypeahead();

    fireEvent.blur(input);
    act(() => vi.advanceTimersByTime(149));
    expect(listed()).toEqual(['BIG', 'SMALL', 'BLUE']);

    act(() => vi.advanceTimersByTime(1));
    expect(listed()).toEqual([]);
  });

  it('keeps presses inside it, the portalled dropdown included, from starting a box drag', () => {
    const onCanvasPointerDown = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(
      <div onPointerDown={onCanvasPointerDown}>
        <AdjectiveTypeahead onSelect={onSelect} />
      </div>,
      { concepts: { adjective: [BIG, SMALL, BLUE] } },
    );

    fireEvent.pointerDown(screen.getByPlaceholderText('type an adjective…'));
    fireEvent.pointerDown(row('SMALL'));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });
});
