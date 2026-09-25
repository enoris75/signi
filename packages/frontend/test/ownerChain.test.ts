import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseSelection } from '../src/components/PhraseBuilder/interfaces.ts';
import {
  besideRing,
  canvasKeyOf,
  OWNER_WALL_CLEARANCE,
  ownerLink,
  ownerPortKey,
  ownersUnder,
  pointerBend,
  pointerLink,
  possessionsFor,
  type OwnerSpot,
} from '../src/components/PhraseBuilder/ownerChain.ts';
import { CONJUNCT_GAP, UNMEASURED_R } from '../src/components/PhraseBuilder/conjunctChain.ts';
import { BUTTON_HALF } from '../src/components/PhraseBuilder/ringLayout.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const pronoun = (id: string): Concept => ({ id, role: 'pronoun', description: id, label: id });

const BOOK = noun('BOOK');
const CAT = noun('CAT');
const DOG = noun('DOG');
const BOY = noun('BOY');
const HORSE = noun('HORSE');
const YOU = pronoun('YOU');

describe('canvasKeyOf', () => {
  it('keys a period noun by itself, a conjunct by its chain key, and an owner by its address', () => {
    expect(canvasKeyOf('subject')).toBe('subject');
    expect(canvasKeyOf('directObject/conjunct/1')).toBe('directObject+2');
    expect(canvasKeyOf('subject/possessor')).toBe('subject/possessor');
    expect(canvasKeyOf('subject/conjunct/0/possessor')).toBe('subject/conjunct/0/possessor');
  });

  it('answers nothing for an address no ring is drawn for', () => {
    expect(canvasKeyOf('subject/possessor/directObject')).toBeUndefined();
    expect(canvasKeyOf('subject/conjunct/x')).toBeUndefined();
  });
});

describe('possessionsFor', () => {
  const spots = (
    selection: PhraseSelection,
    ownersOpen: Record<string, boolean> = {},
    nouns = ['subject', 'directObject'] as const,
  ) =>
    possessionsFor({
      selection,
      nouns: [...nouns],
      chains: [{ which: 'subject', count: (selection.subjectConjuncts ?? []).length }],
      ownersOpen,
    });

  it('draws a named owner, and an owner’s owner after it, halving its place in the group each step', () => {
    const { owners, pointers } = spots({
      subject: BOOK,
      subjectPossessor: { subject: CAT, subjectPossessor: { subject: DOG } },
    });

    expect(owners).toEqual([
      { address: 'subject/possessor', possessed: 'subject', possessedKey: 'subject', role: 'subject', order: -0.5, named: true },
      {
        address: 'subject/possessor/possessor',
        possessed: 'subject/possessor',
        possessedKey: 'subject/possessor',
        role: 'subject',
        order: -0.25,
        named: true,
      },
    ]);
    expect(pointers).toEqual([]);
  });

  it('draws an empty owner only while it is open, and a named one unless folded away', () => {
    expect(spots({ subject: BOOK }).owners).toEqual([]);
    expect(spots({ subject: BOOK }, { subject: true }).owners).toMatchObject([
      { address: 'subject/possessor', named: false },
    ]);
    expect(spots({ subject: BOOK, subjectPossessor: { subject: CAT } }, { subject: false }).owners).toEqual([]);
  });

  it('draws a conjunct’s owner after the conjunct, in the group of the noun it joins', () => {
    const { owners } = spots({
      subject: BOOK,
      subjectConjuncts: [{ subject: DOG, subjectPossessor: { subject: BOY } }],
    });

    expect(owners).toEqual([
      {
        address: 'subject/conjunct/0/possessor',
        possessed: 'subject/conjunct/0',
        possessedKey: 'subject+1',
        role: 'subject',
        order: 0.5,
        named: true,
      },
    ]);
  });

  it('draws a line for a pointed-to owner instead of a ring, to the antecedent’s ring', () => {
    const { owners, pointers } = spots(
      {
        subject: BOY,
        directObject: HORSE,
        directObjectPossessorRef: 'subject/conjunct/0',
        directObjectPossessor: { subject: CAT },
      },
      { directObject: true },
    );

    expect(owners).toEqual([]);
    expect(pointers).toEqual([
      {
        possessed: 'directObject',
        possessedKey: 'directObject',
        role: 'directObject',
        antecedent: 'subject/conjunct/0',
        antecedentKey: 'subject+1',
        // The noun possessed, which the chip on the line renders the phrase of (C16).
        possessedConcept: 'HORSE',
      },
    ]);
  });

  // P11-E9 D7: a pronoun owner's spot carries the possessive its line will say, and no owner below it.
  it('gives a pronoun owner the possessive it spells, with the noun it owns', () => {
    const I = { ...pronoun('FIRST_PERSON'), person: '1' as const };
    const { owners } = spots({
      directObject: HORSE,
      directObjectPossessor: { subject: I, subjectNumber: 'plural', subjectGender: 'fem', subjectPossessor: { subject: DOG } },
    });
    expect(owners).toEqual([
      {
        address: 'directObject/possessor',
        possessed: 'directObject',
        possessedKey: 'directObject',
        role: 'directObject',
        order: -0.5,
        named: true,
        pronoun: { kind: 'pronominal', person: '1', number: 'plural' },
        possessedConcept: 'HORSE',
      },
    ]);
  });

  it('looks only at the nouns it is given, and at no owner below a pronoun head', () => {
    expect(spots({ subject: BOOK, subjectPossessor: { subject: CAT } }, {}, ['directObject'] as never).owners).toEqual([]);
    expect(
      spots({
        subject: BOOK,
        subjectConjuncts: [{ subject: YOU, subjectPossessor: { subject: CAT } }],
        subjectPossessor: { subject: YOU, subjectPossessor: { subject: DOG } },
      }).owners.map((o) => o.address),
    ).toEqual(['subject/possessor']);
  });
});

