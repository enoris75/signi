import type { ConceptSeed } from './types.js';
import type { Definiteness, NounPhrase, PhrasePlan } from '@signi/shared';

// A manner-definition gloss the engine renders into every language: a *manner noun* phrase realised
// as the bare prepositional adverbial that defines an adverb, the adposition chosen by the noun's
// `mannerRelation` — mannerGloss('SPEED', 'bare', 'HIGH') → en "at high speed", fr "à vitesse haute",
// de "mit hoher Geschwindigkeit", ja "高い速さで"; mannerGloss('WAY', 'indefinite', 'GOOD') → "in a
// good way". Set as an adverb's `definition` to localize its picker tooltip (see the engines'
// mannerGloss render + Concept.mannerRelation).
const mannerGloss = (noun: string, definiteness: Definiteness, ...adjectives: string[]): PhrasePlan => ({
  subject: { concept: noun, definiteness, adjectives, mannerGloss: true },
});

// A place or direction gloss the engine renders into every language: a noun phrase realised as the
// locative or direction complement it names, by the same renderer a clause's complements take — so
// complementGloss('locative', 'PLACE', 'all', { number: 'plural' }) is "in all places" / "in tutti i
// luoghi" / すべての場所で exactly as "the cat eats in all places" says it after the verb, and a
// direction is the plain goal, "to a higher place" / "zu einem höheren Ort" / もっと高い場所へ. Set as
// an adverb's `definition` to localize its picker tooltip (see NounPhrase.complementGloss, C25).
const complementGloss = (
  type: 'locative' | 'direction',
  noun: string,
  definiteness: Definiteness,
  extra: Omit<NounPhrase, 'concept' | 'definiteness'> = {},
): PhrasePlan => ({
  subject: { concept: noun, definiteness, ...extra, complementGloss: { type } },
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
    //
    // Glossed as the place it happens in, "in a group" — Japanese グループで is how 一緒に is said
    // (localization C25).
    id: 'TOGETHER',
    role: 'adverb',
    description: 'with each other, in company',
    definition: complementGloss('locative', 'GROUP', 'indefinite'),
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
    definition: { subject: { concept: 'TIME', definiteness: 'many', number: 'plural', mannerGloss: true } },
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
    // One more time, after the first: a manner-position adverb like REPEATEDLY, which counts no
    // times at all. The console's help says a line applied again leaves the period as it is
    // (localization C22). The Romance languages say it with a fixed phrase ("di nuovo", "de
    // nouveau", "de nuevo", "de novo"), and Japanese with もう一度, one time more.
    id: 'AGAIN',
    role: 'adverb',
    description: 'one more time',
    definition: { subject: { concept: 'TIME', definiteness: 'indefinite', adjectives: ['OTHER'], mannerGloss: true } },
    emoji: '🔂',
    forms: {
      en: { base: 'again' },
      it: { base: 'di nuovo' },
      fr: { base: 'de nouveau' },
      de: { base: 'erneut' },
      es: { base: 'de nuevo' },
      ja: { base: 'もう一度', reading: 'もういちど' },
      pt: { base: 'de novo' },
    },
  },
  {
    // A manner adverb like REPEATEDLY, without a subtype: it follows the verb, and it is COLLAPSE's
    // differentia beside the ground it ends at, "to move to the ground suddenly" (localization B34).
    // Spanish and Portuguese say it with the fixed phrase "de repente". Glossed as WELL is, a `mode`
    // manner gloss: "in an unexpected way" — what is sudden is unexpected, not fast (localization C25).
    id: 'SUDDENLY',
    role: 'adverb',
    description: 'quickly and without warning',
    definition: mannerGloss('WAY', 'indefinite', 'UNEXPECTED'),
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
  {
    // Without error or approximation: SPECIFY's differentia, "to indicate exactly", the adverb that
    // tells it from EXPRESS's "to indicate concepts" (localization C28). A manner adverb like
    // SUDDENLY. French exactement, not précisément, which would echo SPECIFY's own préciser; German
    // genau, the word "genau bestimmen" is said with; Japanese 正確に, the adverbial of 正確.
    id: 'EXACTLY',
    role: 'adverb',
    description: 'without error or approximation',
    emoji: '🎯',
    forms: {
      en: { base: 'exactly' },
      it: { base: 'esattamente' },
      fr: { base: 'exactement' },
      de: { base: 'genau' },
      es: { base: 'exactamente' },
      ja: { base: '正確に', reading: 'せいかくに' },
      pt: { base: 'exatamente' },
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
  //
  // UP and DOWN are glossed as the goal their motion reaches, compared: "to a higher place", where "a
  // high place" would name a destination rather than a way (localization C25). French shares haut / bas
  // with its own "vers le haut", the cognate-dimension case STRONG's "of great strength" set.
  {
    id: 'UP',
    role: 'adverb',
    description: 'towards a higher position',
    definition: complementGloss('direction', 'PLACE', 'indefinite', { adjectives: ['HIGH'], adjectiveDegrees: ['more'] }),
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
    definition: complementGloss('direction', 'PLACE', 'indefinite', { adjectives: ['LOW'], adjectiveDegrees: ['more'] }),
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
  {
    // Out of a building, into the open: GO_OUT's differentia, "to go outside" (localization B61). A
    // direction like UP and DOWN, and a phrase in German and Portuguese ("nach draußen", "para
    // fora"). Spanish afuera is American usage, as the corpus's pt is Brazilian; Spain says fuera.
    //
    // Glossed as UP and DOWN are, the goal the motion reaches — "to a place that is not in a
    // building", the dictionaries' "not inside a building" as the place a relative clause says. It
    // names what none of UP, DOWN and EVERYWHERE does; the open air (all'aria aperta) reads in Italian
    // alone.
    id: 'OUTSIDE',
    role: 'adverb',
    description: 'out of a building or an enclosed place',
    definition: complementGloss('direction', 'PLACE', 'indefinite', {
      relative: {
        verbPhrase: { verb: 'BE', negative: true },
        complements: { locative: { phrase: { concept: 'BUILDING', definiteness: 'indefinite' } } },
      },
    }),
    emoji: '🌳',
    forms: {
      en: { base: 'outside', subtype: 'direction' },
      it: { base: 'fuori', subtype: 'direction' },
      fr: { base: 'dehors', subtype: 'direction' },
      de: { base: 'nach draußen', subtype: 'direction' },
      es: { base: 'afuera', subtype: 'direction' },
      ja: { base: '外に', subtype: 'direction', reading: 'そとに' },
      pt: { base: 'para fora', subtype: 'direction' },
    },
  },
  // The other two ways a key moves the cursor, or a box (localization B44): "go left", "move the slot
  // right". Directions like UP and DOWN, and a phrase in every language but English.
  //
  // Both stay on the literal by design: every gloss the corpus can compose either says "left" and
  // "right" again or is true of both alike ("to a side") (localization C25).
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
    // only say the order. Glossed "in the opposite direction", the locative of the way a thing moves
    // — not "to the back", which says "back" in English and "arrière" in French (localization C25).
    id: 'BACKWARDS',
    role: 'adverb',
    description: 'in the reverse direction or order',
    definition: complementGloss('locative', 'DIRECTION_SPACE', 'definite', { adjectives: ['OPPOSITE'] }),
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
    // partout", "come el ratón en todas partes"), where a manner adverb would lead it. Glossed as
    // exactly that locative, "in all places" (localization C25).
    id: 'EVERYWHERE',
    role: 'adverb',
    description: 'in every place',
    definition: complementGloss('locative', 'PLACE', 'all', { number: 'plural' }),
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
    definition: { subject: { concept: 'TIME', definiteness: 'this', mannerGloss: true } },
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
    // By this time, sooner than expected: "this command already has a value" (localization C21). It
    // sits where ALWAYS and NEVER sit — before the verb in English ("already has"), between the
    // auxiliary and the participle in a compound tense (it "ha già mangiato", fr "a déjà mangé", de
    // "hat schon gegessen") — so it shares their `frequency` subtype, which is a position, not a
    // meaning. German schon, the everyday word (bereits is the written one); Japanese もう.
    id: 'ALREADY',
    role: 'adverb',
    description: 'by this time; before now',
    definition: mannerGloss('TIME', 'indefinite', 'PREVIOUS'),
    emoji: '✔️',
    forms: {
      en: { base: 'already', subtype: 'frequency' },
      it: { base: 'già', subtype: 'frequency' },
      fr: { base: 'déjà', subtype: 'frequency' },
      de: { base: 'schon', subtype: 'frequency' },
      es: { base: 'ya', subtype: 'frequency' },
      ja: { base: 'もう', subtype: 'frequency' },
      pt: { base: 'já', subtype: 'frequency' },
    },
  },
  {
    // P09's still (localization B67), a focus adverb seeded as a verb adverb (P09 D4): up to now,
    // as before. ALREADY's `frequency` position — before the verb in English, between the auxiliary
    // and the participle in a compound tense. Its own gloss ("up to now") waits on a temporal
    // complement (C29). Seeded ahead of B67's other adverbs because B61's KEEP is glossed on it.
    id: 'STILL',
    role: 'adverb',
    description: 'up to now; as before',
    emoji: '⏸️',
    forms: {
      en: { base: 'still', subtype: 'frequency' },
      it: { base: 'ancora', subtype: 'frequency' },
      fr: { base: 'encore', subtype: 'frequency' },
      de: { base: 'noch', subtype: 'frequency' },
      es: { base: 'todavía', subtype: 'frequency' },
      ja: { base: 'まだ', subtype: 'frequency' },
      pt: { base: 'ainda', subtype: 'frequency' },
    },
  },
  {
    // A short time ago: NEW is "that has been made recently" (localization C24). No subtype — it
    // follows the verb and its object, and a compound tense keeps it after the participle ("has been
    // made recently", "è stato fatto di recente"). Italian di recente, the everyday form.
    id: 'RECENTLY',
    role: 'adverb',
    description: 'a short time ago',
    emoji: '🕐',
    forms: {
      en: { base: 'recently' },
      it: { base: 'di recente' },
      fr: { base: 'récemment' },
      de: { base: 'kürzlich' },
      es: { base: 'recientemente' },
      ja: { base: '最近', reading: 'さいきん' },
      pt: { base: 'recentemente' },
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
  {
    // Not any more: ADULT is "that no longer grows" (localization C24). A negative-polarity
    // frequency adverb, as NEVER is, so each language builds its own negation around it: it
    // "non … più", fr "ne … plus", ja もう〜ない, and es "ya no" / pt "já não" before the verb, where
    // NEVER's nunca stands, with no second "no".
    id: 'NO_LONGER',
    role: 'adverb',
    description: 'not any more; not now, as it was before',
    emoji: '🔚',
    forms: {
      en: { base: 'no longer', subtype: 'frequency', polarity: 'negative' },
      it: { base: 'più', subtype: 'frequency', polarity: 'negative' },
      fr: { base: 'plus', subtype: 'frequency', polarity: 'negative' },
      de: { base: 'nicht mehr', subtype: 'frequency', polarity: 'negative' },
      es: { base: 'ya no', subtype: 'frequency', polarity: 'negative' },
      ja: { base: 'もう', subtype: 'frequency', polarity: 'negative' },
      pt: { base: 'já não', subtype: 'frequency', polarity: 'negative' },
    },
  },
];
