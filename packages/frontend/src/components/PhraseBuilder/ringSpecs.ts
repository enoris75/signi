// What sits on each constituent's rings, and which way each thing faces. The ring layout
// (ringLayout.ts) is pure geometry; this is where the phrase builder's controls and satellites are
// sorted onto it:
//
//  · the solid ring carries the controls about the word — the reveal control for each satellite
//    (facing its disc), the direct toggles (number, gender, polarity) and the clear button;
//  · the orbit carries the satellites. Adjectives and modals are chains: each member is revealed
//    from the one before, so its control rides the orbit in the gap after that member's disc;
//  · the dotted ring carries the controls about the phrase — collapse and remove, the relative-
//    clause / possessor / coordination controls, a complement's relation toolbar, the verb's
//    complement and direct-object toggles — and the ports the lines to the other rings leave from.

import type { UiStringKey } from "@signi/shared";
import type { BoxComplementType } from "./interfaces.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import type { PerimeterEntry } from "./satellites/index.ts";
import type { OrbitChain, Pt, RingAim, RingControl, RingSpec } from "./ringLayout.ts";
import {
  adjectiveSlots,
  MODAL_ADVERB_SLOTS,
  MODAL_SLOTS,
  NOUN_KEYS,
  isModalNegativeField,
} from "./slots.ts";
import type { NounKey } from "./interfaces.ts";

/** One constituent on the canvas: its word, and the satellite nodes shown round it. */
export type GroupDef = {
  // The constituent's English name — and its identity: collapse state, layout rank and the ring's
  // controls are keyed by it, so it never changes with the UI language.
  label: string;
  // The catalog key the constituent is named from in the UI language, where its noun is seeded; it
  // also names the part its collapse toggle expands and compacts (see canvasCommands).
  labelKey?: UiStringKey;
  color: string;
  // The word the rings are centred on (its node's position is the ring's centre).
  mainKey: string;
  // Every node of the constituent, the word first-class among them.
  nodeKeys: string[];
  // Set on complement groups — these carry a control to remove the whole constituent.
  removeKey?: BoxComplementType;
  // A conjunct's ring also carries a remove control: it drops that phrase out of its group.
  removable?: boolean;
  // A word of the period that belongs to no constituent (P09-E47's interjection): its dotted ring
  // carries no control and no port, and no line joins it to the verb phrase — its word's solid ring
  // carries the clear button, and the card's border toggle shows and removes it.
  bare?: boolean;
  // Set on a conjunct's ring as its head's canvas sees it: the head's group label, and which of
  // the head's conjuncts it is. Tidying packs it right after the rings before it in its group.
  conjunct?: { head: string; index: number };
  // Set on an owner's ring the same way: the group it belongs with, and its place there — just after
  // the ring it owns (see possessionsFor).
  owner?: { head: string; index: number };
  // Set on the predicate adjective's standard of comparison the same way (P09-E12 D5): it packs just
  // after the predicative and its conjuncts (see standardSpotFor).
  standard?: { head: string; index: number };
};

export const VERB_PHRASE = "Verb Phrase";

// Clock hours: where each satellite orbits, and where the controls with nothing to face sit.
const HOME = {
  adjective: 12,
  determiner: 6,
  tense: 11,
  aspect: 1,
  // The voice rides the direct object's ring, not the verb's (see `rawSatellites`): on its right,
  // away from the verb the line to it comes from.
  voice: 3,
  modal: 8.5,
  adverb: 4.5,
} as const;
const NUMBER_HOUR = 8;
const GENDER_HOUR = 9;
const POLARITY_HOUR = 7;
const CLEAR_HOUR = 1.5;
const COLLAPSE_HOUR = 10.5;
const REMOVE_HOUR = 1.5;
const INCOMING_HOUR = 12;
const TOOLBAR_HOUR = 12;
const RELATIONS_HOUR = 6;
// The clause's facts that ride a noun's dotted ring (P09-E12): the wh-question's mark with its who /
// what chip, and the subject's existential, which exclude each other and so share the hour — lower
// left, beside the relations and clear of the collapse control above.
const QUESTION_HOUR = 8;
const COMPLEMENTS_HOUR = 6;
const DIRECT_OBJECT_HOUR = 3;
// How far apart, in hours, controls that aim at the same hour are fanned so they keep their order.
const FAN = 0.03;
// A port is a line's end, not a button: it only needs room for its dot.
const PORT_HALF = 6;
const DOT_HALF = 7;

