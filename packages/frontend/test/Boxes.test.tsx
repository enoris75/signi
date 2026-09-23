import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import {
  ASPECTS,
  CAUSE_SENTIMENTS,
  PATH_SPECIFIERS,
  TEMPORAL_RELATIONS,
  TENSES,
  type CauseSentiment,
  type Concept,
  type Definiteness,
  type PathSpecifier,
} from '@signi/shared';
import {
  AspectToggleBox,
  CategoryToggle,
  DeterminerToggleBox,
  SatelliteButton,
  SentimentSelector,
  SlotBox,
  SpecifierSelector,
  TEMPORAL_KEYS,
  TemporalSelector,
  TenseToggleBox,
  ToggleBox,
  type SatelliteIcon,
} from '../src/components/PhraseBuilder/Boxes.tsx';
import type { SlotCategory, SlotConfig } from '../src/components/PhraseBuilder/interfaces.ts';
import { renderWithProviders } from './render.tsx';

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
      { strings: { 'category.noun': { it: 'Nome' }, 'category.pronoun': { it: 'Pronome' } } },
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

  // A circle is sized from its content's diagonal, so a long heading laid on one line swells the
  // ring far past the word it names. `max-content` is what keeps the wrap out of the measuring
  // loop: the heading breaks at its own width capped by the picker's, never at the width the
  // layout happens to be offering it this commit — that fed the ring's size back into itself.
  it('wraps a heading inside a circle at a fixed width, and leaves a plain box alone', () => {
    const heading = (ui: ReactElement) => {
      const { unmount } = renderWithProviders(ui);
      const style = getComputedStyle(screen.getByText('Direct object'));
      const read = { whiteSpace: style.whiteSpace, width: style.width, maxWidth: style.maxWidth };
      unmount();
      return read;
    };

    expect(
      heading(
        <SlotBox
          slot={DIRECT_OBJECT}
          isActive={false}
          onClear={() => {}}
          shape={{ r: 60, kind: 'ring' }}
        />,
      ),
    ).toEqual({ whiteSpace: 'normal', width: 'max-content', maxWidth: '100px' });

    // The plain box grows sideways at no cost, so it keeps its heading on one line.
    expect(
      heading(<SlotBox slot={DIRECT_OBJECT} isActive={false} onClear={() => {}} />),
    ).toEqual({ whiteSpace: '', width: 'auto', maxWidth: 'none' });
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

  // Rendered with MUI's default theme, whose primary is rgb(25, 118, 210); a set box wears it at
  // the theme's 0.08 selected opacity, and the box in hand at 2.5× that.
  it('washes a filled box in its slot colour, and the box in hand deeper still', () => {
    const background = (ui: ReactElement) => {
      const { unmount } = renderWithProviders(ui);
      const paper = screen.getByTestId('box-subject').firstElementChild!;
      const color = getComputedStyle(paper).backgroundColor;
      unmount();
      return color;
    };
    const wash = 'rgba(25, 118, 210, 0.08)';
    const held = 'rgba(25, 118, 210, 0.2)';

    expect(background(<SlotBox slot={SUBJECT} concept={CAT} isActive={false} onClear={() => {}} />))
      .toBe(wash);
    expect(background(<SlotBox slot={SUBJECT} isActive={false} onClear={() => {}} />)).not.toBe(
      wash,
    );
    // The box in hand is told apart from its neighbours whether or not it holds a word — a click
    // that only selects a filled box has to show for itself.
    expect(background(<SlotBox slot={SUBJECT} isActive onClear={() => {}} />)).toBe(held);
    expect(background(<SlotBox slot={SUBJECT} concept={CAT} isActive onClear={() => {}} />)).toBe(
      held,
    );
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

  it('renders the heading, the word and its clear button in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(
      <SlotBox
        slot={{ ...SUBJECT, labelKey: 'slot.subject' }}
        concept={CAT}
        isActive={false}
        onClear={() => {}}
      />,
      {
        strings: {
          'slot.subject': { it: 'Soggetto' },
          'action.clear.subject': { it: 'Cancella il soggetto' },
        },
      },
    );

    const box = screen.getByTestId('box-subject');
    expect(box).toHaveTextContent('Soggetto *');
    expect(box).toHaveTextContent('gatto');
    expect(screen.getByRole('button', { name: 'Cancella il soggetto' })).toBeInTheDocument();
  });

  it('names the part it clears, while the bundle loads', () => {
    renderWithProviders(
      <SlotBox slot={{ ...SUBJECT, labelKey: 'slot.subject' }} concept={CAT} isActive={false} onClear={() => {}} />,
    );

    expect(screen.getByRole('button', { name: 'Clear the subject' })).toBeInTheDocument();
  });

  it('prompts for a word in the UI language while the empty slot is active', () => {
    localStorage.setItem('signi:uiLanguage', 'de');
    renderWithProviders(<SlotBox slot={SUBJECT} isActive onClear={() => {}} />, {
      strings: { 'slot.choose': { de: 'wählen' } },
    });

    expect(screen.getByTestId('box-subject')).toHaveTextContent('wählen…');
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
    // A141: a link control reveals no box, so it is named by what it links, then by the link once made.
    [
      'a link control not yet linked is named by what it links',
      { label: 'Relative clause', link: true },
      'Relative clause',
    ],
    [
      'a linked link control reads the link',
      { label: 'Relative clause', link: true, isSet: true, valueLabel: 'Linked — click to remove' },
      'Relative clause: Linked — click to remove',
    ],
  ])('%s', (_, overrides, name) => {
    renderWithProviders(<SatelliteButton sat={satellite(overrides)} color="primary" />);

    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });

  it.each<[string, boolean, string]>([
    ['offers to show', false, 'Mostra l’aggettivo'],
    ['offers to hide', true, 'Nascondi l’aggettivo'],
  ])('names the part it %s in the UI language', (_, active, name) => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(
      <SatelliteButton sat={satellite({ labelKey: 'category.adjective', active })} color="primary" />,
      {
        strings: {
          'action.show.adjective': { it: 'Mostra l’aggettivo' },
          'action.hide.adjective': { it: 'Nascondi l’aggettivo' },
        },
      },
    );

    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });

  it('names an unlinked link control in the UI language, with no reveal verb', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(
      <SatelliteButton sat={satellite({ label: 'Proposizione relativa', link: true })} color="primary" />,
    );

    expect(screen.getByRole('button', { name: 'Proposizione relativa' })).toBeInTheDocument();
  });

  it('keeps the English label of a part the catalog does not name yet', () => {
    renderWithProviders(
      <SatelliteButton sat={satellite({ key: 'verbModal', label: 'Modal' })} color="primary" />,
    );

    expect(screen.getByRole('button', { name: 'Show Modal' })).toBeInTheDocument();
  });

  it('renders its icon and toggles on click', () => {
    const onToggle = vi.fn();
    renderWithProviders(<SatelliteButton sat={satellite({ onToggle })} color="primary" />);
    const button = screen.getByTestId('satellite-subjectAdjective');

    expect(button).toContainElement(screen.getByTestId('satellite-glyph'));
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('keeps a press from starting a box drag', () => {
    const onCanvasPointerDown = vi.fn();
    renderWithProviders(
      <div onPointerDown={onCanvasPointerDown}>
        <SatelliteButton sat={satellite()} color="primary" />
      </div>,
    );

    fireEvent.pointerDown(screen.getByTestId('satellite-subjectAdjective'));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });

  it('squares off a direct toggle so its shape sets it apart from a reveal', () => {
    renderWithProviders(
      <>
        <SatelliteButton sat={satellite({ key: 'reveal' })} color="primary" />
        <SatelliteButton sat={satellite({ key: 'flip', directToggle: true })} color="primary" />
      </>,
    );

    expect(getComputedStyle(screen.getByTestId('satellite-reveal')).borderRadius).toBe('50%');
    expect(getComputedStyle(screen.getByTestId('satellite-flip')).borderRadius).not.toBe('50%');
  });
});

