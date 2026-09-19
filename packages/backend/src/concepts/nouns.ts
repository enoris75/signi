import type { ConceptSeed } from './types.js';
import type { PhrasePlan } from '@signi/shared';

// A genus-differentia gloss the engine renders into every language: an indefinite noun phrase
// whose head is the genus (usually the concept's own hypernym) carrying differentia adjectives —
// glossOf('MAMMAL', 'SMALL') → en "a small mammal", it "un piccolo mammifero", de "ein kleines
// Säugetier", ja "小さい哺乳類". Set as a concept's `definition` to localize its picker tooltip
// without hand-writing a literal per language (see ConceptSeed.definition).
const glossOf = (genus: string, ...adjectives: string[]): PhrasePlan => ({
  subject: { concept: genus, definiteness: 'indefinite', adjectives },
});

// A genus + subject-gap relative-clause gloss: an indefinite head noun restricted by a relative
// clause whose subject the head fills — whoGloss('PERSON', 'MAKE', 'OBJECT_THING') → en "a person
// who makes objects", it "una persona che fa oggetti", de "eine Person, die Gegenstände macht", ja
// "物体を作る人". The optional object renders as a bare plural ("objects", not "the objects").
const whoGloss = (genus: string, verb: string, object?: string): PhrasePlan => ({
  subject: {
    concept: genus,
    definiteness: 'indefinite',
    relative: {
      verbPhrase: { verb },
      ...(object ? { directObject: { concept: object, definiteness: 'bare', number: 'plural' } } : {}),
    },
  },
});

// A patient gloss: a genus restricted by an object-gap relative clause whose subject is the
// generic/impersonal "one" — the head is what the action is done *to*, not what does it.
// patientGloss('OBJECT_THING', 'EAT') → en "an object that one eats", it "un oggetto che si
// mangia", fr "un objet qu'on mange", de "ein Gegenstand, den man isst", ja "食べる物体". The
// GENERIC_PERSON subject renders as a placed word (en/de/fr) or an impersonal clitic (it/es/pt),
// and drops in Japanese — see its seed and isGenericSubject in the engine.
const patientGloss = (genus: string, verb: string): PhrasePlan => ({
  subject: {
    concept: genus,
    definiteness: 'indefinite',
    relative: {
      headRole: 'directObject',
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb },
    },
  },
});

// A place gloss: a genus restricted by a *locative*-gap relative clause — the head is where the
// action happens, not who does it or what it is done to, and the clause carries its own generic
// subject. whereGloss('PLACE', 'EAT') → en "a place where one eats", it "un luogo dove si mangia",
// fr "un lieu où l'on mange", de "ein Ort, in dem man isst", ja "食べる場所". The verb must license a
// `locative` complement. The optional object renders as a bare plural, as in whoGloss. Added for
// B32; the engine side that renders the relative adverb is C07.
const whereGloss = (genus: string, verb: string, object?: string): PhrasePlan => ({
  subject: {
    concept: genus,
    definiteness: 'indefinite',
    relative: {
      headRole: 'locative',
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb },
      ...(object ? { directObject: { concept: object, definiteness: 'bare', number: 'plural' } } : {}),
    },
  },
});