// Keys of the controls that aren't satellite icons (those keep the satellite's own key).
export const clearControlKey = (mainKey: string) => `clear:${mainKey}`;
export const collapseControlKey = (label: string) => `collapse:${label}`;
export const removeControlKey = (label: string) => `remove:${label}`;
export const perimeterControlKey = (
  kind: "relative" | "headless" | "possessor" | "possessorRole" | "standard" | "conjunct" | "incoming" | "question" | "animacy" | "existential" | "gloss" | "glossRelation",
  noun: string,
) => `${kind}:${noun}`;
export const toolbarControlKey = (type: string, value: string) => `toolbar:${type}:${value}`;
export const portKey = (label: string, toward: string) => `port:${label}>${toward}`;

// A modal chain reads outermost first, each modal followed by its own adverb:
// "must probably be able to…".
export const MODAL_CHAIN: string[] = MODAL_SLOTS.flatMap((modal, i) => [modal, MODAL_ADVERB_SLOTS[i]]);

/** The chain a constituent's satellites grow along, in full chain order. */
function chainFor(group: GroupDef): Omit<OrbitChain, "discs"> & { full: string[] } | null {
  if (group.mainKey === "verb") return { full: MODAL_CHAIN, home: HOME.modal, dir: -1 };
  if (NOUN_KEYS.includes(group.mainKey as NounKey))
    return { full: adjectiveSlots(group.mainKey as NounKey), home: HOME.adjective, dir: 1 };
  return null;
}

/** Where a satellite outside any chain orbits, by its key. */
function satelliteHome(key: string): number | undefined {
  if (key.endsWith("Definiteness")) return HOME.determiner;
  if (key === "verbTense") return HOME.tense;
  if (key === "verbAspect") return HOME.aspect;
  if (key === "verbVoice") return HOME.voice;
  if (key === "modifier") return HOME.adverb;
  return undefined;
}

/** Which way a control on the solid ring faces. */
function innerAim(key: string, chain: ReturnType<typeof chainFor>): RingAim {
  if (chain && chain.full[0] === key) return { disc: key, home: chain.home };
  const home = satelliteHome(key);
  if (home !== undefined) return { disc: key, home };
  if (key.endsWith("Number")) return { clock: NUMBER_HOUR };
  if (key.endsWith("Gender")) return { clock: GENDER_HOUR };
  // The verb's polarity and each modal's own take the same hour, each on its own box's ring.
  if (key === "verbNegative" || isModalNegativeField(key)) return { clock: POLARITY_HOUR };
  return { clock: DIRECT_OBJECT_HOUR };
}

// Fan a row of controls about one hour, the first leftmost when the hour is at the bottom of the
// ring (the clock runs right to left there) and rightmost at the top.
const fanned = (hour: number, i: number, n: number, leftFirst: boolean) =>
  hour + (leftFirst ? (n - 1) / 2 - i : i - (n - 1) / 2) * FAN;

