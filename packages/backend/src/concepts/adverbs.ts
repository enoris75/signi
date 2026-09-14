import type { ConceptSeed } from './types.js';
import type { Definiteness, PhrasePlan } from '@signi/shared';

// A manner-definition gloss the engine renders into every language: a *manner noun* phrase realised
// as the bare prepositional adverbial that defines an adverb, the adposition chosen by the noun's
// `mannerRelation` — mannerGloss('SPEED', 'bare', 'HIGH') → en "at high speed", fr "à vitesse haute",
// de "mit hoher Geschwindigkeit", ja "高い速さで"; mannerGloss('WAY', 'indefinite', 'GOOD') → "in a
// good way". Set as an adverb's `definition` to localize its picker tooltip (see the engines'
// mannerGloss render + Concept.mannerRelation).
const mannerGloss = (noun: string, definiteness: Definiteness, ...adjectives: string[]): PhrasePlan => ({
  subject: { concept: noun, definiteness, adjectives, mannerGloss: true },
});

// The frequency adverbs gloss TIME (measure → "at") with a quantifier determiner and no adjective:
// ALWAYS → "at all times" (plural), NEVER → "at no time". Japanese renders these すべての時間で and
// どの時間もない — the second via the どの…も…ない circumfix, which the ja engine composes from the
// `no` determiner (see the ja mannerGloss / npSegs negative-determiner path).
const frequencyGloss = (definiteness: Definiteness, number?: 'singular' | 'plural'): PhrasePlan => ({
  subject: { concept: 'TIME', definiteness, number, mannerGloss: true },
});

export const adverbs: ConceptSeed[] = [
  // ── ADVERBS ──────────────────────────────────────────────────────
  {
    id: 'FAST',
    role: 'adverb',
    description: 'at high speed',
    definition: mannerGloss('SPEED', 'bare', 'HIGH'),
    emoji: '⚡',
    forms: {
      en: { base: 'fast' },
      it: { base: 'velocemente' },
      fr: { base: 'vite' },
      de: { base: 'schnell' },
      es: { base: 'rápido' },
      ja: { base: '速く', reading: 'はやく' },
      pt: { base: 'rapidamente' },
    },
  },
  {
    id: 'SLOWLY',
    role: 'adverb',
    description: 'at low speed',
    definition: mannerGloss('SPEED', 'bare', 'LOW'),
    emoji: '🐢',
    forms: {
      en: { base: 'slowly' },
      it: { base: 'lentamente' },
      fr: { base: 'lentement' },
      de: { base: 'langsam' },
      es: { base: 'lentamente' },
      ja: { base: 'ゆっくり' },
      pt: { base: 'devagar' },
    },
  },
  {
    id: 'WELL',
    role: 'adverb',
    description: 'in a good or satisfactory way',
    definition: mannerGloss('WAY', 'indefinite', 'GOOD'),
    emoji: '✅',
    forms: {
      en: { base: 'well' },
      it: { base: 'bene' },
      fr: { base: 'bien' },
      de: { base: 'gut' },
      es: { base: 'bien' },
      ja: { base: 'よく' },
      pt: { base: 'bem' },
    },
  },
  {
    id: 'TOGETHER',
    role: 'adverb',
    description: 'with each other, in company',
    emoji: '🤝',
    forms: {
      en: { base: 'together' },
      it: { base: 'insieme' },
      fr: { base: 'ensemble' },
      de: { base: 'zusammen' },
      es: { base: 'juntos' },
      ja: { base: '一緒に', reading: 'いっしょに' },
      pt: { base: 'juntos' },
    },
  },
  {
    // A manner-position adverb, deliberately without the `frequency` subtype ALWAYS/NEVER carry: it
    // follows the verb like FAST ("to strike repeatedly"), rather than preceding it ("always eats").
    // French has no single-word form in common use, so it is the fixed phrase "à plusieurs reprises".
    id: 'REPEATEDLY',
    role: 'adverb',
    description: 'many times over',
    emoji: '🔁',
    forms: {
      en: { base: 'repeatedly' },
      it: { base: 'ripetutamente' },
      fr: { base: 'à plusieurs reprises' },
      de: { base: 'wiederholt' },
      es: { base: 'repetidamente' },
      ja: { base: '繰り返し', reading: 'くりかえし' },
      pt: { base: 'repetidamente' },
    },
  },
  {
    id: 'ALWAYS',
    role: 'adverb',
    description: 'at all times, on every occasion',
    definition: frequencyGloss('all', 'plural'),
    emoji: '♾️',
    forms: {
      en: { base: 'always', subtype: 'frequency' },
      it: { base: 'sempre', subtype: 'frequency' },
      fr: { base: 'toujours', subtype: 'frequency' },
      de: { base: 'immer', subtype: 'frequency' },
      es: { base: 'siempre', subtype: 'frequency' },
      ja: { base: 'いつも', subtype: 'frequency' },
      pt: { base: 'sempre', subtype: 'frequency' },
    },
  },
  {
    id: 'NEVER',
    role: 'adverb',
    description: 'at no time, not ever',
    definition: frequencyGloss('no'),
    emoji: '🚫',
    forms: {
      en: { base: 'never', subtype: 'frequency', polarity: 'negative' },
      it: { base: 'mai', subtype: 'frequency', polarity: 'negative' },
      fr: { base: 'jamais', subtype: 'frequency', polarity: 'negative' },
      de: { base: 'nie', subtype: 'frequency', polarity: 'negative' },
      es: { base: 'nunca', subtype: 'frequency', polarity: 'negative' },
      ja: { base: '決して', subtype: 'frequency', polarity: 'negative', reading: 'けっして' },
      pt: { base: 'nunca', subtype: 'frequency', polarity: 'negative' },
    },
  },
];
