// The console on the page (P02 §7, "Component"): typing and ⇥ make the ghost, the list, the preview
// and the commit; a change made elsewhere comes back as an echo; the keys show, hide and walk it.
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import App from '../../src/App.tsx';
import type { PhraseWorkspace } from '../../src/components/PhraseBuilder/PhraseWorkspace.tsx';
import { savePhrase } from '../../src/api.ts';
import { renderWithProviders, type SeededStrings } from '../render.tsx';
import { ADJECTIVES, ADVERBS, NOUNS, PRONOUNS, VERBS } from './vocab.ts';

vi.mock('../../src/api.ts');
vi.mock('../../src/hooks/useTranslation.ts', () => ({ useTranslations: () => [] }));

// The canvas is a feature with tests of its own; here it is the state the console hands it.
const stubs = vi.hoisted(() => ({ workspace: undefined as unknown as ComponentProps<typeof PhraseWorkspace>, renders: 0 }));
vi.mock('../../src/components/PhraseBuilder/PhraseWorkspace.tsx', () => ({
  PhraseWorkspace: (props: ComponentProps<typeof PhraseWorkspace>) => {
    stubs.workspace = props;
    stubs.renders += 1;
    return <div data-testid="workspace" />;
  },
}));

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

function renderApp(strings: SeededStrings = {}) {
  renderWithProviders(<App />, {
    strings,
    concepts: { noun: NOUNS, pronoun: PRONOUNS, verb: VERBS, adjective: ADJECTIVES, adverb: ADVERBS },
  });
  return screen.getByTestId('console-prompt') as HTMLInputElement;
}

/** Type into the prompt as a keyboard would: each character at the caret, and the caret after it. */
function type(prompt: HTMLInputElement, text: string) {
  act(() => prompt.focus());
  for (const ch of text) {
    const from = prompt.selectionStart ?? prompt.value.length;
    const to = prompt.selectionEnd ?? from;
    const value = prompt.value.slice(0, from) + ch + prompt.value.slice(to);
    fireEvent.change(prompt, { target: { value, selectionStart: from + 1, selectionEnd: from + 1 } });
  }
}

const key = (el: Element, k: string, init: Record<string, unknown> = {}) =>
  act(() => {
    fireEvent.keyDown(el, { key: k, ...init });
  });

const shown = () => stubs.workspace.containers[0]!.selection;

/** The text selected in the prompt. */
const selected = (prompt: HTMLInputElement) => prompt.value.slice(prompt.selectionStart ?? 0, prompt.selectionEnd ?? 0);

/** The number of the period the prompt is editing, as the chip's `data-editing` holds it; undefined when none is. */
const editing = () =>
  screen.getByTestId('console-chip').querySelector('[data-editing]')?.getAttribute('data-editing') ?? undefined;

