# B68. The family — a relative, a family, a parent's child: five glosses, and *son* and *daughter* on the literal

_(from the P11 family-and-relationships sweep of 2026-09-22. The nuclear family of
[P11](../../features/P-planning/P11-family-and-relationships/README.md) §4 and its casual names.
Eight words seed, four gloss, and PARENT — seeded already — is **re-pointed** to the new
CHILD_OFFSPRING (P11 D11) and gets the three plurals of D7. SON, DAUGHTER, MOM and DAD stay on the
English literal, each with its leads probed below. No gloss here reads P11's new lexeme columns, so
this ticket can be authored before the engine work of P11 §2–§3 lands.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders. **(k)** is the Italian
`kinship: '1'` flag (P11 D9); the Japanese `base` is given here, with the `possessed` / `honorific` /
`kin` columns P11 D2 adds in the same seed (they are listed in
[P11 §4](../../features/P-planning/P11-family-and-relationships/README.md), and no definition reads
them).

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| RELATIVE | noun, isA PERSON | relative | parente *m*, fem parente | parent *m*, fem parente | Verwandt- (adjectival, D8) | pariente *m*, fem pariente | 親戚 (しんせき) | parente *m*, fem parente |
| FAMILY | noun, isA GROUP | family | famiglia *f* | famille *f* | Familie *f* | familia *f* | 家族 (かぞく) | família *f* |
| MOTHER | noun, isA PARENT | mother | madre *f* (k) | mère *f* | Mutter *f*, pl. Mütter | madre *f* | 母親 (ははおや) | mãe *f* |
| CHILD_OFFSPRING | noun, isA RELATIVE, synonym *offspring* | child | figlio, fem figlia (k) | enfant *m*, fem enfant | Kind *n* | hijo, fem hija | 子供 (こども) | filho, fem filha |
| SON | noun, isA CHILD_OFFSPRING | son | figlio (k) | fils, pl. fils | Sohn, pl. Söhne | hijo | 息子 (むすこ) | filho |
| DAUGHTER | noun, isA CHILD_OFFSPRING | daughter | figlia *f* (k) | fille *f* | Tochter *f*, pl. Töchter | hija *f* | 娘 (むすめ) | filha *f* |
| MOM | noun, isA MOTHER | mom | mamma *f* | maman *f* | Mama *f* | mamá *f* | お母さん (おかあさん) | mamãe *f* |
| DAD | noun, isA FATHER | dad | papà *m*, pl. papà | papa | Papa | papá | お父さん (おとうさん) | papai |

Every one is `animate` and `human` but FAMILY, which is a GROUP. Three things for the seed author:

- **PARENT is already seeded and this ticket owns two edits to it.** Its `definition` re-points from
  CHILD to CHILD_OFFSPRING (P11 D11) — today it renders *bambini*, *niños*, *crianças*, young
  children rather than offspring — and its plurals become the words speakers use (P11 D7): de
  **Eltern** (not *Elternteile*), es **padres** (not *progenitores*), pt **pais**. The plural is a
  stored surface, so no engine change; [B69](B69-brothers-and-sisters.md)'s gloss reads it.
- **RELATIVE is German's adjectival noun** (*der Verwandte*, *ein Verwandter*, P11 D8), which the
  engine cannot decline yet. The one gloss that uses it, FAMILY's, takes the **plural** — *eine
  Gruppe von Verwandten* — which the plain plural surface gets right, so the tooltips do not wait
  on P11 §3. The singular does.
- **French *parent* is both the relative and the parent**, so FAMILY's gloss reads *un groupe de
  parents* ("a group of parents") in French. The picker tells the two concepts apart by `synonym`;
  see reading 5.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| RELATIVE | `{ subject: { concept: 'PERSON', definiteness: 'indefinite', possessor: { concept: 'FAMILY', definiteness: 'definite', adjectives: ['SAME'] }, possessorRole: 'whole' } }` | a person of the same family |
| FAMILY | `{ subject: { concept: 'GROUP', definiteness: 'indefinite', possessor: { concept: 'RELATIVE', definiteness: 'bare', number: 'plural' }, possessorRole: 'parts' } }` | a group of relatives |
| PARENT (re-point) | `whoGloss('PERSON', 'HAVE', 'CHILD_OFFSPRING')` | a person who has children |
| MOTHER | `{ subject: { concept: 'PARENT', definiteness: 'indefinite', gender: 'fem', adjectives: ['FEMALE'] } }` | a female parent |
| CHILD_OFFSPRING | `{ subject: { conjuncts: [{ concept: 'SON', definiteness: 'indefinite' }, { concept: 'DAUGHTER', definiteness: 'indefinite' }], conjunction: 'or' } }` | a son or a daughter |

Four of the eight words, plus PARENT's re-point. RELATIVE's plan is the part-whole possessor of
[C26](../done/C26-root-nouns-on-the-literal.md) read from the member's end; FAMILY's is the same
relation read from the group's, as "a group of canvases" is.

## Probe renders (2026-09-22, engine source at HEAD in a detached worktree, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| RELATIVE | a person of the same family | una persona della stessa famiglia | une personne de la même famille | eine Person der gleichen Familie | una persona de la misma familia | 同じ家族の人 | uma pessoa da mesma família |
| FAMILY | a group of relatives | un gruppo di parenti | un groupe de parents | eine Gruppe von Verwandten | un grupo de parientes | 親戚のグループ | um grupo de parentes |
| PARENT (re-pointed) | a person who has children | una persona che ha figli | une personne qui a des enfants | eine Person, die Kinder hat | una persona que tiene hijos | 子供を持つ人 | uma pessoa que tem filhos |
| PARENT (shipped today) | a person who has children | una persona che ha **bambini** | une personne qui a des enfants | eine Person, die Kinder hat | una persona que tiene **niños** | 子供を持つ人 | uma pessoa que tem **crianças** |
| MOTHER | a female parent | una genitrice femminile | un parent féminin | ein weibliches Elternteil | una progenitora femenina | 女性の親 | uma progenitora feminina |
| CHILD_OFFSPRING | a son or a daughter | un figlio o una figlia | un fils ou une fille | ein Sohn oder eine Tochter | un hijo o una hija | 息子か娘 | um filho ou uma filha |
| FATHER (shipped, for comparison) | a male parent | un genitore maschile | un parent masculin | ein männliches Elternteil | un progenitor masculino | 男性の親 | um progenitor masculino |

No proposed render collides with a shipped gloss or with another in the P11 batch, in any language.
Five readings to judge on authoring:

1. **The re-point is why CHILD_OFFSPRING is seeded at all.** Italian, Spanish and Portuguese change
   (*figli*, *hijos*, *filhos*, against today's *bambini*, *niños*, *crianças*); English, French,
   German and Japanese say the same words either way, because each has one word for both senses.
   That is D11 in a table.
2. **MOTHER takes the noun gender control and FATHER does not.** With `gender: 'fem'` Italian reads
   *una genitrice femminile* and Spanish *una progenitora femenina*; without it, *un genitore
   femminile* — a masculine article under a feminine adjective. FATHER ships without one and needs
   none. Aligning FATHER (adding `gender: 'masc'`, no surface change) is offered, not asked: it
   would touch a shipped definition and its tests.
3. **CHILD_OFFSPRING's gloss is a coordination, and it is the first one used as a gloss's subject.**
   The corpus coordinates inside a gloss already — PLURAL's object, NEUTER's predicative — and the
   subject position renders the same in all seven, Japanese included (息子か娘). It is also why SON
   and DAUGHTER keep the literal: gloss either on CHILD_OFFSPRING and the three define each other in
   a circle (see **Not solved**).
4. **RELATIVE and FAMILY define each other.** "A person of the same family" / "a group of
   relatives" is the whole-and-part kind the corpus already accepts (KEY ↔ KEYBOARD), not the scalar
   kind it refuses; it is named here so the cycle walk of a later sweep does not re-open it. The
   alternatives probed — RELATIVE as "a parent, a child or a sibling" (which leaves out every uncle
   and cousin) and FAMILY as "a group that lives together" (which is a household) — are worse.
5. **French says *parent* for both concepts**, so RELATIVE's own gloss is what distinguishes them in
   French: *une personne de la même famille* against PARENT's *une personne qui a des enfants*. In
   FAMILY's gloss the word is ambiguous (*un groupe de parents*); *un groupe de proches* would not be,
   but *proche* is a different concept the corpus does not have.

## Not solved by this seed

1. **SON and DAUGHTER are literal by design — the definition would close a circle.** Every lead
   renders; none survives the corpus's own rules.

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | `glossOf('CHILD_OFFSPRING', 'MALE')` | a male child | un figlio maschile | un enfant masculin | ein männliches Kind | un hijo masculino | 男性の子供 | um filho masculino |
   | the same, with a PARENT possessor | a parent's male child | un figlio maschile di un genitore | un enfant masculin d'un parent | ein männliches Kind eines Elternteils | un hijo masculino de un progenitor | 親の男性の子供 | um filho masculino de um progenitor |
   | DAUGHTER, the same + `gender: 'fem'` | a parent's female child | una figlia femminile di un genitore | une enfant féminine d'un parent | ein weibliches Kind eines Elternteils | una hija femenina de un progenitor | 親の女性の子供 | uma filha feminina de um progenitor |
   | a MALE PERSON who has PARENTs | a male person who has parents | una persona maschile che ha genitori | une personne masculine qui a des parents | eine männliche Person, die Eltern hat | una persona masculina que tiene padres | 親を持つ男性の人 | uma pessoa masculina que tem pais |

   The first says *boy*, not *son*, in the four languages that have one word for a child of either
   kind. The second and third are true and distinguishing, and both stand on CHILD_OFFSPRING, whose
   own gloss is "a son or a daughter" — a genus and its two species defining each other, which is
   the circular kind, not the accepted verb-and-object kind. The fourth is true of everyone. In
   Italian, Spanish and Portuguese all four also read as "a male son": *figlio* **is** the son and
   the offspring, which is what D1 says of the pairs. **The author may swap the verdict** — gloss
   SON and DAUGHTER on the second and third rows and leave CHILD_OFFSPRING on the literal — but not
   ship both: the picker needs the tooltip more on *figlio (offspring)* than on *figlio (son)*.
2. **MOM and DAD are literal by design — register is not a differentia (P11 D13).** "A mother"
   restates MOTHER, and "a child's mother" is true of every mother:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | `glossOf('MOTHER')` | a mother | una madre | une mère | eine Mutter | una madre | 母親 | uma mãe |
   | a MOTHER of a CHILD | a child's mother | una madre di un bambino | une mère d'un enfant | eine Mutter eines Kindes | una madre de un niño | 子供の母親 | uma mãe de uma criança |
   | DAD: a FATHER of a CHILD | a child's father | un padre di un bambino | un père d'un enfant | ein Vater eines Kindes | un padre de un niño | 子供の父 | um pai de uma criança |

   What separates *mom* from *mother* is who says it and to whom, which no phrase the engine
   composes can say — the AMERICAN and RIGHT_SIDE verdict of [B66](../done/B66-core-adjectives.md).
   Both still earn their seed: D13 makes them the two concepts that prove the Italian article flag
   and the Japanese own/other split follow the **lexeme**, not the meaning ("la mia mamma", お母さん
   for everyone's mother).
3. **No word is seeded that only an unwritable tooltip would use.** Every one of the eight is a P11
   §4 row.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
CHILD_OFFSPRING in Italian and Japanese (*un figlio o una figlia*, 息子か娘), which pins the
coordinated gloss, and PARENT in Italian (*una persona che ha figli*), which pins the re-point.
