import { QiniuUploadInfo, AliyunUploadInfo } from '../types/Upload';

type UploadInfo = QiniuUploadInfo | AliyunUploadInfo;

export class Upload {
    async uploadFile(
        origin: 'qiniu' | 'aliyun' | 'unknown',
        file: File,
        uploadInfo: UploadInfo
    ): Promise<{
        url: string;
        bucket: string;
    }> {
        if (origin === 'qiniu') {
            // 七牛上传
            return this.uploadFileByQiniu(file, uploadInfo as QiniuUploadInfo);
        } else if (origin === 'aliyun') {
            return this.uploadFileByAliyun(
                file,
                uploadInfo as AliyunUploadInfo
            );
        } else {
            throw new Error('Method not implemented.');
        }
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
