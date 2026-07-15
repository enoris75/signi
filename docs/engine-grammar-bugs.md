# Signi translation engine — grammar defects

A work brief. Every item below was found by running the engine against the real seeded corpus
and reviewing its output for linguistic correctness. Each one is already pinned by a test.

## Orientation

- The engine is `packages/engine/src/`. One module per language: `languages/{en,it,fr,es,pt,de,ja}.ts`.
  Shared plumbing is `translator.ts` (resolves a `PhrasePlan` into per-language `ConceptForms`)
  and `mood.ts`. The plan model is typed in `packages/shared/src/index.ts`.
- Tests are `packages/engine/test/`, run with **`npm run test:unit`** (~300ms, no server needed —
  the harness seeds an in-memory SQLite from the real corpus and calls the production lexicon).
- **`npm run typecheck` before you trust a test.** Vitest does not typecheck. A plan built with an
  invalid literal (e.g. a `Degree` of `'comparative'`, which does not exist — the values are
  `positive | more | most | less | least | equally`) will run happily and take a fallback path,
  making a working feature look broken.

## How the defects are encoded

Each is a `test.fails` asserting the **correct** output. The suite is green today; when you fix
one, Vitest reports *"expected to fail but passed"* — that is your signal to **delete the
`.fails` marker**, converting it into an ordinary passing test. Do not delete the test.

They live in `describe` blocks named either:

- **`known bugs: …`** — genuine defects. Fix these. → **Part A**.
- **`documented simplifications: …`** — the engine does this **on purpose**, and says so in a code
  comment. **Do not "fix" these without a product decision.** → **Part B**. They are recorded only
  so the correct target is written down.

**This file is kept in sync with the tests: every `test.fails` in `packages/engine/test/` appears
below (76 of them, as of this writing).** If you add or move a `test.fails`, update the matching
entry here. Classification (A vs B) follows the `describe` block name, not the code comment.

---

# Part A — Confirmed bugs

## Japanese

### A1. Relative clauses use the polite form instead of the plain form

The engine's own comment in `ja.ts` (~line 104) states the rule and points at a helper that
**was never written**:

> The clause verb takes the *plain* form (食べた猫 "the cat that ate…"), not the polite ます/ました
> of a main clause — Japanese requires plain form on a prenominal predicate (see `plainVerbSeg`).

There is no `plainVerbSeg` in the file. The relative path calls `predicateSegs` (~line 448), the
polite main-clause renderer.

| | |
|---|---|
| **Now** | `食べます猫は走ります。` / past: `犬は食べました猫を見ます。` |
| **Want** | `食べる猫は走ります。` / past: `犬は食べた猫を見ます。` |
| **Where** | `ja.ts`, `relSegs` (~104-114) |
| **Fix** | Write `plainVerbSeg`: the dictionary form for non-past, the plain past (た-form) for past, and the plain negative (ない / なかった) — then use it for the relative clause's predicate instead of `predicateSegs`. The te-form machinery already there gives you the た-form stem. |
| **Test** | `relative.test.ts` → *known bugs: relative clauses* (2 tests) |

Ungrammatical in **every** relative clause the app renders — the highest-frequency defect in the list.

### A10. Attributive/predicative degree: `least` renders as `最も` (= *most*), `less` misuses `あまり`

`least` comes out as `最も` — which is **most** — so "the least big cat" and "the most big cat" are
byte-identical, inverting the meaning. `less` reuses `あまり`, a **negative-polarity** adverb that
is ungrammatical without a negated predicate (`あまり大きい` ✗; `あまり大きくない` ✓).

| | |
|---|---|
| **Want** | `least` ≠ `most`; a lowered superlative wants `最も〜ない` / `一番〜ない`. `less` must not emit `あまり` with an affirmative adjective. |
| **Test** | `adjectives.test.ts` → *known bugs: degree (extended)* (2); `complements/predicative.test.ts` → *known bugs: predicative degree* (2) |

### A11. Modal chains stack suffixes into non-words (`できたい`, `たいこと`)

