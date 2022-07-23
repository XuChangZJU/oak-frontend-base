"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = exports.subscribe = exports.Feature = void 0;
const lodash_1 = require("oak-domain/lib/utils/lodash");
class Feature {
    aspectWrapper;
    constructor(aspectWrapper) {
        this.aspectWrapper = aspectWrapper;
    }
    getAspectWrapper() {
        return this.aspectWrapper;
    }
}
exports.Feature = Feature;
const mCallbacks = [];
let mActionStackDepth = 0;
function subscribe(callback) {
    mCallbacks.push(callback);
    return () => {
        (0, lodash_1.pull)(mCallbacks, callback);
    };
}
exports.subscribe = subscribe;
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
function Action(target, propertyName, descriptor) {
    const method = descriptor.value;
    descriptor.value = async function () {
        mActionStackDepth++;
        let result;
        try {
            result = await method.apply(this, arguments);
        }
        catch (err) {
            console.error(err, method.name);
            mActionStackDepth--;
            throw err;
        }
        mActionStackDepth--;
        if (mActionStackDepth === 0) {
            const results = mCallbacks.map(ele => ele()).filter(ele => ele instanceof Promise);
            if (results.length > 0) {
                await Promise.all(results);
            }
        }
        return result;
    };
}
exports.Action = Action;
