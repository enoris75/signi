import type { Locator, Page } from '@playwright/test';
import { test, expect, type Builder } from './fixtures';

// The tidy wands. The one on the period header re-flows the whole canvas: every dotted box is
// compacted around its main word, then the boxes are packed into centered rows in reading order
// (subject · verb phrase · direct object · complements) and the canvas is resized to hug the
// stack. The one on a dotted box's corner compacts just that box, in place.
//
// Tidy is pure geometry, so these measure the DOM rather than trusting the positions the layout
// code meant to produce: the invariants a user sees — nothing overlaps, nothing is lost off the
// canvas, the order reads left-to-right and top-to-bottom, a second tidy moves nothing — are
// checked against the rendered boxes, across the kinds of phrase that give the canvas different
// shapes and at the window sizes that give it different widths.

// ── Geometry ─────────────────────────────────────────────────────────────────

type Rect = { left: number; top: number; right: number; bottom: number };
// A box tidy places as one unit: a painted dotted box, or a stand-in (below).
type Placed = { label: string; rect: Rect };
type Layout = {
  canvas: { width: number; height: number };
  // Every rect is in canvas px, relative to the canvas's top-left corner, so a scroll between
  // two measurements never reads as movement.
  groups: Placed[];
  // A subject-dropping mood swaps the subject word for its own box (the command box), which the
  // layout still wraps in a Subject box — one it never paints. The stand-in is the Subject for
  // ordering and overlap, but the dotted footprint the layout measured it by is invisible.
  standIns: Placed[];
  words: { key: string; rect: Rect }[];
  // The clickable controls painted on the canvas (reveal icons, corner buttons, relation
  // toolbars) — named by test id or accessible name — and the text inside the word boxes. Only
  // the known-bug tests read these: see the end of the file.
  controls: { name: string; toolbar: boolean; rect: Rect }[];
  texts: { box: string; text: string; rect: Rect }[];
};

// Sub-pixel rounding in the percentage positions: two edges this close count as touching.
const TOLERANCE = 1;
// The layout's own spacing (layout.ts / overlap.ts / slots.ts).
const STACK_MARGIN = 6;
const ROW_GAP = 20;
const BOTTOM_MARGIN = 8;
const MIN_GRAPH_HEIGHT = 160;
const NODE_GAP_Y = 26;
const NODE_GAP_X = 40;

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

