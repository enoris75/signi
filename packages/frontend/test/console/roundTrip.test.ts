// The round-trip invariant (P02 §3, "Canonical printing"): for every reachable state,
//
//     apply(empty, parse(print(state))) ≡ state
//
// States are reached the way a user reaches them — by a random walk of the canvas's own reducers and
// link rules from an empty workspace — so the generator can only make what the canvas can make.
import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import {
  CAUSE_SENTIMENTS,
  COORD_CONJUNCTIONS,
  DEFINITENESS,
  DEGREES,
  MODIFIER_RELATIONS,
  PATH_SPECIFIERS,
  canCoordinateImperative,
} from '@signi/shared';
import {
  builderNounAddress,
  conjunctAddress,
  possessorAddress,
  type NounAddress,
  type NounKey,
  type PhraseSelection,
  type SlotKey,
} from '../../src/components/PhraseBuilder/interfaces.ts';
import * as R from '../../src/components/PhraseBuilder/phraseReducers.ts';
import * as L from '../../src/components/PhraseBuilder/linkRules.ts';
import { adjectiveSlots, BOX_COMPLEMENT_TYPES, COORDINABLE_NOUN_KEYS, MODAL_SLOTS, modalAdverbFor } from '../../src/components/PhraseBuilder/slots.ts';
import { applyScript } from '../../src/console/language/apply.ts';
import { normalizeWorkspace } from '../../src/console/language/normalize.ts';
import { printWorkspace } from '../../src/console/language/print.ts';
import type { Vocabulary, WorkspaceState } from '../../src/console/language/types.ts';
import { ADJECTIVES, ADVERBS, EN, IT, NOUNS, PRONOUNS, VERBS, byId } from './vocab.ts';
import { empty, ids } from './helpers.ts';

// ── A seeded random walk ─────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const pick = <T,>(rng: Rng, xs: readonly T[]): T | undefined => (xs.length ? xs[Math.floor(rng() * xs.length)] : undefined);

const PLAIN_VERBS = VERBS.filter((v) => !v.modal);
const MODALS = VERBS.filter((v) => v.modal);

/** A pronoun as the chooser would pick it: its person, and a number and gender for it. */
function pronounPick(rng: Rng): { concept: Concept; opts?: R_Opts } {
  const concept = pick(rng, PRONOUNS)!;
  if (concept.id === 'GENERIC_PERSON') return { concept };
  const genders = concept.person === '3' ? (['masc', 'fem', 'neut'] as const) : (['masc', 'fem'] as const);
  return {
    concept,
    opts: { number: pick(rng, ['singular', 'plural'] as const)!, gender: pick(rng, genders)! },
  };
}
type R_Opts = { number?: 'singular' | 'plural'; gender?: 'masc' | 'fem' | 'neut' };

/** A word for a slot, from the categories its picker offers. */
function wordFor(rng: Rng, slot: SlotKey, frame: 'period' | 'possessor' | 'conjunct'): { concept: Concept; opts?: R_Opts } {
  const nounOrPronoun = () => (rng() < 0.25 ? pronounPick(rng) : { concept: pick(rng, NOUNS)! });
  if (slot === 'subject') return frame === 'possessor' ? { concept: pick(rng, NOUNS)! } : nounOrPronoun();
  if (slot === 'directObject' || slot === 'cause') return nounOrPronoun();
  if (slot === 'predicative') return { concept: rng() < 0.5 ? pick(rng, ADJECTIVES)! : pick(rng, NOUNS)! };
  return { concept: pick(rng, NOUNS)! };
}

// The noun heads of a period, however deep — period nouns, possessor heads, conjunct heads.
function nounHeads(root: PhraseSelection): { address: NounAddress; frame: 'period' | 'possessor' | 'conjunct' }[] {
  const out: { address: NounAddress; frame: 'period' | 'possessor' | 'conjunct' }[] = [];
  const walk = (sel: PhraseSelection, slice: NounAddress | undefined, frame: 'period' | 'possessor' | 'conjunct', keys: NounKey[]) => {
    for (const which of keys) {
      if (!sel[which]) continue;
      const address = builderNounAddress(slice, which);
      out.push({ address, frame });
      const poss = sel[`${which}Possessor` as keyof PhraseSelection] as PhraseSelection | undefined;
      if (poss) walk(poss, possessorAddress(address), 'possessor', ['subject']);
      R.conjunctsOf(sel, which).forEach((c, i) => walk(c, conjunctAddress(address, i), 'conjunct', ['subject']));
    }
  };
  walk(root, undefined, 'period', ['subject', 'directObject', ...BOX_COMPLEMENT_TYPES]);
  return out;
}

