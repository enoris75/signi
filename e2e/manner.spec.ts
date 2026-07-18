import { test, expect } from './fixtures';

// The adverbial of manner (complemento di modo) is a noun-phrase complement whose preposition is
// a property of the head noun's meaning, not a choice the user makes: SPEED is a measure, so it
// renders "at the speed" the moment it is picked — there is no specifier control to set.
test.describe('adverbial of manner', () => {
  test('reveals the manner slot and derives the preposition from the head noun', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'RUN');

    // Reveal the manner complement from its toggle on the verb-phrase box. The toggle's
    // accessible name is "Show <slot label>", the label being the engine-rendered grammar term.
    await page.getByRole('button', { name: 'Show Adverbial of manner' }).click();

    // Pick SPEED — a measure noun. The engine chooses "at" (con → alla) with no user input.
    const box = page.getByTestId('box-manner');
    await box.getByTestId('typeahead-noun').fill('speed');
    await page
      .locator('[data-testid="typeahead-option"][data-concept="SPEED"]')
      .click();

    expect(await app.sentence('it')).toBe('il gatto corre alla velocità.');
    expect(await app.sentence('en')).toBe('the cat runs at the speed.');

    // There is no preposition selector on the manner box — the relation is not user-chosen.
    await expect(page.getByRole('button', { name: 'at — measure / degree' })).toHaveCount(0);
  });
});
