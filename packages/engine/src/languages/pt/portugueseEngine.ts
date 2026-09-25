import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessivePt } from '../../possessive.js';
import { COORD_WORDS, PARENTHETICAL_CONNECTORS, PT_DEGREE, PT_EXAMPLES, CORRELATIVE_PAIR } from './pt.consts.js';
import { citeCorrelative } from '../../functions/correlate.js';
import { PT_TEMPORAL } from './pt.consts.js';
import { emPrep } from './emPrep.js';
import { prepDet } from './prepDet.js';
import { agreeAdj } from './agreeAdj.js';
import { artFor } from './artFor.js';
import { contractDet } from './contractDet.js';
import { datPrep } from './datPrep.js';
import { dePrep } from './dePrep.js';
import { porPrep } from './porPrep.js';
import { renderClause } from './renderClause.js';
import { spatialHead } from './spatialHead.js';
import type { Subordinator } from '@signi/shared';
import { SUBORDINATORS } from './pt.consts.js';

export const portugueseEngine: LanguageEngine = {
  language: 'pt',
  render(phrase: ResolvedPhrase): string {
    const main = renderClause(phrase);
    // Hypothetical conditional: "se <protasis (subjunctive)>, <apodosis (conditional)>".
    const sentence = phrase.condition ? `se ${renderClause(phrase.condition, true)}, ${main}` : main;
    // Coordination: "<first clause>, <conjunction> <second clause>".
    if (!phrase.coordination) return sentence;
    const { conjunction, clause } = phrase.coordination;
    const connector = `${COORD_WORDS[conjunction]}${PARENTHETICAL_CONNECTORS.has(conjunction) ? ',' : ''}`;
    // "however" is a connective adverb opening a clause of its own, so a semicolon comes before it
    // rather than a comma (P09-E29).
    return `${sentence}${conjunction === 'however' ? ';' : ','} ${connector} ${renderClause(clause)}`;
  },
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return agreeAdj(base, f['gender'] ?? 'masc', f['number'] === 'plural');
  },
  // The determiner alone, for the menu that picks one.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    const plural = (f['number'] ?? f['count']) === 'plural';
    // "Suficiente" follows the noun, so `artFor` leaves it to `ptAdj`; the menu still names it (P09-E25).
    if (f['definiteness'] === 'enough') return plural ? 'suficientes' : 'suficiente';
    return artFor(f, plural);
  },
  // The possessive alone, for the label on a coreference link. Portuguese agrees it with the
  // possessed head in gender/number, so it is cited on a noun; the definite article the phrase puts
  // before it ("o seu cão") is left off, as `ptPossessiveWord` does for a fused preposition.
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    return possessivePt(possessor, {
      gender: (f['gender'] ?? 'masc') as 'masc' | 'fem',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
  // The word that opens a subordinate clause, for the builder's subordinate-clause menu (P09-E12
  // D9): `that`, the object clause's complementizer, or a subordinating conjunction. Portuguese cites each as it opens its clause ("depois que").
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'whether') return 'se'; // P09-E55, the indirect yes/no question's complementizer
    return sub === 'that' ? 'que' : SUBORDINATORS[sub];
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    // The correlative pair, its two places marked (P09-E46).
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
    return COORD_WORDS[conjunction];
  },
  // The adposition alone: Portuguese contracts de/em/por/a with the article ("debaixo do carro",
  // "pela casa"), so a bare noun leaves the plain locution ("debaixo de", "por", "por causa de").
  renderSpecifier(noun: ConceptForms, specifier: Specifier): string {
    const f = noun.forms;
    if (specifier.kind === 'sentiment') {
      return specifier.value === 'positive' ? `graças ${contractDet(datPrep, 'a', f, false)}`
        : specifier.value === 'negative' ? `por culpa ${contractDet(dePrep, 'de', f, false)}`
        : `por causa ${contractDet(dePrep, 'de', f, false)}`;
    }
    // The temporal's relation (P09-E12b), headed as `complementsPhrase` heads it: "em", "há", "até",
    // "depois de", "antes de", "durante".
    if (specifier.kind === 'temporal') {
      if (specifier.value === 'at') return contractDet(emPrep, 'em', f, false);
      const { word, de, por } = PT_TEMPORAL[specifier.value];
      return de ? `${word} ${contractDet(dePrep, 'de', f, false)}`
        : por ? contractDet(porPrep, 'por', f, false)
        : prepDet(word, f, false);
    }
    return specifier.kind === 'path' ? spatialHead(specifier.value, f, false) : '';
  },
  // Periphrastic throughout ("mais", "o mais", "menos", "igualmente"), so the adjective goes unread.
  renderDegree(_adjective: ConceptForms, degree: Degree): string {
    // The relative superlative is the comparative under the definite article — the article
    // belongs to the noun phrase, not to the degree, so a label that showed the adverb alone
    // would say "mais" for both degrees. Cited masculine singular, the
    // gender a citation form is given in (as `renderPossessive` defaults).
    const word = PT_DEGREE[degree];
    return word && (degree === 'most' || degree === 'least') ? `o ${word}` : word;
  },
  // The examples relation alone, for the chip on the line to a noun's examples ring (P09-E48).
  renderExamples(relation: 'example' | 'inclusion'): string {
    return PT_EXAMPLES[relation];
  },
};
