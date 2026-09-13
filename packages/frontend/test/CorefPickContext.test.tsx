import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import type { Concept, PronominalPossessor } from '@signi/shared';
import {
  CorefPickContext,
  possessiveHintEn,
  useCorefPick,
  useProvideCorefPick,
} from '../src/components/PhraseBuilder/CorefPickContext.tsx';
import type { NounAddress, PhraseSelection } from '../src/components/PhraseBuilder/interfaces.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const BOY = noun('BOY');
const GIRL = noun('GIRL');
const HORSE = noun('HORSE');
const FARMER = noun('FARMER');

// "The boy and the girl ride the farmer's horse"
const SELECTION: PhraseSelection = {
  subject: BOY,
  subjectGender: 'masc',
  subjectConjuncts: [{ subject: GIRL, subjectGender: 'fem' }],
  directObject: HORSE,
  directObjectPossessor: { subject: FARMER },
};

function renderCoordinator(root: PhraseSelection = SELECTION) {
  return renderHook(({ root }) => useProvideCorefPick(root), { initialProps: { root } });
}

describe('useProvideCorefPick', () => {
  it('starts idle, with no noun eligible', () => {
    const { result } = renderCoordinator();

    expect(result.current.picking).toBeNull();
    expect(result.current.isEligible('subject')).toBe(false);
  });

  it('marks the noun whose possessor is being pinpointed', () => {
    const { result } = renderCoordinator();

    act(() => result.current.start('directObject', () => {}));

    expect(result.current.picking).toBe('directObject');
  });

  it('accepts any other noun of the period as the antecedent', () => {
    const { result } = renderCoordinator();

    act(() => result.current.start('directObject', () => {}));

    expect(result.current.isEligible('subject')).toBe(true);
    expect(result.current.isEligible('subject/conjunct/0')).toBe(true);
  });

  it('refuses the possessed noun itself and every noun inside it', () => {
    const { result } = renderCoordinator();

    act(() => result.current.start('directObject', () => {}));

    expect(result.current.isEligible('directObject')).toBe(false);
    expect(result.current.isEligible('directObject/possessor')).toBe(false);
    expect(result.current.isEligible('directObject/conjunct/0')).toBe(false);
  });

  it('tells a noun’s own parts from a sibling whose address merely shares its prefix', () => {
    const { result } = renderCoordinator();

    act(() => result.current.start('subject/conjunct/1', () => {}));

    expect(result.current.isEligible('subject/conjunct/1/possessor')).toBe(false);
    expect(result.current.isEligible('subject/conjunct/10')).toBe(true);
  });

  it('commits the noun picked as the antecedent and ends the pick', () => {
    const commit = vi.fn();
    const { result } = renderCoordinator();
    act(() => result.current.start('directObject', commit));

    act(() => result.current.pick('subject/conjunct/0'));

    expect(commit).toHaveBeenCalledExactlyOnceWith('subject/conjunct/0');
    expect(result.current.picking).toBeNull();
    expect(result.current.isEligible('subject')).toBe(false);
  });

  it('commits a pick once, even where React runs state updates twice', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useProvideCorefPick(SELECTION), { wrapper: StrictMode });
    act(() => result.current.start('directObject', commit));

    act(() => result.current.pick('subject'));

    expect(commit).toHaveBeenCalledExactlyOnceWith('subject');
  });

  it('ignores a pick while no pick is under way', () => {
    const { result } = renderCoordinator();

    act(() => result.current.pick('subject'));

    expect(result.current.picking).toBeNull();
  });

  it('ends a cancelled pick without committing anything', () => {
    const commit = vi.fn();
    const { result } = renderCoordinator();
    act(() => result.current.start('directObject', commit));

    act(() => result.current.cancel());
    act(() => result.current.pick('subject'));

    expect(result.current.picking).toBeNull();
    expect(commit).not.toHaveBeenCalled();
  });

  it('lets a new pick take over from the one under way', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderCoordinator();
    act(() => result.current.start('directObject', first));

    act(() => result.current.start('subject/conjunct/0', second));
    expect(result.current.picking).toBe('subject/conjunct/0');

    act(() => result.current.pick('subject'));
    expect(second).toHaveBeenCalledExactlyOnceWith('subject');
    expect(first).not.toHaveBeenCalled();
  });

  it('hands consumers the same coordinator until the pick or the selection changes', () => {
    const { result, rerender } = renderCoordinator();
    const idle = result.current;

    rerender({ root: SELECTION });
    expect(result.current).toBe(idle);

    act(() => result.current.start('directObject', () => {}));
    const picking = result.current;
    expect(picking).not.toBe(idle);

    rerender({ root: { ...SELECTION } });
    expect(result.current).not.toBe(picking);
  });

  it('resolves an antecedent to its word and the features its pronoun agrees with', () => {
    const { result } = renderCoordinator();

    expect(result.current.resolve('subject/conjunct/0')).toEqual({
      concept: GIRL,
      features: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' },
    });
  });

  it('resolves against the latest selection of the period', () => {
    const { result, rerender } = renderCoordinator();

    rerender({ root: { ...SELECTION, subjectNumber: 'plural', subjectConjuncts: [] } });

    expect(result.current.resolve('subject')).toEqual({
      concept: BOY,
      features: { kind: 'pronominal', person: '3', number: 'plural', gender: 'masc' },
    });
    expect(result.current.resolve('subject/conjunct/0')).toBeUndefined();
  });
});

