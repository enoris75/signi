import { describe, expect, test } from 'vitest';
import { translate } from '@signi/engine';
import type { PhrasePlan } from '@signi/shared';
import { compileDefinition, definitionVocabulary, planToWorkspace, printDefinition, workspaceToPlans } from '@signi/phrase';
import { concepts } from './concepts/index.js';
import { clauseForceOf, compileSeedDefinitions, seedConcept } from './concepts/definitionText.js';
import { conceptIndex } from './concepts/hierarchy.js';
import { adjectives } from './concepts/adjectives.js';
import { adverbs } from './concepts/adverbs.js';
import { interjections } from './concepts/interjections.js';
import { nouns } from './concepts/nouns.js';
import { pronouns } from './concepts/pronouns.js';
import { verbs } from './concepts/verbs/index.js';
import { listConcepts } from './conceptList.js';
import { notingLookup } from './lexicon.js';
// Seeds the real corpus into this file's in-memory database (SIGNI_DB_PATH, see vitest.config.ts).
import './seed.js';

// P13: a definition is written in the phrase language. Each seeded plan is taken to the workspace it
// is (`planToWorkspace`), printed in the definition vocabulary, and compiled back from that text; a
// definition the language can say must come back rendering exactly as it went in, in all seven
// languages. The render is the invariant, not the plan: the canvas fills in what a plan leaves to its
// default (a pronoun's number, a verb's tense), and a definition's only reader is the render.

// The constructs the phrase language cannot say yet, as `planToWorkspace` names them — P13 §1. Each
// phase-4 construct took its name off this list, and phase 4 left it empty: a construct a new
// definition needs is planned here first, and fails the second test until it is.
const WAITING = new Set<string>([]);

const vocab = definitionVocabulary(listConcepts({ senses: true }));
const byId = new Map(Object.values(vocab.concepts).flat().map((c) => [c.id, c]));

function render(plan: PhrasePlan): string {
  const { lookup } = notingLookup();
  return translate(plan, lookup).map((t) => `${t.language}: ${t.text}`).join('\n');
}

const defined = concepts.filter((c) => c.definition).map((c) => ({ id: c.id, plan: c.definition! }));
const said = defined.filter(({ plan }) => planToWorkspace(plan, (id) => byId.get(id)).unsupported.length === 0);

describe('definitions in the phrase language (P13)', () => {
  test.each(said)('$id comes back from its text as it went in', ({ plan }) => {
    const want = render(plan);
    // The workspace alone first, so a failure says whether the inverse or the text lost it.
    const { containers, links } = planToWorkspace(plan, (id) => byId.get(id));
    const roots = workspaceToPlans(containers, links);
    expect(roots).toHaveLength(1);
    expect(render(roots[0]!.plan as PhrasePlan)).toBe(want);
    const { text } = printDefinition(plan, vocab);
    expect(render(compileDefinition(text, vocab))).toBe(want);
  });

  test('what the language cannot say yet is a construct P13 plans for', () => {
    const unplanned = new Map<string, string[]>();
    for (const { id, plan } of defined) {
      for (const what of planToWorkspace(plan, (c) => byId.get(c)).unsupported) {
        if (!WAITING.has(what)) unplanned.set(what, [...(unplanned.get(what) ?? []), id]);
      }
    }
    expect(Object.fromEntries(unplanned)).toEqual({});
  });

  test('every definition is said', () => {
    // A floor, not a count: every definition since phase 4, and it catches the inverse losing ground.
    expect(said.length).toBeGreaterThanOrEqual(573);
  });
});