describe('ToggleBox', () => {
  it('shows its label over its value', () => {
    render(<ToggleBox label="Polarity" value="Negative" />);

    expect(screen.getByText('Polarity')).toBeInTheDocument();
    expect(screen.getByText('Negative')).toBeInTheDocument();
  });

  it('as a disc on an orbit, says only its value, naming itself in a tooltip', () => {
    const { container } = render(<ToggleBox label="Tense" value="Past" disc={24} />);

    expect(screen.queryByText('Tense')).not.toBeInTheDocument();
    expect(screen.getByText('Past')).toBeInTheDocument();
    expect(screen.getByTitle('Tense: Past')).toBeInTheDocument();
    const circle = getComputedStyle(container.querySelector('.slot-circle')!);
    expect(circle.width).toBe('48px');
    expect(circle.borderRadius).toBe('50%');
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
// The two toolbars name their relations with the catalog's words (C13), so these are the English
// fallbacks the components show while the bundle is in flight — not a table the app still keeps.
// A specifier is the adposition its language spells the relation with; a sentiment is the stance
// plus the connector it picks, joined with a dash.
const SPECIFIER_LABEL: Record<PathSpecifier, string> = {
  in: 'in',
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
  on: 'on',
  between: 'between',
  against: 'against',
};
const SENTIMENT_LABEL: Record<CauseSentiment, string> = {
  neutral: 'Neutral — because of',
  negative: 'Negative — through the fault of',
  positive: 'Positive — thanks to',
};

// jsdom reports a computed `transparent` in its serialized form.
const hasTransparentBackground = (el: Element) =>
  getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)';

describe('SpecifierSelector', () => {
  it('offers every spatial relation, in order', () => {
    renderWithProviders(<SpecifierSelector value="in" onSelect={() => {}} />);

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(
      PATH_SPECIFIERS.map((s) => SPECIFIER_LABEL[s]),
    );
  });

  // P09-E1: support, a landmark on each side, and contact join the seven.
  it('offers ten relations, the last three on, between and against', () => {
    renderWithProviders(<SpecifierSelector value="in" onSelect={() => {}} />);

    const labels = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));
    expect(labels).toHaveLength(10);
    expect(labels.slice(-3)).toEqual(['on', 'between', 'against']);
  });

  it('selects the relation clicked', () => {
    const onSelect = vi.fn();
    renderWithProviders(<SpecifierSelector value="in" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'in front of' }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('in_front_of');
  });

  it('highlights only the current relation', () => {
    renderWithProviders(<SpecifierSelector value="under" onSelect={() => {}} />);

    const highlighted = screen
      .getAllByRole('button')
      .filter((b) => !hasTransparentBackground(b))
      .map((b) => b.getAttribute('aria-label'));
    expect(highlighted).toEqual(['under']);
  });

  it('keeps a press from starting a box drag', () => {
    const onCanvasPointerDown = vi.fn();
    renderWithProviders(
      <div onPointerDown={onCanvasPointerDown}>
        <SpecifierSelector value="in" onSelect={() => {}} />
      </div>,
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: 'over' }));

    expect(onCanvasPointerDown).not.toHaveBeenCalled();
  });

  it('seats each relation where its ring places it, leaving out any it has no seat for', () => {
    const seats: Partial<Record<(typeof PATH_SPECIFIERS)[number], { x: number; y: number }>> = {
      in: { x: 120, y: 30 },
      over: { x: 150, y: 24 },
    };
    renderWithProviders(<SpecifierSelector value="in" onSelect={() => {}} placeAt={(s) => seats[s]} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['in', 'over']);
    const seat = getComputedStyle(buttons[1].parentElement!);
    expect({ left: seat.left, top: seat.top }).toEqual({ left: '150px', top: '24px' });
  });
});

