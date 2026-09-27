import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the Catalan function-level unit tests. The forms mirror the seeded
// Catalan column (packages/backend/src/concepts/ca) and the keys the lexicon and translator thread onto
// them (animate, human, uncountable, proper, stative, transient, role, definiteness, number, degree…),
// trimmed to what the functions read — so each test shows exactly which forms drive its output.
// Rendering through the real lexicon is covered by the sentence suite in
// packages/engine/test/languages/ca.test.ts. The builders come from the language-neutral
// `resolved.fixtures.ts`.

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

/** Six person cells of one tense or mood, as the column stores them (`1sg_present` …). */
function cells(tense: string, forms: readonly string[]): Forms {
  return Object.fromEntries(PERSONS.map((p, i) => [`${p}_${tense}`, forms[i]!]));
}

// ── Nouns ───────────────────────────────────────────────────────────────────

export const GAT: Forms = { base: 'gat', plural: 'gats', gender: 'masc', count: 'singular', fem: 'gata', fem_plural: 'gates', animate: '1' };
export const GOS: Forms = { base: 'gos', plural: 'gossos', gender: 'masc', count: 'singular', fem: 'gossa', fem_plural: 'gosses', animate: '1' };
export const RATOLI: Forms = { base: 'ratolí', plural: 'ratolins', gender: 'masc', count: 'singular', animate: '1' };
export const NEN: Forms = { base: 'nen', plural: 'nens', gender: 'masc', count: 'singular', fem: 'nena', fem_plural: 'nenes', animate: '1', human: '1' };
/** Vowel-initial masculine: l'home, els homes, un home. */
export const HOME: Forms = { base: 'home', plural: 'homes', gender: 'masc', count: 'singular', animate: '1', human: '1' };
export const DONA: Forms = { base: 'dona', plural: 'dones', gender: 'fem', count: 'singular', animate: '1', human: '1' };
/** Vowel-initial masculine person noun: l'amic. */
export const AMIC: Forms = { base: 'amic', plural: 'amics', gender: 'masc', count: 'singular', fem: 'amiga', fem_plural: 'amigues', animate: '1', human: '1' };
export const CREADOR: Forms = { base: 'creador', plural: 'creadors', gender: 'masc', count: 'singular', animate: '1' };
export const FRASE: Forms = { base: 'frase', plural: 'frases', gender: 'fem', count: 'singular' };
export const LLIBRE: Forms = { base: 'llibre', plural: 'llibres', gender: 'masc', count: 'singular' };
export const CASA: Forms = { base: 'casa', plural: 'cases', gender: 'fem', count: 'singular' };
export const PARAULA: Forms = { base: 'paraula', plural: 'paraules', gender: 'fem', count: 'singular' };
export const ARBRE: Forms = { base: 'arbre', plural: 'arbres', gender: 'masc', count: 'singular' };
export const PAL: Forms = { base: 'pal', plural: 'pals', gender: 'masc', count: 'singular' };
export const MERCAT: Forms = { base: 'mercat', plural: 'mercats', gender: 'masc', count: 'singular' };
export const BOTO: Forms = { base: 'botó', plural: 'botons', gender: 'masc', count: 'singular' };
export const LLEGENDA: Forms = { base: 'llegenda', plural: 'llegendes', gender: 'fem', count: 'singular' };
export const DIA: Forms = { base: 'dia', plural: 'dies', gender: 'masc', count: 'singular' };
export const ANIMAL: Forms = { base: 'animal', plural: 'animals', gender: 'masc', count: 'singular', animate: '1' };
/** A feminine noun with an unstressed hi-: *la* stays whole (`no_elision`). */
export const HISTORIA: Forms = { base: 'història', plural: 'històries', gender: 'fem', count: 'singular', no_elision: '1' };
export const UNIVERSITAT: Forms = { base: 'universitat', plural: 'universitats', gender: 'fem', count: 'singular', no_elision: '1' };
/** Vowel-initial feminine that elides: l'illa. */
export const ILLA: Forms = { base: 'illa', plural: 'illes', gender: 'fem', count: 'singular' };
/** A feminine mass noun: l'aigua, una mica d'aigua, tota l'aigua. */
export const AIGUA: Forms = { base: 'aigua', gender: 'fem', count: 'singular', uncountable: '1' };
export const MENJAR_N: Forms = { base: 'menjar', gender: 'masc', count: 'singular', uncountable: '1' };
/** A plurale tantum: els diners. */
export const DINERS: Forms = { base: 'diners', plural: 'diners', gender: 'masc', count: 'plural', uncountable: '1' };
/** Place names: Europa goes bare, l'Àfrica carries its article (`takes_article`). */
export const EUROPA: Forms = { base: 'Europa', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
export const AFRICA: Forms = { base: 'Àfrica', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', takes_article: '1', isA: 'CONTINENT' };

// Manner and dimension nouns.
export const VELOCITAT: Forms = { base: 'velocitat', plural: 'velocitats', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
export const MANERA: Forms = { base: 'manera', plural: 'maneres', gender: 'fem', count: 'singular', mannerRelation: 'mode' };
export const CURA: Forms = { base: 'cura', gender: 'fem', count: 'singular', uncountable: '1', mannerRelation: 'means' };
export const VENT: Forms = { base: 'vent', plural: 'vents', gender: 'masc', count: 'singular' };
export const MIDA: Forms = { base: 'mida', plural: 'mides', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const QUALITAT: Forms = { base: 'qualitat', plural: 'qualitats', gender: 'fem', count: 'singular', dimensionRelation: 'quality' };
export const TEMPERATURA: Forms = { base: 'temperatura', plural: 'temperatures', gender: 'fem', count: 'singular', dimensionRelation: 'measure' };

// ── Pronouns ────────────────────────────────────────────────────────────────

export const JO: Forms = { base: 'jo', person: '1', number: 'singular', plural: 'nosaltres', disjunctive: 'mi', disjunctive_plural: 'nosaltres', object: 'em', object_plural: 'ens' };
export const TU: Forms = { base: 'tu', person: '2', number: 'singular', plural: 'vosaltres', disjunctive: 'tu', disjunctive_plural: 'vosaltres', object: 'et', object_plural: 'us' };
export const ELL: Forms = {
  base: 'ell', person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella', plural: 'ells', plural_fem: 'elles',
  disjunctive: 'ell', disjunctive_fem: 'ella', disjunctive_plural: 'ells', disjunctive_plural_fem: 'elles',
  object: 'el', object_fem: 'la', object_neut: 'ho', object_plural: 'els', object_plural_fem: 'les', dative: 'li', dative_plural: 'els',
};
/** "ella", as the translator resolves a feminine third-person singular. */
export const ELLA: Forms = { ...ELL, base: 'ella', gender: 'fem', disjunctive: 'ella' };
/** "nosaltres", "vosaltres", "ells", as the translator resolves the plurals. */
export const NOSALTRES: Forms = { ...JO, base: 'nosaltres', number: 'plural', gender: 'masc', disjunctive: 'nosaltres' };
export const VOSALTRES: Forms = { ...TU, base: 'vosaltres', number: 'plural', gender: 'masc', disjunctive: 'vosaltres' };
export const ELLS: Forms = { ...ELL, base: 'ells', number: 'plural', disjunctive: 'ells' };
/** The generic "one", the impersonal *es* (P03 D5); *un* where a pronominal verb has its own *es*. */
export const ES: Forms = { base: 'es', person: '3', number: 'singular', generic: '1', generic_reflexive: 'un', disjunctive: 'un' };

// ── Adjectives (all four forms stored, P03 D6) ─────────────────────────────

export const GRAN: Forms = { role: 'adjective', base: 'gran', fem: 'gran', plural: 'grans', fem_plural: 'grans' };
export const PETIT: Forms = { role: 'adjective', base: 'petit', fem: 'petita', plural: 'petits', fem_plural: 'petites' };
export const NEGRE: Forms = { role: 'adjective', base: 'negre', fem: 'negra', plural: 'negres', fem_plural: 'negres' };
export const BLANC: Forms = { role: 'adjective', base: 'blanc', fem: 'blanca', plural: 'blancs', fem_plural: 'blanques' };
export const BO: Forms = { role: 'adjective', base: 'bo', fem: 'bona', plural: 'bons', fem_plural: 'bones' };
export const NOU: Forms = { role: 'adjective', base: 'nou', fem: 'nova', plural: 'nous', fem_plural: 'noves' };
export const VELL: Forms = { role: 'adjective', base: 'vell', fem: 'vella', plural: 'vells', fem_plural: 'velles' };
export const ALTRE: Forms = { role: 'adjective', base: 'altre', fem: 'altra', plural: 'altres', fem_plural: 'altres' };
export const ALT: Forms = { role: 'adjective', base: 'alt', fem: 'alta', plural: 'alts', fem_plural: 'altes' };
export const PRIMER: Forms = { role: 'adjective', base: 'primer', fem: 'primera', plural: 'primers', fem_plural: 'primeres' };
/** Transient states, predicated with estar. */
export const FELIC: Forms = { role: 'adjective', base: 'feliç', fem: 'feliç', plural: 'feliços', fem_plural: 'feliços', transient: '1' };
export const CANSAT: Forms = { role: 'adjective', base: 'cansat', fem: 'cansada', plural: 'cansats', fem_plural: 'cansades', transient: '1' };
export const SEMANTIC: Forms = { role: 'adjective', base: 'semàntic', fem: 'semàntica', plural: 'semàntics', fem_plural: 'semàntiques' };

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const DE_PRESSA: Forms = { base: 'de pressa' };
export const SEMPRE: Forms = { base: 'sempre', subtype: 'frequency' };
export const MAI: Forms = { base: 'mai', subtype: 'frequency', polarity: 'negative' };
export const JA_NO: Forms = { base: 'ja no', subtype: 'frequency', polarity: 'negative', negator_lead: 'ja' };
export const JA: Forms = { base: 'ja', subtype: 'frequency', negative: 'encara', negative_slot: 'pre-negator' };
export const TAMBE: Forms = { base: 'també', subtype: 'frequency', negative: 'tampoc', negative_slot: 'pre-negation' };
export const JUNTS: Forms = { base: 'junts', predicative: 'junt' };

// ── Verbs (every finite cell stored, style-ca.md § Verbs) ──────────────────

export const MENJAR: Forms = {
  base: 'menjar', gerund: 'menjant',
  participle: 'menjat', participle_fem: 'menjada', participle_plural: 'menjats', participle_fem_plural: 'menjades',
  ...cells('present', ['menjo', 'menges', 'menja', 'mengem', 'mengeu', 'mengen']),
  ...cells('imperfect', ['menjava', 'menjaves', 'menjava', 'menjàvem', 'menjàveu', 'menjaven']),
  ...cells('future', ['menjaré', 'menjaràs', 'menjarà', 'menjarem', 'menjareu', 'menjaran']),
  ...cells('conditional', ['menjaria', 'menjaries', 'menjaria', 'menjaríem', 'menjaríeu', 'menjarien']),
  ...cells('subjunctive', ['mengi', 'mengis', 'mengi', 'mengem', 'mengeu', 'mengin']),
  ...cells('past_subjunctive', ['mengés', 'mengessis', 'mengés', 'mengéssim', 'mengéssiu', 'mengessin']),
  '2sg_imperative': 'menja', '1pl_imperative': 'mengem', '2pl_imperative': 'mengeu',
};
export const CORRER: Forms = {
  base: 'córrer', gerund: 'corrent', participle: 'corregut',
  ...cells('present', ['corro', 'corres', 'corre', 'correm', 'correu', 'corren']),
  ...cells('imperfect', ['corria', 'corries', 'corria', 'corríem', 'corríeu', 'corrien']),
  ...cells('future', ['correré', 'correràs', 'correrà', 'correrem', 'correreu', 'correran']),
  ...cells('conditional', ['correria', 'correries', 'correria', 'correríem', 'correríeu', 'correrien']),
  ...cells('subjunctive', ['corri', 'corris', 'corri', 'correm', 'correu', 'corrin']),
  ...cells('past_subjunctive', ['corregués', 'correguessis', 'corregués', 'correguéssim', 'correguéssiu', 'correguessin']),
  '2sg_imperative': 'corre', '1pl_imperative': 'correm', '2pl_imperative': 'correu',
};
export const ANAR: Forms = {
  base: 'anar', gerund: 'anant', participle: 'anat',
  ...cells('present', ['vaig', 'vas', 'va', 'anem', 'aneu', 'van']),
  ...cells('future', ['aniré', 'aniràs', 'anirà', 'anirem', 'anireu', 'aniran']),
  ...cells('subjunctive', ['vagi', 'vagis', 'vagi', 'anem', 'aneu', 'vagin']),
  '2sg_imperative': 'vés', '1pl_imperative': 'anem', '2pl_imperative': 'aneu',
};
export const VEURE: Forms = {
  base: 'veure', gerund: 'veient', participle: 'vist',
  ...cells('present', ['veig', 'veus', 'veu', 'veiem', 'veieu', 'veuen']),
  ...cells('subjunctive', ['vegi', 'vegis', 'vegi', 'vegem', 'vegeu', 'vegin']),
  '2sg_imperative': 'veges', '1pl_imperative': 'vegem', '2pl_imperative': 'vegeu',
};
export const DONAR: Forms = {
  base: 'donar', gerund: 'donant', participle: 'donat',
  ...cells('present', ['dono', 'dones', 'dona', 'donem', 'doneu', 'donen']),
  ...cells('subjunctive', ['doni', 'donis', 'doni', 'donem', 'doneu', 'donin']),
  '2sg_imperative': 'dona', '1pl_imperative': 'donem', '2pl_imperative': 'doneu',
};
export const ESTIMAR: Forms = { base: 'estimar', ...cells('present', ['estimo', 'estimes', 'estima', 'estimem', 'estimeu', 'estimen']) };
/** The copula *ser* (concept BE); `predicateText` swaps in *estar* for a transient predicate. */
export const SER: Forms = {
  base: 'ser', stative: '1', copula: '1', gerund: 'sent', participle: 'estat',
  ...cells('present', ['sóc', 'ets', 'és', 'som', 'sou', 'són']),
  ...cells('imperfect', ['era', 'eres', 'era', 'érem', 'éreu', 'eren']),
  ...cells('future', ['seré', 'seràs', 'serà', 'serem', 'sereu', 'seran']),
  ...cells('conditional', ['seria', 'series', 'seria', 'seríem', 'seríeu', 'serien']),
  ...cells('subjunctive', ['sigui', 'siguis', 'sigui', 'siguem', 'sigueu', 'siguin']),
  ...cells('past_subjunctive', ['fos', 'fossis', 'fos', 'fóssim', 'fóssiu', 'fossin']),
  '2sg_imperative': 'sigues', '1pl_imperative': 'siguem', '2pl_imperative': 'sigueu',
};
export const SEMBLAR: Forms = {
  base: 'semblar', stative: '1',
  ...cells('present', ['semblo', 'sembles', 'sembla', 'semblem', 'sembleu', 'semblen']),
  ...cells('imperfect', ['semblava', 'semblaves', 'semblava', 'semblàvem', 'semblàveu', 'semblaven']),
};
/** A pronominal verb (concept BECOME): the enclitic on the base, the proclitic in every finite cell. */
export const TORNAR_SE: Forms = {
  base: 'tornar-se', gerund: 'tornant', participle: 'tornat',
  ...cells('present', ['em torno', 'et tornes', 'es torna', 'ens tornem', 'us torneu', 'es tornen']),
  ...cells('future', ['em tornaré', 'et tornaràs', 'es tornarà', 'ens tornarem', 'us tornareu', 'es tornaran']),
  ...cells('conditional', ['em tornaria', 'et tornaries', 'es tornaria', 'ens tornaríem', 'us tornaríeu', 'es tornarien']),
  ...cells('subjunctive', ['em torni', 'et tornis', 'es torni', 'ens tornem', 'us torneu', 'es tornin']),
  '2sg_imperative': 'torna', '1pl_imperative': 'tornem', '2pl_imperative': 'torneu',
};
/** A vowel-initial pronominal verb: *s'atura*, *m'aturo*. */
export const ATURAR_SE: Forms = {
  base: 'aturar-se', gerund: 'aturant', participle: 'aturat',
  ...cells('present', ["m'aturo", "t'atures", "s'atura", 'ens aturem', 'us atureu', "s'aturen"]),
  '2sg_imperative': 'atura', '1pl_imperative': 'aturem', '2pl_imperative': 'atureu',
};
/** A pronominal verb whose infinitive ends in a vowel: *moure's*. */
export const MOURE_S: Forms = {
  base: "moure's", gerund: 'movent', participle: 'mogut',
  ...cells('present', ['em moc', 'et mous', 'es mou', 'ens movem', 'us moveu', 'es mouen']),
};

// Modals (concepts MUST / CAN / WILL). MUST is *haver de*: its particle is `infinitive_link`.
export const HAVER_DE: Forms = {
  base: 'haver', stative: '1', infinitive_link: 'de',
  ...cells('present', ['he', 'has', 'ha', 'hem', 'heu', 'han']),
  ...cells('imperfect', ['havia', 'havies', 'havia', 'havíem', 'havíeu', 'havien']),
  ...cells('conditional', ['hauria', 'hauries', 'hauria', 'hauríem', 'hauríeu', 'haurien']),
};
export const PODER: Forms = {
  base: 'poder', stative: '1',
  ...cells('present', ['puc', 'pots', 'pot', 'podem', 'podeu', 'poden']),
  ...cells('imperfect', ['podia', 'podies', 'podia', 'podíem', 'podíeu', 'podien']),
  ...cells('conditional', ['podria', 'podries', 'podria', 'podríem', 'podríeu', 'podrien']),
};
export const VOLER: Forms = {
  base: 'voler', stative: '1',
  ...cells('present', ['vull', 'vols', 'vol', 'volem', 'voleu', 'volen']),
  ...cells('imperfect', ['volia', 'volies', 'volia', 'volíem', 'volíeu', 'volien']),
};
export const CREMAR: Forms = { base: 'cremar', '3sg_present': 'crema' };
