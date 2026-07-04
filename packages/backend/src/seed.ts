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
      en: { base: 'I',        person: '1', number: 'singular', plural: 'we' },
      it: { base: 'io',       person: '1', number: 'singular', plural: 'noi' },
      fr: { base: 'je',       person: '1', number: 'singular', plural: 'nous' },
      de: { base: 'ich',      person: '1', number: 'singular', plural: 'wir' },
      es: { base: 'yo',       person: '1', number: 'singular', plural: 'nosotros' },
      ja: { base: '私',       person: '1', number: 'singular', plural: '私たち' },
      pt: { base: 'eu',       person: '1', number: 'singular', plural: 'nós' },
    },
  },
  {
    id: 'SECOND_PERSON',
    role: 'pronoun',
    description: '2nd Person',
    emoji: '👉',
    forms: {
      en: { base: 'you',      person: '2', number: 'singular', plural: 'you' },
      it: { base: 'tu',       person: '2', number: 'singular', plural: 'voi' },
      fr: { base: 'tu',       person: '2', number: 'singular', plural: 'vous' },
      de: { base: 'du',       person: '2', number: 'singular', plural: 'ihr' },
      es: { base: 'tú',       person: '2', number: 'singular', plural: 'vosotros' },
      ja: { base: 'あなた',   person: '2', number: 'singular', plural: 'あなたたち' },
      pt: { base: 'você',     person: '2', number: 'singular', plural: 'vocês' },
    },
  },
  {
    id: 'THIRD_PERSON',
    role: 'pronoun',
    description: '3rd Person',
    emoji: '👤',
    forms: {
      // base = default masc singular; singular_fem and plural stored as extra forms
      en: { base: 'he',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'she',    plural: 'they' },
      it: { base: 'lui',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'lei',    plural: 'loro' },
      fr: { base: 'il',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'elle',   plural: 'ils' },
      de: { base: 'er',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'sie',    plural: 'sie' },
      es: { base: 'él',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella',   plural: 'ellos' },
      ja: { base: '彼',   person: '3', number: 'singular', gender: 'masc', singular_fem: '彼女',   plural: '彼ら' },
      pt: { base: 'ele',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'ela',    plural: 'eles' },
    },
  },

  // ── NOUNS ────────────────────────────────────────────────────────
  {
    id: 'CAT',
    role: 'noun',
    description: 'domestic feline animal',
    emoji: '🐱',
    forms: {
      en: { base: 'cat',   plural: 'cats',   count: 'singular' },
      it: { base: 'gatto', plural: 'gatti',  gender: 'masc', count: 'singular', fem: 'gatta',   fem_plural: 'gatte' },
      fr: { base: 'chat',  plural: 'chats',  gender: 'masc', count: 'singular', fem: 'chatte',  fem_plural: 'chattes' },
      de: { base: 'Kater', plural: 'Kater',  gender: 'masc', count: 'singular', fem: 'Katze',   fem_plural: 'Katzen' },
      es: { base: 'gato',  plural: 'gatos',  gender: 'masc', count: 'singular', fem: 'gata',    fem_plural: 'gatas' },
      ja: { base: '猫',   count: 'singular' },
      pt: { base: 'gato',  plural: 'gatos',  gender: 'masc', count: 'singular', fem: 'gata',    fem_plural: 'gatas' },
    },
  },
  {
    id: 'DOG',
    role: 'noun',
    description: 'domestic canine animal',
    emoji: '🐶',
    forms: {
      en: { base: 'dog',    plural: 'dogs',   count: 'singular' },
      it: { base: 'cane',   plural: 'cani',   gender: 'masc', count: 'singular', fem: 'cagna',   fem_plural: 'cagne' },
      fr: { base: 'chien',  plural: 'chiens', gender: 'masc', count: 'singular', fem: 'chienne', fem_plural: 'chiennes' },
      de: { base: 'Hund',   plural: 'Hunde',  gender: 'masc', count: 'singular', fem: 'Hündin',  fem_plural: 'Hündinnen' },
      es: { base: 'perro',  plural: 'perros', gender: 'masc', count: 'singular', fem: 'perra',   fem_plural: 'perras' },
      ja: { base: '犬',    count: 'singular' },
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
      ja: { base: '本', count: 'singular' },
      pt: { base: 'livro', plural: 'livros', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'WATER',
    role: 'noun',
    description: 'the liquid H₂O',
    emoji: '💧',
    forms: {
      en: { base: 'water', count: 'singular' },
      it: { base: 'acqua', gender: 'fem', count: 'singular' },
      fr: { base: 'eau', gender: 'fem', count: 'singular' },
      de: { base: 'Wasser', gender: 'neut', count: 'singular' },
      es: { base: 'agua', gender: 'masc', count: 'singular' }, // special: uses "el" even though feminine
      ja: { base: '水', count: 'singular' },
      pt: { base: 'água', gender: 'fem', count: 'singular' },
    },
  },
  {
    id: 'FOOD',
    role: 'noun',
    description: 'nourishment, something to eat',
    emoji: '🍽️',
    forms: {
      en: { base: 'food', count: 'singular' },
      it: { base: 'cibo', gender: 'masc', count: 'singular' },
      fr: { base: 'nourriture', gender: 'fem', count: 'singular' },
      de: { base: 'Essen', gender: 'neut', count: 'singular' },
      es: { base: 'comida', gender: 'fem', count: 'singular' },
      ja: { base: '食べ物', count: 'singular' },
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
      ja: { base: '家', count: 'singular' },
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
      ja: { base: '家', count: 'singular' },
      pt: { base: 'lar', plural: 'lares', gender: 'masc', count: 'singular' },
    },
  },
  {
    id: 'CHILD',
    role: 'noun',
    description: 'a young human being',
    emoji: '👦',
    forms: {
      en: { base: 'child',    plural: 'children', count: 'singular' },
      it: { base: 'bambino',  plural: 'bambini',  gender: 'masc', count: 'singular', fem: 'bambina',  fem_plural: 'bambine' },
      fr: { base: 'enfant',   plural: 'enfants',  gender: 'masc', count: 'singular', fem: 'enfant',   fem_plural: 'enfants' },
      de: { base: 'Kind',     plural: 'Kinder',   gender: 'neut', count: 'singular' },
      es: { base: 'niño',     plural: 'niños',    gender: 'masc', count: 'singular', fem: 'niña',     fem_plural: 'niñas' },
      ja: { base: '子供',    count: 'singular' },
      pt: { base: 'criança',  plural: 'crianças', gender: 'fem',  count: 'singular' },
    },
  },
  {
    id: 'FOX',
    role: 'noun',
    description: 'a carnivorous mammal with reddish fur',
    emoji: '🦊',
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
      },
      it: {
        base: 'mangiare',
        '1sg_present': 'mangio', '2sg_present': 'mangi', '3sg_present': 'mangia',
        '1pl_present': 'mangiamo', '2pl_present': 'mangiate', '3pl_present': 'mangiano',
      },
      fr: {
        base: 'manger',
        '1sg_present': 'mange', '2sg_present': 'manges', '3sg_present': 'mange',
        '1pl_present': 'mangeons', '2pl_present': 'mangez', '3pl_present': 'mangent',
      },
      de: {
        base: 'essen',
        '1sg_present': 'esse', '2sg_present': 'isst', '3sg_present': 'isst',
        '1pl_present': 'essen', '2pl_present': 'esst', '3pl_present': 'essen',
      },
      es: {
        base: 'comer',
        '1sg_present': 'como', '2sg_present': 'comes', '3sg_present': 'come',
        '1pl_present': 'comemos', '2pl_present': 'coméis', '3pl_present': 'comen',
      },
      ja: {
        base: '食べる',
        masu_present: '食べます',
      },
      pt: {
        base: 'comer',
        '1sg_present': 'como', '2sg_present': 'come', '3sg_present': 'come',
        '1pl_present': 'comemos', '2pl_present': 'comem', '3pl_present': 'comem',
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
      },
      it: {
        base: 'bere',
        '1sg_present': 'bevo', '2sg_present': 'bevi', '3sg_present': 'beve',
        '1pl_present': 'beviamo', '2pl_present': 'bevete', '3pl_present': 'bevono',
      },
      fr: {
        base: 'boire',
        '1sg_present': 'bois', '2sg_present': 'bois', '3sg_present': 'boit',
        '1pl_present': 'buvons', '2pl_present': 'buvez', '3pl_present': 'boivent',
      },
      de: {
        base: 'trinken',
        '1sg_present': 'trinke', '2sg_present': 'trinkst', '3sg_present': 'trinkt',
        '1pl_present': 'trinken', '2pl_present': 'trinkt', '3pl_present': 'trinken',
      },
      es: {
        base: 'beber',
        '1sg_present': 'bebo', '2sg_present': 'bebes', '3sg_present': 'bebe',
        '1pl_present': 'bebemos', '2pl_present': 'bebéis', '3pl_present': 'beben',
      },
      ja: {
        base: '飲む',
        masu_present: '飲みます',
      },
      pt: {
        base: 'beber',
        '1sg_present': 'bebo', '2sg_present': 'bebe', '3sg_present': 'bebe',
        '1pl_present': 'bebemos', '2pl_present': 'bebem', '3pl_present': 'bebem',
      },
    },
  },
  {
    id: 'RUN',
    role: 'verb',
    transitivity: 'intransitive',
    description: 'to move quickly on foot',
    emoji: '🏃',
    forms: {
      en: {
        base: 'run',
        '1sg_present': 'run', '2sg_present': 'run', '3sg_present': 'runs',
        '1pl_present': 'run', '2pl_present': 'run', '3pl_present': 'run',
      },
      it: {
        base: 'correre',
        '1sg_present': 'corro', '2sg_present': 'corri', '3sg_present': 'corre',
        '1pl_present': 'corriamo', '2pl_present': 'correte', '3pl_present': 'corrono',
      },
      fr: {
        base: 'courir',
        '1sg_present': 'cours', '2sg_present': 'cours', '3sg_present': 'court',
        '1pl_present': 'courons', '2pl_present': 'courez', '3pl_present': 'courent',
      },
      de: {
        base: 'laufen',
        '1sg_present': 'laufe', '2sg_present': 'läufst', '3sg_present': 'läuft',
        '1pl_present': 'laufen', '2pl_present': 'lauft', '3pl_present': 'laufen',
      },
      es: {
        base: 'correr',
        '1sg_present': 'corro', '2sg_present': 'corres', '3sg_present': 'corre',
        '1pl_present': 'corremos', '2pl_present': 'corréis', '3pl_present': 'corren',
      },
      ja: {
        base: '走る',
        masu_present: '走ります',
      },
      pt: {
        base: 'correr',
        '1sg_present': 'corro', '2sg_present': 'corre', '3sg_present': 'corre',
        '1pl_present': 'corremos', '2pl_present': 'correm', '3pl_present': 'correm',
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
      },
      it: {
        base: 'vedere',
        '1sg_present': 'vedo', '2sg_present': 'vedi', '3sg_present': 'vede',
        '1pl_present': 'vediamo', '2pl_present': 'vedete', '3pl_present': 'vedono',
      },
      fr: {
        base: 'voir',
        '1sg_present': 'vois', '2sg_present': 'vois', '3sg_present': 'voit',
        '1pl_present': 'voyons', '2pl_present': 'voyez', '3pl_present': 'voient',
      },
      de: {
        base: 'sehen',
        '1sg_present': 'sehe', '2sg_present': 'siehst', '3sg_present': 'sieht',
        '1pl_present': 'sehen', '2pl_present': 'seht', '3pl_present': 'sehen',
      },
      es: {
        base: 'ver',
        '1sg_present': 'veo', '2sg_present': 'ves', '3sg_present': 've',
        '1pl_present': 'vemos', '2pl_present': 'veis', '3pl_present': 'ven',
      },
      ja: {
        base: '見る',
        masu_present: '見ます',
      },
      pt: {
        base: 'ver',
        '1sg_present': 'vejo', '2sg_present': 'vê', '3sg_present': 'vê',
        '1pl_present': 'vemos', '2pl_present': 'veem', '3pl_present': 'veem',
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
      },
      it: {
        base: 'amare',
        '1sg_present': 'amo', '2sg_present': 'ami', '3sg_present': 'ama',
        '1pl_present': 'amiamo', '2pl_present': 'amate', '3pl_present': 'amano',
      },
      fr: {
        base: 'aimer',
        '1sg_present': 'aime', '2sg_present': 'aimes', '3sg_present': 'aime',
        '1pl_present': 'aimons', '2pl_present': 'aimez', '3pl_present': 'aiment',
      },
      de: {
        base: 'lieben',
        '1sg_present': 'liebe', '2sg_present': 'liebst', '3sg_present': 'liebt',
        '1pl_present': 'lieben', '2pl_present': 'liebt', '3pl_present': 'lieben',
      },
      es: {
        base: 'amar',
        '1sg_present': 'amo', '2sg_present': 'amas', '3sg_present': 'ama',
        '1pl_present': 'amamos', '2pl_present': 'amáis', '3pl_present': 'aman',
      },
      ja: {
        base: '愛する',
        masu_present: '愛します',
      },
      pt: {
        base: 'amar',
        '1sg_present': 'amo', '2sg_present': 'ama', '3sg_present': 'ama',
        '1pl_present': 'amamos', '2pl_present': 'amam', '3pl_present': 'amam',
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
      },
      it: {
        base: 'sapere',
        '1sg_present': 'so', '2sg_present': 'sai', '3sg_present': 'sa',
        '1pl_present': 'sappiamo', '2pl_present': 'sapete', '3pl_present': 'sanno',
      },
      fr: {
        base: 'savoir',
        '1sg_present': 'sais', '2sg_present': 'sais', '3sg_present': 'sait',
        '1pl_present': 'savons', '2pl_present': 'savez', '3pl_present': 'savent',
      },
      de: {
        base: 'wissen',
        '1sg_present': 'weiß', '2sg_present': 'weißt', '3sg_present': 'weiß',
        '1pl_present': 'wissen', '2pl_present': 'wisst', '3pl_present': 'wissen',
      },
      es: {
        base: 'saber',
        '1sg_present': 'sé', '2sg_present': 'sabes', '3sg_present': 'sabe',
        '1pl_present': 'sabemos', '2pl_present': 'sabéis', '3pl_present': 'saben',
      },
      ja: {
        base: '知る',
        masu_present: '知っています',
      },
      pt: {
        base: 'saber',
        '1sg_present': 'sei', '2sg_present': 'sabe', '3sg_present': 'sabe',
        '1pl_present': 'sabemos', '2pl_present': 'sabem', '3pl_present': 'sabem',
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
      },
      it: {
        base: 'leggere',
        '1sg_present': 'leggo', '2sg_present': 'leggi', '3sg_present': 'legge',
        '1pl_present': 'leggiamo', '2pl_present': 'leggete', '3pl_present': 'leggono',
      },
      fr: {
        base: 'lire',
        '1sg_present': 'lis', '2sg_present': 'lis', '3sg_present': 'lit',
        '1pl_present': 'lisons', '2pl_present': 'lisez', '3pl_present': 'lisent',
      },
      de: {
        base: 'lesen',
        '1sg_present': 'lese', '2sg_present': 'liest', '3sg_present': 'liest',
        '1pl_present': 'lesen', '2pl_present': 'lest', '3pl_present': 'lesen',
      },
      es: {
        base: 'leer',
        '1sg_present': 'leo', '2sg_present': 'lees', '3sg_present': 'lee',
        '1pl_present': 'leemos', '2pl_present': 'leéis', '3pl_present': 'leen',
      },
      ja: {
        base: '読む',
        masu_present: '読みます',
      },
      pt: {
        base: 'ler',
        '1sg_present': 'leio', '2sg_present': 'lê', '3sg_present': 'lê',
        '1pl_present': 'lemos', '2pl_present': 'leem', '3pl_present': 'leem',
      },
    },
  },
  {
    id: 'JUMP',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['locative', 'direction', 'source', 'route'],
    description: 'to propel oneself into the air',
    emoji: '🦘',
    forms: {
      en: {
        base: 'jump',
        '1sg_present': 'jump', '2sg_present': 'jump', '3sg_present': 'jumps',
        '1pl_present': 'jump', '2pl_present': 'jump', '3pl_present': 'jump',
      },
      it: {
        base: 'saltare',
        '1sg_present': 'salto', '2sg_present': 'salti', '3sg_present': 'salta',
        '1pl_present': 'saltiamo', '2pl_present': 'saltate', '3pl_present': 'saltano',
      },
      fr: {
        base: 'sauter',
        '1sg_present': 'saute', '2sg_present': 'sautes', '3sg_present': 'saute',
        '1pl_present': 'sautons', '2pl_present': 'sautez', '3pl_present': 'sautent',
      },
      de: {
        base: 'springen',
        '1sg_present': 'springe', '2sg_present': 'springst', '3sg_present': 'springt',
        '1pl_present': 'springen', '2pl_present': 'springt', '3pl_present': 'springen',
      },
      es: {
        base: 'saltar',
        '1sg_present': 'salto', '2sg_present': 'saltas', '3sg_present': 'salta',
        '1pl_present': 'saltamos', '2pl_present': 'saltáis', '3pl_present': 'saltan',
      },
      ja: {
        base: '跳ぶ',
        masu_present: '跳びます',
      },
      pt: {
        base: 'pular',
        '1sg_present': 'pulo', '2sg_present': 'pula', '3sg_present': 'pula',
        '1pl_present': 'pulamos', '2pl_present': 'pulam', '3pl_present': 'pulam',
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
      },
      it: {
        base: 'dare',
        '1sg_present': 'do', '2sg_present': 'dai', '3sg_present': 'dà',
        '1pl_present': 'diamo', '2pl_present': 'date', '3pl_present': 'danno',
      },
      fr: {
        base: 'donner',
        '1sg_present': 'donne', '2sg_present': 'donnes', '3sg_present': 'donne',
        '1pl_present': 'donnons', '2pl_present': 'donnez', '3pl_present': 'donnent',
      },
      de: {
        base: 'geben',
        '1sg_present': 'gebe', '2sg_present': 'gibst', '3sg_present': 'gibt',
        '1pl_present': 'geben', '2pl_present': 'gebt', '3pl_present': 'geben',
      },
      es: {
        base: 'dar',
        '1sg_present': 'doy', '2sg_present': 'das', '3sg_present': 'da',
        '1pl_present': 'damos', '2pl_present': 'dais', '3pl_present': 'dan',
      },
      ja: {
        base: 'あげる',
        masu_present: 'あげます',
      },
      pt: {
        base: 'dar',
        '1sg_present': 'dou', '2sg_present': 'dás', '3sg_present': 'dá',
        '1pl_present': 'damos', '2pl_present': 'dais', '3pl_present': 'dão',
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
      },
      it: {
        base: 'mostrare',
        '1sg_present': 'mostro', '2sg_present': 'mostri', '3sg_present': 'mostra',
        '1pl_present': 'mostriamo', '2pl_present': 'mostrate', '3pl_present': 'mostrano',
      },
      fr: {
        base: 'montrer',
        '1sg_present': 'montre', '2sg_present': 'montres', '3sg_present': 'montre',
        '1pl_present': 'montrons', '2pl_present': 'montrez', '3pl_present': 'montrent',
      },
      de: {
        base: 'zeigen',
        '1sg_present': 'zeige', '2sg_present': 'zeigst', '3sg_present': 'zeigt',
        '1pl_present': 'zeigen', '2pl_present': 'zeigt', '3pl_present': 'zeigen',
      },
      es: {
        base: 'mostrar',
        '1sg_present': 'muestro', '2sg_present': 'muestras', '3sg_present': 'muestra',
        '1pl_present': 'mostramos', '2pl_present': 'mostráis', '3pl_present': 'muestran',
      },
      ja: {
        base: '見せる',
        masu_present: '見せます',
      },
      pt: {
        base: 'mostrar',
        '1sg_present': 'mostro', '2sg_present': 'mostras', '3sg_present': 'mostra',
        '1pl_present': 'mostramos', '2pl_present': 'mostram', '3pl_present': 'mostram',
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
      },
      it: {
        base: 'mandare',
        '1sg_present': 'mando', '2sg_present': 'mandi', '3sg_present': 'manda',
        '1pl_present': 'mandiamo', '2pl_present': 'mandate', '3pl_present': 'mandano',
      },
      fr: {
        base: 'envoyer',
        '1sg_present': 'envoie', '2sg_present': 'envoies', '3sg_present': 'envoie',
        '1pl_present': 'envoyons', '2pl_present': 'envoyez', '3pl_present': 'envoient',
      },
      de: {
        base: 'schicken',
        '1sg_present': 'schicke', '2sg_present': 'schickst', '3sg_present': 'schickt',
        '1pl_present': 'schicken', '2pl_present': 'schickt', '3pl_present': 'schicken',
      },
      es: {
        base: 'enviar',
        '1sg_present': 'envío', '2sg_present': 'envías', '3sg_present': 'envía',
        '1pl_present': 'enviamos', '2pl_present': 'enviáis', '3pl_present': 'envían',
      },
      ja: {
        base: '送る',
        masu_present: '送ります',
      },
      pt: {
        base: 'enviar',
        '1sg_present': 'envio', '2sg_present': 'envia', '3sg_present': 'envia',
        '1pl_present': 'enviamos', '2pl_present': 'enviam', '3pl_present': 'enviam',
      },
    },
  },

  // ── MOTION VERBS (license locative / direction / source / route) ──
  {
    id: 'GO',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['locative', 'direction', 'source', 'route'],
    description: 'to move or travel from one place to another',
    emoji: '🚶',
    forms: {
      en: {
        base: 'go',
        '1sg_present': 'go', '2sg_present': 'go', '3sg_present': 'goes',
        '1pl_present': 'go', '2pl_present': 'go', '3pl_present': 'go',
      },
      it: {
        base: 'andare',
        '1sg_present': 'vado', '2sg_present': 'vai', '3sg_present': 'va',
        '1pl_present': 'andiamo', '2pl_present': 'andate', '3pl_present': 'vanno',
      },
      fr: {
        base: 'aller',
        '1sg_present': 'vais', '2sg_present': 'vas', '3sg_present': 'va',
        '1pl_present': 'allons', '2pl_present': 'allez', '3pl_present': 'vont',
      },
      de: {
        base: 'gehen',
        '1sg_present': 'gehe', '2sg_present': 'gehst', '3sg_present': 'geht',
        '1pl_present': 'gehen', '2pl_present': 'geht', '3pl_present': 'gehen',
      },
      es: {
        base: 'ir',
        '1sg_present': 'voy', '2sg_present': 'vas', '3sg_present': 'va',
        '1pl_present': 'vamos', '2pl_present': 'vais', '3pl_present': 'van',
      },
      ja: {
        base: '行く',
        masu_present: '行きます',
      },
      pt: {
        base: 'ir',
        '1sg_present': 'vou', '2sg_present': 'vai', '3sg_present': 'vai',
        '1pl_present': 'vamos', '2pl_present': 'vão', '3pl_present': 'vão',
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
      ja: { base: '大きい' },
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
      ja: { base: '小さい' },
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
      ja: { base: '良い' },
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
      ja: { base: '悪い' },
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
      ja: { base: '幸せな' },
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
      ja: { base: '悲しい' },
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
      ja: { base: '古い' },
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
      ja: { base: '若い' },
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
      ja: { base: '新しい' },
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
      ja: { base: '美しい' },
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
      ja: { base: '強い' },
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
      ja: { base: '疲れた' },
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
      ja: { base: '空腹な' },
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
      ja: { base: '冷たい' },
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
      ja: { base: '熱い' },
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
      ja: { base: '面白い' },
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
      ja: { base: '速い' },
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
      ja: { base: '茶色' },
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
      ja: { base: '怠惰な' },
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
      ja: { base: '速く' },
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
      ja: { base: '一緒に' },
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
      ja: { base: '決して', subtype: 'frequency', polarity: 'negative' },
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

    insertConcept: db.prepare<[string, string, string, string | null, string | null, string | null]>(
      'INSERT INTO semantic_concepts (id, role, description, emoji, transitivity, complements) VALUES (?, ?, ?, ?, ?, ?)'
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
      stmts.insertConcept.run(c.id, c.role, c.description, c.emoji ?? null, c.transitivity ?? null, c.complements?.length ? c.complements.join(',') : null);

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
