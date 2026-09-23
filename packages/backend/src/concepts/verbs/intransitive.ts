import type { ConceptSeed } from '../types.js';
import { infinitiveGloss } from './gloss.js';

// Plain intransitive verbs.
export const intransitiveVerbs: ConceptSeed[] = [
  {
    id: 'RUN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'direction', 'source', 'route', 'cause'],
    description: 'to move quickly on foot',
    // "to move fast": QUICK is an adjective, the adverb is FAST (localization C17).
    definition: infinitiveGloss('MOVE_ONESELF', { modifier: 'FAST' }),
    emoji: '🏃',
    isA: 'MOVE_ONESELF',
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
    id: 'JUMP',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'direction', 'source', 'route', 'cause'],
    description: 'to propel oneself into the air',
    // "to move into the air" (localization C18). The differentia is where the motion ends up, which
    // is a `direction` naming a relation rather than a plain goal — "into the air", not "to the
    // air". Definite: French and Portuguese spell no zero-article mass noun after a preposition.
    definition: infinitiveGloss('MOVE_ONESELF', {
      complements: {
        direction: {
          phrase: { concept: 'AIR', definiteness: 'definite' },
          specifiers: [{ kind: 'path', value: 'in' }],
        },
      },
    }),
    emoji: '🦘',
    isA: 'MOVE_ONESELF',
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
    complements: ['manner', 'locative', 'direction', 'source', 'route', 'cause'],
    description: 'to move toward the speaker or a place',
    // "to move to the speaker" (localization B35): the deixis is a noun, the goal of the `direction`
    // complement. GO's gloss says where the motion starts, COME's whom it ends at. Italian says it
    // "verso il parlante", MOVE_ONESELF's own preposition: "dal parlante" would read as leaving.
    definition: infinitiveGloss('MOVE_ONESELF', {
      complements: { direction: { phrase: { concept: 'SPEAKER', definiteness: 'definite' } } },
    }),
    emoji: '🚶',
    isA: 'MOVE_ONESELF',
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
    complements: ['manner', 'cause', 'locative'],
    description: 'to weep; to shed tears',
    definition: infinitiveGloss('SHED', 'TEAR', 'plural'),
    emoji: '😭',
    synonym: 'weep',
    isA: 'SHED',
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

  // Suffering as a state one is in, with no object: "I suffer, not because of you" — what it is
  // suffered from is the cause complement, as CRY's is. The transitive "suffer a loss" is not seeded.
  {
    id: 'SUFFER',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to feel pain or distress',
    // LOVE's counterpart under the same genus: "to feel affection", "to feel sorrow". PAIN, the
    // physical half of the description, is not seeded (localization A31).
    definition: infinitiveGloss('FEEL', 'SORROW'),
    emoji: '😣',
    isA: 'FEEL',
    forms: {
      en: {
        base: 'suffer',
        '1sg_present': 'suffer', '2sg_present': 'suffer', '3sg_present': 'suffers',
        '1pl_present': 'suffer', '2pl_present': 'suffer', '3pl_present': 'suffer',
        past: 'suffered',
      },
      it: {
        base: 'soffrire',
        '1sg_present': 'soffro', '2sg_present': 'soffri', '3sg_present': 'soffre',
        '1pl_present': 'soffriamo', '2pl_present': 'soffrite', '3pl_present': 'soffrono',
        '1sg_past': 'soffrii', '2sg_past': 'soffristi', '3sg_past': 'soffrì',
        '1pl_past': 'soffrimmo', '2pl_past': 'soffriste', '3pl_past': 'soffrirono',
        '1sg_future': 'soffrirò', '2sg_future': 'soffrirai', '3sg_future': 'soffrirà',
        '1pl_future': 'soffriremo', '2pl_future': 'soffrirete', '3pl_future': 'soffriranno',
      },
      fr: {
        base: 'souffrir',
        '1sg_present': 'souffre', '2sg_present': 'souffres', '3sg_present': 'souffre',
        '1pl_present': 'souffrons', '2pl_present': 'souffrez', '3pl_present': 'souffrent',
        '1sg_past': 'souffris', '2sg_past': 'souffris', '3sg_past': 'souffrit',
        '1pl_past': 'souffrîmes', '2pl_past': 'souffrîtes', '3pl_past': 'souffrirent',
        '1sg_future': 'souffrirai', '2sg_future': 'souffriras', '3sg_future': 'souffrira',
        '1pl_future': 'souffrirons', '2pl_future': 'souffrirez', '3pl_future': 'souffriront',
      },
      de: {
        base: 'leiden',
        '1sg_present': 'leide', '2sg_present': 'leidest', '3sg_present': 'leidet',
        '1pl_present': 'leiden', '2pl_present': 'leidet', '3pl_present': 'leiden',
        '1sg_past': 'litt', '2sg_past': 'littest', '3sg_past': 'litt',
        '1pl_past': 'litten', '2pl_past': 'littet', '3pl_past': 'litten',
      },
      es: {
        base: 'sufrir',
        '1sg_present': 'sufro', '2sg_present': 'sufres', '3sg_present': 'sufre',
        '1pl_present': 'sufrimos', '2pl_present': 'sufrís', '3pl_present': 'sufren',
        '1sg_past': 'sufrí', '2sg_past': 'sufriste', '3sg_past': 'sufrió',
        '1pl_past': 'sufrimos', '2pl_past': 'sufristeis', '3pl_past': 'sufrieron',
        '1sg_future': 'sufriré', '2sg_future': 'sufrirás', '3sg_future': 'sufrirá',
        '1pl_future': 'sufriremos', '2pl_future': 'sufriréis', '3pl_future': 'sufrirán',
      },
      ja: {
        base: '苦しむ',
        reading: 'くるしむ',
        masu_present: '苦しみます',
        masu_present_reading: 'くるしみます',
      },
      pt: {
        base: 'sofrer',
        '1sg_present': 'sofro', '2sg_present': 'sofre', '3sg_present': 'sofre',
        '1pl_present': 'sofremos', '2pl_present': 'sofrem', '3pl_present': 'sofrem',
        '1sg_past': 'sofri', '2sg_past': 'sofreu', '3sg_past': 'sofreu',
        '1pl_past': 'sofremos', '2pl_past': 'sofreram', '3pl_past': 'sofreram',
        '1sg_future': 'sofrerei', '2sg_future': 'sofrerá', '3sg_future': 'sofrerá',
        '1pl_future': 'sofreremos', '2pl_future': 'sofrerão', '3pl_future': 'sofrerão',
      },
    },
  },

  {
    id: 'BURN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to be on fire; to undergo combustion',
    // "to produce flames" (localization B33): PRODUCE in its "give off" sense, what a burning thing
    // does. Not "to be consumed by fire" (CONSUME is the ingest sense: fr consommer, de konsumieren,
    // ja 摂取), and not "to produce fire", which reads as SET_ON_FIRE's "to create fire". Japanese
    // 炎を出す does not define 燃える with itself.
    definition: infinitiveGloss('PRODUCE', 'FLAME', 'plural'),
    emoji: '🔥',
    synonym: 'be on fire',
    forms: {
      en: {
        base: 'burn',
        '1sg_present': 'burn', '2sg_present': 'burn', '3sg_present': 'burns',
        '1pl_present': 'burn', '2pl_present': 'burn', '3pl_present': 'burn',
        past: 'burned',
      },
      it: {
        base: 'bruciare',
        '1sg_present': 'brucio', '2sg_present': 'bruci', '3sg_present': 'brucia',
        '1pl_present': 'bruciamo', '2pl_present': 'bruciate', '3pl_present': 'bruciano',
        '1sg_past': 'bruciai', '2sg_past': 'bruciasti', '3sg_past': 'bruciò',
        '1pl_past': 'bruciammo', '2pl_past': 'bruciaste', '3pl_past': 'bruciarono',
        '1sg_future': 'brucerò', '2sg_future': 'brucerai', '3sg_future': 'brucerà',
        '1pl_future': 'bruceremo', '2pl_future': 'brucerete', '3pl_future': 'bruceranno',
      },
      fr: {
        base: 'brûler',
        '1sg_present': 'brûle', '2sg_present': 'brûles', '3sg_present': 'brûle',
        '1pl_present': 'brûlons', '2pl_present': 'brûlez', '3pl_present': 'brûlent',
        '1sg_past': 'brûlai', '2sg_past': 'brûlas', '3sg_past': 'brûla',
        '1pl_past': 'brûlâmes', '2pl_past': 'brûlâtes', '3pl_past': 'brûlèrent',
        '1sg_future': 'brûlerai', '2sg_future': 'brûleras', '3sg_future': 'brûlera',
        '1pl_future': 'brûlerons', '2pl_future': 'brûlerez', '3pl_future': 'brûleront',
      },
      de: {
        base: 'brennen',
        '1sg_present': 'brenne', '2sg_present': 'brennst', '3sg_present': 'brennt',
        '1pl_present': 'brennen', '2pl_present': 'brennt', '3pl_present': 'brennen',
        '1sg_past': 'brannte', '2sg_past': 'branntest', '3sg_past': 'brannte',
        '1pl_past': 'brannten', '2pl_past': 'branntet', '3pl_past': 'brannten',
      },
      es: {
        base: 'arder',
        '1sg_present': 'ardo', '2sg_present': 'ardes', '3sg_present': 'arde',
        '1pl_present': 'ardemos', '2pl_present': 'ardéis', '3pl_present': 'arden',
        '1sg_past': 'ardí', '2sg_past': 'ardiste', '3sg_past': 'ardió',
        '1pl_past': 'ardimos', '2pl_past': 'ardisteis', '3pl_past': 'ardieron',
        '1sg_future': 'arderé', '2sg_future': 'arderás', '3sg_future': 'arderá',
        '1pl_future': 'arderemos', '2pl_future': 'arderéis', '3pl_future': 'arderán',
      },
      ja: {
        base: '燃える',
        reading: 'もえる',
        masu_present: '燃えます',
        masu_present_reading: 'もえます',
      },
      pt: {
        base: 'arder',
        '1sg_present': 'ardo', '2sg_present': 'arde', '3sg_present': 'arde',
        '1pl_present': 'ardemos', '2pl_present': 'ardem', '3pl_present': 'ardem',
        '1sg_past': 'ardi', '2sg_past': 'ardeu', '3sg_past': 'ardeu',
        '1pl_past': 'ardemos', '2pl_past': 'arderam', '3pl_past': 'arderam',
        '1sg_future': 'arderei', '2sg_future': 'arderá', '3sg_future': 'arderá',
        '1pl_future': 'arderemos', '2pl_future': 'arderão', '3pl_future': 'arderão',
      },
    },
  },

  {
    id: 'COLLAPSE',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to fall down suddenly, losing all support',
    // "to move to the ground suddenly" (localization B34). "Down" is the place the motion ends at,
    // a `direction` goal, which leaves the one adverb slot for SUDDENLY. Definite: the ground. Italian
    // and French say the goal "verso il suolo" / "vers le sol", MOVE_ONESELF's own preposition.
    definition: infinitiveGloss('MOVE_ONESELF', {
      modifier: 'SUDDENLY',
      complements: { direction: { phrase: { concept: 'GROUND', definiteness: 'definite' } } },
    }),
    emoji: '🏚️',
    isA: 'MOVE_ONESELF',
    forms: {
      en: {
        base: 'collapse',
        '1sg_present': 'collapse', '2sg_present': 'collapse', '3sg_present': 'collapses',
        '1pl_present': 'collapse', '2pl_present': 'collapse', '3pl_present': 'collapse',
        past: 'collapsed',
      },
      it: {
        base: 'crollare',
        '1sg_present': 'crollo', '2sg_present': 'crolli', '3sg_present': 'crolla',
        '1pl_present': 'crolliamo', '2pl_present': 'crollate', '3pl_present': 'crollano',
        '1sg_past': 'crollai', '2sg_past': 'crollasti', '3sg_past': 'crollò',
        '1pl_past': 'crollammo', '2pl_past': 'crollaste', '3pl_past': 'crollarono',
        '1sg_future': 'crollerò', '2sg_future': 'crollerai', '3sg_future': 'crollerà',
        '1pl_future': 'crolleremo', '2pl_future': 'crollerete', '3pl_future': 'crolleranno',
      },
      fr: {
        // Inherently reflexive: the clitic rides along inside each form, as in the es motion
        // verbs, so it stays adjacent to the verb under negation ("ne s'effondre pas"). The
        // 1pl/2pl forms carry only the second pronoun — the subject supplies the first.
        base: 's\'effondrer',
        '1sg_present': 'm\'effondre', '2sg_present': 't\'effondres', '3sg_present': 's\'effondre',
        '1pl_present': 'nous effondrons', '2pl_present': 'vous effondrez', '3pl_present': 's\'effondrent',
        '1sg_past': 'm\'effondrai', '2sg_past': 't\'effondras', '3sg_past': 's\'effondra',
        '1pl_past': 'nous effondrâmes', '2pl_past': 'vous effondrâtes', '3pl_past': 's\'effondrèrent',
        '1sg_future': 'm\'effondrerai', '2sg_future': 't\'effondreras', '3sg_future': 's\'effondrera',
        '1pl_future': 'nous effondrerons', '2pl_future': 'vous effondrerez', '3pl_future': 's\'effondreront',
      },
      de: {
        // "einstürzen" would be the idiomatic verb, but its prefix separates ("stürzt ein"),
        // which the clause builder cannot place; "kollabieren" is regular and stays whole.
        base: 'kollabieren',
        '1sg_present': 'kollabiere', '2sg_present': 'kollabierst', '3sg_present': 'kollabiert',
        '1pl_present': 'kollabieren', '2pl_present': 'kollabiert', '3pl_present': 'kollabieren',
        '1sg_past': 'kollabierte', '2sg_past': 'kollabiertest', '3sg_past': 'kollabierte',
        '1pl_past': 'kollabierten', '2pl_past': 'kollabiertet', '3pl_past': 'kollabierten',
      },
      es: {
        base: 'colapsar',
        '1sg_present': 'colapso', '2sg_present': 'colapsas', '3sg_present': 'colapsa',
        '1pl_present': 'colapsamos', '2pl_present': 'colapsáis', '3pl_present': 'colapsan',
        '1sg_past': 'colapsé', '2sg_past': 'colapsaste', '3sg_past': 'colapsó',
        '1pl_past': 'colapsamos', '2pl_past': 'colapsasteis', '3pl_past': 'colapsaron',
        '1sg_future': 'colapsaré', '2sg_future': 'colapsarás', '3sg_future': 'colapsará',
        '1pl_future': 'colapsaremos', '2pl_future': 'colapsaréis', '3pl_future': 'colapsarán',
      },
      ja: {
        base: '崩れる',
        reading: 'くずれる',
        masu_present: '崩れます',
        masu_present_reading: 'くずれます',
      },
      pt: {
        base: 'desabar',
        '1sg_present': 'desabo', '2sg_present': 'desaba', '3sg_present': 'desaba',
        '1pl_present': 'desabamos', '2pl_present': 'desabam', '3pl_present': 'desabam',
        '1sg_past': 'desabei', '2sg_past': 'desabou', '3sg_past': 'desabou',
        '1pl_past': 'desabamos', '2pl_past': 'desabaram', '3pl_past': 'desabaram',
        '1sg_future': 'desabarei', '2sg_future': 'desabará', '3sg_future': 'desabará',
        '1pl_future': 'desabaremos', '2pl_future': 'desabarão', '3pl_future': 'desabarão',
      },
    },
  },
  // The dwelling sense of "live" — where someone has their home — not "to be alive". The two are
  // separate verbs in four languages (it abitare / vivere, fr habiter / vivre, de wohnen / leben,
  // pt morar / viver), so the picker gloss says which one this is; es vivir and ja 住む cover
  // both. Seeded for B32's place glosses, which need a verb licensing a `locative` complement:
  // HOME "a place where one lives", HOUSE "a building where one lives".
  {
    id: 'LIVE',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to have one\'s home in a place',
    definition: infinitiveGloss('BE', {
      complements: { locative: { phrase: { concept: 'HOME', definiteness: 'definite' } } },
    }),
    emoji: '🏘️',
    synonym: 'dwell',
    forms: {
      en: {
        base: 'live',
        '1sg_present': 'live', '2sg_present': 'live', '3sg_present': 'lives',
        '1pl_present': 'live', '2pl_present': 'live', '3pl_present': 'live',
        past: 'lived',
      },
      it: {
        base: 'abitare',
        '1sg_present': 'abito', '2sg_present': 'abiti', '3sg_present': 'abita',
        '1pl_present': 'abitiamo', '2pl_present': 'abitate', '3pl_present': 'abitano',
        '1sg_past': 'abitai', '2sg_past': 'abitasti', '3sg_past': 'abitò',
        '1pl_past': 'abitammo', '2pl_past': 'abitaste', '3pl_past': 'abitarono',
        '1sg_future': 'abiterò', '2sg_future': 'abiterai', '3sg_future': 'abiterà',
        '1pl_future': 'abiteremo', '2pl_future': 'abiterete', '3pl_future': 'abiteranno',
      },
      fr: {
        base: 'habiter',
        // An h muet, as a noun's `elides` says: "j'habite", "n'habite pas", "d'habiter" (A227).
        elides: '1',
        '1sg_present': 'habite', '2sg_present': 'habites', '3sg_present': 'habite',
        '1pl_present': 'habitons', '2pl_present': 'habitez', '3pl_present': 'habitent',
        '1sg_past': 'habitai', '2sg_past': 'habitas', '3sg_past': 'habita',
        '1pl_past': 'habitâmes', '2pl_past': 'habitâtes', '3pl_past': 'habitèrent',
        '1sg_future': 'habiterai', '2sg_future': 'habiteras', '3sg_future': 'habitera',
        '1pl_future': 'habiterons', '2pl_future': 'habiterez', '3pl_future': 'habiteront',
      },
      de: {
        base: 'wohnen',
        '1sg_present': 'wohne', '2sg_present': 'wohnst', '3sg_present': 'wohnt',
        '1pl_present': 'wohnen', '2pl_present': 'wohnt', '3pl_present': 'wohnen',
        '1sg_past': 'wohnte', '2sg_past': 'wohntest', '3sg_past': 'wohnte',
        '1pl_past': 'wohnten', '2pl_past': 'wohntet', '3pl_past': 'wohnten',
      },
      es: {
        base: 'vivir',
        '1sg_present': 'vivo', '2sg_present': 'vives', '3sg_present': 'vive',
        '1pl_present': 'vivimos', '2pl_present': 'vivís', '3pl_present': 'viven',
        '1sg_past': 'viví', '2sg_past': 'viviste', '3sg_past': 'vivió',
        '1pl_past': 'vivimos', '2pl_past': 'vivisteis', '3pl_past': 'vivieron',
        '1sg_future': 'viviré', '2sg_future': 'vivirás', '3sg_future': 'vivirá',
        '1pl_future': 'viviremos', '2pl_future': 'viviréis', '3pl_future': 'vivirán',
      },
      ja: {
        // 住む names where one *is*, not where an act goes on, so its place takes に and never the
        // で of an ordinary locative: 東京に住む, 猫は家に住みます (`locative_particle`, A190).
        base: '住む',
        reading: 'すむ',
        masu_present: '住みます',
        masu_present_reading: 'すみます',
        locative_particle: 'に',
      },
      pt: {
        base: 'morar',
        '1sg_present': 'moro', '2sg_present': 'mora', '3sg_present': 'mora',
        '1pl_present': 'moramos', '2pl_present': 'moram', '3pl_present': 'moram',
        '1sg_past': 'morei', '2sg_past': 'morou', '3sg_past': 'morou',
        '1pl_past': 'moramos', '2pl_past': 'moraram', '3pl_past': 'moraram',
        '1sg_future': 'morarei', '2sg_future': 'morará', '3sg_future': 'morará',
        '1pl_future': 'moraremos', '2pl_future': 'morarão', '3pl_future': 'morarão',
      },
    },
  },

  // The other sense of English "live" (and of Spanish "vivir"): to be alive, not to dwell. LIVE is the
  // dwelling one, which four languages say with their own verb (abitare, habiter, wohnen, 住む, morar),
  // so the two are split as COLD and COLD_CLIMATE are. Seeded for LIFE's gloss, "the state of a being
  // that lives" (localization C26).
  {
    id: 'LIVE_ALIVE',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to be alive',
    emoji: '💓',
    synonym: 'be alive',
    forms: {
      en: {
        base: 'live',
        '1sg_present': 'live', '2sg_present': 'live', '3sg_present': 'lives',
        '1pl_present': 'live', '2pl_present': 'live', '3pl_present': 'live',
        past: 'lived',
      },
      it: {
        base: 'vivere',
        '1sg_present': 'vivo', '2sg_present': 'vivi', '3sg_present': 'vive',
        '1pl_present': 'viviamo', '2pl_present': 'vivete', '3pl_present': 'vivono',
        '1sg_past': 'vissi', '2sg_past': 'vivesti', '3sg_past': 'visse',
        '1pl_past': 'vivemmo', '2pl_past': 'viveste', '3pl_past': 'vissero',
        '1sg_future': 'vivrò', '2sg_future': 'vivrai', '3sg_future': 'vivrà',
        '1pl_future': 'vivremo', '2pl_future': 'vivrete', '3pl_future': 'vivranno',
      },
      fr: {
        base: 'vivre',
        '1sg_present': 'vis', '2sg_present': 'vis', '3sg_present': 'vit',
        '1pl_present': 'vivons', '2pl_present': 'vivez', '3pl_present': 'vivent',
        '1sg_past': 'vécus', '2sg_past': 'vécus', '3sg_past': 'vécut',
        '1pl_past': 'vécûmes', '2pl_past': 'vécûtes', '3pl_past': 'vécurent',
        '1sg_future': 'vivrai', '2sg_future': 'vivras', '3sg_future': 'vivra',
        '1pl_future': 'vivrons', '2pl_future': 'vivrez', '3pl_future': 'vivront',
      },
      de: {
        base: 'leben',
        '1sg_present': 'lebe', '2sg_present': 'lebst', '3sg_present': 'lebt',
        '1pl_present': 'leben', '2pl_present': 'lebt', '3pl_present': 'leben',
        '1sg_past': 'lebte', '2sg_past': 'lebtest', '3sg_past': 'lebte',
        '1pl_past': 'lebten', '2pl_past': 'lebtet', '3pl_past': 'lebten',
      },
      es: {
        base: 'vivir',
        '1sg_present': 'vivo', '2sg_present': 'vives', '3sg_present': 'vive',
        '1pl_present': 'vivimos', '2pl_present': 'vivís', '3pl_present': 'viven',
        '1sg_past': 'viví', '2sg_past': 'viviste', '3sg_past': 'vivió',
        '1pl_past': 'vivimos', '2pl_past': 'vivisteis', '3pl_past': 'vivieron',
        '1sg_future': 'viviré', '2sg_future': 'vivirás', '3sg_future': 'vivirá',
        '1pl_future': 'viviremos', '2pl_future': 'viviréis', '3pl_future': 'vivirán',
      },
      ja: {
        base: '生きる',
        reading: 'いきる',
        masu_present: '生きます',
        masu_present_reading: 'いきます',
      },
      pt: {
        base: 'viver',
        '1sg_present': 'vivo', '2sg_present': 'vive', '3sg_present': 'vive',
        '1pl_present': 'vivemos', '2pl_present': 'vivem', '3pl_present': 'vivem',
        '1sg_past': 'vivi', '2sg_past': 'viveu', '3sg_past': 'viveu',
        '1pl_past': 'vivemos', '2pl_past': 'viveram', '3pl_past': 'viveram',
        '1sg_future': 'viverei', '2sg_future': 'viverá', '3sg_future': 'viverá',
        '1pl_future': 'viveremos', '2pl_future': 'viverão', '3pl_future': 'viverão',
      },
    },
  },

  // Remaining where one is: LEAVE_BEHIND's differentia, "to cause an object to stay" (localization
  // B61). The place is a `locative`, which Japanese 残る takes with に (`locative_particle`, as 住む
  // does: 家に残ります). Spanish quedarse is pronominal, as moverse is: the clitic rides inside each
  // finite form.
  {
    id: 'STAY',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to remain in the same place',
    // "still to be in a place" (localization B61): KEEP's shape on BE, the dictionary's "to continue
    // to be in the same place" without the continuative the engine lacks. Japanese 場所にまだいる is
    // the existential a person takes.
    definition: infinitiveGloss('BE', {
      modifier: 'STILL',
      complements: { locative: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } } },
    }),
    emoji: '🧍',
    forms: {
      en: {
        base: 'stay',
        '1sg_present': 'stay', '2sg_present': 'stay', '3sg_present': 'stays',
        '1pl_present': 'stay', '2pl_present': 'stay', '3pl_present': 'stay',
        past: 'stayed',
      },
      it: {
        base: 'restare',
        '1sg_present': 'resto', '2sg_present': 'resti', '3sg_present': 'resta',
        '1pl_present': 'restiamo', '2pl_present': 'restate', '3pl_present': 'restano',
        '1sg_past': 'restai', '2sg_past': 'restasti', '3sg_past': 'restò',
        '1pl_past': 'restammo', '2pl_past': 'restaste', '3pl_past': 'restarono',
        '1sg_future': 'resterò', '2sg_future': 'resterai', '3sg_future': 'resterà',
        '1pl_future': 'resteremo', '2pl_future': 'resterete', '3pl_future': 'resteranno',
      },
      fr: {
        base: 'rester',
        '1sg_present': 'reste', '2sg_present': 'restes', '3sg_present': 'reste',
        '1pl_present': 'restons', '2pl_present': 'restez', '3pl_present': 'restent',
        '1sg_past': 'restai', '2sg_past': 'restas', '3sg_past': 'resta',
        '1pl_past': 'restâmes', '2pl_past': 'restâtes', '3pl_past': 'restèrent',
        '1sg_future': 'resterai', '2sg_future': 'resteras', '3sg_future': 'restera',
        '1pl_future': 'resterons', '2pl_future': 'resterez', '3pl_future': 'resteront',
      },
      de: {
        base: 'bleiben',
        '1sg_present': 'bleibe', '2sg_present': 'bleibst', '3sg_present': 'bleibt',
        '1pl_present': 'bleiben', '2pl_present': 'bleibt', '3pl_present': 'bleiben',
        '1sg_past': 'blieb', '2sg_past': 'bliebst', '3sg_past': 'blieb',
        '1pl_past': 'blieben', '2pl_past': 'bliebt', '3pl_past': 'blieben',
      },
      es: {
        base: 'quedarse',
        '1sg_present': 'me quedo', '2sg_present': 'te quedas', '3sg_present': 'se queda',
        '1pl_present': 'nos quedamos', '2pl_present': 'os quedáis', '3pl_present': 'se quedan',
        '1sg_past': 'me quedé', '2sg_past': 'te quedaste', '3sg_past': 'se quedó',
        '1pl_past': 'nos quedamos', '2pl_past': 'os quedasteis', '3pl_past': 'se quedaron',
        '1sg_future': 'me quedaré', '2sg_future': 'te quedarás', '3sg_future': 'se quedará',
        '1pl_future': 'nos quedaremos', '2pl_future': 'os quedaréis', '3pl_future': 'se quedarán',
      },
      ja: {
        base: '残る',
        reading: 'のこる',
        masu_present: '残ります',
        masu_present_reading: 'のこります',
        locative_particle: 'に',
      },
      pt: {
        base: 'ficar',
        '1sg_present': 'fico', '2sg_present': 'fica', '3sg_present': 'fica',
        '1pl_present': 'ficamos', '2pl_present': 'ficam', '3pl_present': 'ficam',
        '1sg_past': 'fiquei', '2sg_past': 'ficou', '3sg_past': 'ficou',
        '1pl_past': 'ficamos', '2pl_past': 'ficaram', '3pl_past': 'ficaram',
        '1sg_future': 'ficarei', '2sg_future': 'ficará', '3sg_future': 'ficará',
        '1pl_future': 'ficaremos', '2pl_future': 'ficarão', '3pl_future': 'ficarão',
      },
    },
  },

  // Buying and selling in one verb — the differentia MARKET's gloss needs, since a relative clause
  // holds one verbPhrase and cannot coordinate "buys and sells" (B32). Intransitive on purpose:
  // German "handeln" and French "commercer" take no direct object (one handelt *mit* something),
  // so "a place where one trades" is the shape that renders in all seven. Japanese 売買する is the
  // suru compound of 売 sell and 買 buy, which is exactly the sense wanted.
  {
    id: 'TRADE',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause', 'instrumental'],
    description: 'to buy and sell goods',
    definition: infinitiveGloss('BUY', 'OBJECT_THING', 'plural'),
    emoji: '🤝',
    forms: {
      en: {
        base: 'trade',
        '1sg_present': 'trade', '2sg_present': 'trade', '3sg_present': 'trades',
        '1pl_present': 'trade', '2pl_present': 'trade', '3pl_present': 'trade',
        past: 'traded',
      },
      it: {
        base: 'commerciare',
        '1sg_present': 'commercio', '2sg_present': 'commerci', '3sg_present': 'commercia',
        '1pl_present': 'commerciamo', '2pl_present': 'commerciate', '3pl_present': 'commerciano',
        '1sg_past': 'commerciai', '2sg_past': 'commerciasti', '3sg_past': 'commerciò',
        '1pl_past': 'commerciammo', '2pl_past': 'commerciaste', '3pl_past': 'commerciarono',
        '1sg_future': 'commercerò', '2sg_future': 'commercerai', '3sg_future': 'commercerà',
        '1pl_future': 'commerceremo', '2pl_future': 'commercerete', '3pl_future': 'commerceranno',
      },
      fr: {
        // -cer keeps its soft c with a cedilla before a/o: nous commerçons.
        base: 'commercer',
        '1sg_present': 'commerce', '2sg_present': 'commerces', '3sg_present': 'commerce',
        '1pl_present': 'commerçons', '2pl_present': 'commercez', '3pl_present': 'commercent',
        '1sg_past': 'commerçai', '2sg_past': 'commerças', '3sg_past': 'commerça',
        '1pl_past': 'commerçâmes', '2pl_past': 'commerçâtes', '3pl_past': 'commercèrent',
        '1sg_future': 'commercerai', '2sg_future': 'commerceras', '3sg_future': 'commercera',
        '1pl_future': 'commercerons', '2pl_future': 'commercerez', '3pl_future': 'commerceront',
      },
      de: {
        // -eln verbs drop the stem -e- in the 1sg: ich handle, not ich handele.
        base: 'handeln',
        '1sg_present': 'handle', '2sg_present': 'handelst', '3sg_present': 'handelt',
        '1pl_present': 'handeln', '2pl_present': 'handelt', '3pl_present': 'handeln',
        '1sg_past': 'handelte', '2sg_past': 'handeltest', '3sg_past': 'handelte',
        '1pl_past': 'handelten', '2pl_past': 'handeltet', '3pl_past': 'handelten',
      },
      es: {
        base: 'comerciar',
        '1sg_present': 'comercio', '2sg_present': 'comercias', '3sg_present': 'comercia',
        '1pl_present': 'comerciamos', '2pl_present': 'comerciáis', '3pl_present': 'comercian',
        '1sg_past': 'comercié', '2sg_past': 'comerciaste', '3sg_past': 'comerció',
        '1pl_past': 'comerciamos', '2pl_past': 'comerciasteis', '3pl_past': 'comerciaron',
        '1sg_future': 'comerciaré', '2sg_future': 'comerciarás', '3sg_future': 'comerciará',
        '1pl_future': 'comerciaremos', '2pl_future': 'comerciaréis', '3pl_future': 'comerciarán',
      },
      ja: {
        base: '売買する',
        reading: 'ばいばいする',
        masu_present: '売買します',
        masu_present_reading: 'ばいばいします',
      },
      pt: {
        base: 'comerciar',
        '1sg_present': 'comercio', '2sg_present': 'comercia', '3sg_present': 'comercia',
        '1pl_present': 'comerciamos', '2pl_present': 'comerciam', '3pl_present': 'comerciam',
        '1sg_past': 'comerciei', '2sg_past': 'comerciou', '3sg_past': 'comerciou',
        '1pl_past': 'comerciamos', '2pl_past': 'comerciaram', '3pl_past': 'comerciaram',
        '1sg_future': 'comerciarei', '2sg_future': 'comerciará', '3sg_future': 'comerciará',
        '1pl_future': 'comerciaremos', '2pl_future': 'comerciarão', '3pl_future': 'comerciarão',
      },
    },
  },

  // Doing anything at all: the most general activity verb, which the modals' definitions govern —
  // "to be able to act", "to be obliged to act", "to desire to act" (localization C09). German
  // "handeln" is TRADE's word too; both senses are the one verb there ("schnell handeln", "mit
  // Waren handeln"). Japanese 行動する is a suru compound.
  {
    id: 'ACT',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause', 'instrumental'],
    description: 'to do something; to take action',
    synonym: 'take action',
    emoji: '⚡',
    forms: {
      en: {
        base: 'act',
        '1sg_present': 'act', '2sg_present': 'act', '3sg_present': 'acts',
        '1pl_present': 'act', '2pl_present': 'act', '3pl_present': 'act',
        past: 'acted',
      },
      it: {
        // An -isc- verb of the third conjugation: agisco, agisci, but agiamo, agite.
        base: 'agire',
        '1sg_present': 'agisco', '2sg_present': 'agisci', '3sg_present': 'agisce',
        '1pl_present': 'agiamo', '2pl_present': 'agite', '3pl_present': 'agiscono',
        '1sg_past': 'agii', '2sg_past': 'agisti', '3sg_past': 'agì',
        '1pl_past': 'agimmo', '2pl_past': 'agiste', '3pl_past': 'agirono',
        '1sg_future': 'agirò', '2sg_future': 'agirai', '3sg_future': 'agirà',
        '1pl_future': 'agiremo', '2pl_future': 'agirete', '3pl_future': 'agiranno',
      },
      fr: {
        // A second-group verb: nous agissons, and a passé simple in -is.
        base: 'agir',
        '1sg_present': 'agis', '2sg_present': 'agis', '3sg_present': 'agit',
        '1pl_present': 'agissons', '2pl_present': 'agissez', '3pl_present': 'agissent',
        '1sg_past': 'agis', '2sg_past': 'agis', '3sg_past': 'agit',
        '1pl_past': 'agîmes', '2pl_past': 'agîtes', '3pl_past': 'agirent',
        '1sg_future': 'agirai', '2sg_future': 'agiras', '3sg_future': 'agira',
        '1pl_future': 'agirons', '2pl_future': 'agirez', '3pl_future': 'agiront',
      },
      de: {
        // -eln verbs drop the stem -e- in the 1sg: ich handle, not ich handele.
        base: 'handeln',
        '1sg_present': 'handle', '2sg_present': 'handelst', '3sg_present': 'handelt',
        '1pl_present': 'handeln', '2pl_present': 'handelt', '3pl_present': 'handeln',
        '1sg_past': 'handelte', '2sg_past': 'handeltest', '3sg_past': 'handelte',
        '1pl_past': 'handelten', '2pl_past': 'handeltet', '3pl_past': 'handelten',
      },
      es: {
        // The stressed u takes an accent where the ending is unstressed: actúo, actúas, actúan.
        base: 'actuar',
        '1sg_present': 'actúo', '2sg_present': 'actúas', '3sg_present': 'actúa',
        '1pl_present': 'actuamos', '2pl_present': 'actuáis', '3pl_present': 'actúan',
        '1sg_past': 'actué', '2sg_past': 'actuaste', '3sg_past': 'actuó',
        '1pl_past': 'actuamos', '2pl_past': 'actuasteis', '3pl_past': 'actuaron',
        '1sg_future': 'actuaré', '2sg_future': 'actuarás', '3sg_future': 'actuará',
        '1pl_future': 'actuaremos', '2pl_future': 'actuaréis', '3pl_future': 'actuarán',
      },
      ja: {
        base: '行動する',
        reading: 'こうどうする',
        masu_present: '行動します',
        masu_present_reading: 'こうどうします',
      },
      pt: {
        // g → j before a and o: eu ajo (and the subjunctive aja the command is built on).
        base: 'agir',
        '1sg_present': 'ajo', '2sg_present': 'age', '3sg_present': 'age',
        '1pl_present': 'agimos', '2pl_present': 'agem', '3pl_present': 'agem',
        '1sg_past': 'agi', '2sg_past': 'agiu', '3sg_past': 'agiu',
        '1pl_past': 'agimos', '2pl_past': 'agiram', '3pl_past': 'agiram',
        '1sg_future': 'agirei', '2sg_future': 'agirá', '3sg_future': 'agirá',
        '1pl_future': 'agiremos', '2pl_future': 'agirão', '3pl_future': 'agirão',
      },
    },
  },

  // Doing what a thing is for, said of a machine or a key rather than of a person: "the key works",
  // it "il tasto funziona", de "die Taste funktioniert", ja キーは動作します. ACT is the person's act
  // (de "handeln", ja 行動する), which a key does not do. The help overlay says where the keys work
  // (localization C22). Not the toil of WORK in "go to work", hence the synonym.
  {
    id: 'WORK',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause', 'instrumental'],
    description: 'to do what it is made for; to function',
    synonym: 'function',
    emoji: '⚙️',
    forms: {
      en: {
        base: 'work',
        '1sg_present': 'work', '2sg_present': 'work', '3sg_present': 'works',
        '1pl_present': 'work', '2pl_present': 'work', '3pl_present': 'work',
        past: 'worked',
      },
      it: {
        base: 'funzionare',
        '1sg_present': 'funziono', '2sg_present': 'funzioni', '3sg_present': 'funziona',
        '1pl_present': 'funzioniamo', '2pl_present': 'funzionate', '3pl_present': 'funzionano',
        '1sg_past': 'funzionai', '2sg_past': 'funzionasti', '3sg_past': 'funzionò',
        '1pl_past': 'funzionammo', '2pl_past': 'funzionaste', '3pl_past': 'funzionarono',
        '1sg_future': 'funzionerò', '2sg_future': 'funzionerai', '3sg_future': 'funzionerà',
        '1pl_future': 'funzioneremo', '2pl_future': 'funzionerete', '3pl_future': 'funzioneranno',
      },
      fr: {
        base: 'fonctionner',
        '1sg_present': 'fonctionne', '2sg_present': 'fonctionnes', '3sg_present': 'fonctionne',
        '1pl_present': 'fonctionnons', '2pl_present': 'fonctionnez', '3pl_present': 'fonctionnent',
        '1sg_past': 'fonctionnai', '2sg_past': 'fonctionnas', '3sg_past': 'fonctionna',
        '1pl_past': 'fonctionnâmes', '2pl_past': 'fonctionnâtes', '3pl_past': 'fonctionnèrent',
        '1sg_future': 'fonctionnerai', '2sg_future': 'fonctionneras', '3sg_future': 'fonctionnera',
        '1pl_future': 'fonctionnerons', '2pl_future': 'fonctionnerez', '3pl_future': 'fonctionneront',
      },
      de: {
        base: 'funktionieren',
        '1sg_present': 'funktioniere', '2sg_present': 'funktionierst', '3sg_present': 'funktioniert',
        '1pl_present': 'funktionieren', '2pl_present': 'funktioniert', '3pl_present': 'funktionieren',
        '1sg_past': 'funktionierte', '2sg_past': 'funktioniertest', '3sg_past': 'funktionierte',
        '1pl_past': 'funktionierten', '2pl_past': 'funktioniertet', '3pl_past': 'funktionierten',
      },
      es: {
        base: 'funcionar',
        '1sg_present': 'funciono', '2sg_present': 'funcionas', '3sg_present': 'funciona',
        '1pl_present': 'funcionamos', '2pl_present': 'funcionáis', '3pl_present': 'funcionan',
        '1sg_past': 'funcioné', '2sg_past': 'funcionaste', '3sg_past': 'funcionó',
        '1pl_past': 'funcionamos', '2pl_past': 'funcionasteis', '3pl_past': 'funcionaron',
        '1sg_future': 'funcionaré', '2sg_future': 'funcionarás', '3sg_future': 'funcionará',
        '1pl_future': 'funcionaremos', '2pl_future': 'funcionaréis', '3pl_future': 'funcionarán',
      },
      ja: {
        base: '動作する',
        reading: 'どうさする',
        masu_present: '動作します',
        masu_present_reading: 'どうさします',
        label: '動作',
        label_reading: 'どうさ',
      },
      pt: {
        base: 'funcionar',
        '1sg_present': 'funciono', '2sg_present': 'funciona', '3sg_present': 'funciona',
        '1pl_present': 'funcionamos', '2pl_present': 'funcionam', '3pl_present': 'funcionam',
        '1sg_past': 'funcionei', '2sg_past': 'funcionou', '3sg_past': 'funcionou',
        '1pl_past': 'funcionamos', '2pl_past': 'funcionaram', '3pl_past': 'funcionaram',
        '1sg_future': 'funcionarei', '2sg_future': 'funcionará', '3sg_future': 'funcionará',
        '1pl_future': 'funcionaremos', '2pl_future': 'funcionarão', '3pl_future': 'funcionarão',
      },
    },
  },

  {
    // P09's work (localization B62): a person's labour, "the man works". WORK above is the machine
    // sense ("the key works", funzionare). Glossed by what it is for, "to act to acquire money", as
    // WORK_NOUN is "an action with which one acquires money": the two share ACQUIRE + MONEY, one from
    // the verb's end and one from the noun's, and neither names the other.
    id: 'WORK_LABOUR',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause', 'instrumental'],
    description: 'to do a job; to labour',
    definition: infinitiveGloss('ACT', { purpose: { verb: 'ACQUIRE', object: 'MONEY' } }),
    synonym: 'labour',
    emoji: '⚒️',
    forms: {
      en: {
        base: 'work',
        '1sg_present': 'work', '2sg_present': 'work', '3sg_present': 'works',
        '1pl_present': 'work', '2pl_present': 'work', '3pl_present': 'work',
        past: 'worked',
      },
      it: {
        base: 'lavorare',
        '1sg_present': 'lavoro', '2sg_present': 'lavori', '3sg_present': 'lavora',
        '1pl_present': 'lavoriamo', '2pl_present': 'lavorate', '3pl_present': 'lavorano',
        '1sg_past': 'lavorai', '2sg_past': 'lavorasti', '3sg_past': 'lavorò',
        '1pl_past': 'lavorammo', '2pl_past': 'lavoraste', '3pl_past': 'lavorarono',
        '1sg_future': 'lavorerò', '2sg_future': 'lavorerai', '3sg_future': 'lavorerà',
        '1pl_future': 'lavoreremo', '2pl_future': 'lavorerete', '3pl_future': 'lavoreranno',
      },
      fr: {
        base: 'travailler',
        '1sg_present': 'travaille', '2sg_present': 'travailles', '3sg_present': 'travaille',
        '1pl_present': 'travaillons', '2pl_present': 'travaillez', '3pl_present': 'travaillent',
        '1sg_past': 'travaillai', '2sg_past': 'travaillas', '3sg_past': 'travailla',
        '1pl_past': 'travaillâmes', '2pl_past': 'travaillâtes', '3pl_past': 'travaillèrent',
        '1sg_future': 'travaillerai', '2sg_future': 'travailleras', '3sg_future': 'travaillera',
        '1pl_future': 'travaillerons', '2pl_future': 'travaillerez', '3pl_future': 'travailleront',
      },
      de: {
        base: 'arbeiten',
        '1sg_present': 'arbeite', '2sg_present': 'arbeitest', '3sg_present': 'arbeitet',
        '1pl_present': 'arbeiten', '2pl_present': 'arbeitet', '3pl_present': 'arbeiten',
        '1sg_past': 'arbeitete', '2sg_past': 'arbeitetest', '3sg_past': 'arbeitete',
        '1pl_past': 'arbeiteten', '2pl_past': 'arbeitetet', '3pl_past': 'arbeiteten',
        '2sg_imperative': 'arbeite', // a stem in -t keeps the du -e
      },
      es: {
        base: 'trabajar',
        '1sg_present': 'trabajo', '2sg_present': 'trabajas', '3sg_present': 'trabaja',
        '1pl_present': 'trabajamos', '2pl_present': 'trabajáis', '3pl_present': 'trabajan',
        '1sg_past': 'trabajé', '2sg_past': 'trabajaste', '3sg_past': 'trabajó',
        '1pl_past': 'trabajamos', '2pl_past': 'trabajasteis', '3pl_past': 'trabajaron',
        '1sg_future': 'trabajaré', '2sg_future': 'trabajarás', '3sg_future': 'trabajará',
        '1pl_future': 'trabajaremos', '2pl_future': 'trabajaréis', '3pl_future': 'trabajarán',
      },
      ja: {
        base: '働く',
        reading: 'はたらく',
        masu_present: '働きます',
        masu_present_reading: 'はたらきます',
      },
      pt: {
        base: 'trabalhar',
        '1sg_present': 'trabalho', '2sg_present': 'trabalha', '3sg_present': 'trabalha',
        '1pl_present': 'trabalhamos', '2pl_present': 'trabalham', '3pl_present': 'trabalham',
        '1sg_past': 'trabalhei', '2sg_past': 'trabalhou', '3sg_past': 'trabalhou',
        '1pl_past': 'trabalhamos', '2pl_past': 'trabalharam', '3pl_past': 'trabalharam',
        '1sg_future': 'trabalharei', '2sg_future': 'trabalhará', '3sg_future': 'trabalhará',
        '1pl_future': 'trabalharemos', '2pl_future': 'trabalharão', '3pl_future': 'trabalharão',
      },
    },
  },

  {
    // P09's play, of games (localization B62); PLAY_INSTRUMENT is music. German spielen and French
    // jouer say both, so there the two tooltips differ by the gloss alone: joy against sounds.
    // Portuguese jogar (games and sport) over brincar (a child's play); the gloss fits both.
    id: 'PLAY_GAME',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause', 'instrumental'],
    description: 'to take part in a game for enjoyment',
    definition: infinitiveGloss('ACT', { purpose: { verb: 'FEEL', object: 'JOY' } }),
    synonym: 'play a game',
    emoji: '🎲',
    forms: {
      en: {
        base: 'play',
        '1sg_present': 'play', '2sg_present': 'play', '3sg_present': 'plays',
        '1pl_present': 'play', '2pl_present': 'play', '3pl_present': 'play',
        past: 'played',
      },
      it: {
        base: 'giocare',
        '1sg_present': 'gioco', '2sg_present': 'giochi', '3sg_present': 'gioca',
        '1pl_present': 'giochiamo', '2pl_present': 'giocate', '3pl_present': 'giocano',
        '1sg_past': 'giocai', '2sg_past': 'giocasti', '3sg_past': 'giocò',
        '1pl_past': 'giocammo', '2pl_past': 'giocaste', '3pl_past': 'giocarono',
        '1sg_future': 'giocherò', '2sg_future': 'giocherai', '3sg_future': 'giocherà',
        '1pl_future': 'giocheremo', '2pl_future': 'giocherete', '3pl_future': 'giocheranno',
      },
      fr: {
        base: 'jouer',
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
        base: 'jugar',
        '1sg_present': 'juego', '2sg_present': 'juegas', '3sg_present': 'juega',
        '1pl_present': 'jugamos', '2pl_present': 'jugáis', '3pl_present': 'juegan',
        '1sg_past': 'jugué', '2sg_past': 'jugaste', '3sg_past': 'jugó',
        '1pl_past': 'jugamos', '2pl_past': 'jugasteis', '3pl_past': 'jugaron',
        '1sg_future': 'jugaré', '2sg_future': 'jugarás', '3sg_future': 'jugará',
        '1pl_future': 'jugaremos', '2pl_future': 'jugaréis', '3pl_future': 'jugarán',
      },
      ja: {
        base: '遊ぶ',
        reading: 'あそぶ',
        masu_present: '遊びます',
        masu_present_reading: 'あそびます',
      },
      pt: {
        base: 'jogar',
        '1sg_present': 'jogo', '2sg_present': 'joga', '3sg_present': 'joga',
        '1pl_present': 'jogamos', '2pl_present': 'jogam', '3pl_present': 'jogam',
        '1sg_past': 'joguei', '2sg_past': 'jogou', '3sg_past': 'jogou',
        '1pl_past': 'jogamos', '2pl_past': 'jogaram', '3pl_past': 'jogaram',
        '1sg_future': 'jogarei', '2sg_future': 'jogará', '3sg_future': 'jogará',
        '1pl_future': 'jogaremos', '2pl_future': 'jogarão', '3pl_future': 'jogarão',
      },
    },
  },

  // The inchoative half of the causative/inchoative pair START heads. English, Italian, French,
  // German, Spanish and Portuguese all say both halves with one labile verb ("the man starts the
  // action" / "the action starts"), so six of the seven paradigms below repeat START's. Japanese
  // does not: it lexicalises the pair, 始める for the causative and 始まる for this one, so an
  // inchoative clause built on START came out as "その動作は始めます", which is wrong.
  //
  // The split is semantic, not a Japanese workaround. START means "to cause something to begin"
  // and this means "to get under way"; the plan should say which is meant rather than leave the
  // engine to read it off an empty direct-object slot — "the man starts" is the causative with its
  // object elided (男は始めます), not this verb. English takes "begin" to keep the two apart in the
  // picker. Same shape as MOVE / the intransitive MOVE_ONESELF (localization C17).
  //
  // No `terminus`: a recipient belongs to the causative ("starts it for the cat"), not to an event
  // getting under way. `instrumental` stays — "the lesson begins with a word" is the inchoative
  // reading of the complement START was seeded to license.
  {
    id: 'BEGIN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'instrumental', 'cause', 'locative'],
    description: 'to come into being; to get under way',
    emoji: '▶️',
    synonym: 'get under way',
    forms: {
      en: {
        base: 'begin',
        '1sg_present': 'begin', '2sg_present': 'begin', '3sg_present': 'begins',
        '1pl_present': 'begin', '2pl_present': 'begin', '3pl_present': 'begin',
        past: 'began',
      },
      it: {
        base: 'iniziare', infinitive_link: 'a',
        '1sg_present': 'inizio', '2sg_present': 'inizi', '3sg_present': 'inizia',
        '1pl_present': 'iniziamo', '2pl_present': 'iniziate', '3pl_present': 'iniziano',
        '1sg_past': 'iniziai', '2sg_past': 'iniziasti', '3sg_past': 'iniziò',
        '1pl_past': 'iniziammo', '2pl_past': 'iniziaste', '3pl_past': 'iniziarono',
        '1sg_future': 'inizierò', '2sg_future': 'inizierai', '3sg_future': 'inizierà',
        '1pl_future': 'inizieremo', '2pl_future': 'inizierete', '3pl_future': 'inizieranno',
      },
      fr: {
        // -cer keeps its soft c with a cedilla before a/o: nous commençons, je commençai.
        base: 'commencer', infinitive_link: 'à',
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
        base: 'empezar', infinitive_link: 'a',
        '1sg_present': 'empiezo', '2sg_present': 'empiezas', '3sg_present': 'empieza',
        '1pl_present': 'empezamos', '2pl_present': 'empezáis', '3pl_present': 'empiezan',
        '1sg_past': 'empecé', '2sg_past': 'empezaste', '3sg_past': 'empezó',
        '1pl_past': 'empezamos', '2pl_past': 'empezasteis', '3pl_past': 'empezaron',
        '1sg_future': 'empezaré', '2sg_future': 'empezarás', '3sg_future': 'empezará',
        '1pl_future': 'empezaremos', '2pl_future': 'empezaréis', '3pl_future': 'empezarán',
      },
      ja: {
        // 始まる is godan, not the ichidan 始める: te-form 始まって, plain negative 始まらない
        // (both in NONFINITE), masu stem 始まり.
        base: '始まる',
        reading: 'はじまる',
        masu_present: '始まります',
        masu_present_reading: 'はじまります',
        // What begins is its subject, so the こと clause it governs is marked が: 可視であることが始まる.
        infinitive_link: 'ことが',
      },
      pt: {
        base: 'começar', infinitive_link: 'a',
        '1sg_present': 'começo', '2sg_present': 'começa', '3sg_present': 'começa',
        '1pl_present': 'começamos', '2pl_present': 'começam', '3pl_present': 'começam',
        '1sg_past': 'comecei', '2sg_past': 'começou', '3sg_past': 'começou',
        '1pl_past': 'começamos', '2pl_past': 'começaram', '3pl_past': 'começaram',
        '1sg_future': 'começarei', '2sg_future': 'começará', '3sg_future': 'começará',
        '1pl_future': 'começaremos', '2pl_future': 'começarão', '3pl_future': 'começarão',
      },
    },
  },

  // The inchoative half of the pair CHANGE heads, as BEGIN is START's: CHANGE is "to make different"
  // (ja 変える), this is "to become different" (ja 変わる), so an object-less clause no longer comes out
  // as "その動作は変えます". It waited on the German reflexive (localization C17): German has no labile
  // verb here, "der Plan ändert" is ungrammatical, and the verb is "sich ändern". The other five are
  // labile and repeat CHANGE's paradigm. Italian selects essere for it ("il piano è cambiato").
  {
    id: 'CHANGE_ONESELF',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'cause', 'locative'],
    description: 'to become different',
    synonym: 'become different',
    emoji: '🦎',
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
        // The plain verb's forms: the clause places the agreeing pronoun ("ändert sich").
        base: 'sich ändern',
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
        // 変わる is godan, not the ichidan 変える: te-form 変わって, plain negative 変わらない
        // (both in NONFINITE), masu stem 変わり.
        base: '変わる',
        reading: 'かわる',
        masu_present: '変わります',
        masu_present_reading: 'かわります',
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
  // SCHOOL's and STUDENT's differentia (localization B64): "to begin to know", ACQUIRE's shape ("to
  // begin to have"), Japanese ことが始まる included. Intransitive, with the place one learns in.
  // French apprendre is prendre's compound (apprends, apprit, appris); Japanese 学ぶ is godan
  // (学んで, 学ばない). Italian imparare takes avere.
  {
    id: 'LEARN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to come to know or be able to do something',
    definition: infinitiveGloss('BEGIN', { infinitive: 'KNOW' }),
    emoji: '📚',
    forms: {
      en: {
        base: 'learn',
        '1sg_present': 'learn', '2sg_present': 'learn', '3sg_present': 'learns',
        '1pl_present': 'learn', '2pl_present': 'learn', '3pl_present': 'learn',
        past: 'learned',
      },
      it: {
        base: 'imparare',
        '1sg_present': 'imparo', '2sg_present': 'impari', '3sg_present': 'impara',
        '1pl_present': 'impariamo', '2pl_present': 'imparate', '3pl_present': 'imparano',
        '1sg_past': 'imparai', '2sg_past': 'imparasti', '3sg_past': 'imparò',
        '1pl_past': 'imparammo', '2pl_past': 'imparaste', '3pl_past': 'impararono',
        '1sg_future': 'imparerò', '2sg_future': 'imparerai', '3sg_future': 'imparerà',
        '1pl_future': 'impareremo', '2pl_future': 'imparerete', '3pl_future': 'impareranno',
      },
      fr: {
        base: 'apprendre',
        '1sg_present': 'apprends', '2sg_present': 'apprends', '3sg_present': 'apprend',
        '1pl_present': 'apprenons', '2pl_present': 'apprenez', '3pl_present': 'apprennent',
        '1sg_past': 'appris', '2sg_past': 'appris', '3sg_past': 'apprit',
        '1pl_past': 'apprîmes', '2pl_past': 'apprîtes', '3pl_past': 'apprirent',
        '1sg_future': 'apprendrai', '2sg_future': 'apprendras', '3sg_future': 'apprendra',
        '1pl_future': 'apprendrons', '2pl_future': 'apprendrez', '3pl_future': 'apprendront',
      },
      de: {
        base: 'lernen',
        '1sg_present': 'lerne', '2sg_present': 'lernst', '3sg_present': 'lernt',
        '1pl_present': 'lernen', '2pl_present': 'lernt', '3pl_present': 'lernen',
        '1sg_past': 'lernte', '2sg_past': 'lerntest', '3sg_past': 'lernte',
        '1pl_past': 'lernten', '2pl_past': 'lerntet', '3pl_past': 'lernten',
        '2sg_imperative': 'lerne', // the optional du -e, kept
      },
      es: {
        base: 'aprender',
        '1sg_present': 'aprendo', '2sg_present': 'aprendes', '3sg_present': 'aprende',
        '1pl_present': 'aprendemos', '2pl_present': 'aprendéis', '3pl_present': 'aprenden',
        '1sg_past': 'aprendí', '2sg_past': 'aprendiste', '3sg_past': 'aprendió',
        '1pl_past': 'aprendimos', '2pl_past': 'aprendisteis', '3pl_past': 'aprendieron',
        '1sg_future': 'aprenderé', '2sg_future': 'aprenderás', '3sg_future': 'aprenderá',
        '1pl_future': 'aprenderemos', '2pl_future': 'aprenderéis', '3pl_future': 'aprenderán',
      },
      ja: {
        base: '学ぶ',
        reading: 'まなぶ',
        masu_present: '学びます',
        masu_present_reading: 'まなびます',
      },
      pt: {
        base: 'aprender',
        '1sg_present': 'aprendo', '2sg_present': 'aprende', '3sg_present': 'aprende',
        '1pl_present': 'aprendemos', '2pl_present': 'aprendem', '3pl_present': 'aprendem',
        '1sg_past': 'aprendi', '2sg_past': 'aprendeu', '3sg_past': 'aprendeu',
        '1pl_past': 'aprendemos', '2pl_past': 'aprenderam', '3pl_past': 'aprenderam',
        '1sg_future': 'aprenderei', '2sg_future': 'aprenderá', '3sg_future': 'aprenderá',
        '1pl_future': 'aprenderemos', '2pl_future': 'aprenderão', '3pl_future': 'aprenderão',
      },
    },
  },
  // ── Speaking, and the two verbs that order a sequence (localization B55, B57) ──
  {
    id: 'SPEAK',
    role: 'verb',
    transitivity: 'intransitive',
    // What one speaks *about* is the `topic` (P09-E2), in each language's own word: "parla del gatto".
    complements: ['topic', 'manner', 'instrumental', 'locative', 'cause'],
    description: 'to say words aloud',
    emoji: '🗣️',
    forms: {
      en: {
        base: 'speak',
        '1sg_present': 'speak', '2sg_present': 'speak', '3sg_present': 'speaks',
        '1pl_present': 'speak', '2pl_present': 'speak', '3pl_present': 'speak',
        past: 'spoke',
      },
      it: {
        base: 'parlare',
        '1sg_present': 'parlo', '2sg_present': 'parli', '3sg_present': 'parla',
        '1pl_present': 'parliamo', '2pl_present': 'parlate', '3pl_present': 'parlano',
        '1sg_past': 'parlai', '2sg_past': 'parlasti', '3sg_past': 'parlò',
        '1pl_past': 'parlammo', '2pl_past': 'parlaste', '3pl_past': 'parlarono',
        '1sg_future': 'parlerò', '2sg_future': 'parlerai', '3sg_future': 'parlerà',
        '1pl_future': 'parleremo', '2pl_future': 'parlerete', '3pl_future': 'parleranno',
      },
      fr: {
        base: 'parler',
        '1sg_present': 'parle', '2sg_present': 'parles', '3sg_present': 'parle',
        '1pl_present': 'parlons', '2pl_present': 'parlez', '3pl_present': 'parlent',
        '1sg_past': 'parlai', '2sg_past': 'parlas', '3sg_past': 'parla',
        '1pl_past': 'parlâmes', '2pl_past': 'parlâtes', '3pl_past': 'parlèrent',
        '1sg_future': 'parlerai', '2sg_future': 'parleras', '3sg_future': 'parlera',
        '1pl_future': 'parlerons', '2pl_future': 'parlerez', '3pl_future': 'parleront',
      },
      de: {
        // sprechen is a strong e → i verb in the 2/3 singular: du sprichst, er spricht.
        base: 'sprechen',
        '1sg_present': 'spreche', '2sg_present': 'sprichst', '3sg_present': 'spricht',
        '1pl_present': 'sprechen', '2pl_present': 'sprecht', '3pl_present': 'sprechen',
        '1sg_past': 'sprach', '2sg_past': 'sprachst', '3sg_past': 'sprach',
        '1pl_past': 'sprachen', '2pl_past': 'spracht', '3pl_past': 'sprachen',
      },
      es: {
        base: 'hablar',
        '1sg_present': 'hablo', '2sg_present': 'hablas', '3sg_present': 'habla',
        '1pl_present': 'hablamos', '2pl_present': 'habláis', '3pl_present': 'hablan',
        '1sg_past': 'hablé', '2sg_past': 'hablaste', '3sg_past': 'habló',
        '1pl_past': 'hablamos', '2pl_past': 'hablasteis', '3pl_past': 'hablaron',
        '1sg_future': 'hablaré', '2sg_future': 'hablarás', '3sg_future': 'hablará',
        '1pl_future': 'hablaremos', '2pl_future': 'hablaréis', '3pl_future': 'hablarán',
      },
      ja: {
        base: '話す',
        reading: 'はなす',
        masu_present: '話します',
        masu_present_reading: 'はなします',
      },
      pt: {
        base: 'falar',
        '1sg_present': 'falo', '2sg_present': 'fala', '3sg_present': 'fala',
        '1pl_present': 'falamos', '2pl_present': 'falam', '3pl_present': 'falam',
        '1sg_past': 'falei', '2sg_past': 'falou', '3sg_past': 'falou',
        '1pl_past': 'falamos', '2pl_past': 'falaram', '3pl_past': 'falaram',
        '1sg_future': 'falarei', '2sg_future': 'falará', '3sg_future': 'falará',
        '1pl_future': 'falaremos', '2pl_future': 'falarão', '3pl_future': 'falarão',
      },
    },
  },
  {
    // P09's think (localization B60), intransitive: its *that* clause (E4) and its *about* (E2) wait
    // on constructs, and neither is a concept of its own.
    id: 'THINK',
    role: 'verb',
    transitivity: 'intransitive',
    // The *about* is the `topic` complement (P09-E2), and five languages govern it with a
    // preposition of the verb's own, `topic_prep`: it "pensa al gatto", fr "pense au chat", de "denkt
    // an den Kater", es "piensa en el gato", pt "pensa no gato" (see `topicLink`). English and
    // Japanese take their own, "about" and について.
    complements: ['topic', 'manner', 'locative', 'cause'],
    description: 'to form thoughts in the mind',
    // "to use the mind", on the MIND seeded for it: 頭脳を使う is the idiom; the French and German
    // (utiliser l'esprit, den Verstand verwenden) are understood rather than idiomatic. Without MIND
    // every lead said something narrower: creating concepts is inventing, understanding them KNOW's.
    definition: infinitiveGloss('USE', { object: 'MIND', definiteness: 'definite' }),
    emoji: '🤔',
    forms: {
      en: {
        base: 'think',
        '1sg_present': 'think', '2sg_present': 'think', '3sg_present': 'thinks',
        '1pl_present': 'think', '2pl_present': 'think', '3pl_present': 'think',
        past: 'thought',
      },
      it: {
        base: 'pensare', topic_prep: 'a',
        '1sg_present': 'penso', '2sg_present': 'pensi', '3sg_present': 'pensa',
        '1pl_present': 'pensiamo', '2pl_present': 'pensate', '3pl_present': 'pensano',
        '1sg_past': 'pensai', '2sg_past': 'pensasti', '3sg_past': 'pensò',
        '1pl_past': 'pensammo', '2pl_past': 'pensaste', '3pl_past': 'pensarono',
        '1sg_future': 'penserò', '2sg_future': 'penserai', '3sg_future': 'penserà',
        '1pl_future': 'penseremo', '2pl_future': 'penserete', '3pl_future': 'penseranno',
      },
      fr: {
        base: 'penser', topic_prep: 'à',
        '1sg_present': 'pense', '2sg_present': 'penses', '3sg_present': 'pense',
        '1pl_present': 'pensons', '2pl_present': 'pensez', '3pl_present': 'pensent',
        '1sg_past': 'pensai', '2sg_past': 'pensas', '3sg_past': 'pensa',
        '1pl_past': 'pensâmes', '2pl_past': 'pensâtes', '3pl_past': 'pensèrent',
        '1sg_future': 'penserai', '2sg_future': 'penseras', '3sg_future': 'pensera',
        '1pl_future': 'penserons', '2pl_future': 'penserez', '3pl_future': 'penseront',
      },
      de: {
        // denken is mixed: a weak ending on the strong stem, dachte and gedacht.
        base: 'denken', topic_prep: 'an',
        '1sg_present': 'denke', '2sg_present': 'denkst', '3sg_present': 'denkt',
        '1pl_present': 'denken', '2pl_present': 'denkt', '3pl_present': 'denken',
        '1sg_past': 'dachte', '2sg_past': 'dachtest', '3sg_past': 'dachte',
        '1pl_past': 'dachten', '2pl_past': 'dachtet', '3pl_past': 'dachten',
      },
      es: {
        // pensar diphthongises e → ie under the stress: pienso, piensan, but pensamos.
        base: 'pensar', topic_prep: 'en',
        '1sg_present': 'pienso', '2sg_present': 'piensas', '3sg_present': 'piensa',
        '1pl_present': 'pensamos', '2pl_present': 'pensáis', '3pl_present': 'piensan',
        '1sg_past': 'pensé', '2sg_past': 'pensaste', '3sg_past': 'pensó',
        '1pl_past': 'pensamos', '2pl_past': 'pensasteis', '3pl_past': 'pensaron',
        '1sg_future': 'pensaré', '2sg_future': 'pensarás', '3sg_future': 'pensará',
        '1pl_future': 'pensaremos', '2pl_future': 'pensaréis', '3pl_future': 'pensarán',
      },
      ja: {
        base: '考える',
        reading: 'かんがえる',
        masu_present: '考えます',
        masu_present_reading: 'かんがえます',
      },
      pt: {
        base: 'pensar', topic_prep: 'em',
        '1sg_present': 'penso', '2sg_present': 'pensa', '3sg_present': 'pensa',
        '1pl_present': 'pensamos', '2pl_present': 'pensam', '3pl_present': 'pensam',
        '1sg_past': 'pensei', '2sg_past': 'pensou', '3sg_past': 'pensou',
        '1pl_past': 'pensamos', '2pl_past': 'pensaram', '3pl_past': 'pensaram',
        '1sg_future': 'pensarei', '2sg_future': 'pensará', '3sg_future': 'pensará',
        '1pl_future': 'pensaremos', '2pl_future': 'pensarão', '3pl_future': 'pensarão',
      },
    },
  },
  // PRECEDE and FOLLOW are what PREVIOUS and NEXT are glossed on, "that precedes" and "that follows"
  // (localization C24). Intransitive, as B55 proposed: German vorangehen governs a dative a direct
  // object cannot mark, and Japanese 続く and 先行する take their "what" with に, where the engine
  // writes を for every object — so an object would be wrong in two languages.
  {
    id: 'PRECEDE',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to come before in an order',
    emoji: '⏪',
    forms: {
      en: {
        base: 'precede',
        '1sg_present': 'precede', '2sg_present': 'precede', '3sg_present': 'precedes',
        '1pl_present': 'precede', '2pl_present': 'precede', '3pl_present': 'precede',
        past: 'preceded',
      },
      it: {
        base: 'precedere',
        '1sg_present': 'precedo', '2sg_present': 'precedi', '3sg_present': 'precede',
        '1pl_present': 'precediamo', '2pl_present': 'precedete', '3pl_present': 'precedono',
        '1sg_past': 'precedetti', '2sg_past': 'precedesti', '3sg_past': 'precedette',
        '1pl_past': 'precedemmo', '2pl_past': 'precedeste', '3pl_past': 'precedettero',
        '1sg_future': 'precederò', '2sg_future': 'precederai', '3sg_future': 'precederà',
        '1pl_future': 'precederemo', '2pl_future': 'precederete', '3pl_future': 'precederanno',
      },
      fr: {
        base: 'précéder',
        '1sg_present': 'précède', '2sg_present': 'précèdes', '3sg_present': 'précède',
        '1pl_present': 'précédons', '2pl_present': 'précédez', '3pl_present': 'précèdent',
        '1sg_past': 'précédai', '2sg_past': 'précédas', '3sg_past': 'précéda',
        '1pl_past': 'précédâmes', '2pl_past': 'précédâtes', '3pl_past': 'précédèrent',
        '1sg_future': 'précéderai', '2sg_future': 'précéderas', '3sg_future': 'précédera',
        '1pl_future': 'précéderons', '2pl_future': 'précéderez', '3pl_future': 'précéderont',
      },
      de: {
        // vorangehen is separable and strong (ging voran, vorangegangen) and selects sein.
        base: 'vorangehen', particle: 'voran',
        '1sg_present': 'gehe', '2sg_present': 'gehst', '3sg_present': 'geht',
        '1pl_present': 'gehen', '2pl_present': 'geht', '3pl_present': 'gehen',
        '1sg_past': 'ging', '2sg_past': 'gingst', '3sg_past': 'ging',
        '1pl_past': 'gingen', '2pl_past': 'gingt', '3pl_past': 'gingen',
      },
      es: {
        base: 'preceder',
        '1sg_present': 'precedo', '2sg_present': 'precedes', '3sg_present': 'precede',
        '1pl_present': 'precedemos', '2pl_present': 'precedéis', '3pl_present': 'preceden',
        '1sg_past': 'precedí', '2sg_past': 'precediste', '3sg_past': 'precedió',
        '1pl_past': 'precedimos', '2pl_past': 'precedisteis', '3pl_past': 'precedieron',
        '1sg_future': 'precederé', '2sg_future': 'precederás', '3sg_future': 'precederá',
        '1pl_future': 'precederemos', '2pl_future': 'precederéis', '3pl_future': 'precederán',
      },
      ja: {
        base: '先行する',
        reading: 'せんこうする',
        masu_present: '先行します',
        masu_present_reading: 'せんこうします',
      },
      pt: {
        base: 'preceder',
        '1sg_present': 'precedo', '2sg_present': 'precede', '3sg_present': 'precede',
        '1pl_present': 'precedemos', '2pl_present': 'precedem', '3pl_present': 'precedem',
        '1sg_past': 'precedi', '2sg_past': 'precedeu', '3sg_past': 'precedeu',
        '1pl_past': 'precedemos', '2pl_past': 'precederam', '3pl_past': 'precederam',
        '1sg_future': 'precederei', '2sg_future': 'precederá', '3sg_future': 'precederá',
        '1pl_future': 'precederemos', '2pl_future': 'precederão', '3pl_future': 'precederão',
      },
    },
  },
  {
    // Transitive since localization C24: the ordinals are what follows which ("that follows the first
    // object"). German takes the object with auf (+ accusative, "folgt auf den Hund", its lexeme's
    // `object_prep`, A139), Spanish marks it with the personal a whatever it is (`object_a`, "sigue al
    // primer objeto", and still "lo sigue"), and Japanese takes it with に (`object_particle`, 犬に続く).
    // NEXT is still the bare "that follows".
    id: 'FOLLOW',
    role: 'verb',
    transitivity: 'transitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to come after in an order',
    emoji: '⏩',
    synonym: 'come after',
    forms: {
      en: {
        base: 'follow',
        '1sg_present': 'follow', '2sg_present': 'follow', '3sg_present': 'follows',
        '1pl_present': 'follow', '2pl_present': 'follow', '3pl_present': 'follow',
        past: 'followed',
      },
      it: {
        base: 'seguire',
        '1sg_present': 'seguo', '2sg_present': 'segui', '3sg_present': 'segue',
        '1pl_present': 'seguiamo', '2pl_present': 'seguite', '3pl_present': 'seguono',
        '1sg_past': 'seguii', '2sg_past': 'seguisti', '3sg_past': 'seguì',
        '1pl_past': 'seguimmo', '2pl_past': 'seguiste', '3pl_past': 'seguirono',
        '1sg_future': 'seguirò', '2sg_future': 'seguirai', '3sg_future': 'seguirà',
        '1pl_future': 'seguiremo', '2pl_future': 'seguirete', '3pl_future': 'seguiranno',
      },
      fr: {
        base: 'suivre',
        '1sg_present': 'suis', '2sg_present': 'suis', '3sg_present': 'suit',
        '1pl_present': 'suivons', '2pl_present': 'suivez', '3pl_present': 'suivent',
        '1sg_past': 'suivis', '2sg_past': 'suivis', '3sg_past': 'suivit',
        '1pl_past': 'suivîmes', '2pl_past': 'suivîtes', '3pl_past': 'suivirent',
        '1sg_future': 'suivrai', '2sg_future': 'suivras', '3sg_future': 'suivra',
        '1pl_future': 'suivrons', '2pl_future': 'suivrez', '3pl_future': 'suivront',
      },
      de: {
        // folgen selects sein: "ist gefolgt".
        base: 'folgen', object_prep: 'auf',
        '1sg_present': 'folge', '2sg_present': 'folgst', '3sg_present': 'folgt',
        '1pl_present': 'folgen', '2pl_present': 'folgt', '3pl_present': 'folgen',
        '1sg_past': 'folgte', '2sg_past': 'folgtest', '3sg_past': 'folgte',
        '1pl_past': 'folgten', '2pl_past': 'folgtet', '3pl_past': 'folgten',
      },
      es: {
        // seguir stem-changes e → i under the stress, and takes the -g- of sigo.
        base: 'seguir', object_a: '1',
        '1sg_present': 'sigo', '2sg_present': 'sigues', '3sg_present': 'sigue',
        '1pl_present': 'seguimos', '2pl_present': 'seguís', '3pl_present': 'siguen',
        '1sg_past': 'seguí', '2sg_past': 'seguiste', '3sg_past': 'siguió',
        '1pl_past': 'seguimos', '2pl_past': 'seguisteis', '3pl_past': 'siguieron',
        '1sg_future': 'seguiré', '2sg_future': 'seguirás', '3sg_future': 'seguirá',
        '1pl_future': 'seguiremos', '2pl_future': 'seguiréis', '3pl_future': 'seguirán',
      },
      ja: {
        base: '続く',
        reading: 'つづく',
        masu_present: '続きます',
        masu_present_reading: 'つづきます',
        object_particle: 'に',
      },
      pt: {
        base: 'seguir',
        '1sg_present': 'sigo', '2sg_present': 'segue', '3sg_present': 'segue',
        '1pl_present': 'seguimos', '2pl_present': 'seguem', '3pl_present': 'seguem',
        '1sg_past': 'segui', '2sg_past': 'seguiu', '3sg_past': 'seguiu',
        '1pl_past': 'seguimos', '2pl_past': 'seguiram', '3pl_past': 'seguiram',
        '1sg_future': 'seguirei', '2sg_future': 'seguirá', '3sg_future': 'seguirá',
        '1pl_future': 'seguiremos', '2pl_future': 'seguirão', '3pl_future': 'seguirão',
      },
    },
  },
  // ── The verbs the time, growth and substance adjectives stand on (localization C24) ──
  // HAPPEN carries PRESENT, PAST and FUTURE by its tense and aspect alone: "that happens now", "that
  // has happened", "that will happen". Spanish ocurrir, not pasar, which is PAST's own pasado; French
  // arriver, the everyday one (se produire would need the pronominal verb French does not build).
  {
    id: 'HAPPEN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to take place',
    emoji: '💥',
    forms: {
      en: {
        base: 'happen',
        '1sg_present': 'happen', '2sg_present': 'happen', '3sg_present': 'happens',
        '1pl_present': 'happen', '2pl_present': 'happen', '3pl_present': 'happen',
        past: 'happened',
      },
      it: {
        // succedere takes essere, and its past and participle are the strong successe, successo.
        base: 'succedere',
        '1sg_present': 'succedo', '2sg_present': 'succedi', '3sg_present': 'succede',
        '1pl_present': 'succediamo', '2pl_present': 'succedete', '3pl_present': 'succedono',
        '1sg_past': 'successi', '2sg_past': 'succedesti', '3sg_past': 'successe',
        '1pl_past': 'succedemmo', '2pl_past': 'succedeste', '3pl_past': 'successero',
        '1sg_future': 'succederò', '2sg_future': 'succederai', '3sg_future': 'succederà',
        '1pl_future': 'succederemo', '2pl_future': 'succederete', '3pl_future': 'succederanno',
      },
      fr: {
        base: 'arriver',
        '1sg_present': 'arrive', '2sg_present': 'arrives', '3sg_present': 'arrive',
        '1pl_present': 'arrivons', '2pl_present': 'arrivez', '3pl_present': 'arrivent',
        '1sg_past': 'arrivai', '2sg_past': 'arrivas', '3sg_past': 'arriva',
        '1pl_past': 'arrivâmes', '2pl_past': 'arrivâtes', '3pl_past': 'arrivèrent',
        '1sg_future': 'arriverai', '2sg_future': 'arriveras', '3sg_future': 'arrivera',
        '1pl_future': 'arriverons', '2pl_future': 'arriverez', '3pl_future': 'arriveront',
      },
      de: {
        // geschehen is strong (geschieht, geschah, geschehen) and selects sein.
        base: 'geschehen',
        '1sg_present': 'geschehe', '2sg_present': 'geschiehst', '3sg_present': 'geschieht',
        '1pl_present': 'geschehen', '2pl_present': 'gescheht', '3pl_present': 'geschehen',
        '1sg_past': 'geschah', '2sg_past': 'geschahst', '3sg_past': 'geschah',
        '1pl_past': 'geschahen', '2pl_past': 'geschaht', '3pl_past': 'geschahen',
      },
      es: {
        base: 'ocurrir',
        '1sg_present': 'ocurro', '2sg_present': 'ocurres', '3sg_present': 'ocurre',
        '1pl_present': 'ocurrimos', '2pl_present': 'ocurrís', '3pl_present': 'ocurren',
        '1sg_past': 'ocurrí', '2sg_past': 'ocurriste', '3sg_past': 'ocurrió',
        '1pl_past': 'ocurrimos', '2pl_past': 'ocurristeis', '3pl_past': 'ocurrieron',
        '1sg_future': 'ocurriré', '2sg_future': 'ocurrirás', '3sg_future': 'ocurrirá',
        '1pl_future': 'ocurriremos', '2pl_future': 'ocurriréis', '3pl_future': 'ocurrirán',
      },
      ja: {
        base: '起こる',
        reading: 'おこる',
        masu_present: '起こります',
        masu_present_reading: 'おこります',
      },
      pt: {
        base: 'acontecer',
        '1sg_present': 'aconteço', '2sg_present': 'acontece', '3sg_present': 'acontece',
        '1pl_present': 'acontecemos', '2pl_present': 'acontecem', '3pl_present': 'acontecem',
        '1sg_past': 'aconteci', '2sg_past': 'aconteceu', '3sg_past': 'aconteceu',
        '1pl_past': 'acontecemos', '2pl_past': 'aconteceram', '3pl_past': 'aconteceram',
        '1sg_future': 'acontecerei', '2sg_future': 'acontecerá', '3sg_future': 'acontecerá',
        '1pl_future': 'aconteceremos', '2pl_future': 'acontecerão', '3pl_future': 'acontecerão',
      },
    },
  },
  // ADULT is "that no longer grows". The growing of living things, not of a quantity: French
  // grandir (croître is formal), Japanese 成長する; it/de/es/pt crescere/wachsen/crecer/crescer
  // cover both.
  {
    id: 'GROW',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to become bigger over time, as a living thing does',
    emoji: '🌱',
    forms: {
      en: {
        base: 'grow',
        '1sg_present': 'grow', '2sg_present': 'grow', '3sg_present': 'grows',
        '1pl_present': 'grow', '2pl_present': 'grow', '3pl_present': 'grow',
        past: 'grew',
      },
      it: {
        // crescere takes essere; its past is the strong crebbe.
        base: 'crescere',
        '1sg_present': 'cresco', '2sg_present': 'cresci', '3sg_present': 'cresce',
        '1pl_present': 'cresciamo', '2pl_present': 'crescete', '3pl_present': 'crescono',
        '1sg_past': 'crebbi', '2sg_past': 'crescesti', '3sg_past': 'crebbe',
        '1pl_past': 'crescemmo', '2pl_past': 'cresceste', '3pl_past': 'crebbero',
        '1sg_future': 'crescerò', '2sg_future': 'crescerai', '3sg_future': 'crescerà',
        '1pl_future': 'cresceremo', '2pl_future': 'crescerete', '3pl_future': 'cresceranno',
      },
      fr: {
        base: 'grandir',
        '1sg_present': 'grandis', '2sg_present': 'grandis', '3sg_present': 'grandit',
        '1pl_present': 'grandissons', '2pl_present': 'grandissez', '3pl_present': 'grandissent',
        '1sg_past': 'grandis', '2sg_past': 'grandis', '3sg_past': 'grandit',
        '1pl_past': 'grandîmes', '2pl_past': 'grandîtes', '3pl_past': 'grandirent',
        '1sg_future': 'grandirai', '2sg_future': 'grandiras', '3sg_future': 'grandira',
        '1pl_future': 'grandirons', '2pl_future': 'grandirez', '3pl_future': 'grandiront',
      },
      de: {
        // wachsen is strong (wächst, wuchs, gewachsen) and selects sein.
        base: 'wachsen',
        '1sg_present': 'wachse', '2sg_present': 'wächst', '3sg_present': 'wächst',
        '1pl_present': 'wachsen', '2pl_present': 'wachst', '3pl_present': 'wachsen',
        '1sg_past': 'wuchs', '2sg_past': 'wuchsest', '3sg_past': 'wuchs',
        '1pl_past': 'wuchsen', '2pl_past': 'wuchst', '3pl_past': 'wuchsen',
      },
      es: {
        base: 'crecer',
        '1sg_present': 'crezco', '2sg_present': 'creces', '3sg_present': 'crece',
        '1pl_present': 'crecemos', '2pl_present': 'crecéis', '3pl_present': 'crecen',
        '1sg_past': 'crecí', '2sg_past': 'creciste', '3sg_past': 'creció',
        '1pl_past': 'crecimos', '2pl_past': 'crecisteis', '3pl_past': 'crecieron',
        '1sg_future': 'creceré', '2sg_future': 'crecerás', '3sg_future': 'crecerá',
        '1pl_future': 'creceremos', '2pl_future': 'creceréis', '3pl_future': 'crecerán',
      },
      ja: {
        base: '成長する',
        reading: 'せいちょうする',
        masu_present: '成長します',
        masu_present_reading: 'せいちょうします',
      },
      pt: {
        base: 'crescer',
        '1sg_present': 'cresço', '2sg_present': 'cresce', '3sg_present': 'cresce',
        '1pl_present': 'crescemos', '2pl_present': 'crescem', '3pl_present': 'crescem',
        '1sg_past': 'cresci', '2sg_past': 'cresceu', '3sg_past': 'cresceu',
        '1pl_past': 'crescemos', '2pl_past': 'cresceram', '3pl_past': 'cresceram',
        '1sg_future': 'crescerei', '2sg_future': 'crescerá', '3sg_future': 'crescerá',
        '1pl_future': 'cresceremos', '2pl_future': 'crescerão', '3pl_future': 'crescerão',
      },
    },
  },
  // SOLID is "that does not flow": what neither a liquid nor a gas can say. Italian scorrere and
  // French couler, the words for a liquid moving; es/pt fluir, de fließen, ja 流れる.
  {
    id: 'FLOW',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'cause'],
    description: 'to move along steadily, as a liquid does',
    emoji: '🌊',
    forms: {
      en: {
        base: 'flow',
        '1sg_present': 'flow', '2sg_present': 'flow', '3sg_present': 'flows',
        '1pl_present': 'flow', '2pl_present': 'flow', '3pl_present': 'flow',
        past: 'flowed',
      },
      it: {
        // scorrere takes essere, and its past and participle are the strong scorse, scorso.
        base: 'scorrere',
        '1sg_present': 'scorro', '2sg_present': 'scorri', '3sg_present': 'scorre',
        '1pl_present': 'scorriamo', '2pl_present': 'scorrete', '3pl_present': 'scorrono',
        '1sg_past': 'scorsi', '2sg_past': 'scorresti', '3sg_past': 'scorse',
        '1pl_past': 'scorremmo', '2pl_past': 'scorreste', '3pl_past': 'scorsero',
        '1sg_future': 'scorrerò', '2sg_future': 'scorrerai', '3sg_future': 'scorrerà',
        '1pl_future': 'scorreremo', '2pl_future': 'scorrerete', '3pl_future': 'scorreranno',
      },
      fr: {
        base: 'couler',
        '1sg_present': 'coule', '2sg_present': 'coules', '3sg_present': 'coule',
        '1pl_present': 'coulons', '2pl_present': 'coulez', '3pl_present': 'coulent',
        '1sg_past': 'coulai', '2sg_past': 'coulas', '3sg_past': 'coula',
        '1pl_past': 'coulâmes', '2pl_past': 'coulâtes', '3pl_past': 'coulèrent',
        '1sg_future': 'coulerai', '2sg_future': 'couleras', '3sg_future': 'coulera',
        '1pl_future': 'coulerons', '2pl_future': 'coulerez', '3pl_future': 'couleront',
      },
      de: {
        // fließen is strong (fließt, floss, geflossen) and selects sein.
        base: 'fließen',
        '1sg_present': 'fließe', '2sg_present': 'fließt', '3sg_present': 'fließt',
        '1pl_present': 'fließen', '2pl_present': 'fließt', '3pl_present': 'fließen',
        '1sg_past': 'floss', '2sg_past': 'flossest', '3sg_past': 'floss',
        '1pl_past': 'flossen', '2pl_past': 'flosst', '3pl_past': 'flossen',
      },
      es: {
        // fluir inserts -y- before a vowel ending, as every -uir verb does.
        base: 'fluir',
        '1sg_present': 'fluyo', '2sg_present': 'fluyes', '3sg_present': 'fluye',
        '1pl_present': 'fluimos', '2pl_present': 'fluís', '3pl_present': 'fluyen',
        '1sg_past': 'fluí', '2sg_past': 'fluiste', '3sg_past': 'fluyó',
        '1pl_past': 'fluimos', '2pl_past': 'fluisteis', '3pl_past': 'fluyeron',
        '1sg_future': 'fluiré', '2sg_future': 'fluirás', '3sg_future': 'fluirá',
        '1pl_future': 'fluiremos', '2pl_future': 'fluiréis', '3pl_future': 'fluirán',
      },
      ja: {
        base: '流れる',
        reading: 'ながれる',
        masu_present: '流れます',
        masu_present_reading: 'ながれます',
      },
      pt: {
        base: 'fluir',
        '1sg_present': 'fluo', '2sg_present': 'flui', '3sg_present': 'flui',
        '1pl_present': 'fluímos', '2pl_present': 'fluem', '3pl_present': 'fluem',
        '1sg_past': 'fluí', '2sg_past': 'fluiu', '3sg_past': 'fluiu',
        '1pl_past': 'fluímos', '2pl_past': 'fluíram', '3pl_past': 'fluíram',
        '1sg_future': 'fluirei', '2sg_future': 'fluirá', '3sg_future': 'fluirá',
        '1pl_future': 'fluiremos', '2pl_future': 'fluirão', '3pl_future': 'fluirão',
      },
    },
  },
];
