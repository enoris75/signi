import { test } from './fixtures';

test.use({ viewport: { width: 640, height: 720 } });

test('window diag', async ({ app, page }) => {
  await app.buildClause('ANGEL', 'RUN');
  await page.getByRole('button', { name: 'Show Adverbial of manner' }).click();
  const box = page.getByTestId('box-manner');
  await box.getByTestId('typeahead-noun').fill('speed');
  await page.locator('[data-testid="typeahead-option"][data-concept="SPEED"]').click();
  await page.getByTestId('possessor-ctl-manner').getByRole('button').click();
  await page.getByTestId('typeahead-subject').first().fill('light');
  await page.locator('[data-testid="typeahead-option"][data-concept="LIGHT"]').click();
  await page.getByTestId('possessor-ctl-manner').getByRole('button').click();
  await page.evaluate(() => { (window as any).__diag = []; (window as any).__rc = {}; });
  await page.getByTestId('possessor-ctl-manner').getByRole('button').click();
  await page.waitForTimeout(800);

  const rc = await page.evaluate(() => (window as any).__rc ?? {});
  console.log('==== RENDER COUNTS ====', JSON.stringify(rc, null, 2));
  const diag: string[] = await page.evaluate(() => (window as any).__diag ?? []);
  const tally: Record<string, number> = {};
  for (const l of diag) { tally[l] = (tally[l] ?? 0) + 1; }
  console.log('==== TALLY (total', diag.length, ') ====');
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(v, k);
  console.log('==== LAST 20 ====');
  for (const l of diag.slice(-20)) console.log(l);
});
