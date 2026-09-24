import type { NounPhrase } from '@signi/shared';
import { isCoreferentPossessor, isPronominalPossessor } from '@signi/shared';
import type { ConceptForms, ResolvedNounPhrase } from '../../types.js';
import { ALMOST_DETERMINERS, APPROXIMATOR_WORDS, MASS_DETERMINER, NO_TAKES_SINGULAR, OTHER_REPLACES_INDEFINITE, PLURAL_DETERMINERS, SINGULAR_DETERMINERS, POSSESSOR_OWN_ADJECTIVE, SUPERLATIVE_DEGREES, SUPERLATIVE_MAKES_DEFINITE } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { antecedentAgreement } from './antecedentAgreement.js';
import { applyIntensifier } from './applyIntensifier.js';
import { applyKinName } from './applyKinName.js';
import { applyNounGender } from './applyNounGender.js';
import { applyPluralOnly } from './applyPluralOnly.js';
import { applyPossessorForm } from './applyPossessorForm.js';
import { applyMassUnit, refuseUncountableNumeral } from './countMass.js';
import { isGenericBound } from '../../functions/boundPossessor.js';
import { foldIndefiniteModifier } from './foldIndefiniteModifier.js';
import { fuseAdjectives } from './fuseAdjectives.js';
import { resolve } from './resolve.js';
import { resolveAdjectiveStandard } from './resolveAdjectiveStandard.js';
import { resolveNounElement } from './resolveNounElement.js';
import { resolveRelativeClause } from './resolveRelativeClause.js';
import { resolveStandard } from './resolveStandard.js';

/** No adjective was fused into the head — the answer for every phrase but a Japanese kin term. */
const EMPTY: ReadonlySet<number> = new Set();

/**
 * Resolve a noun phrase for one language: resolve the possessor, then the head noun/pronoun with its
 * number/gender (synthesising the pronoun surface form, or applying noun gender) and the form its
 * possessor selects, then each adjective. This folds together what used to be four duplicated
 * subject/object/complement blocks. `address` marks the vocative (`PhrasePlan.address`, P11-E3),
 * whose kin term takes the form address takes (see `applyPossessorForm`).
 */
