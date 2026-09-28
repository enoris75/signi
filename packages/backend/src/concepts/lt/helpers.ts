/**
 * The Lithuanian column's entry builders (P18, style-lt.md). Every cell the engine reads is stored
 * (P18 D3, D4), but authored from what a dictionary gives: a noun's stem and declension class, a verb's
 * three principal parts, an adjective's masculine nominative. The keys are Polish's (style-pl.md)
 * wherever the two languages agree, so a borrowed Polish noun still declines (P18 D10).
 *
 * A helper is wrong for every word of its class at once, so each is pinned by a worked paradigm in
 * `helpers.test.ts`, and an irregular word is written out in full with `paradigm` or `over`.
 */

type Forms = Record<string, string>;

/** Splits a comma-separated paradigm, checking it has exactly `n` cells. */
function cells(list: string, n: number, what: string): string[] {
  const parts = list.split(',').map((s) => s.trim());
  if (parts.length !== n || parts.some((p) => p === '')) {
    throw new Error(`lt ${what}: expected ${n} forms, got ${parts.length} in "${list}"`);
  }
  return parts;
}

/**
 * The palatalised stem before *i* + a back vowel: *t → č*, *d → dž* (*medis → medžio*, *katė → kačių*,
 * *matė → mačiau*, *girdi → girdžiu*). Any other stem is unchanged.
 */
export function soften(stem: string): string {
  if (stem.endsWith('t')) return `${stem.slice(0, -1)}č`;
  if (stem.endsWith('d')) return `${stem.slice(0, -1)}dž`;
  return stem;
}

/** The reverse, before *y*: *sveči- → svet-* (*svečias → svetyje*). */
function harden(stem: string): string {
  if (stem.endsWith('dž')) return `${stem.slice(0, -2)}d`;
  if (stem.endsWith('č')) return `${stem.slice(0, -1)}t`;
  return stem;
}

// ── Nouns ───────────────────────────────────────────────────────────────────────────────────────

const SG_CASES = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'] as const;
const PL_CASES = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'] as const;

/**
 * A paradigm written out: `sg` in the order nom, gen, dat, acc, ins, loc, voc; `pl` in the order nom,
 * gen, dat, acc, ins, loc, or `undefined` for a noun with no plural. `prefix` writes it under other
 * keys — `fem_` for a person or animal noun's feminine, so `fem`, `fem_gen_sg`, …, `fem_plural`, ….
 * For the irregular nouns (*šuo, akmuo, sesuo, duktė, mėnuo, žmogus*) and multiword ones.
 */
export function paradigm(sg: string, pl?: string, prefix = ''): Forms {
  const out: Forms = {};
  const key = (k: string) => (prefix === '' ? k : k === 'base' ? prefix.slice(0, -1) : `${prefix}${k}`);
  cells(sg, 7, 'singular').forEach((form, i) => { out[key(SG_CASES[i]!)] = form; });
  if (pl !== undefined) cells(pl, 6, 'plural').forEach((form, i) => { out[key(PL_CASES[i]!)] = form; });
  return out;
}

export type Gender = 'masc' | 'fem';

/** A noun entry: the paradigm, `gender`, `count: 'singular'` (as every column), and `extra`. */
export function noun(gender: Gender, sg: string, pl?: string, extra: Forms = {}): Forms {
  return { ...paradigm(sg, pl), gender, count: 'singular', ...extra };
}

/** A class helper's two lists, before they become an entry. */
interface Decl { sg: string; pl: string }

/**
 * Masculine *-as* (*namas*), with its soft variants: *-ias* (*kelias, svečias*: pass the stem with its
 * *i*, `keli`, `sveči`) and *-jas* (*vėjas*: `vėj`). The agent nouns in *-ojas / -ėjas* take the
 * locative *-juje* (*mokytojuje, kūrėjuje*); the one-syllable *vėjas* keeps *vėjyje*.
 */
function asDecl(s: string): Decl {
  if (s.endsWith('i')) {
    const y = harden(s.slice(0, -1));
    return { sg: `${s}as, ${s}o, ${s}ui, ${s}ą, ${s}u, ${y}yje, ${y}y`, pl: `${s}ai, ${s}ų, ${s}ams, ${s}us, ${s}ais, ${s}uose` };
  }
  const agent = /[oė]j$/.test(s) && (s.match(/[aeiouyąęėįųū]+/g) ?? []).length >= 2;
  const [loc, voc] = agent ? [`${s}uje`, `${s}au`] : s.endsWith('j') ? [`${s}yje`, `${s}au`] : [`${s}e`, `${s}e`];
  return { sg: `${s}as, ${s}o, ${s}ui, ${s}ą, ${s}u, ${loc}, ${voc}`, pl: `${s}ai, ${s}ų, ${s}ams, ${s}us, ${s}ais, ${s}uose` };
}

