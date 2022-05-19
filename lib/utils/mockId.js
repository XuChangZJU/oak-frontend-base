"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMockId = exports.generateMockId = void 0;
function generateMockId() {
    return `__mock-${Math.ceil(Math.random() * 100000000000)}`;
}
exports.generateMockId = generateMockId;
function isMockId(id) {
    return id.startsWith('__mock-');
}
exports.isMockId = isMockId;
