import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { pick } from 'oak-domain/lib/utils/lodash';
import { WebEnv, BriefEnv } from 'oak-domain/lib/types/Environment';

/**
 * fingerprintJs当中的一些敏感项
 * @returns 
 */
export async function getEnv() {
    const fp = await FingerprintJS.load();
    // 有浏览器没有storage
    const [result/* , localStorageEnabled */] = await Promise.all([fp.get()/* , navigator.storage.persisted() */]);

    const { visitorId, components } = result;
    const fullEnv = Object.assign(
        pick(components, [
            'platform',
            'timezone',
            'vendor',
            'vendorFlavors'
        ]), {
        type: 'web',
        visitorId,
        // localStorageEnabled,
        language: navigator.language,
    }) as unknown as WebEnv;
    
    const briefEnv: BriefEnv = {
        system: `${fullEnv.platform.value}`,
        explorer: `${fullEnv.vendor.value}/${fullEnv.vendorFlavors.value[0]}`,
    };

    return {
        fullEnv,
        briefEnv,
    };
}
