import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Concept } from '@signi/shared';
import { ConceptOption } from '../src/components/PhraseBuilder/ConceptOption.tsx';
import { renderWithProviders } from './render.tsx';

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

function renderOption(props: Partial<ComponentProps<typeof ConceptOption>> = {}) {
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
  );
  return { ...view, onClick, onMouseEnter, option: screen.getByTestId('typeahead-option') };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ConceptOption', () => {
  it('shows the word with its gloss in English', () => {
    const { option } = renderOption();

    expect(option).toHaveTextContent(/^cry\s*\(weep\)$/);
    expect(option).toHaveAttribute('data-concept', 'CRY');
  });

  it('shows the word without the English gloss in another language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    const { option } = renderOption();

    expect(option).toHaveTextContent(/^piangere$/);
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
    const { option } = renderOption({ concept: BEGIN });

    expect(option).toHaveTextContent(/^iniziare\s*\(avere inizio\)$/);
  });

  it('shows no gloss for a word that has none', () => {
    const { option } = renderOption({ concept: CAT });

    expect(option).toHaveTextContent(/^cat$/);
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

  // MUI shares a module-level "a tooltip was just open" flag across every Tooltip, which drops
  // the enter delay for the next one; keep this the only test that opens a tooltip.
  it('shows the definition in the UI language after hovering a moment', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    localStorage.setItem('signi:uiLanguage', 'it');
    const { option } = renderOption();

    fireEvent.mouseOver(option);
    act(() => vi.advanceTimersByTime(399));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('tooltip')).toHaveTextContent('versare lacrime');
  });
});
