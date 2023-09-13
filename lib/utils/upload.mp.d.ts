import { QiniuUploadInfo, AliyunUploadInfo } from '../types/Upload';
export declare class Upload {
    uploadFile(name: string, uploadUrl: string, formData: Record<string, any>, autoInform: boolean, file: string | File): Promise<any>;
    uploadFileByQiniu(filePath: string, uploadInfo: QiniuUploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
    uploadFileByAliyun(filePath: string, uploadInfo: AliyunUploadInfo): Promise<{
        url: string;
        bucket: string;
    }>;
}
