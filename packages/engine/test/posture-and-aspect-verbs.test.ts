import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan, ReadyLanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// docs/localization B83, B84 and B86: the E24 body verbs (SIT_DOWN, STAND_UP, WALK, RUN_AWAY, LEAD,
// HOLD_GRASP), the verbs of ending and going on (STOP, STOP_ONESELF, WAIT, DIE, CONTINUE) and the
// verbs of the mind (MEET, REMEMBER, CONSIDER). This file pins each new word's paradigm and every
// gloss the three tickets shipped, and the NO_LONGER fix B84 needed first.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}
const seed = (id: string) => concepts.find((c) => c.id === id);

// An infinitive citation, "to run…", the shape a verb's definition takes: its subject the throwaway
// the mood leaves unsaid.
const inf = (verbPhrase: PhrasePlan['verbPhrase'], rest: Partial<PhrasePlan> = {}): PhrasePlan =>
  ({ subject: { concept: 'GENERIC_PERSON' }, verbPhrase, ...rest, infinitive: true });

const the = (concept: string, extra: Parameters<typeof np>[1] = {}) => np(concept, { definiteness: 'definite', ...extra });
const command = (verb: string, extra: Parameters<typeof clause>[2] = {}): PhrasePlan =>
  ({ ...clause(np('SECOND_PERSON'), verb, extra), imperative: true });

// ── NO_LONGER where the clause writes its own negator (B84 reading 1) ─────

// Spanish *ya no* and Portuguese *já não* are the negator with a word in front. A finite clause
// fronts them in place of its "no" ("el gato ya no corre"); an infinitive, a command and the group a
// modal governs wrote the negator and then the adverb, saying it twice: *no correr ya no*. The lexeme
// names the leading word (`negator_lead`), which now stands in front of the negator instead.
describe('NO_LONGER leads the negator it carries (es, pt)', () => {
  test.each<[string, PhrasePlan, string, string]>([
    ['an infinitive', inf({ verb: 'RUN', modifier: 'NO_LONGER' }), 'ya no correr.', 'já não correr.'],
    ['an infinitive with an object', inf({ verb: 'EAT', modifier: 'NO_LONGER' }, { directObject: { concept: 'FOOD', definiteness: 'bare' } }), 'ya no comer comida.', 'já não comer comida.'],
    ['an infinitive with a pronoun object', inf({ verb: 'EAT', modifier: 'NO_LONGER' }, { directObject: { concept: 'THIRD_PERSON', definiteness: 'bare', antecedent: 'FOOD' } }), 'ya no comerla.', 'já não a comer.'],
    ['a reflexive infinitive', inf({ verb: 'MOVE_ONESELF', modifier: 'NO_LONGER' }), 'ya no moverse.', 'já não se mover.'],
    ['a caused clause', inf({ verb: 'CAUSE_VERB' }, { directObject: { concept: 'PERSON', definiteness: 'indefinite' }, infinitiveComplement: { verbPhrase: { verb: 'RUN', modifier: 'NO_LONGER' }, control: 'object' } }), 'inducir a una persona a ya no correr.', 'induzir uma pessoa a já não correr.'],
    ['a purpose clause', inf({ verb: 'EAT' }, { directObject: { concept: 'FOOD', definiteness: 'bare' }, purpose: { verbPhrase: { verb: 'RUN', modifier: 'NO_LONGER' } } }), 'comer comida para ya no correr.', 'comer comida para já não correr.'],
    ['a command', command('RUN', { verbPhrase: { modifier: 'NO_LONGER' } }), 'ya no corras.', 'já não corra.'],
    ['the group a modal governs', clause(the('CAT'), 'RUN', { verbPhrase: { modifier: 'NO_LONGER', modals: ['CAN'] } }), 'el gato puede ya no correr.', 'o gato pode já não correr.'],
  ])('%s', (_, plan, es, pt) => {
    expect(say(plan, 'es')).toBe(es);
    expect(say(plan, 'pt')).toBe(pt);
  });

  // What did not change: the finite clause already fronted it, and NEVER, which is a word of its own,
  // still trails the negated infinitive and command.
  test('the finite clause, and NEVER', () => {
    expect(say(clause(the('CAT'), 'RUN', { verbPhrase: { modifier: 'NO_LONGER' } }), 'es')).toBe('el gato ya no corre.');
    expect(say(clause(the('CAT'), 'RUN', { verbPhrase: { modifier: 'NO_LONGER', tense: 'past' } }), 'pt')).toBe('o gato já não correu.');
    expect(say(inf({ verb: 'RUN', modifier: 'NEVER' }), 'es')).toBe('no correr nunca.');
    expect(say(inf({ verb: 'RUN', modifier: 'NEVER' }), 'pt')).toBe('não correr nunca.');
    expect(say(command('RUN', { verbPhrase: { modifier: 'NEVER' } }), 'es')).toBe('no corras nunca.');
  });
});

// ── The glosses ───────────────────────────────────────────────────────

