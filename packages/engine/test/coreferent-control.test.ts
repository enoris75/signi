import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan } from '@signi/shared';
import { compileDefinition, definitionVocabulary } from '@signi/phrase';
import { sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { seedConcept } from '../../backend/src/concepts/definitionText.js';

// P11-E7: a noun's possessor pointed at its clause's own subject is E2's link, built the way the
// builder builds it — a console line (`/poss #1.subj`, the canvas's pointer) applied to a workspace,
// then `workspaceToPlans`. Each row is P11-E7's table, now said by the builder's own plan; the link's
// grammar is pinned in coreference.test.ts.

const VOCAB = definitionVocabulary(concepts.map(seedConcept));
const said = (line: string) => sayAll(compileDefinition(line, VOCAB));

describe('a pointer at the subject is the link (P11-E7)', () => {
  test.each<[string, string, Partial<Record<LanguageCode, string>>]>([
    // The cat's gender is the builder's masculine pick, which the link reads (E7's lead): "his".
    ['the cat sees its book', '/subj ( CAT ) /verb ( SEE ) /obj ( BOOK /poss #1.subj )', {
      en: 'the cat sees his book.', de: 'der Kater sieht sein Buch.', ja: '猫は自分の本を見ます。',
    }],
    ['the woman sees her book', '/subj ( WOMAN ) /verb ( SEE ) /obj ( BOOK /poss #1.subj )', {
      en: 'the woman sees her book.', de: 'die Frau sieht ihr Buch.', it: 'la donna vede il suo libro.', ja: '女は自分の本を見ます。',
    }],
    // A 1st-person owner on the subject is built with P11-E9's pronoun owner; the kin chain reads
    // through the link, so his mother is the speaker's: 母.
    ['my older brother sees his mother', '/subj ( BROTHER /adj ELDER /poss [ 1st ] ) /verb ( SEE ) /obj ( MOTHER /poss #1.subj )', {
      en: 'my older brother sees his mother.', de: 'mein älterer Bruder sieht seine Mutter.', ja: '兄は自分の母を見ます。',
    }],
    // D2: the subject is the whole group.
    ['the cat and the dog see their book', '/subj ( CAT /and DOG ) /verb ( SEE ) /obj ( BOOK /poss #1.subj )', {
      en: 'the cat and the dog see their book.', it: 'il gatto e il cane vedono il loro libro.', fr: 'le chat et le chien voient leur livre.',
      de: 'der Kater und der Hund sehen ihr Buch.', ja: '猫と犬は自分の本を見ます。',
    }],
    // D4: a command's subject is its addressee, which no box holds.
    ['see your book', '/command /verb ( SEE ) /obj ( BOOK /poss #1.subj )', {
      en: 'see your book.', it: 'vedi il tuo libro.', fr: 'vois ton livre.', de: 'sieh dein Buch.', es: 've tu libro.', ja: '自分の本を見てください。',
    }],
    ['the man who sees his mother runs', '/subj ( MAN /rel subj { /verb ( SEE ) /obj ( MOTHER /poss #2.subj ) } ) /verb ( RUN )', {
      en: 'the man who sees his mother runs.', de: 'der Mann, der seine Mutter sieht, läuft.', ja: '自分のお母さんを見る男は走ります。',
    }],
    // D4: the clauses whose subject has no box — a purpose, an object-controlled infinitive, a citation.
    ['the man runs to see his mother', '/subj ( MAN ) /verb ( RUN ) /so { /verb ( SEE ) /obj ( MOTHER /poss #2.subj ) }', {
      en: 'the man runs to see his mother.', it: "l'uomo corre per vedere sua madre.", ja: '男は自分のお母さんを見るために走ります。',
    }],
    ['the man lets the boy see his mother', '/subj ( MAN ) /verb ( LET ) /obj ( BOY ) /to { /verb ( SEE ) /obj ( MOTHER /poss #2.subj ) } /objctl', {
      ja: '男は男の子に自分のお母さんを見させます。',
    }],
    ['to see one’s book', '/inf /verb ( SEE ) /obj ( BOOK /poss #1.subj )', {
      en: "to see one's book.", it: 'vedere il proprio libro.', ja: '自分の本を見る。',
    }],
  ])('%s', (_, line, rendered) => {
    expect(said(line)).toMatchObject(rendered);
  });

  // D5: the chip on the link's line says the possessed phrase the sentence says — bound in its clause,
  // which a bare noun phrase cannot be — through `translate`'s `phrase` option.
  test.each<[string, string, Partial<Record<LanguageCode, string>>]>([
    ['her book', '/subj ( WOMAN ) /verb ( SEE ) /obj ( BOOK /poss #1.subj )', { en: 'her book', de: 'ihr Buch', it: 'il suo libro', ja: '自分の本' }],
    ['their book', '/subj ( CAT /and DOG ) /verb ( SEE ) /obj ( BOOK /poss #1.subj )', { en: 'their book', fr: 'leur livre', ja: '自分の本' }],
    ['your book', '/command /verb ( SEE ) /obj ( BOOK /poss #1.subj )', { en: 'your book', de: 'dein Buch', ja: '自分の本' }],
    ["one's book", '/inf /verb ( SEE ) /obj ( BOOK /poss #1.subj )', { en: "one's book", it: 'il proprio libro' }],
    // A copy says what the bare noun phrase always said, in the nominative.
    ['his dog, a copy', '/subj ( BOY ) /verb ( SEE ) /obj ( DOG /poss [ 3rd ] )', { en: 'his dog', de: 'sein Hund', ja: '彼の犬' }],
  ])('renders the object alone, bound in its clause: %s', (_, line, rendered) => {
    const phrase = Object.fromEntries(
      translate(compileDefinition(line, VOCAB), lookupLexicalEntry, { phrase: 'directObject' }).map((t) => [t.language, t.text]),
    );
    expect(phrase).toMatchObject(rendered);
  });

  // The canvas asks with the period's subject and mood alone, and no verb: the object still binds.
  test.each<[string, PhrasePlan, Partial<Record<LanguageCode, string>>]>([
    ['a subject', { subject: { concept: 'WOMAN' } } as PhrasePlan, { en: 'her book', de: 'ihr Buch', ja: '自分の本' }],
    ['a group', { subject: { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' } } as PhrasePlan, { en: 'their book' }],
    ['a command’s addressee', { subject: { concept: 'SECOND_PERSON', number: 'plural' }, imperative: true } as PhrasePlan, { en: 'your book', de: 'euer Buch', ja: '自分の本' }],
    ['a citation’s one', { subject: { concept: 'GENERIC_PERSON' }, infinitive: true } as PhrasePlan, { en: "one's book", it: 'il proprio libro' }],
  ])('binds a verbless clause’s object to %s', (_, clause, rendered) => {
    const plan = { ...clause, directObject: { concept: 'BOOK', possessor: { kind: 'coreferent', slot: 'subject' } } } as PhrasePlan;
    const phrase = Object.fromEntries(translate(plan, lookupLexicalEntry, { phrase: 'directObject' }).map((t) => [t.language, t.text]));
    expect(phrase).toMatchObject(rendered);
  });

  test('renders nothing for a plan with no object', () => {
    const plan = compileDefinition('/subj ( WOMAN ) /verb ( RUN )', VOCAB);
    expect(translate(plan, lookupLexicalEntry, { phrase: 'directObject' }).every((t) => t.text === '')).toBe(true);
  });

  // D3: the passive keeps the copy, and Japanese its 彼の (E2's lead).
  test('the passive keeps the copy', () => {
    expect(said('/subj ( WOMAN ) /verb ( SEE /passive ) /obj ( BOOK /poss #1.subj )')).toMatchObject({
      ja: '彼の本は女に見られます。',
    });
  });
});
