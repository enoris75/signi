import type {
  CoordConjunction,
  Definiteness,
  Degree,
  LanguageCode,
  NounElement,
  NounPhrase,
  PhrasePlan,
  PronominalPossessor,
  Specifier,
  Translation,
  VerbPhrase, ReadyLanguageCode } from '@signi/shared';
import { isPreviewLanguage } from '@signi/shared';
import {
  translate,
  translateConjunction,
  translateDegree,
  translateDeterminer,
  translatePossessive,
  translateSpecifier,
  translateWord,
} from '../src/index.js';

// The engine is a pure function of (plan, lexicon), so these tests give it the *real* lexicon:
// an in-memory SQLite seeded from the same corpus the app ships, read through the same
// `lookupLexicalEntry` the backend uses in production. A hand-written fixture lexicon would be
// faster to write and would quietly drift from the words the app actually has — a green suite
// over a wrong app is the failure mode worth spending a few hundred milliseconds to avoid.
//
// SIGNI_DB_PATH is set before the backend's db module is imported, so `getDb()` opens a
// throwaway database rather than the developer's signi.db. The seed module does its work on
// import; the lexicon module then shares that same connection through the db singleton.
process.env['SIGNI_DB_PATH'] = ':memory:';

const { lookupLexicalEntry } = await import('../../backend/src/lexicon.js');
await import('../../backend/src/seed.js');

/** Translate a plan into every seeded language. */
export function translateAll(plan: PhrasePlan): Translation[] {
  return translate(plan, lookupLexicalEntry);
}

/** The rendered sentence in one language. */
export function say(plan: PhrasePlan, language: LanguageCode): string {
  const translation = translateAll(plan).find((t) => t.language === language);
  if (!translation) throw new Error(`no ${language} translation was produced`);
  return translation.text;
}

/**
 * Keyed by language, the **ready** languages only (P10-E1): a preview language (Swiss German) is
 * covered by its own suite until it is promoted, so the exhaustive tables below neither pin its
 * unreviewed text nor break when it changes. Promotion adds its line to every table they assert.
 */
function keyed(translations: Translation[]): Record<ReadyLanguageCode, string> {
  return Object.fromEntries(
    translations.filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

/** Every ready language at once, keyed — the shape the table-driven specs assert against. */
export function sayAll(plan: PhrasePlan): Record<ReadyLanguageCode, string> {
  return keyed(translateAll(plan));
}

/**
 * Render a UI-label word (or several words naming one thing) into every language, keyed — the
 * `translateWord` path the sentence helpers never touch. `agreesWith` fixes the gender/number of an
 * adjective label against a (nowhere-rendered) noun, so "first" agreeing with PERSON_GRAMMAR reads
 * "prima" in Italian.
 */
export function wordAll(
  conceptIds: string | string[],
  agreesWith?: string,
): Record<ReadyLanguageCode, string> {
  return keyed(translateWord(conceptIds, lookupLexicalEntry, agreesWith));
}

/** Render one determiner value (agreeing with `agreesWith`, default NOUN) into every language. */
export function determinerAll(
  value: Definiteness,
  agreesWith?: string,
): Record<ReadyLanguageCode, string> {
  return keyed(translateDeterminer(value, lookupLexicalEntry, agreesWith));
}

/**
 * Render one pronominal possessor's possessive (agreeing with `agreesWith`, default NOUN) into
 * every language — the `translatePossessive` path behind the coreference link's chip.
 */
export function possessiveAll(
  possessor: PronominalPossessor,
  agreesWith?: string,
): Record<ReadyLanguageCode, string> {
  return keyed(translatePossessive(possessor, lookupLexicalEntry, agreesWith));
}

/**
 * Render one coordinating conjunction into every language — the `translateConjunction` path behind
 * the conjunction menu. It is cited between two clauses and agrees with nothing, so unlike the
 * three above it takes no noun. `correlative` cites the pair an "and" group may take instead (P09-E46).
 */
export function conjunctionAll(conjunction: CoordConjunction, correlative?: boolean): Record<ReadyLanguageCode, string> {
  return keyed(translateConjunction(conjunction, correlative));
}

/**
 * Render one complement specifier into every language — the `translateSpecifier` path behind the
 * spatial-relation and cause-sentiment toolbars. The noun it is cited on (default NOUN) is held
 * bare, so what comes back is the adposition alone.
 */
export function specifierAll(specifier: Specifier, agreesWith?: string): Record<ReadyLanguageCode, string> {
  return keyed(translateSpecifier(specifier, lookupLexicalEntry, agreesWith));
}

/**
 * Render one comparative degree into every language — the `translateDegree` path behind the degree
 * chip. Cited on an adjective (default BIG), because whether a degree is a word of its own or a
 * remaking of the adjective depends on which adjective it is.
 */
export function degreeAll(degree: Degree, agreesWith?: string): Record<ReadyLanguageCode, string> {
  return keyed(translateDegree(degree, lookupLexicalEntry, agreesWith));
}

/** The furigana readings Japanese renders over its kanji, in order. */
export function furigana(plan: PhrasePlan): string[] {
  const ja = translateAll(plan).find((t) => t.language === 'ja');
  return (ja?.ruby ?? []).filter((s) => s.r).map((s) => s.r as string);
}

// ── Plan builders ───────────────────────────────────────────────────────────
// Plans are deep and mostly optional, so the specs read as "this clause, with this one thing
// changed" rather than as a wall of object literals.

export const np = (concept: string, extra: Partial<NounPhrase> = {}): NounPhrase => ({
  concept,
  ...extra,
});

export function clause(
  subject: NounElement,
  verb: string,
  extra: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> & {
    verbPhrase?: Partial<VerbPhrase>;
  } = {},
): PhrasePlan {
  const { verbPhrase, ...rest } = extra;
  return {
    subject,
    verbPhrase: { verb, ...verbPhrase },
    ...rest,
  };
}
