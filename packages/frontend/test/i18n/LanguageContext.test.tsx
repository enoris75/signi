import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { LanguageProvider, useUiLanguage } from '../../src/i18n/LanguageContext.tsx';

const STORAGE_KEY = 'signi:uiLanguage';

// A reader of the context: shows the UI language and switches it to Italian when clicked.
function Reader({ name }: { name: string }) {
  const { uiLanguage, setUiLanguage } = useUiLanguage();
  return (
    <button type="button" aria-label={name} onClick={() => setUiLanguage('it')}>
      {uiLanguage}
    </button>
  );
}

const renderReaders = () =>
  render(
    <LanguageProvider>
      <Reader name="header" />
      <Reader name="panel" />
    </LanguageProvider>,
  );

describe('LanguageProvider', () => {
  it('starts in English when no language has been chosen', () => {
    renderReaders();

    expect(screen.getByRole('button', { name: 'header' })).toHaveTextContent('en');
  });

  it('restores the language chosen on an earlier visit', () => {
    localStorage.setItem(STORAGE_KEY, 'ja');
    renderReaders();

    expect(screen.getByRole('button', { name: 'header' })).toHaveTextContent('ja');
  });

  it('falls back to English when the stored value is not a supported language', () => {
    localStorage.setItem(STORAGE_KEY, 'tlh');
    renderReaders();

    expect(screen.getByRole('button', { name: 'header' })).toHaveTextContent('en');
  });

  it('switches every reader to the chosen language and remembers it for the next visit', () => {
    const { unmount } = renderReaders();

    fireEvent.click(screen.getByRole('button', { name: 'header' }));

    expect(screen.getByRole('button', { name: 'header' })).toHaveTextContent('it');
    expect(screen.getByRole('button', { name: 'panel' })).toHaveTextContent('it');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('it');

    unmount();
    renderReaders();
    expect(screen.getByRole('button', { name: 'panel' })).toHaveTextContent('it');
  });

  // A19: the page's own `lang`, which index.html sets to English before the app boots.
  it('tells the page which language it is in, and follows a change', () => {
    document.documentElement.lang = 'en';
    localStorage.setItem(STORAGE_KEY, 'ja');
    renderReaders();

    expect(document.documentElement.lang).toBe('ja');

    fireEvent.click(screen.getByRole('button', { name: 'header' }));
    expect(document.documentElement.lang).toBe('it');
  });

  it('keeps the same setter across a language change, so effects can depend on it', () => {
    const { result } = renderHook(() => useUiLanguage(), { wrapper: LanguageProvider });
    const { setUiLanguage } = result.current;

    act(() => setUiLanguage('fr'));

    expect(result.current.uiLanguage).toBe('fr');
    expect(result.current.setUiLanguage).toBe(setUiLanguage);
  });
});

describe('useUiLanguage', () => {
  it('refuses to be read outside a LanguageProvider', () => {
    // React reports the render error, both as an uncaught error event (which jsdom would print)
    // and on the console, before rethrowing it.
    const swallow = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener('error', swallow);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(() => renderHook(() => useUiLanguage())).toThrow(
        'useUiLanguage must be used within a LanguageProvider',
      );
    } finally {
      window.removeEventListener('error', swallow);
    }
  });
});
