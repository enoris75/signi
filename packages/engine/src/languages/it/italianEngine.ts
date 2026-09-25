import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveIt } from '../../possessive.js';
import { COORD_WORDS, IT_DEGREE } from './it.consts.js';
import { CORRELATIVE_PAIR } from './it.consts.js';
import { citeCorrelative } from '../../functions/correlate.js';
import { IT_TEMPORAL } from './it.consts.js';
import { joinWords } from './joinWords.js';
import { agreeAdj } from './agreeAdj.js';
import { artFor } from './artFor.js';
import { prepDet } from './prepDet.js';
import { renderClause } from './renderClause.js';
import { spatialHead } from './spatialHead.js';
import type { Subordinator } from '@signi/shared';
import { SUBORDINATORS } from './it.consts.js';

export const italianEngine: LanguageEngine = {
  language: 'it',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "se <protasis (subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `se ${renderClause(phrase.condition)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    // "tuttavia" is a connective adverb opening a clause of its own: a semicolon before it and a
    // comma after it (P09-E29), "il gatto corre; tuttavia, il cane mangia".
    const { conjunction, clause } = phrase.coordination;
    if (conjunction === 'however') return `${sentence}; ${COORD_WORDS[conjunction]}, ${renderClause(clause)}`;
    return `${sentence}, ${COORD_WORDS[conjunction]} ${renderClause(clause)}`;
  },
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdj(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one. Italian elides and fuses against the word
  // that follows ("l'", "quell'", "un'"), so the citation noun is passed as that word.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    return artFor(f, plural, word);
  },
  // The possessive alone, for the label on a coreference link. Italian agrees it with the possessed
  // head in gender/number, so it is cited on a noun the way a determiner is ("suo" on the masculine
  // "nome"); the definite article the phrase puts before it is left off.
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    return possessiveIt(possessor, {
      gender: (f['gender'] ?? 'masc') as 'masc' | 'fem',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
  // The word that opens a subordinate clause, for the builder's subordinate-clause menu (P09-E12
  // D9): `that`, the object clause's complementizer, or a subordinating conjunction. Italian cites each as it opens its clause, two words where it writes two ("dopo che", "prima che").
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'whether') return 'se'; // P09-E55, the indirect yes/no question's complementizer
    return sub === 'that' ? 'che' : SUBORDINATORS[sub].word;
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    // The correlative pair, its two places marked (P09-E46).
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
    return COORD_WORDS[conjunction];
  },
  // The adposition alone. Italian fuses its prepositions with the *definite* article ("nella
  // casa"), so the noun is cited bare and `prepDet` leaves the plain preposition — which is the
  // relation's own name ("in", "sotto", "intorno a", "a causa di").
  renderSpecifier(noun: ConceptForms, specifier: Specifier): string {
    const f = noun.forms;
    const word = f['base'] ?? '';
    if (specifier.kind === 'sentiment') {
      return specifier.value === 'positive' ? `grazie ${prepDet('a', f, false, word)}`
        : specifier.value === 'negative' ? `per colpa ${prepDet('di', f, false, word)}`
        : `a causa ${prepDet('di', f, false, word)}`;
    }
    // The temporal's relation (P09-E12b), as `complementsPhrase` heads the complement on a bare
    // noun: "a", "fino a", "prima di", "dopo", "durante", and the postposed "fa" alone.
    if (specifier.kind === 'temporal') {
      const { word: lead, prep, postposed } = IT_TEMPORAL[specifier.value];
      return joinWords([lead ?? '', prep ? prepDet(prep, f, false, word) : '', postposed ?? '']);
    }
    return specifier.kind === 'path' ? spatialHead(specifier.value, f, false, word) : '';
  },
  // Italian compares periphrastically throughout, so the degree is a word of its own and the cited
  // adjective goes unread ("più", "il più", "meno", "altrettanto").
  renderDegree(_adjective: ConceptForms, degree: Degree): string {
    // The relative superlative is the comparative under the definite article — the article
    // belongs to the noun phrase, not to the degree, so a label that showed the adverb alone
    // would say "più" for both degrees. Cited masculine singular, the
    // gender a citation form is given in (as `renderPossessive` defaults).
    const word = IT_DEGREE[degree];
    return word && (degree === 'most' || degree === 'least') ? `il ${word}` : word;
  },
};
