import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P17-E4: a tablet. Below `md` (900 px) on a touch-only device the page is one column — the canvas
 * the whole width, the translations under it, the console still docked, no tab bar — and a tapped
 * box raises the phone's bar of named controls. A desktop window as narrow, driven by a mouse,
 * keeps its two columns.
 */

const periods = (page: Page) => page.locator('[data-kb-region="periods"]');

/** Type lines into the docked console and run each. */
async function typeLines(page: Page, lines: string[]): Promise<void> {
  const prompt = page.getByTestId('console-prompt');
  if (!(await prompt.isVisible())) await page.getByTestId('console-toggle').click();
  await prompt.click();
  for (const line of lines) {
    await page.keyboard.type(line);
    if (await page.getByTestId('console-list').isVisible()) await page.keyboard.press('Escape');
    await page.keyboard.press('Enter');
    await expect(prompt).toHaveValue('');
  }
}

test.describe('a tablet in portrait, with a finger (768×1024)', () => {
  test.use({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

  test('is one column: no sideways scroll, the canvas the whole width, the translations under it', async ({ app, page }) => {
    await typeLines(page, ['/subj cat /adj brown /pl', '/verb eat /obj food']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
    // No tab bar: every view is on the page at once.
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
    await expect(page.getByTestId('phrase-console')).toBeVisible();
    // The canvas's column spans the page (less the container's gutters), not 58% of it.
    const column = (await periods(page).boundingBox())!;
    expect(column.width).toBeGreaterThan(768 * 0.85);
    // The translations sit under the canvas, reached by scrolling, not by a tab.
    const translations = page.locator('[data-kb-region="translations"]');
    await expect(translations).toBeVisible();
    expect((await translations.boundingBox())!.y).toBeGreaterThan(column.y + column.height - 1);
    await app.expectSentences({ en: 'the brown cats eat the food.' });
  });

  test('a tapped box raises its bar, above the docked console', async ({ app, page }) => {
    void app;
    await typeLines(page, ['/subj cat', '/verb eat /obj food']);
    await expect(page.getByTestId('quick-bar')).toHaveCount(0);
    await page.getByTestId('box-verb').tap();
    const bar = page.getByTestId('quick-bar');
    await expect(bar).toHaveAttribute('data-slot', 'verb');
    const barBox = (await bar.boundingBox())!;
    const consoleBox = (await page.getByTestId('phrase-console').boundingBox())!;
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(consoleBox.y + 1);
    // The help button steps above it rather than over its last pill.
    await expect
      .poll(async () => {
        const help = (await page.getByTestId('help-button').boundingBox())!;
        return help.y + help.height;
      })
      .toBeLessThanOrEqual(barBox.y + 1);
    await page.getByTestId('quick-verbTense').tap();
    await app.expectSentences({ en: 'the cat ate the food.' });
  });
});

test.describe('a desktop window as narrow, with a mouse (768×1024)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('keeps its two columns, and no tapped box raises a bar', async ({ app, page }) => {
    await typeLines(page, ['/subj cat', '/verb eat']);
    const column = (await periods(page).boundingBox())!;
    expect(column.width).toBeLessThan(768 * 0.7);
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
    await app.expectSentences({ en: 'the cat eats.' });
    await page.getByTestId('box-verb').click();
    await expect(page.getByTestId('quick-bar')).toHaveCount(0);
  });
});

test.describe('a phone held sideways (874×402)', () => {
  test.use({ viewport: { width: 874, height: 402 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });

  test('is still a phone: the tab bar, the header folded into its menu', async ({ app, page }) => {
    void app;
    await expect(page.getByTestId('tab-bar')).toBeVisible();
    await expect(page.getByTestId('tab-phrase')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('app-menu')).toBeVisible();
    await expect(page.getByTestId('console-toggle')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(874);
  });
});

test.describe('a desktop window as short, with a mouse (874×402)', () => {
  test.use({ viewport: { width: 874, height: 402 } });

  test('keeps the desktop header and no tab bar', async ({ app, page }) => {
    void app;
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
    await expect(page.getByTestId('console-toggle')).toBeVisible();
  });
});
