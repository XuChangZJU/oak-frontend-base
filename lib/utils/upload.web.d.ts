import { QiniuUploadInfo, AliyunUploadInfo } from '../types/Upload';
export declare class Upload {
    uploadFile(name: string, uploadUrl: string, formData: Record<string, any>, autoInform: boolean, file: string | File): Promise<any>;
    uploadFileByQiniu(file: File, uploadInfo: QiniuUploadInfo): Promise<{
        key: string;
        hash: string;
        url: string;
        bucket: string;
    }>;
    uploadFileByAliyun(file: File, uploadInfo: AliyunUploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
}
