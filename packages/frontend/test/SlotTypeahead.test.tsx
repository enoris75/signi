import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import type { Concept, GrammaticalRole } from '@signi/shared';
import {
  slotHasInlinePicker,
  slotTypeahead,
} from '../src/components/PhraseBuilder/SlotTypeahead.tsx';
import type { SlotKey } from '../src/components/PhraseBuilder/interfaces.ts';
import { ALL_SLOTS } from '../src/components/PhraseBuilder/slots.ts';
import { renderWithProviders } from './render.tsx';
import { listed, press } from './typeaheadSuite.tsx';

const word = (id: string, role: GrammaticalRole, extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: id.toLowerCase(),
  label: id.toLowerCase(),
  ...extra,
});

// One word per vocabulary, so the words a picker lists tell which vocabulary it searches.
const EAT = word('EAT', 'verb');
const CAN = word('CAN', 'verb', { modal: true });
const CAT = word('CAT', 'noun');
const BIG = word('BIG', 'adjective');
const FAST = word('FAST', 'adverb');
const FIRST_PERSON = word('FIRST_PERSON', 'pronoun', { person: '1' });
const VOCABULARIES = {
  verb: [EAT, CAN],
  noun: [CAT],
  adjective: [BIG],
  adverb: [FAST],
  pronoun: [FIRST_PERSON],
};

type SlotTypeaheadArgs = Parameters<typeof slotTypeahead>[0];

// Renders the picker for `slotKey`, by default as the active, empty slot.
function renderSlot(args: Partial<SlotTypeaheadArgs> & { slotKey: SlotKey }) {
  const onSelect = vi.fn();
  renderWithProviders(
    <>{slotTypeahead({ activeSlot: args.slotKey, selection: {}, onSelect, ...args })}</>,
    { concepts: VOCABULARIES },
  );
  return { onSelect, input: screen.getByRole('textbox') };
}

interface Picker {
  prompt: string;
  // The category switch in the dropdown, as tabs or toggle buttons; empty for one vocabulary.
  categories: string[];
  words: string[];
}

// The picker rendered, as the user meets it.
const offered = () => ({
  prompt: screen.getByRole('textbox').getAttribute('placeholder'),
  categories: [...screen.queryAllByRole('tab'), ...screen.queryAllByRole('button')].map(
    (el) => el.textContent,
  ),
  words: listed(),
});

const VERB: Picker = { prompt: 'type a verb…', categories: [], words: ['EAT'] };
const MODAL: Picker = { prompt: 'type a modal…', categories: [], words: ['CAN'] };
const NOUN: Picker = { prompt: 'type a noun…', categories: [], words: ['CAT'] };
const ADVERB: Picker = { prompt: 'type an adverb…', categories: [], words: ['FAST'] };
const SUBJECT: Picker = {
  prompt: 'type a subject…',
  categories: ['Noun', 'Pronoun'],
  words: ['CAT'],
};
const ADJECTIVE_OR_NOUN: Picker = {
  prompt: 'type an adjective…',
  categories: ['Adjective', 'Noun'],
  words: ['BIG'],
};

describe('slotTypeahead', () => {
  it.each<[SlotKey, Picker]>([
    ['verb', VERB],
    ['verbModal', MODAL],
    ['verbModal2', MODAL],
    ['subject', SUBJECT],
    ['directObject', NOUN],
    ['modifier', ADVERB],
    ['verbModalAdverb', ADVERB],
    ['verbModal2Adverb', ADVERB],
    ['subjectAdjective', ADJECTIVE_OR_NOUN],
    ['directObjectAdjective2', ADJECTIVE_OR_NOUN],
    ['sourceAdjective3', ADJECTIVE_OR_NOUN],
    ['causeAdjective', ADJECTIVE_OR_NOUN],
    ['cause', { ...SUBJECT, prompt: 'type a noun or a pronoun…' }],
    ['terminus', NOUN],
    ['manner', NOUN],
    ['locative', NOUN],
    ['direction', NOUN],
    ['source', NOUN],
    ['route', NOUN],
  ])('gives the %s slot its picker', (slotKey, picker) => {
    renderSlot({ slotKey });

    expect(offered()).toEqual(picker);
  });

  it('gives the subject complement the Noun | Adjective switch, on the kind the box holds', () => {
    renderSlot({ slotKey: 'predicative', kind: 'noun', onKindChange: () => {} });

    expect(offered()).toEqual({ ...NOUN, categories: ['Noun', 'Adjective'] });
  });

  it('gives a possessor head, in noun-phrase mode, the plain noun picker', () => {
    renderSlot({ slotKey: 'subject', nounSubject: true });

    expect(offered()).toEqual(NOUN);
  });

  it.each<[string, Partial<SlotTypeaheadArgs>]>([
    ['a slot other than the active one', { activeSlot: 'subject' }],
    ['any slot while none is active', { activeSlot: null }],
    ['the active slot once it holds a word', { selection: { verb: EAT } }],
  ])('renders no picker for %s', (_, args) => {
    const picker = slotTypeahead({
      slotKey: 'verb',
      activeSlot: 'verb',
      selection: {},
      onSelect: () => {},
      ...args,
    });

    expect(picker).toBeUndefined();
  });

  it('renders the picker over a word being edited, even while another slot is active', () => {
    const { input, onSelect } = renderSlot({
      slotKey: 'verb',
      activeSlot: 'subject',
      selection: { verb: EAT },
      editing: true,
    });

    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(EAT, 'verb', undefined);
  });

  it('reports the word picked with the slot it fills', () => {
    const { input, onSelect } = renderSlot({ slotKey: 'directObjectAdjective2' });

    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(BIG, 'directObjectAdjective2', undefined);
  });

  it("passes on a pronoun's number and gender", () => {
    const { input, onSelect } = renderSlot({
      slotKey: 'subject',
      kind: 'pronoun',
      onKindChange: () => {},
    });

    press(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(FIRST_PERSON, 'subject', {
      number: 'singular',
      gender: 'masc',
    });
  });

  it("shares an adjective box's category with its picker, both ways", () => {
    const onKindChange = vi.fn();
    renderSlot({ slotKey: 'subjectAdjective', kind: 'noun', onKindChange });

    expect(offered()).toEqual({ ...NOUN, categories: ['Adjective', 'Noun'] });

    fireEvent.click(screen.getByRole('button', { name: 'Adjective' }));

    expect(onKindChange).toHaveBeenCalledExactlyOnceWith('adjective');
  });

  it.each<SlotKey>(['subject', 'cause'])(
    "shares the %s box's category with its picker, both ways",
    (slotKey) => {
      const onKindChange = vi.fn();
      renderSlot({ slotKey, kind: 'pronoun', onKindChange });

      expect(screen.getByRole('tab', { name: 'Pronoun' })).toHaveAttribute('aria-selected', 'true');

      fireEvent.click(screen.getByRole('tab', { name: 'Noun' }));

      expect(onKindChange).toHaveBeenCalledExactlyOnceWith('noun');
    },
  );
});

describe('slotHasInlinePicker', () => {
  it('offers a picker for every slot box, in a clause and in a noun phrase alike', () => {
    const keys = ALL_SLOTS.map((slot) => slot.key);

    expect(keys.filter((key) => !slotHasInlinePicker(key))).toEqual([]);
    expect(keys.filter((key) => !slotHasInlinePicker(key, true))).toEqual([]);
  });

  it('offers none for a key that names no word slot', () => {
    // The instrumental's noun phrase lives in a container of its own, never in a box.
    const notASlot: string = 'instrumental';

    expect(slotHasInlinePicker(notASlot as SlotKey)).toBe(false);
  });
});
