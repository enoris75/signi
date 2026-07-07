import { getDb } from './db.js';
import { clearLexiconCache } from './lexicon.js';

const db = getDb();

interface ConceptSeed {
  id: string;
  role: string;
  description: string;
  emoji?: string;
  transitivity?: string; // only for verbs
  complements?: string[]; // ComplementType list a verb licenses (motion/locative)
  animate?: boolean; // referent is animate (human/animal) — affects motion-goal adposition
  countable?: boolean; // false for mass/uncountable nouns (water, food) — changes quantifier words
  synonym?: string; // short disambiguating gloss shown in parentheses in the picker (e.g. 'weep' for CRY)
  forms: Record<string, Record<string, string>>; // language -> form_key -> value
}

const concepts: ConceptSeed[] = [
  // ── PRONOUNS ────────────────────────────────────────────────────
  // Three concepts (1st / 2nd / 3rd person). Number and gender are
  // selected at phrase-build time via UI toggles; only the singular
  // base form is stored as `number` in the DB. Extra forms are kept
  // as form_key rows so the translator can synthesise the right surface.
  {
    id: 'FIRST_PERSON',
    role: 'pronoun',
    description: '1st Person',
    emoji: '🧍',
    forms: {
      // disjunctive = tonic/oblique form used after a preposition ("because of me/us").
      en: { base: 'I',        person: '1', number: 'singular', plural: 'we',  disjunctive: 'me',   disjunctive_plural: 'us' },
      it: { base: 'io',       person: '1', number: 'singular', plural: 'noi', disjunctive: 'me',   disjunctive_plural: 'noi' },
      fr: { base: 'je',       person: '1', number: 'singular', plural: 'nous', disjunctive: 'moi', disjunctive_plural: 'nous' },
      de: { base: 'ich',      person: '1', number: 'singular', plural: 'wir', disjunctive: 'mir',  disjunctive_plural: 'uns' },
      es: { base: 'yo',       person: '1', number: 'singular', plural: 'nosotros', disjunctive: 'mí', disjunctive_plural: 'nosotros' },
      ja: { base: '私',       person: '1', number: 'singular', plural: '私たち', reading: 'わたし', plural_reading: 'わたしたち' },
      pt: { base: 'eu',       person: '1', number: 'singular', plural: 'nós', disjunctive: 'mim',  disjunctive_plural: 'nós' },
    },
  },
  {
    id: 'SECOND_PERSON',
    role: 'pronoun',
    description: '2nd Person',
    emoji: '👉',
    forms: {
      en: { base: 'you',      person: '2', number: 'singular', plural: 'you',  disjunctive: 'you', disjunctive_plural: 'you' },
      it: { base: 'tu',       person: '2', number: 'singular', plural: 'voi',  disjunctive: 'te',  disjunctive_plural: 'voi' },
      fr: { base: 'tu',       person: '2', number: 'singular', plural: 'vous', disjunctive: 'toi', disjunctive_plural: 'vous' },
      de: { base: 'du',       person: '2', number: 'singular', plural: 'ihr',  disjunctive: 'dir', disjunctive_plural: 'euch' },
      es: { base: 'tú',       person: '2', number: 'singular', plural: 'vosotros', disjunctive: 'ti', disjunctive_plural: 'vosotros' },
      ja: { base: 'あなた',   person: '2', number: 'singular', plural: 'あなたたち' },
      pt: { base: 'você',     person: '2', number: 'singular', plural: 'vocês', disjunctive: 'você', disjunctive_plural: 'vocês' },
    },
  },
  {
    id: 'THIRD_PERSON',
    role: 'pronoun',
    description: '3rd Person',
    emoji: '👤',
    forms: {
      // base = default masc singular; singular_fem and plural stored as extra forms
      en: { base: 'he',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'she',    plural: 'they',  disjunctive: 'him', disjunctive_fem: 'her',  disjunctive_plural: 'them' },
      it: { base: 'lui',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'lei',    plural: 'loro',  disjunctive: 'lui', disjunctive_fem: 'lei',  disjunctive_plural: 'loro' },
      fr: { base: 'il',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'elle',   plural: 'ils',   disjunctive: 'lui', disjunctive_fem: 'elle', disjunctive_plural: 'eux' },
      de: { base: 'er',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'sie',    plural: 'sie',   disjunctive: 'ihm', disjunctive_fem: 'ihr',  disjunctive_plural: 'ihnen' },
      es: { base: 'él',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella',   plural: 'ellos', disjunctive: 'él',  disjunctive_fem: 'ella', disjunctive_plural: 'ellos' },
      ja: { base: '彼',   person: '3', number: 'singular', gender: 'masc', singular_fem: '彼女',   plural: '彼ら', reading: 'かれ', singular_fem_reading: 'かのじょ', plural_reading: 'かれら' },
      pt: { base: 'ele',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'ela',    plural: 'eles',  disjunctive: 'ele', disjunctive_fem: 'ela',  disjunctive_plural: 'eles' },
    },
  },

  // ── NOUNS ────────────────────────────────────────────────────────
  {
    id: 'CAT',
    role: 'noun',
    description: 'domestic feline animal',
    emoji: '🐱',
    animate: true,
    forms: {
      en: { base: 'cat',   plural: 'cats',   count: 'singular' },
      it: { base: 'gatto', plural: 'gatti',  gender: 'masc', count: 'singular', fem: 'gatta',   fem_plural: 'gatte' },
      fr: { base: 'chat',  plural: 'chats',  gender: 'masc', count: 'singular', fem: 'chatte',  fem_plural: 'chattes' },
      de: { base: 'Kater', plural: 'Kater',  gender: 'masc', count: 'singular', fem: 'Katze',   fem_plural: 'Katzen' },
      es: { base: 'gato',  plural: 'gatos',  gender: 'masc', count: 'singular', fem: 'gata',    fem_plural: 'gatas' },
      ja: { base: '猫',   count: 'singular', reading: 'ねこ' },
      pt: { base: 'gato',  plural: 'gatos',  gender: 'masc', count: 'singular', fem: 'gata',    fem_plural: 'gatas' },
    },
  },
  {
    id: 'DOG',
    role: 'noun',
    description: 'domestic canine animal',
    emoji: '🐶',
    animate: true,
    forms: {
      en: { base: 'dog',    plural: 'dogs',   count: 'singular' },
      it: { base: 'cane',   plural: 'cani',   gender: 'masc', count: 'singular', fem: 'cagna',   fem_plural: 'cagne' },
      fr: { base: 'chien',  plural: 'chiens', gender: 'masc', count: 'singular', fem: 'chienne', fem_plural: 'chiennes' },
      de: { base: 'Hund',   plural: 'Hunde',  gender: 'masc', count: 'singular', fem: 'Hündin',  fem_plural: 'Hündinnen' },
      es: { base: 'perro',  plural: 'perros', gender: 'masc', count: 'singular', fem: 'perra',   fem_plural: 'perras' },
      ja: { base: '犬',    count: 'singular', reading: 'いぬ' },
      pt: { base: 'cão',    plural: 'cães',   gender: 'masc', count: 'singular', fem: 'cadela',  fem_plural: 'cadelas' },
    },
  },
  {
    id: 'BOOK',
    role: 'noun',
    description: 'a written or printed work',
    emoji: '📚',
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
    forms: {
      en: { base: 'water', count: 'singular' },
      it: { base: 'acqua', gender: 'fem', count: 'singular' },
      fr: { base: 'eau', gender: 'fem', count: 'singular' },
      de: { base: 'Wasser', gender: 'neut', count: 'singular' },
      es: { base: 'agua', gender: 'masc', count: 'singular' }, // special: uses "el" even though feminine
      ja: { base: '水', count: 'singular', reading: 'みず' },
      pt: { base: 'água', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'FOOD',
    role: 'noun',
    description: 'nourishment, something to eat',
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
    id: 'HOUSE',
    role: 'noun',
    description: 'a building used as a dwelling',
    emoji: '🏠',
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
    emoji: '🏡',
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
    emoji: '👦',
    animate: true,
    forms: {
      en: { base: 'child',    plural: 'children', count: 'singular' },
      it: { base: 'bambino',  plural: 'bambini',  gender: 'masc', count: 'singular', fem: 'bambina',  fem_plural: 'bambine' },
      fr: { base: 'enfant',   plural: 'enfants',  gender: 'masc', count: 'singular', fem: 'enfant',   fem_plural: 'enfants' },
      de: { base: 'Kind',     plural: 'Kinder',   gender: 'neut', count: 'singular' },
      es: { base: 'niño',     plural: 'niños',    gender: 'masc', count: 'singular', fem: 'niña',     fem_plural: 'niñas' },
      ja: { base: '子供',    count: 'singular', reading: 'こども' },
      pt: { base: 'criança',  plural: 'crianças', gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'FOX',
    role: 'noun',
    description: 'a carnivorous mammal with reddish fur',
    emoji: '🦊',
    animate: true,
    forms: {
      en: { base: 'fox',     plural: 'foxes',   count: 'singular' },
      it: { base: 'volpe',   plural: 'volpi',   gender: 'fem', count: 'singular' },
      fr: { base: 'renard',  plural: 'renards', gender: 'masc', count: 'singular' },
      de: { base: 'Fuchs',   plural: 'Füchse',  gender: 'masc', count: 'singular' },
      es: { base: 'zorro',   plural: 'zorros',  gender: 'masc', count: 'singular', fem: 'zorra',   fem_plural: 'zorras' },
      ja: { base: 'キツネ',  count: 'singular' },
      pt: { base: 'raposa',  plural: 'raposas', gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'BOY',
    role: 'noun',
    description: 'a young male human',
    emoji: '👦',
    animate: true,
    forms: {
      en: { base: 'boy',      plural: 'boys',     count: 'singular' },
      it: { base: 'ragazzo',  plural: 'ragazzi',  gender: 'masc', count: 'singular' },
      fr: { base: 'garçon',   plural: 'garçons',  gender: 'masc', count: 'singular' },
      de: { base: 'Junge',    plural: 'Jungen',   gender: 'masc', count: 'singular' },
      es: { base: 'niño',     plural: 'niños',    gender: 'masc', count: 'singular' },
      ja: { base: '男の子',   count: 'singular', reading: 'おとこのこ' },
      pt: { base: 'menino',   plural: 'meninos',  gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WOLF',
    role: 'noun',
    description: 'a wild canine animal',
    emoji: '🐺',
    animate: true,
    forms: {
      en: { base: 'wolf',   plural: 'wolves', count: 'singular' },
      it: { base: 'lupo',   plural: 'lupi',   gender: 'masc', count: 'singular', fem: 'lupa',    fem_plural: 'lupe' },
      fr: { base: 'loup',   plural: 'loups',  gender: 'masc', count: 'singular', fem: 'louve',   fem_plural: 'louves' },
      de: { base: 'Wolf',   plural: 'Wölfe',  gender: 'masc', count: 'singular', fem: 'Wölfin',  fem_plural: 'Wölfinnen' },
      es: { base: 'lobo',   plural: 'lobos',  gender: 'masc', count: 'singular', fem: 'loba',    fem_plural: 'lobas' },
      ja: { base: '狼',    count: 'singular', reading: 'おおかみ' },
      pt: { base: 'lobo',   plural: 'lobos',  gender: 'masc', count: 'singular', fem: 'loba',    fem_plural: 'lobas' },
    },
  },
  {
    id: 'ANGEL',
    role: 'noun',
    description: 'a spiritual being; a messenger of God',
    emoji: '👼',
    animate: true,
    forms: {
      en: { base: 'angel',   plural: 'angels',  count: 'singular' },
      it: { base: 'angelo',  plural: 'angeli',  gender: 'masc', count: 'singular' },
      fr: { base: 'ange',    plural: 'anges',   gender: 'masc', count: 'singular' },
      de: { base: 'Engel',   plural: 'Engel',   gender: 'masc', count: 'singular' },
      es: { base: 'ángel',   plural: 'ángeles', gender: 'masc', count: 'singular' },
      ja: { base: '天使',    count: 'singular', reading: 'てんし' },
      pt: { base: 'anjo',    plural: 'anjos',   gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'DEATH',
    role: 'noun',
    description: 'the end of life; the state of being dead',
    emoji: '💀',
    forms: {
      en: { base: 'death',  plural: 'deaths',  count: 'singular' },
      it: { base: 'morte',  plural: 'morti',   gender: 'fem', count: 'singular' },
      fr: { base: 'mort',   plural: 'morts',   gender: 'fem', count: 'singular' },
      de: { base: 'Tod',    plural: 'Tode',    gender: 'masc', count: 'singular' },
      es: { base: 'muerte', plural: 'muertes', gender: 'fem', count: 'singular' },
      ja: { base: '死',    count: 'singular', reading: 'し' },
      pt: { base: 'morte',  plural: 'mortes',  gender: 'fem', count: 'singular' },
    },
  },

  // ── VERBS ────────────────────────────────────────────────────────
  {
    id: 'EAT',
    role: 'verb',
    transitivity: 'transitive',
    description: 'to consume food',
    emoji: '🍴',
    forms: {
      en: {
        base: 'eat',
        '1sg_present': 'eat', '2sg_present': 'eat', '3sg_present': 'eats',
        '1pl_present': 'eat', '2pl_present': 'eat', '3pl_present': 'eat',
        past: 'ate',
      },
      it: {
        base: 'mangiare',
        '1sg_present': 'mangio', '2sg_present': 'mangi', '3sg_present': 'mangia',
        '1pl_present': 'mangiamo', '2pl_present': 'mangiate', '3pl_present': 'mangiano',
        '1sg_past': 'mangiai', '2sg_past': 'mangiasti', '3sg_past': 'mangiò',
        '1pl_past': 'mangiammo', '2pl_past': 'mangiaste', '3pl_past': 'mangiarono',
        '1sg_future': 'mangerò', '2sg_future': 'mangerai', '3sg_future': 'mangerà',
        '1pl_future': 'mangeremo', '2pl_future': 'mangerete', '3pl_future': 'mangeranno',
      },
      fr: {
        base: 'manger',
        '1sg_present': 'mange', '2sg_present': 'manges', '3sg_present': 'mange',
        '1pl_present': 'mangeons', '2pl_present': 'mangez', '3pl_present': 'mangent',
        '1sg_past': 'mangeai', '2sg_past': 'mangeas', '3sg_past': 'mangea',
        '1pl_past': 'mangeâmes', '2pl_past': 'mangeâtes', '3pl_past': 'mangèrent',
        '1sg_future': 'mangerai', '2sg_future': 'mangeras', '3sg_future': 'mangera',
        '1pl_future': 'mangerons', '2pl_future': 'mangerez', '3pl_future': 'mangeront',
      },
      de: {
        base: 'essen',
        '1sg_present': 'esse', '2sg_present': 'isst', '3sg_present': 'isst',
        '1pl_present': 'essen', '2pl_present': 'esst', '3pl_present': 'essen',
        '1sg_past': 'aß', '2sg_past': 'aßest', '3sg_past': 'aß',
        '1pl_past': 'aßen', '2pl_past': 'aßt', '3pl_past': 'aßen',
      },
      es: {
        base: 'comer',
        '1sg_present': 'como', '2sg_present': 'comes', '3sg_present': 'come',
        '1pl_present': 'comemos', '2pl_present': 'coméis', '3pl_present': 'comen',
        '1sg_past': 'comí', '2sg_past': 'comiste', '3sg_past': 'comió',
        '1pl_past': 'comimos', '2pl_past': 'comisteis', '3pl_past': 'comieron',
        '1sg_future': 'comeré', '2sg_future': 'comerás', '3sg_future': 'comerá',
        '1pl_future': 'comeremos', '2pl_future': 'comeréis', '3pl_future': 'comerán',
      },
      ja: {
        base: '食べる',
        reading: 'たべる',
        masu_present: '食べます',
        masu_present_reading: 'たべます',
      },
      pt: {
        base: 'comer',
        '1sg_present': 'como', '2sg_present': 'come', '3sg_present': 'come',
        '1pl_present': 'comemos', '2pl_present': 'comem', '3pl_present': 'comem',
        '1sg_past': 'comi', '2sg_past': 'comeu', '3sg_past': 'comeu',
        '1pl_past': 'comemos', '2pl_past': 'comeram', '3pl_past': 'comeram',
        '1sg_future': 'comerei', '2sg_future': 'comerá', '3sg_future': 'comerá',
        '1pl_future': 'comeremos', '2pl_future': 'comerão', '3pl_future': 'comerão',
      },
    },
  },
  {
    id: 'DRINK',
    role: 'verb',
    transitivity: 'transitive',
    description: 'to consume liquid',
    emoji: '🥤',
    forms: {
      en: {
        base: 'drink',
        '1sg_present': 'drink', '2sg_present': 'drink', '3sg_present': 'drinks',
        '1pl_present': 'drink', '2pl_present': 'drink', '3pl_present': 'drink',
        past: 'drank',
      },
      it: {
        base: 'bere',
        '1sg_present': 'bevo', '2sg_present': 'bevi', '3sg_present': 'beve',
        '1pl_present': 'beviamo', '2pl_present': 'bevete', '3pl_present': 'bevono',
        '1sg_past': 'bevvi', '2sg_past': 'bevesti', '3sg_past': 'bevve',
        '1pl_past': 'bevemmo', '2pl_past': 'beveste', '3pl_past': 'bevvero',
        '1sg_future': 'berrò', '2sg_future': 'berrai', '3sg_future': 'berrà',
        '1pl_future': 'berremo', '2pl_future': 'berrete', '3pl_future': 'berranno',
      },
      fr: {
        base: 'boire',
        '1sg_present': 'bois', '2sg_present': 'bois', '3sg_present': 'boit',
        '1pl_present': 'buvons', '2pl_present': 'buvez', '3pl_present': 'boivent',
        '1sg_past': 'bus', '2sg_past': 'bus', '3sg_past': 'but',
        '1pl_past': 'bûmes', '2pl_past': 'bûtes', '3pl_past': 'burent',
        '1sg_future': 'boirai', '2sg_future': 'boiras', '3sg_future': 'boira',
        '1pl_future': 'boirons', '2pl_future': 'boirez', '3pl_future': 'boiront',
      },
      de: {
        base: 'trinken',
        '1sg_present': 'trinke', '2sg_present': 'trinkst', '3sg_present': 'trinkt',
        '1pl_present': 'trinken', '2pl_present': 'trinkt', '3pl_present': 'trinken',
        '1sg_past': 'trank', '2sg_past': 'trankst', '3sg_past': 'trank',
        '1pl_past': 'tranken', '2pl_past': 'trankt', '3pl_past': 'tranken',
      },
      es: {
        base: 'beber',
        '1sg_present': 'bebo', '2sg_present': 'bebes', '3sg_present': 'bebe',
        '1pl_present': 'bebemos', '2pl_present': 'bebéis', '3pl_present': 'beben',
        '1sg_past': 'bebí', '2sg_past': 'bebiste', '3sg_past': 'bebió',
        '1pl_past': 'bebimos', '2pl_past': 'bebisteis', '3pl_past': 'bebieron',
        '1sg_future': 'beberé', '2sg_future': 'beberás', '3sg_future': 'beberá',
        '1pl_future': 'beberemos', '2pl_future': 'beberéis', '3pl_future': 'beberán',
      },
      ja: {
        base: '飲む',
        reading: 'のむ',
        masu_present: '飲みます',
        masu_present_reading: 'のみます',
      },
      pt: {
        base: 'beber',
        '1sg_present': 'bebo', '2sg_present': 'bebe', '3sg_present': 'bebe',
        '1pl_present': 'bebemos', '2pl_present': 'bebem', '3pl_present': 'bebem',
        '1sg_past': 'bebi', '2sg_past': 'bebeu', '3sg_past': 'bebeu',
        '1pl_past': 'bebemos', '2pl_past': 'beberam', '3pl_past': 'beberam',
        '1sg_future': 'beberei', '2sg_future': 'beberá', '3sg_future': 'beberá',
        '1pl_future': 'beberemos', '2pl_future': 'beberão', '3pl_future': 'beberão',
      },
    },
  },
  {
    id: 'RUN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['locative', 'direction', 'source', 'route', 'cause'],
    description: 'to move quickly on foot',
    emoji: '🏃',
    forms: {
      en: {
        base: 'run',
        '1sg_present': 'run', '2sg_present': 'run', '3sg_present': 'runs',
        '1pl_present': 'run', '2pl_present': 'run', '3pl_present': 'run',
        past: 'ran',
      },
      it: {
        base: 'correre',
        '1sg_present': 'corro', '2sg_present': 'corri', '3sg_present': 'corre',
        '1pl_present': 'corriamo', '2pl_present': 'correte', '3pl_present': 'corrono',
        '1sg_past': 'corsi', '2sg_past': 'corresti', '3sg_past': 'corse',
        '1pl_past': 'corremmo', '2pl_past': 'correste', '3pl_past': 'corsero',
        '1sg_future': 'correrò', '2sg_future': 'correrai', '3sg_future': 'correrà',
        '1pl_future': 'correremo', '2pl_future': 'correrete', '3pl_future': 'correranno',
      },
      fr: {
        base: 'courir',
        '1sg_present': 'cours', '2sg_present': 'cours', '3sg_present': 'court',
        '1pl_present': 'courons', '2pl_present': 'courez', '3pl_present': 'courent',
        '1sg_past': 'courus', '2sg_past': 'courus', '3sg_past': 'courut',
        '1pl_past': 'courûmes', '2pl_past': 'courûtes', '3pl_past': 'coururent',
        '1sg_future': 'courrai', '2sg_future': 'courras', '3sg_future': 'courra',
        '1pl_future': 'courrons', '2pl_future': 'courrez', '3pl_future': 'courront',
      },
      de: {
        base: 'laufen',
        '1sg_present': 'laufe', '2sg_present': 'läufst', '3sg_present': 'läuft',
        '1pl_present': 'laufen', '2pl_present': 'lauft', '3pl_present': 'laufen',
        '1sg_past': 'lief', '2sg_past': 'liefst', '3sg_past': 'lief',
        '1pl_past': 'liefen', '2pl_past': 'lieft', '3pl_past': 'liefen',
      },
      es: {
        base: 'correr',
        '1sg_present': 'corro', '2sg_present': 'corres', '3sg_present': 'corre',
        '1pl_present': 'corremos', '2pl_present': 'corréis', '3pl_present': 'corren',
        '1sg_past': 'corrí', '2sg_past': 'corriste', '3sg_past': 'corrió',
        '1pl_past': 'corrimos', '2pl_past': 'corristeis', '3pl_past': 'corrieron',
        '1sg_future': 'correré', '2sg_future': 'correrás', '3sg_future': 'correrá',
        '1pl_future': 'correremos', '2pl_future': 'correréis', '3pl_future': 'correrán',
      },
      ja: {
        base: '走る',
        reading: 'はしる',
        masu_present: '走ります',
        masu_present_reading: 'はしります',
      },
      pt: {
        base: 'correr',
        '1sg_present': 'corro', '2sg_present': 'corre', '3sg_present': 'corre',
        '1pl_present': 'corremos', '2pl_present': 'correm', '3pl_present': 'correm',
        '1sg_past': 'corri', '2sg_past': 'correu', '3sg_past': 'correu',
        '1pl_past': 'corremos', '2pl_past': 'correram', '3pl_past': 'correram',
        '1sg_future': 'correrei', '2sg_future': 'correrá', '3sg_future': 'correrá',
        '1pl_future': 'correremos', '2pl_future': 'correrão', '3pl_future': 'correrão',
      },
    },
  },
  {
    id: 'SEE',
    role: 'verb',
    transitivity: 'transitive',
    description: 'to perceive with the eyes',
    emoji: '👁️',
    forms: {
      en: {
        base: 'see',
        '1sg_present': 'see', '2sg_present': 'see', '3sg_present': 'sees',
        '1pl_present': 'see', '2pl_present': 'see', '3pl_present': 'see',
        past: 'saw',
      },
      it: {
        base: 'vedere',
        '1sg_present': 'vedo', '2sg_present': 'vedi', '3sg_present': 'vede',
        '1pl_present': 'vediamo', '2pl_present': 'vedete', '3pl_present': 'vedono',
        '1sg_past': 'vidi', '2sg_past': 'vedesti', '3sg_past': 'vide',
        '1pl_past': 'vedemmo', '2pl_past': 'vedeste', '3pl_past': 'videro',
        '1sg_future': 'vedrò', '2sg_future': 'vedrai', '3sg_future': 'vedrà',
        '1pl_future': 'vedremo', '2pl_future': 'vedrete', '3pl_future': 'vedranno',
      },
      fr: {
        base: 'voir',
        '1sg_present': 'vois', '2sg_present': 'vois', '3sg_present': 'voit',
        '1pl_present': 'voyons', '2pl_present': 'voyez', '3pl_present': 'voient',
        '1sg_past': 'vis', '2sg_past': 'vis', '3sg_past': 'vit',
        '1pl_past': 'vîmes', '2pl_past': 'vîtes', '3pl_past': 'virent',
        '1sg_future': 'verrai', '2sg_future': 'verras', '3sg_future': 'verra',
        '1pl_future': 'verrons', '2pl_future': 'verrez', '3pl_future': 'verront',
      },
      de: {
        base: 'sehen',
        '1sg_present': 'sehe', '2sg_present': 'siehst', '3sg_present': 'sieht',
        '1pl_present': 'sehen', '2pl_present': 'seht', '3pl_present': 'sehen',
        '1sg_past': 'sah', '2sg_past': 'sahst', '3sg_past': 'sah',
        '1pl_past': 'sahen', '2pl_past': 'saht', '3pl_past': 'sahen',
      },
      es: {
        base: 'ver',
        '1sg_present': 'veo', '2sg_present': 'ves', '3sg_present': 've',
        '1pl_present': 'vemos', '2pl_present': 'veis', '3pl_present': 'ven',
        '1sg_past': 'vi', '2sg_past': 'viste', '3sg_past': 'vio',
        '1pl_past': 'vimos', '2pl_past': 'visteis', '3pl_past': 'vieron',
        '1sg_future': 'veré', '2sg_future': 'verás', '3sg_future': 'verá',
        '1pl_future': 'veremos', '2pl_future': 'veréis', '3pl_future': 'verán',
      },
      ja: {
        base: '見る',
        reading: 'みる',
        masu_present: '見ます',
        masu_present_reading: 'みます',
      },
      pt: {
        base: 'ver',
        '1sg_present': 'vejo', '2sg_present': 'vê', '3sg_present': 'vê',
        '1pl_present': 'vemos', '2pl_present': 'veem', '3pl_present': 'veem',
        '1sg_past': 'vi', '2sg_past': 'viu', '3sg_past': 'viu',
        '1pl_past': 'vimos', '2pl_past': 'viram', '3pl_past': 'viram',
        '1sg_future': 'verei', '2sg_future': 'verá', '3sg_future': 'verá',
        '1pl_future': 'veremos', '2pl_future': 'verão', '3pl_future': 'verão',
      },
    },
  },
  {
    id: 'LOVE',
    role: 'verb',
    transitivity: 'transitive',
    description: 'to feel deep affection',
    emoji: '❤️',
    forms: {
      en: {
        base: 'love',
        '1sg_present': 'love', '2sg_present': 'love', '3sg_present': 'loves',
        '1pl_present': 'love', '2pl_present': 'love', '3pl_present': 'love',
        past: 'loved',
      },
      it: {
        base: 'amare',
        '1sg_present': 'amo', '2sg_present': 'ami', '3sg_present': 'ama',
        '1pl_present': 'amiamo', '2pl_present': 'amate', '3pl_present': 'amano',
        '1sg_past': 'amai', '2sg_past': 'amasti', '3sg_past': 'amò',
        '1pl_past': 'amammo', '2pl_past': 'amaste', '3pl_past': 'amarono',
        '1sg_future': 'amerò', '2sg_future': 'amerai', '3sg_future': 'amerà',
        '1pl_future': 'ameremo', '2pl_future': 'amerete', '3pl_future': 'ameranno',
      },
      fr: {
        base: 'aimer',
        '1sg_present': 'aime', '2sg_present': 'aimes', '3sg_present': 'aime',
        '1pl_present': 'aimons', '2pl_present': 'aimez', '3pl_present': 'aiment',
        '1sg_past': 'aimai', '2sg_past': 'aimas', '3sg_past': 'aima',
        '1pl_past': 'aimâmes', '2pl_past': 'aimâtes', '3pl_past': 'aimèrent',
        '1sg_future': 'aimerai', '2sg_future': 'aimeras', '3sg_future': 'aimera',
        '1pl_future': 'aimerons', '2pl_future': 'aimerez', '3pl_future': 'aimeront',
      },
      de: {
        base: 'lieben',
        '1sg_present': 'liebe', '2sg_present': 'liebst', '3sg_present': 'liebt',
        '1pl_present': 'lieben', '2pl_present': 'liebt', '3pl_present': 'lieben',
        '1sg_past': 'liebte', '2sg_past': 'liebtest', '3sg_past': 'liebte',
        '1pl_past': 'liebten', '2pl_past': 'liebtet', '3pl_past': 'liebten',
      },
      es: {
        base: 'amar',
        '1sg_present': 'amo', '2sg_present': 'amas', '3sg_present': 'ama',
        '1pl_present': 'amamos', '2pl_present': 'amáis', '3pl_present': 'aman',
        '1sg_past': 'amé', '2sg_past': 'amaste', '3sg_past': 'amó',
        '1pl_past': 'amamos', '2pl_past': 'amasteis', '3pl_past': 'amaron',
        '1sg_future': 'amaré', '2sg_future': 'amarás', '3sg_future': 'amará',
        '1pl_future': 'amaremos', '2pl_future': 'amaréis', '3pl_future': 'amarán',
      },
      ja: {
        base: '愛する',
        reading: 'あいする',
        masu_present: '愛します',
        masu_present_reading: 'あいします',
      },
      pt: {
        base: 'amar',
        '1sg_present': 'amo', '2sg_present': 'ama', '3sg_present': 'ama',
        '1pl_present': 'amamos', '2pl_present': 'amam', '3pl_present': 'amam',
        '1sg_past': 'amei', '2sg_past': 'amou', '3sg_past': 'amou',
        '1pl_past': 'amamos', '2pl_past': 'amaram', '3pl_past': 'amaram',
        '1sg_future': 'amarei', '2sg_future': 'amará', '3sg_future': 'amará',
        '1pl_future': 'amaremos', '2pl_future': 'amarão', '3pl_future': 'amarão',
      },
    },
  },
  {
    id: 'KNOW',
    role: 'verb',
    transitivity: 'transitive',
    description: 'to have knowledge or understanding of',
    emoji: '🧠',
    forms: {
      en: {
        base: 'know',
        '1sg_present': 'know', '2sg_present': 'know', '3sg_present': 'knows',
        '1pl_present': 'know', '2pl_present': 'know', '3pl_present': 'know',
        past: 'knew',
      },
      it: {
        base: 'sapere',
        '1sg_present': 'so', '2sg_present': 'sai', '3sg_present': 'sa',
        '1pl_present': 'sappiamo', '2pl_present': 'sapete', '3pl_present': 'sanno',
        '1sg_past': 'seppi', '2sg_past': 'sapesti', '3sg_past': 'seppe',
        '1pl_past': 'sapemmo', '2pl_past': 'sapeste', '3pl_past': 'seppero',
        '1sg_future': 'saprò', '2sg_future': 'saprai', '3sg_future': 'saprà',
        '1pl_future': 'sapremo', '2pl_future': 'saprete', '3pl_future': 'sapranno',
      },
      fr: {
        base: 'savoir',
        '1sg_present': 'sais', '2sg_present': 'sais', '3sg_present': 'sait',
        '1pl_present': 'savons', '2pl_present': 'savez', '3pl_present': 'savent',
        '1sg_past': 'sus', '2sg_past': 'sus', '3sg_past': 'sut',
        '1pl_past': 'sûmes', '2pl_past': 'sûtes', '3pl_past': 'surent',
        '1sg_future': 'saurai', '2sg_future': 'sauras', '3sg_future': 'saura',
        '1pl_future': 'saurons', '2pl_future': 'saurez', '3pl_future': 'sauront',
      },
      de: {
        base: 'wissen',
        '1sg_present': 'weiß', '2sg_present': 'weißt', '3sg_present': 'weiß',
        '1pl_present': 'wissen', '2pl_present': 'wisst', '3pl_present': 'wissen',
        '1sg_past': 'wusste', '2sg_past': 'wusstest', '3sg_past': 'wusste',
        '1pl_past': 'wussten', '2pl_past': 'wusstet', '3pl_past': 'wussten',
      },
      es: {
        base: 'saber',
        '1sg_present': 'sé', '2sg_present': 'sabes', '3sg_present': 'sabe',
        '1pl_present': 'sabemos', '2pl_present': 'sabéis', '3pl_present': 'saben',
        '1sg_past': 'supe', '2sg_past': 'supiste', '3sg_past': 'supo',
        '1pl_past': 'supimos', '2pl_past': 'supisteis', '3pl_past': 'supieron',
        '1sg_future': 'sabré', '2sg_future': 'sabrás', '3sg_future': 'sabrá',
        '1pl_future': 'sabremos', '2pl_future': 'sabréis', '3pl_future': 'sabrán',
      },
      ja: {
        base: '知る',
        reading: 'しる',
        masu_present: '知っています',
        masu_present_reading: 'しっています',
      },
      pt: {
        base: 'saber',
        '1sg_present': 'sei', '2sg_present': 'sabe', '3sg_present': 'sabe',
        '1pl_present': 'sabemos', '2pl_present': 'sabem', '3pl_present': 'sabem',
        '1sg_past': 'soube', '2sg_past': 'soube', '3sg_past': 'soube',
        '1pl_past': 'soubemos', '2pl_past': 'souberam', '3pl_past': 'souberam',
        '1sg_future': 'saberei', '2sg_future': 'saberá', '3sg_future': 'saberá',
        '1pl_future': 'saberemos', '2pl_future': 'saberão', '3pl_future': 'saberão',
      },
    },
  },
  {
    id: 'READ',
    role: 'verb',
    transitivity: 'transitive',
    description: 'to look at and understand written text',
    emoji: '📖',
    forms: {
      en: {
        base: 'read',
        '1sg_present': 'read', '2sg_present': 'read', '3sg_present': 'reads',
        '1pl_present': 'read', '2pl_present': 'read', '3pl_present': 'read',
        past: 'read',
      },
      it: {
        base: 'leggere',
        '1sg_present': 'leggo', '2sg_present': 'leggi', '3sg_present': 'legge',
        '1pl_present': 'leggiamo', '2pl_present': 'leggete', '3pl_present': 'leggono',
        '1sg_past': 'lessi', '2sg_past': 'leggesti', '3sg_past': 'lesse',
        '1pl_past': 'leggemmo', '2pl_past': 'leggeste', '3pl_past': 'lessero',
        '1sg_future': 'leggerò', '2sg_future': 'leggerai', '3sg_future': 'leggerà',
        '1pl_future': 'leggeremo', '2pl_future': 'leggerete', '3pl_future': 'leggeranno',
      },
      fr: {
        base: 'lire',
        '1sg_present': 'lis', '2sg_present': 'lis', '3sg_present': 'lit',
        '1pl_present': 'lisons', '2pl_present': 'lisez', '3pl_present': 'lisent',
        '1sg_past': 'lus', '2sg_past': 'lus', '3sg_past': 'lut',
        '1pl_past': 'lûmes', '2pl_past': 'lûtes', '3pl_past': 'lurent',
        '1sg_future': 'lirai', '2sg_future': 'liras', '3sg_future': 'lira',
        '1pl_future': 'lirons', '2pl_future': 'lirez', '3pl_future': 'liront',
      },
      de: {
        base: 'lesen',
        '1sg_present': 'lese', '2sg_present': 'liest', '3sg_present': 'liest',
        '1pl_present': 'lesen', '2pl_present': 'lest', '3pl_present': 'lesen',
        '1sg_past': 'las', '2sg_past': 'lasest', '3sg_past': 'las',
        '1pl_past': 'lasen', '2pl_past': 'last', '3pl_past': 'lasen',
      },
      es: {
        base: 'leer',
        '1sg_present': 'leo', '2sg_present': 'lees', '3sg_present': 'lee',
        '1pl_present': 'leemos', '2pl_present': 'leéis', '3pl_present': 'leen',
        '1sg_past': 'leí', '2sg_past': 'leíste', '3sg_past': 'leyó',
        '1pl_past': 'leímos', '2pl_past': 'leísteis', '3pl_past': 'leyeron',
        '1sg_future': 'leeré', '2sg_future': 'leerás', '3sg_future': 'leerá',
        '1pl_future': 'leeremos', '2pl_future': 'leeréis', '3pl_future': 'leerán',
      },
      ja: {
        base: '読む',
        reading: 'よむ',
        masu_present: '読みます',
        masu_present_reading: 'よみます',
      },
      pt: {
        base: 'ler',
        '1sg_present': 'leio', '2sg_present': 'lê', '3sg_present': 'lê',
        '1pl_present': 'lemos', '2pl_present': 'leem', '3pl_present': 'leem',
        '1sg_past': 'li', '2sg_past': 'leu', '3sg_past': 'leu',
        '1pl_past': 'lemos', '2pl_past': 'leram', '3pl_past': 'leram',
        '1sg_future': 'lerei', '2sg_future': 'lerá', '3sg_future': 'lerá',
        '1pl_future': 'leremos', '2pl_future': 'lerão', '3pl_future': 'lerão',
      },
    },
  },
  {
    id: 'JUMP',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['locative', 'direction', 'source', 'route', 'cause'],
    description: 'to propel oneself into the air',
    emoji: '🦘',
    forms: {
      en: {
        base: 'jump',
        '1sg_present': 'jump', '2sg_present': 'jump', '3sg_present': 'jumps',
        '1pl_present': 'jump', '2pl_present': 'jump', '3pl_present': 'jump',
        past: 'jumped',
      },
      it: {
        base: 'saltare',
        '1sg_present': 'salto', '2sg_present': 'salti', '3sg_present': 'salta',
        '1pl_present': 'saltiamo', '2pl_present': 'saltate', '3pl_present': 'saltano',
        '1sg_past': 'saltai', '2sg_past': 'saltasti', '3sg_past': 'saltò',
        '1pl_past': 'saltammo', '2pl_past': 'saltaste', '3pl_past': 'saltarono',
        '1sg_future': 'salterò', '2sg_future': 'salterai', '3sg_future': 'salterà',
        '1pl_future': 'salteremo', '2pl_future': 'salterete', '3pl_future': 'salteranno',
      },
      fr: {
        base: 'sauter',
        '1sg_present': 'saute', '2sg_present': 'sautes', '3sg_present': 'saute',
        '1pl_present': 'sautons', '2pl_present': 'sautez', '3pl_present': 'sautent',
        '1sg_past': 'sautai', '2sg_past': 'sautas', '3sg_past': 'sauta',
        '1pl_past': 'sautâmes', '2pl_past': 'sautâtes', '3pl_past': 'sautèrent',
        '1sg_future': 'sauterai', '2sg_future': 'sauteras', '3sg_future': 'sautera',
        '1pl_future': 'sauterons', '2pl_future': 'sauterez', '3pl_future': 'sauteront',
      },
      de: {
        base: 'springen',
        '1sg_present': 'springe', '2sg_present': 'springst', '3sg_present': 'springt',
        '1pl_present': 'springen', '2pl_present': 'springt', '3pl_present': 'springen',
        '1sg_past': 'sprang', '2sg_past': 'sprangst', '3sg_past': 'sprang',
        '1pl_past': 'sprangen', '2pl_past': 'sprangt', '3pl_past': 'sprangen',
      },
      es: {
        base: 'saltar',
        '1sg_present': 'salto', '2sg_present': 'saltas', '3sg_present': 'salta',
        '1pl_present': 'saltamos', '2pl_present': 'saltáis', '3pl_present': 'saltan',
        '1sg_past': 'salté', '2sg_past': 'saltaste', '3sg_past': 'saltó',
        '1pl_past': 'saltamos', '2pl_past': 'saltasteis', '3pl_past': 'saltaron',
        '1sg_future': 'saltaré', '2sg_future': 'saltarás', '3sg_future': 'saltará',
        '1pl_future': 'saltaremos', '2pl_future': 'saltaréis', '3pl_future': 'saltarán',
      },
      ja: {
        base: '跳ぶ',
        reading: 'とぶ',
        masu_present: '跳びます',
        masu_present_reading: 'とびます',
      },
      pt: {
        base: 'pular',
        '1sg_present': 'pulo', '2sg_present': 'pula', '3sg_present': 'pula',
        '1pl_present': 'pulamos', '2pl_present': 'pulam', '3pl_present': 'pulam',
        '1sg_past': 'pulei', '2sg_past': 'pulou', '3sg_past': 'pulou',
        '1pl_past': 'pulamos', '2pl_past': 'pularam', '3pl_past': 'pularam',
        '1sg_future': 'pularei', '2sg_future': 'pulará', '3sg_future': 'pulará',
        '1pl_future': 'pularemos', '2pl_future': 'pularão', '3pl_future': 'pularão',
      },
    },
  },
  {
    id: 'COME',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['locative', 'direction', 'source', 'route', 'cause'],
    description: 'to move toward the speaker or a place',
    emoji: '🚶',
    forms: {
      en: {
        base: 'come',
        '1sg_present': 'come', '2sg_present': 'come', '3sg_present': 'comes',
        '1pl_present': 'come', '2pl_present': 'come', '3pl_present': 'come',
        past: 'came',
      },
      it: {
        base: 'venire',
        '1sg_present': 'vengo', '2sg_present': 'vieni', '3sg_present': 'viene',
        '1pl_present': 'veniamo', '2pl_present': 'venite', '3pl_present': 'vengono',
        '1sg_past': 'venni', '2sg_past': 'venisti', '3sg_past': 'venne',
        '1pl_past': 'venimmo', '2pl_past': 'veniste', '3pl_past': 'vennero',
        '1sg_future': 'verrò', '2sg_future': 'verrai', '3sg_future': 'verrà',
        '1pl_future': 'verremo', '2pl_future': 'verrete', '3pl_future': 'verranno',
      },
      fr: {
        base: 'venir',
        '1sg_present': 'viens', '2sg_present': 'viens', '3sg_present': 'vient',
        '1pl_present': 'venons', '2pl_present': 'venez', '3pl_present': 'viennent',
        '1sg_past': 'vins', '2sg_past': 'vins', '3sg_past': 'vint',
        '1pl_past': 'vînmes', '2pl_past': 'vîntes', '3pl_past': 'vinrent',
        '1sg_future': 'viendrai', '2sg_future': 'viendras', '3sg_future': 'viendra',
        '1pl_future': 'viendrons', '2pl_future': 'viendrez', '3pl_future': 'viendront',
      },
      de: {
        base: 'kommen',
        '1sg_present': 'komme', '2sg_present': 'kommst', '3sg_present': 'kommt',
        '1pl_present': 'kommen', '2pl_present': 'kommt', '3pl_present': 'kommen',
        '1sg_past': 'kam', '2sg_past': 'kamst', '3sg_past': 'kam',
        '1pl_past': 'kamen', '2pl_past': 'kamt', '3pl_past': 'kamen',
      },
      es: {
        base: 'venir',
        '1sg_present': 'vengo', '2sg_present': 'vienes', '3sg_present': 'viene',
        '1pl_present': 'venimos', '2pl_present': 'venís', '3pl_present': 'vienen',
        '1sg_past': 'vine', '2sg_past': 'viniste', '3sg_past': 'vino',
        '1pl_past': 'vinimos', '2pl_past': 'vinisteis', '3pl_past': 'vinieron',
        '1sg_future': 'vendré', '2sg_future': 'vendrás', '3sg_future': 'vendrá',
        '1pl_future': 'vendremos', '2pl_future': 'vendréis', '3pl_future': 'vendrán',
      },
      ja: {
        base: '来る',
        reading: 'くる',
        masu_present: '来ます',
        masu_present_reading: 'きます',
      },
      pt: {
        base: 'vir',
        '1sg_present': 'venho', '2sg_present': 'vem', '3sg_present': 'vem',
        '1pl_present': 'vimos', '2pl_present': 'vêm', '3pl_present': 'vêm',
        '1sg_past': 'vim', '2sg_past': 'veio', '3sg_past': 'veio',
        '1pl_past': 'viemos', '2pl_past': 'vieram', '3pl_past': 'vieram',
        '1sg_future': 'virei', '2sg_future': 'virá', '3sg_future': 'virá',
        '1pl_future': 'viremos', '2pl_future': 'virão', '3pl_future': 'virão',
      },
    },
  },
  {
    id: 'CRY',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['cause'],
    description: 'to weep; to shed tears',
    emoji: '😭',
    synonym: 'weep',
    forms: {
      en: {
        base: 'cry',
        '1sg_present': 'cry', '2sg_present': 'cry', '3sg_present': 'cries',
        '1pl_present': 'cry', '2pl_present': 'cry', '3pl_present': 'cry',
        past: 'cried',
      },
      it: {
        base: 'piangere',
        '1sg_present': 'piango', '2sg_present': 'piangi', '3sg_present': 'piange',
        '1pl_present': 'piangiamo', '2pl_present': 'piangete', '3pl_present': 'piangono',
        '1sg_past': 'piansi', '2sg_past': 'piangesti', '3sg_past': 'pianse',
        '1pl_past': 'piangemmo', '2pl_past': 'piangeste', '3pl_past': 'piansero',
        '1sg_future': 'piangerò', '2sg_future': 'piangerai', '3sg_future': 'piangerà',
        '1pl_future': 'piangeremo', '2pl_future': 'piangerete', '3pl_future': 'piangeranno',
      },
      fr: {
        base: 'pleurer',
        '1sg_present': 'pleure', '2sg_present': 'pleures', '3sg_present': 'pleure',
        '1pl_present': 'pleurons', '2pl_present': 'pleurez', '3pl_present': 'pleurent',
        '1sg_past': 'pleurai', '2sg_past': 'pleuras', '3sg_past': 'pleura',
        '1pl_past': 'pleurâmes', '2pl_past': 'pleurâtes', '3pl_past': 'pleurèrent',
        '1sg_future': 'pleurerai', '2sg_future': 'pleureras', '3sg_future': 'pleurera',
        '1pl_future': 'pleurerons', '2pl_future': 'pleurerez', '3pl_future': 'pleureront',
      },
      de: {
        base: 'weinen',
        '1sg_present': 'weine', '2sg_present': 'weinst', '3sg_present': 'weint',
        '1pl_present': 'weinen', '2pl_present': 'weint', '3pl_present': 'weinen',
        '1sg_past': 'weinte', '2sg_past': 'weintest', '3sg_past': 'weinte',
        '1pl_past': 'weinten', '2pl_past': 'weintet', '3pl_past': 'weinten',
      },
      es: {
        base: 'llorar',
        '1sg_present': 'lloro', '2sg_present': 'lloras', '3sg_present': 'llora',
        '1pl_present': 'lloramos', '2pl_present': 'lloráis', '3pl_present': 'lloran',
        '1sg_past': 'lloré', '2sg_past': 'lloraste', '3sg_past': 'lloró',
        '1pl_past': 'lloramos', '2pl_past': 'llorasteis', '3pl_past': 'lloraron',
        '1sg_future': 'lloraré', '2sg_future': 'llorarás', '3sg_future': 'llorará',
        '1pl_future': 'lloraremos', '2pl_future': 'lloraréis', '3pl_future': 'llorarán',
      },
      ja: {
        base: '泣く',
        reading: 'なく',
        masu_present: '泣きます',
        masu_present_reading: 'なきます',
      },
      pt: {
        base: 'chorar',
        '1sg_present': 'choro', '2sg_present': 'chora', '3sg_present': 'chora',
        '1pl_present': 'choramos', '2pl_present': 'choram', '3pl_present': 'choram',
        '1sg_past': 'chorei', '2sg_past': 'chorou', '3sg_past': 'chorou',
        '1pl_past': 'choramos', '2pl_past': 'choraram', '3pl_past': 'choraram',
        '1sg_future': 'chorarei', '2sg_future': 'chorará', '3sg_future': 'chorará',
        '1pl_future': 'choraremos', '2pl_future': 'chorarão', '3pl_future': 'chorarão',
      },
    },
  },
  {
    id: 'CRY_OUT',
    role: 'verb',
    transitivity: 'transitive',
    description: 'to cry out; to shout or exclaim loudly',
    emoji: '📢',
    synonym: 'shout',
    forms: {
      en: {
        base: 'cry',
        '1sg_present': 'cry', '2sg_present': 'cry', '3sg_present': 'cries',
        '1pl_present': 'cry', '2pl_present': 'cry', '3pl_present': 'cry',
        past: 'cried',
      },
      it: {
        base: 'gridare',
        '1sg_present': 'grido', '2sg_present': 'gridi', '3sg_present': 'grida',
        '1pl_present': 'gridiamo', '2pl_present': 'gridate', '3pl_present': 'gridano',
        '1sg_past': 'gridai', '2sg_past': 'gridasti', '3sg_past': 'gridò',
        '1pl_past': 'gridammo', '2pl_past': 'gridaste', '3pl_past': 'gridarono',
        '1sg_future': 'griderò', '2sg_future': 'griderai', '3sg_future': 'griderà',
        '1pl_future': 'grideremo', '2pl_future': 'griderete', '3pl_future': 'grideranno',
      },
      fr: {
        base: 'crier',
        '1sg_present': 'crie', '2sg_present': 'cries', '3sg_present': 'crie',
        '1pl_present': 'crions', '2pl_present': 'criez', '3pl_present': 'crient',
        '1sg_past': 'criai', '2sg_past': 'crias', '3sg_past': 'cria',
        '1pl_past': 'criâmes', '2pl_past': 'criâtes', '3pl_past': 'crièrent',
        '1sg_future': 'crierai', '2sg_future': 'crieras', '3sg_future': 'criera',
        '1pl_future': 'crierons', '2pl_future': 'crierez', '3pl_future': 'crieront',
      },
      de: {
        base: 'rufen',
        '1sg_present': 'rufe', '2sg_present': 'rufst', '3sg_present': 'ruft',
        '1pl_present': 'rufen', '2pl_present': 'ruft', '3pl_present': 'rufen',
        '1sg_past': 'rief', '2sg_past': 'riefst', '3sg_past': 'rief',
        '1pl_past': 'riefen', '2pl_past': 'rieft', '3pl_past': 'riefen',
      },
      es: {
        base: 'gritar',
        '1sg_present': 'grito', '2sg_present': 'gritas', '3sg_present': 'grita',
        '1pl_present': 'gritamos', '2pl_present': 'gritáis', '3pl_present': 'gritan',
        '1sg_past': 'grité', '2sg_past': 'gritaste', '3sg_past': 'gritó',
        '1pl_past': 'gritamos', '2pl_past': 'gritasteis', '3pl_past': 'gritaron',
        '1sg_future': 'gritaré', '2sg_future': 'gritarás', '3sg_future': 'gritará',
        '1pl_future': 'gritaremos', '2pl_future': 'gritaréis', '3pl_future': 'gritarán',
      },
      ja: {
        base: '叫ぶ',
        reading: 'さけぶ',
        masu_present: '叫びます',
        masu_present_reading: 'さけびます',
      },
      pt: {
        base: 'gritar',
        '1sg_present': 'grito', '2sg_present': 'grita', '3sg_present': 'grita',
        '1pl_present': 'gritamos', '2pl_present': 'gritam', '3pl_present': 'gritam',
        '1sg_past': 'gritei', '2sg_past': 'gritou', '3sg_past': 'gritou',
        '1pl_past': 'gritamos', '2pl_past': 'gritaram', '3pl_past': 'gritaram',
        '1sg_future': 'gritarei', '2sg_future': 'gritará', '3sg_future': 'gritará',
        '1pl_future': 'gritaremos', '2pl_future': 'gritarão', '3pl_future': 'gritarão',
      },
    },
  },

  // ── DITRANSITIVE VERBS ───────────────────────────────────────────
  {
    id: 'GIVE',
    role: 'verb',
    transitivity: 'ditransitive',
    description: 'to hand something to someone',
    emoji: '🎁',
    forms: {
      en: {
        base: 'give',
        '1sg_present': 'give', '2sg_present': 'give', '3sg_present': 'gives',
        '1pl_present': 'give', '2pl_present': 'give', '3pl_present': 'give',
        past: 'gave',
      },
      it: {
        base: 'dare',
        '1sg_present': 'do', '2sg_present': 'dai', '3sg_present': 'dà',
        '1pl_present': 'diamo', '2pl_present': 'date', '3pl_present': 'danno',
        '1sg_past': 'diedi', '2sg_past': 'desti', '3sg_past': 'diede',
        '1pl_past': 'demmo', '2pl_past': 'deste', '3pl_past': 'diedero',
        '1sg_future': 'darò', '2sg_future': 'darai', '3sg_future': 'darà',
        '1pl_future': 'daremo', '2pl_future': 'darete', '3pl_future': 'daranno',
      },
      fr: {
        base: 'donner',
        '1sg_present': 'donne', '2sg_present': 'donnes', '3sg_present': 'donne',
        '1pl_present': 'donnons', '2pl_present': 'donnez', '3pl_present': 'donnent',
        '1sg_past': 'donnai', '2sg_past': 'donnas', '3sg_past': 'donna',
        '1pl_past': 'donnâmes', '2pl_past': 'donnâtes', '3pl_past': 'donnèrent',
        '1sg_future': 'donnerai', '2sg_future': 'donneras', '3sg_future': 'donnera',
        '1pl_future': 'donnerons', '2pl_future': 'donnerez', '3pl_future': 'donneront',
      },
      de: {
        base: 'geben',
        '1sg_present': 'gebe', '2sg_present': 'gibst', '3sg_present': 'gibt',
        '1pl_present': 'geben', '2pl_present': 'gebt', '3pl_present': 'geben',
        '1sg_past': 'gab', '2sg_past': 'gabst', '3sg_past': 'gab',
        '1pl_past': 'gaben', '2pl_past': 'gabt', '3pl_past': 'gaben',
      },
      es: {
        base: 'dar',
        '1sg_present': 'doy', '2sg_present': 'das', '3sg_present': 'da',
        '1pl_present': 'damos', '2pl_present': 'dais', '3pl_present': 'dan',
        '1sg_past': 'di', '2sg_past': 'diste', '3sg_past': 'dio',
        '1pl_past': 'dimos', '2pl_past': 'disteis', '3pl_past': 'dieron',
        '1sg_future': 'daré', '2sg_future': 'darás', '3sg_future': 'dará',
        '1pl_future': 'daremos', '2pl_future': 'daréis', '3pl_future': 'darán',
      },
      ja: {
        base: 'あげる',
        masu_present: 'あげます',
      },
      pt: {
        base: 'dar',
        '1sg_present': 'dou', '2sg_present': 'dás', '3sg_present': 'dá',
        '1pl_present': 'damos', '2pl_present': 'dais', '3pl_present': 'dão',
        '1sg_past': 'dei', '2sg_past': 'deu', '3sg_past': 'deu',
        '1pl_past': 'demos', '2pl_past': 'deram', '3pl_past': 'deram',
        '1sg_future': 'darei', '2sg_future': 'dará', '3sg_future': 'dará',
        '1pl_future': 'daremos', '2pl_future': 'darão', '3pl_future': 'darão',
      },
    },
  },
  {
    id: 'SHOW',
    role: 'verb',
    transitivity: 'ditransitive',
    description: 'to make something visible to someone',
    emoji: '👁️',
    forms: {
      en: {
        base: 'show',
        '1sg_present': 'show', '2sg_present': 'show', '3sg_present': 'shows',
        '1pl_present': 'show', '2pl_present': 'show', '3pl_present': 'show',
        past: 'showed',
      },
      it: {
        base: 'mostrare',
        '1sg_present': 'mostro', '2sg_present': 'mostri', '3sg_present': 'mostra',
        '1pl_present': 'mostriamo', '2pl_present': 'mostrate', '3pl_present': 'mostrano',
        '1sg_past': 'mostrai', '2sg_past': 'mostrasti', '3sg_past': 'mostrò',
        '1pl_past': 'mostrammo', '2pl_past': 'mostraste', '3pl_past': 'mostrarono',
        '1sg_future': 'mostrerò', '2sg_future': 'mostrerai', '3sg_future': 'mostrerà',
        '1pl_future': 'mostreremo', '2pl_future': 'mostrerete', '3pl_future': 'mostreranno',
      },
      fr: {
        base: 'montrer',
        '1sg_present': 'montre', '2sg_present': 'montres', '3sg_present': 'montre',
        '1pl_present': 'montrons', '2pl_present': 'montrez', '3pl_present': 'montrent',
        '1sg_past': 'montrai', '2sg_past': 'montras', '3sg_past': 'montra',
        '1pl_past': 'montrâmes', '2pl_past': 'montrâtes', '3pl_past': 'montrèrent',
        '1sg_future': 'montrerai', '2sg_future': 'montreras', '3sg_future': 'montrera',
        '1pl_future': 'montrerons', '2pl_future': 'montrerez', '3pl_future': 'montreront',
      },
      de: {
        base: 'zeigen',
        '1sg_present': 'zeige', '2sg_present': 'zeigst', '3sg_present': 'zeigt',
        '1pl_present': 'zeigen', '2pl_present': 'zeigt', '3pl_present': 'zeigen',
        '1sg_past': 'zeigte', '2sg_past': 'zeigtest', '3sg_past': 'zeigte',
        '1pl_past': 'zeigten', '2pl_past': 'zeigtet', '3pl_past': 'zeigten',
      },
      es: {
        base: 'mostrar',
        '1sg_present': 'muestro', '2sg_present': 'muestras', '3sg_present': 'muestra',
        '1pl_present': 'mostramos', '2pl_present': 'mostráis', '3pl_present': 'muestran',
        '1sg_past': 'mostré', '2sg_past': 'mostraste', '3sg_past': 'mostró',
        '1pl_past': 'mostramos', '2pl_past': 'mostrasteis', '3pl_past': 'mostraron',
        '1sg_future': 'mostraré', '2sg_future': 'mostrarás', '3sg_future': 'mostrará',
        '1pl_future': 'mostraremos', '2pl_future': 'mostraréis', '3pl_future': 'mostrarán',
      },
      ja: {
        base: '見せる',
        reading: 'みせる',
        masu_present: '見せます',
        masu_present_reading: 'みせます',
      },
      pt: {
        base: 'mostrar',
        '1sg_present': 'mostro', '2sg_present': 'mostras', '3sg_present': 'mostra',
        '1pl_present': 'mostramos', '2pl_present': 'mostram', '3pl_present': 'mostram',
        '1sg_past': 'mostrei', '2sg_past': 'mostrou', '3sg_past': 'mostrou',
        '1pl_past': 'mostramos', '2pl_past': 'mostraram', '3pl_past': 'mostraram',
        '1sg_future': 'mostrarei', '2sg_future': 'mostrará', '3sg_future': 'mostrará',
        '1pl_future': 'mostraremos', '2pl_future': 'mostrarão', '3pl_future': 'mostrarão',
      },
    },
  },
  {
    id: 'SEND',
    role: 'verb',
    transitivity: 'ditransitive',
    description: 'to dispatch something to someone',
    emoji: '📨',
    forms: {
      en: {
        base: 'send',
        '1sg_present': 'send', '2sg_present': 'send', '3sg_present': 'sends',
        '1pl_present': 'send', '2pl_present': 'send', '3pl_present': 'send',
        past: 'sent',
      },
      it: {
        base: 'mandare',
        '1sg_present': 'mando', '2sg_present': 'mandi', '3sg_present': 'manda',
        '1pl_present': 'mandiamo', '2pl_present': 'mandate', '3pl_present': 'mandano',
        '1sg_past': 'mandai', '2sg_past': 'mandasti', '3sg_past': 'mandò',
        '1pl_past': 'mandammo', '2pl_past': 'mandaste', '3pl_past': 'mandarono',
        '1sg_future': 'manderò', '2sg_future': 'manderai', '3sg_future': 'manderà',
        '1pl_future': 'manderemo', '2pl_future': 'manderete', '3pl_future': 'manderanno',
      },
      fr: {
        base: 'envoyer',
        '1sg_present': 'envoie', '2sg_present': 'envoies', '3sg_present': 'envoie',
        '1pl_present': 'envoyons', '2pl_present': 'envoyez', '3pl_present': 'envoient',
        '1sg_past': 'envoyai', '2sg_past': 'envoyas', '3sg_past': 'envoya',
        '1pl_past': 'envoyâmes', '2pl_past': 'envoyâtes', '3pl_past': 'envoyèrent',
        '1sg_future': 'enverrai', '2sg_future': 'enverras', '3sg_future': 'enverra',
        '1pl_future': 'enverrons', '2pl_future': 'enverrez', '3pl_future': 'enverront',
      },
      de: {
        base: 'schicken',
        '1sg_present': 'schicke', '2sg_present': 'schickst', '3sg_present': 'schickt',
        '1pl_present': 'schicken', '2pl_present': 'schickt', '3pl_present': 'schicken',
        '1sg_past': 'schickte', '2sg_past': 'schicktest', '3sg_past': 'schickte',
        '1pl_past': 'schickten', '2pl_past': 'schicktet', '3pl_past': 'schickten',
      },
      es: {
        base: 'enviar',
        '1sg_present': 'envío', '2sg_present': 'envías', '3sg_present': 'envía',
        '1pl_present': 'enviamos', '2pl_present': 'enviáis', '3pl_present': 'envían',
        '1sg_past': 'envié', '2sg_past': 'enviaste', '3sg_past': 'envió',
        '1pl_past': 'enviamos', '2pl_past': 'enviasteis', '3pl_past': 'enviaron',
        '1sg_future': 'enviaré', '2sg_future': 'enviarás', '3sg_future': 'enviará',
        '1pl_future': 'enviaremos', '2pl_future': 'enviaréis', '3pl_future': 'enviarán',
      },
      ja: {
        base: '送る',
        reading: 'おくる',
        masu_present: '送ります',
        masu_present_reading: 'おくります',
      },
      pt: {
        base: 'enviar',
        '1sg_present': 'envio', '2sg_present': 'envia', '3sg_present': 'envia',
        '1pl_present': 'enviamos', '2pl_present': 'enviam', '3pl_present': 'enviam',
        '1sg_past': 'enviei', '2sg_past': 'enviou', '3sg_past': 'enviou',
        '1pl_past': 'enviamos', '2pl_past': 'enviaram', '3pl_past': 'enviaram',
        '1sg_future': 'enviarei', '2sg_future': 'enviará', '3sg_future': 'enviará',
        '1pl_future': 'enviaremos', '2pl_future': 'enviarão', '3pl_future': 'enviarão',
      },
    },
  },

  // ── MOTION VERBS (license locative / direction / source / route) ──
  {
    id: 'GO',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['locative', 'direction', 'source', 'route', 'cause'],
    description: 'to move or travel from one place to another',
    emoji: '🚶',
    forms: {
      en: {
        base: 'go',
        '1sg_present': 'go', '2sg_present': 'go', '3sg_present': 'goes',
        '1pl_present': 'go', '2pl_present': 'go', '3pl_present': 'go',
        past: 'went',
      },
      it: {
        base: 'andare',
        '1sg_present': 'vado', '2sg_present': 'vai', '3sg_present': 'va',
        '1pl_present': 'andiamo', '2pl_present': 'andate', '3pl_present': 'vanno',
        '1sg_past': 'andai', '2sg_past': 'andasti', '3sg_past': 'andò',
        '1pl_past': 'andammo', '2pl_past': 'andaste', '3pl_past': 'andarono',
        '1sg_future': 'andrò', '2sg_future': 'andrai', '3sg_future': 'andrà',
        '1pl_future': 'andremo', '2pl_future': 'andrete', '3pl_future': 'andranno',
      },
      fr: {
        base: 'aller',
        '1sg_present': 'vais', '2sg_present': 'vas', '3sg_present': 'va',
        '1pl_present': 'allons', '2pl_present': 'allez', '3pl_present': 'vont',
        '1sg_past': 'allai', '2sg_past': 'allas', '3sg_past': 'alla',
        '1pl_past': 'allâmes', '2pl_past': 'allâtes', '3pl_past': 'allèrent',
        '1sg_future': 'irai', '2sg_future': 'iras', '3sg_future': 'ira',
        '1pl_future': 'irons', '2pl_future': 'irez', '3pl_future': 'iront',
      },
      de: {
        base: 'gehen',
        '1sg_present': 'gehe', '2sg_present': 'gehst', '3sg_present': 'geht',
        '1pl_present': 'gehen', '2pl_present': 'geht', '3pl_present': 'gehen',
        '1sg_past': 'ging', '2sg_past': 'gingst', '3sg_past': 'ging',
        '1pl_past': 'gingen', '2pl_past': 'gingt', '3pl_past': 'gingen',
      },
      es: {
        base: 'ir',
        '1sg_present': 'voy', '2sg_present': 'vas', '3sg_present': 'va',
        '1pl_present': 'vamos', '2pl_present': 'vais', '3pl_present': 'van',
        '1sg_past': 'fui', '2sg_past': 'fuiste', '3sg_past': 'fue',
        '1pl_past': 'fuimos', '2pl_past': 'fuisteis', '3pl_past': 'fueron',
        '1sg_future': 'iré', '2sg_future': 'irás', '3sg_future': 'irá',
        '1pl_future': 'iremos', '2pl_future': 'iréis', '3pl_future': 'irán',
      },
      ja: {
        base: '行く',
        reading: 'いく',
        masu_present: '行きます',
        masu_present_reading: 'いきます',
      },
      pt: {
        base: 'ir',
        '1sg_present': 'vou', '2sg_present': 'vai', '3sg_present': 'vai',
        '1pl_present': 'vamos', '2pl_present': 'vão', '3pl_present': 'vão',
        '1sg_past': 'fui', '2sg_past': 'foi', '3sg_past': 'foi',
        '1pl_past': 'fomos', '2pl_past': 'foram', '3pl_past': 'foram',
        '1sg_future': 'irei', '2sg_future': 'irá', '3sg_future': 'irá',
        '1pl_future': 'iremos', '2pl_future': 'irão', '3pl_future': 'irão',
      },
    },
  },

  // ── ADJECTIVES ───────────────────────────────────────────────────
  {
    id: 'BIG',
    role: 'adjective',
    description: 'large in size',
    emoji: '🔭',
    forms: {
      en: { base: 'big' },
      it: { base: 'grande' },
      fr: { base: 'grand' },
      de: { base: 'groß' },
      es: { base: 'grande' },
      ja: { base: '大きい', reading: 'おおきい' },
      pt: { base: 'grande' },
    },
  },
  {
    id: 'SMALL',
    role: 'adjective',
    description: 'little in size',
    emoji: '🔬',
    forms: {
      en: { base: 'small' },
      it: { base: 'piccolo' },
      fr: { base: 'petit' },
      de: { base: 'klein' },
      es: { base: 'pequeño' },
      ja: { base: '小さい', reading: 'ちいさい' },
      pt: { base: 'pequeno' },
    },
  },
  {
    id: 'GOOD',
    role: 'adjective',
    description: 'of high quality or virtue',
    emoji: '✨',
    forms: {
      en: { base: 'good' },
      it: { base: 'buono' },
      fr: { base: 'bon' },
      de: { base: 'gut' },
      es: { base: 'bueno' },
      ja: { base: '良い', reading: 'よい' },
      pt: { base: 'bom' },
    },
  },
  {
    id: 'BAD',
    role: 'adjective',
    description: 'of poor quality or harmful',
    emoji: '💀',
    forms: {
      en: { base: 'bad' },
      it: { base: 'cattivo' },
      fr: { base: 'mauvais' },
      de: { base: 'schlecht' },
      es: { base: 'malo' },
      ja: { base: '悪い', reading: 'わるい' },
      pt: { base: 'mau' },
    },
  },
  {
    id: 'HAPPY',
    role: 'adjective',
    description: 'feeling or expressing joy',
    emoji: '😊',
    forms: {
      en: { base: 'happy' },
      it: { base: 'felice' },
      fr: { base: 'heureux' },
      de: { base: 'glücklich' },
      es: { base: 'feliz' },
      ja: { base: '幸せな', reading: 'しあわせな' },
      pt: { base: 'feliz' },
    },
  },
  {
    id: 'SAD',
    role: 'adjective',
    description: 'feeling or expressing sorrow',
    emoji: '😢',
    forms: {
      en: { base: 'sad' },
      it: { base: 'triste' },
      fr: { base: 'triste' },
      de: { base: 'traurig' },
      es: { base: 'triste' },
      ja: { base: '悲しい', reading: 'かなしい' },
      pt: { base: 'triste' },
    },
  },
  {
    id: 'OLD',
    role: 'adjective',
    description: 'having existed for a long time',
    emoji: '🧓',
    forms: {
      en: { base: 'old' },
      it: { base: 'vecchio' },
      fr: { base: 'vieux' },
      de: { base: 'alt' },
      es: { base: 'viejo' },
      ja: { base: '古い', reading: 'ふるい' },
      pt: { base: 'velho' },
    },
  },
  {
    id: 'YOUNG',
    role: 'adjective',
    description: 'having lived or existed for a short time',
    emoji: '🧒',
    forms: {
      en: { base: 'young' },
      it: { base: 'giovane' },
      fr: { base: 'jeune' },
      de: { base: 'jung' },
      es: { base: 'joven' },
      ja: { base: '若い', reading: 'わかい' },
      pt: { base: 'jovem' },
    },
  },
  {
    id: 'NEW',
    role: 'adjective',
    description: 'recently made or introduced',
    emoji: '🆕',
    forms: {
      en: { base: 'new' },
      it: { base: 'nuovo' },
      fr: { base: 'nouveau' },
      de: { base: 'neu' },
      es: { base: 'nuevo' },
      ja: { base: '新しい', reading: 'あたらしい' },
      pt: { base: 'novo' },
    },
  },
  {
    id: 'BEAUTIFUL',
    role: 'adjective',
    description: 'pleasing to the senses or mind',
    emoji: '🌸',
    forms: {
      en: { base: 'beautiful' },
      it: { base: 'bello' },
      fr: { base: 'beau' },
      de: { base: 'schön' },
      es: { base: 'hermoso' },
      ja: { base: '美しい', reading: 'うつくしい' },
      pt: { base: 'belo' },
    },
  },
  {
    id: 'STRONG',
    role: 'adjective',
    description: 'having great physical power or force',
    emoji: '💪',
    forms: {
      en: { base: 'strong' },
      it: { base: 'forte' },
      fr: { base: 'fort' },
      de: { base: 'stark' },
      es: { base: 'fuerte' },
      ja: { base: '強い', reading: 'つよい' },
      pt: { base: 'forte' },
    },
  },
  {
    id: 'TIRED',
    role: 'adjective',
    description: 'feeling a need to rest or sleep',
    emoji: '😴',
    forms: {
      en: { base: 'tired' },
      it: { base: 'stanco' },
      fr: { base: 'fatigué' },
      de: { base: 'müde' },
      es: { base: 'cansado' },
      ja: { base: '疲れた', reading: 'つかれた' },
      pt: { base: 'cansado' },
    },
  },
  {
    id: 'HUNGRY',
    role: 'adjective',
    description: 'feeling a need to eat',
    emoji: '🤤',
    forms: {
      en: { base: 'hungry' },
      it: { base: 'affamato' },
      fr: { base: 'affamé' },
      de: { base: 'hungrig' },
      es: { base: 'hambriento' },
      ja: { base: '空腹な', reading: 'くうふくな' },
      pt: { base: 'faminto' },
    },
  },
  {
    id: 'COLD',
    role: 'adjective',
    description: 'at a low temperature',
    emoji: '🥶',
    forms: {
      en: { base: 'cold' },
      it: { base: 'freddo' },
      fr: { base: 'froid' },
      de: { base: 'kalt' },
      es: { base: 'frío' },
      ja: { base: '冷たい', reading: 'つめたい' },
      pt: { base: 'frio' },
    },
  },
  {
    id: 'HOT',
    role: 'adjective',
    description: 'at a high temperature',
    emoji: '🔥',
    forms: {
      en: { base: 'hot' },
      it: { base: 'caldo' },
      fr: { base: 'chaud' },
      de: { base: 'heiß' },
      es: { base: 'caliente' },
      ja: { base: '熱い', reading: 'あつい' },
      pt: { base: 'quente' },
    },
  },
  {
    id: 'INTERESTING',
    role: 'adjective',
    description: 'arousing curiosity or attention',
    emoji: '🤔',
    forms: {
      en: { base: 'interesting' },
      it: { base: 'interessante' },
      fr: { base: 'intéressant' },
      de: { base: 'interessant' },
      es: { base: 'interesante' },
      ja: { base: '面白い', reading: 'おもしろい' },
      pt: { base: 'interessante' },
    },
  },
  {
    id: 'QUICK',
    role: 'adjective',
    description: 'moving or capable of moving fast',
    emoji: '⚡',
    forms: {
      en: { base: 'quick' },
      it: { base: 'veloce' },
      fr: { base: 'rapide' },
      de: { base: 'schnell' },
      es: { base: 'rápido' },
      ja: { base: '速い', reading: 'はやい' },
      pt: { base: 'rápido' },
    },
  },
  {
    id: 'BROWN',
    role: 'adjective',
    description: 'of a dark color produced by mixing red, black, and yellow',
    emoji: '🟤',
    forms: {
      en: { base: 'brown' },
      it: { base: 'marrone' },
      fr: { base: 'brun' },
      de: { base: 'braun' },
      es: { base: 'marrón' },
      ja: { base: '茶色', reading: 'ちゃいろ' },
      pt: { base: 'castanho' },
    },
  },
  {
    id: 'LAZY',
    role: 'adjective',
    description: 'unwilling to work or use energy',
    emoji: '🦥',
    forms: {
      en: { base: 'lazy' },
      it: { base: 'pigro' },
      fr: { base: 'paresseux' },
      de: { base: 'faul' },
      es: { base: 'perezoso' },
      ja: { base: '怠惰な', reading: 'たいだな' },
      pt: { base: 'preguiçoso' },
    },
  },

  // ── ADVERBS ──────────────────────────────────────────────────────
  {
    id: 'FAST',
    role: 'adverb',
    description: 'at high speed',
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
    id: 'ALWAYS',
    role: 'adverb',
    description: 'at all times, on every occasion',
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStmt = { run: (...args: any[]) => { lastInsertRowid: bigint | number } };

interface RoleStmts {
  insertLexeme: AnyStmt;
  insertForm:   AnyStmt;
  insertLink:   AnyStmt;
}

function buildRoleStmts(role: string): RoleStmts {
  return {
    insertLexeme: db.prepare(roleInsertSql(role)) as unknown as AnyStmt,
    insertForm:   db.prepare(`INSERT INTO ${role}_forms (lexeme_id, form_key, form_value) VALUES (?, ?, ?)`) as unknown as AnyStmt,
    insertLink:   db.prepare(`INSERT INTO concept_${role}_links (concept_id, lexeme_id, is_primary) VALUES (?, ?, 1)`) as unknown as AnyStmt,
  };
}

function roleInsertSql(role: string): string {
  switch (role) {
    case 'noun':    return 'INSERT INTO noun_lexemes (language, singular, plural, gender) VALUES (?, ?, ?, ?)';
    case 'pronoun': return 'INSERT INTO pronoun_lexemes (language, lemma, person, number, gender) VALUES (?, ?, ?, ?, ?)';
    default:        return `INSERT INTO ${role}_lexemes (language, lemma)                 VALUES (?, ?)`;
  }
}

/** Form keys that are stored as typed columns on the lexeme table (not in *_forms) */
const LEXEME_COLUMNS: Record<string, string[]> = {
  noun:    ['base', 'plural', 'gender'],
  pronoun: ['person', 'number', 'gender'],
};

function lexemeArgs(role: string, lang: string, lemma: string, forms: Record<string, string>): (string | null)[] {
  switch (role) {
    case 'noun':
      return [lang, lemma, forms['plural'] ?? null, forms['gender'] ?? null];
    case 'pronoun':
      return [lang, lemma, forms['person'] ?? '3', forms['number'] ?? 'singular', forms['gender'] ?? null];
    default:
      return [lang, lemma];
  }
}

function seed() {
  const stmts = {
    wipeConcepts: db.prepare('DELETE FROM semantic_concepts'),
    wipeVerbs:    db.prepare('DELETE FROM verb_lexemes'),
    wipeNouns:    db.prepare('DELETE FROM noun_lexemes'),
    wipePronouns: db.prepare('DELETE FROM pronoun_lexemes'),
    wipeAdjectives: db.prepare('DELETE FROM adjective_lexemes'),
    wipeAdverbs:  db.prepare('DELETE FROM adverb_lexemes'),

    insertConcept: db.prepare<[string, string, string, string | null, string | null, string | null, number, string | null, number]>(
      'INSERT INTO semantic_concepts (id, role, description, emoji, transitivity, complements, animate, synonym, countable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ),
  };

  const roleStmts: Record<string, RoleStmts> = {
    verb:      buildRoleStmts('verb'),
    noun:      buildRoleStmts('noun'),
    pronoun:   buildRoleStmts('pronoun'),
    adjective: buildRoleStmts('adjective'),
    adverb:    buildRoleStmts('adverb'),
  };

  const run = db.transaction(() => {
    // Wipe per-type tables first (concepts will cascade their links)
    stmts.wipeVerbs.run();
    stmts.wipeNouns.run();
    stmts.wipePronouns.run();
    stmts.wipeAdjectives.run();
    stmts.wipeAdverbs.run();
    stmts.wipeConcepts.run();

    for (const c of concepts) {
      stmts.insertConcept.run(c.id, c.role, c.description, c.emoji ?? null, c.transitivity ?? null, c.complements?.length ? c.complements.join(',') : null, c.animate ? 1 : 0, c.synonym ?? null, c.countable === false ? 0 : 1);

      const rs = roleStmts[c.role];
      if (!rs) continue;

      const excludedKeys = new Set(['base', ...(LEXEME_COLUMNS[c.role] ?? [])]);

      for (const [lang, forms] of Object.entries(c.forms)) {
        const lemma = forms['base'] ?? '';
        // Pass language via a temporary augmented object so lexemeArgs can access it
        const { lastInsertRowid } = rs.insertLexeme.run(...lexemeArgs(c.role, lang, lemma, forms));
        const lexemeId = Number(lastInsertRowid);

        // For types where the base form is a dedicated column (noun.singular,
        // pronoun.lemma), the lookup synthesises forms['base'] from that column,
        // so we don't store a redundant row here.
        const storeBaseAsForm = c.role !== 'noun';
        if (storeBaseAsForm) {
          rs.insertForm.run(lexemeId, 'base', lemma);
        }
        for (const [key, value] of Object.entries(forms)) {
          if (!excludedKeys.has(key)) {
            rs.insertForm.run(lexemeId, key, value);
          }
        }

        rs.insertLink.run(c.id, lexemeId);
      }
    }
  });

  run();
  clearLexiconCache();
  console.log(`Seeded ${concepts.length} concepts across ${Object.keys(concepts[0]?.forms ?? {}).length} languages.`);
}

seed();
