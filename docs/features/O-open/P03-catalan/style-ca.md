# Catalan (`ca`) — the style sheet and the column's shape

The conventions every `ca` string in the corpus (`packages/backend/src/concepts/ca/`) and the engine
(`packages/engine/src/languages/ca/`) follows. **Central Catalan in the IEC standard** (P03 D1): a
Valencian (*menge, este, meua*) or Balearic (*men, aquest* 1sg *cant*) form is a leak, not a variant.

Drafted 2026-09-28 by the implementer from model knowledge. **Not yet reviewed** — every form is
*(verify)* until the native review ([P03-E11](P03-E11-review.md)).

## Spelling

- **The IEC's current orthography** (the 2016 grammar, the 2017 diacritic reform): the diacritic
  accent survives only on the fifteen pairs that keep it — *bé, déu, és, mà, més, món, pèl, sé, sí, sòl,
  són, té, ús, vénen, véns* and their compounds. So *os, net, dona* (gives), *vens* (you sell), *pel*,
  *molt*, no accent.
- Grave on open *è, ò* and on *à*; acute on closed *é, ó* and on *í, ú*: *cafè, francès, anglès,
  japonès, portuguès, ratolí, català, cançó*.
- *l·l* with the middle dot (U+00B7): *col·legi, intel·ligent*. *ny, ix, tx, tj, ig*: *any, peix,
  cotxe, platja, maig*.
- **Language names are lowercase** (*català, anglès*); the UI capitalises them.
- The corpus **never stores an elided or contracted form**: *l', d', al, del, pel* are the engine's.

## The article (the engine's, for reference)

| | masc | fem |
|---|---|---|
| definite sg | **el** — **l'** before a vowel or *h* + vowel | **la** — **l'** before a vowel or *h* + vowel, except unstressed *i-, u-, hi-, hu-* |
| definite pl | **els** | **les** |
| indefinite | **un, uns** | **una, unes** |

Contractions: *a+el → al, a+els → als, de+el → del, de+els → dels, per+el → pel, per+els → pels*,
never before *l'*, *la* or *les*. *de → d'* before a vowel.

## The column's shape

`LanguageColumn` entries keyed by concept id, one file per role, merged by `concepts/ca/index.ts`. A
concept left out **borrows Spanish** (`columns.ts`), so a hole is a quality issue, not a crash — but
the target is **every concept, nothing borrowed**. **Mirror every non-word key of the Spanish entry**
(flags such as `subtype`, `polarity`, `negative_slot`, `takes_article`, `infinitive_link`,
`content_clause_mood`, `subject_sense`, `person`, `number`, …), translating the value where it is a
word; drop a key only when it is Spanish-specific and say why in a comment (`stressed_a`, the
*el agua* rule, has no Catalan counterpart).

### Nouns — `nouns.ts`

`base, plural, gender ('masc' | 'fem'), count: 'singular'`, plus `fem, fem_plural` on a person or
animal noun that has a feminine (*gat/gata/gats/gates*). A mass noun that Spanish gives no plural gets
none. Plurals follow the spelling: *-a → -es* (*casa, cases*; *-ca → -ques*, *-ga → -gues*, *-ça →
-ces*, *-ja → -ges*, *-gua → -gües*, *-qua → -qües*), stressed vowel *+ns* (*ratolí, ratolins*;
*cançó, cançons*), *-s/-ç/-x/-ix* sibilants *+os* (*peix, peixos*; *gas, gasos*), *-sc/-st/-xt/-ig*
double (*bosc, boscos / boscs*: take the **-os** form).

- `no_elision: '1'` on a **feminine** noun beginning with unstressed *i-, u-, hi-, hu-* (*la
  universitat, la història*): *la* stays whole. Never on a masculine noun.
- Language names: `takes_article: '1'` as Spanish (*el català*).

### Adjectives — `adjectives.ts`

Always all four: `base, fem, plural, fem_plural` (P03 D6) — *blanc, blanca, blancs, blanques*; *gran,
gran, grans, grans*; *feliç, feliç, feliços, feliços*; *boig, boja, bojos, boges*; *nou, nova, nous,
noves*. Mirror Spanish's other keys (`position`, …).

