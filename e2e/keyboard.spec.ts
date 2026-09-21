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

/**
 * Count every pointer event the *user agent* sends, from the first paint.
 *
 * Only trusted events: a key that presses a control the app already has — the way J opens the
 * conjunction menu, or a digit takes a numbered pick target — dispatches a click from script, and
 * that is still the keyboard driving. `isTrusted` is exactly the line between the two.
 */
async function watchForPointerEvents(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__pointerEvents = 0;
    for (const type of ['pointerdown', 'mousedown', 'click']) {
      window.addEventListener(type, (event) => {
        if (event.isTrusted) window.__pointerEvents += 1;
      }, true);
    }
  });
}

const pointerEvents = (page: Page) => page.evaluate(() => window.__pointerEvents);

/**
 * Wait for the cursor to land in a word picker.
 *
 * Choosing a word advances to the next empty box, whose picker mounts and takes the cursor — a
 * render later. Typing into the gap would put the first letters of the next word nowhere.
 */
async function pickerReady(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.tagName))
    .toBe('INPUT');
}

/**
 * Choose a word from the picker that holds the cursor, by walking the highlight down to it with
 * ↓ and taking it with ↵. Naming the concept rather than trusting the first substring match is
 * what keeps "eat" from selecting BEAT (see the Builder fixture).
 */
async function pickWord(
  page: Page,
  query: string,
  conceptId: string,
  // ↵ chooses; ⇥ chooses and moves on to the next box (the plan's §4.5).
  commit: 'Enter' | 'Tab' = 'Enter',
): Promise<void> {
  await pickerReady(page);
  await page.keyboard.type(query);
  const highlighted = page.locator('[data-testid="typeahead-option"][data-highlighted]');
  await expect(highlighted).toBeVisible();
  for (let step = 0; step < 20; step++) {
    if ((await highlighted.getAttribute('data-concept')) === conceptId) break;
    await page.keyboard.press('ArrowDown');
  }
  await expect(highlighted).toHaveAttribute('data-concept', conceptId);
  await page.keyboard.press(commit);
}

/**
 * Step out to the period the cursor is in.
 *
 * esc steps out exactly one level, and the cursor may be three deep — inside an open picker,
 * inside the box it belongs to, inside the period — so the way out is one esc per level.
 */
