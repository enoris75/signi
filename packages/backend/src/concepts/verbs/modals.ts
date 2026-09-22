import type { ConceptSeed } from '../types.js';
import type { PhrasePlan } from '@signi/shared';
import { infinitiveGloss } from './gloss.js';

// An **evaluative** modal's gloss: what is judged is the act, not the one who acts, so the act is
// the subject — a content clause, which localization C30 built. evaluativeGloss('RIGHT_CORRECT') →
// en "it is right that one acts", it "è giusto che si agisca", fr "il est juste qu'on agisse", de
// "es ist richtig, dass man handelt", es "es correcto que se actúe", ja 行動することが正しい, pt "é
// certo que se aja".
//
// This is why SHOULD and MIGHT could not take C09's shape, which the other four modals do: "to be
// obliged / able / allowed to act" says the adjective of the **actor**, and *right* and *possible*
// are not said of anyone. The plan's own subject is the throwaway a clausal subject leaves behind.
const evaluativeGloss = (adjective: string): PhrasePlan => ({
  subject: { concept: 'THING' },
  contentSubject: { subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'ACT' } },
  verbPhrase: { verb: 'BE' },
  complements: { predicative: { phrase: { concept: adjective } } },
});

// Each modal is defined by what it governs: an infinitive complement (PhrasePlan.infinitiveComplement)
// under a word that says the modality in plain vocabulary — a duty (OBLIGED), a capacity (ABLE), a
// wish (DESIRE) — over the most general activity verb, ACT (localization C09). None of the three words
// is a modal's own lemma in any language, so no gloss repeats the word it defines: CAN is "potere",
// its gloss "essere capace di agire"; WILL is "want", its gloss "to desire to act".
export const modals: ConceptSeed[] = [
  // ── MODAL VERBS ──────────────────────────────────────────────────
  // A modal governs another verb's infinitive rather than heading a clause, and modals
  // chain ("voglio poter andare"). They conjugate like ordinary verbs, so they live in the
  // verb tables; `modal: true` is what keeps them out of the main-verb picker. Beyond the
  // ordinary conjugation each carries:
  //   nonfinite — the form taken when governed by another modal. Italian apocopates the
  //     infinitive before another infinitive (potere → "poter andare"); English has no
  //     infinitive for its defective modals at all and suppletes ("can" → "be able to").
  //   link — a particle emitted before the governed element. Only English needs one
  //     ("want **to** go"); the Romance and German modals take a bare infinitive.
  // German additionally needs no marking here: its engine stacks the `nonfinite` forms
  // clause-finally in mirror order ("er will gehen können").
  //
  // Japanese has no modal verbs — modality is suffixal — so its entries are shaped
  // differently: `governs` names the form the suffix attaches to, `suffix_dict` /
  // `suffix_stem` are the modal's own dictionary and polite-stem shapes (so an outer modal
  // can attach to it in turn), and `kind` says whether it inflects as a verb or as the
  // i-adjective 〜たい. There is no `base` conjugation to speak of; `base` mirrors the
  // dictionary suffix so the lexeme has a lemma.
  {
    id: 'MUST',
    role: 'verb',
    modal: true,
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    description: 'to be obliged to; necessity',
    // "to be obliged to act"; es/pt "estar obligado a actuar", ja 行動することが義務的である.
    definition: infinitiveGloss('BE', { predicate: 'OBLIGED', infinitive: 'ACT' }),
    synonym: 'have to',
    emoji: '❗',
    forms: {
      en: {
        // Defective: no infinitive, no past, no future — all suppleted by "have to".
        base: 'must', nonfinite: 'have to', nonfinite_perfect: 'have had to',
        '1sg_present': 'must', '2sg_present': 'must', '3sg_present': 'must',
        '1pl_present': 'must', '2pl_present': 'must', '3pl_present': 'must',
        past: 'had to', future: 'will have to',
      },
      it: {
        base: 'dovere', nonfinite: 'dover',
        '1sg_present': 'devo', '2sg_present': 'devi', '3sg_present': 'deve',
        '1pl_present': 'dobbiamo', '2pl_present': 'dovete', '3pl_present': 'devono',
        '1sg_past': 'dovetti', '2sg_past': 'dovesti', '3sg_past': 'dovette',
        '1pl_past': 'dovemmo', '2pl_past': 'doveste', '3pl_past': 'dovettero',
        '1sg_future': 'dovrò', '2sg_future': 'dovrai', '3sg_future': 'dovrà',
        '1pl_future': 'dovremo', '2pl_future': 'dovrete', '3pl_future': 'dovranno',
      },
      fr: {
        base: 'devoir',
        '1sg_present': 'dois', '2sg_present': 'dois', '3sg_present': 'doit',
        '1pl_present': 'devons', '2pl_present': 'devez', '3pl_present': 'doivent',
        '1sg_past': 'dus', '2sg_past': 'dus', '3sg_past': 'dut',
        '1pl_past': 'dûmes', '2pl_past': 'dûtes', '3pl_past': 'durent',
        '1sg_future': 'devrai', '2sg_future': 'devras', '3sg_future': 'devra',
        '1pl_future': 'devrons', '2pl_future': 'devrez', '3pl_future': 'devront',
      },
      de: {
        base: 'müssen',
        '1sg_present': 'muss', '2sg_present': 'musst', '3sg_present': 'muss',
        '1pl_present': 'müssen', '2pl_present': 'müsst', '3pl_present': 'müssen',
        '1sg_past': 'musste', '2sg_past': 'musstest', '3sg_past': 'musste',
        '1pl_past': 'mussten', '2pl_past': 'musstet', '3pl_past': 'mussten',
      },
      es: {
        base: 'deber',
        '1sg_present': 'debo', '2sg_present': 'debes', '3sg_present': 'debe',
        '1pl_present': 'debemos', '2pl_present': 'debéis', '3pl_present': 'deben',
        '1sg_past': 'debí', '2sg_past': 'debiste', '3sg_past': 'debió',
        '1pl_past': 'debimos', '2pl_past': 'debisteis', '3pl_past': 'debieron',
        '1sg_future': 'deberé', '2sg_future': 'deberás', '3sg_future': 'deberá',
        '1pl_future': 'deberemos', '2pl_future': 'deberéis', '3pl_future': 'deberán',
      },
      ja: {
        // 〜必要がある ("there is a need to V"): the periphrasis avoids the nai-stem that
        // 〜なければならない would need, and it is derivable from the dictionary form alone.
        base: '必要がある', reading: 'ひつようがある', kind: 'verb', governs: 'dict',
        suffix_dict: '必要がある', suffix_dict_reading: 'ひつようがある',
        suffix_stem: '必要があり', suffix_stem_reading: 'ひつようがあり',
      },
      pt: {
        base: 'dever',
        '1sg_present': 'devo', '2sg_present': 'deve', '3sg_present': 'deve',
        '1pl_present': 'devemos', '2pl_present': 'devem', '3pl_present': 'devem',
        '1sg_past': 'devi', '2sg_past': 'deveu', '3sg_past': 'deveu',
        '1pl_past': 'devemos', '2pl_past': 'deveram', '3pl_past': 'deveram',
        '1sg_future': 'deverei', '2sg_future': 'deverá', '3sg_future': 'deverá',
        '1pl_future': 'deveremos', '2pl_future': 'deverão', '3pl_future': 'deverão',
      },
    },
  },
  {
    id: 'CAN',
    role: 'verb',
    modal: true,
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    description: 'to be able to; ability or permission',
    // "to be able to act"; it "essere capace di agire", ja 行動することが可能である.
    definition: infinitiveGloss('BE', { predicate: 'ABLE', infinitive: 'ACT' }),
    synonym: 'be able to',
    emoji: '💪',
    forms: {
      en: {
        // Defective: "can" has only a present and a past ("could"); everything else is "be able to".
        base: 'can', nonfinite: 'be able to', nonfinite_perfect: 'have been able to',
        '1sg_present': 'can', '2sg_present': 'can', '3sg_present': 'can',
        '1pl_present': 'can', '2pl_present': 'can', '3pl_present': 'can',
        past: 'could', future: 'will be able to',
      },
      it: {
        base: 'potere', nonfinite: 'poter',
        '1sg_present': 'posso', '2sg_present': 'puoi', '3sg_present': 'può',
        '1pl_present': 'possiamo', '2pl_present': 'potete', '3pl_present': 'possono',
        '1sg_past': 'potei', '2sg_past': 'potesti', '3sg_past': 'poté',
        '1pl_past': 'potemmo', '2pl_past': 'poteste', '3pl_past': 'poterono',
        '1sg_future': 'potrò', '2sg_future': 'potrai', '3sg_future': 'potrà',
        '1pl_future': 'potremo', '2pl_future': 'potrete', '3pl_future': 'potranno',
      },
      fr: {
        base: 'pouvoir',
        '1sg_present': 'peux', '2sg_present': 'peux', '3sg_present': 'peut',
        '1pl_present': 'pouvons', '2pl_present': 'pouvez', '3pl_present': 'peuvent',
        '1sg_past': 'pus', '2sg_past': 'pus', '3sg_past': 'put',
        '1pl_past': 'pûmes', '2pl_past': 'pûtes', '3pl_past': 'purent',
        '1sg_future': 'pourrai', '2sg_future': 'pourras', '3sg_future': 'pourra',
        '1pl_future': 'pourrons', '2pl_future': 'pourrez', '3pl_future': 'pourront',
      },
      de: {
        base: 'können',
        '1sg_present': 'kann', '2sg_present': 'kannst', '3sg_present': 'kann',
        '1pl_present': 'können', '2pl_present': 'könnt', '3pl_present': 'können',
        '1sg_past': 'konnte', '2sg_past': 'konntest', '3sg_past': 'konnte',
        '1pl_past': 'konnten', '2pl_past': 'konntet', '3pl_past': 'konnten',
      },
      es: {
        base: 'poder',
        '1sg_present': 'puedo', '2sg_present': 'puedes', '3sg_present': 'puede',
        '1pl_present': 'podemos', '2pl_present': 'podéis', '3pl_present': 'pueden',
        '1sg_past': 'pude', '2sg_past': 'pudiste', '3sg_past': 'pudo',
        '1pl_past': 'pudimos', '2pl_past': 'pudisteis', '3pl_past': 'pudieron',
        '1sg_future': 'podré', '2sg_future': 'podrás', '3sg_future': 'podrá',
        '1pl_future': 'podremos', '2pl_future': 'podréis', '3pl_future': 'podrán',
      },
      ja: {
        // 〜ことができる: the periphrastic potential, derivable from the dictionary form
        // (the synthetic potential 行ける/食べられる is irregular per verb class).
        // `potential` marks it out among the modals: an agentless passive under it is said on the
        // active verb, because the potential already demotes the agent (see `isPotentialPassive`).
        base: 'ことができる', kind: 'verb', governs: 'dict', potential: '1',
        suffix_dict: 'ことができる', suffix_stem: 'ことができ',
      },
      pt: {
        base: 'poder',
        '1sg_present': 'posso', '2sg_present': 'pode', '3sg_present': 'pode',
        '1pl_present': 'podemos', '2pl_present': 'podem', '3pl_present': 'podem',
        '1sg_past': 'pude', '2sg_past': 'pôde', '3sg_past': 'pôde',
        '1pl_past': 'pudemos', '2pl_past': 'puderam', '3pl_past': 'puderam',
        '1sg_future': 'poderei', '2sg_future': 'poderá', '3sg_future': 'poderá',
        '1pl_future': 'poderemos', '2pl_future': 'poderão', '3pl_future': 'poderão',
      },
    },
  },
  {
    id: 'WILL',
    role: 'verb',
    modal: true,
    stative: true, // a state: the Romance past is its imperfect, Japanese its 〜ている (A130, A132)
    description: 'to want to; volition',
    // "to desire to act"; de "wünschen, zu handeln", ja 行動することを望む.
    definition: infinitiveGloss('DESIRE', { infinitive: 'ACT' }),
    // The English lemma is "want", so the gloss disambiguates rather than repeating it.
    synonym: 'wish',
    emoji: '🎯',
    forms: {
      en: {
        // The volitional "will" is the lexical verb "want", which needs "to" before its
        // infinitive and negates with do-support ("does not want to go") — unlike the
        // defective must/can above. Its `link` is what supplies that "to".
        base: 'want', nonfinite: 'want', nonfinite_perfect: 'have wanted', link: 'to',
        '1sg_present': 'want', '2sg_present': 'want', '3sg_present': 'wants',
        '1pl_present': 'want', '2pl_present': 'want', '3pl_present': 'want',
        past: 'wanted', future: 'will want',
      },
      it: {
        base: 'volere', nonfinite: 'voler',
        '1sg_present': 'voglio', '2sg_present': 'vuoi', '3sg_present': 'vuole',
        '1pl_present': 'vogliamo', '2pl_present': 'volete', '3pl_present': 'vogliono',
        '1sg_past': 'volli', '2sg_past': 'volesti', '3sg_past': 'volle',
        '1pl_past': 'volemmo', '2pl_past': 'voleste', '3pl_past': 'vollero',
        '1sg_future': 'vorrò', '2sg_future': 'vorrai', '3sg_future': 'vorrà',
        '1pl_future': 'vorremo', '2pl_future': 'vorrete', '3pl_future': 'vorranno',
      },
      fr: {
        base: 'vouloir',
        '1sg_present': 'veux', '2sg_present': 'veux', '3sg_present': 'veut',
        '1pl_present': 'voulons', '2pl_present': 'voulez', '3pl_present': 'veulent',
        '1sg_past': 'voulus', '2sg_past': 'voulus', '3sg_past': 'voulut',
        '1pl_past': 'voulûmes', '2pl_past': 'voulûtes', '3pl_past': 'voulurent',
        '1sg_future': 'voudrai', '2sg_future': 'voudras', '3sg_future': 'voudra',
        '1pl_future': 'voudrons', '2pl_future': 'voudrez', '3pl_future': 'voudront',
      },
      de: {
        base: 'wollen',
        '1sg_present': 'will', '2sg_present': 'willst', '3sg_present': 'will',
        '1pl_present': 'wollen', '2pl_present': 'wollt', '3pl_present': 'wollen',
        '1sg_past': 'wollte', '2sg_past': 'wolltest', '3sg_past': 'wollte',
        '1pl_past': 'wollten', '2pl_past': 'wolltet', '3pl_past': 'wollten',
      },
      es: {
        base: 'querer',
        '1sg_present': 'quiero', '2sg_present': 'quieres', '3sg_present': 'quiere',
        '1pl_present': 'queremos', '2pl_present': 'queréis', '3pl_present': 'quieren',
        '1sg_past': 'quise', '2sg_past': 'quisiste', '3sg_past': 'quiso',
        '1pl_past': 'quisimos', '2pl_past': 'quisisteis', '3pl_past': 'quisieron',
        '1sg_future': 'querré', '2sg_future': 'querrás', '3sg_future': 'querrá',
        '1pl_future': 'querremos', '2pl_future': 'querréis', '3pl_future': 'querrán',
      },
      ja: {
        // 〜たい attaches to the polite stem (行き + たい) and inflects as an i-adjective.
        base: 'たい', kind: 'iadj', governs: 'stem',
        suffix_dict: 'たい', suffix_stem: 'たく',
      },
      pt: {
        base: 'querer',
        '1sg_present': 'quero', '2sg_present': 'quer', '3sg_present': 'quer',
        '1pl_present': 'queremos', '2pl_present': 'querem', '3pl_present': 'querem',
        '1sg_past': 'quis', '2sg_past': 'quis', '3sg_past': 'quis',
        '1pl_past': 'quisemos', '2pl_past': 'quiseram', '3pl_past': 'quiseram',
        '1sg_future': 'quererei', '2sg_future': 'quererá', '3sg_future': 'quererá',
        '1pl_future': 'quereremos', '2pl_future': 'quererão', '3pl_future': 'quererão',
      },
    },
  },
  // ── P09's three modals (localization B63) ────────────────────────
  // MAY is permission only, glossed on ALLOWED as MUST is on OBLIGED and CAN on ABLE. Possibility is
  // MIGHT's: German and Japanese split the two as English does (dürfen / könnte, 〜ことが許される /
  // 〜かもしれない). In it/fr/es/pt MAY is CAN's own verb (potere, pouvoir, poder), so the Romance modal
  // pickers list it twice and only the tooltip tells them apart ("essere autorizzato ad agire" against
  // "essere capace di agire").
  {
    id: 'MAY',
    role: 'verb',
    modal: true,
    stative: true, // a state: the Romance past is its imperfect (poteva), as CAN's is (A130)
    description: 'to be allowed to; permission',
    // "to be allowed to act"; es/pt "estar autorizado a actuar", ja 行動することが許可されている.
    definition: infinitiveGloss('BE', { predicate: 'ALLOWED', infinitive: 'ACT' }),
    synonym: 'be allowed to',
    emoji: '🎫',
    forms: {
      en: {
        // Defective like "can": the past and the future are suppleted by "be allowed to", whose "be"
        // is an auxiliary of its own ("was not allowed to", "was the man allowed to …?").
        base: 'may', nonfinite: 'be allowed to', nonfinite_perfect: 'have been allowed to',
        '1sg_present': 'may', '2sg_present': 'may', '3sg_present': 'may',
        '1pl_present': 'may', '2pl_present': 'may', '3pl_present': 'may',
        '1sg_past': 'was allowed to', '2sg_past': 'were allowed to', '3sg_past': 'was allowed to',
        '1pl_past': 'were allowed to', '2pl_past': 'were allowed to', '3pl_past': 'were allowed to',
        future: 'will be allowed to',
      },
      it: {
        base: 'potere', nonfinite: 'poter',
        '1sg_present': 'posso', '2sg_present': 'puoi', '3sg_present': 'può',
        '1pl_present': 'possiamo', '2pl_present': 'potete', '3pl_present': 'possono',
        '1sg_past': 'potei', '2sg_past': 'potesti', '3sg_past': 'poté',
        '1pl_past': 'potemmo', '2pl_past': 'poteste', '3pl_past': 'poterono',
        '1sg_future': 'potrò', '2sg_future': 'potrai', '3sg_future': 'potrà',
        '1pl_future': 'potremo', '2pl_future': 'potrete', '3pl_future': 'potranno',
      },
      fr: {
        base: 'pouvoir',
        '1sg_present': 'peux', '2sg_present': 'peux', '3sg_present': 'peut',
        '1pl_present': 'pouvons', '2pl_present': 'pouvez', '3pl_present': 'peuvent',
        '1sg_past': 'pus', '2sg_past': 'pus', '3sg_past': 'put',
        '1pl_past': 'pûmes', '2pl_past': 'pûtes', '3pl_past': 'purent',
        '1sg_future': 'pourrai', '2sg_future': 'pourras', '3sg_future': 'pourra',
        '1pl_future': 'pourrons', '2pl_future': 'pourrez', '3pl_future': 'pourront',
      },
      de: {
        base: 'dürfen',
        '1sg_present': 'darf', '2sg_present': 'darfst', '3sg_present': 'darf',
        '1pl_present': 'dürfen', '2pl_present': 'dürft', '3pl_present': 'dürfen',
        '1sg_past': 'durfte', '2sg_past': 'durftest', '3sg_past': 'durfte',
        '1pl_past': 'durften', '2pl_past': 'durftet', '3pl_past': 'durften',
      },
      es: {
        base: 'poder',
        '1sg_present': 'puedo', '2sg_present': 'puedes', '3sg_present': 'puede',
        '1pl_present': 'podemos', '2pl_present': 'podéis', '3pl_present': 'pueden',
        '1sg_past': 'pude', '2sg_past': 'pudiste', '3sg_past': 'pudo',
        '1pl_past': 'pudimos', '2pl_past': 'pudisteis', '3pl_past': 'pudieron',
        '1sg_future': 'podré', '2sg_future': 'podrás', '3sg_future': 'podrá',
        '1pl_future': 'podremos', '2pl_future': 'podréis', '3pl_future': 'podrán',
      },
      ja: {
        // 〜ことが許される ("acting is permitted"), on the dictionary form as 〜ことができる is. The everyday
        // 〜てもいい would govern the te-form, which no modal can. 許される is ichidan, so it takes the
        // endings the engine writes for できる.
        base: 'ことが許される', reading: 'ことがゆるされる', kind: 'verb', governs: 'dict',
        suffix_dict: 'ことが許される', suffix_dict_reading: 'ことがゆるされる',
        suffix_stem: 'ことが許され', suffix_stem_reading: 'ことがゆるされ',
      },
      pt: {
        base: 'poder',
        '1sg_present': 'posso', '2sg_present': 'pode', '3sg_present': 'pode',
        '1pl_present': 'podemos', '2pl_present': 'podem', '3pl_present': 'podem',
        '1sg_past': 'pude', '2sg_past': 'pôde', '3sg_past': 'pôde',
        '1pl_past': 'pudemos', '2pl_past': 'puderam', '3pl_past': 'puderam',
        '1sg_future': 'poderei', '2sg_future': 'poderá', '3sg_future': 'poderá',
        '1pl_future': 'poderemos', '2pl_future': 'poderão', '3pl_future': 'poderão',
      },
    },
  },
  // SHOULD and MIGHT are conditionals, so neither is `stative`: a stative modal's Romance past is
  // derived as an imperfect (French from the 1pl present, which here would give *devriait*), where
  // their past is the conditional perfect seeded below ("avrebbe dovuto correre", "aurait dû
  // courir"). Their present is the conditional (dovrebbe, devrait, sollte, debería), and they have no
  // future of their own: the Romance future falls back to it. English and German mark it with
  // `conditional`, which the engine reads: the future is the present, and the past is the perfect
  // under the modal ("should have run", "hätte laufen sollen"). Their glosses wait on a content clause
  // (C30): each judges the act, "it is right / possible that one acts".
  {
    id: 'SHOULD',
    role: 'verb',
    modal: true,
    description: 'ought to; what is right or advisable to do',
    definition: evaluativeGloss('RIGHT_CORRECT'),
    synonym: 'ought to',
    emoji: '🫵',
    forms: {
      en: {
        // A true modal auxiliary: "should not run", "should the man run?". Governed by another modal
        // it is suppleted by "be supposed to".
        base: 'should', nonfinite: 'be supposed to', nonfinite_perfect: 'have been supposed to', conditional: '1',
        '1sg_present': 'should', '2sg_present': 'should', '3sg_present': 'should',
        '1pl_present': 'should', '2pl_present': 'should', '3pl_present': 'should',
      },
      it: {
        base: 'dovere', nonfinite: 'dover',
        '1sg_present': 'dovrei', '2sg_present': 'dovresti', '3sg_present': 'dovrebbe',
        '1pl_present': 'dovremmo', '2pl_present': 'dovreste', '3pl_present': 'dovrebbero',
        '1sg_past': 'avrei dovuto', '2sg_past': 'avresti dovuto', '3sg_past': 'avrebbe dovuto',
        '1pl_past': 'avremmo dovuto', '2pl_past': 'avreste dovuto', '3pl_past': 'avrebbero dovuto',
      },
      fr: {
        base: 'devoir', subjunctive_stem: 'dev',
        '1sg_present': 'devrais', '2sg_present': 'devrais', '3sg_present': 'devrait',
        '1pl_present': 'devrions', '2pl_present': 'devriez', '3pl_present': 'devraient',
        '1sg_past': 'aurais dû', '2sg_past': 'aurais dû', '3sg_past': 'aurait dû',
        '1pl_past': 'aurions dû', '2pl_past': 'auriez dû', '3pl_past': 'auraient dû',
      },
      de: {
        // The Konjunktiv II of sollen, which is its Präteritum.
        base: 'sollen', conditional: '1',
        '1sg_present': 'sollte', '2sg_present': 'solltest', '3sg_present': 'sollte',
        '1pl_present': 'sollten', '2pl_present': 'solltet', '3pl_present': 'sollten',
      },
      es: {
        base: 'deber', subjunctive_stem: 'debie',
        '1sg_present': 'debería', '2sg_present': 'deberías', '3sg_present': 'debería',
        '1pl_present': 'deberíamos', '2pl_present': 'deberíais', '3pl_present': 'deberían',
        '1sg_past': 'habría debido', '2sg_past': 'habrías debido', '3sg_past': 'habría debido',
        '1pl_past': 'habríamos debido', '2pl_past': 'habríais debido', '3pl_past': 'habrían debido',
      },
      ja: {
        // 〜べき on the dictionary form, a noun-like word the copula closes: `kind: 'copula'` inflects it
        // as a predicate noun does (走るべきです / 走るべきではありません / 走るべきでした), where a verb kind
        // would read 走るべきであります. Governed by another modal it is 〜べきである.
        base: 'べきである', kind: 'copula', governs: 'dict',
        suffix_dict: 'べきである', suffix_stem: 'べきであり',
      },
      pt: {
        base: 'dever', subjunctive_stem: 'deve',
        '1sg_present': 'deveria', '2sg_present': 'deveria', '3sg_present': 'deveria',
        '1pl_present': 'deveríamos', '2pl_present': 'deveriam', '3pl_present': 'deveriam',
        '1sg_past': 'teria devido', '2sg_past': 'teria devido', '3sg_past': 'teria devido',
        '1pl_past': 'teríamos devido', '2pl_past': 'teriam devido', '3pl_past': 'teriam devido',
      },
    },
  },
  {
    id: 'MIGHT',
    role: 'verb',
    modal: true,
    description: 'possibly will; possibility',
    definition: evaluativeGloss('POSSIBLE'),
    synonym: 'possibly',
    emoji: '🎲',
    forms: {
      en: {
        // A true modal auxiliary with no infinitive and no paraphrase that keeps its sense under
        // another modal: governed, it is the adverb "possibly" ("wants to possibly run"), which leaves
        // the perfect of a past to the verb after it ("should possibly have run").
        base: 'might', nonfinite: 'possibly', conditional: '1',
        '1sg_present': 'might', '2sg_present': 'might', '3sg_present': 'might',
        '1pl_present': 'might', '2pl_present': 'might', '3pl_present': 'might',
      },
      it: {
        base: 'potere', nonfinite: 'poter',
        '1sg_present': 'potrei', '2sg_present': 'potresti', '3sg_present': 'potrebbe',
        '1pl_present': 'potremmo', '2pl_present': 'potreste', '3pl_present': 'potrebbero',
        '1sg_past': 'avrei potuto', '2sg_past': 'avresti potuto', '3sg_past': 'avrebbe potuto',
        '1pl_past': 'avremmo potuto', '2pl_past': 'avreste potuto', '3pl_past': 'avrebbero potuto',
      },
      fr: {
        base: 'pouvoir', subjunctive_stem: 'pouv',
        '1sg_present': 'pourrais', '2sg_present': 'pourrais', '3sg_present': 'pourrait',
        '1pl_present': 'pourrions', '2pl_present': 'pourriez', '3pl_present': 'pourraient',
        '1sg_past': 'aurais pu', '2sg_past': 'aurais pu', '3sg_past': 'aurait pu',
        '1pl_past': 'aurions pu', '2pl_past': 'auriez pu', '3pl_past': 'auraient pu',
      },
      de: {
        // The Konjunktiv II of können.
        base: 'können', conditional: '1',
        '1sg_present': 'könnte', '2sg_present': 'könntest', '3sg_present': 'könnte',
        '1pl_present': 'könnten', '2pl_present': 'könntet', '3pl_present': 'könnten',
      },
      es: {
        base: 'poder', subjunctive_stem: 'pudie',
        '1sg_present': 'podría', '2sg_present': 'podrías', '3sg_present': 'podría',
        '1pl_present': 'podríamos', '2pl_present': 'podríais', '3pl_present': 'podrían',
        '1sg_past': 'habría podido', '2sg_past': 'habrías podido', '3sg_past': 'habría podido',
        '1pl_past': 'habríamos podido', '2pl_past': 'habríais podido', '3pl_past': 'habrían podido',
      },
      ja: {
        // 〜かもしれない keeps its own ending: the verb before it takes the polarity and the tense in its
        // plain form (走らないかもしれません, 走ったかもしれません), and the suffix only the politeness.
        // `governs: 'plain'` says so.
        base: 'かもしれない', governs: 'plain', suffix_dict: 'かもしれない',
      },
      pt: {
        base: 'poder', subjunctive_stem: 'pude',
        '1sg_present': 'poderia', '2sg_present': 'poderia', '3sg_present': 'poderia',
        '1pl_present': 'poderíamos', '2pl_present': 'poderiam', '3pl_present': 'poderiam',
        '1sg_past': 'teria podido', '2sg_past': 'teria podido', '3sg_past': 'teria podido',
        '1pl_past': 'teríamos podido', '2pl_past': 'teriam podido', '3pl_past': 'teriam podido',
      },
    },
  },
];