describe('the console', () => {
  it('is docked under the page on a first visit, and remembers being hidden', () => {
    renderApp();
    expect(screen.getByTestId('phrase-console')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('console-toggle'));
    expect(screen.queryByTestId('phrase-console')).not.toBeInTheDocument();
    expect(localStorage.getItem('signi:consoleOpen')).toBe('false');
  });

  it('ghosts the best completion and lists the rest, and ⇥ takes it', async () => {
    const prompt = renderApp();
    type(prompt, '/su');
    await waitFor(() => expect(screen.getByTestId('console-ghost')).toHaveTextContent('bj'));
    const list = screen.getByTestId('console-list');
    expect(within(list).getAllByTestId('console-option')[0]).toHaveAttribute('data-insert', '/subj');
    key(prompt, 'Tab');
    expect(prompt.value).toBe('/subj (  )');
    // A period's word opens its bracket, and the list turns to that role's words.
    await waitFor(() =>
      expect(within(screen.getByTestId('console-list')).getAllByTestId('console-option').map((o) => o.getAttribute('data-insert'))).toContain('cat'),
    );
  });

  it('previews a line on the canvas before ↵, and commits it as the state on ↵', async () => {
    const prompt = renderApp();
    type(prompt, '/subj cat /adj brown /pl');
    // The canvas is handed the preview; the committed period is still empty.
    await waitFor(() => expect(shown().subject?.id).toBe('CAT'));
    expect(shown().subjectAdjective?.id).toBe('BROWN');
    key(prompt, 'Escape'); // close the list
    key(prompt, 'Enter');
    await waitFor(() => expect(prompt.value).toBe(''));
    expect(shown().subjectNumber).toBe('plural');
    expect(within(screen.getByTestId('console-transcript')).getByTestId('transcript-typed')).toHaveTextContent('/subj ( cat /adj brown /pl )');
    expect(screen.getByTestId('source-strip')).toHaveTextContent('/subj ( cat /adj brown /pl )');
    // The context has moved on to the verb, as the pickers' auto-advance would.
    expect(screen.getByTestId('console-chip')).toHaveTextContent(/verb/i);
  });

  it('drops the preview when the line is cleared, leaving the state as it was', async () => {
    const prompt = renderApp();
    type(prompt, '/subj cat');
    await waitFor(() => expect(shown().subject?.id).toBe('CAT'));
    key(prompt, 'Escape');
    key(prompt, 'Escape');
    await waitFor(() => expect(prompt.value).toBe(''));
    expect(shown().subject).toBeUndefined();
  });

  it('refuses ↵ on a line that does not parse, and says why', async () => {
    const prompt = renderApp();
    type(prompt, '/verb eat /frob');
    // Nothing completes /frob, so no list is up and ↵ runs the line.
    expect(screen.queryByTestId('console-list')).not.toBeInTheDocument();
    key(prompt, 'Enter');
    await waitFor(() => expect(screen.getByTestId('console-diagnostic')).toHaveTextContent('There is no command /frob.'));
    expect(prompt.value).toBe('/verb ( eat /frob )');
  });

  it('echoes a change made elsewhere as the command it equals', async () => {
    const prompt = renderApp();
    type(prompt, '/subj cat /verb eat');
    key(prompt, 'Escape');
    key(prompt, 'Enter');
    await waitFor(() => expect(shown().verb?.id).toBe('EAT'));
    // The canvas negates the verb.
    act(() =>
      stubs.workspace.setContainers((cs) => cs.map((c) => ({ ...c, selection: { ...c.selection, verbNegative: true } }))),
    );
    await waitFor(() => expect(screen.getByTestId('transcript-echo')).toHaveTextContent('/not · eat'));
  });

  it('walks back through the lines run before with ↑', async () => {
    const prompt = renderApp();
    type(prompt, '/subj cat');
    key(prompt, 'Escape');
    key(prompt, 'Enter');
    await waitFor(() => expect(prompt.value).toBe(''));
    key(prompt, 'ArrowUp');
    expect(prompt.value).toBe('/subj ( cat )');
    // Where the walk is, in figures after the word (B45): "history · 1/1".
    expect(screen.getByTestId('console-history-tag')).toHaveTextContent('history · 1/1');
    expect(JSON.parse(localStorage.getItem('signi:consoleHistory')!)).toEqual(['/subj ( cat )']);
  });

  it('shows and hides with the key below esc, by where it is rather than what it types', async () => {
    const prompt = renderApp();
    act(() => prompt.blur());
    // An Italian keyboard prints \\ there: the key is matched by its code.
    key(document.body, '\\', { code: 'Backquote' });
    await waitFor(() => expect(document.activeElement).toBe(prompt));
    key(prompt, '\\', { code: 'Backquote' });
    await waitFor(() => expect(screen.queryByTestId('phrase-console')).not.toBeInTheDocument());
  });

  it('starts a command with / from outside a text field', async () => {
    const prompt = renderApp();
    act(() => prompt.blur());
    key(document.body, '/');
    await waitFor(() => expect(document.activeElement).toBe(prompt));
    expect(prompt.value).toBe('/');
  });

  // Found in review.
  describe('what a review found', () => {
    /** Run a line to its commit. */
    async function commit(prompt: HTMLInputElement, line: string) {
      type(prompt, line);
      if (screen.queryByTestId('console-list')) key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
    }

    it('types ? in the prompt rather than opening the help', () => {
      const prompt = renderApp();
      act(() => prompt.focus());
      key(prompt, '?');
      expect(screen.queryByTestId('help-overlay')).not.toBeInTheDocument();
    });

    it('takes its preview away with it when hidden', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat');
      await waitFor(() => expect(shown().subject?.id).toBe('CAT'));
      fireEvent.click(screen.getByTestId('console-toggle'));
      await waitFor(() => expect(shown().subject).toBeUndefined());
    });

    it('leaves edit mode on esc even with the line empty', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat');
      fireEvent.click(screen.getByTestId('source-strip'));
      await waitFor(() => expect(editing()).toBe('1'));
      fireEvent.change(prompt, { target: { value: '', selectionStart: 0 } });
      key(prompt, 'Escape');
      await waitFor(() => expect(editing()).toBeUndefined());
    });

    it('edits the period the line goes to, as the line leaves it', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat /new /subj dog');
      // /edit puts the period's source into the prompt, where ↵ would replace the period with it.
      type(prompt, '#1 /edit');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat ) '));
      expect(editing()).toBe('1');
      fireEvent.change(prompt, { target: { value: '', selectionStart: 0 } });
      key(prompt, 'Escape');
      type(prompt, '#1.subj /pl /edit');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat /pl ) '));
    });

    it('does not re-render the page while a period is being edited and nothing changes', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat');
      fireEvent.click(screen.getByTestId('source-strip'));
      await waitFor(() => expect(editing()).toBeDefined());
      await new Promise((r) => setTimeout(r, 300));
      const before = stubs.renders;
      await new Promise((r) => setTimeout(r, 700));
      expect(stubs.renders - before).toBeLessThanOrEqual(1);
    });

    it('does not echo its own /undo back as a canvas change', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat');
      await new Promise((r) => setTimeout(r, 450)); // past the history's coalescing window
      await commit(prompt, '#1.subj /pl');
      await commit(prompt, '/undo');
      await waitFor(() => expect(shown().subjectNumber).not.toBe('plural'));
      expect(screen.queryByTestId('transcript-echo')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('transcript-typed').at(-1)).toHaveTextContent(/\/undo$/);
    });

    it('runs the line when a click on the canvas reaches beyond its period, the click landing on what it made', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat');
      type(prompt, '/new /subj dog');
      await waitFor(() => expect(stubs.workspace.containers).toHaveLength(2));
      const proposed = stubs.workspace.containers[1]!.id;
      act(() =>
        stubs.workspace.setLinks((ls) => [
          ...ls,
          { id: 'l', kind: 'conditional', source: { containerId: stubs.workspace.containers[0]!.id }, target: { containerId: proposed } },
        ]),
      );
      await waitFor(() => expect(prompt.value).toBe(''));
      // The line ran — the new period is the phrase's, under a real id — and the link with it.
      expect(stubs.workspace.containers).toHaveLength(2);
      const made = stubs.workspace.containers[1]!.id;
      expect(made).not.toMatch(/^preview-/);
      expect(stubs.workspace.links).toEqual([expect.objectContaining({ kind: 'conditional', target: { containerId: made } })]);
      expect(screen.getAllByTestId('transcript-typed').at(-1)).toHaveTextContent('/new /subj ( dog )');
    });

    it('leaves an input method’s ↵ to the input method', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat');
      if (screen.queryByTestId('console-list')) key(prompt, 'Escape');
      key(prompt, 'Enter', { isComposing: true, keyCode: 229 });
      expect(prompt.value).toBe('/subj ( cat )');
    });
  });

  describe('pins and help pages (phase 5)', () => {
    async function commit(prompt: HTMLInputElement, line: string) {
      type(prompt, line);
      if (screen.queryByTestId('console-list')) key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
    }

    it('pins the last line with /pin, and offers it first on ⇥ from an empty prompt', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat /verb eat');
      await commit(prompt, '/subj dog');
      // /pin alone pins the line run before it.
      await commit(prompt, '/pin');
      expect(JSON.parse(localStorage.getItem('signi:consolePins')!)).toEqual(['/subj ( dog )']);
      expect(screen.getAllByTestId('transcript-info').at(-1)).toHaveTextContent('Pinned line');
      key(prompt, 'Tab');
      const rows = within(screen.getByTestId('console-list')).getAllByTestId('console-option');
      expect(rows.map((r) => r.getAttribute('data-insert'))).toEqual(['/subj ( dog )', '/pin', '/subj ( cat ) /verb ( eat )']);
      expect(within(rows[0]!).getByTestId('console-option-pinned')).toBeInTheDocument();
      // ⇥ again takes the highlighted line.
      key(prompt, 'Tab');
      expect(prompt.value).toBe('/subj ( dog ) ');
    });

    it('pins and unpins a line from the transcript', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat');
      const pin = within(screen.getByTestId('transcript-typed')).getByTestId('pin-line');
      expect(pin).toHaveAttribute('aria-pressed', 'false');
      expect(pin).toHaveAccessibleName('Pin this line');
      fireEvent.click(pin);
      expect(pin).toHaveAttribute('aria-pressed', 'true');
      expect(pin).toHaveAccessibleName('Unpin this line');
      expect(JSON.parse(localStorage.getItem('signi:consolePins')!)).toEqual(['/subj ( cat )']);
      fireEvent.click(pin);
      expect(JSON.parse(localStorage.getItem('signi:consolePins')!)).toEqual([]);
    });

    it('shows a command’s page with /help, and what it would act on here', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat');
      await commit(prompt, '#1.subj /help pl');
      const page = await screen.findByTestId('help-page');
      expect(page).toHaveTextContent('/pl');
      // What it is for, as a verb is glossed (B47): the catalogue's fallback until the bundle lands.
      expect(page).toHaveTextContent("Plural — to set a noun's number");
      expect(within(page).getByTestId('help-usage-line')).toHaveTextContent('Usage: /pl');
      expect(within(page).getByTestId('help-aliases')).toHaveTextContent('alias /plural');
      expect(within(page).getByTestId('help-example-line')).toHaveTextContent(/^Example: /);
      expect(page).toHaveTextContent('/subj ( cat /pl )');
      expect(page).toHaveTextContent('Here: on cat, now singular.');
    });

    it('opens the page of a command chosen in the help overlay', async () => {
      renderApp();
      act(() => screen.getByTestId('workspace'));
      fireEvent.click(screen.getByRole('button', { name: /help/i }));
      fireEvent.click(await screen.findByTestId('console-help-row-rel'));
      const page = await screen.findByTestId('help-page');
      expect(page).toHaveTextContent('/rel #n.noun · /rel subj { … } · /rel obj { … }');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('structured lines (phase 6)', () => {
    it('brackets a line typed straight through, each command where it belongs', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat /pl /verb eat /past');
      expect(prompt.value).toBe('/subj ( cat /pl ) /verb ( eat /past )');
      await waitFor(() => expect(shown().verbTense).toBe('past'));
      expect(shown().subjectNumber).toBe('plural');
    });

    it('ghosts a word in front of the closer, and → takes it there', async () => {
      const prompt = renderApp();
      type(prompt, '/subj ca');
      expect(prompt.value).toBe('/subj ( ca )');
      await waitFor(() => expect(screen.getByTestId('console-ghost')).toHaveTextContent('t'));
      key(prompt, 'Escape');
      key(prompt, 'ArrowRight');
      // The word taken, and the caret after it, ready for what describes it: `cat | )`.
      expect(prompt.value).toBe('/subj ( cat  )');
      expect(prompt.selectionStart).toBe(12);
      // The word being typed is not a mistake yet.
      expect(screen.queryByTestId('console-diagnostic')).not.toBeInTheDocument();
    });

    it('leaves ⇧↵ to break the line rather than run it', () => {
      const prompt = renderApp();
      type(prompt, '/subj cat');
      key(prompt, 'Enter', { shiftKey: true });
      expect(prompt.value).toBe('/subj ( cat )');
      expect(screen.queryByTestId('transcript-typed')).not.toBeInTheDocument();
    });

    it('runs two periods written over several lines as one step', async () => {
      const prompt = renderApp();
      act(() => prompt.focus());
      fireEvent.change(prompt, { target: { value: '/subj ( cat\n  /pl )\n/subj ( dog )', selectionStart: 29 } });
      await waitFor(() => expect(stubs.workspace.containers).toHaveLength(2));
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
      expect(shown().subjectNumber).toBe('plural');
      expect(screen.getAllByTestId('transcript-typed').map((e) => e.textContent)).toEqual([
        expect.stringContaining('/subj ( cat /pl )'),
        expect.stringContaining('/subj ( dog )'),
      ]);
    });

    it('moves word to word with ⇥ while a period is edited, the chip following the caret', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat /pl');
      key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
      type(prompt, '#1 /edit');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat /pl ) '));
      act(() => prompt.setSelectionRange(0, 0));
      fireEvent.select(prompt);
      key(prompt, 'Tab');
      expect([prompt.selectionStart, prompt.selectionEnd]).toEqual([0, 5]);
      key(prompt, 'Tab');
      expect(selected(prompt)).toBe('cat');
      key(prompt, 'Tab');
      expect(selected(prompt)).toBe('/pl');
      fireEvent.select(prompt);
      await waitFor(() => {
        expect(editing()).toBe('1');
        expect(screen.getByTestId('console-chip')).toHaveTextContent(/›\s*subject\s*cat/i);
      });
      key(prompt, 'Tab', { shiftKey: true });
      expect(selected(prompt)).toBe('cat');
    });
  });

  describe('the source strip', () => {
    async function commit(prompt: HTMLInputElement, line: string) {
      type(prompt, line);
      if (screen.queryByTestId('console-list')) key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
    }

    const current = () =>
      screen.getAllByTestId('source-line').filter((l) => l.hasAttribute('data-current')).map((l) => l.getAttribute('data-period'));

    it('shows every period, a numbered line each, the one the context is in marked', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat /verb eat /new /subj dog');
      const lines = screen.getAllByTestId('source-line');
      expect(lines.map((l) => l.getAttribute('data-period'))).toEqual(['1', '2']);
      expect(lines[0]).toHaveTextContent('/subj ( cat ) /verb ( eat )');
      expect(lines[1]).toHaveTextContent('/subj ( dog )');
      expect(current()).toEqual(['2']);
      await commit(prompt, '#1');
      expect(current()).toEqual(['1']);
    });

    it('loads the period whose line is clicked into the prompt, whichever the context is in', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat /new /subj dog');
      fireEvent.click(screen.getAllByTestId('source-line')[0]!);
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat ) '));
      expect(editing()).toBe('1');
    });
  });

  describe('commands by topic', () => {
    it('heads the list topic by topic, a shortcut saying what it is short for', async () => {
      const prompt = renderApp();
      type(prompt, '/verb eat /');
      const list = await screen.findByTestId('console-list');
      const headings = within(list).getAllByTestId('console-list-topic').map((h) => h.textContent);
      expect(headings).toEqual(expect.arrayContaining(['Tense', 'Aspect']));
      const options = within(list).getAllByTestId('console-option');
      const past = options.find((o) => o.getAttribute('data-insert') === '/past')!;
      expect(within(past).getByTestId('console-option-shortcut')).toHaveTextContent('= /tense past');
      // /tense heads its topic, the shortcuts after it.
      const inserts = options.map((o) => o.getAttribute('data-insert'));
      expect(inserts.indexOf('/tense')).toBe(inserts.indexOf('/past') - 1);
    });

    it('lists them so in the help overlay too', async () => {
      renderApp();
      fireEvent.click(screen.getByRole('button', { name: /help/i }));
      const tense = await screen.findByTestId('console-help-topic-tense');
      expect(within(tense).getByText('/tense')).toBeInTheDocument();
      expect(within(tense).getByText('= /tense past')).toBeInTheDocument();
      // The verb's part holds its modal and adverb too, now listed by topic rather than as roles.
      expect(within(screen.getByTestId('console-help-verb')).getByTestId('console-help-topic-modal')).toBeInTheDocument();
    });
  });

  describe('clicking and typing are one', () => {
    const future = () =>
      act(() =>
        stubs.workspace.setContainers((cs) => cs.map((c, i) => (i === 0 ? { ...c, selection: { ...c.selection, verbTense: 'future' } } : c))),
      );

    it('writes a click on the canvas into the period being edited, and shows it there', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat /verb eat');
      key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
      type(prompt, '#1 /edit');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat ) /verb ( eat ) '));
      future();
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat ) /verb ( eat /future ) '));
      // The canvas shows it, and nothing is the phrase's until ↵: no echo, as for a line typed.
      expect(shown().verbTense).toBe('future');
      expect(screen.queryByTestId('transcript-echo')).not.toBeInTheDocument();
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
      expect(shown().verbTense).toBe('future');
    });

    it('takes a click on the canvas into a line still being typed, editing its period', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat /verb eat');
      await waitFor(() => expect(shown().verb?.id).toBe('EAT'));
      future();
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat ) /verb ( eat /future ) '));
      expect(editing()).toBe('1');
      expect(shown().verbTense).toBe('future');
      expect(screen.queryByTestId('transcript-typed')).not.toBeInTheDocument();
      // Esc leaves it all, the click with the line, as it would a line typed.
      key(prompt, 'Escape');
      await waitFor(() => expect(prompt.value).toBe(''));
      expect(shown().verb).toBeUndefined();
    });

    it('leaves the line as typed when a click on the canvas changes nothing', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat /verb eat');
      await waitFor(() => expect(shown().verb?.id).toBe('EAT'));
      act(() => stubs.workspace.setContainers((cs) => cs.map((c) => c)));
      await new Promise((r) => setTimeout(r, 20));
      expect(prompt.value).toBe('/subj ( cat ) /verb ( eat )');
      expect(editing()).toBeUndefined();
    });

    it('writes a click to the phrase at once when no line is waiting', async () => {
      const prompt = renderApp();
      await (async () => {
        type(prompt, '/subj cat /verb eat');
        key(prompt, 'Escape');
        key(prompt, 'Enter');
        await waitFor(() => expect(prompt.value).toBe(''));
      })();
      future();
      await waitFor(() => expect(screen.getByTestId('transcript-echo')).toHaveTextContent('/future · eat'));
      expect(prompt.value).toBe('');
    });
  });

  // A21: the console's frame, key hints, list titles, help pages and /save results come from the
  // catalogue, so they follow the interface language; before the bundle arrives, each reads its
  // English fallback.
  describe('in the interface language', () => {
    // A slice of the catalogue as the backend renders it in Italian (probed 2026-09-21).
    const IT_STRINGS: SeededStrings = {
      'period.name': { it: 'Periodo' },
      'action.hide': { it: 'nascondi' },
      'period.empty': { it: 'periodo vuoto' },
      'console.placeholder': { it: 'digita una parola o un comando' },
      'console.list.commands': { it: 'comandi' },
      'console.topic.words': { it: 'le parole del periodo' },
      'console.usage.word': { it: 'parola' },
      'category.noun': { it: 'Sostantivo' },
      'toast.phraseSaved': { it: 'Frase salvata' },
      'failure.phraseNotSaved': { it: 'La frase non poteva essere salvata.' },
      'action.move': { it: 'sposta' },
      'slot.choose': { it: 'scegli' },
      // B45 and B46.
      'action.pinLine': { it: 'Fissa questa riga' },
      'action.unpinLine': { it: 'Sblocca questa riga' },
      'toast.linePinned': { it: 'Riga fissata' },
      'console.history': { it: 'cronologia' },
      'console.list.pinned': { it: 'righe fissate' },
      'console.list.recent': { it: 'righe recenti' },
      'console.line.pinned': { it: 'fissata' },
      'console.line.recent': { it: 'recente' },
      'console.list.values': { it: 'valori' },
      'action.complete': { it: 'completa' },
      'action.apply': { it: 'applica' },
      'action.closeList': { it: "chiudi l'elenco" },
      'console.now': { it: 'ora' },
      'console.alias.singular': { it: 'alias' },
      'console.help.usage': { it: 'Uso' },
      'console.help.example': { it: 'Esempio' },
      'console.topic.workspace': { it: 'area di lavoro' },
      'console.topic.mood': { it: 'modo' },
      'console.topic.place': { it: 'relazione spaziale' },
    };
    const italian = () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      return renderApp(IT_STRINGS);
    };
    /** Run a line to its commit: close the list if it is up, then ↵. */
    async function run(prompt: HTMLInputElement, line: string) {
      type(prompt, line);
      if (screen.queryByTestId('console-list')) key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe(''));
    }

    it('reads its English fallbacks before the bundle arrives', async () => {
      const prompt = renderApp();
      expect(screen.getByTestId('console-period')).toHaveTextContent('Period 1');
      expect(screen.getByTestId('phrase-console')).toHaveTextContent('hide');
      expect(screen.getByTestId('source-strip')).toHaveTextContent('empty period');
      expect(prompt).toHaveAttribute('placeholder', 'type a word or a command (/)');
      type(prompt, '/');
      expect(await screen.findByTestId('console-list-title')).toHaveTextContent(/^commands$/);
    });

    it('frames the console in Italian: the period, the empty period, the hint and the list', async () => {
      const prompt = italian();
      // The period by its name as rendered, not lower-cased: German capitalizes it.
      expect(screen.getByTestId('console-period')).toHaveTextContent('Periodo 1');
      expect(screen.getByTestId('phrase-console')).toHaveTextContent('nascondi');
      expect(screen.getByTestId('source-strip')).toHaveTextContent('periodo vuoto');
      expect(prompt).toHaveAttribute('placeholder', 'digita una parola o un comando (/)');
      type(prompt, '/subj cat /');
      const list = await screen.findByTestId('console-list');
      // The title from the catalogue, the word it is about after it, in the interface language too.
      expect(within(list).getByTestId('console-list-title')).toHaveTextContent('comandi · gatto');
      expect(list).toHaveTextContent('sposta');
      expect(list).toHaveTextContent('scegli');
    });

    it('writes a help page’s usage and example in Italian, the example as the source strip would', async () => {
      const prompt = italian();
      await run(prompt, '/help pl');
      const page = await screen.findByTestId('help-page');
      expect(within(page).getByTestId('help-example')).toHaveTextContent('/subj ( gatto /pl )');
      await run(prompt, '/help subj');
      await waitFor(() => expect(screen.getAllByTestId('help-page')).toHaveLength(2));
      const subj = screen.getAllByTestId('help-page')[1]!;
      expect(within(subj).getByTestId('help-usage')).toHaveTextContent('/subj ( parola … )');
      expect(within(subj).getByTestId('help-example')).toHaveTextContent('/subj ( gatto )');
      // The page's labels, each before a colon, and the other names after theirs (B46).
      expect(within(page).getByTestId('help-usage-line')).toHaveTextContent('Uso: /pl');
      expect(within(page).getByTestId('help-aliases')).toHaveTextContent('alias /plural');
      expect(within(page).getByTestId('help-example-line')).toHaveTextContent('Esempio: /subj ( gatto /pl )');
    });

    it('pins, walks and completes in Italian: the pin, what it leaves, the list, its keys and the tag (B45)', async () => {
      const prompt = italian();
      await run(prompt, '/subj cat');
      const pin = within(screen.getByTestId('transcript-typed')).getByTestId('pin-line');
      expect(pin).toHaveAccessibleName('Fissa questa riga');
      await run(prompt, '/pin');
      expect(screen.getAllByTestId('transcript-info').at(-1)).toHaveTextContent('Riga fissata');
      expect(pin).toHaveAccessibleName('Sblocca questa riga');
      // An empty prompt's ⇥: the pinned line, then the recent one, the list headed by both titles.
      key(prompt, 'Tab');
      const list = screen.getByTestId('console-list');
      expect(within(list).getByTestId('console-list-title')).toHaveTextContent('righe fissate · righe recenti');
      const rows = within(list).getAllByTestId('console-option');
      expect(rows[0]).toHaveTextContent('fissata');
      expect(rows[1]).toHaveTextContent('recente');
      expect(list).toHaveTextContent('completa');
      expect(screen.getByTestId('phrase-console')).toHaveTextContent("chiudi l'elenco");
      key(prompt, 'Escape');
      // ↑ walks the lines run, the position in figures after the word.
      key(prompt, 'ArrowUp');
      expect(screen.getByTestId('console-history-tag')).toHaveTextContent('cronologia · 1/2');
      expect(screen.getByTestId('phrase-console')).toHaveTextContent('applica');
    });

    it('annotates the list in Italian: what a setting holds now, and a command’s values (B46)', async () => {
      const prompt = italian();
      type(prompt, '/subj cat /');
      const list = await screen.findByTestId('console-list');
      expect(within(list).getAllByTestId('console-option-current')[0]).toHaveTextContent(/^ora /);
      fireEvent.change(prompt, { target: { value: '/command ', selectionStart: 9, selectionEnd: 9 } });
      await waitFor(() => expect(screen.getByTestId('console-list-title')).toHaveTextContent('valori · /command'));
    });

    // B47: what a command is for follows the interface language too, one entry for every command
    // that shares the purpose.
    it('says what a command is for in Italian', async () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      const prompt = renderApp({
        'number.value.plural': { it: 'Plurale' },
        'purpose.number': { it: 'impostare il numero di un sostantivo' },
        'purpose.negate': { it: 'negare un verbo' },
      });
      await run(prompt, '/help pl');
      expect(await screen.findByTestId('help-page')).toHaveTextContent('Plurale — impostare il numero di un sostantivo');
      await run(prompt, '/help sg');
      await waitFor(() => expect(screen.getAllByTestId('help-page')).toHaveLength(2));
      expect(screen.getAllByTestId('help-page')[1]).toHaveTextContent('— impostare il numero di un sostantivo');
      await run(prompt, '/help not');
      await waitFor(() => expect(screen.getAllByTestId('help-page')).toHaveLength(3));
      expect(screen.getAllByTestId('help-page')[2]).toHaveTextContent('— negare un verbo');
    });

    it('heads the help overlay’s parts with the catalogue’s nouns', async () => {
      italian();
      fireEvent.click(screen.getByRole('button', { name: /help/i }));
      const noun = await screen.findByTestId('console-help-noun');
      expect(within(noun).getByTestId('console-help-part')).toHaveTextContent('Sostantivo');
      expect(within(screen.getByTestId('console-help-role')).getByTestId('console-help-part')).toHaveTextContent(
        'le parole del periodo',
      );
      // The workspace's part, and the topics B46 named (the spatial relationship, the mood).
      expect(within(screen.getByTestId('console-help-workspace')).getByTestId('console-help-part')).toHaveTextContent('area di lavoro');
      expect(screen.getByTestId('console-help-topic-place')).toHaveTextContent('relazione spaziale');
      expect(screen.getByTestId('console-help-topic-mood')).toHaveTextContent('modo');
    });

    it('says what /save did as the toolbar says it', async () => {
      vi.mocked(savePhrase).mockResolvedValueOnce(undefined as never);
      const prompt = italian();
      await run(prompt, '/save gatti');
      await waitFor(() => expect(screen.getByTestId('transcript-info')).toHaveTextContent('Frase salvata'));
      vi.mocked(savePhrase).mockRejectedValueOnce(new Error('offline'));
      await run(prompt, '/save gatti');
      await waitFor(() => expect(screen.getByTestId('transcript-error')).toHaveTextContent('La frase non poteva essere salvata.'));
    });

    // B42, B43: the console's name, what its controls do to it, the way back to the canvas, and the
    // chip that names the period being edited. German, where every one of them reads unlike English.
    it('names itself, its controls and the period it edits in German', async () => {
      localStorage.setItem('signi:uiLanguage', 'de');
      const prompt = renderApp({
        'console.name': { de: 'Konsole' },
        'action.hideConsole': { de: 'Die Konsole verstecken' },
        'action.resizeConsole': { de: 'Die Konsole skalieren' },
        'action.returnToCanvas': { de: 'zur Arbeitsfläche zurückkehren' },
        'action.edit': { de: 'Bearbeiten' },
        'period.name': { de: 'Satzgefüge' },
        'hint.clickToEdit': { de: 'klicken, um zu bearbeiten' },
      });
      const docked = screen.getByTestId('phrase-console');
      expect(screen.getByTestId('console-toggle')).toHaveTextContent('Konsole');
      expect(docked).toHaveTextContent('Konsole');
      expect(prompt).toHaveAccessibleName('Konsole');
      expect(within(docked).getByRole('button', { name: 'Die Konsole verstecken' })).toBeInTheDocument();
      expect(within(docked).getByRole('separator', { name: 'Die Konsole skalieren' })).toBeInTheDocument();
      expect(docked).toHaveTextContent('zur Arbeitsfläche zurückkehren');
      await run(prompt, '/subj cat');
      expect(screen.getByTestId('source-strip')).toHaveTextContent('/edit · klicken, um zu bearbeiten');
      fireEvent.click(screen.getAllByTestId('source-line')[0]!);
      await waitFor(() => expect(editing()).toBe('1'));
      // The mode by its command, the period by its name, the number after it.
      expect(screen.getByTestId('console-chip')).toHaveTextContent('Bearbeiten · Satzgefüge 1 ›');
    });
  });
});
