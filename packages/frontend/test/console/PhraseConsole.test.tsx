// The console on the page (P02 §7, "Component"): typing and ⇥ make the ghost, the list, the preview
// and the commit; a change made elsewhere comes back as an echo; the keys show, hide and walk it.
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import App from '../../src/App.tsx';
import type { PhraseWorkspace } from '../../src/components/PhraseBuilder/PhraseWorkspace.tsx';
import { renderWithProviders } from '../render.tsx';
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

function renderApp() {
  renderWithProviders(<App />, {
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
    expect(screen.getByTestId('console-history-tag')).toHaveTextContent('history · 1 of 1');
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
      await waitFor(() => expect(screen.getByTestId('console-chip')).toHaveTextContent(/editing period 1/i));
      fireEvent.change(prompt, { target: { value: '', selectionStart: 0 } });
      key(prompt, 'Escape');
      await waitFor(() => expect(screen.getByTestId('console-chip')).not.toHaveTextContent(/editing/i));
    });

    it('edits the period the line goes to, as the line leaves it', async () => {
      const prompt = renderApp();
      await commit(prompt, '/subj cat /new /subj dog');
      // /edit puts the period's source into the prompt, where ↵ would replace the period with it.
      type(prompt, '#1 /edit');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe('/subj ( cat ) '));
      expect(screen.getByTestId('console-chip')).toHaveTextContent(/editing period 1/i);
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
      await waitFor(() => expect(screen.getByTestId('console-chip')).toHaveTextContent(/editing/i));
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
      expect(screen.getAllByTestId('transcript-info').at(-1)).toHaveTextContent('Pinned.');
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
      fireEvent.click(pin);
      expect(pin).toHaveAttribute('aria-pressed', 'true');
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
      expect(page).toHaveTextContent('Written /pl');
      expect(page).toHaveTextContent('also /plural');
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
      await waitFor(() => expect(screen.getByTestId('console-chip')).toHaveTextContent(/editing period 1 ›\s*subject\s*cat/i));
      key(prompt, 'Tab', { shiftKey: true });
      expect(selected(prompt)).toBe('cat');
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
      expect(screen.getByTestId('console-chip')).toHaveTextContent(/editing period 1/i);
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
      expect(screen.getByTestId('console-chip')).not.toHaveTextContent(/editing/i);
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
});

