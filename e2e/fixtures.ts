import { test as base, expect, type Locator, type Page } from '@playwright/test';
import type { LanguageCode } from '@signi/shared';

// The builder, driven the way a user drives it. Everything the old throwaway scripts kept
// rediscovering about this app lives here rather than in the specs.
//
// Words are named by CONCEPT ID (the uppercase English lemma: CAT, EAT), not by typed text.
// Two reasons, both learned the hard way:
//
//  - Pressing Enter takes the *highlighted* option, and the highlight is the first substring
//    match — typing "eat" and hitting Enter selects BEAT. Clicking the option carrying the
//    concept id is exact.
//  - The off-screen word palette holds the same words, so clicking an option by its visible
//    text matches the wrong element. The id lives only on the dropdown rows.
//
// Slot inputs are likewise found by data-testid, not by placeholder: placeholders are
// engine-rendered UI strings and change with the interface language.
export class Builder {
  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
    // localStorage isn't reachable on about:blank, so it's cleared after the first real load.
    // Canvas geometry (signi:graphHeight) persists there and would leak between runs.
    await this.page.evaluate(() => localStorage.clear());
    await this.page.reload();
    await expect(this.subjectInput).toBeVisible();
  }

  get subjectInput(): Locator {
    return this.page.getByTestId('typeahead-subject');
  }

  get verbInput(): Locator {
    return this.page.getByTestId('typeahead-verb');
  }

  get nounInput(): Locator {
    return this.page.getByTestId('typeahead-noun');
  }

  /**
   * Scroll a control to the middle of the viewport, ahead of a click. Playwright's own
   * scroll-into-view stops as soon as the control is inside the viewport, which on a canvas tall
   * enough to scroll the page can leave it under the sticky header — and the click lands there.
   */
  private async centered(target: Locator): Promise<Locator> {
    await target.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
    return target;
  }

  /** Type into a picker, then click the option that carries this exact concept. */
  private async pick(input: Locator, conceptId: string): Promise<void> {
    await expect(input).toBeVisible();
    await this.centered(input);
    await input.fill(conceptId.toLowerCase());
    await this.page
      .locator(`[data-testid="typeahead-option"][data-concept="${conceptId}"]`)
      .click();
  }

  async setSubject(conceptId: string): Promise<void> {
    await this.pick(this.subjectInput, conceptId);
  }

  /**
   * Pick the generic / impersonal subject ("one") from the pronoun chooser — the one pronoun not
   * reachable by the person toggle (it shares 3rd person with THIRD_PERSON). Open the subject box,
   * switch to the pronoun tab, choose "one", and commit.
   */
  async setGenericSubject(): Promise<void> {
    await this.subjectInput.click();
    await this.page.getByTestId('pronoun-tab').click();
    await this.page.getByTestId('pronoun-generic').click();
    await this.page.getByTestId('pronoun-commit').click();
  }

  async setVerb(conceptId: string): Promise<void> {
    await this.pick(this.verbInput, conceptId);
  }

  async setDirectObject(conceptId: string): Promise<void> {
    await this.pick(this.nounInput, conceptId);
  }

  /**
   * Reveal the subject's first adjective slot and type into its picker. Adjectives are reached
   * differently from the core slots: a satellite on the subject box reveals the adjective box
   * (`satellite-subjectAdjective` → `box-subjectAdjective`), which holds the adjective typeahead.
   * The caller then hovers the `typeahead-option` row it wants (its tooltip is the definition).
   */
  async openSubjectAdjective(query: string): Promise<void> {
    // The satellite is a toggle, so reveal only when the box isn't already up (a second call —
    // e.g. after switching UI language — would otherwise collapse it).
    const input = this.page.getByTestId('box-subjectAdjective').locator('input');
    if (!(await input.isVisible().catch(() => false))) {
      await this.page.getByTestId('satellite-subjectAdjective').click();
    }
    await expect(input).toBeVisible();
    await input.fill(query);
  }

  /**
   * Reveal the verb's adverb slot and type into its picker. The adverb (`modifier`) is a satellite
   * on the verb phrase (`satellite-modifier` → `box-modifier`), revealed once a verb is set — the
   * same shape as `openSubjectAdjective`. The caller then hovers the `typeahead-option` row it wants
   * (its tooltip is the definition).
   */
  async openVerbAdverb(query: string): Promise<void> {
    // The satellite is a toggle, so reveal only when the box isn't already up (a second call —
    // e.g. after switching UI language — would otherwise collapse it).
    const input = this.page.getByTestId('box-modifier').locator('input');
    if (!(await input.isVisible().catch(() => false))) {
      await this.page.getByTestId('satellite-modifier').click();
    }
    await expect(input).toBeVisible();
    await input.fill(query);
  }

  /** Subject → verb: the shortest path to a translatable clause and a painted canvas. */
  async buildClause(subject: string, verb: string): Promise<void> {
    await this.setSubject(subject);
    await this.setVerb(verb);
    await expect(this.groupBox('Verb Phrase')).toBeVisible();
  }

  /**
   * Choose a personal pronoun subject from the pronoun chooser — the person / number / gender rows,
   * then commit. The row buttons are engine-rendered UI strings, so this assumes the English UI.
   */
  async setPronounSubject(
    person: 'first' | 'second' | 'third',
    number: 'singular' | 'plural',
    gender: 'male' | 'female',
  ): Promise<void> {
    await this.subjectInput.click();
    await this.page.getByTestId('pronoun-tab').click();
    for (const choice of [person, number, gender]) {
      await this.page.getByRole('button', { name: choice, exact: true }).click();
    }
    await this.page.getByTestId('pronoun-commit').click();
  }

  /** A satellite's control on its parent box border (`subjectNumber`, `verbTense`, `locative`, …). */
  satellite(key: string): Locator {
    return this.page.getByTestId(`satellite-${key}`);
  }

  /**
   * Reveal a satellite word slot from its control and pick its word — an adjective, a complement,
   * a modal. Every such slot renders its picker inside `box-<key>` once revealed.
   */
  async revealAndPick(slotKey: string, conceptId: string): Promise<void> {
    await (await this.centered(this.satellite(slotKey))).click();
    await this.pick(this.page.getByTestId(`box-${slotKey}`).locator('input'), conceptId);
  }

  /**
   * Advance a cycling verb toggle one step: tense (present → past → future) or aspect (neutral →
   * progressive → prospective → resultative). The toggle box is revealed on first use.
   */
  async cycle(toggle: 'verbTense' | 'verbAspect'): Promise<void> {
    const box = this.page.getByTestId(`box-${toggle}`);
    if (!(await box.isVisible())) await (await this.centered(this.satellite(toggle))).click();
    await (await this.centered(box)).click();
  }

  /**
   * Set a noun's determiner from the grouped menu, by the value's grammar name ("Indefinite",
   * "Multal"). Each menu row reads name then surface word, so the name is matched as a prefix.
   */
  async setDeterminer(noun: string, name: string): Promise<void> {
    const box = this.page.getByTestId(`box-${noun}Definiteness`);
    if (!(await box.isVisible())) {
      await (await this.centered(this.satellite(`${noun}Definiteness`))).click();
    }
    await (await this.centered(box)).click();
    await this.page.getByRole('menuitem', { name: new RegExp(`^${name}`) }).click();
  }

  /**
   * Assert several languages' sentences at once. Polls the whole set together, so a translation
   * still in flight is waited out and a mismatch reports every language in one diff.
   */
  async expectSentences(want: Partial<Record<LanguageCode, string>>): Promise<void> {
    const languages = Object.keys(want) as LanguageCode[];
    await expect
      .poll(async () => {
        const got: Partial<Record<LanguageCode, string>> = {};
        for (const language of languages) got[language] = await this.sentence(language);
        return got;
      })
      .toEqual(want);
  }

  // ── Multi-period helpers ───────────────────────────────────────────────────
  // Subordinate clauses (relative / condition / coordination) are cross-container links: each
  // clause is its own period, and joining them folds one into the other's sentence. The
  // single-container helpers above find slots by a page-wide data-testid, which is ambiguous once
  // a second period is on the canvas, so these scope every lookup to one period by index.

  /** The nth period container on the canvas (0-based). */
  period(index: number): Locator {
    return this.page.getByTestId('period-container').nth(index);
  }

  /** Add another empty period to the workspace and wait for it to mount. */
  async addPeriod(): Promise<void> {
    const containers = this.page.getByTestId('period-container');
    const before = await containers.count();
    await this.page.getByTestId('add-period-container').click();
    await expect(containers).toHaveCount(before + 1);
  }

  /** `pick`, scoped to one period's slot — the multi-clause form. The option dropdown is a
   *  single page-level popper, so only the input is scoped. */
  private async pickIn(scope: Locator, slotTestId: string, conceptId: string): Promise<void> {
    const input = scope.getByTestId(slotTestId);
    await expect(input).toBeVisible();
    await input.fill(conceptId.toLowerCase());
    await this.page
      .locator(`[data-testid="typeahead-option"][data-concept="${conceptId}"]`)
      .click();
  }

  /** Subject → verb inside a specific period. */
  async buildClauseIn(index: number, subject: string, verb: string): Promise<void> {
    const scope = this.period(index);
    await this.pickIn(scope, 'typeahead-subject', subject);
    await this.pickIn(scope, 'typeahead-verb', verb);
    await expect(
      scope.locator('[data-testid="group-box"][data-group="Verb Phrase"]'),
    ).toBeVisible();
  }

  /** Set the direct object of a specific period. */
  async setDirectObjectIn(index: number, conceptId: string): Promise<void> {
    await this.pickIn(this.period(index), 'typeahead-noun', conceptId);
  }

  /**
   * Attach the clause in period `clauseIndex` to a noun in period `headIndex` as a restrictive
   * relative clause. Two clicks, the way the canvas takes it: start the link from the head noun's
   * relative-clause control, then click the gap slot's box in the clause period. The gap slot must
   * already hold a word to be an eligible pick target — its surface is dropped for the head's.
   */
  async linkRelative(
    headIndex: number,
    headSlot: string,
    clauseIndex: number,
    gapSlot: string,
  ): Promise<void> {
    await this.period(headIndex)
      .getByTestId(`relative-ctl-${headSlot}`)
      .locator('button')
      .click();
    await this.period(clauseIndex).getByTestId(`box-${gapSlot}`).click();
  }

  /**
   * Make period `ifIndex` the IF condition of period `mainIndex`. Two clicks: the main clause's IF
   * control starts the pick, then the condition period's own control (lit as a target) takes it.
   */
  async linkCondition(mainIndex: number, ifIndex: number): Promise<void> {
    await this.period(mainIndex)
      .getByRole('button', { name: 'Add an IF condition (this becomes the main clause)' })
      .click();
    await this.period(ifIndex)
      .getByRole('button', { name: 'Use this period as the IF condition' })
      .click();
  }

  /**
   * Coordinate period `secondIndex` onto period `firstIndex`. Starting a coordination opens the
   * conjunction menu first ("And", "But", …, matched as a prefix of the row); the pick follows.
   */
  async linkCoordination(firstIndex: number, secondIndex: number, conjunction: string): Promise<void> {
    await this.period(firstIndex)
      .getByRole('button', { name: 'Coordinate this period' })
      .click();
    await this.page.getByRole('menuitem', { name: new RegExp(`^${conjunction}`) }).click();
    await this.period(secondIndex)
      .getByRole('button', { name: 'Use this period as the coordinated clause' })
      .click();
  }

  /**
   * Link period `instrumentIndex` as the instrumental of the verb in period `clauseIndex`. The
   * instrumental has no target-side control: a pending pick lights the whole card, and a click on
   * it — clear of the border, where a press starts a card drag instead — makes the link.
   */
  async linkInstrument(clauseIndex: number, instrumentIndex: number): Promise<void> {
    await this.period(clauseIndex).getByTestId('satellite-instrumental').click();
    await this.period(instrumentIndex).click({ position: { x: 20, y: 20 } });
  }

  /** The dashed bounding box of one role group, e.g. "Subject" / "Verb Phrase". */
  groupBox(label: string): Locator {
    return this.page.locator(`[data-testid="group-box"][data-group="${label}"]`);
  }

  async groupOrigin(label: string): Promise<{ x: number; y: number }> {
    const box = await this.groupBox(label).boundingBox();
    if (!box) throw new Error(`group box "${label}" is not on the canvas`);
    return { x: box.x, y: box.y };
  }

  /**
   * Drag a whole constituent across the canvas by its dotted ring, moving everything on it at once.
   *
   * Grabbed at half past seven, 12px inside the ring — in the clear strip between the dotted
   * ring's controls (which straddle it) and whatever orbits inside, all of which have handlers of
   * their own — and moved in steps: the builder only treats a pointer sequence as a drag once it
   * has travelled past a 6px threshold, so a single jump move registers as a click and moves
   * nothing.
   */
  async dragGroup(label: string, dx: number, dy: number): Promise<void> {
    const box = await this.groupBox(label).boundingBox();
    if (!box) throw new Error(`group box "${label}" is not on the canvas`);
    const r = box.width / 2 - 12;
    const startX = box.x + box.width / 2 - r * Math.SQRT1_2;
    const startY = box.y + box.height / 2 + r * Math.SQRT1_2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    for (let step = 1; step <= 20; step++) {
      await this.page.mouse.move(startX + (dx * step) / 20, startY + (dy * step) / 20);
    }
    await this.page.mouse.up();
  }

  get compactToggle(): Locator {
    return this.page.getByTestId('period-compact-toggle');
  }

  get tidyButton(): Locator {
    return this.page.getByTestId('period-tidy');
  }

  /**
   * Tidy a period (the first by default), and wait for the layout to reach its fixed point.
   *
   * Tidying is convergent, not one-shot: the first pass collapses the canvas to its tidy
   * height while still positioning the groups against the height it had before, leaving them
   * a few pixels off; a second pass settles them. Clicking twice is what "tidy" means from a
   * caller's point of view, so the loop lives here rather than in every spec.
   *
   * Every dotted box in the period is fingerprinted, by its offset inside the canvas rather than
   * in the viewport, so a page scroll brought on by the click doesn't read as the layout moving.
   */
  async tidy(periodIndex = 0): Promise<void> {
    const period = this.period(periodIndex);
    const button = period.getByTestId('period-tidy').first();
    const settled = async () => {
      await button.click();
      return period
        .locator('[data-testid="group-box"]')
        .evaluateAll((boxes) =>
          (boxes as HTMLElement[])
            .map((b) => `${b.offsetLeft},${b.offsetTop},${b.offsetWidth},${b.offsetHeight}`)
            .join(' '),
        );
    };
    let previous = await settled();
    for (let pass = 0; pass < 4; pass++) {
      const next = await settled();
      if (next === previous) return;
      previous = next;
    }
  }

  /** The translated sentences for one language, in period order. */
  sentences(language: LanguageCode): Locator {
    return this.page.getByTestId(`translation-${language}`).getByTestId('sentence');
  }

  /**
   * The text of the single translated sentence in one language, without furigana.
   *
   * Japanese renders readings as <rt> inside <ruby>, and innerText splices them into the
   * base text (猫ねこは… for 猫[ねこ]は…), so the readings are stripped here and asserted
   * separately by `furigana`.
   */
  async sentence(language: LanguageCode): Promise<string> {
    return this.sentences(language)
      .first()
      .evaluate((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('rt').forEach((rt) => rt.remove());
        return (clone.textContent ?? '').trim();
      });
  }

  /** The furigana readings over one language's sentence, in order. */
  async furigana(language: LanguageCode): Promise<string[]> {
    return this.sentences(language)
      .first()
      .locator('rt')
      .allInnerTexts();
  }

  async setUiLanguage(code: LanguageCode): Promise<void> {
    await this.page.getByLabel('Interface language').click();
    await this.page.locator(`li[data-value="${code}"]`).click();
    await expect(this.page.locator('li[data-value]')).toHaveCount(0);
  }
}

export const test = base.extend<{ app: Builder }>({
  // A React error in the canvas (the classic being "Maximum update depth exceeded" from the
  // layout feedback loop) leaves the DOM standing, so a spec can pass over a broken page.
  // Every test fails on an uncaught page error instead.
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await use(page);
    expect(errors, 'the page threw an uncaught error').toEqual([]);
  },

  app: async ({ page }, use) => {
    const app = new Builder(page);
    await app.goto();
    await use(app);
  },
});

export { expect };
