import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import {
  ASPECTS,
  ASPECT_LABELS,
  CAUSE_SENTIMENTS,
  CAUSE_SENTIMENT_LABELS,
  PATH_SPECIFIERS,
  PATH_SPECIFIER_LABELS,
  TENSES,
  TENSE_LABELS,
  type Concept,
  type Definiteness,
  type LanguageCode,
  type UiStringKey,
} from '@signi/shared';
import { LanguageProvider } from '../src/i18n/LanguageContext.tsx';
import {
  AspectToggleBox,
  CategoryToggle,
  DeterminerToggleBox,
  SatelliteButton,
  SatelliteRow,
  SentimentSelector,
  SlotBox,
  SpecifierSelector,
  TenseToggleBox,
  ToggleBox,
  type SatelliteIcon,
} from '../src/components/PhraseBuilder/Boxes.tsx';
import type { SlotCategory, SlotConfig } from '../src/components/PhraseBuilder/interfaces.ts';

type SeededStrings = Partial<Record<UiStringKey, Partial<Record<LanguageCode, string>>>>;

// The boxes read UI strings through react-query and the UI language through its context. The
// bundle is seeded rather than fetched, so no request goes out: an empty bundle leaves every
// string on its static English fallback, exactly as the app renders before the backend answers.
function renderWithProviders(ui: ReactElement, strings: SeededStrings = {}) {
  const client = new QueryClient();
  client.setQueryData(['ui-strings'], strings);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <LanguageProvider>{children}</LanguageProvider>
    </QueryClientProvider>
  );
  return render(ui, { wrapper });
}

const SUBJECT: SlotConfig = {
  key: 'subject',
  label: 'Subject',
  required: true,
  roles: ['noun', 'pronoun'],
  color: 'primary',
};

const DIRECT_OBJECT: SlotConfig = {
  key: 'directObject',
  label: 'Direct object',
  required: false,
  roles: ['noun'],
  color: 'success',
};

const VERB: SlotConfig = {
  key: 'verb',
  label: 'Verb',
  required: true,
  roles: ['verb'],
  color: 'secondary',
};

const CAT: Concept = {
  id: 'CAT',
  role: 'noun',
  description: 'a small domesticated feline',
  label: 'cat',
  labels: { en: 'cat', it: 'gatto' },
};

const NOUN_OR_PRONOUN: SlotCategory[] = [
  { value: 'noun', labelKey: 'category.noun' },
  { value: 'pronoun', labelKey: 'category.pronoun' },
];

