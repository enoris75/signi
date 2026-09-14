import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import type { ComponentProps } from 'react';
import {
  SAVED_PHRASE_FORMAT,
  SAVED_PHRASE_VERSION,
  type Concept,
  type SavedPhraseRecord,
  type SavedPhraseSummary,
  type SerializedWorkspace,
} from '@signi/shared';
import {
  deleteSavedPhrase,
  fetchConcepts,
  fetchSavedPhrase,
  listSavedPhrases,
  savePhrase,
} from '../src/api.ts';
import { SavedPhrasesToolbar } from '../src/components/SavedPhrasesToolbar.tsx';
import type {
  PhraseContainer,
  PhraseLink,
} from '../src/components/PhraseBuilder/interfaces.ts';
import { downloadSavedPhrase } from '../src/components/PhraseBuilder/phraseSerialize.ts';
import { renderWithProviders, type Seed, type SeededStrings } from './render.tsx';

// Every saved-phrase request goes through api.ts; no test reaches a backend.
vi.mock('../src/api.ts');

// jsdom cannot download a file. The toolbar's part is handing over the right document; the
// serializers themselves stay real.
vi.mock('../src/components/PhraseBuilder/phraseSerialize.ts', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  downloadSavedPhrase: vi.fn(),
}));

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a cat', label: 'cat' };
const SLEEP: Concept = { id: 'SLEEP', role: 'verb', description: 'to sleep', label: 'sleep' };

const EMPTY: PhraseContainer[] = [{ id: 'c1', selection: {} }];
const FILLED: PhraseContainer[] = [{ id: 'c1', selection: { subject: CAT, verb: SLEEP } }];

const LINK: PhraseLink = {
  id: 'l1',
  source: { containerId: 'c1', nounKey: 'subject' },
  target: { containerId: 'c2', nounKey: 'subject' },
};

// FILLED and LINK as they go over the wire: concepts by id.
const WORKSPACE: SerializedWorkspace = {
  containers: [
    { id: 'c1', selection: { subject: 'CAT', verb: 'SLEEP' } },
    { id: 'c2', selection: { subject: 'CAT' } },
  ],
  links: [
    {
      id: 'l1',
      source: { containerId: 'c1', nounKey: 'subject' },
      target: { containerId: 'c2', nounKey: 'subject' },
    },
  ],
};

const SUMMARY: SavedPhraseSummary = {
  id: 'p1',
  name: 'The cat sleeps',
  kind: 'phrase',
  author: 'system',
  version: SAVED_PHRASE_VERSION,
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-02T10:00:00Z',
};

const OTHER: SavedPhraseSummary = { ...SUMMARY, id: 'p2', name: 'The dog barks' };

const RECORD: SavedPhraseRecord = { ...SUMMARY, workspace: WORKSPACE };

// useConcepts() with no role caches the whole catalog under 'all', a key Seed's role-keyed
// type does not name.
const CATALOG = { concepts: { all: [CAT, SLEEP] } } as Seed;

function renderToolbar(
  props: Partial<ComponentProps<typeof SavedPhrasesToolbar>> = {},
  strings: SeededStrings = {},
) {
  const onLoad = vi.fn();
  const view = renderWithProviders(
    <SavedPhrasesToolbar containers={FILLED} links={[]} onLoad={onLoad} {...props} />,
    { ...CATALOG, strings },
  );
  return { ...view, onLoad };
}

const saveButton = () => screen.getByRole('button', { name: 'Save' });
const loadButton = () => screen.getByRole('button', { name: 'Load a saved phrase' });
const importButton = () => screen.getByRole('button', { name: 'Import phrase' });
// The export icon has no name of its own; its tooltip labels the span that wraps it.
const exportButton = () => screen.getByRole('button', { name: 'Export phrase' });

function openSaveDialog() {
  fireEvent.click(saveButton());
  const dialog = screen.getByRole('dialog', { name: 'Save the whole phrase' });
  return {
    dialog,
    name: within(dialog).getByRole('textbox', { name: 'Name' }),
    save: within(dialog).getByRole('button', { name: 'Save' }),
    cancel: within(dialog).getByRole('button', { name: 'Cancel' }),
  };
}