Japanese modality is suffixal, so a **chain** has to nest suffixes; the engine glues them naively.
`WILL`+`CAN` → `できたい` (`たい` is an i-adjective and cannot suffix `できる`); `CAN`+`WILL` →
`食べたいことができます`.

| | |
|---|---|
| **Want** | Asserted negatively (idiomatic form, e.g. `食べられるようになりたい`, is a design call): the output must not contain `できたい` / `たいこと`. |
| **Test** | `modals.test.ts` → *known bugs: modals* (2 tests) |

### A12. Prospective aspect drops its negation

`食べるところです` renders for **both** polarities, so "the cat is **not** about to eat" comes out as
"the cat **is** about to eat". The other two aspects negate correctly (`食べていません`,
`食べてしまいません`), which is what makes this an oversight, not a gap in the inventory.

| | |
|---|---|
| **Want** | `prospective + negative` ≠ `prospective`. |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |

### A13. The 1st-plural hortative negation is dropped

Japanese negates the 2nd-person command (`食べるな`) but silently drops the negation on the
1st-plural hortative: "let's not eat" → `食べましょう`, which is "let's **eat**", the exact opposite.

| | |
|---|---|
| **Want** | Not the affirmative `食べましょう。` (`〜のはやめましょう` / `食べないでおきましょう` — surface is a design call). |
| **Test** | `imperative.test.ts` → *known bugs: imperative* (1 test) |

### A14. BROWN attaches with no linker (`茶色猫`)

`茶色` is a noun ("brown[ness]"), so attributively it needs `の` — `茶色の猫` — like the other
noun-adjectives (`男性の`, `定冠詞の`). It is the one adjective of 47 that comes out bare.

| | |
|---|---|
| **Now / Want** | `茶色猫` → `茶色の猫` (`茶色い猫`, the i-adjective form, would also do). |
| **Test** | `adjectives.test.ts` → *known bugs: adjective linker (Japanese)* (1 test) |

### A15. Katakana nouns get hiragana furigana

The ruby-suppression rule is `reading === surface → no ruby`, but it compares literally, and a
katakana word's seeded reading is written in **hiragana**. `ネズミ` and its reading `ねずみ` are the
same word, so the comparison fails and the engine furiganas katakana with hiragana — `ネズミ[ねずみ]`.
Japanese never furiganas katakana.

| | |
|---|---|
| **Want** | No reading for `MOUSE` (ネズミ), `NODE` (ノード), `PHRASE` (フレーズ), `SLOT` (スロット), `SLOT_MACHINE` (スロットマシン). |
| **Fix** | Compare kana-insensitively in the engine so it holds however the corpus is seeded. |
| **Test** | `furigana.test.ts` → *known bugs: furigana* (5 tests) |

## German

### A2-A4. Comparison: no umlaut, no suppletives, no superlative epenthesis

`de.ts` (~lines 4-25) forms the comparative by appending `-er` and the superlative `-st`, with no
stem mutation and no irregular table.

| | Now | Want |
|---|---|---|
| A2 comparative umlaut | `der großere Kater` | `der größere Kater` |
| A3 superlative umlaut | `der großste Kater` | `der größte Kater` |
| A4 suppletive | `der gutere Kater` | `der bessere Kater` |
| A4b superlative epenthesis | `der interessantste Kater` | `der interessanteste Kater` (and `schlechtste` → `schlechteste`) |

The **lowered** degrees (`weniger gut`, `am wenigsten`, `gleich`) are already correct — only the
raised comparative/superlative touch the buggy machinery.

**Fix.** Three rules:

1. **Suppletives** (table, like `EN_IRREGULAR` in `en.ts`): `gut → besser / best`,
   `viel → mehr / meist`, `hoch → höher / höchst`, `nah → näher / nächst`.
2. **Umlaut on mutation.** Most monosyllabic adjectives umlaut: `alt → älter`, `jung → jünger`,
   `groß → größer`, `lang`, `stark`, `warm`, `kalt`, `hart`, `scharf`, `schwach`.
   **Many do not** — `bunt`, `klar`, `voll`, `froh`, `rasch`, `flach`, `stolz`, `wahr`. This is
   lexical, not derivable: it needs an explicit umlauting set (or a per-lexeme seed flag), not a
   blanket vowel rule. A blanket rule will break `klarer → *klärer`.
