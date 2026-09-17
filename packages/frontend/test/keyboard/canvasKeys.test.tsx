import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { useState } from 'react';
import type { Concept, GrammaticalRole } from '@signi/shared';
import {
  imperativeRegisterOf,
  type PhraseSelection,
} from '../../src/components/PhraseBuilder/interfaces.ts';
import { PhraseBuilder } from '../../src/components/PhraseBuilder/PhraseBuilder.tsx';
import { KeyboardProvider } from '../../src/keyboard/KeyboardProvider.tsx';
import { renderWithProviders } from '../render.tsx';

// jsdom has no ResizeObserver: the canvas reads as a fixed 600 px wide.
vi.mock('../../src/components/PhraseBuilder/hooks/useElementSize.ts', () => ({
  useElementSize: (_ref: unknown, initial: { w: number; h: number }) => initial,
}));
// Nor any layout: the period's compact controls reach nowhere into the canvas.
vi.mock('../../src/components/PhraseBuilder/hooks/useCornerOverlap.ts', () => ({
  useCornerOverlap: () => ({ w: 0, h: 0 }),
}));
// Every box measures 0×0 in jsdom, so the resolver would shove boxes about on no real footprint.
vi.mock('../../src/components/PhraseBuilder/hooks/useOverlapResolution.ts', () => ({
  useOverlapResolution: () => {},
}));
// The words panel lists whole vocabularies and its word map loads the entire lexicon.
vi.mock('../../src/components/PhraseBuilder/PhraseSidebar.tsx', () => ({
  PhraseSidebar: () => <div data-testid="words-panel" />,
}));

// jsdom implements no pointer capture, which the canvas drag takes on every press.
Element.prototype.setPointerCapture = () => {};

const concept = (id: string, role: GrammaticalRole, extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: id,
  label: id.toLowerCase(),
  ...extra,
});

const CAT = concept('CAT', 'noun');
const FOOD = concept('FOOD', 'noun');
const GIRL = concept('GIRL', 'noun', { gendered: true });
const SAIL = concept('SAIL', 'noun');
const EAT = concept('EAT', 'verb', { transitivity: 'transitive' });
const SLEEP = concept('SLEEP', 'verb', { transitivity: 'intransitive' });
const BIG = concept('BIG', 'adjective');
const CAN = concept('CAN', 'verb', { modal: true });
const WALK = concept('WALK', 'verb', {
  transitivity: 'intransitive',
  complements: ['route', 'locative', 'cause', 'manner'],
});
const SEEM = concept('SEEM', 'verb', { transitivity: 'intransitive', complements: ['predicative'] });
const HAPPY = concept('HAPPY', 'adjective');
const NEVER = concept('NEVER', 'adverb');

const CONCEPTS = {
  noun: [CAT, FOOD, GIRL, SAIL],
  pronoun: [],
  verb: [EAT, SLEEP, CAN, SEEM, WALK],
  adjective: [BIG, HAPPY],
  adverb: [NEVER],
};

// The period as its owner holds it, inside the app's one key listener.
function renderPeriod(initial: PhraseSelection = {}) {
  const state = { selection: initial };
  function Period() {
    const [selection, setSelection] = useState(initial);
    state.selection = selection;
    return (
      <PhraseBuilder selection={selection} onPhraseUpdate={(updater) => setSelection(updater)} />
    );
  }
  const view = renderWithProviders(
    <KeyboardProvider>
      <Period />
    </KeyboardProvider>,
    { concepts: CONCEPTS },
  );
  return { ...view, selection: () => state.selection };
}

/** The box the cursor moves over, by the slot it holds. */
const boxNode = (slot: string) =>
  document.querySelector<HTMLElement>(`[data-kb-box="${slot}"]`)!;

/** Put the cursor on a box, as an arrow key or a ⇥ would. */
const cursorTo = (slot: string) => act(() => boxNode(slot).focus());

/** A keystroke, to whatever holds the cursor — exactly what the window listener sees. */
function press(key: string, held: { shiftKey?: boolean } = {}) {
  act(() => {
    fireEvent.keyDown(document.activeElement ?? document.body, { key, ...held });
  });
}

