/**
 * The space the noun phrase writes between *la* and a noun whose lexeme says `no_elision` (*la
 * universitat, la història*): `caSurface` never elides across it, and turns it back into a space.
 */
export const NO_ELISION = ' ';

const VOWEL = 'aeiouàèéíïòóúü';
const ACCENTED = /[àèéíòóú]/;

/** A word's syllable nuclei, as their start offsets: a run of vowels, split at a strong-strong hiatus. */
function nuclei(word: string): number[] {
  const starts: number[] = [];
  const w = word.toLowerCase();
  for (let i = 0; i < w.length; i++) {
    if (!VOWEL.includes(w[i]!)) continue;
    const prev = i > 0 ? w[i - 1]! : '';
    // "ia, ie, io, ua …" after a consonant are two syllables in Catalan (i-de-a, his-tò-ri-a); a
    // falling diphthong "ai, ei, au, eu, ou, iu, uu" is one.
    const falling = prev !== '' && VOWEL.includes(prev) && /[iu]/.test(w[i]!) && !/[iu]/.test(prev);
    if (falling) continue;
    starts.push(i);
  }
  return starts;
}

/**
 * Whether a word's **first** syllable carries the stress: the accented syllable if one is written,
 * else the penultimate for a word ending in a vowel, a vowel + s, -en or -in, else the last — the
 * Catalan written-accent rules read backwards.
 */
function firstStressed(word: string): boolean {
  const w = word.toLowerCase();
  const n = nuclei(w);
  if (n.length <= 1) return true;
  const accented = [...w].findIndex((c) => ACCENTED.test(c));
  if (accented >= 0) return accented === n[0];
  const penult = /([aeiou]s?|en|in)$/.test(w);
  return (penult ? n.length - 2 : n.length - 1) === 0;
}

/** Whether a word opens on a semivowel — *i-, u-, hi-, hu-* before another vowel ("iogurt", "hiena", "huit"). */
function semivowel(word: string): boolean {
  return /^h?[iu][aeiouàèéíòóú]/i.test(word);
}

/** Whether *el* / *de* / a weak pronoun elides before `word`: a vowel or h + vowel, not a semivowel. */
function elidesBefore(word: string): boolean {
  return /^h?[aeiouàèéíïòóúü]/i.test(word) && !semivowel(word);
}

/**
 * Whether feminine *la* elides before `word`: as *el* does, except before an unstressed *i-, u-, hi-,
 * hu-* (*la universitat, la història, la idea*, but *l'illa, l'hora, l'única*).
 */
function laElidesBefore(word: string): boolean {
  if (!elidesBefore(word)) return false;
  return !/^h?[iuíú]/i.test(word) || firstStressed(word);
}

/** A token's word, without the punctuation around it. */
function bare(token: string): string {
  return token.replace(/^[«"(]+/, '').replace(/[.,;:!?»")]+$/, '').toLowerCase();
}

/** `word` with the case of the token it replaces kept on its first letter. */
function cased(token: string, word: string): string {
  const at = token.search(/[A-Za-zÀ-ÿ]/);
  const lead = token.slice(0, Math.max(at, 0));
  const upper = at >= 0 && token[at] !== token[at]!.toLowerCase();
  return lead + (upper ? word[0]!.toUpperCase() + word.slice(1) : word);
}

const CONTRACTING = new Set(['a', 'de', 'per']);
const ELIDING_CLITIC: Record<string, string> = { em: "m'", et: "t'", es: "s'" };

/**
 * The orthography Catalan writes between words (P03 §2.1, style-ca.md § The article), applied to a
 * rendered text:
 *
 * - **Elision**: *el, la* → *l'* before a vowel or h + vowel ("l'home", "l'aigua"), *la* not before an
 *   unstressed *i-, u-* (`laElidesBefore`) nor a `no_elision` noun (`NO_ELISION`); *de* → *d'* ("un got
 *   d'aigua", "ha d'anar"); the weak pronouns *em, et, es* → *m', t', s'* ("m'estimo", "s'atura") and the
 *   object *el, la* → *l'* ("l'estima"). Never before a semivowel ("el iogurt").
 * - **Contraction**, where the article does not elide: *a / de / per* + *el / els* → *al, als, del,
 *   dels, pel, pels*; never before *l'*, *la* or *les* ("a l'home", "de la casa"). *per a el* is *per al*.
 * - A cluster's reduced *'l, 'm, 't* is *l', m', t'* before a vowel: "se l'estima" (not "*se'l estima").
 * - The reflexive *es* before a word in *s-* is *se* ("se sent", verify).
 *
 * Idempotent, so every layer that returns finished text may run it: `withRelative`, `predicateText`
 * and `renderClause` all do.
 */
export function caSurface(text: string): string {
  if (!text) return text;
  // Split on plain spaces only: the NO_ELISION space is part of its token.
  const tokens = text.split(' ');
  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    const w = bare(token);
    const next = tokens[i + 1];
    const n = next === undefined ? '' : bare(next);
    const after = tokens[i + 2] === undefined ? '' : bare(tokens[i + 2]!);
    const plainToken = token === w;
    // a / de / per + el / els, unless the article elides before what follows it.
    if (plainToken && CONTRACTING.has(w) && next === n && (n === 'els' || (n === 'el' && !elidesBefore(after)))) {
      out.push(cased(token, `${w === 'per' ? 'pe' : w}${n === 'el' ? 'l' : 'ls'}`));
      i++;
      continue;
    }
    if (next !== undefined && token.toLowerCase().endsWith(w) && !token.includes(NO_ELISION)) {
      const elides =
        w === 'de' ? n !== 'el' && n !== 'els' && elidesBefore(n)
        : w === 'el' ? elidesBefore(n)
        : w === 'la' ? laElidesBefore(n)
        : w in ELIDING_CLITIC ? elidesBefore(n)
        : false;
      if (elides) {
        const short = w === 'de' ? "d'" : w === 'el' || w === 'la' ? "l'" : ELIDING_CLITIC[w]!;
        out.push(`${cased(token, short)}${next}`);
        i++;
        continue;
      }
      // A cluster's reduced second pronoun takes the elided form before a vowel instead: "se'l" + "estima"
      // is "se l'estima", "me'l" + "ha donat" "me l'ha donat".
      const cluster = /^([mts]e)'([lmt])$/.exec(w);
      if (cluster && elidesBefore(n)) {
        out.push(`${cased(token, cluster[1]!)} ${cluster[2]}'${next}`);
        i++;
        continue;
      }
      if (w === 'es' && /^s/.test(n)) {
        out.push(cased(token, 'se'));
        continue;
      }
    }
    out.push(token);
  }
  return out.join(' ').replace(new RegExp(NO_ELISION, 'g'), ' ');
}
