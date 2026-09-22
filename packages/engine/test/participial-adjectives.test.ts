import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C23: the participial state adjectives, glossed by the headless relative clause
// (NounPhrase.relativeGloss) — SAVED is "that one has saved", EMPTY "that does not have content",
// VISIBLE "that one can see". Every antecedent is OBJECT_THING, so German reads den … / der …
// throughout. Also the four words the glosses stand on: EXPECT, FIND, TITLE and NUMBER_LABEL.

/** A seeded concept's own `definition` plan (its picker tooltip). */
function definitionOf(id: string): PhrasePlan {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return concept.definition;
}

/** Render a plan into every language. */
const renderAll = (plan: PhrasePlan): Record<LanguageCode, string> =>
  Object.fromEntries(translate(plan, lookupLexicalEntry).map((t) => [t.language, t.text])) as Record<LanguageCode, string>;

/** A rendering with its full stop taken off, to find it inside a longer one. */
const bare = (text: string): string => text.replace(/[.。]$/, '');

const GLOSSED: [string, Record<LanguageCode, string>][] = [
  // What an event leaves: the object gap, the generic "one", the resultative.
  ['WRITTEN', { en: 'that one has written.', it: 'che si è scritto.', fr: "qu'on a écrit.", de: 'den man geschrieben hat.', es: 'que se ha escrito.', ja: '書いた。', pt: 'que se escreveu.' }],
  ['LOADED', { en: 'that one has loaded.', it: 'che si è caricato.', fr: "qu'on a chargé.", de: 'den man geladen hat.', es: 'que se ha cargado.', ja: '読み込んだ。', pt: 'que se carregou.' }],
  // ARRANGE, since TIDY_UP is glossed "to cause objects to be tidy".
  ['TIDY', { en: 'that one has arranged.', it: 'che si è disposto.', fr: "qu'on a disposé.", de: 'den man angeordnet hat.', es: 'que se ha dispuesto.', ja: '並べた。', pt: 'que se dispôs.' }],
  ['SAVED', { en: 'that one has saved.', it: 'che si è salvato.', fr: "qu'on a enregistré.", de: 'den man gespeichert hat.', es: 'que se ha guardado.', ja: '保存した。', pt: 'que se salvou.' }],
  ['ADDED', { en: 'that one has added.', it: 'che si è aggiunto.', fr: "qu'on a ajouté.", de: 'den man hinzugefügt hat.', es: 'que se ha añadido.', ja: '加えた。', pt: 'que se adicionou.' }],
  ['REMOVED', { en: 'that one has removed.', it: 'che si è rimosso.', fr: "qu'on a retiré.", de: 'den man entfernt hat.', es: 'que se ha quitado.', ja: '取り除いた。', pt: 'que se removeu.' }],
  ['COPIED', { en: 'that one has copied.', it: 'che si è copiato.', fr: "qu'on a copié.", de: 'den man kopiert hat.', es: 'que se ha copiado.', ja: 'コピーした。', pt: 'que se copiou.' }],
  ['LINKED', { en: 'that one has linked.', it: 'che si è collegato.', fr: "qu'on a relié.", de: 'den man verbunden hat.', es: 'que se ha enlazado.', ja: 'つないだ。', pt: 'que se ligou.' }],
  ['PINNED', { en: 'that one has pinned.', it: 'che si è fissato.', fr: "qu'on a épinglé.", de: 'den man angeheftet hat.', es: 'que se ha fijado.', ja: 'ピン留めした。', pt: 'que se fixou.' }],
  ['UNPINNED', { en: 'that one has unpinned.', it: 'che si è sbloccato.', fr: "qu'on a désépinglé.", de: 'den man gelöst hat.', es: 'que se ha desfijado.', ja: 'ピン留め解除した。', pt: 'que se desafixou.' }],
  ['HIDDEN', { en: 'that one has hidden.', it: 'che si è nascosto.', fr: "qu'on a caché.", de: 'den man versteckt hat.', es: 'que se ha escondido.', ja: '隠した。', pt: 'que se escondeu.' }],
  // A standing property, not a result: the neutral aspect, and a modal where the property is a
  // possibility. The negation of a state is the verb's own negation.
  ['VALID', { en: 'that one accepts.', it: 'che si accetta.', fr: "qu'on accepte.", de: 'den man akzeptiert.', es: 'que se acepta.', ja: '受け付ける。', pt: 'que se aceita.' }],
  ['VISIBLE', { en: 'that one can see.', it: 'che si può vedere.', fr: "qu'on peut voir.", de: 'den man sehen kann.', es: 'que se puede ver.', ja: '見ることができる。', pt: 'que se pode ver.' }],
  ['MISSING', { en: 'that one cannot find.', it: 'che non si può trovare.', fr: "qu'on ne peut pas trouver.", de: 'den man nicht finden kann.', es: 'que no se puede encontrar.', ja: '見つけることができない。', pt: 'que não se pode encontrar.' }],
  ['UNKNOWN', { en: 'that one does not know.', it: 'che non si conosce.', fr: "qu'on ne connaît pas.", de: 'den man nicht kennt.', es: 'que no se conoce.', ja: '知らない。', pt: 'que não se conhece.' }],
  // KNOWN, seeded by C24 for DEFINITE and glossed in the integration pass as UNKNOWN's positive.
  ['KNOWN', { en: 'that one knows.', it: 'che si conosce.', fr: "qu'on connaît.", de: 'den man kennt.', es: 'que se conoce.', ja: '知る。', pt: 'que se conhece.' }],
  ['UNEXPECTED', { en: 'that one does not expect.', it: 'che non si prevede.', fr: "qu'on n'attend pas.", de: 'den man nicht erwartet.', es: 'que no se espera.', ja: '予想しない。', pt: 'que não se espera.' }],
  // No verb of its own: what the thing does, or has — the subject gap.
  ['FAILED', { en: 'that has not worked.', it: 'che non ha funzionato.', fr: "qui n'a pas fonctionné.", de: 'der nicht funktioniert hat.', es: 'que no ha funcionado.', ja: '動作していない。', pt: 'que não funcionou.' }],
  ['ACTIVE', { en: 'that is working.', it: 'che sta funzionando.', fr: 'qui est en train de fonctionner.', de: 'der gerade funktioniert.', es: 'que está funcionando.', ja: '動作している。', pt: 'que está funcionando.' }],
  ['NUMBERED', { en: 'that has a number.', it: 'che ha un numero.', fr: 'qui a un numéro.', de: 'der eine Nummer hat.', es: 'que tiene un número.', ja: '番号がある。', pt: 'que tem um número.' }],
  ['UNTITLED', { en: 'that does not have a title.', it: 'che non ha un titolo.', fr: "qui n'a pas de titre.", de: 'der keinen Titel hat.', es: 'que no tiene un título.', ja: 'タイトルがない。', pt: 'que não tem um título.' }],
  ['EMPTY', { en: 'that does not have content.', it: 'che non ha contenuto.', fr: "qui n'a pas de contenu.", de: 'der keinen Inhalt hat.', es: 'que no tiene contenido.', ja: '内容がない。', pt: 'que não tem conteúdo.' }],
];

