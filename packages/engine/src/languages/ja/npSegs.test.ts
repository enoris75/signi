import { describe, expect, test } from 'vitest';
import {
  adj, BASHO, CHAIRO, CHIISAI, complement, complements, DENSETSU, DESU, el, FUREEZU, HAHA, HITO_GENERIC, HON, IE, IMITEKI, INU, KABE, KODOMO,
  MIZU, MOTSU, NARU, NEKO, NEZUMI, NOMU, np, nounModifier, OKAASAN, OOKII, OYA, SHIAWASE, SOUZOUSHA, vp, WATASHI, YOMU,
} from './ja.fixtures.js';
import { npSegs } from './npSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');

describe('npSegs', () => {
  test('a bare head noun, with its furigana', () => {
    expect(npSegs(np(NEKO))).toEqual([{ t: '猫', r: 'ねこ' }]);
    expect(npSegs(np(NEZUMI))).toEqual([{ t: 'ネズミ' }]);
  });

  test('stacked adjectives run straight into each other and the head', () => {
    expect(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII), adj(CHAIRO)] }))).toEqual([
      { t: '大きい', r: 'おおきい' },
      { t: '茶色の', r: 'ちゃいろの' },
      { t: '猫', r: 'ねこ' },
    ]);
    expect(text(npSegs(np(INU, {}, { adjectives: [adj(SHIAWASE), adj(CHIISAI)] })))).toBe('幸せな小さい犬');
  });

  test('a degree adverb binds to its adjective', () => {
    expect(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII, { degree: 'more' })] }))).toEqual([
      { t: 'もっと' },
      { t: '大きい', r: 'おおきい' },
      { t: '猫', r: 'ねこ' },
    ]);
    expect(text(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII, { degree: 'most' })] })))).toBe('最も大きい猫');
  });

  test('a lowered degree negates the adjective', () => {
    expect(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII, { degree: 'less' })] }))).toEqual([
      { t: 'それほど' },
      { t: '大きくない', r: 'おおきくない' },
      { t: '猫', r: 'ねこ' },
    ]);
  });

  test('the articles spell nothing', () => {
    expect(text(npSegs(np(NEKO, { definiteness: 'definite' })))).toBe('猫');
    expect(text(npSegs(np(NEKO, { definiteness: 'indefinite' })))).toBe('猫');
    expect(text(npSegs(np(MIZU, { definiteness: 'bare' })))).toBe('水');
  });

  test('a demonstrative or quantifier leads the phrase, ahead of its adjectives', () => {
    expect(npSegs(np(NEKO, { definiteness: 'this' }))).toEqual([{ t: 'この' }, { t: '猫', r: 'ねこ' }]);
    expect(text(npSegs(np(INU, { definiteness: 'that' })))).toBe('その犬');
    expect(text(npSegs(np(HON, { definiteness: 'some', number: 'plural' })))).toBe('いくつかの本');
    expect(text(npSegs(np(NEKO, { definiteness: 'many', number: 'plural' })))).toBe('多くの猫');
    expect(text(npSegs(np(MIZU, { definiteness: 'few' })))).toBe('少しの水');
    expect(text(npSegs(np(NEKO, { definiteness: 'all', number: 'plural' }, { adjectives: [adj(OOKII)] })))).toBe('すべての大きい猫');
  });

  // A114: the も closes the circumfix with the case particle (see jaParticleSegs), not here.
  test('the no determiner leads with どの; its も is left to the particle', () => {
    expect(npSegs(np(NEKO, { definiteness: 'no' }))).toEqual([{ t: 'どの' }, { t: '猫', r: 'ねこ' }]);
  });

  test('a noun possessor precedes the head, linked by の, and nests', () => {
    expect(npSegs(np(HON, {}, { possessor: np(NEKO) }))).toEqual([
      { t: '猫', r: 'ねこ' },
      { t: 'の' },
      { t: '本', r: 'ほん' },
    ]);
    expect(text(npSegs(np(HON, {}, { possessor: np(NEKO, {}, { possessor: np(KODOMO) }) })))).toBe('子供の猫の本');
  });

  // A216: a `no` possessor writes its どの and leaves its も to the whole phrase's particle (どの猫の本も),
  // not before its own の (どの猫もの本).
  test('a no-determined possessor leads with どの; its も is left to the phrase', () => {
    expect(text(npSegs(np(HON, {}, { possessor: np(NEKO, { definiteness: 'no' }) })))).toBe('どの猫の本');
    expect(text(npSegs(np(HON, {}, { possessor: np(IE, {}, { possessor: np(NEKO, { definiteness: 'no' }) }) })))).toBe('どの猫の家の本');
  });

  // A185: a prenominal determiner modifies the nearest noun after it, so この猫の本 would read "this
  // cat's book". The head's own determiner belongs behind the possessor's の.
  test('a possessed head keeps its determiner after the possessor, before the adjectives', () => {
    expect(npSegs(np(HON, { definiteness: 'this' }, { possessor: np(NEKO) }))).toEqual([
      { t: '猫', r: 'ねこ' },
      { t: 'の' },
      { t: 'この' },
      { t: '本', r: 'ほん' },
    ]);
    expect(text(npSegs(np(HON, { definiteness: 'many', number: 'plural' }, { possessor: np(NEKO), adjectives: [adj(OOKII)] }))))
      .toBe('猫の多くの大きい本');
    expect(text(npSegs(np(HON, { definiteness: 'no' }, { possessor: np(NEKO) })))).toBe('猫のどの本');
    // The possessor's own determiner still leads the possessor, at every depth.
    expect(text(npSegs(np(HON, { definiteness: 'this' }, { possessor: np(NEKO, { definiteness: 'many', number: 'plural' }) }))))
      .toBe('多くの猫のこの本');
  });

  test('a pronominal possessor is the pronoun + の, before the adjectives', () => {
    const hers = np(INU, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } });
    expect(npSegs(hers)).toEqual([{ t: '彼女', r: 'かのじょ' }, { t: 'の' }, { t: '犬', r: 'いぬ' }]);
    const mine = np(HON, {}, { adjectives: [adj(OOKII)], possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(text(npSegs(mine))).toBe('私の大きい本');
  });

  test('an attributive noun is の-linked, its own adjectives before it', () => {
    const creator = np(SOUZOUSHA, {}, { nounModifiers: [nounModifier(FUREEZU, [adj(IMITEKI)])] });
    expect(npSegs(creator)).toEqual([
      { t: '意味的な', r: 'いみてきな' },
      { t: 'フレーズ' },
      { t: 'の' },
      { t: '創造者', r: 'そうぞうしゃ' },
    ]);
  });

  test('every modifier relation renders the same の', () => {
    for (const relation of ['feature', 'purpose', 'material'] as const) {
      expect(text(npSegs(np(HON, {}, { nounModifiers: [nounModifier(KODOMO, [], relation)] })))).toBe('子供の本');
    }
  });

  test('a subject relative clause precedes the phrase in the plain form', () => {
    const drinks = { headRole: 'subject' as const, verbPhrase: vp(NOMU), directObject: el(np(MIZU)) };
    expect(npSegs(np(NEKO, {}, { relative: drinks }))).toEqual([
      { t: '水', r: 'みず' },
      { t: 'を' },
      { t: '飲む', r: 'のむ' },
      { t: '猫', r: 'ねこ' },
    ]);
    const drank = { ...drinks, verbPhrase: vp(NOMU, { tense: 'past' }) };
    expect(text(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII)], relative: drank })))).toBe('水を飲んだ大きい猫');
  });

  test('a non-subject relative clause leads with its own subject and が', () => {
    const iRead = { headRole: 'directObject' as const, subject: el(np(WATASHI)), verbPhrase: vp(YOMU) };
    expect(npSegs(np(HON, {}, { relative: iRead }))).toEqual([
      { t: '私', r: 'わたし' },
      { t: 'が' },
      { t: '読む', r: 'よむ' },
      { t: '本', r: 'ほん' },
    ]);
  });

  // A150: possession by an inanimate owner is the existential ある, the possession marked が and the
  // owner, when it is the clause's own subject, に.
  test('an inanimate owner\'s possession is the existential in a relative clause', () => {
    const hasWalls = { headRole: 'subject' as const, verbPhrase: vp(MOTSU), directObject: el(np(KABE)) };
    expect(text(npSegs(np(BASHO, { definiteness: 'indefinite' }, { relative: hasWalls })))).toBe('壁がある場所');
    const theHouseHas = { headRole: 'directObject' as const, subject: el(np(IE)), verbPhrase: vp(MOTSU) };
    expect(text(npSegs(np(KABE, {}, { relative: theHouseHas })))).toBe('家にある壁');
  });

  test('regression: an animate owner holds what it has, and leads with が', () => {
    const catHas = { headRole: 'directObject' as const, subject: el(np(NEKO)), verbPhrase: vp(MOTSU) };
    expect(text(npSegs(np(HON, {}, { relative: catHas })))).toBe('猫が持つ本');
  });

  test('a generic relative-clause subject is dropped', () => {
    const oneReads = { headRole: 'directObject' as const, subject: el(np(HITO_GENERIC)), verbPhrase: vp(YOMU) };
    expect(text(npSegs(np(HON, {}, { relative: oneReads })))).toBe('読む本');
  });

  // A123: a head filling the copula's subject complement leaves a gap Japanese fills with そう.
  test('a relative on the copula\'s subject complement fills the gap with そう, in the plain copula', () => {
    const theDogIs = (extra = {}) => ({ headRole: 'predicative' as const, subject: el(np(INU)), verbPhrase: vp(DESU, extra) });
    expect(npSegs(np(DENSETSU, {}, { relative: theDogIs() }))).toEqual([
      { t: '犬', r: 'いぬ' }, { t: 'が' }, { t: 'そう' }, { t: 'である' }, { t: '伝説', r: 'でんせつ' },
    ]);
    expect(text(npSegs(np(DENSETSU, {}, { relative: theDogIs({ negative: true }) })))).toBe('犬がそうではない伝説');
    expect(text(npSegs(np(DENSETSU, {}, { relative: theDogIs({ tense: 'past' }) })))).toBe('犬がそうだった伝説');
    expect(text(npSegs(np(DENSETSU, {}, { relative: { ...theDogIs(), complements: complements({ locative: complement(np(IE)) }) } }))))
      .toBe('犬が家でそうである伝説');
  });

  test('regression: a real verb on the same gap keeps its own form', () => {
    expect(text(npSegs(np(DENSETSU, {}, { relative: { headRole: 'predicative', subject: el(np(INU)), verbPhrase: vp(NARU) } })))).toBe('犬がなる伝説');
  });
  // ── P11: whose relative it is ─────────────────────────────────────────────
  // The word has already been chosen by `applyPossessorForm`; what is left here is the possessor it
  // makes redundant (D4) and the plural that is another word (D7).

  test('私の drops before one\'s own kin noun, which already says whose it is', () => {
    const myMother = np(HAHA, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(npSegs(myMother)).toEqual([{ t: '母', r: 'はは' }]);
  });

  test('私たちの stays: it adds that the relative is shared', () => {
    const ourMother = np(HAHA, {}, { possessor: { kind: 'pronominal', person: '1', number: 'plural' } });
    expect(text(npSegs(ourMother))).toBe('私たちの母');
  });

  test('every other possessor stays, in front of the word it chose', () => {
    expect(text(npSegs(np(OKAASAN, {}, { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }))))
      .toBe('あなたのお母さん');
    expect(text(npSegs(np(OKAASAN, {}, { possessor: np(KODOMO) })))).toBe('子供のお母さん');
    // A genitive possessor is said even where it is one's own: 私の兄の妻 is 兄の妻, not 妻.
    expect(text(npSegs(np(HAHA, {}, { possessor: np(NEKO) })))).toBe('猫の母');
  });

  test('私の stays before a noun that is not one\'s own relative', () => {
    const myBook = np(HON, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(text(npSegs(myBook))).toBe('私の本');
    // …and before a kin noun the possessor did not make one's own (someone else's mother).
    expect(text(npSegs(np(OKAASAN, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))))
      .toBe('私のお母さん');
  });

  test('a plural that is another word is written with its own reading', () => {
    expect(npSegs(np(OYA, { number: 'plural' }))).toEqual([{ t: '両親', r: 'りょうしん' }]);
    const myParents = np(OYA, { number: 'plural' }, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(npSegs(myParents)).toEqual([{ t: '両親', r: 'りょうしん' }]);
  });

  test('a singular kin noun keeps its own word and reading', () => {
    expect(npSegs(np(OYA))).toEqual([{ t: '親', r: 'おや' }]);
  });

  // Japanese nouns otherwise have no plural, so a plural head with no word of its own is unchanged.
  test('a head with no plural surface writes its base', () => {
    expect(text(npSegs(np(NEKO, { number: 'plural' })))).toBe('猫');
  });

  test('a plural pronoun keeps the surface the translator already chose for it', () => {
    // 彼女ら is written into `base` with its own reading; `plural_reading` still holds かれら.
    const they = { base: '彼女ら', reading: 'かのじょら', plural: '彼女ら', plural_reading: 'かれら', person: '3', number: 'plural' };
    expect(npSegs(np(they))).toEqual([{ t: '彼女ら', r: 'かのじょら' }]);
  });
});

describe('npSegs: the attributive standard (P09-E18)', () => {
  const compared = (degree: string, adjectives = [adj(OOKII, { degree, standard: '1' })], index = 0, head: Record<string, string> = {}) =>
    np(NEKO, head, { adjectives, adjectiveStandard: { index, standard: el(np(INU)) } });

  test('the standard takes the degree adverb\'s place', () => {
    expect(text(npSegs(compared('more')))).toBe('犬より大きい猫');
    expect(text(npSegs(compared('less')))).toBe('犬ほど大きくない猫');
    expect(text(npSegs(compared('equally')))).toBe('犬と同じくらい大きい猫');
  });

  test('the compared adjective leads the phrase, so its standard takes no modifier before it', () => {
    expect(text(npSegs(compared('more', [adj(CHAIRO), adj(OOKII, { degree: 'more', standard: '1' })], 1)))).toBe('犬より大きい茶色の猫');
    expect(text(npSegs(compared('more', undefined, 0, { definiteness: 'this' })))).toBe('犬より大きいこの猫');
  });
});
