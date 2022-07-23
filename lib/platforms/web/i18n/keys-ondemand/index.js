"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = __importDefault(require("debounce"));
var I18nextKeysOnDemand = /** @class */ (function () {
    function I18nextKeysOnDemand(options) {
        this.type = '3rdParty';
        this.options = __assign({ debounceDelay: 100, missingKeyValue: '' }, options);
    }
    I18nextKeysOnDemand.prototype.init = function (instance) {
        var missingKeysQueue = {};
        var options = this.options;
        function requestResources(lng, ns) {
            var path = "".concat(lng, ".").concat(ns);
            options
                .translationGetter(Object.keys(missingKeysQueue[path]), lng, ns)
                .then(function (result) {
                missingKeysQueue[path] = {};
                instance.addResources(lng, ns, result);
            });
        }
        var debouncedRequestResources = {};
        function requestKey(key, lng, ns) {
            var path = "".concat(lng, ".").concat(ns);
            missingKeysQueue[path] = missingKeysQueue[path] || {};
            missingKeysQueue[path][key] = true;
            debouncedRequestResources[path] =
                debouncedRequestResources[path] ||
                    (0, debounce_1.default)(function () { return requestResources(lng, ns); }, options.debounceDelay);
            debouncedRequestResources[path]();
        }
        instance.on('missingKey', function (lngs, ns, key, res) {
            instance.options.parseMissingKeyHandler = function () {
                return options.missingKeyValue;
            };
            var languages = typeof lngs === 'string' ? [lngs] : lngs;
            languages.map(function (l) { return requestKey(key, l, ns); });
        });
    };
    return I18nextKeysOnDemand;
}());
exports.default = I18nextKeysOnDemand;
