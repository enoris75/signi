import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { SubjectTypeahead } from '../src/components/PhraseBuilder/SubjectTypeahead.tsx';
import { renderWithProviders, type SeededStrings } from './render.tsx';
import { describeTypeahead, listed, press, typeInto } from './typeaheadSuite.tsx';

describeTypeahead({
  name: 'SubjectTypeahead',
  role: 'noun',
  placeholder: 'type a subject…',
  render: (onSelect) => <SubjectTypeahead onSelect={onSelect} />,
  otherConcepts: { pronoun: [] },
  staysOpenWhenNothingMatches: true,
  hasTabs: true,
});

const pronoun = (
  id: string,
  label: string,
  person: '1' | '2' | '3',
  definition: string,
): Concept => ({
  id,
  role: 'pronoun',
  description: label,
  definitions: { en: definition },
  label,
  person,
});

const FIRST = pronoun('FIRST_PERSON', 'I', '1', 'the first person');
const SECOND = pronoun('SECOND_PERSON', 'you', '2', 'the second person');
const THIRD = pronoun('THIRD_PERSON', 'he', '3', 'the third person');
// The impersonal "one" is a third person too, so the chooser must tell it apart by id. Listing it
// ahead of THIRD makes a lookup by person alone pick the wrong one.
const GENERIC = pronoun('GENERIC_PERSON', 'one', '3', 'one (generic person)');
const PRONOUNS = [GENERIC, FIRST, SECOND, THIRD];

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a feline', label: 'cat' };
const DOG: Concept = { id: 'DOG', role: 'noun', description: 'a canine', label: 'dog' };

function renderSubject(
  props: Partial<ComponentProps<typeof SubjectTypeahead>> = {},
  pronouns = PRONOUNS,
  strings: SeededStrings = {},
) {
  const onSelect = vi.fn();
  const view = renderWithProviders(<SubjectTypeahead onSelect={onSelect} {...props} />, {
    concepts: { noun: [CAT, DOG], pronoun: pronouns },
    strings,
  });
  return { ...view, onSelect, input: screen.getByTestId('typeahead-subject') };
}

const tab = (name: string) => screen.getByRole('tab', { name });
const choose = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
// The option pressed in each row of the pronoun chooser, top to bottom.
const chosen = () =>
  screen.queryAllByRole('button', { pressed: true }).map((button) => button.textContent);
const dropdown = () => screen.queryByRole('tooltip');