describe('the glosses', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    // B83. LEAVE_DEPART with FAST, as RUN is "to move fast".
    ['RUN_AWAY', { en: 'to leave fast.', it: 'partire velocemente.', fr: 'partir vite.', de: 'schnell weggehen.', es: 'partir rápido.', ja: '速く出発する。', pt: 'partir rapidamente.' }],
    // C08's causative on GO, with the goal inside the caused clause.
    ['LEAD', { en: 'to cause a person to go to a place.', it: 'indurre una persona ad andare a un luogo.', fr: 'induire une personne à aller à un lieu.', de: 'eine Person veranlassen, zu einem Ort zu gehen.', es: 'inducir a una persona a ir a un lugar.', ja: '人が場所へ行くようにする。', pt: 'induzir uma pessoa a ir a um lugar.' }],
    // HAVE with the place it is had, on B65's HAND.
    ['HOLD_GRASP', { en: 'to have an object in the hand.', it: 'avere un oggetto nella mano.', fr: 'avoir un objet dans la main.', de: 'einen Gegenstand in der Hand haben.', es: 'tener un objeto en la mano.', ja: '手で物体を持つ。', pt: 'ter um objeto na mão.' }],
    // B84. The three NO_LONGER glosses, which now say their Spanish and Portuguese negator once.
    ['STOP', { en: 'to cause an object no longer to move.', it: 'indurre un oggetto a non muoversi più.', fr: 'induire un objet à ne plus se déplacer.', de: 'einen Gegenstand veranlassen, sich nicht mehr zu bewegen.', es: 'inducir un objeto a ya no moverse.', ja: '物体がもう移動しないようにする。', pt: 'induzir um objeto a já não se mover.' }],
    ['STOP_ONESELF', { en: 'no longer to move.', it: 'non muoversi più.', fr: 'ne plus se déplacer.', de: 'sich nicht mehr bewegen.', es: 'ya no moverse.', ja: 'もう移動しない。', pt: 'já não se mover.' }],
    ['DIE', { en: 'no longer to live.', it: 'non vivere più.', fr: 'ne plus vivre.', de: 'nicht mehr leben.', es: 'ya no vivir.', ja: 'もう生きない。', pt: 'já não viver.' }],
    // C29's `until` on TIME, under STAY.
    ['WAIT', { en: 'to stay until a time.', it: 'restare fino a un tempo.', fr: "rester jusqu'à un temps.", de: 'bis zu einer Zeit bleiben.', es: 'quedarse hasta un tiempo.', ja: '時間まで残る。', pt: 'ficar até um tempo.' }],
    // KEEP's shape ("still to have objects") on DO.
    ['CONTINUE', { en: 'still to do an action.', it: "fare ancora un'azione.", fr: 'faire encore une action.', de: 'noch eine Handlung tun.', es: 'hacer todavía una acción.', ja: '動作をまだする。', pt: 'fazer ainda uma ação.' }],
    // B86. KEEP's shape on KNOW, whose noun object selects its acquaintance sense (A131).
    ['REMEMBER', { en: 'still to know facts.', it: 'conoscere ancora fatti.', fr: 'connaître encore des faits.', de: 'noch Tatsachen kennen.', es: 'conocer todavía hechos.', ja: '事実をまだ知る。', pt: 'conhecer ainda fatos.' }],
    // THINK with E2's topic, whose prepositions are THINK's own.
    ['CONSIDER', { en: 'to think about a thing.', it: 'pensare a una cosa.', fr: 'penser à une chose.', de: 'an ein Ding denken.', es: 'pensar en una cosa.', ja: 'ものについて考える。', pt: 'pensar em uma coisa.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // B83 readings 2 and 3, B86 reading 3: no gloss that tells them apart can be composed yet.
  test.each(['SIT_DOWN', 'STAND_UP', 'WALK', 'MEET'])('%s stays on the literal', (id) => {
    expect(seed(id)?.definition).toBeUndefined();
  });
});

// ── The words ─────────────────────────────────────────────────────────

describe('where the words hang, and what the picker says beside them', () => {
  test('isA', () => {
    const isA = (id: string) => seed(id)?.isA;
    expect(['RUN_AWAY', 'WALK', 'SIT_DOWN', 'STAND_UP', 'HOLD_GRASP', 'WAIT', 'CONTINUE', 'REMEMBER', 'CONSIDER'].map(isA))
      .toEqual(['LEAVE_DEPART', 'GO', 'MOVE_ONESELF', 'MOVE_ONESELF', 'HAVE', 'STAY', 'DO', 'KNOW', 'THINK']);
  });

  // English has two "hold", three "stop" and two "continue" now.
  test('synonyms', () => {
    const synonym = (id: string) => seed(id)?.synonym;
    expect(['HOLD', 'HOLD_GRASP', 'STOP', 'STOP_ONESELF', 'STOP_DOING', 'CONTINUE', 'CONTINUE_DOING', 'RUN_AWAY', 'LEAD'].map(synonym))
      .toEqual(['contain', 'grasp', 'halt', 'come to a halt', 'cease', 'carry on', 'go on', 'flee', 'guide']);
  });
});

// Present, simple past, resultative (a feminine subject, for the Romance agreement), future and
// negation, for every new verb.
describe('persons, tenses and aspects', () => {
  test.each<[string, string | undefined, Record<ReadyLanguageCode, string>[]]>([
    ['SIT_DOWN', undefined, [
      { en: 'the woman sits down.', it: 'la donna si siede.', fr: "la femme s'assied.", de: 'die Frau setzt sich.', es: 'la mujer se sienta.', ja: '女は座ります。', pt: 'a mulher se senta.' },
      { en: 'the woman sat down.', it: 'la donna si sedette.', fr: "la femme s'assit.", de: 'die Frau setzte sich.', es: 'la mujer se sentó.', ja: '女は座りました。', pt: 'a mulher se sentou.' },
      { en: 'the cat has sat down.', it: 'la gatta si è seduta.', fr: "la chatte s'est assise.", de: 'die Katze hat sich gesetzt.', es: 'la gata se ha sentado.', ja: '猫は座りました。', pt: 'a gata se sentou.' },
      { en: 'the men will sit down.', it: 'gli uomini si siederanno.', fr: "les hommes s'assiéront.", de: 'die Männer werden sich setzen.', es: 'los hombres se sentarán.', ja: '男は座ります。', pt: 'os homens se sentarão.' },
      { en: 'the man does not sit down.', it: "l'uomo non si siede.", fr: "l'homme ne s'assied pas.", de: 'der Mann setzt sich nicht.', es: 'el hombre no se sienta.', ja: '男は座りません。', pt: 'o homem não se senta.' },
    ]],
    ['STAND_UP', undefined, [
      { en: 'the woman stands up.', it: 'la donna si alza.', fr: 'la femme se lève.', de: 'die Frau steht auf.', es: 'la mujer se levanta.', ja: '女は立ちます。', pt: 'a mulher se levanta.' },
      { en: 'the woman stood up.', it: 'la donna si alzò.', fr: 'la femme se leva.', de: 'die Frau stand auf.', es: 'la mujer se levantó.', ja: '女は立ちました。', pt: 'a mulher se levantou.' },
      { en: 'the cat has stood up.', it: 'la gatta si è alzata.', fr: "la chatte s'est levée.", de: 'die Katze ist aufgestanden.', es: 'la gata se ha levantado.', ja: '猫は立ちました。', pt: 'a gata se levantou.' },
      { en: 'the men will stand up.', it: 'gli uomini si alzeranno.', fr: 'les hommes se lèveront.', de: 'die Männer werden aufstehen.', es: 'los hombres se levantarán.', ja: '男は立ちます。', pt: 'os homens se levantarão.' },
      { en: 'the man does not stand up.', it: "l'uomo non si alza.", fr: "l'homme ne se lève pas.", de: 'der Mann steht nicht auf.', es: 'el hombre no se levanta.', ja: '男は立ちません。', pt: 'o homem não se levanta.' },
    ]],
    ['WALK', undefined, [
      { en: 'the woman walks.', it: 'la donna cammina.', fr: 'la femme marche.', de: 'die Frau geht zu Fuß.', es: 'la mujer camina.', ja: '女は歩きます。', pt: 'a mulher caminha.' },
      { en: 'the woman walked.', it: 'la donna camminò.', fr: 'la femme marcha.', de: 'die Frau ging zu Fuß.', es: 'la mujer caminó.', ja: '女は歩きました。', pt: 'a mulher caminhou.' },
      { en: 'the cat has walked.', it: 'la gatta ha camminato.', fr: 'la chatte a marché.', de: 'die Katze ist zu Fuß gegangen.', es: 'la gata ha caminado.', ja: '猫は歩きました。', pt: 'a gata caminhou.' },
      { en: 'the men will walk.', it: 'gli uomini cammineranno.', fr: 'les hommes marcheront.', de: 'die Männer werden zu Fuß gehen.', es: 'los hombres caminarán.', ja: '男は歩きます。', pt: 'os homens caminharão.' },
      { en: 'the man does not walk.', it: "l'uomo non cammina.", fr: "l'homme ne marche pas.", de: 'der Mann geht nicht zu Fuß.', es: 'el hombre no camina.', ja: '男は歩きません。', pt: 'o homem não caminha.' },
    ]],
    ['RUN_AWAY', undefined, [
      { en: 'the woman runs away.', it: 'la donna scappa.', fr: "la femme s'enfuit.", de: 'die Frau läuft weg.', es: 'la mujer huye.', ja: '女は逃げます。', pt: 'a mulher foge.' },
      { en: 'the woman ran away.', it: 'la donna scappò.', fr: "la femme s'enfuit.", de: 'die Frau lief weg.', es: 'la mujer huyó.', ja: '女は逃げました。', pt: 'a mulher fugiu.' },
      { en: 'the cat has run away.', it: 'la gatta è scappata.', fr: "la chatte s'est enfuie.", de: 'die Katze ist weggelaufen.', es: 'la gata ha huido.', ja: '猫は逃げました。', pt: 'a gata fugiu.' },
      { en: 'the men will run away.', it: 'gli uomini scapperanno.', fr: "les hommes s'enfuiront.", de: 'die Männer werden weglaufen.', es: 'los hombres huirán.', ja: '男は逃げます。', pt: 'os homens fugirão.' },
      { en: 'the man does not run away.', it: "l'uomo non scappa.", fr: "l'homme ne s'enfuit pas.", de: 'der Mann läuft nicht weg.', es: 'el hombre no huye.', ja: '男は逃げません。', pt: 'o homem não foge.' },
    ]],
    ['LEAD', 'MAN', [
      { en: 'the woman leads the man.', it: "la donna conduce l'uomo.", fr: "la femme mène l'homme.", de: 'die Frau führt den Mann.', es: 'la mujer guía al hombre.', ja: '女は男を導きます。', pt: 'a mulher conduz o homem.' },
      { en: 'the woman led the man.', it: "la donna condusse l'uomo.", fr: "la femme mena l'homme.", de: 'die Frau führte den Mann.', es: 'la mujer guio al hombre.', ja: '女は男を導きました。', pt: 'a mulher conduziu o homem.' },
      { en: 'the cat has led the man.', it: "la gatta ha condotto l'uomo.", fr: "la chatte a mené l'homme.", de: 'die Katze hat den Mann geführt.', es: 'la gata ha guiado al hombre.', ja: '猫は男を導きました。', pt: 'a gata conduziu o homem.' },
      { en: 'the men will lead the man.', it: "gli uomini condurranno l'uomo.", fr: "les hommes mèneront l'homme.", de: 'die Männer werden den Mann führen.', es: 'los hombres guiarán al hombre.', ja: '男は男を導きます。', pt: 'os homens conduzirão o homem.' },
      { en: 'the man does not lead the man.', it: "l'uomo non conduce l'uomo.", fr: "l'homme ne mène pas l'homme.", de: 'der Mann führt den Mann nicht.', es: 'el hombre no guía al hombre.', ja: '男は男を導きません。', pt: 'o homem não conduz o homem.' },
    ]],
    ['HOLD_GRASP', 'BOOK', [
      { en: 'the woman holds the book.', it: 'la donna tiene il libro.', fr: 'la femme tient le livre.', de: 'die Frau hält das Buch.', es: 'la mujer sostiene el libro.', ja: '女は本を握ります。', pt: 'a mulher segura o livro.' },
      { en: 'the woman held the book.', it: 'la donna tenne il libro.', fr: 'la femme tint le livre.', de: 'die Frau hielt das Buch.', es: 'la mujer sostuvo el libro.', ja: '女は本を握りました。', pt: 'a mulher segurou o livro.' },
      { en: 'the cat has held the book.', it: 'la gatta ha tenuto il libro.', fr: 'la chatte a tenu le livre.', de: 'die Katze hat das Buch gehalten.', es: 'la gata ha sostenido el libro.', ja: '猫は本を握りました。', pt: 'a gata segurou o livro.' },
      { en: 'the men will hold the book.', it: 'gli uomini terranno il libro.', fr: 'les hommes tiendront le livre.', de: 'die Männer werden das Buch halten.', es: 'los hombres sostendrán el libro.', ja: '男は本を握ります。', pt: 'os homens segurarão o livro.' },
      { en: 'the man does not hold the book.', it: "l'uomo non tiene il libro.", fr: "l'homme ne tient pas le livre.", de: 'der Mann hält das Buch nicht.', es: 'el hombre no sostiene el libro.', ja: '男は本を握りません。', pt: 'o homem não segura o livro.' },
    ]],
    ['STOP', 'BOOK', [
      { en: 'the woman stops the book.', it: 'la donna ferma il libro.', fr: 'la femme arrête le livre.', de: 'die Frau hält das Buch an.', es: 'la mujer detiene el libro.', ja: '女は本を止めます。', pt: 'a mulher para o livro.' },
      { en: 'the woman stopped the book.', it: 'la donna fermò il libro.', fr: 'la femme arrêta le livre.', de: 'die Frau hielt das Buch an.', es: 'la mujer detuvo el libro.', ja: '女は本を止めました。', pt: 'a mulher parou o livro.' },
      { en: 'the cat has stopped the book.', it: 'la gatta ha fermato il libro.', fr: 'la chatte a arrêté le livre.', de: 'die Katze hat das Buch angehalten.', es: 'la gata ha detenido el libro.', ja: '猫は本を止めました。', pt: 'a gata parou o livro.' },
      { en: 'the men will stop the book.', it: 'gli uomini fermeranno il libro.', fr: 'les hommes arrêteront le livre.', de: 'die Männer werden das Buch anhalten.', es: 'los hombres detendrán el libro.', ja: '男は本を止めます。', pt: 'os homens pararão o livro.' },
      { en: 'the man does not stop the book.', it: "l'uomo non ferma il libro.", fr: "l'homme n'arrête pas le livre.", de: 'der Mann hält das Buch nicht an.', es: 'el hombre no detiene el libro.', ja: '男は本を止めません。', pt: 'o homem não para o livro.' },
    ]],
    ['STOP_ONESELF', undefined, [
      { en: 'the woman stops.', it: 'la donna si ferma.', fr: "la femme s'arrête.", de: 'die Frau bleibt stehen.', es: 'la mujer se detiene.', ja: '女は止まります。', pt: 'a mulher para.' },
      { en: 'the woman stopped.', it: 'la donna si fermò.', fr: "la femme s'arrêta.", de: 'die Frau blieb stehen.', es: 'la mujer se detuvo.', ja: '女は止まりました。', pt: 'a mulher parou.' },
      { en: 'the cat has stopped.', it: 'la gatta si è fermata.', fr: "la chatte s'est arrêtée.", de: 'die Katze ist stehen geblieben.', es: 'la gata se ha detenido.', ja: '猫は止まりました。', pt: 'a gata parou.' },
      { en: 'the men will stop.', it: 'gli uomini si fermeranno.', fr: "les hommes s'arrêteront.", de: 'die Männer werden stehen bleiben.', es: 'los hombres se detendrán.', ja: '男は止まります。', pt: 'os homens pararão.' },
      { en: 'the man does not stop.', it: "l'uomo non si ferma.", fr: "l'homme ne s'arrête pas.", de: 'der Mann bleibt nicht stehen.', es: 'el hombre no se detiene.', ja: '男は止まりません。', pt: 'o homem não para.' },
    ]],
    ['WAIT', 'MAN', [
      { en: 'the woman waits for the man.', it: "la donna aspetta l'uomo.", fr: "la femme attend l'homme.", de: 'die Frau wartet auf den Mann.', es: 'la mujer espera al hombre.', ja: '女は男を待ちます。', pt: 'a mulher espera o homem.' },
      { en: 'the woman waited for the man.', it: "la donna aspettò l'uomo.", fr: "la femme attendit l'homme.", de: 'die Frau wartete auf den Mann.', es: 'la mujer esperó al hombre.', ja: '女は男を待ちました。', pt: 'a mulher esperou o homem.' },
      { en: 'the cat has waited for the man.', it: "la gatta ha aspettato l'uomo.", fr: "la chatte a attendu l'homme.", de: 'die Katze hat auf den Mann gewartet.', es: 'la gata ha esperado al hombre.', ja: '猫は男を待ちました。', pt: 'a gata esperou o homem.' },
      { en: 'the men will wait for the man.', it: "gli uomini aspetteranno l'uomo.", fr: "les hommes attendront l'homme.", de: 'die Männer werden auf den Mann warten.', es: 'los hombres esperarán al hombre.', ja: '男は男を待ちます。', pt: 'os homens esperarão o homem.' },
      { en: 'the man does not wait for the man.', it: "l'uomo non aspetta l'uomo.", fr: "l'homme n'attend pas l'homme.", de: 'der Mann wartet nicht auf den Mann.', es: 'el hombre no espera al hombre.', ja: '男は男を待ちません。', pt: 'o homem não espera o homem.' },
    ]],
    ['DIE', undefined, [
      { en: 'the woman dies.', it: 'la donna muore.', fr: 'la femme meurt.', de: 'die Frau stirbt.', es: 'la mujer muere.', ja: '女は死にます。', pt: 'a mulher morre.' },
      { en: 'the woman died.', it: 'la donna morì.', fr: 'la femme mourut.', de: 'die Frau starb.', es: 'la mujer murió.', ja: '女は死にました。', pt: 'a mulher morreu.' },
      { en: 'the cat has died.', it: 'la gatta è morta.', fr: 'la chatte est morte.', de: 'die Katze ist gestorben.', es: 'la gata ha muerto.', ja: '猫は死にました。', pt: 'a gata morreu.' },
      { en: 'the men will die.', it: 'gli uomini moriranno.', fr: 'les hommes mourront.', de: 'die Männer werden sterben.', es: 'los hombres morirán.', ja: '男は死にます。', pt: 'os homens morrerão.' },
      { en: 'the man does not die.', it: "l'uomo non muore.", fr: "l'homme ne meurt pas.", de: 'der Mann stirbt nicht.', es: 'el hombre no muere.', ja: '男は死にません。', pt: 'o homem não morre.' },
    ]],
    ['CONTINUE', 'ACTION', [
      { en: 'the woman continues the action.', it: "la donna continua l'azione.", fr: "la femme continue l'action.", de: 'die Frau setzt die Handlung fort.', es: 'la mujer continúa la acción.', ja: '女は動作を続けます。', pt: 'a mulher continua a ação.' },
      { en: 'the woman continued the action.', it: "la donna continuò l'azione.", fr: "la femme continua l'action.", de: 'die Frau setzte die Handlung fort.', es: 'la mujer continuó la acción.', ja: '女は動作を続けました。', pt: 'a mulher continuou a ação.' },
      { en: 'the cat has continued the action.', it: "la gatta ha continuato l'azione.", fr: "la chatte a continué l'action.", de: 'die Katze hat die Handlung fortgesetzt.', es: 'la gata ha continuado la acción.', ja: '猫は動作を続けました。', pt: 'a gata continuou a ação.' },
      { en: 'the men will continue the action.', it: "gli uomini continueranno l'azione.", fr: "les hommes continueront l'action.", de: 'die Männer werden die Handlung fortsetzen.', es: 'los hombres continuarán la acción.', ja: '男は動作を続けます。', pt: 'os homens continuarão a ação.' },
      { en: 'the man does not continue the action.', it: "l'uomo non continua l'azione.", fr: "l'homme ne continue pas l'action.", de: 'der Mann setzt die Handlung nicht fort.', es: 'el hombre no continúa la acción.', ja: '男は動作を続けません。', pt: 'o homem não continua a ação.' },
    ]],
    ['MEET', 'MAN', [
      { en: 'the woman meets the man.', it: "la donna incontra l'uomo.", fr: "la femme rencontre l'homme.", de: 'die Frau trifft den Mann.', es: 'la mujer se encuentra con el hombre.', ja: '女は男に会います。', pt: 'a mulher encontra o homem.' },
      { en: 'the woman met the man.', it: "la donna incontrò l'uomo.", fr: "la femme rencontra l'homme.", de: 'die Frau traf den Mann.', es: 'la mujer se encontró con el hombre.', ja: '女は男に会いました。', pt: 'a mulher encontrou o homem.' },
      { en: 'the cat has met the man.', it: "la gatta ha incontrato l'uomo.", fr: "la chatte a rencontré l'homme.", de: 'die Katze hat den Mann getroffen.', es: 'la gata se ha encontrado con el hombre.', ja: '猫は男に会いました。', pt: 'a gata encontrou o homem.' },
      { en: 'the men will meet the man.', it: "gli uomini incontreranno l'uomo.", fr: "les hommes rencontreront l'homme.", de: 'die Männer werden den Mann treffen.', es: 'los hombres se encontrarán con el hombre.', ja: '男は男に会います。', pt: 'os homens encontrarão o homem.' },
      { en: 'the man does not meet the man.', it: "l'uomo non incontra l'uomo.", fr: "l'homme ne rencontre pas l'homme.", de: 'der Mann trifft den Mann nicht.', es: 'el hombre no se encuentra con el hombre.', ja: '男は男に会いません。', pt: 'o homem não encontra o homem.' },
    ]],
    ['REMEMBER', 'MAN', [
      { en: 'the woman remembers the man.', it: "la donna ricorda l'uomo.", fr: "la femme se rappelle l'homme.", de: 'die Frau erinnert sich an den Mann.', es: 'la mujer recuerda al hombre.', ja: '女は男を覚えています。', pt: 'a mulher lembra o homem.' },
      { en: 'the woman remembered the man.', it: "la donna ricordava l'uomo.", fr: "la femme se rappelait l'homme.", de: 'die Frau erinnerte sich an den Mann.', es: 'la mujer recordaba al hombre.', ja: '女は男を覚えていました。', pt: 'a mulher lembrava o homem.' },
      { en: 'the cat has remembered the man.', it: "la gatta ha ricordato l'uomo.", fr: "la chatte s'est rappelé l'homme.", de: 'die Katze hat sich an den Mann erinnert.', es: 'la gata ha recordado al hombre.', ja: '猫は男を覚えていました。', pt: 'a gata lembrou o homem.' },
      { en: 'the men will remember the man.', it: "gli uomini ricorderanno l'uomo.", fr: "les hommes se rappelleront l'homme.", de: 'die Männer werden sich an den Mann erinnern.', es: 'los hombres recordarán al hombre.', ja: '男は男を覚えています。', pt: 'os homens lembrarão o homem.' },
      { en: 'the man does not remember the man.', it: "l'uomo non ricorda l'uomo.", fr: "l'homme ne se rappelle pas l'homme.", de: 'der Mann erinnert sich nicht an den Mann.', es: 'el hombre no recuerda al hombre.', ja: '男は男を覚えていません。', pt: 'o homem não lembra o homem.' },
    ]],
    ['CONSIDER', 'PROBLEM', [
      { en: 'the woman considers the problem.', it: 'la donna considera il problema.', fr: 'la femme considère le problème.', de: 'die Frau erwägt das Problem.', es: 'la mujer considera el problema.', ja: '女は問題を考慮します。', pt: 'a mulher considera o problema.' },
      { en: 'the woman considered the problem.', it: 'la donna considerò il problema.', fr: 'la femme considéra le problème.', de: 'die Frau erwog das Problem.', es: 'la mujer consideró el problema.', ja: '女は問題を考慮しました。', pt: 'a mulher considerou o problema.' },
      { en: 'the cat has considered the problem.', it: 'la gatta ha considerato il problema.', fr: 'la chatte a considéré le problème.', de: 'die Katze hat das Problem erwogen.', es: 'la gata ha considerado el problema.', ja: '猫は問題を考慮しました。', pt: 'a gata considerou o problema.' },
      { en: 'the men will consider the problem.', it: 'gli uomini considereranno il problema.', fr: 'les hommes considéreront le problème.', de: 'die Männer werden das Problem erwägen.', es: 'los hombres considerarán el problema.', ja: '男は問題を考慮します。', pt: 'os homens considerarão o problema.' },
      { en: 'the man does not consider the problem.', it: "l'uomo non considera il problema.", fr: "l'homme ne considère pas le problème.", de: 'der Mann erwägt das Problem nicht.', es: 'el hombre no considera el problema.', ja: '男は問題を考慮しません。', pt: 'o homem não considera o problema.' },
    ]],
  ])('%s', (verb, object, [present, past, resultative, future, negative]) => {
    const x = (extra: Parameters<typeof clause>[2] = {}) => (object ? { directObject: the(object), ...extra } : extra);
    expect(sayAll(clause(the('WOMAN'), verb, x()))).toEqual(present);
    expect(sayAll(clause(the('WOMAN'), verb, x({ verbPhrase: { tense: 'past' } })))).toEqual(past);
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, x({ verbPhrase: { aspect: 'resultative' } })))).toEqual(resultative);
    expect(sayAll(clause(the('MAN', { number: 'plural' }), verb, x({ verbPhrase: { tense: 'future' } })))).toEqual(future);
    expect(sayAll(clause(the('MAN'), verb, x({ verbPhrase: { negative: true } })))).toEqual(negative);
  });
});

