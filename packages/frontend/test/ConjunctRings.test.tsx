import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { ConjunctRings } from '../src/components/PhraseBuilder/ConjunctRings.tsx';
import { renderWithProviders } from './render.tsx';
import type { RingHost } from '../src/components/PhraseBuilder/ringHost.ts';
import type { ConjunctLink } from '../src/components/PhraseBuilder/conjunctChain.ts';
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

const CHAINS: { which: NounKey; count: number }[] = [
  { which: 'subject', count: 2 },
  { which: 'directObject', count: 1 },
];

const link = (which: NounKey, index: number, mid: { x: number; y: number }): ConjunctLink => ({
  which,
  index,
  from: mid,
  to: mid,
  mid,
});

const LINKS = [
  link('subject', 0, { x: 100, y: 200 }),
  link('subject', 1, { x: 100, y: 400 }),
  link('directObject', 0, { x: 700, y: 200 }),
];

// Stands in for the injected noun-phrase builder: it shows which conjunct it edits and records the
// props it was handed, by address.
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

// What the head canvas hands conjunct `i` of `which` — only its key matters here.
const hostFor = (which: NounKey, i: number) => ({ key: `${which}+${i + 1}` }) as RingHost;

function renderRings(overrides: Partial<ComponentProps<typeof ConjunctRings>> = {}) {
  const { Builder, props } = stubBuilder();
  const handlers = {
    onPhraseUpdate: vi.fn(),
    onRemoveConjunct: vi.fn(),
    onCycleConjunction: vi.fn(),
  };
  const view = renderWithProviders(
    <ConjunctRings
      chains={CHAINS}
      selection={SELECTION}
      hostFor={hostFor}
      links={LINKS}
      Builder={Builder}
      {...handlers}
      {...overrides}
    />,
  );
  return { ...view, ...handlers, builderProps: props };
}

const conjuncts = () =>
  screen.queryAllByTestId('conjunct').map((c) => `${c.dataset['path']}=${c.dataset['head']}`);

const chips = () => screen.queryAllByTestId('conjunction-chip');

describe('ConjunctRings', () => {
  it('draws one builder per conjunct, for the given chains only, in their order', () => {
    renderRings({ chains: [CHAINS[1]!, CHAINS[0]!] });

    expect(conjuncts()).toEqual([
      'directObject/conjunct/0=DOG',
      'subject/conjunct/0=PAUL',
      'subject/conjunct/1=MARY',
    ]);
  });

  it('draws nothing when no noun coordinates', () => {
    const { container } = renderRings({ chains: [], links: [] });

    expect(container).toBeEmptyDOMElement();
  });

  it('hands each builder its conjunct as a bare noun phrase on the head’s canvas', () => {
    const binding = { containerId: 'c1' } as WorkspaceBinding;
    const { builderProps } = renderRings({ binding });

    const paul = builderProps.get('subject/conjunct/0')!;
    expect(paul.selection).toBe(SELECTION.subjectConjuncts![0]);
    expect(paul.nounPhraseOnly).toBe(true);
    expect(paul.binding).toBe(binding);
    expect(paul.ringHost?.key).toBe('subject+1');
    expect(builderProps.get('subject/conjunct/1')!.ringHost?.key).toBe('subject+2');
    expect(builderProps.get('directObject/conjunct/0')!.ringHost?.key).toBe('directObject+1');
  });

  it('addresses conjuncts under the possessor path when the canvas is a possessor’s', () => {
    renderRings({ possessorPath: 'subject/possessor' });

    expect(conjuncts()).toEqual([
      'subject/possessor/conjunct/0=PAUL',
      'subject/possessor/conjunct/1=MARY',
      'subject/possessor/directObject/conjunct/0=DOG',
    ]);
  });

  it('routes a builder edit into its own conjunct only', () => {
    const { builderProps, onPhraseUpdate } = renderRings();

    builderProps.get('subject/conjunct/1')!.onPhraseUpdate((prev) => ({ ...prev, subject: FOX }));

    expect(onPhraseUpdate).toHaveBeenCalledOnce();
    const updater = onPhraseUpdate.mock.calls[0]![0] as (p: PhraseSelection) => PhraseSelection;
    expect(updater(SELECTION)).toEqual({
      ...SELECTION,
      subjectConjuncts: [{ subject: PAUL }, { subject: FOX }],
    });
  });

  it('removes the conjunct whose builder asks', () => {
    const { builderProps, onRemoveConjunct } = renderRings();

    builderProps.get('subject/conjunct/1')!.onRemove!();

    expect(onRemoveConjunct).toHaveBeenCalledExactlyOnceWith('subject', 1);
  });

  it('puts a chip on every link, showing its group’s conjunction — "and" unless chosen', () => {
    renderRings();

    expect(chips().map((c) => c.textContent)).toEqual(['Or', 'Or', 'And']);
    expect(chips().map((c) => [getComputedStyle(c).left, getComputedStyle(c).top])).toEqual([
      ['100px', '200px'],
      ['100px', '400px'],
      ['700px', '200px'],
    ]);
  });

  it('cycles the conjunction of the group whose chip is clicked, or pressed', () => {
    const { onCycleConjunction } = renderRings();

    fireEvent.click(screen.getByRole('button', { name: 'And' }));
    expect(onCycleConjunction).toHaveBeenLastCalledWith('directObject');

    fireEvent.keyDown(chips()[1]!, { key: 'Enter' });
    fireEvent.keyDown(chips()[1]!, { key: ' ' });
    fireEvent.keyDown(chips()[1]!, { key: 'a' });
    expect(onCycleConjunction.mock.calls).toEqual([['directObject'], ['subject'], ['subject']]);
  });

  // P09-E46: the chip's third state on a pair — the correlative, "both … and".
  it('reads the correlative pair on a pair spelled with it, and cycles on from there', () => {
    const { onCycleConjunction } = renderRings({ selection: { ...SELECTION, correlatives: { directObject: true } } });

    expect(chips().map((c) => c.textContent)).toEqual(['Or', 'Or', 'Both … and']);
    fireEvent.click(screen.getByRole('button', { name: 'Both … and' }));
    expect(onCycleConjunction).toHaveBeenLastCalledWith('directObject');
  });

  it('colours each chip after its noun block', () => {
    renderRings();

    // subject → primary, directObject → success (MUI_COLOR_HEX).
    expect(getComputedStyle(chips()[0]!).color).toBe('rgb(44, 74, 110)');
    expect(getComputedStyle(chips()[2]!).color).toBe('rgb(58, 110, 58)');
  });
});
