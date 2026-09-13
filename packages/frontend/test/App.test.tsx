import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept, LanguageCode, PhrasePlan, Translation } from '@signi/shared';
import App from '../src/App.tsx';
import { fetchTranslation } from '../src/api.ts';
import type { PhraseContainer, PhraseLink } from '../src/components/PhraseBuilder/interfaces.ts';
import type { PhraseWorkspace } from '../src/components/PhraseBuilder/PhraseWorkspace.tsx';
import type { SavedPhrasesToolbar } from '../src/components/SavedPhrasesToolbar.tsx';
import { place } from './hooks/dom.ts';
import { renderWithProviders, type SeededStrings } from './render.tsx';

// The translation requests go through api.ts; no test reaches a backend.
vi.mock('../src/api.ts');

// The workspace and the saved-phrase toolbar are whole features with tests of their own. App's
// part is the state it hands them and takes back, so stubs record their latest props.
const stubs = vi.hoisted(() => ({
  workspace: undefined as unknown as ComponentProps<typeof PhraseWorkspace>,
  toolbar: undefined as unknown as ComponentProps<typeof SavedPhrasesToolbar>,
}));

vi.mock('../src/components/PhraseBuilder/PhraseWorkspace.tsx', () => ({
  PhraseWorkspace: (props: ComponentProps<typeof PhraseWorkspace>) => {
    stubs.workspace = props;
    return (
      <div data-testid="workspace">
        <button type="button" onClick={props.onWordsPanelClose}>
          close the words panel
        </button>
      </div>
    );
  },
}));

vi.mock('../src/components/SavedPhrasesToolbar.tsx', () => ({
  SavedPhrasesToolbar: (props: ComponentProps<typeof SavedPhrasesToolbar>) => {
    stubs.toolbar = props;
    return <div data-testid="saved-phrases-toolbar" />;
  },
}));

const LANGUAGES: LanguageCode[] = ['en', 'it', 'fr', 'de', 'es', 'ja', 'pt'];

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const CAT = noun('CAT');
const DOG = noun('DOG');

// The server's answer to a plan: its subject's id, tagged with each language.
function translate(plan: PhrasePlan): Promise<Translation[]> {
  const subject = (plan.subject as { concept: string }).concept;
  return Promise.resolve(
    LANGUAGES.map((language) => ({ language, text: `${subject} (${language})` })),
  );
}

const period = (id: string, selection: PhraseContainer['selection'] = {}): PhraseContainer => ({
  id,
  selection,
});

function renderApp(strings: SeededStrings = {}) {
  return renderWithProviders(<App />, { strings });
}

const wordsButton = (name = 'Words') => screen.getByRole('button', { name });
const edit = (containers: PhraseContainer[], links: PhraseLink[] = []) =>
  act(() => {
    stubs.workspace.setContainers(containers);
    stubs.workspace.setLinks(links);
  });

// The left column holds the workspace; the resize handle follows it inside the split.
const leftColumn = () => screen.getByTestId('workspace').parentElement!;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fetchTranslation).mockImplementation(translate);
});

