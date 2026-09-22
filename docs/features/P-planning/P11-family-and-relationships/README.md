# P11. Family and relationships — kin terms, and whose family they are

**Feature:** the words for relatives (*mother*, *brother*, *cousin*, *mother-in-law*) and for partners
(*friend*, *boyfriend*, *fiancé*), seeded in all 7 languages, plus MARRY. In Japanese the word
changes with whose relative it is: 母 is my mother, お母さん is yours.
**Shape:** no new plan field. About 40 concepts under a new `RELATIVE` genus; two adjectives,
**`ELDER`** and **`YOUNGER`**; four lexeme columns that the shared resolver reads (`possessed`,
`honorific`, `kin`, `with_<ADJECTIVE>`); and one German declension, the adjectival noun.
**Scope:** all 7 languages. Japanese needs the most work. German needs the adjectival noun, and French
and German read the new `possessed` column. English, Italian, Spanish and Portuguese need only data,
because Italian's article rule for kin nouns already exists ([A85](../../../bugs/fixed/A85-italian-kinship-possessive-article.md)).
**Status:** planning. The decisions below are **proposed**, not yet confirmed; each carries a recommendation.
The **localization tickets for these concepts' definitions are catalogued** as B68–B74 (2026-09-22, see
*Localization tickets* below); they seed every word in §4 and correct some of D12's rows.

| lang | my mother runs | your mother runs | a mother runs | my older brother runs | my son marries your daughter |
|---|---|---|---|---|---|
| en | my mother runs. | your mother runs. | a mother runs. | my older brother runs. | my son marries your daughter. |
| it | mia madre corre. | tua madre corre. | una madre corre. | il mio fratello maggiore corre. | mio figlio sposa tua figlia. |
| fr | ma mère court. | ta mère court. | une mère court. | mon frère aîné court. | mon fils épouse ta fille. |
| de | meine Mutter läuft. | deine Mutter läuft. | eine Mutter läuft. | mein älterer Bruder läuft. | mein Sohn heiratet deine Tochter. |
| es | mi madre corre. | tu madre corre. | una madre corre. | mi hermano mayor corre. | mi hijo se casa con tu hija. |
| pt | a minha mãe corre. | a sua mãe corre. | uma mãe corre. | o meu irmão mais velho corre. | o meu filho casa com a sua filha. |
| ja | 母は走ります。 | あなたのお母さんは走ります。 | 母親は走ります。 | 兄は走ります。 | 息子はあなたの娘さんと結婚します。 |

Japanese alone, where the other six languages change nothing:

| plan | ja | why |
|---|---|---|
| my older brother's wife | 兄の妻 | own family, all the way down the chain |
| your older brother's wife | あなたのお兄さんの奥さん | someone else's, all the way down |
| the boy's mother | 男の子のお母さん | a person who is not the speaker's family |
| the cat's mother | 猫の母 | not a person: no honorific |
| I love my wife | 私は妻を愛しています。 | 妻 already means "mine"; 私の is dropped |
| my parents / your parents | 両親 / あなたのご両親 | a plural that is another word |
| my mom (MOM) | お母さん | casual speech has one word for everyone's mother |

## Why

Kin terms are among the first words a learner meets, and the corpus has two: PARENT and FATHER.
Seeding the rest is more than a word list, because each language marks something the others leave out:

1. **Whose family it is (Japanese).** Japanese names your own relatives with one word and someone
   else's with another: 母 (*haha*) is my mother, お母さん (*okāsan*) is yours or his. Some pairs are
   different words entirely: 妻 / 奥さん (wife), 夫 / ご主人 (husband). A mother who is nobody's in
   particular is 母親 (*hahaoya*). So the head noun's word depends on its possessor, and today the
   engine resolves the two independently.
2. **Older or younger (Japanese).** Japanese has no word for "brother": 兄 is an older brother, 弟 a
   younger one. The other six languages say it with an adjective (*fratello maggiore*, *frère aîné*,
   *älterer Bruder*).
3. **The article (Italian).** "*mio* padre", but "*il mio* gatto", "*il loro* padre", "*i miei*
   fratelli", "*il mio* fidanzato", "*la mia* mamma". The rule exists, but only FATHER carries the flag.
4. **The possessor changes the word (French, German).** "ma *femme*" but "une *épouse*"; "meine *Frau*"
   but "eine *Ehefrau*". Without a possessor, *femme* and *Frau* read as "woman".
5. **Plurals that are another word.** German *Elternteil* → *Eltern*, Spanish *progenitor* → *padres*,
   French *frère* → *frères et sœurs* (siblings), Japanese 親 → 両親. The masculine plural names a mixed
   group (es *hermanos* is siblings, *padres* is parents), and Portuguese does it the other way round:
   *avós* is grandparents, but *avô* is grandfather and *avó* grandmother.
