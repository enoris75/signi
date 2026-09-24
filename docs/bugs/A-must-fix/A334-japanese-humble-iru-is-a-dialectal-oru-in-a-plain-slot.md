# A334. Japanese says a dialectal おる for the humble いる in a plain slot

**Languages:** Japanese

P11-E1 lowers one's own relative's いる to the humble おる when the plan asks (`humble: true`), which
is right in the polite predicate: 父は家におります. But the register also reaches the clause's plain
slots, the たら of an "if" clause and the dictionary or nai form a governing modal asks for, and
there it says おったら, おる必要, おらない必要. In standard Japanese the humble おる lives in its
polite forms (おります, おりました, おりましたら). Its plain forms おる, おった, おらない are the
ordinary いる of Western (Kansai) speech, so in a standard sentence they sound dialectal, or
old-fashioned, and not humble. A plain slot says いる, and the humility is carried by the polite
main verb.

| Case | Now | Want |
|---|---|---|
| if my father is at home, the cat runs (`condition`, `humble: true`) | `もし父が家におったら、猫は走ります。` | `もし父が家にいたら、猫は走ります。` |
| if my father is not at home, the cat runs | `もし父が家におらなかったら、猫は走ります。` | `もし父が家にいなかったら、猫は走ります。` |
| my father must be at home (`modals: ['MUST']`) | `父は家におる必要があります。` | `父は家にいる必要があります。` |
| my father must not be at home (`modals: ['MUST'], negative: true`) | `父は家におらない必要があります。` | `父は家にいない必要があります。` |
| my father could be at home (`modals: ['CAN'], tense: 'past'`) | `父は家におることができました。` | `父は家にいることができました。` |

**Why this target.** The recommended fix (a, below) falls back to plain いる wherever the clause is
plain. Every Want was rendered by the engine from the same plan without `humble`, which is exactly
what fix (a) produces. Each differs from Now only by おる → いる.

**Already right.** The polite predicate: 父は家におります, 父は家におりませんでした. The other humble
words stand plain without trouble, since 参る, いたす, 申す, いただく and 差し上げる have standard plain
forms: もし父が参ったら, 父は参る必要があります. A plain relative or adverbial clause already keeps
いる (家にいる猫, 父が家にいるので), because the register skips a plain clause. The other six
languages have no register.

**Not pinned.** 父は家におりたいです (the humble under たい) is a polite predicate built on the ます
stem, and おりたい is heard in humble speech. The fixer should keep it.

## Shape of the fix

The decision is the fixer's. Two ways:

- **(a) Recommended: fall back to plain いる wherever the humble いる lands in a plain form.** The
  register column on `JA_IRU` (`languages/ja/ja.consts.ts`) would carry no plain humble forms
  (drop `humble` / `humble_te` / `humble_nai` for plain use), or `jaRespectVerb` would take the
  humble word only for the polite paradigm (`masu_present`, and the te form of a polite
  progressive). Then `taraSeg`, `plainVerbSeg` and `verbFormSeg`'s `dict` form read いる's own
  forms. This is scoped to いる: the other humble verbs are standard in plain forms and must keep
  them. A polite おりましたら in the if-clause would also be standard, but the engine's たら is
  plain for every verb, and いたら matches it.
- **(b) Document it as a simplification.** Keep おる, and note in P11-E1 that the plain humble
  いる is out of scope. Then move this file to `C-do-not-fix/` and flip the pins.

Pinned by `known bugs: the humble いる is a dialectal おる in a plain slot (A334)` in
[honorific-verbs.test.ts](../../../packages/engine/test/honorific-verbs.test.ts), at target (a).

Found on 2026-09-24 by the P11-E1 coverage audit (rendering the humble register through the たら and
the modals).
