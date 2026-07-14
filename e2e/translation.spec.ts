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
    expect(await app.sentence('de')).toBe('der Kater isst.');
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
    expect(await app.sentence('de')).toBe('der Kater isst die Maus.');
  });
});
