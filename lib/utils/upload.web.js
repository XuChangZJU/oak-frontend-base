"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
class Upload {
    async uploadFile(file, name, uploadUrl, formData, autoInform) {
        const formData2 = new FormData();
        for (const key of Object.keys(formData)) {
            formData2.append(key, formData[key]);
        }
        formData2.append(name || 'file', file);
        const options = {
            body: formData2,
            method: 'POST',
        };
        const json = await (await fetch(uploadUrl, options)).json();
        return json;
    }
}
exports.Upload = Upload;
