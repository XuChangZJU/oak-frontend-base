"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
var tslib_1 = require("tslib");
var promisify_1 = require("./promisify");
var Upload = /** @class */ (function () {
    function Upload() {
    }
    Upload.prototype.uploadFile = function (origin, filePath, uploadInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                // 小程序平台
                if (origin === 'qiniu') {
                    // 七牛上传
                    return [2 /*return*/, this.uploadFileByQiniu(filePath, uploadInfo)];
                }
                else if (origin === 'aliyun') {
                    return [2 /*return*/, this.uploadFileByAliyun(filePath, uploadInfo)];
                }
                else {
                    throw new Error('Method not implemented.');
                }
                return [2 /*return*/];
            });
        });
    };
    Upload.prototype.uploadFileByQiniu = function (filePath, uploadInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var uploadHost, uploadToken, key, domain, bucket, wxUploadFile, result, dataString, data, message;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uploadHost = uploadInfo.uploadHost, uploadToken = uploadInfo.uploadToken, key = uploadInfo.key, domain = uploadInfo.domain, bucket = uploadInfo.bucket;
                        wxUploadFile = (0, promisify_1.promisify)(wx.uploadFile);
                        return [4 /*yield*/, wxUploadFile({
                                url: uploadHost,
                                filePath: filePath,
                                name: 'file',
                                formData: {
                                    token: uploadToken,
                                    key: key,
                                },
                            })];
                    case 1:
                        result = (_a.sent());
                        dataString = result.data;
                        data = JSON.parse(dataString);
                        if (data.key) {
                            return [2 /*return*/, {
                                    url: "".concat(domain, "/").concat(key),
                                    bucket: bucket,
                                }];
                        }
                        else {
                            message = "\u4E0A\u4F20\u9519\u8BEF: ".concat(JSON.stringify(result));
                            throw new Error(message);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Upload.prototype.uploadFileByAliyun = function (filePath, uploadInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var uploadHost, signature, policy, key, domain, bucket, accessKey, wxUploadFile, result, message;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uploadHost = uploadInfo.uploadHost, signature = uploadInfo.signature, policy = uploadInfo.policy, key = uploadInfo.key, domain = uploadInfo.domain, bucket = uploadInfo.bucket, accessKey = uploadInfo.accessKey;
                        wxUploadFile = (0, promisify_1.promisify)(wx.uploadFile);
                        return [4 /*yield*/, wxUploadFile({
                                url: uploadHost,
                                filePath: filePath,
                                name: 'file',
                                formData: {
                                    policy: policy,
                                    signature: signature,
                                    key: key,
                                    OSSAccessKeyId: accessKey,
                                    success_action_status: '200',
                                },
                            })];
                    case 1:
                        result = (_a.sent());
                        if (result.statusCode === 200) {
                            return [2 /*return*/, {
                                    url: "".concat(domain, "/").concat(key),
                                    bucket: bucket,
                                }];
                        }
                        else {
                            message = "\u4E0A\u4F20\u9519\u8BEF: ".concat(JSON.stringify(result));
                            throw new Error(message);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Upload;
}());
exports.Upload = Upload;
