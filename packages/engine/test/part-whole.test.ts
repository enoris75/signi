import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan } from '@signi/shared';
import { np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C26: the part-whole relation (`NounPhrase.possessorRole`), the instrument gap, and
// the glosses they shipped. The relation is a flag on the possessed phrase saying its possessor is
// the whole the head is a part of (`'whole'`) or the parts the head is made up of (`'parts'`). Six
// languages already rendered a genitive the right way round for it; English turned "a part of a
// keyboard" into the Saxon "a keyboard's part", a part the keyboard owns.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const said = (subject: NounPhrase): Record<LanguageCode, string> => sayAll({ subject } as PhrasePlan);
const whole = (head: string, extra: Partial<NounPhrase>, of: NounPhrase): NounPhrase =>
  np(head, { ...extra, possessor: of, possessorRole: 'whole' });
const KEYBOARD = np('KEYBOARD', { definiteness: 'indefinite' });

describe('the part-whole possessor', () => {
  test('a whole: English writes the of-phrase, the other six the genitive they already had', () => {
    const owner = said(np('PART', { definiteness: 'indefinite', possessor: KEYBOARD }));
    const part = said(whole('PART', { definiteness: 'indefinite' }, KEYBOARD));
    expect(owner.en).toBe("a keyboard's part.");
    expect(part).toEqual({
      en: 'a part of a keyboard.', it: 'una parte di una tastiera.', fr: "une partie d'un clavier.",
      de: 'ein Teil einer Tastatur.', es: 'una parte de un teclado.', ja: 'キーボードの部分。', pt: 'uma parte de um teclado.',
    });
    // The flag is English's alone: every other language renders both roles alike.
    for (const language of ['it', 'fr', 'de', 'es', 'ja', 'pt'] as const) expect(part[language]).toBe(owner[language]);
  });

  test('the head keeps its own determiner, and the whole its own', () => {
    expect(said(whole('PART', { adjectives: ['VISIBLE'] }, np('FIRE')))).toEqual({
      en: 'the visible part of the fire.', it: 'la parte visibile del fuoco.', fr: 'la partie visible du feu.',
      de: 'der sichtbare Teil des Feuers.', es: 'la parte visible del fuego.', ja: '火の可視の部分。', pt: 'a parte visível do fogo.',
    });
    expect(said(whole('PART', { definiteness: 'this' }, np('LIST')))).toEqual({
      en: 'this part of the list.', it: "questa parte dell'elenco.", fr: 'cette partie de la liste.',
      de: 'dieser Teil der Liste.', es: 'esta parte de la lista.', ja: '一覧のこの部分。', pt: 'esta parte da lista.',
    });
    // "all" stacks in front of an owner's clitic ("all the list's parts"); a whole leaves it alone.
    expect(said(whole('PART', { definiteness: 'all', number: 'plural' }, np('LIST')))).toEqual({
      en: 'all parts of the list.', it: "tutte le parti dell'elenco.", fr: 'toutes les parties de la liste.',
      de: 'alle Teile der Liste.', es: 'todas las partes de la lista.', ja: '一覧のすべての部分。', pt: 'todas as partes da lista.',
    });
  });

  // German keeps a proper-name whole after the head (ein Teil Italiens, not Italiens Teil), and the
  // Romance languages contract the preposition with the name's own article.
  test('a proper name as the whole', () => {
    expect(said(whole('PART', { definiteness: 'indefinite' }, np('ITALY')))).toEqual({
      en: 'a part of Italy.', it: "una parte dell'Italia.", fr: "une partie de l'Italie.",
      de: 'ein Teil Italiens.', es: 'una parte de Italia.', ja: 'イタリアの部分。', pt: 'uma parte da Itália.',
    });
    expect(said(whole('PART', {}, np('GERMANY')))).toEqual({
      en: 'the part of Germany.', it: 'la parte della Germania.', fr: "la partie de l'Allemagne.",
      de: 'der Teil Deutschlands.', es: 'la parte de Alemania.', ja: 'ドイツの部分。', pt: 'a parte da Alemanha.',
    });
  });

  test('parts: the relation read from the whole', () => {
    const canvases = np('CANVAS', { definiteness: 'bare', number: 'plural' });
    expect(said(np('GROUP', { definiteness: 'indefinite', possessor: canvases })).en).toBe("canvases' group.");
    expect(said(np('GROUP', { definiteness: 'indefinite', possessor: canvases, possessorRole: 'parts' }))).toEqual({
      en: 'a group of canvases.', it: 'un gruppo di tele.', fr: 'un groupe de canevas.',
      de: 'eine Gruppe von Arbeitsflächen.', es: 'un grupo de lienzos.', ja: 'キャンバスのグループ。', pt: 'um grupo de telas.',
    });
  });

  // The of-phrase trails the part, so the clitic of an owner above it would land on the whole.
  test('a part with its whole is post-modified for a possessor above it', () => {
    expect(said(np('NAME_NOUN', { possessor: whole('PART', { definiteness: 'indefinite' }, KEYBOARD) }))).toEqual({
      en: 'the name of a part of a keyboard.', it: 'il nome di una parte di una tastiera.', fr: "le nom d'une partie d'un clavier.",
      de: 'der Name eines Teiles einer Tastatur.', es: 'el nombre de una parte de un teclado.', ja: 'キーボードの部分の名前。', pt: 'o nome de uma parte de um teclado.',
    });
  });

  test('in an object slot', () => {
    const plan: PhrasePlan = {
      subject: np('CAT'), verbPhrase: { verb: 'SEE' },
      directObject: whole('PART', { definiteness: 'indefinite' }, np('KEYBOARD')),
    };
    expect(sayAll(plan)).toEqual({
      en: 'the cat sees a part of the keyboard.', it: 'il gatto vede una parte della tastiera.', fr: 'le chat voit une partie du clavier.',
      de: 'der Kater sieht einen Teil der Tastatur.', es: 'el gato ve una parte del teclado.', ja: '猫はキーボードの部分を見ます。', pt: 'o gato vê uma parte do teclado.',
    });
  });

  test('a pronominal possessor stays the possessive pronoun', () => {
    expect(said(np('PART', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'neut' }, possessorRole: 'whole' }))).toEqual({
      en: 'its part.', it: 'la sua parte.', fr: 'sa partie.', de: 'sein Teil.', es: 'su parte.', ja: 'その部分。', pt: 'a sua parte.',
    });
  });
});

