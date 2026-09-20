# C19. Verbs still without a gloss — BURN, SEEM, BECOME, TIDY_UP, SAVE, LOAD, ADD

_(split out of [C08](../done/C08-copular-and-genus-verbs.md) on 2026-09-20, the way
[C18](C18-motion-verbs-without-a-gloss.md) was split out of C17: C08 built the **causative** and
localized the seven verbs it reached, and these are what it did not.)_

## Blocked on

Two constructs of its own (a voice, a complement), one judgement about a gloss, and three more the
workspace verbs want — two of which [C12](../done/C12-ui-purpose-and-object-complements.md) already
catalogues for the UI strings. None of them is the causative.

### 1. The passive voice — BURN

| verb | literal | wanted gloss |
|---|---|---|
| BURN | to be on fire; to undergo combustion | to be consumed by fire |

Waits on [features/A01 passive voice](../../features/A-ready/A01-passive-voice/README.md), which
C08 deliberately did not start: the passive is a whole feature (voice on the verb phrase, the
by-phrase, seven morphologies, a builder satellite), not a corner of a gloss.

C08 called BURN "lexically ready" because FIRE and CONSUME are both seeded. **It is not, in
Japanese.** The active stand-in renders 火は物体を**摂取します** — CONSUME's ja lexeme is 摂取する, "to
ingest", the word EAT and DRINK need, and fire does not ingest. A Japanese gloss would need a second
consumption sense (燃やす / 焼く) before the passive could carry it. The other six are clean: *il fuoco
consuma un oggetto*, *das Feuer konsumiert einen Gegenstand*.

### 2. A similative complement — SEEM

| verb | literal | missing construct |
|---|---|---|
| SEEM | to look like; to give the impression of being similar to | a similative complement — "to be similar **to** a thing" |

`predicative` ascribes a property to the subject; nothing says the subject *resembles* another noun
phrase. The `manner` complement's `similative` relation is the nearest thing the engine has (it
picks "like" / *come* / *wie*), but it is an adverbial of manner, not a complement of the copula, and
no probe has been run on it. SEEM's own lexemes already carry `seeming: '1'`, so the verb is not the
problem — the differentia is.

### 3. A gloss worth having — BECOME

The construct C08 was told BECOME needed, the **inchoative**, now exists: BEGIN links its infinitive
in every language (C08 §b). The gloss it would carry does not justify itself. Probed 2026-09-20 with
a candidate DIFFERENT put in front of the lexicon (nothing seeded):

| plan | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BEGIN + BE + DIFFERENT | to begin to be different | iniziare a essere diverso | commencer à être différent | beginnen, verschieden zu sein | empezar a ser diferente | **別であることが始まる** | começar a ser diferente |

Two reasons to leave it:

- **Japanese.** 「別であることが始まる」 is the *nominalized event* of being different, beginning. What
  Japanese says here is 〜になる — which is BECOME's own word, so the gloss either reads as a
  translation exercise or defines the verb with itself.
- **The adjective.** DIFFERENT's Japanese is 別の, which is already OTHER's ([B21](../done/B21-ui-clause-and-coordination-vocabulary.md))
  — 異なる and 違う are verbs, not adjectives, so the seed would double a word to say a different thing.

BECOME is better read as BE plus an aspect than as a genus with a differentia, which puts it with the
copula: **leave it on the English literal**, as C08 leaves BE and CONSUME, unless a gloss appears that
is worth the seed.

### 4. A purpose clause, a comitative, a prior state — the four workspace verbs

Two of the three are C12's items 1 and 3, so those two land together with the UI strings or not at
all; the prior state is this file's own.

**Update 2026-09-20: they landed.** [C12](../done/C12-ui-purpose-and-object-complements.md) shipped
`PhrasePlan.purpose` and the `comitative` complement, so **SAVE and ADD are no longer blocked** —
both are now ordinary authoring work against constructs that render in all seven languages. What
remains here is the passive (BURN), the similative complement (SEEM), the judgement on BECOME, and
the prior state TIDY_UP and LOAD want.

| verb | literal | missing construct | C12 |
|---|---|---|---|
| SAVE | to store something so it can be retrieved later | purpose clause — "so it can be —" | 1 |
| ADD | to put something together with something else | comitative — "together **with** something else" (`instrumental` is the means, not a companion) | 3 |
| TIDY_UP | to put back in order what was left in a mess | resultative + a prior state — "back into order" | — |
| LOAD | to bring stored content back in | direction "back in" over a prior state | — |

TIDY_UP and LOAD both need a **prior state** ("back"), which nothing in the plan model expresses and
no other task asks for: a resultative says where the thing ends up, not where it was.

## Not here

**BE** and **CONSUME** stay on the English literal by design (nothing sits above them), and so does
**CAUSE_VERB**, the genus C08 seeded. See [C08's Done note](../done/C08-copular-and-genus-verbs.md#still-on-the-english-literal-by-design).