export const nouns: ConceptSeed[] = [
  // ── NOUNS ────────────────────────────────────────────────────────
  {
    id: 'ANIMAL',
    role: 'noun',
    description: 'a living creature other than a person',
    emoji: '🐾',
    animate: true,
    forms: {
      en: { base: 'animal', plural: 'animals', count: 'singular' },
      it: { base: 'animale', plural: 'animali', gender: 'masc', count: 'singular' },
      // fr -al → -aux and pt -al → -ais: the plural is irregular in both.
      fr: { base: 'animal', plural: 'animaux', gender: 'masc', count: 'singular' },
      de: { base: 'Tier', plural: 'Tiere', gender: 'neut', count: 'singular' },
      es: { base: 'animal', plural: 'animales', gender: 'masc', count: 'singular' },
      ja: { base: '動物', count: 'singular', reading: 'どうぶつ' },
      pt: { base: 'animal', plural: 'animais', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'MAMMAL',
    role: 'noun',
    description: 'a warm-blooded animal that suckles its young',
    emoji: '🐘',
    animate: true,
    isA: 'ANIMAL',
    forms: {
      en: { base: 'mammal', plural: 'mammals', count: 'singular' },
      it: { base: 'mammifero', plural: 'mammiferi', gender: 'masc', count: 'singular' },
      fr: { base: 'mammifère', plural: 'mammifères', gender: 'masc', count: 'singular' },
      de: { base: 'Säugetier', plural: 'Säugetiere', gender: 'neut', count: 'singular' },
      es: { base: 'mamífero', plural: 'mamíferos', gender: 'masc', count: 'singular' },
      ja: { base: '哺乳類', count: 'singular', reading: 'ほにゅうるい' },
      pt: { base: 'mamífero', plural: 'mamíferos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'CAT',
    role: 'noun',
    description: 'domestic feline animal',
    definition: glossOf('MAMMAL', 'SMALL'),
    emoji: '🐱',
    animate: true,
    isA: 'MAMMAL',
    forms: {
      en: { base: 'cat', plural: 'cats', count: 'singular' },
      it: { base: 'gatto', plural: 'gatti', gender: 'masc', count: 'singular', fem: 'gatta', fem_plural: 'gatte' },
      fr: { base: 'chat', plural: 'chats', gender: 'masc', count: 'singular', fem: 'chatte', fem_plural: 'chattes' },
      de: { base: 'Kater', plural: 'Kater', gender: 'masc', count: 'singular', fem: 'Katze', fem_plural: 'Katzen' },
      es: { base: 'gato', plural: 'gatos', gender: 'masc', count: 'singular', fem: 'gata', fem_plural: 'gatas' },
      ja: { base: '猫', count: 'singular', reading: 'ねこ' },
      pt: { base: 'gato', plural: 'gatos', gender: 'masc', count: 'singular', fem: 'gata', fem_plural: 'gatas' },
    },
  },
  {
    id: 'DOG',
    role: 'noun',
    description: 'domestic canine animal',
    definition: glossOf('MAMMAL', 'DOMESTIC', 'CANINE'),
    emoji: '🐶',
    animate: true,
    isA: 'MAMMAL',
    forms: {
      en: { base: 'dog', plural: 'dogs', count: 'singular' },
      it: { base: 'cane', plural: 'cani', gender: 'masc', count: 'singular', fem: 'cagna', fem_plural: 'cagne' },
      fr: { base: 'chien', plural: 'chiens', gender: 'masc', count: 'singular', fem: 'chienne', fem_plural: 'chiennes' },
      de: { base: 'Hund', plural: 'Hunde', gender: 'masc', count: 'singular', fem: 'Hündin', fem_plural: 'Hündinnen' },
      es: { base: 'perro', plural: 'perros', gender: 'masc', count: 'singular', fem: 'perra', fem_plural: 'perras' },
      ja: { base: '犬', count: 'singular', reading: 'いぬ' },
      pt: { base: 'cão', plural: 'cães', gender: 'masc', count: 'singular', fem: 'cadela', fem_plural: 'cadelas' },
    },
  },
  {
    id: 'BOOK',
    role: 'noun',
    description: 'a written or printed work',
    definition: glossOf('OBJECT_THING', 'WRITTEN'),
    emoji: '📚',
    isA: 'OBJECT_THING',
    forms: {
      en: { base: 'book', plural: 'books', count: 'singular' },
      it: { base: 'libro', plural: 'libri', gender: 'masc', count: 'singular' },
      fr: { base: 'livre', plural: 'livres', gender: 'masc', count: 'singular' },
      de: { base: 'Buch', plural: 'Bücher', gender: 'neut', count: 'singular' },
      es: { base: 'libro', plural: 'libros', gender: 'masc', count: 'singular' },
      ja: { base: '本', count: 'singular', reading: 'ほん' },
      pt: { base: 'livro', plural: 'livros', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WATER',
    role: 'noun',
    description: 'the liquid H₂O',
    emoji: '💧',
    countable: false,
    isA: 'LIQUID',
    forms: {
      en: { base: 'water', count: 'singular' },
      it: { base: 'acqua', gender: 'fem', count: 'singular' },
      fr: { base: 'eau', gender: 'fem', count: 'singular' },
      de: { base: 'Wasser', gender: 'neut', count: 'singular' },
      // "agua" is feminine but takes the masculine singular article ("el agua") because it
      // begins with a stressed a-; stressed_a marks that, and only the article obeys it —
      // every other agreement stays feminine ("esta agua fría", "toda el agua").
      es: { base: 'agua', gender: 'fem', stressed_a: '1', count: 'singular' },
      ja: { base: '水', count: 'singular', reading: 'みず' },
      pt: { base: 'água', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Head of the flagship manner adverbial "at the speed of light" — the `at` specifier plus a
    // genitive possessor. Italian "velocità" is invariable in the plural.
    id: 'SPEED',
    role: 'noun',
    description: 'the rate at which something moves',
    emoji: '💨',
    // A measure: a manner adverbial headed by SPEED reads "at [the] speed", not "with".
    mannerRelation: 'measure',
    forms: {
      en: { base: 'speed', plural: 'speeds', count: 'singular' },
      it: { base: 'velocità', plural: 'velocità', gender: 'fem', count: 'singular' },
      fr: { base: 'vitesse', plural: 'vitesses', gender: 'fem', count: 'singular' },
      de: { base: 'Geschwindigkeit', plural: 'Geschwindigkeiten', gender: 'fem', count: 'singular' },
      es: { base: 'velocidad', plural: 'velocidades', gender: 'fem', count: 'singular' },
      ja: { base: '速さ', count: 'singular', reading: 'はやさ' },
      pt: { base: 'velocidade', plural: 'velocidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The genitive possessor of the flagship manner example ("della luce" = of light).
    id: 'LIGHT',
    role: 'noun',
    description: 'the natural agent that makes things visible',
    emoji: '💡',
    forms: {
      en: { base: 'light', plural: 'lights', count: 'singular' },
      it: { base: 'luce', plural: 'luci', gender: 'fem', count: 'singular' },
      fr: { base: 'lumière', plural: 'lumières', gender: 'fem', count: 'singular' },
      de: { base: 'Licht', plural: 'Lichter', gender: 'neut', count: 'singular' },
      es: { base: 'luz', plural: 'luces', gender: 'fem', count: 'singular' },
      ja: { base: '光', count: 'singular', reading: 'ひかり' },
      pt: { base: 'luz', plural: 'luzes', gender: 'fem', count: 'singular' },
    },
  },
  {
    // What is heard, as LIGHT is what is seen. German Geräusch (neuter) is a sound or noise in
    // general; Klang would be a musical tone and Laut a speech sound.
    id: 'SOUND',
    role: 'noun',
    description: 'something that can be heard',
    emoji: '🔊',
    forms: {
      en: { base: 'sound', plural: 'sounds', count: 'singular' },
      it: { base: 'suono', plural: 'suoni', gender: 'masc', count: 'singular' },
      fr: { base: 'son', plural: 'sons', gender: 'masc', count: 'singular' },
      de: { base: 'Geräusch', plural: 'Geräusche', gender: 'neut', count: 'singular' },
      es: { base: 'sonido', plural: 'sonidos', gender: 'masc', count: 'singular' },
      ja: { base: '音', count: 'singular', reading: 'おと' },
      pt: { base: 'som', plural: 'sons', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A mode: a manner adverbial headed by WAY reads "in a … way" — it "in modo", de "auf …
    // Weise", Romance "de … manière/manera/maneira". Motivating phrase: "in a good way".
    id: 'WAY',
    role: 'noun',
    description: 'a manner or fashion in which something is done',
    emoji: '🔀',
    mannerRelation: 'mode',
    forms: {
      en: { base: 'way', plural: 'ways', count: 'singular' },
      it: { base: 'modo', plural: 'modi', gender: 'masc', count: 'singular' },
      fr: { base: 'manière', plural: 'manières', gender: 'fem', count: 'singular' },
      de: { base: 'Weise', plural: 'Weisen', gender: 'fem', count: 'singular' },
      es: { base: 'manera', plural: 'maneras', gender: 'fem', count: 'singular' },
      ja: { base: '方法', count: 'singular', reading: 'ほうほう' },
      pt: { base: 'maneira', plural: 'maneiras', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The temporal head of the frequency adverbials ALWAYS / NEVER — "at all times" / "at no
    // time". A measure, like SPEED, so it enters a manner/frequency adverbial under "at" (it/es/pt
    // "a", fr "à"). Countable: "at no time" is singular, "at all times" plural.
    id: 'TIME',
    role: 'noun',
    description: 'the indefinite continued progress of existence; an occasion',
    emoji: '⏰',
    mannerRelation: 'measure',
    forms: {
      en: { base: 'time', plural: 'times', count: 'singular' },
      it: { base: 'tempo', plural: 'tempi', gender: 'masc', count: 'singular' },
      fr: { base: 'temps', plural: 'temps', gender: 'masc', count: 'singular' },
      // A point in time takes "zu" in a German manner adverbial ("zu allen Zeiten"), not measure's "mit".
      de: { base: 'Zeit', plural: 'Zeiten', gender: 'fem', count: 'singular', temporal: '1' },
      es: { base: 'tiempo', plural: 'tiempos', gender: 'masc', count: 'singular' },
      ja: { base: '時間', count: 'singular', reading: 'じかん' },
      pt: { base: 'tempo', plural: 'tempos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Head of the `with` manner example — "with (good) care" / "con (buona) cura". A means, so it
    // is marked explicitly now that the unmarked default is the similative "like". Uncountable,
    // like WATER, so a determiner still applies ("con la cura") but no plural is needed.
    id: 'CARE',
    role: 'noun',
    description: 'serious attention or heed given to something',
    emoji: '🫧',
    countable: false,
    mannerRelation: 'means',
    forms: {
      en: { base: 'care', count: 'singular' },
      it: { base: 'cura', gender: 'fem', count: 'singular' },
      fr: { base: 'soin', gender: 'masc', count: 'singular' },
      de: { base: 'Sorgfalt', gender: 'fem', count: 'singular' },
      es: { base: 'cuidado', gender: 'masc', count: 'singular' },
      ja: { base: '注意', count: 'singular', reading: 'ちゅうい' },
      pt: { base: 'cuidado', gender: 'masc', count: 'singular' },
    },
  },

  // ── Dimension nouns ──────────────────────────────────────────────
  // The scalar dimensions an adjective-definition gloss measures on — BIG is "of great size", GOOD
  // "of high quality" (see the engines' dimensionGloss render + Concept.dimensionRelation). Their
  // `dimensionRelation` selects the gloss adposition: `extent` → "of …" (di/de/von), `quality` →
  // "of …" too but reserved for worth (di qualità), `measure` → "at a …" (temperature). Ordinary
  // countable abstract nouns otherwise.
  {
    id: 'SIZE',
    role: 'noun',
    description: 'how large or small something is',
    emoji: '📏',
    dimensionRelation: 'extent',
    forms: {
      en: { base: 'size', plural: 'sizes', count: 'singular' },
      it: { base: 'dimensione', plural: 'dimensioni', gender: 'fem', count: 'singular' },
      fr: { base: 'taille', plural: 'tailles', gender: 'fem', count: 'singular' },
      de: { base: 'Größe', plural: 'Größen', gender: 'fem', count: 'singular' },
      es: { base: 'tamaño', plural: 'tamaños', gender: 'masc', count: 'singular' },
      ja: { base: '大きさ', count: 'singular', reading: 'おおきさ' },
      pt: { base: 'tamanho', plural: 'tamanhos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'HEIGHT',
    role: 'noun',
    description: 'how high something is; vertical extent',
    emoji: '📐',
    dimensionRelation: 'extent',
    forms: {
      en: { base: 'height', plural: 'heights', count: 'singular' },
      it: { base: 'altezza', plural: 'altezze', gender: 'fem', count: 'singular' },
      fr: { base: 'hauteur', plural: 'hauteurs', gender: 'fem', count: 'singular' },
      de: { base: 'Höhe', plural: 'Höhen', gender: 'fem', count: 'singular' },
      es: { base: 'altura', plural: 'alturas', gender: 'fem', count: 'singular' },
      ja: { base: '高さ', count: 'singular', reading: 'たかさ' },
      pt: { base: 'altura', plural: 'alturas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Italian/Portuguese "qualità/qualidade" and the Romance feminines; `quality` relation so a
    // gloss reads "of high quality" (di alta qualità). Italian "qualità" is invariable in the plural.
    id: 'QUALITY',
    role: 'noun',
    description: 'how good or bad something is; standard of worth',
    emoji: '⭐',
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'quality', plural: 'qualities', count: 'singular' },
      it: { base: 'qualità', plural: 'qualità', gender: 'fem', count: 'singular' },
      fr: { base: 'qualité', plural: 'qualités', gender: 'fem', count: 'singular' },
      de: { base: 'Qualität', plural: 'Qualitäten', gender: 'fem', count: 'singular' },
      es: { base: 'calidad', plural: 'calidades', gender: 'fem', count: 'singular' },
      ja: { base: '質', count: 'singular', reading: 'しつ' },
      pt: { base: 'qualidade', plural: 'qualidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'STRENGTH',
    role: 'noun',
    description: 'how much physical power or force something has',
    emoji: '💪',
    dimensionRelation: 'extent',
    forms: {
      en: { base: 'strength', plural: 'strengths', count: 'singular' },
      it: { base: 'forza', plural: 'forze', gender: 'fem', count: 'singular' },
      fr: { base: 'force', plural: 'forces', gender: 'fem', count: 'singular' },
      de: { base: 'Stärke', plural: 'Stärken', gender: 'fem', count: 'singular' },
      es: { base: 'fuerza', plural: 'fuerzas', gender: 'fem', count: 'singular' },
      ja: { base: '強さ', count: 'singular', reading: 'つよさ' },
      pt: { base: 'força', plural: 'forças', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "età/idade" are invariable / feminine in the Romance languages; German "Alter" is neuter and
    // invariable in the plural. Age as a scalar dimension ("of great age"), not a lifetime.
    id: 'AGE',
    role: 'noun',
    description: 'how old something is',
    emoji: '⏳',
    dimensionRelation: 'extent',
    forms: {
      en: { base: 'age', plural: 'ages', count: 'singular' },
      it: { base: 'età', plural: 'età', gender: 'fem', count: 'singular' },
      fr: { base: 'âge', plural: 'âges', gender: 'masc', count: 'singular' },
      de: { base: 'Alter', plural: 'Alter', gender: 'neut', count: 'singular' },
      es: { base: 'edad', plural: 'edades', gender: 'fem', count: 'singular' },
      ja: { base: '年齢', count: 'singular', reading: 'ねんれい' },
      pt: { base: 'idade', plural: 'idades', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The `measure` dimension relation: a gloss reads "at a high/low temperature" (en at / it a /
    // de bei), a point reached on a scale, where the `extent` nouns above read "of great …".
    id: 'TEMPERATURE',
    role: 'noun',
    description: 'how hot or cold something is',
    emoji: '🌡️',
    dimensionRelation: 'measure',
    forms: {
      en: { base: 'temperature', plural: 'temperatures', count: 'singular' },
      it: { base: 'temperatura', plural: 'temperature', gender: 'fem', count: 'singular' },
      fr: { base: 'température', plural: 'températures', gender: 'fem', count: 'singular' },
      de: { base: 'Temperatur', plural: 'Temperaturen', gender: 'fem', count: 'singular' },
      es: { base: 'temperatura', plural: 'temperaturas', gender: 'fem', count: 'singular' },
      ja: { base: '温度', count: 'singular', reading: 'おんど' },
      pt: { base: 'temperatura', plural: 'temperaturas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'MONEY',
    role: 'noun',
    description: 'a medium of exchange',
    emoji: '💰',
    countable: false,
    forms: {
      en: { base: 'money', count: 'singular' },
      it: { base: 'denaro', gender: 'masc', count: 'singular' },
      fr: { base: 'argent', gender: 'masc', count: 'singular' },
      de: { base: 'Geld', gender: 'neut', count: 'singular' },
      es: { base: 'dinero', gender: 'masc', count: 'singular' },
      ja: { base: 'お金', count: 'singular', reading: 'おかね' },
      pt: { base: 'dinheiro', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'FOOD',
    role: 'noun',
    description: 'nourishment, something to eat',
    definition: patientGloss('OBJECT_THING', 'EAT'),
    emoji: '🍽️',
    countable: false,
    forms: {
      en: { base: 'food', count: 'singular' },
      it: { base: 'cibo', gender: 'masc', count: 'singular' },
      fr: { base: 'nourriture', gender: 'fem', count: 'singular' },
      de: { base: 'Essen', gender: 'neut', count: 'singular' },
      es: { base: 'comida', gender: 'fem', count: 'singular' },
      ja: { base: '食べ物', count: 'singular', reading: 'たべもの' },
      pt: { base: 'comida', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Ice cream in general — Italian "gelato", not the English loanword for the Italian style.
    // Countable in the serving sense ("an ice cream", "zwei Eis"), unlike FOOD. German "Eis" is
    // invariable in the plural and takes the long genitive (des Eises).
    id: 'ICE_CREAM',
    role: 'noun',
    description: 'a sweet frozen dessert made from milk or cream',
    emoji: '🍨',
    isA: 'FOOD',
    forms: {
      en: { base: 'ice cream', plural: 'ice creams', count: 'singular' },
      it: { base: 'gelato', plural: 'gelati', gender: 'masc', count: 'singular' },
      fr: { base: 'glace', plural: 'glaces', gender: 'fem', count: 'singular' },
      de: { base: 'Eis', plural: 'Eis', gender: 'neut', count: 'singular' },
      es: { base: 'helado', plural: 'helados', gender: 'masc', count: 'singular' },
      ja: { base: 'アイスクリーム', count: 'singular', reading: 'あいすくりーむ' },
      pt: { base: 'sorvete', plural: 'sorvetes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The differentia object of DRINK's dictionary definition ("to consume liquid"). A mass noun,
    // modelled on FOOD — uncountable, no plural, and rendered bare in the gloss.
    id: 'LIQUID',
    role: 'noun',
    description: 'a fluid substance, something to drink',
    emoji: '💧',
    countable: false,
    forms: {
      en: { base: 'liquid', count: 'singular' },
      it: { base: 'liquido', gender: 'masc', count: 'singular' },
      fr: { base: 'liquide', gender: 'masc', count: 'singular' },
      de: { base: 'Flüssigkeit', gender: 'fem', count: 'singular' },
      es: { base: 'líquido', gender: 'masc', count: 'singular' },
      ja: { base: '液体', count: 'singular', reading: 'えきたい' },
      pt: { base: 'líquido', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The differentia object of CLEAR's dictionary definition ("to destroy content") — what a
    // container, a field or a page holds. Countable ("the contents"), but rendered bare-singular in
    // the gloss the way FIRE is.
    id: 'CONTENT',
    role: 'noun',
    description: 'what something holds or contains',
    emoji: '🗃️',
    forms: {
      en: { base: 'content', plural: 'contents', count: 'singular' },
      it: { base: 'contenuto', plural: 'contenuti', gender: 'masc', count: 'singular' },
      fr: { base: 'contenu', plural: 'contenus', gender: 'masc', count: 'singular' },
      de: { base: 'Inhalt', plural: 'Inhalte', gender: 'masc', count: 'singular' },
      es: { base: 'contenido', plural: 'contenidos', gender: 'masc', count: 'singular' },
      ja: { base: '内容', count: 'singular', reading: 'ないよう' },
      pt: { base: 'conteúdo', plural: 'conteúdos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A location in general, not a dwelling (HOUSE / HOME) or a named one (MARKET). French "lieu"
    // pluralises in -x; Italian "luogo" keeps its hard g (luoghi).
    id: 'PLACE',
    role: 'noun',
    description: 'a location; a particular part of space',
    emoji: '📍',
    forms: {
      en: { base: 'place', plural: 'places', count: 'singular' },
      it: { base: 'luogo', plural: 'luoghi', gender: 'masc', count: 'singular' },
      fr: { base: 'lieu', plural: 'lieux', gender: 'masc', count: 'singular' },
      de: { base: 'Ort', plural: 'Orte', gender: 'masc', count: 'singular' },
      es: { base: 'lugar', plural: 'lugares', gender: 'masc', count: 'singular' },
      ja: { base: '場所', count: 'singular', reading: 'ばしょ' },
      pt: { base: 'lugar', plural: 'lugares', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The genus HOUSE and PRISON lacked: both are described as "a building", which was not itself a
    // concept (B29). It sits under PLACE beside HOME, MARKET and CONTINENT, so the two nouns gain
    // BUILDING → PLACE rather than losing anything — both were roots. Its gloss waited on two engine
    // gaps (C05): French now writes the partitive on a bare plural object ("un lieu qui a des murs",
    // A149), and Japanese says an inanimate owner's possession with ある (壁がある場所, A150), not 持つ.
    // German "Gebäude" is one of the neuter nouns with an identical plural; Japanese 建物 is the
    // everyday word, 建築物 the technical one.
    id: 'BUILDING',
    role: 'noun',
    description: 'a structure with walls and a roof',
    definition: whoGloss('PLACE', 'HAVE', 'WALL'),
    emoji: '🏢',
    isA: 'PLACE',
    forms: {
      en: { base: 'building', plural: 'buildings', count: 'singular' },
      it: { base: 'edificio', plural: 'edifici', gender: 'masc', count: 'singular' },
      fr: { base: 'bâtiment', plural: 'bâtiments', gender: 'masc', count: 'singular' },
      de: { base: 'Gebäude', plural: 'Gebäude', gender: 'neut', count: 'singular' },
      es: { base: 'edificio', plural: 'edificios', gender: 'masc', count: 'singular' },
      ja: { base: '建物', count: 'singular', reading: 'たてもの' },
      pt: { base: 'edifício', plural: 'edifícios', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A building's wall, the differentia of BUILDING's gloss. Where a language has two words, this is
    // the building's: it muro (a city's walls are the plural mura), de Wand (a free-standing wall is
    // a Mauer), es pared (a free-standing one is a muro). No genus is seeded above it.
    id: 'WALL',
    role: 'noun',
    description: 'an upright structure that encloses or divides a space',
    emoji: '🧱',
    forms: {
      en: { base: 'wall', plural: 'walls', count: 'singular' },
      it: { base: 'muro', plural: 'muri', gender: 'masc', count: 'singular' },
      fr: { base: 'mur', plural: 'murs', gender: 'masc', count: 'singular' },
      de: { base: 'Wand', plural: 'Wände', gender: 'fem', count: 'singular' },
      es: { base: 'pared', plural: 'paredes', gender: 'fem', count: 'singular' },
      ja: { base: '壁', count: 'singular', reading: 'かべ' },
      pt: { base: 'parede', plural: 'paredes', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'HOUSE',
    role: 'noun',
    description: 'a building used as a dwelling',
    definition: whereGloss('BUILDING', 'LIVE'),
    emoji: '🏠',
    isA: 'BUILDING',
    forms: {
      en: { base: 'house', plural: 'houses', count: 'singular' },
      it: { base: 'casa', plural: 'case', gender: 'fem', count: 'singular' },
      fr: { base: 'maison', plural: 'maisons', gender: 'fem', count: 'singular' },
      de: { base: 'Haus', plural: 'Häuser', gender: 'neut', count: 'singular' },
      es: { base: 'casa', plural: 'casas', gender: 'fem', count: 'singular' },
      ja: { base: '家', count: 'singular', reading: 'いえ' },
      pt: { base: 'casa', plural: 'casas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'HOME',
    role: 'noun',
    description: 'the place where one lives',
    definition: whereGloss('PLACE', 'LIVE'),
    emoji: '🏡',
    isA: 'PLACE',
    forms: {
      en: { base: 'home', plural: 'homes', count: 'singular' },
      it: { base: 'casa', plural: 'case', gender: 'fem', count: 'singular' },
      fr: { base: 'foyer', plural: 'foyers', gender: 'masc', count: 'singular' },
      de: { base: 'Zuhause', plural: 'Zuhause', gender: 'neut', count: 'singular' },
      es: { base: 'hogar', plural: 'hogares', gender: 'masc', count: 'singular' },
      ja: { base: '家', count: 'singular', reading: 'いえ' },
      pt: { base: 'lar', plural: 'lares', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'CHILD',
    role: 'noun',
    description: 'a young human being',
    definition: glossOf('PERSON', 'YOUNG'),
    emoji: '👦',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'child', plural: 'children', count: 'singular' },
      it: { base: 'bambino', plural: 'bambini', gender: 'masc', count: 'singular', fem: 'bambina', fem_plural: 'bambine' },
      fr: { base: 'enfant', plural: 'enfants', gender: 'masc', count: 'singular', fem: 'enfant', fem_plural: 'enfants' },
      de: { base: 'Kind', plural: 'Kinder', gender: 'neut', count: 'singular' },
      es: { base: 'niño', plural: 'niños', gender: 'masc', count: 'singular', fem: 'niña', fem_plural: 'niñas' },
      ja: { base: '子供', count: 'singular', reading: 'こども' },
      pt: { base: 'criança', plural: 'crianças', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'PERSON',
    role: 'noun',
    description: 'a human being',
    emoji: '🧑',
    animate: true,
    human: true,
    forms: {
      en: { base: 'person', plural: 'people', count: 'singular' },
      it: { base: 'persona', plural: 'persone', gender: 'fem', count: 'singular' },
      fr: { base: 'personne', plural: 'personnes', gender: 'fem', count: 'singular' },
      de: { base: 'Person', plural: 'Personen', gender: 'fem', count: 'singular' },
      es: { base: 'persona', plural: 'personas', gender: 'fem', count: 'singular' },
      ja: { base: '人', count: 'singular', reading: 'ひと' },
      pt: { base: 'pessoa', plural: 'pessoas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'FOX',
    role: 'noun',
    description: 'a carnivorous mammal with reddish fur',
    definition: glossOf('MAMMAL', 'BROWN'),
    emoji: '🦊',
    animate: true,
    isA: 'MAMMAL',
    forms: {
      en: { base: 'fox', plural: 'foxes', count: 'singular' },
      it: { base: 'volpe', plural: 'volpi', gender: 'fem', count: 'singular' },
      fr: { base: 'renard', plural: 'renards', gender: 'masc', count: 'singular' },
      de: { base: 'Fuchs', plural: 'Füchse', gender: 'masc', count: 'singular' },
      es: { base: 'zorro', plural: 'zorros', gender: 'masc', count: 'singular', fem: 'zorra', fem_plural: 'zorras' },
      ja: { base: 'キツネ', count: 'singular' },
      pt: { base: 'raposa', plural: 'raposas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'BOY',
    role: 'noun',
    description: 'a young male human',
    definition: glossOf('PERSON', 'YOUNG', 'MALE'),
    emoji: '👦',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'boy', plural: 'boys', count: 'singular' },
      it: { base: 'ragazzo', plural: 'ragazzi', gender: 'masc', count: 'singular' },
      fr: { base: 'garçon', plural: 'garçons', gender: 'masc', count: 'singular' },
      de: { base: 'Junge', plural: 'Jungen', gender: 'masc', count: 'singular', weak: '1' },
      es: { base: 'niño', plural: 'niños', gender: 'masc', count: 'singular' },
      ja: { base: '男の子', count: 'singular', reading: 'おとこのこ' },
      pt: { base: 'menino', plural: 'meninos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'MAN',
    role: 'noun',
    description: 'an adult male human',
    definition: glossOf('PERSON', 'ADULT', 'MALE'),
    emoji: '👨',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'man', plural: 'men', count: 'singular' },
      it: { base: 'uomo', plural: 'uomini', gender: 'masc', count: 'singular' },
      // "homme" begins with an h muet: silent, so the article elides ("l'homme") exactly as before
      // a vowel. The flag marks that; an h aspiré noun ("héros" → le héros) would carry none.
      fr: { base: 'homme', plural: 'hommes', gender: 'masc', count: 'singular', elides: '1' },
      de: { base: 'Mann', plural: 'Männer', gender: 'masc', count: 'singular' },
      es: { base: 'hombre', plural: 'hombres', gender: 'masc', count: 'singular' },
      ja: { base: '男', count: 'singular', reading: 'おとこ' },
      pt: { base: 'homem', plural: 'homens', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WOMAN',
    role: 'noun',
    description: 'an adult female human',
    definition: glossOf('PERSON', 'ADULT', 'FEMALE'),
    emoji: '👩',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'woman', plural: 'women', count: 'singular' },
      it: { base: 'donna', plural: 'donne', gender: 'fem', count: 'singular' },
      fr: { base: 'femme', plural: 'femmes', gender: 'fem', count: 'singular' },
      de: { base: 'Frau', plural: 'Frauen', gender: 'fem', count: 'singular' },
      es: { base: 'mujer', plural: 'mujeres', gender: 'fem', count: 'singular' },
      ja: { base: '女', count: 'singular', reading: 'おんな' },
      pt: { base: 'mulher', plural: 'mulheres', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'WOLF',
    role: 'noun',
    description: 'a wild canine animal',
    definition: glossOf('MAMMAL', 'WILD', 'CANINE'),
    emoji: '🐺',
    animate: true,
    alarm: true, // "cry wolf": gridare al lupo, crier au loup
    isA: 'MAMMAL',
    forms: {
      en: { base: 'wolf', plural: 'wolves', count: 'singular' },
      it: { base: 'lupo', plural: 'lupi', gender: 'masc', count: 'singular', fem: 'lupa', fem_plural: 'lupe' },
      fr: { base: 'loup', plural: 'loups', gender: 'masc', count: 'singular', fem: 'louve', fem_plural: 'louves' },
      de: { base: 'Wolf', plural: 'Wölfe', gender: 'masc', count: 'singular', fem: 'Wölfin', fem_plural: 'Wölfinnen' },
      es: { base: 'lobo', plural: 'lobos', gender: 'masc', count: 'singular', fem: 'loba', fem_plural: 'lobas' },
      ja: { base: '狼', count: 'singular', reading: 'おおかみ' },
      pt: { base: 'lobo', plural: 'lobos', gender: 'masc', count: 'singular', fem: 'loba', fem_plural: 'lobas' },
    },
  },
  {
    id: 'BOVINE',
    role: 'noun',
    description: 'a large ruminant mammal of the cattle kind',
    emoji: '🐄',
    animate: true,
    isA: 'MAMMAL',
    forms: {
      en: { base: 'bovine', plural: 'bovines', count: 'singular' },
      it: { base: 'bovino', plural: 'bovini', gender: 'masc', count: 'singular' },
      fr: { base: 'bovin', plural: 'bovins', gender: 'masc', count: 'singular' },
      de: { base: 'Rind', plural: 'Rinder', gender: 'neut', count: 'singular' },
      es: { base: 'bovino', plural: 'bovinos', gender: 'masc', count: 'singular' },
      ja: { base: '牛', count: 'singular', reading: 'うし' },
      pt: { base: 'bovino', plural: 'bovinos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'COW',
    role: 'noun',
    description: 'an adult female bovine kept for milk or meat',
    definition: glossOf('MAMMAL', 'BIG'),
    emoji: '🐄',
    animate: true,
    isA: 'BOVINE',
    forms: {
      en: { base: 'cow', plural: 'cows', count: 'singular' },
      it: { base: 'mucca', plural: 'mucche', gender: 'fem', count: 'singular' },
      fr: { base: 'vache', plural: 'vaches', gender: 'fem', count: 'singular' },
      de: { base: 'Kuh', plural: 'Kühe', gender: 'fem', count: 'singular' },
      es: { base: 'vaca', plural: 'vacas', gender: 'fem', count: 'singular' },
      ja: { base: '牛', count: 'singular', reading: 'うし' },
      pt: { base: 'vaca', plural: 'vacas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'OX',
    role: 'noun',
    description: 'a castrated adult male bovine used as a draft animal',
    definition: glossOf('BOVINE', 'CASTRATED', 'ADULT', 'MALE'),
    emoji: '🐂',
    animate: true,
    forms: {
      en: { base: 'ox', plural: 'oxen', count: 'singular' },
      it: { base: 'bue', plural: 'buoi', gender: 'masc', count: 'singular' },
      fr: { base: 'bœuf', plural: 'bœufs', gender: 'masc', count: 'singular' },
      de: { base: 'Ochse', plural: 'Ochsen', gender: 'masc', count: 'singular', weak: '1' },
      es: { base: 'buey', plural: 'bueyes', gender: 'masc', count: 'singular' },
      ja: { base: '雄牛', count: 'singular', reading: 'おうし' },
      pt: { base: 'boi', plural: 'bois', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'BUTCHER',
    role: 'noun',
    description: 'a person who slaughters animals or sells meat',
    definition: whoGloss('PERSON', 'KILL', 'ANIMAL'),
    emoji: '🔪',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'butcher', plural: 'butchers', count: 'singular' },
      it: { base: 'macellaio', plural: 'macellai', gender: 'masc', count: 'singular', fem: 'macellaia', fem_plural: 'macellaie' },
      fr: { base: 'boucher', plural: 'bouchers', gender: 'masc', count: 'singular', fem: 'bouchère', fem_plural: 'bouchères' },
      de: { base: 'Metzger', plural: 'Metzger', gender: 'masc', count: 'singular', fem: 'Metzgerin', fem_plural: 'Metzgerinnen' },
      es: { base: 'carnicero', plural: 'carniceros', gender: 'masc', count: 'singular', fem: 'carnicera', fem_plural: 'carniceras' },
      ja: { base: '肉屋', count: 'singular', reading: 'にくや' },
      pt: { base: 'açougueiro', plural: 'açougueiros', gender: 'masc', count: 'singular', fem: 'açougueira', fem_plural: 'açougueiras' },
    },
  },
  {
    id: 'ANGEL',
    role: 'noun',
    description: 'a spiritual being; a messenger of God',
    emoji: '👼',
    animate: true,
    forms: {
      en: { base: 'angel', plural: 'angels', count: 'singular' },
      it: { base: 'angelo', plural: 'angeli', gender: 'masc', count: 'singular' },
      fr: { base: 'ange', plural: 'anges', gender: 'masc', count: 'singular' },
      de: { base: 'Engel', plural: 'Engel', gender: 'masc', count: 'singular' },
      es: { base: 'ángel', plural: 'ángeles', gender: 'masc', count: 'singular' },
      ja: { base: '天使', count: 'singular', reading: 'てんし' },
      pt: { base: 'anjo', plural: 'anjos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The differentia object of KILL's dictionary definition ("to destroy life"), and DEATH's
    // antonym. Countable like DEATH ("lives"), but rendered bare-singular in the gloss the way FIRE
    // is. Japanese takes 生命 (life as a phenomenon) over 命 (one's own life).
    id: 'LIFE',
    role: 'noun',
    description: 'the condition of being alive',
    emoji: '🌱',
    forms: {
      en: { base: 'life', plural: 'lives', count: 'singular' },
      it: { base: 'vita', plural: 'vite', gender: 'fem', count: 'singular' },
      fr: { base: 'vie', plural: 'vies', gender: 'fem', count: 'singular' },
      de: { base: 'Leben', plural: 'Leben', gender: 'neut', count: 'singular' },
      es: { base: 'vida', plural: 'vidas', gender: 'fem', count: 'singular' },
      ja: { base: '生命', count: 'singular', reading: 'せいめい' },
      pt: { base: 'vida', plural: 'vidas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'DEATH',
    role: 'noun',
    description: 'the end of life; the state of being dead',
    emoji: '💀',
    forms: {
      en: { base: 'death', plural: 'deaths', count: 'singular' },
      it: { base: 'morte', plural: 'morti', gender: 'fem', count: 'singular' },
      fr: { base: 'mort', plural: 'morts', gender: 'fem', count: 'singular' },
      de: { base: 'Tod', plural: 'Tode', gender: 'masc', count: 'singular' },
      es: { base: 'muerte', plural: 'muertes', gender: 'fem', count: 'singular' },
      ja: { base: '死', count: 'singular', reading: 'し' },
      pt: { base: 'morte', plural: 'mortes', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The genus AFFECTION lacked: it is described as "a warm feeling", which was not itself a
    // concept, so it sat as a root (B30). FEELING stays a root in turn — CONCEPT ("a thing thought
    // rather than held") is the wrong parent for an emotion, and nothing else seeded is above it.
    // No `definition`: its differentia is its own genus ("a concept that one feels"), so it keeps
    // the English literal (C05). It is also the first of the emotion nouns B07 still needs.
    id: 'FEELING',
    role: 'noun',
    description: 'an emotion or sensation one feels',
    emoji: '💗',
    forms: {
      en: { base: 'feeling', plural: 'feelings', count: 'singular' },
      it: { base: 'sentimento', plural: 'sentimenti', gender: 'masc', count: 'singular' },
      fr: { base: 'sentiment', plural: 'sentiments', gender: 'masc', count: 'singular' },
      de: { base: 'Gefühl', plural: 'Gefühle', gender: 'neut', count: 'singular' },
      es: { base: 'sentimiento', plural: 'sentimientos', gender: 'masc', count: 'singular' },
      ja: { base: '感情', count: 'singular', reading: 'かんじょう' },
      pt: { base: 'sentimento', plural: 'sentimentos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A feeling of fondness. A mass noun, like CARE — uncountable, no plural. Vowel-initial in
    // Italian and French, so the definite article elides (l'affetto / l'affection).
    id: 'AFFECTION',
    role: 'noun',
    description: 'a warm feeling of fondness toward someone',
    definition: glossOf('FEELING', 'WARM'),
    emoji: '🥰',
    countable: false,
    isA: 'FEELING',
    forms: {
      en: { base: 'affection', count: 'singular' },
      it: { base: 'affetto', gender: 'masc', count: 'singular' },
      fr: { base: 'affection', gender: 'fem', count: 'singular' },
      de: { base: 'Zuneigung', gender: 'fem', count: 'singular' },
      es: { base: 'afecto', gender: 'masc', count: 'singular' },
      ja: { base: '愛情', count: 'singular', reading: 'あいじょう' },
      pt: { base: 'afeto', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'MOUSE',
    role: 'noun',
    description: 'a small rodent',
    definition: glossOf('MAMMAL', 'SMALL'),
    emoji: '🐭',
    animate: true,
    synonym: 'rodent',
    isA: 'MAMMAL',
    forms: {
      en: { base: 'mouse', plural: 'mice', count: 'singular' },
      it: { base: 'topo', plural: 'topi', gender: 'masc', count: 'singular' },
      fr: { base: 'souris', plural: 'souris', gender: 'fem', count: 'singular' },
      de: { base: 'Maus', plural: 'Mäuse', gender: 'fem', count: 'singular' },
      es: { base: 'ratón', plural: 'ratones', gender: 'masc', count: 'singular' },
      ja: { base: 'ネズミ', count: 'singular', reading: 'ねずみ' },
      pt: { base: 'rato', plural: 'ratos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'STICK',
    role: 'noun',
    description: 'a thin elongated piece of wood',
    emoji: '🥢',
    synonym: 'rod',
    forms: {
      en: { base: 'stick', plural: 'sticks', count: 'singular' },
      it: { base: 'bastone', plural: 'bastoni', gender: 'masc', count: 'singular' },
      fr: { base: 'bâton', plural: 'bâtons', gender: 'masc', count: 'singular' },
      de: { base: 'Stock', plural: 'Stöcke', gender: 'masc', count: 'singular' },
      es: { base: 'palo', plural: 'palos', gender: 'masc', count: 'singular' },
      ja: { base: '棒', count: 'singular', reading: 'ぼう' },
      pt: { base: 'pau', plural: 'paus', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The cutting part of a knife or tool, not the whole implement. Feminine across the gendered
    // languages (lama / lame / Klinge / cuchilla / lâmina).
    id: 'BLADE',
    role: 'noun',
    description: 'the flat cutting part of a knife or tool',
    emoji: '🗡️',
    forms: {
      en: { base: 'blade', plural: 'blades', count: 'singular' },
      it: { base: 'lama', plural: 'lame', gender: 'fem', count: 'singular' },
      fr: { base: 'lame', plural: 'lames', gender: 'fem', count: 'singular' },
      de: { base: 'Klinge', plural: 'Klingen', gender: 'fem', count: 'singular' },
      es: { base: 'cuchilla', plural: 'cuchillas', gender: 'fem', count: 'singular' },
      ja: { base: '刃', count: 'singular', reading: 'は' },
      pt: { base: 'lâmina', plural: 'lâminas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'FIRE',
    role: 'noun',
    description: 'the phenomenon of combustion; flame',
    emoji: '🔥',
    alarm: true, // "cry fire": gridare al fuoco, crier au feu
    forms: {
      en: { base: 'fire', plural: 'fires', count: 'singular' },
      it: { base: 'fuoco', plural: 'fuochi', gender: 'masc', count: 'singular' },
      fr: { base: 'feu', plural: 'feux', gender: 'masc', count: 'singular' },
      de: { base: 'Feuer', plural: 'Feuer', gender: 'neut', count: 'singular' },
      es: { base: 'fuego', plural: 'fuegos', gender: 'masc', count: 'singular' },
      ja: { base: '火', count: 'singular', reading: 'ひ' },
      pt: { base: 'fogo', plural: 'fogos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The kinship genus FATHER and MOTHER specialise. Grammatically masculine where the language
    // has no neutral form, with a feminine counterpart (genitrice / progenitora) for a future
    // MOTHER = glossOf('PARENT', 'FEMALE'). German uses the neuter Elternteil ("a parent-part").
    id: 'PARENT',
    role: 'noun',
    description: 'one who has a child',
    emoji: '🧑‍🍼',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'parent', plural: 'parents', count: 'singular' },
      it: { base: 'genitore', plural: 'genitori', gender: 'masc', count: 'singular', fem: 'genitrice', fem_plural: 'genitrici' },
      fr: { base: 'parent', plural: 'parents', gender: 'masc', count: 'singular' },
      de: { base: 'Elternteil', plural: 'Elternteile', gender: 'neut', count: 'singular' },
      es: { base: 'progenitor', plural: 'progenitores', gender: 'masc', count: 'singular', fem: 'progenitora', fem_plural: 'progenitoras' },
      ja: { base: '親', count: 'singular', reading: 'おや' },
      pt: { base: 'progenitor', plural: 'progenitores', gender: 'masc', count: 'singular', fem: 'progenitora', fem_plural: 'progenitoras' },
    },
  },
  {
    id: 'FATHER',
    role: 'noun',
    description: 'a male parent',
    definition: glossOf('PARENT', 'MALE'),
    emoji: '👨',
    animate: true,
    human: true,
    isA: 'PARENT',
    forms: {
      en: { base: 'father', plural: 'fathers', count: 'singular' },
      // kinship: Italian drops the article after a possessive on the singular ("mio padre").
      it: { base: 'padre', plural: 'padri', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'père', plural: 'pères', gender: 'masc', count: 'singular' },
      de: { base: 'Vater', plural: 'Väter', gender: 'masc', count: 'singular' },
      es: { base: 'padre', plural: 'padres', gender: 'masc', count: 'singular' },
      ja: { base: '父', count: 'singular', reading: 'ちち' },
      pt: { base: 'pai', plural: 'pais', gender: 'masc', count: 'singular' },
    },
  },
  {
    // "Bought and sold" needs two predicates in one relative clause, which RelativeClause's single
    // verbPhrase cannot hold, so the gloss says it with the one verb that covers both — TRADE,
    // seeded for it. Objectless: de "handeln" and fr "commercer" take no direct object (B32).
    id: 'MARKET',
    role: 'noun',
    description: 'a place where goods are bought and sold',
    definition: whereGloss('PLACE', 'TRADE'),
    emoji: '🏪',
    isA: 'PLACE',
    forms: {
      en: { base: 'market', plural: 'markets', count: 'singular' },
      it: { base: 'mercato', plural: 'mercati', gender: 'masc', count: 'singular' },
      fr: { base: 'marché', plural: 'marchés', gender: 'masc', count: 'singular' },
      de: { base: 'Markt', plural: 'Märkte', gender: 'masc', count: 'singular' },
      es: { base: 'mercado', plural: 'mercados', gender: 'masc', count: 'singular' },
      ja: { base: '市場', count: 'singular', reading: 'いちば' },
      pt: { base: 'mercado', plural: 'mercados', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'COIN',
    role: 'noun',
    description: 'a small round piece of metal used as money',
    definition: glossOf('OBJECT_THING', 'SMALL', 'ROUND'),
    emoji: '🪙',
    isA: 'OBJECT_THING',
    forms: {
      en: { base: 'coin', plural: 'coins', count: 'singular' },
      it: { base: 'moneta', plural: 'monete', gender: 'fem', count: 'singular' },
      fr: { base: 'pièce', plural: 'pièces', gender: 'fem', count: 'singular' },
      de: { base: 'Münze', plural: 'Münzen', gender: 'fem', count: 'singular' },
      es: { base: 'moneda', plural: 'monedas', gender: 'fem', count: 'singular' },
      ja: { base: '硬貨', count: 'singular', reading: 'こうか' },
      pt: { base: 'moeda', plural: 'moedas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'LEGEND',
    role: 'noun',
    description: 'a traditional story or a famous person',
    emoji: '📜',
    forms: {
      en: { base: 'legend', plural: 'legends', count: 'singular' },
      it: { base: 'leggenda', plural: 'leggende', gender: 'fem', count: 'singular' },
      fr: { base: 'légende', plural: 'légendes', gender: 'fem', count: 'singular' },
      de: { base: 'Legende', plural: 'Legenden', gender: 'fem', count: 'singular' },
      es: { base: 'leyenda', plural: 'leyendas', gender: 'fem', count: 'singular' },
      ja: { base: '伝説', count: 'singular', reading: 'でんせつ' },
      pt: { base: 'lenda', plural: 'lendas', gender: 'fem', count: 'singular' },
    },
  },

  {
    id: 'WING',
    role: 'noun',
    description: 'a limb or organ used for flight',
    emoji: '🪽',
    forms: {
      en: { base: 'wing', plural: 'wings', count: 'singular' },
      it: { base: 'ala', plural: 'ali', gender: 'fem', count: 'singular' },
      fr: { base: 'aile', plural: 'ailes', gender: 'fem', count: 'singular' },
      de: { base: 'Flügel', plural: 'Flügel', gender: 'masc', count: 'singular' },
      es: { base: 'ala', plural: 'alas', gender: 'fem', stressed_a: '1', count: 'singular' },
      ja: { base: '翼', count: 'singular', reading: 'つばさ' },
      pt: { base: 'asa', plural: 'asas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // English "teeth" and German "Zähne" are irregular plurals; French "dent" is feminine where the
    // other Romance languages keep the Latin masculine (dente / diente).
    id: 'TOOTH',
    role: 'noun',
    description: 'a hard structure in the mouth used for biting',
    emoji: '🦷',
    forms: {
      en: { base: 'tooth', plural: 'teeth', count: 'singular' },
      it: { base: 'dente', plural: 'denti', gender: 'masc', count: 'singular' },
      fr: { base: 'dent', plural: 'dents', gender: 'fem', count: 'singular' },
      de: { base: 'Zahn', plural: 'Zähne', gender: 'masc', count: 'singular' },
      es: { base: 'diente', plural: 'dientes', gender: 'masc', count: 'singular' },
      ja: { base: '歯', count: 'singular', reading: 'は' },
      pt: { base: 'dente', plural: 'dentes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The drop from the eye, not a rip — the synonym disambiguates the English homograph.
    id: 'TEAR',
    role: 'noun',
    description: 'a drop of liquid from the eye',
    emoji: '🥲',
    synonym: 'teardrop',
    forms: {
      en: { base: 'tear', plural: 'tears', count: 'singular' },
      it: { base: 'lacrima', plural: 'lacrime', gender: 'fem', count: 'singular' },
      fr: { base: 'larme', plural: 'larmes', gender: 'fem', count: 'singular' },
      de: { base: 'Träne', plural: 'Tränen', gender: 'fem', count: 'singular' },
      es: { base: 'lágrima', plural: 'lágrimas', gender: 'fem', count: 'singular' },
      ja: { base: '涙', count: 'singular', reading: 'なみだ' },
      pt: { base: 'lágrima', plural: 'lágrimas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'YOUNG_MAN',
    role: 'noun',
    description: 'a young male person',
    definition: glossOf('PERSON', 'YOUNG', 'MALE'),
    emoji: '👱‍♂️',
    animate: true,
    human: true,
    synonym: 'youth',
    isA: 'PERSON',
    forms: {
      en: { base: 'young man', plural: 'young men', count: 'singular' },
      it: { base: 'giovane', plural: 'giovani', gender: 'masc', count: 'singular' },
      fr: { base: 'jeune homme', plural: 'jeunes hommes', gender: 'masc', count: 'singular' },
      de: { base: 'Bursche', plural: 'Burschen', gender: 'masc', count: 'singular', weak: '1' },
      es: { base: 'joven', plural: 'jóvenes', gender: 'masc', count: 'singular' },
      ja: { base: '青年', count: 'singular', reading: 'せいねん' },
      pt: { base: 'jovem', plural: 'jovens', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'YOUNG_WOMAN',
    role: 'noun',
    description: 'a young female person',
    definition: glossOf('PERSON', 'YOUNG', 'FEMALE'),
    emoji: '👱‍♀️',
    animate: true,
    human: true,
    synonym: 'youth',
    isA: 'PERSON',
    forms: {
      en: { base: 'young woman', plural: 'young women', count: 'singular' },
      it: { base: 'giovane', plural: 'giovani', gender: 'fem', count: 'singular' },
      fr: { base: 'jeune femme', plural: 'jeunes femmes', gender: 'fem', count: 'singular' },
      // "jung" is stored as the head's inherent attributive adjective, not baked into the
      // lemma: German declines it for case + determiner ("die junge Frau", "die jungen
      // Frauen", "von einer jungen Frau"), so no single surface string is right everywhere.
      de: { base: 'Frau', plural: 'Frauen', adjective: 'jung', gender: 'fem', count: 'singular' },
      es: { base: 'joven', plural: 'jóvenes', gender: 'fem', count: 'singular' },
      ja: { base: '若い女性', count: 'singular', reading: 'わかいじょせい' },
      pt: { base: 'jovem', plural: 'jovens', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The literal says "are confined", a passive the engine cannot render (features/A01). The
    // active with a generic subject says the same thing and composes today — "a building where one
    // confines people", with PERSON plural (B32).
    id: 'PRISON',
    role: 'noun',
    description: 'a building where people are confined as punishment',
    definition: whereGloss('BUILDING', 'CONFINE', 'PERSON'),
    emoji: '🔒',
    isA: 'BUILDING',
    forms: {
      en: { base: 'prison', plural: 'prisons', count: 'singular' },
      it: { base: 'prigione', plural: 'prigioni', gender: 'fem', count: 'singular' },
      fr: { base: 'prison', plural: 'prisons', gender: 'fem', count: 'singular' },
      de: { base: 'Gefängnis', plural: 'Gefängnisse', gender: 'neut', count: 'singular' },
      es: { base: 'prisión', plural: 'prisiones', gender: 'fem', count: 'singular' },
      ja: { base: '刑務所', count: 'singular', reading: 'けいむしょ' },
      pt: { base: 'prisão', plural: 'prisões', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'BUILDER',
    role: 'noun',
    description: 'a person who constructs things',
    definition: whoGloss('PERSON', 'MAKE', 'OBJECT_THING'),
    emoji: '👷',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'builder', plural: 'builders', count: 'singular' },
      it: { base: 'costruttore', plural: 'costruttori', gender: 'masc', count: 'singular', fem: 'costruttrice', fem_plural: 'costruttrici' },
      fr: { base: 'constructeur', plural: 'constructeurs', gender: 'masc', count: 'singular', fem: 'constructrice', fem_plural: 'constructrices' },
      de: { base: 'Bauarbeiter', plural: 'Bauarbeiter', gender: 'masc', count: 'singular', fem: 'Bauarbeiterin', fem_plural: 'Bauarbeiterinnen' },
      es: { base: 'constructor', plural: 'constructores', gender: 'masc', count: 'singular', fem: 'constructora', fem_plural: 'constructoras' },
      ja: { base: '建築者', count: 'singular', reading: 'けんちくしゃ' },
      pt: { base: 'construtor', plural: 'construtores', gender: 'masc', count: 'singular', fem: 'construtora', fem_plural: 'construtoras' },
    },
  },
  {
    id: 'CREATOR',
    role: 'noun',
    description: 'someone or something that creates things',
    definition: whoGloss('PERSON', 'MAKE', 'OBJECT_THING'),
    emoji: '✨',
    animate: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'creator', plural: 'creators', count: 'singular' },
      it: { base: 'creatore', plural: 'creatori', gender: 'masc', count: 'singular', fem: 'creatrice', fem_plural: 'creatrici' },
      fr: { base: 'créateur', plural: 'créateurs', gender: 'masc', count: 'singular', fem: 'créatrice', fem_plural: 'créatrices' },
      de: { base: 'Schöpfer', plural: 'Schöpfer', gender: 'masc', count: 'singular', fem: 'Schöpferin', fem_plural: 'Schöpferinnen' },
      es: { base: 'creador', plural: 'creadores', gender: 'masc', count: 'singular', fem: 'creadora', fem_plural: 'creadoras' },
      ja: { base: '創造者', count: 'singular', reading: 'そうぞうしゃ' },
      pt: { base: 'criador', plural: 'criadores', gender: 'masc', count: 'singular', fem: 'criadora', fem_plural: 'criadoras' },
    },
  },
  {
    id: 'PHRASE',
    role: 'noun',
    description: 'a small group of words expressing a concept',
    emoji: '💬',
    forms: {
      en: { base: 'phrase', plural: 'phrases', count: 'singular' },
      it: { base: 'frase', plural: 'frasi', gender: 'fem', count: 'singular' },
      fr: { base: 'phrase', plural: 'phrases', gender: 'fem', count: 'singular' },
      de: { base: 'Phrase', plural: 'Phrasen', gender: 'fem', count: 'singular' },
      es: { base: 'frase', plural: 'frases', gender: 'fem', count: 'singular' },
      ja: { base: 'フレーズ', count: 'singular', reading: 'ふれーず' },
      pt: { base: 'frase', plural: 'frases', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'SLOT',
    role: 'noun',
    description: 'a narrow opening or an allotted position',
    emoji: '🎰',
    forms: {
      en: { base: 'slot', plural: 'slots', count: 'singular' },
      it: { base: 'fessura', plural: 'fessure', gender: 'fem', count: 'singular' },
      fr: { base: 'fente', plural: 'fentes', gender: 'fem', count: 'singular' },
      de: { base: 'Schlitz', plural: 'Schlitze', gender: 'masc', count: 'singular' },
      es: { base: 'ranura', plural: 'ranuras', gender: 'fem', count: 'singular' },
      ja: { base: 'スロット', count: 'singular', reading: 'すろっと' },
      pt: { base: 'ranhura', plural: 'ranhuras', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'SLOT_COMPUTING',
    role: 'noun',
    description: 'a reserved position in memory or a schedule (informatics)',
    emoji: '🧩',
    forms: {
      en: { base: 'slot', plural: 'slots', count: 'singular' },
      it: { base: 'slot', plural: 'slot', gender: 'masc', count: 'singular' },
      fr: { base: 'slot', plural: 'slots', gender: 'masc', count: 'singular' },
      de: { base: 'Slot', plural: 'Slots', gender: 'masc', count: 'singular' },
      es: { base: 'slot', plural: 'slots', gender: 'masc', count: 'singular' },
      ja: { base: 'スロット', count: 'singular', reading: 'すろっと' },
      pt: { base: 'slot', plural: 'slots', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SLOT_MACHINE',
    role: 'noun',
    description: 'a coin-operated gambling machine with spinning reels',
    emoji: '🎰',
    forms: {
      en: { base: 'slot machine', plural: 'slot machines', count: 'singular' },
      it: { base: 'slot machine', plural: 'slot machine', gender: 'fem', count: 'singular' },
      fr: { base: 'machine à sous', plural: 'machines à sous', gender: 'fem', count: 'singular' },
      de: { base: 'Spielautomat', plural: 'Spielautomaten', gender: 'masc', count: 'singular' },
      es: { base: 'máquina tragaperras', plural: 'máquinas tragaperras', gender: 'fem', count: 'singular' },
      ja: { base: 'スロットマシン', count: 'singular', reading: 'すろっとましん' },
      pt: { base: 'caça-níqueis', plural: 'caça-níqueis', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WORD',
    role: 'noun',
    description: 'a single unit of language',
    emoji: '🔤',
    forms: {
      en: { base: 'word', plural: 'words', count: 'singular' },
      it: { base: 'parola', plural: 'parole', gender: 'fem', count: 'singular' },
      fr: { base: 'mot', plural: 'mots', gender: 'masc', count: 'singular' },
      de: { base: 'Wort', plural: 'Wörter', gender: 'neut', count: 'singular' },
      es: { base: 'palabra', plural: 'palabras', gender: 'fem', count: 'singular' },
      ja: { base: '単語', count: 'singular', reading: 'たんご' },
      pt: { base: 'palavra', plural: 'palavras', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'TRANSLATION',
    role: 'noun',
    description: 'a rendering of text or speech from one language into another',
    emoji: '🌐',
    forms: {
      en: { base: 'translation', plural: 'translations', count: 'singular' },
      it: { base: 'traduzione', plural: 'traduzioni', gender: 'fem', count: 'singular' },
      fr: { base: 'traduction', plural: 'traductions', gender: 'fem', count: 'singular' },
      de: { base: 'Übersetzung', plural: 'Übersetzungen', gender: 'fem', count: 'singular' },
      es: { base: 'traducción', plural: 'traducciones', gender: 'fem', count: 'singular' },
      ja: { base: '翻訳', count: 'singular', reading: 'ほんやく' },
      pt: { base: 'tradução', plural: 'traduções', gender: 'fem', count: 'singular' },
    },
  },

  {
    id: 'CONTINENT',
    role: 'noun',
    description: 'one of the earth’s great landmasses',
    emoji: '🗺️',
    // The hypernym of AFRICA. An ordinary common noun — countable, and it takes articles the
    // normal way ("a continent", "the continents"), where its proper-noun child does not. That
    // asymmetry is carried by the `proper` / `countable` flags, not by the tree; a rule may test
    // them, but they never enter the specificity contest. Same shape as LANGUAGE over GERMAN.
    isA: 'PLACE',
    forms: {
      en: { base: 'continent',  plural: 'continents',  count: 'singular' },
      it: { base: 'continente', plural: 'continenti',  gender: 'masc', count: 'singular' },
      fr: { base: 'continent',  plural: 'continents',  gender: 'masc', count: 'singular' },
      de: { base: 'Kontinent',  plural: 'Kontinente',  gender: 'masc', count: 'singular' },
      es: { base: 'continente', plural: 'continentes', gender: 'masc', count: 'singular' },
      ja: { base: '大陸',       count: 'singular', reading: 'たいりく' },
      pt: { base: 'continente', plural: 'continentes', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'AFRICA',
    role: 'noun',
    description: 'the continent south of the Mediterranean',
    emoji: '🌍',
    // A proper noun: no plural, and the article is the language's to fix — English, German,
    // Spanish and Japanese take none; Italian, French and Portuguese take the definite one.
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'Africa', count: 'singular' },
      it: { base: 'Africa', gender: 'fem', count: 'singular' },
      fr: { base: 'Afrique', gender: 'fem', count: 'singular' },
      de: { base: 'Afrika', gender: 'neut', count: 'singular' },
      es: { base: 'África', gender: 'fem', count: 'singular' },
      ja: { base: 'アフリカ', count: 'singular' },
      pt: { base: 'África', gender: 'fem', count: 'singular' },
    },
  },

  // The remaining continents, all shaped like AFRICA above: proper, uncountable, no plural,
  // feminine in the Romance languages and neuter in German. Japanese takes 北米 / 南米 for the
  // Americas rather than a transliteration — they are the ordinary words.
  {
    id: 'EUROPE',
    role: 'noun',
    description: 'the continent north of the Mediterranean',
    emoji: '🇪🇺',
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'Europe',    count: 'singular' },
      it: { base: 'Europa',    gender: 'fem',  count: 'singular' },
      fr: { base: 'Europe',    gender: 'fem',  count: 'singular' },
      de: { base: 'Europa',    gender: 'neut', count: 'singular' },
      es: { base: 'Europa',    gender: 'fem',  count: 'singular' },
      ja: { base: 'ヨーロッパ', count: 'singular' },
      pt: { base: 'Europa',    gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'ASIA',
    role: 'noun',
    description: 'the largest continent, east of Europe',
    emoji: '🌏',
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'Asia',   count: 'singular' },
      it: { base: 'Asia',   gender: 'fem',  count: 'singular' },
      fr: { base: 'Asie',   gender: 'fem',  count: 'singular' },
      de: { base: 'Asien',  gender: 'neut', count: 'singular' },
      es: { base: 'Asia',   gender: 'fem',  count: 'singular' },
      ja: { base: 'アジア', count: 'singular' },
      pt: { base: 'Ásia',   gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'OCEANIA',
    role: 'noun',
    description: 'the continent of Australia and the Pacific islands',
    emoji: '🏝️',
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'Oceania',    count: 'singular' },
      it: { base: 'Oceania',    gender: 'fem',  count: 'singular' },
      fr: { base: 'Océanie',    gender: 'fem',  count: 'singular' },
      de: { base: 'Ozeanien',   gender: 'neut', count: 'singular' },
      es: { base: 'Oceanía',    gender: 'fem',  count: 'singular' },
      ja: { base: 'オセアニア', count: 'singular' },
      pt: { base: 'Oceania',    gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'NORTH_AMERICA',
    role: 'noun',
    description: 'the continent north of the isthmus of Panama',
    emoji: '🌎',
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'North America',     count: 'singular' },
      it: { base: 'America del Nord',  gender: 'fem',  count: 'singular' },
      fr: { base: 'Amérique du Nord',  gender: 'fem',  count: 'singular' },
      de: { base: 'Nordamerika',       gender: 'neut', count: 'singular' },
      es: { base: 'América del Norte', gender: 'fem',  count: 'singular' },
      ja: { base: '北米',              count: 'singular', reading: 'ほくべい' },
      pt: { base: 'América do Norte',  gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'SOUTH_AMERICA',
    role: 'noun',
    description: 'the continent south of the isthmus of Panama',
    emoji: '🌎',
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'South America',    count: 'singular' },
      it: { base: 'America del Sud',  gender: 'fem',  count: 'singular' },
      fr: { base: 'Amérique du Sud',  gender: 'fem',  count: 'singular' },
      de: { base: 'Südamerika',       gender: 'neut', count: 'singular' },
      es: { base: 'América del Sur',  gender: 'fem',  count: 'singular' },
      ja: { base: '南米',             count: 'singular', reading: 'なんべい' },
      pt: { base: 'América do Sul',   gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'ANTARCTICA',
    role: 'noun',
    description: 'the continent at the south pole',
    emoji: '🧊',
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'Antarctica',   count: 'singular' },
      it: { base: 'Antartide',    gender: 'fem',  count: 'singular' },
      fr: { base: 'Antarctique',  gender: 'masc', count: 'singular' },
      // The odd one out among the continents: German and Spanish leave every other continent
      // bare but article this one ("die Antarktis", "la Antártida"). takes_article marks that;
      // only the de and es engines read it, and only for proper nouns.
      de: { base: 'Antarktis',    gender: 'fem',  takes_article: '1', count: 'singular' },
      es: { base: 'Antártida',    gender: 'fem',  takes_article: '1', count: 'singular' },
      ja: { base: '南極大陸',     count: 'singular', reading: 'なんきょくたいりく' },
      pt: { base: 'Antártida',    gender: 'fem',  count: 'singular' },
    },
  },

  {
    id: 'LANGUAGE',
    role: 'noun',
    description: 'a system of words used by a people',
    emoji: '🔡',
    // The hypernym of the seven language names below. Countable, unlike its children — one
    // says "seven languages" but not "seven Germans" (of the language). Countability is a
    // flag a rule tests, not a level in the tree, so parent and child differ freely here.
    // Feminine everywhere it has gender except Spanish: "idioma" is masculine despite the
    // -a ending (it is Greek-derived), and takes "el idioma" / "los idiomas" straightforwardly
    // from its declared gender — no stressed_a-style special case needed.
    forms: {
      en: { base: 'language', plural: 'languages', count: 'singular' },
      it: { base: 'lingua', plural: 'lingue', gender: 'fem', count: 'singular' },
      fr: { base: 'langue', plural: 'langues', gender: 'fem', count: 'singular' },
      de: { base: 'Sprache', plural: 'Sprachen', gender: 'fem', count: 'singular' },
      es: { base: 'idioma', plural: 'idiomas', gender: 'masc', count: 'singular' },
      ja: { base: '言語', count: 'singular', reading: 'げんご' },
      pt: { base: 'língua', plural: 'línguas', gender: 'fem', count: 'singular' },
    },
  },

  // ── Language names ────────────────────────────────────────────────
  // The seven UI languages, as mass nouns, so the engine can render each language's name
  // in any language (e.g. the header language selector shows them in the current UI
  // language). English capitalises language names; the others lower-case them; German
  // capitalises all nouns. Uncountable (no plural), gender masc in the Romance languages,
  // neuter in German. All seven are LANGUAGE. See backend languages.ts for the
  // LanguageCode → concept mapping.
  // Proper, like the continents: the language fixes the article, not the user (A133). English
  // and German name a language bare ("Italian is a language", "Deutsch ist eine Sprache");
  // Italian, French and Portuguese always article it ("l'italiano", "l'italien", "o italiano").
  // Spanish does too ("el italiano es un idioma"), unlike its bare continents, so its forms
  // carry takes_article as ANTARCTICA's does.
  {
    id: 'ENGLISH',
    role: 'noun',
    description: 'the English language',
    emoji: '🇬🇧',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'English', count: 'singular' },
      it: { base: 'inglese', gender: 'masc', count: 'singular' },
      fr: { base: 'anglais', gender: 'masc', count: 'singular' },
      de: { base: 'Englisch', gender: 'neut', count: 'singular' },
      es: { base: 'inglés', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: '英語', count: 'singular', reading: 'えいご' },
      pt: { base: 'inglês', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ITALIAN',
    role: 'noun',
    description: 'the Italian language',
    emoji: '🇮🇹',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Italian', count: 'singular' },
      it: { base: 'italiano', gender: 'masc', count: 'singular' },
      fr: { base: 'italien', gender: 'masc', count: 'singular' },
      de: { base: 'Italienisch', gender: 'neut', count: 'singular' },
      es: { base: 'italiano', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'イタリア語', count: 'singular', reading: 'いたりあご' },
      pt: { base: 'italiano', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'FRENCH',
    role: 'noun',
    description: 'the French language',
    emoji: '🇫🇷',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'French', count: 'singular' },
      it: { base: 'francese', gender: 'masc', count: 'singular' },
      fr: { base: 'français', gender: 'masc', count: 'singular' },
      de: { base: 'Französisch', gender: 'neut', count: 'singular' },
      es: { base: 'francés', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'フランス語', count: 'singular', reading: 'ふらんすご' },
      pt: { base: 'francês', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GERMAN',
    role: 'noun',
    description: 'the German language',
    emoji: '🇩🇪',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'German', count: 'singular' },
      it: { base: 'tedesco', gender: 'masc', count: 'singular' },
      fr: { base: 'allemand', gender: 'masc', count: 'singular' },
      de: { base: 'Deutsch', gender: 'neut', count: 'singular' },
      es: { base: 'alemán', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'ドイツ語', count: 'singular', reading: 'どいつご' },
      pt: { base: 'alemão', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SPANISH',
    role: 'noun',
    description: 'the Spanish language',
    emoji: '🇪🇸',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Spanish', count: 'singular' },
      it: { base: 'spagnolo', gender: 'masc', count: 'singular' },
      fr: { base: 'espagnol', gender: 'masc', count: 'singular' },
      de: { base: 'Spanisch', gender: 'neut', count: 'singular' },
      es: { base: 'español', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'スペイン語', count: 'singular', reading: 'すぺいんご' },
      pt: { base: 'espanhol', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'JAPANESE',
    role: 'noun',
    description: 'the Japanese language',
    emoji: '🇯🇵',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Japanese', count: 'singular' },
      it: { base: 'giapponese', gender: 'masc', count: 'singular' },
      fr: { base: 'japonais', gender: 'masc', count: 'singular' },
      de: { base: 'Japanisch', gender: 'neut', count: 'singular' },
      es: { base: 'japonés', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: '日本語', count: 'singular', reading: 'にほんご' },
      pt: { base: 'japonês', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PORTUGUESE',
    role: 'noun',
    description: 'the Portuguese language',
    emoji: '🇵🇹',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Portuguese', count: 'singular' },
      it: { base: 'portoghese', gender: 'masc', count: 'singular' },
      fr: { base: 'portugais', gender: 'masc', count: 'singular' },
      de: { base: 'Portugiesisch', gender: 'neut', count: 'singular' },
      es: { base: 'portugués', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'ポルトガル語', count: 'singular', reading: 'ぽるとがるご' },
      pt: { base: 'português', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PERIOD_TIME',
    role: 'noun',
    description: 'a stretch of time with a beginning and an end',
    emoji: '⏳',
    synonym: 'span of time',
    forms: {
      en: { base: 'period', plural: 'periods', count: 'singular' },
      it: { base: 'periodo', plural: 'periodi', gender: 'masc', count: 'singular' },
      fr: { base: 'période', plural: 'périodes', gender: 'fem', count: 'singular' },
      de: { base: 'Zeitraum', plural: 'Zeiträume', gender: 'masc', count: 'singular' },
      es: { base: 'período', plural: 'períodos', gender: 'masc', count: 'singular' },
      ja: { base: '期間', count: 'singular', reading: 'きかん' },
      pt: { base: 'período', plural: 'períodos', gender: 'masc', count: 'singular' },
    },
  },

  // ── Grammar terms ─────────────────────────────────────────────────
  // The metalinguistic vocabulary the builder itself is made of — the words for the parts of
  // speech and the subject position. Seeded so the engine can render the builder's own slot
  // labels in the current UI language. SUBJECT is suffixed _GRAMMAR because the plain word is
  // ambiguous (topic, school subject) and that sense may be seeded later.
  {
    id: 'SUBJECT_GRAMMAR',
    role: 'noun',
    description: 'the noun phrase a clause predicates something of (grammar)',
    emoji: '🎯',
    synonym: 'grammar',
    forms: {
      en: { base: 'subject', plural: 'subjects', count: 'singular' },
      it: { base: 'soggetto', plural: 'soggetti', gender: 'masc', count: 'singular' },
      fr: { base: 'sujet', plural: 'sujets', gender: 'masc', count: 'singular' },
      de: { base: 'Subjekt', plural: 'Subjekte', gender: 'neut', count: 'singular' },
      es: { base: 'sujeto', plural: 'sujetos', gender: 'masc', count: 'singular' },
      ja: { base: '主語', count: 'singular', reading: 'しゅご' },
      pt: { base: 'sujeito', plural: 'sujeitos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The complement a transitive verb's action falls on, not a physical thing — suffixed like
    // SUBJECT_GRAMMAR because the plain word means both, and only this sense is seeded
    // (ja 目的語, not 物体).
    id: 'OBJECT_GRAMMAR',
    role: 'noun',
    description: 'the noun phrase a verb\'s action falls on (grammar)',
    emoji: '🥅',
    synonym: 'grammar',
    forms: {
      en: { base: 'object', plural: 'objects', count: 'singular' },
      it: { base: 'complemento oggetto', plural: 'complementi oggetto', gender: 'masc', count: 'singular' },
      fr: { base: 'complément d\'objet', plural: 'compléments d\'objet', gender: 'masc', count: 'singular' },
      de: { base: 'Objekt', plural: 'Objekte', gender: 'neut', count: 'singular' },
      es: { base: 'complemento', plural: 'complementos', gender: 'masc', count: 'singular' },
      ja: { base: '目的語', count: 'singular', reading: 'もくてきご' },
      pt: { base: 'objeto', plural: 'objetos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The name of the predicative complement — what a copular verb predicates of its subject
    // ("becomes a legend", "seems happy"). Seeded as one noun per language rather than composed,
    // because no two traditions cut it the same way: fr/pt name it after the subject, es names it
    // alone (the attribute is the subject's by definition — "atributo del sujeto" is an anglicism),
    // and de must be the wider Prädikativ, not Prädikatsnomen, since the slot also takes an
    // adjective. ja distinguishes it from the object complement (目的格補語) by the case name.
    id: 'SUBJECT_COMPLEMENT',
    role: 'noun',
    description: 'the complement a copular verb predicates of its subject (grammar)',
    definition: whoGloss('COMPLEMENT_GRAMMAR', 'DESCRIBE', 'SUBJECT_GRAMMAR'),
    emoji: '🪞',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'subject complement', plural: 'subject complements', count: 'singular' },
      it: { base: 'complemento predicativo del soggetto', plural: 'complementi predicativi del soggetto', gender: 'masc', count: 'singular' },
      fr: { base: 'attribut du sujet', plural: 'attributs du sujet', gender: 'masc', count: 'singular' },
      de: { base: 'Prädikativ', plural: 'Prädikative', gender: 'neut', count: 'singular' },
      es: { base: 'atributo', plural: 'atributos', gender: 'masc', count: 'singular' },
      ja: { base: '主格補語', count: 'singular', reading: 'しゅかくほご' },
      pt: { base: 'predicativo do sujeito', plural: 'predicativos do sujeito', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The name of the instrumental complement — the means or tool an action is carried out
    // with ("start with a word"). Each tradition names it its own way: a bare adjective-turned-
    // noun in en/de (the Indo-European case name), a full phrase in the Romance ones. Only the
    // singular is used (it titles a slot), but the plural is seeded like every other noun.
    id: 'INSTRUMENTAL',
    role: 'noun',
    description: 'the complement naming the means an action is carried out with (grammar)',
    definition: whoGloss('COMPLEMENT_GRAMMAR', 'INDICATE', 'MEANS'),
    emoji: '🔧',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'instrumental', plural: 'instrumentals', count: 'singular' },
      it: { base: 'complemento di mezzo', plural: 'complementi di mezzo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément de moyen', plural: 'compléments de moyen', gender: 'masc', count: 'singular' },
      de: { base: 'Instrumental', plural: 'Instrumentale', gender: 'masc', count: 'singular' },
      es: { base: 'complemento circunstancial de instrumento', plural: 'complementos circunstanciales de instrumento', gender: 'masc', count: 'singular' },
      ja: { base: '手段語', count: 'singular', reading: 'しゅだんご' },
      pt: { base: 'adjunto adverbial de instrumento', plural: 'adjuntos adverbiais de instrumento', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The name of the manner adverbial — the "complemento di modo", how an action is carried out
    // ("run at the speed of light", "cut with care"). Like INSTRUMENTAL, each grammar tradition
    // names it its own way (a full phrase in the Romance/German ones), so it is seeded as one noun
    // concept per language; it titles the slot and its satellite.
    id: 'ADVERBIAL_OF_MANNER',
    role: 'noun',
    description: 'the complement naming the manner in which an action is carried out (grammar)',
    definition: whoGloss('COMPLEMENT_GRAMMAR', 'INDICATE', 'WAY'),
    emoji: '🎭',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'adverbial of manner', plural: 'adverbials of manner', count: 'singular' },
      it: { base: 'complemento di modo', plural: 'complementi di modo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de manière', plural: 'compléments circonstanciels de manière', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'der Art und Weise', citation: 'adverbiale Bestimmung der Art und Weise', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de modo', plural: 'complementos circunstanciales de modo', gender: 'masc', count: 'singular' },
      ja: { base: '状態の副詞語句', count: 'singular', reading: 'じょうたいのふくしごく' },
      pt: { base: 'adjunto adverbial de modo', plural: 'adjuntos adverbiais de modo', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The genus of the complement names: a phrase a verb takes to complete what it says. Suffixed like
    // SUBJECT_GRAMMAR, because the plain word is anything that completes another thing ("a complement
    // to the meal"), and only the grammar sense is seeded. German says Ergänzung, valency grammar's word.
    id: 'COMPLEMENT_GRAMMAR',
    role: 'noun',
    description: 'a phrase that completes the meaning of a verb (grammar)',
    definition: whoGloss('PHRASE', 'MODIFY', 'VERB'),
    emoji: '🧩',
    synonym: 'grammar',
    isA: 'PHRASE',
    forms: {
      en: { base: 'complement', plural: 'complements', count: 'singular' },
      it: { base: 'complemento', plural: 'complementi', gender: 'masc', count: 'singular' },
      fr: { base: 'complément', plural: 'compléments', gender: 'masc', count: 'singular' },
      de: { base: 'Ergänzung', plural: 'Ergänzungen', gender: 'fem', count: 'singular' },
      es: { base: 'complemento', plural: 'complementos', gender: 'masc', count: 'singular' },
      ja: { base: '補語', count: 'singular', reading: 'ほご' },
      pt: { base: 'complemento', plural: 'complementos', gender: 'masc', count: 'singular' },
    },
  },
  // The six complement names the canvas titles its boxes with, besides the three above. Like them,
  // each is one noun per language, because each tradition names the relation its own way: Italian
  // splits the place into four ("stato in luogo", "moto a / da / per luogo"), French, Spanish,
  // Portuguese and German name it after the circumstance ("de lieu", "de lugar", "des Ortes"), and
  // the recipient is an object in most of them (fr "complément d'objet second", es "complemento
  // indirecto", de "Dativobjekt"). English keeps the names the builder has always used.
  // A German name is a head noun between a declining adjective and a fixed genitive: the adjective is
  // the head's inherent `adjective` ("die adverbialen Bestimmungen", "mit der adverbialen Bestimmung",
  // A140), the genitive its `postnominal`, and `citation` the whole name the picker shows.
  {
    id: 'LOCATIVE',
    role: 'noun',
    description: 'the complement naming the place where something happens (grammar)',
    emoji: '📍',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'locative', plural: 'locatives', count: 'singular' },
      it: { base: 'complemento di stato in luogo', plural: 'complementi di stato in luogo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de lieu', plural: 'compléments circonstanciels de lieu', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'des Ortes', citation: 'adverbiale Bestimmung des Ortes', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de lugar', plural: 'complementos circunstanciales de lugar', gender: 'masc', count: 'singular' },
      ja: { base: '場所の副詞語句', count: 'singular', reading: 'ばしょのふくしごく' },
      pt: { base: 'adjunto adverbial de lugar', plural: 'adjuntos adverbiais de lugar', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'DIRECTION',
    role: 'noun',
    description: 'the complement naming the place something moves towards (grammar)',
    emoji: '➡️',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'direction', plural: 'directions', count: 'singular' },
      it: { base: 'complemento di moto a luogo', plural: 'complementi di moto a luogo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de direction', plural: 'compléments circonstanciels de direction', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'der Richtung', citation: 'adverbiale Bestimmung der Richtung', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de dirección', plural: 'complementos circunstanciales de dirección', gender: 'masc', count: 'singular' },
      ja: { base: '方向の副詞語句', count: 'singular', reading: 'ほうこうのふくしごく' },
      pt: { base: 'adjunto adverbial de direção', plural: 'adjuntos adverbiais de direção', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SOURCE',
    role: 'noun',
    description: 'the complement naming the place something moves away from (grammar)',
    emoji: '⬅️',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'source', plural: 'sources', count: 'singular' },
      it: { base: 'complemento di moto da luogo', plural: 'complementi di moto da luogo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de provenance', plural: 'compléments circonstanciels de provenance', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'der Herkunft', citation: 'adverbiale Bestimmung der Herkunft', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de procedencia', plural: 'complementos circunstanciales de procedencia', gender: 'masc', count: 'singular' },
      ja: { base: '起点の副詞語句', count: 'singular', reading: 'きてんのふくしごく' },
      pt: { base: 'adjunto adverbial de origem', plural: 'adjuntos adverbiais de origem', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ROUTE',
    role: 'noun',
    description: 'the complement naming the place something moves through (grammar)',
    emoji: '🛤️',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'route', plural: 'routes', count: 'singular' },
      it: { base: 'complemento di moto per luogo', plural: 'complementi di moto per luogo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de passage', plural: 'compléments circonstanciels de passage', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'des Weges', citation: 'adverbiale Bestimmung des Weges', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de trayecto', plural: 'complementos circunstanciales de trayecto', gender: 'masc', count: 'singular' },
      ja: { base: '経路の副詞語句', count: 'singular', reading: 'けいろのふくしごく' },
      pt: { base: 'adjunto adverbial de percurso', plural: 'adjuntos adverbiais de percurso', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The grammar term, not the seeded CAUSE ("that which makes something else happen"): this is the
    // complement that names one ("because of the dog").
    id: 'CAUSE_COMPLEMENT',
    role: 'noun',
    description: 'the complement naming the reason something happens (grammar)',
    emoji: '❔',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'cause', plural: 'causes', count: 'singular' },
      it: { base: 'complemento di causa', plural: 'complementi di causa', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de cause', plural: 'compléments circonstanciels de cause', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'des Grundes', citation: 'adverbiale Bestimmung des Grundes', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de causa', plural: 'complementos circunstanciales de causa', gender: 'masc', count: 'singular' },
      ja: { base: '原因の副詞語句', count: 'singular', reading: 'げんいんのふくしごく' },
      pt: { base: 'adjunto adverbial de causa', plural: 'adjuntos adverbiais de causa', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The recipient or goal of the action ("gives the book to the cat"). Italian names it after the
    // goal ("complemento di termine"). The other traditions call it an object: the indirect one
    // (es, pt, ja 間接目的語), the second one (fr) or the dative one (de).
    id: 'TERMINUS',
    role: 'noun',
    description: 'the complement naming the recipient or goal of an action (grammar)',
    emoji: '🎁',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'terminus', plural: 'termini', count: 'singular' },
      it: { base: 'complemento di termine', plural: 'complementi di termine', gender: 'masc', count: 'singular' },
      fr: { base: 'complément d\'objet second', plural: 'compléments d\'objet second', gender: 'masc', count: 'singular' },
      de: { base: 'Dativobjekt', plural: 'Dativobjekte', gender: 'neut', count: 'singular' },
      es: { base: 'complemento indirecto', plural: 'complementos indirectos', gender: 'masc', count: 'singular' },
      ja: { base: '間接目的語', count: 'singular', reading: 'かんせつもくてきご' },
      pt: { base: 'objeto indireto', plural: 'objetos indiretos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'NOUN',
    role: 'noun',
    description: 'a word naming a person, place or thing (grammar)',
    definition: whoGloss('WORD', 'NAME', 'OBJECT_THING'),
    emoji: '🏷️',
    isA: 'WORD',
    forms: {
      en: { base: 'noun', plural: 'nouns', count: 'singular' },
      it: { base: 'sostantivo', plural: 'sostantivi', gender: 'masc', count: 'singular' },
      fr: { base: 'nom', plural: 'noms', gender: 'masc', count: 'singular' },
      de: { base: 'Substantiv', plural: 'Substantive', gender: 'neut', count: 'singular' },
      es: { base: 'sustantivo', plural: 'sustantivos', gender: 'masc', count: 'singular' },
      ja: { base: '名詞', count: 'singular', reading: 'めいし' },
      pt: { base: 'substantivo', plural: 'substantivos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PRONOUN',
    role: 'noun',
    description: 'a word standing in for a noun phrase (grammar)',
    definition: whoGloss('WORD', 'REPLACE', 'NOUN'),
    emoji: '👉',
    isA: 'WORD',
    forms: {
      en: { base: 'pronoun', plural: 'pronouns', count: 'singular' },
      it: { base: 'pronome', plural: 'pronomi', gender: 'masc', count: 'singular' },
      fr: { base: 'pronom', plural: 'pronoms', gender: 'masc', count: 'singular' },
      de: { base: 'Pronomen', plural: 'Pronomen', gender: 'neut', count: 'singular' },
      es: { base: 'pronombre', plural: 'pronombres', gender: 'masc', count: 'singular' },
      ja: { base: '代名詞', count: 'singular', reading: 'だいめいし' },
      pt: { base: 'pronome', plural: 'pronomes', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'VERB',
    role: 'noun',
    description: 'a word expressing an action or a state (grammar)',
    definition: whoGloss('WORD', 'EXPRESS', 'ACTION'),
    emoji: '⚡',
    isA: 'WORD',
    forms: {
      en: { base: 'verb', plural: 'verbs', count: 'singular' },
      it: { base: 'verbo', plural: 'verbi', gender: 'masc', count: 'singular' },
      fr: { base: 'verbe', plural: 'verbes', gender: 'masc', count: 'singular' },
      de: { base: 'Verb', plural: 'Verben', gender: 'neut', count: 'singular' },
      es: { base: 'verbo', plural: 'verbos', gender: 'masc', count: 'singular' },
      ja: { base: '動詞', count: 'singular', reading: 'どうし' },
      pt: { base: 'verbo', plural: 'verbos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ADVERB',
    role: 'noun',
    description: 'a word modifying a verb, an adjective or another adverb (grammar)',
    definition: whoGloss('WORD', 'MODIFY', 'VERB'),
    emoji: '💨',
    isA: 'WORD',
    forms: {
      en: { base: 'adverb', plural: 'adverbs', count: 'singular' },
      it: { base: 'avverbio', plural: 'avverbi', gender: 'masc', count: 'singular' },
      fr: { base: 'adverbe', plural: 'adverbes', gender: 'masc', count: 'singular' },
      de: { base: 'Adverb', plural: 'Adverbien', gender: 'neut', count: 'singular' },
      es: { base: 'adverbio', plural: 'adverbios', gender: 'masc', count: 'singular' },
      ja: { base: '副詞', count: 'singular', reading: 'ふくし' },
      pt: { base: 'advérbio', plural: 'advérbios', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ADJECTIVE',
    role: 'noun',
    description: 'a word describing a noun (grammar)',
    definition: whoGloss('WORD', 'DESCRIBE', 'NOUN'),
    emoji: '🎨',
    isA: 'WORD',
    forms: {
      en: { base: 'adjective', plural: 'adjectives', count: 'singular' },
      it: { base: 'aggettivo', plural: 'aggettivi', gender: 'masc', count: 'singular' },
      fr: { base: 'adjectif', plural: 'adjectifs', gender: 'masc', count: 'singular' },
      de: { base: 'Adjektiv', plural: 'Adjektive', gender: 'neut', count: 'singular' },
      es: { base: 'adjetivo', plural: 'adjetivos', gender: 'masc', count: 'singular' },
      ja: { base: '形容詞', count: 'singular', reading: 'けいようし' },
      pt: { base: 'adjetivo', plural: 'adjetivos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The infinitive / citation render mode, named as a grammar construct (see PhrasePlan.infinitive
    // and the seven-engine infinitive surfaces). It names the mode's UI control and its own picker
    // tooltip, engine-composed like the other part-of-speech grammar nouns above — "a phrase that
    // names actions", the nominalising sense that sets the infinitive apart from a finite VERB
    // ("a word that expresses actions").
    id: 'INFINITIVE_PHRASE',
    role: 'noun',
    description: 'a verb phrase in its dictionary citation form — "to consume food" (grammar)',
    definition: whoGloss('PHRASE', 'NAME', 'ACTION'),
    emoji: '♾️',
    isA: 'PHRASE',
    forms: {
      en: { base: 'infinitive phrase', plural: 'infinitive phrases', count: 'singular' },
      it: { base: 'frase infinitiva', plural: 'frasi infinitive', gender: 'fem', count: 'singular' },
      fr: { base: 'proposition infinitive', plural: 'propositions infinitives', gender: 'fem', count: 'singular' },
      de: { base: 'Infinitivphrase', plural: 'Infinitivphrasen', gender: 'fem', count: 'singular' },
      es: { base: 'frase de infinitivo', plural: 'frases de infinitivo', gender: 'fem', count: 'singular' },
      ja: { base: '不定詞句', count: 'singular', reading: 'ふていしく' },
      pt: { base: 'frase infinitiva', plural: 'frases infinitivas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The verb with everything hanging off it: its modals, tense, aspect and adverb. It titles the
    // verb's ring on the canvas. The Romance traditions say "sintagma" / "syntagme" for a phrase in
    // this sense, where PHRASE is the everyday "frase"; German and Japanese compound it on the verb.
    id: 'VERB_PHRASE',
    role: 'noun',
    description: 'a verb together with its objects and modifiers (grammar)',
    emoji: '🧬',
    isA: 'PHRASE',
    forms: {
      en: { base: 'verb phrase', plural: 'verb phrases', count: 'singular' },
      it: { base: 'sintagma verbale', plural: 'sintagmi verbali', gender: 'masc', count: 'singular' },
      fr: { base: 'syntagme verbal', plural: 'syntagmes verbaux', gender: 'masc', count: 'singular' },
      de: { base: 'Verbalphrase', plural: 'Verbalphrasen', gender: 'fem', count: 'singular' },
      es: { base: 'sintagma verbal', plural: 'sintagmas verbales', gender: 'masc', count: 'singular' },
      ja: { base: '動詞句', count: 'singular', reading: 'どうしく' },
      pt: { base: 'sintagma verbal', plural: 'sintagmas verbais', gender: 'masc', count: 'singular' },
    },
  },
  // ── Clauses and their links ───────────────────────────────────────
  // The words for how periods join: the clause a period is, the condition one period sets another,
  // the coordination that joins two of equal rank and the conjunction that spells it, and the
  // conjuncts a coordinated noun is made of. They name the period container's badges and controls.
  {
    // A unit with a verb of its own, as against the PERIOD_SENTENCE built of one or more of them.
    // The Romance traditions call it a proposition (it "proposizione", fr "proposition", es
    // "oración", pt "oração"); German says Satz, the word its compounds use (Hauptsatz, Relativsatz).
    id: 'CLAUSE',
    role: 'noun',
    description: 'a unit of grammar with a verb of its own (grammar)',
    emoji: '🧱',
    isA: 'PHRASE',
    forms: {
      en: { base: 'clause', plural: 'clauses', count: 'singular' },
      it: { base: 'proposizione', plural: 'proposizioni', gender: 'fem', count: 'singular' },
      fr: { base: 'proposition', plural: 'propositions', gender: 'fem', count: 'singular' },
      de: { base: 'Satz', plural: 'Sätze', gender: 'masc', count: 'singular' },
      es: { base: 'oración', plural: 'oraciones', gender: 'fem', count: 'singular' },
      ja: { base: '節', count: 'singular', reading: 'せつ' },
      pt: { base: 'oração', plural: 'orações', gender: 'fem', count: 'singular' },
    },
  },
  {
    // One noun per tradition name, like INSTRUMENTAL: German and Japanese compound it (Relativsatz,
    // 関係節), which no CLAUSE + adjective would give.
    id: 'RELATIVE_CLAUSE',
    role: 'noun',
    description: 'a clause that describes a noun (grammar)',
    emoji: '🪝',
    isA: 'CLAUSE',
    forms: {
      en: { base: 'relative clause', plural: 'relative clauses', count: 'singular' },
      it: { base: 'proposizione relativa', plural: 'proposizioni relative', gender: 'fem', count: 'singular' },
      fr: { base: 'proposition relative', plural: 'propositions relatives', gender: 'fem', count: 'singular' },
      de: { base: 'Relativsatz', plural: 'Relativsätze', gender: 'masc', count: 'singular' },
      es: { base: 'oración de relativo', plural: 'oraciones de relativo', gender: 'fem', count: 'singular' },
      ja: { base: '関係節', count: 'singular', reading: 'かんけいせつ' },
      pt: { base: 'oração relativa', plural: 'orações relativas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'CONDITION',
    role: 'noun',
    description: 'what must be true for something else to happen',
    emoji: '🔀',
    forms: {
      en: { base: 'condition', plural: 'conditions', count: 'singular' },
      it: { base: 'condizione', plural: 'condizioni', gender: 'fem', count: 'singular' },
      fr: { base: 'condition', plural: 'conditions', gender: 'fem', count: 'singular' },
      de: { base: 'Bedingung', plural: 'Bedingungen', gender: 'fem', count: 'singular' },
      es: { base: 'condición', plural: 'condiciones', gender: 'fem', count: 'singular' },
      ja: { base: '条件', count: 'singular', reading: 'じょうけん' },
      pt: { base: 'condição', plural: 'condições', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Joining clauses or phrases of equal rank ("and", "or", "but"), as against subordinating one to
    // another. Japanese names it by the conjoining itself, 等位接続.
    id: 'COORDINATION',
    role: 'noun',
    description: 'the joining of clauses or phrases of equal rank (grammar)',
    emoji: '🔗',
    forms: {
      en: { base: 'coordination', plural: 'coordinations', count: 'singular' },
      it: { base: 'coordinazione', plural: 'coordinazioni', gender: 'fem', count: 'singular' },
      fr: { base: 'coordination', plural: 'coordinations', gender: 'fem', count: 'singular' },
      de: { base: 'Koordination', plural: 'Koordinationen', gender: 'fem', count: 'singular' },
      es: { base: 'coordinación', plural: 'coordinaciones', gender: 'fem', count: 'singular' },
      ja: { base: '等位接続', count: 'singular', reading: 'とういせつぞく' },
      pt: { base: 'coordenação', plural: 'coordenações', gender: 'fem', count: 'singular' },
    },
  },
  {
    // One of the phrases a coordination joins ("Peter" and "Paul" in "Peter and Paul"). Italian,
    // French and German borrow the linguists' word; Spanish and Portuguese have none, and say "the
    // coordinated member".
    id: 'CONJUNCT',
    role: 'noun',
    description: 'one of the phrases a coordination joins (grammar)',
    emoji: '🧷',
    forms: {
      en: { base: 'conjunct', plural: 'conjuncts', count: 'singular' },
      it: { base: 'congiunto', plural: 'congiunti', gender: 'masc', count: 'singular' },
      fr: { base: 'conjoint', plural: 'conjoints', gender: 'masc', count: 'singular' },
      de: { base: 'Konjunkt', plural: 'Konjunkte', gender: 'neut', count: 'singular' },
      es: { base: 'miembro coordinado', plural: 'miembros coordinados', gender: 'masc', count: 'singular' },
      ja: { base: '等位項', count: 'singular', reading: 'とういこう' },
      pt: { base: 'membro coordenado', plural: 'membros coordenados', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'CONJUNCTION',
    role: 'noun',
    description: 'a word that joins clauses or phrases — and, or, but (grammar)',
    emoji: '➕',
    isA: 'WORD',
    forms: {
      en: { base: 'conjunction', plural: 'conjunctions', count: 'singular' },
      it: { base: 'congiunzione', plural: 'congiunzioni', gender: 'fem', count: 'singular' },
      fr: { base: 'conjonction', plural: 'conjonctions', gender: 'fem', count: 'singular' },
      de: { base: 'Konjunktion', plural: 'Konjunktionen', gender: 'fem', count: 'singular' },
      es: { base: 'conjunción', plural: 'conjunciones', gender: 'fem', count: 'singular' },
      ja: { base: '接続詞', count: 'singular', reading: 'せつぞくし' },
      pt: { base: 'conjunção', plural: 'conjunções', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A word that qualifies another, here an attributive noun ("*sail* boat"). It names that word's
    // own controls on the canvas.
    id: 'MODIFIER',
    role: 'noun',
    description: 'a word that qualifies another word (grammar)',
    emoji: '🪄',
    isA: 'WORD',
    forms: {
      en: { base: 'modifier', plural: 'modifiers', count: 'singular' },
      it: { base: 'modificatore', plural: 'modificatori', gender: 'masc', count: 'singular' },
      fr: { base: 'modificateur', plural: 'modificateurs', gender: 'masc', count: 'singular' },
      de: { base: 'Modifikator', plural: 'Modifikatoren', gender: 'masc', count: 'singular' },
      es: { base: 'modificador', plural: 'modificadores', gender: 'masc', count: 'singular' },
      ja: { base: '修飾語', count: 'singular', reading: 'しゅうしょくご' },
      pt: { base: 'modificador', plural: 'modificadores', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A word of broader meaning, which another word is a kind of (ANIMAL of CAT). It names the word
    // map's "is a" relation.
    id: 'HYPERNYM',
    role: 'noun',
    description: 'a word whose meaning includes that of another word (grammar)',
    emoji: '🌳',
    isA: 'WORD',
    forms: {
      en: { base: 'hypernym', plural: 'hypernyms', count: 'singular' },
      it: { base: 'iperonimo', plural: 'iperonimi', gender: 'masc', count: 'singular' },
      fr: { base: 'hyperonyme', plural: 'hyperonymes', gender: 'masc', count: 'singular' },
      de: { base: 'Hyperonym', plural: 'Hyperonyme', gender: 'neut', count: 'singular' },
      es: { base: 'hiperónimo', plural: 'hiperónimos', gender: 'masc', count: 'singular' },
      ja: { base: '上位語', count: 'singular', reading: 'じょういご' },
      pt: { base: 'hiperónimo', plural: 'hiperónimos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'DETERMINER',
    role: 'noun',
    description: 'a word fixing the reference of a noun — the, a, this, some (grammar)',
    emoji: '🔖',
    isA: 'WORD',
    forms: {
      en: { base: 'determiner', plural: 'determiners', count: 'singular' },
      it: { base: 'determinante', plural: 'determinanti', gender: 'masc', count: 'singular' },
      fr: { base: 'déterminant', plural: 'déterminants', gender: 'masc', count: 'singular' },
      de: { base: 'Determinativ', plural: 'Determinative', gender: 'neut', count: 'singular' },
      es: { base: 'determinante', plural: 'determinantes', gender: 'masc', count: 'singular' },
      ja: { base: '限定詞', count: 'singular', reading: 'げんていし' },
      pt: { base: 'determinante', plural: 'determinantes', gender: 'masc', count: 'singular' },
    },
  },
  // The three kinds of determiner, as each language's own grammar tradition names them. They
  // label the sections of the determiner menu — the words a user knows for the dimensions the
  // model calls identifiability / deixis / quantity (shared DeterminerCategory).
  {
    id: 'ARTICLE',
    role: 'noun',
    description: 'the determiner marking a noun as identifiable or not — the, a (grammar)',
    emoji: '📄',
    synonym: 'grammar',
    isA: 'DETERMINER',
    forms: {
      en: { base: 'article', plural: 'articles', count: 'singular' },
      it: { base: 'articolo', plural: 'articoli', gender: 'masc', count: 'singular' },
      fr: { base: 'article', plural: 'articles', gender: 'masc', count: 'singular' },
      de: { base: 'Artikel', plural: 'Artikel', gender: 'masc', count: 'singular' },
      es: { base: 'artículo', plural: 'artículos', gender: 'masc', count: 'singular' },
      ja: { base: '冠詞', count: 'singular', reading: 'かんし' },
      pt: { base: 'artigo', plural: 'artigos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'DEMONSTRATIVE',
    role: 'noun',
    description: 'the determiner that points — this, that (grammar)',
    emoji: '👆',
    isA: 'DETERMINER',
    forms: {
      en: { base: 'demonstrative', plural: 'demonstratives', count: 'singular' },
      it: { base: 'dimostrativo', plural: 'dimostrativi', gender: 'masc', count: 'singular' },
      fr: { base: 'démonstratif', plural: 'démonstratifs', gender: 'masc', count: 'singular' },
      de: { base: 'Demonstrativum', plural: 'Demonstrativa', gender: 'neut', count: 'singular' },
      es: { base: 'demostrativo', plural: 'demostrativos', gender: 'masc', count: 'singular' },
      ja: { base: '指示詞', count: 'singular', reading: 'しじし' },
      pt: { base: 'demonstrativo', plural: 'demonstrativos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'QUANTIFIER',
    role: 'noun',
    description: 'the determiner of amount — some, many, few, all, no (grammar)',
    emoji: '🔢',
    isA: 'DETERMINER',
    forms: {
      en: { base: 'quantifier', plural: 'quantifiers', count: 'singular' },
      it: { base: 'quantificatore', plural: 'quantificatori', gender: 'masc', count: 'singular' },
      fr: { base: 'quantifieur', plural: 'quantifieurs', gender: 'masc', count: 'singular' },
      de: { base: 'Quantor', plural: 'Quantoren', gender: 'masc', count: 'singular' },
      es: { base: 'cuantificador', plural: 'cuantificadores', gender: 'masc', count: 'singular' },
      ja: { base: '数量詞', count: 'singular', reading: 'すうりょうし' },
      pt: { base: 'quantificador', plural: 'quantificadores', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PERIOD_SENTENCE',
    role: 'noun',
    description: 'a complete sentence built of one or more clauses (grammar)',
    emoji: '📝',
    synonym: 'sentence',
    forms: {
      en: { base: 'period', plural: 'periods', count: 'singular' },
      it: { base: 'periodo', plural: 'periodi', gender: 'masc', count: 'singular' },
      fr: { base: 'période', plural: 'périodes', gender: 'fem', count: 'singular' },
      de: { base: 'Satzgefüge', plural: 'Satzgefüge', gender: 'neut', count: 'singular' },
      es: { base: 'período', plural: 'períodos', gender: 'masc', count: 'singular' },
      ja: { base: '文', count: 'singular', reading: 'ぶん' },
      pt: { base: 'período', plural: 'períodos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PERIOD_PUNCTUATION',
    role: 'noun',
    description: 'the full stop that ends a sentence (grammar)',
    emoji: '⏹️',
    synonym: 'full stop',
    forms: {
      en: { base: 'period', plural: 'periods', count: 'singular' },
      it: { base: 'punto', plural: 'punti', gender: 'masc', count: 'singular' },
      fr: { base: 'point', plural: 'points', gender: 'masc', count: 'singular' },
      de: { base: 'Punkt', plural: 'Punkte', gender: 'masc', count: 'singular' },
      es: { base: 'punto', plural: 'puntos', gender: 'masc', count: 'singular' },
      ja: { base: '句点', count: 'singular', reading: 'くてん' },
      pt: { base: 'ponto', plural: 'pontos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'CONTAINER',
    role: 'noun',
    description: 'an object that holds or stores things',
    definition: whoGloss('OBJECT_THING', 'HOLD', 'OBJECT_THING'),
    emoji: '📦',
    isA: 'OBJECT_THING',
    forms: {
      en: { base: 'container', plural: 'containers', count: 'singular' },
      it: { base: 'contenitore', plural: 'contenitori', gender: 'masc', count: 'singular' },
      fr: { base: 'récipient', plural: 'récipients', gender: 'masc', count: 'singular' },
      de: { base: 'Behälter', plural: 'Behälter', gender: 'masc', count: 'singular' },
      es: { base: 'recipiente', plural: 'recipientes', gender: 'masc', count: 'singular' },
      ja: { base: '容器', count: 'singular', reading: 'ようき' },
      pt: { base: 'recipiente', plural: 'recipientes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A drawing of how things lie in relation to each other. The Romance languages split the word
    // the geographical map fell out of: it "mappa" and es/pt "mapa" keep the drawing sense, while
    // fr "carte" and de "Karte" are the same word as a playing card or a menu — the sense is
    // settled by what it is a map *of*, which is exactly what the noun-modifier supplies.
    id: 'MAP',
    role: 'noun',
    description: 'a diagram showing how things are arranged or connected',
    emoji: '🗺️',
    forms: {
      en: { base: 'map', plural: 'maps', count: 'singular' },
      it: { base: 'mappa', plural: 'mappe', gender: 'fem', count: 'singular' },
      fr: { base: 'carte', plural: 'cartes', gender: 'fem', count: 'singular' },
      de: { base: 'Karte', plural: 'Karten', gender: 'fem', count: 'singular' },
      es: { base: 'mapa', plural: 'mapas', gender: 'masc', count: 'singular' },
      ja: { base: '地図', count: 'singular', reading: 'ちず' },
      pt: { base: 'mapa', plural: 'mapas', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A point where the lines of a network meet — the graph-theory sense, which every language
    // takes from the word for a knot (it "nodo", de "Knoten", pt "nó"). Japanese does not: it
    // borrows ノード outright, and 結び目 (a knot in a rope) would not be understood of a graph.
    id: 'NODE',
    role: 'noun',
    description: 'a point where the lines of a network meet',
    emoji: '⚫',
    forms: {
      en: { base: 'node', plural: 'nodes', count: 'singular' },
      it: { base: 'nodo', plural: 'nodi', gender: 'masc', count: 'singular' },
      fr: { base: 'nœud', plural: 'nœuds', gender: 'masc', count: 'singular' },
      de: { base: 'Knoten', plural: 'Knoten', gender: 'masc', count: 'singular' },
      es: { base: 'nodo', plural: 'nodos', gender: 'masc', count: 'singular' },
      ja: { base: 'ノード', count: 'singular', reading: 'のーど' },
      pt: { base: 'nó', plural: 'nós', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The way two things stand to one another — what an edge of the map draws. Feminine across
    // the Romance languages (it "relazione", es "relación"), which is what makes an adjective
    // agreeing with it come out feminine.
    id: 'RELATIONSHIP',
    role: 'noun',
    description: 'the way two things stand to one another',
    emoji: '🔗',
    forms: {
      en: { base: 'relationship', plural: 'relationships', count: 'singular' },
      it: { base: 'relazione', plural: 'relazioni', gender: 'fem', count: 'singular' },
      fr: { base: 'relation', plural: 'relations', gender: 'fem', count: 'singular' },
      de: { base: 'Beziehung', plural: 'Beziehungen', gender: 'fem', count: 'singular' },
      es: { base: 'relación', plural: 'relaciones', gender: 'fem', count: 'singular' },
      ja: { base: '関係', count: 'singular', reading: 'かんけい' },
      pt: { base: 'relação', plural: 'relações', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The grammatical person (who speaks / is spoken to / is spoken about), not a human being —
    // suffixed like SUBJECT_GRAMMAR because the plain word means both, and only this sense is
    // seeded (ja 人称, not 人).
    id: 'PERSON_GRAMMAR',
    role: 'noun',
    description: 'the speaker, the addressee or the one spoken about (grammar)',
    emoji: '🗣️',
    synonym: 'grammar',
    forms: {
      en: { base: 'person', plural: 'persons', count: 'singular' },
      it: { base: 'persona', plural: 'persone', gender: 'fem', count: 'singular' },
      fr: { base: 'personne', plural: 'personnes', gender: 'fem', count: 'singular' },
      de: { base: 'Person', plural: 'Personen', gender: 'fem', count: 'singular' },
      es: { base: 'persona', plural: 'personas', gender: 'fem', count: 'singular' },
      ja: { base: '人称', count: 'singular', reading: 'にんしょう' },
      pt: { base: 'pessoa', plural: 'pessoas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'NUMBER',
    role: 'noun',
    description: 'a value used to count or measure',
    emoji: '🔟',
    forms: {
      en: { base: 'number', plural: 'numbers', count: 'singular' },
      it: { base: 'numero', plural: 'numeri', gender: 'masc', count: 'singular' },
      fr: { base: 'nombre', plural: 'nombres', gender: 'masc', count: 'singular' },
      de: { base: 'Zahl', plural: 'Zahlen', gender: 'fem', count: 'singular' },
      es: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
      ja: { base: '数', count: 'singular', reading: 'かず' },
      pt: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Grammatical number, as against the NUMBER above, which is the one you count with. Most
    // languages happen to use the same word for both (it "numero", fr "nombre"), but German does
    // not — a noun is in the "Numerus" singular, never in the "Zahl" singular — and Japanese
    // reads the same 数 differently in the two senses (すう here, かず for the arithmetic one).
    id: 'NUMBER_GRAMMAR',
    role: 'noun',
    description: 'whether a word refers to one or to more than one (grammar)',
    emoji: '🔢',
    synonym: 'grammar',
    forms: {
      en: { base: 'number', plural: 'numbers', count: 'singular' },
      it: { base: 'numero', plural: 'numeri', gender: 'masc', count: 'singular' },
      fr: { base: 'nombre', plural: 'nombres', gender: 'masc', count: 'singular' },
      de: { base: 'Numerus', plural: 'Numeri', gender: 'masc', count: 'singular' },
      es: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
      ja: { base: '数', count: 'singular', reading: 'すう' },
      pt: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The two values of NUMBER_GRAMMAR, as nouns — what the number control shows when it names a
    // value on its own ("Singular" / "Plural"), with no noun beside it to agree with. The
    // adjectives of the same meaning are seeded separately (SINGULAR / PLURAL in adjectives.ts):
    // a label that sits next to the noun it describes wants those, one that stands alone wants
    // these. Both are borrowed Latin in every language, which is why they look alike throughout.
    id: 'SINGULAR_GRAMMAR',
    role: 'noun',
    description: 'the form of a word referring to one (grammar)',
    emoji: '1️⃣',
    synonym: 'grammar',
    forms: {
      en: { base: 'singular', plural: 'singulars', count: 'singular' },
      it: { base: 'singolare', plural: 'singolari', gender: 'masc', count: 'singular' },
      fr: { base: 'singulier', plural: 'singuliers', gender: 'masc', count: 'singular' },
      de: { base: 'Singular', plural: 'Singulare', gender: 'masc', count: 'singular' },
      es: { base: 'singular', plural: 'singulares', gender: 'masc', count: 'singular' },
      ja: { base: '単数', count: 'singular', reading: 'たんすう' },
      pt: { base: 'singular', plural: 'singulares', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PLURAL_GRAMMAR',
    role: 'noun',
    description: 'the form of a word referring to more than one (grammar)',
    emoji: '🔟',
    synonym: 'grammar',
    forms: {
      en: { base: 'plural', plural: 'plurals', count: 'singular' },
      it: { base: 'plurale', plural: 'plurali', gender: 'masc', count: 'singular' },
      fr: { base: 'pluriel', plural: 'pluriels', gender: 'masc', count: 'singular' },
      de: { base: 'Plural', plural: 'Plurale', gender: 'masc', count: 'singular' },
      es: { base: 'plural', plural: 'plurales', gender: 'masc', count: 'singular' },
      ja: { base: '複数', count: 'singular', reading: 'ふくすう' },
      pt: { base: 'plural', plural: 'plurais', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GENDER',
    role: 'noun',
    description: 'the class a noun belongs to — masculine, feminine, neuter (grammar)',
    emoji: '🚻',
    forms: {
      en: { base: 'gender', plural: 'genders', count: 'singular' },
      it: { base: 'genere', plural: 'generi', gender: 'masc', count: 'singular' },
      fr: { base: 'genre', plural: 'genres', gender: 'masc', count: 'singular' },
      de: { base: 'Geschlecht', plural: 'Geschlechter', gender: 'neut', count: 'singular' },
      es: { base: 'género', plural: 'géneros', gender: 'masc', count: 'singular' },
      ja: { base: '性', count: 'singular', reading: 'せい' },
      pt: { base: 'género', plural: 'géneros', gender: 'masc', count: 'singular' },
    },
  },
  // ── The verb's features ───────────────────────────────────────────
  // What the verb phrase's controls set, each named as its grammar tradition does. The values of
  // tense are nouns, like SINGULAR_GRAMMAR / PLURAL_GRAMMAR: the control shows a value standing
  // alone, and German names the tenses with nouns (Präsens, Präteritum, Futur) that no adjective
  // gives. The aspects and polarities have adjectives in every language, seeded in adjectives.ts.
  {
    // Grammatical time, not the TIME a clock tells. Italian, Spanish and Portuguese use the same word
    // for both ("tempo", "tiempo"); German, Japanese and English do not.
    id: 'TENSE',
    role: 'noun',
    description: 'the form of a verb that places an event in time (grammar)',
    emoji: '⏳',
    forms: {
      en: { base: 'tense', plural: 'tenses', count: 'singular' },
      it: { base: 'tempo', plural: 'tempi', gender: 'masc', count: 'singular' },
      fr: { base: 'temps', plural: 'temps', gender: 'masc', count: 'singular' },
      de: { base: 'Tempus', plural: 'Tempora', gender: 'neut', count: 'singular' },
      es: { base: 'tiempo', plural: 'tiempos', gender: 'masc', count: 'singular' },
      ja: { base: '時制', count: 'singular', reading: 'じせい' },
      pt: { base: 'tempo', plural: 'tempos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PRESENT_TENSE',
    role: 'noun',
    description: 'the tense of what is happening now (grammar)',
    emoji: '⏺️',
    synonym: 'grammar',
    isA: 'TENSE',
    forms: {
      en: { base: 'present', plural: 'presents', count: 'singular' },
      it: { base: 'presente', plural: 'presenti', gender: 'masc', count: 'singular' },
      fr: { base: 'présent', plural: 'présents', gender: 'masc', count: 'singular' },
      de: { base: 'Präsens', plural: 'Präsentia', gender: 'neut', count: 'singular' },
      es: { base: 'presente', plural: 'presentes', gender: 'masc', count: 'singular' },
      ja: { base: '現在', count: 'singular', reading: 'げんざい' },
      pt: { base: 'presente', plural: 'presentes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // German Präteritum, the simple past the engine renders ("der Kater aß"), not the Perfekt.
    id: 'PAST_TENSE',
    role: 'noun',
    description: 'the tense of what has already happened (grammar)',
    emoji: '⏮️',
    synonym: 'grammar',
    isA: 'TENSE',
    forms: {
      en: { base: 'past', plural: 'pasts', count: 'singular' },
      it: { base: 'passato', plural: 'passati', gender: 'masc', count: 'singular' },
      fr: { base: 'passé', plural: 'passés', gender: 'masc', count: 'singular' },
      de: { base: 'Präteritum', plural: 'Präterita', gender: 'neut', count: 'singular' },
      es: { base: 'pasado', plural: 'pasados', gender: 'masc', count: 'singular' },
      ja: { base: '過去', count: 'singular', reading: 'かこ' },
      pt: { base: 'passado', plural: 'passados', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'FUTURE_TENSE',
    role: 'noun',
    description: 'the tense of what is yet to happen (grammar)',
    emoji: '⏭️',
    synonym: 'grammar',
    isA: 'TENSE',
    forms: {
      en: { base: 'future', plural: 'futures', count: 'singular' },
      it: { base: 'futuro', plural: 'futuri', gender: 'masc', count: 'singular' },
      fr: { base: 'futur', plural: 'futurs', gender: 'masc', count: 'singular' },
      de: { base: 'Futur', plural: 'Future', gender: 'neut', count: 'singular' },
      es: { base: 'futuro', plural: 'futuros', gender: 'masc', count: 'singular' },
      ja: { base: '未来', count: 'singular', reading: 'みらい' },
      pt: { base: 'futuro', plural: 'futuros', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Grammatical aspect, not how a thing looks. Japanese linguistics borrows アスペクト; the kanji 相
    // alone would be read as the everyday あい.
    id: 'ASPECT',
    role: 'noun',
    description: 'how a verb presents an event unfolding in time (grammar)',
    emoji: '🎞️',
    synonym: 'grammar',
    forms: {
      en: { base: 'aspect', plural: 'aspects', count: 'singular' },
      it: { base: 'aspetto', plural: 'aspetti', gender: 'masc', count: 'singular' },
      fr: { base: 'aspect', plural: 'aspects', gender: 'masc', count: 'singular' },
      de: { base: 'Aspekt', plural: 'Aspekte', gender: 'masc', count: 'singular' },
      es: { base: 'aspecto', plural: 'aspectos', gender: 'masc', count: 'singular' },
      ja: { base: 'アスペクト', count: 'singular' },
      pt: { base: 'aspecto', plural: 'aspectos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Whether a clause is affirmed or negated. Feminine in the Romance languages, which is what makes
    // its values read "positiva / negativa".
    id: 'POLARITY',
    role: 'noun',
    description: 'whether a clause is affirmed or negated (grammar)',
    emoji: '☯️',
    forms: {
      en: { base: 'polarity', plural: 'polarities', count: 'singular' },
      it: { base: 'polarità', plural: 'polarità', gender: 'fem', count: 'singular' },
      fr: { base: 'polarité', plural: 'polarités', gender: 'fem', count: 'singular' },
      de: { base: 'Polarität', plural: 'Polaritäten', gender: 'fem', count: 'singular' },
      es: { base: 'polaridad', plural: 'polaridades', gender: 'fem', count: 'singular' },
      ja: { base: '極性', count: 'singular', reading: 'きょくせい' },
      pt: { base: 'polaridade', plural: 'polaridades', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The degree of comparison of an adjective (more beautiful, most beautiful), not a unit of heat
    // or a university title. German names it by the step of the comparison, Steigerungsstufe.
    id: 'DEGREE_GRAMMAR',
    role: 'noun',
    description: 'the level of comparison an adjective expresses (grammar)',
    emoji: '📶',
    synonym: 'grammar',
    forms: {
      en: { base: 'degree', plural: 'degrees', count: 'singular' },
      it: { base: 'grado', plural: 'gradi', gender: 'masc', count: 'singular' },
      fr: { base: 'degré', plural: 'degrés', gender: 'masc', count: 'singular' },
      de: { base: 'Steigerungsstufe', plural: 'Steigerungsstufen', gender: 'fem', count: 'singular' },
      es: { base: 'grado', plural: 'grados', gender: 'masc', count: 'singular' },
      ja: { base: '程度', count: 'singular', reading: 'ていど' },
      pt: { base: 'grau', plural: 'graus', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A modal verb (must, can, will), named by its mood in every language (it "verbo modale",
    // fr "verbe modal", de "Modalverb", ja 法助動詞). Italian school grammar also says "verbo servile".
    id: 'MODAL',
    role: 'noun',
    description: 'a verb that expresses necessity, ability or will (grammar)',
    emoji: '🎚️',
    isA: 'VERB',
    forms: {
      en: { base: 'modal', plural: 'modals', count: 'singular' },
      it: { base: 'verbo modale', plural: 'verbi modali', gender: 'masc', count: 'singular' },
      fr: { base: 'verbe modal', plural: 'verbes modaux', gender: 'masc', count: 'singular' },
      de: { base: 'Modalverb', plural: 'Modalverben', gender: 'neut', count: 'singular' },
      es: { base: 'verbo modal', plural: 'verbos modales', gender: 'masc', count: 'singular' },
      ja: { base: '法助動詞', count: 'singular', reading: 'ほうじょどうし' },
      pt: { base: 'verbo modal', plural: 'verbos modais', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'COMMAND',
    role: 'noun',
    description: 'an instruction telling someone or something to act',
    emoji: '🫡',
    forms: {
      en: { base: 'command', plural: 'commands', count: 'singular' },
      it: { base: 'comando', plural: 'comandi', gender: 'masc', count: 'singular' },
      fr: { base: 'commande', plural: 'commandes', gender: 'fem', count: 'singular' },
      de: { base: 'Befehl', plural: 'Befehle', gender: 'masc', count: 'singular' },
      es: { base: 'comando', plural: 'comandos', gender: 'masc', count: 'singular' },
      ja: { base: '命令', count: 'singular', reading: 'めいれい' },
      pt: { base: 'comando', plural: 'comandos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The two registers a command is spoken in, named for the addressee selector. An order is
    // addressed to someone ("run!"); an instruction to nobody — a button, a menu entry, a recipe
    // step ("run"), which the engines render in each language's own label form. Only the command
    // sense is seeded: es "la orden" (fem) is the command, "el orden" the sequence.
    id: 'ORDER',
    role: 'noun',
    description: 'a command telling someone to act',
    emoji: '📢',
    isA: 'COMMAND',
    forms: {
      en: { base: 'order', plural: 'orders', count: 'singular' },
      it: { base: 'ordine', plural: 'ordini', gender: 'masc', count: 'singular' },
      fr: { base: 'ordre', plural: 'ordres', gender: 'masc', count: 'singular' },
      de: { base: 'Befehl', plural: 'Befehle', gender: 'masc', count: 'singular' },
      es: { base: 'orden', plural: 'órdenes', gender: 'fem', count: 'singular' },
      ja: { base: '命令', count: 'singular', reading: 'めいれい' },
      pt: { base: 'ordem', plural: 'ordens', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'INSTRUCTION',
    role: 'noun',
    description: 'a step telling what to do, addressed to nobody',
    emoji: '📋',
    forms: {
      en: { base: 'instruction', plural: 'instructions', count: 'singular' },
      it: { base: 'istruzione', plural: 'istruzioni', gender: 'fem', count: 'singular' },
      fr: { base: 'instruction', plural: 'instructions', gender: 'fem', count: 'singular' },
      de: { base: 'Anweisung', plural: 'Anweisungen', gender: 'fem', count: 'singular' },
      es: { base: 'instrucción', plural: 'instrucciones', gender: 'fem', count: 'singular' },
      ja: { base: '指示', count: 'singular', reading: 'しじ' },
      pt: { base: 'instrução', plural: 'instruções', gender: 'fem', count: 'singular' },
    },
  },
  {
    // One of the alternatives a choice is made between. Feminine in every gendered language.
    id: 'OPTION',
    role: 'noun',
    description: 'one of several possibilities to choose from',
    emoji: '☑️',
    forms: {
      en: { base: 'option', plural: 'options', count: 'singular' },
      it: { base: 'opzione', plural: 'opzioni', gender: 'fem', count: 'singular' },
      fr: { base: 'option', plural: 'options', gender: 'fem', count: 'singular' },
      de: { base: 'Option', plural: 'Optionen', gender: 'fem', count: 'singular' },
      es: { base: 'opción', plural: 'opciones', gender: 'fem', count: 'singular' },
      ja: { base: '選択肢', count: 'singular', reading: 'せんたくし' },
      pt: { base: 'opção', plural: 'opções', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A control one presses, not a fastener on clothing: it "pulsante" (not "bottone"), de "Taste"
    // (not "Knopf"). The katakana ボタン carries no separate reading, like FOX — a hiragana one would
    // be furiganaed over the katakana (see the furigana known bug).
    id: 'BUTTON',
    role: 'noun',
    description: 'a control that is pressed to operate something',
    emoji: '🔘',
    forms: {
      en: { base: 'button', plural: 'buttons', count: 'singular' },
      it: { base: 'pulsante', plural: 'pulsanti', gender: 'masc', count: 'singular' },
      fr: { base: 'bouton', plural: 'boutons', gender: 'masc', count: 'singular' },
      de: { base: 'Taste', plural: 'Tasten', gender: 'fem', count: 'singular' },
      es: { base: 'botón', plural: 'botones', gender: 'masc', count: 'singular' },
      ja: { base: 'ボタン', count: 'singular' },
      pt: { base: 'botão', plural: 'botões', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The set of keys one types on. Katakana キーボード, with no separate reading (see BUTTON).
    id: 'KEYBOARD',
    role: 'noun',
    description: 'a set of keys for typing',
    emoji: '⌨️',
    forms: {
      en: { base: 'keyboard', plural: 'keyboards', count: 'singular' },
      it: { base: 'tastiera', plural: 'tastiere', gender: 'fem', count: 'singular' },
      fr: { base: 'clavier', plural: 'claviers', gender: 'masc', count: 'singular' },
      de: { base: 'Tastatur', plural: 'Tastaturen', gender: 'fem', count: 'singular' },
      es: { base: 'teclado', plural: 'teclados', gender: 'masc', count: 'singular' },
      ja: { base: 'キーボード', count: 'singular' },
      pt: { base: 'teclado', plural: 'teclados', gender: 'masc', count: 'singular' },
    },
  },

  // ── A program's own things ────────────────────────────────────────
  // What the app's dialogs, lists and messages talk about (B25–B27): the name a saved phrase is
  // stored under, the file it is exported to, the icon one presses, the clipboard a translation is
  // copied to. The katakana ones carry no reading (see BUTTON).
  {
    // The noun; NAME is the verb a noun does to things (B06). German Name is a weak noun (den Namen).
    id: 'NAME_NOUN',
    role: 'noun',
    description: 'the word or words something is called by',
    emoji: '🏷️',
    isA: 'WORD',
    forms: {
      en: { base: 'name', plural: 'names', count: 'singular' },
      it: { base: 'nome', plural: 'nomi', gender: 'masc', count: 'singular' },
      fr: { base: 'nom', plural: 'noms', gender: 'masc', count: 'singular' },
      de: { base: 'Name', plural: 'Namen', gender: 'masc', count: 'singular', weak: '1' },
      es: { base: 'nombre', plural: 'nombres', gender: 'masc', count: 'singular' },
      ja: { base: '名前', count: 'singular', reading: 'なまえ' },
      pt: { base: 'nome', plural: 'nomes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The process, a noun in every language: it caricamento, fr chargement, de das Laden (the
    // nominalized infinitive), ja 読み込み, the verbal noun of LOAD. Uncountable.
    id: 'LOADING',
    role: 'noun',
    description: 'the process of bringing data into a program',
    emoji: '⏳',
    countable: false,
    isA: 'PROCESS',
    forms: {
      en: { base: 'loading', count: 'singular' },
      it: { base: 'caricamento', gender: 'masc', count: 'singular' },
      fr: { base: 'chargement', gender: 'masc', count: 'singular' },
      de: { base: 'Laden', gender: 'neut', count: 'singular' },
      es: { base: 'carga', gender: 'fem', count: 'singular' },
      ja: { base: '読み込み', count: 'singular', reading: 'よみこみ' },
      pt: { base: 'carregamento', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The part of a program a person sees and works, not a surface or a socket between machines.
    // German takes the loanword das Interface: Oberfläche and Schnittstelle both compound with a
    // linking -n- ("Oberflächensprache"), which the compound builder does not add (B10).
    id: 'INTERFACE',
    role: 'noun',
    description: 'the part of a program a person sees and uses',
    emoji: '🖥️',
    forms: {
      en: { base: 'interface', plural: 'interfaces', count: 'singular' },
      it: { base: 'interfaccia', plural: 'interfacce', gender: 'fem', count: 'singular' },
      fr: { base: 'interface', plural: 'interfaces', gender: 'fem', count: 'singular' },
      de: { base: 'Interface', plural: 'Interfaces', gender: 'neut', count: 'singular' },
      es: { base: 'interfaz', plural: 'interfaces', gender: 'fem', count: 'singular' },
      ja: { base: 'インターフェース', count: 'singular' },
      pt: { base: 'interface', plural: 'interfaces', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The program that answers another's requests, as the translation server answers the app's — not
    // the one who serves at table. Italian borrows "server", invariable in the plural; German der Server,
    // plural die Server.
    id: 'SERVER',
    role: 'noun',
    description: 'a program that answers the requests of other programs',
    emoji: '🗄️',
    forms: {
      en: { base: 'server', plural: 'servers', count: 'singular' },
      it: { base: 'server', plural: 'server', gender: 'masc', count: 'singular' },
      fr: { base: 'serveur', plural: 'serveurs', gender: 'masc', count: 'singular' },
      de: { base: 'Server', plural: 'Server', gender: 'masc', count: 'singular' },
      es: { base: 'servidor', plural: 'servidores', gender: 'masc', count: 'singular' },
      ja: { base: 'サーバー', count: 'singular' },
      pt: { base: 'servidor', plural: 'servidores', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What a search turns up — "no results" under a picker.
    id: 'RESULT',
    role: 'noun',
    description: 'something found by a search',
    emoji: '🔎',
    forms: {
      en: { base: 'result', plural: 'results', count: 'singular' },
      it: { base: 'risultato', plural: 'risultati', gender: 'masc', count: 'singular' },
      fr: { base: 'résultat', plural: 'résultats', gender: 'masc', count: 'singular' },
      de: { base: 'Ergebnis', plural: 'Ergebnisse', gender: 'neut', count: 'singular' },
      es: { base: 'resultado', plural: 'resultados', gender: 'masc', count: 'singular' },
      ja: { base: '結果', count: 'singular', reading: 'けっか' },
      pt: { base: 'resultado', plural: 'resultados', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The act; IMPORT is the verb. Japanese 取り込み, the verbal noun of that verb's 取り込む.
    id: 'IMPORT_NOUN',
    role: 'noun',
    description: 'the act of bringing data in from a file',
    emoji: '📥',
    isA: 'ACTION',
    forms: {
      en: { base: 'import', plural: 'imports', count: 'singular' },
      it: { base: 'importazione', plural: 'importazioni', gender: 'fem', count: 'singular' },
      fr: { base: 'importation', plural: 'importations', gender: 'fem', count: 'singular' },
      de: { base: 'Import', plural: 'Importe', gender: 'masc', count: 'singular' },
      es: { base: 'importación', plural: 'importaciones', gender: 'fem', count: 'singular' },
      ja: { base: '取り込み', count: 'singular', reading: 'とりこみ' },
      pt: { base: 'importação', plural: 'importações', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The small picture on a control. German Symbol, the word its UIs use for it.
    id: 'ICON',
    role: 'noun',
    description: 'a small picture on a control that shows what it does',
    emoji: '🖼️',
    forms: {
      en: { base: 'icon', plural: 'icons', count: 'singular' },
      it: { base: 'icona', plural: 'icone', gender: 'fem', count: 'singular' },
      fr: { base: 'icône', plural: 'icônes', gender: 'fem', count: 'singular' },
      de: { base: 'Symbol', plural: 'Symbole', gender: 'neut', count: 'singular' },
      es: { base: 'icono', plural: 'iconos', gender: 'masc', count: 'singular' },
      ja: { base: 'アイコン', count: 'singular' },
      pt: { base: 'ícone', plural: 'ícones', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A document stored on a computer. Italian borrows "file", invariable in the plural.
    id: 'FILE',
    role: 'noun',
    description: 'a document stored on a computer',
    emoji: '📄',
    forms: {
      en: { base: 'file', plural: 'files', count: 'singular' },
      it: { base: 'file', plural: 'file', gender: 'masc', count: 'singular' },
      fr: { base: 'fichier', plural: 'fichiers', gender: 'masc', count: 'singular' },
      de: { base: 'Datei', plural: 'Dateien', gender: 'fem', count: 'singular' },
      es: { base: 'archivo', plural: 'archivos', gender: 'masc', count: 'singular' },
      ja: { base: 'ファイル', count: 'singular' },
      pt: { base: 'arquivo', plural: 'arquivos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Where copied content waits to be pasted. French and Spanish compounds are invariable
    // (presse-papiers, portapapeles); Portuguese says "área de transferência".
    id: 'CLIPBOARD',
    role: 'noun',
    description: 'the temporary store for content that has been copied',
    emoji: '📋',
    forms: {
      en: { base: 'clipboard', plural: 'clipboards', count: 'singular' },
      it: { base: 'appunti', plural: 'appunti', gender: 'masc', count: 'singular' },
      fr: { base: 'presse-papiers', plural: 'presse-papiers', gender: 'masc', count: 'singular' },
      de: { base: 'Zwischenablage', plural: 'Zwischenablagen', gender: 'fem', count: 'singular' },
      es: { base: 'portapapeles', plural: 'portapapeles', gender: 'masc', count: 'singular' },
      ja: { base: 'クリップボード', count: 'singular' },
      pt: { base: 'área de transferência', plural: 'áreas de transferência', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'CAUSE',
    role: 'noun',
    description: 'that which makes something else happen',
    emoji: '💥',
    forms: {
      en: { base: 'cause', plural: 'causes', count: 'singular' },
      it: { base: 'causa', plural: 'cause', gender: 'fem', count: 'singular' },
      fr: { base: 'cause', plural: 'causes', gender: 'fem', count: 'singular' },
      de: { base: 'Ursache', plural: 'Ursachen', gender: 'fem', count: 'singular' },
      es: { base: 'causa', plural: 'causas', gender: 'fem', count: 'singular' },
      ja: { base: '原因', count: 'singular', reading: 'げんいん' },
      pt: { base: 'causa', plural: 'causas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'POSSESSOR',
    role: 'noun',
    description: 'the one who owns or holds something',
    definition: whoGloss('PERSON', 'OWN', 'OBJECT_THING'),
    emoji: '🔑',
    animate: true,
    forms: {
      en: { base: 'possessor', plural: 'possessors', count: 'singular' },
      it: { base: 'possessore', plural: 'possessori', gender: 'masc', count: 'singular', fem: 'posseditrice', fem_plural: 'posseditrici' },
      fr: { base: 'possesseur', plural: 'possesseurs', gender: 'masc', count: 'singular', fem: 'possesseuse', fem_plural: 'possesseuses' },
      de: { base: 'Besitzer', plural: 'Besitzer', gender: 'masc', count: 'singular', fem: 'Besitzerin', fem_plural: 'Besitzerinnen' },
      es: { base: 'poseedor', plural: 'poseedores', gender: 'masc', count: 'singular', fem: 'poseedora', fem_plural: 'poseedoras' },
      ja: { base: '所有者', count: 'singular', reading: 'しょゆうしゃ' },
      pt: { base: 'possuidor', plural: 'possuidores', gender: 'masc', count: 'singular', fem: 'possuidora', fem_plural: 'possuidoras' },
    },
  },
  {
    // What a POSSESSOR holds, taken together — possessions, not a building or a trait. A mass noun
    // like MONEY: uncountable, no plural. German Besitz (masc) is the collective holding.
    id: 'PROPERTY',
    role: 'noun',
    description: 'things that someone owns',
    emoji: '💼',
    countable: false,
    synonym: 'possessions',
    forms: {
      en: { base: 'property', count: 'singular' },
      it: { base: 'proprietà', gender: 'fem', count: 'singular' },
      fr: { base: 'propriété', gender: 'fem', count: 'singular' },
      de: { base: 'Besitz', gender: 'masc', count: 'singular' },
      es: { base: 'propiedad', gender: 'fem', count: 'singular' },
      ja: { base: '財産', count: 'singular', reading: 'ざいさん' },
      pt: { base: 'propriedade', gender: 'fem', count: 'singular' },
    },
  },

  // ── What a modifier says of its head ──────────────────────────────
  // The relations an attributive noun bears to the noun it modifies, named in pairs: a boat with a
  // sail has it as a feature, or goes by it as a means; glasses for the sun have it as a purpose or
  // a use; a ring of gold has it as its material or content (CONTENT is seeded above).
  {
    id: 'FEATURE',
    role: 'noun',
    description: 'a distinctive part or quality of something',
    emoji: '✨',
    forms: {
      en: { base: 'feature', plural: 'features', count: 'singular' },
      it: { base: 'caratteristica', plural: 'caratteristiche', gender: 'fem', count: 'singular' },
      fr: { base: 'caractéristique', plural: 'caractéristiques', gender: 'fem', count: 'singular' },
      de: { base: 'Merkmal', plural: 'Merkmale', gender: 'neut', count: 'singular' },
      es: { base: 'característica', plural: 'características', gender: 'fem', count: 'singular' },
      ja: { base: '特徴', count: 'singular', reading: 'とくちょう' },
      pt: { base: 'característica', plural: 'características', gender: 'fem', count: 'singular' },
    },
  },
  {
    // That by which something is done. English "means" is the same in the plural.
    id: 'MEANS',
    role: 'noun',
    description: 'that by which something is done',
    emoji: '🛠️',
    forms: {
      en: { base: 'means', plural: 'means', count: 'singular' },
      it: { base: 'mezzo', plural: 'mezzi', gender: 'masc', count: 'singular' },
      fr: { base: 'moyen', plural: 'moyens', gender: 'masc', count: 'singular' },
      de: { base: 'Mittel', plural: 'Mittel', gender: 'neut', count: 'singular' },
      es: { base: 'medio', plural: 'medios', gender: 'masc', count: 'singular' },
      ja: { base: '手段', count: 'singular', reading: 'しゅだん' },
      pt: { base: 'meio', plural: 'meios', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What something is for. Spanish and Portuguese say "finalidad" / "finalidade", the word for the
    // end a thing serves; "propósito" leans towards a person's intention.
    id: 'PURPOSE',
    role: 'noun',
    description: 'what something is for',
    emoji: '🎯',
    forms: {
      en: { base: 'purpose', plural: 'purposes', count: 'singular' },
      it: { base: 'scopo', plural: 'scopi', gender: 'masc', count: 'singular' },
      fr: { base: 'but', plural: 'buts', gender: 'masc', count: 'singular' },
      de: { base: 'Zweck', plural: 'Zwecke', gender: 'masc', count: 'singular' },
      es: { base: 'finalidad', plural: 'finalidades', gender: 'fem', count: 'singular' },
      ja: { base: '目的', count: 'singular', reading: 'もくてき' },
      pt: { base: 'finalidade', plural: 'finalidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The way a thing is used, a noun: suffixed because USE the verb is its own concept.
    id: 'USE_NOUN',
    role: 'noun',
    description: 'the way something is used',
    emoji: '🧰',
    forms: {
      en: { base: 'use', plural: 'uses', count: 'singular' },
      it: { base: 'uso', plural: 'usi', gender: 'masc', count: 'singular' },
      fr: { base: 'usage', plural: 'usages', gender: 'masc', count: 'singular' },
      de: { base: 'Verwendung', plural: 'Verwendungen', gender: 'fem', count: 'singular' },
      es: { base: 'uso', plural: 'usos', gender: 'masc', count: 'singular' },
      ja: { base: '用途', count: 'singular', reading: 'ようと' },
      pt: { base: 'uso', plural: 'usos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What a thing is made of. French "matériau" (a material to build with), not "matériel" (equipment).
    id: 'MATERIAL',
    role: 'noun',
    description: 'what something is made of',
    emoji: '🧶',
    forms: {
      en: { base: 'material', plural: 'materials', count: 'singular' },
      it: { base: 'materiale', plural: 'materiali', gender: 'masc', count: 'singular' },
      fr: { base: 'matériau', plural: 'matériaux', gender: 'masc', count: 'singular' },
      de: { base: 'Material', plural: 'Materialien', gender: 'neut', count: 'singular' },
      es: { base: 'material', plural: 'materiales', gender: 'masc', count: 'singular' },
      ja: { base: '材料', count: 'singular', reading: 'ざいりょう' },
      pt: { base: 'material', plural: 'materiais', gender: 'masc', count: 'singular' },
    },
  },

  // ── Abstraction levels ────────────────────────────────────────────
  // The three degrees an instrument can be reified to (see AbstractionLevel): an act in flow, the
  // act named, or the thing it leaves behind. Everyday nouns, seeded like any other — the levels
  // just happen to be the first thing that names them.
  {
    id: 'PROCESS',
    role: 'noun',
    description: 'a course of action unfolding step by step',
    emoji: '🔄',
    forms: {
      en: { base: 'process', plural: 'processes', count: 'singular' },
      it: { base: 'processo', plural: 'processi', gender: 'masc', count: 'singular' },
      fr: { base: 'processus', plural: 'processus', gender: 'masc', count: 'singular' },
      de: { base: 'Prozess', plural: 'Prozesse', gender: 'masc', count: 'singular' },
      es: { base: 'proceso', plural: 'procesos', gender: 'masc', count: 'singular' },
      ja: { base: '過程', count: 'singular', reading: 'かてい' },
      pt: { base: 'processo', plural: 'processos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The abstract notion, not a draft or a plan — de Begriff (the philosophical sense), not
    // Konzept, which is the sketch one writes before doing the thing.
    id: 'CONCEPT',
    role: 'noun',
    description: 'an abstract notion, a thing thought rather than held',
    emoji: '💡',
    forms: {
      en: { base: 'concept', plural: 'concepts', count: 'singular' },
      it: { base: 'concetto', plural: 'concetti', gender: 'masc', count: 'singular' },
      fr: { base: 'concept', plural: 'concepts', gender: 'masc', count: 'singular' },
      de: { base: 'Begriff', plural: 'Begriffe', gender: 'masc', count: 'singular' },
      es: { base: 'concepto', plural: 'conceptos', gender: 'masc', count: 'singular' },
      ja: { base: '概念', count: 'singular', reading: 'がいねん' },
      pt: { base: 'conceito', plural: 'conceitos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The physical thing, as against the grammatical OBJECT_GRAMMAR the same English word also
    // means: this is the one a hand closes on (ja 物体, not 目的語), which is why the ids split.
    id: 'ACTION',
    role: 'noun',
    description: 'a thing done; what a verb expresses',
    emoji: '🎬',
    forms: {
      en: { base: 'action', plural: 'actions', count: 'singular' },
      it: { base: 'azione', plural: 'azioni', gender: 'fem', count: 'singular' },
      fr: { base: 'action', plural: 'actions', gender: 'fem', count: 'singular' },
      de: { base: 'Handlung', plural: 'Handlungen', gender: 'fem', count: 'singular' },
      es: { base: 'acción', plural: 'acciones', gender: 'fem', count: 'singular' },
      ja: { base: '動作', count: 'singular', reading: 'どうさ' },
      pt: { base: 'ação', plural: 'ações', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'OBJECT_THING',
    role: 'noun',
    description: 'a material thing one can hold or use',
    emoji: '📦',
    synonym: 'thing',
    forms: {
      en: { base: 'object', plural: 'objects', count: 'singular' },
      it: { base: 'oggetto', plural: 'oggetti', gender: 'masc', count: 'singular' },
      fr: { base: 'objet', plural: 'objets', gender: 'masc', count: 'singular' },
      de: { base: 'Gegenstand', plural: 'Gegenstände', gender: 'masc', count: 'singular' },
      es: { base: 'objeto', plural: 'objetos', gender: 'masc', count: 'singular' },
      ja: { base: '物体', count: 'singular', reading: 'ぶったい' },
      pt: { base: 'objeto', plural: 'objetos', gender: 'masc', count: 'singular' },
    },
  },
];
