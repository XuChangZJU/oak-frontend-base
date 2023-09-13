import { QiniuUploadInfo, AliyunUploadInfo } from '../types/Upload';

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


    async uploadFileByQiniu(
        file: File,
        uploadInfo: QiniuUploadInfo
    ): Promise<{
        key: string;
        hash: string;
        url: string;
        bucket: string;
    }> {
        // 七牛上传
        const { uploadHost, uploadToken, key, domain, bucket } = uploadInfo;
        const formData = new FormData();

        formData.append('key', key!);
        formData.append('file', file);
        formData.append('token', uploadToken);

        const options = {
            body: formData,
            method: 'POST',
        };

        const json = await (await fetch(uploadHost, options)).json();

        if (json.success === true || json.key) {
            return {
                key: json.key,
                hash: json.hash,
                url: `${domain}/${key}`,
                bucket,
            };
        } else {
            throw new Error(JSON.stringify(json));
        }
    }

    async uploadFileByAliyun(
        file: File,
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
        throw new Error('Method not implemented.');
    }
}
