import type { GswColumn } from './types.js';

export const GSW_VERBS_TRANSITIVE: GswColumn = {
  CUT: {
    base: 'schniide',
    '1sg_present': 'schniid', '2sg_present': 'schniidsch', '3sg_present': 'schniidet',
    '1pl_present': 'schniided', '2pl_present': 'schniided', '3pl_present': 'schniided',
    participle: 'gschnitte', '2sg_imperative': 'schniid',
  },
  EAT: {
    base: 'ässe', subject_sense: 'EAT_ANIMAL',
    '1sg_present': 'iss', '2sg_present': 'issisch', '3sg_present': 'isst',
    '1pl_present': 'ässed', '2pl_present': 'ässed', '3pl_present': 'ässed',
    participle: 'gässe', '2sg_imperative': 'iss',
  },
  EAT_ANIMAL: {
    base: 'frässe',
    '1sg_present': 'friss', '2sg_present': 'frissisch', '3sg_present': 'frisst',
    '1pl_present': 'frässed', '2pl_present': 'frässed', '3pl_present': 'frässed',
    participle: 'gfrässe', '2sg_imperative': 'friss',
  },
  DRINK: {
    base: 'trinke',
    '1sg_present': 'trink', '2sg_present': 'trinksch', '3sg_present': 'trinkt',
    '1pl_present': 'trinked', '2pl_present': 'trinked', '3pl_present': 'trinked',
    participle: 'trunke', '2sg_imperative': 'trink',
  },
  // Zürich schütte, not giesse (which is watering plants)
  POUR: {
    base: 'schütte',
    '1sg_present': 'schütt', '2sg_present': 'schüttsch', '3sg_present': 'schüttet',
    '1pl_present': 'schütted', '2pl_present': 'schütted', '3pl_present': 'schütted',
    participle: 'gschüttet', '2sg_imperative': 'schütt',
  },
  CONSUME: {
    base: 'konsumiere',
    '1sg_present': 'konsumier', '2sg_present': 'konsumiersch', '3sg_present': 'konsumiert',
    '1pl_present': 'konsumiered', '2pl_present': 'konsumiered', '3pl_present': 'konsumiered',
    participle: 'konsumiert', '2sg_imperative': 'konsumier',
  },
  // irregular core; the imperative is lueg
  SEE: {
    base: 'gsee',
    '1sg_present': 'gsee', '2sg_present': 'gsesch', '3sg_present': 'gseet',
    '1pl_present': 'gsehnd', '2pl_present': 'gsehnd', '3pl_present': 'gsehnd',
    participle: 'gsee', '2sg_imperative': 'lueg',
  },
  LOVE: {
    base: 'liebe',
    '1sg_present': 'lieb', '2sg_present': 'liebsch', '3sg_present': 'liebt',
    '1pl_present': 'liebed', '2pl_present': 'liebed', '3pl_present': 'liebed',
    participle: 'gliebt', '2sg_imperative': 'lieb',
  },
  DESIRE: {
    base: 'wünsche',
    '1sg_present': 'wünsch', '2sg_present': 'wünschisch', '3sg_present': 'wünscht',
    '1pl_present': 'wünsched', '2pl_present': 'wünsched', '3pl_present': 'wünsched',
    participle: 'gwünscht', '2sg_imperative': 'wünsch',
  },
  // participle: the g- merges into t
  KILL: {
    base: 'töte',
    '1sg_present': 'töt', '2sg_present': 'tötsch', '3sg_present': 'tötet',
    '1pl_present': 'töted', '2pl_present': 'töted', '3pl_present': 'töted',
    participle: 'tötet', '2sg_imperative': 'töt',
  },
  // imperative wüss (verify)
  KNOW: {
    base: 'wüsse', content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED',
    '1sg_present': 'weiss', '2sg_present': 'weisch', '3sg_present': 'weiss',
    '1pl_present': 'wüssed', '2pl_present': 'wüssed', '3pl_present': 'wüssed',
    participle: 'gwüsst', '2sg_imperative': 'wüss',
  },
  // participle kännt (verify)
  KNOW_ACQUAINTED: {
    base: 'kenne',
    '1sg_present': 'kenn', '2sg_present': 'kennsch', '3sg_present': 'kennt',
    '1pl_present': 'kenned', '2pl_present': 'kenned', '3pl_present': 'kenned',
    participle: 'kännt', '2sg_imperative': 'kenn',
  },
  REMEMBER: {
    base: 'sich erinnere', object_prep: 'a',
    '1sg_present': 'erinner', '2sg_present': 'erinnersch', '3sg_present': 'erinneret',
    '1pl_present': 'erinnered', '2pl_present': 'erinnered', '3pl_present': 'erinnered',
    participle: 'erinneret', '2sg_imperative': 'erinner',
  },
  // learned word; Zürich would rather say sich öppis überlegge (verify)
  CONSIDER: {
    base: 'erwääge',
    '1sg_present': 'erwääg', '2sg_present': 'erwäägsch', '3sg_present': 'erwäägt',
    '1pl_present': 'erwääged', '2pl_present': 'erwääged', '3pl_present': 'erwääged',
    participle: 'erwoge', '2sg_imperative': 'erwääg',
  },
  EXPECT: {
    base: 'erwarte',
    '1sg_present': 'erwart', '2sg_present': 'erwartsch', '3sg_present': 'erwartet',
    '1pl_present': 'erwarted', '2pl_present': 'erwarted', '3pl_present': 'erwarted',
    participle: 'erwartet', '2sg_imperative': 'erwart',
  },
  READ: {
    base: 'läse',
    '1sg_present': 'lis', '2sg_present': 'lisisch', '3sg_present': 'list',
    '1pl_present': 'läsed', '2pl_present': 'läsed', '3pl_present': 'läsed',
    participle: 'gläse', '2sg_imperative': 'lis',
  },
  // participle grüeft (verify: also grüefe)
  CRY_OUT: {
    base: 'rüefe',
    '1sg_present': 'rüef', '2sg_present': 'rüefsch', '3sg_present': 'rüeft',
    '1pl_present': 'rüefed', '2pl_present': 'rüefed', '3pl_present': 'rüefed',
    participle: 'grüeft', '2sg_imperative': 'rüef',
  },
  BITE: {
    base: 'biisse',
    '1sg_present': 'biiss', '2sg_present': 'biissisch', '3sg_present': 'biisst',
    '1pl_present': 'biissed', '2pl_present': 'biissed', '3pl_present': 'biissed',
    participle: 'bisse', '2sg_imperative': 'biiss',
  },
  // short verb like gaa: mir schlönd
  BEAT: {
    base: 'schlaa',
    '1sg_present': 'schlaa', '2sg_present': 'schlaasch', '3sg_present': 'schlaat',
    '1pl_present': 'schlönd', '2pl_present': 'schlönd', '3pl_present': 'schlönd',
    participle: 'gschlage', '2sg_imperative': 'schlaa',
  },
  SET_ON_FIRE: {
    base: 'verbrenne',
    '1sg_present': 'verbrenn', '2sg_present': 'verbrennsch', '3sg_present': 'verbrennt',
    '1pl_present': 'verbrenned', '2pl_present': 'verbrenned', '3pl_present': 'verbrenned',
    participle: 'verbrännt', '2sg_imperative': 'verbrenn',
  },
  EXTINGUISH: {
    base: 'lösche',
    '1sg_present': 'lösch', '2sg_present': 'löschisch', '3sg_present': 'löscht',
    '1pl_present': 'lösched', '2pl_present': 'lösched', '3pl_present': 'lösched',
    participle: 'glöscht', '2sg_imperative': 'lösch',
  },
  BUY: {
    base: 'chaufe',
    '1sg_present': 'chauf', '2sg_present': 'chaufsch', '3sg_present': 'chauft',
    '1pl_present': 'chaufed', '2pl_present': 'chaufed', '3pl_present': 'chaufed',
    participle: 'gchauft', '2sg_imperative': 'chauf',
  },
  OWN: {
    base: 'besitze',
    '1sg_present': 'besitz', '2sg_present': 'besitzisch', '3sg_present': 'besitzt',
    '1pl_present': 'besitzed', '2pl_present': 'besitzed', '3pl_present': 'besitzed',
    participle: 'besässe', '2sg_imperative': 'besitz',
  },
  HOLD: {
    base: 'enthalte',
    '1sg_present': 'enthalt', '2sg_present': 'enthaltsch', '3sg_present': 'enthaltet',
    '1pl_present': 'enthalted', '2pl_present': 'enthalted', '3pl_present': 'enthalted',
    participle: 'enthalte', '2sg_imperative': 'enthalt',
  },
  HOLD_GRASP: {
    base: 'halte',
    '1sg_present': 'halt', '2sg_present': 'haltsch', '3sg_present': 'haltet',
    '1pl_present': 'halted', '2pl_present': 'halted', '3pl_present': 'halted',
    participle: 'ghalte', '2sg_imperative': 'halt',
  },
  INCLUDE: {
    base: 'umfasse',
    '1sg_present': 'umfass', '2sg_present': 'umfassisch', '3sg_present': 'umfasst',
    '1pl_present': 'umfassed', '2pl_present': 'umfassed', '3pl_present': 'umfassed',
    participle: 'umfasst', '2sg_imperative': 'umfass',
  },
  CONFINE: {
    base: 'inhaftiere',
    '1sg_present': 'inhaftier', '2sg_present': 'inhaftiersch', '3sg_present': 'inhaftiert',
    '1pl_present': 'inhaftiered', '2pl_present': 'inhaftiered', '3pl_present': 'inhaftiered',
    participle: 'inhaftiert', '2sg_imperative': 'inhaftier',
  },
  TAME: {
    base: 'zääme',
    '1sg_present': 'zääm', '2sg_present': 'zäämsch', '3sg_present': 'zäämt',
    '1pl_present': 'zäämed', '2pl_present': 'zäämed', '3pl_present': 'zäämed',
    participle: 'gzäämt', '2sg_imperative': 'zääm',
  },
  // irregular core
  MAKE: {
    base: 'mache',
    '1sg_present': 'mache', '2sg_present': 'machsch', '3sg_present': 'macht',
    '1pl_present': 'mached', '2pl_present': 'mached', '3pl_present': 'mached',
    participle: 'gmacht', '2sg_imperative': 'mach',
  },
  // irregular core
  DO: {
    base: 'tue',
    '1sg_present': 'tue', '2sg_present': 'tuesch', '3sg_present': 'tuet',
    '1pl_present': 'tüend', '2pl_present': 'tüend', '3pl_present': 'tüend',
    participle: 'taa', '2sg_imperative': 'tue',
  },
  // Zürich wiitermache, not furtsetze
  CONTINUE: {
    base: 'wiitermache', particle: 'wiiter',
    '1sg_present': 'mache', '2sg_present': 'machsch', '3sg_present': 'macht',
    '1pl_present': 'mached', '2pl_present': 'mached', '3pl_present': 'mached',
    participle: 'wiitergmacht', '2sg_imperative': 'mach',
  },
  PLAY_INSTRUMENT: {
    base: 'spiele',
    '1sg_present': 'spiel', '2sg_present': 'spielsch', '3sg_present': 'spielt',
    '1pl_present': 'spieled', '2pl_present': 'spieled', '3pl_present': 'spieled',
    participle: 'gspielt', '2sg_imperative': 'spiel',
  },
  NEED: {
    base: 'bruuche',
    '1sg_present': 'bruuch', '2sg_present': 'bruuchsch', '3sg_present': 'bruucht',
    '1pl_present': 'bruuched', '2pl_present': 'bruuched', '3pl_present': 'bruuched',
    participle: 'bruucht', '2sg_imperative': 'bruuch',
  },
  // Zürich probiere, not versueche
  TRY: {
    base: 'probiere',
    '1sg_present': 'probier', '2sg_present': 'probiersch', '3sg_present': 'probiert',
    '1pl_present': 'probiered', '2pl_present': 'probiered', '3pl_present': 'probiered',
    participle: 'probiert', '2sg_imperative': 'probier',
  },
  CREATE: {
    base: 'erschaffe',
    '1sg_present': 'erschaff', '2sg_present': 'erschaffsch', '3sg_present': 'erschafft',
    '1pl_present': 'erschaffed', '2pl_present': 'erschaffed', '3pl_present': 'erschaffed',
    participle: 'erschaffe', '2sg_imperative': 'erschaff',
  },
  DESTROY: {
    base: 'zerstööre',
    '1sg_present': 'zerstöör', '2sg_present': 'zerstöörsch', '3sg_present': 'zerstöört',
    '1pl_present': 'zerstööred', '2pl_present': 'zerstööred', '3pl_present': 'zerstööred',
    participle: 'zerstöört', '2sg_imperative': 'zerstöör',
  },
  PERCEIVE: {
    base: 'empfinde',
    '1sg_present': 'empfind', '2sg_present': 'empfindsch', '3sg_present': 'empfindet',
    '1pl_present': 'empfinded', '2pl_present': 'empfinded', '3pl_present': 'empfinded',
    participle: 'empfunde', '2sg_imperative': 'empfind',
  },
  // short verb like staa; imperative verstand (verify)
  UNDERSTAND: {
    base: 'verstaa',
    '1sg_present': 'verstaa', '2sg_present': 'verstaasch', '3sg_present': 'verstaat',
    '1pl_present': 'verstönd', '2pl_present': 'verstönd', '3pl_present': 'verstönd',
    participle: 'verstande', '2sg_imperative': 'verstand',
  },
  // irregular core
  HAVE: {
    base: 'haa',
    '1sg_present': 'ha', '2sg_present': 'hesch', '3sg_present': 'hät',
    '1pl_present': 'händ', '2pl_present': 'händ', '3pl_present': 'händ',
    participle: 'ghaa', '2sg_imperative': 'heb',
    // *haa*'s synthetic conditional, as *sii*'s (P10-E13 D1): "wenn er es Huus hett".
    '1sg_conditional': 'hett', '2sg_conditional': 'hettsch', '3sg_conditional': 'hett',
    '1pl_conditional': 'hetted', '2pl_conditional': 'hetted', '3pl_conditional': 'hetted',
  },
  ACQUIRE: {
    base: 'erwerbe',
    '1sg_present': 'erwirb', '2sg_present': 'erwirbsch', '3sg_present': 'erwirbt',
    '1pl_present': 'erwerbed', '2pl_present': 'erwerbed', '3pl_present': 'erwerbed',
    participle: 'erworbe', '2sg_imperative': 'erwirb',
  },
  // irregular core
  TAKE: {
    base: 'näh',
    '1sg_present': 'nime', '2sg_present': 'nimmsch', '3sg_present': 'nimmt',
    '1pl_present': 'nämed', '2pl_present': 'nämed', '3pl_present': 'nämed',
    participle: 'gnoo', '2sg_imperative': 'nimm',
  },
  // Zürich überchoo, not bechoo; inflects like choo
  GET: {
    base: 'überchoo',
    '1sg_present': 'überchume', '2sg_present': 'überchunnsch', '3sg_present': 'überchunt',
    '1pl_present': 'überchömed', '2pl_present': 'überchömed', '3pl_present': 'überchömed',
    participle: 'überchoo', '2sg_imperative': 'überchumm',
  },
  // Zürich leisch, leit, gleit (verify)
  PUT: {
    base: 'lege',
    '1sg_present': 'leg', '2sg_present': 'leisch', '3sg_present': 'leit',
    '1pl_present': 'leged', '2pl_present': 'leged', '3pl_present': 'leged',
    participle: 'gleit', '2sg_imperative': 'leg',
  },
  KEEP: {
    base: 'bhalte',
    '1sg_present': 'bhalt', '2sg_present': 'bhaltsch', '3sg_present': 'bhaltet',
    '1pl_present': 'bhalted', '2pl_present': 'bhalted', '3pl_present': 'bhalted',
    participle: 'bhalte', '2sg_imperative': 'bhalt',
  },
  LOSE: {
    base: 'verliere',
    '1sg_present': 'verlier', '2sg_present': 'verliersch', '3sg_present': 'verliert',
    '1pl_present': 'verliered', '2pl_present': 'verliered', '3pl_present': 'verliered',
    participle: 'verlore', '2sg_imperative': 'verlier',
  },
  WIN: {
    base: 'gwünne',
    '1sg_present': 'gwünn', '2sg_present': 'gwünnsch', '3sg_present': 'gwünnt',
    '1pl_present': 'gwünned', '2pl_present': 'gwünned', '3pl_present': 'gwünned',
    participle: 'gwunne', '2sg_imperative': 'gwünn',
  },
  BRING: {
    base: 'bringe',
    '1sg_present': 'bring', '2sg_present': 'bringsch', '3sg_present': 'bringt',
    '1pl_present': 'bringed', '2pl_present': 'bringed', '3pl_present': 'bringed',
    participle: 'bracht', '2sg_imperative': 'bring',
  },
  LEAD: {
    base: 'füere',
    '1sg_present': 'füer', '2sg_present': 'füersch', '3sg_present': 'füert',
    '1pl_present': 'füered', '2pl_present': 'füered', '3pl_present': 'füered',
    participle: 'gfüert', '2sg_imperative': 'füer',
  },
  // laa inflects like gaa: mir lönd, participle glaa
  LEAVE_BEHIND: {
    base: 'zrugglaa', particle: 'zrugg',
    '1sg_present': 'laa', '2sg_present': 'laasch', '3sg_present': 'laat',
    '1pl_present': 'lönd', '2pl_present': 'lönd', '3pl_present': 'lönd',
    participle: 'zrugglaa', '2sg_imperative': 'laa',
  },
  // Zürich aaluege, not aasee
  LOOK_AT: {
    base: 'aaluege', particle: 'aa',
    '1sg_present': 'lueg', '2sg_present': 'luegsch', '3sg_present': 'lueget',
    '1pl_present': 'lueged', '2pl_present': 'lueged', '3pl_present': 'lueged',
    participle: 'aagluegt', '2sg_imperative': 'lueg',
  },
  DIRECT_VERB: {
    base: 'richte',
    '1sg_present': 'richt', '2sg_present': 'richtsch', '3sg_present': 'richtet',
    '1pl_present': 'richted', '2pl_present': 'richted', '3pl_present': 'richted',
    participle: 'grichtet', '2sg_imperative': 'richt',
  },
  DIVIDE: {
    base: 'teile',
    '1sg_present': 'teil', '2sg_present': 'teilsch', '3sg_present': 'teilt',
    '1pl_present': 'teiled', '2pl_present': 'teiled', '3pl_present': 'teiled',
    participle: 'teilt', '2sg_imperative': 'teil',
  },
  STRIKE: {
    base: 'schlaa',
    '1sg_present': 'schlaa', '2sg_present': 'schlaasch', '3sg_present': 'schlaat',
    '1pl_present': 'schlönd', '2pl_present': 'schlönd', '3pl_present': 'schlönd',
    participle: 'gschlage', '2sg_imperative': 'schlaa',
  },
  INDICATE: {
    base: 'bezeichne',
    '1sg_present': 'bezeichne', '2sg_present': 'bezeichnisch', '3sg_present': 'bezeichnet',
    '1pl_present': 'bezeichned', '2pl_present': 'bezeichned', '3pl_present': 'bezeichned',
    participle: 'bezeichnet', '2sg_imperative': 'bezeichne',
  },
  CHANGE: {
    base: 'ändere',
    '1sg_present': 'änder', '2sg_present': 'ändersch', '3sg_present': 'änderet',
    '1pl_present': 'ändered', '2pl_present': 'ändered', '3pl_present': 'ändered',
    participle: 'gänderet', '2sg_imperative': 'änder',
  },
  STOP: {
    base: 'aahalte', particle: 'aa',
    '1sg_present': 'halt', '2sg_present': 'haltsch', '3sg_present': 'haltet',
    '1pl_present': 'halted', '2pl_present': 'halted', '3pl_present': 'halted',
    participle: 'aaghalte', '2sg_imperative': 'halt',
  },
  TRANSFORM: {
    base: 'verwandle', object_predicative_link: 'i',
    '1sg_present': 'verwandle', '2sg_present': 'verwandlisch', '3sg_present': 'verwandlet',
    '1pl_present': 'verwandled', '2pl_present': 'verwandled', '3pl_present': 'verwandled',
    participle: 'verwandlet', '2sg_imperative': 'verwandle',
  },
  FEEL: {
    base: 'füele',
    '1sg_present': 'füel', '2sg_present': 'füelsch', '3sg_present': 'füelt',
    '1pl_present': 'füeled', '2pl_present': 'füeled', '3pl_present': 'füeled',
    participle: 'gfüelt', '2sg_imperative': 'füel',
  },
  SHED: {
    base: 'vergiesse',
    '1sg_present': 'vergiess', '2sg_present': 'vergiessisch', '3sg_present': 'vergiesst',
    '1pl_present': 'vergiessed', '2pl_present': 'vergiessed', '3pl_present': 'vergiessed',
    participle: 'vergosse', '2sg_imperative': 'vergiess',
  },
  // (verify)
  PRODUCE: {
    base: 'erzüüge',
    '1sg_present': 'erzüüg', '2sg_present': 'erzüügsch', '3sg_present': 'erzüügt',
    '1pl_present': 'erzüüged', '2pl_present': 'erzüüged', '3pl_present': 'erzüüged',
    participle: 'erzüügt', '2sg_imperative': 'erzüüg',
  },
  CAUSE_VERB: {
    base: 'veranlasse', causative: '1',
    '1sg_present': 'veranlass', '2sg_present': 'veranlassisch', '3sg_present': 'veranlasst',
    '1pl_present': 'veranlassed', '2pl_present': 'veranlassed', '3pl_present': 'veranlassed',
    participle: 'veranlasst', '2sg_imperative': 'veranlass',
  },
  // Zürich drucke, without the umlaut
  PRESS: {
    base: 'drucke',
    '1sg_present': 'druck', '2sg_present': 'drucksch', '3sg_present': 'druckt',
    '1pl_present': 'drucked', '2pl_present': 'drucked', '3pl_present': 'drucked',
    participle: 'druckt', '2sg_imperative': 'druck',
  },
  WRITE: {
    base: 'schriibe',
    '1sg_present': 'schriib', '2sg_present': 'schriibsch', '3sg_present': 'schriibt',
    '1pl_present': 'schriibed', '2pl_present': 'schriibed', '3pl_present': 'schriibed',
    participle: 'gschriibe', '2sg_imperative': 'schriib',
  },
  CLICK: {
    base: 'klicke', object_prep: 'uf',
    '1sg_present': 'klick', '2sg_present': 'klicksch', '3sg_present': 'klickt',
    '1pl_present': 'klicked', '2pl_present': 'klicked', '3pl_present': 'klicked',
    participle: 'klickt', '2sg_imperative': 'klick',
  },
  // Zürich hange, without the umlaut
  DEPEND: {
    base: 'abhange', particle: 'ab', object_prep: 'vo',
    '1sg_present': 'hang', '2sg_present': 'hangsch', '3sg_present': 'hanget',
    '1pl_present': 'hanged', '2pl_present': 'hanged', '3pl_present': 'hanged',
    participle: 'abghanget', '2sg_imperative': 'hang',
  },
  CHOOSE: {
    base: 'wääle',
    '1sg_present': 'wääl', '2sg_present': 'wäälsch', '3sg_present': 'wäält',
    '1pl_present': 'wääled', '2pl_present': 'wääled', '3pl_present': 'wääled',
    participle: 'gwäält', '2sg_imperative': 'wääl',
  },
  FILTER: {
    base: 'filtere',
    '1sg_present': 'filter', '2sg_present': 'filtersch', '3sg_present': 'filteret',
    '1pl_present': 'filtered', '2pl_present': 'filtered', '3pl_present': 'filtered',
    participle: 'gfilteret', '2sg_imperative': 'filter',
  },
  SELECT: {
    base: 'selektiere',
    '1sg_present': 'selektier', '2sg_present': 'selektiersch', '3sg_present': 'selektiert',
    '1pl_present': 'selektiered', '2pl_present': 'selektiered', '3pl_present': 'selektiered',
    participle: 'selektiert', '2sg_imperative': 'selektier',
  },
  TYPE: {
    base: 'tippe',
    '1sg_present': 'tipp', '2sg_present': 'tippsch', '3sg_present': 'tippt',
    '1pl_present': 'tipped', '2pl_present': 'tipped', '3pl_present': 'tipped',
    participle: 'tippt', '2sg_imperative': 'tipp',
  },
  TRANSLATE: {
    base: 'übersetze',
    '1sg_present': 'übersetz', '2sg_present': 'übersetzisch', '3sg_present': 'übersetzt',
    '1pl_present': 'übersetzed', '2pl_present': 'übersetzed', '3pl_present': 'übersetzed',
    participle: 'übersetzt', '2sg_imperative': 'übersetz',
  },
  // Spiicher: the ei is an old long i, so ii (verify)
  SAVE: {
    base: 'spiichere',
    '1sg_present': 'spiicher', '2sg_present': 'spiichersch', '3sg_present': 'spiicheret',
    '1pl_present': 'spiichered', '2pl_present': 'spiichered', '3pl_present': 'spiichered',
    participle: 'gspiicheret', '2sg_imperative': 'spiicher',
  },
  LOAD: {
    base: 'lade',
    '1sg_present': 'lad', '2sg_present': 'ladsch', '3sg_present': 'ladet',
    '1pl_present': 'laded', '2pl_present': 'laded', '3pl_present': 'laded',
    participle: 'glade', '2sg_imperative': 'lad',
  },
  // particle dezue, not hinzue
  ADD: {
    base: 'dezuefüege', particle: 'dezue', terminus_prep: 'zu',
    '1sg_present': 'füeg', '2sg_present': 'füegsch', '3sg_present': 'füegt',
    '1pl_present': 'füeged', '2pl_present': 'füeged', '3pl_present': 'füeged',
    participle: 'dezuegfüegt', '2sg_imperative': 'füeg',
  },
  LINK: {
    base: 'verbinde', terminus_prep: 'mit',
    '1sg_present': 'verbind', '2sg_present': 'verbindsch', '3sg_present': 'verbindet',
    '1pl_present': 'verbinded', '2pl_present': 'verbinded', '3pl_present': 'verbinded',
    participle: 'verbunde', '2sg_imperative': 'verbind',
  },
  EXPORT: {
    base: 'exportiere',
    '1sg_present': 'exportier', '2sg_present': 'exportiersch', '3sg_present': 'exportiert',
    '1pl_present': 'exportiered', '2pl_present': 'exportiered', '3pl_present': 'exportiered',
    participle: 'exportiert', '2sg_imperative': 'exportier',
  },
  BROADCAST: {
    base: 'usstraale', particle: 'us',
    '1sg_present': 'straal', '2sg_present': 'straalsch', '3sg_present': 'straalt',
    '1pl_present': 'straaled', '2pl_present': 'straaled', '3pl_present': 'straaled',
    participle: 'usgstraalt', '2sg_imperative': 'straal',
  },
  IMPORT: {
    base: 'importiere',
    '1sg_present': 'importier', '2sg_present': 'importiersch', '3sg_present': 'importiert',
    '1pl_present': 'importiered', '2pl_present': 'importiered', '3pl_present': 'importiered',
    participle: 'importiert', '2sg_imperative': 'importier',
  },
  CLEAR: {
    base: 'lösche',
    '1sg_present': 'lösch', '2sg_present': 'löschisch', '3sg_present': 'löscht',
    '1pl_present': 'lösched', '2pl_present': 'lösched', '3pl_present': 'lösched',
    participle: 'glöscht', '2sg_imperative': 'lösch',
  },
  REMOVE: {
    base: 'entferne',
    '1sg_present': 'entfern', '2sg_present': 'entfernsch', '3sg_present': 'entfernt',
    '1pl_present': 'entferned', '2pl_present': 'entferned', '3pl_present': 'entferned',
    participle: 'entfernt', '2sg_imperative': 'entfern',
  },
  DELETE: {
    base: 'lösche',
    '1sg_present': 'lösch', '2sg_present': 'löschisch', '3sg_present': 'löscht',
    '1pl_present': 'lösched', '2pl_present': 'lösched', '3pl_present': 'lösched',
    participle: 'glöscht', '2sg_imperative': 'lösch',
  },
  COORDINATE: {
    base: 'koordiniere',
    '1sg_present': 'koordinier', '2sg_present': 'koordiniersch', '3sg_present': 'koordiniert',
    '1pl_present': 'koordiniered', '2pl_present': 'koordiniered', '3pl_present': 'koordiniered',
    participle: 'koordiniert', '2sg_imperative': 'koordinier',
  },
  // Zürich ufruume, not ordne; the particle is gsw's own
  TIDY_UP: {
    base: 'ufruume', particle: 'uf',
    '1sg_present': 'ruum', '2sg_present': 'ruumsch', '3sg_present': 'ruumt',
    '1pl_present': 'ruumed', '2pl_present': 'ruumed', '3pl_present': 'ruumed',
    participle: 'ufgruumt', '2sg_imperative': 'ruum',
  },
  COMPACT: {
    base: 'verdichte',
    '1sg_present': 'verdicht', '2sg_present': 'verdichtsch', '3sg_present': 'verdichtet',
    '1pl_present': 'verdichted', '2pl_present': 'verdichted', '3pl_present': 'verdichted',
    participle: 'verdichtet', '2sg_imperative': 'verdicht',
  },
  EXPAND: {
    base: 'erwiitere',
    '1sg_present': 'erwiiter', '2sg_present': 'erwiitersch', '3sg_present': 'erwiiteret',
    '1pl_present': 'erwiitered', '2pl_present': 'erwiitered', '3pl_present': 'erwiitered',
    participle: 'erwiiteret', '2sg_imperative': 'erwiiter',
  },
  SHRINK: {
    base: 'verchliinere',
    '1sg_present': 'verchliiner', '2sg_present': 'verchliinersch', '3sg_present': 'verchliineret',
    '1pl_present': 'verchliinered', '2pl_present': 'verchliinered', '3pl_present': 'verchliinered',
    participle: 'verchliineret', '2sg_imperative': 'verchliiner',
  },
  HIDE: {
    base: 'verstecke',
    '1sg_present': 'versteck', '2sg_present': 'verstecksch', '3sg_present': 'versteckt',
    '1pl_present': 'verstecked', '2pl_present': 'verstecked', '3pl_present': 'verstecked',
    participle: 'versteckt', '2sg_imperative': 'versteck',
  },
  // Zürich aafange, not beginne; the particle is gsw's own
  START: {
    base: 'aafange', particle: 'aa',
    '1sg_present': 'fang', '2sg_present': 'fangsch', '3sg_present': 'fangt',
    '1pl_present': 'fanged', '2pl_present': 'fanged', '3pl_present': 'fanged',
    participle: 'aagfange', '2sg_imperative': 'fang',
  },
  CANCEL: {
    base: 'annulliere',
    '1sg_present': 'annullier', '2sg_present': 'annulliersch', '3sg_present': 'annulliert',
    '1pl_present': 'annulliered', '2pl_present': 'annulliered', '3pl_present': 'annulliered',
    participle: 'annulliert', '2sg_imperative': 'annullier',
  },
  UNDO: {
    base: 'rückgängig mache', particle: 'rückgängig',
    '1sg_present': 'mache', '2sg_present': 'machsch', '3sg_present': 'macht',
    '1pl_present': 'mached', '2pl_present': 'mached', '3pl_present': 'mached',
    participle: 'rückgängig gmacht', '2sg_imperative': 'mach',
  },
  REDO: {
    base: 'widerhole',
    '1sg_present': 'widerhol', '2sg_present': 'widerholsch', '3sg_present': 'widerholt',
    '1pl_present': 'widerholed', '2pl_present': 'widerholed', '3pl_present': 'widerholed',
    participle: 'widerholt', '2sg_imperative': 'widerhol',
  },
  RESTORE: {
    base: 'zrugghole', particle: 'zrugg',
    '1sg_present': 'hol', '2sg_present': 'holsch', '3sg_present': 'holt',
    '1pl_present': 'holed', '2pl_present': 'holed', '3pl_present': 'holed',
    participle: 'zruggholt', '2sg_imperative': 'hol',
  },
  // Zürich ufmache, not öffne; the particle is gsw's own
  OPEN: {
    base: 'ufmache', particle: 'uf',
    '1sg_present': 'mache', '2sg_present': 'machsch', '3sg_present': 'macht',
    '1pl_present': 'mached', '2pl_present': 'mached', '3pl_present': 'mached',
    participle: 'ufgmacht', '2sg_imperative': 'mach',
  },
  // Zürich zuemache, not schlüüsse; the particle is gsw's own
  CLOSE: {
    base: 'zuemache', particle: 'zue',
    '1sg_present': 'mache', '2sg_present': 'machsch', '3sg_present': 'macht',
    '1pl_present': 'mached', '2pl_present': 'mached', '3pl_present': 'mached',
    participle: 'zuegmacht', '2sg_imperative': 'mach',
  },
  RETRY: {
    base: 'widerhole',
    '1sg_present': 'widerhol', '2sg_present': 'widerholsch', '3sg_present': 'widerholt',
    '1pl_present': 'widerholed', '2pl_present': 'widerholed', '3pl_present': 'widerholed',
    participle: 'widerholt', '2sg_imperative': 'widerhol',
  },
  USE: {
    base: 'verwände',
    '1sg_present': 'verwänd', '2sg_present': 'verwändsch', '3sg_present': 'verwändet',
    '1pl_present': 'verwänded', '2pl_present': 'verwänded', '3pl_present': 'verwänded',
    participle: 'verwändet', '2sg_imperative': 'verwänd',
  },
  // inflects like gää
  SPEND_MONEY: {
    base: 'usgää', particle: 'us',
    '1sg_present': 'gibe', '2sg_present': 'gisch', '3sg_present': 'git',
    '1pl_present': 'gänd', '2pl_present': 'gänd', '3pl_present': 'gänd',
    participle: 'usggää', '2sg_imperative': 'gib',
  },
  SPEND_TIME: {
    base: 'verbringe',
    '1sg_present': 'verbring', '2sg_present': 'verbringsch', '3sg_present': 'verbringt',
    '1pl_present': 'verbringed', '2pl_present': 'verbringed', '3pl_present': 'verbringed',
    participle: 'verbracht', '2sg_imperative': 'verbring',
  },
  COPY: {
    base: 'kopiere',
    '1sg_present': 'kopier', '2sg_present': 'kopiersch', '3sg_present': 'kopiert',
    '1pl_present': 'kopiered', '2pl_present': 'kopiered', '3pl_present': 'kopiered',
    participle: 'kopiert', '2sg_imperative': 'kopier',
  },
  MOVE: {
    base: 'verschiebe',
    '1sg_present': 'verschieb', '2sg_present': 'verschiebsch', '3sg_present': 'verschiebt',
    '1pl_present': 'verschiebed', '2pl_present': 'verschiebed', '3pl_present': 'verschiebed',
    participle: 'verschobe', '2sg_imperative': 'verschieb',
  },
  // inflects like laa; imperative verlass (verify)
  LEAVE: {
    base: 'verlaa',
    '1sg_present': 'verlaa', '2sg_present': 'verlaasch', '3sg_present': 'verlaat',
    '1pl_present': 'verlönd', '2pl_present': 'verlönd', '3pl_present': 'verlönd',
    participle: 'verlaa', '2sg_imperative': 'verlass',
  },
  RESIZE: {
    base: 'skaliere',
    '1sg_present': 'skalier', '2sg_present': 'skaliersch', '3sg_present': 'skaliert',
    '1pl_present': 'skaliered', '2pl_present': 'skaliered', '3pl_present': 'skaliered',
    participle: 'skaliert', '2sg_imperative': 'skalier',
  },
  // short verb: mir ziend, participle zoge (verify)
  DRAG: {
    base: 'zie',
    '1sg_present': 'zie', '2sg_present': 'ziesch', '3sg_present': 'ziet',
    '1pl_present': 'ziend', '2pl_present': 'ziend', '3pl_present': 'ziend',
    participle: 'zoge', '2sg_imperative': 'zie',
  },
  TURN_OFF: {
    base: 'deaktiviere',
    '1sg_present': 'deaktivier', '2sg_present': 'deaktiviersch', '3sg_present': 'deaktiviert',
    '1pl_present': 'deaktiviered', '2pl_present': 'deaktiviered', '3pl_present': 'deaktiviered',
    participle: 'deaktiviert', '2sg_imperative': 'deaktivier',
  },
  SET: {
    base: 'festlege', particle: 'fest',
    '1sg_present': 'leg', '2sg_present': 'leisch', '3sg_present': 'leit',
    '1pl_present': 'leged', '2pl_present': 'leged', '3pl_present': 'leged',
    participle: 'festgleit', '2sg_imperative': 'leg',
  },
  PIN: {
    base: 'aahefte', particle: 'aa',
    '1sg_present': 'heft', '2sg_present': 'heftsch', '3sg_present': 'heftet',
    '1pl_present': 'hefted', '2pl_present': 'hefted', '3pl_present': 'hefted',
    participle: 'aagheftet', '2sg_imperative': 'heft',
  },
  UNPIN: {
    base: 'löse',
    '1sg_present': 'lös', '2sg_present': 'lösisch', '3sg_present': 'löst',
    '1pl_present': 'lösed', '2pl_present': 'lösed', '3pl_present': 'lösed',
    participle: 'glöst', '2sg_imperative': 'lös',
  },
  COMPLETE: {
    base: 'vervollständige',
    '1sg_present': 'vervollständig', '2sg_present': 'vervollständigsch', '3sg_present': 'vervollständigt',
    '1pl_present': 'vervollständiged', '2pl_present': 'vervollständiged', '3pl_present': 'vervollständiged',
    participle: 'vervollständigt', '2sg_imperative': 'vervollständig',
  },
  APPLY: {
    base: 'aawände', particle: 'aa',
    '1sg_present': 'wänd', '2sg_present': 'wändsch', '3sg_present': 'wändet',
    '1pl_present': 'wänded', '2pl_present': 'wänded', '3pl_present': 'wänded',
    participle: 'aagwändet', '2sg_imperative': 'wänd',
  },
  NAME: {
    base: 'benänne',
    '1sg_present': 'benänn', '2sg_present': 'benännsch', '3sg_present': 'benännt',
    '1pl_present': 'benänned', '2pl_present': 'benänned', '3pl_present': 'benänned',
    participle: 'benännt', '2sg_imperative': 'benänn',
  },
  DESCRIBE: {
    base: 'beschriibe',
    '1sg_present': 'beschriib', '2sg_present': 'beschriibsch', '3sg_present': 'beschriibt',
    '1pl_present': 'beschriibed', '2pl_present': 'beschriibed', '3pl_present': 'beschriibed',
    participle: 'beschriibe', '2sg_imperative': 'beschriib',
  },
  MODIFY: {
    base: 'modifiziere',
    '1sg_present': 'modifizier', '2sg_present': 'modifiziersch', '3sg_present': 'modifiziert',
    '1pl_present': 'modifiziered', '2pl_present': 'modifiziered', '3pl_present': 'modifiziered',
    participle: 'modifiziert', '2sg_imperative': 'modifizier',
  },
  SPECIFY: {
    base: 'bestimme',
    '1sg_present': 'bestimm', '2sg_present': 'bestimmsch', '3sg_present': 'bestimmt',
    '1pl_present': 'bestimmed', '2pl_present': 'bestimmed', '3pl_present': 'bestimmed',
    participle: 'bestimmt', '2sg_imperative': 'bestimm',
  },
  EDIT: {
    base: 'bearbeite',
    '1sg_present': 'bearbeit', '2sg_present': 'bearbeitsch', '3sg_present': 'bearbeitet',
    '1pl_present': 'bearbeited', '2pl_present': 'bearbeited', '3pl_present': 'bearbeited',
    participle: 'bearbeitet', '2sg_imperative': 'bearbeit',
  },
  GOVERN: {
    base: 'regiere',
    '1sg_present': 'regier', '2sg_present': 'regiersch', '3sg_present': 'regiert',
    '1pl_present': 'regiered', '2pl_present': 'regiered', '3pl_present': 'regiered',
    participle: 'regiert', '2sg_imperative': 'regier',
  },
  ACCEPT: {
    base: 'akzeptiere',
    '1sg_present': 'akzeptier', '2sg_present': 'akzeptiersch', '3sg_present': 'akzeptiert',
    '1pl_present': 'akzeptiered', '2pl_present': 'akzeptiered', '3pl_present': 'akzeptiered',
    participle: 'akzeptiert', '2sg_imperative': 'akzeptier',
  },
  NEGATE: {
    base: 'verneine',
    '1sg_present': 'vernein', '2sg_present': 'verneinsch', '3sg_present': 'verneint',
    '1pl_present': 'verneined', '2pl_present': 'verneined', '3pl_present': 'verneined',
    participle: 'verneint', '2sg_imperative': 'vernein',
  },
  ASSERT: {
    base: 'feststelle', particle: 'fest',
    '1sg_present': 'stell', '2sg_present': 'stellsch', '3sg_present': 'stellt',
    '1pl_present': 'stelled', '2pl_present': 'stelled', '3pl_present': 'stelled',
    participle: 'festgstellt', '2sg_imperative': 'stell',
  },
  EXPRESS: {
    base: 'vermittle',
    '1sg_present': 'vermittle', '2sg_present': 'vermittlisch', '3sg_present': 'vermittlet',
    '1pl_present': 'vermittled', '2pl_present': 'vermittled', '3pl_present': 'vermittled',
    participle: 'vermittlet', '2sg_imperative': 'vermittle',
  },
  // Zürich seisch, seit, gseit
  SAY: {
    base: 'säge', content_clause_force: 'either',
    '1sg_present': 'säg', '2sg_present': 'seisch', '3sg_present': 'seit',
    '1pl_present': 'säged', '2pl_present': 'säged', '3pl_present': 'säged',
    participle: 'gseit', '2sg_imperative': 'säg',
  },
  CALL: {
    base: 'rüefe',
    '1sg_present': 'rüef', '2sg_present': 'rüefsch', '3sg_present': 'rüeft',
    '1pl_present': 'rüefed', '2pl_present': 'rüefed', '3pl_present': 'rüefed',
    participle: 'grüeft', '2sg_imperative': 'rüef',
  },
  // Zürich aalüüte, not aarüefe
  CALL_PHONE: {
    base: 'aalüüte', particle: 'aa',
    '1sg_present': 'lüüt', '2sg_present': 'lüütsch', '3sg_present': 'lüütet',
    '1pl_present': 'lüüted', '2pl_present': 'lüüted', '3pl_present': 'lüüted',
    participle: 'aaglüütet', '2sg_imperative': 'lüüt',
  },
  MEAN: {
    base: 'bedüüte',
    '1sg_present': 'bedüüt', '2sg_present': 'bedüütsch', '3sg_present': 'bedüütet',
    '1pl_present': 'bedüüted', '2pl_present': 'bedüüted', '3pl_present': 'bedüüted',
    participle: 'bedüütet', '2sg_imperative': 'bedüüt',
  },
  BELIEVE: {
    base: 'glaube',
    '1sg_present': 'glaub', '2sg_present': 'glaubsch', '3sg_present': 'glaubt',
    '1pl_present': 'glaubed', '2pl_present': 'glaubed', '3pl_present': 'glaubed',
    participle: 'gglaubt', '2sg_imperative': 'glaub',
  },
  REPLACE: {
    base: 'ersetze',
    '1sg_present': 'ersetz', '2sg_present': 'ersetzisch', '3sg_present': 'ersetzt',
    '1pl_present': 'ersetzed', '2pl_present': 'ersetzed', '3pl_present': 'ersetzed',
    participle: 'ersetzt', '2sg_imperative': 'ersetz',
  },
  // Zürich schnuufe, not atme
  BREATHE: {
    base: 'schnuufe',
    '1sg_present': 'schnuuf', '2sg_present': 'schnuufsch', '3sg_present': 'schnuuft',
    '1pl_present': 'schnuufed', '2pl_present': 'schnuufed', '3pl_present': 'schnuufed',
    participle: 'gschnuuft', '2sg_imperative': 'schnuuf',
  },
  EXCHANGE: {
    base: 'tuusche',
    '1sg_present': 'tuusch', '2sg_present': 'tuuschisch', '3sg_present': 'tuuscht',
    '1pl_present': 'tuusched', '2pl_present': 'tuusched', '3pl_present': 'tuusched',
    participle: 'tuuscht', '2sg_imperative': 'tuusch',
  },
  // schlüüsse for schliessen (verify)
  ENCLOSE: {
    base: 'umschlüüsse',
    '1sg_present': 'umschlüüss', '2sg_present': 'umschlüüssisch', '3sg_present': 'umschlüüsst',
    '1pl_present': 'umschlüüssed', '2pl_present': 'umschlüüssed', '3pl_present': 'umschlüüssed',
    participle: 'umschlosse', '2sg_imperative': 'umschlüüss',
  },
  HEAR: {
    base: 'ghööre',
    '1sg_present': 'ghöör', '2sg_present': 'ghöörsch', '3sg_present': 'ghöört',
    '1pl_present': 'ghööred', '2pl_present': 'ghööred', '3pl_present': 'ghööred',
    participle: 'ghöört', '2sg_imperative': 'ghöör',
  },
  GOVERN_STATE: {
    base: 'regiere',
    '1sg_present': 'regier', '2sg_present': 'regiersch', '3sg_present': 'regiert',
    '1pl_present': 'regiered', '2pl_present': 'regiered', '3pl_present': 'regiered',
    participle: 'regiert', '2sg_imperative': 'regier',
  },
  ACCOMPANY: {
    base: 'begleite',
    '1sg_present': 'begleit', '2sg_present': 'begleitsch', '3sg_present': 'begleitet',
    '1pl_present': 'begleited', '2pl_present': 'begleited', '3pl_present': 'begleited',
    participle: 'begleitet', '2sg_imperative': 'begleit',
  },
  ANSWER: {
    base: 'antworte',
    '1sg_present': 'antwort', '2sg_present': 'antwortsch', '3sg_present': 'antwortet',
    '1pl_present': 'antworted', '2pl_present': 'antworted', '3pl_present': 'antworted',
    participle: 'gantwortet', '2sg_imperative': 'antwort',
  },
  SEARCH: {
    base: 'sueche',
    '1sg_present': 'suech', '2sg_present': 'suechsch', '3sg_present': 'suecht',
    '1pl_present': 'sueched', '2pl_present': 'sueched', '3pl_present': 'sueched',
    participle: 'gsuecht', '2sg_imperative': 'suech',
  },
  FIND: {
    base: 'finde',
    '1sg_present': 'find', '2sg_present': 'findsch', '3sg_present': 'findet',
    '1pl_present': 'finded', '2pl_present': 'finded', '3pl_present': 'finded',
    participle: 'gfunde', '2sg_imperative': 'find',
  },
  MEET: {
    base: 'treffe',
    '1sg_present': 'triff', '2sg_present': 'triffsch', '3sg_present': 'trifft',
    '1pl_present': 'treffed', '2pl_present': 'treffed', '3pl_present': 'treffed',
    participle: 'troffe', '2sg_imperative': 'triff',
  },
  ARRANGE: {
    base: 'aaordne', particle: 'aa',
    '1sg_present': 'ordne', '2sg_present': 'ordnisch', '3sg_present': 'ordnet',
    '1pl_present': 'ordned', '2pl_present': 'ordned', '3pl_present': 'ordned',
    participle: 'aagordnet', '2sg_imperative': 'ordne',
  },
  CONNECT: {
    base: 'verbinde', terminus_prep: 'mit',
    '1sg_present': 'verbind', '2sg_present': 'verbindsch', '3sg_present': 'verbindet',
    '1pl_present': 'verbinded', '2pl_present': 'verbinded', '3pl_present': 'verbinded',
    participle: 'verbunde', '2sg_imperative': 'verbind',
  },
  // inflects like gaa: mir lönd
  LET: {
    base: 'laa', infinitive_bare: '1',
    '1sg_present': 'laa', '2sg_present': 'laasch', '3sg_present': 'laat',
    '1pl_present': 'lönd', '2pl_present': 'lönd', '3pl_present': 'lönd',
    participle: 'glaa', '2sg_imperative': 'laa',
  },
  ALLOW: {
    base: 'erlaube', controller_case: 'dat',
    '1sg_present': 'erlaub', '2sg_present': 'erlaubsch', '3sg_present': 'erlaubt',
    '1pl_present': 'erlaubed', '2pl_present': 'erlaubed', '3pl_present': 'erlaubed',
    participle: 'erlaubt', '2sg_imperative': 'erlaub',
  },
  // imperative mög (verify)
  LIKE: {
    base: 'möge',
    '1sg_present': 'mag', '2sg_present': 'magsch', '3sg_present': 'mag',
    '1pl_present': 'möged', '2pl_present': 'möged', '3pl_present': 'möged',
    participle: 'gmöge', '2sg_imperative': 'mög',
  },
  HELP_VERB: {
    base: 'hälfe', object_case: 'dat',
    '1sg_present': 'hilf', '2sg_present': 'hilfsch', '3sg_present': 'hilft',
    '1pl_present': 'hälfed', '2pl_present': 'hälfed', '3pl_present': 'hälfed',
    participle: 'gholfe', '2sg_imperative': 'hilf',
  },
  THANK: {
    base: 'danke', object_case: 'dat',
    '1sg_present': 'dank', '2sg_present': 'danksch', '3sg_present': 'dankt',
    '1pl_present': 'danked', '2pl_present': 'danked', '3pl_present': 'danked',
    participle: 'dankt', '2sg_imperative': 'dank',
  },
  MARRY: {
    base: 'hürate',
    '1sg_present': 'hürat', '2sg_present': 'hüratsch', '3sg_present': 'hüratet',
    '1pl_present': 'hürated', '2pl_present': 'hürated', '3pl_present': 'hürated',
    participle: 'ghüratet', '2sg_imperative': 'hürat',
  },
};
