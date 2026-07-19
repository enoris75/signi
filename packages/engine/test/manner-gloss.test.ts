import { describe, expect, test } from 'vitest';
import { np, sayAll } from './harness.js';

// The manner-definition gloss (C03): a *verbless* period marked `mannerGloss`, whose subject is a
// **manner noun** phrase realised as the bare prepositional adverbial that defines an adverb —
// FAST → "at high speed", WELL → "in a good way". The adposition is the one a `manner` complement
// picks from the head noun's `mannerRelation` (SPEED/TIME are `measure` → "at"; WAY is `mode` →
// "in"); unlike the dimension gloss the determiner is *kept*, so the phrase's own `definiteness`
// supplies "a good way" / "all times" / "no time". Japanese closes with the manner particle で
// (never が) and, having no articles, renders no determiner — see the quantifier note below.

const gloss = (mannerNoun: string, extra: Parameters<typeof np>[1]) =>
  sayAll({ subject: np(mannerNoun, { mannerGloss: true, ...extra }) });

describe('manner-definition gloss (C03 fragment)', () => {
  // FAST: SPEED (measure → "at") + HIGH, bare. The degree adjective agrees and is placed by the
  // ordinary NP path (Italian post-nominal "velocità alta"); the gloss only adds the adposition,
  // and Japanese closes with で on the attributive phrase (高い速さで), not the が-predicate.
  test('a measure noun with a degree, bare ("at high speed" — FAST)', () => {
    expect(gloss('SPEED', { definiteness: 'bare', adjectives: ['HIGH'] })).toEqual({
      en: 'at high speed.',
      it: 'a velocità alta.',
      fr: 'à vitesse haute.',
      es: 'a velocidad alta.',
      pt: 'a velocidade alta.',
      de: 'mit hoher Geschwindigkeit.', // means/measure → "mit" + dative (hohe → hoher)
      ja: '高い速さで。',
    });
  });

  // SLOWLY: SPEED + LOW. French agrees the feminine of "bas" correctly ("vitesse basse") — a
  // regression guard for bug A43 (which produced "base"), fixed before this construct landed.
  test('a measure noun, low pole ("at low speed" — SLOWLY)', () => {
    expect(gloss('SPEED', { definiteness: 'bare', adjectives: ['LOW'] })).toEqual({
      en: 'at low speed.',
      it: 'a velocità bassa.',
      fr: 'à vitesse basse.',
      es: 'a velocidad baja.',
      pt: 'a velocidade baixa.',
      de: 'mit niedriger Geschwindigkeit.',
      ja: '低い速さで。',
    });
  });

  // WELL: WAY (mode → "in") + GOOD, indefinite. The determiner is kept and fuses/elides by each
  // language's rules — French "de" + "une" → "d'une", Italian "buono" → "buon" before the noun,
  // German mode → "auf" + accusative ("eine gute Weise").
  test('a mode noun with a degree, indefinite ("in a good way" — WELL)', () => {
    expect(gloss('WAY', { definiteness: 'indefinite', adjectives: ['GOOD'] })).toEqual({
      en: 'in a good way.',
      it: 'in un buon modo.',
      fr: "d'une bonne manière.",
      es: 'de una manera buena.',
      pt: 'de uma maneira boa.',
      de: 'auf eine gute Weise.',
      ja: '良い方法で。',
    });
  });

  // No degree adjective: the fragment is the bare manner noun under its adposition, so the construct
  // degrades to "at speed" rather than dropping the preposition or throwing.
  test('a manner gloss with no degree renders the bare manner noun', () => {
    expect(gloss('SPEED', { definiteness: 'bare' })).toEqual({
      en: 'at speed.',
      it: 'a velocità.',
      fr: 'à vitesse.',
      es: 'a velocidad.',
      pt: 'a velocidade.',
      de: 'mit Geschwindigkeit.',
      ja: '速さで。',
    });
  });
});

describe('manner gloss: the quantifier determiner (ALWAYS / NEVER)', () => {
  // The frequency adverbs would gloss TIME (measure → "at") with a quantifier — "at all times" /
  // "at no time". Six languages render the quantifier, but Japanese has no articles and its NP path
  // emits no determiner, so both collapse to the same "時間で" — which is why ALWAYS/NEVER are held
  // back from a shipped definition until Japanese can distinguish them (they stay in C03).
  test('"at all times" renders the "all" quantifier outside Japanese (ALWAYS)', () => {
    expect(gloss('TIME', { definiteness: 'all', number: 'plural' })).toEqual({
      en: 'at all times.',
      it: 'a tutti i tempi.',
      fr: 'à tous les temps.',
      es: 'a todos los tiempos.',
      pt: 'a todos os tempos.',
      de: 'mit allen Zeiten.',
      ja: '時間で。', // no article: the "all" is lost — the JA gap that keeps ALWAYS in C03
    });
  });

  test('"at no time" renders the "no" quantifier outside Japanese (NEVER)', () => {
    expect(gloss('TIME', { definiteness: 'no' })).toEqual({
      en: 'at no time.',
      it: 'a nessun tempo.',
      fr: 'à aucun temps.',
      es: 'a ningún tiempo.',
      pt: 'a nenhum tempo.',
      de: 'mit keiner Zeit.',
      ja: '時間で。', // identical to ALWAYS in JA — the two are indistinguishable without a determiner
    });
  });
});
