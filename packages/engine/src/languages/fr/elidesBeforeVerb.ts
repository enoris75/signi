import { VOWEL_START } from './fr.consts.js';

/**
 * Whether a clitic ("je", "ne", the periphrasis's "de") elides before `text`, a verb group that
 * opens on the verb whose lexeme is `verbForms` (A227). French elides before a vowel SOUND, and an h
 * muet is one: "j'habite", "n'habite pas", "sur le point d'habiter". Whether a verb's h is muet or
 * aspiré ("je hurle") is lexical, so the verb says so the way a noun does (`elides`, see
 * `elidesBefore`).
 *
 * The `/^h/` stands in for "the text opens on this verb's own form", which cannot be read off the
 * forms: the imperfect and the conditional ("habitais", "habiterait") are derived, not stored. Every
 * caller hands a text that opens on the verb's own form, or on an auxiliary, a modal or a clitic —
 * none of which opens on an h.
 */
export function elidesBeforeVerb(verbForms: Record<string, string>, text: string): boolean {
  return VOWEL_START.test(text) || (verbForms['elides'] === '1' && /^h/i.test(text));
}
