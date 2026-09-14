import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConditionalButton } from '../../src/components/PhraseBuilder/PeriodContainer/ConditionalButton.tsx';
import type { ConditionalControl } from '../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts';
import { conditionalControl, TEXT_SECONDARY, WARNING } from './fixtures.ts';

const START = 'Add an IF condition (this becomes the main clause)';
const REMOVE = 'Remove the IF condition';
const PICK = 'Use this period as the IF condition';

describe('ConditionalButton', () => {
  it.each<[string, Partial<ConditionalControl>, string, boolean]>([
    ['a period free to start one', {}, START, true],
    ['a period that may not start one', { canStart: false }, START, false],
    ['a main clause', { hasCondition: true, canStart: false }, REMOVE, true],
    ['an IF clause', { isIfClause: true, canStart: false }, 'This period is an IF clause', false],
    ['a legal IF target during a pick', { pickActive: true, isPickTarget: true, canStart: false }, PICK, true],
    ['a non-target during a pick', { pickActive: true }, START, false],
    ['a main clause during a pick', { pickActive: true, hasCondition: true }, REMOVE, false],
  ])('on %s', (_, overrides, name, enabled) => {
    render(<ConditionalButton control={conditionalControl(overrides)} />);

    const button = screen.getByRole('button', { name });
    if (enabled) expect(button).toBeEnabled();
    else expect(button).toBeDisabled();
  });

  it('starts a conditional with this period as the main clause', () => {
    const control = conditionalControl();
    render(<ConditionalButton control={control} />);

    fireEvent.click(screen.getByRole('button', { name: START }));

    expect(control.onStart).toHaveBeenCalledOnce();
    expect(control.onClear).not.toHaveBeenCalled();
    expect(control.onPick).not.toHaveBeenCalled();
  });

  it('removes the IF condition of a main clause', () => {
    const control = conditionalControl({ hasCondition: true, canStart: true });
    render(<ConditionalButton control={control} />);

    fireEvent.click(screen.getByRole('button', { name: REMOVE }));

    expect(control.onClear).toHaveBeenCalledOnce();
    expect(control.onStart).not.toHaveBeenCalled();
  });

  it('picks this period as the pending IF condition', () => {
    const control = conditionalControl({ pickActive: true, isPickTarget: true });
    render(<ConditionalButton control={control} />);

    fireEvent.click(screen.getByRole('button', { name: PICK }));

    expect(control.onPick).toHaveBeenCalledOnce();
    expect(control.onStart).not.toHaveBeenCalled();
    expect(control.onClear).not.toHaveBeenCalled();
  });

  it.each<[string, Partial<ConditionalControl>, string]>([
    ['a period outside any conditional', {}, TEXT_SECONDARY],
    ['a main clause', { hasCondition: true }, WARNING],
    ['an IF clause', { isIfClause: true }, WARNING],
    ['a legal IF target', { pickActive: true, isPickTarget: true }, WARNING],
  ])('is drawn for %s in the right colour', (_, overrides, colour) => {
    render(<ConditionalButton control={conditionalControl(overrides)} />);

    expect(getComputedStyle(screen.getByRole('button')).color).toBe(colour);
  });
});
