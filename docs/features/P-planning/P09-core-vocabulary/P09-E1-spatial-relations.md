# P09-E1. Spatial relations — on, between, against

**Construct:** the relations [`PathSpecifier`](../../../../packages/shared/src/index.ts#L323) is
missing, the last row of [P09 §3](README.md#3-needs-the-engine-first-11-constructs--5-open) that is
pure vocabulary.
**Shape:** two more `PathSpecifier` values (`on`, `against`) built exactly like
[A02](../../A-ready/A02-locative-near-far/README.md), plus one — **`between`** — that is a value too
but the **first relation that scopes over a coordinated head instead of distributing across it**.
**Scope:** all 7 languages. Offered on the locative and route toolbars; the `direction` complement
reads the same set and needs no new offering.
**Status:** planning, unscheduled. Split out of P09 §3 on 2026-09-23.
**Words:** *on*, *between*, *against*. **Not *into***, which P09 §3 listed here and which already
renders — see *Today*.

| lang | the cat sleeps **on** the table | the cat sleeps **between** the house and the tree | the cat sleeps **against** the wall |
|---|---|---|---|
| en | the cat sleeps on the table. | the cat sleeps between the house and the tree. | the cat sleeps against the wall. |
| it | il gatto dorme sul tavolo. | il gatto dorme tra la casa e l'albero. | il gatto dorme contro il muro. |
| fr | le chat dort sur la table. | le chat dort entre la maison et l'arbre. | le chat dort contre le mur. |
| de | der Kater schläft auf dem Tisch. | der Kater schläft zwischen dem Haus und dem Baum. | der Kater schläft an der Wand. |
| es | el gato duerme sobre la mesa. | el gato duerme entre la casa y el árbol. | el gato duerme contra la pared. |
| pt | o gato dorme sobre a mesa. | o gato dorme entre a casa e a árvore. | o gato dorme contra a parede. |
| ja | 猫はテーブルの上で寝ます。 | 猫は家と木の間で寝ます。 | 猫は壁にもたれて寝ます。 |

**The table is proposed, not engine output** — the construct does not exist, so nothing renders it
yet. The localization protocol's rule holds here too: the forms are what the task expects, and the
`## Done` section rewrites them with what the engine actually wrote.

## Why

Containment, the vertical axis, the front/back axis and enclosure are all in the set; **support is
not**. A cat can be *in* the house, *under* the bed, *over* the market and *behind* the wall, but
nothing can be **on** a table. It is the commonest spatial relation there is, and its absence is
what forces the `locative` default to carry work it should not: `in` on a flat landmark renders "in
the table" in all seven.

*Between* and *against* are the next two by frequency, and each is a different kind of problem —
see *Design*.

## Today

Verified at HEAD, 2026-09-23.

- [`PathSpecifier`](../../../../packages/shared/src/index.ts#L323) is
  `in | through | under | over | around | behind | in_front_of` — seven values, with
  [`PATH_SPECIFIERS`](../../../../packages/shared/src/index.ts#L325) the list the toolbars read and
  [`DEFAULT_ROUTE_SPECIFIER`](../../../../packages/shared/src/index.ts#L328) / `DEFAULT_LOCATIVE_SPECIFIER`
  the two fallbacks.
- **`into` is already built, and P09 §3 was wrong to list it here.** A `direction` complement reads
  the same set through [`directionSpecifier`](../../../../packages/engine/src/functions/directionSpecifier.ts),
  English maps direction + `in` to *into* in
  [`GOAL_PREP`](../../../../packages/engine/src/languages/en/en.consts.ts#L107) (`{ ...PATH_PREP, in: 'into' }`),
  and German gets it from the case: [`spatialCase`](../../../../packages/engine/src/languages/de/spatialCase.ts)
  returns `acc` for every relation under a `direction`, which is the whole of the difference between
  *in die Luft* and *in der Luft*. Nothing in E1 needs to touch it.
- **A coordinated landmark is already representable.** [`Complement.phrase`](../../../../packages/shared/src/index.ts#L1018)
  is a `NounElement`, so it may be a `NounGroup` of conjuncts joined by
  [`NOUN_COORD_CONJUNCTIONS`](../../../../packages/shared/src/index.ts#L877). P09 §3's note that
  "`between` needs two landmarks" is answered by the model as it stands — the problem is elsewhere,
  and D2 below states it.

The relation is rendered per language in a single place each, which is what makes `on` and
`against` a two-line change per engine:

| lang | file | shape |
|---|---|---|
| en | [`en.consts.ts:89`](../../../../packages/engine/src/languages/en/en.consts.ts#L89) | `PATH_PREP` map, and `GOAL_PREP` overriding only `in` |
| it | [`it/spatialHead.ts`](../../../../packages/engine/src/languages/it/spatialHead.ts) | switch; fusing `prepDet` vs. non-fusing `artFor` |
| fr | [`fr/spatialHead.ts`](../../../../packages/engine/src/languages/fr/spatialHead.ts) | switch; `prepDet` vs. `deDet` |
| es | [`es/spatialHead.ts`](../../../../packages/engine/src/languages/es/spatialHead.ts) | switch; `prepDet` vs. `deDet` |
| pt | [`pt/spatialHead.ts`](../../../../packages/engine/src/languages/pt/spatialHead.ts) | switch; `contractDet` with `emPrep` / `dePrep` |
| de | [`de/spatialHead.ts`](../../../../packages/engine/src/languages/de/spatialHead.ts) + [`spatialCase.ts`](../../../../packages/engine/src/languages/de/spatialCase.ts) | preposition **and** the case it governs |
| ja | [`ja.consts.ts:100`](../../../../packages/engine/src/languages/ja/ja.consts.ts#L100) | `REL_NOUN` + `REL_NOUN_READING`, a relational noun before the particle |

## Design

### D1. `on` against `over` — six languages tell them apart, and Japanese does not

*On* is contact and support; *over* is superiority without it. Six of the seven have two words, and
the split is not the same split twice:

| lang | `over` today | `on` proposed | apart? |
|---|---|---|---|
| en | over | on | yes |
| de | über | auf | yes, and both are two-way prepositions |
| it | sopra | su (fusing: *sul*, *sulla*) | yes |
| fr | au-dessus de / par-dessus (route) | sur | yes |
| es | por encima de | **sobre** | yes — but **not `en`**, which `in` already spells |
| pt | por cima de | **sobre** | yes — but **not `em`**, which `in` already spells |
| ja | の上 | **の上** | **no** |

Two consequences, and they are the whole of D1:

1. **Spanish and Portuguese must take *sobre*, not *en* / *em*.** Both spell *on* with the same
   preposition they spell *in* with, so reusing it would make `on` and `in` render identically and
   lose a relation the other six keep. *Sobre* is the unambiguous one, and it contracts with
   nothing, so it goes through the same `deDet`-less path the adverbs take.
2. **Japanese cannot tell `on` from `over` at all** — both are 〜の上. **Recommendation: let them
   collide.** It is the honest rendering; の上 is what a dictionary gives for both, and the
   alternative (〜の表面に for contact) is a paraphrase, not a relation. Pin the collision in a test
   with a comment saying it is deliberate, the way the source-and-`far` overlap is pinned in
   [A02](../../A-ready/A02-locative-near-far/README.md).

### D2. `between` distributes wrongly over a coordinated head — and that is the real work

A coordinated complement head renders **one preposition per conjunct**, which every engine does on
purpose and German says out loud:

> The preposition governs a case, and the case is spelled on each conjunct's own article ("mit dem
> Messer und dem Stock"), so preposition and determiner are emitted per conjunct.
> — [`de/complementsPhrase.ts:97`](../../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts#L97)

That is right for every relation in the set and **wrong for `between`**, which takes one preposition
over the pair: *zwischen dem Haus und dem Baum*, not *zwischen dem Haus und zwischen dem Baum*.
`between` is the first relation whose scope is the group rather than each conjunct.

**Recommendation: a group-scoping flag on the relation, read by each engine's `coordinate` call.**
Add `GROUP_SCOPED_SPECIFIERS` (a `Set<PathSpecifier>` holding `between` alone) beside
`PATH_SPECIFIERS`, and in each engine's complement path, take the head once and coordinate the
*conjuncts* inside it rather than the whole phrase. Seven engines, one call site each — the same
`coordinate(c.phrase, …)` line in every one.

Two facts make it cheaper than it sounds. German's case still spells on each conjunct's own article
(*zwischen dem Haus und dem Baum* — both dative), so only the preposition moves out, not the
declension. And Japanese needs nothing: it builds 家と木の間で out of the group and a relational noun
の間 exactly as it builds 家の下で, because the particle already follows the whole phrase.

**Open:** whether a `between` with a single landmark is an error or a rendering. Recommendation:
render it (*between the house* is odd but not ill-formed, and Japanese 家の間 is fine), and leave the
two-conjunct requirement to the builder, which is where the other "at least two" rule already lives
([`NounGroup`](../../../../packages/shared/src/index.ts#L848)).

### D3. `against` is contact, not opposition

English *against* spells both the physical relation ("leans against the wall") and the adversarial
one ("fights against the dog"). Only the first is a spatial relation; the second is a complement
type and belongs to [E2](P09-E2-complement-types.md), if anywhere.

**Recommendation: seed the physical relation only**, and say so in the `PathSpecifier` doc comment.
It is the one the Romance languages spell *contro / contre / contra / contra* and German spells
**an** + dative (*an der Wand*), not *gegen* — *gegen die Wand* is motion into it, which is the
`direction` reading the case already gives. Japanese has no adposition for it at all: the relation
is carried by the verb (もたれる, "to lean"), so **`against` is the one relation Japanese renders
with に and nothing else**, and the proposed 壁にもたれて above is a paraphrase a relation cannot
produce. Pin `against` in Japanese as plain に and record it as a known flattening, beside `on`'s.

## 1. Shared types — [`packages/shared/src/index.ts`](../../../../packages/shared/src/index.ts)

- `PathSpecifier` ([L323](../../../../packages/shared/src/index.ts#L323)): add `'on' | 'between' | 'against'`.
- `PATH_SPECIFIERS` ([L325](../../../../packages/shared/src/index.ts#L325)): append the three.
- Add `GROUP_SCOPED_SPECIFIERS` (D2) with a doc comment naming the distribution rule it opts out of.
- Extend the `PathSpecifier` doc comment with the support axis (D1), the group scope (D2) and the
  contact-only reading of `against` (D3), including both Japanese flattenings.
- [`uiStrings.ts:2467`](../../../../packages/shared/src/uiStrings.ts#L2467): three
  `specifier.value.*` entries, cited on a bare noun the way the existing seven are (it *su*, de
  *auf*, ja 〜の上で / 〜の間で).

## 2. Per-engine rendering

One case each in the seven files listed under *Today*, plus D2's group scope at each
`coordinate(c.phrase, …)` call. German also needs `spatialCase`: `auf`, `zwischen` and `an` are all
two-way prepositions, so all three follow the existing rule — dative for a locative, accusative
under a `direction` — and none needs a new branch.

English's `GOAL_PREP` needs no override for any of the three: *onto* is a real word, but `on` under
a direction already reads as the goal ("jumps on the table"), and the map only overrides where the
two readings take different words.

## 3. Frontend and console

The toolbars read `PATH_SPECIFIERS`, so the three appear automatically in
[`Boxes.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx) and
[`phraseCommands.ts`](../../../../packages/frontend/src/components/PhraseBuilder/functions/phraseCommands.ts),
and the console's `{ id: "specifier" }` command
([`commands.ts:41`](../../../../packages/frontend/src/console/language/commands.ts#L41)) widens with
the type. **Ten relations on one toolbar is a layout question** — the locative row is already seven
wide — and the rule for it is the feedback the canvas work has settled on: widen the container,
do not hide controls.

## 4. Tests

- `test/complements/locative.test.ts` and `route.test.ts`: the existing
  `test.each(PATH_SPECIFIERS)` picks the three up for free. Add the full 7-language row for each,
  plus determiner cases (it *sul* / *su una*, pt *sobre a* / *sobre uma*, de *auf dem* / *auf einem*).
- A `between` test with a two-conjunct group in every language — the D2 regression, and the only
  new test shape in this task.
- Colocated `*/spatialHead.test.ts` rows for it/fr/es/pt/de, and
  [`de/spatialCase.test.ts`](../../../../packages/engine/src/languages/de/spatialCase.test.ts):
  all three dative under a locative, accusative under a direction.
- Two deliberate-collision tests with comments: ja `on` = ja `over`, ja `against` = plain に.
- Frontend: the locative toolbar offers ten relations; the console sets each.

## Verification

1. `npm run build -w @signi/shared && npm run build -w @signi/engine` — the backend runs the built
   dists, not `src`.
2. Engine, frontend and backend suites green; workspace typecheck clean. The widened union makes
   the compiler list every `Record<PathSpecifier, …>` and switch that needs a case.
3. `POST /api/translate` with a locative `{ kind: 'path', value: 'on' | 'between' | 'against' }`,
   and `between` over a two-conjunct group, checked against the table above.
4. In the browser (5173): the locative toolbar shows ten relations without overlapping the corner
   buttons, and the route toolbar shows the same set.

## Out of scope (follow-ups)

- **`onto` as a distinct goal.** English has it; the others use the same preposition the locative
  does. Revisit if `GOAL_PREP` ever grows a second override.
- **The adversarial *against*** (D3). It is a complement, not a relation —
  [E2](P09-E2-complement-types.md) if anywhere.
- **Combined relations** ("far behind the house"), already A02's own follow-up.
- **`between` as a temporal relation** ("between this day and that day"). The
  [`TemporalRelation`](../../../../packages/shared/src/index.ts#L366) set C29 built has `until` but
  no span with two ends; it would want the same group scope D2 builds here.