3. **Superlative epenthesis:** `-est` after a stem ending in `-d`, `-t`, `-s`, `-ß`, `-z`, `-sch`
   (`kalt → kältest`, `heiß → heißest`, `interessant → interessantest`). `groß → größt` is itself
   irregular (no `e`), so it belongs in the suppletive table.

Prefer seeding the umlaut/irregular data on the adjective lexeme over hardcoding a list in the
engine — the corpus is the natural home for a lexical fact.

**Test:** `adjectives.test.ts` → *known bugs: degree* (A2-A4, 3 tests) and *known bugs: degree
(extended)* (A4b epenthesis, 1 test).

### A8. Weak masculine (n-declension) nouns are not declined

`Junge` takes `-n` in every case but the nominative singular. It is a property of the **noun**, so
every complement that puts `Junge` in an oblique case hits it. The plural happens to be `Jungen`
anyway, so plural cases pass **by coincidence** — that is not evidence the declension works.

| | Now | Want |
|---|---|---|
| direction | `der Kater geht zum Junge.` | `zum Jungen` |
| locative | `der Kater läuft im Junge.` | `im Jungen` |
| source | `der Kater kommt aus dem Junge.` | `aus dem Jungen` |

| | |
|---|---|
| **Fix** | Needs a weak-noun class marked in the corpus (`Junge`, `Herr`, `Mensch`, `Nachbar`, `Student`, `Kunde`…), then applied in `de.ts` wherever a non-nominative noun surface is emitted. A lexical fact belongs in the seed. |
| **Test** | `complements/direction.test.ts`, `complements/locative.test.ts`, `complements/source.test.ts` → *known bugs* (1 each) |

### A16. Inanimate terminus is marked with a bare dative

German dativises an inanimate terminus exactly as it dativises a person, so "save the book to the
container" → `der Kater speichert dem Behälter das Buch` — which reads as *giving the book to the
container*, as though it were a recipient. A goal wants a preposition, not a bare dative.

| | |
|---|---|
| **Want** | Asserted negatively (which preposition — `in` / `an` / `zu` — is verb-dependent, a design call): not `der Kater speichert dem Behälter das Buch.` The other six languages are unaffected — their dative preposition doubles as a goal marker. |
| **Test** | `complements/terminus.test.ts` → *known bugs: terminus* (1 test) |

### A17. Relative clause has no closing comma

A German relative clause is set off by commas at **both** ends; the engine only opens one. `de.ts`
calls it "a known first-cut simplification" — but the test files it as a `known bugs` block, so it
is Part A.

| | |
|---|---|
| **Now / Want** | `der Kater, der isst läuft.` → `der Kater, der isst, läuft.` |
| **Test** | `relative.test.ts` → *known bugs: relative clauses* (1 test) |

### A18. Aspect is dropped inside a relative clause

Everything else survives in a relative clause — the tense (`der aß`, `der essen wird`), the negation
(`der nicht isst`), a modal (`der essen kann`) — but an **aspect** is silently discarded and the
clause falls back to a bare present. The matrix clause renders the same aspect perfectly
(`hat die Maus gesehen`), so the machinery exists; it is simply not reached from the relative path.
It **compounds with depth**: a three-level nest loses an aspect at every level.

| | Now | Want |
|---|---|---|
| resultative | `der Kater, der isst sieht die Maus.` | `der Kater, der gegessen hat, sieht die Maus.` |
| progressive | `…der isst…` | `…der gerade isst…` |
| past + resultative | collapses to simple past | `der Kater, der gegessen hatte, …` (pluperfect) |

| | |
|---|---|
| **Test** | `relative.test.ts` → *known bugs: relative clauses (aspect)* (3) and *known bugs: nested relative clauses* (1) |

### A19. Prospective aspect negates the wrong verb

The negation lands inside the periphrasis instead of on the finite auxiliary.

