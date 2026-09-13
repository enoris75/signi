import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept, PronominalPossessor } from '@signi/shared';
import type { CorefPick } from '../src/components/PhraseBuilder/CorefPickContext.tsx';
import type {
  NounKey,
  PhraseSelection,
  WorkspaceBinding,
} from '../src/components/PhraseBuilder/interfaces.ts';
import type { PhraseBuilderProps } from '../src/components/PhraseBuilder/PhraseBuilder.tsx';
import {
  openPossessorsFor,
  PossessorPanels,
} from '../src/components/PhraseBuilder/PossessorPanels.tsx';

const noun = (id: string, extra: Partial<Concept> = {}): Concept => ({
  id,
  role: 'noun',
  description: id,
  label: id.toLowerCase(),
  ...extra,
});

const BOY = noun('BOY');
const GIRL = noun('GIRL', { emoji: '👧' });
const CAT = noun('CAT');
const BOOK = noun('BOOK');
const HOUSE = noun('HOUSE');
const FOX = noun('FOX');

// What the coordinator resolves a masculine singular antecedent to.
const THIRD_SG: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular' };

// "the boy … the cat's book": the object's possessor is a genitive phrase, the subject's
// possessor panel has just been revealed and is still empty.
const SELECTION: PhraseSelection = {
  subject: BOY,
  directObject: BOOK,
  directObjectPossessor: { subject: CAT },
};

// Stands in for the injected noun-phrase builder: it shows which possessor it edits and
// records its props by address.
function stubBuilder() {
  const props = new Map<string, PhraseBuilderProps>();
  function Builder(p: PhraseBuilderProps) {
    props.set(p.possessorPath!, p);
    const head = p.selection.subject?.id;
    return <div data-testid="possessor" data-path={p.possessorPath} data-head={head} />;
  }
  return { Builder, props };
}

function fakeCoref(overrides: Partial<CorefPick> = {}): CorefPick {
  return {
    picking: null,
    start: vi.fn(),
    cancel: vi.fn(),
    isEligible: vi.fn(() => false),
    pick: vi.fn(),
    resolve: vi.fn(() => undefined),
    ...overrides,
  };
}

type Props = ComponentProps<typeof PossessorPanels>;

function renderPanels(overrides: Partial<Props> = {}) {
  const { Builder, props } = stubBuilder();
  const handlers = {
    onPhraseUpdate: vi.fn(),
    onRemovePossessor: vi.fn(),
    registerDot: vi.fn(),
  };
  const coref = overrides.coref ?? fakeCoref();
  const base: Props = {
    openPossessors: ['subject', 'directObject'],
    selection: SELECTION,
    coref,
    corefAddr: (which: NounKey) => which,
    Builder,
    ...handlers,
    ...overrides,
  };
  const view = render(<PossessorPanels {...base} />);
  const rerender = (next: Partial<Props>) =>
    view.rerender(<PossessorPanels {...base} {...next} />);
  return { ...view, ...handlers, rerender, coref, builderProps: props };
}

const possessors = () =>
  screen.queryAllByTestId('possessor').map((c) => `${c.dataset['path']}=${c.dataset['head']}`);

// The updater handed to onPhraseUpdate by the n-th call.
const updater = (fn: ReturnType<typeof vi.fn>, n = 0) =>
  fn.mock.calls[n]![0] as (prev: PhraseSelection) => PhraseSelection;

// The dot registered for `which` on the latest render.
const dotFor = (registerDot: ReturnType<typeof vi.fn>, which: NounKey) =>
  registerDot.mock.calls.filter(([w, el]) => w === which && el).at(-1)![1] as HTMLElement;

describe('openPossessorsFor', () => {
  it('lists the noun blocks with a head whose possessor is shown, in block order', () => {
    expect(
      openPossessorsFor(
        { locative: HOUSE, directObject: BOOK, subject: BOY },
        { locativePossessor: true, directObjectPossessor: true, subjectPossessor: true },
      ),
    ).toEqual(['subject', 'directObject', 'locative']);
  });

  it('skips a block whose possessor is folded away', () => {
    expect(
      openPossessorsFor(
        { subject: BOY, directObject: BOOK },
        { subjectPossessor: false, directObjectPossessor: true },
      ),
    ).toEqual(['directObject']);
  });

  it('skips a possessor left shown under a cleared head', () => {
    expect(openPossessorsFor({ directObject: BOOK }, { subjectPossessor: true })).toEqual([]);
  });
});