// The first person and the tú / du command, where the Romance reflexives and the strong verbs show.
describe('the first person and the command', () => {
  test.each<[string, string | undefined, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    ['SIT_DOWN', undefined,
      { en: 'I sit down.', it: 'mi siedo.', fr: "je m'assieds.", de: 'ich setze mich.', es: 'me siento.', ja: '私は座ります。', pt: 'me sento.' },
      { en: 'sit down.', it: 'siediti.', fr: 'assieds-toi.', de: 'setz dich.', es: 'siéntate.', ja: '座ってください。', pt: 'sente-se.' }],
    ['STAND_UP', undefined,
      { en: 'I stand up.', it: 'mi alzo.', fr: 'je me lève.', de: 'ich stehe auf.', es: 'me levanto.', ja: '私は立ちます。', pt: 'me levanto.' },
      { en: 'stand up.', it: 'alzati.', fr: 'lève-toi.', de: 'steh auf.', es: 'levántate.', ja: '立ってください。', pt: 'levante-se.' }],
    ['WALK', undefined,
      { en: 'I walk.', it: 'cammino.', fr: 'je marche.', de: 'ich gehe zu Fuß.', es: 'camino.', ja: '私は歩きます。', pt: 'caminho.' },
      { en: 'walk.', it: 'cammina.', fr: 'marche.', de: 'geh zu Fuß.', es: 'camina.', ja: '歩いてください。', pt: 'caminhe.' }],
    ['RUN_AWAY', undefined,
      { en: 'I run away.', it: 'scappo.', fr: "je m'enfuis.", de: 'ich laufe weg.', es: 'huyo.', ja: '私は逃げます。', pt: 'fujo.' },
      { en: 'run away.', it: 'scappa.', fr: 'enfuis-toi.', de: 'lauf weg.', es: 'huye.', ja: '逃げてください。', pt: 'fuja.' }],
    ['LEAD', 'MAN',
      { en: 'I lead the man.', it: "conduco l'uomo.", fr: "je mène l'homme.", de: 'ich führe den Mann.', es: 'guío al hombre.', ja: '私は男を導きます。', pt: 'conduzo o homem.' },
      { en: 'lead the man.', it: "conduci l'uomo.", fr: "mène l'homme.", de: 'führ den Mann.', es: 'guía al hombre.', ja: '男を導いてください。', pt: 'conduza o homem.' }],
    ['HOLD_GRASP', 'BOOK',
      { en: 'I hold the book.', it: 'tengo il libro.', fr: 'je tiens le livre.', de: 'ich halte das Buch.', es: 'sostengo el libro.', ja: '私は本を握ります。', pt: 'seguro o livro.' },
      { en: 'hold the book.', it: 'tieni il libro.', fr: 'tiens le livre.', de: 'halte das Buch.', es: 'sostén el libro.', ja: '本を握ってください。', pt: 'segure o livro.' }],
    ['STOP', 'BOOK',
      { en: 'I stop the book.', it: 'fermo il libro.', fr: "j'arrête le livre.", de: 'ich halte das Buch an.', es: 'detengo el libro.', ja: '私は本を止めます。', pt: 'paro o livro.' },
      { en: 'stop the book.', it: 'ferma il libro.', fr: 'arrête le livre.', de: 'halte das Buch an.', es: 'detén el libro.', ja: '本を止めてください。', pt: 'pare o livro.' }],
    ['STOP_ONESELF', undefined,
      { en: 'I stop.', it: 'mi fermo.', fr: "je m'arrête.", de: 'ich bleibe stehen.', es: 'me detengo.', ja: '私は止まります。', pt: 'paro.' },
      { en: 'stop.', it: 'fermati.', fr: 'arrête-toi.', de: 'bleib stehen.', es: 'detente.', ja: '止まってください。', pt: 'pare.' }],
    ['WAIT', 'MAN',
      { en: 'I wait for the man.', it: "aspetto l'uomo.", fr: "j'attends l'homme.", de: 'ich warte auf den Mann.', es: 'espero al hombre.', ja: '私は男を待ちます。', pt: 'espero o homem.' },
      { en: 'wait for the man.', it: "aspetta l'uomo.", fr: "attends l'homme.", de: 'warte auf den Mann.', es: 'espera al hombre.', ja: '男を待ってください。', pt: 'espere o homem.' }],
    ['DIE', undefined,
      { en: 'I die.', it: 'muoio.', fr: 'je meurs.', de: 'ich sterbe.', es: 'muero.', ja: '私は死にます。', pt: 'morro.' },
      { en: 'die.', it: 'muori.', fr: 'meurs.', de: 'stirb.', es: 'muere.', ja: '死んでください。', pt: 'morra.' }],
    ['CONTINUE', 'ACTION',
      { en: 'I continue the action.', it: "continuo l'azione.", fr: "je continue l'action.", de: 'ich setze die Handlung fort.', es: 'continúo la acción.', ja: '私は動作を続けます。', pt: 'continuo a ação.' },
      { en: 'continue the action.', it: "continua l'azione.", fr: "continue l'action.", de: 'setz die Handlung fort.', es: 'continúa la acción.', ja: '動作を続けてください。', pt: 'continue a ação.' }],
    ['MEET', 'MAN',
      { en: 'I meet the man.', it: "incontro l'uomo.", fr: "je rencontre l'homme.", de: 'ich treffe den Mann.', es: 'me encuentro con el hombre.', ja: '私は男に会います。', pt: 'encontro o homem.' },
      { en: 'meet the man.', it: "incontra l'uomo.", fr: "rencontre l'homme.", de: 'triff den Mann.', es: 'encuéntrate con el hombre.', ja: '男に会ってください。', pt: 'encontre o homem.' }],
    ['REMEMBER', 'MAN',
      { en: 'I remember the man.', it: "ricordo l'uomo.", fr: "je me rappelle l'homme.", de: 'ich erinnere mich an den Mann.', es: 'recuerdo al hombre.', ja: '私は男を覚えています。', pt: 'lembro o homem.' },
      { en: 'remember the man.', it: "ricorda l'uomo.", fr: "rappelle-toi l'homme.", de: 'erinnere dich an den Mann.', es: 'recuerda al hombre.', ja: '男を覚えてください。', pt: 'lembre o homem.' }],
    ['CONSIDER', 'PROBLEM',
      { en: 'I consider the problem.', it: 'considero il problema.', fr: 'je considère le problème.', de: 'ich erwäge das Problem.', es: 'considero el problema.', ja: '私は問題を考慮します。', pt: 'considero o problema.' },
      { en: 'consider the problem.', it: 'considera il problema.', fr: 'considère le problème.', de: 'erwäg das Problem.', es: 'considera el problema.', ja: '問題を考慮してください。', pt: 'considere o problema.' }],
  ])('%s', (verb, object, first, commanded) => {
    const x = object ? { directObject: the(object) } : {};
    expect(sayAll(clause(np('FIRST_PERSON'), verb, x))).toEqual(first);
    expect(sayAll(command(verb, x))).toEqual(commanded);
  });

  // morir narrows its ue to u in the unstressed subjunctive (ES_SUBJ_OVERRIDE).
  test("the Spanish 1pl command of morir", () => {
    const letUs = { ...clause(np('FIRST_PERSON', { number: 'plural' }), 'DIE'), imperative: true };
    expect(say(letUs, 'es')).toBe('muramos.');
  });
});

