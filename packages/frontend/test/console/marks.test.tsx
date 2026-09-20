// What the console paints on the canvas, and the canvas on the console (P02 §4): the ring the
// context rests in, the dashed preview, the numbers a link list gives its targets, and the pointer
// that lights each view from the other.
//
// PhraseConsole.test.tsx stubs the workspace, and so tests the state the console hands it. Here the
// canvas is the real one: what is tested is that the marks reach the boxes it draws.
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import App from '../../src/App.tsx';
import { renderWithProviders } from '../render.tsx';
import { ADJECTIVES, ADVERBS, NOUNS, PRONOUNS, VERBS } from './vocab.ts';

vi.mock('../../src/api.ts');
vi.mock('../../src/hooks/useTranslation.ts', () => ({ useTranslations: () => [] }));
// jsdom has no ResizeObserver and no layout: the canvas reads as its initial size, the compact
// controls reach nowhere into it, and the resolver has no real footprint to shove boxes about on
// (as in PhraseBuilder.test.tsx).
vi.mock('../../src/components/PhraseBuilder/hooks/useElementSize.ts', () => ({
  useElementSize: (_ref: unknown, initial: { w: number; h: number }) => initial,
}));
vi.mock('../../src/components/PhraseBuilder/hooks/useCornerOverlap.ts', () => ({
  useCornerOverlap: () => ({ w: 0, h: 0 }),
}));
vi.mock('../../src/components/PhraseBuilder/hooks/useOverlapResolution.ts', () => ({
  useOverlapResolution: () => {},
}));
// The words panel lists whole vocabularies and its word map loads the entire lexicon.
vi.mock('../../src/components/PhraseBuilder/PhraseSidebar.tsx', () => ({
  PhraseSidebar: () => <div data-testid="words-panel" />,
}));

// jsdom implements no pointer capture, which the canvas drag takes on every press.
Element.prototype.setPointerCapture = () => {};

// These are the only tests that render the whole app — console and real canvas both — so they are
// the heaviest in the suite: a second or so each on their own, and several times that while the
// other 160-odd files have the worker pool. The default 5 s is not headroom enough for that.
vi.setConfig({ testTimeout: 20_000 });
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

/**
 * The phrase the marks are shown on, put there in one step: a script in its canonical form lands in
 * the prompt as a paste would, and ↵ runs it whole. Typing it out is the console's own business
 * (PhraseConsole.test.tsx), and costs a render a character.
 */
async function given(prompt: HTMLInputElement, script: string) {
  act(() => prompt.focus());
  fireEvent.change(prompt, { target: { value: script, selectionStart: script.length } });
  key(prompt, 'Enter');
  await waitFor(() => expect(prompt.value).toBe(''));
}

/** The slot of the box the console rings, out of the mark it is named by: `<period>|<phrase>|<slot>`. */
const ringed = () => document.querySelector('[data-console-cursor]')?.getAttribute('data-console-mark')?.split('|').at(-1);

/** The slots of the boxes the console lights. */
const litBoxes = () =>
  [...document.querySelectorAll('[data-console-lit]')].map((e) => e.getAttribute('data-console-mark')?.split('|').at(-1));

/** The source strip, its washed words starred. */
const strip = () =>
  screen
    .queryAllByTestId('source-token')
    .map((e) => `${e.textContent}${e.hasAttribute('data-lit') ? '*' : ''}`)
    .join(' ');

/** A box on the canvas, by the slot it fills. */
const box = (slot: string) => document.querySelector(`[data-console-mark$="|${slot}"]`) as HTMLElement;

