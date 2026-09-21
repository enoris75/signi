// The console's part of the help overlay (C22): its paragraph one statement to a line, each with the
// syntax it is about after a colon, the prompt's keys as rows beside their caps, and the role commands'
// note. The statements are the catalogue's; a whole example line writes its words in the interface
// language, as a help page's example does.
import { afterEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { ConsoleHelp } from '../../src/console/ConsoleHelp.tsx';
import { renderWithProviders, type SeededStrings } from '../render.tsx';
import { ADJECTIVES, ADVERBS, NOUNS, PRONOUNS, VERBS } from './vocab.ts';

const CONCEPTS = { noun: NOUNS, pronoun: PRONOUNS, verb: VERBS, adjective: ADJECTIVES, adverb: ADVERBS };

function renderHelp(strings: SeededStrings = {}) {
  renderWithProviders(<ConsoleHelp />, { strings, concepts: CONCEPTS });
  return screen.getByTestId('console-help-prose');
}

const lines = (el: HTMLElement) => within(el).getAllByTestId('console-help-line').map((line) => line.textContent);

afterEach(() => localStorage.clear());

describe('the console’s help', () => {
  it('says how a line is written, one statement to a line, on the catalogue’s English', () => {
    const prose = renderHelp();
    expect(lines(prose)).toEqual([
      'A bracket holds a word and commands: /subj ( cat /adj brown /pl ) /verb ( eat /past )',
      'The console writes the brackets.',
      "The list shows the word's commands.",
      "A noun's noun phrase: /subj ( book /poss [ child /adj old ] )",
      'New period: /rel subj { … }',
      'A command edits the slot that has the cursor: /pl',
      "Another period's noun: #2.obj",
      'A command sets a value: /past',
      'A line that is applied again does not change the period.',
      'Choose a command to see an example.',
    ]);
    const keys = within(screen.getByTestId('console-help-keys'));
    expect(keys.getByText('Complete, or go to the next word')).toBeInTheDocument();
    expect(keys.getByText('Add a line')).toBeInTheDocument();
    expect(keys.getByText('Previous line')).toBeInTheDocument();
    expect(keys.getByText('Empty line: show the pinned lines')).toBeInTheDocument();
    // The role commands' note: what one does with a word, and without one.
    expect(lines(screen.getByTestId('console-help-note'))).toEqual(['Type a word: /subj ( … )', 'Move the cursor: /subj']);
  });

  it('speaks the interface language, and writes its examples’ words in it', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    const prose = renderHelp({
      'help.console.bracket': { it: 'Una parentesi contiene una parola e comandi' },
      'help.console.nounPhrase': { it: 'Sintagma nominale di un sostantivo' },
      'help.console.newPeriod': { it: 'Nuovo periodo' },
      'help.console.tab': { it: "Completa, o va' alla parola successiva" },
      'help.console.emptyLine': { it: 'Riga vuota' },
      'help.console.showPinned': { it: 'mostra le righe fissate' },
      'help.console.typeWord': { it: 'Digita una parola' },
    });
    expect(lines(prose)).toEqual(expect.arrayContaining([
      'Una parentesi contiene una parola e comandi: /subj ( gatto /adj marrone /pl ) /verb ( mangiare /past )',
      'Sintagma nominale di un sostantivo: /subj ( libro /poss [ bambino /adj vecchio ] )',
      // No words to write: the console's syntax is the same in every language.
      'Nuovo periodo: /rel subj { … }',
    ]));
    const keys = within(screen.getByTestId('console-help-keys'));
    expect(keys.getByText("Completa, o va' alla parola successiva")).toBeInTheDocument();
    expect(keys.getByText('Riga vuota: mostra le righe fissate')).toBeInTheDocument();
    expect(lines(screen.getByTestId('console-help-note'))).toContain('Digita una parola: /subj ( … )');
  });
});