describe('ownerPortKey', () => {
  it('names the port on an owner’s ring that faces the ring it owns', () => {
    expect(ownerPortKey({ address: 'subject/possessor', possessedKey: 'subject' })).toBe('port:subject/possessor>subject');
  });
});

describe('ownersUnder', () => {
  const spot = (address: string, possessed: string): OwnerSpot => ({
    address,
    possessed,
    possessedKey: possessed,
    role: 'subject',
    order: 0,
    named: true,
  });
  const OWNERS = [
    spot('subject/possessor', 'subject'),
    spot('subject/possessor/possessor', 'subject/possessor'),
    spot('subject/possessor/possessor/possessor', 'subject/possessor/possessor'),
    spot('subject/conjunct/0/possessor', 'subject+1'),
    // An address that merely starts with the same letters is another noun's owner.
    spot('subjectX/possessor', 'subjectX'),
  ];

  it('takes the owner and every owner it holds, however deep', () => {
    expect(ownersUnder(OWNERS, 'subject/possessor').map((o) => o.address)).toEqual([
      'subject/possessor',
      'subject/possessor/possessor',
      'subject/possessor/possessor/possessor',
    ]);
  });

  it('takes nothing of the owners beside it', () => {
    expect(ownersUnder(OWNERS, 'subject/possessor/possessor/possessor')).toEqual([OWNERS[2]]);
    expect(ownersUnder(OWNERS, 'directObject/possessor')).toEqual([]);
  });
});

describe('besideRing', () => {
  const d = (80 + CONJUNCT_GAP + 2 * BUTTON_HALF + 60) * Math.SQRT1_2;

  it('starts an owner below the ring it owns, toward the middle of the canvas, a chip’s length clear', () => {
    const right = besideRing({ x: 200, y: 100 }, 80, 1000, 60);
    expect(right.x - 200).toBeCloseTo(d);
    expect(right.y - 100).toBeCloseTo(d);

    const left = besideRing({ x: 800, y: 100 }, 80, 1000, 60);
    expect(800 - left.x).toBeCloseTo(d);
    expect(besideRing({ x: 800, y: 0 }, 0, 1000).y).toBeCloseTo(
      (CONJUNCT_GAP + 2 * BUTTON_HALF + UNMEASURED_R) * Math.SQRT1_2,
    );
  });

  it('keeps the ring clear of the canvas’s side walls', () => {
    // Toward the middle, but short of the far wall…
    expect(besideRing({ x: 190, y: 100 }, 80, 400, 60).x).toBe(400 - OWNER_WALL_CLEARANCE);
    expect(besideRing({ x: 210, y: 100 }, 80, 400, 60).x).toBe(OWNER_WALL_CLEARANCE);
    // …and on a canvas too narrow for the clearance, against the near one.
    expect(besideRing({ x: 150, y: 100 }, 80, 150, 60).x).toBe(OWNER_WALL_CLEARANCE);
  });
});