export function resolveNounPhrase(np: NounPhrase, language: string, lookup: LexiconLookup, address = false): ResolvedNounPhrase {
  const head = resolve(np.concept, language, lookup);
  // A possessor is one of two shapes. A pronominal possessor ("his") is pure grammatical features —
  // it needs no lexicon lookup, so it passes straight through for the engine to spell as a
  // possessive pronoun. A genitive possessor is itself a noun phrase; recursing handles its own
  // adjectives, number/gender, and any nested possessor ("the cat's owner's book").
  //
  // It is resolved **before** the head's own forms are settled, because in two of the seven the head's
  // word depends on who owns it: 母 is my mother and お母さん is yours, "ma femme" but "une épouse"
  // (P11 §2, `applyPossessorForm`). A possessor deep in a genitive chain therefore reaches the head
  // that names it, one link at a time.
  //
  // A coreferent possessor is a link to the clause's subject, bound to that subject's features by the
  // clause before its phrases resolve (see `bindCoreferents`, P11-E2). One still unbound here stands
  // in a phrase no clause holds — a word, a gloss — and has nothing to refer to.
  if (np.possessor && isCoreferentPossessor(np.possessor)) {
    throw new Error('a coreferent possessor needs a clause whose subject it names, and this phrase stands in none (P11-E2)');
  }
  const possessor = np.possessor
    ? (isPronominalPossessor(np.possessor)
        ? np.possessor
        : resolveNounPhrase(np.possessor, language, lookup))
    : undefined;
  // The adjectives the head fused into its own word, spent rather than said (see `fuseAdjectives`).
  // Only a noun head fuses; a pronoun takes no attributive adjective to fuse.
  let fused: ReadonlySet<number> = EMPTY;
  if (head.forms['person']) {
    // A 3rd-person pronoun that names the noun it stands for takes its gender from that noun, the
    // way this language reads it (C20): de *Inhalt* → "ihn", but en "it". Settled here, before the
    // surface is picked, so every slot a pronoun can fill agrees alike. Where the language could
    // only guess (a person of unstated sex in en/ja), the pronoun gives way to a noun phrase.
    const agreed = np.antecedent && head.forms['person'] === '3' && !head.forms['generic']
      ? antecedentAgreement(np, np.antecedent, language, lookup)
      : undefined;
    if (agreed && 'anaphor' in agreed) return resolveNounPhrase(agreed.anaphor, language, lookup);
    // Pronoun: synthesise the correct surface form as 'base' so all engines can use
    // their existing `forms['base']` / `forms['plural']` logic unchanged.
    const number = np.number ?? 'singular';
    // An indefinite pronoun's gender is its lexeme's where the lexeme names one, which a relative
    // pronoun agrees with: de *etwas* is neuter, "etwas, das brennt" (A309).
    const lexicalGender = head.forms['indefinite'] === '1' ? head.forms['gender'] as NounPhrase['gender'] : undefined;
    const gender = agreed?.gender ?? np.gender ?? lexicalGender ?? 'masc';
    head.forms['number'] = number;
    // Expose the referent's gender for every person: the 1st/2nd-person surface is
    // gender-invariant ("io", "tu"), but Romance participle/adjective agreement still
    // depends on it ("tu sei stato/stata"), so downstream engines need to read it.
    head.forms['gender'] = gender;
    // Keep the furigana reading (if any) in step with whichever surface we select.
    if (number === 'plural') {
      // A language may have a distinct plural pronoun for a gender: the feminine elles / ellas / elas
      // / 彼女ら (and Spanish nosotras / vosotras), and the Japanese neuter それら, which is a group of
      // THINGS where 彼ら is a group of people (A200). Read off the gender in hand, exactly as the
      // singular is a few lines below; a language with no gendered plural carries only `plural`.
      const genderedPlural = head.forms[`plural_${gender}`];
      const pluralSurface = genderedPlural || head.forms['plural'];
      if (pluralSurface) { head.forms['base'] = pluralSurface; head.forms['plural'] = pluralSurface; }
      // The furigana reading follows whichever surface was selected, so a feminine plural reads
      // かのじょら and not the masculine かれら (A161) — as the singular already does below.
      const pluralReading = (genderedPlural && head.forms[`plural_${gender}_reading`]) || head.forms['plural_reading'];
      if (pluralReading) head.forms['reading'] = pluralReading;
    } else if (head.forms['person'] === '3') {
      const gf = head.forms[`singular_${gender}`];
      if (gf) head.forms['base'] = gf;
      const gr = head.forms[`singular_${gender}_reading`];
      if (gr) head.forms['reading'] = gr;
    }
    // 1st / 2nd person singular: base is already the correct form
    // Disjunctive (tonic/oblique) surface for prepositional use ("because of me/her/them"),
    // synthesised for the same number/gender as `base`. Engines that place a pronoun after
    // a preposition read forms['disjunctive'] (falling back to base when absent, e.g. ja).
    // The plural reads off the gender in hand exactly as the surface above does: French elles,
    // Spanish ellas / nosotras / vosotras, Portuguese elas are the feminine of the tonic form as
    // well as of the subject one (A205). A row with no `disjunctive_plural_<gender>` — English,
    // German, Italian, whose plural tonic is invariant — falls through to the ungendered key.
    const disj =
      number === 'plural'
        ? head.forms[`disjunctive_plural_${gender}`] ?? head.forms['disjunctive_plural'] ?? head.forms['disjunctive']
        : head.forms['person'] === '3'
          ? head.forms[`disjunctive_${gender}`] ?? head.forms['disjunctive']
          : head.forms['disjunctive'];
    if (disj) head.forms['disjunctive'] = disj;
  } else {
    // Noun: apply number then gender. Determiner choice is threaded like number/gender
    // so each engine reads it off forms. Some quantifiers are inherently plural ("many
    // boys", "all boys"), so they force the plural surface — but only when the noun has
    // one (mass nouns like "water" stay singular: "some water").
    // A relative superlative ("most", "least") picks one member out of a set, so the phrase is
    // definite whatever indefinite or bare determiner was picked: "the biggest dog", "il cane più
    // grande", "der größte Hund". Resolved here, once for every language (A175): Italian, Spanish and
    // Portuguese tell the superlative from the comparative by that article alone ("un cane più
    // grande" is "a bigger dog"), and German and French would decline or article it wrong.
    // A proper name ("Europe", "Asia") takes the article its own language fixes, not the one the plan
    // picked: every article builder already ignores `definiteness` for a `proper` head. Resolve that
    // here too, once for every language (A180), so the other readers of `definiteness` agree with the
    // article that is actually rendered — German's adjective declension ("das große Asien", not "das
    // großes Asien"), Spanish's a/de + el contraction ("al Asia grande"), Japanese's quantifier (no
    // "多くのヨーロッパ", and no この/その either, as the other six languages already drop "this"), and the
    // negative concord a `no` would otherwise trigger with no negator to license it ("l'Asie ne brûle.").
    const superlative = (np.adjectives ?? []).some((_, i) => SUPERLATIVE_DEGREES.has(np.adjectiveDegrees?.[i] ?? 'positive'));
    // A casual kin term the phrase uses as a name ("Mom runs") is one from here on (P11-E3).
    applyKinName(np, head.forms);
    // A name the language leaves bare resolves **bare**, not definite (`takes_article: '0'`): a
    // personal name takes no article in five of the seven, and the paths that fuse a preposition
    // with an article read the determiner rather than the `proper` flag — "a Pietro", "de Pierre",
    // never "al Pietro" (C38). A title overrides the key, so a titled name is articled again where
    // the language articles a title.
    const picked = head.forms['proper'] === '1'
      ? (head.forms['takes_article'] === '0' ? 'bare' : 'definite')
      : superlative && SUPERLATIVE_MAKES_DEFINITE.has(np.definiteness ?? 'definite')
        ? 'definite'
        : np.definiteness ?? 'definite';
    // Spanish "otro gato" and Portuguese "outro gato" put OTHER where the indefinite article would
    // stand — but only while OTHER actually stands there. A degree or an intensifier moves it behind
    // the noun ("un gato más otro", "un gato muy otro"), and the article is then wanted again, so the
    // test is the same one the two engines' prenominal branches make (C33).
    const otherLeads = (np.adjectives ?? []).some((id, i) =>
      id === 'OTHER' && (np.adjectiveDegrees?.[i] ?? 'positive') === 'positive' && !np.adjectiveIntensifiers?.[i]);
    const unmassed =
      picked === 'indefinite' && OTHER_REPLACES_INDEFINITE.has(language) && otherLeads
        ? 'bare'
        : picked;
    // Mass nouns ("water") never pluralise, so quantifiers keep them singular ("much water").
    // A cardinal above one counts, so it pluralises the head wherever the language has a plural —
    // "two cats", "le due case" — which is the first thing the numeral does (C31). At one it leaves
    // the number alone, and a mass noun is never counted.
    // A plurale tantum (*le notizie*, *die Nachrichten*) is plural whatever the plan or its determiner
    // asks — the lexeme wins, as a mass noun's singular does (P09-E41 D2). Settled first, since it also
    // sheds the concept's mass flag, which the quantifiers below read.
    const pluralOnly = applyPluralOnly(head.forms);
    // A numeral on a noun no language counts is refused; one a language counts by a unit word takes
    // that word here, as does a distributive, so the quantifiers below see a count noun (A311).
    refuseUncountableNumeral(np, head.forms, lookup);
    applyMassUnit(head.forms, np.numeral, unmassed);
    // A counting determiner on a mass noun says what it can (see MASS_DETERMINER, P09-E25), read after
    // a plurale tantum has shed its mass flag. A plurale tantum has no singular for the distributives
    // to take, so each / every take it whole, as `all`: "tutte le notizie", never "*ogni notizie".
    const definiteness = head.forms['uncountable'] === '1' ? MASS_DETERMINER[unmassed] ?? unmassed
      : pluralOnly && SINGULAR_DETERMINERS.has(unmassed) ? 'all'
      : unmassed;
    const counted = (np.numeral ?? 0) > 1 && head.forms['uncountable'] !== '1';
    const forcesPlural = counted || (PLURAL_DETERMINERS.has(definiteness) && head.forms['uncountable'] !== '1');
    const forcesSingular = (definiteness === 'no' && NO_TAKES_SINGULAR.has(language)) || SINGULAR_DETERMINERS.has(definiteness);
    const num = pluralOnly || forcesPlural ? 'plural' : forcesSingular ? 'singular' : (np.number ?? 'singular');
    head.forms['number'] = (num === 'plural' && !head.forms['plural']) ? 'singular' : num;
    applyNounGender(head.forms, np.gender);
    // Then the head's *own* word, where an adjective is part of it (ja 兄弟 + ELDER → 兄, P11 D5) —
    // before the possessor picks a form of that word, so 兄 can still become お兄さん. The gender step
    // above is untouched by it: only Japanese seeds a `with_` column, and Japanese nouns have none.
    fused = fuseAdjectives(head.forms, np.adjectives ?? []);
    // …and last, the form the possessor selects: one's own 母 against someone else's お母さん, "ma
    // femme" against "une épouse" (P11 D2/D3/D6). It also marks a kin head as one's own, which the
    // phrase holding this one as its genitive possessor reads.
    applyPossessorForm(head.forms, possessor, address);
    // An indefinite article gives way to a numeral in every one of the seven — at one the numeral IS
    // that article in five of them, and above one no language writes both — so the phrase resolves
    // bare and each engine's article builder writes nothing without being told (C31). The value
    // itself rides on the forms, as the determiner and the degree do.
    // An approximated numeral is no identified set, so it drops the definite article too: "about five
    // cats", "circa cinque gatti", never "the about five cats" (P09-E38).
    const about = np.approximator === 'about' && np.numeral !== undefined;
    head.forms['definiteness'] = np.numeral !== undefined && (definiteness === 'indefinite' || (about && definiteness === 'definite'))
      ? 'bare'
      : definiteness;
    if (np.numeral !== undefined) head.forms['numeral'] = String(np.numeral);
    // The approximator's word rides on the forms with its separator, as the numeral does: `approximator`
    // before the numeral (see `numeralText`), `approximator_det` before the determiner (see
    // `withApproximator`). Anywhere else it is ignored (P09-E38 D1).
    const words = APPROXIMATOR_WORDS[language];
    if (words && about) head.forms['approximator'] = words.about(head.forms['gender'] === 'fem');
    if (words && np.approximator === 'almost' && ALMOST_DETERMINERS.has(definiteness)) head.forms['approximator_det'] = words.almost;
  }
  // An adjective head is the predicate adjective of a subject complement ("seems happy") —
  // the one head that carries a comparative degree of its own. Thread it onto the head's
  // forms exactly as an attributive adjective's is below, so `adjDegree` reads either.
  if (head.forms['role'] === 'adjective' && np.headDegree && np.headDegree !== 'positive') {
    head.forms['degree'] = np.headDegree;
  }
  // …and its intensifier, the same way ("is very big"; see `applyIntensifier`, C33).
  if (head.forms['role'] === 'adjective') applyIntensifier(head, np.headIntensifier, language, lookup);
  // …and what its degree measures it against — the standard ("bigger than the dog") or the superlative's
  // set ("the biggest of the animals", P09-E19) — where the degree takes one at all
  // (see `resolveStandard`, P09-E5).
  const standard = resolveStandard(np, head, language, lookup);
  // A title stands with a personal name and nowhere else: `proper` says it is a name and `human`
  // that it is a person's (C38). Its surface, its gender and the form Italian writes before a name
  // ride on the head's forms too, where every engine's article builder can reach them — the article
  // of a titled phrase agrees with the title, not with the name.
  const title = np.title && head.forms['proper'] === '1' && head.forms['human'] === '1'
    ? resolve(np.title, language, lookup)
    : undefined;
  if (title) {
    // Title and name are one word from here on. That is not a shortcut: the two really are one noun
    // phrase, and making them one surface is what puts the title in every slot a name can fill —
    // subject, object, complement, possessor — without each of those asking whether there is one.
    // Italian writes the short form before a name (`before_name`), and Japanese writes the title
    // **after** it (`position: 'suffix'`), which is the only place the order differs.
    const word = title.forms['before_name'] ?? title.forms['base'] ?? '';
    const name = head.forms['base'] ?? '';
    head.forms['base'] = title.forms['position'] === 'suffix' ? `${name}${word}` : `${word} ${name}`;
    // The article agrees with the title, and is the one a **title** takes: Italian, Spanish and
    // Portuguese write it ("il signor Pietro", "el señor Pedro"), English, French and German none.
    // Each language says which on the title's own lexeme, overriding what the name says as a name.
    if (title.forms['gender']) head.forms['gender'] = title.forms['gender'];
    delete head.forms['takes_article'];
    if (title.forms['takes_article']) head.forms['takes_article'] = title.forms['takes_article'];
    // Furigana is drawn per word, so a fused surface has none: the name's reading would sit over
    // both halves. The names are katakana, which needs none anyway.
    delete head.forms['reading'];
  }
  // OWN is bound to the possessor, not listed among the adjectives (see NounPhrase.possessorOwn),
  // but it agrees and declines exactly as an adjective does, so it is handed to the engines as one —
  // at the head of the list, where every language puts it, and marked so Japanese can tell it from
  // an ordinary adjective and drop the possessor it replaces. With no possessor there is nothing to
  // bind it to and the flag is ignored (C37).
  // Italian's generic *proprio* is already the emphasis, so OWN adds no second one: "si vede il
  // proprio libro" (A332).
  const ownSaid = language === 'it' && isGenericBound(np.possessor);
  const own = np.possessorOwn && np.possessor && !ownSaid ? resolve(POSSESSOR_OWN_ADJECTIVE, language, lookup) : undefined;
  if (own) own.forms['possessor_bound'] = '1';
  // The standard of one attributive adjective ("a bigger cat than the dog"), at most one per phrase
  // (see `resolveAdjectiveStandard`, P09-E18). Its index is looked up in the resolved list below,
  // which a bound OWN leads and a fused adjective has left.
  const attributive = resolveAdjectiveStandard(np, language, lookup);
  let compared: ConceptForms | undefined;
  const adjectives = (own ? [own] : []).concat((np.adjectives ?? []).flatMap((id, i) => {
    // An adjective the head fused into its own word is already said (兄 IS "older brother"), so it
    // is dropped here. The ones that stay keep their index, and with it their degree and intensifier.
    if (fused.has(i)) return [];
    const cf = resolve(id, language, lookup);
    // Thread the per-adjective comparative degree onto its forms (like number/gender/
    // definiteness) so each engine reads it off `forms['degree']`. Omit the plain form.
    const deg = np.adjectiveDegrees?.[i];
    if (deg && deg !== 'positive') cf.forms['degree'] = deg;
    // The intensifier is a word of its own, so it is resolved in this language and its surface,
    // reading and position ride on the adjective beside the degree (C33). It stands before a
    // noun here, which some words say differently (English has no "a just as big cat", A255).
    applyIntensifier(cf, np.adjectiveIntensifiers?.[i], language, lookup, true);
    // The one attributive standard, on the adjective it belongs to (P09-E18): marked as a predicate
    // adjective's is, so its equative adverb takes the circumfix ("a cat as big as the dog").
    if (i === attributive?.planIndex) { cf.forms['standard'] = '1'; compared = cf; }
    return [cf];
  }));
  const adjectiveStandard = attributive && compared
    ? { index: adjectives.indexOf(compared), standard: attributive.standard }
    : undefined;
  // A pronoun's adjective (P09-E36). An indefinite one writes it into its own surfaces, the way each
  // language spells it (*something big*, *qualcosa di grande*, *etwas Großes*), and the adjectives
  // are spent; Japanese keeps them on the ordinary prenominal path (大きい何か). A personal pronoun
  // has no way to say one in any of the seven ("*big him"), and a plan that gives it one is refused
  // rather than rendered without it — the builder offers no adjective on a pronoun.
  const spent = !!head.forms['person'] && adjectives.length > 0 && (() => {
    if (head.forms['indefinite'] !== '1') throw new Error('a personal pronoun takes no adjective (P09-E36)');
    return foldIndefiniteModifier(head, adjectives, language);
  })();
  return {
    head,
    adjectives: spent ? [] : adjectives,
    // Attributive nouns ("sail boat"). Carry the relation through so each engine can
    // pick its linking preposition (Romance) or ignore it (en/de/ja neutralise). Apply
    // the modifier's own number (so Romance engines can select its plural surface and
    // agree its adjectives) and resolve those adjectives against that gender/number.
    nounModifiers: (np.nounModifiers ?? []).map((m) => {
      const concept = resolve(m.concept, language, lookup);
      // A plural-only modifier is plural whatever the plan says, as the head is (P09-E41).
      const number = applyPluralOnly(concept.forms) ? 'plural' : m.number ?? 'singular';
      // Fall back to singular when the lexicon has no plural surface (so isPlural/surface
      // don't select a missing form) — same guard the head noun uses above.
      concept.forms['number'] = (number === 'plural' && !concept.forms['plural']) ? 'singular' : number;
      return {
        concept,
        relation: m.relation,
        adjectives: (m.adjectives ?? []).map((id) => resolve(id, language, lookup)),
      };
    }),
    // A relative clause is the predicate half of a phrase whose subject is this
    // head. Recursing through resolveNounPhrase (its objects/complements are noun
    // phrases that may themselves carry `relative`) handles arbitrary nesting.
    // The head's own forms reach the clause: they fill its subject slot where the gap is the
    // subject, which a `subject_sense` reads (A157).
    relative: np.relative ? resolveRelativeClause(np.relative, language, lookup, head.forms) : undefined,
    // The possessor, resolved at the top of this function because the head's own word may depend on it.
    possessor,
    // What that possessor is to the head: its owner (the default), the whole the head is a part of
    // ("a part of a keyboard"), or the parts the head is made up of ("a group of canvases", C26).
    // Only English renders them differently from the owner; the flag rides through.
    possessorRole: np.possessorRole,
    // An adjective-definition gloss ("of great size"): a bare dimension-noun + degree-adjective
    // phrase the engines wrap in the preposition its head noun's `dimensionRelation` selects. The
    // flag rides through; the head noun and its adjective resolve on the ordinary path above.
    dimensionGloss: np.dimensionGloss,
    // A complement-definition gloss ("in all places", "to a higher place"): a place noun phrase the
    // engines render as the complement it names. The complement type and its specifiers ride
    // through; the phrase itself resolves on the ordinary path above.
    complementGloss: np.complementGloss,
    // A manner-definition gloss ("at high speed", "in a good way"): a manner-noun phrase the engines
    // wrap in the adposition its head noun's `mannerRelation` selects, keeping its own determiner.
    // The flag rides through; the head noun and its adjective resolve on the ordinary path above.
    mannerGloss: np.mannerGloss,
    // A headless relative-clause gloss ("that one has saved"): the engines say the relative alone.
    // The flag rides through; the head resolves on the ordinary path above, because the clause
    // still agrees with it (its gender, number and personhood) as the antecedent.
    relativeGloss: np.relativeGloss,
    // A contrastive demonstrative ("that place, not this one"): only French reads it, and only to
    // write the deictic clitic the other six spell in the determiner itself. The flag rides through.
    contrastive: np.contrastive,
    // The cardinal counting the head ("two cats", 二匹の猫). Plain data: each engine spells its own
    // word and places it, the number it forces having been settled above (C31).
    numeral: np.numeral,
    // The title standing with this name ("Mr Peter", ピーターさん) — already fused into the head's
    // surface above; carried here so an engine can tell a titled name from a bare one (C38).
    title,
    // The focus particle singling this phrase out ("only the cat", 猫も). Plain data: each engine
    // spells its own word and decides where it stands (C39).
    focus: np.focus,
    // The standard of an adjective head's comparison, resolved above (P09-E5). Each engine places it
    // beside the predicate adjective with the word its degree selects.
    ...(standard ? { standard } : {}),
    // …and the standard of one attributive adjective, with that adjective's index (P09-E18). Each
    // engine places it inside the noun phrase: after the noun (en, de), after the adjective (Romance)
    // or before it (ja).
    ...(adjectiveStandard ? { adjectiveStandard } : {}),
    // The members of the head's set it names ("animals such as the cat", P09-E33), resolved as a slot
    // of their own: each engine agrees and cases the example, not the head.
    ...(np.examples ? { examples: { phrase: resolveNounElement(np.examples.phrase, language, lookup), relation: np.examples.relation } } : {}),
  };
}
