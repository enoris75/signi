import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { Concept, PhrasePlan, Translation } from '@signi/shared';
import { fetchTranslation } from '../src/api.ts';
import type { PhraseSelection, SlotConfig } from '../src/components/PhraseBuilder/interfaces.ts';
import { RoleList } from '../src/components/PhraseBuilder/RoleList.tsx';
import { conceptAt, spanSlotOf } from '../src/i18n/useRoleWords.ts';
import { renderWithProviders } from './render.tsx';

// The translation request goes through api.ts; no test reaches a backend.
vi.mock('../src/api.ts');

const concept = (id: string, role: Concept['role'], label: string): Concept => ({ id, role, description: id, label });
const CAT = concept('CAT', 'noun', 'cat');
const EAT = concept('EAT', 'verb', 'eat');
const SLOTS: SlotConfig[] = [
  { key: 'subject', label: 'Subject', required: true, roles: ['noun'], color: 'primary' },
  { key: 'verb', label: 'Verb', required: true, roles: ['verb'], color: 'secondary' },
];
const SELECTION: PhraseSelection = { subject: CAT, verb: EAT };
const PLAN: PhrasePlan = { subject: { concept: 'CAT', number: 'plural' }, verbPhrase: { verb: 'EAT', tense: 'past' } };

function renderList(plan: PhrasePlan | undefined) {
  return renderWithProviders(
    <RoleList
      selection={SELECTION}
      plan={plan}
      slots={SLOTS}
      activeSlot={null}
      controlsByParent={{}}
      perimeterByNoun={{}}
      verbControls={[]}
      onSelectSlot={vi.fn()}
      onClear={vi.fn()}
      runCommand={() => false}
      picker={() => null}
    />,
  );
}

// The server's answer: "the cats ate." with the subject and the verb placed, as the engine spans them.
const SAID: Translation = {
  language: 'en',
  text: 'the cats ate.',
  spans: [{ slot: 'subject', start: 4, end: 8 }, { slot: 'verb', start: 9, end: 12 }],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('RoleList (P17-E2)', () => {
  it("shows a row's word as the sentence says it, and the lemma under it", async () => {
    vi.mocked(fetchTranslation).mockResolvedValue([SAID]);
    renderList(PLAN);

    await waitFor(() => expect(screen.getByTestId('role-word-subject')).toHaveTextContent('cats'));
    expect(screen.getByTestId('role-lemma-subject')).toHaveTextContent('cat');
    expect(screen.getByTestId('role-word-verb')).toHaveTextContent('ate');
    expect(screen.getByTestId('role-lemma-verb')).toHaveTextContent('eat');
    // Only the UI language is asked for, with its spans.
    expect(fetchTranslation).toHaveBeenCalledWith(PLAN, undefined, ['en']);
  });

  it('shows the lemma alone where the sentence placed no word', async () => {
    vi.mocked(fetchTranslation).mockResolvedValue([{ language: 'en', text: 'the cats ate.' }]);
    renderList(PLAN);

    await waitFor(() => expect(fetchTranslation).toHaveBeenCalled());
    expect(screen.getByTestId('role-word-subject')).toHaveTextContent('cat');
    expect(screen.queryByTestId('role-lemma-subject')).not.toBeInTheDocument();
  });

  it('asks for nothing without a plan, and shows the lemma', () => {
    renderList(undefined);
    expect(fetchTranslation).not.toHaveBeenCalled();
    expect(screen.getByTestId('role-word-verb')).toHaveTextContent('eat');
  });
});

describe('the span a row reads', () => {
  it('an adverb and a modal count the filled slots of their chain before them', () => {
    const adverb = concept('OFTEN', 'adverb', 'often');
    expect(spanSlotOf('modifier2', { modifier2: adverb })).toBe('modifier.0');
    expect(spanSlotOf('modifier3', { modifier: adverb, modifier2: adverb })).toBe('modifier.2');
    expect(spanSlotOf('verbModal2', { verbModal: EAT })).toBe('modal.1');
    expect(spanSlotOf('vocative', {})).toBe('address');
    expect(spanSlotOf('locative', {})).toBe('locative');
  });

  it('names the concept the plan says there', () => {
    const plan: PhrasePlan = {
      subject: { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' },
      verbPhrase: { verb: 'EAT', modifiers: ['FAST'], modals: [{ verb: 'WANT' }] },
      complements: { locative: { phrase: { concept: 'HOUSE' } } },
    };
    expect(conceptAt(plan, 'subject')).toBe('CAT');
    expect(conceptAt(plan, 'modifier.0')).toBe('FAST');
    expect(conceptAt(plan, 'modal.0')).toBe('WANT');
    expect(conceptAt(plan, 'locative')).toBe('HOUSE');
    expect(conceptAt(plan, 'directObject')).toBeUndefined();
  });
});
