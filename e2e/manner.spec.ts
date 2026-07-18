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

    // A measure adverbial is fixed bare — the determiner is not user-changeable — so its
    // determiner satellite is withdrawn (the subject keeps its own).
    await expect(page.getByTestId('satellite-mannerDefiniteness')).toHaveCount(0);
    await expect(page.getByTestId('satellite-subjectDefiniteness')).toBeVisible();
  });

  // An adjective-modified measure names a *generic* rate ("at high speed"), so the definite
  // article the plain case carries would read oddly ("at the high speed"). The engine forces it
  // bare end-to-end, the moment the adjective is added — no determiner input involved.
  test('an adjective on a measure adverbial renders bare, not "at the high speed"', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'RUN');
    await page.getByRole('button', { name: 'Show Adverbial of manner' }).click();

    const box = page.getByTestId('box-manner');
    await box.getByTestId('typeahead-noun').fill('speed');
    await page.locator('[data-testid="typeahead-option"][data-concept="SPEED"]').click();

    // Reveal the adjective satellite on the manner box and pick HIGH.
    await page.getByTestId('satellite-mannerAdjective').click();
    const adjInput = page.getByTestId('box-mannerAdjective').getByPlaceholder('type an adjective…');
    await adjInput.fill('high');
    await page.locator('[data-testid="typeahead-option"][data-concept="HIGH"]').click();

    expect(await app.sentence('en')).toBe('the cat runs at high speed.');
    expect(await app.sentence('it')).toBe('il gatto corre a velocità alta.');
    expect(await app.sentence('de')).toBe('der Kater läuft mit hoher Geschwindigkeit.');
  });

  // A similative manner noun (WATER, "like the water") *does* keep a user-changeable determiner —
  // the withdrawal is specific to the measure relation, so its determiner satellite is present.
  test('a similative manner adverbial keeps its determiner control', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await page.getByRole('button', { name: 'Show Adverbial of manner' }).click();

    const box = page.getByTestId('box-manner');
    await box.getByTestId('typeahead-noun').fill('water');
    await page.locator('[data-testid="typeahead-option"][data-concept="WATER"]').click();

    // The similative manner adverbial keeps its own determiner reveal control.
    await expect(page.getByTestId('satellite-mannerDefiniteness')).toBeVisible();
  });
});
