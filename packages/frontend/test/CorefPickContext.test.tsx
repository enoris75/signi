import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { UI_STRINGS } from '@signi/shared';
import type { Concept, PronominalPossessor, UiStringKey } from '@signi/shared';
import {
  CorefPickContext,
  possessiveHintKey,
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

  // P11-E7 D4: under a command the command box stands for the subject; it is a target of the pick,
  // and what it names is the addressee, not the word the selection keeps behind the box.
  it('takes the command box as the subject, naming the addressee', () => {
    const SEE: Concept = { id: 'SEE', role: 'verb', description: 'SEE', transitivity: 'transitive' };
    const command: PhraseSelection = { subject: BOY, imperative: true, imperativePerson: '2pl', verb: SEE, directObject: HORSE };
    const { result } = renderCoordinator(command);

    act(() => result.current.start('directObject', () => {}));

    expect(result.current.isEligible('subject')).toBe(true);
    expect(result.current.resolve('subject')).toMatchObject({
      concept: { id: 'SECOND_PERSON', role: 'pronoun', person: '2' },
      features: { kind: 'pronominal', person: '2', number: 'plural' },
    });
    // The pointer is the link, rendered in the clause of the addressee.
    expect(result.current.linkOf('directObject', 'subject')).toEqual({
      subject: { concept: 'SECOND_PERSON', number: 'plural' },
      imperative: true,
    });
  });

  // P11-E7 D2: the subject's group is one target: the link binds the whole group.
  it('links a pointer at the subject to the whole group, and copies one at a conjunct', () => {
    const SEE: Concept = { id: 'SEE', role: 'verb', description: 'SEE', transitivity: 'transitive' };
    const { result } = renderCoordinator({ ...SELECTION, verb: SEE });

    expect(result.current.linkOf('directObject', 'subject')?.subject).toMatchObject({
      conjuncts: [{ concept: 'BOY' }, { concept: 'GIRL' }],
    });
    expect(result.current.linkOf('directObject', 'subject/conjunct/0')).toBeUndefined();
    // Inside the subject's own subtree the pointer is the copy it was.
    expect(result.current.linkOf('subject/possessor', 'subject')).toBeUndefined();
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

// The key alone is what this picks; the words are the catalog's, rendered by the engine, so the
// English fallbacks stand in for the bundle here.
const hint = (features: Omit<PronominalPossessor, 'kind'>) =>
  UI_STRINGS[possessiveHintKey({ kind: 'pronominal', ...features })].fallback;

describe('possessiveHintKey', () => {
  it.each<[string, Omit<PronominalPossessor, 'kind'>]>([
    ['my', { person: '1', number: 'singular' }],
    ['your', { person: '2', number: 'singular' }],
    ['his', { person: '3', number: 'singular', gender: 'masc' }],
    ['her', { person: '3', number: 'singular', gender: 'fem' }],
    ['its', { person: '3', number: 'singular', gender: 'neut' }],
    ['our', { person: '1', number: 'plural' }],
    ['your', { person: '2', number: 'plural' }],
    ['their', { person: '3', number: 'plural' }],
  ])('hints \u201c%s\u201d for %o', (word, features) => {
    expect(hint(features)).toBe(word);
  });

  it('defaults a third-person singular antecedent of no set gender to \u201chis\u201d', () => {
    expect(hint({ person: '3', number: 'singular' })).toBe('his');
  });

  it('ignores gender in the plural', () => {
    expect(hint({ person: '3', number: 'plural', gender: 'fem' })).toBe('their');
  });

  it('names a key the catalog actually holds, for every cell', () => {
    const cells: Omit<PronominalPossessor, 'kind'>[] = [
      { person: '1', number: 'singular' },
      { person: '2', number: 'singular' },
      { person: '3', number: 'singular', gender: 'masc' },
      { person: '3', number: 'singular', gender: 'fem' },
      { person: '3', number: 'singular', gender: 'neut' },
      { person: '1', number: 'plural' },
      { person: '2', number: 'plural' },
      { person: '3', number: 'plural' },
    ];
    for (const features of cells) {
      const key: UiStringKey = possessiveHintKey({ kind: 'pronominal', ...features });
      expect(UI_STRINGS[key]).toBeDefined();
    }
  });
});
