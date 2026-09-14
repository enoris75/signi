import { test, expect } from './fixtures';

// Every string of chrome in this app is rendered by the engine from a seeded period rather
// than hardcoded, so switching the interface language is a translation round-trip like any
// other. These guard that path: the labels, the slot placeholders, and the words in the
// pickers all follow the selector.
test.describe('interface language', () => {
  test('translates the chrome, the placeholders and the concept words', async ({ app, page }) => {
    await expect(page.getByRole('heading', { name: 'Translations' })).toBeVisible();
    await expect(app.subjectInput).toHaveAttribute('placeholder', 'type a subject…');

    await app.setUiLanguage('it');

    await expect(page.getByRole('heading', { name: 'Traduzioni' })).toBeVisible();
    await expect(app.subjectInput).toHaveAttribute('placeholder', 'digita un soggetto…');
    await expect(page.getByText('creatore di frasi semantiche')).toBeVisible();

    // Concept labels localize too: the picker offers the Italian word for the same concept.
    await app.subjectInput.fill('gatto');
    await expect(
      page.locator('[data-testid="typeahead-option"][data-concept="CAT"]'),
    ).toHaveText('gatto');
  });

  test('names the canvas controls after the part they act on, in the UI language', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'EAT');
    await expect(app.satellite('subjectAdjective')).toHaveAttribute('aria-label', 'Show the adjective');

    await app.setUiLanguage('it');

    // The command sits on the part's own grammar noun, with the article its language gives it.
    await expect(app.satellite('subjectAdjective')).toHaveAttribute('aria-label', "Mostra l'aggettivo");
    await expect(page.getByRole('button', { name: 'Cancella il soggetto', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compatta il soggetto', exact: true })).toBeVisible();
    await expect(app.satellite('subjectGender')).toHaveAttribute('aria-label', 'Genere: Maschile');
    // The object's picker, and the sole period's clear control.
    await expect(app.nounInput).toHaveAttribute('placeholder', 'digita un sostantivo…');
    await expect(page.getByRole('button', { name: 'Cancella questo periodo', exact: true })).toBeVisible();
  });

  test('leaves the translations themselves alone — every language is always shown', async ({
    app,
  }) => {
    await app.buildClause('CAT', 'EAT');
    await expect.poll(() => app.sentence('en')).toBe('the cat eats.');

    await app.setUiLanguage('de');

    // The interface is German now, but the panel still renders all seven translations.
    await expect.poll(() => app.sentence('en')).toBe('the cat eats.');
    expect(await app.sentence('it')).toBe('il gatto mangia.');
  });
});
