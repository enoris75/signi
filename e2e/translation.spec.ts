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
});

