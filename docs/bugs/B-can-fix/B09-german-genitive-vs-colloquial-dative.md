# B9. German governs the genitive in standard usage, but `de.ts` emits the colloquial dative/`von`

**Documented simplification — NOT pinned by a test** (recorded for completeness, no `test.fails`).

German governs the **genitive** in standard usage (`wegen des Hundes`, `das Buch des Katers`), but
`de.ts` emits the colloquial dative/`von` (`wegen dem Hund`, `das Buch vom Kater`) and acknowledges
this for `wegen`.
