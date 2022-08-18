"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
var tslib_1 = require("tslib");
var Upload = /** @class */ (function () {
    function Upload() {
    }
    Upload.prototype.uploadFile = function (origin, file, uploadInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (origin === 'qiniu') {
                    // 七牛上传
                    return [2 /*return*/, this.uploadFileByQiniu(file, uploadInfo)];
                }
                else if (origin === 'aliyun') {
                    return [2 /*return*/, this.uploadFileByAliyun(file, uploadInfo)];
                }
                else {
                    throw new Error('Method not implemented.');
                }
                return [2 /*return*/];
            });
        });
    };
    Upload.prototype.uploadFileByQiniu = function (file, uploadInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var uploadHost, uploadToken, key, domain, bucket, formData, options, json, message;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uploadHost = uploadInfo.uploadHost, uploadToken = uploadInfo.uploadToken, key = uploadInfo.key, domain = uploadInfo.domain, bucket = uploadInfo.bucket;
                        formData = new FormData();
                        formData.append('key', key);
                        formData.append('file', file);
                        formData.append('token', uploadToken);
                        options = {
                            body: formData,
                            method: 'POST',
                        };
                        return [4 /*yield*/, fetch(uploadHost, options)];
                    case 1: return [4 /*yield*/, (_a.sent())
                            .json()];
                    case 2:
                        json = _a.sent();
                        if (json.success === true || json.key) {
                            return [2 /*return*/, {
                                    url: "".concat(domain, "/").concat(key),
                                    bucket: bucket,
                                }];
                        }
                        else {
                            message = "\u4E0A\u4F20\u9519\u8BEF: ".concat(JSON.stringify(json));
                            throw new Error(message);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Upload.prototype.uploadFileByAliyun = function (file, uploadInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var uploadHost, signature, policy, key, domain, bucket, accessKey;
            return tslib_1.__generator(this, function (_a) {
                uploadHost = uploadInfo.uploadHost, signature = uploadInfo.signature, policy = uploadInfo.policy, key = uploadInfo.key, domain = uploadInfo.domain, bucket = uploadInfo.bucket, accessKey = uploadInfo.accessKey;
                throw new Error('Method not implemented.');
            });
        });
    };
    return Upload;
}());
exports.Upload = Upload;
