import type { ConceptSeed } from '../types.js';
import { infinitiveGloss } from './gloss.js';

// Motion & copular verbs (license locative / direction / source / route).
export const motionVerbs: ConceptSeed[] = [
  {
    id: 'GO',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'direction', 'source', 'route', 'cause'],
    description: 'to move or travel from one place to another',
    // "to move from a place to another place": the source and the goal are both a place, the goal
    // another one (localization C17).
    definition: infinitiveGloss('MOVE_ONESELF', {
      complements: {
        source: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } },
        direction: { phrase: { concept: 'PLACE', definiteness: 'indefinite', adjectives: ['OTHER'] } },
      },
    }),
    emoji: '🚶',
    isA: 'MOVE_ONESELF',
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
        // 尊敬語 いらっしゃる, 「行く」「来る」「いる」の尊敬語; 謙譲語 参る, 「行く」「来る」の謙譲語
        // (大辞林, デジタル大辞泉). Someone else's relative いらっしゃいます; one's own, asked, 参ります (P11-E1).
        honorific: 'いらっしゃる', honorific_masu_present: 'いらっしゃいます', honorific_te: 'いらっしゃって', honorific_nai: 'いらっしゃらない',
        humble: '参る', humble_masu_present: '参ります', humble_te: '参って', humble_nai: '参らない',
        humble_reading: 'まいる', humble_masu_present_reading: 'まいります', humble_te_reading: 'まいって', humble_nai_reading: 'まいらない',
        // An instruction labels with a verbal noun (see ADD's 追加), and 行く has none of its own:
        // a key that takes the cursor somewhere says 移動 ("左に移動", "次のスロットへ移動"), where
        // the stem would leave a bare 行き (localization B44).
        label: '移動',
        label_reading: 'いどう',
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
  {
    // Going back to where one was: "back to the canvas" is RETURN with the place as its `direction`
    // (B43). French "revenir", the coming back, is what a UI says for it ("revenir au canevas"); German
    // "zurückkehren" is separable ("kehrt zur Arbeitsfläche zurück"), and all three of it / fr / de take
    // the BE auxiliary, as GO does ("è tornato", "est revenu", "ist zurückgekehrt").
    id: 'RETURN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'direction', 'source', 'route', 'cause'],
    description: 'to go back to a place',
    definition: infinitiveGloss('GO', { modifier: 'BACKWARDS' }),
    emoji: '🔙',
    isA: 'GO',
    // COME_BACK is folded into RETURN (P09 §2), so *come back* finds it (P09-E23).
    aliases: { en: ['come back'] },
    forms: {
      en: {
        base: 'return',
        '1sg_present': 'return', '2sg_present': 'return', '3sg_present': 'returns',
        '1pl_present': 'return', '2pl_present': 'return', '3pl_present': 'return',
        past: 'returned',
      },
      it: {
        base: 'tornare',
        '1sg_present': 'torno', '2sg_present': 'torni', '3sg_present': 'torna',
        '1pl_present': 'torniamo', '2pl_present': 'tornate', '3pl_present': 'tornano',
        '1sg_past': 'tornai', '2sg_past': 'tornasti', '3sg_past': 'tornò',
        '1pl_past': 'tornammo', '2pl_past': 'tornaste', '3pl_past': 'tornarono',
        '1sg_future': 'tornerò', '2sg_future': 'tornerai', '3sg_future': 'tornerà',
        '1pl_future': 'torneremo', '2pl_future': 'tornerete', '3pl_future': 'torneranno',
      },
      fr: {
        base: 'revenir',
        '1sg_present': 'reviens', '2sg_present': 'reviens', '3sg_present': 'revient',
        '1pl_present': 'revenons', '2pl_present': 'revenez', '3pl_present': 'reviennent',
        '1sg_past': 'revins', '2sg_past': 'revins', '3sg_past': 'revint',
        '1pl_past': 'revînmes', '2pl_past': 'revîntes', '3pl_past': 'revinrent',
        '1sg_future': 'reviendrai', '2sg_future': 'reviendras', '3sg_future': 'reviendra',
        '1pl_future': 'reviendrons', '2pl_future': 'reviendrez', '3pl_future': 'reviendront',
      },
      de: {
        base: 'zurückkehren', particle: 'zurück',
        '1sg_present': 'kehre', '2sg_present': 'kehrst', '3sg_present': 'kehrt',
        '1pl_present': 'kehren', '2pl_present': 'kehrt', '3pl_present': 'kehren',
        '1sg_past': 'kehrte', '2sg_past': 'kehrtest', '3sg_past': 'kehrte',
        '1pl_past': 'kehrten', '2pl_past': 'kehrtet', '3pl_past': 'kehrten',
      },
      es: {
        base: 'volver',
        '1sg_present': 'vuelvo', '2sg_present': 'vuelves', '3sg_present': 'vuelve',
        '1pl_present': 'volvemos', '2pl_present': 'volvéis', '3pl_present': 'vuelven',
        '1sg_past': 'volví', '2sg_past': 'volviste', '3sg_past': 'volvió',
        '1pl_past': 'volvimos', '2pl_past': 'volvisteis', '3pl_past': 'volvieron',
        '1sg_future': 'volveré', '2sg_future': 'volverás', '3sg_future': 'volverá',
        '1pl_future': 'volveremos', '2pl_future': 'volveréis', '3pl_future': 'volverán',
      },
      ja: {
        base: '戻る',
        reading: 'もどる',
        masu_present: '戻ります',
        masu_present_reading: 'もどります',
        // A "back" button says the dictionary form 戻る, as 閉じる does, not the stem 戻り.
        label: '戻る',
        label_reading: 'もどる',
      },
      pt: {
        base: 'voltar',
        '1sg_present': 'volto', '2sg_present': 'volta', '3sg_present': 'volta',
        '1pl_present': 'voltamos', '2pl_present': 'voltam', '3pl_present': 'voltam',
        '1sg_past': 'voltei', '2sg_past': 'voltou', '3sg_past': 'voltou',
        '1pl_past': 'voltamos', '2pl_past': 'voltaram', '3pl_past': 'voltaram',
        '1sg_future': 'voltarei', '2sg_future': 'voltará', '3sg_future': 'voltará',
        '1pl_future': 'voltaremos', '2pl_future': 'voltarão', '3pl_future': 'voltarão',
      },
    },
  },
  // ── Turning and leaving (localization B61) ────────────────────────
  {
    // P09's turn, the intransitive "rotate": the subject turns, as B59's "the earth turns around the
    // sun" needs. German says it with the reflexive sich drehen, seeded like MOVE_ONESELF's sich
    // bewegen: the plain forms, the clause placing the pronoun ("dreht sich", "hat sich gedreht").
    // The Romance verbs are the plain girare, tourner, girar, which also serve the transitive sense
    // (not seeded: drehen, 回す), and take HAVE in it/fr ("ha girato", "a tourné"). The `route` is
    // what it turns around ("turns around the house").
    id: 'TURN',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'direction', 'route', 'cause'],
    description: 'to move around a centre or an axis',
    // "to move around a point" (localization B61): MOVE_ONESELF with the `around` route, the first in
    // a verb gloss.
    definition: infinitiveGloss('MOVE_ONESELF', {
      complements: {
        route: {
          phrase: { concept: 'POINT_NOUN', definiteness: 'indefinite' },
          specifiers: [{ kind: 'path', value: 'around' }],
        },
      },
    }),
    emoji: '🔄',
    isA: 'MOVE_ONESELF',
    synonym: 'rotate',
    forms: {
      en: {
        base: 'turn',
        '1sg_present': 'turn', '2sg_present': 'turn', '3sg_present': 'turns',
        '1pl_present': 'turn', '2pl_present': 'turn', '3pl_present': 'turn',
        past: 'turned',
      },
      it: {
        base: 'girare',
        '1sg_present': 'giro', '2sg_present': 'giri', '3sg_present': 'gira',
        '1pl_present': 'giriamo', '2pl_present': 'girate', '3pl_present': 'girano',
        '1sg_past': 'girai', '2sg_past': 'girasti', '3sg_past': 'girò',
        '1pl_past': 'girammo', '2pl_past': 'giraste', '3pl_past': 'girarono',
        '1sg_future': 'girerò', '2sg_future': 'girerai', '3sg_future': 'girerà',
        '1pl_future': 'gireremo', '2pl_future': 'girerete', '3pl_future': 'gireranno',
      },
      fr: {
        base: 'tourner',
        '1sg_present': 'tourne', '2sg_present': 'tournes', '3sg_present': 'tourne',
        '1pl_present': 'tournons', '2pl_present': 'tournez', '3pl_present': 'tournent',
        '1sg_past': 'tournai', '2sg_past': 'tournas', '3sg_past': 'tourna',
        '1pl_past': 'tournâmes', '2pl_past': 'tournâtes', '3pl_past': 'tournèrent',
        '1sg_future': 'tournerai', '2sg_future': 'tourneras', '3sg_future': 'tournera',
        '1pl_future': 'tournerons', '2pl_future': 'tournerez', '3pl_future': 'tourneront',
      },
      de: {
        base: 'sich drehen',
        '1sg_present': 'drehe', '2sg_present': 'drehst', '3sg_present': 'dreht',
        '1pl_present': 'drehen', '2pl_present': 'dreht', '3pl_present': 'drehen',
        '1sg_past': 'drehte', '2sg_past': 'drehtest', '3sg_past': 'drehte',
        '1pl_past': 'drehten', '2pl_past': 'drehtet', '3pl_past': 'drehten',
      },
      es: {
        base: 'girar',
        '1sg_present': 'giro', '2sg_present': 'giras', '3sg_present': 'gira',
        '1pl_present': 'giramos', '2pl_present': 'giráis', '3pl_present': 'giran',
        '1sg_past': 'giré', '2sg_past': 'giraste', '3sg_past': 'giró',
        '1pl_past': 'giramos', '2pl_past': 'girasteis', '3pl_past': 'giraron',
        '1sg_future': 'giraré', '2sg_future': 'girarás', '3sg_future': 'girará',
        '1pl_future': 'giraremos', '2pl_future': 'giraréis', '3pl_future': 'girarán',
      },
      ja: {
        base: '回る',
        reading: 'まわる',
        masu_present: '回ります',
        masu_present_reading: 'まわります',
      },
      pt: {
        base: 'girar',
        '1sg_present': 'giro', '2sg_present': 'gira', '3sg_present': 'gira',
        '1pl_present': 'giramos', '2pl_present': 'giram', '3pl_present': 'giram',
        '1sg_past': 'girei', '2sg_past': 'girou', '3sg_past': 'girou',
        '1pl_past': 'giramos', '2pl_past': 'giraram', '3pl_past': 'giraram',
        '1sg_future': 'girarei', '2sg_future': 'girará', '3sg_future': 'girará',
        '1pl_future': 'giraremos', '2pl_future': 'girarão', '3pl_future': 'girarão',
      },
    },
  },
  {
    // P09's leave in the setting-off sense: to depart. The place left is a `source` ("leaves from the
    // house"), where the seeded LEAVE takes it as its object. BE in it/fr/de (è partito, est parti,
    // ist weggegangen). German weggehen is the generic for a person (abfahren is by vehicle) and
    // separable (geht … weg). Spanish partir, not irse, which the gloss's "ir" would define by its own
    // stem; Japanese 出発する, since 出る is LEAVE's and GO_OUT's.
    id: 'LEAVE_DEPART',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'source', 'cause'],
    description: 'to go away; to set off',
    // "to begin to go" (localization B61): ACQUIRE's inchoative ("to begin to have") on GO.
    definition: infinitiveGloss('BEGIN', { infinitive: 'GO' }),
    emoji: '🛫',
    isA: 'GO',
    synonym: 'depart',
    forms: {
      en: {
        base: 'leave',
        '1sg_present': 'leave', '2sg_present': 'leave', '3sg_present': 'leaves',
        '1pl_present': 'leave', '2pl_present': 'leave', '3pl_present': 'leave',
        past: 'left',
      },
      it: {
        base: 'partire',
        '1sg_present': 'parto', '2sg_present': 'parti', '3sg_present': 'parte',
        '1pl_present': 'partiamo', '2pl_present': 'partite', '3pl_present': 'partono',
        '1sg_past': 'partii', '2sg_past': 'partisti', '3sg_past': 'partì',
        '1pl_past': 'partimmo', '2pl_past': 'partiste', '3pl_past': 'partirono',
        '1sg_future': 'partirò', '2sg_future': 'partirai', '3sg_future': 'partirà',
        '1pl_future': 'partiremo', '2pl_future': 'partirete', '3pl_future': 'partiranno',
      },
      fr: {
        base: 'partir',
        '1sg_present': 'pars', '2sg_present': 'pars', '3sg_present': 'part',
        '1pl_present': 'partons', '2pl_present': 'partez', '3pl_present': 'partent',
        '1sg_past': 'partis', '2sg_past': 'partis', '3sg_past': 'partit',
        '1pl_past': 'partîmes', '2pl_past': 'partîtes', '3pl_past': 'partirent',
        '1sg_future': 'partirai', '2sg_future': 'partiras', '3sg_future': 'partira',
        '1pl_future': 'partirons', '2pl_future': 'partirez', '3pl_future': 'partiront',
      },
      de: {
        base: 'weggehen', particle: 'weg',
        '1sg_present': 'gehe', '2sg_present': 'gehst', '3sg_present': 'geht',
        '1pl_present': 'gehen', '2pl_present': 'geht', '3pl_present': 'gehen',
        '1sg_past': 'ging', '2sg_past': 'gingst', '3sg_past': 'ging',
        '1pl_past': 'gingen', '2pl_past': 'gingt', '3pl_past': 'gingen',
      },
      es: {
        base: 'partir',
        '1sg_present': 'parto', '2sg_present': 'partes', '3sg_present': 'parte',
        '1pl_present': 'partimos', '2pl_present': 'partís', '3pl_present': 'parten',
        '1sg_past': 'partí', '2sg_past': 'partiste', '3sg_past': 'partió',
        '1pl_past': 'partimos', '2pl_past': 'partisteis', '3pl_past': 'partieron',
        '1sg_future': 'partiré', '2sg_future': 'partirás', '3sg_future': 'partirá',
        '1pl_future': 'partiremos', '2pl_future': 'partiréis', '3pl_future': 'partirán',
      },
      ja: {
        base: '出発する',
        reading: 'しゅっぱつする',
        masu_present: '出発します',
        masu_present_reading: 'しゅっぱつします',
      },
      pt: {
        base: 'partir',
        '1sg_present': 'parto', '2sg_present': 'parte', '3sg_present': 'parte',
        '1pl_present': 'partimos', '2pl_present': 'partem', '3pl_present': 'partem',
        '1sg_past': 'parti', '2sg_past': 'partiu', '3sg_past': 'partiu',
        '1pl_past': 'partimos', '2pl_past': 'partiram', '3pl_past': 'partiram',
        '1sg_future': 'partirei', '2sg_future': 'partirá', '3sg_future': 'partirá',
        '1pl_future': 'partiremos', '2pl_future': 'partirão', '3pl_future': 'partirão',
      },
    },
  },
  {
    // P09's go out (D3): to go outside. English phrasal, German separable hinausgehen; BE in it/fr/de
    // (è uscito, est sorti, ist hinausgegangen). No `source`: "goes out of the house" is the seeded
    // LEAVE's frame, which it/es/ja/pt already say with this verb (esce dalla casa, 家を出る), and
    // en/fr/de split. Spanish salir's tú command is the irregular "sal", as LEAVE's is.
    id: 'GO_OUT',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'direction', 'route', 'cause'],
    description: 'to go outside',
    // "to go outside" (localization B61): GO with the direction adverb its particle says, as Duden
    // glosses hinausgehen "nach draußen gehen".
    definition: infinitiveGloss('GO', { modifier: 'OUTSIDE' }),
    emoji: '🚶‍➡️',
    isA: 'GO',
    forms: {
      en: {
        // phrasal, like TIDY_UP: the particle stays with the verb.
        base: 'go out',
        '1sg_present': 'go out', '2sg_present': 'go out', '3sg_present': 'goes out',
        '1pl_present': 'go out', '2pl_present': 'go out', '3pl_present': 'go out',
        past: 'went out',
        particle: 'out',
      },
      it: {
        base: 'uscire',
        '1sg_present': 'esco', '2sg_present': 'esci', '3sg_present': 'esce',
        '1pl_present': 'usciamo', '2pl_present': 'uscite', '3pl_present': 'escono',
        '1sg_past': 'uscii', '2sg_past': 'uscisti', '3sg_past': 'uscì',
        '1pl_past': 'uscimmo', '2pl_past': 'usciste', '3pl_past': 'uscirono',
        '1sg_future': 'uscirò', '2sg_future': 'uscirai', '3sg_future': 'uscirà',
        '1pl_future': 'usciremo', '2pl_future': 'uscirete', '3pl_future': 'usciranno',
      },
      fr: {
        base: 'sortir',
        '1sg_present': 'sors', '2sg_present': 'sors', '3sg_present': 'sort',
        '1pl_present': 'sortons', '2pl_present': 'sortez', '3pl_present': 'sortent',
        '1sg_past': 'sortis', '2sg_past': 'sortis', '3sg_past': 'sortit',
        '1pl_past': 'sortîmes', '2pl_past': 'sortîtes', '3pl_past': 'sortirent',
        '1sg_future': 'sortirai', '2sg_future': 'sortiras', '3sg_future': 'sortira',
        '1pl_future': 'sortirons', '2pl_future': 'sortirez', '3pl_future': 'sortiront',
      },
      de: {
        base: 'hinausgehen', particle: 'hinaus',
        '1sg_present': 'gehe', '2sg_present': 'gehst', '3sg_present': 'geht',
        '1pl_present': 'gehen', '2pl_present': 'geht', '3pl_present': 'gehen',
        '1sg_past': 'ging', '2sg_past': 'gingst', '3sg_past': 'ging',
        '1pl_past': 'gingen', '2pl_past': 'gingt', '3pl_past': 'gingen',
      },
      es: {
        base: 'salir',
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
      },
      pt: {
        base: 'sair',
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
    // The intransitive "move", the genus GO and RUN are kinds of: the subject changes position. MOVE is
    // the transitive one, a thing moved by someone (localization C17). Five languages say this one
    // with a reflexive verb, as they say BECOME: it muoversi, fr se déplacer, de sich bewegen, es
    // moverse, pt mover-se. The Romance clitic rides inside each finite form, as in BECOME and
    // COLLAPSE, and the engines strip it to derive the moods. The German forms are the plain verb's:
    // the clause places the agreeing pronoun ("bewegt sich", "der sich bewegt", "sich schnell bewegen").
    // Italian and French fix the goal's preposition, `direction_prep`: "verso" / "vers" for every goal,
    // where GO takes "a" / "à" for a place and Italian "da" for a person. After this verb those read
    // otherwise: "muoversi dal parlante" leaves the speaker, and "se déplacer au sol" / "muoversi al
    // suolo" move about on the ground (localization B34, B35).
    id: 'MOVE_ONESELF',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'direction', 'source', 'route', 'cause'],
    description: 'to change position',
    synonym: 'change position',
    emoji: '🐾',
    forms: {
      en: {
        base: 'move',
        '1sg_present': 'move', '2sg_present': 'move', '3sg_present': 'moves',
        '1pl_present': 'move', '2pl_present': 'move', '3pl_present': 'move',
        past: 'moved',
      },
      it: {
        base: 'muoversi', direction_prep: 'verso',
        '1sg_present': 'mi muovo', '2sg_present': 'ti muovi', '3sg_present': 'si muove',
        '1pl_present': 'ci muoviamo', '2pl_present': 'vi muovete', '3pl_present': 'si muovono',
        '1sg_past': 'mi mossi', '2sg_past': 'ti muovesti', '3sg_past': 'si mosse',
        '1pl_past': 'ci muovemmo', '2pl_past': 'vi muoveste', '3pl_past': 'si mossero',
        '1sg_future': 'mi muoverò', '2sg_future': 'ti muoverai', '3sg_future': 'si muoverà',
        '1pl_future': 'ci muoveremo', '2pl_future': 'vi muoverete', '3pl_future': 'si muoveranno',
      },
      fr: {
        // -cer keeps its soft c with a cedilla before a/o: nous déplaçons, il se déplaça.
        base: 'se déplacer', direction_prep: 'vers',
        '1sg_present': 'me déplace', '2sg_present': 'te déplaces', '3sg_present': 'se déplace',
        '1pl_present': 'nous déplaçons', '2pl_present': 'vous déplacez', '3pl_present': 'se déplacent',
        '1sg_past': 'me déplaçai', '2sg_past': 'te déplaças', '3sg_past': 'se déplaça',
        '1pl_past': 'nous déplaçâmes', '2pl_past': 'vous déplaçâtes', '3pl_past': 'se déplacèrent',
        '1sg_future': 'me déplacerai', '2sg_future': 'te déplaceras', '3sg_future': 'se déplacera',
        '1pl_future': 'nous déplacerons', '2pl_future': 'vous déplacerez', '3pl_future': 'se déplaceront',
      },
      de: {
        base: 'sich bewegen',
        '1sg_present': 'bewege', '2sg_present': 'bewegst', '3sg_present': 'bewegt',
        '1pl_present': 'bewegen', '2pl_present': 'bewegt', '3pl_present': 'bewegen',
        '1sg_past': 'bewegte', '2sg_past': 'bewegtest', '3sg_past': 'bewegte',
        '1pl_past': 'bewegten', '2pl_past': 'bewegtet', '3pl_past': 'bewegten',
      },
      es: {
        base: 'moverse',
        '1sg_present': 'me muevo', '2sg_present': 'te mueves', '3sg_present': 'se mueve',
        '1pl_present': 'nos movemos', '2pl_present': 'os movéis', '3pl_present': 'se mueven',
        '1sg_past': 'me moví', '2sg_past': 'te moviste', '3sg_past': 'se movió',
        '1pl_past': 'nos movimos', '2pl_past': 'os movisteis', '3pl_past': 'se movieron',
        '1sg_future': 'me moveré', '2sg_future': 'te moverás', '3sg_future': 'se moverá',
        '1pl_future': 'nos moveremos', '2pl_future': 'os moveréis', '3pl_future': 'se moverán',
      },
      ja: {
        base: '移動する',
        reading: 'いどうする',
        masu_present: '移動します',
        masu_present_reading: 'いどうします',
      },
      pt: {
        base: 'mover-se',
        '1sg_present': 'me movo', '2sg_present': 'se move', '3sg_present': 'se move',
        '1pl_present': 'nos movemos', '2pl_present': 'se movem', '3pl_present': 'se movem',
        '1sg_past': 'me movi', '2sg_past': 'se moveu', '3sg_past': 'se moveu',
        '1pl_past': 'nos movemos', '2pl_past': 'se moveram', '3pl_past': 'se moveram',
        '1sg_future': 'me moverei', '2sg_future': 'se moverá', '3sg_future': 'se moverá',
        '1pl_future': 'nos moveremos', '2pl_future': 'se moverão', '3pl_future': 'se moverão',
      },
    },
  },

  {
    id: 'BECOME',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['predicative', 'cause'],
    description: 'to come to be; to change into a different state',
    emoji: '🦋',
    forms: {
      en: {
        base: 'become',
        '1sg_present': 'become', '2sg_present': 'become', '3sg_present': 'becomes',
        '1pl_present': 'become', '2pl_present': 'become', '3pl_present': 'become',
        past: 'became',
      },
      it: {
        base: 'diventare',
        '1sg_present': 'divento', '2sg_present': 'diventi', '3sg_present': 'diventa',
        '1pl_present': 'diventiamo', '2pl_present': 'diventate', '3pl_present': 'diventano',
        '1sg_past': 'diventai', '2sg_past': 'diventasti', '3sg_past': 'diventò',
        '1pl_past': 'diventammo', '2pl_past': 'diventaste', '3pl_past': 'diventarono',
        '1sg_future': 'diventerò', '2sg_future': 'diventerai', '3sg_future': 'diventerà',
        '1pl_future': 'diventeremo', '2pl_future': 'diventerete', '3pl_future': 'diventeranno',
      },
      fr: {
        base: 'devenir',
        '1sg_present': 'deviens', '2sg_present': 'deviens', '3sg_present': 'devient',
        '1pl_present': 'devenons', '2pl_present': 'devenez', '3pl_present': 'deviennent',
        '1sg_past': 'devins', '2sg_past': 'devins', '3sg_past': 'devint',
        '1pl_past': 'devînmes', '2pl_past': 'devîntes', '3pl_past': 'devinrent',
        '1sg_future': 'deviendrai', '2sg_future': 'deviendras', '3sg_future': 'deviendra',
        '1pl_future': 'deviendrons', '2pl_future': 'deviendrez', '3pl_future': 'deviendront',
      },
      de: {
        base: 'werden',
        '1sg_present': 'werde', '2sg_present': 'wirst', '3sg_present': 'wird',
        '1pl_present': 'werden', '2pl_present': 'werdet', '3pl_present': 'werden',
        '1sg_past': 'wurde', '2sg_past': 'wurdest', '3sg_past': 'wurde',
        '1pl_past': 'wurden', '2pl_past': 'wurdet', '3pl_past': 'wurden',
      },
      es: {
        base: 'volverse',
        '1sg_present': 'me vuelvo', '2sg_present': 'te vuelves', '3sg_present': 'se vuelve',
        '1pl_present': 'nos volvemos', '2pl_present': 'os volvéis', '3pl_present': 'se vuelven',
        '1sg_past': 'me volví', '2sg_past': 'te volviste', '3sg_past': 'se volvió',
        '1pl_past': 'nos volvimos', '2pl_past': 'os volvisteis', '3pl_past': 'se volvieron',
        '1sg_future': 'me volveré', '2sg_future': 'te volverás', '3sg_future': 'se volverá',
        '1pl_future': 'nos volveremos', '2pl_future': 'os volveréis', '3pl_future': 'se volverán',
      },
      ja: {
        base: 'なる',
        reading: 'なる',
        masu_present: 'なります',
        masu_present_reading: 'なります',
      },
      pt: {
        base: 'tornar-se',
        '1sg_present': 'me torno', '2sg_present': 'se torna', '3sg_present': 'se torna',
        '1pl_present': 'nos tornamos', '2pl_present': 'se tornam', '3pl_present': 'se tornam',
        '1sg_past': 'me tornei', '2sg_past': 'se tornou', '3sg_past': 'se tornou',
        '1pl_past': 'nos tornamos', '2pl_past': 'se tornaram', '3pl_past': 'se tornaram',
        '1sg_future': 'me tornarei', '2sg_future': 'se tornará', '3sg_future': 'se tornará',
        '1pl_future': 'nos tornaremos', '2pl_future': 'se tornarão', '3pl_future': 'se tornarão',
      },
    },
  },

  {
    id: 'SEEM',
    role: 'verb',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'intransitive',
    // The SEEMING verb: it ascribes a resemblance, so it takes a subject complement — the thing
    // the subject looks like ("seems tired", "seems to be a legend"). Deliberately disjoint from
    // APPEAR, which is the coming-into-view verb and licenses no `predicative` at all.
    // `seeming: '1'` marks the seeming verb on every lexeme, the way `copula` marks BE: each engine
    // decides whether its seeming verb takes a bare predicate noun. en/de do not, and add the
    // infinitival copula ("seems to be a legend", "scheint eine Legende zu sein"); it/fr/es/pt/ja do.
    complements: ['predicative', 'locative', 'cause', 'terminus'],
    description: 'to look like; to give the impression of being similar to',
    // "to be perceived as an object" (localization A16): the PASSIVE of the genus PERCEIVE with
    // the ESSIVE object complement — the thing is taken as X without becoming X, which is the
    // impression SEEM gives. The passive promotes the patient to subject, and the citation drops
    // it along with the agent GENERIC_PERSON, so neither determiner shows. Only English keeps the
    // complement's article ("as an object"); the essive drops it elsewhere ("come oggetto", de
    // "als Gegenstand empfunden werden", ja 物体として知覚される). Inline, because GlossParts has no
    // `voice`. PERCEIVE, not SEE: SEE is "to perceive light", and seeming is not only sight.
    definition: {
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'PERCEIVE', voice: 'passive' },
      directObject: { concept: 'OBJECT_THING' },
      complements: {
        objectPredicative: {
          phrase: { concept: 'OBJECT_THING', definiteness: 'indefinite' },
          specifiers: [{ kind: 'predication', value: 'essive' }],
        },
      },
      infinitive: true,
    },
    synonym: 'look like',
    emoji: '🤔',
    forms: {
      en: {
        base: 'seem', seeming: '1',
        '1sg_present': 'seem', '2sg_present': 'seem', '3sg_present': 'seems',
        '1pl_present': 'seem', '2pl_present': 'seem', '3pl_present': 'seem',
        past: 'seemed',
      },
      it: {
        base: 'sembrare', seeming: '1',
        '1sg_present': 'sembro', '2sg_present': 'sembri', '3sg_present': 'sembra',
        '1pl_present': 'sembriamo', '2pl_present': 'sembrate', '3pl_present': 'sembrano',
        '1sg_past': 'sembrai', '2sg_past': 'sembrasti', '3sg_past': 'sembrò',
        '1pl_past': 'sembrammo', '2pl_past': 'sembraste', '3pl_past': 'sembrarono',
        '1sg_future': 'sembrerò', '2sg_future': 'sembrerai', '3sg_future': 'sembrerà',
        '1pl_future': 'sembreremo', '2pl_future': 'sembrerete', '3pl_future': 'sembreranno',
      },
      fr: {
        base: 'sembler', seeming: '1',
        '1sg_present': 'semble', '2sg_present': 'sembles', '3sg_present': 'semble',
        '1pl_present': 'semblons', '2pl_present': 'semblez', '3pl_present': 'semblent',
        '1sg_past': 'semblai', '2sg_past': 'semblas', '3sg_past': 'sembla',
        '1pl_past': 'semblâmes', '2pl_past': 'semblâtes', '3pl_past': 'semblèrent',
        '1sg_future': 'semblerai', '2sg_future': 'sembleras', '3sg_future': 'semblera',
        '1pl_future': 'semblerons', '2pl_future': 'semblerez', '3pl_future': 'sembleront',
      },
      de: {
        base: 'scheinen', seeming: '1',
        '1sg_present': 'scheine', '2sg_present': 'scheinst', '3sg_present': 'scheint',
        '1pl_present': 'scheinen', '2pl_present': 'scheint', '3pl_present': 'scheinen',
        '1sg_past': 'schien', '2sg_past': 'schienst', '3sg_past': 'schien',
        '1pl_past': 'schienen', '2pl_past': 'schient', '3pl_past': 'schienen',
      },
      es: {
        base: 'parecer', seeming: '1',
        '1sg_present': 'parezco', '2sg_present': 'pareces', '3sg_present': 'parece',
        '1pl_present': 'parecemos', '2pl_present': 'parecéis', '3pl_present': 'parecen',
        '1sg_past': 'parecí', '2sg_past': 'pareciste', '3sg_past': 'pareció',
        '1pl_past': 'parecimos', '2pl_past': 'parecisteis', '3pl_past': 'parecieron',
        '1sg_future': 'pareceré', '2sg_future': 'parecerás', '3sg_future': 'parecerá',
        '1pl_future': 'pareceremos', '2pl_future': 'pareceréis', '3pl_future': 'parecerán',
      },
      ja: {
        // 思える is itself a Japanese state verb, like ある: it says the state holds without 〜ている (A132).
        base: '思える', seeming: '1', state_verb: '1',
        reading: 'おもえる',
        masu_present: '思えます',
        masu_present_reading: 'おもえます',
      },
      pt: {
        base: 'parecer', seeming: '1',
        '1sg_present': 'pareço', '2sg_present': 'parece', '3sg_present': 'parece',
        '1pl_present': 'parecemos', '2pl_present': 'parecem', '3pl_present': 'parecem',
        '1sg_past': 'pareci', '2sg_past': 'pareceu', '3sg_past': 'pareceu',
        '1pl_past': 'parecemos', '2pl_past': 'pareceram', '3pl_past': 'pareceram',
        '1sg_future': 'parecerei', '2sg_future': 'parecerá', '3sg_future': 'parecerá',
        '1pl_future': 'pareceremos', '2pl_future': 'parecerão', '3pl_future': 'parecerão',
      },
    },
  },

  {
    id: 'APPEAR',
    role: 'verb',
    transitivity: 'intransitive',
    // The COMING-INTO-VIEW verb — the one whose opposite is disappearing, not the seeming verb.
    // It says *that* the subject shows up (and where, and to whom), never *what it is like*, so
    // it licenses NO `predicative`: "the cat appears in the house / to the dog", but not
    // "*the cat appears a legend" (that is SEEM). Every language's lexeme here is the
    // come-into-view verb — apparire / apparaître / aparecer / erscheinen / 現れる — and none of
    // them takes a predicate nominative, which is why the slot is withheld rather than repaired.
    complements: ['locative', 'cause', 'terminus'],
    description: 'to come into view; to become visible',
    // The second half of the description, composed: BECOME + VISIBLE, the state coming into view
    // leaves the thing in (localization C08). No language's word for it echoes its own lemma —
    // "diventare visibile" for apparire, 可視になる for 現れる.
    definition: infinitiveGloss('BECOME', { predicate: 'VISIBLE' }),
    synonym: 'come into view',
    emoji: '👀',
    forms: {
      en: {
        base: 'appear',
        '1sg_present': 'appear', '2sg_present': 'appear', '3sg_present': 'appears',
        '1pl_present': 'appear', '2pl_present': 'appear', '3pl_present': 'appear',
        past: 'appeared',
      },
      it: {
        base: 'apparire',
        '1sg_present': 'appaio', '2sg_present': 'appari', '3sg_present': 'appare',
        '1pl_present': 'appariamo', '2pl_present': 'apparite', '3pl_present': 'appaiono',
        '1sg_past': 'apparvi', '2sg_past': 'apparisti', '3sg_past': 'apparve',
        '1pl_past': 'apparimmo', '2pl_past': 'appariste', '3pl_past': 'apparvero',
        '1sg_future': 'apparirò', '2sg_future': 'apparirai', '3sg_future': 'apparirà',
        '1pl_future': 'appariremo', '2pl_future': 'apparirete', '3pl_future': 'appariranno',
      },
      fr: {
        base: 'apparaître',
        '1sg_present': 'apparais', '2sg_present': 'apparais', '3sg_present': 'apparaît',
        '1pl_present': 'apparaissons', '2pl_present': 'apparaissez', '3pl_present': 'apparaissent',
        '1sg_past': 'apparus', '2sg_past': 'apparus', '3sg_past': 'apparut',
        '1pl_past': 'apparûmes', '2pl_past': 'apparûtes', '3pl_past': 'apparurent',
        '1sg_future': 'apparaîtrai', '2sg_future': 'apparaîtras', '3sg_future': 'apparaîtra',
        '1pl_future': 'apparaîtrons', '2pl_future': 'apparaîtrez', '3pl_future': 'apparaîtront',
      },
      de: {
        base: 'erscheinen',
        '1sg_present': 'erscheine', '2sg_present': 'erscheinst', '3sg_present': 'erscheint',
        '1pl_present': 'erscheinen', '2pl_present': 'erscheint', '3pl_present': 'erscheinen',
        '1sg_past': 'erschien', '2sg_past': 'erschienst', '3sg_past': 'erschien',
        '1pl_past': 'erschienen', '2pl_past': 'erschient', '3pl_past': 'erschienen',
      },
      es: {
        base: 'aparecer',
        '1sg_present': 'aparezco', '2sg_present': 'apareces', '3sg_present': 'aparece',
        '1pl_present': 'aparecemos', '2pl_present': 'aparecéis', '3pl_present': 'aparecen',
        '1sg_past': 'aparecí', '2sg_past': 'apareciste', '3sg_past': 'apareció',
        '1pl_past': 'aparecimos', '2pl_past': 'aparecisteis', '3pl_past': 'aparecieron',
        '1sg_future': 'apareceré', '2sg_future': 'aparecerás', '3sg_future': 'aparecerá',
        '1pl_future': 'apareceremos', '2pl_future': 'apareceréis', '3pl_future': 'aparecerán',
      },
      // 現れる, not 見える: 見える is "be visible / look like", the SEEM sense, and it collides
      // with the terminus に ("猫は犬に見えます" reads as *looks like a dog*, not "appears to the
      // dog"). 現れる is unambiguously the coming-into-view verb.
      ja: {
        base: '現れる',
        reading: 'あらわれる',
        masu_present: '現れます',
        masu_present_reading: 'あらわれます',
      },
      pt: {
        base: 'aparecer',
        '1sg_present': 'apareço', '2sg_present': 'aparece', '3sg_present': 'aparece',
        '1pl_present': 'aparecemos', '2pl_present': 'aparecem', '3pl_present': 'aparecem',
        '1sg_past': 'apareci', '2sg_past': 'apareceu', '3sg_past': 'apareceu',
        '1pl_past': 'aparecemos', '2pl_past': 'apareceram', '3pl_past': 'apareceram',
        '1sg_future': 'aparecerei', '2sg_future': 'aparecerá', '3sg_future': 'aparecerá',
        '1pl_future': 'apareceremos', '2pl_future': 'aparecerão', '3pl_future': 'aparecerão',
      },
    },
  },

  {
    // The copula "to be" + a predicate adjective — the plain "is careful" that BECOME/SEEM/
    // APPEAR can't express. `copula: '1'` is the marker the en engine reads to negate directly
    // ("is not careful", not "*does not be") and the ja engine reads to render です (慎重です),
    // not the になる-flavoured に. it/fr/de/es/pt treat it as an ordinary intransitive verb whose
    // predicative adjective agrees with the subject — the path BECOME already exercises.
    id: 'BE',
    role: 'verb',
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    transitivity: 'intransitive',
    complements: ['predicative', 'locative', 'cause'],
    description: 'to have a quality or state; the copula',
    emoji: '🟰',
    forms: {
      en: {
        base: 'be', copula: '1',
        '1sg_present': 'am', '2sg_present': 'are', '3sg_present': 'is',
        '1pl_present': 'are', '2pl_present': 'are', '3pl_present': 'are',
        '1sg_past': 'was', '2sg_past': 'were', '3sg_past': 'was',
        '1pl_past': 'were', '2pl_past': 'were', '3pl_past': 'were',
      },
      it: {
        base: 'essere', copula: '1',
        '1sg_present': 'sono', '2sg_present': 'sei', '3sg_present': 'è',
        '1pl_present': 'siamo', '2pl_present': 'siete', '3pl_present': 'sono',
        '1sg_past': 'fui', '2sg_past': 'fosti', '3sg_past': 'fu',
        '1pl_past': 'fummo', '2pl_past': 'foste', '3pl_past': 'furono',
        '1sg_future': 'sarò', '2sg_future': 'sarai', '3sg_future': 'sarà',
        '1pl_future': 'saremo', '2pl_future': 'sarete', '3pl_future': 'saranno',
      },
      fr: {
        base: 'être', copula: '1',
        '1sg_present': 'suis', '2sg_present': 'es', '3sg_present': 'est',
        '1pl_present': 'sommes', '2pl_present': 'êtes', '3pl_present': 'sont',
        '1sg_past': 'fus', '2sg_past': 'fus', '3sg_past': 'fut',
        '1pl_past': 'fûmes', '2pl_past': 'fûtes', '3pl_past': 'furent',
        '1sg_future': 'serai', '2sg_future': 'seras', '3sg_future': 'sera',
        '1pl_future': 'serons', '2pl_future': 'serez', '3pl_future': 'seront',
      },
      de: {
        base: 'sein', copula: '1',
        '1sg_present': 'bin', '2sg_present': 'bist', '3sg_present': 'ist',
        '1pl_present': 'sind', '2pl_present': 'seid', '3pl_present': 'sind',
        '1sg_past': 'war', '2sg_past': 'warst', '3sg_past': 'war',
        '1pl_past': 'waren', '2pl_past': 'wart', '3pl_past': 'waren',
        '2sg_imperative': 'sei', '1pl_imperative': 'seien', // suppletive command: sei / seien wir
      },
      es: {
        base: 'ser', copula: '1',
        '1sg_present': 'soy', '2sg_present': 'eres', '3sg_present': 'es',
        '1pl_present': 'somos', '2pl_present': 'sois', '3pl_present': 'son',
        '1sg_past': 'fui', '2sg_past': 'fuiste', '3sg_past': 'fue',
        '1pl_past': 'fuimos', '2pl_past': 'fuisteis', '3pl_past': 'fueron',
        '1sg_future': 'seré', '2sg_future': 'serás', '3sg_future': 'será',
        '1pl_future': 'seremos', '2pl_future': 'seréis', '3pl_future': 'serán',
      },
      ja: {
        // Rendered specially by the engine: the copula です on a predicative, or the existential
        // いる / ある for a locative alone (predicateSegs). These forms are a safety fallback only.
        base: 'です', copula: '1',
        masu_present: 'です',
      },
      pt: {
        base: 'ser', copula: '1',
        '1sg_present': 'sou', '2sg_present': 'é', '3sg_present': 'é',
        '1pl_present': 'somos', '2pl_present': 'são', '3pl_present': 'são',
        '1sg_past': 'fui', '2sg_past': 'foi', '3sg_past': 'foi',
        '1pl_past': 'fomos', '2pl_past': 'foram', '3pl_past': 'foram',
        '1sg_future': 'serei', '2sg_future': 'será', '3sg_future': 'será',
        '1pl_future': 'seremos', '2pl_future': 'serão', '3pl_future': 'serão',
      },
    },
  },
  {
    // BE's sense of faring (P09-E31): being in a state of well-being, which the Romance languages and
    // German say with a verb of their own — it *stare* ("sta bene"), fr *aller* ("va bien"), de *gehen*
    // ("es geht gut"). A predicate adjective names it as its `copula` (OKAY), and the translator swaps it
    // in for BE there (`lexicalCopula`), so it is a sense of BE and no picker offers it. Spanish and
    // Portuguese say *estar*, English *fare* and Japanese 過ごす, which no predicate names today.
    // A state: the Romance past is its imperfect ("stava bene", "allait bien").
    id: 'BE_FARING',
    role: 'verb',
    senseOf: 'BE',
    stative: true,
    transitivity: 'intransitive',
    complements: ['predicative', 'cause'],
    description: 'to get on; to be in a state of well-being',
    emoji: '🟰',
    forms: {
      en: {
        base: 'fare',
        '1sg_present': 'fare', '2sg_present': 'fare', '3sg_present': 'fares',
        '1pl_present': 'fare', '2pl_present': 'fare', '3pl_present': 'fare',
        past: 'fared',
      },
      it: {
        base: 'stare',
        '1sg_present': 'sto', '2sg_present': 'stai', '3sg_present': 'sta',
        '1pl_present': 'stiamo', '2pl_present': 'state', '3pl_present': 'stanno',
        '1sg_past': 'stetti', '2sg_past': 'stesti', '3sg_past': 'stette',
        '1pl_past': 'stemmo', '2pl_past': 'steste', '3pl_past': 'stettero',
        '1sg_future': 'starò', '2sg_future': 'starai', '3sg_future': 'starà',
        '1pl_future': 'staremo', '2pl_future': 'starete', '3pl_future': 'staranno',
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
        base: 'estar',
        '1sg_present': 'estoy', '2sg_present': 'estás', '3sg_present': 'está',
        '1pl_present': 'estamos', '2pl_present': 'estáis', '3pl_present': 'están',
        '1sg_past': 'estuve', '2sg_past': 'estuviste', '3sg_past': 'estuvo',
        '1pl_past': 'estuvimos', '2pl_past': 'estuvisteis', '3pl_past': 'estuvieron',
        '1sg_future': 'estaré', '2sg_future': 'estarás', '3sg_future': 'estará',
        '1pl_future': 'estaremos', '2pl_future': 'estaréis', '3pl_future': 'estarán',
      },
      ja: {
        base: '過ごす',
        reading: 'すごす',
        masu_present: '過ごします',
        masu_present_reading: 'すごします',
      },
      pt: {
        base: 'estar',
        '1sg_present': 'estou', '2sg_present': 'está', '3sg_present': 'está',
        '1pl_present': 'estamos', '2pl_present': 'estão', '3pl_present': 'estão',
        '1sg_past': 'estive', '2sg_past': 'esteve', '3sg_past': 'esteve',
        '1pl_past': 'estivemos', '2pl_past': 'estiveram', '3pl_past': 'estiveram',
        '1sg_future': 'estarei', '2sg_future': 'estará', '3sg_future': 'estará',
        '1pl_future': 'estaremos', '2pl_future': 'estarão', '3pl_future': 'estarão',
      },
    },
  },
  // ── Flying, the motion a wing is for (localization B52) ────────────
  {
    id: 'FLY',
    role: 'verb',
    transitivity: 'intransitive',
    complements: ['manner', 'locative', 'direction', 'source', 'route', 'cause'],
    description: 'to move through the air',
    // Its own description, on the route complement MOVE_ONESELF already licenses (localization C28):
    // "sich durch die Luft bewegen", es "moverse por el aire", ja 空気を移動する — the を of the space
    // moved through, as 大辞林 glosses 飛ぶ (空中を移動する). Definite, the one air there is; JUMP's
    // "to move into the air" is the same noun as a direction, so the two stay apart in all seven.
    definition: infinitiveGloss('MOVE_ONESELF', {
      complements: { route: { phrase: { concept: 'AIR', definiteness: 'definite' } } },
    }),
    emoji: '🕊️',
    isA: 'MOVE_ONESELF',
    forms: {
      en: {
        base: 'fly',
        '1sg_present': 'fly', '2sg_present': 'fly', '3sg_present': 'flies',
        '1pl_present': 'fly', '2pl_present': 'fly', '3pl_present': 'fly',
        past: 'flew',
      },
      it: {
        base: 'volare', direction_prep: 'verso',
        '1sg_present': 'volo', '2sg_present': 'voli', '3sg_present': 'vola',
        '1pl_present': 'voliamo', '2pl_present': 'volate', '3pl_present': 'volano',
        '1sg_past': 'volai', '2sg_past': 'volasti', '3sg_past': 'volò',
        '1pl_past': 'volammo', '2pl_past': 'volaste', '3pl_past': 'volarono',
        '1sg_future': 'volerò', '2sg_future': 'volerai', '3sg_future': 'volerà',
        '1pl_future': 'voleremo', '2pl_future': 'volerete', '3pl_future': 'voleranno',
      },
      fr: {
        base: 'voler', direction_prep: 'vers',
        '1sg_present': 'vole', '2sg_present': 'voles', '3sg_present': 'vole',
        '1pl_present': 'volons', '2pl_present': 'volez', '3pl_present': 'volent',
        '1sg_past': 'volai', '2sg_past': 'volas', '3sg_past': 'vola',
        '1pl_past': 'volâmes', '2pl_past': 'volâtes', '3pl_past': 'volèrent',
        '1sg_future': 'volerai', '2sg_future': 'voleras', '3sg_future': 'volera',
        '1pl_future': 'volerons', '2pl_future': 'volerez', '3pl_future': 'voleront',
      },
      de: {
        // fliegen is strong: the past is flog, and the resultative selects sein.
        base: 'fliegen',
        '1sg_present': 'fliege', '2sg_present': 'fliegst', '3sg_present': 'fliegt',
        '1pl_present': 'fliegen', '2pl_present': 'fliegt', '3pl_present': 'fliegen',
        '1sg_past': 'flog', '2sg_past': 'flogst', '3sg_past': 'flog',
        '1pl_past': 'flogen', '2pl_past': 'flogt', '3pl_past': 'flogen',
      },
      es: {
        // volar stem-changes o → ue under the stress.
        base: 'volar',
        '1sg_present': 'vuelo', '2sg_present': 'vuelas', '3sg_present': 'vuela',
        '1pl_present': 'volamos', '2pl_present': 'voláis', '3pl_present': 'vuelan',
        '1sg_past': 'volé', '2sg_past': 'volaste', '3sg_past': 'voló',
        '1pl_past': 'volamos', '2pl_past': 'volasteis', '3pl_past': 'volaron',
        '1sg_future': 'volaré', '2sg_future': 'volarás', '3sg_future': 'volará',
        '1pl_future': 'volaremos', '2pl_future': 'volaréis', '3pl_future': 'volarán',
      },
      ja: {
        base: '飛ぶ',
        reading: 'とぶ',
        masu_present: '飛びます',
        masu_present_reading: 'とびます',
      },
      pt: {
        base: 'voar',
        '1sg_present': 'voo', '2sg_present': 'voa', '3sg_present': 'voa',
        '1pl_present': 'voamos', '2pl_present': 'voam', '3pl_present': 'voam',
        '1sg_past': 'voei', '2sg_past': 'voou', '3sg_past': 'voou',
        '1pl_past': 'voamos', '2pl_past': 'voaram', '3pl_past': 'voaram',
        '1sg_future': 'voarei', '2sg_future': 'voará', '3sg_future': 'voará',
        '1pl_future': 'voaremos', '2pl_future': 'voarão', '3pl_future': 'voarão',
      },
    },
  },
];
