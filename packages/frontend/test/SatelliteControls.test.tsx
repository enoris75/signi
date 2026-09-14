import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from './render.tsx';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';
import { SatelliteControls } from '../src/components/PhraseBuilder/SatelliteControls.tsx';
import { clearControlKey } from '../src/components/PhraseBuilder/ringSpecs.ts';

// A set satellite fills its button with the slot colour; the tests render without the app
// theme, so these are MUI's default palette mains.
const PRIMARY = 'rgb(25, 118, 210)';
const SECONDARY = 'rgb(156, 39, 176)';
const SUCCESS = 'rgb(46, 125, 50)';

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

const control = (key: string) => screen.getByTestId(`satellite-${key}`);
// The positioned wrapper each control sits in.
const anchor = (key: string) => getComputedStyle(control(key).parentElement!);

describe('SatelliteControls', () => {
  it('renders one control per satellite, box by box', () => {
    renderWithProviders(
      <SatelliteControls
        clearControls={[]}
        satelliteIconsByParent={{
          subject: [satellite('subjectAdjective'), satellite('subjectNumber')],
          verb: [satellite('verbAdverb')],
        }}
        controlPos={{
          subjectAdjective: { x: 1, y: 1 },
          subjectNumber: { x: 2, y: 2 },
          verbAdverb: { x: 3, y: 3 },
        }}
      />,
    );

    expect(screen.getAllByRole('button').map((b) => b.dataset['testid'])).toEqual([
      'satellite-subjectAdjective',
      'satellite-subjectNumber',
      'satellite-verbAdverb',
    ]);
  });

  it('centres each control on its canvas position', () => {
    renderWithProviders(
      <SatelliteControls
        clearControls={[]}
        satelliteIconsByParent={{ subject: [satellite('subjectAdjective')] }}
        controlPos={{ subjectAdjective: { x: 140, y: 62 } }}
      />,
    );

    const style = anchor('subjectAdjective');
    expect(style.position).toBe('absolute');
    expect(style.left).toBe('140px');
    expect(style.top).toBe('62px');
    expect(style.transform).toBe('translate(-50%, -50%)');
  });

  it('leaves out a satellite that has no position yet', () => {
    renderWithProviders(
      <SatelliteControls
        clearControls={[]}
        satelliteIconsByParent={{
          subject: [satellite('subjectAdjective'), satellite('subjectNumber')],
        }}
        controlPos={{ subjectNumber: { x: 10, y: 10 } }}
      />,
    );

    expect(screen.queryByTestId('satellite-subjectAdjective')).not.toBeInTheDocument();
    expect(control('subjectNumber')).toBeInTheDocument();
  });

  it('colours each control after the slot of the box it rides', () => {
    renderWithProviders(
      <SatelliteControls
        clearControls={[]}
        satelliteIconsByParent={{
          verb: [satellite('verbAdverb')],
          directObject: [satellite('directObjectAdjective')],
        }}
        controlPos={{ verbAdverb: { x: 0, y: 0 }, directObjectAdjective: { x: 0, y: 0 } }}
      />,
    );

    expect(getComputedStyle(control('verbAdverb')).backgroundColor).toBe(SECONDARY);
    expect(getComputedStyle(control('directObjectAdjective')).backgroundColor).toBe(SUCCESS);
  });

  it('falls back to the primary colour for a box that is not a slot', () => {
    renderWithProviders(
      <SatelliteControls
        clearControls={[]}
        satelliteIconsByParent={{ tense: [satellite('tenseAdverb')] }}
        controlPos={{ tenseAdverb: { x: 0, y: 0 } }}
      />,
    );

    expect(getComputedStyle(control('tenseAdverb')).backgroundColor).toBe(PRIMARY);
  });

  it('toggles the satellite whose control is clicked', () => {
    const onAdjective = vi.fn();
    const onNumber = vi.fn();
    renderWithProviders(
      <SatelliteControls
        clearControls={[]}
        satelliteIconsByParent={{
          subject: [
            satellite('subjectAdjective', { onToggle: onAdjective }),
            satellite('subjectNumber', { onToggle: onNumber }),
          ],
        }}
        controlPos={{ subjectAdjective: { x: 0, y: 0 }, subjectNumber: { x: 0, y: 0 } }}
      />,
    );

    fireEvent.click(control('subjectNumber'));

    expect(onNumber).toHaveBeenCalledOnce();
    expect(onAdjective).not.toHaveBeenCalled();
  });

  it("seats each word's clear button on its solid ring, and clears that word", () => {
    const onClearSubject = vi.fn();
    const onClearVerb = vi.fn();
    renderWithProviders(
      <div onPointerDown={() => onClearVerb('dragged')}>
        <SatelliteControls
          satelliteIconsByParent={{}}
          clearControls={[
            { mainKey: 'subject', label: 'Subject', onClear: onClearSubject },
            { mainKey: 'verb', label: 'Verb', onClear: onClearVerb },
          ]}
          controlPos={{ [clearControlKey('subject')]: { x: 90, y: 30 } }}
        />
      </div>,
    );

    // The verb's clear button has no seat yet, so it is left out.
    expect(screen.queryByLabelText('Clear Verb')).not.toBeInTheDocument();
    const clear = screen.getByLabelText('Clear Subject');
    const style = getComputedStyle(clear);
    expect({ left: style.left, top: style.top }).toEqual({ left: '90px', top: '30px' });

    fireEvent.pointerDown(clear);
    fireEvent.click(clear);

    expect(onClearSubject).toHaveBeenCalledOnce();
    expect(onClearVerb).not.toHaveBeenCalled();
  });
});
