import type { ConceptSeed } from './types.js';

/**
 * Antonyms and synonyms between concepts, stored as `antonym` / `synonym` rows in
 * concept_relations and shown in the word pickers beside the definition.
 *
 * Like the hypernym, these hold between *meanings*, so a pair is written once here rather than once
 * per language: BIG is the opposite of SMALL in every language the concepts are rendered in. Each
 * pair is symmetric and is stored in both directions. A concept may have several antonyms (OLD is
 * the opposite of NEW and of YOUNG).
 *
 * Both concepts of a pair share a role, and neither is a `senseOf` concept, which no picker lists.
 * A pair is an antonym or a synonym, never both, and never written twice.
 *
 * An antonym is a word a dictionary gives as the opposite of *this* sense: the complementary pair
 * (LIVE_ALIVE / DIE), the gradable pair (HOT / COLD), the converse pair (BUY / SELL), and the male and
 * female of a person noun (FATHER / MOTHER). A concept whose opposite is not seeded yet (FULL for
 * EMPTY) has none until it is. A synonym is a concept a dictionary gives for the same sense in
 * another word — BEGIN and START — not a hypernym (SEE / PERCEIVE), which the isA tree already says.
 * A synonym that is only another word for the *same* concept is an alias (`ConceptSeed.aliases`).
 */
export const ANTONYMS: readonly (readonly [string, string])[] = [
  // ── adjectives ──
  ['ACTIVE_VOICE', 'PASSIVE'],
  ['ADDED', 'REMOVED'],
  ['BAD', 'GOOD'],
  ['BIG', 'SMALL'],
  ['BLACK', 'WHITE'],
  ['CLOSED', 'OPEN_ADJECTIVE'],
  ['COLD', 'HOT'],
  ['COLD_CLIMATE', 'HOT_CLIMATE'],
  ['COORDINATED', 'SUBORDINATE'],
  ['DEFINITE', 'INDEFINITE'],
  ['DIFFERENT', 'SAME'],
  ['DIRECT', 'INDIRECT'],
  ['DISTAL', 'PROXIMAL'],
  ['DOMESTIC', 'WILD'],
  ['ELDER', 'YOUNGER'],
  ['FAR', 'NEAR'],
  ['FEMALE', 'MALE'],
  ['FIRST', 'LAST_FINAL'],
  ['FUTURE', 'PAST'],
  ['GREAT', 'LOW'],
  ['HAPPY', 'SAD'],
  ['HIDDEN', 'VISIBLE'],
  ['HIGH', 'LOW'],
  ['KNOWN', 'UNKNOWN'],
  ['LAST_PREVIOUS', 'NEXT_COMING'],
  ['LINKED', 'UNCONNECTED'],
  ['MAIN', 'SUBORDINATE'],
  ['MANIFOLD', 'SOLE'],
  ['MULTAL', 'PAUCAL'],
  ['NEGATIVE', 'POSITIVE'],
  ['NEW', 'OLD'],
  ['NEXT', 'PREVIOUS'],
  ['OLD', 'YOUNG'],
  ['OTHER', 'SAME'],
  ['PINNED', 'UNPINNED'],
  ['PLURAL', 'SINGULAR'],
  ['STRONG', 'WEAK'],

  // ── adverbs ──
  ['A_LITTLE', 'VERY'],
  ['ALWAYS', 'NEVER'],
  ['DOWN', 'UP'],
  ['FAST', 'SLOWLY'],
  ['HERE', 'THERE'],
  ['LEFT', 'RIGHT'],
  ['NO_LONGER', 'STILL'],
  ['ONCE', 'REPEATEDLY'],

  // ── verbs ──
  ['ADD', 'REMOVE'],
  ['ANSWER', 'ASK'],
  ['BUY', 'SELL'],
  ['CLOSE', 'OPEN'],
  ['COME', 'GO'],
  ['COMPACT', 'EXPAND'],
  ['CONTINUE', 'STOP'],
  ['CONTINUE_DOING', 'STOP_DOING'],
  ['CREATE', 'DESTROY'],
  ['DIE', 'LIVE_ALIVE'],
  ['EXPORT', 'IMPORT'],
  ['EXTINGUISH', 'SET_ON_FIRE'],
  ['FIND', 'LOSE'],
  ['FOLLOW', 'PRECEDE'],
  ['GIVE', 'TAKE'],
  ['HIDE', 'SHOW'],
  ['KEEP', 'LOSE'],
  ['LEAVE', 'STAY'],
  ['LOSE_GAME', 'WIN'],
  ['PIN', 'UNPIN'],
  ['REDO', 'UNDO'],
  ['SIT_DOWN', 'STAND_UP'],
  ['START', 'STOP'],

  // ── nouns ──
  ['AUNT', 'UNCLE'],
  ['BEGINNING', 'END'],
  ['BOY', 'GIRL'],
  ['BOYFRIEND', 'GIRLFRIEND'],
  ['BROTHER', 'SISTER'],
  ['BROTHER_IN_LAW', 'SISTER_IN_LAW'],
  ['CHILD_OFFSPRING', 'PARENT'],
  ['DAD', 'MOM'],
  ['DAUGHTER', 'SON'],
  ['DAUGHTER_IN_LAW', 'SON_IN_LAW'],
  ['DAY', 'NIGHT'],
  ['DEATH', 'LIFE'],
  ['DESTINATION', 'ORIGIN'],
  ['FATHER', 'MOTHER'],
  ['FATHER_IN_LAW', 'MOTHER_IN_LAW'],
  ['FOLLY', 'WISDOM'],
  ['FUTURE_TENSE', 'PAST_TENSE'],
  ['GRANDCHILD', 'GRANDPARENT'],
  ['GRANDDAUGHTER', 'GRANDSON'],
  ['GRANDFATHER', 'GRANDMOTHER'],
  ['HUSBAND', 'WIFE'],
  ['JOY', 'SORROW'],
  ['MAN', 'WOMAN'],
  ['NEPHEW', 'NIECE'],
  ['PLURAL_GRAMMAR', 'SINGULAR_GRAMMAR'],
  ['STEPFATHER', 'STEPMOTHER'],
  ['YOUNG_MAN', 'YOUNG_WOMAN'],
];

