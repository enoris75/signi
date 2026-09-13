import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';
import { GroupPerimeterControls } from '../src/components/PhraseBuilder/GroupPerimeterControls.tsx';
import type { NounKey } from '../src/components/PhraseBuilder/interfaces.ts';
import type { PerimeterEntry } from '../src/components/PhraseBuilder/satellites.tsx';

// A set control fills with its slot colour; the tests render without the app theme, so these are
// MUI's default palette mains.
const PRIMARY = 'rgb(25, 118, 210)';
const SUCCESS = 'rgb(46, 125, 50)';

// The subject's dotted box spans 100..300 across and 40..160 down, around its adjective too.
const SUBJECT_GROUP: GroupRect = {
  x: 100,
  y: 40,
  width: 200,
  height: 120,
  label: 'Subject',
  color: '#2c4a6e',
  nodeKeys: ['subjectAdjective', 'subject'],
};

const OBJECT_GROUP: GroupRect = {
  x: 400,
  y: 60,
  width: 160,
  height: 100,
  label: 'Direct object',
  color: '#3a6e3a',
  nodeKeys: ['directObject'],
};

function satellite(key: string, overrides: Partial<SatelliteIcon> = {}): SatelliteIcon {
  return {
    key,
    icon: <span />,
    label: key,
    active: false,
    isSet: true,
    valued: false,
    onToggle: () => {},
    ...overrides,
  };
}

const everyControl = (noun: NounKey): PerimeterEntry => ({
  relative: satellite(`${noun}Relative`),
  possessor: satellite(`${noun}Possessor`),
  conjunct: satellite(`${noun}Conjunct`),
});

function renderControls(overrides: Partial<ComponentProps<typeof GroupPerimeterControls>> = {}) {
  const handlers = {
    registerSourceAnchor: vi.fn(),
    registerTargetAnchor: vi.fn(),
    registerPossessorControl: vi.fn(),
    registerConjunctControl: vi.fn(),
  };
  const view = render(
    <GroupPerimeterControls
      groupRects={[SUBJECT_GROUP, OBJECT_GROUP]}
      perimeterByNoun={{}}
      {...handlers}
      {...overrides}
    />,
  );
  return { ...view, ...handlers };
}

const buttons = () => screen.queryAllByRole('button').map((b) => b.dataset['testid']);

// The element last registered for `noun` through `register`.
const registered = (register: ReturnType<typeof vi.fn>, noun: NounKey) =>
  register.mock.calls.filter(([n, el]) => n === noun && el).at(-1)?.[1] as HTMLElement | undefined;

