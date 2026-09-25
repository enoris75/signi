import { describe, expect, it } from 'vitest';
import type { SatelliteIcon } from '../src/components/PhraseBuilder/Boxes.tsx';
import { buildEdges, buildRings, roleGroups } from '../src/components/PhraseBuilder/graph.ts';
import { clock, type RingControl } from '../src/components/PhraseBuilder/ringLayout.ts';
import {
  buildRingSpecs,
  clearControlKey,
  collapseControlKey,
  perimeterControlKey,
  portKey,
  removeControlKey,
  toolbarControlKey,
  VERB_PHRASE,
  type GroupDef,
} from '../src/components/PhraseBuilder/ringSpecs.ts';
import { ALL_SLOTS } from '../src/components/PhraseBuilder/slots.ts';

const icon = (key: string): SatelliteIcon => ({
  key,
  icon: null,
  label: key,
  active: false,
  isSet: false,
  valued: false,
  onToggle: () => {},
});

const CENTERS: Record<string, { x: number; y: number }> = {
  subject: { x: 150, y: 150 },
  verb: { x: 450, y: 150 },
  directObject: { x: 750, y: 150 },
  route: { x: 450, y: 450 },
};
const centerOf = (key: string) => CENTERS[key];

const groups = (shown: string[], visible = ['subject', 'verb', 'directObject']) =>
  roleGroups({
    drawCanvas: true,
    visibleSlots: ALL_SLOTS.filter((s) => visible.includes(s.key)),
    shownMap: Object.fromEntries(shown.map((k) => [k, true])),
  });

function specs(
  defs: GroupDef[],
  overrides: Partial<Parameters<typeof buildRingSpecs>[0]> = {},
) {
  return buildRingSpecs({
    groups: defs,
    compact: false,
    satelliteIconsByParent: {},
    complementToggleIcons: [],
    perimeterByNoun: {},
    clearable: new Set(),
    toolbars: {},
    centerOf,
    ...overrides,
  });
}

const keys = (controls: RingControl[]) => controls.map((c) => c.key);
const aimOf = (controls: RingControl[], key: string) => controls.find((c) => c.key === key)!.aim;

describe('roleGroups', () => {
  it('gathers each constituent round its word, with only its shown satellites', () => {
    const defs = groups(['directObject', 'subjectAdjective', 'verbModal', 'verbModalAdverb', 'verbTense']);

    expect(defs.map((g) => [g.label, g.mainKey, g.nodeKeys])).toEqual([
      ['Subject', 'subject', ['subject', 'subjectAdjective']],
      ['Verb Phrase', 'verb', ['verb', 'verbModal', 'verbModalAdverb', 'verbTense']],
      ['Direct Object', 'directObject', ['directObject']],
    ]);
  });

  it('leaves the object off while its control has it folded away', () => {
    expect(groups([]).map((g) => g.label)).toEqual(['Subject', 'Verb Phrase']);
  });

  it('gives a revealed complement its own constituent, which can be removed', () => {
    const defs = groups(['route', 'routeDefiniteness']);

    expect(defs.find((g) => g.mainKey === 'route')).toMatchObject({
      label: 'Route',
      removeKey: 'route',
      nodeKeys: ['route', 'routeDefiniteness'],
    });
  });
});

