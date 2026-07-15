# A9. Resultative is iterative, not perfective

**Language:** Portuguese

`tem comido` means "has been eating (repeatedly)". The perfect of a bounded event is the
pretérito perfeito.

| | |
|---|---|
| **Now / Want** | `o gato tem comido.` → `o gato comeu.` |
| **Where** | `pt.ts` ~line 238 (`ter` as the resultative auxiliary) |
| **Fix** | Portuguese has no present-perfect equivalent of `ha comido`. Map present resultative onto the pretérito perfeito. **Careful:** the *past* resultative (`o gato tinha comido`, pluperfect) is already correct — only the present is wrong. |
| **Test** | `verb.test.ts` → *known bugs: aspect* (1 test) |