describe('GroupPerimeterControls', () => {
  it('lines up a noun’s relative, possessor and coordination controls, in that order', () => {
    renderControls({ perimeterByNoun: { subject: everyControl('subject') } });

    expect(buttons()).toEqual([
      'satellite-subjectRelative',
      'satellite-subjectPossessor',
      'satellite-subjectConjunct',
    ]);
  });

  it('centres the control row on the bottom edge of the noun’s dotted box', () => {
    renderControls({ perimeterByNoun: { subject: everyControl('subject') } });

    const row = getComputedStyle(screen.getByTestId('relative-ctl-subject').parentElement!);
    expect(row.position).toBe('absolute');
    expect(row.left).toBe('200px');
    expect(row.top).toBe('160px');
    expect(row.transform).toBe('translate(-50%, -50%)');
  });

  it.each(['relative', 'possessor', 'conjunct'] as const)(
    'shows a lone %s control without the others',
    (kind) => {
      renderControls({ perimeterByNoun: { subject: { [kind]: satellite(kind) } } });

      expect(buttons()).toEqual([`satellite-${kind}`]);
    },
  );

  it('draws nothing for a noun with no controls and no incoming link', () => {
    const { container, registerTargetAnchor } = renderControls({
      perimeterByNoun: { subject: {} },
    });

    expect(container.firstElementChild).toBeEmptyDOMElement();
    expect(registered(registerTargetAnchor, 'subject')).toBeUndefined();
  });

  it('skips a noun whose dotted box is not measured yet', () => {
    const { registerTargetAnchor, registerPossessorControl } = renderControls({
      groupRects: [OBJECT_GROUP],
      perimeterByNoun: { subject: everyControl('subject') },
      linkTargetKeys: new Set<NounKey>(['subject']),
    });

    expect(buttons()).toEqual([]);
    expect(registerTargetAnchor).not.toHaveBeenCalled();
    expect(registerPossessorControl).not.toHaveBeenCalled();
  });

  it('registers each control as the start of its connector, and releases it on unmount', () => {
    const { registerSourceAnchor, registerPossessorControl, registerConjunctControl, unmount } =
      renderControls({ perimeterByNoun: { subject: everyControl('subject') } });

    expect(registered(registerSourceAnchor, 'subject')).toBe(
      screen.getByTestId('relative-ctl-subject'),
    );
    expect(registered(registerPossessorControl, 'subject')).toBe(
      screen.getByTestId('possessor-ctl-subject'),
    );
    expect(registered(registerConjunctControl, 'subject')).toBe(
      screen.getByTestId('satellite-subjectConjunct').parentElement,
    );

    unmount();

    expect(registerSourceAnchor).toHaveBeenLastCalledWith('subject', null);
    expect(registerPossessorControl).toHaveBeenLastCalledWith('subject', null);
    expect(registerConjunctControl).toHaveBeenLastCalledWith('subject', null);
  });

  it('places a receiving dot on the top edge of a link target’s dotted box', () => {
    const { registerTargetAnchor } = renderControls({
      linkTargetKeys: new Set<NounKey>(['subject']),
    });

    const dot = getComputedStyle(registered(registerTargetAnchor, 'subject')!);
    expect(dot.left).toBe('200px');
    expect(dot.top).toBe('40px');
    expect(dot.transform).toBe('translate(-50%, -50%)');
    expect(buttons()).toEqual([]);
  });

  it('gives a receiving dot only to the nouns a link lands on', () => {
    const { registerTargetAnchor } = renderControls({
      perimeterByNoun: {
        subject: everyControl('subject'),
        directObject: everyControl('directObject'),
      },
      linkTargetKeys: new Set<NounKey>(['directObject']),
    });

    expect(registered(registerTargetAnchor, 'directObject')).toBeInstanceOf(HTMLElement);
    expect(registered(registerTargetAnchor, 'subject')).toBeUndefined();
  });

  it('colours the controls and the dot after the noun’s slot', () => {
    const { registerTargetAnchor } = renderControls({
      perimeterByNoun: {
        subject: everyControl('subject'),
        directObject: everyControl('directObject'),
      },
      linkTargetKeys: new Set<NounKey>(['subject', 'directObject']),
    });
    const fill = (el: Element) => getComputedStyle(el).backgroundColor;

    expect(fill(screen.getByTestId('satellite-subjectPossessor'))).toBe(PRIMARY);
    expect(fill(registered(registerTargetAnchor, 'subject')!)).toBe(PRIMARY);
    expect(fill(screen.getByTestId('satellite-directObjectRelative'))).toBe(SUCCESS);
    expect(fill(registered(registerTargetAnchor, 'directObject')!)).toBe(SUCCESS);
  });

  it('renders in a standalone period, with no workspace to register links with', () => {
    render(
      <GroupPerimeterControls
        groupRects={[SUBJECT_GROUP]}
        perimeterByNoun={{ subject: everyControl('subject') }}
        linkTargetKeys={new Set<NounKey>(['subject'])}
        registerPossessorControl={() => {}}
        registerConjunctControl={() => {}}
      />,
    );

    expect(screen.getByTestId('relative-ctl-subject')).toBeInTheDocument();
  });

  it('toggles the satellite whose control is clicked', () => {
    const onPossessor = vi.fn();
    const onConjunct = vi.fn();
    renderControls({
      perimeterByNoun: {
        subject: {
          possessor: satellite('subjectPossessor', { onToggle: onPossessor }),
          conjunct: satellite('subjectConjunct', { onToggle: onConjunct }),
        },
      },
    });

    fireEvent.click(screen.getByTestId('satellite-subjectConjunct'));

    expect(onConjunct).toHaveBeenCalledOnce();
    expect(onPossessor).not.toHaveBeenCalled();
  });
});
