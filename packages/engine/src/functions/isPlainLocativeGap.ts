import { DEFAULT_LOCATIVE_SPECIFIER } from '@signi/shared';
import type { ResolvedRelativeClause } from '../types.js';
import { pathSpecifier } from './pathSpecifier.js';

/**
 * Whether a relative clause's head fills a **plain locative** gap: the place the clause happens, in the
 * default relation (`in`, chosen or not) — "a place where one lives", "the house where the cat eats"
 * (C07). Such a gap names no spatial relation beyond "there", so the languages that have a locative
 * relative adverb use it in place of the preposition and relative pronoun: en *where*, it *dove*, fr
 * *où*, es *donde*, pt *onde*. A marked relation still needs its preposition ("the house under which
 * the cat eats"), and so does every other complement gap, so those keep `relativeGapComplement`.
 *
 * German and Japanese do not read this. German keeps the prepositional relative pronoun ("ein Ort, in
 * dem man lebt"), the form its dictionaries define with; *wo* after a noun is the looser register.
 * Japanese needs no relativizer at all, since its gapped clause simply precedes the head (住む場所).
 */
export function isPlainLocativeGap(rel: ResolvedRelativeClause | undefined): boolean {
  return rel?.headRole === 'locative' && pathSpecifier({ specifiers: rel.headSpecifiers }, DEFAULT_LOCATIVE_SPECIFIER) === 'in';
}
