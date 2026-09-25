import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P11-E6: the humble register, the Japanese 謙譲語, toggled on the subject's dotted ring. Only the
 * Japanese row changes — 私は食べ物を**いただきます** — the six others say the plain sentence they said, and
 * the toggle is offered only where the engine lowers the verb: a subject on the speaker's side, and a
 * verb with a humble word.
 */

const OTHERS = ['en', 'it', 'fr', 'de', 'es', 'pt'] as const;

/** The box the cursor rests on, as the page reports it. */
const cursorSlot = (page: Page) =>
  page.evaluate(() => document.activeElement?.closest('[data-kb-box]')?.getAttribute('data-kb-box'));

test.describe('the humble register', () => {
  test('lowers the Japanese verb from the subject’s K, and leaves the other six alone', async ({ app, page }) => {
    await app.setPronounSubject('first', 'singular', 'male');
    await app.setVerb('EAT');
    await app.setDirectObject('FOOD');
    await app.expectSentences({ en: 'I eat the food.', ja: '私は食べ物を食べます。' });
    const before = Object.fromEntries(await Promise.all(OTHERS.map(async (l) => [l, await app.sentence(l)] as const)));

    // Back along the row to the subject, whose ring carries the toggle and whose key is K.
    const toggle = app.satellite('subjectHumble');
    await expect(toggle).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    expect(await cursorSlot(page)).toBe('subject');
    await page.keyboard.press('k');

    await app.expectSentences({ ...before, ja: '私は食べ物をいただきます。' });

    // The toggle takes it back.
    await toggle.click();
    await app.expectSentences({ ...before, ja: '私は食べ物を食べます。' });
  });

  test('is withdrawn under a verb with no humble word, and under someone else', async ({ app }) => {
    await app.setPronounSubject('first', 'singular', 'male');
    await app.setVerb('EAT');
    await app.satellite('subjectHumble').click();
    await app.expectSentences({ ja: '私はいただきます。' });

    // RUN has no humble word: the toggle goes, and the flag waits, out of the plan.
    await app.page.getByRole('button', { name: 'Clear the verb' }).click();
    await app.setVerb('RUN');
    await expect(app.satellite('subjectHumble')).toHaveCount(0);
    await app.expectSentences({ en: 'I run.', ja: '私は走ります。' });

    // EAT again brings it back, still set.
    await app.page.getByRole('button', { name: 'Clear the verb' }).click();
    await app.setVerb('EAT');
    await app.expectSentences({ ja: '私はいただきます。' });

    // The cat is no one's own side: the toggle goes, and the verb is the plain one.
    await app.page.getByRole('button', { name: 'Clear the subject' }).click();
    await app.page.getByTestId('box-subject').getByRole('button', { name: 'Noun', exact: true }).click();
    await app.page.getByTestId('box-subject').getByText('empty', { exact: true }).click();
    await app.setSubject('CAT');
    await expect(app.satellite('subjectHumble')).toHaveCount(0);
    await app.expectSentences({ en: 'the cat eats.', ja: '猫は食べます。' });
  });

  // P11-E6 D1: the toggle fans in at the subject's question hour; the ring grows to hold it, and the
  // subject · verb · object row stays one row (keyboard.spec walks it with the arrows).
  test('keeps the object on the subject’s row with the toggle on the ring', async ({ app }) => {
    await app.setPronounSubject('first', 'singular', 'male');
    await app.setVerb('EAT');
    await app.setDirectObject('FOOD');
    await expect(app.satellite('subjectHumble')).toBeVisible();
    const centreY = async (label: string) => {
      const box = (await app.groupBox(label).boundingBox())!;
      return box.y + box.height / 2;
    };
    const subject = await centreY('Subject');
    const object = await centreY('Direct Object');
    expect(Math.abs(object - subject)).toBeLessThan(40);
  });
});
