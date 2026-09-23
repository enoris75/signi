import type { Page } from '@playwright/test';
import { expect, test } from './fixtures.ts';

// P09-E12 D5: the standard of comparison — "the cat is bigger than the dog" — built on the canvas: a
// predicate adjective, its degree, and the standard's hosted ring beside the predicative's.

const rects = (page: Page) =>
  page.getByTestId('group-box').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { group: (el as HTMLElement).dataset['group'], x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    }),
  );

test.describe('the standard of comparison', () => {
  test('builds "the cat is bigger than the dog" in all seven languages', async ({ app, page }) => {
    await app.buildClause('CAT', 'BE');
    await app.satellite('predicative').click();
    const box = page.getByTestId('box-predicative');
    await box.getByRole('button', { name: 'Adjective', exact: true }).click();
    await box.locator('input').fill('big');
    await page.locator('[data-testid="typeahead-option"][data-concept="BIG"]').click();
    await app.expectSentences({ en: 'the cat is big.' });

    // The control is offered once the degree compares.
    await expect(app.satellite('predicativeStandard')).toHaveCount(0);
    await box.getByLabel(/^Degree:/).click();
    await app.expectSentences({ en: 'the cat is bigger.' });
    const before = await rects(page);

    await app.satellite('predicativeStandard').click();
    const standard = page.getByTestId('box-subject').nth(1);
    await standard.locator('input').fill('dog');
    await page.locator('[data-testid="typeahead-option"][data-concept="DOG"]').click();

    await app.expectSentences({
      en: 'the cat is bigger than the dog.',
      it: 'il gatto è più grande del cane.',
      fr: 'le chat est plus grand que le chien.',
      de: 'der Kater ist größer als der Hund.',
      es: 'el gato es más grande que el perro.',
      pt: 'o gato é maior do que o cão.',
      ja: '猫は犬より大きいです。',
    });
    const after = await rects(page);
    // The period's own rings keep their places: the standard's ring is one more beside them.
    for (const ring of before) expect(after).toContainEqual(ring);
    expect(after).toHaveLength(before.length + 1);

    // A degree that takes no standard mutes it: the word stays, dimmed, and the sentence drops it.
    await box.getByLabel(/^Degree:/).click();
    // The fading wrapper holds only absolutely placed rings, so it is attached rather than "visible".
    await expect(page.getByTestId('standard-dimmed')).toHaveCSS('opacity', '0.45');
    await expect(page.getByTestId('box-subject')).toHaveCount(2);
    await expect.poll(() => app.sentence('en')).not.toContain('dog');
    await expect(app.satellite('predicativeStandard')).toHaveCount(0);
  });
});
