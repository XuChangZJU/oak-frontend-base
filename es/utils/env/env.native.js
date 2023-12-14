import { Platform } from 'react-native';
import { getLocales } from 'react-native-localize';
import { getDeviceId } from 'react-native-device-info';
export async function getEnv() {
    const language = getLocales()[0].languageTag;
    const deviceId = getDeviceId();
    const fullEnv = {
        ...Platform,
        visitorId: deviceId,
        language,
        type: 'native',
    };
    const briefEnv = {
        brand: fullEnv.constants.Brand,
        model: fullEnv.constants.Model,
        system: `${fullEnv.OS}/${fullEnv.constants.Version || fullEnv.constants.osVersion}/${language}`,
    };
    return {
        fullEnv,
        briefEnv,
    };
}
