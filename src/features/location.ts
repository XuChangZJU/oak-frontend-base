import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';

export class Location<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    private latitude?: number;
    private longitude?: number;
    private lastTimestamp?: number;
    async get(acceptableLatency: number = 10000) {
        if (this.lastTimestamp && Date.now() - this.lastTimestamp < acceptableLatency) {
            return {
                latitude: this.latitude!,
                longitude: this.longitude!,
            };
        }
        if (process.env.OAK_PLATFORM === 'wechatMp') {
            // 小程序平台
            const result = await wx.getLocation({
                type: 'gcj02'
            });
            this.latitude = result.latitude;
            this.longitude = result.longitude;
            this.lastTimestamp = Date.now();

            return {
                latitude: this.latitude!,
                longitude: this.longitude!,
            };
        }
        else {
            throw new Error('Method not implemented.');
        }
    }

    @Action
    refresh() {
        throw new Error('Method not implemented.');
    }   
}
