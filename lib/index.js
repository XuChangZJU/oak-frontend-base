"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = exports.getSentry = exports.getToken = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const token_1 = __importDefault(require("./features/token"));
const sentry_1 = __importDefault(require("./features/sentry"));
const debugStore_1 = require("./dataStore/debugStore");
const reducer = {
    t: token_1.default.reducer,
    s: sentry_1.default.reducer,
};
const getToken = (state) => state.t;
exports.getToken = getToken;
const getSentry = (state) => state.s;
exports.getSentry = getSentry;
function initialize(storageSchema, triggers = [], initialState = {}, isDebug = true) {
    const store = (0, toolkit_1.configureStore)({
        reducer,
        preloadedState: initialState,
    });
    const dataStore = (0, debugStore_1.createDebugStore)(storageSchema);
    for (const trigger of triggers) {
        dataStore.registerTrigger(trigger);
    }
    return {
        store,
        actions: {
            ...token_1.default.actions,
            operate: (entity, operation, context, params) => {
                const result = dataStore.operate(entity, operation, context, params);
                sentry_1.default.actions.refreshSentry();
                return result;
            },
            select: (entity, selection, context, params) => dataStore.select(entity, selection, context, params),
            count: (entity, selection, context, params) => dataStore.count(entity, selection, context, params)
        },
    };
}
exports.initialize = initialize;
