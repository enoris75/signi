import { describe, expect, test } from 'vitest';
import { clause, el, FUREEZU, HITSUYOU_GA_ARU, KOTO_GA_DEKIRU, modal, NEKO, np, TABERU, vp } from './ja.fixtures.js';
import { isPotentialPassive } from './isPotentialPassive.js';

const passiveVp = (...modals: ReturnType<typeof modal>[]) =>
  vp(TABERU, { voice: 'passive', modals });

describe('isPotentialPassive', () => {
  test('an agentless passive under 〜ことができる takes the potential', () => {
    expect(isPotentialPassive(clause(np(FUREEZU), passiveVp(modal(KOTO_GA_DEKIRU))))).toBe(true);
  });

  test('a spoken agent keeps the 〜られる: the に phrase needs a verb to attach to', () => {
    const phrase = clause(np(FUREEZU), passiveVp(modal(KOTO_GA_DEKIRU)), { agent: el(np(NEKO)) });
    expect(isPotentialPassive(phrase)).toBe(false);
  });

  test('another modal does not absorb the voice', () => {
    expect(isPotentialPassive(clause(np(FUREEZU), passiveVp(modal(HITSUYOU_GA_ARU))))).toBe(false);
  });

  test('the potential has to be innermost — an obligation outside it stays outside', () => {
    const outer = passiveVp(modal(HITSUYOU_GA_ARU), modal(KOTO_GA_DEKIRU));
    expect(isPotentialPassive(clause(np(FUREEZU), outer))).toBe(true);
    const inner = passiveVp(modal(KOTO_GA_DEKIRU), modal(HITSUYOU_GA_ARU));
    expect(isPotentialPassive(clause(np(FUREEZU), inner))).toBe(false);
  });

  test('an active clause is never one, modal or not', () => {
    expect(isPotentialPassive(clause(np(FUREEZU), vp(TABERU, { modals: [modal(KOTO_GA_DEKIRU)] })))).toBe(false);
  });

  test('a verbless period has no voice to absorb', () => {
    expect(isPotentialPassive(clause(np(FUREEZU)))).toBe(false);
  });
});
