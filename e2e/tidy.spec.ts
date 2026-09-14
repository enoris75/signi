import type { Locator, Page } from '@playwright/test';
import { test, expect, type Builder } from './fixtures';

// The tidy wand on the period header. Every constituent's satellites already sit on its orbit, so
// tidy has nothing to arrange inside one: it packs the constituents' rings into centered rows in
// reading order (subject · verb phrase · direct object · complements) and resizes the canvas to
// hug the stack.
//
// Tidy is pure geometry, so these measure the DOM rather than trusting the positions the layout
// code meant to produce: the invariants a user sees — nothing overlaps, nothing is lost off the
// canvas, the order reads left-to-right and top-to-bottom, a second tidy moves nothing, no control
// covers another or a word — are checked against the rendered rings, across the kinds of phrase
// that give the canvas different shapes and at the window sizes that give it different widths.

// ── Geometry ─────────────────────────────────────────────────────────────────

type Rect = { left: number; top: number; right: number; bottom: number };
// A constituent tidy places as one unit: a painted dotted ring (its `group-box`, measured by the
// square round it), or a stand-in (below).
type Placed = { label: string; rect: Rect };
type Layout = {
  canvas: { width: number; height: number };
  // Every rect is in canvas px, relative to the canvas's top-left corner, so a scroll between
  // two measurements never reads as movement.
  groups: Placed[];
  // A subject-dropping mood swaps the subject word for its own box (the command box), which the
  // layout still lays out as a Subject ring — one it never paints. The stand-in is the Subject for
  // ordering and overlap, but the footprint the layout measured it by is invisible.
  standIns: Placed[];
  words: { key: string; rect: Rect }[];
  // The clickable controls painted on the canvas (reveal icons, ring chrome, relation toolbars) —
  // named by test id or accessible name — and the text inside the word nodes. The coverage checks
  // read these: see the end of the file.
  controls: { name: string; toolbar: boolean; rect: Rect }[];
  texts: { box: string; text: string; rect: Rect }[];
};

// Sub-pixel rounding in the percentage positions: two edges this close count as touching.
const TOLERANCE = 1;
// The layout's own spacing (layout.ts / overlap.ts / slots.ts / ringLayout.ts).
const STACK_MARGIN = 6;
const ROW_GAP = 20;
const BOTTOM_MARGIN = 8;
const MIN_GRAPH_HEIGHT = 160;
// How far the controls straddling a dotted ring reach past it: tidy packs the ring with them.
const CONTROL_REACH = 11;

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right - TOLERANCE &&
  b.left < a.right - TOLERANCE &&
  a.top < b.bottom - TOLERANCE &&
  b.top < a.bottom - TOLERANCE;
const centerX = (r: Rect) => (r.left + r.right) / 2;
const contains = (outer: Rect, inner: Rect) =>
  inner.left >= outer.left - TOLERANCE &&
  inner.right <= outer.right + TOLERANCE &&
  inner.top >= outer.top - TOLERANCE &&
  inner.bottom <= outer.bottom + TOLERANCE;
/** How deep two rects overlap: the shallower of the two axes, 0 when they don't. */
const depth = (a: Rect, b: Rect) =>
  Math.max(
    0,
    Math.min(
      Math.min(a.right, b.right) - Math.max(a.left, b.left),
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
    ),
  );
const centerY = (r: Rect) => (r.top + r.bottom) / 2;

