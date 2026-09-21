import type { ComplementType, Tense } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import { alarmCry } from '../../functions/alarmCry.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isFrequencyAdverb } from '../../functions/isFrequencyAdverb.js';
import { modalChain } from '../../functions/modalChain.js';
import { negationSources } from '../../functions/negationSources.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { withComplementDefiniteness } from '../../functions/withComplementDefiniteness.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { passiveParticiple } from '../../functions/passiveParticiple.js';
import { MODAL_AUX } from './en.consts.js';
import { afterFirstAux } from './afterFirstAux.js';
import { agentPhrase } from './agentPhrase.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { coordinate } from './coordinate.js';
import { doSupport } from './doSupport.js';
import { modalAdverbEn } from './modalAdverbEn.js';
import { modalFinite } from './modalFinite.js';
import { npText } from './npText.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

/**
 * The predicate half of a phrase — everything after the subject — as ordered parts.
 * Shared by the top-level sentence and by relative clauses, which pass the head noun's
 * forms as `subjectForms` so the verb agrees with the head.
 */
export function predicateParts(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  subjectIsNegative = false,
  // The demoted agent of a passive clause, rendered as the by-phrase (see ResolvedPhrase.agent).
  agent?: ResolvedNounElement,
): string[] {
  const parts = predicateWords(subjectForms, verbPhrase, directObject, complements, subjectIsNegative, agent);
  return particleAfterPronoun(parts, verbPhrase, directObject);
}

/**
 * A phrasal verb's particle ("turn **off**", seeded as the `particle` form) follows a pronoun object
 * and may precede a noun one: "turn it off", never "*turn off it", but "turn off the light". Every
 * verb group ends on the particle ("do not turn off", "has turned off", "must turn off"), and the
 * object is the part right after it, so the particle moves across that one part.
 */
function particleAfterPronoun(parts: string[], verbPhrase: ResolvedVerbPhrase, directObject?: ResolvedNounElement): string[] {
  const particle = verbPhrase.verb.forms['particle'];
  const pronoun = directObject?.conjuncts.length === 1 && directObject.conjuncts[0].head.forms['person']
    ? objectPronounForm(directObject.conjuncts[0].head.forms)
    : undefined;
  if (!particle || !pronoun) return parts;
  const at = parts.indexOf(pronoun);
  if (at < 1 || !parts[at - 1].endsWith(` ${particle}`)) return parts;
  const out = [...parts];
  out[at - 1] = out[at - 1].slice(0, -(particle.length + 1));
  out[at] = `${pronoun} ${particle}`;
  return out;
}

