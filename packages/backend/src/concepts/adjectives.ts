import type { ConceptSeed } from './types.js';
import type { PhrasePlan } from '@signi/shared';

// An adjective-definition gloss: a dimension noun carrying a degree adjective, rendered verblessly as
// a prepositional fragment whose adposition the noun's `dimensionRelation` selects — dimGloss('SIZE',
// 'GREAT') → en "of great size", it "di grande dimensione", de "von großer Größe", ja "大きさが大きい";
// dimGloss('TEMPERATURE', 'HIGH') → "at high temperature" (the `measure` relation). See
// NounPhrase.dimensionGloss and the engines' verbless branch.
const dimGloss = (dimension: string, degree: string): PhrasePlan => ({
  subject: { concept: dimension, definiteness: 'bare', adjectives: [degree], dimensionGloss: true },
});

export const adjectives: ConceptSeed[] = [
  // ── ADJECTIVES ───────────────────────────────────────────────────
  {
    id: 'BIG',
    role: 'adjective',
    description: 'large in size',
    definition: dimGloss('SIZE', 'GREAT'),
    emoji: '🔭',
    forms: {
      en: { base: 'big' },
      it: { base: 'grande' },
      fr: { base: 'grand' },
      // groß umlauts in the comparative (größer, via the flag) but its superlative is
      // irregular — größt, with no epenthetic -e- a -ß stem would otherwise take.
      de: { base: 'groß', umlaut: 'true', superlative: 'größt' },
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
    // Motivating case: "at high speed" — a manner adverbial with a measure head. German "hoch"
    // is irregular attributively (hoh- before an ending: "hohe Geschwindigkeit"), so its
    // declension stem is stored separately from the predicative base.
    id: 'HIGH',
    role: 'adjective',
    description: 'great in vertical extent or degree',
    definition: dimGloss('HEIGHT', 'GREAT'),
    emoji: '⛰️',
    forms: {
      en: { base: 'high' },
      it: { base: 'alto' },
      fr: { base: 'haut' },
      de: { base: 'hoch', attributive: 'hoh', comparative: 'höher', superlative: 'höchst' },
      es: { base: 'alto' },
      ja: { base: '高い', reading: 'たかい' },
      pt: { base: 'alto' },
    },
  },
  {
    // A degree word for the adjective-definition glosses (BIG → "of great size", STRONG → "of great
    // strength"). Same surface as BIG in most languages ("grande"/"groß") — a dictionary defines
    // "big" as "of great size", so the reuse is the gloss, not a bug. German umlauts like BIG.
    id: 'GREAT',
    role: 'adjective',
    description: 'large in amount, degree, or extent',
    emoji: '📈',
    forms: {
      en: { base: 'great' },
      it: { base: 'grande' },
      fr: { base: 'grand' },
      de: { base: 'groß', umlaut: 'true', superlative: 'größt' },
      es: { base: 'grande' },
      ja: { base: '大きい', reading: 'おおきい' },
      pt: { base: 'grande' },
    },
  },
  {
    // The low-degree counterpart of HIGH/GREAT, for glosses like BAD → "of low quality". German
    // "niedrig" is the scalar "low" (not "tief", which is depth).
    id: 'LOW',
    role: 'adjective',
    description: 'small in amount, degree, or extent',
    emoji: '📉',
    forms: {
      en: { base: 'low' },
      it: { base: 'basso' },
      fr: { base: 'bas' },
      de: { base: 'niedrig' },
      es: { base: 'bajo' },
      ja: { base: '低い', reading: 'ひくい' },
      pt: { base: 'baixo' },
    },
  },
  {
    // Distance as a property of the thing itself — "the near house" — not a relation to a
    // landmark, which is the locative's business (A02), so this stays an ordinary adjective.
    // German declines "nah" regularly (die nahe Katze) but umlauts under comparison (näher)
    // with an irregular superlative: nächst, not *nähst.
    id: 'NEAR',
    role: 'adjective',
    transient: true, // distance is a location, and Iberian Romance locates with estar (A47)
    description: 'a short distance away',
    emoji: '📍',
    forms: {
      en: { base: 'near' },
      it: { base: 'vicino' },
      fr: { base: 'proche' },
      de: { base: 'nah', umlaut: 'true', superlative: 'nächst' },
      es: { base: 'cercano' },
      ja: { base: '近い', reading: 'ちかい' },
      pt: { base: 'próximo' },
    },
  },
  {
    // The counterpart of NEAR. French/Spanish/Portuguese seed the derived adjectives, not the
    // bare distance adverbs — loin/lejos/longe cannot modify a noun ("un pays lointain", never
    // "un pays loin"). English "far" compares suppletively (farther/farthest), already in
    // EN_IRREGULAR; German takes "fern", since attributive "weit" reads as wide, not distant.
    id: 'FAR',
    role: 'adjective',
    transient: true, // distance is a location, and Iberian Romance locates with estar (A47)
    description: 'a long distance away',
    emoji: '🛰️',
    forms: {
      en: { base: 'far' },
      it: { base: 'lontano' },
      fr: { base: 'lointain' },
      de: { base: 'fern' },
      es: { base: 'lejano' },
      ja: { base: '遠い', reading: 'とおい' },
      pt: { base: 'distante' },
    },
  },
  {
    id: 'GOOD',
    role: 'adjective',
    description: 'of high quality or virtue',
    definition: dimGloss('QUALITY', 'HIGH'),
    emoji: '✨',
    forms: {
      en: { base: 'good' },
      it: { base: 'buono' },
      fr: { base: 'bon' },
      // Suppletive: gut → besser / best, no rule derives it (cf. English good → better).
      de: { base: 'gut', comparative: 'besser', superlative: 'best' },
      es: { base: 'bueno' },
      ja: { base: '良い', reading: 'よい' },
      pt: { base: 'bom' },
    },
  },
  {
    id: 'BAD',
    role: 'adjective',
    description: 'of poor quality or harmful',
    definition: dimGloss('QUALITY', 'LOW'),
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
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
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
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
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
    definition: dimGloss('AGE', 'GREAT'),
    emoji: '🧓',
    forms: {
      en: { base: 'old' },
      it: { base: 'vecchio' },
      fr: { base: 'vieux' },
      de: { base: 'alt', umlaut: 'true' }, // alt → älter / ältest
      es: { base: 'viejo' },
      ja: { base: '古い', reading: 'ふるい' },
      pt: { base: 'velho' },
    },
  },
  {
    id: 'YOUNG',
    role: 'adjective',
    description: 'having lived or existed for a short time',
    definition: dimGloss('AGE', 'LOW'),
    emoji: '🧒',
    forms: {
      en: { base: 'young' },
      it: { base: 'giovane' },
      fr: { base: 'jeune' },
      de: { base: 'jung', umlaut: 'true' }, // jung → jünger / jüngst
      es: { base: 'joven' },
      ja: { base: '若い', reading: 'わかい' },
      pt: { base: 'jovem' },
    },
  },
  {
    // "adult" in the general sense — fully grown — applying to people and animals alike, so
    // Japanese takes the everyday 大人の rather than the human-only, legal 成人の. Noun-adjective (の).
    id: 'ADULT',
    role: 'adjective',
    description: 'fully grown',
    emoji: '🧑',
    forms: {
      en: { base: 'adult' },
      it: { base: 'adulto' },
      fr: { base: 'adulte' },
      de: { base: 'erwachsen' },
      es: { base: 'adulto' },
      ja: { base: '大人の', reading: 'おとなの' },
      pt: { base: 'adulto' },
    },
  },
  {
    id: 'MALE',
    role: 'adjective',
    description: 'of the sex that produces sperm; masculine',
    emoji: '♂️',
    forms: {
      en: { base: 'male' },
      it: { base: 'maschile' },
      fr: { base: 'masculin' },
      de: { base: 'männlich' },
      es: { base: 'masculino' },
      ja: { base: '男性の', reading: 'だんせいの' },
      pt: { base: 'masculino' },
    },
  },
  {
    id: 'FEMALE',
    role: 'adjective',
    description: 'of the sex that bears offspring; feminine',
    emoji: '♀️',
    forms: {
      en: { base: 'female' },
      it: { base: 'femminile' },
      fr: { base: 'féminin' },
      de: { base: 'weiblich' },
      es: { base: 'femenino' },
      ja: { base: '女性の', reading: 'じょせいの' },
      pt: { base: 'feminino' },
    },
  },
  {
    // A past-participle adjective: agrees in Romance (castrato/castrata) and, in Japanese, is
    // verb-derived — the plain past 去勢された attaches directly, like 疲れた (TIRED), no linker.
    id: 'CASTRATED',
    role: 'adjective',
    description: 'having the testicles removed',
    emoji: '✂️',
    forms: {
      en: { base: 'castrated' },
      it: { base: 'castrato' },
      fr: { base: 'castré' },
      de: { base: 'kastriert' },
      es: { base: 'castrado' },
      ja: { base: '去勢された', reading: 'きょせいされた' },
      pt: { base: 'castrado' },
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
    definition: dimGloss('STRENGTH', 'GREAT'),
    emoji: '💪',
    forms: {
      en: { base: 'strong' },
      it: { base: 'forte' },
      fr: { base: 'fort' },
      de: { base: 'stark', umlaut: 'true' }, // stark → stärker / stärkst
      es: { base: 'fuerte' },
      ja: { base: '強い', reading: 'つよい' },
      pt: { base: 'forte' },
    },
  },
  {
    id: 'WEAK',
    role: 'adjective',
    description: 'lacking physical power or force',
    definition: dimGloss('STRENGTH', 'LOW'),
    emoji: '🥀',
    forms: {
      en: { base: 'weak' },
      it: { base: 'debole' },
      fr: { base: 'faible' },
      de: { base: 'schwach', umlaut: 'true' }, // schwach → schwächer / schwächst
      es: { base: 'débil' },
      ja: { base: '弱い', reading: 'よわい' },
      pt: { base: 'fraco' },
    },
  },
  {
    id: 'TIRED',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
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
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
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
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'at a low temperature',
    definition: dimGloss('TEMPERATURE', 'LOW'),
    emoji: '🥶',
    forms: {
      en: { base: 'cold' },
      it: { base: 'freddo' },
      fr: { base: 'froid' },
      de: { base: 'kalt', umlaut: 'true' }, // kalt → kälter / kältest
      es: { base: 'frío' },
      ja: { base: '冷たい', reading: 'つめたい' },
      pt: { base: 'frio' },
    },
  },
  {
    // The *figurative* sense — a warm feeling, a warm welcome — not the temperature one. The two
    // senses split in four languages (it tiepido / caloroso, fr tiède / chaleureux, pt morno /
    // caloroso), so only the one AFFECTION's gloss needs is seeded; B07's TEMPERATURE scale has
    // HOT and COLD and no WARM (B30). German warm, es cálido and ja 温かい cover both senses.
    // Inherent, not transient: a kindly feeling is what it is, so es/pt predicate it with ser —
    // unlike HOT, which a thing can stop being. French chaleureux declines by the -eux → -euse rule.
    id: 'WARM',
    role: 'adjective',
    description: 'kindly and affectionate in feeling',
    emoji: '🤗',
    synonym: 'kindly',
    forms: {
      en: { base: 'warm' },
      it: { base: 'caloroso' },
      fr: { base: 'chaleureux' },
      de: { base: 'warm' },
      es: { base: 'cálido' },
      ja: { base: '温かい', reading: 'あたたかい' },
      pt: { base: 'caloroso' },
    },
  },
  {
    id: 'HOT',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'at a high temperature',
    definition: dimGloss('TEMPERATURE', 'HIGH'),
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
    definition: dimGloss('SPEED', 'HIGH'),
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
      ja: { base: '茶色の', reading: 'ちゃいろの' },
      pt: { base: 'castanho' },
    },
  },
  {
    id: 'WILD',
    role: 'adjective',
    description: 'living in nature, not tamed',
    emoji: '🌿',
    forms: {
      en: { base: 'wild' },
      it: { base: 'selvatico' },
      fr: { base: 'sauvage' },
      de: { base: 'wild' },
      es: { base: 'salvaje' },
      ja: { base: '野生の', reading: 'やせいの' },
      pt: { base: 'selvagem' },
    },
  },
  {
    // "domestic" in the animal sense — kept by or living with people. German has no plain
    // adjective for it (Haus- is a prefix, Haustier); zahm ("tame") is the standalone adjective
    // that inflects. Japanese 家畜の is specifically livestock, so 家庭の ("of the household").
    id: 'DOMESTIC',
    role: 'adjective',
    description: 'kept by or living with people',
    emoji: '🏠',
    forms: {
      en: { base: 'domestic' },
      it: { base: 'domestico' },
      fr: { base: 'domestique' },
      de: { base: 'zahm' },
      es: { base: 'doméstico' },
      ja: { base: '家庭の', reading: 'かていの' },
      pt: { base: 'doméstico' },
    },
  },
  {
    // "canine" — of or resembling dogs. German Hunde- is a prefix; hundeartig is the adjective.
    id: 'CANINE',
    role: 'adjective',
    description: 'of or resembling dogs',
    emoji: '🐕',
    forms: {
      en: { base: 'canine' },
      it: { base: 'canino' },
      fr: { base: 'canin' },
      de: { base: 'hundeartig' },
      es: { base: 'canino' },
      ja: { base: '犬の', reading: 'いぬの' },
      pt: { base: 'canino' },
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
  {
    id: 'CAREFUL',
    role: 'adjective',
    description: 'taking care to avoid harm or mistakes',
    emoji: '⚠️',
    forms: {
      en: { base: 'careful' },
      it: { base: 'attento' },
      fr: { base: 'prudent' },
      de: { base: 'vorsichtig' },
      es: { base: 'cuidadoso' },
      ja: { base: '慎重な', reading: 'しんちょうな' },
      pt: { base: 'cuidadoso' },
    },
  },
  // ABLE and OBLIGED govern an infinitive ("able to act", PhrasePlan.infinitiveComplement), and the
  // modals CAN and MUST are defined on them (localization C09). Which preposition links the
  // infinitive belongs to the adjective, so each lexeme names it as `infinitive_link`: capace di,
  // capable de, capaz de; obbligato a, obligé de, obligado a. The Japanese entry is the whole tail
  // that closes the nominalized clause — both predicate of a こと clause marked with が:
  // 行動することが可能である ("acting is possible").
  {
    id: 'ABLE',
    role: 'adjective',
    description: 'having the power or the skill to do something',
    emoji: '🦾',
    forms: {
      en: { base: 'able' },
      it: { base: 'capace', infinitive_link: 'di' },
      fr: { base: 'capable', infinitive_link: 'de' },
      de: { base: 'fähig' },
      es: { base: 'capaz', infinitive_link: 'de' },
      ja: { base: '可能な', reading: 'かのうな', infinitive_link: 'ことが' },
      pt: { base: 'capaz', infinitive_link: 'de' },
    },
  },
  {
    id: 'OBLIGED',
    role: 'adjective',
    // Bound by a duty that holds for now, not a trait: es/pt say it with estar ("estar obligado a").
    transient: true,
    description: 'bound to do something by a duty or a rule',
    emoji: '📜',
    forms: {
      en: { base: 'obliged' },
      it: { base: 'obbligato', infinitive_link: 'a' },
      fr: { base: 'obligé', infinitive_link: 'de' },
      de: { base: 'verpflichtet' },
      es: { base: 'obligado', infinitive_link: 'a' },
      ja: { base: '義務的な', reading: 'ぎむてきな', infinitive_link: 'ことが' },
      pt: { base: 'obrigado', infinitive_link: 'a' },
    },
  },
  {
    id: 'WHOLE',
    role: 'adjective',
    description: 'complete, with no part missing',
    emoji: '⭕',
    forms: {
      en: { base: 'whole' },
      it: { base: 'intero' },
      fr: { base: 'entier' },
      de: { base: 'ganz' },
      es: { base: 'entero' },
      ja: { base: '全体の', reading: 'ぜんたいの' },
      pt: { base: 'inteiro' },
    },
  },
  {
    id: 'ROUND',
    role: 'adjective',
    description: 'shaped like a circle or ball',
    emoji: '⭕',
    forms: {
      en: { base: 'round' },
      it: { base: 'rotondo' },
      fr: { base: 'rond' },
      de: { base: 'rund' },
      es: { base: 'redondo' },
      ja: { base: '丸い', reading: 'まるい' },
      pt: { base: 'redondo' },
    },
  },
  {
    // Sharp of an edge — it "affilato", fr "tranchant", not the pointed or the figurative senses.
    // Postnominal in Romance like ROUND; German umlauts it like stark. es "afilado" / pt "afiado" are
    // sharpened-state participles, which predicate with estar ("la cuchilla está afilada").
    id: 'SHARP',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'having an edge that cuts easily',
    emoji: '🔪',
    forms: {
      en: { base: 'sharp' },
      it: { base: 'affilato' },
      fr: { base: 'tranchant' },
      de: { base: 'scharf', umlaut: 'true' }, // scharf → schärfer / schärfst
      es: { base: 'afilado' },
      ja: { base: '鋭い', reading: 'するどい' },
      pt: { base: 'afiado' },
    },
  },
  {
    // Loud of a sound. The Romance languages and Japanese say it with their "strong" / "big" word
    // (it/es "forte/fuerte", fr "fort", pt "alto", ja 大きい — 大きい音 "a loud sound").
    id: 'LOUD',
    role: 'adjective',
    description: 'producing much sound',
    emoji: '📣',
    forms: {
      en: { base: 'loud' },
      it: { base: 'forte' },
      fr: { base: 'fort' },
      de: { base: 'laut' },
      es: { base: 'fuerte' },
      ja: { base: '大きい', reading: 'おおきい' },
      pt: { base: 'alto' },
    },
  },
  {
    // A past-participle adjective: agrees in Romance (scritto/scritta) and, in Japanese, is
    // verb-derived — the plain past 書かれた attaches directly, like 去勢された (CASTRATED), no linker.
    id: 'WRITTEN',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'set down in words',
    emoji: '✍️',
    forms: {
      en: { base: 'written' },
      it: { base: 'scritto' },
      fr: { base: 'écrit' },
      de: { base: 'geschrieben' },
      es: { base: 'escrito' },
      ja: { base: '書かれた', reading: 'かかれた' },
      pt: { base: 'escrito' },
    },
  },
  {
    id: 'LOADED',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'brought in from storage and ready to use',
    emoji: '📂',
    forms: {
      en: { base: 'loaded' },
      it: { base: 'caricato' },
      fr: { base: 'chargé' },
      de: { base: 'geladen' },
      es: { base: 'cargado' },
      ja: { base: '読み込み済みの', reading: 'よみこみずみの' },
      pt: { base: 'carregado' },
    },
  },
  {
    id: 'SAVED',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'stored so it can be retrieved later',
    emoji: '💾',
    forms: {
      en: { base: 'saved' },
      it: { base: 'salvato' },
      fr: { base: 'enregistré' },
      de: { base: 'gespeichert' },
      es: { base: 'guardado' },
      ja: { base: '保存済みの', reading: 'ほぞんずみの' },
      pt: { base: 'salvo' },
    },
  },
  // What happened to an item, said as a status line says it (B25–B27): participles, since the engine
  // has no passive to say "the period was added" with. Transient, like SAVED.
  {
    id: 'ADDED',
    role: 'adjective',
    transient: true,
    description: 'put in with the others',
    emoji: '➕',
    forms: {
      en: { base: 'added' },
      it: { base: 'aggiunto' },
      fr: { base: 'ajouté' },
      de: { base: 'hinzugefügt' },
      es: { base: 'añadido' },
      ja: { base: '追加済みの', reading: 'ついかずみの' },
      pt: { base: 'adicionado' },
    },
  },
  {
    // Portuguese "malsucedido" ("importação malsucedida"); "falhado" reads as European Portuguese.
    id: 'FAILED',
    role: 'adjective',
    transient: true,
    description: 'that did not succeed',
    emoji: '❌',
    forms: {
      en: { base: 'failed' },
      it: { base: 'fallito' },
      fr: { base: 'échoué' },
      de: { base: 'fehlgeschlagen' },
      es: { base: 'fallido' },
      ja: { base: '失敗した', reading: 'しっぱいした' },
      pt: { base: 'malsucedido' },
    },
  },
  {
    // Japanese コピー済みの, like 保存済みの; katakana, so no reading (see BUTTON).
    id: 'COPIED',
    role: 'adjective',
    transient: true,
    description: 'duplicated, as to the clipboard',
    emoji: '✅',
    forms: {
      en: { base: 'copied' },
      it: { base: 'copiato' },
      fr: { base: 'copié' },
      de: { base: 'kopiert' },
      es: { base: 'copiado' },
      ja: { base: 'コピー済みの' },
      pt: { base: 'copiado' },
    },
  },
  {
    // In operation, as a server or a machine is while it runs — not the lively "active" of a child
    // (it vivace, ja 活発な), a sense of its own. A state the thing is in, so transient: es/pt predicate
    // it with estar ("el servidor está activo"). Japanese 稼働中 is a noun, linked by の.
    id: 'ACTIVE',
    role: 'adjective',
    transient: true,
    synonym: 'running',
    description: 'in operation, as a running program or machine',
    emoji: '🟢',
    forms: {
      en: { base: 'active' },
      it: { base: 'attivo' },
      fr: { base: 'actif' },
      de: { base: 'aktiv' },
      es: { base: 'activo' },
      ja: { base: '稼働中の', reading: 'かどうちゅうの' },
      pt: { base: 'ativo' },
    },
  },
  {
    // A prepositional phrase in the Romance languages ("senza titolo", "sans titre"), which does not
    // agree with its noun: each engine lists it as invariable. A state a thing is left in, so transient
    // ("la frase está sin título").
    id: 'UNTITLED',
    role: 'adjective',
    transient: true,
    description: 'having no name or title',
    emoji: '🏷️',
    forms: {
      en: { base: 'untitled' },
      it: { base: 'senza titolo' },
      fr: { base: 'sans titre' },
      de: { base: 'unbenannt' },
      es: { base: 'sin título' },
      ja: { base: '無題の', reading: 'むだいの' },
      pt: { base: 'sem título' },
    },
  },
  {
    id: 'EMPTY',
    role: 'adjective',
    transient: true,
    description: 'containing nothing',
    emoji: '🫙',
    forms: {
      en: { base: 'empty' },
      it: { base: 'vuoto' },
      fr: { base: 'vide' },
      de: { base: 'leer' },
      es: { base: 'vacío' },
      ja: { base: '空の', reading: 'からの' },
      pt: { base: 'vazio' },
    },
  },
  {
    // Correctly formed, as a file is — not the "valid" argument of logic.
    id: 'VALID',
    role: 'adjective',
    description: 'correctly formed and accepted',
    emoji: '✔️',
    forms: {
      en: { base: 'valid' },
      it: { base: 'valido' },
      fr: { base: 'valide' },
      de: { base: 'gültig' },
      es: { base: 'válido' },
      ja: { base: '有効な', reading: 'ゆうこうな' },
      pt: { base: 'válido' },
    },
  },
  {
    // Not where it is looked for: a word a saved phrase names that the catalog no longer has. The
    // Romance forms end in -e / -ant and agree by rule (it mancante/mancanti, fr manquant/manquante).
    // Japanese says it with the negative potential 見つからない ("that cannot be found"), which inflects
    // as an i-adjective.
    id: 'MISSING',
    role: 'adjective',
    transient: true, // a state a thing is in, not a quality it has → es/pt predicate with estar (A47)
    description: 'not present where it is expected',
    emoji: '🕳️',
    forms: {
      en: { base: 'missing' },
      it: { base: 'mancante' },
      fr: { base: 'manquant' },
      de: { base: 'fehlend' },
      es: { base: 'faltante' },
      ja: { base: '見つからない', reading: 'みつからない' },
      pt: { base: 'faltante' },
    },
  },
  {
    id: 'SINGULAR',
    role: 'adjective',
    description: 'referring to one (grammar)',
    emoji: '1️⃣',
    forms: {
      en: { base: 'singular' },
      it: { base: 'singolare' },
      fr: { base: 'singulier' },
      de: { base: 'singularisch' },
      es: { base: 'singular' },
      ja: { base: '単数の', reading: 'たんすうの' },
      pt: { base: 'singular' },
    },
  },
  {
    id: 'PLURAL',
    role: 'adjective',
    description: 'referring to more than one (grammar)',
    emoji: '🔢',
    forms: {
      en: { base: 'plural' },
      it: { base: 'plurale' },
      fr: { base: 'pluriel' },
      de: { base: 'pluralisch' },
      es: { base: 'plural' },
      ja: { base: '複数の', reading: 'ふくすうの' },
      pt: { base: 'plural' },
    },
  },
  {
    id: 'NEUTER',
    role: 'adjective',
    description: 'of the gender that is neither masculine nor feminine (grammar)',
    emoji: '⚪',
    forms: {
      en: { base: 'neuter' },
      it: { base: 'neutro' },
      fr: { base: 'neutre' },
      de: { base: 'sächlich' },
      es: { base: 'neutro' },
      ja: { base: '中性の', reading: 'ちゅうせいの' },
      pt: { base: 'neutro' },
    },
  },
  // ── Determiner values ────────────────────────────────────────────
  // What each determiner *means*, as the grammar traditions name it — the entries of the
  // determiner menu, which says "Definite" where it used to say "the". Adjectives, not nouns:
  // each qualifies the noun of the section it sits under (an article that is definite, a
  // demonstrative that is proximal, a quantifier that is universal), so the menu cites them
  // with ARTICLE / DEMONSTRATIVE / QUANTIFIER and the Romance forms come out agreeing —
  // it "articolo determinativo", "quantificatore universale".
  //
  // Japanese has no adjective for these: it names each with the noun the tradition coined
  // (定冠詞, 近称, 全称). Seeded with the の that makes a noun attributive, which ja's renderWord
  // strips when the word stands alone — so the menu shows 定冠詞, not 定冠詞の.
  {
    id: 'DEFINITE',
    role: 'adjective',
    description: 'pointing at a referent the hearer can already identify (grammar)',
    emoji: '🎯',
    forms: {
      en: { base: 'definite' },
      it: { base: 'determinativo' },
      fr: { base: 'défini' },
      de: { base: 'bestimmt' },
      es: { base: 'definido' },
      ja: { base: '定冠詞の', reading: 'ていかんしの' },
      pt: { base: 'definido' },
    },
  },
  {
    id: 'INDEFINITE',
    role: 'adjective',
    description: 'pointing at a referent the hearer cannot yet identify (grammar)',
    emoji: '❓',
    forms: {
      en: { base: 'indefinite' },
      it: { base: 'indeterminativo' },
      fr: { base: 'indéfini' },
      de: { base: 'unbestimmt' },
      es: { base: 'indefinido' },
      ja: { base: '不定冠詞の', reading: 'ふていかんしの' },
      pt: { base: 'indefinido' },
    },
  },
  {
    // The article that is no word at all — a positive choice, not the absence of one. German
    // says "artikellos" rather than "null", which alone would read as the number.
    id: 'ZERO',
    role: 'adjective',
    description: 'spelled with no article at all, meaningfully (grammar)',
    emoji: '⃠',
    forms: {
      en: { base: 'zero' },
      it: { base: 'zero' },
      fr: { base: 'zéro' },
      de: { base: 'artikellos' },
      es: { base: 'cero' },
      ja: { base: '無冠詞の', reading: 'むかんしの' },
      pt: { base: 'zero' },
    },
  },
  {
    id: 'PROXIMAL',
    role: 'adjective',
    description: 'pointing at what is near the speaker (grammar)',
    emoji: '👉',
    forms: {
      en: { base: 'proximal' },
      it: { base: 'vicinale' },
      fr: { base: 'proximal' },
      de: { base: 'proximal' },
      es: { base: 'proximal' },
      ja: { base: '近称の', reading: 'きんしょうの' },
      pt: { base: 'proximal' },
    },
  },
  {
    id: 'DISTAL',
    role: 'adjective',
    description: 'pointing at what is far from the speaker (grammar)',
    emoji: '🔭',
    forms: {
      en: { base: 'distal' },
      it: { base: 'distale' },
      fr: { base: 'distal' },
      de: { base: 'distal' },
      es: { base: 'distal' },
      ja: { base: '遠称の', reading: 'えんしょうの' },
      pt: { base: 'distal' },
    },
  },
  {
    id: 'PARTITIVE',
    role: 'adjective',
    description: 'naming a part of a whole, an unspecified some of it (grammar)',
    emoji: '🍰',
    forms: {
      en: { base: 'partitive' },
      it: { base: 'partitivo' },
      fr: { base: 'partitif' },
      de: { base: 'partitiv' },
      es: { base: 'partitivo' },
      ja: { base: '部分詞の', reading: 'ぶぶんしの' },
      pt: { base: 'partitivo' },
    },
  },
  {
    id: 'NEGATIVE',
    role: 'adjective',
    description: 'asserting that there is none of it (grammar)',
    emoji: '🚫',
    forms: {
      en: { base: 'negative' },
      it: { base: 'negativo' },
      fr: { base: 'négatif' },
      de: { base: 'negativ' },
      es: { base: 'negativo' },
      ja: { base: '否定の', reading: 'ひていの' },
      pt: { base: 'negativo' },
    },
  },
  {
    // Multal and paucal are the quantities "many" and "few" — a large and a small amount, with
    // no claim about halves. "Majority"/"minority" would make that claim, and it is not one
    // "many books" makes.
    id: 'MULTAL',
    role: 'adjective',
    description: 'naming a large quantity, without claiming most (grammar)',
    emoji: '🔺',
    forms: {
      en: { base: 'multal' },
      it: { base: 'multale' },
      fr: { base: 'multal' },
      de: { base: 'multal' },
      es: { base: 'multal' },
      ja: { base: '多数の', reading: 'たすうの' },
      pt: { base: 'multal' },
    },
  },
  {
    id: 'PAUCAL',
    role: 'adjective',
    description: 'naming a small quantity, without claiming a minority (grammar)',
    emoji: '🔻',
    forms: {
      en: { base: 'paucal' },
      it: { base: 'paucale' },
      fr: { base: 'paucal' },
      de: { base: 'paukal' },
      es: { base: 'paucal' },
      ja: { base: '少数の', reading: 'しょうすうの' },
      pt: { base: 'paucal' },
    },
  },
  {
    id: 'UNIVERSAL',
    role: 'adjective',
    description: 'taking in every one of them, with no exception (grammar)',
    emoji: '🌐',
    forms: {
      en: { base: 'universal' },
      it: { base: 'universale' },
      fr: { base: 'universel' },
      de: { base: 'universal' },
      es: { base: 'universal' },
      ja: { base: '全称の', reading: 'ぜんしょうの' },
      pt: { base: 'universal' },
    },
  },
  // ── Ordinals ─────────────────────────────────────────────────────
  // Position in a sequence. Seeded so the pronoun chooser can name the three grammatical
  // persons in the UI language. German declines from an uninflected stem, but its endings
  // absorb a leading -e after a stem in -e (the "müde" rule), so the -e citation form
  // ("erste") both declines correctly and reads as a word on its own.
  {
    id: 'FIRST',
    role: 'adjective',
    description: 'coming before all others in a sequence',
    emoji: '🥇',
    forms: {
      en: { base: 'first' },
      it: { base: 'primo' },
      fr: { base: 'premier' },
      de: { base: 'erste' },
      es: { base: 'primero' },
      ja: { base: '第一の', reading: 'だいいちの' },
      pt: { base: 'primeiro' },
    },
  },
  {
    id: 'SECOND',
    role: 'adjective',
    description: 'coming after the first in a sequence',
    emoji: '🥈',
    forms: {
      en: { base: 'second' },
      it: { base: 'secondo' },
      fr: { base: 'deuxième' },
      de: { base: 'zweite' },
      es: { base: 'segundo' },
      ja: { base: '第二の', reading: 'だいにの' },
      pt: { base: 'segundo' },
    },
  },
  {
    id: 'THIRD',
    role: 'adjective',
    description: 'coming after the second in a sequence',
    emoji: '🥉',
    forms: {
      en: { base: 'third' },
      it: { base: 'terzo' },
      fr: { base: 'troisième' },
      de: { base: 'dritte' },
      es: { base: 'tercero' },
      ja: { base: '第三の', reading: 'だいさんの' },
      pt: { base: 'terceiro' },
    },
  },
  // Not standing for any particular person — the grammatical category of the generic subject
  // ("one eats"), GENERIC_PERSON. Offered in the pronoun chooser's person row alongside the three
  // ordinals, and naming the concept in the picker/chip, so it is seeded like them: an adjective
  // that agrees with the "person" noun (it "impersonale", de "unpersönliche").
  {
    id: 'IMPERSONAL',
    role: 'adjective',
    description: 'not standing for any particular person (grammar)',
    emoji: '🫥',
    forms: {
      en: { base: 'impersonal' },
      it: { base: 'impersonale' },
      fr: { base: 'impersonnel' },
      de: { base: 'unpersönlich' },
      es: { base: 'impersonal' },
      ja: { base: '非人称の', reading: 'ひにんしょうの' },
      pt: { base: 'impessoal' },
    },
  },
  {
    // Different from the one already named: "the other cat", "another cat". Prenominal in the
    // Romance languages (it "un altro gatto", fr "un autre chat"), and Spanish and Portuguese drop
    // the indefinite article before it ("otro gato", "outro gato"), as English fuses it ("another").
    id: 'OTHER',
    role: 'adjective',
    description: 'different from the one already named',
    emoji: '🔁',
    forms: {
      en: { base: 'other' },
      it: { base: 'altro' },
      fr: { base: 'autre' },
      de: { base: 'andere' },
      es: { base: 'otro' },
      ja: { base: '別の', reading: 'べつの' },
      pt: { base: 'outro' },
    },
  },
  // ── Kinds of clause ──────────────────────────────────────────────
  // What a clause is to the period it sits in, said of CLAUSE: the main one the others depend on,
  // the conditional one, and one coordinated with another. The Romance traditions name the clauses
  // with these adjectives ("proposizione principale / condizionale / coordinata"). German says
  // "übergeordnet" for the main clause, the adjective its compound Hauptsatz has no match for.
  // Japanese compounds the term on 節 (主節, 条件節, 等位節), so its forms are the bare first half, which
  // runs straight into the noun: a Japanese adjective joins its noun with no space (see npSegs).
  {
    id: 'MAIN',
    role: 'adjective',
    description: 'not depending on any other clause (grammar)',
    emoji: '👑',
    forms: {
      en: { base: 'main' },
      it: { base: 'principale' },
      fr: { base: 'principal' },
      de: { base: 'übergeordnet' },
      es: { base: 'principal' },
      ja: { base: '主', reading: 'しゅ' },
      pt: { base: 'principal' },
    },
  },
  {
    id: 'CONDITIONAL',
    role: 'adjective',
    description: 'setting the condition another clause depends on (grammar)',
    emoji: '🔀',
    forms: {
      en: { base: 'conditional' },
      it: { base: 'condizionale' },
      fr: { base: 'conditionnel' },
      de: { base: 'konditional' },
      es: { base: 'condicional' },
      ja: { base: '条件', reading: 'じょうけん' },
      pt: { base: 'condicional' },
    },
  },
  {
    id: 'COORDINATED',
    role: 'adjective',
    description: 'joined to another clause or phrase of equal rank (grammar)',
    emoji: '🔗',
    forms: {
      en: { base: 'coordinated' },
      it: { base: 'coordinato' },
      fr: { base: 'coordonné' },
      de: { base: 'beigeordnet' },
      es: { base: 'coordinado' },
      ja: { base: '等位', reading: 'とうい' },
      pt: { base: 'coordenado' },
    },
  },
  // ── Kinds of conjunction ─────────────────────────────────────────
  // The relation each coordinating conjunction sets up, as the grammar traditions name it: and adds
  // (copulative), or offers a choice (disjunctive), but opposes (adversative), that is explains
  // (explicative), therefore concludes (conclusive), then follows in time (temporal). Said of
  // CONJUNCTION, which is feminine in the Romance languages ("congiunzione avversativa"). Japanese
  // names the kinds with nouns (累加, 選択, 逆接 …), seeded with the attributive の.
  {
    id: 'COPULATIVE',
    role: 'adjective',
    description: 'adding one thing to another, like "and" (grammar)',
    emoji: '➕',
    forms: {
      en: { base: 'copulative' },
      it: { base: 'copulativo' },
      fr: { base: 'copulatif' },
      de: { base: 'kopulativ' },
      es: { base: 'copulativo' },
      ja: { base: '累加の', reading: 'るいかの' },
      pt: { base: 'copulativo' },
    },
  },
  {
    id: 'DISJUNCTIVE',
    role: 'adjective',
    description: 'offering a choice between things, like "or" (grammar)',
    emoji: '🔀',
    forms: {
      en: { base: 'disjunctive' },
      it: { base: 'disgiuntivo' },
      fr: { base: 'disjonctif' },
      de: { base: 'disjunktiv' },
      es: { base: 'disyuntivo' },
      ja: { base: '選択の', reading: 'せんたくの' },
      pt: { base: 'disjuntivo' },
    },
  },
  {
    id: 'ADVERSATIVE',
    role: 'adjective',
    description: 'setting one thing against another, like "but" (grammar)',
    emoji: '↔️',
    forms: {
      en: { base: 'adversative' },
      it: { base: 'avversativo' },
      fr: { base: 'adversatif' },
      de: { base: 'adversativ' },
      es: { base: 'adversativo' },
      ja: { base: '逆接の', reading: 'ぎゃくせつの' },
      pt: { base: 'adversativo' },
    },
  },
  {
    id: 'EXPLICATIVE',
    role: 'adjective',
    description: 'explaining what came before, like "that is" (grammar)',
    emoji: '💬',
    forms: {
      en: { base: 'explicative' },
      it: { base: 'esplicativo' },
      fr: { base: 'explicatif' },
      de: { base: 'explikativ' },
      es: { base: 'explicativo' },
      ja: { base: '説明の', reading: 'せつめいの' },
      pt: { base: 'explicativo' },
    },
  },
  {
    id: 'CONCLUSIVE',
    role: 'adjective',
    description: 'drawing a conclusion from what came before, like "therefore" (grammar)',
    emoji: '🏁',
    forms: {
      en: { base: 'conclusive' },
      it: { base: 'conclusivo' },
      fr: { base: 'conclusif' },
      de: { base: 'konklusiv' },
      es: { base: 'conclusivo' },
      ja: { base: '順接の', reading: 'じゅんせつの' },
      pt: { base: 'conclusivo' },
    },
  },
  {
    id: 'TEMPORAL',
    role: 'adjective',
    description: 'relating things by their order in time, like "then"',
    emoji: '🕰️',
    forms: {
      en: { base: 'temporal' },
      it: { base: 'temporale' },
      fr: { base: 'temporel' },
      de: { base: 'temporal' },
      es: { base: 'temporal' },
      ja: { base: '時間的な', reading: 'じかんてきな' },
      pt: { base: 'temporal' },
    },
  },
  // ── Aspects and polarity ─────────────────────────────────────────
  // The values of the verb's aspect and polarity controls, said of ASPECT and POLARITY. NEGATIVE is
  // seeded above with the determiner values. NEUTRAL is the everyday word (it "neutrale"), which the
  // plain aspect takes as well as a neutral feeling.
  {
    id: 'NEUTRAL',
    role: 'adjective',
    description: 'taking neither one side nor the other',
    emoji: '⚖️',
    forms: {
      en: { base: 'neutral' },
      it: { base: 'neutrale' },
      fr: { base: 'neutre' },
      de: { base: 'neutral' },
      es: { base: 'neutral' },
      ja: { base: '中立の', reading: 'ちゅうりつの' },
      pt: { base: 'neutro' },
    },
  },
  {
    id: 'PROGRESSIVE',
    role: 'adjective',
    description: 'presenting an event as in progress (grammar)',
    emoji: '▶️',
    forms: {
      en: { base: 'progressive' },
      it: { base: 'progressivo' },
      fr: { base: 'progressif' },
      de: { base: 'progressiv' },
      es: { base: 'progresivo' },
      ja: { base: '進行の', reading: 'しんこうの' },
      pt: { base: 'progressivo' },
    },
  },
  {
    id: 'PROSPECTIVE',
    role: 'adjective',
    description: 'presenting an event as about to happen (grammar)',
    emoji: '⏩',
    forms: {
      en: { base: 'prospective' },
      it: { base: 'prospettivo' },
      fr: { base: 'prospectif' },
      de: { base: 'prospektiv' },
      es: { base: 'prospectivo' },
      ja: { base: '将然の', reading: 'しょうぜんの' },
      pt: { base: 'prospectivo' },
    },
  },
  {
    id: 'RESULTATIVE',
    role: 'adjective',
    description: 'presenting the state an event has left behind (grammar)',
    emoji: '✅',
    forms: {
      en: { base: 'resultative' },
      it: { base: 'risultativo' },
      fr: { base: 'résultatif' },
      de: { base: 'resultativ' },
      es: { base: 'resultativo' },
      ja: { base: '結果の', reading: 'けっかの' },
      pt: { base: 'resultativo' },
    },
  },
  {
    id: 'POSITIVE',
    role: 'adjective',
    description: 'affirming, not negating (grammar)',
    emoji: '👍',
    forms: {
      en: { base: 'positive' },
      it: { base: 'positivo' },
      fr: { base: 'positif' },
      de: { base: 'positiv' },
      es: { base: 'positivo' },
      ja: { base: '肯定の', reading: 'こうていの' },
      pt: { base: 'positivo' },
    },
  },
  {
    id: 'SEMANTIC',
    role: 'adjective',
    description: 'relating to meaning in language',
    emoji: '🔤',
    forms: {
      en: { base: 'semantic' },
      it: { base: 'semantico' },
      fr: { base: 'sémantique' },
      de: { base: 'semantisch' },
      es: { base: 'semántico' },
      ja: { base: '意味的な', reading: 'いみてきな' },
      pt: { base: 'semântico' },
    },
  },
  {
    id: 'DIRECT',
    role: 'adjective',
    description: 'reaching its end with nothing in between',
    emoji: '➡️',
    forms: {
      en: { base: 'direct' },
      it: { base: 'diretto' },
      fr: { base: 'direct' },
      de: { base: 'direkt' },
      es: { base: 'directo' },
      ja: { base: '直接の', reading: 'ちょくせつの' },
      pt: { base: 'direto' },
    },
  },
  {
    id: 'INDIRECT',
    role: 'adjective',
    description: 'reaching its end through something in between',
    emoji: '↪️',
    forms: {
      en: { base: 'indirect' },
      it: { base: 'indiretto' },
      fr: { base: 'indirect' },
      de: { base: 'indirekt' },
      es: { base: 'indirecto' },
      ja: { base: '間接の', reading: 'かんせつの' },
      pt: { base: 'indireto' },
    },
  },
  {
    // Joined to nothing else — said of a word no relation of the map reaches. The negative is
    // built into the word in en/de ("unconnected", "unverbunden") and spelled as a separate
    // negator in the Romance ones (it "non collegato", fr "non connecté").
    id: 'UNCONNECTED',
    role: 'adjective',
    description: 'joined to nothing else',
    emoji: '⚪',
    forms: {
      en: { base: 'unconnected' },
      it: { base: 'non collegato' },
      fr: { base: 'non connecté' },
      de: { base: 'unverbunden' },
      es: { base: 'no conectado' },
      ja: { base: '孤立した', reading: 'こりつした' },
      pt: { base: 'não conectado' },
    },
  },
  {
    // Kept out of sight — said of what the map does not draw. Japanese takes the attributive
    // 非表示の (literally "not-displayed"), the word an interface uses of what it is not showing,
    // rather than 隠れた, which is something concealing itself.
    id: 'HIDDEN',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'kept out of sight',
    emoji: '🙈',
    forms: {
      en: { base: 'hidden' },
      it: { base: 'nascosto' },
      fr: { base: 'caché' },
      de: { base: 'ausgeblendet' },
      es: { base: 'oculto' },
      ja: { base: '非表示の', reading: 'ひひょうじの' },
      pt: { base: 'oculto' },
    },
  },
  {
    // HIDDEN's opposite, and what APPEAR comes to be ("to become visible", localization C08).
    // Japanese takes 可視の, the word of 可視光 "visible light": 見える is a verb, and the UI's 表示の
    // ("displayed") says a screen shows it rather than that an eye can see it.
    id: 'VISIBLE',
    role: 'adjective',
    transient: true, // a state a thing comes into, like HIDDEN → es/pt predicate with estar (A47)
    description: 'able to be seen',
    emoji: '👓',
    forms: {
      en: { base: 'visible' },
      it: { base: 'visibile' },
      fr: { base: 'visible' },
      de: { base: 'sichtbar' },
      es: { base: 'visible' },
      ja: { base: '可視の', reading: 'かしの' },
      pt: { base: 'visível' },
    },
  },
];
