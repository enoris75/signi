import type { Locator } from '@playwright/test';
import { test, expect } from './fixtures';

// Hovering a word in a picker dropdown surfaces the concept's definition in a tooltip.
//
// A definition comes from one of two sources, both keyed by the current UI language and both
// falling back to English:
//   - an engine-composed `definition` plan (CAT → "a small mammal"), rendered from seeded
//     concepts into every language, so the tooltip is localized like the rest of the UI;
//   - the stored `concept_definitions` literal (FEELING → "an emotion or sensation one feels"),
//     of which only English is seeded.
test.describe('word definition tooltip', () => {
  const tooltip = '.MuiTooltip-tooltip';

  test('shows the definition on hover in the subject picker', async ({ app, page }) => {
    // PERSON carries only a stored English literal: it is one of the primitives the definition
    // language is built out of, so C26 leaves it on the literal by design. (FEELING was this
    // test's example until B53 gave it a plan on STATE.)
    await app.subjectInput.fill('person');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="PERSON"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toBeVisible();
    await expect(page.locator(tooltip)).toHaveText('a human being');
  });

  test('shows the definition on hover in the verb picker', async ({ app, page }) => {
    // The verb slot only becomes active (and its picker rendered) once a subject is chosen.
    await app.setSubject('CAT');
    await app.verbInput.fill('eat');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="EAT"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toHaveText('to consume food');
  });

  test('a genus+count-noun verb definition renders (localize-seed B09: MAKE)', async ({
    app,
    page,
  }) => {
    // English: an infinitive citation on the CREATE genus, with the count-noun differentia
    // OBJECT_THING passed plural — "to create objects", not "to create object".
    await app.setSubject('CAT');
    await app.verbInput.fill('make');
    const makeEn = page.locator('[data-testid="typeahead-option"][data-concept="MAKE"]');
    await expect(makeEn).toBeVisible();
    await makeEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to create objects');

    // German: the same plan — the bare object precedes the infinitive. No German literal is stored.
    await app.setUiLanguage('de');
    await app.verbInput.fill('make');
    const makeDe = page.locator('[data-testid="typeahead-option"][data-concept="MAKE"]');
    await expect(makeDe).toBeVisible();
    await makeDe.hover();
    await expect(page.locator(tooltip)).toHaveText('Gegenstände erschaffen');
  });

  test('a genus+mass-noun verb definition renders (localize-seed B09: SET_ON_FIRE)', async ({
    app,
    page,
  }) => {
    // English: CREATE + the singular differentia FIRE — "to create fire". Searched by its synonym,
    // since its English label "burn" also matches the intransitive BURN.
    await app.setSubject('CAT');
    await app.verbInput.fill('set on fire');
    const fireEn = page.locator('[data-testid="typeahead-option"][data-concept="SET_ON_FIRE"]');
    await expect(fireEn).toBeVisible();
    await fireEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to create fire');

    // Japanese: the same plan, object-marked and verb-final in dictionary form — "火を生み出す".
    await app.setUiLanguage('ja');
    await app.verbInput.fill('set on fire');
    const fireJa = page.locator('[data-testid="typeahead-option"][data-concept="SET_ON_FIRE"]');
    await expect(fireJa).toBeVisible();
    await fireJa.hover();
    await expect(page.locator(tooltip)).toHaveText('火を生み出す');
  });

  test('a genus+mass-noun verb definition renders (localize-seed B10: KILL)', async ({
    app,
    page,
  }) => {
    // English: an infinitive citation on the DESTROY genus with the differentia LIFE — "to destroy
    // life", replacing the stored literal "to cause the death of".
    await app.setSubject('CAT');
    await app.verbInput.fill('kill');
    const killEn = page.locator('[data-testid="typeahead-option"][data-concept="KILL"]');
    await expect(killEn).toBeVisible();
    await killEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to destroy life');

    // Italian: the same plan, the true infinitive before a bare object. No Italian literal is stored.
    await app.setUiLanguage('it');
    await app.verbInput.fill('kill');
    const killIt = page.locator('[data-testid="typeahead-option"][data-concept="KILL"]');
    await expect(killIt).toBeVisible();
    await killIt.hover();
    await expect(page.locator(tooltip)).toHaveText('distruggere vita');
  });

  test('a genus+mass-noun verb definition renders (localize-seed B10: EXTINGUISH)', async ({
    app,
    page,
  }) => {
    // English: DESTROY + FIRE — "to destroy fire". Searched by its synonym, since its English label
    // is the phrasal "put out".
    await app.setSubject('CAT');
    await app.verbInput.fill('extinguish');
    const extEn = page.locator('[data-testid="typeahead-option"][data-concept="EXTINGUISH"]');
    await expect(extEn).toBeVisible();
    await extEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to destroy fire');

    // French: the same plan, the bare count object taking the generic definite (A207) — "détruire le feu".
    await app.setUiLanguage('fr');
    await app.verbInput.fill('extinguish');
    const extFr = page.locator('[data-testid="typeahead-option"][data-concept="EXTINGUISH"]');
    await expect(extFr).toBeVisible();
    await extFr.hover();
    await expect(page.locator(tooltip)).toHaveText('détruire le feu');
  });

  test('a genus+mass-noun verb definition renders (localize-seed B10: CLEAR)', async ({
    app,
    page,
  }) => {
    // English: DESTROY + CONTENT — "to destroy content".
    await app.setSubject('CAT');
    await app.verbInput.fill('clear');
    const clearEn = page.locator('[data-testid="typeahead-option"][data-concept="CLEAR"]');
    await expect(clearEn).toBeVisible();
    await clearEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to destroy content');

    // Japanese: the same plan, object-marked and verb-final in dictionary form — "内容を破壊する".
    await app.setUiLanguage('ja');
    await app.verbInput.fill('clear');
    const clearJa = page.locator('[data-testid="typeahead-option"][data-concept="CLEAR"]');
    await expect(clearJa).toBeVisible();
    await clearJa.hover();
    await expect(page.locator(tooltip)).toHaveText('内容を破壊する');
  });

  test('a genus+mass-noun verb definition renders (localize-seed B11: SEE)', async ({
    app,
    page,
  }) => {
    // English: an infinitive citation on the PERCEIVE genus with the differentia LIGHT — "to perceive
    // light", replacing the stored literal "to perceive with the eyes".
    await app.setSubject('CAT');
    await app.verbInput.fill('see');
    const seeEn = page.locator('[data-testid="typeahead-option"][data-concept="SEE"]');
    await expect(seeEn).toBeVisible();
    await seeEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to perceive light');

    // Spanish: the same plan, the object bare after the infinitive — "percibir luz".
    await app.setUiLanguage('es');
    await app.verbInput.fill('see');
    const seeEs = page.locator('[data-testid="typeahead-option"][data-concept="SEE"]');
    await expect(seeEs).toBeVisible();
    await seeEs.hover();
    await expect(page.locator(tooltip)).toHaveText('percibir luz');
  });

  test('a genus+count-noun verb definition renders (localize-seed B11: KNOW)', async ({
    app,
    page,
  }) => {
    // English: UNDERSTAND + the count-noun differentia CONCEPT, passed plural — "to understand
    // concepts".
    await app.setSubject('CAT');
    await app.verbInput.fill('know');
    const knowEn = page.locator('[data-testid="typeahead-option"][data-concept="KNOW"]');
    await expect(knowEn).toBeVisible();
    await knowEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to understand concepts');

    // Portuguese: the same plan — "compreender conceitos". No Portuguese literal is stored.
    await app.setUiLanguage('pt');
    await app.verbInput.fill('know');
    const knowPt = page.locator('[data-testid="typeahead-option"][data-concept="KNOW"]');
    await expect(knowPt).toBeVisible();
    await knowPt.hover();
    await expect(page.locator(tooltip)).toHaveText('compreender conceitos');
  });

  test('a verb definition with an adjective on its object renders (localize-seed B11: READ)', async ({
    app,
    page,
  }) => {
    // English: UNDERSTAND + WORD modified by WRITTEN — "to understand written words", the first
    // infinitive gloss whose differentia carries an adjective.
    await app.setSubject('CAT');
    await app.verbInput.fill('read');
    const readEn = page.locator('[data-testid="typeahead-option"][data-concept="READ"]');
    await expect(readEn).toBeVisible();
    await readEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to understand written words');

    // German: the same plan, the adjective strong-declined on the bare plural object, which precedes
    // the infinitive — "geschriebene Wörter verstehen".
    await app.setUiLanguage('de');
    await app.verbInput.fill('read');
    const readDe = page.locator('[data-testid="typeahead-option"][data-concept="READ"]');
    await expect(readDe).toBeVisible();
    await readDe.hover();
    await expect(page.locator(tooltip)).toHaveText('geschriebene Wörter verstehen');
  });

  // The verb glosses of localize-seed B12–B19, each in English and in one other language, the
  // languages spread across the batch. Besides the plain genus + object shape, they cover a gloss
  // whose differentia is a complement (BUY's instrument, GIVE's recipient, SEND's goal, IMPORT's
  // source), an adverb (BEAT) and an object under a determiner (CHOOSE, CLICK).
  for (const [id, query, en, language, other] of [
    ['OWN', 'own', 'to have property', 'it', 'avere proprietà'],
    ['HOLD', 'hold', 'to have objects', 'fr', 'avoir des objets'],
    ['BUY', 'buy', 'to acquire objects with money', 'de', 'Gegenstände mit Geld erwerben'],
    ['CUT', 'cut', 'to divide with a blade', 'es', 'dividir con una cuchilla'],
    ['BITE', 'bite', 'to cut with the teeth', 'ja', '歯で切る'],
    ['BEAT', 'beat', 'to strike repeatedly', 'pt', 'golpear repetidamente'],
    ['GIVE', 'give', 'to transfer objects to a person', 'de', 'einer Person Gegenstände übertragen'],
    ['SEND', 'send', 'to transfer objects to a place', 'it', 'trasferire oggetti a un luogo'],
    ['NAME', 'name', 'to indicate objects with words', 'ja', '単語で物体を示す'],
    ['DESCRIBE', 'describe', 'to indicate qualities', 'fr', 'indiquer des qualités'],
    ['EXPRESS', 'express', 'to indicate concepts', 'es', 'indicar conceptos'],
    ['MODIFY', 'modify', 'to change qualities', 'de', 'Qualitäten ändern'],
    ['LOVE', 'love', 'to feel affection', 'it', 'provare affetto'],
    ['CRY', 'cry', 'to shed tears', 'de', 'Tränen vergießen'],
    ['CRY_OUT', 'cry', 'to produce loud sounds', 'fr', 'produire des sons forts'],
    ['CHOOSE', 'choose', 'to indicate an option', 'it', "indicare un'opzione"],
    ['CLICK', 'click', 'to press a button', 'es', 'pulsar un botón'],
    ['TYPE', 'type', 'to write with a keyboard', 'ja', 'キーボードで書く'],
    ['EXPORT', 'export', 'to transfer content to a place', 'pt', 'transferir conteúdo a um lugar'],
    ['IMPORT', 'import', 'to transfer content from a place', 'de', 'Inhalt von einem Ort übertragen'],
  ] as const) {
    test(`a verb definition renders (localize-seed B12–B19: ${id})`, async ({ app, page }) => {
      const option = page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);
      await app.setSubject('CAT');

      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(en);

      await app.setUiLanguage(language);
      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(other);
    });
  }

  // C17: the genus MOVE_ONESELF is a reflexive verb in Italian and German, which leads the citation with
  // its clitic or pronoun: "muoversi da un luogo…", "sich schnell bewegen". B34 and B35 gave it the
  // goal preposition "verso" / "vers" in Italian and French: "verso il parlante", "vers le sol".
  for (const [id, query, en, language, other] of [
    ['RUN', 'run', 'to move fast', 'de', 'sich schnell bewegen'],
    ['GO', 'go', 'to move from a place to another place', 'it', 'muoversi da un luogo verso un altro luogo'],
    ['COLLAPSE', 'collapse', 'to move to the ground suddenly', 'fr', 'se déplacer soudainement vers le sol'],
    ['COME', 'come', 'to move to the speaker', 'it', 'muoversi verso il parlante'],
  ] as const) {
    test(`a reflexive-genus verb definition renders (localize-seed C17: ${id})`, async ({ app, page }) => {
      const option = page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);
      await app.setSubject('CAT');

      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(en);

      await app.setUiLanguage(language);
      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(other);
    });
  }

  // C08: the causative — the definition's infinitive complement is controlled by the verb's OBJECT
  // ("to cause a person TO SEE objects": the person sees), which Japanese says as 〜ようにする with the
  // causee inside the clause. APPEAR rides along as the state one of them causes, BECOME + VISIBLE.
  for (const [id, query, en, language, other] of [
    ['SHOW', 'show', 'to cause a person to see objects', 'ja', '人が物体を見るようにする'],
    ['HIDE', 'hide', 'to cause an object not to be visible', 'it', 'indurre un oggetto a non essere visibile'],
    ['START', 'start', 'to cause an action to begin', 'de', 'eine Handlung veranlassen zu beginnen'],
    ['COMPACT', 'compact', 'to cause an object to become smaller', 'es', 'inducir un objeto a volverse más pequeño'],
    ['COORDINATE', 'coordinate', 'to cause people to act together', 'pt', 'induzir pessoas a agir juntas'],
    ['APPEAR', 'appear', 'to become visible', 'fr', 'devenir visible'],
  ] as const) {
    test(`a causative verb definition renders (localize-seed C08: ${id})`, async ({ app, page }) => {
      const option = page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);
      await app.setSubject('CAT');

      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(en);

      await app.setUiLanguage(language);
      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(other);
    });
  }

  test('an engine-composed definition renders in the current UI language', async ({
    app,
    page,
  }) => {
    // English: the composed plan (genus MAMMAL + differentia SMALL) supersedes CAT's stored
    // English literal.
    await app.subjectInput.fill('cat');
    const catEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="CAT"]',
    );
    await expect(catEn).toBeVisible();
    await catEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a small mammal');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('gatt');
    const catIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="CAT"]',
    );
    await expect(catIt).toBeVisible();
    await catIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un piccolo mammifero');
  });

  // A19. The words panel titled its words with the seed's English description ("domestic feline
  // animal"), so none of the definitions above reached it, in any language.
  test('the words panel defines its words as the pickers do, in the UI language', async ({ app, page }) => {
    const panel = page.locator('[data-kb-region="words"]');
    const cat = panel.locator('[data-kb-word="CAT"]').first();

    await page.getByRole('button', { name: 'Words', exact: true }).click();
    await expect(panel).not.toHaveAttribute('inert', '');
    await cat.hover();
    await expect(page.locator(tooltip)).toHaveText('a small mammal');

    await app.setUiLanguage('it');
    await page.mouse.move(0, 0);
    await cat.hover();
    await expect(page.locator(tooltip)).toHaveText('un piccolo mammifero');
  });

  test('a genus+differentia noun definition renders (localize-seed A01: BOY)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG + MALE.
    await app.subjectInput.fill('boy');
    const boyEn = page.locator('[data-testid="typeahead-option"][data-concept="BOY"]');
    await expect(boyEn).toBeVisible();
    await boyEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young male person');

    // German: the same plan, localized by the engine. (Filling the English label still matches —
    // the picker searches the English label alongside the shown word.)
    await app.setUiLanguage('de');
    await app.subjectInput.fill('boy');
    const boyDe = page.locator('[data-testid="typeahead-option"][data-concept="BOY"]');
    await expect(boyDe).toBeVisible();
    await boyDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine junge männliche Person');
  });

  test('a genus+differentia noun definition renders (localize-seed A02: YOUNG_MAN)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG + MALE (shared with BOY).
    await app.subjectInput.fill('young man');
    const youngManEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_MAN"]',
    );
    await expect(youngManEn).toBeVisible();
    await youngManEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young male person');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('young man');
    const youngManIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_MAN"]',
    );
    await expect(youngManIt).toBeVisible();
    await youngManIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una giovane persona maschile');
  });

  test('a genus+differentia noun definition renders (localize-seed A03: YOUNG_WOMAN)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG + FEMALE.
    await app.subjectInput.fill('young woman');
    const youngWomanEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_WOMAN"]',
    );
    await expect(youngWomanEn).toBeVisible();
    await youngWomanEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young female person');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('young woman');
    const youngWomanIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="YOUNG_WOMAN"]',
    );
    await expect(youngWomanIt).toBeVisible();
    await youngWomanIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una giovane persona femminile');
  });

  test('a genus+differentia noun definition renders (localize-seed A04: CHILD)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + YOUNG.
    await app.subjectInput.fill('child');
    const childEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="CHILD"]',
    );
    await expect(childEn).toBeVisible();
    await childEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a young person');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('child');
    const childIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="CHILD"]',
    );
    await expect(childIt).toBeVisible();
    await childIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una giovane persona');
  });

  test('a genus+relative-clause noun definition renders (localize-seed A05: CREATOR)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + a subject-gap relative clause (MAKE + bare-plural OBJECT_THING).
    await app.subjectInput.fill('creator');
    const creatorEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="CREATOR"]',
    );
    await expect(creatorEn).toBeVisible();
    await creatorEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a person who makes objects');

    // German: the same plan, localized by the engine — the relative clause is comma-set and
    // verb-final. No German literal is stored.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('creator');
    const creatorDe = page.locator(
      '[data-testid="typeahead-option"][data-concept="CREATOR"]',
    );
    await expect(creatorDe).toBeVisible();
    await creatorDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine Person, die Gegenstände macht');
  });

  test('a genus+relative-clause noun definition renders (localize-seed A06: BUILDER)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + a subject-gap relative clause (MAKE + bare-plural
    // OBJECT_THING) — shares CREATOR's gloss, since BUILD/CONSTRUCT are not seeded.
    await app.subjectInput.fill('builder');
    const builderEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="BUILDER"]',
    );
    await expect(builderEn).toBeVisible();
    await builderEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a person who makes objects');

    // Spanish: the same plan, localized by the engine — no Spanish literal is stored.
    await app.setUiLanguage('es');
    await app.subjectInput.fill('builder');
    const builderEs = page.locator(
      '[data-testid="typeahead-option"][data-concept="BUILDER"]',
    );
    await expect(builderEs).toBeVisible();
    await builderEs.hover();
    await expect(page.locator(tooltip)).toHaveText('una persona que hace objetos');
  });

  test('a genus+relative-clause noun definition renders (localize-seed A07: BUTCHER)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + a subject-gap relative clause (KILL + bare-plural ANIMAL).
    await app.subjectInput.fill('butcher');
    const butcherEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="BUTCHER"]',
    );
    await expect(butcherEn).toBeVisible();
    await butcherEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a person who kills animals');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('butcher');
    const butcherIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="BUTCHER"]',
    );
    await expect(butcherIt).toBeVisible();
    await butcherIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una persona che uccide animali');
  });

  test('a genus+two-differentia noun definition renders (localize-seed B01: DOG)', async ({
    app,
    page,
  }) => {
    // English: composed from MAMMAL + DOMESTIC + CANINE, superseding DOG's stored English literal.
    await app.subjectInput.fill('dog');
    const dogEn = page.locator('[data-testid="typeahead-option"][data-concept="DOG"]');
    await expect(dogEn).toBeVisible();
    await dogEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a domestic canine mammal');

    // Italian: the same plan, localized by the engine — the two postnominal adjectives coordinate
    // with "e". No Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('dog');
    const dogIt = page.locator('[data-testid="typeahead-option"][data-concept="DOG"]');
    await expect(dogIt).toBeVisible();
    await dogIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un mammifero domestico e canino');
  });

  test('a genus+two-differentia noun definition renders (localize-seed B01: WOLF)', async ({
    app,
    page,
  }) => {
    // English: composed from MAMMAL + WILD + CANINE.
    await app.subjectInput.fill('wolf');
    const wolfEn = page.locator('[data-testid="typeahead-option"][data-concept="WOLF"]');
    await expect(wolfEn).toBeVisible();
    await wolfEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a wild canine mammal');

    // German: the same plan, localized by the engine — both differentia are prenominal and agree.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('wolf');
    const wolfDe = page.locator('[data-testid="typeahead-option"][data-concept="WOLF"]');
    await expect(wolfDe).toBeVisible();
    await wolfDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein wildes hundeartiges Säugetier');
  });

  test('a genus+differentia noun definition renders (localize-seed B02: MAN)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + ADULT + MALE.
    await app.subjectInput.fill('man');
    const manEn = page.locator('[data-testid="typeahead-option"][data-concept="MAN"]');
    await expect(manEn).toBeVisible();
    await manEn.hover();
    await expect(page.locator(tooltip)).toHaveText('an adult male person');

    // Italian: the adjectives agree with the grammatically feminine "persona", and the two
    // postnominal ones coordinate with "e" — "una persona adulta e maschile".
    await app.setUiLanguage('it');
    await app.subjectInput.fill('man');
    const manIt = page.locator('[data-testid="typeahead-option"][data-concept="MAN"]');
    await expect(manIt).toBeVisible();
    await manIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una persona adulta e maschile');
  });

  test('a genus+differentia noun definition renders (localize-seed B02: WOMAN)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + ADULT + FEMALE.
    await app.subjectInput.fill('woman');
    const womanEn = page.locator('[data-testid="typeahead-option"][data-concept="WOMAN"]');
    await expect(womanEn).toBeVisible();
    await womanEn.hover();
    await expect(page.locator(tooltip)).toHaveText('an adult female person');

    // French: the same plan, localized by the engine.
    await app.setUiLanguage('fr');
    await app.subjectInput.fill('woman');
    const womanFr = page.locator('[data-testid="typeahead-option"][data-concept="WOMAN"]');
    await expect(womanFr).toBeVisible();
    await womanFr.hover();
    await expect(page.locator(tooltip)).toHaveText('une personne adulte et féminine');
  });

  test('a genus+differentia noun definition renders (localize-seed B02: FATHER)', async ({
    app,
    page,
  }) => {
    // English: composed from the kinship genus PARENT + MALE.
    await app.subjectInput.fill('father');
    const fatherEn = page.locator('[data-testid="typeahead-option"][data-concept="FATHER"]');
    await expect(fatherEn).toBeVisible();
    await fatherEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a male parent');

    // German: the same plan — "ein männliches Elternteil" (neuter Elternteil, agreed adjective).
    await app.setUiLanguage('de');
    await app.subjectInput.fill('father');
    const fatherDe = page.locator('[data-testid="typeahead-option"][data-concept="FATHER"]');
    await expect(fatherDe).toBeVisible();
    await fatherDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein männliches Elternteil');
  });

  test('a genus+three-differentia noun definition renders (localize-seed B02: OX)', async ({
    app,
    page,
  }) => {
    // English: composed from BOVINE + CASTRATED + ADULT + MALE — three differentia on one genus.
    await app.subjectInput.fill('ox');
    const oxEn = page.locator('[data-testid="typeahead-option"][data-concept="OX"]');
    await expect(oxEn).toBeVisible();
    await oxEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a castrated adult male bovine');

    // Spanish: three postnominal adjectives, comma-separated with "y" before the last.
    await app.setUiLanguage('es');
    await app.subjectInput.fill('ox');
    const oxEs = page.locator('[data-testid="typeahead-option"][data-concept="OX"]');
    await expect(oxEs).toBeVisible();
    await oxEs.hover();
    await expect(page.locator(tooltip)).toHaveText('un bovino castrado, adulto y masculino');
  });

  test('a patient (impersonal-subject) noun definition renders (localize-seed C04: FOOD)', async ({
    app,
    page,
  }) => {
    // English: an object-gap relative with the generic "one" as subject — "an object that one eats".
    await app.subjectInput.fill('food');
    const foodEn = page.locator('[data-testid="typeahead-option"][data-concept="FOOD"]');
    await expect(foodEn).toBeVisible();
    await foodEn.hover();
    await expect(page.locator(tooltip)).toHaveText('an object that one eats');

    // Italian: the generic subject surfaces as the impersonal "si" proclitic — "che si mangia".
    await app.setUiLanguage('it');
    await app.subjectInput.fill('food');
    const foodIt = page.locator('[data-testid="typeahead-option"][data-concept="FOOD"]');
    await expect(foodIt).toBeVisible();
    await foodIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un oggetto che si mangia');
  });

  test('a genus+relative-clause noun definition renders (localize-seed B04: POSSESSOR)', async ({
    app,
    page,
  }) => {
    // English: composed from PERSON + a subject-gap relative clause (OWN + bare-plural OBJECT_THING).
    await app.subjectInput.fill('possessor');
    const possessorEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="POSSESSOR"]',
    );
    await expect(possessorEn).toBeVisible();
    await possessorEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a person who owns objects');

    // German: the same plan, localized by the engine — the relative clause is comma-set and
    // verb-final. No German literal is stored.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('possessor');
    const possessorDe = page.locator(
      '[data-testid="typeahead-option"][data-concept="POSSESSOR"]',
    );
    await expect(possessorDe).toBeVisible();
    await possessorDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine Person, die Gegenstände besitzt');
  });

  test('a genus+relative-clause noun definition renders (localize-seed B04: CONTAINER)', async ({
    app,
    page,
  }) => {
    // English: composed from OBJECT_THING + a subject-gap relative clause (HOLD + bare-plural
    // OBJECT_THING) — an object genus rather than a person, so English relativises with "that".
    await app.subjectInput.fill('container');
    const containerEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="CONTAINER"]',
    );
    await expect(containerEn).toBeVisible();
    await containerEn.hover();
    await expect(page.locator(tooltip)).toHaveText('an object that holds objects');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('container');
    const containerIt = page.locator(
      '[data-testid="typeahead-option"][data-concept="CONTAINER"]',
    );
    await expect(containerIt).toBeVisible();
    await containerIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un oggetto che contiene oggetti');
  });

  test('a genus+differentia noun definition renders (localize-seed B05: BOOK)', async ({
    app,
    page,
  }) => {
    // English: composed from OBJECT_THING + WRITTEN, superseding BOOK's stored English literal.
    await app.subjectInput.fill('book');
    const bookEn = page.locator('[data-testid="typeahead-option"][data-concept="BOOK"]');
    await expect(bookEn).toBeVisible();
    await bookEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a written object');

    // German: the same plan — the past-participle adjective is prenominal and agrees.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('book');
    const bookDe = page.locator('[data-testid="typeahead-option"][data-concept="BOOK"]');
    await expect(bookDe).toBeVisible();
    await bookDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein geschriebener Gegenstand');
  });

  test('a genus+two-differentia noun definition renders (localize-seed B05: COIN)', async ({
    app,
    page,
  }) => {
    // English: composed from OBJECT_THING + SMALL + ROUND, superseding COIN's stored English literal.
    await app.subjectInput.fill('coin');
    const coinEn = page.locator('[data-testid="typeahead-option"][data-concept="COIN"]');
    await expect(coinEn).toBeVisible();
    await coinEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a small round object');

    // Italian: the two postnominal adjectives coordinate with "e" — "un piccolo oggetto rotondo"
    // (SMALL is prenominal in Italian, ROUND postnominal). No Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('coin');
    const coinIt = page.locator('[data-testid="typeahead-option"][data-concept="COIN"]');
    await expect(coinIt).toBeVisible();
    await coinIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un piccolo oggetto rotondo');
  });

  test('a genus+relative-clause noun definition renders (localize-seed B06: NOUN)', async ({
    app,
    page,
  }) => {
    // English: WORD + a subject-gap relative clause (NAME + bare-plural OBJECT_THING).
    await app.subjectInput.fill('noun');
    const nounEn = page.locator('[data-testid="typeahead-option"][data-concept="NOUN"]');
    await expect(nounEn).toBeVisible();
    await nounEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a word that names objects');

    // German: the same plan, comma-set and verb-final. No German literal is stored.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('noun');
    const nounDe = page.locator('[data-testid="typeahead-option"][data-concept="NOUN"]');
    await expect(nounDe).toBeVisible();
    await nounDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Wort, das Gegenstände benennt');
  });

  test('a genus+relative-clause noun definition renders (localize-seed B06: VERB)', async ({
    app,
    page,
  }) => {
    // English: WORD + a subject-gap relative clause (EXPRESS + bare-plural ACTION).
    await app.subjectInput.fill('verb');
    const verbEn = page.locator('[data-testid="typeahead-option"][data-concept="VERB"]');
    await expect(verbEn).toBeVisible();
    await verbEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a word that expresses actions');

    // French: the same plan, localized by the engine — no French literal is stored.
    await app.setUiLanguage('fr');
    await app.subjectInput.fill('verb');
    const verbFr = page.locator('[data-testid="typeahead-option"][data-concept="VERB"]');
    await expect(verbFr).toBeVisible();
    await verbFr.hover();
    await expect(page.locator(tooltip)).toHaveText('un mot qui exprime des actions');
  });

  test('a genus+relative-clause noun definition renders (localize-seed B06: ADJECTIVE)', async ({
    app,
    page,
  }) => {
    // English: WORD + a subject-gap relative clause (DESCRIBE + bare-plural NOUN).
    await app.subjectInput.fill('adjective');
    const adjEn = page.locator('[data-testid="typeahead-option"][data-concept="ADJECTIVE"]');
    await expect(adjEn).toBeVisible();
    await adjEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a word that describes nouns');

    // Italian: the same plan, localized by the engine — no Italian literal is stored.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('adjective');
    const adjIt = page.locator('[data-testid="typeahead-option"][data-concept="ADJECTIVE"]');
    await expect(adjIt).toBeVisible();
    await adjIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una parola che descrive sostantivi');
  });

  test('a genus+relative-clause noun definition renders (localize-seed B06: ADVERB)', async ({
    app,
    page,
  }) => {
    // English: WORD + a subject-gap relative clause (MODIFY + bare-plural VERB).
    await app.subjectInput.fill('adverb');
    const advEn = page.locator('[data-testid="typeahead-option"][data-concept="ADVERB"]');
    await expect(advEn).toBeVisible();
    await advEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a word that modifies verbs');

    // Spanish: the same plan, localized by the engine — no Spanish literal is stored.
    await app.setUiLanguage('es');
    await app.subjectInput.fill('adverb');
    const advEs = page.locator('[data-testid="typeahead-option"][data-concept="ADVERB"]');
    await expect(advEs).toBeVisible();
    await advEs.hover();
    await expect(page.locator(tooltip)).toHaveText('una palabra que modifica verbos');
  });

  test('a genus+relative-clause noun definition renders (localize-seed B06: PRONOUN)', async ({
    app,
    page,
  }) => {
    // English: WORD + a subject-gap relative clause (REPLACE + bare-plural NOUN).
    await app.subjectInput.fill('pronoun');
    const proEn = page.locator('[data-testid="typeahead-option"][data-concept="PRONOUN"]');
    await expect(proEn).toBeVisible();
    await proEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a word that replaces nouns');

    // Portuguese: the same plan, localized by the engine — no Portuguese literal is stored.
    await app.setUiLanguage('pt');
    await app.subjectInput.fill('pronoun');
    const proPt = page.locator('[data-testid="typeahead-option"][data-concept="PRONOUN"]');
    await expect(proPt).toBeVisible();
    await proPt.hover();
    await expect(page.locator(tooltip)).toHaveText('uma palavra que substitui substantivos');
  });

  test('a scalar adjective definition renders in the adjective picker (localize-seed B07: BIG)', async ({
    app,
    page,
  }) => {
    // The adjective-definition gloss: BIG's plan is a verbless dimension-noun fragment
    // (SIZE + degree GREAT), rendered as a prepositional fragment — "of great size". Reached
    // through the subject's adjective slot, not the core noun picker. German is asserted as the
    // second language (its "von großer Größe" is correct; French carries the known A44/A45 gloss
    // defects, so it is deliberately not pinned here).
    await app.setSubject('CAT');
    await app.openSubjectAdjective('big');
    const bigEn = page.locator('[data-testid="typeahead-option"][data-concept="BIG"]');
    await expect(bigEn).toBeVisible();
    await bigEn.hover();
    await expect(page.locator(tooltip)).toHaveText('of great size');

    // German: the same plan, localized by the engine — the degree adjective agrees in the dative
    // ("großer") and the "von" adposition governs it. No German literal is stored.
    await app.setUiLanguage('de');
    await app.openSubjectAdjective('big');
    const bigDe = page.locator('[data-testid="typeahead-option"][data-concept="BIG"]');
    await expect(bigDe).toBeVisible();
    await bigDe.hover();
    await expect(page.locator(tooltip)).toHaveText('von großer Größe');
  });

  test('a manner adverb definition renders in the adverb picker (localize-seed C03: FAST)', async ({
    app,
    page,
  }) => {
    // The manner-definition gloss: FAST's plan is a verbless manner-noun fragment (SPEED, a
    // `measure` noun, + degree HIGH), rendered as the prepositional adverbial "at high speed".
    // Reached through the verb's adverb slot, not the core pickers.
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('fast');
    const fastEn = page.locator('[data-testid="typeahead-option"][data-concept="FAST"]');
    await expect(fastEn).toBeVisible();
    await fastEn.hover();
    await expect(page.locator(tooltip)).toHaveText('at high speed');

    // German: the same plan, localized by the engine — a `measure` noun takes "mit" and the dative
    // ("hoher Geschwindigkeit"). No German literal is stored.
    await app.setUiLanguage('de');
    await app.openVerbAdverb('fast');
    const fastDe = page.locator('[data-testid="typeahead-option"][data-concept="FAST"]');
    await expect(fastDe).toBeVisible();
    await fastDe.hover();
    await expect(page.locator(tooltip)).toHaveText('mit hoher Geschwindigkeit');
  });

  test('a manner adverb definition renders in the adverb picker (localize-seed C03: WELL)', async ({
    app,
    page,
  }) => {
    // WELL glosses WAY (a `mode` noun → "in") + GOOD, indefinite — "in a good way". Pins the mode
    // relation alongside FAST's measure, and the kept determiner (the dimension gloss strips it).
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('well');
    const wellEn = page.locator('[data-testid="typeahead-option"][data-concept="WELL"]');
    await expect(wellEn).toBeVisible();
    await wellEn.hover();
    await expect(page.locator(tooltip)).toHaveText('in a good way');

    // French: the same plan — mode → "de", eliding before the indefinite ("d'une bonne manière").
    await app.setUiLanguage('fr');
    await app.openVerbAdverb('well');
    const wellFr = page.locator('[data-testid="typeahead-option"][data-concept="WELL"]');
    await expect(wellFr).toBeVisible();
    await wellFr.hover();
    await expect(page.locator(tooltip)).toHaveText("d'une bonne manière");
  });

  test('a frequency adverb definition renders, incl. the Japanese quantifier (localize-seed C03: ALWAYS)', async ({
    app,
    page,
  }) => {
    // ALWAYS glosses TIME (a `measure` noun → "at") with the `all` quantifier, plural — "at all
    // times". The point of this pin is Japanese: the ja engine now renders the prenominal quantifier
    // (すべての), which it used to drop — so ALWAYS is no longer indistinguishable from NEVER.
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('always');
    const alwaysEn = page.locator('[data-testid="typeahead-option"][data-concept="ALWAYS"]');
    await expect(alwaysEn).toBeVisible();
    await alwaysEn.hover();
    await expect(page.locator(tooltip)).toHaveText('at all times');

    await app.setUiLanguage('ja');
    await app.openVerbAdverb('always');
    const alwaysJa = page.locator('[data-testid="typeahead-option"][data-concept="ALWAYS"]');
    await expect(alwaysJa).toBeVisible();
    await alwaysJa.hover();
    await expect(page.locator(tooltip)).toHaveText('すべての時間で');
  });

  test('a frequency adverb definition renders the Japanese negative circumfix (localize-seed C03: NEVER)', async ({
    app,
    page,
  }) => {
    // NEVER glosses TIME with the `no` quantifier — "at no time". In Japanese `no` is the circumfix
    // どの…も…ない: the manner で is replaced by a fragment-final ない (どの時間もない), distinct from
    // ALWAYS's すべての時間で. This end-to-end pin is the C03 unblock's whole reason for being.
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('never');
    const neverEn = page.locator('[data-testid="typeahead-option"][data-concept="NEVER"]');
    await expect(neverEn).toBeVisible();
    await neverEn.hover();
    await expect(page.locator(tooltip)).toHaveText('at no time');

    await app.setUiLanguage('ja');
    await app.openVerbAdverb('never');
    const neverJa = page.locator('[data-testid="typeahead-option"][data-concept="NEVER"]');
    await expect(neverJa).toBeVisible();
    await neverJa.hover();
    await expect(page.locator(tooltip)).toHaveText('どの時間もない');
  });

  test('a genus+differentia noun definition renders (localize-seed B30: AFFECTION)', async ({
    app,
    page,
  }) => {
    // AFFECTION is the first concept hung under the newly seeded FEELING genus, and the first
    // caller of the WARM adjective — the figurative sense, so German inflects warm on a neuter
    // head rather than reaching for the temperature word.
    await app.subjectInput.fill('affection');
    const affectionEn = page.locator('[data-testid="typeahead-option"][data-concept="AFFECTION"]');
    await expect(affectionEn).toBeVisible();
    await affectionEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a warm feeling');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('affection');
    const affectionDe = page.locator('[data-testid="typeahead-option"][data-concept="AFFECTION"]');
    await expect(affectionDe).toBeVisible();
    await affectionDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein warmes Gefühl');
  });

  test('a genus verb definition renders (localize-seed B30: FEEL)', async ({ app, page }) => {
    // The genus HAVE with FEELING as its differentia, plural — a count noun reads bare only in
    // the plural. Italian provare / sentimenti keeps the two words apart where German does not.
    await app.setSubject('CAT');
    await app.verbInput.fill('feel');
    const feelEn = page.locator('[data-testid="typeahead-option"][data-concept="FEEL"]');
    await expect(feelEn).toBeVisible();
    await feelEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to have feelings');

    await app.setUiLanguage('it');
    await app.verbInput.fill('feel');
    const feelIt = page.locator('[data-testid="typeahead-option"][data-concept="FEEL"]');
    await expect(feelIt).toBeVisible();
    await feelIt.hover();
    await expect(page.locator(tooltip)).toHaveText('avere sentimenti');
  });

  test('the complement genus definition renders (localize-seed B31: COMPLEMENT_GRAMMAR)', async ({
    app,
    page,
  }) => {
    // The genus B23 seeded and B31 glossed: PHRASE restricted by a subject-gap relative clause.
    // Its genus (phrase, not word) is what keeps it apart from ADVERB's "a word that modifies verbs".
    await app.subjectInput.fill('complement');
    const complementEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="COMPLEMENT_GRAMMAR"]',
    );
    await expect(complementEn).toBeVisible();
    await complementEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a phrase that modifies verbs');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('complement');
    const complementDe = page.locator(
      '[data-testid="typeahead-option"][data-concept="COMPLEMENT_GRAMMAR"]',
    );
    await expect(complementDe).toBeVisible();
    await complementDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine Phrase, die Verben modifiziert');
  });

  test('a complement name is glossed on its genus (localize-seed B31: INSTRUMENTAL)', async ({
    app,
    page,
  }) => {
    // The point of the B31 hierarchy: INSTRUMENTAL's gloss is composed on COMPLEMENT_GRAMMAR, the
    // parent it gained, not on PHRASE — so the tooltip says "complement", ja 補語.
    await app.subjectInput.fill('instrumental');
    const instrumentalEn = page.locator(
      '[data-testid="typeahead-option"][data-concept="INSTRUMENTAL"]',
    );
    await expect(instrumentalEn).toBeVisible();
    await instrumentalEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a complement that indicates means');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('instrumental');
    const instrumentalJa = page.locator(
      '[data-testid="typeahead-option"][data-concept="INSTRUMENTAL"]',
    );
    await expect(instrumentalJa).toBeVisible();
    await instrumentalJa.hover();
    await expect(page.locator(tooltip)).toHaveText('手段を示す補語');
  });

  test('a locative-gap noun definition renders (localize-seed B32: HOME)', async ({ app, page }) => {
    // The whereGloss shape C07 built the engine for: the head fills the relative clause's
    // *locative* gap, and the clause carries its own generic subject. French elides l'on.
    await app.subjectInput.fill('home');
    const homeEn = page.locator('[data-testid="typeahead-option"][data-concept="HOME"]');
    await expect(homeEn).toBeVisible();
    await homeEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a place where one lives');

    await app.setUiLanguage('fr');
    await app.subjectInput.fill('home');
    const homeFr = page.locator('[data-testid="typeahead-option"][data-concept="HOME"]');
    await expect(homeFr).toBeVisible();
    await homeFr.hover();
    await expect(page.locator(tooltip)).toHaveText("un lieu où l'on habite");
  });

  test('a locative-gap noun definition renders (localize-seed B32: HOUSE)', async ({ app, page }) => {
    // Same plan as HOME's on the narrower genus B29 seeded — so the tooltip that used to be the
    // stored literal is now composed, and its genus is BUILDING rather than PLACE. German says the
    // locative relative with "in dem", not a relative adverb.
    await app.subjectInput.fill('house');
    const houseEn = page.locator('[data-testid="typeahead-option"][data-concept="HOUSE"]');
    await expect(houseEn).toBeVisible();
    await houseEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a building where one lives');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('house');
    const houseDe = page.locator('[data-testid="typeahead-option"][data-concept="HOUSE"]');
    await expect(houseDe).toBeVisible();
    await houseDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Gebäude, in dem man wohnt');
  });

  test('an objectless locative-gap definition renders (localize-seed B32: MARKET)', async ({
    app,
    page,
  }) => {
    // TRADE takes no direct object, which is what makes this gloss render in all seven: the
    // "bought and sold" of the literal needs two predicates in one relative clause, and a
    // RelativeClause holds one verbPhrase.
    await app.subjectInput.fill('market');
    const marketEn = page.locator('[data-testid="typeahead-option"][data-concept="MARKET"]');
    await expect(marketEn).toBeVisible();
    await marketEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a place where one trades');

    await app.setUiLanguage('it');
    await app.subjectInput.fill('market');
    const marketIt = page.locator('[data-testid="typeahead-option"][data-concept="MARKET"]');
    await expect(marketIt).toBeVisible();
    await marketIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un luogo dove si commercia');
  });

  test('a locative-gap definition with an object renders (localize-seed B32: PRISON)', async ({
    app,
    page,
  }) => {
    // The active with a generic subject, standing in for the literal's passive ("are confined"),
    // which the engine cannot render. Spanish agrees its impersonal se with the plural object.
    await app.subjectInput.fill('prison');
    const prisonEn = page.locator('[data-testid="typeahead-option"][data-concept="PRISON"]');
    await expect(prisonEn).toBeVisible();
    await prisonEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a building where one confines people');

    await app.setUiLanguage('es');
    await app.subjectInput.fill('prison');
    const prisonEs = page.locator('[data-testid="typeahead-option"][data-concept="PRISON"]');
    await expect(prisonEs).toBeVisible();
    await prisonEs.hover();
    await expect(page.locator(tooltip)).toHaveText('un edificio donde se encierran personas');
  });

  test('a possession gloss renders where French and Japanese blocked it (C05: BUILDING)', async ({
    app,
    page,
  }) => {
    // whoGloss on HAVE with a bare plural object. French writes the partitive a bare object needs
    // (A149, "des murs"), and Japanese says an inanimate owner's possession with ある, its object
    // marked が (A150), rather than 持つ, which is holding.
    await app.subjectInput.fill('building');
    const buildingEn = page.locator('[data-testid="typeahead-option"][data-concept="BUILDING"]');
    await expect(buildingEn).toBeVisible();
    await buildingEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a place that has walls');

    await app.setUiLanguage('fr');
    await app.subjectInput.fill('building');
    const buildingFr = page.locator('[data-testid="typeahead-option"][data-concept="BUILDING"]');
    await expect(buildingFr).toBeVisible();
    await buildingFr.hover();
    await expect(page.locator(tooltip)).toHaveText('un lieu qui a des murs');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('building');
    const buildingJa = page.locator('[data-testid="typeahead-option"][data-concept="BUILDING"]');
    await expect(buildingJa).toBeVisible();
    await buildingJa.hover();
    await expect(page.locator(tooltip)).toHaveText('壁がある場所');
  });

  test('a literal definition falls back to English under a non-English UI language', async ({
    app,
    page,
  }) => {
    // PERSON has no definition plan and only an English literal, so an Italian UI reverts to it.
    // The search still finds it by its English label, which is why "person" works under it.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('person');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="PERSON"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toHaveText('a human being');
  });

  test('a modal definition governs an infinitive (localization C09: CAN, WILL)', async ({
    app,
    page,
  }) => {
    // The modals sit in their own picker, revealed from the verb box. CAN is BE + ABLE governing ACT
    // — "to be able to act"; the adjective names the link, so Italian reads "capace di agire".
    await app.buildClause('CAT', 'EAT');
    await app.satellite('verbModal').click();
    const modalInput = page.getByTestId('box-verbModal').locator('input');
    await modalInput.fill('can');
    const canEn = page.locator('[data-testid="typeahead-option"][data-concept="CAN"]');
    await expect(canEn).toBeVisible();
    await canEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to be able to act');

    // WILL is DESIRE governing ACT, never its own lemma "want".
    await modalInput.fill('want');
    const willEn = page.locator('[data-testid="typeahead-option"][data-concept="WILL"]');
    await expect(willEn).toBeVisible();
    await willEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to desire to act');

    await app.setUiLanguage('it');
    await modalInput.fill('can');
    const canIt = page.locator('[data-testid="typeahead-option"][data-concept="CAN"]');
    await expect(canIt).toBeVisible();
    await canIt.hover();
    await expect(page.locator(tooltip)).toHaveText('essere capace di agire');
  });

  test('a pronoun definition is hoverable in the person row (localization C06)', async ({
    app,
    page,
  }) => {
    // A pronoun is described rather than searched for, so it never passes through a picker list
    // and never through ConceptOption — the person row is its definition surface instead. The
    // gloss is a definite genus + ordinal ("the first person"), the ordinal being the same word
    // the option under it is named with.
    const person = (id: string) => page.locator(`[data-concept="${id}"]`);
    const clearTooltip = async () => {
      await page.mouse.move(0, 0);
      await expect(page.locator(tooltip)).toHaveCount(0);
    };

    await app.subjectInput.click();
    await page.getByTestId('pronoun-tab').click();

    await expect(person('FIRST_PERSON')).toBeVisible();
    await person('FIRST_PERSON').hover();
    await expect(page.locator(tooltip)).toHaveText('the first person');
    await clearTooltip();

    await person('THIRD_PERSON').hover();
    await expect(page.locator(tooltip)).toHaveText('the third person');
    await clearTooltip();

    // And in another UI language — the point of composing the gloss rather than storing a literal.
    // German declines the ordinal after the definite article: "die zweite Person".
    await app.setUiLanguage('de');
    await app.subjectInput.click();
    await page.getByTestId('pronoun-tab').click();
    await expect(person('SECOND_PERSON')).toBeVisible();
    await person('SECOND_PERSON').hover();
    await expect(page.locator(tooltip)).toHaveText('die zweite Person');
  });

  test('a purpose clause carries the whole differentia (localization C19 and C20: SAVE)', async ({
    app,
    page,
  }) => {
    // SAVE is not distinguished by what it writes but by what the writing is *for*, so its gloss
    // hangs a clause of purpose off the citation. Each language connects one its own way, which is
    // the point of composing it: English the bare infinitive, German the extraposed "um … zu". The
    // pronoun stands for the content (C20), so German genders it off *Inhalt*, a masculine: "ihn".
    await app.setSubject('CAT');
    await app.verbInput.fill('save');
    const saveEn = page.locator('[data-testid="typeahead-option"][data-concept="SAVE"]');
    await expect(saveEn).toBeVisible();
    await saveEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to write content to load it');

    await app.setUiLanguage('de');
    await app.verbInput.fill('save');
    const saveDe = page.locator('[data-testid="typeahead-option"][data-concept="SAVE"]');
    await expect(saveDe).toBeVisible();
    await saveDe.hover();
    await expect(page.locator(tooltip)).toHaveText('Inhalt schreiben, um ihn zu laden');
  });

  test('a pronoun genders itself off its antecedent (localization C20: SELECT)', async ({
    app,
    page,
  }) => {
    // SELECT is CHOOSE's genus with what the indicating is *for*. The purpose clause's object is a
    // pronoun standing for the object, and each language reads its gender off its own word: a thing
    // is "it" in English, but *Gegenstand* is masculine, so German says "ihn". "select" also finds
    // CHOOSE, whose synonym it is; the option is picked out by its concept.
    await app.setSubject('CAT');
    await app.verbInput.fill('select');
    const selectEn = page.locator('[data-testid="typeahead-option"][data-concept="SELECT"]');
    await expect(selectEn).toBeVisible();
    await selectEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to indicate an object to use it');

    await app.setUiLanguage('de');
    await app.verbInput.fill('select');
    const selectDe = page.locator('[data-testid="typeahead-option"][data-concept="SELECT"]');
    await expect(selectDe).toBeVisible();
    await selectDe.hover();
    await expect(page.locator(tooltip)).toHaveText('einen Gegenstand bezeichnen, um ihn zu verwenden');
  });

  test('a comitative carries it for ADD (localization C19)', async ({ app, page }) => {
    // "with other objects" is the companion, not the means — the comitative complement C12 built.
    // French takes the partitive after the preposition, which a bare plural would have lost.
    await app.setSubject('CAT');
    await app.verbInput.fill('add');
    const addEn = page.locator('[data-testid="typeahead-option"][data-concept="ADD"]');
    await expect(addEn).toBeVisible();
    await addEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to cause an object to be with other objects');

    await app.setUiLanguage('fr');
    await app.verbInput.fill('add');
    const addFr = page.locator('[data-testid="typeahead-option"][data-concept="ADD"]');
    await expect(addFr).toBeVisible();
    await addFr.hover();
    await expect(page.locator(tooltip)).toHaveText("induire un objet à être avec d'autres objets");
  });

  test('a passive with an essive complement glosses SEEM (localization A16)', async ({ app, page }) => {
    // The passive of PERCEIVE drops its promoted subject in the citation, and the essive takes the
    // object *as* something without making it one. German says the essive with "als", bare.
    await app.setSubject('CAT');
    await app.verbInput.fill('seem');
    const seemEn = page.locator('[data-testid="typeahead-option"][data-concept="SEEM"]');
    await expect(seemEn).toBeVisible();
    await seemEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to be perceived as an object');

    await app.setUiLanguage('de');
    await app.verbInput.fill('seem');
    const seemDe = page.locator('[data-testid="typeahead-option"][data-concept="SEEM"]');
    await expect(seemDe).toBeVisible();
    await seemDe.hover();
    await expect(page.locator(tooltip)).toHaveText('als Gegenstand empfunden werden');
  });

  test('a superlative tells one continent from the others (localization A17: ASIA)', async ({
    app,
    page,
  }) => {
    // A definite CONTINENT under BIG at degree `most`. German says the superlative in one inflected
    // word, umlaut included.
    await app.subjectInput.fill('asia');
    const asiaEn = page.locator('[data-testid="typeahead-option"][data-concept="ASIA"]');
    await expect(asiaEn).toBeVisible();
    await asiaEn.hover();
    await expect(page.locator(tooltip)).toHaveText('the biggest continent');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('asia');
    const asiaDe = page.locator('[data-testid="typeahead-option"][data-concept="ASIA"]');
    await expect(asiaDe).toBeVisible();
    await asiaDe.hover();
    await expect(page.locator(tooltip)).toHaveText('der größte Kontinent');
  });

  test('a clause is a phrase that has a subject (localization A18: CLAUSE)', async ({ app, page }) => {
    // The one grammar noun whose object is indefinite and singular. Japanese says the inanimate
    // HAVE with ある, not 持つ.
    await app.subjectInput.fill('clause');
    const clauseEn = page.locator('[data-testid="typeahead-option"][data-concept="CLAUSE"]');
    await expect(clauseEn).toBeVisible();
    await clauseEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a phrase that has a subject');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('clause');
    const clauseJa = page.locator('[data-testid="typeahead-option"][data-concept="CLAUSE"]');
    await expect(clauseJa).toBeVisible();
    await clauseJa.hover();
    await expect(page.locator(tooltip)).toHaveText('主語があるフレーズ');
  });

  test('a burning thing produces flames (localization B33: BURN)', async ({ app, page }) => {
    // PRODUCE's "give off" sense with FLAME. The verb picker matches "burn" for SET_ON_FIRE too, so
    // BURN is picked by its concept. Japanese 炎を出す does not contain 燃.
    await app.setSubject('CAT');
    await app.verbInput.fill('burn');
    const burnEn = page.locator('[data-testid="typeahead-option"][data-concept="BURN"]');
    await expect(burnEn).toBeVisible();
    await burnEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to produce flames');

    await app.setUiLanguage('ja');
    await app.verbInput.fill('burn');
    const burnJa = page.locator('[data-testid="typeahead-option"][data-concept="BURN"]');
    await expect(burnJa).toBeVisible();
    await burnJa.hover();
    await expect(page.locator(tooltip)).toHaveText('炎を出す');
  });

  test('a language is glossed by its country (localization B36: ITALIAN)', async ({ app, page }) => {
    // The definite LANGUAGE with the country as its genitive possessor. English takes the Saxon
    // genitive; German declines the bare name, "Italiens".
    await app.subjectInput.fill('italian');
    const italianEn = page.locator('[data-testid="typeahead-option"][data-concept="ITALIAN"]');
    await expect(italianEn).toBeVisible();
    await italianEn.hover();
    await expect(page.locator(tooltip)).toHaveText("Italy's language");

    await app.setUiLanguage('de');
    await app.subjectInput.fill('italian');
    const italianDe = page.locator('[data-testid="typeahead-option"][data-concept="ITALIAN"]');
    await expect(italianDe).toBeVisible();
    await italianDe.hover();
    await expect(page.locator(tooltip)).toHaveText('die Sprache Italiens');
  });

  test('a motion complement is glossed by the place it reaches (localization B37: DIRECTION)', async ({
    app,
    page,
  }) => {
    // As INSTRUMENTAL and LOCATIVE: composed on COMPLEMENT_GRAMMAR with INDICATE, the differentia a
    // noun of its own — the destination, where LOCATIVE takes "places". Japanese 目的地を示す補語.
    await app.subjectInput.fill('direction');
    const directionEn = page.locator('[data-testid="typeahead-option"][data-concept="DIRECTION"]');
    await expect(directionEn).toBeVisible();
    await directionEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a complement that indicates destinations');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('direction');
    const directionJa = page.locator('[data-testid="typeahead-option"][data-concept="DIRECTION"]');
    await expect(directionJa).toBeVisible();
    await directionJa.hover();
    await expect(page.locator(tooltip)).toHaveText('目的地を示す補語');
  });

  test('a conjunction is a word that links clauses (localization B38: CONJUNCTION)', async ({
    app,
    page,
  }) => {
    // LINK, not COORDINATE, whose Japanese 調整する is to adjust: つなぐ.
    await app.subjectInput.fill('conjunction');
    const conjunctionEn = page.locator('[data-testid="typeahead-option"][data-concept="CONJUNCTION"]');
    await expect(conjunctionEn).toBeVisible();
    await conjunctionEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a word that links clauses');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('conjunction');
    const conjunctionJa = page.locator('[data-testid="typeahead-option"][data-concept="CONJUNCTION"]');
    await expect(conjunctionJa).toBeVisible();
    await conjunctionJa.hover();
    await expect(page.locator(tooltip)).toHaveText('節をつなぐ単語');
  });

  test('a quantifier indicates quantities (localization B39: QUANTIFIER)', async ({ app, page }) => {
    // The plural object on purpose: French would put a bare singular mass object in the partitive,
    // "de la quantité".
    await app.subjectInput.fill('quantifier');
    const quantifierEn = page.locator('[data-testid="typeahead-option"][data-concept="QUANTIFIER"]');
    await expect(quantifierEn).toBeVisible();
    await quantifierEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a determiner that indicates quantities');

    await app.setUiLanguage('fr');
    await app.subjectInput.fill('quantifier');
    const quantifierFr = page.locator('[data-testid="typeahead-option"][data-concept="QUANTIFIER"]');
    await expect(quantifierFr).toBeVisible();
    await quantifierFr.hover();
    await expect(page.locator(tooltip)).toHaveText('un déterminant qui indique des quantités');
  });

  test('the climate senses tell two continents apart (localization B48: ANTARCTICA, AFRICA)', async ({
    app,
    page,
  }) => {
    // A17's superlative on COLD_CLIMATE and HOT_CLIMATE: Japanese 寒い / 暑い, the cold and heat of a
    // place, where COLD and HOT are 冷たい / 熱い to the touch; Spanish caluroso where HOT is caliente.
    await app.subjectInput.fill('antarctica');
    const antarcticaEn = page.locator('[data-testid="typeahead-option"][data-concept="ANTARCTICA"]');
    await expect(antarcticaEn).toBeVisible();
    await antarcticaEn.hover();
    await expect(page.locator(tooltip)).toHaveText('the coldest continent');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('antarctica');
    const antarcticaJa = page.locator('[data-testid="typeahead-option"][data-concept="ANTARCTICA"]');
    await expect(antarcticaJa).toBeVisible();
    await antarcticaJa.hover();
    await expect(page.locator(tooltip)).toHaveText('最も寒い大陸');

    await app.setUiLanguage('es');
    await app.subjectInput.fill('africa');
    const africaEs = page.locator('[data-testid="typeahead-option"][data-concept="AFRICA"]');
    await expect(africaEs).toBeVisible();
    await africaEs.hover();
    await expect(page.locator(tooltip)).toHaveText('el continente más caluroso');
  });

  test('the agent is a participant that acts (localization B49: AGENT_GRAMMAR)', async ({ app, page }) => {
    // Composed on its new genus, PARTICIPANT_GRAMMAR: German Partizipant, the grammar's word, where
    // Teilnehmer is an attendee.
    await app.subjectInput.fill('agent');
    const agentEn = page.locator('[data-testid="typeahead-option"][data-concept="AGENT_GRAMMAR"]');
    await expect(agentEn).toBeVisible();
    await agentEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a participant that acts');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('agent');
    const agentDe = page.locator('[data-testid="typeahead-option"][data-concept="AGENT_GRAMMAR"]');
    await expect(agentDe).toBeVisible();
    await agentDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Partizipant, der handelt');
  });

  test('a hypernym is a word whose meaning includes another\'s (localization B50: HYPERNYM)', async ({
    app,
    page,
  }) => {
    // C12's genitive relative, headed on the possessor: German "dessen", and the inseparable umfassen
    // closes the clause as one word.
    await app.subjectInput.fill('hypernym');
    const hypernymEn = page.locator('[data-testid="typeahead-option"][data-concept="HYPERNYM"]');
    await expect(hypernymEn).toBeVisible();
    await hypernymEn.hover();
    await expect(page.locator(tooltip)).toHaveText("a word whose meaning includes another word's meaning");

    await app.setUiLanguage('de');
    await app.subjectInput.fill('hypernym');
    const hypernymDe = page.locator('[data-testid="typeahead-option"][data-concept="HYPERNYM"]');
    await expect(hypernymDe).toBeVisible();
    await hypernymDe.hover();
    await expect(page.locator(tooltip)).toHaveText(
      'ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst',
    );
  });

  test('a determiner is a word that specifies nouns (localization B51: DETERMINER)', async ({
    app,
    page,
  }) => {
    // SPECIFY, not INDICATE: German bestimmen is the grammar's own verb (the bestimmter Artikel).
    await app.subjectInput.fill('determiner');
    const determinerEn = page.locator('[data-testid="typeahead-option"][data-concept="DETERMINER"]');
    await expect(determinerEn).toBeVisible();
    await determinerEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a word that specifies nouns');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('determiner');
    const determinerDe = page.locator('[data-testid="typeahead-option"][data-concept="DETERMINER"]');
    await expect(determinerDe).toBeVisible();
    await determinerDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Wort, das Substantive bestimmt');
  });

  test('a place complement is glossed on its genus (localization A18: LOCATIVE)', async ({
    app,
    page,
  }) => {
    // As INSTRUMENTAL: composed on COMPLEMENT_GRAMMAR, with INDICATE, which German says as
    // "bezeichnet".
    await app.subjectInput.fill('locative');
    const locativeEn = page.locator('[data-testid="typeahead-option"][data-concept="LOCATIVE"]');
    await expect(locativeEn).toBeVisible();
    await locativeEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a complement that indicates places');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('locative');
    const locativeDe = page.locator('[data-testid="typeahead-option"][data-concept="LOCATIVE"]');
    await expect(locativeDe).toBeVisible();
    await locativeDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine Ergänzung, die Orte bezeichnet');
  });
  // ── The sweep of 2026-09-22 (A23–A30, B52–B58) ──────────────────────
  // One row per ticket, each in English and in the language whose grammar the ticket turns on.

  test('a UI noun is what one presses, or where one works (localization A23: BUTTON, CANVAS)', async ({
    app,
    page,
  }) => {
    // The object gap, whose German relative pronoun is accusative — "den man drückt".
    await app.subjectInput.fill('button');
    const buttonEn = page.locator('[data-testid="typeahead-option"][data-concept="BUTTON"]');
    await expect(buttonEn).toBeVisible();
    await buttonEn.hover();
    await expect(page.locator(tooltip)).toHaveText('an object that one presses');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('button');
    const buttonDe = page.locator('[data-testid="typeahead-option"][data-concept="BUTTON"]');
    await expect(buttonDe).toBeVisible();
    await buttonDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Gegenstand, den man drückt');

    // The locative gap C07 built, whose French relative adverb takes the euphonic "l'on".
    await app.setUiLanguage('fr');
    await app.subjectInput.fill('canvas');
    const canvasFr = page.locator('[data-testid="typeahead-option"][data-concept="CANVAS"]');
    await expect(canvasFr).toBeVisible();
    await canvasFr.hover();
    await expect(page.locator(tooltip)).toHaveText("un lieu où l'on fait des phrases");
  });

  test('a UI verb is its genus plus its object (localization A24: DELETE, ACQUIRE)', async ({
    app,
    page,
  }) => {
    // The bare-plural object precedes the clause-final German infinitive.
    await app.setSubject('CAT');
    await app.verbInput.fill('delete');
    const deleteEn = page.locator('[data-testid="typeahead-option"][data-concept="DELETE"]');
    await expect(deleteEn).toBeVisible();
    await deleteEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to remove objects');

    await app.setUiLanguage('de');
    await app.verbInput.fill('delete');
    const deleteDe = page.locator('[data-testid="typeahead-option"][data-concept="DELETE"]');
    await expect(deleteDe).toBeVisible();
    await deleteDe.hover();
    await expect(page.locator(tooltip)).toHaveText('Gegenstände entfernen');

    // The governed infinitive, which Italian links with "ad" before a vowel.
    await app.setUiLanguage('it');
    await app.verbInput.fill('acquire');
    const acquireIt = page.locator('[data-testid="typeahead-option"][data-concept="ACQUIRE"]');
    await expect(acquireIt).toBeVisible();
    await acquireIt.hover();
    await expect(page.locator(tooltip)).toHaveText('iniziare ad avere');
  });

  test('a negated causative puts the nicht inside its infinitive (localization A25: TURN_OFF)', async ({
    app,
    page,
  }) => {
    await app.setSubject('CAT');
    await app.verbInput.fill('turn off');
    const turnOffEn = page.locator('[data-testid="typeahead-option"][data-concept="TURN_OFF"]');
    await expect(turnOffEn).toBeVisible();
    await turnOffEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to cause an object not to be active');

    // The negation sits in the governed clause, not on the causative verb.
    await app.setUiLanguage('de');
    await app.verbInput.fill('turn off');
    const turnOffDe = page.locator('[data-testid="typeahead-option"][data-concept="TURN_OFF"]');
    await expect(turnOffDe).toBeVisible();
    await turnOffDe.hover();
    await expect(page.locator(tooltip)).toHaveText(
      'einen Gegenstand veranlassen, nicht aktiv zu sein',
    );
  });

  test('a mass head takes the bare determiner (localization A26: WATER)', async ({ app, page }) => {
    // "liquid", not "a liquid": indefinite would count what cannot be counted.
    await app.subjectInput.fill('water');
    const waterEn = page.locator('[data-testid="typeahead-option"][data-concept="WATER"]');
    await expect(waterEn).toBeVisible();
    await waterEn.hover();
    await expect(page.locator(tooltip)).toHaveText('liquid that one drinks');

    // French writes no partitive on a relativised mass head either — "liquide qu'on boit".
    await app.setUiLanguage('fr');
    await app.subjectInput.fill('water');
    const waterFr = page.locator('[data-testid="typeahead-option"][data-concept="WATER"]');
    await expect(waterFr).toBeVisible();
    await waterFr.hover();
    await expect(page.locator(tooltip)).toHaveText("liquide qu'on boit");
  });

  test('a subject governs its verb, an object is governed (localization A27: SUBJECT_GRAMMAR)', async ({
    app,
    page,
  }) => {
    await app.subjectInput.fill('subject');
    const subjectEn = page.locator('[data-testid="typeahead-option"][data-concept="SUBJECT_GRAMMAR"]');
    await expect(subjectEn).toBeVisible();
    await subjectEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a participant that governs verbs');

    // German shows the difference from OBJECT_GRAMMAR on the relative pronoun: der, not den.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('subject');
    const subjectDe = page.locator('[data-testid="typeahead-option"][data-concept="SUBJECT_GRAMMAR"]');
    await expect(subjectDe).toBeVisible();
    await subjectDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Partizipant, der Verben regiert');
  });

  test('a scalar adjective takes the low pole of its scale (localization A28: SMALL)', async ({
    app,
    page,
  }) => {
    // BIG ships "of great size"; SMALL is the same dimension at LOW. Glossing it with SMALL itself
    // would be circular in all seven, not only in English.
    await app.setSubject('CAT');
    await app.openSubjectAdjective('small');
    const smallEn = page.locator('[data-testid="typeahead-option"][data-concept="SMALL"]');
    await expect(smallEn).toBeVisible();
    await smallEn.hover();
    await expect(page.locator(tooltip)).toHaveText('of low size');

    await app.setUiLanguage('fr');
    await app.openSubjectAdjective('small');
    const smallFr = page.locator('[data-testid="typeahead-option"][data-concept="SMALL"]');
    await expect(smallFr).toBeVisible();
    await smallFr.hover();
    await expect(page.locator(tooltip)).toHaveText('de taille basse');
  });

  test('a time adverb names its own time deictically (localization A29: NOW)', async ({
    app,
    page,
  }) => {
    // The first deixis in a definition: "at this time", not "at the time".
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('now');
    const nowEn = page.locator('[data-testid="typeahead-option"][data-concept="NOW"]');
    await expect(nowEn).toBeVisible();
    await nowEn.hover();
    await expect(page.locator(tooltip)).toHaveText('at this time');

    // The German demonstrative inflects for the dative the `measure` relation governs.
    await app.setUiLanguage('de');
    await app.openVerbAdverb('now');
    const nowDe = page.locator('[data-testid="typeahead-option"][data-concept="NOW"]');
    await expect(nowDe).toBeVisible();
    await nowDe.hover();
    await expect(page.locator(tooltip)).toHaveText('zu dieser Zeit');
  });

  test('a grammar feature is what it indicates (localization A30: TENSE, GENDER)', async ({
    app,
    page,
  }) => {
    await app.subjectInput.fill('tense');
    const tenseEn = page.locator('[data-testid="typeahead-option"][data-concept="TENSE"]');
    await expect(tenseEn).toBeVisible();
    await tenseEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a feature that indicates times');

    // The bare-plural object sits before the clause-final verb.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('tense');
    const tenseDe = page.locator('[data-testid="typeahead-option"][data-concept="TENSE"]');
    await expect(tenseDe).toBeVisible();
    await tenseDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Merkmal, das Zeiten bezeichnet');

    // Japanese puts the whole clause in front of the head.
    await app.setUiLanguage('ja');
    await app.subjectInput.fill('gender');
    const genderJa = page.locator('[data-testid="typeahead-option"][data-concept="GENDER"]');
    await expect(genderJa).toBeVisible();
    await genderJa.hover();
    await expect(page.locator(tooltip)).toHaveText('単語を支配する範疇');
  });

  test('a natural kind hangs under its seeded genus (localization B52: MAMMAL, ICE_CREAM)', async ({
    app,
    page,
  }) => {
    // A mass object stays singular under the bare determiner: milk, not "milks".
    await app.subjectInput.fill('mammal');
    const mammalEn = page.locator('[data-testid="typeahead-option"][data-concept="MAMMAL"]');
    await expect(mammalEn).toBeVisible();
    await mammalEn.hover();
    await expect(page.locator(tooltip)).toHaveText('an animal that produces milk');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('mammal');
    const mammalDe = page.locator('[data-testid="typeahead-option"][data-concept="MAMMAL"]');
    await expect(mammalDe).toBeVisible();
    await mammalDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Tier, das Milch erzeugt');

    // Two stacked adjectives, which Spanish coordinates with "y".
    await app.setUiLanguage('es');
    await app.subjectInput.fill('ice cream');
    const iceCreamEs = page.locator('[data-testid="typeahead-option"][data-concept="ICE_CREAM"]');
    await expect(iceCreamEs).toBeVisible();
    await iceCreamEs.hover();
    await expect(page.locator(tooltip)).toHaveText('comida fría y dulce');
  });

  test('a feeling is a state, and a wall encloses (localization B53: FEELING, WALL)', async ({
    app,
    page,
  }) => {
    // STATE is the parent C05 was missing: a feeling is a state one feels, not a concept.
    await app.subjectInput.fill('feeling');
    const feelingEn = page.locator('[data-testid="typeahead-option"][data-concept="FEELING"]');
    await expect(feelingEn).toBeVisible();
    await feelingEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a state that one feels');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('feeling');
    const feelingDe = page.locator('[data-testid="typeahead-option"][data-concept="FEELING"]');
    await expect(feelingDe).toBeVisible();
    await feelingDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Zustand, den man fühlt');

    // ENCLOSE, not CONFINE: a wall that jails its places is what the seeded verb would have said.
    await app.setUiLanguage('fr');
    await app.subjectInput.fill('wall');
    const wallFr = page.locator('[data-testid="typeahead-option"][data-concept="WALL"]');
    await expect(wallFr).toBeVisible();
    await wallFr.hover();
    await expect(page.locator(tooltip)).toHaveText('un objet qui entoure des lieux');
  });

  test('a quality adjective scales on its own dimension (localization B54: HAPPY, TIRED)', async ({
    app,
    page,
  }) => {
    await app.setSubject('CAT');
    await app.openSubjectAdjective('happy');
    const happyEn = page.locator('[data-testid="typeahead-option"][data-concept="HAPPY"]');
    await expect(happyEn).toBeVisible();
    await happyEn.hover();
    await expect(page.locator(tooltip)).toHaveText('of high joy');

    // The dative the German "von" relation governs.
    await app.setUiLanguage('de');
    await app.openSubjectAdjective('happy');
    const happyDe = page.locator('[data-testid="typeahead-option"][data-concept="HAPPY"]');
    await expect(happyDe).toBeVisible();
    await happyDe.hover();
    await expect(page.locator(tooltip)).toHaveText('von hoher Freude');

    // Japanese makes the dimension the topic.
    await app.setUiLanguage('ja');
    await app.openSubjectAdjective('tired');
    const tiredJa = page.locator('[data-testid="typeahead-option"][data-concept="TIRED"]');
    await expect(tiredJa).toBeVisible();
    await tiredJa.hover();
    await expect(page.locator(tooltip)).toHaveText('休息が低い');
  });

  test('the adverb A29 could not ship (localization B55: ALREADY)', async ({ app, page }) => {
    // AGAIN's shape with PREVIOUS in place of OTHER, and no new word for it.
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('already');
    const alreadyEn = page.locator('[data-testid="typeahead-option"][data-concept="ALREADY"]');
    await expect(alreadyEn).toBeVisible();
    await alreadyEn.hover();
    await expect(page.locator(tooltip)).toHaveText('at a previous time');

    await app.setUiLanguage('de');
    await app.openVerbAdverb('already');
    const alreadyDe = page.locator('[data-testid="typeahead-option"][data-concept="ALREADY"]');
    await expect(alreadyDe).toBeVisible();
    await alreadyDe.hover();
    await expect(page.locator(tooltip)).toHaveText('zu einer vorherigen Zeit');
  });

  test('a country is land a nation governs (localization B56: COUNTRY)', async ({ app, page }) => {
    // An object gap whose agent is named rather than generic, on a mass head.
    await app.subjectInput.fill('country');
    const countryEn = page.locator('[data-testid="typeahead-option"][data-concept="COUNTRY"]');
    await expect(countryEn).toBeVisible();
    await countryEn.hover();
    await expect(page.locator(tooltip)).toHaveText('land that a nation governs');

    await app.setUiLanguage('it');
    await app.subjectInput.fill('country');
    const countryIt = page.locator('[data-testid="typeahead-option"][data-concept="COUNTRY"]');
    await expect(countryIt).toBeVisible();
    await countryIt.hover();
    await expect(page.locator(tooltip)).toHaveText('terra che una nazione governa');
  });

  test('an interface noun stands on its new verb (localization B57: SPEAKER, TOOLBAR, MAP)', async ({
    app,
    page,
  }) => {
    // The plainest whoGloss, on SPEAK.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('speaker');
    const speakerIt = page.locator('[data-testid="typeahead-option"][data-concept="SPEAKER"]');
    await expect(speakerIt).toBeVisible();
    await speakerIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una persona che parla');

    // A head this ticket needed only the word of — ROW's own gloss came later (C26).
    await app.setUiLanguage('de');
    await app.subjectInput.fill('toolbar');
    const toolbarDe = page.locator('[data-testid="typeahead-option"][data-concept="TOOLBAR"]');
    await expect(toolbarDe).toBeVisible();
    await toolbarDe.hover();
    await expect(page.locator(tooltip)).toHaveText('eine Zeile, die Tasten hat');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('map');
    const mapJa = page.locator('[data-testid="typeahead-option"][data-concept="MAP"]');
    await expect(mapJa).toBeVisible();
    await mapJa.hover();
    await expect(page.locator(tooltip)).toHaveText('場所を見せる画像');
  });

  test('a tense and a number value take an ordinary adjective (localization B58)', async ({
    app,
    page,
  }) => {
    // The strong adjective ending after the German indefinite article.
    await app.subjectInput.fill('past');
    const pastEn = page.locator('[data-testid="typeahead-option"][data-concept="PAST_TENSE"]');
    await expect(pastEn).toBeVisible();
    await pastEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a past tense');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('past');
    const pastDe = page.locator('[data-testid="typeahead-option"][data-concept="PAST_TENSE"]');
    await expect(pastDe).toBeVisible();
    await pastDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein vergangenes Tempus');

    // MANIFOLD, not PLURAL: "a plural category" would define the word with itself.
    await app.setUiLanguage('ja');
    await app.subjectInput.fill('plural');
    const pluralJa = page.locator('[data-testid="typeahead-option"][data-concept="PLURAL_GRAMMAR"]');
    await expect(pluralJa).toBeVisible();
    await pluralJa.hover();
    await expect(page.locator(tooltip)).toHaveText('複数の範疇');
  });

  test('a place adverb is the complement it stands for (localization C25: EVERYWHERE, UP)', async ({
    app,
    page,
  }) => {
    // The verbless fragment is rendered as a locative complement, exactly as "eats in all places".
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('everywhere');
    const everywhereEn = page.locator('[data-testid="typeahead-option"][data-concept="EVERYWHERE"]');
    await expect(everywhereEn).toBeVisible();
    await everywhereEn.hover();
    await expect(page.locator(tooltip)).toHaveText('in all places');

    // A direction is the plain goal, and German's "zu" governs the dative of the compared adjective.
    await app.setUiLanguage('de');
    await app.openVerbAdverb('up');
    const upDe = page.locator('[data-testid="typeahead-option"][data-concept="UP"]');
    await expect(upDe).toBeVisible();
    await upDe.hover();
    await expect(page.locator(tooltip)).toHaveText('zu einem höheren Ort');
  });

  test('a part names its whole, and an organ what one sees with (localization C26)', async ({
    app,
    page,
  }) => {
    // The part-whole possessor: English writes the whole as an of-phrase, not "a keyboard's part".
    await app.subjectInput.fill('key');
    const keyEn = page.locator('[data-testid="typeahead-option"][data-concept="KEY"]');
    await expect(keyEn).toBeVisible();
    await keyEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a part of a keyboard');

    // The same relation read from the whole: the canvases are what the group is made of.
    await app.subjectInput.fill('workspace');
    const workspaceEn = page.locator('[data-testid="typeahead-option"][data-concept="WORKSPACE"]');
    await expect(workspaceEn).toBeVisible();
    await workspaceEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a group of canvases');

    // The instrument gap: German's relativizer is the instrumental preposition's, mit dem.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('eye');
    const eyeDe = page.locator('[data-testid="typeahead-option"][data-concept="EYE"]');
    await expect(eyeDe).toBeVisible();
    await eyeDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Organ, mit dem man sieht');
  });

  test('a verb root takes a gloss on a shape that shipped after it (localization C28: FLY, OPEN)', async ({
    app,
    page,
  }) => {
    // FLY on the route complement its genus always licensed: "through the air".
    await app.setSubject('CAT');
    await app.verbInput.fill('fly');
    const flyEn = page.locator('[data-testid="typeahead-option"][data-concept="FLY"]');
    await expect(flyEn).toBeVisible();
    await flyEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to move through the air');

    await app.setUiLanguage('de');
    await app.verbInput.fill('fly');
    const flyDe = page.locator('[data-testid="typeahead-option"][data-concept="FLY"]');
    await expect(flyDe).toBeVisible();
    await flyDe.hover();
    await expect(page.locator(tooltip)).toHaveText('sich durch die Luft bewegen');

    // OPEN denies the state CLOSE leaves, the adjective seeded for it; Japanese turns 閉じた into
    // 閉じていない inside the causative's ように clause.
    await app.setUiLanguage('en');
    await app.verbInput.fill('open');
    const openEn = page.locator('[data-testid="typeahead-option"][data-concept="OPEN"]');
    await expect(openEn).toBeVisible();
    await openEn.hover();
    await expect(page.locator(tooltip)).toHaveText('to cause an object not to be closed');

    await app.setUiLanguage('ja');
    await app.verbInput.fill('open');
    const openJa = page.locator('[data-testid="typeahead-option"][data-concept="OPEN"]');
    await expect(openJa).toBeVisible();
    await openJa.hover();
    await expect(page.locator(tooltip)).toHaveText('物体が閉じていないようにする');
  });

  test('a state adjective is the relative clause it stands for (localization C23: SAVED, EMPTY)', async ({
    app,
    page,
  }) => {
    // The headless relative: the state saving leaves, the object gap's generic "one".
    await app.setSubject('CAT');
    await app.openSubjectAdjective('saved');
    const savedEn = page.locator('[data-testid="typeahead-option"][data-concept="SAVED"]');
    await expect(savedEn).toBeVisible();
    await savedEn.hover();
    await expect(page.locator(tooltip)).toHaveText('that one has saved');

    // The unspoken antecedent, Gegenstand, still gives the relative pronoun its gender and case.
    await app.setUiLanguage('de');
    await app.openSubjectAdjective('saved');
    const savedDe = page.locator('[data-testid="typeahead-option"][data-concept="SAVED"]');
    await expect(savedDe).toBeVisible();
    await savedDe.hover();
    await expect(page.locator(tooltip)).toHaveText('den man gespeichert hat');

    // A subject gap: what the thing does not have. Japanese says the relative before its absent head.
    await app.setUiLanguage('ja');
    await app.openSubjectAdjective('empty');
    const emptyJa = page.locator('[data-testid="typeahead-option"][data-concept="EMPTY"]');
    await expect(emptyJa).toBeVisible();
    await emptyJa.hover();
    await expect(page.locator(tooltip)).toHaveText('内容がない');
  });

  test('a relational adjective is the clause it stands for (localization C24: WILD, ROUND)', async ({
    app,
    page,
  }) => {
    // The headless relative: the antecedent is unspoken, the passive state is the gloss.
    await app.setSubject('CAT');
    await app.openSubjectAdjective('wild');
    const wildEn = page.locator('[data-testid="typeahead-option"][data-concept="WILD"]');
    await expect(wildEn).toBeVisible();
    await wildEn.hover();
    await expect(page.locator(tooltip)).toHaveText('that has not been tamed');

    // German's relative pronoun takes the unspoken antecedent's gender: BEING's Wesen is neuter.
    await app.setUiLanguage('de');
    await app.openSubjectAdjective('wild');
    const wildDe = page.locator('[data-testid="typeahead-option"][data-concept="WILD"]');
    await expect(wildDe).toBeVisible();
    await wildDe.hover();
    await expect(page.locator(tooltip)).toHaveText('das nicht gezähmt worden ist');

    // The genitive relative, on OBJECT_THING's masculine Gegenstand.
    await app.openSubjectAdjective('round');
    const roundDe = page.locator('[data-testid="typeahead-option"][data-concept="ROUND"]');
    await expect(roundDe).toBeVisible();
    await roundDe.hover();
    await expect(page.locator(tooltip)).toHaveText('dessen Form ein Kreis ist');
  });

  test('a grammar feature is what it does, said as its clause alone (localization C24, C27: MOOD, PASSIVE)', async ({
    app,
    page,
  }) => {
    // C27's MOOD, a noun, keeps its head: the speaker's purpose, a genitive inside the relative.
    await app.subjectInput.fill('mood');
    const moodEn = page.locator('[data-testid="typeahead-option"][data-concept="MOOD"]');
    await expect(moodEn).toBeVisible();
    await moodEn.hover();
    await expect(page.locator(tooltip)).toHaveText("a feature that indicates the speaker's purpose");

    // An adjective is glossed as its relative clause alone, on an unspoken CLAUSE — not "a clause
    // that…" — and the essive object complement says what the passive promotes.
    await app.setSubject('CAT');
    await app.openSubjectAdjective('passive');
    const passiveEn = page.locator('[data-testid="typeahead-option"][data-concept="PASSIVE"]');
    await expect(passiveEn).toBeVisible();
    await passiveEn.hover();
    await expect(page.locator(tooltip)).toHaveText('that uses the direct object as the subject');

    // German's relative pronoun takes the gender of the antecedent no one sees: Satz, masculine.
    await app.setUiLanguage('de');
    await app.openSubjectAdjective('passive');
    const passiveDe = page.locator('[data-testid="typeahead-option"][data-concept="PASSIVE"]');
    await expect(passiveDe).toBeVisible();
    await passiveDe.hover();
    await expect(page.locator(tooltip)).toHaveText('der das direkte Objekt als Subjekt verwendet');
  });

  test('an ordinal is what it follows, a condition what another clause depends on (localization C24: SECOND, CONDITIONAL)', async ({
    app,
    page,
  }) => {
    // FOLLOW takes an object now: SECOND is what follows the first.
    await app.setSubject('CAT');
    await app.openSubjectAdjective('second');
    const secondEn = page.locator('[data-testid="typeahead-option"][data-concept="SECOND"]');
    await expect(secondEn).toBeVisible();
    await secondEn.hover();
    await expect(page.locator(tooltip)).toHaveText('that follows the first object');

    // English pied-pipes DEPEND's preposition, where German relativises on its dative.
    await app.openSubjectAdjective('conditional');
    const conditionalEn = page.locator('[data-testid="typeahead-option"][data-concept="CONDITIONAL"]');
    await expect(conditionalEn).toBeVisible();
    await conditionalEn.hover();
    await expect(page.locator(tooltip)).toHaveText('on which another clause depends');

    await app.setUiLanguage('de');
    await app.openSubjectAdjective('konditional');
    const conditionalDe = page.locator('[data-testid="typeahead-option"][data-concept="CONDITIONAL"]');
    await expect(conditionalDe).toBeVisible();
    await conditionalDe.hover();
    await expect(page.locator(tooltip)).toHaveText('von dem ein anderer Satz abhängt');
  });

  // SUFFER, seeded for a denied cause ("soffro non a causa tua"), glossed as LOVE's counterpart under
  // the same genus.
  test('a verb definition renders (localization A31: SUFFER)', async ({ app, page }) => {
    const option = page.locator('[data-testid="typeahead-option"][data-concept="SUFFER"]');
    await app.setSubject('CAT');

    await app.verbInput.fill('suffer');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('to feel sorrow');

    await app.setUiLanguage('it');
    await app.verbInput.fill('suffer');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('provare tristezza');
  });

  // B60's saying verbs. TELL is SAY, seeded in the same ticket, with an addressee: German hoists the
  // animate dative ahead of the object.
  test('a ditransitive gloss on a genus seeded beside it (localization B60: TELL)', async ({ app, page }) => {
    const option = page.locator('[data-testid="typeahead-option"][data-concept="TELL"]');
    await app.setSubject('CAT');

    await app.verbInput.fill('tell');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('to say facts to a person');

    await app.setUiLanguage('de');
    await app.verbInput.fill('tell');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('einer Person Tatsachen sagen');
  });

  // QUESTION is glossed on ASK, not ASK on QUESTION: the instrument gap, Spanish "con la que".
  test('a noun glossed on the instrument gap of its verb (localization B60: QUESTION)', async ({ app, page }) => {
    const option = page.locator('[data-testid="typeahead-option"][data-concept="QUESTION"]');

    await app.subjectInput.fill('question');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('a phrase with which one asks');

    await app.setUiLanguage('es');
    await app.subjectInput.fill('question');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('una frase con la que se pregunta');
  });

  // CALL_PHONE, found by its synonym: a comitative inside a purpose clause, which keeps the telephone
  // out of the instrumental. Japanese puts the purpose first.
  test('a comitative inside a purpose clause (localization B60: CALL_PHONE)', async ({ app, page }) => {
    const option = page.locator('[data-testid="typeahead-option"][data-concept="CALL_PHONE"]');
    await app.setSubject('CAT');

    await app.verbInput.fill('phone');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('to use a telephone to speak with a person');

    await app.setUiLanguage('ja');
    await app.verbInput.fill('phone');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('人と話すために電話を使う');
  });

  test('an everyday noun, the root and the organ (localization B65: THING, PROGRAM_SHOW, HAND)', async ({
    app,
    page,
  }) => {
    // The first noun definition whose whole phrase is a coordinated group; Japanese says "or" with か.
    await app.subjectInput.fill('thing');
    const thingEn = page.locator('[data-testid="typeahead-option"][data-concept="THING"]');
    await expect(thingEn).toBeVisible();
    await thingEn.hover();
    await expect(page.locator(tooltip)).toHaveText('an object or a concept');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('thing');
    const thingJa = page.locator('[data-testid="typeahead-option"][data-concept="THING"]');
    await expect(thingJa).toBeVisible();
    await thingJa.hover();
    await expect(page.locator(tooltip)).toHaveText('物体か概念');

    // The program German and French have a word of their own for, on the separable ausstrahlen,
    // whole again in the relative clause.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('program');
    const showDe = page.locator('[data-testid="typeahead-option"][data-concept="PROGRAM_SHOW"]');
    await expect(showDe).toBeVisible();
    await showDe.hover();
    await expect(page.locator(tooltip)).toHaveText('Inhalt, den man ausstrahlt');

    await app.setUiLanguage('fr');
    await app.subjectInput.fill('program');
    const showFr = page.locator('[data-testid="typeahead-option"][data-concept="PROGRAM_SHOW"]');
    await expect(showFr).toBeVisible();
    await showFr.hover();
    await expect(page.locator(tooltip)).toHaveText("contenu qu'on diffuse");

    // The instrument gap with an object, on TAKE. Each search follows a language switch, which
    // closes the last tooltip: German "hand" also finds Handlung, whose tooltip would linger.
    await app.setUiLanguage('pt');
    await app.subjectInput.fill('hand');
    const handPt = page.locator('[data-testid="typeahead-option"][data-concept="HAND"]');
    await expect(handPt).toBeVisible();
    await handPt.hover();
    await expect(page.locator(tooltip)).toHaveText('um órgão com o qual se pega um objeto');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('hand');
    const handDe = page.locator('[data-testid="typeahead-option"][data-concept="HAND"]');
    await expect(handDe).toBeVisible();
    await handDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Organ, mit dem man einen Gegenstand nimmt');
  });

  test('a member is a part of a group (localize-seed B75: MEMBER)', async ({ app, page }) => {
    // partOfGloss on the genus every collective hangs under; German's genitive is feminine.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('member');
    const memberDe = page.locator('[data-testid="typeahead-option"][data-concept="MEMBER"]');
    await expect(memberDe).toBeVisible();
    await memberDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Teil einer Gruppe');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('member');
    const memberJa = page.locator('[data-testid="typeahead-option"][data-concept="MEMBER"]');
    await expect(memberJa).toBeVisible();
    await memberJa.hover();
    await expect(page.locator(tooltip)).toHaveText('グループの部分');
  });

  test('a part-whole head carries a relative (localize-seed B79: FACE)', async ({ app, page }) => {
    // FACE stands on HEAD, B79's other word: the whole is a genitive, the relative follows it.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('face');
    const faceDe = page.locator('[data-testid="typeahead-option"][data-concept="FACE"]');
    await expect(faceDe).toBeVisible();
    await faceDe.hover();
    await expect(page.locator(tooltip)).toHaveText('der Teil eines Kopfes, der die Augen hat');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('face');
    const faceJa = page.locator('[data-testid="typeahead-option"][data-concept="FACE"]');
    await expect(faceJa).toBeVisible();
    await faceJa.hover();
    await expect(page.locator(tooltip)).toHaveText('目がある頭の部分');
  });

  test('a topic-gap relative (localize-seed B81: ISSUE)', async ({ app, page }) => {
    // The corpus's first gloss on a topic gap: German über + the relative, French dont.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('issue');
    const issueDe = page.locator('[data-testid="typeahead-option"][data-concept="ISSUE"]');
    await expect(issueDe).toBeVisible();
    await issueDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Problem, über das man spricht');

    await app.setUiLanguage('fr');
    await app.subjectInput.fill('issue');
    const issueFr = page.locator('[data-testid="typeahead-option"][data-concept="ISSUE"]');
    await expect(issueFr).toBeVisible();
    await issueFr.hover();
    await expect(page.locator(tooltip)).toHaveText('un problème dont on parle');
  });

  test('an institution stands on a verb it seeded, or on B65\'s SYSTEM (localization B64: SCHOOL, WORLD, STATE_NATION)', async ({
    app,
    page,
  }) => {
    // A locative-gap relative on LEARN: German's relativizer is in dem.
    await app.subjectInput.fill('school');
    const schoolEn = page.locator('[data-testid="typeahead-option"][data-concept="SCHOOL"]');
    await expect(schoolEn).toBeVisible();
    await schoolEn.hover();
    await expect(page.locator(tooltip)).toHaveText('a building where one learns');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('school');
    const schoolDe = page.locator('[data-testid="typeahead-option"][data-concept="SCHOOL"]');
    await expect(schoolDe).toBeVisible();
    await schoolDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Gebäude, in dem man lernt');

    // A definite head and an object under `all`.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('world');
    const worldIt = page.locator('[data-testid="typeahead-option"][data-concept="WORLD"]');
    await expect(worldIt).toBeVisible();
    await worldIt.hover();
    await expect(page.locator(tooltip)).toHaveText('il luogo che include tutti i paesi');

    await app.setUiLanguage('en');
    await app.subjectInput.fill('world');
    const worldEn = page.locator('[data-testid="typeahead-option"][data-concept="WORLD"]');
    await expect(worldEn).toBeVisible();
    await worldEn.hover();
    await expect(page.locator(tooltip)).toHaveText('the place that includes all countries');

    // The polity, glossed on SYSTEM, whose own gloss is B65's: one row pins both tickets.
    await app.setUiLanguage('fr');
    await app.subjectInput.fill('state');
    const stateFr = page.locator('[data-testid="typeahead-option"][data-concept="STATE_NATION"]');
    await expect(stateFr).toBeVisible();
    await stateFr.hover();
    await expect(page.locator(tooltip)).toHaveText('un système qui gouverne un pays');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('state');
    const stateJa = page.locator('[data-testid="typeahead-option"][data-concept="STATE_NATION"]');
    await expect(stateJa).toBeVisible();
    await stateJa.hover();
    await expect(page.locator(tooltip)).toHaveText('国を統治するシステム');
  });

  // B61: P09's handling and leaving verbs. The tooltip is what tells apart the words a picker shows
  // twice — the Japanese 見る of SEE and LOOK_AT, and the three English "leave" — and GET's Italian
  // source is the plain "da" A228's fix left it with.
  for (const [id, query, en, language, other] of [
    ['LOOK_AT', 'look', 'to direct the eyes to an object', 'ja', '物体へ目を向ける'],
    ['TURN', 'turn', 'to move around a point', 'de', 'sich um einen Punkt bewegen'],
    ['LEAVE_DEPART', 'leave', 'to begin to go', 'it', 'iniziare ad andare'],
    ['LEAVE_BEHIND', 'leave', 'to cause an object to stay', 'ja', '物体が残るようにする'],
    ['GET', 'get', 'to acquire objects from a person', 'it', 'acquisire oggetti da una persona'],
  ] as const) {
    test(`a verb definition renders (localization B61: ${id})`, async ({ app, page }) => {
      const option = page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);
      await app.setSubject('CAT');

      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(en);

      await app.setUiLanguage(language);
      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(other);
    });
  }

  // B62's two plays. German spielen and French jouer say both senses, so in those languages the
  // picker shows one word twice and only the gloss tells the game from the music.
  test('one verb, two senses, told apart by the gloss alone (localization B62: PLAY_GAME, PLAY_INSTRUMENT)', async ({
    app,
    page,
  }) => {
    const game = page.locator('[data-testid="typeahead-option"][data-concept="PLAY_GAME"]');
    const instrument = page.locator('[data-testid="typeahead-option"][data-concept="PLAY_INSTRUMENT"]');
    // Two rows, hovered one after the other: the first tooltip has to be let go of before the
    // second is read, or the locator matches both.
    const glossOf = async (option: Locator, gloss: string): Promise<void> => {
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(gloss);
      await page.mouse.move(0, 0);
      await expect(page.locator(tooltip)).toHaveCount(0);
    };
    await app.setSubject('CAT');

    await app.verbInput.fill('play');
    await glossOf(game, 'to act to feel joy');
    await glossOf(instrument, 'to produce sounds with an object');

    await app.setUiLanguage('de');
    await app.verbInput.fill('spielen');
    await glossOf(game, 'handeln, um Freude zu fühlen');
    await glossOf(instrument, 'Geräusche mit einem Gegenstand erzeugen');
  });

  // DO shares MAKE's Romance verb, so its tooltip is the one place the picker can tell them apart —
  // and it must not say fare / faire / hacer / fazer back at the reader (the B62 ruling).
  test('a verb whose gloss may not repeat its own lemma (localization B62: DO)', async ({ app, page }) => {
    const option = page.locator('[data-testid="typeahead-option"][data-concept="DO"]');
    await app.setSubject('CAT');

    await app.verbInput.fill('do');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('to cause an action to happen');

    await app.setUiLanguage('it');
    await app.verbInput.fill('fare');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText("indurre un'azione a succedere");
  });

  // NEED is the first multiword Romance lemma in the picker (avoir besoin), and its gloss is
  // governed by an infinitive — MUST's own "to be obliged to" frame.
  test('a multiword lemma and an infinitive-governed gloss (localization B62: NEED)', async ({ app, page }) => {
    const option = page.locator('[data-testid="typeahead-option"][data-concept="NEED"]');
    await app.setSubject('CAT');

    await app.verbInput.fill('need');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('to be obliged to have objects');

    await app.setUiLanguage('fr');
    await app.verbInput.fill('avoir besoin');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText("être obligé d'avoir des objets");
  });

  test('the two LASTs are FOLLOW read two ways (localization B66: LAST_FINAL, LAST_PREVIOUS)', async ({
    app,
    page,
  }) => {
    // Both are "last" in English, side by side in the picker, and their tooltips tell them apart:
    // what follows all the others, and the period this one follows.
    await app.setSubject('CAT');
    await app.openSubjectAdjective('last');
    const finalEn = page.locator('[data-testid="typeahead-option"][data-concept="LAST_FINAL"]');
    await expect(finalEn).toBeVisible();
    await finalEn.hover();
    await expect(page.locator(tooltip)).toHaveText('that follows all other objects');
    const previousEn = page.locator('[data-testid="typeahead-option"][data-concept="LAST_PREVIOUS"]');
    await expect(previousEn).toBeVisible();
    await previousEn.hover();
    // Both rows stand in the one list, with no new query between the hovers, so the first tooltip is
    // still fading out: match the one that says the second definition.
    await expect(page.locator(tooltip).filter({ hasText: 'that this period follows' })).toBeVisible();

    // Spanish FOLLOW takes a before its quantified object.
    await app.setUiLanguage('es');
    await app.openSubjectAdjective('last');
    const finalEs = page.locator('[data-testid="typeahead-option"][data-concept="LAST_FINAL"]');
    await expect(finalEs).toBeVisible();
    await finalEs.hover();
    await expect(page.locator(tooltip)).toHaveText('que sigue a todos los otros objetos');

    // German relativises on FOLLOW's auf, under the deictic dieser.
    await app.setUiLanguage('de');
    await app.openSubjectAdjective('last');
    const previousDe = page.locator('[data-testid="typeahead-option"][data-concept="LAST_PREVIOUS"]');
    await expect(previousDe).toBeVisible();
    await previousDe.hover();
    await expect(page.locator(tooltip)).toHaveText('auf den dieser Zeitraum folgt');
  });

  test('the correct RIGHT has no errors (localization B66: RIGHT_CORRECT)', async ({ app, page }) => {
    // It shares "right" with RIGHT_SIDE, which stays on the literal.
    await app.setSubject('CAT');
    await app.openSubjectAdjective('right');
    const correctEn = page.locator('[data-testid="typeahead-option"][data-concept="RIGHT_CORRECT"]');
    await expect(correctEn).toBeVisible();
    await correctEn.hover();
    await expect(page.locator(tooltip)).toHaveText('that does not have errors');

    // The plain negative of HAVE, with the existential ない.
    await app.setUiLanguage('ja');
    await app.openSubjectAdjective('right');
    const correctJa = page.locator('[data-testid="typeahead-option"][data-concept="RIGHT_CORRECT"]');
    await expect(correctJa).toBeVisible();
    await correctJa.hover();
    await expect(page.locator(tooltip)).toHaveText('誤りがない');
  });

  test('a dimension gloss on the new LENGTH (localization B87: LONG)', async ({ app, page }) => {
    // BIG's "of great size" on LENGTH, which B87 seeded for it.
    await app.setSubject('CAT');
    await app.setUiLanguage('de');
    await app.openSubjectAdjective('long');
    const longDe = page.locator('[data-testid="typeahead-option"][data-concept="LONG"]');
    await expect(longDe).toBeVisible();
    await longDe.hover();
    await expect(page.locator(tooltip)).toHaveText('von großer Länge');

    // French grand precedes its noun and agrees with the feminine longueur.
    await app.setUiLanguage('fr');
    await app.openSubjectAdjective('long');
    const longFr = page.locator('[data-testid="typeahead-option"][data-concept="LONG"]');
    await expect(longFr).toBeVisible();
    await longFr.hover();
    await expect(page.locator(tooltip)).toHaveText('de grande longueur');
  });

  test('SAME negated as a predicate (localization B87: DIFFERENT)', async ({ app, page }) => {
    // The predicate SAME keeps its article in Spanish; Japanese negates the の-less 同じ.
    await app.setSubject('CAT');
    await app.setUiLanguage('ja');
    await app.openSubjectAdjective('different');
    const differentJa = page.locator('[data-testid="typeahead-option"][data-concept="DIFFERENT"]');
    await expect(differentJa).toBeVisible();
    await differentJa.hover();
    await expect(page.locator(tooltip)).toHaveText('同じではない');

    await app.setUiLanguage('es');
    await app.openSubjectAdjective('different');
    const differentEs = page.locator('[data-testid="typeahead-option"][data-concept="DIFFERENT"]');
    await expect(differentEs).toBeVisible();
    await differentEs.hover();
    await expect(page.locator(tooltip)).toHaveText('que no es el mismo');
  });

  test('a many subject inside a locative relative (localization B78: CITY)', async ({ app, page }) => {
    // German relativises the place on an with the dative; Japanese fronts the clause, 多くの included.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('city');
    const cityDe = page.locator('[data-testid="typeahead-option"][data-concept="CITY"]');
    await expect(cityDe).toBeVisible();
    await cityDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein großer Ort, an dem viele Personen wohnen');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('city');
    const cityJa = page.locator('[data-testid="typeahead-option"][data-concept="CITY"]');
    await expect(cityJa).toBeVisible();
    await cityJa.hover();
    await expect(page.locator(tooltip)).toHaveText('多くの人が住む大きい場所');
  });

  test('a part-whole genitive carrying a relative (localization B78: DOOR)', async ({ app, page }) => {
    // French elides the relative's que before the generic on; Portuguese says it with the impersonal se.
    await app.setUiLanguage('fr');
    await app.subjectInput.fill('door');
    const doorFr = page.locator('[data-testid="typeahead-option"][data-concept="DOOR"]');
    await expect(doorFr).toBeVisible();
    await doorFr.hover();
    await expect(page.locator(tooltip)).toHaveText("une partie d'un mur qu'on ouvre");

    await app.setUiLanguage('pt');
    await app.subjectInput.fill('door');
    const doorPt = page.locator('[data-testid="typeahead-option"][data-concept="DOOR"]');
    await expect(doorPt).toBeVisible();
    await doorPt.hover();
    await expect(page.locator(tooltip)).toHaveText('uma parte de uma parede que se abre');
  });

  test('a place, a manner and a fact adverb (localization B67: HERE, ALSO, REALLY)', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('here');
    const hereEn = page.locator('[data-testid="typeahead-option"][data-concept="HERE"]');
    await expect(hereEn).toBeVisible();
    await hereEn.hover();
    await expect(page.locator(tooltip)).toHaveText('in this place');
    await app.openVerbAdverb('also');
    const alsoEn = page.locator('[data-testid="typeahead-option"][data-concept="ALSO"]');
    await expect(alsoEn).toBeVisible();
    await alsoEn.hover();
    await expect(page.locator(tooltip)).toHaveText('in the same way');
    await app.openVerbAdverb('really');
    const reallyEn = page.locator('[data-testid="typeahead-option"][data-concept="REALLY"]');
    await expect(reallyEn).toBeVisible();
    await reallyEn.hover();
    await expect(page.locator(tooltip)).toHaveText('in reality');

    // Japanese says the deictic determiner as a word, where its articles say nothing.
    await app.setUiLanguage('ja');
    await app.openVerbAdverb('here');
    const hereJa = page.locator('[data-testid="typeahead-option"][data-concept="HERE"]');
    await expect(hereJa).toBeVisible();
    await hereJa.hover();
    await expect(page.locator(tooltip)).toHaveText('この場所で');

    // SAME stands before the noun in French, and a countable bare singular after dans is en (A219).
    await app.setUiLanguage('fr');
    await app.openVerbAdverb('also');
    const alsoFr = page.locator('[data-testid="typeahead-option"][data-concept="ALSO"]');
    await expect(alsoFr).toBeVisible();
    await alsoFr.hover();
    await expect(page.locator(tooltip)).toHaveText('de la même manière');
    await app.openVerbAdverb('really');
    const reallyFr = page.locator('[data-testid="typeahead-option"][data-concept="REALLY"]');
    await expect(reallyFr).toBeVisible();
    await reallyFr.hover();
    await expect(page.locator(tooltip)).toHaveText('en réalité');
  });


  // NIGHT is FLAME's part-whole shape over a new adjective, DARK (localization B59). German pins the
  // -el declension DARK's seed had to build — "der dunkle Teil", not *der dunkele — and Japanese the
  // order that chose an adjective over a relative clause: 日の暗い部分, the dark part OF A DAY, where a
  // clause would have gone on the day (光がない日の部分).
  test('a part-whole definition with a new adjective (localization B59: NIGHT)', async ({
    app,
    page,
  }) => {
    const option = page.locator('[data-testid="typeahead-option"][data-concept="NIGHT"]');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('nacht');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('der dunkle Teil eines Tages');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('夜');
    await expect(option).toBeVisible();
    await option.hover();
    await expect(page.locator(tooltip)).toHaveText('日の暗い部分');
  });

  // MAY is C09's modal shape on a third adjective, ALLOWED (localization B63). In Italian it is CAN's
  // own verb: the modal picker lists "potere" twice, and only the tooltip tells the two apart.
  test('a permission modal shares its Romance lemma with CAN (localization B63: MAY)', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'EAT');
    await app.satellite('verbModal').click();
    const modalInput = page.getByTestId('box-verbModal').locator('input');
    const may = page.locator('[data-testid="typeahead-option"][data-concept="MAY"]');

    await modalInput.fill('may');
    await expect(may).toBeVisible();
    await may.hover();
    await expect(page.locator(tooltip)).toHaveText('to be allowed to act');

    // The picker is the `modal` flag's own list, so B63's other two are in it as well; their glosses
    // wait on a content clause (C30), so the tooltip is the English literal until then.
    await modalInput.fill('should');
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="SHOULD"]')).toBeVisible();
    await modalInput.fill('might');
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="MIGHT"]')).toBeVisible();

    await app.setUiLanguage('it');
    await modalInput.fill('potere');
    await expect(may).toBeVisible();
    // CAN is in the same list under the same word, told apart by its own gloss.
    const can = page.locator('[data-testid="typeahead-option"][data-concept="CAN"]');
    await expect(can).toBeVisible();
    await may.hover();
    await expect(page.locator(tooltip)).toHaveText('essere autorizzato ad agire');
    // Let the first tooltip go before reading the second, so only one is on the page.
    await page.mouse.move(0, 0);
    await expect(page.locator(tooltip)).toHaveCount(0);
    await can.hover();
    await expect(page.locator(tooltip)).toHaveText('essere capace di agire');
  });

  // The two modals B63 seeded and C30 glossed. Their meaning is a judgment about the **act**, so the
  // act is the gloss's subject — a content clause, which each language places its own way: English
  // and German extrapose it behind an expletive, Italian writes none and puts it in the present
  // subjunctive, and Japanese nominalizes it with こと and marks it が.
  test('an evaluative modal is glossed by a content clause (localization C30: SHOULD, MIGHT)', async ({
    app,
    page,
  }) => {
    await app.buildClause('CAT', 'EAT');
    await app.satellite('verbModal').click();
    const modalInput = page.getByTestId('box-verbModal').locator('input');
    const should = page.locator('[data-testid="typeahead-option"][data-concept="SHOULD"]');

    await modalInput.fill('should');
    await expect(should).toBeVisible();
    await should.hover();
    await expect(page.locator(tooltip)).toHaveText('it is right that one acts');

    await app.setUiLanguage('de');
    await modalInput.fill('sollen');
    await expect(should).toBeVisible();
    await should.hover();
    await expect(page.locator(tooltip)).toHaveText('es ist richtig, dass man handelt');

    // MIGHT is not CAN: Japanese says the act can come about (起こり得る), not that one is able to
    // act (可能), which is what the ticket was filed to keep apart.
    await app.setUiLanguage('ja');
    const might = page.locator('[data-testid="typeahead-option"][data-concept="MIGHT"]');
    await modalInput.fill('かもしれない');
    await expect(might).toBeVisible();
    await might.hover();
    await expect(page.locator(tooltip)).toHaveText('行動することが起こり得ます');
  });

  // C31's cardinal, in the one place a tooltip shows it: the calendar words are counted in smaller
  // ones, and Japanese writes the counter the noun chooses — 時間 is its own, so it is not said twice.
  test('a period counted in smaller ones (localization C31: DAY, YEAR)', async ({ app, page }) => {
    const day = page.locator('[data-testid="typeahead-option"][data-concept="DAY"]');

    await app.subjectInput.fill('day');
    await expect(day).toBeVisible();
    await day.hover();
    await expect(page.locator(tooltip)).toHaveText('a period of twenty-four hours');

    await app.setUiLanguage('ja');
    await app.subjectInput.fill('日');
    await expect(day).toBeVisible();
    await day.hover();
    await expect(page.locator(tooltip)).toHaveText('二十四時間の期間');

    await app.setUiLanguage('fr');
    const year = page.locator('[data-testid="typeahead-option"][data-concept="YEAR"]');
    await app.subjectInput.fill('année');
    await expect(year).toBeVisible();
    await year.hover();
    await expect(page.locator(tooltip)).toHaveText('une période de douze mois');
  });

  // The three verbs C34–C36 seeded, which are the new words a picker can actually reach: the other
  // eight name a slot no control offers yet (`Concept.slot`), so their glosses are pinned in the
  // engine suite rather than here.
  test('the verbs three constructs unlocked (localization C34, C35, C36)', async ({ app, page }) => {
    await app.setSubject('CAT');
    const like = page.locator('[data-testid="typeahead-option"][data-concept="LIKE"]');
    const let_ = page.locator('[data-testid="typeahead-option"][data-concept="LET"]');
    const help = page.locator('[data-testid="typeahead-option"][data-concept="HELP_VERB"]');

    // Between two hovers in one dropdown the pointer has to leave the list: refilling it lands
    // another row under the stationary pointer, whose tooltip then opens beside the outgoing one,
    // and an assertion on the bare locator fails on the two of them rather than waiting one out.
    const noTooltip = async () => {
      await page.mouse.move(0, 0);
      await expect(page.locator(tooltip)).toHaveCount(0);
    };

    await app.verbInput.fill('like');
    await expect(like).toBeVisible();
    await like.hover();
    await expect(page.locator(tooltip)).toHaveText('to feel joy because of an object');

    await noTooltip();
    await app.verbInput.fill('let');
    await expect(let_).toBeVisible();
    await let_.hover();
    await expect(page.locator(tooltip)).toHaveText('to cause a person to be allowed to act');

    // HELP_VERB is literal by design — no construct-free gloss tells helping from cooperating —
    // so what it shows is its English literal, in every UI language.
    await noTooltip();
    await app.verbInput.fill('help');
    await expect(help).toBeVisible();
    await help.hover();
    await expect(page.locator(tooltip)).toHaveText('to make what another does easier');

    // And the German gloss of the one whose frame is German's own accusative object.
    await app.setUiLanguage('de');
    await app.verbInput.fill('mögen');
    await expect(like).toBeVisible();
    await like.hover();
    await expect(page.locator(tooltip)).toHaveText('Freude wegen eines Gegenstands fühlen');
  });

  // The eight words that name a slot of their own are not in any picker, by design: an intensifier
  // is not a verb's adverb, a title is not a noun, OWN is not an ordinary adjective, and SOMETHING
  // is not one of the chooser's four persons. Each control is the builder work its ticket leaves.
  test('a concept whose slot is not its role\'s is offered by no picker (localization C32, C33, C37, C38)', async ({
    app,
    page,
  }) => {
    await app.setSubject('CAT');
    await app.verbInput.fill('eat');
    await page.locator('[data-testid="typeahead-option"][data-concept="EAT"]').click();

    // The subject box holds its word once it is filled, so its picker comes back the way a user
    // brings it back: one click selects the box, a second re-opens the picker over the word
    // (`canRepick` in phraseRender, ↵ on the keyboard).
    const subjectBox = page.getByTestId('box-subject');
    await subjectBox.click();
    await subjectBox.click();
    await expect(app.subjectInput).toBeVisible();

    // MR is a noun; the subject picker does not list it.
    await app.subjectInput.fill('mr');
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="MR"]')).toHaveCount(0);
    // PETER, beside it, is an ordinary name and is listed.
    await app.subjectInput.fill('peter');
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="PETER"]')).toBeVisible();

    // VERY and TOO are adverbs; the verb's adverb picker does not list them.
    await app.openVerbAdverb('very');
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="VERY"]')).toHaveCount(0);
    await app.openVerbAdverb('fast');
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="FAST"]')).toBeVisible();
  });

  // C40: French says "this" and "that" with one word, so THERE's gloss would have been HERE's. The
  // contrastive demonstrative writes the clitic that tells them apart.
  test('a contrastive demonstrative tells THERE from HERE (localization C40)', async ({
    app,
    page,
  }) => {
    await app.setUiLanguage('fr');
    await app.buildClause('CAT', 'EAT');
    const there = page.locator('[data-testid="typeahead-option"][data-concept="THERE"]');
    const here = page.locator('[data-testid="typeahead-option"][data-concept="HERE"]');

    await app.openVerbAdverb('là');
    await expect(there).toBeVisible();
    await there.hover();
    await expect(page.locator(tooltip)).toHaveText('dans ce lieu-là');

    await page.mouse.move(0, 0);
    await expect(page.locator(tooltip)).toHaveCount(0);
    await app.openVerbAdverb('ici');
    await expect(here).toBeVisible();
    await here.hover();
    await expect(page.locator(tooltip)).toHaveText('dans ce lieu');
  });

  // C29: the temporal complement, the *when* of a clause, which glosses P09's last three time
  // adverbs. Each of the three exercises a different part of it — the preposition a noun names for
  // itself, the postposed / impersonal-verb "ago", and the "until" that keeps STILL apart from NOW.
  test('a day names its own time preposition (localization C29: TODAY)', async ({
    app,
    page,
  }) => {
    // German is "an" a day where it is "zu" a time — the word is the day's, not the relation's, so
    // the tooltip says "an diesem Tag" and not the generic "zu diesem Tag".
    await app.setUiLanguage('de');
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb('heute');
    const today = page.locator('[data-testid="typeahead-option"][data-concept="TODAY"]');
    await expect(today).toBeVisible();
    await today.hover();
    await expect(page.locator(tooltip)).toHaveText('an diesem Tag');
  });

  test('"ago" is an impersonal verb in French (localization C29: JUST)', async ({
    app,
    page,
  }) => {
    // French has no preposition for "ago": it fronts "il y a", which takes the phrase's own article
    // after it. English and Italian postpose a word instead, and Japanese postposes 前に.
    await app.setUiLanguage('fr');
    await app.buildClause('CAT', 'EAT');
    await app.openVerbAdverb("à l'instant");
    const just = page.locator('[data-testid="typeahead-option"][data-concept="JUST"]');
    await expect(just).toBeVisible();
    await just.hover();
    await expect(page.locator(tooltip)).toHaveText('il y a un instant');
  });

  test('"until" tells STILL from NOW (localization C29)', async ({ app, page }) => {
    // Both gloss on TIME with the same "this": without a complement that says *until*, STILL's
    // tooltip was NOW's, which is what B67 found and C29 fixed. The "fino a" is the whole difference.
    await app.setUiLanguage('it');
    await app.buildClause('CAT', 'EAT');
    const still = page.locator('[data-testid="typeahead-option"][data-concept="STILL"]');
    const now = page.locator('[data-testid="typeahead-option"][data-concept="NOW"]');

    await app.openVerbAdverb('ancora');
    await expect(still).toBeVisible();
    await still.hover();
    await expect(page.locator(tooltip)).toHaveText('fino a questo tempo');

    await page.mouse.move(0, 0);
    await expect(page.locator(tooltip)).toHaveCount(0);
    await app.openVerbAdverb('ora');
    await expect(now).toBeVisible();
    await now.hover();
    await expect(page.locator(tooltip)).toHaveText('a questo tempo');
  });

  // P09-E24's time, degree and place words (localization B80, B89, B90): one row per ticket.
  test('a frequency adverb as a locative, and a time adverb as "after" (localization B80: OFTEN, LATER)', async ({
    app,
    page,
  }) => {
    // OFTEN is the locative complement gloss on CASE_INSTANCE under `many`: REPEATEDLY has "at many times".
    await app.setUiLanguage('de');
    await app.buildClause('CAT', 'EAT');
    const often = page.locator('[data-testid="typeahead-option"][data-concept="OFTEN"]');
    const later = page.locator('[data-testid="typeahead-option"][data-concept="LATER"]');
    await app.openVerbAdverb('oft');
    await expect(often).toBeVisible();
    await often.hover();
    await expect(page.locator(tooltip)).toHaveText('in vielen Fällen');

    // Japanese よく is also WELL's word; the row is OFTEN's by its concept.
    await app.setUiLanguage('ja');
    await app.openVerbAdverb('よく');
    await expect(often).toBeVisible();
    await often.hover();
    await expect(page.locator(tooltip)).toHaveText('多くの場合で');

    // LATER is C29's `after` relation on TIME, with NOW's "this".
    await app.setUiLanguage('fr');
    await app.openVerbAdverb('plus tard');
    await expect(later).toBeVisible();
    await later.hover();
    await expect(page.locator(tooltip)).toHaveText('après ce temps');

    await app.setUiLanguage('es');
    await app.openVerbAdverb('más tarde');
    await expect(later).toBeVisible();
    await later.hover();
    await expect(page.locator(tooltip)).toHaveText('después de este tiempo');
  });

  test('a place adverb on FAR, and an intensifier no picker offers (localization B89: FAR_AWAY, A_LITTLE)', async ({
    app,
    page,
  }) => {
    await app.setUiLanguage('de');
    await app.buildClause('CAT', 'EAT');
    const farAway = page.locator('[data-testid="typeahead-option"][data-concept="FAR_AWAY"]');
    await app.openVerbAdverb('weit');
    await expect(farAway).toBeVisible();
    await farAway.hover();
    await expect(page.locator(tooltip)).toHaveText('an einem fernen Ort');

    await app.setUiLanguage('ja');
    await app.openVerbAdverb('遠く');
    await expect(farAway).toBeVisible();
    await farAway.hover();
    await expect(page.locator(tooltip)).toHaveText('遠い場所で');

    // A_LITTLE is an intensifier, like VERY: the verb's adverb picker leaves it out, so its gloss —
    // VERY's with LOW — is checked where the tooltip reads it from.
    await app.openVerbAdverb('少し');
    await expect(page.locator('[data-testid="typeahead-option"][data-concept="A_LITTLE"]')).toHaveCount(0);
    const res = await page.request.get('/api/concepts?role=adverb');
    const { concepts } = (await res.json()) as { concepts: { id: string; definitions?: Record<string, string> }[] };
    expect(concepts.find((c) => c.id === 'A_LITTLE')?.definitions).toMatchObject({
      de: 'zu einer niedrigen Ebene', ja: '低い段階へ',
    });
  });

  test('the universal thing pronoun is "all things" (localization B90: EVERYTHING)', async ({ page }) => {
    // EVERYTHING is a pronoun of the indefinite slot, which the person chooser does not offer (as
    // SOMETHING); its gloss is SOMETHING's genus under `all`.
    const res = await page.request.get('/api/concepts?role=pronoun');
    const { concepts } = (await res.json()) as { concepts: { id: string; definitions?: Record<string, string> }[] };
    expect(concepts.find((c) => c.id === 'EVERYTHING')?.definitions).toMatchObject({
      en: 'all things', de: 'alle Dinge', ja: 'すべてのもの',
    });
  });

  // P11's kin terms (localization B68–B74): one row per ticket, each on what that ticket's shape
  // turns on — the coordination, the relative clause that goes around a genus, the predicative a
  // copula wants, the genitive, the chain of two, the negated relative and the adverb Japanese needs.

  test('a coordinated noun definition renders (localize-seed B68: CHILD_OFFSPRING, PARENT)', async ({
    app,
    page,
  }) => {
    // Italian: "un figlio o una figlia" — the corpus's coordination in a gloss's subject, and the
    // word the Italian picker most needs a tooltip on, since *figlio* is the son and the offspring.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('child');
    const childIt = page.locator('[data-testid="typeahead-option"][data-concept="CHILD_OFFSPRING"]');
    await expect(childIt).toBeVisible();
    await childIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un figlio o una figlia');

    // PARENT's own gloss, re-pointed from CHILD to CHILD_OFFSPRING: "figli", not "bambini" (P11 D11).
    // The mouse leaves the list first: refilling it under the pointer opens whatever row lands there,
    // and two tooltips at once fail the locator.
    await page.mouse.move(0, 0);
    await expect(page.locator(tooltip)).toHaveCount(0);
    await app.subjectInput.fill('parent');
    const parentIt = page.locator('[data-testid="typeahead-option"][data-concept="PARENT"]');
    await expect(parentIt).toBeVisible();
    await parentIt.hover();
    await expect(page.locator(tooltip)).toHaveText('una persona che ha figli');

    // Japanese: the same coordination, with か between the two.
    await app.setUiLanguage('ja');
    await app.subjectInput.fill('child');
    const childJa = page.locator('[data-testid="typeahead-option"][data-concept="CHILD_OFFSPRING"]');
    await expect(childJa).toBeVisible();
    await childJa.hover();
    await expect(page.locator(tooltip)).toHaveText('息子か娘');
  });

  test('a relative clause goes around the genus (localize-seed B69: SISTER)', async ({
    app,
    page,
  }) => {
    // Spanish: "tiene los mismos padres" — tener takes no personal "a", which this ticket's seed
    // had to teach the engine; the head is PERSON, because *una sorella femminile* is not a gloss.
    await app.setUiLanguage('es');
    await app.subjectInput.fill('sister');
    const sisterEs = page.locator('[data-testid="typeahead-option"][data-concept="SISTER"]');
    await expect(sisterEs).toBeVisible();
    await sisterEs.hover();
    await expect(page.locator(tooltip)).toHaveText('una persona femenina que tiene los mismos padres');

    // Japanese: the relative clause comes first and the sex adjective after it, on the head.
    await app.setUiLanguage('ja');
    await app.subjectInput.fill('sister');
    const sisterJa = page.locator('[data-testid="typeahead-option"][data-concept="SISTER"]');
    await expect(sisterJa).toBeVisible();
    await sisterJa.hover();
    await expect(page.locator(tooltip)).toHaveText('同じ両親を持つ女性の人');
  });

  test('a copular verb definition takes a predicative, not an object (localize-seed B70: MARRY)', async ({
    app,
    page,
  }) => {
    // German: "ein Ehepartner werden" — the nominative the copula wants, where an object would give
    // "einen Ehepartner werden".
    await app.setUiLanguage('de');
    await app.setSubject('CAT');
    await app.verbInput.fill('marry');
    const marryDe = page.locator('[data-testid="typeahead-option"][data-concept="MARRY"]');
    await expect(marryDe).toBeVisible();
    await marryDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Ehepartner werden');

    // Japanese: に, not を — 配偶者になる.
    await app.setUiLanguage('ja');
    await app.verbInput.fill('marry');
    const marryJa = page.locator('[data-testid="typeahead-option"][data-concept="MARRY"]');
    await expect(marryJa).toBeVisible();
    await marryJa.hover();
    await expect(page.locator(tooltip)).toHaveText('配偶者になる');
  });

  test('a kin genitive renders (localize-seed B71: GRANDPARENT, GRANDSON)', async ({
    app,
    page,
  }) => {
    // English writes the genitive as the Saxon one, which is what a speaker says.
    await app.subjectInput.fill('grandparent');
    const grandparentEn = page.locator('[data-testid="typeahead-option"][data-concept="GRANDPARENT"]');
    await expect(grandparentEn).toBeVisible();
    await grandparentEn.hover();
    await expect(page.locator(tooltip)).toHaveText("a parent's parent");

    // Italian: GRANDSON is the sex adjective, because "a child's son" would be GRANDCHILD's own
    // gloss there — *un figlio di un figlio*, character for character.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('grandson');
    const grandsonIt = page.locator('[data-testid="typeahead-option"][data-concept="GRANDSON"]');
    await expect(grandsonIt).toBeVisible();
    await grandsonIt.hover();
    await expect(page.locator(tooltip)).toHaveText('un nipote maschile');
  });

  test('a genitive inside a genitive renders (localize-seed B72: COUSIN)', async ({
    app,
    page,
  }) => {
    // Japanese stacks の twice; German two genitives. No other gloss in the corpus chains them.
    await app.setUiLanguage('ja');
    await app.subjectInput.fill('cousin');
    const cousinJa = page.locator('[data-testid="typeahead-option"][data-concept="COUSIN"]');
    await expect(cousinJa).toBeVisible();
    await cousinJa.hover();
    await expect(page.locator(tooltip)).toHaveText('親の兄弟の子供');

    await app.setUiLanguage('de');
    await app.subjectInput.fill('cousin');
    const cousinDe = page.locator('[data-testid="typeahead-option"][data-concept="COUSIN"]');
    await expect(cousinDe).toBeVisible();
    await cousinDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Kind eines Geschwisters eines Elternteils');
  });

  test('a genitive and a negated relative on one head (localize-seed B73: STEPFATHER)', async ({
    app,
    page,
  }) => {
    // German writes the negation in the article — "der **kein** Vater ist" — and keeps the comma.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('stepfather');
    const stepfatherDe = page.locator('[data-testid="typeahead-option"][data-concept="STEPFATHER"]');
    await expect(stepfatherDe).toBeVisible();
    await stepfatherDe.hover();
    await expect(page.locator(tooltip)).toHaveText('ein Ehemann einer Mutter, der kein Vater ist');

    // Japanese puts the whole clause in front of the head it restricts.
    await app.setUiLanguage('ja');
    await app.subjectInput.fill('stepfather');
    const stepfatherJa = page.locator('[data-testid="typeahead-option"][data-concept="STEPFATHER"]');
    await expect(stepfatherJa).toBeVisible();
    await stepfatherJa.hover();
    await expect(page.locator(tooltip)).toHaveText('父親ではない母親の夫');
  });

  test('an adverb keeps a gap Japanese cannot mark (localize-seed B74: PARTNER)', async ({
    app,
    page,
  }) => {
    // Without TOGETHER the Japanese relative reads 住む人, "a person who lives", because no Japanese
    // relative clause marks which slot the head fills. 一緒に puts the differentia back.
    await app.setUiLanguage('ja');
    await app.subjectInput.fill('partner');
    const partnerJa = page.locator('[data-testid="typeahead-option"][data-concept="PARTNER"]');
    await expect(partnerJa).toBeVisible();
    await partnerJa.hover();
    await expect(page.locator(tooltip)).toHaveText('一緒に住む人');
  });

  test('a bare plural head over an object gap (localize-seed A32: NEWS)', async ({ app, page }) => {
    // English: the report and its recency, on FACT; the plural head suits a plural-only word.
    await app.subjectInput.fill('news');
    const newsEn = page.locator('[data-testid="typeahead-option"][data-concept="NEWS"]');
    await expect(newsEn).toBeVisible();
    await newsEn.hover();
    await expect(page.locator(tooltip)).toHaveText('facts that one has told recently');

    // German: the relative pronoun agrees with the plural Tatsachen, the perfect goes last.
    await app.setUiLanguage('de');
    await app.subjectInput.fill('news');
    const newsDe = page.locator('[data-testid="typeahead-option"][data-concept="NEWS"]');
    await expect(newsDe).toBeVisible();
    await newsDe.hover();
    await expect(page.locator(tooltip)).toHaveText('Tatsachen, die man kürzlich erzählt hat');
  });

  test('a negated HAVE in a headless relative (localize-seed A33: OKAY)', async ({ app, page }) => {
    // English: fine without saying good or well.
    await app.setSubject('CAT');
    await app.openSubjectAdjective('okay');
    const okayEn = page.locator('[data-testid="typeahead-option"][data-concept="OKAY"]');
    await expect(okayEn).toBeVisible();
    await okayEn.hover();
    await expect(page.locator(tooltip)).toHaveText('that does not have problems');

    // Japanese: the everyday paraphrase of 大丈夫, with no head.
    await app.setUiLanguage('ja');
    await app.openSubjectAdjective('okay');
    const okayJa = page.locator('[data-testid="typeahead-option"][data-concept="OKAY"]');
    await expect(okayJa).toBeVisible();
    await okayJa.hover();
    await expect(page.locator(tooltip)).toHaveText('問題がない');
  });

  // B82: the nouns of ranks 201–400. KIND_SORT's relative agrees with GROUP across the `parts`
  // genitive; GAME's French purpose takes the generic article the engine now gives a bare mass noun.
  for (const [id, query, language, rendered] of [
    ['KIND_SORT', 'kind', 'de', 'eine Gruppe von Dingen, die die gleichen Merkmale hat'],
    ['KIND_SORT', 'kind', 'ja', '同じ特徴があるもののグループ'],
    ['GAME', 'game', 'fr', "une action qu'on fait pour la joie"],
  ] as const) {
    test(`a noun definition renders (localization B82: ${id}, ${language})`, async ({ app, page }) => {
      await app.setUiLanguage(language);
      await app.subjectInput.fill(query);
      const option = page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(rendered);
    });
  }

  // B85: the verbs of giving and getting. PAY is GIVE's dative recipient with a mass object, PROVIDE
  // a causative over HAVE with a bare plural object, WIN the first gloss on B82's GAME.
  for (const [id, query, en, language, other] of [
    ['PAY', 'pay', 'to give money to a person', 'de', 'einer Person Geld geben'],
    ['PAY', 'pay', 'to give money to a person', 'ja', '人にお金をあげる'],
    ['PROVIDE', 'provide', 'to cause a person to have objects', 'fr', 'induire une personne à avoir des objets'],
    ['PROVIDE', 'provide', 'to cause a person to have objects', 'pt', 'induzir uma pessoa a ter objetos'],
    ['WIN', 'win', 'to be best in a game', 'de', 'in einem Spiel am besten sein'],
  ] as const) {
    test(`a verb definition renders (localization B85: ${id}, ${language})`, async ({ app, page }) => {
      const option = page.locator(`[data-testid="typeahead-option"][data-concept="${id}"]`);
      await app.setSubject('CAT');

      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(en);

      await app.setUiLanguage(language);
      await app.verbInput.fill(query);
      await expect(option).toBeVisible();
      await option.hover();
      await expect(page.locator(tooltip)).toHaveText(other);
    });
  }
});
