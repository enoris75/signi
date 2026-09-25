import { test, expect } from './fixtures';

// P15: the verb chains up to three adverbs, each revealed from the adverb before it, and every
// engine places each by its class — "the cat often eats fast here".
test.describe('several adverbs', () => {
  const openAndPick = async (
    page: import('@playwright/test').Page,
    satellite: string,
    query: string,
    concept: string,
  ) => {
    await page.getByTestId(`satellite-${satellite}`).click();
    await page.getByPlaceholder(/type an adverb/).last().fill(query);
    await page.locator(`[data-testid="typeahead-option"][data-concept="${concept}"]`).click();
  };

  test('each adverb reveals the next, and the sentence places all three', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');

    // The second adverb's control only exists once the first holds a word.
    await expect(page.getByTestId('satellite-modifier2')).toHaveCount(0);
    await openAndPick(page, 'modifier', 'often', 'OFTEN');
    await openAndPick(page, 'modifier2', 'fast', 'FAST');
    await openAndPick(page, 'modifier3', 'here', 'HERE');

    await expect.poll(() => app.sentence('en')).toBe('the cat often runs here fast.');
    expect(await app.sentence('it')).toBe('il gatto corre spesso velocemente qui.');
    expect(await app.sentence('ja')).toBe('猫はよくここで速く走ります。');
  });
});
