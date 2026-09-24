import type { ContentClause, ImperativeRegister, InfinitiveComplement, NounElement, PhrasePlan, Tense } from '@signi/shared';
import type { Mood, ResolvedPhrase } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { adverbialClauseMood } from './adverbialClauseMood.js';
import { adverbialClauseTense } from './adverbialClauseTense.js';
import { clauseAddressee } from './clauseAddressee.js';
import { contentClauseForce, declarativeClause } from './contentClauseForce.js';
import { contentClauseMood } from './contentClauseMood.js';
import { contentClauseTense } from './contentClauseTense.js';
import { controlledSubject } from './controlledSubject.js';
import { controllerCase } from './controllerCase.js';
import { coordConjunction } from './coordConjunction.js';
import { elideSubjectComplement } from './elideSubjectComplement.js';
import { existentialPlan } from './existentialPlan.js';
import { fuseGovernedVerb } from './fuseGovernedVerb.js';
import { lexicalCopula } from './lexicalCopula.js';
import { asImperfect, imperfectivePast } from './imperfectivePast.js';
import { bindComplements, bindCoreferents, subjectBinding } from './bindCoreferents.js';
import { negativePolarity } from './negativePolarity.js';
import { predicativeGovernor } from './predicativeGovernor.js';
import { passiveGap } from './passiveGap.js';
import { questionSubject } from './questionSubject.js';
import { withQuestionPossessor } from './withQuestionPossessor.js';
import { resolveComplements } from './resolveComplements.js';
import { resolveNounElement } from './resolveNounElement.js';
import { resolveQuestion } from './resolveQuestion.js';
import { resolveVerbPhrase } from './resolveVerbPhrase.js';
import { withAlarmCry } from './withAlarmCry.js';
import { withExistential } from './withExistential.js';

/** Whether `plan`'s infinitive complement is controlled by its direct object (see InfinitiveControl). */
function objectControlled(plan: PhrasePlan): boolean {
  return plan.infinitiveComplement?.control === 'object' && !!plan.directObject;
}

/**
 * An infinitive complement resolved as a clause of its own in the citation mood, its subject filled
 * by the slot of `plan` that controls it (see InfinitiveControl), and marked as object-controlled
 * for the engines that place or agree it differently. A `no` on the controller stays with the
 * matrix clause (see `controlledSubject`).
 */
function resolveInfinitiveComplement(
  plan: PhrasePlan & { infinitiveComplement: InfinitiveComplement },
  language: string,
  lookup: LexiconLookup,
  // The governing verb's forms, for the lexical keys the governed clause reads off it.
  governor?: Record<string, string>,
): ResolvedPhrase {
  const { control: _control, ...clause } = plan.infinitiveComplement;
  const byObject = objectControlled(plan);
  const subject: NounElement = controlledSubject(byObject ? plan.directObject! : plan.subject);
  const resolved = resolvePhrase({ ...clause, subject }, language, lookup, 'infinitive');
  // A governor that takes the **bare** infinitive says so in its lexeme (`infinitive_bare`): English
  // *let* and German *lassen* write no "to" / "zu" and no comma. The flag belongs to the governed
  // clause, which is what renders it, so it is threaded onto that clause's verb phrase here (C36).
  const bare = governor?.['infinitive_bare'] === '1' && resolved.verbPhrase;
  // A governor that takes a **gerund** names it the same way (`complement_form: 'gerund'`): English
  // *stop* and *continue*, Spanish *seguir* — "stops running", "sigue corriendo" (P09-E42).
  const gerund = governor?.['complement_form'] === 'gerund' && resolved.verbPhrase;
  return {
    ...resolved,
    ...(bare ? { verbPhrase: { ...resolved.verbPhrase!, bareInfinitive: true } } : {}),
    ...(gerund ? { verbPhrase: { ...resolved.verbPhrase!, gerundComplement: true } } : {}),
    ...(byObject ? { control: 'object' as const } : {}),
  };
}

/**
 * A content clause resolved as a clause of its own, in the mood its governor names and the tense its
 * governor's shifts it to (A254, see `contentClauseTense`). An `embedded` one is an indirect question
 * (P09-E17): it keeps its force whatever the mood, and is marked for the engines instead of flagged
 * interrogative, so none inverts it or closes it on a question mark.
 */