| | |
|---|---|
| **Now / Want** | `der Kater ist im Begriff nicht zu essen.` (= is about to **not** eat) → `der Kater ist nicht im Begriff zu essen.` (= is **not** about to eat) |
| **Where** | negation belongs on the finite `ist`, as with the other aspects (`hat nicht gegessen`, `isst gerade nicht`) |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |

### A20. A modifier's adjective is hoisted onto the head noun (meaning change)

An adjective belonging to the attributive noun is lifted out onto the head: `der semantische alte
Phraseschöpfer` says the **creator** is semantic, when the plan says the **phrases** are. A German
compound cannot take an internal adjective, so the compound must be abandoned when the modifier
carries one — the genitive does it. Compare Italian, which is correct: `il vecchio creatore di
frasi semantiche`.

| | |
|---|---|
| **Now / Want** | `der semantische alte Phraseschöpfer …` → `der alte Schöpfer semantischer Phrasen brennt.` |
| **Test** | `adjectives.test.ts` → *known bugs: adjectives* (1 test) |

## English

### A7. Relativises on animacy, but English relativises on *personhood*

`en.ts` line 503: `const pronoun = np.head.forms['animate'] === '1' ? 'who' : 'that';`
Cats and mice are seeded `animate`, so they get `who`.

| | |
|---|---|
| **Now / Want** | `the mouse who the cat eats runs.` → `the mouse that the cat eats runs.` |
| **Fix** | Animacy is the wrong feature — `who` requires a **person**. This needs a `human`/`person` flag on the concept (a `semantic_concepts` column + seed data + `lexicon.ts` passthrough, following exactly how `animate` is threaded), with `en.ts` keying off it. Cheap interim: always use `that` (correct for persons too, just less natural). In **object** position even a person prefers `that`/`whom`. |
| **Test** | `relative.test.ts` → *known bugs: relative clauses* (1 test) |

Requires a schema/seed change.

### A21. Group genitive: `'s` on a clause-carrying possessor lands on the wrong word

The Saxon `'s` is a **clitic** — it attaches to the end of the whole possessor phrase, not to its
head — so with a relative clause in the way it lands on the clause's last word. English resolves
this by switching to the of-genitive whenever the possessor is post-modified (the group-genitive
constraint); the engine never switches.

| | Now | Want |
|---|---|---|
| clause ends in noun | `the cat who eats the mouse's book` (the mouse now owns the book) | `the book of the cat that eats the mouse` |
| clause ends in verb | `…the cat eats's book` (not English at all) | of-genitive; must never emit `eats's` |
| plural possessor | `the big cats who eat the mouse' book` (apostrophe on a singular noun) | of-genitive; must not emit `mouse'` |

| | |
|---|---|
| **Test** | `possession.test.ts` → *known bugs: possessor* (3 tests) |

### A22. Frequency adverb placed before the modal / future auxiliary, not after

An English frequency adverb goes **after** the first auxiliary. The engine has the rule and applies
it for the perfect (`has always eaten` ✓) but does not treat a modal or the future auxiliary as an
auxiliary for this purpose. Manner adverbs (`eat fast`) are unaffected, being post-verbal.

| | Now | Want |
|---|---|---|
| modal | `the cat always must eat.` | `the cat must always eat.` |
| modal + NEVER | `the cat never must eat.` | `the cat must never eat.` |
| future | `the cat always will eat.` | `the cat will always eat.` |

| | |
|---|---|
| **Test** | `modals.test.ts` → *known bugs: modals* (3 tests) |

### A23. `MUST` + negative flips scope between present and past, and across languages

Negating `MUST` gives opposite scopes for the same plan — nothing in the plan chose between them
(`negative` is a bare flag). Present is the odd one out; past, German and Japanese all take the
`¬must` (no-obligation) reading.

