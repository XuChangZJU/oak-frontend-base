"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const Feature_1 = require("../types/Feature");
class Message extends Feature_1.Feature {
    data;
    async setMessage(data) {
        this.data = data;
        this.publish();
    }
    consumeMessage() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}
exports.Message = Message;
