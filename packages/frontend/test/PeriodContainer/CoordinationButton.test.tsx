import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { CoordinationButton } from '../../src/components/PhraseBuilder/PeriodContainer/CoordinationButton.tsx';
import type { CoordinativeControl } from '../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts';
import { coordConjunctionOptions } from '../../src/components/PhraseBuilder/interfaces.ts';
import { renderWithProviders } from '../render.tsx';
import { coordinativeControl, INFO, TEXT_SECONDARY } from './fixtures.ts';

const START = 'Coordinate this period';
const PICK = 'Use this period as the coordinated clause';

function renderButton(control: CoordinativeControl) {
  return renderWithProviders(<CoordinationButton control={control} />);
}

describe('CoordinationButton', () => {
  it.each<[string, Partial<CoordinativeControl>, string, boolean]>([
    ['a period free to start one', {}, START, true],
    ['a period that may not start one', { canStart: false }, START, false],
    [
      'a first clause',
      { hasCoordination: true, conjunction: 'and', canStart: false },
      'Remove the coordination (And)',
      true,
    ],
    [
      'a coordinated clause',
      { isCoordinated: true, conjunction: 'or', canStart: false },
      'This period is a coordinated clause (Or)',
      false,
    ],
    [
      'a legal second-clause target during a pick',
      { pickActive: true, isPickTarget: true, canStart: false },
      PICK,
      true,
    ],
    ['a non-target during a pick', { pickActive: true }, START, false],
    [
      'a first clause during a pick',
      { pickActive: true, hasCoordination: true, conjunction: 'but' },
      'Remove the coordination (But)',
      false,
    ],
  ])('on %s', (_, overrides, name, enabled) => {
    renderButton(coordinativeControl(overrides));

    const button = screen.getByRole('button', { name });
    if (enabled) expect(button).toBeEnabled();
    else expect(button).toBeDisabled();
  });

  it('asks for the conjunction first, offering only those this period may start with', () => {
    renderButton(coordinativeControl({ conjunctions: coordConjunctionOptions(true) }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: START }));

    const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Andcopulative',
      'Ordisjunctive',
      'Butadversative',
      'Thentemporal',
    ]);
  });

  it('starts a coordination with the conjunction chosen', () => {
    const control = coordinativeControl();
    renderButton(control);

    fireEvent.click(screen.getByRole('button', { name: START }));
    expect(control.onStart).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('menuitem', { name: /^Therefore/ }));

    expect(control.onStart).toHaveBeenCalledExactlyOnceWith('therefore');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('starts nothing when the conjunction menu is dismissed', () => {
    const control = coordinativeControl();
    renderButton(control);

    fireEvent.click(screen.getByRole('button', { name: START }));
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(control.onStart).not.toHaveBeenCalled();
  });

  it('removes the coordination of a first clause, without asking for a conjunction', () => {
    const control = coordinativeControl({ hasCoordination: true, conjunction: 'and', canStart: true });
    renderButton(control);

    fireEvent.click(screen.getByRole('button', { name: 'Remove the coordination (And)' }));

    expect(control.onClear).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('picks this period as the pending coordinated clause', () => {
    const control = coordinativeControl({ pickActive: true, isPickTarget: true });
    renderButton(control);

    fireEvent.click(screen.getByRole('button', { name: PICK }));

    expect(control.onPick).toHaveBeenCalledOnce();
    expect(control.onClear).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('is named in the UI language while free to start', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(<CoordinationButton control={coordinativeControl()} />, {
      strings: { 'action.coordinatePeriod': { it: 'Coordina questo periodo' } },
    });

    expect(screen.getByRole('button', { name: 'Coordina questo periodo' })).toBeInTheDocument();
  });

  it.each<[string, Partial<CoordinativeControl>, string]>([
    ['a period outside any coordination', {}, TEXT_SECONDARY],
    ['a first clause', { hasCoordination: true }, INFO],
    ['a coordinated clause', { isCoordinated: true }, INFO],
    ['a legal second-clause target', { pickActive: true, isPickTarget: true }, INFO],
  ])('is drawn for %s in the right colour', (_, overrides, colour) => {
    renderButton(coordinativeControl(overrides));

    expect(getComputedStyle(screen.getByRole('button')).color).toBe(colour);
  });
});
