function getArticle(forms) {
    const count = forms['number'] ?? forms['count'] ?? 'singular';
    if (count === 'plural')
        return '';
    const base = forms['base'] ?? '';
    return /^[aeiou]/i.test(base) ? 'an' : 'a';
}
function conjugate(forms, subjectForms) {
    const person = subjectForms['person'] ?? '3';
    const number = subjectForms['number'] ?? 'singular';
    const key = `${person}${number === 'plural' ? 'pl' : 'sg'}_present`;
    return forms[key] ?? forms['base'] ?? '';
}
function nounPhrase(forms, definite = false, adj) {
    const count = forms['number'] ?? forms['count'] ?? 'singular';
    const word = count === 'plural' ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
    const a = adj ? `${adj} ` : '';
    if (definite)
        return `the ${a}${word}`;
    return `${getArticle(forms)} ${a}${word}`;
}
function subjectPhrase(forms, adj) {
    if (forms['person']) {
        if (forms['number'] === 'plural' && forms['plural'])
            return forms['plural'];
        return forms['base'] ?? '';
    }
    return nounPhrase(forms, true, adj); // noun — definite article
}
export const englishEngine = {
    language: 'en',
    render(phrase) {
        const { subject, subjectAdjective, verb, directObject, indirectObject, modifier } = phrase;
        const subjectText = subjectPhrase(subject.forms, subjectAdjective?.forms['base']);
        const verbText = conjugate(verb.forms, subject.forms);
        const directObjectText = directObject ? nounPhrase(directObject.forms, true) : '';
        // Prepositional dative: "to the cat"
        const indirectObjectText = indirectObject ? `to ${nounPhrase(indirectObject.forms, true)}` : '';
        const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
        const isFrequency = modifier?.forms['subtype'] === 'frequency';
        // Frequency adverbs (always, never) precede the main verb: S Adv V Obj
        // Manner adverbs (fast, slowly) follow the verb/object: S V Obj Adv
        const preVerb = isFrequency ? modifierText : '';
        const postVerb = isFrequency ? '' : modifierText;
        return [subjectText, preVerb, verbText, directObjectText, indirectObjectText, postVerb]
            .filter(Boolean)
            .join(' ')
            .trim();
    },
};
//# sourceMappingURL=en.js.map