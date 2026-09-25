import { describe, expect, test } from 'vitest';
import { COMPLEMENT_RENDER_ORDER, LANGUAGES } from '@signi/shared';
import type { GrammaticalRole } from '@signi/shared';
import { concepts, GSW_PENDING, NONFINITE } from './index.js';
import { ancestors, assertValidHierarchy } from './hierarchy.js';

// Integrity of the seed corpus: the rules the seed and the engine rely on but that neither the
// schema nor the type of ConceptSeed (whose role, languages and complements are plain strings)
// can enforce. A breach here would otherwise surface as a failed seed, a silently dropped form, or
// a word missing from one language's picker.

const LANGUAGE_CODES = Object.keys(LANGUAGES);
const ROLES: GrammaticalRole[] = ['pronoun', 'noun', 'verb', 'adjective', 'adverb', 'interjection'];
const byId = new Map(concepts.map((c) => [c.id, c]));

describe('the concept corpus', () => {
  test('gives every concept a unique id', () => {
    const duplicates = concepts.map((c) => c.id).filter((id, i, ids) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  test('uses only the grammatical roles the schema allows', () => {
    const bad = concepts.filter((c) => !ROLES.includes(c.role as GrammaticalRole)).map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('seeds every concept in exactly the supported languages, each with a base form', () => {
    const bad = concepts.flatMap((c) => {
      const languages = Object.keys(c.forms);
      const missing = LANGUAGE_CODES.filter((l) => !languages.includes(l)).map((l) => `${c.id}: no ${l}`);
      const unknown = languages.filter((l) => !LANGUAGE_CODES.includes(l)).map((l) => `${c.id}: unknown ${l}`);
      const noBase = languages.filter((l) => !c.forms[l]?.['base']).map((l) => `${c.id}: no ${l} base`);
      return [...missing, ...unknown, ...noBase];
    });
    expect(bad).toEqual([]);
  });

  test('gives every concept a description, the English definition the seed stores', () => {
    expect(concepts.filter((c) => !c.description.trim()).map((c) => c.id)).toEqual([]);
  });

  test('keeps verb-only fields on verbs', () => {
    const bad = concepts
      .filter((c) => c.role !== 'verb' && (c.transitivity || c.modal || c.complements || c.stative || c.senseOf || c.alarmCry))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  // A person's sex by meaning is what English's link to the subject reads for *her* / *his* (A293).
  // It is kept on persons, and a definition that names FEMALE or MALE must agree with it.
  test('records a sex only on a person noun, in agreement with a definition that names one', () => {
    const misplaced = concepts.filter((c) => c.sex && (c.role !== 'noun' || !c.human)).map((c) => c.id);
    expect(misplaced).toEqual([]);
    const bad = concepts.filter((c) => c.role === 'noun' && c.human && c.definition).flatMap((c) => {
      const gloss = JSON.stringify(c.definition);
      const named = gloss.includes('"FEMALE"') ? 'fem' : gloss.includes('"MALE"') ? 'masc' : undefined;
      return named && named !== c.sex ? [`${c.id}: definition says ${named}, sex ${c.sex ?? 'unset'}`] : [];
    });
    expect(bad).toEqual([]);
    expect(byId.get('MOTHER')?.sex).toBe('fem');
    expect(byId.get('FATHER')?.sex).toBe('masc');
    expect(byId.get('PERSON')?.sex).toBeUndefined();
  });

  test('makes a lexical sense the sense of a seeded concept of its own role, not of another sense', () => {
    const senses = concepts.filter((c) => c.senseOf);
    expect(senses.map((c) => c.id)).toContain('KNOW_ACQUAINTED');
    const bad = senses
      .filter((c) => byId.get(c.senseOf!)?.role !== c.role || byId.get(c.senseOf!)?.senseOf)
      .map((c) => `${c.id} senseOf ${c.senseOf}`);
    expect(bad).toEqual([]);
  });

  // The translator swaps a verb for its `object_sense` when the verb takes an object (A131).
  test('names a seeded sense of the verb itself as a lexeme\'s object sense', () => {
    const bad = concepts.flatMap((c) =>
      Object.entries(c.forms)
        .filter(([, f]) => f['object_sense'] && byId.get(f['object_sense'])?.senseOf !== c.id)
        .map(([l, f]) => `${c.id} (${l}): ${f['object_sense']}`),
    );
    expect(bad).toEqual([]);
  });

  // P09-E43: and for an infinitive. An `infinitive_sense` must name a sense of the verb that names it.
  test('every infinitive_sense names a sense of the verb that names it', () => {
    const naming = concepts.flatMap((c) =>
      Object.entries(c.forms).filter(([, f]) => f['infinitive_sense']).map(([l]) => `${c.id} (${l})`),
    );
    expect(naming).toContain('TELL (it)');
    const bad = concepts.flatMap((c) =>
      Object.entries(c.forms)
        .filter(([, f]) => f['infinitive_sense'] && byId.get(f['infinitive_sense'])?.senseOf !== c.id)
        .map(([l, f]) => `${c.id} (${l}): ${f['infinitive_sense']}`),
    );
    expect(bad).toEqual([]);
  });

  // A157: the same rule for the subject side. A `subject_sense` must name a sense of the verb that
  // names it, or the translator would swap in an unrelated verb.
  test('every subject_sense names a sense of the verb that names it', () => {
    const naming = concepts.flatMap((c) =>
      Object.entries(c.forms).filter(([, f]) => f['subject_sense']).map(([l, f]) => `${c.id} (${l})`),
    );
    expect(naming).toContain('EAT (de)');
    const bad = concepts.flatMap((c) =>
      Object.entries(c.forms)
        .filter(([, f]) => f['subject_sense'] && byId.get(f['subject_sense'])?.senseOf !== c.id)
        .map(([l, f]) => `${c.id} (${l}): ${f['subject_sense']}`),
    );
    expect(bad).toEqual([]);
  });

  // A140 / A144: a German name seeded as its head noun — with fixed words after it in `postnominal`,
  // or an inherent adjective before it — is shown in the picker by its `citation`, which must spell
  // the whole name the engine renders. Without one the picker shows the bare head, which is another
  // concept's word ("Frau" for YOUNG_WOMAN). Each is feminine, so its adjective cites in -e
  // ("adverbiale", "junge"); a masculine one would cite in -er ("junger Mann").
  test('gives a noun with an inherent adjective or words after its head a citation that spells the whole name', () => {
    const named = concepts.flatMap((c) =>
      Object.entries(c.forms)
        .filter(([, f]) => f['postnominal'] || f['adjective'])
        .map(([l, f]) => ({ id: `${c.id} (${l})`, f })),
    );
    expect(named.map((n) => n.id)).toEqual(expect.arrayContaining(['LOCATIVE (de)', 'YOUNG_WOMAN (de)']));
    // The adjective takes its strong nominative ending: German *-e* on these feminines, Swiss German
    // *-e / -i / -es* by gender ("jungi Frau", "adverbiali Bestimmig", P10-E5).
    const ending = (id: string, f: Record<string, string>) =>
      id.endsWith('(gsw)') ? ({ masc: 'e', fem: 'i', neut: 'es' } as Record<string, string>)[f['gender'] ?? 'fem'] : 'e';
    const bad = named
      .filter(({ id, f }) => f['citation'] !== [f['adjective'] ? `${f['adjective']}${ending(id, f)}` : '', f['base'], f['postnominal']].filter(Boolean).join(' '))
      .map((n) => n.id);
    expect(bad).toEqual([]);
  });

  // Against the engine's full list, not the builder's: a verb may license a complement the canvas
  // has no box for (TRANSFORM's objectPredicative, COORDINATE's comitative), which is what makes
  // the UI strings built on them renderable. See COMPLEMENT_TYPES in @signi/shared.
  test('licenses only known complement types', () => {
    const bad = concepts.flatMap((c) =>
      (c.complements ?? [])
        .filter((t) => !(COMPLEMENT_RENDER_ORDER as string[]).includes(t))
        .map((t) => `${c.id}: ${t}`),
    );
    expect(bad).toEqual([]);
  });

  test('forms a valid isA hierarchy', () => {
    expect(() => assertValidHierarchy(concepts)).not.toThrow();
  });

  test('hangs the building nouns under BUILDING → PLACE (B29)', () => {
    // The one generalize failure no validator catches: BUILDING must be *inserted* above HOUSE
    // and PRISON, not substituted for their parent. Both were roots here, so the chain is pure
    // gain — but re-pointing BUILDING later would silently drop them out of the PLACE subtree,
    // the seed would still succeed, and only a wrong render would show it.
    expect(ancestors('BUILDING', byId)).toEqual(['PLACE']);
    expect(ancestors('HOUSE', byId)).toEqual(['BUILDING', 'PLACE']);
    expect(ancestors('PRISON', byId)).toEqual(['BUILDING', 'PLACE']);
    // The siblings that stayed put: BUILDING joined them under PLACE, it did not come between.
    expect(ancestors('HOME', byId)).toEqual(['PLACE']);
    expect(ancestors('MARKET', byId)).toEqual(['PLACE']);
  });

  test('hangs AFFECTION under the FEELING genus (B30)', () => {
    // Same insertion-not-substitution check as B29's. AFFECTION was a root, so the chain is pure
    // gain; FEELING stays a root itself, which is the part a later "tidy the tree" pass could
    // silently break by hanging it under CONCEPT — its gloss "a warm feeling" would still render.
    expect(ancestors('FEELING', byId)).toEqual([]);
    expect(ancestors('AFFECTION', byId)).toEqual(['FEELING']);
  });

  test('hangs the three complement names under COMPLEMENT_GRAMMAR → PHRASE (B31)', () => {
    // B23 seeded COMPLEMENT_GRAMMAR with six children; B31 adds the three that predated it. All
    // nine must reach PHRASE, because each one's gloss is composed on the genus, not on PHRASE.
    expect(ancestors('COMPLEMENT_GRAMMAR', byId)).toEqual(['PHRASE']);
    for (const id of ['SUBJECT_COMPLEMENT', 'INSTRUMENTAL', 'ADVERBIAL_OF_MANNER']) {
      expect(ancestors(id, byId)).toEqual(['COMPLEMENT_GRAMMAR', 'PHRASE']);
    }
    // The six B23 seeded the same way, unchanged by B31.
    for (const id of ['LOCATIVE', 'DIRECTION', 'SOURCE', 'ROUTE', 'CAUSE_COMPLEMENT', 'TERMINUS']) {
      expect(ancestors(id, byId)).toEqual(['COMPLEMENT_GRAMMAR', 'PHRASE']);
    }
  });

  test('relates hypernyms within one role', () => {
    // /api/concepts?role=… relies on this: it returns isA unfiltered, trusting the parent is in
    // the same role's response.
    const bad = concepts
      .filter((c) => c.isA && byId.get(c.isA)?.role !== c.role)
      .map((c) => `${c.id} (${c.role}) isA ${c.isA}`);
    expect(bad).toEqual([]);
  });
});

describe('NONFINITE', () => {
  // The seed folds these in by looking each verb up by id, so an entry under a misspelled id or a
  // language the verb isn't seeded in is dropped without a word.
  test('names only seeded verbs', () => {
    const bad = Object.keys(NONFINITE).filter((id) => byId.get(id)?.role !== 'verb');
    expect(bad).toEqual([]);
  });

  test('names only languages its verb is seeded in', () => {
    const bad = Object.entries(NONFINITE).flatMap(([id, byLanguage]) =>
      Object.keys(byLanguage)
        .filter((l) => !byId.get(id)?.forms[l])
        .map((l) => `${id}:${l}`),
    );
    expect(bad).toEqual([]);
  });
});

// P10-E4: the Swiss German column. While `gsw` is a preview language its forms are optional to the
// seed skills (P10-E1 D1), so completeness is a report, not a boot check — this is it, at 100%.
describe('the Swiss German column (P10-E4)', () => {
  test('gives every concept a gsw lexeme, or names it pending', () => {
    expect(concepts.filter((c) => !c.forms['gsw']).map((c) => c.id)).toEqual([...GSW_PENDING]);
  });

  test('stores no preterite and no genitive — the cells Swiss German does not have (P10 D5, D7)', () => {
    const bad = concepts.flatMap((c) =>
      Object.keys(c.forms['gsw'] ?? {})
        .filter((key) => /_past$/.test(key) || key === 'genitive' || key === 'weak')
        .map((key) => `${c.id}: ${key}`),
    );
    expect(bad).toEqual([]);
  });

  test('gives every verb its participle, the past being the perfect (P10 D5)', () => {
    const bad = concepts.filter((c) => c.role === 'verb' && !c.forms['gsw']?.['participle']).map((c) => c.id);
    expect(bad).toEqual([]);
  });

  // The auxiliary is lexical, as in German, and matches German's everywhere but SIT_DOWN: Zürich
  // *abhocke* is a motion verb, *isch abghockt*, where German's reflexive *sich setzen* takes haben.
  test('selects sii where German selects sein, and only there', () => {
    const selectsBe = (c: (typeof concepts)[number], l: string) =>
      (NONFINITE[c.id]?.[l]?.['aux'] ?? c.forms[l]?.['aux']) === 'be';
    const differ = concepts
      .filter((c) => c.role === 'verb' && selectsBe(c, 'de') !== selectsBe(c, 'gsw'))
      .map((c) => c.id);
    expect(differ).toEqual(['SIT_DOWN']);
  });

  test('gives the Zürich plural one form for all three persons (P10-E4 D3)', () => {
    const bad = concepts.filter((c) => {
      const f = c.forms['gsw'];
      return c.role === 'verb' && f && (f['1pl_present'] !== f['2pl_present'] || f['2pl_present'] !== f['3pl_present']);
    }).map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('spells no ß and no apostrophe (the Dieth style sheet)', () => {
    const bad = concepts.flatMap((c) =>
      Object.entries(c.forms['gsw'] ?? {}).filter(([, v]) => /[ß']/.test(v)).map(([k, v]) => `${c.id}.${k}: ${v}`),
    );
    expect(bad).toEqual([]);
  });
});

// A picker lists concepts by their word, so two verbs that share one in a language look identical
// there unless a gloss beside the word tells them apart (BEGIN / START, both *iniziare*). Italian is
// glossed; the other languages are not yet, and join the list as they are.
describe('picker glosses', () => {
  const GLOSSED: readonly string[] = ['it'];
  const sensed = new Set(concepts.filter((c) => c.senseOf).map((c) => c.id));

  test.each(GLOSSED)('%s: of the verbs that share a word, at most one goes unglossed', (lang) => {
    const byWord = new Map<string, typeof concepts>();
    for (const c of concepts) {
      const word = c.forms[lang]?.['base'];
      if (c.role !== 'verb' || !word || sensed.has(c.id)) continue;
      byWord.set(word, [...(byWord.get(word) ?? []), c]);
    }
    const bare = [...byWord]
      .filter(([, group]) => group.length > 1)
      .map(([word, group]) => [word, group.filter((c) => !c.glosses?.[lang as 'it']).map((c) => c.id)] as const)
      .filter(([, ids]) => ids.length > 1);
    expect(bare).toEqual([]);
  });

  test('a gloss is never the word it glosses, nor another concept\'s gloss for the same word', () => {
    const seen = new Map<string, string>();
    for (const c of concepts) {
      for (const [lang, gloss] of Object.entries(c.glosses ?? {})) {
        expect(gloss, `${c.id} ${lang}`).not.toBe(c.forms[lang]?.['base']);
        const key = `${lang}:${c.forms[lang]?.['base']}:${gloss}`;
        expect(seen.get(key), `${c.id} ${lang}`).toBeUndefined();
        seen.set(key, c.id);
      }
    }
  });
});
