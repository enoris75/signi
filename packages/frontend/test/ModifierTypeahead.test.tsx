import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { Concept } from '@signi/shared';
import { ModifierTypeahead } from '../src/components/PhraseBuilder/ModifierTypeahead.tsx';
import { renderWithProviders } from './render.tsx';
import { listed, row } from './typeaheadSuite.tsx';

const BIG: Concept = { id: 'BIG', role: 'adjective', description: 'large', label: 'big' };
const OLD: Concept = { id: 'OLD', role: 'adjective', description: 'aged', label: 'old' };
const SAIL: Concept = { id: 'SAIL', role: 'noun', description: 'a sheet', label: 'sail' };
const STONE: Concept = { id: 'STONE', role: 'noun', description: 'a rock', label: 'stone' };

const renderModifier = (ui: ReactElement) =>
  renderWithProviders(ui, { concepts: { adjective: [BIG, OLD], noun: [SAIL, STONE] } });

const prompt = () => screen.getByRole('textbox').getAttribute('placeholder');
// The category switch pinned in the dropdown: its options in order, and the one pressed.
const categories = () =>
  within(screen.getByRole('tooltip'))
    .getAllByRole('button')
    .map((button) => button.textContent);
const category = () => screen.getByRole('button', { pressed: true }).textContent;
const switchTo = (name: string) => fireEvent.click(screen.getByRole('button', { name }));

describe('ModifierTypeahead', () => {
  it('searches the adjectives by default, with the Adjective | Noun switch in its dropdown', () => {
    renderModifier(<ModifierTypeahead onSelect={() => {}} />);

    expect(prompt()).toBe('type an adjective…');
    expect(listed()).toEqual(['BIG', 'OLD']);
    expect(categories()).toEqual(['Adjective', 'Noun']);
    expect(category()).toBe('Adjective');
  });

  it('switches vocabulary on its own when nothing controls it', () => {
    renderModifier(<ModifierTypeahead onSelect={() => {}} />);

    switchTo('Noun');

    expect(prompt()).toBe('type a noun…');
    expect(listed()).toEqual(['SAIL', 'STONE']);
    expect(category()).toBe('Noun');

    switchTo('Adjective');

    expect(listed()).toEqual(['BIG', 'OLD']);
  });

  it('starts on the kind it is given', () => {
    renderModifier(<ModifierTypeahead onSelect={() => {}} kind="noun" />);

    expect(listed()).toEqual(['SAIL', 'STONE']);
    expect(category()).toBe('Noun');
  });

  it('shows the kind it is given when controlled, reporting a switch instead of making it', () => {
    const onKindChange = vi.fn();
    const { rerender } = renderModifier(
      <ModifierTypeahead onSelect={() => {}} kind="adjective" onKindChange={onKindChange} />,
    );

    switchTo('Noun');

    expect(onKindChange).toHaveBeenCalledExactlyOnceWith('noun');
    expect(listed()).toEqual(['BIG', 'OLD']);

    rerender(<ModifierTypeahead onSelect={() => {}} kind="noun" onKindChange={onKindChange} />);

    expect(listed()).toEqual(['SAIL', 'STONE']);
    expect(category()).toBe('Noun');
  });

  it('orders the switch as the slot does', () => {
    renderModifier(
      <ModifierTypeahead
        onSelect={() => {}}
        kind="noun"
        options={[
          { value: 'noun', labelKey: 'category.noun' },
          { value: 'adjective', labelKey: 'category.adjective' },
        ]}
      />,
    );

    expect(categories()).toEqual(['Noun', 'Adjective']);
  });

  it.each([
    ['adjective', OLD],
    ['noun', STONE],
  ])('commits the %s picked', (kind, word) => {
    const onSelect = vi.fn();
    renderModifier(<ModifierTypeahead onSelect={onSelect} kind={kind} />);

    fireEvent.click(row(word.id));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(word);
  });
});
