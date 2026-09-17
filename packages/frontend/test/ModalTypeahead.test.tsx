import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import { ModalTypeahead } from '../src/components/PhraseBuilder/ModalTypeahead.tsx';
import { renderWithProviders } from './render.tsx';
import { describeTypeahead, listed } from './typeaheadSuite.tsx';

describeTypeahead({
  name: 'ModalTypeahead',
  role: 'verb',
  traits: { modal: true },
  placeholder: 'type a modal…',
  render: (onSelect) => <ModalTypeahead onSelect={onSelect} />,
});

const verb = (id: string, label: string, modal?: boolean): Concept => ({
  id,
  role: 'verb',
  description: `to ${label}`,
  label,
  modal,
});

describe('ModalTypeahead', () => {
  it('lists only the modal verbs, out of the whole verb list', () => {
    renderWithProviders(<ModalTypeahead onSelect={() => {}} />, {
      concepts: {
        verb: [verb('MUST', 'must', true), verb('EAT', 'eat'), verb('CAN', 'can', true)],
      },
    });

    expect(listed()).toEqual(['MUST', 'CAN']);
  });

  it('prompts in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(<ModalTypeahead onSelect={() => {}} />, {
      concepts: { verb: [] },
      strings: { 'slot.modal.placeholder': { it: 'digita un verbo servile' } },
    });

    expect(screen.getByPlaceholderText('digita un verbo servile…')).toBeInTheDocument();
  });
});
