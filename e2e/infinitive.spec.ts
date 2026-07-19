import { test, expect } from './fixtures';

// The infinitive-phrase toggle on the Period Container (Phase 4): a sibling of the imperative
// toggle. Turning it on drops the subject box, replaces it with the infinitive box, and renders
// the verb group as a dictionary citation ("to consume the food") in every language.
test.describe('infinitive phrase toggle', () => {
  const toggle = 'Toggle infinitive phrase (citation)';

  test('drops the subject and renders a citation', async ({ app, page }) => {
    await page.getByLabel(toggle).click();

    // The subject box is gone, replaced by the infinitive box (captioned from the seeded concept).
    await expect(app.subjectInput).toHaveCount(0);
    await expect(page.getByTestId('infinitive-box')).toBeVisible();
    await expect(page.getByTestId('infinitive-box')).toContainText('Infinitive phrase');

    // Pick the verb and its object — the citation's whole content.
    await app.setVerb('CONSUME');
    await app.setDirectObject('FOOD');

    expect(await app.sentence('en')).toBe('to consume the food.');
    expect(await app.sentence('it')).toBe('consumare il cibo.');
    expect(await app.sentence('de')).toBe('das Essen konsumieren.');
    expect(await app.sentence('es')).toBe('consumir la comida.');
    expect(await app.sentence('ja')).toBe('食べ物を摂取する。');
  });

  test('toggling off restores the subject box', async ({ app, page }) => {
    await page.getByLabel(toggle).click();
    await expect(app.subjectInput).toHaveCount(0);
    await page.getByLabel(toggle).click();
    await expect(app.subjectInput).toBeVisible();
    await expect(page.getByTestId('infinitive-box')).toHaveCount(0);
  });

  test('is mutually exclusive with the imperative — turning one on clears the other', async ({ app }) => {
    const page = app.page;
    await page.getByLabel('Toggle imperative (command)').click();
    // The command box is up (its caption is the localized COMMAND noun).
    await expect(page.getByText('Command', { exact: true })).toBeVisible();
    // Turning on the infinitive clears the command: the infinitive box replaces the command box.
    await page.getByLabel(toggle).click();
    await expect(page.getByTestId('infinitive-box')).toBeVisible();
    await expect(page.getByText('Command', { exact: true })).toHaveCount(0);
  });
});
