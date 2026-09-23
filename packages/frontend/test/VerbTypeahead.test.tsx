import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import { VerbTypeahead } from '../src/components/PhraseBuilder/VerbTypeahead.tsx';
import { renderWithProviders } from './render.tsx';
import { describeTypeahead, listed, row, typeInto } from './typeaheadSuite.tsx';

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

  // Secondary lexemes (P09-E23): a second word finds the concept, which is still listed by its own.
  describe('finding a verb by its alias', () => {
    const speak: Concept = {
      ...verb('SPEAK', 'speak'),
      labels: { en: 'speak', it: 'parlare' },
      aliases: { en: ['talk'] },
    };
    const begin: Concept = {
      ...verb('BEGIN', 'begin'),
      labels: { en: 'begin', it: 'iniziare', de: 'beginnen' },
      aliases: { it: ['cominciare'], de: ['anfangen'] },
    };
    const seed = { concepts: { verb: [verb('EAT', 'eat'), speak, begin] } };

    it('finds SPEAK by typing talk, and lists it as speak', () => {
      renderWithProviders(<VerbTypeahead onSelect={() => {}} />, seed);
      typeInto(screen.getByTestId('typeahead-verb'), 'talk');

      expect(listed()).toEqual(['SPEAK']);
      expect(row('SPEAK')).toHaveTextContent('speak');
      expect(row('SPEAK')).not.toHaveTextContent('talk');
    });

    it('finds an alias of the UI language, and the English one too', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderWithProviders(<VerbTypeahead onSelect={() => {}} />, seed);
      const input = screen.getByTestId('typeahead-verb');

      typeInto(input, 'cominc');
      expect(listed()).toEqual(['BEGIN']);
      expect(row('BEGIN')).toHaveTextContent('iniziare');

      typeInto(input, 'talk');
      expect(listed()).toEqual(['SPEAK']);
    });

    it('does not find another language’s alias', () => {
      renderWithProviders(<VerbTypeahead onSelect={() => {}} />, seed);
      typeInto(screen.getByTestId('typeahead-verb'), 'anfang');

      expect(listed()).toEqual([]);
    });
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
