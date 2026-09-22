import { test, expect } from './fixtures';

// Per-word polarity (A03): every verb in a modal group carries its own negation — the main verb via
// the verb box's polarity control, each modal via the one on its own box. "I do not want to not go"
// is both of them set, a sentence no plan could write while one flag denied the whole group. This
// drives the real controls, and covers the v8 save/load round-trip of the two new selection fields.
test.describe('modal polarity', () => {
  // The polarity control is a direct toggle: its ring icon flips the value in place, with no box to
  // reveal. Each is found by its key — the verb's own, and the one on the modal's box.
  const negate = async ({ page }: { page: import('@playwright/test').Page }, satellite: string) => {
    await page.getByTestId(`satellite-${satellite}`).click();
  };

  const pickModal = async ({ page }: { page: import('@playwright/test').Page }, concept: string, query: string) => {
    await page.getByTestId('satellite-verbModal').click();
    await page.getByPlaceholder(/type a modal/).last().fill(query);
    await page.locator(`[data-testid="typeahead-option"][data-concept="${concept}"]`).click();
  };

  test('the modal and the verb are denied one at a time, and together', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await pickModal({ page }, 'WILL', 'want');

    // The modal's own control denies the modal: the reading a single flag always had.
    await negate({ page }, 'verbModalNegative');
    await expect.poll(() => app.sentence('en')).toBe('the cat does not want to eat.');
    expect(await app.sentence('it')).toBe('il gatto non vuole mangiare.');

    // The verb's own control denies the verb it is drawn on, which is the new scope.
    await negate({ page }, 'verbModalNegative');
    await negate({ page }, 'verbNegative');
    await expect.poll(() => app.sentence('en')).toBe('the cat wants to not eat.');
    expect(await app.sentence('it')).toBe('il gatto vuole non mangiare.');

    // Both at once — the sentence this feature was asked for.
    await negate({ page }, 'verbModalNegative');
    await expect.poll(() => app.sentence('en')).toBe('the cat does not want to not eat.');
    expect(await app.sentence('it')).toBe('il gatto non vuole non mangiare.');
    expect(await app.sentence('ja')).toBe('猫は食べないでいたくないです。');
  });

  test('a phrase saved before the change still says what it said', async ({ app, page }, testInfo) => {
    const name = `Modal polarity ${testInfo.testId}-${testInfo.repeatEachIndex}`;

    await app.buildClause('CAT', 'EAT');
    await pickModal({ page }, 'WILL', 'want');
    await negate({ page }, 'verbModalNegative');
    await expect.poll(() => app.sentence('en')).toBe('the cat does not want to eat.');

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

    // The modal (WILL) and its own negation both come back — the v8 round-trip.
    await expect.poll(() => app.sentence('en')).toBe('the cat does not want to eat.');
  });
});