/** Type a word into the picker that has just opened, and take the first match. */
function pickWord(query: string) {
  const input = document.activeElement as HTMLInputElement;
  act(() => {
    fireEvent.change(input, { target: { value: query } });
  });
  act(() => {
    fireEvent.keyDown(input, { key: 'Enter' });
  });
}

const boxes = () =>
  screen.queryAllByTestId(/^box-/).map((b) => b.dataset['testid']!.replace('box-', ''));

describe('the keys on a noun box', () => {
  it('makes the noun plural', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('n');

    expect(selection().subjectNumber).toBe('plural');
  });

  it('cycles the gender, and back with ⇧', () => {
    const { selection } = renderPeriod({ subject: GIRL, verb: SLEEP });
    cursorTo('subject');

    press('g');
    expect(selection().subjectGender).toBe('fem');

    press('g', { shiftKey: true });
    expect(selection().subjectGender).toBe('masc');
  });

  it('opens the determiner menu, revealing its box on the way', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');
    expect(boxes()).not.toContain('subjectDefiniteness');

    press('d');

    expect(boxes()).toContain('subjectDefiniteness');
    expect(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Paucal/ }))
      .toBeInTheDocument();
  });

  it('adds an adjective and puts the cursor in it', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('a');

    expect(boxes()).toContain('subjectAdjective');
    expect(boxNode('subjectAdjective').contains(document.activeElement)).toBe(true);
  });

  it('walks the adjective chain, one link per press', () => {
    renderPeriod({ subject: CAT, subjectAdjective: BIG, verb: SLEEP });
    cursorTo('subject');

    press('a');

    expect(boxes()).toContain('subjectAdjective2');
  });

  it('offers no key where the noun has no such control', () => {
    // CAT is not a gendered noun, so it wears no gender control — and so answers to no G.
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('g');

    expect(selection().subjectGender).toBeUndefined();
  });

  it('gives a noun its possessor', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('p');

    // The owner is a noun phrase of its own, drawn by a builder of its own: one more subject box.
    expect(screen.getAllByTestId('box-subject')).toHaveLength(2);
  });

  it('coordinates one more phrase with the noun', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('c');

    expect(screen.getAllByTestId('box-subject')).toHaveLength(2);
  });
});

describe('the keys on the verb box', () => {
  it('cycles the tense, and back with ⇧', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('verb');

    press('t');
    expect(selection().verbTense).toBe('past');

    press('t', { shiftKey: true });
    expect(selection().verbTense).toBe('present');

    // Backwards from the default wraps to the last value rather than stopping.
    press('t', { shiftKey: true });
    expect(selection().verbTense).toBe('future');
  });

  it('cycles the aspect', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('verb');

    press('a');

    expect(selection().verbAspect).toBe('progressive');
  });

  it('negates the verb', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('verb');

    press('n');

    expect(selection().verbNegative).toBe(true);
  });

  it('reveals the modal, and the adverb', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('verb');

    press('m');
    expect(boxes()).toContain('verbModal');

    cursorTo('verb');
    press('v');
    expect(boxes()).toContain('modifier');
  });

  it('folds the direct object away', () => {
    renderPeriod({ subject: CAT, verb: EAT, directObject: FOOD });
    cursorTo('verb');
    expect(boxes()).toContain('directObject');

    press('o');

    expect(boxes()).not.toContain('directObject');
  });

  it('reads N as the negation here, not as a number', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: EAT, directObject: FOOD });
    cursorTo('verb');

    press('n');

    expect(selection().verbNegative).toBe(true);
    expect(selection().subjectNumber).toBeUndefined();
    expect(selection().directObjectNumber).toBeUndefined();
  });
});

