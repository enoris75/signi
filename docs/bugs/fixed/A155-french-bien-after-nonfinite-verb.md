# A155. French "bien" follows the participle and the infinitive

**Language:** French

A short adverb such as `bien` goes before the non-finite verb it modifies. In the compound past it
goes between the auxiliary and the participle (`il a bien mangé`). It also goes before an infinitive,
both under a modal and in the progressive or prospective periphrasis (`il doit bien manger`, `il est
en train de bien manger`). The engine places `bien` after the non-finite verb, which is where a long
-ment adverb goes (`a mangé lentement`). `a mangé bien la souris` is not French.

| Clause | Now | Want |
|---|---|---|
| CAT EAT the MOUSE, WELL, resultative | `le chat a mangé bien la souris.` | `le chat a bien mangé la souris.` |
| the same, negative | `le chat n'a pas mangé bien la souris.` | `le chat n'a pas bien mangé la souris.` |
| relative: the DOG that has eaten the MOUSE WELL RUNs | `le chien qui a mangé bien la souris court.` | `le chien qui a bien mangé la souris court.` |
| CAT MUST EAT the MOUSE, WELL | `le chat doit manger bien la souris.` | `le chat doit bien manger la souris.` |
| the same, progressive | `le chat est en train de manger bien la souris.` | `le chat est en train de bien manger la souris.` |
| the same, prospective | `le chat est sur le point de manger bien la souris.` | `le chat est sur le point de bien manger la souris.` |
| BOOKs NAME the BROWN BLADE, WELL, prospective future | `les livres seront sur le point de nommer bien la lame brune.` | `les livres seront sur le point de bien nommer la lame brune.` |
| instruction: EAT the MOUSE, WELL | `manger bien la souris.` | `bien manger la souris.` |

After a finite verb, `bien` is already in the right place (`le chat mange bien la souris`), and so are
the frequency adverbs (`n'a jamais été`, `doit toujours courir`).

Found by reviewing the random phrase "few legends that the wild small cats will desire bit many
equally near books that will be about to name the brown blade well in few butchers".

## Shape of the fix

[`fr/predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts) already lifts a
frequency adverb (`subtype: 'frequency'`) out of the trailing modifier slot, in both the modal and the
aspect branches. `bien` needs its own slot. Putting it after the finite verb would be wrong in the
periphrases: `est bien en train de manger` means "is indeed eating". It goes right before the
non-finite verb:

1. Mark the adverb, for example `pre_nonfinite: '1'` on WELL's French forms, so the rule is data rather
   than a word list. Other adverbs of this class (`mal`, `mieux`, `trop`) can join later.
2. Compound past: between the auxiliary (and any `pas`) and the participle, the slot a frequency adverb
   uses (`n'a pas bien mangé`).
3. Modal, progressive and prospective: before the innermost infinitive, after its clitic's `de` / `à`,
   so `de bien manger` and `de bien le manger` both come out. This needs a hook in
   [`modalGroupFr.ts`](../../../packages/engine/src/languages/fr/modalGroupFr.ts) and
   [`aspectVerbFr.ts`](../../../packages/engine/src/languages/fr/aspectVerbFr.ts).
4. Instruction and infinitive: before the infinitive, after any `ne pas` (`ne pas bien manger`).

Out of scope: `ensemble` and `à plusieurs reprises` also come before a noun object (`ont mangé ensemble
la souris`) where they read better after it. That is a placement preference, not an error.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: French "bien" before the participle and the infinitive* (3 `test.fails`, plus a regression test for the finite verb) |

## Resolved

Fixed on 2026-09-20 by marking the class in the corpus and giving it a slot in every non-finite
group:

1. `pre_nonfinite: '1'` on WELL's French lexeme
   ([`concepts/adverbs.ts`](../../../packages/backend/src/concepts/adverbs.ts)), so the rule is data
   rather than a word list — 'mal', 'mieux' and 'trop' can join it.
2. [`fr/predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts) reads it as
   `preInfinitive` and hands it to the group builders, clearing the trailing modifier slot.
   [`aspectVerbFr`](../../../packages/engine/src/languages/fr/aspectVerbFr.ts) puts it between the
   auxiliary and the participle ('n'a pas bien mangé') and inside the periphrasis's 'de', which
   then never elides ('en train de bien manger');
   [`modalGroupFr`](../../../packages/engine/src/languages/fr/modalGroupFr.ts) passes it into
   [`verbGroupInfinitiveFr`](../../../packages/engine/src/languages/fr/verbGroupInfinitiveFr.ts),
   which leads the innermost infinitive with it ('doit bien manger', 'doit avoir bien mangé').
3. `negateInfinitive` leads the infinitive with it behind any 'ne pas' ('ne pas bien manger').

An object clitic falls behind it, as the file wanted: 'de bien le manger', 'doit bien le manger'.

Guarded by `adverb.test.ts` → *known bugs: French bien before the participle and the infinitive*:
the three former `test.fails` now pass, plus an object clitic, a modal over the perfect, an être
participle and a negated infinitive clause, with regressions that the finite verb, its negation and
the command are unchanged, that a -ment adverb still follows the participle, and that the other six
languages never read the flag.
