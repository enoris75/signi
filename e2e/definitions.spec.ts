import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P13: the constructs a definition needs, each said in the console and on the canvas alike — here the
 * relative clause said alone, its head unspoken, which is how an adjective is defined (OKAY "that has
 * no problems").
 */

const prompt = (page: Page) => page.getByTestId('console-prompt');

async function run(page: Page): Promise<void> {
  if (await page.getByTestId('console-list').isVisible()) await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await expect(prompt(page)).toHaveValue('');
}

test.describe('a relative clause said alone', () => {
  test('is typed as /headless and drops the head from every language', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /rel subj ( /verb love /obj cat ) /headless');
    await run(page);
    await app.expectSentences({ en: 'who loves the cat.', it: 'che ama il gatto.', de: 'der den Kater liebt.', ja: '猫を愛する。' });
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( man /rel #2.subj /headless )');
  });

  test('is a chip beside the relative control, written back as /headless and taken back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /rel subj ( /verb love /obj cat )');
    await run(page);
    await app.expectSentences({ en: 'the man who loves the cat.' });

    const chip = app.period(0).getByTestId('headless-ctl-subject').locator('button');
    await chip.click();
    await app.expectSentences({ en: 'who loves the cat.' });
    await expect(page.getByTestId('source-strip')).toContainText('/rel #2.subj /headless');

    await chip.click();
    await app.expectSentences({ en: 'the man who loves the cat.' });
    await expect(page.getByTestId('source-strip')).not.toContainText('/headless');
  });

  test('offers no chip on a noun without a relative clause', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /verb run');
    await run(page);
    await expect(app.period(0).getByTestId('headless-ctl-subject')).toHaveCount(0);
  });
});
