# Swiss German (`gsw`) — the Dieth style sheet

The spelling rules every `gsw` string in the corpus and the engine follows ([P10 D2](README.md#decisions-to-make),
[P10-E3 D2](P10-E3-orthography-and-lexical-sample.md#d2-the-style-sheet)). **Zürichdeutsch only**
(P10 D1): a Bernese or Basel form is a leak, not a variant.

Dieth (*Schwyzertütschi Dialäktschrift*, 1938; 2nd ed. 1986) is a phonemic spelling: one sound, one
way to write it. Where Dieth leaves a choice, the ruling below is this project's, and it is marked
**ruling**. Every ruling is provisional until the reviewer's calibration pass (E3 D3) and the full
review (E14) confirm it.

**Status:** drafted 2026-09-25 by the implementer, **not yet calibrated** — E3 D3 needs a native
Zürich reviewer, which the project does not have yet.

## Vowels

| rule | examples |
|---|---|
| **Length by doubling**, never by *h* or *ie* | *Huus, Muus, Wii, Maa, gaa, choo, haa, sii, gsee, Chees* |
| Short vowels written single | *Chatz, Hund, ässe, trinke* |
| The diphthongs *ie, ue, üe* are diphthongs, not long *i* | *lieb, Brief, guet, Bueb, müed, Füess* |
| *ei, au, äu* only where Zürich has them (a new diphthong), not for Standard *ei/au* from old long *i/u* | *Wii* (Wein), *Huus* (Haus), plural *Hüser*; but *Ei, Bei, zwei* |
| Open *ä* written *ä* | *ässe, Wäg, Väter* — *e* only for closed *e* (*gsee, Wele*) |
| Unstressed final *-e* is written | *Chatze, springe, grosse* — never dropped to an apostrophe |

## Consonants

| rule | examples |
|---|---|
| Initial /x/ from old *k* is **ch** | *Chatz, Chind, choo, chaufe, Chopf* |
| *k* stays *k* in loans and where Zürich has an aspirate, not the affricate (**ruling**) | *Kafi, Klavier, Computer* — but *Chuchi* (kitchen) |
| No *ß*; **ss** throughout | *gross, Strass, wiss* |
| *st, sp* written *st, sp*, never *scht, schp* (the /ʃ/ is predictable) | *Stei, springe, Stuel* |
| *nd, ng* **as etymology** (**ruling**) | *Hund, Chind, finde, lang* — not *Hunn, Chinn* |
| Word-final devoicing is not written | *Hund*, not *Hunt* |

## Capitals, spacing, apostrophes

- **Nouns are capitalised**, as in Standard German (**ruling**; Dieth leaves it open).
- **Clitic articles stand apart, with no apostrophe** (**ruling**): *d Chatz, s Huus, de Maa*, never
  *d'Chatz, 's Huus*. This affects every definite article the engine emits (P10-E5 D3).
- **Preposition + article contractions are one word** (**ruling**): *im, am, vom, zum, uf em, is*
  (*in s*), *as* (*an s*), *ufs* (*uf s*).
- **No linking *-n-*** (**ruling**): the engine writes full pronouns, *wo ich*, never *wo-n-i*. The
  hiatus *-n-* is spoken, not a word, and writing it would need clitic pronouns the engine does not
  emit (see *Pronouns*).

## Articles and determiners

| | masc | fem | neut | plural |
|---|---|---|---|---|
| definite, nom/acc | **de** | **d** | **s** | **d** |
| definite, dat | **em** | **de** | **em** | **de** |
| indefinite, nom/acc | **en** | **e** | **es** | — |
| indefinite, dat | **emene** | **enere** | **emene** | — |
| *kein*, nom/acc | **kei** | **kei** | **keis** | **kei** |
| *kein*, dat | **keim** | **keinere** | **keim** | **kei** |
| this, nom/acc | **dä** | **die** | **das** | **die** |
| this, dat | **dem** | **dere** | **dem** | **dene** |

Nominative and accusative are one case (P10 D7). There is no genitive.

## Adjectives

Attributive endings, nom/acc — **dative is *-e* everywhere**:

| after | masc | fem | neut | plural |
|---|---|---|---|---|
| definite (*de/d/s*) | **∅** *de gross Hund* | **∅** *d gross Chatz* | **∅** *s gross Huus* | **-e** *d grosse Hünd* |
| indefinite (*en/e/es*) | **-e** *en grosse Hund* | **-i** *e grossi Chatz* | **-s** *es grosses Huus* | — |
| none | **-e** *grosse Hunger* | **-i** *grossi Freud* | **-s** *grosses Glück* | **-i** *grossi Hünd* |

Predicative adjectives take no ending: *d Chatz isch gross*. An adjective's base ends in a consonant or
in a stem vowel it keeps (*müed, nöi, fräch*); a base ending in unstressed *-e* in Standard German drops
it (*müde → müed, leise → liislig* is a different word).

## Verbs

| cell | rule | *ässe* (eat) | *gaa* (go) |
|---|---|---|---|
| infinitive | *-e*, or a doubled long vowel on the short verbs | ässe | gaa |
| 1sg | *-e* dropped: the bare stem | ich iss | ich gang |
| 2sg | *-sch* | du issisch | du gaasch |
| 3sg | *-t* | er isst | er gaat |
| 1/2/3pl | **Zürich *-ed*, all three the same** (P10-E4 D3) | mir/ir/si ässed | mir/ir/si gönd |
| participle | *g(e)-* + stem + *-e/-t*; *ge-* only before a vowel-less cluster where Dieth writes it | gässe | ggange |
| imperative 2sg | the bare stem, stored for every verb | iss! | gang! |
| imperative 2pl | = the 2pl present | ässed! | gönd! |
| auxiliary | `aux: 'be'` where Zürich selects *sii*, as in `de` (motion, change of state, *sii*, *bliibe*) | haa | sii |

- **No preterite, no `*_past` cell** (P10 D5), with one exception the engine never reads: none.
- The participle prefix is **g-**, written joined: *gässe, gsee, gmacht, gschaffet, gläse*. Before a
  stop (*b, d, t, p, k*) it merges into the stop and is **not written** (**ruling**): *bracht, trunke,
  taa, poschtet*. Before *g* it is written, giving *gg* (*ggange, ggää*). *choo* is its own participle.
- **Separable particles** as in `de`, respelled: *zrugg, ab, aa, uf, us, ii, furt, mit, dervoo*.

The irregular core (P10-E4 D1), every cell *(verify)*:

| | 1sg | 2sg | 3sg | pl | participle | aux | imp. |
|---|---|---|---|---|---|---|---|
| sii (be) | bi | bisch | isch | sind | gsii | be | bis |
| haa (have) | ha | hesch | hät | händ | ghaa | | heb |
| gaa (go) | gang | gaasch | gaat | gönd | ggange | be | gang |
| choo (come) | chume | chunnsch | chunt | chömed | choo | be | chumm |
| tue (do) | tue | tuesch | tuet | tüend | taa | | tue |
| wüsse (know) | weiss | weisch | weiss | wüssed | gwüsst | | |
| chöne (can) | cha | chasch | cha | chönd | chöne | | |
| wele (want) | wott | wotsch | wott | wänd | wele | | |
| müese (must) | mues | muesch | mues | müend | müese | | |
| söle (should) | söll | söllsch | söll | söled | söle | | |
| dörfe (may) | darf | darfsch | darf | dörfed | dörfe | | |
| mache (make) | mache | machsch | macht | mached | gmacht | | mach |
| gsee (see) | gsee | gsesch | gseet | gsehnd | gsee | | lueg |
| gää (give) | gibe | gisch | git | gänd | ggää | | gib |
| näh (take) | nime | nimmsch | nimmt | nämed | gnoo | | nimm |

The modals' participle is the infinitive (*Ersatzinfinitiv*, *ich ha müese gaa*, P10-E10).

## Pronouns

Full forms only (**ruling**), never the clitics *i, en, s, mer*: the engine puts a pronoun where a noun
phrase goes and writes the stressed form.

| | nom | acc | dat |
|---|---|---|---|
| 1sg | ich | mich | mir |
| 2sg | du | dich | dir |
| 3sg m | er | in | im |
| 3sg f | si | si | ire |
| 3sg n | es | es | im |
| 1pl | mir | eus | eus |
| 2pl | ir | eu | eu |
| 3pl | si | si | ine |
| generic | me | — | eim |

Possessives: *mis, dis, sis, ires, euses, eues, ires* (neut. nom/acc), declined like *es*: *mini Chatz,
mis Huus, min Hund, mini Hünd*; dative *mim, minere, mim, mine*.

## Function words the engine writes

| `de` | `gsw` | | `de` | `gsw` |
|---|---|---|---|---|
| nicht | **nöd** | | und / oder / aber | und / oder / aber |
| kein | **kei** | | dass | **das** |
| nichts | **nüt** | | wenn / weil / bevor | wenn / will / bevor |
| etwas | **öppis** | | nachdem / während | nachdem / wärend |
| jemand | **öpper** | | obwohl / bis / seit | obwohl / bis / sit |
| sehr | **sehr** | | zu (+ inf.) | **z** |
| auch | **au** | | um … zu | **zum** … **z** / **für** … **z** |
| noch | **no** | | der/die/das (rel.) | **wo** |
| schon | **scho** | | mit / von / zu / in / auf / aus / bei / nach | mit / vo / zu / i / uf / us / bi / nach |
| hier / dort | **da / det** | | über / unter / vor / hinter | über / under / vor / hinder |
| jetzt / heute / morgen | **jetzt / hüt / morn** | | gestern | **geschter** |
| immer / nie | **immer / nie** | | wie / als (comparison) | **wie / als** |

## Lexical rule

A `gsw` lemma is **the Zürich word**, not a respelling of the Standard German one: *luege* (look),
*schaffe* (work), *poschte* (shop), *zügle* (move house), *hoi* (hi), *Bueb* (boy), *Meitli* (girl),
*Rüebli* (carrot), *Velo* (bicycle), *Znüni* … Where Zürich has only the Standard word, it is respelled
by the rules above. **No diminutive is chosen unless the lexeme is one** (P10 D12): *Meitli* is the
word for girl; *Chätzli* is not the word for cat.

## Open points for the calibration pass (E3 D3)

1. Capitalised nouns (Dieth permits both).
2. Separate clitic articles without apostrophe.
3. *nd/ng* written etymologically.
4. The participle prefix before stops.
5. Full pronouns everywhere.
6. *Schwiizerdütsch* (Dieth) over *Schwyzerdütsch* (conventional) as the language's own name (E2 D1).