| | |
|---|---|
| **Now** | present `the cat must not eat.` (prohibition, `must ¬eat`) vs past `the cat did not have to eat.` (`¬must eat`) |
| **Want** | consistent: `the cat does not have to eat.` |
| **Cross-language** | same plan is a prohibition in English (`must not eat`) but permission-to-abstain in German (`muss nicht essen`). Fixing needs a decision about what `negative` scopes over, not a lexeme change. |
| **Test** | `modals.test.ts` → *known bugs: modals* (2 tests) |

### A24. No elision before a silent *h* (`le homme`)

French elides before a vowel (`l'ange`) but the engine tests the first **letter**, not the first
**sound**, so it misses *h muet*: `homme` begins with one and should elide. The miss propagates into
every contraction built on the article.

| | Now | Want |
|---|---|---|
| article | `le homme mange.` | `l'homme mange.` |
| contraction | `le livre du homme brûle.` | `le livre de l'homme brûle.` |

| | |
|---|---|
| **Fix** | The *h muet* / *h aspiré* split is lexical (`homme` elides, `héros` does not — `le héros`), so it belongs on the noun lexeme in the corpus. Italian gets the equivalent right (`l'uomo`), so this is French-specific. |
| **Test** | `nounPhrase.test.ts` → *known bugs: determiners* (2 tests) |

### A25. Superlative rendered under an indefinite article (`a biggest cat`)

English superlatives are inherently definite (`THE biggest`), so an indefinite article is
ungrammatical. The engine renders the inflected superlative regardless of the determiner.

| | |
|---|---|
| **Want** | not `a biggest cat eats.` — either force the definite article, or refuse the plan upstream. |
| **Test** | `adjectives.test.ts` → *known bugs: degree (extended)* (1 test) |

## French / Romance comparison

### A5. French has no suppletive comparative — `plus bon` is ungrammatical

`FR_DEGREE` (`fr.ts` ~line 9) prefixes `plus`/`moins` unconditionally.

| | |
|---|---|
| **Now / Want** | `le chat plus bon mange.` → `le chat meilleur mange.` |
| **Fix** | Suppletive table: `bon → meilleur`, `mauvais → pire`, `petit → moindre` (figurative). `meilleur` is **prenominal** (`un meilleur chat`), unlike periphrastic `plus grand`, so position logic keys off the resulting form, not the base adjective. |
| **Test** | `adjectives.test.ts` → *known bugs: degree* (1 test) |

### A6. Portuguese has no suppletive comparative

`PT_DEGREE` (`pt.ts` ~line 9) likewise prefixes `mais`/`menos` unconditionally.

| | |
|---|---|
| **Now / Want** | `o gato mais grande come.` → `o gato maior come.` |
| **Fix** | `grande → maior`, `bom → melhor`, `pequeno → menor`, `mau → pior`. |
| **Test** | `adjectives.test.ts` → *known bugs: degree* (1 test) |

*Deliberately not filed for Italian and Spanish:* `più buono` and `más bueno` are attested and
acceptable alongside `migliore`/`mejor`. A nice-to-have, not a bug.

### A26. Predicative superlative has no article — collapses onto the comparative

The **attributive** superlative homophony (`il gatto più grande` = bigger/biggest) is legitimate:
the noun's definite article does the work. A **predicative** adjective has no article to borrow, so
the superlative must supply its own. Without it, "most" simply says "more". German (`am
glücklichsten` vs `glücklicher`) and English prove the distinction is real.

| | Now | Want |
|---|---|---|
| Italian | `il gatto sembra più felice.` (= more) | `il gatto sembra il più felice.` |
| French | `le chat semble plus heureux.` | `le chat semble le plus heureux.` |
| Spanish | `el gato parece más feliz.` | `el gato parece el más feliz.` |
| least | (= less) | `il gatto sembra il meno felice.` |

Plus a guard: Romance `most` must not be word-for-word identical to `more`.

| | |
|---|---|
| **Test** | `complements/predicative.test.ts` → *known bugs: predicative degree* (5 tests) |

## Romance / Iberian coordination

### A27. Adjective lists repeat the conjunction instead of comma-separating

