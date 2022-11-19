"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = void 0;
var lodash_1 = require("oak-domain/lib/utils/lodash");
var mCallbacks = [];
var mActionStackDepth = 0;
var Feature = /** @class */ (function () {
    function Feature() {
        this.callbacks = [];
    }
    Feature.prototype.subscribe = function (callback) {
        var _this = this;
        this.callbacks.push(callback);
        return function () {
            (0, lodash_1.pull)(_this.callbacks, callback);
        };
    };
    Feature.prototype.publish = function () {
        this.callbacks.forEach(function (ele) { return ele(); });
    };
    Feature.prototype.clearSubscribes = function () {
        this.callbacks = [];
    };
    return Feature;
}());
exports.Feature = Feature;
;
/* export function subscribe(callback: () => any) {
    mCallbacks.push(callback);
    return () => {
        pull(mCallbacks, callback);
    };
}*/
/**
 * 方法注解，使函数调用最后一层堆栈时唤起所有登记的回调
 * @param target
 * @param propertyName
 * @param descriptor
 */
/* export function Action(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
   const method = descriptor.value!;
   descriptor.value = async function (...params: any[]) {
       mActionStackDepth++;
       if (mActionStackDepth > 1000) {
           console.error(`action[${method.name}]调用的层级超过了20，请检查是否存在无限递归`);
       }
       let result;
       try {
           result = method.apply(this, params);
           if (result instanceof Promise) {
               await result;
           }
           else {
               console.error(`方法${method.name}被定义为action但不是异步函数，可能会引起对象解构和重渲染之间的不正确同步`);
           }
       }
       catch (err) {
           // console.error(err, method.name);
           mActionStackDepth--;
           throw err;
       }
       mActionStackDepth--;
       if (mActionStackDepth === 0) {
           const results = mCallbacks.map(
               ele => ele()
           ).filter(
               ele => ele instanceof Promise
           );
           if (results.length > 0) {
               await Promise.all(results);
           }
       }
       return result;
   }
} */ 
