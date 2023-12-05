import { NativeEnv, BriefEnv } from 'oak-domain/lib/types/Environment';
import { Platform } from 'react-native';
import { getLocales } from 'react-native-localize';

export async function getEnv() {
    const language = getLocales()[0].languageTag;
    const fullEnv = {
        ...Platform,
        language,
    } as NativeEnv;

    const briefEnv: BriefEnv = {
        brand: fullEnv.constants.Brand,
        model: fullEnv.constants.Model,
        system: `${fullEnv.OS}/${fullEnv.constants.Version || fullEnv.constants.osVersion}/${language}`,        
    };
    return {
        fullEnv,
        briefEnv,
    };
}