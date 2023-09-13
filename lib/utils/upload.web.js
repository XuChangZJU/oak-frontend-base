"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
var tslib_1 = require("tslib");
var Upload = /** @class */ (function () {
    function Upload() {
    }
    Upload.prototype.uploadFile = function (name, uploadUrl, formData, autoInform, file) {
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
    Upload.prototype.uploadFileByQiniu = function (file, uploadInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var uploadHost, uploadToken, key, domain, bucket, formData, options, json;
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
                    case 1: return [4 /*yield*/, (_a.sent()).json()];
                    case 2:
                        json = _a.sent();
                        if (json.success === true || json.key) {
                            return [2 /*return*/, {
                                    key: json.key,
                                    hash: json.hash,
                                    url: "".concat(domain, "/").concat(key),
                                    bucket: bucket,
                                }];
                        }
                        else {
                            throw new Error(JSON.stringify(json));
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
