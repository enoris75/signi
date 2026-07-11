import type { ConceptSeed } from '../types.js';

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
    description: 'to be obliged to; necessity',
    synonym: 'have to',
    emoji: '❗',
    forms: {
      en: {
        // Defective: no infinitive, no past, no future — all suppleted by "have to".
        base: 'must', nonfinite: 'have to',
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
        '1sg_present': 'devo', '2sg_present': 'deves', '3sg_present': 'deve',
        '1pl_present': 'devemos', '2pl_present': 'deveis', '3pl_present': 'devem',
        '1sg_past': 'devi', '2sg_past': 'deveste', '3sg_past': 'deveu',
        '1pl_past': 'devemos', '2pl_past': 'devestes', '3pl_past': 'deveram',
        '1sg_future': 'deverei', '2sg_future': 'deverás', '3sg_future': 'deverá',
        '1pl_future': 'deveremos', '2pl_future': 'devereis', '3pl_future': 'deverão',
      },
    },
  },
  {
    id: 'CAN',
    role: 'verb',
    modal: true,
    description: 'to be able to; ability or permission',
    synonym: 'be able to',
    emoji: '💪',
    forms: {
      en: {
        // Defective: "can" has only a present and a past ("could"); everything else is "be able to".
        base: 'can', nonfinite: 'be able to',
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
        base: 'ことができる', kind: 'verb', governs: 'dict',
        suffix_dict: 'ことができる', suffix_stem: 'ことができ',
      },
      pt: {
        base: 'poder',
        '1sg_present': 'posso', '2sg_present': 'podes', '3sg_present': 'pode',
        '1pl_present': 'podemos', '2pl_present': 'podeis', '3pl_present': 'podem',
        '1sg_past': 'pude', '2sg_past': 'pudeste', '3sg_past': 'pôde',
        '1pl_past': 'pudemos', '2pl_past': 'pudestes', '3pl_past': 'puderam',
        '1sg_future': 'poderei', '2sg_future': 'poderás', '3sg_future': 'poderá',
        '1pl_future': 'poderemos', '2pl_future': 'podereis', '3pl_future': 'poderão',
      },
    },
  },
  {
    id: 'WILL',
    role: 'verb',
    modal: true,
    description: 'to want to; volition',
    // The English lemma is "want", so the gloss disambiguates rather than repeating it.
    synonym: 'wish',
    emoji: '🎯',
    forms: {
      en: {
        // The volitional "will" is the lexical verb "want", which needs "to" before its
        // infinitive and negates with do-support ("does not want to go") — unlike the
        // defective must/can above. Its `link` is what supplies that "to".
        base: 'want', nonfinite: 'want', link: 'to',
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
        '1sg_present': 'quero', '2sg_present': 'queres', '3sg_present': 'quer',
        '1pl_present': 'queremos', '2pl_present': 'quereis', '3pl_present': 'querem',
        '1sg_past': 'quis', '2sg_past': 'quiseste', '3sg_past': 'quis',
        '1pl_past': 'quisemos', '2pl_past': 'quisestes', '3pl_past': 'quiseram',
        '1sg_future': 'quererei', '2sg_future': 'quererás', '3sg_future': 'quererá',
        '1pl_future': 'quereremos', '2pl_future': 'querereis', '3pl_future': 'quererão',
      },
    },
  },
];
