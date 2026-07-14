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
    await expect(page.getByText('Phrase saved.')).toBeVisible();

    // Come back to an empty builder — the workspace itself isn't persisted client-side.
    await app.goto();
    await expect(page.getByTestId('translations-empty')).toBeVisible();

    // Load's tooltip puts an aria-label on the button itself, which overrides its visible text
    // as the accessible name. (Save escapes that: it's wrapped in a span for its disabled
    // state, so the tooltip labels the span instead.)
    await page.getByRole('button', { name: 'Load a saved phrase' }).click();
    const loadDialog = page.getByRole('dialog');
    await loadDialog.getByText(name).click();

    await expect(page.getByText('Phrase loaded.')).toBeVisible();
    await expect.poll(() => app.sentence('en')).toBe('the cat eats.');
    expect(await app.sentence('it')).toBe('il gatto mangia.');
  });
});
