import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

// The load-bearing path: a clause built in the canvas reaches the engine and comes back
// conjugated in every seeded language. These assert the actual surface strings, so they are
// a regression net for the grammar rules and not just for "something rendered".
test.describe('translation', () => {
  test('translates a bare noun phrase, before any verb is chosen', async ({ app, page }) => {
    await expect(page.getByTestId('translations-empty')).toBeVisible();

    // A verbless period is legal — it's a bare noun phrase, e.g. a headline.
    await app.setSubject('CAT');

    await expect.poll(() => app.sentence('en')).toBe('the cat.');
    expect(await app.sentence('it')).toBe('il gatto.');
  });

  test('renders a subject-verb clause in all seven languages', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');

    await expect.poll(() => app.sentence('en')).toBe('the cat eats.');
    expect(await app.sentence('it')).toBe('il gatto mangia.');
    expect(await app.sentence('fr')).toBe('le chat mange.');
    expect(await app.sentence('es')).toBe('el gato come.');
    expect(await app.sentence('pt')).toBe('o gato come.');
    // CAT is a gendered noun and the builder's default is masculine, so German picks the
    // masculine lexeme (Kater) rather than Katze.
    expect(await app.sentence('de')).toBe('der Kater frisst.');
    expect(await app.sentence('ja')).toBe('猫は食べます。');
    // Japanese carries furigana over the kanji it renders.
    expect(await app.furigana('ja')).toEqual(['ねこ', 'たべます']);
  });

  test('adding a direct object re-conjugates every language', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');
    await expect(app.groupBox('Direct Object')).toBeVisible();

    await app.setDirectObject('MOUSE');

    // The object is accusative — the case shows up in German's article.
    await expect.poll(() => app.sentence('en')).toBe('the cat eats the mouse.');
    expect(await app.sentence('it')).toBe('il gatto mangia il topo.');
    expect(await app.sentence('de')).toBe('der Kater frisst die Maus.');
  });

  // The generic / impersonal subject, chosen from the pronoun chooser's "one" option (the pronoun
  // the person toggle can't reach). It renders as a placed word (en/de/fr), an impersonal clitic
  // (it/es/pt), or a dropped subject (ja) — see the engine's isGenericSubject.
  test('the generic "one" subject renders impersonally in every language', async ({ app }) => {
    await app.setGenericSubject();
    await app.setVerb('EAT');
    await expect(app.groupBox('Direct Object')).toBeVisible();
    await app.setDirectObject('MOUSE');

    await expect.poll(() => app.sentence('en')).toBe('one eats the mouse.');
    expect(await app.sentence('it')).toBe('si mangia il topo.'); // impersonal "si" proclitic
    expect(await app.sentence('fr')).toBe('on mange la souris.');
    expect(await app.sentence('es')).toBe('se come el ratón.');
    expect(await app.sentence('pt')).toBe('se come o rato.');
    expect(await app.sentence('de')).toBe('man isst die Maus.');
    expect(await app.sentence('ja')).toBe('人はネズミを食べます。');
  });

  // P09-E47: the interjection, shown from the card's seventh border control and picked in its own box.
  test('says an interjection before the clause, in every language', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await page.locator('[data-kb-control="interjection"]').click();
    const input = page.getByTestId('box-interjection').locator('input');
    await expect(input).toBeVisible();
    await input.fill('hey');
    await page.locator('[data-testid="typeahead-option"][data-concept="HEY"]').click();

    await app.expectSentences({
      en: 'Hey, the cat runs.',
      it: 'Ehi, il gatto corre.',
      fr: 'Hé, le chat court.',
      de: 'Hey, der Kater läuft.',
      es: 'Oye, el gato corre.',
      pt: 'Ei, o gato corre.',
      ja: 'ねえ、猫は走ります。',
    });

    // The same control takes it away, word and all.
    await page.locator('[data-kb-control="interjection"]').click();
    await expect(page.getByTestId('box-interjection')).toHaveCount(0);
    await app.expectSentences({ en: 'the cat runs.' });
  });

  // P11-E8: the vocative, shown from the card's eighth border control — or its V — and filled in its
  // own noun box, after the interjection and before the clause.
  test.describe('the vocative', () => {
    const vocative = (page: Page) => page.getByTestId('box-vocative');
    const pickVocative = async (page: Page, conceptId: string) => {
      const input = vocative(page).locator('input');
      await expect(input).toBeVisible();
      await input.fill(conceptId.toLowerCase());
      await page.locator(`[data-testid="typeahead-option"][data-concept="${conceptId}"]`).click();
    };

    test('calls the hearer of a statement and of a question, in every language', async ({ app, page }) => {
      await app.buildClause('CAT', 'RUN');
      await page.locator('[data-kb-control="vocative"]').click();
      await pickVocative(page, 'MOM');
      await app.expectSentences({
        en: 'Mom, the cat runs.',
        it: 'Mamma, il gatto corre.',
        fr: 'Maman, le chat court.',
        de: 'Mama, der Kater läuft.',
        es: 'Mamá, el gato corre.',
        pt: 'Mamãe, o gato corre.',
        ja: 'お母さん、猫は走ります。',
      });

      await page.getByTestId('period-border-controls').getByRole('button', { name: 'Question' }).click();
      await app.expectSentences({
        en: 'Mom, does the cat run?',
        it: 'Mamma, il gatto corre?',
        fr: 'Maman, est-ce que le chat court ?',
        de: 'Mama, läuft der Kater?',
        es: 'Mamá, ¿el gato corre?',
        pt: 'Mamãe, o gato corre?',
        ja: 'お母さん、猫は走りますか？',
      });

      // The same control takes it away, word and all.
      await page.locator('[data-kb-control="vocative"]').click();
      await expect(vocative(page)).toHaveCount(0);
      await app.expectSentences({ en: 'does the cat run?' });
    });

    test('calls the hearer of a command, shown by V, and tells two of them in the plural', async ({ app, page }) => {
      await page.getByRole('button', { name: 'Command', exact: true }).click();
      await app.setVerb('RUN');
      // V on the period presses the border toggle, as E does the interjection's.
      for (let level = 0; level < 4; level++) {
        if (await page.evaluate(() => document.activeElement?.hasAttribute('data-kb-period') ?? false)) break;
        await page.keyboard.press('Escape');
      }
      await page.keyboard.press('v');
      await pickVocative(page, 'MOM');
      await app.expectSentences({
        en: 'Mom, run.',
        it: 'Mamma, corri.',
        fr: 'Maman, cours.',
        de: 'Mama, lauf.',
        es: 'Mamá, corre.',
        pt: 'Mamãe, corra.',
        ja: 'お母さん、走ってください。',
      });

      // "Mom and Dad": a second word in the group turns the command to the 2nd plural.
      await app.satellite('vocativeConjunct').click();
      const dad = page.getByTestId('box-subject').locator('input').last();
      await expect(dad).toBeVisible();
      await dad.fill('dad');
      await page.locator('[data-testid="typeahead-option"][data-concept="DAD"]').click();
      await app.expectSentences({
        en: 'Mom and Dad, run.',
        it: 'Mamma e papà, correte.',
        fr: 'Maman et Papa, courez.',
        de: 'Mama und Papa, lauft.',
        es: 'Mamá y Papá, corred.',
        pt: 'Mamãe e Papai, corram.',
        ja: 'お母さんとお父さん、走ってください。',
      });
      await expect(page.getByRole('button', { name: 'second plural' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('dims under an instruction, which says no vocative', async ({ app, page }) => {
      await page.getByRole('button', { name: 'Command', exact: true }).click();
      await app.setVerb('RUN');
      await page.locator('[data-kb-control="vocative"]').click();
      await pickVocative(page, 'MOM');
      await app.expectSentences({ en: 'Mom, run.' });

      await page.getByRole('button', { name: 'Instruction', exact: true }).click();
      await expect(page.getByTestId('vocative-dimmed').getByTestId('box-vocative')).toBeVisible();
      await expect(page.locator('[data-kb-control="vocative"]')).toHaveCount(0);
      await app.expectSentences({ en: 'run.', fr: 'courir.' });
    });
  });
});
