"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
var tslib_1 = require("tslib");
var promisify_1 = require("./promisify");
var Upload = /** @class */ (function () {
    function Upload() {
    }
    Upload.prototype.uploadFile = function (file, name, uploadUrl, formData, autoInform) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var wxUploadFile, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wxUploadFile = (0, promisify_1.promisify)(wx.uploadFile);
                        return [4 /*yield*/, wxUploadFile({
                                url: uploadUrl,
                                filePath: file,
                                name: name || 'file',
                                formData: formData,
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return Upload;
}());
exports.Upload = Upload;
