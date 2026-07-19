import { test, expect } from './fixtures';

// Regression: a possessor sub-builder that remounts with pre-existing content into a cramped
// canvas used to drive the workspace geometry-notification effect into an unbounded
// bump→render→bump loop (Maximum update depth exceeded, crashing the canvas). The `page`
// fixture fails the test on any uncaught page error, which is what catches the loop.
//
// The crash needs a narrow viewport so the sub-builder's boxes have to be shoved to settle,
// and it needs the possessor panel to be *reopened* (mounting with its genitive head already
// filled) rather than filled in place.
test.use({ viewport: { width: 640, height: 720 } });

async function setup(app: import('./fixtures').Builder, page: import('@playwright/test').Page) {
  await app.buildClause('ANGEL', 'RUN');
  await page.getByRole('button', { name: 'Show Adverbial of manner' }).click();
  const box = page.getByTestId('box-manner');
  await box.getByTestId('typeahead-noun').fill('speed');
  await page.locator('[data-testid="typeahead-option"][data-concept="SPEED"]').click();
}

const togglePossessor = (page: import('@playwright/test').Page) =>
  page.getByTestId('possessor-ctl-manner').getByRole('button').click();

async function fillPossessor(page: import('@playwright/test').Page) {
  await togglePossessor(page);
  await page.getByTestId('typeahead-subject').first().fill('light');
  await page.locator('[data-testid="typeahead-option"][data-concept="LIGHT"]').click();
}

test('reopening a filled manner possessor in a cramped canvas does not loop', async ({
  app,
  page,
}) => {
  await setup(app, page);
  await fillPossessor(page);
  expect(await app.sentence('en')).toBe("the angel runs at the light's speed.");

  await togglePossessor(page); // hide — the genitive head stays in the selection
  await togglePossessor(page); // reopen — sub-builder remounts with LIGHT already present

  await page.waitForTimeout(500);
  await expect(page.getByTestId('box-manner')).toBeVisible();
  expect(await app.sentence('en')).toBe("the angel runs at the light's speed.");
});

test('reopening also survives an added adjective on the measure head', async ({ app, page }) => {
  await setup(app, page);
  await fillPossessor(page);
  await togglePossessor(page); // hide

  await page.getByTestId('satellite-mannerAdjective').click();
  const adjInput = page.getByTestId('box-mannerAdjective').getByPlaceholder('type an adjective…');
  await adjInput.fill('high');
  await page.locator('[data-testid="typeahead-option"][data-concept="HIGH"]').click();

  await togglePossessor(page); // reopen

  await page.waitForTimeout(500);
  await expect(page.getByTestId('box-manner')).toBeVisible();
  expect(await app.sentence('en')).toBe("the angel runs at the light's high speed.");
});
