import { describe, expect, it } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { PeriodCaption } from '../../src/components/PhraseBuilder/PeriodContainer/PeriodCaption.tsx';
import { KeyboardProvider } from '../../src/keyboard/KeyboardProvider.tsx';
import { renderWithProviders } from '../render.tsx';
import { cond, inst, mood } from './fixtures.ts';

// The caption reads "<label>· <hint>"; the label is what precedes the hint.
function captionLabel() {
  const hint = screen.getByText(/^·/);
  return hint.parentElement!.textContent!.slice(0, -hint.textContent!.length);
}

describe('PeriodCaption', () => {
  it('names the part the period plays', () => {
    renderWithProviders(<PeriodCaption controls={cond({ hasCondition: true })} showCanvas />);

    expect(captionLabel()).toBe('Main clause');
  });

  it('leaves the label of a free statement empty', () => {
    renderWithProviders(<PeriodCaption controls={{ imperative: mood(false) }} showCanvas />);

    expect(captionLabel()).toBe('');
  });

  it('tells the user to choose a word once the canvas is drawn, else a subject', () => {
    const { rerender } = renderWithProviders(<PeriodCaption controls={{}} showCanvas={false} />);
    expect(screen.getByText('· start by choosing a subject')).toBeInTheDocument();

    rerender(<PeriodCaption controls={{}} showCanvas />);
    expect(screen.getByText('· click a slot and then choose a word')).toBeInTheDocument();
  });

  // P01 §3.1's caption: a keyboard user reaches a slot with the arrows and fills it by typing (B44).
  it('tells a keyboard user to use the arrows and type, once a key is pressed', () => {
    renderWithProviders(
      <KeyboardProvider>
        <PeriodCaption controls={{}} showCanvas />
      </KeyboardProvider>,
    );
    expect(screen.getByText('· click a slot and then choose a word')).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: 'Shift' });
    });

    expect(screen.getByText('· use the arrow keys, and then type a word')).toBeInTheDocument();
  });

  it('names an instrument phrase in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(<PeriodCaption controls={inst({ isInstrument: true })} showCanvas />, {
      strings: { 'slot.instrumental': { it: 'Strumentale' } },
    });

    expect(captionLabel()).toBe('Strumentale');
  });
});
