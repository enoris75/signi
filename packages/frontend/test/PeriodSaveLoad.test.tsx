import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import type { Concept, SavedPhraseRecord, SavedPhraseSummary } from '@signi/shared';
import { PeriodSaveLoad } from '../src/components/PhraseBuilder/PeriodSaveLoad.tsx';
import type { PhraseContainer } from '../src/components/PhraseBuilder/interfaces.ts';
import {
  deleteSavedPhrase,
  fetchConcepts,
  fetchSavedPhrase,
  listSavedPhrases,
  savePhrase,
} from '../src/api.ts';
import { renderWithProviders, type SeededStrings } from './render.tsx';

// The saved-phrase endpoints and the concept catalog are the backend; no request goes out.
vi.mock('../src/api.ts', () => ({
  savePhrase: vi.fn(),
  listSavedPhrases: vi.fn(),
  fetchSavedPhrase: vi.fn(),
  deleteSavedPhrase: vi.fn(),
  fetchConcepts: vi.fn(),
  fetchUiStrings: vi.fn(),
}));

// The filled notice's background, by severity, in the default MUI palette.
const SUCCESS = 'rgb(46, 125, 50)';
const ERROR = 'rgb(211, 47, 47)';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a small feline', label: 'cat' };
const EAT: Concept = { id: 'EAT', role: 'verb', description: 'to consume food', label: 'eat' };

const PERIOD: PhraseContainer = { id: 'c1', selection: { subject: CAT, verb: EAT } };

const BREAKFAST: SavedPhraseSummary = {
  id: 'p1',
  name: 'Breakfast',
  kind: 'period',
  author: 'system',
  version: 1,
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-09-02T09:30:00.000Z',
};

const SUPPER: SavedPhraseSummary = { ...BREAKFAST, id: 'p2', name: 'Supper' };

function record(
  summary: SavedPhraseSummary,
  containers: SavedPhraseRecord['workspace']['containers'],
): SavedPhraseRecord {
  return { ...summary, workspace: { containers, links: [] } };
}

// A promise the test settles by hand, to hold a request in flight.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderSaveLoad(
  overrides: Partial<Parameters<typeof PeriodSaveLoad>[0]> = {},
  strings: SeededStrings = {},
) {
  const props = {
    saveTarget: null,
    onCloseSave: vi.fn(),
    loadOpen: false,
    onCloseLoad: vi.fn(),
    onAppendPeriod: vi.fn(),
    ...overrides,
  };
  const view = renderWithProviders(<PeriodSaveLoad {...props} />, { strings });
  return { ...view, props };
}

// The notice showing `message`. A dialog left open hides the page behind it from the
// accessibility tree, so the notice is found by its text rather than its role.
async function findNotice(message: string) {
  return (await screen.findByText(message)).closest<HTMLElement>('[role="alert"]')!;
}

