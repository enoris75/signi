import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { fetchConcepts } from '../src/api.ts';
import ConceptPalette from '../src/components/ConceptPalette.tsx';
import { renderWithProviders, type Seed } from './render.tsx';

// The word lists are seeded into the query cache; only the loading and failure cases fetch.
vi.mock('../src/api.ts');

const noun = (id: string, en: string, it: string): Concept => ({
  id,
  role: 'noun',
  description: `the ${en}, as a noun`,
  label: en,
  labels: { en, it },
});

const CAT = noun('CAT', 'cat', 'gatto');
const DOG = noun('DOG', 'dog', 'cane');
const FOX = noun('FOX', 'fox', 'volpe');

function renderPalette(
  props: Partial<ComponentProps<typeof ConceptPalette>> = {},
  seed: Seed = { concepts: { noun: [CAT, DOG, FOX] } },
) {
  const onSelect = vi.fn();
  const view = renderWithProviders(
    <ConceptPalette role="noun" onSelect={onSelect} {...props} />,
    seed,
  );
  return { ...view, onSelect };
}

// A word's row is the element its text renders in.
const row = (word: string) => screen.getByText(word);

// MUI's documented class for a Skeleton, the placeholder row shown while the words load.
const placeholders = (container: HTMLElement) => container.querySelectorAll('.MuiSkeleton-root');

afterEach(() => {
  vi.useRealTimers();
});

describe('ConceptPalette', () => {
  it("heads the list with the role's name and lists its words, in order", () => {
    const { container } = renderPalette();

    expect(container).toHaveTextContent(/^Nounscatdogfox$/);
  });

  it('names the role and its words in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    const { container } = renderPalette(
      {},
      { concepts: { noun: [CAT, DOG] }, strings: { 'palette.noun': { it: 'Nomi' } } },
    );

    expect(container).toHaveTextContent(/^Nomigattocane$/);
  });

  it('lists the words of the role it is given', () => {
    const RUN: Concept = { id: 'RUN', role: 'verb', description: 'to run', label: 'run' };
    const { container } = renderPalette(
      { role: 'verb' },
      { concepts: { noun: [CAT], verb: [RUN] } },
    );

    expect(container).toHaveTextContent(/^Verbsrun$/);
  });

  it('shows placeholder rows while the words load', () => {
    vi.mocked(fetchConcepts).mockReturnValue(new Promise(() => {}));
    const { container } = renderPalette({}, {});

    expect(fetchConcepts).toHaveBeenCalledWith('noun');
    expect(placeholders(container)).toHaveLength(4);
    expect(container).toHaveTextContent(/^Nouns$/);
  });

  it('drops the placeholders and lists nothing when the words could not be loaded', async () => {
    vi.mocked(fetchConcepts).mockRejectedValue(new Error('offline'));
    const { container } = renderPalette({}, {});

    await waitFor(() => expect(placeholders(container)).toHaveLength(0));
    expect(container).toHaveTextContent(/^Nouns$/);
  });

  it('picks the word clicked', () => {
    const { onSelect } = renderPalette();

    fireEvent.click(row('dog'));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(DOG);
  });

  it('ignores clicks on a disabled word and greys it out', () => {
    const { onSelect } = renderPalette({ disabledIds: ['DOG'] });

    fireEvent.click(row('dog'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(getComputedStyle(row('dog')).color).not.toBe(getComputedStyle(row('cat')).color);

    fireEvent.click(row('fox'));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(FOX);
  });

  it('sets only the selected word in bold, in a colour of its own', () => {
    renderPalette({ selectedId: 'DOG' });

    const weight = (word: string) => getComputedStyle(row(word)).fontWeight;
    expect([weight('cat'), weight('dog'), weight('fox')]).toEqual(['400', '700', '400']);
    expect(getComputedStyle(row('dog')).color).not.toBe(getComputedStyle(row('cat')).color);
    // Washed in the noun colour: MUI's default success, rgb(46, 125, 50), at 0.08 opacity.
    expect(getComputedStyle(row('dog')).backgroundColor).toBe('rgba(46, 125, 50, 0.08)');
    expect(getComputedStyle(row('cat')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('keeps a selected word pickable', () => {
    const { onSelect } = renderPalette({ selectedId: 'DOG' });

    fireEvent.click(row('dog'));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(DOG);
  });

  // MUI shares a module-level "a tooltip was just open" flag across every Tooltip, which drops
  // the enter delay for the next one; keep this the only test that opens a tooltip.
  it('describes a word in a tooltip after hovering it a moment', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    renderPalette();

    fireEvent.mouseOver(row('cat'));
    act(() => vi.advanceTimersByTime(399));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('tooltip')).toHaveTextContent('the cat, as a noun');
  });
});