type Op = (s: WorkspaceState, rng: Rng, id: () => string) => WorkspaceState | undefined;

const onPeriod =
  (fn: (sel: PhraseSelection, rng: Rng, s: WorkspaceState, cid: string) => PhraseSelection | undefined): Op =>
  (s, rng) => {
    const c = pick(rng, s.containers)!;
    const next = fn(c.selection, rng, s, c.id);
    if (!next) return undefined;
    return { ...s, containers: s.containers.map((x) => (x.id === c.id ? { ...x, selection: next } : x)) };
  };

// A container that a link points into, whose nouns must stay where the link found them.
const isLinked = (s: WorkspaceState, cid: string) =>
  s.links.some((l) => l.source.containerId === cid || l.target.containerId === cid);

// An instrument held as a thing is a noun phrase: its period shows no verb box to fill.
const isObjectInstrument = (s: WorkspaceState, cid: string) =>
  s.links.some((l) => l.kind === 'instrumental' && l.target.containerId === cid && (l.level ?? 'object') === 'object');

// The words a link stands on are left as the link found them. Changing them afterwards is something
// the canvas allows — re-picking a clause's head as a pronoun, lowering an instrument that has a
// verb back to a thing — but it leaves a link no pick could make, which the console, holding to
// the pick's rules, rightly refuses to rebuild (see the plan's notes on phase 1).
const OPS: Op[] = [
  onPeriod((sel, rng, s, cid) => {
    if (isLinked(s, cid) && sel.subject) return undefined;
    const w = wordFor(rng, 'subject', 'period');
    return R.applyConceptSelect(sel, 'subject', w.concept, w.opts);
  }),
  onPeriod((sel, rng, s, cid) =>
    (isLinked(s, cid) && sel.verb) || isObjectInstrument(s, cid) ? undefined : R.applyConceptSelect(sel, 'verb', pick(rng, PLAIN_VERBS)!),
  ),
  onPeriod((sel, rng, s, cid) => {
    if (!sel.verb || sel.verb.transitivity === 'intransitive') return undefined;
    if (isLinked(s, cid) && sel.directObject) return undefined;
    const w = wordFor(rng, 'directObject', 'period');
    return R.applyConceptSelect(sel, 'directObject', w.concept, w.opts);
  }),
  onPeriod((sel, rng, s, cid) => {
    const type = pick(rng, (sel.verb?.complements ?? []).filter((t) => t !== 'instrumental'));
    if (!type || (isLinked(s, cid) && sel[type as SlotKey])) return undefined;
    const w = wordFor(rng, type as SlotKey, 'period');
    return R.applyConceptSelect(sel, type as SlotKey, w.concept, w.opts);
  }),
  // Adjectives and noun modifiers, on any noun head.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel));
    if (!head) return undefined;
    return R.updateNounAt(sel, head.address, (slice, which) => {
      if (slice[which]?.role !== 'noun') return slice;
      const slot = adjectiveSlots(which).find((k) => !slice[k]);
      if (!slot) return slice;
      return R.applyConceptSelect(slice, slot, rng() < 0.7 ? pick(rng, ADJECTIVES)! : pick(rng, NOUNS)!);
    });
  }),
  // The settings of an adjective slot: a degree, or a modifier's number, relation and own adjective.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel));
    if (!head) return undefined;
    return R.updateNounAt(sel, head.address, (slice, which) => {
      const slot = pick(rng, adjectiveSlots(which).filter((k) => slice[k]));
      if (!slot) return slice;
      const a = slice[slot]!;
      if (a.role === 'adjective') return R.setDegree(slice, slot, pick(rng, DEGREES)!);
      const r = rng();
      if (r < 0.33) return R.setModifierNumber(slice, slot, pick(rng, ['singular', 'plural'] as const)!);
      if (r < 0.66) return R.setModifierRelation(slice, slot, pick(rng, MODIFIER_RELATIONS)!);
      return R.setModifierAdjective(slice, slot, pick(rng, ADJECTIVES)!);
    });
  }),
  // Number, gender, determiner, specifier, sentiment, predicate degree on a noun head.
  onPeriod((sel, rng) => {
    const head = pick(rng, nounHeads(sel));
    if (!head) return undefined;
    return R.updateNounAt(sel, head.address, (slice, which) => {
      const c = slice[which]!;
      const r = rng();
      if (r < 0.25 && c.role !== 'adjective') return R.toggleNumber(slice, which);
      if (r < 0.45 && (c.role === 'pronoun' || c.gendered)) return R.toggleGender(slice, which);
      if (r < 0.65 && c.role === 'noun' && (which === 'subject' || which === 'directObject' || ['predicative', 'terminus', 'locative', 'direction', 'source', 'route'].includes(which) || (which === 'manner' && c.mannerRelation !== 'measure')))
        return R.setDefiniteness(slice, which, pick(rng, DEFINITENESS)!);
      if (r < 0.75 && (which === 'route' || which === 'locative') && head.frame === 'period')
        return R.setSpecifier(slice, pick(rng, PATH_SPECIFIERS)!, which);
      if (r < 0.85 && which === 'cause' && head.frame === 'period') return R.setSentiment(slice, pick(rng, CAUSE_SENTIMENTS)!);
      if (which === 'predicative' && c.role === 'adjective') return R.setDegree(slice, 'predicative', pick(rng, DEGREES)!);
      return slice;
    });
  }),
  // The verb's own settings.
  onPeriod((sel, rng) => {
    const r = rng();
    const finite = !(sel.imperative || sel.infinitive);
    if (r < 0.3 && finite) return R.cycleTense(sel);
    if (r < 0.5 && finite) return R.cycleAspect(sel);
    // The voice, which only a verb with a patient has (the satellite is gated on it too). It does
    // not sit in the finite slot — an infinitive keeps its passive — so only a command rules it out.
    if (
      r < 0.6 &&
      !sel.imperative &&
      (sel.verb?.transitivity === 'transitive' || sel.verb?.transitivity === 'ditransitive')
    ) {
      return R.cycleVoice(sel);
    }
    if (r < 0.75) return R.toggleNegative(sel);
    return R.applyConceptSelect(sel, 'modifier', pick(rng, ADVERBS)!);
  }),
  // Modals and their adverbs.
  onPeriod((sel, rng) => {
    if (!sel.verb || sel.imperative || sel.infinitive) return undefined;
    const free = MODAL_SLOTS.find((k) => !sel[k]);
    if (free && rng() < 0.6) return R.applyConceptSelect(sel, free, pick(rng, MODALS)!);
    const modal = pick(rng, MODAL_SLOTS.filter((k) => sel[k]));
    return modal ? R.applyConceptSelect(sel, modalAdverbFor(modal)!, pick(rng, ADVERBS)!) : undefined;
  }),
  // A possessor, named or pointed to.
  onPeriod((sel, rng) => {
    const heads = nounHeads(sel).filter((h) => R.nounSliceAt(sel, h.address) && (() => {
      const at = R.nounSliceAt(sel, h.address)!;
      return at.slice[at.which]?.role === 'noun';
    })());
    const head = pick(rng, heads);
    if (!head) return undefined;
    if (rng() < 0.7) return R.updateNounAt(sel, head.address, (s, which) => R.updatePossessor(s, which, (p) => R.applyConceptSelect(p, 'subject', pick(rng, NOUNS)!)));
    const antecedent = pick(rng, nounHeads(sel).filter((h) => h.address !== head.address && !h.address.startsWith(`${head.address}/`)));
    return antecedent ? R.updateNounAt(sel, head.address, (s, which) => R.setPossessorRef(s, which, antecedent.address)) : undefined;
  }),
  // A conjunct, and a word and settings for it.
  onPeriod((sel, rng) => {
    const which = pick(rng, COORDINABLE_NOUN_KEYS.filter((k) => sel[k]));
    if (!which) return undefined;
    let next = R.addConjunct(sel, which);
    const i = R.conjunctsOf(next, which).length - 1;
    if (rng() < 0.9) {
      const w = wordFor(rng, 'subject', 'conjunct');
      next = R.updateConjunct(next, which, i, (c) => R.applyConceptSelect(c, 'subject', w.concept, w.opts));
    }
    if (rng() < 0.3) next = R.cycleNounConjunction(next, which);
    return next;
  }),
  // A mood, unless a clause-level link fixes it.
  (s, rng) => {
    const c = pick(rng, s.containers)!;
    const locked = s.links.some((l) => (l.kind === 'conditional' || l.kind === 'coordinative') && (l.source.containerId === c.id || l.target.containerId === c.id));
    if (locked) return undefined;
    const r = rng();
    let sel = c.selection;
    if (r < 0.4) {
      sel = R.toggleImperative(sel);
      if (sel.imperative) {
        sel = R.setImperativePerson(sel, pick(rng, ['2sg', '1pl', '2pl'] as const)!);
        if (rng() < 0.4) sel = R.setImperativeRegister(sel, 'instruction');
      }
    } else if (r < 0.7) sel = R.toggleInfinitive(sel);
    else return undefined;
    return { ...s, containers: s.containers.map((x) => (x.id === c.id ? { ...x, selection: sel } : x)) };
  },
  // Another period.
  (s, _rng, id) => ({ ...s, containers: [...s.containers, { id: id(), selection: {} }] }),
  // Links between periods, made only where a pick could make them.
  (s, rng, id) => {
    const source = pick(rng, s.containers)!;
    const target = pick(rng, s.containers)!;
    const r = rng();
    if (r < 0.4) {
      const from = pick(rng, nounHeads(source.selection).filter((h) => {
        const at = R.nounSliceAt(source.selection, h.address)!;
        return at.slice[at.which]?.role === 'noun';
      }));
      const nounKey = pick(rng, (['subject', 'directObject', ...BOX_COMPLEMENT_TYPES] as NounKey[]).filter((k) => target.selection[k]));
      if (!from || !nounKey) return undefined;
      const t = { containerId: target.id, nounKey };
      if (!L.canBeRelativeTarget(s.containers, s.links, source.id, t)) return undefined;
      return { ...s, links: L.addRelativeLink(s.links, { containerId: source.id, nounKey: from.address }, t, id()) };
    }
    if (r < 0.6) {
      if (!L.canStartCondition(s.links, source) || !L.canBeCondition(s.links, source.id, target.id)) return undefined;
      return { ...s, links: L.addConditional(s.links, source.id, target.id, id()) };
    }
    if (r < 0.8) {
      const conj = pick(rng, COORD_CONJUNCTIONS.filter((c) => !source.selection.imperative || canCoordinateImperative(c)))!;
      if (!L.canStartCoordination(s.links, source) || !L.canBeCoordinate(s.containers, s.links, source.id, target.id)) return undefined;
      return { ...s, links: L.addCoordinative(s.links, source.id, target.id, conj, id()) };
    }
    if (!source.selection.verb?.complements?.includes('instrumental')) return undefined;
    if (!L.canBeInstrument(s.containers, s.links, source.id, target.id)) return undefined;
    return { ...s, links: L.addInstrumental(s.links, source.id, target.id, id()) };
  },
  // An instrument's level, and — raised to an act — a verb for it.
  (s, rng) => {
    const link = pick(rng, s.links.filter((l) => l.kind === 'instrumental'));
    if (!link) return undefined;
    const level = pick(rng, ['process', 'concept', 'object'] as const)!;
    const target = s.containers.find((c) => c.id === link.target.containerId)!;
    if (level === 'object' && target.selection.verb) return undefined;
    let next = { ...s, links: L.setInstrumentalLevel(s.links, link.source.containerId, level) };
    if (level !== 'object' && rng() < 0.5) {
      next = {
        ...next,
        containers: next.containers.map((c) =>
          c.id === link.target.containerId ? { ...c, selection: R.applyConceptSelect(c.selection, 'verb', pick(rng, PLAIN_VERBS.filter((v) => v.transitivity !== 'intransitive'))!) } : c,
        ),
      };
    }
    return next;
  },
  // Clearing: an adjective, a modal, a possessor, a conjunct — never a word a link stands on.
  onPeriod((sel, rng, s, cid) => {
    if (isLinked(s, cid)) return undefined;
    const r = rng();
    const head = pick(rng, nounHeads(sel));
    if (r < 0.3 && head)
      return R.updateNounAt(sel, head.address, (slice, which) => {
        const slot = pick(rng, adjectiveSlots(which).filter((k) => slice[k]));
        return slot ? R.applyClear(slice, slot) : slice;
      });
    if (r < 0.5) {
      const modal = pick(rng, MODAL_SLOTS.filter((k) => sel[k]));
      return modal ? R.applyClear(sel, modal) : undefined;
    }
    if (r < 0.7 && head) return R.updateNounAt(sel, head.address, (slice, which) => R.clearPossessorRef(R.removePossessor(slice, which), which));
    const which = pick(rng, COORDINABLE_NOUN_KEYS.filter((k) => R.conjunctsOf(sel, k).length));
    return which ? R.removeConjunct(sel, which, Math.floor(rng() * R.conjunctsOf(sel, which).length)) : undefined;
  }),
];