Three or more coordinated adjectives repeat the conjunction (`grande y viejo y hermoso`) where the
list should be comma-separated with the coordinator only before the last. The engine already does
this correctly for coordinated **nouns** (`el gato, el perro y el ratón`), so the rule exists — it
is simply not applied to the adjective list. Romance-wide: prenominal adjectives juxtapose in
Italian/French and hide it, but a **postnominal** triple exposes it there too.

| | Now | Want |
|---|---|---|
| Spanish (pre) | `el gato grande y viejo y hermoso come.` | `el gato grande, viejo y hermoso come.` |
| Portuguese (pre) | `o gato grande e velho e belo come.` | `o gato grande, velho e belo come.` |
| Italian (post) | `il gatto forte e felice e freddo mangia.` | `il gatto forte, felice e freddo mangia.` |
| French (post) | `le chat fort et heureux et froid mange.` | `le chat fort, heureux et froid mange.` |
| Spanish (post) | `el gato fuerte y feliz y frío come.` | `el gato fuerte, feliz y frío come.` |

| | |
|---|---|
| **Test** | `adjectives.test.ts` → *known bugs: adjectives* (2) and *known bugs: Romance postnominal coordination* (3) |

### A28. Frequency adverb placed after the participle, not between auxiliary and participle (Italian)

Italian puts a frequency adverb **between** the auxiliary and the past participle. The engine
appends it to the whole group. A **manner** adverb genuinely does follow the participle (`ha
mangiato bene` ✓), so the two classes need telling apart — exactly the English case in A22. French
and German place them properly.

| | Now | Want |
|---|---|---|
| always | `il gatto ha mangiato sempre.` | `il gatto ha sempre mangiato.` |
| never (concord `mai`) | `il gatto non ha mangiato mai.` | `il gatto non ha mai mangiato.` |

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: adverb placement* (2 tests) |

### A29. Locative proper noun keeps its article after the preposition (Italian, French)

A proper noun keeps the article its language fixes for it — correct as a **subject** (`l'Europa
mangia`) — but Italian and French drop that article after a locative preposition. The engine applies
the proper-noun article rule uniformly, so the fixed article survives into a position that forbids
it. Spanish, German, and Portuguese (which genuinely keeps `na Europa`) are all right.

| | Now | Want |
|---|---|---|
| Italian | `il gatto corre nell'Europa.` | `il gatto corre in Europa.` |
| French | `le chat court dans l'Europe.` | `le chat court en Europe.` |

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: locative* (2 tests) |

### A30. Pronominal verb loses its clitic in the compound past

A pronominal (reflexive) verb keeps its clitic in the simple present but **loses** it in the
compound past. The clitic must move to before the auxiliary, not vanish. The Spanish case even
changes meaning — `ha vuelto` without the reflexive is "has **returned**" (volver), not "has
become" (volverse). The auxiliary and the agreement are right; only the reflexive pronoun is dropped.

| | Now | Want |
|---|---|---|
| French (COLLAPSE) | `la chatte est effondrée.` | `la chatte s'est effondrée.` |
| Spanish (BECOME) | `la gata ha vuelto.` | `la gata se ha vuelto.` |

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: reflexive verbs in the compound tense* (2 tests) |

### A31. Directional continent goal: wrong preposition, and the article is kept (Italian, French)

The `direction` goal of a motion picks its adposition by the goal's animacy (`a`/`à` a place,
`da`/`vers` a person — see A29's sibling for the locative). A **continent** needs a third choice:
Italian and French use *in* / *en*, and with **no** article — `va in Antartide`, `va en
Antarctique`. The engine applies the default inanimate-goal adposition *and* keeps the proper
noun's fixed article (correct only as a subject, `l'Antartide è fredda`), so it emits `va
all'Antartide` / `va à l'Antarctique`. This is A29's article defect (there for the *locative*)
**plus** a preposition-selection error unique to the goal. Spanish and Portuguese genuinely keep
the article (`a la Antártida`, `à Antártida`) and are right; German `zur Antarktis` is acceptable.
The fix needs continent-awareness in the two engines — `ANTARCTICA isA CONTINENT`, which the goal
preposition can key off.

| | Now | Want |
|---|---|---|
| Italian | `il gatto va all'Antartide.` | `il gatto va in Antartide.` |
| French | `le chat va à l'Antarctique.` | `le chat va en Antarctique.` |

