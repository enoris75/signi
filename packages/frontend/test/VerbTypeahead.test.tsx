import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import { VerbTypeahead } from '../src/components/PhraseBuilder/VerbTypeahead.tsx';
import { renderWithProviders } from './render.tsx';
import { describeTypeahead, listed } from './typeaheadSuite.tsx';

describeTypeahead({
  name: 'VerbTypeahead',
  role: 'verb',
  placeholder: 'type a verb…',
  render: (onSelect) => <VerbTypeahead onSelect={onSelect} />,
});

const verb = (id: string, label: string, modal?: boolean): Concept => ({
  id,
  role: 'verb',
  description: `to ${label}`,
  label,
  modal,
});

describe('VerbTypeahead', () => {
  it('leaves out the modal verbs, which fill the modal slots instead', () => {
    renderWithProviders(<VerbTypeahead onSelect={() => {}} />, {
      concepts: { verb: [verb('EAT', 'eat'), verb('CAN', 'can', true), verb('RUN', 'run')] },
    });

    expect(listed()).toEqual(['EAT', 'RUN']);
  });

  it('prompts for a verb in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(<VerbTypeahead onSelect={() => {}} />, {
      strings: { 'slot.verb.placeholder': { it: 'digita un verbo' } },
      concepts: { verb: [] },
    });

    expect(screen.getByTestId('typeahead-verb')).toHaveAttribute(
      'placeholder',
      'digita un verbo…',
    );
  });
});