6. **One word, several relatives.** Italian *nipote* is a nephew, a niece, a grandson and a granddaughter.
   French *beau-père* is a father-in-law and a stepfather. German *Freund* is a friend and a boyfriend.
7. **Adjectival nouns (German).** *der Verwandte*, *ein Verwandter*, *meinem Verwandten*: the noun
   declines like an adjective. Every German word for "relative" does, and the engine has no such noun.

## Today

Probe-rendered on 2026-09-22 against an in-memory seed of HEAD. The words are stand-in lexemes seeded
the way `/seed` would seed them today: the Italian `kinship` flag as FATHER has it, and the plain word
as the Japanese `base`. "Older brother" uses the only way the builder offers, OLD at degree `more`.
✗ = wrong; ~ = grammatical, but not what a speaker says.

| lang | my mother runs | your mother runs | the boy's mother runs | a mother runs | my older brother runs | my parents run |
|---|---|---|---|---|---|---|
| en | my mother runs. | your mother runs. | the boy's mother runs. | a mother runs. | my older brother runs. | my parents run. |
| it | mia madre corre. | tua madre corre. | la madre del ragazzo corre. | una madre corre. | il mio fratello più vecchio corre. ~ | i miei genitori corrono. |
| fr | ma mère court. | ta mère court. | la mère du garçon court. | une mère court. | mon frère plus vieux court. ~ | mes parents courent. |
| de | meine Mutter läuft. | deine Mutter läuft. | die Mutter des Jungen läuft. | eine Mutter läuft. | mein älterer Bruder läuft. | meine Elternteile laufen. ~ |
| es | mi madre corre. | tu madre corre. | la madre del niño corre. | una madre corre. | mi hermano más viejo corre. ~ | mis progenitores corren. ~ |
| pt | a minha mãe corre. | a sua mãe corre. | a mãe do menino corre. | uma mãe corre. | o meu irmão mais velho corre. | os meus progenitores correm. ~ |
| ja | 私の母は走ります。 ~ | あなたの母は走ります。 ✗ | 男の子の母は走ります。 ✗ | 母は走ります。 ✗ | 私のもっと古い兄弟は走ります。 ✗ | 私の親は走ります。 ~ |

What this shows:

- **Most of Europe already works.** Possessives agree ("ma mère", "mia madre", "meine Mutter"). The
  Italian article drops before a flagged kin noun and comes back with *loro* ("il loro padre") and with
  an adjective ("il mio vecchio padre"). The German weak noun declines ("ich sehe meinen Neffen"), and
  Spanish puts the personal *a* before a relative ("veo a mi sobrino"). MARRY is data only: "mi hijo
  se casa con tu hija", "o meu filho casa com a sua filha", "娘と結婚します", through the existing
  `object_prep` and `object_particle` columns.
