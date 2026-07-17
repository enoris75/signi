import path from 'path';
import { test, expect } from './fixtures';

// Not a real test — a screenshot generator for the README, driven through the same Builder
// harness the specs use. Run with: npx playwright test e2e/screenshots.spec.ts
// Images land in docs/images/.
const OUT = path.join(__dirname, '..', 'docs', 'images');

test('capture README screenshots', async ({ app, page }) => {
  // Build a phrase with a subject, verb, and a direct object so the canvas and the
  // all-languages translation panel are both populated.
  await app.setSubject('CAT');
  await app.setVerb('EAT');
  await app.setDirectObject('FOOD');
  await expect(app.groupBox('Verb Phrase')).toBeVisible();
  await app.tidy();

  // Give the layout a beat to settle its final positions.
  await expect(app.sentences('en').first()).toBeVisible();

  // Park the pointer off every control so no hover tooltip bleeds into the shot.
  await page.mouse.move(4, 4);
  await expect(page.getByText('Tidy up this period')).toHaveCount(0);

  await page.screenshot({ path: path.join(OUT, 'builder.png'), fullPage: true });
});
