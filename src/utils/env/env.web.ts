import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { pick } from 'oak-domain/lib/utils/lodash';
import { WebEnv } from 'oak-domain/lib/types/Environment';

/**
 * fingerprintJs当中的一些敏感项
 * @returns 
 */
export async function getEnv() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();

    const { visitorId, components } = result;
    return Object.assign(
        pick(components, [
            'platform',
            'timezone',
            'vendor',
            'vendorFlavors'
        ]), {
        type: 'web',
        visitorId,
    }) as unknown as WebEnv;
}
