import { QiniuUploadInfo, AliyunUploadInfo } from '../types/Upload';
declare type UploadInfo = QiniuUploadInfo | AliyunUploadInfo;
export declare class Upload {
    uploadFile(origin: 'qiniu' | 'aliyun' | 'unknown', file: File, uploadInfo: UploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
    uploadFileByQiniu(file: File, uploadInfo: QiniuUploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
    uploadFileByAliyun(file: File, uploadInfo: AliyunUploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
}
export {};
