import { describe, expect, test } from 'vitest';
import { concepts, CA, BORROWED } from '../index.js';

// P03: the Catalan verbs (Central, IEC). Every form is (verify) until the native review (P03-E11).
describe('the Catalan verbs', () => {
  const verbs = concepts.filter((c) => c.role === 'verb');
  const own = verbs.filter((c) => CA[c.id]);
  const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];
  const TENSES = ['present', 'imperfect', 'future', 'conditional', 'subjunctive', 'past_subjunctive'];
  const REQUIRED = [
    'base',
    ...TENSES.flatMap((t) => PERSONS.map((p) => `${p}_${t}`)),
    'gerund',
    'participle',
    'participle_fem',
    'participle_plural',
    'participle_fem_plural',
    '2sg_imperative',
    '1pl_imperative',
    '2pl_imperative',
  ];
  const cellsOf = (id: string, tense: string) => PERSONS.map((p) => CA[id]![`${p}_${tense}`]);

  test('borrows no verb from Spanish', () => {
    expect(verbs.filter((c) => BORROWED['ca']?.includes(c.id)).map((c) => c.id)).toEqual([]);
    expect(own).toHaveLength(verbs.length);
  });

  test('gives every verb its base, the 6×6 finite cells, a gerund, four participles and three imperatives', () => {
    const missing = own.flatMap((c) => REQUIRED.filter((k) => !CA[c.id]![k]?.trim()).map((k) => `${c.id}.${k}`));
    expect(missing).toEqual([]);
  });

  test('stores no simple past and no auxiliary — the past is periphrastic, the auxiliary always haver (P03 D2)', () => {
    const bad = own.flatMap((c) =>
      Object.keys(CA[c.id]!)
        .filter((k) => /^\d(sg|pl)_past$/.test(k) || k === 'aux')
        .map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('carries every syntactic key the Spanish entry carries, but the Spanish-only ones', () => {
    const syntactic = /^(infinitive_link|object_prep|topic_prep|object_case|content_clause_force|content_clause_mood|content_clause_mood_negative|copula|experiencer|seeming|causative|terminus_tonic|object_predicative_link|object_sense|infinitive_sense|complement_form|negative_complement_link)$/;
    const missing = own.flatMap((c) =>
      Object.keys(c.forms['es'] ?? {})
        .filter((k) => syntactic.test(k) && !(k in CA[c.id]!))
        .map((k) => `${c.id}.${k}`),
    );
    expect(missing).toEqual([]);
    // The Spanish personal a and the Spanish subjunctive stem have no Catalan counterpart.
    expect(own.filter((c) => ['object_a', 'object_no_a', 'subjunctive_stem'].some((k) => k in CA[c.id]!))).toEqual([]);
  });

  test('conjugates the 1st conjugation with its spelling changes (menjar, tocar, començar, pagar)', () => {
    const eat = CA['EAT']!;
    expect(cellsOf('EAT', 'present')).toEqual(['menjo', 'menges', 'menja', 'mengem', 'mengeu', 'mengen']);
    expect(cellsOf('EAT', 'imperfect')).toEqual(['menjava', 'menjaves', 'menjava', 'menjàvem', 'menjàveu', 'menjaven']);
    expect(cellsOf('EAT', 'future')).toEqual(['menjaré', 'menjaràs', 'menjarà', 'menjarem', 'menjareu', 'menjaran']);
    expect(cellsOf('EAT', 'conditional')).toEqual(['menjaria', 'menjaries', 'menjaria', 'menjaríem', 'menjaríeu', 'menjarien']);
    expect(cellsOf('EAT', 'subjunctive')).toEqual(['mengi', 'mengis', 'mengi', 'mengem', 'mengeu', 'mengin']);
    expect(cellsOf('EAT', 'past_subjunctive')).toEqual(['mengés', 'mengessis', 'mengés', 'mengéssim', 'mengéssiu', 'mengessin']);
    expect([eat['gerund'], eat['participle'], eat['participle_fem'], eat['participle_plural'], eat['participle_fem_plural']]).toEqual(
      ['menjant', 'menjat', 'menjada', 'menjats', 'menjades'],
    );
    expect([eat['2sg_imperative'], eat['1pl_imperative'], eat['2pl_imperative']]).toEqual(['menja', 'mengem', 'mengeu']);
    expect(CA['PLAY_INSTRUMENT']!['1pl_present']).toBe('toquem');
    expect(CA['START']!['3sg_subjunctive']).toBe('comenci');
    expect(CA['PAY']!['3sg_past_subjunctive']).toBe('pagués');
    expect(CA['CONTINUE']!['3sg_subjunctive']).toBe('continuï');
    expect(CA['CREATE']!['3pl_subjunctive']).toBe('creïn');
  });

  test('conjugates the 2nd conjugation (perdre, prémer)', () => {
    expect(cellsOf('LOSE', 'present')).toEqual(['perdo', 'perds', 'perd', 'perdem', 'perdeu', 'perden']);
    expect(cellsOf('LOSE', 'future')).toEqual(['perdré', 'perdràs', 'perdrà', 'perdrem', 'perdreu', 'perdran']);
    expect(CA['LOSE']!['3sg_subjunctive']).toBe('perdi');
    expect(CA['LOSE']!['3sg_past_subjunctive']).toBe('perdés');
    expect(CA['LOSE']!['participle']).toBe('perdut');
    expect(CA['LOSE']!['2sg_imperative']).toBe('perd');
    expect(cellsOf('PRESS', 'present')).toEqual(['premo', 'prems', 'prem', 'premem', 'premeu', 'premen']);
    expect(CA['PRESS']!['1sg_future']).toBe('premeré');
    expect(CA['PRESS']!['participle']).toBe('premut');
  });

  test('conjugates the 3rd conjugation, pure (dormir-type: sentir) and inchoative (servir-type)', () => {
    expect(cellsOf('FEEL', 'present')).toEqual(['sento', 'sents', 'sent', 'sentim', 'sentiu', 'senten']);
    expect(CA['FEEL']!['3sg_subjunctive']).toBe('senti');
    expect(CA['FEEL']!['3sg_past_subjunctive']).toBe('sentís');
    expect(CA['FEEL']!['2sg_imperative']).toBe('sent');
    expect(cellsOf('OPEN', 'present')).toEqual(['obro', 'obres', 'obre', 'obrim', 'obriu', 'obren']);
    expect(CA['OPEN']!['participle_fem']).toBe('oberta');
    expect(cellsOf('READ', 'present')).toEqual(['llegeixo', 'llegeixes', 'llegeix', 'llegim', 'llegiu', 'llegeixen']);
    expect(cellsOf('READ', 'subjunctive')).toEqual(['llegeixi', 'llegeixis', 'llegeixi', 'llegim', 'llegiu', 'llegeixin']);
    expect(CA['READ']!['2sg_imperative']).toBe('llegeix');
    expect(cellsOf('THANK', 'present')).toEqual(['agraeixo', 'agraeixes', 'agraeix', 'agraïm', 'agraïu', 'agraeixen']);
    expect([CA['THANK']!['participle'], CA['THANK']!['gerund'], CA['THANK']!['1sg_future']]).toEqual(['agraït', 'agraint', 'agrairé']);
    expect(CA['FOLLOW']!['1pl_present']).toBe('seguim');
  });

  test('conjugates the irregular core', () => {
    const at = (id: string, k: string) => CA[id]![k];
    expect(cellsOf('BE', 'present')).toEqual(['sóc', 'ets', 'és', 'som', 'sou', 'són']);
    expect(cellsOf('BE', 'subjunctive')).toEqual(['sigui', 'siguis', 'sigui', 'siguem', 'sigueu', 'siguin']);
    expect([at('BE', '3sg_past_subjunctive'), at('BE', 'participle'), at('BE', '2sg_imperative')]).toEqual(['fos', 'estat', 'sigues']);
    expect(cellsOf('BE_FARING', 'present')).toEqual(['estic', 'estàs', 'està', 'estem', 'esteu', 'estan']);
    expect([at('BE_FARING', '3sg_subjunctive'), at('BE_FARING', '3sg_past_subjunctive')]).toEqual(['estigui', 'estigués']);
    expect(cellsOf('MUST', 'present')).toEqual(['he', 'has', 'ha', 'hem', 'heu', 'han']);
    expect([at('MUST', '3sg_subjunctive'), at('MUST', '3sg_past_subjunctive'), at('MUST', 'participle')]).toEqual(['hagi', 'hagués', 'hagut']);
    expect(cellsOf('GO', 'present')).toEqual(['vaig', 'vas', 'va', 'anem', 'aneu', 'van']);
    expect([at('GO', '1sg_future'), at('GO', '3sg_subjunctive'), at('GO', '3sg_past_subjunctive'), at('GO', '2sg_imperative')]).toEqual(
      ['aniré', 'vagi', 'anés', 'vés'],
    );
    expect(cellsOf('MAKE', 'present')).toEqual(['faig', 'fas', 'fa', 'fem', 'feu', 'fan']);
    expect([at('MAKE', '1sg_future'), at('MAKE', '3sg_subjunctive'), at('MAKE', '3sg_past_subjunctive'), at('MAKE', 'participle_fem_plural'), at('MAKE', '2sg_imperative')]).toEqual(
      ['faré', 'faci', 'fes', 'fetes', 'fes'],
    );
    expect(cellsOf('HAVE', 'present')).toEqual(['tinc', 'tens', 'té', 'tenim', 'teniu', 'tenen']);
    expect([at('HAVE', '1sg_future'), at('HAVE', '3sg_subjunctive'), at('HAVE', 'participle')]).toEqual(['tindré', 'tingui', 'tingut']);
    expect(cellsOf('COME', 'present')).toEqual(['vinc', 'véns', 've', 'venim', 'veniu', 'vénen']);
    expect([at('COME', '3sg_subjunctive'), at('COME', '3sg_past_subjunctive'), at('COME', 'participle'), at('COME', '2sg_imperative')]).toEqual(
      ['vingui', 'vingués', 'vingut', 'vine'],
    );
    expect(cellsOf('CAN', 'present')).toEqual(['puc', 'pots', 'pot', 'podem', 'podeu', 'poden']);
    expect([at('CAN', '3sg_subjunctive'), at('CAN', '3sg_past_subjunctive'), at('CAN', 'participle')]).toEqual(['pugui', 'pogués', 'pogut']);
    expect(cellsOf('WILL', 'present')).toEqual(['vull', 'vols', 'vol', 'volem', 'voleu', 'volen']);
    expect([at('WILL', '3sg_subjunctive'), at('WILL', '3sg_past_subjunctive'), at('WILL', 'participle')]).toEqual(['vulgui', 'volgués', 'volgut']);
    expect(cellsOf('KNOW', 'present')).toEqual(['sé', 'saps', 'sap', 'sabem', 'sabeu', 'saben']);
    expect(cellsOf('KNOW', 'subjunctive')).toEqual(['sàpiga', 'sàpigues', 'sàpiga', 'sapiguem', 'sapigueu', 'sàpiguen']);
    expect(at('KNOW', '3sg_past_subjunctive')).toBe('sabés');
    expect(cellsOf('SAY', 'present')).toEqual(['dic', 'dius', 'diu', 'diem', 'dieu', 'diuen']);
    expect([at('SAY', '3sg_subjunctive'), at('SAY', '3sg_past_subjunctive'), at('SAY', 'participle_fem'), at('SAY', '2sg_imperative')]).toEqual(
      ['digui', 'digués', 'dita', 'digues'],
    );
    expect(cellsOf('SEE', 'present')).toEqual(['veig', 'veus', 'veu', 'veiem', 'veieu', 'veuen']);
    expect([at('SEE', '3sg_subjunctive'), at('SEE', '3sg_past_subjunctive'), at('SEE', 'participle'), at('SEE', 'participle_plural')]).toEqual(
      ['vegi', 'veiés', 'vist', 'vistos'],
    );
    expect(cellsOf('DRINK', 'present')).toEqual(['bec', 'beus', 'beu', 'bevem', 'beveu', 'beuen']);
    expect([at('DRINK', '3sg_subjunctive'), at('DRINK', '3sg_past_subjunctive'), at('DRINK', 'participle'), at('DRINK', '2pl_imperative')]).toEqual(
      ['begui', 'begués', 'begut', 'beveu'],
    );
    expect(cellsOf('RUN', 'present')).toEqual(['corro', 'corres', 'corre', 'correm', 'correu', 'corren']);
    expect([at('RUN', '3sg_subjunctive'), at('RUN', '3sg_past_subjunctive'), at('RUN', 'participle')]).toEqual(['corri', 'corregués', 'corregut']);
    expect(cellsOf('KNOW_ACQUAINTED', 'present')).toEqual(['conec', 'coneixes', 'coneix', 'coneixem', 'coneixeu', 'coneixen']);
    expect([at('KNOW_ACQUAINTED', '3sg_subjunctive'), at('KNOW_ACQUAINTED', '3sg_past_subjunctive'), at('KNOW_ACQUAINTED', 'participle')]).toEqual(
      ['conegui', 'conegués', 'conegut'],
    );
    expect(cellsOf('LIVE_ALIVE', 'present')).toEqual(['visc', 'vius', 'viu', 'vivim', 'viviu', 'viuen']);
    expect([at('LIVE_ALIVE', '3sg_subjunctive'), at('LIVE_ALIVE', '3sg_past_subjunctive'), at('LIVE_ALIVE', 'participle'), at('LIVE_ALIVE', '2sg_imperative')]).toEqual(
      ['visqui', 'visqués', 'viscut', 'viu'],
    );
    expect([at('UNDERSTAND', 'participle'), at('UNDERSTAND', 'participle_plural')]).toEqual(['comprès', 'compresos']);
    expect([at('WRITE', '1sg_present'), at('WRITE', 'participle'), at('WRITE', 'participle_fem')]).toEqual(['escric', 'escrit', 'escrita']);
    expect([at('DIE', 'participle'), at('OPEN', 'participle')]).toEqual(['mort', 'obert']);
  });

  test('stores a pronominal verb with its clitic, as Spanish does, and leaves the non-finite cells bare', () => {
    const become = CA['BECOME']!;
    expect(become['base']).toBe('tornar-se');
    expect(cellsOf('BECOME', 'present')).toEqual(['em torno', 'et tornes', 'es torna', 'ens tornem', 'us torneu', 'es tornen']);
    expect(cellsOf('STOP_ONESELF', 'present')).toEqual(["m'aturo", "t'atures", "s'atura", 'ens aturem', 'us atureu', "s'aturen"]);
    expect(CA['SIT_DOWN']!['base']).toBe("asseure's");
    expect([become['gerund'], become['participle'], become['2sg_imperative']]).toEqual(['tornant', 'tornat', 'torna']);
    expect(CA['MEET']!['object_prep']).toBe('amb');
  });

  test('builds MUST as haver de and SHOULD / MIGHT on the conditional', () => {
    expect([CA['MUST']!['base'], CA['MUST']!['infinitive_link']]).toEqual(['haver', 'de']);
    expect(cellsOf('SHOULD', 'present')).toEqual(['hauria', 'hauries', 'hauria', 'hauríem', 'hauríeu', 'haurien']);
    expect(CA['SHOULD']!['infinitive_link']).toBe('de');
    expect(CA['MIGHT']!['3sg_present']).toBe('podria');
  });
});
