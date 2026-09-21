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
        base: '住む',
        reading: 'すむ',
        masu_present: '住みます',
        masu_present_reading: 'すみます',
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
];