/** One snapshot of a period's canvas: its size, its dotted rings, and its word nodes. */
async function snapshot(period: Locator): Promise<Layout> {
  return period.evaluate((root) => {
    // Only this period's own canvas.
    const own = (el: Element) => el.closest('[data-testid="period-container"]') === root;
    const groupEls = [...root.querySelectorAll<HTMLElement>('[data-testid="group-box"]')].filter(own);
    const canvas = groupEls[0]?.offsetParent as HTMLElement | null;
    if (!canvas) throw new Error('the period has no dotted rings on its canvas');
    const origin = canvas.getBoundingClientRect();
    const rect = (el: Element) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left - origin.left,
        top: r.top - origin.top,
        right: r.right - origin.left,
        bottom: r.bottom - origin.top,
      };
    };
    const standIns = [
      ...canvas.querySelectorAll<HTMLElement>('[data-testid="command-box"], [data-testid="infinitive-box"]'),
    ].filter(own);
    const shown = (el: Element) => el.getClientRects().length > 0;
    // Word boxes are the `box-<slot>` nodes painted on this canvas; a box nested inside another
    // box (an inline picker's own chrome) is part of its parent, not a node of its own, and a box
    // a collapse has hidden isn't painted at all.
    const words = [...canvas.querySelectorAll<HTMLElement>('[data-testid^="box-"]')]
      .filter(own)
      .filter(shown)
      .filter((el) => !el.parentElement?.closest('[data-testid^="box-"]'));
    const button = 'button, [role="button"]';
    const controls = [...canvas.querySelectorAll<HTMLElement>(button)]
      .filter(own)
      .filter(shown)
      .filter((el) => !el.parentElement?.closest(button));
    const texts: { box: string; text: string; rect: ReturnType<typeof rect> }[] = [];
    for (const box of [...words, ...standIns]) {
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent?.trim();
        // A control's own label (a degree chip, a toggle) is the control, not the word.
        if (!text || node.parentElement?.closest(`${button}, input`)) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        texts.push({
          box: box.dataset.testid!.replace(/^box-/, ''),
          text,
          rect: {
            left: r.left - origin.left,
            top: r.top - origin.top,
            right: r.right - origin.left,
            bottom: r.bottom - origin.top,
          },
        });
      }
    }
    return {
      canvas: { width: origin.width, height: origin.height },
      groups: groupEls.map((g) => ({ label: g.dataset.group ?? '', rect: rect(g) })),
      standIns: standIns.map((s) => ({ label: 'Subject', rect: rect(s) })),
      words: [
        ...words.map((w) => ({ key: w.dataset.testid!.slice('box-'.length), rect: rect(w) })),
        ...standIns.map((s) => ({ key: s.dataset.testid!, rect: rect(s) })),
      ],
      controls: controls.map((c) => ({
        name: c.dataset.testid ?? c.getAttribute('aria-label') ?? c.textContent?.trim() ?? '',
        // A button on a relation toolbar: the locative / route specifiers, the cause sentiment.
        toolbar: Boolean(c.closest('[data-testid="specifier-toolbar"], [data-testid="sentiment-toolbar"]')),
        rect: rect(c),
      })),
      texts,
    };
  });
}

/**
 * A snapshot taken once the canvas has stopped moving. A tidy lands as a burst of commits — the
 * positions, then the container height, then the overlap resolver's pass over the new rects —
 * so a single read straight after the click can catch it halfway.
 */
async function settledLayout(period: Locator): Promise<Layout> {
  let previous = '';
  let layout: Layout | undefined;
  await expect
    .poll(
      async () => {
        await period.page().evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        layout = await snapshot(period);
        const key = JSON.stringify(layout, (_, v) => (typeof v === 'number' ? Math.round(v) : v));
        const stable = key === previous;
        previous = key;
        return stable;
      },
      { message: 'the canvas never stopped moving', intervals: [50] },
    )
    .toBe(true);
  return layout!;
}

type Row = { boxes: Placed[]; painted: boolean };

/**
 * The boxes, grouped into the rows tidy packed them into. Tidy gives each row a band as tall as
 * its tallest box and leaves a gap between bands, so boxes whose vertical spans overlap share a
 * row. `painted` is false for a row holding a stand-in, whose true footprint can't be seen.
 */
function rows(layout: Layout): Row[] {
  const placed = [
    ...layout.groups.map((box) => ({ box, painted: true })),
    ...layout.standIns.map((box) => ({ box, painted: false })),
  ].sort((a, b) => a.box.rect.top - b.box.rect.top);
  const out: (Row & { bottom: number })[] = [];
  for (const { box, painted } of placed) {
    const row = out[out.length - 1];
    if (row && box.rect.top < row.bottom - TOLERANCE) {
      row.boxes.push(box);
      row.bottom = Math.max(row.bottom, box.rect.bottom);
      row.painted &&= painted;
    } else {
      out.push({ boxes: [box], painted, bottom: box.rect.bottom });
    }
  }
  return out.map(({ boxes, painted }) => ({
    boxes: boxes.sort((a, b) => a.rect.left - b.rect.left),
    painted,
  }));
}

/** Round every coordinate, so two layouts compare equal across sub-pixel noise. */
function rounded(layout: Layout) {
  const r = (rect: Rect) => ({
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
  });
  return {
    canvas: { width: Math.round(layout.canvas.width), height: Math.round(layout.canvas.height) },
    groups: layout.groups.map((g) => ({ label: g.label, rect: r(g.rect) })),
    words: layout.words.map((w) => ({ key: w.key, rect: r(w.rect) })),
  };
}

/**
 * Everything a tidied period promises, checked against the rendered canvas.
 *
 * `order` is the boxes' labels in reading order. A dotted ring can be wider than a narrow canvas
 * on its own (with the controls straddling it); tidy then gives it a row to itself,
 * pins its left edge and lets it hang off the right, where the canvas clips it — so the
 * right-hand checks are relaxed for exactly those rows. The checks that need a box's exact
 * footprint (centering, margins) skip a row whose footprint is unpainted.
 */