### Adverbs, pronouns, interjections

Mirror the Spanish entry's keys one for one: *mai* keeps `polarity: 'negative'`; the pronouns carry
`plural, plural_fem, disjunctive…, object…, dative…` in Catalan (*jo / nosaltres; mi; em / ens*),
the generic pronoun `base: 'es'` (*es menja*, P03 D5).

### Verbs — `verbs.ts`

Stored in full, so the engine never derives a Catalan form from a Spanish rule. For each person key
`1sg 2sg 3sg 1pl 2pl 3pl`:

| keys | Catalan (*menjar*) |
|---|---|
| `base` | *menjar* |
| `{p}_present` | *menjo, menges, menja, mengem, mengeu, mengen* |
| `{p}_imperfect` | *menjava, menjaves, menjava, menjàvem, menjàveu, menjaven* |
| `{p}_future` | *menjaré, menjaràs, menjarà, menjarem, menjareu, menjaran* |
| `{p}_conditional` | *menjaria, menjaries, menjaria, menjaríem, menjaríeu, menjarien* |
| `{p}_subjunctive` (present) | *mengi, mengis, mengi, mengem, mengeu, mengin* |
| `{p}_past_subjunctive` (imperfect) | *mengés, mengessis, mengés, mengéssim, mengéssiu, mengessin* |
| `gerund` | *menjant* |
| `participle`, `participle_fem`, `participle_plural`, `participle_fem_plural` | *menjat, menjada, menjats, menjades* |
| `2sg_imperative`, `1pl_imperative`, `2pl_imperative` | *menja, mengem, mengeu* |

- **No `{p}_past`**: the past is the periphrastic *va menjar* (P03 D2), built by the engine from
  *anar*'s auxiliary cells *vaig, vas, va, vam, vau, van*.
- Central forms: 1sg present *-o* (*menjo, bec, dic, faig*); inchoative *-ir* verbs with *-eix-*
  (*serveixo, serveixes, serveix, servim, serviu, serveixen*; subjunctive *serveixi*); imperfect
  subjunctive in *-és / -essis / -éssim* (not Valencian *-ara*, not *-essin/-éssem*).
- Irregular core, to get right first: *ser* (*sóc, ets, és, som, sou, són*; *era*; *seré*; *sigui*;
  *fos*; *sent*; *estat*; imperative *sigues, siguem, sigueu*), *estar* (*estic, estàs, està*), *haver*
  (*he, has, ha, hem, heu, han*; *hagi*; *hagués*), *anar* (*vaig, vas, va, anem, aneu, van*; *aniré*;
  *vagi*; *anés*; imperative *vés, anem, aneu*), *fer* (*faig, fas, fa, fem, feu, fan*; *faré*;
  *faci*; *fes*; *fet*; imperative *fes, fem, feu*), *venir, tenir, poder, voler, saber, dir, veure,
  beure, córrer, conèixer, viure, prendre, dur, treure, caure, escriure, obrir, morir, néixer*.
- Participles that break the *-at / -it / -ut* rule store their own four forms: *fet, feta, fets,
  fetes*; *dit*; *vist, vista, vistos, vistes*; *pres, presa, presos, preses*; *mort*; *obert*;
  *escrit*; *begut*; *conegut*; *estat*.
- **Pronominal verbs** store the infinitive with its enclitic in `base` and the proclitic in the
  finite cells, as Spanish stores its own (*tornar-se*; *em torno, et tornes, es torna, ens tornem, us
  torneu, es tornen*; *s'* before a vowel: *s'atura*); the participle, gerund and imperative cells stay
  bare (the engine attaches the clitic). Follow exactly what the Spanish entry of the same concept does
  — if Spanish stores it bare with a flag, store it bare with the same flag.
- Mirror the Spanish entry's non-word keys (`subject_sense`, `infinitive_link` with a Catalan value —
  *haver* **de**, *acabar* **de**, `content_clause_mood`, …).
