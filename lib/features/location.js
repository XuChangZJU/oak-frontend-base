"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const Feature_1 = require("../types/Feature");
class Location extends Feature_1.Feature {
    latitude;
    longitude;
    lastTimestamp;
    async get(acceptableLatency = 10000) {
        if (this.lastTimestamp && Date.now() - this.lastTimestamp < acceptableLatency) {
            return {
                latitude: this.latitude,
                longitude: this.longitude,
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
                latitude: this.latitude,
                longitude: this.longitude,
            };
        }
        else {
            throw new Error('Method not implemented.');
        }
    }
    refresh() {
        throw new Error('Method not implemented.');
    }
}
__decorate([
    Feature_1.Action
], Location.prototype, "refresh", null);
exports.Location = Location;
