import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// Every row of a picker names the word's synonyms (≈) and antonyms (↔), in the UI language, under
// its definition. The pairs are seeded once per meaning (backend concepts/relations.ts), so the
// same pair reads in every language. The row itself has unit tests
// (packages/frontend/test/ConceptOption.test.tsx); this spec checks the seeded pairs reach it.
test.describe('synonyms and antonyms in the picker', () => {
  const row = (page: Page, id: string) =>
    page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);

  test('an adjective names its antonyms, in English and in Italian', async ({ app, page }) => {
    await app.setSubject('CAT');
    await app.openSubjectAdjective('old');
    await expect(row(page, 'OLD').getByTestId('option-antonyms')).toHaveText('↔ new, young');

    await app.setUiLanguage('it');
    await app.openSubjectAdjective('vecchio');
    await expect(row(page, 'OLD').getByTestId('option-antonyms')).toHaveText('↔ nuovo, giovane');
  });

  test('a verb names its synonym, and leaves it out where the two share a word', async ({ app, page }) => {
    await app.setSubject('CAT');
    await app.verbInput.fill('start');
    await expect(row(page, 'START').getByTestId('option-synonyms')).toHaveText('≈ begin');
    await expect(row(page, 'START').getByTestId('option-antonyms')).toHaveText('↔ stop');

    // BEGIN and START are both *iniziare*: "iniziare ≈ iniziare" would say nothing.
    await app.setUiLanguage('it');
    await app.verbInput.fill('iniziare');
    await expect(row(page, 'START').getByTestId('option-antonyms')).toHaveText('↔ fermare');
    await expect(row(page, 'START').getByTestId('option-synonyms')).toHaveCount(0);
  });
});