describe('what each verb licenses', () => {
  test('the goal, the source, the place and the awaited', () => {
    expect(sayAll(clause(the('WOMAN'), 'LEAD', { directObject: the('MAN'), complements: { direction: { phrase: the('HOUSE') } } }))).toEqual(
      { en: 'the woman leads the man to the house.', it: "la donna conduce l'uomo alla casa.", fr: "la femme mène l'homme à la maison.", de: 'die Frau führt den Mann zum Haus.', es: 'la mujer guía al hombre a la casa.', ja: '女は家へ男を導きます。', pt: 'a mulher conduz o homem à casa.' });
    expect(sayAll(clause(the('CAT'), 'RUN_AWAY', { complements: { source: { phrase: the('DOG') } } }))).toEqual(
      { en: 'the cat runs away from the dog.', it: 'il gatto scappa dal cane.', fr: "le chat s'enfuit du chien.", de: 'der Kater läuft vom Hund weg.', es: 'el gato huye del perro.', ja: '猫は犬から逃げます。', pt: 'o gato foge do cão.' });
    expect(sayAll(clause(the('WOMAN'), 'HOLD_GRASP', { directObject: the('BOOK'), complements: { locative: { phrase: the('HAND') } } }))).toEqual(
      { en: 'the woman holds the book in the hand.', it: 'la donna tiene il libro nella mano.', fr: 'la femme tient le livre dans la main.', de: 'die Frau hält das Buch in der Hand.', es: 'la mujer sostiene el libro en la mano.', ja: '女は手で本を握ります。', pt: 'a mulher segura o livro na mão.' });
    // The awaited takes "for" and "auf", a pronoun included.
    expect(sayAll(clause(the('CAT'), 'WAIT', { directObject: { concept: 'THIRD_PERSON', gender: 'masc' } }))).toEqual(
      { en: 'the cat waits for him.', it: 'il gatto lo aspetta.', fr: "le chat l'attend.", de: 'der Kater wartet auf ihn.', es: 'el gato lo espera.', ja: '猫は彼を待ちます。', pt: 'o gato o espera.' });
    // Spanish encontrarse con, Japanese 会う with に.
    expect(sayAll(clause(the('CAT'), 'MEET', { directObject: { concept: 'THIRD_PERSON', gender: 'masc' } }))).toMatchObject(
      { es: 'el gato se encuentra con él.', ja: '猫は彼に会います。', de: 'der Kater trifft ihn.' });
  });

  // German particles written apart stay apart in the zu-infinitive (B40), and join as ever otherwise.
  test('German zu-infinitives', () => {
    const begins = (verb: string) => say(inf({ verb: 'BEGIN' }, { infinitiveComplement: { verbPhrase: { verb } } }), 'de');
    expect(begins('WALK')).toBe('beginnen zu Fuß zu gehen.');
    expect(begins('STOP_ONESELF')).toBe('beginnen stehen zu bleiben.');
    expect(begins('STAND_UP')).toBe('beginnen aufzustehen.');
    expect(begins('RUN_AWAY')).toBe('beginnen wegzulaufen.');
  });

  // A state: the Romance past is the imperfect, Japanese 〜ている, whose negative is its own.
  test('REMEMBER is a state', () => {
    expect(seed('REMEMBER')?.stative).toBe(true);
    expect(sayAll(clause(the('WOMAN'), 'REMEMBER', { directObject: the('MAN'), verbPhrase: { tense: 'past' } }))).toMatchObject(
      { it: "la donna ricordava l'uomo.", fr: "la femme se rappelait l'homme.", es: 'la mujer recordaba al hombre.', ja: '女は男を覚えていました。', pt: 'a mulher lembrava o homem.' });
    expect(say(clause(the('MAN'), 'REMEMBER', { directObject: the('DOG'), verbPhrase: { negative: true } }), 'ja')).toBe('男は犬を覚えていません。');
  });

  // French se rappeler: its se is the indirect object, so the participle never agrees with the
  // subject, and it stays ahead of an object clitic — behind one in an affirmative command.
  test('French se rappeler with an object pronoun', () => {
    const him = { concept: 'THIRD_PERSON', gender: 'masc' } as const;
    const fr = (plan: PhrasePlan) => say(plan, 'fr');
    expect(fr(clause(the('CAT', { gender: 'fem' }), 'REMEMBER', { verbPhrase: { aspect: 'resultative' } }))).toBe("la chatte s'est rappelé.");
    expect(fr(clause(the('CAT'), 'REMEMBER', { directObject: him }))).toBe('le chat se le rappelle.');
    expect(fr(clause(the('CAT'), 'REMEMBER', { directObject: { concept: 'THIRD_PERSON', gender: 'fem' }, verbPhrase: { negative: true } }))).toBe('le chat ne se la rappelle pas.');
    expect(fr(clause(the('CAT', { gender: 'fem' }), 'REMEMBER', { directObject: him, verbPhrase: { aspect: 'resultative' } }))).toBe("la chatte se l'est rappelé.");
    expect(fr(clause(the('CAT'), 'REMEMBER', { directObject: him, verbPhrase: { modals: ['WILL'] } }))).toBe('le chat veut se le rappeler.');
    expect(fr(command('REMEMBER', { directObject: him }))).toBe('rappelle-le-toi.');
    expect(fr(command('REMEMBER', { directObject: him, verbPhrase: { negative: true } }))).toBe('ne te le rappelle pas.');
  });
});
