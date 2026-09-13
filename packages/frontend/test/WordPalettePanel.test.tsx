import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept, Transitivity } from '@signi/shared';
import WordPalettePanel from '../src/components/WordPalettePanel.tsx';
import type ConceptPalette from '../src/components/ConceptPalette.tsx';
import type { SlotConfig } from '../src/components/PhraseBuilder/interfaces.ts';
import { getActiveSlots } from '../src/components/PhraseBuilder/slots.ts';

// ConceptPalette fetches and renders its own words (and has tests of its own); the stub shows
// which palette the panel laid out, with which selection, and picks a word of its role.
vi.mock('../src/components/ConceptPalette.tsx', () => ({
  default: ({ role, selectedId, onSelect }: ComponentProps<typeof ConceptPalette>) => (
    <button
      type="button"
      data-testid="palette"
      data-role={role}
      data-selected={selectedId ?? ''}
      onClick={() => onSelect({ id: `A_${role.toUpperCase()}`, role, description: role })}
    />
  ),
}));

const concept = (id: string, role: Concept['role']): Concept => ({ id, role, description: id });

const CAT = concept('CAT', 'noun');
const RUN = concept('RUN', 'verb');

const SUBJECT: SlotConfig = {
  key: 'subject',
  label: 'Subject',
  required: true,
  roles: ['pronoun', 'noun'],
  color: 'primary',
};

const DIRECT_OBJECT: SlotConfig = {
  key: 'directObject',
  label: 'Direct Object',
  required: false,
  roles: ['noun'],
  color: 'success',
};

function renderPanel(props: Partial<ComponentProps<typeof WordPalettePanel>> = {}) {
  const onSelect = vi.fn();
  const view = render(
    <WordPalettePanel activeSlot={null} selection={{}} onSelect={onSelect} {...props} />,
  );
  return { ...view, onSelect };
}

// Each palette laid out, in order, as `role=selected id`.
const palettes = () =>
  screen.getAllByTestId('palette').map((p) => `${p.dataset['role']}=${p.dataset['selected']}`);

describe('WordPalettePanel', () => {
  describe('with a slot active', () => {
    it('asks for a word for that slot, naming it a requirement and the roles it takes', () => {
      renderPanel({ activeSlot: SUBJECT });

      expect(screen.getByText('Subject').tagName).toBe('EM');
      expect(screen.getByText(/^Choose a word for:/)).toHaveTextContent(
        'Choose a word for: Subject',
      );
      expect(screen.getByText(/accepted roles/)).toHaveTextContent(
        /^Required · accepted roles: pronoun, noun$/,
      );
      expect(screen.queryByText('All Words')).not.toBeInTheDocument();
    });

    it('marks an optional slot as optional', () => {
      renderPanel({ activeSlot: DIRECT_OBJECT });

      expect(screen.getByText(/accepted roles/)).toHaveTextContent(
        /^Optional · accepted roles: noun$/,
      );
    });

    it("offers one palette per accepted role, each marking the slot's word", () => {
      renderPanel({ activeSlot: SUBJECT, selection: { subject: CAT, directObject: RUN } });

      expect(palettes()).toEqual(['pronoun=CAT', 'noun=CAT']);
    });

    it('marks nothing while the slot is empty', () => {
      renderPanel({ activeSlot: DIRECT_OBJECT, selection: { subject: CAT } });

      expect(palettes()).toEqual(['noun=']);
    });

    it('hands on the word picked in any of its palettes', () => {
      const { onSelect } = renderPanel({ activeSlot: SUBJECT });

      fireEvent.click(screen.getAllByTestId('palette')[1]);

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ id: 'A_NOUN' }),
      );
    });
  });

  describe('with no slot active', () => {
    // One palette per role of every slot the sentence offers, each marking its slot's word.
    const expected = (transitivity: Transitivity | undefined, selection: Record<string, Concept>) =>
      getActiveSlots(transitivity).flatMap((slot) =>
        slot.roles.map((role) => `${role}=${selection[slot.key]?.id ?? ''}`),
      );

    it("lists every slot's words under one heading, marking each slot's word", () => {
      const selection = { subject: CAT, verb: RUN };
      renderPanel({ selection });

      expect(screen.getByText('All Words')).toBeInTheDocument();
      expect(screen.queryByText(/Choose a word for/)).not.toBeInTheDocument();
      expect(palettes()).toEqual(expected(undefined, selection));
      expect(palettes().slice(0, 3)).toEqual(['pronoun=CAT', 'noun=CAT', 'verb=RUN']);
    });

    it("leaves out the direct object's words for an intransitive verb", () => {
      renderPanel({ verbTransitivity: 'intransitive' });
      const intransitive = palettes();

      expect(intransitive).toEqual(expected('intransitive', {}));
      expect(intransitive.filter((p) => p === 'noun=')).toHaveLength(1);
    });

    it('offers the direct object for a transitive verb', () => {
      renderPanel({ verbTransitivity: 'transitive', selection: { directObject: CAT } });

      expect(palettes()).toEqual(expected('transitive', { directObject: CAT }));
      expect(palettes()).toContain('noun=CAT');
    });

    it('hands on the word picked in any palette', () => {
      const { onSelect } = renderPanel();

      fireEvent.click(screen.getAllByTestId('palette')[2]);

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ id: 'A_VERB' }),
      );
    });
  });
});