| | |
|---|---|
| **Test** | `complements/direction.test.ts` → *known bugs: direction* (1 test) |

## Portuguese

### A9. Resultative is iterative, not perfective

`tem comido` means "has been eating (repeatedly)". The perfect of a bounded event is the
pretérito perfeito.

| | |
|---|---|
| **Now / Want** | `o gato tem comido.` → `o gato comeu.` |
| **Where** | `pt.ts` ~line 238 (`ter` as the resultative auxiliary) |
| **Fix** | Portuguese has no present-perfect equivalent of `ha comido`. Map present resultative onto the pretérito perfeito. **Careful:** the *past* resultative (`o gato tinha comido`, pluperfect) is already correct — only the present is wrong. |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |

---

# Part B — Documented simplifications. Do NOT fix without a product decision.

Each of these is deliberate and explained in a code comment, and pinned by a `test.fails` in a
`documented simplifications:` block. Listed so you don't "fix" them by accident, and so the correct
target is on record if the trade-off is revisited.

| # | Behaviour | Correct target / rationale | Test |
|---|---|---|---|
| B1 | Romance `source` renders an ablative adverb: `viene **via** dalla casa`, `vient **loin** de`, `viene **lejos** de`, `vem **longe** de` — "comes **far** from" | Disambiguates `source` from `direction`, which collide on `da`/`de` (`corro dal bambino` = motion **to**). Cost: with COME, where `da`/`de` is already unambiguous, it reads "far from". A per-verb condition would keep the RUN/JUMP reading and fix the rest. | `complements/source.test.ts` (4) |
| B1b | The same adverb **inverts** the meaning of non-motion verbs: `il gatto carica il libro **dal** contenitore` should keep the origin reading, not "loads far from" | LOAD / IMPORT are not motion-away verbs — their `source` is an origin, not a departure. | `complements/source.test.ts` (1) |
| B2 | English and German drop the **negative** cause sentiment, collapsing it onto the neutral connector (`because of` / `wegen`) | `en.ts`: English "has no distinct neutral/negative connector". `de.ts`: the `durch … Schuld` periphrasis is not built. The other five languages **do** distinguish it, so the user's stance is silently lost in two of seven. Correct targets: `through the fault of the dog` / `durch die Schuld des Hundes`. | `complements/cause.test.ts` (2) |
| B3 | German conditionals: no verb-final protasis, no inverted apodosis — `wenn der Kater würde essen, der Hund würde laufen.` | Should be `wenn der Kater essen würde, würde der Hund laufen.` A subordinate `wenn` clause is verb-final, and a main clause following a fronted subordinate inverts. `de.ts`: "a documented approximation." | `condition.test.ts` (1) |
| B4 | French relative superlative omits the second article: `le chat plus grand` | Should be `le chat le plus grand`. `fr.ts`: "the second article is an MVP approximation we skip". | `adjectives.test.ts` → *documented simplifications: degree* (1) |
| B5 | Japanese resultative is `〜てしまいます` (completive, **non-past**) where the other six render a present perfect | `ja.ts`: resultative is mapped to completion aspect. Defensible, but the same plan then *means* different things across languages. | `verb.test.ts` → *documented simplifications: aspect* (1) |
| B6 | German means clause uses impersonal `man`: `schneidet, indem **man** den Stock wählt` ("by **one** choosing") | The instrument is wielded by the clause's own subject: `indem **er** den Stock wählt`. German needs an overt subject (can't drop it like a gerund), and `de.ts` fills it with `man`. Quietly generalises an action the other six attribute to the cat. | `complements/instrumental.test.ts` (1) |
| B7 | Japanese drops `aspect` under a modal: `猫は食べる必要があります` renders identically whatever the aspect | `ja.ts`: "Known gap: `aspect` is dropped under a modal. Stacking `〜ています` inside `〜必要がある` is not built." The other six compose the two ("must have eaten"). | `modals.test.ts` → *documented simplifications: modals* (1) |
| B8 | A **marked aspect** on a conditional's clause drops the mood in the four Romance engines: the periphrastic auxiliary (`stare`/`estar`/`être`) is conjugated in the plain **present indicative**, not the conditional/subjunctive — `se il gatto mangiasse, il cane **sta** correndo` | `it.ts` ~line 605: "the marked aspects keep their indicative auxiliary (aspect under a conditional is a documented gap)". Only the **neutral** aspect takes the mood (`il cane correrebbe` ✓). Correct target is the 3sg conditional of the auxiliary + the same non-finite form: `starebbe correndo` / `estaría corriendo` / `serait en train de courir` / `estaria correndo`. Under a plain (non-`dovere`) counterfactual this is not an approximation but ungrammatical — only a conditional apodosis is licensed. | `hypothetical.test.ts` → *documented simplifications: aspect drops the conditional mood* (1) |

