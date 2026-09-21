import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import App from '../../src/App.tsx';
import { renderWithProviders } from '../render.tsx';

// jsdom has no ResizeObserver, no layout and no pointer capture; the canvas reads all three.
vi.mock('../../src/components/PhraseBuilder/hooks/useElementSize.ts', () => ({
  useElementSize: (_ref: unknown, initial: { w: number; h: number }) => initial,
}));
vi.mock('../../src/components/PhraseBuilder/hooks/useCornerOverlap.ts', () => ({
  useCornerOverlap: () => ({ w: 0, h: 0 }),
}));
vi.mock('../../src/components/PhraseBuilder/hooks/useOverlapResolution.ts', () => ({
  useOverlapResolution: () => {},
}));
// The panel's word map loads the entire lexicon; the panel itself is what these tests drive.
vi.mock('../../src/components/WordMap/WordMap.tsx', () => ({
  WordMap: ({ open }: { open: boolean }) => (open ? <div data-testid="word-map" /> : null),
}));
// The translations come from the backend; the panel's rows are what these tests drive.
vi.mock('../../src/hooks/useTranslation.ts', () => ({ useTranslations: () => [] }));

Element.prototype.setPointerCapture = () => {};
// The words panel measures the sticky header to know where to start.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const CONCEPTS = {
  noun: [{ id: 'CAT', role: 'noun' as const, description: 'a cat', label: 'cat' }],
  pronoun: [],
  verb: [],
  adjective: [],
  adverb: [],
};

function renderApp() {
  return renderWithProviders(<App />, { concepts: CONCEPTS });
}

/** A keystroke, to whatever holds the cursor. */
const press = (key: string, held: Record<string, boolean> = {}) => {
  act(() => {
    fireEvent.keyDown(document.activeElement ?? document.body, { key, ...held });
  });
};
const focus = (el: HTMLElement) => act(() => el.focus());
const region = (name: string) =>
  document.querySelector<HTMLElement>(`[data-kb-region="${name}"]`)!;
const activeRegion = () =>
  document.activeElement?.closest('[data-kb-region]')?.getAttribute('data-kb-region') ?? null;

