import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P17: the phone layout. At 390 px with a finger for a pointer the page is one column under a tab bar
 * — phrase, canvas, translations, console — its header folds into a ⋯ menu, and nothing about the
 * keyboard (keycaps, key tips) is drawn. The Phrase view (phase 2) lists a period's roles and opens
 * each one's own ring controls in a sheet, running the very handlers the canvas's rings run.
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
    await expect(page.getByTestId('tab-phrase')).toHaveAttribute('aria-current', 'page');
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

  test('starts on the phrase view, even when the console was left open', async ({ app, page }) => {
    void app;
    // As a desktop leaves it, docked open: on a phone that would be the console tab, hiding the rest.
    await page.evaluate(() => localStorage.setItem('signi:consoleOpen', 'true'));
    await page.reload();
    await expect(page.getByTestId('tab-phrase')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('role-subject')).toBeVisible();
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

test.describe('the Phrase view', () => {
  /** Fill a role from the list: tap it, type the word, tap the matching option. */
  async function fillRole(page: Page, role: string, word: string, id: string): Promise<void> {
    if (!(await page.getByTestId('word-sheet').isVisible())) await page.getByTestId(`role-${role}`).tap();
    await expect(page.getByTestId('word-sheet')).toBeVisible();
    await page.keyboard.type(word);
    await page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`).click();
  }

  test('builds a phrase by tapping roles, auto-advancing to the next empty one', async ({ app, page }) => {
    void app;
    await expect(page.getByTestId('role-subject')).toBeVisible();
    await fillRole(page, 'subject', 'cat', 'CAT');
    // The next empty role's picker opens by itself, as auto-advance does on the canvas.
    await expect(page.getByTestId('word-sheet')).toContainText('Verb');
    await fillRole(page, 'verb', 'eat', 'EAT');
    await expect(page.getByTestId('word-sheet')).toContainText('Object');
    await fillRole(page, 'directObject', 'food', 'FOOD');
    await expect(page.getByTestId('word-sheet')).toHaveCount(0);

    await expect(page.getByTestId('role-subject')).toContainText('cat');
    await expect(page.getByTestId('role-verb')).toContainText('eat');
    await expect(page.getByTestId('role-directObject')).toContainText('food');
    await expect(page.getByTestId('result-strip')).toHaveText('the cat eats the food.');
  });

  test('a filled role opens its sheet: the ring controls run the canvas\'s own handlers', async ({ app, page }) => {
    void app;
    await fillRole(page, 'subject', 'cat', 'CAT');
    await fillRole(page, 'verb', 'eat', 'EAT');
    await fillRole(page, 'directObject', 'food', 'FOOD');

    await page.getByTestId('role-subject').tap();
    await expect(page.getByTestId('role-sheet')).toBeVisible();
    await expect(page.getByTestId('role-control-subjectNumber')).toContainText('Singular');
    await page.getByTestId('role-control-subjectNumber').tap();
    await expect(page.getByTestId('role-control-subjectNumber')).toContainText('Plural');
    await expect(page.getByTestId('result-strip')).toHaveText('the cats eat the food.');
  });

  test('a value-cycling control (tense) runs the same command its canvas key does', async ({ app, page }) => {
    void app;
    await fillRole(page, 'subject', 'cat', 'CAT');
    await fillRole(page, 'verb', 'eat', 'EAT');
    await fillRole(page, 'directObject', 'food', 'FOOD');

    await page.getByTestId('role-verb').tap();
    await expect(page.getByTestId('role-control-verbTense')).toContainText('Present');
    await page.getByTestId('role-control-verbTense').tap();
    await expect(page.getByTestId('role-control-verbTense')).toContainText('Past');
    await expect(page.getByTestId('result-strip')).toHaveText('the cat ate the food.');
  });

  test('an adjective rides its noun\'s row as a chip, and opens its own picker', async ({ app, page }) => {
    void app;
    await fillRole(page, 'subject', 'cat', 'CAT');
    // Auto-advance opened the verb's own picker; close it to get back to the list.
    await page.getByTestId('word-sheet').getByRole('button').first().tap();
    await page.getByTestId('role-subject').tap();
    await page.getByTestId('role-control-subjectAdjective').tap();
    await expect(page.getByTestId('word-sheet')).toContainText('Adjective');
    await page.keyboard.type('brown');
    await page.locator('[data-testid="typeahead-option"][data-concept="BROWN"]').click();
    await expect(page.getByTestId('role-chip-subjectAdjective')).toHaveText('brown');
    await expect(page.getByTestId('result-strip')).toHaveText('the brown cat.');
  });

  test('removing a word from its sheet clears the role', async ({ app, page }) => {
    void app;
    await fillRole(page, 'subject', 'cat', 'CAT');
    await fillRole(page, 'verb', 'eat', 'EAT');
    await fillRole(page, 'directObject', 'food', 'FOOD');

    await page.getByTestId('role-directObject').tap();
    await page.getByTestId('role-sheet-remove').tap();
    await expect(page.getByTestId('role-directObject')).toContainText('choose');
    await expect(page.getByTestId('result-strip')).toHaveText('the cat eats.');
  });

  test('a control that opens a ring of its own (a possessor) hands off to the canvas', async ({ app, page }) => {
    void app;
    await fillRole(page, 'subject', 'cat', 'CAT');
    // Auto-advance opened the verb's own picker; close it to get back to the list.
    await page.getByTestId('word-sheet').getByRole('button').first().tap();
    await page.getByTestId('role-subject').tap();
    await page.getByTestId('role-control-subjectPossessor').tap();
    await expect(page.getByTestId('tab-canvas')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('typeahead-noun')).toBeVisible();
  });
});
