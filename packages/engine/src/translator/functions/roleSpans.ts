import type { NounElement, PhrasePlan, RoleSpan } from '@signi/shared';
import type { LexiconLookup } from '../translator.types.js';

// Where each role of a plan stands in its rendered sentence (P17-E2). The engines build a sentence
// from the words the lexicon hands them, through a great many functions per language, and none of
// them returns more than a string. So rather than thread offsets through all of them, the role's
// own words are **marked** as they leave the lexicon — a private-use character before and after each
// surface form of the role's concept — the sentence is said again, and the marks come out of the
// finished text wherever the word went: inflected, split ("fängt … an"), moved by a passive or a
// question. A word said twice is two different marks, never a search of the finished string.
//
// A mark can change what it rides on: a rule that reads the word's first letter (en "a"/"an", fr
// "le"/"l'") or cuts its ending off to inflect it sees the mark too. So the marked sentence is lined
// up against the real one (their longest common subsequence) and each mark placed by the characters
// around it; a mark the inflection cut away is recovered from the word's edge, where the language
// writes spaces between words.

/** A role of the plan the spans name, and the concept it says. */
interface PlanSlot {
  slot: string;
  concept: string;
}

/** The first conjunct's head concept: the word a group's row shows (see `NounGroup`). */
const headOf = (element: NounElement | undefined): string | undefined =>
  element ? ('conjuncts' in element ? element.conjuncts[0]?.concept : element.concept) : undefined;

/**
 * The top clause's roles, by their place in the plan (see `RoleSpan`). A role the sentence cannot
 * say is left out: a command's subject (dropped) and a subject question's throwaway subject. Only a
 * concept the plan names **once** is kept: the mark rides on the lexeme, so a word the plan names
 * twice ("the cat sees the cat") could not tell its two places apart.
 */
export function planSlots(plan: PhrasePlan): PlanSlot[] {
  const slots: PlanSlot[] = [];
  const add = (slot: string, concept: string | undefined) => {
    if (concept) slots.push({ slot, concept });
  };
  if (!plan.imperative && plan.questionRole !== 'subject') add('subject', headOf(plan.subject));
  const vp = plan.verbPhrase;
  if (vp) {
    add('verb', vp.verb);
    [vp.modifier, ...(vp.modifiers ?? [])].filter((id): id is string => !!id).forEach((id, i) => add(`modifier.${i}`, id));
    (vp.modals ?? []).forEach((m, i) => add(`modal.${i}`, typeof m === 'string' ? m : m.verb));
  }
  add('directObject', headOf(plan.directObject));
  for (const [type, complement] of Object.entries(plan.complements ?? {})) add(type, headOf(complement?.phrase));
  add('address', headOf(plan.address));
  add('interjection', plan.interjection);
  const uses = new Map<string, number>();
  const count = (value: unknown): void => {
    if (typeof value === 'string') uses.set(value, (uses.get(value) ?? 0) + 1);
    else if (Array.isArray(value)) value.forEach(count);
    else if (value && typeof value === 'object') Object.values(value).forEach(count);
  };
  count(plan);
  return slots.filter((s) => uses.get(s.concept) === 1);
}

/**
 * The form keys that hold a word the sentence may say, as the lexicon spells them — every other key
 * is a fact about the word (its gender, its auxiliary, the case its object takes) that a mark would
 * falsify. A reading (`*_reading`) is furigana, never in the text.
 */
const SURFACE_KEY = new RegExp(
  '^(?:base|plural|fem|fem_plural|masc_plural|genitive|possessed|possessed_plural|unit|unit_plural|citation|compound'
  + '|honorific\\w*|plural_honorific|with_(?:ELDER|YOUNGER)(?:_honorific)?'
  + '|singular_(?:fem|neut)|plural_(?:fem|neut)|(?:object|disjunctive)(?:_fem|_neut|_plural(?:_fem)?)?|dative(?:_fem|_neut|_plural)?'
  + '|negative(?:_subject|_object|_disjunctive|_with_other)?|with_other(?:_disjunctive)?|reflexive(?:_plural)?|generic_reflexive'
  + '|past|participle\\w*|gerund|masu_\\w+|nai|te|passive|humble\\w*|particle|subjunctive_stem|nonfinite\\w*|future'
  + '|[123](?:sg|pl)_\\w+'
  + '|attributive|comparative|superlative|predicative_masc_sg|interrogative|fused|locative_ni|distinct)$',
);

const START = 0xe000;
const END = 0xe100;

/** Mark every surface form in `forms` as slot `index`'s word. */
function marked(forms: Record<string, string>, index: number): Record<string, string> {
  const open = String.fromCharCode(START + index);
  const close = String.fromCharCode(END + index);
  return Object.fromEntries(Object.entries(forms).map(([key, value]) => [
    key,
    SURFACE_KEY.test(key) && !key.endsWith('_reading') && !/^[01]$/.test(value) && value ? open + value + close : value,
  ]));
}

/**
 * `lexicon`, with each of `slots`' concepts' forms marked as that slot's word (see `marked`). A verb
 * whose lexeme hands it on to another sense — German EAT is "fressen" under an animal (`subject_sense`),
 * KNOW "conoscere" with an object — is said by that sense's lexeme, so the sense is marked as the slot
 * too.
 */
