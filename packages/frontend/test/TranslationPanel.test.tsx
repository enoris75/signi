import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
import type { LanguageCode, Translation } from '@signi/shared';
import TranslationPanel from '../src/components/TranslationPanel.tsx';
import type { SentenceResult } from '../src/hooks/useTranslation.ts';
import { renderWithProviders, type SeededStrings } from './render.tsx';

const LANGUAGE_ORDER: LanguageCode[] = ['en', 'it', 'fr', 'de', 'es', 'ja', 'pt'];

// A translated sentence: the same text in every language, tagged with the language, except
// where `overrides` gives a language its own translation.
function translated(
  text: string,
  overrides: Partial<Record<LanguageCode, Partial<Translation>>> = {},
) {
  return {
    translations: LANGUAGE_ORDER.map((language) => ({
      language,
      text: `${text} (${language})`,
      ...overrides[language],
    })),
    isLoading: false,
    isError: false,
    isReady: true,
  } satisfies SentenceResult;
}

const PENDING: SentenceResult = { isLoading: true, isError: false, isReady: true };
const UNREADY: SentenceResult = { isLoading: false, isError: false, isReady: false };

function renderPanel(sentences: SentenceResult[], strings: SeededStrings = {}) {
  return renderWithProviders(<TranslationPanel sentences={sentences} />, { strings });
}

const languageRow = (language: LanguageCode) => screen.getByTestId(`translation-${language}`);

// The sentence lines of one language's row, in order.
const lines = (language: LanguageCode) =>
  within(languageRow(language))
    .queryAllByTestId('sentence')
    .map((line) => line.textContent);

// MUI's documented class for a Skeleton, the placeholder line of a sentence still in flight.
const placeholders = (language: LanguageCode) =>
  languageRow(language).querySelectorAll('.MuiSkeleton-root');

