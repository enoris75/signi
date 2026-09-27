import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { ConceptOption } from '../src/components/PhraseBuilder/ConceptOption.tsx';
import { renderWithProviders, type Seed } from './render.tsx';

const CRY: Concept = {
  id: 'CRY',
  role: 'verb',
  description: 'to shed tears',
  definitions: { en: 'to shed tears', it: 'versare lacrime' },
  label: 'cry',
  labels: { en: 'cry', it: 'piangere' },
  synonym: 'weep',
};

const CAT: Concept = {
  id: 'CAT',
  role: 'noun',
  description: 'a small domesticated feline',
  label: 'cat',
  labels: { en: 'cat', ja: '猫' },
  readings: { ja: 'ねこ' },
};

function renderOption(props: Partial<ComponentProps<typeof ConceptOption>> = {}, seed: Seed = {}) {
  const onClick = vi.fn();
  const onMouseEnter = vi.fn();
  const view = renderWithProviders(
    <div data-testid="list">
      <ConceptOption
        concept={CRY}
        highlighted={false}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        {...props}
      />
    </div>,
    seed,
  );
  const option = screen.getByTestId('typeahead-option');
  return { ...view, onClick, onMouseEnter, option, word: within(option).getByTestId('option-word') };
}

describe('ConceptOption', () => {
  it('shows the word with its gloss in English', () => {
    const { option, word } = renderOption();

    expect(word).toHaveTextContent(/^cry\s*\(weep\)$/);
    expect(option).toHaveAttribute('data-concept', 'CRY');
  });

  it('shows the word without the English gloss in another language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    const { word } = renderOption();

    expect(word).toHaveTextContent(/^piangere$/);
  });

  it("shows the language's own gloss where the concept has one", () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    const BEGIN: Concept = {
      id: 'BEGIN',
      role: 'verb',
      description: 'to come into being; to get under way',
      label: 'begin',
      labels: { en: 'begin', it: 'iniziare' },
      synonym: 'get under way',
      glosses: { it: 'avere inizio' },
    };
    const { word } = renderOption({ concept: BEGIN });

    expect(word).toHaveTextContent(/^iniziare\s*\(avere inizio\)$/);
  });

  it('shows no gloss for a word that has none', () => {
    const { word } = renderOption({ concept: CAT });

    expect(word).toHaveTextContent(/^cat$/);
  });

  it('sets furigana over the word where the language supplies a reading', () => {
    localStorage.setItem('signi:uiLanguage', 'ja');
    const { option } = renderOption({ concept: CAT });

    const ruby = option.querySelector('ruby');
    expect(ruby).toHaveTextContent('猫');
    expect(ruby?.querySelector('rt')).toHaveTextContent('ねこ');
  });

  it('stays the direct child of its list, so the pickers can scroll it by index', () => {
    const { option } = renderOption();

    expect(screen.getByTestId('list').children[0]).toBe(option);
  });

  it('reports clicks and the mouse entering', () => {
    const { option, onClick, onMouseEnter } = renderOption();

    fireEvent.mouseEnter(option);
    expect(onMouseEnter).toHaveBeenCalledOnce();

    fireEvent.click(option);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps focus in the picker input when pressed', () => {
    const { option } = renderOption();

    // fireEvent returns false when the handler called preventDefault.
    expect(fireEvent.mouseDown(option)).toBe(false);
  });

  it('shades only the highlighted row', () => {
    const background = (highlighted: boolean) => {
      const { option, unmount } = renderOption({ highlighted });
      const color = getComputedStyle(option).backgroundColor;
      unmount();
      return color;
    };

    expect(background(false)).toBe('rgba(0, 0, 0, 0)');
    expect(background(true)).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('shows the definition under the word, in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    const { option } = renderOption();

    expect(within(option).getByTestId('option-definition')).toHaveTextContent(/^versare lacrime$/);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('falls back to the English definition where the language has none', () => {
    localStorage.setItem('signi:uiLanguage', 'de');
    const { option } = renderOption();

    expect(within(option).getByTestId('option-definition')).toHaveTextContent(/^to shed tears$/);
  });

  it('shows no relations line for a word that has none', () => {
    const { option } = renderOption({ concept: CAT });

    expect(within(option).queryByTestId('option-relations')).not.toBeInTheDocument();
  });

  describe('synonyms and antonyms', () => {
    const OLD: Concept = {
      id: 'OLD',
      role: 'adjective',
      description: 'having existed for a long time',
      label: 'old',
      labels: { en: 'old', it: 'vecchio' },
      antonyms: ['NEW', 'YOUNG'],
      synonyms: ['AGED'],
    };
    const adjective = (id: string, en: string, it: string): Concept => ({
      id, role: 'adjective', description: en, label: en, labels: { en, it },
    });
    const adjectives = [
      OLD,
      adjective('NEW', 'new', 'nuovo'),
      adjective('YOUNG', 'young', 'giovane'),
      adjective('AGED', 'aged', 'anziano'),
    ];

    it('names them in the UI language, under the definition', () => {
      localStorage.setItem('signi:uiLanguage', 'it');
      const { option } = renderOption({ concept: OLD }, { concepts: { adjective: adjectives } });

      expect(within(option).getByTestId('option-synonyms')).toHaveTextContent(/^≈ anziano$/);
      expect(within(option).getByTestId('option-antonyms')).toHaveTextContent(/^↔ nuovo, giovane$/);
    });

    it("lists the word's aliases in the UI language among its synonyms", () => {
      const SPEAK: Concept = {
        id: 'SPEAK', role: 'verb', description: 'to say words aloud', label: 'speak',
        labels: { en: 'speak' }, aliases: { en: ['talk'], it: ['discorrere'] },
      };
      const { option } = renderOption({ concept: SPEAK });

      expect(within(option).getByTestId('option-synonyms')).toHaveTextContent(/^≈ talk$/);
      expect(within(option).queryByTestId('option-antonyms')).not.toBeInTheDocument();
    });

    it('leaves out a related concept its list does not hold', () => {
      const { option } = renderOption({ concept: OLD }, { concepts: { adjective: [OLD, adjective('NEW', 'new', 'nuovo')] } });

      expect(within(option).queryByTestId('option-synonyms')).not.toBeInTheDocument();
      expect(within(option).getByTestId('option-antonyms')).toHaveTextContent(/^↔ new$/);
    });
  });
});