function expectTidy(layout: Layout, order: string[]): void {
  const { canvas, groups, standIns, words } = layout;
  const packed = rows(layout);
  const labels = (row: Row) => row.boxes.map((b) => b.label).join(', ');

  // Reading order: row by row, left to right.
  expect(
    packed.flatMap((row) => row.boxes.map((b) => b.label)),
    'the boxes read in sentence order',
  ).toEqual(order);

  // No box covers another, and no word box covers another.
  const boxes = [...groups, ...standIns];
  for (const [i, a] of boxes.entries())
    for (const b of boxes.slice(i + 1))
      expect(overlaps(a.rect, b.rect), `"${a.label}" overlaps "${b.label}"`).toBe(false);
  for (const [i, a] of words.entries())
    for (const b of words.slice(i + 1))
      expect(overlaps(a.rect, b.rect), `word box ${a.key} overlaps ${b.key}`).toBe(false);

  // The stack hangs from the top of the canvas, and the canvas is trimmed to it: no dead band
  // left underneath (unless the stack is shorter than the canvas's minimum height).
  const [first, last] = [packed[0], packed[packed.length - 1]];
  const top = Math.min(...first.boxes.map((b) => b.rect.top));
  const bottom = Math.max(...last.boxes.map((b) => b.rect.bottom));
  expect(top, 'the first row is on the canvas').toBeGreaterThanOrEqual(0);
  expect(bottom, 'the last row is on the canvas').toBeLessThanOrEqual(canvas.height + TOLERANCE);
  if (first.painted) {
    expect(top, 'the first row sits at the top of the canvas').toBeLessThanOrEqual(
      STACK_MARGIN + CONTROL_REACH + TOLERANCE,
    );
  }
  if (last.painted && Math.round(canvas.height) > MIN_GRAPH_HEIGHT) {
    expect(canvas.height - bottom, 'the canvas is trimmed to the stack').toBeLessThanOrEqual(
      BOTTOM_MARGIN + CONTROL_REACH + 2 * TOLERANCE,
    );
  }

  for (const row of packed) {
    const left = row.boxes[0].rect.left;
    const right = row.boxes[row.boxes.length - 1].rect.right;
    expect(left, `row [${labels(row)}] starts on the canvas`).toBeGreaterThanOrEqual(
      STACK_MARGIN - TOLERANCE,
    );
    if (!row.painted) continue;
    // A row is packed with the controls straddling its rings: too wide once those no longer fit
    // between the margins, even while the rings themselves still do.
    if (right + CONTROL_REACH > canvas.width - STACK_MARGIN + TOLERANCE) {
      // Too wide for the canvas: alone on its row, pinned to the left margin.
      expect(row.boxes, `the overflowing box "${labels(row)}" has a row to itself`).toHaveLength(1);
      expect(Math.abs(left - STACK_MARGIN - CONTROL_REACH)).toBeLessThanOrEqual(TOLERANCE);
    } else {
      // A row that fits is centered.
      expect(
        Math.abs(left - (canvas.width - right)),
        `row [${labels(row)}] is centered on the canvas`,
      ).toBeLessThanOrEqual(2 * TOLERANCE);
    }
  }
  // Rows keep their gutter: the tallest boxes of neighbouring rows are the gap apart.
  for (const [i, upper] of packed.slice(0, -1).entries()) {
    const lower = packed[i + 1];
    const gap =
      Math.min(...lower.boxes.map((b) => b.rect.top)) -
      Math.max(...upper.boxes.map((b) => b.rect.bottom));
    expect(gap, `rows [${labels(upper)}] and [${labels(lower)}] keep their gutter`).toBeGreaterThanOrEqual(
      ROW_GAP - 2 * TOLERANCE,
    );
  }

  // Every word box stays on the canvas: never off its top, left or bottom, and past the right
  // edge only inside a box that was already too wide for the canvas — a clipped dotted ring, or a
  // stand-in given a row of its own (the only place tidy puts a footprint too wide to share one).
  const aloneStandIns = packed
    .filter((row) => !row.painted && row.boxes.length === 1)
    .map((row) => row.boxes[0].rect);
  for (const { key, rect } of words) {
    expect(rect.left, `word box ${key} is off the left edge`).toBeGreaterThanOrEqual(-TOLERANCE);
    expect(rect.top, `word box ${key} is off the top edge`).toBeGreaterThanOrEqual(-TOLERANCE);
    expect(rect.bottom, `word box ${key} is off the bottom edge`).toBeLessThanOrEqual(
      canvas.height + TOLERANCE,
    );
    const inClippedBox =
      aloneStandIns.some((s) => s.left === rect.left && s.top === rect.top) ||
      groups.some(
        (g) =>
          g.rect.right >= canvas.width - TOLERANCE &&
          g.rect.top <= centerY(rect) &&
          centerY(rect) <= g.rect.bottom,
      );
    if (!inClippedBox) {
      expect(rect.right, `word box ${key} is off the right edge`).toBeLessThanOrEqual(
        canvas.width + TOLERANCE,
      );
    }
  }
}

/** Tidy the period, check every invariant, and check that tidying again changes nothing. */
async function tidyAndCheck(app: Builder, order: string[], periodIndex = 0): Promise<Layout> {
  const period = app.period(periodIndex);
  await app.tidy(periodIndex);
  const layout = await settledLayout(period);
  expectTidy(layout, order);

  // Tidy is a fixed point once settled: one more click moves no box and no word.
  await period.getByTestId('period-tidy').first().click();
  expect(rounded(await settledLayout(period)), 'a second tidy moved something').toEqual(
    rounded(layout),
  );
  return layout;
}

