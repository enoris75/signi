import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// The sweep of 2026-09-22 (docs/localization, A23–A30 and B52–B58) glossed 105 concepts and seeded
// the 40 words the B half of them stood on. This file pins both halves: the new words' paradigms,
// and the glosses whose shape or agreement is worth a row of its own. The verbs' compound past is
// in verb.test.ts's Italian table and the adjectives' attributive form in adjectives.test.ts's
// EVERY_ADJECTIVE, where those exhaustive tables already live.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });

// ── The words (B52–B58) ───────────────────────────────────────────────

describe('the sweep\'s nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // B52. The genera the natural kinds hang under. French être and Italian essere are the copula's
    // own noun; German Wesen is the same word in the plural.
    ['BEING',
      { en: 'the being.', it: "l'essere.", fr: "l'être.", de: 'das Wesen.', es: 'el ser.', ja: '存在。', pt: 'o ser.' },
      { en: 'the beings.', it: 'gli esseri.', fr: 'les êtres.', de: 'die Wesen.', es: 'los seres.', ja: '存在。', pt: 'os seres.' }],
    ['ORGAN',
      { en: 'the organ.', it: "l'organo.", fr: "l'organe.", de: 'das Organ.', es: 'el órgano.', ja: '器官。', pt: 'o órgão.' },
      { en: 'the organs.', it: 'gli organi.', fr: 'les organes.', de: 'die Organe.', es: 'los órganos.', ja: '器官。', pt: 'os órgãos.' }],
    // The four mass words keep the singular under a plural determiner.
    ['MILK',
      { en: 'the milk.', it: 'il latte.', fr: 'le lait.', de: 'die Milch.', es: 'la leche.', ja: '乳。', pt: 'o leite.' },
      { en: 'the milk.', it: 'il latte.', fr: 'le lait.', de: 'die Milch.', es: 'la leche.', ja: '乳。', pt: 'o leite.' }],
    // herbe opens on an h muet, so French elides: l'herbe, not *la herbe.
    ['GRASS',
      { en: 'the grass.', it: "l'erba.", fr: "l'herbe.", de: 'das Gras.', es: 'la hierba.', ja: '草。', pt: 'a grama.' },
      { en: 'the grass.', it: "l'erba.", fr: "l'herbe.", de: 'das Gras.', es: 'la hierba.', ja: '草。', pt: 'a grama.' }],
    ['HEAT',
      { en: 'the heat.', it: 'il calore.', fr: 'la chaleur.', de: 'die Hitze.', es: 'el calor.', ja: '熱。', pt: 'o calor.' },
      { en: 'the heat.', it: 'il calore.', fr: 'la chaleur.', de: 'die Hitze.', es: 'el calor.', ja: '熱。', pt: 'o calor.' }],
    // œil is a vowel the first-letter test had to learn (the œ ligature), and yeux is its wholly
    // irregular plural.
    ['EYE',
      { en: 'the eye.', it: "l'occhio.", fr: "l'œil.", de: 'das Auge.', es: 'el ojo.', ja: '目。', pt: 'o olho.' },
      { en: 'the eyes.', it: 'gli occhi.', fr: 'les yeux.', de: 'die Augen.', es: 'los ojos.', ja: '目。', pt: 'os olhos.' }],
    // histoire is the other h muet of the pair.
    ['STORY',
      { en: 'the story.', it: 'la storia.', fr: "l'histoire.", de: 'die Geschichte.', es: 'la historia.', ja: '物語。', pt: 'a história.' },
      { en: 'the stories.', it: 'le storie.', fr: 'les histoires.', de: 'die Geschichten.', es: 'las historias.', ja: '物語。', pt: 'as histórias.' }],
    // B53. Italian takes lo/gli before s + consonant: lo stato, gli stati.
    ['SUBSTANCE',
      { en: 'the substance.', it: 'la sostanza.', fr: 'la substance.', de: 'der Stoff.', es: 'la sustancia.', ja: '物質。', pt: 'a substância.' },
      { en: 'the substance.', it: 'la sostanza.', fr: 'la substance.', de: 'der Stoff.', es: 'la sustancia.', ja: '物質。', pt: 'a substância.' }],
    ['STATE',
      { en: 'the state.', it: 'lo stato.', fr: "l'état.", de: 'der Zustand.', es: 'el estado.', ja: '状態。', pt: 'o estado.' },
      { en: 'the states.', it: 'gli stati.', fr: 'les états.', de: 'die Zustände.', es: 'los estados.', ja: '状態。', pt: 'os estados.' }],
    ['GAS',
      { en: 'the gas.', it: 'il gas.', fr: 'le gaz.', de: 'das Gas.', es: 'el gas.', ja: '気体。', pt: 'o gás.' },
      { en: 'the gas.', it: 'il gas.', fr: 'le gaz.', de: 'das Gas.', es: 'el gas.', ja: '気体。', pt: 'o gás.' }],
    // B54. The six dimensions the quality adjectives scale on. ATTENTION is 注目, not 注意: CARE
    // already holds 注意, and CAREFUL and INTERESTING would gloss alike in Japanese alone.
    ['JOY',
      { en: 'the joy.', it: 'la gioia.', fr: 'la joie.', de: 'die Freude.', es: 'la alegría.', ja: '喜び。', pt: 'a alegria.' },
      { en: 'the joy.', it: 'la gioia.', fr: 'la joie.', de: 'die Freude.', es: 'la alegría.', ja: '喜び。', pt: 'a alegria.' }],
    ['SORROW',
      { en: 'the sorrow.', it: 'la tristezza.', fr: 'la tristesse.', de: 'die Trauer.', es: 'la tristeza.', ja: '悲しみ。', pt: 'a tristeza.' },
      { en: 'the sorrow.', it: 'la tristezza.', fr: 'la tristesse.', de: 'die Trauer.', es: 'la tristeza.', ja: '悲しみ。', pt: 'a tristeza.' }],
    ['REST',
      { en: 'the rest.', it: 'il riposo.', fr: 'le repos.', de: 'die Ruhe.', es: 'el descanso.', ja: '休息。', pt: 'o descanso.' },
      { en: 'the rest.', it: 'il riposo.', fr: 'le repos.', de: 'die Ruhe.', es: 'el descanso.', ja: '休息。', pt: 'o descanso.' }],
    ['ATTENTION',
      { en: 'the attention.', it: "l'attenzione.", fr: "l'attention.", de: 'die Aufmerksamkeit.', es: 'la atención.', ja: '注目。', pt: 'a atenção.' },
      { en: 'the attention.', it: "l'attenzione.", fr: "l'attention.", de: 'die Aufmerksamkeit.', es: 'la atención.', ja: '注目。', pt: 'a atenção.' }],
    // Italian capacità is invariable, as every -tà noun is.
    ['ABILITY',
      { en: 'the ability.', it: 'la capacità.', fr: 'la capacité.', de: 'die Fähigkeit.', es: 'la capacidad.', ja: '能力。', pt: 'a capacidade.' },
      { en: 'the abilities.', it: 'le capacità.', fr: 'les capacités.', de: 'die Fähigkeiten.', es: 'las capacidades.', ja: '能力。', pt: 'as capacidades.' }],
    ['DUTY',
      { en: 'the duty.', it: 'il dovere.', fr: 'le devoir.', de: 'die Pflicht.', es: 'el deber.', ja: '義務。', pt: 'o dever.' },
      { en: 'the duties.', it: 'i doveri.', fr: 'les devoirs.', de: 'die Pflichten.', es: 'los deberes.', ja: '義務。', pt: 'os deveres.' }],
    // B56. The two genera COUNTRY and CONTINENT hang under.
    ['LAND',
      { en: 'the land.', it: 'la terra.', fr: 'la terre.', de: 'das Land.', es: 'la tierra.', ja: '陸地。', pt: 'a terra.' },
      { en: 'the land.', it: 'la terra.', fr: 'la terre.', de: 'das Land.', es: 'la tierra.', ja: '陸地。', pt: 'a terra.' }],
    ['NATION',
      { en: 'the nation.', it: 'la nazione.', fr: 'la nation.', de: 'die Nation.', es: 'la nación.', ja: '国民。', pt: 'a nação.' },
      { en: 'the nations.', it: 'le nazioni.', fr: 'les nations.', de: 'die Nationen.', es: 'las naciones.', ja: '国民。', pt: 'as nações.' }],
    // B57. Italian drops no vowel in the plural article: le immagini, not *l'immagini.
    ['PICTURE',
      { en: 'the picture.', it: "l'immagine.", fr: "l'image.", de: 'das Bild.', es: 'la imagen.', ja: '画像。', pt: 'a imagem.' },
      { en: 'the pictures.', it: 'le immagini.', fr: 'les images.', de: 'die Bilder.', es: 'las imágenes.', ja: '画像。', pt: 'as imagens.' }],
    ['SCREEN',
      { en: 'the screen.', it: 'lo schermo.', fr: "l'écran.", de: 'der Bildschirm.', es: 'la pantalla.', ja: '画面。', pt: 'a tela.' },
      { en: 'the screens.', it: 'gli schermi.', fr: 'les écrans.', de: 'die Bildschirme.', es: 'las pantallas.', ja: '画面。', pt: 'as telas.' }],
    ['PART',
      { en: 'the part.', it: 'la parte.', fr: 'la partie.', de: 'der Teil.', es: 'la parte.', ja: '部分。', pt: 'a parte.' },
      { en: 'the parts.', it: 'le parti.', fr: 'les parties.', de: 'die Teile.', es: 'las partes.', ja: '部分。', pt: 'as partes.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });
});

describe('the sweep\'s verbs: a present clause in every language', () => {
  test.each<[string, Record<LanguageCode, string>, string | undefined]>([
    ['FLY', { en: 'the man flies.', it: "l'uomo vola.", fr: "l'homme vole.", de: 'der Mann fliegt.', es: 'el hombre vuela.', ja: '男は飛びます。', pt: 'o homem voa.' }, undefined],
    // sprechen is a strong e → i verb in the third singular.
    ['SPEAK', { en: 'the man speaks.', it: "l'uomo parla.", fr: "l'homme parle.", de: 'der Mann spricht.', es: 'el hombre habla.', ja: '男は話します。', pt: 'o homem fala.' }, undefined],
    ['BREATHE', { en: 'the man breathes the air.', it: "l'uomo respira l'aria.", fr: "l'homme respire l'air.", de: 'der Mann atmet die Luft.', es: 'el hombre respira el aire.', ja: '男は空気を呼吸します。', pt: 'o homem respira o ar.' }, 'AIR'],
    ['EXCHANGE', { en: 'the man exchanges the money.', it: "l'uomo scambia il denaro.", fr: "l'homme échange l'argent.", de: 'der Mann tauscht das Geld.', es: 'el hombre intercambia el dinero.', ja: '男はお金を交換します。', pt: 'o homem troca o dinheiro.' }, 'MONEY'],
    ['ENCLOSE', { en: 'the man encloses the place.', it: "l'uomo racchiude il luogo.", fr: "l'homme entoure le lieu.", de: 'der Mann umschließt den Ort.', es: 'el hombre encierra el lugar.', ja: '男は場所を囲みます。', pt: 'o homem cerca o lugar.' }, 'PLACE'],
    ['HEAR', { en: 'the man hears the sound.', it: "l'uomo sente il suono.", fr: "l'homme entend le son.", de: 'der Mann hört das Geräusch.', es: 'el hombre oye el sonido.', ja: '男は音を聞きます。', pt: 'o homem ouve o som.' }, 'SOUND'],
    // Spanish and Portuguese take the personal a before a human object.
    ['GOVERN_STATE', { en: 'the man governs the nation.', it: "l'uomo governa la nazione.", fr: "l'homme gouverne la nation.", de: 'der Mann regiert die Nation.', es: 'el hombre gobierna a la nación.', ja: '男は国民を統治します。', pt: 'o homem governa a nação.' }, 'NATION'],
    ['ACCOMPANY', { en: 'the man accompanies the child.', it: "l'uomo accompagna il bambino.", fr: "l'homme accompagne l'enfant.", de: 'der Mann begleitet das Kind.', es: 'el hombre acompaña al niño.', ja: '男は子供を同行します。', pt: 'o homem acompanha a criança.' }, 'CHILD'],
    ['ANSWER', { en: 'the man answers the word.', it: "l'uomo risponde la parola.", fr: "l'homme répond le mot.", de: 'der Mann antwortet das Wort.', es: 'el hombre responde la palabra.', ja: '男は単語を答えます。', pt: 'o homem responde a palavra.' }, 'WORD'],
    // The English lemma is "seek": a result is what one seeks, and English "search" takes the place.
    ['SEARCH', { en: 'the man seeks the result.', it: "l'uomo cerca il risultato.", fr: "l'homme cherche le résultat.", de: 'der Mann sucht das Ergebnis.', es: 'el hombre busca el resultado.', ja: '男は結果を探します。', pt: 'o homem procura o resultado.' }, 'RESULT'],
    // anordnen is separable: the particle goes to the end of the clause.
    ['ARRANGE', { en: 'the man arranges the list.', it: "l'uomo dispone l'elenco.", fr: "l'homme dispose la liste.", de: 'der Mann ordnet die Liste an.', es: 'el hombre dispone la lista.', ja: '男は一覧を並べます。', pt: 'o homem dispõe a lista.' }, 'LIST'],
    ['CONNECT', { en: 'the man connects the node.', it: "l'uomo connette il nodo.", fr: "l'homme connecte le nœud.", de: 'der Mann verbindet den Knoten.', es: 'el hombre conecta el nodo.', ja: '男はノードを接続します。', pt: 'o homem conecta o nó.' }, 'NODE'],
  ])('%s', (verb, rendered, object) => {
    expect(sayAll(clause(np('MAN', { definiteness: 'definite' }), verb, object ? { directObject: np(object, { definiteness: 'definite' }) } : {}))).toEqual(rendered);
  });
});

// ── The glosses (A23–A30, B52–B58) ────────────────────────────────────

describe('the glosses the sweep shipped', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // A23. The object gap ("that one presses") and the locative one ("where one makes phrases").
    ['BUTTON', { en: 'an object that one presses.', it: 'un oggetto che si preme.', fr: "un objet qu'on presse.", de: 'ein Gegenstand, den man drückt.', es: 'un objeto que se pulsa.', ja: '押す物体。', pt: 'um objeto que se pressiona.' }],
    ['CANVAS', { en: 'a place where one makes phrases.', it: 'un luogo dove si fanno frasi.', fr: "un lieu où l'on fait des phrases.", de: 'ein Ort, an dem man Phrasen macht.', es: 'un lugar donde se hacen frases.', ja: 'フレーズを作る場所。', pt: 'um lugar onde se fazem frases.' }],
    // A24. The infinitive closes the German clause; the governed one takes Italian's "ad".
    ['DELETE', { en: 'to remove objects.', it: 'rimuovere oggetti.', fr: 'retirer des objets.', de: 'Gegenstände entfernen.', es: 'quitar objetos.', ja: '物体を取り除く。', pt: 'remover objetos.' }],
    ['ACQUIRE', { en: 'to begin to have.', it: 'iniziare ad avere.', fr: 'commencer à avoir.', de: 'beginnen zu haben.', es: 'empezar a tener.', ja: '持つことが始まる。', pt: 'começar a ter.' }],
    // A25. The negation sits inside the governed infinitive, not on the causative verb.
    ['TURN_OFF', { en: 'to cause an object not to be active.', it: 'indurre un oggetto a non essere attivo.', fr: 'induire un objet à ne pas être actif.', de: 'einen Gegenstand veranlassen, nicht aktiv zu sein.', es: 'inducir un objeto a no estar activo.', ja: '物体が稼働中ではないようにする。', pt: 'induzir um objeto a não estar ativo.' }],
    // A26. A mass head takes the bare determiner: "liquid", not *"a liquid".
    ['WATER', { en: 'liquid that one drinks.', it: 'liquido che si beve.', fr: "liquide qu'on boit.", de: 'Flüssigkeit, die man trinkt.', es: 'líquido que se bebe.', ja: '飲む液体。', pt: 'líquido que se bebe.' }],
    // A27. The pair that tells a subject from an object: the subject governs the verb, the verb
    // governs the object. German shows the case on the relative pronoun — der against den.
    ['SUBJECT_GRAMMAR', { en: 'a participant that governs verbs.', it: 'un partecipante che regge verbi.', fr: 'un participant qui régit des verbes.', de: 'ein Partizipant, der Verben regiert.', es: 'un participante que rige verbos.', ja: '動詞を支配する参与者。', pt: 'um participante que rege verbos.' }],
    ['OBJECT_GRAMMAR', { en: 'a participant that a verb governs.', it: 'un partecipante che un verbo regge.', fr: "un participant qu'un verbe régit.", de: 'ein Partizipant, den ein Verb regiert.', es: 'un participante que un verbo rige.', ja: '動詞が支配する参与者。', pt: 'um participante que um verbo rege.' }],
    // A28. The low pole of BIG's scale, on the degree word LOW rather than on SMALL itself.
    ['SMALL', { en: 'of low size.', it: 'di dimensione bassa.', fr: 'de taille basse.', de: 'von niedriger Größe.', es: 'de tamaño bajo.', ja: '大きさが低い。', pt: 'de tamanho baixo.' }],
    // A29. The first deictic determiner in a definition: this time, not the time.
    ['NOW', { en: 'at this time.', it: 'a questo tempo.', fr: 'à ce temps.', de: 'zu dieser Zeit.', es: 'a este tiempo.', ja: 'この時間で。', pt: 'a este tempo.' }],
    // A30. The German bare-plural object sits before its clause-final verb.
    ['TENSE', { en: 'a feature that indicates times.', it: 'una caratteristica che indica tempi.', fr: 'une caractéristique qui indique des temps.', de: 'ein Merkmal, das Zeiten bezeichnet.', es: 'una característica que indica tiempos.', ja: '時間を示す特徴。', pt: 'uma característica que indica tempos.' }],
    ['GENDER', { en: 'a category that governs words.', it: 'una categoria che regge parole.', fr: 'une catégorie qui régit des mots.', de: 'eine Kategorie, die Wörter regiert.', es: 'una categoría que rige palabras.', ja: '単語を支配する範疇。', pt: 'uma categoria que rege palavras.' }],
    // B52. A mass object stays singular under a bare determiner: milk, not *milks.
    ['MAMMAL', { en: 'an animal that produces milk.', it: 'un animale che produce latte.', fr: 'un animal qui produit du lait.', de: 'ein Tier, das Milch erzeugt.', es: 'un animal que produce leche.', ja: '乳を出す動物。', pt: 'um animal que produz leite.' }],
    // Two stacked adjectives, which the Romance languages coordinate: freddo e dolce.
    ['ICE_CREAM', { en: 'cold sweet food.', it: 'cibo freddo e dolce.', fr: 'de la nourriture froide et sucrée.', de: 'kaltes süßes Essen.', es: 'comida fría y dulce.', ja: '冷たい甘い食べ物。', pt: 'comida fria e doce.' }],
    // An object gap with a source complement, and the French elision the œ ligature needed.
    ['TEAR', { en: 'liquid that one sheds from the eye.', it: "liquido che si versa dall'occhio.", fr: "liquide qu'on verse de l'œil.", de: 'Flüssigkeit, die man aus dem Auge vergießt.', es: 'líquido que se derrama del ojo.', ja: '目から流す液体。', pt: 'líquido que se derrama do olho.' }],
    // B53. STATE is the parent C05 was missing for FEELING: a feeling is a state, not a concept.
    ['FEELING', { en: 'a state that one feels.', it: 'uno stato che si prova.', fr: "un état qu'on éprouve.", de: 'ein Zustand, den man fühlt.', es: 'un estado que se siente.', ja: '感じる状態。', pt: 'um estado que se sente.' }],
    // ENCLOSE pays for itself twice, and neither language jails its phrases the way CONFINE would.
    ['WALL', { en: 'an object that encloses places.', it: 'un oggetto che racchiude luoghi.', fr: 'un objet qui entoure des lieux.', de: 'ein Gegenstand, der Orte umschließt.', es: 'un objeto que encierra lugares.', ja: '場所を囲む物体。', pt: 'um objeto que cerca lugares.' }],
    ['BRACKET', { en: 'a word that encloses phrases.', it: 'una parola che racchiude frasi.', fr: 'un mot qui entoure des phrases.', de: 'ein Wort, das Phrasen umschließt.', es: 'una palabra que encierra frases.', ja: 'フレーズを囲む単語。', pt: 'uma palavra que cerca frases.' }],
    // B54. The dative the German "of" relation governs, and the Japanese topic.
    ['HAPPY', { en: 'of high joy.', it: 'di gioia alta.', fr: 'de joie haute.', de: 'von hoher Freude.', es: 'de alegría alta.', ja: '喜びが高い。', pt: 'de alegria alta.' }],
    ['TIRED', { en: 'of low rest.', it: 'di riposo basso.', fr: 'de repos bas.', de: 'von niedriger Ruhe.', es: 'de descanso bajo.', ja: '休息が低い。', pt: 'de descanso baixo.' }],
    // The pair ATTENTION was seeded to keep apart: without it both read 注目/注意 alike in Japanese.
    ['INTERESTING', { en: 'of high attention.', it: 'di attenzione alta.', fr: "d'attention haute.", de: 'von hoher Aufmerksamkeit.', es: 'de atención alta.', ja: '注目が高い。', pt: 'de atenção alta.' }],
    ['CAREFUL', { en: 'of high care.', it: 'di cura alta.', fr: 'de soin haut.', de: 'von hoher Sorgfalt.', es: 'de cuidado alto.', ja: '注意が高い。', pt: 'de cuidado alto.' }],
    // B55. AGAIN's shape with PREVIOUS in place of OTHER — the adverb A29 could not ship.
    ['ALREADY', { en: 'at a previous time.', it: 'a un tempo precedente.', fr: 'à un temps précédent.', de: 'zu einer vorherigen Zeit.', es: 'a un tiempo anterior.', ja: '前の時間で。', pt: 'a um tempo anterior.' }],
    // B56. An object gap whose agent is named rather than generic, on a mass head.
    ['COUNTRY', { en: 'land that a nation governs.', it: 'terra che una nazione governa.', fr: "terre qu'une nation gouverne.", de: 'Land, das eine Nation regiert.', es: 'tierra que una nación gobierna.', ja: '国民が統治する陸地。', pt: 'terra que uma nação governa.' }],
    ['CONTINENT', { en: 'great land.', it: 'grande terra.', fr: 'grande terre.', de: 'großes Land.', es: 'tierra grande.', ja: '大きい陸地。', pt: 'terra grande.' }],
    // B57. The plainest whoGloss, and three heads this ticket glosses itself.
    ['SPEAKER', { en: 'a person who speaks.', it: 'una persona che parla.', fr: 'une personne qui parle.', de: 'eine Person, die spricht.', es: 'una persona que habla.', ja: '話す人。', pt: 'uma pessoa que fala.' }],
    ['TOOLBAR', { en: 'a row that has buttons.', it: 'una riga che ha pulsanti.', fr: 'une ligne qui a des boutons.', de: 'eine Zeile, die Tasten hat.', es: 'una fila que tiene botones.', ja: 'ボタンがある行。', pt: 'uma linha que tem botões.' }],
    ['MAP', { en: 'a picture that shows places.', it: "un'immagine che mostra luoghi.", fr: 'une image qui montre des lieux.', de: 'ein Bild, das Orte zeigt.', es: 'una imagen que muestra lugares.', ja: '場所を見せる画像。', pt: 'uma imagem que mostra lugares.' }],
    // A keyboard has keys; it does not type them, which is what the instrument gap would have said.
    ['KEYBOARD', { en: 'an object that has keys.', it: 'un oggetto che ha tasti.', fr: 'un objet qui a des touches.', de: 'ein Gegenstand, der Tasten hat.', es: 'un objeto que tiene teclas.', ja: 'キーがある物体。', pt: 'um objeto que tem teclas.' }],
    // B58. The strong adjective ending after the German indefinite article.
    ['PAST_TENSE', { en: 'a past tense.', it: 'un tempo passato.', fr: 'un temps passé.', de: 'ein vergangenes Tempus.', es: 'un tiempo pasado.', ja: '過去の時制。', pt: 'um tempo passado.' }],
    // SOLE and MANIFOLD, not SINGULAR and PLURAL, which would define the word with itself.
    ['PLURAL_GRAMMAR', { en: 'a manifold category.', it: 'una categoria molteplice.', fr: 'une catégorie multiple.', de: 'eine mehrfache Kategorie.', es: 'una categoría múltiple.', ja: '複数の範疇。', pt: 'uma categoria múltipla.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});

// The property the whole catalogue exists for: a tooltip that reads the same as its neighbour's
// tells the two apart for nobody. Two concepts may share a gloss only by design — a second sense
// of one word (COLD/COLD_CLIMATE), or two words this corpus genuinely cannot separate — and each
// such pair is listed here with its reason. Anything else is a gloss that needs a differentia.
// It caught two on the day it was written: SHRINK restating COMPACT's causative, and SPECIFY
// restating EXPRESS's "to indicate concepts". Both were dropped rather than shipped.
const GLOSSES_SHARED_BY_DESIGN: [string, string, string][] = [
  ['CAT', 'MOUSE', 'both are small mammals; SIZE is the only dimension the corpus has for them'],
  ['BOY', 'YOUNG_MAN', 'the two ages of a young male person differ by a degree no adjective carries'],
  ['BUILDER', 'CREATOR', 'a builder makes objects; what narrows it is the building, which is not the object'],
  ['COLD', 'COLD_CLIMATE', 'B48 split the sense, not the gloss: both are at low temperature'],
  ['HOT', 'HOT_CLIMATE', 'B48 again, the other pole'],
];

describe('no two concepts are glossed alike', () => {
  const allowed = new Set(GLOSSES_SHARED_BY_DESIGN.map(([a, b]) => [a, b].sort().join(' = ')));

  test.each(Object.keys(LANGUAGES) as LanguageCode[])('%s', (language) => {
    const byText = new Map<string, string[]>();
    for (const c of concepts) {
      if (!c.definition) continue;
      const text = translate(c.definition, lookupLexicalEntry).find((t) => t.language === language)?.text;
      expect(text, `${c.id} did not render in ${language}`).toBeTruthy();
      byText.set(text!, [...(byText.get(text!) ?? []), c.id]);
    }
    const collisions = [...byText.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([text, ids]) => `${ids.sort().join(' = ')} → "${text}"`)
      .filter((line) => !allowed.has(line.slice(0, line.indexOf(' → '))));
    expect(collisions).toEqual([]);
  });
});
