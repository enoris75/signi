# Rumantsch Grischun — the irregular core (P04-E3 D3)

The eleven verbs of P04 §1 — *esser, haver, vegnir, ir, far, dir, savair, pudair, vulair, stuair,
vesair* — every cell the column (`packages/backend/src/concepts/rm-rumgr/verbs.ts`) stores, generated
from it so the two cannot drift. **RG's "have" is *avair*, not *haver*** (*haver* is the Sursilvan
spelling); the tables use *avair*.

## Source

Every finite cell and participle below was **spot-checked, one lookup per verb, against the
conjugation tables of the *Pledari Grond*** (Lia Rumantscha, pledarigrond.ch, the RG dictionary),
2026-09-27. Ruling: **consult, not copy**. The site states only *"© Lia Rumantscha, CH-7000 Cuira"*
for the dictionary. The only published terms of use (*Cundiziuns d'utilisaziun*) cover its audio
files, not the dictionary data. The code (github.com/farscrl/pledarigrond-frontend, -api) is Apache-2.0,
which says nothing about the data. The forms are the author's own, confirmed against the dictionary;
nothing was bulk-downloaded. `sources.md` (P04-E3 D1) owns the ruling.

Where the Pledari Grond gives no cell and the column still needs one, the cell is the author's own
*(verify)*:

| verb | cell | the column's choice | why |
|---|---|---|---|
| all | 1pl imperative | the 1pl present (*giain!*, *faschain!*), or the 1pl subjunctive where the imperative is subjunctive-based (*sajan!*, *hajan!*, *sappian!*, *veglian!*) | the Pledari Grond lists only 2sg and 2pl |
| *pudair*, *stuair* | imperative | the subjunctive (*possias!*, *stoppias!*) | the Pledari Grond gives none |
| *vesair* | imperative | regular *vesa!*, *vesain!*, *vesai!* | the Pledari Grond gives none |
| *vesair* | participle | *vesì* (PG also gives the short *vis, visa, vis, visas*) | the regular form kept |
| *vulair* | 1pl present, 1sg imperfect, 1sg conditional | *vulain*, *vuleva*, *vuless* (PG also *lain*, *leva*, *less*) | the full forms kept |
| *savair*, *avair* | participle agreement | none stored (PG: *savì, --*; *gì, xx*) | both take *avair*, which never agrees |

The imperfect and the present subjunctive (*conjunctiv*) are as the Pledari Grond gives them. The
conditional (*cundiziunal*) is the *-ess / -ass / -iss* series; whether it doubles as the imperfect
subjunctive is P04-E16's question.

## esser (BE)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | sun | era | fiss | saja |
| 2sg | es | eras | fissas | sajas |
| 3sg | è | era | fiss | saja |
| 1pl | essan | eran | fissan | sajan |
| 2pl | essas | eras | fissas | sajas |
| 3pl | èn | eran | fissan | sajan |

Participle *stà*, auxiliary *esser*. Imperative 2sg *sajas!*, 1pl *sajan!*, 2pl *sajas!*.

## avair (HAVE)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | hai | aveva | avess | haja |
| 2sg | has | avevas | avessas | hajas |
| 3sg | ha | aveva | avess | haja |
| 1pl | avain | avevan | avessan | hajan |
| 2pl | avais | avevas | avessas | hajas |
| 3pl | han | avevan | avessan | hajan |

Participle *gì*, auxiliary *avair*. Imperative 2sg *hajas!*, 1pl *hajan!*, 2pl *hajas!*.

## vegnir (COME)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | vegn | vegniva | vegniss | vegnia |
| 2sg | vegns | vegnivas | vegnissas | vegnias |
| 3sg | vegn | vegniva | vegniss | vegnia |
| 1pl | vegnin | vegnivan | vegnissan | vegnian |
| 2pl | vegnis | vegnivas | vegnissas | vegnias |
| 3pl | vegnan | vegnivan | vegnissan | vegnian |

Participle *vegnì*, auxiliary *esser*. Imperative 2sg *ve!*, 1pl *vegnin!*, 2pl *vegni!*.

## ir (GO)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | vom | gieva | giess | giaja |
| 2sg | vas | gievas | giessas | giajas |
| 3sg | va | gieva | giess | giaja |
| 1pl | giain | gievan | giessan | giajan |
| 2pl | giais | gievas | giessas | giajas |
| 3pl | van | gievan | giessan | giajan |

Participle *ì*, auxiliary *esser*. Imperative 2sg *va!*, 1pl *giain!*, 2pl *giai!*.

## far (MAKE)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | fatsch | fascheva | faschess | fetschia |
| 2sg | fas | faschevas | faschessas | fetschias |
| 3sg | fa | fascheva | faschess | fetschia |
| 1pl | faschain | faschevan | faschessan | fetschian |
| 2pl | faschais | faschevas | faschessas | fetschias |
| 3pl | fan | faschevan | faschessan | fetschian |

Participle *fatg*, auxiliary *avair*. Imperative 2sg *fa!*, 1pl *faschain!*, 2pl *faschai!*.

## dir (SAY)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | di | scheva | schess | dia |
| 2sg | dis | schevas | schessas | dias |
| 3sg | di | scheva | schess | dia |
| 1pl | schain | schevan | schessan | dian |
| 2pl | schais | schevas | schessas | dias |
| 3pl | din | schevan | schessan | dian |

Participle *ditg*, auxiliary *avair*. Imperative 2sg *di!*, 1pl *schain!*, 2pl *schai!*.

## savair (KNOW)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | sai | saveva | savess | sappia |
| 2sg | sas | savevas | savessas | sappias |
| 3sg | sa | saveva | savess | sappia |
| 1pl | savain | savevan | savessan | sappian |
| 2pl | savais | savevas | savessas | sappias |
| 3pl | san | savevan | savessan | sappian |

Participle *savì*, auxiliary *avair*. Imperative 2sg *sappias!*, 1pl *sappian!*, 2pl *sappias!*.

## pudair (CAN)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | poss | pudeva | pudess | possia |
| 2sg | pos | pudevas | pudessas | possias |
| 3sg | po | pudeva | pudess | possia |
| 1pl | pudain | pudevan | pudessan | possian |
| 2pl | pudais | pudevas | pudessas | possias |
| 3pl | pon | pudevan | pudessan | possian |

Participle *pudì*, auxiliary *avair*. Imperative 2sg *possias!*, 1pl *possian!*, 2pl *possias!*.

## vulair (WILL)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | vi | vuleva | vuless | veglia |
| 2sg | vuls | vulevas | vulessas | veglias |
| 3sg | vul | vuleva | vuless | veglia |
| 1pl | vulain | vulevan | vulessan | veglian |
| 2pl | vulais | vulevas | vulessas | veglias |
| 3pl | vulan | vulevan | vulessan | veglian |

Participle *vulì*, auxiliary *avair*. Imperative 2sg *veglias!*, 1pl *veglian!*, 2pl *veglias!*.

## stuair (MUST)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | stoss | stueva | stuess | stoppia |
| 2sg | stos | stuevas | stuessas | stoppias |
| 3sg | sto | stueva | stuess | stoppia |
| 1pl | stuain | stuevan | stuessan | stoppian |
| 2pl | stuais | stuevas | stuessas | stoppias |
| 3pl | ston | stuevan | stuessan | stoppian |

Participle *stuì*, auxiliary *avair*. Imperative 2sg *stoppias!*, 1pl *stoppian!*, 2pl *stoppias!*.

## vesair (SEE)

| | present | imperfect | conditional | subjunctive |
|---|---|---|---|---|
| 1sg | ves | veseva | vesess | vesia |
| 2sg | vesas | vesevas | vesessas | vesias |
| 3sg | vesa | veseva | vesess | vesia |
| 1pl | vesain | vesevan | vesessan | vesian |
| 2pl | vesais | vesevas | vesessas | vesias |
| 3pl | vesan | vesevan | vesessan | vesian |

Participle *vesì*, auxiliary *avair*. Imperative 2sg *vesa!*, 1pl *vesain!*, 2pl *vesai!*.

## The class models

The column's regular verbs come from four helpers, each checked against Pledari Grond models:

- *-ar*: **mangiar, cumprar, tagliar, chargiar** — *jau mangel, nus mangiain, mangiava, mangiass, mangià*;
- stressed *-er* / *-air*: **vender, baiver, morder, tegnair** — *vendain, vendeva, vendess, vendì*;
- *-ir*, and *-er* verbs like *currer*: **durmir, bragir, siglir, fugir, crescher, currer** — *durmin,
  durmiva, durmiss*;
- the *-esch* extension: **finir, inditgar, fluir** — *finesch, finin, fineschia, finiss*.

Also looked up once each: *dar, star, crair, daventar, engraziar, leger, regurdar, gudagnar,
accumpagnar, numnar, trair, giavischar, enconuscher, prender, respunder, charezzar, telefonar, cular,
mover*. Every other verb in the column is drafted from these models and is *(verify)* until P04-E19.
