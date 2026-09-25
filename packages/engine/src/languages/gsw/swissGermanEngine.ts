import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveGsw } from '../../possessive.js';
import { COORD_INVERTS, COORD_WORDS, PARENTHETICAL_CONNECTORS, DE_EXAMPLES, CORRELATIVE_PAIR } from './gsw.consts.js';
import { citeCorrelative } from '../../functions/correlate.js';
import { DE_DURATION_CITATION, DE_GENITIVE_TEMPORAL, DE_TEMPORAL } from './gsw.consts.js';
import { deComparative } from './deComparative.js';
import { deStem } from './deStem.js';
import { deSuperlativeSuffix } from './deSuperlativeSuffix.js';
import { determiner } from './determiner.js';
import { prepDet } from './prepDet.js';
import { spatialHead } from './spatialHead.js';
import { punctuate } from './punctuate.js';
import { questionFront } from './questionFront.js';
import { renderClause } from './renderClause.js';
import type { Subordinator } from '@signi/shared';
import { SUBORDINATORS } from './gsw.consts.js';

export const swissGermanEngine: LanguageEngine = {
  language: 'gsw',
  render(phrase: ResolvedPhrase): string {
    // Hypothetical conditional: "wenn <protasis>, <apodosis>", both realised with the
    // würde-periphrasis. The "wenn" clause is a verb-final subordinate ("wenn der Kater essen
    // würde"); the main clause that follows it is inverted, because the fronted subordinate clause
    // occupies the front field, pushing the finite verb ahead of the subject ("würde der Hund
    // laufen"). Without a condition the main clause takes ordinary V2 order.
    // A yes/no question leaves the front field empty, so its finite verb leads: V1, "ist der Server
    // aktiv?", "isst der Kater die Maus?". A clause coordinated with it is a question too.
    // A wh-question fills that front field with its word, so the finite verb stands second behind it
    // — the V2 order, reached by the same inversion: "was isst der Kater?", "wo isst der Kater?". Over
    // the subject the word IS the subject, and the clause is the plain V2 statement: "wer isst das
    // Essen?" (P09-E6).
    //
    // A possessor question fronts the whole phrase *wessen* sits in (P09-E14): over the subject that
    // is the V2 statement again, "wessen Kater frisst das Essen?"; over the object the phrase leaves
    // the Mittelfeld for the front field, in its own case, "wessen Essen frisst der Kater?".
    const question = !!phrase.verbPhrase?.interrogative;
    const gap = phrase.question;
    const subjectAsked = gap?.role === 'subject' || (gap?.role === 'possessor' && gap.possessed === 'subject');
    const front = gap && !subjectAsked && phrase.verbPhrase ? questionFront(phrase) : undefined;
    const main = renderClause(front?.rest ?? phrase, /*inverted*/ !!phrase.condition || (question && !subjectAsked));
    const asked = front ? `${front.word} ${main}` : main;
    const sentence = phrase.condition
      ? `wenn ${renderClause(phrase.condition, false, /*verbFinal*/ true)}, ${asked}`
      : asked;
    // Coordination: "<first clause>, <conjunction> <second clause>" — with the second clause
    // inverted when the conjunction is an adverb that claims the front field. A parenthetical
    // connector takes a comma after it as well as before, since a whole clause follows it
    // ("…, das heißt, der Hund springt"; A192).
    if (!phrase.coordination) return punctuate(sentence);
    const { conjunction, clause } = phrase.coordination;
    // "jedoch" is a connective adverb inside the second clause, not a coordinator before it: it
    // stands after the finite verb, in the ordinary adverb slot, and the two clauses are parted by a
    // semicolon — "der Kater läuft; der Hund frisst jedoch" (P09-E29). A clause with no V2 slot to
    // put it behind (a verbless one) takes it in front instead.
    if (conjunction === 'however') {
      const word = COORD_WORDS.however;
      const inside = renderClause({ ...clause, postFiniteAdverb: word }, question);
      const second = inside === renderClause(clause, question) ? `${word} ${inside}` : inside;
      return punctuate(`${sentence}; ${second}`);
    }
    const connector = `${COORD_WORDS[conjunction]}${PARENTHETICAL_CONNECTORS.has(conjunction) ? ',' : ''}`;
    return punctuate(
      `${sentence}, ${connector} ${renderClause(clause, question || COORD_INVERTS[conjunction])}`,
    );
  },
  // The determiner alone, for the menu that picks one. A German determiner is declined for case;
  // a menu names it in the nominative, the case the citation form is given in.
  renderDeterminer(noun: ConceptForms): string {
    const f = noun.forms;
    return determiner(f, 'nom', (f['number'] ?? f['count']) === 'plural');
  },
  // The possessive alone, for the label on a coreference link. A German possessive is an ein-word
  // declined for the possessed head's case/gender/number, so it is cited on a noun in the
  // nominative — the case a citation form is given in, as `renderDeterminer` does.
  renderPossessive(noun: ConceptForms, possessor: PronominalPossessor): string {
    const f = noun.forms;
    return possessiveGsw(possessor, 'nom', {
      gender: (f['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
  // The word that opens a subordinate clause, for the builder's subordinate-clause menu (P09-E12
  // D9): `that`, the object clause's complementizer, or a subordinating conjunction. German cites each as it opens its verb-final clause ("dass", "nachdem").
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'whether') return 'öb'; // P09-E55, the indirect yes/no question's complementizer
    return sub === 'that' ? 'das' : SUBORDINATORS[sub];
  },
  renderConjunction(conjunction: CoordConjunction, options?: { correlative?: boolean }): string {
    // The correlative pair, its two places marked (P09-E46).
    if (options?.correlative && conjunction === 'and') return citeCorrelative(CORRELATIVE_PAIR);
    return COORD_WORDS[conjunction];
  },
  // The preposition alone. German marks its spatial relations with case rather than with different
  // words, and the case shows on the *article*, so a bare noun leaves exactly the preposition —
  // "unter", "über", "durch" — and the accusative/dative split (a route through vs a place in) has
  // nothing to show. The cause takes "wegen" (+ genitive), credits with "dank" (+ dative), and blames
  // with the fixed "durch die Schuld" + genitive.
  renderSpecifier(noun: ConceptForms, specifier: Specifier): string {
    const f = { ...noun.forms, definiteness: 'bare' };
    if (specifier.kind === 'sentiment') {
      return specifier.value === 'positive' ? prepDet('dank', f, 'dat', false)
        : specifier.value === 'negative' ? 'dur d Schuld vo'
        : prepDet('wäge', f, 'dat', false);
    }
    // The temporal's relation (P09-E12b), headed as `complementsPhrase` heads it: the generic "zu",
    // "bis zu", "während", and "vor" for both `ago` and `before` — German tells the two apart no
    // more on the toolbar than in the sentence ("vor einem Augenblick", "vor dem Tag").
    if (specifier.kind === 'temporal') {
      const relation = specifier.value;
      return relation === 'during' || relation === 'within' ? prepDet(DE_GENITIVE_TEMPORAL[relation], f, 'gen', false)
        : relation === 'until' ? `bis ${prepDet('zu', f, 'dat', false)}`
        // The duration has no preposition to cite (P09-E35), so the toolbar names it by "lang".
        : relation === 'for' ? DE_DURATION_CITATION
        : prepDet(relation === 'at' ? 'zu' : DE_TEMPORAL[relation], f, 'dat', false);
    }
    return specifier.kind === 'path' ? spatialHead(specifier.value, f, false, 'locative') : '';
  },
  // German compares **synthetically** upward and periphrastically downward, so there is no one
  // degree word to show: the comparative and the superlative are the adjective itself, remade
  // ("größer", "am größten"), while inferiority and equality are invariant adverbs in front of it
  // ("weniger", "am wenigsten", "gleich"). The superlative is given in its predicative "am …-en"
  // form, the one that stands without a noun.
  renderDegree(adjective: ConceptForms, degree: Degree): string {
    const base = adjective.forms['base'] ?? '';
    if (degree === 'more') return adjective.forms['comparative'] ?? deComparative(deStem(adjective, base));
    if (degree === 'most') {
      const stem = adjective.forms['superlative'] ?? `${deStem(adjective, base)}${deSuperlativeSuffix(deStem(adjective, base))}`;
      return `am ${stem}e`;
    }
    if (degree === 'less') return 'weniger';
    if (degree === 'least') return 'am wenigschte';
    if (degree === 'equally') return 'gliich';
    return '';
  },
  // The examples relation alone, for the chip on the line to a noun's examples ring (P09-E48).
  renderExamples(relation: 'example' | 'inclusion'): string {
    return DE_EXAMPLES[relation];
  },
};