/**
 * Masculine *-is* (*brolis, medis → medžio*) and *-ys* (*arklys*): the *io*-stems. A stem in *j* takes
 * no *i* before the back vowel (*atvejis → atvejo, atvejai*).
 */
function ioDecl(s: string, nom: 'is' | 'ys'): Decl {
  const g = s.endsWith('j') ? s : `${soften(s)}i`;
  return {
    sg: `${s}${nom}, ${g}o, ${g}ui, ${s}į, ${g}u, ${s}yje, ${s}${nom === 'is' ? 'i' : 'y'}`,
    pl: `${g}ai, ${g}ų, ${g}ams, ${g}us, ${g}ais, ${g}uose`,
  };
}

/** Masculine *-us* (*sūnus, turgus*); *-ius* (*skaičius*: pass `skaiči`) takes the *io* plural. */
function usDecl(s: string): Decl {
  const sg = `${s}us, ${s}aus, ${s}ui, ${s}ų, ${s}umi, ${s}uje, ${s}au`;
  if (s.endsWith('i')) return { sg, pl: `${s}ai, ${s}ų, ${s}ams, ${s}us, ${s}ais, ${s}uose` };
  return { sg, pl: `${s}ūs, ${s}ų, ${s}ums, ${s}us, ${s}umis, ${s}uose` };
}

/** Feminine *-a* (*ranka*) and *-ia* (*žinia*: pass `žini`). */
function aDecl(s: string): Decl {
  return { sg: `${s}a, ${s}os, ${s}ai, ${s}ą, ${s}a, ${s}oje, ${s}a`, pl: `${s}os, ${s}ų, ${s}oms, ${s}as, ${s}omis, ${s}ose` };
}

/** Feminine *-ė* (*katė*, genitive plural *kačių*). */
function eDecl(s: string): Decl {
  return { sg: `${s}ė, ${s}ės, ${s}ei, ${s}ę, ${s}e, ${s}ėje, ${s}e`, pl: `${s}ės, ${soften(s)}ių, ${s}ėms, ${s}es, ${s}ėmis, ${s}ėse` };
}

/**
 * The *i*-stems, feminine by default (*pilis, širdis → širdžių*). `genPl` overrides the genitive
 * plural for the nouns that take *-ų* (*naktų, ausų, dantų*). A masculine one takes the dative *-iui*
 * (*dantis → dančiui*).
 */
function iDecl(s: string, genPl = `${soften(s)}ių`, gender: Gender = 'fem'): Decl {
  return { sg: `${s}is, ${s}ies, ${soften(s)}${gender === 'masc' ? 'iui' : 'iai'}, ${s}į, ${s}imi, ${s}yje, ${s}ie`, pl: `${s}ys, ${genPl}, ${s}ims, ${s}is, ${s}imis, ${s}yse` };
}

/** Options every class helper takes. */
export interface NounOptions {
  /** No plural: a mass noun, a proper noun (`countable: false` concepts). */
  sgOnly?: boolean;
  /** Flags and a feminine (`fem(…)`), merged last. */
  extra?: Forms;
}

function entry(gender: Gender, d: Decl, o: NounOptions = {}): Forms {
  return noun(gender, d.sg, o.sgOnly ? undefined : d.pl, o.extra);
}

/** Masculine *-as / -ias / -jas*: `as('nam')` → *namas, namo, …*. */
export const as = (stem: string, o?: NounOptions) => entry('masc', asDecl(stem), o);
/** Masculine *-is*: `is('brol')` → *brolis, brolio, …*. */
export const is = (stem: string, o?: NounOptions) => entry('masc', ioDecl(stem, 'is'), o);
/** Masculine *-ys*: `ys('arkl')` → *arklys, arklio, …*. */
export const ys = (stem: string, o?: NounOptions) => entry('masc', ioDecl(stem, 'ys'), o);
/** Masculine *-us*: `us('sūn')` → *sūnus, sūnaus, …*. */
export const us = (stem: string, o?: NounOptions) => entry('masc', usDecl(stem), o);
/** Feminine *-a / -ia*: `a('rank')` → *ranka, rankos, …*. Masculine *-a* nouns (*dėdė* is `e`) pass `gender`. */
export const a = (stem: string, o?: NounOptions, gender: Gender = 'fem') => entry(gender, aDecl(stem), o);
/** Feminine *-ė*: `e('kat')` → *katė, katės, …*. A masculine *-ė* (*dėdė*) passes `gender`. */
export const e = (stem: string, o?: NounOptions, gender: Gender = 'fem') => entry(gender, eDecl(stem), o);
/** Feminine *i*-stem: `i('pil')` → *pilis, pilies, …*; `genPl` for the *-ų* nouns. A masculine one (*dantis*) passes `gender`. */
export const i = (stem: string, o?: NounOptions & { genPl?: string }, gender: Gender = 'fem') => entry(gender, iDecl(stem, o?.genPl, gender), o);

