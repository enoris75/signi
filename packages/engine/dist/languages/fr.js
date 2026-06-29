function defArticle(forms, plural = false) {
    const gender = forms['gender'] ?? 'masc';
    if (plural)
        return 'les';
    const base = forms['base'] ?? '';
    if (/^[aeiouéèêëàâîïôùûü]/i.test(base))
        return "l'";
    return gender === 'fem' ? 'la' : 'le';
}
/**
 * French "à" (to) + definite article contractions:
 * à+le=au, à+les=aux, à+la=à la, à+l'=à l'
 */
function datPrep(forms, plural = false) {
    const art = defArticle(forms, plural);
    if (art === 'le')
        return 'au';
    if (art === 'les')
        return 'aux';
    return `à ${art}`; // "à la", "à l'"
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
    const a = adj ? `${adj} ` : '';
    return `${defArticle(forms, plural)} ${a}${word}`;
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
export const frenchEngine = {
    language: 'fr',
    render(phrase) {
        const { subject, subjectAdjective, verb, verbNegative, directObject, indirectObject, modifier } = phrase;
        const subjectText = subjectPhrase(subject.forms, subjectAdjective?.forms['base']);
        const conjugated = conjugate(verb.forms, subject.forms);
        const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
        // "jamais" uses ne...jamais (replaces "pas"), even without verbNegative
        const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
        let effectiveVerb;
        let effectiveMod;
        if (modifierIsNegative) {
            effectiveVerb = `ne ${conjugated} ${modifierText}`;
            effectiveMod = '';
        }
        else if (verbNegative) {
            effectiveVerb = `ne ${conjugated} pas`;
            effectiveMod = modifierText;
        }
        else {
            effectiveVerb = conjugated;
            effectiveMod = modifierText;
        }
        const directObjectText = directObject ? nounPhrase(directObject.forms) : '';
        // S V [Adv] DirectObj IndirectObj(à+article)
        const indirectObjectText = indirectObject ? indirectNounPhrase(indirectObject.forms) : '';
        return [subjectText, effectiveVerb, effectiveMod, directObjectText, indirectObjectText]
            .filter(Boolean)
            .join(' ')
            .trim();
    },
};
//# sourceMappingURL=fr.js.map