import { test, expect } from './fixtures';

// A pronominal possessor pinpoints another noun in the same period as its antecedent, and the
// engine renders a possessive pronoun agreeing with it ("the boy … HIS dog"). This drives the
// whole wiring: the pinpoint gesture → the PossessorRef in the selection → the plan → the API →
// the rendered panel. The grammar itself is covered in the engine unit suite
// (possessivePronoun.test.ts); here we only prove the canvas produces the right plan.
test('pinpoint a noun as a pronominal possessor', async ({ app, page }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('DOG');

  // Reveal the direct object's possessor panel and switch it to reference mode.
  await page.getByTestId('possessor-ctl-directObject').getByRole('button').click();
  await page.getByRole('button', { name: 'Refers to a noun' }).click();

  // Start the pick and pinpoint the subject (BOY) as the owner.
  await page.getByRole('button', { name: 'Pick a noun' }).click();
  await page.getByTestId('box-subject').click();

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
  await page.getByRole('button', { name: 'Refers to a noun' }).click();
  await page.getByRole('button', { name: 'Pick a noun' }).click();
  await page.getByTestId('box-subject').click();
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

  // The possessive pronoun re-resolves from the reloaded reference.
  await expect.poll(() => app.sentence('en')).toBe('the boy sees his dog.');
  expect(await app.sentence('it')).toBe('il ragazzo vede il suo cane.');
});
