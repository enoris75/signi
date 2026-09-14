import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  BorderControlButton,
  ControlButton,
} from '../../src/components/PhraseBuilder/PeriodContainer/ControlButton.tsx';
import { DIVIDER, SUCCESS, TEXT_SECONDARY } from './fixtures.ts';

describe('ControlButton', () => {
  it('is named by its tooltip, and reports a click', () => {
    const onClick = vi.fn();
    render(<ControlButton title="Save period" icon={SaveOutlinedIcon} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save period' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('takes a name of its own over the tooltip’s', () => {
    render(
      <ControlButton title="Save this period" aria-label="Save" icon={SaveOutlinedIcon} />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('keeps a control that can be disabled in a span, where the tooltip can still hear it', () => {
    render(<ControlButton title="Save period" icon={SaveOutlinedIcon} disabled />);

    const button = screen.getByRole('button', { name: 'Save period' });
    expect(button).toBeDisabled();
    expect(button.parentElement!.tagName).toBe('SPAN');
    expect(button.parentElement).toHaveAttribute('aria-label', 'Save period');
  });

  it('wraps a control that is never disabled in nothing', () => {
    render(
      <div data-testid="host">
        <ControlButton title="Tidy up this period" icon={SaveOutlinedIcon} />
      </div>,
    );

    expect(screen.getByRole('button').parentElement).toBe(screen.getByTestId('host'));
  });
});

describe('BorderControlButton', () => {
  it.each<[string, boolean, string, string]>([
    ['lit', true, SUCCESS, SUCCESS],
    ['unlit', false, DIVIDER, TEXT_SECONDARY],
  ])('draws its chip in its accent while %s', (_, lit, border, colour) => {
    render(
      <BorderControlButton
        title="Toggle"
        icon={SaveOutlinedIcon}
        accent="success.main"
        lit={lit}
        disabled={false}
      />,
    );
    const style = getComputedStyle(screen.getByRole('button'));

    expect(style.borderTopColor).toBe(border);
    expect(style.color).toBe(colour);
  });
});