function reach(seed: number, steps: number): WorkspaceState {
  const rng = mulberry32(seed);
  const id = (() => {
    let n = 0;
    return () => `g${seed}-${++n}`;
  })();
  let state = empty();
  for (let i = 0; i < steps; i++) {
    const op = pick(rng, OPS)!;
    state = op(state, rng, id) ?? state;
  }
  return state;
}

function roundTrip(state: WorkspaceState, vocab: Vocabulary) {
  const text = printWorkspace(state, vocab);
  const back = applyScript(empty(), text, { context: { containerId: 'p1' }, vocab, newId: ids() });
  return { text, back };
}

describe('the round trip', () => {
  const SEEDS = 400;

  it.each([
    ['English', EN],
    ['Italian', IT],
  ])('gives back every state a random walk of the canvas reaches (%s words)', (_name, vocab) => {
    const failures: string[] = [];
    for (let seed = 1; seed <= SEEDS; seed++) {
      const state = reach(seed, 10 + (seed % 30));
      const { text, back } = roundTrip(state, vocab);
      if (back.diagnostic) {
        failures.push(`seed ${seed}: ${back.diagnostic.message}\n${text}`);
        continue;
      }
      const want = JSON.stringify(normalizeWorkspace(state));
      const got = JSON.stringify(normalizeWorkspace(back.state));
      if (want !== got) failures.push(`seed ${seed}:\n${text}\nwant ${want}\n got ${got}`);
    }
    expect(failures.slice(0, 3)).toEqual([]);
  });

  it('prints a reached state the same way twice', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const state = reach(seed, 25);
      const { text, back } = roundTrip(state, EN);
      expect(printWorkspace(back.state, EN)).toBe(text);
    }
  });
});

