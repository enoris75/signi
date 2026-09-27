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

  test('a role\'s word picker fills the sheet, not a small floating card', async ({ app, page }) => {
    void app;
    await page.getByTestId('role-subject').tap();
    await expect(page.getByTestId('word-sheet')).toBeVisible();
    await page.keyboard.type('c');
    const list = page.getByTestId('picker-list');
    await expect(list).toBeVisible();
    const sheetBox = (await page.getByTestId('word-sheet').boundingBox())!;
    const listBox = (await list.boundingBox())!;
    // Full width of the sheet (minus its padding), not a narrow card off to one side.
    expect(listBox.width).toBeGreaterThan(sheetBox.width * 0.85);
    // Tall enough to show many rows, not capped to a fixed ~200px card.
    expect(listBox.height).toBeGreaterThan(300);
  });

  test('the complements a verb takes are offered under it, before any is drawn', async ({ app, page }) => {
    void app;
    await fillRole(page, 'subject', 'Europe', 'EUROPE');
    await fillRole(page, 'verb', 'be', 'BE');
    // Not only a predicate filled on the canvas first: the verb's own toggles, listed as rows.
    await page.getByTestId('role-offer-predicative').tap();
    await expect(page.getByTestId('word-sheet')).toBeVisible();
    await page.keyboard.type('continent');
    await page.locator('[data-testid="typeahead-option"][data-concept="CONTINENT"]').click();
    await expect(page.getByTestId('result-strip')).toHaveText('Europe is a continent.');
    await expect(page.getByTestId('role-offer-predicative')).toHaveCount(0);
  });

  test('a motion verb offers its goal, source and route', async ({ app, page }) => {
    void app;
    await fillRole(page, 'subject', 'cat', 'CAT');
    await fillRole(page, 'verb', 'go', 'GO');
    for (const complement of ['direction', 'source', 'route']) {
      await expect(page.getByTestId(`role-offer-${complement}`)).toBeVisible();
    }
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


test.describe('the canvas at real width (P17 phase 3)', () => {
  async function buildPhrase(page: Page): Promise<void> {
    await page.getByTestId('role-subject').tap();
    await page.keyboard.type('cat');
    await page.locator('[data-testid="typeahead-option"][data-concept="CAT"]').click();
    await page.keyboard.type('eat');
    await page.locator('[data-testid="typeahead-option"][data-concept="EAT"]').click();
    await page.keyboard.type('food');
    await page.locator('[data-testid="typeahead-option"][data-concept="FOOD"]').click();
    await page.getByTestId('tab-canvas').tap();
  }

  test('lays the rings out at a desktop width, panned by native scroll', async ({ app, page }) => {
    void app;
    await buildPhrase(page);
    const canvas = page.getByTestId('phrase-canvas');
    // The ring layout keeps a desktop's width regardless of the phone's — never squeezed, never
    // re-stacked to fit 390 px — and carries no CSS transform (see the plan's note on why: a
    // transform is invisible to the ResizeObserver every box's own size is measured with, but not
    // to getBoundingClientRect, which the ring geometry also reads — a transform would desync them).
    await expect(canvas).toHaveCSS('width', '600px');
    await expect(canvas).toHaveCSS('transform', 'none');
    // Object sits off to the right at that width; scrolling the viewport reaches it.
    const viewport = page.getByTestId('phrase-canvas-viewport');
    await expect(page.getByTestId('box-directObject')).not.toBeInViewport();
    await viewport.evaluate((el) => el.scrollBy({ left: 300, behavior: 'instant' }));
    await expect(page.getByTestId('box-directObject')).toBeInViewport();
  });

  test('"show the whole canvas" scrolls back to the start', async ({ app, page }) => {
    void app;
    await buildPhrase(page);
    const viewport = page.getByTestId('phrase-canvas-viewport');
    await viewport.evaluate((el) => el.scrollBy({ left: 300, behavior: 'instant' }));
    await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Show the whole canvas' }).click();
    await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBe(0);
  });

  test('a build in the Phrase view still shows the whole desktop-width canvas, no page errors', async ({ app, page }) => {
    void app;
    await buildPhrase(page);
    // Every box a filled phrase draws is reachable somewhere in the scroll, none clipped or
    // collapsed — the smoke test the earlier oscillation bug (a bad transform) would have failed.
    for (const testId of ['box-subject', 'box-verb', 'box-directObject']) {
      await page.getByTestId(testId).scrollIntoViewIfNeeded();
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });
});

test.describe('the console command bar (P17 phase 4)', () => {
  test('sits above the prompt on the console tab, each key a 44 px target', async ({ app, page }) => {
    void app;
    await page.getByTestId('tab-console').tap();
    await expect(page.getByTestId('console-command-bar')).toBeVisible();
    for (const id of ['tab', 'adj', 'pl', 'not', 'slash', 'bracket', 'run']) {
      const box = await page.getByTestId(`command-bar-${id}`).boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('/adj, /pl and /not insert their token and keep the field focused', async ({ app, page }) => {
    void app;
    await page.getByTestId('tab-console').tap();
    await prompt(page).tap();
    await page.getByTestId('command-bar-adj').tap();
    await expect(prompt(page)).toHaveValue('/adj ');
    await expect(prompt(page)).toBeFocused();
    await page.getByTestId('command-bar-pl').tap();
    await expect(prompt(page)).toHaveValue('/adj /pl ');
    await page.getByTestId('command-bar-not').tap();
    await expect(prompt(page)).toHaveValue('/adj /pl /not ');
    await expect(prompt(page)).toBeFocused();
  });

  test('the bracket key opens a pair exactly as typing "(" would', async ({ app, page }) => {
    void app;
    await page.getByTestId('tab-console').tap();
    await prompt(page).tap();
    await page.keyboard.type('/subj');
    await page.getByTestId('command-bar-bracket').tap();
    await expect(prompt(page)).toHaveValue('/subj (  )');
  });

  test('the slash key opens the completion list, as typing "/" would', async ({ app, page }) => {
    void app;
    await page.getByTestId('tab-console').tap();
    await prompt(page).tap();
    await page.getByTestId('command-bar-slash').tap();
    await expect(prompt(page)).toHaveValue('/');
    await expect(page.getByTestId('console-list')).toBeVisible();
  });

  test('⇥ completes a command exactly as the keyboard’s own Tab does', async ({ app, page }) => {
    void app;
    await page.getByTestId('tab-console').tap();
    await prompt(page).tap();
    await page.keyboard.type('/su');
    await page.getByTestId('command-bar-tab').tap();
    await expect(prompt(page)).toHaveValue('/subj (  )');
    await expect(prompt(page)).toBeFocused();
  });

  test('run commits the line, as ↵ does', async ({ app, page }) => {
    void app;
    await page.getByTestId('tab-console').tap();
    await prompt(page).tap();
    await page.keyboard.type('/subj cat /verb eat');
    await page.getByTestId('command-bar-run').tap();
    await expect(prompt(page)).toHaveValue('');
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( cat ) /verb ( eat )');
  });
});
