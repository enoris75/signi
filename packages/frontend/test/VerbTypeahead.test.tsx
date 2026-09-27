import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
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

    it('finds SPEAK by typing talk, and lists it as speak with talk among its synonyms', () => {
      renderWithProviders(<VerbTypeahead onSelect={() => {}} />, seed);
      typeInto(screen.getByTestId('typeahead-verb'), 'talk');

      expect(listed()).toEqual(['SPEAK']);
      expect(within(row('SPEAK')).getByTestId('option-word')).toHaveTextContent(/^speak$/);
      expect(within(row('SPEAK')).getByTestId('option-synonyms')).toHaveTextContent(/^≈ talk$/);
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

  // Accents fold on both sides of the search (P04-E18 D1), as in the console's completion.
  describe('finding a verb whatever its accents', () => {
    const create: Concept = { ...verb('CREATE', 'create'), labels: { en: 'create', fr: 'créer' } };
    const already: Concept = { ...verb('ALREADY', 'already'), labels: { en: 'already', it: 'già' } };
    const seed = { concepts: { verb: [create, already, verb('RUN', 'run')] } };

    it('finds già by typing gia, and by typing già', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      renderWithProviders(<VerbTypeahead onSelect={() => {}} />, seed);
      const input = screen.getByTestId('typeahead-verb');

      typeInto(input, 'gia');
      expect(listed()).toEqual(['ALREADY']);
      expect(row('ALREADY')).toHaveTextContent('già');

      typeInto(input, 'già');
      expect(listed()).toEqual(['ALREADY']);
    });

    it('finds créer by typing creer, and by typing it in capitals', () => {
      localStorage.setItem('signi:uiLanguage', 'fr');
      renderWithProviders(<VerbTypeahead onSelect={() => {}} />, seed);
      const input = screen.getByTestId('typeahead-verb');

      typeInto(input, 'creer');
      expect(listed()).toEqual(['CREATE']);
      expect(row('CREATE')).toHaveTextContent('créer');

      typeInto(input, 'CRÉER');
      expect(listed()).toEqual(['CREATE']);
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
