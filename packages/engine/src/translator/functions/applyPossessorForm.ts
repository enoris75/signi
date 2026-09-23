import type { PronominalPossessor } from '@signi/shared';
import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';

/** The determiners under which a genitive possessor is a kind of person rather than a person. */
const NOBODY_IN_PARTICULAR = new Set(['indefinite', 'bare']);

/**
 * The form a head noun takes because of **who owns it** (P11 D2, D3, D6) — applied after
 * `applyNounGender`, on a head whose possessor is already resolved.
 *
 * Two languages change the word itself:
 *
 * - **Japanese** names one's own relative with one word and someone else's with another: 母 is my
 *   mother, お母さん is yours, and a mother who is nobody's in particular is 母親. Some pairs are
 *   different words entirely (妻 / 奥さん, 夫 / ご主人), which is why this is three stored columns —
 *   `base`, `possessed`, `honorific` — and not a prefix rule. A missing column falls back, from
 *   `honorific` to `possessed` to `base`, so MOM's single お母さん is right under every possessor.
 * - **French and German** shorten the word once it has an owner: "ma **femme**" but "une **épouse**",
 *   "meine **Frau**" but "eine **Ehefrau**". That is the same `possessed` column, read under any
 *   possessor at all, so a lexeme without one is simply left as it is.
 *
 * Whose relative counts as one's own is the *uchi / soto* line (D3): a 1st-person pronominal
 * possessor, or a genitive possessor that is itself one's own relative — 私の兄の妻 is 兄の妻, own all
 * the way down. Any other **human** possessor is outside the group and takes the honorific: a 2nd-person
 * one, a 3rd-person one that isn't neuter, or a genitive one whose head the lexicon marks `human`
 * (the boy, the teacher). A non-human possessor (猫の, その) takes `possessed` with no honorific, and
 * with no possessor at all nothing here fires and the head keeps its `base`.
 *
 * The chain is carried by `forms['own']`, set on a `kin` head one link at a time and read by the next
 * link up. Only nouns carry it, because a pronoun is features rather than a link, and only the
 * Japanese lexemes seed `kin`, so nothing marks itself in the other six.
 *
 * All of it presupposes **somebody in particular** whose relative this is — 母 is *my* mother and お母
 * さん *yours*, where 母親 is nobody's, and one is polite to a person, not to a kind of person. A
 * genitive possessor under the indefinite or bare determiner names no one ("a parent's mother", "a
 * child's wife"), so the head keeps its citation form: 親の母親, not 親のお母さん, and "l'épouse d'un
 * enfant", not "la femme d'un enfant". That is the case every kin definition is in — a gloss says
 * what the word means, of nobody (localization B71–B73) — and the definite possessor P11's own
 * examples use is untouched: 男の子のお母さん, la femme du garçon.
 */
export function applyPossessorForm(
  forms: Record<string, string>,
  possessor?: ResolvedNounPhrase | PronominalPossessor,
  // The phrase is the vocative (`PhrasePlan.address`, P11-E3).
  address = false,
): void {
  // **Address** is a third context beside citation and possession (P11-E3 D3): one calls one's own
  // mother お母さん, so the vocative takes the honorific whoever the relative is — whatever the
  // possessor, and whatever the own/other rule below would say. Only Japanese stores an honorific;
  // a head without one takes the ordinary rule below ("mon épouse" is "ma femme" in address too, and
  // MOM's one お母さん is already right). A 1st-person possessor still marks the relative one's own,
  // so its 私の is not said twice (お母さん、…, not 私のお母さん、…; D4).
  const addressed = (forms['number'] ?? forms['count']) === 'plural' ? 'plural_honorific' : 'honorific';
  if (address && forms[addressed]) {
    const reading = forms[`${addressed}_reading`];
    forms['base'] = forms[addressed]!;
    if (addressed === 'plural_honorific') forms['plural'] = forms[addressed]!;
    if (reading) forms['reading'] = reading; else delete forms['reading'];
    if (addressed === 'plural_honorific') { if (reading) forms['plural_reading'] = reading; else delete forms['plural_reading']; }
    if (forms['kin'] === '1' && possessor && isPronominalPossessor(possessor) && possessor.person === '1') forms['own'] = '1';
    return;
  }
  if (!possessor) return;
  if (!isPronominalPossessor(possessor) && NOBODY_IN_PARTICULAR.has(possessor.head.forms['definiteness'] ?? 'definite')) return;
  // The possessor in the only two terms this decides on: whether the relative is the speaker's own,
  // and whether the possessor is a person at all.
  const { own, human } = isPronominalPossessor(possessor)
    ? {
        own: possessor.person === '1',
        human: possessor.person === '2' || (possessor.person === '3' && possessor.gender !== 'neut'),
      }
    : {
        own: possessor.head.forms['own'] === '1',
        human: possessor.head.forms['human'] === '1',
      };
  // Someone else's, and a person: the one case that reaches for the honorific.
  const honorific = !own && human;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  // The plural is a column of its own because these plurals are often another word — 両親 for 親, ご両親
  // for 親御さん, "Frauen" for "Ehefrauen" (D7).
  const columns = plural
    ? (honorific ? ['plural_honorific', 'possessed_plural'] : ['possessed_plural'])
    : (honorific ? ['honorific', 'possessed'] : ['possessed']);
  const column = columns.find((key) => forms[key]);
  if (column) {
    const surface = forms[column] ?? '';
    const reading = forms[`${column}_reading`];
    forms['base'] = surface;
    if (plural) forms['plural'] = surface;
    // The furigana follows the surface that was selected, and is cleared where the column has none:
    // お母さん must not be read ははおや.
    if (reading) forms['reading'] = reading; else delete forms['reading'];
    if (plural) { if (reading) forms['plural_reading'] = reading; else delete forms['plural_reading']; }
  }
  // One's own relative is itself one's own, so a relative of *it* is too (私の兄の妻 → 兄の妻). The
  // mark goes on the head, where the phrase that owns this one as a genitive possessor reads it.
  if (own && forms['kin'] === '1') forms['own'] = '1';
}
