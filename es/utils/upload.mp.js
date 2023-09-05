import { promisify } from './promisify';
export class Upload {
    async uploadFile(origin, filePath, uploadInfo) {
        // 小程序平台
        if (origin === 'qiniu') {
            // 七牛上传
            return this.uploadFileByQiniu(filePath, uploadInfo);
        }
        else if (origin === 'aliyun') {
            return this.uploadFileByAliyun(filePath, uploadInfo);
        }
        else {
            throw new Error('Method not implemented.');
        }
    }
    async uploadFileByQiniu(filePath, uploadInfo) {
        // 七牛上传
        const { uploadHost, uploadToken, key, domain, bucket } = uploadInfo;
        const wxUploadFile = promisify(wx.uploadFile);
        const result = (await wxUploadFile({
            url: uploadHost,
            filePath: filePath,
            name: 'file',
            formData: {
                token: uploadToken,
                key: key,
            },
        }));
        const dataString = result.data;
        const data = JSON.parse(dataString);
        if (data.key) {
            return {
                url: `${domain}/${key}`,
                bucket,
            };
        }
        else {
            const message = `上传错误: ${JSON.stringify(result)}`;
            throw new Error(message);
        }
    }
    async uploadFileByAliyun(filePath, uploadInfo) {
        // 阿里云上传
        const { uploadHost, signature, policy, key, domain, bucket, accessKey, } = uploadInfo;
        const wxUploadFile = promisify(wx.uploadFile);
        const result = (await wxUploadFile({
            url: uploadHost,
            filePath: filePath,
            name: 'file',
            formData: {
                policy: policy,
                signature: signature,
                key: key,
                OSSAccessKeyId: accessKey,
                success_action_status: '200',
            },
        }));
        if (result.statusCode === 200) {
            return {
                url: `${domain}/${key}`,
                bucket,
            };
        }
        else {
            const message = `上传错误: ${JSON.stringify(result)}`;
            throw new Error(message);
        }
    }
}