// P09-E12b: the temporal complement's relations, the route's toolbar with a set of its own.
describe('TemporalSelector', () => {
  it('offers the six temporal relations, in order, each by its word', () => {
    renderWithProviders(<TemporalSelector value="at" onSelect={() => {}} />);

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'at', 'ago', 'until', 'after', 'before', 'during',
    ]);
    expect(TEMPORAL_RELATIONS).toHaveLength(6);
  });

  it('answers to a letter heard in each word — A, G, U, F, B, D', () => {
    renderWithProviders(<TemporalSelector value="at" onSelect={() => {}} />);

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-keyshortcuts'))).toEqual([
      'A', 'G', 'U', 'F', 'B', 'D',
    ]);
    expect(new Set(Object.values(TEMPORAL_KEYS)).size).toBe(6);
  });

  it('selects the relation clicked, and highlights only the current one', () => {
    const onSelect = vi.fn();
    renderWithProviders(<TemporalSelector value="until" onSelect={onSelect} />);

    const highlighted = screen
      .getAllByRole('button')
      .filter((b) => !hasTransparentBackground(b))
      .map((b) => b.getAttribute('aria-label'));
    expect(highlighted).toEqual(['until']);

    fireEvent.click(screen.getByRole('button', { name: 'ago' }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('ago');
  });
});

