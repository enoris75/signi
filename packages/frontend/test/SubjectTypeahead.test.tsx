import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { SubjectTypeahead } from '../src/components/PhraseBuilder/SubjectTypeahead.tsx';
import { renderWithProviders } from './render.tsx';
import { describeTypeahead, listed, press, typeInto } from './typeaheadSuite.tsx';

describeTypeahead({
  name: 'SubjectTypeahead',
  role: 'noun',
  placeholder: 'type a subject…',
  render: (onSelect) => <SubjectTypeahead onSelect={onSelect} />,
  otherConcepts: { pronoun: [] },
  staysOpenWhenNothingMatches: true,
});

const pronoun = (id: string, label: string, person: '1' | '2' | '3'): Concept => ({
  id,
  role: 'pronoun',
  description: label,
  label,
  person,
});

const FIRST = pronoun('FIRST_PERSON', 'I', '1');
const SECOND = pronoun('SECOND_PERSON', 'you', '2');
const THIRD = pronoun('THIRD_PERSON', 'he', '3');
// The impersonal "one" is a third person too, so the chooser must tell it apart by id. Listing it
// ahead of THIRD makes a lookup by person alone pick the wrong one.
const GENERIC = pronoun('GENERIC_PERSON', 'one', '3');
const PRONOUNS = [GENERIC, FIRST, SECOND, THIRD];

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'a feline', label: 'cat' };
const DOG: Concept = { id: 'DOG', role: 'noun', description: 'a canine', label: 'dog' };

function renderSubject(
  props: Partial<ComponentProps<typeof SubjectTypeahead>> = {},
  pronouns = PRONOUNS,
) {
  const onSelect = vi.fn();
  const view = renderWithProviders(<SubjectTypeahead onSelect={onSelect} {...props} />, {
    concepts: { noun: [CAT, DOG], pronoun: pronouns },
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
    expect(dropdown()).toHaveTextContent('no matches');
    expect(tab('Pronoun')).toBeInTheDocument();
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

    it('commits nothing, and stays open, while the pronouns have not loaded', () => {
      const { onSelect } = renderSubject({ kind: 'pronoun' }, []);

      choose('Select');
      choose('impersonal');
      choose('Select');

      expect(onSelect).not.toHaveBeenCalled();
      expect(dropdown()).toBeInTheDocument();
    });

    it('closes on Escape, and ignores the arrow keys that would reopen the noun list', () => {
      const { input } = renderSubject({ kind: 'pronoun' });

      press(input, 'Escape');
      expect(dropdown()).not.toBeInTheDocument();

      press(input, 'ArrowDown');
      expect(dropdown()).not.toBeInTheDocument();
    });
  });
});
