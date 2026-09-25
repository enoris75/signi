import { expect, test } from './fixtures.ts';
import type { Page } from '@playwright/test';

/**
 * P13: the constructs a definition needs, each said in the console and on the canvas alike — here the
 * relative clause said alone, its head unspoken, which is how an adjective is defined (OKAY "that has
 * no problems").
 */

const prompt = (page: Page) => page.getByTestId('console-prompt');

async function run(page: Page): Promise<void> {
  if (await page.getByTestId('console-list').isVisible()) await page.keyboard.press('Escape');
  await page.keyboard.press('Enter');
  await expect(prompt(page)).toHaveValue('');
}

test.describe('a relative clause said alone', () => {
  test('is typed as /headless and drops the head from every language', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /rel subj ( /verb love /obj cat ) /headless');
    await run(page);
    await app.expectSentences({ en: 'who loves the cat.', it: 'che ama il gatto.', de: 'der den Kater liebt.', ja: '猫を愛する。' });
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( man /rel #2.subj /headless )');
  });

  test('is a chip beside the relative control, written back as /headless and taken back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /rel subj ( /verb love /obj cat )');
    await run(page);
    await app.expectSentences({ en: 'the man who loves the cat.' });

    const chip = app.period(0).getByTestId('headless-ctl-subject').locator('button');
    await chip.click();
    await app.expectSentences({ en: 'who loves the cat.' });
    await expect(page.getByTestId('source-strip')).toContainText('/rel #2.subj /headless');

    await chip.click();
    await app.expectSentences({ en: 'the man who loves the cat.' });
    await expect(page.getByTestId('source-strip')).not.toContainText('/headless');
  });

  test('offers no chip on a noun without a relative clause', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /verb run');
    await run(page);
    await expect(app.period(0).getByTestId('headless-ctl-subject')).toHaveCount(0);
  });
});

test.describe('the subject’s reading', () => {
  test('is typed as /gloss, and says FAST as the manner it defines', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj speed /zero /adj high /gloss manner');
    await run(page);
    await app.expectSentences({ en: 'at high speed.' });
    await expect(page.getByTestId('source-strip')).toContainText('/subj ( speed /adj high /zero /gloss manner )');
  });

  test('is a chip on a verbless period’s subject, each click the next reading, and a time reading has a relation', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj time /this');
    await run(page);
    await app.expectSentences({ en: 'this time.' });

    const chip = app.period(0).getByTestId('gloss-ctl-subject').locator('button');
    // dimension → manner → place → direction → time
    for (let i = 0; i < 5; i++) await chip.click();
    await expect(page.getByTestId('source-strip')).toContainText('/gloss time');
    // at → ago → until, as the temporal's own toolbar orders them.
    const relation = app.period(0).getByTestId('glossRelation-ctl-subject').locator('button');
    await relation.click();
    await relation.click();
    await app.expectSentences({ en: 'until this time.' });
    await expect(page.getByTestId('source-strip')).toContainText('/gloss time /until');
  });

  test('offers no chip on a period with a verb', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /verb run');
    await run(page);
    await expect(app.period(0).getByTestId('gloss-ctl-subject')).toHaveCount(0);
  });
});

test.describe('what a possessor is to its noun', () => {
  test('says a part of a place, as AREA does, typed or clicked', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj part /a /poss ( /subj place /a )');
    await run(page);
    await app.expectSentences({ en: "a place's part." });

    const chip = app.period(0).getByTestId('possessorRole-ctl-subject').locator('button');
    await chip.click();
    await app.expectSentences({ en: 'a part of a place.' });
    await expect(page.getByTestId('source-strip')).toContainText('/poss [ place /a ] /whole');
    // whole → parts → owner
    await chip.click();
    await chip.click();
    await app.expectSentences({ en: "a place's part." });
  });
});

test.describe('whose an infinitive is', () => {
  test('is the object’s with /objctl, as DO’s causee is, and the switch gives it back', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/inf /verb CAUSE_VERB /obj action /a /to ( /verb happen ) /objctl');
    await run(page);
    // Japanese says whose it is: the causee's 〜ようにする, not the causer's.
    await app.expectSentences({ en: 'to cause an action to happen.', ja: '動作が起こるようにする。' });
    await expect(page.getByTestId('source-strip')).toContainText('/to #2 /objctl');

    const control = app.period(1).getByTestId('infinitive-control');
    await expect(control).toHaveAttribute('aria-checked', 'true');
    await control.click();
    await app.expectSentences({ ja: '起こるように動作を引き起こす。' });
    await expect(page.getByTestId('source-strip')).not.toContainText('/objctl');
  });
});