describe('the words C26 seeded: a singular and a plural in every language', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // Feminine la fine / la fin, masculine el fin / o fim; German das Ende.
    ['END',
      { en: 'the end.', it: 'la fine.', fr: 'la fin.', de: 'das Ende.', es: 'el fin.', ja: '終わり。', pt: 'o fim.' },
      { en: 'the ends.', it: 'le fini.', fr: 'les fins.', de: 'die Enden.', es: 'los fines.', ja: '終わり。', pt: 'os fins.' }],
    // French corps and German Körper are the same word in the plural.
    ['BODY',
      { en: 'the body.', it: 'il corpo.', fr: 'le corps.', de: 'der Körper.', es: 'el cuerpo.', ja: '体。', pt: 'o corpo.' },
      { en: 'the bodies.', it: 'i corpi.', fr: 'les corps.', de: 'die Körper.', es: 'los cuerpos.', ja: '体。', pt: 'os corpos.' }],
    // A mass noun keeps the singular under a plural: no "woods", which is a forest.
    ['WOOD',
      { en: 'the wood.', it: 'il legno.', fr: 'le bois.', de: 'das Holz.', es: 'la madera.', ja: '木。', pt: 'a madeira.' },
      { en: 'the wood.', it: 'il legno.', fr: 'le bois.', de: 'das Holz.', es: 'la madera.', ja: '木。', pt: 'a madeira.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(np(concept))).toEqual(singular);
    expect(said(np(concept, { number: 'plural' }))).toEqual(plural);
  });
});

