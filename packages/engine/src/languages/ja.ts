import { COMPLEMENT_RENDER_ORDER, type ComplementType, type PathSpecifier, type Tense } from '@signi/shared';
import { pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type RubySegment, type LanguageEngine, type ResolvedPhrase } from '../types.js';

/** A segment for one word: attach the furigana reading only when it differs from the surface. */
function wordSeg(surface: string, reading?: string): RubySegment {
  return reading && reading !== surface ? { t: surface, r: reading } : { t: surface };
}

/** Postposition particle per complement type. (Route を is safe: motion verbs are intransitive.) */
const PARTICLE: Record<ComplementType, string> = {
  locative: 'で',
  direction: 'へ',
  source: 'から',
  route: 'を',
};

/** Path relations expressed via a relational noun before を ("橋の下を" = under the bridge). */
const REL_NOUN: Record<PathSpecifier, string> = {
  through: '',
  under: 'の下',
  over: 'の上',
  around: 'の周り',
  behind: 'の後ろ',
  in_front_of: 'の前',
};

/** Readings for the relational nouns above (word-level furigana over the の+kanji run). */
const REL_NOUN_READING: Record<PathSpecifier, string> = {
  through: '',
  under: 'のした',
  over: 'のうえ',
  around: 'のまわり',
  behind: 'のうしろ',
  in_front_of: 'のまえ',
};

/**
 * Segments for a noun phrase: [relative clause] [adjectives] noun. Adjectives are
 * separated by a space and the noun appended directly (matching the string form
 * "大きい 小さい猫"); any relative clause is prepended (see below).
 */
function npSegs(np: ResolvedNounPhrase): RubySegment[] {
  const core: RubySegment[] = [];
  for (const a of np.adjectives) {
    const base = a.forms['base'] ?? '';
    if (!base) continue;
    if (core.length) core.push({ t: ' ' });
    core.push(wordSeg(base, a.forms['reading']));
  }
  const head = np.head.forms;
  core.push(wordSeg(head['base'] ?? '', head['reading']));
  // A relative clause is prenominal in Japanese: the whole predicate precedes the head
  // noun with no relative pronoun (泣いた少年 = "the boy who cried"). The clause verb uses
  // the polite (masu / ました) form — plain-form derivation isn't seeded yet, so this is a
  // known first-cut simplification, consistent with ja treating future as present.
  const rel = np.relative;
  if (!rel) return core;
  return [...predicateSegs(rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements), ...core];
}

/**
 * The verb segment. Japanese has no dedicated future, so future reuses the present (masu)
 * form; the polite past is the masu-stem + ました (negative ませんでした). The reading is
 * derived the same way from the masu-stem's reading so the furigana tracks the surface.
 */
function verbSeg(verb: ResolvedVerbPhrase['verb'], negative: boolean | undefined, tense: Tense): RubySegment {
  const masuPresent = verb.forms['masu_present'] ?? verb.forms['base'] ?? '';
  const masuReading = verb.forms['masu_present_reading'];
  const stem = masuPresent.endsWith('ます') ? masuPresent.slice(0, -2) : null;
  const readingStem = masuReading?.endsWith('ます') ? masuReading.slice(0, -2) : undefined;

  let surface: string;
  let suffix: string | null = null;
  if (tense === 'past' && stem !== null) {
    suffix = negative ? 'ませんでした' : 'ました';
    surface = stem + suffix;
  } else if (negative && stem !== null) {
    suffix = 'ません';
    surface = stem + suffix;
  } else {
    surface = masuPresent; // present / future — plain masu form
  }
  const reading = suffix === null
    ? masuReading
    : readingStem !== undefined ? readingStem + suffix : undefined;
  return wordSeg(surface, reading);
}

function complementSegs(complements?: Partial<Record<ComplementType, ResolvedComplement>>): RubySegment[] {
  if (!complements) return [];
  const segs: RubySegment[] = [];
  for (const type of COMPLEMENT_RENDER_ORDER) {
    const c = complements[type];
    if (!c) continue;
    segs.push(...npSegs(c.phrase));
    if (type === 'route') {
      const spec = pathSpecifier(c);
      if (REL_NOUN[spec]) segs.push(wordSeg(REL_NOUN[spec], REL_NOUN_READING[spec]));
    }
    segs.push({ t: PARTICLE[type] });
  }
  return segs;
}

/**
 * The predicate half of a phrase, in Japanese order: complements IndObj+に DirectObj+を
 * Adv V. Shared by the main sentence (after 〜は) and by prenominal relative clauses.
 */
function predicateSegs(
  verbPhrase: ResolvedVerbPhrase,
  directObject: ResolvedNounPhrase | undefined,
  indirectObject: ResolvedNounPhrase | undefined,
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
): RubySegment[] {
  const { verb, negative, modifier, tense = 'present' } = verbPhrase;
  const segs: RubySegment[] = [];
  segs.push(...complementSegs(complements));
  if (indirectObject) segs.push(...npSegs(indirectObject), { t: 'に' });
  if (directObject) segs.push(...npSegs(directObject), { t: 'を' });
  if (modifier) {
    const base = modifier.forms['base'] ?? '';
    if (base) segs.push(wordSeg(base, modifier.forms['reading']));
  }
  segs.push(verbSeg(verb, negative, tense));
  return segs;
}

/**
 * Japanese word order: S IndObj+に DirectObj+を Adv V
 * Particles: は (topic/subject), を (direct object), に (indirect object/dative)
 */
function buildSegments(phrase: ResolvedPhrase): RubySegment[] {
  const segs: RubySegment[] = [];
  segs.push(...npSegs(phrase.subject), { t: 'は' });
  segs.push(...predicateSegs(phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements));
  return segs;
}

export const japaneseEngine: LanguageEngine = {
  language: 'ja',
  render(phrase: ResolvedPhrase): string {
    return buildSegments(phrase)
      .map((s) => s.t)
      .join('')
      .trim();
  },
  renderRuby(phrase: ResolvedPhrase): RubySegment[] {
    return buildSegments(phrase);
  },
};
