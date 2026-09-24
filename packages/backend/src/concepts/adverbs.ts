import type { ConceptSeed } from './types.js';
import type { Definiteness, NounPhrase, PhrasePlan, TemporalRelation } from '@signi/shared';

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

// A time gloss the engine renders into every language: a noun phrase realised as the `temporal`
// complement, by the renderer a clause's complements take — temporalGloss('at', 'DAY', 'this') is
// "on this day" / "in questo giorno" / "an diesem Tag" / この日に, exactly as "the cat eats on this
// day" says it after the verb, and temporalGloss('ago', 'MOMENT', 'indefinite') is "a moment ago" /
// "un momento fa" / "vor einem Augenblick" / "il y a un instant". The relation rides as the
// complement's specifier, the way a place gloss carries a `path` one (C29, P09 §3 E3).
const temporalGloss = (
  relation: TemporalRelation,
  noun: string,
  definiteness: Definiteness,
  extra: Omit<NounPhrase, 'concept' | 'definiteness'> = {},
): PhrasePlan => ({
  subject: {
    concept: noun,
    definiteness,
    ...extra,
    complementGloss: { type: 'temporal', specifiers: [{ kind: 'temporal', value: relation }] },
  },
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
    // P09-E24's once (localization B80): one time, and no more. No `frequency` subtype, though it
    // counts times as ALWAYS does: English puts a frequency adverb before the verb, and "the cat once
    // ran" is the *formerly* sense (un tempo, autrefois, einst, かつて), another concept. Without one it
    // follows the verb in all seven, "the cat ran once", as AGAIN does.
    //
    // Left on the English literal by design: "at a sole time" is stilted (SOLE is "the only one"),
    // and the numeral on TIME ("at one time") drops or garbles the count in German, Spanish and
    // Portuguese. See docs/localization/done/B80-minute-morning-later-once-often.md.
    id: 'ONCE',
    role: 'adverb',
    description: 'one time only',
    emoji: '1️⃣',
    forms: {
      en: { base: 'once' },
      it: { base: 'una volta' },
      fr: { base: 'une fois' },
      de: { base: 'einmal' },
      es: { base: 'una vez' },
      ja: { base: '一度', reading: 'いちど' },
      pt: { base: 'uma vez' },
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
    //
    // Being somewhere is a locative too, so BE takes estar with it ("está en todas partes"), and
    // Japanese says the place with the に its verb gives a place where it gives one: `locative_ni`,
    // どこにでもいます, どこにでも住みます, beside どこでも食べます (localization B67).
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
      ja: { base: 'どこでも', subtype: 'place', locative_ni: 'どこにでも' },
      pt: { base: 'em toda parte', subtype: 'place' },
    },
  },
  // P09's here and there (localization B67), place adverbs like EVERYWHERE: after the object, where a
  // locative complement stands. HERE is glossed as EVERYWHERE is, with NOW's deixis: "in this place".
  // THERE's "in that place" is the same gloss one demonstrative along, and marked `contrastive`,
  // because the distance *is* the meaning here: without it French says "dans ce lieu" for both, its
  // single ce series covering this and that, and THERE would be HERE (localization C40). Spanish allí
  // and Portuguese ali, the far series; ahí and aí pair with ese and esse. Japanese ここで and そこで
  // are the place an act goes on in; being or living there is ここに, そこに (`locative_ni`, as
  // EVERYWHERE's).
  {
    id: 'HERE',
    role: 'adverb',
    description: 'in this place',
    definition: complementGloss('locative', 'PLACE', 'this'),
    emoji: '📍',
    forms: {
      en: { base: 'here', subtype: 'place' },
      it: { base: 'qui', subtype: 'place' },
      fr: { base: 'ici', subtype: 'place' },
      de: { base: 'hier', subtype: 'place' },
      es: { base: 'aquí', subtype: 'place' },
      ja: { base: 'ここで', subtype: 'place', locative_ni: 'ここに' },
      pt: { base: 'aqui', subtype: 'place' },
    },
  },
  {
    id: 'THERE',
    role: 'adverb',
    description: 'in that place',
    definition: complementGloss('locative', 'PLACE', 'that', { contrastive: true }),
    emoji: '👈',
    forms: {
      en: { base: 'there', subtype: 'place' },
      it: { base: 'lì', subtype: 'place' },
      fr: { base: 'là', subtype: 'place' },
      de: { base: 'dort', subtype: 'place' },
      es: { base: 'allí', subtype: 'place' },
      ja: { base: 'そこで', subtype: 'place', locative_ni: 'そこに' },
      pt: { base: 'ali', subtype: 'place' },
    },
  },
  {
    // P09-E24's far, the adverb (localization B89): a place adverb like HERE and THERE, after the
    // object. Not FAR's adverb form — the adjective is lontano / lointain / fern / 遠い, the adverb
    // lontano / loin / weit weg / 遠く — so it is a concept of its own, named for the phrase English
    // says. Glossed HERE's way with FAR for the deixis: "in a far place". Japanese 遠くで is the place
    // an act goes on in, and being or living far away is 遠くに (`locative_ni`, as HERE's).
    id: 'FAR_AWAY',
    role: 'adverb',
    description: 'at or to a great distance',
    definition: complementGloss('locative', 'PLACE', 'indefinite', { adjectives: ['FAR'] }),
    emoji: '🔭',
    forms: {
      en: { base: 'far away', subtype: 'place' },
      it: { base: 'lontano', subtype: 'place' },
      fr: { base: 'loin', subtype: 'place' },
      de: { base: 'weit weg', subtype: 'place' },
      es: { base: 'lejos', subtype: 'place' },
      ja: { base: '遠くで', subtype: 'place', reading: 'とおくで', locative_ni: '遠くに', locative_ni_reading: 'とおくに' },
      pt: { base: 'longe', subtype: 'place' },
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
    // P09's today (localization B59). A time adverb, positioned as NOW is. Its gloss is the temporal
    // complement C29 built, at the `at` relation: "on this day", where the preposition is the day's
    // own in English, German and French (en "on", de "an", fr "en") and the generic one elsewhere.
    // Japanese 今日 is the fused deictic word, reading きょう.
    id: 'TODAY',
    role: 'adverb',
    description: 'on this present day',
    definition: temporalGloss('at', 'DAY', 'this'),
    emoji: '🌅',
    forms: {
      en: { base: 'today' },
      it: { base: 'oggi' },
      fr: { base: "aujourd'hui" },
      de: { base: 'heute' },
      es: { base: 'hoy' },
      ja: { base: '今日', reading: 'きょう' },
      pt: { base: 'hoje' },
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
    // Under a negation it is *not yet* (P09-E28): "has not eaten yet" at the end in English, "noch
    // nicht" / "ainda não" / "todavía no" ahead of the negator (the Spanish "no" stays, where
    // *tampoco* absorbs it), *ancora* and *encore* in place. Japanese まだ also puts the denied verb
    // in 〜ている (`negative_aspect`): まだ食べていません, where もう食べていません is "no longer".
    forms: {
      en: { base: 'already', subtype: 'frequency', negative: 'yet', negative_slot: 'final' },
      it: { base: 'già', subtype: 'frequency', negative: 'ancora' },
      fr: { base: 'déjà', subtype: 'frequency', negative: 'encore' },
      de: { base: 'schon', subtype: 'frequency', negative: 'noch', negative_slot: 'pre-negator' },
      es: { base: 'ya', subtype: 'frequency', negative: 'todavía', negative_slot: 'pre-negator' },
      ja: { base: 'もう', subtype: 'frequency', negative: 'まだ', negative_aspect: 'resultative' },
      pt: { base: 'já', subtype: 'frequency', negative: 'ainda', negative_slot: 'pre-negator' },
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
    // "up to this time" — C29's `until` relation on TIME. It is NOW's noun and determiner, and the
    // "fino a" / "bis zu" / まで is the whole of what keeps the two glosses apart, which is exactly
    // what B67 found missing: NOW is "a questo tempo", STILL "fino a questo tempo".
    definition: temporalGloss('until', 'TIME', 'this'),
    emoji: '⏸️',
    // STILL scopes OVER a negation — "still does not" is what the plan means, not "does not still"
    // (A244). Three languages mark that scope in the surface: English puts the adverb ahead of the
    // whole negated group, German ahead of "nicht", and French both ahead of "pas" and on a second
    // lexeme (*ne … pas encore* is "not yet", the wrong reading). Italian, Spanish, Portuguese and
    // Japanese read right where the adverb already stands, and name neither key.
    forms: {
      en: { base: 'still', subtype: 'frequency', negative_slot: 'pre-negation' },
      it: { base: 'ancora', subtype: 'frequency' },
      fr: { base: 'encore', subtype: 'frequency', negative: 'toujours', negative_slot: 'pre-negator' },
      de: { base: 'noch', subtype: 'frequency', negative_slot: 'pre-negator' },
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
    // P09-E24's later (localization B80): at a time after this one. No subtype, as NOW has none, so it
    // follows the verb ("the cat runs later", "il gatto corre più tardi"). Glossed on C29's `after`
    // relation on TIME with NOW's deixis — "after this time" — beside NOW's "at this time" and
    // ALREADY's "at a previous time".
    id: 'LATER',
    role: 'adverb',
    description: 'at a time after the present one',
    definition: temporalGloss('after', 'TIME', 'this'),
    emoji: '⏭️',
    forms: {
      en: { base: 'later' },
      it: { base: 'più tardi' },
      fr: { base: 'plus tard' },
      de: { base: 'später' },
      es: { base: 'más tarde' },
      ja: { base: '後で', reading: 'あとで' },
      pt: { base: 'mais tarde' },
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
    // P09-E24's often (localization B80): a frequency adverb like ALWAYS, before the verb in English
    // and between the auxiliary and the participle. REPEATEDLY already ships "at many times", so
    // OFTEN is glossed as the locative on B65's CASE_INSTANCE, EVERYWHERE's shape under `many`: "in
    // many cases". Portuguese frequentemente, not the phrase "muitas vezes"; Japanese よく.
    id: 'OFTEN',
    role: 'adverb',
    description: 'many times; in many cases',
    definition: complementGloss('locative', 'CASE_INSTANCE', 'many', { number: 'plural' }),
    emoji: '🔄',
    forms: {
      en: { base: 'often', subtype: 'frequency' },
      it: { base: 'spesso', subtype: 'frequency' },
      fr: { base: 'souvent', subtype: 'frequency' },
      de: { base: 'oft', subtype: 'frequency' },
      es: { base: 'a menudo', subtype: 'frequency' },
      ja: { base: 'よく', subtype: 'frequency' },
      pt: { base: 'frequentemente', subtype: 'frequency' },
    },
  },
  {
    id: 'NEVER',
    role: 'adverb',
    description: 'at no time, not ever',
    definition: frequencyGloss('no'),
    emoji: '🚫',
    // Asked, and not denied, it is *ever* (P09-E28, `interrogativeAdverb`): a positive word in the
    // same slot. Japanese has no adverb for it — 〜たことがある is a verb construction, deferred —
    // and asks with いつか "at some time" meanwhile.
    forms: {
      en: { base: 'never', subtype: 'frequency', polarity: 'negative', interrogative: 'ever' },
      it: { base: 'mai', subtype: 'frequency', polarity: 'negative', interrogative: 'mai' },
      fr: { base: 'jamais', subtype: 'frequency', polarity: 'negative', interrogative: 'déjà' },
      de: { base: 'nie', subtype: 'frequency', polarity: 'negative', interrogative: 'je' },
      es: { base: 'nunca', subtype: 'frequency', polarity: 'negative', interrogative: 'alguna vez' },
      ja: { base: '決して', subtype: 'frequency', polarity: 'negative', reading: 'けっして', interrogative: 'いつか' },
      pt: { base: 'nunca', subtype: 'frequency', polarity: 'negative', interrogative: 'alguma vez' },
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
      // Spanish and Portuguese say it with the negator itself, behind "ya" / "já": where the clause
      // writes its own "no" (an infinitive, a command, the group a modal governs) the lead stands in
      // front of it and the adverb is not said again — "ya no correr", never "no correr ya no"
      // (`negator_lead`, localization B84).
      es: { base: 'ya no', subtype: 'frequency', polarity: 'negative', negator_lead: 'ya' },
      ja: { base: 'もう', subtype: 'frequency', polarity: 'negative' },
      pt: { base: 'já não', subtype: 'frequency', polarity: 'negative', negator_lead: 'já' },
    },
  },
  // ── P09's focus adverbs (localization B67) ───────────────────────
  // Seeded as verb adverbs (P09 D4) in ALREADY's `frequency` position: before the verb in English,
  // between the auxiliary and the participle in a compound tense. Their scope over a noun ("only the
  // cat", 猫だけ) is a focus particle the engine lacks (C39), and so is EVEN, which Japanese has no
  // verb adverb for (さえ), so it is not seeded.
  {
    // A moment ago, with a past or compound verb: in a simple present "just" is "merely". fr/pt have
    // no adverb of recency and say it with their "ago" phrase, which keeps the default position
    // after the verb. German soeben, since gerade is the engine's progressive (C05).
    //
    // Spanish said it that way too — *hace un momento* — until C29 gave the concept its gloss, which
    // is built from MOMENT and the `ago` relation and so renders *hace un momento* character for
    // character: the tooltip would have repeated the word. B67 named *recién* as the fallback for
    // exactly this, and it is a true adverb, so it takes the `frequency` position the other six
    // have ("el gato recién corre") — which is where American Spanish puts it. Peninsular Spanish
    // prefers the *acabar de* periphrasis, which the engine cannot build.
    id: 'JUST',
    role: 'adverb',
    description: 'a moment ago',
    // C29's `ago` relation on MOMENT, seeded with it: a moment back from now, which is not
    // ALREADY's "at a previous time" nor the previous moment (the one before another moment).
    definition: temporalGloss('ago', 'MOMENT', 'indefinite'),
    emoji: '⏮️',
    forms: {
      en: { base: 'just', subtype: 'frequency' },
      it: { base: 'appena', subtype: 'frequency' },
      fr: { base: "à l'instant" },
      de: { base: 'soeben', subtype: 'frequency' },
      es: { base: 'recién', subtype: 'frequency' },
      ja: { base: 'たった今', subtype: 'frequency', reading: 'たったいま' },
      pt: { base: 'há pouco' },
    },
  },
  {
    // Likewise, in addition. "In the same way" is its first dictionary sense (Merriam-Webster's
    // "likewise", Duden's "in gleicher Weise"), WELL's `mode` gloss on SAME. Japanese 同じく, not また,
    // which reads "again" (B46).
    id: 'ALSO',
    role: 'adverb',
    description: 'likewise; in addition',
    definition: mannerGloss('WAY', 'definite', 'SAME'),
    emoji: '➕',
    // The additive scopes over a negation too, and six languages have a separate word for it there:
    // postposed "either", *neanche*, *non plus*, *tampoco*, and the fixed orders "auch nicht" and
    // "também não" (A245). Spanish's is preverbal and carries the negation itself, so the clause's
    // own "no" gives way to it, as it does to *nunca*. Japanese 同じく reads right as it stands.
    forms: {
      en: { base: 'also', subtype: 'frequency', negative: 'either', negative_slot: 'final' },
      it: { base: 'anche', subtype: 'frequency', negative: 'neanche' },
      fr: { base: 'aussi', subtype: 'frequency', negative: 'non plus' },
      de: { base: 'auch', subtype: 'frequency', negative_slot: 'pre-negator' },
      es: { base: 'también', subtype: 'frequency', negative: 'tampoco', negative_slot: 'pre-negation' },
      ja: { base: '同じく', subtype: 'frequency', reading: 'おなじく' },
      pt: { base: 'também', subtype: 'frequency', negative_slot: 'pre-negator' },
    },
  },
  {
    // And nothing more. Its gloss needs "nothing" (C32). Japanese ただ, the adverb; the particle だけ
    // on a noun is C39's.
    id: 'ONLY',
    role: 'adverb',
    description: 'and nothing more',
    emoji: '☝️',
    forms: {
      en: { base: 'only', subtype: 'frequency' },
      it: { base: 'solo', subtype: 'frequency' },
      fr: { base: 'seulement', subtype: 'frequency' },
      de: { base: 'nur', subtype: 'frequency' },
      es: { base: 'solo', subtype: 'frequency' },
      ja: { base: 'ただ', subtype: 'frequency' },
      pt: { base: 'só', subtype: 'frequency' },
    },
  },
  {
    // In fact, truly: glossed "in reality", the locative of its own noun, as STRONG is "of great
    // strength". The intensifier ("really big") is VERY's construct (E8), not this concept.
    id: 'REALLY',
    role: 'adverb',
    description: 'in fact; truly',
    definition: complementGloss('locative', 'REALITY', 'bare'),
    emoji: '💯',
    forms: {
      en: { base: 'really', subtype: 'frequency' },
      it: { base: 'davvero', subtype: 'frequency' },
      fr: { base: 'vraiment', subtype: 'frequency' },
      de: { base: 'wirklich', subtype: 'frequency' },
      es: { base: 'realmente', subtype: 'frequency' },
      ja: { base: '本当に', subtype: 'frequency', reading: 'ほんとうに' },
      pt: { base: 'realmente', subtype: 'frequency' },
    },
  },

  // ── SENTENCE ADVERBS ─────────────────────────────────────────────────
  // P09-E39: adverbs that comment on the whole clause and stand outside its negation — "maybe the
  // cat did not eat", never "did not maybe eat". `subtype: 'sentence'` opens a main statement in the
  // European languages (German as the first constituent, inverting: *vielleicht fraß der Kater*) and
  // follows the topic in Japanese; anywhere else — a question, a subordinate clause — it stands where
  // a frequency adverb does ("did the cat maybe eat?"), and `negative_slot` keeps it outside a
  // negation there, as STILL's does ("…that the cat maybe does not eat", *vielleicht nicht*,
  // *ne mange peut-être pas*, *forse non*, *quizás no*). `fronted` names what joins a fronted adverb
  // to its clause: `que` (*peut-être que*, *claro que*) or a `comma` ("actually, the cat…"). REALLY
  // is not one of them: "does not really eat" is its scope inside the negation (E39 *Today*).
  //
  // ACTUALLY, MAYBE and OF_COURSE are literal by design: E24 probed their leads — "in a possible way"
  // reads as *possible*, "in fact" as *in Tatsache* / *en hecho*. PROBABLY is glossed (below).
  {
    // Perhaps, possibly. Portuguese *talvez* ahead of its verb puts it in the subjunctive (`mood`):
    // *talvez o gato não tenha comido*, where Spanish *quizás* keeps the indicative (E39 D2).
    id: 'MAYBE',
    role: 'adverb',
    description: 'perhaps; it is possible that',
    emoji: '🤷',
    forms: {
      en: { base: 'maybe', subtype: 'sentence', negative_slot: 'pre-negation' },
      it: { base: 'forse', subtype: 'sentence', negative_slot: 'pre-negator' },
      fr: { base: 'peut-être', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'que' },
      de: { base: 'vielleicht', subtype: 'sentence', negative_slot: 'pre-negator' },
      es: { base: 'quizás', subtype: 'sentence', negative_slot: 'pre-negator' },
      ja: { base: 'もしかすると', subtype: 'sentence' },
      pt: { base: 'talvez', subtype: 'sentence', negative_slot: 'pre-negator', mood: 'subjunctive' },
    },
  },
  {
    // Glossed on PROBABILITY, seeded with it: "with high probability" / "mit hoher Wahrscheinlichkeit"
    // / 高い確率で. French writes it "avec probabilité haute", the corpus's postposed HIGH as FAST's
    // "à vitesse haute" does.
    id: 'PROBABLY',
    role: 'adverb',
    description: 'very likely; almost certainly',
    definition: mannerGloss('PROBABILITY', 'bare', 'HIGH'),
    emoji: '🎲',
    forms: {
      en: { base: 'probably', subtype: 'sentence', negative_slot: 'pre-negation' },
      it: { base: 'probabilmente', subtype: 'sentence', negative_slot: 'pre-negator' },
      fr: { base: 'probablement', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
      de: { base: 'wahrscheinlich', subtype: 'sentence', negative_slot: 'pre-negator' },
      es: { base: 'probablemente', subtype: 'sentence', negative_slot: 'pre-negator' },
      ja: { base: 'たぶん', subtype: 'sentence' },
      pt: { base: 'provavelmente', subtype: 'sentence', negative_slot: 'pre-negator' },
    },
  },
  {
    // In fact, contrary to what one might think — not REALLY's "truly", which scopes inside a
    // negation. Japanese 実は, the "the truth is" that opens a statement.
    id: 'ACTUALLY',
    role: 'adverb',
    description: 'in fact; contrary to what one might think',
    emoji: '💡',
    forms: {
      en: { base: 'actually', subtype: 'sentence', negative_slot: 'pre-negation', fronted: 'comma' },
      it: { base: 'in realtà', subtype: 'sentence', negative_slot: 'pre-negator' },
      fr: { base: 'en fait', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
      de: { base: 'eigentlich', subtype: 'sentence', negative_slot: 'pre-negator' },
      es: { base: 'en realidad', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
      ja: { base: '実は', subtype: 'sentence', reading: 'じつは' },
      pt: { base: 'na verdade', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
    },
  },
  {
    // Naturally, as expected. Portuguese *claro* fronted takes *que* (*claro que o gato…*); bare, it
    // is the interjection "sure!".
    id: 'OF_COURSE',
    role: 'adverb',
    description: 'naturally; as one would expect',
    emoji: '👌',
    forms: {
      en: { base: 'of course', subtype: 'sentence', negative_slot: 'pre-negation' },
      it: { base: 'naturalmente', subtype: 'sentence', negative_slot: 'pre-negator' },
      fr: { base: 'bien sûr', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
      de: { base: 'natürlich', subtype: 'sentence', negative_slot: 'pre-negator' },
      es: { base: 'por supuesto', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
      ja: { base: 'もちろん', subtype: 'sentence' },
      pt: { base: 'claro', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'que' },
    },
  },

  // ── INTENSIFIERS ─────────────────────────────────────────────────────
  // P09's *very* and *too* (localization C33): adverbs that modify an **adjective**, never a verb.
  // "The cat runs very" is not a sentence in any of the seven, so they are flagged `intensifier` and
  // the adverb picker leaves them out, exactly as the verb picker leaves out a `modal`; what they
  // fill is a noun phrase's `adjectiveIntensifiers` / `headIntensifier`.
  //
  // Where the word goes is its own, not the adjective's, so each lexeme names it (`position`): six
  // languages and pt *muito* lead the adjective, pt *demais* follows it (*grande demais*), and
  // Japanese has no word for TOO at all — 〜すぎる is a suffix on the adjective's stem (大きすぎる),
  // which then inflects as the ichidan verb it is (see `jaComparisonAdj`, `jaAdjClass`'s ru class).
  {
    id: 'VERY',
    role: 'adverb',
    slot: 'intensifier',
    description: 'to a great degree',
    // The direction complement UP is glossed with, on LEVEL rather than PLACE: "to a high level"
    // (C25's `complementGloss`). TOO's "to an excessive level" has no word in the corpus and stays
    // on the literal — see docs/localization/done/C33-degree-adverbs-on-adjectives.md.
    definition: complementGloss('direction', 'LEVEL', 'indefinite', { adjectives: ['HIGH'] }),
    emoji: '🔺',
    // A comparative is intensified by a word of its own — "much bigger", "bien plus grand", "viel
    // größer", "mucho más grande", ずっと大きい — which `applyIntensifier` puts in place of `base` on
    // a `more` or `less` degree (A248). Italian and Portuguese keep molto / muito ("molto più grande").
    // On the equative VERY is exactness, a word that replaces the degree's own: "just as big",
    // "altrettanto grande", "tout aussi grand", "genauso groß" (A255). Spanish *igual de* already is
    // "just as", so VERY keeps it even before a standard ("igual de grande que el perro", where the
    // bare circumfix is "tan … como"); Portuguese and Japanese have none that is not a paraphrase,
    // so there it is dropped. English drops it before a noun ("an equally big cat", never "a just as
    // big cat").
    // On a superlative VERY is a phrase that stands before the article: "by far the biggest", "di
    // gran lunga il più grande", "bei weitem am größten" (A257) — except English before a noun, "the
    // very biggest cat", where VERY after the article is the superlative's own intensifier.
    forms: {
      en: {
        base: 'very', comparative: 'much', equative: 'just as', superlative: 'by far',
        attributive_drop_degrees: 'equally', attributive_plain_degrees: 'most,least',
      },
      it: { base: 'molto', equative: 'altrettanto', superlative: 'di gran lunga' },
      fr: { base: 'très', comparative: 'bien', equative: 'tout aussi', superlative: 'de loin' },
      de: { base: 'sehr', comparative: 'viel', equative: 'genauso', superlative: 'bei weitem' },
      es: { base: 'muy', comparative: 'mucho', equative: 'igual de', superlative: 'con mucho' },
      // Dropped on `less`: the lowered degree is a negation in Japanese (それほど大きくない), not a
      // comparative ずっと could intensify, and とても inside it reads "not very" (A258).
      ja: {
        base: 'とても', comparative: 'ずっと', drop_degrees: 'equally,less',
        superlative: '断然', superlative_reading: 'だんぜん',
      },
      pt: { base: 'muito', drop_degrees: 'equally', superlative: 'de longe' },
    },
  },
  {
    id: 'TOO',
    role: 'adverb',
    slot: 'intensifier',
    description: 'to a degree that is more than is wanted',
    emoji: '🔝',
    // On a comparative TOO says the difference is excessive — "too much bigger", "zu viel größer" —
    // TOO on the comparative's own intensifier (A256). Italian and Spanish already say it with the
    // plain word ("troppo più grande", "demasiado más grande"); Portuguese's postposed *demais*
    // belongs to the positive, and a comparative takes the preposed *demasiado*; Japanese keeps
    // 〜すぎる and drops もっと under it (大きすぎる), as its standard already does. French has no
    // settled form and keeps "trop plus grand".
    forms: {
      en: { base: 'too', comparative: 'too much' },
      it: { base: 'troppo' },
      fr: { base: 'trop' },
      de: { base: 'zu', comparative: 'zu viel' },
      es: { base: 'demasiado' },
      // Not a word before the adjective: the ichidan suffix 〜すぎる on its stem.
      ja: { base: 'すぎる', position: 'suffix', comparative: 'すぎる', comparative_degrees: 'more' },
      pt: { base: 'demais', position: 'post', comparative: 'demasiado', comparative_position: 'pre' },
    },
  },
  {
    // P09-E24's *a little* (localization B89), VERY's counterpart on the scale: an intensifier, so it
    // modifies an adjective ("a little tired", "un po' stanco", "ein bisschen müde", 少し疲れている).
    // Glossed as VERY is with LOW for HIGH: "to a low level". On a verb ("runs a little") it would
    // need a second use of the slot, not planned.
    //
    // Before a noun English and German take another word (`attributive`): "a slightly big cat", "ein
    // etwas großer Kater", where "an a little big cat" and "ein ein bisschen großer Kater" stack two
    // articles. A comparative keeps the word in six languages ("a little bigger", "un po' più
    // grande", "ein bisschen größer"); Japanese says 少し大きい with no もっと, so 少し is its own
    // comparative word (`comparative`, as VERY's ずっと). It is not said on an equative or a
    // superlative in any of the seven ("*a little as big", "*a little the biggest"), nor on the
    // Japanese lowered degree, which is a negation (それほど大きくない).
    id: 'A_LITTLE',
    role: 'adverb',
    slot: 'intensifier',
    description: 'to a small degree; somewhat',
    definition: complementGloss('direction', 'LEVEL', 'indefinite', { adjectives: ['LOW'] }),
    emoji: '🤏',
    forms: {
      en: { base: 'a little', attributive: 'slightly', drop_degrees: 'equally,most,least' },
      it: { base: "un po'", drop_degrees: 'equally,most,least' },
      fr: { base: 'un peu', drop_degrees: 'equally,most,least' },
      de: { base: 'ein bisschen', attributive: 'etwas', drop_degrees: 'equally,most,least' },
      es: { base: 'un poco', drop_degrees: 'equally,most,least' },
      ja: {
        base: '少し', reading: 'すこし', comparative: '少し', comparative_reading: 'すこし',
        comparative_degrees: 'more', drop_degrees: 'equally,less,most,least',
      },
      pt: { base: 'um pouco', drop_degrees: 'equally,most,least' },
    },
  },
];
