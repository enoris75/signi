/**
 * One concept's Swiss German forms (P10-E4): the `gsw` entry of its `forms`, kept in this folder
 * rather than inline in the role files so the column can be authored, reviewed (P10-E14) and
 * counted as one body of text. `concepts/index.ts` merges each entry into its concept as
 * `forms.gsw`; a concept with no entry has no Swiss German lexeme, and renders as nothing in that
 * row (P10-E1 D1) — never as its German form.
 *
 * The keys are `de`'s (the `gsw` engine is a fork of it, P10-E5), minus the cells Swiss German does
 * not have: no `*_past` (there is no preterite, P10 D5), no `genitive` and no `weak` (no genitive,
 * and no case ending on a noun, P10 D7). The spelling is the Dieth style sheet's
 * (docs/features/P-planning/P10-swiss-german/dieth-style-sheet.md).
 */
export type GswForms = Record<string, string>;

export type GswColumn = Record<string, GswForms>;
