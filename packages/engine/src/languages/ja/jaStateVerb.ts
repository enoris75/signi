/**
 * The verb behind a た-adjective (see `jaAdjClass`'s `ta` class: 疲れた, 孤立した, 開いた), read back
 * from its plain past, for the change of state a まで or 前に clause names (A346): 疲れるまで, "until it
 * gets tired", not the held state 疲れているまで. Returned as the ending to put in place of the past's
 * last `cut` characters, in the dictionary form (`dict`) and the nai-stem (`nai`, before ない).
 *
 * The plain past does not always say which verb it came from, so only the unambiguous endings are read:
 * - 〜れた / 〜じた and any other e- or i-row kana before た: an ichidan verb (疲れる, 閉じる, 去勢される);
 * - 〜とした and a compound of two or more kanji before した: a する verb (整然とする, 孤立する, 失敗する);
 * - 〜いた / 〜いだ: a godan く / ぐ verb (開く, 泳ぐ).
 * The rest — 〜った, 〜んだ (う / つ / る, む / ぶ / ぬ), a single kanji before した (話す or 愛する) or
 * before た (来る) — is `undefined`, and the caller keeps the state it has.
 */
export function jaStateVerb(base: string): { cut: number; dict: string; nai: string } | undefined {
  const isKanji = (c: string | undefined) => c !== undefined && /\p{Script=Han}/u.test(c);
  if (base.endsWith('いだ')) return { cut: 2, dict: 'ぐ', nai: 'が' };
  if (!base.endsWith('た')) return undefined;
  const before = base.slice(0, -1);
  const kana = before.slice(-1);
  if (kana === 'し') {
    const stem = before.slice(0, -1);
    const suru = stem.endsWith('と') || (stem.length >= 2 && isKanji(stem.slice(-1)) && isKanji(stem.slice(-2, -1)));
    return suru ? { cut: 2, dict: 'する', nai: 'し' } : undefined;
  }
  if (kana === 'い') return { cut: 2, dict: 'く', nai: 'か' };
  if (kana === 'っ' || kana === 'ん' || kana === '' || isKanji(kana)) return undefined;
  return { cut: 1, dict: 'る', nai: '' };
}
