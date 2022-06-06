import { AmapSDK, AmapInstance } from 'oak-external-sdk';

export async function amap<T extends 'getDrivingPath' | 'regeo' | 'ipLoc' | 'getDistrict' | 'geocode'>(options: {
    key: string;
    method: T;
    data: Parameters<AmapInstance[T]>[0];
}) {
    const { key, method, data } = options;
    const instance = AmapSDK.getInstance(key);
    const fn = instance[method];
    if (!fn) {
        throw new Error('method not implemented');
    }
    // data any后面再改
    return fn(data as any);
}