describe('CategoryToggle', () => {
  it('labels one button per option and presses the current value', () => {
    renderWithProviders(
      <CategoryToggle options={NOUN_OR_PRONOUN} value="noun" onChange={() => {}} />,
    );

    expect(screen.getByRole('button', { name: 'Noun' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Pronoun' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reports the option clicked', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <CategoryToggle options={NOUN_OR_PRONOUN} value="noun" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pronoun' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('pronoun');
  });

  it('ignores a click on the option already chosen', () => {
    // An exclusive group reports `null` when its pressed button is clicked again; the switch
    // must never be left with no vocabulary selected.
    const onChange = vi.fn();
    renderWithProviders(
      <CategoryToggle options={NOUN_OR_PRONOUN} value="noun" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Noun' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps a press from starting a box drag or blurring the picker input', () => {
    const onCanvasPointerDown = vi.fn();
    renderWithProviders(
      <div onPointerDown={onCanvasPointerDown}>
        <CategoryToggle options={NOUN_OR_PRONOUN} value="noun" onChange={() => {}} />
      </div>,
    );
    const button = screen.getByRole('button', { name: 'Pronoun' });

    fireEvent.pointerDown(button);
    // fireEvent returns false when the handler called preventDefault.
    const mouseDownProceeded = fireEvent.mouseDown(button);

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
    expect(mouseDownProceeded).toBe(false);
  });

  it('names the categories in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(
      <CategoryToggle options={NOUN_OR_PRONOUN} value="noun" onChange={() => {}} />,
      { 'category.noun': { it: 'Nome' }, 'category.pronoun': { it: 'Pronome' } },
    );

    expect(screen.getByRole('button', { name: 'Nome' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pronome' })).toBeInTheDocument();
  });
});

describe('SlotBox', () => {
  it('shows an empty slot as its heading and a placeholder, with nothing to clear', () => {
    renderWithProviders(<SlotBox slot={SUBJECT} isActive={false} onClear={() => {}} />);

    const box = screen.getByTestId('box-subject');
    expect(box).toHaveTextContent('Subject *');
    expect(box).toHaveTextContent('empty');
    expect(screen.queryByRole('button', { name: 'Clear Subject' })).not.toBeInTheDocument();
  });

  it('prompts for a word while the empty slot is active', () => {
    renderWithProviders(<SlotBox slot={SUBJECT} isActive onClear={() => {}} />);

    expect(screen.getByText('choose…')).toBeInTheDocument();
    expect(screen.queryByText('empty')).not.toBeInTheDocument();
  });

  it('marks only required slots with an asterisk', () => {
    renderWithProviders(<SlotBox slot={DIRECT_OBJECT} isActive={false} onClear={() => {}} />);

    expect(screen.getByText('Direct object')).toBeInTheDocument();
    expect(screen.getByTestId('box-directObject')).not.toHaveTextContent('*');
  });

  it('gives the verb box no heading', () => {
    renderWithProviders(<SlotBox slot={VERB} isActive={false} onClear={() => {}} />);

    expect(screen.getByTestId('box-verb')).not.toHaveTextContent('Verb');
  });

  it('shows the given empty content in place of the placeholder', () => {
    renderWithProviders(
      <SlotBox
        slot={SUBJECT}
        isActive
        onClear={() => {}}
        emptyContent={<input aria-label="Pick a subject" />}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Pick a subject' })).toBeInTheDocument();
    expect(screen.queryByText('choose…')).not.toBeInTheDocument();
  });

  it('shows the category switch only while the slot is empty', () => {
    const toggle = <span>category switch</span>;
    const { rerender } = renderWithProviders(
      <SlotBox slot={SUBJECT} isActive={false} onClear={() => {}} categoryToggle={toggle} />,
    );
    expect(screen.getByText('category switch')).toBeInTheDocument();

    rerender(
      <SlotBox
        slot={SUBJECT}
        concept={CAT}
        isActive={false}
        onClear={() => {}}
        categoryToggle={toggle}
      />,
    );
    expect(screen.queryByText('category switch')).not.toBeInTheDocument();
  });

  it('shows a filled slot as its word and footer, with a clear button', () => {
    const onClear = vi.fn();
    renderWithProviders(
      <SlotBox
        slot={SUBJECT}
        concept={CAT}
        isActive={false}
        onClear={onClear}
        footer={<span>relation chip</span>}
      />,
    );

    expect(screen.getByText('cat')).toBeInTheDocument();
    expect(screen.getByText('relation chip')).toBeInTheDocument();
    expect(screen.queryByText('empty')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Subject' }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('keeps a press on the clear button from starting a box drag', () => {
    const onCanvasPointerDown = vi.fn();
    renderWithProviders(
      <div onPointerDown={onCanvasPointerDown}>
        <SlotBox slot={SUBJECT} concept={CAT} isActive={false} onClear={() => {}} />
      </div>,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Clear Subject' }));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });

  it('swaps the word for the picker while a filled slot is being edited', () => {
    renderWithProviders(
      <SlotBox
        slot={SUBJECT}
        concept={CAT}
        isActive
        editing
        onClear={() => {}}
        emptyContent={<input aria-label="Pick a subject" />}
        categoryToggle={<span>category switch</span>}
        footer={<span>relation chip</span>}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Pick a subject' })).toBeInTheDocument();
    expect(screen.queryByText('cat')).not.toBeInTheDocument();
    expect(screen.queryByText('relation chip')).not.toBeInTheDocument();
    // A re-pick keeps the word's class, so the on-box switch stays hidden.
    expect(screen.queryByText('category switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear Subject' })).not.toBeInTheDocument();
  });

  it('shows a dimmed link target without a clear button', () => {
    renderWithProviders(
      <SlotBox slot={SUBJECT} concept={CAT} isActive={false} dimmed onClear={() => {}} />,
    );

    expect(screen.getByText('cat')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear Subject' })).not.toBeInTheDocument();
  });

  it('renders the heading and word in the UI language, keeping the English name for clearing', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(
      <SlotBox
        slot={{ ...SUBJECT, labelKey: 'slot.subject' }}
        concept={CAT}
        isActive={false}
        onClear={() => {}}
      />,
      { 'slot.subject': { it: 'Soggetto' } },
    );

    const box = screen.getByTestId('box-subject');
    expect(box).toHaveTextContent('Soggetto *');
    expect(box).toHaveTextContent('gatto');
    expect(screen.getByRole('button', { name: 'Clear Subject' })).toBeInTheDocument();
  });
});

function satellite(overrides: Partial<SatelliteIcon> = {}): SatelliteIcon {
  return {
    key: 'subjectAdjective',
    icon: <span data-testid="satellite-glyph" />,
    label: 'Adjective',
    active: false,
    isSet: false,
    valued: false,
    onToggle: () => {},
    ...overrides,
  };
}

describe('SatelliteButton', () => {
  it.each<[string, Partial<SatelliteIcon>, string]>([
    ['a collapsed empty satellite offers to show it', {}, 'Show Adjective'],
    [
      'an expanded satellite offers to hide it, even when set',
      { active: true, isSet: true, valueLabel: 'big' },
      'Hide Adjective',
    ],
    [
      'a collapsed set satellite reads its value',
      { isSet: true, valueLabel: 'big' },
      'Adjective: big',
    ],
    [
      'a collapsed always-valued satellite reads its value at the default',
      { label: 'Number', valued: true, valueLabel: 'singular' },
      'Number: singular',
    ],
    [
      'a satellite with no value label falls back to show',
      { label: 'Number', valued: true },
      'Show Number',
    ],
  ])('%s', (_, overrides, name) => {
    render(<SatelliteButton sat={satellite(overrides)} color="primary" />);

    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });

  it('renders its icon and toggles on click', () => {
    const onToggle = vi.fn();
    render(<SatelliteButton sat={satellite({ onToggle })} color="primary" />);
    const button = screen.getByTestId('satellite-subjectAdjective');

    expect(button).toContainElement(screen.getByTestId('satellite-glyph'));
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('keeps a press from starting a box drag', () => {
    const onCanvasPointerDown = vi.fn();
    render(
      <div onPointerDown={onCanvasPointerDown}>
        <SatelliteButton sat={satellite()} color="primary" />
      </div>,
    );

    fireEvent.pointerDown(screen.getByTestId('satellite-subjectAdjective'));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });

  it('squares off a direct toggle so its shape sets it apart from a reveal', () => {
    render(
      <>
        <SatelliteButton sat={satellite({ key: 'reveal' })} color="primary" />
        <SatelliteButton sat={satellite({ key: 'flip', directToggle: true })} color="primary" />
      </>,
    );

    expect(getComputedStyle(screen.getByTestId('satellite-reveal')).borderRadius).toBe('50%');
    expect(getComputedStyle(screen.getByTestId('satellite-flip')).borderRadius).not.toBe('50%');
  });
});

describe('SatelliteRow', () => {
  it('renders one button per satellite, in order', () => {
    const onNumber = vi.fn();
    render(
      <SatelliteRow
        color="warning"
        satellites={[
          satellite({ key: 'number', label: 'Number', valued: true, onToggle: onNumber }),
          satellite({ key: 'gender', label: 'Gender', valued: true }),
          satellite({ key: 'adjective', label: 'Adjective' }),
        ]}
      />,
    );

    expect(screen.getAllByRole('button').map((b) => b.dataset['testid'])).toEqual([
      'satellite-number',
      'satellite-gender',
      'satellite-adjective',
    ]);
    fireEvent.click(screen.getByTestId('satellite-number'));
    expect(onNumber).toHaveBeenCalledOnce();
  });
});

describe('ToggleBox', () => {
  it('shows its label over its value', () => {
    render(<ToggleBox label="Polarity" value="Negative" />);

    expect(screen.getByText('Polarity')).toBeInTheDocument();
    expect(screen.getByText('Negative')).toBeInTheDocument();
  });
});

describe('DeterminerToggleBox', () => {
  it.each<[Definiteness, string]>([
    ['definite', 'Definite'],
    ['many', 'Multal'],
    // `bare` spells no word at all; the box still names it rather than showing a dash.
    ['bare', 'Zero'],
  ])('names %s as the menu does', (value, name) => {
    renderWithProviders(<DeterminerToggleBox value={value} />);

    expect(screen.getByText('Determiner')).toBeInTheDocument();
    expect(screen.getByText(name)).toBeInTheDocument();
  });
});

// The selectors mark the current choice by filling its button; the rest stay unfilled.
// jsdom reports a computed `transparent` in its serialized form.
const hasTransparentBackground = (el: Element) =>
  getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)';

describe('SpecifierSelector', () => {
  it('offers every spatial relation, in order', () => {
    render(<SpecifierSelector value="in" onSelect={() => {}} />);

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(
      PATH_SPECIFIERS.map((s) => PATH_SPECIFIER_LABELS[s]),
    );
  });

  it('selects the relation clicked', () => {
    const onSelect = vi.fn();
    render(<SpecifierSelector value="in" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'in front of' }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('in_front_of');
  });

  it('highlights only the current relation', () => {
    render(<SpecifierSelector value="under" onSelect={() => {}} />);

    const highlighted = screen
      .getAllByRole('button')
      .filter((b) => !hasTransparentBackground(b))
      .map((b) => b.getAttribute('aria-label'));
    expect(highlighted).toEqual(['under']);
  });

  it('keeps a press from starting a box drag', () => {
    const onCanvasPointerDown = vi.fn();
    render(
      <div onPointerDown={onCanvasPointerDown}>
        <SpecifierSelector value="in" onSelect={() => {}} />
      </div>,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: 'over' }));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });
});

describe('SentimentSelector', () => {
  it('offers every stance, in order', () => {
    render(<SentimentSelector value="neutral" onSelect={() => {}} />);

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(
      CAUSE_SENTIMENTS.map((s) => CAUSE_SENTIMENT_LABELS[s]),
    );
  });

  it('selects the stance clicked', () => {
    const onSelect = vi.fn();
    render(<SentimentSelector value="neutral" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: CAUSE_SENTIMENT_LABELS.positive }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('positive');
  });

  it('highlights only the current stance', () => {
    render(<SentimentSelector value="negative" onSelect={() => {}} />);

    const highlighted = screen
      .getAllByRole('button')
      .filter((b) => !hasTransparentBackground(b))
      .map((b) => b.getAttribute('aria-label'));
    expect(highlighted).toEqual([CAUSE_SENTIMENT_LABELS.negative]);
  });
});

describe('TenseToggleBox', () => {
  it.each(TENSES)('shows %s under the Tense heading', (tense) => {
    render(<TenseToggleBox value={tense} />);

    expect(screen.getByText('Tense')).toBeInTheDocument();
    expect(screen.getByText(TENSE_LABELS[tense])).toBeInTheDocument();
  });

  it('styles only a marked tense as set', () => {
    const { container, rerender } = render(<TenseToggleBox value="present" />);
    const border = () => getComputedStyle(container.firstElementChild!).borderColor;
    const unmarked = border();

    rerender(<TenseToggleBox value="past" />);

    expect(border()).not.toBe(unmarked);
  });
});

describe('AspectToggleBox', () => {
  it.each(ASPECTS)('shows %s under the Aspect heading', (aspect) => {
    render(<AspectToggleBox value={aspect} />);

    expect(screen.getByText('Aspect')).toBeInTheDocument();
    expect(screen.getByText(ASPECT_LABELS[aspect])).toBeInTheDocument();
  });

  it('styles only a marked aspect as set', () => {
    const { container, rerender } = render(<AspectToggleBox value="neutral" />);
    const border = () => getComputedStyle(container.firstElementChild!).borderColor;
    const unmarked = border();

    rerender(<AspectToggleBox value="progressive" />);

    expect(border()).not.toBe(unmarked);
  });
});