describe('the menus a key opens', () => {
  it('picks a determiner by its digit, one keystroke after the D', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('d');
    press('8');

    expect(selection().subjectDefiniteness).toBe('many');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('lists exactly the complements the verb licenses, and adds the one its letter names', () => {
    renderPeriod({ subject: CAT, verb: WALK });
    cursorTo('verb');

    press('+');

    const rows = screen.getAllByRole('menuitem').map((row) => row.dataset['testid']);
    // In the order their toggles ride the verb phrase's ring, so the menu reads as that row does.
    expect(rows).toEqual([
      'complement-row-manner',
      'complement-row-locative',
      'complement-row-route',
      'complement-row-cause',
    ]);

    press('l');

    expect(boxes()).toContain('locative');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('offers the object’s fold-away at the foot of that menu', () => {
    renderPeriod({ subject: CAT, verb: EAT, directObject: FOOD });
    cursorTo('verb');

    press('+');
    expect(screen.getAllByRole('menuitem').at(-1)!.dataset['testid']).toBe(
      'complement-row-directObject',
    );

    press('o');

    expect(boxes()).not.toContain('directObject');
  });

  it('points the next key at a complement’s relation toolbar on S', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: WALK, locative: FOOD });
    cursorTo('locative');

    press('s');
    press('u');

    expect(selection().locativeSpecifier).toBe('under');
  });

  it('counts the cause’s stances rather than lettering them', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: WALK, cause: FOOD });
    cursorTo('cause');

    press('s');
    press('3');

    expect(selection().causeSentiment).toBe('positive');
  });

  it('stops waiting when the next key is not one of the toolbar’s', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: WALK, locative: FOOD });
    cursorTo('locative');

    press('s');
    press('Escape');
    press('u');

    expect(selection().locativeSpecifier).toBeUndefined();
  });
});

describe('the keys on the command box', () => {
  it('picks the addressee by its digit', () => {
    const { selection } = renderPeriod({ imperative: true, verb: SLEEP });
    cursorTo('subject');

    press('2');
    expect(selection().imperativePerson).toBe('1pl');

    press('3');
    expect(selection().imperativePerson).toBe('2pl');
  });

  it('turns the order into an instruction, and back', () => {
    const { selection } = renderPeriod({ imperative: true, verb: SLEEP });
    cursorTo('subject');

    press('r');
    expect(imperativeRegisterOf(selection())).toBe('instruction');

    press('r');
    expect(imperativeRegisterOf(selection())).toBe('request');
  });

  // An instruction is addressed to nobody, so its row is gone and its digits go with it.
  it('offers no addressee under an instruction', () => {
    const { selection } = renderPeriod({
      imperative: true,
      imperativeRegister: 'instruction',
      verb: SLEEP,
    });
    cursorTo('subject');

    press('2');

    expect(selection().imperativePerson).toBeUndefined();
  });
});

describe('the keys on an adjective box', () => {
  // A subject complement holds either a predicate noun ("becomes a legend") or a predicate
  // adjective ("seems happy"). It answers to both grammars, adjective first: the degree is the
  // adjective's, and the coordination is the slot's, offered whatever fills it.
  it('reads a predicate adjective as both an adjective and its slot', () => {
    const { selection } = renderPeriod({
      subject: CAT,
      verb: SEEM,
      predicative: HAPPY,
    });
    cursorTo('predicative');
    expect(boxNode('predicative')).toHaveAttribute(
      'data-kb-scope',
      'box:adjective box:noun box',
    );

    press('m');
    expect(selection().adjectiveDegrees?.predicative).toBe('more');

    // The predicative's coordinate control exists on an adjective ("seems happy or tired"), so
    // its key must too — the adjective's own scope offers no C, and the slot's is reached next.
    press('c');
    expect(selection().predicativeConjuncts).toHaveLength(1);
  });


  it('cycles the degree of a real adjective', () => {
    const { selection } = renderPeriod({ subject: CAT, subjectAdjective: BIG, verb: SLEEP });
    cursorTo('subjectAdjective');

    press('m');
    expect(selection().adjectiveDegrees?.subjectAdjective).toBe('more');

    press('m', { shiftKey: true });
    expect(selection().adjectiveDegrees?.subjectAdjective).toBe('positive');
  });

  it('cycles the relation and the number of an attributive noun', () => {
    const { selection } = renderPeriod({ subject: CAT, subjectAdjective: SAIL, verb: SLEEP });
    cursorTo('subjectAdjective');

    press('r');
    expect(selection().modifierRelations?.subjectAdjective).toBe('purpose');

    press('n');
    expect(selection().modifierNumbers?.subjectAdjective).toBe('plural');
  });
});

