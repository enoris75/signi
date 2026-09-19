import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P02: the phrase console — the same phrase as the canvas, typed.
 *
 * The session the plan opens with (§1), typed with ⇥ completion: every box it fills is checked on the
 * canvas, and the sentence in all seven languages. Then the other direction — a control clicked on the
 * canvas comes back to the console as the command it equals — and a two-period script pasted whole.
 */

const prompt = (page: Page) => page.getByTestId('console-prompt');

/** Run the line in the prompt: close the list if it is up, then ↵. */
async function run(page: Page): Promise<void> {
  if (await page.getByTestId('console-list').isVisible()) await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await expect(prompt(page)).toHaveValue('');
}

test.describe('the phrase console', () => {
  test('builds the plan’s session from the console, completing with ⇥', async ({ app, page }) => {
    await prompt(page).click();

    // /su ⇥ ca ⇥ — each ⇥ takes the ghost.
    await page.keyboard.type('/su');
    await expect(page.getByTestId('console-ghost')).toHaveText('bj');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj ');
    await page.keyboard.type('ca');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj cat ');
    await page.keyboard.type('/adj br');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj cat /adj brown ');
    await page.keyboard.type('/pl');

    // Before ↵ the canvas previews the boxes the line fills, dashed, and the translations say so.
    await expect(page.getByTestId('box-subject')).toHaveAttribute('data-preview', '');
    await expect(page.getByTestId('box-subjectAdjective')).toHaveAttribute('data-preview', '');
    await expect(page.getByTestId('translation-preview').first()).toBeVisible();
    await app.expectSentences({ en: 'the brown cats.' });

    await run(page);
    await expect(page.getByTestId('box-subject')).not.toHaveAttribute('data-preview', '');
    await expect(page.getByTestId('translation-preview')).toHaveCount(0);
    // The context moves on to the verb, as the pickers' own auto-advance would.
    await expect(page.getByTestId('console-chip')).toContainText(/verb/i);

    await page.keyboard.type('/verb eat /obj food');
    await run(page);
    await app.expectSentences({ en: 'the brown cats eat the food.' });

    // A click on the canvas — the polarity of eat — is written back as the command it equals.
    await page.getByTestId('satellite-verbNegative').click();
    await expect(page.getByTestId('transcript-echo')).toContainText('/not · eat');
    await expect(page.getByTestId('source-strip')).toContainText('/verb eat /not');
    await app.expectSentences({ en: 'the brown cats do not eat the food.' });

    // …and it put the console's context on eat, so /modal lands there.
    await prompt(page).click();
    await page.keyboard.type('/modal ca');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/modal can ');
    await run(page);
    await expect(page.getByTestId('box-verbModal')).toContainText('can');
    await app.expectSentences({ en: 'the brown cats cannot eat the food.' });

    // A relative clause in brackets: a second period, made already linked to cats.
    await page.keyboard.type('#1.subj /rel obj ( /subj dog /verb see )');
    await expect(page.getByTestId('period-preview')).toBeVisible();
    await run(page);
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await app.expectSentences({
      en: 'the brown cats that the dog sees cannot eat the food.',
      it: 'i gatti marroni che il cane vede non possono mangiare il cibo.',
      fr: 'les chats bruns que le chien voit ne peuvent pas manger la nourriture.',
      de: 'die braunen Kater, die der Hund sieht, können das Essen nicht essen.',
      es: 'los gatos marrones que el perro ve no pueden comer la comida.',
      ja: '犬が見る茶色の猫は食べ物を食べることができません。',
      pt: 'os gatos castanhos que o cão vê não podem comer a comida.',
    });

    // ↑ brings the last line back.
    await page.keyboard.press('ArrowUp');
    await expect(prompt(page)).toHaveValue('#1.subj /rel obj ( /subj dog /verb see )');
    await expect(page.getByTestId('console-history-tag')).toContainText('history · 1 of');
  });

  test('writes a canvas change into the source strip and the transcript', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /verb eat');
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/subj cat /verb eat');

    await app.cycle('verbTense');
    await expect(page.getByTestId('source-strip')).toContainText('/verb eat /past');
    await expect(page.getByTestId('transcript-echo').last()).toContainText('/past · eat');

    // A click on a token takes the context to its box.
    await page.getByTestId('source-token').filter({ hasText: 'cat' }).click();
    await expect(page.getByTestId('console-chip')).toContainText(/subject/i);
  });

  test('refuses a line that does not parse, and leaves the phrase as it was', async ({ app, page }) => {
    // The fixture opens the app; nothing on the canvas yet.
    await expect(app.subjectInput).toBeVisible();
    await prompt(page).click();
    await page.keyboard.type('/subj cat /frob');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('console-diagnostic')).toContainText('There is no command /frob.');
    await expect(prompt(page)).toHaveValue('/subj cat /frob');
    // The valid part still previews; esc clears the line and the preview with it.
    await expect(page.getByTestId('box-subject')).toHaveAttribute('data-preview', '');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');
    await expect(page.getByTestId('typeahead-subject')).toBeVisible();
  });

  test('rebuilds a workspace from a pasted two-period script', async ({ app, page }) => {
    await prompt(page).click();
    await prompt(page).evaluate((input, text) => {
      const data = new DataTransfer();
      data.setData('text/plain', text);
      input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    }, '/subj child /rel #2.subj /verb read /obj book\n/subj child /verb love /obj cat\n');
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await app.expectSentences({ en: 'the child who loves the cat reads the book.' });
    await expect(page.getByTestId('transcript-typed')).toHaveCount(2);
  });

  test('shows and hides with the key below esc, and from the header', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    // From a box on the canvas, ` takes the keyboard to the prompt.
    await page.locator('[data-kb-box="subject"]').focus();
    await expect(page.locator('[data-kb-box="subject"]')).toBeFocused();
    await page.keyboard.press('Backquote');
    await expect(prompt(page)).toBeFocused();
    // From the prompt, it hides the console and gives the keyboard back to the canvas.
    await page.keyboard.press('Backquote');
    await expect(page.getByTestId('phrase-console')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-kb-box'))).not.toBeNull();
    // The header's control shows it again, and it stays shown across a reload.
    await page.getByTestId('console-toggle').click();
    await expect(page.getByTestId('phrase-console')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('phrase-console')).toBeVisible();
  });
});