describe('SentimentSelector', () => {
  it('offers every stance, in order', () => {
    renderWithProviders(<SentimentSelector value="neutral" onSelect={() => {}} />);

    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(
      CAUSE_SENTIMENTS.map((s) => SENTIMENT_LABEL[s]),
    );
  });

  it('selects the stance clicked', () => {
    const onSelect = vi.fn();
    renderWithProviders(<SentimentSelector value="neutral" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: SENTIMENT_LABEL.positive }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('positive');
  });

  it('highlights only the current stance', () => {
    renderWithProviders(<SentimentSelector value="negative" onSelect={() => {}} />);

    const highlighted = screen
      .getAllByRole('button')
      .filter((b) => !hasTransparentBackground(b))
      .map((b) => b.getAttribute('aria-label'));
    expect(highlighted).toEqual([SENTIMENT_LABEL.negative]);
  });
});

// MUI's default secondary, rgb(156, 39, 176), at the theme's 0.08 selected opacity.
const MARKED_WASH = 'rgba(156, 39, 176, 0.08)';

describe('TenseToggleBox', () => {
  it.each(TENSES)('shows %s under the Tense heading', (tense) => {
    renderWithProviders(<TenseToggleBox value={tense} />);

    expect(screen.getByText('Tense')).toBeInTheDocument();
    expect(screen.getByText(tense.replace(/^./, (c) => c.toUpperCase()))).toBeInTheDocument();
  });

  it('names the tense and its value in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'de');
    renderWithProviders(<TenseToggleBox value="past" />, {
      strings: { 'satellite.tense': { de: 'Tempus' }, 'tense.value.past': { de: 'Präteritum' } },
    });

    expect(screen.getByText('Tempus')).toBeInTheDocument();
    expect(screen.getByText('Präteritum')).toBeInTheDocument();
  });

  it('styles only a marked tense as set, washed in the secondary colour', () => {
    const { container, rerender } = renderWithProviders(<TenseToggleBox value="present" />);
    const style = () => getComputedStyle(container.firstElementChild!);
    const unmarked = style().borderColor;
    expect(style().backgroundColor).not.toBe(MARKED_WASH);

    rerender(<TenseToggleBox value="past" />);

    expect(style().borderColor).not.toBe(unmarked);
    expect(style().backgroundColor).toBe(MARKED_WASH);
  });
});

describe('AspectToggleBox', () => {
  it.each(ASPECTS)('shows %s under the Aspect heading', (aspect) => {
    renderWithProviders(<AspectToggleBox value={aspect} />);

    expect(screen.getByText('Aspect')).toBeInTheDocument();
    expect(screen.getByText(aspect.replace(/^./, (c) => c.toUpperCase()))).toBeInTheDocument();
  });

  it('names the aspect and its value in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderWithProviders(<AspectToggleBox value="progressive" />, {
      strings: { 'satellite.aspect': { it: 'Aspetto' }, 'aspect.value.progressive': { it: 'Progressivo' } },
    });

    expect(screen.getByText('Aspetto')).toBeInTheDocument();
    expect(screen.getByText('Progressivo')).toBeInTheDocument();
  });

  it('styles only a marked aspect as set, washed in the secondary colour', () => {
    const { container, rerender } = renderWithProviders(<AspectToggleBox value="neutral" />);
    const style = () => getComputedStyle(container.firstElementChild!);
    const unmarked = style().borderColor;
    expect(style().backgroundColor).not.toBe(MARKED_WASH);

    rerender(<AspectToggleBox value="progressive" />);

    expect(style().borderColor).not.toBe(unmarked);
    expect(style().backgroundColor).toBe(MARKED_WASH);
  });
});