async function toPeriod(page: Page): Promise<void> {
  const onCard = () =>
    page.evaluate(() => document.activeElement?.hasAttribute('data-kb-period') ?? false);
  for (let level = 0; level < 4 && !(await onCard()); level++) {
    await page.keyboard.press('Escape');
  }
  expect(await onCard(), 'the cursor is on the period').toBe(true);
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
      de: 'die großen Kater fressen die Maus nicht.',
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

  test('chooses a word without the picker’s mouse: tabs, the pronoun grid, and ⇥', async ({
    app,
    page,
  }) => {
    await watchForPointerEvents(page);
    await app.goto();

    // ↑ from the first row moves up into the Noun / Pronoun tabs, → switches to the pronoun
    // chooser, and its three rows are one grid: 1–4 a person, ↑ ↓ a row, ← → its value.
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Pronoun' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page.keyboard.press('2');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');

    // ⇥ takes the highlighted word and moves on to the next box.
    await pickWord(page, 'eat', 'EAT', 'Tab');
    expect(await cursorSlot(page)).toBe('directObject');

    await pickWord(page, 'mouse', 'MOUSE');
    await app.expectSentences({
      en: 'you eat the mouse.',
      // Italian drops a subject pronoun the verb's own ending already carries.
      it: 'mangiate il topo.',
    });

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });

  test('picks from every menu one keystroke after the key that opened it', async ({
    app,
    page,
  }) => {
    await watchForPointerEvents(page);
    await app.goto();

    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'run', 'RUN');

    // + gathers the complements this verb licenses; L adds the locative and lands in its picker.
    await page.keyboard.press('+');
    await expect(page.getByTestId('complement-row-locative')).toBeVisible();
    await page.keyboard.press('l');
    await pickWord(page, 'house', 'HOUSE');
    await app.expectSentences({ en: 'the cat runs in the house.' });

    // S points the next key at the locative's relation toolbar, where U is "under".
    await page.keyboard.press('s');
    await page.keyboard.press('u');
    await app.expectSentences({ en: 'the cat runs under the house.' });

    // D opens the determiner menu, where a digit counts down the rows.
    await page.keyboard.press('d');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('2');
    await app.expectSentences({ en: 'the cat runs under a house.' });

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });

  test('builds a relative clause across two periods without a pointer event', async ({
    app,
    page,
  }) => {
    await watchForPointerEvents(page);
    await app.goto();

    await pickWord(page, 'child', 'CHILD');
    await pickWord(page, 'read', 'READ');
    await pickWord(page, 'book', 'BOOK');

    // esc steps out of the box onto the period a level above it, where the period's own keys are.
    await toPeriod(page);
    // The hint line now says what the keys do *here*, a level up from the boxes.
    await expect(page.getByTestId('hint-line')).toContainText('Command');
    // I is named by the badge the period wears once it is a condition (`clause.conditional`).
    await expect(page.getByTestId('hint-line')).toContainText('Conditional clause');

    // N is one more period, and ↵ goes into it at its subject.
    await page.keyboard.press('n');
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    // N leaves the cursor in the period it made, on the subject it opens on.
    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'love', 'LOVE');
    await pickWord(page, 'book', 'BOOK');

    // R on the first period's object starts the clause that will describe it; the nouns it could
    // describe are numbered where they sit, and a digit takes one.
    await toPeriod(page);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    expect(await cursorSlot(page)).toBe('directObject');
    await page.keyboard.press('r');
    await expect(page.getByTestId('pick-banner')).toBeVisible();
    // Both nouns of the other period could be the gap, numbered in the order they stand.
    await expect(page.locator('[data-kb-pick-index="1"]')).toBeVisible();
    await expect(page.locator('[data-kb-pick-index="2"]')).toBeVisible();

    // 2 is its object: the book is what the cat loves, so the object is the gap the head fills.
    await page.keyboard.press('2');
    await expect(page.getByTestId('pick-banner')).toBeHidden();
    await app.expectSentences({ en: 'the child reads the book that the cat loves.' });

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });

  test('makes one period the condition of another, and abandons a pick on esc', async ({
    app,
    page,
  }) => {
    await watchForPointerEvents(page);
    await app.goto();

    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'run', 'RUN');
    await toPeriod(page);
    await page.keyboard.press('n');
    await pickWord(page, 'child', 'CHILD');
    await pickWord(page, 'read', 'READ');
    await toPeriod(page);

    // esc abandons a pick without taking anything.
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('i');
    await expect(page.getByTestId('pick-banner')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('pick-banner')).toBeHidden();

    // And the same key, taken through: the second period becomes the if-clause of the first.
    await page.keyboard.press('i');
    await page.keyboard.press('1');
    // The engine puts the pair in the conditional mood English spells with "would".
    await app.expectSentences({ en: 'if the child read, the cat would run.' });

    // I again drops the condition it made.
    await page.keyboard.press('i');
    await app.expectSentences({ en: 'the cat runs.' });

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });

  test('reaches every region of the page, and the header’s controls, by key', async ({
    app,
    page,
  }) => {
    await watchForPointerEvents(page);
    await app.goto();

    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'run', 'RUN');
    await app.expectSentences({ en: 'the cat runs.' });

    const region = () =>
      page.evaluate(
        () =>
          document.activeElement?.closest('[data-kb-region]')?.getAttribute('data-kb-region') ??
          null,
      );
    expect(await region()).toBe('periods');

    // F6 walks the page's landmarks. The words panel is hidden, so it is not one of them yet; the
    // console, shown on a first visit, is the last (P02).
    await page.keyboard.press('F6');
    expect(await region()).toBe('translations');
    await page.keyboard.press('F6');
    expect(await region()).toBe('console');
    await page.keyboard.press('F6');
    expect(await region()).toBe('header');

    // The header is one stop, walked with the arrows; ← → move along it.
    const focused = () => page.evaluate(() => document.activeElement?.textContent ?? '');
    const first = await focused();
    await page.keyboard.press('ArrowRight');
    expect(await focused()).not.toBe(first);

    // ↑ ↓ walk the translations, and C copies the row the cursor is on. Back from the header, the
    // walk goes by the console first.
    await page.keyboard.press('Shift+F6');
    expect(await region()).toBe('console');
    await page.keyboard.press('Shift+F6');
    expect(await region()).toBe('translations');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('c');
    await expect(page.getByTestId('translation-it').getByRole('button')).toBeVisible();

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });

  test('opens the words panel and the help overlay on their chords', async ({ app, page }) => {
    await watchForPointerEvents(page);
    await app.goto();

    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'run', 'RUN');

    // Ctrl B opens the words panel with the cursor inside it; esc puts the cursor back.
    await page.keyboard.press('ControlOrMeta+b');
    await expect(page.locator('[data-kb-region="words"]')).not.toHaveAttribute('inert', '');
    await expect
      .poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[data-kb-word]'))))
      .toBe(true);

    await page.keyboard.press('Escape');
    expect(await cursorSlot(page)).not.toBeNull();

    // ? opens the help, whose keyboard section lists every binding there is.
    await page.keyboard.press('?');
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText('Anywhere')).toBeVisible();
    // Exactly, since the sheet also lists the backwards twin the same key takes with ⇧ — and within
    // the keyboard section, since the console's reference below it has a /tense of its own.
    const keys = sheet.getByRole('region', { name: 'Keyboard navigation' });
    await expect(keys.getByText('Tense', { exact: true })).toBeVisible();

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

  test('removes a period at once, and takes it back on Ctrl Z', async ({ app, page }) => {
    await watchForPointerEvents(page);
    // Nothing may ask whether a destructive key was meant — the page offers the way back
    // instead (the plan's §3.9). Any dialog the page opens is recorded here.
    const dialogs: string[] = [];
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.message());
      void dialog.dismiss();
    });
    await app.goto();

    await pickWord(page, 'cat', 'CAT');
    await pickWord(page, 'run', 'RUN');
    await toPeriod(page);
    await page.keyboard.press('n');
    await pickWord(page, 'child', 'CHILD');
    await pickWord(page, 'read', 'READ');
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await app.expectSentences({ en: 'the cat runs.' });

    // ⌫ removes the period the cursor is on. It goes, and the page says so.
    await toPeriod(page);
    await page.keyboard.press('Backspace');

    await expect(page.getByTestId('period-container')).toHaveCount(1);
    expect(dialogs, 'the page asked before removing').toEqual([]);
    await expect(page.getByTestId('undo-toast')).toBeVisible();

    // And the key the toast offers puts the period back, words and all.
    await page.keyboard.press('ControlOrMeta+z');

    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await expect(page.getByTestId('translation-en').getByTestId('sentence')).toHaveCount(2);
    await expect(page.getByTestId('translation-en')).toContainText('the child reads.');

    // Forward again, to where ⌫ left it.
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect(page.getByTestId('period-container')).toHaveCount(1);

    expect(await pointerEvents(page), 'the page saw a pointer event').toBe(0);
  });
});

