# B9. German governs the genitive in standard usage, but the German engine emits the colloquial dative/`von`

**Documented simplification — NOT pinned by a test** (recorded for completeness, no `test.fails`).

German governs the **genitive** in standard usage (`wegen des Hundes`, `das Buch des Katers`), but
the German engine (`languages/de/`) emits the colloquial dative/`von` (`wegen dem Hund`, `das Buch vom Kater`) and acknowledges
this for `wegen`.

## Resolved

Fixed on 2026-09-21, on the user's product decision to target standard written German.

**The possessor.** [`possessorText`](../../../packages/engine/src/languages/de/possessorText.ts)
renders a noun possessor as a postnominal genitive through `nounPhrase(poss, 'gen')`: its own
determiner or possessive and its adjectives declined for the genitive, the noun with its genitive
ending, then its own nested possessor and relative clause (`das Buch des Katers`, `der Katze`, `des
Jungen`, `eines Hundes`, `keines Katers`, `meines Hundes`, `des großen Hundes`, `einiger Kater`,
`kleiner Katzen`, `die Bücher der Katzen`, `das Buch des Vaters des Katers`).
A new [`genitiveShows`](../../../packages/engine/src/languages/de/genitiveShows.ts) decides where
German itself takes `von` + the dative instead, because the genitive would not show: no inflected
determiner and no adjective (`das Buch von Katzen`, `von Männern`, `von Wasser`), an invariant mass
quantifier (`von etwas Wasser`), or a name whose genitive is unmarked (`von Paris`, `von Englisch`).

**The noun's ending.** [`genitiveS`](../../../packages/engine/src/languages/de/genitiveS.ts) is now
the one genitive-noun rule, used by `nounPhrase`, `modifierGenitives` and the complements. On top of
the old monosyllable/sibilant split it takes: a genitive the lexicon records (`forms.genitive`); a
weak masculine's -(e)n; a bare name's -s whatever its gender, and none after a sibilant; `-nis` →
`-nisses`; `-sch` → `-sches`; -s after a vowel; and a diphthong counted as one vowel sound (`des
Feuers`, not `Feueres`). Seeded in [`nouns.ts`](../../../packages/backend/src/concepts/nouns.ts):
`Name` → `Namens`; the seven language names and the Latin terms `Agens`, `Numerus`, `Tempus`,
`Präsens` with an unmarked genitive; the loanword `Slot` → `Slots`; `Verb` → `Verbs`; and `weak` on
`Spielautomat` (`des Spielautomaten`, also `den` / `dem Spielautomaten`), which is a weak noun and was
unmarked.

**Decision: a bare-name place.** The postnominal genitive, `das Buch Asiens`, `das Buch Europas`, not
`von Asien`: a place name's genitive -s is standard written German ("die Geschichte Europas"). The
same holds after `wegen` (`wegen Europas`). A possessor that A169 articles takes the article in the
genitive, `des großen Asiens`; A169's possessor pin changed from `vom großen Asien` to match.

**`wegen`.** The cause in
[`complementsPhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/complementsPhrase.ts)
takes the genitive (`wegen des Hundes`, `wegen eines großen Hundes`, `wegen meines Hundes`, `wegen
der Hunde`), and the dative only where `genitiveShows` says the genitive would not show (`wegen
Männern`). A relative clause on the cause takes the genitive relative pronoun (`der Hund, wegen dessen
der Kater läuft`). A personal pronoun is one word in
[`causePhrase.ts`](../../../packages/engine/src/languages/de/complementsPhrase/causePhrase.ts):
`meinetwegen`, `deinetwegen`, `seinetwegen`, `ihretwegen`, `unseretwegen`, `euretwegen`, built from
the possessive stem. In a group, each pronoun brings its own `-wegen` and each noun its own `wegen`
(`wegen des Mannes und deinetwegen`). The code comment that acknowledged the colloquial `wegen` is
replaced. `renderSpecifier` names `wegen` with the genitive too (no visible change).

**Other genitive prepositions.** Only `wegen` and `dank` reach the German engine. `dank` keeps the
dative (`dank dem Hund`, `dank dir`), which standard German allows beside the genitive for a
singular. `trotz`, `während`, `statt` and the rest are not emitted anywhere.

**Tests.** New pinning blocks: `possession.test.ts` → *documented simplifications fixed: German
genitive* (five tests), and `complements/cause.test.ts` → *documented simplifications fixed: German
"wegen" takes the genitive* (five tests). New colocated `genitiveShows.test.ts`; `genitiveS.test.ts`,
`possessorText.test.ts`, `nounPhrase.test.ts` and `causePhrase.test.ts` were extended or rewritten
for the genitive.

**Passing tests whose German expectation changed** (the decision, not a weakening): every `wegen dem
Hund` → `wegen des Hundes` in `complements/cause.test.ts`, `combined.test.ts`,
`combined-triples.test.ts`, `negation.test.ts:483` and `verb.test.ts:1709`; `wegen keinem Hund` →
`wegen keines Hundes` (`complements/determiner.test.ts:387`); `wegen meinem Hund` → `wegen meines
Hundes` and `das Buch von meinem Hund` → `das Buch meines Hundes` (`possessivePronoun.test.ts:157,
159`); `das Buch von unseren Hunden` → `das Buch unserer Hunde` (`possessivePronoun.test.ts:254`);
`wegen mir` → `meinetwegen`, and the coordinated-pronoun cases in `cause.test.ts` (A54's block);
`vom Kater` → `des Katers` (`possession.test.ts:95, 130`); A58's German block in
`possession.test.ts` (`von einem Kater` → `eines Katers`, `von einigen Katern` → `einiger Kater`, `von
Europa` → `Europas`, `von allen Katern` → `aller Kater`, `von kleinen Katern` → `kleiner Kater`, …,
with its titles reworded from "after von" to the genitive); `vom Jungen` → `des Jungen`
(`complements/direction.test.ts:390`, `pangram.test.ts:40, 163`); `von der Antarktis` → `der
Antarktis` (`direction.test.ts:516`); `mit der Geschwindigkeit vom Licht` → `des Lichtes`
(`complements/manner.test.ts:35, 92`); `von den adverbialen Bestimmungen der Herkunft` → `der …`
(`nounPhrase.test.ts:581`); `vom großen Asien` → `des großen Asiens` (A169's pin,
`adjectives.test.ts:1831`); and the German unit tests of `causePhrase`, `complementsPhrase`,
`renderClause`, `subordinateClause` (`wegen dem der Kater isst` → `wegen dessen`), `nounPhrase` and
`possessorText`.

**Outside the engine.** No frontend or backend test pinned a German possessor or `wegen`. The UI
string `modifier.adjective` renders `Adjektiv des Modifikators` (was `Adjektiv vom Modifikator`) once
the backend's engine dist is rebuilt; [B24](../../localization/done/B24-ui-noun-modifier-chips.md)
says so now. `e2e/complements.spec.ts` gained the German `dank` sentence it had left out for this
simplification (`der Kater läuft dank dem Hund.`, unchanged output, not run here).
