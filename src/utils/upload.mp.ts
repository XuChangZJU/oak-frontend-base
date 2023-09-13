import { QiniuUploadInfo, AliyunUploadInfo } from '../types/Upload';
import { promisify } from './promisify';

type UploadInfo = QiniuUploadInfo | AliyunUploadInfo;

export class Upload {
    async uploadFile(
        name: string,
        uploadUrl: string,
        formData: Record<string, any>,
        autoInform: boolean,
        file: string | File,
    ): Promise<any> {
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
    // async uploadFile(
    //     origin: 'qiniu' | 'aliyun' | 'unknown',
    //     filePath: string,
    //     uploadInfo: UploadInfo
    // ): Promise<{
    //     url: string;
    //     bucket: string;
    // }> {
    //     // 小程序平台
    //     if (origin === 'qiniu') {
    //         // 七牛上传
    //         return this.uploadFileByQiniu(
    //             filePath,
    //             uploadInfo as QiniuUploadInfo
    //         );
    //     } else if (origin === 'aliyun') {
    //         return this.uploadFileByAliyun(
    //             filePath,
    //             uploadInfo as AliyunUploadInfo
    //         );
    //     } else {
    //         throw new Error('Method not implemented.');
    //     }
    // }

    async uploadFileByQiniu(
        filePath: string,
        uploadInfo: QiniuUploadInfo
    ): Promise<{
        url: string;
        bucket: string;
    }> {
        // 七牛上传
        const { uploadHost, uploadToken, key, domain, bucket } = uploadInfo;
        const wxUploadFile = promisify(wx.uploadFile);
        const result = (await wxUploadFile({
            url: uploadHost,
            filePath: filePath!,
            name: 'file',
            formData: {
                token: uploadToken,
                key: key,
            },
        })) as { data: string; statusCode: number };
        const dataString = result.data;
        const data = JSON.parse(dataString);

        if (data.key) {
            return {
                url: `${domain}/${key}`,
                bucket,
            };
        } else {
            const message = `上传错误: ${JSON.stringify(result)}`;
            throw new Error(message);
        }
    }

    async uploadFileByAliyun(
        filePath: string,
        uploadInfo: AliyunUploadInfo
    ): Promise<{
        url: string;
        bucket: string;
    }> {
        // 阿里云上传
        const {
            uploadHost,
            signature,
            policy,
            key,
            domain,
            bucket,
            accessKey,
        } = uploadInfo;
        const wxUploadFile = promisify(wx.uploadFile);
        const result = (await wxUploadFile({
            url: uploadHost,
            filePath: filePath!,
            name: 'file',
            formData: {
                policy: policy,
                signature: signature,
                key: key,
                OSSAccessKeyId: accessKey,
                success_action_status: '200',
            },
        })) as { data: string; statusCode: number };

        if (result.statusCode === 200) {
            return {
                url: `${domain}/${key}`,
                bucket,
            };
        } else {
            const message = `上传错误: ${JSON.stringify(result)}`;
            throw new Error(message);
        }
    }
}
