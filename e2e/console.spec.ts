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

    // /su ⇥ ca ⇥ — each ⇥ takes the ghost, and the subject's bracket opens for its word.
    await page.keyboard.type('/su');
    await expect(page.getByTestId('console-ghost')).toHaveText('bj');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj (  )');
    await page.keyboard.type('ca');
    await expect(page.getByTestId('console-ghost')).toHaveText('t');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj ( cat  )');
    await page.keyboard.type('/adj br');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj ( cat /adj brown  )');
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

    // Typed straight through: /obj leaves the verb's bracket for one of its own.
    await page.keyboard.type('/verb eat /obj food');
    await expect(prompt(page)).toHaveValue('/verb ( eat ) /obj ( food )');
    await run(page);
    await app.expectSentences({ en: 'the brown cats eat the food.' });

    // A click on the canvas — the polarity of eat — is written back as the command it equals.
    await page.getByTestId('satellite-verbNegative').click();
    await expect(page.getByTestId('transcript-echo')).toContainText('/not · eat');
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( eat /not )');
    await app.expectSentences({ en: 'the brown cats do not eat the food.' });

    // …and it put the console's context on eat, so /modal lands there.
    await prompt(page).click();
    await page.keyboard.type('/modal ca');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/modal can ');
    await run(page);
    await expect(page.getByTestId('box-verbModal')).toContainText('can');
    await app.expectSentences({ en: 'the brown cats cannot eat the food.' });

    // A relative clause in braces, which open by themselves: a second period, made already linked to cats.
    await page.keyboard.type('#1.subj /rel obj /subj dog /verb see');
    await expect(prompt(page)).toHaveValue('#1.subj /rel obj { /subj ( dog ) /verb ( see ) }');
    await expect(page.getByTestId('period-preview')).toBeVisible();
    await run(page);
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await app.expectSentences({
      en: 'the brown cats that the dog sees cannot eat the food.',
      it: 'i gatti marroni che il cane vede non possono mangiare il cibo.',
      fr: 'les chats bruns que le chien voit ne peuvent pas manger la nourriture.',
      de: 'die braunen Kater, die der Hund sieht, können das Essen nicht fressen.',
      es: 'los gatos marrones que el perro ve no pueden comer la comida.',
      ja: '犬が見る茶色の猫は食べ物を食べることができません。',
      pt: 'os gatos castanhos que o cão vê não podem comer a comida.',
    });

    // ↑ brings the last line back.
    await page.keyboard.press('ArrowUp');
    await expect(prompt(page)).toHaveValue('#1.subj /rel obj { /subj ( dog ) /verb ( see ) }');
    await expect(page.getByTestId('console-history-tag')).toContainText('history · 1 of');
  });

  test('writes a canvas change into the source strip and the transcript', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /verb eat');
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( cat ) /verb ( eat )');

    await app.cycle('verbTense');
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( eat /past )');
    await expect(page.getByTestId('transcript-echo').last()).toContainText('/past · eat');

    // A click on a token takes the context to its box.
    await page.getByTestId('source-token').filter({ hasText: 'cat' }).click();
    await expect(page.getByTestId('console-chip')).toContainText(/subject/i);
  });

  test('writes a click on the canvas into the period being edited, as if typed', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /verb eat');
    await run(page);
    await page.keyboard.type('#1 /edit');
    await page.keyboard.press('Enter');
    await expect(prompt(page)).toHaveValue('/subj ( cat ) /verb ( eat ) ');

    // The tense clicked on the canvas goes into the line, and the canvas shows it.
    await app.cycle('verbTense');
    await expect(prompt(page)).toHaveValue('/subj ( cat ) /verb ( eat /past ) ');
    await expect(page.getByTestId('box-verbTense')).toContainText(/past/i);
    await app.expectSentences({ en: 'the cat ate.' });
    // Nothing is the phrase's until ↵.
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( cat ) /verb ( eat )');
    await expect(page.getByTestId('transcript-echo')).toHaveCount(0);

    await prompt(page).click();
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( eat /past )');
    await app.expectSentences({ en: 'the cat ate.' });
  });

  test('refuses a line that does not parse, and leaves the phrase as it was', async ({ app, page }) => {
    // The fixture opens the app; nothing on the canvas yet.
    await expect(app.subjectInput).toBeVisible();
    await prompt(page).click();
    await page.keyboard.type('/subj cat /frob');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('console-diagnostic')).toContainText('There is no command /frob.');
    await expect(prompt(page)).toHaveValue('/subj ( cat /frob )');
    // The valid part still previews; esc clears the line and the preview with it.
    await expect(page.getByTestId('box-subject')).toHaveAttribute('data-preview', '');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');
    await expect(page.getByTestId('typeahead-subject')).toBeVisible();
  });

  test('rebuilds a workspace from a pasted two-period script, run with ↵', async ({ app, page }) => {
    await prompt(page).click();
    // A paste lands in the prompt, several lines and all, and previews before ↵ runs it.
    await page.keyboard.insertText('/subj child /rel #2.subj /verb read /obj book\n/subj ( child\n  ) /verb ( love ) /obj ( cat )\n');
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await run(page);
    await app.expectSentences({ en: 'the child who loves the cat reads the book.' });
    await expect(page.getByTestId('transcript-typed')).toHaveCount(2);
    // The source strip holds the whole script, a numbered line per period.
    const lines = page.getByTestId('source-line');
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toContainText('/rel #2.subj');
    await expect(lines.nth(1)).toContainText('/verb ( love ) /obj ( cat )');
  });

  test('grows the prompt with a long line, and breaks it with ⇧↵', async ({ app, page }) => {
    await expect(app.subjectInput).toBeVisible();
    await prompt(page).click();
    const one = await prompt(page).boundingBox();
    await page.keyboard.type('/subj cat /adj brown /pl /that');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('/rel obj /subj dog /verb see');
    await expect(prompt(page)).toHaveValue('/subj ( cat /adj brown /pl /that\n/rel obj { /subj ( dog ) /verb ( see ) } )');
    const two = await prompt(page).boundingBox();
    expect(two!.height).toBeGreaterThan(one!.height * 1.5);
    await run(page);
    await expect(page.getByTestId('period-container')).toHaveCount(2);
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

  test('keeps a pinned line across a reload, and offers it first on ⇥', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj dog /verb run');
    await run(page);
    await page.keyboard.type('/pin');
    await run(page);
    await expect(page.getByTestId('transcript-info').last()).toContainText('Pinned.');
    await page.reload();
    await prompt(page).click();
    await page.keyboard.press('Tab');
    const first = page.getByTestId('console-option').first();
    await expect(first).toHaveAttribute('data-insert', '/subj ( dog ) /verb ( run )');
    await expect(first.getByTestId('console-option-pinned')).toBeVisible();
    await page.keyboard.press('Tab');
    await run(page);
    await app.expectSentences({ en: 'the dog runs.' });
  });

  test('shows a command’s page from the help overlay', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await page.getByTestId('help-button').click();
    await page.getByTestId('console-help-row-rel').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('help-page')).toContainText('/rel #n.noun · /rel subj { … } · /rel obj { … }');
    // The example's sentence, in the interface language.
    await expect(page.getByTestId('transcript-help').getByTestId('transcript-sentence')).toHaveText(
      'the child who loves the cat runs.',
    );
  });
});
