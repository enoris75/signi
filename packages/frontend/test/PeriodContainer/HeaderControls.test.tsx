import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import {
  HeaderControls,
  type HeaderControlsProps,
} from '../../src/components/PhraseBuilder/PeriodContainer/HeaderControls.tsx';
import { renderWithProviders, type Seed } from '../render.tsx';

// The controls of a sole, empty, full-view period whose canvas holds no role box yet.
function renderHeader(overrides: Partial<HeaderControlsProps> = {}, seed?: Seed) {
  const props: HeaderControlsProps = {
    compact: false,
    hasGroups: false,
    hasContent: false,
    soleContainer: true,
    onToggleCompact: vi.fn(),
    onTidy: vi.fn(),
    ...overrides,
  };
  const view = renderWithProviders(<HeaderControls {...props} />, seed);
  return { ...view, props };
}

describe('HeaderControls', () => {
  describe('reorder controls', () => {
    it('are left out for the only period in the workspace', () => {
      renderHeader({ soleContainer: true, onMoveUp: vi.fn(), onMoveDown: vi.fn() });

      expect(screen.queryByRole('button', { name: 'Move up' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Move down' })).not.toBeInTheDocument();
    });

    it('move a period in the middle of the stack either way', () => {
      const onMoveUp = vi.fn();
      const onMoveDown = vi.fn();
      renderHeader({ soleContainer: false, onMoveUp, onMoveDown });

      fireEvent.click(screen.getByRole('button', { name: 'Move up' }));
      expect(onMoveUp).toHaveBeenCalledOnce();
      expect(onMoveDown).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Move down' }));
      expect(onMoveDown).toHaveBeenCalledOnce();
    });

    it('stay mounted but disabled at the ends of the stack', () => {
      const { rerender, props } = renderHeader({ soleContainer: false, onMoveDown: vi.fn() });
      expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Move down' })).toBeEnabled();

      rerender(<HeaderControls {...props} onMoveUp={vi.fn()} onMoveDown={undefined} />);
      expect(screen.getByRole('button', { name: 'Move up' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled();
    });

    it('are named in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'de');
      renderHeader(
        { soleContainer: false, onMoveUp: vi.fn(), onMoveDown: vi.fn() },
        {
          strings: {
            'action.movePeriodUp': { de: 'Nach oben verschieben' },
            'action.movePeriodDown': { de: 'Nach unten verschieben' },
          },
        },
      );

      expect(screen.getByRole('button', { name: 'Nach oben verschieben' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Nach unten verschieben' })).toBeEnabled();
    });
  });

  describe('compact and tidy controls', () => {
    it('are left out until the canvas holds a role box', () => {
      renderHeader({ hasGroups: false });

      expect(screen.queryByTestId('period-compact-toggle')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-tidy')).not.toBeInTheDocument();
    });

    it('offer to compact a full period, and tidy it', () => {
      const { props } = renderHeader({ hasGroups: true, compact: false });

      const toggle = screen.getByRole('button', { name: 'Compact this period' });
      expect(toggle).toHaveAttribute('data-compact', 'false');
      fireEvent.click(toggle);
      expect(props.onToggleCompact).toHaveBeenCalledOnce();

      fireEvent.click(screen.getByRole('button', { name: 'Tidy up this period' }));
      expect(props.onTidy).toHaveBeenCalledOnce();
      expect(props.onToggleCompact).toHaveBeenCalledOnce();
    });

    it('offer to expand a compact period', () => {
      const { props } = renderHeader({ hasGroups: true, compact: true });

      const toggle = screen.getByRole('button', { name: 'Expand this period' });
      expect(toggle).toHaveAttribute('data-compact', 'true');
      fireEvent.click(toggle);
      expect(props.onToggleCompact).toHaveBeenCalledOnce();
    });

    it('are named in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderHeader(
        { hasGroups: true },
        {
          strings: {
            'action.compactPeriod': { it: 'Compatta questo periodo' },
            'action.tidyPeriod': { it: 'Riordina questo periodo' },
          },
        },
      );

      expect(screen.getByTestId('period-compact-toggle')).toHaveAccessibleName(
        'Compatta questo periodo',
      );
      expect(screen.getByTestId('period-tidy')).toHaveAccessibleName('Riordina questo periodo');
    });
  });

  describe('save control', () => {
    it('is left out when the period cannot be saved', () => {
      renderHeader({ hasContent: true });

      expect(screen.queryByRole('button', { name: 'Save period' })).not.toBeInTheDocument();
    });

    it('stays disabled until the clause has content', () => {
      renderHeader({ onSave: vi.fn(), hasContent: false });

      expect(screen.getByRole('button', { name: 'Save period' })).toBeDisabled();
    });

    it('saves a period with content', () => {
      const onSave = vi.fn();
      renderHeader({ onSave, hasContent: true });

      fireEvent.click(screen.getByRole('button', { name: 'Save period' }));

      expect(onSave).toHaveBeenCalledOnce();
    });
  });

  describe('remove control', () => {
    it('is left out when there is no way to remove the period', () => {
      renderHeader({ soleContainer: false, hasContent: true });

      expect(screen.queryByRole('button', { name: 'Remove this period' })).not.toBeInTheDocument();
    });

    it('has nothing to clear on the only period while it is empty', () => {
      renderHeader({ soleContainer: true, hasContent: false, onRemove: vi.fn() });

      expect(screen.queryByRole('button', { name: 'Clear this period' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove this period' })).not.toBeInTheDocument();
    });

    it('clears the only period in place once the user confirms', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onRemove = vi.fn();
      renderHeader({ soleContainer: true, hasContent: true, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Clear this period' }));

      expect(confirm).toHaveBeenCalledExactlyOnceWith(
        'Clear this main clause and everything in it?',
      );
      expect(onRemove).toHaveBeenCalledOnce();
    });

    it('removes a period with content once the user confirms', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onRemove = vi.fn();
      renderHeader({ soleContainer: false, hasContent: true, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Remove this period' }));

      expect(confirm).toHaveBeenCalledExactlyOnceWith(
        'Remove this main clause and everything in it?',
      );
      expect(onRemove).toHaveBeenCalledOnce();
    });

    it('keeps the period when the user declines', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const onRemove = vi.fn();
      renderHeader({ soleContainer: false, hasContent: true, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Remove this period' }));

      expect(onRemove).not.toHaveBeenCalled();
    });

    it('names the removal in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'de');
      renderHeader(
        { soleContainer: false, onRemove: vi.fn() },
        { strings: { 'action.removePeriod': { de: 'Dieses Satzgefüge entfernen' } } },
      );

      expect(screen.getByRole('button', { name: 'Dieses Satzgefüge entfernen' })).toBeInTheDocument();
    });

    it('removes an empty period without asking', () => {
      const confirm = vi.spyOn(window, 'confirm');
      const onRemove = vi.fn();
      renderHeader({ soleContainer: false, hasContent: false, onRemove });

      fireEvent.click(screen.getByRole('button', { name: 'Remove this period' }));

      expect(confirm).not.toHaveBeenCalled();
      expect(onRemove).toHaveBeenCalledOnce();
    });
  });
});
