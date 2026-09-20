import { test, expect } from './fixtures';

// Per-modal adverbs: every verb in a modal group can carry its own adverb — the main verb via the
// Adverb satellite, each modal via its own adverb satellite. "the cat never wants to always
// eat" puts NEVER on the volition modal (WILL) and ALWAYS on the main verb (EAT), two adverbs at
// two scope points in one group. This drives the real satellites and covers the v5 save/load
// round-trip of the two new selection fields.
test.describe('per-modal adverbs', () => {
  // Reveal a satellite from its control, type its search text, and pick the concept row. The control
  // is found by its key: the verb's adverb and a modal's adverb are both named "Show the adverb".
  const openAndPick = async (
    { page }: { page: import('@playwright/test').Page },
    satellite: string,
    placeholder: RegExp,
    query: string,
    concept: string,
  ) => {
    await page.getByTestId(`satellite-${satellite}`).click();
    await page.getByPlaceholder(placeholder).last().fill(query);
    await page.locator(`[data-testid="typeahead-option"][data-concept="${concept}"]`).click();
  };

  test('a modal adverb and a main-verb adverb render at their own scopes', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');

    await openAndPick({ page }, 'verbModal', /type a modal/, 'want', 'WILL');
    await openAndPick({ page }, 'verbModalAdverb', /type an adverb/, 'never', 'NEVER');
    await openAndPick({ page }, 'modifier', /type an adverb/, 'always', 'ALWAYS');

    expect(await app.sentence('en')).toBe('the cat never wants to always eat.');
    expect(await app.sentence('de')).toBe('der Kater will nie immer fressen.');
    expect(await app.sentence('it')).toBe('il gatto non vuole mai mangiare sempre.');
  });

  test('the modal adverb survives a v5 save/load round-trip', async ({ app, page }, testInfo) => {
    const name = `Modal adverb ${testInfo.testId}-${testInfo.repeatEachIndex}`;

    await app.buildClause('CAT', 'EAT');
    await openAndPick({ page }, 'verbModal', /type a modal/, 'want', 'WILL');
    await openAndPick({ page }, 'verbModalAdverb', /type an adverb/, 'never', 'NEVER');
    await expect.poll(() => app.sentence('en')).toBe('the cat never wants to eat.');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const saveDialog = page.getByRole('dialog');
    await saveDialog.getByLabel('Name').fill(name);
    await saveDialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved phrase')).toBeVisible();

    await app.goto();
    await expect(page.getByTestId('translations-empty')).toBeVisible();

    await page.getByRole('button', { name: 'Load a saved phrase' }).click();
    await page.getByRole('dialog').getByText(name).click();
    await expect(page.getByText('Loaded phrase')).toBeVisible();

    // The modal (WILL) AND its own adverb (NEVER) both come back — the v5 round-trip.
    await expect.poll(() => app.sentence('en')).toBe('the cat never wants to eat.');
  });
});
