import { EntityDict, Aspect, Context } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
declare type QiniuUploadInfo = {
    key: string;
    uploadToken: string;
    uploadHost: string;
    bucket: string;
    domain: string;
};
declare type AliyunUploadInfo = {
    key: string;
    signature: string;
    policy: string;
    uploadHost: string;
    bucket: string;
    domain: string;
    accessKey: string;
};
declare type UploadInfo = QiniuUploadInfo | AliyunUploadInfo;
export declare class Upload extends Feature<EntityDict, Context<EntityDict>, Record<string, Aspect<EntityDict, Context<EntityDict>>>> {
    uploadFile(origin: 'qiniu' | 'aliyun' | 'unknown', filePath: string, uploadInfo: UploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
    uploadFileByQiniu(filePath: string, uploadInfo: QiniuUploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
    uploadFileByAliyun(filePath: string, uploadInfo: AliyunUploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
}
export {};
