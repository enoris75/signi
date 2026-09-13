import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { InfinitivePhraseBox } from '../src/components/PhraseBuilder/InfinitivePhraseBox.tsx';
import { renderWithProviders } from './render.tsx';

describe('InfinitivePhraseBox', () => {
  it('captions the subject position as an infinitive phrase', () => {
    renderWithProviders(<InfinitivePhraseBox />);

    expect(screen.getByTestId('infinitive-box')).toHaveTextContent(/^Infinitive phrase$/);
  });

  it('offers no choices, since a citation addresses nobody', () => {
    renderWithProviders(<InfinitivePhraseBox />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('names the phrase in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(<InfinitivePhraseBox />, {
      strings: { 'infinitive.phrase': { it: 'Sintagma infinitivo' } },
    });

    expect(screen.getByTestId('infinitive-box')).toHaveTextContent(/^Sintagma infinitivo$/);
  });
});
