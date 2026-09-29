# Swiss German (`gsw`) — the lexical-distance sample

[P10-E3 D1](P10-E3-orthography-and-lexical-sample.md#d1-the-sample): how much of the vocabulary is a
**different word** rather than a respelling of the Standard German one. P10 §1 estimated a third; above
half, the cost estimate doubles and P10 D1 (one dialect) should be revisited.

**Measured 2026-09-25**, on the column E4 seeded (every form *(verify)* until E14). The column was
authored against the [Dieth style sheet](dieth-style-sheet.md) by the implementer, **not by a native
speaker**: the classification below measures what was authored, and the calibration pass
([E3 D3](P10-E3-orthography-and-lexical-sample.md#d3-calibration)) is what will say whether it holds.

## Result

| sample | respelling | sound shift | **different word** | n |
|---|---|---|---|---|
| **the 50 everyday concepts below** (E3 D1's strata) | 18 (36%) | 22 (44%) | **10 (20%)** | 50 |
| the whole corpus, every concept classified at seeding | 413 (53%) | 322 (41%) | **48 (6%)** | 783 |

- **Below a third, and far below half:** the plan's cost estimate stands, and D1 does not need
  revisiting.
- **The two numbers differ for a reason.** The corpus is weighted toward grammar and interface
  vocabulary (*Substantiv, Konjunktion, Satzgfüeg, speichere*), which Swiss usage borrows from
  Standard German, respelled at most. Everyday vocabulary is where the dialect is its own: *springe*
  (run), *gumpe* (jump), *rede* (speak), *luege* (look), *Bueb*, *Meitli*, *Glace*, *dihei*, *da* (here),
  *wider* (again). The 20% is the figure that predicts authoring effort for new everyday words; the 6%
  is the figure for the corpus as it stands.
- The 48 different words are listed at the end.

Classes: **respelling** — the same word, only the spelling rules applied (*Wasser, Hund, Auto*);
**sound shift** — the same word with a regular Zürich shift (*k → ch, ei → ii, au → uu, ie → ie, u →
ue*: *Chind, Ziit, Huus, Buech*); **different word** — Zürich says another word.

## The sample (E3 D1: 15 verbs, 20 nouns, 8 adjectives, 5 adverbs, 2 pronouns)

| concept | role | `de` | `gsw` | class |
|---|---|---|---|---|
| BE | verb | sein | sii | sound shift |
| HAVE | verb | haben | haa | respelling |
| GO | verb | gehen | gaa | sound shift |
| COME | verb | kommen | choo | sound shift |
| DO | verb | tun | tue | respelling |
| KNOW | verb | wissen | wüsse | sound shift |
| SEE | verb | sehen | gsee | sound shift |
| GIVE | verb | geben | gää | sound shift |
| TAKE | verb | nehmen | näh | sound shift |
| EAT | verb | essen | ässe | respelling |
| DRINK | verb | trinken | trinke | respelling |
| RUN | verb | laufen | springe | **different word** |
| JUMP | verb | springen | gumpe | **different word** |
| SPEAK | verb | sprechen | rede | **different word** |
| LOOK_AT | verb | ansehen | aaluege | **different word** |
| CAT | noun | Kater | Chater | sound shift |
| DOG | noun | Hund | Hund | respelling |
| MOUSE | noun | Maus | Muus | sound shift |
| HOUSE | noun | Haus | Huus | sound shift |
| MAN | noun | Mann | Maa | sound shift |
| WOMAN | noun | Frau | Frau | respelling |
| CHILD | noun | Kind | Chind | sound shift |
| BOY | noun | Junge | Bueb | **different word** |
| GIRL | noun | Mädchen | Meitli | **different word** |
| FATHER | noun | Vater | Vatter | respelling |
| MOTHER | noun | Mutter | Mueter | sound shift |
| WATER | noun | Wasser | Wasser | respelling |
| FOOD | noun | Essen | Ässe | sound shift |
| BOOK | noun | Buch | Buech | sound shift |
| DAY | noun | Tag | Tag | respelling |
| TIME | noun | Zeit | Ziit | sound shift |
| CITY | noun | Stadt | Stadt | respelling |
| CAR | noun | Auto | Auto | respelling |
| HOME | noun | Zuhause | Dihei | **different word** |
| ICE_CREAM | noun | Eis | Glace | **different word** |
| BIG | adjective | groß | gross | respelling |
| SMALL | adjective | klein | chlii | sound shift |
| GOOD | adjective | gut | guet | sound shift |
| NEW | adjective | neu | nöi | sound shift |
| OLD | adjective | alt | alt | respelling |
| TIRED | adjective | müde | müed | sound shift |
| BEAUTIFUL | adjective | schön | schön | respelling |
| HOT | adjective | heiß | heiss | respelling |
| HERE | adverb | hier | da | **different word** |
| NOW | adverb | jetzt | jetzt | respelling |
| TODAY | adverb | heute | hüt | sound shift |
| AGAIN | adverb | erneut | wider | **different word** |
| ALWAYS | adverb | immer | immer | respelling |
| FIRST_PERSON | pronoun | ich | ich | respelling |
| SOMETHING | pronoun | etwas | öppis | sound shift |

## Every different word in the corpus (48)

AGAIN *wider*, A_LITTLE *es bitzli*, BACKWARDS *hinderschi*, BEGIN *aafange*, BOY *Bueb*, BREATHE
*schnuufe*, BUTTON *Chnopf*, CALL_PHONE *aalüüte*, CLOSE *zuemache*, CONTINUE *wiitermache*, CRY *brüele*,
DOWN *abe*, FAR *wiit*, GET *überchoo*, GIRL *Meitli*, GRANDCHILD *Grosschind*, HAPPEN *passiere*, HERE
*da*, HOME *Dihei*, ICE_CREAM *Glace*, JUMP *gumpe*, JUST *grad*, LEAVE_DEPART *furtgaa*, LOOK_AT
*aaluege*, LOW *tüüf*, NODE *Chnopf*, NO_LONGER *nüme*, OPEN *ufmache*, OUTSIDE *use*, PAY *zaale*, POUR
*schütte*, PREVIOUS *vorig*, RECENT *zletscht bruucht*, RESULT *Resultat*, RETURN *zruggchoo*, RUN
*springe*, RUN_AWAY *dervoospringe*, SIT_DOWN *abhocke*, SPEAK *rede*, START *aafange*, STICK *Stecke*,
TELL *verzelle*, TIDY_UP *ufruume*, TRY *probiere*, UNPINNED *nüme aaghäftet*, UP *ufe*, WALK *laufe*,
WORK_LABOUR *schaffe*.

## The calibration pass (E3 D3) — not yet run

The reviewer spells these 50 lemmas and 20 of P10's example sentences twice, a week apart, without
seeing the first pass; disagreements with themselves become style-sheet rulings. **Done when** the
second pass disagrees with the first on fewer than 5% of strings. It needs a native Zürich speaker,
which the project does not have yet; E14 cannot start before it.