describe('PossessorPanels', () => {
  describe('a genitive possessor', () => {
    it('renders one builder per open possessor, in the order given', () => {
      renderPanels({ openPossessors: ['directObject', 'subject'] });

      expect(possessors()).toEqual(['directObject/possessor=CAT', 'subject/possessor=undefined']);
    });

    it('renders nothing when no possessor is open', () => {
      const { container } = renderPanels({ openPossessors: [] });

      expect(container).toBeEmptyDOMElement();
    });

    it('hands each builder its possessor slice, empty until one is chosen', () => {
      const { builderProps } = renderPanels();

      expect(builderProps.get('directObject/possessor')!.selection).toBe(
        SELECTION.directObjectPossessor,
      );
      expect(builderProps.get('subject/possessor')!.selection).toEqual({});
    });

    it('keeps the full canvas and forwards the container binding', () => {
      // Unlike a conjunct, a possessor may head a clause of its own.
      const binding = { containerId: 'c1' } as WorkspaceBinding;
      const { builderProps } = renderPanels({ binding });

      const cat = builderProps.get('directObject/possessor')!;
      expect(cat.nounPhraseOnly).toBeFalsy();
      expect(cat.binding).toBe(binding);
    });

    it('addresses the possessor under the possessor path when the panel is nested', () => {
      renderPanels({ openPossessors: ['subject'], possessorPath: 'directObject/conjunct/0' });

      expect(possessors()).toEqual(['directObject/conjunct/0/possessor=undefined']);
    });

    it('addresses a nested builder’s other nouns’ possessors under its head', () => {
      renderPanels({ possessorPath: 'subject/possessor' });

      expect(possessors()).toEqual([
        'subject/possessor/possessor=undefined',
        'subject/possessor/directObject/possessor=CAT',
      ]);
    });

    it('routes a builder edit into its own possessor slice only', () => {
      const { builderProps, onPhraseUpdate } = renderPanels();

      const cat = builderProps.get('directObject/possessor')!;
      cat.onPhraseUpdate((prev) => ({ ...prev, subject: FOX }));

      expect(onPhraseUpdate).toHaveBeenCalledOnce();
      expect(updater(onPhraseUpdate)(SELECTION)).toEqual({
        ...SELECTION,
        directObjectPossessor: { subject: FOX },
      });
    });

    it('seeds the possessor slice on the first edit of an empty panel', () => {
      const { builderProps, onPhraseUpdate } = renderPanels();

      const empty = builderProps.get('subject/possessor')!;
      empty.onPhraseUpdate((prev) => ({ ...prev, subject: GIRL }));

      expect(updater(onPhraseUpdate)(SELECTION)).toEqual({
        ...SELECTION,
        subjectPossessor: { subject: GIRL },
      });
    });

    it('removes the possessor whose builder asks', () => {
      const { builderProps, onRemovePossessor } = renderPanels();

      builderProps.get('directObject/possessor')!.onRemove!();

      expect(onRemovePossessor).toHaveBeenCalledExactlyOnceWith('directObject');
    });
  });

  describe('the mode toggle', () => {
    it('offers both ways to fill the slot, starting on a genitive phrase', () => {
      renderPanels({ openPossessors: ['subject'] });

      expect(screen.getByRole('button', { name: 'Owned by a phrase' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Refers to a noun' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('switches an empty panel to a reference without touching the selection', () => {
      const { onPhraseUpdate, coref } = renderPanels({ openPossessors: ['subject'] });

      fireEvent.click(screen.getByRole('button', { name: 'Refers to a noun' }));

      expect(possessors()).toEqual([]);
      expect(screen.getByRole('button', { name: 'Pick a noun…' })).toBeInTheDocument();
      expect(onPhraseUpdate).not.toHaveBeenCalled();
      expect(coref.cancel).not.toHaveBeenCalled();
    });

    it('remembers the mode of each block separately', () => {
      renderPanels();
      const [subjectToggle] = screen.getAllByRole('button', { name: 'Refers to a noun' });

      fireEvent.click(subjectToggle!);

      expect(possessors()).toEqual(['directObject/possessor=CAT']);
      expect(screen.getAllByRole('button', { name: 'Pick a noun…' })).toHaveLength(1);
    });

    it('ignores a click on the mode already chosen', () => {
      const { onPhraseUpdate, coref } = renderPanels({ openPossessors: ['subject'] });

      fireEvent.click(screen.getByRole('button', { name: 'Owned by a phrase' }));

      expect(possessors()).toEqual(['subject/possessor=undefined']);
      expect(onPhraseUpdate).not.toHaveBeenCalled();
      expect(coref.cancel).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Refers to a noun' }));
      fireEvent.click(screen.getByRole('button', { name: 'Refers to a noun' }));

      expect(screen.getByRole('button', { name: 'Pick a noun…' })).toBeInTheDocument();
    });

    it('cancels a pick when an empty panel goes back to a genitive phrase', () => {
      const { onPhraseUpdate, coref } = renderPanels({ openPossessors: ['subject'] });
      fireEvent.click(screen.getByRole('button', { name: 'Refers to a noun' }));

      fireEvent.click(screen.getByRole('button', { name: 'Owned by a phrase' }));

      expect(coref.cancel).toHaveBeenCalledOnce();
      expect(onPhraseUpdate).not.toHaveBeenCalled();
      expect(possessors()).toEqual(['subject/possessor=undefined']);
    });

    it('drops the reference, and nothing else, when a referring panel goes genitive', () => {
      const selection: PhraseSelection = {
        ...SELECTION,
        subjectPossessorRef: 'directObject',
      };
      const coref = fakeCoref({ resolve: vi.fn(() => ({ concept: BOOK, features: THIRD_SG })) });
      const { onPhraseUpdate, rerender } = renderPanels({ selection, coref });

      const [subjectGenitive] = screen.getAllByRole('button', { name: 'Owned by a phrase' });
      fireEvent.click(subjectGenitive!);

      expect(coref.cancel).toHaveBeenCalledOnce();
      const next = updater(onPhraseUpdate)(selection);
      expect(next).toEqual(SELECTION);
      rerender({ selection: next });
      expect(possessors()).toEqual(['subject/possessor=undefined', 'directObject/possessor=CAT']);
    });
  });

  describe('a pronominal reference', () => {
    it('starts a pick for the owning noun, which stores the antecedent as a reference', () => {
      const coref = fakeCoref();
      const { onPhraseUpdate } = renderPanels({
        openPossessors: ['directObject'],
        coref,
        corefAddr: (which) => `subject/conjunct/0/${which}`,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Refers to a noun' }));

      fireEvent.click(screen.getByRole('button', { name: 'Pick a noun…' }));

      expect(coref.start).toHaveBeenCalledOnce();
      const [owner, commit] = vi.mocked(coref.start).mock.calls[0]!;
      expect(owner).toBe('subject/conjunct/0/directObject');
      commit('subject');
      // A reference and a genitive phrase share the one slot.
      expect(updater(onPhraseUpdate)(SELECTION)).toEqual({
        subject: BOY,
        directObject: BOOK,
        directObjectPossessorRef: 'subject',
      });
    });

    it('prompts for the owner while this noun’s pick is under way, and can cancel it', () => {
      const coref = fakeCoref({ picking: 'subject' });
      renderPanels({ coref });
      const [subjectReference] = screen.getAllByRole('button', { name: 'Refers to a noun' });
      fireEvent.click(subjectReference!);

      expect(screen.getByText('Click a noun in this period to be the owner…')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pick a noun…' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(coref.cancel).toHaveBeenCalledOnce();
    });

    it('leaves the prompt to the noun whose pick is under way', () => {
      const coref = fakeCoref({ picking: 'directObject' });
      renderPanels({ coref });
      const [subjectReference] = screen.getAllByRole('button', { name: 'Refers to a noun' });

      fireEvent.click(subjectReference!);

      expect(screen.getByRole('button', { name: 'Pick a noun…' })).toBeInTheDocument();
      expect(screen.queryByText(/Click a noun/)).not.toBeInTheDocument();
    });

    it('shows the antecedent a reference points at and the pronoun it will render', () => {
      const resolve = vi.fn(() => ({
        concept: GIRL,
        features: { ...THIRD_SG, gender: 'fem' as const },
      }));
      renderPanels({
        openPossessors: ['directObject'],
        selection: { ...SELECTION, directObjectPossessorRef: 'subject/possessor' },
        coref: fakeCoref({ resolve }),
      });

      expect(resolve).toHaveBeenCalledWith('subject/possessor');
      expect(screen.getByRole('button', { name: /girl/ })).toHaveTextContent('👧 girl · “her”');
      expect(screen.getByRole('button', { name: 'Refers to a noun' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(possessors()).toEqual([]);
    });

    it('falls back on the concept id for an antecedent without a label', () => {
      const bare: Concept = { id: 'CROWD', role: 'noun', description: 'crowd' };
      renderPanels({
        openPossessors: ['directObject'],
        selection: { ...SELECTION, directObjectPossessorRef: 'subject' },
        coref: fakeCoref({
          resolve: () => ({ concept: bare, features: { ...THIRD_SG, number: 'plural' } }),
        }),
      });

      expect(screen.getByRole('button', { name: /CROWD/ })).toHaveTextContent('CROWD · “their”');
    });

    it('re-picks the antecedent from its chip', () => {
      const coref = fakeCoref({ resolve: () => ({ concept: BOY, features: THIRD_SG }) });
      const selection = { ...SELECTION, directObjectPossessorRef: 'subject' };
      const { onPhraseUpdate } = renderPanels({
        openPossessors: ['directObject'],
        selection,
        coref,
      });

      fireEvent.click(screen.getByRole('button', { name: /boy/ }));

      const [owner, commit] = vi.mocked(coref.start).mock.calls[0]!;
      expect(owner).toBe('directObject');
      commit('locative');
      expect(updater(onPhraseUpdate)(selection)).toEqual({
        subject: BOY,
        directObject: BOOK,
        directObjectPossessorRef: 'locative',
      });
    });

    it('clears the possessor from its chip', () => {
      const { onRemovePossessor } = renderPanels({
        openPossessors: ['directObject'],
        selection: { ...SELECTION, directObjectPossessorRef: 'subject' },
        coref: fakeCoref({ resolve: () => ({ concept: BOY, features: THIRD_SG }) }),
      });

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

      expect(onRemovePossessor).toHaveBeenCalledExactlyOnceWith('directObject');
    });

    it('offers a fresh pick when the reference no longer resolves', () => {
      renderPanels({
        openPossessors: ['directObject'],
        selection: { ...SELECTION, directObjectPossessorRef: 'subject/conjunct/3' },
      });

      expect(screen.getByRole('button', { name: 'Refers to a noun' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Pick a noun…' })).toBeInTheDocument();
    });
  });

  it('registers a receiving dot per open block, and releases it on unmount', () => {
    const { registerDot, unmount } = renderPanels();

    expect(dotFor(registerDot, 'subject')).toBeInstanceOf(HTMLElement);
    expect(dotFor(registerDot, 'directObject')).toBeInstanceOf(HTMLElement);
    expect(dotFor(registerDot, 'subject')).not.toBe(dotFor(registerDot, 'directObject'));

    registerDot.mockClear();
    unmount();

    expect(registerDot).toHaveBeenCalledWith('subject', null);
    expect(registerDot).toHaveBeenCalledWith('directObject', null);
  });

  it('colours each dot after its noun block', () => {
    const { registerDot } = renderPanels({
      openPossessors: ['subject', 'directObject', 'locative'],
      selection: { ...SELECTION, locative: HOUSE },
    });

    // subject → primary, directObject → success, locative → warning (MUI_COLOR_HEX).
    expect(getComputedStyle(dotFor(registerDot, 'subject')).backgroundColor).toBe(
      'rgb(44, 74, 110)',
    );
    expect(getComputedStyle(dotFor(registerDot, 'directObject')).backgroundColor).toBe(
      'rgb(58, 110, 58)',
    );
    expect(getComputedStyle(dotFor(registerDot, 'locative')).backgroundColor).toBe(
      'rgb(139, 105, 20)',
    );
  });
});
