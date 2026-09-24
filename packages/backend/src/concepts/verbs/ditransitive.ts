import type { ConceptSeed } from '../types.js';
import { causativeGloss, infinitiveGloss } from './gloss.js';

// Ditransitive verbs (license a recipient/theme). The recipient is the `terminus` complement
// — the dative "to whom" — which these verbs declare like any other complement-taking verb.
export const ditransitiveVerbs: ConceptSeed[] = [
  {
    id: 'GIVE',
    role: 'verb',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to hand something to someone',
    definition: infinitiveGloss('TRANSFER', {
      object: 'OBJECT_THING',
      number: 'plural',
      complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } },
    }),
    emoji: '🎁',
    isA: 'TRANSFER',
    forms: {
      en: {
        base: 'give',
        '1sg_present': 'give', '2sg_present': 'give', '3sg_present': 'gives',
        '1pl_present': 'give', '2pl_present': 'give', '3pl_present': 'give',
        past: 'gave',
      },
      it: {
        base: 'dare',
        '1sg_present': 'do', '2sg_present': 'dai', '3sg_present': 'dà',
        '1pl_present': 'diamo', '2pl_present': 'date', '3pl_present': 'danno',
        '1sg_past': 'diedi', '2sg_past': 'desti', '3sg_past': 'diede',
        '1pl_past': 'demmo', '2pl_past': 'deste', '3pl_past': 'diedero',
        '1sg_future': 'darò', '2sg_future': 'darai', '3sg_future': 'darà',
        '1pl_future': 'daremo', '2pl_future': 'darete', '3pl_future': 'daranno',
      },
      fr: {
        base: 'donner',
        '1sg_present': 'donne', '2sg_present': 'donnes', '3sg_present': 'donne',
        '1pl_present': 'donnons', '2pl_present': 'donnez', '3pl_present': 'donnent',
        '1sg_past': 'donnai', '2sg_past': 'donnas', '3sg_past': 'donna',
        '1pl_past': 'donnâmes', '2pl_past': 'donnâtes', '3pl_past': 'donnèrent',
        '1sg_future': 'donnerai', '2sg_future': 'donneras', '3sg_future': 'donnera',
        '1pl_future': 'donnerons', '2pl_future': 'donnerez', '3pl_future': 'donneront',
      },
      de: {
        base: 'geben', terminus_dative: '1',
        '1sg_present': 'gebe', '2sg_present': 'gibst', '3sg_present': 'gibt',
        '1pl_present': 'geben', '2pl_present': 'gebt', '3pl_present': 'geben',
        '1sg_past': 'gab', '2sg_past': 'gabst', '3sg_past': 'gab',
        '1pl_past': 'gaben', '2pl_past': 'gabt', '3pl_past': 'gaben',
        '2sg_imperative': 'gib', // strong e→i: the du command keeps the vowel change
      },
      es: {
        base: 'dar',
        '1sg_present': 'doy', '2sg_present': 'das', '3sg_present': 'da',
        '1pl_present': 'damos', '2pl_present': 'dais', '3pl_present': 'dan',
        '1sg_past': 'di', '2sg_past': 'diste', '3sg_past': 'dio',
        '1pl_past': 'dimos', '2pl_past': 'disteis', '3pl_past': 'dieron',
        '1sg_future': 'daré', '2sg_future': 'darás', '3sg_future': 'dará',
        '1pl_future': 'daremos', '2pl_future': 'daréis', '3pl_future': 'darán',
      },
      ja: {
        base: 'あげる',
        masu_present: 'あげます',
        // 謙譲語 差し上げる, 「与える」「やる」の謙譲語 (大辞林, デジタル大辞泉). No 尊敬語: くださる is
        // くれる's, a giving *towards* the speaker, which あげる is not (P11-E1).
        humble: '差し上げる', humble_masu_present: '差し上げます', humble_te: '差し上げて', humble_nai: '差し上げない',
        humble_reading: 'さしあげる', humble_masu_present_reading: 'さしあげます', humble_te_reading: 'さしあげて', humble_nai_reading: 'さしあげない',
      },
      pt: {
        base: 'dar',
        '1sg_present': 'dou', '2sg_present': 'dá', '3sg_present': 'dá',
        '1pl_present': 'damos', '2pl_present': 'dão', '3pl_present': 'dão',
        '1sg_past': 'dei', '2sg_past': 'deu', '3sg_past': 'deu',
        '1pl_past': 'demos', '2pl_past': 'deram', '3pl_past': 'deram',
        '1sg_future': 'darei', '2sg_future': 'dará', '3sg_future': 'dará',
        '1pl_future': 'daremos', '2pl_future': 'darão', '3pl_future': 'darão',
      },
    },
  },

  {
    // COMPANY_BUSINESS's differentia (localization B64): "to give objects to acquire money", BUY's
    // counterpart ("to acquire objects with money") and a narrowing of EXCHANGE. Ditransitive like
    // GIVE, the buyer its `terminus` (German dative: "dem Mann verkaufen"). Italian vendere keeps the
    // -etti past (vendette), French vendre is an -re verb (vend, vendit, vendu), Japanese 売る godan.
    id: 'SELL',
    role: 'verb',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'cause', 'locative'],
    description: 'to give something to someone in exchange for money',
    definition: infinitiveGloss('GIVE', {
      object: 'OBJECT_THING',
      number: 'plural',
      purpose: { verb: 'ACQUIRE', object: 'MONEY' },
    }),
    emoji: '🏷️',
    forms: {
      en: {
        base: 'sell',
        '1sg_present': 'sell', '2sg_present': 'sell', '3sg_present': 'sells',
        '1pl_present': 'sell', '2pl_present': 'sell', '3pl_present': 'sell',
        past: 'sold',
      },
      it: {
        base: 'vendere',
        '1sg_present': 'vendo', '2sg_present': 'vendi', '3sg_present': 'vende',
        '1pl_present': 'vendiamo', '2pl_present': 'vendete', '3pl_present': 'vendono',
        '1sg_past': 'vendetti', '2sg_past': 'vendesti', '3sg_past': 'vendette',
        '1pl_past': 'vendemmo', '2pl_past': 'vendeste', '3pl_past': 'vendettero',
        '1sg_future': 'venderò', '2sg_future': 'venderai', '3sg_future': 'venderà',
        '1pl_future': 'venderemo', '2pl_future': 'venderete', '3pl_future': 'venderanno',
      },
      fr: {
        base: 'vendre',
        '1sg_present': 'vends', '2sg_present': 'vends', '3sg_present': 'vend',
        '1pl_present': 'vendons', '2pl_present': 'vendez', '3pl_present': 'vendent',
        '1sg_past': 'vendis', '2sg_past': 'vendis', '3sg_past': 'vendit',
        '1pl_past': 'vendîmes', '2pl_past': 'vendîtes', '3pl_past': 'vendirent',
        '1sg_future': 'vendrai', '2sg_future': 'vendras', '3sg_future': 'vendra',
        '1pl_future': 'vendrons', '2pl_future': 'vendrez', '3pl_future': 'vendront',
      },
      de: {
        base: 'verkaufen', terminus_dative: '1',
        '1sg_present': 'verkaufe', '2sg_present': 'verkaufst', '3sg_present': 'verkauft',
        '1pl_present': 'verkaufen', '2pl_present': 'verkauft', '3pl_present': 'verkaufen',
        '1sg_past': 'verkaufte', '2sg_past': 'verkauftest', '3sg_past': 'verkaufte',
        '1pl_past': 'verkauften', '2pl_past': 'verkauftet', '3pl_past': 'verkauften',
        '2sg_imperative': 'verkaufe', // the optional du -e, kept
      },
      es: {
        base: 'vender',
        '1sg_present': 'vendo', '2sg_present': 'vendes', '3sg_present': 'vende',
        '1pl_present': 'vendemos', '2pl_present': 'vendéis', '3pl_present': 'venden',
        '1sg_past': 'vendí', '2sg_past': 'vendiste', '3sg_past': 'vendió',
        '1pl_past': 'vendimos', '2pl_past': 'vendisteis', '3pl_past': 'vendieron',
        '1sg_future': 'venderé', '2sg_future': 'venderás', '3sg_future': 'venderá',
        '1pl_future': 'venderemos', '2pl_future': 'venderéis', '3pl_future': 'venderán',
      },
      ja: {
        base: '売る',
        reading: 'うる',
        masu_present: '売ります',
        masu_present_reading: 'うります',
      },
      pt: {
        base: 'vender',
        '1sg_present': 'vendo', '2sg_present': 'vende', '3sg_present': 'vende',
        '1pl_present': 'vendemos', '2pl_present': 'vendem', '3pl_present': 'vendem',
        '1sg_past': 'vendi', '2sg_past': 'vendeu', '3sg_past': 'vendeu',
        '1pl_past': 'vendemos', '2pl_past': 'venderam', '3pl_past': 'venderam',
        '1sg_future': 'venderei', '2sg_future': 'venderá', '3sg_future': 'venderá',
        '1pl_future': 'venderemos', '2pl_future': 'venderão', '3pl_future': 'venderão',
      },
    },
  },

  {
    // P09-E24's *pay* (rank 258; localization B85): "to give money to a person", GIVE with money as
    // SELL is GIVE for money. The sum or the bill is the object and the payee GIVE's `terminus`
    // (German dative: "dem Mann das Geld bezahlen"). Italian pagare keeps its h before i and e
    // (paghi, pagherò); French payer takes the ai of the y-verbs where the ending is mute (paie,
    // paierai); German bezahlen is inseparable (bezahlt, no ge-); Spanish pagar writes gu before e
    // (pagué); Portuguese pagar's participle is the short pago under the copula.
    id: 'PAY',
    role: 'verb',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to give money in return for something',
    definition: infinitiveGloss('GIVE', {
      object: 'MONEY',
      complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } },
    }),
    emoji: '💳',
    forms: {
      en: {
        base: 'pay',
        '1sg_present': 'pay', '2sg_present': 'pay', '3sg_present': 'pays',
        '1pl_present': 'pay', '2pl_present': 'pay', '3pl_present': 'pay',
        past: 'paid',
      },
      it: {
        base: 'pagare',
        '1sg_present': 'pago', '2sg_present': 'paghi', '3sg_present': 'paga',
        '1pl_present': 'paghiamo', '2pl_present': 'pagate', '3pl_present': 'pagano',
        '1sg_past': 'pagai', '2sg_past': 'pagasti', '3sg_past': 'pagò',
        '1pl_past': 'pagammo', '2pl_past': 'pagaste', '3pl_past': 'pagarono',
        '1sg_future': 'pagherò', '2sg_future': 'pagherai', '3sg_future': 'pagherà',
        '1pl_future': 'pagheremo', '2pl_future': 'pagherete', '3pl_future': 'pagheranno',
      },
      fr: {
        base: 'payer',
        '1sg_present': 'paie', '2sg_present': 'paies', '3sg_present': 'paie',
        '1pl_present': 'payons', '2pl_present': 'payez', '3pl_present': 'paient',
        '1sg_past': 'payai', '2sg_past': 'payas', '3sg_past': 'paya',
        '1pl_past': 'payâmes', '2pl_past': 'payâtes', '3pl_past': 'payèrent',
        '1sg_future': 'paierai', '2sg_future': 'paieras', '3sg_future': 'paiera',
        '1pl_future': 'paierons', '2pl_future': 'paierez', '3pl_future': 'paieront',
      },
      de: {
        base: 'bezahlen', terminus_dative: '1',
        '1sg_present': 'bezahle', '2sg_present': 'bezahlst', '3sg_present': 'bezahlt',
        '1pl_present': 'bezahlen', '2pl_present': 'bezahlt', '3pl_present': 'bezahlen',
        '1sg_past': 'bezahlte', '2sg_past': 'bezahltest', '3sg_past': 'bezahlte',
        '1pl_past': 'bezahlten', '2pl_past': 'bezahltet', '3pl_past': 'bezahlten',
      },
      es: {
        base: 'pagar',
        '1sg_present': 'pago', '2sg_present': 'pagas', '3sg_present': 'paga',
        '1pl_present': 'pagamos', '2pl_present': 'pagáis', '3pl_present': 'pagan',
        '1sg_past': 'pagué', '2sg_past': 'pagaste', '3sg_past': 'pagó',
        '1pl_past': 'pagamos', '2pl_past': 'pagasteis', '3pl_past': 'pagaron',
        '1sg_future': 'pagaré', '2sg_future': 'pagarás', '3sg_future': 'pagará',
        '1pl_future': 'pagaremos', '2pl_future': 'pagaréis', '3pl_future': 'pagarán',
      },
      ja: {
        base: '払う',
        reading: 'はらう',
        masu_present: '払います',
        masu_present_reading: 'はらいます',
      },
      pt: {
        base: 'pagar',
        '1sg_present': 'pago', '2sg_present': 'paga', '3sg_present': 'paga',
        '1pl_present': 'pagamos', '2pl_present': 'pagam', '3pl_present': 'pagam',
        '1sg_past': 'paguei', '2sg_past': 'pagou', '3sg_past': 'pagou',
        '1pl_past': 'pagamos', '2pl_past': 'pagaram', '3pl_past': 'pagaram',
        '1sg_future': 'pagarei', '2sg_future': 'pagará', '3sg_future': 'pagará',
        '1pl_future': 'pagaremos', '2pl_future': 'pagarão', '3pl_future': 'pagarão',
      },
    },
  },

  {
    // P09-E24's *provide* (rank 272; localization B85): "to cause a person to have objects", the
    // causative of HAVE, as PUT is the causative of BE (C08). The thing is the object and the one
    // provided for GIVE's `terminus`. Italian fornire takes the -isc- infix, French fournir is a
    // second-group -ir (fournissons), German liefern the dative, Portuguese fornecer writes ç before
    // o and a (forneço, forneça).
    id: 'PROVIDE',
    role: 'verb',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to make something available to someone',
    definition: causativeGloss({ object: 'PERSON', definiteness: 'indefinite' }, { verb: 'HAVE', object: 'OBJECT_THING', number: 'plural' }),
    synonym: 'supply',
    emoji: '📦',
    forms: {
      en: {
        base: 'provide',
        '1sg_present': 'provide', '2sg_present': 'provide', '3sg_present': 'provides',
        '1pl_present': 'provide', '2pl_present': 'provide', '3pl_present': 'provide',
        past: 'provided',
      },
      it: {
        base: 'fornire',
        '1sg_present': 'fornisco', '2sg_present': 'fornisci', '3sg_present': 'fornisce',
        '1pl_present': 'forniamo', '2pl_present': 'fornite', '3pl_present': 'forniscono',
        '1sg_past': 'fornii', '2sg_past': 'fornisti', '3sg_past': 'fornì',
        '1pl_past': 'fornimmo', '2pl_past': 'forniste', '3pl_past': 'fornirono',
        '1sg_future': 'fornirò', '2sg_future': 'fornirai', '3sg_future': 'fornirà',
        '1pl_future': 'forniremo', '2pl_future': 'fornirete', '3pl_future': 'forniranno',
      },
      fr: {
        base: 'fournir',
        '1sg_present': 'fournis', '2sg_present': 'fournis', '3sg_present': 'fournit',
        '1pl_present': 'fournissons', '2pl_present': 'fournissez', '3pl_present': 'fournissent',
        '1sg_past': 'fournis', '2sg_past': 'fournis', '3sg_past': 'fournit',
        '1pl_past': 'fournîmes', '2pl_past': 'fournîtes', '3pl_past': 'fournirent',
        '1sg_future': 'fournirai', '2sg_future': 'fourniras', '3sg_future': 'fournira',
        '1pl_future': 'fournirons', '2pl_future': 'fournirez', '3pl_future': 'fourniront',
      },
      de: {
        base: 'liefern', terminus_dative: '1',
        '1sg_present': 'liefere', '2sg_present': 'lieferst', '3sg_present': 'liefert',
        '1pl_present': 'liefern', '2pl_present': 'liefert', '3pl_present': 'liefern',
        '1sg_past': 'lieferte', '2sg_past': 'liefertest', '3sg_past': 'lieferte',
        '1pl_past': 'lieferten', '2pl_past': 'liefertet', '3pl_past': 'lieferten',
      },
      es: {
        base: 'proporcionar',
        '1sg_present': 'proporciono', '2sg_present': 'proporcionas', '3sg_present': 'proporciona',
        '1pl_present': 'proporcionamos', '2pl_present': 'proporcionáis', '3pl_present': 'proporcionan',
        '1sg_past': 'proporcioné', '2sg_past': 'proporcionaste', '3sg_past': 'proporcionó',
        '1pl_past': 'proporcionamos', '2pl_past': 'proporcionasteis', '3pl_past': 'proporcionaron',
        '1sg_future': 'proporcionaré', '2sg_future': 'proporcionarás', '3sg_future': 'proporcionará',
        '1pl_future': 'proporcionaremos', '2pl_future': 'proporcionaréis', '3pl_future': 'proporcionarán',
      },
      ja: {
        base: '提供する',
        reading: 'ていきょうする',
        masu_present: '提供します',
        masu_present_reading: 'ていきょうします',
      },
      pt: {
        base: 'fornecer',
        '1sg_present': 'forneço', '2sg_present': 'fornece', '3sg_present': 'fornece',
        '1pl_present': 'fornecemos', '2pl_present': 'fornecem', '3pl_present': 'fornecem',
        '1sg_past': 'forneci', '2sg_past': 'forneceu', '3sg_past': 'forneceu',
        '1pl_past': 'fornecemos', '2pl_past': 'forneceram', '3pl_past': 'forneceram',
        '1sg_future': 'fornecerei', '2sg_future': 'fornecerá', '3sg_future': 'fornecerá',
        '1pl_future': 'forneceremos', '2pl_future': 'fornecerão', '3pl_future': 'fornecerão',
      },
    },
  },

  {
    // The genus of GIVE and SEND (B15) and of EXPORT and IMPORT (B19) — the verb of moving something
    // from one holder or place to another that their dictionary definitions cite as their genus. Besides GIVE's recipient (`terminus`) it licenses the place it moves from and to
    // (`source` / `direction`). English doubles its r (transferred / transferring), Italian
    // trasferire takes the -isc- infix, Spanish transferir diphthongs and raises its stem
    // (transfiere / transfirió), and German takes the strong, inseparable übertragen (überträgt /
    // übertrug / übertragen, no ge-). Japanese takes 移す ("move to another place").
    id: 'TRANSFER',
    role: 'verb',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'source', 'direction', 'cause'],
    description: 'to move from one holder or place to another',
    emoji: '🔁',
    forms: {
      en: {
        base: 'transfer',
        '1sg_present': 'transfer', '2sg_present': 'transfer', '3sg_present': 'transfers',
        '1pl_present': 'transfer', '2pl_present': 'transfer', '3pl_present': 'transfer',
        past: 'transferred',
      },
      it: {
        base: 'trasferire',
        '1sg_present': 'trasferisco', '2sg_present': 'trasferisci', '3sg_present': 'trasferisce',
        '1pl_present': 'trasferiamo', '2pl_present': 'trasferite', '3pl_present': 'trasferiscono',
        '1sg_past': 'trasferii', '2sg_past': 'trasferisti', '3sg_past': 'trasferì',
        '1pl_past': 'trasferimmo', '2pl_past': 'trasferiste', '3pl_past': 'trasferirono',
        '1sg_future': 'trasferirò', '2sg_future': 'trasferirai', '3sg_future': 'trasferirà',
        '1pl_future': 'trasferiremo', '2pl_future': 'trasferirete', '3pl_future': 'trasferiranno',
      },
      fr: {
        base: 'transférer',
        '1sg_present': 'transfère', '2sg_present': 'transfères', '3sg_present': 'transfère',
        '1pl_present': 'transférons', '2pl_present': 'transférez', '3pl_present': 'transfèrent',
        '1sg_past': 'transférai', '2sg_past': 'transféras', '3sg_past': 'transféra',
        '1pl_past': 'transférâmes', '2pl_past': 'transférâtes', '3pl_past': 'transférèrent',
        '1sg_future': 'transférerai', '2sg_future': 'transféreras', '3sg_future': 'transférera',
        '1pl_future': 'transférerons', '2pl_future': 'transférerez', '3pl_future': 'transféreront',
      },
      de: {
        base: 'übertragen',
        '1sg_present': 'übertrage', '2sg_present': 'überträgst', '3sg_present': 'überträgt',
        '1pl_present': 'übertragen', '2pl_present': 'übertragt', '3pl_present': 'übertragen',
        '1sg_past': 'übertrug', '2sg_past': 'übertrugst', '3sg_past': 'übertrug',
        '1pl_past': 'übertrugen', '2pl_past': 'übertrugt', '3pl_past': 'übertrugen',
      },
      es: {
        base: 'transferir',
        '1sg_present': 'transfiero', '2sg_present': 'transfieres', '3sg_present': 'transfiere',
        '1pl_present': 'transferimos', '2pl_present': 'transferís', '3pl_present': 'transfieren',
        '1sg_past': 'transferí', '2sg_past': 'transferiste', '3sg_past': 'transfirió',
        '1pl_past': 'transferimos', '2pl_past': 'transferisteis', '3pl_past': 'transfirieron',
        '1sg_future': 'transferiré', '2sg_future': 'transferirás', '3sg_future': 'transferirá',
        '1pl_future': 'transferiremos', '2pl_future': 'transferiréis', '3pl_future': 'transferirán',
      },
      ja: {
        base: '移す',
        reading: 'うつす',
        masu_present: '移します',
        masu_present_reading: 'うつします',
      },
      pt: {
        base: 'transferir',
        '1sg_present': 'transfiro', '2sg_present': 'transfere', '3sg_present': 'transfere',
        '1pl_present': 'transferimos', '2pl_present': 'transferem', '3pl_present': 'transferem',
        '1sg_past': 'transferi', '2sg_past': 'transferiu', '3sg_past': 'transferiu',
        '1pl_past': 'transferimos', '2pl_past': 'transferiram', '3pl_past': 'transferiram',
        '1sg_future': 'transferirei', '2sg_future': 'transferirá', '3sg_future': 'transferirá',
        '1pl_future': 'transferiremos', '2pl_future': 'transferirão', '3pl_future': 'transferirão',
      },
    },
  },

  {
    id: 'SHOW',
    role: 'verb',
    transitivity: 'ditransitive',
    // `locative`: where the thing is shown — "show it in the console" (B42).
    complements: ['manner', 'terminus', 'cause', 'locative'],
    description: 'to make something visible to someone',
    // The causative of seeing: what SHOW adds to SEE is that someone *else* does the seeing, which
    // is the object-controlled infinitive complement (localization C08). Japanese says it as
    // 人が物体を見るようにする — 見る, not the 見せる this defines.
    definition: causativeGloss(
      { object: 'PERSON', definiteness: 'indefinite' },
      { verb: 'SEE', object: 'OBJECT_THING', number: 'plural' },
    ),
    emoji: '👁️',
    forms: {
      en: {
        base: 'show',
        '1sg_present': 'show', '2sg_present': 'show', '3sg_present': 'shows',
        '1pl_present': 'show', '2pl_present': 'show', '3pl_present': 'show',
        past: 'showed',
      },
      it: {
        base: 'mostrare',
        '1sg_present': 'mostro', '2sg_present': 'mostri', '3sg_present': 'mostra',
        '1pl_present': 'mostriamo', '2pl_present': 'mostrate', '3pl_present': 'mostrano',
        '1sg_past': 'mostrai', '2sg_past': 'mostrasti', '3sg_past': 'mostrò',
        '1pl_past': 'mostrammo', '2pl_past': 'mostraste', '3pl_past': 'mostrarono',
        '1sg_future': 'mostrerò', '2sg_future': 'mostrerai', '3sg_future': 'mostrerà',
        '1pl_future': 'mostreremo', '2pl_future': 'mostrerete', '3pl_future': 'mostreranno',
      },
      fr: {
        base: 'montrer',
        '1sg_present': 'montre', '2sg_present': 'montres', '3sg_present': 'montre',
        '1pl_present': 'montrons', '2pl_present': 'montrez', '3pl_present': 'montrent',
        '1sg_past': 'montrai', '2sg_past': 'montras', '3sg_past': 'montra',
        '1pl_past': 'montrâmes', '2pl_past': 'montrâtes', '3pl_past': 'montrèrent',
        '1sg_future': 'montrerai', '2sg_future': 'montreras', '3sg_future': 'montrera',
        '1pl_future': 'montrerons', '2pl_future': 'montrerez', '3pl_future': 'montreront',
      },
      de: {
        base: 'zeigen',
        '1sg_present': 'zeige', '2sg_present': 'zeigst', '3sg_present': 'zeigt',
        '1pl_present': 'zeigen', '2pl_present': 'zeigt', '3pl_present': 'zeigen',
        '1sg_past': 'zeigte', '2sg_past': 'zeigtest', '3sg_past': 'zeigte',
        '1pl_past': 'zeigten', '2pl_past': 'zeigtet', '3pl_past': 'zeigten',
      },
      es: {
        base: 'mostrar',
        '1sg_present': 'muestro', '2sg_present': 'muestras', '3sg_present': 'muestra',
        '1pl_present': 'mostramos', '2pl_present': 'mostráis', '3pl_present': 'muestran',
        '1sg_past': 'mostré', '2sg_past': 'mostraste', '3sg_past': 'mostró',
        '1pl_past': 'mostramos', '2pl_past': 'mostrasteis', '3pl_past': 'mostraron',
        '1sg_future': 'mostraré', '2sg_future': 'mostrarás', '3sg_future': 'mostrará',
        '1pl_future': 'mostraremos', '2pl_future': 'mostraréis', '3pl_future': 'mostrarán',
      },
      ja: {
        base: '見せる',
        reading: 'みせる',
        masu_present: '見せます',
        masu_present_reading: 'みせます',
      },
      pt: {
        base: 'mostrar',
        '1sg_present': 'mostro', '2sg_present': 'mostra', '3sg_present': 'mostra',
        '1pl_present': 'mostramos', '2pl_present': 'mostram', '3pl_present': 'mostram',
        '1sg_past': 'mostrei', '2sg_past': 'mostrou', '3sg_past': 'mostrou',
        '1pl_past': 'mostramos', '2pl_past': 'mostraram', '3pl_past': 'mostraram',
        '1sg_future': 'mostrarei', '2sg_future': 'mostrará', '3sg_future': 'mostrará',
        '1pl_future': 'mostraremos', '2pl_future': 'mostrarão', '3pl_future': 'mostrarão',
      },
    },
  },

  {
    id: 'SEND',
    role: 'verb',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to dispatch something to someone',
    definition: infinitiveGloss('TRANSFER', {
      object: 'OBJECT_THING',
      number: 'plural',
      complements: { direction: { phrase: { concept: 'PLACE', definiteness: 'indefinite' } } },
    }),
    emoji: '📨',
    isA: 'TRANSFER',
    forms: {
      en: {
        base: 'send',
        '1sg_present': 'send', '2sg_present': 'send', '3sg_present': 'sends',
        '1pl_present': 'send', '2pl_present': 'send', '3pl_present': 'send',
        past: 'sent',
      },
      it: {
        base: 'mandare',
        '1sg_present': 'mando', '2sg_present': 'mandi', '3sg_present': 'manda',
        '1pl_present': 'mandiamo', '2pl_present': 'mandate', '3pl_present': 'mandano',
        '1sg_past': 'mandai', '2sg_past': 'mandasti', '3sg_past': 'mandò',
        '1pl_past': 'mandammo', '2pl_past': 'mandaste', '3pl_past': 'mandarono',
        '1sg_future': 'manderò', '2sg_future': 'manderai', '3sg_future': 'manderà',
        '1pl_future': 'manderemo', '2pl_future': 'manderete', '3pl_future': 'manderanno',
      },
      fr: {
        base: 'envoyer',
        '1sg_present': 'envoie', '2sg_present': 'envoies', '3sg_present': 'envoie',
        '1pl_present': 'envoyons', '2pl_present': 'envoyez', '3pl_present': 'envoient',
        '1sg_past': 'envoyai', '2sg_past': 'envoyas', '3sg_past': 'envoya',
        '1pl_past': 'envoyâmes', '2pl_past': 'envoyâtes', '3pl_past': 'envoyèrent',
        '1sg_future': 'enverrai', '2sg_future': 'enverras', '3sg_future': 'enverra',
        '1pl_future': 'enverrons', '2pl_future': 'enverrez', '3pl_future': 'enverront',
      },
      de: {
        base: 'schicken',
        '1sg_present': 'schicke', '2sg_present': 'schickst', '3sg_present': 'schickt',
        '1pl_present': 'schicken', '2pl_present': 'schickt', '3pl_present': 'schicken',
        '1sg_past': 'schickte', '2sg_past': 'schicktest', '3sg_past': 'schickte',
        '1pl_past': 'schickten', '2pl_past': 'schicktet', '3pl_past': 'schickten',
      },
      es: {
        base: 'enviar',
        '1sg_present': 'envío', '2sg_present': 'envías', '3sg_present': 'envía',
        '1pl_present': 'enviamos', '2pl_present': 'enviáis', '3pl_present': 'envían',
        '1sg_past': 'envié', '2sg_past': 'enviaste', '3sg_past': 'envió',
        '1pl_past': 'enviamos', '2pl_past': 'enviasteis', '3pl_past': 'enviaron',
        '1sg_future': 'enviaré', '2sg_future': 'enviarás', '3sg_future': 'enviará',
        '1pl_future': 'enviaremos', '2pl_future': 'enviaréis', '3pl_future': 'enviarán',
      },
      ja: {
        base: '送る',
        reading: 'おくる',
        masu_present: '送ります',
        masu_present_reading: 'おくります',
      },
      pt: {
        base: 'enviar',
        '1sg_present': 'envio', '2sg_present': 'envia', '3sg_present': 'envia',
        '1pl_present': 'enviamos', '2pl_present': 'enviam', '3pl_present': 'enviam',
        '1sg_past': 'enviei', '2sg_past': 'enviou', '3sg_past': 'enviou',
        '1pl_past': 'enviamos', '2pl_past': 'enviaram', '3pl_past': 'enviaram',
        '1sg_future': 'enviarei', '2sg_future': 'enviará', '3sg_future': 'enviará',
        '1pl_future': 'enviaremos', '2pl_future': 'enviarão', '3pl_future': 'enviarão',
      },
    },
  },

  // ── The saying verbs with an addressee (localization B60) ──
  {
    // P09's tell, to relate something to someone: the verbs of relating, not SAY's dire / sagen /
    // decir, which would render SAY in five languages. Japanese 伝える, not SPEAK's 話す nor the
    // narrating 語る: "女は男に物語を伝えます".
    id: 'TELL',
    role: 'verb',
    // Takes a that-clause as its object (P09-E12 D9): the builder's subordinate-clause menu offers *that*.
    // It may report a question too, "tells the dog what the cat eats" (`content_clause_force`, P09-E17).
    clauseObject: 'content',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to relate something to someone',
    // "to say facts to a person", GIVE's recipient frame on SAY. A lie or a joke is told too; "words"
    // would read as merely addressing someone, and is the frame ANSWER takes.
    definition: infinitiveGloss('SAY', {
      object: 'FACT',
      number: 'plural',
      complements: { terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite' } } },
    }),
    emoji: '🗣️',
    isA: 'SAY',
    forms: {
      en: {
        // What is told may be a clause, and then the addressee is a bare object ahead of it: "tells the
        // dog that the cat runs", never "tells to the dog that…" (`clause_terminus_bare`, P09-E4). A
        // story keeps its "to" ("tells the story to the man").
        base: 'tell', content_clause_force: 'either', clause_terminus_bare: '1', infinitive_sense: 'TELL_ORDER',
        '1sg_present': 'tell', '2sg_present': 'tell', '3sg_present': 'tells',
        '1pl_present': 'tell', '2pl_present': 'tell', '3pl_present': 'tell',
        past: 'told',
      },
      it: {
        base: 'raccontare', content_clause_force: 'either', infinitive_sense: 'TELL_ORDER',
        '1sg_present': 'racconto', '2sg_present': 'racconti', '3sg_present': 'racconta',
        '1pl_present': 'raccontiamo', '2pl_present': 'raccontate', '3pl_present': 'raccontano',
        '1sg_past': 'raccontai', '2sg_past': 'raccontasti', '3sg_past': 'raccontò',
        '1pl_past': 'raccontammo', '2pl_past': 'raccontaste', '3pl_past': 'raccontarono',
        '1sg_future': 'racconterò', '2sg_future': 'racconterai', '3sg_future': 'racconterà',
        '1pl_future': 'racconteremo', '2pl_future': 'racconterete', '3pl_future': 'racconteranno',
      },
      fr: {
        base: 'raconter', content_clause_force: 'either', infinitive_sense: 'TELL_ORDER',
        '1sg_present': 'raconte', '2sg_present': 'racontes', '3sg_present': 'raconte',
        '1pl_present': 'racontons', '2pl_present': 'racontez', '3pl_present': 'racontent',
        '1sg_past': 'racontai', '2sg_past': 'racontas', '3sg_past': 'raconta',
        '1pl_past': 'racontâmes', '2pl_past': 'racontâtes', '3pl_past': 'racontèrent',
        '1sg_future': 'raconterai', '2sg_future': 'raconteras', '3sg_future': 'racontera',
        '1pl_future': 'raconterons', '2pl_future': 'raconterez', '3pl_future': 'raconteront',
      },
      de: {
        // erzählen is inseparable: no ge- in the participle (erzählt).
        base: 'erzählen', content_clause_force: 'either', infinitive_sense: 'TELL_ORDER',
        '1sg_present': 'erzähle', '2sg_present': 'erzählst', '3sg_present': 'erzählt',
        '1pl_present': 'erzählen', '2pl_present': 'erzählt', '3pl_present': 'erzählen',
        '1sg_past': 'erzählte', '2sg_past': 'erzähltest', '3sg_past': 'erzählte',
        '1pl_past': 'erzählten', '2pl_past': 'erzähltet', '3pl_past': 'erzählten',
      },
      es: {
        // contar diphthongises o → ue under the stress: cuento, cuentan, but contamos.
        base: 'contar', content_clause_force: 'either', infinitive_sense: 'TELL_ORDER',
        '1sg_present': 'cuento', '2sg_present': 'cuentas', '3sg_present': 'cuenta',
        '1pl_present': 'contamos', '2pl_present': 'contáis', '3pl_present': 'cuentan',
        '1sg_past': 'conté', '2sg_past': 'contaste', '3sg_past': 'contó',
        '1pl_past': 'contamos', '2pl_past': 'contasteis', '3pl_past': 'contaron',
        '1sg_future': 'contaré', '2sg_future': 'contarás', '3sg_future': 'contará',
        '1pl_future': 'contaremos', '2pl_future': 'contaréis', '3pl_future': 'contarán',
      },
      ja: {
        // A verb of saying or thinking quotes the clause it reports with と, on the plain form — 猫が走ると伝えます —
        // where a verb of knowing nominalizes it with ことを (`content_clause_link`, P09-E4).
        base: '伝える', content_clause_force: 'either', content_clause_link: 'と', infinitive_sense: 'TELL_ORDER',
        reading: 'つたえる',
        masu_present: '伝えます',
        masu_present_reading: 'つたえます',
      },
      pt: {
        base: 'contar', content_clause_force: 'either', infinitive_sense: 'TELL_ORDER',
        '1sg_present': 'conto', '2sg_present': 'conta', '3sg_present': 'conta',
        '1pl_present': 'contamos', '2pl_present': 'contam', '3pl_present': 'contam',
        '1sg_past': 'contei', '2sg_past': 'contou', '3sg_past': 'contou',
        '1pl_past': 'contamos', '2pl_past': 'contaram', '3pl_past': 'contaram',
        '1sg_future': 'contarei', '2sg_future': 'contará', '3sg_future': 'contará',
        '1pl_future': 'contaremos', '2pl_future': 'contarão', '3pl_future': 'contarão',
      },
    },
  },

  {
    // TELL's sense of instructing (P09-E43): telling someone to do something, an object-controlled
    // infinitive whose controller is a dative (`object_case: 'dat'`, see `controllerCase`). The
    // translator selects it for TELL with an infinitive (`infinitive_sense`), so it is a sense of
    // TELL and no picker offers it. It "dire **al** gatto **di** correre", fr "dire **au** chat
    // **de** courir", de "sagen **dem** Kater zu laufen", pt "dizer **ao** gato **para** correr", ja
    // 猫**に**走る**ように**言う. Spanish says it with a finite clause (*le dice al gato que corra*), which
    // an infinitive complement cannot render, so its lexeme is *mandar*, which takes the infinitive:
    // "manda al gato correr".
    id: 'TELL_ORDER',
    role: 'verb',
    senseOf: 'TELL',
    transitivity: 'transitive',
    complements: ['manner', 'cause'],
    description: 'to instruct someone to do something',
    emoji: '🗣️',
    forms: {
      en: {
        base: 'tell',
        '1sg_present': 'tell', '2sg_present': 'tell', '3sg_present': 'tells',
        '1pl_present': 'tell', '2pl_present': 'tell', '3pl_present': 'tell',
        past: 'told',
      },
      it: {
        base: 'dire', object_case: 'dat', infinitive_link: 'di',
        '1sg_present': 'dico', '2sg_present': 'dici', '3sg_present': 'dice',
        '1pl_present': 'diciamo', '2pl_present': 'dite', '3pl_present': 'dicono',
        '1sg_past': 'dissi', '2sg_past': 'dicesti', '3sg_past': 'disse',
        '1pl_past': 'dicemmo', '2pl_past': 'diceste', '3pl_past': 'dissero',
        '1sg_future': 'dirò', '2sg_future': 'dirai', '3sg_future': 'dirà',
        '1pl_future': 'diremo', '2pl_future': 'direte', '3pl_future': 'diranno',
      },
      fr: {
        base: 'dire', object_case: 'dat', infinitive_link: 'de',
        '1sg_present': 'dis', '2sg_present': 'dis', '3sg_present': 'dit',
        '1pl_present': 'disons', '2pl_present': 'dites', '3pl_present': 'disent',
        '1sg_past': 'dis', '2sg_past': 'dis', '3sg_past': 'dit',
        '1pl_past': 'dîmes', '2pl_past': 'dîtes', '3pl_past': 'dirent',
        '1sg_future': 'dirai', '2sg_future': 'diras', '3sg_future': 'dira',
        '1pl_future': 'dirons', '2pl_future': 'direz', '3pl_future': 'diront',
      },
      de: {
        // The one told is a dative whatever follows (*sagt dem Kater*), so German's own key serves.
        base: 'sagen', object_case: 'dat',
        '1sg_present': 'sage', '2sg_present': 'sagst', '3sg_present': 'sagt',
        '1pl_present': 'sagen', '2pl_present': 'sagt', '3pl_present': 'sagen',
        '1sg_past': 'sagte', '2sg_past': 'sagtest', '3sg_past': 'sagte',
        '1pl_past': 'sagten', '2pl_past': 'sagtet', '3pl_past': 'sagten',
      },
      es: {
        base: 'mandar', object_case: 'dat',
        '1sg_present': 'mando', '2sg_present': 'mandas', '3sg_present': 'manda',
        '1pl_present': 'mandamos', '2pl_present': 'mandáis', '3pl_present': 'mandan',
        '1sg_past': 'mandé', '2sg_past': 'mandaste', '3sg_past': 'mandó',
        '1pl_past': 'mandamos', '2pl_past': 'mandasteis', '3pl_past': 'mandaron',
        '1sg_future': 'mandaré', '2sg_future': 'mandarás', '3sg_future': 'mandará',
        '1pl_future': 'mandaremos', '2pl_future': 'mandaréis', '3pl_future': 'mandarán',
      },
      ja: {
        // An instruction is reported with ように on the plain form: 猫に走るように言う.
        base: '言う', object_case: 'dat', infinitive_link: 'ように',
        reading: 'いう',
        masu_present: '言います',
        masu_present_reading: 'いいます',
      },
      pt: {
        base: 'dizer', object_case: 'dat', infinitive_link: 'para',
        '1sg_present': 'digo', '2sg_present': 'diz', '3sg_present': 'diz',
        '1pl_present': 'dizemos', '2pl_present': 'dizem', '3pl_present': 'dizem',
        '1sg_past': 'disse', '2sg_past': 'disse', '3sg_past': 'disse',
        '1pl_past': 'dissemos', '2pl_past': 'disseram', '3pl_past': 'disseram',
        '1sg_future': 'direi', '2sg_future': 'dirá', '3sg_future': 'dirá',
        '1pl_future': 'diremos', '2pl_future': 'dirão', '3pl_future': 'dirão',
      },
    },
  },

  {
    // P09's ask in the inquire sense, not request. Japanese 尋ねる, since 聞く is HEAR's; Italian
    // chiedere, since domandare is QUESTION's domanda made a verb. German asks *for* the thing,
    // `object_prep` nach ("fragt nach dem Namen"). The person asked is where ASK is not a plain
    // ditransitive: German fragen takes the person in the **accusative**, which its lexeme names
    // (`terminus_case`, the lexical case C35 built for helfen's dative object, the other way round):
    // "fragt den Mann nach dem Namen", not "fragt dem Mann".
    // Its object clause is a question, never a statement (`content_clause_force: 'interrogative'`,
    // P09-E17): "asks whether the cat runs", "asks what the cat eats". A that-clause would be the
    // mandative "asks that the cat run", a sense it does not have, and is refused. It names no
    // `clauseObject`, since the builder builds no indirect question yet.
    id: 'ASK',
    role: 'verb',
    transitivity: 'ditransitive',
    complements: ['manner', 'terminus', 'cause'],
    description: 'to put a question to someone',
    // "to say words to know the facts": the purpose says what asking is for without a question noun.
    // KNOW with a noun object takes KNOW_ACQUAINTED's verb (conoscere, kennen, A131), right with the
    // definite; the purpose clause's unspoken subject is the asker.
    definition: infinitiveGloss('SAY', {
      object: 'WORD',
      number: 'plural',
      purpose: { verb: 'KNOW', object: 'FACT', number: 'plural', definiteness: 'definite' },
    }),
    emoji: '🙋',
    isA: 'SAY',
    forms: {
      en: {
        // English asks the person, not *to* the person: the addressee is a bare object, and with a
        // thing asked it is the first of two ("asks the man the name", A238).
        base: 'ask', content_clause_force: 'interrogative', terminus_bare: '1',
        '1sg_present': 'ask', '2sg_present': 'ask', '3sg_present': 'asks',
        '1pl_present': 'ask', '2pl_present': 'ask', '3pl_present': 'ask',
        past: 'asked',
      },
      it: {
        base: 'chiedere', content_clause_force: 'interrogative',
        '1sg_present': 'chiedo', '2sg_present': 'chiedi', '3sg_present': 'chiede',
        '1pl_present': 'chiediamo', '2pl_present': 'chiedete', '3pl_present': 'chiedono',
        '1sg_past': 'chiesi', '2sg_past': 'chiedesti', '3sg_past': 'chiese',
        '1pl_past': 'chiedemmo', '2pl_past': 'chiedeste', '3pl_past': 'chiesero',
        '1sg_future': 'chiederò', '2sg_future': 'chiederai', '3sg_future': 'chiederà',
        '1pl_future': 'chiederemo', '2pl_future': 'chiederete', '3pl_future': 'chiederanno',
      },
      fr: {
        base: 'demander', content_clause_force: 'interrogative',
        '1sg_present': 'demande', '2sg_present': 'demandes', '3sg_present': 'demande',
        '1pl_present': 'demandons', '2pl_present': 'demandez', '3pl_present': 'demandent',
        '1sg_past': 'demandai', '2sg_past': 'demandas', '3sg_past': 'demanda',
        '1pl_past': 'demandâmes', '2pl_past': 'demandâtes', '3pl_past': 'demandèrent',
        '1sg_future': 'demanderai', '2sg_future': 'demanderas', '3sg_future': 'demandera',
        '1pl_future': 'demanderons', '2pl_future': 'demanderez', '3pl_future': 'demanderont',
      },
      de: {
        base: 'fragen', content_clause_force: 'interrogative', object_prep: 'nach', terminus_case: 'acc',
        '1sg_present': 'frage', '2sg_present': 'fragst', '3sg_present': 'fragt',
        '1pl_present': 'fragen', '2pl_present': 'fragt', '3pl_present': 'fragen',
        '1sg_past': 'fragte', '2sg_past': 'fragtest', '3sg_past': 'fragte',
        '1pl_past': 'fragten', '2pl_past': 'fragtet', '3pl_past': 'fragten',
      },
      es: {
        base: 'preguntar', content_clause_force: 'interrogative',
        '1sg_present': 'pregunto', '2sg_present': 'preguntas', '3sg_present': 'pregunta',
        '1pl_present': 'preguntamos', '2pl_present': 'preguntáis', '3pl_present': 'preguntan',
        '1sg_past': 'pregunté', '2sg_past': 'preguntaste', '3sg_past': 'preguntó',
        '1pl_past': 'preguntamos', '2pl_past': 'preguntasteis', '3pl_past': 'preguntaron',
        '1sg_future': 'preguntaré', '2sg_future': 'preguntarás', '3sg_future': 'preguntará',
        '1pl_future': 'preguntaremos', '2pl_future': 'preguntaréis', '3pl_future': 'preguntarán',
      },
      ja: {
        base: '尋ねる', content_clause_force: 'interrogative',
        reading: 'たずねる',
        masu_present: '尋ねます',
        masu_present_reading: 'たずねます',
      },
      pt: {
        base: 'perguntar', content_clause_force: 'interrogative',
        '1sg_present': 'pergunto', '2sg_present': 'pergunta', '3sg_present': 'pergunta',
        '1pl_present': 'perguntamos', '2pl_present': 'perguntam', '3pl_present': 'perguntam',
        '1sg_past': 'perguntei', '2sg_past': 'perguntou', '3sg_past': 'perguntou',
        '1pl_past': 'perguntamos', '2pl_past': 'perguntaram', '3pl_past': 'perguntaram',
        '1sg_future': 'perguntarei', '2sg_future': 'perguntará', '3sg_future': 'perguntará',
        '1pl_future': 'perguntaremos', '2pl_future': 'perguntarão', '3pl_future': 'perguntarão',
      },
    },
  },
];
