import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { ConjunctionMenu } from '../../src/components/PhraseBuilder/PeriodContainer/ConjunctionMenu.tsx';
import {
  COORD_CONJUNCTION_OPTIONS,
  coordConjunctionOptions,
} from '../../src/components/PhraseBuilder/interfaces.ts';
import { renderWithProviders, type Seed } from '../render.tsx';

function renderMenu({
  open = true,
  options = COORD_CONJUNCTION_OPTIONS,
  seed,
}: { open?: boolean; options?: typeof COORD_CONJUNCTION_OPTIONS; seed?: Seed } = {}) {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const anchor = document.body.appendChild(document.createElement('button'));
  renderWithProviders(
    <ConjunctionMenu
      anchorEl={open ? anchor : null}
      options={options}
      onSelect={onSelect}
      onClose={onClose}
    />,
    seed,
  );
  return { onSelect, onClose };
}

describe('ConjunctionMenu', () => {
  it('stays closed without a control to open beside', () => {
    renderMenu({ open: false });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // Each row ends in the letter it answers to: mostly the initial, but "that is" goes by its I
  // and "therefore" by its S, T being taken by "then". The words themselves are the catalog's
  // (C13), which is why the conclusive row reads "So" and the temporal one "And then": those are
  // what English actually writes between two clauses, and the keys stay on the value's own name.
  it('lists every conjunction with the relation it expresses, and the key it answers to', () => {
    renderMenu();

    const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'AndcopulativeA',
      'OrdisjunctiveO',
      'ButadversativeB',
      'That isexplicativeI',
      'SoconclusiveS',
      'And thentemporalT',
    ]);
  });

  // The words come from the bundle the backend renders, not from a table in the frontend (C13):
  // seeding the entry changes the row, which a hardcoded "But" could not do. In another UI language
  // that is what makes the menu read "Ma avversativa" or "Aber adversativ".
  it('says each conjunction with the catalog\u2019s word for it', () => {
    renderMenu({
      seed: {
        strings: {
          'conjunction.value.but': { en: 'Ma' },
          'conjunction.kind.but': { en: 'avversativa' },
        },
      },
    });

    expect(screen.getByRole('menuitem', { name: /avversativa/ }).textContent).toBe('MaavversativaB');
  });

  it('takes the conjunction its letter names', () => {
    const { onSelect } = renderMenu();

    fireEvent.keyDown(window, { key: 'i' });

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('that_is');
  });

  it('names each relation in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderMenu({ seed: { strings: { 'conjunction.kind.but': { it: 'avversativa' } } } });

    expect(screen.getByRole('menuitem', { name: /^But/ })).toHaveTextContent('Butavversativa');
  });

  it('lists only the conjunctions it is given', () => {
    renderMenu({ options: coordConjunctionOptions(true) });

    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.queryByRole('menuitem', { name: /^So/ })).not.toBeInTheDocument();
  });

  it('reports the conjunction chosen', () => {
    const { onSelect, onClose } = renderMenu();

    fireEvent.click(screen.getByRole('menuitem', { name: /^That is/ }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('that_is');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('asks to close when dismissed', () => {
    const { onSelect, onClose } = renderMenu();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
