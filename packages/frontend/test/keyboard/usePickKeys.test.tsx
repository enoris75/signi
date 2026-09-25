import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { PICK_TARGET, usePickKeys } from '../../src/keyboard/usePickKeys.ts';

// Two eligible targets on the page and a word picker's field beside them — what opening a noun's
// owner draws: the pointing gesture's numbered nouns, and the owner ring's picker holding the cursor.
function page() {
  document.body.innerHTML = `
    <div ${PICK_TARGET}="subject" id="first"></div>
    <div ${PICK_TARGET}="directObject" id="second"></div>
    <input data-testid="typeahead-noun" />
  `;
  return {
    first: document.getElementById('first')!,
    second: document.getElementById('second')!,
    input: document.querySelector('input')!,
  };
}

function pick() {
  const onPick = vi.fn();
  const onCancel = vi.fn();
  const hook = renderHook(() => usePickKeys({ active: true, onPick, onCancel }));
  return { onPick, onCancel, hook };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('usePickKeys', () => {
  it('takes the walked-to target on ↵ from outside a field', () => {
    const { first } = page();
    const { onPick } = pick();

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(onPick).toHaveBeenCalledWith(first);
  });

  it('walks on ⇥ from outside a field', () => {
    const { second } = page();
    const { onPick, hook } = pick();

    act(() => {
      fireEvent.keyDown(document.body, { key: 'Tab' });
    });
    expect(hook.result.current.walked).toBe(1);
    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(onPick).toHaveBeenCalledWith(second);
  });

  // A375: ↵ in the owner ring's picker is the picker's — it chooses the word typed.
  it('leaves ↵ to a word picker’s field', () => {
    const { input } = page();
    const { onPick } = pick();
    const fieldKeys = vi.fn();
    input.addEventListener('keydown', fieldKeys);

    const notPrevented = fireEvent.keyDown(input, { key: 'Enter' });

    expect(onPick).not.toHaveBeenCalled();
    expect(notPrevented).toBe(true);
    expect(fieldKeys).toHaveBeenCalled();
  });

  it('leaves ⇥ to a word picker’s field', () => {
    const { input } = page();
    const { onPick, hook } = pick();

    const notPrevented = fireEvent.keyDown(input, { key: 'Tab' });

    expect(notPrevented).toBe(true);
    expect(hook.result.current.walked).toBe(0);
    expect(onPick).not.toHaveBeenCalled();
  });

  it('still takes a digit and esc from inside the field', () => {
    const { input, second } = page();
    const { onPick, onCancel } = pick();

    fireEvent.keyDown(input, { key: '2' });
    expect(onPick).toHaveBeenCalledWith(second);

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
});
