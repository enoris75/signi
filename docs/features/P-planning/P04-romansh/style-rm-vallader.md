# Vallader (`rm-vallader`) — the style sheet

The spelling and morphology rules every `rm-vallader` string in the corpus
(`packages/backend/src/concepts/rm-vallader/`) and the Vallader engine (E8) follow
([P04 D1, D5, D8, D11](README.md#decisions), [E3 D2](P04-E3-sources-and-reviewers.md#d2-a-style-sheet-per-variety),
[E6](P04-E6-vallader-column.md)). It covers **Vallader only**, the written standard of the Lower
Engadine and the Val Müstair. A Puter form is a leak, not a variant (E6 D2). The same goes for a
Rumantsch Grischun or Sursilvan form.

**Status:** drafted 2026-09-27 from model knowledge by the implementer. No source has been copied
(see [Sources](#sources)). **Every form here and in the column is *(verify)*** until the Vallader
reviewer's pass (E19). Where the draft is least sure, the text says *(verify)* again.

## Spelling

| rule | examples |
|---|---|
| **ü, ö** are front rounded vowels, written with the umlaut. They are the Engadine mark: RG and Sursilvan have *u, e, i* in these words | *tü, üna, ün, lö, fö, nöglia, cudesch, mür, vöd, spagnöl* |
| **tsch** [tʃ] is written *tsch*, and **ch** is [c] (palatal) before a vowel | *tschierv, fetsch, chasa, chan, chaura* |
| **s-ch** is written with a hyphen where *s* and *ch* are two sounds [ʃc], which keeps it apart from *sch* [ʃ] | *bes-cha, muos-cha, s-chür, tudais-ch* |
| **gl** before a consonant or at the end of a word is [ʎ] | *vegl, ögl, chavagl, sbagl, famiglia* |
| The **1sg present has no ending**, so the stem can end in a cluster | *eu chant, eu cumpr, eu mang* (1sg of *mangiar* *(verify)*), *eu lavur* |
| **Language names** are written lowercase | *rumantsch, vallader, tudais-ch, inglais, talian* |
| Accents only on a stressed final vowel | *mangià, cità, qualità, là, giò, vè* |

## Articles, elision, contractions

| | masculine | feminine |
|---|---|---|
| definite singular | *il* (*il giat*) | *la* (*la chasa*) |
| before a vowel | *l'* (*l'hom*) | *l'* (*l'aua*) |
| definite plural | *ils* | *las* |
| indefinite | *ün* | *üna* |

*a* + *il* → *al*, *da* + *il* → *dal*, *in* + *il* → *i'l*, *in* + *la* → *illa*, *in* + *ils* → *i'ls* *(verify)*.
*Sar* goes before a man's name, with no article (*sar Peider*). The engine writes elision and
contraction, so nothing about them is stored.

## Negation

A **single preverbal particle**: ***nu*** before a consonant and ***nun*** before a vowel. It goes
before the whole verb group, after the subject and any object clitic: *el nu mangia*, *el nun ha
mangià*, *eu nu til vez*. *Brich* after the verb is emphatic and optional (*nu … brich*), and the
draft never adds it *(verify)*. A negative word also takes *nu*: *nu … mai* (never), *nu … plü* (no
longer), *nu … amo* (not yet), *nöglia*, *ingün*.

## The verb

- **Not pro-drop.** The subject pronoun is always there: *eu, tü, el/ella, nus, vus, els/ellas*.
  The generic subject is *ins*.
- **Endings, first conjugation** (*chantar*): present *chant, chantast, chanta, chantain, chantais,
  chantan*; imperfect *-aiva, -aivast, -aiva, -aivan, -aivat, -aivan*; conditional *-ess, -essast,
  -ess, -essan, -essat, -essan*; present subjunctive on the stressed stem, *-a, -ast, -a, -an, -at,
  -an*; participle *-à* (*-ada, -ats, -adas*). Imperative *chanta! chantain! chantai!*
- **-esch- verbs** take *-esch-* in the stressed cells: *telefonar* → *eu telefonesch, el
  telefonescha, nus telefonain*.
- **-er** (unstressed, *vender*) conjugates like *-ar* and has its participle in *-ü* (*vendü*).
  **-air** (*plaschair, parair*) works the same way.
- **-ir** (*partir*): *part, partast, parta, partin, partis, partan*; imperfect *-iva*; conditional
  *-iss*; participle *-i*. Imperative *parta! partin! parti!* The **-isch-** subclass (*finir* →
  *finisch*) follows the same pattern.
- **Stressed and unstressed stems** alternate in speech: *muossar* → *el muossa / nus mussain* *(verify)*,
  *provar* → *el prouva*. The column keeps one stem where it is unsure (*muossain*, *tuornain*),
  and gives the pair only where it is fairly sure (*prouv-/prov-*, *od-/dud-*, *mour-/mur-*). These
  are the column's weakest cells *(verify)*.
- **Compound past** (D5): *avair* or *esser* + participle. After *esser* the participle agrees with
  the subject: *la giatta es ida*. A verb takes *esser* (`aux: 'be'`) when it is a verb of motion,
  a change of state, a pronominal verb or the copula. *Depender*, *plaschair* and *cumanzar* take
  *avair*, where Italian takes *essere* *(verify)*.
- **Future** (D7): ***gnir a*** + infinitive, *eu vegn a mangiar* *(verify)*.
- **Pronominal verbs** put the clitic before the verb: *am, at, as, ans, as, as*, written *m', t',
  s'* before a vowel: *eu m'algord, el as ferma*. The infinitive is cited as *as fermar*. Enclisis
  on the imperative (*ferma't!*) is *(verify)*.
- The **copula** is *esser*. Its 3sg ***es*** is the sharpest marker of the variety (RG *è*,
  Sursilvan *ei*).

## The irregular core

Present, imperfect, conditional and present subjunctive cells, 1sg → 3pl. Every cell *(verify)*.
Any imperative of a modal is a stand-in taken from its subjunctive.

| verb | present | imperfect | conditional | subjunctive | participle, aux | imperative 2sg / 1pl / 2pl |
|---|---|---|---|---|---|---|
| ***esser*** (be) | sun, est, es, eschan, eschat, sun | d'eira, d'eirast, d'eira, d'eiran, d'eirat, d'eiran | füss, füssast, füss, füssan, füssat, füssan | saja, sajast, saja, sajan, sajat, sajan | stat, esser | sajast, sajan, sajat |
| ***avair*** (have) | n'ha, hast, ha, vain, vais, han | vaiva, vaivast, vaiva, vaivan, vaivat, vaivan | vess, vessast, vess, vessan, vessat, vessan | haja, hajast, haja, hajan, hajat, hajan | gnü *(verify)*, avair | hajast, hajan, hajat |
| ***gnir*** (come; future auxiliary) | vegn, vainst, vain, gnin, gnis, vegnan | gniva, gnivast, gniva, gnivan, gnivat, gnivan | gniss, gnissast, gniss, gnissan, gnissat, gnissan | vegna, vegnast, vegna, vegnan, vegnat, vegnan | gnü, esser | vè, gnin, gni |
| ***ir*** (go) | vegn *(verify)*, vast, va, giain, giais, van | giaiva, giaivast, giaiva, giaivan, giaivat, giaivan | giess, giessast, giess, giessan, giessat, giessan | giaja, giajast, giaja, giajan, giajat, giajan | i, esser | va, giain, giai |
| ***far*** (do, make) | fetsch, fast, fa, fain, fais, fan | faiva, faivast, faiva, faivan, faivat, faivan | fess, fessast, fess, fessan, fessat, fessan | fetscha, fetschast, fetscha, fetschan, fetschat, fetschan | fat, avair | fa, fain, fai |
| ***dir*** (say) | di, dist, disch, dschain, dschais, dischan | dschaiva, dschaivast, dschaiva, dschaivan, dschaivat, dschaivan | dschess, dschessast, dschess, dschessan, dschessat, dschessan | dia, diast, dia, dian, diat, dian | dit, avair | di, dschain, dschai |
| ***savair*** (know) | sa, sast, sa, savain, savais, san | savaiva, savaivast, savaiva, savaivan, savaivat, savaivan | savess, savessast, savess, savessan, savessat, savessan | sapcha, sapchast, sapcha, sapchan, sapchat, sapchan | savü, avair | sapchast, sapchan, sapchat |
| ***pudair*** (can) | poss, poust, po, pudain, pudais, pon | pudaiva, pudaivast, pudaiva, pudaivan, pudaivat, pudaivan | pudess, pudessast, pudess, pudessan, pudessat, pudessan | possa, possast, possa, possan, possat, possan | pudü, avair | — |
| ***vulair*** (want) | vögl, voust, voul, vulain, vulais, vöglian | vulaiva, vulaivast, vulaiva, vulaivan, vulaivat, vulaivan | vuless, vulessast, vuless, vulessan, vulessat, vulessan | vöglia, vögliast, vöglia, vöglian, vögliat, vöglian | vuglü *(verify)*, avair | — |
| ***stuvair*** (must) | stögl, stoust, sto, stuvain, stuvais, ston | stuvaiva, stuvaivast, stuvaiva, stuvaivan, stuvaivat, stuvaivan | stuvess, stuvessast, stuvess, stuvessan, stuvessat, stuvessan | stöglia, stögliast, stöglia, stöglian, stögliat, stöglian | stuvü, avair | — |
| ***verer*** (see; the infinitive *(verify)*) | vez, vezzast, vezza, vzain, vzais, vezzan | vzaiva, vzaivast, vzaiva, vzaivan, vzaivat, vzaivan | vzess, vzessast, vzess, vzessan, vzessat, vzessan | vezza, vezzast, vezza, vezzan, vezzat, vezzan | vis, avair | vezza, vzain, vzai |

Also irregular in the column: *dar* (*dun, dast, da, dain, dais, dan*; subjunctive *detta*),
*star* (*stun, stast, sta …*, the BE_FARING verb), *tgnair* (*tegn … tgnain*, participle *tgnü*)
and its compound *cuntgnair*, *survgnir*, *tour* (*tuoch … tollain*, participle *tut*) and *trar*.
SHOULD and MIGHT store the conditional of *stuvair* and *pudair* as their present, as Italian stores
*dovrebbe*.

## Adjectives

Four forms: the masculine singular is bare, the feminine adds *-a*, the plurals add *-s* (*grond,
gronda, gronds, grondas*). Participles in *-à* and *-ü* take *-ada, -ats* and *-üda, -üts*. Adjectives
in *-el, -en, -er, -em* lose the vowel before *-a* (*pussibel → pussibla*, *pitschen → pitschna*).
The adjective follows the noun by default. `position: 'pre'` marks the ones that normally come
before it *(verify each)*: *bun, bel, grond, pitschen, vegl, oter, listess, agen, prüm, seguond,
terz, ultim, prossem*.

## The leak guard

These words tell Vallader from its two neighbours. E10's leak test can look for them in the
`rm-vallader` row, and look for the RG and Sursilvan words as intruders.

| Vallader | Rumantsch Grischun | Sursilvan | Puter (also a leak) |
|---|---|---|---|
| *eu* | *jau* | *jeu* | *eau* |
| *tü* | *ti* | *ti* | *tü* |
| *el es* | *el è* | *el ei* | *el es* |
| *nu / nun* (preverbal) | *na … betg* | *… buca* | *nu* |
| *ün, üna* | *in, ina* | *in, ina* | *ün, üna* |
| *nöglia* | *nagut* | *nuot* | *ünguotta* |
| *ingün* | *nagin* | *negin* | *üngün* |
| *chan* | *chaun* | *tgaun* | *chaun* |
| *nus eschan* | *nus essan* | *nus essan* | *nus essans* |
| *nus chantain* | *nus chantain* | *nus cantein* | *nus chantains* |
| *eu n'ha* | *jau hai* | *jeu hai* | *eau d'he* |

Puter shares *ü, ö* and *nu* with Vallader, so the guard against Puter is the plural *-ns* and the
words in its column.

## Sources

No form has been copied from any work. The column was drafted from model knowledge. Under D11 every
work below is **consult** only, until the reviewer or the rights holder says otherwise.

| work | publisher | access | terms of use | ruling |
|---|---|---|---|---|
| Peer, *Dicziunari rumantsch ladin–tudais-ch* (1962) | Lia Rumantscha | print | none found online; a copyrighted print dictionary | consult |
| *Vocabulari fundamental* (Vallader) | Lia Rumantscha / Uniun dals Grischs | print | none found | consult |
| Online Vallader dictionary (*Pledari vallader*, dicziunari.ch and its apps) | Uniun dals Grischs | online, app | "© Uniun dals Grischs. All rights reserved." A lemmatizer paper got it only "for use solely as part of this lemmatizer", and any other use "will require written permission from the copyright holders" ([rumlem, 2026](https://arxiv.org/html/2604.11233)) | consult: **do not copy** |
| *Pledari Grond* (RG and the Rhenish idioms) | Lia Rumantscha | [pledarigrond.ch](https://pledarigrond.ch/) | RG, Sursilvan, Sutsilvan and Surmiran data are "openly licensed (© Lia Rumantscha 1980–2025)". It does **not** cover Vallader | not a Vallader source |
| *Dicziunari Rumantsch Grischun* | Societad Retorumantscha | print, online | historical dictionary of all varieties; no terms of use found | consult |

The reviewer will be found through the Lia Rumantscha, which will be asked to route to Uniun dals
Grischs (E3 D4). Until then the column stays a draft.

## Open points for the review (E19)

1. The 1sg of verbs whose stem ends in a palatal (*mang, tagl, charg, reg, incleg*).
2. The stressed/unstressed stem pairs (*cumainz-/cumanz-, saint-/sent-, od-/dud-, cugnuosch-/cugnusch-*).
3. Whether the imperfect of *-er* verbs is *-aiva* (as drafted) or *-iva*.
4. The participles of *avair* (*gnü*?), *vulair* (*vuglü*?), *spender, exprimer, stüder, spander*.
5. *ir*'s 1sg (*vegn*?) and whether *verer* is the right infinitive.
6. Which adjectives take `position: 'pre'`.
7. The dative clitics (the draft uses *til/tilla/tils* for both cases).
8. Aux selection where it differs from Italian (*depender, plaschair, cumanzar*).