describe('the keys every box shares', () => {
  it('clears the word on ⌫', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('Backspace');

    expect(selection().subject).toBeUndefined();
  });

  it('opens the word picker over a filled box on ↵, and keeps the cursor there after the pick', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('Enter');
    expect(screen.getByPlaceholderText('type a subject…')).toBeInTheDocument();

    pickWord('fo');

    expect(selection().subject).toEqual(FOOD);
    expect(boxNode('subject').contains(document.activeElement)).toBe(true);
  });

  it('walks to the next box on ⇥, and back on ⇧⇥', () => {
    renderPeriod({ subject: CAT, verb: EAT, directObject: FOOD });
    cursorTo('subject');

    press('Tab');
    expect(boxNode('verb')).toHaveFocus();

    press('Tab', { shiftKey: true });
    expect(boxNode('subject')).toHaveFocus();
  });

  // Choosing a word auto-advances to the next *empty* box; ⇥ says which box to land on instead,
  // so a re-pick — which advances nowhere — still moves on.
  it('takes the word and moves to the next box on ⇥ inside the picker', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: EAT, directObject: FOOD });
    cursorTo('subject');
    press('Enter');

    const input = document.activeElement as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: 'gi' } });
    });
    act(() => {
      fireEvent.keyDown(input, { key: 'Tab' });
    });

    expect(selection().subject).toEqual(GIRL);
    expect(boxNode('verb')).toHaveFocus();
  });

  it('lets the browser have ⇥ once the walk is over, rather than trapping the cursor', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');
    press('Tab');
    const last = document.activeElement;

    const defaultPrevented = !fireEvent.keyDown(last!, { key: 'Tab' });

    expect(defaultPrevented).toBe(false);
  });

  it('folds the box’s dotted group on Z, and unfolds it again', () => {
    renderPeriod({ subject: CAT, subjectAdjective: BIG, verb: SLEEP });
    cursorTo('subject');

    press('z');
    expect(boxes()).not.toContain('subjectAdjective');

    cursorTo('subject');
    press('z');
    expect(boxes()).toContain('subjectAdjective');
  });

  it('shifts the box about the canvas on ⇧ + an arrow', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    // jsdom does no layout, so the canvas has to be given a size for the pixel step to convert
    // against (the nudge itself is measured in test/hooks/useDrag.test.ts).
    const canvas = screen.getByTestId('phrase-canvas');
    canvas.getBoundingClientRect = () =>
      ({ x: 0, y: 0, width: 400, height: 200, top: 0, left: 0, right: 400, bottom: 200,
        toJSON: () => ({}) }) as DOMRect;
    cursorTo('subject');
    const left = () => getComputedStyle(boxNode('subject')).left;
    const before = left();

    press('ArrowRight', { shiftKey: true });

    expect(before).not.toBe('');
    expect(left()).not.toBe(before);
  });

  it('lets the box go on esc', () => {
    renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');

    press('Escape');

    expect(boxNode('subject')).not.toHaveFocus();
  });

  it('takes no key while the cursor is nowhere', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });

    press('n');

    expect(selection().subjectNumber).toBeUndefined();
  });

  it('takes no letter typed into an open word picker', () => {
    const { selection } = renderPeriod({ subject: CAT, verb: SLEEP });
    cursorTo('subject');
    press('Enter');

    // The picker's input holds the cursor now; N is a letter of the word being searched for.
    press('n');

    expect(selection().subjectNumber).toBeUndefined();
  });
});

// Phase 1 of the plan is done when a sentence with a plural subject, a past tense, a negation,
// an adjective and a modal can be built and edited without a mouse. This is that sentence.
describe('a period built with the keyboard alone', () => {
  it('composes and edits it without a pointer event', () => {
    const { selection } = renderPeriod();

    // The empty period opens on its subject picker, which already holds the cursor.
    pickWord('ca');
    expect(selection().subject).toEqual(CAT);

    // Choosing a word advances to the next empty box, whose picker opens in turn.
    pickWord('sl');
    expect(selection().verb).toEqual(SLEEP);

    // Nothing is left to fill, so the cursor stays on the word just chosen rather than falling
    // off the canvas with the picker that closed.
    expect(boxNode('verb').contains(document.activeElement)).toBe(true);

    cursorTo('subject');
    press('n');
    press('a');
    pickWord('bi');

    cursorTo('verb');
    press('t');
    press('n');
    press('m');
    pickWord('ca');

    expect(selection()).toMatchObject({
      subject: CAT,
      subjectNumber: 'plural',
      subjectAdjective: BIG,
      verb: SLEEP,
      verbTense: 'past',
      verbNegative: true,
      verbModal: CAN,
    });
  });
});