describe('useCorefPick', () => {
  it('finds no coordinator outside a period builder', () => {
    const { result } = renderHook(() => useCorefPick());

    expect(result.current).toBeNull();
  });

  // A possessor control deep in the tree starts the pick; a noun box elsewhere completes it.
  function PossessorControl({ onCommit }: { onCommit: (antecedent: NounAddress) => void }) {
    const coref = useCorefPick()!;
    return <button onClick={() => coref.start('directObject', onCommit)}>Pinpoint</button>;
  }

  function NounBox({ address }: { address: NounAddress }) {
    const coref = useCorefPick()!;
    return (
      <button disabled={!coref.isEligible(address)} onClick={() => coref.pick(address)}>
        {address}
      </button>
    );
  }

  function Period({ onCommit }: { onCommit: (antecedent: NounAddress) => void }) {
    const coref = useProvideCorefPick(SELECTION);
    return (
      <CorefPickContext.Provider value={coref}>
        <NounBox address="subject" />
        <section>
          <PossessorControl onCommit={onCommit} />
        </section>
      </CorefPickContext.Provider>
    );
  }

  it('shares the period root’s pick with every noun box below it', () => {
    const onCommit = vi.fn();
    render(<Period onCommit={onCommit} />);
    const boy = screen.getByRole('button', { name: 'subject' });
    expect(boy).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Pinpoint' }));
    expect(boy).toBeEnabled();

    fireEvent.click(boy);
    expect(onCommit).toHaveBeenCalledExactlyOnceWith('subject');
    expect(boy).toBeDisabled();
  });
});

describe('possessiveHintEn', () => {
  it.each<[string, Omit<PronominalPossessor, 'kind'>]>([
    ['my', { person: '1', number: 'singular' }],
    ['your', { person: '2', number: 'singular' }],
    ['his', { person: '3', number: 'singular', gender: 'masc' }],
    ['her', { person: '3', number: 'singular', gender: 'fem' }],
    ['its', { person: '3', number: 'singular', gender: 'neut' }],
    ['our', { person: '1', number: 'plural' }],
    ['your', { person: '2', number: 'plural' }],
    ['their', { person: '3', number: 'plural' }],
  ])('hints “%s” for %o', (hint, features) => {
    expect(possessiveHintEn({ kind: 'pronominal', ...features })).toBe(hint);
  });

  it('defaults a third-person singular antecedent of no set gender to “his”', () => {
    expect(possessiveHintEn({ kind: 'pronominal', person: '3', number: 'singular' })).toBe('his');
  });

  it('ignores gender in the plural', () => {
    expect(
      possessiveHintEn({ kind: 'pronominal', person: '3', number: 'plural', gender: 'fem' }),
    ).toBe('their');
  });
});
