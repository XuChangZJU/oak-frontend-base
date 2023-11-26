import { Platform } from 'react-native';
import { getLocales } from 'react-native-localize';
export async function getEnv() {
    const language = getLocales()[0].languageTag;
    return {
        ...Platform,
        language,
    };
}