/**
 * A person or animal noun's feminine, under `fem_` keys: `as('katin', { extra: fem(e('kat')) })` →
 * *katinas* with *katė* as `fem`, `fem_gen_sg`, …. Takes any helper's entry and keeps only its cases.
 */
export function fem(entry: Forms): Forms {
  const out: Forms = {};
  for (const k of [...SG_CASES, ...PL_CASES]) {
    if (entry[k] !== undefined) out[k === 'base' ? 'fem' : `fem_${k}`] = entry[k]!;
  }
  return out;
}

/**
 * A language name (P18 §3): the genitive plural of the people + *kalba*, which alone declines —
 * `language('lietuvių')` → *lietuvių kalba, lietuvių kalbos, …*, feminine, no plural.
 */
export function language(people: string): Forms {
  const k = aDecl('kalb').sg.split(', ').map((c) => `${people} ${c}`).join(', ');
  return noun('fem', k);
}

// ── Verbs ───────────────────────────────────────────────────────────────────────────────────────

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

/** Five endings (1sg, 2sg, 3, 1pl, 2pl) onto their stems, 3pl repeating 3sg. */
function six(forms: [string, string, string, string, string]): string[] {
  return [...forms, forms[2]];
}

/** A stem's vowel groups: *bū* has one, *valgy* two (the future's 3rd-person shortening, below). */
const syllables = (stem: string) => (stem.match(/[aeiouyąęėįųūo]+/g) ?? []).length;

/** The verbal prefixes, longest first, with the reflexive *-si-* a prefix carries (*nusi-*). */
const PREFIX = /^(?:ap|at|į|iš|nu|pa|par|per|pra|pri|su|už)(?:si)?/;

/** The root without its prefix: *įgy- → gy-*, *sugriū- → griū-*, *suvalgy- → valgy-*. */
const root = (stem: string) => {
  const bare = stem.replace(PREFIX, '');
  return bare === stem || syllables(bare) === 0 ? stem : bare;
};

/** The present from the 3rd person (*valgo, eina, šaukia → šauki, keičia → keiti, myli → girdžiu*). */
function present(p3: string): string[] {
  const s = p3.slice(0, -1);
  switch (p3.slice(-1)) {
    case 'o': return six([`${s}au`, `${s}ai`, p3, `${s}ome`, `${s}ote`]);
    case 'i': return six([`${soften(s)}iu`, `${s}i`, p3, `${s}ime`, `${s}ite`]);
    // A soft stem hardens again before the 2sg's *-i* (*keičia → keiti*, *leidžia → leidi*).
    case 'a': return six([`${s}u`, s.endsWith('i') ? `${harden(s.slice(0, -1))}i` : `${s}i`, p3, `${s}ame`, `${s}ate`]);
    default: throw new Error(`lt present: "${p3}" ends in none of -a, -i, -o`);
  }
}

/** The simple past from the 3rd person (*ėjo → ėjau*; *matė → mačiau, matei*). */
function past(p3: string): string[] {
  const s = p3.slice(0, -1);
  switch (p3.slice(-1)) {
    case 'o': return six([`${s}au`, `${s}ai`, p3, `${s}ome`, `${s}ote`]);
    case 'ė': return six([`${soften(s)}iau`, `${s}ei`, p3, `${s}ėme`, `${s}ėte`]);
    default: throw new Error(`lt past: "${p3}" ends in neither -o nor -ė`);
  }
}

/**
 * The future from the infinitive stem: *valgy- → valgysiu … valgys*. A sibilant stem takes no second
 * *s* (*neš- → nešiu, neš*; *vež- → vešiu, veš*), and a one-syllable root in *y / ū* shortens the 3rd
 * person, prefixed or not (*bū- → bus*, *įgy- → įgis*, *sugriū- → sugrius*).
 */
function future(stem: string): string[] {
  const fs = /[sš]$/.test(stem) ? stem : stem.endsWith('z') ? `${stem.slice(0, -1)}s` : stem.endsWith('ž') ? `${stem.slice(0, -1)}š` : `${stem}s`;
  const third = syllables(root(stem)) === 1 && /[yū]s$/.test(fs) ? fs.replace(/y(s)$/, 'i$1').replace(/ū(s)$/, 'u$1') : fs;
  return six([`${fs}iu`, `${fs}i`, third, `${fs}ime`, `${fs}ite`]);
}

/** The imperative stem: *bėg- → bė-k*, *tek- → te-k* (the *k* is not doubled). */
const imperativeStem = (stem: string) => (/[gk]$/.test(stem) ? stem.slice(0, -1) : stem);