function predicateWords(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  subjectIsNegative = false,
  agent?: ResolvedNounElement,
): string[] {
  const { negative: verbNegative, modifier, aspect = 'neutral', mood, register, modals, interrogative = false } = verbPhrase;
  // The passive conjugates "be" where the active conjugates the lexical verb, and hangs that verb's
  // past participle off it: "is eaten", "was eaten", "will be eaten", and — because every branch
  // below sees the auxiliary and not the verb — "is being eaten", "has been eaten", "must be
  // eaten", "would be eaten" for free. "be" is an auxiliary of its own (forms.copula), so the
  // negation and the question branches skip do-support: "is not eaten", "is the food eaten?".
  //
  // `lexical` stays the verb the clause is *about*: what the participle spells, and what the
  // complements read for the idioms and links a verb licenses.
  const lexical = verbPhrase.verb;
  const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
  const verb = passive ? verbPhrase.passiveAux! : lexical;
  // The hypothetical "if" clause (subjunctive) is realised by the past tense ("if the cat ate");
  // the main clause (conditional) is "would" + the verb group, handled in its own branch below.
  const tense: Tense = mood === 'subjunctive' ? 'past' : (verbPhrase.tense ?? 'present');

  // A pronoun direct object takes its object form with no article ("sees me"), not the noun path
  // that would give "the I"; a noun object renders as an ordinary noun phrase.
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // English has no negative concord, so exactly one of the clause's negation sources may surface and
  // the rest give way to the "any"-series NPI (see `negationSources`). A negator standing AHEAD of
  // the postverbal phrases takes them: a `no` SUBJECT ("no cat"), a negative adverb (NEVER)
  // anywhere in the group, or the finite verb's own "not". Between the two postverbal phrases the
  // object is leftmost and keeps its "no", so the complement is the one that gives way.
  const neg = negationSources({ subjectIsNegative, verbPhrase, directObject, complements });
  const negatedAhead = neg.subject || neg.adverb || neg.verb;
  // "does not eat any mouse", "never eats any mouse", "no cat eats any mouse" — but a LONE `no`
  // object keeps "no" ("eats no mouse"). A158/A160 widened this from the object to the subject that
  // precedes it and the complements that follow it: "does not run in any house", "no cat runs in
  // any house".
  const anyObject = neg.object && negatedAhead;
  const anyComplement = neg.complement && (negatedAhead || neg.object);
  // The choice is per conjunct, so a group mixes the two ("sees the dog and me"). Only a conjunct
  // that is itself `no` switches to "any": "does not eat the mouse or any food". The alarm a cry
  // raises is the shout itself, and English shouts it bare whatever determiner it carries: "cried
  // wolf", never "*cried the wolf" (A163). Italian and French fuse the article of the same frame.
  // A passive has no direct object left — the patient is the subject now — so the slot right after
  // the verb group carries the participle and the by-phrase instead. Every branch below puts this
  // string immediately after the verb, which is exactly where both belong ("is eaten by the cat in
  // the house"), so the passive needs no branch of its own.
  const directObjectText = passive
    ? [passiveParticiple(lexical), agentPhrase(agent)].filter(Boolean).join(' ')
    : !directObject ? ''
    : coordinate(directObject, (np) =>
      np.head.forms['person'] ? objectPronounForm(np.head.forms)
      : alarmCry(lexical, np) ? npText(withDefiniteness(np, 'bare'))
      : npText(anyObject && np.head.forms['definiteness'] === 'no' ? withDefiniteness(np, 'any') : np));
  const adverbText = modifier ? (modifier.forms['base'] ?? '') : '';
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  // A direction adverb (UP, DOWN) is a particle of the verb, not a comment on the action: it follows
  // the verb or its object directly and leads the complements, because a complement after it joins
  // itself to the object instead ("*moves the book in the house up"). Taking the head of the
  // complements slot puts it there in every branch below, and leaves the trailing slot — where a
  // manner adverb goes — empty (A156).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection ? '' : adverbText;
  const complementsText = [
    isDirection ? adverbText : '',
    complementsPhrase(anyComplement ? withComplementDefiniteness(complements, 'any') : complements, lexical.forms),
  ].filter(Boolean).join(' ');
  // A modal's own manner adverb has no slot inside the verb group ("*can fast eat"), so it trails the
  // clause with the main verb's: "can eat the mouse fast".
  const modalManner = modals.filter((m) => m.modifier && !isFrequencyAdverb(m.modifier)).map((m) => m.modifier!.forms['base'] ?? '');
  const trailing = (mainManner: string) => [...modalManner, mainManner].filter(Boolean).join(' ');

  // A negative subject is itself the clause's negator, so the finite verb takes no "not" —
  // "no cat runs", never "no cat does not run" — exactly as a NEVER adverb already did (A160).
  const negateVerb = verbNegative === true && !neg.adverb && !neg.subject;

  // Imperative: a subjectless command on the bare base ("eat the food!", "run!"). The subject
  // pronoun's person selects the form — 1st-plural is the "let's …" cohortative ("let's eat"),
  // 2nd person (singular or plural share a form in English) is the plain base. Negation is
  // "do not …" for 2nd person and "let's not …" for the cohortative. A frequency adverb leads a bare
  // command ("always eat") and follows an auxiliary and its "not" ("do not always eat", "let's
  // always eat", "let's not always eat"); manner adverbs trail ("eat slowly").
  if (mood === 'imperative') {
    const base = verb.forms['base'] ?? conjugate(verb.forms, subjectForms);
    // An instruction ("Load a period" on a button) is addressed to nobody, so it takes the bare
    // base whatever person the plan carries — the cohortative would put an addressee back in.
    const cohortative = register !== 'instruction' && (subjectForms['person'] ?? '2') === '1'; // 1pl "let's"
    const verbText = cohortative
      ? (negateVerb ? `let's not ${base}` : `let's ${base}`)
      : (negateVerb ? `do not ${base}` : base);
    const hasAux = cohortative || negateVerb;
    if (isFrequency && modifierText && hasAux) {
      return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, ''];
    }
    const preVerb = isFrequency ? modifierText : '';
    const postVerb = isFrequency ? '' : modifierText;
    return [preVerb, verbText, directObjectText, complementsText, postVerb];
  }

  // Infinitive / citation phrase: the dictionary "to" + base ("to consume food"). Subject-less
  // and tenseless (aspect is forced neutral, so the group is the bare base); a negative citation
  // reads "not to …". This is the true infinitive, distinct from the instruction register's bare
  // base ("consume food") above — the "to" is what makes it a gloss rather than a directive. A
  // frequency adverb leads the "to", after any "not": "always to eat", "not always to eat".
  if (mood === 'infinitive') {
    const group = verbGroupInfinitive(verb.forms, aspect);
    const verbText = negateVerb ? `not to ${group}` : `to ${group}`;
    if (isFrequency && modifierText && negateVerb) {
      return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, ''];
    }
    const preVerb = isFrequency ? modifierText : '';
    const postVerb = isFrequency ? '' : modifierText;
    return [preVerb, verbText, directObjectText, complementsText, postVerb];
  }

  // Conditional apodosis: "would" + the verb group ("would run", "would not run", "would be
  // running", "would have seen", "would want to go"). "would" is a defective modal auxiliary,
  // so it takes "not" directly and carries no tense/agreement itself.
  if (mood === 'conditional') {
    const groups = modals.length > 0
      ? [...modalChain(modals, (m) => m.forms['nonfinite'] ?? m.forms['base'] ?? '', modalAdverbEn), verbGroupInfinitive(verb.forms, aspect)]
      : [verbGroupInfinitive(verb.forms, aspect)];
    const verbText = [negateVerb ? 'would not' : 'would', ...groups].join(' ');
    // A frequency adverb follows "would" and its "not": "would always run", "would not always run".
    if (isFrequency && modifierText) {
      return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, trailing('')];
    }
    return ['', verbText, directObjectText, complementsText, trailing(modifierText)];
  }

  // A modal chain makes the outermost modal the finite verb — it takes the tense, the
  // agreement, and the negation — and every other element non-finite, down to the main
  // verb's whole group in the infinitive ("must not have seen the cat").
  if (modals.length > 0) {
    // Each verb in the group can carry its own adverb. A frequency adverb precedes the verb it
    // modifies ("never wanted", "to always go"), except on a true modal *auxiliary* finite or a
    // negated finite, where it follows the auxiliary and its "not" ("must always eat", "cannot always
    // eat", "does not always have to eat"). A manner adverb trails the whole clause, the main verb's
    // and the modals' alike. The main verb's own frequency adverb sits right before its group. A
    // question's finite always opens on an auxiliary, *do* where the modal is not one, so the adverb
    // follows it there too: "does the cat never want to go?".
    const words: string[] = [];
    modals.forEach((m, i) => {
      const adv = m.modifier?.forms['base'] ?? '';
      const freq = isFrequencyAdverb(m.modifier);
      if (i === 0) {
        const finite = modalFinite(m.verb, subjectForms, tense, negateVerb, interrogative);
        if (adv && freq && (negateVerb || interrogative || MODAL_AUX.has(finite.split(' ')[0]))) words.push(afterFirstAux(finite, adv));
        else if (adv && freq) words.push(adv, finite);
        else words.push(finite);
      } else {
        const word = m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? '';
        if (adv && freq) words.push(adv, word);
        else words.push(word);
      }
      if (m.verb.forms['link']) words.push(m.verb.forms['link']);
    });
    const mainGroup = verbGroupInfinitive(verb.forms, aspect);
    if (modifierText && isFrequency) words.push(modifierText, mainGroup);
    else words.push(mainGroup);
    const trailingMod = trailing(modifierText && !isFrequency ? modifierText : '');
    return ['', words.filter(Boolean).join(' '), directObjectText, complementsText, trailingMod];
  }

  // A non-neutral aspect (progressive/prospective/resultative) is periphrastic on "be",
  // which carries the tense and any negation ("is not going"), so it bypasses do-support.
  if (aspect !== 'neutral') {
    const verbText = aspectVerb(verb.forms, subjectForms, tense, aspect, negateVerb);
    // A frequency adverb follows the finite auxiliary of the group, not the whole group:
    // "you have never been", "is never going" — never "you never have been".
    if (isFrequency && modifierText) {
      return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, ''];
    }
    return ['', verbText, directObjectText, complementsText, modifierText];
  }

  if (negateVerb && !modifierIsNegative) {
    // The copula negates on itself — "is not careful", "was not careful", "will not be
    // careful" — never with do-support. A frequency adverb follows the "not", as it does after an
    // auxiliary: "is not always tired", "will not always be tired".
    if (verb.forms['copula'] === '1') {
      const frequency = isFrequency && modifierText ? `${modifierText} ` : '';
      const negVerb = tense === 'future'
        ? `will not ${frequency}${verb.forms['base'] ?? 'be'}`
        : `${conjugate(verb.forms, subjectForms, tense)} not ${frequency}`.trim();
      const trailingMod = isFrequency ? '' : modifierText;
      return [negVerb, directObjectText, complementsText, trailingMod];
    }
    const person = subjectForms['person'] ?? '3';
    const number = subjectForms['number'] ?? 'singular';
    // Negation auxiliary is tense-driven: "do/does not" (present),
    // "did not" (past), "will not" (future) — all followed by the bare base.
    const aux =
      tense === 'past'   ? 'did not' :
      tense === 'future' ? 'will not' :
      (person === '3' && number === 'singular') ? 'does not' : 'do not';
    const base = verb.forms['base'] ?? conjugate(verb.forms, subjectForms);
    // Frequency adverbs slot between aux and base: "do not always drink"
    const negVerb = isFrequency && modifierText ? `${aux} ${modifierText} ${base}` : `${aux} ${base}`;
    const trailingMod = isFrequency ? '' : modifierText;
    return [negVerb, directObjectText, complementsText, trailingMod];
  }
  // A question puts an auxiliary before its subject. A lexical verb in the present or past has none,
  // so it takes do-support as its negation does, and a frequency adverb follows the "do": "does the
  // cat eat?", "did the cat always run?", "does the cat never eat?". The copula and the future's
  // "will" are auxiliaries of their own ("is the cat careful?", "will the cat eat?").
  if (interrogative && tense !== 'future' && verb.forms['copula'] !== '1') {
    const verbText = `${doSupport(subjectForms, tense)} ${verb.forms['base'] ?? ''}`;
    if (isFrequency && modifierText) {
      return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, ''];
    }
    return ['', verbText, directObjectText, complementsText, modifierText];
  }
  // Future is periphrastic ("will eat"); present/past come from the forms map.
  const verbText = tense === 'future'
    ? `will ${verb.forms['base'] ?? ''}`
    : conjugate(verb.forms, subjectForms, tense);
  // In the future, the frequency adverb follows the auxiliary "will" ("will always eat"), the same
  // slot the perfect and a modal give it. With no auxiliary (present/past) it stays pre-verbal.
  if (isFrequency && modifierText && tense === 'future') {
    return ['', afterFirstAux(verbText, modifierText), directObjectText, complementsText, ''];
  }
  // The copula is an auxiliary for adverb placement: a frequency adverb follows its finite form
  // ("is always tired", "was never tired"), where a lexical verb takes it before ("always becomes").
  if (isFrequency && modifierText && verb.forms['copula'] === '1') {
    return ['', `${verbText} ${modifierText}`, directObjectText, complementsText, ''];
  }
  // Frequency adverbs (always, never) precede the main verb: S Adv V Obj
  // Manner adverbs (fast, slowly) follow the verb/object: S V Obj Adv
  const preVerb  = isFrequency ? modifierText : '';
  const postVerb = isFrequency ? '' : modifierText;
  return [preVerb, verbText, directObjectText, complementsText, postVerb];
}