describe('the participial state adjectives are glossed in every language', () => {
  test.each(GLOSSED)('%s', (id, rendered) => {
    expect(renderAll(definitionOf(id))).toEqual(rendered);
  });

  // RECENT stays on the literal by design: "used a short time ago" is a distance in time, which
  // no seeded word measures (docs/localization/done/C23-participial-state-adjectives.md).
  test('RECENT has no gloss', () => {
    expect(concepts.find((c) => c.id === 'RECENT')?.definition).toBeUndefined();
  });
});

describe('each gloss is the relative its antecedent would take, said alone', () => {
  // The same plan with the head spoken — "an object that one has saved", 保存した物体, "ein
  // Gegenstand, den man gespeichert hat" — carries the gloss word for word, in every language.
  test.each(GLOSSED.map(([id]) => id))('%s', (id) => {
    const plan = definitionOf(id);
    const { relativeGloss: _headless, ...head } = plan.subject as NonNullable<PhrasePlan['subject']> & { relativeGloss?: boolean };
    const headed = renderAll({ ...plan, subject: head });
    const gloss = renderAll(plan);
    for (const lang of Object.keys(LANGUAGES) as LanguageCode[]) {
      expect(headed[lang]).toContain(bare(gloss[lang]));
      expect(headed[lang]).not.toBe(gloss[lang]);
    }
  });
});

