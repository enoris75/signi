import type { ConceptSeed } from './types.js';
import type { Degree, PhrasePlan } from '@signi/shared';
import { namedAgentGloss, relativeGloss, stateGloss, subjectGapGloss } from './relativeGloss.js';

// An adjective-definition gloss: a dimension noun carrying a degree adjective, rendered verblessly as
// a prepositional fragment whose adposition the noun's `dimensionRelation` selects — dimGloss('SIZE',
// 'GREAT') → en "of great size", it "di grande dimensione", de "von großer Größe", ja "大きさが大きい";
// dimGloss('TEMPERATURE', 'HIGH') → "at high temperature" (the `measure` relation). See
// NounPhrase.dimensionGloss and the engines' verbless branch. A `comparison` puts the degree
// adjective itself one step up — ELDER is "of greater age", OLD's own gloss compared (B69).
const dimGloss = (dimension: string, degree: string, comparison?: Degree): PhrasePlan => ({
  subject: {
    concept: dimension,
    definiteness: 'bare',
    adjectives: [degree],
    ...(comparison ? { adjectiveDegrees: [comparison] } : {}),
    dimensionGloss: true,
  },
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
    definition: dimGloss('SIZE', 'LOW'),
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
    // The distance scale's two poles, as TEMPERATURE's are COLD and HOT: "at small distance" /
    // "at great distance". SMALL, not LOW, is the low pole here — "at low distance", it "a distanza
    // bassa" say a height — and it is not circular, as it was for SMALL's own gloss (A28).
    definition: dimGloss('DISTANCE', 'SMALL'),
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
    definition: dimGloss('DISTANCE', 'GREAT'),
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
    // An evaluative predicate: a clause it is said of is judged, not asserted, and the four Romance
    // languages put it in the subjunctive — "è buono che si agisca" (`content_clause_mood`, P09-E4).
    forms: {
      en: { base: 'good' },
      it: { base: 'buono', content_clause_mood: 'subjunctive' },
      fr: { base: 'bon', content_clause_mood: 'subjunctive' },
      // Suppletive: gut → besser / best, no rule derives it (cf. English good → better).
      de: { base: 'gut', comparative: 'besser', superlative: 'best' },
      es: { base: 'bueno', content_clause_mood: 'subjunctive' },
      ja: { base: '良い', reading: 'よい' },
      pt: { base: 'bom', content_clause_mood: 'subjunctive' },
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
    definition: dimGloss('JOY', 'HIGH'),
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
    // P09's *okay* (rank 290, the predicate; P09-E31): well-being, which five languages say with a verb
    // of their own rather than with BE + an adjective. The lexeme names that verb as `copula` — BE's
    // sense BE_FARING, *stare* / *aller* / *gehen* — and the translator swaps it in for BE when this
    // adjective is BE's predicate (`lexicalCopula`): "il gatto sta bene", "le chat va bien". German
    // also takes the experiencer frame (`experiencer`, C34's key on the predicate): the one who fares
    // is a dative and *es* the subject, "dem Kater geht es gut". Spanish and Portuguese keep BE, whose
    // transient copula is already *estar* ("está bien", "está bem"); Japanese 大丈夫 is a な-adjective
    // ("猫は大丈夫です") and English keeps BE ("is okay"). The Romance words are adverbs, so they never
    // agree (INVARIABLE_ADJ).
    //
    // Predicative only (P09-E31 D3): "an okay cat" is marginal in English and impossible in five
    // languages, but the picker has no predicate-only slot — `slot` would hide it from the predicate
    // picker too, which is the same adjective picker — so it is still offered attributively.
    id: 'OKAY',
    role: 'adjective',
    transient: true, // a state that holds now → es/pt predicate with estar (A47)
    description: 'in a satisfactory state; all right',
    synonym: 'all right',
    emoji: '👌',
    forms: {
      en: { base: 'okay' },
      it: { base: 'bene', copula: 'BE_FARING' },
      fr: { base: 'bien', copula: 'BE_FARING' },
      de: { base: 'gut', copula: 'BE_FARING', experiencer: '1' },
      es: { base: 'bien' },
      ja: { base: '大丈夫な', reading: 'だいじょうぶな' },
      pt: { base: 'bem' },
    },
  },
  {
    id: 'SAD',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'feeling or expressing sorrow',
    definition: dimGloss('SORROW', 'HIGH'),
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
    // The two age adjectives a family needs, seeded with P11's kin terms: an older and a younger
    // brother. They are not OLD and YOUNG at the comparative degree — that gives *più vecchio*,
    // *plus vieux*, *más viejo*, which say a brother is an old thing, and Japanese もっと古い, which
    // is only said of things. Japanese fuses them into the kin noun itself (兄弟 + ELDER → 兄, P11
    // D5), so its words here are what a head with no fusion column renders: 上の息子, the older son.
    // Both end in の so that jaAdjClass links them (bare 上 gave 上息子).
    id: 'ELDER',
    role: 'adjective',
    description: 'older, of two or more relatives',
    // OLD's own "of great age" one degree up (localization B69). What the word means is older *than
    // another relative*, and the engine has no standard of comparison to name; the dimension is what
    // it can say, and it is what tells ELDER from YOUNGER.
    definition: dimGloss('AGE', 'GREAT', 'more'),
    emoji: '👴',
    forms: {
      en: { base: 'older' },
      it: { base: 'maggiore' },
      fr: { base: 'aîné' },
      de: { base: 'älter' },
      es: { base: 'mayor' },
      ja: { base: '上の', reading: 'うえの' },
      pt: { base: 'mais velho' },
    },
  },
  {
    id: 'YOUNGER',
    role: 'adjective',
    description: 'younger, of two or more relatives',
    definition: dimGloss('AGE', 'LOW', 'more'),
    emoji: '🧒',
    forms: {
      en: { base: 'younger' },
      it: { base: 'minore' },
      // The adjective rule gives *cousines cadetes*; cadet is irregular, and FR_ADJ_IRREGULAR has it.
      fr: { base: 'cadet' },
      de: { base: 'jünger' },
      es: { base: 'menor' },
      ja: { base: '下の', reading: 'したの' },
      pt: { base: 'mais novo' },
    },
  },
  {
    // "adult" in the general sense — fully grown — applying to people and animals alike, so
    // Japanese takes the everyday 大人の rather than the human-only, legal 成人の. Noun-adjective (の).
    id: 'ADULT',
    role: 'adjective',
    description: 'fully grown',
    // What OLD's "of great age" is not: a being that has finished growing, however long ago.
    definition: subjectGapGloss('BEING', 'GROW', { modifier: 'NO_LONGER' }),
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
    // The creature adjectives say what they say of a BEING, a creature of either kind: de "das …".
    definition: subjectGapGloss('BEING', 'HAVE', { object: 'TESTICLE', number: 'plural' }),
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
    definition: subjectGapGloss('BEING', 'HAVE', { object: 'OVARY', number: 'plural' }),
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
    // A source gap, in the passive: "from which the testicles have been removed". "That has no
    // testicles" would be FEMALE's too.
    definition: relativeGloss('BEING', {
      headRole: 'source',
      subject: { concept: 'GENERIC_PERSON' },
      directObject: { concept: 'TESTICLE', definiteness: 'definite', number: 'plural' },
      verbPhrase: { verb: 'REMOVE', aspect: 'resultative', voice: 'passive' },
    }),
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
    // Both senses, because Spanish and Portuguese spell them apart by position and the engine puts
    // this one before the noun — "one more" — everywhere it composes (A204).
    description: 'recently made or introduced, or one more of the same kind',
    // What YOUNG's "of low age" cannot say of a thing: when it was made.
    definition: stateGloss('OBJECT_THING', 'MAKE', { voice: 'passive', modifier: 'RECENTLY' }),
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
    definition: dimGloss('REST', 'LOW'),
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
    definition: subjectGapGloss('BEING', 'EAT', { modals: ['WILL'], aspect: 'neutral' }),
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
    // The climate sense of COLD, the cold of a place or the weather: ANTARCTICA is "the coldest
    // continent" (localization B48). Japanese splits the two senses: COLD is 冷たい, cold to the
    // touch, and this is 寒い, the cold the whole body feels. The other six use one word for both,
    // so the gloss is COLD's. Inherent, not transient: a climate is what a place is, so es/pt
    // predicate it with ser ("la Antártida es fría"), where COLD takes estar.
    id: 'COLD_CLIMATE',
    role: 'adjective',
    description: 'cold, of weather or a climate',
    definition: dimGloss('TEMPERATURE', 'LOW'),
    emoji: '❄️',
    synonym: 'climate',
    forms: {
      en: { base: 'cold' },
      it: { base: 'freddo' },
      fr: { base: 'froid' },
      de: { base: 'kalt', umlaut: 'true' }, // kalt → kälter / kältest, as COLD
      es: { base: 'frío' },
      ja: { base: '寒い', reading: 'さむい' },
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
    // Not on AFFECTION, which is "a warm feeling": the two would define each other.
    definition: dimGloss('KINDNESS', 'GREAT'),
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
    // The climate sense of HOT, as COLD_CLIMATE is COLD's: AFRICA is "the hottest continent"
    // (localization B48). Japanese says 暑い of the weather where HOT is 熱い to the touch, and
    // Spanish caluroso where HOT is caliente. Inherent, so es/pt predicate it with ser.
    id: 'HOT_CLIMATE',
    role: 'adjective',
    description: 'hot, of weather or a climate',
    definition: dimGloss('TEMPERATURE', 'HIGH'),
    emoji: '☀️',
    synonym: 'climate',
    forms: {
      en: { base: 'hot' },
      it: { base: 'caldo' },
      fr: { base: 'chaud' },
      de: { base: 'heiß' },
      es: { base: 'caluroso' },
      ja: { base: '暑い', reading: 'あつい' },
      pt: { base: 'quente' },
    },
  },
  {
    id: 'INTERESTING',
    role: 'adjective',
    description: 'arousing curiosity or attention',
    definition: dimGloss('ATTENTION', 'HIGH'),
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
    // The differentia of NIGHT's gloss, "the dark part of a day" (localization B59), glossed as
    // UNTITLED and EMPTY are, HAVE negated over a bare object: "that does not have light". German
    // dunkel is the corpus's first adjective in -el, which drops its e before an ending (der dunkle
    // Teil, dunkler) and keeps it in the superlative (am dunkelsten): see the engine's `deSchwaStem`.
    id: 'DARK',
    role: 'adjective',
    description: 'with little or no light',
    definition: subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'LIGHT', negative: true }),
    emoji: '🌑',
    forms: {
      en: { base: 'dark' },
      it: { base: 'scuro' },
      fr: { base: 'sombre' },
      de: { base: 'dunkel' },
      es: { base: 'oscuro' },
      ja: { base: '暗い', reading: 'くらい' },
      pt: { base: 'escuro' },
    },
  },
  {
    id: 'WILD',
    role: 'adjective',
    description: 'living in nature, not tamed',
    // "That lives in nature" would say "in the nature" in English, and "that does not live with
    // people" hits French's unelided "ne habite"; the description's own "not tamed" renders in all
    // seven.
    definition: stateGloss('BEING', 'TAME', { voice: 'passive', negative: true }),
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
    definition: subjectGapGloss('BEING', 'LIVE', {
      complements: { comitative: { phrase: { concept: 'PERSON', definiteness: 'bare', number: 'plural' } } },
    }),
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
    definition: dimGloss('CARE', 'LOW'),
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
    definition: dimGloss('CARE', 'HIGH'),
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
  // What MIGHT's gloss is said of: the **act**, not the actor (localization C30). Japanese takes
  // 起こりうる ("can come about") rather than ABLE's 可能な — the two are one word there, and a gloss
  // that said 可能 would make MIGHT and CAN the same sentence, which is exactly what the ticket was
  // filed to avoid. It is said of a clause, so it needs no infinitive_link: the content clause is
  // its subject, not something it governs.
  {
    id: 'POSSIBLE',
    role: 'adjective',
    description: 'that may come about',
    emoji: '🎲',
    // Said of a clause, which the four Romance languages then put in the subjunctive — "è possibile
    // che si agisca" (`content_clause_mood`, P09-E4).
    forms: {
      en: { base: 'possible' },
      it: { base: 'possibile', content_clause_mood: 'subjunctive' },
      fr: { base: 'possible', content_clause_mood: 'subjunctive' },
      de: { base: 'möglich' },
      es: { base: 'posible', content_clause_mood: 'subjunctive' },
      // 起こり得る is 得る, an ichidan verb, so the predicate inflects as a verb and not through the
      // copula (`ja_verbal`): 行動することが起こり得ます, never "起こり得るです".
      ja: { base: '起こり得る', reading: 'おこりえる', ja_verbal: '1' },
      pt: { base: 'possível', content_clause_mood: 'subjunctive' },
    },
  },
  {
    id: 'ABLE',
    role: 'adjective',
    description: 'having the power or the skill to do something',
    definition: dimGloss('ABILITY', 'HIGH'),
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
    definition: dimGloss('DUTY', 'HIGH'),
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
    // The differentia of MAY's gloss, "to be allowed to act" (localization B63), beside ABLE and
    // OBLIGED. It is said of the one allowed, not of the act: autorizzato, autorisé, berechtigt,
    // autorizado, where permesso, permis, erlaubt, permitido say "es ist erlaubt". Transient like
    // OBLIGED, so es/pt predicate it with estar ("estar autorizado a actuar", not the passive "ser
    // autorizado"). Japanese 許可された is predicated as 許可されている, as 閉じた is.
    //
    // It stays on the English literal by design (C36): the state LET leaves is ambiguous in the two
    // languages whose verb also means *leave* ("die man gelassen hat", "che si è lasciata"), and
    // every other lead defines it by the word it was itself seeded for — "who may act" and MAY's
    // "to be allowed to act" would define each other and nothing else. ABLE's and OBLIGED's shape
    // ("of high ability") wants a scalar noun, and permission is not one.
    id: 'ALLOWED',
    role: 'adjective',
    transient: true,
    description: 'having permission to do something',
    emoji: '🆗',
    forms: {
      en: { base: 'allowed' },
      it: { base: 'autorizzato', infinitive_link: 'a' },
      fr: { base: 'autorisé', infinitive_link: 'à' },
      de: { base: 'berechtigt' },
      es: { base: 'autorizado', infinitive_link: 'a' },
      ja: { base: '許可された', reading: 'きょかされた', infinitive_link: 'ことが' },
      pt: { base: 'autorizado', infinitive_link: 'a' },
    },
  },
  {
    id: 'WHOLE',
    role: 'adjective',
    description: 'complete, with no part missing',
    definition: stateGloss('OBJECT_THING', 'DIVIDE', { voice: 'passive', negative: true }),
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
    // The genitive relative HYPERNYM uses: "whose shape is a circle", de "dessen Form ein Kreis ist".
    definition: relativeGloss('OBJECT_THING', {
      headRole: 'possessor',
      subject: { concept: 'SHAPE', definiteness: 'definite' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'CIRCLE', definiteness: 'indefinite' } } },
    }),
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
    // Glossed as what it does, "that cuts well" (localization C24), once CUT stopped being "to divide
    // with a sharp blade".
    id: 'SHARP',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'having an edge that cuts easily',
    definition: subjectGapGloss('OBJECT_THING', 'CUT', { modifier: 'WELL' }),
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
    definition: dimGloss('SOUND', 'GREAT'),
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
    definition: stateGloss('OBJECT_THING', 'WRITE'),
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
    definition: stateGloss('OBJECT_THING', 'LOAD'),
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
    id: 'TIDY',
    role: 'adjective',
    transient: true, // a state a thing is put into, not a property it has → es/pt estar (A47)
    description: 'arranged in order',
    // ARRANGE, "to put things in an order", and not TIDY_UP: its gloss is "to cause objects to be tidy".
    definition: stateGloss('OBJECT_THING', 'ARRANGE'),
    synonym: 'in order',
    emoji: '🧹',
    forms: {
      en: { base: 'tidy' },
      it: { base: 'ordinato' },
      fr: { base: 'rangé' },
      de: { base: 'ordentlich' },
      es: { base: 'ordenado' },
      ja: { base: '整然とした', reading: 'せいぜんとした' },
      pt: { base: 'arrumado' },
    },
  },

  {
    id: 'SAVED',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'stored so it can be retrieved later',
    definition: stateGloss('OBJECT_THING', 'SAVE'),
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
    definition: stateGloss('OBJECT_THING', 'ADD'),
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
    // ADDED's opposite (B40): the participle of each language's REMOVE (rimosso, retiré, entfernt, quitado,
    // removido). Japanese says 削除済み, what its software writes for anything taken off a list, and not
    // REMOVE's own 取り除き済み: 済み attaches to the Sino-Japanese verbal noun, and 取り除き済み reads as a
    // coinage. It is DELETE's 削除, which the saved items' delete control says, so in Japanese removing a
    // period and deleting a saved phrase end on the same word.
    id: 'REMOVED',
    role: 'adjective',
    transient: true,
    description: 'taken away from the others',
    definition: stateGloss('OBJECT_THING', 'REMOVE'),
    emoji: '➖',
    forms: {
      en: { base: 'removed' },
      it: { base: 'rimosso' },
      fr: { base: 'retiré' },
      de: { base: 'entfernt' },
      es: { base: 'quitado' },
      ja: { base: '削除済みの', reading: 'さくじょずみの' },
      pt: { base: 'removido' },
    },
  },
  {
    // Portuguese "malsucedido" ("importação malsucedida"); "falhado" reads as European Portuguese.
    id: 'FAILED',
    role: 'adjective',
    transient: true,
    description: 'that did not succeed',
    // The resultative, not the past: Italian and French would say the simple past, "che non
    // funzionò", "qui ne fonctionna pas", which a status line never does.
    definition: subjectGapGloss('OBJECT_THING', 'WORK', { aspect: 'resultative', negative: true }),
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
    definition: stateGloss('OBJECT_THING', 'COPY'),
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
    // The state a satellite reports when its noun already holds a link ("Linked — click to remove",
    // localization C12). Japanese リンク済みの, like コピー済みの above; katakana, so no reading.
    id: 'LINKED',
    role: 'adjective',
    transient: true, // a state a thing is put into and taken out of, like COPIED (A47)
    description: 'joined to another by a link',
    definition: stateGloss('OBJECT_THING', 'LINK'),
    emoji: '🔗',
    forms: {
      en: { base: 'linked' },
      it: { base: 'collegato' },
      fr: { base: 'lié' },
      de: { base: 'verknüpft' },
      es: { base: 'vinculado' },
      ja: { base: 'リンク済みの' },
      pt: { base: 'ligado' },
    },
  },
  // What a console line can be (localization B45): kept at the top of the list, no longer kept
  // there, or used a short time ago. PINNED and UNPINNED are the states PIN and UNPIN leave a line in,
  // so transient like SAVED; each language's interface word (fr épinglé, es fijado, pt fixado).
  {
    id: 'PINNED',
    role: 'adjective',
    transient: true,
    description: 'kept at the top of a list',
    definition: stateGloss('OBJECT_THING', 'PIN'),
    emoji: '📌',
    forms: {
      en: { base: 'pinned' },
      it: { base: 'fissato' },
      fr: { base: 'épinglé' },
      de: { base: 'angeheftet' },
      es: { base: 'fijado' },
      ja: { base: 'ピン留め済みの', reading: 'ぴんどめずみの' },
      pt: { base: 'fixado' },
    },
  },
  {
    // "No longer pinned": the state, not the act. Italian and German say it so — the participle of
    // UNPIN (it "sbloccato", de "gelöst") would read "unlocked" and "solved" without the list around it.
    id: 'UNPINNED',
    role: 'adjective',
    transient: true,
    description: 'no longer kept at the top of a list',
    // The state UNPIN leaves, so it says UNPIN's own verbs: it "che si è sbloccato", de "den man
    // gelöst hat" — the ones the comment above keeps out of the adjective.
    definition: stateGloss('OBJECT_THING', 'UNPIN'),
    emoji: '📍',
    forms: {
      en: { base: 'unpinned' },
      it: { base: 'non più fissato' },
      fr: { base: 'désépinglé' },
      de: { base: 'nicht mehr angeheftet' },
      es: { base: 'desfijado' },
      ja: { base: 'ピン留め解除済みの', reading: 'ぴんどめかいじょずみの' },
      pt: { base: 'desafixado' },
    },
  },
  {
    // Used a short time ago: the console's recent lines. German and Japanese say what an interface
    // says, "zuletzt verwendet" ("zuletzt verwendete Zeilen": "letzt-" has no form standing alone) and
    // 最近使用された ("最近使用された行"; the predicate reads 最近使用されています). 最近の, "of late",
    // would predicate as *行は最近です.
    id: 'RECENT',
    role: 'adjective',
    description: 'used a short time ago',
    emoji: '🕑',
    forms: {
      en: { base: 'recent' },
      it: { base: 'recente' },
      fr: { base: 'récent' },
      de: { base: 'zuletzt verwendet' },
      es: { base: 'reciente' },
      ja: { base: '最近使用された', reading: 'さいきんしようされた' },
      pt: { base: 'recente' },
    },
  },
  {
    // Marked with a number, as a menu's rows and a pick's targets are, so a digit picks one
    // (localization B41). A participle, and the state numbering leaves a thing in: es/pt predicate it
    // with estar ("la fila está numerada"). Japanese 番号付きの, "with a number attached".
    id: 'NUMBERED',
    role: 'adjective',
    transient: true,
    description: 'marked with a number',
    // NUMBER_LABEL, not NUMBER: fr "un nombre", de "eine Zahl", ja 数 are a count, not a row's number.
    definition: subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'NUMBER_LABEL', definiteness: 'indefinite' }),
    emoji: '🔢',
    forms: {
      en: { base: 'numbered' },
      it: { base: 'numerato' },
      fr: { base: 'numéroté' },
      de: { base: 'nummeriert' },
      es: { base: 'numerado' },
      ja: { base: '番号付きの', reading: 'ばんごうつきの' },
      pt: { base: 'numerado' },
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
    definition: subjectGapGloss('OBJECT_THING', 'WORK', { aspect: 'progressive' }),
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
    definition: subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'TITLE', definiteness: 'indefinite', negative: true }),
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
    definition: subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'CONTENT', negative: true }),
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
    definition: stateGloss('OBJECT_THING', 'ACCEPT', { aspect: 'neutral' }),
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
    definition: stateGloss('OBJECT_THING', 'FIND', { aspect: 'neutral', modals: [{ verb: 'CAN', negative: true }] }),
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
    // Not known to whoever reads it: what the console calls a command, a word or a value it has no
    // entry for — "unknown command", it "comando sconosciuto", de "unbekannter Befehl" (localization
    // C21). Japanese software says 不明な ("unclear"), a na-adjective: 不明な命令.
    id: 'UNKNOWN',
    role: 'adjective',
    description: 'not known',
    definition: stateGloss('OBJECT_THING', 'KNOW', { aspect: 'neutral', negative: true }),
    emoji: '❓',
    forms: {
      en: { base: 'unknown' },
      it: { base: 'sconosciuto' },
      fr: { base: 'inconnu' },
      de: { base: 'unbekannt' },
      es: { base: 'desconocido' },
      ja: { base: '不明な', reading: 'ふめいな' },
      pt: { base: 'desconhecido' },
    },
  },
  {
    // UNKNOWN's antonym, seeded for DEFINITE's gloss: the definite determiner points at a known
    // object, the indefinite at an unknown one (localization C24). Japanese 既知の, the written word
    // for "already known" that pairs with 不明な; postnominal in the Romance languages ("un oggetto
    // noto"). Glossed as UNKNOWN is, without the negation: "that one knows" (Japanese 知る, the written
    // attributive of 誰もが知る).
    id: 'KNOWN',
    role: 'adjective',
    description: 'already known to whoever hears or reads it',
    definition: stateGloss('OBJECT_THING', 'KNOW', { aspect: 'neutral' }),
    emoji: '💡',
    forms: {
      en: { base: 'known' },
      it: { base: 'noto' },
      fr: { base: 'connu' },
      de: { base: 'bekannt' },
      es: { base: 'conocido' },
      ja: { base: '既知の', reading: 'きちの' },
      pt: { base: 'conhecido' },
    },
  },
  {
    // Not expected where it comes: a token the console's parser meets where nothing of its kind can
    // stand — "unexpected bracket", it "parentesi inattesa", de "unerwartete Klammer" (localization
    // C21). Japanese says it with the negative of 予期する, which inflects as an i-adjective: 予期しない.
    id: 'UNEXPECTED',
    role: 'adjective',
    description: 'not expected',
    definition: stateGloss('OBJECT_THING', 'EXPECT', { aspect: 'neutral', negative: true }),
    emoji: '⁉️',
    forms: {
      en: { base: 'unexpected' },
      it: { base: 'inatteso' },
      fr: { base: 'inattendu' },
      de: { base: 'unerwartet' },
      es: { base: 'inesperado' },
      ja: { base: '予期しない', reading: 'よきしない' },
      pt: { base: 'inesperado' },
    },
  },
  {
    id: 'SINGULAR',
    role: 'adjective',
    description: 'referring to one (grammar)',
    // The number values are said of a WORD. SOLE, not SINGULAR: "a singular object" would say the
    // word with itself (B58).
    definition: subjectGapGloss('WORD', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['SOLE'] }),
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
    // "One and others", not MANIFOLD: Japanese spells MANIFOLD 複数の, PLURAL's own word.
    definition: relativeGloss('WORD', {
      verbPhrase: { verb: 'INDICATE' },
      directObject: {
        conjuncts: [
          { concept: 'OBJECT_THING', definiteness: 'indefinite' },
          { concept: 'OBJECT_THING', definiteness: 'bare', number: 'plural', adjectives: ['OTHER'] },
        ],
        conjunction: 'and',
      },
    }),
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
    definition: relativeGloss('WORD', {
      verbPhrase: { verb: 'BE', negative: true },
      complements: { predicative: { phrase: { conjuncts: [{ concept: 'MALE' }, { concept: 'FEMALE' }], conjunction: 'or' } } },
    }),
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
    // The determiner values are said of a DETERMINER. Identifiability is whether the object is known.
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['KNOWN'] }),
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
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['UNKNOWN'] }),
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
    definition: stateGloss('DETERMINER', 'WRITE', { aspect: 'neutral', negative: true }),
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
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['NEAR'] }),
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
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['FAR'] }),
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
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'PART', definiteness: 'indefinite' }),
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
  // No gloss, by design (localization C24): "that negates" is circular through NEGATE ("to cause a
  // clause to be negative"), and "that indicates no object" reads as indicating nothing.
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
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'QUANTITY', definiteness: 'indefinite', adjectives: ['GREAT'] }),
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
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'QUANTITY', definiteness: 'indefinite', adjectives: ['SMALL'] }),
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
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'QUANTITY', definiteness: 'definite', adjectives: ['WHOLE'] }),
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
  // P09-E25's seven quantity determiners, named for the builder's determiner menu as MULTAL and
  // PAUCAL name "many" and "few". Each is glossed with the determiner it names, on the object the
  // DEFINITE / PROXIMAL glosses indicate: "that indicates each object".
  {
    id: 'DISTRIBUTIVE',
    role: 'adjective',
    description: 'taking the members of a set one at a time (grammar)',
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'each' }),
    emoji: '🍱',
    forms: {
      en: { base: 'distributive' },
      it: { base: 'distributivo' },
      fr: { base: 'distributif' },
      de: { base: 'distributiv' },
      es: { base: 'distributivo' },
      ja: { base: '配分の', reading: 'はいぶんの' },
      pt: { base: 'distributivo' },
    },
  },
  {
    id: 'EXHAUSTIVE',
    role: 'adjective',
    description: 'taking every member of a set one at a time, leaving none out (grammar)',
    // Not "every object": five languages spell every as each (ogni, chaque, jeder, cada), and the two
    // glosses would read alike. The exhaustive reading is "all objects".
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'all' }),
    emoji: '🧮',
    forms: {
      en: { base: 'exhaustive' },
      it: { base: 'esaustivo' },
      fr: { base: 'exhaustif' },
      de: { base: 'exhaustiv' },
      es: { base: 'exhaustivo' },
      ja: { base: '網羅的な', reading: 'もうらてきな' },
      pt: { base: 'exaustivo' },
    },
  },
  {
    id: 'DUAL',
    role: 'adjective',
    description: 'taking the two members of a pair together (grammar)',
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'both' }),
    emoji: '👯',
    forms: {
      en: { base: 'dual' },
      it: { base: 'duale' },
      fr: { base: 'duel' },
      de: { base: 'dual' },
      es: { base: 'dual' },
      ja: { base: '双数の', reading: 'そうすうの' },
      pt: { base: 'dual' },
    },
  },
  {
    id: 'PROPORTIONAL',
    role: 'adjective',
    description: 'taking a share of a set, as most of it (grammar)',
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'most' }),
    emoji: '🥧',
    forms: {
      en: { base: 'proportional' },
      it: { base: 'proporzionale' },
      fr: { base: 'proportionnel' },
      de: { base: 'proportional' },
      es: { base: 'proporcional' },
      ja: { base: '比率の', reading: 'ひりつの' },
      pt: { base: 'proporcional' },
    },
  },
  {
    id: 'MULTIPLE',
    role: 'adjective',
    description: 'naming more than one or two, but not many (grammar)',
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'several' }),
    emoji: '🎲',
    forms: {
      en: { base: 'multiple' },
      it: { base: 'multiplo' },
      fr: { base: 'multiple' },
      de: { base: 'mehrfach' },
      es: { base: 'múltiple' },
      ja: { base: '複数の', reading: 'ふくすうの' },
      pt: { base: 'múltiplo' },
    },
  },
  {
    id: 'SUFFICIENT',
    role: 'adjective',
    description: 'as much or as many as is needed',
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'enough' }),
    emoji: '🆗',
    forms: {
      en: { base: 'sufficient' },
      it: { base: 'sufficiente' },
      fr: { base: 'suffisant' },
      de: { base: 'ausreichend' },
      es: { base: 'suficiente' },
      ja: { base: '十分な', reading: 'じゅうぶんな' },
      pt: { base: 'suficiente' },
    },
  },
  {
    id: 'SIMILATIVE',
    role: 'adjective',
    description: 'naming something of the kind already meant (grammar)',
    definition: subjectGapGloss('DETERMINER', 'INDICATE', { object: 'OBJECT_THING', definiteness: 'such' }),
    emoji: '🪞',
    forms: {
      en: { base: 'similative' },
      it: { base: 'similativo' },
      fr: { base: 'similatif' },
      de: { base: 'similativ' },
      es: { base: 'similativo' },
      ja: { base: '類似の', reading: 'るいじの' },
      pt: { base: 'similativo' },
    },
  },
  // ── Ordinals ─────────────────────────────────────────────────────
  // Position in a sequence. Seeded so the pronoun chooser can name the three grammatical
  // persons in the UI language. German declines from an uninflected stem, but its endings
  // absorb a leading -e after a stem in -e (the "müde" rule), so the -e citation form
  // ("erste") both declines correctly and reads as a word on its own.
  //
  // The ordinals are what follows which, on FOLLOW with an object (localization C24): FIRST is what
  // every other object follows, SECOND what follows the first, THIRD what follows the second — German
  // "folgt auf", Spanish's a ("sigue al primer objeto"), Japanese's に (第一の物体に続く).
  {
    id: 'FIRST',
    role: 'adjective',
    description: 'coming before all others in a sequence',
    definition: namedAgentGloss('OBJECT_THING', 'FOLLOW', { concept: 'OBJECT_THING', definiteness: 'all', number: 'plural', adjectives: ['OTHER'] }),
    emoji: '🥇',
    forms: {
      en: { base: 'first' },
      it: { base: 'primo' },
      fr: { base: 'premier' },
      de: { base: 'erste', ordinal: '1' },
      es: { base: 'primero' },
      ja: { base: '第一の', reading: 'だいいちの' },
      pt: { base: 'primeiro' },
    },
  },
  {
    id: 'SECOND',
    role: 'adjective',
    description: 'coming after the first in a sequence',
    definition: subjectGapGloss('OBJECT_THING', 'FOLLOW', { object: 'OBJECT_THING', definiteness: 'definite', adjectives: ['FIRST'] }),
    emoji: '🥈',
    forms: {
      en: { base: 'second' },
      it: { base: 'secondo' },
      fr: { base: 'deuxième' },
      de: { base: 'zweite', ordinal: '1' },
      es: { base: 'segundo' },
      ja: { base: '第二の', reading: 'だいにの' },
      pt: { base: 'segundo' },
    },
  },
  {
    id: 'THIRD',
    role: 'adjective',
    description: 'coming after the second in a sequence',
    definition: subjectGapGloss('OBJECT_THING', 'FOLLOW', { object: 'OBJECT_THING', definiteness: 'definite', adjectives: ['SECOND'] }),
    emoji: '🥉',
    forms: {
      en: { base: 'third' },
      it: { base: 'terzo' },
      fr: { base: 'troisième' },
      de: { base: 'dritte', ordinal: '1' },
      es: { base: 'tercero' },
      ja: { base: '第三の', reading: 'だいさんの' },
      pt: { base: 'terceiro' },
    },
  },
  // The one straight after or straight before in a sequence — the next slot, the previous period
  // (localization B44). Postnominal in the Romance languages ("lo slot successivo", "la période
  // précédente"); German declines from the -e citation form, as the ordinals above do (nächste,
  // vorherige). Portuguese "seguinte", which follows the noun as the others do, where "próximo" would
  // lead it.
  {
    id: 'NEXT',
    role: 'adjective',
    description: 'coming straight after in a sequence',
    definition: subjectGapGloss('OBJECT_THING', 'FOLLOW'),
    emoji: '⏭️',
    forms: {
      en: { base: 'next' },
      it: { base: 'successivo' },
      fr: { base: 'suivant' },
      de: { base: 'nächste' },
      es: { base: 'siguiente' },
      ja: { base: '次の', reading: 'つぎの' },
      pt: { base: 'seguinte' },
    },
  },
  {
    id: 'PREVIOUS',
    role: 'adjective',
    description: 'coming straight before in a sequence',
    definition: subjectGapGloss('OBJECT_THING', 'PRECEDE'),
    emoji: '⏮️',
    forms: {
      en: { base: 'previous' },
      it: { base: 'precedente' },
      fr: { base: 'précédent' },
      de: { base: 'vorherige' },
      es: { base: 'anterior' },
      ja: { base: '前の', reading: 'まえの' },
      pt: { base: 'anterior' },
    },
  },
  // ── P09's core adjectives (localization B66) ─────────────────────
  // English last is two words elsewhere: the one after all others (ultimo, 最後の) and the period
  // before this one (scorso, この前の). LAST_FINAL precedes its noun in the Romance languages, as the
  // ordinals do ("l'ultimo giorno", "le dernier jour", "el último día"); LAST_PREVIOUS and NEXT_COMING
  // follow it ("la settimana scorsa", "la semaine dernière / prochaine", "la semana pasada"), which is
  // how French tells its two derniers apart. German letzte and nächste are -e citations, like erste,
  // and a predicate one is nominalised with the article, as an ordinal is ("ist der Letzte", A225).
  //
  // LAST_FINAL is FIRST read the other way, the subject gap where FIRST is the object gap: what
  // follows all other objects. LAST_PREVIOUS is the period this one follows, and NEXT_COMING the one
  // that follows it: "this" is NOW's deixis.
  {
    id: 'LAST_FINAL',
    role: 'adjective',
    description: 'coming after all others in a sequence',
    definition: subjectGapGloss('OBJECT_THING', 'FOLLOW', { object: 'OBJECT_THING', definiteness: 'all', number: 'plural', adjectives: ['OTHER'] }),
    emoji: '🏁',
    synonym: 'final',
    forms: {
      en: { base: 'last' },
      it: { base: 'ultimo' },
      fr: { base: 'dernier' },
      de: { base: 'letzte', ordinal: '1' },
      es: { base: 'último' },
      ja: { base: '最後の', reading: 'さいごの' },
      pt: { base: 'último' },
    },
  },
  {
    id: 'LAST_PREVIOUS',
    role: 'adjective',
    description: 'the one before this one, of a period of time',
    definition: namedAgentGloss('PERIOD_TIME', 'FOLLOW', { concept: 'PERIOD_TIME', definiteness: 'this' }),
    emoji: '⏪',
    synonym: 'most recent',
    forms: {
      en: { base: 'last' },
      it: { base: 'scorso' },
      fr: { base: 'dernier' },
      de: { base: 'letzte', ordinal: '1' },
      es: { base: 'pasado' },
      ja: { base: 'この前の', reading: 'このまえの' },
      pt: { base: 'passado' },
    },
  },
  {
    // "Next week": the seeded NEXT is the sequence sense (successivo, suivant, siguiente, seguinte,
    // "the following"), so the Romance languages need this word to say the coming period. English
    // next and German nächste render as NEXT's do, the way the two LASTs share last and letzte.
    id: 'NEXT_COMING',
    role: 'adjective',
    description: 'the one after this one, of a period of time',
    definition: subjectGapGloss('PERIOD_TIME', 'FOLLOW', { object: 'PERIOD_TIME', definiteness: 'this' }),
    emoji: '🔜',
    synonym: 'coming',
    forms: {
      en: { base: 'next' },
      it: { base: 'prossimo' },
      fr: { base: 'prochain' },
      de: { base: 'nächste', ordinal: '1' },
      es: { base: 'próximo' },
      ja: { base: '今度の', reading: 'こんどの' },
      pt: { base: 'próximo' },
    },
  },
  {
    // Not another: OTHER negated, one way only (OTHER is a literal primitive, so no pair defines only
    // each other). Before the noun in the Romance languages ("lo stesso giorno", "le même jour", "el
    // mismo día"), where after it, it means "itself" ("il giorno stesso", "le jour même"). German
    // gleich, since derselbe fuses with the article; Japanese 同じ joins its noun with no particle.
    // A predicate one keeps its article in five languages, which `predicate_article` marks: "the cat
    // is the same", "è lo stesso", "est le même", "es el mismo", "é o mesmo" (gleich and 同じです as
    // they stand).
    id: 'SAME',
    role: 'adjective',
    description: 'not different; the one already named',
    definition: subjectGapGloss('OBJECT_THING', 'BE', {
      complements: { predicative: { phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite', adjectives: ['OTHER'] } } },
      negative: true,
    }),
    emoji: '🟰',
    forms: {
      en: { base: 'same', predicate_article: '1' },
      it: { base: 'stesso', predicate_article: '1' },
      fr: { base: 'même', predicate_article: '1' },
      de: { base: 'gleich' },
      es: { base: 'mismo', predicate_article: '1' },
      ja: { base: '同じ', reading: 'おなじ' },
      pt: { base: 'mesmo', predicate_article: '1' },
    },
  },
  {
    // Of the United States. Literal by design: every gloss says the country's own name again
    // (Japanese アメリカ, Spanish estadounidense), or is true of Canada and Mexico too (North America);
    // CANINE is the precedent (localization B66, C24). Spanish estadounidense, the academies' form for
    // the United States. Japanese アメリカの, the の-adjective of FEMALE's 女性の.
    id: 'AMERICAN',
    role: 'adjective',
    description: 'of or from the United States of America',
    emoji: '🗽',
    forms: {
      en: { base: 'American' },
      it: { base: 'americano' },
      fr: { base: 'américain' },
      de: { base: 'amerikanisch' },
      es: { base: 'estadounidense' },
      // `relational`: the の links the subject to a country, not to a property of it, so the
      // predicate keeps it (猫はアメリカのです). Dropped, it would say the cat IS America (A246).
      ja: { base: 'アメリカの', relational: '1' },
      pt: { base: 'americano' },
    },
  },
  // English right is two words elsewhere too: correct (giusto, richtig, 正しい) and of the right-hand
  // side (destro, recht, 右の). RIGHT_CORRECT is what has no errors — UNTITLED's and EMPTY's shape, HAVE
  // negated with a bare plural object. RIGHT_SIDE is literal by design, the verdict the RIGHT adverb
  // has (localization C25): whatever tells the two sides apart says "right" again.
  {
    id: 'RIGHT_CORRECT',
    role: 'adjective',
    description: 'correct; without error',
    definition: subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'ERROR', number: 'plural', negative: true }),
    emoji: '🎯',
    synonym: 'correct',
    // Evaluative: the clause it is said of goes into the Romance subjunctive — "è giusto che si
    // agisca" (`content_clause_mood`, P09-E4).
    forms: {
      en: { base: 'right' },
      it: { base: 'giusto', content_clause_mood: 'subjunctive' },
      // Juste, not bon: "la bonne réponse" is the idiom, but bon is GOOD's word.
      fr: { base: 'juste', content_clause_mood: 'subjunctive' },
      de: { base: 'richtig' },
      es: { base: 'correcto', content_clause_mood: 'subjunctive' },
      ja: { base: '正しい', reading: 'ただしい' },
      pt: { base: 'certo', content_clause_mood: 'subjunctive' },
    },
  },
  {
    id: 'RIGHT_SIDE',
    role: 'adjective',
    description: 'on the side of the body opposite the heart',
    emoji: '🫱',
    synonym: 'right-hand',
    forms: {
      en: { base: 'right' },
      it: { base: 'destro' },
      fr: { base: 'droit' },
      de: { base: 'recht' },
      es: { base: 'derecho' },
      ja: { base: '右の', reading: 'みぎの' },
      pt: { base: 'direito' },
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
    // The generic "one" stands for no one person, which is to say for anyone: people at large.
    definition: subjectGapGloss('PRONOUN', 'INDICATE', { object: 'PERSON', definiteness: 'all', number: 'plural' }),
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
    //
    // On an indefinite pronoun it is a word of its own (P09-E36), `after_pronoun`: English *else*
    // ("something else", "nobody else"), French *d'autre* ("quelqu'un d'autre"), German the
    // lowercase *anderes* ("etwas anderes"), Spanish *más* ("alguien más"), Portuguese *mais*. Where a
    // pronoun fuses with it instead (it *qualcos'altro*, fr *autre chose*, es *otra cosa*) the
    // pronoun carries that as `with_other`. Japanese keeps 別の before the pronoun (別の何か) and says
    // the negative with ほかに, `before_negative_pronoun`: ほかに何も食べません, "eats nothing else".
    id: 'OTHER',
    role: 'adjective',
    description: 'different from the one already named',
    emoji: '🔁',
    forms: {
      en: { base: 'other', after_pronoun: 'else' },
      it: { base: 'altro', after_pronoun: 'altro' },
      fr: { base: 'autre', after_pronoun: 'autre' },
      de: { base: 'andere', after_pronoun: 'andere' },
      es: { base: 'otro', after_pronoun: 'más' },
      ja: { base: '別の', reading: 'べつの', before_negative_pronoun: 'ほかに' },
      pt: { base: 'outro', after_pronoun: 'mais' },
    },
  },
  {
    // Facing the other way, or as far from it as can be: BACKWARDS is "in the opposite direction"
    // (localization C25). Postnominal in the Romance languages ("la direzione opposta"). Japanese
    // 反対の, not 逆の: BACKWARDS is 逆方向に, and its gloss would say its own word.
    id: 'OPPOSITE',
    role: 'adjective',
    description: 'facing the other way; as different as can be',
    emoji: '🔃',
    forms: {
      en: { base: 'opposite' },
      it: { base: 'opposto' },
      fr: { base: 'opposé' },
      de: { base: 'entgegengesetzt' },
      es: { base: 'opuesto' },
      ja: { base: '反対の', reading: 'はんたいの' },
      pt: { base: 'oposto' },
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
    // Italian "reggere" is the grammar's verb for it: the main clause is the "proposizione reggente".
    definition: subjectGapGloss('CLAUSE', 'GOVERN', { object: 'CLAUSE', number: 'plural', adjectives: ['OTHER'] }),
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
  // CONDITION is "a conditional clause", so the gloss is its description instead: the clause another
  // one depends on, on DEPEND, whose object takes its own preposition in six languages and に in
  // Japanese — en "on which", it "dalla quale", fr "dont", de "von dem" (localization C24).
  {
    id: 'CONDITIONAL',
    role: 'adjective',
    description: 'setting the condition another clause depends on (grammar)',
    definition: namedAgentGloss('CLAUSE', 'DEPEND', { concept: 'CLAUSE', adjectives: ['OTHER'] }),
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
    definition: namedAgentGloss('CLAUSE', 'LINK', 'CONJUNCTION', {
      complements: { terminus: { phrase: { concept: 'CLAUSE', definiteness: 'indefinite', adjectives: ['OTHER'] } } },
    }),
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
  // A clause that depends on another — its object clause, its adverbial clause or its infinitive
  // complement (P09-E12 D9): the Romance "proposizione subordinata", "proposition subordonnée",
  // "oración subordinada"; German "untergeordnet", the counterpart of MAIN's "übergeordnet"; Japanese
  // compounds it on 節 like the others (従属節).
  {
    id: 'SUBORDINATE',
    role: 'adjective',
    description: 'depending on another clause (grammar)',
    definition: subjectGapGloss('CLAUSE', 'DEPEND', { object: 'CLAUSE', adjectives: ['OTHER'] }),
    emoji: '🪜',
    forms: {
      en: { base: 'subordinate' },
      it: { base: 'subordinato' },
      fr: { base: 'subordonné' },
      de: { base: 'untergeordnet' },
      es: { base: 'subordinado' },
      ja: { base: '従属', reading: 'じゅうぞく' },
      pt: { base: 'subordinado' },
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
    // The kinds of conjunction are said of a CONJUNCTION, feminine in German ("die").
    definition: subjectGapGloss('CONJUNCTION', 'ADD', {
      object: 'PHRASE',
      definiteness: 'indefinite',
      complements: { terminus: { phrase: { concept: 'PHRASE', definiteness: 'indefinite', adjectives: ['OTHER'] } } },
    }),
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
    definition: subjectGapGloss('CONJUNCTION', 'LINK', { object: 'OPTION', number: 'plural' }),
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
    definition: subjectGapGloss('CONJUNCTION', 'LINK', { object: 'CLAUSE', number: 'plural', adjectives: ['OPPOSITE'] }),
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
    definition: subjectGapGloss('CONJUNCTION', 'EXPRESS', {
      object: 'CLAUSE',
      definiteness: 'definite',
      adjectives: ['PREVIOUS'],
      complements: { instrumental: { phrase: { concept: 'WORD', definiteness: 'bare', number: 'plural', adjectives: ['OTHER'] } } },
    }),
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
    definition: subjectGapGloss('CONJUNCTION', 'USE', {
      object: 'CLAUSE',
      definiteness: 'definite',
      adjectives: ['PREVIOUS'],
      complements: {
        objectPredicative: { phrase: { concept: 'CAUSE', definiteness: 'indefinite' }, specifiers: [{ kind: 'predication', value: 'essive' }] },
      },
    }),
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
    definition: subjectGapGloss('CONJUNCTION', 'INDICATE', { object: 'ACTION', definiteness: 'definite', adjectives: ['NEXT'] }),
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
  {
    // Having to do with place: the relation /in, /through, /under … set on a place or a route, "a
    // spatial relationship" (localization B46, B47). TEMPORAL's sibling, and shaped like it.
    id: 'SPATIAL',
    role: 'adjective',
    description: 'having to do with place',
    // What the /in … /front relations set: how a place stands to the object it is the place of.
    definition: relativeGloss('RELATIONSHIP', {
      verbPhrase: { verb: 'INDICATE' },
      directObject: { concept: 'PLACE', definiteness: 'definite', possessor: { concept: 'OBJECT_THING', definiteness: 'indefinite' } },
    }),
    emoji: '📐',
    forms: {
      en: { base: 'spatial' },
      it: { base: 'spaziale' },
      fr: { base: 'spatial' },
      de: { base: 'räumlich' },
      es: { base: 'espacial' },
      ja: { base: '空間的な', reading: 'くうかんてきな' },
      pt: { base: 'espacial' },
    },
  },
  // ── P09-E24's relational adjectives (localization B88) ─────────────
  // C24's IMPERSONAL shape, "that indicates …", where *indicates* reads "concerns". Each follows the
  // noun in the Romance languages with no flag (una legge nazionale, un parti politique).
  {
    // Japanese 国の, a の-adjective like AMERICAN's アメリカの; 全国的な is "nationwide".
    id: 'NATIONAL',
    role: 'adjective',
    description: 'of or belonging to a whole nation',
    definition: subjectGapGloss('OBJECT_THING', 'INDICATE', { object: 'NATION', definiteness: 'indefinite' }),
    emoji: '🏳️',
    forms: {
      en: { base: 'national' },
      it: { base: 'nazionale' },
      fr: { base: 'national' },
      de: { base: 'national' },
      es: { base: 'nacional' },
      // `relational`, as AMERICAN's: the predicate keeps the の (法律は国のです), or it says the law IS a
      // country (A246).
      ja: { base: '国の', reading: 'くにの', relational: '1' },
      pt: { base: 'nacional' },
    },
  },
  {
    // Of people living together: B77's COMMUNITY, since SOCIETY is not seeded.
    id: 'SOCIAL',
    role: 'adjective',
    description: 'of society, of people living together',
    definition: subjectGapGloss('OBJECT_THING', 'INDICATE', { object: 'COMMUNITY', definiteness: 'indefinite' }),
    emoji: '👥',
    forms: {
      en: { base: 'social' },
      it: { base: 'sociale' },
      fr: { base: 'social' },
      de: { base: 'sozial' },
      es: { base: 'social' },
      ja: { base: '社会的な', reading: 'しゃかいてきな' },
      pt: { base: 'social' },
    },
  },
  {
    // Of government and the state: B76's GOVERNMENT.
    id: 'POLITICAL',
    role: 'adjective',
    description: 'of government and the state',
    definition: subjectGapGloss('OBJECT_THING', 'INDICATE', { object: 'GOVERNMENT', definiteness: 'indefinite' }),
    emoji: '🏛️',
    forms: {
      en: { base: 'political' },
      it: { base: 'politico' },
      fr: { base: 'politique' },
      de: { base: 'politisch' },
      es: { base: 'político' },
      ja: { base: '政治的な', reading: 'せいじてきな' },
      pt: { base: 'político' },
    },
  },
  {
    // Open to all: OPEN_ADJECTIVE with E2's purpose, so Spanish and Portuguese take estar, the
    // transient word's own copula. French publique is a FR_ADJ_IRREGULAR row (B87, B88).
    id: 'PUBLIC',
    role: 'adjective',
    description: 'open to or shared by all people',
    definition: subjectGapGloss('OBJECT_THING', 'BE', {
      predicate: 'OPEN_ADJECTIVE',
      complements: { purpose: { phrase: { concept: 'PERSON', definiteness: 'all', number: 'plural' } } },
    }),
    emoji: '🏞️',
    forms: {
      en: { base: 'public' },
      it: { base: 'pubblico' },
      fr: { base: 'public' },
      de: { base: 'öffentlich' },
      es: { base: 'público' },
      // `relational`, as NATIONAL's 国の: 場所は公共のです, not *場所は公共です.
      ja: { base: '公共の', reading: 'こうきょうの', relational: '1' },
      pt: { base: 'público' },
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
    definition: relativeGloss('WORD', {
      verbPhrase: { verb: 'BE', negative: true },
      complements: { predicative: { phrase: { conjuncts: [{ concept: 'POSITIVE' }, { concept: 'NEGATIVE' }], conjunction: 'or' } } },
    }),
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
    // The voice that makes the agent the subject (grammar) — not the ACTIVE of a running machine,
    // which is a sense of its own. German and Japanese name the voices with what are nouns in their
    // own grammars (Aktiv, 能動), which is what the label wants: the adjective alone, and Japanese
    // strips the attributive の.
    id: 'ACTIVE_VOICE',
    role: 'adjective',
    synonym: 'grammar',
    description: 'presenting the agent of an event as the subject (grammar)',
    // The voices are said of a CLAUSE (VOICE: which participant a clause makes its subject).
    definition: subjectGapGloss('CLAUSE', 'USE', {
      object: 'AGENT_GRAMMAR',
      definiteness: 'definite',
      complements: {
        objectPredicative: { phrase: { concept: 'SUBJECT_GRAMMAR', definiteness: 'definite' }, specifiers: [{ kind: 'predication', value: 'essive' }] },
      },
    }),
    emoji: '➡️',
    forms: {
      en: { base: 'active' },
      it: { base: 'attivo' },
      fr: { base: 'actif' },
      de: { base: 'aktiv' },
      es: { base: 'activo' },
      ja: { base: '能動の', reading: 'のうどうの' },
      pt: { base: 'ativo' },
    },
  },
  {
    // The voice that makes the patient the subject and demotes the agent to a by-phrase (grammar).
    id: 'PASSIVE',
    role: 'adjective',
    synonym: 'grammar',
    description: 'presenting the patient of an event as the subject (grammar)',
    // The *direct* object: Spanish OBJECT_GRAMMAR alone is "complemento", which reads as any complement.
    definition: subjectGapGloss('CLAUSE', 'USE', {
      object: 'OBJECT_GRAMMAR',
      definiteness: 'definite',
      adjectives: ['DIRECT'],
      complements: {
        objectPredicative: { phrase: { concept: 'SUBJECT_GRAMMAR', definiteness: 'definite' }, specifiers: [{ kind: 'predication', value: 'essive' }] },
      },
    }),
    emoji: '⬅️',
    forms: {
      en: { base: 'passive' },
      it: { base: 'passivo' },
      fr: { base: 'passif' },
      de: { base: 'passiv' },
      es: { base: 'pasivo' },
      ja: { base: '受動の', reading: 'じゅどうの' },
      pt: { base: 'passivo' },
    },
  },
  {
    id: 'PROGRESSIVE',
    role: 'adjective',
    description: 'presenting an event as in progress (grammar)',
    // The aspects are said of a VERB, and each is how it shows its action.
    definition: subjectGapGloss('VERB', 'SHOW', {
      object: 'ACTION',
      definiteness: 'indefinite',
      complements: {
        objectPredicative: { phrase: { concept: 'PROCESS', definiteness: 'indefinite' }, specifiers: [{ kind: 'predication', value: 'essive' }] },
      },
    }),
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
    definition: relativeGloss('VERB', {
      verbPhrase: { verb: 'SHOW' },
      directObject: { concept: 'ACTION', definiteness: 'indefinite', relative: { verbPhrase: { verb: 'BEGIN', aspect: 'prospective' } } },
    }),
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
    definition: subjectGapGloss('VERB', 'SHOW', {
      object: 'ACTION',
      definiteness: 'indefinite',
      complements: {
        objectPredicative: { phrase: { concept: 'STATE', definiteness: 'indefinite' }, specifiers: [{ kind: 'predication', value: 'essive' }] },
      },
    }),
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
    // Not the reverse: NEGATE is glossed "to cause a clause to be negative", so NEGATIVE cannot be
    // "that negates".
    definition: subjectGapGloss('WORD', 'NEGATE', { negative: true }),
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
    // As the app's "semantic phrase creator" means it: phrases built out of meanings, not out of words.
    definition: stateGloss('PHRASE', 'MAKE', {
      aspect: 'neutral',
      complements: { instrumental: { phrase: { concept: 'MEANING', definiteness: 'bare', number: 'plural' } } },
    }),
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
    definition: subjectGapGloss('PATH', 'GO', {
      negative: true,
      complements: { route: { phrase: { concept: 'PLACE', definiteness: 'indefinite', adjectives: ['OTHER'] } } },
    }),
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
    definition: subjectGapGloss('PATH', 'GO', {
      complements: { route: { phrase: { concept: 'PLACE', definiteness: 'indefinite', adjectives: ['OTHER'] } } },
    }),
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
    // The word map's edges are RELATIONSHIPs: an unconnected word is one no edge reaches.
    definition: subjectGapGloss('WORD', 'HAVE', { object: 'RELATIONSHIP', definiteness: 'no', number: 'plural' }),
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
    definition: stateGloss('OBJECT_THING', 'HIDE'),
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
    // The two states OPEN and CLOSE leave behind, each seeded for the other verb's gloss: OPEN is "to
    // cause an object not to be closed" and CLOSE "to cause an object not to be open" (localization
    // C28), HIDE's negated shape, because each verb asserting its own state would cite its own
    // participle. Transient, like HIDDEN: es/pt predicate them with estar ("está cerrada"). Japanese
    // takes the た-form of the verbs the corpus seeds, 閉じた and 開いた (ひらいた, as OPEN reads
    // 開く), which the engine turns into 閉じている / 閉じていない as a predicate. The open one's id is
    // suffixed because the verb holds the plain one, as CAUSE_VERB's is beside the noun CAUSE.
    id: 'CLOSED',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'not open; shut',
    emoji: '🔒',
    forms: {
      en: { base: 'closed' },
      it: { base: 'chiuso' },
      fr: { base: 'fermé' },
      de: { base: 'geschlossen' },
      es: { base: 'cerrado' },
      ja: { base: '閉じた', reading: 'とじた' },
      pt: { base: 'fechado' },
    },
  },
  {
    id: 'OPEN_ADJECTIVE',
    role: 'adjective',
    transient: true, // ascribes a transient state → es/pt predicate with estar (A47)
    description: 'not closed; allowing access',
    emoji: '🔓',
    forms: {
      en: { base: 'open' },
      it: { base: 'aperto' },
      fr: { base: 'ouvert' },
      de: { base: 'offen' },
      es: { base: 'abierto' },
      ja: { base: '開いた', reading: 'ひらいた' },
      pt: { base: 'aberto' },
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
    // SEE, not APPEAR or HIDE: their glosses are "to become visible" and "to cause an object not to be visible".
    definition: stateGloss('OBJECT_THING', 'SEE', { aspect: 'neutral', modals: ['CAN'] }),
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
  // ── The definition adjectives of localization B52, B53 and B58 ─────
  {
    id: 'SWEET',
    role: 'adjective',
    description: 'tasting of sugar',
    definition: subjectGapGloss('FOOD', 'HAVE', { object: 'SUGAR' }),
    emoji: '🍬',
    forms: {
      en: { base: 'sweet' },
      it: { base: 'dolce' },
      fr: { base: 'sucré' },
      de: { base: 'süß' },
      es: { base: 'dulce' },
      ja: { base: '甘い', reading: 'あまい' },
      pt: { base: 'doce' },
    },
  },
  {
    id: 'SOLID',
    role: 'adjective',
    description: 'keeping its shape, neither liquid nor gas',
    // What neither a liquid nor a gas can say. Not on GROUND, whose gloss is "solid substance".
    definition: subjectGapGloss('SUBSTANCE', 'FLOW', { negative: true }),
    emoji: '🧱',
    forms: {
      en: { base: 'solid' },
      it: { base: 'solido' },
      fr: { base: 'solide' },
      de: { base: 'fest' },
      es: { base: 'sólido' },
      ja: { base: '固体の', reading: 'こたいの' },
      pt: { base: 'sólido' },
    },
  },
  {
    // PRESENT, PAST and FUTURE are the ordinary time words, kept apart from the grammatical
    // tense nouns they gloss (PRESENT_TENSE and the rest, localization B58).
    id: 'PRESENT',
    role: 'adjective',
    description: 'happening now',
    // The three time words differ by HAPPEN's tense and aspect alone, said of a PROCESS (masculine in
    // the five that agree, so it "è successo", fr "est arrivé" read as "what has happened"). None
    // routes back through the tense nouns (PRESENT_TENSE, …) whose glosses stand on them.
    definition: subjectGapGloss('PROCESS', 'HAPPEN', { modifier: 'NOW' }),
    emoji: '⌚',
    synonym: 'current',
    forms: {
      en: { base: 'present' },
      it: { base: 'presente' },
      fr: { base: 'présent' },
      de: { base: 'gegenwärtig' },
      es: { base: 'presente' },
      ja: { base: '現在の', reading: 'げんざいの' },
      pt: { base: 'presente' },
    },
  },
  {
    id: 'PAST',
    role: 'adjective',
    description: 'already happened',
    definition: subjectGapGloss('PROCESS', 'HAPPEN', { aspect: 'resultative' }),
    emoji: '📜',
    forms: {
      en: { base: 'past' },
      it: { base: 'passato' },
      fr: { base: 'passé' },
      de: { base: 'vergangen' },
      es: { base: 'pasado' },
      ja: { base: '過去の', reading: 'かこの' },
      pt: { base: 'passado' },
    },
  },
  {
    id: 'FUTURE',
    role: 'adjective',
    description: 'yet to happen',
    definition: subjectGapGloss('PROCESS', 'HAPPEN', { tense: 'future' }),
    emoji: '🔮',
    forms: {
      en: { base: 'future' },
      it: { base: 'futuro' },
      fr: { base: 'futur' },
      de: { base: 'zukünftig' },
      es: { base: 'futuro' },
      ja: { base: '未来の', reading: 'みらいの' },
      pt: { base: 'futuro' },
    },
  },
  {
    // SOLE and MANIFOLD say in ordinary words what SINGULAR and PLURAL say as grammar, so the
    // number categories can be glossed without defining a word with itself (localization B58).
    // P09's *own* (localization C37) — the adjective of "my own cat", not the verb OWN ("to have as
    // property"), whose id it yields to as OPEN_ADJECTIVE yields to OPEN. It exists only beside a
    // possessor, so no phrase lists it among its adjectives: a `possessorOwn` flag on the noun
    // phrase is what turns it on, and the translator hands it to the engines as the first adjective
    // (see NounPhrase.possessorOwn). Prenominal in all six European languages — Italian keeping its
    // article ("il proprio gatto") and German declining it ("sein eigener Kater") — and in Japanese
    // a word that **replaces** the possessor: 自分の猫, never 彼の自分の猫. After a genitive possessor
    // Japanese says 自身の instead (猫自身の本), which the lexeme carries as `after_possessor`.
    id: 'OWN_ADJECTIVE',
    role: 'adjective',
    slot: 'possessorOwn',
    description: 'belonging to the one named and to no other',
    // What "my own" adds to "my": nobody else owns it. A headless relative on the owning verb with a
    // negated agent (C23's shape), which is the only construct-free lead that does not define
    // *owned* instead — "that a possessor owns" says the wrong word twice over.
    definition: namedAgentGloss('OBJECT_THING', 'OWN', { concept: 'PERSON', definiteness: 'no', adjectives: ['OTHER'] }),
    synonym: 'own',
    emoji: '🫱',
    forms: {
      en: { base: 'own' },
      it: { base: 'proprio' },
      fr: { base: 'propre' },
      de: { base: 'eigen' },
      es: { base: 'propio' },
      ja: { base: '自分の', reading: 'じぶんの', after_possessor: '自身の', after_possessor_reading: 'じしんの' },
      pt: { base: 'próprio' },
    },
  },
  {
    id: 'SOLE',
    role: 'adjective',
    description: 'being the only one',
    emoji: '☝️',
    synonym: 'only',
    forms: {
      en: { base: 'sole' },
      it: { base: 'unico' },
      fr: { base: 'unique' },
      de: { base: 'einzig' },
      es: { base: 'único' },
      ja: { base: '単一の', reading: 'たんいつの' },
      pt: { base: 'único' },
    },
  },
  {
    id: 'MANIFOLD',
    role: 'adjective',
    description: 'being more than one',
    emoji: '🖐️',
    synonym: 'multiple',
    forms: {
      en: { base: 'manifold' },
      it: { base: 'molteplice' },
      fr: { base: 'multiple' },
      de: { base: 'mehrfach' },
      es: { base: 'múltiple' },
      ja: { base: '複数の', reading: 'ふくすうの' },
      pt: { base: 'múltiplo' },
    },
  },
];
