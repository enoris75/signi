import type { ConceptSeed } from './types.js';

// Each noun below is defined by the phrase it is short for (P13: written in the phrase language).
// The shapes they take, each with the localization task that settled it:
//
//  - **Genus and differentia** — an indefinite noun phrase whose head is the genus (usually the
//    concept's own hypernym) carrying differentia adjectives: `/subj ( MAMMAL /adj SMALL /a )` → en
//    "a small mammal", it "un piccolo mammifero", de "ein kleines Säugetier", ja "小さい哺乳類". A
//    **mass** genus takes the bare determiner (`/zero`) instead of the indefinite that counts it:
//    `/subj ( SUBSTANCE /adj SOLID /zero )` → en "solid substance", de "fester Stoff", fr "substance
//    solide", ja "固体の物質", not *a solid substance*. Localization A23 (TEXT), B53 (GROUND), B56
//    (CONTINENT).
//  - **Who does it** — a subject-gap relative clause on an indefinite genus: `/subj ( PERSON /a /rel
//    #2.subj )` over `/subj ( PERSON ) /verb ( MAKE ) /obj ( OBJECT_THING /pl /zero )` → en "a person
//    who makes objects", it "una persona che fa oggetti", de "eine Person, die Gegenstände macht", ja
//    "物体を作る人". The object reads as a bare plural ("objects", not "the objects"); a **mass** one
//    reads bare in the singular: LOADING is a process that loads content, not *contents* (B57).
//    CONTENT is a count noun elsewhere in the corpus (B10 pins "die Inhalte"), so the number is the
//    gloss's choice, not the lexeme's.
//  - **What one does it to** — an object-gap relative clause whose subject is the generic "one": `/subj
//    ( OBJECT_THING /a /rel #2.obj )` over `/subj ( one ) /verb ( EAT ) /obj ( OBJECT_THING )` → en
//    "an object that one eats", it "un oggetto che si mangia", fr "un objet qu'on mange", de "ein
//    Gegenstand, den man isst", ja "食べる物体". The generic subject renders as a placed word
//    (en/de/fr) or an impersonal clitic (it/es/pt), and drops in Japanese — see its seed and
//    isGenericSubject in the engine. A **mass** genus is bare: HELP is "content that one shows", de
//    "Inhalt, den man zeigt", while French still writes the partitive its grammar requires (*du
//    contenu qu'on montre*). Localization A23. With a **named** agent instead of "one", `/subj (
//    PARTICIPANT_GRAMMAR /a /rel #2.obj )` over `/subj ( VERB /a ) /verb ( GOVERN ) …` → en "a
//    participant that a verb governs", de "ein Partizipant, den ein Verb regiert", ja
//    "動詞が支配する参与者": a grammatical object (the verb governs its case) said beside a subject,
//    which the subject gap says the other way round. Localization A27; B56 glosses COUNTRY with it.
//  - **Where one does it** — a locative-gap relative clause, `/rel #2.loc`, with its own generic
//    subject: en "a place where one eats", it "un luogo dove si mangia", fr "un lieu où l'on mange",
//    de "ein Ort, an dem man isst", ja "食べる場所". The verb must license a `locative`. Added for B32;
//    the engine side that renders the relative adverb is C07.
//  - **What one does it with** — an instrumental-gap relative clause, `/rel #2.inst`: `/subj ( ORGAN
//    /a /rel #2.inst )` over `/subj ( one ) /verb ( SEE )` → en "an organ with which one sees", it "un
//    organo con il quale si vede", fr "un organe avec lequel on voit", de "ein Organ, mit dem man
//    sieht", ja "見る器官". An object is an indefinite singular, "makes **an** object": a bare plural
//    would meet the Portuguese impersonal *se*, which does not yet agree with a plural object (A206 —
//    "se faz objetos"). Localization C26 (EYE, MATERIAL).
//  - **A part of a whole** — PART with the whole as its genitive, `/whole`: `/subj ( PART /a /poss [
//    KEYBOARD /a ] /whole )` → en "a part of a keyboard", it "una parte di una tastiera", fr "une
//    partie d'un clavier", de "ein Teil einer Tastatur", ja "キーボードの部分". The six other
//    languages render the genitive they already had; English turns from the Saxon "a keyboard's part"
//    (a part the keyboard owns) into an of-phrase. Localization C26 (KEY, ROW, REGION, ORGAN); FLAME,
//    DEATH and BLADE write the same relation out, on a definite head.
//  - **A period counted in smaller ones** — C26's `/parts` possessor under C31's cardinal: `/subj (
//    PERIOD_TIME /a /poss [ HOUR /a /num 24 ] /parts )` → en "a period of twenty-four hours", it "un
//    periodo di ventiquattro ore", de "ein Zeitraum von vierundzwanzig Stunden", ja 二十四時間の期間.
//    The cardinal pluralises the unit and takes the Japanese counter the noun names (C31).
//  - **A language** — the definite LANGUAGE with its country as the genitive: `/subj ( LANGUAGE /poss
//    [ ITALY ] )` → en "Italy's language", it "la lingua dell'Italia", de "die Sprache Italiens", ja
//    "イタリアの言語" (B36). Definite, because "a language of Italy" says one of several.
//  - **Kin** — the relative one is to somebody else, said as the genitive the languages already have:
//    `/subj ( BROTHER /a /poss [ PARENT /a ] )` → en "a parent's brother", it "un fratello di un
//    genitore", de "ein Bruder eines Elternteils", ja 親の兄弟. The head is definite where the relation
//    is unique (one father per parent, one mother per spouse): "the father of a parent", which English
//    still writes as the Saxon genitive, since that takes the possessor's determiner. The plain owner
//    role, not C26's part-whole: a father is not a part of a parent (B71–B73). A **sibling** is a
//    person who has the same parents, with an optional sex adjective on the head: en "a male person
//    who has the same parents", de "eine männliche Person, die die gleichen Eltern hat", ja
//    同じ親を持つ男性の人. The head is PERSON rather than the genus SIBLING because Romance has no
//    neutral word for a sibling to modify ("una sorella femminile" for SISTER), where PERSON is
//    neutral in all seven (B69). A **step-parent** is a parent's spouse who is not the parent — the
//    genitive with a negated copular relative beside it, because "a mother's husband" is true of every
//    father: en "a mother's husband who is not a father", de "ein Ehemann einer Mutter, der kein Vater
//    ist", ja 父ではない母親の夫. One head carrying both a genitive and a relative clause is BLADE's
//    shape ("the part of an object that cuts"). B73.

// A German noun's `compound` form is the stem it takes as the first element of a compound, its
// linking element (Fugenelement) included: "Hunde" (Hundebuch), "Lebens", "Kinder", "Sprach". It is
// seeded only where the engine's suffix rule would get it wrong — -s- after -ung/-heit/-keit/-schaft/
// -ion/-tät/-ling/-tum, -n- after a feminine -e, a weak masculine's -(e)n, nothing otherwise (see
// `compoundStem` in the German engine, B10).
export const nouns: ConceptSeed[] = [
  // ── NOUNS ────────────────────────────────────────────────────────
  {
    id: 'ANIMAL',
    role: 'noun',
    description: 'a living creature other than a person',
    definition: `
      /subj ( BEING /a /rel #2.subj )
      /subj ( BEING ) /verb ( MOVE_ONESELF )
    `,
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
    definition: `
      /subj ( ANIMAL /a /rel #2.subj )
      /subj ( ANIMAL ) /verb ( PRODUCE ) /obj ( MILK /pl /zero )
    `,
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
    definition: '/subj ( MAMMAL /adj SMALL /a )',
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
    definition: '/subj ( MAMMAL /adj DOMESTIC /adj CANINE /a )',
    emoji: '🐶',
    animate: true,
    isA: 'MAMMAL',
    forms: {
      en: { base: 'dog', plural: 'dogs', count: 'singular' },
      it: { base: 'cane', plural: 'cani', gender: 'masc', count: 'singular', fem: 'cagna', fem_plural: 'cagne' },
      fr: { base: 'chien', plural: 'chiens', gender: 'masc', count: 'singular', fem: 'chienne', fem_plural: 'chiennes' },
      de: { base: 'Hund', plural: 'Hunde', gender: 'masc', count: 'singular', fem: 'Hündin', fem_plural: 'Hündinnen', compound: 'Hunde' },
      es: { base: 'perro', plural: 'perros', gender: 'masc', count: 'singular', fem: 'perra', fem_plural: 'perras' },
      ja: { base: '犬', count: 'singular', reading: 'いぬ' },
      pt: { base: 'cão', plural: 'cães', gender: 'masc', count: 'singular', fem: 'cadela', fem_plural: 'cadelas' },
    },
  },
  {
    id: 'BOOK',
    role: 'noun',
    description: 'a written or printed work',
    definition: '/subj ( OBJECT_THING /adj WRITTEN /a )',
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
    id: 'AIR',
    role: 'noun',
    description: 'the gas that surrounds the earth',
    definition: `
      /subj ( GAS /zero /rel #2.obj )
      /subj ( one ) /verb ( BREATHE ) /obj ( GAS )
    `,
    emoji: '💨',
    countable: false,
    forms: {
      en: { base: 'air', count: 'singular' },
      it: { base: 'aria', gender: 'fem', count: 'singular' },
      fr: { base: 'air', gender: 'masc', count: 'singular' },
      de: { base: 'Luft', plural: 'Lüfte', gender: 'fem', count: 'singular' },
      es: { base: 'aire', gender: 'masc', count: 'singular' },
      ja: { base: '空気', count: 'singular', reading: 'くうき' },
      pt: { base: 'ar', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The surface one stands on, where a collapse ends: COLLAPSE is "to move to the ground suddenly"
    // (localization B34), AIR's counterpart in JUMP's gloss. Italian "suolo", not "terra", which with
    // the article reads as the Earth ("alla terra"); Portuguese "chão", the ground underfoot.
    id: 'GROUND',
    role: 'noun',
    description: 'the solid surface of the earth',
    definition: '/subj ( SUBSTANCE /adj SOLID /zero )',
    emoji: '🟫',
    forms: {
      en: { base: 'ground', plural: 'grounds', count: 'singular' },
      it: { base: 'suolo', plural: 'suoli', gender: 'masc', count: 'singular' },
      fr: { base: 'sol', plural: 'sols', gender: 'masc', count: 'singular' },
      de: { base: 'Boden', plural: 'Böden', gender: 'masc', count: 'singular' },
      es: { base: 'suelo', plural: 'suelos', gender: 'masc', count: 'singular' },
      ja: { base: '地面', count: 'singular', reading: 'じめん' },
      pt: { base: 'chão', plural: 'chãos', gender: 'masc', count: 'singular' },
    },
  },

  {
    id: 'WATER',
    role: 'noun',
    description: 'the liquid H₂O',
    definition: `
      /subj ( LIQUID /zero /rel #2.obj )
      /subj ( one ) /verb ( DRINK ) /obj ( LIQUID )
    `,
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
    definition: `
      /subj ( CONCEPT /a /rel #2.obj )
      /subj ( one ) /verb ( SEE ) /obj ( CONCEPT )
    `,
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
    definition: `
      /subj ( CONCEPT /a /rel #2.obj )
      /subj ( one ) /verb ( HEAR ) /obj ( CONCEPT )
    `,
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
    //
    // Temporal: it names a point in time, an occasion, not a rate as SPEED does. So under an
    // adjective it keeps the article a rate drops, "at the other time" beside "at high speed"
    // (A235), and German says it with "zu" + dative, "zu allen Zeiten", not measure's "mit" (A60).
    id: 'TIME',
    role: 'noun',
    description: 'the indefinite continued progress of existence; an occasion',
    emoji: '⏰',
    mannerRelation: 'measure',
    temporal: true,
    forms: {
      en: { base: 'time', plural: 'times', count: 'singular' },
      it: { base: 'tempo', plural: 'tempi', gender: 'masc', count: 'singular' },
      fr: { base: 'temps', plural: 'temps', gender: 'masc', count: 'singular' },
      de: { base: 'Zeit', plural: 'Zeiten', gender: 'fem', count: 'singular' },
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
      de: { base: 'Sorgfalt', gender: 'fem', count: 'singular', compound: 'Sorgfalts' },
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
    // The scale LONG sits on, as SIZE is BIG's: "of great length" (localization B87). Portuguese
    // comprimento, the measured length (longitude is the geographic one); Spanish longitud.
    id: 'LENGTH',
    role: 'noun',
    description: 'how long something is; extent from end to end',
    emoji: '↔️',
    dimensionRelation: 'extent',
    forms: {
      en: { base: 'length', plural: 'lengths', count: 'singular' },
      it: { base: 'lunghezza', plural: 'lunghezze', gender: 'fem', count: 'singular' },
      fr: { base: 'longueur', plural: 'longueurs', gender: 'fem', count: 'singular' },
      de: { base: 'Länge', plural: 'Längen', gender: 'fem', count: 'singular' },
      es: { base: 'longitud', plural: 'longitudes', gender: 'fem', count: 'singular' },
      ja: { base: '長さ', count: 'singular', reading: 'ながさ' },
      pt: { base: 'comprimento', plural: 'comprimentos', gender: 'masc', count: 'singular' },
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
      de: { base: 'Stärke', plural: 'Stärken', gender: 'fem', count: 'singular', compound: 'Stärke' },
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
      de: { base: 'Alter', plural: 'Alter', gender: 'neut', count: 'singular', compound: 'Alters' },
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
    // The scale NEAR and FAR sit on (localization C24): "at small distance" / "at great distance", a
    // point on the scale like TEMPERATURE's, so `measure`. German Entfernung, the everyday word
    // ("in großer Entfernung"); Abstand is the gap between two things.
    id: 'DISTANCE',
    role: 'noun',
    description: 'how far apart two things are',
    emoji: '📐',
    dimensionRelation: 'measure',
    forms: {
      en: { base: 'distance', plural: 'distances', count: 'singular' },
      it: { base: 'distanza', plural: 'distanze', gender: 'fem', count: 'singular' },
      fr: { base: 'distance', plural: 'distances', gender: 'fem', count: 'singular' },
      de: { base: 'Entfernung', plural: 'Entfernungen', gender: 'fem', count: 'singular' },
      es: { base: 'distancia', plural: 'distancias', gender: 'fem', count: 'singular' },
      ja: { base: '距離', count: 'singular', reading: 'きょり' },
      pt: { base: 'distância', plural: 'distâncias', gender: 'fem', count: 'singular' },
    },
  },
  // What ROUND is glossed on (localization C24): "whose shape is a circle", the genitive relative
  // HYPERNYM uses. Neither is a scale, so neither takes a `dimensionRelation`. A circle is a shape.
  {
    id: 'SHAPE',
    role: 'noun',
    description: "the form a thing's outline takes",
    emoji: '🔷',
    forms: {
      en: { base: 'shape', plural: 'shapes', count: 'singular' },
      it: { base: 'forma', plural: 'forme', gender: 'fem', count: 'singular' },
      fr: { base: 'forme', plural: 'formes', gender: 'fem', count: 'singular' },
      de: { base: 'Form', plural: 'Formen', gender: 'fem', count: 'singular' },
      es: { base: 'forma', plural: 'formas', gender: 'fem', count: 'singular' },
      ja: { base: '形', count: 'singular', reading: 'かたち' },
      pt: { base: 'forma', plural: 'formas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'CIRCLE',
    role: 'noun',
    description: 'a round figure, every point of it equally far from its middle',
    emoji: '⚪',
    isA: 'SHAPE',
    forms: {
      en: { base: 'circle', plural: 'circles', count: 'singular' },
      it: { base: 'cerchio', plural: 'cerchi', gender: 'masc', count: 'singular' },
      fr: { base: 'cercle', plural: 'cercles', gender: 'masc', count: 'singular' },
      de: { base: 'Kreis', plural: 'Kreise', gender: 'masc', count: 'singular' },
      es: { base: 'círculo', plural: 'círculos', gender: 'masc', count: 'singular' },
      ja: { base: '円', count: 'singular', reading: 'えん' },
      pt: { base: 'círculo', plural: 'círculos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The drawn line, `synonym: 'stroke'` (localization B78): "a long shape", on B87's LONG. LINE is
    // the line of text typed as one command (riga, Zeile, 行), and a queue (fila, file, Schlange, 列)
    // would be a third concept. French ligne, Spanish línea and Portuguese linha are LINE's words too;
    // Italian linea / riga, German Linie / Zeile and Japanese 線 / 行 split them.
    id: 'LINE_MARK',
    role: 'noun',
    description: 'a long thin mark drawn or printed on a surface',
    definition: '/subj ( SHAPE /adj LONG /a )',
    emoji: '➖',
    isA: 'SHAPE',
    synonym: 'stroke',
    forms: {
      en: { base: 'line', plural: 'lines', count: 'singular' },
      it: { base: 'linea', plural: 'linee', gender: 'fem', count: 'singular' },
      fr: { base: 'ligne', plural: 'lignes', gender: 'fem', count: 'singular' },
      de: { base: 'Linie', plural: 'Linien', gender: 'fem', count: 'singular' },
      es: { base: 'línea', plural: 'líneas', gender: 'fem', count: 'singular' },
      ja: { base: '線', count: 'singular', reading: 'せん' },
      pt: { base: 'linha', plural: 'linhas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'MONEY',
    role: 'noun',
    description: 'a medium of exchange',
    definition: `
      /subj ( OBJECT_THING /a /rel #2.obj )
      /subj ( one ) /verb ( EXCHANGE ) /obj ( OBJECT_THING )
    `,
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
    definition: `
      /subj ( OBJECT_THING /a /rel #2.obj )
      /subj ( one ) /verb ( EAT ) /obj ( OBJECT_THING )
    `,
    emoji: '🍽️',
    countable: false,
    forms: {
      en: { base: 'food', count: 'singular' },
      it: { base: 'cibo', gender: 'masc', count: 'singular' },
      fr: { base: 'nourriture', gender: 'fem', count: 'singular' },
      de: { base: 'Essen', gender: 'neut', count: 'singular', compound: 'Essens' },
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
    definition: '/subj ( FOOD /adj COLD /adj SWEET /a )',
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
    // What SWEET is glossed on: "that has sugar" (localization C24). A mass noun, as FOOD is; Spanish
    // azúcar is masculine in the everyday usage (el azúcar).
    id: 'SUGAR',
    role: 'noun',
    description: 'a sweet substance made from plants and eaten in food',
    emoji: '🍯',
    countable: false,
    isA: 'FOOD',
    forms: {
      en: { base: 'sugar', count: 'singular' },
      it: { base: 'zucchero', gender: 'masc', count: 'singular' },
      fr: { base: 'sucre', gender: 'masc', count: 'singular' },
      de: { base: 'Zucker', gender: 'masc', count: 'singular' },
      es: { base: 'azúcar', gender: 'masc', count: 'singular' },
      ja: { base: '砂糖', count: 'singular', reading: 'さとう' },
      pt: { base: 'açúcar', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The differentia object of DRINK's dictionary definition ("to consume liquid"). A mass noun,
    // modelled on FOOD — uncountable, no plural, and rendered bare in the gloss. Glossed by what one
    // does to a liquid and not to a gas: "substance that one pours" (localization C26). "Not solid" is
    // true of a gas too, and "that one drinks" is WATER's differentia.
    id: 'LIQUID',
    role: 'noun',
    description: 'a fluid substance, something to drink',
    definition: `
      /subj ( SUBSTANCE /zero /rel #2.obj )
      /subj ( one ) /verb ( POUR ) /obj ( SUBSTANCE )
    `,
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
    definition: `
      /subj ( OBJECT_THING /a /rel #2.obj )
      /subj ( one ) /verb ( INCLUDE ) /obj ( OBJECT_THING )
    `,
    emoji: '🗃️',
    forms: {
      en: { base: 'content', plural: 'contents', count: 'singular' },
      it: { base: 'contenuto', plural: 'contenuti', gender: 'masc', count: 'singular' },
      fr: { base: 'contenu', plural: 'contenus', gender: 'masc', count: 'singular' },
      de: { base: 'Inhalt', plural: 'Inhalte', gender: 'masc', count: 'singular', compound: 'Inhalts' },
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
      de: { base: 'Ort', plural: 'Orte', gender: 'masc', count: 'singular', compound: 'Orts', place_prep: 'an' },
      es: { base: 'lugar', plural: 'lugares', gender: 'masc', count: 'singular' },
      ja: { base: '場所', count: 'singular', reading: 'ばしょ' },
      pt: { base: 'lugar', plural: 'lugares', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P09's point (localization B65), the position: the one sense all seven say with one word. A
    // score, an item and an aspect grow out of it; the purpose (senso, Sinn, 意味) and the sharp end
    // (punta, Spitze) are other words, so other concepts. Suffixed as D2 asks: the verb POINT stays
    // unseeded (C12). German takes "an", like Ort and Ausgangspunkt (A218): an diesem Punkt. Seeded
    // ahead of B65's other nouns because B61's TURN is glossed on it ("to move around a point").
    // "A place that does not have size": the `no` determiner would say "no size", but renders it
    // nessuna dimensione, aucune taille, どの大きさもない ("no size of any kind").
    id: 'POINT_NOUN',
    role: 'noun',
    description: 'a position with no size',
    definition: `
      /subj ( PLACE /a /rel #2.subj )
      /subj ( PLACE ) /verb ( HAVE /not ) /obj ( SIZE /zero )
    `,
    emoji: '🔸',
    isA: 'PLACE',
    forms: {
      en: { base: 'point', plural: 'points', count: 'singular' },
      it: { base: 'punto', plural: 'punti', gender: 'masc', count: 'singular' },
      fr: { base: 'point', plural: 'points', gender: 'masc', count: 'singular' },
      de: { base: 'Punkt', plural: 'Punkte', gender: 'masc', count: 'singular', place_prep: 'an' },
      es: { base: 'punto', plural: 'puntos', gender: 'masc', count: 'singular' },
      ja: { base: '点', count: 'singular', reading: 'てん' },
      pt: { base: 'ponto', plural: 'pontos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A part of a place or of land (localization B78), not REGION, the UI's "part of a page or a
    // screen". French zone, Spanish zona and Portuguese área are REGION's words too; the glosses tell
    // them apart. German Gebiet and Japanese 地域 differ from REGION's Bereich and 領域.
    id: 'AREA',
    role: 'noun',
    description: 'a part of a place, a town or a country',
    definition: '/subj ( PART /a /poss [ PLACE /a ] /whole )',
    emoji: '🗾',
    isA: 'PLACE',
    forms: {
      en: { base: 'area', plural: 'areas', count: 'singular' },
      it: { base: 'zona', plural: 'zone', gender: 'fem', count: 'singular' },
      fr: { base: 'zone', plural: 'zones', gender: 'fem', count: 'singular' },
      de: { base: 'Gebiet', plural: 'Gebiete', gender: 'neut', count: 'singular' },
      es: { base: 'zona', plural: 'zonas', gender: 'fem', count: 'singular' },
      ja: { base: '地域', count: 'singular', reading: 'ちいき' },
      pt: { base: 'área', plural: 'áreas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The middle of a thing, `synonym: 'middle'`; the institution (centro, Zentrum, センター) is another
    // concept. Literal by design (localization B78): a center is defined by its distance from the
    // edges, and neither EDGE nor MIDDLE is seeded; MAIN is the grammar's "not depending on another
    // clause" (übergeordnet, 主), and "a point that is far" says the opposite.
    id: 'CENTER',
    role: 'noun',
    description: 'the middle point or part of something',
    emoji: '🎯',
    synonym: 'middle',
    forms: {
      en: { base: 'center', plural: 'centers', count: 'singular' },
      it: { base: 'centro', plural: 'centri', gender: 'masc', count: 'singular' },
      fr: { base: 'centre', plural: 'centres', gender: 'masc', count: 'singular' },
      de: { base: 'Mitte', plural: 'Mitten', gender: 'fem', count: 'singular' },
      es: { base: 'centro', plural: 'centros', gender: 'masc', count: 'singular' },
      ja: { base: '中心', count: 'singular', reading: 'ちゅうしん' },
      pt: { base: 'centro', plural: 'centros', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A part of an object that is not the center: a genitive and a negated copular relative on one
    // head, STEPFATHER's shape. Thin (a corner is one too), but the one lead that does not come out
    // as every part. Japanese 側面, the free noun: 側 (がわ) is bound in everyday use (右側, 向こう側),
    // and 猫は側を見ます is stiff.
    id: 'SIDE',
    role: 'noun',
    description: 'a part of a thing away from its middle; a face or edge of it',
    definition: `
      /subj ( PART /a /poss [ OBJECT_THING /a ] /whole /rel #2.subj )
      /subj ( PART ) /verb ( BE /not ) /pred ( CENTER /the )
    `,
    emoji: '🔲',
    isA: 'PART',
    forms: {
      en: { base: 'side', plural: 'sides', count: 'singular' },
      it: { base: 'lato', plural: 'lati', gender: 'masc', count: 'singular' },
      fr: { base: 'côté', plural: 'côtés', gender: 'masc', count: 'singular' },
      de: { base: 'Seite', plural: 'Seiten', gender: 'fem', count: 'singular' },
      es: { base: 'lado', plural: 'lados', gender: 'masc', count: 'singular' },
      ja: { base: '側面', count: 'singular', reading: 'そくめん' },
      pt: { base: 'lado', plural: 'lados', gender: 'masc', count: 'singular' },
    },
  },
  // ── The places of a motion ────────────────────────────────────────
  // Where a motion ends, starts and passes: what the direction, source and route complements indicate
  // (localization B37, "a complement that indicates destinations"). Each is a place, but one reached,
  // left or crossed, which PLACE alone does not say. German "Ziel" and Japanese 目的地 are the goal of a
  // journey; 起点 and 経路 are the words the source and route complements are named with in Japanese.
  {
    id: 'DESTINATION',
    role: 'noun',
    description: 'the place where a motion ends',
    emoji: '🏁',
    isA: 'PLACE',
    forms: {
      en: { base: 'destination', plural: 'destinations', count: 'singular' },
      it: { base: 'destinazione', plural: 'destinazioni', gender: 'fem', count: 'singular' },
      fr: { base: 'destination', plural: 'destinations', gender: 'fem', count: 'singular' },
      de: { base: 'Ziel', plural: 'Ziele', gender: 'neut', count: 'singular', place_prep: 'an' },
      es: { base: 'destino', plural: 'destinos', gender: 'masc', count: 'singular' },
      ja: { base: '目的地', count: 'singular', reading: 'もくてきち' },
      pt: { base: 'destino', plural: 'destinos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ORIGIN',
    role: 'noun',
    description: 'the place where a motion starts',
    emoji: '🚩',
    isA: 'PLACE',
    forms: {
      en: { base: 'origin', plural: 'origins', count: 'singular' },
      it: { base: 'origine', plural: 'origini', gender: 'fem', count: 'singular' },
      fr: { base: 'origine', plural: 'origines', gender: 'fem', count: 'singular' },
      de: { base: 'Ausgangspunkt', plural: 'Ausgangspunkte', gender: 'masc', count: 'singular', place_prep: 'an' },
      es: { base: 'origen', plural: 'orígenes', gender: 'masc', count: 'singular' },
      ja: { base: '起点', count: 'singular', reading: 'きてん' },
      pt: { base: 'origem', plural: 'origens', gender: 'fem', count: 'singular' },
    },
  },
  {
    // French "parcours" is the same word in the plural.
    id: 'PATH',
    role: 'noun',
    description: 'the way a motion goes through',
    emoji: '🛣️',
    isA: 'PLACE',
    forms: {
      en: { base: 'path', plural: 'paths', count: 'singular' },
      it: { base: 'percorso', plural: 'percorsi', gender: 'masc', count: 'singular' },
      fr: { base: 'parcours', plural: 'parcours', gender: 'masc', count: 'singular' },
      de: { base: 'Weg', plural: 'Wege', gender: 'masc', count: 'singular' },
      es: { base: 'recorrido', plural: 'recorridos', gender: 'masc', count: 'singular' },
      ja: { base: '経路', count: 'singular', reading: 'けいろ' },
      pt: { base: 'percurso', plural: 'percursos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The way a thing moves or faces, not a place it goes to: what BACKWARDS is glossed by, "in the
    // opposite direction" (localization C25). DIRECTION is the grammar's complement, so this one takes
    // the suffix. German Richtung links a compound with -s- by the -ung rule (Richtungswechsel).
    id: 'DIRECTION_SPACE',
    role: 'noun',
    description: 'the way something moves or faces',
    emoji: '🧭',
    forms: {
      en: { base: 'direction', plural: 'directions', count: 'singular' },
      it: { base: 'direzione', plural: 'direzioni', gender: 'fem', count: 'singular' },
      fr: { base: 'direction', plural: 'directions', gender: 'fem', count: 'singular' },
      de: { base: 'Richtung', plural: 'Richtungen', gender: 'fem', count: 'singular' },
      es: { base: 'dirección', plural: 'direcciones', gender: 'fem', count: 'singular' },
      // A direction is no place an act goes on in, so its locative takes に, not the で of an
      // ordinary place: 反対の方向に走ります, "runs in the opposite direction" (A220).
      ja: { base: '方向', count: 'singular', reading: 'ほうこう', locative_particle: 'に' },
      pt: { base: 'direção', plural: 'direções', gender: 'fem', count: 'singular' },
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
    definition: `
      /subj ( PLACE /a /rel #2.subj )
      /subj ( PLACE ) /verb ( HAVE ) /obj ( WALL /pl /zero )
    `,
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
    definition: `
      /subj ( OBJECT_THING /a /rel #2.subj )
      /subj ( OBJECT_THING ) /verb ( ENCLOSE ) /obj ( PLACE /pl /zero )
    `,
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
    definition: `
      /subj ( BUILDING /a /rel #2.loc )
      /subj ( one ) /verb ( LIVE ) /loc ( BUILDING )
    `,
    emoji: '🏠',
    isA: 'BUILDING',
    forms: {
      en: { base: 'house', plural: 'houses', count: 'singular' },
      it: { base: 'casa', plural: 'case', gender: 'fem', count: 'singular' },
      fr: { base: 'maison', plural: 'maisons', gender: 'fem', count: 'singular' },
      de: { base: 'Haus', plural: 'Häuser', gender: 'neut', count: 'singular' },
      es: { base: 'casa', plural: 'casas', gender: 'fem', count: 'singular' },
      ja: { base: '家', count: 'singular', reading: 'いえ', counter: '軒' },
      pt: { base: 'casa', plural: 'casas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'HOME',
    role: 'noun',
    description: 'the place where one lives',
    definition: `
      /subj ( PLACE /a /rel #2.loc )
      /subj ( one ) /verb ( LIVE ) /loc ( PLACE )
    `,
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
  // ── The parts of a building, and what one goes in (localization B78) ─
  {
    // The part of a building, not room as space (posto, place, Platz), which is another concept.
    // Portuguese cômodo, the generic room (quarto is a bedroom, sala a living room); Spanish
    // habitación. German Zimmer is the same in the plural.
    id: 'ROOM',
    role: 'noun',
    description: 'a part of a building enclosed by walls',
    definition: '/subj ( PART /a /poss [ BUILDING /a ] /whole )',
    emoji: '🛋️',
    isA: 'PLACE',
    forms: {
      en: { base: 'room', plural: 'rooms', count: 'singular' },
      it: { base: 'stanza', plural: 'stanze', gender: 'fem', count: 'singular' },
      fr: { base: 'pièce', plural: 'pièces', gender: 'fem', count: 'singular' },
      de: { base: 'Zimmer', plural: 'Zimmer', gender: 'neut', count: 'singular' },
      es: { base: 'habitación', plural: 'habitaciones', gender: 'fem', count: 'singular' },
      ja: { base: '部屋', count: 'singular', reading: 'へや' },
      pt: { base: 'cômodo', plural: 'cômodos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A room where one works, not a building: a building where one works is a factory too, and
    // every office is at least a room. French bureau pluralises in -x.
    id: 'OFFICE',
    role: 'noun',
    description: 'a room where people work',
    definition: `
      /subj ( ROOM /a /rel #2.loc )
      /subj ( one ) /verb ( WORK_LABOUR ) /loc ( ROOM )
    `,
    emoji: '🗄️',
    isA: 'ROOM',
    forms: {
      en: { base: 'office', plural: 'offices', count: 'singular' },
      it: { base: 'ufficio', plural: 'uffici', gender: 'masc', count: 'singular' },
      fr: { base: 'bureau', plural: 'bureaux', gender: 'masc', count: 'singular' },
      de: { base: 'Büro', plural: 'Büros', gender: 'neut', count: 'singular' },
      es: { base: 'oficina', plural: 'oficinas', gender: 'fem', count: 'singular' },
      ja: { base: '事務所', count: 'singular', reading: 'じむしょ' },
      pt: { base: 'escritório', plural: 'escritórios', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A part of a wall that one opens: C26's part-whole genitive carrying an object-gap relative.
    // Japanese 開く壁の部分 can also read "the part of the wall that opens", which is a door as well.
    id: 'DOOR',
    role: 'noun',
    description: 'a panel in a wall that opens and closes',
    definition: `
      /subj ( PART /a /poss [ WALL /a ] /whole /rel #2.obj )
      /subj ( one ) /verb ( OPEN ) /obj ( PART )
    `,
    emoji: '🚪',
    forms: {
      en: { base: 'door', plural: 'doors', count: 'singular' },
      it: { base: 'porta', plural: 'porte', gender: 'fem', count: 'singular' },
      fr: { base: 'porte', plural: 'portes', gender: 'fem', count: 'singular' },
      de: { base: 'Tür', plural: 'Türen', gender: 'fem', count: 'singular' },
      es: { base: 'puerta', plural: 'puertas', gender: 'fem', count: 'singular' },
      ja: { base: 'ドア', count: 'singular' },
      pt: { base: 'porta', plural: 'portas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // An object with which one goes to a place. It is not a vehicle gloss (VEHICLE is not seeded):
    // a bicycle fits it too. The goal keeps German from "mit dem man geht" ("walks with"), and MOVE
    // would say the UI's verschieben. Spanish coche, the peninsular word; Portuguese carro, the
    // Brazilian one the corpus's Portuguese already is. Japanese counts cars with 台.
    id: 'CAR',
    role: 'noun',
    description: 'a road vehicle with an engine, for a few people',
    definition: `
      /subj ( OBJECT_THING /a /rel #2.inst )
      /subj ( one ) /verb ( GO ) /dir ( PLACE /a )
    `,
    emoji: '🚗',
    isA: 'OBJECT_THING',
    forms: {
      en: { base: 'car', plural: 'cars', count: 'singular' },
      it: { base: 'macchina', plural: 'macchine', gender: 'fem', count: 'singular' },
      fr: { base: 'voiture', plural: 'voitures', gender: 'fem', count: 'singular' },
      de: { base: 'Auto', plural: 'Autos', gender: 'neut', count: 'singular' },
      es: { base: 'coche', plural: 'coches', gender: 'masc', count: 'singular' },
      ja: { base: '車', count: 'singular', reading: 'くるま', counter: '台' },
      pt: { base: 'carro', plural: 'carros', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'CHILD',
    role: 'noun',
    description: 'a young human being',
    definition: '/subj ( PERSON /adj YOUNG /a )',
    emoji: '👦',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'child', plural: 'children', count: 'singular' },
      it: { base: 'bambino', plural: 'bambini', gender: 'masc', count: 'singular', fem: 'bambina', fem_plural: 'bambine' },
      fr: { base: 'enfant', plural: 'enfants', gender: 'masc', count: 'singular', fem: 'enfant', fem_plural: 'enfants' },
      de: { base: 'Kind', plural: 'Kinder', gender: 'neut', count: 'singular', compound: 'Kinder' },
      es: { base: 'niño', plural: 'niños', gender: 'masc', count: 'singular', fem: 'niña', fem_plural: 'niñas' },
      ja: { base: '子供', count: 'singular', reading: 'こども' },
      pt: { base: 'criança', plural: 'crianças', gender: 'fem', count: 'singular' },
    },
  },
  {
    // P09-E24's kid (localization B75): CHILD in casual speech, a register word like MOM and DAD and
    // literal by design on their precedent — "a child" restates CHILD's word and carries no register.
    // German has no everyday informal word for a child, so its Kind is CHILD's; Japanese 子 is 子供
    // in short. The Romance words have the feminine CHILD's do (ragazzina, gamine, chica, garota).
    id: 'KID',
    role: 'noun',
    description: 'a child, in casual speech',
    emoji: '🧒',
    animate: true,
    human: true,
    synonym: 'informal',
    isA: 'CHILD',
    forms: {
      en: { base: 'kid', plural: 'kids', count: 'singular' },
      it: { base: 'ragazzino', plural: 'ragazzini', gender: 'masc', count: 'singular', fem: 'ragazzina', fem_plural: 'ragazzine' },
      fr: { base: 'gamin', plural: 'gamins', gender: 'masc', count: 'singular', fem: 'gamine', fem_plural: 'gamines' },
      de: { base: 'Kind', plural: 'Kinder', gender: 'neut', count: 'singular', compound: 'Kinder' },
      es: { base: 'chico', plural: 'chicos', gender: 'masc', count: 'singular', fem: 'chica', fem_plural: 'chicas' },
      ja: { base: '子', count: 'singular', reading: 'こ' },
      pt: { base: 'garoto', plural: 'garotos', gender: 'masc', count: 'singular', fem: 'garota', fem_plural: 'garotas' },
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
      de: { base: 'Person', plural: 'Personen', gender: 'fem', count: 'singular', compound: 'Personen' },
      es: { base: 'persona', plural: 'personas', gender: 'fem', count: 'singular' },
      ja: { base: '人', count: 'singular', reading: 'ひと' },
      pt: { base: 'pessoa', plural: 'pessoas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The person who is speaking, as a linguist says it: the deixis of COME, "to move to the speaker"
    // (localization B35). The term in each language, not the loudspeaker. Human, which is what gives
    // an animate goal its "vers" / "hacia" / "para" where a place would take "à" / "a".
    id: 'SPEAKER',
    role: 'noun',
    description: 'the person who is speaking',
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( SPEAK )
    `,
    emoji: '🗣️',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'speaker', plural: 'speakers', count: 'singular' },
      it: { base: 'parlante', plural: 'parlanti', gender: 'masc', count: 'singular', fem: 'parlante', fem_plural: 'parlanti' },
      fr: { base: 'locuteur', plural: 'locuteurs', gender: 'masc', count: 'singular', fem: 'locutrice', fem_plural: 'locutrices' },
      de: { base: 'Sprecher', plural: 'Sprecher', gender: 'masc', count: 'singular', fem: 'Sprecherin', fem_plural: 'Sprecherinnen' },
      es: { base: 'hablante', plural: 'hablantes', gender: 'masc', count: 'singular', fem: 'hablante', fem_plural: 'hablantes' },
      ja: { base: '話し手', count: 'singular', reading: 'はなして' },
      pt: { base: 'falante', plural: 'falantes', gender: 'masc', count: 'singular', fem: 'falante', fem_plural: 'falantes' },
    },
  },
  // The parties the comitative and the terminus complements indicate (localization B37): the one an
  // action is done together with, and the one it is done to or for.
  {
    id: 'COMPANION',
    role: 'noun',
    description: 'one who does something together with another',
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( ACCOMPANY ) /obj ( PERSON /pl /zero )
    `,
    emoji: '👯',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'companion', plural: 'companions', count: 'singular' },
      it: { base: 'compagno', plural: 'compagni', gender: 'masc', count: 'singular', fem: 'compagna', fem_plural: 'compagne' },
      fr: { base: 'compagnon', plural: 'compagnons', gender: 'masc', count: 'singular', fem: 'compagne', fem_plural: 'compagnes' },
      de: { base: 'Begleiter', plural: 'Begleiter', gender: 'masc', count: 'singular', fem: 'Begleiterin', fem_plural: 'Begleiterinnen' },
      es: { base: 'compañero', plural: 'compañeros', gender: 'masc', count: 'singular', fem: 'compañera', fem_plural: 'compañeras' },
      ja: { base: '同伴者', count: 'singular', reading: 'どうはんしゃ' },
      pt: { base: 'companheiro', plural: 'companheiros', gender: 'masc', count: 'singular', fem: 'companheira', fem_plural: 'companheiras' },
    },
  },
  {
    id: 'RECIPIENT',
    role: 'noun',
    description: 'one who receives something',
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( ACQUIRE ) /obj ( OBJECT_THING /pl /zero )
    `,
    emoji: '📬',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'recipient', plural: 'recipients', count: 'singular' },
      it: { base: 'destinatario', plural: 'destinatari', gender: 'masc', count: 'singular', fem: 'destinataria', fem_plural: 'destinatarie' },
      fr: { base: 'destinataire', plural: 'destinataires', gender: 'masc', count: 'singular', fem: 'destinataire', fem_plural: 'destinataires' },
      de: { base: 'Empfänger', plural: 'Empfänger', gender: 'masc', count: 'singular', fem: 'Empfängerin', fem_plural: 'Empfängerinnen' },
      es: { base: 'destinatario', plural: 'destinatarios', gender: 'masc', count: 'singular', fem: 'destinataria', fem_plural: 'destinatarias' },
      ja: { base: '受け手', count: 'singular', reading: 'うけて' },
      pt: { base: 'destinatário', plural: 'destinatários', gender: 'masc', count: 'singular', fem: 'destinatária', fem_plural: 'destinatárias' },
    },
  },
  {
    id: 'FOX',
    role: 'noun',
    description: 'a carnivorous mammal with reddish fur',
    definition: '/subj ( MAMMAL /adj BROWN /a )',
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
    definition: '/subj ( PERSON /adj YOUNG /adj MALE /a )',
    emoji: '👦',
    animate: true,
    human: true,
    sex: 'masc',
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
    // P09-E24's girl (localization B75), BOY's counterpart. Its gloss is YOUNG_WOMAN's, character for
    // character in all seven, as BOY's is YOUNG_MAN's: the one lead that tells them apart, "a female
    // child", fails where CHILD's word is masculine and FEMALE does not feminize it (un bambino
    // femminile, un niño femenino). sweep-definitions.test.ts allows the pair by design.
    id: 'GIRL',
    role: 'noun',
    description: 'a young female human',
    definition: '/subj ( PERSON /adj YOUNG /adj FEMALE /a )',
    emoji: '👧',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'PERSON',
    forms: {
      en: { base: 'girl', plural: 'girls', count: 'singular' },
      it: { base: 'ragazza', plural: 'ragazze', gender: 'fem', count: 'singular' },
      fr: { base: 'fille', plural: 'filles', gender: 'fem', count: 'singular' },
      // Mädchen is neuter, as every -chen diminutive is, and the same word in the plural.
      de: { base: 'Mädchen', plural: 'Mädchen', gender: 'neut', count: 'singular' },
      es: { base: 'niña', plural: 'niñas', gender: 'fem', count: 'singular' },
      ja: { base: '女の子', count: 'singular', reading: 'おんなのこ' },
      pt: { base: 'menina', plural: 'meninas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'MAN',
    role: 'noun',
    description: 'an adult male human',
    definition: '/subj ( PERSON /adj ADULT /adj MALE /a )',
    emoji: '👨',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'PERSON',
    forms: {
      en: { base: 'man', plural: 'men', count: 'singular' },
      it: { base: 'uomo', plural: 'uomini', gender: 'masc', count: 'singular' },
      // "homme" begins with an h muet: silent, so the article elides ("l'homme") exactly as before
      // a vowel. The flag marks that; an h aspiré noun ("héros" → le héros) would carry none.
      fr: { base: 'homme', plural: 'hommes', gender: 'masc', count: 'singular', elides: '1' },
      de: { base: 'Mann', plural: 'Männer', gender: 'masc', count: 'singular', compound: 'Männer' },
      es: { base: 'hombre', plural: 'hombres', gender: 'masc', count: 'singular' },
      ja: { base: '男', count: 'singular', reading: 'おとこ' },
      pt: { base: 'homem', plural: 'homens', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P09-E24's guy (localization B75): MAN in casual speech, literal by design as KID is. German Typ
    // is the weak masculine of the colloquial sense (den Typen, dem Typen). Japanese takes the neutral
    // 男の人 over やつ, which is pejorative in many contexts and would stand unglossed beside MAN's 男.
    id: 'GUY',
    role: 'noun',
    description: 'a man, in casual speech',
    emoji: '🧔',
    animate: true,
    human: true,
    sex: 'masc',
    synonym: 'informal',
    isA: 'MAN',
    forms: {
      en: { base: 'guy', plural: 'guys', count: 'singular' },
      it: { base: 'tipo', plural: 'tipi', gender: 'masc', count: 'singular' },
      fr: { base: 'type', plural: 'types', gender: 'masc', count: 'singular' },
      de: { base: 'Typ', plural: 'Typen', gender: 'masc', count: 'singular', weak: '1' },
      es: { base: 'tipo', plural: 'tipos', gender: 'masc', count: 'singular' },
      ja: { base: '男の人', count: 'singular', reading: 'おとこのひと' },
      pt: { base: 'cara', plural: 'caras', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WOMAN',
    role: 'noun',
    description: 'an adult female human',
    definition: '/subj ( PERSON /adj ADULT /adj FEMALE /a )',
    emoji: '👩',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'PERSON',
    forms: {
      en: { base: 'woman', plural: 'women', count: 'singular' },
      it: { base: 'donna', plural: 'donne', gender: 'fem', count: 'singular' },
      fr: { base: 'femme', plural: 'femmes', gender: 'fem', count: 'singular' },
      de: { base: 'Frau', plural: 'Frauen', gender: 'fem', count: 'singular', compound: 'Frauen' },
      es: { base: 'mujer', plural: 'mujeres', gender: 'fem', count: 'singular' },
      ja: { base: '女', count: 'singular', reading: 'おんな' },
      pt: { base: 'mulher', plural: 'mulheres', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'WOLF',
    role: 'noun',
    description: 'a wild canine animal',
    definition: '/subj ( MAMMAL /adj WILD /adj CANINE /a )',
    emoji: '🐺',
    animate: true,
    alarm: true, // "cry wolf": gridare al lupo, crier au loup
    isA: 'MAMMAL',
    forms: {
      en: { base: 'wolf', plural: 'wolves', count: 'singular' },
      it: { base: 'lupo', plural: 'lupi', gender: 'masc', count: 'singular', fem: 'lupa', fem_plural: 'lupe' },
      fr: { base: 'loup', plural: 'loups', gender: 'masc', count: 'singular', fem: 'louve', fem_plural: 'louves' },
      de: { base: 'Wolf', plural: 'Wölfe', gender: 'masc', count: 'singular', fem: 'Wölfin', fem_plural: 'Wölfinnen', compound: 'Wolfs' },
      es: { base: 'lobo', plural: 'lobos', gender: 'masc', count: 'singular', fem: 'loba', fem_plural: 'lobas' },
      ja: { base: '狼', count: 'singular', reading: 'おおかみ' },
      pt: { base: 'lobo', plural: 'lobos', gender: 'masc', count: 'singular', fem: 'loba', fem_plural: 'lobas' },
    },
  },
  {
    id: 'BOVINE',
    role: 'noun',
    description: 'a large ruminant mammal of the cattle kind',
    definition: `
      /subj ( MAMMAL /a /rel #2.subj )
      /subj ( MAMMAL ) /verb ( EAT_ANIMAL ) /obj ( GRASS /pl /zero )
    `,
    emoji: '🐄',
    animate: true,
    isA: 'MAMMAL',
    forms: {
      en: { base: 'bovine', plural: 'bovines', count: 'singular' },
      it: { base: 'bovino', plural: 'bovini', gender: 'masc', count: 'singular' },
      fr: { base: 'bovin', plural: 'bovins', gender: 'masc', count: 'singular' },
      de: { base: 'Rind', plural: 'Rinder', gender: 'neut', count: 'singular', compound: 'Rinder' },
      es: { base: 'bovino', plural: 'bovinos', gender: 'masc', count: 'singular' },
      ja: { base: '牛', count: 'singular', reading: 'うし' },
      pt: { base: 'bovino', plural: 'bovinos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'COW',
    role: 'noun',
    description: 'an adult female bovine kept for milk or meat',
    definition: '/subj ( MAMMAL /adj BIG /a )',
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
    definition: '/subj ( BOVINE /adj CASTRATED /adj ADULT /adj MALE /a )',
    emoji: '🐂',
    animate: true,
    isA: 'BOVINE',
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
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( KILL ) /obj ( ANIMAL /pl /zero )
    `,
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
    human: true,
    forms: {
      en: { base: 'angel', plural: 'angels', count: 'singular' },
      it: { base: 'angelo', plural: 'angeli', gender: 'masc', count: 'singular' },
      fr: { base: 'ange', plural: 'anges', gender: 'masc', count: 'singular' },
      de: { base: 'Engel', plural: 'Engel', gender: 'masc', count: 'singular', compound: 'Engels' },
      es: { base: 'ángel', plural: 'ángeles', gender: 'masc', count: 'singular' },
      ja: { base: '天使', count: 'singular', reading: 'てんし' },
      pt: { base: 'anjo', plural: 'anjos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The differentia object of KILL's dictionary definition ("to destroy life"), and DEATH's
    // antonym. Countable like DEATH ("lives"), but rendered bare-singular in the gloss the way FIRE
    // is. Japanese takes 生命 (life as a phenomenon) over 命 (one's own life).
    //
    // Glossed "the state of a being that lives", on LIVE_ALIVE — the seeded LIVE is the dwelling one,
    // which four languages say with abitare / habiter / wohnen / 住む (localization C26). The being is
    // the `whole` of its state, so English writes it as an of-phrase rather than a Saxon genitive that
    // would have to hang the relative clause before "'s".
    id: 'LIFE',
    role: 'noun',
    description: 'the condition of being alive',
    definition: `
      /subj ( STATE /poss [ BEING /a /rel #2.subj ] /whole )
      /subj ( BEING ) /verb ( LIVE_ALIVE )
    `,
    emoji: '🌱',
    forms: {
      en: { base: 'life', plural: 'lives', count: 'singular' },
      it: { base: 'vita', plural: 'vite', gender: 'fem', count: 'singular' },
      fr: { base: 'vie', plural: 'vies', gender: 'fem', count: 'singular' },
      de: { base: 'Leben', plural: 'Leben', gender: 'neut', count: 'singular', compound: 'Lebens' },
      es: { base: 'vida', plural: 'vidas', gender: 'fem', count: 'singular' },
      ja: { base: '生命', count: 'singular', reading: 'せいめい' },
      pt: { base: 'vida', plural: 'vidas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The last part of a thing, the word DEATH's gloss turns on: "the end of a life" (localization
    // C26). A part-whole primitive like PART, so it has no gloss of its own. Feminine in Italian and
    // French (la fine, la fin), masculine in Spanish and Portuguese (el fin, o fim), where the
    // feminine la final / a final is a match's last round; German das Ende, whose compound stem
    // drops the -e (Endpunkt).
    id: 'END',
    role: 'noun',
    description: 'the last part of something',
    emoji: '🔚',
    forms: {
      en: { base: 'end', plural: 'ends', count: 'singular' },
      it: { base: 'fine', plural: 'fini', gender: 'fem', count: 'singular' },
      fr: { base: 'fin', plural: 'fins', gender: 'fem', count: 'singular' },
      de: { base: 'Ende', plural: 'Enden', gender: 'neut', count: 'singular', compound: 'End', place_prep: 'an' },
      es: { base: 'fin', plural: 'fines', gender: 'masc', count: 'singular' },
      ja: { base: '終わり', count: 'singular', reading: 'おわり' },
      pt: { base: 'fim', plural: 'fins', gender: 'masc', count: 'singular' },
    },
  },
  {
    // END's counterpart, the first part of a thing — and the noun intransitive BEGIN's gloss turns
    // on, "to have a beginning", which is how Italian dictionaries give intransitive *iniziare*
    // ("avere inizio"). Masculine in Italian, French, Spanish and Portuguese (l'inizio, le début,
    // el comienzo, o início); German der Anfang, umlauting in the plural (Anfänge).
    id: 'BEGINNING',
    role: 'noun',
    description: 'the first part of something; the point at which something begins',
    emoji: '🏁',
    forms: {
      en: { base: 'beginning', plural: 'beginnings', count: 'singular' },
      it: { base: 'inizio', plural: 'inizi', gender: 'masc', count: 'singular' },
      fr: { base: 'début', plural: 'débuts', gender: 'masc', count: 'singular' },
      de: { base: 'Anfang', plural: 'Anfänge', gender: 'masc', count: 'singular', compound: 'Anfangs' },
      es: { base: 'comienzo', plural: 'comienzos', gender: 'masc', count: 'singular' },
      ja: { base: '始まり', count: 'singular', reading: 'はじまり' },
      pt: { base: 'início', plural: 'inícios', gender: 'masc', count: 'singular' },
    },
  },
  {
    // "The end of a life": END with LIFE as the whole it is the end of (localization C26). The life
    // is indefinite, which every language reads as any one life — English has no generic article for
    // it ("the end of life" is bare, and bare LIFE is "das Ende von Leben" in German), and the
    // definite would be "the end of the life".
    id: 'DEATH',
    role: 'noun',
    description: 'the end of life; the state of being dead',
    definition: '/subj ( END /poss [ LIFE /a ] /whole )',
    emoji: '💀',
    forms: {
      en: { base: 'death', plural: 'deaths', count: 'singular' },
      it: { base: 'morte', plural: 'morti', gender: 'fem', count: 'singular' },
      fr: { base: 'mort', plural: 'morts', gender: 'fem', count: 'singular' },
      de: { base: 'Tod', plural: 'Tode', gender: 'masc', count: 'singular', compound: 'Todes' },
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
    definition: `
      /subj ( STATE /a /rel #2.obj )
      /subj ( one ) /verb ( FEEL ) /obj ( STATE )
    `,
    emoji: '💗',
    forms: {
      en: { base: 'feeling', plural: 'feelings', count: 'singular' },
      it: { base: 'sentimento', plural: 'sentimenti', gender: 'masc', count: 'singular' },
      fr: { base: 'sentiment', plural: 'sentiments', gender: 'masc', count: 'singular' },
      de: { base: 'Gefühl', plural: 'Gefühle', gender: 'neut', count: 'singular', compound: 'Gefühls' },
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
    definition: '/subj ( FEELING /adj WARM /a )',
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
    definition: '/subj ( MAMMAL /adj SMALL /a )',
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
    // The insect, not the motion: FLY is the verb, so the noun takes the suffix (as POINT_NOUN
    // does). Two readings of "time flies like an arrow" need both — TIME as a noun modifier on
    // this one in the plural, liking an arrow. Glossed by what it does, "an animal that flies".
    id: 'FLY_INSECT',
    role: 'noun',
    description: 'a small winged insect',
    definition: `
      /subj ( ANIMAL /a /rel #2.subj )
      /subj ( ANIMAL ) /verb ( FLY )
    `,
    emoji: '🪰',
    animate: true,
    synonym: 'insect',
    isA: 'ANIMAL',
    forms: {
      en: { base: 'fly', plural: 'flies', count: 'singular' },
      it: { base: 'mosca', plural: 'mosche', gender: 'fem', count: 'singular' },
      fr: { base: 'mouche', plural: 'mouches', gender: 'fem', count: 'singular' },
      de: { base: 'Fliege', plural: 'Fliegen', gender: 'fem', count: 'singular' },
      es: { base: 'mosca', plural: 'moscas', gender: 'fem', count: 'singular' },
      ja: { base: 'ハエ', count: 'singular', reading: 'はえ' },
      pt: { base: 'mosca', plural: 'moscas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "A wood object": WOOD as a `material` noun modifier (localization C26), which Romance links
    // with the material's preposition (it "un oggetto di legno", es "un objeto de madera") and
    // German compounds (ein Holzgegenstand).
    id: 'STICK',
    role: 'noun',
    description: 'a thin elongated piece of wood',
    definition: '/subj ( OBJECT_THING /adj ( WOOD /material ) /a )',
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
    // The projectile a bow shoots — ARROW is the key the UI names — so "flies like an arrow" says
    // the thing, not the key (en "arrow", where ARROW is "arrow key"). A sharp stick, as the gloss
    // says; de Pfeil is the head Pfeiltaste compounds on.
    id: 'ARROW_PROJECTILE',
    role: 'noun',
    description: 'a pointed shaft shot from a bow',
    definition: '/subj ( STICK /adj SHARP /a )',
    emoji: '🏹',
    synonym: 'projectile',
    isA: 'STICK',
    forms: {
      en: { base: 'arrow', plural: 'arrows', count: 'singular' },
      it: { base: 'freccia', plural: 'frecce', gender: 'fem', count: 'singular' },
      fr: { base: 'flèche', plural: 'flèches', gender: 'fem', count: 'singular' },
      de: { base: 'Pfeil', plural: 'Pfeile', gender: 'masc', count: 'singular' },
      es: { base: 'flecha', plural: 'flechas', gender: 'fem', count: 'singular' },
      ja: { base: '矢', count: 'singular', reading: 'や' },
      pt: { base: 'flecha', plural: 'flechas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The cutting part of a knife or tool, not the whole implement. Feminine across the gendered
    // languages (lama / lame / Klinge / cuchilla / lâmina). Glossed "the part of an object that
    // cuts" (localization C26): the relative clause is the part's, and English and Romance leave it
    // after the whole, where it reads as true either way — the part cuts, and so does the object.
    // German's "der" is Teil's and Gegenstand's alike.
    id: 'BLADE',
    role: 'noun',
    description: 'the flat cutting part of a knife or tool',
    definition: `
      /subj ( PART /poss [ OBJECT_THING /a ] /whole /rel #2.subj )
      /subj ( PART ) /verb ( CUT )
    `,
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
    definition: `
      /subj ( PROCESS /a /rel #2.subj )
      /subj ( PROCESS ) /verb ( PRODUCE ) /obj ( HEAT /pl /zero )
    `,
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
    // The visible part of a fire, which a burning thing gives off: BURN is "to produce flames"
    // (localization B33). A count noun, where FIRE is the phenomenon. Japanese 炎 is the flame
    // itself and does not contain 燃, so BURN's gloss does not define 燃える with itself. Glossed as
    // what its description says, "the visible part of a fire" (localization C26), with FIRE as the
    // whole — "the part of a fire that one sees" would put Japanese's gapped clause on the fire.
    id: 'FLAME',
    role: 'noun',
    description: 'the visible, glowing part of a fire',
    definition: '/subj ( PART /adj VISIBLE /poss [ FIRE /a ] /whole )',
    emoji: '🕯️',
    forms: {
      en: { base: 'flame', plural: 'flames', count: 'singular' },
      it: { base: 'fiamma', plural: 'fiamme', gender: 'fem', count: 'singular' },
      fr: { base: 'flamme', plural: 'flammes', gender: 'fem', count: 'singular' },
      de: { base: 'Flamme', plural: 'Flammen', gender: 'fem', count: 'singular' },
      es: { base: 'llama', plural: 'llamas', gender: 'fem', count: 'singular' },
      ja: { base: '炎', count: 'singular', reading: 'ほのお' },
      pt: { base: 'chama', plural: 'chamas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The kinship genus FATHER and MOTHER specialise, and the root of the RELATIVE subtree beside
    // them. Grammatically masculine where the language has no neutral form, with a feminine
    // counterpart (genitrice / progenitora) that MOTHER's gloss reads. German uses the neuter
    // Elternteil ("a parent-part") in the singular, and another word in the plural.
    id: 'PARENT',
    role: 'noun',
    description: 'one who has a child',
    // CHILD_OFFSPRING, not CHILD: a parent has sons and daughters of any age, where CHILD is a young
    // person — "una persona che ha figli", not "che ha bambini" (P11 D11, localization B68).
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( HAVE ) /obj ( CHILD_OFFSPRING /pl /zero )
    `,
    emoji: '🧑‍🍼',
    animate: true,
    human: true,
    isA: 'RELATIVE',
    forms: {
      en: { base: 'parent', plural: 'parents', count: 'singular' },
      it: { base: 'genitore', plural: 'genitori', gender: 'masc', count: 'singular', fem: 'genitrice', fem_plural: 'genitrici' },
      fr: { base: 'parent', plural: 'parents', gender: 'masc', count: 'singular' },
      // Three plurals are another word: what speakers say for two parents is Eltern, padres, pais —
      // never *Elternteile*, *progenitores*, *progenitores* (P11 D7). Japanese has 両親 for the pair.
      de: { base: 'Elternteil', plural: 'Eltern', gender: 'neut', count: 'singular' },
      es: { base: 'progenitor', plural: 'padres', gender: 'masc', count: 'singular', fem: 'progenitora', fem_plural: 'progenitoras' },
      ja: {
        base: '親', count: 'singular', reading: 'おや',
        honorific: '親御さん', honorific_reading: 'おやごさん',
        plural: '両親', plural_reading: 'りょうしん',
        plural_honorific: 'ご両親', plural_honorific_reading: 'ごりょうしん',
        kin: '1', address_honorific: '1',
      },
      pt: { base: 'progenitor', plural: 'pais', gender: 'masc', count: 'singular', fem: 'progenitora', fem_plural: 'progenitoras' },
    },
  },
  {
    id: 'FATHER',
    role: 'noun',
    description: 'a male parent',
    definition: '/subj ( PARENT /adj MALE /a )',
    emoji: '👨',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'PARENT',
    forms: {
      en: { base: 'father', plural: 'fathers', count: 'singular' },
      // kinship: Italian drops the article after a possessive on the singular ("mio padre").
      it: { base: 'padre', plural: 'padri', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'père', plural: 'pères', gender: 'masc', count: 'singular' },
      de: { base: 'Vater', plural: 'Väter', gender: 'masc', count: 'singular' },
      es: { base: 'padre', plural: 'padres', gender: 'masc', count: 'singular' },
      // Whose father he is picks the word (P11 D2): 父親 is nobody's in particular, 父 one's own,
      // お父さん somebody else's.
      ja: {
        base: '父親', count: 'singular', reading: 'ちちおや',
        possessed: '父', possessed_reading: 'ちち', honorific: 'お父さん', honorific_reading: 'おとうさん', kin: '1', address_honorific: '1',
      },
      pt: { base: 'pai', plural: 'pais', gender: 'masc', count: 'singular' },
    },
  },
  // ── The family (P11 §4; localization B68–B74) ─────────────────────
  // Forty kin terms and partners under RELATIVE, seeded with the four columns P11's engine reads:
  // the Italian `kinship` article flag, the Japanese `possessed` / `honorific` / `kin` trio (母 is
  // my mother, お母さん is yours, 母親 is nobody's) and its `with_<ADJECTIVE>` fusions (兄弟 + ELDER
  // → 兄), the French and German `possessed` shortenings (ma **femme**, meine **Frau**), and
  // German's adjectival noun (*der Verwandte*).
  {
    // The genus of every relative. German declines it as an adjective (`adjectival`, P11 D8), so its
    // base is the bare stem and the plural and feminine are that same stem — the ending carries both.
    // French has one word for this and PARENT, hence the synonym in the picker.
    id: 'RELATIVE',
    role: 'noun',
    description: 'a person one is related to',
    // A part-whole possessor read from the member's end (C26): what makes a relative a relative is
    // being of the one family, as FAMILY's own gloss is that family read from the group's end.
    definition: '/subj ( PERSON /a /poss [ FAMILY /adj SAME ] /whole )',
    emoji: '👪',
    animate: true,
    human: true,
    synonym: 'family member',
    isA: 'PERSON',
    forms: {
      en: { base: 'relative', plural: 'relatives', count: 'singular' },
      it: { base: 'parente', plural: 'parenti', gender: 'masc', count: 'singular', fem: 'parente', fem_plural: 'parenti' },
      fr: { base: 'parent', plural: 'parents', gender: 'masc', count: 'singular', fem: 'parente', fem_plural: 'parentes' },
      de: { base: 'Verwandt', plural: 'Verwandt', gender: 'masc', count: 'singular', fem: 'Verwandt', fem_plural: 'Verwandt', adjectival: '1' },
      es: { base: 'pariente', plural: 'parientes', gender: 'masc', count: 'singular', fem: 'pariente', fem_plural: 'parientes' },
      ja: { base: '親戚', count: 'singular', reading: 'しんせき', honorific: 'ご親戚', honorific_reading: 'ごしんせき', kin: '1' },
      pt: { base: 'parente', plural: 'parentes', gender: 'masc', count: 'singular', fem: 'parente', fem_plural: 'parentes' },
    },
  },
  {
    // The group of relatives, and the one concept here that is not a person. No `kin` flag: it is a
    // group rather than a relative, so 私の家族 keeps its 私の where 私の母 does not (D3/D4) — but
    // someone else's family is still ご家族, which is the `honorific` column alone.
    id: 'FAMILY',
    role: 'noun',
    description: 'a group of people related to one another',
    definition: '/subj ( GROUP /a /poss [ RELATIVE /pl /zero ] /parts )',
    emoji: '👨‍👩‍👧‍👦',
    isA: 'GROUP',
    forms: {
      en: { base: 'family', plural: 'families', count: 'singular' },
      it: { base: 'famiglia', plural: 'famiglie', gender: 'fem', count: 'singular' },
      fr: { base: 'famille', plural: 'familles', gender: 'fem', count: 'singular' },
      de: { base: 'Familie', plural: 'Familien', gender: 'fem', count: 'singular' },
      es: { base: 'familia', plural: 'familias', gender: 'fem', count: 'singular' },
      ja: { base: '家族', count: 'singular', reading: 'かぞく', honorific: 'ご家族', honorific_reading: 'ごかぞく' },
      pt: { base: 'família', plural: 'famílias', gender: 'fem', count: 'singular' },
    },
  },
  {
    // FATHER's counterpart, and the one of the pair that needs the noun gender control in its own
    // gloss: without `gender: 'fem'` Italian reads "un genitore femminile", a masculine article
    // under a feminine adjective (B68 reading 2).
    id: 'MOTHER',
    role: 'noun',
    description: 'a female parent',
    definition: '/subj ( PARENT /adj FEMALE /fem /a )',
    emoji: '👩',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'PARENT',
    forms: {
      en: { base: 'mother', plural: 'mothers', count: 'singular' },
      it: { base: 'madre', plural: 'madri', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'mère', plural: 'mères', gender: 'fem', count: 'singular' },
      de: { base: 'Mutter', plural: 'Mütter', gender: 'fem', count: 'singular' },
      es: { base: 'madre', plural: 'madres', gender: 'fem', count: 'singular' },
      ja: {
        base: '母親', count: 'singular', reading: 'ははおや',
        possessed: '母', possessed_reading: 'はは', honorific: 'お母さん', honorific_reading: 'おかあさん', kin: '1', address_honorific: '1',
      },
      pt: { base: 'mãe', plural: 'mães', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A child as somebody's offspring, not as a young person, which is CHILD (P11 D11): "my child"
    // is *mio figlio*, *mi hijo*, *meu filho*, where CHILD is *bambino*, *niño*, *criança*. Its own
    // gloss is the corpus's one coordinated definition — a son or a daughter — which is why SON and
    // DAUGHTER keep the literal (B68).
    id: 'CHILD_OFFSPRING',
    role: 'noun',
    description: 'a son or daughter of a parent',
    definition: '/subj ( SON /a /or [ DAUGHTER /a ] )',
    emoji: '🧒',
    animate: true,
    human: true,
    synonym: 'offspring',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'child', plural: 'children', count: 'singular' },
      it: { base: 'figlio', plural: 'figli', gender: 'masc', count: 'singular', fem: 'figlia', fem_plural: 'figlie', kinship: '1' },
      fr: { base: 'enfant', plural: 'enfants', gender: 'masc', count: 'singular', fem: 'enfant', fem_plural: 'enfants' },
      de: { base: 'Kind', plural: 'Kinder', gender: 'neut', count: 'singular', compound: 'Kinder' },
      es: { base: 'hijo', plural: 'hijos', gender: 'masc', count: 'singular', fem: 'hija', fem_plural: 'hijas' },
      ja: { base: '子供', count: 'singular', reading: 'こども', honorific: 'お子さん', honorific_reading: 'おこさん', kin: '1' },
      pt: { base: 'filho', plural: 'filhos', gender: 'masc', count: 'singular', fem: 'filha', fem_plural: 'filhas' },
    },
  },
  {
    // No definition: every lead closes a circle with CHILD_OFFSPRING, whose own gloss is "a son or a
    // daughter" — a genus and its two species defining each other (B68 *Not solved* 1). Italian,
    // Spanish and Portuguese say the offspring and the son with one word, which is the other half of it.
    id: 'SON',
    role: 'noun',
    description: 'a male child of a parent',
    emoji: '👦',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'CHILD_OFFSPRING',
    forms: {
      en: { base: 'son', plural: 'sons', count: 'singular' },
      it: { base: 'figlio', plural: 'figli', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'fils', plural: 'fils', gender: 'masc', count: 'singular' },
      de: { base: 'Sohn', plural: 'Söhne', gender: 'masc', count: 'singular' },
      es: { base: 'hijo', plural: 'hijos', gender: 'masc', count: 'singular' },
      ja: { base: '息子', count: 'singular', reading: 'むすこ', honorific: '息子さん', honorific_reading: 'むすこさん', kin: '1' },
      pt: { base: 'filho', plural: 'filhos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'DAUGHTER',
    role: 'noun',
    description: 'a female child of a parent',
    emoji: '👧',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'CHILD_OFFSPRING',
    forms: {
      en: { base: 'daughter', plural: 'daughters', count: 'singular' },
      it: { base: 'figlia', plural: 'figlie', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'fille', plural: 'filles', gender: 'fem', count: 'singular' },
      de: { base: 'Tochter', plural: 'Töchter', gender: 'fem', count: 'singular' },
      es: { base: 'hija', plural: 'hijas', gender: 'fem', count: 'singular' },
      ja: { base: '娘', count: 'singular', reading: 'むすめ', honorific: '娘さん', honorific_reading: 'むすめさん', kin: '1' },
      pt: { base: 'filha', plural: 'filhas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The three that go around their own genus (B69): "a female sibling" is *una sorella femminile*
    // in Italian — Romance has no neutral singular to modify — so the gloss heads on PERSON, which
    // is neutral in all seven, and says the parents instead. That overturns P11 D12, which filed
    // BROTHER and SISTER as undefinable.
    id: 'SIBLING',
    role: 'noun',
    description: 'a person who has the same parents as another',
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( HAVE ) /obj ( PARENT /adj SAME /pl )
    `,
    emoji: '👫',
    animate: true,
    human: true,
    isA: 'RELATIVE',
    forms: {
      en: { base: 'sibling', plural: 'siblings', count: 'singular' },
      it: { base: 'fratello', plural: 'fratelli', gender: 'masc', count: 'singular', fem: 'sorella', fem_plural: 'sorelle', kinship: '1' },
      // French has no singular word: the plural is the coordination itself, "frères et sœurs" (D7).
      fr: { base: 'frère', plural: 'frères et sœurs', gender: 'masc', count: 'singular', fem: 'sœur', fem_plural: 'sœurs' },
      de: { base: 'Geschwister', plural: 'Geschwister', gender: 'neut', count: 'singular' },
      es: { base: 'hermano', plural: 'hermanos', gender: 'masc', count: 'singular', fem: 'hermana', fem_plural: 'hermanas' },
      // 三人兄弟: the count compounds onto 兄弟 with no の — how Japanese says how many siblings there are,
      // the 〜人兄弟 of the dictionaries' examples (三人兄弟の長男; P11-E5).
      ja: { base: '兄弟', count: 'singular', reading: 'きょうだい', honorific: 'ご兄弟', honorific_reading: 'ごきょうだい', kin: '1', counter_join: 'compound' },
      pt: { base: 'irmão', plural: 'irmãos', gender: 'masc', count: 'singular', fem: 'irmã', fem_plural: 'irmãs' },
    },
  },
  {
    // Japanese has no word for a brother of unstated age: 兄 is the older one and 弟 the younger, so
    // the lexeme fuses ELDER and YOUNGER into itself (`with_<ADJECTIVE>`, P11 D5) and says 兄弟 when
    // neither is given.
    id: 'BROTHER',
    role: 'noun',
    description: 'a male sibling',
    definition: `
      /subj ( PERSON /adj MALE /a /rel #2.subj )
      /subj ( PERSON ) /verb ( HAVE ) /obj ( PARENT /adj SAME /pl )
    `,
    emoji: '👦',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'SIBLING',
    forms: {
      en: { base: 'brother', plural: 'brothers', count: 'singular' },
      it: { base: 'fratello', plural: 'fratelli', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'frère', plural: 'frères', gender: 'masc', count: 'singular' },
      de: { base: 'Bruder', plural: 'Brüder', gender: 'masc', count: 'singular' },
      es: { base: 'hermano', plural: 'hermanos', gender: 'masc', count: 'singular' },
      ja: {
        // 三人兄弟, as SIBLING's 兄弟 (P11-E5); 兄 and 弟 are other words and keep the の (三人の兄).
        base: '兄弟', count: 'singular', reading: 'きょうだい', honorific: 'ご兄弟', honorific_reading: 'ごきょうだい', kin: '1', counter_join: 'compound',
        with_ELDER: '兄', with_ELDER_reading: 'あに', with_ELDER_honorific: 'お兄さん', with_ELDER_honorific_reading: 'おにいさん', with_ELDER_address_honorific: '1',
        with_YOUNGER: '弟', with_YOUNGER_reading: 'おとうと', with_YOUNGER_honorific: '弟さん', with_YOUNGER_honorific_reading: 'おとうとさん',
      },
      pt: { base: 'irmão', plural: 'irmãos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SISTER',
    role: 'noun',
    description: 'a female sibling',
    definition: `
      /subj ( PERSON /adj FEMALE /a /rel #2.subj )
      /subj ( PERSON ) /verb ( HAVE ) /obj ( PARENT /adj SAME /pl )
    `,
    emoji: '👧',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'SIBLING',
    forms: {
      en: { base: 'sister', plural: 'sisters', count: 'singular' },
      it: { base: 'sorella', plural: 'sorelle', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'sœur', plural: 'sœurs', gender: 'fem', count: 'singular' },
      de: { base: 'Schwester', plural: 'Schwestern', gender: 'fem', count: 'singular' },
      es: { base: 'hermana', plural: 'hermanas', gender: 'fem', count: 'singular' },
      ja: {
        // 三人姉妹, the same 〜人 compound as 兄弟's (三人姉妹の長女; P11-E5); 姉 and 妹 keep the の (三人の姉).
        base: '姉妹', count: 'singular', reading: 'しまい', kin: '1', counter_join: 'compound',
        with_ELDER: '姉', with_ELDER_reading: 'あね', with_ELDER_honorific: 'お姉さん', with_ELDER_honorific_reading: 'おねえさん', with_ELDER_address_honorific: '1',
        with_YOUNGER: '妹', with_YOUNGER_reading: 'いもうと', with_YOUNGER_honorific: '妹さん', with_YOUNGER_honorific_reading: 'いもうとさん',
      },
      pt: { base: 'irmã', plural: 'irmãs', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The genus HUSBAND and WIFE specialise, and the one place D12's sex adjective works on a kin
    // genus: *coniuge*, *conjoint*, *Ehepartner*, *cónyuge*, *cônjuge* and 配偶者 are neutral.
    id: 'SPOUSE',
    role: 'noun',
    description: 'a person one is married to',
    definition: `
      /subj ( PERSON /a /rel #2.obj )
      /subj ( one ) /verb ( MARRY ) /obj ( PERSON )
    `,
    emoji: '💍',
    animate: true,
    human: true,
    isA: 'RELATIVE',
    forms: {
      en: { base: 'spouse', plural: 'spouses', count: 'singular' },
      it: { base: 'coniuge', plural: 'coniugi', gender: 'masc', count: 'singular', fem: 'coniuge', fem_plural: 'coniugi' },
      fr: { base: 'conjoint', plural: 'conjoints', gender: 'masc', count: 'singular', fem: 'conjointe', fem_plural: 'conjointes' },
      de: { base: 'Ehepartner', plural: 'Ehepartner', gender: 'masc', count: 'singular', fem: 'Ehepartnerin', fem_plural: 'Ehepartnerinnen' },
      es: { base: 'cónyuge', plural: 'cónyuges', gender: 'masc', count: 'singular', fem: 'cónyuge', fem_plural: 'cónyuges' },
      ja: { base: '配偶者', count: 'singular', reading: 'はいぐうしゃ', kin: '1' },
      pt: { base: 'cônjuge', plural: 'cônjuges', gender: 'masc', count: 'singular', fem: 'cônjuge', fem_plural: 'cônjuges' },
    },
  },
  {
    // German and French shorten the word once it has an owner (`possessed`, D6): "meine **Frau**",
    // "ma **femme**" — where the citation form keeps the Ehe- / épouse that says it is a marriage.
    id: 'HUSBAND',
    role: 'noun',
    description: 'a male spouse',
    definition: '/subj ( SPOUSE /adj MALE /a )',
    emoji: '🤵',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'SPOUSE',
    forms: {
      en: { base: 'husband', plural: 'husbands', count: 'singular' },
      it: { base: 'marito', plural: 'mariti', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'mari', plural: 'maris', gender: 'masc', count: 'singular' },
      de: { base: 'Ehemann', plural: 'Ehemänner', gender: 'masc', count: 'singular', possessed: 'Mann', possessed_plural: 'Männer' },
      es: { base: 'marido', plural: 'maridos', gender: 'masc', count: 'singular' },
      ja: { base: '夫', count: 'singular', reading: 'おっと', honorific: 'ご主人', honorific_reading: 'ごしゅじん', kin: '1' },
      pt: { base: 'marido', plural: 'maridos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WIFE',
    role: 'noun',
    description: 'a female spouse',
    definition: '/subj ( SPOUSE /adj FEMALE /fem /a )',
    emoji: '👰',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'SPOUSE',
    forms: {
      en: { base: 'wife', plural: 'wives', count: 'singular' },
      it: { base: 'moglie', plural: 'mogli', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'épouse', plural: 'épouses', gender: 'fem', count: 'singular', possessed: 'femme', possessed_plural: 'femmes' },
      de: { base: 'Ehefrau', plural: 'Ehefrauen', gender: 'fem', count: 'singular', possessed: 'Frau', possessed_plural: 'Frauen' },
      es: { base: 'esposa', plural: 'esposas', gender: 'fem', count: 'singular' },
      ja: { base: '妻', count: 'singular', reading: 'つま', honorific: '奥さん', honorific_reading: 'おくさん', kin: '1' },
      pt: { base: 'esposa', plural: 'esposas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The generation above the parents (B71). Three of the plurals are another word (de
    // *Großeltern*, fr *grands-parents*, pt *avós*, D7); none of the six glosses reads one.
    id: 'GRANDPARENT',
    role: 'noun',
    description: 'a parent of a parent',
    definition: '/subj ( PARENT /a /poss [ PARENT /a ] )',
    emoji: '👴',
    animate: true,
    human: true,
    isA: 'RELATIVE',
    forms: {
      en: { base: 'grandparent', plural: 'grandparents', count: 'singular' },
      it: { base: 'nonno', plural: 'nonni', gender: 'masc', count: 'singular', fem: 'nonna', fem_plural: 'nonne', kinship: '1' },
      fr: { base: 'grand-parent', plural: 'grands-parents', gender: 'masc', count: 'singular' },
      de: { base: 'Großelternteil', plural: 'Großeltern', gender: 'neut', count: 'singular' },
      es: { base: 'abuelo', plural: 'abuelos', gender: 'masc', count: 'singular', fem: 'abuela', fem_plural: 'abuelas' },
      ja: { base: '祖父母', count: 'singular', reading: 'そふぼ', kin: '1', address_honorific: '1' },
      pt: { base: 'avô', plural: 'avós', gender: 'masc', count: 'singular', fem: 'avó', fem_plural: 'avós' },
    },
  },
  {
    // A definite head, because one has one father per parent (B71 reading 2) — English shows none of
    // it, since the Saxon genitive takes the possessor's determiner ("a parent's father").
    id: 'GRANDFATHER',
    role: 'noun',
    description: 'a father of a parent',
    definition: '/subj ( FATHER /poss [ PARENT /a ] )',
    emoji: '👴',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'GRANDPARENT',
    forms: {
      en: { base: 'grandfather', plural: 'grandfathers', count: 'singular' },
      it: { base: 'nonno', plural: 'nonni', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'grand-père', plural: 'grands-pères', gender: 'masc', count: 'singular' },
      de: { base: 'Großvater', plural: 'Großväter', gender: 'masc', count: 'singular' },
      es: { base: 'abuelo', plural: 'abuelos', gender: 'masc', count: 'singular' },
      ja: { base: '祖父', count: 'singular', reading: 'そふ', honorific: 'おじいさん', kin: '1', address_honorific: '1' },
      pt: { base: 'avô', plural: 'avôs', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GRANDMOTHER',
    role: 'noun',
    description: 'a mother of a parent',
    definition: '/subj ( MOTHER /poss [ PARENT /a ] )',
    emoji: '👵',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'GRANDPARENT',
    forms: {
      en: { base: 'grandmother', plural: 'grandmothers', count: 'singular' },
      it: { base: 'nonna', plural: 'nonne', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'grand-mère', plural: 'grands-mères', gender: 'fem', count: 'singular' },
      de: { base: 'Großmutter', plural: 'Großmütter', gender: 'fem', count: 'singular' },
      es: { base: 'abuela', plural: 'abuelas', gender: 'fem', count: 'singular' },
      ja: { base: '祖母', count: 'singular', reading: 'そぼ', honorific: 'おばあさん', kin: '1', address_honorific: '1' },
      pt: { base: 'avó', plural: 'avós', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Italian *nipote* is four relatives at once — this, GRANDDAUGHTER, NEPHEW and NIECE — so the
    // four tooltips are what tell them apart in the picker (B71, B72).
    id: 'GRANDCHILD',
    role: 'noun',
    description: 'a child of a child',
    definition: '/subj ( CHILD_OFFSPRING /a /poss [ CHILD_OFFSPRING /a ] )',
    emoji: '🧒',
    animate: true,
    human: true,
    isA: 'RELATIVE',
    forms: {
      en: { base: 'grandchild', plural: 'grandchildren', count: 'singular' },
      it: { base: 'nipote', plural: 'nipoti', gender: 'masc', count: 'singular', fem: 'nipote', fem_plural: 'nipoti', kinship: '1' },
      fr: { base: 'petit-enfant', plural: 'petits-enfants', gender: 'masc', count: 'singular' },
      de: { base: 'Enkelkind', plural: 'Enkelkinder', gender: 'neut', count: 'singular' },
      es: { base: 'nieto', plural: 'nietos', gender: 'masc', count: 'singular', fem: 'nieta', fem_plural: 'nietas' },
      ja: { base: '孫', count: 'singular', reading: 'まご', honorific: 'お孫さん', honorific_reading: 'おまごさん', kin: '1' },
      pt: { base: 'neto', plural: 'netos', gender: 'masc', count: 'singular', fem: 'neta', fem_plural: 'netas' },
    },
  },
  {
    // The sex adjective, not the genitive: "a child's son" renders *un figlio di un figlio* in
    // Italian, Spanish and Portuguese — GRANDCHILD's own gloss, character for character (B71
    // reading 3). The word for a grandchild is neutral in every language, so the adjective reads well.
    id: 'GRANDSON',
    role: 'noun',
    description: 'a male grandchild',
    definition: '/subj ( GRANDCHILD /adj MALE /a )',
    emoji: '👦',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'GRANDCHILD',
    forms: {
      en: { base: 'grandson', plural: 'grandsons', count: 'singular' },
      it: { base: 'nipote', plural: 'nipoti', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'petit-fils', plural: 'petits-fils', gender: 'masc', count: 'singular' },
      de: { base: 'Enkel', plural: 'Enkel', gender: 'masc', count: 'singular' },
      es: { base: 'nieto', plural: 'nietos', gender: 'masc', count: 'singular' },
      ja: { base: '孫息子', count: 'singular', reading: 'まごむすこ', honorific: 'お孫さん', honorific_reading: 'おまごさん', kin: '1' },
      pt: { base: 'neto', plural: 'netos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GRANDDAUGHTER',
    role: 'noun',
    description: 'a female grandchild',
    definition: '/subj ( GRANDCHILD /adj FEMALE /fem /a )',
    emoji: '👧',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'GRANDCHILD',
    forms: {
      en: { base: 'granddaughter', plural: 'granddaughters', count: 'singular' },
      it: { base: 'nipote', plural: 'nipoti', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'petite-fille', plural: 'petites-filles', gender: 'fem', count: 'singular' },
      de: { base: 'Enkelin', plural: 'Enkelinnen', gender: 'fem', count: 'singular' },
      es: { base: 'nieta', plural: 'nietas', gender: 'fem', count: 'singular' },
      ja: { base: '孫娘', count: 'singular', reading: 'まごむすめ', honorific: 'お孫さん', honorific_reading: 'おまごさん', kin: '1' },
      pt: { base: 'neta', plural: 'netas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The extended family (B72), each gloss naming the relative it hangs off. おじ, おば and いとこ are
    // kana on purpose: the kanji encode what the concept does not say — 伯父 is older than the parent
    // and 叔父 younger, and 従兄 / 従弟 / 従姉 / 従妹 are the four cousins (P11 §4).
    id: 'UNCLE',
    role: 'noun',
    description: 'a brother of a parent',
    definition: '/subj ( BROTHER /a /poss [ PARENT /a ] )',
    emoji: '👨',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'uncle', plural: 'uncles', count: 'singular' },
      it: { base: 'zio', plural: 'zii', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'oncle', plural: 'oncles', gender: 'masc', count: 'singular' },
      de: { base: 'Onkel', plural: 'Onkel', gender: 'masc', count: 'singular' },
      es: { base: 'tío', plural: 'tíos', gender: 'masc', count: 'singular' },
      ja: { base: 'おじ', count: 'singular', honorific: 'おじさん', kin: '1', address_honorific: '1' },
      pt: { base: 'tio', plural: 'tios', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'AUNT',
    role: 'noun',
    description: 'a sister of a parent',
    definition: '/subj ( SISTER /a /poss [ PARENT /a ] )',
    emoji: '👩',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'aunt', plural: 'aunts', count: 'singular' },
      it: { base: 'zia', plural: 'zie', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'tante', plural: 'tantes', gender: 'fem', count: 'singular' },
      de: { base: 'Tante', plural: 'Tanten', gender: 'fem', count: 'singular' },
      es: { base: 'tía', plural: 'tías', gender: 'fem', count: 'singular' },
      ja: { base: 'おば', count: 'singular', honorific: 'おばさん', kin: '1', address_honorific: '1' },
      pt: { base: 'tia', plural: 'tias', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The one gloss in the corpus with a possessor inside a possessor: a parent's sibling's child.
    // The shorter "an uncle's child" is narrower than the word — an aunt's child is a cousin too —
    // and no possessor can be a coordination, so the chain through SIBLING is what says both (B72).
    id: 'COUSIN',
    role: 'noun',
    description: 'a child of an uncle or an aunt',
    definition: '/subj ( CHILD_OFFSPRING /a /poss [ SIBLING /a /poss [ PARENT /a ] ] )',
    emoji: '🧑',
    animate: true,
    human: true,
    isA: 'RELATIVE',
    forms: {
      en: { base: 'cousin', plural: 'cousins', count: 'singular' },
      it: { base: 'cugino', plural: 'cugini', gender: 'masc', count: 'singular', fem: 'cugina', fem_plural: 'cugine', kinship: '1' },
      fr: { base: 'cousin', plural: 'cousins', gender: 'masc', count: 'singular', fem: 'cousine', fem_plural: 'cousines' },
      de: { base: 'Cousin', plural: 'Cousins', gender: 'masc', count: 'singular', fem: 'Cousine', fem_plural: 'Cousinen' },
      es: { base: 'primo', plural: 'primos', gender: 'masc', count: 'singular', fem: 'prima', fem_plural: 'primas' },
      ja: { base: 'いとこ', count: 'singular', kin: '1' },
      pt: { base: 'primo', plural: 'primos', gender: 'masc', count: 'singular', fem: 'prima', fem_plural: 'primas' },
    },
  },
  {
    // German *Neffe* is a weak masculine ("ich sehe meinen Neffen", `weak`).
    id: 'NEPHEW',
    role: 'noun',
    description: 'a son of a sibling',
    definition: '/subj ( SON /a /poss [ SIBLING /a ] )',
    emoji: '👦',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'nephew', plural: 'nephews', count: 'singular' },
      it: { base: 'nipote', plural: 'nipoti', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'neveu', plural: 'neveux', gender: 'masc', count: 'singular' },
      de: { base: 'Neffe', plural: 'Neffen', gender: 'masc', count: 'singular', weak: '1' },
      es: { base: 'sobrino', plural: 'sobrinos', gender: 'masc', count: 'singular' },
      ja: { base: '甥', count: 'singular', reading: 'おい', honorific: '甥御さん', honorific_reading: 'おいごさん', kin: '1' },
      pt: { base: 'sobrinho', plural: 'sobrinhos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'NIECE',
    role: 'noun',
    description: 'a daughter of a sibling',
    definition: '/subj ( DAUGHTER /a /poss [ SIBLING /a ] )',
    emoji: '👧',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'niece', plural: 'nieces', count: 'singular' },
      it: { base: 'nipote', plural: 'nipoti', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'nièce', plural: 'nièces', gender: 'fem', count: 'singular' },
      de: { base: 'Nichte', plural: 'Nichten', gender: 'fem', count: 'singular' },
      es: { base: 'sobrina', plural: 'sobrinas', gender: 'fem', count: 'singular' },
      ja: { base: '姪', count: 'singular', reading: 'めい', honorific: '姪御さん', honorific_reading: 'めいごさん', kin: '1' },
      pt: { base: 'sobrinha', plural: 'sobrinhas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The relatives by marriage (B73). French says *beau-père* and *belle-mère* for both the in-law
    // and the step-parent, so there the tooltips are the whole difference; Japanese takes the
    // unambiguous 継父 / 継母 for the step-parents rather than the 義父 / 義母 speech shares with these.
    id: 'MOTHER_IN_LAW',
    role: 'noun',
    description: 'a mother of a spouse',
    definition: '/subj ( MOTHER /poss [ SPOUSE /a ] )',
    emoji: '👵',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'mother-in-law', plural: 'mothers-in-law', count: 'singular' },
      it: { base: 'suocera', plural: 'suocere', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'belle-mère', plural: 'belles-mères', gender: 'fem', count: 'singular' },
      de: { base: 'Schwiegermutter', plural: 'Schwiegermütter', gender: 'fem', count: 'singular' },
      es: { base: 'suegra', plural: 'suegras', gender: 'fem', count: 'singular' },
      ja: { base: '義母', count: 'singular', reading: 'ぎぼ', honorific: 'お義母さん', honorific_reading: 'おかあさん', kin: '1', address_honorific: '1' },
      pt: { base: 'sogra', plural: 'sogras', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'FATHER_IN_LAW',
    role: 'noun',
    description: 'a father of a spouse',
    definition: '/subj ( FATHER /poss [ SPOUSE /a ] )',
    emoji: '👴',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'father-in-law', plural: 'fathers-in-law', count: 'singular' },
      it: { base: 'suocero', plural: 'suoceri', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'beau-père', plural: 'beaux-pères', gender: 'masc', count: 'singular' },
      de: { base: 'Schwiegervater', plural: 'Schwiegerväter', gender: 'masc', count: 'singular' },
      es: { base: 'suegro', plural: 'suegros', gender: 'masc', count: 'singular' },
      ja: { base: '義父', count: 'singular', reading: 'ぎふ', honorific: 'お義父さん', honorific_reading: 'おとうさん', kin: '1', address_honorific: '1' },
      pt: { base: 'sogro', plural: 'sogros', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SON_IN_LAW',
    role: 'noun',
    description: 'a husband of a child',
    definition: '/subj ( HUSBAND /poss [ CHILD_OFFSPRING /a ] )',
    emoji: '🤵',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'son-in-law', plural: 'sons-in-law', count: 'singular' },
      it: { base: 'genero', plural: 'generi', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'gendre', plural: 'gendres', gender: 'masc', count: 'singular' },
      de: { base: 'Schwiegersohn', plural: 'Schwiegersöhne', gender: 'masc', count: 'singular' },
      es: { base: 'yerno', plural: 'yernos', gender: 'masc', count: 'singular' },
      ja: { base: '婿', count: 'singular', reading: 'むこ', honorific: 'お婿さん', honorific_reading: 'おむこさん', kin: '1' },
      pt: { base: 'genro', plural: 'genros', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'DAUGHTER_IN_LAW',
    role: 'noun',
    description: 'a wife of a child',
    definition: '/subj ( WIFE /poss [ CHILD_OFFSPRING /a ] )',
    emoji: '👰',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'daughter-in-law', plural: 'daughters-in-law', count: 'singular' },
      it: { base: 'nuora', plural: 'nuore', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'belle-fille', plural: 'belles-filles', gender: 'fem', count: 'singular' },
      de: { base: 'Schwiegertochter', plural: 'Schwiegertöchter', gender: 'fem', count: 'singular' },
      es: { base: 'nuera', plural: 'nueras', gender: 'fem', count: 'singular' },
      ja: { base: '嫁', count: 'singular', reading: 'よめ', honorific: 'お嫁さん', honorific_reading: 'およめさん', kin: '1' },
      pt: { base: 'nora', plural: 'noras', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Japanese 義理の兄弟 says "in-law" in the word, and fuses ELDER and YOUNGER as BROTHER does.
    id: 'BROTHER_IN_LAW',
    role: 'noun',
    description: 'a brother of a spouse',
    definition: '/subj ( BROTHER /poss [ SPOUSE /a ] )',
    emoji: '👨',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'brother-in-law', plural: 'brothers-in-law', count: 'singular' },
      it: { base: 'cognato', plural: 'cognati', gender: 'masc', count: 'singular', kinship: '1' },
      fr: { base: 'beau-frère', plural: 'beaux-frères', gender: 'masc', count: 'singular' },
      de: { base: 'Schwager', plural: 'Schwäger', gender: 'masc', count: 'singular' },
      es: { base: 'cuñado', plural: 'cuñados', gender: 'masc', count: 'singular' },
      ja: {
        base: '義理の兄弟', count: 'singular', reading: 'ぎりのきょうだい', kin: '1',
        with_ELDER: '義兄', with_ELDER_reading: 'ぎけい', with_ELDER_honorific: 'お義兄さん', with_ELDER_honorific_reading: 'おにいさん', with_ELDER_address_honorific: '1',
        with_YOUNGER: '義弟', with_YOUNGER_reading: 'ぎてい', with_YOUNGER_honorific: '義弟さん', with_YOUNGER_honorific_reading: 'ぎていさん',
      },
      pt: { base: 'cunhado', plural: 'cunhados', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SISTER_IN_LAW',
    role: 'noun',
    description: 'a sister of a spouse',
    definition: '/subj ( SISTER /poss [ SPOUSE /a ] )',
    emoji: '👩',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'sister-in-law', plural: 'sisters-in-law', count: 'singular' },
      it: { base: 'cognata', plural: 'cognate', gender: 'fem', count: 'singular', kinship: '1' },
      fr: { base: 'belle-sœur', plural: 'belles-sœurs', gender: 'fem', count: 'singular' },
      de: { base: 'Schwägerin', plural: 'Schwägerinnen', gender: 'fem', count: 'singular' },
      es: { base: 'cuñada', plural: 'cuñadas', gender: 'fem', count: 'singular' },
      ja: {
        base: '義理の姉妹', count: 'singular', reading: 'ぎりのしまい', kin: '1',
        with_ELDER: '義姉', with_ELDER_reading: 'ぎし', with_ELDER_honorific: 'お義姉さん', with_ELDER_honorific_reading: 'おねえさん', with_ELDER_address_honorific: '1',
        with_YOUNGER: '義妹', with_YOUNGER_reading: 'ぎまい', with_YOUNGER_honorific: '義妹さん', with_YOUNGER_honorific_reading: 'ぎまいさん',
      },
      pt: { base: 'cunhada', plural: 'cunhadas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The two that have to say what they are *not*: "a mother's husband" is true of every father, so
    // the gloss carries a negated copular relative beside the genitive (B73 reading 1). The head keeps
    // the indefinite — a mother may have had more than one husband, which is the word's presupposition.
    id: 'STEPFATHER',
    role: 'noun',
    description: "a husband of one's mother who is not one's father",
    definition: `
      /subj ( HUSBAND /a /poss [ MOTHER /a ] /rel #2.subj )
      /subj ( HUSBAND ) /verb ( BE /not ) /pred ( FATHER )
    `,
    emoji: '👨',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'stepfather', plural: 'stepfathers', count: 'singular' },
      it: { base: 'patrigno', plural: 'patrigni', gender: 'masc', count: 'singular' },
      fr: { base: 'beau-père', plural: 'beaux-pères', gender: 'masc', count: 'singular' },
      de: { base: 'Stiefvater', plural: 'Stiefväter', gender: 'masc', count: 'singular' },
      es: { base: 'padrastro', plural: 'padrastros', gender: 'masc', count: 'singular' },
      ja: { base: '継父', count: 'singular', reading: 'けいふ', kin: '1', address_honorific: '1' },
      pt: { base: 'padrasto', plural: 'padrastos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'STEPMOTHER',
    role: 'noun',
    description: "a wife of one's father who is not one's mother",
    definition: `
      /subj ( WIFE /a /poss [ FATHER /a ] /rel #2.subj )
      /subj ( WIFE ) /verb ( BE /not ) /pred ( MOTHER )
    `,
    emoji: '👩',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'RELATIVE',
    forms: {
      en: { base: 'stepmother', plural: 'stepmothers', count: 'singular' },
      it: { base: 'matrigna', plural: 'matrigne', gender: 'fem', count: 'singular' },
      fr: { base: 'belle-mère', plural: 'belles-mères', gender: 'fem', count: 'singular' },
      de: { base: 'Stiefmutter', plural: 'Stiefmütter', gender: 'fem', count: 'singular' },
      es: { base: 'madrastra', plural: 'madrastras', gender: 'fem', count: 'singular' },
      ja: { base: '継母', count: 'singular', reading: 'けいぼ', kin: '1', address_honorific: '1' },
      pt: { base: 'madrasta', plural: 'madrastas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Casual speech, and the two concepts that prove both rules follow the **lexeme**, not the
    // meaning (P11 D13): Italian keeps the article before these ("la mia mamma", where "mia madre"
    // drops it), and Japanese casual speech says お母さん for everyone's mother, own or not — one
    // word, marked `kin` and with no possessed / honorific split of its own. Register is not a
    // differentia, so neither carries a definition (B68 *Not solved* 2).
    //
    // `as_name` (P11-E3): "Mom runs", *Maman court*, *Mamá corre* — definite, with nothing to make it
    // *a* mom, the word is a name: capitalized, and articled as the language articles a person's
    // name — French and Portuguese, which article a name unless it says otherwise, carry PETER's
    // `takes_article: '0'` beside it (read only on a name). Italian leaves the column off, because
    // Italian keeps the article in the third person (*la mamma corre*).
    id: 'MOM',
    role: 'noun',
    description: 'mother, in casual speech',
    emoji: '👩',
    animate: true,
    human: true,
    sex: 'fem',
    isA: 'MOTHER',
    forms: {
      en: { base: 'mom', plural: 'moms', count: 'singular', as_name: '1' },
      it: { base: 'mamma', plural: 'mamme', gender: 'fem', count: 'singular' },
      fr: { base: 'maman', plural: 'mamans', gender: 'fem', count: 'singular', as_name: '1', takes_article: '0' },
      de: { base: 'Mama', plural: 'Mamas', gender: 'fem', count: 'singular', as_name: '1' },
      es: { base: 'mamá', plural: 'mamás', gender: 'fem', count: 'singular', as_name: '1' },
      ja: { base: 'お母さん', count: 'singular', reading: 'おかあさん', kin: '1', address_honorific: '1', as_name: '1' },
      pt: { base: 'mamãe', plural: 'mamães', gender: 'fem', count: 'singular', as_name: '1', takes_article: '0' },
    },
  },
  {
    // `as_name` as MOM's (P11-E3): "Dad runs", *Papa läuft*, *Papá corre*; Italian *il papà corre*.
    id: 'DAD',
    role: 'noun',
    description: 'father, in casual speech',
    emoji: '👨',
    animate: true,
    human: true,
    sex: 'masc',
    isA: 'FATHER',
    forms: {
      en: { base: 'dad', plural: 'dads', count: 'singular', as_name: '1' },
      it: { base: 'papà', plural: 'papà', gender: 'masc', count: 'singular' },
      fr: { base: 'papa', plural: 'papas', gender: 'masc', count: 'singular', as_name: '1', takes_article: '0' },
      de: { base: 'Papa', plural: 'Papas', gender: 'masc', count: 'singular', as_name: '1' },
      es: { base: 'papá', plural: 'papás', gender: 'masc', count: 'singular', as_name: '1' },
      ja: { base: 'お父さん', count: 'singular', reading: 'おとうさん', kin: '1', address_honorific: '1', as_name: '1' },
      pt: { base: 'papai', plural: 'papais', gender: 'masc', count: 'singular', as_name: '1', takes_article: '0' },
    },
  },
  {
    // The people one chooses rather than is born to (B74), and four surfaces that collide with
    // concepts the corpus already has — de *Freund* (FRIEND and BOYFRIEND), it *ragazzo* (BOY), it
    // *compagno* and fr *compagnon* (COMPANION). The tooltips are what tell them apart.
    //
    // TOGETHER is in the gloss for Japanese alone: a Japanese relative clause marks no gap role, so
    // without the adverb 住む人 says "a person who lives" and the whole differentia is gone. With it,
    // 一緒に住む人 (B74 reading 1).
    id: 'PARTNER',
    role: 'noun',
    description: 'a person one shares one\'s life with',
    definition: `
      /subj ( PERSON /a /rel #2.with )
      /subj ( one ) /verb ( LIVE /adv TOGETHER ) /with ( PERSON )
    `,
    emoji: '🧑‍🤝‍🧑',
    animate: true,
    human: true,
    synonym: 'life partner',
    isA: 'PERSON',
    forms: {
      en: { base: 'partner', plural: 'partners', count: 'singular' },
      it: { base: 'compagno', plural: 'compagni', gender: 'masc', count: 'singular', fem: 'compagna', fem_plural: 'compagne' },
      fr: { base: 'compagnon', plural: 'compagnons', gender: 'masc', count: 'singular', fem: 'compagne', fem_plural: 'compagnes' },
      de: { base: 'Partner', plural: 'Partner', gender: 'masc', count: 'singular', fem: 'Partnerin', fem_plural: 'Partnerinnen' },
      // Spanish *pareja* is feminine whoever the partner is, so its agreement follows the word
      // ("mi pareja está cansada") and BOYFRIEND's gloss reads *una pareja masculina*.
      es: { base: 'pareja', plural: 'parejas', gender: 'fem', count: 'singular' },
      ja: { base: 'パートナー', count: 'singular' },
      pt: { base: 'companheiro', plural: 'companheiros', gender: 'masc', count: 'singular', fem: 'companheira', fem_plural: 'companheiras' },
    },
  },
  {
    // The sex, not the absence of a marriage: "a partner one is not married to" says something
    // subtly false — one may well marry one's boyfriend — and MARRIED, the adjective that would say
    // it properly, is a P11 follow-up (B74 reading 2).
    id: 'BOYFRIEND',
    role: 'noun',
    description: 'a male romantic partner',
    definition: '/subj ( PARTNER /adj MALE /a )',
    emoji: '👦',
    animate: true,
    human: true,
    sex: 'masc',
    synonym: 'romantic partner',
    isA: 'PARTNER',
    forms: {
      en: { base: 'boyfriend', plural: 'boyfriends', count: 'singular' },
      it: { base: 'ragazzo', plural: 'ragazzi', gender: 'masc', count: 'singular' },
      fr: { base: 'petit ami', plural: 'petits amis', gender: 'masc', count: 'singular' },
      de: { base: 'Freund', plural: 'Freunde', gender: 'masc', count: 'singular' },
      es: { base: 'novio', plural: 'novios', gender: 'masc', count: 'singular' },
      ja: { base: '彼氏', count: 'singular', reading: 'かれし' },
      pt: { base: 'namorado', plural: 'namorados', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GIRLFRIEND',
    role: 'noun',
    description: 'a female romantic partner',
    definition: '/subj ( PARTNER /adj FEMALE /fem /a )',
    emoji: '👧',
    animate: true,
    human: true,
    sex: 'fem',
    synonym: 'romantic partner',
    isA: 'PARTNER',
    forms: {
      en: { base: 'girlfriend', plural: 'girlfriends', count: 'singular' },
      it: { base: 'ragazza', plural: 'ragazze', gender: 'fem', count: 'singular' },
      fr: { base: 'petite amie', plural: 'petites amies', gender: 'fem', count: 'singular' },
      de: { base: 'Freundin', plural: 'Freundinnen', gender: 'fem', count: 'singular' },
      es: { base: 'novia', plural: 'novias', gender: 'fem', count: 'singular' },
      ja: { base: '彼女', count: 'singular', reading: 'かのじょ' },
      pt: { base: 'namorada', plural: 'namoradas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The prospective aspect inside a relative clause — *sta per sposare*, 結婚しようとしている — which
    // is what keeps it apart from SPOUSE's "a person who one marries" (B74 reading 3). German is the
    // adjectival noun *Verlobter* (D8), which its picker label reads and this gloss does not.
    id: 'FIANCE',
    role: 'noun',
    description: 'a person one is engaged to marry',
    definition: `
      /subj ( PERSON /a /rel #2.obj )
      /subj ( one ) /verb ( MARRY /prosp ) /obj ( PERSON )
    `,
    emoji: '💍',
    animate: true,
    human: true,
    isA: 'PARTNER',
    forms: {
      en: { base: 'fiancé', plural: 'fiancés', count: 'singular', fem: 'fiancée', fem_plural: 'fiancées' },
      it: { base: 'fidanzato', plural: 'fidanzati', gender: 'masc', count: 'singular', fem: 'fidanzata', fem_plural: 'fidanzate' },
      fr: { base: 'fiancé', plural: 'fiancés', gender: 'masc', count: 'singular', fem: 'fiancée', fem_plural: 'fiancées' },
      de: { base: 'Verlobt', plural: 'Verlobt', gender: 'masc', count: 'singular', fem: 'Verlobt', fem_plural: 'Verlobt', adjectival: '1' },
      es: { base: 'prometido', plural: 'prometidos', gender: 'masc', count: 'singular', fem: 'prometida', fem_plural: 'prometidas' },
      ja: { base: '婚約者', count: 'singular', reading: 'こんやくしゃ' },
      pt: { base: 'noivo', plural: 'noivos', gender: 'masc', count: 'singular', fem: 'noiva', fem_plural: 'noivas' },
    },
  },
  {
    // Knowledge, not affection: the affection route ("a person to whom one feels affection") reads
    // 愛情を感じる人 in Japanese, "a person who feels affection" — the wrong participant, because the
    // terminus gap goes unmarked there. "Knows well" has no such reading in any of the seven (B74
    // reading 4).
    id: 'FRIEND',
    role: 'noun',
    description: 'a person one knows well and likes',
    definition: `
      /subj ( PERSON /a /rel #2.obj )
      /subj ( one ) /verb ( KNOW /adv WELL ) /obj ( PERSON )
    `,
    emoji: '🧑‍🤝‍🧑',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'friend', plural: 'friends', count: 'singular' },
      it: { base: 'amico', plural: 'amici', gender: 'masc', count: 'singular', fem: 'amica', fem_plural: 'amiche' },
      fr: { base: 'ami', plural: 'amis', gender: 'masc', count: 'singular', fem: 'amie', fem_plural: 'amies' },
      de: { base: 'Freund', plural: 'Freunde', gender: 'masc', count: 'singular', fem: 'Freundin', fem_plural: 'Freundinnen' },
      es: { base: 'amigo', plural: 'amigos', gender: 'masc', count: 'singular', fem: 'amiga', fem_plural: 'amigas' },
      ja: { base: '友達', count: 'singular', reading: 'ともだち' },
      pt: { base: 'amigo', plural: 'amigos', gender: 'masc', count: 'singular', fem: 'amiga', fem_plural: 'amigas' },
    },
  },
  {
    // "Bought and sold" needs two predicates in one relative clause, which RelativeClause's single
    // verbPhrase cannot hold, so the gloss says it with the one verb that covers both — TRADE,
    // seeded for it. Objectless: de "handeln" and fr "commercer" take no direct object (B32).
    id: 'MARKET',
    role: 'noun',
    description: 'a place where goods are bought and sold',
    definition: `
      /subj ( PLACE /a /rel #2.loc )
      /subj ( one ) /verb ( TRADE ) /loc ( PLACE )
    `,
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
    definition: '/subj ( OBJECT_THING /adj SMALL /adj ROUND /a )',
    emoji: '🪙',
    isA: 'OBJECT_THING',
    forms: {
      en: { base: 'coin', plural: 'coins', count: 'singular' },
      it: { base: 'moneta', plural: 'monete', gender: 'fem', count: 'singular' },
      fr: { base: 'pièce', plural: 'pièces', gender: 'fem', count: 'singular' },
      de: { base: 'Münze', plural: 'Münzen', gender: 'fem', count: 'singular', compound: 'Münz' },
      es: { base: 'moneda', plural: 'monedas', gender: 'fem', count: 'singular' },
      ja: { base: '硬貨', count: 'singular', reading: 'こうか' },
      pt: { base: 'moeda', plural: 'moedas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'LEGEND',
    role: 'noun',
    description: 'a traditional story or a famous person',
    definition: '/subj ( STORY /adj OLD /a )',
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
    definition: `
      /subj ( ORGAN /a /rel #2.subj )
      /subj ( ORGAN ) /verb ( FLY )
    `,
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
    definition: `
      /subj ( ORGAN /a /rel #2.subj )
      /subj ( ORGAN ) /verb ( BITE )
    `,
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
    definition: `
      /subj ( LIQUID /zero /rel #2.obj )
      /subj ( one ) /verb ( SHED ) /obj ( LIQUID ) /src ( EYE )
    `,
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
    definition: '/subj ( PERSON /adj YOUNG /adj MALE /a )',
    emoji: '👱‍♂️',
    animate: true,
    human: true,
    sex: 'masc',
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
    definition: '/subj ( PERSON /adj YOUNG /adj FEMALE /a )',
    emoji: '👱‍♀️',
    animate: true,
    human: true,
    sex: 'fem',
    synonym: 'youth',
    isA: 'PERSON',
    forms: {
      en: { base: 'young woman', plural: 'young women', count: 'singular' },
      it: { base: 'giovane', plural: 'giovani', gender: 'fem', count: 'singular' },
      fr: { base: 'jeune femme', plural: 'jeunes femmes', gender: 'fem', count: 'singular' },
      // "jung" is stored as the head's inherent attributive adjective, not baked into the
      // lemma: German declines it for case + determiner ("die junge Frau", "die jungen
      // Frauen", "von einer jungen Frau"), so no single surface string is right everywhere.
      // The picker shows a noun by its lexeme's singular, which here is WOMAN's word, so the whole
      // name is spelled out in `citation` — the strong-weak form the label wants (A144).
      de: { base: 'Frau', plural: 'Frauen', adjective: 'jung', citation: 'junge Frau', gender: 'fem', count: 'singular', compound: 'Frauen' },
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
    definition: `
      /subj ( BUILDING /a /rel #2.loc )
      /subj ( one ) /verb ( CONFINE ) /obj ( PERSON /pl /zero ) /loc ( BUILDING )
    `,
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
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( MAKE ) /obj ( OBJECT_THING /pl /zero )
    `,
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
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( MAKE ) /obj ( OBJECT_THING /pl /zero )
    `,
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
      // A loanword takes the short genitive -s (des Slots), not the -es of a native monosyllable.
      de: { base: 'Slot', plural: 'Slots', gender: 'masc', count: 'singular', genitive: 'Slots' },
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
      // Automat is a weak masculine: den / dem / des Spielautomaten, and the compound stem too.
      de: { base: 'Spielautomat', plural: 'Spielautomaten', gender: 'masc', count: 'singular', weak: '1' },
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
    // What a word expresses: HYPERNYM is "a word whose meaning includes another word's meaning"
    // (localization B50). French sens is the same word in the plural (les sens).
    id: 'MEANING',
    role: 'noun',
    description: 'what a word expresses',
    emoji: '💭',
    forms: {
      en: { base: 'meaning', plural: 'meanings', count: 'singular' },
      it: { base: 'significato', plural: 'significati', gender: 'masc', count: 'singular' },
      fr: { base: 'sens', plural: 'sens', gender: 'masc', count: 'singular' },
      de: { base: 'Bedeutung', plural: 'Bedeutungen', gender: 'fem', count: 'singular' },
      es: { base: 'significado', plural: 'significados', gender: 'masc', count: 'singular' },
      ja: { base: '意味', count: 'singular', reading: 'いみ' },
      pt: { base: 'significado', plural: 'significados', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What a statement asserts: STATEMENT is "a clause that asserts facts" (localization C27), as the
    // school grammars define the declarative sentence. German Tatsache, not Fakt, the loan.
    id: 'FACT',
    role: 'noun',
    description: 'something that is so',
    emoji: '📌',
    forms: {
      en: { base: 'fact', plural: 'facts', count: 'singular' },
      it: { base: 'fatto', plural: 'fatti', gender: 'masc', count: 'singular' },
      fr: { base: 'fait', plural: 'faits', gender: 'masc', count: 'singular' },
      de: { base: 'Tatsache', plural: 'Tatsachen', gender: 'fem', count: 'singular' },
      es: { base: 'hecho', plural: 'hechos', gender: 'masc', count: 'singular' },
      ja: { base: '事実', count: 'singular', reading: 'じじつ' },
      pt: { base: 'fato', plural: 'fatos', gender: 'masc', count: 'singular' },
    },
  },
  // ── P09-E24's reasons and information (localization B81) ─────────────
  {
    // The motive (E24 D2), "a fact that causes an action": Italian induce and French induit are
    // CAUSE_VERB's causative lexemes (C08), which read "leads to", as a motive does. The faculty
    // (ragione, Vernunft, 理性) is another concept, and so is CAUSE (causa, Ursache, 原因).
    id: 'REASON',
    role: 'noun',
    description: 'why someone does something',
    definition: `
      /subj ( FACT /a /rel #2.subj )
      /subj ( FACT ) /verb ( CAUSE_VERB ) /obj ( ACTION /a )
    `,
    emoji: '🤔',
    synonym: 'motive',
    forms: {
      en: { base: 'reason', plural: 'reasons', count: 'singular' },
      it: { base: 'motivo', plural: 'motivi', gender: 'masc', count: 'singular' },
      fr: { base: 'raison', plural: 'raisons', gender: 'fem', count: 'singular' },
      de: { base: 'Grund', plural: 'Gründe', gender: 'masc', count: 'singular' },
      es: { base: 'razón', plural: 'razones', gender: 'fem', count: 'singular' },
      ja: { base: '理由', count: 'singular', reading: 'りゆう' },
      pt: { base: 'razão', plural: 'razões', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "Content that one learns": HELP's mass shape. Mass, as in English; everyday Italian and French
    // say it in the plural (le informazioni, les informations), but the singular is grammatical.
    id: 'INFORMATION',
    role: 'noun',
    description: 'facts told or learned about something',
    definition: `
      /subj ( CONTENT /zero /rel #2.obj )
      /subj ( one ) /verb ( LEARN ) /obj ( CONTENT )
    `,
    emoji: 'ℹ️',
    countable: false,
    forms: {
      en: { base: 'information', count: 'singular' },
      it: { base: 'informazione', gender: 'fem', count: 'singular' },
      fr: { base: 'information', gender: 'fem', count: 'singular' },
      de: { base: 'Information', gender: 'fem', count: 'singular' },
      es: { base: 'información', gender: 'fem', count: 'singular' },
      ja: { base: '情報', count: 'singular', reading: 'じょうほう' },
      pt: { base: 'informação', gender: 'fem', count: 'singular' },
    },
  },
  {
    // How likely a thing is: PROBABLY is "with high probability" (P09-E39), which is how five of the
    // seven say it — "con alta probabilità", "mit hoher Wahrscheinlichkeit", 高い確率で. A `means`
    // noun, so the manner adverbial it heads takes "with" / *con* / *avec* / *mit* / で.
    id: 'PROBABILITY',
    role: 'noun',
    description: 'how likely something is to be or to happen',
    emoji: '📊',
    mannerRelation: 'means',
    forms: {
      en: { base: 'probability', plural: 'probabilities', count: 'singular' },
      it: { base: 'probabilità', plural: 'probabilità', gender: 'fem', count: 'singular' },
      fr: { base: 'probabilité', plural: 'probabilités', gender: 'fem', count: 'singular' },
      de: { base: 'Wahrscheinlichkeit', plural: 'Wahrscheinlichkeiten', gender: 'fem', count: 'singular' },
      es: { base: 'probabilidad', plural: 'probabilidades', gender: 'fem', count: 'singular' },
      ja: { base: '確率', count: 'singular', reading: 'かくりつ' },
      pt: { base: 'probabilidade', plural: 'probabilidades', gender: 'fem', count: 'singular' },
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
  // ── P09's question, and the two words B60's verb glosses stand on (localization B60) ──
  {
    // "A phrase with which one asks": the instrument gap, since the object gap is German "eine
    // Phrase, nach der man fragt", a phrase one asks *for*. Japanese drops the role (尋ねるフレーズ),
    // as EYE's 見る器官 does. Under PHRASE rather than CLAUSE, whose words are the grammar's
    // (proposizione, 節); STATEMENT is the grammar sibling. QUESTION is glossed on ASK, not ASK on
    // QUESTION: every language asks one with a light verb of its own (fare una domanda, eine Frage
    // stellen, 質問する).
    id: 'QUESTION',
    role: 'noun',
    description: 'words said to learn something',
    definition: `
      /subj ( PHRASE /a /rel #2.inst )
      /subj ( one ) /verb ( ASK )
    `,
    emoji: '❔',
    isA: 'PHRASE',
    forms: {
      en: { base: 'question', plural: 'questions', count: 'singular' },
      it: { base: 'domanda', plural: 'domande', gender: 'fem', count: 'singular' },
      fr: { base: 'question', plural: 'questions', gender: 'fem', count: 'singular' },
      de: { base: 'Frage', plural: 'Fragen', gender: 'fem', count: 'singular' },
      es: { base: 'pregunta', plural: 'preguntas', gender: 'fem', count: 'singular' },
      ja: { base: '質問', count: 'singular', reading: 'しつもん' },
      pt: { base: 'pergunta', plural: 'perguntas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The differentia of CALL_PHONE's gloss, "to use a telephone to speak with a person". Its own
    // gloss is "an object with which one speaks", true of a microphone too, but distinct among
    // OBJECT_THING's seeded kinds. German Telefon is a loan and takes the short genitive (des Telefons).
    id: 'TELEPHONE',
    role: 'noun',
    description: 'a device for speaking with someone far away',
    definition: `
      /subj ( OBJECT_THING /a /rel #2.inst )
      /subj ( one ) /verb ( SPEAK )
    `,
    emoji: '☎️',
    isA: 'OBJECT_THING',
    forms: {
      en: { base: 'telephone', plural: 'telephones', count: 'singular' },
      it: { base: 'telefono', plural: 'telefoni', gender: 'masc', count: 'singular' },
      fr: { base: 'téléphone', plural: 'téléphones', gender: 'masc', count: 'singular' },
      de: { base: 'Telefon', plural: 'Telefone', gender: 'neut', count: 'singular', genitive: 'Telefons' },
      es: { base: 'teléfono', plural: 'teléfonos', gender: 'masc', count: 'singular' },
      ja: { base: '電話', count: 'singular', reading: 'でんわ' },
      pt: { base: 'telefone', plural: 'telefones', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The differentia of THINK's gloss, "to use the mind". Japanese 頭脳, since 心 is the heart (心を使う
    // is "to be considerate") and 頭 the head; German Verstand, since Geist is the spirit. Verstand has
    // no plural in use: Verstände is the regular one (Zustand, Zustände) a plural pick falls back on.
    // Unglossed, a root of C26's kind: "a part with which one thinks" would define THINK back, and "a
    // part of a person" is also a hand.
    id: 'MIND',
    role: 'noun',
    description: 'the faculty of a person that thinks',
    emoji: '🧠',
    forms: {
      en: { base: 'mind', plural: 'minds', count: 'singular' },
      it: { base: 'mente', plural: 'menti', gender: 'fem', count: 'singular' },
      fr: { base: 'esprit', plural: 'esprits', gender: 'masc', count: 'singular' },
      de: { base: 'Verstand', plural: 'Verstände', gender: 'masc', count: 'singular' },
      es: { base: 'mente', plural: 'mentes', gender: 'fem', count: 'singular' },
      ja: { base: '頭脳', count: 'singular', reading: 'ずのう' },
      pt: { base: 'mente', plural: 'mentes', gender: 'fem', count: 'singular' },
    },
  },

  {
    id: 'CONTINENT',
    role: 'noun',
    description: 'one of the earth’s great landmasses',
    definition: '/subj ( LAND /adj GREAT /zero )',
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
    // The hottest continent (localization B48), A17's superlative on the climate sense of HOT: ja
    // 最も暑い大陸, es "el continente más caluroso", where HOT is 熱い to the touch and caliente.
    definition: '/subj ( CONTINENT /adj ( HOT_CLIMATE /most ) )',
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
      // Stressed a-, as "agua": bare on its own, but "el África negra" once an adjective articles it.
      es: { base: 'África', gender: 'fem', stressed_a: '1', count: 'singular' },
      ja: { base: 'アフリカ', count: 'singular' },
      pt: { base: 'África', gender: 'fem', count: 'singular' },
    },
  },

  // The remaining continents, all shaped like AFRICA above: proper, uncountable, no plural,
  // feminine in the Romance languages and neuter in German. Japanese takes 北米 / 南米 for the
  // Americas rather than a transliteration — they are the ordinary words.
  // ── PERSONAL NAMES ───────────────────────────────────────────────
  // The corpus's proper nouns were all places and languages; a title has nothing to precede without
  // a person's name, so C38 seeds two. They are `proper` and `human`, which is what tells them from
  // a place: the languages that article a place name leave a person's bare ("Pietro", "Pierre",
  // not "il Pietro"), which their forms say with `takes_article: '0'` — Portuguese is the one that
  // keeps it ("o Pedro"), as Portuguese does. Each language spells the name its own way, the way it
  // already spells Europe; Japanese writes it in katakana.
  {
    id: 'PETER',
    role: 'noun',
    description: 'a personal name (male)',
    emoji: '🧔',
    proper: true,
    human: true,
    sex: 'masc',
    animate: true,
    countable: false,
    isA: 'PERSON',
    forms: {
      en: { base: 'Peter',   count: 'singular' },
      it: { base: 'Pietro',  gender: 'masc', count: 'singular', takes_article: '0' },
      fr: { base: 'Pierre',  gender: 'masc', count: 'singular', takes_article: '0' },
      de: { base: 'Peter',   gender: 'masc', count: 'singular' },
      es: { base: 'Pedro',   gender: 'masc', count: 'singular' },
      ja: { base: 'ピーター', count: 'singular' },
      pt: { base: 'Pedro',   gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'MARY',
    role: 'noun',
    description: 'a personal name (female)',
    emoji: '👩',
    proper: true,
    human: true,
    sex: 'fem',
    animate: true,
    countable: false,
    isA: 'PERSON',
    forms: {
      en: { base: 'Mary',    count: 'singular' },
      it: { base: 'Maria',   gender: 'fem', count: 'singular', takes_article: '0' },
      fr: { base: 'Marie',   gender: 'fem', count: 'singular', takes_article: '0' },
      de: { base: 'Maria',   gender: 'fem', count: 'singular' },
      es: { base: 'María',   gender: 'fem', count: 'singular' },
      ja: { base: 'メアリー', count: 'singular' },
      pt: { base: 'Maria',   gender: 'fem', count: 'singular' },
    },
  },
  {
    // Eugen Dieth (1893–1956), whose *Schwyzertütschi Dialäktschrift* (1938) is the spelling the
    // Swiss German row is written in (P10 D2): "Dieth's spelling", the row's tooltip (P10-E2).
    id: 'DIETH',
    role: 'noun',
    description: 'Eugen Dieth, the Swiss linguist who devised a spelling for Swiss German dialects',
    emoji: '🧑‍🏫',
    proper: true,
    human: true,
    sex: 'masc',
    animate: true,
    countable: false,
    isA: 'PERSON',
    forms: {
      en: { base: 'Dieth',    count: 'singular' },
      it: { base: 'Dieth',    gender: 'masc', count: 'singular', takes_article: '0' },
      fr: { base: 'Dieth',    gender: 'masc', count: 'singular', takes_article: '0' },
      de: { base: 'Dieth',    gender: 'masc', count: 'singular' },
      es: { base: 'Dieth',    gender: 'masc', count: 'singular' },
      ja: { base: 'ディート', count: 'singular' },
      pt: { base: 'Dieth',    gender: 'masc', count: 'singular' },
    },
  },
  // P09's *Mr* (localization C38). A title is a common noun that fuses with a name into one phrase,
  // and four things about it are each language's own: Italian drops the final -e before a name
  // (`before_name`, "il signor Pietro" beside "il signore"); Italian, Spanish and Portuguese write
  // the article, which agrees with the title and not with the name; English, French and German write
  // none; and Japanese writes it **after** the name, as a suffix, and says it of anyone, not only of
  // men (`position: 'suffix'`). It is `title: true`, so no ordinary noun slot offers it.
  {
    id: 'MR',
    role: 'noun',
    slot: 'title',
    description: 'a title used before a man\'s name',
    emoji: '🎩',
    human: true,
    animate: true,
    forms: {
      // `takes_article` is whether the language writes an article before a title: Italian and Spanish
      // do (and it overrides the bare article a personal name takes as a name), French does not, and
      // German, English and Japanese have none to write. Portuguese articles a proper noun already.
      en: { base: 'Mr',       plural: 'Messrs',   count: 'singular' },
      it: { base: 'signore',  plural: 'signori',  gender: 'masc', count: 'singular', before_name: 'signor', takes_article: '1' },
      fr: { base: 'monsieur', plural: 'messieurs', gender: 'masc', count: 'singular', takes_article: '0' },
      de: { base: 'Herr',     plural: 'Herren',   gender: 'masc', count: 'singular' },
      es: { base: 'señor',    plural: 'señores',  gender: 'masc', count: 'singular', takes_article: '1' },
      ja: { base: 'さん',      count: 'singular',  position: 'suffix' },
      pt: { base: 'senhor',   plural: 'senhores', gender: 'masc', count: 'singular' },
    },
  },
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
    // A superlative is what tells one continent from the others, where "a continent" did not
    // (localization A17): de "der größte Kontinent", ja 最も大きい大陸, pt "o maior continente"
    // — prenominal since A178 was fixed, where it shipped as "o continente maior".
    definition: '/subj ( CONTINENT /adj ( BIG /most ) )',
    emoji: '🌏',
    proper: true,
    countable: false,
    isA: 'CONTINENT',
    forms: {
      en: { base: 'Asia',   count: 'singular' },
      it: { base: 'Asia',   gender: 'fem',  count: 'singular' },
      fr: { base: 'Asie',   gender: 'fem',  count: 'singular' },
      de: { base: 'Asien',  gender: 'neut', count: 'singular' },
      es: { base: 'Asia',   gender: 'fem',  stressed_a: '1', count: 'singular' }, // "el Asia central", as AFRICA
      ja: { base: 'アジア', count: 'singular' },
      pt: { base: 'Ásia',   gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'OCEANIA',
    role: 'noun',
    description: 'the continent of Australia and the Pacific islands',
    // Australia's continent, the smallest: "the smallest continent" (localization A17, as ASIA).
    definition: '/subj ( CONTINENT /adj ( SMALL /most ) )',
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
    // The coldest continent (localization B48), as AFRICA is the hottest: ja 最も寒い大陸, where COLD
    // is 冷たい, cold to the touch. German umlauts it, "der kälteste Kontinent".
    definition: '/subj ( CONTINENT /adj ( COLD_CLIMATE /most ) )',
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

  // ── Countries ─────────────────────────────────────────────────────
  // The country of each UI language, the possessor that tells one language from another: ITALIAN is
  // "the language of Italy", de "die Sprache Italiens" (localization B36). Proper and uncountable,
  // like the continents, and neuter in German, which declines them in the genitive with -s. England,
  // not the United Kingdom: English is England's language. The countries themselves keep their
  // literal descriptions: "a country" would be the same for all seven.
  // Portuguese articles its country names as it articles the continents ("a Itália", "o Japão"),
  // all but Portugal, which is bare: "de Portugal", "em Portugal". `takes_article: '0'` marks the
  // exception on the pt forms; the Portuguese engine reads it, as de and es read `takes_article: '1'`.
  // They hang under COUNTRY, as the continents under CONTINENT, and a named land's goal keys off
  // either hypernym: "va in Italia", "va en Italie" but "au Japon", "geht nach Italien".
  {
    // The genus of the seven countries. A common noun, where its children are proper. Italian
    // "paese" is the country (it is also the village, which the context tells apart); German "Land"
    // declines "des Landes", "den Ländern".
    id: 'COUNTRY',
    role: 'noun',
    description: 'a nation with its own territory and government',
    definition: `
      /subj ( LAND /zero /rel #2.obj )
      /subj ( NATION /a ) /verb ( GOVERN_STATE ) /obj ( LAND )
    `,
    emoji: '🏳️',
    isA: 'PLACE',
    forms: {
      en: { base: 'country', plural: 'countries', count: 'singular' },
      it: { base: 'paese', plural: 'paesi', gender: 'masc', count: 'singular' },
      fr: { base: 'pays', plural: 'pays', gender: 'masc', count: 'singular' },
      de: { base: 'Land', plural: 'Länder', gender: 'neut', count: 'singular', compound: 'Landes' },
      es: { base: 'país', plural: 'países', gender: 'masc', count: 'singular' },
      ja: { base: '国', count: 'singular', reading: 'くに' },
      pt: { base: 'país', plural: 'países', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A big place where many people live (localization B78): HOME's LIVE, under a `many` subject.
    // Italian città is invariable; German Stadt umlauts in the plural (Städte). Japanese 都市, the
    // city as a kind of place (町 is also the town).
    id: 'CITY',
    role: 'noun',
    description: 'a large town; a big place where many people live',
    definition: `
      /subj ( PLACE /adj BIG /a /rel #2.loc )
      /subj ( PERSON /pl /many ) /verb ( LIVE ) /loc ( PLACE )
    `,
    emoji: '🏙️',
    isA: 'PLACE',
    forms: {
      en: { base: 'city', plural: 'cities', count: 'singular' },
      it: { base: 'città', plural: 'città', gender: 'fem', count: 'singular' },
      fr: { base: 'ville', plural: 'villes', gender: 'fem', count: 'singular' },
      de: { base: 'Stadt', plural: 'Städte', gender: 'fem', count: 'singular' },
      es: { base: 'ciudad', plural: 'ciudades', gender: 'fem', count: 'singular' },
      ja: { base: '都市', count: 'singular', reading: 'とし' },
      pt: { base: 'cidade', plural: 'cidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'ENGLAND',
    role: 'noun',
    description: 'the largest country of the United Kingdom, in the south of Great Britain',
    emoji: '🏴',
    proper: true,
    countable: false,
    isA: 'COUNTRY',
    forms: {
      en: { base: 'England',     count: 'singular' },
      it: { base: 'Inghilterra', gender: 'fem',  count: 'singular' },
      fr: { base: 'Angleterre',  gender: 'fem',  count: 'singular' },
      de: { base: 'England',     gender: 'neut', count: 'singular' },
      es: { base: 'Inglaterra',  gender: 'fem',  count: 'singular' },
      ja: { base: 'イングランド', count: 'singular' },
      pt: { base: 'Inglaterra',  gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'ITALY',
    role: 'noun',
    description: 'the country of the peninsula in the middle of the Mediterranean',
    emoji: '🇮🇹',
    proper: true,
    countable: false,
    isA: 'COUNTRY',
    forms: {
      en: { base: 'Italy',   count: 'singular' },
      it: { base: 'Italia',  gender: 'fem',  count: 'singular' },
      fr: { base: 'Italie',  gender: 'fem',  count: 'singular' },
      de: { base: 'Italien', gender: 'neut', count: 'singular' },
      es: { base: 'Italia',  gender: 'fem',  count: 'singular' },
      ja: { base: 'イタリア', count: 'singular' },
      pt: { base: 'Itália',  gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'FRANCE',
    role: 'noun',
    description: 'the country of western Europe between the Atlantic and the Rhine',
    emoji: '🇫🇷',
    proper: true,
    countable: false,
    isA: 'COUNTRY',
    forms: {
      en: { base: 'France',     count: 'singular' },
      it: { base: 'Francia',    gender: 'fem',  count: 'singular' },
      fr: { base: 'France',     gender: 'fem',  count: 'singular' },
      de: { base: 'Frankreich', gender: 'neut', count: 'singular' },
      es: { base: 'Francia',    gender: 'fem',  count: 'singular' },
      ja: { base: 'フランス',   count: 'singular' },
      pt: { base: 'França',     gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'GERMANY',
    role: 'noun',
    description: 'the country of central Europe between the North Sea and the Alps',
    emoji: '🇩🇪',
    proper: true,
    countable: false,
    isA: 'COUNTRY',
    forms: {
      en: { base: 'Germany',     count: 'singular' },
      it: { base: 'Germania',    gender: 'fem',  count: 'singular' },
      fr: { base: 'Allemagne',   gender: 'fem',  count: 'singular' },
      de: { base: 'Deutschland', gender: 'neut', count: 'singular' },
      es: { base: 'Alemania',    gender: 'fem',  count: 'singular' },
      ja: { base: 'ドイツ',      count: 'singular' },
      pt: { base: 'Alemanha',    gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'SPAIN',
    role: 'noun',
    description: 'the country that covers most of the Iberian peninsula',
    emoji: '🇪🇸',
    proper: true,
    countable: false,
    isA: 'COUNTRY',
    forms: {
      en: { base: 'Spain',   count: 'singular' },
      it: { base: 'Spagna',  gender: 'fem',  count: 'singular' },
      fr: { base: 'Espagne', gender: 'fem',  count: 'singular' },
      de: { base: 'Spanien', gender: 'neut', count: 'singular' },
      es: { base: 'España',  gender: 'fem',  count: 'singular' },
      ja: { base: 'スペイン', count: 'singular' },
      pt: { base: 'Espanha', gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'JAPAN',
    role: 'noun',
    description: 'the island country east of the Asian mainland',
    emoji: '🇯🇵',
    proper: true,
    countable: false,
    isA: 'COUNTRY',
    forms: {
      en: { base: 'Japan',     count: 'singular' },
      it: { base: 'Giappone',  gender: 'masc', count: 'singular' },
      fr: { base: 'Japon',     gender: 'masc', count: 'singular' },
      de: { base: 'Japan',     gender: 'neut', count: 'singular' },
      es: { base: 'Japón',     gender: 'masc', count: 'singular' },
      ja: { base: '日本',      count: 'singular', reading: 'にほん' },
      pt: { base: 'Japão',     gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PORTUGAL',
    role: 'noun',
    description: 'the country on the western coast of the Iberian peninsula',
    emoji: '🇵🇹',
    proper: true,
    countable: false,
    isA: 'COUNTRY',
    forms: {
      en: { base: 'Portugal',    count: 'singular' },
      it: { base: 'Portogallo',  gender: 'masc', count: 'singular' },
      fr: { base: 'Portugal',    gender: 'masc', count: 'singular' },
      de: { base: 'Portugal',    gender: 'neut', count: 'singular' },
      es: { base: 'Portugal',    gender: 'masc', count: 'singular' },
      ja: { base: 'ポルトガル',  count: 'singular' },
      pt: { base: 'Portugal',    gender: 'masc', takes_article: '0', count: 'singular' },
    },
  },
  {
    // The city whose dialect the Swiss German row writes (P10 D1): the row reads "Swiss German
    // (Zürich)" in every interface language (P10-E2 D2). A city name takes no article in any of the
    // seven, the Romance ones included.
    id: 'ZURICH',
    role: 'noun',
    description: 'the largest city of Switzerland, on Lake Zurich',
    emoji: '🏙️',
    proper: true,
    countable: false,
    isA: 'CITY',
    forms: {
      en: { base: 'Zurich',      count: 'singular' },
      it: { base: 'Zurigo',      gender: 'fem',  count: 'singular', takes_article: '0' },
      fr: { base: 'Zurich',      gender: 'masc', count: 'singular', takes_article: '0' },
      de: { base: 'Zürich',      gender: 'neut', count: 'singular' },
      es: { base: 'Zúrich',      gender: 'masc', count: 'singular' },
      ja: { base: 'チューリッヒ', count: 'singular' },
      pt: { base: 'Zurique',     gender: 'masc', takes_article: '0', count: 'singular' },
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
      de: { base: 'Sprache', plural: 'Sprachen', gender: 'fem', count: 'singular', compound: 'Sprach' },
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
  // "A language" is the same for all seven, so each is glossed by its country: "Italy's language",
  // de "die Sprache Italiens" (localization B36).
  {
    id: 'ENGLISH',
    role: 'noun',
    description: 'the English language',
    definition: '/subj ( LANGUAGE /poss [ ENGLAND ] )',
    emoji: '🇬🇧',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'English', count: 'singular' },
      it: { base: 'inglese', gender: 'masc', count: 'singular' },
      fr: { base: 'anglais', gender: 'masc', count: 'singular' },
      // A language's name leaves its genitive unmarked (des Englisch), so a bare one as a possessor
      // takes "von" (B09).
      de: { base: 'Englisch', gender: 'neut', count: 'singular', genitive: 'Englisch' },
      es: { base: 'inglés', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: '英語', count: 'singular', reading: 'えいご' },
      pt: { base: 'inglês', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ITALIAN',
    role: 'noun',
    description: 'the Italian language',
    definition: '/subj ( LANGUAGE /poss [ ITALY ] )',
    emoji: '🇮🇹',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Italian', count: 'singular' },
      it: { base: 'italiano', gender: 'masc', count: 'singular' },
      fr: { base: 'italien', gender: 'masc', count: 'singular' },
      de: { base: 'Italienisch', gender: 'neut', count: 'singular', genitive: 'Italienisch' },
      es: { base: 'italiano', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'イタリア語', count: 'singular', reading: 'いたりあご' },
      pt: { base: 'italiano', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'FRENCH',
    role: 'noun',
    description: 'the French language',
    definition: '/subj ( LANGUAGE /poss [ FRANCE ] )',
    emoji: '🇫🇷',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'French', count: 'singular' },
      it: { base: 'francese', gender: 'masc', count: 'singular' },
      fr: { base: 'français', gender: 'masc', count: 'singular' },
      de: { base: 'Französisch', gender: 'neut', count: 'singular', genitive: 'Französisch' },
      es: { base: 'francés', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'フランス語', count: 'singular', reading: 'ふらんすご' },
      pt: { base: 'francês', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GERMAN',
    role: 'noun',
    description: 'the German language',
    definition: '/subj ( LANGUAGE /poss [ GERMANY ] )',
    emoji: '🇩🇪',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'German', count: 'singular' },
      it: { base: 'tedesco', gender: 'masc', count: 'singular' },
      fr: { base: 'allemand', gender: 'masc', count: 'singular' },
      de: { base: 'Deutsch', gender: 'neut', count: 'singular', genitive: 'Deutsch' },
      es: { base: 'alemán', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'ドイツ語', count: 'singular', reading: 'どいつご' },
      pt: { base: 'alemão', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SPANISH',
    role: 'noun',
    description: 'the Spanish language',
    definition: '/subj ( LANGUAGE /poss [ SPAIN ] )',
    emoji: '🇪🇸',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Spanish', count: 'singular' },
      it: { base: 'spagnolo', gender: 'masc', count: 'singular' },
      fr: { base: 'espagnol', gender: 'masc', count: 'singular' },
      de: { base: 'Spanisch', gender: 'neut', count: 'singular', genitive: 'Spanisch' },
      es: { base: 'español', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'スペイン語', count: 'singular', reading: 'すぺいんご' },
      pt: { base: 'espanhol', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'JAPANESE',
    role: 'noun',
    description: 'the Japanese language',
    definition: '/subj ( LANGUAGE /poss [ JAPAN ] )',
    emoji: '🇯🇵',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Japanese', count: 'singular' },
      it: { base: 'giapponese', gender: 'masc', count: 'singular' },
      fr: { base: 'japonais', gender: 'masc', count: 'singular' },
      de: { base: 'Japanisch', gender: 'neut', count: 'singular', genitive: 'Japanisch' },
      es: { base: 'japonés', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: '日本語', count: 'singular', reading: 'にほんご' },
      pt: { base: 'japonês', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PORTUGUESE',
    role: 'noun',
    description: 'the Portuguese language',
    // "a língua de Portugal", bare: the one country name Portuguese does not article.
    definition: '/subj ( LANGUAGE /poss [ PORTUGAL ] )',
    emoji: '🇵🇹',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Portuguese', count: 'singular' },
      it: { base: 'portoghese', gender: 'masc', count: 'singular' },
      fr: { base: 'portugais', gender: 'masc', count: 'singular' },
      de: { base: 'Portugiesisch', gender: 'neut', count: 'singular', genitive: 'Portugiesisch' },
      es: { base: 'portugués', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'ポルトガル語', count: 'singular', reading: 'ぽるとがるご' },
      pt: { base: 'português', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P10: the language of the eighth row — Zürichdeutsch, in Dieth spelling (P10 D1, D2). Its own
    // name is Dieth-consistent for Zürich, long *ii* (P10-E2 D1, verify at E14). No definition: the
    // other language names say "the language of <country>", and Switzerland has four.
    id: 'SWISS_GERMAN',
    role: 'noun',
    description: 'the Alemannic German spoken in German-speaking Switzerland',
    emoji: '🗣️',
    proper: true,
    countable: false,
    isA: 'LANGUAGE',
    forms: {
      en: { base: 'Swiss German', count: 'singular' },
      it: { base: 'svizzero tedesco', gender: 'masc', count: 'singular' },
      fr: { base: 'suisse allemand', gender: 'masc', count: 'singular' },
      de: { base: 'Schweizerdeutsch', gender: 'neut', count: 'singular', genitive: 'Schweizerdeutsch' },
      es: { base: 'alemán suizo', gender: 'masc', takes_article: '1', count: 'singular' },
      ja: { base: 'スイスドイツ語', count: 'singular', reading: 'すいすどいつご' },
      pt: { base: 'alemão suíço', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The conventional way a language writes its words (P10-E2: "Dieth's spelling", "no standard
    // spelling"). Countable: a language may have several.
    id: 'SPELLING',
    role: 'noun',
    description: 'the conventional way of writing the words of a language; orthography',
    emoji: '🔡',
    synonym: 'orthography',
    forms: {
      en: { base: 'spelling', plural: 'spellings', count: 'singular' },
      it: { base: 'ortografia', plural: 'ortografie', gender: 'fem', count: 'singular' },
      fr: { base: 'orthographe', plural: 'orthographes', gender: 'fem', count: 'singular' },
      de: { base: 'Rechtschreibung', plural: 'Rechtschreibungen', gender: 'fem', count: 'singular' },
      es: { base: 'ortografía', plural: 'ortografías', gender: 'fem', count: 'singular' },
      ja: { base: '綴り', count: 'singular', reading: 'つづり' },
      pt: { base: 'ortografia', plural: 'ortografias', gender: 'fem', count: 'singular' },
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
  {
    // The shortest period the corpus names — JUST's gloss, "a moment ago" (C29). B67 named the seven
    // forms; French and German take their own word for it (*instant*, *Augenblick*) where the other
    // five say *moment*. Left on the English literal: "a small period" is what the corpus can
    // compose, and small is not short — the differentia MOMENT wants (SHORT) is not seeded, and
    // seeding it for one tooltip costs a seven-language paradigm no other gloss in this batch uses.
    id: 'MOMENT',
    role: 'noun',
    description: 'a very short period of time',
    emoji: '⏱️',
    isA: 'PERIOD_TIME',
    forms: {
      en: { base: 'moment', plural: 'moments', count: 'singular' },
      it: { base: 'momento', plural: 'momenti', gender: 'masc', count: 'singular' },
      fr: { base: 'instant', plural: 'instants', gender: 'masc', count: 'singular' },
      de: { base: 'Augenblick', plural: 'Augenblicke', gender: 'masc', count: 'singular' },
      es: { base: 'momento', plural: 'momentos', gender: 'masc', count: 'singular' },
      ja: { base: '瞬間', count: 'singular', reading: 'しゅんかん' },
      pt: { base: 'momento', plural: 'momentos', gender: 'masc', count: 'singular' },
    },
  },
  // P09's day and week (localization B59), periods of time. Seeded ahead of B59's other time words
  // because B66's LAST_PREVIOUS and NEXT_COMING are said of them ("la settimana scorsa"). Japanese 日
  // reads ひ on its own; the deictic compounds (今日, 今週) are fused words the engine cannot compose.
  {
    id: 'DAY',
    role: 'noun',
    description: 'the period of twenty-four hours from one midnight to the next',
    // C26's part-whole possessor with C31's cardinal: what the period is made up of.
    definition: '/subj ( PERIOD_TIME /a /poss [ HOUR /a /num 24 ] /parts )',
    emoji: '📅',
    isA: 'PERIOD_TIME',
    forms: {
      // A day is the noun that most needs its own time preposition (C29): English is *on* a day
      // where it is *at* a time, German *an* dem Tag where it is *zu* der Zeit, and French *en ce
      // jour*. Italian, Spanish, Portuguese and Japanese take the generic one ("in questo giorno",
      // "en este día", "neste dia", この日に), so they name none.
      en: { base: 'day', plural: 'days', count: 'singular', temporal_prep: 'on' },
      it: { base: 'giorno', plural: 'giorni', gender: 'masc', count: 'singular', temporal_prep: 'in' },
      fr: { base: 'jour', plural: 'jours', gender: 'masc', count: 'singular', temporal_prep: 'en' },
      de: { base: 'Tag', plural: 'Tage', gender: 'masc', count: 'singular', temporal_prep: 'an' },
      es: { base: 'día', plural: 'días', gender: 'masc', count: 'singular' },
      // Counted, 日 is its own counter and the noun is not said again: 七日 (C31).
      ja: { base: '日', count: 'singular', reading: 'ひ', counter: '日', counter_join: 'head' },
      pt: { base: 'dia', plural: 'dias', gender: 'masc', count: 'singular' },
    },
  },
  // P09's hour and month (localization C31), the units DAY and YEAR are counted in. Both are their
  // own counter in Japanese (二十四時間, 十二か月), like 日 and 年. 時間 is also TIME's word — Japanese
  // does not tell the hour from time in general — so HOUR is left on its English literal rather than
  // glossed into a phrase that would say TIME twice.
  {
    id: 'HOUR',
    role: 'noun',
    description: 'a period of sixty minutes',
    emoji: '🕐',
    forms: {
      en: { base: 'hour', plural: 'hours', count: 'singular' },
      it: { base: 'ora', plural: 'ore', gender: 'fem', count: 'singular' },
      fr: { base: 'heure', plural: 'heures', gender: 'fem', count: 'singular', elides: '1' },
      de: { base: 'Stunde', plural: 'Stunden', gender: 'fem', count: 'singular' },
      es: { base: 'hora', plural: 'horas', gender: 'fem', count: 'singular' },
      ja: { base: '時間', count: 'singular', reading: 'じかん', counter: '時間', counter_join: 'head' },
      pt: { base: 'hora', plural: 'horas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // P09-E24's minute (localization B80), the unit an hour is counted in. A period of time like DAY
    // and WEEK. Its own counter in Japanese, as 時間 is HOUR's: 五分, never 五つの分 (C31). A counted
    // compound draws no furigana, so the ふん / ぷん of 一分 (いっぷん) and 三分 (さんぷん) is not the
    // lexeme's to spell. Glossed on C26's part-whole shape, with HOUR as the whole.
    id: 'MINUTE',
    role: 'noun',
    description: 'a period of sixty seconds; a sixtieth of an hour',
    definition: '/subj ( PART /a /poss [ HOUR /a ] /whole )',
    emoji: '⏲️',
    isA: 'PERIOD_TIME',
    forms: {
      en: { base: 'minute', plural: 'minutes', count: 'singular' },
      it: { base: 'minuto', plural: 'minuti', gender: 'masc', count: 'singular' },
      fr: { base: 'minute', plural: 'minutes', gender: 'fem', count: 'singular' },
      de: { base: 'Minute', plural: 'Minuten', gender: 'fem', count: 'singular' },
      es: { base: 'minuto', plural: 'minutos', gender: 'masc', count: 'singular' },
      ja: { base: '分', count: 'singular', reading: 'ふん', counter: '分', counter_join: 'head' },
      pt: { base: 'minuto', plural: 'minutos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'MONTH',
    role: 'noun',
    description: 'a period of about thirty days',
    emoji: '🗓️',
    forms: {
      // Like a week, a stretch one is *in* (C29).
      en: { base: 'month', plural: 'months', count: 'singular', temporal_prep: 'in' },
      it: { base: 'mese', plural: 'mesi', gender: 'masc', count: 'singular', temporal_prep: 'in' },
      fr: { base: 'mois', plural: 'mois', gender: 'masc', count: 'singular', temporal_prep: 'en' },
      de: { base: 'Monat', plural: 'Monate', gender: 'masc', count: 'singular', temporal_prep: 'in' },
      es: { base: 'mes', plural: 'meses', gender: 'masc', count: 'singular' },
      ja: { base: '月', count: 'singular', reading: 'つき', counter: 'か月', counter_join: 'head' },
      pt: { base: 'mês', plural: 'meses', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WEEK',
    role: 'noun',
    description: 'a period of seven days',
    definition: '/subj ( PERIOD_TIME /a /poss [ DAY /a /num 7 ] /parts )',
    emoji: '🗓️',
    isA: 'PERIOD_TIME',
    forms: {
      // A stretch one is *in*, not *at*: "in this week", "in dieser Woche", "in questa settimana",
      // "en cette semaine" (C29). Spanish, Portuguese and Japanese take the generic one.
      en: { base: 'week', plural: 'weeks', count: 'singular', temporal_prep: 'in' },
      it: { base: 'settimana', plural: 'settimane', gender: 'fem', count: 'singular', temporal_prep: 'in' },
      fr: { base: 'semaine', plural: 'semaines', gender: 'fem', count: 'singular', temporal_prep: 'en' },
      de: { base: 'Woche', plural: 'Wochen', gender: 'fem', count: 'singular', temporal_prep: 'in' },
      es: { base: 'semana', plural: 'semanas', gender: 'fem', count: 'singular' },
      ja: { base: '週', count: 'singular', reading: 'しゅう', counter: '週間', counter_join: 'head' },
      pt: { base: 'semana', plural: 'semanas', gender: 'fem', count: 'singular' },
    },
  },
  // P09's night and year (localization B59). NIGHT is glossed on FLAME's part-whole shape, with DAY
  // as the whole and DARK as the differentia: "the dark part of a day". A relative clause ("the part
  // of a day that does not have light") would put Japanese's clause on the day, 光がない日の部分; the
  // adjective sits between the whole and the head, 日の暗い部分, as 火の可視の部分 does. The head is
  // definite as FLAME's is: a day has one dark part.
  {
    id: 'NIGHT',
    role: 'noun',
    description: 'the time from sunset to sunrise, when it is dark',
    definition: '/subj ( PART /adj DARK /poss [ DAY /a ] /whole )',
    emoji: '🌙',
    isA: 'PERIOD_TIME',
    forms: {
      en: { base: 'night', plural: 'nights', count: 'singular' },
      it: { base: 'notte', plural: 'notti', gender: 'fem', count: 'singular' },
      fr: { base: 'nuit', plural: 'nuits', gender: 'fem', count: 'singular' },
      de: { base: 'Nacht', plural: 'Nächte', gender: 'fem', count: 'singular' },
      es: { base: 'noche', plural: 'noches', gender: 'fem', count: 'singular' },
      ja: { base: '夜', count: 'singular', reading: 'よる' },
      pt: { base: 'noite', plural: 'noites', gender: 'fem', count: 'singular' },
    },
  },
  {
    // P09-E24's morning (localization B80). Glossed as NIGHT is, FLAME's part-whole shape with DAY as
    // the whole, and FIRST as the differentia: "the first part of a day". Definite, as NIGHT's: a day
    // has one first part.
    id: 'MORNING',
    role: 'noun',
    description: 'the early part of the day, from sunrise to noon',
    definition: '/subj ( PART /adj FIRST /poss [ DAY /a ] /whole )',
    emoji: '🌄',
    isA: 'PERIOD_TIME',
    forms: {
      // The time it is said at (C29): English "in the morning" but "this morning", with no
      // preposition under a demonstrative (`temporal_bare`); Italian and French with none at all,
      // "la mattina", "questa mattina", "le matin", "ce matin"; German "am Morgen", "an diesem
      // Morgen". Spanish and Portuguese take the generic "en" / "em" ("en la mañana", "nesta
      // manhã", the American usage the corpus writes; Spain says "por la mañana"), and Japanese
      // its に (朝に). The fused deictic words (stamattina, 今朝) are not composed.
      en: { base: 'morning', plural: 'mornings', count: 'singular', temporal_prep: 'in', temporal_bare: 'this,that' },
      it: { base: 'mattina', plural: 'mattine', gender: 'fem', count: 'singular', temporal_bare: '1' },
      fr: { base: 'matin', plural: 'matins', gender: 'masc', count: 'singular', temporal_bare: '1' },
      de: { base: 'Morgen', plural: 'Morgen', gender: 'masc', count: 'singular', temporal_prep: 'an' },
      es: { base: 'mañana', plural: 'mañanas', gender: 'fem', count: 'singular' },
      ja: { base: '朝', count: 'singular', reading: 'あさ' },
      pt: { base: 'manhã', plural: 'manhãs', gender: 'fem', count: 'singular' },
    },
  },
  {
    // French année, not an: "an" is the form after a cardinal ("deux ans"), which waits on numerals
    // (C31); under the determiners the builder has, année gives "beaucoup d'années" and "cette année"
    // where an would give "beaucoup d'ans" and "cet an". Japanese 年 reads とし on its own; "this year"
    // is この年, where the language says the fused 今年.
    id: 'YEAR',
    role: 'noun',
    description: 'the period of about 365 days the earth takes to go around the sun',
    // Twelve months rather than 365 days: a number the cardinal table spells, and the unit a year
    // is actually divided into.
    definition: '/subj ( PERIOD_TIME /a /poss [ MONTH /a /num 12 ] /parts )',
    emoji: '📆',
    isA: 'PERIOD_TIME',
    forms: {
      // Like a week, a stretch one is *in* (C29).
      en: { base: 'year', plural: 'years', count: 'singular', temporal_prep: 'in' },
      it: { base: 'anno', plural: 'anni', gender: 'masc', count: 'singular', temporal_prep: 'in' },
      // After a cardinal French says "an", not "année" — "douze ans" (`cardinal_form`, C31).
      fr: { base: 'année', plural: 'années', gender: 'fem', count: 'singular', cardinal_form: 'an', cardinal_form_plural: 'ans', temporal_prep: 'en' },
      de: { base: 'Jahr', plural: 'Jahre', gender: 'neut', count: 'singular', temporal_prep: 'in' },
      es: { base: 'año', plural: 'años', gender: 'masc', count: 'singular' },
      ja: { base: '年', count: 'singular', reading: 'とし', counter: '年', counter_join: 'head' },
      pt: { base: 'ano', plural: 'anos', gender: 'masc', count: 'singular' },
    },
  },

  // ── Grammar terms ─────────────────────────────────────────────────
  // The metalinguistic vocabulary the builder itself is made of — the words for the parts of
  // speech and the subject position. Seeded so the engine can render the builder's own slot
  // labels in the current UI language. SUBJECT is suffixed _GRAMMAR because the plain word is
  // ambiguous (topic, school subject) and that sense may be seeded later.
  {
    // One of the entities an event involves: the genus of the agent (localization B49). The grammar
    // sense only, suffixed and glossed like AGENT_GRAMMAR, because the everyday word is another in
    // two languages: German Teilnehmer and Japanese 参加者 are attendees, where Partizipant and 参与者
    // are what grammars say. Partizipant is a weak masculine: den / dem / des Partizipanten. Glossed
    // on CONCEPT, the corpus's genus for a thing thought rather than held, with the action as the
    // named agent: German *Begriff* is masculine, so "den eine Handlung umfasst" cannot be misread as
    // the concept including the action, as neuter *Wesen* ("das eine Handlung umfasst") could.
    id: 'PARTICIPANT_GRAMMAR',
    role: 'noun',
    description: 'one of the entities an event involves (grammar)',
    definition: `
      /subj ( CONCEPT /a /rel #2.obj )
      /subj ( ACTION /a ) /verb ( INCLUDE ) /obj ( CONCEPT )
    `,
    emoji: '👥',
    synonym: 'grammar',
    forms: {
      en: { base: 'participant', plural: 'participants', count: 'singular' },
      it: { base: 'partecipante', plural: 'partecipanti', gender: 'masc', count: 'singular' },
      fr: { base: 'participant', plural: 'participants', gender: 'masc', count: 'singular' },
      de: { base: 'Partizipant', plural: 'Partizipanten', gender: 'masc', count: 'singular', weak: '1' },
      es: { base: 'participante', plural: 'participantes', gender: 'masc', count: 'singular' },
      ja: { base: '参与者', count: 'singular', reading: 'さんよしゃ' },
      pt: { base: 'participante', plural: 'participantes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The participant that acts — the one a passive demotes to its by-phrase, which is what the
    // builder captions the box with once the patient has taken the subject's place. Suffixed like
    // SUBJECT_GRAMMAR because the plain word also means a person acting for someone else, and only
    // this sense is seeded. German keeps the Latin "Agens", as its grammars do.
    // "A participant that acts" (localization B49): de "ein Partizipant, der handelt", ja
    // 行動する参与者. ACT's 行動する is said of people, and a grammar would say 動作をする, but the gloss
    // still reads as a participant that acts.
    id: 'AGENT_GRAMMAR',
    role: 'noun',
    description: 'the participant that carries out the event (grammar)',
    definition: `
      /subj ( PARTICIPANT_GRAMMAR /a /rel #2.subj )
      /subj ( PARTICIPANT_GRAMMAR ) /verb ( ACT )
    `,
    emoji: '🫱',
    synonym: 'grammar',
    isA: 'PARTICIPANT_GRAMMAR',
    forms: {
      en: { base: 'agent', plural: 'agents', count: 'singular' },
      it: { base: 'agente', plural: 'agenti', gender: 'masc', count: 'singular' },
      fr: { base: 'agent', plural: 'agents', gender: 'masc', count: 'singular' },
      // The Latin grammar terms leave the genitive unmarked: des Agens, des Numerus, des Tempus.
      de: { base: 'Agens', plural: 'Agentien', gender: 'neut', count: 'singular', genitive: 'Agens' },
      es: { base: 'agente', plural: 'agentes', gender: 'masc', count: 'singular' },
      ja: { base: '動作主', count: 'singular', reading: 'どうさしゅ' },
      pt: { base: 'agente', plural: 'agentes', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'SUBJECT_GRAMMAR',
    role: 'noun',
    description: 'the noun phrase a clause predicates something of (grammar)',
    definition: `
      /subj ( PARTICIPANT_GRAMMAR /a /rel #2.subj )
      /subj ( PARTICIPANT_GRAMMAR ) /verb ( GOVERN ) /obj ( VERB /pl /zero )
    `,
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
    // The phrase that calls the hearer, "**Mom**, run" (P11-E3's PhrasePlan.address). It names the
    // period's vocative box, its border toggle and `/voc` (P11-E8). French says *vocatif*, the case's
    // name, not the school grammar's *apostrophe*, which is also the punctuation mark; German *Anrede*,
    // the form of address, not the case *Vokativ* it does not have. Its definition names the hearer
    // rather than repeating HEY's "a word with which one calls a person": "a phrase that indicates the
    // person who the speaker calls" (NAME is 名付ける, *to christen*, and *one* reads "is called" as
    // *si chiama* in Italian, Spanish and Portuguese).
    id: 'VOCATIVE',
    role: 'noun',
    description: 'the phrase that names the person one calls, before the clause (grammar)',
    definition: `
      /subj ( PHRASE /a /rel #2.subj )
      /subj ( PHRASE ) /verb ( INDICATE ) /obj ( PERSON /the /rel #3.obj )
      /subj ( SPEAKER /the ) /verb ( CALL ) /obj ( PERSON )
    `,
    emoji: '📣',
    isA: 'PHRASE',
    forms: {
      en: { base: 'vocative', plural: 'vocatives', count: 'singular' },
      it: { base: 'vocativo', plural: 'vocativi', gender: 'masc', count: 'singular' },
      fr: { base: 'vocatif', plural: 'vocatifs', gender: 'masc', count: 'singular' },
      de: { base: 'Anrede', plural: 'Anreden', gender: 'fem', count: 'singular' },
      es: { base: 'vocativo', plural: 'vocativos', gender: 'masc', count: 'singular' },
      ja: { base: '呼びかけ', count: 'singular', reading: 'よびかけ' },
      pt: { base: 'vocativo', plural: 'vocativos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The complement a transitive verb's action falls on, not a physical thing — suffixed like
    // SUBJECT_GRAMMAR because the plain word means both, and only this sense is seeded
    // (ja 目的語, not 物体).
    id: 'OBJECT_GRAMMAR',
    role: 'noun',
    description: 'the noun phrase a verb\'s action falls on (grammar)',
    definition: `
      /subj ( PARTICIPANT_GRAMMAR /a /rel #2.obj )
      /subj ( VERB /a ) /verb ( GOVERN ) /obj ( PARTICIPANT_GRAMMAR )
    `,
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
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( DESCRIBE ) /obj ( SUBJECT_GRAMMAR /pl /zero )
    `,
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
    // SUBJECT_COMPLEMENT's counterpart on the object — what the object is made into, or taken as
    // ("transform the period into a command", "use the period as the condition", localization C12).
    // Every tradition names it by naming the subject one and swapping the argument, which is what
    // the pairs above and below look like; German alone compounds it (Objektsprädikativ).
    id: 'OBJECT_COMPLEMENT',
    role: 'noun',
    description: 'the complement a verb predicates of its direct object (grammar)',
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( DESCRIBE ) /obj ( OBJECT_GRAMMAR /pl /zero )
    `,
    emoji: '🎯',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'object complement', plural: 'object complements', count: 'singular' },
      it: { base: "complemento predicativo dell'oggetto", plural: "complementi predicativi dell'oggetto", gender: 'masc', count: 'singular' },
      fr: { base: "attribut du complément d'objet", plural: "attributs du complément d'objet", gender: 'masc', count: 'singular' },
      de: { base: 'Objektsprädikativ', plural: 'Objektsprädikative', gender: 'neut', count: 'singular' },
      es: { base: 'complemento predicativo del objeto', plural: 'complementos predicativos del objeto', gender: 'masc', count: 'singular' },
      ja: { base: '目的語補語', count: 'singular', reading: 'もくてきごほご' },
      pt: { base: 'predicativo do objeto', plural: 'predicativos do objeto', gender: 'masc', count: 'singular' },
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
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( MEANS /pl /zero )
    `,
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
    // The name of the comitative complement — the companion an action is carried out together with
    // ("coordinate with the other period", localization C12). English and German take the
    // Indo-European case name, as they do for the instrumental; the Romance traditions name the
    // circumstance (compagnia / accompagnement / compañía / companhia), and Japanese the case.
    id: 'COMITATIVE',
    role: 'noun',
    description: 'the complement naming the companion an action is carried out with (grammar)',
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( COMPANION /pl /zero )
    `,
    emoji: '🤝',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'comitative', plural: 'comitatives', count: 'singular' },
      it: { base: 'complemento di compagnia', plural: 'complementi di compagnia', gender: 'masc', count: 'singular' },
      fr: { base: "complément d'accompagnement", plural: "compléments d'accompagnement", gender: 'masc', count: 'singular' },
      de: { base: 'Komitativ', plural: 'Komitative', gender: 'masc', count: 'singular' },
      es: { base: 'complemento circunstancial de compañía', plural: 'complementos circunstanciales de compañía', gender: 'masc', count: 'singular' },
      ja: { base: '共同格', count: 'singular', reading: 'きょうどうかく' },
      pt: { base: 'adjunto adverbial de companhia', plural: 'adjuntos adverbiais de companhia', gender: 'masc', count: 'singular' },
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
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( WAY /pl /zero )
    `,
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
    definition: `
      /subj ( PHRASE /a /rel #2.subj )
      /subj ( PHRASE ) /verb ( MODIFY ) /obj ( VERB /pl /zero )
    `,
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
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( PLACE /pl /zero )
    `,
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
    // "a complement that indicates destinations" (localization B37): the place reached, where
    // LOCATIVE's "places" is where it happens. SOURCE and ROUTE take the place left and the place
    // crossed, so the siblings differ only in the noun.
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( DESTINATION /pl /zero )
    `,
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
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( ORIGIN /pl /zero )
    `,
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
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( PATH /pl /zero )
    `,
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
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( CAUSE /pl /zero )
    `,
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
    // The *when* of a clause — the complement C29 built, which places an act at a time, a moment
    // ago, until then, after / before / during it. Named with the same tradition words as its
    // siblings: the Italian and Spanish "complemento di/de tempo/tiempo", the French circumstantial,
    // the German adverbial determination, the Portuguese adjunct, the Japanese 副詞語句.
    id: 'TEMPORAL_COMPLEMENT',
    role: 'noun',
    description: 'the complement naming the time something happens (grammar)',
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( TIME /pl /zero )
    `,
    emoji: '⏳',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'temporal', plural: 'temporals', count: 'singular' },
      it: { base: 'complemento di tempo', plural: 'complementi di tempo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de temps', plural: 'compléments circonstanciels de temps', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'der Zeit', citation: 'adverbiale Bestimmung der Zeit', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de tiempo', plural: 'complementos circunstanciales de tiempo', gender: 'masc', count: 'singular' },
      ja: { base: '時間の副詞語句', count: 'singular', reading: 'じかんのふくしごく' },
      pt: { base: 'adjunto adverbial de tempo', plural: 'adjuntos adverbiais de tempo', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The *for* of a clause — the complement P09-E2 built, naming the beneficiary or goal an act is
    // for ("works for the man"). Named with its siblings' tradition words: the Italian "complemento
    // di fine" (or "di scopo"), the French circumstantial "de but", the German adverbial
    // determination "des Zwecks", the Portuguese "adjunto adverbial de finalidade".
    id: 'PURPOSE_COMPLEMENT',
    role: 'noun',
    description: 'the complement naming what or whom something is done for (grammar)',
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( PURPOSE /pl /zero )
    `,
    emoji: '🏁',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'purpose', plural: 'purposes', count: 'singular' },
      it: { base: 'complemento di fine', plural: 'complementi di fine', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de but', plural: 'compléments circonstanciels de but', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'des Zwecks', citation: 'adverbiale Bestimmung des Zwecks', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de finalidad', plural: 'complementos circunstanciales de finalidad', gender: 'masc', count: 'singular' },
      ja: { base: '目的の副詞語句', count: 'singular', reading: 'もくてきのふくしごく' },
      pt: { base: 'adjunto adverbial de finalidade', plural: 'adjuntos adverbiais de finalidade', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The *against* of a clause (P09-E22) — the party an act is directed against ("plays against the
    // dog"). The Italian school name is the "complemento di svantaggio", the *contro* of the pair
    // "vantaggio e svantaggio"; the others name it after the opposition, with their siblings' words.
    // Literal by design for now: its gloss would be "a complement that indicates an opponent", and
    // the corpus has no OPPONENT noun to say it with.
    id: 'OPPONENT_COMPLEMENT',
    role: 'noun',
    description: 'the complement naming whom something is done against (grammar)',
    emoji: '⚔️',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'opponent', plural: 'opponents', count: 'singular' },
      it: { base: 'complemento di svantaggio', plural: 'complementi di svantaggio', gender: 'masc', count: 'singular' },
      fr: { base: "complément circonstanciel d'opposition", plural: "compléments circonstanciels d'opposition", gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'des Gegners', citation: 'adverbiale Bestimmung des Gegners', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de oposición', plural: 'complementos circunstanciales de oposición', gender: 'masc', count: 'singular' },
      ja: { base: '相手の副詞語句', count: 'singular', reading: 'あいてのふくしごく' },
      pt: { base: 'adjunto adverbial de oposição', plural: 'adjuntos adverbiais de oposição', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The *about* of a clause (P09-E2) — what is spoken or thought of ("speaks about the cat"). The
    // Italian "complemento di argomento" and the Portuguese "adjunto adverbial de assunto" are the
    // school names; the others follow their siblings. Literal by design for now: its gloss would be
    // "a complement that indicates a topic", and the corpus has no TOPIC noun to say it with.
    id: 'TOPIC_COMPLEMENT',
    role: 'noun',
    description: 'the complement naming what something is about (grammar)',
    emoji: '💬',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'topic', plural: 'topics', count: 'singular' },
      it: { base: 'complemento di argomento', plural: 'complementi di argomento', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de propos', plural: 'compléments circonstanciels de propos', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'des Themas', citation: 'adverbiale Bestimmung des Themas', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de tema', plural: 'complementos circunstanciales de tema', gender: 'masc', count: 'singular' },
      ja: { base: '話題の副詞語句', count: 'singular', reading: 'わだいのふくしごく' },
      pt: { base: 'adjunto adverbial de assunto', plural: 'adjuntos adverbiais de assunto', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The *as* of a role said of the subject (P09-E13) — the capacity someone acts in ("acts as a
    // friend"). Named after its siblings, by the role each tradition calls it after. Literal by
    // design for now: its gloss would be "a complement that indicates roles", and the corpus has no
    // ROLE noun to say it with.
    id: 'ROLE_COMPLEMENT',
    role: 'noun',
    description: 'the complement naming the capacity in which someone does something (grammar)',
    emoji: '🎭',
    synonym: 'grammar',
    isA: 'COMPLEMENT_GRAMMAR',
    forms: {
      en: { base: 'role', plural: 'roles', count: 'singular' },
      it: { base: 'complemento di ruolo', plural: 'complementi di ruolo', gender: 'masc', count: 'singular' },
      fr: { base: 'complément circonstanciel de rôle', plural: 'compléments circonstanciels de rôle', gender: 'masc', count: 'singular' },
      de: { base: 'Bestimmung', plural: 'Bestimmungen', adjective: 'adverbial', postnominal: 'der Rolle', citation: 'adverbiale Bestimmung der Rolle', gender: 'fem', count: 'singular' },
      es: { base: 'complemento circunstancial de función', plural: 'complementos circunstanciales de función', gender: 'masc', count: 'singular' },
      ja: { base: '役割の副詞語句', count: 'singular', reading: 'やくわりのふくしごく' },
      pt: { base: 'adjunto adverbial de papel', plural: 'adjuntos adverbiais de papel', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The part of speech of HEY (P09-E30): a word outside the clause that opens it, "**hey**, the cat
    // runs". It names the period's interjection box, its palette heading and its border toggle
    // (P09-E47), composed like the part-of-speech nouns below — "a word that expresses feelings".
    id: 'INTERJECTION',
    role: 'noun',
    description: 'a word said on its own to express a feeling or to call someone (grammar)',
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( EXPRESS ) /obj ( FEELING /pl /zero )
    `,
    emoji: '❗',
    isA: 'WORD',
    forms: {
      en: { base: 'interjection', plural: 'interjections', count: 'singular' },
      it: { base: 'interiezione', plural: 'interiezioni', gender: 'fem', count: 'singular' },
      fr: { base: 'interjection', plural: 'interjections', gender: 'fem', count: 'singular' },
      de: { base: 'Interjektion', plural: 'Interjektionen', gender: 'fem', count: 'singular' },
      es: { base: 'interjección', plural: 'interjecciones', gender: 'fem', count: 'singular' },
      ja: { base: '感動詞', count: 'singular', reading: 'かんどうし' },
      pt: { base: 'interjeição', plural: 'interjeições', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The recipient or goal of the action ("gives the book to the cat"). Italian names it after the
    // goal ("complemento di termine"). The other traditions call it an object: the indirect one
    // (es, pt, ja 間接目的語), the second one (fr) or the dative one (de).
    id: 'TERMINUS',
    role: 'noun',
    description: 'the complement naming the recipient or goal of an action (grammar)',
    definition: `
      /subj ( COMPLEMENT_GRAMMAR /a /rel #2.subj )
      /subj ( COMPLEMENT_GRAMMAR ) /verb ( INDICATE ) /obj ( RECIPIENT /pl /zero )
    `,
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
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( NAME ) /obj ( OBJECT_THING /pl /zero )
    `,
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
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( REPLACE ) /obj ( NOUN /pl /zero )
    `,
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
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( EXPRESS ) /obj ( ACTION /pl /zero )
    `,
    emoji: '⚡',
    isA: 'WORD',
    forms: {
      en: { base: 'verb', plural: 'verbs', count: 'singular' },
      it: { base: 'verbo', plural: 'verbi', gender: 'masc', count: 'singular' },
      fr: { base: 'verbe', plural: 'verbes', gender: 'masc', count: 'singular' },
      de: { base: 'Verb', plural: 'Verben', gender: 'neut', count: 'singular', genitive: 'Verbs' },
      es: { base: 'verbo', plural: 'verbos', gender: 'masc', count: 'singular' },
      ja: { base: '動詞', count: 'singular', reading: 'どうし' },
      pt: { base: 'verbo', plural: 'verbos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ADVERB',
    role: 'noun',
    description: 'a word modifying a verb, an adjective or another adverb (grammar)',
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( MODIFY ) /obj ( VERB /pl /zero )
    `,
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
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( DESCRIBE ) /obj ( NOUN /pl /zero )
    `,
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
    definition: `
      /subj ( PHRASE /a /rel #2.subj )
      /subj ( PHRASE ) /verb ( NAME ) /obj ( ACTION /pl /zero )
    `,
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
    // "a phrase that indicates actions" (localization A18). INDICATE, the grammatical verb in de
    // (bezeichnet) and ja (示す), as B31 found; VERB's own gloss takes EXPRESS (de vermittelt).
    definition: `
      /subj ( PHRASE /a /rel #2.subj )
      /subj ( PHRASE ) /verb ( INDICATE ) /obj ( ACTION /pl /zero )
    `,
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
  {
    // A noun with everything hanging off it: its determiner, adjectives, possessor and relative
    // clause. The phrase console's square brackets hold one hanging off a noun, "/poss [ child /adj
    // old ]" (localization C22). Named as VERB_PHRASE is: "sintagma" / "syntagme" in the Romance
    // traditions, compounded on the noun in German and Japanese.
    id: 'NOUN_PHRASE',
    role: 'noun',
    description: 'a noun together with its determiner and modifiers (grammar)',
    definition: `
      /subj ( PHRASE /a /rel #2.subj )
      /subj ( PHRASE ) /verb ( HAVE ) /obj ( NOUN /pl /zero )
    `,
    emoji: '🧩',
    isA: 'PHRASE',
    forms: {
      en: { base: 'noun phrase', plural: 'noun phrases', count: 'singular' },
      it: { base: 'sintagma nominale', plural: 'sintagmi nominali', gender: 'masc', count: 'singular' },
      fr: { base: 'syntagme nominal', plural: 'syntagmes nominaux', gender: 'masc', count: 'singular' },
      de: { base: 'Nominalphrase', plural: 'Nominalphrasen', gender: 'fem', count: 'singular', compound: 'Nominalphrasen' },
      es: { base: 'sintagma nominal', plural: 'sintagmas nominales', gender: 'masc', count: 'singular' },
      ja: { base: '名詞句', count: 'singular', reading: 'めいしく' },
      pt: { base: 'sintagma nominal', plural: 'sintagmas nominais', gender: 'masc', count: 'singular' },
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
    // "a phrase that has a subject" (localization A18) — what a VERB_PHRASE does not. The object is
    // one subject, indefinite and singular, which the usual bare plural object cannot give. Japanese says
    // the inanimate HAVE with ある: 主語があるフレーズ (A150).
    definition: `
      /subj ( PHRASE /a /rel #2.subj )
      /subj ( PHRASE ) /verb ( HAVE ) /obj ( SUBJECT_GRAMMAR /a )
    `,
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
    definition: `
      /subj ( CLAUSE /a /rel #2.subj )
      /subj ( CLAUSE ) /verb ( DESCRIBE ) /obj ( NOUN /pl /zero )
    `,
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
    // A clause that asserts something: the plain mood the console's /statement returns to. Named as
    // each school grammar names that type of sentence beside the question and the command — it
    // "proposizione enunciativa", fr "phrase déclarative", de "Aussagesatz", es "oración
    // enunciativa", pt "frase declarativa", ja 平叙文.
    id: 'STATEMENT',
    role: 'noun',
    description: 'a clause that asserts something (grammar)',
    definition: `
      /subj ( CLAUSE /a /rel #2.subj )
      /subj ( CLAUSE ) /verb ( ASSERT ) /obj ( FACT /pl /zero )
    `,
    emoji: '💬',
    isA: 'CLAUSE',
    forms: {
      en: { base: 'statement', plural: 'statements', count: 'singular' },
      it: { base: 'proposizione enunciativa', plural: 'proposizioni enunciative', gender: 'fem', count: 'singular' },
      fr: { base: 'phrase déclarative', plural: 'phrases déclaratives', gender: 'fem', count: 'singular' },
      de: { base: 'Aussagesatz', plural: 'Aussagesätze', gender: 'masc', count: 'singular' },
      es: { base: 'oración enunciativa', plural: 'oraciones enunciativas', gender: 'fem', count: 'singular' },
      ja: { base: '平叙文', count: 'singular', reading: 'へいじょぶん' },
      pt: { base: 'frase declarativa', plural: 'frases declarativas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'CONDITION',
    role: 'noun',
    description: 'what must be true for something else to happen',
    definition: '/subj ( CLAUSE /adj CONDITIONAL /a )',
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
    definition: `
      /subj ( RELATIONSHIP /a /rel #2.subj )
      /subj ( RELATIONSHIP ) /verb ( LINK ) /obj ( CLAUSE /pl /zero )
    `,
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
    // "a phrase that is linked by a conjunction" (localization B38): the passive, not the active "a
    // phrase that a conjunction links". German Phrase and Konjunktion are both feminine, so in the
    // active "eine Phrase, die eine Konjunktion verbindet" neither the relative pronoun nor the article
    // shows which is the subject, and it reads first as the phrase linking the conjunction. The
    // passive says it once: "die von einer Konjunktion verbunden wird", ja 接続詞につながれるフレーズ.
    definition: `
      /subj ( PHRASE /a /rel #2.obj )
      /subj ( CONJUNCTION /a ) /verb ( LINK /passive ) /obj ( PHRASE )
    `,
    emoji: '🧷',
    isA: 'PHRASE',
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
    // "a word that links clauses" (localization B38). LINK, not COORDINATE: that one is people acting
    // together, and its Japanese 調整する is to adjust.
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( LINK ) /obj ( CLAUSE /pl /zero )
    `,
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
    // "a word that modifies other words" (localization A18). OTHER keeps it from reading as though a
    // word could modify itself, which "a word that modifies words" does.
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( MODIFY ) /obj ( WORD /adj OTHER /pl /zero )
    `,
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
    // Its own description, word for word (localization B50): the genitive relative, headed on the
    // possessor (C12). de "ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst".
    definition: `
      /subj ( WORD /a /rel #2.subj.poss )
      /subj ( MEANING /poss [ WORD ] ) /verb ( INCLUDE ) /obj ( MEANING /poss [ WORD /adj OTHER /a ] )
    `,
    emoji: '🌳',
    isA: 'WORD',
    forms: {
      en: { base: 'hypernym', plural: 'hypernyms', count: 'singular' },
      it: { base: 'iperonimo', plural: 'iperonimi', gender: 'masc', count: 'singular' },
      fr: { base: 'hyperonyme', plural: 'hyperonymes', gender: 'masc', count: 'singular', elides: '1' },
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
    // "A word that specifies nouns" (localization B51): de "ein Wort, das Substantive bestimmt", the
    // grammar's own verb (Bestimmungswort, bestimmter Artikel). INDICATE would say it stands for them.
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( SPECIFY ) /obj ( NOUN /pl /zero )
    `,
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
    definition: `
      /subj ( DETERMINER /a /rel #2.subj )
      /subj ( DETERMINER ) /verb ( INDICATE )
    `,
    emoji: '👆',
    isA: 'DETERMINER',
    forms: {
      en: { base: 'demonstrative', plural: 'demonstratives', count: 'singular' },
      it: { base: 'dimostrativo', plural: 'dimostrativi', gender: 'masc', count: 'singular' },
      fr: { base: 'démonstratif', plural: 'démonstratifs', gender: 'masc', count: 'singular' },
      de: { base: 'Demonstrativum', plural: 'Demonstrativa', gender: 'neut', count: 'singular', compound: 'Demonstrativ' },
      es: { base: 'demostrativo', plural: 'demostrativos', gender: 'masc', count: 'singular' },
      ja: { base: '指示詞', count: 'singular', reading: 'しじし' },
      pt: { base: 'demonstrativo', plural: 'demonstrativos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'QUANTIFIER',
    role: 'noun',
    description: 'the determiner of amount — some, many, few, all, no (grammar)',
    // "a determiner that indicates quantities" (localization B39). Plural on purpose: French gives a
    // bare mass object the partitive, "qui indique de la quantité" (A149); "des quantités" reads right.
    definition: `
      /subj ( DETERMINER /a /rel #2.subj )
      /subj ( DETERMINER ) /verb ( INDICATE ) /obj ( QUANTITY /pl /zero )
    `,
    emoji: '🔢',
    isA: 'DETERMINER',
    forms: {
      en: { base: 'quantifier', plural: 'quantifiers', count: 'singular' },
      it: { base: 'quantificatore', plural: 'quantificatori', gender: 'masc', count: 'singular' },
      fr: { base: 'quantifieur', plural: 'quantifieurs', gender: 'masc', count: 'singular' },
      de: { base: 'Quantor', plural: 'Quantoren', gender: 'masc', count: 'singular', compound: 'Quantoren' },
      es: { base: 'cuantificador', plural: 'cuantificadores', gender: 'masc', count: 'singular' },
      ja: { base: '数量詞', count: 'singular', reading: 'すうりょうし' },
      pt: { base: 'quantificador', plural: 'quantificadores', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PERIOD_SENTENCE',
    role: 'noun',
    description: 'a complete sentence built of one or more clauses (grammar)',
    definition: `
      /subj ( PHRASE /a /rel #2.subj )
      /subj ( PHRASE ) /verb ( HAVE ) /obj ( CLAUSE /pl /zero )
    `,
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
    // One of a pair of marks that open and close a group: the phrase console writes each word in
    // one, "( … )", a nested noun phrase in "[ … ]" and a period in "{ … }". German Klammer, Italian
    // parentesi and Japanese 括弧 name every shape. French, Spanish and Portuguese name the round
    // one, the shape the console uses for a word, and say it of the others in everyday speech.
    // Italian parentesi and Spanish paréntesis are invariable.
    id: 'BRACKET',
    role: 'noun',
    description: 'one of a pair of marks that enclose a group of words',
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( ENCLOSE ) /obj ( PHRASE /pl /zero )
    `,
    emoji: '🔣',
    forms: {
      en: { base: 'bracket', plural: 'brackets', count: 'singular' },
      it: { base: 'parentesi', plural: 'parentesi', gender: 'fem', count: 'singular' },
      fr: { base: 'parenthèse', plural: 'parenthèses', gender: 'fem', count: 'singular' },
      de: { base: 'Klammer', plural: 'Klammern', gender: 'fem', count: 'singular', compound: 'Klammer' },
      es: { base: 'paréntesis', plural: 'paréntesis', gender: 'masc', count: 'singular' },
      ja: { base: '括弧', count: 'singular', reading: 'かっこ' },
      pt: { base: 'parêntese', plural: 'parênteses', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'CONTAINER',
    role: 'noun',
    description: 'an object that holds or stores things',
    definition: `
      /subj ( OBJECT_THING /a /rel #2.subj )
      /subj ( OBJECT_THING ) /verb ( HOLD ) /obj ( OBJECT_THING /pl /zero )
    `,
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
    definition: `
      /subj ( PICTURE /a /rel #2.subj )
      /subj ( PICTURE ) /verb ( SHOW ) /obj ( PLACE /pl /zero )
    `,
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
    definition: `
      /subj ( PART /a /rel #2.obj )
      /subj ( one ) /verb ( CONNECT ) /obj ( PART )
    `,
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
    definition: `
      /subj ( CATEGORY /a /rel #2.subj )
      /subj ( CATEGORY ) /verb ( INDICATE ) /obj ( SPEAKER /pl /zero )
    `,
    emoji: '🗣️',
    synonym: 'grammar',
    forms: {
      en: { base: 'person', plural: 'persons', count: 'singular' },
      it: { base: 'persona', plural: 'persone', gender: 'fem', count: 'singular' },
      fr: { base: 'personne', plural: 'personnes', gender: 'fem', count: 'singular' },
      de: { base: 'Person', plural: 'Personen', gender: 'fem', count: 'singular', compound: 'Personal' },
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
      de: { base: 'Zahl', plural: 'Zahlen', gender: 'fem', count: 'singular', compound: 'Zahlen' },
      es: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
      ja: { base: '数', count: 'singular', reading: 'かず' },
      pt: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A number that marks one item among others, as a row's or a page's is — not NUMBER's value, which
    // counts or measures. Three languages have a word for each: fr numéro / nombre, de Nummer / Zahl,
    // ja 番号 / 数. What NUMBERED things have (localization C23).
    id: 'NUMBER_LABEL',
    role: 'noun',
    description: 'a number that marks one item among others',
    emoji: '#️⃣',
    forms: {
      en: { base: 'number', plural: 'numbers', count: 'singular' },
      it: { base: 'numero', plural: 'numeri', gender: 'masc', count: 'singular' },
      fr: { base: 'numéro', plural: 'numéros', gender: 'masc', count: 'singular' },
      de: { base: 'Nummer', plural: 'Nummern', gender: 'fem', count: 'singular' },
      es: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
      ja: { base: '番号', count: 'singular', reading: 'ばんごう' },
      pt: { base: 'número', plural: 'números', gender: 'masc', count: 'singular' },
    },
  },
  {
    // How much or how many: what grammatical number and a quantifier indicate (localization B39).
    // Italian "quantità" is invariable. Japanese 数量 covers both amount and count.
    id: 'QUANTITY',
    role: 'noun',
    description: 'how much or how many there is of something',
    emoji: '⚖️',
    forms: {
      en: { base: 'quantity', plural: 'quantities', count: 'singular' },
      it: { base: 'quantità', plural: 'quantità', gender: 'fem', count: 'singular' },
      fr: { base: 'quantité', plural: 'quantités', gender: 'fem', count: 'singular' },
      de: { base: 'Menge', plural: 'Mengen', gender: 'fem', count: 'singular' },
      es: { base: 'cantidad', plural: 'cantidades', gender: 'fem', count: 'singular' },
      ja: { base: '数量', count: 'singular', reading: 'すうりょう' },
      pt: { base: 'quantidade', plural: 'quantidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    // P09-E24's *percent* (rank 265; localization B82). Invariable everywhere: the plural is the
    // singular (five percent, cinque per cento, fünf Prozent, cinq pour cent). It is always counted,
    // and "one part in a hundred" needs 100, which the cardinals do not reach (C31), so it stays on
    // the literal by design (B82 reading 4). Japanese counts it as its own counter (五パーセント, as
    // 時間 is), never 五つのパーセント.
    id: 'PERCENT',
    role: 'noun',
    description: 'one part in a hundred',
    emoji: '💯',
    forms: {
      en: { base: 'percent', plural: 'percent', count: 'singular' },
      it: { base: 'per cento', plural: 'per cento', gender: 'masc', count: 'singular' },
      fr: { base: 'pour cent', plural: 'pour cent', gender: 'masc', count: 'singular' },
      de: { base: 'Prozent', plural: 'Prozent', gender: 'neut', count: 'singular' },
      es: { base: 'por ciento', plural: 'por ciento', gender: 'masc', count: 'singular' },
      ja: { base: 'パーセント', count: 'singular', counter: 'パーセント', counter_join: 'head' },
      pt: { base: 'por cento', plural: 'por cento', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A class of things that share a feature, and the genus of grammatical number (localization B39):
    // "a category that indicates quantities". Japanese 範疇, the linguist's word (文法範疇), not the
    // everyday カテゴリー. TENSE, ASPECT, VOICE, GENDER and PERSON_GRAMMAR could hang under it too;
    // only NUMBER_GRAMMAR does, because only its gloss names it.
    id: 'CATEGORY',
    role: 'noun',
    description: 'a class of things that share a feature',
    emoji: '🗂️',
    forms: {
      en: { base: 'category', plural: 'categories', count: 'singular' },
      it: { base: 'categoria', plural: 'categorie', gender: 'fem', count: 'singular' },
      fr: { base: 'catégorie', plural: 'catégories', gender: 'fem', count: 'singular' },
      de: { base: 'Kategorie', plural: 'Kategorien', gender: 'fem', count: 'singular' },
      es: { base: 'categoría', plural: 'categorías', gender: 'fem', count: 'singular' },
      ja: { base: '範疇', count: 'singular', reading: 'はんちゅう' },
      pt: { base: 'categoria', plural: 'categorias', gender: 'fem', count: 'singular' },
    },
  },
  {
    // P09-E24's *kind* (rank 256; localization B82): a sort, not the adjective (KINDNESS is the
    // quality). "A group of things that has the same features", SYSTEM's shape: the relative agrees
    // with GROUP in all seven. CATEGORY is the formal word (categoria, 範疇) and stays on its literal.
    // Italian and Spanish tipo is also GUY's word (B75); the gender and the context tell them apart.
    id: 'KIND_SORT',
    role: 'noun',
    description: 'a group of things that have something in common',
    definition: `
      /subj ( GROUP /a /poss [ THING /pl /zero ] /parts /rel #2.subj )
      /subj ( GROUP ) /verb ( HAVE ) /obj ( FEATURE /adj SAME /pl )
    `,
    emoji: '🔖',
    synonym: 'sort',
    forms: {
      en: { base: 'kind', plural: 'kinds', count: 'singular' },
      it: { base: 'tipo', plural: 'tipi', gender: 'masc', count: 'singular' },
      fr: { base: 'sorte', plural: 'sortes', gender: 'fem', count: 'singular' },
      de: { base: 'Art', plural: 'Arten', gender: 'fem', count: 'singular' },
      es: { base: 'tipo', plural: 'tipos', gender: 'masc', count: 'singular' },
      ja: { base: '種類', count: 'singular', reading: 'しゅるい' },
      pt: { base: 'tipo', plural: 'tipos', gender: 'masc', count: 'singular' },
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
    // "a category that indicates quantities" (localization B39), QUANTIFIER's differentia on the
    // CATEGORY genus: ja 数量を示す範疇, de "eine Kategorie, die Mengen bezeichnet".
    definition: `
      /subj ( CATEGORY /a /rel #2.subj )
      /subj ( CATEGORY ) /verb ( INDICATE ) /obj ( QUANTITY /pl /zero )
    `,
    emoji: '🔢',
    synonym: 'grammar',
    isA: 'CATEGORY',
    forms: {
      en: { base: 'number', plural: 'numbers', count: 'singular' },
      it: { base: 'numero', plural: 'numeri', gender: 'masc', count: 'singular' },
      fr: { base: 'nombre', plural: 'nombres', gender: 'masc', count: 'singular' },
      de: { base: 'Numerus', plural: 'Numeri', gender: 'masc', count: 'singular', genitive: 'Numerus' },
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
    definition: '/subj ( CATEGORY /adj SOLE /a )',
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
    definition: '/subj ( CATEGORY /adj MANIFOLD /a )',
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
    // Grammatical case, as against CASE_INSTANCE, the thing that happens: suffixed like NUMBER_GRAMMAR,
    // and for the same reason — Italian, French, Spanish and Portuguese say one word for both, German
    // does not (Kasus, not Fall, in a grammar) and Japanese has 格 only here. German Kasus is the
    // same word in every case and number, so its genitive is seeded bare (des Kasus). Glossed on
    // CATEGORY as NUMBER_GRAMMAR is: "a category that indicates participants".
    id: 'CASE_GRAMMAR',
    role: 'noun',
    description: 'the form of a noun that marks its role in the clause (grammar)',
    definition: `
      /subj ( CATEGORY /a /rel #2.subj )
      /subj ( CATEGORY ) /verb ( INDICATE ) /obj ( PARTICIPANT_GRAMMAR /pl /zero )
    `,
    emoji: '🗂️',
    synonym: 'grammar',
    isA: 'CATEGORY',
    forms: {
      en: { base: 'case', plural: 'cases', count: 'singular' },
      it: { base: 'caso', plural: 'casi', gender: 'masc', count: 'singular' },
      fr: { base: 'cas', plural: 'cas', gender: 'masc', count: 'singular' },
      de: { base: 'Kasus', plural: 'Kasus', gender: 'masc', count: 'singular', genitive: 'Kasus' },
      es: { base: 'caso', plural: 'casos', gender: 'masc', count: 'singular' },
      ja: { base: '格', count: 'singular', reading: 'かく' },
      pt: { base: 'caso', plural: 'casos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The case of the recipient, "Der Dativ ist dem Genitiv sein Tod". Glossed as TERMINUS is, on its
    // own genus: "a case that indicates recipients". Latin in every language; Japanese 与格.
    id: 'DATIVE',
    role: 'noun',
    description: 'the case marking the recipient of an action (grammar)',
    definition: `
      /subj ( CASE_GRAMMAR /a /rel #2.subj )
      /subj ( CASE_GRAMMAR ) /verb ( INDICATE ) /obj ( RECIPIENT /pl /zero )
    `,
    emoji: '📥',
    isA: 'CASE_GRAMMAR',
    forms: {
      en: { base: 'dative', plural: 'datives', count: 'singular' },
      it: { base: 'dativo', plural: 'dativi', gender: 'masc', count: 'singular' },
      fr: { base: 'datif', plural: 'datifs', gender: 'masc', count: 'singular' },
      de: { base: 'Dativ', plural: 'Dative', gender: 'masc', count: 'singular' },
      es: { base: 'dativo', plural: 'dativos', gender: 'masc', count: 'singular' },
      ja: { base: '与格', count: 'singular', reading: 'よかく' },
      pt: { base: 'dativo', plural: 'dativos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The case of the possessor: "a case that indicates possessors". Japanese grammars say 属格 (the
    // の case), and German's genitive -s is the regular one: des Genitivs.
    id: 'GENITIVE',
    role: 'noun',
    description: 'the case marking the possessor (grammar)',
    definition: `
      /subj ( CASE_GRAMMAR /a /rel #2.subj )
      /subj ( CASE_GRAMMAR ) /verb ( INDICATE ) /obj ( POSSESSOR /pl /zero )
    `,
    emoji: '🔗',
    isA: 'CASE_GRAMMAR',
    forms: {
      en: { base: 'genitive', plural: 'genitives', count: 'singular' },
      it: { base: 'genitivo', plural: 'genitivi', gender: 'masc', count: 'singular' },
      fr: { base: 'génitif', plural: 'génitifs', gender: 'masc', count: 'singular' },
      de: { base: 'Genitiv', plural: 'Genitive', gender: 'masc', count: 'singular' },
      es: { base: 'genitivo', plural: 'genitivos', gender: 'masc', count: 'singular' },
      ja: { base: '属格', count: 'singular', reading: 'ぞっかく' },
      pt: { base: 'genitivo', plural: 'genitivos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GENDER',
    role: 'noun',
    description: 'the class a noun belongs to — masculine, feminine, neuter (grammar)',
    definition: `
      /subj ( CATEGORY /a /rel #2.subj )
      /subj ( CATEGORY ) /verb ( GOVERN ) /obj ( WORD /pl /zero )
    `,
    emoji: '🚻',
    forms: {
      en: { base: 'gender', plural: 'genders', count: 'singular' },
      it: { base: 'genere', plural: 'generi', gender: 'masc', count: 'singular' },
      fr: { base: 'genre', plural: 'genres', gender: 'masc', count: 'singular' },
      de: { base: 'Geschlecht', plural: 'Geschlechter', gender: 'neut', count: 'singular', compound: 'Geschlechts' },
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
    definition: `
      /subj ( FEATURE /a /rel #2.subj )
      /subj ( FEATURE ) /verb ( INDICATE ) /obj ( TIME /pl /zero )
    `,
    emoji: '⏳',
    forms: {
      en: { base: 'tense', plural: 'tenses', count: 'singular' },
      it: { base: 'tempo', plural: 'tempi', gender: 'masc', count: 'singular' },
      fr: { base: 'temps', plural: 'temps', gender: 'masc', count: 'singular' },
      de: { base: 'Tempus', plural: 'Tempora', gender: 'neut', count: 'singular', genitive: 'Tempus' },
      es: { base: 'tiempo', plural: 'tiempos', gender: 'masc', count: 'singular' },
      ja: { base: '時制', count: 'singular', reading: 'じせい' },
      pt: { base: 'tempo', plural: 'tempos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'PRESENT_TENSE',
    role: 'noun',
    description: 'the tense of what is happening now (grammar)',
    definition: '/subj ( TENSE /adj PRESENT /a )',
    emoji: '⏺️',
    synonym: 'grammar',
    isA: 'TENSE',
    forms: {
      en: { base: 'present', plural: 'presents', count: 'singular' },
      it: { base: 'presente', plural: 'presenti', gender: 'masc', count: 'singular' },
      fr: { base: 'présent', plural: 'présents', gender: 'masc', count: 'singular' },
      de: { base: 'Präsens', plural: 'Präsentia', gender: 'neut', count: 'singular', genitive: 'Präsens' },
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
    definition: '/subj ( TENSE /adj PAST /a )',
    emoji: '⏮️',
    synonym: 'grammar',
    isA: 'TENSE',
    forms: {
      en: { base: 'past', plural: 'pasts', count: 'singular' },
      it: { base: 'passato', plural: 'passati', gender: 'masc', count: 'singular' },
      fr: { base: 'passé', plural: 'passés', gender: 'masc', count: 'singular' },
      de: { base: 'Präteritum', plural: 'Präterita', gender: 'neut', count: 'singular', compound: 'Präteritum' },
      es: { base: 'pasado', plural: 'pasados', gender: 'masc', count: 'singular' },
      ja: { base: '過去', count: 'singular', reading: 'かこ' },
      pt: { base: 'passado', plural: 'passados', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'FUTURE_TENSE',
    role: 'noun',
    description: 'the tense of what is yet to happen (grammar)',
    definition: '/subj ( TENSE /adj FUTURE /a )',
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
    definition: `
      /subj ( FEATURE /a /rel #2.subj )
      /subj ( FEATURE ) /verb ( INDICATE ) /obj ( PERIOD_TIME /pl /zero )
    `,
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
    // Grammatical voice, not the sound one speaks with: which participant of the event the clause
    // makes its subject. The Romance languages name it with the everyday word for the voice one
    // speaks with ("voce"/"voix"/"voz"), except Italian, whose grammars say "diatesi"; German and
    // Japanese use the technical term (Diathese, 態), as they do for the aspect. Feminine
    // everywhere it has a gender, which is what makes its values read "attiva / passiva".
    id: 'VOICE',
    role: 'noun',
    description: 'which participant of an event a clause makes its subject (grammar)',
    definition: `
      /subj ( FEATURE /a /rel #2.subj )
      /subj ( FEATURE ) /verb ( INDICATE ) /obj ( PARTICIPANT_GRAMMAR /pl /zero )
    `,
    emoji: '🔄',
    synonym: 'grammar',
    forms: {
      en: { base: 'voice', plural: 'voices', count: 'singular' },
      it: { base: 'diatesi', plural: 'diatesi', gender: 'fem', count: 'singular' },
      fr: { base: 'voix', plural: 'voix', gender: 'fem', count: 'singular' },
      de: { base: 'Diathese', plural: 'Diathesen', gender: 'fem', count: 'singular' },
      es: { base: 'voz', plural: 'voces', gender: 'fem', count: 'singular' },
      ja: { base: '態', count: 'singular', reading: 'たい' },
      pt: { base: 'voz', plural: 'vozes', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Whether a clause is affirmed or negated. Feminine in the Romance languages, which is what makes
    // its values read "positiva / negativa".
    id: 'POLARITY',
    role: 'noun',
    description: 'whether a clause is affirmed or negated (grammar)',
    definition: `
      /subj ( FEATURE /a /rel #2.subj )
      /subj ( FEATURE ) /verb ( NEGATE ) /obj ( CLAUSE /pl /zero )
    `,
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
    // The stance a cause is stated with — neutral, blamed or credited ("because of", "through the
    // fault of", "thanks to"): the `CauseSentiment` the console's /because /fault /thanks set
    // (localization B47). The other languages name it as the judgment it is, the word their
    // grammars use for a positive or negative evaluation: it valutazione, fr appréciation, de
    // Bewertung, es valoración, pt avaliação, ja 評価. Feminine wherever it has a gender, as
    // POLARITY is.
    id: 'SENTIMENT',
    role: 'noun',
    description: 'the positive, negative or neutral stance taken toward something',
    definition: `
      /subj ( FEATURE /a /rel #2.subj )
      /subj ( FEATURE ) /verb ( INDICATE ) /obj ( FEELING /pl /zero )
    `,
    emoji: '🙂',
    forms: {
      en: { base: 'sentiment', plural: 'sentiments', count: 'singular' },
      it: { base: 'valutazione', plural: 'valutazioni', gender: 'fem', count: 'singular' },
      fr: { base: 'appréciation', plural: 'appréciations', gender: 'fem', count: 'singular' },
      de: { base: 'Bewertung', plural: 'Bewertungen', gender: 'fem', count: 'singular' },
      es: { base: 'valoración', plural: 'valoraciones', gender: 'fem', count: 'singular' },
      ja: { base: '評価', count: 'singular', reading: 'ひょうか' },
      pt: { base: 'avaliação', plural: 'avaliações', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Grammatical mood: whether a clause states, commands or cites (the console's /statement,
    // /command and /inf), not a state of mind. German declines the Latin word (des Modus, die Modi);
    // Japanese says 叙法, which a heading cannot misread as the 法 of "law".
    id: 'MOOD',
    role: 'noun',
    description: 'the form of a verb that shows how a clause is meant (grammar)',
    // How a clause is meant is what the speaker says it for — asserting, commanding, citing — not a
    // condition, which is CONDITION's own gloss one row away (localization C27).
    definition: `
      /subj ( FEATURE /a /rel #2.subj )
      /subj ( FEATURE ) /verb ( INDICATE ) /obj ( PURPOSE /poss [ SPEAKER ] )
    `,
    emoji: '🎭',
    synonym: 'grammar',
    forms: {
      en: { base: 'mood', plural: 'moods', count: 'singular' },
      it: { base: 'modo', plural: 'modi', gender: 'masc', count: 'singular' },
      fr: { base: 'mode', plural: 'modes', gender: 'masc', count: 'singular' },
      de: { base: 'Modus', plural: 'Modi', gender: 'masc', count: 'singular', genitive: 'Modus' },
      es: { base: 'modo', plural: 'modos', gender: 'masc', count: 'singular' },
      ja: { base: '叙法', count: 'singular', reading: 'じょほう' },
      pt: { base: 'modo', plural: 'modos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The degree of comparison of an adjective (more beautiful, most beautiful), not a unit of heat
    // or a university title. German names it by the step of the comparison, Steigerungsstufe.
    id: 'DEGREE_GRAMMAR',
    role: 'noun',
    description: 'the level of comparison an adjective expresses (grammar)',
    definition: `
      /subj ( FEATURE /a /rel #2.subj )
      /subj ( FEATURE ) /verb ( INDICATE ) /obj ( LEVEL /pl /zero )
    `,
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
    // The plain form of an adjective, compared with nothing: "big" beside "bigger" and "biggest".
    // A grammar noun of its own, since POSITIVE is the polarity sense (ja 肯定). Portuguese grammar
    // calls it the "grau normal", German the Positiv, Japanese 原級.
    id: 'POSITIVE_DEGREE',
    role: 'noun',
    description: 'the plain form of an adjective, not compared (grammar)',
    definition: '/subj ( DEGREE_GRAMMAR /adj POSITIVE /a )',
    emoji: '▫️',
    synonym: 'grammar',
    isA: 'DEGREE_GRAMMAR',
    forms: {
      en: { base: 'positive degree', plural: 'positive degrees', count: 'singular' },
      it: { base: 'grado positivo', plural: 'gradi positivi', gender: 'masc', count: 'singular' },
      fr: { base: 'degré positif', plural: 'degrés positifs', gender: 'masc', count: 'singular' },
      de: { base: 'Positiv', plural: 'Positive', gender: 'masc', count: 'singular' },
      es: { base: 'grado positivo', plural: 'grados positivos', gender: 'masc', count: 'singular' },
      ja: { base: '原級', count: 'singular', reading: 'げんきゅう' },
      pt: { base: 'grau normal', plural: 'graus normais', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What a comparative or an equative is compared *to*: "the dog" of "bigger than the dog"
    // (NounPhrase.headStandard, P09-E5). It titles the standard's ring on the builder (P09-E12 D5).
    // Each tradition names it with a phrase of its own — it "termine di paragone", fr "terme de
    // comparaison", de "Vergleichsgröße", ja 比較の基準 — so it is one noun per language, not
    // composed. It is governed by the degree that licenses it: no degree, no standard.
    id: 'STANDARD_OF_COMPARISON',
    role: 'noun',
    description: 'what an adjective in the comparative or equative is compared to (grammar)',
    definition: `
      /subj ( PHRASE /a /rel #2.obj )
      /subj ( DEGREE_GRAMMAR /a ) /verb ( GOVERN ) /obj ( PHRASE )
    `,
    emoji: '⚖️',
    synonym: 'grammar',
    forms: {
      en: { base: 'standard of comparison', plural: 'standards of comparison', count: 'singular' },
      it: { base: 'termine di paragone', plural: 'termini di paragone', gender: 'masc', count: 'singular' },
      fr: { base: 'terme de comparaison', plural: 'termes de comparaison', gender: 'masc', count: 'singular' },
      de: { base: 'Vergleichsgröße', plural: 'Vergleichsgrößen', gender: 'fem', count: 'singular' },
      es: { base: 'término de comparación', plural: 'términos de comparación', gender: 'masc', count: 'singular' },
      ja: { base: '比較の基準', count: 'singular', reading: 'ひかくのきじゅん' },
      pt: { base: 'termo de comparação', plural: 'termos de comparação', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What a superlative picks its one out of: "the dogs" of "the biggest of the dogs" (the same
    // NounPhrase.headStandard, read as a set on `most` / `least`, P09-E19). It titles the standard's
    // ring and control on the builder while the degree is a superlative (P09-E51 D2): a set is not
    // a rival, and STANDARD_OF_COMPARISON's words name a rival (de Vergleichsgröße, ja 比較の基準).
    // Glossed as that one is, with the group in place of the phrase.
    id: 'COMPARISON_SET',
    role: 'noun',
    description: 'the group a superlative picks its one out of (grammar)',
    definition: `
      /subj ( GROUP /a /rel #2.obj )
      /subj ( DEGREE_GRAMMAR /a ) /verb ( GOVERN ) /obj ( GROUP )
    `,
    emoji: '🏆',
    synonym: 'grammar',
    forms: {
      en: { base: 'comparison set', plural: 'comparison sets', count: 'singular' },
      it: { base: 'insieme di confronto', plural: 'insiemi di confronto', gender: 'masc', count: 'singular' },
      fr: { base: 'ensemble de comparaison', plural: 'ensembles de comparaison', gender: 'masc', count: 'singular' },
      de: { base: 'Vergleichsmenge', plural: 'Vergleichsmengen', gender: 'fem', count: 'singular' },
      es: { base: 'conjunto de comparación', plural: 'conjuntos de comparación', gender: 'masc', count: 'singular' },
      ja: { base: '比較の範囲', count: 'singular', reading: 'ひかくのはんい' },
      pt: { base: 'conjunto de comparação', plural: 'conjuntos de comparação', gender: 'masc', count: 'singular' },
    },
  },
  {
    // A modal verb (must, can, will), named by its mood in every language (it "verbo modale",
    // fr "verbe modal", de "Modalverb", ja 法助動詞). Italian school grammar also says "verbo servile".
    id: 'MODAL',
    role: 'noun',
    description: 'a verb that expresses necessity, ability or will (grammar)',
    // "a verb that modifies verbs" (localization A18): what a modal does to the main verb, as a
    // grammar says it. The genus keeps it apart from ADVERB, "a word that modifies verbs".
    definition: `
      /subj ( VERB /a /rel #2.subj )
      /subj ( VERB ) /verb ( MODIFY ) /obj ( VERB /pl /zero )
    `,
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
      de: { base: 'Befehl', plural: 'Befehle', gender: 'masc', count: 'singular', compound: 'Befehls' },
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
      de: { base: 'Befehl', plural: 'Befehle', gender: 'masc', count: 'singular', compound: 'Befehls' },
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
    // What ORDER and INSTRUCTION are two of: how formal a way of speaking is, and to whom (localization
    // B44). The linguists' word in every language; Japanese 言語使用域, not the cash register レジスター.
    id: 'REGISTER',
    role: 'noun',
    description: 'the level of formality of a way of speaking',
    // A dimension named with no degree: FORMALITY as a noun modifier on LEVEL, "a formality level"
    // (it "un livello di formalità", de "eine Förmlichkeitsebene"). `/gloss dimension` says a degree,
    // and glosses adjectives (localization C27).
    definition: '/subj ( LEVEL /adj ( FORMALITY /material ) /a )',
    emoji: '🎩',
    synonym: 'linguistics',
    forms: {
      en: { base: 'register', plural: 'registers', count: 'singular' },
      it: { base: 'registro', plural: 'registri', gender: 'masc', count: 'singular' },
      fr: { base: 'registre', plural: 'registres', gender: 'masc', count: 'singular' },
      de: { base: 'Register', plural: 'Register', gender: 'neut', count: 'singular' },
      es: { base: 'registro', plural: 'registros', gender: 'masc', count: 'singular' },
      ja: { base: '言語使用域', count: 'singular', reading: 'げんごしよういき' },
      pt: { base: 'registro', plural: 'registros', gender: 'masc', count: 'singular' },
    },
  },
  {
    // How formal a way of speaking is: the dimension REGISTER is a level on (localization C27, as
    // B57 proposed). A mass noun and a quality dimension, like ATTENTION, so a later FORMAL could be
    // `/subj ( FORMALITY /adj HIGH /zero /gloss dimension )`. German Förmlichkeit, the native word (Formalität is also "a
    // formality", the paperwork); Japanese 丁寧さ, the politeness a Japanese register is graded by.
    id: 'FORMALITY',
    role: 'noun',
    description: 'how formal a way of speaking is',
    emoji: '👔',
    countable: false,
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'formality', count: 'singular' },
      it: { base: 'formalità', gender: 'fem', count: 'singular' },
      fr: { base: 'formalité', gender: 'fem', count: 'singular' },
      de: { base: 'Förmlichkeit', gender: 'fem', count: 'singular' },
      es: { base: 'formalidad', gender: 'fem', count: 'singular' },
      ja: { base: '丁寧さ', count: 'singular', reading: 'ていねいさ' },
      pt: { base: 'formalidade', gender: 'fem', count: 'singular' },
    },
  },
  {
    // One of the alternatives a choice is made between. Feminine in every gendered language.
    id: 'OPTION',
    role: 'noun',
    description: 'one of several possibilities to choose from',
    definition: `
      /subj ( CONCEPT /a /rel #2.obj )
      /subj ( one ) /verb ( CHOOSE ) /obj ( CONCEPT )
    `,
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
    definition: `
      /subj ( OBJECT_THING /a /rel #2.obj )
      /subj ( one ) /verb ( PRESS ) /obj ( OBJECT_THING )
    `,
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
    definition: `
      /subj ( OBJECT_THING /a /rel #2.subj )
      /subj ( OBJECT_THING ) /verb ( HAVE ) /obj ( KEY /pl /zero )
    `,
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
  {
    // One of the keys of a KEYBOARD, which the help overlay says the keys of the app work in
    // (localization C22). German Taste is BUTTON's word too, a homograph as ORDER and COMMAND share
    // Befehl: a German key and a German button are both pressed. Katakana キー, with no separate
    // reading (see BUTTON). Glossed "a part of a keyboard" (localization C26), not "a button of a
    // keyboard", which in German would define Taste with itself; KEYBOARD is "an object that has
    // keys", so the two define each other and neither itself.
    id: 'KEY',
    role: 'noun',
    description: 'one of the buttons of a keyboard',
    definition: '/subj ( PART /a /poss [ KEYBOARD /a ] /whole )',
    emoji: '🔑',
    synonym: 'keyboard',
    forms: {
      en: { base: 'key', plural: 'keys', count: 'singular' },
      it: { base: 'tasto', plural: 'tasti', gender: 'masc', count: 'singular' },
      fr: { base: 'touche', plural: 'touches', gender: 'fem', count: 'singular' },
      de: { base: 'Taste', plural: 'Tasten', gender: 'fem', count: 'singular', compound: 'Tasten' },
      es: { base: 'tecla', plural: 'teclas', gender: 'fem', count: 'singular' },
      ja: { base: 'キー', count: 'singular' },
      pt: { base: 'tecla', plural: 'teclas', gender: 'fem', count: 'singular' },
    },
  },

  // ── Finding one's way about a page ────────────────────────────────
  // What the keys and the help that lists them talk about (localization B41, B44): the keys that
  // move the cursor, the parts of a page it moves between, the lists it walks and the help itself.
  {
    // The key, not the projectile or the drawn sign: "use the arrows" is what the Romance UIs say
    // of the keys (it "usa le frecce", fr "les flèches"), where English, German and Japanese name
    // the key (Pfeiltaste, 矢印キー). Katakana キー, so the reading is the kanji's with it. Glossed
    // "a key that moves the cursor" (localization C26): the cursor is definite, the one the page
    // has, where the usual bare plural object would say "moves cursors".
    id: 'ARROW',
    role: 'noun',
    description: 'a key marked with an arrow, that moves the cursor',
    definition: `
      /subj ( KEY /a /rel #2.subj )
      /subj ( KEY ) /verb ( MOVE ) /obj ( CURSOR )
    `,
    emoji: '⬅️',
    synonym: 'key',
    forms: {
      en: { base: 'arrow key', plural: 'arrow keys', count: 'singular' },
      it: { base: 'freccia', plural: 'frecce', gender: 'fem', count: 'singular' },
      fr: { base: 'flèche', plural: 'flèches', gender: 'fem', count: 'singular' },
      de: { base: 'Pfeiltaste', plural: 'Pfeiltasten', gender: 'fem', count: 'singular', compound: 'Pfeiltasten' },
      es: { base: 'flecha', plural: 'flechas', gender: 'fem', count: 'singular' },
      ja: { base: '矢印キー', count: 'singular', reading: 'やじるしきー' },
      pt: { base: 'seta', plural: 'setas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A part of a page the keyboard walks between (F6): the canvas, the translations, the header.
    // The UI's word in each language — it "area" (not "regione", the land), fr "zone", de "Bereich".
    // Glossed "a part of a screen" (localization C26).
    id: 'REGION',
    role: 'noun',
    description: 'a part of a page or a screen',
    definition: '/subj ( PART /a /poss [ SCREEN /a ] /whole )',
    emoji: '🗺️',
    forms: {
      en: { base: 'region', plural: 'regions', count: 'singular' },
      it: { base: 'area', plural: 'aree', gender: 'fem', count: 'singular' },
      fr: { base: 'zone', plural: 'zones', gender: 'fem', count: 'singular' },
      de: { base: 'Bereich', plural: 'Bereiche', gender: 'masc', count: 'singular', compound: 'Bereichs' },
      es: { base: 'zona', plural: 'zonas', gender: 'fem', count: 'singular' },
      ja: { base: '領域', count: 'singular', reading: 'りょういき' },
      pt: { base: 'área', plural: 'áreas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Things that belong together: the dotted ring of boxes one word heads on the canvas.
    id: 'GROUP',
    role: 'noun',
    description: 'a set of things that belong together',
    definition: `
      /subj ( CONCEPT /a /rel #2.obj )
      /subj ( one ) /verb ( CONNECT ) /obj ( CONCEPT )
    `,
    emoji: '🫂',
    forms: {
      en: { base: 'group', plural: 'groups', count: 'singular' },
      it: { base: 'gruppo', plural: 'gruppi', gender: 'masc', count: 'singular' },
      fr: { base: 'groupe', plural: 'groupes', gender: 'masc', count: 'singular' },
      de: { base: 'Gruppe', plural: 'Gruppen', gender: 'fem', count: 'singular', compound: 'Gruppen' },
      es: { base: 'grupo', plural: 'grupos', gender: 'masc', count: 'singular' },
      ja: { base: 'グループ', count: 'singular' },
      pt: { base: 'grupo', plural: 'grupos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P09-E24's member (localization B75), the word P08 asked for beside GROUP: "a part of a group",
    // the part-whole gloss on the genus every collective hangs under. Not `human`, since a state can be a
    // member of a union too.
    id: 'MEMBER',
    role: 'noun',
    description: 'one of the persons or things a group is made of',
    definition: '/subj ( PART /a /poss [ GROUP /a ] /whole )',
    emoji: '🧩',
    forms: {
      en: { base: 'member', plural: 'members', count: 'singular' },
      it: { base: 'membro', plural: 'membri', gender: 'masc', count: 'singular' },
      fr: { base: 'membre', plural: 'membres', gender: 'masc', count: 'singular' },
      de: { base: 'Mitglied', plural: 'Mitglieder', gender: 'neut', count: 'singular', compound: 'Mitglieder' },
      es: { base: 'miembro', plural: 'miembros', gender: 'masc', count: 'singular' },
      ja: { base: '一員', count: 'singular', reading: 'いちいん' },
      pt: { base: 'membro', plural: 'membros', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P09-E24's *party* (rank 327; localization B82), the celebration — the political party is B76's
    // PARTY_POLITICAL. German Fest, not the loan Party (plural Partys). Glossed as the gathering, "a
    // group of happy people": the event ("a time when people celebrate") needs CELEBRATE.
    id: 'PARTY_CELEBRATION',
    role: 'noun',
    description: 'a social gathering to celebrate or have fun',
    definition: '/subj ( GROUP /a /poss [ PERSON /adj HAPPY /pl /zero ] /parts )',
    emoji: '🎉',
    synonym: 'celebration',
    forms: {
      en: { base: 'party', plural: 'parties', count: 'singular' },
      it: { base: 'festa', plural: 'feste', gender: 'fem', count: 'singular' },
      fr: { base: 'fête', plural: 'fêtes', gender: 'fem', count: 'singular' },
      de: { base: 'Fest', plural: 'Feste', gender: 'neut', count: 'singular' },
      es: { base: 'fiesta', plural: 'fiestas', gender: 'fem', count: 'singular' },
      ja: { base: 'パーティー', count: 'singular' },
      pt: { base: 'festa', plural: 'festas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A line of items across a list or a grid: a menu's entries, the pronoun grid's persons. The
    // same words a line of text takes in it, fr, de, pt and ja; Spanish says "fila" of a table's row.
    // Glossed "a part of a list" (localization C26) — not "a line of a list", since LINE is riga,
    // ligne, Zeile, linha and 行 too, and would define ROW with itself in five languages.
    id: 'ROW',
    role: 'noun',
    description: 'a line of items across a list or a grid',
    definition: '/subj ( PART /a /poss [ LIST /a ] /whole )',
    emoji: '🟰',
    forms: {
      en: { base: 'row', plural: 'rows', count: 'singular' },
      it: { base: 'riga', plural: 'righe', gender: 'fem', count: 'singular' },
      fr: { base: 'ligne', plural: 'lignes', gender: 'fem', count: 'singular' },
      de: { base: 'Zeile', plural: 'Zeilen', gender: 'fem', count: 'singular', compound: 'Zeilen' },
      es: { base: 'fila', plural: 'filas', gender: 'fem', count: 'singular' },
      ja: { base: '行', count: 'singular', reading: 'ぎょう' },
      pt: { base: 'linha', plural: 'linhas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A list of commands to choose from. Italian "menu" is invariable (i menu); German das Menü.
    id: 'MENU',
    role: 'noun',
    description: 'a list of commands to choose from',
    definition: `
      /subj ( LIST /a /rel #2.obj )
      /subj ( one ) /verb ( CHOOSE ) /obj ( LIST )
    `,
    emoji: '🍔',
    forms: {
      en: { base: 'menu', plural: 'menus', count: 'singular' },
      it: { base: 'menu', plural: 'menu', gender: 'masc', count: 'singular' },
      fr: { base: 'menu', plural: 'menus', gender: 'masc', count: 'singular' },
      de: { base: 'Menü', plural: 'Menüs', gender: 'neut', count: 'singular', compound: 'Menü' },
      es: { base: 'menú', plural: 'menús', gender: 'masc', count: 'singular' },
      ja: { base: 'メニュー', count: 'singular' },
      pt: { base: 'menu', plural: 'menus', gender: 'masc', count: 'singular' },
    },
  },
  {
    // One of the labels along the top of a panel that each show a page of it: the word picker's
    // Noun | Pronoun switch (localization C22). Each UI's word — it "scheda", fr "onglet", es
    // "pestaña", pt "aba"; German keeps the loanword, der Tab, which its UIs write beside
    // Registerkarte. Glossed "a button that shows a region" (localization C26): what a tab shows is
    // a part of the screen, which REGION's own gloss says, and it is shown by pressing the tab.
    id: 'TAB',
    role: 'noun',
    description: 'a label at the top of a panel that shows one of its pages',
    definition: `
      /subj ( BUTTON /a /rel #2.subj )
      /subj ( BUTTON ) /verb ( SHOW ) /obj ( REGION /a )
    `,
    emoji: '🗂️',
    forms: {
      en: { base: 'tab', plural: 'tabs', count: 'singular' },
      it: { base: 'scheda', plural: 'schede', gender: 'fem', count: 'singular' },
      fr: { base: 'onglet', plural: 'onglets', gender: 'masc', count: 'singular' },
      de: { base: 'Tab', plural: 'Tabs', gender: 'masc', count: 'singular', compound: 'Tab' },
      es: { base: 'pestaña', plural: 'pestañas', gender: 'fem', count: 'singular' },
      ja: { base: 'タブ', count: 'singular' },
      pt: { base: 'aba', plural: 'abas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // What a link points at: the period a pick chooses. French and Portuguese have a word of their
    // own for a link's target (cible, alvo) and Japanese says 対象; Italian, German and Spanish use
    // the one their DESTINATION takes (destinazione, Ziel, destino), as their UIs do.
    id: 'TARGET',
    role: 'noun',
    description: 'the thing a link points to',
    definition: `
      /subj ( OBJECT_THING /a /rel #2.obj )
      /subj ( one ) /verb ( INDICATE ) /obj ( OBJECT_THING )
    `,
    emoji: '🎯',
    forms: {
      en: { base: 'target', plural: 'targets', count: 'singular' },
      it: { base: 'destinazione', plural: 'destinazioni', gender: 'fem', count: 'singular' },
      fr: { base: 'cible', plural: 'cibles', gender: 'fem', count: 'singular' },
      de: { base: 'Ziel', plural: 'Ziele', gender: 'neut', count: 'singular', compound: 'Ziel' },
      es: { base: 'destino', plural: 'destinos', gender: 'masc', count: 'singular' },
      ja: { base: '対象', count: 'singular', reading: 'たいしょう' },
      pt: { base: 'alvo', plural: 'alvos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The information that shows how to use a program — the mass noun, not an act of helping.
    id: 'HELP',
    role: 'noun',
    description: 'information that shows how to use something',
    definition: `
      /subj ( CONTENT /zero /rel #2.obj )
      /subj ( one ) /verb ( SHOW ) /obj ( CONTENT )
    `,
    emoji: '🛟',
    countable: false,
    forms: {
      en: { base: 'help', count: 'singular' },
      it: { base: 'aiuto', gender: 'masc', count: 'singular' },
      fr: { base: 'aide', gender: 'fem', count: 'singular' },
      de: { base: 'Hilfe', gender: 'fem', count: 'singular', compound: 'Hilfe' },
      es: { base: 'ayuda', gender: 'fem', count: 'singular' },
      ja: { base: 'ヘルプ', count: 'singular' },
      pt: { base: 'ajuda', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Moving from place to place in an interface: "keyboard navigation", the help's first section.
    // Glossed "an action that moves the cursor" (localization C26), the genus IMPORT_NOUN takes: it
    // needs no noun made from a verb, since what moves from place to place is the cursor, "a picture
    // that indicates places". ARROW says the same of the key that does it.
    id: 'NAVIGATION',
    role: 'noun',
    description: 'moving from place to place in an interface',
    definition: `
      /subj ( ACTION /a /rel #2.subj )
      /subj ( ACTION ) /verb ( MOVE ) /obj ( CURSOR )
    `,
    emoji: '🧭',
    countable: false,
    forms: {
      en: { base: 'navigation', count: 'singular' },
      it: { base: 'navigazione', gender: 'fem', count: 'singular' },
      fr: { base: 'navigation', gender: 'fem', count: 'singular' },
      de: { base: 'Navigation', gender: 'fem', count: 'singular', compound: 'Navigations' },
      es: { base: 'navegación', gender: 'fem', count: 'singular' },
      ja: { base: 'ナビゲーション', count: 'singular' },
      pt: { base: 'navegação', gender: 'fem', count: 'singular' },
    },
  },

  // ── A program's own things ────────────────────────────────────────
  // What the app's dialogs, lists and messages talk about (B25–B27): the name a saved phrase is
  // stored under, the file it is exported to, the icon one presses, the clipboard a translation is
  // copied to. The katakana ones carry no reading (see BUTTON).
  {
    // The noun; NAME is the verb a noun does to things (B06). German Name is a weak noun (den Namen)
    // with the genitive -ns of the few weak nouns that keep an -s (des Namens).
    id: 'NAME_NOUN',
    role: 'noun',
    description: 'the word or words something is called by',
    emoji: '🏷️',
    isA: 'WORD',
    forms: {
      en: { base: 'name', plural: 'names', count: 'singular' },
      it: { base: 'nome', plural: 'nomi', gender: 'masc', count: 'singular' },
      fr: { base: 'nom', plural: 'noms', gender: 'masc', count: 'singular' },
      de: { base: 'Name', plural: 'Namen', gender: 'masc', count: 'singular', weak: '1', genitive: 'Namens', compound: 'Namens' },
      es: { base: 'nombre', plural: 'nombres', gender: 'masc', count: 'singular' },
      ja: { base: '名前', count: 'singular', reading: 'なまえ' },
      pt: { base: 'nome', plural: 'nomes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Another name a thing answers to: `/plural` for `/pl`. The loan in every language but Japanese,
    // which says 別名, "another name"; invariable in Italian, French, Spanish and Portuguese.
    id: 'ALIAS',
    role: 'noun',
    description: 'another name a thing is also called by',
    definition: '/subj ( NAME_NOUN /adj OTHER /a )',
    emoji: '🪪',
    isA: 'NAME_NOUN',
    forms: {
      en: { base: 'alias', plural: 'aliases', count: 'singular' },
      it: { base: 'alias', plural: 'alias', gender: 'masc', count: 'singular' },
      fr: { base: 'alias', plural: 'alias', gender: 'masc', count: 'singular' },
      de: { base: 'Alias', plural: 'Aliasse', gender: 'masc', count: 'singular', genitive: 'Alias' },
      es: { base: 'alias', plural: 'alias', gender: 'masc', count: 'singular' },
      ja: { base: '別名', count: 'singular', reading: 'べつめい' },
      pt: { base: 'alias', plural: 'aliases', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The name a work or a document goes by: what UNTITLED has none of (localization C23). Japanese
    // タイトル, the word an interface says ("タイトルなし"); 題名 is a book's or a film's.
    id: 'TITLE',
    role: 'noun',
    description: 'the name a work or a document is known by',
    emoji: '📰',
    isA: 'NAME_NOUN',
    forms: {
      en: { base: 'title', plural: 'titles', count: 'singular' },
      it: { base: 'titolo', plural: 'titoli', gender: 'masc', count: 'singular' },
      fr: { base: 'titre', plural: 'titres', gender: 'masc', count: 'singular' },
      de: { base: 'Titel', plural: 'Titel', gender: 'masc', count: 'singular' },
      es: { base: 'título', plural: 'títulos', gender: 'masc', count: 'singular' },
      ja: { base: 'タイトル', count: 'singular' },
      pt: { base: 'título', plural: 'títulos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The process, a noun in every language: it caricamento, fr chargement, de das Laden (the
    // nominalized infinitive), ja 読み込み, the verbal noun of LOAD. Uncountable.
    id: 'LOADING',
    role: 'noun',
    description: 'the process of bringing data into a program',
    definition: `
      /subj ( PROCESS /a /rel #2.subj )
      /subj ( PROCESS ) /verb ( LOAD ) /obj ( CONTENT /zero )
    `,
    emoji: '⏳',
    countable: false,
    isA: 'PROCESS',
    forms: {
      en: { base: 'loading', count: 'singular' },
      it: { base: 'caricamento', gender: 'masc', count: 'singular' },
      fr: { base: 'chargement', gender: 'masc', count: 'singular' },
      de: { base: 'Laden', gender: 'neut', count: 'singular', compound: 'Lade' },
      es: { base: 'carga', gender: 'fem', count: 'singular' },
      ja: { base: '読み込み', count: 'singular', reading: 'よみこみ' },
      pt: { base: 'carregamento', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The part of a program a person sees and works, not a surface or a socket between machines.
    // German takes the loanword das Interface: Oberfläche and Schnittstelle both compound with a
    // linking -n- ("Oberflächensprache"), which the compound builder did not add when this was
    // chosen. It does since B10 was fixed, so the choice is open to revisit.
    id: 'INTERFACE',
    role: 'noun',
    description: 'the part of a program a person sees and uses',
    definition: `
      /subj ( SCREEN /a /rel #2.obj )
      /subj ( one ) /verb ( SEE ) /obj ( SCREEN )
    `,
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
    definition: `
      /subj ( PROCESS /a /rel #2.subj )
      /subj ( PROCESS ) /verb ( ANSWER )
    `,
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
    definition: `
      /subj ( CONCEPT /a /rel #2.obj )
      /subj ( one ) /verb ( SEARCH ) /obj ( CONCEPT )
    `,
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
    definition: `
      /subj ( ACTION /a /rel #2.subj )
      /subj ( ACTION ) /verb ( IMPORT ) /obj ( FILE /pl /zero )
    `,
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
    definition: '/subj ( PICTURE /adj SMALL /a )',
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
    definition: `
      /subj ( OBJECT_THING /a /rel #2.obj )
      /subj ( one ) /verb ( SAVE ) /obj ( OBJECT_THING )
    `,
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
    definition: `
      /subj ( PLACE /a /rel #2.loc )
      /subj ( one ) /verb ( COPY ) /loc ( PLACE )
    `,
    emoji: '📋',
    forms: {
      en: { base: 'clipboard', plural: 'clipboards', count: 'singular' },
      it: { base: 'appunti', plural: 'appunti', gender: 'masc', count: 'singular' },
      fr: { base: 'presse-papiers', plural: 'presse-papiers', gender: 'masc', count: 'singular' },
      de: { base: 'Zwischenablage', plural: 'Zwischenablagen', gender: 'fem', count: 'singular', compound: 'Zwischenablage' },
      es: { base: 'portapapeles', plural: 'portapapeles', gender: 'masc', count: 'singular' },
      ja: { base: 'クリップボード', count: 'singular' },
      pt: { base: 'área de transferência', plural: 'áreas de transferência', gender: 'fem', count: 'singular' },
    },
  },
  // ── The phrase console's own nouns (localization B45, B46) ─────────
  {
    // A row of text typed as one command: what the console runs, recalls and pins. Not a drawn line
    // (it "linea", de "Linie") but the line of text, as an editor counts them: it "riga", de "Zeile",
    // ja 行 (ぎょう). ROW, a row of a list, shares the German and the Japanese; they are two concepts.
    id: 'LINE',
    role: 'noun',
    description: 'a row of text typed as one command',
    definition: `
      /subj ( TEXT /zero /rel #2.obj )
      /subj ( one ) /verb ( TYPE ) /obj ( TEXT )
    `,
    emoji: '⌨️',
    forms: {
      en: { base: 'line', plural: 'lines', count: 'singular' },
      it: { base: 'riga', plural: 'righe', gender: 'fem', count: 'singular' },
      fr: { base: 'ligne', plural: 'lignes', gender: 'fem', count: 'singular' },
      de: { base: 'Zeile', plural: 'Zeilen', gender: 'fem', count: 'singular', compound: 'Zeilen' },
      es: { base: 'línea', plural: 'líneas', gender: 'fem', count: 'singular' },
      ja: { base: '行', count: 'singular', reading: 'ぎょう' },
      pt: { base: 'linha', plural: 'linhas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The lines typed before, in order: a program's history, not the past of a country. Uncountable,
    // like LOADING. Each language's interface word: it "cronologia", fr "historique" (m), de
    // "Verlauf", es "historial", pt "histórico", ja 履歴.
    id: 'HISTORY',
    role: 'noun',
    description: 'the lines typed before, in order',
    definition: `
      /subj ( LIST /a /rel #2.obj )
      /subj ( one ) /verb ( WRITE ) /obj ( LIST )
    `,
    emoji: '🕘',
    countable: false,
    forms: {
      en: { base: 'history', count: 'singular' },
      it: { base: 'cronologia', gender: 'fem', count: 'singular' },
      fr: { base: 'historique', gender: 'masc', count: 'singular', elides: '1' },
      de: { base: 'Verlauf', gender: 'masc', count: 'singular', compound: 'Verlaufs' },
      es: { base: 'historial', gender: 'masc', count: 'singular' },
      ja: { base: '履歴', count: 'singular', reading: 'りれき' },
      pt: { base: 'histórico', gender: 'masc', count: 'singular' },
    },
  },
  {
    // All the periods being built at once, which the console saves, exports and imports as one. The
    // canvas (CANVAS) is the surface one period is drawn on; this is everything on it together.
    // Glossed "a group of canvases" (localization C26): the part-whole relation read from the whole,
    // the canvases as the `parts` the group is made up of. CANVAS, "a place where one makes phrases",
    // was the gloss this one would otherwise have restated.
    id: 'WORKSPACE',
    role: 'noun',
    description: 'all the periods being built at once',
    definition: '/subj ( GROUP /a /poss [ CANVAS /pl /zero ] /parts )',
    emoji: '🗂️',
    forms: {
      en: { base: 'workspace', plural: 'workspaces', count: 'singular' },
      it: { base: 'area di lavoro', plural: 'aree di lavoro', gender: 'fem', count: 'singular' },
      fr: { base: 'espace de travail', plural: 'espaces de travail', gender: 'masc', count: 'singular' },
      de: { base: 'Arbeitsbereich', plural: 'Arbeitsbereiche', gender: 'masc', count: 'singular', compound: 'Arbeitsbereichs' },
      es: { base: 'espacio de trabajo', plural: 'espacios de trabajo', gender: 'masc', count: 'singular' },
      ja: { base: 'ワークスペース', count: 'singular' },
      pt: { base: 'espaço de trabalho', plural: 'espaços de trabalho', gender: 'masc', count: 'singular' },
    },
  },
  {
    // How a thing is written or used: the heading of a command's usage line, as a program's help says
    // it — it/es/pt "uso", fr "utilisation", de "Verwendung", ja 使用法. Uncountable.
    id: 'USAGE',
    role: 'noun',
    description: 'how a thing is written or used',
    definition: `
      /subj ( WAY /a /rel #2.obj )
      /subj ( one ) /verb ( USE ) /obj ( WAY )
    `,
    emoji: '📖',
    countable: false,
    forms: {
      en: { base: 'usage', count: 'singular' },
      it: { base: 'uso', gender: 'masc', count: 'singular' },
      fr: { base: 'utilisation', gender: 'fem', count: 'singular' },
      de: { base: 'Verwendung', gender: 'fem', count: 'singular', compound: 'Verwendungs' },
      es: { base: 'uso', gender: 'masc', count: 'singular' },
      ja: { base: '使用法', count: 'singular', reading: 'しようほう' },
      pt: { base: 'uso', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'EXAMPLE',
    role: 'noun',
    description: 'a case that shows how something is used',
    definition: `
      /subj ( PHRASE /a /rel #2.obj )
      /subj ( one ) /verb ( SHOW ) /obj ( PHRASE )
    `,
    emoji: '💡',
    forms: {
      en: { base: 'example', plural: 'examples', count: 'singular' },
      it: { base: 'esempio', plural: 'esempi', gender: 'masc', count: 'singular' },
      fr: { base: 'exemple', plural: 'exemples', gender: 'masc', count: 'singular' },
      de: { base: 'Beispiel', plural: 'Beispiele', gender: 'neut', count: 'singular', compound: 'Beispiel' },
      es: { base: 'ejemplo', plural: 'ejemplos', gender: 'masc', count: 'singular' },
      ja: { base: '例', count: 'singular', reading: 'れい' },
      pt: { base: 'exemplo', plural: 'exemplos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The text field commands are typed into — the phrase console (B42), not the cabinet or the games
    // machine. Italian borrows "console", feminine and invariable; Portuguese is Brazilian like the
    // other entries (o console, pt-PT a consola).
    id: 'CONSOLE',
    role: 'noun',
    description: 'a text field where a user types commands',
    definition: `
      /subj ( PLACE /a /rel #2.loc )
      /subj ( one ) /verb ( TYPE ) /loc ( PLACE )
    `,
    emoji: '💻',
    forms: {
      en: { base: 'console', plural: 'consoles', count: 'singular' },
      it: { base: 'console', plural: 'console', gender: 'fem', count: 'singular' },
      fr: { base: 'console', plural: 'consoles', gender: 'fem', count: 'singular' },
      de: { base: 'Konsole', plural: 'Konsolen', gender: 'fem', count: 'singular', compound: 'Konsolen' },
      es: { base: 'consola', plural: 'consolas', gender: 'fem', count: 'singular' },
      ja: { base: 'コンソール', count: 'singular' },
      pt: { base: 'console', plural: 'consoles', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The surface a phrase is built on (B43), in the painter's word design programs borrow for it: es
    // lienzo, pt tela, fr canevas, ja キャンバス, de Arbeitsfläche (Photoshop's). Italian takes "tela" too:
    // "area di lavoro" is the WORKSPACE, the whole of what is open, and the canvas is one part of it.
    id: 'CANVAS',
    role: 'noun',
    description: 'the surface a phrase is built on',
    definition: `
      /subj ( PLACE /a /rel #2.loc )
      /subj ( one ) /verb ( MAKE ) /obj ( PHRASE /pl /zero ) /loc ( PLACE )
    `,
    emoji: '🎨',
    forms: {
      en: { base: 'canvas', plural: 'canvases', count: 'singular' },
      it: { base: 'tela', plural: 'tele', gender: 'fem', count: 'singular' },
      fr: { base: 'canevas', plural: 'canevas', gender: 'masc', count: 'singular' },
      de: { base: 'Arbeitsfläche', plural: 'Arbeitsflächen', gender: 'fem', count: 'singular', compound: 'Arbeitsflächen' },
      es: { base: 'lienzo', plural: 'lienzos', gender: 'masc', count: 'singular' },
      ja: { base: 'キャンバス', count: 'singular' },
      pt: { base: 'tela', plural: 'telas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A result shown before it is made: the translations of a line not yet applied (B43). Spanish says
    // "vista previa", Portuguese "pré-visualização", as their software does.
    id: 'PREVIEW',
    role: 'noun',
    description: 'a view of a result before it is made',
    definition: `
      /subj ( CONTENT /zero /rel #2.obj )
      /subj ( one ) /verb ( SEE ) /obj ( CONTENT )
    `,
    emoji: '👀',
    forms: {
      en: { base: 'preview', plural: 'previews', count: 'singular' },
      it: { base: 'anteprima', plural: 'anteprime', gender: 'fem', count: 'singular' },
      fr: { base: 'aperçu', plural: 'aperçus', gender: 'masc', count: 'singular' },
      de: { base: 'Vorschau', plural: 'Vorschauen', gender: 'fem', count: 'singular', compound: 'Vorschau' },
      es: { base: 'vista previa', plural: 'vistas previas', gender: 'fem', count: 'singular' },
      ja: { base: 'プレビュー', count: 'singular' },
      pt: { base: 'pré-visualização', plural: 'pré-visualizações', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A row of controls — the app's header (B43). German Symbolleiste, the word its UIs use.
    id: 'TOOLBAR',
    role: 'noun',
    description: 'a row of controls',
    definition: `
      /subj ( ROW /a /rel #2.subj )
      /subj ( ROW ) /verb ( HAVE ) /obj ( BUTTON /pl /zero )
    `,
    emoji: '🧰',
    forms: {
      en: { base: 'toolbar', plural: 'toolbars', count: 'singular' },
      it: { base: 'barra degli strumenti', plural: 'barre degli strumenti', gender: 'fem', count: 'singular' },
      fr: { base: "barre d'outils", plural: "barres d'outils", gender: 'fem', count: 'singular' },
      de: { base: 'Symbolleiste', plural: 'Symbolleisten', gender: 'fem', count: 'singular', compound: 'Symbolleisten' },
      es: { base: 'barra de herramientas', plural: 'barras de herramientas', gender: 'fem', count: 'singular' },
      ja: { base: 'ツールバー', count: 'singular' },
      pt: { base: 'barra de ferramentas', plural: 'barras de ferramentas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Items written one after another: the console's completion list, the picker's list of words.
    // Italian "elenco" is the list of items (a "lista" is also a strip); Japanese 一覧 is what a UI
    // calls a list it shows (the table-of-contents sense), not the borrowed リスト.
    id: 'LIST',
    role: 'noun',
    description: 'items written one after another',
    definition: `
      /subj ( GROUP /a /rel #2.obj )
      /subj ( one ) /verb ( ARRANGE ) /obj ( GROUP )
    `,
    emoji: '📃',
    forms: {
      en: { base: 'list', plural: 'lists', count: 'singular' },
      it: { base: 'elenco', plural: 'elenchi', gender: 'masc', count: 'singular' },
      fr: { base: 'liste', plural: 'listes', gender: 'fem', count: 'singular' },
      de: { base: 'Liste', plural: 'Listen', gender: 'fem', count: 'singular', compound: 'Listen' },
      es: { base: 'lista', plural: 'listas', gender: 'fem', count: 'singular' },
      ja: { base: '一覧', count: 'singular', reading: 'いちらん' },
      pt: { base: 'lista', plural: 'listas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // One of the settings a control can have: the pronoun grid's column, the console's "values for
    // /tense". The setting's sense, not worth or price.
    id: 'VALUE',
    role: 'noun',
    description: 'one of the settings a control can have',
    definition: `
      /subj ( CONCEPT /a /rel #2.obj )
      /subj ( one ) /verb ( SET ) /obj ( CONCEPT )
    `,
    emoji: '🎛️',
    forms: {
      en: { base: 'value', plural: 'values', count: 'singular' },
      it: { base: 'valore', plural: 'valori', gender: 'masc', count: 'singular' },
      fr: { base: 'valeur', plural: 'valeurs', gender: 'fem', count: 'singular' },
      de: { base: 'Wert', plural: 'Werte', gender: 'masc', count: 'singular', compound: 'Wert' },
      es: { base: 'valor', plural: 'valores', gender: 'masc', count: 'singular' },
      ja: { base: '値', count: 'singular', reading: 'あたい' },
      pt: { base: 'valor', plural: 'valores', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The mark that shows where the next key acts: the canvas's box outline, the console's caret.
    // German keeps the loanword, invariable in the plural (die Cursor).
    id: 'CURSOR',
    role: 'noun',
    description: 'the mark on a screen that shows where the next key acts',
    definition: `
      /subj ( PICTURE /a /rel #2.subj )
      /subj ( PICTURE ) /verb ( INDICATE ) /obj ( PLACE /pl /zero )
    `,
    emoji: '🖱️',
    forms: {
      en: { base: 'cursor', plural: 'cursors', count: 'singular' },
      it: { base: 'cursore', plural: 'cursori', gender: 'masc', count: 'singular' },
      fr: { base: 'curseur', plural: 'curseurs', gender: 'masc', count: 'singular' },
      de: { base: 'Cursor', plural: 'Cursor', gender: 'masc', count: 'singular', compound: 'Cursor' },
      es: { base: 'cursor', plural: 'cursores', gender: 'masc', count: 'singular' },
      ja: { base: 'カーソル', count: 'singular' },
      pt: { base: 'cursor', plural: 'cursores', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Written words, as a line holds them: what the console's parser reads (localization C21,
    // "unexpected text"). Japanese keeps the loanword テキスト, as its software does.
    id: 'TEXT',
    role: 'noun',
    description: 'written words',
    definition: '/subj ( CONTENT /adj WRITTEN /zero )',
    emoji: '📝',
    forms: {
      en: { base: 'text', plural: 'texts', count: 'singular' },
      it: { base: 'testo', plural: 'testi', gender: 'masc', count: 'singular' },
      fr: { base: 'texte', plural: 'textes', gender: 'masc', count: 'singular' },
      de: { base: 'Text', plural: 'Texte', gender: 'masc', count: 'singular', compound: 'Text' },
      es: { base: 'texto', plural: 'textos', gender: 'masc', count: 'singular' },
      ja: { base: 'テキスト', count: 'singular', reading: 'てきすと' },
      pt: { base: 'texto', plural: 'textos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What names something by pointing at it: the console's `#2.obj`, a period and a noun of it
    // (localization C21, "unexpected reference"). German Verweis, the native word (Referenz is the
    // programmer's); Japanese 参照, what its software calls a reference.
    id: 'REFERENCE',
    role: 'noun',
    description: 'something that points to something else',
    definition: `
      /subj ( WORD /a /rel #2.subj )
      /subj ( WORD ) /verb ( INDICATE ) /obj ( CONCEPT /pl /zero )
    `,
    emoji: '🔗',
    forms: {
      en: { base: 'reference', plural: 'references', count: 'singular' },
      it: { base: 'riferimento', plural: 'riferimenti', gender: 'masc', count: 'singular' },
      fr: { base: 'référence', plural: 'références', gender: 'fem', count: 'singular' },
      de: { base: 'Verweis', plural: 'Verweise', gender: 'masc', count: 'singular', compound: 'Verweis' },
      es: { base: 'referencia', plural: 'referencias', gender: 'fem', count: 'singular' },
      ja: { base: '参照', count: 'singular', reading: 'さんしょう' },
      pt: { base: 'referência', plural: 'referências', gender: 'fem', count: 'singular' },
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
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( OWN ) /obj ( OBJECT_THING /pl /zero )
    `,
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
  // a use; a ring of gold has it as its material or content (CONTENT is seeded above); a fly of the
  // fruit has it as its domain or place (PLACE is seeded above).
  {
    id: 'FEATURE',
    role: 'noun',
    description: 'a distinctive part or quality of something',
    emoji: '✨',
    forms: {
      en: { base: 'feature', plural: 'features', count: 'singular' },
      it: { base: 'caratteristica', plural: 'caratteristiche', gender: 'fem', count: 'singular' },
      fr: { base: 'caractéristique', plural: 'caractéristiques', gender: 'fem', count: 'singular' },
      de: { base: 'Merkmal', plural: 'Merkmale', gender: 'neut', count: 'singular', compound: 'Merkmals' },
      es: { base: 'característica', plural: 'características', gender: 'fem', count: 'singular' },
      ja: { base: '特徴', count: 'singular', reading: 'とくちょう' },
      pt: { base: 'característica', plural: 'características', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The class or sphere a thing belongs to, the `domain` modifier relation's name. Not REGION's
    // words: de "Gebiet", ja 分野, where the region of a page is a Bereich and a 領域.
    id: 'DOMAIN',
    role: 'noun',
    description: 'the sphere or class a thing belongs to',
    emoji: '🧭',
    forms: {
      en: { base: 'domain', plural: 'domains', count: 'singular' },
      it: { base: 'dominio', plural: 'domini', gender: 'masc', count: 'singular' },
      fr: { base: 'domaine', plural: 'domaines', gender: 'masc', count: 'singular' },
      de: { base: 'Gebiet', plural: 'Gebiete', gender: 'neut', count: 'singular', compound: 'Gebiets' },
      es: { base: 'dominio', plural: 'dominios', gender: 'masc', count: 'singular' },
      ja: { base: '分野', count: 'singular', reading: 'ぶんや' },
      pt: { base: 'domínio', plural: 'domínios', gender: 'masc', count: 'singular' },
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
    // P09's work, the noun (localization B62): labour, the noun of WORK_LABOUR — "the man does the
    // work". A mass noun, as English "work" is (a counted one is "a job"), and as the others say it
    // in this sense: il lavoro, du travail, Arbeit, trabajo, 仕事, trabalho. Glossed from the noun's
    // end of WORK_LABOUR's ACQUIRE + MONEY, on the instrument gap EYE stands on, so neither names the
    // other.
    id: 'WORK_NOUN',
    role: 'noun',
    description: 'labour; what one does for a living',
    definition: `
      /subj ( ACTION /a /rel #2.inst )
      /subj ( one ) /verb ( ACQUIRE ) /obj ( MONEY /a )
    `,
    emoji: '💼',
    countable: false,
    forms: {
      en: { base: 'work', count: 'singular' },
      it: { base: 'lavoro', gender: 'masc', count: 'singular' },
      fr: { base: 'travail', gender: 'masc', count: 'singular' },
      de: { base: 'Arbeit', gender: 'fem', count: 'singular' },
      es: { base: 'trabajo', gender: 'masc', count: 'singular' },
      ja: { base: '仕事', count: 'singular', reading: 'しごと' },
      pt: { base: 'trabalho', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P09-E24's research (localization B81): "work with which one finds new facts", WORK_NOUN on the
    // instrument gap it is itself glossed on. Mass. The Romance ricerca / recherche is also a search,
    // which SEARCH, a verb only, does not collide with. STUDY_NOUN is glossed on it.
    id: 'RESEARCH',
    role: 'noun',
    description: 'careful study to find out new facts',
    definition: `
      /subj ( WORK_NOUN /zero /rel #2.inst )
      /subj ( one ) /verb ( FIND ) /obj ( FACT /adj NEW /pl /zero )
    `,
    emoji: '🔬',
    countable: false,
    forms: {
      en: { base: 'research', count: 'singular' },
      it: { base: 'ricerca', gender: 'fem', count: 'singular' },
      fr: { base: 'recherche', gender: 'fem', count: 'singular' },
      de: { base: 'Forschung', gender: 'fem', count: 'singular' },
      es: { base: 'investigación', gender: 'fem', count: 'singular' },
      ja: { base: '研究', count: 'singular', reading: 'けんきゅう' },
      pt: { base: 'pesquisa', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A piece of research written up (E24 D2), "a text that describes research"; the verb STUDY is not
    // in the band. Japanese says the paper, 研究論文, since RESEARCH's 研究 would make the tooltip hold
    // its own word (研究: 研究を描写するテキスト) and give two nouns one label.
    id: 'STUDY_NOUN',
    role: 'noun',
    description: 'a piece of research, written up',
    definition: `
      /subj ( TEXT /a /rel #2.subj )
      /subj ( TEXT ) /verb ( DESCRIBE ) /obj ( RESEARCH /zero )
    `,
    emoji: '📑',
    forms: {
      en: { base: 'study', plural: 'studies', count: 'singular' },
      it: { base: 'studio', plural: 'studi', gender: 'masc', count: 'singular' },
      fr: { base: 'étude', plural: 'études', gender: 'fem', count: 'singular' },
      de: { base: 'Studie', plural: 'Studien', gender: 'fem', count: 'singular' },
      es: { base: 'estudio', plural: 'estudios', gender: 'masc', count: 'singular' },
      ja: { base: '研究論文', count: 'singular', reading: 'けんきゅうろんぶん' },
      pt: { base: 'estudo', plural: 'estudos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // What a thing is made of. French "matériau" (a material to build with), not "matériel" (equipment).
    // Glossed "substance with which one makes an object" (localization C26): SUBSTANCE is matter,
    // and a material is the substance a thing is made *with* — the instrument gap, bare because
    // SUBSTANCE is a mass noun.
    id: 'MATERIAL',
    role: 'noun',
    description: 'what something is made of',
    definition: `
      /subj ( SUBSTANCE /zero /rel #2.inst )
      /subj ( one ) /verb ( MAKE ) /obj ( OBJECT_THING /a )
    `,
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
  {
    // The material STICK is made of, as a `material` noun modifier: "a wood object", it "un oggetto
    // di legno", de "ein Holzgegenstand" (localization C26). A mass noun, like SUBSTANCE, so it
    // carries no plural (en "woods" is a forest). Japanese 木, which is also the tree, over the
    // lumber-yard 木材. Unglossed: "solid substance" is GROUND's gloss, and what tells wood from any
    // other material is the tree it comes from, which is not seeded.
    id: 'WOOD',
    role: 'noun',
    description: 'the hard material trees are made of',
    emoji: '🪵',
    countable: false,
    isA: 'MATERIAL',
    forms: {
      en: { base: 'wood', count: 'singular' },
      it: { base: 'legno', gender: 'masc', count: 'singular' },
      fr: { base: 'bois', gender: 'masc', count: 'singular' },
      de: { base: 'Holz', gender: 'neut', count: 'singular' },
      es: { base: 'madera', gender: 'fem', count: 'singular' },
      ja: { base: '木', count: 'singular', reading: 'き' },
      pt: { base: 'madeira', gender: 'fem', count: 'singular' },
    },
  },

  // ── Abstraction levels ────────────────────────────────────────────
  // The three degrees an instrument can be reified to (see AbstractionLevel): an act in flow, the
  // act named, or the thing it leaves behind. Everyday nouns, seeded like any other — the levels
  // just happen to be the first thing that names them.
  {
    // A degree on a scale, which the three above are three of: "the instrumental's level" (B44).
    // German Ebene, the word of "Abstraktionsebene"; Japanese 段階, a step on a scale.
    id: 'LEVEL',
    role: 'noun',
    description: 'a degree on a scale',
    emoji: '📶',
    forms: {
      en: { base: 'level', plural: 'levels', count: 'singular' },
      it: { base: 'livello', plural: 'livelli', gender: 'masc', count: 'singular' },
      fr: { base: 'niveau', plural: 'niveaux', gender: 'masc', count: 'singular' },
      de: { base: 'Ebene', plural: 'Ebenen', gender: 'fem', count: 'singular', compound: 'Ebenen' },
      es: { base: 'nivel', plural: 'niveles', gender: 'masc', count: 'singular' },
      ja: { base: '段階', count: 'singular', reading: 'だんかい' },
      pt: { base: 'nível', plural: 'níveis', gender: 'masc', count: 'singular' },
    },
  },
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
    // P09-E24's *change* as a noun (rank 364; localization B82), P09 D2's _NOUN suffix beside the
    // verbs CHANGE and CHANGE_ONESELF. A process, not an action: "an action with which one changes
    // an object" reads as the means. German Änderung (ändern is CHANGE's word), Japanese 変化.
    id: 'CHANGE_NOUN',
    role: 'noun',
    description: 'the act or result of becoming different',
    definition: `
      /subj ( PROCESS /a /rel #2.subj )
      /subj ( PROCESS ) /verb ( CHANGE ) /obj ( OBJECT_THING /pl /zero )
    `,
    emoji: '🔀',
    isA: 'PROCESS',
    forms: {
      en: { base: 'change', plural: 'changes', count: 'singular' },
      it: { base: 'cambiamento', plural: 'cambiamenti', gender: 'masc', count: 'singular' },
      fr: { base: 'changement', plural: 'changements', gender: 'masc', count: 'singular' },
      de: { base: 'Änderung', plural: 'Änderungen', gender: 'fem', count: 'singular' },
      es: { base: 'cambio', plural: 'cambios', gender: 'masc', count: 'singular' },
      ja: { base: '変化', count: 'singular', reading: 'へんか' },
      pt: { base: 'mudança', plural: 'mudanças', gender: 'fem', count: 'singular' },
    },
  },
  // ── P09's system and the two programs (localization B65) ─────────────
  {
    // "A group of parts that works": WORK is the machine sense (funzionare, funktionieren), and the
    // relative agrees with GROUP, so the whole works. STATE_NATION (B64) is glossed on it.
    id: 'SYSTEM',
    role: 'noun',
    description: 'a set of parts that work together as a whole',
    definition: `
      /subj ( GROUP /a /poss [ PART /pl /zero ] /parts /rel #2.subj )
      /subj ( GROUP ) /verb ( WORK )
    `,
    emoji: '⚙️',
    forms: {
      en: { base: 'system', plural: 'systems', count: 'singular' },
      it: { base: 'sistema', plural: 'sistemi', gender: 'masc', count: 'singular' },
      fr: { base: 'système', plural: 'systèmes', gender: 'masc', count: 'singular' },
      de: { base: 'System', plural: 'Systeme', gender: 'neut', count: 'singular' },
      es: { base: 'sistema', plural: 'sistemas', gender: 'masc', count: 'singular' },
      ja: { base: 'システム', count: 'singular' },
      pt: { base: 'sistema', plural: 'sistemas', gender: 'masc', count: 'singular' },
    },
  },
  // P09 D2's split of "program": the two render alike in en, it, es and pt and apart in fr, de and ja
  // (programme / émission, Programm / Sendung, プログラム / 番組), like DO and MAKE. The glosses and the
  // synonyms tell them apart.
  {
    // "A list of instructions": INSTRUCTION is a step telling what to do, addressed to nobody.
    id: 'PROGRAM_SOFTWARE',
    role: 'noun',
    description: 'a set of instructions a computer runs',
    definition: '/subj ( LIST /a /poss [ INSTRUCTION /pl /zero ] /parts )',
    emoji: '💾',
    synonym: 'software',
    forms: {
      en: { base: 'program', plural: 'programs', count: 'singular' },
      it: { base: 'programma', plural: 'programmi', gender: 'masc', count: 'singular' },
      fr: { base: 'programme', plural: 'programmes', gender: 'masc', count: 'singular' },
      de: { base: 'Programm', plural: 'Programme', gender: 'neut', count: 'singular' },
      es: { base: 'programa', plural: 'programas', gender: 'masc', count: 'singular' },
      ja: { base: 'プログラム', count: 'singular' },
      pt: { base: 'programa', plural: 'programas', gender: 'masc', count: 'singular' },
    },
  },
  {
    // "Content that one broadcasts", on BROADCAST, the one word it pays for: HELP is the content one
    // shows, PREVIEW the content one sees. German Sendung is senden's noun, but SEND's German is
    // schicken, so the two do not meet.
    id: 'PROGRAM_SHOW',
    role: 'noun',
    description: 'a show broadcast on radio or television',
    definition: `
      /subj ( CONTENT /zero /rel #2.obj )
      /subj ( one ) /verb ( BROADCAST ) /obj ( CONTENT )
    `,
    emoji: '📺',
    synonym: 'show',
    forms: {
      en: { base: 'program', plural: 'programs', count: 'singular' },
      it: { base: 'programma', plural: 'programmi', gender: 'masc', count: 'singular' },
      fr: { base: 'émission', plural: 'émissions', gender: 'fem', count: 'singular' },
      de: { base: 'Sendung', plural: 'Sendungen', gender: 'fem', count: 'singular' },
      es: { base: 'programa', plural: 'programas', gender: 'masc', count: 'singular' },
      ja: { base: '番組', count: 'singular', reading: 'ばんぐみ' },
      pt: { base: 'programa', plural: 'programas', gender: 'masc', count: 'singular' },
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
      de: { base: 'Begriff', plural: 'Begriffe', gender: 'masc', count: 'singular', compound: 'Begriffs' },
      es: { base: 'concepto', plural: 'conceptos', gender: 'masc', count: 'singular' },
      ja: { base: '概念', count: 'singular', reading: 'がいねん' },
      pt: { base: 'conceito', plural: 'conceitos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P09-E24's idea (localization B81): "a concept that is in a mind", B60's MIND. "A concept that one
    // thinks" is marginal in French and German (qu'on pense, den man denkt, with a noun object).
    id: 'IDEA',
    role: 'noun',
    description: 'a thought or a plan one has in mind',
    definition: `
      /subj ( CONCEPT /a /rel #2.subj )
      /subj ( CONCEPT ) /verb ( BE ) /loc ( MIND /a )
    `,
    emoji: '💭',
    forms: {
      en: { base: 'idea', plural: 'ideas', count: 'singular' },
      it: { base: 'idea', plural: 'idee', gender: 'fem', count: 'singular' },
      fr: { base: 'idée', plural: 'idées', gender: 'fem', count: 'singular' },
      de: { base: 'Idee', plural: 'Ideen', gender: 'fem', count: 'singular' },
      es: { base: 'idea', plural: 'ideas', gender: 'fem', count: 'singular' },
      ja: { base: '考え', count: 'singular', reading: 'かんがえ' },
      pt: { base: 'ideia', plural: 'ideias', gender: 'fem', count: 'singular' },
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
    // P09-E24's *game* (rank 210; localization B82), the game one plays (gioco, jeu, Spiel, juego,
    // ゲーム, jogo); a match (partita, partie, partido, 試合) is another concept. "An action that one
    // does for joy": the purpose complement on DO, near PLAY_GAME's "to act to feel joy" without
    // restating it. PLAY_GAME's own word would be circular (un'azione che si gioca).
    id: 'GAME',
    role: 'noun',
    description: 'an activity one plays for fun, often with rules',
    definition: `
      /subj ( ACTION /a /rel #2.obj )
      /subj ( one ) /verb ( DO ) /obj ( ACTION ) /for ( JOY /zero )
    `,
    emoji: '🎮',
    isA: 'ACTION',
    forms: {
      en: { base: 'game', plural: 'games', count: 'singular' },
      it: { base: 'gioco', plural: 'giochi', gender: 'masc', count: 'singular' },
      fr: { base: 'jeu', plural: 'jeux', gender: 'masc', count: 'singular' },
      de: { base: 'Spiel', plural: 'Spiele', gender: 'neut', count: 'singular' },
      es: { base: 'juego', plural: 'juegos', gender: 'masc', count: 'singular' },
      ja: { base: 'ゲーム', count: 'singular' },
      pt: { base: 'jogo', plural: 'jogos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The material half of THING (P09 D1, localization B65), which is its genus and whose gloss is
    // "an object or a concept": so this one stays on the literal, or the two would define only each
    // other (C26's BODY/ORGAN rule). Its synonym tells it from OBJECT_GRAMMAR, and is "item", not
    // "thing": THING's own label is "thing", and the picker's haystack includes the synonym.
    id: 'OBJECT_THING',
    role: 'noun',
    description: 'a material thing one can hold or use',
    emoji: '📦',
    synonym: 'item',
    isA: 'THING',
    forms: {
      en: { base: 'object', plural: 'objects', count: 'singular' },
      it: { base: 'oggetto', plural: 'oggetti', gender: 'masc', count: 'singular' },
      fr: { base: 'objet', plural: 'objets', gender: 'masc', count: 'singular' },
      de: { base: 'Gegenstand', plural: 'Gegenstände', gender: 'masc', count: 'singular', compound: 'Gegenstands' },
      es: { base: 'objeto', plural: 'objetos', gender: 'masc', count: 'singular' },
      ja: { base: '物体', count: 'singular', reading: 'ぶったい' },
      pt: { base: 'objeto', plural: 'objetos', gender: 'masc', count: 'singular' },
    },
  },
  // ── P09's everyday nouns (localization B65) ──────────────────────────
  {
    // Anything, material or not (P09 D1): the root above OBJECT_THING. Its two halves are both
    // seeded, so the root has a gloss where C26's roots have none: an object is the material half, a
    // concept the other. The words are the plain "thing" of each language (cosa, Ding, もの), not
    // OBJECT_THING's oggetto, Gegenstand, 物体. German Ding and Japanese もの lean concrete, which
    // CASE_INSTANCE's gloss shows ("ein Ding, das geschieht").
    id: 'THING',
    role: 'noun',
    description: 'anything, material or not',
    definition: '/subj ( OBJECT_THING /a /or [ CONCEPT /a ] )',
    emoji: '🔣',
    forms: {
      en: { base: 'thing', plural: 'things', count: 'singular' },
      it: { base: 'cosa', plural: 'cose', gender: 'fem', count: 'singular' },
      fr: { base: 'chose', plural: 'choses', gender: 'fem', count: 'singular' },
      de: { base: 'Ding', plural: 'Dinge', gender: 'neut', count: 'singular' },
      es: { base: 'cosa', plural: 'cosas', gender: 'fem', count: 'singular' },
      ja: { base: 'もの', count: 'singular' },
      pt: { base: 'coisa', plural: 'coisas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "A state that one must change": the dictionary's "a matter to be solved" would cost SOLVE for
    // one tooltip. STATE shares its word with STATE_NATION in it/fr/es/pt; cambiare settles which.
    id: 'PROBLEM',
    role: 'noun',
    description: 'a matter that needs to be dealt with and solved',
    definition: `
      /subj ( STATE /a /rel #2.obj )
      /subj ( one ) /verb ( CHANGE /modal MUST ) /obj ( STATE )
    `,
    emoji: '⚠️',
    forms: {
      en: { base: 'problem', plural: 'problems', count: 'singular' },
      // problema is masculine despite the -a, as in Spanish and Portuguese: il problema, i problemi.
      it: { base: 'problema', plural: 'problemi', gender: 'masc', count: 'singular' },
      fr: { base: 'problème', plural: 'problèmes', gender: 'masc', count: 'singular' },
      de: { base: 'Problem', plural: 'Probleme', gender: 'neut', count: 'singular' },
      es: { base: 'problema', plural: 'problemas', gender: 'masc', count: 'singular' },
      ja: { base: '問題', count: 'singular', reading: 'もんだい' },
      pt: { base: 'problema', plural: 'problemas', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P09-E24's issue (localization B81), a matter in dispute; a magazine's issue (numero, 号) is
    // another concept. "A problem about which one speaks", the corpus's first gloss on a **topic**
    // gap. It shares its word with QUESTION in French and German (question, Frage) and with PROBLEM
    // in Japanese (問題), which is the everyday word (環境問題), so the Japanese tooltip holds its own
    // word: 問題: 話す問題. 論点 would keep the gloss and lose the everyday word.
    id: 'ISSUE',
    role: 'noun',
    description: 'a matter that people discuss or argue about',
    definition: `
      /subj ( PROBLEM /a /rel #2.about )
      /subj ( one ) /verb ( SPEAK ) /about ( PROBLEM )
    `,
    emoji: '🗯️',
    synonym: 'matter',
    forms: {
      en: { base: 'issue', plural: 'issues', count: 'singular' },
      it: { base: 'questione', plural: 'questioni', gender: 'fem', count: 'singular' },
      fr: { base: 'question', plural: 'questions', gender: 'fem', count: 'singular' },
      de: { base: 'Frage', plural: 'Fragen', gender: 'fem', count: 'singular' },
      es: { base: 'cuestión', plural: 'cuestiones', gender: 'fem', count: 'singular' },
      ja: { base: '問題', count: 'singular', reading: 'もんだい' },
      pt: { base: 'questão', plural: 'questões', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The instance, as in "in this case" — not a container or a court case. French cas is the same
    // word in the plural; German Fall umlauts (Fälle).
    id: 'CASE_INSTANCE',
    role: 'noun',
    description: 'an instance of something happening, as in "in this case"',
    definition: `
      /subj ( THING /a /rel #2.subj )
      /subj ( THING ) /verb ( HAPPEN )
    `,
    emoji: '🗂️',
    synonym: 'instance',
    forms: {
      en: { base: 'case', plural: 'cases', count: 'singular' },
      it: { base: 'caso', plural: 'casi', gender: 'masc', count: 'singular' },
      fr: { base: 'cas', plural: 'cas', gender: 'masc', count: 'singular' },
      de: { base: 'Fall', plural: 'Fälle', gender: 'masc', count: 'singular' },
      es: { base: 'caso', plural: 'casos', gender: 'masc', count: 'singular' },
      ja: { base: '場合', count: 'singular', reading: 'ばあい' },
      pt: { base: 'caso', plural: 'casos', gender: 'masc', count: 'singular' },
    },
  },
  // ── The natural kinds' genera (localization B52) ───────────────────
  {
    id: 'BEING',
    role: 'noun',
    description: 'a thing that exists, living or not',
    emoji: '✨',
    forms: {
      en: { base: 'being', plural: 'beings', count: 'singular' },
      it: { base: 'essere', plural: 'esseri', gender: 'masc', count: 'singular' },
      fr: { base: 'être', plural: 'êtres', gender: 'masc', count: 'singular' },
      de: { base: 'Wesen', plural: 'Wesen', gender: 'neut', count: 'singular' },
      es: { base: 'ser', plural: 'seres', gender: 'masc', count: 'singular' },
      ja: { base: '存在', count: 'singular', reading: 'そんざい' },
      pt: { base: 'ser', plural: 'seres', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The whole ORGAN is a part of (localization C26), and the root of it: nothing seeded is above
    // it but OBJECT_THING and BEING, and "an object that has organs" would define it and ORGAN by
    // each other. Japanese 体, the everyday word, over the formal 身体.
    id: 'BODY',
    role: 'noun',
    description: 'the physical whole of a person or an animal',
    emoji: '🧍',
    forms: {
      en: { base: 'body', plural: 'bodies', count: 'singular' },
      it: { base: 'corpo', plural: 'corpi', gender: 'masc', count: 'singular' },
      fr: { base: 'corps', plural: 'corps', gender: 'masc', count: 'singular' },
      de: { base: 'Körper', plural: 'Körper', gender: 'masc', count: 'singular' },
      es: { base: 'cuerpo', plural: 'cuerpos', gender: 'masc', count: 'singular' },
      ja: { base: '体', count: 'singular', reading: 'からだ' },
      pt: { base: 'corpo', plural: 'corpos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // "A part of a body" (localization C26). The description's "living" has no word to say it with
    // — LIVE is the dwelling sense — and a body is a living thing's anyway.
    id: 'ORGAN',
    role: 'noun',
    description: 'a part of a living body',
    definition: '/subj ( PART /a /poss [ BODY /a ] /whole )',
    emoji: '🫀',
    forms: {
      en: { base: 'organ', plural: 'organs', count: 'singular' },
      it: { base: 'organo', plural: 'organi', gender: 'masc', count: 'singular' },
      fr: { base: 'organe', plural: 'organes', gender: 'masc', count: 'singular' },
      de: { base: 'Organ', plural: 'Organe', gender: 'neut', count: 'singular' },
      es: { base: 'órgano', plural: 'órganos', gender: 'masc', count: 'singular' },
      ja: { base: '器官', count: 'singular', reading: 'きかん' },
      pt: { base: 'órgão', plural: 'órgãos', gender: 'masc', count: 'singular' },
    },
  },
  // The two organs the sexes are glossed on (localization C24): MALE is "that has testicles", FEMALE
  // "that has ovaries", CASTRATED "from which the testicles have been removed". German Hoden is the
  // same word in the plural; Japanese takes the anatomical 精巣 and 卵巣, one pair of one register.
  {
    id: 'TESTICLE',
    role: 'noun',
    description: 'the male organ that produces sperm',
    emoji: '🫘',
    isA: 'ORGAN',
    forms: {
      en: { base: 'testicle', plural: 'testicles', count: 'singular' },
      it: { base: 'testicolo', plural: 'testicoli', gender: 'masc', count: 'singular' },
      fr: { base: 'testicule', plural: 'testicules', gender: 'masc', count: 'singular' },
      de: { base: 'Hoden', plural: 'Hoden', gender: 'masc', count: 'singular' },
      es: { base: 'testículo', plural: 'testículos', gender: 'masc', count: 'singular' },
      ja: { base: '精巣', count: 'singular', reading: 'せいそう' },
      pt: { base: 'testículo', plural: 'testículos', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'OVARY',
    role: 'noun',
    description: 'the female organ that produces egg cells',
    emoji: '🥚',
    isA: 'ORGAN',
    forms: {
      en: { base: 'ovary', plural: 'ovaries', count: 'singular' },
      // ovaia is feminine in Italian, and its plural is ovaie.
      it: { base: 'ovaia', plural: 'ovaie', gender: 'fem', count: 'singular' },
      fr: { base: 'ovaire', plural: 'ovaires', gender: 'masc', count: 'singular' },
      de: { base: 'Eierstock', plural: 'Eierstöcke', gender: 'masc', count: 'singular' },
      es: { base: 'ovario', plural: 'ovarios', gender: 'masc', count: 'singular' },
      ja: { base: '卵巣', count: 'singular', reading: 'らんそう' },
      pt: { base: 'ovário', plural: 'ovários', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'MILK',
    role: 'noun',
    description: 'the white liquid a mammal feeds its young with',
    emoji: '🥛',
    countable: false,
    forms: {
      en: { base: 'milk', count: 'singular' },
      it: { base: 'latte', gender: 'masc', count: 'singular' },
      fr: { base: 'lait', gender: 'masc', count: 'singular' },
      de: { base: 'Milch', gender: 'fem', count: 'singular' },
      es: { base: 'leche', gender: 'fem', count: 'singular' },
      ja: { base: '乳', count: 'singular', reading: 'ちち' },
      pt: { base: 'leite', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GRASS',
    role: 'noun',
    description: 'the low green plant that covers ground',
    emoji: '🌿',
    countable: false,
    forms: {
      en: { base: 'grass', count: 'singular' },
      it: { base: 'erba', gender: 'fem', count: 'singular' },
      // herbe opens on an h muet: l'herbe, de l'herbe.
      fr: { base: 'herbe', gender: 'fem', count: 'singular', elides: '1' },
      de: { base: 'Gras', gender: 'neut', count: 'singular' },
      es: { base: 'hierba', gender: 'fem', count: 'singular' },
      ja: { base: '草', count: 'singular', reading: 'くさ' },
      pt: { base: 'grama', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'HEAT',
    role: 'noun',
    description: 'the energy a hot thing gives off',
    emoji: '🔥',
    countable: false,
    forms: {
      en: { base: 'heat', count: 'singular' },
      it: { base: 'calore', gender: 'masc', count: 'singular' },
      fr: { base: 'chaleur', gender: 'fem', count: 'singular' },
      // Hitze- is the compound stem, not the *Hitzen- the feminine -e rule would give.
      de: { base: 'Hitze', gender: 'fem', count: 'singular', compound: 'Hitze' },
      es: { base: 'calor', gender: 'masc', count: 'singular' },
      ja: { base: '熱', count: 'singular', reading: 'ねつ' },
      pt: { base: 'calor', gender: 'masc', count: 'singular' },
    },
  },
  {
    // "An organ with which one sees" — its description, said with the instrument gap (localization
    // C26). WING and TOOTH, the other organs, are what flies and what bites.
    id: 'EYE',
    role: 'noun',
    description: 'the organ one sees with',
    definition: `
      /subj ( ORGAN /a /rel #2.inst )
      /subj ( one ) /verb ( SEE )
    `,
    emoji: '👁️',
    forms: {
      en: { base: 'eye', plural: 'eyes', count: 'singular' },
      it: { base: 'occhio', plural: 'occhi', gender: 'masc', count: 'singular' },
      // œil is one of the few French nouns with a wholly irregular plural.
      fr: { base: 'œil', plural: 'yeux', gender: 'masc', count: 'singular' },
      de: { base: 'Auge', plural: 'Augen', gender: 'neut', count: 'singular', compound: 'Augen' },
      es: { base: 'ojo', plural: 'ojos', gender: 'masc', count: 'singular' },
      ja: { base: '目', count: 'singular', reading: 'め' },
      pt: { base: 'olho', plural: 'olhos', gender: 'masc', count: 'singular' },
    },
  },
  // P09's hand (localization B65), an organ like TESTICLE and OVARY. Seeded ahead of B65's other
  // nouns because B61's TAKE is glossed on it ("to acquire objects with the hand"). Italian and
  // Spanish mano are feminine despite the -o, and Italian's plural is mani.
  {
    // "An organ with which one takes an object": EYE's instrument gap, with an object, since German
    // nehmen wants one. TAKE is glossed on HAND in turn, the verb-and-its-instrument pair the corpus
    // accepts in BITE and TOOTH, CUT and BLADE. HOLD's lexemes are the contain sense (contenere,
    // enthalten), so it could not serve.
    id: 'HAND',
    role: 'noun',
    description: 'the part at the end of the arm one holds things with',
    definition: `
      /subj ( ORGAN /a /rel #2.inst )
      /subj ( one ) /verb ( TAKE ) /obj ( OBJECT_THING /a )
    `,
    emoji: '✋',
    isA: 'ORGAN',
    forms: {
      en: { base: 'hand', plural: 'hands', count: 'singular' },
      it: { base: 'mano', plural: 'mani', gender: 'fem', count: 'singular' },
      fr: { base: 'main', plural: 'mains', gender: 'fem', count: 'singular' },
      de: { base: 'Hand', plural: 'Hände', gender: 'fem', count: 'singular' },
      es: { base: 'mano', plural: 'manos', gender: 'fem', count: 'singular' },
      ja: { base: '手', count: 'singular', reading: 'て' },
      pt: { base: 'mão', plural: 'mãos', gender: 'fem', count: 'singular' },
    },
  },
  // ── P09-E24's head, face, back and health (localization B79) ─────────
  {
    // The body part; the leader (capo, chef, Leiter, jefe, 長) is another concept. "The high part of a
    // body": NIGHT's shape, a definite part picked out by an adjective, and ORGAN's "a part of a body"
    // narrowed. No `isA`, as EYE has none. FACE is glossed on it, so it is seeded first.
    id: 'HEAD',
    role: 'noun',
    description: 'the top part of the body, with the face and the brain',
    definition: '/subj ( PART /adj HIGH /poss [ BODY /a ] /whole )',
    emoji: '👤',
    forms: {
      en: { base: 'head', plural: 'heads', count: 'singular' },
      it: { base: 'testa', plural: 'teste', gender: 'fem', count: 'singular' },
      fr: { base: 'tête', plural: 'têtes', gender: 'fem', count: 'singular' },
      de: { base: 'Kopf', plural: 'Köpfe', gender: 'masc', count: 'singular' },
      es: { base: 'cabeza', plural: 'cabezas', gender: 'fem', count: 'singular' },
      ja: { base: '頭', count: 'singular', reading: 'あたま' },
      pt: { base: 'cabeça', plural: 'cabeças', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "The part of a head that has the eyes", standing on HEAD as CASE_INSTANCE stood on THING. The
    // eyes are definite plural, as the parents are in the sibling glosses. Italian viso, the neutral
    // word, over faccia; Spanish cara, which is also CARO's feminine, a word no seed has.
    id: 'FACE',
    role: 'noun',
    description: 'the front of the head, with the eyes, the nose and the mouth',
    definition: `
      /subj ( PART /poss [ HEAD /a ] /whole /rel #2.subj )
      /subj ( PART ) /verb ( HAVE ) /obj ( EYE /pl )
    `,
    emoji: '🙂',
    forms: {
      en: { base: 'face', plural: 'faces', count: 'singular' },
      it: { base: 'viso', plural: 'visi', gender: 'masc', count: 'singular' },
      fr: { base: 'visage', plural: 'visages', gender: 'masc', count: 'singular' },
      de: { base: 'Gesicht', plural: 'Gesichter', gender: 'neut', count: 'singular' },
      es: { base: 'cara', plural: 'caras', gender: 'fem', count: 'singular' },
      ja: { base: '顔', count: 'singular', reading: 'かお' },
      pt: { base: 'rosto', plural: 'rostos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The body's back (E24 D2); the rear of a thing (retro, arrière, Rückseite, 後ろ) is another
    // concept, and the adverb is COME_BACK's. Literal by design: "the opposite part of a body" needs
    // something to be opposite to, which OPPOSITE takes no complement for, and "the part behind the
    // chest" would seed CHEST for one tooltip. Portuguese says *as costas*, plural in every use: a
    // plurale tantum (P09-E41), seeded as NEWS's five are, with the plural surface as `base`.
    id: 'BACK_BODY',
    role: 'noun',
    description: 'the rear part of the body, from the neck to the hips',
    emoji: '🔙',
    forms: {
      en: { base: 'back', plural: 'backs', count: 'singular' },
      it: { base: 'schiena', plural: 'schiene', gender: 'fem', count: 'singular' },
      fr: { base: 'dos', plural: 'dos', gender: 'masc', count: 'singular' },
      de: { base: 'Rücken', plural: 'Rücken', gender: 'masc', count: 'singular' },
      es: { base: 'espalda', plural: 'espaldas', gender: 'fem', count: 'singular' },
      ja: { base: '背中', count: 'singular', reading: 'せなか' },
      pt: { base: 'costas', gender: 'fem', count: 'plural' },
    },
  },
  {
    // "A body's good state": the Saxon genitive in English, since health is not a *part* of the body
    // (the `whole` role would say "of a body"). Mass. When "healthy" is seeded it has its genus here.
    id: 'HEALTH',
    role: 'noun',
    description: 'the state of being well in body',
    definition: '/subj ( STATE /adj GOOD /poss [ BODY /a ] )',
    emoji: '🩺',
    countable: false,
    forms: {
      en: { base: 'health', count: 'singular' },
      it: { base: 'salute', gender: 'fem', count: 'singular' },
      fr: { base: 'santé', gender: 'fem', count: 'singular' },
      de: { base: 'Gesundheit', gender: 'fem', count: 'singular' },
      es: { base: 'salud', gender: 'fem', count: 'singular' },
      ja: { base: '健康', count: 'singular', reading: 'けんこう' },
      pt: { base: 'saúde', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'STORY',
    role: 'noun',
    description: 'a telling of events, true or not',
    emoji: '📖',
    forms: {
      en: { base: 'story', plural: 'stories', count: 'singular' },
      it: { base: 'storia', plural: 'storie', gender: 'fem', count: 'singular' },
      // histoire opens on an h muet: l'histoire.
      fr: { base: 'histoire', plural: 'histoires', gender: 'fem', count: 'singular', elides: '1' },
      de: { base: 'Geschichte', plural: 'Geschichten', gender: 'fem', count: 'singular' },
      es: { base: 'historia', plural: 'historias', gender: 'fem', count: 'singular' },
      ja: { base: '物語', count: 'singular', reading: 'ものがたり' },
      pt: { base: 'história', plural: 'histórias', gender: 'fem', count: 'singular' },
    },
  },
  {
    // P09-E24's history (localization B81), the past and its study, not the console's typed HISTORY
    // (cronologia, Verlauf, 履歴). "The past facts", PAST being the grammar's past (C24). It shares its
    // word with STORY in five languages (storia, histoire, Geschichte, historia, história), which the
    // synonym tells apart in the picker; French histoire opens on an h muet, as STORY's does. Mass.
    id: 'HISTORY_PAST',
    role: 'noun',
    description: 'the past, and the study of it',
    definition: '/subj ( FACT /adj PAST /pl )',
    emoji: '🏛️',
    countable: false,
    synonym: 'the past',
    forms: {
      en: { base: 'history', count: 'singular' },
      it: { base: 'storia', gender: 'fem', count: 'singular' },
      fr: { base: 'histoire', gender: 'fem', count: 'singular', elides: '1' },
      de: { base: 'Geschichte', gender: 'fem', count: 'singular' },
      es: { base: 'historia', gender: 'fem', count: 'singular' },
      ja: { base: '歴史', count: 'singular', reading: 'れきし' },
      pt: { base: 'história', gender: 'fem', count: 'singular' },
    },
  },
  {
    // A **plurale tantum** in five of the seven (P09-E41): *le notizie, les nouvelles, die
    // Nachrichten, las noticias, as notícias* are plural in every use — the singular *la notizia* is
    // "a news item" — while English *news* is mass and singular ("the news seems good"). Each of the
    // five carries `count: 'plural'` and seeds its plural surface as `base` with no `plural`: the
    // noun phrase then resolves plural whatever the plan asks (see `resolveNounPhrase`), so the
    // article, the adjective and the verb agree plural. The concept is mass for English's sake;
    // a plural-only lexeme sheds that, since *notizie* counts ("tre notizie").
    id: 'NEWS',
    role: 'noun',
    description: 'reports of recent events',
    // "Facts that one has told recently" (localization A32): the report and its recency, a bare
    // plural head over an object-gap clause, on FACT, TELL and RECENTLY. It avoids NEW, whose en
    // *new* and fr *nouveaux* would echo *news* and *nouvelles*.
    definition: `
      /subj ( FACT /pl /zero /rel #2.obj )
      /subj ( one ) /verb ( TELL /adv RECENTLY /result ) /obj ( FACT )
    `,
    emoji: '📰',
    countable: false,
    forms: {
      // Mass in English, counted by the piece (A311): "three pieces of news", "each piece of news".
      en: { base: 'news', count: 'singular', unit: 'piece of news', unit_plural: 'pieces of news' },
      it: { base: 'notizie', gender: 'fem', count: 'plural' },
      fr: { base: 'nouvelles', gender: 'fem', count: 'plural' },
      de: { base: 'Nachrichten', gender: 'fem', count: 'plural' },
      es: { base: 'noticias', gender: 'fem', count: 'plural' },
      ja: { base: 'ニュース', count: 'singular' },
      pt: { base: 'notícias', gender: 'fem', count: 'plural' },
    },
  },
  // ── Substances and states (localization B53) ───────────────────────
  {
    id: 'SUBSTANCE',
    role: 'noun',
    description: 'what things are made of; matter',
    emoji: '🧪',
    countable: false,
    synonym: 'matter',
    forms: {
      en: { base: 'substance', count: 'singular' },
      it: { base: 'sostanza', gender: 'fem', count: 'singular' },
      fr: { base: 'substance', gender: 'fem', count: 'singular' },
      de: { base: 'Stoff', gender: 'masc', count: 'singular' },
      es: { base: 'sustancia', gender: 'fem', count: 'singular' },
      ja: { base: '物質', count: 'singular', reading: 'ぶっしつ' },
      pt: { base: 'substância', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'STATE',
    role: 'noun',
    description: 'the way a thing is at a time',
    emoji: '🔆',
    synonym: 'condition',
    forms: {
      en: { base: 'state', plural: 'states', count: 'singular' },
      it: { base: 'stato', plural: 'stati', gender: 'masc', count: 'singular' },
      fr: { base: 'état', plural: 'états', gender: 'masc', count: 'singular' },
      de: { base: 'Zustand', plural: 'Zustände', gender: 'masc', count: 'singular', compound: 'Zustands' },
      es: { base: 'estado', plural: 'estados', gender: 'masc', count: 'singular' },
      ja: { base: '状態', count: 'singular', reading: 'じょうたい' },
      pt: { base: 'estado', plural: 'estados', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'GAS',
    role: 'noun',
    description: 'a substance that is neither solid nor liquid',
    emoji: '💨',
    countable: false,
    forms: {
      en: { base: 'gas', count: 'singular' },
      // Italian gas and French gaz are invariable.
      it: { base: 'gas', gender: 'masc', count: 'singular' },
      fr: { base: 'gaz', gender: 'masc', count: 'singular' },
      de: { base: 'Gas', gender: 'neut', count: 'singular' },
      es: { base: 'gas', gender: 'masc', count: 'singular' },
      ja: { base: '気体', count: 'singular', reading: 'きたい' },
      pt: { base: 'gás', gender: 'masc', count: 'singular' },
    },
  },
  // ── The dimensions a quality adjective scales on (localization B54) ─
  {
    id: 'JOY',
    role: 'noun',
    description: 'the feeling of being glad',
    emoji: '😀',
    countable: false,
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'joy', count: 'singular' },
      it: { base: 'gioia', gender: 'fem', count: 'singular' },
      fr: { base: 'joie', gender: 'fem', count: 'singular' },
      de: { base: 'Freude', gender: 'fem', count: 'singular' },
      es: { base: 'alegría', gender: 'fem', count: 'singular' },
      ja: { base: '喜び', count: 'singular', reading: 'よろこび' },
      pt: { base: 'alegria', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'SORROW',
    role: 'noun',
    description: 'the feeling of being sad',
    emoji: '😢',
    countable: false,
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'sorrow', count: 'singular' },
      it: { base: 'tristezza', gender: 'fem', count: 'singular' },
      fr: { base: 'tristesse', gender: 'fem', count: 'singular' },
      de: { base: 'Trauer', gender: 'fem', count: 'singular' },
      es: { base: 'tristeza', gender: 'fem', count: 'singular' },
      ja: { base: '悲しみ', count: 'singular', reading: 'かなしみ' },
      pt: { base: 'tristeza', gender: 'fem', count: 'singular' },
    },
  },
  // Two root nouns P09's words are glossed on (localization B66, B67), each on the literal, as C26's
  // roots are. ERROR is RIGHT_CORRECT's differentia ("that does not have errors"), and must never be
  // glossed back through it ("a part that is not right"); "a failed action" says a failure, not a
  // mistake. REALITY is REALLY's ("in reality"): countable, so the French locative of a bare singular
  // is "en réalité" (A219), where a mass noun would take "dans de la réalité".
  {
    id: 'ERROR',
    role: 'noun',
    description: 'something done or said that is not correct',
    emoji: '❌',
    forms: {
      en: { base: 'error', plural: 'errors', count: 'singular' },
      it: { base: 'errore', plural: 'errori', gender: 'masc', count: 'singular' },
      fr: { base: 'erreur', plural: 'erreurs', gender: 'fem', count: 'singular' },
      de: { base: 'Fehler', plural: 'Fehler', gender: 'masc', count: 'singular' },
      es: { base: 'error', plural: 'errores', gender: 'masc', count: 'singular' },
      ja: { base: '誤り', count: 'singular', reading: 'あやまり' },
      pt: { base: 'erro', plural: 'erros', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'REALITY',
    role: 'noun',
    description: 'the way things actually are',
    emoji: '🌐',
    forms: {
      en: { base: 'reality', plural: 'realities', count: 'singular' },
      it: { base: 'realtà', plural: 'realtà', gender: 'fem', count: 'singular' },
      fr: { base: 'réalité', plural: 'réalités', gender: 'fem', count: 'singular' },
      de: { base: 'Wirklichkeit', plural: 'Wirklichkeiten', gender: 'fem', count: 'singular' },
      es: { base: 'realidad', plural: 'realidades', gender: 'fem', count: 'singular' },
      ja: { base: '現実', count: 'singular', reading: 'げんじつ' },
      pt: { base: 'realidade', plural: 'realidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'REST',
    role: 'noun',
    description: 'the being still, to recover strength',
    emoji: '😴',
    countable: false,
    synonym: 'repose',
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'rest', count: 'singular' },
      it: { base: 'riposo', gender: 'masc', count: 'singular' },
      fr: { base: 'repos', gender: 'masc', count: 'singular' },
      // Ruhe- is the compound stem, not the *Ruhen- the feminine -e rule would give.
      de: { base: 'Ruhe', gender: 'fem', count: 'singular', compound: 'Ruhe' },
      es: { base: 'descanso', gender: 'masc', count: 'singular' },
      ja: { base: '休息', count: 'singular', reading: 'きゅうそく' },
      pt: { base: 'descanso', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'ATTENTION',
    role: 'noun',
    description: 'the turning of the mind toward something',
    emoji: '🧐',
    countable: false,
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'attention', count: 'singular' },
      it: { base: 'attenzione', gender: 'fem', count: 'singular' },
      fr: { base: 'attention', gender: 'fem', count: 'singular' },
      de: { base: 'Aufmerksamkeit', gender: 'fem', count: 'singular' },
      es: { base: 'atención', gender: 'fem', count: 'singular' },
      // 注目, not 注意: CARE is already 注意, and INTERESTING and CAREFUL would gloss alike in
      // Japanese alone — the COLD/冷たい case B48 met.
      ja: { base: '注目', count: 'singular', reading: 'ちゅうもく' },
      pt: { base: 'atenção', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'ABILITY',
    role: 'noun',
    description: 'the power to do something',
    emoji: '💪',
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'ability', plural: 'abilities', count: 'singular' },
      // Italian capacità is invariable, as every -tà noun is.
      it: { base: 'capacità', plural: 'capacità', gender: 'fem', count: 'singular' },
      fr: { base: 'capacité', plural: 'capacités', gender: 'fem', count: 'singular' },
      de: { base: 'Fähigkeit', plural: 'Fähigkeiten', gender: 'fem', count: 'singular' },
      es: { base: 'capacidad', plural: 'capacidades', gender: 'fem', count: 'singular' },
      ja: { base: '能力', count: 'singular', reading: 'のうりょく' },
      pt: { base: 'capacidade', plural: 'capacidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'DUTY',
    role: 'noun',
    description: 'what one is bound to do',
    emoji: '📋',
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'duty', plural: 'duties', count: 'singular' },
      it: { base: 'dovere', plural: 'doveri', gender: 'masc', count: 'singular' },
      fr: { base: 'devoir', plural: 'devoirs', gender: 'masc', count: 'singular' },
      de: { base: 'Pflicht', plural: 'Pflichten', gender: 'fem', count: 'singular' },
      es: { base: 'deber', plural: 'deberes', gender: 'masc', count: 'singular' },
      ja: { base: '義務', count: 'singular', reading: 'ぎむ' },
      pt: { base: 'dever', plural: 'deveres', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The scale the figurative WARM sits on, "of great kindness" (localization C24): AFFECTION is
    // "a warm feeling", so WARM cannot be glossed on it. Japanese 優しさ, not 親切, which is a kind act.
    id: 'KINDNESS',
    role: 'noun',
    description: 'the quality of being kind to others',
    emoji: '🤝',
    countable: false,
    dimensionRelation: 'quality',
    forms: {
      en: { base: 'kindness', count: 'singular' },
      it: { base: 'gentilezza', gender: 'fem', count: 'singular' },
      fr: { base: 'gentillesse', gender: 'fem', count: 'singular' },
      de: { base: 'Freundlichkeit', gender: 'fem', count: 'singular' },
      es: { base: 'amabilidad', gender: 'fem', count: 'singular' },
      ja: { base: '優しさ', count: 'singular', reading: 'やさしさ' },
      pt: { base: 'gentileza', gender: 'fem', count: 'singular' },
    },
  },
  // ── The geography genera (localization B56) ────────────────────────
  {
    id: 'LAND',
    role: 'noun',
    description: "ground taken as a stretch of the earth's surface",
    emoji: '🏞️',
    countable: false,
    synonym: 'territory',
    forms: {
      en: { base: 'land', count: 'singular' },
      it: { base: 'terra', gender: 'fem', count: 'singular' },
      fr: { base: 'terre', gender: 'fem', count: 'singular' },
      de: { base: 'Land', gender: 'neut', count: 'singular' },
      es: { base: 'tierra', gender: 'fem', count: 'singular' },
      ja: { base: '陸地', count: 'singular', reading: 'りくち' },
      pt: { base: 'terra', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'NATION',
    role: 'noun',
    description: 'a people with a government of its own',
    emoji: '🚩',
    human: true,
    forms: {
      en: { base: 'nation', plural: 'nations', count: 'singular' },
      it: { base: 'nazione', plural: 'nazioni', gender: 'fem', count: 'singular' },
      fr: { base: 'nation', plural: 'nations', gender: 'fem', count: 'singular' },
      de: { base: 'Nation', plural: 'Nationen', gender: 'fem', count: 'singular' },
      es: { base: 'nación', plural: 'naciones', gender: 'fem', count: 'singular' },
      ja: { base: '国民', count: 'singular', reading: 'こくみん' },
      pt: { base: 'nação', plural: 'nações', gender: 'fem', count: 'singular' },
    },
  },
  // ── P09's institutions and people (localization B64) ─────────────────
  {
    // The institution, not P08's CLASS_SCHOOL or a school of fish: a building like HOUSE ("where one
    // lives") and PRISON, set apart from them by LEARN, which STUDENT takes too. German Schul- is the
    // compound stem (Schulbuch), not the *Schulen- the feminine -e rule would give.
    id: 'SCHOOL',
    role: 'noun',
    description: 'a place where children and young people are taught',
    definition: `
      /subj ( BUILDING /a /rel #2.loc )
      /subj ( one ) /verb ( LEARN ) /loc ( BUILDING )
    `,
    emoji: '🏫',
    isA: 'BUILDING',
    forms: {
      en: { base: 'school', plural: 'schools', count: 'singular' },
      it: { base: 'scuola', plural: 'scuole', gender: 'fem', count: 'singular' },
      fr: { base: 'école', plural: 'écoles', gender: 'fem', count: 'singular' },
      de: { base: 'Schule', plural: 'Schulen', gender: 'fem', count: 'singular', compound: 'Schul' },
      es: { base: 'escuela', plural: 'escuelas', gender: 'fem', count: 'singular' },
      ja: { base: '学校', count: 'singular', reading: 'がっこう' },
      pt: { base: 'escola', plural: 'escolas', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "A person who learns", a learner at its widest: STUDY would be closer to étudiant and Student,
    // but German studieren is a university's verb and cannot also serve SCHOOL. German Student is a
    // weak masculine (des Studenten); Spanish and Portuguese write the feminine as the masculine, and
    // the article carries it (una estudiante).
    id: 'STUDENT',
    role: 'noun',
    description: 'a person who is studying at a school or university',
    definition: `
      /subj ( PERSON /a /rel #2.subj )
      /subj ( PERSON ) /verb ( LEARN )
    `,
    emoji: '🧑‍🎓',
    animate: true,
    human: true,
    isA: 'PERSON',
    forms: {
      en: { base: 'student', plural: 'students', count: 'singular' },
      it: { base: 'studente', plural: 'studenti', gender: 'masc', count: 'singular', fem: 'studentessa', fem_plural: 'studentesse' },
      fr: { base: 'étudiant', plural: 'étudiants', gender: 'masc', count: 'singular', fem: 'étudiante', fem_plural: 'étudiantes' },
      de: { base: 'Student', plural: 'Studenten', gender: 'masc', count: 'singular', weak: '1', fem: 'Studentin', fem_plural: 'Studentinnen' },
      es: { base: 'estudiante', plural: 'estudiantes', gender: 'masc', count: 'singular', fem: 'estudiante', fem_plural: 'estudiantes' },
      ja: { base: '学生', count: 'singular', reading: 'がくせい' },
      pt: { base: 'estudante', plural: 'estudantes', gender: 'masc', count: 'singular', fem: 'estudante', fem_plural: 'estudantes' },
    },
  },
  {
    // The business, not companionship (compagnia, compagnie). "A group that sells": TRADE's German
    // handeln is also ACT's, so "eine Gruppe, die handelt" would read "a group that takes action".
    id: 'COMPANY_BUSINESS',
    role: 'noun',
    description: 'a business that makes or sells goods or services',
    definition: `
      /subj ( GROUP /a /rel #2.subj )
      /subj ( GROUP ) /verb ( SELL )
    `,
    emoji: '🏢',
    synonym: 'business',
    forms: {
      en: { base: 'company', plural: 'companies', count: 'singular' },
      it: { base: 'azienda', plural: 'aziende', gender: 'fem', count: 'singular' },
      fr: { base: 'entreprise', plural: 'entreprises', gender: 'fem', count: 'singular' },
      de: { base: 'Firma', plural: 'Firmen', gender: 'fem', count: 'singular', compound: 'Firmen' },
      es: { base: 'empresa', plural: 'empresas', gender: 'fem', count: 'singular' },
      ja: { base: '会社', count: 'singular', reading: 'かいしゃ' },
      pt: { base: 'empresa', plural: 'empresas', gender: 'fem', count: 'singular' },
    },
  },
  // ── P09-E24's teams, institutions and business (localization B77) ──
  {
    // P08's collective, seeded ahead of it under the GROUP P08 proposes; its `member` relation ("a
    // team of players") is P08's own work. Japanese PLAY_GAME is 遊ぶ, a child's play, which PLAY_GAME's
    // own gloss says too.
    id: 'TEAM',
    role: 'noun',
    description: 'a group of people who play or work together',
    definition: `
      /subj ( GROUP /a /rel #2.subj )
      /subj ( GROUP ) /verb ( PLAY_GAME )
    `,
    emoji: '🏅',
    isA: 'GROUP',
    forms: {
      en: { base: 'team', plural: 'teams', count: 'singular' },
      it: { base: 'squadra', plural: 'squadre', gender: 'fem', count: 'singular' },
      fr: { base: 'équipe', plural: 'équipes', gender: 'fem', count: 'singular' },
      de: { base: 'Mannschaft', plural: 'Mannschaften', gender: 'fem', count: 'singular' },
      es: { base: 'equipo', plural: 'equipos', gender: 'masc', count: 'singular' },
      ja: { base: 'チーム', count: 'singular' },
      pt: { base: 'equipe', plural: 'equipes', gender: 'fem', count: 'singular' },
    },
  },
  {
    // P08's collective, as TEAM is. SYSTEM's shape, "a group of parts that works": the relative
    // agrees with GROUP, so the whole lives in one place.
    id: 'COMMUNITY',
    role: 'noun',
    description: 'the people who live in one place, taken together',
    definition: `
      /subj ( GROUP /a /poss [ PERSON /pl /zero ] /parts /rel #2.subj )
      /subj ( GROUP ) /verb ( LIVE ) /loc ( PLACE /adj SAME )
    `,
    emoji: '🏘️',
    isA: 'GROUP',
    forms: {
      en: { base: 'community', plural: 'communities', count: 'singular' },
      // Italian comunità is invariable, as every -tà noun is.
      it: { base: 'comunità', plural: 'comunità', gender: 'fem', count: 'singular' },
      fr: { base: 'communauté', plural: 'communautés', gender: 'fem', count: 'singular' },
      de: { base: 'Gemeinschaft', plural: 'Gemeinschaften', gender: 'fem', count: 'singular' },
      es: { base: 'comunidad', plural: 'comunidades', gender: 'fem', count: 'singular' },
      ja: { base: '共同体', count: 'singular', reading: 'きょうどうたい' },
      pt: { base: 'comunidade', plural: 'comunidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    // SCHOOL's locative gap with a subject of its own: "a school where adult people learn". The
    // indefinite plural, as WAR's, keeps French des.
    id: 'UNIVERSITY',
    role: 'noun',
    description: 'a school of higher learning for adults',
    definition: `
      /subj ( SCHOOL /a /rel #2.loc )
      /subj ( PERSON /adj ADULT /pl /a ) /verb ( LEARN ) /loc ( SCHOOL )
    `,
    emoji: '🎓',
    isA: 'SCHOOL',
    forms: {
      en: { base: 'university', plural: 'universities', count: 'singular' },
      it: { base: 'università', plural: 'università', gender: 'fem', count: 'singular' },
      fr: { base: 'université', plural: 'universités', gender: 'fem', count: 'singular' },
      de: { base: 'Universität', plural: 'Universitäten', gender: 'fem', count: 'singular' },
      es: { base: 'universidad', plural: 'universidades', gender: 'fem', count: 'singular' },
      ja: { base: '大学', count: 'singular', reading: 'だいがく' },
      pt: { base: 'universidade', plural: 'universidades', gender: 'fem', count: 'singular' },
    },
  },
  {
    // Work done for others; the religious and military senses (funzione, office, Gottesdienst) are
    // not this concept. German Dienst, not the loan Service a customer desk says.
    id: 'SERVICE',
    role: 'noun',
    description: 'work done for other people',
    definition: `
      /subj ( WORK_NOUN /zero /rel #2.obj )
      /subj ( one ) /verb ( DO ) /obj ( WORK_NOUN ) /for ( PERSON /adj OTHER /pl /zero )
    `,
    emoji: '🛎️',
    forms: {
      en: { base: 'service', plural: 'services', count: 'singular' },
      it: { base: 'servizio', plural: 'servizi', gender: 'masc', count: 'singular' },
      fr: { base: 'service', plural: 'services', gender: 'masc', count: 'singular' },
      de: { base: 'Dienst', plural: 'Dienste', gender: 'masc', count: 'singular' },
      es: { base: 'servicio', plural: 'servicios', gender: 'masc', count: 'singular' },
      ja: { base: 'サービス', count: 'singular' },
      pt: { base: 'serviço', plural: 'serviços', gender: 'masc', count: 'singular' },
    },
  },
  {
    // Commerce, the activity; the firm is COMPANY_BUSINESS. A mass noun in its singular word
    // (commercio, commerce, Handel): the plural affari, affaires, negocios and negócios are the
    // colloquial words and render since P09-E41, but they are "dealings", not the trade itself.
    id: 'BUSINESS',
    role: 'noun',
    description: 'the buying and selling of goods and services',
    definition: `
      /subj ( WORK_NOUN /zero /rel #2.inst )
      /subj ( one ) /verb ( TRADE )
    `,
    emoji: '💹',
    countable: false,
    synonym: 'commerce',
    forms: {
      en: { base: 'business', count: 'singular' },
      it: { base: 'commercio', gender: 'masc', count: 'singular' },
      fr: { base: 'commerce', gender: 'masc', count: 'singular' },
      de: { base: 'Handel', gender: 'masc', count: 'singular', compound: 'Handels' },
      es: { base: 'comercio', gender: 'masc', count: 'singular' },
      ja: { base: 'ビジネス', count: 'singular' },
      pt: { base: 'comércio', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The polity half of P09's "state"; the condition is STATE. Italian, French, Spanish and
    // Portuguese say both with one word and write the polity with a capital (Stato, État, Estado),
    // which is what tells the two apart in writing. Not its people (NATION), its land (COUNTRY) or
    // its government: "a system that governs a country", on B65's SYSTEM.
    id: 'STATE_NATION',
    role: 'noun',
    description: 'a country considered as a political body with its own government',
    definition: `
      /subj ( SYSTEM /a /rel #2.subj )
      /subj ( SYSTEM ) /verb ( GOVERN_STATE ) /obj ( COUNTRY /a )
    `,
    emoji: '🏛️',
    synonym: 'polity',
    forms: {
      en: { base: 'state', plural: 'states', count: 'singular' },
      it: { base: 'Stato', plural: 'Stati', gender: 'masc', count: 'singular' },
      fr: { base: 'État', plural: 'États', gender: 'masc', count: 'singular' },
      de: { base: 'Staat', plural: 'Staaten', gender: 'masc', count: 'singular', compound: 'Staats' },
      es: { base: 'Estado', plural: 'Estados', gender: 'masc', count: 'singular' },
      ja: { base: '国家', count: 'singular', reading: 'こっか' },
      pt: { base: 'Estado', plural: 'Estados', gender: 'masc', count: 'singular' },
    },
  },
  // ── P09-E24's government and the law (localization B76) ────────────
  {
    // Authority over people and events, not the electrical current (corrente, courant, Strom, 電力),
    // which is another concept. "An ability with which one governs": ABILITY is the genus, and the
    // instrument gap says what the ability is for.
    id: 'POWER',
    role: 'noun',
    description: 'the authority to direct people and events',
    definition: `
      /subj ( ABILITY /a /rel #2.inst )
      /subj ( one ) /verb ( GOVERN_STATE )
    `,
    emoji: '👑',
    synonym: 'authority',
    forms: {
      en: { base: 'power', plural: 'powers', count: 'singular' },
      it: { base: 'potere', plural: 'poteri', gender: 'masc', count: 'singular' },
      fr: { base: 'pouvoir', plural: 'pouvoirs', gender: 'masc', count: 'singular' },
      de: { base: 'Macht', plural: 'Mächte', gender: 'fem', count: 'singular' },
      es: { base: 'poder', plural: 'poderes', gender: 'masc', count: 'singular' },
      ja: { base: '権力', count: 'singular', reading: 'けんりょく' },
      pt: { base: 'poder', plural: 'poderes', gender: 'masc', count: 'singular' },
    },
  },
  {
    // P08's collective, seeded ahead of it under the GROUP P08 proposes. The group, where
    // STATE_NATION is the system it governs: "a group that governs a state".
    id: 'GOVERNMENT',
    role: 'noun',
    description: 'the group of people who govern a state',
    definition: `
      /subj ( GROUP /a /rel #2.subj )
      /subj ( GROUP ) /verb ( GOVERN_STATE ) /obj ( STATE_NATION /a )
    `,
    emoji: '🏛️',
    isA: 'GROUP',
    forms: {
      en: { base: 'government', plural: 'governments', count: 'singular' },
      it: { base: 'governo', plural: 'governi', gender: 'masc', count: 'singular' },
      fr: { base: 'gouvernement', plural: 'gouvernements', gender: 'masc', count: 'singular' },
      de: { base: 'Regierung', plural: 'Regierungen', gender: 'fem', count: 'singular' },
      es: { base: 'gobierno', plural: 'gobiernos', gender: 'masc', count: 'singular' },
      ja: { base: '政府', count: 'singular', reading: 'せいふ' },
      pt: { base: 'governo', plural: 'governos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The political party; the celebration is PARTY_CELEBRATION (festa, fête, Fest), which shares
    // only the English word. POWER is the bare mass object: "a group that desires power".
    id: 'PARTY_POLITICAL',
    role: 'noun',
    description: 'an organized group that seeks political power',
    definition: `
      /subj ( GROUP /a /rel #2.subj )
      /subj ( GROUP ) /verb ( DESIRE ) /obj ( POWER /zero )
    `,
    emoji: '🗳️',
    isA: 'GROUP',
    synonym: 'political',
    forms: {
      en: { base: 'party', plural: 'parties', count: 'singular' },
      it: { base: 'partito', plural: 'partiti', gender: 'masc', count: 'singular' },
      fr: { base: 'parti', plural: 'partis', gender: 'masc', count: 'singular' },
      de: { base: 'Partei', plural: 'Parteien', gender: 'fem', count: 'singular' },
      es: { base: 'partido', plural: 'partidos', gender: 'masc', count: 'singular' },
      ja: { base: '政党', count: 'singular', reading: 'せいとう' },
      pt: { base: 'partido', plural: 'partidos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // One statute. The field of law (diritto, droit, Recht) is RIGHT_NOUN's word in five languages
    // and has no concept yet. WRITE, not GIVE: GIVE's Japanese is the benefactive あげる, and a state
    // does not *ageru* a law (国家が書く指示, not 国家があげる指示).
    id: 'LAW',
    role: 'noun',
    description: 'a rule a state makes that everyone must follow',
    definition: `
      /subj ( INSTRUCTION /a /rel #2.obj )
      /subj ( STATE_NATION /a ) /verb ( WRITE ) /obj ( INSTRUCTION )
    `,
    emoji: '📜',
    forms: {
      en: { base: 'law', plural: 'laws', count: 'singular' },
      it: { base: 'legge', plural: 'leggi', gender: 'fem', count: 'singular' },
      fr: { base: 'loi', plural: 'lois', gender: 'fem', count: 'singular' },
      de: { base: 'Gesetz', plural: 'Gesetze', gender: 'neut', count: 'singular', compound: 'Gesetzes' },
      es: { base: 'ley', plural: 'leyes', gender: 'fem', count: 'singular' },
      ja: { base: '法律', count: 'singular', reading: 'ほうりつ' },
      pt: { base: 'lei', plural: 'leis', gender: 'fem', count: 'singular' },
    },
  },
  {
    // The law court, not the sports court (campo, terrain, Platz, cancha, コート, quadra).
    id: 'COURT_LAW',
    role: 'noun',
    description: 'the body that judges cases under the law',
    definition: `
      /subj ( GROUP /a /rel #2.subj )
      /subj ( GROUP ) /verb ( APPLY ) /obj ( LAW /pl )
    `,
    emoji: '⚖️',
    synonym: 'of law',
    forms: {
      en: { base: 'court', plural: 'courts', count: 'singular' },
      it: { base: 'tribunale', plural: 'tribunali', gender: 'masc', count: 'singular' },
      fr: { base: 'tribunal', plural: 'tribunaux', gender: 'masc', count: 'singular' },
      de: { base: 'Gericht', plural: 'Gerichte', gender: 'neut', count: 'singular', compound: 'Gerichts' },
      es: { base: 'tribunal', plural: 'tribunales', gender: 'masc', count: 'singular' },
      ja: { base: '裁判所', count: 'singular', reading: 'さいばんしょ' },
      pt: { base: 'tribunal', plural: 'tribunais', gender: 'masc', count: 'singular' },
    },
  },
  {
    // The entitlement. French droit, Spanish derecho and Portuguese direito are also RIGHT_SIDE's
    // adjective, which the synonym tells apart in the picker: "right (entitlement)".
    id: 'RIGHT_NOUN',
    role: 'noun',
    description: 'what one is allowed to do or have',
    definition: `
      /subj ( ACTION /a /rel #2.obj )
      /subj ( one ) /verb ( DO /modal MAY ) /obj ( ACTION )
    `,
    emoji: '✊',
    synonym: 'entitlement',
    forms: {
      en: { base: 'right', plural: 'rights', count: 'singular' },
      it: { base: 'diritto', plural: 'diritti', gender: 'masc', count: 'singular' },
      fr: { base: 'droit', plural: 'droits', gender: 'masc', count: 'singular' },
      de: { base: 'Recht', plural: 'Rechte', gender: 'neut', count: 'singular', compound: 'Rechts' },
      es: { base: 'derecho', plural: 'derechos', gender: 'masc', count: 'singular' },
      ja: { base: '権利', count: 'singular', reading: 'けんり' },
      pt: { base: 'direito', plural: 'direitos', gender: 'masc', count: 'singular' },
    },
  },
  {
    // "A period where nations kill": the locative gap on PERIOD_TIME. The subject is the
    // indefinite plural, not the bare one, which French would write without its des.
    id: 'WAR',
    role: 'noun',
    description: 'armed fighting between nations',
    definition: `
      /subj ( PERIOD_TIME /a /rel #2.loc )
      /subj ( NATION /pl /a ) /verb ( KILL ) /loc ( PERIOD_TIME )
    `,
    emoji: '⚔️',
    forms: {
      en: { base: 'war', plural: 'wars', count: 'singular' },
      it: { base: 'guerra', plural: 'guerre', gender: 'fem', count: 'singular' },
      fr: { base: 'guerre', plural: 'guerres', gender: 'fem', count: 'singular' },
      de: { base: 'Krieg', plural: 'Kriege', gender: 'masc', count: 'singular', compound: 'Kriegs' },
      es: { base: 'guerra', plural: 'guerras', gender: 'fem', count: 'singular' },
      ja: { base: '戦争', count: 'singular', reading: 'せんそう' },
      pt: { base: 'guerra', plural: 'guerras', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "The place that includes all countries": definite, since there is one, and true of nothing
    // smaller — a continent includes only some. A PLACE, as COUNTRY and CONTINENT are.
    id: 'WORLD',
    role: 'noun',
    description: 'the earth, with all its countries and peoples',
    definition: `
      /subj ( PLACE /rel #2.subj )
      /subj ( PLACE ) /verb ( INCLUDE ) /obj ( COUNTRY /pl /all )
    `,
    emoji: '🌍',
    isA: 'PLACE',
    forms: {
      en: { base: 'world', plural: 'worlds', count: 'singular' },
      it: { base: 'mondo', plural: 'mondi', gender: 'masc', count: 'singular' },
      fr: { base: 'monde', plural: 'mondes', gender: 'masc', count: 'singular' },
      de: { base: 'Welt', plural: 'Welten', gender: 'fem', count: 'singular' },
      es: { base: 'mundo', plural: 'mundos', gender: 'masc', count: 'singular' },
      ja: { base: '世界', count: 'singular', reading: 'せかい' },
      pt: { base: 'mundo', plural: 'mundos', gender: 'masc', count: 'singular' },
    },
  },
  // ── The interface nouns' own words (localization B57) ──────────────
  {
    id: 'PICTURE',
    role: 'noun',
    description: 'a likeness of a thing, drawn or shown',
    emoji: '🖼️',
    forms: {
      en: { base: 'picture', plural: 'pictures', count: 'singular' },
      it: { base: 'immagine', plural: 'immagini', gender: 'fem', count: 'singular' },
      fr: { base: 'image', plural: 'images', gender: 'fem', count: 'singular' },
      de: { base: 'Bild', plural: 'Bilder', gender: 'neut', count: 'singular' },
      es: { base: 'imagen', plural: 'imágenes', gender: 'fem', count: 'singular' },
      ja: { base: '画像', count: 'singular', reading: 'がぞう' },
      pt: { base: 'imagem', plural: 'imagens', gender: 'fem', count: 'singular' },
    },
  },
  {
    // "An object that shows pictures" (localization C26). INTERFACE, the screen one sees, took SEE,
    // the differentia a screen would first reach for; SHOW is no child's.
    id: 'SCREEN',
    role: 'noun',
    description: 'the lit surface a program shows itself on',
    definition: `
      /subj ( OBJECT_THING /a /rel #2.subj )
      /subj ( OBJECT_THING ) /verb ( SHOW ) /obj ( PICTURE /pl /zero )
    `,
    emoji: '🖥️',
    forms: {
      en: { base: 'screen', plural: 'screens', count: 'singular' },
      it: { base: 'schermo', plural: 'schermi', gender: 'masc', count: 'singular' },
      fr: { base: 'écran', plural: 'écrans', gender: 'masc', count: 'singular' },
      de: { base: 'Bildschirm', plural: 'Bildschirme', gender: 'masc', count: 'singular' },
      es: { base: 'pantalla', plural: 'pantallas', gender: 'fem', count: 'singular' },
      ja: { base: '画面', count: 'singular', reading: 'がめん' },
      pt: { base: 'tela', plural: 'telas', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'PART',
    role: 'noun',
    description: 'one of the pieces a whole is made of',
    emoji: '🧩',
    forms: {
      en: { base: 'part', plural: 'parts', count: 'singular' },
      it: { base: 'parte', plural: 'parti', gender: 'fem', count: 'singular' },
      fr: { base: 'partie', plural: 'parties', gender: 'fem', count: 'singular' },
      de: { base: 'Teil', plural: 'Teile', gender: 'masc', count: 'singular' },
      es: { base: 'parte', plural: 'partes', gender: 'fem', count: 'singular' },
      ja: { base: '部分', count: 'singular', reading: 'ぶぶん' },
      pt: { base: 'parte', plural: 'partes', gender: 'fem', count: 'singular' },
    },
  },
];
