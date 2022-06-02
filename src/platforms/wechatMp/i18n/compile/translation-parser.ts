
import parse from 'format-message-parse';

function parseTranslations(object: any) {
    const keys = Object.keys(object);
    for (const key of keys) {
        const val = object[key];
        if (typeof val === 'string') {
            object[key] = parse(val);
        }
        if (typeof val === 'object') {
            object[key] = parseTranslations(val);
        }
    }
    return object;
}


export { parseTranslations };