describe('the glosses C26 shipped', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // The part-whole relation: PART with its whole (partOfGloss).
    ['KEY', { en: 'a part of a keyboard.', it: 'una parte di una tastiera.', fr: "une partie d'un clavier.", de: 'ein Teil einer Tastatur.', es: 'una parte de un teclado.', ja: 'キーボードの部分。', pt: 'uma parte de um teclado.' }],
    ['ROW', { en: 'a part of a list.', it: 'una parte di un elenco.', fr: "une partie d'une liste.", de: 'ein Teil einer Liste.', es: 'una parte de una lista.', ja: '一覧の部分。', pt: 'uma parte de uma lista.' }],
    ['REGION', { en: 'a part of a screen.', it: 'una parte di uno schermo.', fr: "une partie d'un écran.", de: 'ein Teil eines Bildschirms.', es: 'una parte de una pantalla.', ja: '画面の部分。', pt: 'uma parte de uma tela.' }],
    ['ORGAN', { en: 'a part of a body.', it: 'una parte di un corpo.', fr: "une partie d'un corps.", de: 'ein Teil eines Körpers.', es: 'una parte de un cuerpo.', ja: '体の部分。', pt: 'uma parte de um corpo.' }],
    // The same relation on a definite head, with an adjective, a relative clause or another head.
    ['FLAME', { en: 'the visible part of a fire.', it: 'la parte visibile di un fuoco.', fr: "la partie visible d'un feu.", de: 'der sichtbare Teil eines Feuers.', es: 'la parte visible de un fuego.', ja: '火の可視の部分。', pt: 'a parte visível de um fogo.' }],
    ['DEATH', { en: 'the end of a life.', it: 'la fine di una vita.', fr: "la fin d'une vie.", de: 'das Ende eines Lebens.', es: 'el fin de una vida.', ja: '生命の終わり。', pt: 'o fim de uma vida.' }],
    ['BLADE', { en: 'the part of an object that cuts.', it: 'la parte di un oggetto che taglia.', fr: "la partie d'un objet qui coupe.", de: 'der Teil eines Gegenstands, der schneidet.', es: 'la parte de un objeto que corta.', ja: '切る物体の部分。', pt: 'a parte de um objeto que corta.' }],
    // Read from the whole: the canvases are the parts.
    ['WORKSPACE', { en: 'a group of canvases.', it: 'un gruppo di tele.', fr: 'un groupe de canevas.', de: 'eine Gruppe von Arbeitsflächen.', es: 'un grupo de lienzos.', ja: 'キャンバスのグループ。', pt: 'um grupo de telas.' }],
    // The instrument gap (instrumentGloss): the relativizer is the instrumental preposition's.
    ['EYE', { en: 'an organ with which one sees.', it: 'un organo con il quale si vede.', fr: 'un organe avec lequel on voit.', de: 'ein Organ, mit dem man sieht.', es: 'un órgano con el que se ve.', ja: '見る器官。', pt: 'um órgão com o qual se vê.' }],
    // A mass head, and an indefinite singular object ("se faz um objeto"; the plural agrees too since
    // A206, "se fazem objetos", but one object is what MATERIAL makes).
    ['MATERIAL', { en: 'substance with which one makes an object.', it: 'sostanza con la quale si fa un oggetto.', fr: 'substance avec laquelle on fait un objet.', de: 'Stoff, mit dem man einen Gegenstand macht.', es: 'sustancia con la que se hace un objeto.', ja: '物体を作る物質。', pt: 'substância com a qual se faz um objeto.' }],
    // A material noun modifier: Romance's "di"/"de", German's compound.
    ['STICK', { en: 'a wood object.', it: 'un oggetto di legno.', fr: 'un objet de bois.', de: 'ein Holzgegenstand.', es: 'un objeto de madera.', ja: '木の物体。', pt: 'um objeto de madeira.' }],
    // Relative clauses with a definite or an indefinite object, where whoGloss's is a bare plural.
    ['ARROW', { en: 'a key that moves the cursor.', it: 'un tasto che sposta il cursore.', fr: 'une touche qui déplace le curseur.', de: 'eine Taste, die den Cursor verschiebt.', es: 'una tecla que mueve el cursor.', ja: 'カーソルを移動するキー。', pt: 'uma tecla que move o cursor.' }],
    ['NAVIGATION', { en: 'an action that moves the cursor.', it: "un'azione che sposta il cursore.", fr: 'une action qui déplace le curseur.', de: 'eine Handlung, die den Cursor verschiebt.', es: 'una acción que mueve el cursor.', ja: 'カーソルを移動する動作。', pt: 'uma ação que move o cursor.' }],
    ['TAB', { en: 'a button that shows a region.', it: "un pulsante che mostra un'area.", fr: 'un bouton qui montre une zone.', de: 'eine Taste, die einen Bereich zeigt.', es: 'un botón que muestra una zona.', ja: '領域を見せるボタン。', pt: 'um botão que mostra uma área.' }],
    ['SCREEN', { en: 'an object that shows pictures.', it: 'un oggetto che mostra immagini.', fr: 'un objet qui montre des images.', de: 'ein Gegenstand, der Bilder zeigt.', es: 'un objeto que muestra imágenes.', ja: '画像を見せる物体。', pt: 'um objeto que mostra imagens.' }],
    // The two the relations did not reach, each on a verb seeded for it: LIVE_ALIVE, the *be alive*
    // sense of English "live" (the seeded LIVE dwells), and POUR, what one does to a liquid and not
    // to a gas.
    ['LIFE', { en: 'the state of a being that lives.', it: 'lo stato di un essere che vive.', fr: "l'état d'un être qui vit.", de: 'der Zustand eines Wesens, das lebt.', es: 'el estado de un ser que vive.', ja: '生きる存在の状態。', pt: 'o estado de um ser que vive.' }],
    ['LIQUID', { en: 'substance that one pours.', it: 'sostanza che si versa.', fr: "substance qu'on verse.", de: 'Stoff, den man gießt.', es: 'sustancia que se vierte.', ja: '注ぐ物質。', pt: 'substância que se verte.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});

// The two verbs seeded to finish C26: a present, a past and a compound tense in every language. The
// French vivre and the German gießen are irregular (vécut / vécu, goss / gegossen), Spanish verter
// diphthongs under the stress (vierte), and Italian vivere has a strong past (visse, vissuto).
describe('the verbs C26 seeded: LIVE_ALIVE and POUR', () => {
  const CAT = np('CAT');
  test.each<[string, Partial<PhrasePlan>, Record<LanguageCode, string>]>([
    ['LIVE_ALIVE, present', { verbPhrase: { verb: 'LIVE_ALIVE' } },
      { en: 'the cat lives.', it: 'il gatto vive.', fr: 'le chat vit.', de: 'der Kater lebt.', es: 'el gato vive.', ja: '猫は生きます。', pt: 'o gato vive.' }],
    ['LIVE_ALIVE, past', { verbPhrase: { verb: 'LIVE_ALIVE', tense: 'past' } },
      { en: 'the cat lived.', it: 'il gatto visse.', fr: 'le chat vécut.', de: 'der Kater lebte.', es: 'el gato vivió.', ja: '猫は生きました。', pt: 'o gato viveu.' }],
    ['LIVE_ALIVE, resultative', { verbPhrase: { verb: 'LIVE_ALIVE', aspect: 'resultative' } },
      { en: 'the cat has lived.', it: 'il gatto ha vissuto.', fr: 'le chat a vécu.', de: 'der Kater hat gelebt.', es: 'el gato ha vivido.', ja: '猫は生きました。', pt: 'o gato viveu.' }],
    ['POUR, present', { verbPhrase: { verb: 'POUR' }, directObject: np('WATER') },
      { en: 'the cat pours the water.', it: "il gatto versa l'acqua.", fr: "le chat verse l'eau.", de: 'der Kater gießt das Wasser.', es: 'el gato vierte el agua.', ja: '猫は水を注ぎます。', pt: 'o gato verte a água.' }],
    ['POUR, past', { verbPhrase: { verb: 'POUR', tense: 'past' }, directObject: np('WATER') },
      { en: 'the cat poured the water.', it: "il gatto versò l'acqua.", fr: "le chat versa l'eau.", de: 'der Kater goss das Wasser.', es: 'el gato vertió el agua.', ja: '猫は水を注ぎました。', pt: 'o gato verteu a água.' }],
    ['POUR, resultative', { verbPhrase: { verb: 'POUR', aspect: 'resultative' }, directObject: np('WATER') },
      { en: 'the cat has poured the water.', it: "il gatto ha versato l'acqua.", fr: "le chat a versé l'eau.", de: 'der Kater hat das Wasser gegossen.', es: 'el gato ha vertido el agua.', ja: '猫は水を注ぎました。', pt: 'o gato verteu a água.' }],
  ])('%s', (_, plan, rendered) => {
    expect(sayAll({ subject: CAT, ...plan } as PhrasePlan)).toEqual(rendered);
  });
});
