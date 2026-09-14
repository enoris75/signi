import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the Spanish function-level unit tests. The forms mirror the seeded
// Spanish lexicon (packages/backend/src/concepts, plus the verbs' gerund/participle from
// verbs/nonfinite.ts) and the keys the lexicon and translator thread onto them (animate, human,
// uncountable, proper, isA, mannerRelation, dimensionRelation, transient, role, definiteness,
// number, degree…) — so each test shows exactly which forms drive its output. Rendering through the
// real lexicon is covered by the sentence-level suite in packages/engine/test. The builders come
// from the language-neutral `resolved.fixtures.ts`.

// ── Nouns ───────────────────────────────────────────────────────────────────

export const GATO: Forms = { base: 'gato', plural: 'gatos', gender: 'masc', count: 'singular', fem: 'gata', fem_plural: 'gatas', animate: '1' };
export const PERRO: Forms = { base: 'perro', plural: 'perros', gender: 'masc', count: 'singular', fem: 'perra', fem_plural: 'perras', animate: '1' };
export const RATON: Forms = { base: 'ratón', plural: 'ratones', gender: 'masc', count: 'singular', animate: '1' };
export const NINO: Forms = { base: 'niño', plural: 'niños', gender: 'masc', count: 'singular', fem: 'niña', fem_plural: 'niñas', animate: '1', human: '1' };
export const HOMBRE: Forms = { base: 'hombre', plural: 'hombres', gender: 'masc', count: 'singular', animate: '1', human: '1' };
export const MUJER: Forms = { base: 'mujer', plural: 'mujeres', gender: 'fem', count: 'singular', animate: '1', human: '1' };
export const PERSONA: Forms = { base: 'persona', plural: 'personas', gender: 'fem', count: 'singular', animate: '1', human: '1' };
export const VACA: Forms = { base: 'vaca', plural: 'vacas', gender: 'fem', count: 'singular', animate: '1' };
export const LIBRO: Forms = { base: 'libro', plural: 'libros', gender: 'masc', count: 'singular' };
export const CASA: Forms = { base: 'casa', plural: 'casas', gender: 'fem', count: 'singular' };
export const PALABRA: Forms = { base: 'palabra', plural: 'palabras', gender: 'fem', count: 'singular' };
export const FRASE: Forms = { base: 'frase', plural: 'frases', gender: 'fem', count: 'singular' };
export const PALO: Forms = { base: 'palo', plural: 'palos', gender: 'masc', count: 'singular' };
export const MERCADO: Forms = { base: 'mercado', plural: 'mercados', gender: 'masc', count: 'singular' };
export const LEYENDA: Forms = { base: 'leyenda', plural: 'leyendas', gender: 'fem', count: 'singular' };
export const LUZ: Forms = { base: 'luz', plural: 'luces', gender: 'fem', count: 'singular' };
/** A masculine noun ending in -a ("el idioma"). */
export const IDIOMA: Forms = { base: 'idioma', plural: 'idiomas', gender: 'masc', count: 'singular' };
export const CREADOR: Forms = { base: 'creador', plural: 'creadores', gender: 'masc', count: 'singular', fem: 'creadora', fem_plural: 'creadoras', animate: '1' };
/** A feminine mass noun with a stressed a-: the singular articles are el/un ("el agua"). */
export const AGUA: Forms = { base: 'agua', gender: 'fem', stressed_a: '1', count: 'singular', uncountable: '1' };
/** A masculine mass noun. */
export const DINERO: Forms = { base: 'dinero', gender: 'masc', count: 'singular', uncountable: '1' };
export const COMIDA: Forms = { base: 'comida', gender: 'fem', count: 'singular', uncountable: '1' };
export const CONTINENTE: Forms = { base: 'continente', plural: 'continentes', gender: 'masc', count: 'singular' };
/** Proper names that go bare. */
export const AFRICA: Forms = { base: 'África', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
export const EUROPA: Forms = { base: 'Europa', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
/** A proper name that is inherently articled ("la Antártida"). */
export const ANTARTIDA: Forms = { base: 'Antártida', gender: 'fem', takes_article: '1', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };

// Manner nouns (a manner adverbial's head) and dimension nouns (an adjective-definition gloss's head).
export const VELOCIDAD: Forms = { base: 'velocidad', plural: 'velocidades', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
export const MANERA: Forms = { base: 'manera', plural: 'maneras', gender: 'fem', count: 'singular', mannerRelation: 'mode' };
export const TIEMPO: Forms = { base: 'tiempo', plural: 'tiempos', gender: 'masc', count: 'singular', mannerRelation: 'measure' };
/** An uncountable means noun ("con cuidado"). */
export const CUIDADO: Forms = { base: 'cuidado', gender: 'masc', count: 'singular', uncountable: '1', mannerRelation: 'means' };
export const TAMANO: Forms = { base: 'tamaño', plural: 'tamaños', gender: 'masc', count: 'singular', dimensionRelation: 'extent' };
export const ALTURA: Forms = { base: 'altura', plural: 'alturas', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const CALIDAD: Forms = { base: 'calidad', plural: 'calidades', gender: 'fem', count: 'singular', dimensionRelation: 'quality' };
export const TEMPERATURA: Forms = { base: 'temperatura', plural: 'temperaturas', gender: 'fem', count: 'singular', dimensionRelation: 'measure' };

// ── Pronouns ────────────────────────────────────────────────────────────────
// As seeded; the translator swaps `base`/`disjunctive` for the requested number and gender, so the
// resolved variants the tests most often need are spelled out below them.

export const YO: Forms = { base: 'yo', person: '1', number: 'singular', plural: 'nosotros', plural_fem: 'nosotras', disjunctive: 'mí', disjunctive_plural: 'nosotros', object: 'me', object_plural: 'nos' };
export const TU: Forms = { base: 'tú', person: '2', number: 'singular', plural: 'vosotros', plural_fem: 'vosotras', disjunctive: 'ti', disjunctive_plural: 'vosotros', object: 'te', object_plural: 'os' };
export const EL: Forms = {
  base: 'él', person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella', singular_neut: 'ello', plural: 'ellos', plural_fem: 'ellas',
  disjunctive: 'él', disjunctive_fem: 'ella', disjunctive_neut: 'ello', disjunctive_plural: 'ellos', object: 'lo', object_fem: 'la', object_neut: 'lo', object_plural: 'los', object_plural_fem: 'las',
};
/** The generic "one", realised as the impersonal clitic. */
export const SE: Forms = { base: 'se', person: '3', number: 'singular', generic: '1' };

/** "ella", as the translator resolves a feminine third-person singular. */
export const ELLA: Forms = { ...EL, base: 'ella', gender: 'fem', disjunctive: 'ella' };
/** "nosotros", as the translator resolves a first-person plural. */
export const NOSOTROS: Forms = { ...YO, base: 'nosotros', number: 'plural', gender: 'masc', disjunctive: 'nosotros' };
/** "vosotros", as the translator resolves a second-person plural. */
export const VOSOTROS: Forms = { ...TU, base: 'vosotros', number: 'plural', gender: 'masc', disjunctive: 'vosotros' };
/** "ellos", as the translator resolves a third-person plural. */
export const ELLOS: Forms = { ...EL, base: 'ellos', number: 'plural', disjunctive: 'ellos' };

// ── Adjectives ──────────────────────────────────────────────────────────────

/** BIG and GREAT are both "grande", which would apocopate to "gran" before a noun. */
export const GRANDE: Forms = { role: 'adjective', base: 'grande' };
export const PEQUENO: Forms = { role: 'adjective', base: 'pequeño' };
export const ALTO: Forms = { role: 'adjective', base: 'alto' };
export const BAJO: Forms = { role: 'adjective', base: 'bajo' };
export const BUENO: Forms = { role: 'adjective', base: 'bueno' };
export const MALO: Forms = { role: 'adjective', base: 'malo' };
export const VIEJO: Forms = { role: 'adjective', base: 'viejo' };
export const NUEVO: Forms = { role: 'adjective', base: 'nuevo' };
export const HERMOSO: Forms = { role: 'adjective', base: 'hermoso' };
export const FUERTE: Forms = { role: 'adjective', base: 'fuerte' };
export const INTERESANTE: Forms = { role: 'adjective', base: 'interesante' };
export const RAPIDO: Forms = { role: 'adjective', base: 'rápido' };
export const SALVAJE: Forms = { role: 'adjective', base: 'salvaje' };
/** Consonant-final, gender-invariant adjectives. */
export const FELIZ: Forms = { role: 'adjective', base: 'feliz', transient: '1' };
export const DEBIL: Forms = { role: 'adjective', base: 'débil' };
export const JOVEN: Forms = { role: 'adjective', base: 'joven' };
export const MARRON: Forms = { role: 'adjective', base: 'marrón' };
/** Transient states, predicated with estar. */
export const TRISTE: Forms = { role: 'adjective', base: 'triste', transient: '1' };
export const CANSADO: Forms = { role: 'adjective', base: 'cansado', transient: '1' };
export const FRIO: Forms = { role: 'adjective', base: 'frío', transient: '1' };
/** The prenominal ordinals (concept ids FIRST / SECOND / THIRD). */
export const PRIMERO: Forms = { role: 'adjective', base: 'primero' };
export const SEGUNDO: Forms = { role: 'adjective', base: 'segundo' };
export const TERCERO: Forms = { role: 'adjective', base: 'tercero' };

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const RAPIDO_ADV: Forms = { base: 'rápido' };
export const LENTAMENTE: Forms = { base: 'lentamente' };
export const BIEN: Forms = { base: 'bien' };
export const SIEMPRE: Forms = { base: 'siempre', subtype: 'frequency' };
export const NUNCA: Forms = { base: 'nunca', subtype: 'frequency', polarity: 'negative' };

// ── Verbs ───────────────────────────────────────────────────────────────────

export const COMER: Forms = {
  base: 'comer', gerund: 'comiendo', participle: 'comido',
  '1sg_present': 'como', '2sg_present': 'comes', '3sg_present': 'come',
  '1pl_present': 'comemos', '2pl_present': 'coméis', '3pl_present': 'comen',
  '1sg_past': 'comí', '2sg_past': 'comiste', '3sg_past': 'comió',
  '1pl_past': 'comimos', '2pl_past': 'comisteis', '3pl_past': 'comieron',
  '1sg_future': 'comeré', '2sg_future': 'comerás', '3sg_future': 'comerá',
  '1pl_future': 'comeremos', '2pl_future': 'comeréis', '3pl_future': 'comerán',
};
export const BEBER: Forms = {
  base: 'beber', gerund: 'bebiendo', participle: 'bebido',
  '1sg_present': 'bebo', '2sg_present': 'bebes', '3sg_present': 'bebe',
  '1pl_present': 'bebemos', '2pl_present': 'bebéis', '3pl_present': 'beben',
  '1sg_past': 'bebí', '2sg_past': 'bebiste', '3sg_past': 'bebió',
  '1pl_past': 'bebimos', '2pl_past': 'bebisteis', '3pl_past': 'bebieron',
  '1sg_future': 'beberé', '2sg_future': 'beberás', '3sg_future': 'beberá',
  '1pl_future': 'beberemos', '2pl_future': 'beberéis', '3pl_future': 'beberán',
};
export const VER: Forms = {
  base: 'ver', gerund: 'viendo', participle: 'visto',
  '1sg_present': 'veo', '2sg_present': 'ves', '3sg_present': 've',
  '1pl_present': 'vemos', '2pl_present': 'veis', '3pl_present': 'ven',
  '1sg_past': 'vi', '2sg_past': 'viste', '3sg_past': 'vio',
  '1pl_past': 'vimos', '2pl_past': 'visteis', '3pl_past': 'vieron',
  '1sg_future': 'veré', '2sg_future': 'verás', '3sg_future': 'verá',
  '1pl_future': 'veremos', '2pl_future': 'veréis', '3pl_future': 'verán',
};
export const ELEGIR: Forms = {
  base: 'elegir', gerund: 'eligiendo', participle: 'elegido',
  '1sg_present': 'elijo', '2sg_present': 'eliges', '3sg_present': 'elige',
  '1pl_present': 'elegimos', '2pl_present': 'elegís', '3pl_present': 'eligen',
  '1sg_past': 'elegí', '2sg_past': 'elegiste', '3sg_past': 'eligió',
  '1pl_past': 'elegimos', '2pl_past': 'elegisteis', '3pl_past': 'eligieron',
  '1sg_future': 'elegiré', '2sg_future': 'elegirás', '3sg_future': 'elegirá',
  '1pl_future': 'elegiremos', '2pl_future': 'elegiréis', '3pl_future': 'elegirán',
};
export const DAR: Forms = {
  base: 'dar', gerund: 'dando', participle: 'dado',
  '1sg_present': 'doy', '2sg_present': 'das', '3sg_present': 'da',
  '1pl_present': 'damos', '2pl_present': 'dais', '3pl_present': 'dan',
  '1sg_past': 'di', '2sg_past': 'diste', '3sg_past': 'dio',
  '1pl_past': 'dimos', '2pl_past': 'disteis', '3pl_past': 'dieron',
  '1sg_future': 'daré', '2sg_future': 'darás', '3sg_future': 'dará',
  '1pl_future': 'daremos', '2pl_future': 'daréis', '3pl_future': 'darán',
};
export const CORRER: Forms = {
  base: 'correr', gerund: 'corriendo', participle: 'corrido',
  '1sg_present': 'corro', '2sg_present': 'corres', '3sg_present': 'corre',
  '1pl_present': 'corremos', '2pl_present': 'corréis', '3pl_present': 'corren',
  '1sg_past': 'corrí', '2sg_past': 'corriste', '3sg_past': 'corrió',
  '1pl_past': 'corrimos', '2pl_past': 'corristeis', '3pl_past': 'corrieron',
  '1sg_future': 'correré', '2sg_future': 'correrás', '3sg_future': 'correrá',
  '1pl_future': 'correremos', '2pl_future': 'correréis', '3pl_future': 'correrán',
};
export const IR: Forms = {
  base: 'ir', gerund: 'yendo', participle: 'ido',
  '1sg_present': 'voy', '2sg_present': 'vas', '3sg_present': 'va',
  '1pl_present': 'vamos', '2pl_present': 'vais', '3pl_present': 'van',
  '1sg_past': 'fui', '2sg_past': 'fuiste', '3sg_past': 'fue',
  '1pl_past': 'fuimos', '2pl_past': 'fuisteis', '3pl_past': 'fueron',
  '1sg_future': 'iré', '2sg_future': 'irás', '3sg_future': 'irá',
  '1pl_future': 'iremos', '2pl_future': 'iréis', '3pl_future': 'irán',
};
export const VENIR: Forms = {
  base: 'venir', gerund: 'viniendo', participle: 'venido',
  '1sg_present': 'vengo', '2sg_present': 'vienes', '3sg_present': 'viene',
  '1pl_present': 'venimos', '2pl_present': 'venís', '3pl_present': 'vienen',
  '1sg_past': 'vine', '2sg_past': 'viniste', '3sg_past': 'vino',
  '1pl_past': 'vinimos', '2pl_past': 'vinisteis', '3pl_past': 'vinieron',
  '1sg_future': 'vendré', '2sg_future': 'vendrás', '3sg_future': 'vendrá',
  '1pl_future': 'vendremos', '2pl_future': 'vendréis', '3pl_future': 'vendrán',
};
/** The copula "ser" (concept BE); `predicateText` swaps in "estar" by concept id. */
export const SER: Forms = {
  base: 'ser', stative: '1', copula: '1', gerund: 'siendo', participle: 'sido',
  '1sg_present': 'soy', '2sg_present': 'eres', '3sg_present': 'es',
  '1pl_present': 'somos', '2pl_present': 'sois', '3pl_present': 'son',
  '1sg_past': 'fui', '2sg_past': 'fuiste', '3sg_past': 'fue',
  '1pl_past': 'fuimos', '2pl_past': 'fuisteis', '3pl_past': 'fueron',
  '1sg_future': 'seré', '2sg_future': 'serás', '3sg_future': 'será',
  '1pl_future': 'seremos', '2pl_future': 'seréis', '3pl_future': 'serán',
};
export const PARECER: Forms = {
  base: 'parecer', stative: '1', gerund: 'pareciendo', participle: 'parecido',
  '1sg_present': 'parezco', '2sg_present': 'pareces', '3sg_present': 'parece',
  '1pl_present': 'parecemos', '2pl_present': 'parecéis', '3pl_present': 'parecen',
  '1sg_past': 'parecí', '2sg_past': 'pareciste', '3sg_past': 'pareció',
  '1pl_past': 'parecimos', '2pl_past': 'parecisteis', '3pl_past': 'parecieron',
  '1sg_future': 'pareceré', '2sg_future': 'parecerás', '3sg_future': 'parecerá',
  '1pl_future': 'pareceremos', '2pl_future': 'pareceréis', '3pl_future': 'parecerán',
};
/** A lexically reflexive verb (concept BECOME): the finite forms carry the clitic, the participle does not. */
export const VOLVERSE: Forms = {
  base: 'volverse', gerund: 'volviéndose', participle: 'vuelto',
  '1sg_present': 'me vuelvo', '2sg_present': 'te vuelves', '3sg_present': 'se vuelve',
  '1pl_present': 'nos volvemos', '2pl_present': 'os volvéis', '3pl_present': 'se vuelven',
  '1sg_past': 'me volví', '2sg_past': 'te volviste', '3sg_past': 'se volvió',
  '1pl_past': 'nos volvimos', '2pl_past': 'os volvisteis', '3pl_past': 'se volvieron',
  '1sg_future': 'me volveré', '2sg_future': 'te volverás', '3sg_future': 'se volverá',
  '1pl_future': 'nos volveremos', '2pl_future': 'os volveréis', '3pl_future': 'se volverán',
};

// Modals (concepts MUST / CAN / WILL).
export const DEBER: Forms = {
  base: 'deber', stative: '1',
  '1sg_present': 'debo', '2sg_present': 'debes', '3sg_present': 'debe',
  '1pl_present': 'debemos', '2pl_present': 'debéis', '3pl_present': 'deben',
  '1sg_past': 'debí', '2sg_past': 'debiste', '3sg_past': 'debió',
  '1pl_past': 'debimos', '2pl_past': 'debisteis', '3pl_past': 'debieron',
  '1sg_future': 'deberé', '2sg_future': 'deberás', '3sg_future': 'deberá',
  '1pl_future': 'deberemos', '2pl_future': 'deberéis', '3pl_future': 'deberán',
};
export const PODER: Forms = {
  base: 'poder', stative: '1',
  '1sg_present': 'puedo', '2sg_present': 'puedes', '3sg_present': 'puede',
  '1pl_present': 'podemos', '2pl_present': 'podéis', '3pl_present': 'pueden',
  '1sg_past': 'pude', '2sg_past': 'pudiste', '3sg_past': 'pudo',
  '1pl_past': 'pudimos', '2pl_past': 'pudisteis', '3pl_past': 'pudieron',
  '1sg_future': 'podré', '2sg_future': 'podrás', '3sg_future': 'podrá',
  '1pl_future': 'podremos', '2pl_future': 'podréis', '3pl_future': 'podrán',
};
export const QUERER: Forms = {
  base: 'querer', stative: '1',
  '1sg_present': 'quiero', '2sg_present': 'quieres', '3sg_present': 'quiere',
  '1pl_present': 'queremos', '2pl_present': 'queréis', '3pl_present': 'quieren',
  '1sg_past': 'quise', '2sg_past': 'quisiste', '3sg_past': 'quiso',
  '1pl_past': 'quisimos', '2pl_past': 'quisisteis', '3pl_past': 'quisieron',
  '1sg_future': 'querré', '2sg_future': 'querrás', '3sg_future': 'querrá',
  '1pl_future': 'querremos', '2pl_future': 'querréis', '3pl_future': 'querrán',
};
export const ARDER: Forms = { base: 'arder', '3sg_present': 'arde' };
export const SEMANTICO: Forms = { role: 'adjective', base: 'semántico' };