/**
 * The help overlay is the one surface the key and the icon both open, so this is the one test that
 * is allowed a pointer: it is about the way in for whoever is using a mouse.
 */
test.describe('the help overlay', () => {
  test('opens from the corner icon, with the keyboard section in it', async ({ app, page }) => {
    await app.goto();

    await page.getByTestId('help-button').click();

    const overlay = page.getByTestId('help-overlay');
    await expect(overlay.getByRole('heading', { name: 'Help' })).toBeVisible();
    await expect(overlay.getByRole('heading', { name: 'Keyboard navigation' })).toBeVisible();
    // Read off the keymaps: the levels, and the caps of a binding at each.
    await expect(overlay.getByText('Anywhere')).toBeVisible();
    // The keyboard section's, first: the console's reference below heads a part "Period" too (A21).
    await expect(overlay.getByText('Period', { exact: true }).first()).toBeVisible();
    // ⇧↑ is named as the header button it presses is.
    await expect(overlay.getByText('Move this period up')).toBeVisible();

    await overlay.getByRole('button', { name: 'Cancel' }).click();
    await expect(overlay).toBeHidden();

    // And the key opens the same overlay, from wherever the cursor is.
    await page.keyboard.press('?');
    await expect(page.getByTestId('help-overlay')).toBeVisible();
  });

  // The keys' names are the catalogue's wherever the words are seeded, so they follow the interface
  // language: the picker's strip, the hint line, and the sheet's headings and rows.
  test('names the keys in the interface language', async ({ app, page }) => {
    await app.setUiLanguage('it');

    // A key typed in the picker makes the page a keyboard user's, and the strip under the list
    // says what its keys do.
    await app.subjectInput.focus();
    await page.keyboard.type('gat');
    const footer = page.getByTestId('picker-footer-list');
    await expect(footer).toContainText('sposta');
    await expect(footer).toContainText('scegli');
    await expect(footer).toContainText('chiudi');

    await page.getByTestId('help-button').click();
    // The keyboard section, not the console's reference below it, which names /if the same way.
    // Its own name is still English (B41).
    const keys = page
      .getByTestId('help-overlay')
      .getByRole('region', { name: 'Keyboard navigation' });
    await expect(keys.getByText('Periodo', { exact: true })).toBeVisible();
    await expect(keys.getByText('Soggetto del comando', { exact: true })).toBeVisible();
    await expect(keys.getByText('Traduzioni e parole', { exact: true })).toBeVisible();
    await expect(keys.getByText('Sposta questo periodo su', { exact: true })).toBeVisible();
    await expect(keys.getByText('Proposizione condizionale', { exact: true })).toBeVisible();
    await expect(keys.getByText('Sostituisci la parola', { exact: true })).toBeVisible();
    await expect(keys.getByText('Parole: Mappa di parole', { exact: true })).toBeVisible();
    // The strip's bare command, which the sheet starts on a capital with CSS rather than in the text.
    const move = keys.getByText('sposta', { exact: true }).first();
    await expect(move).toBeVisible();
    expect(
      await move.evaluate((el) => getComputedStyle(el, '::first-letter').textTransform),
    ).toBe('uppercase');
  });
});
