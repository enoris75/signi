import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createTheme } from '@mui/material';
import { onlineManager } from '@tanstack/react-query';
import type { Concept, LanguageCode } from '@signi/shared';
import { fetchConcepts } from '../src/api.ts';
import { WordMap } from '../src/components/WordMap/WordMap.tsx';
import { useUiLanguage } from '../src/i18n/LanguageContext.tsx';
import { renderWithProviders, type Seed, type SeededStrings } from './render.tsx';

// The corpus is seeded into the query cache; only the loading and failure cases fetch.
vi.mock('../src/api.ts');

const concept = (id: string, role: Concept['role'], extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: id.toLowerCase(),
  label: id.toLowerCase(),
  ...extra,
});

const SHIP = concept('SHIP', 'noun', { labels: { en: 'ship', it: 'nave' } });
const CARAVEL = concept('CARAVEL', 'noun', {
  isA: 'SHIP',
  labels: { en: 'caravel', it: 'caravella' },
});
const SLOOP = concept('SLOOP', 'noun', { isA: 'SHIP' });
const CAT = concept('CAT', 'noun');
const CUT = concept('CUT', 'verb', { complements: ['instrumental', 'locative'] });
const SLEEP = concept('SLEEP', 'verb', { complements: ['locative'] });

// Two `is a` edges into SHIP, three `complements` edges out of the verbs; CAT touches nothing.
const CORPUS = [SHIP, CARAVEL, SLOOP, CAT, CUT, SLEEP];

// useConcepts() with no role caches the whole corpus under 'all', a key Seed's role-keyed type
// does not name.
const corpus = (concepts: Concept[]) => ({ concepts: { all: concepts } }) as Seed;

// Lets a test change the UI language while the map is open.
function LanguageSwitch({ to }: { to: LanguageCode }) {
  const { setUiLanguage } = useUiLanguage();
  return (
    <button type="button" onClick={() => setUiLanguage(to)}>
      switch language
    </button>
  );
}

function renderMap({
  open = true,
  seed = corpus(CORPUS),
  strings = {},
}: { open?: boolean; seed?: Seed; strings?: SeededStrings } = {}) {
  const onClose = vi.fn();
  const view = renderWithProviders(
    <>
      <LanguageSwitch to="it" />
      <WordMap open={open} onClose={onClose} />
    </>,
    { ...seed, strings },
  );
  return { ...view, onClose };
}

const theme = createTheme();

// The drawing, if there is one: the SVG holding the arrowhead its `is a` connectors end in.
const drawing = () => document.getElementById('wordmap-arrow')?.closest('svg') ?? null;
const svg = () => drawing()!;
const canvas = () => svg().querySelector('g')!;
// A drawn word or complement: the group holding its pill and label.
const node = (label: string) => screen.getByText(label, { selector: 'text' }).parentElement!;
const labels = () => [...svg().querySelectorAll('text')].map((t) => t.textContent);
const connectors = () => [...svg().querySelectorAll('line')];
// The counts under the title, found by MUI's documented class for a caption.
const caption = () => screen.getByRole('heading').querySelector('.MuiTypography-caption')!;
const chip = (name: string) => screen.getByRole('button', { name });

const numbers = (text: string) => text.match(/-?[\d.]+(e-?\d+)?/g)!.map(Number);

