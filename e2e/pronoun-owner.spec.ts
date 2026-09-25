import type { LanguageCode } from '@signi/shared';
import { test, expect, type Builder } from './fixtures';

// P11-E9: a pronoun named as a noun's owner — "my mother runs" — where no I or you stands elsewhere
// in the period. The owner ring's picker takes the pronoun tab a conjunct's already has; naming the
// owner there ends the pick the ring opened with, and the plan writes a possessive pronoun, never a
// genitive noun phrase ("the I's mother"). The grammar is pinned in the engine suite
// (pronoun-owner.test.ts, kinship.test.ts); this proves the canvas builds the plan.

const LANGUAGES: LanguageCode[] = ['en', 'it', 'fr', 'de', 'es', 'ja', 'pt'];

async function sentences(app: Builder): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const language of LANGUAGES) out[language] = await app.sentence(language);
  return out;
}

/** Open a noun's owner from its possessor control and name it a pronoun from the chooser. */
async function namePronounOwner(app: Builder, noun: string, person: 'first' | 'second' | 'third') {
  const page = app.page;
  await page.getByTestId(`possessor-ctl-${noun}`).getByRole('button').click();
  const input = page.getByTestId('typeahead-noun');
  await expect(input).toBeVisible();
  await input.click();
  await page.getByTestId('pronoun-tab').click();
  await page.getByRole('button', { name: person, exact: true }).click();
  await page.getByTestId('pronoun-commit').click();
}

test('my mother runs, built from the owner’s Pronoun tab', async ({ app, page }) => {
  await app.buildClause('MOTHER', 'RUN');

  await namePronounOwner(app, 'subject', 'first');

  await expect.poll(() => app.sentence('en')).toBe('my mother runs.');
  expect(await sentences(app)).toEqual({
    en: 'my mother runs.', it: 'mia madre corre.', fr: 'ma mère court.', de: 'meine Mutter läuft.',
    es: 'mi madre corre.', ja: '母は走ります。', pt: 'a minha mãe corre.',
  });
  // The ring names the person; its line says the possessed phrase, as a pointer's does.
  await expect(page.getByTestId('owner-pronoun-chip')).toHaveText('my mother');
  await expect(page.getByTestId('pronoun-chip')).toHaveCount(0);
});

test('my son marries your daughter: two pronoun owners', async ({ app }) => {
  await app.buildClause('SON', 'MARRY');
  await app.setDirectObject('DAUGHTER');

  await namePronounOwner(app, 'subject', 'first');
  await namePronounOwner(app, 'directObject', 'second');

  await expect.poll(() => app.sentence('en')).toBe('my son marries your daughter.');
  expect(await sentences(app)).toEqual({
    en: 'my son marries your daughter.', it: 'mio figlio sposa tua figlia.', fr: 'mon fils épouse ta fille.',
    de: 'mein Sohn heiratet deine Tochter.', es: 'mi hijo se casa con tu hija.', ja: '息子はあなたの娘さんと結婚します。',
    pt: 'o meu filho casa com a sua filha.',
  });
});

// D6: pointing at the subject and naming a pronoun are different plans. Naming the 3rd person is
// another person's his (彼の), where pointing at the boy copies his features today.
test('a named 3rd person owner is another person’s', async ({ app }) => {
  await app.buildClause('BOY', 'SEE');
  await app.setDirectObject('MOTHER');

  await namePronounOwner(app, 'directObject', 'third');

  await expect.poll(() => app.sentence('en')).toBe('the boy sees his mother.');
  expect(await app.sentence('ja')).toBe('男の子は彼のお母さんを見ます。');
});
