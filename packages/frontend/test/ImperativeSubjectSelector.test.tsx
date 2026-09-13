import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import {
  ImperativeSubjectSelector,
} from '../src/components/PhraseBuilder/ImperativeSubjectSelector.tsx';
import { renderWithProviders, type SeededStrings } from './render.tsx';

function renderSelector(
  props: Partial<ComponentProps<typeof ImperativeSubjectSelector>> = {},
  strings: SeededStrings = {},
) {
  const onPersonChange = vi.fn();
  const onRegisterChange = vi.fn();
  const onCanvasPointerDown = vi.fn();
  const view = renderWithProviders(
    // The box stands in for the subject node, which the canvas drags by its frame.
    <div onPointerDown={onCanvasPointerDown}>
      <ImperativeSubjectSelector
        person="2sg"
        register="request"
        onPersonChange={onPersonChange}
        onRegisterChange={onRegisterChange}
        {...props}
      />
    </div>,
    { strings },
  );
  return { ...view, onPersonChange, onRegisterChange, onCanvasPointerDown };
}

const button = (name: string) => screen.getByRole('button', { name });
const PERSON_NAMES = ['second singular', 'first plural', 'second plural'];

afterEach(() => {
  vi.useRealTimers();
});

describe('ImperativeSubjectSelector', () => {
  it('captions the subject position as a command', () => {
    renderSelector();

    expect(screen.getByText('Command')).toBeInTheDocument();
  });

  describe('register', () => {
    it('offers an order or an instruction, pressing the current one', () => {
      renderSelector({ register: 'request' });

      expect(button('Order')).toHaveAttribute('aria-pressed', 'true');
      expect(button('Instruction')).toHaveAttribute('aria-pressed', 'false');
    });

    it('reports the register chosen', () => {
      const { onRegisterChange } = renderSelector({ register: 'request' });

      fireEvent.click(button('Instruction'));

      expect(onRegisterChange).toHaveBeenCalledExactlyOnceWith('instruction');
    });

    it('ignores a click on the register already chosen', () => {
      // An exclusive group reports `null` when its pressed button is clicked again; a command is
      // always spoken in one register or the other.
      const { onRegisterChange } = renderSelector({ register: 'request' });

      fireEvent.click(button('Order'));

      expect(onRegisterChange).not.toHaveBeenCalled();
    });
  });

  describe('person', () => {
    it('offers the three persons an order can address, pressing the current one', () => {
      renderSelector({ person: '1pl' });

      expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
        'Order',
        'Instruction',
        ...PERSON_NAMES,
      ]);
      expect(PERSON_NAMES.map((name) => button(name).getAttribute('aria-pressed'))).toEqual([
        'false',
        'true',
        'false',
      ]);
    });

    it('reports the person chosen', () => {
      const { onPersonChange } = renderSelector({ person: '2sg' });

      fireEvent.click(button('second plural'));

      expect(onPersonChange).toHaveBeenCalledExactlyOnceWith('2pl');
    });

    it('names each person in full on the control the tooltip hangs on', () => {
      renderSelector();

      expect(
        PERSON_NAMES.map((name) => button(name).parentElement!.getAttribute('aria-label')),
      ).toEqual(['Second person singular', 'First person plural', 'Second person plural']);
    });

    it('is not asked of an instruction, which addresses nobody', () => {
      renderSelector({ register: 'instruction', person: '2pl' });

      expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
        'Order',
        'Instruction',
      ]);
      expect(button('Instruction')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('inherited from the first command of a coordination', () => {
    it('shows the first command’s choices, locked', () => {
      renderSelector({ inherited: true, register: 'request', person: '1pl' });

      expect(button('Order')).toBeDisabled();
      expect(button('Order')).toHaveAttribute('aria-pressed', 'true');
      expect(button('Instruction')).toBeDisabled();
      PERSON_NAMES.forEach((name) => expect(button(name)).toBeDisabled());
      expect(button('first plural')).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks where the choices come from', () => {
      renderSelector({ inherited: true });

      expect(screen.getByLabelText('The first command')).toBeInTheDocument();
    });

    it('has no such mark on a command of its own', () => {
      renderSelector();

      expect(screen.queryByLabelText('The first command')).not.toBeInTheDocument();
      expect(button('Order')).toBeEnabled();
      PERSON_NAMES.forEach((name) => expect(button(name)).toBeEnabled());
    });

    // MUI shares a module-level "a tooltip was just open" flag across every Tooltip, which drops
    // the enter delay for the next one; keep this the only test that opens a tooltip.
    it('still names a locked person on hover', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      renderSelector({ inherited: true, person: '2pl' });

      fireEvent.mouseOver(button('second plural').parentElement!);
      act(() => vi.advanceTimersByTime(100));

      expect(screen.getByRole('tooltip')).toHaveTextContent('Second person plural');
    });
  });

  it('keeps presses on its choices from dragging the box, which still drags by its frame', () => {
    const { onCanvasPointerDown } = renderSelector();

    fireEvent.pointerDown(button('Instruction'));
    fireEvent.pointerDown(button('first plural'));
    expect(onCanvasPointerDown).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByText('Command'));
    expect(onCanvasPointerDown).toHaveBeenCalledOnce();
  });

  it('asks both questions in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderSelector(
      { inherited: true },
      {
        'imperative.command': { it: 'Comando' },
        'imperative.firstCommand': { it: 'Il primo comando' },
        'imperative.register.request': { it: 'Ordine' },
        'imperative.register.instruction': { it: 'Istruzione' },
        'imperative.person.2sg': { it: 'Seconda persona singolare' },
        'imperative.personShort.2sg': { it: 'seconda singolare' },
        'imperative.personShort.1pl': { it: 'prima plurale' },
        'imperative.personShort.2pl': { it: 'seconda plurale' },
      },
    );

    expect(screen.getByText('Comando')).toBeInTheDocument();
    expect(screen.getByLabelText('Il primo comando')).toBeInTheDocument();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Ordine',
      'Istruzione',
      'seconda singolare',
      'prima plurale',
      'seconda plurale',
    ]);
    expect(button('seconda singolare').parentElement).toHaveAttribute(
      'aria-label',
      'Seconda persona singolare',
    );
  });
});
