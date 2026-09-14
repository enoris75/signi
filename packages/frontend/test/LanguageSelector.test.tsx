import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { LanguageSelector } from '../src/components/LanguageSelector.tsx';
import { useUiLanguage } from '../src/i18n/LanguageContext.tsx';
import { renderWithProviders, type SeededStrings } from './render.tsx';

// Another reader of the UI language, standing in for the rest of the app.
function CurrentLanguage() {
  const { uiLanguage } = useUiLanguage();
  return <output aria-label="current language">{uiLanguage}</output>;
}

const ITALIAN_NAMES: SeededStrings = {
  'language.en': { it: 'Inglese' },
  'language.it': { it: 'Italiano' },
  'language.ja': { it: 'Giapponese' },
};

function renderSelector(strings: SeededStrings = {}) {
  return renderWithProviders(
    <>
      <LanguageSelector />
      <CurrentLanguage />
    </>,
    { strings },
  );
}

// Found by its test id: the selector's name follows the language it sets.
const selector = () => screen.getByTestId('language-selector');

// MUI's Select opens on mouseDown and lists its options in a portal.
function openSelector() {
  fireEvent.mouseDown(selector());
  return within(screen.getByRole('listbox'));
}

describe('LanguageSelector', () => {
  it('shows the current UI language with its flag', () => {
    renderSelector();

    expect(selector()).toHaveTextContent(/^🇬🇧English$/);
    expect(selector()).toHaveRole('combobox');
    expect(selector()).toHaveAccessibleName('Interface language');
  });

  it('shows the language restored from an earlier visit', () => {
    localStorage.setItem('signi:uiLanguage', 'ja');
    renderSelector();

    expect(selector()).toHaveTextContent(/^🇯🇵Japanese$/);
  });

  it('offers every language, in order, each with its flag and name', () => {
    renderSelector();

    const options = openSelector().getAllByRole('option');

    expect(options.map((o) => o.textContent)).toEqual([
      '🇬🇧English',
      '🇮🇹Italian',
      '🇫🇷French',
      '🇩🇪German',
      '🇪🇸Spanish',
      '🇯🇵Japanese',
      '🇵🇹Portuguese',
    ]);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('switches the whole app to the language picked and remembers it', () => {
    renderSelector();

    fireEvent.click(openSelector().getByRole('option', { name: /Japanese/ }));

    expect(screen.getByRole('status', { name: 'current language' })).toHaveTextContent('ja');
    expect(localStorage.getItem('signi:uiLanguage')).toBe('ja');
    expect(selector()).toHaveTextContent('🇯🇵Japanese');
  });

  it('names the languages, and itself, in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderSelector({ ...ITALIAN_NAMES, 'language.selector': { it: 'Lingua di interfaccia' } });

    expect(selector()).toHaveTextContent('🇮🇹Italiano');
    expect(selector()).toHaveAccessibleName('Lingua di interfaccia');
    const options = openSelector();
    expect(options.getByRole('option', { name: /Inglese/ })).toBeInTheDocument();
    expect(options.getByRole('option', { name: /Giapponese/ })).toBeInTheDocument();
  });

  it('renames the languages as soon as the UI language changes', () => {
    renderSelector(ITALIAN_NAMES);

    fireEvent.click(openSelector().getByRole('option', { name: /Italian/ }));

    expect(selector()).toHaveTextContent('🇮🇹Italiano');
    expect(openSelector().getByRole('option', { name: /Giapponese/ })).toBeInTheDocument();
  });
});
