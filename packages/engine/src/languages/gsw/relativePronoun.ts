import type { Case } from './gsw.types.js';

/** The relative complementizer (P10 D10): invariant *wo*, whatever the head's gender, number or role. */
export const RELATIVE_WO = 'wo';

/**
 * The pronoun a relative clause leaves behind where its head is not the subject or the direct object
 * (P10-E11 D2): Swiss German relativises with the invariant *wo*, and a dative or prepositional role
 * keeps a personal pronoun in the clause — "de Maa, wo ich **im** s Buech gib", "d Frau, wo ich **mit
 * ire** rede". It is the third person agreeing with the head: dative *im / ire / im*, plural *ine*;
 * the accusative *in / si / es*, plural *si*. A thing after a preposition becomes a *da*-compound
 * instead (see `resumptive`). German's declined *der / die / das* has no counterpart.
 */
export function relativePronoun(forms: Record<string, string>, _case: Case, plural: boolean): string {
  const gender = forms['gender'] ?? 'neut';
  if (_case === 'dat' || _case === 'gen') return plural ? 'ine' : gender === 'fem' ? 'ire' : 'im';
  return plural ? 'si' : gender === 'masc' ? 'in' : gender === 'fem' ? 'si' : 'es';
}

/**
 * The *da*-compound a preposition makes with a thing (*drin, druf, dermit* …), the resumptive a
 * relative leaves for a prepositional role whose head is not a person: "s Huus, wo ich **drin** wohn"
 * (P10-E11 D2, verify at E14).
 */
export const DA_COMPOUND: Readonly<Record<string, string>> = {
  i: 'drin', uf: 'druf', a: 'dra', us: 'drus', mit: 'dermit', vo: 'dervo', bi: 'derbii', für: 'defür',
  über: 'drüber', under: 'drunder', zu: 'dezue', um: 'drum', nach: 'dernaa', gäge: 'dergäge',
  hinder: 'dehinder', vor: 'devor', dur: 'dedur', zwüsche: 'dezwüsche',
};

/**
 * A relative's resumptive, from the complement text its gap rendered (`<prep> <pronoun>`, or a bare
 * dative pronoun): kept for a person ("mit ire"), a *da*-compound for a thing ("drin").
 */
export function resumptive(text: string, animate: boolean): string {
  const match = /^(\S+) (im|ire|ine|in|si|es)$/.exec(text.trim());
  if (!match || animate) return text.trim();
  return DA_COMPOUND[match[1]!] ?? text.trim();
}
