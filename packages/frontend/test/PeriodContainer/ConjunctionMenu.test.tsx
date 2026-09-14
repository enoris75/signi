import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ConjunctionMenu } from '../../src/components/PhraseBuilder/PeriodContainer/ConjunctionMenu.tsx';
import {
  COORD_CONJUNCTION_OPTIONS,
  coordConjunctionOptions,
} from '../../src/components/PhraseBuilder/interfaces.ts';

function renderMenu({
  open = true,
  options = COORD_CONJUNCTION_OPTIONS,
}: { open?: boolean; options?: typeof COORD_CONJUNCTION_OPTIONS } = {}) {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const anchor = document.body.appendChild(document.createElement('button'));
  render(
    <ConjunctionMenu
      anchorEl={open ? anchor : null}
      options={options}
      onSelect={onSelect}
      onClose={onClose}
    />,
  );
  return { onSelect, onClose };
}

describe('ConjunctionMenu', () => {
  it('stays closed without a control to open beside', () => {
    renderMenu({ open: false });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('lists every conjunction with the relation it expresses', () => {
    renderMenu();

    const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Andcopulative',
      'Ordisjunctive',
      'Butadversative',
      'That isexplicative',
      'Thereforeconclusive',
      'Thentemporal',
    ]);
  });

  it('lists only the conjunctions it is given', () => {
    renderMenu({ options: coordConjunctionOptions(true) });

    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.queryByRole('menuitem', { name: /^Therefore/ })).not.toBeInTheDocument();
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
