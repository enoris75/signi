import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P17: the phone layout. At 390 px with a finger for a pointer the page is one column under a tab bar
 * — canvas, translations, console — its header folds into a ⋯ menu, and nothing about the keyboard
 * (keycaps, key tips) is drawn.
 */

// An iPhone 13, in Chromium: the suite's one browser. Touch and a mobile viewport make the page's
// `(hover: none) and (pointer: coarse)` true, as on the phone.
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });

const prompt = (page: Page) => page.getByTestId('console-prompt');

/** Type lines into the console tab and run each, as P02's own spec does. */
async function typeLines(page: Page, lines: string[]): Promise<void> {
  await page.getByTestId('tab-console').tap();
  await prompt(page).tap();
  for (const line of lines) {
    await page.keyboard.type(line);
    if (await page.getByTestId('console-list').isVisible()) await page.keyboard.press('Escape');
    await page.keyboard.press('Enter');
    await expect(prompt(page)).toHaveValue('');
  }
}

test.describe('the phone layout', () => {
  test('fits the width: no sideways scroll, and the header folds into a menu', async ({ app, page }) => {
    void app;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.getByTestId('tab-bar')).toBeVisible();
    await expect(page.getByTestId('tab-canvas')).toHaveAttribute('aria-current', 'page');
    // The desktop's header buttons are not drawn; the menu lists what they did.
    await expect(page.getByTestId('console-toggle')).toHaveCount(0);
    await expect(page.getByTestId('help-button')).toHaveCount(0);
    await page.getByTestId('app-menu').tap();
    for (const item of ['save', 'load', 'export', 'import', 'words', 'help']) {
      await expect(page.getByTestId(`app-menu-${item}`)).toBeVisible();
    }
    // Nothing to save yet, so save and export wait for a phrase.
    await expect(page.getByTestId('app-menu-save')).toHaveAttribute('aria-disabled', 'true');
    await page.getByTestId('app-menu-help').tap();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('starts on the canvas, even when the console was left open', async ({ app, page }) => {
    void app;
    // As a desktop leaves it, docked open: on a phone that would be the console tab, hiding the canvas.
    await page.evaluate(() => localStorage.setItem('signi:consoleOpen', 'true'));
    await page.reload();
    await expect(page.getByTestId('tab-canvas')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('typeahead-subject')).toBeVisible();
  });

  test('builds a phrase in the console tab, and shows it on the canvas and in the translations', async ({ app, page }) => {
    await typeLines(page, ['/subj cat /adj brown /pl', '/verb eat /obj food']);
    await expect(page.getByTestId('tab-console')).toHaveAttribute('aria-current', 'page');

    // The canvas tab keeps the phrase in the user's language above the canvas…
    await page.getByTestId('tab-canvas').tap();
    await expect(page.getByTestId('phrase-console')).toHaveCount(0);
    await expect(page.getByTestId('result-strip')).toHaveText('the brown cats eat the food.');
    await expect(page.getByTestId('box-subject')).toBeVisible();

    // …and a tap on it opens the rest.
    await page.getByTestId('result-strip').tap();
    await expect(page.getByTestId('tab-translations')).toHaveAttribute('aria-current', 'page');
    await app.expectSentences({ en: 'the brown cats eat the food.', it: 'i gatti marroni mangiano il cibo.' });
    await expect(page.getByTestId('box-subject')).not.toBeVisible();
  });

  test('undoes from the header, and saves from the menu', async ({ app, page }) => {
    void app;
    await typeLines(page, ['/subj cat /pl', '/verb eat']);
    await page.getByTestId('tab-canvas').tap();
    await expect(page.getByTestId('result-strip')).toHaveText('the cats eat.');
    await page.getByTestId('undo-button').tap();
    await expect(page.getByTestId('result-strip')).toHaveText('the cats.');

    // Save presses the toolbar's own (hidden) button, which owns the dialog.
    await page.getByTestId('app-menu').tap();
    await page.getByTestId('app-menu-save').tap();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('draws no keycaps and no key tips, even after typing on the soft keyboard', async ({ app, page }) => {
    void app;
    await typeLines(page, ['/subj cat']);
    await page.getByTestId('tab-canvas').tap();
    await page.getByTestId('box-subject').tap();
    // Typing into a field on a touch-only device is not a keyboard user arriving.
    await expect(page.locator('body')).not.toHaveAttribute('data-input', 'keyboard');
    await expect(page.locator('[data-kb-tip]')).toHaveCount(0);
    for (const cap of await page.locator('kbd').all()) await expect(cap).not.toBeVisible();
  });
});