// A179. A passive set on a finite period stays when the period is made an infinitive, and the
// translation says it ("to be loved"). But the printer gates the voice as it gates the tense and the
// aspect, on the finite slot being free, so the line it writes has no `/passive` and applies back to
// an active. The random walk reaches this only past 400 seeds (764, 1659 and 2022 of 5,000).
describe('known bugs: A179 a passive infinitive', () => {
  // The canvas's own reducers, in the order a user takes them: a transitive verb and its object, the
  // passive, then the infinitive.
  const passiveInfinitive = (): WorkspaceState => {
    let sel: PhraseSelection = {};
    sel = R.applyConceptSelect(sel, 'verb', byId('LOVE'));
    sel = R.applyConceptSelect(sel, 'directObject', byId('DOG'));
    sel = R.setVoice(sel, 'passive');
    sel = R.setInfinitive(sel, true);
    return { containers: [{ id: 'p1', selection: sel }], links: [] };
  };

  it.each([
    ['English', EN],
    ['Italian', IT],
  ])('gives the passive back (%s words)', (_name, vocab) => {
    const state = passiveInfinitive();
    const { back } = roundTrip(state, vocab);
    expect(back.diagnostic).toBeUndefined();
    expect(normalizeWorkspace(back.state)).toEqual(normalizeWorkspace(state));
  });

  it.each([
    ['English', EN, '/inf /verb ( love /passive ) /obj ( dog )'],
    ['Italian', IT, '/inf /verb ( amare /passive ) /obj ( cane )'],
  ])('writes the passive next to the infinitive (%s words)', (_name, vocab, line) => {
    expect(printWorkspace(passiveInfinitive(), vocab)).toBe(line);
  });

  // The other direction, without the printer: a hand-written `/passive` under `/inf` is accepted.
  it('takes a passive written under the infinitive', () => {
    const back = applyScript(empty(), '/inf /verb ( love /passive ) /obj ( dog )', {
      context: { containerId: 'p1' },
      vocab: EN,
      newId: ids(),
    });
    expect(back.diagnostic).toBeUndefined();
    const sel = back.state.containers[0]!.selection;
    expect(sel.infinitive).toBe(true);
    expect(sel.verbVoice).toBe('passive');
  });

  // Regression: a command is always active, so nothing writes or takes a `/passive` for it.
  it('writes no passive for a command', () => {
    let sel: PhraseSelection = {};
    sel = R.applyConceptSelect(sel, 'verb', byId('LOVE'));
    sel = R.applyConceptSelect(sel, 'directObject', byId('DOG'));
    sel = R.setVoice(sel, 'passive');
    sel = R.setImperative(sel, true);
    const state: WorkspaceState = { containers: [{ id: 'p1', selection: sel }], links: [] };
    const { text, back } = roundTrip(state, EN);
    expect(text).toBe('/command /verb ( love ) /obj ( dog )');
    expect(normalizeWorkspace(back.state)).toEqual(normalizeWorkspace(state));
  });

  // Regression: the same period without the infinitive prints its passive and comes back whole.
  it('gives back the finite passive', () => {
    const state = passiveInfinitive();
    state.containers[0]!.selection = R.setInfinitive(state.containers[0]!.selection, false);
    const { text, back } = roundTrip(state, EN);
    expect(text).toContain('/passive');
    expect(normalizeWorkspace(back.state)).toEqual(normalizeWorkspace(state));
  });
});