describe('the keys that work anywhere', () => {
  it('opens the help overlay on ?, its keyboard section generated from the keymaps', () => {
    renderApp();

    press('?');

    const sheet = screen.getByRole('dialog', { name: 'Help' });
    expect(within(sheet).getByRole('heading', { name: 'Keyboard navigation' })).toBeInTheDocument();
    // Every level is listed, and each row carries the key it is actually bound to. (The console's
    // reference below it has rows of its own — /tense among them.)
    const keys = within(sheet).getByRole('region', { name: 'Keyboard navigation' });
    expect(within(keys).getByTestId('help-section-app')).toHaveTextContent(/^Everywhere/);
    expect(within(keys).getByText('Period')).toBeInTheDocument();
    expect(within(keys).getByText('Noun')).toBeInTheDocument();
    expect(within(keys).getByText('Tense')).toBeInTheDocument();
    expect(within(keys).getByText('Conditional clause')).toBeInTheDocument();
    // Listed whether or not there is anything to take back: the sheet says what the keys are.
    expect(within(keys).getByText('Undo')).toBeInTheDocument();
    expect(within(keys).getByText('Redo')).toBeInTheDocument();
    // What the keys work on, one statement to a line, on the catalogue's English fallbacks (C22). The
    // Everywhere level has no note: its caps are drawn for the platform the switch is on.
    const prose = within(keys).getByTestId('help-keyboard-prose');
    expect(prose).toHaveTextContent('A key works in the slot that has the cursor.');
    expect(prose).toHaveTextContent('Return to the period: esc');
    expect(prose).toHaveTextContent('Choose the previous value: ⇧');
    expect(within(within(keys).getByTestId('help-section-app')).queryByTestId('help-section-note')).toBeNull();
    expect(within(keys).getByTestId('help-section-mood')).toHaveTextContent('This slot replaces the subject in a command.');
  });

  // The switch redraws the paragraph's modifier with the rows' caps, which is why the sheet no longer
  // says that Ctrl is ⌘ on a Mac (C22).
  it('draws the paragraph’s modifier for the platform the switch is on', () => {
    renderApp();
    press('?');
    const sheet = screen.getByRole('dialog', { name: 'Help' });
    const prose = within(sheet).getByTestId('help-keyboard-prose');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Mac' }));
    expect(prose).toHaveTextContent('Keys that work everywhere: ⌘');
    expect(within(sheet).getByTestId('help-section-app')).toHaveTextContent('⌘');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Windows & Linux' }));
    expect(prose).toHaveTextContent('Keys that work everywhere: Ctrl');
    expect(within(sheet).getByTestId('help-section-app')).not.toHaveTextContent('⌘');
  });

  // The sheet's headings and rows are the catalogue's where the words are seeded: the levels by the
  // nouns the canvas names them with, the keymap's commands by their `labelKey`, and the picker's
  // rows by the words its own key strip shows.
  it('lists the keys in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'de');
    renderWithProviders(<App />, {
      concepts: CONCEPTS,
      strings: {
        'period.name': { de: 'Satzgefüge' },
        'help.commandSubject': { de: 'Subjekt des Befehls' },
        'help.translationsAndWords': { de: 'Übersetzungen und Wörter' },
        'action.movePeriodUp': { de: 'Dieses Satzgefüge nach oben verschieben' },
        'clause.conditional': { de: 'Konditionaler Satz' },
        'action.replaceWord': { de: 'Das Wort ersetzen' },
        'action.move': { de: 'verschieben' },
        'action.close': { de: 'schließen' },
        'words.heading': { de: 'Wörter' },
        'wordMap.heading': { de: 'Wortkarte' },
        'satellite.relative': { de: 'Relativsatz' },
        'clause.coordinated': { de: 'Beigeordneter Satz' },
        'help.heading': { de: 'Hilfe' },
        'help.keyboard': { de: 'Tastaturnavigation' },
        'help.section.app': { de: 'Überall' },
        'help.section.pick': { de: 'Ziele' },
        'help.nextTarget': { de: 'Nächstes Ziel' },
        'region.next': { de: 'Nächster Bereich' },
        'action.leavePeriod': { de: 'Das Satzgefüge verlassen' },
        'satellite.tense': { de: 'Tempus' },
        'hint.backwards': { de: 'rückwärts' },
        'hint.chooseAndNext': { de: 'wählen, und dann zum nächsten Slot gehen' },
        'help.keyWorks': { de: 'Eine Taste funktioniert im Slot, der den Cursor hat.' },
        'help.keysEverywhere': { de: 'Tasten, die überall funktionieren' },
        'help.cursorInPeriod': { de: 'Der Cursor ist im Satzgefüge.' },
        'slot.subject': { de: 'Subjekt' },
        'help.directObject': { de: 'Direktes Objekt' },
        'help.complement': { de: 'Ergänzung' },
        'slot.possessor': { de: 'Besitzer' },
        'help.conjunct': { de: 'Konjunkt' },
        'help.goToTabs': { de: 'Aus der ersten Zeile zu den Tabs gehen' },
        'help.restoreWord': { de: 'Das Wort zurückholen' },
      },
    });

    // The corner button is named as the overlay it opens.
    expect(screen.getByTestId('help-button')).toHaveAccessibleName('Hilfe');
    press('?');

    const keys = within(screen.getByRole('dialog', { name: 'Hilfe' })).getByRole('region', {
      name: 'Tastaturnavigation',
    });
    expect(within(keys).getByText('Satzgefüge')).toBeInTheDocument();
    expect(within(keys).getByText('Subjekt des Befehls')).toBeInTheDocument();
    expect(within(keys).getByText('Übersetzungen und Wörter')).toBeInTheDocument();
    expect(within(keys).getByText('Dieses Satzgefüge nach oben verschieben')).toBeInTheDocument();
    expect(within(keys).getByText('Konditionaler Satz')).toBeInTheDocument();
    expect(within(keys).getByText('Das Wort ersetzen')).toBeInTheDocument();
    // The picker's bare commands, which the sheet capitalizes with CSS rather than in the text.
    expect(within(keys).getAllByText('verschieben').length).toBeGreaterThan(0);
    // The menu's esc, and the word list's first one (C22).
    expect(within(keys).getAllByText('schließen')).toHaveLength(2);
    // A panel's row says which panel before its colon.
    expect(within(keys).getByText('Wörter: Wortkarte')).toBeInTheDocument();
    // The link controls a pick serves, each by its own name.
    expect(within(keys).getByText(/^Relativsatz, .*, Beigeordneter Satz, /)).toBeInTheDocument();
    expect(within(keys).queryByText('If-condition')).not.toBeInTheDocument();
    expect(within(keys).queryByText('Move')).not.toBeInTheDocument();
    // The section headings and the keys that move about the page (B41, B44).
    expect(within(keys).getByTestId('help-section-app')).toHaveTextContent(/^Überall/);
    expect(within(keys).getByTestId('help-section-pick')).toHaveTextContent(/^Ziele/);
    expect(within(keys).getByText('Nächstes Ziel')).toBeInTheDocument();
    expect(within(keys).getByText('Nächster Bereich')).toBeInTheDocument();
    expect(within(keys).getByText('Das Satzgefüge verlassen')).toBeInTheDocument();
    expect(within(keys).getByText('wählen, und dann zum nächsten Slot gehen')).toBeInTheDocument();
    // A ⇧ twin is named after the key it reverses, a comma, and the adverb.
    expect(within(keys).getByText('Tempus, rückwärts')).toBeInTheDocument();
    // The paragraph, one statement to a line, a key after its colon; the levels' notes; the word
    // list's rows (C22).
    const prose = within(keys).getByTestId('help-keyboard-prose');
    expect(prose).toHaveTextContent('Eine Taste funktioniert im Slot, der den Cursor hat.');
    expect(prose).toHaveTextContent('Tasten, die überall funktionieren: Ctrl');
    expect(within(keys).getByTestId('help-section-period')).toHaveTextContent('Der Cursor ist im Satzgefüge.');
    expect(within(within(keys).getByTestId('help-section-noun')).getByTestId('help-section-note')).toHaveTextContent(
      'Subjekt, Direktes Objekt, Ergänzung, Besitzer, Konjunkt',
    );
    expect(within(keys).getByText('Aus der ersten Zeile zu den Tabs gehen')).toBeInTheDocument();
    expect(within(keys).getByText('Das Wort zurückholen')).toBeInTheDocument();
  });

  // B40, B42, B43: undo and redo, the console's two keys, and the period's ↵, + and −. The console's
  // commands below the keys name its help rows after the same console.
  it('names the undo, console and canvas keys in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'de');
    renderWithProviders(<App />, {
      concepts: CONCEPTS,
      strings: {
        'action.undo': { de: 'Rückgängig machen' },
        'action.redo': { de: 'Wiederholen' },
        'console.name': { de: 'Konsole' },
        'action.typeCommand': { de: 'Einen Befehl in der Konsole tippen' },
        'action.edit': { de: 'Bearbeiten' },
        'action.expandCanvas': { de: 'Die Arbeitsfläche erweitern' },
        'action.shrinkCanvas': { de: 'Die Arbeitsfläche verkleinern' },
        'action.returnToCanvas': { de: 'zur Arbeitsfläche zurückkehren' },
        'words.heading': { de: 'Wörter' },
        'action.showInConsole': { de: 'In der Konsole zeigen' },
      },
    });

    press('?');

    const sheet = screen.getByRole('dialog');
    const keys = within(sheet).getByRole('region', { name: 'Keyboard navigation' });
    for (const label of ['Rückgängig machen', 'Wiederholen', 'Konsole', 'Einen Befehl in der Konsole tippen', 'Bearbeiten', 'Die Arbeitsfläche verkleinern']) {
      expect(within(keys).getByText(label)).toBeInTheDocument();
    }
    // + and = both grow the canvas.
    expect(within(keys).getAllByText('Die Arbeitsfläche erweitern')).toHaveLength(2);
    expect(within(keys).getByText('Wörter: zur Arbeitsfläche zurückkehren')).toBeInTheDocument();
    // The console's part is headed by its name, and each row says where it opens the command's page.
    expect(within(sheet).getByRole('heading', { name: 'Konsole' })).toBeInTheDocument();
    expect(within(sheet).getByTestId('console-help-row-undo')).toHaveAttribute('title', 'In der Konsole zeigen: /undo');
    expect(within(keys).queryByText('Undo')).not.toBeInTheDocument();
  });

  // The key is for whoever knows it; the icon is for whoever does not.
  it('opens the same overlay from the help icon in the corner', async () => {
    renderApp();
    const help = screen.getByTestId('help-button');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(help);

    const overlay = screen.getByRole('dialog', { name: 'Help' });
    expect(within(overlay).getByRole('heading', { name: 'Keyboard navigation' })).toBeInTheDocument();
    expect(within(overlay).getByTestId('help-section-app')).toBeInTheDocument();

    fireEvent.click(within(overlay).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('names the help icon without reading its key as part of the name', () => {
    renderApp();
    const help = screen.getByTestId('help-button');

    expect(help).toHaveAccessibleName('Help');
    expect(help).toHaveAttribute('aria-keyshortcuts', '?');
  });

  it('draws the Ctrl caps for whichever platform the switch is on', () => {
    renderApp();
    press('?');
    const sheet = screen.getByRole('dialog');

    fireEvent.click(within(sheet).getByRole('button', { name: 'Windows & Linux' }));
    expect(within(sheet).getAllByText('Ctrl').length).toBeGreaterThan(0);

    fireEvent.click(within(sheet).getByRole('button', { name: 'Mac' }));
    expect(within(sheet).queryByText('Ctrl')).not.toBeInTheDocument();
    expect(within(sheet).getAllByText('⌘').length).toBeGreaterThan(0);
  });

  // Ctrl O is the header's Load, which the key presses where it stands so its dialog hangs off
  // it. (Ctrl S is Save, which the header disables until there is something to save.)
  it('presses the header’s own controls on the Ctrl chords', () => {
    renderApp();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    press('o', { ctrlKey: true });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows and hides the words panel on Ctrl B', () => {
    renderApp();
    expect(region('words')).toHaveAttribute('inert');

    press('b', { ctrlKey: true });
    expect(region('words')).not.toHaveAttribute('inert');

    press('b', { ctrlKey: true });
    expect(region('words')).toHaveAttribute('inert');
  });

  // A chord is never what someone is typing, so the app's keys reach through an open picker.
  it('works from inside a word picker, where the bare keys do not', () => {
    renderApp();
    const input = screen.getByTestId('typeahead-subject');
    focus(input);

    press('b', { ctrlKey: true });

    expect(region('words')).not.toHaveAttribute('inert');
  });
});

describe('walking the page with F6', () => {
  it('goes round the regions in order, and back', () => {
    renderApp();
    focus(screen.getByTestId('typeahead-subject'));
    expect(activeRegion()).toBe('periods');

    // Nothing is translated yet and the words panel is hidden, so neither is a place to go: the
    // walk carries past them to the console, shown on a first visit, and round to the header.
    press('F6');
    expect(activeRegion()).toBe('console');

    press('F6');
    expect(activeRegion()).toBe('header');

    press('F6');
    expect(activeRegion()).toBe('periods');

    press('F6', { shiftKey: true });
    expect(activeRegion()).toBe('header');
  });

  it('comes back to where a region was left', () => {
    renderApp();
    const input = screen.getByTestId('typeahead-subject');
    focus(input);

    press('F6');
    press('F6');
    press('F6');

    expect(activeRegion()).toBe('periods');
    expect(document.activeElement).toBe(input);
  });
});

describe('the header as one toolbar stop', () => {
  it('walks its controls with the arrows, and keeps one tab stop', () => {
    renderApp();
    const controls = Array.from(region('header').querySelectorAll<HTMLElement>('[data-kb-toolbar]'));
    focus(controls[0]!);

    press('ArrowRight');
    expect(document.activeElement).toBe(controls[1]);

    press('ArrowLeft');
    expect(document.activeElement).toBe(controls[0]);

    // Exactly one of them is in the page's tab order; the rest are reached from it.
    expect(controls.filter((c) => c.getAttribute('tabindex') === '0')).toHaveLength(1);
  });
});