/** One snapshot of a period's canvas: its size, its dotted boxes, and its word boxes. */
async function snapshot(period: Locator): Promise<Layout> {
  return period.evaluate((root) => {
    // Only this period's own canvas — a nested possessor panel is another period's card.
    const own = (el: Element) => el.closest('[data-testid="period-container"]') === root;
    const groupEls = [...root.querySelectorAll<HTMLElement>('[data-testid="group-box"]')].filter(own);
    const canvas = groupEls[0]?.offsetParent as HTMLElement | null;
    if (!canvas) throw new Error('the period has no dotted boxes on its canvas');
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
 * `order` is the boxes' labels in reading order. A dotted box can be wider than a narrow canvas
 * on its own (it carries padding for its border controls); tidy then gives it a row to itself,
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
      STACK_MARGIN + TOLERANCE,
    );
  }
  if (last.painted && Math.round(canvas.height) > MIN_GRAPH_HEIGHT) {
    expect(canvas.height - bottom, 'the canvas is trimmed to the stack').toBeLessThanOrEqual(
      BOTTOM_MARGIN + 2 * TOLERANCE,
    );
  }

  for (const row of packed) {
    const left = row.boxes[0].rect.left;
    const right = row.boxes[row.boxes.length - 1].rect.right;
    expect(left, `row [${labels(row)}] starts on the canvas`).toBeGreaterThanOrEqual(
      STACK_MARGIN - TOLERANCE,
    );
    if (!row.painted) continue;
    if (right >= canvas.width - TOLERANCE) {
      // Too wide for the canvas: alone on its row, pinned to the left margin.
      expect(row.boxes, `the overflowing box "${labels(row)}" has a row to itself`).toHaveLength(1);
      expect(Math.abs(left - STACK_MARGIN)).toBeLessThanOrEqual(TOLERANCE);
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
  // edge only inside a box that was already too wide for the canvas — a clipped dotted box, or a
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
  if (!found) throw new Error(`no dotted box "${label}" on the canvas`);
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
  // The dotted boxes the phrase paints, in reading order.
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
      await page.getByLabel('Toggle imperative (command)').click();
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

// ── One dotted box ───────────────────────────────────────────────────────────

test.describe('tidy one box', () => {
  for (const viewport of [VIEWPORTS[1], VIEWPORTS[2]]) {
    test.describe(`${viewport.name} (${viewport.width}×${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('stacks the adjectives above the word and the determiner below it', async ({
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

        // Pull the first adjective out of its row, down and to the side of the head noun.
        const before = await settledLayout(app.period(0));
        await dragWord(page, 'subjectAdjective', 70, word(before, 'subject').bottom - word(before, 'subjectAdjective').top);
        const dragged = await settledLayout(app.period(0));
        expect(
          Math.abs(centerY(word(dragged, 'subjectAdjective')) - centerY(word(dragged, 'subjectAdjective2'))),
          'the drag pulled the adjective out of its row',
        ).toBeGreaterThan(20);

        await page.getByRole('button', { name: 'Tidy up Subject' }).click();
        const tidied = await settledLayout(app.period(0));

        const noun = word(tidied, 'subject');
        const big = word(tidied, 'subjectAdjective');
        const brown = word(tidied, 'subjectAdjective2');
        const determiner = word(tidied, 'subjectDefiniteness');

        // Top row: the adjectives, side by side in chain order, clear of the noun below.
        expect(Math.abs(centerY(big) - centerY(brown)), 'the adjectives share a row').toBeLessThanOrEqual(TOLERANCE);
        expect(brown.left - big.right, 'the adjectives keep their gap').toBeGreaterThanOrEqual(NODE_GAP_X - 2 * TOLERANCE);
        expect(noun.top - Math.max(big.bottom, brown.bottom), 'the adjective row clears the noun').toBeGreaterThanOrEqual(NODE_GAP_Y - 2 * TOLERANCE);
        // Bottom row: the determiner, clear of the noun above.
        expect(determiner.top - noun.bottom, 'the determiner sits below the noun').toBeGreaterThanOrEqual(NODE_GAP_Y - 2 * TOLERANCE);
        // Every row hangs from one center line.
        const rowCenter = (big.left + brown.right) / 2;
        expect(Math.abs(rowCenter - centerX(noun)), 'the adjective row is centered over the noun').toBeLessThanOrEqual(2 * TOLERANCE);
        expect(Math.abs(centerX(determiner) - centerX(noun)), 'the determiner is centered under the noun').toBeLessThanOrEqual(2 * TOLERANCE);

        // The box and its words stay on the canvas, and no box ends up covering another.
        const subject = group(tidied, 'Subject');
        expect(subject.left).toBeGreaterThanOrEqual(-TOLERANCE);
        expect(subject.right).toBeLessThanOrEqual(tidied.canvas.width + TOLERANCE);
        for (const { rect } of tidied.words) {
          expect(rect.left).toBeGreaterThanOrEqual(-TOLERANCE);
          expect(rect.right).toBeLessThanOrEqual(tidied.canvas.width + TOLERANCE);
          expect(rect.bottom).toBeLessThanOrEqual(tidied.canvas.height + TOLERANCE);
        }
        for (const [i, a] of tidied.groups.entries())
          for (const b of tidied.groups.slice(i + 1))
            expect(overlaps(a.rect, b.rect), `"${a.label}" overlaps "${b.label}"`).toBe(false);

        await app.expectSentences({ en: 'a big brown dog sees the cat.' });
      });

      test('pulls a box dragged over the canvas edge back inside', async ({ app, page }) => {
        await app.buildClause('CAT', 'EAT');
        await app.revealAndPick('subjectAdjective', 'BIG');
        await app.tidy();

        // Shove the Subject box well past the left edge: the drag clamps each word's center to
        // the canvas, so the words end up hanging half off it.
        const before = await settledLayout(app.period(0));
        await app.groupBox('Subject').scrollIntoViewIfNeeded();
        await app.dragGroup('Subject', -before.canvas.width, 0);
        const dragged = await settledLayout(app.period(0));
        expect(
          Math.min(word(dragged, 'subject').left, word(dragged, 'subjectAdjective').left),
          'the drag left the words hanging off the left edge',
        ).toBeLessThan(0);

        await page.getByRole('button', { name: 'Tidy up Subject' }).click();
        const tidied = await settledLayout(app.period(0));
        for (const key of ['subject', 'subjectAdjective']) {
          const rect = word(tidied, key);
          expect(rect.left, `${key} is back on the canvas`).toBeGreaterThanOrEqual(-TOLERANCE);
          expect(rect.right).toBeLessThanOrEqual(tidied.canvas.width + TOLERANCE);
        }
        expect(group(tidied, 'Subject').left).toBeGreaterThanOrEqual(-TOLERANCE);
        expect(word(tidied, 'subject').top - word(tidied, 'subjectAdjective').bottom).toBeGreaterThanOrEqual(
          NODE_GAP_Y - 2 * TOLERANCE,
        );
      });
    });
  }

  test('is offered only when a box has more than its word, and not while collapsed', async ({
    app,
    page,
  }) => {
    const tidySubject = page.getByRole('button', { name: 'Tidy up Subject' });
    const tidyVerb = page.getByRole('button', { name: 'Tidy up Verb Phrase' });

    // A lone word has nothing to arrange.
    await app.buildClause('CAT', 'RUN');
    await expect(app.groupBox('Subject')).toBeVisible();
    await expect(tidySubject).toHaveCount(0);
    await expect(tidyVerb).toHaveCount(0);

    // An adjective gives the subject box a second node; the verb box still has one.
    await app.revealAndPick('subjectAdjective', 'BIG');
    await expect(tidySubject).toBeVisible();
    await expect(tidyVerb).toHaveCount(0);

    // Collapsed, the satellites are hidden, so there is nothing to tidy until it opens again.
    await page.getByRole('button', { name: 'Collapse Subject' }).click();
    await expect(tidySubject).toHaveCount(0);
    await page.getByRole('button', { name: 'Expand Subject' }).click();
    await expect(tidySubject).toBeVisible();
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

    // Compact hides the dotted boxes and packs the bare words; the stored full layout is left
    // untouched underneath, so expanding again restores the tidy grid exactly.
    await app.compactToggle.click();
    await expect(app.page.getByTestId('group-box')).toHaveCount(0);
    await app.compactToggle.click();
    await expect(app.page.getByTestId('group-box')).toHaveCount(motionGroups.length);
    expect(rounded(await settledLayout(app.period(0)))).toEqual(rounded(tidied));
  });
});

// ── Edge cases ───────────────────────────────────────────────────────────────

/** Fill a noun box to the brim: the full three-adjective chain, then a determiner. */
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

/**
 * Fill the verb phrase: tense, aspect, the two-modal chain, negation and the adverb. The modals'
 * own adverbs are left out — tidy doesn't place them yet, which is pinned under known bugs below.
 */
async function fillVerb(app: Builder): Promise<void> {
  await app.cycle('verbTense');
  await app.cycle('verbAspect');
  await app.revealAndPick('verbModal', 'MUST');
  await app.revealAndPick('verbModal2', 'CAN');
  await app.revealAndPick('modifier', 'FAST');
  await app.satellite('verbNegative').click();
}

test.describe('tidy the period · edge cases', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  // A phrase with every slot filled takes a minute and more to build, so it is built once and then
  // re-tidied at each window size, widest to narrowest, rather than rebuilt per size.
  async function checkAtEverySize(app: Builder, page: Page, order: string[]): Promise<void> {
    const sentence = await app.sentence('en');
    for (const viewport of VIEWPORTS) {
      await test.step(`${viewport.name} (${viewport.width}×${viewport.height})`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await tidyAndCheck(app, order);
      });
    }
    expect(await app.sentence('en')).toBe(sentence);
  }

  // Building one of these is also the case for tidying as you go: a freshly revealed slot opens at
  // a fixed default spot, so on a full canvas it lands on the controls of the words already there.
  // Tidying after each box — as a user filling the canvas would — keeps every next control
  // reachable.

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
    // Every complement is opened before the first tidy: once tidy stacks the object box under the
    // verb phrase, the object's control lands on the complement toggles and blocks them (pinned
    // under known bugs below).
    const complements = [
      ['terminus', 'CHILD'],
      ['manner', 'WATER'],
      ['locative', 'HOUSE'],
      ['cause', 'DOG'],
    ];
    for (const [type, noun] of complements) await app.revealAndPick(type, noun);
    await app.tidy();
    await fillNoun(app, 'subject');
    await app.tidy();
    await fillVerb(app);
    await app.tidy();
    await fillNoun(app, 'directObject');
    await app.tidy();
    for (const [type] of complements) {
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

  test('complement boxes revealed but still empty', async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    // An empty box holds an open picker, wider than any word, and tidy packs it at that size.
    for (const type of ['locative', 'direction', 'source']) {
      await app.satellite(type).click();
      await expect(app.page.getByTestId(`box-${type}`).locator('input')).toBeVisible();
    }
    await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Locative', 'Direction', 'Source']);
  });

  test('a collapsed box is packed at its collapsed size, and re-packs when it opens', async ({
    app,
    page,
  }) => {
    await app.buildClause('DOG', 'SEE');
    await app.setDirectObject('CAT');
    await fillNoun(app, 'subject');
    const order = ['Subject', 'Verb Phrase', 'Direct Object'];
    const open = await tidyAndCheck(app, order);

    await page.getByRole('button', { name: 'Collapse Subject' }).click();
    const collapsed = await tidyAndCheck(app, order);
    expect(collapsed.words.map((w) => w.key)).not.toContain('subjectAdjective');
    expect(
      group(collapsed, 'Subject').bottom - group(collapsed, 'Subject').top,
      'the collapsed box is packed at its own, shorter height',
    ).toBeLessThan(group(open, 'Subject').bottom - group(open, 'Subject').top);

    // Opening it again and tidying lands on exactly the grid it had before it was collapsed.
    await page.getByRole('button', { name: 'Expand Subject' }).click();
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

    await page.getByRole('button', { name: 'Remove Source' }).click();
    await expect(app.groupBox('Source')).toHaveCount(0);
    const after = await tidyAndCheck(app, ['Subject', 'Verb Phrase', 'Locative', 'Direction', 'Cause']);
    expect(after.canvas.height).toBeLessThanOrEqual(before.canvas.height);
  });
});

// ── Known bugs ───────────────────────────────────────────────────────────────
// Each asserts the layout a user should get and is marked test.fail(): the suite stays green while
// the defect stands, and Playwright reports "expected to fail, but passed" the moment it is fixed —
// the signal to drop the marker and keep the test. They were found filling a canvas to the brim.

// How deep one painted thing has to sink into another to hide it. The controls are 18–22px
// icons; sinking a third of one reads as covered, while a couple of px is just two borders
// touching (and there are plenty of those — not pinned here). A word hides sooner: its glyphs
// fill only the middle of an 18px line, so an icon 3px in is already on the letters.
const COVER = 6;
const TEXT_COVER = 3;

test.describe('known bugs: overlap on a tidied canvas', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('tidy gathers the modal adverbs into the Verb Phrase box', async ({ app }) => {
    test.fail(
      true,
      'graph.ts builds the Verb Phrase group without verbModalAdverb / verbModal2Adverb, so the ' +
        'dotted box never wraps them and tidy leaves them wherever they opened — on the subject',
    );
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
    expect(stray, 'modal adverbs outside the Verb Phrase box').toEqual([]);
    expectTidy(layout, ['Subject', 'Verb Phrase']);
  });

  test("the verb box's controls keep clear of the verb", async ({ app }) => {
    await app.buildClause('CAT', 'RUN');
    await fillVerb(app);
    await app.tidy();

    const layout = await settledLayout(app.period(0));
    const verb = layout.texts.filter((t) => t.box === 'verb');
    expect(verb.map((t) => t.text)).toEqual(['run']);
    const covering = layout.controls
      .filter((control) => depth(control.rect, verb[0].rect) >= TEXT_COVER)
      .map((control) => control.name);
    expect(covering, 'controls covering the verb').toEqual([]);
  });

  test('controls on a full verb phrase keep clear of each other', async ({ app }) => {
    test.fail(
      true,
      'the second modal\'s reveal icon lands on the first modal\'s clear button, and the verb ' +
        'box border icons stack on one another',
    );
    await app.buildClause('CAT', 'RUN');
    await fillVerb(app);
    await app.tidy();

    const { controls } = await settledLayout(app.period(0));
    const stacked: string[] = [];
    for (const [i, a] of controls.entries())
      for (const b of controls.slice(i + 1))
        if (depth(a.rect, b.rect) >= COVER) stacked.push(`${a.name} × ${b.name}`);
    expect(stacked, 'controls stacked on one another').toEqual([]);
  });

  test("a complement's relation toolbar keeps clear of its box's corner buttons", async ({
    app,
  }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('locative', 'HOUSE');
    await app.tidy();

    const { controls } = await settledLayout(app.period(0));
    const corners = controls.filter((c) => /^(Collapse|Expand|Tidy up|Remove) Locative$/.test(c.name));
    expect(corners.map((c) => c.name)).toEqual(['Collapse Locative', 'Remove Locative']);
    // Nor on the controls riding the top of the locative's word box, just below the toolbar.
    const covered = controls
      .filter((c) => c.toolbar)
      .flatMap((bar) =>
        controls
          .filter((other) => !other.toolbar && depth(bar.rect, other.rect) >= COVER)
          .map((other) => `${bar.name} × ${other.name}`),
      );
    expect(covered, 'toolbar buttons covering other controls').toEqual([]);
  });

  test('the complement toggles stay clickable when the object box sits under the verb phrase', async ({
    app,
    page,
  }) => {
    test.fail(
      true,
      "the direct object's control sits where the object's connector leaves the Verb Phrase box; " +
        'when tidy stacks the object below the verb phrase, that is the bottom edge, on the row of ' +
        'complement toggles, and it takes their clicks',
    );
    // A phone-width canvas stacks every box in one column, which puts the object under the verb;
    // with READ's five complement toggles, the object's control lands square on the manner one.
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