/** A word box's rect in canvas px, from a settled snapshot. */
function word(layout: Layout, key: string): Rect {
  const found = layout.words.find((w) => w.key === key);
  if (!found) throw new Error(`no word box "${key}" on the canvas`);
  return found.rect;
}

function group(layout: Layout, label: string): Rect {
  const found = layout.groups.find((g) => g.label === label);
  if (!found) throw new Error(`no dotted ring "${label}" on the canvas`);
  return found.rect;
}

/** Drag a word box by (dx, dy) with a stepped pointer sequence (a single jump reads as a click). */
async function dragWord(page: Page, key: string, dx: number, dy: number): Promise<void> {
  const box = page.getByTestId(`box-${key}`);
  await box.scrollIntoViewIfNeeded();
  const bounds = await box.boundingBox();
  if (!bounds) throw new Error(`word box "${key}" is not on the canvas`);
  // The word itself, mid-box: below the label row and above an adjective's degree chip.
  const startX = bounds.x + bounds.width / 2;
  const startY = bounds.y + bounds.height * 0.5;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let step = 1; step <= 20; step++) {
    await page.mouse.move(startX + (dx * step) / 20, startY + (dy * step) / 20);
  }
  await page.mouse.up();
}

// ── Phrases × window sizes ───────────────────────────────────────────────────

type Phrase = {
  name: string;
  build: (app: Builder, page: Page) => Promise<void>;
  // The dotted rings the phrase paints, in reading order.
  groups: string[];
};

const PHRASES: Phrase[] = [
  {
    name: 'a bare intransitive clause',
    build: (app) => app.buildClause('CAT', 'RUN'),
    groups: ['Subject', 'Verb Phrase'],
  },
  {
    name: 'a transitive clause with its object slot still empty',
    build: (app) => app.buildClause('CAT', 'EAT'),
    groups: ['Subject', 'Verb Phrase', 'Direct Object'],
  },
  {
    name: 'adjective chains and determiners on both nouns',
    build: async (app) => {
      await app.buildClause('DOG', 'SEE');
      await app.setDirectObject('CAT');
      await app.revealAndPick('subjectAdjective', 'BIG');
      await app.revealAndPick('subjectAdjective2', 'BROWN');
      await app.revealAndPick('directObjectAdjective', 'SMALL');
      await app.setDeterminer('subject', 'Indefinite');
      await app.setDeterminer('directObject', 'Multal');
      await app.expectSentences({ en: 'a big brown dog sees many small cats.' });
    },
    groups: ['Subject', 'Verb Phrase', 'Direct Object'],
  },
  {
    name: 'a verb group with tense, aspect, a modal, negation and an adverb',
    build: async (app) => {
      await app.buildClause('CAT', 'EAT');
      await app.setDirectObject('FOOD');
      await app.cycle('verbTense');
      await app.cycle('verbAspect');
      await app.revealAndPick('verbModal', 'MUST');
      await app.satellite('verbNegative').click();
      await app.revealAndPick('modifier', 'FAST');
    },
    groups: ['Subject', 'Verb Phrase', 'Direct Object'],
  },
  {
    name: 'a motion verb with four complements',
    build: async (app) => {
      await app.buildClause('CAT', 'RUN');
      await app.revealAndPick('locative', 'HOUSE');
      await app.revealAndPick('source', 'PRISON');
      await app.revealAndPick('direction', 'MARKET');
      await app.revealAndPick('cause', 'DOG');
    },
    // Complements follow the grammar's order, not the order they were revealed in.
    groups: ['Subject', 'Verb Phrase', 'Locative', 'Direction', 'Source', 'Cause'],
  },
  {
    name: 'a ditransitive with its recipient',
    build: async (app) => {
      await app.buildClause('MAN', 'GIVE');
      await app.setDirectObject('BOOK');
      await app.revealAndPick('terminus', 'CHILD');
      await app.expectSentences({ en: 'the man gives the book to the child.' });
    },
    groups: ['Subject', 'Verb Phrase', 'Direct Object', 'Terminus'],
  },
  {
    name: 'a copular verb with a predicate adjective',
    build: async (app, page) => {
      await app.buildClause('CAT', 'BECOME');
      await app.satellite('predicative').click();
      const box = page.getByTestId('box-predicative');
      await box.getByRole('button', { name: 'Adjective', exact: true }).click();
      await box.locator('input').fill('happy');
      await page.locator('[data-testid="typeahead-option"][data-concept="HAPPY"]').click();
      await app.expectSentences({ en: 'the cat becomes happy.' });
    },
    groups: ['Subject', 'Verb Phrase', 'Subject Complement'],
  },
  {
    name: 'a command, where the command box stands in for the subject',
    build: async (app, page) => {
      await page.getByRole('button', { name: 'Command', exact: true }).click();
      await app.setVerb('EAT');
      await app.setDirectObject('FOOD');
      await app.expectSentences({ en: 'eat the food.' });
    },
    groups: ['Subject', 'Verb Phrase', 'Direct Object'],
  },
  {
    name: 'long words that widen every row',
    build: async (app) => {
      await app.buildClause('TEMPERATURE', 'SEE');
      await app.setDirectObject('RELATIONSHIP');
      await app.revealAndPick('subjectAdjective', 'INTERESTING');
      await app.revealAndPick('subjectAdjective2', 'BEAUTIFUL');
      await app.revealAndPick('directObjectAdjective', 'UNCONNECTED');
    },
    groups: ['Subject', 'Verb Phrase', 'Direct Object'],
  },
];

