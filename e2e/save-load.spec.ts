import { test, expect } from './fixtures';

// The round trip through the database: a workspace is serialised, stored, and rehydrated
// against the live concept catalog. This is the one spec that writes rows, which is why the
// suite runs against its own freshly seeded database (see e2e/serveBackend.ts) rather than
// the dev server's.
test.describe('saved phrases', () => {
  test('saves a clause and loads it back after a reload', async ({ app, page }, testInfo) => {
    // The database lives for the whole run, so the name has to be unique per test — otherwise
    // a repeat (or a retry) saves a second row under the same name and the load dialog offers
    // two identical rows to click.
    const name = `Cat clause ${testInfo.testId}-${testInfo.repeatEachIndex}`;

    await app.buildClause('CAT', 'EAT');
    await expect.poll(() => app.sentence('en')).toBe('the cat eats.');

    // `exact` matters: the header also carries "Save the period" and "Load a saved phrase",
    // both of which a substring match would pull in.
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const saveDialog = page.getByRole('dialog');
    await saveDialog.getByLabel('Name').fill(name);
    await saveDialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved phrase')).toBeVisible();

    // Come back to an empty builder — the workspace itself isn't persisted client-side.
    await app.goto();
    await expect(page.getByTestId('translations-empty')).toBeVisible();

    // Load's tooltip puts an aria-label on the button itself, which overrides its visible text
    // as the accessible name. (Save escapes that: it's wrapped in a span for its disabled
    // state, so the tooltip labels the span instead.)
    await page.getByRole('button', { name: 'Load a saved phrase' }).click();
    const loadDialog = page.getByRole('dialog');
    await loadDialog.getByText(name).click();

    await expect(page.getByText('Loaded phrase')).toBeVisible();
    await expect.poll(() => app.sentence('en')).toBe('the cat eats.');
    expect(await app.sentence('it')).toBe('il gatto mangia.');
  });

  // The file round trip: export downloads a `.signi.json`, import reads it back through the same
  // hydration as a database load. Built on a two-period workspace with a condition link, so the
  // file carries links as well as selections.
  test('exports a workspace to a file and imports it back', async ({ app, page }, testInfo) => {
    await app.buildClauseIn(0, 'DOG', 'RUN');
    await app.addPeriod();
    await app.buildClauseIn(1, 'CAT', 'EAT');
    await app.linkCondition(0, 1);
    await expect.poll(() => app.sentence('en')).toBe('if the cat ate, the dog would run.');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export the phrase' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('untitled-phrase.signi.json');
    const file = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(file);

    await app.goto();
    await expect(page.getByTestId('translations-empty')).toBeVisible();

    // Import's button only clicks a hidden file input, so the file goes to the input directly.
    await page.locator('input[type="file"]').setInputFiles(file);
    await expect(page.getByText('Loaded phrase')).toBeVisible();

    await expect.poll(() => app.sentence('en')).toBe('if the cat ate, the dog would run.');
    expect(await app.sentence('it')).toBe('se il gatto mangiasse, il cane correrebbe.');
  });
});