describe('the marks the console and the canvas show each other', () => {
  describe('the ring the context rests in', () => {
    it('rings the box the context is on, and moves it as the context moves', async () => {
      const prompt = renderApp();
      // A line being typed rings the box it is filling, before anything is committed.
      type(prompt, '/subj cat');
      await waitFor(() => expect(ringed()).toBe('subject'));

      // On ↵ the context auto-advances to the verb, as the pickers' own advance would, and the
      // ring goes with it.
      key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(ringed()).toBe('verb'));

      // The ring rests where the next command would land, and a line being typed does not move it
      // on: it is the verb's until ↵ makes the verb the phrase's.
      type(prompt, '/verb eat');
      await waitFor(() => expect(prompt.value).toBe('/verb ( eat )'));
      expect(ringed()).toBe('verb');
      key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(ringed()).toBe('directObject'));
    });

    it('names every box by its period and slot, so a word can be found again', async () => {
      const prompt = renderApp();
      await given(prompt, '/subj ( cat ) /verb ( eat )');
      const marks = [...document.querySelectorAll('[data-console-mark]')].map((e) =>
        e.getAttribute('data-console-mark'),
      );
      const period = marks[0]!.split('|')[0];
      expect(period).toBeTruthy();
      // Every box of the period is named by it, a nested phrase's path between: `<period>||<slot>`.
      expect(marks).toEqual([`${period}||subject`, `${period}||verb`, `${period}||directObject`]);
    });
  });

  describe('the dashed preview', () => {
    it('dashes the boxes the line would fill, and draws them solid on ↵', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat /adj brown');
      await waitFor(() => expect(screen.getByTestId('box-subject')).toHaveAttribute('data-preview', ''));
      expect(screen.getByTestId('box-subjectAdjective')).toHaveAttribute('data-preview', '');
      // Each dashed box wears the tag of what ↵ would do to it.
      expect(screen.getAllByTestId('preview-tag').length).toBeGreaterThan(0);

      key(prompt, 'Escape');
      key(prompt, 'Enter');
      await waitFor(() => expect(screen.getByTestId('box-subject')).not.toHaveAttribute('data-preview'));
      expect(screen.queryAllByTestId('preview-tag')).toHaveLength(0);
    });

    it('takes the dash away with the line when it is cleared', async () => {
      const prompt = renderApp();
      type(prompt, '/subj cat');
      await waitFor(() => expect(screen.getByTestId('box-subject')).toHaveAttribute('data-preview', ''));
      key(prompt, 'Escape'); // the list
      key(prompt, 'Escape'); // the line
      await waitFor(() => expect(prompt.value).toBe(''));
      expect(screen.getByTestId('box-subject')).not.toHaveAttribute('data-preview');
    });

    it('dashes the card of a period the line would make', async () => {
      const prompt = renderApp();
      await given(prompt, '/subj ( cat ) /verb ( eat )');
      expect(screen.queryByTestId('period-preview')).not.toBeInTheDocument();

      // A relative clause on the cat: a second period, made already linked to it. The card appears
      // with the first word the clause is given — an empty clause is nothing to draw yet.
      type(prompt, '#1.subj /rel obj');
      expect(screen.queryByTestId('period-preview')).not.toBeInTheDocument();
      type(prompt, ' /subj dog');
      await waitFor(() => expect(screen.getByTestId('period-preview')).toBeInTheDocument());
      expect(screen.getAllByTestId('period-container')).toHaveLength(2);

      key(prompt, 'Escape');
      key(prompt, 'Escape');
      await waitFor(() => expect(screen.queryByTestId('period-preview')).not.toBeInTheDocument());
      expect(screen.getAllByTestId('period-container')).toHaveLength(1);
    });
  });

  describe('the numbers a link list gives its targets', () => {
    it('numbers the noun a /rel list offers, on the box itself', async () => {
      const prompt = renderApp();
      await given(prompt, '/subj ( cat ) /verb ( eat )\n/subj ( dog ) /verb ( see )');

      // A relative clause on the cat may take the dog for its subject: the row that says so is
      // numbered 1, and so is the box it stands for.
      type(prompt, '#1.subj /rel ');
      await waitFor(() => expect(screen.getByTestId('console-list')).toHaveTextContent('#2.subj'));
      const numbered = [...document.querySelectorAll('[data-console-mark][data-kb-pick-index]')];
      expect(numbered).toHaveLength(1);
      expect(numbered[0]!.getAttribute('data-console-mark')).toMatch(/\|subject$/);
      expect(numbered[0]!.getAttribute('data-kb-pick-index')).toBe('1');
      expect(numbered[0]).toHaveTextContent('dog');

      // The list closed, the canvas is plain again.
      key(prompt, 'Escape');
      await waitFor(() => expect(document.querySelectorAll('[data-kb-pick-index]')).toHaveLength(0));
    });

    it('numbers the period an /if list offers, on its card', async () => {
      const prompt = renderApp();
      await given(prompt, '/subj ( cat ) /verb ( eat )\n/subj ( dog ) /verb ( see )');

      // The second period's if-condition may be the first: the row is numbered 1, and the card of
      // the period it stands for wears the same digit.
      type(prompt, '/if ');
      await waitFor(() => expect(screen.getByTestId('console-list')).toHaveTextContent('#1'));
      const cards = screen.getAllByTestId('period-container');
      expect(cards[0]!.querySelector('[data-kb-pick-index="1"]')).toBeInTheDocument();
      expect(cards[1]!.querySelector('[data-kb-pick-index]')).toBeNull();
    });
  });

  describe('the pointer lights the other view', () => {
    it('lights a box when the pointer is on its word in the source strip', async () => {
      const prompt = renderApp();
      await given(prompt, '/subj ( cat ) /verb ( eat )');
      const cat = screen.getAllByTestId('source-token').find((e) => e.textContent === 'cat')!;

      await act(async () => {
        fireEvent.mouseEnter(cat);
      });
      expect(litBoxes()).toEqual(['subject']);

      await act(async () => {
        fireEvent.mouseLeave(cat);
      });
      expect(litBoxes()).toEqual([]);
    });

    it('washes a word when the pointer is on the box it fills', async () => {
      const prompt = renderApp();
      await given(prompt, '/subj ( cat ) /verb ( eat )');
      // Nothing is washed to begin with: the cursor has advanced to the object, which has no word
      // in the strip to wash.
      expect(strip()).toBe('/subj ( cat ) /verb ( eat )');

      await act(async () => {
        fireEvent.mouseEnter(box('verb'));
      });
      expect(strip()).toBe('/subj ( cat ) /verb* (* eat* )*');

      await act(async () => {
        fireEvent.mouseLeave(box('verb'));
      });
      expect(strip()).toBe('/subj ( cat ) /verb ( eat )');
    });

    it('takes the context to the box whose word is clicked in the strip', async () => {
      const prompt = renderApp();
      await given(prompt, '/subj ( cat ) /verb ( eat )');
      await waitFor(() => expect(ringed()).toBe('directObject'));

      const cat = screen.getAllByTestId('source-token').find((e) => e.textContent === 'cat')!;
      await act(async () => {
        fireEvent.click(cat);
      });
      // The ring follows the context back to the subject, and the strip is not loaded into the
      // prompt: a word is a way to its box, not a way into the line.
      await waitFor(() => expect(ringed()).toBe('subject'));
      expect(screen.getByTestId('console-chip')).toHaveTextContent(/subject/i);
      expect(prompt.value).toBe('');
    });
  });

  it('leaves the keyboard in the prompt when the preview opens a picker on the canvas', async () => {
    const prompt = renderApp();
    await given(prompt, '/subj ( cat ) /verb ( eat )');
    // The preview of a relative clause mounts a whole period, and its still-empty subject opens a
    // picker — which would pull the caret out of the line being typed if it took the keyboard.
    type(prompt, '#1.subj /rel obj /verb see');
    await waitFor(() => expect(screen.getByTestId('period-preview')).toBeInTheDocument());
    expect(screen.getByTestId('typeahead-subject')).toBeInTheDocument();
    expect(document.activeElement).toBe(prompt);
  });
});
