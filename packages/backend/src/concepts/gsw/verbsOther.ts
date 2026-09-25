import type { GswColumn } from './types.js';

export const GSW_VERBS_OTHER: GswColumn = {
  RUN: {
    // springe, not laufe: in Zürich laufe is to walk.
    base: 'springe',
    '1sg_present': 'spring', '2sg_present': 'springsch', '3sg_present': 'springt',
    '1pl_present': 'springed', '2pl_present': 'springed', '3pl_present': 'springed',
    participle: 'gsprunge', aux: 'be', '2sg_imperative': 'spring',
  },
  JUMP: {
    // gumpe, not springe (which is to run).
    base: 'gumpe',
    '1sg_present': 'gump', '2sg_present': 'gumpsch', '3sg_present': 'gumpt',
    '1pl_present': 'gumped', '2pl_present': 'gumped', '3pl_present': 'gumped',
    participle: 'ggumpet', aux: 'be', '2sg_imperative': 'gump',
  },
  COME: {
    base: 'choo',
    '1sg_present': 'chume', '2sg_present': 'chunnsch', '3sg_present': 'chunt',
    '1pl_present': 'chömed', '2pl_present': 'chömed', '3pl_present': 'chömed',
    participle: 'choo', aux: 'be', '2sg_imperative': 'chumm',
  },
  CRY: {
    // brüele, not weine.
    base: 'brüele',
    '1sg_present': 'brüel', '2sg_present': 'brüelsch', '3sg_present': 'brüelt',
    '1pl_present': 'brüeled', '2pl_present': 'brüeled', '3pl_present': 'brüeled',
    participle: 'brüelet', '2sg_imperative': 'brüel',
  },
  SUFFER: {
    base: 'liide',
    '1sg_present': 'liid', '2sg_present': 'liidsch', '3sg_present': 'liidet',
    '1pl_present': 'liided', '2pl_present': 'liided', '3pl_present': 'liided',
    participle: 'glitte', '2sg_imperative': 'liid',
  },
  BURN: {
    base: 'brenne',
    '1sg_present': 'brenn', '2sg_present': 'brennsch', '3sg_present': 'brennt',
    '1pl_present': 'brenned', '2pl_present': 'brenned', '3pl_present': 'brenned',
    participle: 'brännt', '2sg_imperative': 'brenn', // participle brännt (verify)
  },
  COLLAPSE: {
    base: 'kollabiere',
    '1sg_present': 'kollabier', '2sg_present': 'kollabiersch', '3sg_present': 'kollabiert',
    '1pl_present': 'kollabiered', '2pl_present': 'kollabiered', '3pl_present': 'kollabiered',
    participle: 'kollabiert', aux: 'be', '2sg_imperative': 'kollabier',
  },
  LIVE: {
    base: 'wone',
    '1sg_present': 'won', '2sg_present': 'wonsch', '3sg_present': 'wont',
    '1pl_present': 'woned', '2pl_present': 'woned', '3pl_present': 'woned',
    participle: 'gwont', '2sg_imperative': 'won',
  },
  LIVE_ALIVE: {
    base: 'läbe',
    '1sg_present': 'läb', '2sg_present': 'läbsch', '3sg_present': 'läbt',
    '1pl_present': 'läbed', '2pl_present': 'läbed', '3pl_present': 'läbed',
    participle: 'gläbt', '2sg_imperative': 'läb',
  },
  DIE: {
    base: 'sterbe',
    '1sg_present': 'stirb', '2sg_present': 'stirbsch', '3sg_present': 'stirbt',
    '1pl_present': 'sterbed', '2pl_present': 'sterbed', '3pl_present': 'sterbed',
    '2sg_imperative': 'stirb', participle: 'gstorbe', aux: 'be',
  },
  STAY: {
    base: 'bliibe',
    '1sg_present': 'bliib', '2sg_present': 'bliibsch', '3sg_present': 'bliibt',
    '1pl_present': 'bliibed', '2pl_present': 'bliibed', '3pl_present': 'bliibed',
    participle: 'blibe', aux: 'be', '2sg_imperative': 'bliib',
  },
  WAIT: {
    base: 'warte', object_prep: 'uf',
    '1sg_present': 'wart', '2sg_present': 'wartisch', '3sg_present': 'wartet',
    '1pl_present': 'warted', '2pl_present': 'warted', '3pl_present': 'warted',
    '2sg_imperative': 'wart', participle: 'gwartet',
  },
  TRADE: {
    base: 'handle',
    '1sg_present': 'handle', '2sg_present': 'handlisch', '3sg_present': 'handlet',
    '1pl_present': 'handled', '2pl_present': 'handled', '3pl_present': 'handled',
    participle: 'ghandlet', '2sg_imperative': 'handle',
  },
  ACT: {
    base: 'handle',
    '1sg_present': 'handle', '2sg_present': 'handlisch', '3sg_present': 'handlet',
    '1pl_present': 'handled', '2pl_present': 'handled', '3pl_present': 'handled',
    participle: 'ghandlet', '2sg_imperative': 'handle',
  },
  WORK: {
    base: 'funktioniere',
    '1sg_present': 'funktionier', '2sg_present': 'funktioniersch', '3sg_present': 'funktioniert',
    '1pl_present': 'funktioniered', '2pl_present': 'funktioniered', '3pl_present': 'funktioniered',
    participle: 'funktioniert', '2sg_imperative': 'funktionier',
  },
  WORK_LABOUR: {
    // schaffe, not arbeite.
    base: 'schaffe',
    '1sg_present': 'schaff', '2sg_present': 'schaffsch', '3sg_present': 'schafft',
    '1pl_present': 'schaffed', '2pl_present': 'schaffed', '3pl_present': 'schaffed',
    '2sg_imperative': 'schaff', participle: 'gschaffet',
  },
  PLAY_GAME: {
    base: 'spile',
    '1sg_present': 'spil', '2sg_present': 'spilsch', '3sg_present': 'spilt',
    '1pl_present': 'spiled', '2pl_present': 'spiled', '3pl_present': 'spiled',
    participle: 'gspilt', '2sg_imperative': 'spil',
  },
  LOSE_GAME: {
    base: 'verlüüre',
    '1sg_present': 'verlüür', '2sg_present': 'verlüürsch', '3sg_present': 'verlüürt',
    '1pl_present': 'verlüüred', '2pl_present': 'verlüüred', '3pl_present': 'verlüüred',
    participle: 'verlore', '2sg_imperative': 'verlüür',
  },
  BEGIN: {
    // aafange, not beginne; separable, so it gains a particle de's beginnen has not.
    base: 'aafange', particle: 'aa',
    '1sg_present': 'fang', '2sg_present': 'fangsch', '3sg_present': 'fangt',
    '1pl_present': 'fanged', '2pl_present': 'fanged', '3pl_present': 'fanged',
    participle: 'aagfange', '2sg_imperative': 'fang',
  },
  STOP_DOING: {
    base: 'ufhöre', particle: 'uf',
    '1sg_present': 'hör', '2sg_present': 'hörsch', '3sg_present': 'hört',
    '1pl_present': 'höred', '2pl_present': 'höred', '3pl_present': 'höred',
    participle: 'ufghört', '2sg_imperative': 'hör',
  },
  STOP_ONESELF: {
    base: 'staa bliibe', particle: 'staa',
    '1sg_present': 'bliib', '2sg_present': 'bliibsch', '3sg_present': 'bliibt',
    '1pl_present': 'bliibed', '2pl_present': 'bliibed', '3pl_present': 'bliibed',
    participle: 'staa blibe', aux: 'be', '2sg_imperative': 'bliib',
  },
  CONTINUE_DOING: {
    base: 'wiitermache', particle: 'wiiter', complement_particle: 'wiiter',
    negative_complement_adverb: 'wiiterhin',
    '1sg_present': 'mache', '2sg_present': 'machsch', '3sg_present': 'macht',
    '1pl_present': 'mached', '2pl_present': 'mached', '3pl_present': 'mached',
    participle: 'wiitergmacht', '2sg_imperative': 'mach',
  },
  CHANGE_ONESELF: {
    base: 'sich ändere',
    '1sg_present': 'änder', '2sg_present': 'ändersch', '3sg_present': 'änderet',
    '1pl_present': 'ändered', '2pl_present': 'ändered', '3pl_present': 'ändered',
    participle: 'gänderet', '2sg_imperative': 'änder',
  },
  LEARN: {
    base: 'lerne',
    '1sg_present': 'lern', '2sg_present': 'lernsch', '3sg_present': 'lernt',
    '1pl_present': 'lerned', '2pl_present': 'lerned', '3pl_present': 'lerned',
    '2sg_imperative': 'lern', participle: 'glernt',
  },
  SPEAK: {
    // rede, not spräche.
    base: 'rede',
    '1sg_present': 'red', '2sg_present': 'redsch', '3sg_present': 'redt',
    '1pl_present': 'reded', '2pl_present': 'reded', '3pl_present': 'reded',
    participle: 'gredt', '2sg_imperative': 'red',
  },
  THINK: {
    base: 'dänke', topic_prep: 'a',
    '1sg_present': 'dänk', '2sg_present': 'dänksch', '3sg_present': 'dänkt',
    '1pl_present': 'dänked', '2pl_present': 'dänked', '3pl_present': 'dänked',
    participle: 'dänkt', '2sg_imperative': 'dänk', // participle: g- merged into d, spoken tänkt (verify)
  },
  PRECEDE: {
    base: 'voraagaa', particle: 'voraa',
    '1sg_present': 'gang', '2sg_present': 'gaasch', '3sg_present': 'gaat',
    '1pl_present': 'gönd', '2pl_present': 'gönd', '3pl_present': 'gönd',
    participle: 'voraaggange', aux: 'be', '2sg_imperative': 'gang',
  },
  FOLLOW: {
    base: 'folge', object_prep: 'uf',
    '1sg_present': 'folg', '2sg_present': 'folgsch', '3sg_present': 'folgt',
    '1pl_present': 'folged', '2pl_present': 'folged', '3pl_present': 'folged',
    participle: 'gfolgt', aux: 'be', '2sg_imperative': 'folg',
  },
  HAPPEN: {
    // passiere, not gscheh: the everyday Zürich verb.
    base: 'passiere',
    '1sg_present': 'passier', '2sg_present': 'passiersch', '3sg_present': 'passiert',
    '1pl_present': 'passiered', '2pl_present': 'passiered', '3pl_present': 'passiered',
    participle: 'passiert', aux: 'be', '2sg_imperative': 'passier',
  },
  GROW: {
    base: 'wachse',
    '1sg_present': 'wachs', '2sg_present': 'wachsch', '3sg_present': 'wachst',
    '1pl_present': 'wachsed', '2pl_present': 'wachsed', '3pl_present': 'wachsed',
    participle: 'gwachse', aux: 'be', '2sg_imperative': 'wachs',
  },
  FLOW: {
    base: 'flüüsse',
    '1sg_present': 'flüüss', '2sg_present': 'flüüssisch', '3sg_present': 'flüüsst',
    '1pl_present': 'flüüssed', '2pl_present': 'flüüssed', '3pl_present': 'flüüssed',
    participle: 'gflosse', aux: 'be', '2sg_imperative': 'flüüss',
  },
  GIVE: {
    base: 'gää', terminus_dative: '1',
    '1sg_present': 'gibe', '2sg_present': 'gisch', '3sg_present': 'git',
    '1pl_present': 'gänd', '2pl_present': 'gänd', '3pl_present': 'gänd',
    '2sg_imperative': 'gib', participle: 'ggää',
  },
  SELL: {
    base: 'verchaufe', terminus_dative: '1',
    '1sg_present': 'verchauf', '2sg_present': 'verchaufsch', '3sg_present': 'verchauft',
    '1pl_present': 'verchaufed', '2pl_present': 'verchaufed', '3pl_present': 'verchaufed',
    '2sg_imperative': 'verchauf', participle: 'verchauft',
  },
  PAY: {
    // zaale, not bezaale. Participle zaalt (verify; gzaalt also heard).
    base: 'zaale', terminus_dative: '1',
    '1sg_present': 'zaal', '2sg_present': 'zaalsch', '3sg_present': 'zaalt',
    '1pl_present': 'zaaled', '2pl_present': 'zaaled', '3pl_present': 'zaaled',
    participle: 'zaalt', '2sg_imperative': 'zaal',
  },
  PROVIDE: {
    base: 'liifere', terminus_dative: '1',
    '1sg_present': 'liifer', '2sg_present': 'liifersch', '3sg_present': 'liiferet',
    '1pl_present': 'liifered', '2pl_present': 'liifered', '3pl_present': 'liifered',
    participle: 'gliiferet', '2sg_imperative': 'liifer',
  },
  TRANSFER: {
    // trage has treisch/treit in Zürich; the prefixed verb follows it (verify).
    base: 'übertrage',
    '1sg_present': 'übertrag', '2sg_present': 'übertreisch', '3sg_present': 'übertreit',
    '1pl_present': 'übertraged', '2pl_present': 'übertraged', '3pl_present': 'übertraged',
    participle: 'übertreit', '2sg_imperative': 'übertrag',
  },
  SHOW: {
    base: 'zeige',
    '1sg_present': 'zeig', '2sg_present': 'zeigsch', '3sg_present': 'zeigt',
    '1pl_present': 'zeiged', '2pl_present': 'zeiged', '3pl_present': 'zeiged',
    participle: 'gzeigt', '2sg_imperative': 'zeig',
  },
  SEND: {
    base: 'schicke',
    '1sg_present': 'schick', '2sg_present': 'schicksch', '3sg_present': 'schickt',
    '1pl_present': 'schicked', '2pl_present': 'schicked', '3pl_present': 'schicked',
    participle: 'gschickt', '2sg_imperative': 'schick',
  },
  TELL: {
    // verzelle, not erzähle.
    base: 'verzelle', content_clause_force: 'either', infinitive_sense: 'TELL_ORDER',
    '1sg_present': 'verzell', '2sg_present': 'verzellsch', '3sg_present': 'verzellt',
    '1pl_present': 'verzelled', '2pl_present': 'verzelled', '3pl_present': 'verzelled',
    participle: 'verzellt', '2sg_imperative': 'verzell',
  },
  TELL_ORDER: {
    base: 'säge', object_case: 'dat',
    '1sg_present': 'säg', '2sg_present': 'seisch', '3sg_present': 'seit',
    '1pl_present': 'säged', '2pl_present': 'säged', '3pl_present': 'säged',
    participle: 'gseit', '2sg_imperative': 'säg',
  },
  ASK: {
    base: 'frööge', content_clause_force: 'interrogative', object_prep: 'nach', terminus_case: 'acc',
    '1sg_present': 'fröög', '2sg_present': 'fröögsch', '3sg_present': 'fröögt',
    '1pl_present': 'frööged', '2pl_present': 'frööged', '3pl_present': 'frööged',
    participle: 'gfröögt', '2sg_imperative': 'fröög',
  },
  GO: {
    base: 'gaa',
    '1sg_present': 'gang', '2sg_present': 'gaasch', '3sg_present': 'gaat',
    '1pl_present': 'gönd', '2pl_present': 'gönd', '3pl_present': 'gönd',
    participle: 'ggange', aux: 'be', '2sg_imperative': 'gang',
  },
  RETURN: {
    // zruggchoo (come back), not zruggchere: the everyday verb.
    base: 'zruggchoo', particle: 'zrugg',
    '1sg_present': 'chume', '2sg_present': 'chunnsch', '3sg_present': 'chunt',
    '1pl_present': 'chömed', '2pl_present': 'chömed', '3pl_present': 'chömed',
    participle: 'zruggchoo', aux: 'be', '2sg_imperative': 'chumm',
  },
  TURN: {
    base: 'sich dräie',
    '1sg_present': 'dräi', '2sg_present': 'dräisch', '3sg_present': 'dräit',
    '1pl_present': 'dräied', '2pl_present': 'dräied', '3pl_present': 'dräied',
    participle: 'dräit', '2sg_imperative': 'dräi',
  },
  LEAVE_DEPART: {
    // furtgaa, not weggaa.
    base: 'furtgaa', particle: 'furt',
    '1sg_present': 'gang', '2sg_present': 'gaasch', '3sg_present': 'gaat',
    '1pl_present': 'gönd', '2pl_present': 'gönd', '3pl_present': 'gönd',
    participle: 'furtggange', aux: 'be', '2sg_imperative': 'gang',
  },
  RUN_AWAY: {
    // dervoospringe, not weglaufe.
    base: 'dervoospringe', particle: 'dervoo',
    '1sg_present': 'spring', '2sg_present': 'springsch', '3sg_present': 'springt',
    '1pl_present': 'springed', '2pl_present': 'springed', '3pl_present': 'springed',
    participle: 'dervoogsprunge', aux: 'be', '2sg_imperative': 'spring',
  },
  GO_OUT: {
    base: 'usegaa', particle: 'use',
    '1sg_present': 'gang', '2sg_present': 'gaasch', '3sg_present': 'gaat',
    '1pl_present': 'gönd', '2pl_present': 'gönd', '3pl_present': 'gönd',
    participle: 'useggange', aux: 'be', '2sg_imperative': 'gang',
  },
  WALK: {
    // laufe is the Zürich verb for walking, so de's particle (zu Fuss) has no counterpart.
    base: 'laufe',
    '1sg_present': 'lauf', '2sg_present': 'laufsch', '3sg_present': 'lauft',
    '1pl_present': 'laufed', '2pl_present': 'laufed', '3pl_present': 'laufed',
    participle: 'gloffe', aux: 'be', '2sg_imperative': 'lauf',
  },
  MOVE_ONESELF: {
    base: 'sich bewege',
    '1sg_present': 'beweg', '2sg_present': 'bewegsch', '3sg_present': 'bewegt',
    '1pl_present': 'beweged', '2pl_present': 'beweged', '3pl_present': 'beweged',
    participle: 'bewegt', '2sg_imperative': 'beweg',
  },
  SIT_DOWN: {
    // abhocke, not sich setze: separable and not reflexive, and it takes sii (ich bi abghockt).
    base: 'abhocke', particle: 'ab',
    '1sg_present': 'hock', '2sg_present': 'hocksch', '3sg_present': 'hockt',
    '1pl_present': 'hocked', '2pl_present': 'hocked', '3pl_present': 'hocked',
    participle: 'abghockt', aux: 'be', '2sg_imperative': 'hock',
  },
  STAND_UP: {
    base: 'ufstaa', particle: 'uf',
    '1sg_present': 'stand', '2sg_present': 'staasch', '3sg_present': 'staat',
    '1pl_present': 'stönd', '2pl_present': 'stönd', '3pl_present': 'stönd',
    participle: 'ufgstande', aux: 'be', '2sg_imperative': 'stand',
  },
  BECOME: {
    base: 'wärde',
    '1sg_present': 'wirde', '2sg_present': 'wirsch', '3sg_present': 'wird',
    '1pl_present': 'wärded', '2pl_present': 'wärded', '3pl_present': 'wärded',
    participle: 'worde', aux: 'be', '2sg_imperative': 'wird',
  },
  SEEM: {
    base: 'schiine', seeming: '1',
    '1sg_present': 'schiin', '2sg_present': 'schiinsch', '3sg_present': 'schiint',
    '1pl_present': 'schiined', '2pl_present': 'schiined', '3pl_present': 'schiined',
    participle: 'gschune', '2sg_imperative': 'schiin',
  },
  APPEAR: {
    base: 'erschiine',
    '1sg_present': 'erschiin', '2sg_present': 'erschiinsch', '3sg_present': 'erschiint',
    '1pl_present': 'erschiined', '2pl_present': 'erschiined', '3pl_present': 'erschiined',
    participle: 'erschine', aux: 'be', '2sg_imperative': 'erschiin',
  },
  BE: {
    base: 'sii', copula: '1',
    '1sg_present': 'bi', '2sg_present': 'bisch', '3sg_present': 'isch',
    '1pl_present': 'sind', '2pl_present': 'sind', '3pl_present': 'sind',
    '2sg_imperative': 'bis', '1pl_imperative': 'sind', // sind mir! (verify)
    participle: 'gsii', aux: 'be',
    // The synthetic conditional, which *sii* keeps where every other verb says *würd* + infinitive
    // (P10-E13 D1): "wenn er dihei wär".
    '1sg_conditional': 'wär', '2sg_conditional': 'wärsch', '3sg_conditional': 'wär',
    '1pl_conditional': 'wäred', '2pl_conditional': 'wäred', '3pl_conditional': 'wäred',
  },
  BE_FARING: {
    base: 'gaa',
    '1sg_present': 'gang', '2sg_present': 'gaasch', '3sg_present': 'gaat',
    '1pl_present': 'gönd', '2pl_present': 'gönd', '3pl_present': 'gönd',
    participle: 'ggange', aux: 'be', '2sg_imperative': 'gang',
  },
  FLY: {
    base: 'flüüge',
    '1sg_present': 'flüüg', '2sg_present': 'flüügsch', '3sg_present': 'flüügt',
    '1pl_present': 'flüüged', '2pl_present': 'flüüged', '3pl_present': 'flüüged',
    participle: 'gfloge', aux: 'be', '2sg_imperative': 'flüüg',
  },
  // The modals: the participle is the infinitive (Ersatzinfinitiv, ich ha müese gaa); no imperative.
  MUST: {
    base: 'müese',
    '1sg_present': 'mues', '2sg_present': 'muesch', '3sg_present': 'mues',
    '1pl_present': 'müend', '2pl_present': 'müend', '3pl_present': 'müend',
    participle: 'müese',
  },
  CAN: {
    base: 'chöne',
    '1sg_present': 'cha', '2sg_present': 'chasch', '3sg_present': 'cha',
    '1pl_present': 'chönd', '2pl_present': 'chönd', '3pl_present': 'chönd',
    participle: 'chöne',
  },
  WILL: {
    base: 'wele',
    '1sg_present': 'wott', '2sg_present': 'wotsch', '3sg_present': 'wott',
    '1pl_present': 'wänd', '2pl_present': 'wänd', '3pl_present': 'wänd',
    participle: 'wele',
  },
  MAY: {
    base: 'dörfe',
    '1sg_present': 'darf', '2sg_present': 'darfsch', '3sg_present': 'darf',
    '1pl_present': 'dörfed', '2pl_present': 'dörfed', '3pl_present': 'dörfed',
    participle: 'dörfe',
  },
  SHOULD: {
    // The Swiss conditional of söle, as de stores sollte.
    base: 'söle', conditional: '1',
    '1sg_present': 'sött', '2sg_present': 'söttsch', '3sg_present': 'sött',
    '1pl_present': 'sötted', '2pl_present': 'sötted', '3pl_present': 'sötted',
    participle: 'söle',
  },
  MIGHT: {
    // The Swiss conditional of chöne, as de stores könnte.
    base: 'chöne', conditional: '1',
    '1sg_present': 'chönnt', '2sg_present': 'chönntsch', '3sg_present': 'chönnt',
    '1pl_present': 'chönnted', '2pl_present': 'chönnted', '3pl_present': 'chönnted',
    participle: 'chöne',
  },
};