**Not pinned by a test** (recorded for completeness, no `test.fails`): German governs the
**genitive** in standard usage (`wegen des Hundes`, `das Buch des Katers`), but `de.ts` emits the
colloquial dative/`von` (`wegen dem Hund`, `das Buch vom Kater`) and acknowledges this for `wegen`.

---

# Part C — Looks wrong, is right. Do not "fix".

Verified correct; listed because they are the things a reviewer flags on a first pass.

- **Italian/Spanish superlative is identical to the comparative** (`il gatto più grande` =
  both "the bigger cat" and "the biggest cat"). Romance relative superlatives genuinely are
  homophonous once the noun carries a definite article. Correct. (Contrast the **predicative** case,
  A26, where the homophony is a genuine bug — no article to borrow.)
- **Italian instructions stay imperative** (`mangia`, not `mangiare`) — Signi's own UI labels are
  Italian imperatives (`Salva`, `Carica`). Deliberate; see `it.ts` ~line 635.
- **Japanese instructions render the verbal noun** (`食べ`, like `保存` / `読み込み`) — that is what
  Japanese labels a button with. Deliberate; see `jaImperativeSegs` in `ja.ts`.
- **Japanese future is identical to the present** — Japanese has no future tense; the non-past
  covers both.
- **German has no progressive** — `der Kater isst gerade` (adverb) is the right rendering.
- **Romance simple past is the perfective** (`mangiò`, `mangea`), not the periphrastic perfect —
  a deliberate mapping; the perfect is `aspect: 'resultative'`.
- **German neuter on a noun head, and `gender:'neut'`, are no-ops** — `neut` is meaningful only for
  a pronoun head ("it"); on a noun the head keeps its own lexeme. Pinned by passing tests in
  `subject.test.ts`.

---

# Suggested order

1. **A1 (Japanese plain form)** — highest frequency, unambiguous, self-contained, intent already
   written down.
2. **Comparison** — A5, A6 (Romance suppletives), A26 (predicative superlative article), A2-A4
   (German umlaut/suppletive/epenthesis, the fiddliest — do it last). A10, A25 ride along.
3. **Coordination & adverb placement** — A27 (reuse the noun-list comma rule), A22/A28 (frequency
   adverb: same fix shape in English and Italian).
   - **Romance proper-noun adposition** — A29 (locative) and A31 (directional continent) share a
     root: the proper-noun article rule fires in a position that forbids it. A31 also needs a
     continent-keyed preposition. Do them together in `it.ts` / `fr.ts`.
4. **A9 (Portuguese resultative)** — one-line mapping, but check the pluperfect still passes.
5. **German case/clause cleanups** — A17 (closing comma), A18 (relative-clause aspect), A16, A19,
   A20.
6. **A7, A8, A21** — leave for last: A7 and A8 need a new lexical feature in the corpus (`human`,
   weak-noun class), i.e. a schema + seed + lexicon change, not just an engine edit; A21 needs the
   group-genitive switch.

After each fix: `npm run typecheck && npm run test:unit`, then delete the `.fails` on the test that
now passes. Do not weaken an assertion to make it pass.
