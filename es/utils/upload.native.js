export class Upload {
    async uploadFile(file, name, uploadUrl, formData, autoInform) {
        const formData2 = new FormData();
        for (const key of Object.keys(formData)) {
            formData2.append(key, formData[key]);
        }
        formData2.append(name || 'file', file);
        const options = {
            body: formData2,
            method: 'POST',
        };
        const result = await fetch(uploadUrl, options);
        return result;
    }
}
