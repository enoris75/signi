import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * Phase 1 of P01: the boxes of a period, and every grammatical control on the words in them,
 * reached without a mouse.
 *
 * The spec drives the page with `page.keyboard` alone, and a counter installed before the first
 * navigation fails it if any pointer event reaches the document at all — so it proves the promise
 * in its title rather than merely exercising the same handlers a click would.
 */

declare global {
  interface Window {
    __pointerEvents: number;
  }
}

/** Count every pointer event the page sees, from the first paint. */
async function watchForPointerEvents(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__pointerEvents = 0;
    for (const type of ['pointerdown', 'mousedown', 'click']) {
      window.addEventListener(type, () => {
        window.__pointerEvents += 1;
      }, true);
    }
  });
}

const pointerEvents = (page: Page) => page.evaluate(() => window.__pointerEvents);

/**
 * Choose a word from the picker that holds the cursor, by walking the highlight down to it with
 * ↓ and taking it with ↵. Naming the concept rather than trusting the first substring match is
 * what keeps "eat" from selecting BEAT (see the Builder fixture).
 */
async function pickWord(page: Page, query: string, conceptId: string): Promise<void> {
  await page.keyboard.type(query);
  const highlighted = page.locator('[data-testid="typeahead-option"][data-highlighted]');
  await expect(highlighted).toBeVisible();
  for (let step = 0; step < 20; step++) {
    if ((await highlighted.getAttribute('data-concept')) === conceptId) break;
    await page.keyboard.press('ArrowDown');
  }
  await expect(highlighted).toHaveAttribute('data-concept', conceptId);
  await page.keyboard.press('Enter');
}

/** The box the cursor rests on, as the page reports it. */
const cursorSlot = (page: Page) =>
  page.evaluate(() => document.activeElement?.closest('[data-kb-box]')?.getAttribute('data-kb-box'));

test.describe('the canvas by keyboard', () => {
  test('composes and edits a period without a pointer event', async ({ app, page }) => {
    await watchForPointerEvents(page);
    await app.goto();

    // The empty period opens on its subject picker, which already holds the cursor. Choosing a
    // word advances to the next empty box, whose picker opens in turn.
    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'eat', 'EAT');
    await pickWord(page, 'mouse', 'MOUSE');
    await app.expectSentences({ en: 'the cat eats the mouse.' });

    // With nothing left to fill the cursor stays on the word just chosen.
    expect(await cursorSlot(page)).toBe('directObject');

    // The arrows are spatial: ← walks back along the row to the subject.
    await page.keyboard.press('ArrowLeft');
    expect(await cursorSlot(page)).toBe('verb');
    await page.keyboard.press('ArrowLeft');
    expect(await cursorSlot(page)).toBe('subject');

    // On a noun, the bare keys are the noun's grammar.
    await page.keyboard.press('n');
    await app.expectSentences({ en: 'the cats eat the mouse.' });

    // A adds the next adjective in the chain and puts the cursor in its picker.
    await page.keyboard.press('a');
    await pickWord(page, 'big', 'BIG');
    await app.expectSentences({ en: 'the big cats eat the mouse.' });

    // ⇥ walks the boxes in reading order, out of the subject group and on to the verb.
    await page.keyboard.press('Tab');
    expect(await cursorSlot(page)).toBe('verb');

    // The same N is the negation here, and T cycles the tense — no modifier tells them apart,
    // the level the cursor is on does.
    await page.keyboard.press('n');
    await page.keyboard.press('t');
    await app.expectSentences({ en: 'the big cats did not eat the mouse.' });

    // ⇧T runs the cycle back the way it came.
    await page.keyboard.press('Shift+T');
    await app.expectSentences({ en: 'the big cats do not eat the mouse.' });

    // The whole period in every language the engine speaks.
    await app.expectSentences({
      en: 'the big cats do not eat the mouse.',
      it: 'i grandi gatti non mangiano il topo.',
      fr: 'les grands chats ne mangent pas la souris.',
      de: 'die großen Kater essen die Maus nicht.',
      es: 'los gatos grandes no comen el ratón.',
      pt: 'os gatos grandes não comem o rato.',
      ja: '大きい猫はネズミを食べません。',
    });

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });

  test('reaches the determiner menu and the object’s fold-away control by key', async ({
    app,
    page,
  }) => {
    await watchForPointerEvents(page);
    await app.goto();

    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'eat', 'EAT');
    await pickWord(page, 'mouse', 'MOUSE');

    // D reveals the subject's determiner box on the way to opening its menu.
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('d');
    await expect(page.getByTestId('box-subjectDefiniteness')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /^Indefinite/ })).toBeVisible();
    await page.keyboard.press('Escape');

    // O on the verb folds the direct object's box away, as its control does — a view toggle, so
    // the word stays in the period and in the sentence.
    await page.keyboard.press('Tab');
    expect(await cursorSlot(page)).toBe('verb');
    await page.keyboard.press('o');
    await expect(page.getByTestId('box-directObject')).toBeHidden();
    await app.expectSentences({ en: 'the cat eats the mouse.' });

    await page.keyboard.press('o');
    await expect(page.getByTestId('box-directObject')).toBeVisible();

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });

  test('shows the cursor’s keys, and teaches each control the key it answers to', async ({
    app,
    page,
  }) => {
    await watchForPointerEvents(page);
    await app.goto();

    await pickWord(page, 'cat', 'CAT');
    // RUN takes nothing more, so the cursor stays on the verb box rather than falling off the
    // canvas with the picker that closed.
    await pickWord(page, 'run', 'RUN');
    expect(await cursorSlot(page)).toBe('verb');

    // ↵ opens the word picker over the word, and esc steps back out onto the box — where the hint
    // line says what the keys do here and the box's own controls wear their letters.
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('typeahead-verb')).toBeFocused();
    await page.keyboard.press('Escape');
    expect(await cursorSlot(page)).toBe('verb');

    const hints = page.getByTestId('hint-line');
    await expect(hints).toContainText('Tense');
    await expect(hints).toContainText('Aspect');
    await expect(page.getByTestId('satellite-verbTense').locator('[data-kb-tip]')).toHaveText('T');

    // Every control names its key in its tooltip, whoever is driving — but never in its
    // accessible name, which a screen reader would then read the cap as part of.
    await expect(page.getByTestId('satellite-verbTense')).toHaveAttribute(
      'aria-keyshortcuts',
      'T',
    );

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });
});