describe('the words the glosses stand on', () => {
  test('EXPECT: a state of mind, so its past is the imperfect and its Japanese 〜ている', () => {
    expect(sayAll(clause(np('CAT'), 'EXPECT', { directObject: np('DOG') }))).toEqual({
      en: 'the cat expects the dog.', it: 'il gatto prevede il cane.', fr: 'le chat attend le chien.',
      de: 'der Kater erwartet den Hund.', es: 'el gato espera el perro.', ja: '猫は犬を予想しています。', pt: 'o gato espera o cão.',
    });
    expect(sayAll(clause(np('FIRST_PERSON'), 'EXPECT', { directObject: np('DOG'), verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'I expected the dog.', it: 'prevedevo il cane.', fr: "j'attendais le chien.",
      de: 'ich erwartete den Hund.', es: 'esperaba el perro.', ja: '私は犬を予想していました。', pt: 'esperava o cão.',
    });
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'EXPECT', { directObject: np('DOG'), verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the cats will expect the dog.', it: 'i gatti prevederanno il cane.', fr: 'les chats attendront le chien.',
      de: 'die Kater werden den Hund erwarten.', es: 'los gatos esperarán el perro.', ja: '猫は犬を予想しています。', pt: 'os gatos esperarão o cão.',
    });
    // prevedere's participle is the strong previsto; the passive agrees with its patient.
    expect(sayAll(clause(np('CAT'), 'EXPECT', { directObject: np('DOG', { gender: 'fem' }), verbPhrase: { voice: 'passive' } }))).toEqual({
      en: 'the dog is expected by the cat.', it: 'la cagna è prevista dal gatto.', fr: 'la chienne est attendue par le chat.',
      de: 'die Hündin wird vom Kater erwartet.', es: 'la perra es esperada por el gato.', ja: '犬は猫に予想されています。', pt: 'a cadela é esperada pelo gato.',
    });
  });

  test('FIND: strong in English and German, diphthongising in Spanish', () => {
    expect(sayAll(clause(np('CAT'), 'FIND', { directObject: np('DOG') }))).toEqual({
      en: 'the cat finds the dog.', it: 'il gatto trova il cane.', fr: 'le chat trouve le chien.',
      de: 'der Kater findet den Hund.', es: 'el gato encuentra el perro.', ja: '猫は犬を見つけます。', pt: 'o gato encontra o cão.',
    });
    expect(sayAll(clause(np('FIRST_PERSON'), 'FIND', { directObject: np('DOG'), verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'I found the dog.', it: 'trovai il cane.', fr: 'je trouvai le chien.',
      de: 'ich fand den Hund.', es: 'encontré el perro.', ja: '私は犬を見つけました。', pt: 'encontrei o cão.',
    });
    expect(sayAll(clause(np('SECOND_PERSON'), 'FIND', { directObject: np('DOG'), verbPhrase: { negative: true } }))).toEqual({
      en: 'you do not find the dog.', it: 'non trovi il cane.', fr: 'tu ne trouves pas le chien.',
      de: 'du findest den Hund nicht.', es: 'no encuentras el perro.', ja: 'あなたは犬を見つけません。', pt: 'não encontra o cão.',
    });
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'FIND', { verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'the cat has found.', it: 'la gatta ha trovato.', fr: 'la chatte a trouvé.',
      de: 'die Katze hat gefunden.', es: 'la gata ha encontrado.', ja: '猫は見つけました。', pt: 'a gata encontrou.',
    });
    expect(sayAll(clause(np('CAT'), 'FIND', { directObject: np('DOG', { gender: 'fem' }), verbPhrase: { voice: 'passive' } }))).toEqual({
      en: 'the dog is found by the cat.', it: 'la cagna è trovata dal gatto.', fr: 'la chienne est trouvée par le chat.',
      de: 'die Hündin wird vom Kater gefunden.', es: 'la perra es encontrada por el gato.', ja: '犬は猫に見つけられます。', pt: 'a cadela é encontrada pelo gato.',
    });
  });

  test('TITLE: masculine in every gendered language, German Titel unchanged in the plural', () => {
    expect(sayAll({ subject: np('TITLE', { definiteness: 'indefinite' }) })).toEqual({
      en: 'a title.', it: 'un titolo.', fr: 'un titre.', de: 'ein Titel.', es: 'un título.', ja: 'タイトル。', pt: 'um título.',
    });
    expect(sayAll({ subject: np('TITLE', { number: 'plural', adjectives: ['GOOD'] }) })).toEqual({
      en: 'the good titles.', it: 'i buoni titoli.', fr: 'les bons titres.', de: 'die guten Titel.',
      es: 'los títulos buenos.', ja: '良いタイトル。', pt: 'os títulos bons.',
    });
  });

  test('NUMBER_LABEL: numéro, Nummer, 番号 — not the NUMBER one counts with', () => {
    expect(sayAll({ subject: np('NUMBER_LABEL', { definiteness: 'indefinite', adjectives: ['GOOD'] }) })).toEqual({
      en: 'a good number.', it: 'un buon numero.', fr: 'un bon numéro.', de: 'eine gute Nummer.',
      es: 'un número bueno.', ja: '良い番号。', pt: 'um número bom.',
    });
    expect(sayAll({ subject: np('NUMBER_LABEL', { number: 'plural' }) })).toEqual({
      en: 'the numbers.', it: 'i numeri.', fr: 'les numéros.', de: 'die Nummern.', es: 'los números.', ja: '番号。', pt: 'os números.',
    });
  });
});
