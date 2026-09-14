import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from './render.tsx';
import type { ComponentProps } from 'react';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';
import { GroupPerimeterControls } from '../src/components/PhraseBuilder/GroupPerimeterControls.tsx';
import type { NounKey } from '../src/components/PhraseBuilder/interfaces.ts';
import { perimeterControlKey } from '../src/components/PhraseBuilder/ringSpecs.ts';
import type { PerimeterEntry } from '../src/components/PhraseBuilder/satellites/index.ts';

// A set control fills with its slot colour; the tests render without the app theme, so these are
// MUI's default palette mains.
const PRIMARY = 'rgb(25, 118, 210)';
const SUCCESS = 'rgb(46, 125, 50)';

// Where the ring layout seated each noun's dotted-ring controls: the relations fanned along the
// bottom of the ring, the receiving dot at its top.
const CONTROL_POS = {
  [perimeterControlKey('relative', 'subject')]: { x: 178, y: 190 },
  [perimeterControlKey('possessor', 'subject')]: { x: 200, y: 192 },
  [perimeterControlKey('conjunct', 'subject')]: { x: 222, y: 190 },
  [perimeterControlKey('incoming', 'subject')]: { x: 200, y: 8 },
  [perimeterControlKey('relative', 'directObject')]: { x: 478, y: 190 },
  [perimeterControlKey('possessor', 'directObject')]: { x: 500, y: 192 },
  [perimeterControlKey('conjunct', 'directObject')]: { x: 522, y: 190 },
  [perimeterControlKey('incoming', 'directObject')]: { x: 500, y: 8 },
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
  };
  const view = renderWithProviders(
    <GroupPerimeterControls
      controlPos={CONTROL_POS}
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

const seat = (el: Element) => {
  const style = getComputedStyle(el);
  return { position: style.position, left: style.left, top: style.top, transform: style.transform };
};

describe('GroupPerimeterControls', () => {
  it('shows a noun’s relative, possessor and coordination controls', () => {
    renderControls({ perimeterByNoun: { subject: everyControl('subject') } });

    expect(buttons()).toEqual([
      'satellite-subjectRelative',
      'satellite-subjectPossessor',
      'satellite-subjectConjunct',
    ]);
  });

  it('centres each control where the ring layout seated it on the noun’s dotted ring', () => {
    renderControls({ perimeterByNoun: { subject: everyControl('subject') } });

    const center = { position: 'absolute', transform: 'translate(-50%, -50%)' };
    expect(seat(screen.getByTestId('relative-ctl-subject'))).toEqual({ ...center, left: '178px', top: '190px' });
    expect(seat(screen.getByTestId('possessor-ctl-subject'))).toEqual({ ...center, left: '200px', top: '192px' });
    expect(seat(screen.getByTestId('satellite-subjectConjunct').parentElement!)).toEqual({
      ...center,
      left: '222px',
      top: '190px',
    });
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

  it('skips a noun whose controls the ring layout has not seated', () => {
    const { registerSourceAnchor, registerTargetAnchor } = renderControls({
      controlPos: {},
      perimeterByNoun: { subject: everyControl('subject') },
      linkTargetKeys: new Set<NounKey>(['subject']),
    });

    expect(buttons()).toEqual([]);
    expect(registerTargetAnchor).not.toHaveBeenCalled();
    expect(registerSourceAnchor).not.toHaveBeenCalled();
  });

  it('registers the relative-clause control as the start of its link, and releases it on unmount', () => {
    const { registerSourceAnchor, unmount } =
      renderControls({ perimeterByNoun: { subject: everyControl('subject') } });

    expect(registered(registerSourceAnchor, 'subject')).toBe(
      screen.getByTestId('relative-ctl-subject'),
    );
    unmount();

    expect(registerSourceAnchor).toHaveBeenLastCalledWith('subject', null);
  });

  it('places a receiving dot where the ring layout seated it on a link target’s dotted ring', () => {
    const { registerTargetAnchor } = renderControls({
      linkTargetKeys: new Set<NounKey>(['subject']),
    });

    expect(seat(registered(registerTargetAnchor, 'subject')!)).toEqual({
      position: 'absolute',
      left: '200px',
      top: '8px',
      transform: 'translate(-50%, -50%)',
    });
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

  it('wears a colour it is handed in place of the noun’s own — a conjunct’s head, its role’s', () => {
    renderControls({
      perimeterByNoun: { subject: everyControl('subject') },
      recolor: { subject: 'success' },
    });

    expect(getComputedStyle(screen.getByTestId('satellite-subjectPossessor')).backgroundColor).toBe(
      SUCCESS,
    );
  });

  it('renders in a standalone period, with no workspace to register links with', () => {
    renderWithProviders(
      <GroupPerimeterControls
        controlPos={CONTROL_POS}
        perimeterByNoun={{ subject: everyControl('subject') }}
        linkTargetKeys={new Set<NounKey>(['subject'])}
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
