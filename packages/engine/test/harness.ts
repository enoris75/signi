import type {
  Definiteness,
  LanguageCode,
  NounElement,
  NounPhrase,
  PhrasePlan,
  Translation,
  VerbPhrase,
} from '@signi/shared';
import { translate, translateWord, translateDeterminer } from '../src/index.js';

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

/** Every language at once, keyed — the shape the table-driven specs assert against. */
export function sayAll(plan: PhrasePlan): Record<LanguageCode, string> {
  return Object.fromEntries(
    translateAll(plan).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
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
): Record<LanguageCode, string> {
  return Object.fromEntries(
    translateWord(conceptIds, lookupLexicalEntry, agreesWith).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

/** Render one determiner value (agreeing with `agreesWith`, default NOUN) into every language. */
export function determinerAll(
  value: Definiteness,
  agreesWith?: string,
): Record<LanguageCode, string> {
  return Object.fromEntries(
    translateDeterminer(value, lookupLexicalEntry, agreesWith).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
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