function nameField() {
  return screen.getByRole('textbox', { name: 'Name' });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fetchConcepts).mockResolvedValue([CAT, EAT]);
  vi.mocked(listSavedPhrases).mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PeriodSaveLoad', () => {
  describe('saving a period', () => {
    it('asks for nothing while no period is being saved', () => {
      renderSaveLoad();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keeps Save disabled until the period has a name', () => {
      renderSaveLoad({ saveTarget: PERIOD });
      const save = screen.getByRole('button', { name: 'Save' });

      expect(screen.getByRole('dialog', { name: 'Save period' })).toBeInTheDocument();
      expect(nameField()).toHaveFocus();
      expect(save).toBeDisabled();

      fireEvent.change(nameField(), { target: { value: '   ' } });
      expect(save).toBeDisabled();

      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });
      expect(save).toBeEnabled();
    });

    it('saves the clause as a period under its trimmed name, then closes', async () => {
      vi.mocked(savePhrase).mockResolvedValue(record(BREAKFAST, []));
      const { props } = renderSaveLoad({ saveTarget: PERIOD });

      fireEvent.change(nameField(), { target: { value: '  Breakfast  ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(props.onCloseSave).toHaveBeenCalledOnce());
      expect(savePhrase).toHaveBeenCalledExactlyOnceWith({
        name: 'Breakfast',
        kind: 'period',
        workspace: {
          containers: [{ id: 'c1', selection: { subject: 'CAT', verb: 'EAT' } }],
          links: [],
        },
      });
      expect(getComputedStyle(await findNotice('Saved period')).backgroundColor).toBe(SUCCESS);
      expect(nameField()).toHaveValue('');
    });

    it('saves on Enter once the period has a name', async () => {
      vi.mocked(savePhrase).mockResolvedValue(record(BREAKFAST, []));
      const { props } = renderSaveLoad({ saveTarget: PERIOD });

      fireEvent.keyDown(nameField(), { key: 'Enter' });
      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });
      fireEvent.keyDown(nameField(), { key: 'a' });
      expect(savePhrase).not.toHaveBeenCalled();

      fireEvent.keyDown(nameField(), { key: 'Enter' });

      await waitFor(() => expect(props.onCloseSave).toHaveBeenCalledOnce());
      expect(savePhrase).toHaveBeenCalledOnce();
    });

    it('cannot be sent twice while the save is in flight, by button or by Enter', async () => {
      const pending = deferred<SavedPhraseRecord>();
      vi.mocked(savePhrase).mockReturnValue(pending.promise);
      renderSaveLoad({ saveTarget: PERIOD });

      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      fireEvent.keyDown(nameField(), { key: 'Enter' });
      // A mutation reaches its request a microtask after `mutate`; let a second one get there.
      await act(async () => {});
      expect(savePhrase).toHaveBeenCalledOnce();

      pending.resolve(record(BREAKFAST, []));
      await findNotice('Saved period');
    });

    it('refreshes the saved-period list once saved', async () => {
      vi.mocked(savePhrase).mockResolvedValue(record(BREAKFAST, []));
      vi.mocked(listSavedPhrases).mockResolvedValueOnce([]).mockResolvedValue([BREAKFAST]);
      const { rerender, props } = renderSaveLoad({ loadOpen: true });
      await screen.findByText(/^No saved periods/);
      // Save from over the open picker, so its list is live when the save lands.
      rerender(<PeriodSaveLoad {...props} saveTarget={PERIOD} />);

      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Breakfast')).toBeInTheDocument();
      expect(listSavedPhrases).toHaveBeenCalledTimes(2);
    });

    it('reports a failed save and keeps the dialog and its name', async () => {
      vi.mocked(savePhrase).mockRejectedValue(new Error('Failed to save phrase'));
      const { props } = renderSaveLoad({ saveTarget: PERIOD });

      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      const notice = await findNotice('Could not save the period.');
      expect(getComputedStyle(notice).backgroundColor).toBe(ERROR);
      expect(props.onCloseSave).not.toHaveBeenCalled();
      expect(nameField()).toHaveValue('Breakfast');
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('closes without saving on Cancel or Escape', () => {
      const { props } = renderSaveLoad({ saveTarget: PERIOD });
      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(props.onCloseSave).toHaveBeenCalledOnce();

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(props.onCloseSave).toHaveBeenCalledTimes(2);
      expect(savePhrase).not.toHaveBeenCalled();
    });
  });

  describe('adding a saved period', () => {
    it('fetches nothing while the picker is closed', () => {
      renderSaveLoad({ loadOpen: false });

      expect(listSavedPhrases).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('lists the saved periods by name, author and last update', async () => {
      vi.mocked(listSavedPhrases).mockResolvedValue([BREAKFAST, SUPPER]);
      renderSaveLoad({ loadOpen: true });

      expect(screen.getByRole('dialog', { name: 'Add a saved period' })).toBeInTheDocument();
      expect(await screen.findByText('Breakfast')).toBeInTheDocument();
      expect(screen.getByText('Supper')).toBeInTheDocument();
      const updated = new Date(BREAKFAST.updatedAt).toLocaleString('en');
      expect(screen.getAllByText(`system · ${updated}`)).toHaveLength(2);
      expect(screen.queryByText(/^No saved periods/)).not.toBeInTheDocument();
      expect(listSavedPhrases).toHaveBeenCalledExactlyOnceWith('period');
    });

    it('dates each saved period in the UI language, not the browser’s', async () => {
      localStorage.setItem('signi:uiLanguage', 'de');
      vi.mocked(listSavedPhrases).mockResolvedValue([BREAKFAST]);
      renderSaveLoad({ loadOpen: true });

      const updated = new Date(BREAKFAST.updatedAt).toLocaleString('de');
      expect(await screen.findByText(`system · ${updated}`)).toBeInTheDocument();
    });

    it('shows that the list is loading', async () => {
      const pending = deferred<SavedPhraseSummary[]>();
      vi.mocked(listSavedPhrases).mockReturnValue(pending.promise);
      renderSaveLoad({ loadOpen: true });

      expect(screen.getByText('Loading…')).toBeInTheDocument();

      pending.resolve([BREAKFAST]);
      await waitForElementToBeRemoved(() => screen.queryByText('Loading…'));
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
    });

    it('says so when nothing has been saved yet', async () => {
      renderSaveLoad({ loadOpen: true });

      expect(
        await screen.findByText(
          'No saved periods — use the icon that saves a period in a period container',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    it('says what it is doing, and how to save a period, in the UI language', async () => {
      localStorage.setItem('signi:uiLanguage', 'es');
      const pending = deferred<SavedPhraseSummary[]>();
      vi.mocked(listSavedPhrases).mockReturnValue(pending.promise);
      renderSaveLoad({ loadOpen: true }, {
        'status.loading': { es: 'Carga' },
        'saved.noPeriods': { es: 'Ningún período guardado' },
        'saved.useSaveIcon': { es: 'usar el icono que guarda un período en un recipiente de período' },
      });

      expect(screen.getByText('Carga…')).toBeInTheDocument();
      pending.resolve([]);
      expect(
        await screen.findByText(
          'Ningún período guardado — usar el icono que guarda un período en un recipiente de período',
        ),
      ).toBeInTheDocument();
    });

    it('reports a list that could not be loaded', async () => {
      vi.mocked(listSavedPhrases).mockRejectedValue(new Error('Failed to load saved phrases'));
      renderSaveLoad({ loadOpen: true });

      expect(await screen.findByRole('alert')).toHaveTextContent('Could not load saved periods.');
      expect(screen.queryByText(/^No saved periods/)).not.toBeInTheDocument();
    });

    it('appends the chosen period’s clause as a new container, then closes', async () => {
      vi.mocked(listSavedPhrases).mockResolvedValue([BREAKFAST]);
      vi.mocked(fetchSavedPhrase).mockResolvedValue(
        record(BREAKFAST, [{ id: 'saved-c', selection: { subject: 'CAT', verb: 'EAT' } }]),
      );
      const { props } = renderSaveLoad({ loadOpen: true });

      fireEvent.click(await screen.findByText('Breakfast'));

      await waitFor(() => expect(props.onCloseLoad).toHaveBeenCalledOnce());
      expect(fetchSavedPhrase).toHaveBeenCalledExactlyOnceWith('p1');
      expect(props.onAppendPeriod).toHaveBeenCalledExactlyOnceWith({ subject: CAT, verb: EAT });
      expect(getComputedStyle(await findNotice('Added period')).backgroundColor).toBe(SUCCESS);
    });

    it('waits for the word catalog before adding a period', async () => {
      const catalog = deferred<Concept[]>();
      vi.mocked(fetchConcepts).mockReturnValue(catalog.promise);
      vi.mocked(listSavedPhrases).mockResolvedValue([BREAKFAST]);
      vi.mocked(fetchSavedPhrase).mockResolvedValue(
        record(BREAKFAST, [{ id: 'saved-c', selection: { subject: 'CAT', verb: 'EAT' } }]),
      );
      const { props } = renderSaveLoad({ loadOpen: true });

      fireEvent.click(await screen.findByText('Breakfast'));
      await waitFor(() => expect(fetchSavedPhrase).toHaveBeenCalledOnce());
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
      expect(props.onAppendPeriod).not.toHaveBeenCalled();

      catalog.resolve([CAT, EAT]);

      await findNotice('Added period');
      expect(props.onAppendPeriod).toHaveBeenCalledExactlyOnceWith({ subject: CAT, verb: EAT });
    });

    it.each([
      ['a word', { directObject: 'UNICORN' }, '1 word(s) are no longer in the catalog: UNICORN'],
      [
        'words',
        { directObject: 'UNICORN', modifier: 'GRIFFIN' },
        '2 word(s) are no longer in the catalog: UNICORN, GRIFFIN',
      ],
    ])('warns about %s no longer in the catalog, and adds the rest', async (_, gone, warning) => {
      vi.mocked(listSavedPhrases).mockResolvedValue([BREAKFAST]);
      vi.mocked(fetchSavedPhrase).mockResolvedValue(
        record(BREAKFAST, [
          { id: 'saved-c', selection: { subject: 'CAT', verb: 'EAT', ...gone } },
        ]),
      );
      const { props } = renderSaveLoad({ loadOpen: true });

      fireEvent.click(await screen.findByText('Breakfast'));

      const notice = await findNotice(`Loaded, but ${warning}`);
      expect(getComputedStyle(notice).backgroundColor).toBe(ERROR);
      expect(props.onAppendPeriod).toHaveBeenCalledExactlyOnceWith({ subject: CAT, verb: EAT });
      expect(props.onCloseLoad).toHaveBeenCalledOnce();
    });

    it.each([
      ['could not be fetched', () => Promise.reject(new Error('Failed to load phrase'))],
      ['holds no clause', () => Promise.resolve(record(BREAKFAST, []))],
    ])('reports a period that %s, and adds nothing', async (_, fetched) => {
      vi.mocked(fetchSavedPhrase).mockImplementation(fetched);
      vi.mocked(listSavedPhrases).mockResolvedValue([BREAKFAST]);
      const { props } = renderSaveLoad({ loadOpen: true });

      fireEvent.click(await screen.findByText('Breakfast'));

      const notice = await findNotice('Could not load that period.');
      expect(getComputedStyle(notice).backgroundColor).toBe(ERROR);
      expect(props.onAppendPeriod).not.toHaveBeenCalled();
      expect(props.onCloseLoad).not.toHaveBeenCalled();
    });

    it('deletes a saved period and refreshes the list, without loading it', async () => {
      vi.mocked(listSavedPhrases)
        .mockResolvedValueOnce([BREAKFAST, SUPPER])
        .mockResolvedValue([SUPPER]);
      vi.mocked(deleteSavedPhrase).mockResolvedValue();
      const { props } = renderSaveLoad({ loadOpen: true });

      fireEvent.click(
        await screen.findByRole('button', { name: 'Delete this saved period', description: 'Breakfast' }),
      );

      await waitForElementToBeRemoved(() => screen.queryByText('Breakfast'));
      expect(deleteSavedPhrase).toHaveBeenCalledExactlyOnceWith('p1');
      expect(screen.getByText('Supper')).toBeInTheDocument();
      expect(fetchSavedPhrase).not.toHaveBeenCalled();
      expect(props.onAppendPeriod).not.toHaveBeenCalled();
    });

    it('closes on Escape', () => {
      const { props } = renderSaveLoad({ loadOpen: true });

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(props.onCloseLoad).toHaveBeenCalledOnce();
    });
  });

  describe('the notice', () => {
    it('can be dismissed', async () => {
      vi.mocked(savePhrase).mockResolvedValue(record(BREAKFAST, []));
      const { rerender, props } = renderSaveLoad({ saveTarget: PERIOD });
      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(props.onCloseSave).toHaveBeenCalled());
      // The owner closes the dialog, as the workspace does.
      rerender(<PeriodSaveLoad {...props} saveTarget={null} />);

      const notice = await screen.findByRole('alert');
      expect(notice).toHaveTextContent('Saved period');
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
    });

    it('hides itself after five seconds', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      vi.mocked(savePhrase).mockResolvedValue(record(BREAKFAST, []));
      const { rerender, props } = renderSaveLoad({ saveTarget: PERIOD });
      fireEvent.change(nameField(), { target: { value: 'Breakfast' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      await act(() => vi.advanceTimersByTimeAsync(10));
      rerender(<PeriodSaveLoad {...props} saveTarget={null} />);
      await act(() => vi.advanceTimersByTimeAsync(490));
      expect(screen.getByRole('alert')).toHaveTextContent('Saved period');

      await act(() => vi.advanceTimersByTimeAsync(4000));
      expect(screen.getByRole('alert')).toHaveTextContent('Saved period');

      await act(() => vi.advanceTimersByTimeAsync(1000));
      expect(screen.queryByText('Saved period')).not.toBeInTheDocument();
      // The hide renders as that act ends, and the exit transition is timed from that render.
      await act(() => vi.advanceTimersByTimeAsync(1000));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
