import type { ConceptSeed } from '../types.js';
import { causativeGloss, infinitiveGloss } from './gloss.js';

// Plain transitive verbs.
export const transitiveVerbs: ConceptSeed[] = [
  {
    id: 'CUT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'terminus', 'cause', 'locative'],
    description: 'to divide or wound with a sharp edge',
    // "To divide with a blade" — B13 shipped it as "with a sharp blade", and SHARP is now glossed as
    // what cuts well, so the adjective went: the two would have defined each other (localization C24).
    definition: infinitiveGloss('DIVIDE', {
      complements: {
        instrumental: { phrase: { concept: 'BLADE', definiteness: 'indefinite' } },
      },
    }),
    emoji: '✂️',
    isA: 'DIVIDE',
    forms: {
      en: {
        base: 'cut',
        '1sg_present': 'cut', '2sg_present': 'cut', '3sg_present': 'cuts',
        '1pl_present': 'cut', '2pl_present': 'cut', '3pl_present': 'cut',
        past: 'cut',
      },
      it: {
        base: 'tagliare',
        '1sg_present': 'taglio', '2sg_present': 'tagli', '3sg_present': 'taglia',
        '1pl_present': 'tagliamo', '2pl_present': 'tagliate', '3pl_present': 'tagliano',
        '1sg_past': 'tagliai', '2sg_past': 'tagliasti', '3sg_past': 'tagliò',
        '1pl_past': 'tagliammo', '2pl_past': 'tagliaste', '3pl_past': 'tagliarono',
        '1sg_future': 'taglierò', '2sg_future': 'taglierai', '3sg_future': 'taglierà',
        '1pl_future': 'taglieremo', '2pl_future': 'taglierete', '3pl_future': 'taglieranno',
      },
      fr: {
        base: 'couper',
        '1sg_present': 'coupe', '2sg_present': 'coupes', '3sg_present': 'coupe',
        '1pl_present': 'coupons', '2pl_present': 'coupez', '3pl_present': 'coupent',
        '1sg_past': 'coupai', '2sg_past': 'coupas', '3sg_past': 'coupa',
        '1pl_past': 'coupâmes', '2pl_past': 'coupâtes', '3pl_past': 'coupèrent',
        '1sg_future': 'couperai', '2sg_future': 'couperas', '3sg_future': 'coupera',
        '1pl_future': 'couperons', '2pl_future': 'couperez', '3pl_future': 'couperont',
      },
      de: {
        base: 'schneiden',
        '1sg_present': 'schneide', '2sg_present': 'schneidest', '3sg_present': 'schneidet',
        '1pl_present': 'schneiden', '2pl_present': 'schneidet', '3pl_present': 'schneiden',
        '1sg_past': 'schnitt', '2sg_past': 'schnittest', '3sg_past': 'schnitt',
        '1pl_past': 'schnitten', '2pl_past': 'schnittet', '3pl_past': 'schnitten',
      },
      es: {
        base: 'cortar',
        '1sg_present': 'corto', '2sg_present': 'cortas', '3sg_present': 'corta',
        '1pl_present': 'cortamos', '2pl_present': 'cortáis', '3pl_present': 'cortan',
        '1sg_past': 'corté', '2sg_past': 'cortaste', '3sg_past': 'cortó',
        '1pl_past': 'cortamos', '2pl_past': 'cortasteis', '3pl_past': 'cortaron',
        '1sg_future': 'cortaré', '2sg_future': 'cortarás', '3sg_future': 'cortará',
        '1pl_future': 'cortaremos', '2pl_future': 'cortaréis', '3pl_future': 'cortarán',
      },
      ja: {
        base: '切る',
        reading: 'きる',
        masu_present: '切ります',
        masu_present_reading: 'きります',
      },
      pt: {
        base: 'cortar',
        '1sg_present': 'corto', '2sg_present': 'corta', '3sg_present': 'corta',
        '1pl_present': 'cortamos', '2pl_present': 'cortam', '3pl_present': 'cortam',
        '1sg_past': 'cortei', '2sg_past': 'cortou', '3sg_past': 'cortou',
        '1pl_past': 'cortamos', '2pl_past': 'cortaram', '3pl_past': 'cortaram',
        '1sg_future': 'cortarei', '2sg_future': 'cortará', '3sg_future': 'cortará',
        '1pl_future': 'cortaremos', '2pl_future': 'cortarão', '3pl_future': 'cortarão',
      },
    },
  },

  {
    id: 'EAT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to consume food',
    definition: infinitiveGloss('CONSUME', 'FOOD'),
    emoji: '🍴',
    isA: 'CONSUME',
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
        // German has two verbs for eating and the choice is obligatory: a person "isst", an animal
        // "frisst". `subject_sense` names the concept the translator swaps in when the SUBJECT is an
        // animal — the mirror of KNOW's `object_sense`, one slot over (A157).
        base: 'essen', subject_sense: 'EAT_ANIMAL',
        '1sg_present': 'esse', '2sg_present': 'isst', '3sg_present': 'isst',
        '1pl_present': 'essen', '2pl_present': 'esst', '3pl_present': 'essen',
        '1sg_past': 'aß', '2sg_past': 'aßest', '3sg_past': 'aß',
        '1pl_past': 'aßen', '2pl_past': 'aßt', '3pl_past': 'aßen',
        '2sg_imperative': 'iss', // strong e→i: the du command keeps the vowel change
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
        // 尊敬語 召し上がる, 「食う」「飲む」の尊敬語; 謙譲語 いただく, 「食う」「飲む」の謙譲語 (大辞林,
        // デジタル大辞泉). Someone else's relative 召し上がります; one's own, asked, いただきます (P11-E1).
        honorific: '召し上がる', honorific_masu_present: '召し上がります', honorific_te: '召し上がって', honorific_nai: '召し上がらない',
        honorific_reading: 'めしあがる', honorific_masu_present_reading: 'めしあがります', honorific_te_reading: 'めしあがって', honorific_nai_reading: 'めしあがらない',
        humble: 'いただく', humble_masu_present: 'いただきます', humble_te: 'いただいて', humble_nai: 'いただかない',
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
    // EAT's animal sense. German alone distinguishes it — a person "isst", an animal "frisst", and
    // either word of the other is an error or an insult (A157). The translator selects it for EAT
    // with an animal subject (`subject_sense` on EAT's German lexeme), so it is a sense of EAT and no
    // picker offers it. The other six have one verb, and keep EAT's own forms here so nothing breaks
    // if a plan ever names the sense directly.
    id: 'EAT_ANIMAL',
    role: 'verb',
    senseOf: 'EAT',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to consume food, of an animal',
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
        // Strong e→i in the 2sg and 3sg present ("frisst") and in the du command ("friss"), as
        // "essen" has it; the past is "fraß", the Partizip "gefressen" (see `nonfinite.ts`).
        base: 'fressen',
        '1sg_present': 'fresse', '2sg_present': 'frisst', '3sg_present': 'frisst',
        '1pl_present': 'fressen', '2pl_present': 'fresst', '3pl_present': 'fressen',
        '1sg_past': 'fraß', '2sg_past': 'fraßest', '3sg_past': 'fraß',
        '1pl_past': 'fraßen', '2pl_past': 'fraßt', '3pl_past': 'fraßen',
        '2sg_imperative': 'friss',
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
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to consume liquid',
    definition: infinitiveGloss('CONSUME', 'LIQUID'),
    emoji: '🥤',
    isA: 'CONSUME',
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
        // 尊敬語 召し上がる, 「食う」「飲む」の尊敬語; 謙譲語 いただく, 「食う」「飲む」の謙譲語 (大辞林,
        // デジタル大辞泉) — the pair EAT has, since neither register tells eating from drinking (P11-E1).
        honorific: '召し上がる', honorific_masu_present: '召し上がります', honorific_te: '召し上がって', honorific_nai: '召し上がらない',
        honorific_reading: 'めしあがる', honorific_masu_present_reading: 'めしあがります', honorific_te_reading: 'めしあがって', honorific_nai_reading: 'めしあがらない',
        humble: 'いただく', humble_masu_present: 'いただきます', humble_te: 'いただいて', humble_nai: 'いただかない',
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

  // To make a liquid run out of a vessel: what one does to a liquid and not to a gas, which is why it
  // is LIQUID's differentia, "substance that one pours" (localization C26). German gießen is strong
  // (goss, gegossen); Spanish verter stem-changes e → ie under the stress.
  {
    id: 'POUR',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to make a liquid flow out of a container',
    emoji: '🫗',
    forms: {
      en: {
        base: 'pour',
        '1sg_present': 'pour', '2sg_present': 'pour', '3sg_present': 'pours',
        '1pl_present': 'pour', '2pl_present': 'pour', '3pl_present': 'pour',
        past: 'poured',
      },
      it: {
        base: 'versare',
        '1sg_present': 'verso', '2sg_present': 'versi', '3sg_present': 'versa',
        '1pl_present': 'versiamo', '2pl_present': 'versate', '3pl_present': 'versano',
        '1sg_past': 'versai', '2sg_past': 'versasti', '3sg_past': 'versò',
        '1pl_past': 'versammo', '2pl_past': 'versaste', '3pl_past': 'versarono',
        '1sg_future': 'verserò', '2sg_future': 'verserai', '3sg_future': 'verserà',
        '1pl_future': 'verseremo', '2pl_future': 'verserete', '3pl_future': 'verseranno',
      },
      fr: {
        base: 'verser',
        '1sg_present': 'verse', '2sg_present': 'verses', '3sg_present': 'verse',
        '1pl_present': 'versons', '2pl_present': 'versez', '3pl_present': 'versent',
        '1sg_past': 'versai', '2sg_past': 'versas', '3sg_past': 'versa',
        '1pl_past': 'versâmes', '2pl_past': 'versâtes', '3pl_past': 'versèrent',
        '1sg_future': 'verserai', '2sg_future': 'verseras', '3sg_future': 'versera',
        '1pl_future': 'verserons', '2pl_future': 'verserez', '3pl_future': 'verseront',
      },
      de: {
        base: 'gießen',
        '1sg_present': 'gieße', '2sg_present': 'gießt', '3sg_present': 'gießt',
        '1pl_present': 'gießen', '2pl_present': 'gießt', '3pl_present': 'gießen',
        '1sg_past': 'goss', '2sg_past': 'gossest', '3sg_past': 'goss',
        '1pl_past': 'gossen', '2pl_past': 'gosst', '3pl_past': 'gossen',
      },
      es: {
        base: 'verter',
        '1sg_present': 'vierto', '2sg_present': 'viertes', '3sg_present': 'vierte',
        '1pl_present': 'vertemos', '2pl_present': 'vertéis', '3pl_present': 'vierten',
        '1sg_past': 'vertí', '2sg_past': 'vertiste', '3sg_past': 'vertió',
        '1pl_past': 'vertimos', '2pl_past': 'vertisteis', '3pl_past': 'vertieron',
        '1sg_future': 'verteré', '2sg_future': 'verterás', '3sg_future': 'verterá',
        '1pl_future': 'verteremos', '2pl_future': 'verteréis', '3pl_future': 'verterán',
      },
      ja: {
        base: '注ぐ',
        reading: 'そそぐ',
        masu_present: '注ぎます',
        masu_present_reading: 'そそぎます',
      },
      pt: {
        base: 'verter',
        '1sg_present': 'verto', '2sg_present': 'verte', '3sg_present': 'verte',
        '1pl_present': 'vertemos', '2pl_present': 'vertem', '3pl_present': 'vertem',
        '1sg_past': 'verti', '2sg_past': 'verteu', '3sg_past': 'verteu',
        '1pl_past': 'vertemos', '2pl_past': 'verteram', '3pl_past': 'verteram',
        '1sg_future': 'verterei', '2sg_future': 'verterá', '3sg_future': 'verterá',
        '1pl_future': 'verteremos', '2pl_future': 'verterão', '3pl_future': 'verterão',
      },
    },
  },

  {
    // The genus of EAT ("to consume food") and DRINK ("to consume liquid") — the ingestion verb
    // their dictionary definitions cite as their genus (see the B08 verb-definition catalogue and
    // the infinitive render mode). Japanese has no single "consume food+drink" verb; 摂取する
    // ("to ingest / take in") is the natural hypernym of 食べる and 飲む.
    id: 'CONSUME',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to ingest food or drink',
    emoji: '🍽️',
    forms: {
      en: {
        base: 'consume',
        '1sg_present': 'consume', '2sg_present': 'consume', '3sg_present': 'consumes',
        '1pl_present': 'consume', '2pl_present': 'consume', '3pl_present': 'consume',
        past: 'consumed',
      },
      it: {
        base: 'consumare',
        '1sg_present': 'consumo', '2sg_present': 'consumi', '3sg_present': 'consuma',
        '1pl_present': 'consumiamo', '2pl_present': 'consumate', '3pl_present': 'consumano',
        '1sg_past': 'consumai', '2sg_past': 'consumasti', '3sg_past': 'consumò',
        '1pl_past': 'consumammo', '2pl_past': 'consumaste', '3pl_past': 'consumarono',
        '1sg_future': 'consumerò', '2sg_future': 'consumerai', '3sg_future': 'consumerà',
        '1pl_future': 'consumeremo', '2pl_future': 'consumerete', '3pl_future': 'consumeranno',
      },
      fr: {
        base: 'consommer',
        '1sg_present': 'consomme', '2sg_present': 'consommes', '3sg_present': 'consomme',
        '1pl_present': 'consommons', '2pl_present': 'consommez', '3pl_present': 'consomment',
        '1sg_past': 'consommai', '2sg_past': 'consommas', '3sg_past': 'consomma',
        '1pl_past': 'consommâmes', '2pl_past': 'consommâtes', '3pl_past': 'consommèrent',
        '1sg_future': 'consommerai', '2sg_future': 'consommeras', '3sg_future': 'consommera',
        '1pl_future': 'consommerons', '2pl_future': 'consommerez', '3pl_future': 'consommeront',
      },
      de: {
        base: 'konsumieren',
        '1sg_present': 'konsumiere', '2sg_present': 'konsumierst', '3sg_present': 'konsumiert',
        '1pl_present': 'konsumieren', '2pl_present': 'konsumiert', '3pl_present': 'konsumieren',
        '1sg_past': 'konsumierte', '2sg_past': 'konsumiertest', '3sg_past': 'konsumierte',
        '1pl_past': 'konsumierten', '2pl_past': 'konsumiertet', '3pl_past': 'konsumierten',
      },
      es: {
        base: 'consumir',
        '1sg_present': 'consumo', '2sg_present': 'consumes', '3sg_present': 'consume',
        '1pl_present': 'consumimos', '2pl_present': 'consumís', '3pl_present': 'consumen',
        '1sg_past': 'consumí', '2sg_past': 'consumiste', '3sg_past': 'consumió',
        '1pl_past': 'consumimos', '2pl_past': 'consumisteis', '3pl_past': 'consumieron',
        '1sg_future': 'consumiré', '2sg_future': 'consumirás', '3sg_future': 'consumirá',
        '1pl_future': 'consumiremos', '2pl_future': 'consumiréis', '3pl_future': 'consumirán',
      },
      ja: {
        base: '摂取する',
        reading: 'せっしゅする',
        masu_present: '摂取します',
        masu_present_reading: 'せっしゅします',
      },
      pt: {
        base: 'consumir',
        '1sg_present': 'consumo', '2sg_present': 'consome', '3sg_present': 'consome',
        '1pl_present': 'consumimos', '2pl_present': 'consomem', '3pl_present': 'consomem',
        '1sg_past': 'consumi', '2sg_past': 'consumiu', '3sg_past': 'consumiu',
        '1pl_past': 'consumimos', '2pl_past': 'consumiram', '3pl_past': 'consumiram',
        '1sg_future': 'consumirei', '2sg_future': 'consumirá', '3sg_future': 'consumirá',
        '1pl_future': 'consumiremos', '2pl_future': 'consumirão', '3pl_future': 'consumirão',
      },
    },
  },

  {
    id: 'SEE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to perceive with the eyes',
    definition: infinitiveGloss('PERCEIVE', 'LIGHT'),
    emoji: '👁️',
    isA: 'PERCEIVE',
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
        '2sg_imperative': 'sieh', // strong e→ie: the du command keeps the vowel change
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
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to feel deep affection',
    definition: infinitiveGloss('FEEL', 'AFFECTION'),
    emoji: '❤️',
    isA: 'FEEL',
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

  // Wanting as a lexical verb, the genus of the volitional modal WILL ("to desire to act",
  // localization C09). WILL's own words are the plain "want" (volere, vouloir, wollen, querer, 〜たい),
  // so its gloss needs a different verb in every language to say anything. It takes a direct object
  // ("desires the food") or an infinitive complement bare in the Romance languages ("desiderare
  // agire", "désirer agir"); Japanese 望む takes its こと clause with を. A state, like LOVE.
  {
    id: 'DESIRE',
    role: 'verb',
    // Takes an infinitive complement as its object (P09-E12 D9): the builder's subordinate-clause menu offers *to*.
    clauseObject: 'infinitive',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to long for; to wish for strongly',
    synonym: 'long for',
    emoji: '🌠',
    forms: {
      en: {
        base: 'desire',
        '1sg_present': 'desire', '2sg_present': 'desire', '3sg_present': 'desires',
        '1pl_present': 'desire', '2pl_present': 'desire', '3pl_present': 'desire',
        past: 'desired',
      },
      it: {
        base: 'desiderare',
        '1sg_present': 'desidero', '2sg_present': 'desideri', '3sg_present': 'desidera',
        '1pl_present': 'desideriamo', '2pl_present': 'desiderate', '3pl_present': 'desiderano',
        '1sg_past': 'desiderai', '2sg_past': 'desiderasti', '3sg_past': 'desiderò',
        '1pl_past': 'desiderammo', '2pl_past': 'desideraste', '3pl_past': 'desiderarono',
        '1sg_future': 'desidererò', '2sg_future': 'desidererai', '3sg_future': 'desidererà',
        '1pl_future': 'desidereremo', '2pl_future': 'desidererete', '3pl_future': 'desidereranno',
      },
      fr: {
        base: 'désirer',
        '1sg_present': 'désire', '2sg_present': 'désires', '3sg_present': 'désire',
        '1pl_present': 'désirons', '2pl_present': 'désirez', '3pl_present': 'désirent',
        '1sg_past': 'désirai', '2sg_past': 'désiras', '3sg_past': 'désira',
        '1pl_past': 'désirâmes', '2pl_past': 'désirâtes', '3pl_past': 'désirèrent',
        '1sg_future': 'désirerai', '2sg_future': 'désireras', '3sg_future': 'désirera',
        '1pl_future': 'désirerons', '2pl_future': 'désirerez', '3pl_future': 'désireront',
      },
      de: {
        base: 'wünschen',
        '1sg_present': 'wünsche', '2sg_present': 'wünschst', '3sg_present': 'wünscht',
        '1pl_present': 'wünschen', '2pl_present': 'wünscht', '3pl_present': 'wünschen',
        '1sg_past': 'wünschte', '2sg_past': 'wünschtest', '3sg_past': 'wünschte',
        '1pl_past': 'wünschten', '2pl_past': 'wünschtet', '3pl_past': 'wünschten',
      },
      es: {
        base: 'desear',
        '1sg_present': 'deseo', '2sg_present': 'deseas', '3sg_present': 'desea',
        '1pl_present': 'deseamos', '2pl_present': 'deseáis', '3pl_present': 'desean',
        '1sg_past': 'deseé', '2sg_past': 'deseaste', '3sg_past': 'deseó',
        '1pl_past': 'deseamos', '2pl_past': 'deseasteis', '3pl_past': 'desearon',
        '1sg_future': 'desearé', '2sg_future': 'desearás', '3sg_future': 'deseará',
        '1pl_future': 'desearemos', '2pl_future': 'desearéis', '3pl_future': 'desearán',
      },
      ja: {
        base: '望む',
        reading: 'のぞむ',
        masu_present: '望みます',
        masu_present_reading: 'のぞみます',
        // The こと clause it governs is its object: 行動することを望む.
        infinitive_link: 'ことを',
      },
      pt: {
        base: 'desejar',
        '1sg_present': 'desejo', '2sg_present': 'deseja', '3sg_present': 'deseja',
        '1pl_present': 'desejamos', '2pl_present': 'desejam', '3pl_present': 'desejam',
        '1sg_past': 'desejei', '2sg_past': 'desejou', '3sg_past': 'desejou',
        '1pl_past': 'desejamos', '2pl_past': 'desejaram', '3pl_past': 'desejaram',
        '1sg_future': 'desejarei', '2sg_future': 'desejará', '3sg_future': 'desejará',
        '1pl_future': 'desejaremos', '2pl_future': 'desejarão', '3pl_future': 'desejarão',
      },
    },
  },

  {
    id: 'KILL',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to cause the death of',
    definition: infinitiveGloss('DESTROY', 'LIFE'),
    emoji: '🔪',
    forms: {
      en: {
        base: 'kill',
        '1sg_present': 'kill', '2sg_present': 'kill', '3sg_present': 'kills',
        '1pl_present': 'kill', '2pl_present': 'kill', '3pl_present': 'kill',
        past: 'killed',
      },
      it: {
        base: 'uccidere',
        '1sg_present': 'uccido', '2sg_present': 'uccidi', '3sg_present': 'uccide',
        '1pl_present': 'uccidiamo', '2pl_present': 'uccidete', '3pl_present': 'uccidono',
        '1sg_past': 'uccisi', '2sg_past': 'uccidesti', '3sg_past': 'uccise',
        '1pl_past': 'uccidemmo', '2pl_past': 'uccideste', '3pl_past': 'uccisero',
        '1sg_future': 'ucciderò', '2sg_future': 'ucciderai', '3sg_future': 'ucciderà',
        '1pl_future': 'uccideremo', '2pl_future': 'ucciderete', '3pl_future': 'uccideranno',
      },
      fr: {
        base: 'tuer',
        '1sg_present': 'tue', '2sg_present': 'tues', '3sg_present': 'tue',
        '1pl_present': 'tuons', '2pl_present': 'tuez', '3pl_present': 'tuent',
        '1sg_past': 'tuai', '2sg_past': 'tuas', '3sg_past': 'tua',
        '1pl_past': 'tuâmes', '2pl_past': 'tuâtes', '3pl_past': 'tuèrent',
        '1sg_future': 'tuerai', '2sg_future': 'tueras', '3sg_future': 'tuera',
        '1pl_future': 'tuerons', '2pl_future': 'tuerez', '3pl_future': 'tueront',
      },
      de: {
        base: 'töten',
        '1sg_present': 'töte', '2sg_present': 'tötest', '3sg_present': 'tötet',
        '1pl_present': 'töten', '2pl_present': 'tötet', '3pl_present': 'töten',
        '1sg_past': 'tötete', '2sg_past': 'tötetest', '3sg_past': 'tötete',
        '1pl_past': 'töteten', '2pl_past': 'tötetet', '3pl_past': 'töteten',
      },
      es: {
        base: 'matar',
        '1sg_present': 'mato', '2sg_present': 'matas', '3sg_present': 'mata',
        '1pl_present': 'matamos', '2pl_present': 'matáis', '3pl_present': 'matan',
        '1sg_past': 'maté', '2sg_past': 'mataste', '3sg_past': 'mató',
        '1pl_past': 'matamos', '2pl_past': 'matasteis', '3pl_past': 'mataron',
        '1sg_future': 'mataré', '2sg_future': 'matarás', '3sg_future': 'matará',
        '1pl_future': 'mataremos', '2pl_future': 'mataréis', '3pl_future': 'matarán',
      },
      ja: {
        base: '殺す',
        reading: 'ころす',
        masu_present: '殺します',
        masu_present_reading: 'ころします',
      },
      pt: {
        base: 'matar',
        '1sg_present': 'mato', '2sg_present': 'mata', '3sg_present': 'mata',
        '1pl_present': 'matamos', '2pl_present': 'matam', '3pl_present': 'matam',
        '1sg_past': 'matei', '2sg_past': 'matou', '3sg_past': 'matou',
        '1pl_past': 'matamos', '2pl_past': 'mataram', '3pl_past': 'mataram',
        '1sg_future': 'matarei', '2sg_future': 'matará', '3sg_future': 'matará',
        '1pl_future': 'mataremos', '2pl_future': 'matarão', '3pl_future': 'matarão',
      },
    },
  },

  {
    id: 'KNOW',
    role: 'verb',
    // Takes a that-clause as its object (P09-E12 D9): the builder's subordinate-clause menu offers *that*.
    // It may report a question too, "knows where the cat eats" (`content_clause_force`, P09-E17).
    clauseObject: 'content',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['cause'],
    description: 'to have knowledge or understanding of',
    // Italian, French, Spanish, Portuguese and German have two verbs for "know": one for a fact, with no
    // object or a clause (sapere, savoir, saber, wissen), and one for a person, place, thing or idea
    // (conoscere, connaître, conocer, conhecer, kennen). English and Japanese have one. The user picks
    // KNOW either way; `object_sense` names the concept the translator swaps in when the verb takes an
    // object (A131).
    definition: infinitiveGloss('UNDERSTAND', 'CONCEPT', 'plural'),
    emoji: '🧠',
    forms: {
      en: {
        base: 'know', content_clause_force: 'either',
        '1sg_present': 'know', '2sg_present': 'know', '3sg_present': 'knows',
        '1pl_present': 'know', '2pl_present': 'know', '3pl_present': 'know',
        past: 'knew',
      },
      it: {
        base: 'sapere', content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED',
        '1sg_present': 'so', '2sg_present': 'sai', '3sg_present': 'sa',
        '1pl_present': 'sappiamo', '2pl_present': 'sapete', '3pl_present': 'sanno',
        '1sg_past': 'seppi', '2sg_past': 'sapesti', '3sg_past': 'seppe',
        '1pl_past': 'sapemmo', '2pl_past': 'sapeste', '3pl_past': 'seppero',
        '1sg_future': 'saprò', '2sg_future': 'saprai', '3sg_future': 'saprà',
        '1pl_future': 'sapremo', '2pl_future': 'saprete', '3pl_future': 'sapranno',
      },
      fr: {
        base: 'savoir', content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED',
        '1sg_present': 'sais', '2sg_present': 'sais', '3sg_present': 'sait',
        '1pl_present': 'savons', '2pl_present': 'savez', '3pl_present': 'savent',
        '1sg_past': 'sus', '2sg_past': 'sus', '3sg_past': 'sut',
        '1pl_past': 'sûmes', '2pl_past': 'sûtes', '3pl_past': 'surent',
        '1sg_future': 'saurai', '2sg_future': 'sauras', '3sg_future': 'saura',
        '1pl_future': 'saurons', '2pl_future': 'saurez', '3pl_future': 'sauront',
      },
      de: {
        base: 'wissen', content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED',
        '1sg_present': 'weiß', '2sg_present': 'weißt', '3sg_present': 'weiß',
        '1pl_present': 'wissen', '2pl_present': 'wisst', '3pl_present': 'wissen',
        '1sg_past': 'wusste', '2sg_past': 'wusstest', '3sg_past': 'wusste',
        '1pl_past': 'wussten', '2pl_past': 'wusstet', '3pl_past': 'wussten',
        '2sg_imperative': 'wisse', // suppletive du command
      },
      es: {
        base: 'saber', content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED',
        '1sg_present': 'sé', '2sg_present': 'sabes', '3sg_present': 'sabe',
        '1pl_present': 'sabemos', '2pl_present': 'sabéis', '3pl_present': 'saben',
        '1sg_past': 'supe', '2sg_past': 'supiste', '3sg_past': 'supo',
        '1pl_past': 'supimos', '2pl_past': 'supisteis', '3pl_past': 'supieron',
        '1sg_future': 'sabré', '2sg_future': 'sabrás', '3sg_future': 'sabrá',
        '1pl_future': 'sabremos', '2pl_future': 'sabréis', '3pl_future': 'sabrán',
      },
      ja: {
        // A state, so a main clause says it with 〜ている (知っています); but the state's negative is the
        // plain event form, 知りません, never 知っていません (`event_negative`, A132).
        base: '知る', content_clause_force: 'either',
        reading: 'しる',
        masu_present: '知ります',
        masu_present_reading: 'しります',
        event_negative: '1',
      },
      pt: {
        base: 'saber', content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED',
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
    // KNOW's acquaintance sense: knowing a person, a place, a thing or an idea, which five languages say
    // with a verb of its own (A131). The translator selects it for KNOW with an object (`object_sense`),
    // so it is a sense of KNOW and no picker offers it. English and Japanese have one verb for both.
    id: 'KNOW_ACQUAINTED',
    role: 'verb',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    senseOf: 'KNOW',
    transitivity: 'transitive',
    complements: ['cause'],
    description: 'to be acquainted or familiar with',
    emoji: '🧠',
    forms: {
      en: {
        base: 'know',
        '1sg_present': 'know', '2sg_present': 'know', '3sg_present': 'knows',
        '1pl_present': 'know', '2pl_present': 'know', '3pl_present': 'know',
        past: 'knew',
      },
      it: {
        base: 'conoscere',
        '1sg_present': 'conosco', '2sg_present': 'conosci', '3sg_present': 'conosce',
        '1pl_present': 'conosciamo', '2pl_present': 'conoscete', '3pl_present': 'conoscono',
        '1sg_past': 'conobbi', '2sg_past': 'conoscesti', '3sg_past': 'conobbe',
        '1pl_past': 'conoscemmo', '2pl_past': 'conosceste', '3pl_past': 'conobbero',
        '1sg_future': 'conoscerò', '2sg_future': 'conoscerai', '3sg_future': 'conoscerà',
        '1pl_future': 'conosceremo', '2pl_future': 'conoscerete', '3pl_future': 'conosceranno',
      },
      fr: {
        base: 'connaître',
        '1sg_present': 'connais', '2sg_present': 'connais', '3sg_present': 'connaît',
        '1pl_present': 'connaissons', '2pl_present': 'connaissez', '3pl_present': 'connaissent',
        '1sg_past': 'connus', '2sg_past': 'connus', '3sg_past': 'connut',
        '1pl_past': 'connûmes', '2pl_past': 'connûtes', '3pl_past': 'connurent',
        '1sg_future': 'connaîtrai', '2sg_future': 'connaîtras', '3sg_future': 'connaîtra',
        '1pl_future': 'connaîtrons', '2pl_future': 'connaîtrez', '3pl_future': 'connaîtront',
      },
      de: {
        base: 'kennen',
        '1sg_present': 'kenne', '2sg_present': 'kennst', '3sg_present': 'kennt',
        '1pl_present': 'kennen', '2pl_present': 'kennt', '3pl_present': 'kennen',
        '1sg_past': 'kannte', '2sg_past': 'kanntest', '3sg_past': 'kannte',
        '1pl_past': 'kannten', '2pl_past': 'kanntet', '3pl_past': 'kannten',
      },
      es: {
        base: 'conocer',
        '1sg_present': 'conozco', '2sg_present': 'conoces', '3sg_present': 'conoce',
        '1pl_present': 'conocemos', '2pl_present': 'conocéis', '3pl_present': 'conocen',
        '1sg_past': 'conocí', '2sg_past': 'conociste', '3sg_past': 'conoció',
        '1pl_past': 'conocimos', '2pl_past': 'conocisteis', '3pl_past': 'conocieron',
        '1sg_future': 'conoceré', '2sg_future': 'conocerás', '3sg_future': 'conocerá',
        '1pl_future': 'conoceremos', '2pl_future': 'conoceréis', '3pl_future': 'conocerán',
      },
      ja: {
        base: '知る',
        reading: 'しる',
        masu_present: '知ります',
        masu_present_reading: 'しります',
        event_negative: '1',
      },
      pt: {
        base: 'conhecer',
        '1sg_present': 'conheço', '2sg_present': 'conhece', '3sg_present': 'conhece',
        '1pl_present': 'conhecemos', '2pl_present': 'conhecem', '3pl_present': 'conhecem',
        '1sg_past': 'conheci', '2sg_past': 'conheceu', '3sg_past': 'conheceu',
        '1pl_past': 'conhecemos', '2pl_past': 'conheceram', '3pl_past': 'conheceram',
        '1sg_future': 'conhecerei', '2sg_future': 'conhecerá', '3sg_future': 'conhecerá',
        '1pl_future': 'conheceremos', '2pl_future': 'conhecerão', '3pl_future': 'conhecerão',
      },
    },
  },

  {
    // E24's *remember* (rank 334): to keep in mind. A state, as KNOW is: the Romance past is its
    // imperfect (ricordava) and Japanese says it with 〜ている — 覚える alone is "to memorize", and
    // 覚えています is "remembers", which is why the flag is on (A130, A132). Unlike 知る its negative is
    // the state's own, 覚えていません ("does not remember"), so it takes no `event_negative`. French
    // se rappeler is pronominal with a direct object ("se rappelle le chien"), which avoids se
    // souvenir de; German sich erinnern is reflexive and takes the object with an + accusative
    // (`object_prep`: "erinnert sich an den Hund"); Italian, Spanish and Portuguese take it plain.
    id: 'REMEMBER',
    role: 'verb',
    stative: true, // a state of mind: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to keep in mind; to bring back to mind',
    // "still to know facts" (localization B86): KEEP's shape ("still to have objects") on KNOW, whose
    // noun object selects its acquaintance sense (conoscere, connaître, kennen, A131).
    definition: infinitiveGloss('KNOW', { object: 'FACT', number: 'plural', modifier: 'STILL' }),
    emoji: '💭',
    isA: 'KNOW',
    forms: {
      en: {
        base: 'remember',
        '1sg_present': 'remember', '2sg_present': 'remember', '3sg_present': 'remembers',
        '1pl_present': 'remember', '2pl_present': 'remember', '3pl_present': 'remember',
        past: 'remembered',
      },
      it: {
        base: 'ricordare',
        '1sg_present': 'ricordo', '2sg_present': 'ricordi', '3sg_present': 'ricorda',
        '1pl_present': 'ricordiamo', '2pl_present': 'ricordate', '3pl_present': 'ricordano',
        '1sg_past': 'ricordai', '2sg_past': 'ricordasti', '3sg_past': 'ricordò',
        '1pl_past': 'ricordammo', '2pl_past': 'ricordaste', '3pl_past': 'ricordarono',
        '1sg_future': 'ricorderò', '2sg_future': 'ricorderai', '3sg_future': 'ricorderà',
        '1pl_future': 'ricorderemo', '2pl_future': 'ricorderete', '3pl_future': 'ricorderanno',
      },
      fr: {
        // appeler doubles its l before a mute e: rappelle, rappellerai.
        // Its se is the indirect object, so the participle never agrees with the subject: "elle s'est
        // rappelé l'homme" (`reflexive_indirect`).
        base: 'se rappeler', reflexive_indirect: '1',
        '1sg_present': 'me rappelle', '2sg_present': 'te rappelles', '3sg_present': 'se rappelle',
        '1pl_present': 'nous rappelons', '2pl_present': 'vous rappelez', '3pl_present': 'se rappellent',
        '1sg_past': 'me rappelai', '2sg_past': 'te rappelas', '3sg_past': 'se rappela',
        '1pl_past': 'nous rappelâmes', '2pl_past': 'vous rappelâtes', '3pl_past': 'se rappelèrent',
        '1sg_future': 'me rappellerai', '2sg_future': 'te rappelleras', '3sg_future': 'se rappellera',
        '1pl_future': 'nous rappellerons', '2pl_future': 'vous rappellerez', '3pl_future': 'se rappelleront',
      },
      de: {
        // The plain verb's forms: the clause places the agreeing pronoun ("erinnert sich an …").
        base: 'sich erinnern', object_prep: 'an',
        '1sg_present': 'erinnere', '2sg_present': 'erinnerst', '3sg_present': 'erinnert',
        '1pl_present': 'erinnern', '2pl_present': 'erinnert', '3pl_present': 'erinnern',
        '1sg_past': 'erinnerte', '2sg_past': 'erinnertest', '3sg_past': 'erinnerte',
        '1pl_past': 'erinnerten', '2pl_past': 'erinnertet', '3pl_past': 'erinnerten',
        '2sg_imperative': 'erinnere', // a stem in -er keeps the du -e
      },
      es: {
        base: 'recordar',
        '1sg_present': 'recuerdo', '2sg_present': 'recuerdas', '3sg_present': 'recuerda',
        '1pl_present': 'recordamos', '2pl_present': 'recordáis', '3pl_present': 'recuerdan',
        '1sg_past': 'recordé', '2sg_past': 'recordaste', '3sg_past': 'recordó',
        '1pl_past': 'recordamos', '2pl_past': 'recordasteis', '3pl_past': 'recordaron',
        '1sg_future': 'recordaré', '2sg_future': 'recordarás', '3sg_future': 'recordará',
        '1pl_future': 'recordaremos', '2pl_future': 'recordaréis', '3pl_future': 'recordarán',
      },
      ja: {
        base: '覚える',
        reading: 'おぼえる',
        masu_present: '覚えます',
        masu_present_reading: 'おぼえます',
      },
      pt: {
        base: 'lembrar',
        '1sg_present': 'lembro', '2sg_present': 'lembra', '3sg_present': 'lembra',
        '1pl_present': 'lembramos', '2pl_present': 'lembram', '3pl_present': 'lembram',
        '1sg_past': 'lembrei', '2sg_past': 'lembrou', '3sg_past': 'lembrou',
        '1pl_past': 'lembramos', '2pl_past': 'lembraram', '3pl_past': 'lembraram',
        '1sg_future': 'lembrarei', '2sg_future': 'lembrará', '3sg_future': 'lembrará',
        '1pl_future': 'lembraremos', '2pl_future': 'lembrarão', '3pl_future': 'lembrarão',
      },
    },
  },

  {
    // E24's *consider* (rank 395): to think about, weigh up. The object-predicative *consider X a Y*
    // (considerare, considérer comme, halten für) is a later concept. Japanese 考慮する, since 考える is
    // THINK's; German erwägen ("weigh up") is strong and inseparable (erwog, erwogen), since betrachten
    // is the object-predicative sense.
    id: 'CONSIDER',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to think carefully about',
    // "to think about a thing" (localization B86): THINK with E2's topic, whose prepositions are
    // THINK's own (pensare a, penser à, an … denken, pensar en / em).
    definition: infinitiveGloss('THINK', {
      complements: { topic: { phrase: { concept: 'THING', definiteness: 'indefinite' } } },
    }),
    emoji: '🤔',
    isA: 'THINK',
    forms: {
      en: {
        base: 'consider',
        '1sg_present': 'consider', '2sg_present': 'consider', '3sg_present': 'considers',
        '1pl_present': 'consider', '2pl_present': 'consider', '3pl_present': 'consider',
        past: 'considered',
      },
      it: {
        base: 'considerare',
        '1sg_present': 'considero', '2sg_present': 'consideri', '3sg_present': 'considera',
        '1pl_present': 'consideriamo', '2pl_present': 'considerate', '3pl_present': 'considerano',
        '1sg_past': 'considerai', '2sg_past': 'considerasti', '3sg_past': 'considerò',
        '1pl_past': 'considerammo', '2pl_past': 'consideraste', '3pl_past': 'considerarono',
        '1sg_future': 'considererò', '2sg_future': 'considererai', '3sg_future': 'considererà',
        '1pl_future': 'considereremo', '2pl_future': 'considererete', '3pl_future': 'considereranno',
      },
      fr: {
        // considérer opens its é to è before a mute ending (considère), and keeps é in the future.
        base: 'considérer',
        '1sg_present': 'considère', '2sg_present': 'considères', '3sg_present': 'considère',
        '1pl_present': 'considérons', '2pl_present': 'considérez', '3pl_present': 'considèrent',
        '1sg_past': 'considérai', '2sg_past': 'considéras', '3sg_past': 'considéra',
        '1pl_past': 'considérâmes', '2pl_past': 'considérâtes', '3pl_past': 'considérèrent',
        '1sg_future': 'considérerai', '2sg_future': 'considéreras', '3sg_future': 'considérera',
        '1pl_future': 'considérerons', '2pl_future': 'considérerez', '3pl_future': 'considéreront',
      },
      de: {
        base: 'erwägen',
        '1sg_present': 'erwäge', '2sg_present': 'erwägst', '3sg_present': 'erwägt',
        '1pl_present': 'erwägen', '2pl_present': 'erwägt', '3pl_present': 'erwägen',
        '1sg_past': 'erwog', '2sg_past': 'erwogst', '3sg_past': 'erwog',
        '1pl_past': 'erwogen', '2pl_past': 'erwogt', '3pl_past': 'erwogen',
      },
      es: {
        base: 'considerar',
        '1sg_present': 'considero', '2sg_present': 'consideras', '3sg_present': 'considera',
        '1pl_present': 'consideramos', '2pl_present': 'consideráis', '3pl_present': 'consideran',
        '1sg_past': 'consideré', '2sg_past': 'consideraste', '3sg_past': 'consideró',
        '1pl_past': 'consideramos', '2pl_past': 'considerasteis', '3pl_past': 'consideraron',
        '1sg_future': 'consideraré', '2sg_future': 'considerarás', '3sg_future': 'considerará',
        '1pl_future': 'consideraremos', '2pl_future': 'consideraréis', '3pl_future': 'considerarán',
      },
      ja: {
        base: '考慮する',
        reading: 'こうりょする',
        masu_present: '考慮します',
        masu_present_reading: 'こうりょします',
      },
      pt: {
        base: 'considerar',
        '1sg_present': 'considero', '2sg_present': 'considera', '3sg_present': 'considera',
        '1pl_present': 'consideramos', '2pl_present': 'consideram', '3pl_present': 'consideram',
        '1sg_past': 'considerei', '2sg_past': 'considerou', '3sg_past': 'considerou',
        '1pl_past': 'consideramos', '2pl_past': 'consideraram', '3pl_past': 'consideraram',
        '1sg_future': 'considerarei', '2sg_future': 'considerará', '3sg_future': 'considerará',
        '1pl_future': 'consideraremos', '2pl_future': 'considerarão', '3pl_future': 'considerarão',
      },
    },
  },

  {
    // UNEXPECTED is what one does not expect (localization C23). Italian takes prevedere, "foresee":
    // aspettarsi, the everyday verb, is pronominal and transitive, a shape no Italian verb has yet.
    // French attendre, the verb of "inattendu" (qu'on n'attendait pas). Japanese 予想する, not 予期する:
    // 予期しない is UNEXPECTED's own Japanese, so its gloss would have been the word itself.
    id: 'EXPECT',
    role: 'verb',
    stative: true, // a state of mind: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['cause'],
    description: 'to regard something as likely to happen or arrive',
    emoji: '🔮',
    forms: {
      en: {
        base: 'expect',
        '1sg_present': 'expect', '2sg_present': 'expect', '3sg_present': 'expects',
        '1pl_present': 'expect', '2pl_present': 'expect', '3pl_present': 'expect',
        past: 'expected',
      },
      it: {
        base: 'prevedere',
        '1sg_present': 'prevedo', '2sg_present': 'prevedi', '3sg_present': 'prevede',
        '1pl_present': 'prevediamo', '2pl_present': 'prevedete', '3pl_present': 'prevedono',
        '1sg_past': 'previdi', '2sg_past': 'prevedesti', '3sg_past': 'previde',
        '1pl_past': 'prevedemmo', '2pl_past': 'prevedeste', '3pl_past': 'previdero',
        '1sg_future': 'prevederò', '2sg_future': 'prevederai', '3sg_future': 'prevederà',
        '1pl_future': 'prevederemo', '2pl_future': 'prevederete', '3pl_future': 'prevederanno',
      },
      fr: {
        base: 'attendre',
        '1sg_present': 'attends', '2sg_present': 'attends', '3sg_present': 'attend',
        '1pl_present': 'attendons', '2pl_present': 'attendez', '3pl_present': 'attendent',
        '1sg_past': 'attendis', '2sg_past': 'attendis', '3sg_past': 'attendit',
        '1pl_past': 'attendîmes', '2pl_past': 'attendîtes', '3pl_past': 'attendirent',
        '1sg_future': 'attendrai', '2sg_future': 'attendras', '3sg_future': 'attendra',
        '1pl_future': 'attendrons', '2pl_future': 'attendrez', '3pl_future': 'attendront',
        // Localization C41: a similative clause gaps what one expects, and French says it with the
        // pronominal s'attendre à, the "à" resumed by "y": "comme on s'y attend" (OF_COURSE's gloss),
        // where "comme on attend" is "as one waits".
        as_clitic: 'y', as_pronominal: '1',
      },
      de: {
        base: 'erwarten',
        '1sg_present': 'erwarte', '2sg_present': 'erwartest', '3sg_present': 'erwartet',
        '1pl_present': 'erwarten', '2pl_present': 'erwartet', '3pl_present': 'erwarten',
        '1sg_past': 'erwartete', '2sg_past': 'erwartetest', '3sg_past': 'erwartete',
        '1pl_past': 'erwarteten', '2pl_past': 'erwartetet', '3pl_past': 'erwarteten',
        '2sg_imperative': 'erwarte',
      },
      es: {
        base: 'esperar',
        '1sg_present': 'espero', '2sg_present': 'esperas', '3sg_present': 'espera',
        '1pl_present': 'esperamos', '2pl_present': 'esperáis', '3pl_present': 'esperan',
        '1sg_past': 'esperé', '2sg_past': 'esperaste', '3sg_past': 'esperó',
        '1pl_past': 'esperamos', '2pl_past': 'esperasteis', '3pl_past': 'esperaron',
        '1sg_future': 'esperaré', '2sg_future': 'esperarás', '3sg_future': 'esperará',
        '1pl_future': 'esperaremos', '2pl_future': 'esperaréis', '3pl_future': 'esperarán',
      },
      ja: {
        base: '予想する',
        reading: 'よそうする',
        masu_present: '予想します',
        masu_present_reading: 'よそうします',
      },
      pt: {
        base: 'esperar',
        '1sg_present': 'espero', '2sg_present': 'espera', '3sg_present': 'espera',
        '1pl_present': 'esperamos', '2pl_present': 'esperam', '3pl_present': 'esperam',
        '1sg_past': 'esperei', '2sg_past': 'esperou', '3sg_past': 'esperou',
        '1pl_past': 'esperamos', '2pl_past': 'esperaram', '3pl_past': 'esperaram',
        '1sg_future': 'esperarei', '2sg_future': 'esperará', '3sg_future': 'esperará',
        '1pl_future': 'esperaremos', '2pl_future': 'esperarão', '3pl_future': 'esperarão',
      },
    },
  },

  {
    id: 'READ',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'terminus', 'cause', 'locative'],
    description: 'to look at and understand written text',
    definition: infinitiveGloss('UNDERSTAND', 'WORD', 'plural', ['WRITTEN']),
    emoji: '📖',
    isA: 'UNDERSTAND',
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
        '2sg_imperative': 'lies', // strong e→ie: the du command keeps the vowel change
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
    id: 'CRY_OUT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative', 'terminus'],
    description: 'to cry out; to shout or exclaim loudly',
    definition: infinitiveGloss('PRODUCE', 'SOUND', 'plural', ['LOUD']),
    emoji: '📢',
    synonym: 'shout',
    // The cry of a danger (an `alarm` noun) is the shout itself, "Wolf!", with no determiner of its
    // own: English "cried wolf", Italian and French a / à + the article, "gridò al lupo", "cria au
    // loup". Any other cry stays a plain object, "cried the word", "gridò la parola" (A124, A163).
    alarmCry: true,
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

  {
    id: 'BITE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to grip or cut into with the teeth',
    definition: infinitiveGloss('CUT', {
      complements: {
        instrumental: { phrase: { concept: 'TOOTH', definiteness: 'definite', number: 'plural' } },
      },
    }),
    emoji: '🦷',
    forms: {
      en: {
        base: 'bite',
        '1sg_present': 'bite', '2sg_present': 'bite', '3sg_present': 'bites',
        '1pl_present': 'bite', '2pl_present': 'bite', '3pl_present': 'bite',
        past: 'bit',
      },
      it: {
        base: 'mordere',
        '1sg_present': 'mordo', '2sg_present': 'mordi', '3sg_present': 'morde',
        '1pl_present': 'mordiamo', '2pl_present': 'mordete', '3pl_present': 'mordono',
        '1sg_past': 'morsi', '2sg_past': 'mordesti', '3sg_past': 'morse',
        '1pl_past': 'mordemmo', '2pl_past': 'mordeste', '3pl_past': 'morsero',
        '1sg_future': 'morderò', '2sg_future': 'morderai', '3sg_future': 'morderà',
        '1pl_future': 'morderemo', '2pl_future': 'morderete', '3pl_future': 'morderanno',
      },
      fr: {
        base: 'mordre',
        '1sg_present': 'mords', '2sg_present': 'mords', '3sg_present': 'mord',
        '1pl_present': 'mordons', '2pl_present': 'mordez', '3pl_present': 'mordent',
        '1sg_past': 'mordis', '2sg_past': 'mordis', '3sg_past': 'mordit',
        '1pl_past': 'mordîmes', '2pl_past': 'mordîtes', '3pl_past': 'mordirent',
        '1sg_future': 'mordrai', '2sg_future': 'mordras', '3sg_future': 'mordra',
        '1pl_future': 'mordrons', '2pl_future': 'mordrez', '3pl_future': 'mordront',
      },
      de: {
        base: 'beißen',
        '1sg_present': 'beiße', '2sg_present': 'beißt', '3sg_present': 'beißt',
        '1pl_present': 'beißen', '2pl_present': 'beißt', '3pl_present': 'beißen',
        '1sg_past': 'biss', '2sg_past': 'bissest', '3sg_past': 'biss',
        '1pl_past': 'bissen', '2pl_past': 'bisst', '3pl_past': 'bissen',
      },
      es: {
        base: 'morder',
        '1sg_present': 'muerdo', '2sg_present': 'muerdes', '3sg_present': 'muerde',
        '1pl_present': 'mordemos', '2pl_present': 'mordéis', '3pl_present': 'muerden',
        '1sg_past': 'mordí', '2sg_past': 'mordiste', '3sg_past': 'mordió',
        '1pl_past': 'mordimos', '2pl_past': 'mordisteis', '3pl_past': 'mordieron',
        '1sg_future': 'morderé', '2sg_future': 'morderás', '3sg_future': 'morderá',
        '1pl_future': 'morderemos', '2pl_future': 'morderéis', '3pl_future': 'morderán',
      },
      ja: {
        base: '噛む',
        reading: 'かむ',
        masu_present: '噛みます',
        masu_present_reading: 'かみます',
      },
      pt: {
        base: 'morder',
        '1sg_present': 'mordo', '2sg_present': 'morde', '3sg_present': 'morde',
        '1pl_present': 'mordemos', '2pl_present': 'mordem', '3pl_present': 'mordem',
        '1sg_past': 'mordi', '2sg_past': 'mordeu', '3sg_past': 'mordeu',
        '1pl_past': 'mordemos', '2pl_past': 'morderam', '3pl_past': 'morderam',
        '1sg_future': 'morderei', '2sg_future': 'morderá', '3sg_future': 'morderá',
        '1pl_future': 'morderemos', '2pl_future': 'morderão', '3pl_future': 'morderão',
      },
    },
  },

  {
    id: 'BEAT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to strike repeatedly; to defeat in a contest',
    definition: infinitiveGloss('STRIKE', { modifier: 'REPEATEDLY' }),
    emoji: '🥊',
    synonym: 'hit/defeat',
    isA: 'STRIKE',
    forms: {
      en: {
        base: 'beat',
        '1sg_present': 'beat', '2sg_present': 'beat', '3sg_present': 'beats',
        '1pl_present': 'beat', '2pl_present': 'beat', '3pl_present': 'beat',
        past: 'beat',
      },
      it: {
        base: 'battere',
        '1sg_present': 'batto', '2sg_present': 'batti', '3sg_present': 'batte',
        '1pl_present': 'battiamo', '2pl_present': 'battete', '3pl_present': 'battono',
        '1sg_past': 'battei', '2sg_past': 'battesti', '3sg_past': 'batté',
        '1pl_past': 'battemmo', '2pl_past': 'batteste', '3pl_past': 'batterono',
        '1sg_future': 'batterò', '2sg_future': 'batterai', '3sg_future': 'batterà',
        '1pl_future': 'batteremo', '2pl_future': 'batterete', '3pl_future': 'batteranno',
      },
      fr: {
        base: 'battre',
        '1sg_present': 'bats', '2sg_present': 'bats', '3sg_present': 'bat',
        '1pl_present': 'battons', '2pl_present': 'battez', '3pl_present': 'battent',
        '1sg_past': 'battis', '2sg_past': 'battis', '3sg_past': 'battit',
        '1pl_past': 'battîmes', '2pl_past': 'battîtes', '3pl_past': 'battirent',
        '1sg_future': 'battrai', '2sg_future': 'battras', '3sg_future': 'battra',
        '1pl_future': 'battrons', '2pl_future': 'battrez', '3pl_future': 'battront',
      },
      de: {
        base: 'schlagen',
        '1sg_present': 'schlage', '2sg_present': 'schlägst', '3sg_present': 'schlägt',
        '1pl_present': 'schlagen', '2pl_present': 'schlagt', '3pl_present': 'schlagen',
        '1sg_past': 'schlug', '2sg_past': 'schlugst', '3sg_past': 'schlug',
        '1pl_past': 'schlugen', '2pl_past': 'schlugt', '3pl_past': 'schlugen',
      },
      es: {
        base: 'batir',
        '1sg_present': 'bato', '2sg_present': 'bates', '3sg_present': 'bate',
        '1pl_present': 'batimos', '2pl_present': 'batís', '3pl_present': 'baten',
        '1sg_past': 'batí', '2sg_past': 'batiste', '3sg_past': 'batió',
        '1pl_past': 'batimos', '2pl_past': 'batisteis', '3pl_past': 'batieron',
        '1sg_future': 'batiré', '2sg_future': 'batirás', '3sg_future': 'batirá',
        '1pl_future': 'batiremos', '2pl_future': 'batiréis', '3pl_future': 'batirán',
      },
      ja: {
        base: '打つ',
        reading: 'うつ',
        masu_present: '打ちます',
        masu_present_reading: 'うちます',
      },
      pt: {
        base: 'bater',
        '1sg_present': 'bato', '2sg_present': 'bate', '3sg_present': 'bate',
        '1pl_present': 'batemos', '2pl_present': 'batem', '3pl_present': 'batem',
        '1sg_past': 'bati', '2sg_past': 'bateu', '3sg_past': 'bateu',
        '1pl_past': 'batemos', '2pl_past': 'bateram', '3pl_past': 'bateram',
        '1sg_future': 'baterei', '2sg_future': 'baterá', '3sg_future': 'baterá',
        '1pl_future': 'bateremos', '2pl_future': 'baterão', '3pl_future': 'baterão',
      },
    },
  },

  {
    id: 'SET_ON_FIRE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to set (something) on fire; to cause to burn',
    definition: infinitiveGloss('CREATE', 'FIRE'),
    emoji: '🧨',
    synonym: 'set on fire',
    forms: {
      en: {
        base: 'burn',
        '1sg_present': 'burn', '2sg_present': 'burn', '3sg_present': 'burns',
        '1pl_present': 'burn', '2pl_present': 'burn', '3pl_present': 'burn',
        past: 'burned',
      },
      it: {
        // labile: same verb as intransitive BURN, used transitively (bruciare qualcosa)
        base: 'bruciare',
        '1sg_present': 'brucio', '2sg_present': 'bruci', '3sg_present': 'brucia',
        '1pl_present': 'bruciamo', '2pl_present': 'bruciate', '3pl_present': 'bruciano',
        '1sg_past': 'bruciai', '2sg_past': 'bruciasti', '3sg_past': 'bruciò',
        '1pl_past': 'bruciammo', '2pl_past': 'bruciaste', '3pl_past': 'bruciarono',
        '1sg_future': 'brucerò', '2sg_future': 'brucerai', '3sg_future': 'brucerà',
        '1pl_future': 'bruceremo', '2pl_future': 'brucerete', '3pl_future': 'bruceranno',
      },
      fr: {
        // labile: brûler quelque chose
        base: 'brûler',
        '1sg_present': 'brûle', '2sg_present': 'brûles', '3sg_present': 'brûle',
        '1pl_present': 'brûlons', '2pl_present': 'brûlez', '3pl_present': 'brûlent',
        '1sg_past': 'brûlai', '2sg_past': 'brûlas', '3sg_past': 'brûla',
        '1pl_past': 'brûlâmes', '2pl_past': 'brûlâtes', '3pl_past': 'brûlèrent',
        '1sg_future': 'brûlerai', '2sg_future': 'brûleras', '3sg_future': 'brûlera',
        '1pl_future': 'brûlerons', '2pl_future': 'brûlerez', '3pl_future': 'brûleront',
      },
      de: {
        base: 'verbrennen',
        '1sg_present': 'verbrenne', '2sg_present': 'verbrennst', '3sg_present': 'verbrennt',
        '1pl_present': 'verbrennen', '2pl_present': 'verbrennt', '3pl_present': 'verbrennen',
        '1sg_past': 'verbrannte', '2sg_past': 'verbranntest', '3sg_past': 'verbrannte',
        '1pl_past': 'verbrannten', '2pl_past': 'verbranntet', '3pl_past': 'verbrannten',
      },
      es: {
        base: 'quemar',
        '1sg_present': 'quemo', '2sg_present': 'quemas', '3sg_present': 'quema',
        '1pl_present': 'quemamos', '2pl_present': 'quemáis', '3pl_present': 'queman',
        '1sg_past': 'quemé', '2sg_past': 'quemaste', '3sg_past': 'quemó',
        '1pl_past': 'quemamos', '2pl_past': 'quemasteis', '3pl_past': 'quemaron',
        '1sg_future': 'quemaré', '2sg_future': 'quemarás', '3sg_future': 'quemará',
        '1pl_future': 'quemaremos', '2pl_future': 'quemaréis', '3pl_future': 'quemarán',
      },
      ja: {
        base: '燃やす',
        reading: 'もやす',
        masu_present: '燃やします',
        masu_present_reading: 'もやします',
      },
      pt: {
        base: 'queimar',
        '1sg_present': 'queimo', '2sg_present': 'queima', '3sg_present': 'queima',
        '1pl_present': 'queimamos', '2pl_present': 'queimam', '3pl_present': 'queimam',
        '1sg_past': 'queimei', '2sg_past': 'queimou', '3sg_past': 'queimou',
        '1pl_past': 'queimamos', '2pl_past': 'queimaram', '3pl_past': 'queimaram',
        '1sg_future': 'queimarei', '2sg_future': 'queimará', '3sg_future': 'queimará',
        '1pl_future': 'queimaremos', '2pl_future': 'queimarão', '3pl_future': 'queimarão',
      },
    },
  },

  {
    id: 'EXTINGUISH',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to put out (a fire); to cause to stop burning',
    definition: infinitiveGloss('DESTROY', 'FIRE'),
    emoji: '🧯',
    synonym: 'extinguish',
    forms: {
      en: {
        // phrasal: the particle stays adjacent to the verb before a noun object ("puts out the
        // fire") and follows a pronoun one ("puts it out"), which the `particle` form tells the engine.
        base: 'put out',
        '1sg_present': 'put out', '2sg_present': 'put out', '3sg_present': 'puts out',
        '1pl_present': 'put out', '2pl_present': 'put out', '3pl_present': 'put out',
        past: 'put out',
        particle: 'out',
      },
      it: {
        base: 'spegnere',
        '1sg_present': 'spengo', '2sg_present': 'spegni', '3sg_present': 'spegne',
        '1pl_present': 'spegniamo', '2pl_present': 'spegnete', '3pl_present': 'spengono',
        '1sg_past': 'spensi', '2sg_past': 'spegnesti', '3sg_past': 'spense',
        '1pl_past': 'spegnemmo', '2pl_past': 'spegneste', '3pl_past': 'spensero',
        '1sg_future': 'spegnerò', '2sg_future': 'spegnerai', '3sg_future': 'spegnerà',
        '1pl_future': 'spegneremo', '2pl_future': 'spegnerete', '3pl_future': 'spegneranno',
      },
      fr: {
        base: 'éteindre',
        '1sg_present': 'éteins', '2sg_present': 'éteins', '3sg_present': 'éteint',
        '1pl_present': 'éteignons', '2pl_present': 'éteignez', '3pl_present': 'éteignent',
        '1sg_past': 'éteignis', '2sg_past': 'éteignis', '3sg_past': 'éteignit',
        '1pl_past': 'éteignîmes', '2pl_past': 'éteignîtes', '3pl_past': 'éteignirent',
        '1sg_future': 'éteindrai', '2sg_future': 'éteindras', '3sg_future': 'éteindra',
        '1pl_future': 'éteindrons', '2pl_future': 'éteindrez', '3pl_future': 'éteindront',
      },
      de: {
        base: 'löschen',
        '1sg_present': 'lösche', '2sg_present': 'löschst', '3sg_present': 'löscht',
        '1pl_present': 'löschen', '2pl_present': 'löscht', '3pl_present': 'löschen',
        '1sg_past': 'löschte', '2sg_past': 'löschtest', '3sg_past': 'löschte',
        '1pl_past': 'löschten', '2pl_past': 'löschtet', '3pl_past': 'löschten',
      },
      es: {
        base: 'apagar',
        '1sg_present': 'apago', '2sg_present': 'apagas', '3sg_present': 'apaga',
        '1pl_present': 'apagamos', '2pl_present': 'apagáis', '3pl_present': 'apagan',
        '1sg_past': 'apagué', '2sg_past': 'apagaste', '3sg_past': 'apagó',
        '1pl_past': 'apagamos', '2pl_past': 'apagasteis', '3pl_past': 'apagaron',
        '1sg_future': 'apagaré', '2sg_future': 'apagarás', '3sg_future': 'apagará',
        '1pl_future': 'apagaremos', '2pl_future': 'apagaréis', '3pl_future': 'apagarán',
      },
      ja: {
        base: '消す',
        reading: 'けす',
        masu_present: '消します',
        masu_present_reading: 'けします',
      },
      pt: {
        base: 'apagar',
        '1sg_present': 'apago', '2sg_present': 'apaga', '3sg_present': 'apaga',
        '1pl_present': 'apagamos', '2pl_present': 'apagam', '3pl_present': 'apagam',
        '1sg_past': 'apaguei', '2sg_past': 'apagou', '3sg_past': 'apagou',
        '1pl_past': 'apagamos', '2pl_past': 'apagaram', '3pl_past': 'apagaram',
        '1sg_future': 'apagarei', '2sg_future': 'apagará', '3sg_future': 'apagará',
        '1pl_future': 'apagaremos', '2pl_future': 'apagarão', '3pl_future': 'apagarão',
      },
    },
  },

  {
    id: 'BUY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative', 'source', 'instrumental'],
    description: 'to acquire in exchange for money',
    definition: infinitiveGloss('ACQUIRE', {
      object: 'OBJECT_THING',
      number: 'plural',
      complements: { instrumental: { phrase: { concept: 'MONEY', definiteness: 'bare' } } },
    }),
    emoji: '🛒',
    isA: 'ACQUIRE',
    forms: {
      en: {
        base: 'buy',
        '1sg_present': 'buy', '2sg_present': 'buy', '3sg_present': 'buys',
        '1pl_present': 'buy', '2pl_present': 'buy', '3pl_present': 'buy',
        past: 'bought',
      },
      it: {
        base: 'comprare',
        '1sg_present': 'compro', '2sg_present': 'compri', '3sg_present': 'compra',
        '1pl_present': 'compriamo', '2pl_present': 'comprate', '3pl_present': 'comprano',
        '1sg_past': 'comprai', '2sg_past': 'comprasti', '3sg_past': 'comprò',
        '1pl_past': 'comprammo', '2pl_past': 'compraste', '3pl_past': 'comprarono',
        '1sg_future': 'comprerò', '2sg_future': 'comprerai', '3sg_future': 'comprerà',
        '1pl_future': 'compreremo', '2pl_future': 'comprerete', '3pl_future': 'compreranno',
      },
      fr: {
        base: 'acheter',
        '1sg_present': 'achète', '2sg_present': 'achètes', '3sg_present': 'achète',
        '1pl_present': 'achetons', '2pl_present': 'achetez', '3pl_present': 'achètent',
        '1sg_past': 'achetai', '2sg_past': 'achetas', '3sg_past': 'acheta',
        '1pl_past': 'achetâmes', '2pl_past': 'achetâtes', '3pl_past': 'achetèrent',
        '1sg_future': 'achèterai', '2sg_future': 'achèteras', '3sg_future': 'achètera',
        '1pl_future': 'achèterons', '2pl_future': 'achèterez', '3pl_future': 'achèteront',
      },
      de: {
        base: 'kaufen',
        '1sg_present': 'kaufe', '2sg_present': 'kaufst', '3sg_present': 'kauft',
        '1pl_present': 'kaufen', '2pl_present': 'kauft', '3pl_present': 'kaufen',
        '1sg_past': 'kaufte', '2sg_past': 'kauftest', '3sg_past': 'kaufte',
        '1pl_past': 'kauften', '2pl_past': 'kauftet', '3pl_past': 'kauften',
      },
      es: {
        base: 'comprar',
        '1sg_present': 'compro', '2sg_present': 'compras', '3sg_present': 'compra',
        '1pl_present': 'compramos', '2pl_present': 'compráis', '3pl_present': 'compran',
        '1sg_past': 'compré', '2sg_past': 'compraste', '3sg_past': 'compró',
        '1pl_past': 'compramos', '2pl_past': 'comprasteis', '3pl_past': 'compraron',
        '1sg_future': 'compraré', '2sg_future': 'comprarás', '3sg_future': 'comprará',
        '1pl_future': 'compraremos', '2pl_future': 'compraréis', '3pl_future': 'comprarán',
      },
      ja: {
        base: '買う',
        reading: 'かう',
        masu_present: '買います',
        masu_present_reading: 'かいます',
      },
      pt: {
        base: 'comprar',
        '1sg_present': 'compro', '2sg_present': 'compra', '3sg_present': 'compra',
        '1pl_present': 'compramos', '2pl_present': 'compram', '3pl_present': 'compram',
        '1sg_past': 'comprei', '2sg_past': 'comprou', '3sg_past': 'comprou',
        '1pl_past': 'compramos', '2pl_past': 'compraram', '3pl_past': 'compraram',
        '1sg_future': 'comprarei', '2sg_future': 'comprará', '3sg_future': 'comprará',
        '1pl_future': 'compraremos', '2pl_future': 'comprarão', '3pl_future': 'comprarão',
      },
    },
  },

  {
    id: 'OWN',
    role: 'verb',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['cause', 'locative'],
    description: 'to have as property',
    definition: infinitiveGloss('HAVE', 'PROPERTY'),
    emoji: '🔑',
    isA: 'HAVE',
    forms: {
      en: {
        base: 'own',
        '1sg_present': 'own', '2sg_present': 'own', '3sg_present': 'owns',
        '1pl_present': 'own', '2pl_present': 'own', '3pl_present': 'own',
        past: 'owned',
      },
      it: {
        base: 'possedere',
        '1sg_present': 'possiedo', '2sg_present': 'possiedi', '3sg_present': 'possiede',
        '1pl_present': 'possediamo', '2pl_present': 'possedete', '3pl_present': 'possiedono',
        '1sg_past': 'possedei', '2sg_past': 'possedesti', '3sg_past': 'possedé',
        '1pl_past': 'possedemmo', '2pl_past': 'possedeste', '3pl_past': 'possederono',
        '1sg_future': 'possederò', '2sg_future': 'possederai', '3sg_future': 'possederà',
        '1pl_future': 'possederemo', '2pl_future': 'possederete', '3pl_future': 'possederanno',
      },
      fr: {
        base: 'posséder',
        '1sg_present': 'possède', '2sg_present': 'possèdes', '3sg_present': 'possède',
        '1pl_present': 'possédons', '2pl_present': 'possédez', '3pl_present': 'possèdent',
        '1sg_past': 'possédai', '2sg_past': 'possédas', '3sg_past': 'posséda',
        '1pl_past': 'possédâmes', '2pl_past': 'possédâtes', '3pl_past': 'possédèrent',
        '1sg_future': 'posséderai', '2sg_future': 'posséderas', '3sg_future': 'possédera',
        '1pl_future': 'posséderons', '2pl_future': 'posséderez', '3pl_future': 'posséderont',
      },
      de: {
        base: 'besitzen',
        '1sg_present': 'besitze', '2sg_present': 'besitzt', '3sg_present': 'besitzt',
        '1pl_present': 'besitzen', '2pl_present': 'besitzt', '3pl_present': 'besitzen',
        '1sg_past': 'besaß', '2sg_past': 'besaßest', '3sg_past': 'besaß',
        '1pl_past': 'besaßen', '2pl_past': 'besaßt', '3pl_past': 'besaßen',
      },
      es: {
        base: 'poseer',
        '1sg_present': 'poseo', '2sg_present': 'posees', '3sg_present': 'posee',
        '1pl_present': 'poseemos', '2pl_present': 'poseéis', '3pl_present': 'poseen',
        '1sg_past': 'poseí', '2sg_past': 'poseíste', '3sg_past': 'poseyó',
        '1pl_past': 'poseímos', '2pl_past': 'poseísteis', '3pl_past': 'poseyeron',
        '1sg_future': 'poseeré', '2sg_future': 'poseerás', '3sg_future': 'poseerá',
        '1pl_future': 'poseeremos', '2pl_future': 'poseeréis', '3pl_future': 'poseerán',
      },
      ja: {
        base: '所有する',
        reading: 'しょゆうする',
        masu_present: '所有します',
        masu_present_reading: 'しょゆうします',
      },
      pt: {
        base: 'possuir',
        '1sg_present': 'possuo', '2sg_present': 'possui', '3sg_present': 'possui',
        '1pl_present': 'possuímos', '2pl_present': 'possuem', '3pl_present': 'possuem',
        '1sg_past': 'possuí', '2sg_past': 'possuiu', '3sg_past': 'possuiu',
        '1pl_past': 'possuímos', '2pl_past': 'possuíram', '3pl_past': 'possuíram',
        '1sg_future': 'possuirei', '2sg_future': 'possuirá', '3sg_future': 'possuirá',
        '1pl_future': 'possuiremos', '2pl_future': 'possuirão', '3pl_future': 'possuirão',
      },
    },
  },

  {
    id: 'HOLD',
    role: 'verb',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to contain or keep',
    definition: infinitiveGloss('HAVE', 'OBJECT_THING', 'plural'),
    emoji: '📦',
    isA: 'HAVE',
    // HOLD_GRASP is the hand's hold (localization B83), so the picker says which.
    synonym: 'contain',
    forms: {
      en: {
        base: 'hold',
        '1sg_present': 'hold', '2sg_present': 'hold', '3sg_present': 'holds',
        '1pl_present': 'hold', '2pl_present': 'hold', '3pl_present': 'hold',
        past: 'held',
      },
      it: {
        base: 'contenere',
        '1sg_present': 'contengo', '2sg_present': 'contieni', '3sg_present': 'contiene',
        '1pl_present': 'conteniamo', '2pl_present': 'contenete', '3pl_present': 'contengono',
        '1sg_past': 'contenni', '2sg_past': 'contenesti', '3sg_past': 'contenne',
        '1pl_past': 'contenemmo', '2pl_past': 'conteneste', '3pl_past': 'contennero',
        '1sg_future': 'conterrò', '2sg_future': 'conterrai', '3sg_future': 'conterrà',
        '1pl_future': 'conterremo', '2pl_future': 'conterrete', '3pl_future': 'conterranno',
      },
      fr: {
        base: 'contenir',
        '1sg_present': 'contiens', '2sg_present': 'contiens', '3sg_present': 'contient',
        '1pl_present': 'contenons', '2pl_present': 'contenez', '3pl_present': 'contiennent',
        '1sg_past': 'contins', '2sg_past': 'contins', '3sg_past': 'contint',
        '1pl_past': 'contînmes', '2pl_past': 'contîntes', '3pl_past': 'continrent',
        '1sg_future': 'contiendrai', '2sg_future': 'contiendras', '3sg_future': 'contiendra',
        '1pl_future': 'contiendrons', '2pl_future': 'contiendrez', '3pl_future': 'contiendront',
      },
      de: {
        base: 'enthalten',
        '1sg_present': 'enthalte', '2sg_present': 'enthältst', '3sg_present': 'enthält',
        '1pl_present': 'enthalten', '2pl_present': 'enthaltet', '3pl_present': 'enthalten',
        '1sg_past': 'enthielt', '2sg_past': 'enthieltest', '3sg_past': 'enthielt',
        '1pl_past': 'enthielten', '2pl_past': 'enthieltet', '3pl_past': 'enthielten',
      },
      es: {
        base: 'contener',
        '1sg_present': 'contengo', '2sg_present': 'contienes', '3sg_present': 'contiene',
        '1pl_present': 'contenemos', '2pl_present': 'contenéis', '3pl_present': 'contienen',
        '1sg_past': 'contuve', '2sg_past': 'contuviste', '3sg_past': 'contuvo',
        '1pl_past': 'contuvimos', '2pl_past': 'contuvisteis', '3pl_past': 'contuvieron',
        '1sg_future': 'contendré', '2sg_future': 'contendrás', '3sg_future': 'contendrá',
        '1pl_future': 'contendremos', '2pl_future': 'contendréis', '3pl_future': 'contendrán',
      },
      ja: {
        base: '保持する',
        reading: 'ほじする',
        masu_present: '保持します',
        masu_present_reading: 'ほじします',
      },
      pt: {
        base: 'conter',
        '1sg_present': 'contenho', '2sg_present': 'contém', '3sg_present': 'contém',
        '1pl_present': 'contemos', '2pl_present': 'contêm', '3pl_present': 'contêm',
        '1sg_past': 'contive', '2sg_past': 'conteve', '3sg_past': 'conteve',
        '1pl_past': 'contivemos', '2pl_past': 'contiveram', '3pl_past': 'contiveram',
        '1sg_future': 'conterei', '2sg_future': 'conterá', '3sg_future': 'conterá',
        '1pl_future': 'conteremos', '2pl_future': 'conterão', '3pl_future': 'conterão',
      },
    },
  },

  {
    // E24's *hold* in its grasping sense (rank 235, D2): to have in the hand. HOLD is "to contain"
    // (contenere, enthalten), which B65 found, so the hand's tenere / halten is its own concept
    // (localization B83). Italian tenere is KEEP's word too, the language's own merger. Japanese 握る
    // ("grip"), since 持つ is HAVE's and the gloss would hold its own word. Spanish sostener conjugates
    // as tener (sostengo, sostuvo, sostendrá; tú command sostén); German halten keeps the du command's
    // -e (halte).
    id: 'HOLD_GRASP',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'instrumental', 'cause'],
    description: 'to have or keep in the hand',
    synonym: 'grasp',
    // "to have an object in the hand" (localization B83): HAVE with the place it is had, on B65's HAND.
    definition: infinitiveGloss('HAVE', {
      object: 'OBJECT_THING',
      definiteness: 'indefinite',
      complements: { locative: { phrase: { concept: 'HAND', definiteness: 'definite' } } },
    }),
    emoji: '✊',
    isA: 'HAVE',
    forms: {
      en: {
        base: 'hold',
        '1sg_present': 'hold', '2sg_present': 'hold', '3sg_present': 'holds',
        '1pl_present': 'hold', '2pl_present': 'hold', '3pl_present': 'hold',
        past: 'held',
      },
      it: {
        base: 'tenere',
        '1sg_present': 'tengo', '2sg_present': 'tieni', '3sg_present': 'tiene',
        '1pl_present': 'teniamo', '2pl_present': 'tenete', '3pl_present': 'tengono',
        '1sg_past': 'tenni', '2sg_past': 'tenesti', '3sg_past': 'tenne',
        '1pl_past': 'tenemmo', '2pl_past': 'teneste', '3pl_past': 'tennero',
        '1sg_future': 'terrò', '2sg_future': 'terrai', '3sg_future': 'terrà',
        '1pl_future': 'terremo', '2pl_future': 'terrete', '3pl_future': 'terranno',
      },
      fr: {
        base: 'tenir',
        '1sg_present': 'tiens', '2sg_present': 'tiens', '3sg_present': 'tient',
        '1pl_present': 'tenons', '2pl_present': 'tenez', '3pl_present': 'tiennent',
        '1sg_past': 'tins', '2sg_past': 'tins', '3sg_past': 'tint',
        '1pl_past': 'tînmes', '2pl_past': 'tîntes', '3pl_past': 'tinrent',
        '1sg_future': 'tiendrai', '2sg_future': 'tiendras', '3sg_future': 'tiendra',
        '1pl_future': 'tiendrons', '2pl_future': 'tiendrez', '3pl_future': 'tiendront',
      },
      de: {
        base: 'halten',
        '1sg_present': 'halte', '2sg_present': 'hältst', '3sg_present': 'hält',
        '1pl_present': 'halten', '2pl_present': 'haltet', '3pl_present': 'halten',
        '1sg_past': 'hielt', '2sg_past': 'hieltst', '3sg_past': 'hielt',
        '1pl_past': 'hielten', '2pl_past': 'hieltet', '3pl_past': 'hielten',
        '2sg_imperative': 'halte', // a stem in -t keeps the du -e
      },
      es: {
        base: 'sostener',
        '1sg_present': 'sostengo', '2sg_present': 'sostienes', '3sg_present': 'sostiene',
        '1pl_present': 'sostenemos', '2pl_present': 'sostenéis', '3pl_present': 'sostienen',
        '1sg_past': 'sostuve', '2sg_past': 'sostuviste', '3sg_past': 'sostuvo',
        '1pl_past': 'sostuvimos', '2pl_past': 'sostuvisteis', '3pl_past': 'sostuvieron',
        '1sg_future': 'sostendré', '2sg_future': 'sostendrás', '3sg_future': 'sostendrá',
        '1pl_future': 'sostendremos', '2pl_future': 'sostendréis', '3pl_future': 'sostendrán',
      },
      ja: {
        base: '握る',
        reading: 'にぎる',
        masu_present: '握ります',
        masu_present_reading: 'にぎります',
      },
      pt: {
        base: 'segurar',
        '1sg_present': 'seguro', '2sg_present': 'segura', '3sg_present': 'segura',
        '1pl_present': 'seguramos', '2pl_present': 'seguram', '3pl_present': 'seguram',
        '1sg_past': 'segurei', '2sg_past': 'segurou', '3sg_past': 'segurou',
        '1pl_past': 'seguramos', '2pl_past': 'seguraram', '3pl_past': 'seguraram',
        '1sg_future': 'segurarei', '2sg_future': 'segurará', '3sg_future': 'segurará',
        '1pl_future': 'seguraremos', '2pl_future': 'segurarão', '3pl_future': 'segurarão',
      },
    },
  },

  // Seeded for HYPERNYM's gloss (B50): "a word whose meaning includes another word's meaning".
  // German umfassen, not einschließen: it is what a broader term does to a narrower one ("der
  // Oberbegriff umfasst …"), and it is inseparable, so the relative clause ends on one word; HOLD
  // already has enthalten. A state, as HOLD is. Japanese 含む is godan (含まない, 含んで, 含まれる).
  {
    id: 'INCLUDE',
    role: 'verb',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to have as a part',
    // "to have as part": the essive object complement (C12) says what the thing had is had *as* —
    // it "avere come parte", de "als Teil haben", ja 部分として持つ (localization C28). HAVE licenses
    // no objectPredicative box on the canvas, but a plan renders it regardless. Bare singular, the
    // idiom in all seven: "as a part" would be *come una parte* in Italian.
    definition: infinitiveGloss('HAVE', {
      complements: {
        objectPredicative: {
          phrase: { concept: 'PART', definiteness: 'bare' },
          specifiers: [{ kind: 'predication', value: 'essive' }],
        },
      },
    }),
    emoji: '🧺',
    forms: {
      en: {
        base: 'include',
        '1sg_present': 'include', '2sg_present': 'include', '3sg_present': 'includes',
        '1pl_present': 'include', '2pl_present': 'include', '3pl_present': 'include',
        past: 'included',
      },
      it: {
        base: 'includere',
        '1sg_present': 'includo', '2sg_present': 'includi', '3sg_present': 'include',
        '1pl_present': 'includiamo', '2pl_present': 'includete', '3pl_present': 'includono',
        '1sg_past': 'inclusi', '2sg_past': 'includesti', '3sg_past': 'incluse',
        '1pl_past': 'includemmo', '2pl_past': 'includeste', '3pl_past': 'inclusero',
        '1sg_future': 'includerò', '2sg_future': 'includerai', '3sg_future': 'includerà',
        '1pl_future': 'includeremo', '2pl_future': 'includerete', '3pl_future': 'includeranno',
      },
      fr: {
        base: 'inclure',
        '1sg_present': 'inclus', '2sg_present': 'inclus', '3sg_present': 'inclut',
        '1pl_present': 'incluons', '2pl_present': 'incluez', '3pl_present': 'incluent',
        '1sg_past': 'inclus', '2sg_past': 'inclus', '3sg_past': 'inclut',
        '1pl_past': 'inclûmes', '2pl_past': 'inclûtes', '3pl_past': 'inclurent',
        '1sg_future': 'inclurai', '2sg_future': 'incluras', '3sg_future': 'inclura',
        '1pl_future': 'inclurons', '2pl_future': 'inclurez', '3pl_future': 'incluront',
      },
      de: {
        base: 'umfassen',
        '1sg_present': 'umfasse', '2sg_present': 'umfasst', '3sg_present': 'umfasst',
        '1pl_present': 'umfassen', '2pl_present': 'umfasst', '3pl_present': 'umfassen',
        '1sg_past': 'umfasste', '2sg_past': 'umfasstest', '3sg_past': 'umfasste',
        '1pl_past': 'umfassten', '2pl_past': 'umfasstet', '3pl_past': 'umfassten',
      },
      es: {
        base: 'incluir',
        '1sg_present': 'incluyo', '2sg_present': 'incluyes', '3sg_present': 'incluye',
        '1pl_present': 'incluimos', '2pl_present': 'incluís', '3pl_present': 'incluyen',
        '1sg_past': 'incluí', '2sg_past': 'incluiste', '3sg_past': 'incluyó',
        '1pl_past': 'incluimos', '2pl_past': 'incluisteis', '3pl_past': 'incluyeron',
        '1sg_future': 'incluiré', '2sg_future': 'incluirás', '3sg_future': 'incluirá',
        '1pl_future': 'incluiremos', '2pl_future': 'incluiréis', '3pl_future': 'incluirán',
      },
      ja: {
        base: '含む',
        reading: 'ふくむ',
        masu_present: '含みます',
        masu_present_reading: 'ふくみます',
      },
      pt: {
        base: 'incluir',
        '1sg_present': 'incluo', '2sg_present': 'inclui', '3sg_present': 'inclui',
        '1pl_present': 'incluímos', '2pl_present': 'incluem', '3pl_present': 'incluem',
        '1sg_past': 'incluí', '2sg_past': 'incluiu', '3sg_past': 'incluiu',
        '1pl_past': 'incluímos', '2pl_past': 'incluíram', '3pl_past': 'incluíram',
        '1sg_future': 'incluirei', '2sg_future': 'incluirá', '3sg_future': 'incluirá',
        '1pl_future': 'incluiremos', '2pl_future': 'incluirão', '3pl_future': 'incluirão',
      },
    },
  },

  // Seeded for PRISON's gloss (B32): "a building where one confines people". German takes
  // inhaftieren rather than einsperren, whose separable prefix the engine cannot place; its
  // participle has no ge-, as -ieren verbs do not. Spanish encerrar diphthongs its stem
  // (encierro), and Italian rinchiudere has an irregular participle (rinchiuso).
  {
    id: 'CONFINE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to shut in a place and prevent from leaving',
    emoji: '🔐',
    forms: {
      en: {
        base: 'confine',
        '1sg_present': 'confine', '2sg_present': 'confine', '3sg_present': 'confines',
        '1pl_present': 'confine', '2pl_present': 'confine', '3pl_present': 'confine',
        past: 'confined',
      },
      it: {
        base: 'rinchiudere',
        '1sg_present': 'rinchiudo', '2sg_present': 'rinchiudi', '3sg_present': 'rinchiude',
        '1pl_present': 'rinchiudiamo', '2pl_present': 'rinchiudete', '3pl_present': 'rinchiudono',
        '1sg_past': 'rinchiusi', '2sg_past': 'rinchiudesti', '3sg_past': 'rinchiuse',
        '1pl_past': 'rinchiudemmo', '2pl_past': 'rinchiudeste', '3pl_past': 'rinchiusero',
        '1sg_future': 'rinchiuderò', '2sg_future': 'rinchiuderai', '3sg_future': 'rinchiuderà',
        '1pl_future': 'rinchiuderemo', '2pl_future': 'rinchiuderete', '3pl_future': 'rinchiuderanno',
      },
      fr: {
        base: 'enfermer',
        '1sg_present': 'enferme', '2sg_present': 'enfermes', '3sg_present': 'enferme',
        '1pl_present': 'enfermons', '2pl_present': 'enfermez', '3pl_present': 'enferment',
        '1sg_past': 'enfermai', '2sg_past': 'enfermas', '3sg_past': 'enferma',
        '1pl_past': 'enfermâmes', '2pl_past': 'enfermâtes', '3pl_past': 'enfermèrent',
        '1sg_future': 'enfermerai', '2sg_future': 'enfermeras', '3sg_future': 'enfermera',
        '1pl_future': 'enfermerons', '2pl_future': 'enfermerez', '3pl_future': 'enfermeront',
      },
      de: {
        base: 'inhaftieren',
        '1sg_present': 'inhaftiere', '2sg_present': 'inhaftierst', '3sg_present': 'inhaftiert',
        '1pl_present': 'inhaftieren', '2pl_present': 'inhaftiert', '3pl_present': 'inhaftieren',
        '1sg_past': 'inhaftierte', '2sg_past': 'inhaftiertest', '3sg_past': 'inhaftierte',
        '1pl_past': 'inhaftierten', '2pl_past': 'inhaftiertet', '3pl_past': 'inhaftierten',
      },
      es: {
        base: 'encerrar',
        '1sg_present': 'encierro', '2sg_present': 'encierras', '3sg_present': 'encierra',
        '1pl_present': 'encerramos', '2pl_present': 'encerráis', '3pl_present': 'encierran',
        '1sg_past': 'encerré', '2sg_past': 'encerraste', '3sg_past': 'encerró',
        '1pl_past': 'encerramos', '2pl_past': 'encerrasteis', '3pl_past': 'encerraron',
        '1sg_future': 'encerraré', '2sg_future': 'encerrarás', '3sg_future': 'encerrará',
        '1pl_future': 'encerraremos', '2pl_future': 'encerraréis', '3pl_future': 'encerrarán',
      },
      ja: {
        // 閉じ込める names where the confined thing ends up, not where the shutting in happened, so
        // its place takes に: 犬を家に閉じ込める (`locative_particle`, A190).
        base: '閉じ込める',
        reading: 'とじこめる',
        masu_present: '閉じ込めます',
        masu_present_reading: 'とじこめます',
        locative_particle: 'に',
      },
      pt: {
        base: 'encarcerar',
        '1sg_present': 'encarcero', '2sg_present': 'encarcera', '3sg_present': 'encarcera',
        '1pl_present': 'encarceramos', '2pl_present': 'encarceram', '3pl_present': 'encarceram',
        '1sg_past': 'encarcerei', '2sg_past': 'encarcerou', '3sg_past': 'encarcerou',
        '1pl_past': 'encarceramos', '2pl_past': 'encarceraram', '3pl_past': 'encarceraram',
        '1sg_future': 'encarcerarei', '2sg_future': 'encarcerará', '3sg_future': 'encarcerará',
        '1pl_future': 'encarceraremos', '2pl_future': 'encarcerarão', '3pl_future': 'encarcerarão',
      },
    },
  },
  {
    // WILD is "that has not been tamed" (localization C24). Italian, Spanish and Portuguese domare /
    // domar, not addomesticare / domesticar, which would gloss WILD on its sibling DOMESTIC's own
    // root (domestico, doméstico); French apprivoiser, Japanese 飼い慣らす.
    id: 'TAME',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'locative', 'cause'],
    description: 'to make an animal used to people and no longer wild',
    emoji: '🦮',
    forms: {
      en: {
        base: 'tame',
        '1sg_present': 'tame', '2sg_present': 'tame', '3sg_present': 'tames',
        '1pl_present': 'tame', '2pl_present': 'tame', '3pl_present': 'tame',
        past: 'tamed',
      },
      it: {
        base: 'domare',
        '1sg_present': 'domo', '2sg_present': 'domi', '3sg_present': 'doma',
        '1pl_present': 'domiamo', '2pl_present': 'domate', '3pl_present': 'domano',
        '1sg_past': 'domai', '2sg_past': 'domasti', '3sg_past': 'domò',
        '1pl_past': 'domammo', '2pl_past': 'domaste', '3pl_past': 'domarono',
        '1sg_future': 'domerò', '2sg_future': 'domerai', '3sg_future': 'domerà',
        '1pl_future': 'domeremo', '2pl_future': 'domerete', '3pl_future': 'domeranno',
      },
      fr: {
        base: 'apprivoiser',
        '1sg_present': 'apprivoise', '2sg_present': 'apprivoises', '3sg_present': 'apprivoise',
        '1pl_present': 'apprivoisons', '2pl_present': 'apprivoisez', '3pl_present': 'apprivoisent',
        '1sg_past': 'apprivoisai', '2sg_past': 'apprivoisas', '3sg_past': 'apprivoisa',
        '1pl_past': 'apprivoisâmes', '2pl_past': 'apprivoisâtes', '3pl_past': 'apprivoisèrent',
        '1sg_future': 'apprivoiserai', '2sg_future': 'apprivoiseras', '3sg_future': 'apprivoisera',
        '1pl_future': 'apprivoiserons', '2pl_future': 'apprivoiserez', '3pl_future': 'apprivoiseront',
      },
      de: {
        base: 'zähmen',
        '1sg_present': 'zähme', '2sg_present': 'zähmst', '3sg_present': 'zähmt',
        '1pl_present': 'zähmen', '2pl_present': 'zähmt', '3pl_present': 'zähmen',
        '1sg_past': 'zähmte', '2sg_past': 'zähmtest', '3sg_past': 'zähmte',
        '1pl_past': 'zähmten', '2pl_past': 'zähmtet', '3pl_past': 'zähmten',
      },
      es: {
        base: 'domar',
        '1sg_present': 'domo', '2sg_present': 'domas', '3sg_present': 'doma',
        '1pl_present': 'domamos', '2pl_present': 'domáis', '3pl_present': 'doman',
        '1sg_past': 'domé', '2sg_past': 'domaste', '3sg_past': 'domó',
        '1pl_past': 'domamos', '2pl_past': 'domasteis', '3pl_past': 'domaron',
        '1sg_future': 'domaré', '2sg_future': 'domarás', '3sg_future': 'domará',
        '1pl_future': 'domaremos', '2pl_future': 'domaréis', '3pl_future': 'domarán',
      },
      ja: {
        base: '飼い慣らす',
        reading: 'かいならす',
        masu_present: '飼い慣らします',
        masu_present_reading: 'かいならします',
      },
      pt: {
        base: 'domar',
        '1sg_present': 'domo', '2sg_present': 'doma', '3sg_present': 'doma',
        '1pl_present': 'domamos', '2pl_present': 'domam', '3pl_present': 'domam',
        '1sg_past': 'domei', '2sg_past': 'domou', '3sg_past': 'domou',
        '1pl_past': 'domamos', '2pl_past': 'domaram', '3pl_past': 'domaram',
        '1sg_future': 'domarei', '2sg_future': 'domará', '3sg_future': 'domará',
        '1pl_future': 'domaremos', '2pl_future': 'domarão', '3pl_future': 'domarão',
      },
    },
  },

  {
    id: 'MAKE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to bring into existence by shaping or assembling',
    definition: infinitiveGloss('CREATE', 'OBJECT_THING', 'plural'),
    emoji: '🔨',
    synonym: 'create',
    isA: 'CREATE',
    forms: {
      en: {
        base: 'make',
        '1sg_present': 'make', '2sg_present': 'make', '3sg_present': 'makes',
        '1pl_present': 'make', '2pl_present': 'make', '3pl_present': 'make',
        past: 'made',
      },
      it: {
        base: 'fare',
        '1sg_present': 'faccio', '2sg_present': 'fai', '3sg_present': 'fa',
        '1pl_present': 'facciamo', '2pl_present': 'fate', '3pl_present': 'fanno',
        '1sg_past': 'feci', '2sg_past': 'facesti', '3sg_past': 'fece',
        '1pl_past': 'facemmo', '2pl_past': 'faceste', '3pl_past': 'fecero',
        '1sg_future': 'farò', '2sg_future': 'farai', '3sg_future': 'farà',
        '1pl_future': 'faremo', '2pl_future': 'farete', '3pl_future': 'faranno',
      },
      fr: {
        base: 'faire',
        '1sg_present': 'fais', '2sg_present': 'fais', '3sg_present': 'fait',
        '1pl_present': 'faisons', '2pl_present': 'faites', '3pl_present': 'font',
        '1sg_past': 'fis', '2sg_past': 'fis', '3sg_past': 'fit',
        '1pl_past': 'fîmes', '2pl_past': 'fîtes', '3pl_past': 'firent',
        '1sg_future': 'ferai', '2sg_future': 'feras', '3sg_future': 'fera',
        '1pl_future': 'ferons', '2pl_future': 'ferez', '3pl_future': 'feront',
      },
      de: {
        base: 'machen',
        '1sg_present': 'mache', '2sg_present': 'machst', '3sg_present': 'macht',
        '1pl_present': 'machen', '2pl_present': 'macht', '3pl_present': 'machen',
        '1sg_past': 'machte', '2sg_past': 'machtest', '3sg_past': 'machte',
        '1pl_past': 'machten', '2pl_past': 'machtet', '3pl_past': 'machten',
      },
      es: {
        base: 'hacer',
        '1sg_present': 'hago', '2sg_present': 'haces', '3sg_present': 'hace',
        '1pl_present': 'hacemos', '2pl_present': 'hacéis', '3pl_present': 'hacen',
        '1sg_past': 'hice', '2sg_past': 'hiciste', '3sg_past': 'hizo',
        '1pl_past': 'hicimos', '2pl_past': 'hicisteis', '3pl_past': 'hicieron',
        '1sg_future': 'haré', '2sg_future': 'harás', '3sg_future': 'hará',
        '1pl_future': 'haremos', '2pl_future': 'haréis', '3pl_future': 'harán',
      },
      ja: {
        base: '作る',
        reading: 'つくる',
        masu_present: '作ります',
        masu_present_reading: 'つくります',
      },
      pt: {
        base: 'fazer',
        '1sg_present': 'faço', '2sg_present': 'faz', '3sg_present': 'faz',
        '1pl_present': 'fazemos', '2pl_present': 'fazem', '3pl_present': 'fazem',
        '1sg_past': 'fiz', '2sg_past': 'fez', '3sg_past': 'fez',
        '1pl_past': 'fizemos', '2pl_past': 'fizeram', '3pl_past': 'fizeram',
        '1sg_future': 'farei', '2sg_future': 'fará', '3sg_future': 'fará',
        '1pl_future': 'faremos', '2pl_future': 'farão', '3pl_future': 'farão',
      },
    },
  },

  {
    // P09's do (localization B62), the main verb: "the man does the work". The helper of "does not"
    // and "does …?" stays in the English engine. English, German and Japanese split it from MAKE (tun
    // against machen, する against 作る); Italian, French, Spanish and Portuguese have one verb for
    // both, so their paradigms repeat MAKE's (fare, faire, hacer, fazer). Its gloss is START's
    // causative shape with HAPPEN, so no Romance tooltip says fare / faire / hacer / fazer.
    id: 'DO',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to perform an action',
    definition: causativeGloss({ object: 'ACTION', definiteness: 'indefinite' }, { verb: 'HAPPEN' }),
    synonym: 'perform',
    emoji: '✅',
    forms: {
      en: {
        base: 'do',
        '1sg_present': 'do', '2sg_present': 'do', '3sg_present': 'does',
        '1pl_present': 'do', '2pl_present': 'do', '3pl_present': 'do',
        past: 'did',
      },
      it: {
        base: 'fare',
        '1sg_present': 'faccio', '2sg_present': 'fai', '3sg_present': 'fa',
        '1pl_present': 'facciamo', '2pl_present': 'fate', '3pl_present': 'fanno',
        '1sg_past': 'feci', '2sg_past': 'facesti', '3sg_past': 'fece',
        '1pl_past': 'facemmo', '2pl_past': 'faceste', '3pl_past': 'fecero',
        '1sg_future': 'farò', '2sg_future': 'farai', '3sg_future': 'farà',
        '1pl_future': 'faremo', '2pl_future': 'farete', '3pl_future': 'faranno',
      },
      fr: {
        base: 'faire',
        '1sg_present': 'fais', '2sg_present': 'fais', '3sg_present': 'fait',
        '1pl_present': 'faisons', '2pl_present': 'faites', '3pl_present': 'font',
        '1sg_past': 'fis', '2sg_past': 'fis', '3sg_past': 'fit',
        '1pl_past': 'fîmes', '2pl_past': 'fîtes', '3pl_past': 'firent',
        '1sg_future': 'ferai', '2sg_future': 'feras', '3sg_future': 'fera',
        '1pl_future': 'ferons', '2pl_future': 'ferez', '3pl_future': 'feront',
      },
      de: {
        base: 'tun',
        '1sg_present': 'tue', '2sg_present': 'tust', '3sg_present': 'tut',
        '1pl_present': 'tun', '2pl_present': 'tut', '3pl_present': 'tun',
        '1sg_past': 'tat', '2sg_past': 'tatest', '3sg_past': 'tat',
        '1pl_past': 'taten', '2pl_past': 'tatet', '3pl_past': 'taten',
        '2sg_imperative': 'tu',
      },
      es: {
        base: 'hacer',
        '1sg_present': 'hago', '2sg_present': 'haces', '3sg_present': 'hace',
        '1pl_present': 'hacemos', '2pl_present': 'hacéis', '3pl_present': 'hacen',
        '1sg_past': 'hice', '2sg_past': 'hiciste', '3sg_past': 'hizo',
        '1pl_past': 'hicimos', '2pl_past': 'hicisteis', '3pl_past': 'hicieron',
        '1sg_future': 'haré', '2sg_future': 'harás', '3sg_future': 'hará',
        '1pl_future': 'haremos', '2pl_future': 'haréis', '3pl_future': 'harán',
      },
      ja: {
        base: 'する',
        reading: 'する',
        masu_present: 'します',
        masu_present_reading: 'します',
        // 尊敬語 なさる, 「する」の尊敬語; 謙譲語 いたす, 「する」の謙譲語 (大辞林, デジタル大辞泉) (P11-E1).
        honorific: 'なさる', honorific_masu_present: 'なさいます', honorific_te: 'なさって', honorific_nai: 'なさらない', honorific_stem: 'なさり',
        humble: 'いたす', humble_masu_present: 'いたします', humble_te: 'いたして', humble_nai: 'いたさない',
      },
      pt: {
        base: 'fazer',
        '1sg_present': 'faço', '2sg_present': 'faz', '3sg_present': 'faz',
        '1pl_present': 'fazemos', '2pl_present': 'fazem', '3pl_present': 'fazem',
        '1sg_past': 'fiz', '2sg_past': 'fez', '3sg_past': 'fez',
        '1pl_past': 'fizemos', '2pl_past': 'fizeram', '3pl_past': 'fizeram',
        '1sg_future': 'farei', '2sg_future': 'fará', '3sg_future': 'fará',
        '1pl_future': 'faremos', '2pl_future': 'farão', '3pl_future': 'farão',
      },
    },
  },

  {
    // E24's *continue* (rank 350) with an object: to go on with an action ("continues the game").
    // *Continue doing* is P09-E42's CONTINUE_DOING, and the intransitive "the story continues"
    // (continua, geht weiter, 続く) a later concept (localization B84). German fortsetzen is separable
    // (setzt … fort, fortgesetzt); Spanish continuar stresses its u in the singular (continúo).
    id: 'CONTINUE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to go on with, without stopping',
    synonym: 'carry on',
    // "still to do an action" (localization B84): KEEP's shape ("still to have objects") on DO.
    definition: infinitiveGloss('DO', { object: 'ACTION', definiteness: 'indefinite', modifier: 'STILL' }),
    emoji: '▶️',
    isA: 'DO',
    forms: {
      en: {
        base: 'continue',
        '1sg_present': 'continue', '2sg_present': 'continue', '3sg_present': 'continues',
        '1pl_present': 'continue', '2pl_present': 'continue', '3pl_present': 'continue',
        past: 'continued',
      },
      it: {
        base: 'continuare',
        '1sg_present': 'continuo', '2sg_present': 'continui', '3sg_present': 'continua',
        '1pl_present': 'continuiamo', '2pl_present': 'continuate', '3pl_present': 'continuano',
        '1sg_past': 'continuai', '2sg_past': 'continuasti', '3sg_past': 'continuò',
        '1pl_past': 'continuammo', '2pl_past': 'continuaste', '3pl_past': 'continuarono',
        '1sg_future': 'continuerò', '2sg_future': 'continuerai', '3sg_future': 'continuerà',
        '1pl_future': 'continueremo', '2pl_future': 'continuerete', '3pl_future': 'continueranno',
      },
      fr: {
        base: 'continuer',
        '1sg_present': 'continue', '2sg_present': 'continues', '3sg_present': 'continue',
        '1pl_present': 'continuons', '2pl_present': 'continuez', '3pl_present': 'continuent',
        '1sg_past': 'continuai', '2sg_past': 'continuas', '3sg_past': 'continua',
        '1pl_past': 'continuâmes', '2pl_past': 'continuâtes', '3pl_past': 'continuèrent',
        '1sg_future': 'continuerai', '2sg_future': 'continueras', '3sg_future': 'continuera',
        '1pl_future': 'continuerons', '2pl_future': 'continuerez', '3pl_future': 'continueront',
      },
      de: {
        base: 'fortsetzen', particle: 'fort',
        '1sg_present': 'setze', '2sg_present': 'setzt', '3sg_present': 'setzt',
        '1pl_present': 'setzen', '2pl_present': 'setzt', '3pl_present': 'setzen',
        '1sg_past': 'setzte', '2sg_past': 'setztest', '3sg_past': 'setzte',
        '1pl_past': 'setzten', '2pl_past': 'setztet', '3pl_past': 'setzten',
      },
      es: {
        base: 'continuar',
        '1sg_present': 'continúo', '2sg_present': 'continúas', '3sg_present': 'continúa',
        '1pl_present': 'continuamos', '2pl_present': 'continuáis', '3pl_present': 'continúan',
        '1sg_past': 'continué', '2sg_past': 'continuaste', '3sg_past': 'continuó',
        '1pl_past': 'continuamos', '2pl_past': 'continuasteis', '3pl_past': 'continuaron',
        '1sg_future': 'continuaré', '2sg_future': 'continuarás', '3sg_future': 'continuará',
        '1pl_future': 'continuaremos', '2pl_future': 'continuaréis', '3pl_future': 'continuarán',
      },
      ja: {
        base: '続ける',
        reading: 'つづける',
        masu_present: '続けます',
        masu_present_reading: 'つづけます',
      },
      pt: {
        base: 'continuar',
        '1sg_present': 'continuo', '2sg_present': 'continua', '3sg_present': 'continua',
        '1pl_present': 'continuamos', '2pl_present': 'continuam', '3pl_present': 'continuam',
        '1sg_past': 'continuei', '2sg_past': 'continuou', '3sg_past': 'continuou',
        '1pl_past': 'continuamos', '2pl_past': 'continuaram', '3pl_past': 'continuaram',
        '1sg_future': 'continuarei', '2sg_future': 'continuará', '3sg_future': 'continuará',
        '1pl_future': 'continuaremos', '2pl_future': 'continuarão', '3pl_future': 'continuarão',
      },
    },
  },

  {
    // P09's play, of music (localization B62); PLAY_GAME is the game. Japanese 演奏する plays any
    // instrument, where 弾く is strings and keys only (a flute is 吹く). French plays "de" an
    // instrument ("joue du piano"), the preposition its lexeme names (`object_prep`, as CLICK's).
    id: 'PLAY_INSTRUMENT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to make music on an instrument',
    definition: infinitiveGloss('PRODUCE', {
      object: 'SOUND', number: 'plural',
      complements: { instrumental: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' } } },
    }),
    synonym: 'play music',
    emoji: '🎻',
    forms: {
      en: {
        base: 'play',
        '1sg_present': 'play', '2sg_present': 'play', '3sg_present': 'plays',
        '1pl_present': 'play', '2pl_present': 'play', '3pl_present': 'play',
        past: 'played',
      },
      it: {
        base: 'suonare',
        '1sg_present': 'suono', '2sg_present': 'suoni', '3sg_present': 'suona',
        '1pl_present': 'suoniamo', '2pl_present': 'suonate', '3pl_present': 'suonano',
        '1sg_past': 'suonai', '2sg_past': 'suonasti', '3sg_past': 'suonò',
        '1pl_past': 'suonammo', '2pl_past': 'suonaste', '3pl_past': 'suonarono',
        '1sg_future': 'suonerò', '2sg_future': 'suonerai', '3sg_future': 'suonerà',
        '1pl_future': 'suoneremo', '2pl_future': 'suonerete', '3pl_future': 'suoneranno',
      },
      fr: {
        base: 'jouer', object_prep: 'de',
        '1sg_present': 'joue', '2sg_present': 'joues', '3sg_present': 'joue',
        '1pl_present': 'jouons', '2pl_present': 'jouez', '3pl_present': 'jouent',
        '1sg_past': 'jouai', '2sg_past': 'jouas', '3sg_past': 'joua',
        '1pl_past': 'jouâmes', '2pl_past': 'jouâtes', '3pl_past': 'jouèrent',
        '1sg_future': 'jouerai', '2sg_future': 'joueras', '3sg_future': 'jouera',
        '1pl_future': 'jouerons', '2pl_future': 'jouerez', '3pl_future': 'joueront',
      },
      de: {
        base: 'spielen',
        '1sg_present': 'spiele', '2sg_present': 'spielst', '3sg_present': 'spielt',
        '1pl_present': 'spielen', '2pl_present': 'spielt', '3pl_present': 'spielen',
        '1sg_past': 'spielte', '2sg_past': 'spieltest', '3sg_past': 'spielte',
        '1pl_past': 'spielten', '2pl_past': 'spieltet', '3pl_past': 'spielten',
      },
      es: {
        base: 'tocar',
        '1sg_present': 'toco', '2sg_present': 'tocas', '3sg_present': 'toca',
        '1pl_present': 'tocamos', '2pl_present': 'tocáis', '3pl_present': 'tocan',
        '1sg_past': 'toqué', '2sg_past': 'tocaste', '3sg_past': 'tocó',
        '1pl_past': 'tocamos', '2pl_past': 'tocasteis', '3pl_past': 'tocaron',
        '1sg_future': 'tocaré', '2sg_future': 'tocarás', '3sg_future': 'tocará',
        '1pl_future': 'tocaremos', '2pl_future': 'tocaréis', '3pl_future': 'tocarán',
      },
      ja: {
        base: '演奏する',
        reading: 'えんそうする',
        masu_present: '演奏します',
        masu_present_reading: 'えんそうします',
      },
      pt: {
        base: 'tocar',
        '1sg_present': 'toco', '2sg_present': 'toca', '3sg_present': 'toca',
        '1pl_present': 'tocamos', '2pl_present': 'tocam', '3pl_present': 'tocam',
        '1sg_past': 'toquei', '2sg_past': 'tocou', '3sg_past': 'tocou',
        '1pl_past': 'tocamos', '2pl_past': 'tocaram', '3pl_past': 'tocaram',
        '1sg_future': 'tocarei', '2sg_future': 'tocará', '3sg_future': 'tocará',
        '1pl_future': 'tocaremos', '2pl_future': 'tocarão', '3pl_future': 'tocarão',
      },
    },
  },

  {
    // P09's need (localization B62): "needs water", and — with an infinitive complement, the way
    // DESIRE takes one — "needs to run". One lexical concept, not a modal. Italian and French say it
    // with a light verb and a noun, avere bisogno / avoir besoin: the base carries both words and so
    // does every finite form (ha bisogno, a besoin), and the participle (avuto bisogno, eu besoin). The
    // object and the infinitive both take di / de (`object_prep`, `infinitive_link`), as Portuguese
    // precisar takes its object with de. A state, like DESIRE: the Romance past is its imperfect, and
    // Japanese says it with 〜ている (必要としています). Glossed on MUST's own frame, "to be obliged
    // to have objects" (Longman: "to have to have something").
    id: 'NEED',
    role: 'verb',
    // Takes an infinitive complement as its object (P09-E12 D9): the builder's subordinate-clause menu offers *to*.
    clauseObject: 'infinitive',
    stative: true,
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to require something one does not have',
    definition: infinitiveGloss('BE', {
      predicate: 'OBLIGED',
      infinitive: { verbPhrase: { verb: 'HAVE' }, directObject: { concept: 'OBJECT_THING', definiteness: 'bare', number: 'plural' } },
    }),
    synonym: 'require',
    emoji: '❗',
    forms: {
      en: {
        base: 'need',
        '1sg_present': 'need', '2sg_present': 'need', '3sg_present': 'needs',
        '1pl_present': 'need', '2pl_present': 'need', '3pl_present': 'need',
        past: 'needed',
      },
      it: {
        base: 'avere bisogno', object_prep: 'di', infinitive_link: 'di',
        '1sg_present': 'ho bisogno', '2sg_present': 'hai bisogno', '3sg_present': 'ha bisogno',
        '1pl_present': 'abbiamo bisogno', '2pl_present': 'avete bisogno', '3pl_present': 'hanno bisogno',
        '1sg_past': 'ebbi bisogno', '2sg_past': 'avesti bisogno', '3sg_past': 'ebbe bisogno',
        '1pl_past': 'avemmo bisogno', '2pl_past': 'aveste bisogno', '3pl_past': 'ebbero bisogno',
        '1sg_future': 'avrò bisogno', '2sg_future': 'avrai bisogno', '3sg_future': 'avrà bisogno',
        '1pl_future': 'avremo bisogno', '2pl_future': 'avrete bisogno', '3pl_future': 'avranno bisogno',
      },
      fr: {
        base: 'avoir besoin', object_prep: 'de', infinitive_link: 'de',
        '1sg_present': 'ai besoin', '2sg_present': 'as besoin', '3sg_present': 'a besoin',
        '1pl_present': 'avons besoin', '2pl_present': 'avez besoin', '3pl_present': 'ont besoin',
        '1sg_past': 'eus besoin', '2sg_past': 'eus besoin', '3sg_past': 'eut besoin',
        '1pl_past': 'eûmes besoin', '2pl_past': 'eûtes besoin', '3pl_past': 'eurent besoin',
        '1sg_future': 'aurai besoin', '2sg_future': 'auras besoin', '3sg_future': 'aura besoin',
        '1pl_future': 'aurons besoin', '2pl_future': 'aurez besoin', '3pl_future': 'auront besoin',
      },
      de: {
        base: 'brauchen',
        '1sg_present': 'brauche', '2sg_present': 'brauchst', '3sg_present': 'braucht',
        '1pl_present': 'brauchen', '2pl_present': 'braucht', '3pl_present': 'brauchen',
        '1sg_past': 'brauchte', '2sg_past': 'brauchtest', '3sg_past': 'brauchte',
        '1pl_past': 'brauchten', '2pl_past': 'brauchtet', '3pl_past': 'brauchten',
      },
      es: {
        base: 'necesitar',
        '1sg_present': 'necesito', '2sg_present': 'necesitas', '3sg_present': 'necesita',
        '1pl_present': 'necesitamos', '2pl_present': 'necesitáis', '3pl_present': 'necesitan',
        '1sg_past': 'necesité', '2sg_past': 'necesitaste', '3sg_past': 'necesitó',
        '1pl_past': 'necesitamos', '2pl_past': 'necesitasteis', '3pl_past': 'necesitaron',
        '1sg_future': 'necesitaré', '2sg_future': 'necesitarás', '3sg_future': 'necesitará',
        '1pl_future': 'necesitaremos', '2pl_future': 'necesitaréis', '3pl_future': 'necesitarán',
      },
      ja: {
        base: '必要とする',
        reading: 'ひつようとする',
        masu_present: '必要とします',
        masu_present_reading: 'ひつようとします',
        // The こと clause it governs is its object, as DESIRE's: 走ることを必要とする.
        infinitive_link: 'ことを',
      },
      pt: {
        base: 'precisar', object_prep: 'de',
        '1sg_present': 'preciso', '2sg_present': 'precisa', '3sg_present': 'precisa',
        '1pl_present': 'precisamos', '2pl_present': 'precisam', '3pl_present': 'precisam',
        '1sg_past': 'precisei', '2sg_past': 'precisou', '3sg_past': 'precisou',
        '1pl_past': 'precisamos', '2pl_past': 'precisaram', '3pl_past': 'precisaram',
        '1sg_future': 'precisarei', '2sg_future': 'precisará', '3sg_future': 'precisará',
        '1pl_future': 'precisaremos', '2pl_future': 'precisarão', '3pl_future': 'precisarão',
      },
    },
  },

  {
    // P09's try (localization B62): "tries to run". A lexical verb that takes an infinitive complement
    // the way DESIRE does, not `modal: true` as P09 proposed: a modal's link is lost on the outermost
    // French modal ("essaie courir") and German stacks a bare infinitive ("versucht laufen"), where the
    // lexical verb says "essaie de courir" and "versucht zu laufen". The link is the lexeme's own:
    // provare a, essayer de, 試みる with its こと clause as object. RETRY sits under it. Literal by
    // design, beside DESIRE: no genus renders "attempt" in all seven (see the B62 task).
    id: 'TRY',
    role: 'verb',
    // Takes an infinitive complement as its object (P09-E12 D9): the builder's subordinate-clause menu offers *to*.
    clauseObject: 'infinitive',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to make an attempt',
    synonym: 'attempt',
    emoji: '🎯',
    forms: {
      en: {
        base: 'try',
        '1sg_present': 'try', '2sg_present': 'try', '3sg_present': 'tries',
        '1pl_present': 'try', '2pl_present': 'try', '3pl_present': 'try',
        past: 'tried',
      },
      it: {
        base: 'provare', infinitive_link: 'a',
        '1sg_present': 'provo', '2sg_present': 'provi', '3sg_present': 'prova',
        '1pl_present': 'proviamo', '2pl_present': 'provate', '3pl_present': 'provano',
        '1sg_past': 'provai', '2sg_past': 'provasti', '3sg_past': 'provò',
        '1pl_past': 'provammo', '2pl_past': 'provaste', '3pl_past': 'provarono',
        '1sg_future': 'proverò', '2sg_future': 'proverai', '3sg_future': 'proverà',
        '1pl_future': 'proveremo', '2pl_future': 'proverete', '3pl_future': 'proveranno',
      },
      fr: {
        base: 'essayer', infinitive_link: 'de',
        '1sg_present': 'essaie', '2sg_present': 'essaies', '3sg_present': 'essaie',
        '1pl_present': 'essayons', '2pl_present': 'essayez', '3pl_present': 'essaient',
        '1sg_past': 'essayai', '2sg_past': 'essayas', '3sg_past': 'essaya',
        '1pl_past': 'essayâmes', '2pl_past': 'essayâtes', '3pl_past': 'essayèrent',
        '1sg_future': 'essaierai', '2sg_future': 'essaieras', '3sg_future': 'essaiera',
        '1pl_future': 'essaierons', '2pl_future': 'essaierez', '3pl_future': 'essaieront',
      },
      de: {
        base: 'versuchen',
        '1sg_present': 'versuche', '2sg_present': 'versuchst', '3sg_present': 'versucht',
        '1pl_present': 'versuchen', '2pl_present': 'versucht', '3pl_present': 'versuchen',
        '1sg_past': 'versuchte', '2sg_past': 'versuchtest', '3sg_past': 'versuchte',
        '1pl_past': 'versuchten', '2pl_past': 'versuchtet', '3pl_past': 'versuchten',
      },
      es: {
        base: 'intentar',
        '1sg_present': 'intento', '2sg_present': 'intentas', '3sg_present': 'intenta',
        '1pl_present': 'intentamos', '2pl_present': 'intentáis', '3pl_present': 'intentan',
        '1sg_past': 'intenté', '2sg_past': 'intentaste', '3sg_past': 'intentó',
        '1pl_past': 'intentamos', '2pl_past': 'intentasteis', '3pl_past': 'intentaron',
        '1sg_future': 'intentaré', '2sg_future': 'intentarás', '3sg_future': 'intentará',
        '1pl_future': 'intentaremos', '2pl_future': 'intentaréis', '3pl_future': 'intentarán',
      },
      ja: {
        base: '試みる',
        reading: 'こころみる',
        masu_present: '試みます',
        masu_present_reading: 'こころみます',
        // The こと clause it governs is its object: 走ることを試みる.
        infinitive_link: 'ことを',
      },
      pt: {
        base: 'tentar',
        '1sg_present': 'tento', '2sg_present': 'tenta', '3sg_present': 'tenta',
        '1pl_present': 'tentamos', '2pl_present': 'tentam', '3pl_present': 'tentam',
        '1sg_past': 'tentei', '2sg_past': 'tentou', '3sg_past': 'tentou',
        '1pl_past': 'tentamos', '2pl_past': 'tentaram', '3pl_past': 'tentaram',
        '1sg_future': 'tentarei', '2sg_future': 'tentará', '3sg_future': 'tentará',
        '1pl_future': 'tentaremos', '2pl_future': 'tentarão', '3pl_future': 'tentarão',
      },
    },
  },

  {
    // The genus of MAKE ("to create objects") and SET_ON_FIRE ("to create fire") — the creation verb
    // their dictionary definitions cite as their genus (see the B09 verb-definition task). Its own
    // tooltip stays on the literal: glossing CREATE through MAKE would read as circular. German
    // takes erschaffen (bring into being), not the ambiguous schaffen ("manage"); Japanese takes
    // 生み出す ("bring forth"), which avoids echoing MAKE's 作る in MAKE's own gloss.
    id: 'CREATE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to bring into existence',
    emoji: '✨',
    forms: {
      en: {
        base: 'create',
        '1sg_present': 'create', '2sg_present': 'create', '3sg_present': 'creates',
        '1pl_present': 'create', '2pl_present': 'create', '3pl_present': 'create',
        past: 'created',
      },
      it: {
        base: 'creare',
        '1sg_present': 'creo', '2sg_present': 'crei', '3sg_present': 'crea',
        '1pl_present': 'creiamo', '2pl_present': 'create', '3pl_present': 'creano',
        '1sg_past': 'creai', '2sg_past': 'creasti', '3sg_past': 'creò',
        '1pl_past': 'creammo', '2pl_past': 'creaste', '3pl_past': 'crearono',
        '1sg_future': 'creerò', '2sg_future': 'creerai', '3sg_future': 'creerà',
        '1pl_future': 'creeremo', '2pl_future': 'creerete', '3pl_future': 'creeranno',
      },
      fr: {
        base: 'créer',
        '1sg_present': 'crée', '2sg_present': 'crées', '3sg_present': 'crée',
        '1pl_present': 'créons', '2pl_present': 'créez', '3pl_present': 'créent',
        '1sg_past': 'créai', '2sg_past': 'créas', '3sg_past': 'créa',
        '1pl_past': 'créâmes', '2pl_past': 'créâtes', '3pl_past': 'créèrent',
        '1sg_future': 'créerai', '2sg_future': 'créeras', '3sg_future': 'créera',
        '1pl_future': 'créerons', '2pl_future': 'créerez', '3pl_future': 'créeront',
      },
      de: {
        base: 'erschaffen',
        '1sg_present': 'erschaffe', '2sg_present': 'erschaffst', '3sg_present': 'erschafft',
        '1pl_present': 'erschaffen', '2pl_present': 'erschafft', '3pl_present': 'erschaffen',
        '1sg_past': 'erschuf', '2sg_past': 'erschufst', '3sg_past': 'erschuf',
        '1pl_past': 'erschufen', '2pl_past': 'erschuft', '3pl_past': 'erschufen',
      },
      es: {
        base: 'crear',
        '1sg_present': 'creo', '2sg_present': 'creas', '3sg_present': 'crea',
        '1pl_present': 'creamos', '2pl_present': 'creáis', '3pl_present': 'crean',
        '1sg_past': 'creé', '2sg_past': 'creaste', '3sg_past': 'creó',
        '1pl_past': 'creamos', '2pl_past': 'creasteis', '3pl_past': 'crearon',
        '1sg_future': 'crearé', '2sg_future': 'crearás', '3sg_future': 'creará',
        '1pl_future': 'crearemos', '2pl_future': 'crearéis', '3pl_future': 'crearán',
      },
      ja: {
        base: '生み出す',
        reading: 'うみだす',
        masu_present: '生み出します',
        masu_present_reading: 'うみだします',
      },
      pt: {
        base: 'criar',
        '1sg_present': 'crio', '2sg_present': 'cria', '3sg_present': 'cria',
        '1pl_present': 'criamos', '2pl_present': 'criam', '3pl_present': 'criam',
        '1sg_past': 'criei', '2sg_past': 'criou', '3sg_past': 'criou',
        '1pl_past': 'criamos', '2pl_past': 'criaram', '3pl_past': 'criaram',
        '1sg_future': 'criarei', '2sg_future': 'criará', '3sg_future': 'criará',
        '1pl_future': 'criaremos', '2pl_future': 'criarão', '3pl_future': 'criarão',
      },
    },
  },

  {
    // The genus of KILL ("to destroy life"), EXTINGUISH ("to destroy fire") and CLEAR ("to destroy
    // content") — the destruction verb their dictionary definitions cite as their genus (see the
    // B10 verb-definition task), and CREATE's antonym. Its own tooltip stays on the literal, as
    // CREATE's and CONSUME's do. Japanese takes the Sino-Japanese 破壊する, which echoes none of
    // 殺す / 消す / 消去する in their glosses.
    id: 'DESTROY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to put an end to; to ruin',
    emoji: '💥',
    forms: {
      en: {
        base: 'destroy',
        '1sg_present': 'destroy', '2sg_present': 'destroy', '3sg_present': 'destroys',
        '1pl_present': 'destroy', '2pl_present': 'destroy', '3pl_present': 'destroy',
        past: 'destroyed',
      },
      it: {
        base: 'distruggere',
        '1sg_present': 'distruggo', '2sg_present': 'distruggi', '3sg_present': 'distrugge',
        '1pl_present': 'distruggiamo', '2pl_present': 'distruggete', '3pl_present': 'distruggono',
        '1sg_past': 'distrussi', '2sg_past': 'distruggesti', '3sg_past': 'distrusse',
        '1pl_past': 'distruggemmo', '2pl_past': 'distruggeste', '3pl_past': 'distrussero',
        '1sg_future': 'distruggerò', '2sg_future': 'distruggerai', '3sg_future': 'distruggerà',
        '1pl_future': 'distruggeremo', '2pl_future': 'distruggerete', '3pl_future': 'distruggeranno',
      },
      fr: {
        base: 'détruire',
        '1sg_present': 'détruis', '2sg_present': 'détruis', '3sg_present': 'détruit',
        '1pl_present': 'détruisons', '2pl_present': 'détruisez', '3pl_present': 'détruisent',
        '1sg_past': 'détruisis', '2sg_past': 'détruisis', '3sg_past': 'détruisit',
        '1pl_past': 'détruisîmes', '2pl_past': 'détruisîtes', '3pl_past': 'détruisirent',
        '1sg_future': 'détruirai', '2sg_future': 'détruiras', '3sg_future': 'détruira',
        '1pl_future': 'détruirons', '2pl_future': 'détruirez', '3pl_future': 'détruiront',
      },
      de: {
        base: 'zerstören',
        '1sg_present': 'zerstöre', '2sg_present': 'zerstörst', '3sg_present': 'zerstört',
        '1pl_present': 'zerstören', '2pl_present': 'zerstört', '3pl_present': 'zerstören',
        '1sg_past': 'zerstörte', '2sg_past': 'zerstörtest', '3sg_past': 'zerstörte',
        '1pl_past': 'zerstörten', '2pl_past': 'zerstörtet', '3pl_past': 'zerstörten',
      },
      es: {
        base: 'destruir',
        '1sg_present': 'destruyo', '2sg_present': 'destruyes', '3sg_present': 'destruye',
        '1pl_present': 'destruimos', '2pl_present': 'destruís', '3pl_present': 'destruyen',
        '1sg_past': 'destruí', '2sg_past': 'destruiste', '3sg_past': 'destruyó',
        '1pl_past': 'destruimos', '2pl_past': 'destruisteis', '3pl_past': 'destruyeron',
        '1sg_future': 'destruiré', '2sg_future': 'destruirás', '3sg_future': 'destruirá',
        '1pl_future': 'destruiremos', '2pl_future': 'destruiréis', '3pl_future': 'destruirán',
      },
      ja: {
        base: '破壊する',
        reading: 'はかいする',
        masu_present: '破壊します',
        masu_present_reading: 'はかいします',
      },
      pt: {
        base: 'destruir',
        '1sg_present': 'destruo', '2sg_present': 'destrói', '3sg_present': 'destrói',
        '1pl_present': 'destruímos', '2pl_present': 'destroem', '3pl_present': 'destroem',
        '1sg_past': 'destruí', '2sg_past': 'destruiu', '3sg_past': 'destruiu',
        '1pl_past': 'destruímos', '2pl_past': 'destruíram', '3pl_past': 'destruíram',
        '1sg_future': 'destruirei', '2sg_future': 'destruirá', '3sg_future': 'destruirá',
        '1pl_future': 'destruiremos', '2pl_future': 'destruirão', '3pl_future': 'destruirão',
      },
    },
  },

  {
    // The genus of SEE ("to perceive light") — the perception verb its dictionary definition cites
    // as its genus (see the B11 verb-definition task). Its own tooltip stays on the literal, as
    // CREATE's and DESTROY's do. German takes the inseparable empfinden: the natural wahrnehmen is a
    // separable verb ("nimmt … wahr"), which the engine does not split. Japanese takes 知覚する, the
    // perception term, which echoes none of SEE's 見る.
    id: 'PERCEIVE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to become aware of through the senses',
    emoji: '📡',
    forms: {
      en: {
        base: 'perceive',
        '1sg_present': 'perceive', '2sg_present': 'perceive', '3sg_present': 'perceives',
        '1pl_present': 'perceive', '2pl_present': 'perceive', '3pl_present': 'perceive',
        past: 'perceived',
      },
      it: {
        base: 'percepire',
        '1sg_present': 'percepisco', '2sg_present': 'percepisci', '3sg_present': 'percepisce',
        '1pl_present': 'percepiamo', '2pl_present': 'percepite', '3pl_present': 'percepiscono',
        '1sg_past': 'percepii', '2sg_past': 'percepisti', '3sg_past': 'percepì',
        '1pl_past': 'percepimmo', '2pl_past': 'percepiste', '3pl_past': 'percepirono',
        '1sg_future': 'percepirò', '2sg_future': 'percepirai', '3sg_future': 'percepirà',
        '1pl_future': 'percepiremo', '2pl_future': 'percepirete', '3pl_future': 'percepiranno',
      },
      fr: {
        base: 'percevoir',
        '1sg_present': 'perçois', '2sg_present': 'perçois', '3sg_present': 'perçoit',
        '1pl_present': 'percevons', '2pl_present': 'percevez', '3pl_present': 'perçoivent',
        '1sg_past': 'perçus', '2sg_past': 'perçus', '3sg_past': 'perçut',
        '1pl_past': 'perçûmes', '2pl_past': 'perçûtes', '3pl_past': 'perçurent',
        '1sg_future': 'percevrai', '2sg_future': 'percevras', '3sg_future': 'percevra',
        '1pl_future': 'percevrons', '2pl_future': 'percevrez', '3pl_future': 'percevront',
      },
      de: {
        base: 'empfinden',
        '1sg_present': 'empfinde', '2sg_present': 'empfindest', '3sg_present': 'empfindet',
        '1pl_present': 'empfinden', '2pl_present': 'empfindet', '3pl_present': 'empfinden',
        '1sg_past': 'empfand', '2sg_past': 'empfandest', '3sg_past': 'empfand',
        '1pl_past': 'empfanden', '2pl_past': 'empfandet', '3pl_past': 'empfanden',
      },
      es: {
        base: 'percibir',
        '1sg_present': 'percibo', '2sg_present': 'percibes', '3sg_present': 'percibe',
        '1pl_present': 'percibimos', '2pl_present': 'percibís', '3pl_present': 'perciben',
        '1sg_past': 'percibí', '2sg_past': 'percibiste', '3sg_past': 'percibió',
        '1pl_past': 'percibimos', '2pl_past': 'percibisteis', '3pl_past': 'percibieron',
        '1sg_future': 'percibiré', '2sg_future': 'percibirás', '3sg_future': 'percibirá',
        '1pl_future': 'percibiremos', '2pl_future': 'percibiréis', '3pl_future': 'percibirán',
      },
      ja: {
        base: '知覚する',
        reading: 'ちかくする',
        masu_present: '知覚します',
        masu_present_reading: 'ちかくします',
      },
      pt: {
        base: 'perceber',
        '1sg_present': 'percebo', '2sg_present': 'percebe', '3sg_present': 'percebe',
        '1pl_present': 'percebemos', '2pl_present': 'percebem', '3pl_present': 'percebem',
        '1sg_past': 'percebi', '2sg_past': 'percebeu', '3sg_past': 'percebeu',
        '1pl_past': 'percebemos', '2pl_past': 'perceberam', '3pl_past': 'perceberam',
        '1sg_future': 'perceberei', '2sg_future': 'perceberá', '3sg_future': 'perceberá',
        '1pl_future': 'perceberemos', '2pl_future': 'perceberão', '3pl_future': 'perceberão',
      },
    },
  },

  {
    // The genus of KNOW ("to understand concepts") and READ ("to understand written words") — the
    // cognition verb their dictionary definitions cite as their genus (see the B11 verb-definition
    // task). Its own tooltip is "to know the meaning" (localization C28): KNOW with a noun object
    // swaps to KNOW_ACQUAINTED's word (A131), so it reads conoscere / connaître / kennen / conocer /
    // conhecer, the verb those languages know a meaning with; the definite article keeps French off
    // the partitive *du sens*. The Romance languages take the comprendere family
    // (not capire / entender), the register a dictionary gloss is written in; Portuguese in
    // particular avoids perceber, which is PERCEIVE here. Japanese takes 理解する, echoing neither
    // 知る nor 読む.
    id: 'UNDERSTAND',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to grasp the meaning of',
    definition: infinitiveGloss('KNOW', { object: 'MEANING', definiteness: 'definite' }),
    emoji: '🧩',
    forms: {
      en: {
        base: 'understand',
        '1sg_present': 'understand', '2sg_present': 'understand', '3sg_present': 'understands',
        '1pl_present': 'understand', '2pl_present': 'understand', '3pl_present': 'understand',
        past: 'understood',
      },
      it: {
        base: 'comprendere',
        '1sg_present': 'comprendo', '2sg_present': 'comprendi', '3sg_present': 'comprende',
        '1pl_present': 'comprendiamo', '2pl_present': 'comprendete', '3pl_present': 'comprendono',
        '1sg_past': 'compresi', '2sg_past': 'comprendesti', '3sg_past': 'comprese',
        '1pl_past': 'comprendemmo', '2pl_past': 'comprendeste', '3pl_past': 'compresero',
        '1sg_future': 'comprenderò', '2sg_future': 'comprenderai', '3sg_future': 'comprenderà',
        '1pl_future': 'comprenderemo', '2pl_future': 'comprenderete', '3pl_future': 'comprenderanno',
      },
      fr: {
        base: 'comprendre',
        '1sg_present': 'comprends', '2sg_present': 'comprends', '3sg_present': 'comprend',
        '1pl_present': 'comprenons', '2pl_present': 'comprenez', '3pl_present': 'comprennent',
        '1sg_past': 'compris', '2sg_past': 'compris', '3sg_past': 'comprit',
        '1pl_past': 'comprîmes', '2pl_past': 'comprîtes', '3pl_past': 'comprirent',
        '1sg_future': 'comprendrai', '2sg_future': 'comprendras', '3sg_future': 'comprendra',
        '1pl_future': 'comprendrons', '2pl_future': 'comprendrez', '3pl_future': 'comprendront',
      },
      de: {
        base: 'verstehen',
        '1sg_present': 'verstehe', '2sg_present': 'verstehst', '3sg_present': 'versteht',
        '1pl_present': 'verstehen', '2pl_present': 'versteht', '3pl_present': 'verstehen',
        '1sg_past': 'verstand', '2sg_past': 'verstandest', '3sg_past': 'verstand',
        '1pl_past': 'verstanden', '2pl_past': 'verstandet', '3pl_past': 'verstanden',
      },
      es: {
        base: 'comprender',
        '1sg_present': 'comprendo', '2sg_present': 'comprendes', '3sg_present': 'comprende',
        '1pl_present': 'comprendemos', '2pl_present': 'comprendéis', '3pl_present': 'comprenden',
        '1sg_past': 'comprendí', '2sg_past': 'comprendiste', '3sg_past': 'comprendió',
        '1pl_past': 'comprendimos', '2pl_past': 'comprendisteis', '3pl_past': 'comprendieron',
        '1sg_future': 'comprenderé', '2sg_future': 'comprenderás', '3sg_future': 'comprenderá',
        '1pl_future': 'comprenderemos', '2pl_future': 'comprenderéis', '3pl_future': 'comprenderán',
      },
      ja: {
        base: '理解する',
        reading: 'りかいする',
        masu_present: '理解します',
        masu_present_reading: 'りかいします',
      },
      pt: {
        base: 'compreender',
        '1sg_present': 'compreendo', '2sg_present': 'compreende', '3sg_present': 'compreende',
        '1pl_present': 'compreendemos', '2pl_present': 'compreendem', '3pl_present': 'compreendem',
        '1sg_past': 'compreendi', '2sg_past': 'compreendeu', '3sg_past': 'compreendeu',
        '1pl_past': 'compreendemos', '2pl_past': 'compreenderam', '3pl_past': 'compreenderam',
        '1sg_future': 'compreenderei', '2sg_future': 'compreenderá', '3sg_future': 'compreenderá',
        '1pl_future': 'compreenderemos', '2pl_future': 'compreenderão', '3pl_future': 'compreenderão',
      },
    },
  },

  {
    // The genus of OWN ("to have property") and HOLD ("to have objects") — the possession verb
    // their dictionary definitions cite as their genus (see the B12 verb-definition task). Its own
    // tooltip stays on the literal. Spanish and Portuguese take the lexical tener / ter, not the
    // auxiliary haber; Japanese takes 持つ, which takes an object, not the existential ある. Avoir,
    // avere and tener are irregular in their commands (aie / abbi / ten), which the engine's mood
    // override tables carry.
    id: 'HAVE',
    role: 'verb',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to possess; to keep with oneself',
    emoji: '🤲',
    forms: {
      en: {
        base: 'have',
        '1sg_present': 'have', '2sg_present': 'have', '3sg_present': 'has',
        '1pl_present': 'have', '2pl_present': 'have', '3pl_present': 'have',
        past: 'had',
      },
      it: {
        base: 'avere',
        '1sg_present': 'ho', '2sg_present': 'hai', '3sg_present': 'ha',
        '1pl_present': 'abbiamo', '2pl_present': 'avete', '3pl_present': 'hanno',
        '1sg_past': 'ebbi', '2sg_past': 'avesti', '3sg_past': 'ebbe',
        '1pl_past': 'avemmo', '2pl_past': 'aveste', '3pl_past': 'ebbero',
        '1sg_future': 'avrò', '2sg_future': 'avrai', '3sg_future': 'avrà',
        '1pl_future': 'avremo', '2pl_future': 'avrete', '3pl_future': 'avranno',
      },
      fr: {
        base: 'avoir',
        '1sg_present': 'ai', '2sg_present': 'as', '3sg_present': 'a',
        '1pl_present': 'avons', '2pl_present': 'avez', '3pl_present': 'ont',
        '1sg_past': 'eus', '2sg_past': 'eus', '3sg_past': 'eut',
        '1pl_past': 'eûmes', '2pl_past': 'eûtes', '3pl_past': 'eurent',
        '1sg_future': 'aurai', '2sg_future': 'auras', '3sg_future': 'aura',
        '1pl_future': 'aurons', '2pl_future': 'aurez', '3pl_future': 'auront',
      },
      de: {
        base: 'haben',
        '1sg_present': 'habe', '2sg_present': 'hast', '3sg_present': 'hat',
        '1pl_present': 'haben', '2pl_present': 'habt', '3pl_present': 'haben',
        '1sg_past': 'hatte', '2sg_past': 'hattest', '3sg_past': 'hatte',
        '1pl_past': 'hatten', '2pl_past': 'hattet', '3pl_past': 'hatten',
      },
      es: {
        // Having somebody is not doing anything to them, so tener takes no personal "a": "tiene los
        // mismos padres", where ver on the same object says "ve a los mismos padres" (B69).
        base: 'tener', object_no_a: '1',
        '1sg_present': 'tengo', '2sg_present': 'tienes', '3sg_present': 'tiene',
        '1pl_present': 'tenemos', '2pl_present': 'tenéis', '3pl_present': 'tienen',
        '1sg_past': 'tuve', '2sg_past': 'tuviste', '3sg_past': 'tuvo',
        '1pl_past': 'tuvimos', '2pl_past': 'tuvisteis', '3pl_past': 'tuvieron',
        '1sg_future': 'tendré', '2sg_future': 'tendrás', '3sg_future': 'tendrá',
        '1pl_future': 'tendremos', '2pl_future': 'tendréis', '3pl_future': 'tendrán',
      },
      ja: {
        base: '持つ',
        reading: 'もつ',
        masu_present: '持ちます',
        masu_present_reading: 'もちます',
        // 持つ is holding, which only a person or an animal does. A thing has its parts by their
        // being there, so an inanimate owner takes the existential ある, the object marked が:
        // 壁がある場所, 家は窓があります (A150).
        inanimate_aru: '1',
      },
      pt: {
        base: 'ter',
        '1sg_present': 'tenho', '2sg_present': 'tem', '3sg_present': 'tem',
        '1pl_present': 'temos', '2pl_present': 'têm', '3pl_present': 'têm',
        '1sg_past': 'tive', '2sg_past': 'teve', '3sg_past': 'teve',
        '1pl_past': 'tivemos', '2pl_past': 'tiveram', '3pl_past': 'tiveram',
        '1sg_future': 'terei', '2sg_future': 'terá', '3sg_future': 'terá',
        '1pl_future': 'teremos', '2pl_future': 'terão', '3pl_future': 'terão',
      },
    },
  },

  {
    // The genus of BUY ("to acquire in exchange for money") — the acquisition verb its dictionary
    // definition cites as its genus (see the B12 verb-definition task). Italian acquisire takes the
    // -isc- infix, French acquérir is irregular (acquiert / acquit / acquis), German erwerben is
    // strong and inseparable (erwirbt / erwarb / erworben, du command erwirb), and Spanish adquirir
    // diphthongs under stress (adquiere).
    id: 'ACQUIRE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'source', 'cause', 'locative'],
    description: 'to come to have',
    definition: infinitiveGloss('BEGIN', { infinitive: 'HAVE' }),
    emoji: '🫴',
    forms: {
      en: {
        base: 'acquire',
        '1sg_present': 'acquire', '2sg_present': 'acquire', '3sg_present': 'acquires',
        '1pl_present': 'acquire', '2pl_present': 'acquire', '3pl_present': 'acquire',
        past: 'acquired',
      },
      it: {
        base: 'acquisire',
        '1sg_present': 'acquisisco', '2sg_present': 'acquisisci', '3sg_present': 'acquisisce',
        '1pl_present': 'acquisiamo', '2pl_present': 'acquisite', '3pl_present': 'acquisiscono',
        '1sg_past': 'acquisii', '2sg_past': 'acquisisti', '3sg_past': 'acquisì',
        '1pl_past': 'acquisimmo', '2pl_past': 'acquisiste', '3pl_past': 'acquisirono',
        '1sg_future': 'acquisirò', '2sg_future': 'acquisirai', '3sg_future': 'acquisirà',
        '1pl_future': 'acquisiremo', '2pl_future': 'acquisirete', '3pl_future': 'acquisiranno',
      },
      fr: {
        base: 'acquérir',
        '1sg_present': 'acquiers', '2sg_present': 'acquiers', '3sg_present': 'acquiert',
        '1pl_present': 'acquérons', '2pl_present': 'acquérez', '3pl_present': 'acquièrent',
        '1sg_past': 'acquis', '2sg_past': 'acquis', '3sg_past': 'acquit',
        '1pl_past': 'acquîmes', '2pl_past': 'acquîtes', '3pl_past': 'acquirent',
        '1sg_future': 'acquerrai', '2sg_future': 'acquerras', '3sg_future': 'acquerra',
        '1pl_future': 'acquerrons', '2pl_future': 'acquerrez', '3pl_future': 'acquerront',
      },
      de: {
        base: 'erwerben',
        '1sg_present': 'erwerbe', '2sg_present': 'erwirbst', '3sg_present': 'erwirbt',
        '1pl_present': 'erwerben', '2pl_present': 'erwerbt', '3pl_present': 'erwerben',
        '1sg_past': 'erwarb', '2sg_past': 'erwarbst', '3sg_past': 'erwarb',
        '1pl_past': 'erwarben', '2pl_past': 'erwarbt', '3pl_past': 'erwarben',
        '2sg_imperative': 'erwirb', // strong e→i: the du command keeps the vowel change
      },
      es: {
        base: 'adquirir',
        '1sg_present': 'adquiero', '2sg_present': 'adquieres', '3sg_present': 'adquiere',
        '1pl_present': 'adquirimos', '2pl_present': 'adquirís', '3pl_present': 'adquieren',
        '1sg_past': 'adquirí', '2sg_past': 'adquiriste', '3sg_past': 'adquirió',
        '1pl_past': 'adquirimos', '2pl_past': 'adquiristeis', '3pl_past': 'adquirieron',
        '1sg_future': 'adquiriré', '2sg_future': 'adquirirás', '3sg_future': 'adquirirá',
        '1pl_future': 'adquiriremos', '2pl_future': 'adquiriréis', '3pl_future': 'adquirirán',
      },
      ja: {
        base: '取得する',
        reading: 'しゅとくする',
        masu_present: '取得します',
        masu_present_reading: 'しゅとくします',
      },
      pt: {
        base: 'adquirir',
        '1sg_present': 'adquiro', '2sg_present': 'adquire', '3sg_present': 'adquire',
        '1pl_present': 'adquirimos', '2pl_present': 'adquirem', '3pl_present': 'adquirem',
        '1sg_past': 'adquiri', '2sg_past': 'adquiriu', '3sg_past': 'adquiriu',
        '1pl_past': 'adquirimos', '2pl_past': 'adquiriram', '3pl_past': 'adquiriram',
        '1sg_future': 'adquirirei', '2sg_future': 'adquirirá', '3sg_future': 'adquirirá',
        '1pl_future': 'adquiriremos', '2pl_future': 'adquirirão', '3pl_future': 'adquirirão',
      },
    },
  },

  {
    // P09's take (localization B61): take hold of, obtain — the sense each language has one plain
    // verb for. The carry-away sense (portare via, emporter, mitnehmen, llevar) is not this concept.
    // Portuguese pegar is Brazilian, as the corpus's pt is; tomar elsewhere. Seeded ahead of B61's
    // other verbs because B65's HAND is glossed on it.
    id: 'TAKE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'source', 'cause', 'locative'],
    description: 'to get hold of with the hand',
    // "to acquire objects with the hand" (localization B61): BUY's shape, ACQUIRE with the instrument
    // that tells it apart. HAND is glossed back on TAKE ("an organ with which one takes an object",
    // B65), the verb-and-its-instrument pair BITE ↔ TOOTH and CUT ↔ BLADE already make.
    definition: infinitiveGloss('ACQUIRE', {
      object: 'OBJECT_THING',
      number: 'plural',
      complements: { instrumental: { phrase: { concept: 'HAND', definiteness: 'definite' } } },
    }),
    emoji: '✊',
    isA: 'ACQUIRE',
    forms: {
      en: {
        base: 'take',
        '1sg_present': 'take', '2sg_present': 'take', '3sg_present': 'takes',
        '1pl_present': 'take', '2pl_present': 'take', '3pl_present': 'take',
        past: 'took',
      },
      it: {
        base: 'prendere',
        '1sg_present': 'prendo', '2sg_present': 'prendi', '3sg_present': 'prende',
        '1pl_present': 'prendiamo', '2pl_present': 'prendete', '3pl_present': 'prendono',
        '1sg_past': 'presi', '2sg_past': 'prendesti', '3sg_past': 'prese',
        '1pl_past': 'prendemmo', '2pl_past': 'prendeste', '3pl_past': 'presero',
        '1sg_future': 'prenderò', '2sg_future': 'prenderai', '3sg_future': 'prenderà',
        '1pl_future': 'prenderemo', '2pl_future': 'prenderete', '3pl_future': 'prenderanno',
      },
      fr: {
        base: 'prendre',
        '1sg_present': 'prends', '2sg_present': 'prends', '3sg_present': 'prend',
        '1pl_present': 'prenons', '2pl_present': 'prenez', '3pl_present': 'prennent',
        '1sg_past': 'pris', '2sg_past': 'pris', '3sg_past': 'prit',
        '1pl_past': 'prîmes', '2pl_past': 'prîtes', '3pl_past': 'prirent',
        '1sg_future': 'prendrai', '2sg_future': 'prendras', '3sg_future': 'prendra',
        '1pl_future': 'prendrons', '2pl_future': 'prendrez', '3pl_future': 'prendront',
      },
      de: {
        base: 'nehmen',
        '1sg_present': 'nehme', '2sg_present': 'nimmst', '3sg_present': 'nimmt',
        '1pl_present': 'nehmen', '2pl_present': 'nehmt', '3pl_present': 'nehmen',
        '1sg_past': 'nahm', '2sg_past': 'nahmst', '3sg_past': 'nahm',
        '1pl_past': 'nahmen', '2pl_past': 'nahmt', '3pl_past': 'nahmen',
        '2sg_imperative': 'nimm', // strong e→i: the du command keeps the vowel change
      },
      es: {
        base: 'tomar',
        '1sg_present': 'tomo', '2sg_present': 'tomas', '3sg_present': 'toma',
        '1pl_present': 'tomamos', '2pl_present': 'tomáis', '3pl_present': 'toman',
        '1sg_past': 'tomé', '2sg_past': 'tomaste', '3sg_past': 'tomó',
        '1pl_past': 'tomamos', '2pl_past': 'tomasteis', '3pl_past': 'tomaron',
        '1sg_future': 'tomaré', '2sg_future': 'tomarás', '3sg_future': 'tomará',
        '1pl_future': 'tomaremos', '2pl_future': 'tomaréis', '3pl_future': 'tomarán',
      },
      ja: {
        base: '取る',
        reading: 'とる',
        masu_present: '取ります',
        masu_present_reading: 'とります',
      },
      pt: {
        base: 'pegar',
        '1sg_present': 'pego', '2sg_present': 'pega', '3sg_present': 'pega',
        '1pl_present': 'pegamos', '2pl_present': 'pegam', '3pl_present': 'pegam',
        '1sg_past': 'peguei', '2sg_past': 'pegou', '3sg_past': 'pegou',
        '1pl_past': 'pegamos', '2pl_past': 'pegaram', '3pl_past': 'pegaram',
        '1sg_future': 'pegarei', '2sg_future': 'pegará', '3sg_future': 'pegará',
        '1pl_future': 'pegaremos', '2pl_future': 'pegarão', '3pl_future': 'pegarão',
      },
    },
  },

  // ── Handling (localization B61) ───────────────────────────────────
  // P09's get, put, keep, bring and leave (the leaving-behind sense), and look at, with DIRECT_VERB,
  // the differentia LOOK_AT's gloss needs. Glossed on the shapes BUY, REMOVE and RESTORE ship:
  // ACQUIRE plus one complement, or the causative of what the object comes to do.
  {
    // P09's get (D1): obtain, receive. ACQUIRE stays beside it for register, which no gloss says, so
    // the source carries the difference: the receiving half, German bekommen. ACQUIRE's complements
    // and no `direction`, so Italian's animate source is a plain "da" (A228). Japanese 手に入れる is
    // obtaining; もらう is receiving from someone, the narrower half. The English participle is the
    // British "got", as the corpus spells labour and colour.
    id: 'GET',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'source', 'cause', 'locative'],
    description: 'to come to have; to obtain or receive',
    definition: infinitiveGloss('ACQUIRE', {
      object: 'OBJECT_THING',
      number: 'plural',
      complements: { source: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } },
    }),
    emoji: '📥',
    isA: 'ACQUIRE',
    forms: {
      en: {
        base: 'get',
        '1sg_present': 'get', '2sg_present': 'get', '3sg_present': 'gets',
        '1pl_present': 'get', '2pl_present': 'get', '3pl_present': 'get',
        past: 'got',
      },
      it: {
        base: 'ottenere',
        '1sg_present': 'ottengo', '2sg_present': 'ottieni', '3sg_present': 'ottiene',
        '1pl_present': 'otteniamo', '2pl_present': 'ottenete', '3pl_present': 'ottengono',
        '1sg_past': 'ottenni', '2sg_past': 'ottenesti', '3sg_past': 'ottenne',
        '1pl_past': 'ottenemmo', '2pl_past': 'otteneste', '3pl_past': 'ottennero',
        '1sg_future': 'otterrò', '2sg_future': 'otterrai', '3sg_future': 'otterrà',
        '1pl_future': 'otterremo', '2pl_future': 'otterrete', '3pl_future': 'otterranno',
      },
      fr: {
        base: 'obtenir',
        '1sg_present': 'obtiens', '2sg_present': 'obtiens', '3sg_present': 'obtient',
        '1pl_present': 'obtenons', '2pl_present': 'obtenez', '3pl_present': 'obtiennent',
        '1sg_past': 'obtins', '2sg_past': 'obtins', '3sg_past': 'obtint',
        '1pl_past': 'obtînmes', '2pl_past': 'obtîntes', '3pl_past': 'obtinrent',
        '1sg_future': 'obtiendrai', '2sg_future': 'obtiendras', '3sg_future': 'obtiendra',
        '1pl_future': 'obtiendrons', '2pl_future': 'obtiendrez', '3pl_future': 'obtiendront',
      },
      de: {
        base: 'bekommen',
        '1sg_present': 'bekomme', '2sg_present': 'bekommst', '3sg_present': 'bekommt',
        '1pl_present': 'bekommen', '2pl_present': 'bekommt', '3pl_present': 'bekommen',
        '1sg_past': 'bekam', '2sg_past': 'bekamst', '3sg_past': 'bekam',
        '1pl_past': 'bekamen', '2pl_past': 'bekamt', '3pl_past': 'bekamen',
      },
      es: {
        // conseguir: e → i under the stress, and the gu → g before a/o (consigo).
        base: 'conseguir',
        '1sg_present': 'consigo', '2sg_present': 'consigues', '3sg_present': 'consigue',
        '1pl_present': 'conseguimos', '2pl_present': 'conseguís', '3pl_present': 'consiguen',
        '1sg_past': 'conseguí', '2sg_past': 'conseguiste', '3sg_past': 'consiguió',
        '1pl_past': 'conseguimos', '2pl_past': 'conseguisteis', '3pl_past': 'consiguieron',
        '1sg_future': 'conseguiré', '2sg_future': 'conseguirás', '3sg_future': 'conseguirá',
        '1pl_future': 'conseguiremos', '2pl_future': 'conseguiréis', '3pl_future': 'conseguirán',
      },
      ja: {
        base: '手に入れる',
        reading: 'てにいれる',
        masu_present: '手に入れます',
        masu_present_reading: 'てにいれます',
      },
      pt: {
        base: 'conseguir',
        '1sg_present': 'consigo', '2sg_present': 'consegue', '3sg_present': 'consegue',
        '1pl_present': 'conseguimos', '2pl_present': 'conseguem', '3pl_present': 'conseguem',
        '1sg_past': 'consegui', '2sg_past': 'conseguiu', '3sg_past': 'conseguiu',
        '1pl_past': 'conseguimos', '2pl_past': 'conseguiram', '3pl_past': 'conseguiram',
        '1sg_future': 'conseguirei', '2sg_future': 'conseguirá', '3sg_future': 'conseguirá',
        '1pl_future': 'conseguiremos', '2pl_future': 'conseguirão', '3pl_future': 'conseguirão',
      },
    },
  },
  {
    // P09's put: set a thing in a place. German legen, the orientation-free default (stellen is
    // upright, setzen seated, stecken into, tun colloquial). The goal is licensed both ways, because
    // two languages want opposite ones: German legen takes its goal in the accusative, the
    // `direction` with `in` ("legt das Buch in das Haus"), where a `locative` says the dative of
    // where the act happens; Japanese 置く takes the place with に (`locative_particle`, 家に本を置き
    // ます), where a direction says へ. Spanish poner's tú command is the irregular "pon".
    id: 'PUT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'direction', 'cause', 'locative'],
    description: 'to move something to a place and leave it there',
    // "to cause an object to be in a place": REMOVE's converse, the causative on BE where REMOVE's is
    // on LEAVE. German "an einem Ort" is Ort's own preposition (A218).
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BE', complements: { locative: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } } } },
    ),
    emoji: '📍',
    forms: {
      en: {
        base: 'put',
        '1sg_present': 'put', '2sg_present': 'put', '3sg_present': 'puts',
        '1pl_present': 'put', '2pl_present': 'put', '3pl_present': 'put',
        past: 'put',
      },
      it: {
        base: 'mettere',
        '1sg_present': 'metto', '2sg_present': 'metti', '3sg_present': 'mette',
        '1pl_present': 'mettiamo', '2pl_present': 'mettete', '3pl_present': 'mettono',
        '1sg_past': 'misi', '2sg_past': 'mettesti', '3sg_past': 'mise',
        '1pl_past': 'mettemmo', '2pl_past': 'metteste', '3pl_past': 'misero',
        '1sg_future': 'metterò', '2sg_future': 'metterai', '3sg_future': 'metterà',
        '1pl_future': 'metteremo', '2pl_future': 'metterete', '3pl_future': 'metteranno',
      },
      fr: {
        base: 'mettre',
        '1sg_present': 'mets', '2sg_present': 'mets', '3sg_present': 'met',
        '1pl_present': 'mettons', '2pl_present': 'mettez', '3pl_present': 'mettent',
        '1sg_past': 'mis', '2sg_past': 'mis', '3sg_past': 'mit',
        '1pl_past': 'mîmes', '2pl_past': 'mîtes', '3pl_past': 'mirent',
        '1sg_future': 'mettrai', '2sg_future': 'mettras', '3sg_future': 'mettra',
        '1pl_future': 'mettrons', '2pl_future': 'mettrez', '3pl_future': 'mettront',
      },
      de: {
        base: 'legen',
        '1sg_present': 'lege', '2sg_present': 'legst', '3sg_present': 'legt',
        '1pl_present': 'legen', '2pl_present': 'legt', '3pl_present': 'legen',
        '1sg_past': 'legte', '2sg_past': 'legtest', '3sg_past': 'legte',
        '1pl_past': 'legten', '2pl_past': 'legtet', '3pl_past': 'legten',
      },
      es: {
        base: 'poner',
        '1sg_present': 'pongo', '2sg_present': 'pones', '3sg_present': 'pone',
        '1pl_present': 'ponemos', '2pl_present': 'ponéis', '3pl_present': 'ponen',
        '1sg_past': 'puse', '2sg_past': 'pusiste', '3sg_past': 'puso',
        '1pl_past': 'pusimos', '2pl_past': 'pusisteis', '3pl_past': 'pusieron',
        '1sg_future': 'pondré', '2sg_future': 'pondrás', '3sg_future': 'pondrá',
        '1pl_future': 'pondremos', '2pl_future': 'pondréis', '3pl_future': 'pondrán',
      },
      ja: {
        base: '置く',
        reading: 'おく',
        masu_present: '置きます',
        masu_present_reading: 'おきます',
        locative_particle: 'に',
      },
      pt: {
        base: 'pôr',
        '1sg_present': 'ponho', '2sg_present': 'põe', '3sg_present': 'põe',
        '1pl_present': 'pomos', '2pl_present': 'põem', '3pl_present': 'põem',
        '1sg_past': 'pus', '2sg_past': 'pôs', '3sg_past': 'pôs',
        '1pl_past': 'pusemos', '2pl_past': 'puseram', '3pl_past': 'puseram',
        '1sg_future': 'porei', '2sg_future': 'porá', '3sg_future': 'porá',
        '1pl_future': 'poremos', '2pl_future': 'porão', '3pl_future': 'porão',
      },
    },
  },
  {
    // P09's keep: go on having, not give up. Spanish conservar, not guardar, which is SAVE's Spanish;
    // Portuguese guardar is free (SAVE is salvar there). Japanese 取っておく is keeping for later; 保つ
    // is keeping a state. German behalten is strong (behält, behielt, behalten).
    id: 'KEEP',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to continue to have; not to give up',
    // "still to have objects" (localization B61): HAVE with STILL, English's frequency adverb before
    // its "to" by design. Its natural gloss, "to continue to have", needs a continuative complement
    // the engine lacks (Spanish continuar takes a gerund).
    definition: infinitiveGloss('HAVE', { object: 'OBJECT_THING', number: 'plural', modifier: 'STILL' }),
    emoji: '🫳',
    isA: 'HAVE',
    forms: {
      en: {
        base: 'keep',
        '1sg_present': 'keep', '2sg_present': 'keep', '3sg_present': 'keeps',
        '1pl_present': 'keep', '2pl_present': 'keep', '3pl_present': 'keep',
        past: 'kept',
      },
      it: {
        base: 'tenere',
        '1sg_present': 'tengo', '2sg_present': 'tieni', '3sg_present': 'tiene',
        '1pl_present': 'teniamo', '2pl_present': 'tenete', '3pl_present': 'tengono',
        '1sg_past': 'tenni', '2sg_past': 'tenesti', '3sg_past': 'tenne',
        '1pl_past': 'tenemmo', '2pl_past': 'teneste', '3pl_past': 'tennero',
        '1sg_future': 'terrò', '2sg_future': 'terrai', '3sg_future': 'terrà',
        '1pl_future': 'terremo', '2pl_future': 'terrete', '3pl_future': 'terranno',
      },
      fr: {
        base: 'garder',
        '1sg_present': 'garde', '2sg_present': 'gardes', '3sg_present': 'garde',
        '1pl_present': 'gardons', '2pl_present': 'gardez', '3pl_present': 'gardent',
        '1sg_past': 'gardai', '2sg_past': 'gardas', '3sg_past': 'garda',
        '1pl_past': 'gardâmes', '2pl_past': 'gardâtes', '3pl_past': 'gardèrent',
        '1sg_future': 'garderai', '2sg_future': 'garderas', '3sg_future': 'gardera',
        '1pl_future': 'garderons', '2pl_future': 'garderez', '3pl_future': 'garderont',
      },
      de: {
        base: 'behalten',
        '1sg_present': 'behalte', '2sg_present': 'behältst', '3sg_present': 'behält',
        '1pl_present': 'behalten', '2pl_present': 'behaltet', '3pl_present': 'behalten',
        '1sg_past': 'behielt', '2sg_past': 'behieltst', '3sg_past': 'behielt',
        '1pl_past': 'behielten', '2pl_past': 'behieltet', '3pl_past': 'behielten',
      },
      es: {
        base: 'conservar',
        '1sg_present': 'conservo', '2sg_present': 'conservas', '3sg_present': 'conserva',
        '1pl_present': 'conservamos', '2pl_present': 'conserváis', '3pl_present': 'conservan',
        '1sg_past': 'conservé', '2sg_past': 'conservaste', '3sg_past': 'conservó',
        '1pl_past': 'conservamos', '2pl_past': 'conservasteis', '3pl_past': 'conservaron',
        '1sg_future': 'conservaré', '2sg_future': 'conservarás', '3sg_future': 'conservará',
        '1pl_future': 'conservaremos', '2pl_future': 'conservaréis', '3pl_future': 'conservarán',
      },
      ja: {
        base: '取っておく',
        reading: 'とっておく',
        masu_present: '取っておきます',
        masu_present_reading: 'とっておきます',
      },
      pt: {
        base: 'guardar',
        '1sg_present': 'guardo', '2sg_present': 'guarda', '3sg_present': 'guarda',
        '1pl_present': 'guardamos', '2pl_present': 'guardam', '3pl_present': 'guardam',
        '1sg_past': 'guardei', '2sg_past': 'guardou', '3sg_past': 'guardou',
        '1pl_past': 'guardamos', '2pl_past': 'guardaram', '3pl_past': 'guardaram',
        '1sg_future': 'guardarei', '2sg_future': 'guardará', '3sg_future': 'guardará',
        '1pl_future': 'guardaremos', '2pl_future': 'guardarão', '3pl_future': 'guardarão',
      },
    },
  },
  // P09-E24's *lose* (rank 273), P09 D2's first half (localization B85): to no longer have, KEEP's
  // opposite. Glossed "to stop having objects" on P09-E42's STOP_DOING, not the ticket's "no longer to
  // have objects": NO_LONGER in an infinitive reads "no tener ya no objetos" and "não ter já não
  // objetos" (B84's defect), and German wants "keine Gegenstände mehr". The game one loses is LOSE_GAME, which only Japanese says with its own word (負ける
  // against 失う). Italian perdere is strong (persi, perso), Spanish perder diphthongs (pierdo),
  // Portuguese perder has perco, French perdre is an -re verb (perd, perdit, perdu), German
  // verlieren is strong and inseparable (verlor, verloren).
  {
    id: 'LOSE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to stop having something',
    definition: infinitiveGloss('STOP_DOING', {
      infinitive: { verbPhrase: { verb: 'HAVE' }, directObject: { concept: 'OBJECT_THING', definiteness: 'bare', number: 'plural' } },
    }),
    emoji: '🫥',
    forms: {
      en: {
        base: 'lose',
        '1sg_present': 'lose', '2sg_present': 'lose', '3sg_present': 'loses',
        '1pl_present': 'lose', '2pl_present': 'lose', '3pl_present': 'lose',
        past: 'lost',
      },
      it: {
        base: 'perdere',
        '1sg_present': 'perdo', '2sg_present': 'perdi', '3sg_present': 'perde',
        '1pl_present': 'perdiamo', '2pl_present': 'perdete', '3pl_present': 'perdono',
        '1sg_past': 'persi', '2sg_past': 'perdesti', '3sg_past': 'perse',
        '1pl_past': 'perdemmo', '2pl_past': 'perdeste', '3pl_past': 'persero',
        '1sg_future': 'perderò', '2sg_future': 'perderai', '3sg_future': 'perderà',
        '1pl_future': 'perderemo', '2pl_future': 'perderete', '3pl_future': 'perderanno',
      },
      fr: {
        base: 'perdre',
        '1sg_present': 'perds', '2sg_present': 'perds', '3sg_present': 'perd',
        '1pl_present': 'perdons', '2pl_present': 'perdez', '3pl_present': 'perdent',
        '1sg_past': 'perdis', '2sg_past': 'perdis', '3sg_past': 'perdit',
        '1pl_past': 'perdîmes', '2pl_past': 'perdîtes', '3pl_past': 'perdirent',
        '1sg_future': 'perdrai', '2sg_future': 'perdras', '3sg_future': 'perdra',
        '1pl_future': 'perdrons', '2pl_future': 'perdrez', '3pl_future': 'perdront',
      },
      de: {
        base: 'verlieren',
        '1sg_present': 'verliere', '2sg_present': 'verlierst', '3sg_present': 'verliert',
        '1pl_present': 'verlieren', '2pl_present': 'verliert', '3pl_present': 'verlieren',
        '1sg_past': 'verlor', '2sg_past': 'verlorst', '3sg_past': 'verlor',
        '1pl_past': 'verloren', '2pl_past': 'verlort', '3pl_past': 'verloren',
      },
      es: {
        base: 'perder',
        '1sg_present': 'pierdo', '2sg_present': 'pierdes', '3sg_present': 'pierde',
        '1pl_present': 'perdemos', '2pl_present': 'perdéis', '3pl_present': 'pierden',
        '1sg_past': 'perdí', '2sg_past': 'perdiste', '3sg_past': 'perdió',
        '1pl_past': 'perdimos', '2pl_past': 'perdisteis', '3pl_past': 'perdieron',
        '1sg_future': 'perderé', '2sg_future': 'perderás', '3sg_future': 'perderá',
        '1pl_future': 'perderemos', '2pl_future': 'perderéis', '3pl_future': 'perderán',
      },
      ja: {
        base: '失う',
        reading: 'うしなう',
        masu_present: '失います',
        masu_present_reading: 'うしないます',
      },
      pt: {
        base: 'perder',
        '1sg_present': 'perco', '2sg_present': 'perde', '3sg_present': 'perde',
        '1pl_present': 'perdemos', '2pl_present': 'perdem', '3pl_present': 'perdem',
        '1sg_past': 'perdi', '2sg_past': 'perdeu', '3sg_past': 'perdeu',
        '1pl_past': 'perdemos', '2pl_past': 'perderam', '3pl_past': 'perderam',
        '1sg_future': 'perderei', '2sg_future': 'perderá', '3sg_future': 'perderá',
        '1pl_future': 'perderemos', '2pl_future': 'perderão', '3pl_future': 'perderão',
      },
    },
  },
  // P09-E24's *win* (rank 347; localization B85): "to be best in a game", on B82's GAME. With or
  // without an object (the game, the prize), and against someone (P09-E22's `opponent`). Japanese
  // marks both に: the game (ゲームに勝ちます, `object_particle`) and the opponent (犬に勝ちます,
  // `opponent_prep`). Italian vincere is strong (vinsi, vinto), German
  // gewinnen too (gewann, gewonnen); Portuguese vencer, the contest word LOSE_GAME mirrors (ganhar is
  // the prize's), with venço.
  {
    id: 'WIN',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative', 'opponent'],
    description: 'to come first in a contest',
    definition: infinitiveGloss('BE', {
      predicate: 'GOOD',
      predicateDegree: 'most',
      complements: { locative: { phrase: { concept: 'GAME', definiteness: 'indefinite' } } },
    }),
    emoji: '🏆',
    forms: {
      en: {
        base: 'win',
        '1sg_present': 'win', '2sg_present': 'win', '3sg_present': 'wins',
        '1pl_present': 'win', '2pl_present': 'win', '3pl_present': 'win',
        past: 'won',
      },
      it: {
        base: 'vincere',
        '1sg_present': 'vinco', '2sg_present': 'vinci', '3sg_present': 'vince',
        '1pl_present': 'vinciamo', '2pl_present': 'vincete', '3pl_present': 'vincono',
        '1sg_past': 'vinsi', '2sg_past': 'vincesti', '3sg_past': 'vinse',
        '1pl_past': 'vincemmo', '2pl_past': 'vinceste', '3pl_past': 'vinsero',
        '1sg_future': 'vincerò', '2sg_future': 'vincerai', '3sg_future': 'vincerà',
        '1pl_future': 'vinceremo', '2pl_future': 'vincerete', '3pl_future': 'vinceranno',
      },
      fr: {
        base: 'gagner',
        '1sg_present': 'gagne', '2sg_present': 'gagnes', '3sg_present': 'gagne',
        '1pl_present': 'gagnons', '2pl_present': 'gagnez', '3pl_present': 'gagnent',
        '1sg_past': 'gagnai', '2sg_past': 'gagnas', '3sg_past': 'gagna',
        '1pl_past': 'gagnâmes', '2pl_past': 'gagnâtes', '3pl_past': 'gagnèrent',
        '1sg_future': 'gagnerai', '2sg_future': 'gagneras', '3sg_future': 'gagnera',
        '1pl_future': 'gagnerons', '2pl_future': 'gagnerez', '3pl_future': 'gagneront',
      },
      de: {
        base: 'gewinnen',
        '1sg_present': 'gewinne', '2sg_present': 'gewinnst', '3sg_present': 'gewinnt',
        '1pl_present': 'gewinnen', '2pl_present': 'gewinnt', '3pl_present': 'gewinnen',
        '1sg_past': 'gewann', '2sg_past': 'gewannst', '3sg_past': 'gewann',
        '1pl_past': 'gewannen', '2pl_past': 'gewannt', '3pl_past': 'gewannen',
      },
      es: {
        base: 'ganar',
        '1sg_present': 'gano', '2sg_present': 'ganas', '3sg_present': 'gana',
        '1pl_present': 'ganamos', '2pl_present': 'ganáis', '3pl_present': 'ganan',
        '1sg_past': 'gané', '2sg_past': 'ganaste', '3sg_past': 'ganó',
        '1pl_past': 'ganamos', '2pl_past': 'ganasteis', '3pl_past': 'ganaron',
        '1sg_future': 'ganaré', '2sg_future': 'ganarás', '3sg_future': 'ganará',
        '1pl_future': 'ganaremos', '2pl_future': 'ganaréis', '3pl_future': 'ganarán',
      },
      ja: {
        base: '勝つ', opponent_prep: 'に', object_particle: 'に',
        reading: 'かつ',
        masu_present: '勝ちます',
        masu_present_reading: 'かちます',
      },
      pt: {
        base: 'vencer',
        '1sg_present': 'venço', '2sg_present': 'vence', '3sg_present': 'vence',
        '1pl_present': 'vencemos', '2pl_present': 'vencem', '3pl_present': 'vencem',
        '1sg_past': 'venci', '2sg_past': 'venceu', '3sg_past': 'venceu',
        '1pl_past': 'vencemos', '2pl_past': 'venceram', '3pl_past': 'venceram',
        '1sg_future': 'vencerei', '2sg_future': 'vencerá', '3sg_future': 'vencerá',
        '1pl_future': 'venceremos', '2pl_future': 'vencerão', '3pl_future': 'vencerão',
      },
    },
  },
  {
    // P09's bring: carry here. French apporter (a thing; amener is for a person). Japanese 持ってくる
    // conjugates as 来る (持ってきます, 持ってこない). Transitive with a `direction`, as P09 says.
    id: 'BRING',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'direction', 'source', 'cause', 'locative'],
    description: 'to carry something to the speaker or a place',
    // "to cause an object to come" (localization B61): the causative of COME, whose own gloss already
    // names the speaker. B60's CALL is the same causative with a person as the causee, "to cause a
    // person to come": the causee is the difference, and both ship.
    definition: causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'COME' }),
    emoji: '🎁',
    forms: {
      en: {
        base: 'bring',
        '1sg_present': 'bring', '2sg_present': 'bring', '3sg_present': 'brings',
        '1pl_present': 'bring', '2pl_present': 'bring', '3pl_present': 'bring',
        past: 'brought',
      },
      it: {
        base: 'portare',
        '1sg_present': 'porto', '2sg_present': 'porti', '3sg_present': 'porta',
        '1pl_present': 'portiamo', '2pl_present': 'portate', '3pl_present': 'portano',
        '1sg_past': 'portai', '2sg_past': 'portasti', '3sg_past': 'portò',
        '1pl_past': 'portammo', '2pl_past': 'portaste', '3pl_past': 'portarono',
        '1sg_future': 'porterò', '2sg_future': 'porterai', '3sg_future': 'porterà',
        '1pl_future': 'porteremo', '2pl_future': 'porterete', '3pl_future': 'porteranno',
      },
      fr: {
        base: 'apporter',
        '1sg_present': 'apporte', '2sg_present': 'apportes', '3sg_present': 'apporte',
        '1pl_present': 'apportons', '2pl_present': 'apportez', '3pl_present': 'apportent',
        '1sg_past': 'apportai', '2sg_past': 'apportas', '3sg_past': 'apporta',
        '1pl_past': 'apportâmes', '2pl_past': 'apportâtes', '3pl_past': 'apportèrent',
        '1sg_future': 'apporterai', '2sg_future': 'apporteras', '3sg_future': 'apportera',
        '1pl_future': 'apporterons', '2pl_future': 'apporterez', '3pl_future': 'apporteront',
      },
      de: {
        base: 'bringen',
        '1sg_present': 'bringe', '2sg_present': 'bringst', '3sg_present': 'bringt',
        '1pl_present': 'bringen', '2pl_present': 'bringt', '3pl_present': 'bringen',
        '1sg_past': 'brachte', '2sg_past': 'brachtest', '3sg_past': 'brachte',
        '1pl_past': 'brachten', '2pl_past': 'brachtet', '3pl_past': 'brachten',
      },
      es: {
        base: 'traer',
        '1sg_present': 'traigo', '2sg_present': 'traes', '3sg_present': 'trae',
        '1pl_present': 'traemos', '2pl_present': 'traéis', '3pl_present': 'traen',
        '1sg_past': 'traje', '2sg_past': 'trajiste', '3sg_past': 'trajo',
        '1pl_past': 'trajimos', '2pl_past': 'trajisteis', '3pl_past': 'trajeron',
        '1sg_future': 'traeré', '2sg_future': 'traerás', '3sg_future': 'traerá',
        '1pl_future': 'traeremos', '2pl_future': 'traeréis', '3pl_future': 'traerán',
      },
      ja: {
        base: '持ってくる',
        reading: 'もってくる',
        masu_present: '持ってきます',
        masu_present_reading: 'もってきます',
      },
      pt: {
        base: 'trazer',
        '1sg_present': 'trago', '2sg_present': 'traz', '3sg_present': 'traz',
        '1pl_present': 'trazemos', '2pl_present': 'trazem', '3pl_present': 'trazem',
        '1sg_past': 'trouxe', '2sg_past': 'trouxe', '3sg_past': 'trouxe',
        '1pl_past': 'trouxemos', '2pl_past': 'trouxeram', '3pl_past': 'trouxeram',
        '1sg_future': 'trarei', '2sg_future': 'trará', '3sg_future': 'trará',
        '1pl_future': 'traremos', '2pl_future': 'trarão', '3pl_future': 'trarão',
      },
    },
  },

  {
    // E24's *lead* (rank 349): to guide someone somewhere. The goal is a `direction`. Italian condurre
    // keeps its Latin stem (conduco, condusse, condotto), as tradurre does; French mener opens its e
    // before a mute ending (mène, mènerai); Spanish guiar stresses its i in the singular (guío) and
    // writes the monosyllabic guio, guie without an accent; Portuguese conduzir drops its -e in the 3sg
    // (conduz).
    id: 'LEAD',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'direction', 'route', 'locative', 'cause'],
    description: 'to show someone the way by going with them',
    synonym: 'guide',
    // "to cause a person to go to a place" (localization B83): C08's causative on GO, with the goal
    // inside the caused clause. German veranlassen is the shipped causative's word (führen means the
    // gloss exactly).
    definition: causativeGloss(
      { object: 'PERSON', definiteness: 'indefinite' },
      { verb: 'GO', complements: { direction: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } } } },
    ),
    emoji: '🧭',
    forms: {
      en: {
        base: 'lead',
        '1sg_present': 'lead', '2sg_present': 'lead', '3sg_present': 'leads',
        '1pl_present': 'lead', '2pl_present': 'lead', '3pl_present': 'lead',
        past: 'led',
      },
      it: {
        base: 'condurre',
        '1sg_present': 'conduco', '2sg_present': 'conduci', '3sg_present': 'conduce',
        '1pl_present': 'conduciamo', '2pl_present': 'conducete', '3pl_present': 'conducono',
        '1sg_past': 'condussi', '2sg_past': 'conducesti', '3sg_past': 'condusse',
        '1pl_past': 'conducemmo', '2pl_past': 'conduceste', '3pl_past': 'condussero',
        '1sg_future': 'condurrò', '2sg_future': 'condurrai', '3sg_future': 'condurrà',
        '1pl_future': 'condurremo', '2pl_future': 'condurrete', '3pl_future': 'condurranno',
      },
      fr: {
        base: 'mener',
        '1sg_present': 'mène', '2sg_present': 'mènes', '3sg_present': 'mène',
        '1pl_present': 'menons', '2pl_present': 'menez', '3pl_present': 'mènent',
        '1sg_past': 'menai', '2sg_past': 'menas', '3sg_past': 'mena',
        '1pl_past': 'menâmes', '2pl_past': 'menâtes', '3pl_past': 'menèrent',
        '1sg_future': 'mènerai', '2sg_future': 'mèneras', '3sg_future': 'mènera',
        '1pl_future': 'mènerons', '2pl_future': 'mènerez', '3pl_future': 'mèneront',
      },
      de: {
        base: 'führen',
        '1sg_present': 'führe', '2sg_present': 'führst', '3sg_present': 'führt',
        '1pl_present': 'führen', '2pl_present': 'führt', '3pl_present': 'führen',
        '1sg_past': 'führte', '2sg_past': 'führtest', '3sg_past': 'führte',
        '1pl_past': 'führten', '2pl_past': 'führtet', '3pl_past': 'führten',
      },
      es: {
        base: 'guiar',
        '1sg_present': 'guío', '2sg_present': 'guías', '3sg_present': 'guía',
        '1pl_present': 'guiamos', '2pl_present': 'guiais', '3pl_present': 'guían',
        '1sg_past': 'guie', '2sg_past': 'guiaste', '3sg_past': 'guio',
        '1pl_past': 'guiamos', '2pl_past': 'guiasteis', '3pl_past': 'guiaron',
        '1sg_future': 'guiaré', '2sg_future': 'guiarás', '3sg_future': 'guiará',
        '1pl_future': 'guiaremos', '2pl_future': 'guiaréis', '3pl_future': 'guiarán',
      },
      ja: {
        base: '導く',
        reading: 'みちびく',
        masu_present: '導きます',
        masu_present_reading: 'みちびきます',
      },
      pt: {
        base: 'conduzir',
        '1sg_present': 'conduzo', '2sg_present': 'conduz', '3sg_present': 'conduz',
        '1pl_present': 'conduzimos', '2pl_present': 'conduzem', '3pl_present': 'conduzem',
        '1sg_past': 'conduzi', '2sg_past': 'conduziu', '3sg_past': 'conduziu',
        '1pl_past': 'conduzimos', '2pl_past': 'conduziram', '3pl_past': 'conduziram',
        '1sg_future': 'conduzirei', '2sg_future': 'conduzirá', '3sg_future': 'conduzirá',
        '1pl_future': 'conduziremos', '2pl_future': 'conduzirão', '3pl_future': 'conduzirão',
      },
    },
  },
  {
    // P09's leave in the letting-stay sense: to go without, leave behind. English has three "leave"
    // concepts now (LEAVE, exit; LEAVE_DEPART, depart; this one), so the picker says which.
    // German zurücklassen is separable (lässt … zurück, zurückgelassen).
    id: 'LEAVE_BEHIND',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to go away without taking something; to let it stay',
    // "to cause an object to stay" (localization B61): the dictionary's "to cause to remain", the
    // causative of STAY. Japanese 物体が残るようにする is 残す said out.
    definition: causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'STAY' }),
    emoji: '🧳',
    synonym: 'leave behind',
    forms: {
      en: {
        base: 'leave',
        '1sg_present': 'leave', '2sg_present': 'leave', '3sg_present': 'leaves',
        '1pl_present': 'leave', '2pl_present': 'leave', '3pl_present': 'leave',
        past: 'left',
      },
      it: {
        base: 'lasciare',
        '1sg_present': 'lascio', '2sg_present': 'lasci', '3sg_present': 'lascia',
        '1pl_present': 'lasciamo', '2pl_present': 'lasciate', '3pl_present': 'lasciano',
        '1sg_past': 'lasciai', '2sg_past': 'lasciasti', '3sg_past': 'lasciò',
        '1pl_past': 'lasciammo', '2pl_past': 'lasciaste', '3pl_past': 'lasciarono',
        '1sg_future': 'lascerò', '2sg_future': 'lascerai', '3sg_future': 'lascerà',
        '1pl_future': 'lasceremo', '2pl_future': 'lascerete', '3pl_future': 'lasceranno',
      },
      fr: {
        base: 'laisser',
        '1sg_present': 'laisse', '2sg_present': 'laisses', '3sg_present': 'laisse',
        '1pl_present': 'laissons', '2pl_present': 'laissez', '3pl_present': 'laissent',
        '1sg_past': 'laissai', '2sg_past': 'laissas', '3sg_past': 'laissa',
        '1pl_past': 'laissâmes', '2pl_past': 'laissâtes', '3pl_past': 'laissèrent',
        '1sg_future': 'laisserai', '2sg_future': 'laisseras', '3sg_future': 'laissera',
        '1pl_future': 'laisserons', '2pl_future': 'laisserez', '3pl_future': 'laisseront',
      },
      de: {
        base: 'zurücklassen', particle: 'zurück',
        '1sg_present': 'lasse', '2sg_present': 'lässt', '3sg_present': 'lässt',
        '1pl_present': 'lassen', '2pl_present': 'lasst', '3pl_present': 'lassen',
        '1sg_past': 'ließ', '2sg_past': 'ließest', '3sg_past': 'ließ',
        '1pl_past': 'ließen', '2pl_past': 'ließt', '3pl_past': 'ließen',
      },
      es: {
        base: 'dejar',
        '1sg_present': 'dejo', '2sg_present': 'dejas', '3sg_present': 'deja',
        '1pl_present': 'dejamos', '2pl_present': 'dejáis', '3pl_present': 'dejan',
        '1sg_past': 'dejé', '2sg_past': 'dejaste', '3sg_past': 'dejó',
        '1pl_past': 'dejamos', '2pl_past': 'dejasteis', '3pl_past': 'dejaron',
        '1sg_future': 'dejaré', '2sg_future': 'dejarás', '3sg_future': 'dejará',
        '1pl_future': 'dejaremos', '2pl_future': 'dejaréis', '3pl_future': 'dejarán',
      },
      ja: {
        // The place a thing is left in is where it then is: に, not the で of where an act happens
        // (家に本を置いていきます), as 置く takes it.
        base: '置いていく',
        reading: 'おいていく',
        masu_present: '置いていきます',
        masu_present_reading: 'おいていきます',
        locative_particle: 'に',
      },
      pt: {
        base: 'deixar',
        '1sg_present': 'deixo', '2sg_present': 'deixa', '3sg_present': 'deixa',
        '1pl_present': 'deixamos', '2pl_present': 'deixam', '3pl_present': 'deixam',
        '1sg_past': 'deixei', '2sg_past': 'deixou', '3sg_past': 'deixou',
        '1pl_past': 'deixamos', '2pl_past': 'deixaram', '3pl_past': 'deixaram',
        '1sg_future': 'deixarei', '2sg_future': 'deixará', '3sg_future': 'deixará',
        '1pl_future': 'deixaremos', '2pl_future': 'deixarão', '3pl_future': 'deixarão',
      },
    },
  },
  {
    // P09's look (at): turn the eyes on. The looked-at thing is the object, with the preposition
    // English and Portuguese fix (`object_prep`, as DEPEND's "on"): "looks at the book", "olha para o
    // livro". German ansehen is separable and strong (sieht … an, sah … an, angesehen; du command
    // sieh). Japanese 見る is SEE's word too: the picker shows two 見る, told apart by their tooltips
    // (SEE's 光を知覚する, this one's 物体へ目を向ける); 眺める and 見つめる are narrower.
    id: 'LOOK_AT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to turn one\'s eyes toward something',
    // "to direct the eyes to an object" (localization B61), on DIRECT_VERB: every verb the corpus had
    // for pointing the eyes failed somewhere (TURN_OBJECT's 目を回す is getting dizzy, MOVE's is
    // shifting them, PERCEIVE's is SEE's meaning).
    definition: infinitiveGloss('DIRECT_VERB', {
      object: 'EYE',
      definiteness: 'definite',
      number: 'plural',
      complements: { direction: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' } } },
    }),
    emoji: '👁️',
    forms: {
      en: {
        base: 'look', object_prep: 'at',
        '1sg_present': 'look', '2sg_present': 'look', '3sg_present': 'looks',
        '1pl_present': 'look', '2pl_present': 'look', '3pl_present': 'look',
        past: 'looked',
      },
      it: {
        base: 'guardare',
        '1sg_present': 'guardo', '2sg_present': 'guardi', '3sg_present': 'guarda',
        '1pl_present': 'guardiamo', '2pl_present': 'guardate', '3pl_present': 'guardano',
        '1sg_past': 'guardai', '2sg_past': 'guardasti', '3sg_past': 'guardò',
        '1pl_past': 'guardammo', '2pl_past': 'guardaste', '3pl_past': 'guardarono',
        '1sg_future': 'guarderò', '2sg_future': 'guarderai', '3sg_future': 'guarderà',
        '1pl_future': 'guarderemo', '2pl_future': 'guarderete', '3pl_future': 'guarderanno',
      },
      fr: {
        base: 'regarder',
        '1sg_present': 'regarde', '2sg_present': 'regardes', '3sg_present': 'regarde',
        '1pl_present': 'regardons', '2pl_present': 'regardez', '3pl_present': 'regardent',
        '1sg_past': 'regardai', '2sg_past': 'regardas', '3sg_past': 'regarda',
        '1pl_past': 'regardâmes', '2pl_past': 'regardâtes', '3pl_past': 'regardèrent',
        '1sg_future': 'regarderai', '2sg_future': 'regarderas', '3sg_future': 'regardera',
        '1pl_future': 'regarderons', '2pl_future': 'regarderez', '3pl_future': 'regarderont',
      },
      de: {
        base: 'ansehen', particle: 'an',
        '1sg_present': 'sehe', '2sg_present': 'siehst', '3sg_present': 'sieht',
        '1pl_present': 'sehen', '2pl_present': 'seht', '3pl_present': 'sehen',
        '1sg_past': 'sah', '2sg_past': 'sahst', '3sg_past': 'sah',
        '1pl_past': 'sahen', '2pl_past': 'saht', '3pl_past': 'sahen',
        '2sg_imperative': 'sieh', // strong e→ie: the du command keeps the vowel change
      },
      es: {
        base: 'mirar',
        '1sg_present': 'miro', '2sg_present': 'miras', '3sg_present': 'mira',
        '1pl_present': 'miramos', '2pl_present': 'miráis', '3pl_present': 'miran',
        '1sg_past': 'miré', '2sg_past': 'miraste', '3sg_past': 'miró',
        '1pl_past': 'miramos', '2pl_past': 'mirasteis', '3pl_past': 'miraron',
        '1sg_future': 'miraré', '2sg_future': 'mirarás', '3sg_future': 'mirará',
        '1pl_future': 'miraremos', '2pl_future': 'miraréis', '3pl_future': 'mirarán',
      },
      ja: {
        base: '見る',
        reading: 'みる',
        masu_present: '見ます',
        masu_present_reading: 'みます',
      },
      pt: {
        base: 'olhar', object_prep: 'para',
        '1sg_present': 'olho', '2sg_present': 'olha', '3sg_present': 'olha',
        '1pl_present': 'olhamos', '2pl_present': 'olham', '3pl_present': 'olham',
        '1sg_past': 'olhei', '2sg_past': 'olhou', '3sg_past': 'olhou',
        '1pl_past': 'olhamos', '2pl_past': 'olharam', '3pl_past': 'olharam',
        '1sg_future': 'olharei', '2sg_future': 'olhará', '3sg_future': 'olhará',
        '1pl_future': 'olharemos', '2pl_future': 'olharão', '3pl_future': 'olharão',
      },
    },
  },
  {
    // To point a thing toward something: LOOK_AT's differentia, "to direct the eyes to an object".
    // Suffixed because DIRECT is the grammar's adjective, as CAUSE_VERB is beside CAUSE. French
    // diriger fixes its goal's preposition, "vers" (`direction_prep`, as MOVE_ONESELF's): without it
    // the goal reads "à un objet". Italian rivolgere takes "a" on its own (rivolgere gli occhi a).
    // Its own tooltip stays on the literal, a root LOOK_AT's gloss stands on (localization B61):
    // "to change an object's direction" is the transitive TURN's, and INDICATE, MOVE and TURN each
    // say another act (bezeichnen, verschieben, girare a un luogo).
    id: 'DIRECT_VERB',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'direction', 'cause', 'locative'],
    description: 'to point or turn something toward something',
    emoji: '🎯',
    forms: {
      en: {
        base: 'direct',
        '1sg_present': 'direct', '2sg_present': 'direct', '3sg_present': 'directs',
        '1pl_present': 'direct', '2pl_present': 'direct', '3pl_present': 'direct',
        past: 'directed',
      },
      it: {
        base: 'rivolgere',
        '1sg_present': 'rivolgo', '2sg_present': 'rivolgi', '3sg_present': 'rivolge',
        '1pl_present': 'rivolgiamo', '2pl_present': 'rivolgete', '3pl_present': 'rivolgono',
        '1sg_past': 'rivolsi', '2sg_past': 'rivolgesti', '3sg_past': 'rivolse',
        '1pl_past': 'rivolgemmo', '2pl_past': 'rivolgeste', '3pl_past': 'rivolsero',
        '1sg_future': 'rivolgerò', '2sg_future': 'rivolgerai', '3sg_future': 'rivolgerà',
        '1pl_future': 'rivolgeremo', '2pl_future': 'rivolgerete', '3pl_future': 'rivolgeranno',
      },
      fr: {
        // -ger keeps its soft g with an e before a/o: nous dirigeons, il dirigea.
        base: 'diriger', direction_prep: 'vers',
        '1sg_present': 'dirige', '2sg_present': 'diriges', '3sg_present': 'dirige',
        '1pl_present': 'dirigeons', '2pl_present': 'dirigez', '3pl_present': 'dirigent',
        '1sg_past': 'dirigeai', '2sg_past': 'dirigeas', '3sg_past': 'dirigea',
        '1pl_past': 'dirigeâmes', '2pl_past': 'dirigeâtes', '3pl_past': 'dirigèrent',
        '1sg_future': 'dirigerai', '2sg_future': 'dirigeras', '3sg_future': 'dirigera',
        '1pl_future': 'dirigerons', '2pl_future': 'dirigerez', '3pl_future': 'dirigeront',
      },
      de: {
        base: 'richten',
        '1sg_present': 'richte', '2sg_present': 'richtest', '3sg_present': 'richtet',
        '1pl_present': 'richten', '2pl_present': 'richtet', '3pl_present': 'richten',
        '1sg_past': 'richtete', '2sg_past': 'richtetest', '3sg_past': 'richtete',
        '1pl_past': 'richteten', '2pl_past': 'richtetet', '3pl_past': 'richteten',
      },
      es: {
        // dirigir respells g → j before a/o: dirijo.
        base: 'dirigir',
        '1sg_present': 'dirijo', '2sg_present': 'diriges', '3sg_present': 'dirige',
        '1pl_present': 'dirigimos', '2pl_present': 'dirigís', '3pl_present': 'dirigen',
        '1sg_past': 'dirigí', '2sg_past': 'dirigiste', '3sg_past': 'dirigió',
        '1pl_past': 'dirigimos', '2pl_past': 'dirigisteis', '3pl_past': 'dirigieron',
        '1sg_future': 'dirigiré', '2sg_future': 'dirigirás', '3sg_future': 'dirigirá',
        '1pl_future': 'dirigiremos', '2pl_future': 'dirigiréis', '3pl_future': 'dirigirán',
      },
      ja: {
        base: '向ける',
        reading: 'むける',
        masu_present: '向けます',
        masu_present_reading: 'むけます',
      },
      pt: {
        base: 'dirigir',
        '1sg_present': 'dirijo', '2sg_present': 'dirige', '3sg_present': 'dirige',
        '1pl_present': 'dirigimos', '2pl_present': 'dirigem', '3pl_present': 'dirigem',
        '1sg_past': 'dirigi', '2sg_past': 'dirigiu', '3sg_past': 'dirigiu',
        '1pl_past': 'dirigimos', '2pl_past': 'dirigiram', '3pl_past': 'dirigiram',
        '1sg_future': 'dirigirei', '2sg_future': 'dirigirá', '3sg_future': 'dirigirá',
        '1pl_future': 'dirigiremos', '2pl_future': 'dirigirão', '3pl_future': 'dirigirão',
      },
    },
  },

  {
    // The genus of CUT ("to divide with a sharp blade") — the separation verb its dictionary
    // definition cites as its genus (see the B13 verb-definition task). Italian dividere has a
    // strong remote past (divise) and participle (diviso); German takes the plain teilen, not the
    // separable aufteilen; Japanese takes the ichidan 分ける.
    id: 'DIVIDE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to separate into parts',
    emoji: '➗',
    forms: {
      en: {
        base: 'divide',
        '1sg_present': 'divide', '2sg_present': 'divide', '3sg_present': 'divides',
        '1pl_present': 'divide', '2pl_present': 'divide', '3pl_present': 'divide',
        past: 'divided',
      },
      it: {
        base: 'dividere',
        '1sg_present': 'divido', '2sg_present': 'dividi', '3sg_present': 'divide',
        '1pl_present': 'dividiamo', '2pl_present': 'dividete', '3pl_present': 'dividono',
        '1sg_past': 'divisi', '2sg_past': 'dividesti', '3sg_past': 'divise',
        '1pl_past': 'dividemmo', '2pl_past': 'divideste', '3pl_past': 'divisero',
        '1sg_future': 'dividerò', '2sg_future': 'dividerai', '3sg_future': 'dividerà',
        '1pl_future': 'divideremo', '2pl_future': 'dividerete', '3pl_future': 'divideranno',
      },
      fr: {
        base: 'diviser',
        '1sg_present': 'divise', '2sg_present': 'divises', '3sg_present': 'divise',
        '1pl_present': 'divisons', '2pl_present': 'divisez', '3pl_present': 'divisent',
        '1sg_past': 'divisai', '2sg_past': 'divisas', '3sg_past': 'divisa',
        '1pl_past': 'divisâmes', '2pl_past': 'divisâtes', '3pl_past': 'divisèrent',
        '1sg_future': 'diviserai', '2sg_future': 'diviseras', '3sg_future': 'divisera',
        '1pl_future': 'diviserons', '2pl_future': 'diviserez', '3pl_future': 'diviseront',
      },
      de: {
        base: 'teilen',
        '1sg_present': 'teile', '2sg_present': 'teilst', '3sg_present': 'teilt',
        '1pl_present': 'teilen', '2pl_present': 'teilt', '3pl_present': 'teilen',
        '1sg_past': 'teilte', '2sg_past': 'teiltest', '3sg_past': 'teilte',
        '1pl_past': 'teilten', '2pl_past': 'teiltet', '3pl_past': 'teilten',
      },
      es: {
        base: 'dividir',
        '1sg_present': 'divido', '2sg_present': 'divides', '3sg_present': 'divide',
        '1pl_present': 'dividimos', '2pl_present': 'dividís', '3pl_present': 'dividen',
        '1sg_past': 'dividí', '2sg_past': 'dividiste', '3sg_past': 'dividió',
        '1pl_past': 'dividimos', '2pl_past': 'dividisteis', '3pl_past': 'dividieron',
        '1sg_future': 'dividiré', '2sg_future': 'dividirás', '3sg_future': 'dividirá',
        '1pl_future': 'dividiremos', '2pl_future': 'dividiréis', '3pl_future': 'dividirán',
      },
      ja: {
        base: '分ける',
        reading: 'わける',
        masu_present: '分けます',
        masu_present_reading: 'わけます',
      },
      pt: {
        base: 'dividir',
        '1sg_present': 'divido', '2sg_present': 'divide', '3sg_present': 'divide',
        '1pl_present': 'dividimos', '2pl_present': 'dividem', '3pl_present': 'dividem',
        '1sg_past': 'dividi', '2sg_past': 'dividiu', '3sg_past': 'dividiu',
        '1pl_past': 'dividimos', '2pl_past': 'dividiram', '3pl_past': 'dividiram',
        '1sg_future': 'dividirei', '2sg_future': 'dividirá', '3sg_future': 'dividirá',
        '1pl_future': 'dividiremos', '2pl_future': 'dividirão', '3pl_future': 'dividirão',
      },
    },
  },

  {
    // The genus of BEAT ("to strike repeatedly") — the contact verb its dictionary definition cites
    // as its genus (see the B13 verb-definition task; BITE, "to cut with the teeth", glosses on CUT). English is irregular (struck), Italian colpire takes the -isc- infix, and German
    // schlagen is strong (schlägt / schlug / geschlagen). The Romance picks avoid BEAT's own
    // battere / battre / batir.
    id: 'STRIKE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to hit with force',
    emoji: '👊',
    synonym: 'hit',
    forms: {
      en: {
        base: 'strike',
        '1sg_present': 'strike', '2sg_present': 'strike', '3sg_present': 'strikes',
        '1pl_present': 'strike', '2pl_present': 'strike', '3pl_present': 'strike',
        past: 'struck',
      },
      it: {
        base: 'colpire',
        '1sg_present': 'colpisco', '2sg_present': 'colpisci', '3sg_present': 'colpisce',
        '1pl_present': 'colpiamo', '2pl_present': 'colpite', '3pl_present': 'colpiscono',
        '1sg_past': 'colpii', '2sg_past': 'colpisti', '3sg_past': 'colpì',
        '1pl_past': 'colpimmo', '2pl_past': 'colpiste', '3pl_past': 'colpirono',
        '1sg_future': 'colpirò', '2sg_future': 'colpirai', '3sg_future': 'colpirà',
        '1pl_future': 'colpiremo', '2pl_future': 'colpirete', '3pl_future': 'colpiranno',
      },
      fr: {
        base: 'frapper',
        '1sg_present': 'frappe', '2sg_present': 'frappes', '3sg_present': 'frappe',
        '1pl_present': 'frappons', '2pl_present': 'frappez', '3pl_present': 'frappent',
        '1sg_past': 'frappai', '2sg_past': 'frappas', '3sg_past': 'frappa',
        '1pl_past': 'frappâmes', '2pl_past': 'frappâtes', '3pl_past': 'frappèrent',
        '1sg_future': 'frapperai', '2sg_future': 'frapperas', '3sg_future': 'frappera',
        '1pl_future': 'frapperons', '2pl_future': 'frapperez', '3pl_future': 'frapperont',
      },
      de: {
        base: 'schlagen',
        '1sg_present': 'schlage', '2sg_present': 'schlägst', '3sg_present': 'schlägt',
        '1pl_present': 'schlagen', '2pl_present': 'schlagt', '3pl_present': 'schlagen',
        '1sg_past': 'schlug', '2sg_past': 'schlugst', '3sg_past': 'schlug',
        '1pl_past': 'schlugen', '2pl_past': 'schlugt', '3pl_past': 'schlugen',
      },
      es: {
        base: 'golpear',
        '1sg_present': 'golpeo', '2sg_present': 'golpeas', '3sg_present': 'golpea',
        '1pl_present': 'golpeamos', '2pl_present': 'golpeáis', '3pl_present': 'golpean',
        '1sg_past': 'golpeé', '2sg_past': 'golpeaste', '3sg_past': 'golpeó',
        '1pl_past': 'golpeamos', '2pl_past': 'golpeasteis', '3pl_past': 'golpearon',
        '1sg_future': 'golpearé', '2sg_future': 'golpearás', '3sg_future': 'golpeará',
        '1pl_future': 'golpearemos', '2pl_future': 'golpearéis', '3pl_future': 'golpearán',
      },
      ja: {
        base: '打つ',
        reading: 'うつ',
        masu_present: '打ちます',
        masu_present_reading: 'うちます',
      },
      pt: {
        base: 'golpear',
        '1sg_present': 'golpeio', '2sg_present': 'golpeia', '3sg_present': 'golpeia',
        '1pl_present': 'golpeamos', '2pl_present': 'golpeiam', '3pl_present': 'golpeiam',
        '1sg_past': 'golpeei', '2sg_past': 'golpeou', '3sg_past': 'golpeou',
        '1pl_past': 'golpeamos', '2pl_past': 'golpearam', '3pl_past': 'golpearam',
        '1sg_future': 'golpearei', '2sg_future': 'golpeará', '3sg_future': 'golpeará',
        '1pl_future': 'golpearemos', '2pl_future': 'golpearão', '3pl_future': 'golpearão',
      },
    },
  },

  {
    // The genus of NAME, DESCRIBE and EXPRESS (B16) and of CHOOSE (B18) — the verb of pointing
    // something out that their dictionary definitions cite as their genus. German takes
    // the inseparable bezeichnen: the natural anzeigen / hinweisen are separable, which the engine
    // does not split. Italian indicare and French indiquer respell before e (indichi / indiquons).
    id: 'INDICATE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'terminus', 'cause', 'locative'],
    description: 'to point out; to signify',
    emoji: '👆',
    forms: {
      en: {
        base: 'indicate',
        '1sg_present': 'indicate', '2sg_present': 'indicate', '3sg_present': 'indicates',
        '1pl_present': 'indicate', '2pl_present': 'indicate', '3pl_present': 'indicate',
        past: 'indicated',
      },
      it: {
        base: 'indicare',
        '1sg_present': 'indico', '2sg_present': 'indichi', '3sg_present': 'indica',
        '1pl_present': 'indichiamo', '2pl_present': 'indicate', '3pl_present': 'indicano',
        '1sg_past': 'indicai', '2sg_past': 'indicasti', '3sg_past': 'indicò',
        '1pl_past': 'indicammo', '2pl_past': 'indicaste', '3pl_past': 'indicarono',
        '1sg_future': 'indicherò', '2sg_future': 'indicherai', '3sg_future': 'indicherà',
        '1pl_future': 'indicheremo', '2pl_future': 'indicherete', '3pl_future': 'indicheranno',
      },
      fr: {
        base: 'indiquer',
        '1sg_present': 'indique', '2sg_present': 'indiques', '3sg_present': 'indique',
        '1pl_present': 'indiquons', '2pl_present': 'indiquez', '3pl_present': 'indiquent',
        '1sg_past': 'indiquai', '2sg_past': 'indiquas', '3sg_past': 'indiqua',
        '1pl_past': 'indiquâmes', '2pl_past': 'indiquâtes', '3pl_past': 'indiquèrent',
        '1sg_future': 'indiquerai', '2sg_future': 'indiqueras', '3sg_future': 'indiquera',
        '1pl_future': 'indiquerons', '2pl_future': 'indiquerez', '3pl_future': 'indiqueront',
      },
      de: {
        base: 'bezeichnen',
        '1sg_present': 'bezeichne', '2sg_present': 'bezeichnest', '3sg_present': 'bezeichnet',
        '1pl_present': 'bezeichnen', '2pl_present': 'bezeichnet', '3pl_present': 'bezeichnen',
        '1sg_past': 'bezeichnete', '2sg_past': 'bezeichnetest', '3sg_past': 'bezeichnete',
        '1pl_past': 'bezeichneten', '2pl_past': 'bezeichnetet', '3pl_past': 'bezeichneten',
      },
      es: {
        base: 'indicar',
        '1sg_present': 'indico', '2sg_present': 'indicas', '3sg_present': 'indica',
        '1pl_present': 'indicamos', '2pl_present': 'indicáis', '3pl_present': 'indican',
        '1sg_past': 'indiqué', '2sg_past': 'indicaste', '3sg_past': 'indicó',
        '1pl_past': 'indicamos', '2pl_past': 'indicasteis', '3pl_past': 'indicaron',
        '1sg_future': 'indicaré', '2sg_future': 'indicarás', '3sg_future': 'indicará',
        '1pl_future': 'indicaremos', '2pl_future': 'indicaréis', '3pl_future': 'indicarán',
      },
      ja: {
        base: '示す',
        reading: 'しめす',
        masu_present: '示します',
        masu_present_reading: 'しめします',
      },
      pt: {
        base: 'indicar',
        '1sg_present': 'indico', '2sg_present': 'indica', '3sg_present': 'indica',
        '1pl_present': 'indicamos', '2pl_present': 'indicam', '3pl_present': 'indicam',
        '1sg_past': 'indiquei', '2sg_past': 'indicou', '3sg_past': 'indicou',
        '1pl_past': 'indicamos', '2pl_past': 'indicaram', '3pl_past': 'indicaram',
        '1sg_future': 'indicarei', '2sg_future': 'indicará', '3sg_future': 'indicará',
        '1pl_future': 'indicaremos', '2pl_future': 'indicarão', '3pl_future': 'indicarão',
      },
    },
  },

  {
    // The genus of MODIFY ("to change qualities") — the verb of making different that its dictionary
    // definition cites as its genus (see the B16 verb-definition task). French changer keeps its
    // e before a and o (changeons / changea); German ändern is an -ern verb (ändere / änderte);
    // Portuguese takes mudar, the everyday verb, over the narrower trocar ("swap"); Japanese takes
    // the transitive ichidan 変える.
    id: 'CHANGE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to make different',
    emoji: '🔃',
    forms: {
      en: {
        base: 'change',
        '1sg_present': 'change', '2sg_present': 'change', '3sg_present': 'changes',
        '1pl_present': 'change', '2pl_present': 'change', '3pl_present': 'change',
        past: 'changed',
      },
      it: {
        base: 'cambiare',
        '1sg_present': 'cambio', '2sg_present': 'cambi', '3sg_present': 'cambia',
        '1pl_present': 'cambiamo', '2pl_present': 'cambiate', '3pl_present': 'cambiano',
        '1sg_past': 'cambiai', '2sg_past': 'cambiasti', '3sg_past': 'cambiò',
        '1pl_past': 'cambiammo', '2pl_past': 'cambiaste', '3pl_past': 'cambiarono',
        '1sg_future': 'cambierò', '2sg_future': 'cambierai', '3sg_future': 'cambierà',
        '1pl_future': 'cambieremo', '2pl_future': 'cambierete', '3pl_future': 'cambieranno',
      },
      fr: {
        base: 'changer',
        '1sg_present': 'change', '2sg_present': 'changes', '3sg_present': 'change',
        '1pl_present': 'changeons', '2pl_present': 'changez', '3pl_present': 'changent',
        '1sg_past': 'changeai', '2sg_past': 'changeas', '3sg_past': 'changea',
        '1pl_past': 'changeâmes', '2pl_past': 'changeâtes', '3pl_past': 'changèrent',
        '1sg_future': 'changerai', '2sg_future': 'changeras', '3sg_future': 'changera',
        '1pl_future': 'changerons', '2pl_future': 'changerez', '3pl_future': 'changeront',
      },
      de: {
        base: 'ändern',
        '1sg_present': 'ändere', '2sg_present': 'änderst', '3sg_present': 'ändert',
        '1pl_present': 'ändern', '2pl_present': 'ändert', '3pl_present': 'ändern',
        '1sg_past': 'änderte', '2sg_past': 'ändertest', '3sg_past': 'änderte',
        '1pl_past': 'änderten', '2pl_past': 'ändertet', '3pl_past': 'änderten',
      },
      es: {
        base: 'cambiar',
        '1sg_present': 'cambio', '2sg_present': 'cambias', '3sg_present': 'cambia',
        '1pl_present': 'cambiamos', '2pl_present': 'cambiáis', '3pl_present': 'cambian',
        '1sg_past': 'cambié', '2sg_past': 'cambiaste', '3sg_past': 'cambió',
        '1pl_past': 'cambiamos', '2pl_past': 'cambiasteis', '3pl_past': 'cambiaron',
        '1sg_future': 'cambiaré', '2sg_future': 'cambiarás', '3sg_future': 'cambiará',
        '1pl_future': 'cambiaremos', '2pl_future': 'cambiaréis', '3pl_future': 'cambiarán',
      },
      ja: {
        base: '変える',
        reading: 'かえる',
        masu_present: '変えます',
        masu_present_reading: 'かえます',
      },
      pt: {
        base: 'mudar',
        '1sg_present': 'mudo', '2sg_present': 'muda', '3sg_present': 'muda',
        '1pl_present': 'mudamos', '2pl_present': 'mudam', '3pl_present': 'mudam',
        '1sg_past': 'mudei', '2sg_past': 'mudou', '3sg_past': 'mudou',
        '1pl_past': 'mudamos', '2pl_past': 'mudaram', '3pl_past': 'mudaram',
        '1sg_future': 'mudarei', '2sg_future': 'mudará', '3sg_future': 'mudará',
        '1pl_future': 'mudaremos', '2pl_future': 'mudarão', '3pl_future': 'mudarão',
      },
    },
  },

  {
    // E24's *stop* in its transitive half (rank 257, D2): to bring to a halt, as CHANGE is to
    // CHANGE_ONESELF. STOP_DOING is the aspectual one (P09-E42). German anhalten is separable and strong
    // (hält … an, hielt … an, angehalten); Spanish detener conjugates as tener (detengo, detuvo, tú
    // command detén); Japanese 止める is the transitive of STOP_ONESELF's 止まる. Portuguese parar is
    // both halves.
    id: 'STOP',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to bring to a halt',
    synonym: 'halt',
    // "to cause an object no longer to move" (localization B84): C08's causative on MOVE_ONESELF under
    // NO_LONGER, which B84's fix lets Spanish and Portuguese say once.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'MOVE_ONESELF', modifier: 'NO_LONGER' },
    ),
    emoji: '✋',
    forms: {
      en: {
        base: 'stop',
        '1sg_present': 'stop', '2sg_present': 'stop', '3sg_present': 'stops',
        '1pl_present': 'stop', '2pl_present': 'stop', '3pl_present': 'stop',
        past: 'stopped',
      },
      it: {
        base: 'fermare',
        '1sg_present': 'fermo', '2sg_present': 'fermi', '3sg_present': 'ferma',
        '1pl_present': 'fermiamo', '2pl_present': 'fermate', '3pl_present': 'fermano',
        '1sg_past': 'fermai', '2sg_past': 'fermasti', '3sg_past': 'fermò',
        '1pl_past': 'fermammo', '2pl_past': 'fermaste', '3pl_past': 'fermarono',
        '1sg_future': 'fermerò', '2sg_future': 'fermerai', '3sg_future': 'fermerà',
        '1pl_future': 'fermeremo', '2pl_future': 'fermerete', '3pl_future': 'fermeranno',
      },
      fr: {
        base: 'arrêter',
        '1sg_present': 'arrête', '2sg_present': 'arrêtes', '3sg_present': 'arrête',
        '1pl_present': 'arrêtons', '2pl_present': 'arrêtez', '3pl_present': 'arrêtent',
        '1sg_past': 'arrêtai', '2sg_past': 'arrêtas', '3sg_past': 'arrêta',
        '1pl_past': 'arrêtâmes', '2pl_past': 'arrêtâtes', '3pl_past': 'arrêtèrent',
        '1sg_future': 'arrêterai', '2sg_future': 'arrêteras', '3sg_future': 'arrêtera',
        '1pl_future': 'arrêterons', '2pl_future': 'arrêterez', '3pl_future': 'arrêteront',
      },
      de: {
        base: 'anhalten', particle: 'an',
        '1sg_present': 'halte', '2sg_present': 'hältst', '3sg_present': 'hält',
        '1pl_present': 'halten', '2pl_present': 'haltet', '3pl_present': 'halten',
        '1sg_past': 'hielt', '2sg_past': 'hieltst', '3sg_past': 'hielt',
        '1pl_past': 'hielten', '2pl_past': 'hieltet', '3pl_past': 'hielten',
        '2sg_imperative': 'halte', // a stem in -t keeps the du -e
      },
      es: {
        base: 'detener',
        '1sg_present': 'detengo', '2sg_present': 'detienes', '3sg_present': 'detiene',
        '1pl_present': 'detenemos', '2pl_present': 'detenéis', '3pl_present': 'detienen',
        '1sg_past': 'detuve', '2sg_past': 'detuviste', '3sg_past': 'detuvo',
        '1pl_past': 'detuvimos', '2pl_past': 'detuvisteis', '3pl_past': 'detuvieron',
        '1sg_future': 'detendré', '2sg_future': 'detendrás', '3sg_future': 'detendrá',
        '1pl_future': 'detendremos', '2pl_future': 'detendréis', '3pl_future': 'detendrán',
      },
      ja: {
        base: '止める',
        reading: 'とめる',
        masu_present: '止めます',
        masu_present_reading: 'とめます',
      },
      pt: {
        base: 'parar',
        '1sg_present': 'paro', '2sg_present': 'para', '3sg_present': 'para',
        '1pl_present': 'paramos', '2pl_present': 'param', '3pl_present': 'param',
        '1sg_past': 'parei', '2sg_past': 'parou', '3sg_past': 'parou',
        '1pl_past': 'paramos', '2pl_past': 'pararam', '3pl_past': 'pararam',
        '1sg_future': 'pararei', '2sg_future': 'parará', '3sg_future': 'parará',
        '1pl_future': 'pararemos', '2pl_future': 'pararão', '3pl_future': 'pararão',
      },
    },
  },

  {
    // The factitive: changing a thing INTO another thing, and the first verb to license an
    // `objectPredicative` (localization C12). What the object becomes is linked by a word that
    // belongs to the verb, not to the construction, so each lexeme names it as
    // `object_predicative_link` — "into" / in / en / em / in (+ accusative) — exactly as a
    // governing word names its `infinitive_link`. Japanese needs none: its factitive is the same に
    // the subject complement takes (「文を命令に変える」), which the engine's particle already gives.
    //
    // The whole family is transparent — transform / trasformare / transformer / transformar — except
    // German, which takes verwandeln: "transformieren" is the technical loan (a matrix, a signal),
    // where verwandeln is what a thing is turned into something else by.
    id: 'TRANSFORM',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['objectPredicative', 'manner', 'instrumental', 'cause', 'locative'],
    description: 'to change a thing into another thing',
    // "to cause an object to become another object" (localization C28). Its genus CHANGE has no
    // gloss to be told apart from, and "to change objects" would be CHANGE's own meaning; the
    // causative says what sets it apart, the other thing it ends up as. Japanese 物体が別の物体になる
    // ようにする keeps clear of 変える, which is this verb's word there as well as CHANGE's.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      {
        verb: 'BECOME',
        complements: {
          predicative: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['OTHER'] } },
        },
      },
    ),
    emoji: '🦋',
    isA: 'CHANGE',
    forms: {
      en: {
        base: 'transform', object_predicative_link: 'into',
        '1sg_present': 'transform', '2sg_present': 'transform', '3sg_present': 'transforms',
        '1pl_present': 'transform', '2pl_present': 'transform', '3pl_present': 'transform',
        past: 'transformed',
      },
      it: {
        base: 'trasformare', object_predicative_link: 'in',
        '1sg_present': 'trasformo', '2sg_present': 'trasformi', '3sg_present': 'trasforma',
        '1pl_present': 'trasformiamo', '2pl_present': 'trasformate', '3pl_present': 'trasformano',
        '1sg_past': 'trasformai', '2sg_past': 'trasformasti', '3sg_past': 'trasformò',
        '1pl_past': 'trasformammo', '2pl_past': 'trasformaste', '3pl_past': 'trasformarono',
        '1sg_future': 'trasformerò', '2sg_future': 'trasformerai', '3sg_future': 'trasformerà',
        '1pl_future': 'trasformeremo', '2pl_future': 'trasformerete', '3pl_future': 'trasformeranno',
      },
      fr: {
        base: 'transformer', object_predicative_link: 'en',
        '1sg_present': 'transforme', '2sg_present': 'transformes', '3sg_present': 'transforme',
        '1pl_present': 'transformons', '2pl_present': 'transformez', '3pl_present': 'transforment',
        '1sg_past': 'transformai', '2sg_past': 'transformas', '3sg_past': 'transforma',
        '1pl_past': 'transformâmes', '2pl_past': 'transformâtes', '3pl_past': 'transformèrent',
        '1sg_future': 'transformerai', '2sg_future': 'transformeras', '3sg_future': 'transformera',
        '1pl_future': 'transformerons', '2pl_future': 'transformerez', '3pl_future': 'transformeront',
      },
      de: {
        base: 'verwandeln', object_predicative_link: 'in',
        '1sg_present': 'verwandle', '2sg_present': 'verwandelst', '3sg_present': 'verwandelt',
        '1pl_present': 'verwandeln', '2pl_present': 'verwandelt', '3pl_present': 'verwandeln',
        '1sg_past': 'verwandelte', '2sg_past': 'verwandeltest', '3sg_past': 'verwandelte',
        '1pl_past': 'verwandelten', '2pl_past': 'verwandeltet', '3pl_past': 'verwandelten',
      },
      es: {
        base: 'transformar', object_predicative_link: 'en',
        '1sg_present': 'transformo', '2sg_present': 'transformas', '3sg_present': 'transforma',
        '1pl_present': 'transformamos', '2pl_present': 'transformáis', '3pl_present': 'transforman',
        '1sg_past': 'transformé', '2sg_past': 'transformaste', '3sg_past': 'transformó',
        '1pl_past': 'transformamos', '2pl_past': 'transformasteis', '3pl_past': 'transformaron',
        '1sg_future': 'transformaré', '2sg_future': 'transformarás', '3sg_future': 'transformará',
        '1pl_future': 'transformaremos', '2pl_future': 'transformaréis', '3pl_future': 'transformarán',
      },
      ja: {
        base: '変える',
        reading: 'かえる',
        masu_present: '変えます',
        masu_present_reading: 'かえます',
      },
      pt: {
        base: 'transformar', object_predicative_link: 'em',
        '1sg_present': 'transformo', '2sg_present': 'transforma', '3sg_present': 'transforma',
        '1pl_present': 'transformamos', '2pl_present': 'transformam', '3pl_present': 'transformam',
        '1sg_past': 'transformei', '2sg_past': 'transformou', '3sg_past': 'transformou',
        '1pl_past': 'transformamos', '2pl_past': 'transformaram', '3pl_past': 'transformaram',
        '1sg_future': 'transformarei', '2sg_future': 'transformará', '3sg_future': 'transformará',
        '1pl_future': 'transformaremos', '2pl_future': 'transformarão', '3pl_future': 'transformarão',
      },
    },
  },

  {
    // The genus of LOVE ("to feel affection") — the verb of experiencing an emotion that its
    // dictionary definition cites as its genus (see the B17 verb-definition task). German takes
    // fühlen: empfinden is already PERCEIVE's. Italian and French take provare / éprouver, the
    // verbs an emotion is felt with (sentire / sentir lean to the senses, and PERCEIVE's percevoir
    // is taken); Spanish and Portuguese sentir diphthong or raise their stem (siente / sintió,
    // sinto). English is irregular (felt).
    id: 'FEEL',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to experience an emotion or sensation',
    // B30, once FEELING was seeded. Plural, because a count noun reads bare only in the plural.
    // Morphologically transparent in de (fühlen / Gefühle) and es/pt (sentir / sentimiento), as
    // BIG's "di grande dimensione" already is in Italian — the gloss still says what FEEL adds to
    // its genus. English "to have feelings" wants "for someone" to read as the idiom; bare, it is
    // the definition.
    definition: infinitiveGloss('HAVE', 'FEELING', 'plural'),
    emoji: '💓',
    forms: {
      en: {
        base: 'feel',
        '1sg_present': 'feel', '2sg_present': 'feel', '3sg_present': 'feels',
        '1pl_present': 'feel', '2pl_present': 'feel', '3pl_present': 'feel',
        past: 'felt',
      },
      it: {
        base: 'provare',
        '1sg_present': 'provo', '2sg_present': 'provi', '3sg_present': 'prova',
        '1pl_present': 'proviamo', '2pl_present': 'provate', '3pl_present': 'provano',
        '1sg_past': 'provai', '2sg_past': 'provasti', '3sg_past': 'provò',
        '1pl_past': 'provammo', '2pl_past': 'provaste', '3pl_past': 'provarono',
        '1sg_future': 'proverò', '2sg_future': 'proverai', '3sg_future': 'proverà',
        '1pl_future': 'proveremo', '2pl_future': 'proverete', '3pl_future': 'proveranno',
      },
      fr: {
        base: 'éprouver',
        '1sg_present': 'éprouve', '2sg_present': 'éprouves', '3sg_present': 'éprouve',
        '1pl_present': 'éprouvons', '2pl_present': 'éprouvez', '3pl_present': 'éprouvent',
        '1sg_past': 'éprouvai', '2sg_past': 'éprouvas', '3sg_past': 'éprouva',
        '1pl_past': 'éprouvâmes', '2pl_past': 'éprouvâtes', '3pl_past': 'éprouvèrent',
        '1sg_future': 'éprouverai', '2sg_future': 'éprouveras', '3sg_future': 'éprouvera',
        '1pl_future': 'éprouverons', '2pl_future': 'éprouverez', '3pl_future': 'éprouveront',
      },
      de: {
        base: 'fühlen',
        '1sg_present': 'fühle', '2sg_present': 'fühlst', '3sg_present': 'fühlt',
        '1pl_present': 'fühlen', '2pl_present': 'fühlt', '3pl_present': 'fühlen',
        '1sg_past': 'fühlte', '2sg_past': 'fühltest', '3sg_past': 'fühlte',
        '1pl_past': 'fühlten', '2pl_past': 'fühltet', '3pl_past': 'fühlten',
      },
      es: {
        base: 'sentir',
        '1sg_present': 'siento', '2sg_present': 'sientes', '3sg_present': 'siente',
        '1pl_present': 'sentimos', '2pl_present': 'sentís', '3pl_present': 'sienten',
        '1sg_past': 'sentí', '2sg_past': 'sentiste', '3sg_past': 'sintió',
        '1pl_past': 'sentimos', '2pl_past': 'sentisteis', '3pl_past': 'sintieron',
        '1sg_future': 'sentiré', '2sg_future': 'sentirás', '3sg_future': 'sentirá',
        '1pl_future': 'sentiremos', '2pl_future': 'sentiréis', '3pl_future': 'sentirán',
      },
      ja: {
        base: '感じる',
        reading: 'かんじる',
        masu_present: '感じます',
        masu_present_reading: 'かんじます',
      },
      pt: {
        base: 'sentir',
        '1sg_present': 'sinto', '2sg_present': 'sente', '3sg_present': 'sente',
        '1pl_present': 'sentimos', '2pl_present': 'sentem', '3pl_present': 'sentem',
        '1sg_past': 'senti', '2sg_past': 'sentiu', '3sg_past': 'sentiu',
        '1pl_past': 'sentimos', '2pl_past': 'sentiram', '3pl_past': 'sentiram',
        '1sg_future': 'sentirei', '2sg_future': 'sentirá', '3sg_future': 'sentirá',
        '1pl_future': 'sentiremos', '2pl_future': 'sentirão', '3pl_future': 'sentirão',
      },
    },
  },

  {
    // The genus of CRY ("to shed tears") — the verb of letting a liquid flow out that its dictionary
    // definition cites as its genus (see the B17 verb-definition task). English shed is invariant
    // (shed / shed, shedding); German takes the strong, inseparable vergießen (vergoss /
    // vergossen); the Romance languages take the pouring verbs versare / verser / derramar.
    id: 'SHED',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'source', 'cause', 'locative'],
    description: 'to let flow out; to pour forth',
    emoji: '💦',
    synonym: 'pour out',
    forms: {
      en: {
        base: 'shed',
        '1sg_present': 'shed', '2sg_present': 'shed', '3sg_present': 'sheds',
        '1pl_present': 'shed', '2pl_present': 'shed', '3pl_present': 'shed',
        past: 'shed',
      },
      it: {
        base: 'versare',
        '1sg_present': 'verso', '2sg_present': 'versi', '3sg_present': 'versa',
        '1pl_present': 'versiamo', '2pl_present': 'versate', '3pl_present': 'versano',
        '1sg_past': 'versai', '2sg_past': 'versasti', '3sg_past': 'versò',
        '1pl_past': 'versammo', '2pl_past': 'versaste', '3pl_past': 'versarono',
        '1sg_future': 'verserò', '2sg_future': 'verserai', '3sg_future': 'verserà',
        '1pl_future': 'verseremo', '2pl_future': 'verserete', '3pl_future': 'verseranno',
      },
      fr: {
        base: 'verser',
        '1sg_present': 'verse', '2sg_present': 'verses', '3sg_present': 'verse',
        '1pl_present': 'versons', '2pl_present': 'versez', '3pl_present': 'versent',
        '1sg_past': 'versai', '2sg_past': 'versas', '3sg_past': 'versa',
        '1pl_past': 'versâmes', '2pl_past': 'versâtes', '3pl_past': 'versèrent',
        '1sg_future': 'verserai', '2sg_future': 'verseras', '3sg_future': 'versera',
        '1pl_future': 'verserons', '2pl_future': 'verserez', '3pl_future': 'verseront',
      },
      de: {
        base: 'vergießen',
        '1sg_present': 'vergieße', '2sg_present': 'vergießt', '3sg_present': 'vergießt',
        '1pl_present': 'vergießen', '2pl_present': 'vergießt', '3pl_present': 'vergießen',
        '1sg_past': 'vergoss', '2sg_past': 'vergossest', '3sg_past': 'vergoss',
        '1pl_past': 'vergossen', '2pl_past': 'vergosst', '3pl_past': 'vergossen',
      },
      es: {
        base: 'derramar',
        '1sg_present': 'derramo', '2sg_present': 'derramas', '3sg_present': 'derrama',
        '1pl_present': 'derramamos', '2pl_present': 'derramáis', '3pl_present': 'derraman',
        '1sg_past': 'derramé', '2sg_past': 'derramaste', '3sg_past': 'derramó',
        '1pl_past': 'derramamos', '2pl_past': 'derramasteis', '3pl_past': 'derramaron',
        '1sg_future': 'derramaré', '2sg_future': 'derramarás', '3sg_future': 'derramará',
        '1pl_future': 'derramaremos', '2pl_future': 'derramaréis', '3pl_future': 'derramarán',
      },
      ja: {
        base: '流す',
        reading: 'ながす',
        masu_present: '流します',
        masu_present_reading: 'ながします',
      },
      pt: {
        base: 'derramar',
        '1sg_present': 'derramo', '2sg_present': 'derrama', '3sg_present': 'derrama',
        '1pl_present': 'derramamos', '2pl_present': 'derramam', '3pl_present': 'derramam',
        '1sg_past': 'derramei', '2sg_past': 'derramou', '3sg_past': 'derramou',
        '1pl_past': 'derramamos', '2pl_past': 'derramaram', '3pl_past': 'derramaram',
        '1sg_future': 'derramarei', '2sg_future': 'derramará', '3sg_future': 'derramará',
        '1pl_future': 'derramaremos', '2pl_future': 'derramarão', '3pl_future': 'derramarão',
      },
    },
  },

  {
    // The genus of CRY_OUT ("to produce loud sounds", B17) — the verb of bringing something forth
    // that its dictionary definition cites as its genus. Italian produrre contracts its
    // infinitive (produco / produsse / prodotto / produrrà), French produire and Spanish producir
    // are irregular (produisit / produjo, produzco), and German takes the inseparable erzeugen.
    // Japanese takes 出す ("put out"), which also reads for giving off a sound.
    id: 'PRODUCE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to bring into existence; to give off',
    emoji: '🏭',
    forms: {
      en: {
        base: 'produce',
        '1sg_present': 'produce', '2sg_present': 'produce', '3sg_present': 'produces',
        '1pl_present': 'produce', '2pl_present': 'produce', '3pl_present': 'produce',
        past: 'produced',
      },
      it: {
        base: 'produrre',
        '1sg_present': 'produco', '2sg_present': 'produci', '3sg_present': 'produce',
        '1pl_present': 'produciamo', '2pl_present': 'producete', '3pl_present': 'producono',
        '1sg_past': 'produssi', '2sg_past': 'producesti', '3sg_past': 'produsse',
        '1pl_past': 'producemmo', '2pl_past': 'produceste', '3pl_past': 'produssero',
        '1sg_future': 'produrrò', '2sg_future': 'produrrai', '3sg_future': 'produrrà',
        '1pl_future': 'produrremo', '2pl_future': 'produrrete', '3pl_future': 'produrranno',
      },
      fr: {
        base: 'produire',
        '1sg_present': 'produis', '2sg_present': 'produis', '3sg_present': 'produit',
        '1pl_present': 'produisons', '2pl_present': 'produisez', '3pl_present': 'produisent',
        '1sg_past': 'produisis', '2sg_past': 'produisis', '3sg_past': 'produisit',
        '1pl_past': 'produisîmes', '2pl_past': 'produisîtes', '3pl_past': 'produisirent',
        '1sg_future': 'produirai', '2sg_future': 'produiras', '3sg_future': 'produira',
        '1pl_future': 'produirons', '2pl_future': 'produirez', '3pl_future': 'produiront',
      },
      de: {
        base: 'erzeugen',
        '1sg_present': 'erzeuge', '2sg_present': 'erzeugst', '3sg_present': 'erzeugt',
        '1pl_present': 'erzeugen', '2pl_present': 'erzeugt', '3pl_present': 'erzeugen',
        '1sg_past': 'erzeugte', '2sg_past': 'erzeugtest', '3sg_past': 'erzeugte',
        '1pl_past': 'erzeugten', '2pl_past': 'erzeugtet', '3pl_past': 'erzeugten',
      },
      es: {
        base: 'producir',
        '1sg_present': 'produzco', '2sg_present': 'produces', '3sg_present': 'produce',
        '1pl_present': 'producimos', '2pl_present': 'producís', '3pl_present': 'producen',
        '1sg_past': 'produje', '2sg_past': 'produjiste', '3sg_past': 'produjo',
        '1pl_past': 'produjimos', '2pl_past': 'produjisteis', '3pl_past': 'produjeron',
        '1sg_future': 'produciré', '2sg_future': 'producirás', '3sg_future': 'producirá',
        '1pl_future': 'produciremos', '2pl_future': 'produciréis', '3pl_future': 'producirán',
      },
      ja: {
        base: '出す',
        reading: 'だす',
        masu_present: '出します',
        masu_present_reading: 'だします',
      },
      pt: {
        base: 'produzir',
        '1sg_present': 'produzo', '2sg_present': 'produz', '3sg_present': 'produz',
        '1pl_present': 'produzimos', '2pl_present': 'produzem', '3pl_present': 'produzem',
        '1sg_past': 'produzi', '2sg_past': 'produziu', '3sg_past': 'produziu',
        '1pl_past': 'produzimos', '2pl_past': 'produziram', '3pl_past': 'produziram',
        '1sg_future': 'produzirei', '2sg_future': 'produzirá', '3sg_future': 'produzirá',
        '1pl_future': 'produziremos', '2pl_future': 'produzirão', '3pl_future': 'produzirão',
      },
    },
  },

  {
    // The CAUSATIVE verb, the genus of every "to make something happen" definition: it governs an
    // **object-controlled** infinitive complement, so its object is not what it acts on but the one
    // that comes to act — "to cause a person to see objects" is the person seeing (localization
    // C08). Which word links the infinitive is the governor's, so each lexeme names it
    // (`infinitive_link`): indurre / induire / inducir / induzir **a**, **à**; English "to" and
    // German "zu" are the only link their engines know. The four Romance languages take the
    // "induce" verb rather than each one's most idiomatic causative periphrasis (fr *amener à*,
    // es *llevar a*) because this one also reads as a plain transitive with an object of its own
    // ("indurre un cambiamento"), which *amener un feu* / *llevar un fuego* would not.
    //
    // `causative: '1'` marks the verb as that construction's own, which only Japanese reads: it has
    // no transitive verb governing a clause here, and says it as 〜ようにする ("bring it about that
    // —"), so the ja engine closes the clause on する in place of the lexeme's 引き起こす — which is
    // what the verb says standing on its own ("the cat causes a fire", 猫は火を引き起こします).
    id: 'CAUSE_VERB',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    // What the causee comes to do is an infinitive it governs ("to cause a person to see objects").
    clauseObject: 'infinitive',
    description: 'to make something or someone come to act or to be in a state',
    emoji: '🎬',
    synonym: 'bring about',
    forms: {
      en: {
        base: 'cause', causative: '1',
        '1sg_present': 'cause', '2sg_present': 'cause', '3sg_present': 'causes',
        '1pl_present': 'cause', '2pl_present': 'cause', '3pl_present': 'cause',
        past: 'caused',
      },
      it: {
        // indurre contracts like produrre: induco / indusse / indurrà / indotto.
        base: 'indurre', causative: '1', infinitive_link: 'a',
        '1sg_present': 'induco', '2sg_present': 'induci', '3sg_present': 'induce',
        '1pl_present': 'induciamo', '2pl_present': 'inducete', '3pl_present': 'inducono',
        '1sg_past': 'indussi', '2sg_past': 'inducesti', '3sg_past': 'indusse',
        '1pl_past': 'inducemmo', '2pl_past': 'induceste', '3pl_past': 'indussero',
        '1sg_future': 'indurrò', '2sg_future': 'indurrai', '3sg_future': 'indurrà',
        '1pl_future': 'indurremo', '2pl_future': 'indurrete', '3pl_future': 'indurranno',
      },
      fr: {
        // induire, like produire: induis / induisit / induira / induit.
        base: 'induire', causative: '1', infinitive_link: 'à',
        '1sg_present': 'induis', '2sg_present': 'induis', '3sg_present': 'induit',
        '1pl_present': 'induisons', '2pl_present': 'induisez', '3pl_present': 'induisent',
        '1sg_past': 'induisis', '2sg_past': 'induisis', '3sg_past': 'induisit',
        '1pl_past': 'induisîmes', '2pl_past': 'induisîtes', '3pl_past': 'induisirent',
        '1sg_future': 'induirai', '2sg_future': 'induiras', '3sg_future': 'induira',
        '1pl_future': 'induirons', '2pl_future': 'induirez', '3pl_future': 'induiront',
      },
      de: {
        // Inseparable, and the stem already ends in -ss: 2sg/3sg and the Partizip are all veranlasst.
        base: 'veranlassen', causative: '1',
        '1sg_present': 'veranlasse', '2sg_present': 'veranlasst', '3sg_present': 'veranlasst',
        '1pl_present': 'veranlassen', '2pl_present': 'veranlasst', '3pl_present': 'veranlassen',
        '1sg_past': 'veranlasste', '2sg_past': 'veranlasstest', '3sg_past': 'veranlasste',
        '1pl_past': 'veranlassten', '2pl_past': 'veranlasstet', '3pl_past': 'veranlassten',
      },
      es: {
        // inducir, like producir: induzco / indujo / inducido.
        base: 'inducir', causative: '1', infinitive_link: 'a',
        '1sg_present': 'induzco', '2sg_present': 'induces', '3sg_present': 'induce',
        '1pl_present': 'inducimos', '2pl_present': 'inducís', '3pl_present': 'inducen',
        '1sg_past': 'induje', '2sg_past': 'indujiste', '3sg_past': 'indujo',
        '1pl_past': 'indujimos', '2pl_past': 'indujisteis', '3pl_past': 'indujeron',
        '1sg_future': 'induciré', '2sg_future': 'inducirás', '3sg_future': 'inducirá',
        '1pl_future': 'induciremos', '2pl_future': 'induciréis', '3pl_future': 'inducirán',
      },
      ja: {
        base: '引き起こす',
        reading: 'ひきおこす',
        masu_present: '引き起こします',
        masu_present_reading: 'ひきおこします',
        causative: '1',
        // Japanese nominalizes the caused event with よう, not こと, and closes it on する:
        // 人が物体を見るようにする.
        infinitive_link: 'ように',
      },
      pt: {
        // induzir, like produzir: induzo / induziu / induzido.
        base: 'induzir', causative: '1', infinitive_link: 'a',
        '1sg_present': 'induzo', '2sg_present': 'induz', '3sg_present': 'induz',
        '1pl_present': 'induzimos', '2pl_present': 'induzem', '3pl_present': 'induzem',
        '1sg_past': 'induzi', '2sg_past': 'induziu', '3sg_past': 'induziu',
        '1pl_past': 'induzimos', '2pl_past': 'induziram', '3pl_past': 'induziram',
        '1sg_future': 'induzirei', '2sg_future': 'induzirá', '3sg_future': 'induzirá',
        '1pl_future': 'induziremos', '2pl_future': 'induzirão', '3pl_future': 'induzirão',
      },
    },
  },

  {
    // The genus of CLICK ("to press a button") — the verb of pushing against something that its
    // dictionary definition cites as its genus (see the B18 verb-definition task). Italian premere
    // takes the -etti remote past (premette) and the -uto participle (premuto); German takes the
    // plain drücken, not the separable eindrücken; Spanish takes pulsar, the verb for pressing a
    // button or key, over the narrower apretar.
    id: 'PRESS',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to push steadily against something',
    emoji: '👇',
    synonym: 'push',
    forms: {
      en: {
        base: 'press',
        '1sg_present': 'press', '2sg_present': 'press', '3sg_present': 'presses',
        '1pl_present': 'press', '2pl_present': 'press', '3pl_present': 'press',
        past: 'pressed',
      },
      it: {
        base: 'premere',
        '1sg_present': 'premo', '2sg_present': 'premi', '3sg_present': 'preme',
        '1pl_present': 'premiamo', '2pl_present': 'premete', '3pl_present': 'premono',
        '1sg_past': 'premetti', '2sg_past': 'premesti', '3sg_past': 'premette',
        '1pl_past': 'prememmo', '2pl_past': 'premeste', '3pl_past': 'premettero',
        '1sg_future': 'premerò', '2sg_future': 'premerai', '3sg_future': 'premerà',
        '1pl_future': 'premeremo', '2pl_future': 'premerete', '3pl_future': 'premeranno',
      },
      fr: {
        base: 'presser',
        '1sg_present': 'presse', '2sg_present': 'presses', '3sg_present': 'presse',
        '1pl_present': 'pressons', '2pl_present': 'pressez', '3pl_present': 'pressent',
        '1sg_past': 'pressai', '2sg_past': 'pressas', '3sg_past': 'pressa',
        '1pl_past': 'pressâmes', '2pl_past': 'pressâtes', '3pl_past': 'pressèrent',
        '1sg_future': 'presserai', '2sg_future': 'presseras', '3sg_future': 'pressera',
        '1pl_future': 'presserons', '2pl_future': 'presserez', '3pl_future': 'presseront',
      },
      de: {
        base: 'drücken',
        '1sg_present': 'drücke', '2sg_present': 'drückst', '3sg_present': 'drückt',
        '1pl_present': 'drücken', '2pl_present': 'drückt', '3pl_present': 'drücken',
        '1sg_past': 'drückte', '2sg_past': 'drücktest', '3sg_past': 'drückte',
        '1pl_past': 'drückten', '2pl_past': 'drücktet', '3pl_past': 'drückten',
      },
      es: {
        base: 'pulsar',
        '1sg_present': 'pulso', '2sg_present': 'pulsas', '3sg_present': 'pulsa',
        '1pl_present': 'pulsamos', '2pl_present': 'pulsáis', '3pl_present': 'pulsan',
        '1sg_past': 'pulsé', '2sg_past': 'pulsaste', '3sg_past': 'pulsó',
        '1pl_past': 'pulsamos', '2pl_past': 'pulsasteis', '3pl_past': 'pulsaron',
        '1sg_future': 'pulsaré', '2sg_future': 'pulsarás', '3sg_future': 'pulsará',
        '1pl_future': 'pulsaremos', '2pl_future': 'pulsaréis', '3pl_future': 'pulsarán',
      },
      ja: {
        base: '押す',
        reading: 'おす',
        masu_present: '押します',
        masu_present_reading: 'おします',
      },
      pt: {
        base: 'pressionar',
        '1sg_present': 'pressiono', '2sg_present': 'pressiona', '3sg_present': 'pressiona',
        '1pl_present': 'pressionamos', '2pl_present': 'pressionam', '3pl_present': 'pressionam',
        '1sg_past': 'pressionei', '2sg_past': 'pressionou', '3sg_past': 'pressionou',
        '1pl_past': 'pressionamos', '2pl_past': 'pressionaram', '3pl_past': 'pressionaram',
        '1sg_future': 'pressionarei', '2sg_future': 'pressionará', '3sg_future': 'pressionará',
        '1pl_future': 'pressionaremos', '2pl_future': 'pressionarão', '3pl_future': 'pressionarão',
      },
    },
  },

  {
    // The genus of TYPE ("to write with a keyboard") — the verb of forming letters that its
    // dictionary definition cites as its genus (see the B18 verb-definition task). Irregular in
    // every European language: English wrote / written, Italian scrisse / scritto, French écrivons /
    // écrivit / écrit, German schrieb / geschrieben, and a strong -to participle in Spanish and
    // Portuguese (escrito). Japanese takes the godan 書く (te-form 書いて).
    id: 'WRITE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'terminus', 'cause', 'locative'],
    description: 'to form letters or words on a surface',
    emoji: '✏️',
    forms: {
      en: {
        base: 'write',
        '1sg_present': 'write', '2sg_present': 'write', '3sg_present': 'writes',
        '1pl_present': 'write', '2pl_present': 'write', '3pl_present': 'write',
        past: 'wrote',
      },
      it: {
        base: 'scrivere',
        '1sg_present': 'scrivo', '2sg_present': 'scrivi', '3sg_present': 'scrive',
        '1pl_present': 'scriviamo', '2pl_present': 'scrivete', '3pl_present': 'scrivono',
        '1sg_past': 'scrissi', '2sg_past': 'scrivesti', '3sg_past': 'scrisse',
        '1pl_past': 'scrivemmo', '2pl_past': 'scriveste', '3pl_past': 'scrissero',
        '1sg_future': 'scriverò', '2sg_future': 'scriverai', '3sg_future': 'scriverà',
        '1pl_future': 'scriveremo', '2pl_future': 'scriverete', '3pl_future': 'scriveranno',
      },
      fr: {
        base: 'écrire',
        '1sg_present': 'écris', '2sg_present': 'écris', '3sg_present': 'écrit',
        '1pl_present': 'écrivons', '2pl_present': 'écrivez', '3pl_present': 'écrivent',
        '1sg_past': 'écrivis', '2sg_past': 'écrivis', '3sg_past': 'écrivit',
        '1pl_past': 'écrivîmes', '2pl_past': 'écrivîtes', '3pl_past': 'écrivirent',
        '1sg_future': 'écrirai', '2sg_future': 'écriras', '3sg_future': 'écrira',
        '1pl_future': 'écrirons', '2pl_future': 'écrirez', '3pl_future': 'écriront',
      },
      de: {
        base: 'schreiben',
        '1sg_present': 'schreibe', '2sg_present': 'schreibst', '3sg_present': 'schreibt',
        '1pl_present': 'schreiben', '2pl_present': 'schreibt', '3pl_present': 'schreiben',
        '1sg_past': 'schrieb', '2sg_past': 'schriebst', '3sg_past': 'schrieb',
        '1pl_past': 'schrieben', '2pl_past': 'schriebt', '3pl_past': 'schrieben',
      },
      es: {
        base: 'escribir',
        '1sg_present': 'escribo', '2sg_present': 'escribes', '3sg_present': 'escribe',
        '1pl_present': 'escribimos', '2pl_present': 'escribís', '3pl_present': 'escriben',
        '1sg_past': 'escribí', '2sg_past': 'escribiste', '3sg_past': 'escribió',
        '1pl_past': 'escribimos', '2pl_past': 'escribisteis', '3pl_past': 'escribieron',
        '1sg_future': 'escribiré', '2sg_future': 'escribirás', '3sg_future': 'escribirá',
        '1pl_future': 'escribiremos', '2pl_future': 'escribiréis', '3pl_future': 'escribirán',
      },
      ja: {
        base: '書く',
        reading: 'かく',
        masu_present: '書きます',
        masu_present_reading: 'かきます',
      },
      pt: {
        base: 'escrever',
        '1sg_present': 'escrevo', '2sg_present': 'escreve', '3sg_present': 'escreve',
        '1pl_present': 'escrevemos', '2pl_present': 'escrevem', '3pl_present': 'escrevem',
        '1sg_past': 'escrevi', '2sg_past': 'escreveu', '3sg_past': 'escreveu',
        '1pl_past': 'escrevemos', '2pl_past': 'escreveram', '3pl_past': 'escreveram',
        '1sg_future': 'escreverei', '2sg_future': 'escreverá', '3sg_future': 'escreverá',
        '1pl_future': 'escreveremos', '2pl_future': 'escreverão', '3pl_future': 'escreverão',
      },
    },
  },

  {
    id: 'CLICK',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to press a mouse button or select by pressing',
    definition: infinitiveGloss('PRESS', { object: 'BUTTON', definiteness: 'indefinite' }),
    emoji: '🖱️',
    isA: 'PRESS',
    // One clicks ON a thing in five of the languages, so their lexemes name the preposition the object
    // takes (`object_prep`): it "clicca sul pulsante", fr "clique sur le bouton", de "klickt auf die
    // Taste", es "clica en el botón", pt "clica no botão" (A139). English and Japanese take it bare.
    forms: {
      en: {
        base: 'click',
        '1sg_present': 'click', '2sg_present': 'click', '3sg_present': 'clicks',
        '1pl_present': 'click', '2pl_present': 'click', '3pl_present': 'click',
        past: 'clicked',
      },
      it: {
        base: 'cliccare', object_prep: 'su',
        '1sg_present': 'clicco', '2sg_present': 'clicchi', '3sg_present': 'clicca',
        '1pl_present': 'clicchiamo', '2pl_present': 'cliccate', '3pl_present': 'cliccano',
        '1sg_past': 'cliccai', '2sg_past': 'cliccasti', '3sg_past': 'cliccò',
        '1pl_past': 'cliccammo', '2pl_past': 'cliccaste', '3pl_past': 'cliccarono',
        '1sg_future': 'cliccherò', '2sg_future': 'cliccherai', '3sg_future': 'cliccherà',
        '1pl_future': 'cliccheremo', '2pl_future': 'cliccherete', '3pl_future': 'cliccheranno',
      },
      fr: {
        base: 'cliquer', object_prep: 'sur',
        '1sg_present': 'clique', '2sg_present': 'cliques', '3sg_present': 'clique',
        '1pl_present': 'cliquons', '2pl_present': 'cliquez', '3pl_present': 'cliquent',
        '1sg_past': 'cliquai', '2sg_past': 'cliquas', '3sg_past': 'cliqua',
        '1pl_past': 'cliquâmes', '2pl_past': 'cliquâtes', '3pl_past': 'cliquèrent',
        '1sg_future': 'cliquerai', '2sg_future': 'cliqueras', '3sg_future': 'cliquera',
        '1pl_future': 'cliquerons', '2pl_future': 'cliquerez', '3pl_future': 'cliqueront',
      },
      de: {
        base: 'klicken', object_prep: 'auf',
        '1sg_present': 'klicke', '2sg_present': 'klickst', '3sg_present': 'klickt',
        '1pl_present': 'klicken', '2pl_present': 'klickt', '3pl_present': 'klicken',
        '1sg_past': 'klickte', '2sg_past': 'klicktest', '3sg_past': 'klickte',
        '1pl_past': 'klickten', '2pl_past': 'klicktet', '3pl_past': 'klickten',
      },
      es: {
        base: 'clicar', object_prep: 'en',
        '1sg_present': 'clico', '2sg_present': 'clicas', '3sg_present': 'clica',
        '1pl_present': 'clicamos', '2pl_present': 'clicáis', '3pl_present': 'clican',
        '1sg_past': 'cliqué', '2sg_past': 'clicaste', '3sg_past': 'clicó',
        '1pl_past': 'clicamos', '2pl_past': 'clicasteis', '3pl_past': 'clicaron',
        '1sg_future': 'clicaré', '2sg_future': 'clicarás', '3sg_future': 'clicará',
        '1pl_future': 'clicaremos', '2pl_future': 'clicaréis', '3pl_future': 'clicarán',
      },
      ja: {
        base: 'クリックする',
        reading: 'くりっくする',
        masu_present: 'クリックします',
        masu_present_reading: 'くりっくします',
      },
      pt: {
        base: 'clicar', object_prep: 'em',
        '1sg_present': 'clico', '2sg_present': 'clica', '3sg_present': 'clica',
        '1pl_present': 'clicamos', '2pl_present': 'clicam', '3pl_present': 'clicam',
        '1sg_past': 'cliquei', '2sg_past': 'clicou', '3sg_past': 'clicou',
        '1pl_past': 'clicamos', '2pl_past': 'clicaram', '3pl_past': 'clicaram',
        '1sg_future': 'clicarei', '2sg_future': 'clicará', '3sg_future': 'clicará',
        '1pl_future': 'clicaremos', '2pl_future': 'clicarão', '3pl_future': 'clicarão',
      },
    },
  },

  // To be decided by another thing: CONDITIONAL's differentia, "on which another clause depends"
  // (localization C24). Like CLICK, every language but Japanese takes the object with a preposition
  // its lexeme names (`object_prep`, A139) — English "on", it "da", fr/es/pt "de", de "von" — and
  // Japanese with に (`object_particle`). German abhängen is separable and strong (hing ab,
  // abgehangen); Italian dipendere selects essere (è dipeso).
  {
    id: 'DEPEND',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to be decided or conditioned by something',
    emoji: '🔗',
    stative: true,
    forms: {
      en: {
        base: 'depend', object_prep: 'on',
        '1sg_present': 'depend', '2sg_present': 'depend', '3sg_present': 'depends',
        '1pl_present': 'depend', '2pl_present': 'depend', '3pl_present': 'depend',
        past: 'depended',
      },
      it: {
        base: 'dipendere', object_prep: 'da',
        '1sg_present': 'dipendo', '2sg_present': 'dipendi', '3sg_present': 'dipende',
        '1pl_present': 'dipendiamo', '2pl_present': 'dipendete', '3pl_present': 'dipendono',
        '1sg_past': 'dipesi', '2sg_past': 'dipendesti', '3sg_past': 'dipese',
        '1pl_past': 'dipendemmo', '2pl_past': 'dipendeste', '3pl_past': 'dipesero',
        '1sg_future': 'dipenderò', '2sg_future': 'dipenderai', '3sg_future': 'dipenderà',
        '1pl_future': 'dipenderemo', '2pl_future': 'dipenderete', '3pl_future': 'dipenderanno',
      },
      fr: {
        base: 'dépendre', object_prep: 'de',
        '1sg_present': 'dépends', '2sg_present': 'dépends', '3sg_present': 'dépend',
        '1pl_present': 'dépendons', '2pl_present': 'dépendez', '3pl_present': 'dépendent',
        '1sg_past': 'dépendis', '2sg_past': 'dépendis', '3sg_past': 'dépendit',
        '1pl_past': 'dépendîmes', '2pl_past': 'dépendîtes', '3pl_past': 'dépendirent',
        '1sg_future': 'dépendrai', '2sg_future': 'dépendras', '3sg_future': 'dépendra',
        '1pl_future': 'dépendrons', '2pl_future': 'dépendrez', '3pl_future': 'dépendront',
      },
      de: {
        base: 'abhängen', particle: 'ab', object_prep: 'von',
        '1sg_present': 'hänge', '2sg_present': 'hängst', '3sg_present': 'hängt',
        '1pl_present': 'hängen', '2pl_present': 'hängt', '3pl_present': 'hängen',
        '1sg_past': 'hing', '2sg_past': 'hingst', '3sg_past': 'hing',
        '1pl_past': 'hingen', '2pl_past': 'hingt', '3pl_past': 'hingen',
        '2sg_imperative': 'hänge',
      },
      es: {
        base: 'depender', object_prep: 'de',
        '1sg_present': 'dependo', '2sg_present': 'dependes', '3sg_present': 'depende',
        '1pl_present': 'dependemos', '2pl_present': 'dependéis', '3pl_present': 'dependen',
        '1sg_past': 'dependí', '2sg_past': 'dependiste', '3sg_past': 'dependió',
        '1pl_past': 'dependimos', '2pl_past': 'dependisteis', '3pl_past': 'dependieron',
        '1sg_future': 'dependeré', '2sg_future': 'dependerás', '3sg_future': 'dependerá',
        '1pl_future': 'dependeremos', '2pl_future': 'dependeréis', '3pl_future': 'dependerán',
      },
      ja: {
        base: '依存する',
        reading: 'いぞんする',
        masu_present: '依存します',
        masu_present_reading: 'いぞんします',
        object_particle: 'に',
      },
      pt: {
        base: 'depender', object_prep: 'de',
        '1sg_present': 'dependo', '2sg_present': 'depende', '3sg_present': 'depende',
        '1pl_present': 'dependemos', '2pl_present': 'dependem', '3pl_present': 'dependem',
        '1sg_past': 'dependi', '2sg_past': 'dependeu', '3sg_past': 'dependeu',
        '1pl_past': 'dependemos', '2pl_past': 'dependeram', '3pl_past': 'dependeram',
        '1sg_future': 'dependerei', '2sg_future': 'dependerá', '3sg_future': 'dependerá',
        '1pl_future': 'dependeremos', '2pl_future': 'dependerão', '3pl_future': 'dependerão',
      },
    },
  },

  {
    id: 'CHOOSE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to pick one option from several',
    definition: infinitiveGloss('INDICATE', { object: 'OPTION', definiteness: 'indefinite' }),
    emoji: '☑️',
    synonym: 'select',
    forms: {
      en: {
        base: 'choose',
        '1sg_present': 'choose', '2sg_present': 'choose', '3sg_present': 'chooses',
        '1pl_present': 'choose', '2pl_present': 'choose', '3pl_present': 'choose',
        past: 'chose',
      },
      it: {
        base: 'scegliere',
        '1sg_present': 'scelgo', '2sg_present': 'scegli', '3sg_present': 'sceglie',
        '1pl_present': 'scegliamo', '2pl_present': 'scegliete', '3pl_present': 'scelgono',
        '1sg_past': 'scelsi', '2sg_past': 'scegliesti', '3sg_past': 'scelse',
        '1pl_past': 'scegliemmo', '2pl_past': 'sceglieste', '3pl_past': 'scelsero',
        '1sg_future': 'sceglierò', '2sg_future': 'sceglierai', '3sg_future': 'sceglierà',
        '1pl_future': 'sceglieremo', '2pl_future': 'sceglierete', '3pl_future': 'sceglieranno',
      },
      fr: {
        base: 'choisir',
        '1sg_present': 'choisis', '2sg_present': 'choisis', '3sg_present': 'choisit',
        '1pl_present': 'choisissons', '2pl_present': 'choisissez', '3pl_present': 'choisissent',
        '1sg_past': 'choisis', '2sg_past': 'choisis', '3sg_past': 'choisit',
        '1pl_past': 'choisîmes', '2pl_past': 'choisîtes', '3pl_past': 'choisirent',
        '1sg_future': 'choisirai', '2sg_future': 'choisiras', '3sg_future': 'choisira',
        '1pl_future': 'choisirons', '2pl_future': 'choisirez', '3pl_future': 'choisiront',
      },
      de: {
        base: 'wählen',
        '1sg_present': 'wähle', '2sg_present': 'wählst', '3sg_present': 'wählt',
        '1pl_present': 'wählen', '2pl_present': 'wählt', '3pl_present': 'wählen',
        '1sg_past': 'wählte', '2sg_past': 'wähltest', '3sg_past': 'wählte',
        '1pl_past': 'wählten', '2pl_past': 'wähltet', '3pl_past': 'wählten',
      },
      es: {
        base: 'elegir',
        '1sg_present': 'elijo', '2sg_present': 'eliges', '3sg_present': 'elige',
        '1pl_present': 'elegimos', '2pl_present': 'elegís', '3pl_present': 'eligen',
        '1sg_past': 'elegí', '2sg_past': 'elegiste', '3sg_past': 'eligió',
        '1pl_past': 'elegimos', '2pl_past': 'elegisteis', '3pl_past': 'eligieron',
        '1sg_future': 'elegiré', '2sg_future': 'elegirás', '3sg_future': 'elegirá',
        '1pl_future': 'elegiremos', '2pl_future': 'elegiréis', '3pl_future': 'elegirán',
      },
      ja: {
        base: '選ぶ',
        reading: 'えらぶ',
        masu_present: '選びます',
        masu_present_reading: 'えらびます',
      },
      pt: {
        base: 'escolher',
        '1sg_present': 'escolho', '2sg_present': 'escolhe', '3sg_present': 'escolhe',
        '1pl_present': 'escolhemos', '2pl_present': 'escolhem', '3pl_present': 'escolhem',
        '1sg_past': 'escolhi', '2sg_past': 'escolheu', '3sg_past': 'escolheu',
        '1pl_past': 'escolhemos', '2pl_past': 'escolheram', '3pl_past': 'escolheram',
        '1sg_future': 'escolherei', '2sg_future': 'escolherá', '3sg_future': 'escolherá',
        '1pl_future': 'escolheremos', '2pl_future': 'escolherão', '3pl_future': 'escolherão',
      },
    },
  },

  {
    // Narrowing a list down to what matches — what clicking a slot does to the word palette. Every
    // language here has taken the computing loan (filtrare / filtrer / filtern / filtrar), and
    // Japanese uses the native 絞り込む ("narrow down"), the word its interfaces say.
    id: 'FILTER',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to keep only the items that match',
    emoji: '🔎',
    forms: {
      en: {
        base: 'filter',
        '1sg_present': 'filter', '2sg_present': 'filter', '3sg_present': 'filters',
        '1pl_present': 'filter', '2pl_present': 'filter', '3pl_present': 'filter',
        past: 'filtered',
      },
      it: {
        base: 'filtrare',
        '1sg_present': 'filtro', '2sg_present': 'filtri', '3sg_present': 'filtra',
        '1pl_present': 'filtriamo', '2pl_present': 'filtrate', '3pl_present': 'filtrano',
        '1sg_past': 'filtrai', '2sg_past': 'filtrasti', '3sg_past': 'filtrò',
        '1pl_past': 'filtrammo', '2pl_past': 'filtraste', '3pl_past': 'filtrarono',
        '1sg_future': 'filtrerò', '2sg_future': 'filtrerai', '3sg_future': 'filtrerà',
        '1pl_future': 'filtreremo', '2pl_future': 'filtrerete', '3pl_future': 'filtreranno',
      },
      fr: {
        base: 'filtrer',
        '1sg_present': 'filtre', '2sg_present': 'filtres', '3sg_present': 'filtre',
        '1pl_present': 'filtrons', '2pl_present': 'filtrez', '3pl_present': 'filtrent',
        '1sg_past': 'filtrai', '2sg_past': 'filtras', '3sg_past': 'filtra',
        '1pl_past': 'filtrâmes', '2pl_past': 'filtrâtes', '3pl_past': 'filtrèrent',
        '1sg_future': 'filtrerai', '2sg_future': 'filtreras', '3sg_future': 'filtrera',
        '1pl_future': 'filtrerons', '2pl_future': 'filtrerez', '3pl_future': 'filtreront',
      },
      de: {
        base: 'filtern',
        '1sg_present': 'filtere', '2sg_present': 'filterst', '3sg_present': 'filtert',
        '1pl_present': 'filtern', '2pl_present': 'filtert', '3pl_present': 'filtern',
        '1sg_past': 'filterte', '2sg_past': 'filtertest', '3sg_past': 'filterte',
        '1pl_past': 'filterten', '2pl_past': 'filtertet', '3pl_past': 'filterten',
      },
      es: {
        base: 'filtrar',
        '1sg_present': 'filtro', '2sg_present': 'filtras', '3sg_present': 'filtra',
        '1pl_present': 'filtramos', '2pl_present': 'filtráis', '3pl_present': 'filtran',
        '1sg_past': 'filtré', '2sg_past': 'filtraste', '3sg_past': 'filtró',
        '1pl_past': 'filtramos', '2pl_past': 'filtrasteis', '3pl_past': 'filtraron',
        '1sg_future': 'filtraré', '2sg_future': 'filtrarás', '3sg_future': 'filtrará',
        '1pl_future': 'filtraremos', '2pl_future': 'filtraréis', '3pl_future': 'filtrarán',
      },
      ja: {
        base: '絞り込む',
        reading: 'しぼりこむ',
        masu_present: '絞り込みます',
        masu_present_reading: 'しぼりこみます',
      },
      pt: {
        base: 'filtrar',
        '1sg_present': 'filtro', '2sg_present': 'filtra', '3sg_present': 'filtra',
        '1pl_present': 'filtramos', '2pl_present': 'filtram', '3pl_present': 'filtram',
        '1sg_past': 'filtrei', '2sg_past': 'filtrou', '3sg_past': 'filtrou',
        '1pl_past': 'filtramos', '2pl_past': 'filtraram', '3pl_past': 'filtraram',
        '1sg_future': 'filtrarei', '2sg_future': 'filtrará', '3sg_future': 'filtrará',
        '1pl_future': 'filtraremos', '2pl_future': 'filtrarão', '3pl_future': 'filtrarão',
      },
    },
  },

  {
    id: 'SELECT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    // Distinct from CHOOSE: not "pick one option over the others" but "mark this item as
    // the one acted on" — the interface sense (select a word, select a slot).
    description: 'to mark out an item as the one to act on',
    // "to indicate an object to use it" (localization C20). CHOOSE is "to indicate an option"; what
    // sets SELECT apart is what the indicating is *for*, a clause of purpose, whose object is a
    // pronoun standing for the object: en "it", but de "ihn", because *Gegenstand* is masculine.
    definition: infinitiveGloss('INDICATE', {
      object: 'OBJECT_THING',
      definiteness: 'indefinite',
      purpose: { verb: 'USE', object: 'THIRD_PERSON', antecedent: 'OBJECT_THING' },
    }),
    emoji: '🖱️',
    synonym: 'mark',
    forms: {
      en: {
        base: 'select',
        '1sg_present': 'select', '2sg_present': 'select', '3sg_present': 'selects',
        '1pl_present': 'select', '2pl_present': 'select', '3pl_present': 'select',
        past: 'selected',
      },
      it: {
        base: 'selezionare',
        '1sg_present': 'seleziono', '2sg_present': 'selezioni', '3sg_present': 'seleziona',
        '1pl_present': 'selezioniamo', '2pl_present': 'selezionate', '3pl_present': 'selezionano',
        '1sg_past': 'selezionai', '2sg_past': 'selezionasti', '3sg_past': 'selezionò',
        '1pl_past': 'selezionammo', '2pl_past': 'selezionaste', '3pl_past': 'selezionarono',
        '1sg_future': 'selezionerò', '2sg_future': 'selezionerai', '3sg_future': 'selezionerà',
        '1pl_future': 'selezioneremo', '2pl_future': 'selezionerete', '3pl_future': 'selezioneranno',
      },
      fr: {
        base: 'sélectionner',
        '1sg_present': 'sélectionne', '2sg_present': 'sélectionnes', '3sg_present': 'sélectionne',
        '1pl_present': 'sélectionnons', '2pl_present': 'sélectionnez', '3pl_present': 'sélectionnent',
        '1sg_past': 'sélectionnai', '2sg_past': 'sélectionnas', '3sg_past': 'sélectionna',
        '1pl_past': 'sélectionnâmes', '2pl_past': 'sélectionnâtes', '3pl_past': 'sélectionnèrent',
        '1sg_future': 'sélectionnerai', '2sg_future': 'sélectionneras', '3sg_future': 'sélectionnera',
        '1pl_future': 'sélectionnerons', '2pl_future': 'sélectionnerez', '3pl_future': 'sélectionneront',
      },
      de: {
        // "auswählen" is the idiomatic word, but its prefix is separable ("ich wähle das Wort
        // aus") and the engine has no separable-verb machinery, so the inseparable technical
        // synonym is used instead — it stays well-formed in every clause type.
        base: 'selektieren',
        '1sg_present': 'selektiere', '2sg_present': 'selektierst', '3sg_present': 'selektiert',
        '1pl_present': 'selektieren', '2pl_present': 'selektiert', '3pl_present': 'selektieren',
        '1sg_past': 'selektierte', '2sg_past': 'selektiertest', '3sg_past': 'selektierte',
        '1pl_past': 'selektierten', '2pl_past': 'selektiertet', '3pl_past': 'selektierten',
        '2sg_imperative': 'selektiere', // the optional du -e, kept
      },
      es: {
        base: 'seleccionar',
        '1sg_present': 'selecciono', '2sg_present': 'seleccionas', '3sg_present': 'selecciona',
        '1pl_present': 'seleccionamos', '2pl_present': 'seleccionáis', '3pl_present': 'seleccionan',
        '1sg_past': 'seleccioné', '2sg_past': 'seleccionaste', '3sg_past': 'seleccionó',
        '1pl_past': 'seleccionamos', '2pl_past': 'seleccionasteis', '3pl_past': 'seleccionaron',
        '1sg_future': 'seleccionaré', '2sg_future': 'seleccionarás', '3sg_future': 'seleccionará',
        '1pl_future': 'seleccionaremos', '2pl_future': 'seleccionaréis', '3pl_future': 'seleccionarán',
      },
      ja: {
        base: '選択する',
        reading: 'せんたくする',
        masu_present: '選択します',
        masu_present_reading: 'せんたくします',
      },
      pt: {
        base: 'selecionar',
        '1sg_present': 'seleciono', '2sg_present': 'seleciona', '3sg_present': 'seleciona',
        '1pl_present': 'selecionamos', '2pl_present': 'selecionam', '3pl_present': 'selecionam',
        '1sg_past': 'selecionei', '2sg_past': 'selecionou', '3sg_past': 'selecionou',
        '1pl_past': 'selecionamos', '2pl_past': 'selecionaram', '3pl_past': 'selecionaram',
        '1sg_future': 'selecionarei', '2sg_future': 'selecionará', '3sg_future': 'selecionará',
        '1pl_future': 'selecionaremos', '2pl_future': 'selecionarão', '3pl_future': 'selecionarão',
      },
    },
  },

  {
    id: 'TYPE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to write with a keyboard',
    definition: infinitiveGloss('WRITE', {
      complements: { instrumental: { phrase: { concept: 'KEYBOARD', definiteness: 'indefinite' } } },
    }),
    emoji: '⌨️',
    isA: 'WRITE',
    forms: {
      en: {
        base: 'type',
        '1sg_present': 'type', '2sg_present': 'type', '3sg_present': 'types',
        '1pl_present': 'type', '2pl_present': 'type', '3pl_present': 'type',
        past: 'typed',
      },
      it: {
        base: 'digitare',
        '1sg_present': 'digito', '2sg_present': 'digiti', '3sg_present': 'digita',
        '1pl_present': 'digitiamo', '2pl_present': 'digitate', '3pl_present': 'digitano',
        '1sg_past': 'digitai', '2sg_past': 'digitasti', '3sg_past': 'digitò',
        '1pl_past': 'digitammo', '2pl_past': 'digitaste', '3pl_past': 'digitarono',
        '1sg_future': 'digiterò', '2sg_future': 'digiterai', '3sg_future': 'digiterà',
        '1pl_future': 'digiteremo', '2pl_future': 'digiterete', '3pl_future': 'digiteranno',
      },
      fr: {
        base: 'taper',
        '1sg_present': 'tape', '2sg_present': 'tapes', '3sg_present': 'tape',
        '1pl_present': 'tapons', '2pl_present': 'tapez', '3pl_present': 'tapent',
        '1sg_past': 'tapai', '2sg_past': 'tapas', '3sg_past': 'tapa',
        '1pl_past': 'tapâmes', '2pl_past': 'tapâtes', '3pl_past': 'tapèrent',
        '1sg_future': 'taperai', '2sg_future': 'taperas', '3sg_future': 'tapera',
        '1pl_future': 'taperons', '2pl_future': 'taperez', '3pl_future': 'taperont',
      },
      de: {
        base: 'tippen',
        '1sg_present': 'tippe', '2sg_present': 'tippst', '3sg_present': 'tippt',
        '1pl_present': 'tippen', '2pl_present': 'tippt', '3pl_present': 'tippen',
        '1sg_past': 'tippte', '2sg_past': 'tipptest', '3sg_past': 'tippte',
        '1pl_past': 'tippten', '2pl_past': 'tipptet', '3pl_past': 'tippten',
      },
      es: {
        base: 'teclear',
        '1sg_present': 'tecleo', '2sg_present': 'tecleas', '3sg_present': 'teclea',
        '1pl_present': 'tecleamos', '2pl_present': 'tecleáis', '3pl_present': 'teclean',
        '1sg_past': 'tecleé', '2sg_past': 'tecleaste', '3sg_past': 'tecleó',
        '1pl_past': 'tecleamos', '2pl_past': 'tecleasteis', '3pl_past': 'teclearon',
        '1sg_future': 'teclearé', '2sg_future': 'teclearás', '3sg_future': 'tecleará',
        '1pl_future': 'teclearemos', '2pl_future': 'teclearéis', '3pl_future': 'teclearán',
      },
      ja: {
        base: '入力する',
        reading: 'にゅうりょくする',
        masu_present: '入力します',
        masu_present_reading: 'にゅうりょくします',
        label: '入力',
        label_reading: 'にゅうりょく',
      },
      pt: {
        base: 'digitar',
        '1sg_present': 'digito', '2sg_present': 'digita', '3sg_present': 'digita',
        '1pl_present': 'digitamos', '2pl_present': 'digitam', '3pl_present': 'digitam',
        '1sg_past': 'digitei', '2sg_past': 'digitou', '3sg_past': 'digitou',
        '1pl_past': 'digitamos', '2pl_past': 'digitaram', '3pl_past': 'digitaram',
        '1sg_future': 'digitarei', '2sg_future': 'digitará', '3sg_future': 'digitará',
        '1pl_future': 'digitaremos', '2pl_future': 'digitarão', '3pl_future': 'digitarão',
      },
    },
  },

  {
    id: 'TRANSLATE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to express a meaning in another language',
    // "to express concepts with another language": the differentia is the language it is done
    // with, which is the `instrumental` — the means, not a companion. Japanese marks it with で,
    // which is exactly the "in" the English literal wants (別の言語で概念を表す).
    definition: infinitiveGloss('EXPRESS', {
      object: 'CONCEPT',
      number: 'plural',
      complements: {
        instrumental: { phrase: { concept: 'LANGUAGE', definiteness: 'indefinite', adjectives: ['OTHER'] } },
      },
    }),
    emoji: '🌐',
    isA: 'EXPRESS',
    forms: {
      en: {
        base: 'translate',
        '1sg_present': 'translate', '2sg_present': 'translate', '3sg_present': 'translates',
        '1pl_present': 'translate', '2pl_present': 'translate', '3pl_present': 'translate',
        past: 'translated',
      },
      it: {
        // Irregular: the Latin -duc- stem keeps its c in the present and contracts the
        // future/infinitive stem (tradurr-), and the passato remoto is the strong tradussi.
        base: 'tradurre',
        '1sg_present': 'traduco', '2sg_present': 'traduci', '3sg_present': 'traduce',
        '1pl_present': 'traduciamo', '2pl_present': 'traducete', '3pl_present': 'traducono',
        '1sg_past': 'tradussi', '2sg_past': 'traducesti', '3sg_past': 'tradusse',
        '1pl_past': 'traducemmo', '2pl_past': 'traduceste', '3pl_past': 'tradussero',
        '1sg_future': 'tradurrò', '2sg_future': 'tradurrai', '3sg_future': 'tradurrà',
        '1pl_future': 'tradurremo', '2pl_future': 'tradurrete', '3pl_future': 'tradurranno',
      },
      fr: {
        base: 'traduire',
        '1sg_present': 'traduis', '2sg_present': 'traduis', '3sg_present': 'traduit',
        '1pl_present': 'traduisons', '2pl_present': 'traduisez', '3pl_present': 'traduisent',
        '1sg_past': 'traduisis', '2sg_past': 'traduisis', '3sg_past': 'traduisit',
        '1pl_past': 'traduisîmes', '2pl_past': 'traduisîtes', '3pl_past': 'traduisirent',
        '1sg_future': 'traduirai', '2sg_future': 'traduiras', '3sg_future': 'traduira',
        '1pl_future': 'traduirons', '2pl_future': 'traduirez', '3pl_future': 'traduiront',
      },
      de: {
        // Inseparable prefix, so the participle takes no ge- (übersetzt, not *übergesetzt).
        base: 'übersetzen',
        '1sg_present': 'übersetze', '2sg_present': 'übersetzt', '3sg_present': 'übersetzt',
        '1pl_present': 'übersetzen', '2pl_present': 'übersetzt', '3pl_present': 'übersetzen',
        '1sg_past': 'übersetzte', '2sg_past': 'übersetztest', '3sg_past': 'übersetzte',
        '1pl_past': 'übersetzten', '2pl_past': 'übersetztet', '3pl_past': 'übersetzten',
      },
      es: {
        // -ducir: the velar 1sg traduzco and the strong preterite traduje (no accent, -eron).
        base: 'traducir',
        '1sg_present': 'traduzco', '2sg_present': 'traduces', '3sg_present': 'traduce',
        '1pl_present': 'traducimos', '2pl_present': 'traducís', '3pl_present': 'traducen',
        '1sg_past': 'traduje', '2sg_past': 'tradujiste', '3sg_past': 'tradujo',
        '1pl_past': 'tradujimos', '2pl_past': 'tradujisteis', '3pl_past': 'tradujeron',
        '1sg_future': 'traduciré', '2sg_future': 'traducirás', '3sg_future': 'traducirá',
        '1pl_future': 'traduciremos', '2pl_future': 'traduciréis', '3pl_future': 'traducirán',
      },
      ja: {
        base: '翻訳する',
        reading: 'ほんやくする',
        masu_present: '翻訳します',
        masu_present_reading: 'ほんやくします',
        label: '翻訳',
        label_reading: 'ほんやく',
      },
      pt: {
        base: 'traduzir',
        '1sg_present': 'traduzo', '2sg_present': 'traduz', '3sg_present': 'traduz',
        '1pl_present': 'traduzimos', '2pl_present': 'traduzem', '3pl_present': 'traduzem',
        '1sg_past': 'traduzi', '2sg_past': 'traduziu', '3sg_past': 'traduziu',
        '1pl_past': 'traduzimos', '2pl_past': 'traduziram', '3pl_past': 'traduziram',
        '1sg_future': 'traduzirei', '2sg_future': 'traduzirá', '3sg_future': 'traduzirá',
        '1pl_future': 'traduziremos', '2pl_future': 'traduzirão', '3pl_future': 'traduzirão',
      },
    },
  },

  {
    id: 'SAVE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to store something so it can be retrieved later',
    // "to write content to load it": the whole differentia is what the writing is *for*, which is a
    // clause of purpose (C12's PhrasePlan.purpose; localization C19). The pronoun object stands for
    // the content (C20), so each language genders it off its own word: en "it", ja それ, but de
    // "ihn", because *Inhalt* is masculine.
    definition: infinitiveGloss('WRITE', {
      object: 'CONTENT',
      purpose: { verb: 'LOAD', object: 'THIRD_PERSON', antecedent: 'CONTENT' },
    }),
    emoji: '💾',
    forms: {
      en: {
        base: 'save',
        '1sg_present': 'save', '2sg_present': 'save', '3sg_present': 'saves',
        '1pl_present': 'save', '2pl_present': 'save', '3pl_present': 'save',
        past: 'saved',
      },
      it: {
        base: 'salvare',
        '1sg_present': 'salvo', '2sg_present': 'salvi', '3sg_present': 'salva',
        '1pl_present': 'salviamo', '2pl_present': 'salvate', '3pl_present': 'salvano',
        '1sg_past': 'salvai', '2sg_past': 'salvasti', '3sg_past': 'salvò',
        '1pl_past': 'salvammo', '2pl_past': 'salvaste', '3pl_past': 'salvarono',
        '1sg_future': 'salverò', '2sg_future': 'salverai', '3sg_future': 'salverà',
        '1pl_future': 'salveremo', '2pl_future': 'salverete', '3pl_future': 'salveranno',
      },
      fr: {
        base: 'enregistrer',
        '1sg_present': 'enregistre', '2sg_present': 'enregistres', '3sg_present': 'enregistre',
        '1pl_present': 'enregistrons', '2pl_present': 'enregistrez', '3pl_present': 'enregistrent',
        '1sg_past': 'enregistrai', '2sg_past': 'enregistras', '3sg_past': 'enregistra',
        '1pl_past': 'enregistrâmes', '2pl_past': 'enregistrâtes', '3pl_past': 'enregistrèrent',
        '1sg_future': 'enregistrerai', '2sg_future': 'enregistreras', '3sg_future': 'enregistrera',
        '1pl_future': 'enregistrerons', '2pl_future': 'enregistrerez', '3pl_future': 'enregistreront',
      },
      de: {
        base: 'speichern',
        '1sg_present': 'speichere', '2sg_present': 'speicherst', '3sg_present': 'speichert',
        '1pl_present': 'speichern', '2pl_present': 'speichert', '3pl_present': 'speichern',
        '1sg_past': 'speicherte', '2sg_past': 'speichertest', '3sg_past': 'speicherte',
        '1pl_past': 'speicherten', '2pl_past': 'speichertet', '3pl_past': 'speicherten',
      },
      es: {
        base: 'guardar',
        '1sg_present': 'guardo', '2sg_present': 'guardas', '3sg_present': 'guarda',
        '1pl_present': 'guardamos', '2pl_present': 'guardáis', '3pl_present': 'guardan',
        '1sg_past': 'guardé', '2sg_past': 'guardaste', '3sg_past': 'guardó',
        '1pl_past': 'guardamos', '2pl_past': 'guardasteis', '3pl_past': 'guardaron',
        '1sg_future': 'guardaré', '2sg_future': 'guardarás', '3sg_future': 'guardará',
        '1pl_future': 'guardaremos', '2pl_future': 'guardaréis', '3pl_future': 'guardarán',
      },
      ja: {
        base: '保存する',
        reading: 'ほぞんする',
        masu_present: '保存します',
        masu_present_reading: 'ほぞんします',
        label: '保存',
        label_reading: 'ほぞん',
      },
      pt: {
        base: 'salvar',
        '1sg_present': 'salvo', '2sg_present': 'salva', '3sg_present': 'salva',
        '1pl_present': 'salvamos', '2pl_present': 'salvam', '3pl_present': 'salvam',
        '1sg_past': 'salvei', '2sg_past': 'salvou', '3sg_past': 'salvou',
        '1pl_past': 'salvamos', '2pl_past': 'salvaram', '3pl_past': 'salvaram',
        '1sg_future': 'salvarei', '2sg_future': 'salvará', '3sg_future': 'salvará',
        '1pl_future': 'salvaremos', '2pl_future': 'salvarão', '3pl_future': 'salvarão',
      },
    },
  },

  {
    id: 'LOAD',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'source', 'cause'],
    description: 'to bring stored content back in',
    // "to read written content". The literal's "back" is a prior state nothing in the plan model
    // expresses, but it turns out not to be needed: WRITTEN already says the content was put there
    // before, which is the whole of what "back" was carrying (localization C19).
    definition: infinitiveGloss('READ', { object: 'CONTENT', adjectives: ['WRITTEN'] }),
    emoji: '📂',
    forms: {
      en: {
        base: 'load',
        '1sg_present': 'load', '2sg_present': 'load', '3sg_present': 'loads',
        '1pl_present': 'load', '2pl_present': 'load', '3pl_present': 'load',
        past: 'loaded',
      },
      it: {
        base: 'caricare',
        '1sg_present': 'carico', '2sg_present': 'carichi', '3sg_present': 'carica',
        '1pl_present': 'carichiamo', '2pl_present': 'caricate', '3pl_present': 'caricano',
        '1sg_past': 'caricai', '2sg_past': 'caricasti', '3sg_past': 'caricò',
        '1pl_past': 'caricammo', '2pl_past': 'caricaste', '3pl_past': 'caricarono',
        '1sg_future': 'caricherò', '2sg_future': 'caricherai', '3sg_future': 'caricherà',
        '1pl_future': 'caricheremo', '2pl_future': 'caricherete', '3pl_future': 'caricheranno',
      },
      fr: {
        base: 'charger',
        '1sg_present': 'charge', '2sg_present': 'charges', '3sg_present': 'charge',
        '1pl_present': 'chargeons', '2pl_present': 'chargez', '3pl_present': 'chargent',
        '1sg_past': 'chargeai', '2sg_past': 'chargeas', '3sg_past': 'chargea',
        '1pl_past': 'chargeâmes', '2pl_past': 'chargeâtes', '3pl_past': 'chargèrent',
        '1sg_future': 'chargerai', '2sg_future': 'chargeras', '3sg_future': 'chargera',
        '1pl_future': 'chargerons', '2pl_future': 'chargerez', '3pl_future': 'chargeront',
      },
      de: {
        base: 'laden',
        '1sg_present': 'lade', '2sg_present': 'lädst', '3sg_present': 'lädt',
        '1pl_present': 'laden', '2pl_present': 'ladet', '3pl_present': 'laden',
        '1sg_past': 'lud', '2sg_past': 'ludst', '3sg_past': 'lud',
        '1pl_past': 'luden', '2pl_past': 'ludet', '3pl_past': 'luden',
      },
      es: {
        base: 'cargar',
        '1sg_present': 'cargo', '2sg_present': 'cargas', '3sg_present': 'carga',
        '1pl_present': 'cargamos', '2pl_present': 'cargáis', '3pl_present': 'cargan',
        '1sg_past': 'cargué', '2sg_past': 'cargaste', '3sg_past': 'cargó',
        '1pl_past': 'cargamos', '2pl_past': 'cargasteis', '3pl_past': 'cargaron',
        '1sg_future': 'cargaré', '2sg_future': 'cargarás', '3sg_future': 'cargará',
        '1pl_future': 'cargaremos', '2pl_future': 'cargaréis', '3pl_future': 'cargarán',
      },
      ja: {
        base: '読み込む',
        reading: 'よみこむ',
        masu_present: '読み込みます',
        masu_present_reading: 'よみこみます',
        label: '読み込み',
        label_reading: 'よみこみ',
      },
      pt: {
        base: 'carregar',
        '1sg_present': 'carrego', '2sg_present': 'carrega', '3sg_present': 'carrega',
        '1pl_present': 'carregamos', '2pl_present': 'carregam', '3pl_present': 'carregam',
        '1sg_past': 'carreguei', '2sg_past': 'carregou', '3sg_past': 'carregou',
        '1pl_past': 'carregamos', '2pl_past': 'carregaram', '3pl_past': 'carregaram',
        '1sg_future': 'carregarei', '2sg_future': 'carregará', '3sg_future': 'carregará',
        '1pl_future': 'carregaremos', '2pl_future': 'carregarão', '3pl_future': 'carregarão',
      },
    },
  },

  {
    id: 'ADD',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to put something together with something else',
    // "to cause an object to be with other objects": the companion is the **comitative** complement
    // (C12), the one that says "together with" rather than "by means of" — an instrumental would
    // make the other objects the tool (localization C19). Indefinite, because French spells no
    // zero-article plural after a preposition ("avec d'autres objets", not *"avec autres objets").
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      {
        verb: 'BE',
        complements: {
          comitative: {
            phrase: {
              concept: 'OBJECT_THING', number: 'plural', definiteness: 'indefinite', adjectives: ['OTHER'],
            },
          },
        },
      },
    ),
    emoji: '➕',
    forms: {
      en: {
        base: 'add',
        '1sg_present': 'add', '2sg_present': 'add', '3sg_present': 'adds',
        '1pl_present': 'add', '2pl_present': 'add', '3pl_present': 'add',
        past: 'added',
      },
      it: {
        base: 'aggiungere', terminus_tonic: '1',
        '1sg_present': 'aggiungo', '2sg_present': 'aggiungi', '3sg_present': 'aggiunge',
        '1pl_present': 'aggiungiamo', '2pl_present': 'aggiungete', '3pl_present': 'aggiungono',
        '1sg_past': 'aggiunsi', '2sg_past': 'aggiungesti', '3sg_past': 'aggiunse',
        '1pl_past': 'aggiungemmo', '2pl_past': 'aggiungeste', '3pl_past': 'aggiunsero',
        '1sg_future': 'aggiungerò', '2sg_future': 'aggiungerai', '3sg_future': 'aggiungerà',
        '1pl_future': 'aggiungeremo', '2pl_future': 'aggiungerete', '3pl_future': 'aggiungeranno',
      },
      fr: {
        base: 'ajouter', terminus_tonic: '1',
        '1sg_present': 'ajoute', '2sg_present': 'ajoutes', '3sg_present': 'ajoute',
        '1pl_present': 'ajoutons', '2pl_present': 'ajoutez', '3pl_present': 'ajoutent',
        '1sg_past': 'ajoutai', '2sg_past': 'ajoutas', '3sg_past': 'ajouta',
        '1pl_past': 'ajoutâmes', '2pl_past': 'ajoutâtes', '3pl_past': 'ajoutèrent',
        '1sg_future': 'ajouterai', '2sg_future': 'ajouteras', '3sg_future': 'ajoutera',
        '1pl_future': 'ajouterons', '2pl_future': 'ajouterez', '3pl_future': 'ajouteront',
      },
      de: {
        // Putting a thing with others is "hinzufügen"; "addieren" adds numbers up (A138). It is separable:
        // the finite forms are the stem verb's, and the clause places the `particle` — last in a main
        // clause ("fügt eine Maus hinzu"), back on the verb in a subordinate one ("hinzufügt").
        // Its goal is what the thing is added TO, which takes "zu" + dative, not the app's default
        // "in" + accusative — that would read "puts it into the container, in addition" (A143).
        base: 'hinzufügen', particle: 'hinzu', terminus_prep: 'zu',
        '1sg_present': 'füge', '2sg_present': 'fügst', '3sg_present': 'fügt',
        '1pl_present': 'fügen', '2pl_present': 'fügt', '3pl_present': 'fügen',
        '1sg_past': 'fügte', '2sg_past': 'fügtest', '3sg_past': 'fügte',
        '1pl_past': 'fügten', '2pl_past': 'fügtet', '3pl_past': 'fügten',
        '2sg_imperative': 'füge', // the optional du -e, kept
      },
      es: {
        base: 'añadir', terminus_tonic: '1',
        '1sg_present': 'añado', '2sg_present': 'añades', '3sg_present': 'añade',
        '1pl_present': 'añadimos', '2pl_present': 'añadís', '3pl_present': 'añaden',
        '1sg_past': 'añadí', '2sg_past': 'añadiste', '3sg_past': 'añadió',
        '1pl_past': 'añadimos', '2pl_past': 'añadisteis', '3pl_past': 'añadieron',
        '1sg_future': 'añadiré', '2sg_future': 'añadirás', '3sg_future': 'añadirá',
        '1pl_future': 'añadiremos', '2pl_future': 'añadiréis', '3pl_future': 'añadirán',
      },
      ja: {
        base: '加える',
        reading: 'くわえる',
        masu_present: '加えます',
        masu_present_reading: 'くわえます',
        label: '追加',
        label_reading: 'ついか',
      },
      pt: {
        base: 'adicionar',
        '1sg_present': 'adiciono', '2sg_present': 'adiciona', '3sg_present': 'adiciona',
        '1pl_present': 'adicionamos', '2pl_present': 'adicionam', '3pl_present': 'adicionam',
        '1sg_past': 'adicionei', '2sg_past': 'adicionou', '3sg_past': 'adicionou',
        '1pl_past': 'adicionamos', '2pl_past': 'adicionaram', '3pl_past': 'adicionaram',
        '1sg_future': 'adicionarei', '2sg_future': 'adicionará', '3sg_future': 'adicionará',
        '1pl_future': 'adicionaremos', '2pl_future': 'adicionarão', '3pl_future': 'adicionarão',
      },
    },
  },

  {
    // Joining one thing to another: what a conjunction does to clauses (localization B38), and what
    // /and and /join do in the console (B47). Not COORDINATE, whose Japanese 調整する is to adjust.
    // The words keep step with the seeded participle LINKED where the language allows (collegato,
    // relié, verbunden, つながった). German verbinden is strong (verband / verbunden) and joins a thing
    // WITH another: its goal takes "mit" + dative, not the default "in" + accusative (the ADD case).
    id: 'LINK',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'terminus', 'cause'],
    description: 'to join one thing to another',
    emoji: '🔗',
    forms: {
      en: {
        base: 'link',
        '1sg_present': 'link', '2sg_present': 'link', '3sg_present': 'links',
        '1pl_present': 'link', '2pl_present': 'link', '3pl_present': 'link',
        past: 'linked',
      },
      it: {
        base: 'collegare', terminus_tonic: '1',
        '1sg_present': 'collego', '2sg_present': 'colleghi', '3sg_present': 'collega',
        '1pl_present': 'colleghiamo', '2pl_present': 'collegate', '3pl_present': 'collegano',
        '1sg_past': 'collegai', '2sg_past': 'collegasti', '3sg_past': 'collegò',
        '1pl_past': 'collegammo', '2pl_past': 'collegaste', '3pl_past': 'collegarono',
        '1sg_future': 'collegherò', '2sg_future': 'collegherai', '3sg_future': 'collegherà',
        '1pl_future': 'collegheremo', '2pl_future': 'collegherete', '3pl_future': 'collegheranno',
      },
      fr: {
        base: 'relier', terminus_tonic: '1',
        '1sg_present': 'relie', '2sg_present': 'relies', '3sg_present': 'relie',
        '1pl_present': 'relions', '2pl_present': 'reliez', '3pl_present': 'relient',
        '1sg_past': 'reliai', '2sg_past': 'relias', '3sg_past': 'relia',
        '1pl_past': 'reliâmes', '2pl_past': 'reliâtes', '3pl_past': 'relièrent',
        '1sg_future': 'relierai', '2sg_future': 'relieras', '3sg_future': 'reliera',
        '1pl_future': 'relierons', '2pl_future': 'relierez', '3pl_future': 'relieront',
      },
      de: {
        base: 'verbinden', terminus_prep: 'mit',
        '1sg_present': 'verbinde', '2sg_present': 'verbindest', '3sg_present': 'verbindet',
        '1pl_present': 'verbinden', '2pl_present': 'verbindet', '3pl_present': 'verbinden',
        '1sg_past': 'verband', '2sg_past': 'verbandest', '3sg_past': 'verband',
        '1pl_past': 'verbanden', '2pl_past': 'verbandet', '3pl_past': 'verbanden',
      },
      es: {
        base: 'enlazar', terminus_tonic: '1',
        '1sg_present': 'enlazo', '2sg_present': 'enlazas', '3sg_present': 'enlaza',
        '1pl_present': 'enlazamos', '2pl_present': 'enlazáis', '3pl_present': 'enlazan',
        '1sg_past': 'enlacé', '2sg_past': 'enlazaste', '3sg_past': 'enlazó',
        '1pl_past': 'enlazamos', '2pl_past': 'enlazasteis', '3pl_past': 'enlazaron',
        '1sg_future': 'enlazaré', '2sg_future': 'enlazarás', '3sg_future': 'enlazará',
        '1pl_future': 'enlazaremos', '2pl_future': 'enlazaréis', '3pl_future': 'enlazarán',
      },
      ja: {
        base: 'つなぐ',
        reading: 'つなぐ',
        masu_present: 'つなぎます',
        masu_present_reading: 'つなぎます',
      },
      pt: {
        base: 'ligar',
        '1sg_present': 'ligo', '2sg_present': 'liga', '3sg_present': 'liga',
        '1pl_present': 'ligamos', '2pl_present': 'ligam', '3pl_present': 'ligam',
        '1sg_past': 'liguei', '2sg_past': 'ligou', '3sg_past': 'ligou',
        '1pl_past': 'ligamos', '2pl_past': 'ligaram', '3pl_past': 'ligaram',
        '1sg_future': 'ligarei', '2sg_future': 'ligará', '3sg_future': 'ligará',
        '1pl_future': 'ligaremos', '2pl_future': 'ligarão', '3pl_future': 'ligarão',
      },
    },
  },

  {
    id: 'EXPORT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to send content out to another place or format',
    definition: infinitiveGloss('TRANSFER', {
      object: 'CONTENT',
      complements: { direction: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } } },
    }),
    emoji: '📤',
    isA: 'TRANSFER',
    forms: {
      en: {
        base: 'export',
        '1sg_present': 'export', '2sg_present': 'export', '3sg_present': 'exports',
        '1pl_present': 'export', '2pl_present': 'export', '3pl_present': 'export',
        past: 'exported',
      },
      it: {
        base: 'esportare',
        '1sg_present': 'esporto', '2sg_present': 'esporti', '3sg_present': 'esporta',
        '1pl_present': 'esportiamo', '2pl_present': 'esportate', '3pl_present': 'esportano',
        '1sg_past': 'esportai', '2sg_past': 'esportasti', '3sg_past': 'esportò',
        '1pl_past': 'esportammo', '2pl_past': 'esportaste', '3pl_past': 'esportarono',
        '1sg_future': 'esporterò', '2sg_future': 'esporterai', '3sg_future': 'esporterà',
        '1pl_future': 'esporteremo', '2pl_future': 'esporterete', '3pl_future': 'esporteranno',
      },
      fr: {
        base: 'exporter',
        '1sg_present': 'exporte', '2sg_present': 'exportes', '3sg_present': 'exporte',
        '1pl_present': 'exportons', '2pl_present': 'exportez', '3pl_present': 'exportent',
        '1sg_past': 'exportai', '2sg_past': 'exportas', '3sg_past': 'exporta',
        '1pl_past': 'exportâmes', '2pl_past': 'exportâtes', '3pl_past': 'exportèrent',
        '1sg_future': 'exporterai', '2sg_future': 'exporteras', '3sg_future': 'exportera',
        '1pl_future': 'exporterons', '2pl_future': 'exporterez', '3pl_future': 'exporteront',
      },
      de: {
        base: 'exportieren',
        '1sg_present': 'exportiere', '2sg_present': 'exportierst', '3sg_present': 'exportiert',
        '1pl_present': 'exportieren', '2pl_present': 'exportiert', '3pl_present': 'exportieren',
        '1sg_past': 'exportierte', '2sg_past': 'exportiertest', '3sg_past': 'exportierte',
        '1pl_past': 'exportierten', '2pl_past': 'exportiertet', '3pl_past': 'exportierten',
        '2sg_imperative': 'exportiere', // the optional du -e, kept
      },
      es: {
        base: 'exportar',
        '1sg_present': 'exporto', '2sg_present': 'exportas', '3sg_present': 'exporta',
        '1pl_present': 'exportamos', '2pl_present': 'exportáis', '3pl_present': 'exportan',
        '1sg_past': 'exporté', '2sg_past': 'exportaste', '3sg_past': 'exportó',
        '1pl_past': 'exportamos', '2pl_past': 'exportasteis', '3pl_past': 'exportaron',
        '1sg_future': 'exportaré', '2sg_future': 'exportarás', '3sg_future': 'exportará',
        '1pl_future': 'exportaremos', '2pl_future': 'exportaréis', '3pl_future': 'exportarán',
      },
      ja: {
        base: '書き出す',
        reading: 'かきだす',
        masu_present: '書き出します',
        masu_present_reading: 'かきだします',
        label: '書き出し',
        label_reading: 'かきだし',
      },
      pt: {
        base: 'exportar',
        '1sg_present': 'exporto', '2sg_present': 'exporta', '3sg_present': 'exporta',
        '1pl_present': 'exportamos', '2pl_present': 'exportam', '3pl_present': 'exportam',
        '1sg_past': 'exportei', '2sg_past': 'exportou', '3sg_past': 'exportou',
        '1pl_past': 'exportamos', '2pl_past': 'exportaram', '3pl_past': 'exportaram',
        '1sg_future': 'exportarei', '2sg_future': 'exportará', '3sg_future': 'exportará',
        '1pl_future': 'exportaremos', '2pl_future': 'exportarão', '3pl_future': 'exportarão',
      },
    },
  },

  {
    // PROGRAM_SHOW's differentia (localization B65): "to send content to many people", beside SEND
    // ("to transfer objects to a place") and EXPORT, which it does not restate. German is the
    // separable ausstrahlen, like ADD's hinzufügen ("strahlt die Sendung aus", "die man ausstrahlt"),
    // not senden, which is the root of Sendung itself. Japanese 放送する is a suru compound, and
    // Italian trasmettere is mettere's compound (trasmise, trasmesso).
    id: 'BROADCAST',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to send out a program on radio or television',
    definition: infinitiveGloss('SEND', {
      object: 'CONTENT',
      complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'many', number: 'plural' } } },
    }),
    emoji: '📡',
    forms: {
      en: {
        base: 'broadcast',
        '1sg_present': 'broadcast', '2sg_present': 'broadcast', '3sg_present': 'broadcasts',
        '1pl_present': 'broadcast', '2pl_present': 'broadcast', '3pl_present': 'broadcast',
        past: 'broadcast',
      },
      it: {
        base: 'trasmettere',
        '1sg_present': 'trasmetto', '2sg_present': 'trasmetti', '3sg_present': 'trasmette',
        '1pl_present': 'trasmettiamo', '2pl_present': 'trasmettete', '3pl_present': 'trasmettono',
        '1sg_past': 'trasmisi', '2sg_past': 'trasmettesti', '3sg_past': 'trasmise',
        '1pl_past': 'trasmettemmo', '2pl_past': 'trasmetteste', '3pl_past': 'trasmisero',
        '1sg_future': 'trasmetterò', '2sg_future': 'trasmetterai', '3sg_future': 'trasmetterà',
        '1pl_future': 'trasmetteremo', '2pl_future': 'trasmetterete', '3pl_future': 'trasmetteranno',
      },
      fr: {
        base: 'diffuser',
        '1sg_present': 'diffuse', '2sg_present': 'diffuses', '3sg_present': 'diffuse',
        '1pl_present': 'diffusons', '2pl_present': 'diffusez', '3pl_present': 'diffusent',
        '1sg_past': 'diffusai', '2sg_past': 'diffusas', '3sg_past': 'diffusa',
        '1pl_past': 'diffusâmes', '2pl_past': 'diffusâtes', '3pl_past': 'diffusèrent',
        '1sg_future': 'diffuserai', '2sg_future': 'diffuseras', '3sg_future': 'diffusera',
        '1pl_future': 'diffuserons', '2pl_future': 'diffuserez', '3pl_future': 'diffuseront',
      },
      de: {
        // Separable: the finite forms are strahlen's, and the clause places the particle.
        base: 'ausstrahlen', particle: 'aus',
        '1sg_present': 'strahle', '2sg_present': 'strahlst', '3sg_present': 'strahlt',
        '1pl_present': 'strahlen', '2pl_present': 'strahlt', '3pl_present': 'strahlen',
        '1sg_past': 'strahlte', '2sg_past': 'strahltest', '3sg_past': 'strahlte',
        '1pl_past': 'strahlten', '2pl_past': 'strahltet', '3pl_past': 'strahlten',
        '2sg_imperative': 'strahle', // the optional du -e, kept
      },
      es: {
        base: 'emitir',
        '1sg_present': 'emito', '2sg_present': 'emites', '3sg_present': 'emite',
        '1pl_present': 'emitimos', '2pl_present': 'emitís', '3pl_present': 'emiten',
        '1sg_past': 'emití', '2sg_past': 'emitiste', '3sg_past': 'emitió',
        '1pl_past': 'emitimos', '2pl_past': 'emitisteis', '3pl_past': 'emitieron',
        '1sg_future': 'emitiré', '2sg_future': 'emitirás', '3sg_future': 'emitirá',
        '1pl_future': 'emitiremos', '2pl_future': 'emitiréis', '3pl_future': 'emitirán',
      },
      ja: {
        base: '放送する',
        reading: 'ほうそうする',
        masu_present: '放送します',
        masu_present_reading: 'ほうそうします',
      },
      pt: {
        base: 'transmitir',
        '1sg_present': 'transmito', '2sg_present': 'transmite', '3sg_present': 'transmite',
        '1pl_present': 'transmitimos', '2pl_present': 'transmitem', '3pl_present': 'transmitem',
        '1sg_past': 'transmiti', '2sg_past': 'transmitiu', '3sg_past': 'transmitiu',
        '1pl_past': 'transmitimos', '2pl_past': 'transmitiram', '3pl_past': 'transmitiram',
        '1sg_future': 'transmitirei', '2sg_future': 'transmitirá', '3sg_future': 'transmitirá',
        '1pl_future': 'transmitiremos', '2pl_future': 'transmitirão', '3pl_future': 'transmitirão',
      },
    },
  },

  {
    id: 'IMPORT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'source', 'cause'],
    description: 'to bring content in from another place or format',
    definition: infinitiveGloss('TRANSFER', {
      object: 'CONTENT',
      complements: { source: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } } },
    }),
    emoji: '📥',
    isA: 'TRANSFER',
    forms: {
      en: {
        base: 'import',
        '1sg_present': 'import', '2sg_present': 'import', '3sg_present': 'imports',
        '1pl_present': 'import', '2pl_present': 'import', '3pl_present': 'import',
        past: 'imported',
      },
      it: {
        base: 'importare',
        '1sg_present': 'importo', '2sg_present': 'importi', '3sg_present': 'importa',
        '1pl_present': 'importiamo', '2pl_present': 'importate', '3pl_present': 'importano',
        '1sg_past': 'importai', '2sg_past': 'importasti', '3sg_past': 'importò',
        '1pl_past': 'importammo', '2pl_past': 'importaste', '3pl_past': 'importarono',
        '1sg_future': 'importerò', '2sg_future': 'importerai', '3sg_future': 'importerà',
        '1pl_future': 'importeremo', '2pl_future': 'importerete', '3pl_future': 'importeranno',
      },
      fr: {
        base: 'importer',
        '1sg_present': 'importe', '2sg_present': 'importes', '3sg_present': 'importe',
        '1pl_present': 'importons', '2pl_present': 'importez', '3pl_present': 'importent',
        '1sg_past': 'importai', '2sg_past': 'importas', '3sg_past': 'importa',
        '1pl_past': 'importâmes', '2pl_past': 'importâtes', '3pl_past': 'importèrent',
        '1sg_future': 'importerai', '2sg_future': 'importeras', '3sg_future': 'importera',
        '1pl_future': 'importerons', '2pl_future': 'importerez', '3pl_future': 'importeront',
      },
      de: {
        base: 'importieren',
        '1sg_present': 'importiere', '2sg_present': 'importierst', '3sg_present': 'importiert',
        '1pl_present': 'importieren', '2pl_present': 'importiert', '3pl_present': 'importieren',
        '1sg_past': 'importierte', '2sg_past': 'importiertest', '3sg_past': 'importierte',
        '1pl_past': 'importierten', '2pl_past': 'importiertet', '3pl_past': 'importierten',
        '2sg_imperative': 'importiere', // the optional du -e, kept
      },
      es: {
        base: 'importar',
        '1sg_present': 'importo', '2sg_present': 'importas', '3sg_present': 'importa',
        '1pl_present': 'importamos', '2pl_present': 'importáis', '3pl_present': 'importan',
        '1sg_past': 'importé', '2sg_past': 'importaste', '3sg_past': 'importó',
        '1pl_past': 'importamos', '2pl_past': 'importasteis', '3pl_past': 'importaron',
        '1sg_future': 'importaré', '2sg_future': 'importarás', '3sg_future': 'importará',
        '1pl_future': 'importaremos', '2pl_future': 'importaréis', '3pl_future': 'importarán',
      },
      ja: {
        base: '取り込む',
        reading: 'とりこむ',
        masu_present: '取り込みます',
        masu_present_reading: 'とりこみます',
        label: '取り込み',
        label_reading: 'とりこみ',
      },
      pt: {
        base: 'importar',
        '1sg_present': 'importo', '2sg_present': 'importa', '3sg_present': 'importa',
        '1pl_present': 'importamos', '2pl_present': 'importam', '3pl_present': 'importam',
        '1sg_past': 'importei', '2sg_past': 'importou', '3sg_past': 'importou',
        '1pl_past': 'importamos', '2pl_past': 'importaram', '3pl_past': 'importaram',
        '1sg_future': 'importarei', '2sg_future': 'importará', '3sg_future': 'importará',
        '1pl_future': 'importaremos', '2pl_future': 'importarão', '3pl_future': 'importarão',
      },
    },
  },

  {
    id: 'CLEAR',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to empty something of its contents',
    definition: infinitiveGloss('DESTROY', 'CONTENT'),
    emoji: '🧹',
    forms: {
      en: {
        base: 'clear',
        '1sg_present': 'clear', '2sg_present': 'clear', '3sg_present': 'clears',
        '1pl_present': 'clear', '2pl_present': 'clear', '3pl_present': 'clear',
        past: 'cleared',
      },
      it: {
        base: 'cancellare',
        '1sg_present': 'cancello', '2sg_present': 'cancelli', '3sg_present': 'cancella',
        '1pl_present': 'cancelliamo', '2pl_present': 'cancellate', '3pl_present': 'cancellano',
        '1sg_past': 'cancellai', '2sg_past': 'cancellasti', '3sg_past': 'cancellò',
        '1pl_past': 'cancellammo', '2pl_past': 'cancellaste', '3pl_past': 'cancellarono',
        '1sg_future': 'cancellerò', '2sg_future': 'cancellerai', '3sg_future': 'cancellerà',
        '1pl_future': 'cancelleremo', '2pl_future': 'cancellerete', '3pl_future': 'cancelleranno',
      },
      fr: {
        base: 'effacer',
        '1sg_present': 'efface', '2sg_present': 'effaces', '3sg_present': 'efface',
        '1pl_present': 'effaçons', '2pl_present': 'effacez', '3pl_present': 'effacent',
        '1sg_past': 'effaçai', '2sg_past': 'effaças', '3sg_past': 'effaça',
        '1pl_past': 'effaçâmes', '2pl_past': 'effaçâtes', '3pl_past': 'effacèrent',
        '1sg_future': 'effacerai', '2sg_future': 'effaceras', '3sg_future': 'effacera',
        '1pl_future': 'effacerons', '2pl_future': 'effacerez', '3pl_future': 'effaceront',
      },
      de: {
        base: 'löschen',
        '1sg_present': 'lösche', '2sg_present': 'löschst', '3sg_present': 'löscht',
        '1pl_present': 'löschen', '2pl_present': 'löscht', '3pl_present': 'löschen',
        '1sg_past': 'löschte', '2sg_past': 'löschtest', '3sg_past': 'löschte',
        '1pl_past': 'löschten', '2pl_past': 'löschtet', '3pl_past': 'löschten',
        '2sg_imperative': 'lösche', // the optional du -e, kept
      },
      es: {
        base: 'borrar',
        '1sg_present': 'borro', '2sg_present': 'borras', '3sg_present': 'borra',
        '1pl_present': 'borramos', '2pl_present': 'borráis', '3pl_present': 'borran',
        '1sg_past': 'borré', '2sg_past': 'borraste', '3sg_past': 'borró',
        '1pl_past': 'borramos', '2pl_past': 'borrasteis', '3pl_past': 'borraron',
        '1sg_future': 'borraré', '2sg_future': 'borrarás', '3sg_future': 'borrará',
        '1pl_future': 'borraremos', '2pl_future': 'borraréis', '3pl_future': 'borrarán',
      },
      ja: {
        base: '消去する',
        reading: 'しょうきょする',
        masu_present: '消去します',
        masu_present_reading: 'しょうきょします',
        label: '消去',
        label_reading: 'しょうきょ',
      },
      pt: {
        base: 'limpar',
        '1sg_present': 'limpo', '2sg_present': 'limpa', '3sg_present': 'limpa',
        '1pl_present': 'limpamos', '2pl_present': 'limpam', '3pl_present': 'limpam',
        '1sg_past': 'limpei', '2sg_past': 'limpou', '3sg_past': 'limpou',
        '1pl_past': 'limpamos', '2pl_past': 'limparam', '3pl_past': 'limparam',
        '1sg_future': 'limparei', '2sg_future': 'limpará', '3sg_future': 'limpará',
        '1pl_future': 'limparemos', '2pl_future': 'limparão', '3pl_future': 'limparão',
      },
    },
  },

  // REMOVE and DELETE are two verbs, not one, because the languages split them. REMOVE takes a thing
  // away from where it is and can be undone: it rimuovere, fr retirer, de entfernen, es quitar, pt
  // remover. DELETE erases a stored record for good: it eliminare, fr supprimer, es eliminar, pt excluir,
  // ja 削除する. CLEAR (above) is neither: it empties a thing and leaves it in place.
  // German DELETE is löschen, the verb CLEAR already uses. German says both with it, and the
  // controls that use the two never share a screen.
  {
    id: 'REMOVE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'source', 'cause', 'locative'],
    description: 'to take something away from where it is',
    // "to cause an object to leave a place" (localization C28): the causative of LEAVE, whose
    // Italian, Spanish and Portuguese words (uscire, salir, sair) are going *out of*, which is what
    // taking a thing away is. DELETE's "to remove objects" stands on it.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'LEAVE', object: 'PLACE', definiteness: 'indefinite' },
    ),
    emoji: '➖',
    forms: {
      en: {
        base: 'remove',
        '1sg_present': 'remove', '2sg_present': 'remove', '3sg_present': 'removes',
        '1pl_present': 'remove', '2pl_present': 'remove', '3pl_present': 'remove',
        past: 'removed',
      },
      it: {
        base: 'rimuovere',
        '1sg_present': 'rimuovo', '2sg_present': 'rimuovi', '3sg_present': 'rimuove',
        '1pl_present': 'rimuoviamo', '2pl_present': 'rimuovete', '3pl_present': 'rimuovono',
        '1sg_past': 'rimossi', '2sg_past': 'rimuovesti', '3sg_past': 'rimosse',
        '1pl_past': 'rimuovemmo', '2pl_past': 'rimuoveste', '3pl_past': 'rimossero',
        '1sg_future': 'rimuoverò', '2sg_future': 'rimuoverai', '3sg_future': 'rimuoverà',
        '1pl_future': 'rimuoveremo', '2pl_future': 'rimuoverete', '3pl_future': 'rimuoveranno',
      },
      fr: {
        base: 'retirer',
        '1sg_present': 'retire', '2sg_present': 'retires', '3sg_present': 'retire',
        '1pl_present': 'retirons', '2pl_present': 'retirez', '3pl_present': 'retirent',
        '1sg_past': 'retirai', '2sg_past': 'retiras', '3sg_past': 'retira',
        '1pl_past': 'retirâmes', '2pl_past': 'retirâtes', '3pl_past': 'retirèrent',
        '1sg_future': 'retirerai', '2sg_future': 'retireras', '3sg_future': 'retirera',
        '1pl_future': 'retirerons', '2pl_future': 'retirerez', '3pl_future': 'retireront',
      },
      de: {
        base: 'entfernen',
        '1sg_present': 'entferne', '2sg_present': 'entfernst', '3sg_present': 'entfernt',
        '1pl_present': 'entfernen', '2pl_present': 'entfernt', '3pl_present': 'entfernen',
        '1sg_past': 'entfernte', '2sg_past': 'entferntest', '3sg_past': 'entfernte',
        '1pl_past': 'entfernten', '2pl_past': 'entferntet', '3pl_past': 'entfernten',
        '2sg_imperative': 'entferne', // the optional du -e, kept
      },
      es: {
        base: 'quitar',
        '1sg_present': 'quito', '2sg_present': 'quitas', '3sg_present': 'quita',
        '1pl_present': 'quitamos', '2pl_present': 'quitáis', '3pl_present': 'quitan',
        '1sg_past': 'quité', '2sg_past': 'quitaste', '3sg_past': 'quitó',
        '1pl_past': 'quitamos', '2pl_past': 'quitasteis', '3pl_past': 'quitaron',
        '1sg_future': 'quitaré', '2sg_future': 'quitarás', '3sg_future': 'quitará',
        '1pl_future': 'quitaremos', '2pl_future': 'quitaréis', '3pl_future': 'quitarán',
      },
      ja: {
        base: '取り除く',
        reading: 'とりのぞく',
        masu_present: '取り除きます',
        masu_present_reading: 'とりのぞきます',
      },
      pt: {
        base: 'remover',
        '1sg_present': 'removo', '2sg_present': 'remove', '3sg_present': 'remove',
        '1pl_present': 'removemos', '2pl_present': 'removem', '3pl_present': 'removem',
        '1sg_past': 'removi', '2sg_past': 'removeu', '3sg_past': 'removeu',
        '1pl_past': 'removemos', '2pl_past': 'removeram', '3pl_past': 'removeram',
        '1sg_future': 'removerei', '2sg_future': 'removerá', '3sg_future': 'removerá',
        '1pl_future': 'removeremos', '2pl_future': 'removerão', '3pl_future': 'removerão',
      },
    },
  },

  {
    id: 'DELETE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'source', 'cause'],
    description: 'to erase something permanently',
    definition: infinitiveGloss('REMOVE', 'OBJECT_THING', 'plural'),
    emoji: '🗑️',
    forms: {
      en: {
        base: 'delete',
        '1sg_present': 'delete', '2sg_present': 'delete', '3sg_present': 'deletes',
        '1pl_present': 'delete', '2pl_present': 'delete', '3pl_present': 'delete',
        past: 'deleted',
      },
      it: {
        base: 'eliminare',
        '1sg_present': 'elimino', '2sg_present': 'elimini', '3sg_present': 'elimina',
        '1pl_present': 'eliminiamo', '2pl_present': 'eliminate', '3pl_present': 'eliminano',
        '1sg_past': 'eliminai', '2sg_past': 'eliminasti', '3sg_past': 'eliminò',
        '1pl_past': 'eliminammo', '2pl_past': 'eliminaste', '3pl_past': 'eliminarono',
        '1sg_future': 'eliminerò', '2sg_future': 'eliminerai', '3sg_future': 'eliminerà',
        '1pl_future': 'elimineremo', '2pl_future': 'eliminerete', '3pl_future': 'elimineranno',
      },
      fr: {
        base: 'supprimer',
        '1sg_present': 'supprime', '2sg_present': 'supprimes', '3sg_present': 'supprime',
        '1pl_present': 'supprimons', '2pl_present': 'supprimez', '3pl_present': 'suppriment',
        '1sg_past': 'supprimai', '2sg_past': 'supprimas', '3sg_past': 'supprima',
        '1pl_past': 'supprimâmes', '2pl_past': 'supprimâtes', '3pl_past': 'supprimèrent',
        '1sg_future': 'supprimerai', '2sg_future': 'supprimeras', '3sg_future': 'supprimera',
        '1pl_future': 'supprimerons', '2pl_future': 'supprimerez', '3pl_future': 'supprimeront',
      },
      de: {
        base: 'löschen',
        '1sg_present': 'lösche', '2sg_present': 'löschst', '3sg_present': 'löscht',
        '1pl_present': 'löschen', '2pl_present': 'löscht', '3pl_present': 'löschen',
        '1sg_past': 'löschte', '2sg_past': 'löschtest', '3sg_past': 'löschte',
        '1pl_past': 'löschten', '2pl_past': 'löschtet', '3pl_past': 'löschten',
        '2sg_imperative': 'lösche', // the optional du -e, kept
      },
      es: {
        base: 'eliminar',
        '1sg_present': 'elimino', '2sg_present': 'eliminas', '3sg_present': 'elimina',
        '1pl_present': 'eliminamos', '2pl_present': 'elimináis', '3pl_present': 'eliminan',
        '1sg_past': 'eliminé', '2sg_past': 'eliminaste', '3sg_past': 'eliminó',
        '1pl_past': 'eliminamos', '2pl_past': 'eliminasteis', '3pl_past': 'eliminaron',
        '1sg_future': 'eliminaré', '2sg_future': 'eliminarás', '3sg_future': 'eliminará',
        '1pl_future': 'eliminaremos', '2pl_future': 'eliminaréis', '3pl_future': 'eliminarán',
      },
      ja: {
        base: '削除する',
        reading: 'さくじょする',
        masu_present: '削除します',
        masu_present_reading: 'さくじょします',
        label: '削除',
        label_reading: 'さくじょ',
      },
      pt: {
        base: 'excluir',
        '1sg_present': 'excluo', '2sg_present': 'exclui', '3sg_present': 'exclui',
        '1pl_present': 'excluímos', '2pl_present': 'excluem', '3pl_present': 'excluem',
        '1sg_past': 'excluí', '2sg_past': 'excluiu', '3sg_past': 'excluiu',
        '1pl_past': 'excluímos', '2pl_past': 'excluíram', '3pl_past': 'excluíram',
        '1sg_future': 'excluirei', '2sg_future': 'excluirá', '3sg_future': 'excluirá',
        '1pl_future': 'excluiremos', '2pl_future': 'excluirão', '3pl_future': 'excluirão',
      },
    },
  },

  {
    id: 'COORDINATE',
    role: 'verb',
    transitivity: 'transitive',
    // A comitative: one coordinates one thing *with* another, and the other is a companion in the
    // act, not the means of it (localization C12).
    complements: ['comitative', 'manner', 'cause', 'locative', 'instrumental'],
    description: 'to make separate parts or people work together',
    // The causative of acting together: what is coordinated is not acted on, it is brought to act
    // (localization C08). PERSON is the "or people" half of the description; the adverb carries the
    // "together" that is the whole point of the verb.
    definition: causativeGloss({ object: 'PERSON', number: 'plural' }, { verb: 'ACT', modifier: 'TOGETHER' }),
    emoji: '🎛️',
    forms: {
      en: {
        base: 'coordinate',
        '1sg_present': 'coordinate', '2sg_present': 'coordinate', '3sg_present': 'coordinates',
        '1pl_present': 'coordinate', '2pl_present': 'coordinate', '3pl_present': 'coordinate',
        past: 'coordinated',
      },
      it: {
        base: 'coordinare',
        '1sg_present': 'coordino', '2sg_present': 'coordini', '3sg_present': 'coordina',
        '1pl_present': 'coordiniamo', '2pl_present': 'coordinate', '3pl_present': 'coordinano',
        '1sg_past': 'coordinai', '2sg_past': 'coordinasti', '3sg_past': 'coordinò',
        '1pl_past': 'coordinammo', '2pl_past': 'coordinaste', '3pl_past': 'coordinarono',
        '1sg_future': 'coordinerò', '2sg_future': 'coordinerai', '3sg_future': 'coordinerà',
        '1pl_future': 'coordineremo', '2pl_future': 'coordinerete', '3pl_future': 'coordineranno',
      },
      fr: {
        base: 'coordonner',
        '1sg_present': 'coordonne', '2sg_present': 'coordonnes', '3sg_present': 'coordonne',
        '1pl_present': 'coordonnons', '2pl_present': 'coordonnez', '3pl_present': 'coordonnent',
        '1sg_past': 'coordonnai', '2sg_past': 'coordonnas', '3sg_past': 'coordonna',
        '1pl_past': 'coordonnâmes', '2pl_past': 'coordonnâtes', '3pl_past': 'coordonnèrent',
        '1sg_future': 'coordonnerai', '2sg_future': 'coordonneras', '3sg_future': 'coordonnera',
        '1pl_future': 'coordonnerons', '2pl_future': 'coordonnerez', '3pl_future': 'coordonneront',
      },
      de: {
        base: 'koordinieren',
        '1sg_present': 'koordiniere', '2sg_present': 'koordinierst', '3sg_present': 'koordiniert',
        '1pl_present': 'koordinieren', '2pl_present': 'koordiniert', '3pl_present': 'koordinieren',
        '1sg_past': 'koordinierte', '2sg_past': 'koordiniertest', '3sg_past': 'koordinierte',
        '1pl_past': 'koordinierten', '2pl_past': 'koordiniertet', '3pl_past': 'koordinierten',
        '2sg_imperative': 'koordiniere', // the optional du -e, kept
      },
      es: {
        base: 'coordinar',
        '1sg_present': 'coordino', '2sg_present': 'coordinas', '3sg_present': 'coordina',
        '1pl_present': 'coordinamos', '2pl_present': 'coordináis', '3pl_present': 'coordinan',
        '1sg_past': 'coordiné', '2sg_past': 'coordinaste', '3sg_past': 'coordinó',
        '1pl_past': 'coordinamos', '2pl_past': 'coordinasteis', '3pl_past': 'coordinaron',
        '1sg_future': 'coordinaré', '2sg_future': 'coordinarás', '3sg_future': 'coordinará',
        '1pl_future': 'coordinaremos', '2pl_future': 'coordinaréis', '3pl_future': 'coordinarán',
      },
      ja: {
        base: '調整する',
        reading: 'ちょうせいする',
        masu_present: '調整します',
        masu_present_reading: 'ちょうせいします',
        label: '調整',
        label_reading: 'ちょうせい',
      },
      pt: {
        base: 'coordenar',
        '1sg_present': 'coordeno', '2sg_present': 'coordena', '3sg_present': 'coordena',
        '1pl_present': 'coordenamos', '2pl_present': 'coordenam', '3pl_present': 'coordenam',
        '1sg_past': 'coordenei', '2sg_past': 'coordenou', '3sg_past': 'coordenou',
        '1pl_past': 'coordenamos', '2pl_past': 'coordenaram', '3pl_past': 'coordenaram',
        '1sg_future': 'coordenarei', '2sg_future': 'coordenará', '3sg_future': 'coordenará',
        '1pl_future': 'coordenaremos', '2pl_future': 'coordenarão', '3pl_future': 'coordenarão',
      },
    },
  },

  {
    id: 'TIDY_UP',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to put back in order what was left in a mess',
    // "to cause objects to be tidy". The literal wants a prior state ("back") the plan model has no
    // room for, and "in order" cannot be said with the seeded ORDER, which is the *command* sense
    // (de "Befehl", ja 命令). TIDY carries the state instead, and the causative says who puts things
    // into it — the C08 shape HIDE already takes (localization C19).
    definition: causativeGloss(
      { object: 'OBJECT_THING', number: 'plural' },
      { verb: 'BE', predicate: 'TIDY' },
    ),
    emoji: '🧹',
    forms: {
      en: {
        // phrasal, like EXTINGUISH: "tidies up the room", "tidies it up".
        base: 'tidy up',
        '1sg_present': 'tidy up', '2sg_present': 'tidy up', '3sg_present': 'tidies up',
        '1pl_present': 'tidy up', '2pl_present': 'tidy up', '3pl_present': 'tidy up',
        past: 'tidied up',
        particle: 'up',
      },
      it: {
        base: 'riordinare',
        '1sg_present': 'riordino', '2sg_present': 'riordini', '3sg_present': 'riordina',
        '1pl_present': 'riordiniamo', '2pl_present': 'riordinate', '3pl_present': 'riordinano',
        '1sg_past': 'riordinai', '2sg_past': 'riordinasti', '3sg_past': 'riordinò',
        '1pl_past': 'riordinammo', '2pl_past': 'riordinaste', '3pl_past': 'riordinarono',
        '1sg_future': 'riordinerò', '2sg_future': 'riordinerai', '3sg_future': 'riordinerà',
        '1pl_future': 'riordineremo', '2pl_future': 'riordinerete', '3pl_future': 'riordineranno',
      },
      fr: {
        base: 'ranger',
        '1sg_present': 'range', '2sg_present': 'ranges', '3sg_present': 'range',
        '1pl_present': 'rangeons', '2pl_present': 'rangez', '3pl_present': 'rangent',
        '1sg_past': 'rangeai', '2sg_past': 'rangeas', '3sg_past': 'rangea',
        '1pl_past': 'rangeâmes', '2pl_past': 'rangeâtes', '3pl_past': 'rangèrent',
        '1sg_future': 'rangerai', '2sg_future': 'rangeras', '3sg_future': 'rangera',
        '1pl_future': 'rangerons', '2pl_future': 'rangerez', '3pl_future': 'rangeront',
      },
      de: {
        // "aufräumen" is the idiomatic verb, but its prefix separates ("räumt auf"), which the
        // clause builder cannot place; "ordnen" is regular and stays whole.
        base: 'ordnen',
        '1sg_present': 'ordne', '2sg_present': 'ordnest', '3sg_present': 'ordnet',
        '1pl_present': 'ordnen', '2pl_present': 'ordnet', '3pl_present': 'ordnen',
        '1sg_past': 'ordnete', '2sg_past': 'ordnetest', '3sg_past': 'ordnete',
        '1pl_past': 'ordneten', '2pl_past': 'ordnetet', '3pl_past': 'ordneten',
      },
      es: {
        base: 'ordenar',
        '1sg_present': 'ordeno', '2sg_present': 'ordenas', '3sg_present': 'ordena',
        '1pl_present': 'ordenamos', '2pl_present': 'ordenáis', '3pl_present': 'ordenan',
        '1sg_past': 'ordené', '2sg_past': 'ordenaste', '3sg_past': 'ordenó',
        '1pl_past': 'ordenamos', '2pl_past': 'ordenasteis', '3pl_past': 'ordenaron',
        '1sg_future': 'ordenaré', '2sg_future': 'ordenarás', '3sg_future': 'ordenará',
        '1pl_future': 'ordenaremos', '2pl_future': 'ordenaréis', '3pl_future': 'ordenarán',
      },
      ja: {
        base: '片付ける',
        reading: 'かたづける',
        masu_present: '片付けます',
        masu_present_reading: 'かたづけます',
      },
      pt: {
        base: 'arrumar',
        '1sg_present': 'arrumo', '2sg_present': 'arruma', '3sg_present': 'arruma',
        '1pl_present': 'arrumamos', '2pl_present': 'arrumam', '3pl_present': 'arrumam',
        '1sg_past': 'arrumei', '2sg_past': 'arrumou', '3sg_past': 'arrumou',
        '1pl_past': 'arrumamos', '2pl_past': 'arrumaram', '3pl_past': 'arrumaram',
        '1sg_future': 'arrumarei', '2sg_future': 'arrumará', '3sg_future': 'arrumará',
        '1pl_future': 'arrumaremos', '2pl_future': 'arrumarão', '3pl_future': 'arrumarão',
      },
    },
  },

  {
    id: 'COMPACT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to press something into a smaller space without losing what it holds',
    // The resultative "into a smaller space" said as the state it leaves the thing in: the object
    // comes to be smaller (localization C08). The degree is the comparative — a compacted thing is
    // smaller than it was, not small.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BECOME', predicate: 'SMALL', predicateDegree: 'more' },
    ),
    emoji: '🗜️',
    synonym: 'compress',
    forms: {
      en: {
        base: 'compact',
        '1sg_present': 'compact', '2sg_present': 'compact', '3sg_present': 'compacts',
        '1pl_present': 'compact', '2pl_present': 'compact', '3pl_present': 'compact',
        past: 'compacted',
      },
      it: {
        base: 'compattare',
        '1sg_present': 'compatto', '2sg_present': 'compatti', '3sg_present': 'compatta',
        '1pl_present': 'compattiamo', '2pl_present': 'compattate', '3pl_present': 'compattano',
        '1sg_past': 'compattai', '2sg_past': 'compattasti', '3sg_past': 'compattò',
        '1pl_past': 'compattammo', '2pl_past': 'compattaste', '3pl_past': 'compattarono',
        '1sg_future': 'compatterò', '2sg_future': 'compatterai', '3sg_future': 'compatterà',
        '1pl_future': 'compatteremo', '2pl_future': 'compatterete', '3pl_future': 'compatteranno',
      },
      fr: {
        base: 'compacter',
        '1sg_present': 'compacte', '2sg_present': 'compactes', '3sg_present': 'compacte',
        '1pl_present': 'compactons', '2pl_present': 'compactez', '3pl_present': 'compactent',
        '1sg_past': 'compactai', '2sg_past': 'compactas', '3sg_past': 'compacta',
        '1pl_past': 'compactâmes', '2pl_past': 'compactâtes', '3pl_past': 'compactèrent',
        '1sg_future': 'compacterai', '2sg_future': 'compacteras', '3sg_future': 'compactera',
        '1pl_future': 'compacterons', '2pl_future': 'compacterez', '3pl_future': 'compacteront',
      },
      de: {
        // "zusammenfassen" is closer for text, but its prefix separates ("fasst zusammen"), which
        // the clause builder cannot place; "verdichten" is inseparable and stays whole.
        base: 'verdichten',
        '1sg_present': 'verdichte', '2sg_present': 'verdichtest', '3sg_present': 'verdichtet',
        '1pl_present': 'verdichten', '2pl_present': 'verdichtet', '3pl_present': 'verdichten',
        '1sg_past': 'verdichtete', '2sg_past': 'verdichtetest', '3sg_past': 'verdichtete',
        '1pl_past': 'verdichteten', '2pl_past': 'verdichtetet', '3pl_past': 'verdichteten',
      },
      es: {
        base: 'compactar',
        '1sg_present': 'compacto', '2sg_present': 'compactas', '3sg_present': 'compacta',
        '1pl_present': 'compactamos', '2pl_present': 'compactáis', '3pl_present': 'compactan',
        '1sg_past': 'compacté', '2sg_past': 'compactaste', '3sg_past': 'compactó',
        '1pl_past': 'compactamos', '2pl_past': 'compactasteis', '3pl_past': 'compactaron',
        '1sg_future': 'compactaré', '2sg_future': 'compactarás', '3sg_future': 'compactará',
        '1pl_future': 'compactaremos', '2pl_future': 'compactaréis', '3pl_future': 'compactarán',
      },
      ja: {
        base: '圧縮する',
        reading: 'あっしゅくする',
        masu_present: '圧縮します',
        masu_present_reading: 'あっしゅくします',
      },
      pt: {
        base: 'compactar',
        '1sg_present': 'compacto', '2sg_present': 'compacta', '3sg_present': 'compacta',
        '1pl_present': 'compactamos', '2pl_present': 'compactam', '3pl_present': 'compactam',
        '1sg_past': 'compactei', '2sg_past': 'compactou', '3sg_past': 'compactou',
        '1pl_past': 'compactamos', '2pl_past': 'compactaram', '3pl_past': 'compactaram',
        '1sg_future': 'compactarei', '2sg_future': 'compactará', '3sg_future': 'compactará',
        '1pl_future': 'compactaremos', '2pl_future': 'compactarão', '3pl_future': 'compactarão',
      },
    },
  },

  {
    id: 'EXPAND',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to open something out into a larger space',
    // COMPACT's opposite, the same shape: the object comes to be bigger than it was.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BECOME', predicate: 'BIG', predicateDegree: 'more' },
    ),
    emoji: '↔️',
    synonym: 'enlarge',
    forms: {
      en: {
        base: 'expand',
        '1sg_present': 'expand', '2sg_present': 'expand', '3sg_present': 'expands',
        '1pl_present': 'expand', '2pl_present': 'expand', '3pl_present': 'expand',
        past: 'expanded',
      },
      it: {
        base: 'espandere',
        '1sg_present': 'espando', '2sg_present': 'espandi', '3sg_present': 'espande',
        '1pl_present': 'espandiamo', '2pl_present': 'espandete', '3pl_present': 'espandono',
        '1sg_past': 'espansi', '2sg_past': 'espandesti', '3sg_past': 'espanse',
        '1pl_past': 'espandemmo', '2pl_past': 'espandeste', '3pl_past': 'espansero',
        '1sg_future': 'espanderò', '2sg_future': 'espanderai', '3sg_future': 'espanderà',
        '1pl_future': 'espanderemo', '2pl_future': 'espanderete', '3pl_future': 'espanderanno',
      },
      fr: {
        base: 'étendre',
        '1sg_present': 'étends', '2sg_present': 'étends', '3sg_present': 'étend',
        '1pl_present': 'étendons', '2pl_present': 'étendez', '3pl_present': 'étendent',
        '1sg_past': 'étendis', '2sg_past': 'étendis', '3sg_past': 'étendit',
        '1pl_past': 'étendîmes', '2pl_past': 'étendîtes', '3pl_past': 'étendirent',
        '1sg_future': 'étendrai', '2sg_future': 'étendras', '3sg_future': 'étendra',
        '1pl_future': 'étendrons', '2pl_future': 'étendrez', '3pl_future': 'étendront',
      },
      de: {
        // "ausbreiten"/"aufklappen" are closer for unfolding, but their prefixes separate ("breitet
        // aus"), which the clause builder cannot place; "erweitern" is inseparable and stays whole.
        base: 'erweitern',
        '1sg_present': 'erweitere', '2sg_present': 'erweiterst', '3sg_present': 'erweitert',
        '1pl_present': 'erweitern', '2pl_present': 'erweitert', '3pl_present': 'erweitern',
        '1sg_past': 'erweiterte', '2sg_past': 'erweitertest', '3sg_past': 'erweiterte',
        '1pl_past': 'erweiterten', '2pl_past': 'erweitertet', '3pl_past': 'erweiterten',
      },
      es: {
        base: 'expandir',
        '1sg_present': 'expando', '2sg_present': 'expandes', '3sg_present': 'expande',
        '1pl_present': 'expandimos', '2pl_present': 'expandís', '3pl_present': 'expanden',
        '1sg_past': 'expandí', '2sg_past': 'expandiste', '3sg_past': 'expandió',
        '1pl_past': 'expandimos', '2pl_past': 'expandisteis', '3pl_past': 'expandieron',
        '1sg_future': 'expandiré', '2sg_future': 'expandirás', '3sg_future': 'expandirá',
        '1pl_future': 'expandiremos', '2pl_future': 'expandiréis', '3pl_future': 'expandirán',
      },
      ja: {
        base: '展開する',
        reading: 'てんかいする',
        masu_present: '展開します',
        masu_present_reading: 'てんかいします',
      },
      pt: {
        base: 'expandir',
        '1sg_present': 'expando', '2sg_present': 'expande', '3sg_present': 'expande',
        '1pl_present': 'expandimos', '2pl_present': 'expandem', '3pl_present': 'expandem',
        '1sg_past': 'expandi', '2sg_past': 'expandiu', '3sg_past': 'expandiu',
        '1pl_past': 'expandimos', '2pl_past': 'expandiram', '3pl_past': 'expandiram',
        '1sg_future': 'expandirei', '2sg_future': 'expandirá', '3sg_future': 'expandirá',
        '1pl_future': 'expandiremos', '2pl_future': 'expandirão', '3pl_future': 'expandirão',
      },
    },
  },
  {
    // Making a thing smaller in size, not packing it into less room: the canvas's − key (B43). COMPACT
    // is the packing ("verdichten", 圧縮), which says the wrong thing of a surface made shorter: German
    // "verkleinern" and Japanese 縮小 are the words for that, and fr "réduire", es "reducir", pt "reduzir".
    // Italian takes the regular "rimpicciolire" over "ridurre", whose contracted infinitive hides its stem.
    id: 'SHRINK',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to make something smaller',
    emoji: '🤏',
    forms: {
      en: {
        base: 'shrink',
        '1sg_present': 'shrink', '2sg_present': 'shrink', '3sg_present': 'shrinks',
        '1pl_present': 'shrink', '2pl_present': 'shrink', '3pl_present': 'shrink',
        past: 'shrank',
      },
      it: {
        base: 'rimpicciolire',
        '1sg_present': 'rimpicciolisco', '2sg_present': 'rimpicciolisci', '3sg_present': 'rimpicciolisce',
        '1pl_present': 'rimpiccioliamo', '2pl_present': 'rimpicciolite', '3pl_present': 'rimpiccioliscono',
        '1sg_past': 'rimpicciolii', '2sg_past': 'rimpicciolisti', '3sg_past': 'rimpicciolì',
        '1pl_past': 'rimpicciolimmo', '2pl_past': 'rimpiccioliste', '3pl_past': 'rimpicciolirono',
        '1sg_future': 'rimpicciolirò', '2sg_future': 'rimpicciolirai', '3sg_future': 'rimpicciolirà',
        '1pl_future': 'rimpiccioliremo', '2pl_future': 'rimpicciolirete', '3pl_future': 'rimpiccioliranno',
      },
      fr: {
        base: 'réduire',
        '1sg_present': 'réduis', '2sg_present': 'réduis', '3sg_present': 'réduit',
        '1pl_present': 'réduisons', '2pl_present': 'réduisez', '3pl_present': 'réduisent',
        '1sg_past': 'réduisis', '2sg_past': 'réduisis', '3sg_past': 'réduisit',
        '1pl_past': 'réduisîmes', '2pl_past': 'réduisîtes', '3pl_past': 'réduisirent',
        '1sg_future': 'réduirai', '2sg_future': 'réduiras', '3sg_future': 'réduira',
        '1pl_future': 'réduirons', '2pl_future': 'réduirez', '3pl_future': 'réduiront',
      },
      de: {
        base: 'verkleinern',
        '1sg_present': 'verkleinere', '2sg_present': 'verkleinerst', '3sg_present': 'verkleinert',
        '1pl_present': 'verkleinern', '2pl_present': 'verkleinert', '3pl_present': 'verkleinern',
        '1sg_past': 'verkleinerte', '2sg_past': 'verkleinertest', '3sg_past': 'verkleinerte',
        '1pl_past': 'verkleinerten', '2pl_past': 'verkleinertet', '3pl_past': 'verkleinerten',
      },
      es: {
        base: 'reducir',
        '1sg_present': 'reduzco', '2sg_present': 'reduces', '3sg_present': 'reduce',
        '1pl_present': 'reducimos', '2pl_present': 'reducís', '3pl_present': 'reducen',
        '1sg_past': 'reduje', '2sg_past': 'redujiste', '3sg_past': 'redujo',
        '1pl_past': 'redujimos', '2pl_past': 'redujisteis', '3pl_past': 'redujeron',
        '1sg_future': 'reduciré', '2sg_future': 'reducirás', '3sg_future': 'reducirá',
        '1pl_future': 'reduciremos', '2pl_future': 'reduciréis', '3pl_future': 'reducirán',
      },
      ja: {
        base: '縮小する',
        reading: 'しゅくしょうする',
        masu_present: '縮小します',
        masu_present_reading: 'しゅくしょうします',
        label: '縮小',
        label_reading: 'しゅくしょう',
      },
      pt: {
        base: 'reduzir',
        '1sg_present': 'reduzo', '2sg_present': 'reduz', '3sg_present': 'reduz',
        '1pl_present': 'reduzimos', '2pl_present': 'reduzem', '3pl_present': 'reduzem',
        '1sg_past': 'reduzi', '2sg_past': 'reduziu', '3sg_past': 'reduziu',
        '1pl_past': 'reduzimos', '2pl_past': 'reduziram', '3pl_past': 'reduziram',
        '1sg_future': 'reduzirei', '2sg_future': 'reduzirá', '3sg_future': 'reduzirá',
        '1pl_future': 'reduziremos', '2pl_future': 'reduzirão', '3pl_future': 'reduzirão',
      },
    },
  },

  {
    // Takes `locative` rather than `instrumental`: what a hiding wants to say is *where* the thing
    // was put out of sight — "hide the key under the stone", "nasconde la chiave sotto la pietra".
    id: 'HIDE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'cause', 'instrumental'],
    description: 'to put something out of sight',
    // "Out of sight" is the negation of being visible, and hiding is causing it (localization C08).
    // The negation sits on the caused clause, not on the causing: what is caused is a *not* being
    // seen. VISIBLE rather than the seeded HIDDEN, which is this verb's own participle in every
    // language ("nascondere" → "nascosto") and would define the word with itself.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BE', predicate: 'VISIBLE', negative: true },
    ),
    emoji: '🙈',
    forms: {
      en: {
        base: 'hide',
        '1sg_present': 'hide', '2sg_present': 'hide', '3sg_present': 'hides',
        '1pl_present': 'hide', '2pl_present': 'hide', '3pl_present': 'hide',
        past: 'hid',
      },
      it: {
        base: 'nascondere',
        '1sg_present': 'nascondo', '2sg_present': 'nascondi', '3sg_present': 'nasconde',
        '1pl_present': 'nascondiamo', '2pl_present': 'nascondete', '3pl_present': 'nascondono',
        '1sg_past': 'nascosi', '2sg_past': 'nascondesti', '3sg_past': 'nascose',
        '1pl_past': 'nascondemmo', '2pl_past': 'nascondeste', '3pl_past': 'nascosero',
        '1sg_future': 'nasconderò', '2sg_future': 'nasconderai', '3sg_future': 'nasconderà',
        '1pl_future': 'nasconderemo', '2pl_future': 'nasconderete', '3pl_future': 'nasconderanno',
      },
      fr: {
        base: 'cacher',
        '1sg_present': 'cache', '2sg_present': 'caches', '3sg_present': 'cache',
        '1pl_present': 'cachons', '2pl_present': 'cachez', '3pl_present': 'cachent',
        '1sg_past': 'cachai', '2sg_past': 'cachas', '3sg_past': 'cacha',
        '1pl_past': 'cachâmes', '2pl_past': 'cachâtes', '3pl_past': 'cachèrent',
        '1sg_future': 'cacherai', '2sg_future': 'cacheras', '3sg_future': 'cachera',
        '1pl_future': 'cacherons', '2pl_future': 'cacherez', '3pl_future': 'cacheront',
      },
      de: {
        base: 'verstecken',
        '1sg_present': 'verstecke', '2sg_present': 'versteckst', '3sg_present': 'versteckt',
        '1pl_present': 'verstecken', '2pl_present': 'versteckt', '3pl_present': 'verstecken',
        '1sg_past': 'versteckte', '2sg_past': 'verstecktest', '3sg_past': 'versteckte',
        '1pl_past': 'versteckten', '2pl_past': 'verstecktet', '3pl_past': 'versteckten',
      },
      es: {
        base: 'esconder',
        '1sg_present': 'escondo', '2sg_present': 'escondes', '3sg_present': 'esconde',
        '1pl_present': 'escondemos', '2pl_present': 'escondéis', '3pl_present': 'esconden',
        '1sg_past': 'escondí', '2sg_past': 'escondiste', '3sg_past': 'escondió',
        '1pl_past': 'escondimos', '2pl_past': 'escondisteis', '3pl_past': 'escondieron',
        '1sg_future': 'esconderé', '2sg_future': 'esconderás', '3sg_future': 'esconderá',
        '1pl_future': 'esconderemos', '2pl_future': 'esconderéis', '3pl_future': 'esconderán',
      },
      ja: {
        base: '隠す',
        reading: 'かくす',
        masu_present: '隠します',
        masu_present_reading: 'かくします',
      },
      pt: {
        base: 'esconder',
        '1sg_present': 'escondo', '2sg_present': 'esconde', '3sg_present': 'esconde',
        '1pl_present': 'escondemos', '2pl_present': 'escondem', '3pl_present': 'escondem',
        '1sg_past': 'escondi', '2sg_past': 'escondeu', '3sg_past': 'escondeu',
        '1pl_past': 'escondemos', '2pl_past': 'esconderam', '3pl_past': 'esconderam',
        '1sg_future': 'esconderei', '2sg_future': 'esconderá', '3sg_future': 'esconderá',
        '1pl_future': 'esconderemos', '2pl_future': 'esconderão', '3pl_future': 'esconderão',
      },
    },
  },

  {
    // The first verb to license the `instrumental` complement — an action one begins *by some
    // means*: "start with a word", "inizia con una parola", "始める" + で.
    id: 'START',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'terminus', 'cause', 'locative'],
    description: 'to cause something to begin',
    // The description, composed — START is the causative of BEGIN, which is the whole of the split
    // between them (localization C08). The five labile languages name their own lemma inside it
    // ("indurre un'azione a iniziare"), because their causative and their inchoative are one verb:
    // the gloss is then what their dictionaries say, "far sì che qcs. inizi", and it is what tells
    // the picker's two identical entries apart. en and ja have two words and read cleanly.
    definition: causativeGloss({ object: 'ACTION', definiteness: 'indefinite' }, { verb: 'BEGIN' }),
    emoji: '▶️',
    forms: {
      en: {
        base: 'start',
        '1sg_present': 'start', '2sg_present': 'start', '3sg_present': 'starts',
        '1pl_present': 'start', '2pl_present': 'start', '3pl_present': 'start',
        past: 'started',
      },
      it: {
        base: 'iniziare',
        '1sg_present': 'inizio', '2sg_present': 'inizi', '3sg_present': 'inizia',
        '1pl_present': 'iniziamo', '2pl_present': 'iniziate', '3pl_present': 'iniziano',
        '1sg_past': 'iniziai', '2sg_past': 'iniziasti', '3sg_past': 'iniziò',
        '1pl_past': 'iniziammo', '2pl_past': 'iniziaste', '3pl_past': 'iniziarono',
        '1sg_future': 'inizierò', '2sg_future': 'inizierai', '3sg_future': 'inizierà',
        '1pl_future': 'inizieremo', '2pl_future': 'inizierete', '3pl_future': 'inizieranno',
      },
      fr: {
        base: 'commencer',
        '1sg_present': 'commence', '2sg_present': 'commences', '3sg_present': 'commence',
        '1pl_present': 'commençons', '2pl_present': 'commencez', '3pl_present': 'commencent',
        '1sg_past': 'commençai', '2sg_past': 'commenças', '3sg_past': 'commença',
        '1pl_past': 'commençâmes', '2pl_past': 'commençâtes', '3pl_past': 'commencèrent',
        '1sg_future': 'commencerai', '2sg_future': 'commenceras', '3sg_future': 'commencera',
        '1pl_future': 'commencerons', '2pl_future': 'commencerez', '3pl_future': 'commenceront',
      },
      de: {
        base: 'beginnen',
        '1sg_present': 'beginne', '2sg_present': 'beginnst', '3sg_present': 'beginnt',
        '1pl_present': 'beginnen', '2pl_present': 'beginnt', '3pl_present': 'beginnen',
        '1sg_past': 'begann', '2sg_past': 'begannst', '3sg_past': 'begann',
        '1pl_past': 'begannen', '2pl_past': 'begannt', '3pl_past': 'begannen',
      },
      es: {
        base: 'empezar',
        '1sg_present': 'empiezo', '2sg_present': 'empiezas', '3sg_present': 'empieza',
        '1pl_present': 'empezamos', '2pl_present': 'empezáis', '3pl_present': 'empiezan',
        '1sg_past': 'empecé', '2sg_past': 'empezaste', '3sg_past': 'empezó',
        '1pl_past': 'empezamos', '2pl_past': 'empezasteis', '3pl_past': 'empezaron',
        '1sg_future': 'empezaré', '2sg_future': 'empezarás', '3sg_future': 'empezará',
        '1pl_future': 'empezaremos', '2pl_future': 'empezaréis', '3pl_future': 'empezarán',
      },
      ja: {
        base: '始める',
        reading: 'はじめる',
        masu_present: '始めます',
        masu_present_reading: 'はじめます',
      },
      pt: {
        base: 'começar',
        '1sg_present': 'começo', '2sg_present': 'começa', '3sg_present': 'começa',
        '1pl_present': 'começamos', '2pl_present': 'começam', '3pl_present': 'começam',
        '1sg_past': 'comecei', '2sg_past': 'começou', '3sg_past': 'começou',
        '1pl_past': 'começamos', '2pl_past': 'começaram', '3pl_past': 'começaram',
        '1sg_future': 'começarei', '2sg_future': 'começará', '3sg_future': 'começará',
        '1pl_future': 'começaremos', '2pl_future': 'começarão', '3pl_future': 'começarão',
      },
    },
  },

  // The verbs of a program's everyday controls (B25–B28): the dialog buttons, the clipboard, moving and
  // resizing a container, switching a setting off. German keeps to inseparable stems, which the clause
  // builder can place (A138): the dialog word "abbrechen" and "ausschalten" are separable, so CANCEL is
  // "annullieren" and TURN_OFF "deaktivieren". Its RETRY is "wiederholen", the word of the classic
  // Abbrechen / Wiederholen / Ignorieren dialog, and Portuguese says "repetir" there too: "tentar
  // novamente" is two words, and the imperative is derived from the first.
  {
    id: 'CANCEL',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to call off something planned or under way',
    emoji: '🚫',
    forms: {
      en: {
        base: 'cancel',
        '1sg_present': 'cancel', '2sg_present': 'cancel', '3sg_present': 'cancels',
        '1pl_present': 'cancel', '2pl_present': 'cancel', '3pl_present': 'cancel',
        past: 'canceled',
      },
      it: {
        base: 'annullare',
        '1sg_present': 'annullo', '2sg_present': 'annulli', '3sg_present': 'annulla',
        '1pl_present': 'annulliamo', '2pl_present': 'annullate', '3pl_present': 'annullano',
        '1sg_past': 'annullai', '2sg_past': 'annullasti', '3sg_past': 'annullò',
        '1pl_past': 'annullammo', '2pl_past': 'annullaste', '3pl_past': 'annullarono',
        '1sg_future': 'annullerò', '2sg_future': 'annullerai', '3sg_future': 'annullerà',
        '1pl_future': 'annulleremo', '2pl_future': 'annullerete', '3pl_future': 'annulleranno',
      },
      fr: {
        base: 'annuler',
        '1sg_present': 'annule', '2sg_present': 'annules', '3sg_present': 'annule',
        '1pl_present': 'annulons', '2pl_present': 'annulez', '3pl_present': 'annulent',
        '1sg_past': 'annulai', '2sg_past': 'annulas', '3sg_past': 'annula',
        '1pl_past': 'annulâmes', '2pl_past': 'annulâtes', '3pl_past': 'annulèrent',
        '1sg_future': 'annulerai', '2sg_future': 'annuleras', '3sg_future': 'annulera',
        '1pl_future': 'annulerons', '2pl_future': 'annulerez', '3pl_future': 'annuleront',
      },
      de: {
        base: 'annullieren',
        '1sg_present': 'annulliere', '2sg_present': 'annullierst', '3sg_present': 'annulliert',
        '1pl_present': 'annullieren', '2pl_present': 'annulliert', '3pl_present': 'annullieren',
        '1sg_past': 'annullierte', '2sg_past': 'annulliertest', '3sg_past': 'annullierte',
        '1pl_past': 'annullierten', '2pl_past': 'annulliertet', '3pl_past': 'annullierten',
        '2sg_imperative': 'annulliere', // the optional du -e, kept
      },
      es: {
        base: 'cancelar',
        '1sg_present': 'cancelo', '2sg_present': 'cancelas', '3sg_present': 'cancela',
        '1pl_present': 'cancelamos', '2pl_present': 'canceláis', '3pl_present': 'cancelan',
        '1sg_past': 'cancelé', '2sg_past': 'cancelaste', '3sg_past': 'canceló',
        '1pl_past': 'cancelamos', '2pl_past': 'cancelasteis', '3pl_past': 'cancelaron',
        '1sg_future': 'cancelaré', '2sg_future': 'cancelarás', '3sg_future': 'cancelará',
        '1pl_future': 'cancelaremos', '2pl_future': 'cancelaréis', '3pl_future': 'cancelarán',
      },
      ja: {
        base: 'キャンセルする',
        reading: 'きゃんせるする',
        masu_present: 'キャンセルします',
        masu_present_reading: 'きゃんせるします',
        label: 'キャンセル',
      },
      pt: {
        base: 'cancelar',
        '1sg_present': 'cancelo', '2sg_present': 'cancela', '3sg_present': 'cancela',
        '1pl_present': 'cancelamos', '2pl_present': 'cancelam', '3pl_present': 'cancelam',
        '1sg_past': 'cancelei', '2sg_past': 'cancelou', '3sg_past': 'cancelou',
        '1pl_past': 'cancelamos', '2pl_past': 'cancelaram', '3pl_past': 'cancelaram',
        '1sg_future': 'cancelarei', '2sg_future': 'cancelará', '3sg_future': 'cancelará',
        '1pl_future': 'cancelaremos', '2pl_future': 'cancelarão', '3pl_future': 'cancelarão',
      },
    },
  },

  // Undo and redo (B40), the pair every editor's Edit menu opens with, in the words those menus use:
  // it Annulla / Ripeti, fr Annuler / Rétablir, de Rückgängig machen / Wiederholen, es Deshacer /
  // Rehacer, pt Desfazer / Refazer, ja 元に戻す / やり直し. Italian and French UNDO is CANCEL's verb
  // (annullare, annuler), and German REDO is RETRY's (wiederholen, as Google's and Apple's editors pair
  // it with "Rückgängig machen"): that is what their software writes, so those controls read alike.
  // German UNDO is the light verb "machen" with "rückgängig" as its separable particle, written apart
  // ("macht die Phrase rückgängig", "rückgängig gemacht", "rückgängig zu machen"). Microsoft's
  // "wiederherstellen" was not taken: its particle is spelled "wieder her" once it leaves the verb,
  // which no lexeme can say yet. Spanish and Portuguese conjugate like hacer / fazer.
  {
    id: 'UNDO',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to reverse the last change',
    definition: infinitiveGloss('CANCEL', 'ACTION', 'plural'),
    emoji: '↩️',
    forms: {
      en: {
        base: 'undo',
        '1sg_present': 'undo', '2sg_present': 'undo', '3sg_present': 'undoes',
        '1pl_present': 'undo', '2pl_present': 'undo', '3pl_present': 'undo',
        past: 'undid',
      },
      it: {
        base: 'annullare',
        '1sg_present': 'annullo', '2sg_present': 'annulli', '3sg_present': 'annulla',
        '1pl_present': 'annulliamo', '2pl_present': 'annullate', '3pl_present': 'annullano',
        '1sg_past': 'annullai', '2sg_past': 'annullasti', '3sg_past': 'annullò',
        '1pl_past': 'annullammo', '2pl_past': 'annullaste', '3pl_past': 'annullarono',
        '1sg_future': 'annullerò', '2sg_future': 'annullerai', '3sg_future': 'annullerà',
        '1pl_future': 'annulleremo', '2pl_future': 'annullerete', '3pl_future': 'annulleranno',
      },
      fr: {
        base: 'annuler',
        '1sg_present': 'annule', '2sg_present': 'annules', '3sg_present': 'annule',
        '1pl_present': 'annulons', '2pl_present': 'annulez', '3pl_present': 'annulent',
        '1sg_past': 'annulai', '2sg_past': 'annulas', '3sg_past': 'annula',
        '1pl_past': 'annulâmes', '2pl_past': 'annulâtes', '3pl_past': 'annulèrent',
        '1sg_future': 'annulerai', '2sg_future': 'annuleras', '3sg_future': 'annulera',
        '1pl_future': 'annulerons', '2pl_future': 'annulerez', '3pl_future': 'annuleront',
      },
      de: {
        base: 'rückgängig machen', particle: 'rückgängig',
        '1sg_present': 'mache', '2sg_present': 'machst', '3sg_present': 'macht',
        '1pl_present': 'machen', '2pl_present': 'macht', '3pl_present': 'machen',
        '1sg_past': 'machte', '2sg_past': 'machtest', '3sg_past': 'machte',
        '1pl_past': 'machten', '2pl_past': 'machtet', '3pl_past': 'machten',
      },
      es: {
        base: 'deshacer',
        '1sg_present': 'deshago', '2sg_present': 'deshaces', '3sg_present': 'deshace',
        '1pl_present': 'deshacemos', '2pl_present': 'deshacéis', '3pl_present': 'deshacen',
        '1sg_past': 'deshice', '2sg_past': 'deshiciste', '3sg_past': 'deshizo',
        '1pl_past': 'deshicimos', '2pl_past': 'deshicisteis', '3pl_past': 'deshicieron',
        '1sg_future': 'desharé', '2sg_future': 'desharás', '3sg_future': 'deshará',
        '1pl_future': 'desharemos', '2pl_future': 'desharéis', '3pl_future': 'desharán',
      },
      ja: {
        base: '元に戻す',
        reading: 'もとにもどす',
        masu_present: '元に戻します',
        masu_present_reading: 'もとにもどします',
        // The button says the dictionary form, as it does for 閉じる: 元に戻す, not the stem 元に戻し.
        label: '元に戻す',
        label_reading: 'もとにもどす',
      },
      pt: {
        base: 'desfazer',
        '1sg_present': 'desfaço', '2sg_present': 'desfaz', '3sg_present': 'desfaz',
        '1pl_present': 'desfazemos', '2pl_present': 'desfazem', '3pl_present': 'desfazem',
        '1sg_past': 'desfiz', '2sg_past': 'desfez', '3sg_past': 'desfez',
        '1pl_past': 'desfizemos', '2pl_past': 'desfizeram', '3pl_past': 'desfizeram',
        '1sg_future': 'desfarei', '2sg_future': 'desfará', '3sg_future': 'desfará',
        '1pl_future': 'desfaremos', '2pl_future': 'desfarão', '3pl_future': 'desfarão',
      },
    },
  },
  {
    id: 'REDO',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to make again a change that was undone',
    definition: infinitiveGloss('MAKE', { modifier: 'AGAIN' }),
    emoji: '↪️',
    forms: {
      en: {
        base: 'redo',
        '1sg_present': 'redo', '2sg_present': 'redo', '3sg_present': 'redoes',
        '1pl_present': 'redo', '2pl_present': 'redo', '3pl_present': 'redo',
        past: 'redid',
      },
      it: {
        base: 'ripetere',
        '1sg_present': 'ripeto', '2sg_present': 'ripeti', '3sg_present': 'ripete',
        '1pl_present': 'ripetiamo', '2pl_present': 'ripetete', '3pl_present': 'ripetono',
        '1sg_past': 'ripetei', '2sg_past': 'ripetesti', '3sg_past': 'ripeté',
        '1pl_past': 'ripetemmo', '2pl_past': 'ripeteste', '3pl_past': 'ripeterono',
        '1sg_future': 'ripeterò', '2sg_future': 'ripeterai', '3sg_future': 'ripeterà',
        '1pl_future': 'ripeteremo', '2pl_future': 'ripeterete', '3pl_future': 'ripeteranno',
      },
      fr: {
        base: 'rétablir',
        '1sg_present': 'rétablis', '2sg_present': 'rétablis', '3sg_present': 'rétablit',
        '1pl_present': 'rétablissons', '2pl_present': 'rétablissez', '3pl_present': 'rétablissent',
        '1sg_past': 'rétablis', '2sg_past': 'rétablis', '3sg_past': 'rétablit',
        '1pl_past': 'rétablîmes', '2pl_past': 'rétablîtes', '3pl_past': 'rétablirent',
        '1sg_future': 'rétablirai', '2sg_future': 'rétabliras', '3sg_future': 'rétablira',
        '1pl_future': 'rétablirons', '2pl_future': 'rétablirez', '3pl_future': 'rétabliront',
      },
      de: {
        base: 'wiederholen',
        '1sg_present': 'wiederhole', '2sg_present': 'wiederholst', '3sg_present': 'wiederholt',
        '1pl_present': 'wiederholen', '2pl_present': 'wiederholt', '3pl_present': 'wiederholen',
        '1sg_past': 'wiederholte', '2sg_past': 'wiederholtest', '3sg_past': 'wiederholte',
        '1pl_past': 'wiederholten', '2pl_past': 'wiederholtet', '3pl_past': 'wiederholten',
        '2sg_imperative': 'wiederhole', // the optional du -e, kept
      },
      es: {
        // The i of the preterite stem is stressed after the vowel of re-, and written so: rehíce, rehízo.
        base: 'rehacer',
        '1sg_present': 'rehago', '2sg_present': 'rehaces', '3sg_present': 'rehace',
        '1pl_present': 'rehacemos', '2pl_present': 'rehacéis', '3pl_present': 'rehacen',
        '1sg_past': 'rehíce', '2sg_past': 'rehiciste', '3sg_past': 'rehízo',
        '1pl_past': 'rehicimos', '2pl_past': 'rehicisteis', '3pl_past': 'rehicieron',
        '1sg_future': 'reharé', '2sg_future': 'reharás', '3sg_future': 'rehará',
        '1pl_future': 'reharemos', '2pl_future': 'reharéis', '3pl_future': 'reharán',
      },
      ja: {
        // No label: the stem やり直し is the button's own word.
        base: 'やり直す',
        reading: 'やりなおす',
        masu_present: 'やり直します',
        masu_present_reading: 'やりなおします',
      },
      pt: {
        base: 'refazer',
        '1sg_present': 'refaço', '2sg_present': 'refaz', '3sg_present': 'refaz',
        '1pl_present': 'refazemos', '2pl_present': 'refazem', '3pl_present': 'refazem',
        '1sg_past': 'refiz', '2sg_past': 'refez', '3sg_past': 'refez',
        '1pl_past': 'refizemos', '2pl_past': 'refizeram', '3pl_past': 'refizeram',
        '1sg_future': 'refarei', '2sg_future': 'refará', '3sg_future': 'refará',
        '1pl_future': 'refaremos', '2pl_future': 'refarão', '3pl_future': 'refarão',
      },
    },
  },
  // Putting back what was there before: a second esc in the word picker gives the box back the word
  // that was being replaced (localization C22). Not REDO, which makes an undone change again: French
  // REDO is "rétablir", so RESTORE is "restaurer". German says "wiederherstellen" on its buttons, but
  // that particle is spelled "wieder her" apart from the verb (see UNDO); "zurückholen", fetching it
  // back, is a plain separable verb. Japanese 復元する is a suru compound, labelled 復元.
  {
    id: 'RESTORE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to put something back as it was before',
    // "to cause an object to return" (localization C28) — the word the esc gives back comes back.
    // German zurückkehren beside the lexeme's zurückholen, ja 戻る beside 復元する: related, not the
    // same verb, so the gloss does not cite the word it defines.
    definition: causativeGloss({ object: 'OBJECT_THING', definiteness: 'indefinite' }, { verb: 'RETURN' }),
    emoji: '♻️',
    forms: {
      en: {
        base: 'restore',
        '1sg_present': 'restore', '2sg_present': 'restore', '3sg_present': 'restores',
        '1pl_present': 'restore', '2pl_present': 'restore', '3pl_present': 'restore',
        past: 'restored',
      },
      it: {
        base: 'ripristinare',
        '1sg_present': 'ripristino', '2sg_present': 'ripristini', '3sg_present': 'ripristina',
        '1pl_present': 'ripristiniamo', '2pl_present': 'ripristinate', '3pl_present': 'ripristinano',
        '1sg_past': 'ripristinai', '2sg_past': 'ripristinasti', '3sg_past': 'ripristinò',
        '1pl_past': 'ripristinammo', '2pl_past': 'ripristinaste', '3pl_past': 'ripristinarono',
        '1sg_future': 'ripristinerò', '2sg_future': 'ripristinerai', '3sg_future': 'ripristinerà',
        '1pl_future': 'ripristineremo', '2pl_future': 'ripristinerete', '3pl_future': 'ripristineranno',
      },
      fr: {
        base: 'restaurer',
        '1sg_present': 'restaure', '2sg_present': 'restaures', '3sg_present': 'restaure',
        '1pl_present': 'restaurons', '2pl_present': 'restaurez', '3pl_present': 'restaurent',
        '1sg_past': 'restaurai', '2sg_past': 'restauras', '3sg_past': 'restaura',
        '1pl_past': 'restaurâmes', '2pl_past': 'restaurâtes', '3pl_past': 'restaurèrent',
        '1sg_future': 'restaurerai', '2sg_future': 'restaureras', '3sg_future': 'restaurera',
        '1pl_future': 'restaurerons', '2pl_future': 'restaurerez', '3pl_future': 'restaureront',
      },
      de: {
        // Separable, as ADD is: the stem's finite forms, the particle placed by the clause ("holt das
        // Wort zurück", "…, das das Wort zurückholt", "zurückzuholen").
        base: 'zurückholen', particle: 'zurück',
        '1sg_present': 'hole', '2sg_present': 'holst', '3sg_present': 'holt',
        '1pl_present': 'holen', '2pl_present': 'holt', '3pl_present': 'holen',
        '1sg_past': 'holte', '2sg_past': 'holtest', '3sg_past': 'holte',
        '1pl_past': 'holten', '2pl_past': 'holtet', '3pl_past': 'holten',
        '2sg_imperative': 'hole', // the optional du -e, kept
      },
      es: {
        base: 'restaurar',
        '1sg_present': 'restauro', '2sg_present': 'restauras', '3sg_present': 'restaura',
        '1pl_present': 'restauramos', '2pl_present': 'restauráis', '3pl_present': 'restauran',
        '1sg_past': 'restauré', '2sg_past': 'restauraste', '3sg_past': 'restauró',
        '1pl_past': 'restauramos', '2pl_past': 'restaurasteis', '3pl_past': 'restauraron',
        '1sg_future': 'restauraré', '2sg_future': 'restaurarás', '3sg_future': 'restaurará',
        '1pl_future': 'restauraremos', '2pl_future': 'restauraréis', '3pl_future': 'restaurarán',
      },
      ja: {
        base: '復元する',
        reading: 'ふくげんする',
        masu_present: '復元します',
        masu_present_reading: 'ふくげんします',
        label: '復元',
        label_reading: 'ふくげん',
      },
      pt: {
        base: 'restaurar',
        '1sg_present': 'restauro', '2sg_present': 'restaura', '3sg_present': 'restaura',
        '1pl_present': 'restauramos', '2pl_present': 'restauram', '3pl_present': 'restauram',
        '1sg_past': 'restaurei', '2sg_past': 'restaurou', '3sg_past': 'restaurou',
        '1pl_past': 'restauramos', '2pl_past': 'restauraram', '3pl_past': 'restauraram',
        '1sg_future': 'restaurarei', '2sg_future': 'restaurará', '3sg_future': 'restaurará',
        '1pl_future': 'restauraremos', '2pl_future': 'restaurarão', '3pl_future': 'restaurarão',
      },
    },
  },

  {
    // CLOSE's opposite: what a command does to its bracket (localization C21, "open a bracket with a
    // command"). Japanese 開く (ひらく), the verb brackets and files take (括弧を開く, ファイルを開く), in
    // the dictionary form on a control, as CLOSE's 閉じる is. Italian aprire and French ouvrir are
    // irregular in the participle (aperto, ouvert), and so are Spanish and Portuguese abrir (abierto,
    // aberto).
    id: 'OPEN',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to make something no longer closed',
    // "to cause an object not to be closed" (localization C28), HIDE's shape on CLOSED. Denying the
    // opposite state rather than asserting OPEN_ADJECTIVE's, which is this verb's own word or
    // participle in six languages (open, aperto, ouvert, abierto, aberto, 開いた) — the reason HIDE
    // denies VISIBLE.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BE', predicate: 'CLOSED', negative: true },
    ),
    emoji: '📂',
    forms: {
      en: {
        base: 'open',
        '1sg_present': 'open', '2sg_present': 'open', '3sg_present': 'opens',
        '1pl_present': 'open', '2pl_present': 'open', '3pl_present': 'open',
        past: 'opened',
      },
      it: {
        base: 'aprire',
        '1sg_present': 'apro', '2sg_present': 'apri', '3sg_present': 'apre',
        '1pl_present': 'apriamo', '2pl_present': 'aprite', '3pl_present': 'aprono',
        '1sg_past': 'aprii', '2sg_past': 'apristi', '3sg_past': 'aprì',
        '1pl_past': 'aprimmo', '2pl_past': 'apriste', '3pl_past': 'aprirono',
        '1sg_future': 'aprirò', '2sg_future': 'aprirai', '3sg_future': 'aprirà',
        '1pl_future': 'apriremo', '2pl_future': 'aprirete', '3pl_future': 'apriranno',
      },
      fr: {
        base: 'ouvrir',
        '1sg_present': 'ouvre', '2sg_present': 'ouvres', '3sg_present': 'ouvre',
        '1pl_present': 'ouvrons', '2pl_present': 'ouvrez', '3pl_present': 'ouvrent',
        '1sg_past': 'ouvris', '2sg_past': 'ouvris', '3sg_past': 'ouvrit',
        '1pl_past': 'ouvrîmes', '2pl_past': 'ouvrîtes', '3pl_past': 'ouvrirent',
        '1sg_future': 'ouvrirai', '2sg_future': 'ouvriras', '3sg_future': 'ouvrira',
        '1pl_future': 'ouvrirons', '2pl_future': 'ouvrirez', '3pl_future': 'ouvriront',
      },
      de: {
        base: 'öffnen',
        '1sg_present': 'öffne', '2sg_present': 'öffnest', '3sg_present': 'öffnet',
        '1pl_present': 'öffnen', '2pl_present': 'öffnet', '3pl_present': 'öffnen',
        '1sg_past': 'öffnete', '2sg_past': 'öffnetest', '3sg_past': 'öffnete',
        '1pl_past': 'öffneten', '2pl_past': 'öffnetet', '3pl_past': 'öffneten',
      },
      es: {
        base: 'abrir',
        '1sg_present': 'abro', '2sg_present': 'abres', '3sg_present': 'abre',
        '1pl_present': 'abrimos', '2pl_present': 'abrís', '3pl_present': 'abren',
        '1sg_past': 'abrí', '2sg_past': 'abriste', '3sg_past': 'abrió',
        '1pl_past': 'abrimos', '2pl_past': 'abristeis', '3pl_past': 'abrieron',
        '1sg_future': 'abriré', '2sg_future': 'abrirás', '3sg_future': 'abrirá',
        '1pl_future': 'abriremos', '2pl_future': 'abriréis', '3pl_future': 'abrirán',
      },
      ja: {
        base: '開く',
        reading: 'ひらく',
        masu_present: '開きます',
        masu_present_reading: 'ひらきます',
        label: '開く',
        label_reading: 'ひらく',
      },
      pt: {
        base: 'abrir',
        '1sg_present': 'abro', '2sg_present': 'abre', '3sg_present': 'abre',
        '1pl_present': 'abrimos', '2pl_present': 'abrem', '3pl_present': 'abrem',
        '1sg_past': 'abri', '2sg_past': 'abriu', '3sg_past': 'abriu',
        '1pl_past': 'abrimos', '2pl_past': 'abriram', '3pl_past': 'abriram',
        '1sg_future': 'abrirei', '2sg_future': 'abrirá', '3sg_future': 'abrirá',
        '1pl_future': 'abriremos', '2pl_future': 'abrirão', '3pl_future': 'abrirão',
      },
    },
  },

  {
    // Japanese buttons say the dictionary form 閉じる, not the verbal noun the other instructions take.
    id: 'CLOSE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to shut something that was open',
    // "to cause an object not to be open" (localization C28), OPEN's gloss the other way round, and
    // for the same reason: CLOSED is this verb's participle in all seven.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BE', predicate: 'OPEN_ADJECTIVE', negative: true },
    ),
    emoji: '❎',
    forms: {
      en: {
        base: 'close',
        '1sg_present': 'close', '2sg_present': 'close', '3sg_present': 'closes',
        '1pl_present': 'close', '2pl_present': 'close', '3pl_present': 'close',
        past: 'closed',
      },
      it: {
        base: 'chiudere',
        '1sg_present': 'chiudo', '2sg_present': 'chiudi', '3sg_present': 'chiude',
        '1pl_present': 'chiudiamo', '2pl_present': 'chiudete', '3pl_present': 'chiudono',
        '1sg_past': 'chiusi', '2sg_past': 'chiudesti', '3sg_past': 'chiuse',
        '1pl_past': 'chiudemmo', '2pl_past': 'chiudeste', '3pl_past': 'chiusero',
        '1sg_future': 'chiuderò', '2sg_future': 'chiuderai', '3sg_future': 'chiuderà',
        '1pl_future': 'chiuderemo', '2pl_future': 'chiuderete', '3pl_future': 'chiuderanno',
      },
      fr: {
        base: 'fermer',
        '1sg_present': 'ferme', '2sg_present': 'fermes', '3sg_present': 'ferme',
        '1pl_present': 'fermons', '2pl_present': 'fermez', '3pl_present': 'ferment',
        '1sg_past': 'fermai', '2sg_past': 'fermas', '3sg_past': 'ferma',
        '1pl_past': 'fermâmes', '2pl_past': 'fermâtes', '3pl_past': 'fermèrent',
        '1sg_future': 'fermerai', '2sg_future': 'fermeras', '3sg_future': 'fermera',
        '1pl_future': 'fermerons', '2pl_future': 'fermerez', '3pl_future': 'fermeront',
      },
      de: {
        base: 'schließen',
        '1sg_present': 'schließe', '2sg_present': 'schließt', '3sg_present': 'schließt',
        '1pl_present': 'schließen', '2pl_present': 'schließt', '3pl_present': 'schließen',
        '1sg_past': 'schloss', '2sg_past': 'schlossest', '3sg_past': 'schloss',
        '1pl_past': 'schlossen', '2pl_past': 'schlosst', '3pl_past': 'schlossen',
      },
      es: {
        base: 'cerrar',
        '1sg_present': 'cierro', '2sg_present': 'cierras', '3sg_present': 'cierra',
        '1pl_present': 'cerramos', '2pl_present': 'cerráis', '3pl_present': 'cierran',
        '1sg_past': 'cerré', '2sg_past': 'cerraste', '3sg_past': 'cerró',
        '1pl_past': 'cerramos', '2pl_past': 'cerrasteis', '3pl_past': 'cerraron',
        '1sg_future': 'cerraré', '2sg_future': 'cerrarás', '3sg_future': 'cerrará',
        '1pl_future': 'cerraremos', '2pl_future': 'cerraréis', '3pl_future': 'cerrarán',
      },
      ja: {
        base: '閉じる',
        reading: 'とじる',
        masu_present: '閉じます',
        masu_present_reading: 'とじます',
        label: '閉じる',
        label_reading: 'とじる',
      },
      pt: {
        base: 'fechar',
        '1sg_present': 'fecho', '2sg_present': 'fecha', '3sg_present': 'fecha',
        '1pl_present': 'fechamos', '2pl_present': 'fecham', '3pl_present': 'fecham',
        '1sg_past': 'fechei', '2sg_past': 'fechou', '3sg_past': 'fechou',
        '1pl_past': 'fechamos', '2pl_past': 'fecharam', '3pl_past': 'fecharam',
        '1sg_future': 'fecharei', '2sg_future': 'fechará', '3sg_future': 'fechará',
        '1pl_future': 'fecharemos', '2pl_future': 'fecharão', '3pl_future': 'fecharão',
      },
    },
  },

  {
    id: 'RETRY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to try something again after it failed',
    definition: infinitiveGloss('START', { modifier: 'AGAIN' }),
    emoji: '🔄',
    // P09's /attach RETRY under TRY (localization B62). Its gloss stays "to start again": TRY is
    // literal by design, so there is no genus gloss to build it on.
    isA: 'TRY',
    forms: {
      en: {
        base: 'retry',
        '1sg_present': 'retry', '2sg_present': 'retry', '3sg_present': 'retries',
        '1pl_present': 'retry', '2pl_present': 'retry', '3pl_present': 'retry',
        past: 'retried',
      },
      it: {
        base: 'riprovare',
        '1sg_present': 'riprovo', '2sg_present': 'riprovi', '3sg_present': 'riprova',
        '1pl_present': 'riproviamo', '2pl_present': 'riprovate', '3pl_present': 'riprovano',
        '1sg_past': 'riprovai', '2sg_past': 'riprovasti', '3sg_past': 'riprovò',
        '1pl_past': 'riprovammo', '2pl_past': 'riprovaste', '3pl_past': 'riprovarono',
        '1sg_future': 'riproverò', '2sg_future': 'riproverai', '3sg_future': 'riproverà',
        '1pl_future': 'riproveremo', '2pl_future': 'riproverete', '3pl_future': 'riproveranno',
      },
      fr: {
        base: 'réessayer',
        '1sg_present': 'réessaie', '2sg_present': 'réessaies', '3sg_present': 'réessaie',
        '1pl_present': 'réessayons', '2pl_present': 'réessayez', '3pl_present': 'réessaient',
        '1sg_past': 'réessayai', '2sg_past': 'réessayas', '3sg_past': 'réessaya',
        '1pl_past': 'réessayâmes', '2pl_past': 'réessayâtes', '3pl_past': 'réessayèrent',
        '1sg_future': 'réessaierai', '2sg_future': 'réessaieras', '3sg_future': 'réessaiera',
        '1pl_future': 'réessaierons', '2pl_future': 'réessaierez', '3pl_future': 'réessaieront',
      },
      de: {
        base: 'wiederholen',
        '1sg_present': 'wiederhole', '2sg_present': 'wiederholst', '3sg_present': 'wiederholt',
        '1pl_present': 'wiederholen', '2pl_present': 'wiederholt', '3pl_present': 'wiederholen',
        '1sg_past': 'wiederholte', '2sg_past': 'wiederholtest', '3sg_past': 'wiederholte',
        '1pl_past': 'wiederholten', '2pl_past': 'wiederholtet', '3pl_past': 'wiederholten',
        '2sg_imperative': 'wiederhole', // the optional du -e, kept
      },
      es: {
        base: 'reintentar',
        '1sg_present': 'reintento', '2sg_present': 'reintentas', '3sg_present': 'reintenta',
        '1pl_present': 'reintentamos', '2pl_present': 'reintentáis', '3pl_present': 'reintentan',
        '1sg_past': 'reintenté', '2sg_past': 'reintentaste', '3sg_past': 'reintentó',
        '1pl_past': 'reintentamos', '2pl_past': 'reintentasteis', '3pl_past': 'reintentaron',
        '1sg_future': 'reintentaré', '2sg_future': 'reintentarás', '3sg_future': 'reintentará',
        '1pl_future': 'reintentaremos', '2pl_future': 'reintentaréis', '3pl_future': 'reintentarán',
      },
      ja: {
        base: '再試行する',
        reading: 'さいしこうする',
        masu_present: '再試行します',
        masu_present_reading: 'さいしこうします',
        label: '再試行',
        label_reading: 'さいしこう',
      },
      pt: {
        base: 'repetir',
        '1sg_present': 'repito', '2sg_present': 'repete', '3sg_present': 'repete',
        '1pl_present': 'repetimos', '2pl_present': 'repetem', '3pl_present': 'repetem',
        '1sg_past': 'repeti', '2sg_past': 'repetiu', '3sg_past': 'repetiu',
        '1pl_past': 'repetimos', '2pl_past': 'repetiram', '3pl_past': 'repetiram',
        '1sg_future': 'repetirei', '2sg_future': 'repetirá', '3sg_future': 'repetirá',
        '1pl_future': 'repetiremos', '2pl_future': 'repetirão', '3pl_future': 'repetirão',
      },
    },
  },

  {
    // The verb; the noun "use" is USE_NOUN. German verwenden, the verb of USE_NOUN's Verwendung.
    // Japanese instructions say 使用, the verbal noun, rather than the stem of 使う.
    id: 'USE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'cause', 'locative'],
    description: 'to employ something for a purpose',
    definition: infinitiveGloss('ACT', {
      complements: { instrumental: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' } } },
    }),
    emoji: '🛠️',
    forms: {
      en: {
        base: 'use',
        '1sg_present': 'use', '2sg_present': 'use', '3sg_present': 'uses',
        '1pl_present': 'use', '2pl_present': 'use', '3pl_present': 'use',
        past: 'used',
      },
      it: {
        base: 'usare',
        '1sg_present': 'uso', '2sg_present': 'usi', '3sg_present': 'usa',
        '1pl_present': 'usiamo', '2pl_present': 'usate', '3pl_present': 'usano',
        '1sg_past': 'usai', '2sg_past': 'usasti', '3sg_past': 'usò',
        '1pl_past': 'usammo', '2pl_past': 'usaste', '3pl_past': 'usarono',
        '1sg_future': 'userò', '2sg_future': 'userai', '3sg_future': 'userà',
        '1pl_future': 'useremo', '2pl_future': 'userete', '3pl_future': 'useranno',
      },
      fr: {
        base: 'utiliser',
        '1sg_present': 'utilise', '2sg_present': 'utilises', '3sg_present': 'utilise',
        '1pl_present': 'utilisons', '2pl_present': 'utilisez', '3pl_present': 'utilisent',
        '1sg_past': 'utilisai', '2sg_past': 'utilisas', '3sg_past': 'utilisa',
        '1pl_past': 'utilisâmes', '2pl_past': 'utilisâtes', '3pl_past': 'utilisèrent',
        '1sg_future': 'utiliserai', '2sg_future': 'utiliseras', '3sg_future': 'utilisera',
        '1pl_future': 'utiliserons', '2pl_future': 'utiliserez', '3pl_future': 'utiliseront',
      },
      de: {
        base: 'verwenden',
        '1sg_present': 'verwende', '2sg_present': 'verwendest', '3sg_present': 'verwendet',
        '1pl_present': 'verwenden', '2pl_present': 'verwendet', '3pl_present': 'verwenden',
        '1sg_past': 'verwendete', '2sg_past': 'verwendetest', '3sg_past': 'verwendete',
        '1pl_past': 'verwendeten', '2pl_past': 'verwendetet', '3pl_past': 'verwendeten',
        '2sg_imperative': 'verwende',
      },
      es: {
        base: 'usar',
        '1sg_present': 'uso', '2sg_present': 'usas', '3sg_present': 'usa',
        '1pl_present': 'usamos', '2pl_present': 'usáis', '3pl_present': 'usan',
        '1sg_past': 'usé', '2sg_past': 'usaste', '3sg_past': 'usó',
        '1pl_past': 'usamos', '2pl_past': 'usasteis', '3pl_past': 'usaron',
        '1sg_future': 'usaré', '2sg_future': 'usarás', '3sg_future': 'usará',
        '1pl_future': 'usaremos', '2pl_future': 'usaréis', '3pl_future': 'usarán',
      },
      ja: {
        base: '使う',
        reading: 'つかう',
        masu_present: '使います',
        masu_present_reading: 'つかいます',
        label: '使用',
        label_reading: 'しよう',
      },
      pt: {
        base: 'usar',
        '1sg_present': 'uso', '2sg_present': 'usa', '3sg_present': 'usa',
        '1pl_present': 'usamos', '2pl_present': 'usam', '3pl_present': 'usam',
        '1sg_past': 'usei', '2sg_past': 'usou', '3sg_past': 'usou',
        '1pl_past': 'usamos', '2pl_past': 'usaram', '3pl_past': 'usaram',
        '1sg_future': 'usarei', '2sg_future': 'usará', '3sg_future': 'usará',
        '1pl_future': 'usaremos', '2pl_future': 'usarão', '3pl_future': 'usarão',
      },
    },
  },

  // P09-E24's *spend* (rank 353), in its two halves (P09 D2; localization B85). SPEND_MONEY is "to use
  // money": Japanese 費やす, because 使う is USE's own word, and お金を使う, the everyday phrase, is the
  // gloss. Italian spendere is strong (spesi, speso); German ausgeben is separable (gibt … aus,
  // ausgegeben) with geben's e→i (gibst, the du command gib).
  {
    id: 'SPEND_MONEY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to pay out money',
    definition: infinitiveGloss('USE', 'MONEY'),
    synonym: 'spend money',
    emoji: '💸',
    forms: {
      en: {
        base: 'spend',
        '1sg_present': 'spend', '2sg_present': 'spend', '3sg_present': 'spends',
        '1pl_present': 'spend', '2pl_present': 'spend', '3pl_present': 'spend',
        past: 'spent',
      },
      it: {
        base: 'spendere',
        '1sg_present': 'spendo', '2sg_present': 'spendi', '3sg_present': 'spende',
        '1pl_present': 'spendiamo', '2pl_present': 'spendete', '3pl_present': 'spendono',
        '1sg_past': 'spesi', '2sg_past': 'spendesti', '3sg_past': 'spese',
        '1pl_past': 'spendemmo', '2pl_past': 'spendeste', '3pl_past': 'spesero',
        '1sg_future': 'spenderò', '2sg_future': 'spenderai', '3sg_future': 'spenderà',
        '1pl_future': 'spenderemo', '2pl_future': 'spenderete', '3pl_future': 'spenderanno',
      },
      fr: {
        base: 'dépenser',
        '1sg_present': 'dépense', '2sg_present': 'dépenses', '3sg_present': 'dépense',
        '1pl_present': 'dépensons', '2pl_present': 'dépensez', '3pl_present': 'dépensent',
        '1sg_past': 'dépensai', '2sg_past': 'dépensas', '3sg_past': 'dépensa',
        '1pl_past': 'dépensâmes', '2pl_past': 'dépensâtes', '3pl_past': 'dépensèrent',
        '1sg_future': 'dépenserai', '2sg_future': 'dépenseras', '3sg_future': 'dépensera',
        '1pl_future': 'dépenserons', '2pl_future': 'dépenserez', '3pl_future': 'dépenseront',
      },
      de: {
        base: 'ausgeben', particle: 'aus',
        '1sg_present': 'gebe', '2sg_present': 'gibst', '3sg_present': 'gibt',
        '1pl_present': 'geben', '2pl_present': 'gebt', '3pl_present': 'geben',
        '1sg_past': 'gab', '2sg_past': 'gabst', '3sg_past': 'gab',
        '1pl_past': 'gaben', '2pl_past': 'gabt', '3pl_past': 'gaben',
        '2sg_imperative': 'gib', // strong e→i: the du command keeps the vowel change
      },
      es: {
        base: 'gastar',
        '1sg_present': 'gasto', '2sg_present': 'gastas', '3sg_present': 'gasta',
        '1pl_present': 'gastamos', '2pl_present': 'gastáis', '3pl_present': 'gastan',
        '1sg_past': 'gasté', '2sg_past': 'gastaste', '3sg_past': 'gastó',
        '1pl_past': 'gastamos', '2pl_past': 'gastasteis', '3pl_past': 'gastaron',
        '1sg_future': 'gastaré', '2sg_future': 'gastarás', '3sg_future': 'gastará',
        '1pl_future': 'gastaremos', '2pl_future': 'gastaréis', '3pl_future': 'gastarán',
      },
      ja: {
        base: '費やす',
        reading: 'ついやす',
        masu_present: '費やします',
        masu_present_reading: 'ついやします',
      },
      pt: {
        base: 'gastar',
        '1sg_present': 'gasto', '2sg_present': 'gasta', '3sg_present': 'gasta',
        '1pl_present': 'gastamos', '2pl_present': 'gastam', '3pl_present': 'gastam',
        '1sg_past': 'gastei', '2sg_past': 'gastou', '3sg_past': 'gastou',
        '1pl_past': 'gastamos', '2pl_past': 'gastaram', '3pl_past': 'gastaram',
        '1sg_future': 'gastarei', '2sg_future': 'gastará', '3sg_future': 'gastará',
        '1pl_future': 'gastaremos', '2pl_future': 'gastarão', '3pl_future': 'gastarão',
      },
    },
  },
  // SPEND_TIME, the time as its object ("spends the day in the house"): passare, passer, verbringen
  // (inseparable, verbrachte, verbracht), pasar, 過ごす, passar. Transitive, so passare and passer take
  // HAVE. Glossed on STAY, not USE: "to use time" is also what one says of a clock. The period is
  // the duration `for` (per, pendant, einen Zeitraum, 期間), not `during`, whose Japanese 期間の間に is
  // heavy (B85 reading 3).
  {
    id: 'SPEND_TIME',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to pass time in a place or doing something',
    definition: infinitiveGloss('STAY', {
      complements: {
        locative: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } },
        temporal: { phrase: { concept: 'PERIOD_TIME', definiteness: 'indefinite' }, specifiers: [{ kind: 'temporal', value: 'for' }] },
      },
    }),
    synonym: 'spend time',
    emoji: '⏳',
    forms: {
      en: {
        base: 'spend',
        '1sg_present': 'spend', '2sg_present': 'spend', '3sg_present': 'spends',
        '1pl_present': 'spend', '2pl_present': 'spend', '3pl_present': 'spend',
        past: 'spent',
      },
      it: {
        base: 'passare',
        '1sg_present': 'passo', '2sg_present': 'passi', '3sg_present': 'passa',
        '1pl_present': 'passiamo', '2pl_present': 'passate', '3pl_present': 'passano',
        '1sg_past': 'passai', '2sg_past': 'passasti', '3sg_past': 'passò',
        '1pl_past': 'passammo', '2pl_past': 'passaste', '3pl_past': 'passarono',
        '1sg_future': 'passerò', '2sg_future': 'passerai', '3sg_future': 'passerà',
        '1pl_future': 'passeremo', '2pl_future': 'passerete', '3pl_future': 'passeranno',
      },
      fr: {
        base: 'passer',
        '1sg_present': 'passe', '2sg_present': 'passes', '3sg_present': 'passe',
        '1pl_present': 'passons', '2pl_present': 'passez', '3pl_present': 'passent',
        '1sg_past': 'passai', '2sg_past': 'passas', '3sg_past': 'passa',
        '1pl_past': 'passâmes', '2pl_past': 'passâtes', '3pl_past': 'passèrent',
        '1sg_future': 'passerai', '2sg_future': 'passeras', '3sg_future': 'passera',
        '1pl_future': 'passerons', '2pl_future': 'passerez', '3pl_future': 'passeront',
      },
      de: {
        base: 'verbringen',
        '1sg_present': 'verbringe', '2sg_present': 'verbringst', '3sg_present': 'verbringt',
        '1pl_present': 'verbringen', '2pl_present': 'verbringt', '3pl_present': 'verbringen',
        '1sg_past': 'verbrachte', '2sg_past': 'verbrachtest', '3sg_past': 'verbrachte',
        '1pl_past': 'verbrachten', '2pl_past': 'verbrachtet', '3pl_past': 'verbrachten',
      },
      es: {
        base: 'pasar',
        '1sg_present': 'paso', '2sg_present': 'pasas', '3sg_present': 'pasa',
        '1pl_present': 'pasamos', '2pl_present': 'pasáis', '3pl_present': 'pasan',
        '1sg_past': 'pasé', '2sg_past': 'pasaste', '3sg_past': 'pasó',
        '1pl_past': 'pasamos', '2pl_past': 'pasasteis', '3pl_past': 'pasaron',
        '1sg_future': 'pasaré', '2sg_future': 'pasarás', '3sg_future': 'pasará',
        '1pl_future': 'pasaremos', '2pl_future': 'pasaréis', '3pl_future': 'pasarán',
      },
      ja: {
        base: '過ごす',
        reading: 'すごす',
        masu_present: '過ごします',
        masu_present_reading: 'すごします',
      },
      pt: {
        base: 'passar',
        '1sg_present': 'passo', '2sg_present': 'passa', '3sg_present': 'passa',
        '1pl_present': 'passamos', '2pl_present': 'passam', '3pl_present': 'passam',
        '1sg_past': 'passei', '2sg_past': 'passou', '3sg_past': 'passou',
        '1pl_past': 'passamos', '2pl_past': 'passaram', '3pl_past': 'passaram',
        '1sg_future': 'passarei', '2sg_future': 'passará', '3sg_future': 'passará',
        '1pl_future': 'passaremos', '2pl_future': 'passarão', '3pl_future': 'passarão',
      },
    },
  },

  {
    // Licenses `direction` for where the copy goes ("copy to the clipboard"), and `locative` for where
    // it is kept — CLIPBOARD is "a place where one copies".
    id: 'COPY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'direction', 'source', 'cause', 'locative'],
    description: 'to make a duplicate of something',
    definition: infinitiveGloss('MAKE', { object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['OTHER'] }),
    emoji: '📋',
    forms: {
      en: {
        base: 'copy',
        '1sg_present': 'copy', '2sg_present': 'copy', '3sg_present': 'copies',
        '1pl_present': 'copy', '2pl_present': 'copy', '3pl_present': 'copy',
        past: 'copied',
      },
      it: {
        base: 'copiare',
        '1sg_present': 'copio', '2sg_present': 'copi', '3sg_present': 'copia',
        '1pl_present': 'copiamo', '2pl_present': 'copiate', '3pl_present': 'copiano',
        '1sg_past': 'copiai', '2sg_past': 'copiasti', '3sg_past': 'copiò',
        '1pl_past': 'copiammo', '2pl_past': 'copiaste', '3pl_past': 'copiarono',
        '1sg_future': 'copierò', '2sg_future': 'copierai', '3sg_future': 'copierà',
        '1pl_future': 'copieremo', '2pl_future': 'copierete', '3pl_future': 'copieranno',
      },
      fr: {
        base: 'copier',
        '1sg_present': 'copie', '2sg_present': 'copies', '3sg_present': 'copie',
        '1pl_present': 'copions', '2pl_present': 'copiez', '3pl_present': 'copient',
        '1sg_past': 'copiai', '2sg_past': 'copias', '3sg_past': 'copia',
        '1pl_past': 'copiâmes', '2pl_past': 'copiâtes', '3pl_past': 'copièrent',
        '1sg_future': 'copierai', '2sg_future': 'copieras', '3sg_future': 'copiera',
        '1pl_future': 'copierons', '2pl_future': 'copierez', '3pl_future': 'copieront',
      },
      de: {
        base: 'kopieren',
        '1sg_present': 'kopiere', '2sg_present': 'kopierst', '3sg_present': 'kopiert',
        '1pl_present': 'kopieren', '2pl_present': 'kopiert', '3pl_present': 'kopieren',
        '1sg_past': 'kopierte', '2sg_past': 'kopiertest', '3sg_past': 'kopierte',
        '1pl_past': 'kopierten', '2pl_past': 'kopiertet', '3pl_past': 'kopierten',
        '2sg_imperative': 'kopiere', // the optional du -e, kept
      },
      es: {
        base: 'copiar',
        '1sg_present': 'copio', '2sg_present': 'copias', '3sg_present': 'copia',
        '1pl_present': 'copiamos', '2pl_present': 'copiáis', '3pl_present': 'copian',
        '1sg_past': 'copié', '2sg_past': 'copiaste', '3sg_past': 'copió',
        '1pl_past': 'copiamos', '2pl_past': 'copiasteis', '3pl_past': 'copiaron',
        '1sg_future': 'copiaré', '2sg_future': 'copiarás', '3sg_future': 'copiará',
        '1pl_future': 'copiaremos', '2pl_future': 'copiaréis', '3pl_future': 'copiarán',
      },
      ja: {
        base: 'コピーする',
        reading: 'こぴーする',
        masu_present: 'コピーします',
        masu_present_reading: 'こぴーします',
        label: 'コピー',
      },
      pt: {
        base: 'copiar',
        '1sg_present': 'copio', '2sg_present': 'copia', '3sg_present': 'copia',
        '1pl_present': 'copiamos', '2pl_present': 'copiam', '3pl_present': 'copiam',
        '1sg_past': 'copiei', '2sg_past': 'copiou', '3sg_past': 'copiou',
        '1pl_past': 'copiamos', '2pl_past': 'copiaram', '3pl_past': 'copiaram',
        '1sg_future': 'copiarei', '2sg_future': 'copiará', '3sg_future': 'copiará',
        '1pl_future': 'copiaremos', '2pl_future': 'copiarão', '3pl_future': 'copiarão',
      },
    },
  },

  {
    // Transitive: to change where a thing is. The intransitive "move" that GO and RUN are kinds of is
    // another concept, a reflexive verb in Italian and German (C17). No language says this one
    // reflexively: it spostare, fr déplacer, de verschieben, es/pt mover, ja 移動する.
    id: 'MOVE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'direction', 'source', 'cause', 'locative'],
    description: 'to change the position of something',
    // "to change an object's place" (localization C28), RESIZE's genus on PLACE, with the object whose
    // place it is as the genitive: it "cambiare il luogo di un oggetto", ja 物体の場所を変える.
    definition: {
      ...infinitiveGloss('CHANGE'),
      directObject: {
        concept: 'PLACE',
        definiteness: 'definite',
        possessor: { concept: 'OBJECT_THING', definiteness: 'indefinite' },
      },
    },
    emoji: '↕️',
    forms: {
      en: {
        base: 'move',
        '1sg_present': 'move', '2sg_present': 'move', '3sg_present': 'moves',
        '1pl_present': 'move', '2pl_present': 'move', '3pl_present': 'move',
        past: 'moved',
      },
      it: {
        base: 'spostare',
        '1sg_present': 'sposto', '2sg_present': 'sposti', '3sg_present': 'sposta',
        '1pl_present': 'spostiamo', '2pl_present': 'spostate', '3pl_present': 'spostano',
        '1sg_past': 'spostai', '2sg_past': 'spostasti', '3sg_past': 'spostò',
        '1pl_past': 'spostammo', '2pl_past': 'spostaste', '3pl_past': 'spostarono',
        '1sg_future': 'sposterò', '2sg_future': 'sposterai', '3sg_future': 'sposterà',
        '1pl_future': 'sposteremo', '2pl_future': 'sposterete', '3pl_future': 'sposteranno',
      },
      fr: {
        base: 'déplacer',
        '1sg_present': 'déplace', '2sg_present': 'déplaces', '3sg_present': 'déplace',
        '1pl_present': 'déplaçons', '2pl_present': 'déplacez', '3pl_present': 'déplacent',
        '1sg_past': 'déplaçai', '2sg_past': 'déplaças', '3sg_past': 'déplaça',
        '1pl_past': 'déplaçâmes', '2pl_past': 'déplaçâtes', '3pl_past': 'déplacèrent',
        '1sg_future': 'déplacerai', '2sg_future': 'déplaceras', '3sg_future': 'déplacera',
        '1pl_future': 'déplacerons', '2pl_future': 'déplacerez', '3pl_future': 'déplaceront',
      },
      de: {
        base: 'verschieben',
        '1sg_present': 'verschiebe', '2sg_present': 'verschiebst', '3sg_present': 'verschiebt',
        '1pl_present': 'verschieben', '2pl_present': 'verschiebt', '3pl_present': 'verschieben',
        '1sg_past': 'verschob', '2sg_past': 'verschobst', '3sg_past': 'verschob',
        '1pl_past': 'verschoben', '2pl_past': 'verschobt', '3pl_past': 'verschoben',
      },
      es: {
        base: 'mover',
        '1sg_present': 'muevo', '2sg_present': 'mueves', '3sg_present': 'mueve',
        '1pl_present': 'movemos', '2pl_present': 'movéis', '3pl_present': 'mueven',
        '1sg_past': 'moví', '2sg_past': 'moviste', '3sg_past': 'movió',
        '1pl_past': 'movimos', '2pl_past': 'movisteis', '3pl_past': 'movieron',
        '1sg_future': 'moveré', '2sg_future': 'moverás', '3sg_future': 'moverá',
        '1pl_future': 'moveremos', '2pl_future': 'moveréis', '3pl_future': 'moverán',
      },
      ja: {
        base: '移動する',
        reading: 'いどうする',
        masu_present: '移動します',
        masu_present_reading: 'いどうします',
        label: '移動',
        label_reading: 'いどう',
      },
      pt: {
        base: 'mover',
        '1sg_present': 'movo', '2sg_present': 'move', '3sg_present': 'move',
        '1pl_present': 'movemos', '2pl_present': 'movem', '3pl_present': 'movem',
        '1sg_past': 'movi', '2sg_past': 'moveu', '3sg_past': 'moveu',
        '1pl_past': 'movemos', '2pl_past': 'moveram', '3pl_past': 'moveram',
        '1sg_future': 'moverei', '2sg_future': 'moverá', '3sg_future': 'moverá',
        '1pl_future': 'moveremos', '2pl_future': 'moverão', '3pl_future': 'moverão',
      },
    },
  },

  {
    // To go away from a place — what esc does to the slot or the period the cursor is in (localization
    // B44). French quitter, German verlassen and Japanese 出る take the place as their object; Italian,
    // Spanish and Portuguese go OUT OF it, uscire da / salir de / sair de, the verbs their UIs say it
    // with ("Esci", "Salir", "Sair"). The place is still the verb's patient in the plan and the
    // preposition is lexical (`object_prep`, as CLICK's), so those three keep the active where a
    // passive is asked for, as CLICK does. Italian uscire takes essere; Spanish salir's tú command is
    // the irregular "sal" (mood.ts). Japanese instructions say 退出, the verbal noun a "leave" button
    // takes, since the stem of 出る is a bare 出.
    //
    // English has three "leave" concepts since B61 (this one, LEAVE_BEHIND and LEAVE_DEPART), so the
    // picker says which: "exit", the going out of a place.
    id: 'LEAVE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'direction', 'cause'],
    description: 'to go away from a place',
    synonym: 'exit',
    emoji: '🚪',
    forms: {
      en: {
        base: 'leave',
        '1sg_present': 'leave', '2sg_present': 'leave', '3sg_present': 'leaves',
        '1pl_present': 'leave', '2pl_present': 'leave', '3pl_present': 'leave',
        past: 'left',
      },
      it: {
        base: 'uscire', object_prep: 'da',
        '1sg_present': 'esco', '2sg_present': 'esci', '3sg_present': 'esce',
        '1pl_present': 'usciamo', '2pl_present': 'uscite', '3pl_present': 'escono',
        '1sg_past': 'uscii', '2sg_past': 'uscisti', '3sg_past': 'uscì',
        '1pl_past': 'uscimmo', '2pl_past': 'usciste', '3pl_past': 'uscirono',
        '1sg_future': 'uscirò', '2sg_future': 'uscirai', '3sg_future': 'uscirà',
        '1pl_future': 'usciremo', '2pl_future': 'uscirete', '3pl_future': 'usciranno',
      },
      fr: {
        base: 'quitter',
        '1sg_present': 'quitte', '2sg_present': 'quittes', '3sg_present': 'quitte',
        '1pl_present': 'quittons', '2pl_present': 'quittez', '3pl_present': 'quittent',
        '1sg_past': 'quittai', '2sg_past': 'quittas', '3sg_past': 'quitta',
        '1pl_past': 'quittâmes', '2pl_past': 'quittâtes', '3pl_past': 'quittèrent',
        '1sg_future': 'quitterai', '2sg_future': 'quitteras', '3sg_future': 'quittera',
        '1pl_future': 'quitterons', '2pl_future': 'quitterez', '3pl_future': 'quitteront',
      },
      de: {
        base: 'verlassen',
        '1sg_present': 'verlasse', '2sg_present': 'verlässt', '3sg_present': 'verlässt',
        '1pl_present': 'verlassen', '2pl_present': 'verlasst', '3pl_present': 'verlassen',
        '1sg_past': 'verließ', '2sg_past': 'verließest', '3sg_past': 'verließ',
        '1pl_past': 'verließen', '2pl_past': 'verließt', '3pl_past': 'verließen',
        '2sg_imperative': 'verlass', // strong a→ä: the du command drops the umlaut
      },
      es: {
        base: 'salir', object_prep: 'de',
        '1sg_present': 'salgo', '2sg_present': 'sales', '3sg_present': 'sale',
        '1pl_present': 'salimos', '2pl_present': 'salís', '3pl_present': 'salen',
        '1sg_past': 'salí', '2sg_past': 'saliste', '3sg_past': 'salió',
        '1pl_past': 'salimos', '2pl_past': 'salisteis', '3pl_past': 'salieron',
        '1sg_future': 'saldré', '2sg_future': 'saldrás', '3sg_future': 'saldrá',
        '1pl_future': 'saldremos', '2pl_future': 'saldréis', '3pl_future': 'saldrán',
      },
      ja: {
        base: '出る',
        reading: 'でる',
        masu_present: '出ます',
        masu_present_reading: 'でます',
        label: '退出',
        label_reading: 'たいしゅつ',
      },
      pt: {
        base: 'sair', object_prep: 'de',
        '1sg_present': 'saio', '2sg_present': 'sai', '3sg_present': 'sai',
        '1pl_present': 'saímos', '2pl_present': 'saem', '3pl_present': 'saem',
        '1sg_past': 'saí', '2sg_past': 'saiu', '3sg_past': 'saiu',
        '1pl_past': 'saímos', '2pl_past': 'saíram', '3pl_past': 'saíram',
        '1sg_future': 'sairei', '2sg_future': 'sairá', '3sg_future': 'sairá',
        '1pl_future': 'sairemos', '2pl_future': 'sairão', '3pl_future': 'sairão',
      },
    },
  },

  {
    // German skalieren: "die Größe ändern" is a phrase whose object is a genitive, not the verb's
    // accusative. Japanese サイズ変更, the verbal noun its UIs use.
    id: 'RESIZE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to change the size of something',
    definition: infinitiveGloss('CHANGE', 'SIZE'),
    emoji: '↔️',
    isA: 'CHANGE',
    forms: {
      en: {
        base: 'resize',
        '1sg_present': 'resize', '2sg_present': 'resize', '3sg_present': 'resizes',
        '1pl_present': 'resize', '2pl_present': 'resize', '3pl_present': 'resize',
        past: 'resized',
      },
      it: {
        base: 'ridimensionare',
        '1sg_present': 'ridimensiono', '2sg_present': 'ridimensioni', '3sg_present': 'ridimensiona',
        '1pl_present': 'ridimensioniamo', '2pl_present': 'ridimensionate', '3pl_present': 'ridimensionano',
        '1sg_past': 'ridimensionai', '2sg_past': 'ridimensionasti', '3sg_past': 'ridimensionò',
        '1pl_past': 'ridimensionammo', '2pl_past': 'ridimensionaste', '3pl_past': 'ridimensionarono',
        '1sg_future': 'ridimensionerò', '2sg_future': 'ridimensionerai', '3sg_future': 'ridimensionerà',
        '1pl_future': 'ridimensioneremo', '2pl_future': 'ridimensionerete', '3pl_future': 'ridimensioneranno',
      },
      fr: {
        base: 'redimensionner',
        '1sg_present': 'redimensionne', '2sg_present': 'redimensionnes', '3sg_present': 'redimensionne',
        '1pl_present': 'redimensionnons', '2pl_present': 'redimensionnez', '3pl_present': 'redimensionnent',
        '1sg_past': 'redimensionnai', '2sg_past': 'redimensionnas', '3sg_past': 'redimensionna',
        '1pl_past': 'redimensionnâmes', '2pl_past': 'redimensionnâtes', '3pl_past': 'redimensionnèrent',
        '1sg_future': 'redimensionnerai', '2sg_future': 'redimensionneras', '3sg_future': 'redimensionnera',
        '1pl_future': 'redimensionnerons', '2pl_future': 'redimensionnerez', '3pl_future': 'redimensionneront',
      },
      de: {
        base: 'skalieren',
        '1sg_present': 'skaliere', '2sg_present': 'skalierst', '3sg_present': 'skaliert',
        '1pl_present': 'skalieren', '2pl_present': 'skaliert', '3pl_present': 'skalieren',
        '1sg_past': 'skalierte', '2sg_past': 'skaliertest', '3sg_past': 'skalierte',
        '1pl_past': 'skalierten', '2pl_past': 'skaliertet', '3pl_past': 'skalierten',
        '2sg_imperative': 'skaliere', // the optional du -e, kept
      },
      es: {
        base: 'redimensionar',
        '1sg_present': 'redimensiono', '2sg_present': 'redimensionas', '3sg_present': 'redimensiona',
        '1pl_present': 'redimensionamos', '2pl_present': 'redimensionáis', '3pl_present': 'redimensionan',
        '1sg_past': 'redimensioné', '2sg_past': 'redimensionaste', '3sg_past': 'redimensionó',
        '1pl_past': 'redimensionamos', '2pl_past': 'redimensionasteis', '3pl_past': 'redimensionaron',
        '1sg_future': 'redimensionaré', '2sg_future': 'redimensionarás', '3sg_future': 'redimensionará',
        '1pl_future': 'redimensionaremos', '2pl_future': 'redimensionaréis', '3pl_future': 'redimensionarán',
      },
      ja: {
        base: 'サイズ変更する',
        reading: 'さいずへんこうする',
        masu_present: 'サイズ変更します',
        masu_present_reading: 'さいずへんこうします',
        label: 'サイズ変更',
        label_reading: 'さいずへんこう',
      },
      pt: {
        base: 'redimensionar',
        '1sg_present': 'redimensiono', '2sg_present': 'redimensiona', '3sg_present': 'redimensiona',
        '1pl_present': 'redimensionamos', '2pl_present': 'redimensionam', '3pl_present': 'redimensionam',
        '1sg_past': 'redimensionei', '2sg_past': 'redimensionou', '3sg_past': 'redimensionou',
        '1pl_past': 'redimensionamos', '2pl_past': 'redimensionaram', '3pl_past': 'redimensionaram',
        '1sg_future': 'redimensionarei', '2sg_future': 'redimensionará', '3sg_future': 'redimensionará',
        '1pl_future': 'redimensionaremos', '2pl_future': 'redimensionarão', '3pl_future': 'redimensionarão',
      },
    },
  },

  {
    // The pointer gesture: holding a thing and moving it. French says "faire glisser" in full, but
    // an interface label writes the bare "glisser" ("glisser pour redimensionner"), and a lexeme
    // has to be one word to conjugate, so glisser is what is seeded. German zieht, Italian
    // trascina, Japanese takes the katakana loan every interface there uses.
    id: 'DRAG',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'direction', 'cause'],
    description: 'to move a thing by holding it and pulling',
    // "to move objects with the cursor" (localization C28): the gesture's instrument is what tells
    // it from its genus MOVE, which "to move objects" alone would restate. Definite, the one cursor
    // a screen has.
    definition: infinitiveGloss('MOVE', {
      object: 'OBJECT_THING',
      number: 'plural',
      complements: { instrumental: { phrase: { concept: 'CURSOR', definiteness: 'definite' } } },
    }),
    emoji: '🫳',
    isA: 'MOVE',
    forms: {
      en: {
        base: 'drag',
        '1sg_present': 'drag', '2sg_present': 'drag', '3sg_present': 'drags',
        '1pl_present': 'drag', '2pl_present': 'drag', '3pl_present': 'drag',
        past: 'dragged',
      },
      it: {
        base: 'trascinare',
        '1sg_present': 'trascino', '2sg_present': 'trascini', '3sg_present': 'trascina',
        '1pl_present': 'trasciniamo', '2pl_present': 'trascinate', '3pl_present': 'trascinano',
        '1sg_past': 'trascinai', '2sg_past': 'trascinasti', '3sg_past': 'trascinò',
        '1pl_past': 'trascinammo', '2pl_past': 'trascinaste', '3pl_past': 'trascinarono',
        '1sg_future': 'trascinerò', '2sg_future': 'trascinerai', '3sg_future': 'trascinerà',
        '1pl_future': 'trascineremo', '2pl_future': 'trascinerete', '3pl_future': 'trascineranno',
      },
      fr: {
        base: 'glisser',
        '1sg_present': 'glisse', '2sg_present': 'glisses', '3sg_present': 'glisse',
        '1pl_present': 'glissons', '2pl_present': 'glissez', '3pl_present': 'glissent',
        '1sg_past': 'glissai', '2sg_past': 'glissas', '3sg_past': 'glissa',
        '1pl_past': 'glissâmes', '2pl_past': 'glissâtes', '3pl_past': 'glissèrent',
        '1sg_future': 'glisserai', '2sg_future': 'glisseras', '3sg_future': 'glissera',
        '1pl_future': 'glisserons', '2pl_future': 'glisserez', '3pl_future': 'glisseront',
      },
      de: {
        base: 'ziehen',
        '1sg_present': 'ziehe', '2sg_present': 'ziehst', '3sg_present': 'zieht',
        '1pl_present': 'ziehen', '2pl_present': 'zieht', '3pl_present': 'ziehen',
        '1sg_past': 'zog', '2sg_past': 'zogst', '3sg_past': 'zog',
        '1pl_past': 'zogen', '2pl_past': 'zogt', '3pl_past': 'zogen',
      },
      es: {
        base: 'arrastrar',
        '1sg_present': 'arrastro', '2sg_present': 'arrastras', '3sg_present': 'arrastra',
        '1pl_present': 'arrastramos', '2pl_present': 'arrastráis', '3pl_present': 'arrastran',
        '1sg_past': 'arrastré', '2sg_past': 'arrastraste', '3sg_past': 'arrastró',
        '1pl_past': 'arrastramos', '2pl_past': 'arrastrasteis', '3pl_past': 'arrastraron',
        '1sg_future': 'arrastraré', '2sg_future': 'arrastrarás', '3sg_future': 'arrastrará',
        '1pl_future': 'arrastraremos', '2pl_future': 'arrastraréis', '3pl_future': 'arrastrarán',
      },
      ja: {
        base: 'ドラッグする',
        masu_present: 'ドラッグします',
      },
      pt: {
        base: 'arrastar',
        '1sg_present': 'arrasto', '2sg_present': 'arrasta', '3sg_present': 'arrasta',
        '1pl_present': 'arrastamos', '2pl_present': 'arrastam', '3pl_present': 'arrastam',
        '1sg_past': 'arrastei', '2sg_past': 'arrastou', '3sg_past': 'arrastou',
        '1pl_past': 'arrastamos', '2pl_past': 'arrastaram', '3pl_past': 'arrastaram',
        '1sg_future': 'arrastarei', '2sg_future': 'arrastará', '3sg_future': 'arrastará',
        '1pl_future': 'arrastaremos', '2pl_future': 'arrastarão', '3pl_future': 'arrastarão',
      },
    },
  },

  {
    // A setting or a function, switched off: it disattivare, fr désactiver, es desactivar, pt
    // desativar, de deaktivieren, ja オフにする — not the lamp one puts out (it spegnere).
    id: 'TURN_OFF',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to stop a setting or a function from working',
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BE', predicate: 'ACTIVE', negative: true },
    ),
    emoji: '📴',
    synonym: 'switch off',
    forms: {
      en: {
        // phrasal, like EXTINGUISH: "turns off the option", "turns it off".
        base: 'turn off',
        '1sg_present': 'turn off', '2sg_present': 'turn off', '3sg_present': 'turns off',
        '1pl_present': 'turn off', '2pl_present': 'turn off', '3pl_present': 'turn off',
        past: 'turned off',
        particle: 'off',
      },
      it: {
        base: 'disattivare',
        '1sg_present': 'disattivo', '2sg_present': 'disattivi', '3sg_present': 'disattiva',
        '1pl_present': 'disattiviamo', '2pl_present': 'disattivate', '3pl_present': 'disattivano',
        '1sg_past': 'disattivai', '2sg_past': 'disattivasti', '3sg_past': 'disattivò',
        '1pl_past': 'disattivammo', '2pl_past': 'disattivaste', '3pl_past': 'disattivarono',
        '1sg_future': 'disattiverò', '2sg_future': 'disattiverai', '3sg_future': 'disattiverà',
        '1pl_future': 'disattiveremo', '2pl_future': 'disattiverete', '3pl_future': 'disattiveranno',
      },
      fr: {
        base: 'désactiver',
        '1sg_present': 'désactive', '2sg_present': 'désactives', '3sg_present': 'désactive',
        '1pl_present': 'désactivons', '2pl_present': 'désactivez', '3pl_present': 'désactivent',
        '1sg_past': 'désactivai', '2sg_past': 'désactivas', '3sg_past': 'désactiva',
        '1pl_past': 'désactivâmes', '2pl_past': 'désactivâtes', '3pl_past': 'désactivèrent',
        '1sg_future': 'désactiverai', '2sg_future': 'désactiveras', '3sg_future': 'désactivera',
        '1pl_future': 'désactiverons', '2pl_future': 'désactiverez', '3pl_future': 'désactiveront',
      },
      de: {
        base: 'deaktivieren',
        '1sg_present': 'deaktiviere', '2sg_present': 'deaktivierst', '3sg_present': 'deaktiviert',
        '1pl_present': 'deaktivieren', '2pl_present': 'deaktiviert', '3pl_present': 'deaktivieren',
        '1sg_past': 'deaktivierte', '2sg_past': 'deaktiviertest', '3sg_past': 'deaktivierte',
        '1pl_past': 'deaktivierten', '2pl_past': 'deaktiviertet', '3pl_past': 'deaktivierten',
        '2sg_imperative': 'deaktiviere', // the optional du -e, kept
      },
      es: {
        base: 'desactivar',
        '1sg_present': 'desactivo', '2sg_present': 'desactivas', '3sg_present': 'desactiva',
        '1pl_present': 'desactivamos', '2pl_present': 'desactiváis', '3pl_present': 'desactivan',
        '1sg_past': 'desactivé', '2sg_past': 'desactivaste', '3sg_past': 'desactivó',
        '1pl_past': 'desactivamos', '2pl_past': 'desactivasteis', '3pl_past': 'desactivaron',
        '1sg_future': 'desactivaré', '2sg_future': 'desactivarás', '3sg_future': 'desactivará',
        '1pl_future': 'desactivaremos', '2pl_future': 'desactivaréis', '3pl_future': 'desactivarán',
      },
      ja: {
        base: 'オフにする',
        masu_present: 'オフにします',
      },
      pt: {
        base: 'desativar',
        '1sg_present': 'desativo', '2sg_present': 'desativa', '3sg_present': 'desativa',
        '1pl_present': 'desativamos', '2pl_present': 'desativam', '3pl_present': 'desativam',
        '1sg_past': 'desativei', '2sg_past': 'desativou', '3sg_past': 'desativou',
        '1pl_past': 'desativamos', '2pl_past': 'desativaram', '3pl_past': 'desativaram',
        '1sg_future': 'desativarei', '2sg_future': 'desativará', '3sg_future': 'desativará',
        '1pl_future': 'desativaremos', '2pl_future': 'desativarão', '3pl_future': 'desativarão',
      },
    },
  },

  {
    // Giving a setting its value: what the console's setting commands do to a noun's number or a
    // verb's tense (localization B47). The software sense in every language — it impostare, fr
    // définir, es establecer, pt definir, ja 設定する — not the table one sets (it apparecchiare) nor
    // the sun that sets. German festlegen is separable, like ADD's hinzufügen: the finite forms are
    // legen's and the clause places the particle ("legt den Numerus fest", "festlegt" in a
    // subordinate clause, "festzulegen"). Spanish establecer takes -zc- in the 1st singular
    // (establezco).
    id: 'SET',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to give a setting a value',
    // "to choose a value" (localization C28). "To give a value to an option" says it more fully and
    // renders wrong twice: German puts the recipient in the accusative ("einen Wert in eine Option
    // geben") and Japanese GIVE is あげる, which beside 値を reads as raising it.
    definition: infinitiveGloss('CHOOSE', { object: 'VALUE', definiteness: 'indefinite' }),
    emoji: '⚙️',
    forms: {
      en: {
        base: 'set',
        '1sg_present': 'set', '2sg_present': 'set', '3sg_present': 'sets',
        '1pl_present': 'set', '2pl_present': 'set', '3pl_present': 'set',
        past: 'set',
      },
      it: {
        base: 'impostare',
        '1sg_present': 'imposto', '2sg_present': 'imposti', '3sg_present': 'imposta',
        '1pl_present': 'impostiamo', '2pl_present': 'impostate', '3pl_present': 'impostano',
        '1sg_past': 'impostai', '2sg_past': 'impostasti', '3sg_past': 'impostò',
        '1pl_past': 'impostammo', '2pl_past': 'impostaste', '3pl_past': 'impostarono',
        '1sg_future': 'imposterò', '2sg_future': 'imposterai', '3sg_future': 'imposterà',
        '1pl_future': 'imposteremo', '2pl_future': 'imposterete', '3pl_future': 'imposteranno',
      },
      fr: {
        base: 'définir',
        '1sg_present': 'définis', '2sg_present': 'définis', '3sg_present': 'définit',
        '1pl_present': 'définissons', '2pl_present': 'définissez', '3pl_present': 'définissent',
        '1sg_past': 'définis', '2sg_past': 'définis', '3sg_past': 'définit',
        '1pl_past': 'définîmes', '2pl_past': 'définîtes', '3pl_past': 'définirent',
        '1sg_future': 'définirai', '2sg_future': 'définiras', '3sg_future': 'définira',
        '1pl_future': 'définirons', '2pl_future': 'définirez', '3pl_future': 'définiront',
      },
      de: {
        base: 'festlegen', particle: 'fest',
        '1sg_present': 'lege', '2sg_present': 'legst', '3sg_present': 'legt',
        '1pl_present': 'legen', '2pl_present': 'legt', '3pl_present': 'legen',
        '1sg_past': 'legte', '2sg_past': 'legtest', '3sg_past': 'legte',
        '1pl_past': 'legten', '2pl_past': 'legtet', '3pl_past': 'legten',
      },
      es: {
        base: 'establecer',
        '1sg_present': 'establezco', '2sg_present': 'estableces', '3sg_present': 'establece',
        '1pl_present': 'establecemos', '2pl_present': 'establecéis', '3pl_present': 'establecen',
        '1sg_past': 'establecí', '2sg_past': 'estableciste', '3sg_past': 'estableció',
        '1pl_past': 'establecimos', '2pl_past': 'establecisteis', '3pl_past': 'establecieron',
        '1sg_future': 'estableceré', '2sg_future': 'establecerás', '3sg_future': 'establecerá',
        '1pl_future': 'estableceremos', '2pl_future': 'estableceréis', '3pl_future': 'establecerán',
      },
      ja: {
        base: '設定する',
        reading: 'せっていする',
        masu_present: '設定します',
        masu_present_reading: 'せっていします',
      },
      pt: {
        base: 'definir',
        '1sg_present': 'defino', '2sg_present': 'define', '3sg_present': 'define',
        '1pl_present': 'definimos', '2pl_present': 'definem', '3pl_present': 'definem',
        '1sg_past': 'defini', '2sg_past': 'definiu', '3sg_past': 'definiu',
        '1pl_past': 'definimos', '2pl_past': 'definiram', '3pl_past': 'definiram',
        '1sg_future': 'definirei', '2sg_future': 'definirá', '3sg_future': 'definirá',
        '1pl_future': 'definiremos', '2pl_future': 'definirão', '3pl_future': 'definirão',
      },
    },
  },

  // The phrase console's verbs (localization B45): pinning a line and taking the pin off, completing
  // a word begun, applying a line. Each language's interface word for the pin and its undoing: it
  // fissare / sbloccare, fr épingler / désépingler, es fijar / desfijar, pt fixar / desafixar, de
  // anheften / lösen (as in "An Taskleiste anheften" / "Von Taskleiste lösen").
  {
    // German anheften is separable, like hinzufügen (ADD): the finite forms are heften's, and the
    // clause places the particle. Japanese labels with the verbal noun ピン留め, as ADD with 追加.
    id: 'PIN',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to keep an item at the top of a list',
    emoji: '📌',
    forms: {
      en: {
        base: 'pin',
        '1sg_present': 'pin', '2sg_present': 'pin', '3sg_present': 'pins',
        '1pl_present': 'pin', '2pl_present': 'pin', '3pl_present': 'pin',
        past: 'pinned',
      },
      it: {
        base: 'fissare',
        '1sg_present': 'fisso', '2sg_present': 'fissi', '3sg_present': 'fissa',
        '1pl_present': 'fissiamo', '2pl_present': 'fissate', '3pl_present': 'fissano',
        '1sg_past': 'fissai', '2sg_past': 'fissasti', '3sg_past': 'fissò',
        '1pl_past': 'fissammo', '2pl_past': 'fissaste', '3pl_past': 'fissarono',
        '1sg_future': 'fisserò', '2sg_future': 'fisserai', '3sg_future': 'fisserà',
        '1pl_future': 'fisseremo', '2pl_future': 'fisserete', '3pl_future': 'fisseranno',
      },
      fr: {
        base: 'épingler',
        '1sg_present': 'épingle', '2sg_present': 'épingles', '3sg_present': 'épingle',
        '1pl_present': 'épinglons', '2pl_present': 'épinglez', '3pl_present': 'épinglent',
        '1sg_past': 'épinglai', '2sg_past': 'épinglas', '3sg_past': 'épingla',
        '1pl_past': 'épinglâmes', '2pl_past': 'épinglâtes', '3pl_past': 'épinglèrent',
        '1sg_future': 'épinglerai', '2sg_future': 'épingleras', '3sg_future': 'épinglera',
        '1pl_future': 'épinglerons', '2pl_future': 'épinglerez', '3pl_future': 'épingleront',
      },
      de: {
        base: 'anheften', particle: 'an',
        '1sg_present': 'hefte', '2sg_present': 'heftest', '3sg_present': 'heftet',
        '1pl_present': 'heften', '2pl_present': 'heftet', '3pl_present': 'heften',
        '1sg_past': 'heftete', '2sg_past': 'heftetest', '3sg_past': 'heftete',
        '1pl_past': 'hefteten', '2pl_past': 'heftetet', '3pl_past': 'hefteten',
        '2sg_imperative': 'hefte',
      },
      es: {
        base: 'fijar',
        '1sg_present': 'fijo', '2sg_present': 'fijas', '3sg_present': 'fija',
        '1pl_present': 'fijamos', '2pl_present': 'fijáis', '3pl_present': 'fijan',
        '1sg_past': 'fijé', '2sg_past': 'fijaste', '3sg_past': 'fijó',
        '1pl_past': 'fijamos', '2pl_past': 'fijasteis', '3pl_past': 'fijaron',
        '1sg_future': 'fijaré', '2sg_future': 'fijarás', '3sg_future': 'fijará',
        '1pl_future': 'fijaremos', '2pl_future': 'fijaréis', '3pl_future': 'fijarán',
      },
      ja: {
        base: 'ピン留めする',
        reading: 'ぴんどめする',
        masu_present: 'ピン留めします',
        masu_present_reading: 'ぴんどめします',
        label: 'ピン留め',
        label_reading: 'ぴんどめ',
      },
      pt: {
        base: 'fixar',
        '1sg_present': 'fixo', '2sg_present': 'fixa', '3sg_present': 'fixa',
        '1pl_present': 'fixamos', '2pl_present': 'fixam', '3pl_present': 'fixam',
        '1sg_past': 'fixei', '2sg_past': 'fixou', '3sg_past': 'fixou',
        '1pl_past': 'fixamos', '2pl_past': 'fixaram', '3pl_past': 'fixaram',
        '1sg_future': 'fixarei', '2sg_future': 'fixará', '3sg_future': 'fixará',
        '1pl_future': 'fixaremos', '2pl_future': 'fixarão', '3pl_future': 'fixarão',
      },
    },
  },
  {
    // Japanese ピン留め解除する, one verbal noun: ピン留めを外す would put a second を beside the object's.
    id: 'UNPIN',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to stop keeping an item at the top of a list',
    // "to cause an object not to be pinned" (localization C28), HIDE's shape on PIN's participle —
    // PIN's word, not this one's, so the gloss is no circle: fissato beside sbloccare, fijado beside
    // desfijar, ピン留め済み beside ピン留め解除する.
    definition: causativeGloss(
      { object: 'OBJECT_THING', definiteness: 'indefinite' },
      { verb: 'BE', predicate: 'PINNED', negative: true },
    ),
    emoji: '📍',
    forms: {
      en: {
        base: 'unpin',
        '1sg_present': 'unpin', '2sg_present': 'unpin', '3sg_present': 'unpins',
        '1pl_present': 'unpin', '2pl_present': 'unpin', '3pl_present': 'unpin',
        past: 'unpinned',
      },
      it: {
        base: 'sbloccare',
        '1sg_present': 'sblocco', '2sg_present': 'sblocchi', '3sg_present': 'sblocca',
        '1pl_present': 'sblocchiamo', '2pl_present': 'sbloccate', '3pl_present': 'sbloccano',
        '1sg_past': 'sbloccai', '2sg_past': 'sbloccasti', '3sg_past': 'sbloccò',
        '1pl_past': 'sbloccammo', '2pl_past': 'sbloccaste', '3pl_past': 'sbloccarono',
        '1sg_future': 'sbloccherò', '2sg_future': 'sbloccherai', '3sg_future': 'sbloccherà',
        '1pl_future': 'sbloccheremo', '2pl_future': 'sbloccherete', '3pl_future': 'sbloccheranno',
      },
      fr: {
        base: 'désépingler',
        '1sg_present': 'désépingle', '2sg_present': 'désépingles', '3sg_present': 'désépingle',
        '1pl_present': 'désépinglons', '2pl_present': 'désépinglez', '3pl_present': 'désépinglent',
        '1sg_past': 'désépinglai', '2sg_past': 'désépinglas', '3sg_past': 'désépingla',
        '1pl_past': 'désépinglâmes', '2pl_past': 'désépinglâtes', '3pl_past': 'désépinglèrent',
        '1sg_future': 'désépinglerai', '2sg_future': 'désépingleras', '3sg_future': 'désépinglera',
        '1pl_future': 'désépinglerons', '2pl_future': 'désépinglerez', '3pl_future': 'désépingleront',
      },
      de: {
        base: 'lösen',
        '1sg_present': 'löse', '2sg_present': 'löst', '3sg_present': 'löst',
        '1pl_present': 'lösen', '2pl_present': 'löst', '3pl_present': 'lösen',
        '1sg_past': 'löste', '2sg_past': 'löstest', '3sg_past': 'löste',
        '1pl_past': 'lösten', '2pl_past': 'löstet', '3pl_past': 'lösten',
        '2sg_imperative': 'löse',
      },
      es: {
        base: 'desfijar',
        '1sg_present': 'desfijo', '2sg_present': 'desfijas', '3sg_present': 'desfija',
        '1pl_present': 'desfijamos', '2pl_present': 'desfijáis', '3pl_present': 'desfijan',
        '1sg_past': 'desfijé', '2sg_past': 'desfijaste', '3sg_past': 'desfijó',
        '1pl_past': 'desfijamos', '2pl_past': 'desfijasteis', '3pl_past': 'desfijaron',
        '1sg_future': 'desfijaré', '2sg_future': 'desfijarás', '3sg_future': 'desfijará',
        '1pl_future': 'desfijaremos', '2pl_future': 'desfijaréis', '3pl_future': 'desfijarán',
      },
      ja: {
        base: 'ピン留め解除する',
        reading: 'ぴんどめかいじょする',
        masu_present: 'ピン留め解除します',
        masu_present_reading: 'ぴんどめかいじょします',
        label: 'ピン留め解除',
        label_reading: 'ぴんどめかいじょ',
      },
      pt: {
        base: 'desafixar',
        '1sg_present': 'desafixo', '2sg_present': 'desafixa', '3sg_present': 'desafixa',
        '1pl_present': 'desafixamos', '2pl_present': 'desafixam', '3pl_present': 'desafixam',
        '1sg_past': 'desafixei', '2sg_past': 'desafixou', '3sg_past': 'desafixou',
        '1pl_past': 'desafixamos', '2pl_past': 'desafixaram', '3pl_past': 'desafixaram',
        '1sg_future': 'desafixarei', '2sg_future': 'desafixará', '3sg_future': 'desafixará',
        '1pl_future': 'desafixaremos', '2pl_future': 'desafixarão', '3pl_future': 'desafixarão',
      },
    },
  },
  {
    // Finishing a word that has been started, as ⇥ does: the completion sense, not "to accomplish".
    // German vervollständigen, inseparable; Japanese 補完, the word every editor's completion uses.
    id: 'COMPLETE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to finish a word that has been started',
    definition: infinitiveGloss('WRITE', { object: 'WORD', definiteness: 'definite' }),
    emoji: '⇥',
    forms: {
      en: {
        base: 'complete',
        '1sg_present': 'complete', '2sg_present': 'complete', '3sg_present': 'completes',
        '1pl_present': 'complete', '2pl_present': 'complete', '3pl_present': 'complete',
        past: 'completed',
      },
      it: {
        base: 'completare',
        '1sg_present': 'completo', '2sg_present': 'completi', '3sg_present': 'completa',
        '1pl_present': 'completiamo', '2pl_present': 'completate', '3pl_present': 'completano',
        '1sg_past': 'completai', '2sg_past': 'completasti', '3sg_past': 'completò',
        '1pl_past': 'completammo', '2pl_past': 'completaste', '3pl_past': 'completarono',
        '1sg_future': 'completerò', '2sg_future': 'completerai', '3sg_future': 'completerà',
        '1pl_future': 'completeremo', '2pl_future': 'completerete', '3pl_future': 'completeranno',
      },
      fr: {
        base: 'compléter',
        '1sg_present': 'complète', '2sg_present': 'complètes', '3sg_present': 'complète',
        '1pl_present': 'complétons', '2pl_present': 'complétez', '3pl_present': 'complètent',
        '1sg_past': 'complétai', '2sg_past': 'complétas', '3sg_past': 'compléta',
        '1pl_past': 'complétâmes', '2pl_past': 'complétâtes', '3pl_past': 'complétèrent',
        '1sg_future': 'compléterai', '2sg_future': 'compléteras', '3sg_future': 'complétera',
        '1pl_future': 'compléterons', '2pl_future': 'compléterez', '3pl_future': 'compléteront',
      },
      de: {
        base: 'vervollständigen',
        '1sg_present': 'vervollständige', '2sg_present': 'vervollständigst', '3sg_present': 'vervollständigt',
        '1pl_present': 'vervollständigen', '2pl_present': 'vervollständigt', '3pl_present': 'vervollständigen',
        '1sg_past': 'vervollständigte', '2sg_past': 'vervollständigtest', '3sg_past': 'vervollständigte',
        '1pl_past': 'vervollständigten', '2pl_past': 'vervollständigtet', '3pl_past': 'vervollständigten',
        '2sg_imperative': 'vervollständige',
      },
      es: {
        base: 'completar',
        '1sg_present': 'completo', '2sg_present': 'completas', '3sg_present': 'completa',
        '1pl_present': 'completamos', '2pl_present': 'completáis', '3pl_present': 'completan',
        '1sg_past': 'completé', '2sg_past': 'completaste', '3sg_past': 'completó',
        '1pl_past': 'completamos', '2pl_past': 'completasteis', '3pl_past': 'completaron',
        '1sg_future': 'completaré', '2sg_future': 'completarás', '3sg_future': 'completará',
        '1pl_future': 'completaremos', '2pl_future': 'completaréis', '3pl_future': 'completarán',
      },
      ja: {
        base: '補完する',
        reading: 'ほかんする',
        masu_present: '補完します',
        masu_present_reading: 'ほかんします',
        label: '補完',
        label_reading: 'ほかん',
      },
      pt: {
        base: 'completar',
        '1sg_present': 'completo', '2sg_present': 'completa', '3sg_present': 'completa',
        '1pl_present': 'completamos', '2pl_present': 'completam', '3pl_present': 'completam',
        '1sg_past': 'completei', '2sg_past': 'completou', '3sg_past': 'completou',
        '1pl_past': 'completamos', '2pl_past': 'completaram', '3pl_past': 'completaram',
        '1sg_future': 'completarei', '2sg_future': 'completará', '3sg_future': 'completará',
        '1pl_future': 'completaremos', '2pl_future': 'completarão', '3pl_future': 'completarão',
      },
    },
  },
  {
    // Putting a change into effect, as ↵ runs a line. German anwenden is separable (wendet … an) and
    // takes the strong past wandte / angewandt; Japanese labels with 適用.
    id: 'APPLY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to put a change into effect',
    emoji: '✔️',
    forms: {
      en: {
        base: 'apply',
        '1sg_present': 'apply', '2sg_present': 'apply', '3sg_present': 'applies',
        '1pl_present': 'apply', '2pl_present': 'apply', '3pl_present': 'apply',
        past: 'applied',
      },
      it: {
        base: 'applicare',
        '1sg_present': 'applico', '2sg_present': 'applichi', '3sg_present': 'applica',
        '1pl_present': 'applichiamo', '2pl_present': 'applicate', '3pl_present': 'applicano',
        '1sg_past': 'applicai', '2sg_past': 'applicasti', '3sg_past': 'applicò',
        '1pl_past': 'applicammo', '2pl_past': 'applicaste', '3pl_past': 'applicarono',
        '1sg_future': 'applicherò', '2sg_future': 'applicherai', '3sg_future': 'applicherà',
        '1pl_future': 'applicheremo', '2pl_future': 'applicherete', '3pl_future': 'applicheranno',
      },
      fr: {
        base: 'appliquer',
        '1sg_present': 'applique', '2sg_present': 'appliques', '3sg_present': 'applique',
        '1pl_present': 'appliquons', '2pl_present': 'appliquez', '3pl_present': 'appliquent',
        '1sg_past': 'appliquai', '2sg_past': 'appliquas', '3sg_past': 'appliqua',
        '1pl_past': 'appliquâmes', '2pl_past': 'appliquâtes', '3pl_past': 'appliquèrent',
        '1sg_future': 'appliquerai', '2sg_future': 'appliqueras', '3sg_future': 'appliquera',
        '1pl_future': 'appliquerons', '2pl_future': 'appliquerez', '3pl_future': 'appliqueront',
      },
      de: {
        base: 'anwenden', particle: 'an',
        '1sg_present': 'wende', '2sg_present': 'wendest', '3sg_present': 'wendet',
        '1pl_present': 'wenden', '2pl_present': 'wendet', '3pl_present': 'wenden',
        '1sg_past': 'wandte', '2sg_past': 'wandtest', '3sg_past': 'wandte',
        '1pl_past': 'wandten', '2pl_past': 'wandtet', '3pl_past': 'wandten',
        '2sg_imperative': 'wende',
      },
      es: {
        base: 'aplicar',
        '1sg_present': 'aplico', '2sg_present': 'aplicas', '3sg_present': 'aplica',
        '1pl_present': 'aplicamos', '2pl_present': 'aplicáis', '3pl_present': 'aplican',
        '1sg_past': 'apliqué', '2sg_past': 'aplicaste', '3sg_past': 'aplicó',
        '1pl_past': 'aplicamos', '2pl_past': 'aplicasteis', '3pl_past': 'aplicaron',
        '1sg_future': 'aplicaré', '2sg_future': 'aplicarás', '3sg_future': 'aplicará',
        '1pl_future': 'aplicaremos', '2pl_future': 'aplicaréis', '3pl_future': 'aplicarán',
      },
      ja: {
        base: '適用する',
        reading: 'てきようする',
        masu_present: '適用します',
        masu_present_reading: 'てきようします',
        label: '適用',
        label_reading: 'てきよう',
      },
      pt: {
        base: 'aplicar',
        '1sg_present': 'aplico', '2sg_present': 'aplica', '3sg_present': 'aplica',
        '1pl_present': 'aplicamos', '2pl_present': 'aplicam', '3pl_present': 'aplicam',
        '1sg_past': 'apliquei', '2sg_past': 'aplicou', '3sg_past': 'aplicou',
        '1pl_past': 'aplicamos', '2pl_past': 'aplicaram', '3pl_past': 'aplicaram',
        '1sg_future': 'aplicarei', '2sg_future': 'aplicará', '3sg_future': 'aplicará',
        '1pl_future': 'aplicaremos', '2pl_future': 'aplicarão', '3pl_future': 'aplicarão',
      },
    },
  },

  // Grammar-word verbs (B06): the acts that define a part of speech — a noun NAMEs, an adjective
  // DESCRIBEs, an adverb MODIFYs, a verb EXPRESSes, a pronoun REPLACEs. German keeps to
  // non-separable stems so the finite form stays whole at the end of a relative clause.
  {
    id: 'NAME',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to be the name of; to give a name to',
    definition: infinitiveGloss('INDICATE', {
      object: 'OBJECT_THING',
      number: 'plural',
      complements: { instrumental: { phrase: { concept: 'WORD', definiteness: 'bare', number: 'plural' } } },
    }),
    emoji: '🏷️',
    forms: {
      en: {
        base: 'name',
        '1sg_present': 'name', '2sg_present': 'name', '3sg_present': 'names',
        '1pl_present': 'name', '2pl_present': 'name', '3pl_present': 'name',
        past: 'named',
      },
      it: {
        base: 'nominare',
        '1sg_present': 'nomino', '2sg_present': 'nomini', '3sg_present': 'nomina',
        '1pl_present': 'nominiamo', '2pl_present': 'nominate', '3pl_present': 'nominano',
        '1sg_past': 'nominai', '2sg_past': 'nominasti', '3sg_past': 'nominò',
        '1pl_past': 'nominammo', '2pl_past': 'nominaste', '3pl_past': 'nominarono',
        '1sg_future': 'nominerò', '2sg_future': 'nominerai', '3sg_future': 'nominerà',
        '1pl_future': 'nomineremo', '2pl_future': 'nominerete', '3pl_future': 'nomineranno',
      },
      fr: {
        base: 'nommer',
        '1sg_present': 'nomme', '2sg_present': 'nommes', '3sg_present': 'nomme',
        '1pl_present': 'nommons', '2pl_present': 'nommez', '3pl_present': 'nomment',
        '1sg_past': 'nommai', '2sg_past': 'nommas', '3sg_past': 'nomma',
        '1pl_past': 'nommâmes', '2pl_past': 'nommâtes', '3pl_past': 'nommèrent',
        '1sg_future': 'nommerai', '2sg_future': 'nommeras', '3sg_future': 'nommera',
        '1pl_future': 'nommerons', '2pl_future': 'nommerez', '3pl_future': 'nommeront',
      },
      de: {
        base: 'benennen',
        '1sg_present': 'benenne', '2sg_present': 'benennst', '3sg_present': 'benennt',
        '1pl_present': 'benennen', '2pl_present': 'benennt', '3pl_present': 'benennen',
        '1sg_past': 'benannte', '2sg_past': 'benanntest', '3sg_past': 'benannte',
        '1pl_past': 'benannten', '2pl_past': 'benanntet', '3pl_past': 'benannten',
      },
      es: {
        base: 'nombrar',
        '1sg_present': 'nombro', '2sg_present': 'nombras', '3sg_present': 'nombra',
        '1pl_present': 'nombramos', '2pl_present': 'nombráis', '3pl_present': 'nombran',
        '1sg_past': 'nombré', '2sg_past': 'nombraste', '3sg_past': 'nombró',
        '1pl_past': 'nombramos', '2pl_past': 'nombrasteis', '3pl_past': 'nombraron',
        '1sg_future': 'nombraré', '2sg_future': 'nombrarás', '3sg_future': 'nombrará',
        '1pl_future': 'nombraremos', '2pl_future': 'nombraréis', '3pl_future': 'nombrarán',
      },
      ja: {
        base: '名付ける',
        reading: 'なづける',
        masu_present: '名付けます',
        masu_present_reading: 'なづけます',
      },
      pt: {
        base: 'nomear',
        '1sg_present': 'nomeio', '2sg_present': 'nomeia', '3sg_present': 'nomeia',
        '1pl_present': 'nomeamos', '2pl_present': 'nomeiam', '3pl_present': 'nomeiam',
        '1sg_past': 'nomeei', '2sg_past': 'nomeou', '3sg_past': 'nomeou',
        '1pl_past': 'nomeamos', '2pl_past': 'nomearam', '3pl_past': 'nomearam',
        '1sg_future': 'nomearei', '2sg_future': 'nomeará', '3sg_future': 'nomeará',
        '1pl_future': 'nomearemos', '2pl_future': 'nomearão', '3pl_future': 'nomearão',
      },
    },
  },

  {
    id: 'DESCRIBE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'instrumental'],
    description: 'to say what something is like',
    definition: infinitiveGloss('INDICATE', 'QUALITY', 'plural'),
    emoji: '🖊️',
    forms: {
      en: {
        base: 'describe',
        '1sg_present': 'describe', '2sg_present': 'describe', '3sg_present': 'describes',
        '1pl_present': 'describe', '2pl_present': 'describe', '3pl_present': 'describe',
        past: 'described',
      },
      it: {
        base: 'descrivere',
        '1sg_present': 'descrivo', '2sg_present': 'descrivi', '3sg_present': 'descrive',
        '1pl_present': 'descriviamo', '2pl_present': 'descrivete', '3pl_present': 'descrivono',
        '1sg_past': 'descrissi', '2sg_past': 'descrivesti', '3sg_past': 'descrisse',
        '1pl_past': 'descrivemmo', '2pl_past': 'descriveste', '3pl_past': 'descrissero',
        '1sg_future': 'descriverò', '2sg_future': 'descriverai', '3sg_future': 'descriverà',
        '1pl_future': 'descriveremo', '2pl_future': 'descriverete', '3pl_future': 'descriveranno',
      },
      fr: {
        base: 'décrire',
        '1sg_present': 'décris', '2sg_present': 'décris', '3sg_present': 'décrit',
        '1pl_present': 'décrivons', '2pl_present': 'décrivez', '3pl_present': 'décrivent',
        '1sg_past': 'décrivis', '2sg_past': 'décrivis', '3sg_past': 'décrivit',
        '1pl_past': 'décrivîmes', '2pl_past': 'décrivîtes', '3pl_past': 'décrivirent',
        '1sg_future': 'décrirai', '2sg_future': 'décriras', '3sg_future': 'décrira',
        '1pl_future': 'décrirons', '2pl_future': 'décrirez', '3pl_future': 'décriront',
      },
      de: {
        base: 'beschreiben',
        '1sg_present': 'beschreibe', '2sg_present': 'beschreibst', '3sg_present': 'beschreibt',
        '1pl_present': 'beschreiben', '2pl_present': 'beschreibt', '3pl_present': 'beschreiben',
        '1sg_past': 'beschrieb', '2sg_past': 'beschriebst', '3sg_past': 'beschrieb',
        '1pl_past': 'beschrieben', '2pl_past': 'beschriebt', '3pl_past': 'beschrieben',
      },
      es: {
        base: 'describir',
        '1sg_present': 'describo', '2sg_present': 'describes', '3sg_present': 'describe',
        '1pl_present': 'describimos', '2pl_present': 'describís', '3pl_present': 'describen',
        '1sg_past': 'describí', '2sg_past': 'describiste', '3sg_past': 'describió',
        '1pl_past': 'describimos', '2pl_past': 'describisteis', '3pl_past': 'describieron',
        '1sg_future': 'describiré', '2sg_future': 'describirás', '3sg_future': 'describirá',
        '1pl_future': 'describiremos', '2pl_future': 'describiréis', '3pl_future': 'describirán',
      },
      ja: {
        base: '描写する',
        reading: 'びょうしゃする',
        masu_present: '描写します',
        masu_present_reading: 'びょうしゃします',
      },
      pt: {
        base: 'descrever',
        '1sg_present': 'descrevo', '2sg_present': 'descreve', '3sg_present': 'descreve',
        '1pl_present': 'descrevemos', '2pl_present': 'descrevem', '3pl_present': 'descrevem',
        '1sg_past': 'descrevi', '2sg_past': 'descreveu', '3sg_past': 'descreveu',
        '1pl_past': 'descrevemos', '2pl_past': 'descreveram', '3pl_past': 'descreveram',
        '1sg_future': 'descreverei', '2sg_future': 'descreverá', '3sg_future': 'descreverá',
        '1pl_future': 'descreveremos', '2pl_future': 'descreverão', '3pl_future': 'descreverão',
      },
    },
  },

  {
    id: 'MODIFY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative', 'instrumental'],
    description: 'to qualify or alter another word',
    definition: infinitiveGloss('CHANGE', 'QUALITY', 'plural'),
    emoji: '🔧',
    isA: 'CHANGE',
    forms: {
      en: {
        base: 'modify',
        '1sg_present': 'modify', '2sg_present': 'modify', '3sg_present': 'modifies',
        '1pl_present': 'modify', '2pl_present': 'modify', '3pl_present': 'modify',
        past: 'modified',
      },
      it: {
        base: 'modificare',
        '1sg_present': 'modifico', '2sg_present': 'modifichi', '3sg_present': 'modifica',
        '1pl_present': 'modifichiamo', '2pl_present': 'modificate', '3pl_present': 'modificano',
        '1sg_past': 'modificai', '2sg_past': 'modificasti', '3sg_past': 'modificò',
        '1pl_past': 'modificammo', '2pl_past': 'modificaste', '3pl_past': 'modificarono',
        '1sg_future': 'modificherò', '2sg_future': 'modificherai', '3sg_future': 'modificherà',
        '1pl_future': 'modificheremo', '2pl_future': 'modificherete', '3pl_future': 'modificheranno',
      },
      fr: {
        base: 'modifier',
        '1sg_present': 'modifie', '2sg_present': 'modifies', '3sg_present': 'modifie',
        '1pl_present': 'modifions', '2pl_present': 'modifiez', '3pl_present': 'modifient',
        '1sg_past': 'modifiai', '2sg_past': 'modifias', '3sg_past': 'modifia',
        '1pl_past': 'modifiâmes', '2pl_past': 'modifiâtes', '3pl_past': 'modifièrent',
        '1sg_future': 'modifierai', '2sg_future': 'modifieras', '3sg_future': 'modifiera',
        '1pl_future': 'modifierons', '2pl_future': 'modifierez', '3pl_future': 'modifieront',
      },
      de: {
        base: 'modifizieren',
        '1sg_present': 'modifiziere', '2sg_present': 'modifizierst', '3sg_present': 'modifiziert',
        '1pl_present': 'modifizieren', '2pl_present': 'modifiziert', '3pl_present': 'modifizieren',
        '1sg_past': 'modifizierte', '2sg_past': 'modifiziertest', '3sg_past': 'modifizierte',
        '1pl_past': 'modifizierten', '2pl_past': 'modifiziertet', '3pl_past': 'modifizierten',
      },
      es: {
        base: 'modificar',
        '1sg_present': 'modifico', '2sg_present': 'modificas', '3sg_present': 'modifica',
        '1pl_present': 'modificamos', '2pl_present': 'modificáis', '3pl_present': 'modifican',
        '1sg_past': 'modifiqué', '2sg_past': 'modificaste', '3sg_past': 'modificó',
        '1pl_past': 'modificamos', '2pl_past': 'modificasteis', '3pl_past': 'modificaron',
        '1sg_future': 'modificaré', '2sg_future': 'modificarás', '3sg_future': 'modificará',
        '1pl_future': 'modificaremos', '2pl_future': 'modificaréis', '3pl_future': 'modificarán',
      },
      ja: {
        base: '修飾する',
        reading: 'しゅうしょくする',
        masu_present: '修飾します',
        masu_present_reading: 'しゅうしょくします',
      },
      pt: {
        base: 'modificar',
        '1sg_present': 'modifico', '2sg_present': 'modifica', '3sg_present': 'modifica',
        '1pl_present': 'modificamos', '2pl_present': 'modificam', '3pl_present': 'modificam',
        '1sg_past': 'modifiquei', '2sg_past': 'modificou', '3sg_past': 'modificou',
        '1pl_past': 'modificamos', '2pl_past': 'modificaram', '3pl_past': 'modificaram',
        '1sg_future': 'modificarei', '2sg_future': 'modificará', '3sg_future': 'modificará',
        '1pl_future': 'modificaremos', '2pl_future': 'modificarão', '3pl_future': 'modificarão',
      },
    },
  },
  {
    // What a determiner does to a noun: fixing which thing it refers to, "a word that specifies
    // nouns" (localization B51). German bestimmen is the grammar's own verb: articles are
    // Bestimmungswörter, and the definite one is the bestimmter Artikel. French préciser, the
    // everyday word, over spécifier. Japanese 特定する is a suru compound.
    id: 'SPECIFY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'instrumental'],
    description: 'to identify exactly',
    // "to indicate exactly" (localization C28). Without the adverb it was EXPRESS's "to indicate
    // concepts", character for character; EXACTLY was seeded for it. French exactement, not
    // précisément, which would echo this verb's own préciser.
    definition: infinitiveGloss('INDICATE', { modifier: 'EXACTLY' }),
    emoji: '🔍',
    forms: {
      en: {
        base: 'specify',
        '1sg_present': 'specify', '2sg_present': 'specify', '3sg_present': 'specifies',
        '1pl_present': 'specify', '2pl_present': 'specify', '3pl_present': 'specify',
        past: 'specified',
      },
      it: {
        base: 'specificare',
        '1sg_present': 'specifico', '2sg_present': 'specifichi', '3sg_present': 'specifica',
        '1pl_present': 'specifichiamo', '2pl_present': 'specificate', '3pl_present': 'specificano',
        '1sg_past': 'specificai', '2sg_past': 'specificasti', '3sg_past': 'specificò',
        '1pl_past': 'specificammo', '2pl_past': 'specificaste', '3pl_past': 'specificarono',
        '1sg_future': 'specificherò', '2sg_future': 'specificherai', '3sg_future': 'specificherà',
        '1pl_future': 'specificheremo', '2pl_future': 'specificherete', '3pl_future': 'specificheranno',
      },
      fr: {
        base: 'préciser',
        '1sg_present': 'précise', '2sg_present': 'précises', '3sg_present': 'précise',
        '1pl_present': 'précisons', '2pl_present': 'précisez', '3pl_present': 'précisent',
        '1sg_past': 'précisai', '2sg_past': 'précisas', '3sg_past': 'précisa',
        '1pl_past': 'précisâmes', '2pl_past': 'précisâtes', '3pl_past': 'précisèrent',
        '1sg_future': 'préciserai', '2sg_future': 'préciseras', '3sg_future': 'précisera',
        '1pl_future': 'préciserons', '2pl_future': 'préciserez', '3pl_future': 'préciseront',
      },
      de: {
        base: 'bestimmen',
        '1sg_present': 'bestimme', '2sg_present': 'bestimmst', '3sg_present': 'bestimmt',
        '1pl_present': 'bestimmen', '2pl_present': 'bestimmt', '3pl_present': 'bestimmen',
        '1sg_past': 'bestimmte', '2sg_past': 'bestimmtest', '3sg_past': 'bestimmte',
        '1pl_past': 'bestimmten', '2pl_past': 'bestimmtet', '3pl_past': 'bestimmten',
      },
      es: {
        base: 'especificar',
        '1sg_present': 'especifico', '2sg_present': 'especificas', '3sg_present': 'especifica',
        '1pl_present': 'especificamos', '2pl_present': 'especificáis', '3pl_present': 'especifican',
        '1sg_past': 'especifiqué', '2sg_past': 'especificaste', '3sg_past': 'especificó',
        '1pl_past': 'especificamos', '2pl_past': 'especificasteis', '3pl_past': 'especificaron',
        '1sg_future': 'especificaré', '2sg_future': 'especificarás', '3sg_future': 'especificará',
        '1pl_future': 'especificaremos', '2pl_future': 'especificaréis', '3pl_future': 'especificarán',
      },
      ja: {
        base: '特定する',
        reading: 'とくていする',
        masu_present: '特定します',
        masu_present_reading: 'とくていします',
      },
      pt: {
        base: 'especificar',
        '1sg_present': 'especifico', '2sg_present': 'especifica', '3sg_present': 'especifica',
        '1pl_present': 'especificamos', '2pl_present': 'especificam', '3pl_present': 'especificam',
        '1sg_past': 'especifiquei', '2sg_past': 'especificou', '3sg_past': 'especificou',
        '1pl_past': 'especificamos', '2pl_past': 'especificaram', '3pl_past': 'especificaram',
        '1sg_future': 'especificarei', '2sg_future': 'especificará', '3sg_future': 'especificará',
        '1pl_future': 'especificaremos', '2pl_future': 'especificarão', '3pl_future': 'especificarão',
      },
    },
  },
  {
    // Changing a text or a piece of work, as an editor does (B43) — not MODIFY, which is what a word
    // does to another. Italian and French share MODIFY's verb (modificare, modifier): it is what their
    // software writes on the Edit button ("Modifica", "Modifier"), where redigere and éditer are the
    // editor's trade. German "bearbeiten" and Japanese 編集 are the Edit menu's words.
    id: 'EDIT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative', 'instrumental'],
    description: 'to change a text or a piece of work',
    definition: infinitiveGloss('CHANGE', 'TEXT'),
    emoji: '✏️',
    isA: 'CHANGE',
    forms: {
      en: {
        base: 'edit',
        '1sg_present': 'edit', '2sg_present': 'edit', '3sg_present': 'edits',
        '1pl_present': 'edit', '2pl_present': 'edit', '3pl_present': 'edit',
        past: 'edited',
      },
      it: {
        base: 'modificare',
        '1sg_present': 'modifico', '2sg_present': 'modifichi', '3sg_present': 'modifica',
        '1pl_present': 'modifichiamo', '2pl_present': 'modificate', '3pl_present': 'modificano',
        '1sg_past': 'modificai', '2sg_past': 'modificasti', '3sg_past': 'modificò',
        '1pl_past': 'modificammo', '2pl_past': 'modificaste', '3pl_past': 'modificarono',
        '1sg_future': 'modificherò', '2sg_future': 'modificherai', '3sg_future': 'modificherà',
        '1pl_future': 'modificheremo', '2pl_future': 'modificherete', '3pl_future': 'modificheranno',
      },
      fr: {
        base: 'modifier',
        '1sg_present': 'modifie', '2sg_present': 'modifies', '3sg_present': 'modifie',
        '1pl_present': 'modifions', '2pl_present': 'modifiez', '3pl_present': 'modifient',
        '1sg_past': 'modifiai', '2sg_past': 'modifias', '3sg_past': 'modifia',
        '1pl_past': 'modifiâmes', '2pl_past': 'modifiâtes', '3pl_past': 'modifièrent',
        '1sg_future': 'modifierai', '2sg_future': 'modifieras', '3sg_future': 'modifiera',
        '1pl_future': 'modifierons', '2pl_future': 'modifierez', '3pl_future': 'modifieront',
      },
      de: {
        base: 'bearbeiten',
        '1sg_present': 'bearbeite', '2sg_present': 'bearbeitest', '3sg_present': 'bearbeitet',
        '1pl_present': 'bearbeiten', '2pl_present': 'bearbeitet', '3pl_present': 'bearbeiten',
        '1sg_past': 'bearbeitete', '2sg_past': 'bearbeitetest', '3sg_past': 'bearbeitete',
        '1pl_past': 'bearbeiteten', '2pl_past': 'bearbeitetet', '3pl_past': 'bearbeiteten',
      },
      es: {
        base: 'editar',
        '1sg_present': 'edito', '2sg_present': 'editas', '3sg_present': 'edita',
        '1pl_present': 'editamos', '2pl_present': 'editáis', '3pl_present': 'editan',
        '1sg_past': 'edité', '2sg_past': 'editaste', '3sg_past': 'editó',
        '1pl_past': 'editamos', '2pl_past': 'editasteis', '3pl_past': 'editaron',
        '1sg_future': 'editaré', '2sg_future': 'editarás', '3sg_future': 'editará',
        '1pl_future': 'editaremos', '2pl_future': 'editaréis', '3pl_future': 'editarán',
      },
      ja: {
        base: '編集する',
        reading: 'へんしゅうする',
        masu_present: '編集します',
        masu_present_reading: 'へんしゅうします',
        label: '編集',
        label_reading: 'へんしゅう',
      },
      pt: {
        base: 'editar',
        '1sg_present': 'edito', '2sg_present': 'edita', '3sg_present': 'edita',
        '1pl_present': 'editamos', '2pl_present': 'editam', '3pl_present': 'editam',
        '1sg_past': 'editei', '2sg_past': 'editou', '3sg_past': 'editou',
        '1pl_past': 'editamos', '2pl_past': 'editaram', '3pl_past': 'editaram',
        '1sg_future': 'editarei', '2sg_future': 'editará', '3sg_future': 'editará',
        '1pl_future': 'editaremos', '2pl_future': 'editarão', '3pl_future': 'editarão',
      },
    },
  },

  {
    // The grammarian's government: a word fixing the form of another, as a modal governs the
    // infinitive after it (localization B47) or a preposition its case. Not the political sense,
    // though every language but Japanese uses the one verb for both: it reggere, fr régir, de
    // regieren, es regir, pt reger. Japanese linguistics says 支配する (格支配, case government).
    // Italian reggere is irregular in the past (resse) and the participle (retto); Spanish regir
    // raises e→i under stress and before -ió, and writes the g as j before o and a (rijo, rigió).
    id: 'GOVERN',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to determine the form of another word (grammar)',
    emoji: '🧭',
    synonym: 'grammar',
    forms: {
      en: {
        base: 'govern',
        '1sg_present': 'govern', '2sg_present': 'govern', '3sg_present': 'governs',
        '1pl_present': 'govern', '2pl_present': 'govern', '3pl_present': 'govern',
        past: 'governed',
      },
      it: {
        base: 'reggere',
        '1sg_present': 'reggo', '2sg_present': 'reggi', '3sg_present': 'regge',
        '1pl_present': 'reggiamo', '2pl_present': 'reggete', '3pl_present': 'reggono',
        '1sg_past': 'ressi', '2sg_past': 'reggesti', '3sg_past': 'resse',
        '1pl_past': 'reggemmo', '2pl_past': 'reggeste', '3pl_past': 'ressero',
        '1sg_future': 'reggerò', '2sg_future': 'reggerai', '3sg_future': 'reggerà',
        '1pl_future': 'reggeremo', '2pl_future': 'reggerete', '3pl_future': 'reggeranno',
      },
      fr: {
        base: 'régir',
        '1sg_present': 'régis', '2sg_present': 'régis', '3sg_present': 'régit',
        '1pl_present': 'régissons', '2pl_present': 'régissez', '3pl_present': 'régissent',
        '1sg_past': 'régis', '2sg_past': 'régis', '3sg_past': 'régit',
        '1pl_past': 'régîmes', '2pl_past': 'régîtes', '3pl_past': 'régirent',
        '1sg_future': 'régirai', '2sg_future': 'régiras', '3sg_future': 'régira',
        '1pl_future': 'régirons', '2pl_future': 'régirez', '3pl_future': 'régiront',
      },
      de: {
        base: 'regieren',
        '1sg_present': 'regiere', '2sg_present': 'regierst', '3sg_present': 'regiert',
        '1pl_present': 'regieren', '2pl_present': 'regiert', '3pl_present': 'regieren',
        '1sg_past': 'regierte', '2sg_past': 'regiertest', '3sg_past': 'regierte',
        '1pl_past': 'regierten', '2pl_past': 'regiertet', '3pl_past': 'regierten',
        '2sg_imperative': 'regiere', // the optional du -e, kept, as on the other -ieren verbs
      },
      es: {
        base: 'regir',
        '1sg_present': 'rijo', '2sg_present': 'riges', '3sg_present': 'rige',
        '1pl_present': 'regimos', '2pl_present': 'regís', '3pl_present': 'rigen',
        '1sg_past': 'regí', '2sg_past': 'registe', '3sg_past': 'rigió',
        '1pl_past': 'regimos', '2pl_past': 'registeis', '3pl_past': 'rigieron',
        '1sg_future': 'regiré', '2sg_future': 'regirás', '3sg_future': 'regirá',
        '1pl_future': 'regiremos', '2pl_future': 'regiréis', '3pl_future': 'regirán',
      },
      ja: {
        base: '支配する',
        reading: 'しはいする',
        masu_present: '支配します',
        masu_present_reading: 'しはいします',
      },
      pt: {
        base: 'reger',
        '1sg_present': 'rejo', '2sg_present': 'rege', '3sg_present': 'rege',
        '1pl_present': 'regemos', '2pl_present': 'regem', '3pl_present': 'regem',
        '1sg_past': 'regi', '2sg_past': 'regeu', '3sg_past': 'regeu',
        '1pl_past': 'regemos', '2pl_past': 'regeram', '3pl_past': 'regeram',
        '1sg_future': 'regerei', '2sg_future': 'regerá', '3sg_future': 'regerá',
        '1pl_future': 'regeremos', '2pl_future': 'regerão', '3pl_future': 'regerão',
      },
    },
  },

  {
    // To take what is offered as valid: a command that accepts no word, a verb that accepts no object
    // (localization C21) — the licensing sense a grammar and a program share, with the verb each
    // language's software writes for it (it accettare, fr accepter, de akzeptieren, es aceptar, pt
    // aceitar). Japanese 受け付ける, "to take in", what an input that refuses something says (受け付けません).
    // Portuguese has two participles: aceitado after ter, the short aceite with ser (EP).
    id: 'ACCEPT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to take something offered as valid',
    emoji: '🤝',
    forms: {
      en: {
        base: 'accept',
        '1sg_present': 'accept', '2sg_present': 'accept', '3sg_present': 'accepts',
        '1pl_present': 'accept', '2pl_present': 'accept', '3pl_present': 'accept',
        past: 'accepted',
      },
      it: {
        base: 'accettare',
        '1sg_present': 'accetto', '2sg_present': 'accetti', '3sg_present': 'accetta',
        '1pl_present': 'accettiamo', '2pl_present': 'accettate', '3pl_present': 'accettano',
        '1sg_past': 'accettai', '2sg_past': 'accettasti', '3sg_past': 'accettò',
        '1pl_past': 'accettammo', '2pl_past': 'accettaste', '3pl_past': 'accettarono',
        '1sg_future': 'accetterò', '2sg_future': 'accetterai', '3sg_future': 'accetterà',
        '1pl_future': 'accetteremo', '2pl_future': 'accetterete', '3pl_future': 'accetteranno',
      },
      fr: {
        base: 'accepter',
        '1sg_present': 'accepte', '2sg_present': 'acceptes', '3sg_present': 'accepte',
        '1pl_present': 'acceptons', '2pl_present': 'acceptez', '3pl_present': 'acceptent',
        '1sg_past': 'acceptai', '2sg_past': 'acceptas', '3sg_past': 'accepta',
        '1pl_past': 'acceptâmes', '2pl_past': 'acceptâtes', '3pl_past': 'acceptèrent',
        '1sg_future': 'accepterai', '2sg_future': 'accepteras', '3sg_future': 'acceptera',
        '1pl_future': 'accepterons', '2pl_future': 'accepterez', '3pl_future': 'accepteront',
      },
      de: {
        base: 'akzeptieren',
        '1sg_present': 'akzeptiere', '2sg_present': 'akzeptierst', '3sg_present': 'akzeptiert',
        '1pl_present': 'akzeptieren', '2pl_present': 'akzeptiert', '3pl_present': 'akzeptieren',
        '1sg_past': 'akzeptierte', '2sg_past': 'akzeptiertest', '3sg_past': 'akzeptierte',
        '1pl_past': 'akzeptierten', '2pl_past': 'akzeptiertet', '3pl_past': 'akzeptierten',
        '2sg_imperative': 'akzeptiere', // the optional du -e, kept, as on the other -ieren verbs
      },
      es: {
        base: 'aceptar',
        '1sg_present': 'acepto', '2sg_present': 'aceptas', '3sg_present': 'acepta',
        '1pl_present': 'aceptamos', '2pl_present': 'aceptáis', '3pl_present': 'aceptan',
        '1sg_past': 'acepté', '2sg_past': 'aceptaste', '3sg_past': 'aceptó',
        '1pl_past': 'aceptamos', '2pl_past': 'aceptasteis', '3pl_past': 'aceptaron',
        '1sg_future': 'aceptaré', '2sg_future': 'aceptarás', '3sg_future': 'aceptará',
        '1pl_future': 'aceptaremos', '2pl_future': 'aceptaréis', '3pl_future': 'aceptarán',
      },
      ja: {
        base: '受け付ける',
        reading: 'うけつける',
        masu_present: '受け付けます',
        masu_present_reading: 'うけつけます',
      },
      pt: {
        base: 'aceitar',
        '1sg_present': 'aceito', '2sg_present': 'aceita', '3sg_present': 'aceita',
        '1pl_present': 'aceitamos', '2pl_present': 'aceitam', '3pl_present': 'aceitam',
        '1sg_past': 'aceitei', '2sg_past': 'aceitou', '3sg_past': 'aceitou',
        '1pl_past': 'aceitamos', '2pl_past': 'aceitaram', '3pl_past': 'aceitaram',
        '1sg_future': 'aceitarei', '2sg_future': 'aceitará', '3sg_future': 'aceitará',
        '1pl_future': 'aceitaremos', '2pl_future': 'aceitarão', '3pl_future': 'aceitarão',
      },
    },
  },

  {
    // Making a clause say the opposite: what `/not` does to a verb (localization B47), with the verb
    // each language's grammar teaching uses for it — it "negare un verbo", de "ein Verb verneinen",
    // es "negar un verbo", pt "negar um verbo", ja 動詞を否定する. French nier is the verb of logical
    // and grammatical negation (to negate a proposition, a term), though in everyday French it is
    // to deny; the school phrase, "mettre un verbe à la forme négative", puts fixed words after the
    // object, which no lexeme can hold. Spanish negar diphthongizes under stress (niego) and writes
    // gu before e (negué); Italian and Portuguese keep the hard g the same way (neghi, neguei).
    id: 'NEGATE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to make a clause say the opposite (grammar)',
    definition: causativeGloss({ object: 'CLAUSE', definiteness: 'indefinite' }, { verb: 'BE', predicate: 'NEGATIVE' }),
    emoji: '🙅',
    synonym: 'grammar',
    forms: {
      en: {
        base: 'negate',
        '1sg_present': 'negate', '2sg_present': 'negate', '3sg_present': 'negates',
        '1pl_present': 'negate', '2pl_present': 'negate', '3pl_present': 'negate',
        past: 'negated',
      },
      it: {
        base: 'negare',
        '1sg_present': 'nego', '2sg_present': 'neghi', '3sg_present': 'nega',
        '1pl_present': 'neghiamo', '2pl_present': 'negate', '3pl_present': 'negano',
        '1sg_past': 'negai', '2sg_past': 'negasti', '3sg_past': 'negò',
        '1pl_past': 'negammo', '2pl_past': 'negaste', '3pl_past': 'negarono',
        '1sg_future': 'negherò', '2sg_future': 'negherai', '3sg_future': 'negherà',
        '1pl_future': 'negheremo', '2pl_future': 'negherete', '3pl_future': 'negheranno',
      },
      fr: {
        base: 'nier',
        '1sg_present': 'nie', '2sg_present': 'nies', '3sg_present': 'nie',
        '1pl_present': 'nions', '2pl_present': 'niez', '3pl_present': 'nient',
        '1sg_past': 'niai', '2sg_past': 'nias', '3sg_past': 'nia',
        '1pl_past': 'niâmes', '2pl_past': 'niâtes', '3pl_past': 'nièrent',
        '1sg_future': 'nierai', '2sg_future': 'nieras', '3sg_future': 'niera',
        '1pl_future': 'nierons', '2pl_future': 'nierez', '3pl_future': 'nieront',
      },
      de: {
        base: 'verneinen',
        '1sg_present': 'verneine', '2sg_present': 'verneinst', '3sg_present': 'verneint',
        '1pl_present': 'verneinen', '2pl_present': 'verneint', '3pl_present': 'verneinen',
        '1sg_past': 'verneinte', '2sg_past': 'verneintest', '3sg_past': 'verneinte',
        '1pl_past': 'verneinten', '2pl_past': 'verneintet', '3pl_past': 'verneinten',
      },
      es: {
        base: 'negar',
        '1sg_present': 'niego', '2sg_present': 'niegas', '3sg_present': 'niega',
        '1pl_present': 'negamos', '2pl_present': 'negáis', '3pl_present': 'niegan',
        '1sg_past': 'negué', '2sg_past': 'negaste', '3sg_past': 'negó',
        '1pl_past': 'negamos', '2pl_past': 'negasteis', '3pl_past': 'negaron',
        '1sg_future': 'negaré', '2sg_future': 'negarás', '3sg_future': 'negará',
        '1pl_future': 'negaremos', '2pl_future': 'negaréis', '3pl_future': 'negarán',
      },
      ja: {
        base: '否定する',
        reading: 'ひていする',
        masu_present: '否定します',
        masu_present_reading: 'ひていします',
      },
      pt: {
        base: 'negar',
        '1sg_present': 'nego', '2sg_present': 'nega', '3sg_present': 'nega',
        '1pl_present': 'negamos', '2pl_present': 'negam', '3pl_present': 'negam',
        '1sg_past': 'neguei', '2sg_past': 'negou', '3sg_past': 'negou',
        '1pl_past': 'negamos', '2pl_past': 'negaram', '3pl_past': 'negaram',
        '1sg_future': 'negarei', '2sg_future': 'negará', '3sg_future': 'negará',
        '1pl_future': 'negaremos', '2pl_future': 'negarão', '3pl_future': 'negarão',
      },
    },
  },

  {
    // Saying that something is so: what a statement does and a command does not (localization C27,
    // STATEMENT "a clause that asserts facts"). The school grammars' own verb for the declarative
    // sentence — it "afferma un fatto", es "afirma un hecho", ja 事実を述べる — except English
    // "state" and German "aussagen", which would gloss *statement* and *Aussagesatz* with themselves:
    // "assert", and German feststellen, separable ("stellt … fest", "feststellt").
    id: 'ASSERT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to say that something is so',
    emoji: '☝️',
    forms: {
      en: {
        base: 'assert',
        '1sg_present': 'assert', '2sg_present': 'assert', '3sg_present': 'asserts',
        '1pl_present': 'assert', '2pl_present': 'assert', '3pl_present': 'assert',
        past: 'asserted',
      },
      it: {
        base: 'affermare',
        '1sg_present': 'affermo', '2sg_present': 'affermi', '3sg_present': 'afferma',
        '1pl_present': 'affermiamo', '2pl_present': 'affermate', '3pl_present': 'affermano',
        '1sg_past': 'affermai', '2sg_past': 'affermasti', '3sg_past': 'affermò',
        '1pl_past': 'affermammo', '2pl_past': 'affermaste', '3pl_past': 'affermarono',
        '1sg_future': 'affermerò', '2sg_future': 'affermerai', '3sg_future': 'affermerà',
        '1pl_future': 'affermeremo', '2pl_future': 'affermerete', '3pl_future': 'affermeranno',
      },
      fr: {
        base: 'affirmer',
        '1sg_present': 'affirme', '2sg_present': 'affirmes', '3sg_present': 'affirme',
        '1pl_present': 'affirmons', '2pl_present': 'affirmez', '3pl_present': 'affirment',
        '1sg_past': 'affirmai', '2sg_past': 'affirmas', '3sg_past': 'affirma',
        '1pl_past': 'affirmâmes', '2pl_past': 'affirmâtes', '3pl_past': 'affirmèrent',
        '1sg_future': 'affirmerai', '2sg_future': 'affirmeras', '3sg_future': 'affirmera',
        '1pl_future': 'affirmerons', '2pl_future': 'affirmerez', '3pl_future': 'affirmeront',
      },
      de: {
        base: 'feststellen', particle: 'fest',
        '1sg_present': 'stelle', '2sg_present': 'stellst', '3sg_present': 'stellt',
        '1pl_present': 'stellen', '2pl_present': 'stellt', '3pl_present': 'stellen',
        '1sg_past': 'stellte', '2sg_past': 'stelltest', '3sg_past': 'stellte',
        '1pl_past': 'stellten', '2pl_past': 'stelltet', '3pl_past': 'stellten',
        '2sg_imperative': 'stelle',
      },
      es: {
        base: 'afirmar',
        '1sg_present': 'afirmo', '2sg_present': 'afirmas', '3sg_present': 'afirma',
        '1pl_present': 'afirmamos', '2pl_present': 'afirmáis', '3pl_present': 'afirman',
        '1sg_past': 'afirmé', '2sg_past': 'afirmaste', '3sg_past': 'afirmó',
        '1pl_past': 'afirmamos', '2pl_past': 'afirmasteis', '3pl_past': 'afirmaron',
        '1sg_future': 'afirmaré', '2sg_future': 'afirmarás', '3sg_future': 'afirmará',
        '1pl_future': 'afirmaremos', '2pl_future': 'afirmaréis', '3pl_future': 'afirmarán',
      },
      ja: {
        base: '述べる',
        reading: 'のべる',
        masu_present: '述べます',
        masu_present_reading: 'のべます',
      },
      pt: {
        base: 'afirmar',
        '1sg_present': 'afirmo', '2sg_present': 'afirma', '3sg_present': 'afirma',
        '1pl_present': 'afirmamos', '2pl_present': 'afirmam', '3pl_present': 'afirmam',
        '1sg_past': 'afirmei', '2sg_past': 'afirmou', '3sg_past': 'afirmou',
        '1pl_past': 'afirmamos', '2pl_past': 'afirmaram', '3pl_past': 'afirmaram',
        '1sg_future': 'afirmarei', '2sg_future': 'afirmará', '3sg_future': 'afirmará',
        '1pl_future': 'afirmaremos', '2pl_future': 'afirmarão', '3pl_future': 'afirmarão',
      },
    },
  },

  // Licenses `instrumental` for what one expresses with: SAY is "to express concepts with words".
  {
    id: 'EXPRESS',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative', 'instrumental'],
    description: 'to convey or put into words',
    definition: infinitiveGloss('INDICATE', 'CONCEPT', 'plural'),
    emoji: '🗣️',
    forms: {
      en: {
        base: 'express',
        '1sg_present': 'express', '2sg_present': 'express', '3sg_present': 'expresses',
        '1pl_present': 'express', '2pl_present': 'express', '3pl_present': 'express',
        past: 'expressed',
      },
      it: {
        base: 'esprimere',
        '1sg_present': 'esprimo', '2sg_present': 'esprimi', '3sg_present': 'esprime',
        '1pl_present': 'esprimiamo', '2pl_present': 'esprimete', '3pl_present': 'esprimono',
        '1sg_past': 'espressi', '2sg_past': 'esprimesti', '3sg_past': 'espresse',
        '1pl_past': 'esprimemmo', '2pl_past': 'esprimeste', '3pl_past': 'espressero',
        '1sg_future': 'esprimerò', '2sg_future': 'esprimerai', '3sg_future': 'esprimerà',
        '1pl_future': 'esprimeremo', '2pl_future': 'esprimerete', '3pl_future': 'esprimeranno',
      },
      fr: {
        base: 'exprimer',
        '1sg_present': 'exprime', '2sg_present': 'exprimes', '3sg_present': 'exprime',
        '1pl_present': 'exprimons', '2pl_present': 'exprimez', '3pl_present': 'expriment',
        '1sg_past': 'exprimai', '2sg_past': 'exprimas', '3sg_past': 'exprima',
        '1pl_past': 'exprimâmes', '2pl_past': 'exprimâtes', '3pl_past': 'exprimèrent',
        '1sg_future': 'exprimerai', '2sg_future': 'exprimeras', '3sg_future': 'exprimera',
        '1pl_future': 'exprimerons', '2pl_future': 'exprimerez', '3pl_future': 'exprimeront',
      },
      de: {
        base: 'vermitteln',
        '1sg_present': 'vermittle', '2sg_present': 'vermittelst', '3sg_present': 'vermittelt',
        '1pl_present': 'vermitteln', '2pl_present': 'vermittelt', '3pl_present': 'vermitteln',
        '1sg_past': 'vermittelte', '2sg_past': 'vermitteltest', '3sg_past': 'vermittelte',
        '1pl_past': 'vermittelten', '2pl_past': 'vermitteltet', '3pl_past': 'vermittelten',
      },
      es: {
        base: 'expresar',
        '1sg_present': 'expreso', '2sg_present': 'expresas', '3sg_present': 'expresa',
        '1pl_present': 'expresamos', '2pl_present': 'expresáis', '3pl_present': 'expresan',
        '1sg_past': 'expresé', '2sg_past': 'expresaste', '3sg_past': 'expresó',
        '1pl_past': 'expresamos', '2pl_past': 'expresasteis', '3pl_past': 'expresaron',
        '1sg_future': 'expresaré', '2sg_future': 'expresarás', '3sg_future': 'expresará',
        '1pl_future': 'expresaremos', '2pl_future': 'expresaréis', '3pl_future': 'expresarán',
      },
      ja: {
        base: '表す',
        reading: 'あらわす',
        masu_present: '表します',
        masu_present_reading: 'あらわします',
      },
      pt: {
        base: 'exprimir',
        '1sg_present': 'exprimo', '2sg_present': 'exprime', '3sg_present': 'exprime',
        '1pl_present': 'exprimimos', '2pl_present': 'exprimem', '3pl_present': 'exprimem',
        '1sg_past': 'exprimi', '2sg_past': 'exprimiu', '3sg_past': 'exprimiu',
        '1pl_past': 'exprimimos', '2pl_past': 'exprimiram', '3pl_past': 'exprimiram',
        '1sg_future': 'exprimirei', '2sg_future': 'exprimirá', '3sg_future': 'exprimirá',
        '1pl_future': 'exprimiremos', '2pl_future': 'exprimirão', '3pl_future': 'exprimirão',
      },
    },
  },

  // ── The saying and thinking verbs (localization B60) ──
  {
    // P09's say: to utter words, spoken or written ("the letter says", "il cartello dice"), which is
    // what tells it from SPEAK's aloud. TELL and ASK hang under it, and it under EXPRESS, beside
    // TRANSLATE: the same frame with another instrument. The `terminus` is who it is said to ("dire
    // parole a una persona"), which TELL's and ANSWER's glosses name.
    id: 'SAY',
    role: 'verb',
    // Takes a that-clause as its object (P09-E12 D9): the builder's subordinate-clause menu offers *that*.
    // It may report a question too, "says whether the cat runs" (`content_clause_force`, P09-E17).
    clauseObject: 'content',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'cause', 'locative'],
    description: 'to utter words',
    // "to express concepts with words": the instrument is the differentia, as TRANSLATE's other
    // language is. It is true of writing too, which is right for SAY and was what kept SPEAK literal
    // (localization C28).
    definition: infinitiveGloss('EXPRESS', {
      object: 'CONCEPT',
      number: 'plural',
      complements: { instrumental: { phrase: { concept: 'WORD', definiteness: 'bare', number: 'plural' } } },
    }),
    emoji: '🗨️',
    isA: 'EXPRESS',
    forms: {
      en: {
        base: 'say', content_clause_force: 'either',
        '1sg_present': 'say', '2sg_present': 'say', '3sg_present': 'says',
        '1pl_present': 'say', '2pl_present': 'say', '3pl_present': 'say',
        past: 'said',
      },
      it: {
        base: 'dire', content_clause_force: 'either',
        '1sg_present': 'dico', '2sg_present': 'dici', '3sg_present': 'dice',
        '1pl_present': 'diciamo', '2pl_present': 'dite', '3pl_present': 'dicono',
        '1sg_past': 'dissi', '2sg_past': 'dicesti', '3sg_past': 'disse',
        '1pl_past': 'dicemmo', '2pl_past': 'diceste', '3pl_past': 'dissero',
        '1sg_future': 'dirò', '2sg_future': 'dirai', '3sg_future': 'dirà',
        '1pl_future': 'diremo', '2pl_future': 'direte', '3pl_future': 'diranno',
      },
      fr: {
        base: 'dire', content_clause_force: 'either',
        '1sg_present': 'dis', '2sg_present': 'dis', '3sg_present': 'dit',
        '1pl_present': 'disons', '2pl_present': 'dites', '3pl_present': 'disent',
        '1sg_past': 'dis', '2sg_past': 'dis', '3sg_past': 'dit',
        '1pl_past': 'dîmes', '2pl_past': 'dîtes', '3pl_past': 'dirent',
        '1sg_future': 'dirai', '2sg_future': 'diras', '3sg_future': 'dira',
        '1pl_future': 'dirons', '2pl_future': 'direz', '3pl_future': 'diront',
      },
      de: {
        base: 'sagen', content_clause_force: 'either',
        '1sg_present': 'sage', '2sg_present': 'sagst', '3sg_present': 'sagt',
        '1pl_present': 'sagen', '2pl_present': 'sagt', '3pl_present': 'sagen',
        '1sg_past': 'sagte', '2sg_past': 'sagtest', '3sg_past': 'sagte',
        '1pl_past': 'sagten', '2pl_past': 'sagtet', '3pl_past': 'sagten',
      },
      es: {
        base: 'decir', content_clause_force: 'either',
        '1sg_present': 'digo', '2sg_present': 'dices', '3sg_present': 'dice',
        '1pl_present': 'decimos', '2pl_present': 'decís', '3pl_present': 'dicen',
        '1sg_past': 'dije', '2sg_past': 'dijiste', '3sg_past': 'dijo',
        '1pl_past': 'dijimos', '2pl_past': 'dijisteis', '3pl_past': 'dijeron',
        '1sg_future': 'diré', '2sg_future': 'dirás', '3sg_future': 'dirá',
        '1pl_future': 'diremos', '2pl_future': 'diréis', '3pl_future': 'dirán',
      },
      ja: {
        // A verb of saying or thinking quotes the clause it reports with と, on the plain form — 猫が走ると言います —
        // where a verb of knowing nominalizes it with ことを (`content_clause_link`, P09-E4).
        base: '言う', content_clause_force: 'either', content_clause_link: 'と',
        reading: 'いう',
        masu_present: '言います',
        masu_present_reading: 'いいます',
        // 尊敬語 おっしゃる, 「言う」の尊敬語; 謙譲語 申す, 「言う」の謙譲語 (大辞林, デジタル大辞泉). The
        // quotative と stays: お母さんは猫が走るとおっしゃいます (P11-E1).
        honorific: 'おっしゃる', honorific_masu_present: 'おっしゃいます', honorific_te: 'おっしゃって', honorific_nai: 'おっしゃらない', honorific_stem: 'おっしゃり',
        humble: '申す', humble_masu_present: '申します', humble_te: '申して', humble_nai: '申さない',
        humble_reading: 'もうす', humble_masu_present_reading: 'もうします', humble_te_reading: 'もうして', humble_nai_reading: 'もうさない',
      },
      pt: {
        base: 'dizer', content_clause_force: 'either',
        '1sg_present': 'digo', '2sg_present': 'diz', '3sg_present': 'diz',
        '1pl_present': 'dizemos', '2pl_present': 'dizem', '3pl_present': 'dizem',
        '1sg_past': 'disse', '2sg_past': 'disse', '3sg_past': 'disse',
        '1pl_past': 'dissemos', '2pl_past': 'disseram', '3pl_past': 'disseram',
        '1sg_future': 'direi', '2sg_future': 'dirá', '3sg_future': 'dirá',
        '1pl_future': 'diremos', '2pl_future': 'dirão', '3pl_future': 'dirão',
      },
    },
  },

  {
    // P09's call in the sense D1 split from NAME: to summon, "call the man". CALL_PHONE is the other
    // call. German rufen is CRY_OUT's German too, so the German picker shows it twice; Spanish llamar
    // is CALL_PHONE's too, which is what Spanish says for both.
    id: 'CALL',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to summon someone',
    // "to cause a person to come": the causative of COME with a person as causee. BRING is the same
    // causative with an object (localization B61), and the causee is the difference. "By voice" does
    // not attach: "with words" on the causer or on COME breaks either way (B60).
    definition: causativeGloss({ object: 'PERSON', definiteness: 'indefinite' }, { verb: 'COME' }),
    emoji: '📣',
    synonym: 'summon',
    forms: {
      en: {
        base: 'call',
        '1sg_present': 'call', '2sg_present': 'call', '3sg_present': 'calls',
        '1pl_present': 'call', '2pl_present': 'call', '3pl_present': 'call',
        past: 'called',
      },
      it: {
        base: 'chiamare',
        '1sg_present': 'chiamo', '2sg_present': 'chiami', '3sg_present': 'chiama',
        '1pl_present': 'chiamiamo', '2pl_present': 'chiamate', '3pl_present': 'chiamano',
        '1sg_past': 'chiamai', '2sg_past': 'chiamasti', '3sg_past': 'chiamò',
        '1pl_past': 'chiamammo', '2pl_past': 'chiamaste', '3pl_past': 'chiamarono',
        '1sg_future': 'chiamerò', '2sg_future': 'chiamerai', '3sg_future': 'chiamerà',
        '1pl_future': 'chiameremo', '2pl_future': 'chiamerete', '3pl_future': 'chiameranno',
      },
      fr: {
        // appeler doubles its l before a mute e: appelle, appellent, appellerai — not in appelons.
        base: 'appeler',
        '1sg_present': 'appelle', '2sg_present': 'appelles', '3sg_present': 'appelle',
        '1pl_present': 'appelons', '2pl_present': 'appelez', '3pl_present': 'appellent',
        '1sg_past': 'appelai', '2sg_past': 'appelas', '3sg_past': 'appela',
        '1pl_past': 'appelâmes', '2pl_past': 'appelâtes', '3pl_past': 'appelèrent',
        '1sg_future': 'appellerai', '2sg_future': 'appelleras', '3sg_future': 'appellera',
        '1pl_future': 'appellerons', '2pl_future': 'appellerez', '3pl_future': 'appelleront',
      },
      de: {
        base: 'rufen',
        '1sg_present': 'rufe', '2sg_present': 'rufst', '3sg_present': 'ruft',
        '1pl_present': 'rufen', '2pl_present': 'ruft', '3pl_present': 'rufen',
        '1sg_past': 'rief', '2sg_past': 'riefst', '3sg_past': 'rief',
        '1pl_past': 'riefen', '2pl_past': 'rieft', '3pl_past': 'riefen',
      },
      es: {
        base: 'llamar',
        '1sg_present': 'llamo', '2sg_present': 'llamas', '3sg_present': 'llama',
        '1pl_present': 'llamamos', '2pl_present': 'llamáis', '3pl_present': 'llaman',
        '1sg_past': 'llamé', '2sg_past': 'llamaste', '3sg_past': 'llamó',
        '1pl_past': 'llamamos', '2pl_past': 'llamasteis', '3pl_past': 'llamaron',
        '1sg_future': 'llamaré', '2sg_future': 'llamarás', '3sg_future': 'llamará',
        '1pl_future': 'llamaremos', '2pl_future': 'llamaréis', '3pl_future': 'llamarán',
      },
      ja: {
        base: '呼ぶ',
        reading: 'よぶ',
        masu_present: '呼びます',
        masu_present_reading: 'よびます',
      },
      pt: {
        base: 'chamar',
        '1sg_present': 'chamo', '2sg_present': 'chama', '3sg_present': 'chama',
        '1pl_present': 'chamamos', '2pl_present': 'chamam', '3pl_present': 'chamam',
        '1sg_past': 'chamei', '2sg_past': 'chamou', '3sg_past': 'chamou',
        '1pl_past': 'chamamos', '2pl_past': 'chamaram', '3pl_past': 'chamaram',
        '1sg_future': 'chamarei', '2sg_future': 'chamará', '3sg_future': 'chamará',
        '1pl_future': 'chamaremos', '2pl_future': 'chamarão', '3pl_future': 'chamarão',
      },
    },
  },

  {
    // P09's call in the telephone sense (D1). The person called is a prepositional object in four
    // languages, each on the key its engine reads: it "telefona all'uomo", fr "téléphone à l'homme",
    // pt "telefona para o homem" (`object_prep`), ja 男に電話する (`object_particle`); German anrufen
    // takes the accusative and is separable ("ruft den Mann an"). Spanish llamar is CALL's word too,
    // which is what Spanish says; Portuguese telefonar, since ligar is LINK's.
    id: 'CALL_PHONE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to telephone someone',
    // "to use a telephone to speak with a person": a purpose clause keeps the telephone out of the
    // instrumental, which after a verb of speaking reads as the one spoken with ("mit einem Telefon
    // sprechen"). TELEPHONE is the stem of the verb in four languages: a cognate in the differentia,
    // not the genus.
    definition: infinitiveGloss('USE', {
      object: 'TELEPHONE',
      definiteness: 'indefinite',
      purpose: {
        verb: 'SPEAK',
        complements: { comitative: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } },
      },
    }),
    emoji: '📞',
    synonym: 'phone',
    forms: {
      en: {
        base: 'call',
        '1sg_present': 'call', '2sg_present': 'call', '3sg_present': 'calls',
        '1pl_present': 'call', '2pl_present': 'call', '3pl_present': 'call',
        past: 'called',
      },
      it: {
        base: 'telefonare', object_prep: 'a',
        '1sg_present': 'telefono', '2sg_present': 'telefoni', '3sg_present': 'telefona',
        '1pl_present': 'telefoniamo', '2pl_present': 'telefonate', '3pl_present': 'telefonano',
        '1sg_past': 'telefonai', '2sg_past': 'telefonasti', '3sg_past': 'telefonò',
        '1pl_past': 'telefonammo', '2pl_past': 'telefonaste', '3pl_past': 'telefonarono',
        '1sg_future': 'telefonerò', '2sg_future': 'telefonerai', '3sg_future': 'telefonerà',
        '1pl_future': 'telefoneremo', '2pl_future': 'telefonerete', '3pl_future': 'telefoneranno',
      },
      fr: {
        base: 'téléphoner', object_prep: 'à',
        '1sg_present': 'téléphone', '2sg_present': 'téléphones', '3sg_present': 'téléphone',
        '1pl_present': 'téléphonons', '2pl_present': 'téléphonez', '3pl_present': 'téléphonent',
        '1sg_past': 'téléphonai', '2sg_past': 'téléphonas', '3sg_past': 'téléphona',
        '1pl_past': 'téléphonâmes', '2pl_past': 'téléphonâtes', '3pl_past': 'téléphonèrent',
        '1sg_future': 'téléphonerai', '2sg_future': 'téléphoneras', '3sg_future': 'téléphonera',
        '1pl_future': 'téléphonerons', '2pl_future': 'téléphonerez', '3pl_future': 'téléphoneront',
      },
      de: {
        base: 'anrufen', particle: 'an',
        '1sg_present': 'rufe', '2sg_present': 'rufst', '3sg_present': 'ruft',
        '1pl_present': 'rufen', '2pl_present': 'ruft', '3pl_present': 'rufen',
        '1sg_past': 'rief', '2sg_past': 'riefst', '3sg_past': 'rief',
        '1pl_past': 'riefen', '2pl_past': 'rieft', '3pl_past': 'riefen',
      },
      es: {
        base: 'llamar',
        '1sg_present': 'llamo', '2sg_present': 'llamas', '3sg_present': 'llama',
        '1pl_present': 'llamamos', '2pl_present': 'llamáis', '3pl_present': 'llaman',
        '1sg_past': 'llamé', '2sg_past': 'llamaste', '3sg_past': 'llamó',
        '1pl_past': 'llamamos', '2pl_past': 'llamasteis', '3pl_past': 'llamaron',
        '1sg_future': 'llamaré', '2sg_future': 'llamarás', '3sg_future': 'llamará',
        '1pl_future': 'llamaremos', '2pl_future': 'llamaréis', '3pl_future': 'llamarán',
      },
      ja: {
        base: '電話する',
        reading: 'でんわする',
        masu_present: '電話します',
        masu_present_reading: 'でんわします',
        object_particle: 'に',
      },
      pt: {
        base: 'telefonar', object_prep: 'para',
        '1sg_present': 'telefono', '2sg_present': 'telefona', '3sg_present': 'telefona',
        '1pl_present': 'telefonamos', '2pl_present': 'telefonam', '3pl_present': 'telefonam',
        '1sg_past': 'telefonei', '2sg_past': 'telefonou', '3sg_past': 'telefonou',
        '1pl_past': 'telefonamos', '2pl_past': 'telefonaram', '3pl_past': 'telefonaram',
        '1sg_future': 'telefonarei', '2sg_future': 'telefonará', '3sg_future': 'telefonará',
        '1pl_future': 'telefonaremos', '2pl_future': 'telefonarão', '3pl_future': 'telefonarão',
      },
    },
  },

  {
    // P09's mean in the signify sense only ("the word means a concept"); the intend sense waits with
    // P09's row. A state, as INCLUDE is: the Romance past is its imperfect (significava), Japanese
    // says it with 〜ている (意味しています).
    id: 'MEAN',
    role: 'verb',
    stative: true,
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to have as its meaning',
    // "to have as meaning": INCLUDE's essive frame on MEANING, bare as PART is there. MEANING is
    // cognate with MEAN in five languages (significato, Bedeutung, significado, 意味): the differentia
    // again. MEANING, unglossed, cannot now be glossed on MEAN, a two-word circle.
    definition: infinitiveGloss('HAVE', {
      complements: {
        objectPredicative: {
          phrase: { concept: 'MEANING', definiteness: 'bare' },
          specifiers: [{ kind: 'predication', value: 'essive' }],
        },
      },
    }),
    emoji: '🔣',
    synonym: 'signify',
    forms: {
      en: {
        base: 'mean',
        '1sg_present': 'mean', '2sg_present': 'mean', '3sg_present': 'means',
        '1pl_present': 'mean', '2pl_present': 'mean', '3pl_present': 'mean',
        past: 'meant',
      },
      it: {
        base: 'significare',
        '1sg_present': 'significo', '2sg_present': 'significhi', '3sg_present': 'significa',
        '1pl_present': 'significhiamo', '2pl_present': 'significate', '3pl_present': 'significano',
        '1sg_past': 'significai', '2sg_past': 'significasti', '3sg_past': 'significò',
        '1pl_past': 'significammo', '2pl_past': 'significaste', '3pl_past': 'significarono',
        '1sg_future': 'significherò', '2sg_future': 'significherai', '3sg_future': 'significherà',
        '1pl_future': 'significheremo', '2pl_future': 'significherete', '3pl_future': 'significheranno',
      },
      fr: {
        base: 'signifier',
        '1sg_present': 'signifie', '2sg_present': 'signifies', '3sg_present': 'signifie',
        '1pl_present': 'signifions', '2pl_present': 'signifiez', '3pl_present': 'signifient',
        '1sg_past': 'signifiai', '2sg_past': 'signifias', '3sg_past': 'signifia',
        '1pl_past': 'signifiâmes', '2pl_past': 'signifiâtes', '3pl_past': 'signifièrent',
        '1sg_future': 'signifierai', '2sg_future': 'signifieras', '3sg_future': 'signifiera',
        '1pl_future': 'signifierons', '2pl_future': 'signifierez', '3pl_future': 'signifieront',
      },
      de: {
        // A -t stem takes an epenthetic -e- before the -st/-t endings: bedeutest, bedeutete.
        base: 'bedeuten',
        '1sg_present': 'bedeute', '2sg_present': 'bedeutest', '3sg_present': 'bedeutet',
        '1pl_present': 'bedeuten', '2pl_present': 'bedeutet', '3pl_present': 'bedeuten',
        '1sg_past': 'bedeutete', '2sg_past': 'bedeutetest', '3sg_past': 'bedeutete',
        '1pl_past': 'bedeuteten', '2pl_past': 'bedeutetet', '3pl_past': 'bedeuteten',
      },
      es: {
        base: 'significar',
        '1sg_present': 'significo', '2sg_present': 'significas', '3sg_present': 'significa',
        '1pl_present': 'significamos', '2pl_present': 'significáis', '3pl_present': 'significan',
        '1sg_past': 'signifiqué', '2sg_past': 'significaste', '3sg_past': 'significó',
        '1pl_past': 'significamos', '2pl_past': 'significasteis', '3pl_past': 'significaron',
        '1sg_future': 'significaré', '2sg_future': 'significarás', '3sg_future': 'significará',
        '1pl_future': 'significaremos', '2pl_future': 'significaréis', '3pl_future': 'significarán',
      },
      ja: {
        base: '意味する',
        reading: 'いみする',
        masu_present: '意味します',
        masu_present_reading: 'いみします',
      },
      pt: {
        base: 'significar',
        '1sg_present': 'significo', '2sg_present': 'significa', '3sg_present': 'significa',
        '1pl_present': 'significamos', '2pl_present': 'significam', '3pl_present': 'significam',
        '1sg_past': 'signifiquei', '2sg_past': 'significou', '3sg_past': 'significou',
        '1pl_past': 'significamos', '2pl_past': 'significaram', '3pl_past': 'significaram',
        '1sg_future': 'significarei', '2sg_future': 'significará', '3sg_future': 'significará',
        '1pl_future': 'significaremos', '2pl_future': 'significarão', '3pl_future': 'significarão',
      },
    },
  },

  {
    // P09's believe, with a thing as its object ("believes the story"); a person believed, German
    // glauben + dative, is E9 and outside this seed (localization C35). Italian credere a and
    // Portuguese acreditar em take the thing with a preposition (`object_prep`): "crede alla
    // storia", "acredita na história". A state: credeva, 信じています.
    id: 'BELIEVE',
    role: 'verb',
    // Takes a that-clause as its object (P09-E12 D9): the builder's subordinate-clause menu offers *that*.
    clauseObject: 'content',
    stative: true,
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to take something as true',
    // "to accept as fact": INCLUDE's essive frame on ACCEPT. Japanese 受け付ける is ACCEPT's interface
    // word (an entry accepted), so 事実として受け付ける reads "to register as fact": the lexeme, not the
    // plan, and VALID stands on it.
    definition: infinitiveGloss('ACCEPT', {
      complements: {
        objectPredicative: {
          phrase: { concept: 'FACT', definiteness: 'bare' },
          specifiers: [{ kind: 'predication', value: 'essive' }],
        },
      },
    }),
    emoji: '🙏',
    forms: {
      en: {
        base: 'believe',
        '1sg_present': 'believe', '2sg_present': 'believe', '3sg_present': 'believes',
        '1pl_present': 'believe', '2pl_present': 'believe', '3pl_present': 'believe',
        past: 'believed',
      },
      it: {
        // Italian puts what one believes in the subjunctive in the standard register, affirmed or not:
        // "crede che il gatto corra" (`content_clause_mood`, P09-E4). French, Spanish and Portuguese
        // keep the affirmative's indicative, and take the subjunctive only negated (A247).
        base: 'credere', object_prep: 'a', content_clause_mood: 'subjunctive',
        '1sg_present': 'credo', '2sg_present': 'credi', '3sg_present': 'crede',
        '1pl_present': 'crediamo', '2pl_present': 'credete', '3pl_present': 'credono',
        '1sg_past': 'credetti', '2sg_past': 'credesti', '3sg_past': 'credette',
        '1pl_past': 'credemmo', '2pl_past': 'credeste', '3pl_past': 'credettero',
        '1sg_future': 'crederò', '2sg_future': 'crederai', '3sg_future': 'crederà',
        '1pl_future': 'crederemo', '2pl_future': 'crederete', '3pl_future': 'crederanno',
      },
      fr: {
        // A denied belief is in the subjunctive, an affirmed one in the indicative: "ne croit pas que
        // le chat coure", "croit que le chat court" (`content_clause_mood_negative`, A247).
        base: 'croire', content_clause_mood_negative: 'subjunctive',
        '1sg_present': 'crois', '2sg_present': 'crois', '3sg_present': 'croit',
        '1pl_present': 'croyons', '2pl_present': 'croyez', '3pl_present': 'croient',
        '1sg_past': 'crus', '2sg_past': 'crus', '3sg_past': 'crut',
        '1pl_past': 'crûmes', '2pl_past': 'crûtes', '3pl_past': 'crurent',
        '1sg_future': 'croirai', '2sg_future': 'croiras', '3sg_future': 'croira',
        '1pl_future': 'croirons', '2pl_future': 'croirez', '3pl_future': 'croiront',
      },
      de: {
        base: 'glauben',
        '1sg_present': 'glaube', '2sg_present': 'glaubst', '3sg_present': 'glaubt',
        '1pl_present': 'glauben', '2pl_present': 'glaubt', '3pl_present': 'glauben',
        '1sg_past': 'glaubte', '2sg_past': 'glaubtest', '3sg_past': 'glaubte',
        '1pl_past': 'glaubten', '2pl_past': 'glaubtet', '3pl_past': 'glaubten',
      },
      es: {
        // creer writes the unstressed i between vowels as y: creyó, creyeron, creyendo. A denied
        // belief is in the subjunctive: "no cree que el gato corra" (`content_clause_mood_negative`, A247).
        base: 'creer', content_clause_mood_negative: 'subjunctive',
        '1sg_present': 'creo', '2sg_present': 'crees', '3sg_present': 'cree',
        '1pl_present': 'creemos', '2pl_present': 'creéis', '3pl_present': 'creen',
        '1sg_past': 'creí', '2sg_past': 'creíste', '3sg_past': 'creyó',
        '1pl_past': 'creímos', '2pl_past': 'creísteis', '3pl_past': 'creyeron',
        '1sg_future': 'creeré', '2sg_future': 'creerás', '3sg_future': 'creerá',
        '1pl_future': 'creeremos', '2pl_future': 'creeréis', '3pl_future': 'creerán',
      },
      ja: {
        // A verb of saying or thinking quotes the clause it reports with と, on the plain form — 猫が走ると信じます —
        // where a verb of knowing nominalizes it with ことを (`content_clause_link`, P09-E4).
        base: '信じる', content_clause_link: 'と',
        reading: 'しんじる',
        masu_present: '信じます',
        masu_present_reading: 'しんじます',
      },
      pt: {
        // A denied belief is in the subjunctive: "não acredita que o gato corra"
        // (`content_clause_mood_negative`, A247).
        base: 'acreditar', object_prep: 'em', content_clause_mood_negative: 'subjunctive',
        '1sg_present': 'acredito', '2sg_present': 'acredita', '3sg_present': 'acredita',
        '1pl_present': 'acreditamos', '2pl_present': 'acreditam', '3pl_present': 'acreditam',
        '1sg_past': 'acreditei', '2sg_past': 'acreditou', '3sg_past': 'acreditou',
        '1pl_past': 'acreditamos', '2pl_past': 'acreditaram', '3pl_past': 'acreditaram',
        '1sg_future': 'acreditarei', '2sg_future': 'acreditará', '3sg_future': 'acreditará',
        '1pl_future': 'acreditaremos', '2pl_future': 'acreditarão', '3pl_future': 'acreditarão',
      },
    },
  },

  {
    id: 'REPLACE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to stand in for; to take the place of',
    emoji: '🔄',
    synonym: 'stand for',
    forms: {
      en: {
        base: 'replace',
        '1sg_present': 'replace', '2sg_present': 'replace', '3sg_present': 'replaces',
        '1pl_present': 'replace', '2pl_present': 'replace', '3pl_present': 'replace',
        past: 'replaced',
      },
      it: {
        base: 'sostituire',
        '1sg_present': 'sostituisco', '2sg_present': 'sostituisci', '3sg_present': 'sostituisce',
        '1pl_present': 'sostituiamo', '2pl_present': 'sostituite', '3pl_present': 'sostituiscono',
        '1sg_past': 'sostituii', '2sg_past': 'sostituisti', '3sg_past': 'sostituì',
        '1pl_past': 'sostituimmo', '2pl_past': 'sostituiste', '3pl_past': 'sostituirono',
        '1sg_future': 'sostituirò', '2sg_future': 'sostituirai', '3sg_future': 'sostituirà',
        '1pl_future': 'sostituiremo', '2pl_future': 'sostituirete', '3pl_future': 'sostituiranno',
      },
      fr: {
        base: 'remplacer',
        '1sg_present': 'remplace', '2sg_present': 'remplaces', '3sg_present': 'remplace',
        '1pl_present': 'remplaçons', '2pl_present': 'remplacez', '3pl_present': 'remplacent',
        '1sg_past': 'remplaçai', '2sg_past': 'remplaças', '3sg_past': 'remplaça',
        '1pl_past': 'remplaçâmes', '2pl_past': 'remplaçâtes', '3pl_past': 'remplacèrent',
        '1sg_future': 'remplacerai', '2sg_future': 'remplaceras', '3sg_future': 'remplacera',
        '1pl_future': 'remplacerons', '2pl_future': 'remplacerez', '3pl_future': 'remplaceront',
      },
      de: {
        base: 'ersetzen',
        '1sg_present': 'ersetze', '2sg_present': 'ersetzt', '3sg_present': 'ersetzt',
        '1pl_present': 'ersetzen', '2pl_present': 'ersetzt', '3pl_present': 'ersetzen',
        '1sg_past': 'ersetzte', '2sg_past': 'ersetztest', '3sg_past': 'ersetzte',
        '1pl_past': 'ersetzten', '2pl_past': 'ersetztet', '3pl_past': 'ersetzten',
      },
      es: {
        base: 'reemplazar',
        '1sg_present': 'reemplazo', '2sg_present': 'reemplazas', '3sg_present': 'reemplaza',
        '1pl_present': 'reemplazamos', '2pl_present': 'reemplazáis', '3pl_present': 'reemplazan',
        '1sg_past': 'reemplacé', '2sg_past': 'reemplazaste', '3sg_past': 'reemplazó',
        '1pl_past': 'reemplazamos', '2pl_past': 'reemplazasteis', '3pl_past': 'reemplazaron',
        '1sg_future': 'reemplazaré', '2sg_future': 'reemplazarás', '3sg_future': 'reemplazará',
        '1pl_future': 'reemplazaremos', '2pl_future': 'reemplazaréis', '3pl_future': 'reemplazarán',
      },
      ja: {
        base: '置き換える',
        reading: 'おきかえる',
        masu_present: '置き換えます',
        masu_present_reading: 'おきかえます',
      },
      pt: {
        base: 'substituir',
        '1sg_present': 'substituo', '2sg_present': 'substitui', '3sg_present': 'substitui',
        '1pl_present': 'substituímos', '2pl_present': 'substituem', '3pl_present': 'substituem',
        '1sg_past': 'substituí', '2sg_past': 'substituiu', '3sg_past': 'substituiu',
        '1pl_past': 'substituímos', '2pl_past': 'substituíram', '3pl_past': 'substituíram',
        '1sg_future': 'substituirei', '2sg_future': 'substituirá', '3sg_future': 'substituirá',
        '1pl_future': 'substituiremos', '2pl_future': 'substituirão', '3pl_future': 'substituirão',
      },
    },
  },
  // ── The verbs the substance and state glosses stand on (localization B53) ──
  {
    id: 'BREATHE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to draw air in and let it out',
    emoji: '🫁',
    forms: {
      en: {
        base: 'breathe',
        '1sg_present': 'breathe', '2sg_present': 'breathe', '3sg_present': 'breathes',
        '1pl_present': 'breathe', '2pl_present': 'breathe', '3pl_present': 'breathe',
        past: 'breathed',
      },
      it: {
        base: 'respirare',
        '1sg_present': 'respiro', '2sg_present': 'respiri', '3sg_present': 'respira',
        '1pl_present': 'respiriamo', '2pl_present': 'respirate', '3pl_present': 'respirano',
        '1sg_past': 'respirai', '2sg_past': 'respirasti', '3sg_past': 'respirò',
        '1pl_past': 'respirammo', '2pl_past': 'respiraste', '3pl_past': 'respirarono',
        '1sg_future': 'respirerò', '2sg_future': 'respirerai', '3sg_future': 'respirerà',
        '1pl_future': 'respireremo', '2pl_future': 'respirerete', '3pl_future': 'respireranno',
      },
      fr: {
        base: 'respirer',
        '1sg_present': 'respire', '2sg_present': 'respires', '3sg_present': 'respire',
        '1pl_present': 'respirons', '2pl_present': 'respirez', '3pl_present': 'respirent',
        '1sg_past': 'respirai', '2sg_past': 'respiras', '3sg_past': 'respira',
        '1pl_past': 'respirâmes', '2pl_past': 'respirâtes', '3pl_past': 'respirèrent',
        '1sg_future': 'respirerai', '2sg_future': 'respireras', '3sg_future': 'respirera',
        '1pl_future': 'respirerons', '2pl_future': 'respirerez', '3pl_future': 'respireront',
      },
      de: {
        // A -tmen stem takes an epenthetic -e- before the -st/-t endings: atmest, atmete.
        base: 'atmen',
        '1sg_present': 'atme', '2sg_present': 'atmest', '3sg_present': 'atmet',
        '1pl_present': 'atmen', '2pl_present': 'atmet', '3pl_present': 'atmen',
        '1sg_past': 'atmete', '2sg_past': 'atmetest', '3sg_past': 'atmete',
        '1pl_past': 'atmeten', '2pl_past': 'atmetet', '3pl_past': 'atmeten',
      },
      es: {
        base: 'respirar',
        '1sg_present': 'respiro', '2sg_present': 'respiras', '3sg_present': 'respira',
        '1pl_present': 'respiramos', '2pl_present': 'respiráis', '3pl_present': 'respiran',
        '1sg_past': 'respiré', '2sg_past': 'respiraste', '3sg_past': 'respiró',
        '1pl_past': 'respiramos', '2pl_past': 'respirasteis', '3pl_past': 'respiraron',
        '1sg_future': 'respiraré', '2sg_future': 'respirarás', '3sg_future': 'respirará',
        '1pl_future': 'respiraremos', '2pl_future': 'respiraréis', '3pl_future': 'respirarán',
      },
      ja: {
        base: '呼吸する',
        reading: 'こきゅうする',
        masu_present: '呼吸します',
        masu_present_reading: 'こきゅうします',
      },
      pt: {
        base: 'respirar',
        '1sg_present': 'respiro', '2sg_present': 'respira', '3sg_present': 'respira',
        '1pl_present': 'respiramos', '2pl_present': 'respiram', '3pl_present': 'respiram',
        '1sg_past': 'respirei', '2sg_past': 'respirou', '3sg_past': 'respirou',
        '1pl_past': 'respiramos', '2pl_past': 'respiraram', '3pl_past': 'respiraram',
        '1sg_future': 'respirarei', '2sg_future': 'respirará', '3sg_future': 'respirará',
        '1pl_future': 'respiraremos', '2pl_future': 'respirarão', '3pl_future': 'respirarão',
      },
    },
  },
  {
    id: 'EXCHANGE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'instrumental', 'cause', 'locative'],
    description: 'to give one thing and take another for it',
    // "to give an object to acquire another object" (localization C28): the purpose clause (C19)
    // carries the half the description calls taking. Singular, one thing for another.
    definition: infinitiveGloss('GIVE', {
      object: 'OBJECT_THING',
      definiteness: 'indefinite',
      purpose: { verb: 'ACQUIRE', object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['OTHER'] },
    }),
    emoji: '🔄',
    forms: {
      en: {
        base: 'exchange',
        '1sg_present': 'exchange', '2sg_present': 'exchange', '3sg_present': 'exchanges',
        '1pl_present': 'exchange', '2pl_present': 'exchange', '3pl_present': 'exchange',
        past: 'exchanged',
      },
      it: {
        base: 'scambiare',
        '1sg_present': 'scambio', '2sg_present': 'scambi', '3sg_present': 'scambia',
        '1pl_present': 'scambiamo', '2pl_present': 'scambiate', '3pl_present': 'scambiano',
        '1sg_past': 'scambiai', '2sg_past': 'scambiasti', '3sg_past': 'scambiò',
        '1pl_past': 'scambiammo', '2pl_past': 'scambiaste', '3pl_past': 'scambiarono',
        '1sg_future': 'scambierò', '2sg_future': 'scambierai', '3sg_future': 'scambierà',
        '1pl_future': 'scambieremo', '2pl_future': 'scambierete', '3pl_future': 'scambieranno',
      },
      fr: {
        // -ger keeps its soft g with an e before a/o: nous échangeons, il échangea.
        base: 'échanger',
        '1sg_present': 'échange', '2sg_present': 'échanges', '3sg_present': 'échange',
        '1pl_present': 'échangeons', '2pl_present': 'échangez', '3pl_present': 'échangent',
        '1sg_past': 'échangeai', '2sg_past': 'échangeas', '3sg_past': 'échangea',
        '1pl_past': 'échangeâmes', '2pl_past': 'échangeâtes', '3pl_past': 'échangèrent',
        '1sg_future': 'échangerai', '2sg_future': 'échangeras', '3sg_future': 'échangera',
        '1pl_future': 'échangerons', '2pl_future': 'échangerez', '3pl_future': 'échangeront',
      },
      de: {
        base: 'tauschen',
        '1sg_present': 'tausche', '2sg_present': 'tauschst', '3sg_present': 'tauscht',
        '1pl_present': 'tauschen', '2pl_present': 'tauscht', '3pl_present': 'tauschen',
        '1sg_past': 'tauschte', '2sg_past': 'tauschtest', '3sg_past': 'tauschte',
        '1pl_past': 'tauschten', '2pl_past': 'tauschtet', '3pl_past': 'tauschten',
      },
      es: {
        base: 'intercambiar',
        '1sg_present': 'intercambio', '2sg_present': 'intercambias', '3sg_present': 'intercambia',
        '1pl_present': 'intercambiamos', '2pl_present': 'intercambiáis', '3pl_present': 'intercambian',
        '1sg_past': 'intercambié', '2sg_past': 'intercambiaste', '3sg_past': 'intercambió',
        '1pl_past': 'intercambiamos', '2pl_past': 'intercambiasteis', '3pl_past': 'intercambiaron',
        '1sg_future': 'intercambiaré', '2sg_future': 'intercambiarás', '3sg_future': 'intercambiará',
        '1pl_future': 'intercambiaremos', '2pl_future': 'intercambiaréis', '3pl_future': 'intercambiarán',
      },
      ja: {
        base: '交換する',
        reading: 'こうかんする',
        masu_present: '交換します',
        masu_present_reading: 'こうかんします',
      },
      pt: {
        // -car takes qu before the -ei of the preterite: troquei.
        base: 'trocar',
        '1sg_present': 'troco', '2sg_present': 'troca', '3sg_present': 'troca',
        '1pl_present': 'trocamos', '2pl_present': 'trocam', '3pl_present': 'trocam',
        '1sg_past': 'troquei', '2sg_past': 'trocou', '3sg_past': 'trocou',
        '1pl_past': 'trocamos', '2pl_past': 'trocaram', '3pl_past': 'trocaram',
        '1sg_future': 'trocarei', '2sg_future': 'trocará', '3sg_future': 'trocará',
        '1pl_future': 'trocaremos', '2pl_future': 'trocarão', '3pl_future': 'trocarão',
      },
    },
  },
  {
    id: 'ENCLOSE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to shut a space in on its sides',
    emoji: '⭕',
    synonym: 'surround',
    forms: {
      en: {
        base: 'enclose',
        '1sg_present': 'enclose', '2sg_present': 'enclose', '3sg_present': 'encloses',
        '1pl_present': 'enclose', '2pl_present': 'enclose', '3pl_present': 'enclose',
        past: 'enclosed',
      },
      it: {
        base: 'racchiudere',
        '1sg_present': 'racchiudo', '2sg_present': 'racchiudi', '3sg_present': 'racchiude',
        '1pl_present': 'racchiudiamo', '2pl_present': 'racchiudete', '3pl_present': 'racchiudono',
        '1sg_past': 'racchiusi', '2sg_past': 'racchiudesti', '3sg_past': 'racchiuse',
        '1pl_past': 'racchiudemmo', '2pl_past': 'racchiudeste', '3pl_past': 'racchiusero',
        '1sg_future': 'racchiuderò', '2sg_future': 'racchiuderai', '3sg_future': 'racchiuderà',
        '1pl_future': 'racchiuderemo', '2pl_future': 'racchiuderete', '3pl_future': 'racchiuderanno',
      },
      fr: {
        // entourer, not enclore: enclore has no passé simple at all, and the corpus conjugates one.
        base: 'entourer',
        '1sg_present': 'entoure', '2sg_present': 'entoures', '3sg_present': 'entoure',
        '1pl_present': 'entourons', '2pl_present': 'entourez', '3pl_present': 'entourent',
        '1sg_past': 'entourai', '2sg_past': 'entouras', '3sg_past': 'entoura',
        '1pl_past': 'entourâmes', '2pl_past': 'entourâtes', '3pl_past': 'entourèrent',
        '1sg_future': 'entourerai', '2sg_future': 'entoureras', '3sg_future': 'entourera',
        '1pl_future': 'entourerons', '2pl_future': 'entourerez', '3pl_future': 'entoureront',
      },
      de: {
        // umschließen is inseparable in this sense (er umschließt), so it takes no particle.
        base: 'umschließen',
        '1sg_present': 'umschließe', '2sg_present': 'umschließt', '3sg_present': 'umschließt',
        '1pl_present': 'umschließen', '2pl_present': 'umschließt', '3pl_present': 'umschließen',
        '1sg_past': 'umschloss', '2sg_past': 'umschlossest', '3sg_past': 'umschloss',
        '1pl_past': 'umschlossen', '2pl_past': 'umschlosst', '3pl_past': 'umschlossen',
      },
      es: {
        // encerrar stem-changes e → ie under the stress.
        base: 'encerrar',
        '1sg_present': 'encierro', '2sg_present': 'encierras', '3sg_present': 'encierra',
        '1pl_present': 'encerramos', '2pl_present': 'encerráis', '3pl_present': 'encierran',
        '1sg_past': 'encerré', '2sg_past': 'encerraste', '3sg_past': 'encerró',
        '1pl_past': 'encerramos', '2pl_past': 'encerrasteis', '3pl_past': 'encerraron',
        '1sg_future': 'encerraré', '2sg_future': 'encerrarás', '3sg_future': 'encerrará',
        '1pl_future': 'encerraremos', '2pl_future': 'encerraréis', '3pl_future': 'encerrarán',
      },
      ja: {
        base: '囲む',
        reading: 'かこむ',
        masu_present: '囲みます',
        masu_present_reading: 'かこみます',
      },
      pt: {
        // -car takes qu before the -ei of the preterite: cerquei.
        base: 'cercar',
        '1sg_present': 'cerco', '2sg_present': 'cerca', '3sg_present': 'cerca',
        '1pl_present': 'cercamos', '2pl_present': 'cercam', '3pl_present': 'cercam',
        '1sg_past': 'cerquei', '2sg_past': 'cercou', '3sg_past': 'cercou',
        '1pl_past': 'cercamos', '2pl_past': 'cercaram', '3pl_past': 'cercaram',
        '1sg_future': 'cercarei', '2sg_future': 'cercará', '3sg_future': 'cercará',
        '1pl_future': 'cercaremos', '2pl_future': 'cercarão', '3pl_future': 'cercarão',
      },
    },
  },
  {
    id: 'HEAR',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to take in through the ears',
    // "to perceive sounds" (localization C28), SEE's "to perceive light" on the other sense. Plural:
    // sounds are counted where light is not.
    definition: infinitiveGloss('PERCEIVE', 'SOUND', 'plural'),
    emoji: '👂',
    forms: {
      en: {
        base: 'hear',
        '1sg_present': 'hear', '2sg_present': 'hear', '3sg_present': 'hears',
        '1pl_present': 'hear', '2pl_present': 'hear', '3pl_present': 'hear',
        past: 'heard',
      },
      it: {
        base: 'sentire',
        '1sg_present': 'sento', '2sg_present': 'senti', '3sg_present': 'sente',
        '1pl_present': 'sentiamo', '2pl_present': 'sentite', '3pl_present': 'sentono',
        '1sg_past': 'sentii', '2sg_past': 'sentisti', '3sg_past': 'sentì',
        '1pl_past': 'sentimmo', '2pl_past': 'sentiste', '3pl_past': 'sentirono',
        '1sg_future': 'sentirò', '2sg_future': 'sentirai', '3sg_future': 'sentirà',
        '1pl_future': 'sentiremo', '2pl_future': 'sentirete', '3pl_future': 'sentiranno',
      },
      fr: {
        base: 'entendre',
        '1sg_present': 'entends', '2sg_present': 'entends', '3sg_present': 'entend',
        '1pl_present': 'entendons', '2pl_present': 'entendez', '3pl_present': 'entendent',
        '1sg_past': 'entendis', '2sg_past': 'entendis', '3sg_past': 'entendit',
        '1pl_past': 'entendîmes', '2pl_past': 'entendîtes', '3pl_past': 'entendirent',
        '1sg_future': 'entendrai', '2sg_future': 'entendras', '3sg_future': 'entendra',
        '1pl_future': 'entendrons', '2pl_future': 'entendrez', '3pl_future': 'entendront',
      },
      de: {
        base: 'hören',
        '1sg_present': 'höre', '2sg_present': 'hörst', '3sg_present': 'hört',
        '1pl_present': 'hören', '2pl_present': 'hört', '3pl_present': 'hören',
        '1sg_past': 'hörte', '2sg_past': 'hörtest', '3sg_past': 'hörte',
        '1pl_past': 'hörten', '2pl_past': 'hörtet', '3pl_past': 'hörten',
      },
      es: {
        // oír is irregular throughout: the y of oyes/oyen and the g of oigo.
        base: 'oír',
        '1sg_present': 'oigo', '2sg_present': 'oyes', '3sg_present': 'oye',
        '1pl_present': 'oímos', '2pl_present': 'oís', '3pl_present': 'oyen',
        '1sg_past': 'oí', '2sg_past': 'oíste', '3sg_past': 'oyó',
        '1pl_past': 'oímos', '2pl_past': 'oísteis', '3pl_past': 'oyeron',
        '1sg_future': 'oiré', '2sg_future': 'oirás', '3sg_future': 'oirá',
        '1pl_future': 'oiremos', '2pl_future': 'oiréis', '3pl_future': 'oirán',
      },
      ja: {
        base: '聞く',
        reading: 'きく',
        masu_present: '聞きます',
        masu_present_reading: 'ききます',
      },
      pt: {
        // ouvir's 1sg takes the ç of ouço.
        base: 'ouvir',
        '1sg_present': 'ouço', '2sg_present': 'ouve', '3sg_present': 'ouve',
        '1pl_present': 'ouvimos', '2pl_present': 'ouvem', '3pl_present': 'ouvem',
        '1sg_past': 'ouvi', '2sg_past': 'ouviu', '3sg_past': 'ouviu',
        '1pl_past': 'ouvimos', '2pl_past': 'ouviram', '3pl_past': 'ouviram',
        '1sg_future': 'ouvirei', '2sg_future': 'ouvirá', '3sg_future': 'ouvirá',
        '1pl_future': 'ouviremos', '2pl_future': 'ouvirão', '3pl_future': 'ouvirão',
      },
    },
  },
  // ── Governing a people, the state sense apart from the grammatical one (localization B56) ──
  // Licenses `instrumental` for what one governs with — POWER's differentia (P13).
  {
    // GOVERN is the grammatical sense — what a subject does to a verb (localization A27). This is
    // the political one, split the way B48 split the climate senses of COLD and HOT.
    id: 'GOVERN_STATE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative', 'instrumental'],
    description: 'to rule a people, hold the government of',
    emoji: '🏛️',
    synonym: 'rule',
    forms: {
      en: {
        base: 'govern',
        '1sg_present': 'govern', '2sg_present': 'govern', '3sg_present': 'governs',
        '1pl_present': 'govern', '2pl_present': 'govern', '3pl_present': 'govern',
        past: 'governed',
      },
      it: {
        base: 'governare',
        '1sg_present': 'governo', '2sg_present': 'governi', '3sg_present': 'governa',
        '1pl_present': 'governiamo', '2pl_present': 'governate', '3pl_present': 'governano',
        '1sg_past': 'governai', '2sg_past': 'governasti', '3sg_past': 'governò',
        '1pl_past': 'governammo', '2pl_past': 'governaste', '3pl_past': 'governarono',
        '1sg_future': 'governerò', '2sg_future': 'governerai', '3sg_future': 'governerà',
        '1pl_future': 'governeremo', '2pl_future': 'governerete', '3pl_future': 'governeranno',
      },
      fr: {
        base: 'gouverner',
        '1sg_present': 'gouverne', '2sg_present': 'gouvernes', '3sg_present': 'gouverne',
        '1pl_present': 'gouvernons', '2pl_present': 'gouvernez', '3pl_present': 'gouvernent',
        '1sg_past': 'gouvernai', '2sg_past': 'gouvernas', '3sg_past': 'gouverna',
        '1pl_past': 'gouvernâmes', '2pl_past': 'gouvernâtes', '3pl_past': 'gouvernèrent',
        '1sg_future': 'gouvernerai', '2sg_future': 'gouverneras', '3sg_future': 'gouvernera',
        '1pl_future': 'gouvernerons', '2pl_future': 'gouvernerez', '3pl_future': 'gouverneront',
      },
      de: {
        base: 'regieren',
        '1sg_present': 'regiere', '2sg_present': 'regierst', '3sg_present': 'regiert',
        '1pl_present': 'regieren', '2pl_present': 'regiert', '3pl_present': 'regieren',
        '1sg_past': 'regierte', '2sg_past': 'regiertest', '3sg_past': 'regierte',
        '1pl_past': 'regierten', '2pl_past': 'regiertet', '3pl_past': 'regierten',
      },
      es: {
        // gobernar stem-changes e → ie under the stress.
        base: 'gobernar',
        '1sg_present': 'gobierno', '2sg_present': 'gobiernas', '3sg_present': 'gobierna',
        '1pl_present': 'gobernamos', '2pl_present': 'gobernáis', '3pl_present': 'gobiernan',
        '1sg_past': 'goberné', '2sg_past': 'gobernaste', '3sg_past': 'gobernó',
        '1pl_past': 'gobernamos', '2pl_past': 'gobernasteis', '3pl_past': 'gobernaron',
        '1sg_future': 'gobernaré', '2sg_future': 'gobernarás', '3sg_future': 'gobernará',
        '1pl_future': 'gobernaremos', '2pl_future': 'gobernaréis', '3pl_future': 'gobernarán',
      },
      ja: {
        base: '統治する',
        reading: 'とうちする',
        masu_present: '統治します',
        masu_present_reading: 'とうちします',
      },
      pt: {
        base: 'governar',
        '1sg_present': 'governo', '2sg_present': 'governa', '3sg_present': 'governa',
        '1pl_present': 'governamos', '2pl_present': 'governam', '3pl_present': 'governam',
        '1sg_past': 'governei', '2sg_past': 'governou', '3sg_past': 'governou',
        '1pl_past': 'governamos', '2pl_past': 'governaram', '3pl_past': 'governaram',
        '1sg_future': 'governarei', '2sg_future': 'governará', '3sg_future': 'governará',
        '1pl_future': 'governaremos', '2pl_future': 'governarão', '3pl_future': 'governarão',
      },
    },
  },
  // ── The verbs the interface nouns stand on (localization B57) ──────
  {
    id: 'ACCOMPANY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to go along with another',
    // "to go with a person" (localization C28): GO with the comitative companion (C12), the "with"
    // that says together rather than by means of. GO licenses no comitative box on the canvas; the
    // plan renders it regardless, as ADD's does on BE.
    definition: infinitiveGloss('GO', {
      complements: { comitative: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } },
    }),
    emoji: '🧑‍🤝‍🧑',
    forms: {
      en: {
        base: 'accompany',
        '1sg_present': 'accompany', '2sg_present': 'accompany', '3sg_present': 'accompanies',
        '1pl_present': 'accompany', '2pl_present': 'accompany', '3pl_present': 'accompany',
        past: 'accompanied',
      },
      it: {
        base: 'accompagnare',
        '1sg_present': 'accompagno', '2sg_present': 'accompagni', '3sg_present': 'accompagna',
        '1pl_present': 'accompagniamo', '2pl_present': 'accompagnate', '3pl_present': 'accompagnano',
        '1sg_past': 'accompagnai', '2sg_past': 'accompagnasti', '3sg_past': 'accompagnò',
        '1pl_past': 'accompagnammo', '2pl_past': 'accompagnaste', '3pl_past': 'accompagnarono',
        '1sg_future': 'accompagnerò', '2sg_future': 'accompagnerai', '3sg_future': 'accompagnerà',
        '1pl_future': 'accompagneremo', '2pl_future': 'accompagnerete', '3pl_future': 'accompagneranno',
      },
      fr: {
        base: 'accompagner',
        '1sg_present': 'accompagne', '2sg_present': 'accompagnes', '3sg_present': 'accompagne',
        '1pl_present': 'accompagnons', '2pl_present': 'accompagnez', '3pl_present': 'accompagnent',
        '1sg_past': 'accompagnai', '2sg_past': 'accompagnas', '3sg_past': 'accompagna',
        '1pl_past': 'accompagnâmes', '2pl_past': 'accompagnâtes', '3pl_past': 'accompagnèrent',
        '1sg_future': 'accompagnerai', '2sg_future': 'accompagneras', '3sg_future': 'accompagnera',
        '1pl_future': 'accompagnerons', '2pl_future': 'accompagnerez', '3pl_future': 'accompagneront',
      },
      de: {
        base: 'begleiten',
        '1sg_present': 'begleite', '2sg_present': 'begleitest', '3sg_present': 'begleitet',
        '1pl_present': 'begleiten', '2pl_present': 'begleitet', '3pl_present': 'begleiten',
        '1sg_past': 'begleitete', '2sg_past': 'begleitetest', '3sg_past': 'begleitete',
        '1pl_past': 'begleiteten', '2pl_past': 'begleitetet', '3pl_past': 'begleiteten',
      },
      es: {
        base: 'acompañar',
        '1sg_present': 'acompaño', '2sg_present': 'acompañas', '3sg_present': 'acompaña',
        '1pl_present': 'acompañamos', '2pl_present': 'acompañáis', '3pl_present': 'acompañan',
        '1sg_past': 'acompañé', '2sg_past': 'acompañaste', '3sg_past': 'acompañó',
        '1pl_past': 'acompañamos', '2pl_past': 'acompañasteis', '3pl_past': 'acompañaron',
        '1sg_future': 'acompañaré', '2sg_future': 'acompañarás', '3sg_future': 'acompañará',
        '1pl_future': 'acompañaremos', '2pl_future': 'acompañaréis', '3pl_future': 'acompañarán',
      },
      ja: {
        base: '同行する',
        reading: 'どうこうする',
        masu_present: '同行します',
        masu_present_reading: 'どうこうします',
      },
      pt: {
        base: 'acompanhar',
        '1sg_present': 'acompanho', '2sg_present': 'acompanha', '3sg_present': 'acompanha',
        '1pl_present': 'acompanhamos', '2pl_present': 'acompanham', '3pl_present': 'acompanham',
        '1sg_past': 'acompanhei', '2sg_past': 'acompanhou', '3sg_past': 'acompanhou',
        '1pl_past': 'acompanhamos', '2pl_past': 'acompanharam', '3pl_past': 'acompanharam',
        '1sg_future': 'acompanharei', '2sg_future': 'acompanhará', '3sg_future': 'acompanhará',
        '1pl_future': 'acompanharemos', '2pl_future': 'acompanharão', '3pl_future': 'acompanharão',
      },
    },
  },
  {
    id: 'ANSWER',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to say back what was asked for',
    // "to say words to a person who asks" (localization B60, re-opening C28's literal verdict): a
    // relative on the recipient says the *what was asked* C28 wanted a question noun or a reply
    // relation for. German puts the relative inside the clause, "einer Person, die fragt, Wörter
    // sagen". QUESTION as the object would not do: rispondere, répondre and antworten take a dative.
    definition: infinitiveGloss('SAY', {
      object: 'WORD',
      number: 'plural',
      complements: {
        terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite', relative: { verbPhrase: { verb: 'ASK' } } } },
      },
    }),
    emoji: '💬',
    forms: {
      en: {
        // One answers the person, and "answers to the man" reads *is accountable to*: the addressee
        // is a bare object here too (A238).
        base: 'answer', terminus_bare: '1',
        '1sg_present': 'answer', '2sg_present': 'answer', '3sg_present': 'answers',
        '1pl_present': 'answer', '2pl_present': 'answer', '3pl_present': 'answer',
        past: 'answered',
      },
      it: {
        base: 'rispondere',
        '1sg_present': 'rispondo', '2sg_present': 'rispondi', '3sg_present': 'risponde',
        '1pl_present': 'rispondiamo', '2pl_present': 'rispondete', '3pl_present': 'rispondono',
        '1sg_past': 'risposi', '2sg_past': 'rispondesti', '3sg_past': 'rispose',
        '1pl_past': 'rispondemmo', '2pl_past': 'rispondeste', '3pl_past': 'risposero',
        '1sg_future': 'risponderò', '2sg_future': 'risponderai', '3sg_future': 'risponderà',
        '1pl_future': 'risponderemo', '2pl_future': 'risponderete', '3pl_future': 'risponderanno',
      },
      fr: {
        base: 'répondre',
        '1sg_present': 'réponds', '2sg_present': 'réponds', '3sg_present': 'répond',
        '1pl_present': 'répondons', '2pl_present': 'répondez', '3pl_present': 'répondent',
        '1sg_past': 'répondis', '2sg_past': 'répondis', '3sg_past': 'répondit',
        '1pl_past': 'répondîmes', '2pl_past': 'répondîtes', '3pl_past': 'répondirent',
        '1sg_future': 'répondrai', '2sg_future': 'répondras', '3sg_future': 'répondra',
        '1pl_future': 'répondrons', '2pl_future': 'répondrez', '3pl_future': 'répondront',
      },
      de: {
        // A -rt stem takes an epenthetic -e- before the -st/-t endings: antwortest, antwortete.
        base: 'antworten',
        '1sg_present': 'antworte', '2sg_present': 'antwortest', '3sg_present': 'antwortet',
        '1pl_present': 'antworten', '2pl_present': 'antwortet', '3pl_present': 'antworten',
        '1sg_past': 'antwortete', '2sg_past': 'antwortetest', '3sg_past': 'antwortete',
        '1pl_past': 'antworteten', '2pl_past': 'antwortetet', '3pl_past': 'antworteten',
      },
      es: {
        base: 'responder',
        '1sg_present': 'respondo', '2sg_present': 'respondes', '3sg_present': 'responde',
        '1pl_present': 'respondemos', '2pl_present': 'respondéis', '3pl_present': 'responden',
        '1sg_past': 'respondí', '2sg_past': 'respondiste', '3sg_past': 'respondió',
        '1pl_past': 'respondimos', '2pl_past': 'respondisteis', '3pl_past': 'respondieron',
        '1sg_future': 'responderé', '2sg_future': 'responderás', '3sg_future': 'responderá',
        '1pl_future': 'responderemos', '2pl_future': 'responderéis', '3pl_future': 'responderán',
      },
      ja: {
        base: '答える',
        reading: 'こたえる',
        masu_present: '答えます',
        masu_present_reading: 'こたえます',
      },
      pt: {
        base: 'responder',
        '1sg_present': 'respondo', '2sg_present': 'responde', '3sg_present': 'responde',
        '1pl_present': 'respondemos', '2pl_present': 'respondem', '3pl_present': 'respondem',
        '1sg_past': 'respondi', '2sg_past': 'respondeu', '3sg_past': 'respondeu',
        '1pl_past': 'respondemos', '2pl_past': 'responderam', '3pl_past': 'responderam',
        '1sg_future': 'responderei', '2sg_future': 'responderá', '3sg_future': 'responderá',
        '1pl_future': 'responderemos', '2pl_future': 'responderão', '3pl_future': 'responderão',
      },
    },
  },
  {
    // The English lemma is "seek", not "search": a result is a concept one seeks, and English
    // "search" takes the place searched, not the thing sought ("search the house for it").
    id: 'SEARCH',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'locative', 'cause'],
    description: 'to look for something',
    emoji: '🔍',
    synonym: 'search for',
    forms: {
      en: {
        base: 'seek',
        '1sg_present': 'seek', '2sg_present': 'seek', '3sg_present': 'seeks',
        '1pl_present': 'seek', '2pl_present': 'seek', '3pl_present': 'seek',
        past: 'sought',
      },
      it: {
        // -care takes an h before the -i- endings: cerchi, cercherò.
        base: 'cercare',
        '1sg_present': 'cerco', '2sg_present': 'cerchi', '3sg_present': 'cerca',
        '1pl_present': 'cerchiamo', '2pl_present': 'cercate', '3pl_present': 'cercano',
        '1sg_past': 'cercai', '2sg_past': 'cercasti', '3sg_past': 'cercò',
        '1pl_past': 'cercammo', '2pl_past': 'cercaste', '3pl_past': 'cercarono',
        '1sg_future': 'cercherò', '2sg_future': 'cercherai', '3sg_future': 'cercherà',
        '1pl_future': 'cercheremo', '2pl_future': 'cercherete', '3pl_future': 'cercheranno',
      },
      fr: {
        base: 'chercher',
        '1sg_present': 'cherche', '2sg_present': 'cherches', '3sg_present': 'cherche',
        '1pl_present': 'cherchons', '2pl_present': 'cherchez', '3pl_present': 'cherchent',
        '1sg_past': 'cherchai', '2sg_past': 'cherchas', '3sg_past': 'chercha',
        '1pl_past': 'cherchâmes', '2pl_past': 'cherchâtes', '3pl_past': 'cherchèrent',
        '1sg_future': 'chercherai', '2sg_future': 'chercheras', '3sg_future': 'cherchera',
        '1pl_future': 'chercherons', '2pl_future': 'chercherez', '3pl_future': 'chercheront',
      },
      de: {
        base: 'suchen',
        '1sg_present': 'suche', '2sg_present': 'suchst', '3sg_present': 'sucht',
        '1pl_present': 'suchen', '2pl_present': 'sucht', '3pl_present': 'suchen',
        '1sg_past': 'suchte', '2sg_past': 'suchtest', '3sg_past': 'suchte',
        '1pl_past': 'suchten', '2pl_past': 'suchtet', '3pl_past': 'suchten',
      },
      es: {
        // -car takes qu before the -é of the preterite: busqué.
        base: 'buscar',
        '1sg_present': 'busco', '2sg_present': 'buscas', '3sg_present': 'busca',
        '1pl_present': 'buscamos', '2pl_present': 'buscáis', '3pl_present': 'buscan',
        '1sg_past': 'busqué', '2sg_past': 'buscaste', '3sg_past': 'buscó',
        '1pl_past': 'buscamos', '2pl_past': 'buscasteis', '3pl_past': 'buscaron',
        '1sg_future': 'buscaré', '2sg_future': 'buscarás', '3sg_future': 'buscará',
        '1pl_future': 'buscaremos', '2pl_future': 'buscaréis', '3pl_future': 'buscarán',
      },
      ja: {
        base: '探す',
        reading: 'さがす',
        masu_present: '探します',
        masu_present_reading: 'さがします',
      },
      pt: {
        base: 'procurar',
        '1sg_present': 'procuro', '2sg_present': 'procura', '3sg_present': 'procura',
        '1pl_present': 'procuramos', '2pl_present': 'procuram', '3pl_present': 'procuram',
        '1sg_past': 'procurei', '2sg_past': 'procurou', '3sg_past': 'procurou',
        '1pl_past': 'procuramos', '2pl_past': 'procuraram', '3pl_past': 'procuraram',
        '1sg_future': 'procurarei', '2sg_future': 'procurará', '3sg_future': 'procurará',
        '1pl_future': 'procuraremos', '2pl_future': 'procurarão', '3pl_future': 'procurarão',
      },
    },
  },
  {
    // What seeking ends in, and what MISSING is not: "that one cannot find" (localization C23).
    // Spanish and Portuguese encontrar; Spanish diphthongises the stressed stem, encuentro.
    id: 'FIND',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'locative', 'cause'],
    description: 'to come upon something, by seeking or by chance',
    emoji: '🔦',
    forms: {
      en: {
        base: 'find',
        '1sg_present': 'find', '2sg_present': 'find', '3sg_present': 'finds',
        '1pl_present': 'find', '2pl_present': 'find', '3pl_present': 'find',
        past: 'found',
      },
      it: {
        base: 'trovare',
        '1sg_present': 'trovo', '2sg_present': 'trovi', '3sg_present': 'trova',
        '1pl_present': 'troviamo', '2pl_present': 'trovate', '3pl_present': 'trovano',
        '1sg_past': 'trovai', '2sg_past': 'trovasti', '3sg_past': 'trovò',
        '1pl_past': 'trovammo', '2pl_past': 'trovaste', '3pl_past': 'trovarono',
        '1sg_future': 'troverò', '2sg_future': 'troverai', '3sg_future': 'troverà',
        '1pl_future': 'troveremo', '2pl_future': 'troverete', '3pl_future': 'troveranno',
      },
      fr: {
        base: 'trouver',
        '1sg_present': 'trouve', '2sg_present': 'trouves', '3sg_present': 'trouve',
        '1pl_present': 'trouvons', '2pl_present': 'trouvez', '3pl_present': 'trouvent',
        '1sg_past': 'trouvai', '2sg_past': 'trouvas', '3sg_past': 'trouva',
        '1pl_past': 'trouvâmes', '2pl_past': 'trouvâtes', '3pl_past': 'trouvèrent',
        '1sg_future': 'trouverai', '2sg_future': 'trouveras', '3sg_future': 'trouvera',
        '1pl_future': 'trouverons', '2pl_future': 'trouverez', '3pl_future': 'trouveront',
      },
      de: {
        base: 'finden',
        '1sg_present': 'finde', '2sg_present': 'findest', '3sg_present': 'findet',
        '1pl_present': 'finden', '2pl_present': 'findet', '3pl_present': 'finden',
        '1sg_past': 'fand', '2sg_past': 'fandest', '3sg_past': 'fand',
        '1pl_past': 'fanden', '2pl_past': 'fandet', '3pl_past': 'fanden',
        '2sg_imperative': 'finde',
      },
      es: {
        base: 'encontrar',
        '1sg_present': 'encuentro', '2sg_present': 'encuentras', '3sg_present': 'encuentra',
        '1pl_present': 'encontramos', '2pl_present': 'encontráis', '3pl_present': 'encuentran',
        '1sg_past': 'encontré', '2sg_past': 'encontraste', '3sg_past': 'encontró',
        '1pl_past': 'encontramos', '2pl_past': 'encontrasteis', '3pl_past': 'encontraron',
        '1sg_future': 'encontraré', '2sg_future': 'encontrarás', '3sg_future': 'encontrará',
        '1pl_future': 'encontraremos', '2pl_future': 'encontraréis', '3pl_future': 'encontrarán',
      },
      ja: {
        base: '見つける',
        reading: 'みつける',
        masu_present: '見つけます',
        masu_present_reading: 'みつけます',
      },
      pt: {
        base: 'encontrar',
        '1sg_present': 'encontro', '2sg_present': 'encontra', '3sg_present': 'encontra',
        '1pl_present': 'encontramos', '2pl_present': 'encontram', '3pl_present': 'encontram',
        '1sg_past': 'encontrei', '2sg_past': 'encontrou', '3sg_past': 'encontrou',
        '1pl_past': 'encontramos', '2pl_past': 'encontraram', '3pl_past': 'encontraram',
        '1sg_future': 'encontrarei', '2sg_future': 'encontrará', '3sg_future': 'encontrará',
        '1pl_future': 'encontraremos', '2pl_future': 'encontrarão', '3pl_future': 'encontrarão',
      },
    },
  },

  {
    // E24's *meet* (rank 294, D2): to come upon, to get together. Meeting for the first time
    // (conoscere, faire la connaissance, kennenlernen, 知り合う) is a later concept. Spanish says
    // *encontrarse con*, stored reflexive with its preposition as casarse con is (MARRY), since
    // encontrar alone is FIND's; Japanese 会う takes the person with に (`object_particle`). German
    // treffen raises e to i in the du / er present and the du command (triffst, trifft, triff).
    // Literal by design: a meeting is two people coming to the same place, and the corpus cannot say
    // "each other" or "the same place as" (localization B86 reading 3).
    id: 'MEET',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to come together with someone',
    emoji: '🤝',
    forms: {
      en: {
        base: 'meet',
        '1sg_present': 'meet', '2sg_present': 'meet', '3sg_present': 'meets',
        '1pl_present': 'meet', '2pl_present': 'meet', '3pl_present': 'meet',
        past: 'met',
      },
      it: {
        base: 'incontrare',
        '1sg_present': 'incontro', '2sg_present': 'incontri', '3sg_present': 'incontra',
        '1pl_present': 'incontriamo', '2pl_present': 'incontrate', '3pl_present': 'incontrano',
        '1sg_past': 'incontrai', '2sg_past': 'incontrasti', '3sg_past': 'incontrò',
        '1pl_past': 'incontrammo', '2pl_past': 'incontraste', '3pl_past': 'incontrarono',
        '1sg_future': 'incontrerò', '2sg_future': 'incontrerai', '3sg_future': 'incontrerà',
        '1pl_future': 'incontreremo', '2pl_future': 'incontrerete', '3pl_future': 'incontreranno',
      },
      fr: {
        base: 'rencontrer',
        '1sg_present': 'rencontre', '2sg_present': 'rencontres', '3sg_present': 'rencontre',
        '1pl_present': 'rencontrons', '2pl_present': 'rencontrez', '3pl_present': 'rencontrent',
        '1sg_past': 'rencontrai', '2sg_past': 'rencontras', '3sg_past': 'rencontra',
        '1pl_past': 'rencontrâmes', '2pl_past': 'rencontrâtes', '3pl_past': 'rencontrèrent',
        '1sg_future': 'rencontrerai', '2sg_future': 'rencontreras', '3sg_future': 'rencontrera',
        '1pl_future': 'rencontrerons', '2pl_future': 'rencontrerez', '3pl_future': 'rencontreront',
      },
      de: {
        base: 'treffen',
        '1sg_present': 'treffe', '2sg_present': 'triffst', '3sg_present': 'trifft',
        '1pl_present': 'treffen', '2pl_present': 'trefft', '3pl_present': 'treffen',
        '1sg_past': 'traf', '2sg_past': 'trafst', '3sg_past': 'traf',
        '1pl_past': 'trafen', '2pl_past': 'traft', '3pl_past': 'trafen',
        '2sg_imperative': 'triff', // strong e→i: the du command keeps the vowel change
      },
      es: {
        base: 'encontrarse', object_prep: 'con',
        '1sg_present': 'me encuentro', '2sg_present': 'te encuentras', '3sg_present': 'se encuentra',
        '1pl_present': 'nos encontramos', '2pl_present': 'os encontráis', '3pl_present': 'se encuentran',
        '1sg_past': 'me encontré', '2sg_past': 'te encontraste', '3sg_past': 'se encontró',
        '1pl_past': 'nos encontramos', '2pl_past': 'os encontrasteis', '3pl_past': 'se encontraron',
        '1sg_future': 'me encontraré', '2sg_future': 'te encontrarás', '3sg_future': 'se encontrará',
        '1pl_future': 'nos encontraremos', '2pl_future': 'os encontraréis', '3pl_future': 'se encontrarán',
      },
      ja: {
        base: '会う',
        reading: 'あう',
        masu_present: '会います',
        masu_present_reading: 'あいます',
        object_particle: 'に',
      },
      pt: {
        base: 'encontrar',
        '1sg_present': 'encontro', '2sg_present': 'encontra', '3sg_present': 'encontra',
        '1pl_present': 'encontramos', '2pl_present': 'encontram', '3pl_present': 'encontram',
        '1sg_past': 'encontrei', '2sg_past': 'encontrou', '3sg_past': 'encontrou',
        '1pl_past': 'encontramos', '2pl_past': 'encontraram', '3pl_past': 'encontraram',
        '1sg_future': 'encontrarei', '2sg_future': 'encontrará', '3sg_future': 'encontrará',
        '1pl_future': 'encontraremos', '2pl_future': 'encontrarão', '3pl_future': 'encontrarão',
      },
    },
  },
  {
    id: 'ARRANGE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'locative', 'cause'],
    description: 'to put things in an order',
    emoji: '🗂️',
    forms: {
      en: {
        base: 'arrange',
        '1sg_present': 'arrange', '2sg_present': 'arrange', '3sg_present': 'arranges',
        '1pl_present': 'arrange', '2pl_present': 'arrange', '3pl_present': 'arrange',
        past: 'arranged',
      },
      it: {
        // disporre contracts its future (disporrò) the way porre does.
        base: 'disporre',
        '1sg_present': 'dispongo', '2sg_present': 'disponi', '3sg_present': 'dispone',
        '1pl_present': 'disponiamo', '2pl_present': 'disponete', '3pl_present': 'dispongono',
        '1sg_past': 'disposi', '2sg_past': 'disponesti', '3sg_past': 'dispose',
        '1pl_past': 'disponemmo', '2pl_past': 'disponeste', '3pl_past': 'disposero',
        '1sg_future': 'disporrò', '2sg_future': 'disporrai', '3sg_future': 'disporrà',
        '1pl_future': 'disporremo', '2pl_future': 'disporrete', '3pl_future': 'disporranno',
      },
      fr: {
        base: 'disposer',
        '1sg_present': 'dispose', '2sg_present': 'disposes', '3sg_present': 'dispose',
        '1pl_present': 'disposons', '2pl_present': 'disposez', '3pl_present': 'disposent',
        '1sg_past': 'disposai', '2sg_past': 'disposas', '3sg_past': 'disposa',
        '1pl_past': 'disposâmes', '2pl_past': 'disposâtes', '3pl_past': 'disposèrent',
        '1sg_future': 'disposerai', '2sg_future': 'disposeras', '3sg_future': 'disposera',
        '1pl_future': 'disposerons', '2pl_future': 'disposerez', '3pl_future': 'disposeront',
      },
      de: {
        // anordnen is separable; the finite forms are the bare stem, the particle placed by the engine.
        base: 'anordnen', particle: 'an',
        '1sg_present': 'ordne', '2sg_present': 'ordnest', '3sg_present': 'ordnet',
        '1pl_present': 'ordnen', '2pl_present': 'ordnet', '3pl_present': 'ordnen',
        '1sg_past': 'ordnete', '2sg_past': 'ordnetest', '3sg_past': 'ordnete',
        '1pl_past': 'ordneten', '2pl_past': 'ordnetet', '3pl_past': 'ordneten',
        '2sg_imperative': 'ordne',
      },
      es: {
        // disponer is poner's compound: the strong preterite dispuse and the future dispondré.
        base: 'disponer',
        '1sg_present': 'dispongo', '2sg_present': 'dispones', '3sg_present': 'dispone',
        '1pl_present': 'disponemos', '2pl_present': 'disponéis', '3pl_present': 'disponen',
        '1sg_past': 'dispuse', '2sg_past': 'dispusiste', '3sg_past': 'dispuso',
        '1pl_past': 'dispusimos', '2pl_past': 'dispusisteis', '3pl_past': 'dispusieron',
        '1sg_future': 'dispondré', '2sg_future': 'dispondrás', '3sg_future': 'dispondrá',
        '1pl_future': 'dispondremos', '2pl_future': 'dispondréis', '3pl_future': 'dispondrán',
      },
      ja: {
        base: '並べる',
        reading: 'ならべる',
        masu_present: '並べます',
        masu_present_reading: 'ならべます',
      },
      pt: {
        // dispor is pôr's compound: the strong preterite dispus and the nasal dispõe.
        base: 'dispor',
        '1sg_present': 'disponho', '2sg_present': 'dispõe', '3sg_present': 'dispõe',
        '1pl_present': 'dispomos', '2pl_present': 'dispõem', '3pl_present': 'dispõem',
        '1sg_past': 'dispus', '2sg_past': 'dispôs', '3sg_past': 'dispôs',
        '1pl_past': 'dispusemos', '2pl_past': 'dispuseram', '3pl_past': 'dispuseram',
        '1sg_future': 'disporei', '2sg_future': 'disporá', '3sg_future': 'disporá',
        '1pl_future': 'disporemos', '2pl_future': 'disporão', '3pl_future': 'disporão',
      },
    },
  },
  {
    id: 'CONNECT',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'terminus', 'cause'],
    description: 'to join two things so each reaches the other',
    emoji: '🔗',
    forms: {
      en: {
        base: 'connect',
        '1sg_present': 'connect', '2sg_present': 'connect', '3sg_present': 'connects',
        '1pl_present': 'connect', '2pl_present': 'connect', '3pl_present': 'connect',
        past: 'connected',
      },
      it: {
        // connettere's strong preterite is connessi, on the same stem as the participle connesso.
        base: 'connettere', terminus_tonic: '1',
        '1sg_present': 'connetto', '2sg_present': 'connetti', '3sg_present': 'connette',
        '1pl_present': 'connettiamo', '2pl_present': 'connettete', '3pl_present': 'connettono',
        '1sg_past': 'connessi', '2sg_past': 'connettesti', '3sg_past': 'connesse',
        '1pl_past': 'connettemmo', '2pl_past': 'connetteste', '3pl_past': 'connessero',
        '1sg_future': 'connetterò', '2sg_future': 'connetterai', '3sg_future': 'connetterà',
        '1pl_future': 'connetteremo', '2pl_future': 'connetterete', '3pl_future': 'connetteranno',
      },
      fr: {
        base: 'connecter', terminus_tonic: '1',
        '1sg_present': 'connecte', '2sg_present': 'connectes', '3sg_present': 'connecte',
        '1pl_present': 'connectons', '2pl_present': 'connectez', '3pl_present': 'connectent',
        '1sg_past': 'connectai', '2sg_past': 'connectas', '3sg_past': 'connecta',
        '1pl_past': 'connectâmes', '2pl_past': 'connectâtes', '3pl_past': 'connectèrent',
        '1sg_future': 'connecterai', '2sg_future': 'connecteras', '3sg_future': 'connectera',
        '1pl_future': 'connecterons', '2pl_future': 'connecterez', '3pl_future': 'connecteront',
      },
      de: {
        base: 'verbinden', terminus_prep: 'mit',
        '1sg_present': 'verbinde', '2sg_present': 'verbindest', '3sg_present': 'verbindet',
        '1pl_present': 'verbinden', '2pl_present': 'verbindet', '3pl_present': 'verbinden',
        '1sg_past': 'verband', '2sg_past': 'verbandest', '3sg_past': 'verband',
        '1pl_past': 'verbanden', '2pl_past': 'verbandet', '3pl_past': 'verbanden',
      },
      es: {
        base: 'conectar', terminus_tonic: '1',
        '1sg_present': 'conecto', '2sg_present': 'conectas', '3sg_present': 'conecta',
        '1pl_present': 'conectamos', '2pl_present': 'conectáis', '3pl_present': 'conectan',
        '1sg_past': 'conecté', '2sg_past': 'conectaste', '3sg_past': 'conectó',
        '1pl_past': 'conectamos', '2pl_past': 'conectasteis', '3pl_past': 'conectaron',
        '1sg_future': 'conectaré', '2sg_future': 'conectarás', '3sg_future': 'conectará',
        '1pl_future': 'conectaremos', '2pl_future': 'conectaréis', '3pl_future': 'conectarán',
      },
      ja: {
        base: '接続する',
        reading: 'せつぞくする',
        masu_present: '接続します',
        masu_present_reading: 'せつぞくします',
      },
      pt: {
        base: 'conectar',
        '1sg_present': 'conecto', '2sg_present': 'conecta', '3sg_present': 'conecta',
        '1pl_present': 'conectamos', '2pl_present': 'conectam', '3pl_present': 'conectam',
        '1sg_past': 'conectei', '2sg_past': 'conectou', '3sg_past': 'conectou',
        '1pl_past': 'conectamos', '2pl_past': 'conectaram', '3pl_past': 'conectaram',
        '1sg_future': 'conectarei', '2sg_future': 'conectará', '3sg_future': 'conectará',
        '1pl_future': 'conectaremos', '2pl_future': 'conectarão', '3pl_future': 'conectarão',
      },
    },
  },

  // P09's *let* — to allow someone to act (localization C36). It governs an object-controlled
  // infinitive, the shape C08 built for CAUSE_VERB, and differs from it in two lexical ways: English
  // and German take the **bare** infinitive ("lets the dog run", "lässt den Hund laufen" — no "to",
  // no "zu", no comma), which `infinitive_bare` names, and Japanese has no governing verb at all —
  // what it says is the causative form of the governed verb, 犬を走らせる, which `causative_suffix`
  // asks for. The four Romance languages need nothing: their governor links its infinitive with
  // nothing (`infinitive_link` left off), which is the bare infinitive there too.
  {
    id: 'LET',
    role: 'verb',
    // It governs what it lets its object do — ALLOW is "to let a person act" (P13).
    clauseObject: 'infinitive',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to allow someone to act',
    definition: causativeGloss({ object: 'PERSON', definiteness: 'indefinite' },
      { verb: 'BE', predicate: 'ALLOWED', infinitive: 'ACT' }),
    emoji: '🪟',
    forms: {
      en: {
        base: 'let', infinitive_bare: '1',
        '1sg_present': 'let', '2sg_present': 'let', '3sg_present': 'lets',
        '1pl_present': 'let', '2pl_present': 'let', '3pl_present': 'let',
        past: 'let',
      },
      it: {
        base: 'lasciare',
        '1sg_present': 'lascio', '2sg_present': 'lasci', '3sg_present': 'lascia',
        '1pl_present': 'lasciamo', '2pl_present': 'lasciate', '3pl_present': 'lasciano',
        '1sg_past': 'lasciai', '2sg_past': 'lasciasti', '3sg_past': 'lasciò',
        '1pl_past': 'lasciammo', '2pl_past': 'lasciaste', '3pl_past': 'lasciarono',
        '1sg_future': 'lascerò', '2sg_future': 'lascerai', '3sg_future': 'lascerà',
        '1pl_future': 'lasceremo', '2pl_future': 'lascerete', '3pl_future': 'lasceranno',
      },
      fr: {
        base: 'laisser',
        '1sg_present': 'laisse', '2sg_present': 'laisses', '3sg_present': 'laisse',
        '1pl_present': 'laissons', '2pl_present': 'laissez', '3pl_present': 'laissent',
        '1sg_past': 'laissai', '2sg_past': 'laissas', '3sg_past': 'laissa',
        '1pl_past': 'laissâmes', '2pl_past': 'laissâtes', '3pl_past': 'laissèrent',
        '1sg_future': 'laisserai', '2sg_future': 'laisseras', '3sg_future': 'laissera',
        '1pl_future': 'laisserons', '2pl_future': 'laisserez', '3pl_future': 'laisseront',
      },
      de: {
        // Strong, with an a→ä present singular (lässt) and a strong preterite (ließ).
        base: 'lassen', infinitive_bare: '1',
        '1sg_present': 'lasse', '2sg_present': 'lässt', '3sg_present': 'lässt',
        '1pl_present': 'lassen', '2pl_present': 'lasst', '3pl_present': 'lassen',
        '1sg_past': 'ließ', '2sg_past': 'ließt', '3sg_past': 'ließ',
        '1pl_past': 'ließen', '2pl_past': 'ließt', '3pl_past': 'ließen',
      },
      es: {
        base: 'dejar',
        '1sg_present': 'dejo', '2sg_present': 'dejas', '3sg_present': 'deja',
        '1pl_present': 'dejamos', '2pl_present': 'dejáis', '3pl_present': 'dejan',
        '1sg_past': 'dejé', '2sg_past': 'dejaste', '3sg_past': 'dejó',
        '1pl_past': 'dejamos', '2pl_past': 'dejasteis', '3pl_past': 'dejaron',
        '1sg_future': 'dejaré', '2sg_future': 'dejarás', '3sg_future': 'dejará',
        '1pl_future': 'dejaremos', '2pl_future': 'dejaréis', '3pl_future': 'dejarán',
      },
      ja: {
        // 許す is what the dictionary gives for "permit", and it is what a picker shows; in a clause
        // the causative suffix stands in its place (see `causative_suffix`, `jaCausativeVerb`).
        base: '許す',
        reading: 'ゆるす',
        masu_present: '許します',
        masu_present_reading: 'ゆるします',
        causative_suffix: '1',
      },
      pt: {
        base: 'deixar',
        '1sg_present': 'deixo', '2sg_present': 'deixa', '3sg_present': 'deixa',
        '1pl_present': 'deixamos', '2pl_present': 'deixam', '3pl_present': 'deixam',
        '1sg_past': 'deixei', '2sg_past': 'deixou', '3sg_past': 'deixou',
        '1pl_past': 'deixamos', '2pl_past': 'deixaram', '3pl_past': 'deixaram',
        '1sg_future': 'deixarei', '2sg_future': 'deixará', '3sg_future': 'deixará',
        '1pl_future': 'deixaremos', '2pl_future': 'deixarão', '3pl_future': 'deixarão',
      },
    },
  },

  // P09's *allow* (rank 346; localization B85, P09-E43): to permit. With a thing it takes a plain
  // object ("allows the food"); with a person and what they may do it is an object-controlled
  // infinitive whose controller is a **dative** — it "permette **al** gatto **di** correre", fr
  // "permet **au** chat **de** courir", es "permite **al** gato correr", pt "permite **ao** gato
  // correr", de "erlaubt **dem** Kater zu laufen", ja 猫**に**走ることを許す. The Romance and Japanese
  // lexemes name the dative as `object_case: 'dat'`, which they read under object control only
  // (`controllerCase`), and German as `controller_case: 'dat'`, since German declines `object_case`
  // everywhere and *erlauben* takes a thing in the accusative. The link is `infinitive_link`. Not
  // LET (*lasciare, laisser, lassen, dejar*), C36's bare-infinitive causative.
  {
    id: 'ALLOW',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to give permission for',
    synonym: 'permit',
    // "to let a person act" (B85): LET's causative with its own infinitive. LET's gloss is "to cause a
    // person to be allowed to act", so the two are close and neither restates the other's word.
    definition: infinitiveGloss('LET', {
      object: 'PERSON',
      definiteness: 'indefinite',
      infinitive: { verbPhrase: { verb: 'ACT' }, control: 'object' },
    }),
    emoji: '✅',
    forms: {
      en: {
        base: 'allow',
        '1sg_present': 'allow', '2sg_present': 'allow', '3sg_present': 'allows',
        '1pl_present': 'allow', '2pl_present': 'allow', '3pl_present': 'allow',
        past: 'allowed',
      },
      it: {
        base: 'permettere', object_case: 'dat', infinitive_link: 'di',
        '1sg_present': 'permetto', '2sg_present': 'permetti', '3sg_present': 'permette',
        '1pl_present': 'permettiamo', '2pl_present': 'permettete', '3pl_present': 'permettono',
        '1sg_past': 'permisi', '2sg_past': 'permettesti', '3sg_past': 'permise',
        '1pl_past': 'permettemmo', '2pl_past': 'permetteste', '3pl_past': 'permisero',
        '1sg_future': 'permetterò', '2sg_future': 'permetterai', '3sg_future': 'permetterà',
        '1pl_future': 'permetteremo', '2pl_future': 'permetterete', '3pl_future': 'permetteranno',
      },
      fr: {
        base: 'permettre', object_case: 'dat', infinitive_link: 'de',
        '1sg_present': 'permets', '2sg_present': 'permets', '3sg_present': 'permet',
        '1pl_present': 'permettons', '2pl_present': 'permettez', '3pl_present': 'permettent',
        '1sg_past': 'permis', '2sg_past': 'permis', '3sg_past': 'permit',
        '1pl_past': 'permîmes', '2pl_past': 'permîtes', '3pl_past': 'permirent',
        '1sg_future': 'permettrai', '2sg_future': 'permettras', '3sg_future': 'permettra',
        '1pl_future': 'permettrons', '2pl_future': 'permettrez', '3pl_future': 'permettront',
      },
      de: {
        // Inseparable: no ge- in the participle (erlaubt).
        base: 'erlauben', controller_case: 'dat',
        '1sg_present': 'erlaube', '2sg_present': 'erlaubst', '3sg_present': 'erlaubt',
        '1pl_present': 'erlauben', '2pl_present': 'erlaubt', '3pl_present': 'erlauben',
        '1sg_past': 'erlaubte', '2sg_past': 'erlaubtest', '3sg_past': 'erlaubte',
        '1pl_past': 'erlaubten', '2pl_past': 'erlaubtet', '3pl_past': 'erlaubten',
      },
      es: {
        base: 'permitir', object_case: 'dat',
        '1sg_present': 'permito', '2sg_present': 'permites', '3sg_present': 'permite',
        '1pl_present': 'permitimos', '2pl_present': 'permitís', '3pl_present': 'permiten',
        '1sg_past': 'permití', '2sg_past': 'permitiste', '3sg_past': 'permitió',
        '1pl_past': 'permitimos', '2pl_past': 'permitisteis', '3pl_past': 'permitieron',
        '1sg_future': 'permitiré', '2sg_future': 'permitirás', '3sg_future': 'permitirá',
        '1pl_future': 'permitiremos', '2pl_future': 'permitiréis', '3pl_future': 'permitirán',
      },
      ja: {
        // LET's picker word too; LET says the causative suffix in a clause, ALLOW the verb itself.
        base: '許す', object_case: 'dat',
        reading: 'ゆるす',
        masu_present: '許します',
        masu_present_reading: 'ゆるします',
      },
      pt: {
        base: 'permitir', object_case: 'dat',
        '1sg_present': 'permito', '2sg_present': 'permite', '3sg_present': 'permite',
        '1pl_present': 'permitimos', '2pl_present': 'permitem', '3pl_present': 'permitem',
        '1sg_past': 'permiti', '2sg_past': 'permitiu', '3sg_past': 'permitiu',
        '1pl_past': 'permitimos', '2pl_past': 'permitiram', '3pl_past': 'permitiram',
        '1sg_future': 'permitirei', '2sg_future': 'permitirá', '3sg_future': 'permitirá',
        '1pl_future': 'permitiremos', '2pl_future': 'permitirão', '3pl_future': 'permitirão',
      },
    },
  },

  // P09's *like* (localization C34). The plan is always "the cat likes the dog"; four languages say
  // it that way and three do not. Italian *piacere* and Spanish *gustar* make the thing liked the
  // subject and the one who likes a dative ("al gatto piacciono i cani"), which their lexemes ask
  // for with `experiencer`; Portuguese *gostar* takes a prepositional object (`object_prep: 'de'`,
  // as CLICK's); and Japanese has no verb here at all — 好き is a な-adjective whose が-marked subject
  // is the thing liked (猫は犬が好きです), which `adjectival` + `object_particle` say.
  // Italian piacere is irregular (piaccio / piacciono, piacqui) and selects essere.
  {
    id: 'LIKE',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to find pleasant',
    // "To find pleasant" needs a word the corpus lacks, so the gloss says what liking is: the joy
    // the thing causes. FEEL + JOY alone is PLAY_GAME's differentia (B62); the cause is what tells
    // them apart.
    definition: infinitiveGloss('FEEL', {
      object: 'JOY',
      complements: { cause: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' } } },
    }),
    stative: true,
    emoji: '👍',
    forms: {
      en: {
        base: 'like',
        '1sg_present': 'like', '2sg_present': 'like', '3sg_present': 'likes',
        '1pl_present': 'like', '2pl_present': 'like', '3pl_present': 'like',
        past: 'liked',
      },
      it: {
        base: 'piacere', experiencer: '1',
        '1sg_present': 'piaccio', '2sg_present': 'piaci', '3sg_present': 'piace',
        '1pl_present': 'piacciamo', '2pl_present': 'piacete', '3pl_present': 'piacciono',
        '1sg_past': 'piacqui', '2sg_past': 'piacesti', '3sg_past': 'piacque',
        '1pl_past': 'piacemmo', '2pl_past': 'piaceste', '3pl_past': 'piacquero',
        '1sg_future': 'piacerò', '2sg_future': 'piacerai', '3sg_future': 'piacerà',
        '1pl_future': 'piaceremo', '2pl_future': 'piacerete', '3pl_future': 'piaceranno',
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
        base: 'mögen',
        '1sg_present': 'mag', '2sg_present': 'magst', '3sg_present': 'mag',
        '1pl_present': 'mögen', '2pl_present': 'mögt', '3pl_present': 'mögen',
        '1sg_past': 'mochte', '2sg_past': 'mochtest', '3sg_past': 'mochte',
        '1pl_past': 'mochten', '2pl_past': 'mochtet', '3pl_past': 'mochten',
      },
      es: {
        base: 'gustar', experiencer: '1',
        '1sg_present': 'gusto', '2sg_present': 'gustas', '3sg_present': 'gusta',
        '1pl_present': 'gustamos', '2pl_present': 'gustáis', '3pl_present': 'gustan',
        '1sg_past': 'gusté', '2sg_past': 'gustaste', '3sg_past': 'gustó',
        '1pl_past': 'gustamos', '2pl_past': 'gustasteis', '3pl_past': 'gustaron',
        '1sg_future': 'gustaré', '2sg_future': 'gustarás', '3sg_future': 'gustará',
        '1pl_future': 'gustaremos', '2pl_future': 'gustaréis', '3pl_future': 'gustarán',
      },
      ja: {
        base: '好きな', reading: 'すきな', adjectival: '1', object_particle: 'が',
      },
      pt: {
        base: 'gostar', object_prep: 'de',
        '1sg_present': 'gosto', '2sg_present': 'gosta', '3sg_present': 'gosta',
        '1pl_present': 'gostamos', '2pl_present': 'gostam', '3pl_present': 'gostam',
        '1sg_past': 'gostei', '2sg_past': 'gostou', '3sg_past': 'gostou',
        '1pl_past': 'gostamos', '2pl_past': 'gostaram', '3pl_past': 'gostaram',
        '1sg_future': 'gostarei', '2sg_future': 'gostará', '3sg_future': 'gostará',
        '1pl_future': 'gostaremos', '2pl_future': 'gostarão', '3pl_future': 'gostarão',
      },
    },
  },

  // P09's *help* (localization C35). The id is HELP_VERB because HELP is taken, by the noun B41
  // seeded for the help overlay. Six languages take an ordinary accusative object; German *helfen*
  // governs the **dative**, which nothing in the meaning predicts — one helps a dog and sees a dog
  // alike — so its lexeme names it (`object_case`, read by the German engine wherever the object is
  // declined, and by its impersonal passive "ihm wird geholfen"). Strong e→i in the present
  // singular (hilfst, hilft, and the du command hilf) and a strong preterite (half).
  // With an infinitive the Romance four link it with *a* / *à* (`infinitive_link`, P09-E43):
  // "aiuta il gatto a correre", "aide le chat à courir", "ayuda al gato a correr", "ajuda o gato a
  // correr"; Spanish *ayudar* takes the one helped with the personal *a* whoever it is (`object_a`).
  {
    id: 'HELP_VERB',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'instrumental', 'cause'],
    description: 'to make what another does easier',
    synonym: 'assist',
    emoji: '🤝',
    forms: {
      en: {
        base: 'help',
        '1sg_present': 'help', '2sg_present': 'help', '3sg_present': 'helps',
        '1pl_present': 'help', '2pl_present': 'help', '3pl_present': 'help',
        past: 'helped',
      },
      it: {
        base: 'aiutare', infinitive_link: 'a',
        '1sg_present': 'aiuto', '2sg_present': 'aiuti', '3sg_present': 'aiuta',
        '1pl_present': 'aiutiamo', '2pl_present': 'aiutate', '3pl_present': 'aiutano',
        '1sg_past': 'aiutai', '2sg_past': 'aiutasti', '3sg_past': 'aiutò',
        '1pl_past': 'aiutammo', '2pl_past': 'aiutaste', '3pl_past': 'aiutarono',
        '1sg_future': 'aiuterò', '2sg_future': 'aiuterai', '3sg_future': 'aiuterà',
        '1pl_future': 'aiuteremo', '2pl_future': 'aiuterete', '3pl_future': 'aiuteranno',
      },
      fr: {
        base: 'aider', infinitive_link: 'à',
        '1sg_present': 'aide', '2sg_present': 'aides', '3sg_present': 'aide',
        '1pl_present': 'aidons', '2pl_present': 'aidez', '3pl_present': 'aident',
        '1sg_past': 'aidai', '2sg_past': 'aidas', '3sg_past': 'aida',
        '1pl_past': 'aidâmes', '2pl_past': 'aidâtes', '3pl_past': 'aidèrent',
        '1sg_future': 'aiderai', '2sg_future': 'aideras', '3sg_future': 'aidera',
        '1pl_future': 'aiderons', '2pl_future': 'aiderez', '3pl_future': 'aideront',
      },
      de: {
        base: 'helfen', object_case: 'dat',
        '1sg_present': 'helfe', '2sg_present': 'hilfst', '3sg_present': 'hilft',
        '1pl_present': 'helfen', '2pl_present': 'helft', '3pl_present': 'helfen',
        '1sg_past': 'half', '2sg_past': 'halfst', '3sg_past': 'half',
        '1pl_past': 'halfen', '2pl_past': 'halft', '3pl_past': 'halfen',
        '2sg_imperative': 'hilf', // strong e→i: the du command keeps the vowel change
      },
      es: {
        base: 'ayudar', infinitive_link: 'a', object_a: '1',
        '1sg_present': 'ayudo', '2sg_present': 'ayudas', '3sg_present': 'ayuda',
        '1pl_present': 'ayudamos', '2pl_present': 'ayudáis', '3pl_present': 'ayudan',
        '1sg_past': 'ayudé', '2sg_past': 'ayudaste', '3sg_past': 'ayudó',
        '1pl_past': 'ayudamos', '2pl_past': 'ayudasteis', '3pl_past': 'ayudaron',
        '1sg_future': 'ayudaré', '2sg_future': 'ayudarás', '3sg_future': 'ayudará',
        '1pl_future': 'ayudaremos', '2pl_future': 'ayudaréis', '3pl_future': 'ayudarán',
      },
      ja: {
        base: '手伝う',
        reading: 'てつだう',
        masu_present: '手伝います',
        masu_present_reading: 'てつだいます',
      },
      pt: {
        base: 'ajudar', infinitive_link: 'a',
        '1sg_present': 'ajudo', '2sg_present': 'ajuda', '3sg_present': 'ajuda',
        '1pl_present': 'ajudamos', '2pl_present': 'ajudam', '3pl_present': 'ajudam',
        '1sg_past': 'ajudei', '2sg_past': 'ajudou', '3sg_past': 'ajudou',
        '1pl_past': 'ajudamos', '2pl_past': 'ajudaram', '3pl_past': 'ajudaram',
        '1sg_future': 'ajudarei', '2sg_future': 'ajudará', '3sg_future': 'ajudará',
        '1pl_future': 'ajudaremos', '2pl_future': 'ajudarão', '3pl_future': 'ajudarão',
      },
    },
  },

  // P09-E24's *thank* (rank 300; localization B85). The one thanked is the object, which German
  // danken governs in the dative (`object_case`, HELP_VERB's precedent: "dankt dem Kater") and
  // Japanese marks に (猫に感謝します, `object_particle`). Portuguese agradecer takes it with a
  // (`object_prep`, "agradece ao gato"); Spanish agradecer's is an indirect object too, which the
  // personal a already says of a person ("agradece al gato"). Italian ringraziare writes one i
  // (ringrazi), Spanish and Portuguese write zc and ç before o and a (agradezco, agradeço).
  {
    id: 'THANK',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to express gratitude to someone',
    definition: infinitiveGloss('SAY', {
      object: 'WORD',
      number: 'plural',
      adjectives: ['GOOD'],
      complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } },
    }),
    emoji: '🙏',
    forms: {
      en: {
        base: 'thank',
        '1sg_present': 'thank', '2sg_present': 'thank', '3sg_present': 'thanks',
        '1pl_present': 'thank', '2pl_present': 'thank', '3pl_present': 'thank',
        past: 'thanked',
      },
      it: {
        base: 'ringraziare',
        '1sg_present': 'ringrazio', '2sg_present': 'ringrazi', '3sg_present': 'ringrazia',
        '1pl_present': 'ringraziamo', '2pl_present': 'ringraziate', '3pl_present': 'ringraziano',
        '1sg_past': 'ringraziai', '2sg_past': 'ringraziasti', '3sg_past': 'ringraziò',
        '1pl_past': 'ringraziammo', '2pl_past': 'ringraziaste', '3pl_past': 'ringraziarono',
        '1sg_future': 'ringrazierò', '2sg_future': 'ringrazierai', '3sg_future': 'ringrazierà',
        '1pl_future': 'ringrazieremo', '2pl_future': 'ringrazierete', '3pl_future': 'ringrazieranno',
      },
      fr: {
        base: 'remercier',
        '1sg_present': 'remercie', '2sg_present': 'remercies', '3sg_present': 'remercie',
        '1pl_present': 'remercions', '2pl_present': 'remerciez', '3pl_present': 'remercient',
        '1sg_past': 'remerciai', '2sg_past': 'remercias', '3sg_past': 'remercia',
        '1pl_past': 'remerciâmes', '2pl_past': 'remerciâtes', '3pl_past': 'remercièrent',
        '1sg_future': 'remercierai', '2sg_future': 'remercieras', '3sg_future': 'remerciera',
        '1pl_future': 'remercierons', '2pl_future': 'remercierez', '3pl_future': 'remercieront',
      },
      de: {
        base: 'danken', object_case: 'dat',
        '1sg_present': 'danke', '2sg_present': 'dankst', '3sg_present': 'dankt',
        '1pl_present': 'danken', '2pl_present': 'dankt', '3pl_present': 'danken',
        '1sg_past': 'dankte', '2sg_past': 'danktest', '3sg_past': 'dankte',
        '1pl_past': 'dankten', '2pl_past': 'danktet', '3pl_past': 'dankten',
      },
      es: {
        base: 'agradecer',
        '1sg_present': 'agradezco', '2sg_present': 'agradeces', '3sg_present': 'agradece',
        '1pl_present': 'agradecemos', '2pl_present': 'agradecéis', '3pl_present': 'agradecen',
        '1sg_past': 'agradecí', '2sg_past': 'agradeciste', '3sg_past': 'agradeció',
        '1pl_past': 'agradecimos', '2pl_past': 'agradecisteis', '3pl_past': 'agradecieron',
        '1sg_future': 'agradeceré', '2sg_future': 'agradecerás', '3sg_future': 'agradecerá',
        '1pl_future': 'agradeceremos', '2pl_future': 'agradeceréis', '3pl_future': 'agradecerán',
      },
      ja: {
        base: '感謝する', object_particle: 'に',
        reading: 'かんしゃする',
        masu_present: '感謝します',
        masu_present_reading: 'かんしゃします',
      },
      pt: {
        base: 'agradecer', object_prep: 'a',
        '1sg_present': 'agradeço', '2sg_present': 'agradece', '3sg_present': 'agradece',
        '1pl_present': 'agradecemos', '2pl_present': 'agradecem', '3pl_present': 'agradecem',
        '1sg_past': 'agradeci', '2sg_past': 'agradeceu', '3sg_past': 'agradeceu',
        '1pl_past': 'agradecemos', '2pl_past': 'agradeceram', '3pl_past': 'agradeceram',
        '1sg_future': 'agradecerei', '2sg_future': 'agradecerá', '3sg_future': 'agradecerá',
        '1pl_future': 'agradeceremos', '2pl_future': 'agradecerão', '3pl_future': 'agradecerão',
      },
    },
  },

  {
    // The one verb the family needs (P11 §4). Data only in six languages: Spanish *casarse* is
    // stored reflexive and takes its object with *con*, Portuguese *casar* with *com*, and Japanese
    // 結婚する with と (`object_prep` / `object_particle`, as CLICK's) — "mi hijo se casa **con** tu
    // hija", "娘**と**結婚します". Italian, French, German and English take a plain object.
    id: 'MARRY',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to take as a spouse',
    // The spouse is a **predicative**, not an object: as `{ object: 'SPOUSE' }` the same gloss reads
    // de *einen Ehepartner werden* (accusative where the copula wants the nominative), es *volverse a
    // un cónyuge* (the personal *a*) and ja 配偶者**を**なる for になる (localization B70 reading 1).
    definition: infinitiveGloss('BECOME', {
      complements: { predicative: { phrase: { concept: 'SPOUSE', definiteness: 'indefinite' } } },
    }),
    emoji: '💒',
    forms: {
      en: {
        base: 'marry',
        '1sg_present': 'marry', '2sg_present': 'marry', '3sg_present': 'marries',
        '1pl_present': 'marry', '2pl_present': 'marry', '3pl_present': 'marry',
        past: 'married',
      },
      it: {
        base: 'sposare',
        '1sg_present': 'sposo', '2sg_present': 'sposi', '3sg_present': 'sposa',
        '1pl_present': 'sposiamo', '2pl_present': 'sposate', '3pl_present': 'sposano',
        '1sg_past': 'sposai', '2sg_past': 'sposasti', '3sg_past': 'sposò',
        '1pl_past': 'sposammo', '2pl_past': 'sposaste', '3pl_past': 'sposarono',
        '1sg_future': 'sposerò', '2sg_future': 'sposerai', '3sg_future': 'sposerà',
        '1pl_future': 'sposeremo', '2pl_future': 'sposerete', '3pl_future': 'sposeranno',
      },
      fr: {
        base: 'épouser',
        '1sg_present': 'épouse', '2sg_present': 'épouses', '3sg_present': 'épouse',
        '1pl_present': 'épousons', '2pl_present': 'épousez', '3pl_present': 'épousent',
        '1sg_past': 'épousai', '2sg_past': 'épousas', '3sg_past': 'épousa',
        '1pl_past': 'épousâmes', '2pl_past': 'épousâtes', '3pl_past': 'épousèrent',
        '1sg_future': 'épouserai', '2sg_future': 'épouseras', '3sg_future': 'épousera',
        '1pl_future': 'épouserons', '2pl_future': 'épouserez', '3pl_future': 'épouseront',
      },
      de: {
        base: 'heiraten',
        '1sg_present': 'heirate', '2sg_present': 'heiratest', '3sg_present': 'heiratet',
        '1pl_present': 'heiraten', '2pl_present': 'heiratet', '3pl_present': 'heiraten',
        '1sg_past': 'heiratete', '2sg_past': 'heiratetest', '3sg_past': 'heiratete',
        '1pl_past': 'heirateten', '2pl_past': 'heiratetet', '3pl_past': 'heirateten',
      },
      es: {
        base: 'casarse', object_prep: 'con',
        '1sg_present': 'me caso', '2sg_present': 'te casas', '3sg_present': 'se casa',
        '1pl_present': 'nos casamos', '2pl_present': 'os casáis', '3pl_present': 'se casan',
        '1sg_past': 'me casé', '2sg_past': 'te casaste', '3sg_past': 'se casó',
        '1pl_past': 'nos casamos', '2pl_past': 'os casasteis', '3pl_past': 'se casaron',
        '1sg_future': 'me casaré', '2sg_future': 'te casarás', '3sg_future': 'se casará',
        '1pl_future': 'nos casaremos', '2pl_future': 'os casaréis', '3pl_future': 'se casarán',
      },
      ja: {
        base: '結婚する',
        reading: 'けっこんする',
        masu_present: '結婚します',
        masu_present_reading: 'けっこんします',
        object_particle: 'と',
      },
      pt: {
        base: 'casar', object_prep: 'com',
        '1sg_present': 'caso', '2sg_present': 'casa', '3sg_present': 'casa',
        '1pl_present': 'casamos', '2pl_present': 'casam', '3pl_present': 'casam',
        '1sg_past': 'casei', '2sg_past': 'casou', '3sg_past': 'casou',
        '1pl_past': 'casamos', '2pl_past': 'casaram', '3pl_past': 'casaram',
        '1sg_future': 'casarei', '2sg_future': 'casará', '3sg_future': 'casará',
        '1pl_future': 'casaremos', '2pl_future': 'casarão', '3pl_future': 'casarão',
      },
    },
  },
];
