import { test, expect } from './fixtures';

// P12: the instrument made in place is drawn inside the clause that uses it — a noun ring at the
// `object` level, the act and its noun at an action level — with no card and no connector of its own.
// The plan is the one a linked instrument period makes, so every translation is the same.

test.describe('an instrument drawn inside its clause', () => {
  test('is made from the verb’s toggle, in one card, and says “with the stick”', async ({ app, page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await app.buildClauseIn(0, 'MAN', 'CUT');
    await app.setDirectObjectIn(0, 'BOOK');

    await app.period(0).getByTestId('satellite-instrumental').click();
    // No second card: the instrument's word picker is a ring of this period.
    await expect(page.locator('[data-kb-period]')).toHaveCount(1);
    const clause = app.period(0);
    await clause.getByTestId('typeahead-noun').fill('stick');
    await page.locator('[data-testid="typeahead-option"][data-concept="STICK"]').click();

    await app.expectSentences({
      en: 'the man cuts the book with the stick.',
      it: "l'uomo taglia il libro con il bastone.",
      de: 'der Mann schneidet das Buch mit dem Stock.',
      ja: '男は棒で本を切ります。',
    });
    await expect(page.getByTestId('source-strip')).toContainText('/inst { /subj ( stick ) }');

    // Compact view shows its word, as it shows every constituent's (D5).
    await clause.getByTestId('period-compact-toggle').click();
    await expect(clause.getByTestId('hosted-instrument').getByText('stick', { exact: true })).toBeVisible();
    expect(errors.filter((e) => e.includes('Maximum update depth'))).toEqual([]);
  });

  test('turns into an act at the process level, and back', async ({ app, page }) => {
    await app.buildClauseIn(0, 'BOY', 'START');
    await app.setDirectObjectIn(0, 'TRANSLATION');
    const clause = app.period(0);
    await clause.getByTestId('satellite-instrumental').click();

    await clause.getByTestId('instrument-process').click();
    // The act's rings are the instrument's own boxes, drawn in the clause: its verb, then its object.
    const act = clause.getByTestId('hosted-instrument');
    await expect(act).toHaveAttribute('data-level', 'process');
    await act.getByTestId('box-verb').click();
    await act.getByTestId('typeahead-verb').fill('choose');
    await page.locator('[data-testid="typeahead-option"][data-concept="CHOOSE"]').click();
    await act.getByTestId('box-directObject').getByText('Object', { exact: true }).click();
    await act.getByTestId('typeahead-noun').fill('word');
    await page.locator('[data-testid="typeahead-option"][data-concept="WORD"]').click();

    await app.expectSentences({
      en: 'the boy starts the translation by choosing the word.',
      it: 'il ragazzo inizia la traduzione scegliendo la parola.',
    });
    await expect(page.locator('[data-kb-period]')).toHaveCount(1);

    await clause.getByTestId('instrument-concept').click();
    await app.expectSentences({ en: 'the boy starts the translation with the choosing of the word.' });
  });

  test('is drawn as a card of its own, and back inside, without changing what it says', async ({ app, page }) => {
    await app.buildClauseIn(0, 'MAN', 'CUT');
    await app.setDirectObjectIn(0, 'BOOK');
    await app.period(0).getByTestId('satellite-instrumental').click();
    await app.period(0).getByTestId('typeahead-noun').fill('stick');
    await page.locator('[data-testid="typeahead-option"][data-concept="STICK"]').click();
    await app.expectSentences({ en: 'the man cuts the book with the stick.' });

    await app.period(0).getByTestId('instrument-asPeriod').click();
    await expect(page.locator('[data-kb-period]')).toHaveCount(2);
    await app.expectSentences({ en: 'the man cuts the book with the stick.' });

    await app.period(1).getByTestId('instrument-show-in-period').click();
    await expect(page.locator('[data-kb-period]')).toHaveCount(1);
    await app.expectSentences({ en: 'the man cuts the book with the stick.' });
  });

  test('takes R and ⇧N on its clause: the level, and the privative', async ({ app, page }) => {
    await app.buildClauseIn(0, 'MAN', 'CUT');
    await app.setDirectObjectIn(0, 'BOOK');
    await app.period(0).getByTestId('satellite-instrumental').click();
    await app.period(0).getByTestId('hosted-instrument').getByTestId('typeahead-noun').fill('stick');
    await page.locator('[data-testid="typeahead-option"][data-concept="STICK"]').click();
    await app.expectSentences({ en: 'the man cuts the book with the stick.' });

    await page.locator('[data-kb-period]').first().focus();
    await page.keyboard.press('Shift+N');
    await app.expectSentences({ en: 'the man cuts the book without the stick.' });
    await page.keyboard.press('r');
    await expect(app.period(0).getByTestId('hosted-instrument')).toHaveAttribute('data-level', 'process');
  });

  test('goes with the toggle that made it', async ({ app, page }) => {
    await app.buildClauseIn(0, 'MAN', 'CUT');
    await app.period(0).getByTestId('satellite-instrumental').click();
    await app.period(0).getByTestId('hosted-instrument').getByTestId('typeahead-noun').fill('stick');
    await page.locator('[data-testid="typeahead-option"][data-concept="STICK"]').click();
    await app.expectSentences({ en: 'the man cuts with the stick.' });

    await app.period(0).getByTestId('satellite-instrumental').click();
    await app.expectSentences({ en: 'the man cuts.' });
    await expect(page.locator('[data-kb-period]')).toHaveCount(1);
  });
});