function markingLookup(lexicon: LexiconLookup, slots: PlanSlot[]): LexiconLookup {
  const index = new Map(slots.map((s, i) => [s.concept, i]));
  return (conceptId, language) => {
    const entry = lexicon(conceptId, language);
    const i = index.get(conceptId);
    if (!entry || i === undefined) return entry;
    for (const [key, sense] of Object.entries(entry.forms)) {
      if (key.endsWith('_sense') && !index.has(sense)) index.set(sense, i);
    }
    return { ...entry, forms: marked(entry.forms, i) };
  };
}

/**
 * For each character of `a`, the index of the character of `b` it lines up with in their longest
 * common subsequence, or -1. Undefined for a sentence too long to line up cheaply.
 */
function alignment(a: string, b: string): Int32Array | undefined {
  const n = a.length;
  const m = b.length;
  if (n * m > 4_000_000) return undefined;
  // lcs[i * (m + 1) + j]: the longest common subsequence of a[i..] and b[j..].
  const lcs = new Int32Array((n + 1) * (m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * (m + 1) + j] = a[i] === b[j]
        ? lcs[(i + 1) * (m + 1) + j + 1]! + 1
        : Math.max(lcs[(i + 1) * (m + 1) + j]!, lcs[i * (m + 1) + j + 1]!);
    }
  }
  const to = new Int32Array(n).fill(-1);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) to[i++] = j++;
    else if (lcs[(i + 1) * (m + 1) + j]! >= lcs[i * (m + 1) + j + 1]!) i++;
    else j++;
  }
  return to;
}

const WORD_CHAR = /[\p{L}\p{M}\p{N}]/u;

/**
 * The spans the marks in `markedText` put on `text`, the same sentence said without them. `spaced`:
 * the language writes spaces between words, so a span may grow to the whole word it lies in — the
 * ending an inflection added after the mark, or a first letter a capital changed.
 */
export function spansOf(markedText: string, text: string, spaced: boolean, slots: readonly string[]): RoleSpan[] {
  // The marks, where they stand in the sentence with the marks taken out.
  let plain = '';
  const events: { at: number; slot: number; open: boolean }[] = [];
  for (const ch of markedText) {
    const code = ch.charCodeAt(0);
    if (code >= START && code < START + slots.length) events.push({ at: plain.length, slot: code - START, open: true });
    else if (code >= END && code < END + slots.length) events.push({ at: plain.length, slot: code - END, open: false });
    else plain += ch;
  }
  const to = plain === text ? undefined : alignment(plain, text);
  if (plain !== text && !to) return [];
  // The characters of `text` a stretch [s, e) of the unmarked sentence lines up with.
  const place = (s: number, e: number): [number, number] | undefined => {
    if (!to) return s < e ? [s, e] : undefined;
    let first = -1;
    let last = -1;
    for (let k = s; k < e; k++) {
      if (to[k]! < 0) continue;
      if (first < 0) first = to[k]!;
      last = to[k]!;
    }
    return first < 0 ? undefined : [first, last + 1];
  };
  const found: RoleSpan[] = [];
  const open = new Map<number, number>();
  const settle = (slot: number, s: number, e: number | undefined) => {
    // A word whose edge its language rewrote — the close an inflection cut off with the ending, a
    // first letter a capital or an elision changed — ends (or starts) with its word, where words are
    // spaced; where they are not (ja), the word's edge is not to be found, and the span is dropped.
    const lost = e === undefined || (!!to && s < e && (to[s]! < 0 || to[e - 1]! < 0));
    if (lost && !spaced) return;
    const at = place(s, e ?? s + 1);
    if (!at) return;
    let [start, end] = at;
    if (spaced) {
      while (start > 0 && WORD_CHAR.test(text[start - 1]!)) start--;
      while (end < text.length && WORD_CHAR.test(text[end]!)) end++;
    }
    found.push({ slot: slots[slot]!, start, end });
  };
  for (const { at, slot, open: opens } of events) {
    const from = open.get(slot);
    if (opens) {
      if (from !== undefined) settle(slot, from, undefined);
      open.set(slot, at);
    } else if (from !== undefined) {
      settle(slot, from, at);
      open.delete(slot);
    }
  }
  for (const [slot, from] of open) settle(slot, from, undefined);
  // One slot's overlapping spans — a form said inside another of the same word — are one.
  found.sort((a, b) => a.start - b.start || a.end - b.end);
  const spans: RoleSpan[] = [];
  const last = new Map<string, RoleSpan>();
  for (const span of found) {
    const prev = last.get(span.slot);
    if (prev && span.start <= prev.end) prev.end = Math.max(prev.end, span.end);
    else {
      const own = { ...span };
      spans.push(own);
      last.set(span.slot, own);
    }
  }
  return spans;
}

/**
 * Where each role of `plan` stands in `text`, the sentence `say` renders from `lexicon` (see the top
 * of this file); undefined when none can be placed. `say` is called again with the marked lexicon.
 */
export function roleSpans(
  plan: PhrasePlan,
  lexicon: LexiconLookup,
  say: (lookup: LexiconLookup) => string,
  text: string,
  spaced: boolean,
): RoleSpan[] | undefined {
  const slots = planSlots(plan);
  if (slots.length === 0 || !text) return undefined;
  let markedText: string;
  try {
    markedText = say(markingLookup(lexicon, slots));
  } catch {
    // A mark a rule could not take (a form it parses) costs the spans, never the translation.
    return undefined;
  }
  const spans = spansOf(markedText, text, spaced, slots.map((s) => s.slot));
  return spans.length > 0 ? spans : undefined;
}
