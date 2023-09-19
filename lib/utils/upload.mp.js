"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
const promisify_1 = require("./promisify");
class Upload {
    async uploadFile(file, name, uploadUrl, formData, autoInform) {
        const wxUploadFile = (0, promisify_1.promisify)(wx.uploadFile);
        const result = await wxUploadFile({
            url: uploadUrl,
            filePath: file,
            name: name || 'file',
            formData: formData,
        });
        return result;
    }
}
exports.Upload = Upload;
