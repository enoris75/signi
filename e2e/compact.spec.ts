import type { Locator } from '@playwright/test';
import { test, expect, type Builder } from './fixtures';

// Compact view. The period's own controls (reorder, compact, tidy, save, remove) give up their
// header row and float over the canvas's top-right corner, and the canvas packs the bare core
// words into centered rows under them. Nothing reserves that corner but the packing itself, so
// these measure the rendered page: the words and every control a word or complement carries must
// stay out from under the period's controls — the header cluster and the clause controls on the
// card's right border alike — and the packed words must not land on one another.

type Rect = { left: number; top: number; right: number; bottom: number };
type Named = { name: string; rect: Rect };

// Sub-pixel rounding: edges this close count as touching, not overlapping.
const TOLERANCE = 1;
const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right - TOLERANCE &&
  b.left < a.right - TOLERANCE &&
  a.top < b.bottom - TOLERANCE &&
  b.top < a.bottom - TOLERANCE;

const VIEWPORTS = [
  { name: 'full-HD desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'phone', width: 390, height: 844 },
];

type Phrase = { name: string; build: (app: Builder) => Promise<void> };

const PHRASES: Phrase[] = [
  {
    // The reported case: the locative's relation toolbar landed on the compact / tidy / save /
    // clear cluster, and the locative's word on the subject complement's.
    name: 'a copula with a subject complement and a locative',
    build: async (app) => {
      await app.buildClause('AFRICA', 'BE');
      await app.revealAndPick('predicative', 'CONTINENT');
      await app.revealAndPick('locative', 'ASIA');
    },
  },
  {
    // Every complement that carries a relation toolbar, in a period that shares the workspace, so
    // the header cluster is at its widest (the reorder arrows join it).
    name: 'a motion verb with every toolbar complement, one of two periods',
    build: async (app) => {
      await app.buildClause('CAT', 'RUN');
      await app.revealAndPick('locative', 'HOUSE');
      await app.revealAndPick('route', 'MARKET');
      await app.revealAndPick('cause', 'DOG');
      await app.addPeriod();
    },
  },
];

/** The period's own controls, and what its canvas paints: the word boxes and every button. */
async function measure(period: Locator) {
  return period.evaluate((root) => {
    const own = (el: Element) => el.closest('[data-testid="period-container"]') === root;
    const shown = (el: Element) => el.getClientRects().length > 0;
    const rect = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    };
    const name = (el: HTMLElement) =>
      el.dataset.testid ?? el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '';
    const button = 'button, [role="button"]';
    const canvas = [...root.querySelectorAll('[data-testid="phrase-canvas"]')].find(own);
    if (!canvas) throw new Error('the period has no canvas');
    const periodControls = [
      ...root.querySelectorAll<HTMLElement>(
        `[data-testid="period-controls"] :is(${button}), [data-testid="period-border-controls"] :is(${button})`,
      ),
    ]
      .filter(own)
      .filter(shown);
    const words = [...canvas.querySelectorAll<HTMLElement>('[data-testid^="box-"]')]
      .filter(shown)
      .filter((el) => !el.parentElement?.closest('[data-testid^="box-"]'));
    const canvasControls = [...canvas.querySelectorAll<HTMLElement>(button)].filter(shown);
    return {
      periodControls: periodControls.map((el) => ({ name: name(el), rect: rect(el) })),
      words: words.map((el) => ({ name: el.dataset.testid!, rect: rect(el.firstElementChild ?? el) })),
      canvasControls: canvasControls.map((el) => ({ name: name(el), rect: rect(el) })),
    };
  });
}

const collisions = (as: Named[], bs: Named[]) =>
  as.flatMap((a) => bs.filter((b) => overlaps(a.rect, b.rect)).map((b) => `${a.name} × ${b.name}`));

for (const viewport of VIEWPORTS) {
  test.describe(`compact view · ${viewport.name} (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const phrase of PHRASES) {
      test(`${phrase.name}: the canvas keeps clear of the period's controls`, async ({ app, page }) => {
        await phrase.build(app);
        await app.compactToggle.click();
        await expect(app.compactToggle).toHaveAttribute('data-compact', 'true');
        // A hovered control's tooltip is a popper outside the canvas; move off so none lingers.
        await page.mouse.move(0, 0);

        // The compact packing lands over a few commits as the canvas re-measures, so poll.
        await expect(async () => {
          const { periodControls, words, canvasControls } = await measure(app.period(0));
          expect(periodControls.map((c) => c.name)).toContain('period-compact-toggle');
          expect(words.length).toBeGreaterThanOrEqual(3);

          expect(
            collisions(periodControls, [...words, ...canvasControls]),
            "the canvas runs under the period's controls",
          ).toEqual([]);
          expect(
            collisions(words, words).filter((pair) => {
              const [a, b] = pair.split(' × ');
              return a < b;
            }),
            'packed words overlapping',
          ).toEqual([]);
        }).toPass({ timeout: 5000 });

        // Expanding gives the complements their relation toolbars back.
        await app.compactToggle.click();
        await expect(page.getByTestId('specifier-toolbar').first()).toBeVisible();
      });
    }
  });
}