- **Japanese ignores who owns the relative.**
  [`possessiveJa`](../../../../packages/engine/src/possessive.ts#L269) writes 私の / あなたの / 彼の in
  front of the head's one word. So someone else's mother is 母, which is rude, and my mother is 私の母,
  which is redundant because 母 already means mine. With no possessor, 母 still reads as "my mother".
- **"Older" is a comparison.** OLD + `more` gives *più vecchio*, *plus vieux* and *más viejo*, where
  speakers say *maggiore*, *aîné* and *mayor*. In Japanese it gives もっと古い, and 古い is only for old
  *things*.
- **The plurals are wrong.** PARENT is seeded with the plurals *Elternteile* (de) and *progenitores*
  (es, pt), where speakers say *Eltern*, *padres* and *pais*. Japanese nouns have no plural, so "my
  parents" is 私の親 rather than 両親.
- **PARENT's definition says "young children".** It renders as "una persona che ha **bambini**", "que
  tiene **niños**" and "que tem **crianças**", because CHILD is a young person, not a son or daughter.

## Decisions to make

| # | Question | Recommendation | Why |
|---|---|---|---|
| D1 | One concept per English word, or per meaning? | **Per meaning** ([P08 D1](../P08-collective-nouns/README.md)). Where English has a male/female pair (*mother / father*), each is its own concept. Where English has one neutral word (*parent*, *sibling*, *cousin*, *grandparent*), there is one concept, and in Romance it takes the masculine with a `fem` counterpart. | The builder's gender control already swaps in `fem` ("mia cugina", "ma cousine", "mi prima"; probed). Romance has no neutral singular for *sibling* or *grandparent*, and its speakers use the masculine. |
| D2 | How does Japanese choose the word? | **Three columns on the ja lexeme:** `base` for nobody's relative (母親), `possessed` for one's own (母), `honorific` for someone else's (お母さん), each with a `_reading`. A missing column falls back, from `honorific` to `possessed` to `base`. | The resolver picks a column without knowing the language: only Japanese stores `honorific`. A prefix rule (お + word + さん) can't give 奥さん, ご主人, 息子さん or 甥御さん. FATHER's ja `base` becomes 父親, and its picker label changes with it. |
| D3 | Whose relative counts as one's own? | **The speaker's.** A 1st-person pronominal possessor (私の, 私たちの) makes the relative one's own. So does a genitive possessor that is itself one's own relative: 私の兄の妻 → 兄の妻. Any other *human* possessor (あなた, 彼, the boy, the teacher) makes it someone else's. A non-human possessor (猫の, その) takes `possessed` with no honorific, and no possessor takes `base`. | This is the *uchi / soto* line as a rule: honorifics go to people outside the speaker's group. Only nouns carry the chain, because a pronoun is features, not a link ([`PronominalPossessor`](../../../../packages/shared/src/index.ts#L643)). Kin nouns carry **`kin: '1'`** on the ja lexeme so the chain can see them. |
| D4 | Does Japanese keep 私の? | **Drop 私の before one's own kin noun** (母は走ります, 私は妻を愛しています). Keep 私たちの and every other possessor. | The plain word already says whose it is, and "私は私の甥を見ます" says 私 twice (probed). 私たちの adds that the relative is shared. **Open:** dropping あなたの before an honorific (お母さんは… is the everyday "your mother"). It is deferred because it loses the person. |
| D5 | Older and younger siblings | **Seed two adjectives, `ELDER` and `YOUNGER`.** Japanese fuses them with the head through `with_ELDER` / `with_YOUNGER` columns (兄弟 + ELDER → 兄, honorific お兄さん). A BROTHER with neither is 兄弟 in Japanese. | An adjective needs no UI. Probed, the six other languages render it idiomatically in every slot: *older*, *maggiore*, *aîné*, *älter* (with the German cases: "meinen älteren Bruder"), *mayor*, *mais velho* (which agrees: "primas mais novas"). OLD + `more` is a comparison (see *Today*). Japanese never guesses the age, just as it never guesses a person's sex for a pronoun ([C20](../../../../packages/shared/src/index.ts#L505): その人). On a head without the column, the adjective renders as itself: 上の息子 (the older son). |
| D6 | French and German *femme* / *Frau* | **The same `possessed` column** (plus `possessed_plural`): fr WIFE *épouse* → *femme*; de WIFE *Ehefrau* → *Frau*, HUSBAND *Ehemann* → *Mann*. It applies under any possessor. | This is what speakers say with a possessor ("ma femme", "meine Frau", "la femme du garçon"), and without one the short word reads as "woman". The long word is correct everywhere, so the column only refines: a lexeme without it stays right. |
| D7 | Plurals that are another word | **Store the word in `plural`:** de *Eltern*, *Geschwister*, *Großeltern*; es *padres*; pt *pais*, *avós*; fr *frères et sœurs*, *grands-parents*. Japanese reads a `plural` column when the lexeme has one (両親), and `plural_honorific` (ご両親). | `plural` is only a stored surface, so European languages need no engine change. Japanese is the one engine that ignores it ([`npSegs.ts:73`](../../../../packages/engine/src/languages/ja/npSegs.ts#L73) writes `base`). This is not [P08 D5](../P08-collective-nouns/README.md)'s `count: 'plural'`: these nouns have a singular. |
| D8 | German *Verwandter* | **An adjectival noun: `adjectival: '1'`** on the de lexeme, with the stem as `base` (*Verwandt*). The German noun phrase adds the adjective ending that its determiner and case select, through the existing [`endingsFor`](../../../../packages/engine/src/languages/de/endingsFor.ts). | Every German word for "relative" declines this way (*Verwandter*, *Angehöriger*), and so does FIANCE (*Verlobter*). *Familienmitglied* declines regularly but means "family member". The same flag later serves *Bekannter*, *Erwachsener*, *Angestellter* and *Deutscher*. |
| D9 | Which Italian nouns drop the article? | **Flag** *padre, madre, figlio, figlia, fratello, sorella, marito, moglie, nonno, nonna, nipote, zio, zia, cugino, suocero, suocera, genero, nuora, cognato, cognata*. **Don't flag** *genitore, mamma, papà, parente, famiglia, coniuge, fidanzato, ragazzo, compagno, amico*. | The flag is on the Italian lexeme, not the concept, because Italian itself splits the meaning: "mia madre" but "la mia mamma". **Open:** *patrigno* / *matrigna*, and "il mio fratello maggiore" (A85's rule, and what the probe gives) against the common "mio fratello maggiore". Check Crusca before pinning tests. |
| D10 | Hierarchy | Seed **`RELATIVE`** under PERSON and `/attach` PARENT under it. Each pair hangs under its neutral genus (MOTHER under PARENT, BROTHER under SIBLING, WIFE under SPOUSE). In-laws and step-parents go under RELATIVE, FAMILY under GROUP ✓, MOM under MOTHER, DAD under FATHER, and BOYFRIEND, GIRLFRIEND and FIANCE under PARTNER. | One hypernym per concept ([P08 D8](../P08-collective-nouns/README.md)). A mother-in-law is not a mother, so she hangs under RELATIVE. |
| D11 | *Child* as offspring | **Seed `CHILD_OFFSPRING`** (synonym "offspring") and re-point PARENT's definition to it. | "My child" is *mio figlio*, *mi hijo*, *meu filho*; CHILD is *bambino*, *niño*, *criança*. French, German and Japanese use one word for both. This also fixes the gloss in *Today*: "una persona che ha figli". |
| D12 | Definitions of the pairs | **`glossOf(genus, 'MALE' / 'FEMALE')` where the genus is neutral in every language**, as FATHER's is already: MOTHER (PARENT), HUSBAND and WIFE (SPOUSE). The pairs under SIBLING, CHILD_OFFSPRING, GRANDPARENT and GRANDCHILD **ship without a definition and get localization tickets**, as does SIBLING itself (it needs SAME: "a person with the same parents"). | Probed: "a female sibling" is *un fratello femminile* ("a female brother"), and with the feminine it is *una sorella femminile*. Romance has no neutral word to modify. |
| D13 | *Mom* and *dad* | **Their own concepts.** They take no Italian flag ("la mia mamma"), and in Japanese one word, お母さん, with `kin: '1'` and no `possessed` or `honorific`. | Casual Japanese uses お母さん for one's own mother too, so the own/other split disappears. These two concepts test that both rules follow the lexeme, not the meaning. |

## 1. Shared types

None. No plan field changes, so `SAVED_PHRASE_VERSION` stays. ELDER and YOUNGER are ordinary
adjectives, and the feminine comes from the existing noun gender control.

## 2. Resolution — [`resolveNounPhrase.ts`](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts)

- **Possessor first.** Resolve the possessor
  ([line 148](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts#L148)) before
  the head's forms are final, because the head's word now depends on it.
- **Fusion (D5).** For each adjective id `A` on the phrase where the head has a `with_A` column, swap
  in that column as `base` (moving `with_A_reading` and `with_A_honorific` along), and drop `A` from
  the resolved adjectives. Do this before the possessor step, so 兄 can still become お兄さん.
- **Possessor form (D2, D3, D6).** Add a new `applyPossessorForm.ts` next to
  [`applyNounGender.ts`](../../../../packages/engine/src/translator/functions/applyNounGender.ts) and
  call it after it. With a possessor, the head takes `possessed` / `possessed_plural`. When the
  possessor is someone else's and human, it takes `honorific` / `plural_honorific` instead. It sets
  **`forms['own'] = '1'`** on a `kin` head whose possessor is one's own, which the chain reads one level up.
  Human means: a 2nd-person possessor, a 3rd-person one that isn't neuter, or a genitive one whose head
  has `human`, which the lexicon already forwards.
- **Japanese plural (D7).** The guard at
  [line 102](../../../../packages/engine/src/translator/functions/resolveNounPhrase.ts#L102) already
  keeps the plural number only when a `plural` column exists, so a ja lexeme with one stays plural.

## 3. Per-engine rendering

| lang | file | change |
|---|---|---|
| ja | [`npSegs.ts`](../../../../packages/engine/src/languages/ja/npSegs.ts#L38-L46) | Skip `possessiveJa` for a 1st-person singular possessor on an `own` head (D4). At [line 73](../../../../packages/engine/src/languages/ja/npSegs.ts#L73), write `plural` and its reading for a plural head that has them (D7). |
| de | [`nounPhrase.ts`](../../../../packages/engine/src/languages/de/nounPhrase.ts), [`endingsFor.ts`](../../../../packages/engine/src/languages/de/endingsFor.ts) | An `adjectival` noun appends the adjective ending for its determiner, case, gender and number: *der Verwandte*, *ein Verwandter*, *einem Verwandten*, bare plural *Verwandte* (D8). The genitive, the compound stem and the agent phrase read the same surface. |
| fr | [`fr.consts.ts:23`](../../../../packages/engine/src/languages/fr/fr.consts.ts#L23) `FR_ADJ_IRREGULAR` | Add `cadet: ['cadet', 'cadette', 'cadets', 'cadettes', 'cadet']`. Probed, the rule gives "cousines cadetes". |
| en, it, es, pt | — | None. Italian's kin-noun article is already [`itPossessedHeadForms`](../../../../packages/engine/src/languages/it/itPossessedHeadForms.ts#L28). |

Document the new columns (`possessed`, `honorific`, `kin`, `with_<ADJECTIVE>`, `adjectival`) in the
[seed skill](../../../../.claude/skills/seed/SKILL.md), next to `kinship` and `weak`.

## 4. Corpus — [`packages/backend/src/concepts/nouns.ts`](../../../../packages/backend/src/concepts/nouns.ts)

Seed with `/seed`, then hang each concept with `/attach` (D10). Seed the genera first (RELATIVE,
SIBLING, SPOUSE, CHILD_OFFSPRING, GRANDPARENT, GRANDCHILD), then ELDER and YOUNGER, because the
Japanese fusion columns name them. Every kin noun is `animate` and `human`.

Notation: *m* / *f* / *n* is the grammatical gender, "fem X" the `fem` counterpart, and "pl. X" a
plural that is irregular or another word. **(k)** marks the Italian `kinship: '1'` flag (D9). In the ja
column, the first word is `base`, "own" is `possessed` and "other's" is `honorific`. **ELDER** /
**YOUNGER** give the `with_` columns, each followed by its own honorific. Every Japanese kin noun also
carries `kin: '1'`. ✓ = already seeded.

### The family

| id | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `RELATIVE` | relative | parente *m*, fem parente | parent *m*, fem parente | Verwandt- (adjectival, D8) | pariente *m*, fem pariente | parente *m*, fem parente | 親戚 (しんせき) · other's ご親戚 |
| `FAMILY` | family | famiglia *f* | famille *f* | Familie *f* | familia *f* | família *f* | 家族 (かぞく) · other's ご家族 |
| `PARENT` ✓ | parent | genitore *m* | parent *m* | Elternteil, pl. **Eltern** | progenitor *m*, pl. **padres** | progenitor *m*, pl. **pais** | 親 (おや) · other's 親御さん; pl. 両親 (りょうしん) · other's ご両親 |
| `FATHER` ✓ | father | padre (k) | père | Vater, pl. Väter | padre | pai | **父親** (ちちおや) · own 父 (ちち) · other's お父さん |
| `MOTHER` | mother | madre *f* (k) | mère *f* | Mutter *f*, pl. Mütter | madre *f* | mãe *f* | 母親 (ははおや) · own 母 (はは) · other's お母さん |
| `CHILD_OFFSPRING` | child (offspring) | figlio, fem figlia (k) | enfant *m*, fem enfant | Kind *n* | hijo, fem hija | filho, fem filha | 子供 (こども) · other's お子さん |
| `SON` | son | figlio (k) | fils, pl. fils | Sohn, pl. Söhne | hijo | filho | 息子 (むすこ) · other's 息子さん |
| `DAUGHTER` | daughter | figlia *f* (k) | fille *f* | Tochter *f*, pl. Töchter | hija *f* | filha *f* | 娘 (むすめ) · other's 娘さん |
| `SIBLING` | sibling | fratello, fem sorella (k) | frère, fem sœur, pl. **frères et sœurs** | Geschwister *n*, pl. Geschwister | hermano, fem hermana | irmão, fem irmã | 兄弟 (きょうだい) · other's ご兄弟 |
| `BROTHER` | brother | fratello (k) | frère | Bruder, pl. Brüder | hermano | irmão | 兄弟 · other's ご兄弟; **ELDER** 兄 (あに) · お兄さん; **YOUNGER** 弟 (おとうと) · 弟さん |
| `SISTER` | sister | sorella *f* (k) | sœur *f* | Schwester *f* | hermana *f* | irmã *f* | 姉妹 (しまい); **ELDER** 姉 (あね) · お姉さん; **YOUNGER** 妹 (いもうと) · 妹さん |
| `SPOUSE` | spouse | coniuge *m*, fem coniuge | conjoint, fem conjointe | Ehepartner, fem Ehepartnerin | cónyuge *m*, fem cónyuge | cônjuge *m*, fem cônjuge | 配偶者 (はいぐうしゃ) |
| `HUSBAND` | husband | marito (k) | mari | Ehemann, pl. Ehemänner · own Mann, pl. Männer | marido | marido | 夫 (おっと) · other's ご主人 (ごしゅじん) |
| `WIFE` | wife, pl. wives | moglie *f*, pl. mogli (k) | épouse *f* · own femme | Ehefrau *f* · own Frau | esposa *f* | esposa *f* | 妻 (つま) · other's 奥さん (おくさん) |
| `GRANDPARENT` | grandparent | nonno, fem nonna (k) | grand-parent, pl. grands-parents | Großelternteil, pl. **Großeltern** | abuelo, fem abuela | avô, pl. **avós**; fem avó, pl. avós | 祖父母 (そふぼ) |
| `GRANDFATHER` | grandfather | nonno (k) | grand-père, pl. grands-pères | Großvater, pl. Großväter | abuelo | avô, pl. avôs | 祖父 (そふ) · other's おじいさん |
| `GRANDMOTHER` | grandmother | nonna *f* (k) | grand-mère *f*, pl. grands-mères | Großmutter *f* | abuela *f* | avó *f*, pl. avós | 祖母 (そぼ) · other's おばあさん |
| `GRANDCHILD` | grandchild, pl. grandchildren | nipote *m*, fem nipote (k) | petit-enfant, pl. petits-enfants | Enkelkind *n* | nieto, fem nieta | neto, fem neta | 孫 (まご) · other's お孫さん |
| `GRANDSON` | grandson | nipote *m* (k) | petit-fils, pl. petits-fils | Enkel | nieto | neto | 孫息子 (まごむすこ) · other's お孫さん |
| `GRANDDAUGHTER` | granddaughter | nipote *f* (k) | petite-fille *f*, pl. petites-filles | Enkelin *f* | nieta *f* | neta *f* | 孫娘 (まごむすめ) · other's お孫さん |
| `UNCLE` | uncle | zio, pl. zii (k) | oncle | Onkel | tío | tio | おじ · other's おじさん |
| `AUNT` | aunt | zia *f* (k) | tante *f* | Tante *f* | tía *f* | tia *f* | おば · other's おばさん |
| `COUSIN` | cousin | cugino, fem cugina (k) | cousin, fem cousine | Cousin, fem Cousine | primo, fem prima | primo, fem prima | いとこ |
| `NEPHEW` | nephew | nipote *m* (k) | neveu, pl. neveux | Neffe (`weak`) | sobrino | sobrinho | 甥 (おい) · other's 甥御さん (おいごさん) |
| `NIECE` | niece | nipote *f* (k) | nièce *f* | Nichte *f* | sobrina *f* | sobrinha *f* | 姪 (めい) · other's 姪御さん (めいごさん) |

おじ, おば and いとこ are written in kana on purpose. Their kanji tell age apart: 伯父 is older than the
parent and 叔父 younger, and 従兄 / 従弟 / 従姉 / 従妹 are the four cousins. Choosing one would guess
(D5). FAMILY is also listed in P08; whichever feature lands first seeds it, and P11 adds ご家族.

### By marriage, and step-parents

| id | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `MOTHER_IN_LAW` | mother-in-law, pl. mothers-in-law | suocera *f* (k) | belle-mère *f*, pl. belles-mères | Schwiegermutter *f* | suegra *f* | sogra *f* | 義母 (ぎぼ) · other's お義母さん (おかあさん) |
| `FATHER_IN_LAW` | father-in-law | suocero (k) | beau-père, pl. beaux-pères | Schwiegervater | suegro | sogro | 義父 (ぎふ) · other's お義父さん (おとうさん) |
| `SON_IN_LAW` | son-in-law | genero (k) | gendre | Schwiegersohn | yerno | genro | 婿 (むこ) · other's お婿さん |
| `DAUGHTER_IN_LAW` | daughter-in-law | nuora *f* (k) | belle-fille *f*, pl. belles-filles | Schwiegertochter *f* | nuera *f* | nora *f* | 嫁 (よめ) · other's お嫁さん |
| `BROTHER_IN_LAW` | brother-in-law | cognato (k) | beau-frère, pl. beaux-frères | Schwager, pl. Schwäger | cuñado | cunhado | 義理の兄弟 (ぎりのきょうだい); **ELDER** 義兄 (ぎけい) · お義兄さん (おにいさん); **YOUNGER** 義弟 (ぎてい) · 義弟さん |
| `SISTER_IN_LAW` | sister-in-law | cognata *f* (k) | belle-sœur *f*, pl. belles-sœurs | Schwägerin *f* | cuñada *f* | cunhada *f* | 義理の姉妹 (ぎりのしまい); **ELDER** 義姉 (ぎし) · お義姉さん (おねえさん); **YOUNGER** 義妹 (ぎまい) · 義妹さん |
| `STEPFATHER` | stepfather | patrigno | beau-père | Stiefvater | padrastro | padrasto | 継父 (けいふ) |
| `STEPMOTHER` | stepmother | matrigna *f* | belle-mère *f* | Stiefmutter *f* | madrastra *f* | madrasta *f* | 継母 (けいぼ) |

French *beau-père* / *belle-mère* name both the in-law and the step-parent, and in speech so do
Japanese 義父 / 義母. STEPFATHER and STEPMOTHER therefore take the unambiguous 継父 / 継母.

### Casual (D13)

| id | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `MOM` | mom | mamma *f*, pl. mamme | maman *f* | Mama *f* | mamá *f* | mamãe *f* | お母さん (おかあさん) |
| `DAD` | dad | papà *m*, pl. papà | papa | Papa | papá | papai | お父さん (おとうさん) |

### Partners and friends

| id | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `PARTNER` | partner | compagno, fem compagna | compagnon, fem compagne | Partner, fem Partnerin | pareja *f* | companheiro, fem companheira | パートナー |
| `BOYFRIEND` | boyfriend | ragazzo | petit ami, pl. petits amis | Freund | novio | namorado | 彼氏 (かれし) |
| `GIRLFRIEND` | girlfriend | ragazza *f* | petite amie *f*, pl. petites amies | Freundin *f* | novia *f* | namorada *f* | 彼女 (かのじょ) |
| `FIANCE` | fiancé, fem fiancée | fidanzato, fem fidanzata | fiancé, fem fiancée | Verlobt- (adjectival, D8) | prometido, fem prometida | noivo, fem noiva | 婚約者 (こんやくしゃ) |
| `FRIEND` | friend | amico, pl. amici; fem amica, pl. amiche | ami, fem amie | Freund, fem Freundin | amigo, fem amiga | amigo, fem amiga | 友達 (ともだち) |

Spanish *pareja* is feminine whoever the partner is, so its agreement follows the word ("mi pareja
está cansada"). The surfaces collide in places: German *Freund* (FRIEND, BOYFRIEND), Italian
*ragazzo* (BOY) and *compagno* (COMPANION), and French *compagnon* (COMPANION). The picker tells them
apart by `synonym`.

### Verb and adjectives

| id | en | it | fr | de | es | pt | ja |
|---|---|---|---|---|---|---|---|
| `MARRY` | marry | sposare | épouser | heiraten | casarse, `object_prep` con | casar, `object_prep` com | 結婚する (けっこんする), `object_particle` と |
| `ELDER` | older | maggiore | aîné | älter | mayor | mais velho | 上の (うえの) |
| `YOUNGER` | younger | minore | cadet (§3) | jünger | menor | mais novo | 下の (したの) |

The Japanese adjectives end in の so that
[`jaAdjClass`](../../../../packages/engine/src/languages/ja/jaAdjClass.ts) links them: probed as bare
上, they gave 上息子.

## 5. Tests

**Engine** — `npm test -w @signi/engine`

- New `test/kinship.test.ts`, with both tables at the top of this doc, and also:
  - **Japanese own / other's / nobody's** for MOTHER, WIFE, HUSBAND, SON and FAMILY. Also: the chain
    both ways (兄の妻, あなたのお兄さんの奥さん); a non-human possessor (猫の母) and その; 私たちの kept;
    私の dropped only before one's own kin noun (私の本 keeps it); MOM unchanged under every possessor.
  - **Fusion:** ELDER and YOUNGER on BROTHER, SISTER and BROTHER_IN_LAW, one's own and someone else's;
    on SON, which doesn't fuse (上の息子). In the other six languages: as subject, as object, and in a
    German dative ("meinem älteren Bruder").
  - **`possessed`:** "ma femme", "la femme du garçon", "une épouse"; "meine Frau", "die Frau des
    Jungen", "eine Ehefrau".
  - **Plurals:** "meine Eltern", "mis padres", "os meus pais", "os meus avós", "mes frères et sœurs",
    "meine Geschwister", 両親, あなたのご両親.
  - **German adjectival:** *der Verwandte, ein Verwandter, einen Verwandten, meinem Verwandten, die
    Verwandten*, bare plural *Verwandte*, feminine *eine Verwandte*; the same for *Verlobter*.
  - **Italian flag:** "mio marito", "il mio fidanzato", "la mia mamma", "il loro padre", "i miei
    fratelli", "mia cugina".
  - **MARRY** in all 7 languages.
- Colocated: `applyPossessorForm.test.ts` (which column is chosen, and the `own` mark);
  `ja/npSegs.test.ts` (the drop, the plural); `de/nounPhrase.test.ts` (adjectival);
  `fr/agreeAdjFr.test.ts` (*cadette*).
- [`possessivePronoun.test.ts`](../../../../packages/engine/test/possessivePronoun.test.ts) stays green
  unchanged, with the A85 and A187 regressions.

**Backend** — `npm test -w @signi/backend`: the seed tests cover the new concepts in all 7 languages,
`hierarchy.test.ts` covers the RELATIVE subtree, and the boot check renders PARENT's new definition.

**Frontend** — no change.

## Verification

1. `npm run seed`, then rebuild `@signi/shared` and `@signi/engine`: the backend runs both dists,
   not `src`.
2. Engine and backend suites green; workspace typecheck clean.
3. API: `POST /api/translate` with the plans behind both tables at the top; compare all 7 languages.
4. In the browser (5173): give MOTHER a 1st-person possessor and check ja 母. Switch it to 2nd person
   (お母さん), then remove it (母親). Add ELDER to BROTHER and check 兄, *fratello maggiore*, *frère aîné*.

## Localization tickets

Catalogued on 2026-09-22, **before** the seeding rather than after: each word was seeded in memory
and its definition rendered through the engine source at HEAD, the way
[P09](../P09-core-vocabulary/README.md) was. The 41 concepts of §4 are
[B68–B74](../../../localization/localization-tasks.md#part-b--needs-seeding-b-needs-seed), one
ticket per branch of the family, and their **Seed first** tables are this plan's §4 with the forms
checked, so authoring one is the seeding and the tooltips in a single pass. **37 of the 41 concepts
ship a gloss**, PARENT's is re-pointed (D11), and **no C ticket was needed**: every definition
composes on the corpus as it stands, and none of them reads the columns §2 and §3 add, because a
definition has no possessor. The tickets can therefore be authored before, during or after the
engine work here.

What [the P11 sweep](../../../localization/localization-tasks.md#the-p11-sweep-of-2026-09-22)
changes in this plan:

- **D12 is too pessimistic.** BROTHER and SISTER *can* be defined — not by the sex adjective on
  their genus (*un fratello maschile*, as D12 says) but by a relative clause on PERSON, which is
  neutral in all seven: "a male person who has the same parents"
  ([B69](../../../localization/B-needs-seed/B69-brothers-and-sisters.md)). GRANDSON and
  GRANDDAUGHTER ship on the adjective after all, because *nipote*, *petit-enfant*, *Enkelkind* and
  孫 are neutral ([B71](../../../localization/B-needs-seed/B71-grandparents-and-grandchildren.md)).
- **SON and DAUGHTER are the two that stay on the literal**, and for a different reason than D12
  gives: their working gloss ("a parent's male child") would define CHILD_OFFSPRING's species by the
  genus its own gloss names ("a son or a daughter"), a circle
  ([B68](../../../localization/B-needs-seed/B68-the-family.md)). MOM and DAD stay literal because
  register is not a differentia, which is D13 read from the definitions' side.
- **D10's ✓ on FAMILY is wrong** — the corpus has no FAMILY concept; B68 seeds it.
- **One engine defect blocks three tooltips**: Spanish puts the personal *a* after *tener* ("tiene
  **a** los mismos padres"), and B69's seed has to fix it. No bug file covers it.

## Later languages

- **Russian ([P06](../P06-russian/README.md)) and Ukrainian ([P07](../P07-ukrainian/README.md))**
  split the in-laws by which spouse they belong to. The husband's mother is свекровь / свекруха and the
  wife's mother is тёща / теща; likewise свёкор / свекор and тесть. MOTHER_IN_LAW can't render both.
  The plan already carries the information in "my husband's mother", so a `with_`-style fusion keyed
  on the possessor could pick the word. Decide when P06 lands. Polish
  ([P05](../P05-polish/README.md)) uses one word, *teściowa*, for both.
- **Catalan ([P03](../P03-catalan/README.md))** keeps the article: "la meva mare". It needs no flag.

## Out of scope (follow-ups)

- **Japanese honorific verbs:** お母さんがいらっしゃいます and 召し上がります, 父が参ります. The `own`
  mark from D3 is what they would read.
- **Talking to family:** calling one's own mother お母さん, and *Mom* as a name ("Mom runs", "Mamá
  corre", "Mama läuft").
- **Coreference:** "his mother", where he is the speaker's brother, counts as someone else's under D3,
  because the possessor carries features, not a link. The same applies to Japanese 自分の for a
  possessor that is the subject.
- **Half- and step-siblings, step-children, great-grandparents, godparents, *ex-*.** Japanese splits
  half-siblings by the parent they share (異母兄弟 / 異父兄弟), and Italian *fratellastro* is both
  half- and step-brother.
- **MARRIED, SINGLE, DIVORCE** (German *sich scheiden lassen*), **BE_BORN** (English *be born*, German
  *geboren werden*), **RAISE_CHILD**.
- **German *ein Freund von mir***, the way German says "a friend" as opposed to "my boyfriend".
- **Counting relatives:** Japanese 三人兄弟, "we are three siblings".
- **British *Mum*.**
