import { AmapInstance } from 'oak-external-sdk';
export declare function amap<T extends 'getDrivingPath' | 'regeo' | 'ipLoc' | 'getDistrict' | 'geocode'>(options: {
    key: string;
    method: T;
    data: Parameters<AmapInstance[T]>[0];
}): Promise<any>;
