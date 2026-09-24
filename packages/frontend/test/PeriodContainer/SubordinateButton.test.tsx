import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { SubordinateButton } from '../../src/components/PhraseBuilder/PeriodContainer/SubordinateButton.tsx';
import type { SubordinateControl } from '../../src/components/PhraseBuilder/PeriodContainer/PeriodContainer.types.ts';
import { subordinateOptions, type SubordinateKind } from '../../src/components/PhraseBuilder/interfaces.ts';
import { renderWithProviders } from '../render.tsx';
import { subordinateControl } from './fixtures.ts';

const START = 'Add a subordinate clause';
const PICK = 'Use this period as the subordinate clause';

function renderButton(control: SubordinateControl) {
  return renderWithProviders(<SubordinateButton control={control} />);
}

// The subordinate-clause control (P09-E12 D9): one border button, a menu of what the verb takes.
describe('SubordinateButton', () => {
  it.each<[string, Partial<SubordinateControl>, string, boolean]>([
    ['a period free to start one', {}, START, true],
    ['a period with nothing on the menu (no verb)', { options: [] }, START, false],
    ['a period that may not start one', { canStart: false }, START, false],
    ['a governing clause', { asSource: { kind: 'adverbial', conjunction: 'because' } }, 'Remove the subordinate clause (Because)', true],
    ['a that-clause', { asTarget: { kind: 'content' }, canStart: false }, 'This period is a subordinate clause (That)', false],
    ['an infinitive complement', { asTarget: { kind: 'infinitive' }, canStart: false }, 'This period is a subordinate clause (Infinitive phrase)', false],
    ['a legal target during a pick', { pickActive: true, isPickTarget: true }, PICK, true],
    ['a non-target during a pick', { pickActive: true }, START, false],
  ])('on %s', (_, overrides, name, enabled) => {
    renderButton(subordinateControl(overrides));

    const button = screen.getByRole('button', { name });
    if (enabled) expect(button).toBeEnabled();
    else expect(button).toBeDisabled();
  });

  it('opens its menu before the pick, and starts the link of the row chosen', () => {
    const control = subordinateControl();
    renderButton(control);

    fireEvent.click(screen.getByRole('button', { name: START }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual([
      'ThatT',
      'Infinitive phraseO',
      'WhenW',
      'WhileH',
      'BecauseC',
      'AfterA',
      'BeforeB',
      // P09-E27.
      'UntilU',
      'SinceS',
      'ThoughG',
      'AsL',
    ]);
    fireEvent.click(within(menu).getByText('After'));
    expect(control.onStart).toHaveBeenCalledWith('adverbial', 'after');
  });

  it('answers each row to its letter while the menu is open', () => {
    const control = subordinateControl();
    renderButton(control);

    fireEvent.click(screen.getByRole('button', { name: START }));
    fireEvent.keyDown(window, { key: 't' });
    expect(control.onStart).toHaveBeenCalledWith('content', undefined);
  });

  it('clears the clause it governs', () => {
    const control = subordinateControl({ asSource: { kind: 'content' } });
    renderButton(control);

    fireEvent.click(screen.getByRole('button', { name: 'Remove the subordinate clause (That)' }));
    expect(control.onClear).toHaveBeenCalledOnce();
  });
});

describe('subordinateOptions', () => {
  const kinds = (verb: Parameters<typeof subordinateOptions>[0], hasObject = false) =>
    subordinateOptions(verb, hasObject).map((o) => o.conjunction ?? o.link);
  // P09-E27 added until, since and though, localization C41 the similative as.
  const ADVERBIAL = ['when', 'while', 'because', 'after', 'before', 'until', 'since', 'though', 'as'];

  it('offers *that* to a verb that takes a content clause and has no object, *to* to one that takes an infinitive', () => {
    expect(kinds({ clauseObject: 'content' })).toEqual(['content', ...ADVERBIAL]);
    expect(kinds({ clauseObject: 'content' }, true)).toEqual(ADVERBIAL);
    expect(kinds({ clauseObject: 'infinitive' })).toEqual(['infinitive' as SubordinateKind, ...ADVERBIAL]);
    expect(kinds({})).toEqual(ADVERBIAL);
    expect(kinds(undefined)).toEqual([]);
  });
});
