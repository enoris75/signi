function defArticle(forms, plural = false) {
    const gender = forms['gender'] ?? 'masc';
    if (plural)
        return gender === 'fem' ? 'las' : 'los';
    return gender === 'fem' ? 'la' : 'el';
}
/**
 * Spanish "a" (to) + definite article contractions:
 * a+el=al (only masculine singular contracts)
 */
function datPrep(forms, plural = false) {
    const art = defArticle(forms, plural);
    if (art === 'el')
        return 'al';
    return `a ${art}`;
}
function conjugate(forms, subjectForms) {
    const person = subjectForms['person'] ?? '3';
    const number = subjectForms['number'] ?? 'singular';
    const key = `${person}${number === 'plural' ? 'pl' : 'sg'}_present`;
    return forms[key] ?? forms['base'] ?? '';
}
function nounPhrase(forms, adj) {
    const count = forms['number'] ?? forms['count'] ?? 'singular';
    const plural = count === 'plural';
    const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
    const a = adj ? ` ${adj}` : '';
    return `${defArticle(forms, plural)} ${word}${a}`;
}
function indirectNounPhrase(forms) {
    const count = forms['number'] ?? forms['count'] ?? 'singular';
    const plural = count === 'plural';
    const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
    return `${datPrep(forms, plural)} ${word}`;
}
function subjectPhrase(forms, adj) {
    if (forms['person']) {
        if (forms['number'] === 'plural' && forms['plural'])
            return forms['plural'];
        return forms['base'] ?? '';
    }
    return nounPhrase(forms, adj); // noun — definite article
}
export const spanishEngine = {
    language: 'es',
    render(phrase) {
        const { subject, subjectAdjective, verb, verbNegative, directObject, indirectObject, modifier } = phrase;
        const subjectText = subjectPhrase(subject.forms, subjectAdjective?.forms['base']);
        const conjugated = conjugate(verb.forms, subject.forms);
        const verbText = verbNegative ? `no ${conjugated}` : conjugated;
        const directObjectText = directObject ? nounPhrase(directObject.forms) : '';
        // S V Adv DirectObj IndirectObj(a+article)
        const indirectObjectText = indirectObject ? indirectNounPhrase(indirectObject.forms) : '';
        const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
        // "nunca" goes pre-verbal without "no": "yo nunca bebo"
        // but post-verbal with "no": "yo no bebo nunca"
        const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
        const preVerb = (modifierIsNegative && !verbNegative) ? modifierText : '';
        const postVerb = (modifierIsNegative && !verbNegative) ? '' : modifierText;
        return [subjectText, preVerb, verbText, postVerb, directObjectText, indirectObjectText]
            .filter(Boolean)
            .join(' ')
            .trim();
    },
};
//# sourceMappingURL=es.js.map