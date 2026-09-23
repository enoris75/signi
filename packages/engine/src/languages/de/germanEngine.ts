import type { CoordConjunction, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase } from '../../types.js';
import { possessiveDe } from '../../possessive.js';
import { COORD_INVERTS, COORD_WORDS, PARENTHETICAL_CONNECTORS } from './de.consts.js';
import { DE_TEMPORAL } from './de.consts.js';
import { deComparative } from './deComparative.js';
import { deStem } from './deStem.js';
import { deSuperlativeSuffix } from './deSuperlativeSuffix.js';
import { determiner } from './determiner.js';
import { prepDet } from './prepDet.js';
import { spatialHead } from './spatialHead.js';
import { punctuate } from './punctuate.js';
import { questionWord } from './questionWord.js';
import { renderClause } from './renderClause.js';

export const germanEngine: LanguageEngine = {
  language: 'de',
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
    const question = !!phrase.verbPhrase?.interrogative;
    const gap = phrase.question;
    const main = renderClause(phrase, /*inverted*/ !!phrase.condition || (question && gap?.role !== 'subject'));
    const asked = gap && gap.role !== 'subject' && phrase.verbPhrase
      ? `${questionWord(gap, phrase.verbPhrase.verb)} ${main}`
      : main;
    const sentence = phrase.condition
      ? `wenn ${renderClause(phrase.condition, false, /*verbFinal*/ true)}, ${asked}`
      : asked;
    // Coordination: "<first clause>, <conjunction> <second clause>" — with the second clause
    // inverted when the conjunction is an adverb that claims the front field. A parenthetical
    // connector takes a comma after it as well as before, since a whole clause follows it
    // ("…, das heißt, der Hund springt"; A192).
    if (!phrase.coordination) return punctuate(sentence);
    const { conjunction, clause } = phrase.coordination;
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
    return possessiveDe(possessor, 'nom', {
      gender: (f['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut',
      number: (f['number'] ?? f['count']) === 'plural' ? 'plural' : 'singular',
    });
  },
  renderConjunction(conjunction: CoordConjunction): string {
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
        : specifier.value === 'negative' ? 'durch die Schuld'
        : prepDet('wegen', f, 'gen', false);
    }
    // The temporal's relation (P09-E12b), headed as `complementsPhrase` heads it: the generic "zu",
    // "bis zu", "während", and "vor" for both `ago` and `before` — German tells the two apart no
    // more on the toolbar than in the sentence ("vor einem Augenblick", "vor dem Tag").
    if (specifier.kind === 'temporal') {
      const relation = specifier.value;
      return relation === 'during' ? prepDet('während', f, 'gen', false)
        : relation === 'until' ? `bis ${prepDet('zu', f, 'dat', false)}`
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
      return `am ${stem}en`;
    }
    if (degree === 'less') return 'weniger';
    if (degree === 'least') return 'am wenigsten';
    if (degree === 'equally') return 'gleich';
    return '';
  },
};