const VIEWPORTS = [
  { name: 'full-HD desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'phone', width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`tidy the period · ${viewport.name} (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const phrase of PHRASES) {
      test(phrase.name, async ({ app, page }) => {
        await phrase.build(app, page);
        const sentence = await app.sentence('en');

        await tidyAndCheck(app, phrase.groups);

        // Tidy moves boxes, never words: the sentence is exactly what it was.
        expect(await app.sentence('en')).toBe(sentence);
      });
    }
  });
}

// ── One constituent ──────────────────────────────────────────────────────────

test.describe('a ring', () => {
  for (const viewport of [VIEWPORTS[1], VIEWPORTS[2]]) {
    test.describe(`${viewport.name} (${viewport.width}×${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('moves as one: pressing a satellite drags its whole constituent, which stays on its orbit', async ({
        app,
        page,
      }) => {
        await app.buildClause('DOG', 'SEE');
        await app.setDirectObject('CAT');
        await app.revealAndPick('subjectAdjective', 'BIG');
        await app.revealAndPick('subjectAdjective2', 'BROWN');
        await app.setDeterminer('subject', 'Indefinite');
        await app.expectSentences({ en: 'a big brown dog sees the cat.' });
        await app.tidy();
        await page.mouse.move(0, 0);

        const keys = ['subject', 'subjectAdjective', 'subjectAdjective2', 'subjectDefiniteness'];
        const before = await settledLayout(app.period(0));
        // Pull the first adjective down and to the side: the subject's ring comes with it.
        await dragWord(page, 'subjectAdjective', 70, 40);
        const after = await settledLayout(app.period(0));

        const shift = (key: string) => ({
          x: centerX(word(after, key)) - centerX(word(before, key)),
          y: centerY(word(after, key)) - centerY(word(before, key)),
        });
        const moved = shift('subject');
        expect(Math.hypot(moved.x, moved.y), 'the drag moved the constituent').toBeGreaterThan(20);
        for (const key of keys) {
          const s = shift(key);
          expect(Math.abs(s.x - moved.x), `${key} kept its place on the orbit`).toBeLessThanOrEqual(2 * TOLERANCE);
          expect(Math.abs(s.y - moved.y), `${key} kept its place on the orbit`).toBeLessThanOrEqual(2 * TOLERANCE);
        }
        await app.expectSentences({ en: 'a big brown dog sees the cat.' });
      });

      test('dragged over the canvas edge, comes back inside with a tidy', async ({ app, page }) => {
        await app.buildClause('CAT', 'EAT');
        await app.revealAndPick('subjectAdjective', 'BIG');
        await app.tidy();

        // Shove the Subject ring well past the left edge: the drag clamps its word's center to the
        // canvas, so the ring ends up hanging half off it.
        const before = await settledLayout(app.period(0));
        await app.groupBox('Subject').scrollIntoViewIfNeeded();
        await app.dragGroup('Subject', -before.canvas.width, 0);
        const dragged = await settledLayout(app.period(0));
        expect(group(dragged, 'Subject').left, 'the drag left the ring hanging off the left edge').toBeLessThan(0);

        await app.tidy();
        const tidied = await settledLayout(app.period(0));
        for (const key of ['subject', 'subjectAdjective']) {
          const rect = word(tidied, key);
          expect(rect.left, `${key} is back on the canvas`).toBeGreaterThanOrEqual(-TOLERANCE);
          expect(rect.right).toBeLessThanOrEqual(tidied.canvas.width + TOLERANCE);
        }
        expect(group(tidied, 'Subject').left).toBeGreaterThanOrEqual(-TOLERANCE);
      });
    });
  }

  test('offers no tidy of its own: its satellites always sit on its orbit', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('subjectAdjective', 'BIG');
    await expect(app.groupBox('Subject')).toBeVisible();

    await expect(page.getByRole('button', { name: /^Tidy up (Subject|Verb Phrase)$/ })).toHaveCount(0);
    await expect(page.getByTestId('period-tidy')).toBeVisible();
  });
});

// ── Around the period ────────────────────────────────────────────────────────

test.describe('tidy the period · around it', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  const motion = async (app: Builder) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('locative', 'HOUSE');
    await app.revealAndPick('source', 'PRISON');
    await app.revealAndPick('direction', 'MARKET');
    await app.revealAndPick('cause', 'DOG');
  };
  const motionGroups = ['Subject', 'Verb Phrase', 'Locative', 'Direction', 'Source', 'Cause'];

  test('re-flows into more rows when the window narrows, and back when it widens', async ({
    app,
    page,
  }) => {
    await motion(app);
    const wide = await tidyAndCheck(app, motionGroups);

    // Narrowing alone leaves the boxes where they are (as % of the canvas); tidy re-packs them
    // for the width the canvas now has, which takes more rows and a taller canvas.
    await page.setViewportSize({ width: 768, height: 1024 });
    const narrow = await tidyAndCheck(app, motionGroups);
    expect(narrow.canvas.width).toBeLessThan(wide.canvas.width);
    expect(rows(narrow).length).toBeGreaterThan(rows(wide).length);
    expect(narrow.canvas.height).toBeGreaterThan(wide.canvas.height);

    // And widening again gives the original grid back, canvas height included.
    await page.setViewportSize({ width: 1920, height: 1080 });
    const again = await tidyAndCheck(app, motionGroups);
    expect(rounded(again)).toEqual(rounded(wide));
  });

  test('clears the dead space under a canvas that was dragged taller', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.setDirectObject('FOOD');
    const tidied = await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Direct Object']);

    // Drag the resize grip — the card's bottom edge, known only by its ns-resize cursor (the
    // first match in document order; its children inherit the cursor) — well down.
    const grip = await app.period(0).evaluate((root) => {
      const el = [...root.querySelectorAll('*')].find(
        (e) => getComputedStyle(e).cursor === 'ns-resize',
      );
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    expect(grip, 'the resize grip is on the card').not.toBeNull();
    const { x, y } = grip!;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 20; step++) await page.mouse.move(x, y + (300 * step) / 20);
    await page.mouse.up();
    const stretched = await settledLayout(app.period(0));
    expect(stretched.canvas.height).toBeGreaterThan(tidied.canvas.height + 200);

    const again = await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Direct Object']);
    expect(rounded(again)).toEqual(rounded(tidied));
  });

  test('tidying one period leaves the other periods alone', async ({ app }) => {
    await app.buildClauseIn(0, 'CAT', 'EAT');
    await app.setDirectObjectIn(0, 'FOOD');
    await app.addPeriod();
    await app.buildClauseIn(1, 'DOG', 'RUN');
    await app.revealAndPick('source', 'HOUSE');

    const first = rounded(await settledLayout(app.period(0)));
    await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Source'], 1);
    expect(rounded(await settledLayout(app.period(0))), 'the first period moved').toEqual(first);
  });

  test('a tidy grid survives a round trip through compact view', async ({ app }) => {
    await motion(app);
    const tidied = await tidyAndCheck(app, motionGroups);

    // Compact hides the dotted rings and packs the bare words; the stored full layout is left
    // untouched underneath, so expanding again restores the tidy grid exactly.
    await app.compactToggle.click();
    await expect(app.page.getByTestId('group-box')).toHaveCount(0);
    await app.compactToggle.click();
    await expect(app.page.getByTestId('group-box')).toHaveCount(motionGroups.length);
    expect(rounded(await settledLayout(app.period(0)))).toEqual(rounded(tidied));
  });
});

// ── Edge cases ───────────────────────────────────────────────────────────────

// How deep one painted thing has to sink into another to cover it. The controls are 18–22px
// icons; sinking a third of one reads as covered, while a couple of px is just two borders
// touching. A word is covered sooner: its glyphs fill only the middle of an 18px line, so an icon
// 3px in is already on the letters.
const COVER = 6;
const TEXT_COVER = 3;

/** The promise the rings make: no control covers another control, and none covers a word. */
function expectNothingCovered(layout: Layout): void {
  const { controls, texts } = layout;
  const stacked: string[] = [];
  for (const [i, a] of controls.entries())
    for (const b of controls.slice(i + 1))
      if (depth(a.rect, b.rect) >= COVER) stacked.push(`${a.name} × ${b.name}`);
  expect(stacked, 'controls stacked on one another').toEqual([]);
  const onWords = controls.flatMap((control) =>
    texts
      .filter((t) => depth(control.rect, t.rect) >= TEXT_COVER)
      .map((t) => `${control.name} × ${t.box} "${t.text}"`),
  );
  expect(onWords, 'controls covering words').toEqual([]);
}

/** Fill a noun to the brim: the full three-adjective chain, then a determiner. */
async function fillNoun(app: Builder, noun: string, { determiner = true } = {}): Promise<void> {
  for (const [suffix, adjective] of [
    ['Adjective', 'BIG'],
    ['Adjective2', 'BROWN'],
    ['Adjective3', 'SMALL'],
  ]) {
    await app.revealAndPick(`${noun}${suffix}`, adjective);
  }
  if (determiner) await app.setDeterminer(noun, 'Indefinite');
}

/** Fill the verb phrase: tense, aspect, the two-modal chain with each modal's adverb, negation and the adverb. */
async function fillVerb(app: Builder): Promise<void> {
  await app.cycle('verbTense');
  await app.cycle('verbAspect');
  await app.revealAndPick('verbModal', 'MUST');
  await app.revealAndPick('verbModalAdverb', 'ALWAYS');
  await app.revealAndPick('verbModal2', 'CAN');
  await app.revealAndPick('verbModal2Adverb', 'WELL');
  await app.revealAndPick('modifier', 'FAST');
  await app.satellite('verbNegative').click();
}

test.describe('tidy the period · edge cases', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  // A phrase with every slot filled takes a minute and more to build, so it is built once and then
  // re-tidied at each window size, widest to narrowest, rather than rebuilt per size. At each size
  // the tidied canvas must also keep every control clear of every other control and of the words.
  async function checkAtEverySize(app: Builder, page: Page, order: string[]): Promise<void> {
    const sentence = await app.sentence('en');
    for (const viewport of VIEWPORTS) {
      await test.step(`${viewport.name} (${viewport.width}×${viewport.height})`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.mouse.move(0, 0);
        expectNothingCovered(await tidyAndCheck(app, order));
      });
    }
    expect(await app.sentence('en')).toBe(sentence);
  }

  // A freshly revealed complement opens at its default spot and is shoved clear of whatever is
  // already there, which on a full canvas can leave the stack ragged; tidying after each step, as
  // a user filling the canvas would, keeps it compact while it grows.

  test('every slot on an intransitive motion verb, at every window size', async ({ app, page }) => {
    test.setTimeout(300_000);
    await app.buildClause('CAT', 'RUN');
    await fillNoun(app, 'subject');
    await app.tidy();
    await fillVerb(app);
    await app.tidy();
    // All six complements a motion verb licenses that sit on this canvas, each filled in turn.
    // (The instrumental is the seventh, and lives in a period of its own.) The cause takes no
    // determiner: it folds the quantifier into its connector.
    for (const [type, noun] of [
      ['manner', 'WATER'],
      ['locative', 'HOUSE'],
      ['direction', 'MARKET'],
      ['source', 'PRISON'],
      ['route', 'MAP'],
      ['cause', 'DOG'],
    ]) {
      await app.revealAndPick(type, noun);
      await app.tidy();
      await fillNoun(app, type, { determiner: type !== 'cause' });
      await app.tidy();
    }

    await checkAtEverySize(app, page, [
      'Subject',
      'Verb Phrase',
      'Adverbial of manner',
      'Locative',
      'Direction',
      'Source',
      'Route',
      'Cause',
    ]);
  });

  test('every slot on a transitive verb, at every window size', async ({ app, page }) => {
    test.setTimeout(300_000);
    await app.buildClause('BOY', 'READ');
    // The object's picker is open only until another slot takes the focus, so it goes first.
    await app.setDirectObject('BOOK');
    await app.tidy();
    await fillNoun(app, 'subject');
    await app.tidy();
    await fillVerb(app);
    await app.tidy();
    await fillNoun(app, 'directObject');
    await app.tidy();
    // The complements are opened only now, with the object already tidied under the verb phrase:
    // their toggles share the verb's dotted ring with the object's control, and stay clickable.
    const complements = [
      ['terminus', 'CHILD'],
      ['manner', 'WATER'],
      ['locative', 'HOUSE'],
      ['cause', 'DOG'],
    ];
    for (const [type, noun] of complements) {
      await app.revealAndPick(type, noun);
      await app.tidy();
      await fillNoun(app, type, { determiner: type !== 'cause' });
      await app.tidy();
    }

    await checkAtEverySize(app, page, [
      'Subject',
      'Verb Phrase',
      'Direct Object',
      'Terminus',
      'Adverbial of manner',
      'Locative',
      'Cause',
    ]);
  });

  test('complement rings revealed but still empty', async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    // An empty complement holds an open picker, wider than any word, and tidy packs it at that size.
    for (const type of ['locative', 'direction', 'source']) {
      await app.satellite(type).click();
      await expect(app.page.getByTestId(`box-${type}`).locator('input')).toBeVisible();
    }
    await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Locative', 'Direction', 'Source']);
  });

  test('a collapsed ring is packed at its collapsed size, and re-packs when it opens', async ({
    app,
    page,
  }) => {
    await app.buildClause('DOG', 'SEE');
    await app.setDirectObject('CAT');
    await fillNoun(app, 'subject');
    const order = ['Subject', 'Verb Phrase', 'Direct Object'];
    const open = await tidyAndCheck(app, order);

    await page.getByRole('button', { name: 'Compact the subject' }).click();
    const collapsed = await tidyAndCheck(app, order);
    expect(collapsed.words.map((w) => w.key)).not.toContain('subjectAdjective');
    expect(
      group(collapsed, 'Subject').bottom - group(collapsed, 'Subject').top,
      'the collapsed ring is packed at its own, smaller size',
    ).toBeLessThan(group(open, 'Subject').bottom - group(open, 'Subject').top);

    // Opening it again and tidying lands on exactly the grid it had before it was collapsed.
    await page.getByRole('button', { name: 'Expand the subject' }).click();
    expect(rounded(await tidyAndCheck(app, order))).toEqual(rounded(open));
  });

  test('removing a complement closes its gap on the next tidy', async ({ app, page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await app.buildClause('CAT', 'RUN');
    for (const [type, noun] of [
      ['locative', 'HOUSE'],
      ['direction', 'MARKET'],
      ['source', 'PRISON'],
      ['cause', 'DOG'],
    ]) {
      await app.revealAndPick(type, noun);
    }
    const before = await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Locative', 'Direction', 'Source', 'Cause']);

    await page.getByRole('button', { name: 'Remove the source' }).click();
    await expect(app.groupBox('Source')).toHaveCount(0);
    const after = await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Locative', 'Direction', 'Cause']);
    expect(after.canvas.height).toBeLessThanOrEqual(before.canvas.height);
  });
});

// ── Controls on a crowded canvas ─────────────────────────────────────────────
// Each of these was a defect of the box layout — controls placed by rules that never saw one
// another, landing on one another or on a word. The rings seat every control by one rule, so they
// now stand as ordinary tests.

test.describe('controls on a crowded canvas', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the Verb Phrase ring holds the modals' adverbs", async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('subjectAdjective', 'BIG');
    await app.revealAndPick('subjectAdjective2', 'BROWN');
    await app.tidy();
    await app.revealAndPick('verbModal', 'MUST');
    await app.revealAndPick('verbModal2', 'CAN');
    await app.revealAndPick('verbModalAdverb', 'ALWAYS');
    await app.revealAndPick('verbModal2Adverb', 'WELL');
    await app.tidy();

    const layout = await settledLayout(app.period(0));
    const verbPhrase = group(layout, 'Verb Phrase');
    const stray = ['verbModalAdverb', 'verbModal2Adverb'].filter(
      (key) => !contains(verbPhrase, word(layout, key)),
    );
    expect(stray, 'modal adverbs outside the Verb Phrase ring').toEqual([]);
    expectTidy(layout, ['Subject', 'Verb Phrase']);
  });

  test("the verb's controls keep clear of the verb", async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    await fillVerb(app);
    await app.tidy();
    await app.page.mouse.move(0, 0);

    const layout = await settledLayout(app.period(0));
    const verb = layout.texts.filter((t) => t.box === 'verb');
    expect(verb.map((t) => t.text)).toEqual(['run']);
    const covering = layout.controls
      .filter((control) => depth(control.rect, verb[0].rect) >= TEXT_COVER)
      .map((control) => control.name);
    expect(covering, 'controls covering the verb').toEqual([]);
  });

  test('controls on a full verb phrase keep clear of each other and of its words', async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    await fillVerb(app);
    await app.tidy();
    await app.page.mouse.move(0, 0);

    expectNothingCovered(await settledLayout(app.period(0)));
  });

  test("a complement's relation toolbar keeps clear of its ring's other controls", async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('locative', 'HOUSE');
    await app.tidy();
    await app.page.mouse.move(0, 0);

    const { controls } = await settledLayout(app.period(0));
    const chrome = controls.filter((c) => /^(Compact|Expand|Remove) the locative$/.test(c.name));
    expect(chrome.map((c) => c.name)).toEqual(['Compact the locative', 'Remove the locative']);
    const covered = controls
      .filter((c) => c.toolbar)
      .flatMap((bar) =>
        controls
          .filter((other) => !other.toolbar && depth(bar.rect, other.rect) >= COVER)
          .map((other) => `${bar.name} × ${other.name}`),
      );
    expect(covered, 'toolbar buttons covering other controls').toEqual([]);
  });

  test('the complement toggles stay clickable when the object sits under the verb phrase', async ({
    app,
    page,
  }) => {
    // A phone-width canvas stacks every ring in one column, which puts the object under the verb.
    // Its control faces the object's ring, so it sits at the bottom of the verb's dotted ring —
    // among READ's five complement toggles, which the ring spreads round it.
    await page.setViewportSize({ width: 390, height: 844 });
    await app.buildClause('BOY', 'READ');
    await app.setDirectObject('BOOK');
    await app.tidy();

    const blocked: string[] = [];
    for (const type of ['manner', 'instrumental', 'terminus', 'locative', 'cause']) {
      // A trial click runs every actionability check, the hit test included, without clicking.
      await app
        .satellite(type)
        .click({ trial: true, timeout: 2_000 })
        .catch(() => blocked.push(type));
    }
    expect(blocked, 'complement toggles covered by another control').toEqual([]);
  });
});