function openLoadDialog() {
  fireEvent.click(loadButton());
  return screen.getByRole('dialog', { name: 'Load a saved phrase' });
}

// The toast message. It renders beside the dialogs rather than in them, so while a dialog is
// open it is hidden from the accessibility tree along with the rest of the page.
const findToast = () => screen.findByRole('alert', { hidden: true });

const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

function pickFile(contents: string) {
  const file = new File([contents], 'phrase.signi.json', { type: 'application/json' });
  fireEvent.change(fileInput(), { target: { files: [file] } });
}

beforeEach(() => {
  // restoreAllMocks leaves module mocks as they were, so each test starts them afresh.
  vi.resetAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SavedPhrasesToolbar', () => {
  describe('its buttons', () => {
    it('offers only loading and importing while the builder is empty', () => {
      renderToolbar({ containers: EMPTY });

      expect(saveButton()).toBeDisabled();
      expect(exportButton()).toBeDisabled();
      expect(loadButton()).toBeEnabled();
      expect(importButton()).toBeEnabled();
    });

    it('offers saving and exporting once a word is chosen', () => {
      renderToolbar({ containers: FILLED });

      expect(saveButton()).toBeEnabled();
      expect(exportButton()).toBeEnabled();
    });

    it('offers saving and exporting a workspace that holds only a link', () => {
      renderToolbar({ containers: [...EMPTY, { id: 'c2', selection: {} }], links: [LINK] });

      expect(saveButton()).toBeEnabled();
      expect(exportButton()).toBeEnabled();
    });

    it('counts any container holding a word, not just the first', () => {
      renderToolbar({ containers: [...EMPTY, { id: 'c2', selection: { subject: CAT } }] });

      expect(saveButton()).toBeEnabled();
    });

    it('names its buttons in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderToolbar(
        {},
        {
          'action.save': { it: 'Salva' },
          'action.save.tooltip': { it: "Salva l'intera frase" },
          'action.load': { it: 'Carica' },
          'action.load.tooltip': { it: 'Carica una frase salvata' },
          'action.export.tooltip': { it: 'Esporta la frase' },
          'action.import.tooltip': { it: 'Importa una frase' },
        },
      );

      expect(screen.getByRole('button', { name: 'Salva' })).toBeInTheDocument();
      expect(screen.getByLabelText("Salva l'intera frase")).toContainElement(
        screen.getByRole('button', { name: 'Salva' }),
      );
      expect(screen.getByRole('button', { name: 'Carica una frase salvata' })).toHaveTextContent(
        'Carica',
      );
      expect(screen.getByRole('button', { name: 'Esporta la frase' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Importa una frase' })).toBeInTheDocument();
    });
  });

  describe('saving', () => {
    it('saves the workspace under the name given, trimmed, and confirms', async () => {
      vi.mocked(savePhrase).mockResolvedValue(RECORD);
      renderToolbar({ containers: FILLED, links: [] });
      const { dialog, name, save } = openSaveDialog();

      expect(name).toHaveValue('');
      type(name, '  The cat sleeps  ');
      fireEvent.click(save);

      expect(await findToast()).toHaveTextContent('Saved phrase');
      expect(savePhrase).toHaveBeenCalledExactlyOnceWith({
        name: 'The cat sleeps',
        kind: 'phrase',
        workspace: {
          containers: [{ id: 'c1', selection: { subject: 'CAT', verb: 'SLEEP' } }],
          links: [],
        },
      });
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    });

    it('saves on Enter', async () => {
      vi.mocked(savePhrase).mockResolvedValue(RECORD);
      renderToolbar();
      const { name } = openSaveDialog();

      type(name, 'The cat sleeps');
      fireEvent.keyDown(name, { key: 'Enter' });

      expect(await findToast()).toHaveTextContent('Saved phrase');
      expect(savePhrase).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ name: 'The cat sleeps' }),
      );
    });

    it('cannot be sent twice while the save is in flight, by button or by Enter', async () => {
      let finish!: (record: SavedPhraseRecord) => void;
      vi.mocked(savePhrase).mockReturnValue(new Promise((resolve) => (finish = resolve)));
      renderToolbar();
      const { name, save } = openSaveDialog();

      type(name, 'The cat sleeps');
      fireEvent.keyDown(name, { key: 'Enter' });
      await waitFor(() => expect(save).toBeDisabled());
      fireEvent.keyDown(name, { key: 'Enter' });
      fireEvent.click(save);
      // A mutation reaches its request a microtask after `mutate`; let a second one get there.
      await act(async () => {});
      expect(savePhrase).toHaveBeenCalledOnce();

      finish(RECORD);
      expect(await findToast()).toHaveTextContent('Saved phrase');
    });

    it('will not save without a name', () => {
      renderToolbar();
      const { name, save } = openSaveDialog();

      expect(save).toBeDisabled();
      type(name, '   ');
      expect(save).toBeDisabled();
      fireEvent.keyDown(name, { key: 'Enter' });
      type(name, 'The cat sleeps');
      fireEvent.keyDown(name, { key: 'a' });

      expect(savePhrase).not.toHaveBeenCalled();
      expect(save).toBeEnabled();
    });

    it('starts the next save with a blank name', async () => {
      vi.mocked(savePhrase).mockResolvedValue(RECORD);
      renderToolbar();
      const first = openSaveDialog();
      type(first.name, 'The cat sleeps');
      fireEvent.click(first.save);
      await waitForElementToBeRemoved(first.dialog);

      expect(openSaveDialog().name).toHaveValue('');
    });

    it('keeps the dialog and the name when the save fails, and says so', async () => {
      vi.mocked(savePhrase).mockRejectedValue(new Error('500'));
      renderToolbar();
      const { dialog, name, save } = openSaveDialog();
      type(name, 'The cat sleeps');

      fireEvent.click(save);

      expect(await findToast()).toHaveTextContent('Could not save the phrase.');
      expect(dialog).toBeInTheDocument();
      expect(name).toHaveValue('The cat sleeps');
      expect(save).toBeEnabled();
    });

    it('closes on Cancel without saving', async () => {
      renderToolbar();
      const { dialog, cancel } = openSaveDialog();

      fireEvent.click(cancel);

      await waitForElementToBeRemoved(dialog);
      expect(savePhrase).not.toHaveBeenCalled();
    });
  });

  describe('loading', () => {
    it('fetches the saved phrases only once the dialog opens, and lists them', async () => {
      vi.mocked(listSavedPhrases).mockResolvedValue([SUMMARY, OTHER]);
      renderToolbar();
      expect(listSavedPhrases).not.toHaveBeenCalled();

      const dialog = openLoadDialog();

      expect(within(dialog).getByText('Loading…')).toBeInTheDocument();
      const items = await within(dialog).findAllByRole('button', { name: /^The / });
      expect(items.map((item) => item.textContent)).toEqual([
        expect.stringMatching(/^The cat sleepssystem · /),
        expect.stringMatching(/^The dog barkssystem · /),
      ]);
      expect(listSavedPhrases).toHaveBeenCalledExactlyOnceWith('phrase');
      expect(within(dialog).queryByText('Loading…')).not.toBeInTheDocument();
    });

    it('says when nothing has been saved yet', async () => {
      vi.mocked(listSavedPhrases).mockResolvedValue([]);
      renderToolbar();

      const dialog = openLoadDialog();

      expect(await within(dialog).findByText('No saved phrases yet.')).toBeInTheDocument();
    });

    it('says when the saved phrases could not be fetched', async () => {
      vi.mocked(listSavedPhrases).mockRejectedValue(new Error('offline'));
      renderToolbar();

      const dialog = openLoadDialog();

      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        'Could not load saved phrases.',
      );
      expect(within(dialog).queryByText('Loading…')).not.toBeInTheDocument();
      expect(within(dialog).queryByText('No saved phrases yet.')).not.toBeInTheDocument();
    });

    it('replaces the workspace with the phrase picked, and confirms', async () => {
      vi.mocked(listSavedPhrases).mockResolvedValue([SUMMARY, OTHER]);
      vi.mocked(fetchSavedPhrase).mockResolvedValue(RECORD);
      const { onLoad } = renderToolbar();
      const dialog = openLoadDialog();

      fireEvent.click(await within(dialog).findByText('The cat sleeps'));

      expect(await findToast()).toHaveTextContent('Loaded phrase');
      expect(fetchSavedPhrase).toHaveBeenCalledExactlyOnceWith('p1');
      expect(onLoad).toHaveBeenCalledExactlyOnceWith(
        [
          { id: 'c1', selection: { subject: CAT, verb: SLEEP } },
          { id: 'c2', selection: { subject: CAT } },
        ],
        [LINK],
      );
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    });

    it('waits for the word catalog before loading a phrase', async () => {
      let deliver!: (concepts: Concept[]) => void;
      vi.mocked(fetchConcepts).mockReturnValue(new Promise((resolve) => (deliver = resolve)));
      vi.mocked(listSavedPhrases).mockResolvedValue([SUMMARY]);
      vi.mocked(fetchSavedPhrase).mockResolvedValue(RECORD);
      const onLoad = vi.fn();
      // No catalog seeded: it is still on its way when the phrase is picked.
      renderWithProviders(<SavedPhrasesToolbar containers={FILLED} links={[]} onLoad={onLoad} />);
      const dialog = openLoadDialog();

      fireEvent.click(await within(dialog).findByText('The cat sleeps'));
      await waitFor(() => expect(fetchSavedPhrase).toHaveBeenCalledOnce());
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
      expect(onLoad).not.toHaveBeenCalled();

      deliver([CAT, SLEEP]);

      expect(await findToast()).toHaveTextContent('Loaded phrase');
      expect(onLoad).toHaveBeenCalledExactlyOnceWith(
        [
          { id: 'c1', selection: { subject: CAT, verb: SLEEP } },
          { id: 'c2', selection: { subject: CAT } },
        ],
        [LINK],
      );
    });

    it('loads what it can and names the words no longer in the catalog', async () => {
      vi.mocked(listSavedPhrases).mockResolvedValue([SUMMARY]);
      vi.mocked(fetchSavedPhrase).mockResolvedValue({
        ...RECORD,
        workspace: {
          containers: [{ id: 'c1', selection: { subject: 'UNICORN', verb: 'SLEEP' } }],
          links: [],
        },
      });
      const { onLoad } = renderToolbar();
      const dialog = openLoadDialog();

      fireEvent.click(await within(dialog).findByText('The cat sleeps'));

      expect(await findToast()).toHaveTextContent(
        'Loaded, but 1 word(s) are no longer in the catalog: UNICORN',
      );
      expect(onLoad).toHaveBeenCalledExactlyOnceWith(
        [{ id: 'c1', selection: { verb: SLEEP } }],
        [],
      );
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    });

    it('keeps the dialog open when the phrase picked cannot be fetched', async () => {
      vi.mocked(listSavedPhrases).mockResolvedValue([SUMMARY]);
      vi.mocked(fetchSavedPhrase).mockRejectedValue(new Error('404'));
      const { onLoad } = renderToolbar();
      const dialog = openLoadDialog();

      fireEvent.click(await within(dialog).findByText('The cat sleeps'));

      expect(await findToast()).toHaveTextContent('Could not load that phrase.');
      expect(onLoad).not.toHaveBeenCalled();
      expect(within(dialog).getByText('The cat sleeps')).toBeInTheDocument();
    });

    it('deletes a saved phrase without loading it, and refreshes the list', async () => {
      vi.mocked(listSavedPhrases)
        .mockResolvedValueOnce([SUMMARY, OTHER])
        .mockResolvedValueOnce([OTHER]);
      vi.mocked(deleteSavedPhrase).mockResolvedValue(undefined);
      const { onLoad } = renderToolbar();
      const dialog = openLoadDialog();

      fireEvent.click(
        await within(dialog).findByRole('button', { name: 'Delete The cat sleeps' }),
      );

      await waitForElementToBeRemoved(() => within(dialog).queryByText('The cat sleeps'));
      expect(deleteSavedPhrase).toHaveBeenCalledExactlyOnceWith('p1');
      expect(listSavedPhrases).toHaveBeenCalledTimes(2);
      expect(within(dialog).getByText('The dog barks')).toBeInTheDocument();
      expect(fetchSavedPhrase).not.toHaveBeenCalled();
      expect(onLoad).not.toHaveBeenCalled();
    });
  });

  describe('exporting', () => {
    it('downloads the workspace as an untitled phrase document', () => {
      renderToolbar({ containers: FILLED, links: [] });

      fireEvent.click(exportButton());

      expect(downloadSavedPhrase).toHaveBeenCalledExactlyOnceWith({
        format: SAVED_PHRASE_FORMAT,
        version: SAVED_PHRASE_VERSION,
        kind: 'phrase',
        savedAt: expect.any(String),
        name: 'Untitled phrase',
        workspace: {
          containers: [{ id: 'c1', selection: { subject: 'CAT', verb: 'SLEEP' } }],
          links: [],
        },
      });
    });

    it('names the document with the name typed for saving', async () => {
      renderToolbar();
      const { dialog, name, cancel } = openSaveDialog();
      type(name, '  The cat sleeps ');
      fireEvent.click(cancel);
      await waitForElementToBeRemoved(dialog);

      fireEvent.click(exportButton());

      expect(downloadSavedPhrase).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ name: 'The cat sleeps' }),
      );
    });
  });

  describe('importing', () => {
    it('opens the file picker', () => {
      const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
      renderToolbar();

      fireEvent.click(importButton());

      expect(click).toHaveBeenCalledOnce();
      expect(click.mock.contexts[0]).toBe(fileInput());
      expect(fileInput()).toHaveAttribute('accept', 'application/json,.json');
    });

    it('replaces the workspace with the phrase in the file picked, and confirms', async () => {
      const { onLoad } = renderToolbar();

      pickFile(
        JSON.stringify({
          format: SAVED_PHRASE_FORMAT,
          version: SAVED_PHRASE_VERSION,
          kind: 'phrase',
          savedAt: '2026-09-02T10:00:00Z',
          workspace: WORKSPACE,
        }),
      );

      expect(await findToast()).toHaveTextContent('Loaded phrase');
      expect(onLoad).toHaveBeenCalledExactlyOnceWith(
        [
          { id: 'c1', selection: { subject: CAT, verb: SLEEP } },
          { id: 'c2', selection: { subject: CAT } },
        ],
        [LINK],
      );
    });

    it('explains why a file could not be imported', async () => {
      const { onLoad } = renderToolbar();

      pickFile('{ not json');

      expect(await findToast()).toHaveTextContent("That file isn't valid JSON.");
      expect(onLoad).not.toHaveBeenCalled();
    });

    it('does nothing when the picker is dismissed without a file', async () => {
      const { onLoad } = renderToolbar();

      fireEvent.change(fileInput(), { target: { files: [] } });
      await act(async () => {});

      expect(onLoad).not.toHaveBeenCalled();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('its messages', () => {
    const failImport = async () => {
      pickFile('{ not json');
      return findToast();
    };

    it('can be dismissed', async () => {
      renderToolbar();
      const alert = await failImport();

      fireEvent.click(within(alert).getByRole('button', { name: 'Close' }));

      expect(alert).not.toBeInTheDocument();
    });

    it('go away by themselves after five seconds', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      renderToolbar();
      // findBy* settles on a timer of its own, which is faked here; flush the import by hand.
      await act(async () => pickFile('{ not json'));
      const alert = screen.getByRole('alert');

      act(() => vi.advanceTimersByTime(4999));
      expect(alert).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1));
      expect(alert).not.toBeInTheDocument();
    });
  });
});
