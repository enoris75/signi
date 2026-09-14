import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MoodToggle } from '../../src/components/PhraseBuilder/PeriodContainer/MoodToggle.tsx';
import type { Mood } from '../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts';
import { mood, PRIMARY, SUCCESS, TEXT_SECONDARY } from './fixtures.ts';

const NAME: Record<Mood, string> = {
  imperative: 'Toggle imperative (command)',
  infinitive: 'Toggle infinitive phrase (citation)',
};

describe('MoodToggle', () => {
  it.each(['imperative', 'infinitive'] as const)('flips the %s mood', (m) => {
    const control = mood(false);
    render(<MoodToggle mood={m} control={control} />);

    fireEvent.click(screen.getByRole('button', { name: NAME[m] }));

    expect(control.onToggle).toHaveBeenCalledOnce();
  });

  it.each<[Mood, string, boolean, boolean, string]>([
    ['imperative', 'off', false, false, 'Make this period a command (imperative)'],
    ['imperative', 'on', true, false, 'This period is a command — turn it off'],
    [
      'imperative',
      'locked by a relation',
      false,
      true,
      'Remove the IF / coordination link to make this a command',
    ],
    [
      'infinitive',
      'off',
      false,
      false,
      'Make this period an infinitive phrase (a citation, e.g. “to consume food”)',
    ],
    ['infinitive', 'on', true, false, 'This period is an infinitive phrase — turn it off'],
    [
      'infinitive',
      'locked by a relation',
      false,
      true,
      'Remove the IF / coordination link to make this an infinitive phrase',
    ],
  ])('explains the %s toggle while it is %s', (m, _, active, disabled, tooltip) => {
    render(<MoodToggle mood={m} control={mood(active, disabled)} />);

    const button = screen.getByRole('button', { name: NAME[m] });
    expect(screen.getByLabelText(tooltip)).toContainElement(button);
    if (disabled) expect(button).toBeDisabled();
    else expect(button).toBeEnabled();
  });

  it.each<[Mood, string]>([
    ['imperative', SUCCESS],
    ['infinitive', PRIMARY],
  ])('lights the %s toggle in its colour while on', (m, colour) => {
    const { rerender } = render(<MoodToggle mood={m} control={mood(false)} />);
    expect(getComputedStyle(screen.getByRole('button')).color).toBe(TEXT_SECONDARY);

    rerender(<MoodToggle mood={m} control={mood(true)} />);
    expect(getComputedStyle(screen.getByRole('button')).color).toBe(colour);
  });
});
