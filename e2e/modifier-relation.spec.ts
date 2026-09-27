import { test, expect, type Builder } from './fixtures';

// P14, P16: a noun used as a modifier starts from the relation the pair takes — TIME's own under a
// fly, "le mosche del tempo"; the feature under a device, "la bomba a tempo" — and the chip names it.
// The relation names are spelled out: an e2e spec cannot value-import @signi/shared.

/** Put `noun` into the subject's first adjective slot, through the Noun tab. */
async function modifyWith(app: Builder, noun: string, search: string) {
  const page = app.page;
  await app.satellite('subjectAdjective').click();
  const box = page.getByTestId('box-subjectAdjective');
  await box.getByRole('button', { name: 'Noun', exact: true }).click();
  await box.locator('input').fill(search);
  await page.locator(`[data-testid="typeahead-option"][data-concept="${noun}"]`).click();
}

test('time on a fly is its domain: "la mosca del tempo"', async ({ app, page }) => {
  // Picked by its word: the builder's helpers search by the id, and "fly_insect" finds nothing.
  await app.page.getByTestId('typeahead-subject').fill('fly');
  await app.page.locator('[data-testid="typeahead-option"][data-concept="FLY_INSECT"]').click();
  await app.setVerb('BURN');
  await modifyWith(app, 'TIME', 'time');

  await expect(page.getByLabel('Relationship: Domain or place — click to change')).toHaveText('domain');
  await expect.poll(() => app.sentence('it')).toBe('la mosca del tempo brucia.');
  expect(await app.sentence('en')).toBe('the time fly burns.');
});

test('time on a bomb is its feature: "la bomba a tempo", and R still changes it', async ({ app, page }) => {
  await app.buildClause('BOMB', 'BURN');
  await modifyWith(app, 'TIME', 'time');

  const chip = page.getByLabel('Relationship: Feature or means — click to change');
  await expect(chip).toHaveText('feature');
  await expect.poll(() => app.sentence('it')).toBe('la bomba a tempo brucia.');

  // Clicking cycles on from the relation shown: feature → purpose.
  await chip.click();
  await expect(page.getByLabel('Relationship: Purpose or use — click to change')).toHaveText('purpose');
  await expect.poll(() => app.sentence('it')).toBe('la bomba da tempo brucia.');
});
