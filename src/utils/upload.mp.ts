import { promisify } from './promisify';

export class Upload {
    async uploadFile(
        file: string | File,
        name: string,
        uploadUrl: string,
        formData: Record<string, any>,
        autoInform?: boolean,
    ): Promise<any> {
        const wxUploadFile = promisify(wx.uploadFile);
        const result = await wxUploadFile({
            url: uploadUrl,
            filePath: file as string,
            name: name || 'file',
            formData: formData,
        });

        return result;
    }
}