export function buildRingSpecs({
  groups,
  compact,
  satelliteIconsByParent,
  complementToggleIcons,
  directObjectToggle,
  perimeterByNoun,
  linkTargetKeys,
  clearable,
  toolbars,
  centerOf,
  linkPorts = {},
  possessorAims = {},
  standardAims = {},
}: {
  groups: GroupDef[];
  // Compact view keeps only the words and their clear buttons.
  compact: boolean;
  satelliteIconsByParent: Record<string, readonly SatelliteIcon[]>;
  complementToggleIcons: readonly SatelliteIcon[];
  directObjectToggle?: SatelliteIcon;
  perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>>;
  // Nouns an incoming relative-clause link lands on.
  linkTargetKeys?: ReadonlySet<string>;
  // Words whose solid ring carries a clear button.
  clearable: ReadonlySet<string>;
  // The relation toolbar each complement wears, by complement: its values, in order.
  toolbars: Partial<Record<BoxComplementType, readonly string[]>>;
  // A constituent's centre on the canvas, in px, by its word's key.
  centerOf: (mainKey: string) => Pt;
  // Ports for the lines joining a coordinated group's rings, by the word whose ring carries them:
  // each faces the ring its line runs to.
  linkPorts?: Record<string, readonly { key: string; toward: Pt }[]>;
  // Where each noun's possessor control faces while the noun has an owner — the owner's ring, or the
  // ring of the noun it points to — by noun: the line to the owner leaves from the control.
  possessorAims?: Record<string, Pt>;
  // Where the predicative's standard control faces while the standard's ring is drawn: that ring, by
  // noun. The line to it leaves from the control (P09-E12 D5).
  standardAims?: Record<string, Pt>;
}): Record<string, RingSpec> {
  const verb = groups.find((g) => g.label === VERB_PHRASE);
  const specs: Record<string, RingSpec> = {};

  for (const group of groups) {
    const { mainKey, label, nodeKeys } = group;
    const shown = new Set(nodeKeys.filter((k) => k !== mainKey));
    const chain = chainFor(group);
    const inner: RingControl[] = [];
    const outer: RingControl[] = [];
    const spec: RingSpec = { satellites: [], chains: [], inner, gaps: [], outer };
    specs[label] = spec;

    if (clearable.has(mainKey)) inner.push({ key: clearControlKey(mainKey), aim: { clock: CLEAR_HOUR } });
    if (compact) continue;

    // ── Orbit ──
    for (const key of shown) {
      if (chain?.full.includes(key)) continue;
      spec.satellites.push({ key, home: satelliteHome(key) ?? HOME.adverb });
    }
    if (chain) {
      const discs = chain.full.filter((k) => shown.has(k));
      if (discs.length > 0) spec.chains.push({ home: chain.home, dir: chain.dir, discs });
      // The control for a chain member rides the gap where its disc sits (or would): right after
      // the last shown member before it in chain order.
      const iconKeys = discs.flatMap((parent) => (satelliteIconsByParent[parent] ?? []).map((icon) => icon.key));
      const gaps = iconKeys
        .filter((key) => chain.full.includes(key))
        .sort((a, b) => chain.full.indexOf(a) - chain.full.indexOf(b));
      for (const key of gaps) {
        const before = chain.full.slice(0, chain.full.indexOf(key)).filter((k) => shown.has(k));
        if (before.length > 0) spec.gaps.push({ key, after: before[before.length - 1] });
      }
      // A control of a chain member that is not itself a member — a modal's own polarity, which
      // flips a value rather than revealing a disc — rides the gap right after the disc it belongs
      // to, beside the controls that reveal what comes next.
      for (const parent of discs) {
        for (const icon of satelliteIconsByParent[parent] ?? []) {
          if (!chain.full.includes(icon.key)) spec.gaps.push({ key: icon.key, after: parent });
        }
      }
    }

    // ── Solid ring ──
    for (const icon of satelliteIconsByParent[mainKey] ?? []) {
      inner.push({ key: icon.key, aim: innerAim(icon.key, chain) });
    }

    // ── Dotted ring ──
    if (group.bare) continue;
    outer.push({ key: collapseControlKey(label), aim: { clock: COLLAPSE_HOUR } });
    if (group.removeKey || group.removable)
      outer.push({ key: removeControlKey(label), aim: { clock: REMOVE_HOUR } });
    for (const port of linkPorts[mainKey] ?? [])
      outer.push({ key: port.key, aim: { point: port.toward }, half: PORT_HALF });

    if (NOUN_KEYS.includes(mainKey as NounKey)) {
      if (linkTargetKeys?.has(mainKey))
        outer.push({ key: perimeterControlKey("incoming", mainKey), aim: { clock: INCOMING_HOUR }, half: DOT_HALF });
      const entry = perimeterByNoun[mainKey as NounKey];
      const ownerAt = entry?.possessor ? possessorAims[mainKey] : undefined;
      if (ownerAt) outer.push({ key: perimeterControlKey("possessor", mainKey), aim: { point: ownerAt } });
      const standardAt = entry?.standard ? standardAims[mainKey] : undefined;
      if (standardAt) outer.push({ key: perimeterControlKey("standard", mainKey), aim: { point: standardAt } });
      const relations = (["relative", "headless", "possessor", "possessorRole", "standard", "conjunct"] as const).filter(
        (kind) => entry?.[kind] && !(kind === "possessor" && ownerAt) && !(kind === "standard" && standardAt),
      );
      relations.forEach((kind, i) =>
        outer.push({
          key: perimeterControlKey(kind, mainKey),
          aim: { clock: fanned(RELATIONS_HOUR, i, relations.length, true) },
        }),
      );
      // A reading and its relation share the hour: only a verbless period has them, and it asks nothing.
      const asks = (["question", "animacy", "existential", "gloss", "glossRelation"] as const).filter((kind) => entry?.[kind]);
      asks.forEach((kind, i) =>
        outer.push({
          key: perimeterControlKey(kind, mainKey),
          aim: { clock: fanned(QUESTION_HOUR, i, asks.length, true) },
        }),
      );
    }

    const toolbar = group.removeKey ? toolbars[group.removeKey] : undefined;
    toolbar?.forEach((value, i) =>
      outer.push({
        key: toolbarControlKey(group.removeKey!, value),
        aim: { clock: fanned(TOOLBAR_HOUR, i, toolbar.length, false) },
      }),
    );

    if (group === verb) {
      // Each complement toggle faces its complement's ring while it is shown — the line to that ring
      // leaves from the toggle — and otherwise waits in a row at the bottom of the ring.
      complementToggleIcons.forEach((icon, i) => {
        const target = groups.find((g) => g.removeKey === icon.key);
        outer.push({
          key: icon.key,
          aim: target
            ? { point: centerOf(target.mainKey) }
            : { clock: fanned(COMPLEMENTS_HOUR, i, complementToggleIcons.length, true) },
        });
      });
      if (directObjectToggle) {
        const object = groups.find((g) => g.mainKey === "directObject");
        outer.push({
          key: directObjectToggle.key,
          aim: object ? { point: centerOf(object.mainKey) } : { clock: DIRECT_OBJECT_HOUR },
        });
      }

      for (const other of groups) {
        if (other === verb || other.bare || verbEnd(other, complementToggleIcons, directObjectToggle) !== null) continue;
        outer.push({ key: portKey(label, other.label), aim: { point: centerOf(other.mainKey) }, half: PORT_HALF });
      }
    } else if (verb) {
      outer.push({ key: portKey(label, VERB_PHRASE), aim: { point: centerOf(verb.mainKey) }, half: PORT_HALF });
    }
  }
  return specs;
}

/**
 * The control on the verb phrase's dotted ring that a line to `group` leaves from — the toggle that
 * shows the group — or null when the line leaves from a plain port.
 */
export function verbEnd(
  group: GroupDef,
  complementToggleIcons: readonly SatelliteIcon[],
  directObjectToggle?: SatelliteIcon,
): string | null {
  if (group.mainKey === "directObject" && directObjectToggle) return directObjectToggle.key;
  if (group.removeKey && complementToggleIcons.some((icon) => icon.key === group.removeKey))
    return group.removeKey;
  return null;
}