// The last translate of the canvas transform carries the pan, offset by the framing centre.
function pan() {
  const [cx, cy, k, ox, oy] = numbers(canvas().getAttribute('transform')!);
  return { k, tx: ox + cx, ty: oy + cy };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('WordMap', () => {
  it('shows nothing while closed', () => {
    renderMap({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('titles the map and counts what it draws and what it leaves out', () => {
    renderMap();

    expect(screen.getByRole('dialog')).toHaveTextContent('Word Map');
    expect(caption()).toHaveTextContent(
      /^7 nodes · 5 relationships · 1 unconnected hidden word$/,
    );
  });

  it('counts a single relationship in the singular and drops the hidden count when none is', () => {
    renderMap({ seed: corpus([SHIP, CARAVEL]) });

    expect(caption()).toHaveTextContent(/^2 nodes · 1 relationship$/);
  });

  it('counts in the UI language', () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    renderMap({
      strings: {
        'wordMap.heading': { it: 'Mappa di parole' },
        'wordMap.nodes.plural': { it: 'nodi' },
        'wordMap.relationships.plural': { it: 'relazioni' },
        'wordMap.hidden.singular': { it: 'parola non collegata nascosta' },
      },
    });

    expect(screen.getByRole('dialog')).toHaveTextContent('Mappa di parole');
    expect(caption()).toHaveTextContent(
      /^7 nodi · 5 relazioni · 1 parola non collegata nascosta$/,
    );
  });

  it('draws every related word and every licensed complement, but not the unrelated words', () => {
    renderMap();

    expect(labels()).toEqual([
      'ship',
      'caravel',
      'sloop',
      'cut',
      'sleep',
      'Instrumental',
      'Locative',
    ]);
  });

  it('labels words and complements in the UI language, and relabels them when it changes', () => {
    renderMap({ strings: { 'slot.instrumental': { it: 'Strumentale' } } });
    expect(labels()).toContain('caravel');

    fireEvent.click(screen.getByRole('button', { name: 'switch language', hidden: true }));

    // A word without an Italian label keeps its English one, and so does a complement whose name the
    // bundle leaves out: its catalog entry's English fallback.
    expect(labels()).toEqual([
      'nave',
      'caravella',
      'sloop',
      'cut',
      'sleep',
      'Strumentale',
      'Locative',
    ]);
  });

  it('draws an `is a` as an arrow and a `complements` as a dashed line', () => {
    renderMap();

    const drawn = connectors().map((line) => ({
      arrow: line.getAttribute('marker-end'),
      dashes: line.getAttribute('stroke-dasharray'),
    }));
    expect(drawn).toEqual([
      { arrow: 'url(#wordmap-arrow)', dashes: null },
      { arrow: 'url(#wordmap-arrow)', dashes: null },
      { arrow: null, dashes: '4 4' },
      { arrow: null, dashes: '4 4' },
      { arrow: null, dashes: '4 4' },
    ]);
    expect(svg().querySelector('marker#wordmap-arrow')).not.toBeNull();
  });

  it('stops each connector at the border of the pills it joins, not at their centres', () => {
    // The yacht happens to settle beside the ship, so its connector meets the pills' ends.
    const YACHT = concept('YACHT', 'noun', { isA: 'SHIP' });
    renderMap({ seed: corpus([...CORPUS, YACHT]) });

    // Where a point lies against the outline 3 units clear of a pill all round: how far outside
    // it (negative inside), and whether it sits on a left/right side or a top/bottom one.
    const against = (label: string, x: number, y: number) => {
      const group = node(label);
      const [cx, cy] = numbers(group.getAttribute('transform')!);
      const pill = group.querySelector('rect')!;
      const beyondSide = Math.abs(x - cx) - (Number(pill.getAttribute('width')) / 2 + 3);
      const beyondTop = Math.abs(y - cy) - (Number(pill.getAttribute('height')) / 2 + 3);
      return {
        outside: Math.max(beyondSide, beyondTop),
        side: beyondSide > beyondTop ? 'left/right' : 'top/bottom',
      };
    };
    // Connectors are drawn `is a` first, then `complements`, each from its specific end.
    const joins = [
      ['caravel', 'ship'],
      ['sloop', 'ship'],
      ['yacht', 'ship'],
      ['cut', 'Instrumental'],
      ['cut', 'Locative'],
      ['sleep', 'Locative'],
    ];

    const ends = connectors().flatMap((line, i) => {
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((a) => Number(line.getAttribute(a)));
      return [against(joins[i][0], x1, y1), against(joins[i][1], x2, y2)];
    });

    expect(ends).toHaveLength(12);
    for (const { outside } of ends) expect(outside).toBeCloseTo(0);
    // The drawing exercises both kinds of side, so a margin lost on either would show.
    expect(new Set(ends.map((e) => e.side))).toEqual(new Set(['left/right', 'top/bottom']));
  });

  it('colours a word by its role and outlines a complement in dashes', () => {
    renderMap();

    const pill = (label: string) => node(label).querySelector('rect')!;
    expect(pill('ship')).toHaveAttribute('stroke', theme.palette.success.main);
    expect(pill('cut')).toHaveAttribute('stroke', theme.palette.secondary.main);
    expect(pill('ship')).not.toHaveAttribute('stroke-dasharray');
    expect(pill('Locative')).toHaveAttribute('stroke', theme.palette.grey[600]);
    expect(pill('Locative')).toHaveAttribute('stroke-dasharray', '3 3');
    expect(pill('Locative')).toHaveAttribute('fill', theme.palette.background.paper);
  });

  it('frames the drawing with room around the outermost pills', () => {
    renderMap();

    const centres = [...svg().querySelectorAll('g[transform^="translate"]')]
      .filter((g) => g.querySelector('rect'))
      .map((g) => numbers(g.getAttribute('transform')!));
    const xs = centres.map(([x]) => x);
    const ys = centres.map(([, y]) => y);
    const [x, y, width, height] = numbers(svg().getAttribute('viewBox')!);

    expect(x).toBeCloseTo(Math.min(...xs) - 60);
    expect(y).toBeCloseTo(Math.min(...ys) - 60);
    expect(x + width).toBeCloseTo(Math.max(...xs) + 60);
    expect(y + height).toBeCloseTo(Math.max(...ys) + 60);
  });

  describe('the relation switches', () => {
    // A switched-on relation is a filled primary chip, lettered in white; a switched-off one is
    // an outline lettered in the text colour. (Its background is no guide: jsdom matches the
    // chip's :hover rule once it has been clicked.)
    const isOn = (name: string) => getComputedStyle(chip(name)).color === 'rgb(255, 255, 255)';

    it('start with every relation shown', () => {
      renderMap();

      expect(isOn('Hypernyms')).toBe(true);
      expect(isOn('Complements')).toBe(true);
    });

    it('are named in the UI language', () => {
      localStorage.setItem('signi:uiLanguage', 'de');
      renderMap({
        strings: {
          'wordMap.relation.isA': { de: 'Hyperonyme' },
          'wordMap.relation.complements': { de: 'Ergänzungen' },
        },
      });

      expect(isOn('Hyperonyme')).toBe(true);
      expect(isOn('Ergänzungen')).toBe(true);
    });

    it('hide a relation, and the words only it connected, then bring them back', () => {
      renderMap();

      fireEvent.click(chip('Hypernyms'));

      expect(isOn('Hypernyms')).toBe(false);
      expect(labels()).toEqual(['cut', 'sleep', 'Instrumental', 'Locative']);
      expect(connectors()).toHaveLength(3);
      expect(caption()).toHaveTextContent(
        /^4 nodes · 3 relationships · 4 unconnected hidden words$/,
      );

      fireEvent.click(chip('Hypernyms'));

      expect(isOn('Hypernyms')).toBe(true);
      expect(connectors()).toHaveLength(5);
    });

    it('say there is nothing to draw once every relation is off', () => {
      renderMap();

      fireEvent.click(chip('Hypernyms'));
      fireEvent.click(chip('Complements'));

      expect(drawing()).toBeNull();
      expect(
        screen.getByText('The map shows no relationships. Show a relationship.'),
      ).toBeInTheDocument();
      expect(caption()).toHaveTextContent(
        /^0 nodes · 0 relationships · 6 unconnected hidden words$/,
      );
    });
  });

  describe('hovering a word', () => {
    const opacity = (label: string) => node(label).getAttribute('opacity');

    it('lights it and its neighbours, dimming the rest', () => {
      renderMap();

      fireEvent.pointerEnter(node('ship'));

      expect(['ship', 'caravel', 'sloop'].map(opacity)).toEqual(['1', '1', '1']);
      expect(['cut', 'sleep', 'Instrumental', 'Locative'].map(opacity)).toEqual([
        '0.15',
        '0.15',
        '0.15',
        '0.15',
      ]);
      expect(connectors().map((line) => line.getAttribute('opacity'))).toEqual([
        '0.55',
        '0.55',
        '0.06',
        '0.06',
        '0.06',
      ]);
      expect(node('ship').querySelector('rect')).toHaveAttribute('stroke-width', '2');
      expect(node('ship').querySelector('text')).toHaveAttribute('font-weight', '700');
      expect(node('caravel').querySelector('rect')).toHaveAttribute('stroke-width', '1');
    });

    it('dims a connector that reaches the lit words at only one end', () => {
      renderMap();

      fireEvent.pointerEnter(node('caravel'));

      expect(['caravel', 'ship', 'sloop'].map(opacity)).toEqual(['1', '1', '0.15']);
      // caravel → ship stays lit; sloop → ship touches ship but not caravel.
      expect(connectors().map((line) => line.getAttribute('opacity'))).toEqual([
        '0.55',
        '0.06',
        '0.06',
        '0.06',
        '0.06',
      ]);
    });

    it('lights everything again once the pointer leaves', () => {
      renderMap();

      fireEvent.pointerEnter(node('Locative'));
      expect(opacity('ship')).toBe('0.15');
      expect(opacity('sleep')).toBe('1');

      fireEvent.pointerLeave(node('Locative'));

      expect(labels().map(opacity)).toEqual(Array(7).fill('1'));
      expect(connectors().every((line) => line.getAttribute('opacity') === '0.55')).toBe(true);
    });

    it('is forgotten when a relation is switched', () => {
      renderMap();
      fireEvent.pointerEnter(node('cut'));
      expect(opacity('sleep')).toBe('0.15');

      fireEvent.click(chip('Hypernyms'));

      expect(labels().map(opacity)).toEqual(['1', '1', '1', '1']);
    });
  });

  describe('zooming and panning', () => {
    beforeEach(() => {
      // jsdom implements no pointer capture.
      Element.prototype.setPointerCapture = () => {};
    });

    afterEach(() => {
      Reflect.deleteProperty(Element.prototype, 'setPointerCapture');
    });

    it('zooms in and out with the wheel, within limits', () => {
      renderMap();
      expect(pan().k).toBe(1);

      fireEvent.wheel(svg(), { deltaY: -100 });
      expect(pan().k).toBeCloseTo(1.12);

      for (let i = 0; i < 20; i++) fireEvent.wheel(svg(), { deltaY: -100 });
      expect(pan().k).toBe(4);

      fireEvent.wheel(svg(), { deltaY: 100 });
      expect(pan().k).toBeCloseTo(4 / 1.12);

      for (let i = 0; i < 30; i++) fireEvent.wheel(svg(), { deltaY: 100 });
      expect(pan().k).toBe(0.4);
    });

    it('drags the drawing with the pointer, at the scale of the view', () => {
      renderMap();
      const [, , width] = numbers(svg().getAttribute('viewBox')!);
      // jsdom does no layout; say the drawing is shown 700px wide.
      Object.defineProperty(svg(), 'clientWidth', { value: 700 });
      const unitsPerPixel = width / 700;

      fireEvent.pointerMove(svg(), { clientX: 400, clientY: 400 });
      expect(pan()).toEqual({ k: 1, tx: 0, ty: 0 });

      fireEvent.pointerDown(svg(), { clientX: 100, clientY: 100, pointerId: 1 });
      fireEvent.pointerMove(svg(), { clientX: 170, clientY: 65 });
      expect(pan().tx).toBeCloseTo(70 * unitsPerPixel);
      expect(pan().ty).toBeCloseTo(-35 * unitsPerPixel);

      fireEvent.pointerUp(svg());
      fireEvent.pointerMove(svg(), { clientX: 400, clientY: 400 });
      expect(pan().tx).toBeCloseTo(70 * unitsPerPixel);

      // Zoomed in, the same drag moves the drawing less far.
      fireEvent.wheel(svg(), { deltaY: -100 });
      fireEvent.pointerDown(svg(), { clientX: 0, clientY: 0, pointerId: 1 });
      fireEvent.pointerMove(svg(), { clientX: 112, clientY: 0 });
      expect(pan().tx).toBeCloseTo((70 + 100) * unitsPerPixel);
    });
  });

  describe('loading the corpus', () => {
    it('spins while the words load', () => {
      vi.mocked(fetchConcepts).mockReturnValue(new Promise(() => {}));
      renderMap({ seed: {} });

      expect(fetchConcepts).toHaveBeenCalledWith(undefined);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(drawing()).toBeNull();
      expect(caption()).toHaveTextContent(/^$/);
    });

    it('does not spin on a request that cannot start while the browser is offline', () => {
      // Offline, react-query parks the request: nothing is loading, nothing has failed, and
      // there are still no words.
      vi.mocked(fetchConcepts).mockReturnValue(new Promise(() => {}));
      onlineManager.setOnline(false);
      try {
        renderMap({ seed: {} });

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(drawing()).toBeNull();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      } finally {
        onlineManager.setOnline(true);
      }
    });

    it('offers to retry when the words could not be loaded', async () => {
      vi.mocked(fetchConcepts)
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce([SHIP, CARAVEL]);
      renderMap({ seed: {} });

      const retry = await screen.findByRole('button', { name: 'Retry' });
      expect(
        screen.getByText('The words could not be loaded. Is the server active?'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(drawing()).toBeNull();

      fireEvent.click(retry);

      await waitFor(() => expect(labels()).toEqual(['ship', 'caravel']));
      expect(fetchConcepts).toHaveBeenCalledTimes(2);
    });
  });

  it('names its close and retry buttons, and asks after the server, in the UI language', async () => {
    localStorage.setItem('signi:uiLanguage', 'it');
    vi.mocked(fetchConcepts).mockRejectedValue(new Error('offline'));
    renderMap({
      seed: {},
      strings: {
        'action.closeWordMap': { it: 'Chiudi la mappa di parole' },
        'action.retry': { it: 'Riprova' },
        'status.isServerActive': { it: 'Il server è attivo?' },
      },
    });

    expect(await screen.findByRole('button', { name: 'Riprova' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chiudi la mappa di parole' })).toBeInTheDocument();
    expect(screen.getByText(/Il server è attivo\?$/)).toBeInTheDocument();
  });

  it('closes from its close button and on Escape', () => {
    const { onClose } = renderMap();

    fireEvent.click(screen.getByRole('button', { name: 'Close the word map' }));
    expect(onClose).toHaveBeenCalledOnce();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
