import { test, expect } from './fixtures';

// The canvas is a geometry feedback loop — node positions are stored as a percentage of a
// canvas height that layout effects write back into — so these drive the real pointer
// sequences rather than trusting a static render. The `page` fixture fails the test on any
// uncaught error, which is what catches the "Maximum update depth exceeded" class of bug.
test.describe('canvas', () => {
  test('compact hides the role boxes, expand brings them back', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');

    const boxes = app.page.getByTestId('group-box');
    await expect(boxes).toHaveCount(3); // Subject, Verb Phrase, Direct Object
    await expect(app.compactToggle).toHaveAttribute('data-compact', 'false');

    // Compact keeps the word chips but drops the dashed boxes entirely.
    await app.compactToggle.click();
    await expect(app.compactToggle).toHaveAttribute('data-compact', 'true');
    await expect(boxes).toHaveCount(0);

    await app.compactToggle.click();
    await expect(app.compactToggle).toHaveAttribute('data-compact', 'false');
    await expect(boxes).toHaveCount(3);
  });

  test('a dragged group stays where it is put, and tidy lays it out again', async ({ app }) => {
    await app.buildClause('CAT', 'EAT');

    // Tidy converges rather than canonicalising in one pass: the first click collapses the
    // canvas to its tidy height but positions the groups against the *old* height, so it lands
    // a few px short and a second click settles on the fixed point. Hence tidy() clicks twice.
    // The invariant pinned here is that the fixed point is the same wherever the group was
    // dragged from — not that one tidy restores the previous layout, which it does not.
    await app.tidy();
    const settled = await app.groupOrigin('Subject');

    await app.dragGroup('Subject', 140, 90);
    const dragged = await app.groupOrigin('Subject');
    expect(Math.abs(dragged.x - settled.x)).toBeGreaterThan(50);

    await app.tidy();
    const retidied = await app.groupOrigin('Subject');
    expect(Math.round(retidied.x)).toBe(Math.round(settled.x));
    expect(Math.round(retidied.y)).toBe(Math.round(settled.y));
  });

  test("a word's controls ride its solid ring, clear of its word and of each other", async ({ app }) => {
    // "be" is a short verb carrying the full set of controls — tense, aspect, modal, polarity,
    // adverb, and its clear button. Tense and the modal aim much the same way; fanning them apart
    // on a box used to sink the modal over the word. On a ring they spread along its circumference,
    // which clears the word's corners by a control's width. The subject's controls crowd it the
    // same way.
    await app.buildClause('AFRICA', 'BE');
    await app.page.mouse.move(0, 0);

    const RADIUS = 10; // a control button is 20px across
    const SLACK = 0.5; // sub-pixel rounding
    for (const [slot, word, controls] of [
      [
        'verb',
        'be',
        '[data-testid^="satellite-verb"], [data-testid="satellite-modifier"], [aria-label="Clear the verb"]',
      ],
      // The relative, possessor and conjunct controls ride the subject's dotted ring, not its solid one.
      [
        'subject',
        'Africa',
        `${['Relative', 'Possessor', 'Conjunct'].reduce(
          (sel, kind) => `${sel}:not([data-testid$="${kind}"])`,
          '[data-testid^="satellite-subject"]',
        )}, [aria-label="Clear the subject"]`,
      ],
    ]) {
      // The layout settles over a few frames as boxes are measured, so the geometry is polled.
      await expect(async () => {
        const { ring, glyphs, centers } = await app.page.evaluate(
          ({ slot, word, controls }) => {
            const rect = (r: DOMRect) => ({ l: r.left, r: r.right, t: r.top, b: r.bottom });
            const box = document.querySelector(`[data-testid="box-${slot}"]`)!;
            const circle = box.querySelector('.slot-circle')!.getBoundingClientRect();
            // The word's glyphs, not its line.
            const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
            let glyphs = null;
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
              if (n.textContent?.trim() !== word) continue;
              const range = document.createRange();
              range.selectNodeContents(n);
              glyphs = rect(range.getBoundingClientRect());
            }
            const centers = [...document.querySelectorAll(controls)].map((el) => {
              const r = el.getBoundingClientRect();
              return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            });
            return {
              ring: { x: circle.left + circle.width / 2, y: circle.top + circle.height / 2, r: circle.width / 2 },
              glyphs,
              centers,
            };
          },
          { slot, word, controls },
        );
        expect(glyphs).not.toBeNull();
        expect(centers.length).toBeGreaterThanOrEqual(3);
        for (const c of centers) {
          // On the ring: the center within a few px of its circle, inside or out.
          expect(Math.abs(Math.hypot(c.x - ring.x, c.y - ring.y) - ring.r)).toBeLessThanOrEqual(3);
          // Clear of the word.
          const dx = Math.max(glyphs!.l - c.x, 0, c.x - glyphs!.r);
          const dy = Math.max(glyphs!.t - c.y, 0, c.y - glyphs!.b);
          expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(RADIUS - SLACK);
        }
        // Clear of each other.
        for (let i = 0; i < centers.length; i++) {
          for (let j = i + 1; j < centers.length; j++) {
            const d = Math.hypot(centers[i].x - centers[j].x, centers[i].y - centers[j].y);
            expect(d).toBeGreaterThanOrEqual(2 * RADIUS - SLACK);
          }
        }
      }).toPass({ timeout: 5000 });
    }
  });
});
