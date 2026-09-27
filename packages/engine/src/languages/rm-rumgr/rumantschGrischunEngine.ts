import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveRumgr } from '../../possessive.js';
import { COORD_WORDS, RG_DEGREE, RG_EXAMPLES, CORRELATIVE_PAIR, RG_TEMPORAL, SUBORDINATORS } from './rumgr.consts.js';
import { citeCorrelative } from '../../functions/correlate.js';
import { joinWords } from './joinWords.js';
import { agreeAdj } from './agreeAdj.js';
import { rgArticle } from './rgArticle.js';
import { prepDet } from './prepDet.js';
import { renderClause } from './renderClause.js';
import { spatialHead } from './spatialHead.js';
import { withChe } from './withChe.js';
import type { Subordinator } from '@signi/shared';

/**
 * Rumantsch Grischun (`rm-rumgr`, P04), a preview language: forked from the `it` engine (P04-E7 D1)
 * and made RG — articles *il / la / l' / ils / las* and the contractions *al, dal, als, dals*,
 * adjectives agreeing from their stored forms and placed by `position`, possessives without an article,
 * the subject always spoken (E10), *na … betg* (E11), the compound past (E12), *vegnir a* + infinitive
 * (E13), the aspect periphrases (E14), and the conditional and the imperative read from stored cells
 * (E16). Every rule *(verify)* until the variety's review (P04-E19).
 */
export const rumantschGrischunEngine: LanguageEngine = {
  language: 'rm-rumgr',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "sche <protasis>, <apodosis>", both read from the conditional cells
    // (P04 §2.4): "sch'il chaun currass, il giat mangiass". The apodosis keeps subject–verb order after
    // the fronted clause (P04 D9, pinned `test.fails` with the inverted order).
    const sentence = phrase.condition ? `${withChe('sche', renderClause(phrase.condition))}, ${main}` : main;
    if (!phrase.coordination) return sentence;
    // *dentant* (however) opens a clause of its own, as Italian's *tuttavia* (P09-E29).
    const { conjunction, clause } = phrase.coordination;
    if (conjunction === 'however') return `${sentence}; ${COORD_WORDS[conjunction]}, ${renderClause(clause)}`;
    return `${sentence}, ${COORD_WORDS[conjunction]} ${renderClause(clause)}`;
  },
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    if (f['role'] !== 'adjective') return f['base'] ?? '';
    return agreeAdj(f, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one, cited on the noun so it elides as it would ("l'").
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return rgArticle(f, plural, word);
  },
  // The possessive alone, for the label on a coreference link, agreeing with the cited noun ("mes"
  // on the masculine "num").
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    return possessiveRumgr(possessor, {
      gender: (f['gender'] ?? 'masc') as 'masc' | 'fem',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
  // The word that opens a subordinate clause (P09-E12 D9): *che*, *sche* (whether, P09-E55), or the
  // conjunction as it opens its clause ("cura che", "avant che").
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'whether') return 'sche';
    return sub === 'that' ? 'che' : SUBORDINATORS[sub].word;
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
    return COORD_WORDS[conjunction];
  },
  // The adposition alone, cited on the bare noun so nothing contracts: the relation's own name ("en",
  // "sut", "pervia da", "grazia a").
  renderSpecifier(noun: ConceptForms, specifier: Specifier): string {
    const f: Record<string, string> = { ...noun.forms, definiteness: 'bare' };
    const word = f['base'] ?? '';
    if (specifier.kind === 'sentiment') {
      return specifier.value === 'positive' ? `grazia ${prepDet('a', f, false, word)}`
        : specifier.value === 'negative' ? `per cuolpa ${prepDet('da', f, false, word)}`
        : `pervia ${prepDet('da', f, false, word)}`;
    }
    if (specifier.kind === 'temporal') {
      const { word: lead, prep, postposed } = RG_TEMPORAL[specifier.value];
      return joinWords([lead ?? '', prep ? prepDet(prep, f, false, word) : '', postposed ?? '']);
    }
    return specifier.kind === 'path' ? spatialHead(specifier.value, f, false, word) : '';
  },
  // RG compares periphrastically, so the degree is a word of its own: "pli", "il pli", "main",
  // "uschè" — the superlative cited with its masculine article.
  renderDegree(_adjective: ConceptForms, degree: Degree): string {
    const word = RG_DEGREE[degree];
    return word && (degree === 'most' || degree === 'least') ? `il ${word}` : word;
  },
  renderExamples(relation: 'example' | 'inclusion'): string {
    return RG_EXAMPLES[relation];
  },
};
