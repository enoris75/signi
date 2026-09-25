import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P02: the phrase console — the same phrase as the canvas, typed.
 *
 * The session the plan opens with (§1), typed with ⇥ completion: every box it fills is checked on the
 * canvas, and the sentence in all seven languages. Then the other direction — a control clicked on the
 * canvas comes back to the console as the command it equals — and a two-period script pasted whole.
 */

const prompt = (page: Page) => page.getByTestId('console-prompt');

/** Run the line in the prompt: close the list if it is up, then ↵. */
async function run(page: Page): Promise<void> {
  if (await page.getByTestId('console-list').isVisible()) await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await expect(prompt(page)).toHaveValue('');
}

test.describe('the phrase console', () => {
  test('builds the plan’s session from the console, completing with ⇥', async ({ app, page }) => {
    await prompt(page).click();

    // /su ⇥ — ⇥ takes the ghost, and the subject's bracket opens for its word.
    await page.keyboard.type('/su');
    await expect(page.getByTestId('console-ghost')).toHaveText('bj');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj (  )');
    // cat ⇥ — typed whole, since `ca` is car as much as cat: with nothing left to ghost, ⇥ takes the word.
    await page.keyboard.type('cat');
    await expect(page.getByTestId('console-ghost')).toHaveCount(0);
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj ( cat  )');
    await page.keyboard.type('/adj br');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/subj ( cat /adj brown  )');
    await page.keyboard.type('/pl');

    // Before ↵ the canvas previews the boxes the line fills, dashed, and the translations say so.
    await expect(page.getByTestId('box-subject')).toHaveAttribute('data-preview', '');
    await expect(page.getByTestId('box-subjectAdjective')).toHaveAttribute('data-preview', '');
    await expect(page.getByTestId('translation-preview').first()).toBeVisible();
    await app.expectSentences({ en: 'the brown cats.' });

    await run(page);
    await expect(page.getByTestId('box-subject')).not.toHaveAttribute('data-preview', '');
    await expect(page.getByTestId('translation-preview')).toHaveCount(0);
    // The context moves on to the verb, as the pickers' own auto-advance would.
    await expect(page.getByTestId('console-chip')).toContainText(/verb/i);

    // Typed straight through: /obj leaves the verb's bracket for one of its own.
    await page.keyboard.type('/verb eat /obj food');
    await expect(prompt(page)).toHaveValue('/verb ( eat ) /obj ( food )');
    await run(page);
    await app.expectSentences({ en: 'the brown cats eat the food.' });

    // A click on the canvas — the polarity of eat — is written back as the command it equals.
    await page.getByTestId('satellite-verbNegative').click();
    await expect(page.getByTestId('transcript-echo')).toContainText('/not · eat');
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( eat /not )');
    await app.expectSentences({ en: 'the brown cats do not eat the food.' });

    // …and it put the console's context on eat, so /modal lands there.
    await prompt(page).click();
    await page.keyboard.type('/modal ca');
    await page.keyboard.press('Tab');
    await expect(prompt(page)).toHaveValue('/modal can ');
    await run(page);
    await expect(page.getByTestId('box-verbModal')).toContainText('can');
    // The polarity clicked above is *eat*'s own, and it stays the verb's under the modal: these
    // cats are able to refrain (A03). The modal's own denial — "cannot eat" — is the control on
    // *can*, written `/modal ( can /not )`.
    await app.expectSentences({ en: 'the brown cats can not eat the food.' });
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( eat /not /modal can )');

    // A relative clause in braces, which open by themselves: a second period, made already linked to cats.
    await page.keyboard.type('#1.subj /rel obj /subj dog /verb see');
    await expect(prompt(page)).toHaveValue('#1.subj /rel obj { /subj ( dog ) /verb ( see ) }');
    await expect(page.getByTestId('period-preview')).toBeVisible();
    await run(page);
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await app.expectSentences({
      en: 'the brown cats that the dog sees can not eat the food.',
      it: 'i gatti marroni che il cane vede possono non mangiare il cibo.',
      fr: 'les chats bruns que le chien voit peuvent ne pas manger la nourriture.',
      de: 'die braunen Kater, die der Hund sieht, können das Essen nicht fressen.',
      es: 'los gatos marrones que el perro ve pueden no comer la comida.',
      ja: '犬が見る茶色の猫は食べ物を食べないことができます。',
      pt: 'os gatos castanhos que o cão vê podem não comer a comida.',
    });

    // ↑ brings the last line back.
    await page.keyboard.press('ArrowUp');
    await expect(prompt(page)).toHaveValue('#1.subj /rel obj { /subj ( dog ) /verb ( see ) }');
    await expect(page.getByTestId('console-history-tag')).toContainText('history · 1/');
  });

  test('writes a canvas change into the source strip and the transcript', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /verb eat');
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( cat ) /verb ( eat )');

    await app.cycle('verbTense');
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( eat /past )');
    await expect(page.getByTestId('transcript-echo').last()).toContainText('/past · eat');

    // A click on a token takes the context to its box.
    await page.getByTestId('source-token').filter({ hasText: 'cat' }).click();
    await expect(page.getByTestId('console-chip')).toContainText(/subject/i);
  });

  // P09-E12 M5–M7: the question, its gap and the existential, each a period-level statement.
  test('asks with /ask, and /statement takes it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/ask /subj cat /verb eat /obj food');
    await run(page);
    await app.expectSentences({ en: 'does the cat eat the food?', ja: '猫は食べ物を食べますか？' });
    await expect(page.getByTestId('period-border-controls').getByRole('button', { name: 'Question', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.type('/statement');
    await run(page);
    await app.expectSentences({ en: 'the cat eats the food.' });
  });

  test('asks about a slot with /wh, and /del wh takes the gap back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/wh obj /subj cat /verb eat');
    await run(page);
    await app.expectSentences({ en: 'what does the cat eat?', it: 'che cosa mangia il gatto?', fr: "qu'est-ce que le chat mange ?" });
    await expect(page.getByTestId('source-strip')).toContainText('/wh obj /subj ( cat ) /verb ( eat )');
    await page.keyboard.type('/del wh');
    await run(page);
    // /wh alone implied the question, so taking the gap back ends it (2c4cee46).
    await app.expectSentences({ en: 'the cat eats.' });
  });

  // P09-E44: the capacity one acts in, on the verb that licenses it.
  test('says what the subject acts as with /role, and /del role takes it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj woman /verb act /role ( friend /fem )');
    await run(page);
    await app.expectSentences({ en: 'the woman acts as a friend.', it: 'la donna agisce come amica.', de: 'die Frau handelt als Freundin.' });
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( woman ) /verb ( act ) /role ( friend /fem )');
    await page.keyboard.type('/del role');
    await run(page);
    await app.expectSentences({ en: 'the woman acts.' });
  });

  // P09-E45: the party the act is directed against — `/vs`, since `/against` is the spatial relation.
  test('says whom the act is against with /vs, and /del vs takes it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /verb PLAY_GAME /vs him');
    await run(page);
    await app.expectSentences({ en: 'the cat plays against him.', it: 'il gatto gioca contro di lui.', de: 'der Kater spielt gegen ihn.' });
    // A pronoun prints as its person, the verb as its id ("play" names two verbs).
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( PLAY_GAME ) /vs ( 3rd');
    await page.keyboard.type('/del vs');
    await run(page);
    await app.expectSentences({ en: 'the cat plays.' });
  });

  // P09-E46: the correlative, typed; the chip reads it too.
  test('spells a pair "both … and" with /bothand', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /bothand dog /verb run');
    await run(page);
    await app.expectSentences({ en: 'both the cat and the dog run.', de: 'sowohl der Kater als auch der Hund laufen.', ja: '猫も犬も走ります。' });
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( cat /bothand dog ) /verb ( run )');
    await expect(page.getByTestId('conjunction-chip')).toHaveText(/^both … and$/i);
  });

  // P09-E49: the approximator, typed, and taken back.
  test('approximates a quantity with /approx, and /del approx takes it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /pl /num 5 /approx /verb run');
    await run(page);
    await app.expectSentences({ en: 'about five cats run.', de: 'etwa fünf Kater laufen.', ja: '約五匹の猫は走ります。' });
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( cat /pl /num 5 /approx ) /verb ( run )');
    // Its noun first, as /del num takes one: a line's /del reaches the words written before it.
    await page.keyboard.type('/subj /del approx');
    await run(page);
    await app.expectSentences({ en: 'the five cats run.' });
  });

  // P09-E47: the period's interjection, printed first as it is spoken first.
  test('says an interjection with /interj, and /del interj takes it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /verb run /interj hey');
    await run(page);
    await app.expectSentences({ en: 'Hey, the cat runs.', it: 'Ehi, il gatto corre.', ja: 'ねえ、猫は走ります。' });
    await expect(page.getByTestId('box-interjection')).toContainText('hey');
    await expect(page.getByTestId('source-strip')).toContainText('/interj ( hey ) /subj ( cat ) /verb ( run )');
    await page.keyboard.type('/del interj');
    await run(page);
    await app.expectSentences({ en: 'the cat runs.' });
    await expect(page.getByTestId('box-interjection')).toHaveCount(0);
  });

  // P11-E8: the period's vocative, printed after the interjection and before the subject.
  test('calls the hearer with /voc, and /del voc takes it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/command /verb run /voc mom');
    await run(page);
    await app.expectSentences({ en: 'Mom, run.', it: 'Mamma, corri.', de: 'Mama, lauf.', ja: 'お母さん、走ってください。' });
    await expect(page.getByTestId('box-vocative')).toContainText('mom');
    await expect(page.getByTestId('source-strip')).toContainText('/command /voc ( mom ) /verb ( run )');
    await page.keyboard.type('/del voc');
    await run(page);
    await app.expectSentences({ en: 'run.' });
    await expect(page.getByTestId('box-vocative')).toHaveCount(0);
  });

  test('says there is with /there, and /del there takes it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/there /subj ( cat /a ) /verb be /loc house');
    await run(page);
    await app.expectSentences({ en: 'there is a cat in the house.', de: 'es gibt einen Kater im Haus.', ja: '家に猫がいます。' });
    await page.keyboard.type('/del there');
    await run(page);
    await app.expectSentences({ en: 'a cat is in the house.' });
  });

  test('writes a click on the canvas into the period being edited, as if typed', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj cat /verb eat');
    await run(page);
    await page.keyboard.type('#1 /edit');
    await page.keyboard.press('Enter');
    await expect(prompt(page)).toHaveValue('/subj ( cat ) /verb ( eat ) ');

    // The tense clicked on the canvas goes into the line, and the canvas shows it.
    await app.cycle('verbTense');
    await expect(prompt(page)).toHaveValue('/subj ( cat ) /verb ( eat /past ) ');
    await expect(page.getByTestId('box-verbTense')).toContainText(/past/i);
    await app.expectSentences({ en: 'the cat ate.' });
    // Nothing is the phrase's until ↵.
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( cat ) /verb ( eat )');
    await expect(page.getByTestId('transcript-echo')).toHaveCount(0);

    await prompt(page).click();
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/verb ( eat /past )');
    await app.expectSentences({ en: 'the cat ate.' });
  });

  test('refuses a line that does not parse, and leaves the phrase as it was', async ({ app, page }) => {
    // The fixture opens the app; nothing on the canvas yet.
    await expect(app.subjectInput).toBeVisible();
    await prompt(page).click();
    await page.keyboard.type('/subj cat /frob');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('console-diagnostic')).toHaveAttribute('data-code', 'unknownCommand');
    await expect(page.getByTestId('console-diagnostic')).toContainText('Unknown command: /frob');
    await expect(prompt(page)).toHaveValue('/subj ( cat /frob )');
    // The valid part still previews; esc clears the line and the preview with it.
    await expect(page.getByTestId('box-subject')).toHaveAttribute('data-preview', '');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');
    await expect(page.getByTestId('typeahead-subject')).toBeVisible();
  });

  // C21: what is wrong with a line is said in the interface language — a sentence from the catalogue,
  // and what it is about after a colon: the user's word as the pickers show it, a command, a line to
  // write. A help page says what the command would act on at the cursor the same way.
  test('says what is wrong with a line in the interface language', async ({ app, page }) => {
    await app.setUiLanguage('it');
    await prompt(page).click();
    await page.keyboard.insertText('/verb ( run ) /obj ( food )');
    const diagnostic = page.getByTestId('console-diagnostic');
    await expect(diagnostic).toHaveAttribute('data-code', 'takesNoObject');
    await expect(diagnostic).toContainText('Questo verbo non accetta nessun complemento oggetto: correre');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');

    // Two sentences, the command's purpose first, as its help page says it.
    await app.setUiLanguage('de');
    await prompt(page).click();
    await page.keyboard.insertText('/subj ( cat /more )');
    await expect(diagnostic).toHaveAttribute('data-code', 'noTarget');
    await expect(diagnostic).toContainText(
      /\/more — die Steigerungsstufe eines Adjektivs festlegen\. Dieses Wort ist ein Substantiv: \S+/,
    );
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');

    // A help page, from a cursor on a word: the word, and the value it holds now.
    await app.setUiLanguage('it');
    await prompt(page).click();
    await page.keyboard.type('/subj cat');
    await run(page);
    await page.keyboard.type('#1.subj /help pl');
    await run(page);
    await expect(page.getByTestId('help-here').last()).toHaveText('Cursore: gatto · ora Singolare');
  });

  test('rebuilds a workspace from a pasted two-period script, run with ↵', async ({ app, page }) => {
    await prompt(page).click();
    // A paste lands in the prompt, several lines and all, and previews before ↵ runs it.
    await page.keyboard.insertText('/subj man /rel #2.subj /verb read /obj book\n/subj ( man\n  ) /verb ( love ) /obj ( cat )\n');
    await expect(page.getByTestId('period-container')).toHaveCount(2);
    await run(page);
    await app.expectSentences({ en: 'the man who loves the cat reads the book.' });
    await expect(page.getByTestId('transcript-typed')).toHaveCount(2);
    // The source strip holds the whole script, a numbered line per period.
    const lines = page.getByTestId('source-line');
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toContainText('/rel #2.subj');
    await expect(lines.nth(1)).toContainText('/verb ( love ) /obj ( cat )');
  });

  test('grows the prompt with a long line, and breaks it with ⇧↵', async ({ app, page }) => {
    await expect(app.subjectInput).toBeVisible();
    await prompt(page).click();
    const one = await prompt(page).boundingBox();
    await page.keyboard.type('/subj cat /adj brown /pl /that');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('/rel obj /subj dog /verb see');
    await expect(prompt(page)).toHaveValue('/subj ( cat /adj brown /pl /that\n/rel obj { /subj ( dog ) /verb ( see ) } )');
    const two = await prompt(page).boundingBox();
    expect(two!.height).toBeGreaterThan(one!.height * 1.5);
    await run(page);
    await expect(page.getByTestId('period-container')).toHaveCount(2);
  });

  test('shows and hides with the key below esc, and from the header', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    // From a box on the canvas, ` takes the keyboard to the prompt.
    await page.locator('[data-kb-box="subject"]').focus();
    await expect(page.locator('[data-kb-box="subject"]')).toBeFocused();
    await page.keyboard.press('Backquote');
    await expect(prompt(page)).toBeFocused();
    // From the prompt, it hides the console and gives the keyboard back to the canvas.
    await page.keyboard.press('Backquote');
    await expect(page.getByTestId('phrase-console')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('data-kb-box'))).not.toBeNull();
    // The header's control shows it again, and it stays shown across a reload.
    await page.getByTestId('console-toggle').click();
    await expect(page.getByTestId('phrase-console')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('phrase-console')).toBeVisible();
  });

  test('keeps a pinned line across a reload, and offers it first on ⇥', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.type('/subj dog /verb run');
    await run(page);
    await page.keyboard.type('/pin');
    await run(page);
    await expect(page.getByTestId('transcript-info').last()).toContainText('Pinned line');
    await page.reload();
    await prompt(page).click();
    await page.keyboard.press('Tab');
    const first = page.getByTestId('console-option').first();
    await expect(first).toHaveAttribute('data-insert', '/subj ( dog ) /verb ( run )');
    await expect(first.getByTestId('console-option-pinned')).toBeVisible();
    await page.keyboard.press('Tab');
    await run(page);
    await app.expectSentences({ en: 'the dog runs.' });
  });

  test('shows a command’s page from the help overlay', async ({ app, page }) => {
    await app.buildClause('CAT', 'RUN');
    await page.getByTestId('help-button').click();
    await page.getByTestId('console-help-row-rel').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('help-page')).toContainText('/rel #n.noun · /rel subj { … } · /rel obj { … }');
    // What it is for, as a verb is glossed (B47).
    await expect(page.getByTestId('help-page')).toContainText('— to add a relative clause to a noun');
    // The example's sentence, in the interface language.
    await expect(page.getByTestId('transcript-help').getByTestId('transcript-sentence')).toHaveText(
      'the man who loves the cat runs.',
    );
  });

  // A21: the console's own words follow the interface language — its header, the list's title, the
  // key hints, a help page's usage line, and its example, written in the words of the sentence
  // beside it as the source strip would write them.
  test('speaks the interface language: its frame, its lists and its help pages', async ({ app, page }) => {
    await expect(page.getByTestId('console-period')).toHaveText('Period 1');
    await app.setUiLanguage('it');
    await expect(page.getByTestId('console-period')).toHaveText('Periodo 1');
    await expect(page.getByTestId('source-strip')).toContainText('periodo vuoto');
    await expect(prompt(page)).toHaveAttribute('placeholder', 'digita una parola o un comando (/)');

    await prompt(page).click();
    await page.keyboard.type('/');
    await expect(page.getByTestId('console-list-title')).toHaveText('comandi');
    await expect(page.getByTestId('console-list')).toContainText('sposta');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');

    await page.keyboard.type('/help rel');
    await run(page);
    const help = page.getByTestId('help-page');
    await expect(help.first()).toContainText('— aggiungere una proposizione relativa a un sostantivo'); // B47
    await expect(help.first().getByTestId('help-example')).toHaveText(
      '/subj ( uomo /rel subj { /verb ( amare ) /obj ( gatto ) } ) /verb ( correre )',
    );
    await expect(page.getByTestId('transcript-help').getByTestId('transcript-sentence')).toHaveText(
      "l'uomo che ama il gatto corre.",
    );
    await page.keyboard.type('/help subj');
    await run(page);
    await expect(page.getByTestId('help-page').last().getByTestId('help-usage')).toHaveText('/subj ( parola … )');

    // German keeps its noun capitalized: the header shows the name as the engine renders it.
    await app.setUiLanguage('de');
    await expect(page.getByTestId('console-period')).toHaveText('Satzgefüge 1');
    await expect(help.first().getByTestId('help-example')).toContainText('/subj ( Mann');
    await expect(help.first()).toContainText('— einen Relativsatz zu einem Substantiv hinzufügen'); // B47
  });

  // B45 and B46: the pin, what pinning leaves, the lines' list and the history tag, a command's
  // values and a help page's labels follow the interface language too.
  test('pins, walks and labels its lines in the interface language', async ({ app, page }) => {
    await app.setUiLanguage('it');
    await prompt(page).click();
    await page.keyboard.type('/subj cat');
    await run(page);
    await expect(page.getByTestId('pin-line').first()).toHaveAccessibleName('Fissa questa riga');
    await page.keyboard.type('/pin');
    await run(page);
    await expect(page.getByTestId('transcript-info').last()).toContainText('Riga fissata');
    await expect(page.getByTestId('pin-line').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('pin-line').first()).toHaveAccessibleName('Sblocca questa riga');

    // ⇥ on the empty prompt: the pinned line, then the recent one, the list headed by both kinds.
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('console-list-title')).toHaveText('righe fissate · righe recenti');
    await expect(page.getByTestId('console-option').first()).toContainText('fissata');
    await expect(page.getByTestId('phrase-console')).toContainText("chiudi l'elenco");
    await page.keyboard.press('Escape');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId('console-history-tag')).toHaveText('cronologia · 1/2');
    await page.keyboard.press('ArrowDown');
    await expect(prompt(page)).toHaveValue('');

    // A command's values, the command after the title; a help page's labels, each before a colon.
    await page.keyboard.type('/command ');
    await expect(page.getByTestId('console-list-title')).toHaveText('valori · /command');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');
    await page.keyboard.type('/help pl');
    await run(page);
    const help = page.getByTestId('help-page').last();
    await expect(help.getByTestId('help-usage-line')).toHaveText('Uso: /pl · alias /plural');
    await expect(help.getByTestId('help-example-line')).toContainText('Esempio: /subj ( gatto /pl )');

    await app.setUiLanguage('de');
    await expect(help.getByTestId('help-usage-line')).toHaveText('Verwendung: /pl · Alias /plural');
    await expect(page.getByTestId('pin-line').first()).toHaveAccessibleName('Diese Zeile lösen');
    await prompt(page).click();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId('console-history-tag')).toHaveText('Verlauf · 1/3');
  });

  // A22: the completion rows A21 left in English — what `/del` removes, what a bracket would make,
  // and which period a reference reaches.
  test('names what /del removes, what a bracket makes and which period a reference reaches', async ({ app, page }) => {
    await app.setUiLanguage('it');
    await prompt(page).click();
    await page.keyboard.type('/subj dog');
    await run(page);
    await page.keyboard.type('/new /subj cat');
    await run(page);
    const row = (insert: string) => page.locator(`[data-testid="console-option"][data-insert="${insert}"]`);

    // `/del`'s arguments, each by the canvas's name for the part it removes — the adjective, the
    // other side of a coordination, a complement by its box rather than by the internal type name.
    await page.keyboard.type('/del ');
    await expect(row('adj')).toContainText('Aggettivo');
    await expect(row('and')).toContainText('Congiunto');
    await expect(row('term')).toContainText('Complemento di termine');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');

    // A link's first rows make a phrase rather than point at one, and say what: a new clause, the
    // role the noun would take in it, and the noun, outside the phrase (the C14 rule).
    await page.keyboard.type('/subj cat /rel ');
    await expect(row('subj {')).toContainText('nuova proposizione · Soggetto: gatto');
    await expect(row('obj {')).toContainText('nuova proposizione · Complemento oggetto: gatto');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(prompt(page)).toHaveValue('');

    // A reference to a noun says which period it is in, the number after the name as the header
    // writes it; German capitalizes the noun, so it is not lower-cased.
    await page.keyboard.type('#');
    await expect(row('#2.subj')).toContainText('Periodo 2');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await app.setUiLanguage('de');
    await prompt(page).click();
    await page.keyboard.type('#');
    await expect(row('#2.subj')).toContainText('Satzgefüge 2');
  });

  // B42, B43: the console's name, the way back to the canvas, the preview tags, the source strip's
  // hint and the chip of a period being edited, in German — and the header row's name.
  test('names itself, the canvas and the period it edits in the interface language', async ({ app, page }) => {
    await app.setUiLanguage('de');
    await expect(page.getByTestId('console-toggle')).toContainText('Konsole');
    await expect(page.locator('[data-kb-region="header"]')).toHaveAttribute('aria-label', 'Symbolleiste');
    const docked = page.getByTestId('phrase-console');
    await expect(docked).toContainText('Konsole');
    await expect(docked).toContainText('zur Arbeitsfläche zurückkehren');
    await expect(prompt(page)).toHaveAttribute('aria-label', 'Konsole');
    await expect(docked.getByRole('button', { name: 'Die Konsole verstecken' })).toBeVisible();

    await prompt(page).click();
    await page.keyboard.type('/subj cat');
    await expect(page.getByTestId('translation-preview').first()).toHaveText('Vorschau');
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/edit · klicken, um zu bearbeiten');
    await page.getByTestId('source-line').first().click();
    const chip = page.getByTestId('console-chip').locator('[data-editing]');
    await expect(chip).toHaveAttribute('data-editing', '1');
    await expect(chip).toHaveText('Bearbeiten · Satzgefüge 1 ›');
  });

  // P09-E51 D3: a superlative's set is `/outof`, the same field `/than` fills, and `/del outof` takes it off.
  test('names a superlative’s set with /outof', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj ( cat ) /verb ( be ) /pred ( big /most /outof [ dog /pl ] )');
    await run(page);
    await app.expectSentences({ en: 'the cat is the biggest of the dogs.', it: 'il gatto è il più grande dei cani.', ja: '猫は犬の中で最も大きいです。' });
    await expect(app.satellite('predicativeStandard')).toHaveAttribute('aria-label', /comparison set/i);

    await page.keyboard.insertText('/del outof');
    await run(page);
    await app.expectSentences({ en: 'the cat is biggest.' });
  });

  // P09-E48 D4: a noun's examples are `/suchas` or `/including`, and `/del eg` takes them off.
  test('names a set’s members with /suchas, and takes them off with /del eg', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj ( animal /pl /zero /suchas [ cat ] ) /verb ( run )');
    await run(page);
    await app.expectSentences({ en: 'animals such as the cat run.', it: 'animali come il gatto corrono.', ja: '猫のような動物は走ります。' });
    await expect(page.getByTestId('examples-chip')).toHaveText(/such as/i);

    // The console's context has moved on to the verb: /subj goes back to the noun whose examples go.
    await page.keyboard.insertText('/subj /del eg');
    await run(page);
    await app.expectSentences({ en: 'animals run.' });
    await expect(page.getByTestId('examples-chip')).toHaveCount(0);
  });
});