export const SYNONYMS: readonly (readonly [string, string])[] = [
  // ── adverbs ──
  ['ACTUALLY', 'REALLY'],
  ['JUST', 'RECENTLY'],
  ['OFTEN', 'REPEATEDLY'],

  // ── verbs ──
  ['ACQUIRE', 'GET'],
  ['BEAT', 'STRIKE'],
  ['BEGIN', 'START'],
  ['CREATE', 'MAKE'],
  ['LEAVE', 'LEAVE_DEPART'],

  // ── nouns ──
  ['CATEGORY', 'KIND_SORT'],
  ['CHILD', 'KID'],
  ['COMMAND', 'ORDER'],
  ['COUNTRY', 'NATION'],
  ['COUNTRY', 'STATE_NATION'],
  ['DAD', 'FATHER'],
  ['GUY', 'MAN'],
  ['ISSUE', 'PROBLEM'],
  ['MOM', 'MOTHER'],
];

type Node = Pick<ConceptSeed, 'id' | 'role' | 'senseOf'>;

/**
 * Reject a pair the pickers could not show: one naming a concept that is not seeded or is a
 * `senseOf` concept, one across roles, a concept paired with itself, a pair written twice, or a
 * pair that is both an antonym and a synonym. Called by the seed with the hierarchy check.
 */
export function assertValidLexicalRelations(
  seeds: readonly Node[],
  antonyms: readonly (readonly [string, string])[] = ANTONYMS,
  synonyms: readonly (readonly [string, string])[] = SYNONYMS,
): void {
  const byId = new Map(seeds.map((s) => [s.id, s]));
  const seen = new Map<string, string>();
  for (const [relation, pairs] of [['antonym', antonyms], ['synonym', synonyms]] as const) {
    for (const [a, b] of pairs) {
      for (const id of [a, b]) {
        const c = byId.get(id);
        if (!c) throw new Error(`The ${relation} pair ${a} / ${b} names "${id}", which is not a seeded concept.`);
        if (c.senseOf) throw new Error(`The ${relation} pair ${a} / ${b} names ${id}, a sense of ${c.senseOf} no picker lists.`);
      }
      if (a === b) throw new Error(`${a} is paired with itself as its own ${relation}.`);
      if (byId.get(a)!.role !== byId.get(b)!.role) {
        throw new Error(`The ${relation} pair ${a} / ${b} joins two roles, ${byId.get(a)!.role} and ${byId.get(b)!.role}.`);
      }
      const key = [a, b].sort().join('/');
      const earlier = seen.get(key);
      if (earlier) {
        throw new Error(
          earlier === relation
            ? `The ${relation} pair ${a} / ${b} is written twice.`
            : `${a} / ${b} is both an antonym and a synonym.`,
        );
      }
      seen.set(key, relation);
    }
  }
}
