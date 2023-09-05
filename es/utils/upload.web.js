export class Upload {
    async uploadFile(origin, file, uploadInfo) {
        if (origin === 'qiniu') {
            // 七牛上传
            return this.uploadFileByQiniu(file, uploadInfo);
        }
        else if (origin === 'aliyun') {
            return this.uploadFileByAliyun(file, uploadInfo);
        }
        else {
            throw new Error('Method not implemented.');
        }
    }
    async uploadFileByQiniu(file, uploadInfo) {
        // 七牛上传
        const { uploadHost, uploadToken, key, domain, bucket } = uploadInfo;
        const formData = new FormData();
        formData.append('key', key);
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
        }
        else {
            throw new Error(JSON.stringify(json));
        }
    }
    async uploadFileByAliyun(file, uploadInfo) {
        // 阿里云上传
        const { uploadHost, signature, policy, key, domain, bucket, accessKey, } = uploadInfo;
        throw new Error('Method not implemented.');
    }
}
