import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the Portuguese function-level unit tests. The forms mirror the
// seeded Portuguese lexicon (packages/backend/src/concepts) plus the keys the lexicon and translator
// thread onto them (animate, human, uncountable, proper, isA, role, transient, definiteness, number,
// degree…), trimmed to what the functions read — so each test shows exactly which forms drive its
// output. Rendering through the real lexicon is covered by the sentence-level suite in
// packages/engine/test. The builders come from the language-neutral `resolved.fixtures.ts`.
//
// Some behaviour keys off the concept id rather than the forms — the suppletive comparison
// (BIG/GOOD/SMALL/BAD → maior/melhor/menor/pior) and the prenominal ordinals (FIRST/SECOND/THIRD) —
// so build those adjectives with their id: `concept({ ...GRANDE, degree: 'more' }, 'BIG')`.

// ── Nouns ───────────────────────────────────────────────────────────────────

export const GATO: Forms = { base: 'gato', plural: 'gatos', gender: 'masc', count: 'singular', animate: '1' };
/** CAT resolved feminine (the translator swaps in `fem` / `fem_plural`). */
export const GATA: Forms = { base: 'gata', plural: 'gatas', gender: 'fem', count: 'singular', animate: '1' };
export const CAO: Forms = { base: 'cão', plural: 'cães', gender: 'masc', count: 'singular', animate: '1' };
export const RATO: Forms = { base: 'rato', plural: 'ratos', gender: 'masc', count: 'singular', animate: '1' };
export const RAPOSA: Forms = { base: 'raposa', plural: 'raposas', gender: 'fem', count: 'singular', animate: '1' };
/** An -l noun (plural -is). */
export const ANIMAL: Forms = { base: 'animal', plural: 'animais', gender: 'masc', count: 'singular', animate: '1' };
export const MENINO: Forms = { base: 'menino', plural: 'meninos', gender: 'masc', count: 'singular', animate: '1', human: '1' };
/** An -m noun (plural -ns). */
export const HOMEM: Forms = { base: 'homem', plural: 'homens', gender: 'masc', count: 'singular', animate: '1', human: '1' };
/** A feminine -r noun (plural -es). */
export const MULHER: Forms = { base: 'mulher', plural: 'mulheres', gender: 'fem', count: 'singular', animate: '1', human: '1' };
export const CRIANCA: Forms = { base: 'criança', plural: 'crianças', gender: 'fem', count: 'singular', animate: '1', human: '1' };
export const PESSOA: Forms = { base: 'pessoa', plural: 'pessoas', gender: 'fem', count: 'singular', animate: '1', human: '1' };
export const LIVRO: Forms = { base: 'livro', plural: 'livros', gender: 'masc', count: 'singular' };
export const CASA: Forms = { base: 'casa', plural: 'casas', gender: 'fem', count: 'singular' };
/** A masculine -r noun (HOME). */
export const LAR: Forms = { base: 'lar', plural: 'lares', gender: 'masc', count: 'singular' };
/** A feminine -z noun (LIGHT). */
export const LUZ: Forms = { base: 'luz', plural: 'luzes', gender: 'fem', count: 'singular' };
/** An -ão noun with the -ões plural. */
export const PRISAO: Forms = { base: 'prisão', plural: 'prisões', gender: 'fem', count: 'singular' };
export const PAU: Forms = { base: 'pau', plural: 'paus', gender: 'masc', count: 'singular' };
export const PALAVRA: Forms = { base: 'palavra', plural: 'palavras', gender: 'fem', count: 'singular' };
export const CONTINENTE: Forms = { base: 'continente', plural: 'continentes', gender: 'masc', count: 'singular' };
/** A mass noun. */
export const AGUA: Forms = { base: 'água', gender: 'fem', count: 'singular', uncountable: '1' };
/** A masculine mass noun. */
export const DINHEIRO: Forms = { base: 'dinheiro', gender: 'masc', count: 'singular', uncountable: '1' };
/** Proper names: the language fixes the article (always definite in Portuguese). */
export const AFRICA: Forms = { base: 'África', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
export const EUROPA: Forms = { base: 'Europa', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
export const ANTARTIDA: Forms = { base: 'Antártida', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };

// Manner nouns (how a noun enters a manner adverbial) and dimension nouns (an adjective gloss).
export const VELOCIDADE: Forms = { base: 'velocidade', plural: 'velocidades', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
export const TEMPO: Forms = { base: 'tempo', plural: 'tempos', gender: 'masc', count: 'singular', mannerRelation: 'measure' };
export const MANEIRA: Forms = { base: 'maneira', plural: 'maneiras', gender: 'fem', count: 'singular', mannerRelation: 'mode' };
/** An uncountable means noun ("com cuidado"). */
export const CUIDADO: Forms = { base: 'cuidado', gender: 'masc', count: 'singular', uncountable: '1', mannerRelation: 'means' };
export const TAMANHO: Forms = { base: 'tamanho', plural: 'tamanhos', gender: 'masc', count: 'singular', dimensionRelation: 'extent' };
export const ALTURA: Forms = { base: 'altura', plural: 'alturas', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const QUALIDADE: Forms = { base: 'qualidade', plural: 'qualidades', gender: 'fem', count: 'singular', dimensionRelation: 'quality' };
export const TEMPERATURA: Forms = { base: 'temperatura', plural: 'temperaturas', gender: 'fem', count: 'singular', dimensionRelation: 'measure' };

// ── Pronouns ────────────────────────────────────────────────────────────────
// As the corpus stores them plus the person/number/gender the translator sets; the `…` resolved
// variants (ELA, NOS, ELES) show the surface the translator selects for that referent.

export const EU: Forms = { base: 'eu', person: '1', number: 'singular', gender: 'masc', plural: 'nós', disjunctive: 'mim', disjunctive_plural: 'nós', object: 'me', object_plural: 'nos' };
export const VOCE: Forms = { base: 'você', person: '2', number: 'singular', gender: 'masc', plural: 'vocês', disjunctive: 'você', disjunctive_plural: 'vocês', object: 'te', object_plural: 'vos' };
export const ELE: Forms = {
  base: 'ele', person: '3', number: 'singular', gender: 'masc', singular_fem: 'ela', singular_neut: 'isso', plural: 'eles', plural_fem: 'elas',
  disjunctive: 'ele', disjunctive_fem: 'ela', disjunctive_neut: 'isso', disjunctive_plural: 'eles',
  object: 'o', object_fem: 'a', object_neut: 'o', object_plural: 'os', object_plural_fem: 'as',
};
/** THIRD_PERSON resolved feminine singular. */
export const ELA: Forms = { ...ELE, base: 'ela', gender: 'fem', disjunctive: 'ela' };
/** FIRST_PERSON resolved plural. */
export const NOS: Forms = { ...EU, base: 'nós', number: 'plural', plural: 'nós', disjunctive: 'nós' };
/** THIRD_PERSON resolved masculine plural. */
export const ELES: Forms = { ...ELE, base: 'eles', number: 'plural', plural: 'eles', disjunctive: 'eles' };
/** The generic / impersonal subject ("se come"). */
export const SE: Forms = { base: 'se', person: '3', number: 'singular', gender: 'masc', generic: '1' };

// ── Adjectives ──────────────────────────────────────────────────────────────

/** BIG — suppletive "maior" (build with id 'BIG'). */
export const GRANDE: Forms = { role: 'adjective', base: 'grande' };
/** SMALL — suppletive "menor" (build with id 'SMALL'). */
export const PEQUENO: Forms = { role: 'adjective', base: 'pequeno' };
/** GOOD — irregular feminine "boa", suppletive "melhor" (build with id 'GOOD'). */
export const BOM: Forms = { role: 'adjective', base: 'bom' };
/** BAD — irregular feminine "má", suppletive "pior" (build with id 'BAD'). */
export const MAU: Forms = { role: 'adjective', base: 'mau' };
export const ALTO: Forms = { role: 'adjective', base: 'alto' };
export const VELHO: Forms = { role: 'adjective', base: 'velho' };
export const NOVO: Forms = { role: 'adjective', base: 'novo' };
export const BELO: Forms = { role: 'adjective', base: 'belo' };
export const FORTE: Forms = { role: 'adjective', base: 'forte' };
export const JOVEM: Forms = { role: 'adjective', base: 'jovem' };
export const UNIVERSAL: Forms = { role: 'adjective', base: 'universal' };
/** Transient states: predicated with "estar" (A47). */
export const FELIZ: Forms = { role: 'adjective', base: 'feliz', transient: '1' };
export const CANSADO: Forms = { role: 'adjective', base: 'cansado', transient: '1' };
/** FIRST — a prenominal ordinal (build with id 'FIRST'). */
export const PRIMEIRO: Forms = { role: 'adjective', base: 'primeiro' };
/** SECOND — a prenominal ordinal (build with id 'SECOND'). */
export const SEGUNDO: Forms = { role: 'adjective', base: 'segundo' };

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const RAPIDAMENTE: Forms = { base: 'rapidamente' };
export const SEMPRE: Forms = { base: 'sempre', subtype: 'frequency' };
export const NUNCA: Forms = { base: 'nunca', subtype: 'frequency', polarity: 'negative' };

// ── Verbs ───────────────────────────────────────────────────────────────────

export const COMER: Forms = {
  base: 'comer', gerund: 'comendo', participle: 'comido',
  '1sg_present': 'como', '2sg_present': 'come', '3sg_present': 'come',
  '1pl_present': 'comemos', '2pl_present': 'comem', '3pl_present': 'comem',
  '1sg_past': 'comi', '2sg_past': 'comeu', '3sg_past': 'comeu',
  '1pl_past': 'comemos', '2pl_past': 'comeram', '3pl_past': 'comeram',
  '1sg_future': 'comerei', '2sg_future': 'comerá', '3sg_future': 'comerá',
  '1pl_future': 'comeremos', '2pl_future': 'comerão', '3pl_future': 'comerão',
};
export const IR: Forms = {
  base: 'ir', gerund: 'indo', participle: 'ido',
  '1sg_present': 'vou', '2sg_present': 'vai', '3sg_present': 'vai',
  '1pl_present': 'vamos', '2pl_present': 'vão', '3pl_present': 'vão',
  '1sg_past': 'fui', '2sg_past': 'foi', '3sg_past': 'foi',
  '1pl_past': 'fomos', '2pl_past': 'foram', '3pl_past': 'foram',
  '1sg_future': 'irei', '2sg_future': 'irá', '3sg_future': 'irá',
  '1pl_future': 'iremos', '2pl_future': 'irão', '3pl_future': 'irão',
};
/** BE — the copula "ser" (the located / transient "estar" is `ESTAR_COPULA` in pt.consts). */
export const SER: Forms = {
  base: 'ser', copula: '1', gerund: 'sendo', participle: 'sido',
  '1sg_present': 'sou', '2sg_present': 'és', '3sg_present': 'é',
  '1pl_present': 'somos', '2pl_present': 'sois', '3pl_present': 'são',
  '1sg_past': 'fui', '2sg_past': 'foste', '3sg_past': 'foi',
  '1pl_past': 'fomos', '2pl_past': 'fostes', '3pl_past': 'foram',
  '1sg_future': 'serei', '2sg_future': 'serás', '3sg_future': 'será',
  '1pl_future': 'seremos', '2pl_future': 'sereis', '3pl_future': 'serão',
};
/** BECOME — a pronominal verb whose finite forms carry their clitic ("se torna"). */
export const TORNAR_SE: Forms = {
  base: 'tornar-se', gerund: 'tornando-se', participle: 'tornado',
  '1sg_present': 'me torno', '2sg_present': 'te tornas', '3sg_present': 'se torna',
  '1pl_present': 'nos tornamos', '2pl_present': 'se tornam', '3pl_present': 'se tornam',
  '1sg_past': 'me tornei', '2sg_past': 'te tornaste', '3sg_past': 'se tornou',
  '1pl_past': 'nos tornamos', '2pl_past': 'se tornaram', '3pl_past': 'se tornaram',
  '1sg_future': 'me tornarei', '2sg_future': 'te tornarás', '3sg_future': 'se tornará',
  '1pl_future': 'nos tornaremos', '2pl_future': 'se tornarão', '3pl_future': 'se tornarão',
};
export const DAR: Forms = {
  base: 'dar', gerund: 'dando', participle: 'dado',
  '1sg_present': 'dou', '2sg_present': 'dás', '3sg_present': 'dá',
  '1pl_present': 'damos', '2pl_present': 'dais', '3pl_present': 'dão',
  '1sg_past': 'dei', '2sg_past': 'deu', '3sg_past': 'deu',
  '1pl_past': 'demos', '2pl_past': 'deram', '3pl_past': 'deram',
  '1sg_future': 'darei', '2sg_future': 'dará', '3sg_future': 'dará',
  '1pl_future': 'daremos', '2pl_future': 'darão', '3pl_future': 'darão',
};
export const VER: Forms = {
  base: 'ver', gerund: 'vendo', participle: 'visto',
  '1sg_present': 'vejo', '2sg_present': 'vê', '3sg_present': 'vê',
  '1pl_present': 'vemos', '2pl_present': 'veem', '3pl_present': 'veem',
  '1sg_past': 'vi', '2sg_past': 'viu', '3sg_past': 'viu',
  '1pl_past': 'vimos', '2pl_past': 'viram', '3pl_past': 'viram',
  '1sg_future': 'verei', '2sg_future': 'verá', '3sg_future': 'verá',
  '1pl_future': 'veremos', '2pl_future': 'verão', '3pl_future': 'verão',
};
export const ESCOLHER: Forms = {
  base: 'escolher', gerund: 'escolhendo', participle: 'escolhido',
  '1sg_present': 'escolho', '2sg_present': 'escolhe', '3sg_present': 'escolhe',
  '1pl_present': 'escolhemos', '2pl_present': 'escolhem', '3pl_present': 'escolhem',
  '1sg_past': 'escolhi', '2sg_past': 'escolheu', '3sg_past': 'escolheu',
  '1pl_past': 'escolhemos', '2pl_past': 'escolheram', '3pl_past': 'escolheram',
  '1sg_future': 'escolherei', '2sg_future': 'escolherá', '3sg_future': 'escolherá',
  '1pl_future': 'escolheremos', '2pl_future': 'escolherão', '3pl_future': 'escolherão',
};

// Modals: conjugated like ordinary verbs, governing a bare infinitive.
export const DEVER: Forms = {
  base: 'dever',
  '1sg_present': 'devo', '2sg_present': 'deves', '3sg_present': 'deve',
  '1pl_present': 'devemos', '2pl_present': 'deveis', '3pl_present': 'devem',
  '1sg_past': 'devi', '2sg_past': 'deveste', '3sg_past': 'deveu',
  '1pl_past': 'devemos', '2pl_past': 'devestes', '3pl_past': 'deveram',
  '1sg_future': 'deverei', '2sg_future': 'deverás', '3sg_future': 'deverá',
  '1pl_future': 'deveremos', '2pl_future': 'devereis', '3pl_future': 'deverão',
};
export const PODER: Forms = {
  base: 'poder',
  '1sg_present': 'posso', '2sg_present': 'podes', '3sg_present': 'pode',
  '1pl_present': 'podemos', '2pl_present': 'podeis', '3pl_present': 'podem',
  '1sg_past': 'pude', '2sg_past': 'pudeste', '3sg_past': 'pôde',
  '1pl_past': 'pudemos', '2pl_past': 'pudestes', '3pl_past': 'puderam',
  '1sg_future': 'poderei', '2sg_future': 'poderás', '3sg_future': 'poderá',
  '1pl_future': 'poderemos', '2pl_future': 'podereis', '3pl_future': 'poderão',
};
/** WILL — "querer" (want). */
export const QUERER: Forms = {
  base: 'querer',
  '1sg_present': 'quero', '2sg_present': 'queres', '3sg_present': 'quer',
  '1pl_present': 'queremos', '2pl_present': 'quereis', '3pl_present': 'querem',
  '1sg_past': 'quis', '2sg_past': 'quiseste', '3sg_past': 'quis',
  '1pl_past': 'quisemos', '2pl_past': 'quisestes', '3pl_past': 'quiseram',
  '1sg_future': 'quererei', '2sg_future': 'quererás', '3sg_future': 'quererá',
  '1pl_future': 'quereremos', '2pl_future': 'querereis', '3pl_future': 'quererão',
};
export const LENDA: Forms = { base: 'lenda', plural: 'lendas', gender: 'fem', count: 'singular' };