describe('a seed defined in text (P13)', () => {
  // The facts a line is checked against, as the seed states them and as the database serves them:
  // the definition compiler reads the first, the console the second, and they must not disagree.
  test('knows each word as the API serves it', () => {
    const FACTS = ['role', 'transitivity', 'complements', 'clauseObject', 'clauseForce', 'prepositionalObject', 'humble', 'relative', 'modal', 'slot', 'person', 'number', 'gendered', 'mannerRelation', 'dimensionRelation'] as const;
    const pick = (c: object) => Object.fromEntries(FACTS.flatMap((k) => ((c as Record<string, unknown>)[k] === undefined ? [] : [[k, (c as Record<string, unknown>)[k]]])));
    const served = new Map(listConcepts({ senses: true }).map((c) => [c.id, pick(c)]));
    const byId = conceptIndex(concepts);
    for (const seed of concepts) expect(pick(seedConcept(seed, byId)), seed.id).toEqual(served.get(seed.id));
  });

  // P09-E54: the verbs whose object takes a preposition in some language, derived from `object_prep`.
  test('serves which verbs take a prepositional object', () => {
    const served = listConcepts({ senses: true }).filter((c) => c.prepositionalObject).map((c) => c.id).sort();
    expect(served).toEqual([
      'ASK', 'BELIEVE', 'CALL_PHONE', 'CLICK', 'DEPEND', 'FOLLOW', 'LEAVE', 'LIKE',
      'LOOK_AT', 'MARRY', 'MEET', 'NEED', 'PLAY_INSTRUMENT', 'REMEMBER', 'THANK', 'WAIT',
    ]);
  });

  // P11-E6 D3: the verbs with a humble word, derived from a lexeme's `humble` column. BE's いる / おる
  // is the engine's own (JA_IRU), so the builder's gate counts BE by hand and it is not here.
  test('serves which verbs have a humble word', () => {
    const served = listConcepts({ senses: true }).filter((c) => c.humble).map((c) => c.id).sort();
    expect(served).toEqual(['COME', 'DO', 'DRINK', 'EAT', 'GIVE', 'GO', 'SAY']);
  });

  // P11-E6 D2: the builder reads "a relative" off the isA tree (RELATIVE and what is under it), where
  // the engine reads the Japanese lexeme's `kin`. The two must name the same nouns, or the humble
  // toggle would be offered where the engine ignores it, or withheld where it would work: a kin term
  // seeded outside RELATIVE, or under it without `kin`, fails here.
  test('a relative is exactly a noun whose Japanese word is kin', () => {
    const relatives = listConcepts({ senses: true }).filter((c) => c.relative).map((c) => c.id).sort();
    const kin = concepts
      .filter((c) => c.role === 'noun' && (c.forms['ja'] as Record<string, string> | undefined)?.['kin'] === '1')
      .map((c) => c.id)
      .sort();
    expect(relatives).toEqual(kin);
    expect(relatives).toContain('RELATIVE');
    expect(relatives).toContain('MOM');
    expect(relatives).not.toContain('PERSON');
  });

  // P09-E55: which verbs' that-clause may be a question, derived from `content_clause_force`.
  test('serves the force each verb’s that-clause may have', () => {
    const served = Object.fromEntries(
      listConcepts({ senses: true }).filter((c) => c.clauseForce).map((c) => [c.id, c.clauseForce]),
    );
    expect(served).toEqual({ ASK: 'interrogative', KNOW: 'either', SAY: 'either', TELL: 'either' });
  });

  test('refuses a verb whose languages disagree on its clause’s force', () => {
    const split = { id: 'SPLIT', role: 'verb' as const, forms: { en: { content_clause_force: 'either' }, de: {} } };
    expect(() => clauseForceOf(split as never)).toThrow(/SPLIT.*content_clause_force/);
    expect(clauseForceOf({ id: 'ASKS', role: 'verb', forms: { en: { content_clause_force: 'interrogative' } } } as never)).toBe('interrogative');
  });

  // Every seed as it is written, and CAT defined by `text`.
  const withCat = (text: string) =>
    compileSeedDefinitions(
      [...pronouns, ...nouns, ...verbs, ...adjectives, ...adverbs, ...interjections].map((c) => (c.id === 'CAT' ? { ...c, definition: text } : c)),
    );

  test('renders as the plan its text says', () => {
    const plan: PhrasePlan = { subject: { concept: 'MAMMAL', definiteness: 'indefinite', adjectives: ['SMALL'] } };
    const cat = withCat('/subj ( MAMMAL /a /adj SMALL )').find((c) => c.id === 'CAT')!;
    expect(cat.definition).toMatchObject(plan);
    expect(render(cat.definition!)).toBe(render(plan));
  });

  test('stops the boot on a line that does not compile, naming the concept and the line', () => {
    expect(() => withCat('/subj ( MAMAL /a )')).toThrow(/Definition for "CAT" does not compile: .*MAMAL[\s\S]*in: \/subj \( MAMAL \/a \)/);
    expect(() => withCat('/verb ( EAT ) /obj ( FOOD ) /pred ( HAPPY )')).toThrow(/Definition for "CAT" does not compile/);
  });
});