/** What `verb` takes for one aspect. */
export interface Aspect {
  /**
   * The dictionary's three principal parts, comma-separated: infinitive, 3rd-person present,
   * 3rd-person past — *valgyti, valgo, valgė*. A reflexive verb writes them without *-si*
   * (*praustis, prausia, prausė*) and passes `reflexive` in `extra`; `base` keeps *-tis*.
   */
  parts: string;
  /** Cells that break the rules (*būti*: `{ '1sg_present': 'esu', … }`), merged last. Unprefixed keys. */
  over?: Forms;
}

function aspect(a: Aspect, prefix: '' | 'pf_'): Forms {
  const [inf, pres3, past3] = cells(a.parts, 3, 'principal parts');
  const stem = inf!.replace(/tis?$/, '');
  if (stem === inf) throw new Error(`lt verb: infinitive "${inf}" ends in neither -ti nor -tis`);
  const out: Forms = { base: inf! };
  const put = (tense: string, forms: string[]) => forms.forEach((f, n) => { out[`${PERSONS[n]}_${tense}`] = f; });
  put('present', present(pres3!));
  put('past', past(past3!));
  put('frequentative', six([`${stem}davau`, `${stem}davai`, `${stem}davo`, `${stem}davome`, `${stem}davote`]));
  put('future', future(stem));
  put('conditional', six([`${stem}čiau`, `${stem}tum`, `${stem}tų`, `${stem}tume`, `${stem}tumėte`]));
  const k = imperativeStem(stem);
  Object.assign(out, { '2sg_imperative': `${k}k`, '1pl_imperative': `${k}kime`, '2pl_imperative': `${k}kite` });
  Object.assign(out, {
    adverbial: `${stem}damas`, adverbial_fem: `${stem}dama`, adverbial_plural: `${stem}dami`, adverbial_fem_plural: `${stem}damos`,
  });
  // The feminine softens (*-iusi*) only in the *-yti* verbs' *ė*-past (*valgiusi, mačiusi*); a primary
  // verb's stays hard (*nešusi, ėmusi, davusi, metusi*).
  const ps = past3!.slice(0, -1);
  const pf = past3!.endsWith('ė') && stem.endsWith('y') ? `${soften(ps)}i` : ps;
  Object.assign(out, {
    past_active: `${ps}ęs`, past_active_fem: `${pf}usi`, past_active_plural: `${ps}ę`, past_active_fem_plural: `${pf}usios`,
    passive: `${stem}tas`, passive_fem: `${stem}ta`, passive_plural: `${stem}ti`, passive_fem_plural: `${stem}tos`, passive_neut: `${stem}ta`,
  });
  Object.assign(out, a.over ?? {});
  if (prefix === '') return out;
  return Object.fromEntries(Object.entries(out).map(([key, v]) => [`${prefix}${key}`, v]));
}

/**
 * A verb (P18 D4, D5): its imperfective under the plain keys and, where Lithuanian pairs it with a
 * common perfective (*valgyti / suvalgyti*), the perfective under `pf_` keys — P05's scheme. An unpaired
 * verb (*mylėti, žinoti, būti*) passes no `pf`, and the engine uses its one set everywhere.
 */
export function verb(ipf: Aspect | string, pf?: Aspect | string, extra: Forms = {}): Forms {
  const asAspect = (x: Aspect | string): Aspect => (typeof x === 'string' ? { parts: x } : x);
  return { ...aspect(asAspect(ipf), ''), ...(pf ? aspect(asAspect(pf), 'pf_') : {}), ...extra };
}

// ── Adjectives ──────────────────────────────────────────────────────────────────────────────────

/**
 * An adjective from its masculine nominative (P18 §2.1): the feminine, the neuter (*gera, gražu*) and
 * the synthetic degrees (*geresnis, geriausias*), by class — *-as* (*geras*), *-ias* (*žalias*), *-us*
 * (*gražus*), *-is* (*didelis*); a soft stem hardens before *-esnis* (*tuščias → tuštesnis*). The engine declines every case from `base`, `fem` and the class.
 * `extra` overrides a derived form (*didelis → didesnis*).
 */
export function adj(base: string, extra: Forms = {}): Forms {
  const m = /^(.*?)(ias|as|us|is)$/.exec(base);
  if (!m) throw new Error(`lt adjective: "${base}" ends in none of -as, -ias, -us, -is`);
  const [, s, end] = m as unknown as [string, string, 'ias' | 'as' | 'us' | 'is'];
  const [femForm, neuter] = { ias: [`${s}ia`, `${s}ia`], as: [`${s}a`, `${s}a`], us: [`${s}i`, `${s}u`], is: [`${s}ė`, `${s}i`] }[end];
  return {
    base, fem: femForm, neuter, comparative: `${harden(s)}esnis`, superlative: `${soften(harden(s))}iausias`, ...extra,
  };
}