function resolveContentClause(
  clause: ContentClause,
  language: string,
  lookup: LexiconLookup,
  mood: Mood | undefined,
  governorTense: Tense | undefined,
  embedded = false,
): ResolvedPhrase {
  const shifted = contentClauseTense(governorTense, language, mood, clause.verbPhrase);
  const resolved = resolvePhrase(
    shifted.verbPhrase ? { ...clause, verbPhrase: shifted.verbPhrase } : clause,
    language, lookup, shifted.mood, undefined, false, embedded);
  const marked = embedded ? { ...resolved, embedded: true } : resolved;
  return shifted.imperfect ? asImperfect(marked) : marked;
}

/**
 * Resolve one plan for one language. `mood` is threaded onto the verb phrase — set for the two
 * halves of a conditional (main = 'conditional', condition = 'subjunctive'), for a command
 * ('imperative'), and left undefined for a plain (indicative) sentence. `register` is the
 * addressee register a coordinated command inherits from its first clause; at the top level it
 * is absent and the plan's own `imperativeRegister` applies. The condition and the coordinated
 * clause are resolved recursively.
 */
export function resolvePhrase(
  plan: PhrasePlan,
  language: string,
  lookup: LexiconLookup,
  mood?: Mood,
  register?: ImperativeRegister,
  // A top-level citation phrase (a verb's dictionary form). Its subject is a throwaway the plan
  // carries only to satisfy resolution and never renders, so it must not select a `subject_sense`
  // either: the German citation of EAT is "essen", whoever the plan names (A157). An infinitive
  // COMPLEMENT is the opposite case — its subject is the governing clause's, by subject control, so
  // it does select one ("der Hund wünscht, das Essen zu fressen"), and the flag stops here.
  citation = false,
  // An indirect question (P09-E17, see `resolveContentClause`): the clause's own question holds in
  // whatever mood its governor puts it, and it is not flagged interrogative.
  embedded = false,
): ResolvedPhrase {
  // An existential ("there is a cat", P09-E6 D5) is resolved as the plain clause its language says
  // it with — the pivot the object of the existential verb, the subject the impersonal third person
  // (see `existentialPlan`) — and then marked for the engines, with the pivot's agreement where the
  // verb agrees with it (see `withExistential`). Everything else, the complements, the tense, the
  // question, the clauses around it, is any clause's.
  if (plan.existential) {
    return withExistential(
      resolvePhrase(existentialPlan(plan, language, mood), language, lookup, mood, register, citation), language);
  }
  // Every clause resolved here has a subject: the plan's own, a command's coordinate its first
  // clause's addressee, an infinitive or a purpose its controller's. One without is a malformed plan
  // (a coordinate, an if-clause or a subordinate clause holding only its verb phrase), refused by
  // name rather than left to die on a TypeError in the noun resolver (A267). `/api/translate` says the
  // same with the field's path.
  if (!plan.subject) throw new Error('a clause needs a subject: plan.subject.concept is required (A267)');
  const imperative = mood === 'imperative';
  const impRegister = imperative ? (register ?? plan.imperativeRegister) : undefined;
  // A yes/no question is a statement's clause with another force, so it holds only where the mood is
  // indicative: a condition, a command or a citation keeps its own and drops the flag. A wh-question
  // (`questionRole`) implies the flag, and is the same force with a gap (P09-E6).
  const question = (!!plan.interrogative || !!plan.questionRole) && (mood === undefined || embedded);
  const gap = resolveQuestion(plan, question);
  // An indefinite pronoun takes its negative form under negation — *something* is *anything* /
  // *niente* / 何も there (see `negativePolarity`, C32). The clause's polarity is this one: the
  // finite element's, or, under a modal, the governed group's.
  const clauseNegative = plan.verbPhrase?.negative === true
    || plan.verbPhrase?.modals?.some((m) => typeof m !== 'string' && m.negative === true) === true;
  // A **possessor** question keeps the slot it asks inside, and swaps that noun's possessor for the
  // question stand-in each engine writes as *whose* (P09-E14, see `withQuestionPossessor`).
  const possessed = gap?.role === 'possessor' ? gap.possessed : undefined;
  // The subject is resolved **first**: a possessor elsewhere in the clause may be a link to it
  // (P11-E2, see `bindCoreferents`), and one inside the subject itself would point at itself.
  const resolvedSubject = withQuestionPossessor(
    negativePolarity(resolveNounElement(bindCoreferents(plan.subject, undefined, 'subject'), language, lookup), clauseNegative, true)!,
    possessed === 'subject');
  // A **content clause** fills the subject slot, and what agrees with it agrees with a clause, not
  // with the throwaway noun the plan carries there: 3rd singular, and masculine where the language
  // genders a predicate adjective ("è giusto che si agisca", not "è giusta" — C30).
  // A **subject** wh-question agrees with its question word, not with the throwaway its plan carries
  // there: "who eats", "chi mangia", "wer isst" (P09-E6, see `questionSubject`).
  const subject = gap?.role === 'subject'
    ? questionSubject(gap)
    : plan.contentSubject
      ? { ...resolvedSubject, agreement: { person: '3', number: 'singular', gender: 'masc' } }
      : resolvedSubject;
  // What a possessor linked to the subject stands for in this language — the subject's person, number
  // and gender, as whatever agrees with the subject reads them (P11-E2). The object and the
  // complements are bound to it before they resolve; the clauses this one links bind to their own.
  const binding = subjectBinding(subject, plan.subject);
  const complements = bindComplements(plan.complements, binding);
  // A verbless period (bare noun phrase) has no verb phrase to resolve; the engines
  // render just the subject when it is absent. Resolved before the rest, because a complement
  // reads the verb's lexeme for the word it links an object predicative with.
  const verbPhrase = plan.verbPhrase
    ? {
        // The subject's forms select a `subject_sense` where the lexeme names one (A157); a
        // coordination is read off its group agreement, an animal only when every conjunct is one.
        ...resolveVerbPhrase(
          plan.verbPhrase, language, lookup, mood, impRegister,
          // A direct-object question gaps the object the verb still takes, as a relative does ("what
          // does the cat eat?") — and under the passive that gapped object is the patient to promote
          // ("what is eaten by the cat?", P09-E16).
          !!plan.directObject || gap?.role === 'directObject',
          citation ? undefined : subject.agreement,
          // Governing an infinitive selects an `infinitive_sense` (P09-E43): TELL_ORDER for TELL.
          !!plan.infinitiveComplement,
        ),
        ...(question && !embedded ? { interrogative: true } : {}),
      }
    : undefined;
  // The alarm a cry raises has no determiner slot, so the one the plan carries is dropped (A163).
  const directObject = plan.directObject
    ? withQuestionPossessor(negativePolarity(
        withAlarmCry(resolveNounElement(bindCoreferents(plan.directObject, binding, 'directObject'), language, lookup), verbPhrase?.verb, language),
        clauseNegative,
      )!, possessed === 'directObject')
    : undefined;
  // A passive re-maps the clause's core arguments (A01). The patient becomes the grammatical
  // subject — it drives the verb's agreement, and a Romance participle agrees with it — the object
  // slot is emptied, and the agent is demoted to the by-phrase. `resolveVerbPhrase` has already
  // checked that there is something to promote, so a `'passive'` here always has a `directObject`.
  //
  // A **generic** agent is demoted to nothing at all: no language says *by one* / *da si* / *von
  // man*, and a plan whose agent is the generic person is exactly the one that wants the plain
  // agentless passive ("the food is eaten", "das Futter wird gegessen").
  //
  // A **passive wh-question** (P09-E16) moves its gap with the slots (`passiveGap`): a patient gapped
  // as the object is the subject now, the wordless third-singular stand-in a subject question has
  // ("what **is** eaten", never "are", whatever the answer), and an agent gapped as the subject is the
  // by-phrase's gap, so there is no agent to speak. A plan asking a passive the verb cannot take — an
  // intransitive, or an object the language takes with a preposition — is refused rather than asked
  // in the active, where its gap would name the other slot.
  if (gap && plan.verbPhrase?.voice === 'passive' && verbPhrase?.voice !== 'passive') {
    throw new Error(`a passive wh-question needs a verb that takes the passive in ${language} (P09-E16)`);
  }
  const passive = verbPhrase?.voice === 'passive' && (!!directObject || gap?.role === 'directObject');
  if (passive && gap?.role === 'possessor' && gap.possessed === 'subject') {
    throw new Error('a possessor question inside a passive\'s agent is not built (P09-E16)');
  }
  const asked = gap && passive
    ? gap.role === 'possessor' ? { ...gap, possessed: 'subject' as const } : { ...gap, role: passiveGap(gap.role) }
    : gap;
  const patient = passive ? directObject ?? questionSubject(gap!) : undefined;
  const generic = subject.agreement['generic'] === '1';
  // An **experiencer verb** re-maps the clause too, and in the same way a passive does — the
  // difference is that the plan never asks for it: it is lexical. Italian *piacere* and Spanish
  // *gustar* make the thing liked the grammatical **subject**, which the verb then agrees with ("al
  // gatto piacciono i cani"), and put the one who likes in the **dative**, where every other
  // language makes it the subject of a plain transitive verb ("the cat likes the dogs"). The plan
  // stays "cat likes dog" everywhere, so the builder never changes; the lexeme says which languages
  // turn it round (`experiencer`), and here is where they do — the experiencer becoming the
  // `terminus` complement, the bare dative it already renders as (localization C34).
  //
  // A **generic** experiencer is dropped there rather than rendered, exactly as a generic agent is
  // under the passive: no language says *piace a si*. What is left is the plain citation of the verb
  // ("piacere", "gustar"), which cannot name the thing liked because that thing is its subject and a
  // citation has none — a fact about Italian and Spanish, not a gap in the plan.
  const experiencer = !passive && !!directObject && verbPhrase?.verb.forms['experiencer'] === '1';
  const resolved: ResolvedPhrase = {
    subject: passive ? patient! : experiencer ? directObject! : subject,
    // A clause object may leave the addressee bare, where the verb's lexeme says so (P09-E4).
    // An object controller takes the case the governing verb's lexeme names for it (P09-E43).
    verbPhrase: controllerCase(clauseAddressee(verbPhrase, !!plan.contentObject && !plan.directObject), language, objectControlled(plan)),
    directObject: passive || experiencer ? undefined : directObject,
    ...(passive && !generic && asked?.role !== 'agent' ? { agent: subject } : {}),
    ...(asked ? { question: asked } : {}),
    complements: experiencer && !generic
      ? { ...resolveComplements(complements, language, lookup, verbPhrase?.verb.forms), terminus: { phrase: subject } }
      : resolveComplements(complements, language, lookup, verbPhrase?.verb.forms),
    // An infinitive complement is a clause of its own in the infinitive mood. Its subject is the
    // slot of this clause that controls it — this clause's own subject by default ("the cat desires
    // to eat" — the cat eats), or its direct object under a causative ("to cause a person to see
    // objects" — the person sees). The infinitive never speaks its subject, but a predicate
    // adjective inside it agrees with it, and Japanese marks an object controller with が inside
    // the clause. Object control with no object to control it falls back to the subject, so the
    // clause always has one to resolve. It may govern one in turn.
    infinitiveComplement: plan.infinitiveComplement
      ? resolveInfinitiveComplement(
          { ...plan, infinitiveComplement: plan.infinitiveComplement }, language, lookup, verbPhrase?.verb.forms)
      : undefined,
    // A content clause standing where the subject would ("it is right that one acts", C30): a clause
    // of its own, in the mood its predicate adjective's lexeme names (P09-E4, see `contentClauseMood`).
    // It never asks there: its question fields are dropped (A272).
    contentSubject: plan.contentSubject
      ? resolveContentClause(declarativeClause(plan.contentSubject), language, lookup,
        contentClauseMood(predicativeGovernor(plan, language, lookup), language, 'subject'), plan.verbPhrase?.tense)
      : undefined,
    // A content clause standing where the object would ("says that the cat runs", P09-E4): a clause
    // of its own, in the mood the governing verb's lexeme names — the indicative unless it says
    // otherwise, or, the verb negated, the mood it names under a negation ("no cree que corra",
    // A247). The verb is not in scope where the clause renders, so the choice is made here, where it
    // is. Without a verb there is nothing to govern it, and a verbless period drops it.
    // It may ask — the indirect question, "asks whether the cat runs" (P09-E17) — where the verb's
    // lexeme licenses one, which `contentClauseForce` checks.
    contentObject: plan.contentObject && verbPhrase
      ? resolveContentClause(plan.contentObject, language, lookup,
        contentClauseMood(verbPhrase.verb.forms, language, 'object', plan.verbPhrase?.negative === true),
        plan.verbPhrase?.tense, contentClauseForce(plan.contentObject, verbPhrase.verb))
      : undefined,
    // An adverbial clause ("runs when the cat eats", P09-E4): a clause of its own, in the mood its
    // conjunction governs. It hangs off the predicate, as a purpose does, so a verbless period drops it.
    // Under *while* its past is the imperfect of an event in progress (A250, see `imperfectivePast`);
    // under a temporal conjunction English and German say its future in the present (A251, see
    // `adverbialClauseTense`). The mood is read off the tense the plan names. It never asks (A272).
    adverbialClause: plan.adverbialClause && verbPhrase
      ? {
          conjunction: plan.adverbialClause.conjunction,
          clause: imperfectivePast(
            resolvePhrase(
              {
                ...declarativeClause(plan.adverbialClause.clause),
                verbPhrase: adverbialClauseTense(plan.adverbialClause.conjunction, language, plan.adverbialClause.clause.verbPhrase),
              },
              language, lookup, adverbialClauseMood(
                plan.adverbialClause.conjunction, language, plan.adverbialClause.clause.verbPhrase.tense)),
            plan.adverbialClause.conjunction, language),
        }
      : undefined,
    // A clause of purpose is a clause of its own in the citation mood, its unspoken subject always
    // this clause's own — the one who clicks is the one who changes — so it needs no control. It
    // hangs off the predicate, so a verbless period has nothing to do it for and drops it. A `no`
    // subject negates this clause, not the purpose ("no cat runs not to eat", see `controlledSubject`).
    purpose: plan.purpose && plan.verbPhrase
      ? resolvePhrase({ ...plan.purpose, subject: controlledSubject(plan.subject) }, language, lookup, 'infinitive')
      : undefined,
    // A hypothetical condition: this plan becomes the main clause (conditional mood) and its
    // `condition` the protasis (subjunctive mood). Conditions don't nest.
    condition: plan.condition
      ? resolvePhrase(plan.condition, language, lookup, 'subjunctive')
      : undefined,
    // A coordinated second clause; the conjunction word is chosen per-engine at render time.
    // Coordination is a symmetric join, so the second clause carries the same illocutionary
    // force as the first: under a command it is resolved in the imperative mood too, with the
    // first clause's register and addressee (its own subject is dropped from the surface, so
    // taking the first's keeps the pair addressed to one and the same person). A question's second
    // clause is a question too, and a statement's a statement, whatever its own plan says. A
    // conditional main clause coordinates a plain indicative clause. Coordination doesn't nest.
    coordination: plan.coordination
      ? {
          conjunction: coordConjunction(plan.coordination.conjunction, imperative),
          clause: resolvePhrase(
            imperative
              ? { ...plan.coordination.clause, subject: plan.subject }
              // The wh-gap is this clause's alone: the clause beside it is a yes/no question (P09-E6).
              : { ...plan.coordination.clause, interrogative: question, questionRole: undefined },
            language,
            lookup,
            imperative ? 'imperative' : undefined,
            impRegister,
          ),
        }
      : undefined,
  };
  // A bare copula elides the subject complement of the clause before it (A121). The main clause looks
  // back to its protasis first, so a coordinated clause can then look back to a main clause that
  // itself elides one.
  // German *weiter-* and Japanese 〜続ける fuse the governing verb with the one it governs (P09-E42).
  // A predicate adjective may name the verb it is said with in place of BE (P09-E31).
  const fused = lexicalCopula(fuseGovernedVerb(resolved, language), language, lookup);
  const main = fused.condition ? elideSubjectComplement(fused, fused.condition) : fused;
  return main.coordination
    ? { ...main, coordination: { ...main.coordination, clause: elideSubjectComplement(main.coordination.clause, main) } }
    : main;
}
