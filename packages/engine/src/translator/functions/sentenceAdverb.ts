import type { ConceptForms, Mood, ResolvedPhrase } from '../../types.js';

/**
 * A **sentence adverb** (`subtype: 'sentence'` — *maybe, probably, actually, of course*) comments on
 * the whole clause and stands outside its negation: "maybe the cat did not eat", *forse il gatto non
 * mangiò*, *vielleicht fraß der Kater das Essen nicht* (P09-E39). It has that slot only at the head
 * of a main statement, where `liftSentenceAdverb` moves it out of the verb phrase.
 *
 * Everywhere else — a question, a command, a condition, a relative, content or adverbial clause — it
 * has no clause-initial slot to take ("*maybe did the cat eat?"), and it stands where a frequency
 * adverb does, inside the verb group: "did the cat maybe eat?", *hat der Kater vielleicht gefressen?*,
 * "…that the cat maybe eats". So the verb phrase resolves it as one, flagged `sentence` so the lift
 * can find it again.
 */
export function asFrequencyAdverb(modifier: ConceptForms | undefined): ConceptForms | undefined {
  if (modifier?.forms['subtype'] !== 'sentence') return modifier;
  return { ...modifier, forms: { ...modifier.forms, subtype: 'frequency', sentence: '1' } };
}

/**
 * Move a main statement's sentence adverb out of its verb phrase into `sentenceAdverb`, which each
 * engine writes at the head of the clause (German as its first constituent, inverting; French
 * *peut-être* with *que*; Japanese after the topic). `resolved` is the top clause; the lift happens
 * only where the clause is a plain indicative statement with no condition attached — the one frame
 * in which the adverb opens the sentence.
 *
 * A lexeme may ask the clause for a mood (`mood: 'subjunctive'`): Portuguese *talvez* ahead of its
 * verb takes the subjunctive, *talvez o gato coma*, and a past event the perfect one, *talvez o gato
 * não tenha comido* (P09-E39 D2).
 */
export function liftSentenceAdverb(resolved: ResolvedPhrase, topMood?: Mood): ResolvedPhrase {
  const vp = resolved.verbPhrase;
  const modifier = vp?.modifier;
  if (!vp || modifier?.forms['sentence'] !== '1') return resolved;
  // The clause's own mood, not the verb phrase's: a negated statement may already be in the
  // subjunctive its adverb asked for (see `preverbalSentenceMood`), and the shift below is the same.
  if (vp.interrogative || topMood !== undefined) return resolved;
  const { sentence: _sentence, ...forms } = modifier.forms;
  const adverb: ConceptForms = { ...modifier, forms: { ...forms, subtype: 'sentence' } };
  return {
    ...resolved,
    sentenceAdverb: adverb,
    verbPhrase: { ...vp, modifier: undefined, ...(forms['mood'] === 'subjunctive' ? subjunctive(vp) : {}) },
  };
}

type Vp = NonNullable<ResolvedPhrase['verbPhrase']>;

/**
 * The subjunctive a sentence adverb asks for (`mood: 'subjunctive'`, Portuguese *talvez*) where it
 * stays inside the clause and still precedes its verb: under a finite negation it outscopes, it
 * stands in front of the negator (`negative_slot`), so "o cão diz que o gato **talvez não coma**",
 * "o gato que talvez não coma", "o gato talvez não tenha comido?" (P09-E39 follow-up). Affirmative,
 * it follows the verb ("diz que o gato come talvez"), and the verb keeps the indicative, as D2 has
 * it. A clause already in a mood of its own — a command, a condition, a citation, a governed
 * subjunctive — and a modal chain are left alone; so is every lexeme that asks for no mood.
 */
export function preverbalSentenceMood(vp: Vp): Partial<Vp> {
  const forms = vp.modifier?.forms;
  if (forms?.['sentence'] !== '1' || forms['mood'] !== 'subjunctive') return {};
  if (vp.mood !== undefined || vp.modals.length > 0 || vp.negative !== true) return {};
  const slot = forms['negative_slot'];
  return slot === 'pre-negator' || slot === 'pre-negation' ? subjunctive(vp) : {};
}

/**
 * The subjunctive a sentence adverb puts its clause in: the present for a present or future event,
 * the present perfect for a past one (*tenha comido*), and the pluperfect for a past perfect
 * (*tivesse comido*).
 */
function subjunctive(vp: Vp): Partial<Vp> {
  const tense = vp.tense ?? 'present';
  const aspect = vp.aspect ?? 'neutral';
  if (tense === 'past' && aspect === 'resultative') return { mood: 'subjunctive', tense: 'past' };
  if (tense === 'past' && aspect === 'neutral') return { mood: 'presentSubjunctive', tense: 'present', aspect: 'resultative' };
  return { mood: 'presentSubjunctive', tense: 'present' };
}
