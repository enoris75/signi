# A18. Aspect is dropped inside a relative clause

**Language:** German

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
