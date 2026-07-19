import { test, expect } from './fixtures';

// Hovering a word in a picker dropdown surfaces the concept's definition in a tooltip.
//
// A definition comes from one of two sources, both keyed by the current UI language and both
// falling back to English:
//   - an engine-composed `definition` plan (CAT → "a small mammal"), rendered from seeded
//     concepts into every language, so the tooltip is localized like the rest of the UI;
//   - the stored `concept_definitions` literal (HOUSE → "a building used as a dwelling"), of which
//     only English is seeded.
test.describe('word definition tooltip', () => {
  const tooltip = '.MuiTooltip-tooltip';

  test('shows the definition on hover in the subject picker', async ({ app, page }) => {
    // HOUSE carries only a stored English literal (no definition plan), so the tooltip shows it.
    await app.subjectInput.fill('house');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="HOUSE"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toBeVisible();
    await expect(page.locator(tooltip)).toHaveText('a building used as a dwelling');
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
    await expect(page.locator(tooltip)).toHaveText('un mot qui exprime actions');
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

  test('a literal definition falls back to English under a non-English UI language', async ({
    app,
    page,
  }) => {
    // HOUSE has no definition plan and only an English literal, so an Italian UI reverts to it.
    await app.setUiLanguage('it');
    await app.subjectInput.fill('house');
    const option = page.locator(
      '[data-testid="typeahead-option"][data-concept="HOUSE"]',
    );
    await expect(option).toBeVisible();

    await option.hover();

    await expect(page.locator(tooltip)).toHaveText('a building used as a dwelling');
  });
});
