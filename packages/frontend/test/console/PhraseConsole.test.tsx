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

/** Type into the prompt as a keyboard would: the value changes, and the caret is at its end. */
function type(prompt: HTMLInputElement, text: string) {
  act(() => prompt.focus());
  for (const ch of text) {
    const value = prompt.value + ch;
    fireEvent.change(prompt, { target: { value, selectionStart: value.length } });
  }
}

const key = (el: Element, k: string, init: Record<string, unknown> = {}) =>
  act(() => {
    fireEvent.keyDown(el, { key: k, ...init });
  });

const shown = () => stubs.workspace.containers[0]!.selection;

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
    expect(prompt.value).toBe('/subj ');
    // After a role command and its space the list turns to that role's words.
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
    expect(within(screen.getByTestId('console-transcript')).getByTestId('transcript-typed')).toHaveTextContent('/subj cat /adj brown /pl');
    expect(screen.getByTestId('source-strip')).toHaveTextContent('/subj cat /adj brown /pl');
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
    expect(prompt.value).toBe('/verb eat /frob');
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
    expect(prompt.value).toBe('/subj cat');
    expect(screen.getByTestId('console-history-tag')).toHaveTextContent('history · 1 of 1');
    expect(JSON.parse(localStorage.getItem('signi:consoleHistory')!)).toEqual(['/subj cat']);
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
      await waitFor(() => expect(prompt.value).toBe('/subj cat '));
      expect(screen.getByTestId('console-chip')).toHaveTextContent(/editing period 1/i);
      fireEvent.change(prompt, { target: { value: '', selectionStart: 0 } });
      key(prompt, 'Escape');
      type(prompt, '#1.subj /pl /edit');
      key(prompt, 'Enter');
      await waitFor(() => expect(prompt.value).toBe('/subj cat /pl '));
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

    it('keeps a link picked on the canvas off a period only the preview proposes', async () => {
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
      key(prompt, 'Escape');
      key(prompt, 'Escape');
      await waitFor(() => expect(stubs.workspace.containers).toHaveLength(1));
      expect(stubs.workspace.links).toEqual([]);
    });

    it('leaves an input method’s ↵ to the input method', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat');
      if (screen.queryByTestId('console-list')) key(prompt, 'Escape');
      key(prompt, 'Enter', { isComposing: true, keyCode: 229 });
      expect(prompt.value).toBe('/subj cat');
    });
  });
});