describe('SubjectTypeahead', () => {
  it('prompts for a subject in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(<SubjectTypeahead onSelect={() => {}} />, {
      strings: { 'slot.subject.placeholder': { it: 'digita un soggetto' } },
      concepts: { noun: [], pronoun: [] },
    });

    expect(screen.getByTestId('typeahead-subject')).toHaveAttribute(
      'placeholder',
      'digita un soggetto…',
    );
  });

  it('prompts with the placeholder it is given instead', () => {
    const { input } = renderSubject({ placeholderKey: 'slot.nounOrPronoun.placeholder' });

    expect(input).toHaveAttribute('placeholder', 'type a noun or a pronoun…');
  });

  it('opens on the noun tab', () => {
    renderSubject();

    expect(tab('Noun')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Pronoun')).toHaveAttribute('aria-selected', 'false');
    expect(listed()).toEqual(['CAT', 'DOG']);
  });

  it('says so when no noun matches, keeping the tabs at hand', () => {
    const { input } = renderSubject();

    typeInto(input, 'zzz');

    expect(listed()).toEqual([]);
    expect(dropdown()).toHaveTextContent('no results');
    expect(tab('Pronoun')).toBeInTheDocument();
  });

  it('says so in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'fr');
    const { input } = renderSubject({}, PRONOUNS, { 'typeahead.noResults': { fr: 'aucun résultat' } });

    typeInto(input, 'zzz');

    expect(dropdown()).toHaveTextContent('aucun résultat');
  });

  it('swaps the nouns for the pronoun chooser on its own when nothing controls the tab', () => {
    renderSubject();

    fireEvent.click(tab('Pronoun'));

    expect(tab('Pronoun')).toHaveAttribute('aria-selected', 'true');
    expect(listed()).toEqual([]);
    expect(chosen()).toEqual(['first', 'singular', 'male']);

    fireEvent.click(tab('Noun'));

    expect(listed()).toEqual(['CAT', 'DOG']);
  });

  it('shows the tab it is given when controlled, and reports a change instead of making it', () => {
    const onKindChange = vi.fn();
    const { rerender } = renderSubject({ kind: 'pronoun', onKindChange });
    expect(chosen()).toEqual(['first', 'singular', 'male']);

    fireEvent.click(tab('Noun'));

    expect(onKindChange).toHaveBeenCalledExactlyOnceWith('noun');
    expect(tab('Pronoun')).toHaveAttribute('aria-selected', 'true');

    rerender(<SubjectTypeahead onSelect={() => {}} kind="noun" onKindChange={onKindChange} />);

    expect(listed()).toEqual(['CAT', 'DOG']);
  });

  it('jumps to the noun tab once the user types more than blanks', () => {
    const { input } = renderSubject({ kind: 'pronoun' });

    typeInto(input, ' ');
    expect(tab('Pronoun')).toHaveAttribute('aria-selected', 'true');

    typeInto(input, 'd');
    expect(tab('Noun')).toHaveAttribute('aria-selected', 'true');
    expect(listed()).toEqual(['DOG']);
  });

  it('asks the box to jump to the noun tab when controlled', () => {
    const onKindChange = vi.fn();
    const { input } = renderSubject({ kind: 'pronoun', onKindChange });

    typeInto(input, 'd');

    expect(onKindChange).toHaveBeenCalledExactlyOnceWith('noun');
  });

  it('keeps focus in the input while the dropdown is pressed', () => {
    renderSubject({ kind: 'pronoun' });

    // fireEvent returns false when the handler called preventDefault.
    expect(fireEvent.mouseDown(screen.getByText('person'))).toBe(false);
    expect(fireEvent.mouseDown(tab('Noun'))).toBe(false);
  });

  describe('pronoun chooser', () => {
    it('commits the first person singular, masculine, until told otherwise', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' });

      choose('Select');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(FIRST, {
        number: 'singular',
        gender: 'masc',
      });
      expect(dropdown()).not.toBeInTheDocument();
    });

    it('commits the person, number and gender chosen', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' });

      choose('second');
      choose('plural');
      choose('female');
      choose('Select');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(SECOND, {
        number: 'plural',
        gender: 'fem',
      });
    });

    it('keeps an option chosen when it is clicked again', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' });

      choose('first');
      choose('singular');
      choose('male');

      expect(chosen()).toEqual(['first', 'singular', 'male']);
      choose('Select');
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(FIRST, {
        number: 'singular',
        gender: 'masc',
      });
    });

    it('commits on Enter in the input', () => {
      const { input, onSelect } = renderSubject({ kind: 'pronoun' });

      choose('third');
      press(input, 'Enter');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(THIRD, {
        number: 'singular',
        gender: 'masc',
      });
    });

    it('offers neuter in the third person only', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' });

      choose('second');
      expect(screen.queryByRole('button', { name: 'neuter' })).not.toBeInTheDocument();

      choose('third');
      choose('neuter');
      choose('Select');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(THIRD, {
        number: 'singular',
        gender: 'neut',
      });
    });

    it('falls back to masculine on leaving the third person with neuter chosen', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' });

      choose('third');
      choose('neuter');
      choose('first');
      expect(chosen()).toEqual(['first', 'singular', 'male']);

      choose('third');
      expect(chosen()).toEqual(['third', 'singular', 'male']);

      choose('Select');
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(THIRD, {
        number: 'singular',
        gender: 'masc',
      });
    });

    it('commits the impersonal "one" as a singular of its own, with no number or gender', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' });

      choose('impersonal');

      expect(screen.queryByText('number')).not.toBeInTheDocument();
      expect(screen.queryByText('gender')).not.toBeInTheDocument();

      choose('Select');
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(GENERIC, { number: 'singular' });
    });

    // A pronoun never passes through a ConceptOption, so the person row is where its definition
    // surfaces — the option names the concept it stands for and describes it on hover.
    it('names the pronoun each person option stands for', () => {
      renderSubject({ kind: 'pronoun' });

      const option = (name: string) => screen.getByRole('button', { name });
      expect(option('first')).toHaveAttribute('data-concept', 'FIRST_PERSON');
      expect(option('second')).toHaveAttribute('data-concept', 'SECOND_PERSON');
      expect(option('third')).toHaveAttribute('data-concept', 'THIRD_PERSON');
      expect(option('impersonal')).toHaveAttribute('data-concept', 'GENERIC_PERSON');
    });

    it("describes a person with its pronoun's definition, without renaming the option", () => {
      renderSubject({ kind: 'pronoun' });

      // The definition is the option's *description*: getByRole finds it by the ordinal still.
      expect(screen.getByRole('button', { name: 'second' })).toHaveAttribute(
        'title',
        'the second person',
      );
    });

    it('names no concept while the pronouns have not loaded', () => {
      renderSubject({ kind: 'pronoun' }, []);

      expect(screen.getByRole('button', { name: 'first' })).not.toHaveAttribute('data-concept');
    });

    it('commits nothing, and stays open, while the pronouns have not loaded', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' }, []);

      choose('Select');
      choose('impersonal');
      choose('Select');

      expect(onSelect).not.toHaveBeenCalled();
      expect(dropdown()).toBeInTheDocument();
    });

    it('closes on Escape and reopens on ArrowDown, on the chooser rather than a noun list', () => {
      const { input } = renderSubject({ kind: 'pronoun' });

      press(input, 'Escape');
      expect(dropdown()).not.toBeInTheDocument();

      press(input, 'ArrowDown');
      expect(dropdown()).toBeInTheDocument();
      expect(listed()).toEqual([]);
      expect(screen.getByTestId('pronoun-row-person')).toBeInTheDocument();
    });

    // The three rows are one grid: ↑ ↓ pick a row, ← → change its value, 1–4 jump to a person.
    it('walks the rows with the arrows and changes the value of the one it is on', () => {
      const { input } = renderSubject({ kind: 'pronoun' });
      expect(screen.getByTestId('pronoun-row-person')).toHaveAttribute('data-active');

      press(input, 'ArrowRight');
      expect(chosen()).toEqual(['second', 'singular', 'male']);

      press(input, 'ArrowDown');
      expect(screen.getByTestId('pronoun-row-number')).toHaveAttribute('data-active');
      press(input, 'ArrowRight');
      expect(chosen()).toEqual(['second', 'plural', 'male']);

      press(input, 'ArrowDown');
      press(input, 'ArrowRight');
      expect(chosen()).toEqual(['second', 'plural', 'female']);
    });

    it('stops at the last value of a row rather than wrapping round it', () => {
      const { input } = renderSubject({ kind: 'pronoun' });

      for (let i = 0; i < 6; i++) press(input, 'ArrowRight');
      expect(chosen()).toEqual(['impersonal']);

      for (let i = 0; i < 6; i++) press(input, 'ArrowLeft');
      expect(chosen()).toEqual(['first', 'singular', 'male']);
    });

    it('jumps straight to a person on its digit, wherever the cursor is in the grid', () => {
      const { input } = renderSubject({ kind: 'pronoun' });
      press(input, 'ArrowDown');

      press(input, '3');

      expect(chosen()).toEqual(['third', 'singular', 'male']);
      expect(screen.getByTestId('pronoun-row-person')).toHaveAttribute('data-active');
    });

    it('takes the pronoun the grid describes on Enter', () => {
      const { input, onSelect } = renderSubject({ kind: 'pronoun' });

      press(input, '3');
      press(input, 'ArrowDown');
      press(input, 'ArrowRight');
      press(input, 'Enter');

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(THIRD, {
        number: 'plural',
        gender: 'masc',
      });
    });

    it('leaves the grid for the tabs on ArrowUp from its top row', () => {
      const { input } = renderSubject({ kind: 'pronoun' });

      press(input, 'ArrowUp');
      press(input, 'ArrowLeft');

      expect(tab('Noun')).toHaveAttribute('aria-selected', 'true');
    });
  });

  // The Noun / Pronoun tabs are this picker's category switch, and ↑ from the first row is the
  // way up into it — the same move the adjective slots' Adj / Noun switch answers to.
  describe('the tabs, by key', () => {
    it('moves up into them from the first row, and switches vocabulary with the arrows', () => {
      const { input } = renderSubject();

      press(input, 'ArrowUp');
      press(input, 'ArrowRight');
      expect(tab('Pronoun')).toHaveAttribute('aria-selected', 'true');

      press(input, 'ArrowLeft');
      expect(tab('Noun')).toHaveAttribute('aria-selected', 'true');
    });

    it('stops at the far tab rather than wrapping round', () => {
      const { input } = renderSubject();

      press(input, 'ArrowUp');
      for (let i = 0; i < 3; i++) press(input, 'ArrowRight');
      expect(tab('Pronoun')).toHaveAttribute('aria-selected', 'true');
    });

    it('comes back down to the rows on ArrowDown, and on typing', () => {
      const { input, onSelect } = renderSubject();

      press(input, 'ArrowUp');
      press(input, 'ArrowDown');
      press(input, 'Enter');
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(CAT);

      press(input, 'ArrowUp');
      typeInto(input, 'd');
      press(input, 'Enter');
      expect(onSelect).toHaveBeenLastCalledWith(DOG);
    });
  });
});