test.describe('the object complement and the companion', () => {
  test('say INCLUDE and ACCOMPANY as their definitions do', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/inf /verb HAVE /objpred ( PART /zero )');
    await run(page);
    await app.expectSentences({ en: 'to have as part.', it: 'avere come parte.' });

    await prompt(page).click();
    await page.keyboard.insertText('/new /inf /verb GO /with ( PERSON /a )');
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/with ( PERSON /a )');
  });

  test('turns the object into it with the toolbar’s Result', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /verb see /obj cat /objpred ( friend /a )');
    await run(page);
    await app.expectSentences({ en: 'the man sees the cat as a friend.' });
    await expect(page.getByTestId('predication-toolbar')).toBeVisible();
    await page.getByRole('button', { name: 'Result', exact: true }).click();
    await expect(page.getByTestId('source-strip')).toContainText('/objpred ( friend /factitive )');
  });
});

test.describe('a relative clause whose gap no box holds', () => {
  test('takes the instrument, CAR’s "an object with which one goes to a place", typed or picked', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj OBJECT_THING /a /rel #2.inst\n/subj one /verb GO /dir ( PLACE /a )');
    await run(page);
    await app.expectSentences({ en: 'an object with which one goes to a place.' });

    // The same link, picked on the canvas: the relative control, then the instrument toggle.
    await app.period(0).getByTestId('relative-ctl-subject').locator('button').click();
    await app.period(0).getByTestId('relative-ctl-subject').locator('button').click();
    await app.period(1).getByTestId('satellite-instrumental').click();
    await app.expectSentences({ en: 'an object with which one goes to a place.' });
    await expect(page.getByTestId('source-strip')).toContainText('/rel #2.inst');
  });
});

test.describe('a clause of purpose', () => {
  test('says SAVE, "to write content to load it", its "it" taking the content’s gender', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/inf /verb WRITE /obj ( CONTENT /zero ) /so ( /verb LOAD /obj 3rd )');
    await run(page);
    await app.expectSentences({ en: 'to write content to load it.', de: 'Inhalt schreiben, um ihn zu laden.' });
    await expect(page.getByTestId('source-strip')).toContainText('/so #2');
  });

  test('is a row of the subordinate clause menu, P', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj man /verb read /obj book\n/verb learn');
    await run(page);
    await app.linkSubordinate(0, 1, 'Purpose');
    await app.expectSentences({ en: 'the man reads the book to learn.' });
  });
});

test.describe('an infinitive the predicate adjective governs', () => {
  test('says CAN, "to be able to act", with each language’s own linker', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/inf /verb BE /pred ABLE /to ( /verb ACT )');
    await run(page);
    await app.expectSentences({ en: 'to be able to act.', it: 'essere capace di agire.' });
    await expect(page.getByTestId('source-strip')).toContainText('/to #2');
  });
});

test.describe('the last small constructs', () => {
  test('say JUMP’s "into the air" and LET’s infinitive of an infinitive', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/inf /verb MOVE_ONESELF /dir ( AIR /in )');
    await run(page);
    await app.expectSentences({ en: 'to move into the air.' });
    await expect(page.getByTestId('direction-toolbar')).toBeVisible();

    await prompt(page).click();
    await page.keyboard.insertText('/new /inf /verb CAUSE_VERB /obj ( PERSON /a ) /to ( /verb BE /pred ALLOWED /to ( /verb ACT ) ) /objctl');
    await run(page);
    await expect(page.getByTestId('source-strip')).toContainText('/to #3');
  });
});

test.describe('joined predicate adjectives', () => {
  test('are typed with /or, and a predicate’s conjunct ring picks an adjective', async ({ app, page }) => {
    await prompt(page).click();
    await page.keyboard.insertText('/subj cat /verb become /pred ( HAPPY /or SAD )');
    await run(page);
    await app.expectSentences({ en: 'the cat becomes happy or sad.' });

    // On the canvas: the predicate's coordination control adds a ring that takes an adjective too.
    await prompt(page).click();
    await page.keyboard.insertText('/new /subj dog /verb become /pred HAPPY');
    await run(page);
    await app.period(1).getByTestId('satellite-predicativeConjunct').click();
    // Its picker opens with the predicate's switch — Noun | Adjective — as the predicate's own does.
    await page.getByRole('button', { name: 'Adjective', exact: true }).last().click();
    await page.keyboard.type('tired');
    await page.locator('[data-testid="typeahead-option"][data-concept="TIRED"]').click();
    await expect(page.getByTestId('source-strip')).toContainText('/pred ( happy /and tired )');
  });
});