describe('buildRingSpecs', () => {
  it("puts a word's reveal controls and toggles on its solid ring, each facing its way", () => {
    const [subject] = groups(['subjectAdjective']);
    const { Subject } = specs([subject], {
      satelliteIconsByParent: {
        subject: ['subjectAdjective', 'subjectNumber', 'subjectGender', 'subjectDefiniteness'].map(icon),
      },
      clearable: new Set(['subject']),
    });

    expect(keys(Subject.inner)).toEqual([
      clearControlKey('subject'),
      'subjectAdjective',
      'subjectNumber',
      'subjectGender',
      'subjectDefiniteness',
    ]);
    expect(aimOf(Subject.inner, 'subjectAdjective')).toEqual({ disc: 'subjectAdjective', home: 12 });
    expect(aimOf(Subject.inner, 'subjectDefiniteness')).toEqual({ disc: 'subjectDefiniteness', home: 6 });
    expect(aimOf(Subject.inner, 'subjectNumber')).toEqual({ clock: 8 });
    expect(aimOf(Subject.inner, 'subjectGender')).toEqual({ clock: 9 });
  });

  it('chains adjectives along the orbit, each next control in the gap after the one before', () => {
    const [subject] = groups(['subjectAdjective', 'subjectAdjective2']);
    const { Subject } = specs([subject], {
      satelliteIconsByParent: {
        subjectAdjective: [icon('subjectAdjective2')],
        subjectAdjective2: [icon('subjectAdjective3')],
      },
    });

    expect(Subject.chains).toEqual([{ home: 12, dir: 1, discs: ['subjectAdjective', 'subjectAdjective2'] }]);
    expect(Subject.gaps).toEqual([
      { key: 'subjectAdjective2', after: 'subjectAdjective' },
      { key: 'subjectAdjective3', after: 'subjectAdjective2' },
    ]);
  });

  it("seats a modal's adverb right after its modal, and the next modal after the adverb", () => {
    const shownAdverb = specs(groups(['verbModal', 'verbModalAdverb']), {
      satelliteIconsByParent: { verbModal: [icon('verbModal2'), icon('verbModalAdverb')] },
    })[VERB_PHRASE];

    expect(shownAdverb.chains).toEqual([{ home: 8.5, dir: -1, discs: ['verbModal', 'verbModalAdverb'] }]);
    expect(shownAdverb.gaps).toEqual([
      { key: 'verbModalAdverb', after: 'verbModal' },
      { key: 'verbModal2', after: 'verbModalAdverb' },
    ]);

    // Folded away, the adverb's control and the next modal's share the gap after the modal — the
    // adverb's first, so the ring layout stacks it on the inside.
    const foldedAdverb = specs(groups(['verbModal']), {
      satelliteIconsByParent: { verbModal: [icon('verbModal2'), icon('verbModalAdverb')] },
    })[VERB_PHRASE];
    expect(foldedAdverb.gaps).toEqual([
      { key: 'verbModalAdverb', after: 'verbModal' },
      { key: 'verbModal2', after: 'verbModal' },
    ]);
  });

  it("orbits the tense, aspect, adverb and determiner at their own hours", () => {
    const defs = groups(['verbTense', 'verbAspect', 'modifier', 'subjectDefiniteness']);
    const result = specs(defs);

    expect(result[VERB_PHRASE].satellites).toEqual([
      { key: 'verbTense', home: 11 },
      { key: 'verbAspect', home: 1 },
      { key: 'modifier', home: 4.5 },
    ]);
    expect(result.Subject.satellites).toEqual([{ key: 'subjectDefiniteness', home: 6 }]);
  });

  it("puts a noun phrase's links on its dotted ring: collapse, the relations fanned along the bottom, the incoming dot at the top", () => {
    const [subject] = groups([]);
    const { Subject } = specs([subject], {
      perimeterByNoun: { subject: { relative: icon('r'), possessor: icon('p'), conjunct: icon('c') } },
      linkTargetKeys: new Set(['subject']),
    });

    expect(keys(Subject.outer)).toEqual([
      collapseControlKey('Subject'),
      perimeterControlKey('incoming', 'subject'),
      perimeterControlKey('relative', 'subject'),
      perimeterControlKey('possessor', 'subject'),
      perimeterControlKey('conjunct', 'subject'),
    ]);
    const hour = (key: string) => (aimOf(Subject.outer, key) as { clock: number }).clock;
    // At the bottom of the ring the clock runs right to left: the relative clause leftmost.
    expect(hour(perimeterControlKey('relative', 'subject'))).toBeGreaterThan(
      hour(perimeterControlKey('conjunct', 'subject')),
    );
    expect(hour(perimeterControlKey('incoming', 'subject'))).toBe(12);
  });

  // The clause's facts about a noun (P09-E12 M6, M7): the question's mark and its who / what, and the
  // subject's existential, share one hour at the lower left, clear of the relations at the bottom.
  it("seats the question mark, its who / what and the existential together on a noun's dotted ring", () => {
    const [subject] = groups([]);
    const { Subject } = specs([subject], {
      perimeterByNoun: {
        subject: { conjunct: icon('c'), question: icon('q'), animacy: icon('a'), existential: icon('e') },
      },
    });

    expect(keys(Subject.outer)).toEqual([
      collapseControlKey('Subject'),
      perimeterControlKey('conjunct', 'subject'),
      perimeterControlKey('question', 'subject'),
      perimeterControlKey('animacy', 'subject'),
      perimeterControlKey('existential', 'subject'),
    ]);
    const hour = (key: string) => (aimOf(Subject.outer, key) as { clock: number }).clock;
    expect(hour(perimeterControlKey('animacy', 'subject'))).toBeCloseTo(8);
    expect(hour(perimeterControlKey('question', 'subject'))).toBeGreaterThan(hour(perimeterControlKey('existential', 'subject')));
  });

  it.each(['subject', 'directObject', 'route'] as const)('puts the question mark on the %s ring alone', (noun) => {
    const defs = groups([noun], ['subject', 'verb', 'directObject', 'route']);
    const def = defs.find((g) => g.mainKey === noun)!;
    const out = specs(defs, { perimeterByNoun: { [noun]: { question: icon('q') } } })[def.label]!;
    expect(keys(out.outer)).toContain(perimeterControlKey('question', noun));
    const others = defs.filter((g) => g !== def).flatMap((g) => keys(specs(defs, { perimeterByNoun: { [noun]: { question: icon('q') } } })[g.label]!.outer));
    expect(others.some((k) => k.startsWith('question:'))).toBe(false);
  });

  it("turns a noun's possessor control to face its owner, out of the row of relations", () => {
    const [subject] = groups([]);
    const owner = { x: 420, y: 380 };
    const { Subject } = specs([subject], {
      perimeterByNoun: { subject: { relative: icon('r'), possessor: icon('p'), conjunct: icon('c') } },
      possessorAims: { subject: owner },
    });

    expect(aimOf(Subject.outer, perimeterControlKey('possessor', 'subject'))).toEqual({ point: owner });
    const hour = (key: string) => (aimOf(Subject.outer, key) as { clock: number }).clock;
    // The two left in the row fan about the bottom of the ring as a pair.
    expect((hour(perimeterControlKey('relative', 'subject')) + hour(perimeterControlKey('conjunct', 'subject'))) / 2).toBeCloseTo(6);
  });

  // P09-E12 D5: the standard of comparison's control rides the predicate adjective's dotted ring
  // beside the other relations, and turns to face the standard's ring once it is drawn.
  it("fans the standard control with the relations, and turns it to face the standard's ring", () => {
    const [subject] = groups([]);
    const perimeterByNoun = { subject: { standard: icon('s'), conjunct: icon('c') } };
    const row = specs([subject], { perimeterByNoun }).Subject;

    expect(keys(row.outer)).toEqual([
      collapseControlKey('Subject'),
      perimeterControlKey('standard', 'subject'),
      perimeterControlKey('conjunct', 'subject'),
    ]);
    const hour = (controls: RingControl[], key: string) => (aimOf(controls, key) as { clock: number }).clock;
    expect((hour(row.outer, perimeterControlKey('standard', 'subject')) + hour(row.outer, perimeterControlKey('conjunct', 'subject'))) / 2).toBeCloseTo(6);

    const ring = { x: 420, y: 380 };
    const aimed = specs([subject], { perimeterByNoun, standardAims: { subject: ring } }).Subject;
    expect(aimOf(aimed.outer, perimeterControlKey('standard', 'subject'))).toEqual({ point: ring });
    expect(hour(aimed.outer, perimeterControlKey('conjunct', 'subject'))).toBeCloseTo(6);
  });

  // P09-E48: the examples control is a seventh relation in the fan, after the standard, and turns to
  // face the examples' ring once it is drawn.
  it('fans the examples control with the relations, and turns it to face the examples’ ring', () => {
    const [subject] = groups([]);
    const all = ['relative', 'headless', 'possessor', 'possessorRole', 'standard', 'examples', 'conjunct'] as const;
    const perimeterByNoun = { subject: Object.fromEntries(all.map((k) => [k, icon(k)])) };
    const row = specs([subject], { perimeterByNoun }).Subject;
    expect(keys(row.outer)).toEqual([collapseControlKey('Subject'), ...all.map((k) => perimeterControlKey(k, 'subject'))]);

    const ring = { x: 420, y: 380 };
    const aimed = specs([subject], { perimeterByNoun, examplesAims: { subject: ring } }).Subject;
    expect(aimOf(aimed.outer, perimeterControlKey('examples', 'subject'))).toEqual({ point: ring });
  });

  it("fans a complement's relation toolbar across the top of its ring, beside its remove control", () => {
    const defs = groups(['route'], ['subject', 'verb', 'route']);
    const route = specs(defs, { toolbars: { route: ['in', 'through', 'under'] } }).Route;

    expect(keys(route.outer)).toEqual([
      collapseControlKey('Route'),
      removeControlKey('Route'),
      toolbarControlKey('route', 'in'),
      toolbarControlKey('route', 'through'),
      toolbarControlKey('route', 'under'),
      portKey('Route', VERB_PHRASE),
    ]);
    const hour = (value: string) => (aimOf(route.outer, toolbarControlKey('route', value)) as { clock: number }).clock;
    expect(hour('in')).toBeLessThan(hour('through'));
    expect(hour('through')).toBe(12);
  });

  // P09-E12b: the temporal's six relations fan across the top of its ring as the route's do.
  it("fans the temporal's relation toolbar across the top of its ring", () => {
    const defs = groups(['temporal'], ['subject', 'verb', 'temporal']);
    const values = ['at', 'ago', 'until', 'after', 'before', 'during'];
    const temporal = specs(defs, { toolbars: { temporal: values } }).Temporal;

    expect(keys(temporal.outer).filter((k) => k.startsWith('toolbar:'))).toEqual(
      values.map((v) => toolbarControlKey('temporal', v)),
    );
    const hour = (value: string) =>
      (aimOf(temporal.outer, toolbarControlKey('temporal', value)) as { clock: number }).clock;
    expect(values.map(hour)).toEqual([...values.map(hour)].sort((a, b) => a - b));
    expect((hour('until') + hour('after')) / 2).toBeCloseTo(12);
  });

  // P09-E12 D2, measured on *cat eats mouse* (EAT licenses four): the two adjuncts every verb offers
  // join the row of complement toggles waiting at six o'clock, in the builder's order, and the ring
  // grows to seat them (the verb's group box went from 144 to 190px; the object kept its row, so
  // D2's second arc was not needed).
  it("waits the adjunct toggles in the verb's row at six, among the licensed ones", () => {
    const defs = groups(['directObject'], ['subject', 'verb', 'directObject']);
    const toggles = ['instrumental', 'manner', 'locative', 'temporal', 'cause', 'purpose'];
    const verb = specs(defs, {
      complementToggleIcons: toggles.map(icon),
      directObjectToggle: icon('directObject'),
    })[VERB_PHRASE];

    expect(keys(verb.outer).filter((k) => toggles.includes(k))).toEqual(toggles);
    const hours = toggles.map((k) => (aimOf(verb.outer, k) as { clock: number }).clock);
    // Left first at the bottom of the ring, where the clock runs right to left.
    expect(hours).toEqual([...hours].sort((a, b) => b - a));
    expect((hours[2] + hours[3]) / 2).toBeCloseTo(6);
  });

  it("faces the verb's toggles toward the constituents they show, and ports toward the rest", () => {
    const defs = groups(['directObject', 'route'], ['subject', 'verb', 'directObject', 'route']);
    const result = specs(defs, {
      complementToggleIcons: [icon('locative'), icon('route')],
      directObjectToggle: icon('directObject'),
    });
    const verb = result[VERB_PHRASE];

    expect(aimOf(verb.outer, 'route')).toEqual({ point: CENTERS.route });
    expect(aimOf(verb.outer, 'directObject')).toEqual({ point: CENTERS.directObject });
    expect('clock' in aimOf(verb.outer, 'locative')).toBe(true);
    // The subject has no toggle, so the line to it leaves from a plain port.
    expect(aimOf(verb.outer, portKey(VERB_PHRASE, 'Subject'))).toEqual({ point: CENTERS.subject });
    expect(keys(verb.outer)).not.toContain(portKey(VERB_PHRASE, 'Route'));
    // Every other constituent's port faces the verb.
    for (const label of ['Subject', 'Direct Object', 'Route']) {
      expect(aimOf(result[label].outer, portKey(label, VERB_PHRASE))).toEqual({ point: CENTERS.verb });
    }
  });

  it("gives a conjunct's ring a remove control, and a port facing each ring its links run to", () => {
    const [subject] = groups([]);
    const toward = { x: 150, y: 450 };
    const { Subject } = specs([{ ...subject, removable: true }], {
      linkPorts: { subject: [{ key: 'port:subject>subject+1', toward }] },
    });

    expect(keys(Subject.outer)).toEqual([
      collapseControlKey('Subject'),
      removeControlKey('Subject'),
      'port:subject>subject+1',
    ]);
    expect(aimOf(Subject.outer, 'port:subject>subject+1')).toEqual({ point: toward });
    expect(Subject.outer.find((c) => c.key === 'port:subject>subject+1')!.half).toBeLessThan(11);
  });

  it('keeps only the clear button in compact view', () => {
    const defs = groups(['subjectAdjective']);
    const { Subject } = specs(defs, {
      compact: true,
      clearable: new Set(['subject']),
      satelliteIconsByParent: { subject: [icon('subjectNumber')] },
      perimeterByNoun: { subject: { relative: icon('r') } },
    });

    expect(Subject).toEqual({
      satellites: [],
      chains: [],
      inner: [{ key: clearControlKey('subject'), aim: { clock: 1.5 } }],
      gaps: [],
      outer: [],
    });
  });
});