describe('ownerLink', () => {
  const owned = { center: { x: 0, y: 0 }, rIn: 30, rOut: 60 };
  const owner = { center: { x: 200, y: 0 }, rIn: 20, rOut: 50 };

  it('runs from the possessor control to the port the owner’s ring faces it from', () => {
    const link = ownerLink({ owned, owner, control: { x: 55, y: 5 }, port: { x: 150, y: 2 }, compact: false });

    expect(link).toEqual({ from: { x: 55, y: 5 }, to: { x: 150, y: 2 }, mid: { x: 102.5, y: 3.5 } });
  });

  it('falls back to the dotted rings until the control and port are seated', () => {
    const link = ownerLink({ owned, owner, control: undefined, port: undefined, compact: false })!;

    expect(link.from.x).toBeCloseTo(60);
    expect(link.to.x).toBeCloseTo(150);
  });

  it('runs solid ring to solid ring in compact view', () => {
    const link = ownerLink({ owned, owner, control: { x: 55, y: 5 }, port: { x: 150, y: 2 }, compact: true })!;

    expect(link.from.x).toBeCloseTo(30);
    expect(link.to.x).toBeCloseTo(180);
  });

  it('is nothing until both rings are drawn', () => {
    expect(ownerLink({ owned, owner: undefined, control: undefined, port: undefined, compact: false })).toBeNull();
  });
});

describe('pointerBend', () => {
  it('bows a line along a row below it, further the longer the line, up to a limit', () => {
    expect(pointerBend({ x: 500, y: 100 }, { x: 100, y: 100 })).toEqual({ x: 300, y: 280 });
    expect(pointerBend({ x: 100, y: 100 }, { x: 300, y: 100 })).toEqual({ x: 200, y: 190 });
  });

  it('bows a line between rings one above the other to the right', () => {
    const bend = pointerBend({ x: 100, y: 400 }, { x: 100, y: 0 });

    expect(bend.x).toBeCloseTo(280);
    expect(bend.y).toBeCloseTo(200);
  });
});

describe('pointerLink', () => {
  const owned = { center: { x: 400, y: 0 }, rIn: 30, rOut: 60 };
  const antecedent = { center: { x: 0, y: 0 }, rIn: 20, rOut: 50 };
  const via = pointerBend(owned.center, antecedent.center);

  it('bows from the possessor control to the antecedent’s ring edge facing the bend, the chip at its top', () => {
    const link = pointerLink({ owned, antecedent, control: { x: 360, y: 45 }, compact: false })!;

    expect(link.from).toEqual({ x: 360, y: 45 });
    expect(link.via).toEqual(via);
    expect(Math.hypot(link.to.x, link.to.y)).toBeCloseTo(50);
    expect(link.to.y).toBeGreaterThan(0);
    // Halfway along the curve: below the straight line by half the bend.
    expect(link.mid.y).toBeCloseTo((45 + link.to.y) / 4 + via.y / 2);
  });

  it('runs solid ring to solid ring in compact view, each end facing the bend', () => {
    const link = pointerLink({ owned, antecedent, control: { x: 360, y: 45 }, compact: true })!;

    expect(Math.hypot(link.from.x - 400, link.from.y)).toBeCloseTo(30);
    expect(Math.hypot(link.to.x, link.to.y)).toBeCloseTo(20);
  });

  it('is nothing while the antecedent has no ring on the canvas', () => {
    expect(pointerLink({ owned, antecedent: undefined, control: { x: 0, y: 60 }, compact: false })).toBeNull();
  });
});