describe('App', () => {
  describe('the header', () => {
    it('names the app and gives its tagline', () => {
      renderApp();

      expect(screen.getByText('Signi')).toBeInTheDocument();
      expect(screen.getByText('Semantic phrase builder')).toBeInTheDocument();
    });

    it('carries the language selector and the saved-phrase toolbar', () => {
      renderApp();

      expect(screen.getByLabelText('Interface language')).toBeInTheDocument();
      expect(screen.getByTestId('saved-phrases-toolbar')).toBeInTheDocument();
    });

    it('follows the UI language chosen in the selector', () => {
      renderApp({
        'app.payoff': { it: 'creatore di frasi semantiche' },
        'words.heading': { it: 'Parole' },
        'translations.heading': { it: 'Traduzioni' },
      });

      const selector = within(screen.getByLabelText('Interface language')).getByRole('combobox');
      fireEvent.mouseDown(selector);
      fireEvent.click(screen.getByRole('option', { name: /Italian/ }));

      expect(screen.getByText('creatore di frasi semantiche')).toBeInTheDocument();
      expect(wordsButton('Parole')).toBeInTheDocument();
      expect(screen.getByText('Traduzioni')).toBeInTheDocument();
    });
  });

  describe('the words panel', () => {
    it('starts closed', () => {
      renderApp();

      expect(wordsButton()).toHaveAttribute('aria-pressed', 'false');
      expect(stubs.workspace.wordsPanelOpen).toBe(false);
    });

    it('opens and closes from the header, remembering the choice', () => {
      renderApp();

      fireEvent.click(wordsButton());
      expect(wordsButton()).toHaveAttribute('aria-pressed', 'true');
      expect(stubs.workspace.wordsPanelOpen).toBe(true);
      expect(localStorage.getItem('signi:wordsPanelOpen')).toBe('true');

      fireEvent.click(wordsButton());
      expect(wordsButton()).toHaveAttribute('aria-pressed', 'false');
      expect(stubs.workspace.wordsPanelOpen).toBe(false);
      expect(localStorage.getItem('signi:wordsPanelOpen')).toBe('false');
    });

    it('reopens as it was left', () => {
      localStorage.setItem('signi:wordsPanelOpen', 'true');
      renderApp();

      expect(wordsButton()).toHaveAttribute('aria-pressed', 'true');
      expect(stubs.workspace.wordsPanelOpen).toBe(true);
    });

    it('closes when the workspace asks, remembering that too', () => {
      localStorage.setItem('signi:wordsPanelOpen', 'true');
      renderApp();

      fireEvent.click(screen.getByRole('button', { name: 'close the words panel' }));

      expect(wordsButton()).toHaveAttribute('aria-pressed', 'false');
      expect(stubs.workspace.wordsPanelOpen).toBe(false);
      expect(localStorage.getItem('signi:wordsPanelOpen')).toBe('false');
    });
  });

  describe('the workspace', () => {
    it('starts as one empty period with no links, shared with the toolbar', () => {
      renderApp();

      expect(stubs.workspace.containers).toEqual([{ id: expect.any(String), selection: {} }]);
      expect(stubs.workspace.links).toEqual([]);
      expect(stubs.toolbar.containers).toBe(stubs.workspace.containers);
      expect(stubs.toolbar.links).toBe(stubs.workspace.links);
    });

    it("hands the workspace's edits to the toolbar, to save", () => {
      renderApp();
      const containers = [period('a', { subject: CAT }), period('b')];
      const links: PhraseLink[] = [
        {
          id: 'l1',
          source: { containerId: 'a', nounKey: 'subject' },
          target: { containerId: 'b', nounKey: 'subject' },
        },
      ];

      edit(containers, links);

      expect(stubs.toolbar.containers).toBe(containers);
      expect(stubs.toolbar.links).toBe(links);
    });

    it('replaces the periods and links with a phrase the toolbar loads', () => {
      renderApp();
      const containers = [period('x', { subject: DOG })];
      const links: PhraseLink[] = [];

      act(() => stubs.toolbar.onLoad(containers, links));

      expect(stubs.workspace.containers).toBe(containers);
      expect(stubs.workspace.links).toBe(links);
    });
  });

  describe('the translations', () => {
    const lines = (language: LanguageCode) =>
      within(screen.getByTestId(`translation-${language}`))
        .queryAllByTestId('sentence')
        .map((line) => line.textContent);

    it('ask for a sentence while the period is empty', () => {
      renderApp();

      expect(screen.getByTestId('translations-empty')).toBeInTheDocument();
      expect(fetchTranslation).not.toHaveBeenCalled();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('translate every root period, in order', async () => {
      renderApp();

      edit([period('a', { subject: CAT }), period('b', { subject: DOG })]);

      await waitFor(() => expect(lines('en')).toEqual(['CAT (en)', 'DOG (en)']));
      expect(lines('ja')).toEqual(['CAT (ja)', 'DOG (ja)']);
      expect(fetchTranslation).toHaveBeenCalledTimes(2);
    });

    it('fold a linked period into the sentence it hangs off, not translate it apart', async () => {
      renderApp();

      edit(
        [period('a', { subject: CAT }), period('b', { subject: DOG })],
        [
          {
            id: 'l1',
            source: { containerId: 'a', nounKey: 'subject' },
            target: { containerId: 'b', nounKey: 'subject' },
          },
        ],
      );

      await waitFor(() => expect(lines('en')).toEqual(['CAT (en)']));
      expect(fetchTranslation).toHaveBeenCalledOnce();
    });

    it('say so when any sentence cannot be translated, still showing the others', async () => {
      vi.mocked(fetchTranslation).mockImplementation((plan) =>
        (plan.subject as { concept: string }).concept === 'DOG'
          ? Promise.reject(new Error('offline'))
          : translate(plan),
      );
      renderApp();

      edit([period('a', { subject: CAT }), period('b', { subject: DOG })]);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Could not reach the translation server.',
      );
      await waitFor(() => expect(lines('en')).toEqual(['CAT (en)']));
    });
  });

  describe('the split between workspace and margin', () => {
    const width = () => getComputedStyle(leftColumn()).width;

    it('gives the workspace a little over half the width at first', () => {
      renderApp();

      expect(width()).toBe('58.33%');
    });

    it('restores the width it was last dragged to', () => {
      localStorage.setItem('signi:leftWidth', '40');
      renderApp();

      expect(width()).toBe('40%');
    });

    it('follows a drag of its handle, within limits, and remembers where it was dropped', () => {
      renderApp();
      const handle = leftColumn().nextElementSibling!;
      // jsdom does no layout; say the split is 1000px wide.
      place(leftColumn().parentElement!, 0, 0, 1000, 600);

      expect(fireEvent.pointerDown(handle, { clientX: 583 })).toBe(false);
      fireEvent.pointerMove(window, { clientX: 683 });
      expect(width()).toBe('68.33%');

      fireEvent.pointerMove(window, { clientX: -1000 });
      expect(width()).toBe('20%');
      fireEvent.pointerMove(window, { clientX: 3000 });
      expect(width()).toBe('100%');
      fireEvent.pointerMove(window, { clientX: 483 });
      expect(localStorage.getItem('signi:leftWidth')).toBeNull();

      fireEvent.pointerUp(window);
      expect(width()).toBe('48.33%');
      expect(localStorage.getItem('signi:leftWidth')).toBe('48.3');

      // Released, the handle no longer tracks the pointer.
      fireEvent.pointerMove(window, { clientX: 900 });
      expect(width()).toBe('48.33%');
    });

    it('ends a drag the browser cancels as if it were dropped', () => {
      renderApp();
      const handle = leftColumn().nextElementSibling!;
      place(leftColumn().parentElement!, 0, 0, 1000, 600);

      fireEvent.pointerDown(handle, { clientX: 500 });
      fireEvent.pointerMove(window, { clientX: 400 });
      fireEvent.pointerCancel(window);
      fireEvent.pointerMove(window, { clientX: 900 });

      expect(width()).toBe('48.33%');
      expect(localStorage.getItem('signi:leftWidth')).toBe('48.3');
    });
  });
});
