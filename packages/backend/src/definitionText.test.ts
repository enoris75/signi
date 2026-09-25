import { describe, expect, test } from 'vitest';
import { translate } from '@signi/engine';
import type { PhrasePlan } from '@signi/shared';
import { compileDefinition, definitionVocabulary, planToWorkspace, printDefinition, workspaceToPlans } from '@signi/phrase';
import { concepts } from './concepts/index.js';
import { compileSeedDefinitions, seedConcept } from './concepts/definitionText.js';
import { nouns } from './concepts/nouns.js';
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
// phase-4 construct takes its name off this list; a definition using one of them is skipped until
// then. A name not listed here is a construct nobody has planned for, and fails the second test.
const WAITING = new Set([
  'NounGroup of adjectives',
  'NounPhrase.numeral',
  'NounPhrase.contrastive',
  'PhrasePlan.adverbialGloss',
  'PhrasePlan.contentSubject',
  'InfinitiveComplement.infinitiveComplement',
  'complements.direction.specifiers.path',
]);

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

  test('most definitions are said already', () => {
    // A floor, not a count: it moves up as phase 4 lands, and catches the inverse losing ground.
    expect(said.length).toBeGreaterThanOrEqual(561);
  });
});

describe('a seed defined in text (P13)', () => {
  // The facts a line is checked against, as the seed states them and as the database serves them:
  // the definition compiler reads the first, the console the second, and they must not disagree.
  test('knows each word as the API serves it', () => {
    const FACTS = ['role', 'transitivity', 'complements', 'clauseObject', 'modal', 'slot', 'person', 'number', 'gendered', 'mannerRelation', 'dimensionRelation'] as const;
    const pick = (c: object) => Object.fromEntries(FACTS.flatMap((k) => ((c as Record<string, unknown>)[k] === undefined ? [] : [[k, (c as Record<string, unknown>)[k]]])));
    const served = new Map(listConcepts({ senses: true }).map((c) => [c.id, pick(c)]));
    for (const seed of concepts) expect(pick(seedConcept(seed)), seed.id).toEqual(served.get(seed.id));
  });

  // Every seed but CAT as it is, and CAT defined by `text`.
  const withCat = (text: string) => {
    const cat = nouns.find((c) => c.id === 'CAT')!;
    return compileSeedDefinitions([...concepts.filter((c) => c.id !== 'CAT'), { ...cat, definition: text }]);
  };

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
