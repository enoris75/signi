import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// Secondary lexemes (P09-E23): a second word finds a concept in the picker — *talk* finds SPEAK,
// *cominciare* finds BEGIN — and the row, the box and every translation still read the primary
// word. The haystack has unit tests (packages/frontend/test/VerbTypeahead.test.tsx); this spec checks
// the seeded rows reach the picker through /api/concepts.
test.describe('aliases', () => {
  const option = (app: { page: Page }, id: string) =>
    app.page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);

  test('typing talk in the verb picker finds SPEAK, which reads as speak', async ({ app }) => {
    await app.setSubject('CAT');
    await expect(app.verbInput).toBeVisible();
    await app.verbInput.fill('talk');

    await expect(option(app, 'SPEAK')).toBeVisible();
    await expect(option(app, 'SPEAK')).toContainText('speak');
    await expect(option(app, 'SPEAK')).not.toContainText('talk');

    await option(app, 'SPEAK').click();
    await app.expectSentences({ en: 'the cat speaks.', it: 'il gatto parla.' });
  });

  test('in the Italian UI, typing cominc finds BEGIN, shown as iniziare', async ({ app }) => {
    await app.setUiLanguage('it');
    await app.setSubject('CAT');
    await expect(app.verbInput).toBeVisible();
    await app.verbInput.fill('cominc');

    await expect(option(app, 'BEGIN')).toBeVisible();
    await expect(option(app, 'BEGIN')).toContainText('iniziare');
  });
});