describe('TranslationPanel', () => {
  it('asks for a sentence while there is nothing to translate', () => {
    renderPanel([]);

    expect(screen.getByText('Translations')).toBeInTheDocument();
    expect(screen.getByTestId('translations-empty')).toHaveTextContent(
      'Select a subject and a verb to see the translations.',
    );
    expect(screen.queryByTestId('translation-en')).not.toBeInTheDocument();
  });

  it('keeps the empty state while no sentence is ready to translate', () => {
    renderPanel([UNREADY, UNREADY]);

    expect(screen.getByTestId('translations-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('translation-en')).not.toBeInTheDocument();
  });

  it('gives every language a row, in order, each with its flag and name', () => {
    renderPanel([translated('The cat sleeps')]);

    const rows = screen.getAllByTestId(/^translation-/);
    expect(rows.map((r) => r.dataset['testid'])).toEqual(
      LANGUAGE_ORDER.map((language) => `translation-${language}`),
    );
    expect(languageRow('it')).toHaveTextContent(/^🇮🇹Italian/);
    expect(languageRow('ja')).toHaveTextContent(/^🇯🇵Japanese/);
    expect(screen.queryByTestId('translations-empty')).not.toBeInTheDocument();
  });

  it("lists each language's translation of every sentence, in period order", () => {
    renderPanel([translated('The cat sleeps'), translated('The dog barks')]);

    expect(lines('en')).toEqual(['The cat sleeps (en)', 'The dog barks (en)']);
    expect(lines('de')).toEqual(['The cat sleeps (de)', 'The dog barks (de)']);
  });

  it('skips a sentence that is not ready to translate', () => {
    renderPanel([UNREADY, translated('The dog barks')]);

    expect(lines('fr')).toEqual(['The dog barks (fr)']);
    expect(placeholders('fr')).toHaveLength(0);
  });

  it('holds the place of a sentence still in flight without dropping the others', () => {
    renderPanel([translated('The cat sleeps'), PENDING, translated('The dog barks')]);

    const row = languageRow('es');
    expect(lines('es')).toEqual(['The cat sleeps (es)', 'The dog barks (es)']);
    expect(placeholders('es')).toHaveLength(1);
    // The placeholder sits between the two sentences it separates.
    const [first, second] = within(row).getAllByTestId('sentence');
    expect(first.nextElementSibling).toBe(placeholders('es')[0]);
    expect(placeholders('es')[0].nextElementSibling).toBe(second);
  });

  it('sets furigana over a sentence that carries readings', () => {
    renderPanel([
      translated('The cat sleeps', {
        ja: {
          text: '猫が寝る。',
          ruby: [{ t: '猫', r: 'ねこ' }, { t: 'が' }, { t: '寝', r: 'ね' }, { t: 'る。' }],
        },
      }),
    ]);

    const line = within(languageRow('ja')).getByTestId('sentence');
    expect(line).toHaveTextContent(/^猫ねこが寝ねる。$/);
    const ruby = line.querySelectorAll('ruby');
    expect([...ruby].map((r) => [r.firstChild?.textContent, r.querySelector('rt')?.textContent]))
      .toEqual([
        ['猫', 'ねこ'],
        ['寝', 'ね'],
      ]);
    // A sentence without readings is plain text.
    expect(within(languageRow('en')).getByTestId('sentence').querySelector('ruby')).toBeNull();
  });

  it('names the heading and the languages in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderPanel([translated('The cat sleeps')], {
      'translations.heading': { it: 'Traduzioni' },
      'language.de': { it: 'Tedesco' },
      'action.copyTranslation': { it: 'Copia la traduzione' },
    });

    expect(screen.getByText('Traduzioni')).toBeInTheDocument();
    expect(languageRow('de')).toHaveTextContent(/^🇩🇪Tedesco/);
    // The plan can't carry the row's language, so the button's name adds it in brackets.
    expect(screen.getByRole('button', { name: 'Copia la traduzione (Tedesco)' })).toBeInTheDocument();
  });

  it('rules off every row but the last', () => {
    renderPanel([translated('The cat sleeps')]);

    const rules = LANGUAGE_ORDER.map(
      (language) => getComputedStyle(languageRow(language)).borderBottomStyle,
    );
    expect(rules).toEqual(['solid', 'solid', 'solid', 'solid', 'solid', 'solid', 'none']);
  });

  describe('copying', () => {
    const writeText = vi.fn<(text: string) => Promise<void>>();

    beforeEach(() => {
      writeText.mockReset().mockResolvedValue(undefined);
      // jsdom has no clipboard.
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      });
    });

    afterEach(() => {
      Reflect.deleteProperty(navigator, 'clipboard');
      vi.useRealTimers();
    });

    const copyButton = (name: string) =>
      screen.getByRole('button', { name: `Copy the translation (${name})` });

    // The handler awaits the clipboard before it confirms.
    const click = async (button: HTMLElement) => {
      await act(async () => {
        fireEvent.click(button);
      });
    };

    it("copies a language's translated sentences, one per line", async () => {
      renderPanel([translated('The cat sleeps'), PENDING, translated('The dog barks')]);

      await click(copyButton('Italian'));

      expect(writeText).toHaveBeenCalledExactlyOnceWith('The cat sleeps (it)\nThe dog barks (it)');
    });

    it('copies the plain text of a sentence set with furigana', async () => {
      renderPanel([
        translated('The cat sleeps', {
          ja: { text: '猫が寝る。', ruby: [{ t: '猫', r: 'ねこ' }, { t: 'が寝る。' }] },
        }),
      ]);

      await click(copyButton('Japanese'));

      expect(writeText).toHaveBeenCalledExactlyOnceWith('猫が寝る。');
    });

    it('offers no copy button for a language with nothing translated yet', () => {
      renderPanel([PENDING]);

      expect(placeholders('en')).toHaveLength(1);
      expect(screen.queryByRole('button', { name: /^Copy / })).not.toBeInTheDocument();
    });

    it('confirms the copy for a moment, then offers to copy again', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      renderPanel([translated('The cat sleeps')]);
      const button = copyButton('English');
      expect(within(button).getByTestId('ContentCopyIcon')).toBeInTheDocument();

      await click(button);
      expect(within(button).getByTestId('CheckIcon')).toBeInTheDocument();
      // Only the language copied confirms.
      expect(within(copyButton('Italian')).getByTestId('ContentCopyIcon')).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1499));
      expect(within(button).getByTestId('CheckIcon')).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1));
      expect(within(button).getByTestId('ContentCopyIcon')).toBeInTheDocument();
    });

    it('stays quiet when the clipboard refuses the copy', async () => {
      writeText.mockRejectedValue(new Error('insecure context'));
      renderPanel([translated('The cat sleeps')]);
      const button = copyButton('English');

      await click(button);

      expect(writeText).toHaveBeenCalledOnce();
      expect(within(button).getByTestId('ContentCopyIcon')).toBeInTheDocument();
    });

    // MUI shares a module-level "a tooltip was just open" flag across every Tooltip, which drops
    // the enter delay for the next one; keep this the only test that opens a tooltip.
    it('says so in its tooltip once copied', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      renderPanel([translated('The cat sleeps')]);
      const button = copyButton('English');

      fireEvent.mouseOver(button);
      act(() => vi.advanceTimersByTime(100));
      expect(screen.getByRole('tooltip')).toHaveTextContent(/^Copy the translation$/);

      await click(button);
      expect(screen.getByRole('tooltip')).toHaveTextContent(/^Copied$/);
    });
  });
});
