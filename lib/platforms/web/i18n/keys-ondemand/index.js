"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debounce_1 = __importDefault(require("debounce"));
class I18nextKeysOnDemand {
    type;
    options;
    constructor(options) {
        this.type = '3rdParty';
        this.options = { debounceDelay: 100, missingKeyValue: '', ...options };
    }
    init(instance) {
        const missingKeysQueue = {};
        const options = this.options;
        function requestResources(lng, ns) {
            const path = `${lng}.${ns}`;
            options
                .translationGetter(Object.keys(missingKeysQueue[path]), lng, ns)
                .then((result) => {
                missingKeysQueue[path] = {};
                instance.addResources(lng, ns, result);
            });
        }
        const debouncedRequestResources = {};
        function requestKey(key, lng, ns) {
            const path = `${lng}.${ns}`;
            missingKeysQueue[path] = missingKeysQueue[path] || {};
            missingKeysQueue[path][key] = true;
            debouncedRequestResources[path] =
                debouncedRequestResources[path] ||
                    (0, debounce_1.default)(() => requestResources(lng, ns), options.debounceDelay);
            debouncedRequestResources[path]();
        }
        instance.on('missingKey', (lngs, ns, key, res) => {
            instance.options.parseMissingKeyHandler = () => {
                return options.missingKeyValue;
            };
            const languages = typeof lngs === 'string' ? [lngs] : lngs;
            languages.map((l) => requestKey(key, l, ns));
        });
    }
}
exports.default = I18nextKeysOnDemand;
