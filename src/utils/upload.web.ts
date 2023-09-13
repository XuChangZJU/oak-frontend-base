

export class Upload {
    async uploadFile(
        file: File,
        name: string,
        uploadUrl: string,
        formData: Record<string, any>,
        autoInform?: boolean
    ): Promise<any> {
        const formData2 = new FormData();
        for (const key of Object.keys(formData)) {
            formData2.append(key, formData[key]);
        }
        formData2.append(name || 'file', file);

        const options = {
            body: formData2,
            method: 'POST',
        };

        const json = await (await fetch(uploadUrl, options)).json();
        return json;
    }
}
