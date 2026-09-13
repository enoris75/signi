import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import {
  ConjunctPanels,
  openConjunctsFor,
} from '../src/components/PhraseBuilder/ConjunctPanels.tsx';
import type {
  NounKey,
  PhraseSelection,
  WorkspaceBinding,
} from '../src/components/PhraseBuilder/interfaces.ts';
import type { PhraseBuilderProps } from '../src/components/PhraseBuilder/PhraseBuilder.tsx';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const PETER = noun('PETER');
const PAUL = noun('PAUL');
const MARY = noun('MARY');
const CAT = noun('CAT');
const DOG = noun('DOG');
const FOX = noun('FOX');

// "Peter, Paul or Mary … the cat and the dog"
const SELECTION: PhraseSelection = {
  subject: PETER,
  subjectConjuncts: [{ subject: PAUL }, { subject: MARY }],
  subjectConjunction: 'or',
  directObject: CAT,
  directObjectConjuncts: [{ subject: DOG }],
};

// Stands in for the injected noun-phrase builder: it shows which conjunct it edits and
// exposes the callbacks it was handed, and records its props by address.
function stubBuilder() {
  const props = new Map<string, PhraseBuilderProps>();
  function Builder(p: PhraseBuilderProps) {
    props.set(p.possessorPath!, p);
    return (
      <div data-testid="conjunct" data-path={p.possessorPath} data-head={p.selection.subject?.id} />
    );
  }
  return { Builder, props };
}

function renderPanels(overrides: Partial<ComponentProps<typeof ConjunctPanels>> = {}) {
  const { Builder, props } = stubBuilder();
  const handlers = {
    onPhraseUpdate: vi.fn(),
    onRemoveConjunct: vi.fn(),
    onCycleConjunction: vi.fn(),
    registerDot: vi.fn(),
  };
  const view = render(
    <ConjunctPanels
      openConjuncts={['subject', 'directObject']}
      selection={SELECTION}
      Builder={Builder}
      {...handlers}
      {...overrides}
    />,
  );
  return { ...view, ...handlers, builderProps: props };
}

const conjuncts = () =>
  screen.queryAllByTestId('conjunct').map((c) => `${c.dataset['path']}=${c.dataset['head']}`);

// The dot registered for `which` on the latest render.
const dotFor = (registerDot: ReturnType<typeof vi.fn>, which: NounKey) =>
  registerDot.mock.calls.filter(([w, el]) => w === which && el).at(-1)![1] as HTMLElement;

describe('openConjunctsFor', () => {
  it('lists the coordinable blocks that have a head and at least one conjunct, in order', () => {
    expect(
      openConjunctsFor({
        directObject: CAT,
        directObjectConjuncts: [{ subject: DOG }],
        subject: PETER,
        subjectConjuncts: [{ subject: PAUL }],
      }),
    ).toEqual(['subject', 'directObject']);
  });

  it('skips a block whose conjunct list is empty', () => {
    expect(openConjunctsFor({ subject: PETER, subjectConjuncts: [] })).toEqual([]);
  });

  it('skips conjuncts left behind by a cleared head', () => {
    expect(openConjunctsFor({ subjectConjuncts: [{ subject: PAUL }] })).toEqual([]);
  });

  it('covers the predicative subject complement', () => {
    expect(openConjunctsFor({ predicative: FOX, predicativeConjuncts: [{}] })).toEqual([
      'predicative',
    ]);
  });
});

describe('ConjunctPanels', () => {
  it('renders one builder per conjunct, for the open blocks only, in their order', () => {
    renderPanels({ openConjuncts: ['directObject', 'subject'] });

    expect(conjuncts()).toEqual([
      'directObject/conjunct/0=DOG',
      'subject/conjunct/0=PAUL',
      'subject/conjunct/1=MARY',
    ]);
  });

  it('renders nothing when no block is open', () => {
    const { container } = renderPanels({ openConjuncts: [] });

    expect(container).toBeEmptyDOMElement();
  });

  it('hands each builder its conjunct as a bare noun phrase with the container binding', () => {
    const binding = { containerId: 'c1' } as WorkspaceBinding;
    const { builderProps } = renderPanels({ binding });

    const paul = builderProps.get('subject/conjunct/0')!;
    expect(paul.selection).toBe(SELECTION.subjectConjuncts![0]);
    expect(paul.nounPhraseOnly).toBe(true);
    expect(paul.binding).toBe(binding);
  });

  it('addresses conjuncts under the possessor path when the panel sits in a possessor', () => {
    renderPanels({ openConjuncts: ['subject'], possessorPath: 'directObject/possessor' });

    expect(conjuncts()).toEqual([
      'directObject/possessor/conjunct/0=PAUL',
      'directObject/possessor/conjunct/1=MARY',
    ]);
  });

  it('routes a builder edit into its own conjunct only', () => {
    const { builderProps, onPhraseUpdate } = renderPanels();

    builderProps.get('subject/conjunct/1')!.onPhraseUpdate((prev) => ({ ...prev, subject: FOX }));

    expect(onPhraseUpdate).toHaveBeenCalledOnce();
    const updater = onPhraseUpdate.mock.calls[0]![0] as (p: PhraseSelection) => PhraseSelection;
    expect(updater(SELECTION)).toEqual({
      ...SELECTION,
      subjectConjuncts: [{ subject: PAUL }, { subject: FOX }],
    });
  });

  it('removes the conjunct whose builder asks', () => {
    const { builderProps, onRemoveConjunct } = renderPanels();

    builderProps.get('subject/conjunct/1')!.onRemove!();

    expect(onRemoveConjunct).toHaveBeenCalledExactlyOnceWith('subject', 1);
  });

  it('leads each conjunct with the block conjunction, defaulting to "and"', () => {
    const { container } = renderPanels();

    const sequence = [
      ...container.querySelectorAll<HTMLElement>('[role="button"], [data-testid="conjunct"]'),
    ].map((el) => el.dataset['path'] ?? el.textContent);
    expect(sequence).toEqual([
      'Or',
      'subject/conjunct/0',
      'Or',
      'subject/conjunct/1',
      'And',
      'directObject/conjunct/0',
    ]);
  });

  it('cycles the conjunction of the block whose chip is clicked', () => {
    const { onCycleConjunction } = renderPanels();

    fireEvent.click(screen.getByRole('button', { name: 'And' }));

    expect(onCycleConjunction).toHaveBeenCalledExactlyOnceWith('directObject');
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

  it('colours each stack after its noun block', () => {
    const { registerDot } = renderPanels({
      openConjuncts: ['subject', 'directObject', 'predicative'],
      selection: { ...SELECTION, predicative: FOX, predicativeConjuncts: [{}] },
    });

    // subject → primary, directObject → success, predicative → warning (MUI_COLOR_HEX).
    expect(getComputedStyle(dotFor(registerDot, 'subject')).backgroundColor).toBe(
      'rgb(44, 74, 110)',
    );
    expect(getComputedStyle(dotFor(registerDot, 'directObject')).backgroundColor).toBe(
      'rgb(58, 110, 58)',
    );
    expect(getComputedStyle(dotFor(registerDot, 'predicative')).backgroundColor).toBe(
      'rgb(139, 105, 20)',
    );
    // Chips in order: subject "Or", directObject "And", predicative "And".
    const [directObjectChip] = screen.getAllByRole('button', { name: 'And' });
    expect(getComputedStyle(directObjectChip!).color).toBe('rgb(58, 110, 58)');
  });
});
