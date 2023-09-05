import { QiniuUploadInfo, AliyunUploadInfo } from '../types/Upload';
declare type UploadInfo = QiniuUploadInfo | AliyunUploadInfo;
export declare class Upload {
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
