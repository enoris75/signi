import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { compileDefinition, definitionVocabulary } from '@signi/phrase';
import { sayAll } from './harness.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { seedConcept } from '../../backend/src/concepts/definitionText.js';

// P11-E9: a pronoun named as a noun's owner — "my mother runs" — built the way the builder builds it:
// a console line applied to a workspace, then the canvas's own `selectionToPlan`. Every row is the
// engine's output for the plan the builder now writes (a `PronominalPossessor`, never a genitive
// noun phrase headed by the pronoun), and the Japanese of the kin rows is kinship.test.ts's.

const VOCAB = definitionVocabulary(concepts.map((c) => seedConcept(c)));
const said = (line: string) => sayAll(compileDefinition(line, VOCAB));

describe('a pronoun as a named owner (P11-E9)', () => {
  test.each<[string, string, Record<LanguageCode, string>]>([
    ['my mother runs', '/subj ( MOTHER /poss [ 1st ] ) /verb ( RUN )', {
      en: 'my mother runs.', it: 'mia madre corre.', fr: 'ma mère court.', de: 'meine Mutter läuft.',
      es: 'mi madre corre.', pt: 'a minha mãe corre.', ja: '母は走ります。',
    }],
    ['your mother runs', '/subj ( MOTHER /poss [ 2nd ] ) /verb ( RUN )', {
      en: 'your mother runs.', it: 'tua madre corre.', fr: 'ta mère court.', de: 'deine Mutter läuft.',
      es: 'tu madre corre.', pt: 'a sua mãe corre.', ja: 'あなたのお母さんは走ります。',
    }],
    ['our father runs', '/subj ( FATHER /poss [ 1st /pl ] ) /verb ( RUN )', {
      en: 'our father runs.', it: 'nostro padre corre.', fr: 'notre père court.', de: 'unser Vater läuft.',
      es: 'nuestro padre corre.', pt: 'o nosso pai corre.', ja: '私たちの父は走ります。',
    }],
    ['your (plural) mother runs', '/subj ( MOTHER /poss [ 2nd /pl ] ) /verb ( RUN )', {
      en: 'your mother runs.', it: 'vostra madre corre.', fr: 'votre mère court.', de: 'eure Mutter läuft.',
      es: 'vuestra madre corre.', pt: 'a sua mãe corre.', ja: 'あなたたちのお母さんは走ります。',
    }],
    ['my son marries your daughter', '/subj ( SON /poss [ 1st ] ) /verb ( MARRY ) /obj ( DAUGHTER /poss [ 2nd ] )', {
      en: 'my son marries your daughter.', it: 'mio figlio sposa tua figlia.', fr: 'mon fils épouse ta fille.',
      de: 'mein Sohn heiratet deine Tochter.', es: 'mi hijo se casa con tu hija.', pt: 'o meu filho casa com a sua filha.',
      ja: '息子はあなたの娘さんと結婚します。',
    }],
  ])('%s', (_, line, rendered) => {
    expect(said(line)).toEqual(rendered);
  });

  // The third person, where gender is the only thing that varies: the chooser's gender pick.
  test.each<[string, string, Partial<Record<LanguageCode, string>>]>([
    ['his', '[ 3rd ]', { en: 'I see his book.', de: 'ich sehe sein Buch.', ja: '私は彼の本を見ます。', it: 'vedo il suo libro.' }],
    ['her', '[ 3rd /fem ]', { en: 'I see her book.', de: 'ich sehe ihr Buch.', ja: '私は彼女の本を見ます。', fr: 'je vois son livre.' }],
    ['its', '[ 3rd /neut ]', { en: 'I see its book.', de: 'ich sehe sein Buch.', ja: '私はその本を見ます。' }],
    ['their', '[ 3rd /pl ]', { en: 'I see their book.', de: 'ich sehe ihr Buch.', ja: '私は彼らの本を見ます。', it: 'vedo il loro libro.' }],
  ])('I see %s book', (_, owner, rendered) => {
    expect(said(`/subj ( 1st ) /verb ( SEE ) /obj ( BOOK /poss ${owner} )`)).toMatchObject(rendered);
  });

  // D3: a gender the chooser set on a 1st or 2nd person owner is held and not written.
  test('a feminine 1st person owner says what the masculine one does', () => {
    expect(said('/subj ( FATHER /poss [ 1st /pl /fem ] ) /verb ( RUN )')).toEqual(said('/subj ( FATHER /poss [ 1st /pl ] ) /verb ( RUN )'));
  });

  // D6: a free owner is not E7's link. Japanese names whoever the features name.
  test('a free 3rd person owner is another person’s: 彼の, not 自分の', () => {
    expect(said('/subj ( BOY ) /verb ( SEE ) /obj ( MOTHER /poss [ 3rd ] )')).toMatchObject({
      en: 'the boy sees his mother.', ja: '男の子は彼のお母さんを見ます。',
    });
  });
});
