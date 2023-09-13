"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
var tslib_1 = require("tslib");
var Upload = /** @class */ (function () {
    function Upload() {
    }
    Upload.prototype.uploadFile = function (file, name, uploadUrl, formData, autoInform) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var formData2, _a, _b, key, options, json;
            var e_1, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        formData2 = new FormData();
                        try {
                            for (_a = tslib_1.__values(Object.keys(formData)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                key = _b.value;
                                formData2.append(key, formData[key]);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        formData2.append(name || 'file', file);
                        options = {
                            body: formData2,
                            method: 'POST',
                        };
                        return [4 /*yield*/, fetch(uploadUrl, options)];
                    case 1: return [4 /*yield*/, (_d.sent()).json()];
                    case 2:
                        json = _d.sent();
                        return [2 /*return*/, json];
                }
            });
        });
    };
    return Upload;
}());
exports.Upload = Upload;
