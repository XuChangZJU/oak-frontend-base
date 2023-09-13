import { promisify } from './promisify';
export class Upload {
    async uploadFile(file, name, uploadUrl, formData, autoInform) {
        const wxUploadFile = promisify(wx.uploadFile);
        const result = await wxUploadFile({
            url: uploadUrl,
            filePath: file,
            name: name || 'file',
            formData: formData,
        });
        return result;
    }
}
