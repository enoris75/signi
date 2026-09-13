import { test, expect } from './fixtures';

// A noun's owner is filled from its possessor control. Opening it draws an empty owner ring — its
// word picker — on the canvas, and lights up the nouns it could point to instead.
//
// Pointing to one makes a pronominal possessor: the engine renders a possessive pronoun agreeing with
// the noun pointed to ("the boy … HIS dog"). This drives the whole wiring: the gesture → the
// PossessorRef in the selection → the plan → the API → the rendered sentence. The grammar itself is
// covered in the engine unit suite (possessivePronoun.test.ts); here we only prove the canvas produces
// the right plan.
test('point to a noun as the owner', async ({ app, page }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');

  // Open the direct object's owner, and point to the subject (BOY) — the period's own subject box,
  // ahead of the empty owner ring's.
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('box-subject').first().click();

  // The empty ring is gone; a dashed line to the boy carries the pronoun.
  await expect(page.getByTestId('box-subject')).toHaveCount(1);
  await expect(page.getByTestId('pronoun-chip')).toHaveText('his');
  // The reference now renders as a possessive pronoun agreeing with BOY (3rd-sing masc → "his").
  expect(await app.sentence('en')).toBe('the boy sees his dog.');
  expect(await app.sentence('it')).toBe('il ragazzo vede il suo cane.');
  expect(await app.sentence('de')).toBe('der Junge sieht seinen Hund.');
  expect(await app.sentence('es')).toBe('el niño ve su perro.');
});

// The reference is a `NounAddress` stored in the selection, so it must survive the trip through
// the database (the v6 saved-phrase format) and re-resolve on load.
test('a pronominal possessor survives a save/load round trip', async ({ app, page }, testInfo) => {
  const name = `Boy dog ${testInfo.testId}-${testInfo.repeatEachIndex}`;

  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('box-subject').first().click();
  await expect.poll(() => app.sentence('en')).toBe('the boy sees his dog.');

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const saveDialog = page.getByRole('dialog');
  await saveDialog.getByLabel('Name').fill(name);
  await saveDialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Phrase saved.')).toBeVisible();

  await app.goto();
  await expect(page.getByTestId('translations-empty')).toBeVisible();

  await page.getByRole('button', { name: 'Load a saved phrase' }).click();
  await page.getByRole('dialog').getByText(name).click();
  await expect(page.getByText('Phrase loaded.')).toBeVisible();

  // The possessive pronoun re-resolves from the reloaded reference, and its line is drawn again.
  await expect.poll(() => app.sentence('en')).toBe('the boy sees his dog.');
  expect(await app.sentence('it')).toBe('il ragazzo vede il suo cane.');
  await expect(page.getByTestId('pronoun-chip')).toHaveText('his');
});

// Naming the owner instead: its word goes in the empty ring, on the same canvas as the noun it owns.
test('name the owner in a ring of its own', async ({ app, page }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');

  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByTestId('typeahead-noun').fill('cat');
  await page.locator('[data-testid="typeahead-option"][data-concept="CAT"]').click();

  await expect.poll(() => app.sentence('en')).toBe("the boy sees the cat's dog.");
  expect(await app.sentence('it')).toBe('il ragazzo vede il cane del gatto.');
  // One period card, one canvas: the owner is a ring on it, not a panel of its own.
  await expect(page.getByTestId('period-container')).toHaveCount(1);
  await expect(page.getByTestId('phrase-canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Clear Possessor' })).toBeVisible();

  // Its ring's remove control takes the owner off again.
  await page.getByRole('button', { name: 'Remove this possessor' }).click();
  await expect.poll(() => app.sentence('en')).toBe('the boy sees the dog.');
});