describe('buildRings and buildEdges', () => {
  const sizeOf = (key: string) => (key === 'subjectAdjective' ? { w: 30, h: 16 } : { w: 60, h: 32 });

  it('lays every constituent out round its word, with a footprint for its dotted ring', () => {
    const defs = groups(['subjectAdjective']);
    const ringSpecs = specs(defs, { satelliteIconsByParent: { subject: [icon('subjectAdjective')] } });
    const { groupRects, discs, controlPos } = buildRings({ groups: defs, specs: ringSpecs, centerOf, sizeOf, compact: false });

    const subject = groupRects.find((g) => g.label === 'Subject')!;
    expect(subject.center).toEqual(CENTERS.subject);
    expect(subject.width).toBeCloseTo(2 * (subject.rOut + 11));
    expect(subject.x).toBeCloseTo(CENTERS.subject.x - subject.width / 2);
    // The adjective orbits straight above its word, its reveal control between them.
    expect(discs.subjectAdjective.x).toBeCloseTo(CENTERS.subject.x);
    expect(discs.subjectAdjective.a).toBeCloseTo(((clock(12) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    expect(controlPos.subjectAdjective.y).toBeLessThan(CENTERS.subject.y);
    expect(controlPos.subjectAdjective.y).toBeGreaterThan(discs.subjectAdjective.y);
  });

  it("draws each satellite's link from its control to its disc's rim, and the spine port to port", () => {
    const defs = groups(['subjectAdjective']);
    const ringSpecs = specs(defs, { satelliteIconsByParent: { subject: [icon('subjectAdjective')] } });
    const rings = buildRings({ groups: defs, specs: ringSpecs, centerOf, sizeOf, compact: false });
    const { edges, groupEdges } = buildEdges({ ...rings, complementToggleIcons: [], compact: false });

    expect(edges).toHaveLength(1);
    const [link] = edges;
    expect({ x: link.x1, y: link.y1 }).toEqual(rings.controlPos.subjectAdjective);
    expect(Math.hypot(link.x2 - rings.discs.subjectAdjective.x, link.y2 - rings.discs.subjectAdjective.y)).toBeCloseTo(
      rings.discs.subjectAdjective.r,
    );

    expect(groupEdges).toHaveLength(1);
    const [spine] = groupEdges;
    expect({ x: spine.x1, y: spine.y1 }).toEqual(rings.controlPos[portKey(VERB_PHRASE, 'Subject')]);
    expect({ x: spine.x2, y: spine.y2 }).toEqual(rings.controlPos[portKey('Subject', VERB_PHRASE)]);
  });

  it('joins solid ring to solid ring in compact view, which has no dotted rings', () => {
    const defs = groups([]);
    const ringSpecs = specs(defs, { compact: true });
    const rings = buildRings({ groups: defs, specs: ringSpecs, centerOf, sizeOf, compact: true });
    const { groupEdges } = buildEdges({ ...rings, complementToggleIcons: [], compact: true });

    const subject = rings.groupRects.find((g) => g.label === 'Subject')!;
    const verb = rings.groupRects.find((g) => g.label === VERB_PHRASE)!;
    expect(groupEdges[0].x1).toBeCloseTo(CENTERS.verb.x - verb.rIn);
    expect(groupEdges[0].x2).toBeCloseTo(CENTERS.subject.x + subject.rIn);
    expect(subject.width).toBeCloseTo(2 * (subject.rIn + 11));
  });

  it("runs the compact line to a coordinated noun from whichever of its group's rings is nearest the verb", () => {
    const defs = groups([]);
    const ringSpecs = specs(defs, { compact: true });
    const rings = buildRings({ groups: defs, specs: ringSpecs, centerOf, sizeOf, compact: true });
    // The subject's conjunct is packed right beside the verb; the head is further off.
    const conjunct = { center: { x: 330, y: 150 }, rIn: 40 };
    const { groupEdges } = buildEdges({
      ...rings,
      complementToggleIcons: [],
      compact: true,
      standIns: { Subject: [conjunct] },
    });

    const verb = rings.groupRects.find((g) => g.label === VERB_PHRASE)!;
    expect(groupEdges[0].x1).toBeCloseTo(CENTERS.verb.x - verb.rIn);
    expect(groupEdges[0].x2).toBeCloseTo(conjunct.center.x + conjunct.rIn);
  });
});
