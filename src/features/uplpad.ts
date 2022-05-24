import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { promisify } from '../utils/promisify';

type QiniuUploadInfo = {
    key: string;
    uploadToken: string;
    uploadHost: string;
    bucket: string;
    domain: string;
};

type AliyunUploadInfo = {
    key: string;
    signature: string;
    policy: string;
    uploadHost: string;
    bucket: string;
    domain: string;
    accessKey: string;
};

type UploadInfo = QiniuUploadInfo | AliyunUploadInfo;

export class Upload extends Feature<
    EntityDict,
    Context<EntityDict>,
    Record<string, Aspect<EntityDict, Context<EntityDict>>>
> {
    async uploadFile(
        origin: 'qiniu' | 'aliyun' | 'unknown',
        filePath: string,
        uploadInfo: UploadInfo
    ): Promise<{
        url: string;
        bucket: string;
    }> {
        if (process.env.OAK_PLATFORM === 'wechatMp') {
            // 小程序平台
            if (origin === 'qiniu') {
                // 七牛上传
                return this.uploadFileByQiniu(
                    filePath,
                    uploadInfo as QiniuUploadInfo
                );
            } else if (origin === 'aliyun') {
                return this.uploadFileByAliyun(
                    filePath,
                    uploadInfo as AliyunUploadInfo
                );
            } else {
                throw new Error('Method not implemented.');
            }
        } else {
            throw new Error('Method not implemented.');
        }
    }

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
