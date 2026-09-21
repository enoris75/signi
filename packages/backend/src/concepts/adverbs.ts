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
      // French puts its short adverbs BEFORE the non-finite verb they modify — "a bien mangé",
      // "doit bien manger", "en train de bien manger" — where a long -ment adverb follows it ("a
      // mangé lentement"). `pre_nonfinite` marks the class, so "mal", "mieux" and "trop" can join
      // it later without a word list in the engine (A155).
      fr: { base: 'bien', pre_nonfinite: '1' },
      de: { base: 'gut' },
      es: { base: 'bien' },
      ja: { base: 'よく' },
      pt: { base: 'bem' },
    },
  },
  {
    // Five languages have a true adverb here. The Spanish and Portuguese word is a predicative
    // adjective agreeing with the subject ("las gatas comen juntas"), so both carry the agreeing
    // masculine singular in `predicative` alongside the plural the picker cites (A162).
    id: 'TOGETHER',
    role: 'adverb',
    description: 'with each other, in company',
    emoji: '🤝',
    forms: {
      en: { base: 'together' },
      it: { base: 'insieme' },
      fr: { base: 'ensemble' },
      de: { base: 'zusammen' },
      es: { base: 'juntos', predicative: 'junto' },
      ja: { base: '一緒に', reading: 'いっしょに' },
      pt: { base: 'juntos', predicative: 'junto' },
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
    // A manner adverb like REPEATEDLY, without a subtype: it follows the verb, and it is COLLAPSE's
    // differentia beside the ground it ends at, "to move to the ground suddenly" (localization B34).
    // Spanish and Portuguese say it with the fixed phrase "de repente".
    id: 'SUDDENLY',
    role: 'adverb',
    description: 'quickly and without warning',
    emoji: '⚡',
    forms: {
      en: { base: 'suddenly' },
      it: { base: 'improvvisamente' },
      fr: { base: 'soudainement' },
      de: { base: 'plötzlich' },
      es: { base: 'de repente' },
      ja: { base: '突然', reading: 'とつぜん' },
      pt: { base: 'de repente' },
    },
  },
  // Which way a thing goes (B27: "move this period up"). A phrase in French, German and Portuguese,
  // which have no one-word adverb of direction: "vers le haut", "nach oben", "para cima".
  //
  // The `direction` subtype is what tells these apart from a manner adverb, which is the only other
  // thing a verb's `modifier` can be. A direction adverb says where the object ends up, so it stands
  // right after the object and before the complements — "moves the book up in the house", "sposta il
  // libro su" — where a manner adverb trails the whole clause in English and leads the object in
  // Romance (A142, A156).
  {
    id: 'UP',
    role: 'adverb',
    description: 'towards a higher position',
    emoji: '⬆️',
    forms: {
      en: { base: 'up', subtype: 'direction' },
      it: { base: 'su', subtype: 'direction' },
      fr: { base: 'vers le haut', subtype: 'direction' },
      de: { base: 'nach oben', subtype: 'direction' },
      es: { base: 'arriba', subtype: 'direction' },
      ja: { base: '上に', subtype: 'direction', reading: 'うえに' },
      pt: { base: 'para cima', subtype: 'direction' },
    },
  },
  {
    id: 'DOWN',
    role: 'adverb',
    description: 'towards a lower position',
    emoji: '⬇️',
    forms: {
      en: { base: 'down', subtype: 'direction' },
      it: { base: 'giù', subtype: 'direction' },
      fr: { base: 'vers le bas', subtype: 'direction' },
      de: { base: 'nach unten', subtype: 'direction' },
      es: { base: 'abajo', subtype: 'direction' },
      ja: { base: '下に', subtype: 'direction', reading: 'したに' },
      pt: { base: 'para baixo', subtype: 'direction' },
    },
  },
  // The other two ways a key moves the cursor, or a box (localization B44): "go left", "move the slot
  // right". Directions like UP and DOWN, and a phrase in every language but English.
  {
    id: 'LEFT',
    role: 'adverb',
    description: 'towards the left side',
    emoji: '⬅️',
    forms: {
      en: { base: 'left', subtype: 'direction' },
      it: { base: 'a sinistra', subtype: 'direction' },
      fr: { base: 'à gauche', subtype: 'direction' },
      de: { base: 'nach links', subtype: 'direction' },
      es: { base: 'a la izquierda', subtype: 'direction' },
      ja: { base: '左に', subtype: 'direction', reading: 'ひだりに' },
      pt: { base: 'para a esquerda', subtype: 'direction' },
    },
  },
  {
    id: 'RIGHT',
    role: 'adverb',
    description: 'towards the right side',
    emoji: '➡️',
    forms: {
      en: { base: 'right', subtype: 'direction' },
      it: { base: 'a destra', subtype: 'direction' },
      fr: { base: 'à droite', subtype: 'direction' },
      de: { base: 'nach rechts', subtype: 'direction' },
      es: { base: 'a la derecha', subtype: 'direction' },
      ja: { base: '右に', subtype: 'direction', reading: 'みぎに' },
      pt: { base: 'para a direita', subtype: 'direction' },
    },
  },
  {
    // The reverse way: what ⇧ does to a key that cycles a value ("Tense, backwards"), and the way one
    // walks backwards. A direction, so it follows the object as UP and DOWN do ("sposta il libro
    // all'indietro"). Japanese 逆方向に, "in the reverse direction", which says both; 逆順に would
    // only say the order.
    id: 'BACKWARDS',
    role: 'adverb',
    description: 'in the reverse direction or order',
    emoji: '↩️',
    forms: {
      en: { base: 'backwards', subtype: 'direction' },
      it: { base: "all'indietro", subtype: 'direction' },
      fr: { base: 'en arrière', subtype: 'direction' },
      de: { base: 'rückwärts', subtype: 'direction' },
      es: { base: 'hacia atrás', subtype: 'direction' },
      ja: { base: '逆方向に', subtype: 'direction', reading: 'ぎゃくほうこうに' },
      pt: { base: 'para trás', subtype: 'direction' },
    },
  },
  {
    // In every place: the keys that work wherever the cursor is, the help's first section (B41). An
    // adverb of place, which follows the object as a locative complement does ("mange la souris
    // partout", "come el ratón en todas partes"), where a manner adverb would lead it.
    id: 'EVERYWHERE',
    role: 'adverb',
    description: 'in every place',
    emoji: '🌍',
    forms: {
      en: { base: 'everywhere', subtype: 'place' },
      it: { base: 'ovunque', subtype: 'place' },
      fr: { base: 'partout', subtype: 'place' },
      de: { base: 'überall', subtype: 'place' },
      es: { base: 'en todas partes', subtype: 'place' },
      ja: { base: 'どこでも', subtype: 'place' },
      pt: { base: 'em toda parte', subtype: 'place' },
    },
  },
  {
    // At the present time: what a setting holds now, in the console's list ("now singular").
    // Japanese 今, not 現在, which is also the present tense's name (現在 現在 on the tense's row).
    id: 'NOW',
    role: 'adverb',
    description: 'at the present time',
    emoji: '⏱️',
    forms: {
      en: { base: 'now' },
      it: { base: 'ora' },
      fr: { base: 'maintenant' },
      de: { base: 'jetzt' },
      es: { base: 'ahora' },
      ja: { base: '今', reading: 'いま' },
      pt: { base: 'agora' },
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
