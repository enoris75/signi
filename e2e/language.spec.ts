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

  // REMOVE and DELETE are separate verbs because the languages keep them apart: a period or a
  // complement comes off the canvas ("rimuovi"), a saved phrase is erased for good ("elimina").
  test('names the remove and delete controls in the UI language', async ({ app, page }, testInfo) => {
    const name = `Remove delete ${testInfo.testId}-${testInfo.repeatEachIndex}`;
    await app.buildClause('CAT', 'RUN');
    await page.getByRole('button', { name: 'Show the adverbial of manner' }).click();
    await expect(page.getByRole('button', { name: 'Remove the adverbial of manner', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const saveDialog = page.getByRole('dialog');
    await saveDialog.getByLabel('Name').fill(name);
    await saveDialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved phrase')).toBeVisible();
    await app.addPeriod();

    await app.setUiLanguage('it');

    await expect(page.getByRole('button', { name: 'Rimuovi il complemento di modo', exact: true })).toBeVisible();
    await expect(app.period(1).getByRole('button', { name: 'Rimuovi questo periodo', exact: true })).toBeVisible();

    // The delete button can't carry the row's name, so it is described by it.
    await page.getByRole('button', { name: 'Carica una frase salvata' }).click();
    const loadDialog = page.getByRole('dialog');
    const row = loadDialog.getByRole('listitem').filter({ hasText: name });
    const del = row.getByRole('button', { name: 'Elimina questa frase salvata', exact: true });
    await expect(del).toHaveAccessibleDescription(name);
    await del.click();
    await expect(loadDialog.getByText(name)).toHaveCount(0);
  });

  // A linked period's badge and controls name the clause it is (B21), as the tradition names it.
  test('names the clauses of linked periods, and their controls, in the UI language', async ({ app }) => {
    await app.buildClauseIn(0, 'DOG', 'RUN');
    await app.addPeriod();
    await app.buildClauseIn(1, 'CAT', 'EAT');
    await app.linkCondition(0, 1);
    // The badge leads the period's caption, before its hint.
    await expect(app.period(0).getByText(/^Main clause·/)).toBeVisible();

    await app.setUiLanguage('it');

    await expect(app.period(0).getByText(/^Proposizione principale·/)).toBeVisible();
    await expect(app.period(1).getByText(/^Proposizione condizionale·/)).toBeVisible();
    await expect(app.period(0).getByRole('button', { name: 'Rimuovi la condizione', exact: true })).toBeVisible();
    await expect(
      app.period(1).getByRole('button', { name: 'Questo periodo è una proposizione condizionale', exact: true }),
    ).toBeVisible();
    await expect(app.period(0).getByTestId('satellite-subjectConjunct')).toHaveAttribute(
      'aria-label',
      'Coordinazione: Aggiungi un congiunto',
    );
  });

  // The verb's feature controls (B22): German names a tense with a noun of its own.
  test('names the tense, polarity and modal controls in the UI language', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.cycle('verbTense');
    await expect(page.getByTestId('box-verbTense')).toContainText('Past');

    await app.setUiLanguage('de');

    await expect(page.getByTestId('box-verbTense')).toContainText('Präteritum');
    await expect(app.satellite('verbTense')).toHaveAttribute('aria-label', 'Das Tempus verstecken');
    await expect(app.satellite('verbNegative')).toHaveAttribute('aria-label', 'Polarität: Positiv');
    await expect(app.satellite('verbModal')).toHaveAttribute('aria-label', 'Das Modalverb zeigen');
    await app.satellite('verbModal').click();
    await expect(page.getByTestId('box-verbModal').locator('input')).toHaveAttribute(
      'placeholder',
      'ein Modalverb tippen…',
    );
  });

  // Every complement has a name of its own now (B23), and so do the controls on its ring.
  test('names every complement, the verb phrase and the word map filters in the UI language', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await app.revealAndPick('locative', 'HOUSE');
    await expect(page.getByRole('button', { name: 'Remove the locative', exact: true })).toBeVisible();

    await app.setUiLanguage('es');

    await expect(
      page.getByRole('button', { name: 'Quitar el complemento circunstancial de lugar', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compactar el sintagma verbal', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Palabras', exact: true }).click();
    await page.getByRole('button', { name: 'Mostrar el mapa de palabras' }).click();
    const map = page.getByRole('dialog');
    await expect(map.getByRole('button', { name: 'Hiperónimos', exact: true })).toBeVisible();
    await expect(map.getByRole('button', { name: 'Complementos', exact: true })).toBeVisible();
  });

  // A noun used as a modifier carries chips of its own (B24).
  test('names the chips of a noun used as a modifier in the UI language', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.satellite('subjectAdjective').click();
    const box = page.getByTestId('box-subjectAdjective');
    await box.getByRole('button', { name: 'Noun', exact: true }).click();
    await box.locator('input').fill('book');
    await page.locator('[data-testid="typeahead-option"][data-concept="BOOK"]').click();
    await expect(page.getByLabel('Relationship: Feature or means — click to change')).toHaveText('feature');

    await app.setUiLanguage('fr');

    await expect(page.getByLabel('Relation: Caractéristique ou moyen — click to change')).toHaveText(
      'caractéristique',
    );
    await expect(page.getByLabel('Ajouter un adjectif qui décrit ce modificateur')).toBeVisible();
  });

  // The dialogs, the period's reorder, resize and mood controls, and the copy button (B25–B28).
  test('names the dialogs, the period controls and the copy button in the UI language', async ({ app, page }) => {
    await app.buildClause('CAT', 'EAT');
    await app.addPeriod();
    await expect(app.period(0).getByRole('button', { name: 'Command', exact: true })).toHaveAttribute('aria-pressed', 'false');

    await app.setUiLanguage('it');

    await expect(page.getByTestId('language-selector')).toHaveAccessibleName('Lingua di interfaccia');
    // A mood toggle is named by its mode and says whether it is on; while on, its tooltip says how to undo it.
    const command = app.period(0).getByRole('button', { name: 'Comando', exact: true });
    await command.click();
    await expect(command).toHaveAttribute('aria-pressed', 'true');
    await expect(app.period(0).getByLabel('Questo periodo è un comando — disattivalo')).toBeAttached();
    await expect(app.period(1).getByRole('button', { name: 'Sposta su', exact: true })).toBeEnabled();
    await expect(app.period(0).getByRole('button', { name: 'Sposta giù', exact: true })).toBeEnabled();
    await expect(
      app.period(0).getByRole('separator', { name: 'Ridimensiona questo contenitore di periodo' }),
    ).toBeAttached();
    // The copy button can't carry its row's language in the plan, so it follows in brackets.
    await expect(page.getByRole('button', { name: 'Copia la traduzione (Inglese)', exact: true })).toBeAttached();

    await page.getByRole('button', { name: 'Salva', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox', { name: 'Nome' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Annulla', exact: true }).click();
    await expect(dialog).toHaveCount(0);
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
