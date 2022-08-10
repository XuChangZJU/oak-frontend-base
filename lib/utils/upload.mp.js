"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
var promisify_1 = require("./promisify");
var Upload = /** @class */ (function () {
    function Upload() {
    }
    Upload.prototype.uploadFile = function (origin, filePath, uploadInfo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var uploadHost, uploadToken, key, domain, bucket, wxUploadFile, result, dataString, data, message;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var uploadHost, signature, policy, key, domain, bucket, accessKey, wxUploadFile, result, message;
            return __generator(this, function (_a) {
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